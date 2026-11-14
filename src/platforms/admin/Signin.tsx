import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useRef, useState } from 'react'
import { Avatar, AvatarStack } from '../../components/Avatar'
import { Mark } from '../../components/Brand'
import { Button } from '../../components/Button'
import { CheckMark, Field, Input } from '../../components/Form'
import { ADMIN, CITIES } from '../../data/cast'
import { CLOCK } from '../../data/clock'
import { DEMO_ADMIN } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { openSupport, pendingVet, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { fadeUp, listItem, listParent } from '../../motion/transitions'

/* Admin sign in. A full-frame split: the ink brand panel with the sun
   disc, a photo and three live figures on the left; the pre-filled form
   (email, password, role, 2-step code) on the right. Stacks on phones. */

const ROLES = ['Super Admin', 'Compliance Officer', 'Support Agent', 'Finance']
const WALKS_TODAY = 64

export default function AdminSignin() {
  const { reset, toast } = useNav()
  const pending = useSession(pendingVet)
  const support = useSession(openSupport)
  const stage = useSession((s) => s.stage)
  const [email, setEmail] = useState(DEMO_ADMIN.email)
  const [password, setPassword] = useState(DEMO_ADMIN.password)
  const [show, setShow] = useState(false)
  const [role, setRole] = useState(DEMO_ADMIN.role)
  const [remember, setRemember] = useState(DEMO_ADMIN.remember)
  const [otp, setOtp] = useState<string[]>(DEMO_ADMIN.otp)
  const [error, setError] = useState('')
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  const signIn = () => {
    if (!email.trim() || !password.trim()) return setError('Enter your work email and password to continue.')
    if (otp.some((d) => !d)) return setError('Enter all 6 digits of the 2-step code.')
    setError('')
    toast(`Welcome back, ${ADMIN.first}`, 'accent')
    reset('admin.overview')
  }

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1)
    setOtp((o) => o.map((x, k) => (k === i ? d : x)))
    if (d && i < 5) boxes.current[i + 1]?.focus()
  }

  const live = WALKS_TODAY + (stage === 'walking' ? 1 : 0)

  return (
    <div data-admin-root className="scroll-y relative flex h-full bg-[var(--surface)] max-md:flex-col">
      {/* brand panel */}
      <section className="relative flex w-[54%] shrink-0 flex-col overflow-hidden bg-ink p-10 text-on-ink max-md:w-full max-md:px-5 max-md:pb-6" style={{ paddingTop: 'max(40px, calc(var(--safe-top, 0px) + 18px))' }}>
        <span aria-hidden className="sun -right-[16%] -top-[34%] w-[62%]" />
        <span aria-hidden className="sun-blue -bottom-[30%] -left-[18%] w-[52%]" />
        <span aria-hidden className="dots-light" />

        <div className="relative flex items-center gap-3">
          <Mark size={52} />
          <span className="leading-none">
            <span className="display block text-[30px] text-white">Vuffora</span>
            <span className="label mt-1 block text-sun-light">Admin</span>
          </span>
        </div>

        <motion.div variants={listParent} initial="hidden" animate="show" className="relative mt-auto max-md:mt-6">
          {/* the photo, cut as a rounded block that the headline laps */}
          <motion.div variants={fadeUp} className="relative h-[250px] w-[78%] overflow-hidden rounded-[var(--r-container)] shadow-[var(--shadow-floating)] max-md:h-[150px] max-md:w-full">
            <img src={img('walkerPack', 1100)} alt="A walker with a pack of leashed dogs on a plaza" className="h-full w-full object-cover" style={{ objectPosition: '50% 60%' }} />
            <div className="scrim-b pointer-events-none absolute inset-0" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2.5">
              <AvatarStack people={['arjun', 'gurpreet', 'pooja', 'imran']} size={30} />
              <span className="text-[13px] font-bold text-white">214 verified walkers across {CITIES.length} cities</span>
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp} className="grot relative -mt-1 pt-7 text-[46px] leading-[0.98] text-white max-md:pt-5 max-md:text-[32px]">
            Every walk, every document, <span className="swoosh">one desk.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 max-w-[46ch] text-[15px] font-medium text-on-ink-2 max-md:text-[14px]">
            Vetting, walker KYC, one inbox for owners and walkers, and every live walk with its OTP handover times.
          </motion.p>

          <motion.dl variants={listParent} className="mt-8 flex items-end gap-10 max-md:mt-5 max-md:gap-6">
            {[
              { label: 'Walks today', value: live, sub: `as of ${CLOCK.time}` },
              { label: 'Pending vetting', value: pending, sub: 'certificates in queue' },
              { label: 'Cities', value: CITIES.length, sub: 'Mohali, Chandigarh, NCR' },
            ].map((f) => (
              <motion.div key={f.label} variants={listItem} className="min-w-0">
                <dt className="label text-on-ink-2">{f.label}</dt>
                <dd className="figure mt-1.5 text-[56px] text-sun-light max-md:text-[40px]">{f.value}</dd>
                <dd className="mt-1 text-[12px] font-semibold text-on-ink-2 max-md:text-[11px]">{f.sub}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>
      </section>

      {/* form */}
      <section className="relative flex min-w-0 flex-1 flex-col justify-center px-16 py-8 max-md:px-5 max-md:py-7" style={{ paddingBottom: 'max(28px, calc(var(--safe-bottom, 0px) + var(--chrome-space, 0px) + 20px))' }}>
        <div className="mx-auto w-full max-w-[420px]">
          <div className="flex items-center gap-3">
            <Avatar who={ADMIN.photo} size={52} ring />
            <div className="min-w-0 leading-tight">
              <p className="label text-text-2">Signing in as</p>
              <p className="truncate text-[17px] font-extrabold">{ADMIN.name}</p>
            </div>
            <span className="ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[var(--on-success-soft)]">
              <ShieldCheck size={13} strokeWidth={2.6} aria-hidden /> SSO ready
            </span>
          </div>

          <h2 className="grot mt-6 text-[34px] max-md:text-[28px]">Sign in to the console</h2>
          <p className="mt-1.5 text-[14px] font-medium text-text-2">
            {pending} certificates and {support} support threads are waiting this morning.
          </p>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              signIn()
            }}
          >
            <Input label="Work email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} leading={<Mail size={17} aria-hidden />} />
            <Input
              label="Password"
              type={show ? 'text' : 'password'}
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leading={<Lock size={17} aria-hidden />}
              trailing={
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="grid h-9 w-9 place-items-center rounded-full">
                  {show ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
                </button>
              }
            />

            <div className="grid grid-cols-[1fr_auto] items-end gap-3 max-md:grid-cols-1">
              <Field label="Role" htmlFor="admin-role">
                <div className="well relative flex h-12 items-center rounded-[var(--r-control)] ring-1 ring-inset ring-[var(--rule-strong)] focus-within:ring-2 focus-within:ring-[var(--accent)]">
                  <select id="admin-role" value={role} onChange={(e) => setRole(e.target.value)} className="h-full w-full appearance-none bg-transparent pl-3.5 pr-10 text-[15px] font-semibold outline-none">
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown size={17} className="pointer-events-none absolute right-3.5 text-text-2" aria-hidden />
                </div>
              </Field>
              <button type="button" role="checkbox" aria-checked={remember} onClick={() => setRemember((v) => !v)} className="flex h-12 items-center gap-2.5 rounded-[var(--r-control)] px-1 text-[14px] font-semibold">
                <CheckMark on={remember} /> Remember this device
              </button>
            </div>

            <Field label="2-step code" hint="Sent to the authenticator app on Kavya’s phone. Valid for 30 seconds.">
              <div className="flex items-center gap-2">
                <span className="grid h-12 w-10 shrink-0 place-items-center text-text-2 max-md:hidden">
                  <KeyRound size={19} aria-hidden />
                </span>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { boxes.current[i] = el }}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit ${i + 1}`}
                    className={`figure well h-12 min-w-0 flex-1 rounded-[var(--r-control)] text-center text-[24px] outline-none ring-1 ring-inset ring-[var(--rule-strong)] focus:ring-2 focus:ring-[var(--accent)] ${i === 3 ? 'ml-2' : ''}`}
                  />
                ))}
              </div>
            </Field>

            {error && <p className="text-[13px] font-semibold text-danger-text">{error}</p>}

            <Button type="submit" size="lg" block trailing={ArrowRight} className="mt-1 !flex-none">
              Sign in
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between gap-3 text-[13px] font-semibold">
            <motion.button type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => toast(`Reset link sent to ${email || DEMO_ADMIN.email}`, 'accent')} className="h-11 text-accent-ink">
              Forgot password?
            </motion.button>
            <motion.button type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => toast('A new 2-step code is on its way', 'neutral')} className="h-11 text-accent-ink">
              Resend code
            </motion.button>
          </div>
          <p className="mt-2 text-[12px] font-medium text-text-2">Demo account. Sessions end after 30 minutes without activity. Every decision is written to the audit log.</p>
        </div>
      </section>
    </div>
  )
}
