import { motion } from 'framer-motion'
import { Check, ChevronLeft, Leaf, Lock, MessageCircle, Navigation, ShieldAlert, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Certified, Price, TemperBadge } from '../../components/Brand'
import { Button, IconButton } from '../../components/Button'
import { MapCanvas } from '../../components/Map'
import { OWNER, TEMPERAMENT, WALKER_ME, dogById } from '../../data/cast'
import { inr, mmss } from '../../data/clock'
import { APPROACH, HOME_PIN, WALK, quote, stageAtLeast } from '../../data/core'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { listItem, listParent } from '../../motion/transitions'
import { Dock, MobileScreen, safeTop } from '../mobileShell'

/* The job request console: one request in full. The dog's photo fills the
   top with the temperament badge set large and the accept countdown on
   the photo; three big figures, a dense fact sheet, the handling band,
   the owner's notes, the pickup on the map, and the payout worked out on
   an ink panel from the admin's rate card. */

function AcceptTimer() {
  const [left, setLeft] = useState(30)
  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => (s > 1 ? s - 1 : 30)), 1000)
    return () => window.clearInterval(t)
  }, [])
  const size = 84
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role="timer" aria-label={`Accept within ${left} seconds`}>
      <span aria-hidden className="absolute inset-1 animate-ping rounded-full bg-[rgb(255_198_5/0.45)]" style={{ animationDuration: '1.6s' }} />
      <svg width={size} height={size} className="relative -rotate-90 rounded-full bg-ink" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sun)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left / 30)} style={{ transition: 'stroke-dashoffset 0.9s linear' }} />
      </svg>
      <span className="absolute text-center leading-none text-white">
        <span className="figure num block text-[24px]">{mmss(left).slice(1)}</span>
        <span className="mt-0.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-sun-light">to accept</span>
      </span>
    </span>
  )
}

