import type { ScreenId } from '../lib/navigation'
import { F, FEATURE_INDEX, MODULES, type FeatureKey } from './featureIndex'

/* What each screen demonstrates, shown in the viewer's FEATURE PANEL.
   Features are keys into the requirements index, so every statement is
   the specification's own wording. Exhaustive by type: a screen
   without an entry fails the build. */

export type Persona = 'Dog Owner App' | 'Dog Walker App' | 'Super Admin'
export type ScreenFeatures = { persona: Persona; title: string; module: string; features: FeatureKey[] }

const owner = (title: string, features: FeatureKey[], module: string = MODULES.owner): ScreenFeatures => ({ persona: 'Dog Owner App', title, module, features })
const walker = (title: string, features: FeatureKey[], module: string = MODULES.walker): ScreenFeatures => ({ persona: 'Dog Walker App', title, module, features })
const admin = (title: string, features: FeatureKey[], module: string = MODULES.admin): ScreenFeatures => ({ persona: 'Super Admin', title, module, features })

export const SCREEN_FEATURES: Record<ScreenId, ScreenFeatures> = {
  'owner.welcome': owner('Welcome', ['oAuth', 'oDiscovery', 'oOtp', 'oTelemetry']),
  'owner.signin': owner('Sign in', ['oAuth', 'iSms', 'oApproval']),
  'owner.otp': owner('Verify your number', ['oAuth', 'iSms', 'iPush']),
  'owner.dog': owner('Pet profile', ['oPets', 'oTemperament', 'oVault', 'aTemperament']),
  'owner.vault': owner('Document vault', ['oVault', 'oApproval', 'oPets', 'aVetting']),
  'owner.home': owner('Home', ['oApproval', 'oPets', 'oBooking', 'oDiscovery', 'mPasses']),
  'owner.discover': owner('Find a walker', ['oDiscovery', 'iMaps', 'mFeatured', 'oRateCard']),
  'owner.walker': owner('Walker profile', ['oDiscovery', 'oReviews', 'aKyc', 'oChat']),
  'owner.booking': owner('Book a walk', ['oBooking', 'oRateCard', 'oTemperament', 'mPasses', 'mSurcharges']),
  'owner.checkout': owner('Checkout', ['oCheckout', 'iPayments', 'oRateCard']),
  'owner.confirmed': owner('Booking confirmed', ['oCheckout', 'oChat', 'oArrival', 'iPush']),
  'owner.arrival': owner('Walker on the way', ['oArrival', 'oOtp', 'oChat', 'iMaps']),
  'owner.live': owner('Live walk', ['oTelemetry', 'oOtp', 'oReviews', 'iPush', 'oChat']),
  'owner.chat': owner('Chat with your walker', ['oChat', 'iMessaging', 'iPush']),
  'owner.review': owner('Rate the walk', ['oReviews', 'oOtp', 'oCheckout', 'oHelp']),
  'owner.bookings': owner('My bookings', ['oBooking', 'oCheckout', 'oOtp', 'mPasses']),
  'owner.chats': owner('Chats', ['oChat', 'oHelp', 'iMessaging']),
  'owner.help': owner('Help & Support', ['oHelp', 'oReviews', 'aInboxReply']),
  'owner.support': owner('Chat with Support', ['oHelp', 'aInboxReply', 'iMessaging', 'oApproval']),
  'owner.profile': owner('Account', ['oPets', 'oAuth', 'oVault', 'mPasses', 'oHelp']),

  'walker.signin': walker('Partner sign in', ['wOnboarding', 'iSms', 'wAvailability']),
  'walker.kyc': walker('Onboarding & KYC', ['wOnboarding', 'wDocs', 'aKyc']),
  'walker.home': walker('Today', ['wAvailability', 'wJobs', 'wWallet', 'wConsole']),
  'walker.request': walker('Job request', ['wJobs', 'oTemperament', 'mCommission', 'wChat']),
  'walker.pickup': walker('Pickup', ['wNavigation', 'wChat', 'wKeypad', 'iMaps']),
  'walker.otp': walker('Check-In OTP', ['wKeypad', 'oOtp', 'wConsole']),
  'walker.walk': walker('Active walk', ['wConsole', 'oTelemetry', 'wKeypad', 'wHelp', 'wChat']),
  'walker.dropoff': walker('Check-Out OTP', ['wKeypad', 'oOtp', 'wWallet']),
  'walker.chat': walker('Chat with the owner', ['wChat', 'iMessaging', 'iPush']),
  'walker.schedule': walker('Availability', ['wAvailability', 'wOnboarding', 'wJobs']),
  'walker.earnings': walker('Earnings & payouts', ['wWallet', 'mCommission', 'aPayouts', 'iPayments']),
  'walker.support': walker('Help & Admin chat', ['wHelp', 'aInboxReply', 'iMessaging']),
  'walker.profile': walker('Profile', ['wOnboarding', 'aKyc', 'wAvailability', 'wHelp']),

  'admin.signin': admin('Admin sign in', ['aVetting', 'aInbox', 'aLive']),
  'admin.overview': admin('Overview', ['aAnalytics', 'aLive', 'aVetting', 'aInbox', 'aPayouts']),
  'admin.vetting': admin('Vetting & compliance', ['aVetting', 'aTemperament', 'aInboxOutbound', 'oApproval']),
  'admin.walkers': admin('Walker KYC & tiers', ['aKyc', 'wDocs', 'aInboxOutbound']),
  'admin.owners': admin('Owners & dogs', ['aTemperament', 'aVetting', 'aInboxOutbound', 'oPets']),
  'admin.messages': admin('Messages', ['aInbox', 'aInboxReply', 'aInboxOutbound', 'aInboxContext', 'aInboxStatus']),
  'admin.live': admin('Live operations', ['aLive', 'oOtp', 'oTelemetry', 'iMaps']),
  'admin.pricing': admin('Pricing & commission', ['aPricing', 'mCommission', 'mSurcharges', 'mPasses', 'mFeatured']),
  'admin.payouts': admin('Payouts & refunds', ['aPayouts', 'wWallet', 'iPayments']),
  'admin.disputes': admin('Disputes & reviews', ['aDisputes', 'oReviews', 'aInboxStatus']),
  'admin.analytics': admin('Business analytics', ['aAnalytics', 'mCommission', 'mPasses']),
  'admin.settings': admin('Roles & settings', ['aKyc', 'aPricing', 'aInbox']),
}

export const featureText = (k: FeatureKey) => F[k]

/* Dev-time drift check: every module used on a screen exists in the index,
   and every feature a screen claims is in the index. */
if (import.meta.env.DEV) {
  const keys = new Set(FEATURE_INDEX.flatMap((m) => m.features.map((x) => x.key)))
  const modules = new Set(FEATURE_INDEX.map((m) => m.module))
  for (const [id, s] of Object.entries(SCREEN_FEATURES)) {
    if (!modules.has(s.module)) console.error(`[FEATURES] ${id} uses unknown module "${s.module}"`)
    for (const k of s.features) if (!keys.has(k)) console.error(`[FEATURES] ${id} claims "${k}", which is not in FEATURE_INDEX`)
    if (s.features.length < 3 || s.features.length > 7) console.error(`[FEATURES] ${id} has ${s.features.length} features (3–7 required)`)
  }
}
