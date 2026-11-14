import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, FileSpreadsheet, FileText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar } from '../../components/Avatar'
import { Certified, Price, Stars } from '../../components/Brand'
import { Button } from '../../components/Button'
import { CHART, ProgressRing, Sparkline } from '../../components/Charts'
import { COHORTS, FUNNEL, HEAT, HEAT_HOURS, HEAT_MAX, HEAT_RAMP, HEAT_ROWS, RANGES, TOP_WALKERS, heatStep, hourLabel, rangeSeries, type DayRow, type RangeId } from '../../data/adminOps'
import { walkerById } from '../../data/cast'
import { inr, inrShort } from '../../data/clock'
import { DEMO_DATE_RANGE } from '../../data/demoFill'
import { useNav } from '../../lib/navigation'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* Business analytics, chart-led. The range control really switches every
   series; each section exports its own report. */

const S = CHART.series
const sumOf = (rows: DayRow[], k: keyof DayRow) => rows.reduce((a, r) => a + (r[k] as number), 0)
const delta = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : 0)
const compact = (n: number) => (n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))

export default function AdminAnalytics() {
  const { toast } = useNav()
  const [range, setRange] = useState<RangeId>(DEMO_DATE_RANGE.preset as RangeId)
  const [from, setFrom] = useState(DEMO_DATE_RANGE.from)
  const [to, setTo] = useState(DEMO_DATE_RANGE.to)
  const [cell, setCell] = useState<{ r: number; h: number }>({ r: 0, h: 1 })

  const data = useMemo(() => rangeSeries(range), [range])
  const { cur, prev, line, bars } = data
  const first = cur[0]
  const last = cur[cur.length - 1]
  const gmv = sumOf(cur, 'gmv')
  const net = sumOf(cur, 'net')
  const bookings = sumOf(cur, 'bookings')
  const pass = sumOf(cur, 'pass')
  const repeat = cur.reduce((a, r) => a + r.repeat, 0) / cur.length
  const prevRepeat = prev.length ? prev.reduce((a, r) => a + r.repeat, 0) / prev.length : repeat
  const hasPrev = prev.length >= cur.length * 0.9
  const slug = `${range}-${to}`

  const pickRange = (id: RangeId) => {
    const r = RANGES.find((x) => x.id === id) ?? RANGES[2]
    setRange(id)
    setFrom(r.from)
    setTo(DEMO_DATE_RANGE.to)
  }
  const exportFile = (section: string, kind: 'csv' | 'pdf') => toast(`vuffora-${section}-${slug}.${kind} is downloading`, 'accent')

  const stats = [
    { k: 'Net revenue', v: inrShort(net), d: delta(net, sumOf(prev, 'net')), sub: 'commission + fees', spark: line.map((r) => r.net) },
    { k: 'Active dogs', v: last.dogs.toLocaleString('en-IN'), d: delta(last.dogs, first.dogs), sub: 'walked at least once', spark: line.map((r) => r.dogs) },
    { k: 'Active walkers', v: last.walkers.toLocaleString('en-IN'), d: delta(last.walkers, first.walkers), sub: 'KYC verified, online', spark: line.map((r) => r.walkers) },
    { k: 'Repeat booking rate', v: `${repeat.toFixed(1)}%`, d: repeat - prevRepeat, sub: 'rebook within 14 days', spark: line.map((r) => r.repeat), pts: true },
  ]
  const sel = { row: HEAT_ROWS[cell.r], hour: HEAT_HOURS[cell.h], v: HEAT[cell.r][cell.h] }
  const rowPeak = HEAT[cell.r].indexOf(Math.max(...HEAT[cell.r]))

  return (
    <ConsoleShell
      active="admin.analytics"
      title="Business analytics"
      sub={`Mohali, Chandigarh and Delhi NCR, ${data.range.noun}`}
      actions={
        <>
          <div role="tablist" aria-label="Range" className="well flex gap-1 rounded-full p-1">
            {RANGES.map((r) => (
              <motion.button key={r.id} role="tab" aria-selected={r.id === range} type="button" whileTap={{ scale: 0.95 }} transition={spring.ui} onClick={() => pickRange(r.id)} className={`num h-9 rounded-full px-3.5 text-[13px] font-extrabold max-md:h-10 ${r.id === range ? 'bg-ink text-on-ink' : 'text-text-2'}`}>
                {r.label}
              </motion.button>
            ))}
          </div>
          <label className="well flex h-11 min-w-0 items-center gap-2 rounded-full px-3 text-[13px] font-bold max-md:w-full">
            <input type="date" aria-label="From date" value={from} max={to} onChange={(e) => { setFrom(e.target.value); toast('Custom range applied to the reports', 'neutral') }} className="num min-w-0 bg-transparent outline-none max-md:flex-1" />
            <span className="text-text-2">to</span>
            <input type="date" aria-label="To date" value={to} min={from} onChange={(e) => { setTo(e.target.value); toast('Custom range applied to the reports', 'neutral') }} className="num min-w-0 bg-transparent outline-none max-md:flex-1" />
          </label>
        </>
      }
    >
      <div className="px-8 pb-10 max-md:px-4 max-md:pb-6">
        {/* GMV, chart-led, with the other headline figures beside it */}
        <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-8 max-md:grid-cols-1 max-md:gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <p className="label text-text-2">GMV in INR</p>
                <p className="mt-1 flex items-end gap-3">
                  <Price amount={gmv} size={68} swoosh className="max-md:!text-[44px]" />
                  {hasPrev && <Delta value={delta(gmv, sumOf(prev, 'gmv'))} className="mb-2" />}
                </p>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                <Legend items={[['Mohali', S.mohali], ['Chandigarh', S.chandigarh], ['Delhi NCR', S.ncr]]} />
                <Exports onCsv={() => exportFile('gmv-by-city', 'csv')} onPdf={() => exportFile('gmv-by-city', 'pdf')} />
              </div>
            </div>
            <div className="mt-3 h-[280px] max-md:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={line} margin={{ top: 6, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="label" tick={CHART.axis} tickLine={false} axisLine={{ stroke: CHART.grid }} interval="preserveStartEnd" minTickGap={34} />
                  <YAxis tick={CHART.axis} tickLine={false} axisLine={false} width={46} tickFormatter={(v: number) => `₹${compact(v)}`} />
                  <Tooltip {...CHART.tooltip} formatter={(v: number, n: string) => [inr(v), n]} />
                  <Area type="monotone" dataKey="mohali" name="Mohali" stackId="c" animationDuration={450} stroke={S.mohali} strokeWidth={1.5} fill={S.mohali} fillOpacity={0.82} />
                  <Area type="monotone" dataKey="chandigarh" name="Chandigarh" stackId="c" animationDuration={450} stroke={S.chandigarh} strokeWidth={1.5} fill={S.sun} fillOpacity={0.9} />
                  <Area type="monotone" dataKey="ncr" name="Delhi NCR" stackId="c" animationDuration={450} stroke={S.ncr} strokeWidth={1.5} fill={S.ncr} fillOpacity={0.86} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-[12px] font-semibold text-text-2">{range === '7d' ? 'Saturday and Sunday carry the week.' : range === '12m' ? 'Weekly totals. The July dip is the monsoon; the late October peak is the festival fortnight.' : 'Weekends lead, Wednesdays dip. The peak around 25 Oct is the festival fortnight.'}</p>
          </div>

          <motion.dl variants={listParent} initial="hidden" animate="show" key={range} className="flex flex-col divide-y divide-[var(--rule)] max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:divide-y-0">
            {stats.map((s) => (
              <motion.div key={s.k} variants={listItem} className="flex items-end justify-between gap-3 py-3.5 first:pt-0 max-md:py-2.5 max-md:first:pt-2.5">
                <div className="min-w-0">
                  <dt className="text-[12px] font-bold text-text-2">{s.k}</dt>
                  <dd className="figure num mt-1 text-[34px] max-md:text-[28px]">{s.v}</dd>
                  <dd className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] font-semibold text-text-2">{(hasPrev || s.k.startsWith('Active')) && <Delta value={s.d} pts={s.pts} />} <span>{s.sub}</span></dd>
                </div>
                <span className="max-md:hidden"><Sparkline data={s.spark} width={84} height={34} /></span>
              </motion.div>
            ))}
          </motion.dl>
        </section>

        {/* net revenue vs GMV, booking mix */}
        <section className="mt-9 grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)] gap-7 max-md:grid-cols-1 max-md:gap-7">
          <ChartBlock title="Net revenue vs GMV" legend={[['GMV', S.muted], ['Net revenue', S.primary]]} note={`Take rate ${((net / gmv) * 100).toFixed(1)}% after the Walk Now fee`} onCsv={() => exportFile('net-revenue', 'csv')} onPdf={() => exportFile('net-revenue', 'pdf')}>
            <ComposedChart data={bars} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="label" tick={CHART.axis} tickLine={false} axisLine={{ stroke: CHART.grid }} minTickGap={18} />
              <YAxis tick={CHART.axis} tickLine={false} axisLine={false} width={46} tickFormatter={(v: number) => `₹${compact(v)}`} />
              <Tooltip {...CHART.tooltip} cursor={{ fill: 'rgb(14 27 87 / 0.05)' }} formatter={(v: number, n: string) => [inr(v), n]} />
              <Bar dataKey="gmv" name="GMV" fill={S.muted} radius={[3, 3, 0, 0]} maxBarSize={18} />
              <Line type="monotone" dataKey="net" name="Net revenue" stroke={S.primary} strokeWidth={2} dot={{ r: 2.5, fill: S.primary, strokeWidth: 0 }} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ChartBlock>
          <ChartBlock title="Calm vs Aggressive" legend={[['Calm', S.calm], ['Aggressive', S.reactive]]} note={`${((sumOf(cur, 'reactive') / bookings) * 100).toFixed(1)}% of walks carry the surcharge`} onCsv={() => exportFile('temperament-mix', 'csv')} onPdf={() => exportFile('temperament-mix', 'pdf')}>
            <BarChart data={bars} margin={{ top: 6, right: 4, left: 0, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="label" tick={CHART.axis} tickLine={false} axisLine={{ stroke: CHART.grid }} minTickGap={18} />
              <YAxis tick={CHART.axis} tickLine={false} axisLine={false} width={34} tickFormatter={compact} />
              <Tooltip {...CHART.tooltip} cursor={{ fill: 'rgb(14 27 87 / 0.05)' }} />
              <Bar dataKey="calm" name="Calm" stackId="t" fill={S.calm} maxBarSize={14} />
              <Bar dataKey="reactive" name="Aggressive" stackId="t" fill={S.reactive} radius={[3, 3, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ChartBlock>
          <ChartBlock title="Walk Now vs Scheduled" legend={[['Scheduled', S.tertiary], ['Walk Now', S.sun]]} note={`${((sumOf(cur, 'now') / bookings) * 100).toFixed(1)}% booked on the spot`} onCsv={() => exportFile('booking-mode', 'csv')} onPdf={() => exportFile('booking-mode', 'pdf')}>
            <BarChart data={bars} margin={{ top: 6, right: 4, left: 0, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="label" tick={CHART.axis} tickLine={false} axisLine={{ stroke: CHART.grid }} minTickGap={18} />
              <YAxis tick={CHART.axis} tickLine={false} axisLine={false} width={34} tickFormatter={compact} />
              <Tooltip {...CHART.tooltip} cursor={{ fill: 'rgb(14 27 87 / 0.05)' }} />
              <Bar dataKey="scheduled" name="Scheduled" stackId="m" fill={S.tertiary} maxBarSize={14} />
              <Bar dataKey="now" name="Walk Now" stackId="m" fill={S.sun} radius={[3, 3, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ChartBlock>
        </section>

        {/* geographic demand heatmap: full-bleed ink band */}
        <section className="-mx-8 mt-10 bg-ink px-8 py-7 text-on-ink max-md:-mx-4 max-md:px-4 max-md:py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label text-on-ink-2">Geographic demand heatmap</p>
              <h2 className="grot mt-1 text-[28px] max-md:text-[24px]">Where and when dogs need walking</h2>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-on-ink-2">
                <span>Quiet</span>
                <span className="flex overflow-hidden rounded-full">{HEAT_RAMP.map((c) => <span key={c} className="h-3 w-6" style={{ background: c }} />)}</span>
                <span>{HEAT_MAX} walks / wk</span>
              </div>
              <Exports dark onCsv={() => exportFile('demand-heatmap', 'csv')} onPdf={() => exportFile('demand-heatmap', 'pdf')} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_250px] gap-7 max-md:grid-cols-1 max-md:gap-5">
            <div className="min-w-0 overflow-x-auto [scrollbar-width:none] max-md:-mx-4 max-md:px-4">
              <div role="grid" aria-label="Bookings per week by locality and hour" className="grid min-w-[640px] items-center gap-[3px]" style={{ gridTemplateColumns: `168px repeat(${HEAT_HOURS.length}, minmax(0, 1fr))` }}>
                <span />
                {HEAT_HOURS.map((h, i) => (
                  <span key={h} className={`meta pb-1 text-center ${i === cell.h ? 'font-bold text-sun-light' : 'text-on-ink-2'}`}>{i % 2 === 0 || i === cell.h ? hourLabel(h).replace(' ', '') : ''}</span>
                ))}
                {HEAT_ROWS.map((row, r) => (
                  <Row key={row.locality} label={row.locality} on={r === cell.r}>
                    {HEAT[r].map((v, h) => {
                      const on = r === cell.r && h === cell.h
                      return (
                        <button key={h} type="button" role="gridcell" aria-selected={on} aria-label={`${row.locality}, ${hourLabel(HEAT_HOURS[h])}: ${v} walks a week`} title={`${row.locality} · ${hourLabel(HEAT_HOURS[h])} · ${v} walks / wk`} onClick={() => setCell({ r, h })} className={`h-[26px] rounded-[5px] transition-transform duration-100 hover:scale-110 ${on ? 'relative z-10 scale-110 ring-2 ring-white' : ''}`} style={{ background: HEAT_RAMP[heatStep(v)] }} />
                      )
                    })}
                  </Row>
                ))}
              </div>
            </div>
            <motion.div key={`${cell.r}-${cell.h}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-[var(--r-card)] bg-[rgb(255_255_255/0.08)] p-4">
              <p className="label text-on-ink-2">Selected cell</p>
              <p className="mt-1.5 text-[15px] font-extrabold leading-tight">{sel.row.locality}</p>
              <p className="text-[13px] font-semibold text-on-ink-2">{hourLabel(sel.hour)} to {hourLabel(sel.hour + 1)} · {sel.row.city}</p>
              <p className="figure num mt-3 text-[56px] text-sun-light">{sel.v}<span className="unit text-on-ink">walks / week</span></p>
              <p className="mt-3 text-[12px] font-semibold leading-snug text-on-ink-2">Peak here is {hourLabel(HEAT_HOURS[rowPeak])} with {HEAT[cell.r][rowPeak]} walks. {sel.v >= HEAT_MAX * 0.6 ? 'Keep at least four walkers online in this hour.' : sel.v <= HEAT_MAX * 0.15 ? 'Low demand. No surge needed.' : 'Two walkers online cover this hour.'}</p>
            </motion.div>
          </div>
        </section>

        {/* leaderboard, walk pass share, funnel + cohorts */}
        <section className="mt-9 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 max-md:grid-cols-1 max-md:gap-8">
          <div className="min-w-0">
            <BlockHead title="Top walkers" onCsv={() => exportFile('top-walkers', 'csv')} onPdf={() => exportFile('top-walkers', 'pdf')} />
            <motion.ol variants={listParent} initial="hidden" animate="show" className="mt-2">
              {TOP_WALKERS.map((t, i) => {
                const w = walkerById(t.walkerId)
                return (
                  <motion.li key={t.walkerId} variants={listItem} className="flex items-center gap-3 border-b border-[var(--rule)] py-2.5">
                    <span className={`figure num w-6 shrink-0 text-center text-[20px] ${i < 3 ? 'text-accent-ink' : 'text-text-2'}`}>{i + 1}</span>
                    <Avatar who={w.photo} size={38} ring={i === 0} />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="flex items-center gap-2"><span className="truncate text-[14px] font-extrabold">{w.name}</span>{w.certified && <Certified short className="max-md:hidden" />}</p>
                      <p className="mt-0.5 flex items-center gap-2 truncate text-[12px] font-semibold text-text-2"><Stars rating={w.rating} size={12} /> {w.locality}</p>
                    </div>
                    <span className="max-md:hidden"><Sparkline data={t.trend} width={64} height={24} color={t.trend[11] < t.trend[0] ? S.danger : S.primary} /></span>
                    <span className="w-[76px] shrink-0 text-right leading-tight">
                      <span className="num block text-[14px] font-extrabold">{inrShort(t.gmv)}</span>
                      <span className="num block text-[12px] font-semibold text-text-2">{t.walks} walks</span>
                    </span>
                    <span className="num w-[52px] shrink-0 text-right text-[12px] font-bold text-text-2 max-md:hidden">{t.repeat}% repeat</span>
                  </motion.li>
                )
              })}
            </motion.ol>
          </div>

          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[var(--r-container)] bg-accent p-5 text-on-accent">
              <span aria-hidden className="sun -right-16 -top-28 w-40" />
              <div className="relative flex items-center gap-4">
                <ProgressRing value={(pass / bookings) * 100} size={92} stroke={9} color="var(--sun)">
                  <span className="figure num text-[24px]">{Math.round((pass / bookings) * 100)}%</span>
                </ProgressRing>
                <div className="min-w-0 pr-14">
                  <p className="label text-[var(--on-accent-2)]">Walk Pass share</p>
                  <p className="grot mt-1 text-[22px]">{compact(pass)} of {compact(bookings)} walks were on a pass</p>
                  <p className="mt-1 text-[12px] font-semibold text-[var(--on-accent-2)]">Up from {Math.round((first.pass / first.bookings) * 100)}% at the start of the range.</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <BlockHead title="Booking funnel" onCsv={() => exportFile('funnel', 'csv')} onPdf={() => exportFile('funnel', 'pdf')} />
              <ol className="mt-3 flex flex-col gap-2">
                {FUNNEL.map((f, i) => (
                  <li key={f.step}>
                    <p className="flex items-baseline justify-between gap-3 text-[13px] font-bold">
                      <span className="truncate">{f.step}</span>
                      <span className="num shrink-0">{f.count.toLocaleString('en-IN')}{i > 0 && <span className="ml-2 font-semibold text-text-2">{Math.round((f.count / FUNNEL[i - 1].count) * 100)}%</span>}</span>
                    </p>
                    <span className="mt-1 block h-[6px] w-full rounded-full bg-[rgb(14_27_87/0.08)]">
                      <motion.span className={`block h-full origin-left rounded-full ${i === FUNNEL.length - 1 ? 'bg-sun' : 'bg-accent'}`} style={{ width: `${(f.count / FUNNEL[0].count) * 100}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ ...spring.page, delay: i * 0.05 }} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6">
              <h3 className="text-[15px] font-extrabold">Repeat cohorts <span className="font-semibold text-text-2">· % of first-time owners still booking, by week</span></h3>
              <div className="mt-2 grid items-center gap-[3px] text-center" style={{ gridTemplateColumns: '64px repeat(8, minmax(0, 1fr))' }}>
                <span />
                {Array.from({ length: 8 }, (_, w) => <span key={w} className="meta text-text-2">W{w}</span>)}
                {COHORTS.map((c) => (
                  <Row key={c.cohort} label={`${c.cohort} · ${compact(c.size)}`} light>
                    {Array.from({ length: 8 }, (_, w) => {
                      const v = c.weeks[w]
                      return v === undefined ? <span key={w} className="h-7 rounded-[5px] bg-[var(--surface-high)]" /> : <span key={w} className="num grid h-7 place-items-center rounded-[5px] text-[11px] font-bold" style={{ background: `rgb(35 72 214 / ${0.08 + (v / 100) * 0.92})`, color: v >= 62 ? '#fff' : 'var(--text)' }}>{v}</span>
                    })}
                  </Row>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </ConsoleShell>
  )
}

function Row({ label, children, on = false, light = false }: { label: string; children: React.ReactNode; on?: boolean; light?: boolean }) {
  return (
    <>
      <span className={`truncate pr-2 text-left text-[12px] font-bold ${light ? 'text-text-2' : on ? 'text-sun-light' : 'text-on-ink'}`}>{label}</span>
      {children}
    </>
  )
}

function Delta({ value, pts = false, className = '' }: { value: number; pts?: boolean; className?: string }) {
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`num inline-flex h-6 shrink-0 items-center gap-0.5 rounded-full px-2 text-[12px] font-extrabold ${up ? 'bg-success-soft text-[var(--on-success-soft)]' : 'bg-danger-soft text-[var(--on-danger-soft)]'} ${className}`}>
      <Icon size={13} strokeWidth={2.8} aria-hidden />
      {Math.abs(value).toFixed(1)}{pts ? ' pts' : '%'}
    </span>
  )
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold text-text-2">
      {items.map(([label, color]) => (
        <span key={label} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} /> {label}</span>
      ))}
    </span>
  )
}

function Exports({ onCsv, onPdf, dark = false }: { onCsv: () => void; onPdf: () => void; dark?: boolean }) {
  const cls = dark ? '!bg-[rgb(255_255_255/0.12)] !text-white !ring-0' : ''
  return (
    <span className="flex shrink-0 gap-1.5">
      <Button size="sm" variant="outline" icon={FileSpreadsheet} className={`max-md:h-11 ${cls}`} onClick={onCsv}>Export CSV</Button>
      <Button size="sm" variant="outline" icon={FileText} className={`max-md:h-11 ${cls}`} onClick={onPdf}>Export PDF</Button>
    </span>
  )
}

function BlockHead({ title, onCsv, onPdf }: { title: string; onCsv: () => void; onPdf: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="grot text-[24px]">{title}</h2>
      <Exports onCsv={onCsv} onPdf={onPdf} />
    </div>
  )
}

function ChartBlock({ title, legend, note, children, onCsv, onPdf }: { title: string; legend: [string, string][]; note: string; children: React.ReactElement; onCsv: () => void; onPdf: () => void }) {
  return (
    <div className="min-w-0">
      <h3 className="text-[15px] font-extrabold">{title}</h3>
      <div className="mt-1.5"><Legend items={legend} /></div>
      <div className="mt-2 h-[190px]">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="min-w-0 text-[12px] font-semibold leading-snug text-text-2">{note}</p>
        <span className="flex shrink-0 gap-1">
          <button type="button" onClick={onCsv} className="h-8 rounded-full px-2.5 text-[12px] font-bold text-accent-ink hover:bg-accent-soft max-md:h-11">Export CSV</button>
          <button type="button" onClick={onPdf} className="h-8 rounded-full px-2.5 text-[12px] font-bold text-accent-ink hover:bg-accent-soft max-md:h-11">Export PDF</button>
        </span>
      </div>
    </div>
  )
}
