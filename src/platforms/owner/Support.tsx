import { motion } from 'framer-motion'
import { BookOpenText, ChevronLeft, Clock3, FileCheck2 } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { StatusPill } from '../../components/Brand'
import { ChatThread } from '../../components/Chat'
import { ADMIN } from '../../data/cast'
import { DEMO_SUPPORT_OWNER } from '../../data/demoFill'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { SAFE_TOP } from '../mobileShell'

/* Chat with Support. The same thread Kavya answers from the admin
   inbox; the status pill follows what she sets there. */

const REPLIES = [
  'Yes, the moment it is approved Sheru can be booked with any Aggressive Breed Certified walker. Arjun and Gurpreet are both near you.',
  'I have moved the certificate to the top of today’s queue. You will get a push notification when it is decided.',
  'Done. Anything else I can help with, Ananya?',
]
const QUICK = ['How long does approval take?', 'Please call me back', 'I need a refund for a walk']

export default function OwnerSupport() {
  const { navigate, back, canGoBack } = useNav()
  const status = useSession((s) => s.supportStatus['support-owner'])

  return (
    <div data-screen-root className="relative flex h-full w-full flex-col bg-[var(--bg)]">
      <header className="relative z-20 shrink-0 overflow-hidden bg-[var(--surface)] shadow-[0_6px_18px_-14px_rgb(14_27_87/0.4)]" style={{ paddingTop: SAFE_TOP }}>
        <div className="flex h-[62px] items-center gap-1 pl-1 pr-4">
          {canGoBack ? (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="grid h-11 w-10 shrink-0 place-items-center rounded-full">
              <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
            </motion.button>
          ) : (
            <span className="w-3" />
          )}
          <Avatar who={ADMIN.photo} size={42} ring />
          <div className="ml-2.5 min-w-0 flex-1 leading-tight">
            <p className="flex items-center gap-2">
              <span className="truncate text-[16px] font-extrabold">Vuffora Support</span>
              <StatusPill kind={status} />
            </p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-text-2">{ADMIN.first} · SUP-3391 · Sheru · Bordetella</p>
          </div>
        </div>
        {/* context strip */}
        <div className="flex items-center gap-2 bg-[var(--surface-tint)] px-4 py-2">
          <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => navigate('owner.help')} className="flex h-11 items-center gap-1.5 rounded-full bg-[var(--surface)] px-3.5 text-[13px] font-bold text-accent-ink shadow-[var(--shadow-raised)]">
            <BookOpenText size={15} strokeWidth={2.4} aria-hidden /> Help articles
          </motion.button>
          <motion.button
            type="button"
            whileTap={tap}
            transition={spring.ui}
            onClick={() => {
              session.viewDog('sheru')
              navigate('owner.vault')
            }}
            className="flex h-11 items-center gap-1.5 rounded-full bg-[var(--surface)] px-3.5 text-[13px] font-bold text-accent-ink shadow-[var(--shadow-raised)]"
          >
            <FileCheck2 size={15} strokeWidth={2.4} aria-hidden /> View document
          </motion.button>
          <span className="num ml-auto flex shrink-0 items-center gap-1 text-[11px] font-bold text-text-2">
            <Clock3 size={12} strokeWidth={2.5} aria-hidden /> ~4 min
          </span>
        </div>
      </header>

      <ChatThread thread="support-owner" me="owner" draft={DEMO_SUPPORT_OWNER} attachLabel="Booking VF-240781 attached" sharePhoto="sheru" autoReply={{ from: 'admin', texts: REPLIES }} quick={QUICK} className="min-h-0 flex-1" />
    </div>
  )
}
