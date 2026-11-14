import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import type { ReactNode } from 'react'
import { face, type MediaKey } from '../data/media'
import { spring } from '../motion/springs'

/* A drawn city map for the demo (the real build uses the Google Maps SDK).
   Everything is placed on a 0–100 canvas: the SVG stretches to the box and
   the markers sit above it at the same percentages, so a point is in the
   same place at any size. Sector blocks, two main roads, a park, and
   labels from Mohali.

   MapCanvas props
     route      polyline to draw, as [x, y] points (0–100)
     progress   0–1, how much of the route is travelled; the travelled part
                is solid royal blue, the rest is dashed
     walker     avatar marker placed at `progress` along the route
     home       pin for the owner's address
     pins       extra markers (other walkers, other live walks)
     radius     search radius ring around a point
     children   anything else to float over the map (controls, cards) */

export type Pt = [number, number]

export type MapPin = {
  id: string
  x: number
  y: number
  photo?: MediaKey
  label?: string
  tone?: 'accent' | 'sun' | 'calm' | 'reactive' | 'ink' | 'muted'
  active?: boolean
  onClick?: () => void
  ariaLabel?: string
}

/** Length-accurate point at t (0–1) along a polyline. */
export function pointAt(route: Pt[], t: number): Pt {
  if (route.length === 0) return [50, 50]
  const seg = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1]))
  const total = seg.reduce((a, b) => a + b, 0)
  let d = Math.max(0, Math.min(1, t)) * total
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] === 0 ? 0 : Math.min(1, d / seg[i])
      return [route[i][0] + (route[i + 1][0] - route[i][0]) * k, route[i][1] + (route[i + 1][1] - route[i][1]) * k]
    }
    d -= seg[i]
  }
  return route[route.length - 1]
}

/** The part of a polyline travelled at t, as points. */
export function routeUntil(route: Pt[], t: number): Pt[] {
  if (t <= 0) return [route[0]]
  const seg = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1]))
  const total = seg.reduce((a, b) => a + b, 0)
  let d = Math.min(1, t) * total
  const out: Pt[] = [route[0]]
  for (let i = 0; i < seg.length; i++) {
    if (d >= seg[i]) {
      out.push(route[i + 1])
      d -= seg[i]
    } else {
      const k = seg[i] === 0 ? 0 : d / seg[i]
      out.push([route[i][0] + (route[i + 1][0] - route[i][0]) * k, route[i][1] + (route[i + 1][1] - route[i][1]) * k])
      break
    }
  }
  return out
}

