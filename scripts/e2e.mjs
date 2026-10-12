// End-to-end checks for every finding in the Baseline and v1.1 UI/UX evaluations.
// Usage: BASE=http://localhost:5173 npm run test:e2e
import puppeteer from 'puppeteer-core'
import fs from 'fs'
import { fileURLToPath } from 'url'

const B = process.env.BASE || 'http://localhost:5173'
const w = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844 })
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
const text = () => page.evaluate(() => document.body.innerText)
const click = (t, sel = 'button,a') =>
  page.evaluate(
    (t, sel) => {
      const el = [...document.querySelectorAll(sel)].find((b) => b.textContent.trim().includes(t) || b.getAttribute('aria-label')?.includes(t))
      el?.click()
      return !!el
    },
    t,
    sel,
  )
let failures = 0
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failures++
}
const visibleNav = () =>
  page.evaluate(() => [...document.querySelectorAll('nav[aria-label="Navigasi utama"]')].some((n) => getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().width > 0))
const pressArrow = async (key) => {
  await page.keyboard.down(key)
  await w(80)
  await page.keyboard.up(key)
  await w(200)
}

await page.goto(B + '/home')
await page.evaluate(() => localStorage.clear())
await page.reload()
await w(600)

// ---- Home
await page.keyboard.press('Tab')
await page.keyboard.press('Tab')
check('focus ring visible', await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'))
check('home: logo + exactly one h1', await page.evaluate(() => !!document.querySelector('img[src="/logo.svg"]') && document.querySelectorAll('h1').length === 1))
check('carousel: pause control + ≥24px dots', await page.evaluate(() => {
  const d = [...document.querySelectorAll('button[aria-label^="Promo "]')]
  return !!document.querySelector('button[aria-label*="promo otomatis"]') && d.length === 2 && d.every((b) => b.getBoundingClientRect().width >= 24 && b.getBoundingClientRect().height >= 24)
}))
check('promo chip is solid white (no translucent chip)', await page.evaluate(() => {
  const chip = document.querySelector('[aria-roledescription=slide] span')
  return getComputedStyle(chip).backgroundColor === 'rgb(255, 255, 255)'
}))
check('search pill border ≥3:1 (#848ea0)', await page.evaluate(() => getComputedStyle(document.querySelector('form[role=search] label')).borderTopColor === 'rgb(132, 142, 160)'))
check('service tiles use SVG icon set (no emoji)', await page.evaluate(() => document.querySelectorAll('#layanan ~ ul svg, section[aria-labelledby=layanan] svg').length >= 4 && !/[\u{1F300}-\u{1FAFF}]/u.test(document.body.innerText)))

// ---- Reduced motion
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await page.reload()
await w(500)
check('reduced motion: promo autoplay off', await page.evaluate(() => !!document.querySelector('button[aria-label="Putar promo otomatis"]')))
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])

// ---- Packages (guest)
await page.goto(B + '/packages?for=anak')
await w(500)
check('recommendation + Harian Plus preselected', (await text()).includes('Rekomendasi untukmu') && await page.evaluate(() => document.querySelector('[role=radio][aria-checked=true]')?.getAttribute('aria-label')?.includes('Sehat Harian Plus')))
check('no duplicate package names / test values', await page.evaluate(() => {
  const n = [...document.querySelectorAll('[role=radio]')].map((r) => r.getAttribute('aria-label').split(',')[0])
  return new Set(n).size === n.length && !/777x|99 menit|Test Artikel/.test(document.body.innerText)
}))
check('purchase flow hides bottom nav', !(await visibleNav()))
check('packages listed before doctors card + explainer', await page.evaluate(() => {
  const firstPkg = document.querySelector('[role=radio]')
  const doctors = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('dokter siap'))
  return firstPkg.compareDocumentPosition(doctors) & Node.DOCUMENT_POSITION_FOLLOWING
}))
check('"Paling Populer" is not amber', await page.evaluate(() => {
  const el = [...document.querySelectorAll('span')].find((s) => s.textContent === 'Paling Populer')
  return !/251, 191, 36|245, 158, 11/.test(getComputedStyle(el).backgroundColor)
}))
// comparison sheet focus return
await page.focus('button:has(svg.lucide-columns-3)')
await page.keyboard.press('Enter')
await w(500)
check('comparison sheet is aria-modal', await page.evaluate(() => document.querySelector('[role=dialog]')?.getAttribute('aria-modal') === 'true'))
await page.keyboard.press('Escape')
await w(600)
check('closing comparison returns focus to its trigger', await page.evaluate(() => document.activeElement?.textContent.includes('Bandingkan paket')))
// details sheet focus return
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Lihat detail Sehat Keluarga')).focus())
await page.keyboard.press('Enter')
await w(500)
await page.keyboard.press('Escape')
await w(600)
check('closing details sheet returns focus to its trigger', await page.evaluate(() => document.activeElement?.textContent.includes('Lihat detail Sehat Keluarga')))
await page.focus('[role=radio][aria-checked=true]')
await pressArrow('ArrowDown')
check('arrow keys move package selection', await page.evaluate(() => document.querySelector('[role=radio][aria-checked=true]')?.getAttribute('aria-label')?.startsWith('Sehat Mingguan')))
await click('Lanjut ke Pembayaran')
await w(600)

