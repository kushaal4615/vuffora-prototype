import type { Temperament } from './cast'
import type { Duration } from './core'
import type { MediaKey } from './media'

/* Lists for the Dog Walker App (Arjun Mehta). Payouts are never stored
   here: every screen works them out from the admin's rate card through
   quote(), so a commission change in the admin moves these too. */

export type JobState = 'done' | 'next' | 'upcoming'
export type TodayJob = {
  id: string
  time: string
  dog: string
  breed: string
  photo: MediaKey
  temperament: Temperament
  duration: Duration
  locality: string
  owner: string
  state: JobState
  /** the shared walk that runs through all three platforms */
  live?: boolean
}

/** Today, Sat 14 Nov. It is 7:42 am: two walks done, Bruno is next. */
export const TODAY_JOBS: TodayJob[] = [
  { id: 'VF-240774', time: '5:45 am', dog: 'Simba', breed: 'Golden Retriever', photo: 'goldenFace', temperament: 'calm', duration: 45, locality: 'Phase 7, Mohali', owner: 'Meera Sodhi', state: 'done' },
  { id: 'VF-240777', time: '6:40 am', dog: 'Tyson', breed: 'Labrador Retriever', photo: 'lickLab', temperament: 'reactive', duration: 60, locality: 'Phase 10, Mohali', owner: 'Aman Grewal', state: 'done' },
  { id: 'VF-240781', time: '8:00 am', dog: 'Bruno', breed: 'Labrador Retriever', photo: 'bruno', temperament: 'calm', duration: 45, locality: 'Sector 70, Mohali', owner: 'Ananya Sharma', state: 'next', live: true },
  { id: 'VF-240786', time: '9:15 am', dog: 'Coco', breed: 'Beagle', photo: 'beagle', temperament: 'calm', duration: 30, locality: 'Sector 69, Mohali', owner: 'Priya Malhotra', state: 'upcoming' },
  { id: 'VF-240790', time: '10:30 am', dog: 'Storm', breed: 'Siberian Husky', photo: 'huskyBlue', temperament: 'reactive', duration: 45, locality: 'Sector 71, Mohali', owner: 'Vikram Bedi', state: 'upcoming' },
  { id: 'VF-240803', time: '5:00 pm', dog: 'Zoro', breed: 'Indie', photo: 'indieStreet', temperament: 'calm', duration: 45, locality: 'Phase 3B2, Mohali', owner: 'Kabir Anand', state: 'upcoming' },
  { id: 'VF-240809', time: '6:15 pm', dog: 'Momo', breed: 'Shih Tzu', photo: 'shihtzu', temperament: 'calm', duration: 30, locality: 'Sector 68, Mohali', owner: 'Simran Kaur', state: 'upcoming' },
  { id: 'VF-240815', time: '7:30 pm', dog: 'Pablo', breed: 'Pug', photo: 'pugYellow', temperament: 'calm', duration: 30, locality: 'Sector 66, Mohali', owner: 'Neha Arora', state: 'upcoming' },
]

/** Net earnings by hour on a typical Saturday, for the hero sparkline */
export const TODAY_SPARK = [0, 0, 223, 223, 598, 598, 598]
/** What Arjun had earned by 7:42 am yesterday */
export const YESTERDAY_BY_NOW = 446
export const ONLINE_SINCE = '5:30 am'
export const HOURS_ONLINE = '2 h 12 m'

/* ── Wallet ── */
/** Gross walk fees earned since the last payout cycle, before commission */
export const WALLET_GROSS = 8100

export type LedgerKind = 'walk' | 'tip' | 'withdrawal' | 'held' | 'bonus'
export type LedgerEntry = {
  id: string
  kind: LedgerKind
  when: string
  title: string
  sub: string
  photo?: MediaKey
  /** walk credits: priced from the rate card */
  duration?: Duration
  temperament?: Temperament
  /** fixed amounts (tips, bonuses, withdrawals): positive = credit */
  amount?: number
}

