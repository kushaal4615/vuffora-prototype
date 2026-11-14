import { motion } from 'framer-motion'
import { ArrowRight, CalendarClock, ChevronRight, CircleHelp, Clock3, FileWarning, MapPin, Plus, Radio, Ticket, Zap } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Bar, Price, StatusPill, TemperBadge } from '../../components/Brand'
import { Button, IconButton } from '../../components/Button'
import { Sparkline } from '../../components/Charts'
import { Rail } from '../../components/Media'
import { WalkerCard } from '../../components/WalkerCard'
import { DOGS, OWNER, WALKERS, walkerById } from '../../data/cast'
import { WALK, quote } from '../../data/core'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { ownerDocRemark, ownerDocState, session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, SectionHead, safeTop } from '../mobileShell'

/* Home of the Dog Owner App. Yellow hero with the booking switch, the
   approval banner (follows the admin's decision), the dogs rail, the walk
   in progress, nearby walkers as photo-led cards, the walk-pass band and
   recent walks. */

const RECENT = [
  { id: 'VF-240766', dog: 'Bruno', walker: 'arjun', when: 'Thu 12 Nov · 7:30 am', km: 2.8, min: 45, total: 329, trend: [2.1, 2.4, 2.2, 2.6, 2.5, 2.8] },
  { id: 'VF-240741', dog: 'Bruno', walker: 'pooja', when: 'Tue 10 Nov · 6:15 pm', km: 1.9, min: 30, total: 235, trend: [1.6, 1.8, 1.7, 2.0, 1.8, 1.9] },
  { id: 'VF-240712', dog: 'Sheru', walker: 'gurpreet', when: 'Sun 8 Nov · 7:00 am', km: 3.2, min: 60, total: 553, trend: [2.6, 2.9, 3.0, 2.8, 3.1, 3.2] },
  { id: 'VF-240688', dog: 'Bruno', walker: 'arjun', when: 'Fri 6 Nov · 7:30 am', km: 2.7, min: 45, total: 329, trend: [2.2, 2.3, 2.5, 2.4, 2.6, 2.7] },
] as const

