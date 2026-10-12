// Accessibility audit: axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice) on every route and overlay state,
// plus checks axe cannot do reliably:
//   - text contrast over translucent layers and gradients (WCAG 1.4.3)
//   - focus returns to the opening control when a sheet/dialog closes, and aria-modal is set (2.4.3, 4.1.2)
//   - exactly one <h1> per page (1.3.1)
//   - Tab-walk: visible focus ring, focus not obscured by fixed bars (2.4.7, 2.4.11)
//   - bottom nav never covers content at any text size
//   - no emoji icons and no leftover English UI labels
// Usage: BASE=http://localhost:5173 npm run test:a11y
import fs from 'fs'
import { fileURLToPath } from 'url'

export const B = process.env.BASE || 'http://localhost:5173'
const axeSrc = fs.readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
export const OUT = fileURLToPath(new URL('../audit-results/', import.meta.url))
fs.mkdirSync(OUT, { recursive: true })

export const guest = ['/home', '/search?q=anak', '/login', '/login?redirect=%2Fcheckout%3Fpkg%3Dharian', '/register', '/forgot-password', '/triage', '/packages', '/packages?for=anak', '/home-services', '/lega', '/lega/chat', '/articles', '/articles?kategori=anak', '/article/kenali-gejala-demam-berdarah', '/help', '/terms', '/privacy-policy', '/nope']
export const user = ['/home', '/packages?for=umum', '/checkout?pkg=mingguan', '/payment/success?pkg=mingguan&method=qris', '/consultation/start?type=umum', '/consultation/start?type=anak', '/consultation', '/prescriptions', '/history', '/notifications', '/reward', '/account', '/account/profile', '/account/addresses', '/account/transactions', '/account/security', '/account/display', '/account/notifications', '/lega', '/lega/chat', '/home-services', '/triage', '/internal/funnel']

// Overlays: [route, trigger-text] — opened from the keyboard, closed with Escape.
export const overlays = {
  guest: [['/packages', 'Bandingkan paket'], ['/packages', 'Lihat detail Sehat Mingguan'], ['/home', 'dokter siap sekarang']],
  user: [['/account', 'Keluar dari Akun'], ['/account/addresses', 'Tambah Alamat'], ['/lega', '+ Tulis jurnal'], ['/reward', 'Tukar Potongan Rp 3.000'], ['/consultation/start?type=umum', 'dokter siap sekarang']],
  // English-mode overlays (same flows, English trigger text)
  'en-guest': [['/packages', 'Compare plans'], ['/packages', 'See Sehat Mingguan details'], ['/home', 'doctors available now']],
  'en-user': [['/account', 'Sign out'], ['/account/addresses', 'Add address'], ['/lega', '+ Write entry'], ['/reward', 'Redeem Rp 3,000 off']],
}

// In Indonesian mode no stray English UI labels; in English mode no stray Indonesian words (brand names excluded).
const ENGLISH = /\b(Reward|Homecare|Home Lab|Mental Health|Online|Offline|Video Call|Voice Call|Check-in|FAQ|Streak|Gold Tier|Wellness|Mood)\b/
const INDONESIAN = /\b(yang|dan|untuk|kamu|dengan|dari|atau|sudah|belum|bisa|akan|lihat|masuk|daftar|bantuan|riwayat|pilih|paket|hari|bayar|kembali|tersisa|layanan|perasaan|menit|poin|tukar|selesai|lanjut|simpan|batal|keluar)\b/i
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}]/u

export const w = (ms) => new Promise((r) => setTimeout(r, ms))
export const results = []
export const errors = []
const add = (label, id, help, nodes = []) => results.push({ label, id, help, nodes })

export async function axe(page, label) {
  await page.evaluate(axeSrc)
  const v = await page.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } })
    return res.violations.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.slice(0, 4).map((n) => n.target.join(' ')) }))
  })
  v.forEach((x) => add(label, 'axe:' + x.id, x.help, x.nodes))
}

