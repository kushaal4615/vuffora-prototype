import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowUpRight, Check, CircleCheck, FileText, Flag, Lock, LockOpen, Minus, PawPrint, Plus, RotateCcw, RotateCw, SendHorizontal, Undo2, X } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { StatusPill, TEMPER_TONE, TemperBadge } from '../../components/Brand'
import { Button, IconButton } from '../../components/Button'
import { TextArea } from '../../components/Form'
import { Drawer } from '../../components/Sheet'
import { OWNER_THREADS, dmyToIso } from '../../data/adminPeople'
import { CITIES, TEMPERAMENT, type City, type Temperament } from '../../data/cast'
import { daysUntil } from '../../data/clock'
import { OWNER_CASE_ID, VET_QUEUE, type VetCase, type VetState } from '../../data/core'
import { DEMO_ADMIN_OUTBOUND, DEMO_ADMIN_OUTBOUND_CHECK, DEMO_VET_REJECT, DEMO_VET_REMARK } from '../../data/demoFill'
import { img, type MediaKey } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { getSession, session, useSession, vetState } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* Vetting & compliance. Three columns that fill the frame: the queue, the
   document viewer on an ink light-table (a drawn certificate beside what
   the owner declared, with an automatic expiry check), and the decision
   rail (temperament & safety audit, feedback note, approve / reject).
   Case vq1 is Sheru's certificate: deciding it changes the Owner App. */

type Filter = 'pending' | 'approved' | 'rejected' | 'flagged' | 'all'

/* What the owner typed into the app, where it differs from the paper. */
const DECLARED: Record<string, Partial<Pick<VetCase, 'given' | 'expires' | 'breed'>>> = {
  vq3: { given: '14 Nov 2026', expires: '14 Nov 2027' },
  vq7: { expires: '11 Aug 2027' },
}
const VACCINE_BRAND: Record<VetCase['doc'], string> = { Rabies: 'Nobivac Rabies, 1 ml s/c', DHPP: 'Nobivac DHPPi, 1 ml s/c', Bordetella: 'Nobivac KC, 0.4 ml intranasal' }
const FEEDBACK: Record<string, { who: MediaKey; name: string; when: string; text: string; suggests?: Temperament }> = {
  vq1: { who: 'gurpreet', name: 'Gurpreet Sandhu', when: 'Sun 8 Nov', text: 'Reactive to male dogs near the market. Fine on a short leash with the muzzle on at the gate.', suggests: 'reactive' },
  vq4: { who: 'gurpreet', name: 'Gurpreet Sandhu', when: 'Thu 12 Nov', text: 'Lunged at a cyclist on the Phase 10 main road. Needed both hands on the leash.', suggests: 'reactive' },
  vq3: { who: 'nikhil', name: 'Nikhil Arora', when: 'Fri 13 Nov', text: 'Easy walker. Friendly with the children at the gate.', suggests: 'calm' },
  vq6: { who: 'divya', name: 'Divya Rawat', when: 'Fri 13 Nov', text: 'Shy with new people for the first minute, then follows happily.', suggests: 'calm' },
}

const expiryOf = (c: VetCase) => {
  const days = daysUntil(dmyToIso(c.expires))
  const bad = days <= 30
  const text = days < 0 ? `Expired ${-days} days ago` : days === 0 ? 'Expires today' : days <= 30 ? `Expires in ${days} days` : `Valid for ${days} more days`
  return { days, bad, text }
}

