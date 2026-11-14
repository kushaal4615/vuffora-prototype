/** ZERO-TYPING AUDIT (v4): walks every flow from a fresh load using taps only (no keyboard).
 *  Each step taps the screen's primary action: the ember (accent) button in the dock,
 *  else the last accent button on screen. Usage: node scripts/zero-typing.mjs <baseUrl> [--phone] */
import { chromium, devices } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5322'
const PHONE = process.argv.includes('--phone')
const browser = await chromium.launch()
const ctx = PHONE ? await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } }) : await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const hash = () => page.evaluate(() => location.hash)
const go = async (h) => {
  await page.goto('about:blank')
  await page.goto(`${BASE}/#/${h}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
}
/** tap the primary (accent-filled) button; returns its label */
const primary = async (match) => {
  const label = await page.evaluate((src) => {
    const re = src ? new RegExp(src, 'i') : null
    const frame = document.querySelector('[data-stage-frame]')
    const dialogs = [...document.querySelectorAll('[role="dialog"]')].filter((d) => d.getBoundingClientRect().height > 0)
    const f = dialogs.length ? dialogs.at(-1) : frame
    const all = [...f.querySelectorAll('button')].filter((b) => {
      const r = b.getBoundingClientRect()
      if (!r.width || !r.height || b.disabled) return false
      const txt = (b.getAttribute('aria-label') || b.textContent || '').trim()
      if (re) return re.test(txt)
      return getComputedStyle(b).backgroundColor.replace(/\s/g, '').startsWith('rgb(35,72,214')
    })
    const docked = all.filter((b) => b.closest('[data-dock]'))
    const b = (docked.length ? docked : all).at(-1)
    if (!b) return null
    b.setAttribute('data-zt', '1')
    return (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 40)
  }, match ? match.source : null)
  if (!label) throw new Error(`no primary button on ${await hash()}`)
  await page.locator('[data-zt="1"]').scrollIntoViewIfNeeded()
  await page.locator('[data-zt="1"]').click()
  await page.evaluate(() => document.querySelector('[data-zt]')?.removeAttribute('data-zt'))
  await page.waitForTimeout(900)
  return label
}
const errorsOnLoad = () =>
  page.evaluate(() => {
    const f = document.querySelector('[data-stage-frame]')
    return [...f.querySelectorAll('p, span')].filter((e) => /required|is required|enter your|doesn.t match|fill in/i.test(e.textContent || '') && getComputedStyle(e).color.replace(/\s/g, '').includes('194,51,58')).length
  })
const until = async (target, max = 14) => {
  for (let i = 0; i < max; i++) {
    const h = await hash()
    if (h === target) return true
    if (await errorsOnLoad()) return `validation error visible on ${h}`
    await primary()
  }
  return (await hash()) === target || `ended at ${await hash()}`
}

/* a change = the frame's text changed, or a toast appeared (phone mode renders toasts outside the frame) */
const snapshot = () => page.evaluate(() => (document.querySelector('[data-stage-frame]')?.innerText ?? '') + '\n' + [...document.querySelectorAll('[aria-live]')].map((e) => e.innerText).join('|'))
const changed = async (fn) => {
  const before = await snapshot()
  await fn()
  await page.waitForTimeout(500)
  return (await snapshot()) !== before || 'nothing changed'
}

const flows = [
  ['Owner: welcome → sign-in → SMS OTP → pet profile → vault → home', async () => { await go('owner/welcome'); return until('#/owner/home', 8) }],
  ['Owner: find a walker → profile → book', async () => { await go('owner/home'); await primary(/find a walker/); await primary(/book fastest/); return (await hash()) === '#/owner/booking' || `ended at ${await hash()}` }],
  ['Owner: booking → pay → confirmed → arrival → OTP → live → Check-Out → review → home', async () => {
    await go('owner/booking'); await primary(/continue to pay/); await primary(/^pay/); await page.waitForTimeout(2200)
    if ((await hash()) !== '#/owner/confirmed') return `payment ended at ${await hash()}`
    await page.waitForTimeout(2500); await primary(/track arjun/); await page.waitForTimeout(16000)
    await primary(/shared the otp/); await page.waitForTimeout(2500)
    if ((await hash()) !== '#/owner/live') return `OTP step ended at ${await hash()}`
    await page.waitForTimeout(42000); await primary(/check-out otp/); await page.waitForTimeout(1500)
    if ((await hash()) !== '#/owner/review') return `check-out ended at ${await hash()}`
    await primary(/submit review/); await page.waitForTimeout(1200); await primary(/back to home/)
    return (await hash()) === '#/owner/home' || `ended at ${await hash()}`
  }],
  ['Owner: send a chat message to the walker', async () => { await go('owner/chat'); return changed(() => primary(/^send$/)) }],
  ['Owner: send a message to Support', async () => { await go('owner/support'); return changed(() => primary(/^send$/)) }],
  ['Owner: search the help centre', async () => { await go('owner/help'); return changed(() => primary(/bookings|payments/)) }],
  ['Owner: save account details', async () => { await go('owner/profile'); return changed(() => primary(/^save/)) }],
  ['Owner: upload a certificate', async () => { await go('owner/vault'); return changed(() => primary(/take photo/)) }],
  ['Walker: sign-in → today', async () => { await go('walker/signin'); return until('#/walker/home', 2) }],
  ['Walker: onboarding and KYC, four steps', async () => { await go('walker/kyc'); return until('#/walker/home', 6) }],
  ['Walker: request → accept → pickup → arrived → Check-In OTP → walk → Check-Out OTP', async () => {
    await go('walker/request'); await primary(/accept|go to pickup/); await page.waitForTimeout(600)
    if ((await hash()) !== '#/walker/pickup') return `accept ended at ${await hash()}`
    await page.waitForTimeout(13500); await primary(/arrived at the gate|enter check-in/); await page.waitForTimeout(500)
    if ((await hash()) !== '#/walker/otp') await primary(/enter check-in otp/)
    if ((await hash()) !== '#/walker/otp') return `pickup ended at ${await hash()}`
    await primary(/verify and start walk/); await page.waitForTimeout(1500)
    if ((await hash()) !== '#/walker/walk') return `check-in ended at ${await hash()}`
    await primary(/^log water/); await primary(/end walk/)
    if ((await hash()) !== '#/walker/dropoff') return `end walk ended at ${await hash()}`
    return changed(() => primary(/verify and end walk/))
  }],
  ['Walker: log an activity', async () => { await go('walker/walk'); return changed(() => primary(/^log photo/)) }],
  ['Walker: send a chat message to the owner', async () => { await go('walker/chat'); return changed(() => primary(/^send$/)) }],
  ['Walker: withdraw to UPI', async () => { await go('walker/earnings'); await primary(/^withdraw/); await page.waitForTimeout(500); return changed(() => primary(/withdraw|confirm/)) }],
  ['Walker: toggle a shift', async () => { await go('walker/schedule'); return changed(() => primary(/open|off|booked/)) }],
  ['Walker: message the admin', async () => { await go('walker/support'); await primary(/open chat/); await page.waitForTimeout(600); return changed(() => primary(/^send$/)) }],
  ['Admin: sign-in → overview', async () => { await go('admin/signin'); return until('#/admin/overview', 2) }],
  ['Admin: approve a vaccination certificate', async () => { await go('admin/vetting'); return changed(() => primary(/^approve$/)) }],
  ['Admin: approve a walker KYC application', async () => { await go('admin/walkers'); return changed(() => primary(/approve application/)) }],
  ['Admin: reply in the unified inbox', async () => { await go('admin/messages'); if (PHONE) { await primary(/ananya sharma/); await page.waitForTimeout(500) } return changed(() => primary(/^send$/)) }],
  ['Admin: start an outbound message', async () => { await go('admin/messages'); await primary(/new message/); await page.waitForTimeout(500); return changed(() => primary(/^send/)) }],
  ['Admin: publish the rate card', async () => { await go('admin/pricing'); return changed(() => primary(/^publish/)) }],
  ['Admin: pay a walker', async () => { await go('admin/payouts'); return changed(() => primary(/pay now/)) }],
  ['Admin: close a dispute', async () => { await go('admin/disputes'); return changed(() => primary(/uphold walker|uphold owner|split/)) }],
  ['Admin: invite a teammate', async () => { await go('admin/settings'); await primary(/invite teammate/); await page.waitForTimeout(500); return changed(() => primary(/send invite|invite/)) }],
  ['Admin: export a report', async () => { await go('admin/analytics'); return changed(() => primary(/export csv/)) }],
]


let pass = 0
const fails = []
for (const [name, fn] of flows) {
  try {
    const r = await fn()
    if (r === true) pass++
    else fails.push(`${name}: ${r}`)
  } catch (e) {
    fails.push(`${name}: ${String(e.message).split('\n')[0].slice(0, 110)}`)
  }
}
await browser.close()
console.log(`Zero-typing flows (${PHONE ? 'phone' : 'desktop'}): ${pass}/${flows.length} completed with taps only`)
fails.forEach((f) => console.log('  BLOCKED ' + f))
