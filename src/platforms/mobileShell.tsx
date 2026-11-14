import { motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, House, LifeBuoy, MapPinned, MessageCircle, ReceiptText, User, Wallet, type LucideIcon } from 'lucide-react'
import { forwardRef, useState, type MouseEvent, type ReactNode } from 'react'
import { platformOf, useNav, type MobileScreenId, type Platform } from '../lib/navigation'
import { spring, tap } from '../motion/springs'
import { track } from '../lib/tracker'
import { useSession } from '../lib/store'

/* The mobile shell shared by the two phone apps (Dog Owner, Dog Walker).

   Safe areas are CSS variables so the same screen works inside the desktop
   iPhone frame (59px / 34px, set by IPhone16Pro) and on a real phone in the
   phone-browser view (env(safe-area-inset-*), set by MobileViewer).
   --chrome-space is extra room the phone viewer reserves for its controls. */
export const SAFE_TOP = 'var(--safe-top, 59px)'
export const SAFE_BOTTOM = 'var(--safe-bottom, 34px)'
export const TABBAR_H = 64
export const safeTop = (px: number) => `calc(var(--safe-top, 59px) + ${px}px)`
export const safeBottom = (px: number) => `calc(var(--safe-bottom, 34px) + ${px}px)`

/** Tab ids across the two apps. Each app's tab bar only shows its own five. */
export type TabId =
  | 'home' | 'discover' | 'bookings' | 'chats' | 'account' // Dog Owner App
  | 'today' | 'schedule' | 'earnings' | 'help' | 'profile' // Dog Walker App

type ScreenProps = {
  children: ReactNode
  header?: ReactNode
  tab?: TabId
  bg?: string
  dock?: ReactNode
  overlay?: ReactNode
  /** pad the scroll content for the tab bar / dock (default true) */
  padBottom?: boolean
  /** colour of the status-bar cap that fades in once content scrolls under it (screens whose hero runs behind the status bar) */
  cap?: string
  /** extra bottom room for a dock taller than the default (px) */
  dockHeight?: number
  /** make the scroller a size container so children can use cqh units (full-height heroes) */
  sizeContainer?: boolean
}

/** The standard mobile screen: header outside the scroller, tab bar or action dock below. */
export const MobileScreen = forwardRef<HTMLDivElement, ScreenProps>(function MobileScreen({ children, header, tab, bg = 'var(--bg)', dock, overlay, padBottom = true, cap, dockHeight = 78, sizeContainer = false }, ref) {
  const [under, setUnder] = useState(false)
  return (
    <div data-screen-root className="relative flex h-full flex-col" style={{ background: bg }}>
      {header}
      {cap && <StatusCap color={cap} show={under} />}
      <main
        ref={ref}
        onScroll={
          cap
            ? (e) => {
                const past = e.currentTarget.scrollTop > 24
                if (past !== under) setUnder(past)
              }
            : undefined
        }
        className="scroll-y relative min-h-0 flex-1"
        style={{ containerType: sizeContainer ? 'size' : undefined, paddingBottom: padBottom ? `calc(${tab ? safeBottom(TABBAR_H + 12 + (dock ? dockHeight : 0)) : dock ? safeBottom(dockHeight) : safeBottom(16)} + var(--chrome-space, 0px))` : 0 }}
      >
        {children}
      </main>
      {dock && (
        <div className="pointer-events-none absolute inset-x-0 z-20" style={{ bottom: tab ? safeBottom(TABBAR_H - 4) : 0 }}>
          {dock}
        </div>
      )}
      {tab && <AppTabBar active={tab} />}
      {overlay}
    </div>
  )
})

/** Solid band behind the status bar, faded in once content scrolls under it. */
export function StatusCap({ color, show }: { color: string; show: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-30"
      style={{ height: SAFE_TOP, background: color, boxShadow: '0 6px 18px -10px rgb(14 27 87 / 0.3)' }}
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.18 }}
    />
  )
}

