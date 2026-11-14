import { motion } from 'framer-motion'
import { ArrowRight, Clock3, MessageCircle, ShieldCheck, Wallet } from 'lucide-react'
import { useEffect } from 'react'
import { Avatar } from '../../components/Avatar'
import { Price, StarRow, StatusPill, TemperBadge } from '../../components/Brand'
import { Button, IconButton } from '../../components/Button'
import { Confetti } from '../../components/Confetti'
import { OtpKeypad } from '../../components/Otp'
import { OWNER, dogById } from '../../data/cast'
import { inr } from '../../data/clock'
import { WALK, quote, stageAtLeast } from '../../data/core'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { fadeUp, listItem, listParent } from '../../motion/transitions'
import { MobileScreen, TopBar } from '../mobileShell'

/* Check-Out OTP and payout. Before the code: the walk in three figures on
   an ink band and the keypad (yellow this time, to tell it from Check-In).
   After the code: the blue success hero, the payout worked out line by
   line, and whether it is held or released, which follows the owner's
   review. */

export default function WalkerDropoff() {
  const { navigate, reset } = useNav()
  const stage = useSession((s) => s.stage)
  const rating = useSession((s) => s.rating)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const instant = useSession((s) => s.instant)
  const pricing = useSession((s) => s.pricing)
  const logCount = useSession((s) => s.logs.length)
  const dog = dogById(dogId)
  const q = quote(pricing, duration, dog.temperament, instant)
  const closed = stageAtLeast(stage, 'ended')
  const released = stage === 'reviewed'

  useEffect(() => {
    session.advance('walking')
  }, [])

  const figures = [
    { k: 'Walk time', v: `${duration}:00`, u: 'min' },
    { k: 'Distance', v: WALK.plannedKm.toFixed(1), u: 'km' },
    { k: 'Updates sent', v: String(logCount), u: 'logs' },
  ]

  if (!closed)
    return (
      <MobileScreen header={<TopBar title="Check-Out OTP" sub={`${WALK.id} · drop-off`} right={<IconButton icon={MessageCircle} label={`Message ${OWNER.first}`} tone="paper" onClick={() => navigate('walker.chat')} />} />}>
        <section className="relative overflow-hidden bg-ink px-5 py-5 text-on-ink">
          <span aria-hidden className="sun -right-[8%] -top-[34%] w-[28%]" />
          <div className="relative flex items-center gap-3">
            <img src={img(dog.photo, 200)} alt={`${dog.name}, ${dog.breed}`} className="h-14 w-14 shrink-0 rounded-full object-cover ring-[3px] ring-[var(--sun)]" style={{ objectPosition: '50% 20%' }} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="flex items-center gap-2">
                <span className="label text-sun-light">Hand {dog.name} back</span>
                <TemperBadge t={dog.temperament} solid />
              </p>
              <p className="grot mt-1.5 truncate text-[24px]">Back at Gate 2</p>
            </div>
          </div>
          <dl className="relative mt-5 grid grid-cols-3">
            {figures.map((f, i) => (
              <div key={f.k} className={i > 0 ? 'pl-4 shadow-[inset_1px_0_0_rgb(255_255_255/0.2)]' : ''}>
                <dd className="flex items-baseline gap-1">
                  <span className="figure num text-[34px] text-white">{f.v}</span>
                  <span className="text-[12px] font-extrabold text-on-ink-2">{f.u}</span>
                </dd>
                <dt className="mt-1 text-[12px] font-semibold text-on-ink-2">{f.k}</dt>
              </div>
            ))}
          </dl>
        </section>

        <div className="px-5 pt-5">
          <OtpKeypad expected={WALK.checkOutOtp} label="Verify and end walk" tone="sun" onVerified={() => session.advance('ended')} />
        </div>

        <p className="mx-5 mt-5 flex items-start gap-2.5 rounded-[var(--r-card)] bg-accent-soft px-4 py-3 text-[13px] font-semibold leading-snug text-[var(--on-accent-soft)]">
          <ShieldCheck size={18} strokeWidth={2.4} className="mt-0.5 shrink-0" aria-hidden />
          The job stays open, and {inr(q.walkerNet)} stays unpaid, until {OWNER.first} reads you this second code at the door.
        </p>
        <button type="button" onClick={() => navigate('walker.chat')} className="mx-auto mt-1 flex h-11 items-center gap-1.5 px-5 text-[13px] font-extrabold text-accent-ink">
          <MessageCircle size={15} strokeWidth={2.4} aria-hidden /> Message {OWNER.first}
        </button>
      </MobileScreen>
    )

  return (
    <MobileScreen header={<TopBar title="Walk closed" sub={WALK.id} back={false} />} overlay={<Confetti origin={0.3} />}>
      {/* success hero */}
      <section className="relative overflow-hidden bg-accent px-5 pb-16 pt-6 text-on-accent">
        <span aria-hidden className="sun -bottom-[40%] -right-[10%] w-[36%]" />
        <span aria-hidden className="dots-light" />
        <div className="relative flex items-center gap-4">
          <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.pop} className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full bg-white shadow-[var(--shadow-floating)]">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
              <motion.path d="M8 21 L17 30 L33 11" stroke="var(--calm)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.2, ease: [0.23, 1, 0.32, 1] }} />
            </svg>
          </motion.span>
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="min-w-0">
            <p className="label text-[var(--on-accent-2)]">Check-Out OTP matched</p>
            <h1 className="grot mt-1 text-[36px] leading-[0.95]">{dog.name} is home</h1>
            <p className="mt-1.5 max-w-[25ch] text-[13px] font-semibold text-[var(--on-accent-2)]">Custody is back with {OWNER.first}. Timer and GPS have stopped.</p>
          </motion.div>
        </div>
      </section>

      {/* payout */}
      <motion.section variants={listParent} initial="hidden" animate="show" className="relative z-10 mx-4 -mt-11 rounded-[var(--r-container)] bg-[var(--surface)] p-5 shadow-[var(--shadow-floating)]">
        <motion.div variants={listItem} className="flex items-center justify-between gap-3">
          <p className="label text-text-2">Credited to your wallet</p>
          <StatusPill kind={released ? 'approved' : 'pending'} label={released ? 'Released' : 'Held'} />
        </motion.div>
        <motion.div variants={listItem} className="mt-2 flex items-end justify-between gap-3">
          <Price amount={q.walkerNet} size={64} swoosh />
          <img src={img(dog.photo, 160)} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-[3px] ring-[var(--sun)]" style={{ objectPosition: '50% 20%' }} />
        </motion.div>
        <motion.dl variants={listItem} className="num mt-5 flex flex-col gap-2 text-[14px] font-semibold">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-text-2">Walk fee, {duration} min</dt>
            <dd className="font-extrabold">{inr(q.base)}</dd>
          </div>
          {q.surcharge > 0 && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-2">Aggressive-dog surcharge</dt>
              <dd className="font-extrabold">+{inr(q.surcharge)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <dt className="text-text-2">Platform commission, {pricing.commissionPct}%</dt>
            <dd className="font-extrabold text-danger-text">-{inr(q.commission)}</dd>
          </div>
        </motion.dl>
        <div className="perf my-4" />
        <motion.div variants={listItem} className="flex items-center gap-3">
          <Avatar who={OWNER.photo} size={40} />
          {released ? (
            <div className="min-w-0 flex-1 leading-snug">
              <p className="flex items-center gap-2 text-[14px] font-extrabold">
                {OWNER.first} rated you <StarRow rating={rating} size={15} />
              </p>
              <p className="text-[13px] font-semibold text-text-2">Released. You can withdraw it now.</p>
            </div>
          ) : (
            <div className="min-w-0 flex-1 leading-snug">
              <p className="flex items-center gap-1.5 text-[14px] font-extrabold">
                <Clock3 size={15} strokeWidth={2.6} className="text-warn" aria-hidden /> Held until {OWNER.first} reviews
              </p>
              <p className="text-[13px] font-semibold text-text-2">Usually minutes. Released automatically after 2 hours.</p>
            </div>
          )}
        </motion.div>
      </motion.section>

      {/* the walk in figures */}
      <dl className="mt-6 grid grid-cols-3 px-5">
        {figures.map((f, i) => (
          <div key={f.k} className={i > 0 ? 'pl-4 shadow-[inset_2px_0_0_var(--sun)]' : ''}>
            <dd className="flex items-baseline gap-1">
              <span className="figure num text-[32px]">{f.v}</span>
              <span className="text-[12px] font-extrabold text-text-2">{f.u}</span>
            </dd>
            <dt className="mt-1 text-[12px] font-semibold text-text-2">{f.k}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-2.5 px-5">
        <Button size="lg" icon={Wallet} trailing={ArrowRight} className="w-full" onClick={() => reset('walker.earnings')}>
          See my wallet
        </Button>
        <div className="flex gap-2.5">
          <Button variant="paper" size="lg" block className="!px-3" onClick={() => reset('walker.home')}>
            Back to today
          </Button>
          <Button variant="outline" size="lg" block className="!px-3" onClick={() => navigate('walker.chat')}>
            Message {OWNER.first}
          </Button>
        </div>
      </div>
    </MobileScreen>
  )
}