// ---- Login gate + register
check('guest redirected to login gate', page.url().includes('/login?redirect='))
check('gate shows chosen package', (await text()).includes('Kamu memilih Sehat Mingguan'))
check('gate has back + help', await page.evaluate(() => !!document.querySelector('button[aria-label^="Kembali"]') && !!document.querySelector('a[href="/help"]')))
await page.evaluate(() => document.querySelector('button[type=submit]').click())
await w(300)
check('inline errors: role=alert + aria-invalid', await page.evaluate(() => document.querySelectorAll('[role=alert]').length >= 2 && !!document.querySelector('input[aria-invalid=true]')))
check('labels bound + helper via aria-describedby', await page.evaluate(() => {
  const ok = [...document.querySelectorAll('input:not([type=hidden])')].every((i) => i.labels?.length > 0)
  const i = document.querySelector('input[type=tel]')
  return ok && i.getAttribute('aria-describedby').split(' ').some((id) => document.getElementById(id)?.textContent.includes('Format nomor'))
}))
check('password toggle aria-pressed', await page.evaluate(() => document.querySelector('button[aria-pressed]')?.getAttribute('aria-label') === 'Tampilkan kata sandi'))
await page.type('input[type=tel]', '08123456789')
await click('Belum punya akun')
await w(500)
check('phone carried to register + package kept', (await page.$eval('input[type=tel]', (i) => i.value)) === '08123456789' && (await text()).includes('Kamu memilih Sehat Mingguan'))
await page.type('input[autocomplete=name]', 'Rina Kusuma')
await page.type('input[autocomplete=new-password]', 'rahasia123')
await page.evaluate(() => document.querySelector('button[type=submit]').click())
await w(500)
check('register blocked without consent', page.url().includes('/register') && (await text()).includes('perlu menyetujui'))
await page.click('#consent')
await page.evaluate(() => document.querySelector('button[type=submit]').click())
await w(1200)
check('lands on checkout with package restored', page.url().includes('/checkout?pkg=mingguan'))

// ---- Checkout
check('checkout hides bottom nav', !(await visibleNav()))
check('QRIS pre-selected + "Terakhir dipakai"', await page.evaluate(() => {
  const r = document.querySelector('[role=radio][aria-checked=true]')
  return r?.textContent.includes('QRIS') && r.textContent.includes('Terakhir dipakai')
}))
check('WhatsApp help on payment screen', (await text()).includes('Ada kendala saat membayar?'))
await click('Bayar Rp', 'button:not([role=radio])')
await w(1500)
check('pays without any error (no method step needed)', page.url().includes('/payment/success'))
check('branded payment success', (await text()).includes('Pembayaran berhasil') && await page.evaluate(() => document.querySelectorAll('h1').length === 1))

// ---- Funnel tracking
await page.goto(B + '/internal/funnel')
await w(400)
check('funnel tracks select → payment', await page.evaluate(() => {
  const rows = Object.fromEntries([...document.querySelectorAll('tbody tr')].map((r) => [r.querySelector('th').textContent, Number(r.querySelector('td').textContent)]))
  return rows['Pilih paket'] >= 1 && rows['Buka pembayaran'] >= 1 && rows['Pembayaran berhasil'] >= 1
}))

// ---- Rewards: redeem a voucher and use it at checkout
await page.goto(B + '/reward')
await w(500)
check('reward catalogue has redeemable vouchers + "segera hadir"', (await text()).includes('Tukarkan Poin') && (await text()).includes('Segera hadir') && !(await text()).includes('Belum ada voucher yang tersedia'))
await click('Tukar Potongan Rp 3.000')
await w(400)
await click('Ya, tukar')
await w(500)
check('redeemed voucher appears in Voucher Saya', (await text()).includes('Potongan Rp 3.000') && (await page.evaluate(() => !!document.querySelector('a[aria-label="Pakai Potongan Rp 3.000"]'))))
await page.goto(B + '/checkout?pkg=mingguan')
await w(500)
await click('Potongan Rp 3.000', '[role=radio]')
await w(200)
check('voucher applies at checkout (Rp 12.000)', (await text()).includes('Bayar Rp 12.000'))

