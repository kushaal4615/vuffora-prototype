import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, Eye, EyeOff, Fingerprint, LockKeyhole, Mail, MessageSquareText, ShieldCheck, Star } from 'lucide-react'
import { useState } from 'react'
import { Mark } from '../../components/Brand'
import { Button } from '../../components/Button'
import { CheckMark, Input, Toggle } from '../../components/Form'
import { Segmented } from '../../components/Tabs'
import { DEMO_OWNER_LOGIN } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { fadeUp } from '../../motion/transitions'
import { MobileScreen, safeTop } from '../mobileShell'

/* Sign in to the Dog Owner App. Yellow hero with the sun disc, the mark
   and a dog cut as a circle that bleeds off the right edge; a white sheet
   laps it with the two ways in (mobile OTP, email), the biometric lock
   and the terms box. Everything mounts filled. */

type Way = 'mobile' | 'email'

export default function OwnerSignin() {
  const { navigate, back, canGoBack, toast } = useNav()
  const biometric = useSession((s) => s.biometric)
  const [way, setWay] = useState<Way>('mobile')
  const [phone, setPhone] = useState(DEMO_OWNER_LOGIN.phone)
  const [email, setEmail] = useState(DEMO_OWNER_LOGIN.email)
  const [password, setPassword] = useState(DEMO_OWNER_LOGIN.password)
  const [show, setShow] = useState(false)
  const [agree, setAgree] = useState(DEMO_OWNER_LOGIN.agree)
  const [tried, setTried] = useState(false)

  const phoneErr = tried && way === 'mobile' && phone.replace(/\D/g, '').length < 10 ? 'Enter your 10-digit mobile number.' : undefined
  const emailErr = tried && way === 'email' && !/.+@.+\..+/.test(email) ? 'Enter the email you signed up with.' : undefined
  const passErr = tried && way === 'email' && password.length < 6 ? 'Password needs at least 6 characters.' : undefined

  const submit = () => {
    setTried(true)
    const bad = way === 'mobile' ? phone.replace(/\D/g, '').length < 10 : !/.+@.+\..+/.test(email) || password.length < 6
    if (bad) return
    if (!agree) {
      toast('Please accept the terms to continue', 'warn')
      return
    }
    toast(way === 'mobile' ? `OTP sent to ${DEMO_OWNER_LOGIN.countryCode} ${phone}` : 'Password accepted. Confirm with the OTP we sent.', 'accent')
    navigate('owner.otp')
  }

  return (
    <MobileScreen cap="var(--sun)" bg="var(--surface)">
      {/* yellow hero */}
      <section className="relative overflow-hidden bg-sun px-5 pb-16 text-on-sun" style={{ paddingTop: safeTop(8) }}>
        <span aria-hidden className="pointer-events-none absolute -left-[30%] -top-[36%] aspect-square w-[84%] rounded-full bg-[rgb(255_255_255/0.3)]" />
        <div className="relative flex items-center gap-2">
          {canGoBack && (
            <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="-ml-2 grid h-11 w-11 place-items-center rounded-full">
              <ChevronLeft size={26} strokeWidth={2.3} aria-hidden />
            </motion.button>
          )}
          <Mark size={38} />
          <span className="display text-[22px] text-text">Vuffora</span>
        </div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.page} className="absolute -right-[13%] top-[18%] aspect-square w-[52%] overflow-hidden rounded-full bg-white shadow-[var(--shadow-floating)] ring-[7px] ring-white">
          <img src={img('goldenFace', 520)} alt="A golden retriever smiling with its tongue out" className="h-full w-full object-cover" />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative mt-5 max-w-[60%]">
          <h1 className="grot text-[clamp(30px,8.8vw,36px)] leading-[0.98]">
            Welcome <span className="swoosh swoosh-blue">back</span>
          </h1>
          <p className="mt-2.5 text-[14px] font-semibold leading-snug">Sign in to book a verified walker in Mohali, Chandigarh or Delhi NCR.</p>
          <div className="mt-3 flex items-center gap-1.5">
            <Star size={14} strokeWidth={0} fill="var(--ink)" aria-hidden />
            <span className="num text-[12px] font-extrabold">4.9</span>
            <span className="text-[12px] font-bold">from 3,180 walks this month</span>
          </div>
        </motion.div>
      </section>

      {/* white sheet lapping the hero */}
      <section className="relative z-10 -mt-9 rounded-t-[32px] bg-[var(--surface)] px-5 pt-5 shadow-[0_-16px_40px_-18px_rgb(14_27_87/0.3)]">
        <Segmented<Way>
          full
          tone="accent"
          value={way}
          onChange={(w) => {
            setWay(w)
            setTried(false)
          }}
          items={[
            { id: 'mobile', label: 'Mobile number' },
            { id: 'email', label: 'Email' },
          ]}
        />

        <motion.div key={way} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="mt-4 flex flex-col gap-3.5">
          {way === 'mobile' ? (
            <>
              <Input
                label="Mobile number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={phoneErr}
                hint="We send a 6-digit OTP by SMS. Standard rates apply."
                className="num font-bold tracking-[0.04em]"
                leading={
                  <span className="flex items-center gap-1.5 pr-2 text-[15px] font-extrabold text-text" style={{ boxShadow: 'inset -1px 0 0 var(--rule-strong)' }}>
                    <span aria-hidden className="grid h-5 w-7 overflow-hidden rounded-[4px]">
                      <span className="bg-[#FF9933]" />
                      <span className="bg-white" />
                      <span className="bg-[#138808]" />
                    </span>
                    {DEMO_OWNER_LOGIN.countryCode}
                  </span>
                }
                trailing={<MessageSquareText size={18} aria-hidden />}
              />
            </>
          ) : (
            <>
              <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={emailErr} leading={<Mail size={18} aria-hidden />} />
              <Input
                label="Password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passErr}
                leading={<LockKeyhole size={18} aria-hidden />}
                trailing={
                  <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-text-2">
                    {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                  </button>
                }
              />
              <button type="button" onClick={() => toast(`Reset link sent to ${email || DEMO_OWNER_LOGIN.email}`, 'info')} className="-mt-2 flex h-11 items-center self-end text-[13px] font-extrabold text-accent-ink">
                Forgot password?
              </button>
            </>
          )}
        </motion.div>

        {/* biometric lock: a tinted band, not another field */}
        <div className="relative mt-4 flex items-center gap-3 overflow-hidden rounded-[var(--r-card)] bg-ink p-3.5 text-on-ink">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[rgb(255_255_255/0.14)]">
            <Fingerprint size={22} strokeWidth={2.2} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[15px] font-extrabold">Biometric app lock</span>
            <span className="mt-0.5 block text-[12px] font-semibold text-on-ink-2">{biometric ? 'Face ID or fingerprint each time the app opens' : 'Off. Anyone with your phone can open the app'}</span>
          </span>
          <span className="relative">
            <Toggle
              on={biometric}
              label="Biometric app lock"
              onChange={(v) => {
                session.setBiometric(v)
                toast(v ? 'Biometric app lock on' : 'Biometric app lock off', v ? 'accent' : 'neutral')
              }}
            />
          </span>
        </div>

        <button type="button" role="checkbox" aria-checked={agree} onClick={() => setAgree((v) => !v)} className="mt-3 flex min-h-11 w-full items-center gap-3 text-left">
          <CheckMark on={agree} />
          <span className="text-[13px] font-semibold leading-snug text-text-2">
            I agree to Vuffora’s <span className="font-extrabold text-text">Terms of Service</span> and <span className="font-extrabold text-text">Privacy Policy</span>, including the handover OTP rules.
          </span>
        </button>

        <Button size="lg" block trailing={ArrowRight} className="mt-4" onClick={submit}>
          {way === 'mobile' ? 'Send OTP' : 'Sign in'}
        </Button>

        <p className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-[12px] font-semibold text-text-2">
          <ShieldCheck size={14} strokeWidth={2.4} className="shrink-0 text-accent-ink" aria-hidden />
          Your number stays private. Walkers only ever see your first name.
        </p>
      </section>
    </MobileScreen>
  )
}