export default function OwnerHome() {
  const { navigate } = useNav()
  const [mode, setMode] = useState<'now' | 'later'>('now')
  const stage = useSession((s) => s.stage)
  const walkerId = useSession((s) => s.walkerId)
  const dogId = useSession((s) => s.dogId)
  const pricing = useSession((s) => s.pricing)
  const doc = useSession(ownerDocState)
  const remark = useSession(ownerDocRemark)
  const from = quote(pricing, 30, 'calm', false).base
  const active = stage !== 'none' && stage !== 'reviewed'
  const walker = walkerById(walkerId)
  const nearby = WALKERS.filter((w) => w.online && w.km <= 6).slice(0, 6)

  const book = () => {
    session.set({ instant: mode === 'now' })
    navigate('owner.discover')
  }

  return (
    <MobileScreen tab="home" cap="var(--sun)" bg="var(--bg)">
      {/* yellow hero */}
      <section className="relative overflow-hidden bg-sun px-5 pb-7 text-on-sun" style={{ paddingTop: safeTop(10) }}>
        <span aria-hidden className="pointer-events-none absolute -right-[22%] -top-[30%] aspect-square w-[78%] rounded-full bg-[rgb(255_255_255/0.3)]" />
        <div className="relative flex items-center gap-3">
          <button type="button" onClick={() => navigate('owner.profile')} aria-label="Account" className="rounded-full">
            <Avatar who={OWNER.photo} size={44} className="ring-[3px] ring-white" />
          </button>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[13px] font-bold">Good morning, {OWNER.first}</p>
            <p className="flex items-center gap-1 text-[13px] font-semibold">
              <MapPin size={13} strokeWidth={2.6} aria-hidden />
              <span className="truncate">{OWNER.locality}</span>
            </p>
          </div>
          <IconButton icon={CircleHelp} label="Help & Support" tone="glass" onClick={() => navigate('owner.help')} />
        </div>

        <h1 className="grot relative mt-5 text-[clamp(30px,9vw,36px)] leading-[0.98]">
          Who’s walking <span className="swoosh swoosh-blue">Bruno</span> today?
        </h1>

        {/* Walk Now / Schedule Later */}
        <div className="relative mt-4 rounded-[var(--r-container)] bg-[var(--surface)] p-2 text-text shadow-[var(--shadow-floating)]">
          <div role="tablist" aria-label="When" className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'now', label: 'Walk Now', sub: 'Walker in about 6 min', icon: Zap },
                { id: 'later', label: 'Schedule Later', sub: 'Pick a day and slot', icon: CalendarClock },
              ] as const
            ).map((o) => {
              const on = mode === o.id
              return (
                <motion.button key={o.id} role="tab" aria-selected={on} type="button" whileTap={tap} transition={spring.ui} onClick={() => setMode(o.id)} className={`flex flex-col items-start gap-0.5 rounded-[20px] px-3.5 py-3 text-left transition-colors duration-150 ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface-high)] text-text'}`}>
                  <span className="flex items-center gap-1.5 text-[15px] font-extrabold">
                    <o.icon size={16} strokeWidth={2.5} aria-hidden /> {o.label}
                  </span>
                  <span className={`text-[11px] font-semibold ${on ? 'text-[var(--on-accent-2)]' : 'text-text-2'}`}>{o.sub}</span>
                </motion.button>
              )
            })}
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 px-2 pb-1">
            <span className="leading-tight">
              <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-text-2">30 min walks from</span>
              <Price amount={from} size={28} swoosh />
            </span>
            <Button trailing={ArrowRight} onClick={book}>
              Find a walker
            </Button>
          </div>
        </div>
      </section>

      {/* approval banner: follows the admin's decision in the vetting queue */}
      <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate('owner.vault')} className={`relative z-10 mx-4 -mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-[var(--r-card)] p-3 text-left shadow-[var(--shadow-raised)] ${doc === 'approved' ? 'bg-success-soft' : doc === 'rejected' ? 'bg-danger-soft' : 'bg-warn-soft'}`}>
        <span className="relative shrink-0">
          <img src={img('sheru', 160)} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white" />
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white text-warn">
            <FileWarning size={12} strokeWidth={2.6} aria-hidden />
          </span>
        </span>
        <span className="min-w-0 flex-1 leading-snug">
          <span className="flex items-center gap-2">
            <StatusPill kind={doc} />
            <span className="truncate text-[12px] font-bold text-text-2">Sheru · Bordetella</span>
          </span>
          <span className="mt-1 block text-[13px] font-semibold text-text">
            {doc === 'approved' ? 'Certificate approved. Sheru can be booked now.' : doc === 'rejected' ? remark || 'Certificate rejected. Tap to see the admin’s remarks.' : 'Our team is checking the certificate. Usually under 4 hours.'}
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-text-2" aria-hidden />
      </motion.button>

      {/* the walk in progress */}
      {active && (
        <motion.button type="button" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate(stage === 'walking' || stage === 'ended' ? 'owner.live' : 'owner.arrival')} className="relative mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 overflow-hidden rounded-[var(--r-card)] bg-ink p-3.5 text-left text-on-ink shadow-[var(--shadow-floating)]">
          <span aria-hidden className="sun -right-8 -top-10 w-28 opacity-90" />
          <Avatar who={walker.photo} size={46} ring />
          <span className="relative min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-sun-light">
              <Radio size={12} strokeWidth={2.6} aria-hidden /> {stage === 'walking' ? 'Walk in progress' : stage === 'ended' ? 'Walk finished' : stage === 'arrived' ? 'Walker at your gate' : 'Walker on the way'}
            </span>
            <span className="mt-0.5 block truncate text-[15px] font-extrabold">{walker.first} with {dogId === 'sheru' ? 'Sheru' : 'Bruno'} · {WALK.id}</span>
          </span>
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun text-on-sun">
            <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
          </span>
        </motion.button>
      )}

      {/* dogs rail */}
      <SectionHead className="mt-6" title="Your dogs" action="Add a dog" onAction={() => navigate('owner.dog')} />
      <Rail className="mt-3 pb-2" gap={12}>
        {DOGS.map((d) => {
          const ok = d.vaccines.filter((v) => v.state === 'approved').length + (d.id === 'sheru' && doc === 'approved' ? 1 : 0)
          return (
            <motion.button key={d.id} type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => { session.viewDog(d.id); navigate('owner.vault') }} className="relative w-[236px] shrink-0 snap-start overflow-hidden rounded-[var(--r-card)] bg-[var(--surface)] text-left shadow-[var(--shadow-raised)]">
              <div className="relative h-[128px]">
                <img src={img(d.photo, 520)} alt={`${d.name}, ${d.breed}`} className="h-full w-full object-cover" style={{ objectPosition: '50% 18%' }} />
                <div className="scrim-b pointer-events-none absolute inset-0" />
                <TemperBadge t={d.temperament} solid className="absolute left-2.5 top-2.5" />
                <span className="absolute bottom-2 left-3 text-white">
                  <span className="grot block text-[24px] leading-none">{d.name}</span>
                  <span className="block text-[12px] font-semibold">{d.breed}</span>
                </span>
              </div>
              <div className="px-3 pb-3 pt-2.5">
                <div className="flex items-center justify-between text-[12px] font-bold">
                  <span className="text-text-2">Vaccinations</span>
                  <span className="num">{ok}/3 approved</span>
                </div>
                <Bar value={(ok / 3) * 100} tone={ok === 3 ? 'calm' : 'sun'} className="mt-1.5" />
                <span className="mt-2 block text-[12px] font-semibold text-text-2">{d.age} · {d.weight} · {d.walks} walks</span>
              </div>
            </motion.button>
          )
        })}
        <motion.button type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => navigate('owner.dog')} aria-label="Add a dog" className="flex w-[104px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[var(--r-card)] bg-sun-soft text-[var(--on-sun-soft)]" style={{ boxShadow: 'inset 0 0 0 2px var(--sun)' }}>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-sun text-on-sun">
            <Plus size={22} strokeWidth={2.6} aria-hidden />
          </span>
          <span className="text-[12px] font-extrabold">Add a dog</span>
        </motion.button>
      </Rail>

      {/* nearby walkers: the photo-led cards from the reference */}
      <SectionHead className="mt-6" title="Walkers near you" action="See map" onAction={() => navigate('owner.discover')} />
      <Rail className="mt-3 pb-7" gap={12}>
        {nearby.map((w) => (
          <WalkerCard key={w.id} w={w} price={from} onClick={() => { session.viewWalker(w.id); navigate('owner.walker') }} />
        ))}
      </Rail>

      {/* walk-pass band: full-bleed royal blue */}
      <section className="relative overflow-hidden bg-accent px-5 py-6 text-on-accent">
        <span aria-hidden className="sun -right-[14%] -top-[60%] w-[54%]" />
        <div className="relative flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="label flex items-center gap-1.5 text-[var(--on-accent-2)]">
              <Ticket size={13} strokeWidth={2.6} aria-hidden /> Walk Pass
            </p>
            <p className="grot mt-1.5 text-[26px] leading-[1]">
              {pricing.passWalks} walks a month, {pricing.passDiscountPct}% off
            </p>
            <p className="mt-1.5 text-[13px] font-semibold text-[var(--on-accent-2)]">Same walker, same slot, one payment.</p>
          </div>
          <Button variant="white" size="sm" className="relative" onClick={() => { session.set({ recurring: true }); navigate('owner.booking') }}>
            Get the pass
          </Button>
        </div>
      </section>

      {/* recent walks: borderless rows */}
      <SectionHead className="mt-6" title="Recent walks" action="All bookings" onAction={() => navigate('owner.bookings')} />
      <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-2 px-2">
        {RECENT.map((r) => {
          const w = walkerById(r.walker)
          return (
            <motion.li key={r.id} variants={listItem}>
              <button type="button" onClick={() => navigate('owner.bookings')} className="flex w-full items-center gap-3 rounded-[var(--r-card)] px-3 py-2.5 text-left">
                <Avatar who={w.photo} size={42} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[15px] font-extrabold">{r.dog} with {w.first}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-text-2">
                    <Clock3 size={12} aria-hidden /> {r.when}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <Sparkline data={[...r.trend]} width={54} height={20} />
                  <span className="num text-[12px] font-bold">{r.km} km · ₹{r.total}</span>
                </span>
              </button>
            </motion.li>
          )
        })}
      </motion.ul>
      <p className="px-5 pb-2 pt-4 text-center text-[12px] font-semibold text-text-2">Walking since {OWNER.since} · {OWNER.walks} walks so far</p>
    </MobileScreen>
  )
}
