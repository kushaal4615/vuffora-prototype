import { motion, useAnimationControls } from 'framer-motion'
import { Check, Delete, LockKeyhole, ShieldCheck, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { mmss } from '../data/clock'
import { spring, tap } from '../motion/springs'

/* The dual-OTP handover, both halves.

   OtpPanel   (Owner App) shows the 4-digit code the owner reads out, with
              a live expiry countdown. kind="in" is the yellow Check-In
              panel; kind="out" is the royal-blue Check-Out panel.
   OtpKeypad  (Walker App) four boxes and a number pad. It mounts with the
              right code already entered (zero typing), so Verify works on
              the first tap; the visitor can clear and retype, and a wrong
              code shakes and turns coral. */

export function OtpPanel({ kind, code, ttlMin = 10, verified = false, className = '' }: { kind: 'in' | 'out'; code: string; ttlMin?: number; verified?: boolean; className?: string }) {
  const [left, setLeft] = useState(ttlMin * 60 - 14)
  useEffect(() => {
    if (verified) return
    const t = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : ttlMin * 60)), 1000)
    return () => window.clearInterval(t)
  }, [verified, ttlMin])
  const blue = kind === 'out'
  return (
    <div className={`relative overflow-hidden rounded-[var(--r-container)] p-5 ${blue ? 'bg-accent text-on-accent shadow-[var(--glow-accent)]' : 'bg-sun text-on-sun shadow-[var(--glow-sun)]'} ${className}`}>
      <span aria-hidden className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full ${blue ? 'bg-[rgb(255_255_255/0.12)]' : 'bg-[rgb(255_255_255/0.35)]'}`} />
      <div className="relative flex items-center justify-between gap-3">
        <span className="label flex items-center gap-1.5">
          <LockKeyhole size={13} strokeWidth={2.6} aria-hidden />
          {kind === 'in' ? 'Check-In OTP · pickup' : 'Check-Out OTP · drop-off'}
        </span>
        {verified ? (
          <span className={`flex h-6 items-center gap-1 rounded-full px-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em] ${blue ? 'bg-white text-accent-ink' : 'bg-ink text-on-ink'}`}>
            <Check size={12} strokeWidth={3} aria-hidden /> Verified
          </span>
        ) : (
          <span className="meta flex items-center gap-1 text-[12px] font-semibold">
            <Timer size={13} aria-hidden /> {mmss(left)}
          </span>
        )}
      </div>
      <div className="relative mt-3 flex gap-2.5" role="img" aria-label={`OTP ${code.split('').join(' ')}`}>
        {code.split('').map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring.pop, delay: 0.05 * i }}
            className={`figure num grid h-[68px] flex-1 place-items-center rounded-[18px] text-[44px] ${blue ? 'bg-[rgb(255_255_255/0.16)] text-white' : 'bg-white text-text'}`}
          >
            {ch}
          </motion.span>
        ))}
      </div>
      <p className={`relative mt-3 flex items-center gap-1.5 text-[13px] font-semibold ${blue ? 'text-[var(--on-accent-2)]' : 'text-text'}`}>
        <ShieldCheck size={15} strokeWidth={2.3} aria-hidden />
        {verified ? (kind === 'in' ? 'Custody handed to your walker. The timer is running.' : 'Your dog is home. The session is closed.') : 'Share with your walker only, at the door.'}
      </p>
    </div>
  )
}

export function OtpKeypad({ expected, initial, onVerified, label = 'Verify OTP', tone = 'accent' }: { expected: string; initial?: string; onVerified: () => void; label?: string; tone?: 'accent' | 'sun' }) {
  const [code, setCode] = useState(initial ?? expected)
  const [error, setError] = useState(false)
  const [ok, setOk] = useState(false)
  const shake = useAnimationControls()

  const press = (k: string) => {
    if (ok) return
    setError(false)
    if (k === 'del') return setCode((c) => c.slice(0, -1))
    setCode((c) => (c.length >= 4 ? c : c + k))
  }
  const verify = () => {
    if (ok) return
    if (code !== expected) {
      setError(true)
      shake.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.36 } })
      return
    }
    setOk(true)
    window.setTimeout(onVerified, 650)
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div animate={shake} className="flex gap-3" role="group" aria-label="4-digit OTP">
        {[0, 1, 2, 3].map((i) => {
          const ch = code[i] ?? ''
          const focus = i === code.length && !ok
          return (
            <span
              key={i}
              className={`figure num grid h-[68px] w-[60px] place-items-center rounded-[18px] bg-[var(--surface)] text-[38px] transition-shadow duration-150 ${ok ? 'text-calm-ink' : error ? 'text-danger-text' : 'text-text'}`}
              style={{ boxShadow: ok ? 'inset 0 0 0 2.5px var(--calm)' : error ? 'inset 0 0 0 2.5px var(--danger)' : focus ? 'inset 0 0 0 2.5px var(--accent)' : 'inset 0 0 0 1.5px var(--rule-strong)' }}
            >
              {ch}
            </span>
          )
        })}
      </motion.div>
      <p className={`mt-3 h-5 text-[13px] font-bold ${error ? 'text-danger-text' : ok ? 'text-calm-ink' : 'text-text-2'}`} aria-live="polite">
        {ok ? 'OTP matched' : error ? (code.length < 4 ? 'Enter all 4 digits from the owner’s screen' : 'That code does not match. Ask the owner to read it again.') : 'Ask the owner for the code on their screen'}
      </p>
      <div className="mt-3 grid w-full max-w-[300px] grid-cols-3 gap-2.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clr', '0', 'del'].map((k) => (
          <motion.button
            key={k}
            type="button"
            whileTap={tap}
            transition={spring.ui}
            onClick={() => (k === 'clr' ? (setCode(''), setError(false)) : press(k))}
            aria-label={k === 'del' ? 'Delete' : k === 'clr' ? 'Clear' : k}
            className={`figure num grid h-[54px] place-items-center rounded-[16px] text-[24px] ${k === 'clr' || k === 'del' ? 'bg-transparent text-text-2' : 'bg-[var(--surface)] text-text shadow-[var(--shadow-raised)]'}`}
          >
            {k === 'del' ? <Delete size={22} aria-hidden /> : k === 'clr' ? <span className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-text)' }}>Clear</span> : k}
          </motion.button>
        ))}
      </div>
      <motion.button
        type="button"
        whileTap={tap}
        transition={spring.ui}
        onClick={verify}
        className={`mt-4 flex h-[56px] w-full max-w-[300px] items-center justify-center gap-2 rounded-full text-[16px] font-bold ${ok ? 'bg-calm text-white' : tone === 'sun' ? 'bg-sun text-on-sun shadow-[var(--glow-sun)]' : 'bg-accent text-on-accent shadow-[var(--glow-accent)]'}`}
      >
        {ok ? (
          <>
            <Check size={20} strokeWidth={3} aria-hidden /> Verified
          </>
        ) : (
          label
        )}
      </motion.button>
    </div>
  )
}
