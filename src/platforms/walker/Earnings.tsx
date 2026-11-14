import { motion } from 'framer-motion'
import { ArrowDownToLine, ArrowUpRight, ChevronLeft, Clock3, Gift, HandCoins, LifeBuoy, Lock } from 'lucide-react'
import { useState } from 'react'
import { Bar as RBar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Price, StatusPill, type StatusKind } from '../../components/Brand'
import { Button } from '../../components/Button'
import { CHART } from '../../components/Charts'
import { Input } from '../../components/Form'
import { BottomSheet } from '../../components/Sheet'
import { OWNER, WALKER_ACCOUNT, dogById } from '../../data/cast'
import { inr } from '../../data/clock'
import { WALK, quote, stageAtLeast } from '../../data/core'
import { DEMO_WITHDRAW } from '../../data/demoFill'
import { face, img } from '../../data/media'
import { DAILY_NET, LEDGER, PAYOUT_HISTORY, WALLET_GROSS, type PayoutRow } from '../../data/walkerData'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, SectionHead, safeTop } from '../mobileShell'

/* Earnings and payout wallet. Ink hero with the withdrawable balance set
   huge against the sun; the gross / commission / net strip laps it; then
   14 days of net earnings as bars, the live ledger and the withdrawal
   history with its one bank return. Commission follows the admin's rate
   card, so the strip and every walk row move when it changes. */

const PAYOUT_STATUS: Record<PayoutRow['state'], { kind: StatusKind; label: string }> = {
  paid: { kind: 'paid', label: 'Paid' },
  processing: { kind: 'progress', label: 'Processing' },
  returned: { kind: 'rejected', label: 'Returned by bank' },
}

