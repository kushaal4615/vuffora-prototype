import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowUp, BellRing, ChevronLeft, CornerUpLeft, CornerUpRight, EyeOff, Flag, KeyRound, LifeBuoy, MessageCircle, Navigation } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { TemperBadge } from '../../components/Brand'
import { Button } from '../../components/Button'
import { MapCanvas } from '../../components/Map'
import { OWNER, WALKER_ME, dogById } from '../../data/cast'
import { APPROACH, HOME_PIN, WALK, stageAtLeast } from '../../data/core'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { getSession, session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { SAFE_TOP } from '../mobileShell'

/* Turn-by-turn pickup. An ink next-turn strip on top, the drawn map with
   Arjun moving along the approach route, the one-tap Google Maps deep
   link floating on it, and a white panel with the owner, the exact
   address (shown only now that the job is accepted) and the arrival
   button. Once he taps it the panel asks for the Check-In OTP. */

const TURNS = [
  { until: 0.12, icon: CornerUpLeft, dist: 'In 300 m', text: 'turn left at Phase 7 lights' },
  { until: 0.36, icon: CornerUpRight, dist: 'In 250 m', text: 'turn right onto City Park Road' },
  { until: 0.62, icon: CornerUpLeft, dist: 'In 400 m', text: 'turn left at the Sector 70 crossing' },
  { until: 0.86, icon: CornerUpRight, dist: 'In 200 m', text: 'turn right into the Homeland Heights lane' },
  { until: 0.995, icon: ArrowUp, dist: 'In 80 m', text: 'Gate 2 is on your left' },
  { until: 2, icon: Flag, dist: 'You have arrived', text: 'Gate 2, Tower B lobby' },
]

export default function WalkerPickup() {
  const { navigate, back, canGoBack, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const dogId = useSession((s) => s.dogId)
  const dog = dogById(dogId)
  const arrived = stageAtLeast(stage, 'arrived')
  const [progress, setProgress] = useState(() => (stageAtLeast(getSession().stage, 'arrived') ? 1 : 0.1))

  useEffect(() => {
    session.advance('accepted')
  }, [])

  useEffect(() => {
    if (arrived) {
      setProgress(1)
      return
    }
    const t = window.setInterval(() => setProgress((p) => Math.min(1, p + 0.045)), 600)
    return () => window.clearInterval(t)
  }, [arrived])

  const turn = TURNS.find((t) => progress < t.until) ?? TURNS[TURNS.length - 1]
  const kmLeft = Math.max(0, WALKER_ME.km * (1 - progress))
  const minLeft = Math.max(0, Math.ceil(WALKER_ME.eta * (1 - progress)))

  return (
    <div data-screen-root className="relative flex h-full flex-col bg-[var(--bg)]">
      {/* next-turn strip */}
      <header className="relative z-20 shrink-0 bg-ink text-on-ink" style={{ paddingTop: SAFE_TOP }}>
        <div className="flex items-center gap-2 px-2 pb-3 pt-1">
          {canGoBack ? (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="grid h-11 w-9 shrink-0 place-items-center rounded-full">
              <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
            </motion.button>
          ) : (
            <span className="w-2" />
          )}
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[var(--r-control)] bg-sun text-on-sun">
            <turn.icon size={30} strokeWidth={2.6} aria-hidden />
          </span>
          <div className="min-w-0 flex-1 leading-tight" aria-live="polite">
            <p className="grot num text-[24px]">{turn.dist}</p>
            <p className="truncate text-[13px] font-bold text-on-ink-2">{turn.text}</p>
          </div>
          <div className="shrink-0 pr-2 text-right leading-tight">
            <p className="figure num text-[24px] text-sun-light">{minLeft} min</p>
            <p className="num text-[12px] font-bold text-on-ink-2">{kmLeft.toFixed(1)} km</p>
          </div>
        </div>
      </header>

      <MapCanvas className="min-h-0 flex-1" route={APPROACH} progress={progress} walker={{ photo: WALKER_ME.photo, label: 'You' }} home={HOME_PIN}>
        {/* the one-tap deep link */}
        <div className="absolute inset-x-3 top-3 z-[6]">
          <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => toast('Opening Google Maps with the pin for Homeland Heights, Sector 70', 'accent')} className="flex h-[58px] w-full items-center gap-3 rounded-full bg-accent pl-2 pr-5 text-left text-on-accent shadow-[var(--glow-accent)]">
            <span className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full bg-white text-accent-ink">
              <Navigation size={21} strokeWidth={2.5} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[16px] font-extrabold">Open in Google Maps</span>
              <span className="block truncate text-[12px] font-semibold text-[var(--on-accent-2)]">Turn-by-turn to the pin at Homeland Heights</span>
            </span>
            <ArrowRight size={20} strokeWidth={2.6} aria-hidden />
          </motion.button>
        </div>
      </MapCanvas>

      {/* bottom panel */}
      <section data-dock className="relative z-10 -mt-6 shrink-0 rounded-t-[var(--r-container)] bg-[var(--surface)] px-5 pt-4 shadow-[0_-14px_36px_-16px_rgb(14_27_87/0.3)]" style={{ paddingBottom: 'calc(var(--safe-bottom, 34px) - 12px)' }}>
        <div className="flex items-center gap-3">
          <Avatar who={OWNER.photo} size={48} ring />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[17px] font-extrabold">{OWNER.name}</p>
            <p className="flex items-center gap-1 text-[12px] font-semibold text-text-2">
              <EyeOff size={12} strokeWidth={2.6} aria-hidden /> Calls and numbers stay private
            </p>
          </div>
          <Button variant="paper" icon={MessageCircle} onClick={() => navigate('walker.chat')}>
            Chat
          </Button>
        </div>

        <div className="mt-3.5 flex items-start gap-3">
          <img src={img(dog.photo, 160)} alt={`${dog.name}, ${dog.breed}`} className="h-12 w-12 shrink-0 rounded-[var(--r-control)] object-cover" style={{ objectPosition: '50% 20%' }} />
          <div className="min-w-0 flex-1 leading-snug">
            <p className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold">{dog.name}</span>
              <TemperBadge t={dog.temperament} />
              <span className="num truncate text-[12px] font-semibold text-text-2">{WALK.slot}</span>
            </p>
            <p className="mt-0.5 text-[13px] font-bold">{WALK.pickup}</p>
            <p className="text-[13px] font-semibold text-accent-ink">{WALK.gate}. The guard has your name.</p>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {arrived ? (
            <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.ui} className="mt-4">
              <div className="relative flex h-11 items-center gap-2.5 overflow-hidden rounded-full bg-sun px-4 text-on-sun">
                <span aria-hidden className="pointer-events-none absolute -right-6 -top-10 h-24 w-24 rounded-full bg-[rgb(255_255_255/0.35)]" />
                <KeyRound size={19} strokeWidth={2.5} className="relative shrink-0" aria-hidden />
                <p className="relative truncate text-[14px] font-extrabold">Ask {OWNER.first} for the Check-In OTP</p>
              </div>
              <Button size="lg" block trailing={ArrowRight} className="mt-3 w-full" onClick={() => navigate('walker.otp')}>
                Enter Check-In OTP
              </Button>
            </motion.div>
          ) : (
            <motion.div key="go" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.ui} className="mt-4">
              <div className="flex h-11 items-center gap-2.5 rounded-full bg-accent-soft px-4 text-[var(--on-accent-soft)]">
                <BellRing size={18} strokeWidth={2.5} className="shrink-0" aria-hidden />
                <p className="truncate text-[13px] font-extrabold">{OWNER.first} is notified the moment you arrive</p>
              </div>
              <Button size="lg" block icon={Flag} className="mt-3 w-full" onClick={() => { session.advance('arrived'); toast(`${OWNER.first} has been told you are at the gate`, 'accent') }}>
                I’ve arrived at the gate
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="button" onClick={() => navigate('walker.support')} className="mx-auto flex h-11 items-center gap-1.5 text-[13px] font-extrabold text-accent-ink">
          <LifeBuoy size={15} strokeWidth={2.4} aria-hidden /> Can’t find the address? Support
        </button>
      </section>
    </div>
  )
}
