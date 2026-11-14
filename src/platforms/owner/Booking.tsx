import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CalendarClock, Check, MapPin, ReceiptText, ShieldAlert, Ticket, Zap } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Certified, Price, Stars, TemperBadge } from '../../components/Brand'
import { Button } from '../../components/Button'
import { TextArea, Toggle } from '../../components/Form'
import { Rail } from '../../components/Media'
import { DOGS, dogById, walkerById } from '../../data/cast'
import { CLOCK, addDays, dayNum, dowLabel, fmtDay, inr, monthLabel } from '../../data/clock'
import { WALK, quote, type Duration } from '../../data/core'
import { DEMO_BOOKING, DEMO_SLOT_PICK, DEMO_SLOTS } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { ownerDocState, session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { Dock, MobileScreen, SectionHead, StepBar } from '../mobileShell'

/* The booking engine. Walker strip, Walk Now / Schedule Later, the dog
   picker, duration blocks, the Walk Pass band, a note, and the live INR
   rate card that recomputes from the admin's pricing on every choice. */

const DAYS = Array.from({ length: 7 }, (_, i) => addDays(CLOCK.todayIso, i))
const DURATIONS: { d: Duration; hint: string }[] = [
  { d: 30, hint: 'Quick loop' },
  { d: 45, hint: 'Most booked' },
  { d: 60, hint: 'Full park' },
]

export default function OwnerBooking() {
  const { navigate, toast } = useNav()
  const viewingWalker = useSession((s) => s.viewingWalker)
  const pricing = useSession((s) => s.pricing)
  const instant = useSession((s) => s.instant)
  const duration = useSession((s) => s.duration)
  const recurring = useSession((s) => s.recurring)
  const storedDog = useSession((s) => s.dogId)
  const doc = useSession(ownerDocState)
  const walker = walkerById(viewingWalker)

  const [date, setDate] = useState(DEMO_SLOT_PICK.date)
  const [slot, setSlot] = useState(DEMO_SLOT_PICK.slot)
  const [note, setNote] = useState(DEMO_BOOKING.note)
  const [blocked, setBlocked] = useState(false)

  /* Sheru needs an Aggressive Breed Certified walker: otherwise Bruno stays selected */
  const dogId = storedDog === 'sheru' && !walker.certified ? 'bruno' : storedDog
  const dog = dogById(dogId)
  const q = quote(pricing, duration, dog.temperament, instant)
  const passFull = q.total * pricing.passWalks
  const passPrice = Math.round(passFull * (1 - pricing.passDiscountPct / 100))

  const pickDog = (id: string) => {
    if (id === 'sheru' && !walker.certified) {
      setBlocked(true)
      toast(`${walker.first} is not Aggressive Breed Certified`, 'warn')
      return
    }
    setBlocked(false)
    session.setDog(id)
  }

  const go = () => {
    DEMO_SLOT_PICK.date = date
    DEMO_SLOT_PICK.slot = slot
    session.set({ dogId, duration, instant, recurring, walkerId: viewingWalker })
    navigate('owner.checkout')
  }

  const rows: { key: string; label: string; sub?: string; amount: number; tone?: 'reactive' }[] = [
    { key: 'base', label: `Base fee, ${duration} min walk`, sub: pricing.surge > 1 ? `Includes ${pricing.surge}x busy-hour rate` : `${walker.first} · ${dog.name}`, amount: q.base },
    ...(q.surcharge > 0 ? [{ key: 'sur', label: 'Aggressive-dog handling', sub: 'Certified handler, muzzle and short-leash protocol', amount: q.surcharge, tone: 'reactive' as const }] : []),
    ...(q.instant > 0 ? [{ key: 'inst', label: 'Instant booking fee', sub: `Walk Now, walker in about ${walker.eta} min`, amount: q.instant }] : []),
    { key: 'gst', label: `GST at ${pricing.gstPct}%`, sub: `On ${inr(q.subtotal)}`, amount: q.gst },
  ]

  return (
    <MobileScreen
      header={<StepBar step={1} total={3} label="Book a walk" />}
      dockHeight={92}
      dock={
        <Dock>
          <span className="min-w-0 pl-3 leading-tight">
            <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-text-2">Total incl. GST</span>
            <motion.span key={q.total} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring.ui} className="block">
              <Price amount={q.total} size={30} />
            </motion.span>
          </span>
          <Button size="lg" block trailing={ArrowRight} onClick={go}>
            Continue to pay
          </Button>
        </Dock>
      }
    >
      {/* the chosen walker: a full-bleed photo strip */}
      <section className="relative mt-1 h-[124px] overflow-hidden">
        <img src={img(walker.cover, 900)} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 35%' }} />
        <div className="pointer-events-none absolute inset-0 bg-[rgb(10_18_56/0.66)]" />
        <span aria-hidden className="sun -right-12 -top-16 w-40" />
        <div className="relative flex h-full items-center gap-3.5 px-5 text-white">
          <Avatar who={walker.photo} size={64} ring verified />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="label text-sun-light">Your walker</p>
            <p className="grot mt-1 truncate text-[24px]">{walker.name}</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-semibold">
              <Stars rating={walker.rating} count={walker.reviews} tone="ink" size={12} />
              <span className="flex items-center gap-1">
                <MapPin size={12} strokeWidth={2.6} aria-hidden /> <span className="num">{walker.km} km</span>
              </span>
              {walker.certified && <Certified short tone="ink" />}
            </p>
          </div>
        </div>
      </section>

      {/* Walk Now / Schedule Later */}
      <div className="relative z-10 mx-4 -mt-4 rounded-[var(--r-container)] bg-[var(--surface)] p-2 shadow-[var(--shadow-floating)]">
        <div role="tablist" aria-label="When" className="grid grid-cols-2 gap-1.5">
          {(
            [
              { on: true, label: 'Walk Now', sub: `${walker.first} in about ${walker.eta} min`, icon: Zap },
              { on: false, label: 'Schedule Later', sub: 'Pick a day and slot', icon: CalendarClock },
            ] as const
          ).map((o) => {
            const sel = instant === o.on
            return (
              <motion.button key={o.label} role="tab" aria-selected={sel} type="button" whileTap={tap} transition={spring.ui} onClick={() => session.set({ instant: o.on })} className={`flex min-w-0 flex-col items-start gap-0.5 rounded-[20px] px-3.5 py-3 text-left transition-colors duration-150 ${sel ? 'bg-accent text-on-accent' : 'bg-[var(--surface-high)] text-text'}`}>
                <span className="flex items-center gap-1.5 whitespace-nowrap text-[15px] font-extrabold">
                  <o.icon size={16} strokeWidth={2.5} aria-hidden /> {o.label}
                </span>
                <span className={`w-full truncate text-[11px] font-semibold ${sel ? 'text-[var(--on-accent-2)]' : 'text-text-2'}`}>{o.sub}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!instant && (
          <motion.div key="later" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={spring.ui}>
            <p className="label mt-5 px-5 text-text-2">{monthLabel(date)} 2026 · {fmtDay(date)}</p>
            <Rail className="mt-2 pb-1" gap={8}>
              {DAYS.map((iso, i) => {
                const on = iso === date
                return (
                  <motion.button key={iso} type="button" whileTap={tap} transition={spring.ui} aria-pressed={on} onClick={() => setDate(iso)} className={`flex h-[74px] w-[58px] shrink-0 snap-start flex-col items-center justify-center rounded-[18px] ${on ? 'bg-ink text-on-ink' : 'bg-[var(--surface)] text-text shadow-[var(--shadow-raised)]'}`}>
                    <span className={`text-[11px] font-extrabold uppercase tracking-[0.06em] ${on ? 'text-sun-light' : 'text-text-2'}`}>{i === 0 ? 'Today' : dowLabel(iso)}</span>
                    <span className="figure mt-1 text-[26px]">{dayNum(iso)}</span>
                  </motion.button>
                )
              })}
            </Rail>
            <Rail className="mt-2.5 pb-1" gap={8}>
              {DEMO_SLOTS.map((t) => {
                const on = t === slot
                return (
                  <motion.button key={t} type="button" whileTap={tap} transition={spring.ui} aria-pressed={on} onClick={() => setSlot(t)} className={`num h-11 shrink-0 snap-start whitespace-nowrap rounded-full px-4 text-[14px] font-bold ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface)] text-text'}`} style={on ? undefined : { boxShadow: 'inset 0 0 0 1.5px var(--rule-strong)' }}>
                    {t}
                  </motion.button>
                )
              })}
            </Rail>
          </motion.div>
        )}
      </AnimatePresence>

      {/* dog picker */}
      <SectionHead className="mt-5" title="Who is walking?" action="Edit dog details" onAction={() => navigate('owner.dog')} />
      <div className="mt-2 grid grid-cols-2 gap-3 px-4">
        {DOGS.map((d) => {
          const on = d.id === dogId
          const review = d.id === 'sheru' && doc !== 'approved'
          return (
            <motion.button key={d.id} type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} aria-pressed={on} onClick={() => pickDog(d.id)} className="relative overflow-hidden rounded-[var(--r-card)] bg-[var(--surface)] text-left" style={{ boxShadow: on ? '0 0 0 3px var(--accent), var(--shadow-raised)' : 'var(--shadow-raised)' }}>
              <div className="relative aspect-[4/5]">
                <img src={img(d.photo, 480)} alt={`${d.name}, ${d.breed}`} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 20%' }} />
                <div className="scrim-b pointer-events-none absolute inset-0" />
                <TemperBadge t={d.temperament} solid className="absolute left-2 top-2" />
                <span className={`absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full ${on ? 'bg-accent text-on-accent' : 'bg-[rgb(255_255_255/0.85)] text-transparent'}`}>
                  <Check size={16} strokeWidth={3.2} aria-hidden />
                </span>
                <span className="absolute inset-x-3 bottom-2.5 text-white">
                  <span className="grot block text-[24px] leading-none">{d.name}</span>
                  <span className="mt-0.5 block truncate text-[12px] font-semibold">{d.breed} · {d.weight}</span>
                </span>
              </div>
              <span className={`flex h-8 items-center justify-center gap-1.5 px-2 text-[11px] font-extrabold ${review ? 'bg-warn-soft text-[var(--on-warn-soft)]' : 'bg-success-soft text-[var(--on-success-soft)]'}`}>
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                <span className="truncate">{review ? 'Bordetella under review' : 'Vaccines approved'}</span>
              </span>
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence initial={false}>
        {blocked && !walker.certified && (
          <motion.p key="blocked" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-4 mt-3 flex items-start gap-2 rounded-[var(--r-control)] bg-danger-soft p-3 text-[13px] font-semibold leading-snug text-[var(--on-danger-soft)]">
            <ShieldAlert size={17} strokeWidth={2.4} className="mt-0.5 shrink-0" aria-hidden />
            <span>Sheru is tagged Aggressive / Reactive and needs an Aggressive Breed Certified walker. {walker.first} is not certified, so Bruno stays selected.</span>
          </motion.p>
        )}
        {dogId === 'sheru' && (
          <motion.p key="sheru" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-4 mt-3 flex items-start gap-2 rounded-[var(--r-control)] bg-[var(--reactive-soft)] p-3 text-[13px] font-semibold leading-snug text-[var(--on-reactive-soft)]">
            <ShieldAlert size={17} strokeWidth={2.4} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              {walker.first} is Aggressive Breed Certified. A handling surcharge of {inr(pricing.reactiveSurcharge)} applies. {doc !== 'approved' ? 'Sheru’s Bordetella certificate is still under review.' : 'All of Sheru’s certificates are approved.'}
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* duration: three big blocks */}
      <SectionHead className="mt-5" title="How long?" />
      <div className="mt-2 grid grid-cols-3 gap-2.5 px-4">
        {DURATIONS.map(({ d, hint }) => {
          const on = d === duration
          return (
            <motion.button key={d} type="button" whileTap={tap} transition={spring.ui} aria-pressed={on} onClick={() => session.setDuration(d)} className={`relative flex flex-col items-start overflow-hidden rounded-[var(--r-card)] px-3 pb-3 pt-3.5 text-left ${on ? 'bg-sun text-on-sun shadow-[var(--glow-sun)]' : 'bg-[var(--surface)] text-text shadow-[var(--shadow-raised)]'}`}>
              {on && <span aria-hidden className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-[rgb(255_255_255/0.4)]" />}
              <span className="figure relative text-[40px]">{d}</span>
              <span className="relative text-[11px] font-extrabold uppercase tracking-[0.08em]">min</span>
              <span className="num relative mt-2 text-[15px] font-extrabold">{inr(Math.round(pricing.base[d] * pricing.surge))}</span>
              <span className={`relative truncate text-[11px] font-semibold ${on ? 'text-on-sun' : 'text-text-2'}`}>{hint}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Walk Pass: full-bleed royal blue band */}
      <section className="relative mt-6 overflow-hidden bg-accent px-5 py-5 text-on-accent">
        <span aria-hidden className="sun -right-[10%] -bottom-[96%] w-[34%]" />
        <div className="relative flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="label flex items-center gap-1.5 text-[var(--on-accent-2)]">
              <Ticket size={13} strokeWidth={2.6} aria-hidden /> Recurring walk package
            </p>
            <p className="grot mt-1.5 text-[23px] leading-[1.02]">
              Walk Pass: {pricing.passWalks} walks, {pricing.passDiscountPct}% off
            </p>
            <p className="num mt-1.5 text-[13px] font-semibold text-[var(--on-accent-2)]">
              {recurring ? `${inr(passPrice)} for the pass, you save ${inr(passFull - passPrice)}` : `Same walker, same slot. Save ${inr(passFull - passPrice)} a month.`}
            </p>
          </div>
          <span className="rounded-full bg-white p-[3px]">
            <Toggle on={recurring} onChange={(v) => session.set({ recurring: v })} label="Add the Walk Pass" tone="ink" />
          </span>
        </div>
      </section>

      {/* note for the walker */}
      <div className="mt-5 px-4">
        <TextArea label={`Note for ${walker.first}`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} hint="Shown on the walker's job card with the pickup pin." />
        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-text-2">
          <MapPin size={13} strokeWidth={2.4} className="shrink-0" aria-hidden />
          <span className="truncate">{WALK.pickup}</span>
        </p>
      </div>

      {/* the dynamic INR rate card */}
      <section className="relative mt-6 overflow-hidden bg-ink px-5 pb-6 pt-5 text-on-ink">
        <span aria-hidden className="sun -right-[18%] -top-[26%] w-[52%]" />
        <div className="relative">
          <p className="label flex items-center gap-1.5 text-sun-light">
            <ReceiptText size={13} strokeWidth={2.6} aria-hidden /> Rate card · live
          </p>
          <h2 className="grot mt-1.5 max-w-[62%] text-[26px]">What this walk costs</h2>
          <ul className="mt-4 flex flex-col">
            <AnimatePresence initial={false}>
              {rows.map((r) => (
                <motion.li key={r.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={spring.ui} className="flex items-start justify-between gap-3 py-2">
                  <span className="min-w-0 leading-tight">
                    <span className={`flex items-center gap-1.5 text-[15px] font-bold ${r.tone ? 'text-[#ffb4a8]' : ''}`}>
                      {r.tone && <ShieldAlert size={14} strokeWidth={2.6} aria-hidden />}
                      {r.label}
                    </span>
                    {r.sub && <span className="mt-0.5 block text-[12px] font-medium text-on-ink-2">{r.sub}</span>}
                  </span>
                  <motion.span key={r.amount} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="num shrink-0 text-[16px] font-extrabold">
                    {inr(r.amount)}
                  </motion.span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="perf-ink my-2" />
          <div className="flex items-end justify-between gap-3 pt-2">
            <span className="leading-tight">
              <span className="block text-[13px] font-bold text-on-ink-2">Total for this walk</span>
              <span className="num block text-[12px] font-medium text-on-ink-2">{instant ? 'Walk Now' : `${fmtDay(date)} · ${slot}`} · {duration} min · {dog.name}</span>
            </span>
            <motion.span key={q.total} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.pop}>
              <Price amount={q.total} size={44} swoosh tone="#fff" />
            </motion.span>
          </div>
          {recurring && (
            <p className="num mt-4 flex items-center gap-2 rounded-[var(--r-control)] bg-[rgb(255_255_255/0.1)] px-3 py-2.5 text-[13px] font-semibold">
              <Ticket size={15} strokeWidth={2.4} className="shrink-0 text-sun-light" aria-hidden />
              <span>
                Walk Pass on. Today you pay for this walk; the other {pricing.passWalks - 1} are billed at {pricing.passDiscountPct}% off.
              </span>
            </p>
          )}
          <p className="mt-3 text-[12px] font-medium text-on-ink-2">Rates are set by Vuffora for {walker.city}. No cash, no extra charges at the door.</p>
        </div>
      </section>
      <div className="h-3" />
    </MobileScreen>
  )
}
