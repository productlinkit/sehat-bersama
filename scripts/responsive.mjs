// Responsive audit: every route on a matrix of real device sizes (phones, foldables, landscape, tablets,
// laptops, large desktops), at the largest text size on small phones, and at 400% zoom (WCAG 1.4.10 reflow).
// Usage: BASE=http://localhost:4173 npm run test:responsive
import puppeteer from 'puppeteer-core'
import fs from 'fs'
import { fileURLToPath } from 'url'

const B = process.env.BASE || 'http://localhost:5173'
const OUT = fileURLToPath(new URL('../audit-results/responsive/', import.meta.url))
fs.mkdirSync(OUT, { recursive: true })

const devices = [
  { name: 'galaxy-fold', width: 280, height: 653, touch: true },
  { name: 'iphone-se-1', width: 320, height: 568, touch: true },
  { name: 'android-360', width: 360, height: 740, touch: true },
  { name: 'iphone-se', width: 375, height: 667, touch: true },
  { name: 'iphone-15', width: 393, height: 852, touch: true },
  { name: 'iphone-pro-max', width: 430, height: 932, touch: true },
  { name: 'phone-landscape', width: 667, height: 375, touch: true },
  { name: 'phone-landscape-lg', width: 932, height: 430, touch: true },
  { name: 'ipad-mini', width: 768, height: 1024, touch: true },
  { name: 'ipad-air', width: 820, height: 1180, touch: true },
  { name: 'ipad-landscape', width: 1024, height: 768, touch: true },
  { name: 'ipad-pro', width: 1024, height: 1366, touch: true },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'laptop-1366', width: 1366, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-2560', width: 2560, height: 1440 },
  // Accessibility stress cases
  { name: 'se-xlarge-text', width: 320, height: 568, touch: true, textSize: 'xlarge' },
  { name: 'fold-xlarge-text', width: 280, height: 653, touch: true, textSize: 'xlarge' },
  { name: 'zoom-400', width: 320, height: 256 }, // 1280×1024 at 400% = 320×256 CSS px
  // English (often longer words) on the tightest and the tablet layouts
  { name: 'EN-galaxy-fold', width: 280, height: 653, touch: true, lang: 'en' },
  { name: 'EN-iphone-se-1', width: 320, height: 568, touch: true, lang: 'en' },
  { name: 'EN-se-xlarge-text', width: 320, height: 568, touch: true, textSize: 'xlarge', lang: 'en' },
  { name: 'EN-iphone-15', width: 393, height: 852, touch: true, lang: 'en' },
  { name: 'EN-ipad-mini', width: 768, height: 1024, touch: true, lang: 'en' },
  { name: 'EN-desktop-1440', width: 1440, height: 900, lang: 'en' },
]

const guest = ['/home', '/search?q=anak', '/login?redirect=%2Fcheckout%3Fpkg%3Dmingguan', '/register', '/forgot-password', '/triage', '/packages?for=anak', '/home-services', '/lega', '/lega/chat', '/articles', '/article/kenali-gejala-demam-berdarah', '/help', '/terms', '/privacy-policy', '/nope']
const user = ['/home', '/checkout?pkg=mingguan', '/payment/success?pkg=mingguan&method=qris', '/consultation/start?type=anak', '/consultation', '/prescriptions', '/history', '/notifications', '/reward', '/account', '/account/profile', '/account/addresses', '/account/transactions', '/account/security', '/account/display', '/account/notifications', '/lega', '/lega/chat', '/packages', '/internal/funnel']
const sheets = {
  id: [['/packages', 'Bandingkan paket'], ['/packages', 'Lihat detail Sehat Keluarga'], ['/home', 'dokter siap sekarang']],
  en: [['/packages', 'Compare plans'], ['/packages', 'See Sehat Keluarga details'], ['/home', 'doctors available now']],
}

const w = (ms) => new Promise((r) => setTimeout(r, ms))
const issues = []
const add = (device, route, kind, detail) => issues.push({ device, route, kind, detail })

