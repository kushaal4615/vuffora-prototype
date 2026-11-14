import { motion } from 'framer-motion'
import { ArrowRight, CalendarClock, ChevronRight, Download, KeyRound, LifeBuoy, MapPin, Repeat2, RotateCcw, Ticket, Zap } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Price, StarRow, StatusPill, Stub, type StatusKind } from '../../components/Brand'
import { Button, Pressable } from '../../components/Button'
import { ProgressRing, Sparkline } from '../../components/Charts'
import { HeroImage } from '../../components/Media'
import { BottomSheet } from '../../components/Sheet'
import { Segmented } from '../../components/Tabs'
import { dogById, walkerById } from '../../data/cast'
import { inr } from '../../data/clock'
import { WALK, type Duration, type WalkStage } from '../../data/core'
import { img } from '../../data/media'
import { useNav, type OwnerScreenId } from '../../lib/navigation'
import { currentQuote, session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, SectionHead, safeTop } from '../mobileShell'

/* My bookings. Yellow hero with the month in numbers and the three
   tabs; Upcoming holds the live walk as a ticket stub plus scheduled
   walks as date blocks, Past is the ledger with both OTP times and GST
   invoices, Walk Pass is a ring of walks used and a royal-blue renew band. */

type Tab = 'upcoming' | 'past' | 'pass'

const SCHEDULED = [
  { id: 'VF-240802', dog: 'bruno', walker: 'arjun', dow: 'Mon', day: '16', month: 'Nov', slot: '7:30 am', min: 45 as Duration, total: 329, note: 'Walk Pass · walk 14 of 20', pass: true },
  { id: 'VF-240815', dog: 'bruno', walker: 'pooja', dow: 'Wed', day: '18', month: 'Nov', slot: '6:15 pm', min: 30 as Duration, total: 235, note: 'Paid with GPay UPI', pass: false },
]

const PAST: { id: string; dog: string; walker: string; when: string; km: number; min: Duration; total: number; cin: string; cout: string; rating: number }[] = [
  { id: 'VF-240766', dog: 'bruno', walker: 'arjun', when: 'Thu 12 Nov · 7:30 am', km: 2.8, min: 45, total: 329, cin: '7:32 am', cout: '8:17 am', rating: 5 },
  { id: 'VF-240741', dog: 'bruno', walker: 'pooja', when: 'Tue 10 Nov · 6:15 pm', km: 1.9, min: 30, total: 235, cin: '6:16 pm', cout: '6:47 pm', rating: 5 },
  { id: 'VF-240712', dog: 'sheru', walker: 'gurpreet', when: 'Sun 8 Nov · 7:00 am', km: 3.2, min: 60, total: 553, cin: '7:04 am', cout: '8:05 am', rating: 4 },
  { id: 'VF-240688', dog: 'bruno', walker: 'arjun', when: 'Fri 6 Nov · 7:30 am', km: 2.7, min: 45, total: 329, cin: '7:31 am', cout: '8:16 am', rating: 5 },
  { id: 'VF-240655', dog: 'bruno', walker: 'arjun', when: 'Wed 4 Nov · 7:30 am', km: 2.6, min: 45, total: 329, cin: '7:33 am', cout: '8:19 am', rating: 5 },
  { id: 'VF-240631', dog: 'sheru', walker: 'imran', when: 'Mon 2 Nov · 6:45 am', km: 2.4, min: 45, total: 471, cin: '6:48 am', cout: '7:33 am', rating: 5 },
  { id: 'VF-240604', dog: 'bruno', walker: 'rohan', when: 'Sat 31 Oct · 5:30 pm', km: 4.1, min: 60, total: 412, cin: '5:34 pm', cout: '6:35 pm', rating: 4 },
  { id: 'VF-240577', dog: 'bruno', walker: 'arjun', when: 'Thu 29 Oct · 7:30 am', km: 2.5, min: 45, total: 329, cin: '7:30 am', cout: '8:15 am', rating: 5 },
  { id: 'VF-240549', dog: 'bruno', walker: 'pooja', when: 'Tue 27 Oct · 6:15 pm', km: 1.7, min: 30, total: 235, cin: '6:19 pm', cout: '6:50 pm', rating: 5 },
  { id: 'VF-240520', dog: 'sheru', walker: 'gurpreet', when: 'Sun 25 Oct · 7:00 am', km: 3.0, min: 60, total: 553, cin: '7:02 am', cout: '8:03 am', rating: 5 },
  { id: 'VF-240496', dog: 'bruno', walker: 'arjun', when: 'Fri 23 Oct · 7:30 am', km: 2.2, min: 45, total: 329, cin: '7:36 am', cout: '8:21 am', rating: 3 },
]