// ---- IA + chat
await page.goto(B + '/notes')
await w(400)
check('Catatan merged into Riwayat Medis (/notes → /history)', page.url().endsWith('/history'))
await page.goto(B + '/consultation')
await w(500)
check('triage hand-off is a neutral system note, not the patient bubble', await page.evaluate(() => {
  const notes = [...document.querySelectorAll('[role=note]')]
  const kuesioner = notes.find((n) => n.textContent.includes('kuesioner'))
  const bg = kuesioner && getComputedStyle(kuesioner).backgroundColor
  return !!kuesioner && !/Pasien/.test(document.body.innerText) && !/251, 191|254, 243/.test(bg) && kuesioner.textContent.includes('Kamu')
}))

// ---- Lega
await page.goto(B + '/lega')
await w(500)
check('Lega subtitle wraps (not truncated)', await page.evaluate(() => {
  const p = document.querySelector('header p')
  return getComputedStyle(p).textOverflow !== 'ellipsis' && p.scrollWidth <= p.clientWidth + 1
}))
check('Lega weekly summary shows labelled sample before first entry', (await text()).includes('Contoh') && (await text()).includes('Begini ringkasanmu nanti terlihat'))
check('Lega moods use SVG icons', await page.evaluate(() => document.querySelectorAll('[aria-label="Pilih perasaanmu hari ini"] svg').length === 5))
await page.focus('button:has(> span)') // move focus somewhere safe
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Tulis jurnal')).focus())
await page.keyboard.press('Enter')
await w(400)
await page.keyboard.press('Escape')
await w(500)
check('journal dialog returns focus to its trigger', await page.evaluate(() => document.activeElement?.textContent.includes('Tulis jurnal')))

// ---- Nav pattern at every text size
for (const size of ['normal', 'large', 'xlarge']) {
  await page.evaluate((s) => localStorage.setItem('sb:text-size', JSON.stringify(s)), size)
  await page.goto(B + '/account')
  await w(500)
  const r = await page.evaluate(async () => {
    const nav = [...document.querySelectorAll('nav[aria-label="Navigasi utama"]')].find((n) => getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().bottom >= innerHeight - 2)
    window.scrollTo(0, document.documentElement.scrollHeight)
    await new Promise((r) => setTimeout(r, 200))
    const top = nav.getBoundingClientRect().top
    const raised = [...nav.querySelectorAll('a *')].some((e) => e.getBoundingClientRect().top < top - 1)
    const lastBottom = Math.max(...[...document.querySelector('main').querySelectorAll('*')].map((e) => e.getBoundingClientRect().bottom))
    return { raised, overlap: lastBottom > top + 1 }
  })
  check(`nav: active tab inside bar, no overlap (text ${size})`, !r.raised && !r.overlap)
}
await page.evaluate(() => localStorage.setItem('sb:text-size', '"normal"'))

// ---- Copy
for (const r of ['/home', '/account', '/reward', '/triage', '/lega', '/help']) {
  await page.goto(B + r)
  await w(400)
  const t = await text()
  check(`Indonesian labels on ${r}`, !/\b(Reward|Homecare|Home Lab|Mental Health|Online|Video Call|Voice Call|Check-in|FAQ)\b/.test(t) && !/\bAnda\b/.test(t))
}

// ---- OTP recovery + Lega guest
await page.evaluate(() => localStorage.removeItem('sb:user'))
await page.goto(B + '/forgot-password?phone=08123456789')
await w(500)
await click('Kirim Kode OTP')
await w(400)
await page.focus('#otp')
await page.keyboard.type('123456')
await w(200)
await click('Verifikasi')
await w(400)
const pw = await page.$$('input[type=password]')
await pw[0].type('passwordbaru1')
await pw[1].type('passwordbaru1')
await click('Simpan Kata Sandi')
await w(400)
check('OTP password recovery completes', (await text()).includes('Kata sandi berhasil diganti'))
await page.goto(B + '/lega')
await w(500)
check('guest Lega: mood preview + sample summary + byline', (await text()).includes('Cek Perasaan Harian') && (await text()).includes('Contoh') && (await text()).includes('bagian dari Sehat Bersama'))
await page.goto(B + '/lega/chat')
await w(500)
await page.type('#lega-input', 'Aku capek banget hari ini')
await page.keyboard.press('Enter')
await w(1800)
check('guest gets 1 reply then sign-up prompt', (await text()).includes('Mau lanjut ngobrol?') && (await page.$eval('#lega-input', (i) => i.disabled)))