export default function WalkerEarnings() {
  const { navigate, reset, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const withdrawn = useSession((s) => s.withdrawn)
  const pricing = useSession((s) => s.pricing)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const instant = useSession((s) => s.instant)
  const dog = dogById(dogId)
  const live = quote(pricing, duration, dog.temperament, instant)

  const commission = Math.round((WALLET_GROSS * pricing.commissionPct) / 100)
  const net = WALLET_GROSS - commission
  const released = stage === 'reviewed'
  const liveHeld = stage === 'ended'
  const balance = Math.max(0, net + (released ? live.walkerNet : 0) - withdrawn)
  const tyson = quote(pricing, 60, 'reactive', false).walkerNet
  const held = tyson + (liveHeld ? live.walkerNet : 0)

  const [sheet, setSheet] = useState(false)
  const [amount, setAmount] = useState(DEMO_WITHDRAW.amount)
  const [upi, setUpi] = useState(DEMO_WITHDRAW.to)
  const [error, setError] = useState('')

  const confirm = () => {
    const n = Number(amount.replace(/[^\d]/g, ''))
    if (!n) return setError('Enter an amount to withdraw')
    if (n > balance) return setError(`You can withdraw up to ${inr(balance)} right now`)
    if (!upi.includes('@')) return setError('Enter a valid UPI ID, for example name@okhdfc')
    session.withdraw(n)
    setSheet(false)
    setError('')
    toast(`${inr(n)} is on its way to ${upi}`, 'accent')
  }

  const payouts: PayoutRow[] = [...(withdrawn > 0 ? [{ id: 'PO-55163', when: 'Today, just now', amount: withdrawn, to: `UPI · ${upi}`, state: 'processing' as const, note: 'Sent to the bank. Usually under 2 hours.' }] : []), ...PAYOUT_HISTORY]

  return (
    <MobileScreen
      tab="earnings"
      cap="var(--ink)"
      overlay={
        <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Withdraw to UPI">
          <p className="text-[13px] font-semibold text-text-2">
            Withdrawable now: <span className="num font-extrabold text-text">{inr(balance)}</span>. No fee, no minimum.
          </p>
          <div className="mt-4 flex flex-col gap-3.5">
            <Input label="Amount" inputMode="numeric" value={amount} onChange={(e) => { setAmount(e.target.value); setError('') }} leading={<span className="text-[17px] font-extrabold text-text">₹</span>} className="num text-[20px] font-extrabold" error={error || undefined} />
            <div className="flex gap-2">
              {[1000, 2500, balance].map((v, i) => (
                <motion.button key={i} type="button" whileTap={tap} transition={spring.ui} onClick={() => { setAmount(String(v)); setError('') }} className={`num h-11 flex-1 rounded-full text-[13px] font-extrabold ${Number(amount) === v ? 'bg-accent text-on-accent' : 'bg-[var(--surface-high)] text-text'}`}>
                  {i === 2 ? 'All' : inr(v)}
                </motion.button>
              ))}
            </div>
            <Input label="To UPI ID" value={upi} onChange={(e) => { setUpi(e.target.value); setError('') }} hint={`Verified in KYC. Bank fallback: ${WALKER_ACCOUNT.bank}`} className="num" />
          </div>
          <Button size="lg" block icon={ArrowDownToLine} className="mt-5 w-full" onClick={confirm}>
            Withdraw {inr(Number(amount.replace(/[^\d]/g, '')) || 0)}
          </Button>
          <div aria-hidden style={{ height: 'calc(var(--chrome-space, 0px) * 1.6)' }} />
        </BottomSheet>
      }
    >
      {/* ink hero */}
      <section className="relative overflow-hidden bg-ink px-5 pb-16 text-on-ink" style={{ paddingTop: safeTop(12) }}>
        <span aria-hidden className="sun -right-[28%] w-[52%]" style={{ top: safeTop(8) }} />
        <p className="label relative text-sun-light">Partner wallet</p>
        <p className="relative mt-6 text-[13px] font-bold text-on-ink-2">Withdrawable net balance</p>
        <motion.div key={balance} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring.ui} className="relative mt-1">
          <Price amount={balance} size={76} className="text-white" />
        </motion.div>
        <div className="relative mt-4 flex items-center gap-3">
          <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => setSheet(true)} className="flex h-[52px] items-center gap-2 rounded-full bg-sun px-6 text-[16px] font-extrabold text-on-sun shadow-[var(--glow-sun)]">
            <ArrowDownToLine size={19} strokeWidth={2.6} aria-hidden /> Withdraw
          </motion.button>
          <p className="num min-w-0 text-[12px] font-semibold leading-snug text-on-ink-2">
            <span className="flex items-center gap-1 font-extrabold text-white"><Lock size={12} strokeWidth={2.8} aria-hidden /> {inr(held)} held</span>
            until owners review
          </p>
        </div>
      </section>

      {/* gross / commission / net */}
      <section className="relative z-10 mx-4 -mt-10 rounded-[var(--r-container)] bg-[var(--surface)] p-4 shadow-[var(--shadow-floating)]">
        <div className="flex items-center justify-between gap-2">
          <p className="label text-text-2">Since last payout</p>
          <span className="num flex h-6 shrink-0 items-center whitespace-nowrap rounded-full bg-accent-soft px-2.5 text-[11px] font-extrabold text-[var(--on-accent-soft)]">{pricing.commissionPct}% commission</span>
        </div>
        <dl className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-x-2">
          <div>
            <dt className="text-[11px] font-bold text-text-2">Gross earned</dt>
            <dd className="figure num mt-1 text-[24px]">{inr(WALLET_GROSS)}</dd>
          </div>
          <span aria-hidden className="pb-1 text-[20px] font-extrabold text-text-2">-</span>
          <div>
            <dt className="text-[11px] font-bold text-text-2">Commission</dt>
            <dd className="figure num mt-1 text-[24px] text-danger-text">{inr(commission)}</dd>
          </div>
          <span aria-hidden className="pb-1 text-[20px] font-extrabold text-text-2">=</span>
          <div>
            <dt className="text-[11px] font-bold text-text-2">Net to you</dt>
            <dd className="figure num mt-1 text-[24px] text-accent-ink"><span className="swoosh">{inr(net)}</span></dd>
          </div>
        </dl>
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full" role="img" aria-label={`Net ${100 - pricing.commissionPct}%, commission ${pricing.commissionPct}%`}>
          <span className="bg-accent" style={{ width: `${100 - pricing.commissionPct}%` }} />
          <span className="bg-sun" style={{ width: `${pricing.commissionPct}%` }} />
        </div>
      </section>

      {/* 14 days */}
      <SectionHead className="mt-6" eyebrow="Last 14 days" title={<>{inr(DAILY_NET.reduce((a, b) => a + b.net, 0))} <span className="text-[15px] font-bold text-text-2">net, {DAILY_NET.reduce((a, b) => a + b.walks, 0)} walks</span></>} />
      <div className="mt-2 h-[168px] px-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DAILY_NET} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="22%">
            <XAxis dataKey="day" tick={CHART.axis} tickFormatter={(v: string) => v.split(' ')[0]} axisLine={false} tickLine={false} interval={0} />
            <Tooltip {...CHART.tooltip} cursor={{ fill: 'rgb(14 27 87 / 0.06)' }} formatter={(v: number) => [inr(v), 'Net']} />
            <RBar dataKey="net" radius={[6, 6, 2, 2]} isAnimationActive={false}>
              {DAILY_NET.map((d, i) => (
                <Cell key={d.day} fill={i === DAILY_NET.length - 1 ? CHART.series.sun : d.net < 500 ? CHART.series.muted : CHART.series.primary} />
              ))}
            </RBar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="num px-5 text-[12px] font-semibold text-text-2">Best day: Sun 8 Nov, {inr(1775)} from 8 walks. 4 Nov was the rain day.</p>

      {/* live ledger */}
      <SectionHead className="mt-6" title="Ledger" eyebrow="Updates as walks close" />
      <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-2 px-3">
        {stageAtLeast(stage, 'ended') && (
          <motion.li variants={listItem} className="flex items-center gap-3 rounded-[var(--r-card)] bg-sun-soft px-2 py-2.5">
            <img src={img(dog.photo, 140)} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" style={{ objectPosition: '50% 20%' }} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[14px] font-extrabold">{dog.name} · {duration} min walk</p>
              <p className="num mt-0.5 truncate text-[12px] font-semibold text-text-2">{WALK.id} · fee {inr(live.base + live.surcharge)} · commission -{inr(live.commission)}</p>
            </div>
            <div className="shrink-0 text-right leading-tight">
              <p className="num text-[15px] font-extrabold">+{inr(live.walkerNet)}</p>
              <p className={`text-[11px] font-extrabold ${released ? 'text-calm-ink' : 'text-[var(--on-warn-soft)]'}`}>{released ? 'Released' : `Held, ${OWNER.first} to review`}</p>
            </div>
          </motion.li>
        )}
        {withdrawn > 0 && (
          <motion.li variants={listItem} className="flex items-center gap-3 px-2 py-2.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-on-ink"><ArrowUpRight size={20} strokeWidth={2.4} aria-hidden /></span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[14px] font-extrabold">Withdrawal to UPI</p>
              <p className="num mt-0.5 truncate text-[12px] font-semibold text-text-2">Today, just now · PO-55163</p>
            </div>
            <p className="num shrink-0 text-[15px] font-extrabold">-{inr(withdrawn)}</p>
          </motion.li>
        )}
        {LEDGER.map((e) => {
          const q = e.duration && e.temperament ? quote(pricing, e.duration, e.temperament, false) : null
          const value = q ? q.walkerNet : e.amount ?? 0
          const Icon = e.kind === 'withdrawal' ? ArrowUpRight : e.kind === 'bonus' ? Gift : HandCoins
          return (
            <motion.li key={e.id} variants={listItem} className="flex items-center gap-3 px-2 py-2.5">
              {e.photo ? (
                <img src={e.kind === 'tip' ? face(e.photo, 120) : img(e.photo, 140)} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" style={{ objectPosition: '50% 25%' }} />
              ) : (
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${e.kind === 'withdrawal' ? 'bg-ink text-on-ink' : 'bg-sun text-on-sun'}`}><Icon size={20} strokeWidth={2.4} aria-hidden /></span>
              )}
              <div className="min-w-0 flex-1 leading-tight">
                <p className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-extrabold">{e.title}</span>
                  {e.kind === 'held' && <span className="flex h-5 shrink-0 items-center gap-1 rounded-full bg-warn-soft px-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[var(--on-warn-soft)]"><Clock3 size={10} strokeWidth={3} aria-hidden /> Held</span>}
                </p>
                <p className="num mt-0.5 truncate text-[12px] font-semibold text-text-2">{q ? `Fee ${inr(q.base + q.surcharge)} · commission -${inr(q.commission)}` : e.sub}</p>
              </div>
              <div className="shrink-0 text-right leading-tight">
                <p className={`num text-[15px] font-extrabold ${value < 0 ? 'text-text' : e.kind === 'held' ? 'text-[var(--on-warn-soft)]' : 'text-calm-ink'}`}>{value < 0 ? '-' : '+'}{inr(Math.abs(value))}</p>
                <p className="num mt-0.5 text-[11px] font-semibold text-text-2">{e.when}</p>
              </div>
            </motion.li>
          )
        })}
      </motion.ul>

      {/* withdrawal history */}
      <section className="mt-6 bg-[var(--surface-high)] px-5 py-6">
        <h2 className="grot text-[22px]">Payout withdrawal history</h2>
        <ul className="mt-3 flex flex-col gap-4">
          {payouts.map((p) => {
            const st = PAYOUT_STATUS[p.state]
            return (
              <li key={p.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0 leading-snug">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="num text-[17px] font-extrabold">{inr(p.amount)}</span>
                    <StatusPill kind={st.kind} label={st.label} />
                  </p>
                  <p className="num mt-1 truncate text-[12px] font-semibold text-text-2">{p.id} · {p.when}</p>
                  <p className={`mt-0.5 text-[12px] font-semibold ${p.state === 'returned' ? 'text-danger-text' : 'text-text-2'}`}>{p.note}</p>
                </div>
                <p className="num shrink-0 pt-1 text-right text-[11px] font-bold text-text-2">{p.to.split(' · ')[0]}</p>
              </li>
            )
          })}
        </ul>
        <button type="button" onClick={() => navigate('walker.support')} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-extrabold text-on-ink">
          <LifeBuoy size={17} strokeWidth={2.4} aria-hidden /> Payout delayed? Message support
        </button>
      </section>

      <button type="button" onClick={() => reset('walker.home')} className="mx-auto mt-2 flex h-11 items-center gap-1 px-5 text-[13px] font-extrabold text-accent-ink">
        <ChevronLeft size={16} strokeWidth={2.6} aria-hidden /> Back to today
      </button>
    </MobileScreen>
  )
}
