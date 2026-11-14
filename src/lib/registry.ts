import type { ComponentType } from 'react'
import type { ScreenId } from './navigation'

import OwnerWelcome from '../platforms/owner/Welcome'
import OwnerSignin from '../platforms/owner/Signin'
import OwnerOtp from '../platforms/owner/Otp'
import OwnerDog from '../platforms/owner/Dog'
import OwnerVault from '../platforms/owner/Vault'
import OwnerHome from '../platforms/owner/Home'
import OwnerDiscover from '../platforms/owner/Discover'
import OwnerWalker from '../platforms/owner/Walker'
import OwnerBooking from '../platforms/owner/Booking'
import OwnerCheckout from '../platforms/owner/Checkout'
import OwnerConfirmed from '../platforms/owner/Confirmed'
import OwnerArrival from '../platforms/owner/Arrival'
import OwnerLive from '../platforms/owner/Live'
import OwnerChat from '../platforms/owner/Chat'
import OwnerReview from '../platforms/owner/Review'
import OwnerBookings from '../platforms/owner/Bookings'
import OwnerChats from '../platforms/owner/Chats'
import OwnerHelp from '../platforms/owner/Help'
import OwnerSupport from '../platforms/owner/Support'
import OwnerProfile from '../platforms/owner/Profile'
import WalkerSignin from '../platforms/walker/Signin'
import WalkerKyc from '../platforms/walker/Kyc'
import WalkerHome from '../platforms/walker/Home'
import WalkerRequest from '../platforms/walker/Request'
import WalkerPickup from '../platforms/walker/Pickup'
import WalkerOtp from '../platforms/walker/Otp'
import WalkerWalk from '../platforms/walker/Walk'
import WalkerDropoff from '../platforms/walker/Dropoff'
import WalkerChat from '../platforms/walker/Chat'
import WalkerSchedule from '../platforms/walker/Schedule'
import WalkerEarnings from '../platforms/walker/Earnings'
import WalkerSupport from '../platforms/walker/Support'
import WalkerProfile from '../platforms/walker/Profile'
import AdminSignin from '../platforms/admin/Signin'
import AdminOverview from '../platforms/admin/Overview'
import AdminVetting from '../platforms/admin/Vetting'
import AdminWalkers from '../platforms/admin/Walkers'
import AdminOwners from '../platforms/admin/Owners'
import AdminMessages from '../platforms/admin/Messages'
import AdminLive from '../platforms/admin/Live'
import AdminPricing from '../platforms/admin/Pricing'
import AdminPayouts from '../platforms/admin/Payouts'
import AdminDisputes from '../platforms/admin/Disputes'
import AdminAnalytics from '../platforms/admin/Analytics'
import AdminSettings from '../platforms/admin/Settings'

export type ScreenDef = {
  component: ComponentType
  /** status-bar glyph colour over the top of this screen: 'light' = white glyphs (dark or photo hero behind), 'dark' = dark glyphs */
  statusTone?: 'dark' | 'light'
  /** URL path shown in the browser frame */
  path?: string
}

/* Exhaustive by type: an unregistered ScreenId fails the build. */
export const SCREENS: Record<ScreenId, ScreenDef> = {
  'owner.welcome': { component: OwnerWelcome, statusTone: 'light' },
  'owner.signin': { component: OwnerSignin, statusTone: 'dark' },
  'owner.otp': { component: OwnerOtp, statusTone: 'dark' },
  'owner.dog': { component: OwnerDog, statusTone: 'dark' },
  'owner.vault': { component: OwnerVault, statusTone: 'dark' },
  'owner.home': { component: OwnerHome, statusTone: 'dark' },
  'owner.discover': { component: OwnerDiscover, statusTone: 'dark' },
  'owner.walker': { component: OwnerWalker, statusTone: 'light' },
  'owner.booking': { component: OwnerBooking, statusTone: 'dark' },
  'owner.checkout': { component: OwnerCheckout, statusTone: 'dark' },
  'owner.confirmed': { component: OwnerConfirmed, statusTone: 'light' },
  'owner.arrival': { component: OwnerArrival, statusTone: 'light' },
  'owner.live': { component: OwnerLive, statusTone: 'light' },
  'owner.chat': { component: OwnerChat, statusTone: 'dark' },
  'owner.review': { component: OwnerReview, statusTone: 'dark' },
  'owner.bookings': { component: OwnerBookings, statusTone: 'dark' },
  'owner.chats': { component: OwnerChats, statusTone: 'dark' },
  'owner.help': { component: OwnerHelp, statusTone: 'dark' },
  'owner.support': { component: OwnerSupport, statusTone: 'dark' },
  'owner.profile': { component: OwnerProfile, statusTone: 'dark' },
  'walker.signin': { component: WalkerSignin, statusTone: 'light' },
  'walker.kyc': { component: WalkerKyc, statusTone: 'light' },
  'walker.home': { component: WalkerHome, statusTone: 'light' },
  'walker.request': { component: WalkerRequest, statusTone: 'light' },
  'walker.pickup': { component: WalkerPickup, statusTone: 'light' },
  'walker.otp': { component: WalkerOtp, statusTone: 'dark' },
  'walker.walk': { component: WalkerWalk, statusTone: 'light' },
  'walker.dropoff': { component: WalkerDropoff, statusTone: 'dark' },
  'walker.chat': { component: WalkerChat, statusTone: 'dark' },
  'walker.schedule': { component: WalkerSchedule, statusTone: 'light' },
  'walker.earnings': { component: WalkerEarnings, statusTone: 'light' },
  'walker.support': { component: WalkerSupport, statusTone: 'light' },
  'walker.profile': { component: WalkerProfile, statusTone: 'light' },
  'admin.signin': { component: AdminSignin, path: '/sign-in' },
  'admin.overview': { component: AdminOverview, path: '/' },
  'admin.vetting': { component: AdminVetting, path: '/compliance/vetting?state=pending' },
  'admin.walkers': { component: AdminWalkers, path: '/walkers/kyc' },
  'admin.owners': { component: AdminOwners, path: '/owners' },
  'admin.messages': { component: AdminMessages, path: '/messages' },
  'admin.live': { component: AdminLive, path: '/operations/live' },
  'admin.pricing': { component: AdminPricing, path: '/pricing' },
  'admin.payouts': { component: AdminPayouts, path: '/finance/payouts' },
  'admin.disputes': { component: AdminDisputes, path: '/trust/disputes' },
  'admin.analytics': { component: AdminAnalytics, path: '/analytics/90d' },
  'admin.settings': { component: AdminSettings, path: '/settings/roles' },
}