/** Measures layout problems on the current page. */
const inspect = (touch) => {
  const out = []
  const vw = document.documentElement.clientWidth
  const vh = innerHeight
  const visible = (e) => {
    const r = e.getBoundingClientRect()
    if (!r.width || !r.height) return false
    for (let n = e; n; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.display === 'none' || cs.visibility === 'hidden' || n.getAttribute('aria-hidden') === 'true' || n.inert) return false
    }
    return !e.closest('.sr-only')
  }
  // Inside an intentional horizontal scroller (chip rows, comparison table, carousel track)?
  const inScroller = (e) => {
    for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (['auto', 'scroll'].includes(cs.overflowX) || (cs.overflowX === 'hidden' && n !== document.documentElement)) return true
    }
    return false
  }
  const label = (e) => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 40)

  // 1. Page-level horizontal scroll (WCAG 1.4.10)
  if (document.documentElement.scrollWidth > vw + 1) out.push(['h-scroll', `page is ${document.documentElement.scrollWidth}px wide in a ${vw}px viewport`])

  const all = [...document.querySelectorAll('main *, nav *, header *, [role=dialog] *')].filter(visible)

  // 2. Elements spilling past the viewport edge (not in a scroller)
  for (const e of all) {
    const r = e.getBoundingClientRect()
    if ((r.right > vw + 1 || r.left < -1) && !inScroller(e) && !e.closest('[aria-roledescription=carousel]')) {
      out.push(['off-screen', `${e.tagName.toLowerCase()} "${label(e)}" spans ${Math.round(r.left)}→${Math.round(r.right)}px`])
    }
  }

  // 3. Clipped text: content wider/taller than its box with overflow hidden and no ellipsis/line-clamp intent
  for (const e of all) {
    if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
    const cs = getComputedStyle(e)
    const clips = cs.overflow.includes('hidden') || cs.overflowX === 'hidden'
    const intentional = cs.textOverflow === 'ellipsis' || cs.webkitLineClamp !== 'none'
    if (clips && !intentional && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2)) {
      out.push(['clipped-text', `"${label(e)}" (${e.scrollWidth}×${e.scrollHeight} in ${e.clientWidth}×${e.clientHeight})`])
    }
    // a single word longer than its container (overflows sideways)
    if (e.scrollWidth > e.clientWidth + 1 && cs.overflowX === 'visible' && cs.whiteSpace !== 'nowrap' && !inScroller(e) && e.clientWidth > 0) {
      out.push(['text-overflow', `"${label(e)}" overflows its box by ${e.scrollWidth - e.clientWidth}px`])
    }
  }

  // 4. Tap targets: size and overlap
  const targets = [...document.querySelectorAll('a[href], button, [role=radio], [role=tab], input, select, textarea, summary, [role=switch], [role=checkbox]')].filter(visible).filter((e) => !e.disabled)
  const rects = targets.map((e) => ({ e, r: e.getBoundingClientRect() }))
  for (const { e, r } of rects) {
    const inline = getComputedStyle(e).display === 'inline' && e.closest('p, label, li') && e.tagName === 'A'
    if (!inline && (r.width < 24 || r.height < 24)) out.push(['small-target', `${e.tagName.toLowerCase()} "${label(e)}" is ${Math.round(r.width)}×${Math.round(r.height)}px`])
  }
  // Overlap between two separate controls at the same moment. Ignored on purpose:
  //  - content scrolling underneath fixed/sticky bars (normal scrolling; end-of-page clearance is checked separately)
  //  - inline links that wrap across lines (their bounding boxes overlap neighbours but the glyphs don't)
  //  - a control positioned inside its own field (password eye button inside the input wrapper)
  const pinned = (e) => !!e.closest('nav, header, [class*=sticky], [class*=fixed]') && !e.closest('[role=dialog]')
  const wrapped = (e) => e.getClientRects().length > 1
  const inField = (a, b) => a.parentElement === b.parentElement && [a, b].some((x) => x.tagName === 'INPUT')
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j]
      if (a.e.contains(b.e) || b.e.contains(a.e)) continue
      if (pinned(a.e) !== pinned(b.e) || wrapped(a.e) || wrapped(b.e) || inField(a.e, b.e)) continue
      const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)
      const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top)
      if (ox > 4 && oy > 4) out.push(['overlapping-targets', `"${label(a.e)}" overlaps "${label(b.e)}"`])
    }

  // 5. Fixed/sticky chrome eating the screen (landscape phones, zoom)
  let chrome = 0
  for (const e of document.querySelectorAll('header, nav, main > div, main > header, [class*=sticky], [class*=fixed]')) {
    const cs = getComputedStyle(e)
    // Open sheets/dialogs (and their overlay) are the content, not chrome.
    if (!['fixed', 'sticky'].includes(cs.position) || !visible(e) || e.closest('[role=dialog]') || e.matches('[data-slot$=overlay]')) continue
    const r = e.getBoundingClientRect()
    if (r.width < vw * 0.5) continue // desktop sidebar etc.
    chrome += Math.min(r.height, vh)
  }
  if (chrome > vh * 0.45) out.push(['chrome-too-tall', `fixed/sticky bars use ${Math.round((chrome / vh) * 100)}% of a ${vh}px-tall screen`])

  // 6. Inputs that make iOS Safari auto-zoom (font-size < 16px)
  if (touch)
    for (const e of document.querySelectorAll('input:not([type=checkbox]):not([type=radio]), textarea, select'))
      if (visible(e) && parseFloat(getComputedStyle(e).fontSize) < 16) out.push(['ios-zoom-input', `${e.getAttribute('aria-label') || e.id || e.name || e.type} is ${getComputedStyle(e).fontSize}`])

  // 7. Distorted images / icons
  for (const e of document.querySelectorAll('img')) {
    if (!visible(e) || !e.naturalWidth) continue
    const r = e.getBoundingClientRect()
    const fit = getComputedStyle(e).objectFit
    if (fit === 'fill' && Math.abs(r.width / r.height - e.naturalWidth / e.naturalHeight) > 0.05) out.push(['distorted-image', e.src.split('/').pop()])
  }

  // 8. Wasted space: content column far narrower than a wide viewport
  const main = document.querySelector('main')
  if (main && vw >= 768) {
    const mw = main.getBoundingClientRect().width
    if (mw < Math.min(vw * 0.6, 640)) out.push(['narrow-on-wide', `content column ${Math.round(mw)}px on a ${vw}px screen`])
  }
  return out
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
})
let checked = 0
for (const d of devices) {
  const page = await browser.newPage()
  await page.setViewport({ width: d.width, height: d.height, isMobile: !!d.touch, hasTouch: !!d.touch, deviceScaleFactor: 1 })
  await page.goto(B + '/home', { waitUntil: 'load' })
  await page.evaluate((ts, lang) => {
    localStorage.clear()
    if (ts) localStorage.setItem('sb:text-size', JSON.stringify(ts))
    localStorage.setItem('sb:lang', JSON.stringify(lang ?? 'id'))
  }, d.textSize, d.lang)
  for (const [who, routes] of [['guest', guest], ['user', user]]) {
    if (who === 'user') await page.evaluate(() => localStorage.setItem('sb:user', JSON.stringify({ phone: '08123456789', name: 'Akun Demo' })))
    for (const r of routes) {
      await page.goto(B + r, { waitUntil: 'load' })
      await w(450)
      for (const [kind, detail] of await page.evaluate(inspect, !!d.touch)) add(d.name, `${who} ${r}`, kind, detail)
      checked++
      if (['/home', '/packages', '/packages?for=anak', '/checkout?pkg=mingguan', '/account', '/consultation'].includes(r))
        await page.screenshot({ path: `${OUT}${d.name}-${who}${r.replace(/[\/?=&%]/g, '_')}.png`, fullPage: false })
    }
  }
  for (const [route, trigger] of sheets[d.lang ?? 'id']) {
    await page.goto(B + route, { waitUntil: 'load' })
    await w(450)
    await page.evaluate((t) => [...document.querySelectorAll('button')].find((b) => b.textContent.includes(t))?.click(), trigger)
    await w(500)
    for (const [kind, detail] of await page.evaluate(inspect, !!d.touch)) add(d.name, `${route} [${trigger}]`, kind, detail)
    checked++
  }
  await page.close()
}
await browser.close()

// Group identical findings across devices so the report stays readable.
const grouped = new Map()
for (const i of issues) {
  const key = `${i.kind}|${i.route}|${i.detail.replace(/\d+(?=px|×|%)/g, 'N')}`
  const g = grouped.get(key) ?? { ...i, devices: [] }
  g.devices.push(i.device)
  grouped.set(key, g)
}
fs.writeFileSync(OUT + 'report.json', JSON.stringify({ checked, issues }, null, 2))
console.log(`devices: ${devices.length} · page states checked: ${checked} · issues: ${issues.length} (${grouped.size} distinct)`)
const byKind = {}
for (const g of grouped.values()) (byKind[g.kind] ??= []).push(g)
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`\n## ${kind} (${list.length})`)
  for (const g of list.slice(0, 25)) console.log(` - ${g.route}: ${g.detail}  [${g.devices.join(', ')}]`)
  if (list.length > 25) console.log(`   … ${list.length - 25} more`)
}
process.exit(issues.length ? 1 : 0)