export default function WalkerRequest() {
  const { navigate, reset, back, canGoBack, toast } = useNav()
  const stage = useSession((s) => s.stage)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const instant = useSession((s) => s.instant)
  const pricing = useSession((s) => s.pricing)
  const dog = dogById(dogId)
  const q = quote(pricing, duration, dog.temperament, instant)
  const reactive = dog.temperament === 'reactive'
  const accepted = stageAtLeast(stage, 'accepted')

  useEffect(() => {
    session.advance('requested')
  }, [])

  const facts = [
    { k: 'Breed', v: dog.breed },
    { k: 'Age and weight', v: `${dog.age} · ${dog.weight} · ${dog.gender}` },
    { k: 'Slot', v: `${WALK.slot}, ${instant ? 'Walk Now' : 'scheduled'}` },
    { k: 'Pickup', v: OWNER.locality },
    { k: 'Planned route', v: `${WALK.plannedKm} km, Sector 70 park loop` },
    { k: 'Booking', v: WALK.id },
  ]

  return (
    <MobileScreen
      cap="var(--ink)"
      dockHeight={84}
      dock={
        <Dock>
          <Button variant="outline" size="lg" icon={X} onClick={() => { session.decline(); toast(`You declined ${dog.name}’s walk. It goes to the next walker`, 'neutral'); reset('walker.home') }}>
            Decline
          </Button>
          <Button size="lg" block icon={Check} onClick={() => { session.advance('accepted'); navigate('walker.pickup') }}>
            {accepted ? 'Go to pickup' : 'Accept job'}
          </Button>
        </Dock>
      }
    >
      {/* the dog */}
      <section className="relative h-[372px] overflow-hidden bg-ink text-white">
        <img src={img(dog.photo, 900)} alt={`${dog.name}, ${dog.breed}`} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 22%' }} />
        <div className="scrim-t pointer-events-none absolute inset-x-0 top-0 h-[40%]" />
        <div className="scrim-b pointer-events-none absolute inset-0" />
        <div className="relative flex items-center justify-between px-3" style={{ paddingTop: safeTop(6) }}>
          {canGoBack ? <IconButton icon={ChevronLeft} label="Back" tone="scrim" onClick={back} /> : <span />}
          <IconButton icon={MessageCircle} label={`Chat with ${OWNER.first}`} tone="scrim" onClick={() => (accepted ? navigate('walker.chat') : toast('Chat opens when you accept the job', 'neutral'))} />
        </div>
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <TemperBadge t={dog.temperament} size="md" solid full className="!h-9 !px-3.5 !text-[13px]" />
            <h1 className="grot mt-2.5 text-[52px] leading-[0.9]">
              <span className="swoosh">{dog.name}</span>
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[13px] font-bold">
              <Avatar who={OWNER.photo} size={24} />
              <span className="truncate">{OWNER.first}’s {dog.breed}</span>
            </p>
          </div>
          <AcceptTimer />
        </div>
      </section>

      {/* three figures */}
      <motion.div variants={listParent} initial="hidden" animate="show" className="grid grid-cols-3 px-5 pt-5">
        <motion.div variants={listItem}>
          <p className="label text-text-2">To pickup</p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="figure num text-[38px]">{WALKER_ME.km}</span>
            <span className="text-[13px] font-extrabold">km</span>
          </p>
          <p className="num flex items-center gap-1 text-[12px] font-bold text-accent-ink">
            <Navigation size={12} strokeWidth={2.8} aria-hidden /> {WALKER_ME.eta} min ride
          </p>
        </motion.div>
        <motion.div variants={listItem} className="pl-4 shadow-[inset_2px_0_0_var(--sun)]">
          <p className="label text-text-2">Walk</p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="figure num text-[38px]">{duration}</span>
            <span className="text-[13px] font-extrabold">min</span>
          </p>
          <p className="num text-[12px] font-bold text-text-2">starts {WALK.slot}</p>
        </motion.div>
        <motion.div variants={listItem} className="pl-4 shadow-[inset_2px_0_0_var(--sun)]">
          <p className="label text-text-2">You get</p>
          <Price amount={q.walkerNet} size={38} className="mt-1" />
          <p className="num text-[12px] font-bold text-calm-ink">net, after {pricing.commissionPct}%</p>
        </motion.div>
      </motion.div>

      {/* temperament and handling */}
      <section className={`mt-5 px-5 py-4 ${reactive ? 'bg-reactive-soft text-[var(--on-reactive-soft)]' : 'bg-calm-soft text-[var(--on-calm-soft)]'}`}>
        <div className="flex items-start gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white ${reactive ? 'bg-reactive' : 'bg-calm'}`}>
            {reactive ? <ShieldAlert size={22} strokeWidth={2.3} aria-hidden /> : <Leaf size={22} strokeWidth={2.3} aria-hidden />}
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold">Temperament: {TEMPERAMENT[dog.temperament].label}</p>
            <p className="mt-0.5 text-[13px] font-semibold leading-snug">
              {reactive ? 'Muzzle on before the lift and at the gate. Short leash, one metre, past other dogs and scooters. Do not let strangers pet.' : 'Standard handling. Regular leash and harness. Fine with other dogs and children.'}
            </p>
            {reactive && <Certified className="mt-2 bg-white" />}
          </div>
        </div>
      </section>

      {/* dense fact sheet */}
      <dl className="grid grid-cols-2 gap-x-5 gap-y-3.5 px-5 pt-5">
        {facts.map((f) => (
          <div key={f.k} className="min-w-0">
            <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-2">{f.k}</dt>
            <dd className="num mt-0.5 text-[14px] font-extrabold leading-snug">{f.v}</dd>
          </div>
        ))}
      </dl>
      <p className="mx-5 mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-text-2">
        <Lock size={13} strokeWidth={2.5} aria-hidden /> Flat number and gate note appear once you accept.
      </p>

      {/* owner's notes */}
      <figure className="mt-5 flex gap-3 px-5">
        <Avatar who={OWNER.photo} size={44} ring />
        <div className="min-w-0 flex-1 rounded-[var(--r-card)] rounded-tl-[6px] bg-accent-soft px-4 py-3">
          <figcaption className="label text-[var(--on-accent-soft)]">{OWNER.first}’s notes</figcaption>
          <blockquote className="mt-1.5 text-[14px] font-semibold leading-snug">{dog.notes}</blockquote>
          <p className="mt-2 text-[13px] leading-snug text-text-2">Diet: {dog.diet} Medical: {dog.medical}</p>
        </div>
      </figure>

      {/* pickup on the map */}
      <div className="mt-5 px-4">
        <MapCanvas className="h-[176px] w-full rounded-[var(--r-container)]" route={APPROACH} progress={0.04} walker={{ photo: WALKER_ME.photo, label: 'You' }} home={HOME_PIN}>
          <span className="glass num absolute bottom-3 right-3 flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-extrabold text-text">
            <Navigation size={13} strokeWidth={2.8} aria-hidden /> {WALKER_ME.km} km · {WALKER_ME.eta} min
          </span>
        </MapCanvas>
      </div>

      {/* payout, from the rate card */}
      <section className="relative mt-6 overflow-hidden bg-ink px-5 py-6 text-on-ink">
        <span aria-hidden className="dots-light" />
        <p className="label relative text-sun-light">Your payout for this walk</p>
        <dl className="num relative mt-4 flex flex-col gap-2.5 text-[14px] font-semibold">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-on-ink-2">Walk fee, {duration} min</dt>
            <dd className="font-extrabold">{inr(q.base)}</dd>
          </div>
          {q.surcharge > 0 && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-on-ink-2">Aggressive-dog surcharge</dt>
              <dd className="font-extrabold">+{inr(q.surcharge)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <dt className="text-on-ink-2">Platform commission, {pricing.commissionPct}%</dt>
            <dd className="font-extrabold text-sun-light">-{inr(q.commission)}</dd>
          </div>
        </dl>
        <div className="perf-ink relative my-4" />
        <div className="relative flex items-end justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-on-ink-2">Net payout to your wallet</p>
            <p className="mt-0.5 text-[12px] font-semibold text-on-ink-2">Owner pays {inr(q.total)} incl. GST{q.instant ? ' and the Walk Now fee' : ''}</p>
          </div>
          <Price amount={q.walkerNet} size={56} swoosh className="text-white" />
        </div>
      </section>
    </MobileScreen>
  )
}