export const LEDGER: LedgerEntry[] = [
  { id: 'L-9921', kind: 'held', when: 'Today, 7:41 am', title: 'Tyson · 60 min walk', sub: 'Held until Aman reviews', photo: 'lickLab', duration: 60, temperament: 'reactive' },
  { id: 'L-9918', kind: 'walk', when: 'Today, 6:32 am', title: 'Simba · 45 min walk', sub: 'VF-240774 · Phase 7', photo: 'goldenFace', duration: 45, temperament: 'calm' },
  { id: 'L-9917', kind: 'tip', when: 'Today, 6:34 am', title: 'Tip from Meera', sub: 'Tips are yours in full, no commission', photo: 'meera', amount: 50 },
  { id: 'L-9902', kind: 'walk', when: 'Fri, 7:44 pm', title: 'Pablo · 30 min walk', sub: 'VF-240768 · Sector 66', photo: 'pugYellow', duration: 30, temperament: 'calm' },
  { id: 'L-9897', kind: 'walk', when: 'Fri, 6:02 pm', title: 'Storm · 45 min walk', sub: 'VF-240761 · Sector 71', photo: 'huskyBlue', duration: 45, temperament: 'reactive' },
  { id: 'L-9890', kind: 'withdrawal', when: 'Fri, 1:10 pm', title: 'Withdrawal to UPI', sub: 'PO-55140 · arjun.mehta@okhdfc', amount: -3000 },
  { id: 'L-9884', kind: 'walk', when: 'Fri, 8:51 am', title: 'Bruno · 45 min walk', sub: 'VF-240766 · Sector 70', photo: 'bruno', duration: 45, temperament: 'calm' },
  { id: 'L-9879', kind: 'walk', when: 'Fri, 7:12 am', title: 'Coco · 30 min walk', sub: 'VF-240759 · Sector 69', photo: 'beagle', duration: 30, temperament: 'calm' },
  { id: 'L-9871', kind: 'bonus', when: 'Thu, 9:00 pm', title: 'Early bird bonus', sub: '10 walks before 8 am this week', amount: 150 },
  { id: 'L-9866', kind: 'walk', when: 'Thu, 6:48 pm', title: 'Zoro · 60 min walk', sub: 'VF-240744 · Phase 3B2', photo: 'indieStreet', duration: 60, temperament: 'calm' },
  { id: 'L-9860', kind: 'walk', when: 'Thu, 7:35 am', title: 'Tyson · 45 min walk', sub: 'VF-240738 · Phase 10', photo: 'lickLab', duration: 45, temperament: 'reactive' },
  { id: 'L-9853', kind: 'tip', when: 'Wed, 7:20 pm', title: 'Tip from Vikram', sub: 'Tips are yours in full, no commission', photo: 'vikram', amount: 100 },
  { id: 'L-9849', kind: 'walk', when: 'Wed, 6:10 pm', title: 'Momo · 30 min walk', sub: 'VF-240722 · Sector 68', photo: 'shihtzu', duration: 30, temperament: 'calm' },
  { id: 'L-9841', kind: 'walk', when: 'Wed, 6:55 am', title: 'Simba · 45 min walk', sub: 'VF-240715 · Phase 7', photo: 'goldenFace', duration: 45, temperament: 'calm' },
]

export type PayoutRow = { id: string; when: string; amount: number; to: string; state: 'paid' | 'processing' | 'returned'; note: string }
export const PAYOUT_HISTORY: PayoutRow[] = [
  { id: 'PO-55140', when: 'Fri 13 Nov, 1:10 pm', amount: 3000, to: 'UPI · arjun.mehta@okhdfc', state: 'processing', note: 'With the bank. Usually under 2 hours.' },
  { id: 'PO-55102', when: 'Mon 9 Nov, 6:02 pm', amount: 3240, to: 'UPI · arjun.mehta@okhdfc', state: 'paid', note: 'Re-sent to UPI after the bank returned it.' },
  { id: 'PO-55101', when: 'Mon 9 Nov, 11:30 am', amount: 3240, to: 'HDFC Bank ···· 4471', state: 'returned', note: 'Returned by bank: IFSC mismatch. Nothing was deducted.' },
  { id: 'PO-54877', when: 'Mon 2 Nov, 10:15 am', amount: 4120, to: 'UPI · arjun.mehta@okhdfc', state: 'paid', note: 'Reached in 14 minutes.' },
  { id: 'PO-54630', when: 'Mon 26 Oct, 10:04 am', amount: 3875, to: 'UPI · arjun.mehta@okhdfc', state: 'paid', note: 'Reached in 9 minutes.' },
]