export default function AdminVetting() {
  const { navigate, toast } = useNav()
  const viewing = useSession((s) => s.viewingCase)
  const decisions = useSession((s) => s.vetDecisions)
  const [filter, setFilter] = useState<Filter>('pending')
  const [city, setCity] = useState<City | 'All'>('All')

  const stateOf = (id: string): VetState => decisions[id] ?? VET_QUEUE.find((v) => v.id === id)?.state ?? 'pending'
  const c = VET_QUEUE.find((v) => v.id === viewing) ?? VET_QUEUE[0]

  const counts: Record<Filter, number> = {
    pending: VET_QUEUE.filter((v) => stateOf(v.id) === 'pending').length,
    approved: VET_QUEUE.filter((v) => stateOf(v.id) === 'approved').length,
    rejected: VET_QUEUE.filter((v) => stateOf(v.id) === 'rejected').length,
    flagged: VET_QUEUE.filter((v) => v.flag).length,
    all: VET_QUEUE.length,
  }
  const list = VET_QUEUE.filter((v) => (filter === 'all' ? true : filter === 'flagged' ? !!v.flag : stateOf(v.id) === filter)).filter((v) => city === 'All' || v.city === city)

  const decide = (state: VetState, remark: string) => {
    session.decideVet(c.id, state, remark)
    toast(state === 'approved' ? `${c.dog}’s ${c.doc} certificate approved. ${c.owner.split(' ')[0]} has been notified.` : `${c.dog}’s ${c.doc} certificate rejected. Your note was sent to ${c.owner.split(' ')[0]}.`, state === 'approved' ? 'accent' : 'danger')
    const at = VET_QUEUE.findIndex((v) => v.id === c.id)
    const order = [...VET_QUEUE.slice(at + 1), ...VET_QUEUE.slice(0, at)]
    const next = order.find((v) => vetState(v.id, getSession()) === 'pending')
    if (next) window.setTimeout(() => session.viewCase(next.id), 900)
  }

  return (
    <ConsoleShell active="admin.vetting" title="Vetting queue" bleed>
      <div className="flex h-full flex-col max-md:h-auto">
        {/* header strip */}
        <div className="flex shrink-0 items-center gap-5 px-6 pb-3.5 pt-5 max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4">
          <div className="min-w-0 shrink-0">
            <h1 className="grot text-[30px] leading-none max-md:text-[28px]">
              Vetting <span className="swoosh">queue</span>
            </h1>
            <p className="mt-1.5 text-[13px] font-semibold text-text-2">{counts.pending} certificates waiting, oldest from Thursday</p>
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-1.5 max-md:ml-0 max-md:overflow-x-auto max-md:pb-1" role="tablist" aria-label="Case state">
            {(
              [
                { id: 'pending', label: 'Pending' },
                { id: 'approved', label: 'Approved' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'flagged', label: 'Flagged' },
                { id: 'all', label: 'All' },
              ] as const
            ).map((f) => {
              const on = filter === f.id
              return (
                <motion.button key={f.id} type="button" role="tab" aria-selected={on} whileTap={tap} transition={spring.ui} onClick={() => setFilter(f.id)} className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold ${on ? 'bg-ink text-on-ink' : 'bg-[var(--surface)] text-text shadow-[var(--shadow-raised)]'}`}>
                  {f.id === 'flagged' && <Flag size={13} strokeWidth={2.6} aria-hidden />}
                  {f.label}
                  <span className={`num rounded-full px-1.5 text-[11px] ${on ? 'bg-sun text-on-sun' : 'bg-[var(--surface-high)]'}`}>{counts[f.id]}</span>
                </motion.button>
              )
            })}
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--surface-high)] p-1 max-md:overflow-x-auto" role="tablist" aria-label="City">
            {(['All', ...CITIES] as const).map((ct) => {
              const on = city === ct
              return (
                <button key={ct} type="button" role="tab" aria-selected={on} onClick={() => setCity(ct)} className={`h-8 shrink-0 rounded-full px-3 text-[12px] font-bold ${on ? 'bg-[var(--surface)] text-text shadow-[var(--shadow-raised)]' : 'text-text-2'}`}>
                  {ct === 'All' ? 'All' : ct}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[268px_minmax(0,1fr)_318px] max-md:flex max-md:flex-col">
          {/* (a) the queue */}
          <div className="min-h-0 px-3 pb-4 max-md:px-0 md:overflow-y-auto">
            {list.length === 0 ? (
              <div className="mx-3 rounded-[var(--r-card)] bg-[var(--surface-high)] p-4 text-[13px] font-semibold text-text-2">
                Nothing {filter === 'all' ? '' : filter} in {city === 'All' ? 'any city' : city}.
                <button type="button" onClick={() => { setFilter('all'); setCity('All') }} className="mt-2 block h-11 font-bold text-accent-ink">
                  Show all {VET_QUEUE.length} cases
                </button>
              </div>
            ) : (
              <motion.ul key={filter + city} variants={listParent} initial="hidden" animate="show" className="flex flex-col gap-1 max-md:flex-row max-md:gap-2 max-md:overflow-x-auto max-md:px-4 max-md:pb-2">
                {list.map((v) => {
                  const on = v.id === c.id
                  const st = stateOf(v.id)
                  const ex = expiryOf(v)
                  return (
                    <motion.li key={v.id} variants={listItem} className="max-md:w-[248px] max-md:shrink-0">
                      <motion.button type="button" whileTap={{ scale: 0.98 }} transition={spring.ui} onClick={() => session.viewCase(v.id)} aria-current={on ? 'true' : undefined} className={`relative flex w-full items-center gap-3 rounded-[var(--r-card)] p-2.5 text-left transition-colors duration-150 ${on ? 'bg-ink text-on-ink shadow-[var(--glow-ink)]' : 'hover:bg-[var(--surface-high)] max-md:bg-[var(--surface)] max-md:shadow-[var(--shadow-raised)]'}`}>
                        <span className="relative shrink-0">
                          <img src={img(v.dogPhoto, 160)} alt="" className={`h-12 w-12 rounded-[14px] object-cover ${on ? 'ring-2 ring-[var(--sun)]' : ''}`} />
                          <span className="absolute -bottom-1 -right-1.5 rounded-full ring-2 ring-[var(--bg)]">
                            <Avatar who={v.ownerPhoto} size={20} />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-[14px] font-extrabold">{v.dog} · {v.doc}</span>
                            {v.flag && <Flag size={12} strokeWidth={2.8} className={`shrink-0 ${on ? 'text-sun-light' : 'text-danger-text'}`} aria-label="Flagged" />}
                          </span>
                          <span className={`mt-0.5 block truncate text-[12px] font-semibold ${on ? 'text-on-ink-2' : 'text-text-2'}`}>{v.owner} · {v.city}</span>
                          <span className="mt-1 flex items-center gap-1.5">
                            <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${st === 'approved' ? 'bg-calm' : st === 'rejected' ? 'bg-danger' : 'bg-sun'}`} />
                            <span className={`meta truncate ${on ? 'text-on-ink-2' : ex.bad && st === 'pending' ? 'text-danger-text' : 'text-text-2'}`}>{st === 'pending' ? (ex.bad ? ex.text : v.submitted) : st === 'approved' ? 'Approved' : 'Rejected'}</span>
                          </span>
                        </span>
                      </motion.button>
                    </motion.li>
                  )
                })}
              </motion.ul>
            )}
            <p className="px-3 pt-3 text-[12px] font-medium text-text-2 max-md:hidden">Target: every certificate checked within 4 hours of upload.</p>
          </div>

          {/* (b) document viewer + (c) decision rail: remount per case so the note and zoom reset */}
          <CaseDetail key={c.id} c={c} state={stateOf(c.id)} onDecide={decide} onMessages={(id) => { session.viewThread(id); navigate('admin.messages') }} />
        </div>
      </div>
    </ConsoleShell>
  )
}

