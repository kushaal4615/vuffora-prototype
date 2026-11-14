import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronRight, FileCheck2, FileUp, IndianRupee, KeyRound, MessagesSquare, Radio, RotateCcw, Scale, Star, TrendingDown, TrendingUp, UserPlus, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar } from '../../components/Avatar'
import { Price, StatusPill } from '../../components/Brand'
import { Button } from '../../components/Button'
import { CHART, Sparkline } from '../../components/Charts'
import { MapCanvas, type MapPin } from '../../components/Map'
import { Segmented } from '../../components/Tabs'
import { FEED, GMV_30, type FeedKind } from '../../data/adminPeople'
import { ADMIN, CITIES, type City } from '../../data/cast'
import { CLOCK, ago, inr, inrShort } from '../../data/clock'
import { ROUTE, WALK, stageAtLeast } from '../../data/core'
import { useNav, type AdminScreenId } from '../../lib/navigation'
import { openSupport, pendingKyc, pendingVet, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* The morning picture. An ink header band with the sun disc (greeting and
   the walk to watch), a GMV block that laps the band, loose KPI figures,
   the 30-day GMV chart by city, the "Needs you" queue on yellow, a mini
   live map and an activity feed with a spine. */

const FEED_ICON: Record<FeedKind, { icon: LucideIcon; cls: string }> = {
  otp: { icon: KeyRound, cls: 'bg-accent text-on-accent' },
  doc: { icon: FileUp, cls: 'bg-warn-soft text-[var(--on-warn-soft)]' },
  payout: { icon: IndianRupee, cls: 'bg-success-soft text-[var(--on-success-soft)]' },
  review: { icon: Star, cls: 'bg-sun text-on-sun' },
  signup: { icon: UserPlus, cls: 'bg-accent-soft text-[var(--on-accent-soft)]' },
  refund: { icon: RotateCcw, cls: 'bg-danger-soft text-[var(--on-danger-soft)]' },
  kyc: { icon: BadgeCheck, cls: 'bg-accent-soft text-[var(--on-accent-soft)]' },
  support: { icon: MessagesSquare, cls: 'bg-ink text-on-ink' },
}

const LIVE_PINS: MapPin[] = [
  { id: 'p1', x: 22, y: 30, photo: 'pooja', label: 'Nala', tone: 'calm' },
  { id: 'p2', x: 80, y: 18, photo: 'rohan', label: 'Leo', tone: 'calm' },
  { id: 'p3', x: 14, y: 62, photo: 'gurpreet', label: 'Sultan', tone: 'reactive' },
  { id: 'p4', x: 86, y: 68, photo: 'tenzin', label: 'Momo', tone: 'calm' },
  { id: 'p5', x: 60, y: 66, photo: 'sahil', label: 'Jaggu', tone: 'calm' },
]

const CITY_SPLIT: { city: City; walks: number; color: string }[] = [
  { city: 'Mohali', walks: 24, color: CHART.series.mohali },
  { city: 'Chandigarh', walks: 15, color: CHART.series.chandigarh },
  { city: 'Delhi NCR', walks: 25, color: CHART.series.ncr },
]

const RANGES = [
  { id: '7', label: '7 days' },
  { id: '14', label: '14 days' },
  { id: '30', label: '30 days' },
] as const

export default function AdminOverview() {
  const { navigate } = useNav()
  const stage = useSession((s) => s.stage)
  const vet = useSession(pendingVet)
  const kyc = useSession(pendingKyc)
  const support = useSession(openSupport)
  const paid = useSession((s) => s.payoutsPaid.length)
  const closed = useSession((s) => Object.keys(s.disputesClosed).length)
  const pricing = useSession((s) => s.pricing)
  const [range, setRange] = useState<(typeof RANGES)[number]['id']>('30')

  const walking = stage === 'walking'
  const done = stageAtLeast(stage, 'ended')
  const liveNow = 38 + (walking ? 1 : 0)
  const completed = 64 + (done ? 1 : 0)
  const gmvToday = 21_480 + (done ? 365 : 0)
  const netToday = gmvToday / (1 + pricing.gstPct / 100)
  const data = GMV_30.slice(-Number(range))
  const total = data.reduce((a, d) => a + d.mohali + d.chandigarh + d.ncr, 0)
  const last7 = GMV_30.slice(-7).reduce((a, d) => a + d.mohali + d.chandigarh + d.ncr, 0)
  const prev7 = GMV_30.slice(-14, -7).reduce((a, d) => a + d.mohali + d.chandigarh + d.ncr, 0)
  const wow = Math.round(((last7 - prev7) / prev7) * 1000) / 10
  const splitTotal = CITY_SPLIT.reduce((a, c) => a + c.walks, 0)

  const watch = walking
    ? { pill: 'Live now', line: 'Bruno is on his walk with Arjun', sub: `${WALK.id} · Check-In OTP verified 8:02 am · Sector 70 park loop` }
    : done
      ? { pill: 'Closed', line: 'Bruno is home. Walk closed by OTP', sub: `${WALK.id} · both OTPs match · ${WALK.plannedKm} km` }
      : stage === 'arrived'
        ? { pill: 'At the gate', line: 'Arjun is at Gate 2 for Bruno', sub: `${WALK.id} · waiting for the Check-In OTP` }
        : stage === 'accepted'
          ? { pill: 'On the way', line: 'Arjun is heading to Bruno', sub: `${WALK.id} · ${WALK.slot} · Sector 70, Mohali` }
          : { pill: 'Up next', line: 'Bruno with Arjun at 8:00 am', sub: `${WALK.id} · ${WALK.slot} · 45 min · Sector 70, Mohali` }

  const needs: { label: string; count: number; sub: string; to: AdminScreenId; icon: LucideIcon }[] = [
    { label: 'Certificates to vet', count: vet, sub: '2 expire within 30 days', to: 'admin.vetting', icon: FileCheck2 },
    { label: 'Walker KYC', count: kyc, sub: 'Arjun’s police verification renewal', to: 'admin.walkers', icon: BadgeCheck },
    { label: 'Support threads', count: support + 5, sub: `${support} live, 5 waiting on a reply`, to: 'admin.messages', icon: MessagesSquare },
    { label: 'Payouts due', count: Math.max(0, 14 - paid), sub: `${inr(38_640)} to settle by 6 pm`, to: 'admin.payouts', icon: IndianRupee },
    { label: 'Disputes', count: Math.max(0, 3 - closed), sub: 'Oldest opened 2 days ago', to: 'admin.disputes', icon: Scale },
  ]

  const kpis = [
    { label: 'Walks completed', value: String(completed), unit: 'today', delta: 9, spark: [38, 44, 41, 52, 49, 58, 61, completed] },
    { label: 'Walks live now', value: String(liveNow), unit: 'on the map', delta: 6, spark: [12, 19, 27, 31, 29, 35, 36, liveNow] },
    { label: 'New owners', value: '9', unit: 'since midnight', delta: -2, spark: [11, 8, 13, 9, 14, 12, 11, 9] },
    { label: 'Average rating', value: '4.82', unit: 'last 7 days', delta: 0.4, spark: [4.74, 4.76, 4.79, 4.77, 4.8, 4.81, 4.8, 4.82] },
  ]

  const feed = walking || done
    ? [{ id: 'f0', kind: 'otp' as FeedKind, who: 'Arjun Mehta', photo: 'arjun' as const, text: done ? 'Check-Out OTP verified for Bruno, Sector 70' : 'Check-In OTP verified for Bruno, Sector 70', mins: 0, city: 'Mohali' as City }, ...FEED]
    : FEED

  const pins: MapPin[] = walking ? LIVE_PINS : [...LIVE_PINS, { id: 'p0', x: 58, y: 40, photo: 'arjun', label: 'Bruno 8:00', tone: 'sun' }]

  return (
    <ConsoleShell active="admin.overview" title="Overview" bleed>
      {/* header band */}
      <section className="relative overflow-hidden bg-ink px-8 pb-[88px] pt-8 text-on-ink max-md:px-4 max-md:pb-20 max-md:pt-6">
        <span aria-hidden className="sun -right-[6%] -top-[120%] w-[40%] max-md:-right-[40%] max-md:top-[58%] max-md:w-[80%]" />
        <span aria-hidden className="dots-light" />
        <div className="relative flex items-end justify-between gap-8 max-md:flex-col max-md:items-stretch max-md:gap-5">
          <div className="min-w-0">
            <p className="meta text-on-ink-2">{CLOCK.date} · {CLOCK.time} · {CITIES.join(' · ')}</p>
            <h1 className="grot mt-2 text-[44px] leading-[0.98] text-white max-md:text-[32px]">
              Good morning, <span className="swoosh">{ADMIN.first}</span>
            </h1>
            <p className="mt-2.5 max-w-[52ch] text-[15px] font-medium text-on-ink-2 max-md:text-[14px]">
              {liveNow} walks are out right now and {vet} certificates are waiting. Morning peak starts at 8.
            </p>
          </div>

          {/* the walk to watch */}
          <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate('admin.live')} className="relative flex w-[430px] shrink-0 items-center gap-3.5 rounded-[var(--r-card)] bg-[var(--surface)] p-3.5 text-left text-text shadow-[var(--shadow-floating)] max-md:w-full">
            <span className="relative shrink-0">
              <Avatar who="bruno" size={56} ring />
              <span className="absolute -bottom-1 -right-2 rounded-full ring-2 ring-white">
                <Avatar who="arjun" size={26} />
              </span>
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="flex items-center gap-2">
                <span className="label text-text-2">Walk to watch</span>
                {walking ? <StatusPill kind="live" /> : <StatusPill kind={done ? 'approved' : 'pending'} label={watch.pill} />}
              </span>
              <span className="mt-1.5 block truncate text-[16px] font-extrabold">{watch.line}</span>
              <span className="meta mt-1 block truncate text-text-2">{watch.sub}</span>
            </span>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
              <ArrowUpRight size={19} strokeWidth={2.5} aria-hidden />
            </span>
          </motion.button>
        </div>
      </section>

      {/* GMV block lapping the band + loose KPI figures */}
      <section className="relative z-10 -mt-14 grid grid-cols-[400px_minmax(0,1fr)] items-stretch gap-8 px-8 max-md:grid-cols-1 max-md:gap-5 max-md:px-4">
        <div className="relative overflow-hidden rounded-[var(--r-container)] bg-sun p-6 text-on-sun shadow-[var(--glow-sun)]">
          <span aria-hidden className="pointer-events-none absolute -bottom-[60%] -right-[18%] aspect-square w-[70%] rounded-full bg-[rgb(255_255_255/0.32)]" />
          <div className="relative flex items-start justify-between gap-3">
            <p className="label">GMV today</p>
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-ink px-2.5 text-[11px] font-extrabold text-on-ink">
              <TrendingUp size={12} strokeWidth={2.8} aria-hidden /> 12.4%
            </span>
          </div>
          <Price amount={gmvToday} size={64} className="relative mt-3" />
          <p className="relative mt-2 text-[13px] font-bold">vs {inr(19_110)} by this time yesterday</p>
          <div className="relative mt-4 flex items-end justify-between gap-4">
            <span className="text-[12px] font-semibold leading-snug">
              Commission at {pricing.commissionPct}% {inr((netToday * pricing.commissionPct) / 100)}
              <br />
              GST at {pricing.gstPct}% {inr(gmvToday - netToday)}
            </span>
            <Sparkline data={[2.1, 3.4, 5.2, 6.1, 9.8, 13.6, 17.9, gmvToday / 1000]} width={132} height={40} color="var(--ink)" />
          </div>
        </div>

        <motion.dl variants={listParent} initial="hidden" animate="show" className="grid grid-cols-4 items-end gap-x-8 pb-1 pt-[72px] max-md:grid-cols-2 max-md:gap-y-6 max-md:pt-0">
          {kpis.map((k) => {
            const up = k.delta >= 0
            return (
              <motion.div key={k.label} variants={listItem} className="min-w-0">
                <dt className="label text-text-2">{k.label}</dt>
                <dd className="mt-2 flex items-end justify-between gap-2">
                  <span className="figure text-[46px] max-md:text-[38px]">{k.value}</span>
                  <Sparkline data={k.spark} width={64} height={30} color={up ? 'var(--accent)' : 'var(--danger)'} />
                </dd>
                <dd className="mt-2 flex items-center gap-1.5 text-[12px] font-bold">
                  <span className={`inline-flex items-center gap-0.5 ${up ? 'text-calm-ink' : 'text-danger-text'}`}>
                    {up ? <TrendingUp size={13} strokeWidth={2.6} aria-hidden /> : <TrendingDown size={13} strokeWidth={2.6} aria-hidden />}
                    {up ? '+' : ''}
                    {k.delta}%
                  </span>
                  <span className="truncate font-semibold text-text-2">{k.unit}</span>
                </dd>
              </motion.div>
            )
          })}
        </motion.dl>
      </section>

      {/* chart + needs you */}
      <section className="mt-9 grid grid-cols-[minmax(0,1fr)_340px] gap-8 px-8 max-md:mt-7 max-md:grid-cols-1 max-md:gap-6 max-md:px-4">
        <div className="min-w-0">
          <div className="flex items-end justify-between gap-4 max-md:flex-col max-md:items-start">
            <div>
              <h2 className="grot text-[24px]">GMV by city</h2>
              <p className="mt-1 flex items-baseline gap-2 text-[13px] font-semibold text-text-2">
                <span className="figure text-[26px] text-text">{inrShort(total)}</span> in the last {range} days
                <span className="inline-flex items-center gap-0.5 font-bold text-calm-ink">
                  <TrendingUp size={13} strokeWidth={2.6} aria-hidden /> {wow}% week on week
                </span>
              </p>
            </div>
            <Segmented items={[...RANGES]} value={range} onChange={setRange} size="sm" tone="ink" />
          </div>
          <div className="mt-3 h-[250px] max-md:h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -6 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="day" tick={CHART.axis} tickLine={false} axisLine={false} interval={range === '30' ? 3 : range === '14' ? 1 : 0} dy={6} />
                <YAxis tick={CHART.axis} tickLine={false} axisLine={false} tickFormatter={(v: number) => inrShort(v)} width={52} />
                <Tooltip {...CHART.tooltip} formatter={(v: number, n: string) => [inr(v), n]} />
                <Area type="monotone" dataKey="ncr" name="Delhi NCR" stackId="g" stroke={CHART.series.ncr} strokeWidth={2} fill={CHART.series.ncr} fillOpacity={0.82} />
                <Area type="monotone" dataKey="chandigarh" name="Chandigarh" stackId="g" stroke={CHART.series.chandigarh} strokeWidth={2} fill={CHART.series.sun} fillOpacity={0.9} />
                <Area type="monotone" dataKey="mohali" name="Mohali" stackId="g" stroke={CHART.series.mohali} strokeWidth={2} fill={CHART.series.mohali} fillOpacity={0.85} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* city split bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-[12px] font-bold">
              <span className="label text-text-2">Walks completed today, by city</span>
              <span className="num text-text-2">{splitTotal} walks</span>
            </div>
            <div className="mt-2 flex h-9 w-full gap-1 overflow-hidden rounded-full" role="img" aria-label={CITY_SPLIT.map((c) => `${c.city} ${c.walks}`).join(', ')}>
              {CITY_SPLIT.map((c) => (
                <motion.span key={c.city} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={spring.page} className="flex origin-left items-center px-3 text-[12px] font-extrabold" style={{ flexGrow: c.walks, flexBasis: 0, background: c.city === 'Chandigarh' ? CHART.series.sun : c.color, color: c.city === 'Chandigarh' ? 'var(--on-sun)' : '#fff' }}>
                  <span className="num truncate">{Math.round((c.walks / splitTotal) * 100)}%</span>
                </motion.span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px] font-semibold text-text-2">
              {CITY_SPLIT.map((c) => (
                <span key={c.city} className="flex items-center gap-1.5">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: c.city === 'Chandigarh' ? CHART.series.sun : c.color }} />
                  {c.city} <span className="num font-bold text-text">{c.walks}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* needs you */}
        <aside className="relative self-start overflow-hidden rounded-[var(--r-container)] bg-sun-soft p-2 pt-5">
          <span aria-hidden className="sun -right-12 -top-14 w-36" />
          <div className="relative px-4">
            <p className="label text-[var(--on-sun-soft)]">Needs you</p>
            <p className="grot mt-1 text-[26px]">{needs.reduce((a, n) => a + n.count, 0)} things before 8</p>
          </div>
          <motion.ul variants={listParent} initial="hidden" animate="show" className="relative mt-3 flex flex-col gap-1">
            {needs.map((n) => (
              <motion.li key={n.label} variants={listItem}>
                <motion.button type="button" whileTap={{ scale: 0.98 }} transition={spring.ui} onClick={() => navigate(n.to)} className="flex min-h-[58px] w-full items-center gap-3 rounded-[var(--r-card)] bg-[var(--surface)] px-3.5 py-2 text-left">
                  <span className="figure w-10 shrink-0 text-center text-[30px]">{n.count}</span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="flex items-center gap-1.5 text-[14px] font-extrabold">
                      <n.icon size={14} strokeWidth={2.5} className="shrink-0 text-accent-ink" aria-hidden />
                      <span className="truncate">{n.label}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] font-semibold text-text-2">{n.sub}</span>
                  </span>
                  <ChevronRight size={17} className="shrink-0 text-text-2" aria-hidden />
                </motion.button>
              </motion.li>
            ))}
          </motion.ul>
        </aside>
      </section>

      {/* live map + activity feed */}
      <section className="mt-10 grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-8 px-8 pb-10 max-md:mt-8 max-md:grid-cols-1 max-md:gap-7 max-md:px-0 max-md:pb-6">
        <div className="min-w-0">
          <MapCanvas className="h-[430px] rounded-[var(--r-container)] max-md:h-[320px] max-md:rounded-none" pins={pins} route={walking ? ROUTE : undefined} progress={walking ? 0.42 : 0} walker={walking ? { photo: 'arjun', label: 'Bruno · live' } : undefined} home={walking ? [30, 72] : undefined}>
            <div className="glass absolute left-3 top-3 flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5">
              <Radio size={15} strokeWidth={2.6} className="text-accent-ink" aria-hidden />
              <span className="text-[13px] font-extrabold">{liveNow} walks live</span>
              <span className="meta text-text-2">Mohali shown</span>
            </div>
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-[var(--r-card)] bg-ink py-2.5 pl-4 pr-2.5 text-on-ink shadow-[var(--shadow-floating)]">
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[14px] font-extrabold">Master map, OTP times and GPS logs</span>
                <span className="block truncate text-[12px] font-semibold text-on-ink-2">6 of {liveNow} in this view · 2 Aggressive-tagged dogs out</span>
              </span>
              <Button size="sm" variant="white" trailing={ArrowRight} onClick={() => navigate('admin.live')}>
                Live operations
              </Button>
            </div>
          </MapCanvas>
        </div>

        <div className="min-w-0 max-md:px-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="grot text-[24px]">Activity</h2>
              <p className="mt-1 text-[13px] font-semibold text-text-2">OTP handovers, uploads, payouts and reviews as they happen</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('admin.analytics')}>
              Analytics
            </Button>
          </div>
          <div className="scroll-y relative mt-3 max-h-[376px] pr-2 max-md:max-h-none">
            <span aria-hidden className="absolute bottom-3 left-[19px] top-3 w-[2px] rounded-full bg-[var(--paper-300)]" />
            <motion.ul variants={listParent} initial="hidden" animate="show" className="relative flex flex-col">
              {feed.map((f) => {
                const I = FEED_ICON[f.kind]
                return (
                  <motion.li key={f.id} variants={listItem} className="flex items-center gap-3 py-[7px]">
                    <span className="relative shrink-0">
                      <Avatar who={f.photo} size={40} className="ring-[3px] ring-[var(--bg)]" />
                      <span className={`absolute -bottom-0.5 -right-1 grid h-[18px] w-[18px] place-items-center rounded-full ring-2 ring-[var(--bg)] ${I.cls}`}>
                        <I.icon size={10} strokeWidth={2.8} aria-hidden />
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[14px] font-extrabold">{f.who}</span>
                      <span className="block truncate text-[13px] font-medium text-text-2">{f.text}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end leading-tight">
                      <span className="meta text-text">{ago(f.mins)}</span>
                      <span className="text-[11px] font-semibold text-text-2">{f.city}</span>
                    </span>
                  </motion.li>
                )
              })}
            </motion.ul>
          </div>
        </div>
      </section>
    </ConsoleShell>
  )
}