/** Net earnings per day, last 14 days (uneven on purpose: a rain day, two big Sundays) */
export const DAILY_NET: { day: string; net: number; walks: number }[] = [
  { day: '1 Nov', net: 1420, walks: 6 },
  { day: '2 Nov', net: 860, walks: 4 },
  { day: '3 Nov', net: 1015, walks: 5 },
  { day: '4 Nov', net: 310, walks: 1 },
  { day: '5 Nov', net: 1180, walks: 5 },
  { day: '6 Nov', net: 945, walks: 4 },
  { day: '7 Nov', net: 1630, walks: 7 },
  { day: '8 Nov', net: 1775, walks: 8 },
  { day: '9 Nov', net: 720, walks: 3 },
  { day: '10 Nov', net: 1090, walks: 5 },
  { day: '11 Nov', net: 1240, walks: 5 },
  { day: '12 Nov', net: 1365, walks: 6 },
  { day: '13 Nov', net: 1510, walks: 7 },
  { day: '14 Nov', net: 598, walks: 2 },
]

/* ── Availability ── */
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type DayKey = (typeof DAYS)[number]
export const SHIFTS = [
  { id: 'AM', label: 'Morning', hours: '6 to 10', span: 4 },
  { id: 'PM', label: 'Afternoon', hours: '12 to 4', span: 4 },
  { id: 'EVE', label: 'Evening', hours: '5 to 9', span: 4 },
] as const
export const slotKey = (day: string, shift: string) => `${day}-${shift}`
export const ALL_SLOTS: string[] = DAYS.flatMap((d) => SHIFTS.map((s) => slotKey(d, s.id)))

/** Recurring bookings already sitting in each weekly slot */
export const SLOT_BOOKINGS: Record<string, number> = {
  'Mon-AM': 3, 'Mon-EVE': 2,
  'Tue-AM': 2, 'Tue-PM': 1, 'Tue-EVE': 2,
  'Wed-AM': 3, 'Wed-EVE': 1,
  'Thu-AM': 2, 'Thu-EVE': 3,
  'Fri-AM': 3, 'Fri-PM': 1, 'Fri-EVE': 2,
  'Sat-AM': 5, 'Sat-EVE': 3,
  'Sun-EVE': 2,
}

export type UpcomingBooking = { id: string; day: string; time: string; dog: string; breed: string; photo: MediaKey; temperament: Temperament; duration: Duration; locality: string; pass?: boolean }
export const UPCOMING: UpcomingBooking[] = [
  { id: 'VF-240786', day: 'Today, Sat 14 Nov', time: '9:15 am', dog: 'Coco', breed: 'Beagle', photo: 'beagle', temperament: 'calm', duration: 30, locality: 'Sector 69' },
  { id: 'VF-240790', day: 'Today, Sat 14 Nov', time: '10:30 am', dog: 'Storm', breed: 'Siberian Husky', photo: 'huskyBlue', temperament: 'reactive', duration: 45, locality: 'Sector 71' },
  { id: 'VF-240803', day: 'Today, Sat 14 Nov', time: '5:00 pm', dog: 'Zoro', breed: 'Indie', photo: 'indieStreet', temperament: 'calm', duration: 45, locality: 'Phase 3B2', pass: true },
  { id: 'VF-240809', day: 'Today, Sat 14 Nov', time: '6:15 pm', dog: 'Momo', breed: 'Shih Tzu', photo: 'shihtzu', temperament: 'calm', duration: 30, locality: 'Sector 68' },
  { id: 'VF-240832', day: 'Sun 15 Nov', time: '5:30 pm', dog: 'Oscar', breed: 'Corgi', photo: 'corgi', temperament: 'calm', duration: 45, locality: 'Sector 70' },
  { id: 'VF-240836', day: 'Sun 15 Nov', time: '7:00 pm', dog: 'Tyson', breed: 'Labrador Retriever', photo: 'lickLab', temperament: 'reactive', duration: 60, locality: 'Phase 10' },
  { id: 'VF-240851', day: 'Mon 16 Nov', time: '6:15 am', dog: 'Simba', breed: 'Golden Retriever', photo: 'goldenFace', temperament: 'calm', duration: 45, locality: 'Phase 7', pass: true },
  { id: 'VF-240853', day: 'Mon 16 Nov', time: '7:30 am', dog: 'Bruno', breed: 'Labrador Retriever', photo: 'bruno', temperament: 'calm', duration: 45, locality: 'Sector 70', pass: true },
  { id: 'VF-240858', day: 'Mon 16 Nov', time: '8:45 am', dog: 'Milo', breed: 'Cocker Spaniel', photo: 'cocker', temperament: 'calm', duration: 30, locality: 'Sector 71' },
  { id: 'VF-240866', day: 'Mon 16 Nov', time: '6:00 pm', dog: 'Storm', breed: 'Siberian Husky', photo: 'huskyBlue', temperament: 'reactive', duration: 45, locality: 'Sector 71' },
  { id: 'VF-240879', day: 'Tue 17 Nov', time: '6:30 am', dog: 'Bella', breed: 'Goldendoodle', photo: 'doodle', temperament: 'calm', duration: 45, locality: 'Sector 69' },
]

