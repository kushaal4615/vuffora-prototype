import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, Check, ChevronRight, Clock3, EyeOff, FileWarning, MapPin, MessageCircle, Navigation, Radio, Route, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Price, StatusPill, TemperBadge } from '../../components/Brand'
import { BarStrip, Sparkline } from '../../components/Charts'
import { OWNER, WALKER_ACCOUNT, WALKER_ME, dogById } from '../../data/cast'
import { inr } from '../../data/clock'
import { WALK, quote, stageAtLeast } from '../../data/core'
import { img } from '../../data/media'
import { HOURS_ONLINE, ONLINE_SINCE, TODAY_JOBS, TODAY_SPARK, YESTERDAY_BY_NOW } from '../../data/walkerData'
import { useNav } from '../../lib/navigation'
import { session, useSession, walkerDocState } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, SectionHead, safeTop } from '../mobileShell'

/* Today, the home of the Dog Walker App. Royal-blue hero with the big
   Online / Offline switch and today's net earnings; the incoming job
   request laps the hero; the day's jobs run down a timeline with a spine;
   an ink band closes with the week. */

/** Big two-state switch: yellow when online, the knob carries the state. */
function OnlineSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Online" onClick={() => onChange(!on)} className="relative h-[56px] w-[148px] shrink-0 rounded-full transition-colors duration-200" style={{ background: on ? 'var(--sun)' : 'rgb(10 18 56 / 0.55)', boxShadow: on ? 'var(--glow-sun)' : 'inset 0 0 0 1.5px rgb(255 255 255 / 0.35)' }}>
      <span className={`absolute top-1/2 -translate-y-1/2 text-[15px] font-extrabold ${on ? 'left-5 text-on-sun' : 'right-4 text-white'}`}>{on ? 'Online' : 'Offline'}</span>
      <motion.span className="absolute left-0 top-[5px] grid h-[46px] w-[46px] place-items-center rounded-full bg-white text-text shadow-[0_3px_10px_rgb(10_18_56/0.35)]" initial={false} animate={{ x: on ? 97 : 5 }} transition={spring.ui}>
        {on ? <Radio size={20} strokeWidth={2.4} className="text-accent-ink" aria-hidden /> : <EyeOff size={20} strokeWidth={2.4} aria-hidden />}
      </motion.span>
    </button>
  )
}

/** Seconds left to accept, as a ring that loops for the demo. */
function CountdownRing({ size = 52 }: { size?: number }) {
  const [left, setLeft] = useState(30)
  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => (s > 1 ? s - 1 : 30)), 1000)
    return () => window.clearInterval(t)
  }, [])
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role="timer" aria-label={`${left} seconds left to accept`}>
      <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[rgb(35_72_214/0.22)]" style={{ animationDuration: '1.6s' }} />
      <svg width={size} height={size} className="relative -rotate-90 rounded-full bg-white" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent-soft)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left / 30)} style={{ transition: 'stroke-dashoffset 0.9s linear' }} />
      </svg>
      <span className="figure num absolute text-[18px] text-accent-ink">{left}</span>
    </span>
  )
}

