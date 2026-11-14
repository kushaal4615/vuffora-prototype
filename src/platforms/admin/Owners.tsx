import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpDown, BellRing, Check, ChevronLeft, ChevronRight, FileCheck2, KeyRound, Lock, LockOpen, MapPin, MessageSquareText, Phone, Search, X } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { StatusPill, TEMPER_TONE, TemperBadge } from '../../components/Brand'
import { Button } from '../../components/Button'
import { CheckMark } from '../../components/Form'
import { Drawer } from '../../components/Sheet'
import { OWNER_ROWS, OWNER_THREADS, initials, logsFor, maskPhone, type OwnerRow, type VaxStatus } from '../../data/adminPeople'
import { CITIES, DOGS, OWNER, TEMPERAMENT, type City, type Temperament } from '../../data/cast'
import { fmtShort } from '../../data/clock'
import { DEMO_ADMIN_REMINDER, DEMO_ADMIN_SEARCH } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* Owners & dogs directory. An ink summary band (dogs registered, the calm
   vs aggressive split, documents expiring), a real table with search,
   filters, sort, pagination and bulk reminders, a photo rail of dogs whose
   documents are running out, and a drawer per owner. */

type VaxEff = VaxStatus | 'rejected'
type SortKey = 'owner' | 'walks' | 'joined' | 'lastWalk'
const PER_PAGE = 10
const VAX_LABEL: Record<VaxEff, string> = { approved: 'Approved', review: 'Under review', expiring: 'Expiring', expired: 'Expired', rejected: 'Rejected' }
const WALKER_NAMES = ['Arjun Mehta', 'Pooja Bhatia', 'Gurpreet Sandhu', 'Imran Qureshi', 'Nikhil Arora', 'Divya Rawat', 'Farhan Ali', 'Rohan Kapoor']

function Face({ r, size = 36 }: { r: OwnerRow; size?: number }) {
  if (r.photo) return <Avatar who={r.photo} size={size} />
  return (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full bg-accent-soft font-extrabold text-[var(--on-accent-soft)]" style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}>
      {initials(r.owner)}
    </span>
  )
}

function VaxPill({ v }: { v: VaxEff }) {
  if (v === 'expired') return <StatusPill kind="rejected" label="Expired" />
  return <StatusPill kind={v} />
}

