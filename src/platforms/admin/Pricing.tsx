import { motion } from 'framer-motion'
import { CloudRain, Minus, Moon, PartyPopper, Plus, RotateCcw, Send, ShieldAlert, Sunrise, Ticket, TrendingUp, Zap, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Price, TemperBadge } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Toggle } from '../../components/Form'
import { Segmented } from '../../components/Tabs'
import { RATE_LOG, SURGE_RULES, type RateChange } from '../../data/adminOps'
import type { Temperament } from '../../data/cast'
import { inr } from '../../data/clock'
import { DEFAULT_PRICING, quote, type Duration } from '../../data/core'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* Dynamic pricing & commission engine. Every control writes to the
   session's rate card, and the Owner App reads its prices from the same
   place, so a change here changes what Ananya is quoted. The right rail is
   a live preview of one walk: owner pays, walker earns, Vuffora keeps. */

const DURATIONS: Duration[] = [30, 45, 60]
const RULE_ICON: Record<string, LucideIcon> = { rain: CloudRain, peak: Sunrise, festival: PartyPopper, night: Moon }
const FEATURED_FEE_DEMO = 149

export default function AdminPricing() {
  const { toast } = useNav()
  const pricing = useSession((s) => s.pricing)
  const [rules, setRules] = useState<string[]>([])
  const [featured, setFeatured] = useState(FEATURED_FEE_DEMO)
  const [featuredOn, setFeaturedOn] = useState(true)
  const [published, setPublished] = useState(() => JSON.stringify(pricing))
  const [log, setLog] = useState<RateChange[]>(RATE_LOG)
  /* preview scenario */
  const [temper, setTemper] = useState<Temperament>('calm')
  const [dur, setDur] = useState<Duration>(45)
  const [mode, setMode] = useState<'now' | 'later'>('now')

  const dirty = JSON.stringify(pricing) !== published
  const q = quote(pricing, dur, temper, mode === 'now')
  const keeps = q.commission + q.instant
  const perWalk = quote(pricing, 30, 'calm', false).total
  const passPrice = Math.round(perWalk * pricing.passWalks * (1 - pricing.passDiscountPct / 100))

  const toggleRule = (id: string, on: boolean) => {
    const next = on ? [...rules, id] : rules.filter((r) => r !== id)
    setRules(next)
    const mult = Math.max(1, ...SURGE_RULES.filter((r) => next.includes(r.id)).map((r) => r.mult))
    session.setPricing({ surge: mult })
  }
  const publish = () => {
    if (dirty) setLog((l) => [{ id: `rc-${l.length}`, who: 'Kavya Nair', photo: 'kavya', when: 'Just now', what: 'Rate card published from the console', from: 'Draft', to: 'Live' }, ...l])
    setPublished(JSON.stringify(pricing))
    toast('Rate card live in the Owner App', 'accent')
  }
  const resetAll = () => {
    session.setPricing(DEFAULT_PRICING)
    setRules([])
    setFeatured(FEATURED_FEE_DEMO)
    toast('Rate card reset to the default demo values', 'neutral')
  }

  return (
    <ConsoleShell
      active="admin.pricing"
      title="Pricing & commission"
      sub="One rate card for every city. The Owner App quotes from it the moment it changes."
      actions={
        <>
          <Badge tone={dirty ? 'warn' : 'success'}>{dirty ? 'Unpublished changes' : 'Published'}</Badge>
          <Button size="sm" variant="outline" icon={RotateCcw} className="max-md:h-11" onClick={resetAll}>Reset to defaults</Button>
          <Button size="sm" icon={Send} className="max-md:h-11" onClick={publish}>Publish</Button>
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)_404px] items-start gap-6 px-8 pb-10 max-md:grid-cols-1 max-md:gap-5 max-md:px-4 max-md:pb-6">
        {/* ── the rate card editor ── */}
        <div className="min-w-0">
          {/* base rates: yellow band */}
          <section className="relative overflow-hidden rounded-[var(--r-container)] bg-sun p-5 text-on-sun max-md:p-4">
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-24 aspect-square w-[300px] rounded-full bg-[rgb(255_255_255/0.32)]" />
            <div className="relative flex items-end justify-between gap-3">
              <div>
                <p className="label">Base walk rates</p>
                <h2 className="grot mt-1 text-[26px]">What a walk costs before anything is added</h2>
              </div>
              <span className="meta shrink-0 max-md:hidden">INR, before GST</span>
            </div>
            <div className="relative mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
              {DURATIONS.map((d) => (
                <div key={d} className="rounded-[var(--r-card)] bg-[var(--surface)] p-4 text-text shadow-[var(--shadow-raised)]">
                  <p className="flex items-baseline justify-between">
                    <span className="grot text-[22px]">{d} min</span>
                    <span className="meta text-text-2">{inr(Math.round((pricing.base[d] / d) * 10) / 10)} / min</span>
                  </p>
                  <NumField label={`Base rate ${d} min`} value={pricing.base[d]} onChange={(v) => session.setBase(d, v)} step={10} min={50} max={1999} prefix="₹" big className="mt-3" />
                  {pricing.surge > 1 && <p className="mt-2 text-[12px] font-bold text-warn">{inr(Math.round(pricing.base[d] * pricing.surge))} while surge is on</p>}
                </div>
              ))}
            </div>
          </section>

          {/* surcharges and tax: on the page, no card */}
          <section className="mt-7 grid grid-cols-3 gap-x-6 gap-y-5 max-md:grid-cols-1">
            <div>
              <h3 className="flex items-center gap-2 text-[15px] font-extrabold"><ShieldAlert size={17} className="text-reactive-ink" aria-hidden /> Aggressive dog surcharge</h3>
              <p className="mt-1 text-[13px] font-medium leading-snug text-text-2">Added to every walk with a dog tagged <TemperBadge t="reactive" className="align-middle" />. Shared with the walker.</p>
              <NumField label="Aggressive dog surcharge" value={pricing.reactiveSurcharge} onChange={(v) => session.setPricing({ reactiveSurcharge: v })} step={10} max={999} prefix="₹" className="mt-3" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-[15px] font-extrabold"><Zap size={17} className="text-accent-ink" aria-hidden /> Walk Now convenience fee</h3>
              <p className="mt-1 text-[13px] font-medium leading-snug text-text-2">Charged on instant bookings only. Stays with the platform, not in the commission base.</p>
              <NumField label="Walk Now convenience fee" value={pricing.instantFee} onChange={(v) => session.setPricing({ instantFee: v })} step={5} max={499} prefix="₹" className="mt-3" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-[15px] font-extrabold"><span className="meta rounded-[5px] bg-[var(--surface-high)] px-1.5 py-0.5 text-text">GST</span> Tax on the bill</h3>
              <p className="mt-1 text-[13px] font-medium leading-snug text-text-2">Applied to the subtotal and shown as its own line on the owner’s invoice.</p>
              <NumField label="GST percent" value={pricing.gstPct} onChange={(v) => session.setPricing({ gstPct: v })} step={1} max={28} suffix="%" className="mt-3" />
            </div>
          </section>

          {/* surge: ink panel */}
          <section className="relative mt-7 overflow-hidden rounded-[var(--r-container)] bg-ink p-5 text-on-ink max-md:p-4">
            <div className="grid grid-cols-[230px_minmax(0,1fr)] gap-6 max-md:grid-cols-1 max-md:gap-4">
              <div>
                <p className="label flex items-center gap-1.5 text-on-ink-2"><TrendingUp size={13} strokeWidth={2.6} aria-hidden /> Surge pricing rule</p>
                <p className="figure num mt-2 text-[72px] text-sun-light">
                  {pricing.surge.toFixed(2)}
                  <span className="unit text-on-ink">×</span>
                </p>
                <input type="range" min={1} max={2} step={0.05} value={pricing.surge} aria-label="Surge multiplier" onChange={(e) => session.setPricing({ surge: Number(e.target.value) })} className="mt-3 h-11 w-full cursor-pointer accent-[var(--sun)]" />
                <div className="meta flex justify-between text-on-ink-2"><span>1.0× off</span><span>1.5×</span><span>2.0×</span></div>
                <p className="mt-3 text-[12px] font-semibold leading-snug text-on-ink-2">{pricing.surge > 1 ? `A 45 min walk is quoted at ${inr(Math.round(pricing.base[45] * pricing.surge))} instead of ${inr(pricing.base[45])}.` : 'Surge is off. Owners see the base rates.'}</p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {SURGE_RULES.map((r) => {
                  const on = rules.includes(r.id)
                  const Icon = RULE_ICON[r.id]
                  return (
                    <li key={r.id} className={`flex items-center gap-3 rounded-[var(--r-card)] px-3.5 py-2.5 transition-colors duration-150 ${on ? 'bg-[rgb(255_198_5/0.16)]' : 'bg-[rgb(255_255_255/0.07)]'}`}>
                      <Icon size={19} className={on ? 'shrink-0 text-sun-light' : 'shrink-0 text-on-ink-2'} aria-hidden />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="text-[14px] font-extrabold">{r.label}</p>
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-on-ink-2">{r.when}</p>
                      </div>
                      <span className="num shrink-0 text-[15px] font-extrabold text-sun-light">{r.mult.toFixed(2)}×</span>
                      <Toggle on={on} onChange={(v) => toggleRule(r.id, v)} label={`${r.label} surge rule`} />
                    </li>
                  )
                })}
                <li className="px-1 pt-1 text-[12px] font-semibold text-on-ink-2">When several rules are on, the highest multiplier applies. The slider overrides them by hand.</li>
              </ul>
            </div>
          </section>

          {/* commission: the take rate, big */}
          <section className="mt-7 grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-8 max-md:grid-cols-1 max-md:gap-4">
            <div>
              <p className="label text-text-2">Platform commission</p>
              <p className="figure num mt-1 text-[96px] max-md:text-[80px]">
                <span className="swoosh">{pricing.commissionPct}</span>
                <span className="unit">%</span>
              </p>
              <p className="mt-3 text-[15px] font-bold">of every completed walk goes to Vuffora</p>
            </div>
            <div>
              <input type="range" min={15} max={25} step={1} value={pricing.commissionPct} aria-label="Platform commission percent" onChange={(e) => session.setPricing({ commissionPct: Number(e.target.value) })} className="h-11 w-full cursor-pointer accent-[var(--accent)]" />
              <div className="meta flex justify-between text-text-2">
                {[15, 17, 19, 21, 23, 25].map((n) => <span key={n}>{n}%</span>)}
              </div>
              <p className="mt-3 text-[13px] font-medium leading-snug text-text-2">
                Deducted from the walk fee and any aggressive dog surcharge before the walker’s payout. On a {inr(quote(pricing, 45, 'calm', false).base)} walk the walker keeps <b className="font-extrabold text-text">{inr(quote(pricing, 45, 'calm', false).walkerNet)}</b>.
              </p>
            </div>
          </section>

          {/* walk pass + featured listing */}
          <section className="mt-7 grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div className="relative overflow-hidden rounded-[var(--r-container)] bg-accent p-5 text-on-accent">
              <span aria-hidden className="sun -right-14 -top-24 w-36" />
              <p className="label relative flex items-center gap-1.5 text-[var(--on-accent-2)]"><Ticket size={13} strokeWidth={2.6} aria-hidden /> Walk Pass</p>
              <p className="grot relative mt-1.5 pr-16 text-[24px]">{pricing.passWalks} walks a month, {pricing.passDiscountPct}% off</p>
              <div className="relative mt-4 grid grid-cols-2 gap-3">
                <NumField label="Walks in the pass" value={pricing.passWalks} onChange={(v) => session.setPricing({ passWalks: v })} step={1} min={4} max={60} caption="Walks in the pass" onDark />
                <NumField label="Walk Pass discount percent" value={pricing.passDiscountPct} onChange={(v) => session.setPricing({ passDiscountPct: v })} step={1} max={40} suffix="%" caption="Discount" onDark />
              </div>
              <p className="relative mt-3 text-[13px] font-semibold text-[var(--on-accent-2)]">A pass of 30 min calm walks sells at {inr(passPrice)} with GST, against {inr(perWalk * pricing.passWalks)} booked one by one.</p>
            </div>
            <div className="rounded-[var(--r-container)] bg-[var(--surface)] p-5 shadow-[var(--shadow-raised)]">
              <div className="flex items-center justify-between gap-3">
                <p className="label text-text-2">Featured walker listing</p>
                <Toggle on={featuredOn} onChange={(v) => { setFeaturedOn(v); toast(v ? 'Featured listings are on sale to top-rated walkers' : 'Featured listings paused', 'neutral') }} label="Sell featured listings" />
              </div>
              <p className="grot mt-1.5 text-[24px]">Top of local search for a week</p>
              <NumField label="Featured listing weekly fee" value={featured} onChange={setFeatured} step={10} max={999} prefix="₹" suffix="per week" className="mt-4" />
              <p className="mt-3 text-[13px] font-medium leading-snug text-text-2">Verified walkers rated 4.7 and above can buy it. <Badge tone="warn" className="align-middle">Demo value</Badge> The fee is to be confirmed; it is not part of the owner’s bill.</p>
            </div>
          </section>

          {/* change log with a spine */}
          <section className="mt-8">
            <div className="flex items-baseline justify-between">
              <h2 className="grot text-[24px]">Change log</h2>
              <span className="meta text-text-2">{log.length} entries</span>
            </div>
            <motion.ol variants={listParent} initial="hidden" animate="show" className="relative mt-3 pl-7">
              <span aria-hidden className="absolute bottom-4 left-[9px] top-3 w-[2px] rounded-full bg-[var(--paper-300)]" />
              {log.map((c, i) => (
                <motion.li key={c.id} variants={listItem} className="relative flex items-center gap-3 py-2.5 max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-1">
                  <span aria-hidden className={`absolute -left-7 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full ring-4 ring-[var(--bg)] ${i === 0 ? 'bg-accent' : 'bg-[var(--paper-300)]'}`} />
                  <Avatar who={c.photo} size={30} />
                  <div className="min-w-0 flex-1 leading-tight max-md:basis-[calc(100%-50px)]">
                    <p className="truncate text-[14px] font-bold">{c.what}</p>
                    <p className="mt-0.5 text-[12px] font-semibold text-text-2">{c.who} · {c.when}</p>
                  </div>
                  <span className="meta flex shrink-0 items-center gap-2 max-md:pl-[42px]">
                    <span className="text-text-2 line-through">{c.from}</span>
                    <span aria-hidden className="text-text-2">to</span>
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 font-bold text-[var(--on-accent-soft)]">{c.to}</span>
                  </span>
                </motion.li>
              ))}
            </motion.ol>
          </section>
        </div>

        {/* ── live preview (sticky inspector) ── */}
        <aside aria-label="Live preview" className="sticky top-4 rounded-[var(--r-container)] bg-[var(--surface)] p-5 shadow-[var(--shadow-floating)] max-md:static max-md:p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="grot text-[22px]">Live preview</h2>
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-text-2"><span className="h-2 w-2 animate-pulse rounded-full bg-calm" /> Follows the rate card</span>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Segmented full size="sm" tone="accent" value={temper} onChange={setTemper} items={[{ id: 'calm', label: 'Calm' }, { id: 'reactive', label: 'Aggressive' }]} />
            <Segmented full size="sm" tone="accent" value={String(dur) as '30' | '45' | '60'} onChange={(v) => setDur(Number(v) as Duration)} items={[{ id: '30', label: '30 min' }, { id: '45', label: '45 min' }, { id: '60', label: '60 min' }]} />
            <Segmented full size="sm" tone="accent" value={mode} onChange={setMode} items={[{ id: 'now', label: 'Walk Now' }, { id: 'later', label: 'Scheduled' }]} />
          </div>

          <div className="mt-4">
            <p className="label text-text-2">Owner pays</p>
            <Price amount={q.total} size={52} swoosh />
          </div>
          <dl className="mt-3 flex flex-col gap-1 text-[13px] font-semibold">
            <Line k={`Walk fee, ${dur} min${pricing.surge > 1 ? ` at ${pricing.surge.toFixed(2)}×` : ''}`} v={inr(q.base)} />
            {q.surcharge > 0 && <Line k="Aggressive dog surcharge" v={inr(q.surcharge)} />}
            {q.instant > 0 && <Line k="Walk Now convenience fee" v={inr(q.instant)} />}
            <Line k={`GST at ${pricing.gstPct}%`} v={inr(q.gst)} />
          </dl>

          {/* stacked split */}
          <div className="mt-4 flex h-3.5 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`Walker ${inr(q.walkerNet)}, Vuffora ${inr(keeps)}, GST ${inr(q.gst)}`}>
            <motion.span className="h-full bg-accent" animate={{ flexGrow: q.walkerNet }} transition={spring.ui} style={{ flexBasis: 0 }} />
            <motion.span className="h-full bg-sun" animate={{ flexGrow: Math.max(1, keeps) }} transition={spring.ui} style={{ flexBasis: 0 }} />
            <motion.span className="h-full bg-[var(--paper-400)]" animate={{ flexGrow: Math.max(1, q.gst) }} transition={spring.ui} style={{ flexBasis: 0 }} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Split dot="bg-accent" label="Walker earns" amount={q.walkerNet} share={q.walkerNet / q.total} />
            <Split dot="bg-sun" label="Vuffora keeps" amount={keeps} share={keeps / q.total} />
            <Split dot="bg-[var(--paper-400)]" label="GST" amount={q.gst} share={q.gst / q.total} />
          </div>

          {/* all six combinations */}
          <table className="mt-4 w-full text-left text-[13px]">
            <thead>
              <tr className="label text-text-2">
                <th className="pb-2 font-extrabold">Walk</th>
                <th className="pb-2 text-right font-extrabold">Owner</th>
                <th className="pb-2 text-right font-extrabold">Walker</th>
                <th className="pb-2 text-right font-extrabold">Vuffora</th>
              </tr>
            </thead>
            <tbody>
              {(['calm', 'reactive'] as Temperament[]).flatMap((t) =>
                DURATIONS.map((d) => {
                  const c = quote(pricing, d, t, mode === 'now')
                  const on = t === temper && d === dur
                  return (
                    <tr key={t + d} onClick={() => { setTemper(t); setDur(d) }} className={`cursor-pointer ${on ? 'bg-accent-soft' : 'hover:bg-[var(--surface-raised)]'}`}>
                      <td className="rounded-l-[10px] py-1.5 pl-2">
                        <span className="flex items-center gap-2 font-bold">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${t === 'calm' ? 'bg-calm' : 'bg-reactive'}`} />
                          {d} min {t === 'calm' ? 'calm' : 'aggressive'}
                        </span>
                      </td>
                      <td className="num py-1.5 text-right font-extrabold">{inr(c.total)}</td>
                      <td className="num py-1.5 text-right font-semibold">{inr(c.walkerNet)}</td>
                      <td className="num rounded-r-[10px] py-1.5 pr-2 text-right font-semibold">{inr(c.commission + c.instant)}</td>
                    </tr>
                  )
                }),
              )}
            </tbody>
          </table>
        </aside>
      </div>
    </ConsoleShell>
  )
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="min-w-0 truncate text-text-2">{k}</dt>
      <dd className="num shrink-0 font-bold">{v}</dd>
    </div>
  )
}

function Split({ dot, label, amount, share }: { dot: string; label: string; amount: number; share: number }) {
  return (
    <div className="min-w-0 leading-tight">
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-text-2"><span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} /> <span className="truncate">{label}</span></p>
      <Price amount={amount} size={26} className="mt-1" />
      <p className="meta mt-0.5 text-text-2">{Math.round(share * 100)}% of bill</p>
    </div>
  )
}

/** Number input with a unit and +/- steppers. Mounts filled; clamps on every change. */
function NumField({ label, value, onChange, step = 1, min = 0, max = 9999, prefix, suffix, caption, big = false, onDark = false, className = '' }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; prefix?: string; suffix?: string; caption?: string; big?: boolean; onDark?: boolean; className?: string }) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n)))
  const btn = `grid h-9 w-9 shrink-0 place-items-center rounded-full max-md:h-11 max-md:w-11 ${onDark ? 'bg-[rgb(255_255_255/0.16)] text-white' : 'bg-[var(--surface-high)] text-text'}`
  return (
    <div className={className}>
      {caption && <p className={`mb-1.5 text-[12px] font-bold ${onDark ? 'text-[var(--on-accent-2)]' : 'text-text-2'}`}>{caption}</p>}
      <div className={`flex items-center gap-1.5 rounded-full p-1 ${onDark ? 'bg-[rgb(10_18_56/0.28)]' : 'well'}`}>
        <motion.button type="button" whileTap={{ scale: 0.9 }} transition={spring.ui} aria-label={`Lower ${label}`} onClick={() => onChange(clamp(value - step))} className={btn}>
          <Minus size={16} strokeWidth={2.6} aria-hidden />
        </motion.button>
        <label className="flex min-w-0 flex-1 items-baseline justify-center gap-1">
          {prefix && <span className={`font-bold ${big ? 'text-[18px]' : 'text-[14px]'} ${onDark ? 'text-[var(--on-accent-2)]' : 'text-text-2'}`}>{prefix}</span>}
          <input
            aria-label={label}
            inputMode="numeric"
            value={String(value)}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, '')
              onChange(digits === '' ? min : Math.min(max, Number(digits)))
            }}
            onBlur={() => onChange(clamp(value))}
            size={Math.max(2, String(value).length)}
            className={`figure num min-w-0 bg-transparent text-center outline-none ${big ? 'text-[34px] max-md:!text-[34px]' : 'text-[22px] max-md:!text-[22px]'} ${onDark ? 'text-white' : 'text-text'}`}
            style={{ width: `${Math.max(2, String(value).length) + 0.4}ch` }}
          />
          {suffix && <span className={`shrink-0 text-[12px] font-bold ${onDark ? 'text-[var(--on-accent-2)]' : 'text-text-2'}`}>{suffix}</span>}
        </label>
        <motion.button type="button" whileTap={{ scale: 0.9 }} transition={spring.ui} aria-label={`Raise ${label}`} onClick={() => onChange(clamp(value + step))} className={btn}>
          <Plus size={16} strokeWidth={2.6} aria-hidden />
        </motion.button>
      </div>
    </div>
  )
}
