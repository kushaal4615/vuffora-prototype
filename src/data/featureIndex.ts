import type { ScreenId } from '../lib/navigation'

/* ─────────────────────────────────────────────────────────────
   The requirements, transcribed. One source: the Vuffora project
   specification (the version that adds Owner–Walker chat, the Help &
   Support centre and the Admin Unified Messaging Console).
   Every statement is written once, here, in the specification's own
   words. SCREEN_FEATURES points at these keys, so the per-screen panel
   can never drift from the index.
   ───────────────────────────────────────────────────────────── */

export const DOCUMENT = {
  title: 'Vuffora · Project specification',
  source: 'Dog Owner App, Dog Walker App and Super Admin portal · India (INR)',
  call: 'Mohali, Chandigarh and Delhi NCR first',
}

export const F = {
  // 01 Dog Owner Mobile App
  oAuth: 'Authentication & account security: mobile number login with SMS OTP, email login, and biometric app lock',
  oPets: 'Multi-pet profile management: add and edit multiple dogs with breed, age, weight, gender, dietary/medical notes and vaccination expiry dates',
  oTemperament: 'Temperament classification: mandatory selection between Calm/Friendly and Aggressive/Reactive (experienced handlers, muzzle/leash protocols)',
  oVault: 'Document vault: camera capture and PDF/image upload for Rabies, DHPP and Bordetella vaccination certificates',
  oApproval: 'Approval status tracker: dashboard banner showing Under Review, Approved, or Rejected with Admin remarks',
  oDiscovery: 'Geo-location walker discovery: map and list view of available walkers within a 2 km – 10 km radius, filterable by rating, experience and aggressive-dog certification',
  oRateCard: 'Dynamic INR rate card: price breakdown showing base fee, aggressive-dog handling surcharge, duration multiplier (30/45/60 mins) and GST',
  oBooking: 'Booking engine: Walk Now (on-demand), Schedule Later (calendar slot booking), plus recurring walk packages',
  oCheckout: 'INR payment checkout: UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, and downloadable GST invoices',
  oChat: 'Owner–Walker real-time chat: text messages, quick-reply presets, image sharing, read receipts and push notifications',
  oArrival: 'Pre-walk arrival tracker: live map tracking the walker’s route and ETA to the owner’s doorstep',
  oOtp: 'Dual-OTP handover system: time-bound 4-digit Check-In OTP at pickup and Check-Out OTP at drop-off, shown on the active booking screen',
  oTelemetry: 'Live walk telemetry: real-time polyline route, distance counter (km), countdown timer, and alerts for pee/poop logs, water breaks and photo check-ins',
  oHelp: 'Help & Admin Support Center: searchable FAQs and a direct Chat with Support (Admin), with screenshots, booking references and thread history',
  oReviews: 'Ratings, reviews & SOS: 5-star rating, written review tags, and an emergency SOS button to platform support and local emergency contacts',
  // 02 Dog Walker Mobile App
  wOnboarding: 'Partner onboarding & KYC: step-by-step registration collecting personal details, handling experience and service radius',
  wDocs: 'Document submission: Aadhaar Card, PAN Card, Police Verification Certificate, and cancelled cheque/UPI ID for payouts',
  wAvailability: 'Availability & shift manager: real-time Online/Offline toggle and weekly recurring time-slot planner',
  wJobs: 'Job request console: request cards showing distance to pickup, dog breed, temperament badge (Calm vs. Aggressive), walk duration and net INR payout',
  wChat: 'Owner–Walker real-time chat: in-app thread with the owner for gate codes, behaviour notes or drop-off updates without exposing personal phone numbers',
  wNavigation: 'Turn-by-turn pickup navigation: one-tap deep link to Google Maps for routing to the owner’s GPS pin',
  wKeypad: 'OTP verification keypad: mandatory PIN entry to validate the Check-In OTP before starting the walk timer, and the Check-Out OTP before ending the job',
  wConsole: 'Active walk console: background GPS location broadcaster, walk duration timer, and one-tap activity logger (send photo, mark water/potty break)',
  wHelp: 'Partner Help & Admin chat: in-app support channel to the Super Admin for KYC queries, payout delays or on-walk incidents',
  wWallet: 'Earnings & payout wallet: real-time ledger of gross earnings, platform commission deductions, net INR balance and payout withdrawal history',
  // 03 Super Admin Web Dashboard
  aVetting: 'Vetting & compliance queue: side-by-side document viewer to inspect vaccination certificates, verify expiry dates, and approve/reject accounts with feedback notes',
  aTemperament: 'Temperament & safety audit: review and lock a dog’s temperament tag (Calm vs. Aggressive) based on owner disclosures or walker feedback',
  aKyc: 'Walker KYC & tier management: verify identity documents and background checks, and assign badges such as Aggressive Breed Certified',
  aInbox: 'Unified Admin Messaging Console: centralised two-way live chat hub divided into Dog Owners and Dog Walkers tabs',
  aInboxReply: 'Receive and reply in real time to queries from the End-User Help section and the Walker Support section',
  aInboxOutbound: 'Initiate outbound proactive messages to any registered Dog Owner or Dog Walker',
  aInboxContext: 'Contextual side-panel showing the user’s profile, dog details and recent booking/OTP logs beside the chat thread',
  aInboxStatus: 'Status tagging (Open, In Progress, Resolved) and unread message notifications',
  aPricing: 'Dynamic pricing & commission engine: base walk rates, aggressive dog surcharges, surge pricing rules, GST percentages and commission splits in INR',
  aLive: 'Live operations control room: real-time master map of all ongoing walks with Check-In/Check-Out OTP timestamps and GPS logs',
  aPayouts: 'Payout & refund management: automated/manual bank settlements to walkers and full or partial refunds for cancelled bookings',
  aDisputes: 'Dispute & review moderation: audit Owner–Walker chat transcripts, GPS paths and OTP timestamps to resolve disputes, with review moderation tools',
  aAnalytics: 'Business analytics: exportable reports covering GMV in INR, net revenue, active dogs/walkers, repeat booking rates and geographic demand heatmaps',
  // 04 Integrations
  iMaps: 'Maps & geolocation: Google Maps Platform (Maps SDK, Places autocomplete, Directions for walker ETA, Geocoding)',
  iPayments: 'Payment gateway (INR): Razorpay or Cashfree with UPI Intent, cards, net banking, GST invoicing and payouts for walker bank transfers',
  iMessaging: 'Real-time messaging engine: Socket.io / Firebase Firestore for booking chat and the admin inbox, with typing indicators and read receipts',
  iSms: 'SMS & OTP gateway: MSG91 or Twilio for login OTPs and transactional SMS alerts',
  iPush: 'Push notifications: FCM and APNs for new chat messages, walk milestones and OTP events',
  iMasking: 'Number masking (optional voice add-on): Exotel or Kaleyra for masked voice calls in India',
  // 05 Monetisation Strategy
  mCommission: 'Platform commission (take rate): a flat percentage (e.g. 15% to 25%) deducted from every completed walk before the walker’s payout',
  mSurcharges: 'Temperament & convenience surcharges: an additional platform fee on aggressive dog walks or last-minute instant bookings',
  mPasses: 'Subscription packages (Walk Passes): discounted monthly/weekly walk bundles, e.g. 20 walks/month at a 10% discount',
  mFeatured: 'Featured walker listings: top-rated, verified walkers pay a small weekly fee to appear at the top of local search results',
  // 06 Data Ingestion
  dTransactional: 'Structured transactional & profile data: credentials, pet profiles, temperament flags, bookings, INR ledger entries and OTP logs via REST/GraphQL into PostgreSQL',
  dChat: 'Real-time chat & support threads over WebSockets/Socket.io with persistent message history and media in cloud object storage',
  dMedia: 'Unstructured media & documents: vaccination certificates, walker KYC documents, chat images and walk photos via pre-signed URLs into encrypted AWS S3',
  dTelemetry: 'High-frequency telemetry: GPS coordinates every 3–5 seconds via WebSockets/MQTT into Redis + PostGIS for live maps and route history',
  // 07 Future Features (Phase 2+)
  fGroup: 'Group walks vs. solo walks: discounted shared walks (2–3 dogs) for calm dogs, aggressive dogs strictly solo',
  fOcr: 'AI vaccination OCR scanner: read vaccination dates and rabies tag numbers directly from uploaded certificates',
  fChatbot: 'AI support chatbot triage: first-level AI assistant in the Help section before escalating to the human Admin inbox',
  fServices: 'Expanded pet services: in-home pet sitting, dog boarding, grooming appointments and vet teleconsultations',
  fCollar: 'Smart collar / wearable sync: GPS pet collars (e.g. Tractive, Fi) for step-count tracking and health telemetry',
  fInsurance: 'Pet insurance micro-coverage: per-walk accidental/third-party liability micro-insurance embedded into checkout',
} as const

