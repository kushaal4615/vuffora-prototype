import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ChevronLeft, Headset, KeyRound, Star, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Price, Stars } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Confetti } from '../../components/Confetti'
import { TextArea } from '../../components/Form'
import { MapCanvas } from '../../components/Map'
import { Rail } from '../../components/Media'
import { dogById, walkerById } from '../../data/cast'
import { inr } from '../../data/clock'
import { HOME_PIN, ROUTE, WALK } from '../../data/core'
import { DEMO_REVIEW } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { currentQuote, getSession, session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { Dock, MobileScreen, safeTop } from '../mobileShell'

/* Rate the walk. The route as walked, the numbers, both OTP stamps and
   the photos; then stars, tags, a written review and a tip. Submitting
   releases the walker's payout. */

const TAGS = ['On time', 'Great updates', 'Handles big dogs', 'Gentle', 'Clear route', 'Followed my notes', 'Would book again']
const TIPS = [0, 30, 50, 100]
const WORDS = ['', 'Poor', 'Below par', 'Okay', 'Good', 'Excellent']
const EXTRA_PHOTOS = ['harnessGrass', 'parkPath'] as const

export default function OwnerReview() {
  const { navigate, reset, back, canGoBack, toast } = useNav()
  const walkerId = useSession((s) => s.walkerId)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const logs = useSession((s) => s.logs)
  const net = useSession((s) => currentQuote(s).walkerNet)
  const total = useSession((s) => currentQuote(s).total)
  const walker = walkerById(walkerId)
  const dog = dogById(dogId)

  const [done, setDone] = useState(() => getSession().stage === 'reviewed')
  const [rating, setRating] = useState(() => getSession().rating || DEMO_REVIEW.rating)
  const [tags, setTags] = useState<string[]>(DEMO_REVIEW.tags)
  const [text, setText] = useState(DEMO_REVIEW.text)
  const [tip, setTip] = useState(DEMO_REVIEW.tip)

  useEffect(() => {
    session.advance('ended')
  }, [])

  const photos = [...logs.filter((l) => l.photo).map((l) => ({ key: l.photo!, cap: l.at })), ...EXTRA_PHOTOS.map((k, i) => ({ key: k, cap: i === 0 ? '8:31 am' : '8:40 am' }))]
  const toggle = (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  const submit = () => {
    session.review(rating)
    setDone(true)
  }
  const newCount = walker.reviews + 1
  const newRating = (walker.rating * walker.reviews + rating) / newCount

  if (done)
    return (
      <MobileScreen cap="var(--sun)" bg="var(--bg)">
        <Confetti origin={0.22} />
        <section className="relative overflow-hidden bg-sun px-5 pb-10 text-on-sun" style={{ paddingTop: safeTop(26) }}>
          <span aria-hidden className="pointer-events-none absolute -right-[24%] -top-[30%] aspect-square w-[70%] rounded-full bg-[rgb(255_255_255/0.32)]" />
          <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.pop} className="relative grid h-[72px] w-[72px] place-items-center rounded-full bg-accent text-on-accent shadow-[var(--glow-accent)]">
            <Wallet size={32} strokeWidth={2.2} aria-hidden />
          </motion.span>
          <p className="label relative mt-5">Thank you, Ananya</p>
          <h1 className="grot relative mt-1.5 text-[clamp(28px,8.6vw,34px)] leading-[1.02]">
            <span className="mb-1 block"><Price amount={net + tip} size={56} /></span>
            released to <span className="swoosh swoosh-blue">{walker.first}’s</span> wallet
          </h1>
          <p className="num relative mt-3 text-[13px] font-bold">
            {inr(net)} walk payout{tip > 0 ? ` + ${inr(tip)} tip` : ''} · from the {inr(total)} you paid
          </p>
        </section>

        {/* rating updating */}
        <div className="relative z-10 mx-4 -mt-5 flex items-center gap-3.5 rounded-[var(--r-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-floating)]">
          <Avatar who={walker.photo} size={56} ring verified />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[16px] font-extrabold">{walker.name}</p>
            <p className="mt-1 flex items-center gap-2 text-[13px] font-semibold text-text-2">
              <Stars rating={newRating} size={14} />
              <span className="num">{newCount} reviews</span>
            </p>
          </div>
          <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring.pop, delay: 0.5 }} className="num shrink-0 rounded-full bg-success-soft px-3 py-1.5 text-[12px] font-extrabold text-[var(--on-success-soft)]">
            +1 review
          </motion.span>
        </div>

        <div className="mt-5 px-5">
          <p className="label text-text-2">Your review</p>
          <p className="mt-2 flex items-center gap-1" role="img" aria-label={`${rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={22} strokeWidth={0} fill={i <= rating ? 'var(--sun)' : 'var(--paper-300)'} aria-hidden />
            ))}
            <span className="ml-2 text-[14px] font-extrabold">{WORDS[rating]}</span>
          </p>
          {text.trim() && <p className="mt-2 text-[15px] font-medium leading-relaxed">“{text.trim()}”</p>}
          <p className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-accent-soft px-3 py-1.5 text-[12px] font-bold text-[var(--on-accent-soft)]">
                {t}
              </span>
            ))}
          </p>
        </div>

        <div className="relative mt-6 overflow-hidden bg-ink px-5 py-5 text-on-ink">
          <span aria-hidden className="sun -right-8 -top-12 w-28" />
          <div className="relative flex items-center gap-3.5">
            <img src={img(dog.photo, 200)} alt={dog.name} className="h-14 w-14 shrink-0 rounded-full object-cover ring-[3px] ring-white" style={{ objectPosition: '50% 20%' }} />
            <p className="min-w-0 max-w-[62%] flex-1 text-[15px] font-extrabold leading-snug">
              {dog.name} walked {WALK.plannedKm} km today. Same time tomorrow?
            </p>
          </div>
        </div>

        <div className="mt-5 px-4">
          <Button size="lg" className="w-full" trailing={ArrowRight} onClick={() => reset('owner.home')}>
            Back to home
          </Button>
          <Button size="lg" className="mt-2.5 w-full" variant="paper" onClick={() => reset('owner.bookings')}>
            My bookings
          </Button>
          <button type="button" onClick={() => navigate('owner.support')} className="mx-auto flex h-11 items-center gap-1.5 text-[13px] font-bold text-accent-ink">
            <Headset size={15} strokeWidth={2.4} aria-hidden /> Something went wrong on this walk?
          </button>
        </div>
      </MobileScreen>
    )

  return (
    <MobileScreen
      cap="var(--bg)"
      dockHeight={92}
      dock={
        <Dock>
          <span className="min-w-0 pl-3 leading-tight">
            <span className="block whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.08em] text-text-2">{tip > 0 ? 'Tip added' : 'No tip'}</span>
            <Price amount={tip} size={26} />
          </span>
          <Button size="lg" block trailing={ArrowRight} onClick={() => (rating < 1 ? toast('Tap a star to rate the walk', 'warn') : submit())}>
            Submit review
          </Button>
        </Dock>
      }
    >
      {/* hero: the route as walked */}
      <MapCanvas className="h-[236px] w-full" route={ROUTE} progress={1} home={HOME_PIN} labels={false}>
        <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 px-4" style={{ paddingTop: safeTop(6) }}>
          {canGoBack && (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full text-text">
              <ChevronLeft size={24} strokeWidth={2.4} aria-hidden />
            </motion.button>
          )}
          <span className="glass flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-text">
            <Check size={14} strokeWidth={3} className="text-calm-ink" aria-hidden /> Walk closed · {WALK.id}
          </span>
        </div>
      </MapCanvas>

      {/* figures */}
      <section className="relative z-10 -mt-7 overflow-hidden rounded-t-[28px] bg-ink px-5 pb-5 pt-5 text-on-ink">
        <span aria-hidden className="sun -right-[14%] -top-[64%] w-[44%]" />
        <p className="relative max-w-[70%] text-[17px] font-extrabold leading-tight">
          {dog.name} is home. How was <span className="text-sun-light">{walker.first}</span>?
        </p>
        <div className="relative mt-4 grid grid-cols-3 gap-3">
          {[
            { v: WALK.plannedKm.toFixed(1), u: 'km', l: 'Distance' },
            { v: String(duration), u: 'min', l: 'On the walk' },
            { v: String(logs.length), u: 'logs', l: 'Updates sent' },
          ].map((f) => (
            <div key={f.l} className="min-w-0">
              <p className="figure num text-[38px]">
                {f.v}
                <span className="unit">{f.u}</span>
              </p>
              <p className="label mt-1 text-on-ink-2">{f.l}</p>
            </div>
          ))}
        </div>
        <p className="num relative mt-4 flex items-center gap-2 rounded-full bg-[rgb(255_255_255/0.1)] px-3.5 py-2 text-[12px] font-bold">
          <KeyRound size={14} strokeWidth={2.5} className="shrink-0 text-sun-light" aria-hidden />
          <span className="truncate">Check-In 8:02 am · Check-Out 8:47 am</span>
          <Check size={15} strokeWidth={3} className="ml-auto shrink-0 text-sun-light" aria-label="Both verified" />
        </p>
      </section>

      {/* photo strip */}
      <Rail className="mt-4 pb-1" gap={10}>
        {photos.map((p, i) => (
          <span key={p.key + i} className="relative block h-[112px] w-[150px] shrink-0 snap-start overflow-hidden rounded-[var(--r-card)]">
            <img src={img(p.key, 420)} alt={`Photo from ${dog.name}'s walk`} className="h-full w-full object-cover" />
            <span className="num absolute bottom-2 left-2 rounded-full bg-[rgb(10_18_56/0.72)] px-2 py-0.5 text-[11px] font-bold text-white">{p.cap}</span>
          </span>
        ))}
      </Rail>

      {/* stars */}
      <div className="mt-5 flex flex-col items-center px-5 text-center">
        <Avatar who={walker.photo} size={60} ring />
        <h2 className="grot mt-3 text-[24px]">
          Rate <span className="swoosh">{walker.first}</span>
        </h2>
        <div className="mt-2 flex items-center" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} star${i > 1 ? 's' : ''}`} whileTap={{ scale: 0.8 }} transition={spring.pop} onClick={() => setRating(i)} className="grid h-[52px] w-[52px] place-items-center">
              <motion.span animate={{ scale: i <= rating ? 1 : 0.86 }} transition={spring.pop}>
                <Star size={40} strokeWidth={0} fill={i <= rating ? 'var(--sun)' : 'var(--paper-300)'} aria-hidden />
              </motion.span>
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={rating} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.08 } }} className="text-[14px] font-extrabold text-accent-ink">
            {WORDS[rating]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* tags */}
      <p className="label mt-5 px-5 text-text-2">What stood out</p>
      <div className="mt-2 flex flex-wrap gap-2 px-5">
        {TAGS.map((t) => {
          const on = tags.includes(t)
          return (
            <motion.button key={t} type="button" whileTap={tap} transition={spring.ui} aria-pressed={on} onClick={() => toggle(t)} className={`flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface)] text-text'}`} style={on ? undefined : { boxShadow: 'inset 0 0 0 1.5px var(--rule-strong)' }}>
              {on && <Check size={14} strokeWidth={3.2} aria-hidden />}
              {t}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-5 px-5">
        <TextArea label="Your review" rows={3} value={text} onChange={(e) => setText(e.target.value)} hint={`Shown on ${walker.first}'s profile with your first name.`} />
      </div>

      {/* tip */}
      <section className="mt-5 bg-sun-soft px-5 py-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[16px] font-extrabold">Add a tip for {walker.first}</p>
          <p className="text-[12px] font-bold text-[var(--on-sun-soft)]">Optional · 100% to the walker</p>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {TIPS.map((t) => {
            const on = tip === t
            return (
              <motion.button key={t} type="button" whileTap={tap} transition={spring.ui} aria-pressed={on} onClick={() => setTip(t)} className={`figure num h-[54px] rounded-[var(--r-control)] text-[22px] ${on ? 'bg-sun text-on-sun shadow-[var(--glow-sun)]' : 'bg-[var(--surface)] text-text'}`}>
                {t === 0 ? <span className="text-[14px] font-extrabold" style={{ fontFamily: 'var(--font-text)' }}>No tip</span> : `₹${t}`}
              </motion.button>
            )
          })}
        </div>
      </section>

      <button type="button" onClick={() => navigate('owner.support')} className="mx-auto mt-3 flex h-11 items-center gap-1.5 text-[13px] font-bold text-accent-ink">
        <Headset size={15} strokeWidth={2.4} aria-hidden /> Something went wrong on this walk?
      </button>
    </MobileScreen>
  )
}
