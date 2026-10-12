// Runs every check in ./checks.mjs across all routes, both viewports, guest and signed-in.
// Usage: BASE=http://localhost:5173 npm run test:a11y
import puppeteer from 'puppeteer-core'
import fs from 'fs'
import { B, OUT, axe, contrast, errors, guest, keyboard, navOverlap, overlay, overlays, results, structure, user, w } from './checks.mjs'

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
})
let audited = 0
for (const vp of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  const page = await browser.newPage()
  await page.setViewport({ width: vp.width, height: vp.height })
  page.on('pageerror', (e) => errors.push(`${vp.name} ${page.url()}: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${vp.name} ${page.url()}: ${m.text().slice(0, 160)}`))
  await page.goto(B + '/home', { waitUntil: 'load' })
  await page.evaluate(() => localStorage.clear())

  for (const [who, routes] of [
    ['guest', guest],
    ['user', user],
  ]) {
    if (who === 'user') await page.evaluate(() => localStorage.setItem('sb:user', JSON.stringify({ phone: '08123456789', name: 'Akun Demo' })))
    for (const r of routes) {
      const label = `${vp.name} ${who} ${r}`
      await page.goto(B + r, { waitUntil: 'load' })
      await w(700)
      await axe(page, label)
      await contrast(page, label)
      await structure(page, label)
      if (vp.name === 'mobile') await keyboard(page, label)
      audited++
      if (['/home', '/packages', '/checkout?pkg=mingguan', '/reward', '/lega', '/account', '/consultation'].includes(r))
        await page.screenshot({ path: `${OUT}${vp.name}-${who}${r.replace(/[\/?=&%]/g, '_')}.png`, fullPage: true })
    }
    for (const [route, trigger] of overlays[who]) {
      await overlay(page, `${vp.name} ${who} ${route}`, route, trigger)
      audited++
    }
    if (vp.name === 'mobile') for (const r of ['/home', '/account', '/reward']) {
      if (who === 'user') {
        await page.goto(B + r, { waitUntil: 'load' })
        await navOverlap(page, `${vp.name} ${who} ${r}`)
      }
    }
    // error state
    if (who === 'guest') {
      await page.goto(B + '/register', { waitUntil: 'load' })
      await w(500)
      await page.evaluate(() => document.querySelector('button[type=submit]').click())
      await w(400)
      await axe(page, `${vp.name} guest /register [errors]`)
      await contrast(page, `${vp.name} guest /register [errors]`)
      audited++
    }
  }
  await page.close()
}
await browser.close()

fs.writeFileSync(OUT + 'report.json', JSON.stringify({ audited, results, errors }, null, 2))
const byLabel = results.reduce((m, r) => ((m[r.label] ??= []).push(r), m), {})
console.log(`pages/states audited: ${audited}; issues: ${results.length}`)
for (const [label, items] of Object.entries(byLabel)) {
  console.log('\n## ' + label)
  for (const i of items) console.log(` - ${i.id}: ${i.help}${i.nodes.length ? '\n     ' + i.nodes.join('\n     ') : ''}`)
}
console.log('\nconsole/page errors:', errors.length ? '\n' + errors.join('\n') : 'none')
process.exit(results.length || errors.length ? 1 : 0)
