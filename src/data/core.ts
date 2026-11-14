import type { MediaKey } from './media'
import type { City, Temperament } from './cast'

/* Shared data that more than one platform reads: the rate card, the
   active walk, its route and activity log, the chat threads, and the two
   admin queues whose decisions show up in the mobile apps. */

/* ── Rate card ─────────────────────────────────────────────
   The specification names the parts of the price (base fee, aggressive-dog
   surcharge, duration, GST, commission) but leaves every figure open. These
   are demo values, listed in the README as assumptions to confirm. The admin
   pricing screen edits them and the owner's rate card follows. */
export type Duration = 30 | 45 | 60
export type Pricing = {
  base: Record<Duration, number> // walk fee by duration, INR
  reactiveSurcharge: number // aggressive-dog handling surcharge, INR
  instantFee: number // Walk Now convenience fee, INR
  surge: number // surge multiplier on the base, 1 = off
  gstPct: number
  commissionPct: number // platform take rate
  passWalks: number // walk pass size
  passDiscountPct: number
}
export const DEFAULT_PRICING: Pricing = {
  base: { 30: 199, 45: 279, 60: 349 },
  reactiveSurcharge: 120,
  instantFee: 30,
  surge: 1,
  gstPct: 18,
  commissionPct: 20,
  passWalks: 20,
  passDiscountPct: 10,
}

export type Quote = { base: number; surcharge: number; instant: number; subtotal: number; gst: number; total: number; commission: number; walkerNet: number }
export function quote(p: Pricing, duration: Duration, temperament: Temperament, instant: boolean): Quote {
  const base = Math.round(p.base[duration] * p.surge)
  const surcharge = temperament === 'reactive' ? p.reactiveSurcharge : 0
  const inst = instant ? p.instantFee : 0
  const subtotal = base + surcharge + inst
  const gst = Math.round((subtotal * p.gstPct) / 100)
  const commission = Math.round(((base + surcharge) * p.commissionPct) / 100)
  return { base, surcharge, instant: inst, subtotal, gst, total: subtotal + gst, commission, walkerNet: base + surcharge - commission }
}

/* ── The active walk ───────────────────────────────────────
   One booking runs through all three platforms. Its stage lives in the
   session store; this is the fixed part. */
export type WalkStage = 'none' | 'requested' | 'accepted' | 'arrived' | 'walking' | 'ended' | 'reviewed'
export const STAGE_ORDER: WalkStage[] = ['none', 'requested', 'accepted', 'arrived', 'walking', 'ended', 'reviewed']
export const stageAtLeast = (s: WalkStage, min: WalkStage) => STAGE_ORDER.indexOf(s) >= STAGE_ORDER.indexOf(min)

export const WALK = {
  id: 'VF-240781',
  invoice: 'INV-2026-11-0781',
  dateLabel: 'Today, Sat 14 Nov',
  slot: '8:00 am',
  pickup: 'B-214, Homeland Heights, Sector 70, Mohali',
  gate: 'Gate 2 · Tower B lobby',
  checkInOtp: '4826',
  checkOutOtp: '7391',
  /** how long the OTP stays valid, minutes */
  otpTtlMin: 10,
  plannedKm: 2.6,
}

/* The walk route, as points on a 0–100 map canvas (see components/Map.tsx).
   Starts and ends at the owner's pin; loops the Sector 70 park. */
export const ROUTE: [number, number][] = [
  [30, 72], [30, 62], [38, 62], [38, 50], [48, 50], [48, 38], [60, 38], [60, 26], [72, 26], [72, 38], [72, 50], [62, 50], [62, 62], [50, 62], [50, 72], [40, 72], [30, 72],
]
/** the walker's approach to the pickup pin, before the walk */
export const APPROACH: [number, number][] = [[86, 18], [86, 30], [74, 30], [74, 44], [60, 44], [60, 58], [46, 58], [46, 72], [30, 72]]
export const HOME_PIN: [number, number] = [30, 72]

