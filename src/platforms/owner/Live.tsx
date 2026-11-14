import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BellRing, Camera, ChevronLeft, ChevronRight, Droplets, Flag, Footprints, GlassWater, Headset, KeyRound, Leaf, MapPin, MessageCircle, NotebookPen, PhoneCall, Siren, UserRound, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Bar } from '../../components/Brand'
import { Button } from '../../components/Button'
import { MapCanvas } from '../../components/Map'
import { OtpPanel } from '../../components/Otp'
import { BottomSheet } from '../../components/Sheet'
import { dogById, walkerById } from '../../data/cast'
import { mmss } from '../../data/clock'
import { HOME_PIN, LOG_LABEL, ROUTE, WALK, type LogKind } from '../../data/core'
import { DEMO_OWNER_PROFILE } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { getSession, session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { SAFE_TOP, safeTop } from '../mobileShell'

/* Live walk telemetry. Map with the route travelled, the countdown,
   distance and steps, the activity log as a timeline (the walker app adds
   to it), a push-style banner for each new log, the SOS sheet, and the
   Check-Out OTP once the walker is nearly home. */

const START = 0.5
const TICK_MS = 500
const STEP = (1 - START) / (45000 / TICK_MS)

const LOG_ICON: Record<LogKind, LucideIcon> = { start: KeyRound, pee: Droplets, poop: Leaf, water: GlassWater, photo: Camera, note: NotebookPen, end: Flag }
const LOG_TONE: Record<LogKind, string> = {
  start: 'bg-accent text-on-accent',
  pee: 'bg-sun text-on-sun',
  poop: 'bg-[var(--calm-soft)] text-[var(--on-calm-soft)]',
  water: 'bg-accent-soft text-[var(--on-accent-soft)]',
  photo: 'bg-ink text-on-ink',
  note: 'bg-[var(--surface-high)] text-text',
  end: 'bg-calm text-white',
}

export default function OwnerLive() {
  const { navigate, back, canGoBack, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const walkerId = useSession((s) => s.walkerId)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const logs = useSession((s) => s.logs)
  const sos = useSession((s) => s.sos)
  const walker = walkerById(walkerId)
  const dog = dogById(dogId)

  const ended = stage === 'ended' || stage === 'reviewed'
  const [tick, setTick] = useState(START)
  const [sheet, setSheet] = useState(false)
  const [banner, setBanner] = useState<{ id: string; title: string; text: string } | null>(null)
  const seen = useRef(logs.length)
  const bannerTimer = useRef<number | undefined>(undefined)

  const progress = ended ? 1 : tick
  const totalSec = duration * 60
  const left = Math.round((1 - progress) * totalSec)
  const km = progress * WALK.plannedKm
  const steps = Math.round(km * 1312)
  const nearHome = progress > 0.85 || ended

  useEffect(() => {
    session.advance('walking')
    const t = window.setInterval(() => setTick((p) => Math.min(1, p + STEP)), TICK_MS)
    /* if the walker app is not being driven, one photo check-in still arrives */
    const photo = window.setTimeout(() => {
      const s = getSession()
      if (s.stage === 'walking' && !s.logs.some((l) => l.photo === 'runGrass')) session.addLog('photo', `${dogById(s.dogId).name} on the grass stretch, tail up.`, 'runGrass')
    }, 20000)
    return () => {
      window.clearInterval(t)
      window.clearTimeout(photo)
      window.clearTimeout(bannerTimer.current)
    }
  }, [])

  /* push-style banner for each log that arrives while the screen is open */
  useEffect(() => {
    if (logs.length > seen.current) {
      const l = logs[logs.length - 1]
      setBanner({ id: l.id, title: LOG_LABEL[l.kind], text: l.text })
      window.clearTimeout(bannerTimer.current)
      bannerTimer.current = window.setTimeout(() => setBanner(null), 3000)
    }
    seen.current = logs.length
  }, [logs])

  const raise = (msg: string) => {
    session.setSos(true)
    setSheet(false)
    toast(msg, 'danger')
  }
  const finish = () => {
    session.advance('ended')
    navigate('owner.review')
  }

  const ordered = [...logs].reverse()
  const phase = ended ? `${dog.name} is home` : nearHome ? `${walker.first} is at your gate` : progress > 0.7 ? `${walker.first} is heading back` : `${dog.name} is on the park loop`

  return (
    <div data-screen-root className="relative flex h-full w-full flex-col bg-[var(--bg)]">
      {/* map */}
      <div aria-hidden className="shrink-0 bg-ink" style={{ height: SAFE_TOP }} />
      <MapCanvas className="h-[33%] min-h-[220px] w-full shrink-0" route={ROUTE} progress={progress} home={HOME_PIN} walker={{ photo: walker.photo, label: walker.first }}>
        <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 px-4 pt-2.5">
          {canGoBack ? (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full text-text">
              <ChevronLeft size={24} strokeWidth={2.4} aria-hidden />
            </motion.button>
          ) : null}
          <span className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-extrabold uppercase tracking-[0.1em] shadow-[var(--shadow-raised)] ${ended ? 'bg-calm text-white' : 'bg-white text-text'}`}>
            <span aria-hidden className={`h-2 w-2 rounded-full ${ended ? 'bg-white' : 'animate-pulse bg-danger'}`} />
            {ended ? 'Closed' : 'Live'}
          </span>
        </div>
        <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => setSheet(true)} aria-label="SOS, emergency help" className="absolute bottom-10 right-4 z-10 flex h-12 items-center gap-1.5 rounded-full bg-danger px-4 text-[14px] font-extrabold tracking-[0.06em] text-white shadow-[0_8px_22px_-8px_rgb(200_60_50/0.8)] ring-[3px] ring-white">
          <Siren size={18} strokeWidth={2.5} aria-hidden /> SOS
        </motion.button>
      </MapCanvas>

      {/* sheet */}
      <div className="relative z-10 -mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px] bg-[var(--bg)] shadow-[0_-14px_36px_-18px_rgb(14_27_87/0.35)]">
        <main className="scroll-y min-h-0 flex-1" style={{ paddingBottom: 'calc(var(--safe-bottom, 34px) + var(--chrome-space, 0px) + 100px)' }}>
          {/* stat strip */}
          <section className="relative overflow-hidden bg-ink px-5 pb-5 pt-5 text-on-ink">
            <span aria-hidden className="sun -right-[16%] -top-[70%] w-[46%]" />
            <div className="relative flex items-center gap-2.5">
              <Avatar who={walker.photo} size={34} ring />
              <p className="min-w-0 flex-1 truncate text-[15px] font-extrabold">{phase}</p>
              <Button variant="white" size="sm" icon={MessageCircle} onClick={() => navigate('owner.chat')}>
                Chat
              </Button>
            </div>
            <div className="relative mt-4 grid grid-cols-[1.25fr_1fr_1fr] items-end gap-3">
              <div className="min-w-0">
                <p className="label text-sun-light">Time left</p>
                <p className="figure num mt-1 text-[clamp(40px,12.5vw,50px)]" aria-live="off">
                  {mmss(left)}
                </p>
                <p className="num mt-1 text-[11px] font-semibold text-on-ink-2">of {duration}:00 · demo speed</p>
              </div>
              <div className="min-w-0">
                <p className="label text-on-ink-2">Distance</p>
                <p className="figure num mt-1 text-[30px]">
                  {km.toFixed(2)}
                  <span className="unit">km</span>
                </p>
                <p className="num mt-1 text-[11px] font-semibold text-on-ink-2">of {WALK.plannedKm} km</p>
              </div>
              <div className="min-w-0">
                <p className="label text-on-ink-2">Steps</p>
                <p className="figure num mt-1 text-[30px]">{steps.toLocaleString('en-IN')}</p>
                <p className="num mt-1 flex items-center gap-1 text-[11px] font-semibold text-on-ink-2">
                  <Footprints size={11} aria-hidden /> 4.1 km/h
                </p>
              </div>
            </div>
            <Bar value={progress * 100} tone="sun" height={6} className="relative mt-4" track="rgb(255 255 255 / 0.16)" />
          </section>

          {/* SOS banner */}
          <AnimatePresence initial={false}>
            {sos && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5 bg-danger px-5 py-3 text-white" role="alert">
                <Siren size={19} strokeWidth={2.5} className="shrink-0" aria-hidden />
                <p className="min-w-0 flex-1 text-[14px] font-extrabold leading-tight">SOS raised, support is on the line</p>
                <button type="button" onClick={() => { session.setSos(false); toast('SOS closed. Glad everything is fine.', 'neutral') }} className="h-11 shrink-0 rounded-full bg-white px-3.5 text-[12px] font-extrabold text-danger-text">
                  I’m okay
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Check-Out OTP */}
          <AnimatePresence initial={false}>
            {nearHome && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={spring.sheet} className="px-4 pt-4">
                <OtpPanel kind="out" code={WALK.checkOutOtp} ttlMin={WALK.otpTtlMin} verified={ended} />
                <p className="mt-2 px-1 text-[12px] font-semibold text-text-2">
                  {ended ? `Session closed. ${walker.first}’s payout is released after your review.` : `Read this to ${walker.first} only when ${dog.name} is back inside. It closes the session and stops the timer.`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* activity log */}
          <div className="flex items-end justify-between gap-3 px-5 pt-5">
            <h2 className="grot text-[22px]">Activity log</h2>
            <span className="num pb-0.5 text-[12px] font-bold text-text-2">{logs.length} updates from {walker.first}</span>
          </div>
          <ol className="relative mt-3 px-5">
            <span aria-hidden className="absolute bottom-6 left-[39px] top-3 w-[3px] rounded-full bg-[var(--accent-soft)]" />
            <AnimatePresence initial={false}>
              {ordered.map((l) => {
                const Icon = LOG_ICON[l.kind]
                return (
                  <motion.li key={l.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring.ui} className="relative flex gap-3.5 pb-4">
                    <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ring-4 ring-[var(--bg)] ${LOG_TONE[l.kind]}`}>
                      <Icon size={18} strokeWidth={2.3} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 leading-snug">
                      <p className="flex items-baseline justify-between gap-2">
                        <span className="text-[15px] font-extrabold">{LOG_LABEL[l.kind]}</span>
                        <span className="num shrink-0 text-[12px] font-bold text-text-2">{l.at}</span>
                      </p>
                      <p className="mt-0.5 text-[13px] font-medium text-text-2">{l.text}</p>
                      {l.photo && (
                        <span className="relative mt-2 block overflow-hidden rounded-[var(--r-control)]">
                          <img src={img(l.photo, 560)} alt={`Photo from the walk: ${l.text}`} className="block aspect-[16/9] w-full object-cover" />
                          <span className="num absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-[rgb(10_18_56/0.72)] px-2 py-1 text-[11px] font-bold text-white">
                            <MapPin size={11} strokeWidth={2.6} aria-hidden /> {(l.t * WALK.plannedKm).toFixed(1)} km in
                          </span>
                        </span>
                      )}
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ol>

          <button type="button" onClick={() => navigate('owner.support')} className="mx-auto flex h-11 items-center gap-1.5 text-[13px] font-bold text-accent-ink">
            <Headset size={15} strokeWidth={2.4} aria-hidden /> Report a problem
          </button>
        </main>
      </div>

      {/* push-notification banner */}
      <AnimatePresence>
        {banner && (
          <motion.div key={banner.id} role="status" initial={{ y: -90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -90, opacity: 0, transition: { duration: 0.18 } }} transition={spring.sheet} className="pointer-events-none absolute inset-x-3 z-30" style={{ top: safeTop(4) }}>
            <div className="glass flex items-center gap-3 rounded-[22px] p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-sun text-on-sun">
                <BellRing size={19} strokeWidth={2.4} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-extrabold text-text">Vuffora · {banner.title}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-text-2">now</span>
                </span>
                <span className="mt-0.5 block truncate text-[13px] font-medium text-text-2">{banner.text}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4" style={{ paddingBottom: 'calc(var(--safe-bottom, 34px) - 6px + var(--chrome-space, 0px))' }}>
        <div data-dock className="glass pointer-events-auto flex items-center gap-2 rounded-[var(--r-container)] p-2">
          {nearHome ? (
            <Button size="lg" block trailing={ArrowRight} onClick={finish}>
              {ended ? 'Rate the walk' : 'I’ve shared the Check-Out OTP'}
            </Button>
          ) : (
            <button type="button" onClick={() => toast(`${phase}. The Check-Out OTP appears when ${walker.first} is near your gate.`, 'info')} className="flex h-[56px] min-w-0 flex-1 items-center gap-3 rounded-full bg-ink pl-2 pr-5 text-left text-on-ink">
              <Avatar who={walker.photo} size={40} />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[14px] font-extrabold">{phase}</span>
                <Bar value={((progress - START) / (0.85 - START)) * 100} tone="sun" height={5} className="mt-1.5" track="rgb(255 255 255 / 0.18)" />
              </span>
              <span className="num shrink-0 text-[12px] font-bold text-sun-light">OTP soon</span>
            </button>
          )}
        </div>
      </div>

      {/* SOS sheet */}
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Emergency help">
        <p className="text-[14px] font-medium text-text-2">
          Use this if {dog.name} or {walker.first} is in danger. Support sees the live location and both phone numbers straight away.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {[
            { icon: PhoneCall, title: 'Call Vuffora support', sub: '24x7 safety desk, answers in under 30 seconds', msg: 'Calling the Vuffora safety desk. SOS raised.', solid: true },
            { icon: UserRound, title: `Alert emergency contact: ${DEMO_OWNER_PROFILE.emergencyName}`, sub: `SMS and call to ${DEMO_OWNER_PROFILE.emergencyPhone}`, msg: `${DEMO_OWNER_PROFILE.emergencyName} has been alerted with the live location.`, solid: false },
            { icon: MapPin, title: 'Share live location', sub: 'A tracking link valid until the walk is closed', msg: 'Live location link shared with support.', solid: false },
          ].map((o) => (
            <li key={o.title}>
              <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => raise(o.msg)} className={`flex min-h-[64px] w-full items-center gap-3 rounded-[var(--r-card)] px-4 py-3 text-left ${o.solid ? 'bg-danger text-white' : 'bg-danger-soft text-[var(--on-danger-soft)]'}`}>
                <o.icon size={22} strokeWidth={2.3} className="shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[15px] font-extrabold">{o.title}</span>
                  <span className="mt-0.5 block text-[12px] font-semibold">{o.sub}</span>
                </span>
                <ChevronRight size={18} strokeWidth={2.6} className="shrink-0" aria-hidden />
              </motion.button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  )
}