export type FeatureKey = keyof typeof F

export type FeatureRef = { screen: ScreenId } | { notBuilt: string }
export type IndexedFeature = { key: FeatureKey; text: string; ref: FeatureRef }
export type FeatureModule = { n: number; module: string; source: 'spec' | 'later'; summary: string; features: IndexedFeature[] }

const f = (key: FeatureKey, ref: FeatureRef): IndexedFeature => ({ key, text: F[key], ref })

const PHASE2 = 'Listed in the specification as Phase 2+; not part of the first release or this prototype'
const BACKEND = 'Backend infrastructure, not a screen; this prototype runs on local demo data'

export const MODULES = {
  owner: 'Dog Owner Mobile App',
  walker: 'Dog Walker Mobile App',
  admin: 'Super Admin Web Dashboard',
  integrations: 'Integrations',
  money: 'Monetisation Strategy',
  data: 'Data Ingestion',
  future: 'Future Features (Phase 2+)',
} as const

export const FEATURE_INDEX: FeatureModule[] = [
  {
    n: 1, module: MODULES.owner, source: 'spec',
    summary: 'iOS and Android. Everything the owner does: pets and vaccinations, finding a walker, paying in INR, the OTP handover, the live walk, chat, help and reviews.',
    features: [
      f('oAuth', { screen: 'owner.signin' }),
      f('oPets', { screen: 'owner.dog' }),
      f('oTemperament', { screen: 'owner.dog' }),
      f('oVault', { screen: 'owner.vault' }),
      f('oApproval', { screen: 'owner.home' }),
      f('oDiscovery', { screen: 'owner.discover' }),
      f('oRateCard', { screen: 'owner.booking' }),
      f('oBooking', { screen: 'owner.booking' }),
      f('oCheckout', { screen: 'owner.checkout' }),
      f('oChat', { screen: 'owner.chat' }),
      f('oArrival', { screen: 'owner.arrival' }),
      f('oOtp', { screen: 'owner.arrival' }),
      f('oTelemetry', { screen: 'owner.live' }),
      f('oHelp', { screen: 'owner.help' }),
      f('oReviews', { screen: 'owner.review' }),
    ],
  },
  {
    n: 2, module: MODULES.walker, source: 'spec',
    summary: 'iOS and Android. The partner side: KYC, availability, job requests, pickup, the OTP keypad, the walk console, support and earnings.',
    features: [
      f('wOnboarding', { screen: 'walker.kyc' }),
      f('wDocs', { screen: 'walker.kyc' }),
      f('wAvailability', { screen: 'walker.schedule' }),
      f('wJobs', { screen: 'walker.request' }),
      f('wChat', { screen: 'walker.chat' }),
      f('wNavigation', { screen: 'walker.pickup' }),
      f('wKeypad', { screen: 'walker.otp' }),
      f('wConsole', { screen: 'walker.walk' }),
      f('wHelp', { screen: 'walker.support' }),
      f('wWallet', { screen: 'walker.earnings' }),
    ],
  },
  {
    n: 3, module: MODULES.admin, source: 'spec',
    summary: 'A responsive web portal. Vetting, KYC, one inbox for owners and walkers, pricing, the live map, payouts, disputes and reports.',
    features: [
      f('aVetting', { screen: 'admin.vetting' }),
      f('aTemperament', { screen: 'admin.vetting' }),
      f('aKyc', { screen: 'admin.walkers' }),
      f('aInbox', { screen: 'admin.messages' }),
      f('aInboxReply', { screen: 'admin.messages' }),
      f('aInboxOutbound', { screen: 'admin.messages' }),
      f('aInboxContext', { screen: 'admin.messages' }),
      f('aInboxStatus', { screen: 'admin.messages' }),
      f('aPricing', { screen: 'admin.pricing' }),
      f('aLive', { screen: 'admin.live' }),
      f('aPayouts', { screen: 'admin.payouts' }),
      f('aDisputes', { screen: 'admin.disputes' }),
      f('aAnalytics', { screen: 'admin.analytics' }),
    ],
  },
  {
    n: 4, module: MODULES.integrations, source: 'spec',
    summary: 'The outside services the build connects to. The prototype shows where each one appears, with simulated data behind it.',
    features: [
      f('iMaps', { screen: 'owner.discover' }),
      f('iPayments', { screen: 'owner.checkout' }),
      f('iMessaging', { screen: 'owner.chat' }),
      f('iSms', { screen: 'owner.otp' }),
      f('iPush', { screen: 'owner.live' }),
      f('iMasking', { notBuilt: 'Optional voice add-on in the specification; the prototype keeps contact inside the in-app chat' }),
    ],
  },
  {
    n: 5, module: MODULES.money, source: 'spec',
    summary: 'How Vuffora earns: a cut of each walk, surcharges, walk passes and featured walkers.',
    features: [
      f('mCommission', { screen: 'walker.earnings' }),
      f('mSurcharges', { screen: 'admin.pricing' }),
      f('mPasses', { screen: 'owner.booking' }),
      f('mFeatured', { screen: 'owner.discover' }),
    ],
  },
  {
    n: 6, module: MODULES.data, source: 'spec',
    summary: 'How data reaches the platform. This is server work, so there is nothing to click; the screens run on local demo data.',
    features: [
      f('dTransactional', { notBuilt: BACKEND }),
      f('dChat', { notBuilt: BACKEND }),
      f('dMedia', { notBuilt: BACKEND }),
      f('dTelemetry', { notBuilt: BACKEND }),
    ],
  },
  {
    n: 7, module: MODULES.future, source: 'later',
    summary: 'Named in the specification for later phases. Listed here so nothing is lost; none of it is in the first release.',
    features: [
      f('fGroup', { notBuilt: PHASE2 }),
      f('fOcr', { notBuilt: PHASE2 }),
      f('fChatbot', { notBuilt: PHASE2 }),
      f('fServices', { notBuilt: PHASE2 }),
      f('fCollar', { notBuilt: PHASE2 }),
      f('fInsurance', { notBuilt: PHASE2 }),
    ],
  },
]

export const INDEX_COUNTS = (() => {
  const all = FEATURE_INDEX.flatMap((m) => m.features)
  const mapped = all.filter((x) => 'screen' in x.ref)
  return { modules: FEATURE_INDEX.length, features: all.length, mapped: mapped.length, notBuilt: all.length - mapped.length }
})()
