import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, ChevronLeft, Fingerprint, Heart, MapPin, MessageCircle, Repeat2, ShieldCheck, Siren, Sparkles } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { Price, StarRow, Stars } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Rail } from '../../components/Media'
import { REVIEWS, dogById, walkerById } from '../../data/cast'
import { quote, type Duration } from '../../data/core'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { fadeUp, listItem, listParent } from '../../motion/transitions'
import { Dock, MobileScreen, safeTop } from '../mobileShell'

/* Walker profile, after the client's reference: a full-bleed cover photo
   under the status bar, the avatar with the yellow ring lapping its lower
   edge, the name with the swoosh, the price set big, Book (yellow) and
   Message (royal blue) side by side. */

const DURATIONS: Duration[] = [30, 45, 60]

/** A believable 5 to 1 star split for a given average. */
function breakdown(rating: number, total: number) {
  const five = Math.min(0.94, Math.max(0.4, (rating - 3.9) * 0.9))
  const four = (1 - five) * 0.68
  const three = (1 - five) * 0.2
  const two = (1 - five) * 0.08
  const one = 1 - five - four - three - two
  return [five, four, three, two, one].map((p, i) => ({ stars: 5 - i, pct: p * 100, count: Math.round(p * total) }))
}

export default function OwnerWalker() {
  const { navigate, back, canGoBack, toast } = useNav()
  const id = useSession((s) => s.viewingWalker)
  const fav = useSession((s) => s.favourites.includes(s.viewingWalker))
  const stage = useSession((s) => s.stage)
  const bookedWalker = useSession((s) => s.walkerId)
  const duration = useSession((s) => s.duration)
  const instant = useSession((s) => s.instant)
  const pricing = useSession((s) => s.pricing)
  const dogId = useSession((s) => s.dogId)
  const w = walkerById(id)
  const dog = dogById(dogId)
  const priceFor = (d: Duration) => quote(pricing, d, dog.temperament, instant).base
  const price = priceFor(duration)
  const bars = breakdown(w.rating, w.reviews)
  const repeat = Math.min(92, Math.round(48 + w.rating * 6 + w.years * 2))
  const chatOpen = stage !== 'none' && bookedWalker === w.id

  const book = () => navigate('owner.booking')
  const message = () => {
    if (chatOpen) navigate('owner.chat')
    else toast('Chat opens as soon as your booking is confirmed', 'info')
  }

  const checks = [
    { icon: Fingerprint, title: 'KYC verified', sub: 'Aadhaar and PAN' },
    { icon: BadgeCheck, title: 'Police verification', sub: 'Renewed 2026' },
    ...(w.certified ? [{ icon: ShieldCheck, title: 'Aggressive Breed Certified', sub: 'Muzzle and leash trained' }] : []),
  ]

  return (
    <MobileScreen
      cap="var(--ink)"
      bg="var(--surface)"
      dock={
        <Dock>
          <span className="pl-3 pr-1 leading-tight">
            <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-text-2">{duration} min walk</span>
            <Price amount={price} size={26} />
          </span>
          <Button size="lg" block trailing={ArrowRight} onClick={book}>
            Book {w.first}
          </Button>
        </Dock>
      }
    >
      {/* cover photo under the status bar */}
      <section className="relative h-[318px] bg-ink">
        <img src={img(w.cover, 900)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="scrim-t pointer-events-none absolute inset-x-0 top-0 h-[42%]" />
        <div className="absolute inset-x-4 flex items-center justify-between" style={{ top: safeTop(6) }}>
          {canGoBack ? (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full bg-[rgb(10_18_56/0.5)] text-white backdrop-blur-md">
              <ChevronLeft size={24} strokeWidth={2.4} aria-hidden />
            </motion.button>
          ) : (
            <span className="h-11 w-11" />
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.86 }}
            transition={spring.pop}
            onClick={() => {
              session.toggleFavourite(w.id)
              toast(fav ? `${w.first} removed from favourites` : `${w.first} saved to favourites`, fav ? 'neutral' : 'accent')
            }}
            aria-label={fav ? 'Remove from favourites' : 'Save to favourites'}
            aria-pressed={fav}
            className={`grid h-11 w-11 place-items-center rounded-full backdrop-blur-md ${fav ? 'bg-white text-reactive' : 'bg-[rgb(10_18_56/0.5)] text-white'}`}
          >
            <Heart size={20} strokeWidth={2.4} fill={fav ? 'currentColor' : 'none'} aria-hidden />
          </motion.button>
        </div>
        {w.featured && (
          <span className="absolute bottom-10 right-4 flex h-7 items-center gap-1 rounded-full bg-sun px-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-on-sun">
            <Sparkles size={12} strokeWidth={2.6} aria-hidden /> Featured walker
          </span>
        )}
      </section>

      {/* identity: avatar lapping the photo, name, price */}
      <section className="relative z-10 -mt-7 rounded-t-[30px] bg-[var(--surface)] px-5 pb-1">
        <div className="flex items-end justify-between gap-3">
          <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.pop} className="-mt-12 block rounded-full bg-[var(--surface)] p-1">
            <Avatar who={w.photo} size={96} ring verified alt={w.name} />
          </motion.span>
          <span className="flex flex-col items-end pb-1">
            <Price amount={price} size={46} swoosh />
            <span className="mt-2 text-[12px] font-bold text-text-2">for {duration} min, before GST</span>
          </span>
        </div>
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="grot mt-3 text-[clamp(30px,8.6vw,36px)]">
            <span className="swoosh">{w.first}</span> {w.name.split(' ').slice(1).join(' ')}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold text-text-2">
            <span className="flex items-center gap-1">
              <MapPin size={14} strokeWidth={2.5} aria-hidden /> {w.locality}
            </span>
            <span className="num">
              {w.km} km away · {w.eta} min
            </span>
            <span className={`flex items-center gap-1.5 font-extrabold ${w.online ? 'text-[var(--on-success-soft)]' : 'text-text-2'}`}>
              <span aria-hidden className={`h-2 w-2 rounded-full ${w.online ? 'bg-calm' : 'bg-[var(--paper-400)]'}`} /> {w.online ? 'Online now' : 'Offline'}
            </span>
          </p>
        </motion.div>

        {/* Book + Message */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Button variant="ghost" size="lg" className="!w-full" style={{ background: 'var(--sun)', color: 'var(--on-sun)', boxShadow: 'var(--glow-sun)' }} onClick={book}>
            Book
          </Button>
          <Button size="lg" icon={MessageCircle} className="!w-full" onClick={message}>
            Message
          </Button>
        </div>
      </section>

      {/* verification strip: full-bleed tint */}
      <section className="mt-5 bg-[var(--surface-tint)] py-4">
        <div className={`grid gap-2 px-5 ${checks.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {checks.map((c) => (
            <div key={c.title} className="flex flex-col items-start gap-1.5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-on-accent">
                <c.icon size={19} strokeWidth={2.3} aria-hidden />
              </span>
              <span className="text-[13px] font-extrabold leading-tight text-[var(--on-accent-soft)]">{c.title}</span>
              <span className="text-[11px] font-semibold leading-tight text-text-2">{c.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* services: round yellow chips */}
      <section className="mt-5 px-5">
        <h2 className="grot text-[22px]">Walks for {dog.name}</h2>
        <div role="radiogroup" aria-label="Walk duration" className="mt-3 flex justify-between gap-2">
          {DURATIONS.map((d) => {
            const on = d === duration
            return (
              <motion.button key={d} type="button" role="radio" aria-checked={on} whileTap={{ scale: 0.94 }} transition={spring.ui} onClick={() => session.setDuration(d)} className={`flex aspect-square w-[31%] max-w-[118px] flex-col items-center justify-center rounded-full ${on ? 'bg-sun text-on-sun shadow-[var(--glow-sun)]' : 'bg-sun-soft text-[var(--on-sun-soft)]'}`} style={on ? { boxShadow: 'inset 0 0 0 3px var(--ink), var(--glow-sun)' } : undefined}>
                <span className="figure num text-[30px]">{d}</span>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.08em]">min</span>
                <Price amount={priceFor(d)} size={16} className="mt-1" />
              </motion.button>
            )
          })}
        </div>
        {dog.temperament === 'reactive' && (
          <p className="mt-3 text-[12px] font-semibold text-text-2">
            {dog.name} is tagged Aggressive / Reactive: a handling surcharge of ₹{pricing.reactiveSurcharge} is added at checkout.
          </p>
        )}
      </section>

      {/* stat row */}
      <section className="mt-6 grid grid-cols-4 px-3">
        {[
          { v: w.walks.toLocaleString('en-IN'), l: 'walks' },
          { v: String(w.years), l: w.years === 1 ? 'year' : 'years' },
          { v: w.rating.toFixed(1), l: 'rating' },
          { v: `${repeat}%`, l: 'repeat owners' },
        ].map((s, i) => (
          <div key={s.l} className="flex flex-col items-center px-1 text-center" style={i > 0 ? { boxShadow: 'inset 1px 0 0 var(--rule)' } : undefined}>
            <span className="figure num text-[26px]">{s.v}</span>
            <span className="mt-1 text-[11px] font-bold leading-tight text-text-2">{s.l}</span>
          </div>
        ))}
      </section>

      {/* bio */}
      <section className="mt-6 px-5">
        <h2 className="grot text-[22px]">About {w.first}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-text">{w.bio}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {w.tags.map((t) => (
            <span key={t} className="flex h-8 items-center rounded-full bg-[var(--surface-high)] px-3 text-[12px] font-bold">
              {t}
            </span>
          ))}
          <span className="flex h-8 items-center gap-1 rounded-full bg-[var(--surface-high)] px-3 text-[12px] font-bold">
            <Siren size={13} strokeWidth={2.4} aria-hidden /> SOS trained
          </span>
        </div>
      </section>

      {/* rating breakdown */}
      <section className="relative mt-6 overflow-hidden bg-ink px-5 py-5 text-on-ink">
        <span aria-hidden className="dots-light" />
        <div className="relative flex items-center gap-5">
          <div className="flex w-[34%] shrink-0 flex-col items-start">
            <span className="figure num text-[58px] text-sun-light">{w.rating.toFixed(1)}</span>
            <StarRow rating={w.rating} size={13} />
            <span className="num mt-1.5 text-[12px] font-bold text-on-ink-2">{w.reviews} reviews</span>
          </div>
          <ul className="flex min-w-0 flex-1 flex-col gap-1.5" aria-label="Rating breakdown">
            {bars.map((b) => (
              <li key={b.stars} className="flex items-center gap-2">
                <span className="num w-3 text-[12px] font-extrabold">{b.stars}</span>
                <span className="relative h-[5px] min-w-0 flex-1 overflow-hidden rounded-full bg-[rgb(255_255_255/0.16)]">
                  <motion.span className="absolute inset-0 origin-left rounded-full bg-sun" initial={{ scaleX: 0 }} animate={{ scaleX: Math.max(0.015, b.pct / 100) }} transition={{ ...spring.page, delay: 0.05 * (5 - b.stars) }} />
                </span>
                <span className="num w-7 text-right text-[11px] font-bold text-on-ink-2">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-on-ink-2">
          <Repeat2 size={14} strokeWidth={2.4} aria-hidden /> {repeat}% of owners booked {w.first} again within 30 days.
        </p>
      </section>

      {/* reviews: a rail that bleeds off the right edge */}
      <div className="mt-6 flex items-end justify-between gap-3 px-5">
        <h2 className="grot text-[22px]">What owners say</h2>
        <Stars rating={w.rating} count={w.reviews} size={13} />
      </div>
      <motion.div variants={listParent} initial="hidden" animate="show">
        <Rail className="mt-3 pb-4" gap={12}>
          {REVIEWS.map((r) => (
            <motion.article key={r.id} variants={listItem} className="flex w-[78%] max-w-[300px] shrink-0 snap-start flex-col rounded-[var(--r-card)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-raised)]">
              <div className="flex items-center gap-2.5">
                <Avatar who={r.photo} size={40} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[14px] font-extrabold">{r.who}</p>
                  <p className="truncate text-[12px] font-semibold text-text-2">{r.dog}</p>
                </div>
                <span className="meta shrink-0 text-text-2">{r.when}</span>
              </div>
              <div className="mt-2.5">
                <StarRow rating={r.rating} size={13} />
              </div>
              <p className="mt-2 text-[14px] leading-snug text-text">{r.text.replace(/Arjun/g, w.first)}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {r.tags.map((t) => (
                  <span key={t} className="flex h-6 items-center rounded-full bg-sun-soft px-2.5 text-[11px] font-extrabold text-[var(--on-sun-soft)]">
                    {t}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </Rail>
      </motion.div>
      <p className="px-5 pb-2 text-[12px] font-semibold text-text-2">Reviews come only from owners whose walk closed with both OTPs.</p>
    </MobileScreen>
  )
}
