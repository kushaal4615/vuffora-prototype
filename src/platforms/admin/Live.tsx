import { motion } from 'framer-motion'
import { Clock3, Flag, KeyRound, MapPin, MessageSquare, Radio, Satellite, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { StatusPill, TemperBadge, type StatusKind } from '../../components/Brand'
import { Button } from '../../components/Button'
import { MapCanvas, pointAt, type MapPin as Pin } from '../../components/Map'
import { LIVE_WALKS, gpsFix, type LiveWalk } from '../../data/adminOps'
import { CITIES, OWNER, dogById, type City } from '../../data/cast'
import { mmss } from '../../data/clock'
import { ROUTE, WALK, stageAtLeast, type WalkStage } from '../../data/core'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* Live operations control room. The master map of every ongoing walk with
   an inspector rail beside it; the selected walk draws its route and opens
   its OTP timestamps, GPS log and activity log underneath. Bruno's walk
   (VF-240781) follows the session store, so whatever the Owner and Walker
   apps do shows up here. */

type Row = LiveWalk & { state: 'walking' | 'late' | 'before' | 'ended'; pill: { kind: StatusKind; label: string }; checkOut?: string }

const toMin = (label: string) => {
  const m = /^(\d+):(\d+) (am|pm)$/.exec(label)
  if (!m) return 8 * 60
  const h = (Number(m[1]) % 12) + (m[3] === 'pm' ? 12 : 0)
  return h * 60 + Number(m[2])
}
const clockSec = (sec: number) => {
  const h = Math.floor(sec / 3600) % 24
  return `${h % 12 === 0 ? 12 : h % 12}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

const BRUNO_PILL: Record<WalkStage, { kind: StatusKind; label: string }> = {
  none: { kind: 'open', label: `Booked ${WALK.slot}` },
  requested: { kind: 'pending', label: 'Requested' },
  accepted: { kind: 'progress', label: 'Walker on the way' },
  arrived: { kind: 'review', label: 'At the gate' },
  walking: { kind: 'live', label: 'Walking' },
  ended: { kind: 'resolved', label: 'Ended' },
  reviewed: { kind: 'resolved', label: 'Ended' },
}
const BRUNO_NOTE: Record<WalkStage, string> = {
  none: 'Booked for 8:00 am. No walker request sent yet.',
  requested: 'Owner has paid. The request is on Arjun’s phone.',
  accepted: 'Arjun accepted and is on the way to Gate 2.',
  arrived: 'Arjun is at the gate. Waiting for the Check-In OTP.',
  walking: 'Custody with Arjun. Route and logs are streaming.',
  ended: 'Check-Out OTP verified. Bruno is home.',
  reviewed: 'Check-Out OTP verified. Bruno is home and the walk is reviewed.',
}

export default function AdminLive() {
  const { navigate, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const logs = useSession((s) => s.logs)
  const duration = useSession((s) => s.duration)
  const dogId = useSession((s) => s.dogId)
  const [city, setCity] = useState<'All' | City>('All')
  const [sel, setSel] = useState<string>(WALK.id)
  const [tick, setTick] = useState(0)
  const [escalated, setEscalated] = useState<string[]>([])

  useEffect(() => {
    const t = window.setInterval(() => setTick((x) => x + 1), 4000)
    return () => window.clearInterval(t)
  }, [])

  const rows = useMemo<Row[]>(() => {
    const dog = dogById(dogId)
    const walking = stage === 'walking'
    const done = stageAtLeast(stage, 'ended')
    const checkIn = logs[0]?.at ?? '8:02 am'
    const bruno: Row = {
      id: WALK.id,
      walkerId: 'arjun',
      walker: 'Arjun Mehta',
      walkerPhoto: 'arjun',
      dog: dog.name,
      breed: dog.breed,
      temper: dog.temperament,
      owner: OWNER.name,
      ownerPhoto: OWNER.photo,
      locality: OWNER.locality,
      city: 'Mohali',
      booked: duration,
      elapsed: walking ? 19 : done ? duration : 0,
      checkIn: walking || done ? checkIn : 'Pending',
      checkOutDue: clockLabel(toMin(walking || done ? checkIn : WALK.slot) + duration),
      checkOut: done ? clockLabel(toMin(checkIn) + duration) : undefined,
      route: ROUTE,
      lat: 30.69852,
      lng: 76.71947,
      logs: walking || done ? logs.map((l) => ({ at: l.at, text: l.text })) : [],
      state: walking ? 'walking' : done ? 'ended' : 'before',
      pill: BRUNO_PILL[stage],
    }
    const others: Row[] = LIVE_WALKS.map((w) => ({ ...w, state: w.late ? 'late' : 'walking', pill: w.late ? { kind: 'expiring', label: w.late } : { kind: 'live', label: 'Walking' } }))
    return [bruno, ...others]
  }, [stage, logs, duration, dogId])

  const visible = rows.filter((r) => city === 'All' || r.city === city)
  const current = visible.find((r) => r.id === sel) ?? visible[0]
  const moving = (r: Row) => r.state === 'walking' || r.state === 'late'
  const elapsedSec = (r: Row) => r.elapsed * 60 + (moving(r) ? ((r.id.charCodeAt(8) * 7) % 50) + tick * 4 : 0)
  const progressOf = (r: Row) => Math.min(1, elapsedSec(r) / (r.booked * 60))
  const lateCount = visible.filter((r) => r.state === 'late').length

  const pick = (id: string) => setSel(id)
  const changeCity = (c: 'All' | City) => {
    setCity(c)
    const list = rows.filter((r) => c === 'All' || r.city === c)
    if (!list.some((r) => r.id === sel)) setSel(list[0]?.id ?? WALK.id)
  }

  const pins: Pin[] = visible
    .filter((r) => r.id !== current.id)
    .map((r) => {
      const [x, y] = pointAt(r.route, progressOf(r))
      return { id: r.id, x, y, photo: r.walkerPhoto, label: r.dog, tone: r.temper === 'calm' ? 'calm' : 'reactive', onClick: () => pick(r.id), ariaLabel: `${r.walker} with ${r.dog}, ${r.locality}` }
    })
  const lateDots = visible.filter((r) => r.state === 'late' && r.id !== current.id).map((r) => ({ id: r.id, at: pointAt(r.route, progressOf(r)) }))

  const sec = elapsedSec(current)
  const k = Math.floor(sec / 4)
  const baseSec = toMin(current.checkIn === 'Pending' ? WALK.slot : current.checkIn) * 60
  const gps = moving(current) || current.state === 'ended' ? Array.from({ length: 9 }, (_, i) => ({ k: k - i, t: clockSec(baseSec + (k - i) * 4), ...gpsFix(current, k - i) })) : []
  const isEscalated = escalated.includes(current.id)
  const over = sec > current.booked * 60

  const message = (thread: 'support-walker' | 'support-owner') => {
    session.viewThread(thread)
    navigate('admin.messages')
  }

  return (
    <ConsoleShell
      active="admin.live"
      title="Live operations"
      sub="Every walk in progress, with its OTP timestamps and GPS log"
      actions={
        <span className="flex items-center gap-3 rounded-full bg-ink py-2 pl-3 pr-4 text-on-ink">
          <span className="relative grid h-7 w-7 place-items-center rounded-full bg-sun text-on-sun">
            <Radio size={15} strokeWidth={2.6} aria-hidden />
          </span>
          <span className="figure num text-[26px] leading-none">{visible.length}</span>
          <span className="text-[12px] font-bold leading-tight text-on-ink-2">
            walks on the map
            <br />
            {lateCount > 0 ? `${lateCount} running late` : 'all on time'}
          </span>
        </span>
      }
    >
      <div className="px-8 pb-8 max-md:px-4 max-md:pb-6">
        {/* city filter + legend */}
        <div className="flex items-center justify-between gap-4">
          <div role="tablist" aria-label="City" className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
            {(['All', ...CITIES] as const).map((c) => {
              const on = c === city
              const n = rows.filter((r) => c === 'All' || r.city === c).length
              return (
                <motion.button key={c} role="tab" aria-selected={on} type="button" whileTap={{ scale: 0.96 }} transition={spring.ui} onClick={() => changeCity(c)} className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-bold max-md:h-11 ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface)] text-text shadow-[var(--shadow-raised)]'}`}>
                  {c === 'All' ? 'All cities' : c}
                  <span className={`num rounded-full px-1.5 text-[11px] ${on ? 'bg-[rgb(255_255_255/0.22)]' : 'bg-[var(--surface-high)]'}`}>{n}</span>
                </motion.button>
              )
            })}
          </div>
          <div className="flex shrink-0 items-center gap-4 text-[12px] font-bold text-text-2 max-md:hidden">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-calm" /> Calm dog</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-reactive" /> Aggressive dog</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warn" /> Running late</span>
          </div>
        </div>

        {/* master map + inspector rail */}
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_388px] gap-4 max-md:grid-cols-1 max-md:gap-3">
          <MapCanvas className="h-[548px] rounded-[var(--r-container)] shadow-[var(--shadow-raised)] max-md:h-[420px]" labels={city === 'All' || city === 'Mohali'} route={current.route} progress={progressOf(current)} walker={{ photo: current.walkerPhoto, label: `${current.walker.split(' ')[0]} · ${current.dog}` }} home={current.route[0] as [number, number]} pins={pins}>
            {lateDots.map((d) => (
              <span key={d.id} aria-hidden className="pointer-events-none absolute z-[4] -translate-y-1/2" style={{ left: `calc(${d.at[0]}% + 26px)`, top: `${d.at[1]}%` }}>
                <span className="flex items-center gap-1 rounded-full bg-warn px-2 py-0.5 text-[10px] font-extrabold text-on-warn shadow-[var(--shadow-raised)]">
                  <TriangleAlert size={10} strokeWidth={2.8} /> Late
                </span>
              </span>
            ))}
            <div className="glass pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full px-3 py-1.5 max-md:left-3 max-md:top-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-danger" />
              <span className="text-[12px] font-extrabold">Live</span>
              <span className="meta text-text-2">GPS every 4 s</span>
            </div>
            {/* the selected walk, summarised on the map */}
            <div className="glass absolute bottom-4 left-4 z-10 w-[264px] rounded-[var(--r-card)] p-3 max-md:hidden">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[15px] font-extrabold">{current.walker.split(' ')[0]} with <span className="swoosh">{current.dog}</span></p>
                  <p className="meta mt-1 truncate text-text-2">{current.id} · {current.locality}</p>
                </div>
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="figure num whitespace-nowrap text-[26px]">{mmss(sec)}</span>
                <span className="mb-0.5 whitespace-nowrap text-[12px] font-bold text-text-2">of {current.booked} min</span>
                <span className="ml-auto"><StatusPill kind={current.pill.kind} label={current.pill.label.length > 14 ? current.pill.label.split(' ').slice(0, 2).join(' ') : current.pill.label} /></span>
              </div>
              <ProgressLine value={progressOf(current)} tone={current.state === 'late' || over ? 'warn' : 'accent'} className="mt-2" />
            </div>
          </MapCanvas>

          <aside aria-label="Ongoing walks" className="flex h-[548px] min-w-0 flex-col max-md:h-auto">
            <div className="flex items-baseline justify-between px-1 pb-2">
              <h2 className="grot text-[22px]">Ongoing walks</h2>
              <span className="meta text-text-2">{visible.length} of {rows.length}</span>
            </div>
            <motion.ul variants={listParent} initial="hidden" animate="show" className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto pr-1 [scrollbar-width:thin] max-md:-mx-4 max-md:flex-none max-md:snap-x max-md:scroll-pl-4 max-md:flex-row max-md:gap-2.5 max-md:overflow-x-auto max-md:overflow-y-hidden max-md:px-4 max-md:pb-2 max-md:[scrollbar-width:none]">
              {visible.map((r) => {
                const on = r.id === current.id
                const p = progressOf(r)
                return (
                  <motion.li key={r.id} variants={listItem} className="max-md:w-[272px] max-md:shrink-0 max-md:snap-start">
                    <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => pick(r.id)} aria-pressed={on} className={`block w-full rounded-[var(--r-card)] px-3 py-2.5 text-left transition-colors duration-150 ${on ? 'bg-accent-soft shadow-[inset_0_0_0_2px_var(--accent)]' : 'bg-[var(--surface)] hover:bg-[var(--surface-raised)]'}`}>
                      <div className="flex items-center gap-2.5">
                        <Avatar who={r.walkerPhoto} size={38} ring={on} />
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="flex items-center gap-1.5">
                            <span className="truncate text-[14px] font-extrabold">{r.walker}</span>
                            {r.state === 'late' && <TriangleAlert size={13} strokeWidth={2.6} className="shrink-0 text-warn" aria-label="Running late" />}
                          </p>
                          <p className="mt-0.5 truncate text-[12px] font-semibold text-text-2">{r.dog} · {r.breed}</p>
                        </div>
                        <TemperBadge t={r.temper} />
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[12px] font-semibold text-text-2">
                        <Avatar who={r.ownerPhoto} size={18} />
                        <span className="min-w-0 flex-1 truncate">{r.owner} · {r.locality}</span>
                        <span className="num shrink-0 font-bold text-text">{Math.floor(elapsedSec(r) / 60)} / {r.booked} min</span>
                      </div>
                      <ProgressLine value={p} tone={r.state === 'late' ? 'warn' : r.state === 'before' ? 'muted' : 'accent'} className="mt-1.5" />
                      <div className="meta mt-1.5 flex items-center justify-between gap-2 text-text-2">
                        <span className="flex items-center gap-1 truncate"><KeyRound size={11} aria-hidden /> In {r.checkIn}</span>
                        <span className="truncate">{r.checkOut ? `Out ${r.checkOut}` : `Out due ${r.checkOutDue}`}</span>
                      </div>
                    </motion.button>
                  </motion.li>
                )
              })}
            </motion.ul>
          </aside>
        </div>

        {/* detail of the selected walk */}
        <section aria-label={`Walk ${current.id}`} className="relative mt-5 overflow-hidden rounded-[var(--r-container)] bg-[var(--surface)] shadow-[var(--shadow-raised)]">
          <span aria-hidden className="sun-soft -right-24 -top-40 w-[340px] max-md:hidden" />
          <div className="relative flex flex-wrap items-center gap-x-5 gap-y-3 px-6 pt-5 max-md:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="relative shrink-0">
                <Avatar who={current.walkerPhoto} size={52} ring />
                <span className="absolute -bottom-1 -right-2 rounded-full ring-2 ring-[var(--surface)]"><Avatar who={current.ownerPhoto} size={26} /></span>
              </span>
              <div className="min-w-0 leading-tight">
                <h2 className="grot truncate text-[26px] max-md:text-[22px]">{current.walker} with {current.dog}</h2>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-text-2">
                  <span className="meta text-text">{current.id}</span>
                  <span className="flex items-center gap-1"><MapPin size={13} aria-hidden /> {current.locality}</span>
                  <span>Owner {current.owner}</span>
                  {isEscalated && <Badge tone="danger" icon={<Flag size={11} strokeWidth={2.6} />}>Escalated to duty manager</Badge>}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 max-md:w-full">
              <Button size="sm" variant="outline" icon={MessageSquare} className="max-md:h-11 max-md:flex-1" onClick={() => message('support-walker')}>Message walker</Button>
              <Button size="sm" variant="outline" icon={MessageSquare} className="max-md:h-11 max-md:flex-1" onClick={() => message('support-owner')}>Message owner</Button>
              <Button
                size="sm"
                variant={isEscalated ? 'paper' : 'danger'}
                icon={Flag}
                className="max-md:h-11 max-md:w-full"
                onClick={() => {
                  setEscalated((e) => (e.includes(current.id) ? e.filter((x) => x !== current.id) : [...e, current.id]))
                  toast(isEscalated ? `Escalation on ${current.id} withdrawn` : `${current.id} escalated. Duty manager and city lead alerted.`, isEscalated ? 'neutral' : 'danger')
                }}
              >
                {isEscalated ? 'Withdraw escalation' : 'Escalate'}
              </Button>
            </div>
          </div>

          <div className="relative grid grid-cols-[260px_minmax(0,1.15fr)_minmax(0,1fr)] gap-6 px-6 pb-6 pt-5 max-md:grid-cols-1 max-md:gap-5 max-md:px-4 max-md:pb-5">
            {/* OTP timestamps */}
            <div>
              <h3 className="label flex items-center gap-1.5 text-text-2"><KeyRound size={13} strokeWidth={2.6} aria-hidden /> OTP timestamps</h3>
              <ol className="relative mt-3 pl-5">
                <span aria-hidden className="absolute bottom-3 left-[5px] top-2 w-[2px] rounded-full bg-[var(--paper-300)]" />
                <OtpStep done={current.checkIn !== 'Pending'} title="Check-In OTP" time={current.checkIn !== 'Pending' ? current.checkIn : 'Pending'} note={current.checkIn !== 'Pending' ? 'Verified at pickup. Custody with the walker.' : `Code is live for ${WALK.otpTtlMin} minutes once the walker arrives.`} />
                <OtpStep done={!!current.checkOut} warn={current.state === 'late'} title="Check-Out OTP" time={current.checkOut ?? (current.checkIn === 'Pending' ? 'Not started' : 'Pending')} note={current.checkOut ? 'Verified at drop-off. Walk closed.' : current.state === 'late' ? `Was due ${current.checkOutDue}. ${current.late}.` : `Expected ${current.checkOutDue}.`} last />
              </ol>
              <p className="mt-3 rounded-[var(--r-control)] bg-[var(--surface-raised)] px-3 py-2.5 text-[12px] font-semibold leading-snug text-text-2">
                {current.id === WALK.id ? BRUNO_NOTE[stage] : current.state === 'late' ? 'The owner has been told the walk is running over.' : 'Both codes are 4 digits, time-bound and shown only in the Owner App.'}
              </p>
            </div>

            {/* GPS log */}
            <div className="min-w-0">
              <h3 className="label flex items-center justify-between gap-2 text-text-2">
                <span className="flex items-center gap-1.5"><Satellite size={13} strokeWidth={2.6} aria-hidden /> GPS log</span>
                <span className="meta normal-case tracking-normal">{gps.length ? `${k + 1} fixes · 4 s apart` : 'Not streaming'}</span>
              </h3>
              <div className="mt-3 overflow-hidden rounded-[var(--r-card)] bg-night text-on-night">
                {gps.length ? (
                  <table className="meta w-full table-fixed text-left text-[11.5px]">
                    <thead>
                      <tr className="text-on-night-2">
                        <th className="w-[31%] py-2 pl-4 font-medium">Time</th>
                        <th className="w-[23%] py-2 font-medium">Lat</th>
                        <th className="w-[23%] py-2 font-medium">Long</th>
                        <th className="py-2 pr-4 text-right font-medium">km/h</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gps.map((g, i) => (
                        <motion.tr key={g.k} initial={i === 0 && moving(current) ? { opacity: 0, y: -6 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={i === 0 ? 'bg-[rgb(255_255_255/0.09)] text-sun-light' : ''}>
                          <td className="truncate py-[5px] pl-4">{g.t}</td>
                          <td className="py-[5px]">{g.lat}</td>
                          <td className="py-[5px]">{g.lng}</td>
                          <td className="py-[5px] pr-4 text-right">{g.speed}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-4 py-8 text-center text-[13px] font-semibold leading-relaxed text-on-night-2" style={{ fontFamily: 'var(--font-text)' }}>
                    GPS logging starts when the Check-In OTP is verified.
                    <br />
                    Open the Walker App and enter {WALK.checkInOtp.split('').join(' ')} to start it.
                  </p>
                )}
              </div>
            </div>

            {/* activity log */}
            <div className="min-w-0">
              <h3 className="label flex items-center gap-1.5 text-text-2"><Clock3 size={13} strokeWidth={2.6} aria-hidden /> Activity log</h3>
              {current.logs.length ? (
                <ol className="relative mt-3 pl-5">
                  <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-[2px] rounded-full bg-[var(--paper-300)]" />
                  {[...current.logs].reverse().map((l, i) => (
                    <li key={l.at + l.text} className="relative pb-3 last:pb-0">
                      <span aria-hidden className={`absolute -left-5 top-[5px] h-3 w-3 rounded-full ring-2 ring-[var(--surface)] ${i === 0 ? 'bg-accent' : 'bg-[var(--paper-400)]'}`} />
                      <p className="meta text-text-2">{l.at}</p>
                      <p className="mt-0.5 text-[13px] font-semibold leading-snug">{l.text}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 rounded-[var(--r-card)] bg-warn-soft px-4 py-3 text-[13px] font-semibold leading-snug text-[var(--on-warn-soft)]">No logs yet. Pee, poop, water and photo entries appear here as the walker taps them.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </ConsoleShell>
  )
}

function clockLabel(min: number) {
  const h = Math.floor(min / 60) % 24
  return `${h % 12 === 0 ? 12 : h % 12}:${String(min % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

function ProgressLine({ value, tone, className = '' }: { value: number; tone: 'accent' | 'warn' | 'muted'; className?: string }) {
  const fill = tone === 'warn' ? 'var(--warn)' : tone === 'muted' ? 'var(--paper-400)' : 'var(--accent)'
  return (
    <span className={`relative block h-[3px] w-full overflow-hidden rounded-full bg-[rgb(14_27_87/0.1)] ${className}`} role="img" aria-label={`${Math.round(value * 100)}% of booked time`}>
      <span className="absolute inset-y-0 left-0 w-full origin-left rounded-full transition-transform duration-700 ease-linear" style={{ background: fill, transform: `scaleX(${Math.max(0.02, value)})` }} />
    </span>
  )
}

function OtpStep({ title, time, note, done, warn = false, last = false }: { title: string; time: string; note: string; done: boolean; warn?: boolean; last?: boolean }) {
  return (
    <li className={`relative ${last ? '' : 'pb-4'}`}>
      <span aria-hidden className={`absolute -left-5 top-[5px] h-3 w-3 rounded-full ring-2 ring-[var(--surface)] ${done ? 'bg-calm' : warn ? 'bg-warn' : 'bg-[var(--paper-400)]'}`} />
      <p className="text-[12px] font-bold text-text-2">{title}</p>
      <p className="figure num mt-0.5 text-[28px]">{time}</p>
      <p className="mt-1 flex items-start gap-1.5 text-[12px] font-semibold leading-snug text-text-2">
        <StatusPill kind={done ? 'verified' : warn ? 'expiring' : 'pending'} label={done ? 'Verified' : warn ? 'Overdue' : 'Pending'} className="!h-5 !px-2 !text-[10px]" />
      </p>
      <p className="mt-1.5 text-[12px] font-semibold leading-snug text-text-2">{note}</p>
    </li>
  )
}