const d = (pts: Pt[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')

const GRID = [8, 20, 32, 44, 56, 68, 80, 92]
const LABELS: { x: number; y: number; text: string }[] = [
  { x: 26, y: 79, text: 'SECTOR 70' },
  { x: 14, y: 44, text: 'SECTOR 69' },
  { x: 38, y: 91, text: 'SECTOR 71' },
  { x: 86, y: 12, text: 'PHASE 7' },
  { x: 66, y: 34, text: 'CITY PARK' },
  { x: 86, y: 70, text: 'PHASE 3B2' },
]

const PIN_TONE: Record<NonNullable<MapPin['tone']>, { bg: string; fg: string }> = {
  accent: { bg: 'var(--accent)', fg: '#fff' },
  sun: { bg: 'var(--sun)', fg: 'var(--on-sun)' },
  calm: { bg: 'var(--calm)', fg: '#fff' },
  reactive: { bg: 'var(--reactive)', fg: '#fff' },
  ink: { bg: 'var(--ink)', fg: '#fff' },
  muted: { bg: 'var(--paper-400)', fg: 'var(--text)' },
}

export function MapCanvas({
  className = '',
  route,
  progress = 0,
  walker,
  home,
  pins = [],
  radius,
  labels = true,
  dim = false,
  children,
}: {
  className?: string
  route?: Pt[]
  progress?: number
  walker?: { photo: MediaKey; label?: string }
  home?: Pt
  pins?: MapPin[]
  radius?: { x: number; y: number; r: number }
  labels?: boolean
  /** soften the map (when a sheet sits over it) */
  dim?: boolean
  children?: ReactNode
}) {
  const at = route ? pointAt(route, progress) : null
  const done = route ? routeUntil(route, progress) : null
  return (
    <div className={`relative overflow-hidden bg-[#eef1f6] ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <rect width="100" height="100" fill="#eef1f6" />
        {/* sector blocks */}
        {GRID.slice(0, -1).map((gx, i) =>
          GRID.slice(0, -1).map((gy, j) => (
            <rect key={`${i}-${j}`} x={gx + 0.9} y={gy + 0.9} width={GRID[i + 1] - gx - 1.8} height={GRID[j + 1] - gy - 1.8} rx="1.2" fill={(i + j) % 3 === 0 ? '#e3e8f2' : '#e8ecf4'} />
          )),
        )}
        {/* the park and a pond */}
        <rect x="57" y="27" width="22" height="22" rx="3" fill="#cfead8" />
        <ellipse cx="72" cy="42" rx="4.2" ry="2.6" fill="#b9dcf2" />
        <rect x="9" y="81" width="10" height="10" rx="2" fill="#d6ecdc" />
        {/* minor roads */}
        {GRID.map((g) => (
          <g key={g}>
            <line x1={g} y1="0" x2={g} y2="100" stroke="#ffffff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1={g} x2="100" y2={g} stroke="#ffffff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
        {/* two main roads */}
        <line x1="0" y1="56" x2="100" y2="56" stroke="#ffffff" strokeWidth="7" vectorEffect="non-scaling-stroke" />
        <line x1="44" y1="0" x2="44" y2="100" stroke="#ffffff" strokeWidth="7" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="56" x2="100" y2="56" stroke="#ffd43b" strokeWidth="1" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" opacity="0.9" />
        <line x1="44" y1="0" x2="44" y2="100" stroke="#ffd43b" strokeWidth="1" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" opacity="0.9" />
        {radius && <ellipse cx={radius.x} cy={radius.y} rx={radius.r} ry={radius.r} fill="rgb(35 72 214 / 0.08)" stroke="#2348d6" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
        {route && (
          <>
            <path d={d(route)} fill="none" stroke="#2348d6" strokeOpacity="0.35" strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {done && done.length > 1 && (
              <>
                <path d={d(done)} fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d={d(done)} fill="none" stroke="#2348d6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </>
            )}
          </>
        )}
      </svg>

      {dim && <div className="pointer-events-none absolute inset-0 bg-[rgb(238_241_246/0.45)]" />}

      {labels &&
        LABELS.map((l) => (
          <span key={l.text} aria-hidden className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-extrabold tracking-[0.12em] text-[#7c86a6]" style={{ left: `${l.x}%`, top: `${l.y}%` }}>
            {l.text}
          </span>
        ))}

      {home && (
        <span className="pointer-events-none absolute z-[2] -translate-x-1/2 -translate-y-full" style={{ left: `${home[0]}%`, top: `${home[1]}%` }} aria-label="Home">
          <span className="grid h-9 w-9 place-items-center rounded-full rounded-bl-none bg-ink text-on-ink shadow-[var(--shadow-floating)] ring-[3px] ring-white" style={{ transform: 'rotate(-45deg)' }}>
            <Home size={16} strokeWidth={2.4} style={{ transform: 'rotate(45deg)' }} aria-hidden />
          </span>
        </span>
      )}

      {pins.map((p) => {
        const tone = PIN_TONE[p.tone ?? 'accent']
        const inner = p.photo ? (
          <span className="relative block rounded-full" style={{ padding: 3, background: p.active ? 'var(--sun)' : '#fff', boxShadow: 'var(--shadow-floating)' }}>
            <img src={face(p.photo, 96)} alt="" className="block rounded-full object-cover" style={{ width: p.active ? 44 : 34, height: p.active ? 44 : 34 }} />
            {p.label && <span className="num absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[10px] font-extrabold shadow-[var(--shadow-raised)]" style={{ background: tone.bg, color: tone.fg }}>{p.label}</span>}
          </span>
        ) : (
          <span className="num block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-[var(--shadow-floating)] ring-2 ring-white" style={{ background: tone.bg, color: tone.fg }}>
            {p.label}
          </span>
        )
        const style = { left: `${p.x}%`, top: `${p.y}%`, zIndex: p.active ? 4 : 3 }
        return p.onClick ? (
          <motion.button key={p.id} type="button" onClick={p.onClick} aria-label={p.ariaLabel ?? p.label ?? 'Map pin'} whileTap={{ scale: 0.92 }} transition={spring.ui} className="absolute -translate-x-1/2 -translate-y-1/2 p-1.5" style={style}>
            {inner}
          </motion.button>
        ) : (
          <span key={p.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={style}>
            {inner}
          </span>
        )
      })}

      {walker && at && (
        <motion.span className="pointer-events-none absolute z-[5]" initial={false} animate={{ left: `${at[0]}%`, top: `${at[1]}%` }} transition={{ duration: 0.9, ease: 'linear' }} style={{ translateX: '-50%', translateY: '-50%' }}>
          <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-[rgb(255_198_5/0.5)]" style={{ animationDuration: '2.2s' }} aria-hidden />
          <span className="relative block rounded-full bg-sun p-[3.5px] shadow-[var(--shadow-floating)]">
            <img src={face(walker.photo, 112)} alt="" className="block h-11 w-11 rounded-full object-cover ring-2 ring-white" />
          </span>
          {walker.label && <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 text-[10px] font-extrabold text-on-ink shadow-[var(--shadow-raised)]">{walker.label}</span>}
        </motion.span>
      )}

      {children}
    </div>
  )
}
