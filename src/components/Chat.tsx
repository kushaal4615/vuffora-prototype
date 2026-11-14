import { AnimatePresence, motion } from 'framer-motion'
import { CheckCheck, ImagePlus, Paperclip, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Msg, Sender, ThreadId } from '../data/core'
import { img, type MediaKey } from '../data/media'
import { session, useSession } from '../lib/store'
import { useNav } from '../lib/navigation'
import { spring, tap } from '../motion/springs'
import { track } from '../lib/tracker'

/* One chat component for all five chat surfaces: the booking chat in the
   Owner and Walker apps, the two support chats, and the admin's inbox.
   Messages live in the session store, so what one side sends appears on
   the other side's screen.

   - The composer mounts with a draft already written (zero typing).
   - Quick replies send on one tap.
   - The image button shares a demo photo.
   - `autoReply` plays a typing indicator and then the other side's answer,
     so the thread feels live when only one app is being shown. */

export function ChatThread({
  thread,
  me,
  quick = [],
  draft = '',
  autoReply,
  sharePhoto = 'twoRun',
  attachLabel,
  className = '',
  dense = false,
  dockSafe = true,
}: {
  thread: ThreadId
  me: Sender
  quick?: string[]
  /** text the composer starts with */
  draft?: string
  /** replies the other party sends back, in order, one per message sent */
  autoReply?: { from: Sender; texts: string[] }
  sharePhoto?: MediaKey
  /** label for the attach button toast, e.g. "Booking VF-240781 attached" */
  attachLabel?: string
  className?: string
  /** tighter layout for the admin console column */
  dense?: boolean
  /** pad the composer for the phone's home indicator and viewer chrome */
  dockSafe?: boolean
}) {
  const msgs = useSession((s) => s.threads[thread])
  const { toast } = useNav()
  const [text, setText] = useState(draft)
  const [typing, setTyping] = useState(false)
  const replied = useRef(0)
  const scroller = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs.length, typing])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const answer = () => {
    if (!autoReply) return
    const next = autoReply.texts[replied.current % autoReply.texts.length]
    replied.current += 1
    timers.current.push(
      window.setTimeout(() => setTyping(true), 500),
      window.setTimeout(() => {
        setTyping(false)
        session.send(thread, autoReply.from, next)
      }, 1900),
    )
  }

  const send = (value: string, photo?: MediaKey) => {
    const v = value.trim()
    if (!v && !photo) return toast('Write a message first, or tap a quick reply', 'neutral')
    session.send(thread, me, v, photo)
    track('chat_send', thread)
    setText('')
    answer()
  }

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div ref={scroller} className={`scroll-y min-h-0 flex-1 ${dense ? 'px-5 py-4' : 'px-4 py-3'}`} style={{ overscrollBehavior: 'contain' }}>
        <ul className="flex flex-col gap-2">
          {msgs.map((m, i) => (
            <Bubble key={m.id} m={m} mine={m.from === me} showTail={i === msgs.length - 1 || msgs[i + 1].from !== m.from} />
          ))}
          <AnimatePresence>
            {typing && (
              <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="flex">
                <span className="flex h-9 items-center gap-1 rounded-[18px] rounded-bl-[6px] bg-accent-soft px-3.5" aria-label="Typing">
                  {[0, 1, 2].map((d) => (
                    <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-[var(--on-accent-soft)]" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.12 }} />
                  ))}
                </span>
              </motion.li>
            )}
          </AnimatePresence>
        </ul>
      </div>

      <div data-dock className="relative z-20 shrink-0 border-t border-[var(--rule)] bg-[var(--surface)]" style={dockSafe ? { paddingBottom: 'calc(var(--safe-bottom, 34px) - 10px + var(--chrome-space, 0px))' } : undefined}>
        {quick.length > 0 && (
          <div className="scroll-x flex gap-2 px-4 pb-1 pt-2.5">
            {quick.map((q) => (
              <motion.button key={q} type="button" whileTap={tap} transition={spring.ui} onClick={() => send(q)} className="h-9 shrink-0 snap-start whitespace-nowrap rounded-full bg-sun-soft px-3.5 text-[13px] font-bold text-[var(--on-sun-soft)]" style={{ boxShadow: 'inset 0 0 0 1.5px var(--sun)' }}>
                {q}
              </motion.button>
            ))}
          </div>
        )}
        <form
          className="flex items-end gap-2 px-3 py-2.5"
          onSubmit={(e) => {
            e.preventDefault()
            send(text)
          }}
        >
          <motion.button type="button" whileTap={tap} aria-label="Share a photo" onClick={() => send('', sharePhoto)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--surface-high)] text-text">
            <ImagePlus size={20} strokeWidth={2.1} aria-hidden />
          </motion.button>
          {attachLabel && (
            <motion.button type="button" whileTap={tap} aria-label="Attach booking reference" onClick={() => toast(attachLabel, 'accent')} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--surface-high)] text-text">
              <Paperclip size={19} strokeWidth={2.1} aria-hidden />
            </motion.button>
          )}
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

function Bubble({ m, mine, showTail }: { m: Msg; mine: boolean; showTail: boolean }) {
  if (m.from === 'system')
    return (
      <li className="my-1 flex justify-center">
        <span className="max-w-[88%] rounded-full bg-[var(--surface-high)] px-3.5 py-1.5 text-center text-[11px] font-semibold leading-snug text-text-2">{m.text}</span>
      </li>
    )
  return (
    <motion.li initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring.ui} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`${m.photo ? 'w-[240px]' : ''} max-w-[80%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
        {m.ref && <span className="mb-1 rounded-full bg-sun-soft px-2.5 py-0.5 text-[11px] font-bold text-[var(--on-sun-soft)]">{m.ref}</span>}
        <div
          className={`overflow-hidden text-[15px] leading-snug ${mine ? 'bg-accent text-on-accent' : 'bg-accent-soft text-text'}`}
          style={{ borderRadius: 18, borderBottomRightRadius: mine && showTail ? 6 : 18, borderBottomLeftRadius: !mine && showTail ? 6 : 18 }}
        >
          {m.photo && <img src={img(m.photo, 560)} alt="Shared photo" className="block aspect-[4/3] w-full min-w-[200px] object-cover" />}
          {m.text && <p className="px-3.5 py-2">{m.text}</p>}
        </div>
        {showTail && (
          <span className={`mt-1 flex items-center gap-1 text-[11px] font-semibold text-text-2 ${mine ? 'pr-1' : 'pl-1'}`}>
            {m.at}
            {mine && <CheckCheck size={14} strokeWidth={2.4} className="text-accent-ink" aria-label="Read" />}
          </span>
        )}
      </div>
    </motion.li>
  )
}