// ---- Articles
await page.goto(B + '/articles')
await w(400)
await click('Anak', '[role=radio]')
await w(300)
check('article category chip filters', (await text()).includes('1 artikel'))
await page.goto(B + '/article/kenali-gejala-demam-berdarah')
await w(400)
check('article: one h1, author, related', (await page.evaluate(() => document.querySelectorAll('h1').length)) === 1 && (await text()).includes('Tim Medis Sehat Bersama') && (await text()).includes('Artikel Terkait'))

// ---- Text size + type floor
await page.goto(B + '/help')
await w(400)
await click('Sangat besar', '[role=radio]')
await w(200)
check('text size preference applies', await page.evaluate(() => getComputedStyle(document.documentElement).fontSize === '20px'))
for (const r of ['/home', '/packages', '/lega', '/login', '/register']) {
  await page.evaluate(() => localStorage.setItem('sb:text-size', '"normal"'))
  await page.goto(B + r)
  await w(500)
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && e.getClientRects().length && !e.closest('.sr-only') && parseFloat(getComputedStyle(e).fontSize) < 12)
      .map((e) => e.textContent.trim().slice(0, 30)),
  )
  check(`type floor ≥12px on ${r}`, small.length === 0)
}

// ---- Language toggle (Bahasa Indonesia / English)
await page.evaluate(() => localStorage.setItem('sb:user', JSON.stringify({ phone: '08123456789', name: 'Akun Demo' })))
await page.goto(B + '/home')
await w(500)
check('default language is Indonesian (html lang="id")', await page.evaluate(() => document.documentElement.lang === 'id'))
check('language toggle is a labelled radio group on home', await page.evaluate(() => {
  const g = document.querySelector('[role=radiogroup][aria-label="Bahasa"]')
  return !!g && [...g.querySelectorAll('[role=radio]')].map((r) => r.textContent).join() === 'ID,EN'
}))
await page.evaluate(() => document.querySelector('[role=radio][aria-label="English"]').click())
await w(300)
check('switching to EN updates <html lang> and the UI', await page.evaluate(() => document.documentElement.lang === 'en' && document.body.innerText.includes('Popular Services')))
check('EN: bottom nav labels translated', await page.evaluate(() => {
  const nav = [...document.querySelectorAll('nav')].find((n) => getComputedStyle(n).display !== 'none')
  return ['Home', 'History', 'Rewards', 'Account'].every((l) => nav.innerText.includes(l))
}))
await page.reload()
await w(500)
check('language choice persists after reload', await page.evaluate(() => document.documentElement.lang === 'en'))
await page.goto(B + '/packages')
await w(400)
check('EN: prices use English number format (Rp 15,000)', (await text()).includes('Rp 15,000') && (await text()).includes('Choose a Plan'))
await page.goto(B + '/history')
await w(400)
check('EN: dates formatted in English', (await text()).includes('Oct 2026'))
await page.goto(B + '/article/kenali-gejala-demam-berdarah')
await w(400)
check('EN: article content translated', (await text()).includes('Spotting the Early Signs of Dengue Fever'))
await page.goto(B + '/account/display')
await w(400)
await page.evaluate(() => [...document.querySelectorAll('[role=radio]')].find((r) => r.textContent.includes('Bahasa Indonesia')).click())
await w(300)
check('switch back to Indonesian from Akun → Tampilan & Bahasa', await page.evaluate(() => document.documentElement.lang === 'id' && document.body.innerText.includes('Tampilan & Bahasa')))

// ---- Desktop breakpoint
await page.evaluate(() => localStorage.setItem('sb:user', JSON.stringify({ phone: '08123456789', name: 'Akun Demo' })))
await page.setViewport({ width: 1440, height: 900 })
await page.goto(B + '/home')
await w(500)
check('desktop home: sidebar + two columns', await page.evaluate(() => {
  const nav = [...document.querySelectorAll('nav[aria-label="Navigasi utama"]')].find((n) => getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().width === 240)
  const cols = getComputedStyle(document.querySelector('main .lg\\:grid')).gridTemplateColumns.split(' ').length
  return !!nav && cols === 2
}))
await page.goto(B + '/packages')
await w(500)
check('desktop packages: two-column grid', await page.evaluate(() => getComputedStyle(document.querySelector('[role=radiogroup] .grid')).gridTemplateColumns.split(' ').length === 2))
const outDir = fileURLToPath(new URL('../audit-results/', import.meta.url))
fs.mkdirSync(outDir, { recursive: true })
await page.screenshot({ path: outDir + 'desktop-packages.png', fullPage: true })

console.log(`\n${failures ? failures + ' FAILED' : 'all passed'} · page errors: ${errs.length ? errs.join(' | ') : 'none'}`)
await browser.close()
process.exit(failures || errs.length ? 1 : 0)
