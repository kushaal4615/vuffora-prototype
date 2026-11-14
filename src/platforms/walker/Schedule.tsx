import { motion } from 'framer-motion'
import { Check, ChevronLeft, CopyPlus, EyeOff, Pause, Play, Radio, Repeat } from 'lucide-react'
import { useRef, useState } from 'react'
import { Bar, TemperBadge } from '../../components/Brand'
import { Button } from '../../components/Button'
import { inr } from '../../data/clock'
import { quote } from '../../data/core'
import { img } from '../../data/media'
import { ALL_SLOTS, DAYS, SHIFTS, SLOT_BOOKINGS, UPCOMING, slotKey } from '../../data/walkerData'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, SectionHead, safeTop } from '../mobileShell'

/* Availability and shift manager. Royal-blue hero with the same Online
   switch as Today and the hours-per-week figure; the weekly planner as a
   7 x 3 grid of tappable shifts; bookings per day as bars on an ink band;
   then what is already booked, grouped by day. */

const DATES: Record<string, string> = { Mon: '16', Tue: '17', Wed: '18', Thu: '19', Fri: '20', Sat: '14', Sun: '15' }
const TODAY = 'Sat'

function OnlineSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Online" onClick={() => onChange(!on)} className="relative h-[52px] w-[136px] shrink-0 rounded-full transition-colors duration-200" style={{ background: on ? 'var(--sun)' : 'rgb(10 18 56 / 0.55)', boxShadow: on ? 'var(--glow-sun)' : 'inset 0 0 0 1.5px rgb(255 255 255 / 0.35)' }}>
      <span className={`absolute top-1/2 -translate-y-1/2 text-[15px] font-extrabold ${on ? 'left-5 text-on-sun' : 'right-4 text-white'}`}>{on ? 'Online' : 'Offline'}</span>
      <motion.span className="absolute left-0 top-[5px] grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-text shadow-[0_3px_10px_rgb(10_18_56/0.35)]" initial={false} animate={{ x: on ? 89 : 5 }} transition={spring.ui}>
        {on ? <Radio size={19} strokeWidth={2.4} className="text-accent-ink" aria-hidden /> : <EyeOff size={19} strokeWidth={2.4} aria-hidden />}
      </motion.span>
    </button>
  )
}

