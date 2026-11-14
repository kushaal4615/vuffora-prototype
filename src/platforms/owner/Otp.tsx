import { motion } from 'framer-motion'
import { BellRing, Check, ChevronLeft, Pencil, RotateCw, ShieldCheck, Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Mark } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Toggle } from '../../components/Form'
import { mmss } from '../../data/clock'
import { DEMO_OTP, DEMO_OWNER_LOGIN } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { spring, tap } from '../../motion/springs'
import { fadeUp } from '../../motion/transitions'
import { MobileScreen, safeTop } from '../mobileShell'

/* "Verify your number". Yellow hero with the SMS as it arrives on the
   lock screen, six boxes already filled from that SMS, a resend countdown
   that really counts, and the secure-gateway note. */

const RESEND_AFTER = 30

export default function OwnerOtp() {
  const { navigate, back, canGoBack, reset, toast } = useNav()
  const [code, setCode] = useState<string[]>(() => [...DEMO_OTP])
  const [left, setLeft] = useState(RESEND_AFTER - 2)
  const [sent, setSent] = useState(1)
  const [push, setPush] = useState(true)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => window.clearInterval(t)
  }, [])

  const setDigit = (i: number, v: string) => {
    const ch = v.replace(/\D/g, '').slice(-1)
    setCode((c) => c.map((x, j) => (j === i ? ch : x)))
    setError('')
    if (ch && i < 5) boxes.current[i + 1]?.focus()
  }

  const resend = () => {
    setLeft(RESEND_AFTER)
    setSent((n) => n + 1)
    setCode([...DEMO_OTP])
    setError('')
    toast(`New OTP sent to ${DEMO_OWNER_LOGIN.countryCode} ${DEMO_OWNER_LOGIN.phone}`, 'accent')
  }

  const verify = () => {
    if (code.some((c) => c === '')) {
      setError('Enter all 6 digits from the SMS, or tap Resend.')
      return
    }
    setDone(true)
    toast('Number verified', 'accent')
    window.setTimeout(() => navigate('owner.dog'), 420)
  }

  const full = code.join('')

  return (
    <MobileScreen cap="var(--sun)" bg="var(--surface)">
      {/* yellow hero with the SMS */}
      <section className="relative overflow-hidden bg-sun px-5 pb-14 text-on-sun" style={{ paddingTop: safeTop(8) }}>
        <span aria-hidden className="pointer-events-none absolute -right-[26%] -top-[30%] aspect-square w-[80%] rounded-full bg-[rgb(255_255_255/0.3)]" />
        <div className="relative flex items-center gap-2">
          {canGoBack && (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="-ml-2 grid h-11 w-11 place-items-center rounded-full">
              <ChevronLeft size={26} strokeWidth={2.3} aria-hidden />
            </motion.button>
          )}
          <span className="label">SMS login</span>
        </div>

        <h1 className="grot relative mt-3 text-[clamp(30px,8.8vw,36px)] leading-[0.98]">
          Verify your <span className="swoosh swoosh-blue">number</span>
        </h1>
        <div className="relative mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-semibold">
          <span>We sent a 6-digit code to</span>
          <span className="flex items-center gap-1">
            <span className="num font-extrabold">
              {DEMO_OWNER_LOGIN.countryCode} {DEMO_OWNER_LOGIN.phone}
            </span>
            <button type="button" onClick={back} aria-label="Change number" className="grid h-11 w-9 place-items-center rounded-full">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgb(255_255_255/0.6)]">
                <Pencil size={13} strokeWidth={2.6} aria-hidden />
              </span>
            </button>
          </span>
        </div>

        {/* the SMS as it lands */}
        <motion.div key={sent} variants={fadeUp} initial="hidden" animate="show" className="glass relative mt-3 flex items-start gap-3 rounded-[var(--r-card)] p-3 text-text">
          <span className="relative shrink-0">
            <img src={img('labPup', 160)} alt="" className="h-11 w-11 rounded-[13px] object-cover" />
            <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white p-0.5 shadow-[var(--shadow-raised)]">
              <Mark size={18} />
            </span>
          </span>
          <span className="min-w-0 flex-1 leading-snug">
            <span className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.06em]">VM-VUFORA</span>
              <span className="meta shrink-0 text-text-2">now</span>
            </span>
            <span className="mt-0.5 block text-[13px] font-semibold text-text">
              <span className="num font-extrabold">{DEMO_OTP.join('')}</span> is your Vuffora login OTP. Valid for 10 minutes. Do not share it with anyone.
            </span>
          </span>
        </motion.div>
      </section>

      {/* white sheet */}
      <section className="relative z-10 -mt-8 rounded-t-[32px] bg-[var(--surface)] px-5 pt-6 shadow-[0_-16px_40px_-18px_rgb(14_27_87/0.3)]">
        <div className="flex items-center justify-between gap-3">
          <p className="label text-text-2">Enter OTP</p>
          <span className="flex items-center gap-1 text-[12px] font-bold text-[var(--on-success-soft)]">
            <Check size={14} strokeWidth={3} aria-hidden /> Read from SMS
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-6 gap-2" role="group" aria-label="6-digit OTP">
          {code.map((ch, i) => (
            <motion.input
              key={i}
              ref={(el) => {
                boxes.current[i] = el
              }}
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...spring.pop, delay: 0.04 * i }}
              value={ch}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !code[i] && i > 0) boxes.current[i - 1]?.focus()
              }}
              onFocus={(e) => e.currentTarget.select()}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className={`figure num aspect-[1/1.18] w-full min-w-0 rounded-[16px] text-center !text-[30px] outline-none transition-shadow duration-150 focus:ring-[2.5px] focus:ring-[var(--accent)] ${done ? 'bg-success-soft text-[var(--on-success-soft)]' : ch ? 'bg-sun-soft text-text' : 'well text-text'} ${error && !ch ? 'ring-2 ring-[var(--danger)]' : ''}`}
            />
          ))}
        </div>
        {error && <p className="mt-2 text-[13px] font-semibold text-danger-text">{error}</p>}

        {/* resend countdown */}
        <div className="mt-4 flex items-center gap-3">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--surface-high)]">
            <Timer size={18} strokeWidth={2.3} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[13px] font-semibold text-text-2">{left > 0 ? 'Resend code in' : 'Still nothing? Send a fresh code.'}</span>
            <span className="figure num block text-[22px]">{left > 0 ? mmss(left) : 'Ready'}</span>
          </span>
          <Button variant={left > 0 ? 'paper' : 'ink'} size="sm" icon={RotateCw} className="!h-11" onClick={() => (left > 0 ? toast(`You can resend in ${left} seconds`, 'neutral') : resend())}>
            Resend
          </Button>
        </div>
        <span className="mt-2 block h-[5px] overflow-hidden rounded-full bg-[var(--surface-high)]" aria-hidden>
          <span className="block h-full origin-left rounded-full bg-accent transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${1 - left / RESEND_AFTER})` }} />
        </span>

        <p className="mt-4 flex items-start gap-2 rounded-[var(--r-control)] bg-accent-soft px-3 py-2.5 text-[12px] font-semibold leading-snug text-[var(--on-accent-soft)]">
          <ShieldCheck size={16} strokeWidth={2.4} className="mt-px shrink-0" aria-hidden />
          <span>SMS sent via secure gateway. Vuffora never calls to ask for this code. Attempt {sent} of 5, code {full.length === 6 ? 'complete' : 'incomplete'}.</span>
        </p>

        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sun text-on-sun">
            <BellRing size={18} strokeWidth={2.4} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[15px] font-extrabold">Walk alerts on this phone</span>
            <span className="block text-[12px] font-semibold text-text-2">Arrival, OTP handover, photos and breaks</span>
          </span>
          <Toggle
            on={push}
            label="Push notifications"
            onChange={(v) => {
              setPush(v)
              toast(v ? 'Push notifications on' : 'Push notifications off. You can turn them on in Account.', v ? 'accent' : 'neutral')
            }}
          />
        </div>

        <Button size="lg" block icon={done ? Check : undefined} className="mt-5" onClick={verify}>
          {done ? 'Verified' : 'Verify'}
        </Button>
        <button type="button" onClick={() => reset('owner.home')} className="mx-auto mt-1 flex h-11 items-center text-[13px] font-extrabold text-accent-ink">
          I’ve already set up my dogs
        </button>
      </section>
    </MobileScreen>
  )
}
