import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, BadgeCheck, CheckCheck, FileCheck2, KeyRound, Lock, MapPin, PanelRight, PenSquare, Phone, Radio, Search, SendHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Certified, Stars, StatusPill, TemperBadge } from '../../components/Brand'
import { Button, IconButton } from '../../components/Button'
import { ChatThread } from '../../components/Chat'
import { TextArea } from '../../components/Form'
import { Drawer, Modal } from '../../components/Sheet'
import { Segmented } from '../../components/Tabs'
import { OUTBOUND_REASONS, OWNER_ROWS, OWNER_THREADS, WALKER_THREADS, initials, logsFor, maskPhone, type AdminThread, type BookingLog, type OutboundReason, type StaticMsg } from '../../data/adminPeople'
import { DOGS, OWNER, WALKERS, WALKER_ACCOUNT, WALKER_ME } from '../../data/cast'
import { OWNER_CASE_ID, QUICK_ADMIN, WALK, WALKER_CASE_ID, stageAtLeast } from '../../data/core'
import { DEMO_ADMIN_OUTBOUND, DEMO_ADMIN_OUTBOUND_KYC, DEMO_ADMIN_OUTBOUND_WALK, DEMO_ADMIN_REPLY_OWNER, DEMO_ADMIN_REPLY_WALKER } from '../../data/demoFill'
import { img, type MediaKey } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { kycState, session, useSession, vetState, type SupportStatus } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* The Unified Admin Messaging Console. Three columns that fill the frame:
   the thread list (Dog Owners / Dog Walkers tabs, search, status chips),
   the conversation with status tagging, and the contextual side panel
   (profile, dogs or walker badges, booking and OTP logs). The threads of
   Ananya and Arjun are live: they are the support chats inside the two
   mobile apps. "New message" starts an outbound message to anyone. */

type LiveId = 'support-owner' | 'support-walker'
type Kind = 'owner' | 'walker'
type View = Omit<AdminThread, 'photo'> & { photo?: MediaKey; live?: LiveId }
type Recipient = { key: string; kind: Kind; name: string; photo?: MediaKey; sub: string; threadId?: string }

