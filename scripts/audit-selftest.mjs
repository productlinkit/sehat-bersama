// Proves the audit catches each defect from the v1.1 evaluation by re-introducing it on purpose.
// Every case must be FLAGGED; if a check stays silent on a known defect, the audit itself is broken.
import puppeteer from 'puppeteer-core'
import { B, contrast, navOverlap, overlay, results, structure, w } from './checks.mjs'

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844 })
await page.goto(B + '/home', { waitUntil: 'load' })
await page.evaluate(() => {
  localStorage.clear()
  localStorage.setItem('sb:user', JSON.stringify({ phone: '08123456789', name: 'Akun Demo' }))
})

let failed = 0
async function expect(name, id, run) {
  const before = results.length
  await run()
  const hit = results.slice(before).some((r) => r.id === id)
  results.length = before
  console.log(`${hit ? 'FLAGGED' : 'MISSED '}  ${name}`)
  if (!hit) failed++
}

await expect('translucent white chip on teal gradient (old "ONLINE 24/7", 1.4.3)', 'contrast', async () => {
  await page.goto(B + '/home', { waitUntil: 'load' })
  await w(500)
  await page.evaluate(() => {
    const chip = document.querySelector('[aria-roledescription=slide] span')
    chip.className = 'self-start rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white'
  })
  await contrast(page, 'selftest')
})

await expect('translucent quota chip on hero (old "Kuota: 8 dari 10", 1.4.3)', 'contrast', async () => {
  await page.goto(B + '/consultation/start?type=umum', { waitUntil: 'load' })
  await w(500)
  await page.evaluate(() => {
    const p = [...document.querySelectorAll('p')].find((e) => e.textContent.startsWith('Kuota'))
    p.className = 'mt-4 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white'
  })
  await contrast(page, 'selftest')
})

await expect('sheet closing drops focus to <body> (old compare-sheet bug, 2.4.3)', 'focus-return', async () => {
  // Reproduce the old behaviour: once Escape is pressed, the trigger can no longer receive focus,
  // so focus falls back to <body> exactly as it did before onCloseAutoFocus was added.
  await page.evaluateOnNewDocument(() => {
    const focus = HTMLElement.prototype.focus
    document.addEventListener('keydown', (e) => e.key === 'Escape' && (window.__dropFocus = true), true)
    HTMLElement.prototype.focus = function (...args) {
      if (window.__dropFocus && this.hasAttribute('data-audit-trigger')) return
      return focus.apply(this, args)
    }
  })
  await overlay(page, 'selftest', '/packages', 'Bandingkan paket')
})

// fresh page so the injected Escape handler does not leak into the next cases
await page.close()
const p2 = await browser.newPage()
await p2.setViewport({ width: 390, height: 844 })
await p2.goto(B + '/home', { waitUntil: 'load' })
await p2.evaluate(() => localStorage.setItem('sb:user', JSON.stringify({ phone: '08123456789', name: 'Akun Demo' })))

await expect('two h1 elements (old article detail, 1.3.1)', 'one-h1', async () => {
  await p2.goto(B + '/article/kenali-gejala-demam-berdarah', { waitUntil: 'load' })
  await w(400)
  await p2.evaluate(() => document.querySelector('header').insertAdjacentHTML('beforeend', '<h1>Artikel</h1>'))
  await structure(p2, 'selftest')
})

await expect('emoji used as an icon (old service tiles)', 'emoji-icon', async () => {
  await p2.goto(B + '/home', { waitUntil: 'load' })
  await w(400)
  await p2.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend', '<span>🩺</span>'))
  await structure(p2, 'selftest')
})

await expect('English UI label (old "Reward" tab)', 'english-label', async () => {
  await p2.goto(B + '/home', { waitUntil: 'load' })
  await w(400)
  await p2.evaluate(() => document.querySelector('main').insertAdjacentHTML('beforeend', '<span>Reward</span>'))
  await structure(p2, 'selftest')
})

await expect('raised active-tab button (old bottom nav)', 'nav-pattern', async () => {
  await p2.goto(B + '/account', { waitUntil: 'load' })
  await p2.evaluateOnNewDocument(() => {
    const s = document.createElement('style')
    s.textContent = 'nav a[aria-current=page] span:first-child{transform:translateY(-28px)}'
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s))
  })
  await navOverlap(p2, 'selftest')
})

await browser.close()
console.log(failed ? `\n${failed} known defect(s) NOT detected — the audit is unreliable` : '\nAll known defects detected — the audit is trustworthy')
process.exit(failed ? 1 : 0)