/** Contrast with real compositing: translucent backgrounds, element opacity and gradient stops (worst stop wins). */
export async function contrast(page, label) {
  const bad = await page.evaluate(() => {
    // Any CSS colour (rgb, oklch, oklab, color(), named) → RGBA via a 1×1 canvas.
    const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true })
    const cache = new Map()
    const parse = (c) => {
      if (!c || c === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
      if (cache.has(c)) return cache.get(c)
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = '#000'
      ctx.fillStyle = c
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      const v = { r, g, b, a: a / 255 }
      cache.set(c, v)
      return v
    }
    const COLOR = /(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^()]*\)|#[0-9a-f]{3,8}\b/gi
    const over = (top, bot) => {
      const a = top.a + bot.a * (1 - top.a)
      const ch = (k) => (top[k] * top.a + bot[k] * bot.a * (1 - top.a)) / (a || 1)
      return { r: ch('r'), g: ch('g'), b: ch('b'), a }
    }
    const lum = ({ r, g, b }) => {
      const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const ratio = (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
      return (x + 0.05) / (y + 0.05)
    }
    // Background candidates behind an element: stack translucent layers down to the first opaque one.
    const backgrounds = (el) => {
      const layers = []
      for (let n = el; n; n = n.parentElement) {
        const cs = getComputedStyle(n)
        const stops = cs.backgroundImage.includes('gradient') ? (cs.backgroundImage.match(COLOR) || []).map(parse) : null
        if (stops?.length) {
          layers.push({ stops })
          if (stops.every((s) => s.a === 1)) break
        }
        const c = parse(cs.backgroundColor)
        if (c && c.a > 0) {
          layers.push({ stops: [c] })
          if (c.a === 1) break
        }
      }
      let cands = [{ r: 255, g: 255, b: 255, a: 1 }]
      for (const layer of layers.reverse()) cands = layer.stops.flatMap((s) => cands.map((c) => over(s, c)))
      return cands
    }
    const out = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const seen = new Set()
    while (walker.nextNode()) {
      const t = walker.currentNode
      const el = t.parentElement
      if (!t.textContent.trim() || !el || seen.has(el)) continue
      seen.add(el)
      if (el.closest('svg, .sr-only, [aria-hidden=true], [inert], :disabled, [data-disabled], option')) continue
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden') continue
      let opacity = 1
      for (let n = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity)
      if (opacity < 0.1) continue
      const size = parseFloat(cs.fontSize)
      const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700)
      const need = large ? 3 : 4.5
      const fg0 = parse(cs.color)
      const worst = Math.min(
        ...backgrounds(el).map((bg) => ratio(over({ ...fg0, a: fg0.a * opacity }, bg), bg)),
      )
      if (worst < need) out.push(`${worst.toFixed(2)}:1 (need ${need}) "${t.textContent.trim().slice(0, 40)}"`)
    }
    return out
  })
  bad.forEach((b) => add(label, 'contrast', b))
}

export async function structure(page, label) {
  const r = await page.evaluate(
    (en, id, em) => {
      const lang = document.documentElement.lang
      const names = [...document.querySelectorAll('[aria-label],[placeholder]')].map((e) => `${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('placeholder') ?? ''}`).join(' ')
      const text = document.body.innerText + ' ' + names
      return {
        lang,
        h1: document.querySelectorAll('h1').length,
        english: lang === 'id' ? (document.body.innerText.match(new RegExp(en, 'g')) || []).slice(0, 5) : [],
        indonesian: lang === 'en' ? [...new Set((text.match(new RegExp(id, 'gi')) || []).map((s) => s.toLowerCase()))].slice(0, 5) : [],
        emoji: (text.match(new RegExp(em, 'gu')) || []).slice(0, 5),
      }
    },
    ENGLISH.source,
    INDONESIAN.source,
    EMOJI.source,
  )
  if (r.h1 !== 1) add(label, 'one-h1', `${r.h1} <h1> elements (expected exactly 1)`)
  if (!['id', 'en'].includes(r.lang)) add(label, 'html-lang', `<html lang="${r.lang}">`)
  if (r.english.length) add(label, 'english-label', `English UI labels: ${r.english.join(', ')}`)
  if (r.indonesian.length) add(label, 'untranslated', `Indonesian left in English mode: ${r.indonesian.join(', ')}`)
  if (r.emoji.length) add(label, 'emoji-icon', `Emoji rendered: ${r.emoji.join(' ')}`)
}