/** Opaque top bar with the in-app back chevron. Sits below the status-bar inset. */
export function TopBar({ title, sub, right, back = true, tone = 'bg', large = false, onBack }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; back?: boolean; tone?: 'surface' | 'bg' | 'clear' | 'ink' | 'night'; large?: boolean; onBack?: () => void }) {
  const { back: goBack, canGoBack } = useNav()
  const bg = tone === 'surface' ? 'var(--surface)' : tone === 'bg' ? 'var(--bg)' : tone === 'ink' ? 'var(--ink)' : tone === 'night' ? 'var(--night)' : 'transparent'
  const dark = tone === 'ink' || tone === 'night'
  const fg = dark ? 'text-on-ink' : 'text-text'
  const fg2 = dark ? 'text-on-ink-2' : 'text-text-2'
  return (
    <header className={`relative z-20 shrink-0 ${fg}`} style={{ background: bg, paddingTop: SAFE_TOP }}>
      <div className="flex h-[52px] items-center gap-1 px-2">
        {back && (canGoBack || onBack) ? (
          <motion.button
            type="button"
            whileTap={tap}
            transition={spring.ui}
            onClick={() => {
              track('go_back')
              if (onBack) onBack()
              else goBack()
            }}
            aria-label="Back"
            className="flex h-11 items-center gap-0.5 rounded-full pl-1 pr-3 text-[15px] font-semibold"
          >
            <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
            <span>Back</span>
          </motion.button>
        ) : (
          <span className="w-3" />
        )}
        <div className="min-w-0 flex-1 px-1">
          {!large && title && <p className="truncate text-center text-[17px] font-bold">{title}</p>}
          {!large && sub && <p className={`truncate text-center text-[11px] font-semibold ${fg2}`}>{sub}</p>}
        </div>
        <div className="flex min-w-[64px] items-center justify-end gap-1 pr-1">{right}</div>
      </div>
      {large && (
        <div className="px-5 pb-3">
          <h1 className="grot text-[34px]">{title}</h1>
          {sub && <p className={`mt-1 text-[13px] font-semibold ${fg2}`}>{sub}</p>}
        </div>
      )}
    </header>
  )
}

/** Step header for flows: back chevron, segment progress, step count. */
export function StepBar({ step, total, label }: { step: number; total: number; label: string }) {
  const { back, canGoBack } = useNav()
  return (
    <header className="relative z-20 shrink-0 bg-bg" style={{ paddingTop: SAFE_TOP }}>
      <div className="flex h-[52px] items-center gap-2 px-2">
        {canGoBack ? (
          <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full">
            <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
          </motion.button>
        ) : (
          <span className="w-11" />
        )}
        <div className="flex flex-1 items-end gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={`Step ${step} of ${total}: ${label}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className="relative h-[6px] flex-1 overflow-hidden rounded-full bg-[var(--surface-high)]">
              {i < step && <motion.span className="absolute inset-0 bg-accent" initial={i === step - 1 ? { scaleX: 0 } : false} animate={{ scaleX: 1 }} style={{ transformOrigin: 'left' }} transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }} />}
            </span>
          ))}
        </div>
        <span className="meta w-11 text-right text-text-2">
          {step}/{total}
        </span>
      </div>
      <p className="label px-5 pb-1 text-accent-ink">{label}</p>
    </header>
  )
}

type Tab = { id: TabId; label: string; icon: LucideIcon; to: MobileScreenId }

const TABS: Record<Exclude<Platform, 'admin'>, Tab[]> = {
  owner: [
    { id: 'home', label: 'Home', icon: House, to: 'owner.home' },
    { id: 'discover', label: 'Search', icon: MapPinned, to: 'owner.discover' },
    { id: 'bookings', label: 'Bookings', icon: ReceiptText, to: 'owner.bookings' },
    { id: 'chats', label: 'Chats', icon: MessageCircle, to: 'owner.chats' },
    { id: 'account', label: 'Account', icon: User, to: 'owner.profile' },
  ],
  walker: [
    { id: 'today', label: 'Today', icon: House, to: 'walker.home' },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays, to: 'walker.schedule' },
    { id: 'earnings', label: 'Earnings', icon: Wallet, to: 'walker.earnings' },
    { id: 'help', label: 'Help', icon: LifeBuoy, to: 'walker.support' },
    { id: 'profile', label: 'Profile', icon: User, to: 'walker.profile' },
  ],
}