const STATUS_LABEL: Record<SupportStatus, string> = { open: 'Open', progress: 'In Progress', resolved: 'Resolved' }
const REASON_TEXT: Record<OutboundReason, string> = { vax: DEMO_ADMIN_OUTBOUND, kyc: DEMO_ADMIN_OUTBOUND_KYC, walk: DEMO_ADMIN_OUTBOUND_WALK }
const nowLabel = () => {
  const d = new Date()
  const h = d.getHours()
  return `${h % 12 === 0 ? 12 : h % 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

function Person({ photo, name, size = 40, ring = false }: { photo?: MediaKey; name: string; size?: number; ring?: boolean }) {
  if (photo) return <Avatar who={photo} size={size} ring={ring} />
  return (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full bg-accent-soft font-extrabold text-[var(--on-accent-soft)]" style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}>
      {initials(name)}
    </span>
  )
}

const RECIPIENTS: Recipient[] = [
  { key: 'support-owner', kind: 'owner', name: OWNER.name, photo: OWNER.photo, sub: `${OWNER.locality} · Bruno, Sheru`, threadId: 'support-owner' },
  ...OWNER_THREADS.map((t): Recipient => ({ key: t.id, kind: 'owner', name: t.name, photo: t.photo, sub: `${t.locality} · ${(t.dogs ?? []).map((d) => d.name).join(', ')}`, threadId: t.id })),
  ...OWNER_ROWS.filter((r, i, all) => r.owner !== OWNER.name && !OWNER_THREADS.some((t) => t.name === r.owner) && all.findIndex((x) => x.owner === r.owner) === i).map((r): Recipient => ({ key: `row-${r.id}`, kind: 'owner', name: r.owner, photo: r.photo, sub: `${r.locality}, ${r.city} · ${r.dog}` })),
  { key: 'support-walker', kind: 'walker', name: WALKER_ME.name, photo: WALKER_ME.photo, sub: `${WALKER_ME.locality} · ${WALKER_ME.walks.toLocaleString('en-IN')} walks`, threadId: 'support-walker' },
  ...WALKER_THREADS.map((t): Recipient => ({ key: t.id, kind: 'walker', name: t.name, photo: t.photo, sub: `${t.locality} · ${t.walker?.walks.toLocaleString('en-IN')} walks`, threadId: t.id })),
  ...WALKERS.filter((w) => w.id !== 'arjun' && !WALKER_THREADS.some((t) => t.name === w.name)).map((w): Recipient => ({ key: `w-${w.id}`, kind: 'walker', name: w.name, photo: w.photo, sub: `${w.locality} · ${w.walks} walks` })),
]

export default function AdminMessages() {
  const { navigate, toast } = useNav()
  const viewing = useSession((s) => s.viewingThread)
  const ownerMsgs = useSession((s) => s.threads['support-owner'])
  const walkerMsgs = useSession((s) => s.threads['support-walker'])
  const liveStatus = useSession((s) => s.supportStatus)
  const stage = useSession((s) => s.stage)
  const locks = useSession((s) => s.temperamentLocks)
  const sheruDoc = useSession((s) => vetState(OWNER_CASE_ID, s))
  const arjunKyc = useSession((s) => kycState(WALKER_CASE_ID, s))
  const arjunBadge = useSession((s) => s.badges[WALKER_CASE_ID] ?? true)

  const [extra, setExtra] = useState<Record<string, StaticMsg[]>>({})
  const [localStatus, setLocalStatus] = useState<Record<string, SupportStatus>>({})
  const [seen, setSeen] = useState<string[]>([])
  const [created, setCreated] = useState<View[]>([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<SupportStatus | 'all'>('all')
  const [phoneChat, setPhoneChat] = useState(false)
  const [ctxOpen, setCtxOpen] = useState(false)
  const preset = viewing.startsWith('new:') ? RECIPIENTS.find((r) => r.name === viewing.slice(4)) : undefined
  const [compose, setCompose] = useState(!!preset)

  /* the walk that runs through the demo, as a booking log line */
  const walkLog: BookingLog = {
    id: WALK.id,
    date: WALK.dateLabel,
    who: '',
    checkIn: stageAtLeast(stage, 'walking') ? '8:02 am' : '',
    checkOut: stageAtLeast(stage, 'ended') ? '8:47 am' : '',
    status: stageAtLeast(stage, 'ended') ? 'completed' : stage === 'walking' ? 'live' : 'upcoming',
  }
  const asStatic = (list: typeof ownerMsgs, user: 'owner' | 'walker'): StaticMsg[] => list.filter((x) => x.from !== 'system').map((x) => ({ id: x.id, from: x.from === user ? 'user' : 'admin', text: x.text || 'Shared a photo', at: x.at, ref: x.ref }))

  const liveOwner: View = {
    id: 'support-owner', live: 'support-owner', kind: 'owner', name: OWNER.name, photo: OWNER.photo, city: OWNER.city, locality: 'Sector 70', phone: OWNER.phone, joined: OWNER.since,
    status: liveStatus['support-owner'], unread: 0, time: ownerMsgs[ownerMsgs.length - 1]?.at ?? '', topic: 'Sheru · Bordetella', messages: asStatic(ownerMsgs, 'owner'), draft: DEMO_ADMIN_REPLY_OWNER, caseId: OWNER_CASE_ID,
    dogs: DOGS.map((d) => ({ name: d.name, breed: d.breed, photo: d.photo, temperament: locks[d.name] ?? d.temperament, locked: d.locked || !!locks[d.name] })),
    bookings: [
      { ...walkLog, who: 'Bruno with Arjun Mehta' },
      { id: 'VF-240766', date: 'Thu 12 Nov', who: 'Bruno with Arjun Mehta', checkIn: '7:32 am', checkOut: '8:18 am', status: 'completed' },
      { id: 'VF-240741', date: 'Tue 10 Nov', who: 'Bruno with Pooja Bhatia', checkIn: '6:16 pm', checkOut: '6:47 pm', status: 'completed' },
      { id: 'VF-240712', date: 'Sun 8 Nov', who: 'Sheru with Gurpreet Sandhu', checkIn: '7:01 am', checkOut: '8:02 am', status: 'completed' },
    ],
  }
  const liveWalker: View = {
    id: 'support-walker', live: 'support-walker', kind: 'walker', name: WALKER_ME.name, photo: WALKER_ME.photo, city: WALKER_ME.city, locality: 'Phase 7', phone: WALKER_ACCOUNT.phone, joined: WALKER_ACCOUNT.joined,
    status: liveStatus['support-walker'], unread: 1, time: walkerMsgs[walkerMsgs.length - 1]?.at ?? '', topic: 'Payout · KYC renewal', messages: asStatic(walkerMsgs, 'walker'), draft: DEMO_ADMIN_REPLY_WALKER, kycId: WALKER_CASE_ID,
    walker: { rating: WALKER_ME.rating, walks: WALKER_ME.walks, years: WALKER_ME.years, certified: arjunBadge, kyc: arjunKyc === 'approved' ? 'verified' : arjunKyc === 'rejected' ? 'rejected' : 'review', online: true },
    bookings: [
      { ...walkLog, who: 'Bruno · Ananya Sharma' },
      { id: 'VF-240771', date: 'Fri 13 Nov', who: 'Simba · Meera Sodhi', checkIn: '6:31 pm', checkOut: '7:17 pm', status: 'completed' },
      { id: 'VF-240766', date: 'Thu 12 Nov', who: 'Bruno · Ananya Sharma', checkIn: '7:32 am', checkOut: '8:18 am', status: 'completed' },
      { id: 'VF-240758', date: 'Wed 11 Nov', who: 'Momo · Simran Kaur', checkIn: '5:02 pm', checkOut: '5:34 pm', status: 'completed' },
    ],
  }

  const decorate = (t: View): View => {
    if (t.live) return { ...t, unread: seen.includes(t.id) ? 0 : t.unread }
    const more = extra[t.id] ?? []
    return { ...t, messages: [...t.messages, ...more], status: localStatus[t.id] ?? t.status, unread: seen.includes(t.id) ? 0 : t.unread, time: more.length ? more[more.length - 1].at : t.time }
  }
  const owners = [liveOwner, ...created.filter((t) => t.kind === 'owner'), ...OWNER_THREADS].map(decorate)
  const walkers = [liveWalker, ...created.filter((t) => t.kind === 'walker'), ...WALKER_THREADS].map(decorate)
  const all = [...owners, ...walkers]
  const current = all.find((t) => t.id === viewing) ?? owners[0]
  const [tab, setTab] = useState<Kind>(current.kind)
  const pool = tab === 'owner' ? owners : walkers
  const needle = q.trim().toLowerCase()
  const list = pool.filter((t) => filter === 'all' || t.status === filter).filter((t) => !needle || [t.name, t.topic, t.locality, t.city, t.messages[t.messages.length - 1]?.text ?? ''].some((x) => x.toLowerCase().includes(needle)))
  const unreadOf = (l: View[]) => l.reduce((a, t) => a + (t.id === current.id ? 0 : t.unread), 0)

  /* the open thread is read */
  useEffect(() => {
    setSeen((s) => (s.includes(current.id) ? s : [...s, current.id]))
  }, [current.id])

  const select = (id: string) => {
    session.viewThread(id)
    setPhoneChat(true)
  }
  const setStatus = (st: SupportStatus) => {
    if (current.live) session.setSupportStatus(current.live, st)
    else if (created.some((t) => t.id === current.id)) setCreated((c) => c.map((t) => (t.id === current.id ? { ...t, status: st } : t)))
    else setLocalStatus((l) => ({ ...l, [current.id]: st }))
    toast(`${current.name.split(' ')[0]}’s thread marked ${STATUS_LABEL[st]}`, st === 'resolved' ? 'accent' : 'neutral')
  }
  const append = (id: string, text: string) => {
    const msg: StaticMsg = { id: `x-${Date.now()}`, from: 'admin', text, at: nowLabel() }
    if (created.some((t) => t.id === id)) setCreated((c) => c.map((t) => (t.id === id ? { ...t, messages: [...t.messages, msg], time: msg.at } : t)))
    else setExtra((e) => ({ ...e, [id]: [...(e[id] ?? []), msg] }))
  }

  const sendOutbound = (r: Recipient, text: string, reason: OutboundReason) => {
    let id = r.threadId
    if (id === 'support-owner' || id === 'support-walker') session.send(id, 'admin', text)
    else if (id) append(id, text)
    else {
      id = `new-${r.key}`
      if (created.some((t) => t.id === id)) append(id, text)
      else {
        const row = OWNER_ROWS.filter((x) => x.owner === r.name)
        const w = WALKERS.find((x) => x.name === r.name)
        const fresh: View = {
          id, kind: r.kind, name: r.name, photo: r.photo, city: row[0]?.city ?? w?.city ?? 'Mohali', locality: row[0]?.locality ?? w?.locality ?? '', phone: row[0]?.phone ?? '+91 98140 00000', joined: w ? 'Nov 2024' : 'Aug 2026',
          status: 'open', unread: 0, time: nowLabel(), topic: OUTBOUND_REASONS.find((x) => x.id === reason)?.label ?? 'Outbound', draft: 'Thanks for the quick reply. I will update this thread as soon as it is checked.',
          messages: [{ id: `x-${Date.now()}`, from: 'admin', text, at: nowLabel() }],
          dogs: row.length ? row.map((d) => ({ name: d.dog, breed: d.breed, photo: d.dogPhoto, temperament: d.temperament, locked: d.locked })) : undefined,
          walker: w ? { rating: w.rating, walks: w.walks, years: w.years, certified: w.certified, kyc: 'verified', online: w.online } : undefined,
          bookings: logsFor(r.name.length, w ? ['Coco · Priya Malhotra', 'Max · Rajat Sethi'] : ['Karan Gill', 'Divya Rawat'], 3),
        }
        setCreated((c) => [fresh, ...c])
      }
    }
    setTab(r.kind)
    setFilter('all')
    setQ('')
    session.viewThread(id)
    setPhoneChat(true)
    setCompose(false)
    toast(`Outbound message sent to ${r.name}`, 'accent')
  }

  const context = <ContextPanel t={current} sheruDoc={sheruDoc} onVetting={() => { if (current.caseId) session.viewCase(current.caseId); navigate('admin.vetting') }} onKyc={() => { if (current.kycId) session.viewKyc(current.kycId); navigate('admin.walkers') }} onLive={() => navigate('admin.live')} />

  return (
    <ConsoleShell active="admin.messages" title="Messages" bleed>
      <div className="flex h-full min-h-0">
        {/* (a) thread list */}
        <section className={`flex w-[326px] shrink-0 flex-col bg-[var(--surface)] max-md:w-full ${phoneChat ? 'max-md:hidden' : ''}`} style={{ boxShadow: '1px 0 0 var(--rule)' }}>
          <div className="relative shrink-0 overflow-hidden bg-sun px-4 pb-3.5 pt-4 text-on-sun">
            <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 aspect-square w-40 rounded-full bg-[rgb(255_255_255/0.32)]" />
            <div className="relative flex items-center justify-between gap-2">
              <h1 className="grot text-[26px] leading-none">Messages</h1>
              <Button size="sm" variant="ink" icon={PenSquare} onClick={() => setCompose(true)}>
                New message
              </Button>
            </div>
            <p className="relative mt-1.5 text-[12px] font-bold">{unreadOf(all)} unread · one inbox for owners and walkers</p>
          </div>
          <div className="shrink-0 px-3 pt-3">
            <div role="tablist" aria-label="Inbox" className="well grid grid-cols-2 gap-1 rounded-full p-1">
              {(
                [
                  { id: 'owner', label: 'Dog Owners', n: unreadOf(owners) },
                  { id: 'walker', label: 'Dog Walkers', n: unreadOf(walkers) },
                ] as const
              ).map((it) => {
                const on = tab === it.id
                return (
                  <motion.button key={it.id} type="button" role="tab" aria-selected={on} whileTap={tap} transition={spring.ui} onClick={() => setTab(it.id)} className={`flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-extrabold ${on ? 'bg-ink text-on-ink' : 'text-text-2'}`}>
                    {it.label}
                    {it.n > 0 && <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-on-danger" aria-label={`${it.n} unread`}>{it.n}</span>}
                  </motion.button>
                )
              })}
            </div>
            <form className="well mt-2.5 flex h-10 items-center gap-2 rounded-full px-3.5 focus-within:ring-2 focus-within:ring-[var(--accent)] max-md:h-11" onSubmit={(e) => e.preventDefault()}>
              <Search size={15} className="shrink-0 text-text-2" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${tab === 'owner' ? 'owner' : 'walker'} threads`} placeholder={tab === 'owner' ? 'Search owners, dogs, topics' : 'Search walkers, topics'} className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-text-3" />
              {q && (
                <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="grid h-8 w-8 place-items-center rounded-full">
                  <X size={14} strokeWidth={2.6} />
                </button>
              )}
            </form>
            <div className="mt-2.5 flex gap-1 overflow-x-auto pb-2.5" role="tablist" aria-label="Status">
              {(['all', 'open', 'progress', 'resolved'] as const).map((f) => {
                const on = filter === f
                const n = f === 'all' ? pool.length : pool.filter((t) => t.status === f).length
                return (
                  <motion.button key={f} type="button" role="tab" aria-selected={on} whileTap={tap} onClick={() => setFilter(f)} className={`flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-[12px] font-bold max-md:h-9 max-md:px-3 ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface-high)] text-text-2'}`}>
                    {f === 'all' ? 'All' : STATUS_LABEL[f]} <span className="num text-[11px]">{n}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
          <motion.ul key={tab + filter} variants={listParent} initial="hidden" animate="show" className="scroll-y min-h-0 flex-1 px-2 pb-3">
            {list.map((t) => {
              const on = t.id === current.id
              const last = t.messages[t.messages.length - 1]
              const unread = on ? 0 : t.unread
              return (
                <motion.li key={t.id} variants={listItem}>
                  <button type="button" onClick={() => select(t.id)} aria-current={on ? 'true' : undefined} className={`flex w-full items-start gap-2.5 rounded-[var(--r-card)] p-2.5 text-left transition-colors duration-150 ${on ? 'bg-accent-soft' : 'hover:bg-[var(--surface-raised)]'}`}>
                    <span className="relative shrink-0">
                      <Person photo={t.photo} name={t.name} size={42} ring={on} />
                      {t.live && <span aria-label="Live thread" className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-calm ring-2 ring-[var(--surface)]" />}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`truncate text-[14px] ${unread ? 'font-extrabold' : 'font-bold'}`}>{t.name}</span>
                        <span className="meta shrink-0 text-text-2">{t.time.replace('Today ', '')}</span>
                      </span>
                      <span className={`mt-0.5 block truncate text-[12.5px] ${unread ? 'font-bold text-text' : 'font-medium text-text-2'}`}>
                        {last?.from === 'admin' && 'You: '}
                        {last?.text}
                      </span>
                      <span className="mt-1.5 flex items-center justify-between gap-2">
                        <StatusPill kind={t.status} />
                        {unread > 0 && <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-on-danger" aria-label={`${unread} unread`}>{unread}</span>}
                      </span>
                    </span>
                  </button>
                </motion.li>
              )
            })}
            {list.length === 0 && (
              <li className="px-3 py-6 text-center text-[13px] font-semibold text-text-2">
                No {filter === 'all' ? '' : STATUS_LABEL[filter].toLowerCase()} threads here.
                <button type="button" onClick={() => { setFilter('all'); setQ('') }} className="mx-auto block h-11 font-bold text-accent-ink">
                  Show all threads
                </button>
              </li>
            )}
          </motion.ul>
        </section>

        {/* (b) the conversation */}
        <section className={`flex min-w-0 flex-1 flex-col bg-[var(--bg)] ${phoneChat ? '' : 'max-md:hidden'}`}>
          <header className="flex shrink-0 items-center gap-3 bg-[var(--surface)] px-5 py-3 max-md:gap-2 max-md:px-2" style={{ boxShadow: '0 1px 0 var(--rule)' }}>
            <IconButton icon={ArrowLeft} label="Back to threads" className="md:hidden" onClick={() => setPhoneChat(false)} />
            <Person photo={current.photo} name={current.name} size={44} ring />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="flex items-center gap-2">
                <span className="truncate text-[16px] font-extrabold">{current.name}</span>
              </p>
              <p className="mt-0.5 truncate text-[12px] font-semibold text-text-2">
                {current.live ? (current.kind === 'owner' ? 'Help & Support chat in the Owner App' : 'Walker Support chat in the Walker App') : `${current.locality}, ${current.city}`} · {current.topic}
              </p>
            </div>
            {/* status tagging */}
            <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--surface-high)] p-1 max-md:hidden" role="radiogroup" aria-label="Thread status">
              {(['open', 'progress', 'resolved'] as const).map((st) => {
                const on = current.status === st
                return (
                  <motion.button key={st} type="button" role="radio" aria-checked={on} whileTap={tap} transition={spring.ui} onClick={() => setStatus(st)} className={`h-8 rounded-full px-3 text-[12px] font-bold ${on ? (st === 'open' ? 'bg-accent text-on-accent' : st === 'progress' ? 'bg-sun text-on-sun' : 'bg-calm text-white') : 'text-text-2'}`}>
                    {STATUS_LABEL[st]}
                  </motion.button>
                )
              })}
            </div>
            <IconButton icon={PanelRight} label="Profile and booking logs" className="md:hidden" onClick={() => setCtxOpen(true)} />
          </header>
          {/* status tagging on phone */}
          <div className="flex shrink-0 items-center gap-1.5 bg-[var(--surface)] px-3 pb-2.5 md:hidden" role="radiogroup" aria-label="Thread status">
            {(['open', 'progress', 'resolved'] as const).map((st) => {
              const on = current.status === st
              return (
                <button key={st} type="button" role="radio" aria-checked={on} onClick={() => setStatus(st)} className={`h-9 flex-1 rounded-full text-[12px] font-bold ${on ? (st === 'open' ? 'bg-accent text-on-accent' : st === 'progress' ? 'bg-sun text-on-sun' : 'bg-calm text-white') : 'bg-[var(--surface-high)] text-text-2'}`}>
                  {STATUS_LABEL[st]}
                </button>
              )
            })}
          </div>

          {current.live ? (
            <ChatThread key={current.id} thread={current.live} me="admin" dense dockSafe={false} quick={QUICK_ADMIN} draft={current.live === 'support-owner' ? DEMO_ADMIN_REPLY_OWNER : DEMO_ADMIN_REPLY_WALKER} className="min-h-0 flex-1" />
          ) : (
            <StaticChat key={current.id} t={current} onSend={(text) => append(current.id, text)} />
          )}
        </section>

        {/* (c) contextual side panel */}
        <aside className="scroll-y w-[296px] shrink-0 bg-[var(--surface)] max-md:hidden" style={{ boxShadow: '-1px 0 0 var(--rule)' }}>
          {context}
        </aside>
      </div>

      <Drawer open={ctxOpen} onClose={() => setCtxOpen(false)} title="Profile and logs">
        <div className="-mx-5">{context}</div>
      </Drawer>

      <Modal open={compose} onClose={() => setCompose(false)} title="New message" width={720}>
        <Compose initial={preset} onSend={sendOutbound} />
      </Modal>
    </ConsoleShell>
  )
}

/* A static thread: same bubbles as ChatThread, composer pre-filled, messages append locally. */
function StaticChat({ t, onSend }: { t: View; onSend: (text: string) => void }) {
  const { toast } = useNav()
  const [text, setText] = useState(t.draft)
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [t.messages.length])
  const send = (v: string) => {
    if (!v.trim()) return toast('Write a message first, or tap a quick reply', 'neutral')
    onSend(v.trim())
    setText('')
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scroller} className="scroll-y min-h-0 flex-1 px-5 py-4 max-md:px-4">
        <ul className="flex flex-col gap-2">
          {t.messages.map((m, i) => {
            const mine = m.from === 'admin'
            const tail = i === t.messages.length - 1 || t.messages[i + 1].from !== m.from
            return (
              <motion.li key={m.id} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring.ui} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  {m.ref && <span className="mb-1 rounded-full bg-sun-soft px-2.5 py-0.5 text-[11px] font-bold text-[var(--on-sun-soft)]">{m.ref}</span>}
                  <div className={`text-[15px] leading-snug ${mine ? 'bg-accent text-on-accent' : 'bg-accent-soft text-text'}`} style={{ borderRadius: 18, borderBottomRightRadius: mine && tail ? 6 : 18, borderBottomLeftRadius: !mine && tail ? 6 : 18 }}>
                    <p className="px-3.5 py-2">{m.text}</p>
                  </div>
                  {tail && (
                    <span className={`mt-1 flex items-center gap-1 text-[11px] font-semibold text-text-2 ${mine ? 'pr-1' : 'pl-1'}`}>
                      {m.at}
                      {mine && <CheckCheck size={14} strokeWidth={2.4} className="text-accent-ink" aria-label="Read" />}
                    </span>
                  )}
                </div>
              </motion.li>
            )
          })}
        </ul>
      </div>
      <div className="relative z-20 shrink-0 border-t border-[var(--rule)] bg-[var(--surface)]">
        <div className="scroll-x flex gap-2 px-4 pb-1 pt-2.5">
          {QUICK_ADMIN.map((quick) => (
            <motion.button key={quick} type="button" whileTap={tap} transition={spring.ui} onClick={() => send(quick)} className="h-9 shrink-0 snap-start whitespace-nowrap rounded-full bg-sun-soft px-3.5 text-[13px] font-bold text-[var(--on-sun-soft)]" style={{ boxShadow: 'inset 0 0 0 1.5px var(--sun)' }}>
              {quick}
            </motion.button>
          ))}
        </div>
        <form className="flex items-end gap-2 px-3 py-2.5" onSubmit={(e) => { e.preventDefault(); send(text) }}>
          <div className="well flex min-h-11 min-w-0 flex-1 items-center rounded-[22px] px-4 focus-within:ring-2 focus-within:ring-[var(--accent)]">
            <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" placeholder="Message" className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-text-3" />
          </div>
          <motion.button type="submit" whileTap={tap} transition={spring.ui} aria-label="Send" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-[var(--glow-accent)]">
            <SendHorizontal size={19} strokeWidth={2.3} aria-hidden />
          </motion.button>
        </form>
      </div>
    </div>
  )
}