export type LogKind = 'start' | 'pee' | 'poop' | 'water' | 'photo' | 'note' | 'end'
export type WalkLog = { id: string; kind: LogKind; at: string; text: string; photo?: MediaKey; /** route progress 0–1 where it happened */ t: number }
export const LOG_LABEL: Record<LogKind, string> = { start: 'Walk started', pee: 'Pee break', poop: 'Poop logged', water: 'Water break', photo: 'Photo check-in', note: 'Note', end: 'Walk ended' }
/** What the walker has logged by the time the demo opens the live walk */
export const SEED_LOGS: WalkLog[] = [
  { id: 'lg1', kind: 'start', at: '8:02 am', text: 'Check-In OTP verified at Gate 2. Custody with Arjun.', t: 0 },
  { id: 'lg2', kind: 'pee', at: '8:07 am', text: 'Pee break by the Sector 70 park gate.', t: 0.16 },
  { id: 'lg3', kind: 'photo', at: '8:14 am', text: 'Bruno met a friend at the fountain.', photo: 'twoRun', t: 0.36 },
  { id: 'lg4', kind: 'water', at: '8:19 am', text: 'Water break. Drank about half a bowl.', t: 0.5 },
]

/* ── Chat ──────────────────────────────────────────────────
   Three live threads share one store so a message sent in one app shows
   up in the other: the booking chat (owner ↔ walker), the owner's support
   chat and the walker's support chat (each ↔ admin). */
export type ThreadId = 'walk' | 'support-owner' | 'support-walker'
export type Sender = 'owner' | 'walker' | 'admin' | 'system'
export type Msg = { id: string; from: Sender; text: string; at: string; photo?: MediaKey; read?: boolean; ref?: string }

export const SEED_THREADS: Record<ThreadId, Msg[]> = {
  walk: [
    { id: 'w0', from: 'system', text: 'Booking VF-240781 confirmed. Chat is open until the walk is closed. Phone numbers stay private.', at: '7:31 am' },
    { id: 'w1', from: 'walker', text: 'Good morning Ananya! Arjun here. I will be at Homeland Heights by 8. Which gate works best?', at: '7:33 am', read: true },
    { id: 'w2', from: 'owner', text: 'Morning! Gate 2 please, the guard has your name. Tower B lobby.', at: '7:34 am', read: true },
    { id: 'w3', from: 'owner', text: 'Leash is by the door. Bruno pulls for the first five minutes, then he is fine.', at: '7:34 am', read: true },
    { id: 'w4', from: 'walker', text: 'Noted. I will keep him on the short lead till the park. Any treats to avoid?', at: '7:36 am', read: true },
    { id: 'w5', from: 'owner', text: 'No chicken treats please. His own biscuits are in the side pocket of the leash bag.', at: '7:37 am', read: true },
    { id: 'w6', from: 'walker', text: 'Perfect. Leaving Phase 7 now.', at: '7:41 am', read: true },
  ],
  'support-owner': [
    { id: 'so1', from: 'owner', text: 'Hi, I uploaded Sheru’s Bordetella certificate on Monday. It still says Under Review.', at: 'Thu 6:12 pm', ref: 'Sheru · Bordetella' },
    { id: 'so2', from: 'admin', text: 'Hi Ananya, Kavya from Vuffora here. The scan is cut off at the bottom, so the vet’s stamp and batch number are not readable. Could you re-upload a full-page photo?', at: 'Thu 6:20 pm' },
    { id: 'so3', from: 'owner', text: 'Uploaded a new photo just now, the full page this time.', at: 'Fri 9:05 am', photo: 'sheru' },
    { id: 'so4', from: 'admin', text: 'Got it, thank you. It is in today’s queue. Sheru can be booked as soon as it is approved.', at: 'Fri 9:11 am' },
  ],
  'support-walker': [
    { id: 'sw1', from: 'walker', text: 'Hello, my payout of ₹3,240 from Monday has not reached my HDFC account.', at: 'Wed 4:40 pm', ref: 'Payout PO-55102' },
    { id: 'sw2', from: 'admin', text: 'Hi Arjun, it was held because the bank returned the first attempt. We have re-sent it to your UPI ID. You should see it within two hours.', at: 'Wed 4:52 pm' },
    { id: 'sw3', from: 'walker', text: 'Received, thank you. Also, my police verification renewal is uploaded.', at: 'Wed 6:31 pm' },
    { id: 'sw4', from: 'admin', text: 'Seen. It is with compliance and your Aggressive Breed badge stays active meanwhile.', at: 'Wed 6:35 pm' },
  ],
}

