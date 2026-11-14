import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, DoorOpen, EyeOff } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { TemperBadge } from '../../components/Brand'
import { ChatThread } from '../../components/Chat'
import { OWNER, dogById } from '../../data/cast'
import { QUICK_WALKER, WALK, stageAtLeast } from '../../data/core'
import { DEMO_MESSAGE_WALKER } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { SAFE_TOP } from '../mobileShell'

/* Walker to owner chat for the booking. Same thread the owner sees; phone
   numbers never appear. An ink strip pins the gate note and the dog's
   temperament above the conversation, and the Job pill jumps back to
   wherever the walk currently is. */

const REPLIES = [
  'Perfect, coming down with Bruno now. The OTP is on my screen.',
  'Thank you Arjun! He has had his breakfast, so no treats needed.',
  'Great, see you at Gate 2.',
]

export default function WalkerChat() {
  const { navigate, back, canGoBack, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const dogId = useSession((s) => s.dogId)
  const dog = dogById(dogId)
  const closed = stageAtLeast(stage, 'ended')
  const jobLabel = closed ? 'Closed' : stage === 'walking' ? 'Walk' : stageAtLeast(stage, 'accepted') ? 'Pickup' : 'Request'

  const openJob = () => {
    if (closed) return toast(`${dog.name}’s walk is closed. The chat stays open for 24 hours`, 'neutral')
    navigate(stage === 'walking' ? 'walker.walk' : stageAtLeast(stage, 'accepted') ? 'walker.pickup' : 'walker.request')
  }

  return (
    <div data-screen-root className="relative flex h-full flex-col bg-[var(--bg)]">
      <header className="relative z-20 shrink-0 bg-[var(--surface)]" style={{ paddingTop: SAFE_TOP }}>
        <div className="flex h-[60px] items-center gap-1.5 pl-1 pr-3">
          {canGoBack ? (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="grid h-11 w-9 shrink-0 place-items-center rounded-full">
              <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
            </motion.button>
          ) : (
            <span className="w-2" />
          )}
          <span className="relative shrink-0">
            <Avatar who={OWNER.photo} size={42} ring />
            <img src={img(dog.photo, 80)} alt="" className="absolute -bottom-1 -right-1.5 h-5 w-5 rounded-full object-cover ring-2 ring-white" />
          </span>
          <div className="min-w-0 flex-1 pl-1.5 leading-tight">
            <p className="truncate text-[17px] font-extrabold">
              <span className="swoosh">{OWNER.first}</span>
            </p>
            <p className="num mt-0.5 truncate text-[11px] font-semibold text-text-2">{dog.name} · {WALK.id} · numbers hidden</p>
          </div>
          <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={openJob} aria-label={`Open the job: ${jobLabel}`} className={`flex h-11 shrink-0 items-center gap-1 rounded-full pl-4 pr-3 text-[13px] font-extrabold ${closed ? 'bg-[var(--surface-high)] text-text' : 'bg-accent text-on-accent shadow-[var(--glow-accent)]'}`}>
            Job <ArrowUpRight size={16} strokeWidth={2.6} aria-hidden />
          </motion.button>
        </div>
        {/* pinned: gate note and temperament */}
        <div className="flex items-center gap-2.5 bg-ink px-4 py-2.5 text-on-ink">
          <DoorOpen size={17} strokeWidth={2.4} className="shrink-0 text-sun-light" aria-hidden />
          <p className="min-w-0 flex-1 truncate text-[12px] font-bold">
            {WALK.gate} <span className="font-semibold text-on-ink-2">· {WALK.slot}</span>
          </p>
          <TemperBadge t={dog.temperament} solid />
          <EyeOff size={15} strokeWidth={2.4} className="shrink-0 text-on-ink-2" aria-label="Phone numbers hidden" />
        </div>
      </header>

      <ChatThread thread="walk" me="walker" quick={QUICK_WALKER} draft={DEMO_MESSAGE_WALKER} autoReply={{ from: 'owner', texts: REPLIES }} sharePhoto="runGrass" className="min-h-0 flex-1" />
    </div>
  )
}
