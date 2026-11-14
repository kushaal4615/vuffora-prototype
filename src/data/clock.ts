/* The demo's clock and formatting helpers.
   Today is Saturday 14 November 2026, 07:42 in Mohali (IST). Bruno's
   morning walk with Arjun is booked for 08:00. All money is INR. */

export const CLOCK = {
  todayIso: '2026-11-14',
  date: 'Sat 14 Nov 2026',
  time: '07:42',
  tz: 'Mohali · IST',
  nowMin: 7 * 60 + 42,
}

/** ₹1,24,500 (Indian digit grouping, no decimals) */
export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
/** ₹412.02, for invoices and GST lines */
export const inr2 = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
/** ₹5.8k · ₹2.4L · ₹1.2Cr, for tight tiles */
export const inrShort = (n: number) => {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(n >= 100_000_000 ? 0 : 1)}Cr`
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(n >= 1_000_000 ? 1 : 2)}L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  return `₹${n}`
}
/** 07:42 → 7:42 am */
export const clock12 = (min: number) => {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}
/** 1830 seconds → 30:30 */
export const mmss = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const parseIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
export const toIso = (d: Date) => d.toISOString().slice(0, 10)
export const addDays = (iso: string, n: number) => {
  const d = parseIso(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return toIso(d)
}
/** "Sat 20 Feb" · with year "Sat 20 Feb 2027" */
export const fmtDay = (iso: string, year = false) => {
  const d = parseIso(iso)
  return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH[d.getUTCMonth()]}${year ? ` ${d.getUTCFullYear()}` : ''}`
}
/** "20 Feb" */
export const fmtShort = (iso: string) => {
  const d = parseIso(iso)
  return `${d.getUTCDate()} ${MONTH[d.getUTCMonth()]}`
}
export const dayNum = (iso: string) => parseIso(iso).getUTCDate()
export const dowLabel = (iso: string) => DOW[parseIso(iso).getUTCDay()]
export const monthLabel = (iso: string) => MONTH[parseIso(iso).getUTCMonth()]
/** whole days from today to `iso` (negative = past) */
export const daysUntil = (iso: string) => Math.round((parseIso(iso).getTime() - parseIso(CLOCK.todayIso).getTime()) / 86_400_000)
/** "in 91 days" · "today" · "3 days ago" */
export const relDay = (iso: string) => {
  const n = daysUntil(iso)
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n === -1) return 'yesterday'
  return n > 0 ? `in ${n} days` : `${-n} days ago`
}
/** "2m ago" · "3h ago" · "Tue" · "14 Oct" — for feeds; minutesAgo relative to CLOCK */
export const ago = (minutes: number) => {
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${Math.round(minutes)}m ago`
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`
  const days = Math.round(minutes / 60 / 24)
  if (days < 7) return `${days}d ago`
  return fmtShort(addDays(CLOCK.todayIso, -days))
}
export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
