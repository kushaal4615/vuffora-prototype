import { motion } from 'framer-motion'
import { Eye, EyeOff, Flag, Gavel, KeyRound, MessagesSquare, Route, Scale, ShieldCheck, Split, Undo2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Price, StarRow, StatusPill, TemperBadge } from '../../components/Brand'
import { Button } from '../../components/Button'
import { TextArea, Toggle } from '../../components/Form'
import { MapCanvas } from '../../components/Map'
import { Segmented } from '../../components/Tabs'
import { DISPUTES, MOD_REVIEWS, type Dispute, type DisputeEvent, type DisputeLine } from '../../data/adminOps'
import { inr } from '../../data/clock'
import { HOME_PIN, LOG_LABEL, ROUTE } from '../../data/core'
import { DEMO_DISPUTE_NOTE } from '../../data/demoFill'
import { useNav } from '../../lib/navigation'
import { currentQuote, getSession, session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* Dispute & review moderation. Master-detail: the dispute list on the
   left, and for the selected file the three pieces of evidence the
   specification names (chat transcript, GPS path, OTP timestamps) followed
   by the decision. Review moderation is the second tab. */

const NOTES: Record<string, string> = {
  dp1: DEMO_DISPUTE_NOTE,
  dp2: 'GPS and both OTPs confirm 31 of 45 minutes. Refunding the unwalked 14 minutes and warning the walker.',
  dp3: 'No Check-In OTP was verified and the arrival pin is 240 m from the gate. Full refund to the owner.',
  dp4: 'Two lunges are logged with times. Releasing the surcharge to the walker and sending the tag to vetting.',
  dp5: 'The gateway shows two captures for one booking. Reversing the second debit, the walk stands.',
  dp6: 'The walker told the owner before leaving the lanes and the detour was one block. Splitting as goodwill.',
  dp7: 'Cancelled after the walker arrived. The cancellation fee stands and goes to the walker.',
  dp8: 'Walk is complete on GPS and OTPs but no logs were sent. Partial credit to the owner, reminder to the walker.',
  dp9: 'Check-Out OTP was shared in chat and entered 300 m from home. Walk stands, both sides reminded of the rule.',
}
const OUTCOME = {
  owner: { label: 'Upheld for the owner', sub: 'Refund issued to the owner', tone: 'bg-accent text-on-accent' },
  walker: { label: 'Upheld for the walker', sub: 'Payout released to the walker', tone: 'bg-ink text-on-ink' },
  split: { label: 'Split between both', sub: 'Half refunded, half released', tone: 'bg-sun text-on-sun' },
} as const

export default function AdminDisputes() {
  const { toast } = useNav()
  const closed = useSession((s) => s.disputesClosed)
  const hidden = useSession((s) => s.reviewsHidden)
  const thread = useSession((s) => s.threads.walk)
  const logs = useSession((s) => s.logs)
  const total = useSession((s) => currentQuote(s).total)
  const instantFee = useSession((s) => s.pricing.instantFee)
  const duration = useSession((s) => s.duration)

  const [tab, setTab] = useState<'disputes' | 'reviews'>('disputes')
  const [sel, setSel] = useState('dp1')
  const [notes, setNotes] = useState<Record<string, string>>(NOTES)
  const [flaggedOnly, setFlaggedOnly] = useState(true)
  const [kept, setKept] = useState<string[]>([])

  const disputes = useMemo<Dispute[]>(
    () =>
      DISPUTES.map((d) => {
        if (!d.live) return d
        const events: DisputeEvent[] = [
          { at: '7:31 am', label: 'Booking paid', detail: `${duration} min, booked as Walk Now for the 8:00 am slot`, kind: 'booked' },
          { at: inr(instantFee), label: 'Walk Now fee charged', detail: 'The booking was made 29 minutes ahead. The owner says that is a scheduled walk.', kind: 'gap' },
          { at: logs[0]?.at ?? '8:02 am', label: 'Check-In OTP verified', detail: 'At Gate 2, Tower B lobby', kind: 'otp' },
          ...logs.slice(1).map((l): DisputeEvent => ({ at: l.at, label: LOG_LABEL[l.kind], detail: l.text, kind: 'log' })),
          { at: '8:47 am', label: 'Check-Out OTP verified', detail: `${duration} min after Check-In`, kind: 'otp' },
        ]
        const chat: DisputeLine[] = thread.map((m) => ({ from: m.from === 'admin' ? 'system' : m.from, text: m.text, at: m.at }))
        return { ...d, amount: total, bookedMin: duration, actualMin: duration, events, chat }
      }),
    [thread, logs, total, instantFee, duration],
  )
  const d = disputes.find((x) => x.id === sel) ?? disputes[0]
  const outcome = closed[d.id]
  const openCount = disputes.filter((x) => !closed[x.id]).length
  const reviews = MOD_REVIEWS.filter((r) => !flaggedOnly || r.flags.length > 0)
  const flaggedCount = MOD_REVIEWS.filter((r) => r.flags.length > 0 && !hidden.includes(r.id) && !kept.includes(r.id)).length

  const decide = (to: 'owner' | 'walker' | 'split') => {
    if (!(notes[d.id] ?? '').trim()) return toast('Write a resolution note first. Both sides receive it.', 'warn')
    session.closeDispute(d.id, to)
    toast(`${d.booking} closed. ${OUTCOME[to].sub}.`, 'accent')
  }

  return (
    <ConsoleShell
      active="admin.disputes"
      title="Disputes & reviews"
      sub="Every decision is made on three records: the chat, the GPS path and the OTP timestamps"
      actions={<Segmented value={tab} onChange={setTab} items={[{ id: 'disputes', label: 'Disputes', count: openCount }, { id: 'reviews', label: 'Review moderation', count: flaggedCount }]} />}
    >
      {tab === 'disputes' ? (
        <div className="grid grid-cols-[340px_minmax(0,1fr)] items-start gap-6 px-8 pb-10 max-md:grid-cols-1 max-md:gap-4 max-md:px-4 max-md:pb-6">
          {/* master list */}
          <motion.ul variants={listParent} initial="hidden" animate="show" aria-label="Disputes" className="flex flex-col gap-1.5 max-md:-mx-4 max-md:snap-x max-md:scroll-pl-4 max-md:flex-row max-md:gap-2.5 max-md:overflow-x-auto max-md:px-4 max-md:pb-2 max-md:[scrollbar-width:none]">
            {disputes.map((x) => {
              const on = x.id === d.id
              const res = closed[x.id]
              return (
                <motion.li key={x.id} variants={listItem} className="max-md:w-[280px] max-md:shrink-0 max-md:snap-start">
                  <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} aria-pressed={on} onClick={() => setSel(x.id)} className={`block w-full rounded-[var(--r-card)] px-3.5 py-3 text-left transition-colors duration-150 ${on ? 'bg-ink text-on-ink shadow-[var(--glow-ink)]' : 'bg-[var(--surface)] hover:bg-[var(--surface-raised)]'}`}>
                    <div className="flex items-center gap-2">
                      <span className="flex shrink-0 items-center">
                        <Avatar who={x.ownerPhoto} size={28} />
                        <span className={`-ml-2 rounded-full ring-2 ${on ? 'ring-[var(--ink)]' : 'ring-[var(--surface)]'}`}><Avatar who={x.walkerPhoto} size={28} /></span>
                      </span>
                      <span className={`meta min-w-0 flex-1 truncate ${on ? 'text-on-ink-2' : 'text-text-2'}`}>{x.booking} · {x.age}</span>
                      {res ? <StatusPill kind="resolved" label="Closed" /> : <StatusPill kind={x.raisedBy === 'Owner' ? 'open' : 'pending'} label={x.raisedBy} />}
                    </div>
                    <p className="mt-2 line-clamp-2 text-[14px] font-bold leading-snug">{x.claim}</p>
                    <p className={`mt-1.5 flex items-center justify-between gap-2 text-[12px] font-semibold ${on ? 'text-on-ink-2' : 'text-text-2'}`}>
                      <span className="truncate">{x.owner.split(' ')[0]} vs {x.walker.split(' ')[0]} · {x.dog}</span>
                      <span className={`num shrink-0 text-[14px] font-extrabold ${on ? 'text-sun-light' : 'text-text'}`}>{inr(x.amount)}</span>
                    </p>
                  </motion.button>
                </motion.li>
              )
            })}
          </motion.ul>

          {/* detail */}
          <motion.article key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="min-w-0">
            <header className="relative overflow-hidden rounded-[var(--r-container)] bg-sun p-5 text-on-sun max-md:p-4">
              <span aria-hidden className="pointer-events-none absolute -right-14 -top-28 aspect-square w-[280px] rounded-full bg-[rgb(255_255_255/0.32)]" />
              <div className="relative flex items-start justify-between gap-5 max-md:flex-col max-md:gap-3">
                <div className="min-w-0">
                  <p className="meta flex flex-wrap items-center gap-2">
                    <span className="font-bold">{d.booking}</span>
                    <span>Raised by the {d.raisedBy.toLowerCase()} · {d.age} ago</span>
                    <TemperBadge t={d.temper} solid />
                  </p>
                  <h2 className="grot mt-2 text-[28px] max-md:text-[23px]">{d.claim}</h2>
                  <p className="mt-2 max-w-[62ch] text-[13px] font-semibold leading-snug">{d.detail}</p>
                </div>
                <div className="shrink-0 text-right max-md:text-left">
                  <p className="label">In question</p>
                  <Price amount={d.amount} size={44} />
                </div>
              </div>
              <div className="relative mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-bold">
                <span className="flex items-center gap-2"><Avatar who={d.ownerPhoto} size={30} className="ring-2 ring-white" /> {d.owner} <span className="font-semibold">owner</span></span>
                <Scale size={16} aria-hidden />
                <span className="flex items-center gap-2"><Avatar who={d.walkerPhoto} size={30} className="ring-2 ring-white" /> {d.walker} <span className="font-semibold">walker</span></span>
              </div>
            </header>

            {/* evidence 1 and 2: transcript and GPS path */}
            <div className="mt-5 grid grid-cols-2 gap-5 max-md:grid-cols-1">
              <section aria-label="Chat transcript" className="min-w-0">
                <EvidenceHead n={1} icon={MessagesSquare} title="Owner and walker chat" meta={`${d.chat.length} messages, read only`} />
                <div className="mt-2.5 flex h-[300px] flex-col gap-2 overflow-y-auto rounded-[var(--r-card)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-raised)] [scrollbar-width:thin] max-md:h-auto max-md:max-h-[340px]">
                  {d.chat.map((m, i) =>
                    m.from === 'system' ? (
                      <p key={i} className="mx-auto max-w-[90%] rounded-full bg-[var(--surface-high)] px-3 py-1 text-center text-[11px] font-semibold text-text-2">{m.text}</p>
                    ) : (
                      <div key={i} className={`flex max-w-[86%] flex-col ${m.from === 'owner' ? 'self-start' : 'items-end self-end'}`}>
                        <span className="mb-0.5 text-[11px] font-bold text-text-2">{m.from === 'owner' ? d.owner.split(' ')[0] : d.walker.split(' ')[0]} · {m.at}</span>
                        <span className={`rounded-[16px] px-3 py-2 text-[13px] font-medium leading-snug ${m.from === 'owner' ? 'rounded-tl-[4px] bg-[var(--surface-high)] text-text' : 'rounded-tr-[4px] bg-accent-soft text-[var(--on-accent-soft)]'}`}>{m.text}</span>
                      </div>
                    ),
                  )}
                </div>
              </section>

              <section aria-label="GPS path" className="min-w-0">
                <EvidenceHead n={2} icon={Route} title="GPS path" meta={d.path === 0 ? 'No movement recorded' : `${Math.round(d.path * 100)}% of the planned route`} />
                <MapCanvas className="mt-2.5 h-[218px] rounded-[var(--r-card)] shadow-[var(--shadow-raised)]" route={ROUTE} progress={d.path} walker={{ photo: d.walkerPhoto }} home={HOME_PIN} labels={false} />
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Versus label="Distance" actual={`${d.actualKm.toFixed(1)} km`} planned={`${d.plannedKm.toFixed(1)} km planned`} ratio={d.actualKm / d.plannedKm} />
                  <Versus label="Duration" actual={`${d.actualMin} min`} planned={`${d.bookedMin} min booked`} ratio={d.actualMin / d.bookedMin} />
                </div>
              </section>
            </div>

            {/* evidence 3 and the decision */}
            <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-6 max-md:grid-cols-1">
              <section aria-label="OTP timestamps" className="min-w-0">
                <EvidenceHead n={3} icon={KeyRound} title="OTP timestamps" meta="Server time, IST" />
                <ol className="relative mt-3 pl-7">
                  <span aria-hidden className="absolute bottom-3 left-[8px] top-2 w-[2px] rounded-full bg-[var(--paper-300)]" />
                  {d.events.map((e, i) => (
                    <li key={i} className={`relative ${e.kind === 'gap' ? '-ml-2 mb-2.5 rounded-[var(--r-control)] bg-danger-soft py-2.5 pl-2 pr-3 text-[var(--on-danger-soft)]' : 'pb-3'}`}>
                      <span aria-hidden className={`absolute top-[5px] h-[14px] w-[14px] rounded-full ring-[3px] ring-[var(--bg)] ${e.kind === 'gap' ? '-left-[18px] top-[14px] bg-danger' : '-left-[26px]'} ${e.kind === 'otp' ? 'bg-calm' : e.kind === 'booked' ? 'bg-ink' : e.kind === 'pay' ? 'bg-accent' : e.kind === 'log' ? 'bg-[var(--paper-400)]' : ''}`} />
                      <p className="flex items-baseline justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-1.5 text-[14px] font-extrabold">
                          {e.kind === 'otp' && <ShieldCheck size={14} className="shrink-0 text-calm-ink" aria-hidden />}
                          {e.kind === 'gap' && <Flag size={13} className="shrink-0" aria-hidden />}
                          <span className="truncate">{e.label}</span>
                        </span>
                        <span className={`meta shrink-0 font-bold ${e.kind === 'gap' ? '' : 'text-text-2'}`}>{e.at}</span>
                      </p>
                      {e.detail && <p className={`mt-0.5 text-[12px] font-semibold leading-snug ${e.kind === 'gap' ? '' : 'text-text-2'}`}>{e.detail}</p>}
                    </li>
                  ))}
                </ol>
              </section>

              <section aria-label="Resolution" className="min-w-0 rounded-[var(--r-container)] bg-[var(--surface)] p-5 shadow-[var(--shadow-floating)] max-md:p-4">
                <h3 className="grot flex items-center gap-2 text-[22px]"><Gavel size={19} className="text-accent-ink" aria-hidden /> Resolution</h3>
                {outcome ? (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={spring.pop} className="mt-3">
                    <div className={`rounded-[var(--r-card)] p-4 ${OUTCOME[outcome].tone}`}>
                      <p className="label">Closed by Kavya Nair</p>
                      <p className="grot mt-1 text-[24px]">{OUTCOME[outcome].label}</p>
                      <p className="mt-1 text-[13px] font-bold">{OUTCOME[outcome].sub}{outcome === 'split' ? ` (${inr(Math.round(d.amount / 2))} each way)` : ''}</p>
                    </div>
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-2">Note sent to both sides</p>
                    <p className="mt-1 text-[14px] font-medium leading-relaxed">{notes[d.id]}</p>
                    <Button size="sm" variant="outline" icon={Undo2} className="mt-3 max-md:h-11" onClick={() => { const next = { ...getSession().disputesClosed }; delete next[d.id]; session.set({ disputesClosed: next }); toast(`${d.booking} reopened`, 'neutral') }}>Reopen</Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mt-3">
                      <TextArea label="Resolution note (sent to the owner and the walker)" rows={4} value={notes[d.id] ?? ''} onChange={(e) => setNotes((n) => ({ ...n, [d.id]: e.target.value }))} />
                    </div>
                    <div className="mt-4 grid gap-2">
                      <Button className="w-full" onClick={() => decide('owner')}>Uphold owner (refund)</Button>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 max-md:grid-cols-1">
                        <Button className="w-full !px-3" variant="ink" onClick={() => decide('walker')}>Uphold walker (release payout)</Button>
                        <Button variant="outline" icon={Split} onClick={() => decide('split')}>Split</Button>
                      </div>
                    </div>
                    <p className="mt-3 text-[12px] font-semibold leading-snug text-text-2">The walker’s payout for this booking stays on hold until one of the three is chosen.</p>
                  </>
                )}
              </section>
            </div>
          </motion.article>
        </div>
      ) : (
        /* review moderation */
        <div className="px-8 pb-10 max-md:px-4 max-md:pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-card)] bg-ink px-5 py-3.5 text-on-ink max-md:px-4">
            <p className="text-[14px] font-bold">
              <span className="figure num mr-2 text-[30px] text-sun-light">{flaggedCount}</span>
              flagged reviews waiting, {hidden.length} hidden this session
            </p>
            <label className="flex items-center gap-3 text-[13px] font-bold">
              Flagged only
              <Toggle on={flaggedOnly} onChange={setFlaggedOnly} label="Show flagged reviews only" />
            </label>
          </div>
          <motion.ul key={String(flaggedOnly)} variants={listParent} initial="hidden" animate="show" className="mt-2 grid grid-cols-2 gap-x-10 max-md:grid-cols-1">
            {reviews.map((r) => {
              const isHidden = hidden.includes(r.id)
              const isKept = kept.includes(r.id)
              return (
                <motion.li key={r.id} variants={listItem} className={`border-b border-[var(--rule)] py-4 ${isHidden ? 'grayscale' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <Avatar who={r.ownerPhoto} size={36} />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-[14px] font-extrabold">{r.owner} <span className="font-semibold text-text-2">on {r.walker}</span></p>
                      <p className="meta mt-0.5 truncate text-text-2">{r.booking} · {r.when}</p>
                    </div>
                    <StarRow rating={r.rating} />
                  </div>
                  <p className={`mt-2.5 text-[14px] font-medium leading-relaxed ${isHidden ? 'text-text-3 line-through decoration-[var(--paper-400)]' : ''}`}>{r.text}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {isHidden ? <Badge tone="neutral" icon={<EyeOff size={12} />}>Hidden from the profile</Badge> : isKept ? <Badge tone="success" icon={<Eye size={12} />}>Kept, flags cleared</Badge> : r.flags.length ? r.flags.map((f) => <Badge key={f} tone={f === 'Dispute open' ? 'warn' : 'danger'} icon={<Flag size={11} strokeWidth={2.6} />}>{f}</Badge>) : <Badge tone="neutral">No flags</Badge>}
                    <span className="ml-auto flex gap-1.5">
                      {isHidden ? (
                        <Button size="sm" variant="outline" icon={Undo2} className="max-md:h-11" onClick={() => { session.set({ reviewsHidden: getSession().reviewsHidden.filter((x) => x !== r.id) }); toast('Review restored to the walker’s profile', 'neutral') }}>Undo</Button>
                      ) : (
                        <>
                          <Button size="sm" variant={isKept ? 'paper' : 'outline'} className="max-md:h-11" onClick={() => { setKept((k) => (k.includes(r.id) ? k : [...k, r.id])); toast(`Review on ${r.walker} kept`, 'neutral') }}>Keep</Button>
                          <Button size="sm" variant="danger" icon={EyeOff} className="max-md:h-11" onClick={() => { session.hideReview(r.id); toast(`Review hidden. ${r.owner.split(' ')[0]} is told why.`, 'warn') }}>Hide</Button>
                        </>
                      )}
                    </span>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        </div>
      )}
    </ConsoleShell>
  )
}

function EvidenceHead({ n, icon: Icon, title, meta }: { n: number; icon: typeof Route; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-extrabold text-on-ink">{n}</span>
      <h3 className="flex min-w-0 items-center gap-1.5 text-[15px] font-extrabold"><Icon size={16} className="shrink-0 text-accent-ink" aria-hidden /> <span className="truncate">{title}</span></h3>
      <span className="meta ml-auto shrink-0 text-text-2 max-md:hidden">{meta}</span>
    </div>
  )
}

function Versus({ label, actual, planned, ratio }: { label: string; actual: string; planned: string; ratio: number }) {
  const short = ratio < 0.9
  return (
    <div className="min-w-0">
      <p className="text-[12px] font-bold text-text-2">{label}</p>
      <p className="figure num mt-0.5 text-[28px]">{actual}</p>
      <span className="relative mt-1.5 block h-[4px] w-full overflow-hidden rounded-full bg-[rgb(14_27_87/0.1)]">
        <span className={`absolute inset-y-0 left-0 rounded-full ${short ? 'bg-danger' : 'bg-calm'}`} style={{ width: `${Math.min(100, Math.max(2, ratio * 100))}%` }} />
      </span>
      <p className={`mt-1 text-[12px] font-semibold ${short ? 'text-danger-text' : 'text-text-2'}`}>{planned}</p>
    </div>
  )
}