export default function WalkerSchedule() {
  const { reset, toast } = useNav()
  const online = useSession((s) => s.online)
  const slotsOff = useSession((s) => s.slotsOff)
  const pricing = useSession((s) => s.pricing)
  const before = useRef<string[] | null>(null)
  const [copied, setCopied] = useState(false)

  const onCount = ALL_SLOTS.filter((k) => !slotsOff.includes(k)).length
  const hours = onCount * 4
  const paused = onCount === 0
  const perDay = DAYS.map((d) => ({ d, n: SHIFTS.reduce((sum, s) => sum + (slotsOff.includes(slotKey(d, s.id)) ? 0 : SLOT_BOOKINGS[slotKey(d, s.id)] ?? 0), 0) }))
  const maxDay = Math.max(1, ...perDay.map((p) => p.n))
  const weekBookings = perDay.reduce((a, b) => a + b.n, 0)
  const groups = UPCOMING.reduce<{ day: string; rows: typeof UPCOMING }[]>((acc, b) => {
    const g = acc.find((x) => x.day === b.day)
    if (g) g.rows.push(b)
    else acc.push({ day: b.day, rows: [b] })
    return acc
  }, [])

  const toggle = (key: string, label: string) => {
    const wasOn = !slotsOff.includes(key)
    const booked = SLOT_BOOKINGS[key] ?? 0
    session.toggleSlot(key)
    setCopied(false)
    if (wasOn && booked > 0) toast(`${label} off. Your ${booked} booked ${booked === 1 ? 'walk' : 'walks'} will be offered to other walkers`, 'warn')
    else toast(`${label} ${wasOn ? 'switched off' : 'is open for bookings'}`, wasOn ? 'neutral' : 'accent')
  }
  const pauseAll = () => {
    if (paused) {
      session.set({ slotsOff: before.current ?? [] })
      before.current = null
      toast('Your weekly slots are back on', 'accent')
    } else {
      before.current = slotsOff
      session.set({ slotsOff: ALL_SLOTS })
      toast('All slots paused. Owners cannot book you until you resume', 'warn')
    }
  }

  return (
    <MobileScreen tab="schedule" cap="var(--accent)">
      <section className="relative overflow-hidden bg-accent px-5 pb-6 text-on-accent" style={{ paddingTop: safeTop(12) }}>
        <span aria-hidden className="sun -right-[20%] w-[40%]" style={{ top: safeTop(0) }} />
        <span aria-hidden className="dots-light" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label text-[var(--on-accent-2)]">Availability</p>
            <h1 className="grot mt-1.5 text-[32px] leading-[0.98]">Your week,<br /><span className="swoosh">your hours</span></h1>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-4">
          <OnlineSwitch on={online} onChange={(v) => { session.setOnline(v); toast(v ? 'You are online. Instant requests will reach you' : 'You are offline. Scheduled walks still stand', v ? 'accent' : 'neutral') }} />
          <p className="min-w-0 max-w-[21ch] text-[13px] font-semibold leading-snug text-[var(--on-accent-2)]">
            <span className="block text-[15px] font-extrabold text-white">{online ? 'Open for Walk Now' : 'You are hidden from the map'}</span>
            The slots below are for scheduled walks.
          </p>
        </div>
        <div className="relative mt-6 flex items-end justify-between gap-4">
          <p className="flex items-baseline gap-2">
            <span className="figure num text-[64px] text-white">{hours}</span>
            <span className="text-[15px] font-extrabold leading-tight">hours<br />a week</span>
          </p>
          <div className="min-w-0 flex-1 pb-2">
            <p className="num mb-1.5 text-right text-[12px] font-bold text-[var(--on-accent-2)]">{onCount} of 21 shifts open</p>
            <Bar value={(onCount / 21) * 100} tone="sun" height={8} track="rgb(255 255 255 / 0.22)" />
          </div>
        </div>
      </section>

      {/* weekly recurring planner */}
      <div className="px-4 pt-5">
        <div className="grid grid-cols-[52px_repeat(3,1fr)] gap-1.5">
          <span />
          {SHIFTS.map((s) => (
            <div key={s.id} className="pb-1 text-center leading-tight">
              <p className="text-[12px] font-extrabold">{s.label}</p>
              <p className="num text-[11px] font-semibold text-text-2">{s.hours}</p>
            </div>
          ))}
          {DAYS.map((d) => (
            <div key={d} className="contents">
              <div className={`flex h-[50px] flex-col items-center justify-center rounded-[var(--r-control)] leading-none ${d === TODAY ? 'bg-sun text-on-sun' : ''}`}>
                <span className="text-[12px] font-extrabold">{d}</span>
                <span className="num mt-1 text-[11px] font-semibold">{DATES[d]}</span>
              </div>
              {SHIFTS.map((s) => {
                const key = slotKey(d, s.id)
                const on = !slotsOff.includes(key)
                const booked = SLOT_BOOKINGS[key] ?? 0
                return (
                  <motion.button key={key} type="button" aria-pressed={on} aria-label={`${d} ${s.label}, ${on ? 'on' : 'off'}${on && booked ? `, ${booked} booked` : ''}`} whileTap={tap} transition={spring.ui} onClick={() => toggle(key, `${d} ${s.label.toLowerCase()}`)} className={`relative flex h-[50px] items-center justify-center gap-1.5 rounded-[var(--r-control)] text-[12px] font-extrabold transition-colors duration-150 ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface-high)] text-text-2'}`}>
                    {on ? (
                      booked > 0 ? (
                        <>
                          <span className="num grid h-6 min-w-6 place-items-center rounded-full bg-sun px-1.5 text-[12px] text-on-sun">{booked}</span>
                          booked
                        </>
                      ) : (
                        <>
                          <Check size={14} strokeWidth={3.2} aria-hidden /> Open
                        </>
                      )
                    ) : (
                      'Off'
                    )}
                  </motion.button>
                )
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 px-1 text-[12px] font-semibold text-text-2">
          <Repeat size={13} strokeWidth={2.6} aria-hidden /> Repeats every week until you change it. Tap a shift to switch it.
        </p>
        <div className="mt-3 flex gap-2">
          <Button variant={copied ? 'paper' : 'accent'} icon={copied ? Check : CopyPlus} block onClick={() => { setCopied(true); toast('Copied to the week of 23 Nov', 'accent') }}>
            {copied ? 'Copied to 23 Nov' : 'Copy to next week'}
          </Button>
          <Button variant="outline" icon={paused ? Play : Pause} block onClick={pauseAll}>
            {paused ? 'Resume all' : 'Pause all'}
          </Button>
        </div>
      </div>

      {/* bookings per day */}
      <section className="relative mt-6 overflow-hidden bg-ink px-5 py-5 text-on-ink">
        <span aria-hidden className="sun -bottom-[70%] -right-[10%] w-[38%]" />
        <div className="relative flex items-end justify-between gap-3">
          <div>
            <p className="label text-sun-light">Booked this week</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="figure num text-[40px]">{weekBookings}</span>
              <span className="text-[14px] font-extrabold">walks in your open shifts</span>
            </p>
          </div>
        </div>
        <div className="relative mt-4 flex h-[92px] items-end gap-2" role="img" aria-label={`Bookings per day: ${perDay.map((p) => `${p.d} ${p.n}`).join(', ')}`}>
          {perDay.map((p) => (
            <div key={p.d} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="num text-[11px] font-extrabold">{p.n}</span>
              <motion.span className={`w-full rounded-t-[8px] ${p.d === TODAY ? 'bg-sun' : 'bg-[var(--blue-400)]'}`} style={{ height: `${Math.max(4, (p.n / maxDay) * 52)}px`, transformOrigin: 'bottom' }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={spring.page} />
              <span className={`text-[11px] font-bold ${p.d === TODAY ? 'text-sun-light' : 'text-on-ink-2'}`}>{p.d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* upcoming bookings by day */}
      <SectionHead className="mt-6" title="Upcoming bookings" eyebrow={`${UPCOMING.length} walks confirmed`} />
      <motion.div variants={listParent} initial="hidden" animate="show" className="mt-1">
        {groups.map((g) => (
          <div key={g.day}>
            <p className="label sticky top-0 z-10 bg-[var(--bg)] px-5 pb-1.5 pt-4 text-text-2">{g.day}</p>
            <ul className="px-3">
              {g.rows.map((b) => (
                <motion.li key={b.id} variants={listItem} className="flex items-center gap-3 px-2 py-2">
                  <img src={img(b.photo, 140)} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" style={{ objectPosition: '50% 25%' }} />
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-extrabold">{b.dog}</span>
                      <TemperBadge t={b.temperament} />
                      {b.pass && <span className="flex h-6 shrink-0 items-center rounded-full bg-sun-soft px-2 text-[11px] font-extrabold text-[var(--on-sun-soft)]">Pass</span>}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] font-semibold text-text-2">{b.breed} · {b.locality} · {b.duration} min</p>
                  </div>
                  <div className="shrink-0 text-right leading-tight">
                    <p className="num text-[14px] font-extrabold">{b.time}</p>
                    <p className="num text-[12px] font-bold text-calm-ink">{inr(quote(pricing, b.duration, b.temperament, false).walkerNet)}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>

      <button type="button" onClick={() => reset('walker.home')} className="mx-auto mt-3 flex h-11 items-center gap-1 px-5 text-[13px] font-extrabold text-accent-ink">
        <ChevronLeft size={16} strokeWidth={2.6} aria-hidden /> Back to today
      </button>
    </MobileScreen>
  )
}