/* ── Profile ── */
export const RATING_BREAKDOWN: { stars: number; count: number }[] = [
  { stars: 5, count: 188 },
  { stars: 4, count: 19 },
  { stars: 3, count: 4 },
  { stars: 2, count: 1 },
  { stars: 1, count: 0 },
]
export const SERVICE_LOCALITIES = ['Phase 7', 'Sector 70', 'Sector 69', 'Sector 71', 'Phase 3B2', 'Sector 68', 'Phase 10']
export const WALKER_STATS = { acceptance: 94, onTime: 98, repeat: 71 }

/* ── Partner support ── */
export const PARTNER_FAQS: { id: string; q: string; a: string; topic: 'Payouts' | 'Jobs' | 'KYC' | 'On the walk' }[] = [
  { id: 'pf1', topic: 'Payouts', q: 'When does a walk payout reach my wallet?', a: 'The net amount is credited the moment the Check-Out OTP is verified. It is held until the owner reviews the walk, or for 2 hours, whichever comes first. After that you can withdraw it to your UPI ID or bank account.' },
  { id: 'pf2', topic: 'Payouts', q: 'How is the platform commission worked out?', a: 'Commission is a percentage of the walk fee and the aggressive-dog surcharge. It is shown on every job request before you accept, so the net payout you see is the amount you get. Tips and bonuses carry no commission.' },
  { id: 'pf3', topic: 'Jobs', q: 'Does declining a job affect my rating?', a: 'No. Declining never touches your star rating. Your acceptance rate is shown on your profile, and if it drops below 60% for a week you get fewer instant requests until it recovers.' },
  { id: 'pf4', topic: 'KYC', q: 'How do I get the Aggressive Breed Certified badge?', a: 'Tick the certification option in onboarding, add at least 2 years of handling experience with large or reactive breeds, and pass the short handling assessment at the Mohali or Gurugram centre. The admin grants the badge and it unlocks the surcharge jobs.' },
  { id: 'pf5', topic: 'On the walk', q: 'What if the owner is not home at pickup?', a: 'Message them in the chat and wait 10 minutes at the gate. If there is no reply, tap Support on the pickup screen. The admin cancels the job and you are paid the waiting fee.' },
  { id: 'pf6', topic: 'On the walk', q: 'The OTP is not being accepted. What now?', a: 'Ask the owner to read the 4 digits from their screen again; a code is valid for 10 minutes and a new one appears after that. If it still fails, open the chat with Admin from the keypad screen and we will verify the handover manually.' },
  { id: 'pf7', topic: 'On the walk', q: 'How do I report an incident during a walk?', a: 'Tap Incident / SOS on the walk console. It opens a priority chat with the admin and shares your live GPS position. For an injury, call the emergency number shown there first, then tell us.' },
  { id: 'pf8', topic: 'Jobs', q: 'Can I change my service radius?', a: 'Yes, any time, from Documents and KYC on your profile. A smaller radius means shorter trips to pickup; a larger one means more requests. The change applies to new requests straight away.' },
  { id: 'pf9', topic: 'KYC', q: 'My police verification is under review. Can I still work?', a: 'Yes. During an annual renewal your existing certificate stays valid and your badge stays active. You will get a notification as soon as the admin approves or asks for a clearer copy.' },
]
