import { motion } from 'framer-motion'
import { BadgeCheck, Leaf, ShieldAlert, ShieldCheck, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { TEMPERAMENT, type Temperament } from '../data/cast'
import { BRAND } from '../data/media'
import { spring } from '../motion/springs'

/* The Vuffora brand pieces used on every platform.

   Mark:        the client's logo mark (dog on the yellow blob), as supplied.
   Wordmark:    Mark + "Vuffora" set in Fredoka like the logo.
   TemperBadge: Calm (green, leaf) vs Aggressive (coral, shield). Always
                icon + label, never colour alone.
   Certified:   the Aggressive Breed Certified pill.
   Verified:    the verified tick.
   Price:       an INR figure with the ₹ set smaller, optional swoosh.
   Figure:      a display number with a small unit.
   Stars:       rating as a star + number.
   StatusPill:  Under Review / Approved / Rejected and Open / In Progress / Resolved.
   Stub:        a ticket stub with a notch (bookings, invoices).
   Bar:         a thin progress bar without a heavy track. */

export function Mark({ size = 28, className = '' }: { size?: number; className?: string; tone?: string }) {
  return <img src={BRAND.mark} alt="" width={size} height={size} draggable={false} className={`shrink-0 select-none object-contain ${className}`} style={{ width: size, height: size }} />
}

/** The app icon as a rounded tile (welcome screens, sign-in, sidebar). */
export function AppIcon({ size = 64, variant = 'yellow', className = '' }: { size?: number; variant?: 'yellow' | 'dark' | 'paw' | 'v'; className?: string }) {
  const src = variant === 'dark' ? BRAND.iconDark : variant === 'paw' ? BRAND.iconPaw : variant === 'v' ? BRAND.iconV : BRAND.iconYellow
  return <img src={src} alt="Vuffora" width={size} height={size} draggable={false} className={`shrink-0 select-none shadow-[var(--shadow-raised)] ${className}`} style={{ width: size, height: size, borderRadius: size * 0.235 }} />
}

export function Wordmark({ size = 22, tone = 'ink', className = '', mark = true }: { size?: number; tone?: 'ink' | 'light'; className?: string; mark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {mark && <Mark size={Math.round(size * 1.5)} />}
      <span className={`display ${tone === 'light' ? 'text-white' : 'text-text'}`} style={{ fontSize: size }}>
        Vuffora
      </span>
    </span>
  )
}

export const TEMPER_TONE: Record<Temperament, { fill: string; soft: string; onSoft: string; text: string }> = {
  calm: { fill: 'var(--calm)', soft: 'var(--calm-soft)', onSoft: 'var(--on-calm-soft)', text: 'var(--calm-text)' },
  reactive: { fill: 'var(--reactive)', soft: 'var(--reactive-soft)', onSoft: 'var(--on-reactive-soft)', text: 'var(--reactive-text)' },
}

/** Calm / Aggressive badge. `solid` for use over photos and dark surfaces. */
export function TemperBadge({ t, size = 'sm', solid = false, full = false, className = '' }: { t: Temperament; size?: 'sm' | 'md'; solid?: boolean; full?: boolean; className?: string }) {
  const tone = TEMPER_TONE[t]
  const Icon = t === 'calm' ? Leaf : ShieldAlert
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-extrabold uppercase tracking-[0.06em] ${size === 'md' ? 'h-7 px-3 text-[12px]' : 'h-6 px-2.5 text-[11px]'} ${className}`}
      style={solid ? { background: tone.fill, color: '#fff' } : { background: tone.soft, color: tone.onSoft }}
    >
      <Icon size={size === 'md' ? 14 : 12} strokeWidth={2.6} aria-hidden />
      {full ? TEMPERAMENT[t].label : TEMPERAMENT[t].short}
    </span>
  )
}

/** Aggressive Breed Certified pill (walker badge). */
export function Certified({ short = false, tone = 'paper', className = '' }: { short?: boolean; tone?: 'paper' | 'ink'; className?: string }) {
  return (
    <span className={`inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[11px] font-extrabold ${tone === 'ink' ? 'bg-[rgb(255_255_255/0.16)] text-white' : 'text-accent-ink'} ${className}`} style={tone === 'paper' ? { boxShadow: 'inset 0 0 0 1.5px var(--accent)' } : undefined}>
      <ShieldCheck size={12} strokeWidth={2.6} aria-hidden />
      {short ? 'Certified' : 'Aggressive Breed Certified'}
    </span>
  )
}

export function Verified({ size = 16, label = true, tone = 'accent', className = '' }: { size?: number; label?: boolean; tone?: 'accent' | 'light' | 'sun'; className?: string }) {
  const color = tone === 'light' ? 'text-white' : tone === 'sun' ? 'text-sun-light' : 'text-accent-ink'
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] font-bold ${color} ${className}`}>
      <BadgeCheck size={size} strokeWidth={2.4} aria-hidden />
      {label && 'Verified'}
    </span>
  )
}

/** ₹349 with the rupee sign set smaller. `swoosh` draws the yellow underline from the logo. */
export function Price({ amount, size = 34, per, swoosh = false, className = '', tone }: { amount: number; size?: number; per?: string; swoosh?: boolean; className?: string; tone?: string }) {
  return (
    <span className={`figure inline-flex items-baseline whitespace-nowrap ${className}`} style={{ fontSize: size, color: tone }}>
      <span className={swoosh ? 'swoosh' : ''}>
        <span style={{ fontSize: '0.58em', fontWeight: 600, marginRight: '0.04em' }}>₹</span>
        {Math.round(amount).toLocaleString('en-IN')}
      </span>
      {per && <span className="ml-1 text-[0.36em] font-bold tracking-normal" style={{ fontFamily: 'var(--font-text)' }}>{per}</span>}
    </span>
  )
}

