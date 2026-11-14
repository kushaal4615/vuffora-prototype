import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock3, MapPinned, Radio } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { TemperBadge } from '../../components/Brand'
import { ChatThread } from '../../components/Chat'
import { dogById, walkerById } from '../../data/cast'
import { QUICK_OWNER, WALK, stageAtLeast } from '../../data/core'
import { DEMO_MESSAGE_OWNER } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { SAFE_TOP } from '../mobileShell'

/* Owner to walker booking chat. The thread is shared with the Walker
   App, so a message sent here shows up on Arjun's phone. */

const REPLIES = [
  'Got it, thank you! I will ask the guard for Tower B.',
  'Sure. I will send a photo from the park at the water break.',
  'No problem at all. See you at the gate.',
  'Noted. I will ring the bell once and wait in the lobby.',
]

export default function OwnerChat() {
  const { navigate, back, canGoBack } = useNav()
  const stage = useSession((s) => s.stage)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const walker = walkerById('arjun')
  const dog = dogById(dogId)
  const live = stageAtLeast(stage, 'walking')

  return (
    <div data-screen-root className="relative flex h-full w-full flex-col bg-[var(--bg)]">
      <header className="relative z-20 shrink-0 bg-[var(--surface)] shadow-[0_6px_18px_-14px_rgb(14_27_87/0.4)]" style={{ paddingTop: SAFE_TOP }}>
        <div className="flex h-[60px] items-center gap-1 pl-1 pr-3">
          {canGoBack ? (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="grid h-11 w-10 shrink-0 place-items-center rounded-full">
              <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
            </motion.button>
          ) : (
            <span className="w-3" />
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            transition={spring.ui}
            onClick={() => {
              session.viewWalker('arjun')
              navigate('owner.walker')
            }}
            aria-label={`View ${walker.name}'s profile`}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-full py-1 pl-1.5 pr-2 text-left"
          >
            <Avatar who={walker.photo} size={42} ring verified />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="flex items-center gap-1 text-[16px] font-extrabold">
                <span className="truncate">{walker.name}</span>
                <ChevronRight size={15} strokeWidth={2.6} className="shrink-0 text-text-2" aria-hidden />
              </span>
              <span className="flex items-center gap-1 truncate text-[11px] font-semibold text-text-2">
                <span className="truncate">{WALK.id} · numbers stay private</span>
              </span>
            </span>
          </motion.button>
          <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => navigate(live ? 'owner.live' : 'owner.arrival')} className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 text-[13px] font-extrabold text-on-accent">
            {live ? <Radio size={15} strokeWidth={2.5} aria-hidden /> : <MapPinned size={15} strokeWidth={2.5} aria-hidden />} Track
          </motion.button>
        </div>
        {/* pinned booking strip */}
        <div className="flex items-center gap-2.5 bg-sun px-4 py-2 text-on-sun">
          <img src={img(dog.photo, 120)} alt={dog.name} className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white" style={{ objectPosition: '50% 20%' }} />
          <p className="min-w-0 flex-1 truncate text-[13px] font-extrabold">
            {dog.name} · {duration} min
          </p>
          <span className="num flex shrink-0 items-center gap-1 text-[12px] font-bold">
            <Clock3 size={12} strokeWidth={2.6} aria-hidden /> Today {WALK.slot}
          </span>
          <TemperBadge t={dog.temperament} solid />
        </div>
      </header>

      <ChatThread thread="walk" me="owner" quick={QUICK_OWNER} draft={DEMO_MESSAGE_OWNER} autoReply={{ from: 'walker', texts: REPLIES }} className="min-h-0 flex-1" />
    </div>
  )
}