export const QUICK_OWNER = ['I’m at the gate', 'Leash is by the door', 'Please ring the bell', 'Running 2 minutes late', 'OTP is on my screen']
export const QUICK_WALKER = ['I’ve arrived at the gate', 'On my way, 5 minutes', 'Bruno is doing great', 'Heading back now', 'Please share the OTP']
export const QUICK_ADMIN = ['Thanks, checking now', 'Please re-upload a clearer photo', 'Approved, you are all set', 'Refund initiated']

/* ── Admin queue 1: owner vetting (vaccination certificates) ──
   Deciding `vq1` flips Sheru's Bordetella status in the Owner App. */
export type VetState = 'pending' | 'approved' | 'rejected'
export type VetCase = {
  id: string
  owner: string
  ownerPhoto: MediaKey
  city: City
  locality: string
  dog: string
  dogPhoto: MediaKey
  breed: string
  temperament: Temperament
  doc: 'Rabies' | 'DHPP' | 'Bordetella'
  file: string
  given: string
  expires: string
  vet: string
  batch: string
  submitted: string
  flag?: string
  state: VetState
}
export const VET_QUEUE: VetCase[] = [
  { id: 'vq1', owner: 'Ananya Sharma', ownerPhoto: 'ananya', city: 'Mohali', locality: 'Sector 70', dog: 'Sheru', dogPhoto: 'sheru', breed: 'German Shepherd', temperament: 'reactive', doc: 'Bordetella', file: 'sheru-bordetella-full.jpg', given: '09 Nov 2026', expires: '09 Nov 2027', vet: 'Dr. R. Dhillon, PawCare Clinic, Phase 5', batch: 'BRD-7741K', submitted: 'Fri 9:05 am', flag: 'Re-upload after a cropped scan', state: 'pending' },
  { id: 'vq2', owner: 'Dev Khanna', ownerPhoto: 'dev', city: 'Chandigarh', locality: 'Sector 35', dog: 'Oreo', dogPhoto: 'indie', breed: 'Indie', temperament: 'calm', doc: 'Rabies', file: 'oreo-rabies.pdf', given: '01 Nov 2026', expires: '01 Nov 2027', vet: 'Dr. S. Bajwa, Govt. Veterinary Hospital, Sector 22', batch: 'RAB-20931', submitted: 'Today 7:10 am', state: 'pending' },
  { id: 'vq3', owner: 'Tara Oberoi', ownerPhoto: 'tara', city: 'Delhi NCR', locality: 'DLF Phase 2, Gurugram', dog: 'Laila', dogPhoto: 'husky', breed: 'Siberian Husky', temperament: 'calm', doc: 'DHPP', file: 'laila-dhpp.jpg', given: '14 Nov 2025', expires: '14 Nov 2026', vet: 'Dr. A. Mehra, CGS Hospital, Gurugram', batch: 'DHP-11802', submitted: 'Today 6:48 am', flag: 'Expires today', state: 'pending' },
  { id: 'vq4', owner: 'Aman Grewal', ownerPhoto: 'aman', city: 'Mohali', locality: 'Phase 10', dog: 'Tyson', dogPhoto: 'lickLab', breed: 'Labrador Retriever', temperament: 'reactive', doc: 'Rabies', file: 'tyson-rabies.pdf', given: '22 Oct 2026', expires: '22 Oct 2027', vet: 'Dr. P. Sidhu, Mohali Pet Clinic', batch: 'RAB-20418', submitted: 'Yesterday 8:32 pm', flag: 'Walker reported lunging; owner tagged Calm', state: 'pending' },
  { id: 'vq5', owner: 'Isha Chawla', ownerPhoto: 'isha', city: 'Delhi NCR', locality: 'Sector 50, Noida', dog: 'Mishti', dogPhoto: 'spitz', breed: 'Indian Spitz', temperament: 'calm', doc: 'Bordetella', file: 'mishti-bordetella.jpg', given: '30 Oct 2026', expires: '30 Oct 2027', vet: 'Dr. N. Tyagi, Noida Vet Care', batch: 'BRD-7702C', submitted: 'Yesterday 5:15 pm', state: 'pending' },
  { id: 'vq6', owner: 'Rhea Suri', ownerPhoto: 'rhea', city: 'Chandigarh', locality: 'Sector 8', dog: 'Biscuit', dogPhoto: 'beagle', breed: 'Beagle', temperament: 'calm', doc: 'DHPP', file: 'biscuit-dhpp.pdf', given: '05 Nov 2026', expires: '05 Nov 2027', vet: 'Dr. K. Walia, Sector 9 Pet Hospital', batch: 'DHP-12110', submitted: 'Yesterday 2:02 pm', state: 'pending' },
  { id: 'vq7', owner: 'Neha Arora', ownerPhoto: 'neha', city: 'Mohali', locality: 'Sector 66', dog: 'Pablo', dogPhoto: 'pugYellow', breed: 'Pug', temperament: 'calm', doc: 'Rabies', file: 'pablo-rabies.jpg', given: '11 Aug 2025', expires: '11 Aug 2026', vet: 'Dr. P. Sidhu, Mohali Pet Clinic', batch: 'RAB-18077', submitted: 'Thu 11:40 am', flag: 'Certificate expired 3 months ago', state: 'pending' },
  { id: 'vq8', owner: 'Kabir Anand', ownerPhoto: 'kabir', city: 'Delhi NCR', locality: 'Vasant Kunj, New Delhi', dog: 'Zoro', dogPhoto: 'indieStreet', breed: 'Indie', temperament: 'calm', doc: 'DHPP', file: 'zoro-dhpp.pdf', given: '28 Oct 2026', expires: '28 Oct 2027', vet: 'Dr. V. Rao, Friendicoes, Defence Colony', batch: 'DHP-12066', submitted: 'Thu 9:18 am', state: 'pending' },
]
/** the vetting case that belongs to the demo owner */
export const OWNER_CASE_ID = 'vq1'

