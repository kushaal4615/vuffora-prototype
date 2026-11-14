import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeIndianRupee, ChevronDown, FileCheck2, MessageCircle, Siren } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarStack } from '../../components/Avatar'
import { StatusPill } from '../../components/Brand'
import { Button } from '../../components/Button'
import { ChatThread } from '../../components/Chat'
import { HeroImage } from '../../components/Media'
import { BottomSheet } from '../../components/Sheet'
import { ADMIN } from '../../data/cast'
import { DEMO_SUPPORT_WALKER } from '../../data/demoFill'
import { PARTNER_FAQS } from '../../data/walkerData'
import { useNav } from '../../lib/navigation'
import { useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, SectionHead, safeTop } from '../mobileShell'

/* Partner Help and Admin chat. Blue hero, the live thread with the Super
   Admin lapping it (last two messages, status from the admin's inbox),
   the three topics the spec names as colour tiles, a photo band, and the
   partner FAQs as an accordion. The chat itself opens in a tall sheet. */

const ADMIN_REPLIES = [
  'Compliance is on it today, Arjun. You will get a notification the moment it is verified.',
  'Noted. I have added that to your case so you do not have to repeat it.',
  'Anything else, just message here. We are on till 11 pm.',
]

export default function WalkerSupport() {
  const { navigate } = useNav()
  const msgs = useSession((s) => s.threads['support-walker'])
  const status = useSession((s) => s.supportStatus['support-walker'])
  const [chat, setChat] = useState(false)
  const [open, setOpen] = useState<string | null>('pf1')
  const last = msgs.slice(-2)

  return (
    <MobileScreen
      tab="help"
      cap="var(--accent)"
      overlay={
        <BottomSheet open={chat} onClose={() => setChat(false)} title={`Chat with ${ADMIN.first}`} tall>
          <ChatThread thread="support-walker" me="walker" draft={DEMO_SUPPORT_WALKER} dockSafe={false} attachLabel="Payout PO-55102 attached" autoReply={{ from: 'admin', texts: ADMIN_REPLIES }} className="-mx-5 h-[calc(58vh_-_var(--chrome-space,0px))] max-h-[520px]" />
          <div aria-hidden style={{ height: 'calc(var(--chrome-space, 0px) * 1.6)' }} />
        </BottomSheet>
      }
    >
      <section className="relative overflow-hidden bg-accent px-5 pb-16 text-on-accent" style={{ paddingTop: safeTop(12) }}>
        <span aria-hidden className="sun -right-[20%] w-[40%]" style={{ top: safeTop(0) }} />
        <span aria-hidden className="dots-light" />
        <p className="label relative text-[var(--on-accent-2)]">Help</p>
        <h1 className="grot relative mt-1.5 text-[36px] leading-[0.96]">Partner <span className="swoosh">support</span></h1>
        <div className="relative mt-3 flex items-center gap-3">
          <AvatarStack people={['kavya', 'rahul']} size={30} />
          <p className="min-w-0 max-w-[24ch] text-[13px] font-semibold leading-snug text-[var(--on-accent-2)]">
            <span className="font-extrabold text-white">Replies in about 4 minutes.</span> 5 am to 11 pm, every day.
          </p>
        </div>
      </section>

      {/* the admin thread */}
      <section className="relative z-10 mx-4 -mt-11 rounded-[var(--r-container)] bg-[var(--surface)] p-4 shadow-[var(--shadow-floating)]">
        <div className="flex items-center gap-3">
          <Avatar who={ADMIN.photo} size={46} verified />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[16px] font-extrabold">Chat with Admin</p>
            <p className="truncate text-[12px] font-semibold text-text-2">{ADMIN.name} · {ADMIN.role}</p>
          </div>
          <StatusPill kind={status} />
        </div>
        <ul className="mt-3 flex flex-col gap-1.5">
          {last.map((m) => {
            const mine = m.from === 'walker'
            return (
              <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <span className={`max-w-[86%] rounded-[16px] px-3 py-2 text-[13px] font-semibold leading-snug ${mine ? 'rounded-br-[5px] bg-accent text-on-accent' : 'rounded-bl-[5px] bg-accent-soft text-text'}`}>
                  <span className="line-clamp-2">{m.text}</span>
                  <span className={`num mt-0.5 block text-[10px] font-bold ${mine ? 'text-[var(--on-accent-2)]' : 'text-text-2'}`}>{m.at}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <Button block icon={MessageCircle} trailing={ArrowRight} className="mt-3.5 w-full" onClick={() => setChat(true)}>
          Open chat
        </Button>
      </section>

      {/* the three topics */}
      <SectionHead className="mt-6" title="What is it about?" />
      <div className="mt-3 grid grid-cols-3 gap-2 px-4">
        <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => navigate('walker.kyc')} className="flex h-[112px] flex-col justify-between rounded-[var(--r-card)] bg-sun p-3 text-left text-on-sun">
          <FileCheck2 size={22} strokeWidth={2.3} aria-hidden />
          <span className="leading-tight">
            <span className="block text-[14px] font-extrabold">KYC queries</span>
            <span className="mt-0.5 block text-[11px] font-semibold">Documents, badge</span>
          </span>
        </motion.button>
        <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => navigate('walker.earnings')} className="flex h-[112px] flex-col justify-between rounded-[var(--r-card)] bg-ink p-3 text-left text-on-ink">
          <BadgeIndianRupee size={22} strokeWidth={2.3} className="text-sun-light" aria-hidden />
          <span className="leading-tight">
            <span className="block text-[14px] font-extrabold">Payout delays</span>
            <span className="mt-0.5 block text-[11px] font-semibold text-on-ink-2">Wallet, history</span>
          </span>
        </motion.button>
        <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={() => setChat(true)} className="flex h-[112px] flex-col justify-between rounded-[var(--r-card)] bg-danger-soft p-3 text-left text-[var(--on-danger-soft)]">
          <Siren size={22} strokeWidth={2.3} aria-hidden />
          <span className="leading-tight">
            <span className="block text-[14px] font-extrabold">On-walk incident</span>
            <span className="mt-0.5 block text-[11px] font-semibold">Priority chat</span>
          </span>
        </motion.button>
      </div>

      {/* photo band */}
      <HeroImage src="pawShake" alt="A hand shaking a dog's paw" scrim="full" className="mt-6 h-[150px]" position="50% 40%">
        <div className="flex h-full flex-col justify-center px-5 text-white">
          <p className="label text-sun-light">On a walk right now?</p>
          <p className="grot mt-1.5 max-w-[17ch] text-[24px] leading-[1.02]">An incident chat shares your live GPS with the admin.</p>
        </div>
      </HeroImage>

      {/* FAQs */}
      <SectionHead className="mt-6" title="Partner FAQs" eyebrow={`${PARTNER_FAQS.length} answers`} />
      <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-2 px-5">
        {PARTNER_FAQS.map((f) => {
          const on = open === f.id
          return (
            <motion.li key={f.id} variants={listItem} className="rule-b last:shadow-none">
              <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : f.id)} className="flex min-h-[56px] w-full items-center gap-3 py-2.5 text-left">
                <span className="min-w-0 flex-1">
                  <span className="label block text-[10px] text-accent-ink">{f.topic}</span>
                  <span className="mt-0.5 block text-[15px] font-extrabold leading-snug">{f.q}</span>
                </span>
                <motion.span animate={{ rotate: on ? 180 : 0 }} transition={spring.ui} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface-high)] text-text'}`}>
                  <ChevronDown size={17} strokeWidth={2.6} aria-hidden />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.08 } }} transition={spring.ui} className="pb-4 pr-10 text-[14px] leading-relaxed text-text-2">
                    {f.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.li>
          )
        })}
      </motion.ul>
      <p className="px-5 pb-2 pt-4 text-[12px] font-semibold text-text-2">Still stuck? Open the chat above. Your case history stays in one thread.</p>
    </MobileScreen>
  )
}
