import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Banknote, CalendarClock, Check, ChevronLeft, ChevronRight, Landmark, RotateCcw, Smartphone, Undo2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Price } from '../../components/Brand'
import { Button } from '../../components/Button'
import { CheckMark, Input, TextArea, Toggle } from '../../components/Form'
import { Modal } from '../../components/Sheet'
import { Segmented } from '../../components/Tabs'
import { ARJUN_PAYOUT_ID, PAYOUTS, REFUNDS, SETTLED_14D, type Payout, type PayoutStatus, type RefundCase } from '../../data/adminOps'
import { walkerById } from '../../data/cast'
import { inr } from '../../data/clock'
import { WALK } from '../../data/core'
import { DEMO_REFUND } from '../../data/demoFill'
import { useNav } from '../../lib/navigation'
import { currentQuote, session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* Payout & refund management. One composed money band on top, then two
   working tabs: walker settlements (sortable, filterable, paged, with
   automated or manual release) and the refund queue (full or partial).
   Arjun's payout for Bruno's walk follows the session store. */

type SortKey = 'walker' | 'walks' | 'gross' | 'net' | 'status'
type Row = Payout & { name: string; commission: number; net: number; live: PayoutStatus }

const STATUS_TONE: Record<PayoutStatus, 'info' | 'accent' | 'success' | 'warn' | 'danger'> = { Scheduled: 'info', Processing: 'accent', Paid: 'success', 'On hold': 'warn', 'Returned by bank': 'danger' }
const FILTERS: ('All' | PayoutStatus)[] = ['All', 'Scheduled', 'Processing', 'Paid', 'On hold', 'Returned by bank']
const PAGE = 8

export default function AdminPayouts() {
  const { toast } = useNav()
  const paid = useSession((s) => s.payoutsPaid)
  const refunded = useSession((s) => s.refundsDone)
  const stage = useSession((s) => s.stage)
  const commissionPct = useSession((s) => s.pricing.commissionPct)
  const arjunGross = useSession((s) => currentQuote(s).base + currentQuote(s).surcharge)
  const arjunNet = useSession((s) => currentQuote(s).walkerNet)

  const [tab, setTab] = useState<'settlements' | 'refunds'>('settlements')
  const [auto, setAuto] = useState(true)
  const [filter, setFilter] = useState<'All' | PayoutStatus>('All')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'status', dir: 1 })
  const [page, setPage] = useState(0)
  const [picked, setPicked] = useState<string[]>(['PO-55131', 'PO-55130'])
  /* refund modal */
  const [open, setOpen] = useState<RefundCase | null>(null)
  const [mode, setMode] = useState<'full' | 'partial'>(DEMO_REFUND.mode)
  const [amount, setAmount] = useState(DEMO_REFUND.amount)
  const [reason, setReason] = useState(DEMO_REFUND.reason)
  const [refundAmounts, setRefundAmounts] = useState<Record<string, number>>({})

  const rows = useMemo<Row[]>(() => {
    const arjun: Payout = { id: ARJUN_PAYOUT_ID, walkerId: 'arjun', period: `Today · ${WALK.id}`, walks: 1, gross: arjunGross, method: 'UPI', account: 'arjun.mehta@okhdfc', status: stage === 'reviewed' ? 'Paid' : 'Scheduled', note: stage === 'reviewed' ? 'Released when the walk was reviewed' : 'Releases when Bruno’s walk is closed and reviewed' }
    return [arjun, ...PAYOUTS].map((p) => {
      const commission = p.id === ARJUN_PAYOUT_ID ? p.gross - arjunNet : Math.round((p.gross * commissionPct) / 100)
      return { ...p, name: walkerById(p.walkerId).name, commission, net: p.gross - commission, live: paid.includes(p.id) ? 'Paid' : p.status }
    })
  }, [paid, stage, commissionPct, arjunGross, arjunNet])

  const ORDER: PayoutStatus[] = ['Returned by bank', 'On hold', 'Scheduled', 'Processing', 'Paid']
  const filtered = rows.filter((r) => filter === 'All' || r.live === filter)
  const sorted = [...filtered].sort((a, b) => {
    const v = sort.key === 'walker' ? a.name.localeCompare(b.name) : sort.key === 'status' ? ORDER.indexOf(a.live) - ORDER.indexOf(b.live) : a[sort.key] - b[sort.key]
    return v * sort.dir
  })
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE))
  const cur = Math.min(page, pages - 1)
  const shown = sorted.slice(cur * PAGE, cur * PAGE + PAGE)
  const payable = (r: Row) => r.live !== 'Paid' && r.live !== 'Processing'
  const pickedRows = rows.filter((r) => picked.includes(r.id) && payable(r))

  const sum = (list: Row[]) => list.reduce((a, r) => a + r.net, 0)
  const due = sum(rows.filter((r) => r.live === 'Scheduled' || r.live === 'Processing'))
  const held = sum(rows.filter((r) => r.live === 'On hold' || r.live === 'Returned by bank'))
  const paidWeek = SETTLED_14D.slice(-7).reduce((a, b) => a + b, 0) + sum(rows.filter((r) => paid.includes(r.id) || (r.id === ARJUN_PAYOUT_ID && r.live === 'Paid')))
  const refundWeek = 2140 + REFUNDS.filter((r) => refunded.includes(r.id)).reduce((a, r) => a + (refundAmounts[r.id] ?? r.paid), 0)
  const refundOpen = REFUNDS.filter((r) => !refunded.includes(r.id)).length

  const payNow = (r: Row) => {
    session.payOut(r.id)
    toast(`${inr(r.net)} sent to ${r.name} by ${r.method === 'UPI' ? 'UPI' : 'bank transfer'}`, 'accent')
  }
  const settlePicked = () => {
    if (!pickedRows.length) return toast('Tick at least one unpaid payout to settle', 'warn')
    pickedRows.forEach((r) => session.payOut(r.id))
    toast(`${pickedRows.length} payouts settled, ${inr(sum(pickedRows))} in all`, 'accent')
    setPicked([])
  }
  const setSortKey = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'walker' || key === 'status' ? 1 : -1 }))
  const togglePick = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const openRefund = (r: RefundCase) => {
    setOpen(r)
    setMode(DEMO_REFUND.mode)
    setAmount(String(r.paid))
    setReason(r.id === 'rf1' ? DEMO_REFUND.reason : r.reason)
  }
  const confirmRefund = () => {
    if (!open) return
    const n = Number(amount)
    if (!amount.trim() || !Number.isFinite(n) || n <= 0) return toast('Enter the amount to refund', 'warn')
    if (n > open.paid) return toast(`The owner paid ${inr(open.paid)}. The refund cannot be more than that.`, 'warn')
    if (!reason.trim()) return toast('Add a reason. The owner sees it on the refund receipt.', 'warn')
    session.refund(open.id)
    setRefundAmounts((m) => ({ ...m, [open.id]: n }))
    toast(`${inr(n)} refunded to ${open.owner}. It reaches the source in 3 to 5 working days.`, 'accent')
    setOpen(null)
  }

  const maxBar = Math.max(...SETTLED_14D)

  return (
    <ConsoleShell active="admin.payouts" title="Payouts & refunds" bleed>
      {/* one composed money band */}
      <header className="relative overflow-hidden bg-ink px-8 py-6 text-on-ink max-md:px-4 max-md:py-5">
        <div className="relative grid grid-cols-[minmax(0,1.15fr)_minmax(0,1.5fr)_300px] items-center gap-8 max-md:grid-cols-1 max-md:gap-5">
          <div className="-ml-8 rounded-r-[110px] bg-sun py-5 pl-8 pr-10 text-on-sun max-md:-ml-4 max-md:rounded-r-[80px] max-md:py-4 max-md:pl-4">
            <p className="label">Payouts & refunds</p>
            <h1 className="sr-only">Payouts and refunds</h1>
            <p className="mt-3 text-[13px] font-bold">Due to walkers today</p>
            <Price amount={due} size={76} className="max-md:!text-[60px]" />
            <p className="mt-1 text-[13px] font-bold">{rows.filter((r) => r.live === 'Scheduled' || r.live === 'Processing').length} payouts, next run 9:00 pm</p>
          </div>
          <dl className="grid grid-cols-3 gap-6 max-md:gap-2">
            {[
              { k: 'Paid this week', v: paidWeek, sub: '+11% on last week', up: true },
              { k: 'On hold', v: held, sub: `${rows.filter((r) => r.live === 'On hold' || r.live === 'Returned by bank').length} payouts need a look`, up: false },
              { k: 'Refunds this week', v: refundWeek, sub: `${refundOpen} waiting in the queue`, up: false },
            ].map((f, i) => (
              <div key={f.k} className={`min-w-0 ${i > 0 ? 'border-l border-[rgb(255_255_255/0.16)] pl-6 max-md:pl-2' : ''}`}>
                <dt className="text-[12px] font-bold text-on-ink-2">{f.k}</dt>
                <dd className="mt-1"><Price amount={f.v} size={34} className="max-md:!text-[19px]" /></dd>
                <dd className={`mt-1 text-[12px] font-semibold leading-snug ${f.up ? 'text-sun-light' : 'text-on-ink-2'}`}>{f.sub}</dd>
              </div>
            ))}
          </dl>
          <div className="max-md:hidden">
            <p className="flex items-baseline justify-between text-[12px] font-bold text-on-ink-2"><span>Settled per day, 14 days</span><span className="meta">peak {inr(maxBar)}</span></p>
            <div className="mt-2 flex h-[64px] items-end gap-[5px]" role="img" aria-label="Net settled per day over the last 14 days">
              {SETTLED_14D.map((v, i) => (
                <motion.span key={i} title={inr(v)} className={`flex-1 origin-bottom rounded-t-[4px] ${i === SETTLED_14D.length - 1 ? 'bg-sun' : 'bg-[rgb(255_255_255/0.3)]'}`} style={{ height: `${(v / maxBar) * 100}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...spring.page, delay: i * 0.02 }} />
              ))}
            </div>
            <p className="meta mt-1 flex justify-between text-on-ink-2"><span>31 Oct</span><span>13 Nov</span></p>
          </div>
        </div>
      </header>

      <div className="px-8 pb-10 pt-5 max-md:px-4 max-md:pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented value={tab} onChange={setTab} items={[{ id: 'settlements', label: 'Settlements', count: rows.filter((r) => r.live !== 'Paid').length }, { id: 'refunds', label: 'Refunds', count: refundOpen }]} />
          {tab === 'settlements' && (
            <div className="flex items-center gap-3 rounded-full bg-[var(--surface)] py-1.5 pl-4 pr-1.5 shadow-[var(--shadow-raised)]">
              <CalendarClock size={16} className="shrink-0 text-accent-ink" aria-hidden />
              <span className="leading-tight">
                <span className="block text-[13px] font-extrabold">{auto ? 'Automated settlements' : 'Manual settlements'}</span>
                <span className="block text-[11px] font-semibold text-text-2">{auto ? 'Every day at 9:00 pm' : 'Nothing moves until you pay'}</span>
              </span>
              <Toggle on={auto} onChange={(v) => { setAuto(v); toast(v ? 'Automated settlements on. Next run today at 9:00 pm.' : 'Switched to manual. Payouts wait for "Pay now".', v ? 'accent' : 'warn') }} label="Automated settlements" />
            </div>
          )}
        </div>

        {tab === 'settlements' ? (
          <>
            <div className="mt-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-stretch">
              <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] max-md:-mx-4 max-md:px-4">
                {FILTERS.map((f) => {
                  const on = f === filter
                  const n = f === 'All' ? rows.length : rows.filter((r) => r.live === f).length
                  return (
                    <motion.button key={f} type="button" whileTap={{ scale: 0.96 }} transition={spring.ui} aria-pressed={on} onClick={() => { setFilter(f); setPage(0) }} className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold max-md:h-11 ${on ? 'bg-accent text-on-accent' : 'text-text shadow-[inset_0_0_0_1px_var(--rule-strong)]'}`}>
                      {f}
                      <span className={`num text-[11px] ${on ? 'text-[var(--on-accent-2)]' : 'text-text-2'}`}>{n}</span>
                    </motion.button>
                  )
                })}
              </div>
              <Button size="sm" icon={Banknote} variant={pickedRows.length ? 'accent' : 'outline'} className="max-md:h-11" onClick={settlePicked}>
                Settle selected{pickedRows.length ? ` · ${pickedRows.length} · ${inr(sum(pickedRows))}` : ''}
              </Button>
            </div>

            {/* desktop table */}
            <div className="mt-3 overflow-hidden rounded-[var(--r-card)] bg-[var(--surface)] shadow-[var(--shadow-raised)] max-md:hidden">
              <table className="w-full table-fixed text-left text-[13px]">
                <thead>
                  <tr className="label text-text-2">
                    <th className="w-[44px] py-3 pl-4" />
                    <Th label="Walker" k="walker" sort={sort} onSort={setSortKey} className="w-[232px]" />
                    <th className="w-[150px] py-3 font-extrabold">Period</th>
                    <Th label="Walks" k="walks" sort={sort} onSort={setSortKey} className="w-[70px]" right />
                    <Th label="Gross" k="gross" sort={sort} onSort={setSortKey} className="w-[86px]" right />
                    <th className="w-[100px] py-3 text-right font-extrabold">Commission</th>
                    <Th label="Net" k="net" sort={sort} onSort={setSortKey} className="w-[86px]" right />
                    <th className="w-[84px] py-3 pl-5 font-extrabold">Method</th>
                    <Th label="Status" k="status" sort={sort} onSort={setSortKey} className="w-[158px]" />
                    <th className="py-3 pr-4" />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => {
                    const w = walkerById(r.walkerId)
                    const can = payable(r)
                    return (
                      <tr key={r.id} className={`border-t border-[var(--rule)] ${r.id === ARJUN_PAYOUT_ID ? 'bg-sun-soft' : ''}`}>
                        <td className="py-2 pl-4">
                          {can && (
                            <button type="button" onClick={() => togglePick(r.id)} aria-label={`Select payout ${r.id}`} aria-pressed={picked.includes(r.id)} className="grid h-8 w-8 place-items-center">
                              <CheckMark on={picked.includes(r.id)} />
                            </button>
                          )}
                        </td>
                        <td className="py-2">
                          <span className="flex items-center gap-2.5">
                            <Avatar who={w.photo} size={34} />
                            <span className="min-w-0 leading-tight">
                              <span className="block truncate font-extrabold">{r.name}</span>
                              <span className="meta block truncate text-text-2">{r.id} · {r.account}</span>
                            </span>
                          </span>
                        </td>
                        <td className="py-2">
                          <span className="block truncate font-semibold">{r.period}</span>
                          {r.note && <span className="block truncate text-[11px] font-semibold text-text-2" title={r.note}>{r.note}</span>}
                        </td>
                        <td className="num py-2 text-right font-semibold">{r.walks}</td>
                        <td className="num py-2 text-right font-semibold">{inr(r.gross)}</td>
                        <td className="num py-2 text-right font-semibold text-text-2">{inr(r.commission)}</td>
                        <td className="num py-2 text-right font-extrabold">{inr(r.net)}</td>
                        <td className="py-2 pl-5">
                          <span className="flex items-center gap-1.5 font-semibold">{r.method === 'UPI' ? <Smartphone size={14} aria-hidden /> : <Landmark size={14} aria-hidden />} {r.method}</span>
                        </td>
                        <td className="py-2"><Badge tone={STATUS_TONE[r.live]}>{r.live}</Badge></td>
                        <td className="py-2 pr-4 text-right">
                          {can ? (
                            <Button size="sm" onClick={() => payNow(r)}>{r.live === 'Returned by bank' ? 'Retry' : 'Pay now'}</Button>
                          ) : r.live === 'Paid' ? (
                            <Button size="sm" variant="ghost" icon={Check} onClick={() => toast(`Receipt ${r.id}.pdf sent to ${r.name}`, 'neutral')}>Receipt</Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => toast(`${r.id} is with the bank. UTR arrives within 30 minutes.`, 'info')}>Track</Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* phone: stacked rows */}
            <motion.ul key={`${filter}-${cur}`} variants={listParent} initial="hidden" animate="show" className="mt-3 flex flex-col gap-2 md:hidden">
              {shown.map((r) => {
                const w = walkerById(r.walkerId)
                const can = payable(r)
                return (
                  <motion.li key={r.id} variants={listItem} className={`rounded-[var(--r-card)] p-3.5 shadow-[var(--shadow-raised)] ${r.id === ARJUN_PAYOUT_ID ? 'bg-sun-soft' : 'bg-[var(--surface)]'}`}>
                    <div className="flex items-center gap-3">
                      <Avatar who={w.photo} size={40} />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-[15px] font-extrabold">{r.name}</p>
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-text-2">{r.period} · {r.walks} {r.walks === 1 ? 'walk' : 'walks'} · {r.method}</p>
                      </div>
                      <Price amount={r.net} size={24} />
                    </div>
                    {r.note && <p className="mt-2 text-[12px] font-semibold text-text-2">{r.note}</p>}
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <Badge tone={STATUS_TONE[r.live]}>{r.live}</Badge>
                      <span className="meta min-w-0 flex-1 truncate text-text-2">gross {inr(r.gross)} less {inr(r.commission)}</span>
                      {can ? <Button size="sm" className="h-11" onClick={() => payNow(r)}>{r.live === 'Returned by bank' ? 'Retry' : 'Pay now'}</Button> : <Button size="sm" variant="ghost" className="h-11" onClick={() => toast(r.live === 'Paid' ? `Receipt ${r.id}.pdf sent to ${r.name}` : `${r.id} is with the bank`, 'neutral')}>{r.live === 'Paid' ? 'Receipt' : 'Track'}</Button>}
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>

            {/* pagination */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <p className="text-[13px] font-semibold text-text-2">
                <span className="num font-bold text-text">{sorted.length ? cur * PAGE + 1 : 0} to {Math.min(sorted.length, cur * PAGE + PAGE)}</span> of {sorted.length} payouts
              </p>
              <div className="flex items-center gap-1">
                <PageBtn label="Previous page" onClick={() => (cur === 0 ? toast('This is the first page', 'neutral') : setPage(cur - 1))}><ChevronLeft size={17} /></PageBtn>
                {Array.from({ length: pages }, (_, i) => (
                  <PageBtn key={i} label={`Page ${i + 1}`} on={i === cur} onClick={() => setPage(i)}>{i + 1}</PageBtn>
                ))}
                <PageBtn label="Next page" onClick={() => (cur >= pages - 1 ? toast('This is the last page', 'neutral') : setPage(cur + 1))}><ChevronRight size={17} /></PageBtn>
              </div>
            </div>
          </>
        ) : (
          /* refunds queue */
          <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-4 grid grid-cols-2 gap-x-8 max-md:grid-cols-1">
            {REFUNDS.map((r) => {
              const done = refunded.includes(r.id)
              const amt = refundAmounts[r.id] ?? r.paid
              return (
                <motion.li key={r.id} variants={listItem} className="flex items-start gap-3 border-b border-[var(--rule)] py-4">
                  <Avatar who={r.ownerPhoto} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-extrabold">{r.owner}</span>
                      <Badge tone={r.kind === 'Disputed' ? 'danger' : 'neutral'}>{r.kind}</Badge>
                    </p>
                    <p className="meta mt-1 truncate text-text-2">{r.booking} · {r.dog} with {r.walker} · {r.when}</p>
                    <p className="mt-1.5 text-[13px] font-semibold leading-snug">{r.reason}</p>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <span className="text-[12px] font-bold text-text-2">Paid <span className="num text-[15px] font-extrabold text-text">{inr(r.paid)}</span></span>
                      {done ? (
                        <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.pop}>
                          <Badge tone="success" icon={<Undo2 size={12} strokeWidth={2.6} />}>Refunded {inr(amt)}{amt < r.paid ? ' (partial)' : ''}</Badge>
                        </motion.span>
                      ) : (
                        <Button size="sm" variant="outline" icon={RotateCcw} className="max-md:h-11" onClick={() => openRefund(r)}>Refund</Button>
                      )}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} title="Refund booking">
        {open && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-[var(--r-card)] bg-[var(--surface-raised)] p-3">
              <Avatar who={open.ownerPhoto} size={40} />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[15px] font-extrabold">{open.owner}</p>
                <p className="meta mt-0.5 truncate text-text-2">{open.booking} · {open.dog} with {open.walker}</p>
              </div>
              <span className="text-right leading-tight"><span className="block text-[11px] font-bold text-text-2">Paid</span><span className="num text-[17px] font-extrabold">{inr(open.paid)}</span></span>
            </div>
            <Segmented
              full
              tone="accent"
              value={mode}
              onChange={(m) => {
                setMode(m)
                setAmount(String(m === 'full' ? open.paid : Math.round(open.paid / 2)))
              }}
              items={[{ id: 'full', label: 'Full refund' }, { id: 'partial', label: 'Partial refund' }]}
            />
            <Input label="Amount to refund" inputMode="numeric" leading={<span className="font-bold">₹</span>} value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, '')); if (mode === 'full') setMode('partial') }} hint={mode === 'full' ? 'The whole amount, GST included, back to the source.' : `Any amount up to ${inr(open.paid)}. The rest stays settled.`} />
            <TextArea label="Reason shown to the owner" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" block onClick={() => setOpen(null)}>Cancel</Button>
              <Button block icon={RotateCcw} onClick={confirmRefund}>Refund {amount ? inr(Number(amount)) : ''}</Button>
            </div>
          </div>
        )}
      </Modal>
    </ConsoleShell>
  )
}

function Th({ label, k, sort, onSort, className = '', right = false }: { label: string; k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; onSort: (k: SortKey) => void; className?: string; right?: boolean }) {
  const on = sort.key === k
  return (
    <th className={`py-1 font-extrabold ${className}`} aria-sort={on ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => onSort(k)} className={`label flex h-9 w-full items-center gap-1 ${right ? 'justify-end' : ''} ${on ? 'text-accent-ink' : 'text-text-2'}`}>
        {label}
        {on ? sort.dir === 1 ? <ArrowUp size={12} strokeWidth={2.8} aria-hidden /> : <ArrowDown size={12} strokeWidth={2.8} aria-hidden /> : null}
      </button>
    </th>
  )
}

function PageBtn({ children, onClick, on = false, label }: { children: React.ReactNode; onClick: () => void; on?: boolean; label: string }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.92 }} transition={spring.ui} aria-label={label} aria-current={on ? 'page' : undefined} onClick={onClick} className={`num grid h-9 min-w-9 place-items-center rounded-full px-2 text-[13px] font-bold max-md:h-11 max-md:min-w-11 ${on ? 'bg-ink text-on-ink' : 'text-text hover:bg-[var(--surface-high)]'}`}>
      {children}
    </motion.button>
  )
}
