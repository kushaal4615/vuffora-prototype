import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BellRing, Check, ChevronRight, Download, KeyRound, Loader2, MapPinned, MessageCircle, Radio } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Price, Stub, TemperBadge } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Confetti } from '../../components/Confetti'
import { dogById, walkerById } from '../../data/cast'
import { inr } from '../../data/clock'
import { WALK, stageAtLeast } from '../../data/core'
import { slotLabel } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { currentQuote, session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { Dock, MobileScreen, safeTop } from '../mobileShell'

/* The success moment. Royal-blue top with the sun disc and a check that
   draws itself, the booking ticket lapping it, the walker's live answer,
   the chat that just unlocked and what happens next. */

const PAY_LABEL: Record<string, string> = { gpay: 'UPI · GPay', phonepe: 'UPI · PhonePe', paytm: 'UPI · Paytm', card: 'Visa card ending 1111', netbanking: 'Net banking' }

export default function OwnerConfirmed() {
  const { navigate, reset, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const walkerId = useSession((s) => s.walkerId)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const instant = useSession((s) => s.instant)
  const payMethod = useSession((s) => s.payMethod)
  const total = useSession((s) => currentQuote(s).total)
  const gst = useSession((s) => currentQuote(s).gst)
  const walker = walkerById(walkerId)
  const dog = dogById(dogId)
  const accepted = stageAtLeast(stage, 'accepted')

  /* the request goes out, then the walker accepts about two seconds later */
  useEffect(() => {
    session.advance('requested')
    const t = window.setTimeout(() => session.advance('accepted'), 2000)
    return () => window.clearTimeout(t)
  }, [])

  const [burst] = useState(() => Date.now())

  const NEXT = [
    { icon: MapPinned, title: 'Arrival tracking', body: `Watch ${walker.first} come to Gate 2 on the map, with a live ETA.`, when: instant ? `In about ${walker.eta} min` : 'From 7:50 am' },
    { icon: KeyRound, title: 'Check-In OTP at the door', body: `Read the 4-digit code to ${walker.first}. The walk cannot start without it.`, when: WALK.slot },
    { icon: Radio, title: 'Live walk', body: `Route, timer, potty and water logs and photos of ${dog.name}, then a Check-Out OTP at drop-off.`, when: `${duration} min` },
  ]

  return (
    <MobileScreen
      cap="var(--accent)"
      dockHeight={92}
      dock={
        <Dock>
          <Button variant="ghost" size="lg" className="!px-4" onClick={() => reset('owner.home')}>
            Back to home
          </Button>
          <Button size="lg" block trailing={ArrowRight} onClick={() => navigate('owner.arrival')}>
            Track {walker.first}
          </Button>
        </Dock>
      }
    >
      <Confetti key={burst} origin={0.2} />

      {/* royal-blue top */}
      <section className="relative overflow-hidden bg-accent px-5 pb-20 text-center text-on-accent" style={{ paddingTop: safeTop(22) }}>
        <span aria-hidden className="sun -right-[22%] -top-[26%] w-[50%]" />
        <span aria-hidden className="dots-light" />
        <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.pop} className="relative mx-auto grid h-[84px] w-[84px] place-items-center rounded-full bg-white shadow-[var(--shadow-floating)]">
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden>
            <motion.path d="M10 24 L20 33 L37 14" stroke="var(--accent)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.25, ease: [0.23, 1, 0.32, 1] }} />
          </svg>
        </motion.div>
        <h1 className="grot relative mt-4 text-[clamp(30px,9vw,36px)]">Booking confirmed</h1>
        <p className="relative mx-auto mt-2 max-w-[30ch] text-[14px] font-semibold text-[var(--on-accent-2)]">
          {inr(total)} paid. {dog.name}’s walk with {walker.first} is locked in.
        </p>
      </section>

      {/* ticket */}
      <Stub
        className="relative z-10 mx-4 -mt-14"
        top={
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="leading-tight">
                <span className="label block text-text-2">Booking ID</span>
                <span className="figure num block text-[26px]">{WALK.id}</span>
              </span>
              <span className="flex items-center">
                <img src={img(dog.photo, 160)} alt={dog.name} className="h-12 w-12 rounded-full object-cover ring-[3px] ring-[var(--surface)]" style={{ objectPosition: '50% 20%' }} />
                <span className="-ml-3 rounded-full ring-[3px] ring-[var(--surface)]">
                  <Avatar who={walker.photo} size={48} />
                </span>
              </span>
            </div>
            <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
              <div className="min-w-0">
                <dt className="label text-text-2">Walker</dt>
                <dd className="mt-0.5 truncate font-extrabold">{walker.name}</dd>
              </div>
              <div className="min-w-0">
                <dt className="label text-text-2">Dog</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-extrabold">
                  <span className="truncate">{dog.name}</span> <TemperBadge t={dog.temperament} />
                </dd>
              </div>
              <div className="col-span-2 min-w-0">
                <dt className="label text-text-2">Slot</dt>
                <dd className="num mt-0.5 truncate font-extrabold">
                  {slotLabel(instant, walker.eta)} · {duration} min
                </dd>
              </div>
            </dl>
          </div>
        }
        bottom={
          <div className="flex items-end justify-between gap-3">
            <span className="min-w-0 leading-tight">
              <span className="label block text-text-2">Amount paid</span>
              <Price amount={total} size={34} swoosh />
              <span className="num mt-1.5 block truncate text-[12px] font-semibold text-text-2">
                {PAY_LABEL[payMethod] ?? 'UPI'} · incl. {inr(gst)} GST
              </span>
            </span>
            <Button variant="outline" size="sm" icon={Download} onClick={() => toast(`Invoice ${WALK.invoice} saved to Downloads`, 'accent')}>
              GST invoice
            </Button>
          </div>
        }
      />

      {/* live status line */}
      <div className="mx-4 mt-4 flex min-h-[60px] items-center gap-3 rounded-full bg-[var(--surface)] py-2 pl-2 pr-4 shadow-[var(--shadow-raised)]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {accepted ? (
            <motion.span key="ok" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.pop} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-calm text-white">
              <Check size={22} strokeWidth={3} aria-hidden />
            </motion.span>
          ) : (
            <motion.span key="wait" exit={{ opacity: 0, transition: { duration: 0.1 } }} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-warn-soft text-[var(--on-warn-soft)]">
              <Loader2 size={20} strokeWidth={2.6} className="animate-spin" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[15px] font-extrabold">{accepted ? `${walker.first} accepted` : `Request sent to ${walker.first}`}</span>
          <span className="block truncate text-[12px] font-semibold text-text-2">{accepted ? `Getting ready to leave ${walker.locality}` : 'Waiting for the walker to accept'}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.06em] text-text-2">
          <BellRing size={13} strokeWidth={2.5} aria-hidden /> Push on
        </span>
      </div>

      {/* chat unlocked: yellow band */}
      <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate('owner.chat')} className="relative mt-5 flex w-full items-center gap-3.5 overflow-hidden bg-sun px-5 py-4 text-left text-on-sun">
        <span aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-[rgb(255_255_255/0.32)]" />
        <span className="relative rounded-full ring-[3px] ring-white">
          <Avatar who={walker.photo} size={52} />
        </span>
        <span className="relative min-w-0 flex-1 leading-tight">
          <span className="label flex items-center gap-1.5">
            <MessageCircle size={13} strokeWidth={2.7} aria-hidden /> Chat unlocked
          </span>
          <span className="mt-1 block text-[17px] font-extrabold">Message {walker.first}</span>
          <span className="block truncate text-[13px] font-semibold">In-app only. Numbers stay private.</span>
        </span>
        <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-on-ink">
          <ChevronRight size={20} strokeWidth={2.6} aria-hidden />
        </span>
      </motion.button>

      {/* what happens next: timeline with a spine */}
      <h2 className="grot mt-6 px-5 text-[22px]">What happens next</h2>
      <motion.ol variants={listParent} initial="hidden" animate="show" className="relative mt-3 px-5">
        <span aria-hidden className="absolute bottom-6 left-[41px] top-4 w-[3px] rounded-full bg-[var(--accent-soft)]" />
        {NEXT.map((n, i) => (
          <motion.li key={n.title} variants={listItem} className="relative flex gap-3.5 pb-5">
            <span className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full ${i === 0 ? 'bg-accent text-on-accent' : 'bg-[var(--surface)] text-accent-ink shadow-[var(--shadow-raised)]'}`}>
              <n.icon size={19} strokeWidth={2.3} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 leading-snug">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-extrabold">{n.title}</span>
                <span className="num shrink-0 text-[12px] font-bold text-accent-ink">{n.when}</span>
              </span>
              <span className="mt-0.5 block text-[13px] font-medium text-text-2">{n.body}</span>
            </span>
          </motion.li>
        ))}
      </motion.ol>
    </MobileScreen>
  )
}