function scrollTop(e: MouseEvent<HTMLButtonElement>) {
  e.currentTarget.closest('[data-screen-root]')?.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
}

/** The dock for whichever phone app the current screen belongs to: five tabs, the active one in royal blue with the yellow dot. */
export function AppTabBar({ active }: { active: TabId }) {
  const { reset, current } = useNav()
  const platform = platformOf(current)
  const tabs = TABS[(platform === 'admin' ? 'owner' : platform) as Exclude<Platform, 'admin'>]
  /* select primitives, never a fresh object: useSyncExternalStore compares by identity */
  const walkLive = useSession((s) => s.stage !== 'none' && s.stage !== 'reviewed')
  const jobWaiting = useSession((s) => s.stage === 'requested' && !s.declined)
  const badges: Record<string, number> = { bookings: walkLive ? 1 : 0, today: jobWaiting ? 1 : 0, chats: 2 }
  return (
    <nav data-dock aria-label="Main" className="absolute inset-x-3 z-20" style={{ bottom: safeBottom(-10) }}>
      <div className="glass flex h-[64px] items-center justify-around rounded-[var(--r-container)] px-1">
        {tabs.map((tb) => {
          const on = tb.id === active
          const badge = badges[tb.id] ?? 0
          return (
            <motion.button
              key={tb.id}
              type="button"
              whileTap={tap}
              transition={spring.ui}
              onClick={(e) => (on ? scrollTop(e) : reset(tb.to))}
              aria-current={on ? 'page' : undefined}
              aria-label={badge ? `${tb.label}, ${badge} new` : tb.label}
              className="relative flex h-[52px] w-[62px] flex-col items-center justify-center gap-0.5"
            >
              <span className={`relative grid h-7 w-11 place-items-center rounded-full transition-colors duration-150 ${on ? 'bg-accent text-on-accent' : 'text-text-2'}`}>
                <tb.icon size={on ? 18 : 22} strokeWidth={on ? 2.5 : 2} aria-hidden />
                {badge > 0 && !on && <span className="num absolute -right-0.5 -top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-sun px-1 text-[10px] font-extrabold text-on-sun ring-2 ring-[var(--surface)]">{badge}</span>}
              </span>
              <span className={`text-[11px] font-bold ${on ? 'text-accent-ink' : 'text-text-2'}`}>{tb.label}</span>
              {on && <span aria-hidden className="absolute -bottom-0.5 h-[5px] w-[5px] rounded-full bg-sun" />}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

/** Section heading inside a scroll: display type, optional action link. */
export function SectionHead({ title, eyebrow, action, onAction, className = '' }: { title: ReactNode; eyebrow?: string; action?: string; onAction?: () => void; className?: string }) {
  return (
    <div className={`flex items-end justify-between gap-3 px-5 ${className}`}>
      <div className="min-w-0">
        {eyebrow && <p className="label mb-1 text-accent-ink">{eyebrow}</p>}
        <h2 className="grot text-[22px]">{title}</h2>
      </div>
      {action && (
        <button type="button" onClick={onAction} className="flex h-11 shrink-0 items-center text-[13px] font-bold text-accent-ink">
          {action}
        </button>
      )}
    </div>
  )
}

/** Floating bottom action dock (above the home indicator). Children re-enable pointer events. */
export function Dock({ children, tone = 'glass' }: { children: ReactNode; tone?: 'glass' | 'surface' | 'clear' | 'ink' | 'night' }) {
  return (
    <div className="px-4" style={{ paddingBottom: safeBottom(-6) }}>
      <div
        data-dock
        className={`pointer-events-auto flex items-center gap-2 rounded-[var(--r-container)] p-2 ${
          tone === 'glass' ? 'glass' : tone === 'surface' ? 'bg-[var(--surface)] shadow-[var(--shadow-floating)]' : tone === 'ink' ? 'bg-[color-mix(in_oklch,var(--ink)_92%,transparent)] shadow-[var(--shadow-floating)] backdrop-blur-xl' : tone === 'night' ? 'bg-[color-mix(in_oklch,var(--night)_92%,transparent)] shadow-[var(--shadow-floating)] backdrop-blur-xl' : ''
        }`}
      >
        {children}
      </div>
    </div>
  )
}
