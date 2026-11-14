import { motion } from 'framer-motion'
import { BookOpenText, CheckCheck, ChevronRight, Headset, Lock, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { StatusPill } from '../../components/Brand'
import { Rail } from '../../components/Media'
import { Segmented } from '../../components/Tabs'
import { ADMIN, WALKERS, walkerById } from '../../data/cast'
import { WALK } from '../../data/core'
import { useNav } from '../../lib/navigation'
import { useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, TopBar } from '../mobileShell'

/* Inbox. The live booking chat and the support thread on top (both read
   from the shared store), then chats that closed with their bookings. */

type Filter = 'all' | 'walkers' | 'support'

const PAST: { walker: string; booking: string; when: string; last: string; mine: boolean; dog: string }[] = [
  { walker: 'pooja', booking: 'VF-240741', when: 'Tue', last: 'Bruno was a sweetheart today. See you next week!', mine: false, dog: 'Bruno' },
  { walker: 'gurpreet', booking: 'VF-240712', when: 'Sun', last: 'Thank you for keeping Sheru on the short leash.', mine: true, dog: 'Sheru' },
  { walker: 'rohan', booking: 'VF-240655', when: '2 Nov', last: 'Sorry again about the cancellation. Refund is on its way.', mine: false, dog: 'Bruno' },
  { walker: 'sahil', booking: 'VF-240630', when: '31 Oct', last: 'Sent you three photos from the water break.', mine: false, dog: 'Bruno' },
  { walker: 'imran', booking: 'VF-240598', when: '27 Oct', last: 'Muzzle is in the blue bag by the shoe rack.', mine: true, dog: 'Sheru' },
  { walker: 'tenzin', booking: 'VF-240571', when: '24 Oct', last: 'We took the quiet lane behind the market, no scooters.', mine: false, dog: 'Sheru' },
  { walker: 'karan', booking: 'VF-240540', when: '19 Oct', last: 'Great, see you at Gate 2 at 6.', mine: true, dog: 'Bruno' },
  { walker: 'divya', booking: 'VF-240502', when: '12 Oct', last: 'Brushed him after the walk, hope that is okay!', mine: false, dog: 'Bruno' },
]

export default function OwnerChats() {
  const { navigate, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const walkerId = useSession((s) => s.walkerId)
  const walk = useSession((s) => s.threads.walk)
  const support = useSession((s) => s.threads['support-owner'])
  const status = useSession((s) => s.supportStatus['support-owner'])
  const [filter, setFilter] = useState<Filter>('all')

  const walker = walkerById(walkerId)
  const open = stage !== 'none'
  const lastWalk = walk[walk.length - 1]
  const lastSupport = support[support.length - 1]
  const unreadWalk = open && lastWalk.from !== 'owner' ? 1 : 0
  const unreadSupport = lastSupport.from === 'admin' && status !== 'resolved' ? 1 : 0
  const unread = unreadWalk + unreadSupport
  const favourites = WALKERS.filter((w) => w.id !== walker.id).slice(0, 7)
  const preview = (m: { text: string; photo?: string }) => m.text || (m.photo ? 'Photo' : '')

  return (
    <MobileScreen tab="chats" header={<TopBar back={false} large title="Chats" sub="Messages stay inside Vuffora. Numbers are never shared." />}>
      {/* blue band */}
      <section className="relative overflow-hidden bg-accent px-5 py-4 text-on-accent">
        <span aria-hidden className="sun -right-[10%] -top-[90%] w-[42%]" />
        <div className="relative flex items-end gap-3">
          <p className="figure num text-[54px]">{unread}</p>
          <div className="min-w-0 flex-1 pb-1 leading-tight">
            <p className="text-[16px] font-extrabold">unread {unread === 1 ? 'message' : 'messages'}</p>
            <p className="truncate text-[12px] font-semibold text-[var(--on-accent-2)]">{open ? `Booking ${WALK.id} chat is open` : 'No open booking chat right now'}</p>
          </div>
        </div>
      </section>

      {/* recent walkers rail */}
      <Rail className="mt-3 pb-1 pt-2" gap={14}>
        {favourites.map((w) => (
          <motion.button key={w.id} type="button" whileTap={{ scale: 0.94 }} transition={spring.ui} onClick={() => toast(`Chat with ${w.first} opens when you book a walk`, 'info')} className="flex w-[60px] shrink-0 snap-start flex-col items-center gap-1.5">
            <span className="relative">
              <Avatar who={w.photo} size={54} ring={w.online} />
              {w.online && <span aria-hidden className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-calm ring-2 ring-[var(--bg)]" />}
            </span>
            <span className="w-full truncate text-center text-[11px] font-bold">{w.first}</span>
          </motion.button>
        ))}
      </Rail>

      <div className="mt-3 px-4">
        <Segmented<Filter>
          full
          tone="ink"
          items={[
            { id: 'all', label: 'All', count: PAST.length + 2 },
            { id: 'walkers', label: 'Walkers', count: PAST.length + 1 },
            { id: 'support', label: 'Support', count: 1 },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <motion.ul key={filter} variants={listParent} initial="hidden" animate="show" className="mt-3 px-2">
        {/* the live booking chat */}
        {filter !== 'support' && (
          <motion.li variants={listItem}>
            <button type="button" onClick={() => (open ? navigate('owner.chat') : toast('Chat opens with your next booking', 'info'))} className={`flex w-full items-center gap-3 rounded-[var(--r-card)] px-3 py-3 text-left ${open ? 'bg-sun-soft' : ''}`}>
              <Avatar who={walker.photo} size={52} ring={open} verified />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[16px] font-extrabold">{walker.name}</span>
                  <span className={`num shrink-0 text-[12px] font-bold ${unreadWalk ? 'text-accent-ink' : 'text-text-2'}`}>{open ? lastWalk.at : ''}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5">
                  {open && lastWalk.from === 'owner' && <CheckCheck size={15} strokeWidth={2.4} className="shrink-0 text-accent-ink" aria-label="Read" />}
                  {!open && <Lock size={13} strokeWidth={2.5} className="shrink-0 text-text-2" aria-hidden />}
                  <span className={`min-w-0 flex-1 truncate text-[13px] ${unreadWalk ? 'font-bold text-text' : 'font-medium text-text-2'}`}>{open ? preview(lastWalk) : 'Opens with your next booking'}</span>
                  {unreadWalk > 0 && <span className="num grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-extrabold text-on-accent">1</span>}
                </span>
                <span className="mt-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--on-sun-soft)]">
                  <LockKeyhole size={11} strokeWidth={2.6} aria-hidden /> {open ? `Booking ${WALK.id} · open` : 'Booking chat'}
                </span>
              </span>
            </button>
          </motion.li>
        )}

        {/* support */}
        {filter !== 'walkers' && (
          <motion.li variants={listItem}>
            <button type="button" onClick={() => navigate('owner.support')} className="flex w-full items-center gap-3 rounded-[var(--r-card)] px-3 py-3 text-left">
              <span className="relative shrink-0">
                <Avatar who={ADMIN.photo} size={52} />
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-on-accent ring-2 ring-[var(--bg)]">
                  <Headset size={12} strokeWidth={2.6} aria-hidden />
                </span>
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[16px] font-extrabold">Vuffora Support · {ADMIN.first}</span>
                  <span className="num shrink-0 text-[12px] font-bold text-text-2">{lastSupport.at}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5">
                  {lastSupport.from === 'owner' && <CheckCheck size={15} strokeWidth={2.4} className="shrink-0 text-accent-ink" aria-label="Read" />}
                  <span className={`min-w-0 flex-1 truncate text-[13px] ${unreadSupport ? 'font-bold text-text' : 'font-medium text-text-2'}`}>{preview(lastSupport)}</span>
                  {unreadSupport > 0 && <span className="num grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-extrabold text-on-accent">1</span>}
                </span>
                <span className="mt-1.5 flex items-center gap-2">
                  <StatusPill kind={status} />
                  <span className="truncate text-[11px] font-bold text-text-2">SUP-3391 · Sheru · Bordetella</span>
                </span>
              </span>
            </button>
          </motion.li>
        )}

        {/* closed chats */}
        {filter !== 'support' && (
          <>
            <li className="label px-3 pb-1 pt-4 text-text-2">Closed with the booking</li>
            {PAST.map((p) => {
              const w = walkerById(p.walker)
              return (
                <motion.li key={p.booking} variants={listItem}>
                  <button type="button" onClick={() => toast(`This chat closed with booking ${p.booking}`, 'neutral')} className="flex w-full items-center gap-3 rounded-[var(--r-card)] px-3 py-2.5 text-left">
                    <Avatar who={w.photo} size={46} />
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[15px] font-bold">{w.name}</span>
                        <span className="num shrink-0 text-[12px] font-semibold text-text-2">{p.when}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5">
                        {p.mine && <CheckCheck size={15} strokeWidth={2.4} className="shrink-0 text-accent-ink" aria-label="Read" />}
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-text-2">{p.last}</span>
                      </span>
                      <span className="num mt-1 flex items-center gap-1 text-[11px] font-semibold text-text-2">
                        <Lock size={10} strokeWidth={2.6} aria-hidden /> {p.booking} · {p.dog}
                      </span>
                    </span>
                  </button>
                </motion.li>
              )
            })}
          </>
        )}
      </motion.ul>

      {/* help articles */}
      <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate('owner.help')} className="relative mx-4 mt-4 flex w-[calc(100%-2rem)] items-center gap-3 overflow-hidden rounded-[var(--r-card)] bg-ink p-4 text-left text-on-ink">
        <span aria-hidden className="sun -right-8 -top-12 w-28" />
        <BookOpenText size={24} strokeWidth={2.1} className="shrink-0 text-sun-light" aria-hidden />
        <span className="relative min-w-0 flex-1 leading-tight">
          <span className="block text-[15px] font-extrabold">Browse help articles</span>
          <span className="block truncate text-[12px] font-semibold text-on-ink-2">Refunds, OTP handover, documents, safety</span>
        </span>
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun text-on-sun">
          <ChevronRight size={18} strokeWidth={2.6} aria-hidden />
        </span>
      </motion.button>
    </MobileScreen>
  )
}
