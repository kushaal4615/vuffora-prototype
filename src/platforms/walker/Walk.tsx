import { motion } from 'framer-motion'
import { Camera, ChevronLeft, CircleDot, Droplets, Flag, GlassWater, MessageCircle, NotebookPen, Siren, Trees, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { TemperBadge } from '../../components/Brand'
import { Button, IconButton } from '../../components/Button'
import { MapCanvas } from '../../components/Map'
import { OWNER, WALKER_ME, dogById } from '../../data/cast'
import { mmss } from '../../data/clock'
import { HOME_PIN, LOG_LABEL, ROUTE, WALK, type LogKind } from '../../data/core'
import { DEMO_WALK_NOTE } from '../../data/demoFill'
import { img, type MediaKey } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { Dock, MobileScreen, SAFE_TOP } from '../mobileShell'

/* The active walk console. Ink top with the timer set huge, the GPS
   broadcast indicator and the distance; the route on the map; five big
   yellow one-tap log buttons; and the log itself, which is the same list
   Ananya is watching on her live walk. */

const LOG_ICON: Record<LogKind, LucideIcon> = { start: Flag, pee: Droplets, poop: Trees, water: GlassWater, photo: Camera, note: NotebookPen, end: Flag }
const PHOTOS: MediaKey[] = ['runGrass', 'twoHarness', 'harnessGrass']
const ACTIONS: { kind: LogKind; label: string; icon: LucideIcon; text: (dog: string) => string }[] = [
  { kind: 'pee', label: 'Pee', icon: Droplets, text: () => 'Pee break on the park loop.' },
  { kind: 'poop', label: 'Poop', icon: Trees, text: () => 'Poop logged and picked up.' },
  { kind: 'water', label: 'Water', icon: GlassWater, text: (d) => `Water break. ${d} drank well.` },
  { kind: 'photo', label: 'Photo', icon: Camera, text: (d) => `Photo check-in. ${d} on the grass.` },
  { kind: 'note', label: 'Note', icon: NotebookPen, text: () => DEMO_WALK_NOTE },
]

export default function WalkerWalk() {
  const { navigate, back, canGoBack, toast } = useNav()
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const logs = useSession((s) => s.logs)
  const dog = dogById(dogId)
  const total = duration * 60
  const [ticks, setTicks] = useState(0)
  const shots = useRef(0)

  useEffect(() => {
    session.advance('walking')
  }, [])
  useEffect(() => {
    const t = window.setInterval(() => setTicks((n) => n + 1), 1000)
    return () => window.clearInterval(t)
  }, [])

  const elapsed = Math.min(total, total / 2 + ticks)
  const progress = Math.min(1, 0.5 + (ticks / 45) * 0.5)
  const km = WALK.plannedKm * progress
  const ring = 78
  const stroke = 6
  const r = (ring - stroke) / 2
  const c = 2 * Math.PI * r

  const log = (a: (typeof ACTIONS)[number]) => {
    const photo = a.kind === 'photo' ? PHOTOS[shots.current++ % PHOTOS.length] : undefined
    session.addLog(a.kind, a.text(dog.name), photo)
    toast(`Sent to ${OWNER.first}`, 'accent')
  }

  const header = (
    <header className="relative z-20 shrink-0 overflow-hidden bg-ink text-on-ink" style={{ paddingTop: SAFE_TOP }}>
      <span aria-hidden className="sun -right-[30%] -top-[40%] w-[62%] opacity-[0.14]" />
      <div className="relative flex h-[48px] items-center gap-1 px-2">
        {canGoBack ? (
          <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="grid h-11 w-9 shrink-0 place-items-center rounded-full">
            <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
          </motion.button>
        ) : (
          <span className="w-3" />
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[16px] font-extrabold">{dog.name}’s walk</p>
          <p className="mt-0.5 flex">
            <TemperBadge t={dog.temperament} solid />
          </p>
        </div>
        <IconButton icon={MessageCircle} label={`Chat with ${OWNER.first}`} tone="scrim" onClick={() => navigate('walker.chat')} />
        <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => navigate('walker.support')} className="mr-1 flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-danger px-3.5 text-[12px] font-extrabold text-white">
          <Siren size={16} strokeWidth={2.4} aria-hidden /> Incident / SOS
        </motion.button>
      </div>

      <div className="relative flex items-center justify-between gap-3 px-5 pt-2">
        <div className="min-w-0">
          <p className="label text-sun-light">Walk timer · {WALK.id}</p>
          <p className="figure num mt-1 text-[clamp(64px,19.5vw,80px)] leading-[0.86] text-white" role="timer" aria-label={`Walk time ${mmss(elapsed)}`}>{mmss(elapsed)}</p>
        </div>
        <span className="relative grid shrink-0 place-items-center" style={{ width: ring, height: ring }}>
          <svg width={ring} height={ring} className="-rotate-90" aria-hidden>
            <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.16)" strokeWidth={stroke} />
            <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke="var(--sun)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - elapsed / total)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <img src={img(dog.photo, 140)} alt="" className="absolute h-[58px] w-[58px] rounded-full object-cover" style={{ objectPosition: '50% 20%' }} />
        </span>
      </div>
      <div className="num relative flex items-center gap-x-4 px-5 pb-4 pt-2 text-[13px] font-bold">
        <span className="text-on-ink-2">of {mmss(total)}</span>
        <span><span className="text-[17px] font-extrabold text-white">{km.toFixed(2)}</span> km</span>
        <span className="ml-auto flex h-7 items-center gap-2 rounded-full bg-[rgb(255_255_255/0.12)] pl-2.5 pr-3 text-[11px] font-extrabold text-white">
          <span className="relative grid h-2.5 w-2.5 place-items-center">
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-calm" />
            <span aria-hidden className="relative h-2 w-2 rounded-full bg-[#4ade80]" />
          </span>
          GPS broadcasting · every 4 s
        </span>
      </div>
    </header>
  )

  return (
    <MobileScreen
      header={header}
      dockHeight={84}
      dock={
        <Dock>
          <Button size="lg" block icon={Flag} onClick={() => navigate('walker.dropoff')}>
            End walk at drop-off
          </Button>
        </Dock>
      }
    >
      <MapCanvas className="h-[212px] w-full" route={ROUTE} progress={progress} walker={{ photo: WALKER_ME.photo, label: dog.name }} home={HOME_PIN}>
        <span className="glass num absolute left-3 top-3 flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-extrabold text-text">
          <CircleDot size={13} strokeWidth={2.6} className="text-accent-ink" aria-hidden /> Last ping {ticks % 4} s ago · {Math.round(progress * 100)}% of route
        </span>
      </MapCanvas>

      {/* one-tap activity logger */}
      <section className="relative z-10 -mt-6 rounded-t-[var(--r-container)] bg-[var(--bg)] px-4 pt-4">
        <p className="label px-1 text-accent-ink">One tap sends it to {OWNER.first}</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {ACTIONS.map((a) => (
            <motion.button key={a.kind} type="button" whileTap={{ scale: 0.9 }} transition={spring.pop} onClick={() => log(a)} aria-label={`Log ${a.label.toLowerCase()}`} className="flex flex-col items-center gap-1.5">
              <span className="grid aspect-square w-full max-w-[66px] place-items-center rounded-full bg-sun text-on-sun shadow-[var(--glow-sun)]">
                <a.icon size={26} strokeWidth={2.3} aria-hidden />
              </span>
              <span className="text-[12px] font-extrabold">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* the log, newest first */}
      <div className="mt-6 flex items-end justify-between gap-3 px-5">
        <h2 className="grot text-[22px]">Activity log</h2>
        <span className="flex items-center gap-2 text-[12px] font-bold text-text-2">
          <Avatar who={OWNER.photo} size={22} /> <span className="num">{logs.length}</span> seen by {OWNER.first}
        </span>
      </div>
      <ol className="relative mt-3 px-5">
        <span aria-hidden className="absolute bottom-4 left-[39px] top-4 w-[2px] rounded-full bg-[var(--accent-soft)]" />
        {[...logs].reverse().map((l) => {
          const Icon = LOG_ICON[l.kind]
          return (
            <motion.li key={l.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={spring.ui} className="relative flex gap-3 py-2">
              <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ring-4 ring-[var(--bg)] ${l.kind === 'start' ? 'bg-accent text-on-accent' : 'bg-sun-soft text-[var(--on-sun-soft)]'}`}>
                <Icon size={18} strokeWidth={2.4} aria-hidden />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-extrabold">{LOG_LABEL[l.kind]}</span>
                  <span className="meta shrink-0 text-text-2">{l.at}</span>
                </p>
                <p className="text-[13px] leading-snug text-text-2">{l.text}</p>
                {l.photo && <img src={img(l.photo, 520)} alt="Photo sent to the owner" className="mt-2 aspect-[16/9] w-full rounded-[var(--r-card)] object-cover" />}
              </div>
            </motion.li>
          )
        })}
      </ol>
    </MobileScreen>
  )
}
