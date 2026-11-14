import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronRight, ReceiptText, Search, Siren, X } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { StatusPill } from '../../components/Brand'
import { Rail } from '../../components/Media'
import { ADMIN, OWNER } from '../../data/cast'
import { DEMO_FAQ_SEARCH } from '../../data/demoFill'
import { useNav } from '../../lib/navigation'
import { useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { MobileScreen, SectionHead, TopBar } from '../mobileShell'

/* Help & Support centre. Searchable FAQ (pre-filled, already filtered),
   category chips, the Chat with Support card, the owner's tickets and the
   SOS explainer. Figures in the answers come from the admin's rate card. */

type Cat = 'Bookings' | 'Payments & refunds' | 'OTP & handover' | 'Safety' | 'Documents'
const CATS: Cat[] = ['Bookings', 'Payments & refunds', 'OTP & handover', 'Safety', 'Documents']

export default function OwnerHelp() {
  const { navigate, toast } = useNav()
  const status = useSession((s) => s.supportStatus['support-owner'])
  const pricing = useSession((s) => s.pricing)
  const [query, setQuery] = useState(DEMO_FAQ_SEARCH)
  const [cat, setCat] = useState<Cat | 'All'>('All')
  const [openId, setOpenId] = useState<string | null>('f1')

  const FAQS: { id: string; cat: Cat; q: string; a: string }[] = [
    { id: 'f1', cat: 'Payments & refunds', q: 'How do I get a refund if I cancel a walk?', a: 'Cancel from My bookings. More than 60 minutes before the slot you get a full refund. Inside 60 minutes the instant-booking fee is kept and the rest is refunded. Refunds go back to the same UPI ID, card or bank account within 3 to 5 working days.' },
    { id: 'f2', cat: 'Bookings', q: 'What if the walker does not arrive?', a: 'If your walker has not reached the gate 15 minutes after the slot, the booking is cancelled automatically and you get a full refund, with no cancellation charge. You can also rebook the nearest available walker in one tap from the arrival screen.' },
    { id: 'f3', cat: 'OTP & handover', q: 'The Check-In OTP is not working', a: 'The code on your arrival screen is valid for 10 minutes and refreshes on its own. Ask the walker to clear the keypad and enter the four digits again. If it still fails, tap Contact support on the same screen and we will verify the handover by phone.' },
    { id: 'f4', cat: 'Documents', q: 'Can I change my dog’s temperament tag?', a: 'You can switch between Calm / Friendly and Aggressive / Reactive from the pet profile until our team locks the tag. Once locked (after a vet note or a walker report) only support can change it, so the right walker is always matched.' },
    { id: 'f5', cat: 'Documents', q: 'Why was my vaccination certificate rejected?', a: 'The most common reasons are a cropped scan, a missing vet stamp or batch number, or an expired date. The admin’s remark is shown on the document in the vault. Upload a full-page photo and it goes back into the queue, usually decided in under 4 hours.' },
    { id: 'f6', cat: 'Payments & refunds', q: 'Where is my GST invoice?', a: `Every paid walk has a GST invoice at ${pricing.gstPct}%. It is emailed straight after payment and can be downloaded from the booking in My bookings. Add your GSTIN at checkout if you need it on the invoice. A refund generates a credit note automatically.` },
    { id: 'f7', cat: 'Bookings', q: 'How does the Walk Pass work?', a: `The Walk Pass is ${pricing.passWalks} walks with the same walker at ${pricing.passDiscountPct}% off. Walks are valid for 45 days, you pick the slot each time, and unused walks are refunded pro rata if you cancel the pass.` },
    { id: 'f8', cat: 'Safety', q: 'What happens when I press SOS?', a: 'SOS opens a line to the Vuffora safety desk, shares the walk’s live location and can alert your emergency contact. The walker sees that support has been called. Use it for an injury, a lost dog or anything that feels unsafe.' },
    { id: 'f9', cat: 'Payments & refunds', q: 'What is the aggressive-dog handling surcharge?', a: `Dogs tagged Aggressive / Reactive are walked only by Aggressive Breed Certified walkers, one dog at a time, with a muzzle and short-leash protocol. That adds ₹${pricing.reactiveSurcharge} per walk, shown on the rate card before you pay. It is refunded in full with any refund.` },
    { id: 'f10', cat: 'Safety', q: 'Can the walker see my phone number?', a: 'No. Chat happens inside the app and opens only when a booking is confirmed. Neither side sees the other’s number, and the chat closes when the Check-Out OTP ends the walk.' },
    { id: 'f11', cat: 'Bookings', q: 'How do I reschedule a walk?', a: 'Open the booking and choose Reschedule. Moving the slot is free up to 60 minutes before the walk, as long as your walker is available. Inside 60 minutes it counts as a cancellation and the refund rules apply.' },
    { id: 'f12', cat: 'Payments & refunds', q: 'How does tipping work?', a: 'You can add a tip on the review screen after the walk. The full tip goes to the walker with no commission, and a tip is never part of a refund calculation.' },
    { id: 'f13', cat: 'OTP & handover', q: 'What is the Check-Out OTP for?', a: 'It closes the session at drop-off. Read it to the walker only when your dog is back inside. Until it is entered the timer keeps running and the payout stays on hold.' },
  ]

  const q = query.trim().toLowerCase()
  const results = FAQS.filter((f) => (cat === 'All' || f.cat === cat) && (!q || `${f.q} ${f.a}`.toLowerCase().includes(q)))

  const TICKETS = [
    { id: 'SUP-3391', title: 'Sheru · Bordetella certificate', when: 'Updated Fri 9:11 am', kind: status, go: true },
    { id: 'SUP-3207', title: 'Refund for cancelled walk VF-240655', when: 'Closed 3 Nov · ₹329 refunded', kind: 'resolved' as const, go: false },
    { id: 'SUP-3068', title: 'Name change on GST invoice', when: 'Closed 21 Oct', kind: 'resolved' as const, go: false },
  ]

  return (
    <MobileScreen header={<TopBar title="Help & Support" />} bg="var(--bg)">
      {/* yellow hero */}
      <section className="relative overflow-hidden bg-sun px-5 pb-6 pt-5 text-on-sun">
        <span aria-hidden className="pointer-events-none absolute -right-[20%] -top-[18%] aspect-square w-[66%] rounded-full bg-[rgb(255_255_255/0.32)]" />
        <h1 className="grot relative max-w-[82%] text-[clamp(28px,8.6vw,34px)] leading-[1]">
          How can we help, <span className="swoosh swoosh-blue">{OWNER.first}</span>?
        </h1>
        <label className="relative mt-4 flex h-[52px] items-center gap-2.5 rounded-full bg-[var(--surface)] pl-4 pr-1.5 shadow-[var(--shadow-floating)] focus-within:ring-2 focus-within:ring-[var(--accent)]">
          <Search size={19} strokeWidth={2.4} className="shrink-0 text-text-2" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search help articles" placeholder="Search refunds, OTP, documents" className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-text outline-none placeholder:text-text-3" />
          {query && (
            <motion.button type="button" whileTap={tap} onClick={() => setQuery('')} aria-label="Clear search" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--surface-high)] text-text">
              <X size={17} strokeWidth={2.6} aria-hidden />
            </motion.button>
          )}
        </label>
      </section>

      {/* category chips */}
      <Rail className="mt-4 pb-1" gap={8}>
        {(['All', ...CATS] as const).map((c) => {
          const on = c === cat
          return (
            <motion.button key={c} type="button" whileTap={tap} transition={spring.ui} aria-pressed={on} onClick={() => setCat(c)} className={`h-11 shrink-0 snap-start whitespace-nowrap rounded-full px-4 text-[13px] font-bold ${on ? 'bg-ink text-on-ink' : 'bg-[var(--surface)] text-text'}`} style={on ? undefined : { boxShadow: 'inset 0 0 0 1.5px var(--rule-strong)' }}>
              {c}
            </motion.button>
          )
        })}
      </Rail>

      <p className="num mt-3 px-5 text-[12px] font-bold text-text-2" aria-live="polite">
        {results.length} {results.length === 1 ? 'article' : 'articles'}
        {q ? ` for “${query.trim()}”` : ''}
        {cat !== 'All' ? ` in ${cat}` : ''}
      </p>

      {/* accordion */}
      <ul className="mt-1 px-5">
        {results.map((f) => {
          const on = openId === f.id
          return (
            <li key={f.id} className="border-b border-[var(--rule)] last:border-b-0">
              <button type="button" aria-expanded={on} onClick={() => setOpenId(on ? null : f.id)} className="flex min-h-[56px] w-full items-center gap-3 py-2.5 text-left">
                <span className="min-w-0 flex-1 leading-snug">
                  <span className="block text-[15px] font-extrabold">{f.q}</span>
                  <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-accent-ink">{f.cat}</span>
                </span>
                <motion.span animate={{ rotate: on ? 180 : 0 }} transition={spring.ui} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface-high)] text-text'}`}>
                  <ChevronDown size={17} strokeWidth={2.6} aria-hidden />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.08 } }} transition={spring.ui} className="pb-4 pr-8 text-[14px] font-medium leading-relaxed text-text-2">
                    {f.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
      {results.length === 0 && (
        <div className="mx-5 mt-2 rounded-[var(--r-card)] bg-[var(--surface-high)] p-4">
          <p className="text-[15px] font-extrabold">Nothing matches that yet</p>
          <p className="mt-1 text-[13px] font-medium text-text-2">Try a shorter word, or ask {ADMIN.first} in chat below.</p>
          <button type="button" onClick={() => { setQuery(''); setCat('All') }} className="mt-1 flex h-11 items-center text-[13px] font-extrabold text-accent-ink">
            Show all articles
          </button>
        </div>
      )}

      {/* Chat with Support */}
      <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate('owner.support')} className="relative mt-6 block w-full overflow-hidden bg-accent px-5 py-6 text-left text-on-accent">
        <span aria-hidden className="sun -right-[12%] -bottom-[110%] w-[40%]" />
        <span aria-hidden className="dots-light" />
        <span className="relative flex items-center gap-4">
          <span className="relative shrink-0 rounded-full ring-4 ring-white">
            <Avatar who={ADMIN.photo} size={68} />
            <span aria-hidden className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-calm ring-[3px] ring-white" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="label block text-[var(--on-accent-2)]">{ADMIN.first} is online</span>
            <span className="grot mt-1 block text-[26px]">Chat with Support</span>
            <span className="mt-1 block text-[13px] font-semibold text-[var(--on-accent-2)]">Typically replies in 4 min</span>
          </span>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-accent-ink">
            <ArrowRight size={20} strokeWidth={2.6} aria-hidden />
          </span>
        </span>
      </motion.button>

      {/* tickets */}
      <SectionHead className="mt-5" title="Your support threads" />
      <ul className="mt-1 px-2">
        {TICKETS.map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => (t.go ? navigate('owner.support') : toast(`${t.id} is resolved and closed`, 'neutral'))} className="flex min-h-[60px] w-full items-center gap-3 rounded-[var(--r-card)] px-3 py-2.5 text-left">
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[15px] font-bold">{t.title}</span>
                <span className="num mt-0.5 block truncate text-[12px] font-semibold text-text-2"><span className="font-extrabold text-accent-ink">{t.id}</span> · {t.when}</span>
              </span>
              <StatusPill kind={t.kind} />
            </button>
          </li>
        ))}
      </ul>

      {/* emergency strip */}
      <section className="mt-4 flex items-start gap-3 bg-danger-soft px-5 py-4 text-[var(--on-danger-soft)]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-danger text-white">
          <Siren size={20} strokeWidth={2.4} aria-hidden />
        </span>
        <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">
          <span className="block text-[15px] font-extrabold">Emergency during a walk?</span>
          Use the red SOS button on the live walk screen. It calls the safety desk, shares the live location and alerts your emergency contact. For anything urgent, do not wait in chat.
        </p>
      </section>

      {/* check a booking */}
      <button type="button" onClick={() => navigate('owner.bookings')} className="mt-2 flex min-h-[64px] w-full items-center gap-3 px-5 py-3 text-left">
        <ReceiptText size={22} strokeWidth={2.2} className="shrink-0 text-accent-ink" aria-hidden />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[15px] font-extrabold">Check a booking</span>
          <span className="block truncate text-[12px] font-semibold text-text-2">Invoices, refunds and walk reports</span>
        </span>
        <ChevronRight size={18} strokeWidth={2.4} className="shrink-0 text-text-2" aria-hidden />
      </button>
    </MobileScreen>
  )
}