export function Figure({ value, unit, size = 56, className = '', tone }: { value: ReactNode; unit?: string; size?: number; className?: string; tone?: string }) {
  return (
    <span className={`figure inline-flex items-baseline whitespace-nowrap ${className}`} style={{ fontSize: size, color: tone }}>
      {value}
      {unit && <span className="unit" style={{ verticalAlign: 'baseline', fontSize: '0.34em', marginLeft: '0.18em' }}>{unit}</span>}
    </span>
  )
}

export function Stars({ rating, count, size = 13, tone = 'paper', className = '' }: { rating: number; count?: number; size?: number; tone?: 'paper' | 'ink'; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-bold ${tone === 'ink' ? 'text-white' : 'text-text'} ${className}`} style={{ fontSize: size }}>
      <Star size={size + 1} strokeWidth={0} fill="var(--sun)" aria-hidden />
      <span className="num">{rating.toFixed(1)}</span>
      {count !== undefined && <span className={`num font-semibold ${tone === 'ink' ? 'text-on-ink-2' : 'text-text-2'}`}>({count})</span>}
    </span>
  )
}

export function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5" role="img" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} strokeWidth={0} fill={i <= Math.round(rating) ? 'var(--sun)' : 'var(--paper-300)'} aria-hidden />
      ))}
    </span>
  )
}

export type StatusKind = 'review' | 'approved' | 'rejected' | 'expiring' | 'open' | 'progress' | 'resolved' | 'pending' | 'paid' | 'live' | 'verified' | 'missing'
const STATUS: Record<StatusKind, { label: string; cls: string }> = {
  review: { label: 'Under Review', cls: 'bg-warn-soft text-[var(--on-warn-soft)]' },
  pending: { label: 'Pending', cls: 'bg-warn-soft text-[var(--on-warn-soft)]' },
  expiring: { label: 'Expiring soon', cls: 'bg-warn-soft text-[var(--on-warn-soft)]' },
  progress: { label: 'In Progress', cls: 'bg-warn-soft text-[var(--on-warn-soft)]' },
  approved: { label: 'Approved', cls: 'bg-success-soft text-[var(--on-success-soft)]' },
  verified: { label: 'Verified', cls: 'bg-success-soft text-[var(--on-success-soft)]' },
  resolved: { label: 'Resolved', cls: 'bg-success-soft text-[var(--on-success-soft)]' },
  paid: { label: 'Paid', cls: 'bg-success-soft text-[var(--on-success-soft)]' },
  rejected: { label: 'Rejected', cls: 'bg-danger-soft text-[var(--on-danger-soft)]' },
  missing: { label: 'Missing', cls: 'bg-danger-soft text-[var(--on-danger-soft)]' },
  open: { label: 'Open', cls: 'bg-accent-soft text-[var(--on-accent-soft)]' },
  live: { label: 'Live', cls: 'bg-accent text-on-accent' },
}
/** Status as a pill with a dot. Label can be overridden; the colour never carries the meaning alone. */
export function StatusPill({ kind, label, className = '' }: { kind: StatusKind; label?: string; className?: string }) {
  const s = STATUS[kind]
  return (
    <span className={`inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em] ${s.cls} ${className}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full bg-current ${kind === 'live' ? 'animate-pulse' : ''}`} />
      {label ?? s.label}
    </span>
  )
}

/** A ticket stub with a notch on each side. */
export function Stub({ top, bottom, tone = 'surface', className = '' }: { top: ReactNode; bottom: ReactNode; tone?: 'surface' | 'ink' | 'sun'; className?: string }) {
  const bg = tone === 'ink' ? 'bg-ink text-on-ink' : tone === 'sun' ? 'bg-sun text-on-sun' : 'bg-[var(--surface)] text-text'
  return (
    <div className={`relative rounded-[var(--r-card)] shadow-[var(--shadow-raised)] ${bg} ${className}`}>
      <div className="p-4">{top}</div>
      <div className="relative h-0">
        <span aria-hidden className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[var(--bg)]" />
        <span aria-hidden className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-[var(--bg)]" />
        <div className={`mx-5 ${tone === 'ink' ? 'perf-ink' : 'perf'}`} />
      </div>
      <div className="p-4">{bottom}</div>
    </div>
  )
}

export function Bar({ value, tone = 'accent', height = 6, className = '', track }: { value: number; tone?: 'accent' | 'sun' | 'ink' | 'danger' | 'calm'; height?: number; className?: string; track?: string }) {
  const fill = tone === 'sun' ? 'var(--sun)' : tone === 'ink' ? 'var(--ink)' : tone === 'danger' ? 'var(--danger)' : tone === 'calm' ? 'var(--calm)' : 'var(--accent)'
  return (
    <span className={`relative block w-full overflow-hidden rounded-full ${className}`} style={{ height, background: track ?? 'var(--surface-high)' }} role="img" aria-label={`${Math.round(value)}%`}>
      <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ background: fill, width: '100%', transformOrigin: 'left' }} initial={{ scaleX: 0 }} animate={{ scaleX: Math.max(0, Math.min(1, value / 100)) }} transition={spring.page} />
    </span>
  )
}