export default function AdminOwners() {
  const { navigate, toast } = useNav()
  const locks = useSession((s) => s.temperamentLocks)
  const decisions = useSession((s) => s.vetDecisions)
  const [q, setQ] = useState(DEMO_ADMIN_SEARCH)
  const [city, setCity] = useState<City | 'All'>('All')
  const [temper, setTemper] = useState<Temperament | 'all'>('all')
  const [vax, setVax] = useState<VaxEff | 'all'>('all')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'lastWalk', dir: -1 })
  const [page, setPage] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  const temperOf = (r: OwnerRow): Temperament => locks[r.dog] ?? r.temperament
  const lockedOf = (r: OwnerRow) => r.locked || !!locks[r.dog]
  const vaxOf = (r: OwnerRow): VaxEff => {
    const d = r.caseId ? decisions[r.caseId] : undefined
    return d === 'approved' ? 'approved' : d === 'rejected' ? 'rejected' : r.vax
  }

  const needle = q.trim().toLowerCase()
  const filtered = OWNER_ROWS.filter((r) => !needle || [r.owner, r.dog, r.breed, r.locality, r.city].some((x) => x.toLowerCase().includes(needle)))
    .filter((r) => city === 'All' || r.city === city)
    .filter((r) => temper === 'all' || temperOf(r) === temper)
    .filter((r) => vax === 'all' || vaxOf(r) === vax)
    .sort((a, b) => (sort.key === 'walks' ? a.walks - b.walks : a[sort.key].localeCompare(b[sort.key])) * sort.dir)
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const at = Math.min(page, pages - 1)
  const rows = filtered.slice(at * PER_PAGE, at * PER_PAGE + PER_PAGE)
  const allOnPage = rows.length > 0 && rows.every((r) => picked.includes(r.id))

  const reset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v)
    setPage(0)
  }
  const sortBy = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'owner' ? 1 : -1 }))
    setPage(0)
  }
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const remind = () => {
    let ids = picked
    if (ids.length === 0) {
      ids = filtered.filter((r) => ['expiring', 'expired', 'rejected'].includes(vaxOf(r))).map((r) => r.id)
      if (ids.length === 0) return toast('No one in this view has a document running out', 'neutral')
      setPicked(ids)
    }
    const owners = new Set(OWNER_ROWS.filter((r) => ids.includes(r.id)).map((r) => r.owner)).size
    toast(`Reminder sent to ${owners} ${owners === 1 ? 'owner' : 'owners'}: “${DEMO_ADMIN_REMINDER.slice(0, 52)}…”`, 'accent')
  }

  /* platform figures for the band; the directory below is one page of it */
  const TOTAL_DOGS = 1284
  const reactivePct = 14
  const expiringRows = OWNER_ROWS.filter((r) => ['expiring', 'expired'].includes(vaxOf(r)))
  const open = OWNER_ROWS.find((r) => r.id === openId) ?? null

  const SortHead = ({ k, label }: { k: SortKey; label: string }) => (
    <button type="button" onClick={() => sortBy(k)} className={`label flex h-10 items-center gap-1 ${sort.key === k ? 'text-text' : 'text-text-2'}`} aria-label={`Sort by ${label}`}>
      {label}
      {sort.key === k ? sort.dir === 1 ? <ArrowUp size={12} strokeWidth={2.8} aria-hidden /> : <ArrowDown size={12} strokeWidth={2.8} aria-hidden /> : <ArrowUpDown size={12} strokeWidth={2.4} aria-hidden />}
    </button>
  )
  const Group = <T extends string>({ label, items, value, onChange }: { label: string; items: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) => (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--surface-high)] p-1" role="tablist" aria-label={label}>
      {items.map((it) => {
        const on = value === it.id
        return (
          <motion.button key={it.id} type="button" role="tab" aria-selected={on} whileTap={tap} onClick={() => onChange(it.id)} className={`h-8 shrink-0 rounded-full px-3 text-[12px] font-bold max-md:h-9 ${on ? 'bg-ink text-on-ink' : 'text-text-2'}`}>
            {it.label}
          </motion.button>
        )
      })}
    </div>
  )

  return (
    <ConsoleShell
      active="admin.owners"
      title={<>Owners & <span className="swoosh">dogs</span></>}
      sub="Every registered dog, its temperament tag and where its vaccination documents stand"
      actions={
        <Button size="sm" icon={BellRing} onClick={remind}>
          Send reminder{picked.length ? ` · ${picked.length}` : ''}
        </Button>
      }
    >
      {/* summary band */}
      <section className="relative mx-8 overflow-hidden rounded-[var(--r-container)] bg-ink text-on-ink max-md:mx-0 max-md:rounded-none">
        <span aria-hidden className="sun -left-[7%] -top-[95%] w-[30%] max-md:hidden" />
        <span aria-hidden className="dots-light" />
        <div className="relative grid grid-cols-[226px_minmax(0,1fr)_214px_190px] items-center gap-7 p-6 pl-8 max-md:grid-cols-1 max-md:gap-5 max-md:p-4 max-md:pt-6">
          <div className="max-md:rounded-[var(--r-card)] max-md:bg-sun max-md:p-4">
            <p className="label text-on-sun">Dogs registered</p>
            <p className="figure mt-1 text-[62px] text-on-sun max-md:text-[52px]">{TOTAL_DOGS.toLocaleString('en-IN')}</p>
            <p className="mt-1 text-[12px] font-bold text-on-sun">1,037 owners</p>
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-3 text-[13px] font-bold">
              <span className="flex items-baseline gap-1.5"><span className="figure text-[28px] text-white">{100 - reactivePct}%</span> Calm</span>
              <span className="flex items-baseline gap-1.5">Aggressive <span className="figure text-[28px] text-white">{reactivePct}%</span></span>
            </div>
            <div className="mt-2 flex h-4 gap-1 overflow-hidden rounded-full" role="img" aria-label={`${100 - reactivePct}% calm, ${reactivePct}% aggressive`}>
              <motion.span className="origin-left rounded-full bg-calm" style={{ flexGrow: 100 - reactivePct, flexBasis: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={spring.page} />
              <motion.span className="origin-left rounded-full bg-reactive" style={{ flexGrow: reactivePct, flexBasis: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ ...spring.page, delay: 0.1 }} />
            </div>
            <p className="mt-2 text-[12px] font-semibold text-on-ink-2">
              <Lock size={11} strokeWidth={2.8} className="mr-1 inline-block align-[-1px]" aria-hidden />
              {612 + Object.keys(locks).length} tags locked by an admin, 41 dogs added this week.
            </p>
          </div>
          <div>
            <p className="label text-on-ink-2">Documents expiring in 30 days</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="figure text-[44px] text-sun-light">47</span>
              <span className="text-[12px] font-bold text-white">and 19 already expired</span>
            </p>
          </div>
          <div className="flex items-center justify-end max-md:justify-start">
            {(['bruno', 'sheru', 'goldenRose', 'husky', 'beagle'] as const).map((p, i) => (
              <img key={p} src={img(p, 160)} alt="" className="h-[58px] w-[58px] rounded-full object-cover ring-[3px] ring-[var(--ink)]" style={{ marginLeft: i ? -16 : 0 }} />
            ))}
          </div>
        </div>
      </section>

      {/* toolbar */}
      <section className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2.5 px-8 max-md:mt-5 max-md:px-4">
        <form className="well flex h-10 w-[280px] items-center gap-2 rounded-full pl-3.5 pr-1.5 focus-within:ring-2 focus-within:ring-[var(--accent)] max-md:h-12 max-md:w-full" onSubmit={(e) => e.preventDefault()}>
          <Search size={16} className="shrink-0 text-text-2" aria-hidden />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} aria-label="Search owners and dogs" placeholder="Owner, dog, breed or locality" className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold outline-none placeholder:font-medium placeholder:text-text-3" />
          {q && (
            <button type="button" onClick={() => { setQ(''); setPage(0) }} aria-label="Clear search and show everyone" className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-ink pl-2 pr-2.5 text-[11px] font-bold text-on-ink max-md:h-9">
              <X size={12} strokeWidth={3} aria-hidden /> Clear
            </button>
          )}
        </form>
        <div className="flex min-w-0 items-center gap-2 max-md:w-full max-md:overflow-x-auto">
          <Group label="City" value={city} onChange={reset(setCity)} items={[{ id: 'All', label: 'All cities' }, ...CITIES.map((c) => ({ id: c, label: c }))]} />
          <Group label="Temperament" value={temper} onChange={reset(setTemper)} items={[{ id: 'all', label: 'Any tag' }, { id: 'calm', label: 'Calm' }, { id: 'reactive', label: 'Aggressive' }]} />
        </div>
        <div className="flex min-w-0 items-center gap-2 max-md:w-full max-md:overflow-x-auto">
          <Group label="Vaccination status" value={vax} onChange={reset(setVax)} items={[{ id: 'all', label: 'Any status' }, { id: 'approved', label: 'Approved' }, { id: 'review', label: 'Under review' }, { id: 'expiring', label: 'Expiring' }, { id: 'expired', label: 'Expired' }]} />
        </div>
      </section>
      <p className="mt-2.5 px-8 text-[13px] font-semibold text-text-2 max-md:px-4">
        {needle ? (
          <>
            <span className="font-extrabold text-text">{filtered.length} {filtered.length === 1 ? 'dog' : 'dogs'}</span> match “{q.trim()}”. Clear the search to see all {OWNER_ROWS.length} on this page of the directory.
          </>
        ) : (
          <>
            <span className="font-extrabold text-text">{filtered.length} dogs</span> in this view{picked.length ? `, ${picked.length} selected` : ''}.
          </>
        )}
      </p>

      {/* desktop table */}
      <section className="mt-3 px-8 max-md:hidden">
        <div className="overflow-hidden rounded-[var(--r-card)] bg-[var(--surface)] shadow-[var(--shadow-raised)]">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: 48 }} />
              <col style={{ width: 196 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 186 }} />
              <col style={{ width: 142 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 86 }} />
              <col />
            </colgroup>
            <thead>
              <tr className="bg-[var(--surface-raised)]">
                <th className="pl-4">
                  <button type="button" role="checkbox" aria-checked={allOnPage} aria-label="Select all on this page" onClick={() => setPicked((p) => (allOnPage ? p.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...p, ...rows.map((r) => r.id)])]))} className="grid h-10 w-7 place-items-center">
                    <CheckMark on={allOnPage} />
                  </button>
                </th>
                <th className="font-normal"><SortHead k="owner" label="Owner" /></th>
                <th className="font-normal"><span className="label text-text-2">Locality</span></th>
                <th className="font-normal"><span className="label text-text-2">Dog</span></th>
                <th className="font-normal"><span className="label text-text-2">Temperament</span></th>
                <th className="font-normal"><span className="label text-text-2">Vaccination</span></th>
                <th className="font-normal"><SortHead k="walks" label="Walks" /></th>
                <th className="font-normal"><SortHead k="joined" label="Joined" /></th>
                <th className="font-normal"><SortHead k="lastWalk" label="Last walk" /></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sel = picked.includes(r.id)
                return (
                  <tr key={r.id} onClick={() => setOpenId(r.id)} className={`cursor-pointer border-t border-[var(--rule)] transition-colors duration-100 hover:bg-[var(--surface-tint)] ${sel ? 'bg-sun-soft' : ''}`}>
                    <td className="pl-4">
                      <button type="button" role="checkbox" aria-checked={sel} aria-label={`Select ${r.owner}, ${r.dog}`} onClick={(e) => { e.stopPropagation(); toggle(r.id) }} className="grid h-12 w-7 place-items-center">
                        <CheckMark on={sel} />
                      </button>
                    </td>
                    <td className="py-1.5 pr-3">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setOpenId(r.id) }} className="flex w-full items-center gap-2.5 text-left">
                        <Face r={r} />
                        <span className="min-w-0 truncate text-[14px] font-extrabold">{r.owner}</span>
                      </button>
                    </td>
                    <td className="pr-3">
                      <span className="block truncate text-[13px] font-semibold">{r.locality}</span>
                      <span className="block truncate text-[11px] font-semibold text-text-2">{r.city}</span>
                    </td>
                    <td className="pr-3">
                      <span className="flex items-center gap-2.5">
                        <img src={img(r.dogPhoto, 120)} alt="" className="h-9 w-9 shrink-0 rounded-[10px] object-cover" />
                        <span className="min-w-0 leading-tight">
                          <span className="block truncate text-[14px] font-extrabold">{r.dog}</span>
                          <span className="block truncate text-[12px] font-semibold text-text-2">{r.breed}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1.5">
                        <TemperBadge t={temperOf(r)} />
                        {lockedOf(r) && <Lock size={13} strokeWidth={2.6} className="shrink-0 text-accent-ink" aria-label="Locked by admin" />}
                      </span>
                    </td>
                    <td><VaxPill v={vaxOf(r)} /></td>
                    <td className="num text-[14px] font-bold">{r.walks}</td>
                    <td className="meta text-text-2">{fmtShort(r.joined)}</td>
                    <td className="meta truncate text-text">{r.lastWalk ? fmtShort(r.lastWalk) : 'No walks yet'}</td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr className="border-t border-[var(--rule)]">
                  <td colSpan={9} className="px-4 py-8 text-center text-[14px] font-semibold text-text-2">
                    No dogs match these filters.
                    <button type="button" onClick={() => { setQ(''); setCity('All'); setTemper('all'); setVax('all'); setPage(0) }} className="ml-2 h-11 font-bold text-accent-ink">
                      Show everyone
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* phone: stacked row cards */}
      <motion.ul key={`${at}-${filtered.length}`} variants={listParent} initial="hidden" animate="show" className="mt-3 flex flex-col px-4 md:hidden">
        {rows.map((r) => {
          const sel = picked.includes(r.id)
          return (
            <motion.li key={r.id} variants={listItem} className={`flex items-center gap-3 border-t border-[var(--rule)] py-3 ${sel ? 'bg-sun-soft' : ''}`}>
              <button type="button" role="checkbox" aria-checked={sel} aria-label={`Select ${r.owner}, ${r.dog}`} onClick={() => toggle(r.id)} className="grid h-11 w-8 shrink-0 place-items-center">
                <CheckMark on={sel} />
              </button>
              <button type="button" onClick={() => setOpenId(r.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <img src={img(r.dogPhoto, 160)} alt="" className="h-14 w-14 shrink-0 rounded-[14px] object-cover" />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[15px] font-extrabold">{r.dog} <span className="font-semibold text-text-2">· {r.breed}</span></span>
                  <span className="block truncate text-[12px] font-semibold text-text-2">{r.owner} · {r.locality}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <TemperBadge t={temperOf(r)} />
                    {lockedOf(r) && <Lock size={13} strokeWidth={2.6} className="shrink-0 text-accent-ink" aria-label="Locked" />}
                    <VaxPill v={vaxOf(r)} />
                  </span>
                </span>
                <ChevronRight size={17} className="shrink-0 text-text-2" aria-hidden />
              </button>
            </motion.li>
          )
        })}
        {rows.length === 0 && (
          <li className="py-6 text-center text-[14px] font-semibold text-text-2">
            No dogs match these filters.
            <button type="button" onClick={() => { setQ(''); setCity('All'); setTemper('all'); setVax('all'); setPage(0) }} className="mx-auto block h-11 font-bold text-accent-ink">
              Show everyone
            </button>
          </li>
        )}
      </motion.ul>

      {/* pagination */}
      <div className="mt-3 flex items-center justify-between gap-3 px-8 max-md:px-4">
        <p className="num text-[13px] font-semibold text-text-2">
          {filtered.length === 0 ? '0' : `${at * PER_PAGE + 1} to ${Math.min(filtered.length, (at + 1) * PER_PAGE)}`} of {filtered.length}
        </p>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous page" onClick={() => (at === 0 ? toast('You are on the first page', 'neutral') : setPage(at - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--surface-high)]">
            <ChevronLeft size={18} className={at === 0 ? 'text-text-3' : ''} />
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" aria-current={i === at ? 'page' : undefined} onClick={() => setPage(i)} className={`num h-10 min-w-10 rounded-full px-2 text-[13px] font-bold ${i === at ? 'bg-ink text-on-ink' : 'hover:bg-[var(--surface-high)]'}`}>
              {i + 1}
            </button>
          ))}
          <button type="button" aria-label="Next page" onClick={() => (at >= pages - 1 ? toast('That is the last page', 'neutral') : setPage(at + 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[var(--surface-high)]">
            <ChevronRight size={18} className={at >= pages - 1 ? 'text-text-3' : ''} />
          </button>
        </div>
      </div>

      {/* expiring rail: bleeds off the right edge */}
      <section className="mt-8 pb-10 max-md:pb-6">
        <div className="flex items-end justify-between gap-3 px-8 max-md:px-4">
          <div>
            <h2 className="grot text-[24px]">Running out soon</h2>
            <p className="mt-1 text-[13px] font-semibold text-text-2">{expiringRows.length} dogs on this page have a certificate ending within 30 days, or already past</p>
          </div>
          <Button size="sm" variant="outline" icon={FileCheck2} onClick={() => navigate('admin.vetting')}>
            Vetting queue
          </Button>
        </div>
        <div className="scroll-x mt-4 flex gap-3 px-8 pb-2 max-md:px-4" style={{ scrollPaddingLeft: 32 }}>
          {expiringRows.map((r) => {
            const v = vaxOf(r)
            return (
              <motion.button key={r.id} type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => setOpenId(r.id)} className="relative h-[190px] w-[210px] shrink-0 snap-start overflow-hidden rounded-[var(--r-card)] text-left text-white shadow-[var(--shadow-raised)]">
                <img src={img(r.dogPhoto, 480)} alt={`${r.dog}, ${r.breed}`} className="absolute inset-0 h-full w-full object-cover" />
                <span className="scrim-b pointer-events-none absolute inset-0" />
                <span className={`label absolute left-2.5 top-2.5 inline-flex h-6 items-center rounded-full px-2.5 ${v === 'expired' ? 'bg-danger text-on-danger' : 'bg-sun text-on-sun'}`}>{VAX_LABEL[v]}</span>
                <span className="absolute inset-x-3 bottom-3 leading-tight">
                  <span className="grot block truncate text-[22px]">{r.dog}</span>
                  <span className="block truncate text-[12px] font-semibold">{r.owner}</span>
                  <span className="meta mt-1 block truncate text-sun-light">{r.vaxNote}</span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </section>

      <Drawer open={!!open} onClose={() => setOpenId(null)} title="Owner profile" width={460}>
        {open && <OwnerPanel key={open.id} r={open} temperOf={temperOf} lockedOf={lockedOf} vaxOf={vaxOf} onClose={() => setOpenId(null)} />}
      </Drawer>
    </ConsoleShell>
  )
}

function OwnerPanel({ r, temperOf, lockedOf, vaxOf, onClose }: { r: OwnerRow; temperOf: (r: OwnerRow) => Temperament; lockedOf: (r: OwnerRow) => boolean; vaxOf: (r: OwnerRow) => VaxEff; onClose: () => void }) {
  const { navigate, toast } = useNav()
  const dogs = OWNER_ROWS.filter((x) => x.owner === r.owner)
  const [dogId, setDogId] = useState(r.id)
  const dog = dogs.find((d) => d.id === dogId) ?? r
  const [pick, setPick] = useState<Temperament>(temperOf(dog))
  const isAnanya = r.owner === OWNER.name
  const seed = Number(r.id.slice(2))
  const bookings = logsFor(seed, [WALKER_NAMES[seed % 8], WALKER_NAMES[(seed + 3) % 8]], dog.walks === 0 ? 0 : 4)
  const first = r.owner.split(' ')[0]

  const cast = DOGS.find((d) => d.name === dog.dog && isAnanya)
  const v = vaxOf(dog)
  const vaccines: { name: string; note: string; state: VaxEff }[] = cast
    ? cast.vaccines.map((x) => ({ name: x.name, note: `${x.file} · valid until ${x.expires}`, state: (x.state === 'review' ? v : x.state) as VaxEff }))
    : ['Rabies', 'DHPP', 'Bordetella'].map((name, i) => {
        const hit = dog.vaxNote.startsWith(name)
        return { name, note: hit ? dog.vaxNote : `Valid until ${['Mar', 'Jun', 'Aug'][(seed + i) % 3]} 2027`, state: hit ? v : v !== 'approved' && !['Rabies', 'DHPP', 'Bordetella'].some((n) => dog.vaxNote.startsWith(n)) && i === 0 ? v : 'approved' }
      })

  const message = () => {
    const thread = isAnanya ? 'support-owner' : (OWNER_THREADS.find((t) => t.name === r.owner)?.id ?? `new:${r.owner}`)
    session.viewThread(thread)
    onClose()
    navigate('admin.messages')
  }
  const vetting = () => {
    const withCase = dogs.find((d) => d.caseId)
    if (withCase?.caseId) session.viewCase(withCase.caseId)
    onClose()
    navigate('admin.vetting')
  }
  const pickDog = (d: OwnerRow) => {
    setDogId(d.id)
    setPick(temperOf(d))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* profile */}
      <div>
        <div className="flex items-center gap-3.5">
          <Face r={r} size={64} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="grot truncate text-[24px]"><span className="swoosh">{first}</span> {r.owner.split(' ').slice(1).join(' ')}</p>
            <p className="mt-1.5 flex items-center gap-1 truncate text-[13px] font-semibold text-text-2"><MapPin size={13} aria-hidden /> {r.locality}, {r.city}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold text-text-2"><Phone size={13} aria-hidden /> <span className="num">{maskPhone(r.phone)}</span> · joined {fmtShort(r.joined)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" icon={MessageSquareText} block onClick={message} className="!h-11">
            Message owner
          </Button>
          <Button size="sm" variant="outline" icon={FileCheck2} block onClick={vetting} className="!h-11">
            Open vetting
          </Button>
        </div>
      </div>

      {/* dogs */}
      <div>
        <p className="label text-text-2">{dogs.length === 1 ? 'Dog' : `${dogs.length} dogs`}</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {dogs.map((d) => {
            const on = d.id === dog.id
            return (
              <motion.button key={d.id} type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => pickDog(d)} aria-pressed={on} className={`relative h-[132px] overflow-hidden rounded-[var(--r-card)] text-left text-white ${on ? 'ring-[3px] ring-[var(--sun)]' : ''} ${dogs.length === 1 ? 'col-span-2' : ''}`}>
                <img src={img(d.dogPhoto, 520)} alt={`${d.dog}, ${d.breed}`} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 25%' }} />
                <span className="scrim-b pointer-events-none absolute inset-0" />
                <span className="absolute left-2 top-2 flex items-center gap-1">
                  <TemperBadge t={temperOf(d)} solid />
                  {lockedOf(d) && (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-accent-ink">
                      <Lock size={12} strokeWidth={2.8} aria-label="Locked" />
                    </span>
                  )}
                </span>
                <span className="absolute inset-x-3 bottom-2.5 leading-tight">
                  <span className="grot block truncate text-[20px]">{d.dog}</span>
                  <span className="block truncate text-[12px] font-semibold">{d.breed} · {d.walks} walks</span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* temperament lock */}
      <div className="rounded-[var(--r-card)] bg-[var(--surface-high)] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-extrabold">{dog.dog}’s temperament tag</p>
          <span className="flex items-center gap-1 text-[12px] font-bold text-text-2">
            {lockedOf(dog) ? <Lock size={13} strokeWidth={2.6} className="text-accent-ink" aria-hidden /> : <LockOpen size={13} aria-hidden />}
            {lockedOf(dog) ? 'Locked' : 'Owner declared'}
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-[1fr_1fr_auto] gap-1.5">
          {(['calm', 'reactive'] as const).map((t) => {
            const on = pick === t
            const tone = TEMPER_TONE[t]
            return (
              <motion.button key={t} type="button" role="radio" aria-checked={on} whileTap={tap} transition={spring.ui} onClick={() => setPick(t)} className="flex h-11 items-center justify-center gap-1 rounded-[var(--r-control)] text-[13px] font-extrabold" style={on ? { background: tone.fill, color: '#fff' } : { background: 'var(--surface)', color: tone.onSoft }}>
                {on && <Check size={14} strokeWidth={3} aria-hidden />}
                {TEMPERAMENT[t].short}
              </motion.button>
            )
          })}
          <Button variant="ink" icon={Lock} onClick={() => { session.lockTemperament(dog.dog, pick); toast(`${dog.dog} locked as ${TEMPERAMENT[pick].label}`, 'accent') }}>
            Lock
          </Button>
        </div>
      </div>

      {/* vaccinations */}
      <div>
        <p className="label text-text-2">{dog.dog}’s vaccination documents</p>
        <ul className="mt-1 flex flex-col">
          {vaccines.map((x) => (
            <li key={x.name} className="flex items-center gap-3 border-b border-[var(--rule)] py-2.5 last:border-b-0">
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-[14px] font-extrabold">{x.name}</span>
                <span className="meta block truncate text-text-2">{x.note}</span>
              </span>
              <VaxPill v={x.state} />
            </li>
          ))}
        </ul>
      </div>

      {/* bookings with OTP times */}
      <div>
        <p className="label text-text-2">Recent bookings and OTP times</p>
        {bookings.length === 0 ? (
          <p className="mt-2 text-[13px] font-semibold text-text-2">{dog.dog} has not been on a walk yet. First booking unlocks after approval.</p>
        ) : (
          <ul className="relative mt-2 flex flex-col gap-3 pl-5">
            <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-[2px] rounded-full bg-[var(--paper-300)]" />
            {bookings.map((b) => (
              <li key={b.id} className="relative leading-tight">
                <span aria-hidden className={`absolute -left-5 top-1 h-3 w-3 rounded-full ring-2 ring-[var(--surface)] ${b.status === 'completed' ? 'bg-accent' : 'bg-danger'}`} />
                <span className="flex items-center justify-between gap-2">
                  <span className="meta text-text">{b.id}</span>
                  <span className="text-[12px] font-semibold text-text-2">{b.date}</span>
                </span>
                <span className="mt-0.5 block truncate text-[13px] font-bold">{dog.dog} with {b.who}</span>
                {b.status === 'completed' ? (
                  <span className="num mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-text-2">
                    <KeyRound size={12} aria-hidden /> Check-In {b.checkIn} · Check-Out {b.checkOut}
                  </span>
                ) : (
                  <span className="mt-0.5 block text-[12px] font-bold text-danger-text">{b.status === 'refunded' ? 'Cancelled by walker, refunded in full' : 'Cancelled before Check-In, no OTP used'}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
