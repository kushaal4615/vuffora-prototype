import { createContext, useContext } from 'react'

/* ─────────────────────────────────────────────────────────────
   The typed screen graph. Every screen the prototype can show is
   listed here. navigate() accepts only these IDs, so a typo or an
   unregistered screen fails the TypeScript build.
   ───────────────────────────────────────────────────────────── */

export const OWNER_SCREENS = [
  'owner.welcome',
  'owner.signin',
  'owner.otp',
  'owner.dog',
  'owner.vault',
  'owner.home',
  'owner.discover',
  'owner.walker',
  'owner.booking',
  'owner.checkout',
  'owner.confirmed',
  'owner.arrival',
  'owner.live',
  'owner.chat',
  'owner.review',
  'owner.bookings',
  'owner.chats',
  'owner.help',
  'owner.support',
  'owner.profile',
] as const

export const WALKER_SCREENS = [
  'walker.signin',
  'walker.kyc',
  'walker.home',
  'walker.request',
  'walker.pickup',
  'walker.otp',
  'walker.walk',
  'walker.dropoff',
  'walker.chat',
  'walker.schedule',
  'walker.earnings',
  'walker.support',
  'walker.profile',
] as const

export const ADMIN_SCREENS = [
  'admin.signin',
  'admin.overview',
  'admin.vetting',
  'admin.walkers',
  'admin.owners',
  'admin.messages',
  'admin.live',
  'admin.pricing',
  'admin.payouts',
  'admin.disputes',
  'admin.analytics',
  'admin.settings',
] as const

export type OwnerScreenId = (typeof OWNER_SCREENS)[number]
export type WalkerScreenId = (typeof WALKER_SCREENS)[number]
export type AdminScreenId = (typeof ADMIN_SCREENS)[number]
/** any screen that renders inside the iPhone frame */
export type MobileScreenId = OwnerScreenId | WalkerScreenId
/** any screen that renders inside the browser frame */
export type ConsoleScreenId = AdminScreenId
export type ScreenId = OwnerScreenId | WalkerScreenId | AdminScreenId

export type Platform = 'owner' | 'walker' | 'admin'
export type View = Platform | 'features'

export const ALL_SCREENS: readonly ScreenId[] = [...OWNER_SCREENS, ...WALKER_SCREENS, ...ADMIN_SCREENS]

export const PLATFORMS: { id: Platform; label: string; sub: string; entry: ScreenId; frame: 'phone' | 'browser'; domain: string }[] = [
  { id: 'owner', label: 'Dog Owner App', sub: 'Ananya: her dogs, nearby walkers, booking, OTP handover and the live walk', entry: 'owner.welcome', frame: 'phone', domain: 'app.vuffora.in' },
  { id: 'walker', label: 'Dog Walker App', sub: 'Arjun: job requests, pickup, OTP keypad, the walk console and earnings', entry: 'walker.signin', frame: 'phone', domain: 'partner.vuffora.in' },
  { id: 'admin', label: 'Super Admin', sub: 'Kavya: vetting, KYC, one inbox for owners and walkers, live walks, pricing and payouts', entry: 'admin.signin', frame: 'browser', domain: 'admin.vuffora.in' },
]

export function platformOf(id: ScreenId): Platform {
  return id.split('.')[0] as Platform
}

export const frameOf = (p: Platform) => PLATFORMS.find((x) => x.id === p)!.frame
export const domainOf = (p: Platform) => PLATFORMS.find((x) => x.id === p)!.domain

export function isScreenId(value: string): value is ScreenId {
  return (ALL_SCREENS as readonly string[]).includes(value)
}

/* Hash form: #/owner/home · #/admin/vetting · #/features */
export function screenToHash(id: ScreenId): string {
  const [p, s] = id.split('.')
  return `#/${p}/${s}`
}

