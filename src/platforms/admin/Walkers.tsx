import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpDown, BadgeCheck, Check, Compass, Landmark, MessageSquareText, ShieldCheck, Sparkles, Undo2, X } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Certified, Stars, StatusPill } from '../../components/Brand'
import { Button } from '../../components/Button'
import { ProgressRing } from '../../components/Charts'
import { Toggle } from '../../components/Form'
import { CITIES, WALKERS, walkerById, type City, type Walker } from '../../data/cast'
import { KYC_QUEUE, WALKER_CASE_ID, type KycDoc, type VetState } from '../../data/core'
import { useNav } from '../../lib/navigation'
import { getSession, kycState, session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* Walker KYC & tier management. Top: the KYC queue as master-detail (the
   applicant band, a four-document checklist with drawn thumbnails, and the
   ink badge rail with the Aggressive Breed Certified switch). Below: the
   tier table of active walkers with a working featured-listing switch.
   Case kq1 is Arjun's renewal: approving it changes the Walker App. */

type DocState = KycDoc['state']
type SortKey = 'name' | 'rating' | 'walks' | 'years'

const tierOf = (w: Walker) => (w.walks >= 1000 ? { label: 'Pro', cls: 'bg-ink text-on-ink' } : w.walks >= 400 ? { label: 'Trusted', cls: 'bg-accent-soft text-[var(--on-accent-soft)]' } : { label: 'Rising', cls: 'bg-[var(--surface-high)] text-text' })

export default function AdminWalkers() {
  const { navigate, toast } = useNav()
  const viewing = useSession((s) => s.viewingKyc)
  const decisions = useSession((s) => s.kycDecisions)
  const badges = useSession((s) => s.badges)
  const [docs, setDocs] = useState<Record<string, DocState[]>>(() => Object.fromEntries(KYC_QUEUE.map((k) => [k.id, k.docs.map((d) => d.state)])))
  const [featured, setFeatured] = useState<Record<string, boolean>>(() => Object.fromEntries(WALKERS.map((w) => [w.id, w.featured])))
  const [city, setCity] = useState<City | 'All'>('All')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'walks', dir: -1 })

  const stateOf = (id: string): VetState => decisions[id] ?? KYC_QUEUE.find((k) => k.id === id)?.state ?? 'pending'
  const k = KYC_QUEUE.find((x) => x.id === viewing) ?? KYC_QUEUE[0]
  const kDocs = docs[k.id]
  const verified = kDocs.filter((d) => d === 'verified').length
  const state = stateOf(k.id)
  const linked = k.walkerId ? walkerById(k.walkerId) : undefined
  const badgeOn = badges[k.id] ?? ((k.wantsCertified && verified === 4) || !!linked?.certified)
  const pendingCount = KYC_QUEUE.filter((x) => stateOf(x.id) === 'pending').length
  const first = k.name.split(' ')[0]

  const setDoc = (i: number, s: DocState) => setDocs((d) => ({ ...d, [k.id]: d[k.id].map((x, j) => (j === i ? s : x)) }))

  const advance = () => {
    const at = KYC_QUEUE.findIndex((x) => x.id === k.id)
    const next = [...KYC_QUEUE.slice(at + 1), ...KYC_QUEUE.slice(0, at)].find((x) => kycState(x.id, getSession()) === 'pending')
    if (next) window.setTimeout(() => session.viewKyc(next.id), 900)
  }
  const approve = () => {
    const blocker = k.docs.find((_, i) => kDocs[i] === 'missing' || kDocs[i] === 'rejected')
    if (blocker) return toast(`${blocker.name} is ${kDocs[k.docs.indexOf(blocker)]}. Mark it verified first, or reject the application.`, 'warn')
    setDocs((d) => ({ ...d, [k.id]: d[k.id].map(() => 'verified' as DocState) }))
    session.decideKyc(k.id, 'approved')
    if (badges[k.id] === undefined && (k.wantsCertified || linked?.certified)) session.setBadge(k.id, true)
    toast(k.id === WALKER_CASE_ID ? 'Arjun’s police verification is verified. His Walker App now shows Approved.' : `${k.name} approved and live in ${k.city}`, 'accent')
    advance()
  }
  const reject = () => {
    session.decideKyc(k.id, 'rejected')
    session.setBadge(k.id, false)
    toast(`${k.name}’s application rejected. ${first} has been asked to re-upload.`, 'danger')
    advance()
  }
  const message = () => {
    session.viewThread('support-walker')
    navigate('admin.messages')
  }

  const rows = WALKERS.filter((w) => city === 'All' || w.city === city).sort((a, b) => (sort.key === 'name' ? a.name.localeCompare(b.name) : a[sort.key] - b[sort.key]) * sort.dir)
  const certifiedOf = (w: Walker) => (w.id === 'arjun' && badges[WALKER_CASE_ID] !== undefined ? badges[WALKER_CASE_ID] : w.certified)
  const sortBy = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'name' ? 1 : -1 }))
  const SortHead = ({ k: key, label, className = '' }: { k: SortKey; label: string; className?: string }) => (
    <button type="button" onClick={() => sortBy(key)} className={`label flex h-9 items-center gap-1 ${sort.key === key ? 'text-text' : 'text-text-2'} ${className}`} aria-label={`Sort by ${label}`}>
      {label}
      {sort.key === key ? sort.dir === 1 ? <ArrowUp size={12} strokeWidth={2.8} aria-hidden /> : <ArrowDown size={12} strokeWidth={2.8} aria-hidden /> : <ArrowUpDown size={12} strokeWidth={2.4} aria-hidden />}
    </button>
  )

  return (
    <ConsoleShell
      active="admin.walkers"
      title={<>Walker KYC & <span className="swoosh">tiers</span></>}
      sub={`${pendingCount} applications waiting · ${WALKERS.length} of 214 active walkers shown · ${WALKERS.filter((w) => w.online).length} online now`}
      actions={
        <Button size="sm" variant="outline" icon={MessageSquareText} onClick={message}>
          Message walker
        </Button>
      }
    >
      {/* ── KYC queue: master-detail ── */}
      <section className="grid grid-cols-[236px_minmax(0,1fr)_292px] gap-5 px-8 max-md:flex max-md:flex-col max-md:gap-4 max-md:px-0">
        {/* queue */}
        <motion.ul variants={listParent} initial="hidden" animate="show" className="flex flex-col gap-1 max-md:flex-row max-md:gap-2 max-md:overflow-x-auto max-md:px-4 max-md:pb-1">
          {KYC_QUEUE.map((q) => {
            const on = q.id === k.id
            const st = stateOf(q.id)
            const done = docs[q.id].filter((d) => d === 'verified').length
            return (
              <motion.li key={q.id} variants={listItem} className="max-md:w-[230px] max-md:shrink-0">
                <motion.button type="button" whileTap={{ scale: 0.98 }} transition={spring.ui} onClick={() => session.viewKyc(q.id)} aria-current={on ? 'true' : undefined} className={`flex w-full items-center gap-2.5 rounded-[var(--r-card)] p-2.5 text-left transition-colors duration-150 ${on ? 'bg-ink text-on-ink shadow-[var(--glow-ink)]' : 'hover:bg-[var(--surface-high)] max-md:bg-[var(--surface)] max-md:shadow-[var(--shadow-raised)]'}`}>
                  <Avatar who={q.photo} size={42} ring={on} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[14px] font-extrabold">{q.name}</span>
                    <span className={`block truncate text-[12px] font-semibold ${on ? 'text-on-ink-2' : 'text-text-2'}`}>{q.locality}, {q.city}</span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${st === 'approved' ? 'bg-calm' : st === 'rejected' ? 'bg-danger' : 'bg-sun'}`} />
                      <span className={`meta truncate ${on ? 'text-on-ink-2' : 'text-text-2'}`}>{st === 'pending' ? `${done}/4 · ${q.submitted}` : st === 'approved' ? 'Approved' : 'Rejected'}</span>
                    </span>
                  </span>
                </motion.button>
              </motion.li>
            )
          })}
        </motion.ul>

        {/* applicant + document checklist */}
        <div key={k.id} className="min-w-0 max-md:px-4">
          <div className="relative overflow-hidden rounded-[var(--r-container)] bg-accent p-5 text-on-accent">
            <span aria-hidden className="sun -right-[9%] -top-[62%] w-[24%] max-md:-right-[12%] max-md:-top-[38%] max-md:w-[30%]" />
            <div className="relative flex items-center gap-4">
              <Avatar who={k.photo} size={72} className="ring-[3px] ring-white" verified={state === 'approved'} />
              <div className="min-w-0 flex-1">
                <p className="label text-[var(--on-accent-2)]">{k.id === WALKER_CASE_ID ? 'Renewal' : 'New application'} · {k.submitted}</p>
                <h2 className="grot mt-1 truncate text-[30px] text-white">{k.name}</h2>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-semibold text-[var(--on-accent-2)]">
                  <span className="flex items-center gap-1"><Sparkles size={14} aria-hidden /> {k.experience}</span>
                  <span className="flex items-center gap-1"><Compass size={14} aria-hidden /> {k.radiusKm} km radius from {k.locality}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <h3 className="grot text-[20px]">Document checklist</h3>
            <span className="num text-[13px] font-bold text-text-2">{verified} of 4 verified</span>
          </div>
          <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-1 flex flex-col">
            {k.docs.map((d, i) => {
              const st = kDocs[i]
              return (
                <motion.li key={d.name} variants={listItem} className="flex items-center gap-3.5 py-2.5 max-md:flex-wrap">
                  <DocThumb name={d.name} state={st} />
                  <span className="min-w-0 flex-1 leading-tight max-md:basis-[55%]">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[15px] font-extrabold">{d.name}</span>
                      <StatusPill kind={st} />
                    </span>
                    <span className="meta mt-1 block truncate text-text-2">{d.file}</span>
                    {d.note && <span className={`mt-0.5 block truncate text-[12px] font-semibold ${st === 'rejected' || st === 'missing' ? 'text-danger-text' : 'text-text-2'}`}>{d.note}</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 max-md:w-full">
                    {st === 'verified' ? (
                      <Button size="sm" variant="ghost" icon={Undo2} onClick={() => setDoc(i, 'review')} className="max-md:!h-11">
                        Undo
                      </Button>
                    ) : (
                      <Button size="sm" variant="ink" icon={Check} onClick={() => { setDoc(i, 'verified'); toast(`${d.name} marked verified for ${first}`, 'accent') }} className="max-md:!h-11 max-md:flex-1">
                        Verify
                      </Button>
                    )}
                    {st !== 'rejected' && (
                      <Button size="sm" variant="danger" icon={X} onClick={() => { setDoc(i, 'rejected'); toast(`${d.name} rejected. ${first} will be asked for a new upload.`, 'danger') }} className="max-md:!h-11">
                        Reject
                      </Button>
                    )}
                  </span>
                </motion.li>
              )
            })}
          </motion.ul>
        </div>

        {/* badge assignment + decision */}
        <aside className="relative flex flex-col self-start overflow-hidden rounded-[var(--r-container)] bg-ink p-5 text-on-ink max-md:mx-4 max-md:self-stretch">
          <span aria-hidden className="dots-light" />
          <div className="relative flex items-center gap-3">
            <ProgressRing value={(verified / 4) * 100} size={58} stroke={6} color="var(--sun)">
              <span className="figure text-[19px] text-white">{verified}/4</span>
            </ProgressRing>
            <div className="min-w-0 leading-tight">
              <p className="label text-on-ink-2">Badge assignment</p>
              <p className="mt-1 truncate text-[15px] font-extrabold text-white">{first}’s tier and badges</p>
            </div>
          </div>

          <div className="relative mt-4 rounded-[var(--r-card)] bg-[rgb(255_255_255/0.09)] p-3.5">
            <div className="flex items-center gap-3">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${badgeOn ? 'bg-sun text-on-sun' : 'bg-[rgb(255_255_255/0.12)] text-white'}`}>
                <ShieldCheck size={20} strokeWidth={2.4} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-[14px] font-extrabold leading-tight text-white">Aggressive Breed Certified</span>
              <Toggle
                on={badgeOn}
                label="Aggressive Breed Certified"
                onChange={(v) => {
                  session.setBadge(k.id, v)
                  toast(v ? `${first} can now be matched with Aggressive-tagged dogs` : `Badge removed. ${first} will only see Calm-tagged dogs.`, v ? 'accent' : 'neutral')
                }}
              />
            </div>
            <p className="mt-2.5 text-[12px] font-medium leading-snug text-on-ink-2">
              {k.wantsCertified ? `${first} applied for this badge.` : `${first} did not apply for this badge.`} It unlocks the handling surcharge and Aggressive-tagged bookings.
            </p>
          </div>

          <div className="relative mt-4">
            <AnimatePresence initial={false} mode="wait">
              {state === 'pending' ? (
                <motion.div key="act" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="flex flex-col gap-2">
                  <Button icon={BadgeCheck} block onClick={approve} className="!flex-none">
                    Approve application
                  </Button>
                  <Button variant="white" icon={X} block onClick={reject} className="!flex-none">
                    Reject
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={spring.pop} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="rounded-[var(--r-card)] bg-[var(--surface)] p-3 text-text">
                  <div className="flex items-center justify-between gap-2">
                    <StatusPill kind={state} />
                    <button type="button" onClick={() => { session.decideKyc(k.id, 'pending'); toast(`${k.name} is back in the KYC queue`, 'neutral') }} className="flex h-9 items-center gap-1 rounded-full px-2 text-[12px] font-bold">
                      <Undo2 size={13} strokeWidth={2.6} aria-hidden /> Undo
                    </button>
                  </div>
                  <p className="mt-1 text-[12px] font-semibold leading-snug text-text-2">
                    {state === 'approved' ? `${first} is live in ${k.city}${badgeOn ? ' with the Aggressive Breed Certified badge' : ''}.` : `${first} has been asked to re-upload the rejected documents.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <button type="button" onClick={message} className="mt-2 flex h-11 w-full items-center justify-center gap-1.5 text-[13px] font-bold text-sun-light">
              <MessageSquareText size={15} aria-hidden /> Message {k.id === WALKER_CASE_ID ? first : 'walker'}
            </button>
          </div>
        </aside>
      </section>

      {/* ── Tier table ── */}
      <section className="mt-10 px-8 pb-10 max-md:mt-8 max-md:px-4 max-md:pb-6">
        <div className="flex items-end justify-between gap-4 max-md:flex-col max-md:items-start">
          <div>
            <h2 className="grot text-[26px]">Active walkers and tiers</h2>
            <p className="mt-1 text-[13px] font-semibold text-text-2">Tier follows completed walks. Featured listing puts a walker on the first row in their sector.</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[var(--surface-high)] p-1 max-md:max-w-full max-md:overflow-x-auto" role="tablist" aria-label="City">
            {(['All', ...CITIES] as const).map((ct) => {
              const on = city === ct
              return (
                <motion.button key={ct} type="button" role="tab" aria-selected={on} whileTap={tap} onClick={() => setCity(ct)} className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-bold ${on ? 'bg-[var(--surface)] text-text shadow-[var(--shadow-raised)]' : 'text-text-2'}`}>
                  {ct === 'All' ? 'All cities' : ct} <span className="num text-[11px] text-text-2">{ct === 'All' ? WALKERS.length : WALKERS.filter((w) => w.city === ct).length}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* desktop table */}
        <div className="mt-4 overflow-hidden rounded-[var(--r-card)] bg-[var(--surface)] shadow-[var(--shadow-raised)] max-md:hidden">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: 250 }} />
              <col style={{ width: 118 }} />
              <col style={{ width: 92 }} />
              <col style={{ width: 84 }} />
              <col style={{ width: 76 }} />
              <col />
              <col style={{ width: 96 }} />
              <col style={{ width: 104 }} />
            </colgroup>
            <thead>
              <tr className="bg-[var(--surface-raised)]">
                <th className="py-1 pl-4 font-normal"><SortHead k="name" label="Walker" /></th>
                <th className="font-normal"><span className="label text-text-2">City</span></th>
                <th className="font-normal"><SortHead k="rating" label="Rating" /></th>
                <th className="font-normal"><SortHead k="walks" label="Walks" /></th>
                <th className="font-normal"><SortHead k="years" label="Years" /></th>
                <th className="font-normal"><span className="label text-text-2">Tier and badges</span></th>
                <th className="font-normal"><span className="label text-text-2">Status</span></th>
                <th className="pr-4 font-normal"><span className="label text-text-2">Featured</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => {
                const t = tierOf(w)
                return (
                  <tr key={w.id} className="border-t border-[var(--rule)]">
                    <td className="py-2 pl-4">
                      <span className="flex items-center gap-2.5">
                        <Avatar who={w.photo} size={36} />
                        <span className="min-w-0 leading-tight">
                          <span className="block truncate text-[14px] font-extrabold">{w.name}</span>
                          <span className="block truncate text-[12px] font-semibold text-text-2">{w.locality}</span>
                        </span>
                      </span>
                    </td>
                    <td className="truncate text-[13px] font-semibold">{w.city}</td>
                    <td><Stars rating={w.rating} /></td>
                    <td className="num text-[14px] font-bold">{w.walks.toLocaleString('en-IN')}</td>
                    <td className="num text-[13px] font-semibold text-text-2">{w.years} yr</td>
                    <td>
                      <span className="flex items-center gap-1.5">
                        <span className={`label inline-flex h-6 shrink-0 items-center rounded-full px-2.5 ${t.cls}`}>{t.label}</span>
                        {certifiedOf(w) && <Certified short />}
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1.5 text-[12px] font-bold">
                        <span aria-hidden className={`h-2 w-2 rounded-full ${w.online ? 'bg-calm' : 'bg-[var(--paper-400)]'}`} />
                        {w.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="pr-4">
                      <Toggle on={featured[w.id]} label={`Featured listing for ${w.name}`} onChange={(v) => { setFeatured((f) => ({ ...f, [w.id]: v })); toast(v ? `${w.first} is now featured in ${w.locality}` : `${w.first}’s featured listing is off`, v ? 'accent' : 'neutral') }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* phone: stacked rows */}
        <ul className="mt-3 flex flex-col md:hidden">
          <li className="flex items-center gap-4 pb-1">
            <SortHead k="walks" label="Walks" />
            <SortHead k="rating" label="Rating" />
            <SortHead k="years" label="Years" />
            <SortHead k="name" label="Name" />
          </li>
          {rows.map((w) => {
            const t = tierOf(w)
            return (
              <li key={w.id} className="flex items-center gap-3 border-t border-[var(--rule)] py-3">
                <Avatar who={w.photo} size={44} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-extrabold">{w.name}</span>
                    <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${w.online ? 'bg-calm' : 'bg-[var(--paper-400)]'}`} />
                  </span>
                  <span className="block truncate text-[12px] font-semibold text-text-2">{w.locality} · {w.walks.toLocaleString('en-IN')} walks · {w.years} yr</span>
                  <span className="mt-1.5 flex items-center gap-1.5">
                    <Stars rating={w.rating} size={12} />
                    <span className={`label inline-flex h-6 shrink-0 items-center rounded-full px-2.5 ${t.cls}`}>{t.label}</span>
                    {certifiedOf(w) && <Certified short />}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-center gap-1">
                  <Toggle on={featured[w.id]} label={`Featured listing for ${w.name}`} onChange={(v) => { setFeatured((f) => ({ ...f, [w.id]: v })); toast(v ? `${w.first} is now featured` : `${w.first}’s featured listing is off`, v ? 'accent' : 'neutral') }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-text-2">Featured</span>
                </span>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-[12px] font-medium text-text-2">Showing {rows.length} of 214 walkers. Pro from 1,000 walks, Trusted from 400.</p>
      </section>
    </ConsoleShell>
  )
}

/* A drawn thumbnail for each KYC document type. */
function DocThumb({ name, state }: { name: KycDoc['name']; state: DocState }) {
  const missing = state === 'missing'
  const base = 'relative h-[52px] w-[78px] shrink-0 overflow-hidden rounded-[8px] shadow-[var(--shadow-raised)]'
  if (missing)
    return (
      <span className={`${base} grid place-items-center bg-[var(--surface-high)]`} style={{ boxShadow: 'inset 0 0 0 1.5px var(--rule-strong)' }} aria-hidden>
        <X size={18} className="text-text-2" />
      </span>
    )
  if (name === 'Aadhaar Card')
    return (
      <span className={`${base} bg-white`} aria-hidden>
        <span className="absolute inset-x-0 top-0 flex h-[7px]">
          <span className="flex-1 bg-[#f59e0b]" />
          <span className="flex-1 bg-white" />
          <span className="flex-1 bg-[#16a34a]" />
        </span>
        <span className="absolute left-2 top-[15px] h-[20px] w-[17px] rounded-[3px] bg-[#cbd5e1]" />
        <span className="absolute left-[31px] top-[16px] h-[3px] w-[36px] rounded-full bg-[#94a3b8]" />
        <span className="absolute left-[31px] top-[23px] h-[3px] w-[26px] rounded-full bg-[#cbd5e1]" />
        <span className="absolute inset-x-2 bottom-[6px] h-[5px] rounded-full bg-[#1e293b]" />
      </span>
    )
  if (name === 'PAN Card')
    return (
      <span className={`${base} bg-[#dbeafe]`} aria-hidden>
        <span className="absolute inset-x-0 top-0 h-[10px] bg-[#1d4ed8]" />
        <span className="absolute right-2 top-[16px] h-[20px] w-[17px] rounded-[3px] bg-[#93c5fd]" />
        <span className="absolute left-2 top-[17px] h-[3px] w-[32px] rounded-full bg-[#1e3a8a]" />
        <span className="absolute left-2 top-[24px] h-[3px] w-[24px] rounded-full bg-[#60a5fa]" />
        <span className="absolute left-2 bottom-[7px] h-[5px] w-[40px] rounded-full bg-[#1e3a8a]" />
      </span>
    )
  if (name === 'Police Verification')
    return (
      <span className={`${base} bg-[#fdfbf3]`} aria-hidden>
        <span className="absolute left-1/2 top-[5px] h-[4px] w-[30px] -translate-x-1/2 rounded-full bg-[#334155]" />
        <span className="absolute left-2 top-[15px] h-[2.5px] w-[50px] rounded-full bg-[#cbd5e1]" />
        <span className="absolute left-2 top-[21px] h-[2.5px] w-[42px] rounded-full bg-[#cbd5e1]" />
        <span className="absolute left-2 top-[27px] h-[2.5px] w-[46px] rounded-full bg-[#cbd5e1]" />
        <span className="absolute bottom-[5px] right-[7px] h-[18px] w-[18px] rounded-full border-2 border-[#1d3a8f]" />
      </span>
    )
  return (
    <span className={`${base} grid place-items-center bg-[#ecfdf5]`} aria-hidden>
      <Landmark size={16} className="absolute left-2 top-2 text-[#047857]" />
      <span className="absolute left-[30px] top-[12px] h-[3px] w-[38px] rounded-full bg-[#6ee7b7]" />
      <span className="absolute inset-x-2 top-[26px] h-[2.5px] rounded-full bg-[#a7f3d0]" />
      <span className="absolute inset-x-2 bottom-[7px] h-[5px] rounded-[2px] bg-[#065f46]" />
    </span>
  )
}