export default function WalkerHome() {
  const { navigate, reset, toast } = useNav()
  const online = useSession((s) => s.online)
  const stage = useSession((s) => s.stage)
  const declined = useSession((s) => s.declined)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const instant = useSession((s) => s.instant)
  const pricing = useSession((s) => s.pricing)
  const doc = useSession(walkerDocState)

  const dog = dogById(dogId)
  const live = quote(pricing, duration, dog.temperament, instant)
  const netOf = (d: 30 | 45 | 60, t: 'calm' | 'reactive') => quote(pricing, d, t, false).walkerNet
  const liveClosed = stageAtLeast(stage, 'ended')
  const earned = TODAY_JOBS.filter((j) => j.state === 'done').reduce((sum, j) => sum + netOf(j.duration, j.temperament), 0) + (liveClosed ? live.walkerNet : 0)
  const delta = earned - YESTERDAY_BY_NOW
  const jobsDone = TODAY_JOBS.filter((j) => j.state === 'done').length + (liveClosed ? 1 : 0)
  const incoming = stage === 'none' || (stage === 'requested' && !declined)
  const chatOpen = stageAtLeast(stage, 'accepted')

  const openRequest = () => {
    session.advance('requested')
    navigate('walker.request')
  }

  return (
    <MobileScreen tab="today" cap="var(--accent)">
      {/* royal-blue hero */}
      <section className="relative overflow-hidden bg-accent px-5 pb-16 text-on-accent" style={{ paddingTop: safeTop(10) }}>
        <span aria-hidden className="sun -right-[20%] w-[40%]" style={{ top: safeTop(4) }} />
        <span aria-hidden className="dots-light" />
        <div className="relative flex items-center gap-3 pr-[26%]">
          <button type="button" onClick={() => reset('walker.profile')} aria-label="Your profile" className="rounded-full">
            <Avatar who={WALKER_ME.photo} size={44} className="ring-[3px] ring-white" />
          </button>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[13px] font-bold">Good morning, {WALKER_ME.first}</p>
            <p className="flex items-center gap-1 text-[13px] font-semibold text-[var(--on-accent-2)]">
              <MapPin size={13} strokeWidth={2.6} aria-hidden />
              <span className="truncate">{WALKER_ME.locality} · {WALKER_ACCOUNT.radiusKm} km radius</span>
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-4">
          <OnlineSwitch on={online} onChange={(v) => { session.setOnline(v); toast(v ? 'You are online. Requests within 5 km will reach you' : 'You are offline. No new requests', v ? 'accent' : 'neutral') }} />
          <p className="min-w-0 max-w-[15ch] text-[13px] font-semibold leading-snug text-[var(--on-accent-2)]">
            <span className="block text-[15px] font-extrabold text-white">{online ? 'Taking requests' : 'You are hidden from the map'}</span>
            {online ? `Online since ${ONLINE_SINCE}` : 'Booked walks still stand'}
          </p>
        </div>

        <div className="relative mt-6 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="label text-[var(--on-accent-2)]">Today’s net earnings</p>
            <Price amount={earned} size={60} swoosh className="mt-1.5 text-white" />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5 pb-1">
            <Sparkline data={[...TODAY_SPARK.slice(0, -1), earned]} width={92} height={34} color="var(--sun-light)" />
            <span className="num flex h-6 items-center gap-1 rounded-full bg-[rgb(10_18_56/0.4)] px-2.5 text-[11px] font-extrabold text-white">
              <TrendingUp size={12} strokeWidth={2.8} aria-hidden /> {delta >= 0 ? '+' : '-'}{inr(Math.abs(delta))} vs yesterday
            </span>
          </div>
        </div>
        <p className="num relative mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-bold">
          <span className="flex items-center gap-1.5"><Check size={14} strokeWidth={3} aria-hidden /> {jobsDone} jobs done</span>
          <span className="flex items-center gap-1.5"><Clock3 size={14} strokeWidth={2.6} aria-hidden /> {HOURS_ONLINE} online</span>
          <span className="flex items-center gap-1.5"><Route size={14} strokeWidth={2.6} aria-hidden /> 5.9 km</span>
        </p>
      </section>

      {/* the job slot: request, pickup, walk or closed */}
      <div className="relative z-10 -mt-11 px-4">
        {incoming && (
          <div className="relative">
            <motion.button type="button" aria-label={`Job request: ${dog.name}, ${dog.breed}`} disabled={!online} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={openRequest} className="relative flex w-full items-stretch overflow-hidden rounded-[var(--r-container)] bg-[var(--surface)] text-left shadow-[var(--shadow-floating)]" style={online ? undefined : { filter: 'grayscale(1)' }}>
              <span className="relative w-[36%] shrink-0">
                <img src={img(dog.photo, 420)} alt={`${dog.name}, ${dog.breed}`} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 20%' }} />
                <TemperBadge t={dog.temperament} solid className="absolute bottom-2.5 left-2.5" />
              </span>
              <span className="min-w-0 flex-1 p-3.5">
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="label flex items-center gap-1.5 text-accent-ink">
                      <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-accent" /> {instant ? 'Walk Now request' : 'New job request'}
                    </span>
                    <span className="grot mt-1 block truncate text-[26px]">{dog.name}</span>
                    <span className="block truncate text-[13px] font-semibold text-text-2">{dog.breed}</span>
                  </span>
                  {online && <CountdownRing />}
                </span>
                <span className="num mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold text-text">
                  <span className="flex items-center gap-1"><Navigation size={12} strokeWidth={2.8} aria-hidden /> {WALKER_ME.km} km</span>
                  <span className="flex items-center gap-1"><Clock3 size={12} strokeWidth={2.8} aria-hidden /> {duration} min</span>
                  <span>{WALK.slot}</span>
                </span>
                <span className="mt-2.5 flex items-end justify-between gap-2">
                  <span className="leading-none">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-text-2">Net payout</span>
                    <Price amount={live.walkerNet} size={32} swoosh className="mt-1" />
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                    <ArrowRight size={19} strokeWidth={2.6} aria-hidden />
                  </span>
                </span>
              </span>
            </motion.button>
            {!online && (
              <div className="absolute inset-0 grid place-items-center rounded-[var(--r-container)] bg-[rgb(255_252_241/0.72)]">
                <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => { session.setOnline(true); toast('You are online. Requests within 5 km will reach you', 'accent') }} className="flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-extrabold text-on-ink shadow-[var(--shadow-floating)]">
                  <EyeOff size={17} strokeWidth={2.4} aria-hidden /> You are hidden from the map. Go online
                </motion.button>
              </div>
            )}
          </div>
        )}

        {stage === 'requested' && declined && (
          <div className="flex items-center gap-3 rounded-[var(--r-container)] bg-[var(--surface)] p-4 shadow-[var(--shadow-floating)]">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
              <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[rgb(35_72_214/0.18)]" style={{ animationDuration: '2s' }} />
              <Radio size={22} strokeWidth={2.3} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 leading-snug">
              <span className="block text-[15px] font-extrabold">You passed on {dog.name}</span>
              <span className="block text-[13px] font-semibold text-text-2">{online ? 'Looking for the next job near Phase 7.' : 'You are hidden from the map.'}</span>
            </span>
            <button type="button" onClick={() => { session.set({ declined: false }); toast(`${dog.name}’s request is back on your screen`, 'accent') }} className="flex h-11 shrink-0 items-center rounded-full bg-accent-soft px-4 text-[13px] font-extrabold text-[var(--on-accent-soft)]">
              Undo
            </button>
          </div>
        )}

        {(stage === 'accepted' || stage === 'arrived' || stage === 'walking') && (
          <motion.button type="button" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate(stage === 'walking' ? 'walker.walk' : 'walker.pickup')} className="relative flex w-full items-center gap-3.5 overflow-hidden rounded-[var(--r-container)] bg-ink p-4 text-left text-on-ink shadow-[var(--shadow-floating)]">
            <span aria-hidden className="sun -right-10 -top-12 w-32" />
            <img src={img(dog.photo, 200)} alt="" className="relative h-16 w-16 shrink-0 rounded-full object-cover ring-[3px] ring-[var(--sun)]" style={{ objectPosition: '50% 20%' }} />
            <span className="relative min-w-0 flex-1 leading-tight">
              <span className="label flex items-center gap-1.5 text-sun-light">
                <Radio size={12} strokeWidth={2.8} aria-hidden /> {stage === 'walking' ? 'Walk in progress' : 'Pickup in progress'}
              </span>
              <span className="grot mt-1 block truncate text-[22px]">{stage === 'walking' ? `${dog.name} is on his walk` : stage === 'arrived' ? 'At the gate. Enter the OTP' : `Head to ${OWNER.first}’s gate`}</span>
              <span className="num mt-1 block truncate text-[12px] font-semibold text-on-ink-2">{WALK.id} · {WALK.gate}</span>
            </span>
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sun text-on-sun">
              <ArrowRight size={20} strokeWidth={2.6} aria-hidden />
            </span>
          </motion.button>
        )}

        {liveClosed && (
          <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate('walker.earnings')} className="flex w-full items-center gap-3.5 rounded-[var(--r-container)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-floating)]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-calm text-white">
              <Check size={24} strokeWidth={3} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[15px] font-extrabold">{dog.name} is home. Walk closed</span>
              <span className="mt-0.5 block text-[13px] font-semibold text-text-2">{stage === 'reviewed' ? 'Payout released to your wallet' : `Payout held until ${OWNER.first} reviews`}</span>
            </span>
            <Price amount={live.walkerNet} size={26} />
          </motion.button>
        )}
      </div>

      {/* KYC banner: follows the admin's decision in the KYC queue */}
      {doc !== 'approved' && (
        <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate('walker.kyc')} className={`mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-[var(--r-card)] p-3 text-left ${doc === 'rejected' ? 'bg-danger-soft' : 'bg-warn-soft'}`}>
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white ${doc === 'rejected' ? 'text-danger-text' : 'text-warn'}`}>
            <FileWarning size={19} strokeWidth={2.4} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 leading-snug">
            <StatusPill kind={doc} className="!bg-white" />
            <span className="mt-1 block text-[13px] font-bold text-text">{doc === 'rejected' ? 'Police verification rejected. Upload a clearer copy to keep taking jobs.' : 'Police verification renewal under review. You can keep working.'}</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-text-2" aria-hidden />
        </motion.button>
      )}

      {/* quick links */}
      <div className="mt-4 grid grid-cols-[1fr_1fr_1.25fr] gap-2 px-4">
        <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => navigate('walker.earnings')} className="flex h-[72px] flex-col justify-between rounded-[var(--r-card)] bg-sun p-3 text-left text-on-sun">
          <Wallet size={19} strokeWidth={2.4} aria-hidden />
          <span className="text-[13px] font-extrabold">Earnings</span>
        </motion.button>
        <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => navigate('walker.schedule')} className="flex h-[72px] flex-col justify-between rounded-[var(--r-card)] bg-accent-soft p-3 text-left text-[var(--on-accent-soft)]">
          <CalendarDays size={19} strokeWidth={2.4} aria-hidden />
          <span className="text-[13px] font-extrabold">Schedule</span>
        </motion.button>
        <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => (chatOpen ? navigate('walker.chat') : toast('Chat opens when you accept a job', 'neutral'))} className="flex h-[72px] items-center gap-2.5 rounded-[var(--r-card)] bg-ink p-3 text-left text-on-ink">
          <span className="relative shrink-0">
            <Avatar who={OWNER.photo} size={40} />
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-sun text-on-sun">
              <MessageCircle size={11} strokeWidth={2.8} aria-hidden />
            </span>
          </span>
          <span className="min-w-0 text-[13px] font-extrabold leading-tight">Chat with {OWNER.first}</span>
        </motion.button>
      </div>

      {/* today's schedule: a timeline with a spine */}
      <SectionHead className="mt-7" eyebrow="Sat 14 Nov" title={`${TODAY_JOBS.length} walks today`} action="Week view" onAction={() => navigate('walker.schedule')} />
      <motion.ol variants={listParent} initial="hidden" animate="show" className="relative mt-3 pl-5 pr-4">
        <span aria-hidden className="absolute bottom-6 left-[86px] top-5 w-[2px] rounded-full bg-[var(--accent-soft)]" />
        {TODAY_JOBS.map((j) => {
          const isLive = Boolean(j.live)
          const t = isLive ? dog.temperament : j.temperament
          const state = isLive ? (liveClosed ? 'done' : stage === 'walking' ? 'now' : 'next') : j.state
          const net = isLive ? live.walkerNet : netOf(j.duration, j.temperament)
          return (
            <motion.li key={j.id} variants={listItem} className="relative flex items-center gap-3 py-2">
              <span className="w-[54px] shrink-0 whitespace-nowrap text-right leading-tight">
                <span className={`num block text-[11px] font-bold ${state === 'done' ? 'text-text-2' : 'text-text'}`}>{isLive ? WALK.slot : j.time}</span>
                <span className={`num block text-[11px] font-bold ${state === 'done' ? 'text-calm-ink' : state === 'upcoming' ? 'text-text-2' : 'text-accent-ink'}`}>{state === 'done' ? 'Done' : state === 'now' ? 'Walking' : state === 'next' ? 'Next' : `${j.duration} min`}</span>
              </span>
              <span className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full ring-4 ring-[var(--bg)] ${state === 'done' ? 'bg-calm text-white' : state === 'upcoming' ? 'bg-white' : 'bg-accent text-on-accent'}`} style={state === 'upcoming' ? { boxShadow: '0 0 0 4px var(--bg), inset 0 0 0 2.5px var(--blue-200)' } : undefined}>
                {state === 'done' ? <Check size={13} strokeWidth={3.4} aria-hidden /> : state !== 'upcoming' ? <span className="h-2 w-2 animate-pulse rounded-full bg-sun" aria-hidden /> : null}
              </span>
              <div className={`flex min-w-0 flex-1 items-center gap-3 ${state === 'next' || state === 'now' ? 'rounded-[var(--r-card)] bg-[var(--surface)] p-2.5 shadow-[var(--shadow-raised)]' : 'px-1'}`}>
                <img src={img(isLive ? dog.photo : j.photo, 140)} alt="" className={`h-11 w-11 shrink-0 rounded-full object-cover ${state === 'done' ? 'grayscale' : ''}`} style={{ objectPosition: '50% 25%' }} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate">
                      <span className="text-[15px] font-extrabold">{isLive ? dog.name : j.dog}</span>
                      <span className="ml-1.5 text-[12px] font-semibold text-text-2">{isLive ? dog.breed : j.breed}</span>
                    </span>
                    <span className="num shrink-0 text-[15px] font-extrabold">{inr(net)}</span>
                  </p>
                  <p className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-semibold text-text-2">{j.locality.replace(', Mohali', '')}</span>
                    <TemperBadge t={t} />
                  </p>
                </div>
              </div>
            </motion.li>
          )
        })}
      </motion.ol>

      {/* the week, full-bleed ink */}
      <section className="relative mt-6 overflow-hidden bg-ink px-5 py-6 text-on-ink">
        <div className="relative flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="label text-sun-light">This week so far</p>
            <p className="mt-1.5 flex items-baseline gap-2">
              <span className="figure num text-[44px]">31</span>
              <span className="text-[15px] font-extrabold">walks</span>
            </p>
            <p className="mt-1 text-[13px] font-semibold text-on-ink-2">94% of requests accepted. Top 8% in Mohali.</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <BarStrip results={['W', 'W', 'W', 'L', 'W', 'W', 'W', 'W', 'L', 'W', 'W', 'W']} height={30} />
            <button type="button" onClick={() => navigate('walker.earnings')} className="flex h-11 items-center gap-1 text-[13px] font-extrabold text-sun-light">
              Open wallet <ChevronRight size={16} strokeWidth={2.6} aria-hidden />
            </button>
          </div>
        </div>
      </section>
    </MobileScreen>
  )
}