export function hashToRoute(hash: string): { view: View; screen?: ScreenId } | null {
  const clean = hash.replace(/^#\/?/, '')
  if (!clean) return null
  if (clean === 'features') return { view: 'features' }
  const [p, s] = clean.split('/')
  const candidate = `${p}.${s}`
  if (isScreenId(candidate)) return { view: platformOf(candidate), screen: candidate }
  if (import.meta.env.DEV) console.error(`[NAV] unknown hash route "${hash}"`)
  return null
}

/* ─── Runtime navigation API, provided by the viewer ─── */

export type ToastTone = 'neutral' | 'accent' | 'warn' | 'danger' | 'info'

export type NavApi = {
  current: ScreenId
  /** push a screen onto its platform's stack (switches platform if needed) */
  navigate: (id: ScreenId) => void
  /** pop the current platform's stack */
  back: () => void
  /** replace the whole stack of the screen's platform with [id] (tab bars, sign-out) */
  reset: (id: ScreenId) => void
  canGoBack: boolean
  toast: (message: string, tone?: ToastTone) => void
}

export const NavContext = createContext<NavApi | null>(null)

export function useNav(): NavApi {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used inside the PrototypeViewer')
  return ctx
}

/* ─── Static link map: every navigate() target each screen exposes.
   Used by the reachability assertion (lib/reachability.ts) so the
   graph is proved connected without a browser. Keep in step with
   the screens' own onClick handlers. ─── */
export const OWNER_TABS: OwnerScreenId[] = ['owner.home', 'owner.discover', 'owner.bookings', 'owner.chats', 'owner.profile']
export const WALKER_TABS: WalkerScreenId[] = ['walker.home', 'walker.schedule', 'walker.earnings', 'walker.support', 'walker.profile']
const OT = OWNER_TABS
const WT = WALKER_TABS
const ADMIN_NAV: AdminScreenId[] = ['admin.overview', 'admin.vetting', 'admin.walkers', 'admin.owners', 'admin.messages', 'admin.live', 'admin.pricing', 'admin.payouts', 'admin.disputes', 'admin.analytics', 'admin.settings', 'admin.signin']

export const LINKS: Record<ScreenId, ScreenId[]> = {
  'owner.welcome': ['owner.signin'],
  'owner.signin': ['owner.otp'],
  'owner.otp': ['owner.dog', 'owner.home'],
  'owner.dog': ['owner.vault'],
  'owner.vault': ['owner.home', 'owner.support'],
  'owner.home': ['owner.discover', 'owner.walker', 'owner.booking', 'owner.vault', 'owner.dog', 'owner.arrival', 'owner.live', 'owner.help', 'owner.bookings', ...OT],
  'owner.discover': ['owner.walker', 'owner.booking', ...OT],
  'owner.walker': ['owner.booking', 'owner.chat'],
  'owner.booking': ['owner.checkout', 'owner.dog'],
  'owner.checkout': ['owner.confirmed'],
  'owner.confirmed': ['owner.arrival', 'owner.chat', 'owner.home'],
  'owner.arrival': ['owner.live', 'owner.chat', 'owner.support'],
  'owner.live': ['owner.review', 'owner.chat', 'owner.support'],
  'owner.chat': ['owner.arrival', 'owner.live', 'owner.walker'],
  'owner.review': ['owner.home', 'owner.support', 'owner.bookings'],
  'owner.bookings': ['owner.arrival', 'owner.live', 'owner.review', 'owner.booking', 'owner.walker', 'owner.support', ...OT],
  'owner.chats': ['owner.chat', 'owner.support', 'owner.help', ...OT],
  'owner.help': ['owner.support', 'owner.bookings'],
  'owner.support': ['owner.help', 'owner.vault'],
  'owner.profile': ['owner.dog', 'owner.vault', 'owner.help', 'owner.bookings', 'owner.welcome', ...OT],

  'walker.signin': ['walker.kyc', 'walker.home'],
  'walker.kyc': ['walker.home', 'walker.support'],
  'walker.home': ['walker.request', 'walker.pickup', 'walker.walk', 'walker.kyc', 'walker.earnings', 'walker.schedule', 'walker.chat', ...WT],
  'walker.request': ['walker.pickup', 'walker.home', 'walker.chat'],
  'walker.pickup': ['walker.otp', 'walker.chat', 'walker.support'],
  'walker.otp': ['walker.walk', 'walker.chat'],
  'walker.walk': ['walker.dropoff', 'walker.chat', 'walker.support'],
  'walker.dropoff': ['walker.earnings', 'walker.home', 'walker.chat'],
  'walker.chat': ['walker.pickup', 'walker.walk', 'walker.request'],
  'walker.schedule': ['walker.home', ...WT],
  'walker.earnings': ['walker.support', 'walker.home', ...WT],
  'walker.support': ['walker.kyc', 'walker.earnings', ...WT],
  'walker.profile': ['walker.kyc', 'walker.schedule', 'walker.earnings', 'walker.support', 'walker.signin', ...WT],

  'admin.signin': ['admin.overview'],
  'admin.overview': [...ADMIN_NAV],
  'admin.vetting': [...ADMIN_NAV],
  'admin.walkers': [...ADMIN_NAV],
  'admin.owners': [...ADMIN_NAV],
  'admin.messages': [...ADMIN_NAV],
  'admin.live': [...ADMIN_NAV],
  'admin.pricing': [...ADMIN_NAV],
  'admin.payouts': [...ADMIN_NAV],
  'admin.disputes': [...ADMIN_NAV],
  'admin.analytics': [...ADMIN_NAV],
  'admin.settings': [...ADMIN_NAV],
}