/* ── Admin queue 2: walker KYC ──
   Deciding `kq1` flips Arjun's police-verification status in the Walker App. */
export type KycDoc = { name: 'Aadhaar Card' | 'PAN Card' | 'Police Verification' | 'Cancelled cheque / UPI'; file: string; state: 'verified' | 'review' | 'missing' | 'rejected'; note?: string }
export type KycCase = {
  id: string
  walkerId?: string
  name: string
  photo: MediaKey
  city: City
  locality: string
  experience: string
  wantsCertified: boolean
  radiusKm: number
  submitted: string
  docs: KycDoc[]
  state: VetState
}
export const KYC_QUEUE: KycCase[] = [
  { id: 'kq1', walkerId: 'arjun', name: 'Arjun Mehta', photo: 'arjun', city: 'Mohali', locality: 'Phase 7', experience: '4 yrs · large and reactive breeds', wantsCertified: true, radiusKm: 5, submitted: 'Wed 6:31 pm', state: 'pending', docs: [
    { name: 'Aadhaar Card', file: 'aadhaar-xxxx-4471.pdf', state: 'verified' },
    { name: 'PAN Card', file: 'pan-ABCPM####K.pdf', state: 'verified' },
    { name: 'Police Verification', file: 'pvc-renewal-2026.pdf', state: 'review', note: 'Annual renewal, issued by SSP Office, SAS Nagar' },
    { name: 'Cancelled cheque / UPI', file: 'arjun.mehta@okhdfc', state: 'verified' },
  ] },
  { id: 'kq2', name: 'Harleen Brar', photo: 'meera', city: 'Mohali', locality: 'Sector 78', experience: '1 yr · small breeds', wantsCertified: false, radiusKm: 3, submitted: 'Today 7:20 am', state: 'pending', docs: [
    { name: 'Aadhaar Card', file: 'aadhaar-xxxx-9034.jpg', state: 'review' },
    { name: 'PAN Card', file: 'pan-harleen.jpg', state: 'review' },
    { name: 'Police Verification', file: 'pvc-harleen.pdf', state: 'review' },
    { name: 'Cancelled cheque / UPI', file: 'harleen.b@oksbi', state: 'review' },
  ] },
  { id: 'kq3', name: 'Mohit Saini', photo: 'dev', city: 'Chandigarh', locality: 'Sector 44', experience: '3 yrs · kennel assistant', wantsCertified: true, radiusKm: 6, submitted: 'Yesterday 9:44 pm', state: 'pending', docs: [
    { name: 'Aadhaar Card', file: 'aadhaar-xxxx-2210.pdf', state: 'verified' },
    { name: 'PAN Card', file: 'pan-mohit.pdf', state: 'verified' },
    { name: 'Police Verification', file: 'not uploaded', state: 'missing', note: 'Applied on 10 Nov, receipt attached' },
    { name: 'Cancelled cheque / UPI', file: 'cheque-pnb.jpg', state: 'review' },
  ] },
  { id: 'kq4', name: 'Ritika Jain', photo: 'priya', city: 'Delhi NCR', locality: 'Indirapuram, Ghaziabad', experience: '2 yrs · pet sitter', wantsCertified: false, radiusKm: 4, submitted: 'Yesterday 3:12 pm', state: 'pending', docs: [
    { name: 'Aadhaar Card', file: 'aadhaar-xxxx-5518.pdf', state: 'verified' },
    { name: 'PAN Card', file: 'pan-ritika.pdf', state: 'review', note: 'Name spelling differs from Aadhaar' },
    { name: 'Police Verification', file: 'pvc-ritika.pdf', state: 'verified' },
    { name: 'Cancelled cheque / UPI', file: 'ritika.jain@okicici', state: 'verified' },
  ] },
  { id: 'kq5', name: 'Sameer Khan', photo: 'aman', city: 'Delhi NCR', locality: 'Sector 45, Gurugram', experience: '5 yrs · guard breeds', wantsCertified: true, radiusKm: 8, submitted: 'Thu 1:05 pm', state: 'pending', docs: [
    { name: 'Aadhaar Card', file: 'aadhaar-xxxx-7781.pdf', state: 'verified' },
    { name: 'PAN Card', file: 'pan-sameer.pdf', state: 'verified' },
    { name: 'Police Verification', file: 'pvc-sameer.pdf', state: 'verified' },
    { name: 'Cancelled cheque / UPI', file: 'cheque-axis.jpg', state: 'verified' },
  ] },
  { id: 'kq6', name: 'Jaspreet Kaur', photo: 'simran', city: 'Chandigarh', locality: 'Sector 15', experience: 'New · student', wantsCertified: false, radiusKm: 2, submitted: 'Thu 10:20 am', state: 'pending', docs: [
    { name: 'Aadhaar Card', file: 'aadhaar-blurred.jpg', state: 'rejected', note: 'Photo is blurred, number not readable' },
    { name: 'PAN Card', file: 'pan-jaspreet.jpg', state: 'review' },
    { name: 'Police Verification', file: 'pvc-jaspreet.pdf', state: 'review' },
    { name: 'Cancelled cheque / UPI', file: 'jaspreet15@okaxis', state: 'review' },
  ] },
]
export const WALKER_CASE_ID = 'kq1'