/* The contextual side panel: profile, dogs or walker standing, booking and OTP logs. */
function ContextPanel({ t, sheruDoc, onVetting, onKyc, onLive }: { t: View; sheruDoc: string; onVetting: () => void; onKyc: () => void; onLive: () => void }) {
  const liveWalk = t.bookings.some((b) => b.status === 'live' || b.status === 'upcoming')
  return (
    <div>
      {/* profile on a colour band */}
      <div className="relative overflow-hidden bg-ink px-5 pb-4 pt-5 text-on-ink">
        <span aria-hidden className="sun -right-10 -top-14 w-24" />
        <div className="relative flex items-end gap-3">
          <span className="rounded-full ring-[3px] ring-white">
            <Person photo={t.photo} name={t.name} size={64} />
          </span>
          <div className="min-w-0 flex-1 pb-0.5 leading-tight">
            <p className="label text-sun-light">{t.kind === 'owner' ? 'Dog Owner' : 'Dog Walker'}</p>
            <p className="grot mt-1 truncate text-[21px] text-white">{t.name}</p>
          </div>
        </div>
        <dl className="relative mt-3.5 flex flex-col gap-1.5 text-[13px] font-semibold">
          <div className="flex items-center gap-2"><Phone size={13} className="shrink-0 text-on-ink-2" aria-hidden /><dd className="num">{maskPhone(t.phone)}</dd></div>
          <div className="flex items-center gap-2"><MapPin size={13} className="shrink-0 text-on-ink-2" aria-hidden /><dd className="truncate">{t.locality}, {t.city}</dd></div>
          <div className="flex items-center gap-2"><BadgeCheck size={13} className="shrink-0 text-on-ink-2" aria-hidden /><dd>Joined {t.joined}</dd></div>
        </dl>
      </div>

      <div className="px-5 py-4">
        {/* dogs (owners) */}
        {t.dogs && (
          <>
            <p className="label text-text-2">{t.dogs.length === 1 ? 'Dog' : 'Dogs'}</p>
            <ul className="mt-2 flex flex-col gap-2.5">
              {t.dogs.map((d) => (
                <li key={d.name} className="flex items-center gap-3">
                  <img src={img(d.photo, 160)} alt={`${d.name}, ${d.breed}`} className="h-[52px] w-[52px] shrink-0 rounded-[14px] object-cover" />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[14px] font-extrabold">{d.name}</span>
                    <span className="block truncate text-[12px] font-semibold text-text-2">{d.breed}</span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <TemperBadge t={d.temperament} />
                      {d.locked && <Lock size={12} strokeWidth={2.8} className="shrink-0 text-accent-ink" aria-label="Tag locked by admin" />}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {t.live && (
              <div className="mt-3 flex items-center justify-between gap-2 rounded-[var(--r-control)] bg-[var(--surface-high)] px-3 py-2">
                <span className="truncate text-[12px] font-bold">Sheru · Bordetella</span>
                <StatusPill kind={sheruDoc === 'approved' ? 'approved' : sheruDoc === 'rejected' ? 'rejected' : 'review'} />
              </div>
            )}
          </>
        )}

        {/* standing (walkers) */}
        {t.walker && (
          <>
            <p className="label text-text-2">Standing</p>
            <div className="mt-2 flex items-end gap-5">
              <span className="leading-none">
                <span className="figure block text-[34px]">{t.walker.walks.toLocaleString('en-IN')}</span>
                <span className="mt-1 block text-[11px] font-bold text-text-2">walks · {t.walker.years} yr</span>
              </span>
              <span className="pb-0.5"><Stars rating={t.walker.rating} size={15} /></span>
              <span className="ml-auto flex items-center gap-1.5 pb-1 text-[12px] font-bold">
                <span aria-hidden className={`h-2 w-2 rounded-full ${t.walker.online ? 'bg-calm' : 'bg-[var(--paper-400)]'}`} />
                {t.walker.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {t.walker.certified && <Certified />}
              <StatusPill kind={t.walker.kyc} label={t.walker.kyc === 'verified' ? 'KYC verified' : t.walker.kyc === 'review' ? 'KYC under review' : 'KYC rejected'} />
            </div>
          </>
        )}

        {/* links */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {t.kind === 'owner' ? (
            <Button size="sm" variant="outline" icon={FileCheck2} onClick={onVetting} className="max-md:!h-11">Open vetting</Button>
          ) : (
            <Button size="sm" variant="outline" icon={BadgeCheck} onClick={onKyc} className="max-md:!h-11">Open KYC</Button>
          )}
          {liveWalk && (
            <Button size="sm" variant="ink" icon={Radio} onClick={onLive} className="max-md:!h-11">Live walk</Button>
          )}
        </div>

        {/* booking / OTP logs */}
        <p className="label mt-5 text-text-2">Recent bookings and OTP logs</p>
        <ul className="relative mt-2.5 flex flex-col gap-3.5 pl-5">
          <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-[2px] rounded-full bg-[var(--paper-300)]" />
          {t.bookings.map((b) => (
            <li key={b.id + b.date} className="relative leading-tight">
              <span aria-hidden className={`absolute -left-5 top-1 h-3 w-3 rounded-full ring-2 ring-[var(--surface)] ${b.status === 'completed' ? 'bg-accent' : b.status === 'live' ? 'bg-calm' : b.status === 'upcoming' ? 'bg-sun' : 'bg-danger'}`} />
              <span className="flex items-center justify-between gap-2">
                <span className="meta text-text">{b.id}</span>
                {b.status === 'live' ? <StatusPill kind="live" /> : b.status === 'upcoming' ? <StatusPill kind="pending" label="Upcoming" /> : b.status === 'completed' ? <StatusPill kind="approved" label="Completed" /> : <StatusPill kind="rejected" label={b.status === 'refunded' ? 'Refunded' : 'Cancelled'} />}
              </span>
              <span className="mt-1 block truncate text-[13px] font-bold">{b.who}</span>
              <span className="block text-[12px] font-semibold text-text-2">{b.date}</span>
              <span className="num mt-1 flex items-center gap-1 text-[12px] font-semibold text-text-2">
                <KeyRound size={12} className="shrink-0" aria-hidden />
                {b.status === 'cancelled' || b.status === 'refunded' ? 'No OTP used' : `In ${b.checkIn || 'pending'} · Out ${b.checkOut || 'pending'}`}
              </span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onLive} className="mt-3 flex h-11 items-center gap-1 text-[13px] font-bold text-accent-ink">
          All OTP and GPS logs <ArrowUpRight size={14} strokeWidth={2.6} aria-hidden />
        </button>
      </div>
    </div>
  )
}

/* Outbound proactive message: pick anyone registered, pick a reason, send. */
function Compose({ initial, onSend }: { initial?: Recipient; onSend: (r: Recipient, text: string, reason: OutboundReason) => void }) {
  const { toast } = useNav()
  const start = initial ?? RECIPIENTS.find((r) => r.name === 'Neha Arora') ?? RECIPIENTS[0]
  const [to, setTo] = useState<Recipient>(start)
  const [kind, setKind] = useState<Kind>(start.kind)
  const [q, setQ] = useState('')
  const [reason, setReason] = useState<OutboundReason>(start.kind === 'owner' ? 'vax' : 'kyc')
  const [text, setText] = useState(REASON_TEXT[start.kind === 'owner' ? 'vax' : 'kyc'])
  const needle = q.trim().toLowerCase()
  const list = RECIPIENTS.filter((r) => r.kind === kind).filter((r) => !needle || `${r.name} ${r.sub}`.toLowerCase().includes(needle))
  const ordered = [...list.filter((r) => r.key === to.key), ...list.filter((r) => r.key !== to.key)]

  const pickReason = (id: OutboundReason) => {
    setReason(id)
    setText(REASON_TEXT[id])
  }
  const pickKind = (k: Kind) => {
    setKind(k)
    const firstOf = RECIPIENTS.find((r) => r.kind === k)
    if (firstOf && to.kind !== k) setTo(firstOf)
    if (k === 'walker' && reason === 'vax') pickReason('kyc')
    if (k === 'owner' && reason === 'kyc') pickReason('vax')
  }

  return (
    <div className="grid grid-cols-[272px_minmax(0,1fr)] gap-6 max-md:grid-cols-1 max-md:gap-4">
      <div className="min-w-0">
        <Segmented full size="sm" tone="ink" value={kind} onChange={pickKind} items={[{ id: 'owner', label: 'Owners' }, { id: 'walker', label: 'Walkers' }]} />
        <form className="well mt-2.5 flex h-10 items-center gap-2 rounded-full px-3.5 focus-within:ring-2 focus-within:ring-[var(--accent)] max-md:h-11" onSubmit={(e) => e.preventDefault()}>
          <Search size={15} className="shrink-0 text-text-2" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search recipients" placeholder="Search by name or locality" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-text-3" />
        </form>
        <ul className="scroll-y mt-2 max-h-[304px] max-md:max-h-[212px]" role="listbox" aria-label="Recipient">
          {ordered.map((r) => {
            const on = r.key === to.key
            return (
              <li key={r.key}>
                <button type="button" role="option" aria-selected={on} onClick={() => setTo(r)} className={`flex w-full items-center gap-2.5 rounded-[var(--r-control)] px-2 py-2 text-left ${on ? 'bg-accent-soft' : 'hover:bg-[var(--surface-raised)]'}`}>
                  <Person photo={r.photo} name={r.name} size={34} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[14px] font-bold">{r.name}</span>
                    <span className="block truncate text-[12px] font-medium text-text-2">{r.sub}</span>
                  </span>
                  {on && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-on-accent"><CheckCheck size={12} strokeWidth={3} aria-hidden /></span>}
                </button>
              </li>
            )
          })}
          {ordered.length === 0 && <li className="px-2 py-4 text-[13px] font-semibold text-text-2">No one matches “{q}”.</li>}
        </ul>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-3 rounded-[var(--r-card)] bg-sun-soft p-3">
          <Person photo={to.photo} name={to.name} size={44} ring />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="label block text-[var(--on-sun-soft)]">To</span>
            <span className="block truncate text-[16px] font-extrabold">{to.name}</span>
            <span className="block truncate text-[12px] font-semibold text-text-2">{to.sub}</span>
          </span>
        </div>
        <p className="label mt-4 text-text-2">Reason</p>
        <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Reason">
          {OUTBOUND_REASONS.map((r) => {
            const on = reason === r.id
            return (
              <motion.button key={r.id} type="button" role="radio" aria-checked={on} whileTap={tap} transition={spring.ui} onClick={() => pickReason(r.id)} className={`h-9 rounded-full px-3 text-[13px] font-bold ${on ? 'bg-ink text-on-ink' : 'bg-[var(--surface-high)] text-text'}`}>
                {r.label}
              </motion.button>
            )
          })}
        </div>
        <div className="mt-3">
          <TextArea label="Message" rows={5} value={text} onChange={(e) => setText(e.target.value)} hint={`Lands in ${to.name.split(' ')[0]}’s ${to.kind === 'owner' ? 'Help & Support' : 'Walker Support'} chat with a push notification.`} className="!text-[14px]" />
        </div>
        <Button icon={SendHorizontal} className="mt-4 self-end max-md:self-stretch" onClick={() => (text.trim() ? onSend(to, text.trim(), reason) : toast('Write a message first, or pick a reason', 'neutral'))}>
          Send to {to.name.split(' ')[0]}
        </Button>
      </div>
    </div>
  )
}
