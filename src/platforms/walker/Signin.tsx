import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Mark } from '../../components/Brand'
import { Button } from '../../components/Button'
import { CheckMark, Input } from '../../components/Form'
import { inr } from '../../data/clock'
import { DEMO_WALKER_LOGIN } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { spring } from '../../motion/springs'
import { fadeUp, listItem, listParent } from '../../motion/transitions'
import { safeBottom, safeTop } from '../mobileShell'

/* Entry screen of the Dog Walker App. Where the owner app opens on brand
   yellow, the partner app opens on a full-bleed photo under an ink and
   royal-blue scrim: the pack on the plaza, three earning figures set on
   the photo, and a white sign-in sheet lapping it. */

const FIGURES = [
  { value: inr(9400), label: 'average weekly earnings' },
  { value: '1,240', label: 'active walkers' },
  { value: '3', label: 'cities and growing' },
]

export default function WalkerSignin() {
  const { navigate, reset, toast } = useNav()
  const [phone, setPhone] = useState(DEMO_WALKER_LOGIN.phone)
  const [agree, setAgree] = useState(DEMO_WALKER_LOGIN.agree)
  const [error, setError] = useState('')

  const signIn = () => {
    if (phone.replace(/\D/g, '').length < 10) return setError('Enter the 10-digit mobile number you registered with')
    if (!agree) return toast('Tick the partner terms to continue', 'warn')
    setError('')
    reset('walker.home')
  }

  return (
    <div data-screen-root className="scroll-y relative h-full bg-ink text-on-ink">
      <div className="relative flex min-h-full flex-col">
        {/* the photo and its scrim */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[66%]">
          <img src={img('walkerPack', 1000)} alt="A walker's pack of leashed dogs on a brick plaza" className="h-full w-full object-cover" style={{ objectPosition: '50% 40%' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgb(10 18 56 / 0.78) 0%, rgb(35 72 214 / 0.34) 34%, rgb(14 27 87 / 0.72) 68%, var(--ink) 100%)' }} />
        </div>
        <span aria-hidden className="sun -right-[24%] top-[9%] w-[46%]" />

        <header className="relative z-10 flex items-center justify-between gap-3 px-5" style={{ paddingTop: safeTop(14) }}>
          <span className="flex items-center gap-2.5">
            <Mark size={44} />
            <span className="leading-none">
              <span className="display block text-[24px] text-white">Vuffora</span>
              <span className="label mt-1 block text-sun-light">Partner</span>
            </span>
          </span>
          <span className="flex h-8 items-center gap-1.5 rounded-full bg-[rgb(10_18_56/0.55)] px-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white backdrop-blur-md">
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-sun" /> 86 jobs live in Mohali
          </span>
        </header>

        <div className="relative z-10 flex min-h-[250px] flex-1 flex-col justify-end px-5" style={{ paddingBottom: 'calc(24px + var(--chrome-space, 0px))' }}>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" className="grot max-w-[11ch] text-[clamp(36px,10.6vw,44px)] leading-[0.96] text-white">
            Walk dogs. <span className="swoosh">Get paid</span> every day.
          </motion.h1>
          <p className="mt-3 max-w-[30ch] text-[15px] font-semibold text-on-ink-2">Pick your hours, see the net payout before you accept, withdraw to UPI any time.</p>

          <motion.dl variants={listParent} initial="hidden" animate="show" className="mt-5 grid grid-cols-3 gap-3">
            {FIGURES.map((f, i) => (
              <motion.div key={f.label} variants={listItem} className={i > 0 ? 'pl-3 shadow-[inset_1px_0_0_rgb(255_255_255/0.22)]' : ''}>
                <dd className="figure num text-[clamp(24px,7.4vw,30px)] text-sun-light">{f.value}</dd>
                <dt className="mt-1 text-[12px] font-semibold leading-tight text-on-ink-2">{f.label}</dt>
              </motion.div>
            ))}
          </motion.dl>
        </div>

        {/* sign-in sheet */}
        <motion.section data-dock initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring.page} className="relative z-10 rounded-t-[32px] bg-[var(--surface)] px-5 pt-5 text-text" style={{ paddingBottom: safeBottom(8) }}>
          <Input
            label="Registered mobile number"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setError('')
            }}
            error={error || undefined}
            hint="We send a one-time code by SMS. No password to remember."
            leading={<span className="num text-[15px] font-bold text-text">{DEMO_WALKER_LOGIN.countryCode}</span>}
            className="num font-bold tracking-[0.04em]"
          />
          <button type="button" role="checkbox" aria-checked={agree} onClick={() => setAgree((v) => !v)} className="mt-2 flex min-h-11 w-full items-center gap-3 text-left">
            <CheckMark on={agree} />
            <span className="text-[13px] font-semibold leading-snug text-text-2">I agree to the partner terms, the code of conduct and background checks.</span>
          </button>
          <Button size="lg" block trailing={ArrowRight} className="mt-2 w-full" onClick={signIn}>
            Sign in
          </Button>
          <div className="mt-1 flex items-center justify-between gap-3">
            <button type="button" onClick={() => navigate('walker.kyc')} className="flex h-11 items-center text-[13px] font-extrabold text-accent-ink">
              New partner? Start onboarding
            </button>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-text-2">
              <ShieldCheck size={14} strokeWidth={2.4} aria-hidden /> KYC verified network
            </span>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
