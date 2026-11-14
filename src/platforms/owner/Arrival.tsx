import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ChevronLeft, DoorOpen, Headset, Loader2, MapPin, MessageCircle, Navigation } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Certified, Stars } from '../../components/Brand'
import { Button } from '../../components/Button'
import { MapCanvas } from '../../components/Map'
import { OtpPanel } from '../../components/Otp'
import { dogById, walkerById } from '../../data/cast'
import { APPROACH, HOME_PIN, WALK, stageAtLeast } from '../../data/core'
import { useNav } from '../../lib/navigation'
import { getSession, session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { SAFE_TOP } from '../mobileShell'

/* Pre-walk arrival tracker. The walker's marker runs the approach route
   to the pickup pin while the ETA chip counts down; the Check-In OTP is
   on screen from the start and turns Verified once the walker app (or the
   primary button) starts the walk. */

const START = 0.15
const TICK_MS = 500
const STEP = (1 - START) / (14000 / TICK_MS)

export default function OwnerArrival() {
  const { navigate, back, canGoBack, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const walkerId = useSession((s) => s.walkerId)
  const dogId = useSession((s) => s.dogId)
  const walker = walkerById(walkerId)
  const dog = dogById(dogId)

  const [tick, setTick] = useState(() => (stageAtLeast(getSession().stage, 'arrived') ? 1 : START))
  const [verifying, setVerifying] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const arrived = stageAtLeast(stage, 'arrived') || tick >= 1
  const walking = stageAtLeast(stage, 'walking')
  const progress = arrived ? 1 : tick
  const eta = Math.max(1, Math.ceil(((1 - progress) / (1 - START)) * walker.eta))

  useEffect(() => {
    session.advance('accepted')
    const t = window.setInterval(() => setTick((p) => Math.min(1, p + STEP)), TICK_MS)
    return () => {
      window.clearInterval(t)
      window.clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    if (tick >= 1) session.advance('arrived')
  }, [tick])

  const primary = () => {
    if (walking) return navigate('owner.live')
    if (!arrived) return toast(`${walker.first} is about ${eta} min away`, 'info')
    if (verifying) return
    setVerifying(true)
    timer.current = window.setTimeout(() => {
      session.advance('walking')
      navigate('owner.live')
    }, 1000)
  }

  const STEPS = [
    { label: 'Accepted', sub: `${walker.first} took the booking`, at: '7:41 am', done: true },
    { label: 'On the way', sub: `From ${walker.locality}, ${walker.km} km`, at: arrived ? '7:42 am' : `${eta} min`, done: true, now: !arrived },
    { label: 'At your gate', sub: WALK.gate, at: arrived ? 'Now' : '', done: arrived, now: arrived && !walking },
    { label: 'Walk started', sub: 'Check-In OTP verified', at: walking ? '8:02 am' : '', done: walking, now: walking },
  ]

  return (
    <div data-screen-root className="relative flex h-full w-full flex-col bg-[var(--bg)]">
      {/* the map */}
      <div aria-hidden className="shrink-0 bg-ink" style={{ height: SAFE_TOP }} />
      <MapCanvas className="h-[36%] min-h-[230px] w-full shrink-0" route={APPROACH} progress={progress} home={HOME_PIN} walker={{ photo: walker.photo, label: walker.first }}>
        <div className="absolute inset-x-0 top-0 z-10 flex items-start gap-2.5 px-4 pt-2.5">
          {canGoBack ? (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full text-text">
              <ChevronLeft size={24} strokeWidth={2.4} aria-hidden />
            </motion.button>
          ) : null}
          <div className="glass flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4" aria-live="polite">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${arrived ? 'bg-calm text-white' : 'bg-accent text-on-accent'}`}>{arrived ? <DoorOpen size={17} strokeWidth={2.5} aria-hidden /> : <Navigation size={16} strokeWidth={2.5} aria-hidden />}</span>
            {arrived ? (
              <span className="text-[15px] font-extrabold text-text">At your gate</span>
            ) : (
              <span className="flex items-baseline gap-1 text-text">
                <span className="figure num text-[26px]">{eta}</span>
                <span className="text-[13px] font-extrabold">min away</span>
              </span>
            )}
          </div>
        </div>
      </MapCanvas>

      {/* the sheet lapping the map */}
      <div className="relative z-10 -mt-7 flex min-h-0 flex-1 flex-col rounded-t-[28px] bg-[var(--surface)] shadow-[0_-14px_36px_-18px_rgb(14_27_87/0.35)]">
        <div className="flex shrink-0 justify-center pb-1 pt-2.5">
          <span className="h-[5px] w-10 rounded-full bg-[var(--paper-400)]" />
        </div>
        <main className="scroll-y min-h-0 flex-1 px-4" style={{ paddingBottom: 'calc(var(--safe-bottom, 34px) + var(--chrome-space, 0px) + 96px)' }}>
          {/* walker row */}
          <div className="flex items-center gap-3 pt-1">
            <Avatar who={walker.photo} size={54} ring verified />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[17px] font-extrabold">
                <span className="swoosh">{walker.first}</span> is {walking ? `walking ${dog.name}` : arrived ? 'at Gate 2' : 'on the way'}
              </p>
              <p className="mt-1.5 flex items-center gap-2">
                <Stars rating={walker.rating} count={walker.reviews} size={12} />
                {walker.certified && <Certified short />}
              </p>
            </div>
            <Button variant="paper" size="md" icon={MessageCircle} onClick={() => navigate('owner.chat')}>
              Chat
            </Button>
          </div>

          {/* pickup */}
          <div className="mt-3.5 flex items-start gap-2.5 rounded-[var(--r-control)] bg-[var(--surface-tint)] px-3 py-2.5">
            <MapPin size={17} strokeWidth={2.4} className="mt-0.5 shrink-0 text-accent-ink" aria-hidden />
            <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">
              {WALK.pickup}
              <span className="block font-bold text-accent-ink">{WALK.gate} · Booking {WALK.id}</span>
            </p>
          </div>

          {/* Check-In OTP */}
          <OtpPanel kind="in" code={WALK.checkInOtp} ttlMin={WALK.otpTtlMin} verified={walking} className="mt-4" />
          <p className="mt-2 px-1 text-[12px] font-semibold text-text-2">
            {walking ? `Custody of ${dog.name} is with ${walker.first}. The walk timer started at 8:02 am.` : `${walker.first} types this code on the walker app at your door. Until it matches, the walk cannot start.`}
          </p>

          {/* progress spine */}
          <ol className="relative mt-5">
            <span aria-hidden className="absolute bottom-7 left-[13px] top-3 w-[3px] rounded-full bg-[var(--surface-high)]" />
            {STEPS.map((st) => (
              <li key={st.label} className="relative flex items-start gap-3 pb-4">
                <span className={`relative z-10 grid h-[29px] w-[29px] shrink-0 place-items-center rounded-full ${st.done ? (st.now ? 'bg-accent text-on-accent' : 'bg-calm text-white') : 'bg-[var(--surface-high)] text-text-2'}`}>
                  {st.done && !st.now ? <Check size={15} strokeWidth={3.2} aria-hidden /> : <span className={`h-2.5 w-2.5 rounded-full bg-current ${st.now ? 'animate-pulse' : ''}`} />}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className={`block text-[15px] ${st.done ? 'font-extrabold text-text' : 'font-bold text-text-2'}`}>{st.label}</span>
                  <span className="block truncate text-[12px] font-semibold text-text-2">{st.sub}</span>
                </span>
                {st.at && <span className={`num shrink-0 pt-0.5 text-[12px] font-bold ${st.now ? 'text-accent-ink' : 'text-text-2'}`}>{st.at}</span>}
              </li>
            ))}
          </ol>

          <button type="button" onClick={() => navigate('owner.support')} className="mx-auto flex h-11 items-center gap-1.5 text-[13px] font-bold text-accent-ink">
            <Headset size={15} strokeWidth={2.4} aria-hidden /> Something wrong? Contact support
          </button>
        </main>
      </div>

      {/* dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4" style={{ paddingBottom: 'calc(var(--safe-bottom, 34px) - 6px + var(--chrome-space, 0px))' }}>
        <div data-dock className="glass pointer-events-auto flex items-center gap-2 rounded-[var(--r-container)] p-2">
          <Button size="lg" block variant={!arrived && !walking ? 'ink' : 'accent'} trailing={walking ? ArrowRight : undefined} onClick={primary} aria-busy={verifying}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={walking ? 'w' : verifying ? 'v' : arrived ? 'a' : 'p'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.08 } }} className="flex items-center gap-2">
                {walking ? (
                  'Watch the live walk'
                ) : verifying ? (
                  <>
                    <Loader2 size={18} strokeWidth={2.6} className="animate-spin" aria-hidden /> {walker.first} is entering the code
                  </>
                ) : arrived ? (
                  'I’ve shared the OTP'
                ) : (
                  <>
                    <Loader2 size={18} strokeWidth={2.6} className="animate-spin" aria-hidden /> Waiting for {walker.first}
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  )
}