export async function keyboard(page, label) {
  await page.evaluate(() => {
    document.activeElement?.blur()
    window.scrollTo(0, 0)
  })
  const issues = new Set()
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none'
      const cx = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1)
      const cy = Math.min(Math.max(r.top + Math.min(r.height / 2, 20), 1), innerHeight - 1)
      const top = document.elementFromPoint(cx, cy)
      const covered = top && !el.contains(top) && !top.contains(el)
      return { tag: el.tagName, text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40), ring, covered }
    })
    if (!info) continue
    if (!info.ring) issues.add(`no visible focus: ${info.tag} "${info.text}"`)
    if (info.covered) issues.add(`focus obscured: ${info.tag} "${info.text}"`)
  }
  issues.forEach((i) => add(label, 'keyboard', i))
}

export async function navOverlap(page, label) {
  for (const size of ['normal', 'large', 'xlarge']) {
    await page.evaluate((s) => localStorage.setItem('sb:text-size', JSON.stringify(s)), size)
    await page.reload({ waitUntil: 'load' })
    await w(500)
    const r = await page.evaluate(async () => {
      const nav = [...document.querySelectorAll('nav[aria-label="Navigasi utama"]')].find((n) => getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().width > 0 && n.getBoundingClientRect().bottom >= innerHeight - 2)
      if (!nav) return { skip: true }
      window.scrollTo(0, document.documentElement.scrollHeight)
      await new Promise((r) => setTimeout(r, 200))
      const navTop = nav.getBoundingClientRect().top
      const raised = [...nav.querySelectorAll('a *')].some((e) => e.getBoundingClientRect().top < navTop - 1)
      const main = document.querySelector('main')
      const last = [...main.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().height > 0 && !e.closest('nav')).reduce((a, e) => (e.getBoundingClientRect().bottom > a ? e.getBoundingClientRect().bottom : a), 0)
      return { raised, overlap: last > navTop + 1, last, navTop }
    })
    if (r.skip) continue
    if (r.raised) add(`${label} [text ${size}]`, 'nav-pattern', 'Active tab rises above the nav bar')
    if (r.overlap) add(`${label} [text ${size}]`, 'nav-overlap', `Content bottom ${Math.round(r.last)} is under the nav (top ${Math.round(r.navTop)})`)
  }
  await page.evaluate(() => localStorage.setItem('sb:text-size', '"normal"'))
}

export async function overlay(page, label, route, trigger) {
  await page.goto(B + route, { waitUntil: 'load' })
  await w(600)
  const found = await page.evaluate((t) => {
    const el = [...document.querySelectorAll('button, a')].find((b) => (b.getAttribute('aria-label') || b.textContent).includes(t))
    if (!el) return false
    el.setAttribute('data-audit-trigger', '')
    el.focus()
    return true
  }, trigger)
  if (!found) return add(label, 'overlay', `Trigger not found: "${trigger}"`)
  await page.keyboard.press('Enter')
  await w(600)
  const open = await page.evaluate(() => {
    const d = document.querySelector('[role=dialog]')
    return d ? { modal: d.getAttribute('aria-modal') === 'true', named: !!(d.getAttribute('aria-labelledby') || d.getAttribute('aria-label')) } : null
  })
  if (!open) return add(label, 'overlay', `"${trigger}" did not open a dialog`)
  if (!open.modal) add(label, 'aria-modal', `"${trigger}" dialog lacks aria-modal="true"`)
  if (!open.named) add(label, 'dialog-name', `"${trigger}" dialog has no accessible name`)
  await axe(page, `${label} [${trigger} open]`)
  await contrast(page, `${label} [${trigger} open]`)
  await page.keyboard.press('Escape')
  await w(600)
  const back = await page.evaluate(() => document.activeElement?.hasAttribute('data-audit-trigger'))
  if (!back) add(label, 'focus-return', `Closing "${trigger}" did not return focus to its trigger`)
}