function CaseDetail({ c, state, onDecide, onMessages }: { c: VetCase; state: VetState; onDecide: (s: VetState, remark: string) => void; onMessages: (thread: string) => void }) {
  const { toast } = useNav()
  const locks = useSession((s) => s.temperamentLocks)
  const savedRemark = useSession((s) => s.vetRemarks[c.id] ?? '')
  const [zoom, setZoom] = useState(1)
  const [turn, setTurn] = useState(0)
  const ex = expiryOf(c)
  const [intent, setIntent] = useState<'approve' | 'reject'>(ex.days < 0 ? 'reject' : 'approve')
  const [remark, setRemark] = useState(ex.days < 0 ? DEMO_VET_REJECT : DEMO_VET_REMARK)
  const [noteError, setNoteError] = useState('')
  const fb = FEEDBACK[c.id]
  const locked = locks[c.dog]
  const [pick, setPick] = useState<Temperament>(locked ?? fb?.suggests ?? c.temperament)
  const [drawer, setDrawer] = useState(false)
  const isOwner = c.id === OWNER_CASE_ID
  const [outbound, setOutbound] = useState((ex.bad ? DEMO_ADMIN_OUTBOUND : DEMO_ADMIN_OUTBOUND_CHECK).replace('Rabies', c.doc))
  const thread = isOwner ? 'support-owner' : (OWNER_THREADS.find((t) => t.caseId === c.id)?.id ?? 'support-owner')
  const first = c.owner.split(' ')[0]

  const declared = { dog: c.dog, breed: c.breed, vaccine: c.doc, given: c.given, expires: c.expires, ...DECLARED[c.id] }
  const rows: { label: string; declared: string; paper: string }[] = [
    { label: 'Dog', declared: declared.dog, paper: c.dog },
    { label: 'Breed', declared: declared.breed, paper: c.breed },
    { label: 'Vaccine', declared: declared.vaccine, paper: c.doc },
    { label: 'Date given', declared: declared.given, paper: c.given },
    { label: 'Valid until', declared: declared.expires, paper: c.expires },
  ]
  const mismatches = rows.filter((r) => r.declared !== r.paper).length

  const choose = (i: 'approve' | 'reject') => {
    setIntent(i)
    setNoteError('')
    if (remark === DEMO_VET_REMARK || remark === DEMO_VET_REJECT || !remark.trim()) setRemark(i === 'approve' ? DEMO_VET_REMARK : DEMO_VET_REJECT)
  }
  const commit = (s: 'approved' | 'rejected') => {
    let note = remark.trim()
    // the note follows the button: Reject never sends the approval wording
    if (s === 'rejected' && (note === DEMO_VET_REMARK || !note)) note = DEMO_VET_REJECT
    if (s === 'approved' && note === DEMO_VET_REJECT) note = DEMO_VET_REMARK
    if (s === 'approved' && !note) return setNoteError('Add a short note for the owner, or tap the approval preset.')
    setRemark(note)
    setIntent(s === 'approved' ? 'approve' : 'reject')
    onDecide(s, note)
  }
  const sendOutbound = () => {
    if (!outbound.trim()) return toast('Write a message first', 'neutral')
    if (isOwner) session.send('support-owner', 'admin', outbound.trim())
    toast(`Message sent to ${c.owner}`, 'accent')
    setDrawer(false)
  }

  return (
    <>
      {/* (b) the document viewer */}
      <section className="relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-t-[var(--r-container)] bg-ink text-on-ink max-md:mt-3 max-md:rounded-none">
        <span aria-hidden className="dots-light" />
        <div className="relative flex shrink-0 items-center gap-3 px-5 pb-3 pt-4 max-md:px-4">
          <FileText size={17} className="shrink-0 text-sun-light" aria-hidden />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="meta block truncate text-white">{c.file}</span>
            <span className="block truncate text-[12px] font-semibold text-on-ink-2">Uploaded {c.submitted} · {c.doc} certificate</span>
          </span>
          <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-[rgb(255_255_255/0.1)] p-1">
            <IconButton icon={Minus} label="Zoom out" size={34} className="text-white hover:bg-[rgb(255_255_255/0.14)]" onClick={() => setZoom((z) => Math.max(0.7, Math.round((z - 0.15) * 100) / 100))} />
            <span className="num w-11 text-center text-[12px] font-bold">{Math.round(zoom * 100)}%</span>
            <IconButton icon={Plus} label="Zoom in" size={34} className="text-white hover:bg-[rgb(255_255_255/0.14)]" onClick={() => setZoom((z) => Math.min(1.9, Math.round((z + 0.15) * 100) / 100))} />
            <IconButton icon={RotateCw} label="Rotate" size={34} className="text-white hover:bg-[rgb(255_255_255/0.14)]" onClick={() => setTurn((t) => t + 90)} />
            <IconButton icon={RotateCcw} label="Reset view" size={34} className="text-white hover:bg-[rgb(255_255_255/0.14)]" onClick={() => { setZoom(1); setTurn(0) }} />
          </div>
        </div>

        <div className="relative grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_244px] gap-4 px-5 pb-4 max-md:grid-cols-1 max-md:px-4">
          {/* the paper */}
          <div className="relative min-h-0 overflow-hidden rounded-[var(--r-card)] bg-[rgb(255_255_255/0.07)] max-md:h-[440px]">
            <div className="absolute inset-0 grid place-items-center p-4">
              <motion.div animate={{ scale: zoom, rotate: turn }} transition={spring.ui} className="origin-center">
                <Certificate c={c} />
              </motion.div>
            </div>
            <span className="label absolute left-3 top-3 rounded-full bg-[rgb(10_18_56/0.7)] px-2.5 py-1 text-white">As uploaded</span>
          </div>

          {/* what the owner declared, checked against the paper */}
          <div className="flex min-h-0 flex-col gap-3 md:overflow-y-auto">
            <div className="rounded-[var(--r-card)] bg-[var(--surface)] p-4 text-text">
              <div className="flex items-center justify-between gap-2">
                <p className="label text-text-2">Owner declared</p>
                <span className={`inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[11px] font-extrabold ${mismatches ? 'bg-danger-soft text-[var(--on-danger-soft)]' : 'bg-success-soft text-[var(--on-success-soft)]'}`}>
                  {mismatches ? <AlertTriangle size={12} strokeWidth={2.6} aria-hidden /> : <Check size={12} strokeWidth={3} aria-hidden />}
                  {mismatches ? `${mismatches} mismatch` : '5 of 5 match'}
                </span>
              </div>
              <dl className="mt-2.5 flex flex-col">
                {rows.map((r) => {
                  const ok = r.declared === r.paper
                  return (
                    <div key={r.label} className="flex items-start gap-2 py-[7px]">
                      <span className={`mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full ${ok ? 'bg-calm text-white' : 'bg-danger text-white'}`}>
                        {ok ? <Check size={11} strokeWidth={3.4} aria-hidden /> : <X size={11} strokeWidth={3.4} aria-hidden />}
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <dt className="text-[11px] font-bold text-text-2">{r.label}</dt>
                        <dd className="truncate text-[14px] font-extrabold">{r.declared}</dd>
                        {!ok && <dd className="mt-0.5 text-[12px] font-bold text-danger-text">Paper says {r.paper}</dd>}
                      </span>
                    </div>
                  )
                })}
              </dl>
            </div>

            {/* automatic expiry check */}
            <div className={`rounded-[var(--r-card)] p-4 ${ex.bad ? 'bg-danger text-on-danger' : 'bg-[#12653f] text-white'}`}>
              <p className="label flex items-center gap-1.5">
                {ex.bad ? <AlertTriangle size={13} strokeWidth={2.6} aria-hidden /> : <CircleCheck size={13} strokeWidth={2.6} aria-hidden />} Expiry check
              </p>
              <p className="figure mt-2 text-[34px]">
                {Math.abs(ex.days)}
                <span className="unit" style={{ verticalAlign: 'baseline', fontSize: '0.38em' }}>{ex.days < 0 ? 'days past' : 'days left'}</span>
              </p>
              <p className="mt-1.5 text-[13px] font-bold leading-snug">{ex.text}. Valid until {c.expires}, checked against today, 14 Nov 2026.</p>
            </div>

            {c.flag && (
              <div className="flex items-start gap-2 rounded-[var(--r-card)] bg-sun p-3.5 text-on-sun">
                <Flag size={15} strokeWidth={2.6} className="mt-0.5 shrink-0" aria-hidden />
                <p className="text-[13px] font-bold leading-snug">{c.flag}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* (c) the decision rail */}
      <aside className="flex min-h-0 min-w-0 flex-col max-md:pb-2">
        <div className="min-h-0 flex-1 px-5 pb-3 max-md:px-4 max-md:pt-5 md:overflow-y-auto">
          {/* owner and dog */}
          <div className="relative h-[104px] overflow-hidden rounded-[var(--r-card)]">
            <img src={img(c.dogPhoto, 640)} alt={`${c.dog}, ${c.breed}`} className="h-full w-full object-cover" style={{ objectPosition: '50% 22%' }} />
            <div className="scrim-b pointer-events-none absolute inset-0" />
            <div className="absolute inset-x-3 bottom-2.5 flex items-end gap-2.5 text-white">
              <Avatar who={c.ownerPhoto} size={38} className="ring-2 ring-white" />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="grot block truncate text-[20px]">{c.dog}</span>
                <span className="block truncate text-[12px] font-semibold">{c.breed} · {c.owner}, {c.locality}</span>
              </span>
            </div>
          </div>

          {/* temperament & safety audit */}
          <h2 className="grot mt-4 text-[19px]">Temperament & safety audit</h2>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="text-[12px] font-bold text-text-2">Owner declared</span>
            <TemperBadge t={c.temperament} />
          </div>
          {fb ? (
            <div className="mt-2.5 flex gap-2.5 rounded-[var(--r-control)] bg-[var(--surface-high)] p-2.5">
              <Avatar who={fb.who} size={30} />
              <p className="min-w-0 flex-1 text-[12px] font-medium leading-snug">
                <span className="font-extrabold">{fb.name}</span> <span className="text-text-2">· walker · {fb.when}</span>
                <br />
                {fb.text}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[12px] font-semibold text-text-2">No walker flags on {c.dog} so far.</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Temperament tag">
            {(['calm', 'reactive'] as const).map((t) => {
              const on = pick === t
              const tone = TEMPER_TONE[t]
              return (
                <motion.button key={t} type="button" role="radio" aria-checked={on} whileTap={tap} transition={spring.ui} onClick={() => setPick(t)} className="flex h-11 items-center justify-center gap-1.5 rounded-[var(--r-control)] text-[13px] font-extrabold transition-colors duration-150" style={on ? { background: tone.fill, color: '#fff' } : { background: tone.soft, color: tone.onSoft }}>
                  {on && <Check size={14} strokeWidth={3} aria-hidden />}
                  {TEMPERAMENT[t].short}
                </motion.button>
              )
            })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`flex min-w-0 flex-1 items-center gap-1.5 text-[12px] font-bold ${locked ? 'text-text' : 'text-text-2'}`}>
              {locked ? <Lock size={14} strokeWidth={2.6} className="shrink-0 text-accent-ink" aria-label="Locked" /> : <LockOpen size={14} strokeWidth={2.4} className="shrink-0" aria-hidden />}
              <span className="truncate">{locked ? `Locked as ${TEMPERAMENT[locked].short}` : 'Tag not locked yet'}</span>
            </span>
            <Button
              size="sm"
              variant={locked === pick ? 'outline' : 'ink'}
              icon={Lock}
              onClick={() => {
                session.lockTemperament(c.dog, pick)
                toast(`${c.dog} locked as ${TEMPERAMENT[pick].label}. ${pick === 'reactive' ? 'Only certified walkers will be matched.' : 'Standard handling applies.'}`, 'accent')
              }}
            >
              {locked === pick ? 'Locked' : locked ? 'Re-lock tag' : 'Lock tag'}
            </Button>
          </div>

          {/* the feedback note */}
          <div className="mt-4 flex items-center gap-1.5">
            {(['approve', 'reject'] as const).map((i) => (
              <button key={i} type="button" onClick={() => choose(i)} aria-pressed={intent === i} className={`h-8 rounded-full px-3 text-[12px] font-bold ${intent === i ? (i === 'approve' ? 'bg-success-soft text-[var(--on-success-soft)]' : 'bg-danger-soft text-[var(--on-danger-soft)]') : 'bg-[var(--surface-high)] text-text-2'}`}>
                {i === 'approve' ? 'Approval note' : 'Rejection note'}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <TextArea label={`Feedback note to ${first}`} rows={3} value={remark} onChange={(e) => { setRemark(e.target.value); setNoteError('') }} error={noteError || undefined} hint="Shown in the Owner App on the certificate." className="!text-[13px] !leading-snug" />
          </div>
        </div>

        {/* decision footer */}
        <div className="shrink-0 px-5 pb-4 pt-2 max-md:px-4">
          <AnimatePresence initial={false} mode="wait">
            {state === 'pending' ? (
              <motion.div key="act" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="grid grid-cols-[1fr_1.35fr] gap-2">
                <Button variant="danger" icon={X} block onClick={() => commit('rejected')}>
                  Reject
                </Button>
                <Button icon={Check} block onClick={() => commit('approved')}>
                  Approve
                </Button>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={spring.pop} exit={{ opacity: 0, transition: { duration: 0.1 } }} className={`rounded-[var(--r-card)] p-3 ${state === 'approved' ? 'bg-success-soft' : 'bg-danger-soft'}`}>
                <div className="flex items-center justify-between gap-2">
                  <StatusPill kind={state} className="bg-[var(--surface)]" />
                  <button type="button" onClick={() => { session.decideVet(c.id, 'pending', ''); toast(`${c.dog}’s certificate is back in the queue`, 'neutral') }} className="flex h-9 items-center gap-1 rounded-full px-2 text-[12px] font-bold text-text">
                    <Undo2 size={13} strokeWidth={2.6} aria-hidden /> Undo
                  </button>
                </div>
                <p className="mt-1.5 text-[12px] font-semibold leading-snug text-text">{savedRemark || 'No note sent.'}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" block onClick={() => setDrawer(true)}>
              Message owner
            </Button>
            <Button size="sm" variant="ghost" block onClick={() => onMessages(thread)}>
              Open in Messages
            </Button>
          </div>
        </div>
      </aside>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Message owner">
        <div className="flex items-center gap-3">
          <Avatar who={c.ownerPhoto} size={52} ring />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[17px] font-extrabold">{c.owner}</p>
            <p className="truncate text-[13px] font-semibold text-text-2">{c.locality}, {c.city} · about {c.dog}’s {c.doc} certificate</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {[
            { label: 'Ask for a clearer scan', text: DEMO_ADMIN_OUTBOUND_CHECK },
            { label: 'Certificate expired', text: DEMO_ADMIN_OUTBOUND.replace('Rabies', c.doc) },
            { label: 'Temperament check', text: `Hi ${first}, Kavya from Vuffora here. A walker shared feedback about ${c.dog} on a recent walk. Could you tell us how ${c.dog} is around other dogs and bikes, so we set the right handling tag?` },
          ].map((p) => (
            <button key={p.label} type="button" onClick={() => setOutbound(p.text)} aria-pressed={outbound === p.text} className={`h-9 rounded-full px-3 text-[13px] font-bold ${outbound === p.text ? 'bg-accent text-on-accent' : 'bg-[var(--surface-high)] text-text'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <TextArea label="Outbound message" rows={6} value={outbound} onChange={(e) => setOutbound(e.target.value)} hint={`Delivered to ${first}’s Help & Support chat with a push notification.`} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button icon={SendHorizontal} block onClick={sendOutbound}>
            Send to {first}
          </Button>
        </div>
        <button type="button" onClick={() => { setDrawer(false); onMessages(thread) }} className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 text-[14px] font-bold text-accent-ink">
          Open in Messages <ArrowUpRight size={15} strokeWidth={2.6} aria-hidden />
        </button>
      </Drawer>
    </>
  )
}

/* A drawn facsimile of the uploaded certificate. Fixed size; the viewer scales and rotates it. */
function Certificate({ c }: { c: VetCase }) {
  const [doctor, clinic, place] = c.vet.split(', ')
  const reg = `PVC/${2014 + (c.batch.length % 7)}/${c.batch.replace(/\D/g, '').slice(0, 4)}`
  const ink = '#1d3a8f'
  return (
    <div className="relative w-[296px] bg-[#fdfbf3] p-[18px] text-[#1c2233] shadow-[0_18px_40px_-12px_rgb(0_0_0/0.55)]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {/* letterhead */}
      <div className="flex items-center gap-2 border-b-2 pb-2" style={{ borderColor: ink }}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white" style={{ background: ink }}>
          <PawPrint size={18} aria-hidden />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[14px] font-bold" style={{ color: ink }}>{clinic}</span>
          <span className="block truncate text-[10px]">{place ?? c.city} · Reg. {reg}</span>
        </span>
      </div>
      <p className="mt-2.5 text-center text-[11px] font-bold uppercase tracking-[0.14em]">Certificate of vaccination</p>

      <dl className="mt-2.5 flex flex-col gap-[5px] text-[11px]">
        {[
          ['Patient', `${c.dog} (${c.breed})`],
          ['Owner', c.owner],
          ['Vaccine', c.doc],
          ['Product', VACCINE_BRAND[c.doc]],
          ['Batch no.', c.batch],
          ['Date given', c.given],
          ['Valid until', c.expires],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2">
            <dt className="w-[74px] shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.05em] text-[#5a6072]">{k}</dt>
            <dd className="min-w-0 flex-1 truncate border-b border-dotted border-[#9aa0b4] pb-px font-bold" style={k === 'Batch no.' ? { fontFamily: 'var(--font-mono)', fontWeight: 500 } : undefined}>{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-2.5 text-[10px] leading-snug text-[#5a6072]">Certified that the above animal was examined, found clinically healthy and vaccinated on the date shown.</p>

      {/* signature and stamp */}
      <div className="relative mt-2 flex items-end justify-between">
        <div className="leading-tight">
          <svg width="96" height="30" viewBox="0 0 96 30" aria-hidden>
            <path d="M4 22 C 10 4, 16 4, 15 18 S 24 8, 28 16 S 34 24, 40 12 S 46 6, 50 18 S 60 22, 66 10 S 74 20, 92 8" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="block text-[10px] font-bold">{doctor}</span>
          <span className="block text-[10px] text-[#5a6072]">B.V.Sc & A.H.</span>
        </div>
        <svg width="74" height="74" viewBox="0 0 74 74" className="-mb-1 -mr-1" style={{ transform: 'rotate(-14deg)' }} aria-hidden>
          <circle cx="37" cy="37" r="34" fill="none" stroke={ink} strokeWidth="2" opacity="0.75" />
          <circle cx="37" cy="37" r="24" fill="none" stroke={ink} strokeWidth="1" opacity="0.75" />
          <path id={`arc-${c.id}`} d="M 9 37 A 28 28 0 0 1 65 37" fill="none" />
          <text fontSize="7" fontWeight="700" fill={ink} opacity="0.8" letterSpacing="1">
            <textPath href={`#arc-${c.id}`} startOffset="50%" textAnchor="middle">REGD. VETERINARY</textPath>
          </text>
          <text x="37" y="36" textAnchor="middle" fontSize="8" fontWeight="700" fill={ink} opacity="0.8">VACCINATED</text>
          <text x="37" y="46" textAnchor="middle" fontSize="7" fill={ink} opacity="0.8">{c.given.slice(0, 6).toUpperCase()}</text>
          <text x="37" y="60" textAnchor="middle" fontSize="6" fill={ink} opacity="0.8">★ ★ ★</text>
        </svg>
      </div>
      <p className="meta mt-2 truncate border-t border-[#d9d5c4] pt-1.5 text-[10px] text-[#5a6072]">{c.file} · page 1 of 1</p>
    </div>
  )
}