const LIVE: Partial<Record<WalkStage, { kind: StatusKind; label: string; line: string; cta: string; to: OwnerScreenId }>> = {
  requested: { kind: 'pending', label: 'Finding walker', line: 'Request sent. Waiting for the walker to accept.', cta: 'Track arrival', to: 'owner.arrival' },
  accepted: { kind: 'open', label: 'On the way', line: 'Your walker accepted and is heading to Gate 2.', cta: 'Track arrival', to: 'owner.arrival' },
  arrived: { kind: 'progress', label: 'At your gate', line: 'Share the Check-In OTP at the door.', cta: 'Show Check-In OTP', to: 'owner.arrival' },
  walking: { kind: 'live', label: 'Walking now', line: 'Check-In OTP verified. Route, breaks and photos are live.', cta: 'Open live walk', to: 'owner.live' },
  ended: { kind: 'resolved', label: 'Finished', line: 'Check-Out OTP verified. Tell us how it went.', cta: 'Rate the walk', to: 'owner.review' },
}

const PASS_USED = 13

export default function OwnerBookings() {
  const { navigate, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const walkerId = useSession((s) => s.walkerId)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const pricing = useSession((s) => s.pricing)
  const liveTotal = useSession((s) => currentQuote(s).total)
  const [tab, setTab] = useState<Tab>('upcoming')
  const [sheet, setSheet] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState<string[]>([])

  const live = LIVE[stage]
  const liveWalker = walkerById(walkerId)
  const liveDog = dogById(dogId)
  const open = SCHEDULED.find((b) => b.id === sheet)
  const scheduledCount = SCHEDULED.filter((b) => !cancelled.includes(b.id)).length

  const passWalks = pricing.passWalks
  const used = Math.min(PASS_USED, passWalks)
  const perWalk = pricing.base[45]
  const saved = Math.round((used * perWalk * pricing.passDiscountPct) / 100)
  const passPrice = Math.round(passWalks * perWalk * (1 - pricing.passDiscountPct / 100))

  const again = (b: { dog: string; walker: string; min: Duration }) => {
    session.viewWalker(b.walker)
    session.setDog(b.dog)
    session.setDuration(b.min)
    navigate('owner.booking')
  }
  const seeWalker = (id: string) => {
    session.viewWalker(id)
    navigate('owner.walker')
  }

  return (
    <MobileScreen
      tab="bookings"
      cap="var(--sun)"
      overlay={
        <BottomSheet open={Boolean(open)} onClose={() => setSheet(null)} title={open ? `${open.dow} ${open.day} ${open.month}, ${open.slot}` : undefined}>
          {open && (
            <div>
              <div className="flex items-center gap-3">
                <Avatar who={walkerById(open.walker).photo} size={52} ring />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-[16px] font-extrabold">
                    {dogById(open.dog).name} with {walkerById(open.walker).first}
                  </p>
                  <p className="num mt-0.5 text-[13px] font-semibold text-text-2">
                    {open.min} min · {open.id} · {open.note}
                  </p>
                </div>
                <Price amount={open.total} size={24} />
              </div>
              <p className="mt-4 flex items-start gap-2 rounded-[var(--r-control)] bg-accent-soft p-3 text-[13px] font-semibold leading-snug text-[var(--on-accent-soft)]">
                <KeyRound size={16} strokeWidth={2.4} className="mt-px shrink-0" aria-hidden />
                Your Check-In OTP appears here 15 minutes before the slot. Free cancellation until 2 hours before.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Button variant="paper" icon={CalendarClock} className="!w-full" onClick={() => { setSheet(null); toast(`Asked ${walkerById(open.walker).first} to move the walk. You will get a push when it is confirmed.`, 'info') }}>
                  Reschedule
                </Button>
                <Button variant="danger" className="!w-full" onClick={() => { setCancelled((c) => [...c, open.id]); setSheet(null); toast(open.pass ? 'Walk cancelled. It goes back to your Walk Pass.' : `Walk cancelled. ${inr(open.total)} refund to GPay UPI in 2 hours.`, 'warn') }}>
                  Cancel walk
                </Button>
              </div>
            </div>
          )}
        </BottomSheet>
      }
    >
      {/* yellow hero */}
      <section className="relative overflow-hidden bg-sun px-5 pb-5 text-on-sun" style={{ paddingTop: safeTop(12) }}>
        <span aria-hidden className="pointer-events-none absolute -right-[20%] -top-[44%] aspect-square w-[72%] rounded-full bg-[rgb(255_255_255/0.3)]" />
        <div className="relative flex items-end justify-between gap-3">
          <div>
            <p className="label">November 2026</p>
            <h1 className="grot mt-1 text-[34px]">
              My <span className="swoosh swoosh-blue">bookings</span>
            </h1>
          </div>
          <div className="flex gap-4 pb-1 text-right">
            {[
              { v: '9', l: 'walks' },
              { v: '24.6', l: 'km' },
              { v: inr(2894), l: 'spent' },
            ].map((s) => (
              <span key={s.l} className="leading-none">
                <span className="figure num block text-[22px]">{s.v}</span>
                <span className="mt-1 block text-[11px] font-bold">{s.l}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="relative mt-4">
          <Segmented<Tab>
            full
            tone="ink"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'upcoming', label: 'Upcoming', count: scheduledCount + (live ? 1 : 0) },
              { id: 'past', label: 'Past' },
              { id: 'pass', label: 'Walk Pass' },
            ]}
          />
        </div>
      </section>

      {tab === 'upcoming' && (
        <motion.div key="upcoming" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
          {live ? (
            <Pressable onClick={() => navigate(live.to)} className="mt-4 px-4" aria-label={`${live.label}. ${live.cta}`}>
              <Stub
                tone="ink"
                top={
                  <div className="relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill kind={live.kind} label={live.label} />
                      <span className="meta text-on-ink-2">{WALK.id}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="relative shrink-0">
                        <img src={img(liveDog.photo, 160)} alt="" className="h-14 w-14 rounded-[16px] object-cover" style={{ objectPosition: '50% 20%' }} />
                        <span className="absolute -bottom-1.5 -right-1.5">
                          <Avatar who={liveWalker.photo} size={30} ring />
                        </span>
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="grot block truncate text-[22px]">
                          {liveDog.name} with {liveWalker.first}
                        </span>
                        <span className="num mt-1 block text-[13px] font-semibold text-on-ink-2">
                          {WALK.dateLabel} · {WALK.slot} · {duration} min
                        </span>
                      </span>
                    </div>
                    <p className="mt-3 text-[13px] font-semibold leading-snug text-on-ink-2">{live.line}</p>
                  </div>
                }
                bottom={
                  <div className="flex items-center justify-between gap-3">
                    <span className="leading-tight">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-on-ink-2">Paid</span>
                      <Price amount={liveTotal} size={22} />
                    </span>
                    <span className="flex h-11 items-center gap-2 rounded-full bg-sun pl-4 pr-1.5 text-[14px] font-extrabold text-on-sun">
                      {live.cta}
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[rgb(255_255_255/0.5)]">
                        <ArrowRight size={16} strokeWidth={2.6} aria-hidden />
                      </span>
                    </span>
                  </div>
                }
              />
            </Pressable>
          ) : (
            <div className="relative mx-4 mt-4 flex items-center gap-3 overflow-hidden rounded-[var(--r-card)] bg-ink p-4 text-on-ink">
              <span aria-hidden className="sun -right-8 -top-12 w-32" />
              <span className="relative min-w-0 flex-1 leading-tight">
                <span className="label flex items-center gap-1.5 text-sun-light">
                  <Zap size={12} strokeWidth={2.6} aria-hidden /> {stage === 'reviewed' ? 'Today’s walk is closed' : 'Nothing booked for today'}
                </span>
                <span className="mt-1.5 block text-[15px] font-extrabold">A walker can be at Gate 2 in about 6 minutes.</span>
              </span>
              <Button variant="white" size="sm" className="relative !h-11" onClick={() => navigate('owner.booking')}>
                Book a walk
              </Button>
            </div>
          )}

          <SectionHead className="mt-6" title="Scheduled" eyebrow="This week" />
          <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-3 flex flex-col gap-3 px-4">
            {SCHEDULED.map((b) => {
              const w = walkerById(b.walker)
              const off = cancelled.includes(b.id)
              return (
                <motion.li key={b.id} variants={listItem}>
                  <Pressable onClick={() => (off ? toast('This walk was cancelled. Book again from Past.', 'neutral') : setSheet(b.id))} className="flex items-stretch gap-3.5">
                    <span className={`flex w-[68px] shrink-0 flex-col items-center justify-center rounded-[var(--r-card)] py-2.5 ${off ? 'bg-[var(--surface-high)] text-text-2' : 'bg-sun text-on-sun'}`}>
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.08em]">{b.dow}</span>
                      <span className="figure num text-[30px]">{b.day}</span>
                      <span className="text-[11px] font-bold">{b.month}</span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col justify-center py-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[16px] font-extrabold">
                          {dogById(b.dog).name} with {w.first}
                        </span>
                        {off ? <StatusPill kind="rejected" label="Cancelled" /> : b.pass ? <StatusPill kind="open" label="Pass" /> : null}
                      </span>
                      <span className="num mt-1 block text-[13px] font-semibold text-text-2">
                        {b.slot} · {b.min} min · {b.id}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <Avatar who={w.photo} size={24} />
                        <span className="truncate text-[12px] font-bold text-text-2">{b.note}</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end justify-center gap-1">
                      <Price amount={b.total} size={20} />
                      <ChevronRight size={18} className="text-text-2" aria-hidden />
                    </span>
                  </Pressable>
                </motion.li>
              )
            })}
          </motion.ul>

          <p className="mx-5 mt-5 flex items-start gap-2 text-[12px] font-semibold leading-snug text-text-2">
            <KeyRound size={15} strokeWidth={2.4} className="mt-px shrink-0 text-accent-ink" aria-hidden />
            Every walk opens with a Check-In OTP at pickup and closes with a Check-Out OTP at drop-off. Both times are saved on the booking.
          </p>
        </motion.div>
      )}

      {tab === 'past' && (
        <motion.div key="past" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
          <div className="flex items-center justify-between gap-4 px-5 pt-4">
            <span className="leading-tight">
              <span className="figure num block text-[34px]">
                {PAST.reduce((a, b) => a + b.km, 0).toFixed(1)}
                <span className="unit" style={{ verticalAlign: 'baseline' }}>km</span>
              </span>
              <span className="mt-1 block text-[12px] font-bold text-text-2">across the last {PAST.length} walks, up 12% on October</span>
            </span>
            <Sparkline data={[...PAST].reverse().map((p) => p.km)} width={112} height={40} />
          </div>

          <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-3">
            {PAST.map((b, i) => {
              const w = walkerById(b.walker)
              const d = dogById(b.dog)
              return (
                <motion.li key={b.id} variants={listItem}>
                  {i === 4 && (
                    <HeroImage src="parkPath" alt="The tree-lined loop in the Sector 70 park" className="my-3 h-[132px]" scrim="full" width={800}>
                      <div className="flex h-full items-center justify-between gap-3 px-5 text-white">
                        <span className="min-w-0 leading-tight">
                          <span className="label flex items-center gap-1.5 text-sun-light">
                            <MapPin size={12} strokeWidth={2.6} aria-hidden /> Bruno’s favourite loop
                          </span>
                          <span className="grot mt-1.5 block text-[22px]">Sector 70 park, 7 of the last 11 walks</span>
                        </span>
                        <span className="figure num shrink-0 text-[34px] text-sun-light">
                          2.8<span className="unit" style={{ verticalAlign: 'baseline' }}>km</span>
                        </span>
                      </div>
                    </HeroImage>
                  )}
                  <div className="flex gap-3.5 px-5 py-3">
                    <span className="relative h-[58px] w-[58px] shrink-0">
                      <img src={img(d.photo, 160)} alt={d.name} className="h-full w-full rounded-[16px] object-cover" style={{ objectPosition: '50% 20%' }} />
                      <button type="button" onClick={() => seeWalker(b.walker)} aria-label={`${w.name}, view profile`} className="absolute -bottom-3 -right-3 grid h-11 w-11 place-items-center rounded-full">
                        <Avatar who={w.photo} size={32} ring />
                      </button>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[15px] font-extrabold">
                          {d.name} with {w.first}
                        </span>
                        <Price amount={b.total} size={19} />
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="num truncate text-[12px] font-semibold text-text-2">{b.when}</span>
                        <StarRow rating={b.rating} size={11} />
                      </div>
                      <p className="num mt-1 text-[12px] font-bold">
                        {b.km} km · {b.min} min
                      </p>
                      <p className="meta mt-1 flex items-center gap-1 truncate text-text-2">
                        <KeyRound size={11} strokeWidth={2.4} className="shrink-0" aria-hidden /> In {b.cin} · Out {b.cout} · {b.id}
                      </p>
                      <div className="-ml-2.5 mt-0.5 flex items-center gap-1">
                        <button type="button" onClick={() => toast(`GST invoice INV-2026-${b.when.includes('Nov') ? '11' : '10'}-${b.id.slice(-4)} downloaded`, 'accent')} className="flex h-11 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-extrabold text-accent-ink">
                          <Download size={14} strokeWidth={2.6} aria-hidden /> Invoice
                        </button>
                        <button type="button" onClick={() => again(b)} className="flex h-11 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-extrabold text-accent-ink">
                          <RotateCcw size={14} strokeWidth={2.6} aria-hidden /> Book again
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
          <p className="px-5 pt-1 text-center text-[12px] font-semibold text-text-2">Showing {PAST.length} of 38 walks since Aug 2026</p>
        </motion.div>
      )}

      {tab === 'pass' && (
        <motion.div key="pass" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
          <div className="flex items-center gap-5 px-5 pt-6">
            <ProgressRing value={(used / passWalks) * 100} size={156} stroke={14}>
              <span className="flex flex-col items-center leading-none">
                <span className="figure num text-[50px]">{used}</span>
                <span className="mt-1 text-[12px] font-bold text-text-2">of {passWalks} walks</span>
              </span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <StatusPill kind="approved" label="Active" />
              <h2 className="grot mt-2 text-[24px]">
                Bruno’s <span className="swoosh">Walk Pass</span>
              </h2>
              <p className="mt-2.5 text-[13px] font-semibold leading-snug text-text-2">
                {passWalks - used} walks left this cycle. Weekdays 7:30 am with Arjun.
              </p>
            </div>
          </div>

          {/* walks used, one dot each */}
          <div className="mt-5 px-5">
            <div className="grid grid-cols-10 gap-1.5" role="img" aria-label={`${used} of ${passWalks} walks used`}>
              {Array.from({ length: passWalks }, (_, i) => (
                <motion.span key={i} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring.pop, delay: 0.02 * i }} className={`aspect-square rounded-full ${i < used ? 'bg-accent' : i === used ? 'bg-sun' : 'bg-[var(--surface-high)]'}`} />
              ))}
            </div>
            <p className="mt-2 flex items-center gap-3 text-[11px] font-bold text-text-2">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Walked</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sun" /> Next, Mon 16 Nov</span>
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 px-5">
            <div className="pr-4">
              <p className="label text-text-2">Renews</p>
              <p className="figure num mt-1.5 text-[26px]">1 Dec 2026</p>
              <p className="mt-1 text-[12px] font-bold text-[var(--on-warn-soft)]">in 17 days</p>
            </div>
            <div className="pl-4" style={{ boxShadow: 'inset 1px 0 0 var(--rule)' }}>
              <p className="label text-text-2">Saved so far</p>
              <Price amount={saved} size={26} swoosh className="mt-1.5" />
              <p className="mt-2 text-[12px] font-bold text-text-2">{pricing.passDiscountPct}% off {used} walks</p>
            </div>
          </div>

          {/* renew band: full-bleed royal blue */}
          <section className="relative mt-6 overflow-hidden bg-accent px-5 py-6 text-on-accent">
            <span aria-hidden className="sun -right-[14%] -top-[50%] w-[50%]" />
            <p className="label relative flex items-center gap-1.5 text-[var(--on-accent-2)]">
              <Ticket size={13} strokeWidth={2.6} aria-hidden /> Next cycle
            </p>
            <p className="grot relative mt-1.5 max-w-[70%] text-[26px] leading-[1]">
              {passWalks} walks a month, {pricing.passDiscountPct}% off
            </p>
            <div className="relative mt-4 flex items-end justify-between gap-3">
              <span className="leading-tight">
                <Price amount={passPrice} size={34} />
                <span className="num mt-1 block text-[12px] font-semibold text-[var(--on-accent-2)]">
                  instead of {inr(passWalks * perWalk)} · 45 min walks · plus GST
                </span>
              </span>
              <Button variant="white" icon={Repeat2} onClick={() => { session.set({ recurring: true }); navigate('owner.booking') }}>
                Renew pass
              </Button>
            </div>
          </section>
          <p className="px-5 pt-4 text-[12px] font-semibold leading-snug text-text-2">Unused walks roll over for 14 days. Cancel a pass walk 2 hours ahead and it goes back to your pass.</p>
        </motion.div>
      )}

      {/* support */}
      <Pressable onClick={() => navigate('owner.support')} className="mt-5 px-4">
        <span className="flex items-center gap-3 rounded-[var(--r-card)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-raised)]">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft text-[var(--on-accent-soft)]">
            <LifeBuoy size={20} strokeWidth={2.3} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[15px] font-extrabold">Problem with a booking?</span>
            <span className="mt-0.5 block text-[12px] font-semibold text-text-2">Refunds, late walkers, invoices. Replies in about 5 minutes.</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-text-2" aria-hidden />
        </span>
      </Pressable>
    </MobileScreen>
  )
}
