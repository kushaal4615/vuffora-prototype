import type { City, Temperament } from './cast'
import type { Duration } from './core'
import type { MediaKey } from './media'

/* Data for the operations half of the Super Admin portal: the live map,
   the payout and refund ledgers, the dispute files, review moderation,
   the analytics series, the demand heatmap and the settings tables.
   Everyone is fictional; figures are demo values with believable shapes. */

type Pt = [number, number]

/* Small seeded generator so every series is the same on every load. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ── Live operations ───────────────────────────────────────── */

export type LiveWalk = {
  id: string
  walkerId: string
  walker: string
  walkerPhoto: MediaKey
  dog: string
  breed: string
  temper: Temperament
  owner: string
  ownerPhoto: MediaKey
  locality: string
  city: City
  booked: Duration
  /** minutes walked when the page opens */
  elapsed: number
  checkIn: string
  checkOutDue: string
  late?: string
  route: Pt[]
  lat: number
  lng: number
  logs: { at: string; text: string }[]
}

/** Bruno's walk is not in this list: the page builds it from the session store. */
export const LIVE_WALKS: LiveWalk[] = [
  { id: 'VF-240779', walkerId: 'gurpreet', walker: 'Gurpreet Sandhu', walkerPhoto: 'gurpreet', dog: 'Tyson', breed: 'Labrador Retriever', temper: 'reactive', owner: 'Aman Grewal', ownerPhoto: 'aman', locality: 'Phase 10, Mohali', city: 'Mohali', booked: 60, elapsed: 38, checkIn: '7:04 am', checkOutDue: '8:04 am', route: [[8, 44], [20, 44], [20, 32], [8, 32], [8, 44]], lat: 30.6841, lng: 76.7412, logs: [{ at: '7:04 am', text: 'Check-In OTP verified. Muzzle on at the gate.' }, { at: '7:19 am', text: 'Pee break near the Phase 10 market wall.' }, { at: '7:33 am', text: 'Crossed two dogs on a short leash. No lunging.' }] },
  { id: 'VF-240774', walkerId: 'pooja', walker: 'Pooja Bhatia', walkerPhoto: 'pooja', dog: 'Pablo', breed: 'Pug', temper: 'calm', owner: 'Neha Arora', ownerPhoto: 'neha', locality: 'Sector 66, Mohali', city: 'Mohali', booked: 30, elapsed: 21, checkIn: '7:21 am', checkOutDue: '7:51 am', route: [[20, 20], [32, 20], [32, 32], [20, 32], [20, 20]], lat: 30.6779, lng: 76.7398, logs: [{ at: '7:21 am', text: 'Check-In OTP verified at the house gate.' }, { at: '7:30 am', text: 'Water break. Pablo is panting, slowing the pace.' }, { at: '7:38 am', text: 'Photo check-in from the Sector 66 park.' }] },
  { id: 'VF-240771', walkerId: 'rohan', walker: 'Rohan Kapoor', walkerPhoto: 'rohan', dog: 'Simba', breed: 'Golden Retriever', temper: 'calm', owner: 'Meera Sodhi', ownerPhoto: 'meera', locality: 'Phase 3B2, Mohali', city: 'Mohali', booked: 45, elapsed: 49, checkIn: '6:53 am', checkOutDue: '7:38 am', late: 'Running 4 min late', route: [[80, 8], [92, 8], [92, 20], [80, 20], [80, 8]], lat: 30.7112, lng: 76.7201, logs: [{ at: '6:53 am', text: 'Check-In OTP verified. Jog walk started.' }, { at: '7:12 am', text: 'Poop logged and bagged near the 3B2 market.' }, { at: '7:36 am', text: 'Road dug up on the return lane, taking the long side.' }] },
  { id: 'VF-240776', walkerId: 'sahil', walker: 'Sahil Verma', walkerPhoto: 'sahil', dog: 'Coco', breed: 'Beagle', temper: 'calm', owner: 'Priya Malhotra', ownerPhoto: 'priya', locality: 'Sector 68, Mohali', city: 'Mohali', booked: 30, elapsed: 9, checkIn: '7:33 am', checkOutDue: '8:03 am', route: [[8, 56], [8, 68], [20, 68], [20, 56], [8, 56]], lat: 30.6893, lng: 76.7266, logs: [{ at: '7:33 am', text: 'Check-In OTP verified at Tower C.' }, { at: '7:40 am', text: 'Pee break by the Sector 68 green belt.' }] },
  { id: 'VF-240772', walkerId: 'tenzin', walker: 'Tenzin Dorje', walkerPhoto: 'tenzin', dog: 'Momo', breed: 'Shih Tzu', temper: 'calm', owner: 'Simran Kaur', ownerPhoto: 'simran', locality: 'Sector 79, Mohali', city: 'Mohali', booked: 45, elapsed: 31, checkIn: '7:11 am', checkOutDue: '7:56 am', route: [[92, 80], [92, 92], [80, 92], [80, 80], [92, 80]], lat: 30.6718, lng: 76.7153, logs: [{ at: '7:11 am', text: 'Check-In OTP verified. Quiet lane route.' }, { at: '7:24 am', text: 'Pee break. Momo nervous near the school bus.' }, { at: '7:35 am', text: 'Photo check-in at the Sector 79 park bench.' }] },
  { id: 'VF-240768', walkerId: 'imran', walker: 'Imran Qureshi', walkerPhoto: 'imran', dog: 'Rocky', breed: 'Rottweiler', temper: 'reactive', owner: 'Vikram Bedi', ownerPhoto: 'vikram', locality: 'Sector 35, Chandigarh', city: 'Chandigarh', booked: 60, elapsed: 44, checkIn: '6:58 am', checkOutDue: '7:58 am', route: [[80, 68], [92, 68], [92, 56], [80, 56], [80, 68]], lat: 30.7226, lng: 76.7609, logs: [{ at: '6:58 am', text: 'Check-In OTP verified. Muzzle and double leash.' }, { at: '7:15 am', text: 'Held Rocky back from a scooter at the Sector 35 light.' }, { at: '7:31 am', text: 'Water break in the shade.' }] },
  { id: 'VF-240777', walkerId: 'karan', walker: 'Karan Gill', walkerPhoto: 'karan', dog: 'Biscuit', breed: 'Beagle', temper: 'calm', owner: 'Rhea Suri', ownerPhoto: 'rhea', locality: 'Sector 8, Chandigarh', city: 'Chandigarh', booked: 30, elapsed: 14, checkIn: '7:28 am', checkOutDue: '7:58 am', route: [[92, 44], [92, 32], [80, 32], [80, 44], [92, 44]], lat: 30.7412, lng: 76.7887, logs: [{ at: '7:28 am', text: 'Check-In OTP verified.' }, { at: '7:37 am', text: 'Poop logged and bagged at the Sector 8 inner market.' }] },
  { id: 'VF-240773', walkerId: 'divya', walker: 'Divya Rawat', walkerPhoto: 'divya', dog: 'Oreo', breed: 'Indie', temper: 'calm', owner: 'Dev Khanna', ownerPhoto: 'dev', locality: 'Sector 17, Chandigarh', city: 'Chandigarh', booked: 45, elapsed: 27, checkIn: '7:15 am', checkOutDue: '8:00 am', route: [[68, 68], [68, 80], [80, 80], [80, 68], [68, 68]], lat: 30.7398, lng: 76.7821, logs: [{ at: '7:15 am', text: 'Check-In OTP verified at the plaza side gate.' }, { at: '7:29 am', text: 'Pee break by the Sector 17 fountain.' }, { at: '7:39 am', text: 'Photo check-in. Oreo is off the pull now.' }] },
  { id: 'VF-240769', walkerId: 'nikhil', walker: 'Nikhil Arora', walkerPhoto: 'nikhil', dog: 'Kaiser', breed: 'Dobermann', temper: 'reactive', owner: 'Tara Oberoi', ownerPhoto: 'tara', locality: 'DLF Phase 3, Gurugram', city: 'Delhi NCR', booked: 60, elapsed: 52, checkIn: '6:50 am', checkOutDue: '7:50 am', route: [[44, 8], [56, 8], [56, 20], [44, 20], [44, 8]], lat: 28.4931, lng: 77.0948, logs: [{ at: '6:50 am', text: 'Check-In OTP verified. Muzzle in the lift.' }, { at: '7:08 am', text: 'Leash reactivity drill at the U Block park.' }, { at: '7:34 am', text: 'Water break. Calm past two joggers.' }] },
  { id: 'VF-240778', walkerId: 'yash', walker: 'Yash Tomar', walkerPhoto: 'yash', dog: 'Mishti', breed: 'Indian Spitz', temper: 'calm', owner: 'Isha Chawla', ownerPhoto: 'isha', locality: 'Sector 62, Noida', city: 'Delhi NCR', booked: 30, elapsed: 17, checkIn: '7:25 am', checkOutDue: '7:55 am', route: [[8, 8], [20, 8], [20, 20], [8, 20], [8, 8]], lat: 28.6274, lng: 77.3653, logs: [{ at: '7:25 am', text: 'Check-In OTP verified at the society gate.' }, { at: '7:36 am', text: 'Pee break on the service lane.' }] },
  { id: 'VF-240770', walkerId: 'farhan', walker: 'Farhan Ali', walkerPhoto: 'farhan', dog: 'Zoro', breed: 'Indie', temper: 'calm', owner: 'Kabir Anand', ownerPhoto: 'kabir', locality: 'Saket, New Delhi', city: 'Delhi NCR', booked: 45, elapsed: 35, checkIn: '7:07 am', checkOutDue: '7:52 am', route: [[56, 92], [68, 92], [68, 80], [56, 80], [56, 92]], lat: 28.5221, lng: 77.2102, logs: [{ at: '7:07 am', text: 'Check-In OTP verified.' }, { at: '7:20 am', text: 'Poop logged and bagged near the Saket district park.' }, { at: '7:33 am', text: 'Photo check-in on the park loop.' }] },
]

/** One GPS fix for walk `w` at sample `k` (4 seconds apart). Deterministic, so rows do not jump as the log grows. */
export function gpsFix(w: { lat: number; lng: number }, k: number) {
  const lat = w.lat + Math.sin(k / 9) * 0.0011 + k * 0.0000041
  const lng = w.lng + Math.cos(k / 7) * 0.0013 + k * 0.0000052
  const speed = 3.9 + Math.sin(k * 1.7) * 0.9 + Math.cos(k / 3) * 0.5
  const acc = 4 + ((k * 7) % 5)
  return { lat: lat.toFixed(5), lng: lng.toFixed(5), speed: Math.max(0.4, speed).toFixed(1), acc }
}

/* ── Pricing: rate card change log ─────────────────────────── */

export type RateChange = { id: string; who: string; photo: MediaKey; when: string; what: string; from: string; to: string }
export const RATE_LOG: RateChange[] = [
  { id: 'rc1', who: 'Kavya Nair', photo: 'kavya', when: 'Thu 12 Nov, 6:40 pm', what: 'Surge rule "Festival days" switched off', from: '1.5×', to: '1.0×' },
  { id: 'rc2', who: 'Kavya Nair', photo: 'kavya', when: 'Sun 8 Nov, 5:05 am', what: 'Surge rule "Festival days" switched on for Diwali', from: '1.0×', to: '1.5×' },
  { id: 'rc3', who: 'Ritu Saxena', photo: 'rhea', when: 'Mon 2 Nov, 11:12 am', what: 'Walk Now convenience fee', from: '₹25', to: '₹30' },
  { id: 'rc4', who: 'Kavya Nair', photo: 'kavya', when: 'Tue 20 Oct, 9:30 am', what: 'Aggressive dog surcharge', from: '₹100', to: '₹120' },
  { id: 'rc5', who: 'Ritu Saxena', photo: 'rhea', when: 'Thu 1 Oct, 10:02 am', what: 'Walk Pass discount', from: '8%', to: '10%' },
  { id: 'rc6', who: 'Kavya Nair', photo: 'kavya', when: 'Mon 14 Sep, 4:48 pm', what: 'Base rate, 45 min walk', from: '₹269', to: '₹279' },
  { id: 'rc7', who: 'Kavya Nair', photo: 'kavya', when: 'Tue 1 Sep, 9:00 am', what: 'Platform commission', from: '18%', to: '20%' },
  { id: 'rc8', who: 'Ritu Saxena', photo: 'rhea', when: 'Mon 17 Aug, 2:15 pm', what: 'Featured listing weekly fee', from: '₹99', to: '₹149' },
  { id: 'rc9', who: 'Kavya Nair', photo: 'kavya', when: 'Sat 1 Aug, 8:00 am', what: 'Launch rate card published for Mohali', from: 'Draft', to: 'Live' },
]

export const SURGE_RULES = [
  { id: 'rain', label: 'Rain', when: 'Auto from the weather feed, per city', mult: 1.3 },
  { id: 'peak', label: '6 to 9 am peak', when: 'Every day, when open requests outnumber walkers online', mult: 1.2 },
  { id: 'festival', label: 'Festival days', when: 'Diwali, Holi, Dussehra and local holidays', mult: 1.5 },
  { id: 'night', label: 'After 9 pm', when: 'Late evening walks, all cities', mult: 1.25 },
] as const

/* ── Payouts ───────────────────────────────────────────────── */

export type PayoutStatus = 'Scheduled' | 'Processing' | 'Paid' | 'On hold' | 'Returned by bank'
export type Payout = { id: string; walkerId: string; period: string; walks: number; gross: number; method: 'UPI' | 'Bank'; account: string; status: PayoutStatus; note?: string }

const P = (id: string, walkerId: string, period: string, walks: number, gross: number, method: 'UPI' | 'Bank', account: string, status: PayoutStatus, note?: string): Payout => ({ id, walkerId, period, walks, gross, method, account, status, note })
export const PAYOUTS: Payout[] = [
  P('PO-55131', 'gurpreet', 'Fri 13 Nov', 6, 2214, 'UPI', 'gurpreet.s@okaxis', 'Scheduled'),
  P('PO-55130', 'imran', 'Fri 13 Nov', 7, 3003, 'Bank', 'SBI ···· 2290', 'Scheduled'),
  P('PO-55129', 'pooja', 'Fri 13 Nov', 4, 1016, 'UPI', 'pooja.bhatia@oksbi', 'Scheduled'),
  P('PO-55128', 'nikhil', 'Fri 13 Nov', 5, 2105, 'UPI', 'nikhil.arora@okicici', 'Processing'),
  P('PO-55127', 'rohan', 'Fri 13 Nov', 3, 837, 'Bank', 'ICICI ···· 7718', 'On hold', 'Dispute open on VF-240702'),
  P('PO-55126', 'farhan', 'Fri 13 Nov', 5, 1675, 'UPI', 'farhan.ali@okhdfc', 'Scheduled'),
  P('PO-55125', 'tenzin', 'Fri 13 Nov', 2, 478, 'UPI', 'tenzin.d@okaxis', 'Scheduled'),
  P('PO-55124', 'karan', 'Fri 13 Nov', 3, 757, 'Bank', 'PNB ···· 0164', 'Returned by bank', 'IFSC mismatch on the first attempt'),
  P('PO-55123', 'divya', 'Fri 13 Nov', 4, 1196, 'UPI', 'divya.rawat@okhdfc', 'Processing'),
  P('PO-55122', 'sahil', 'Fri 13 Nov', 2, 398, 'UPI', 'sahil.v@oksbi', 'Scheduled'),
  P('PO-55121', 'yash', 'Fri 13 Nov', 1, 199, 'UPI', 'yash.tomar@okaxis', 'On hold', 'PAN name differs from bank record'),
  P('PO-55118', 'gurpreet', 'Thu 12 Nov', 5, 1915, 'UPI', 'gurpreet.s@okaxis', 'Paid'),
  P('PO-55117', 'imran', 'Thu 12 Nov', 6, 2654, 'Bank', 'SBI ···· 2290', 'Paid'),
  P('PO-55116', 'pooja', 'Thu 12 Nov', 5, 1235, 'UPI', 'pooja.bhatia@oksbi', 'Paid'),
  P('PO-55115', 'nikhil', 'Thu 12 Nov', 4, 1596, 'UPI', 'nikhil.arora@okicici', 'Paid'),
  P('PO-55114', 'farhan', 'Thu 12 Nov', 6, 2034, 'UPI', 'farhan.ali@okhdfc', 'Paid'),
  P('PO-55113', 'rohan', 'Thu 12 Nov', 4, 1116, 'Bank', 'ICICI ···· 7718', 'Paid'),
  P('PO-55112', 'divya', 'Thu 12 Nov', 3, 917, 'UPI', 'divya.rawat@okhdfc', 'Paid'),
  P('PO-55111', 'tenzin', 'Thu 12 Nov', 3, 757, 'UPI', 'tenzin.d@okaxis', 'Paid'),
  P('PO-55109', 'karan', 'Wed 11 Nov', 2, 478, 'Bank', 'PNB ···· 0164', 'Returned by bank', 'Account frozen, walker informed'),
  P('PO-55108', 'sahil', 'Wed 11 Nov', 3, 677, 'UPI', 'sahil.v@oksbi', 'Paid'),
  P('PO-55107', 'gurpreet', 'Wed 11 Nov', 7, 2573, 'UPI', 'gurpreet.s@okaxis', 'Paid'),
  P('PO-55106', 'imran', 'Wed 11 Nov', 5, 2225, 'Bank', 'SBI ···· 2290', 'Paid'),
  P('PO-55105', 'yash', 'Wed 11 Nov', 2, 398, 'UPI', 'yash.tomar@okaxis', 'Paid'),
]
/** The row that follows the session store: Arjun's payout for Bruno's walk. */
export const ARJUN_PAYOUT_ID = 'PO-55132'

/** Net settled per day, last 14 days (INR). Saturdays and Sundays are heavier. */
export const SETTLED_14D = [14210, 13480, 15120, 16940, 21870, 23450, 15630, 14980, 16210, 17040, 18320, 24610, 26890, 17460]

export type RefundCase = { id: string; booking: string; owner: string; ownerPhoto: MediaKey; dog: string; walker: string; when: string; reason: string; paid: number; kind: 'Cancelled' | 'Disputed' }
export const REFUNDS: RefundCase[] = [
  { id: 'rf1', booking: 'VF-240758', owner: 'Meera Sodhi', ownerPhoto: 'meera', dog: 'Simba', walker: 'Rohan Kapoor', when: 'Today 6:20 am', reason: 'Walker cancelled 10 minutes before the slot', paid: 329, kind: 'Cancelled' },
  { id: 'rf2', booking: 'VF-240702', owner: 'Priya Malhotra', ownerPhoto: 'priya', dog: 'Coco', walker: 'Rohan Kapoor', when: 'Yesterday 7:48 pm', reason: 'Walk ended 14 minutes early, GPS confirms', paid: 329, kind: 'Disputed' },
  { id: 'rf3', booking: 'VF-240744', owner: 'Dev Khanna', ownerPhoto: 'dev', dog: 'Oreo', walker: 'Divya Rawat', when: 'Yesterday 5:02 pm', reason: 'Owner cancelled 3 hours ahead, inside the free window', paid: 235, kind: 'Cancelled' },
  { id: 'rf4', booking: 'VF-240731', owner: 'Vikram Bedi', ownerPhoto: 'vikram', dog: 'Rocky', walker: 'Imran Qureshi', when: 'Yesterday 8:15 am', reason: 'Heavy rain, walk called off at the gate by both sides', paid: 553, kind: 'Cancelled' },
  { id: 'rf5', booking: 'VF-240719', owner: 'Isha Chawla', ownerPhoto: 'isha', dog: 'Mishti', walker: 'Yash Tomar', when: 'Thu 6:40 pm', reason: 'Walker no-show, Check-In OTP never verified', paid: 235, kind: 'Disputed' },
  { id: 'rf6', booking: 'VF-240705', owner: 'Tara Oberoi', ownerPhoto: 'tara', dog: 'Laila', walker: 'Nikhil Arora', when: 'Thu 7:05 am', reason: 'Charged twice by the gateway, second debit to reverse', paid: 412, kind: 'Disputed' },
  { id: 'rf7', booking: 'VF-240698', owner: 'Rhea Suri', ownerPhoto: 'rhea', dog: 'Biscuit', walker: 'Karan Gill', when: 'Wed 6:10 pm', reason: 'Owner cancelled 20 minutes ahead, cancellation fee applies', paid: 270, kind: 'Cancelled' },
  { id: 'rf8', booking: 'VF-240690', owner: 'Kabir Anand', ownerPhoto: 'kabir', dog: 'Zoro', walker: 'Farhan Ali', when: 'Wed 7:32 am', reason: 'Walk Pass walk booked by mistake on a holiday', paid: 296, kind: 'Cancelled' },
  { id: 'rf9', booking: 'VF-240677', owner: 'Neha Arora', ownerPhoto: 'neha', dog: 'Pablo', walker: 'Pooja Bhatia', when: 'Tue 6:55 pm', reason: 'Dog unwell at pickup, walker advised against the walk', paid: 235, kind: 'Cancelled' },
]

/* ── Disputes ──────────────────────────────────────────────── */

export type DisputeEvent = { at: string; label: string; detail?: string; kind: 'booked' | 'otp' | 'log' | 'gap' | 'pay' }
export type DisputeLine = { from: 'owner' | 'walker' | 'system'; text: string; at: string }
export type Dispute = {
  id: string
  booking: string
  owner: string
  ownerPhoto: MediaKey
  walker: string
  walkerPhoto: MediaKey
  dog: string
  temper: Temperament
  raisedBy: 'Owner' | 'Walker'
  claim: string
  detail: string
  amount: number
  age: string
  bookedMin: number
  actualMin: number
  plannedKm: number
  actualKm: number
  /** share of the planned route actually walked, 0 to 1 */
  path: number
  events: DisputeEvent[]
  chat: DisputeLine[]
  /** follows the session store (Bruno's booking) */
  live?: boolean
}

export const DISPUTES: Dispute[] = [
  {
    id: 'dp1', booking: 'VF-240781', owner: 'Ananya Sharma', ownerPhoto: 'ananya', walker: 'Arjun Mehta', walkerPhoto: 'arjun', dog: 'Bruno', temper: 'calm', raisedBy: 'Owner',
    claim: 'Charged the Walk Now fee, says the walk felt short', detail: 'Ananya booked at 7:31 am for 8:00 am and was charged the instant-booking fee. She also believes Bruno was back before the 45 minutes were up.',
    amount: 0, age: '12 min', bookedMin: 45, actualMin: 45, plannedKm: 2.6, actualKm: 2.7, path: 1, live: true,
    events: [], chat: [],
  },
  {
    id: 'dp2', booking: 'VF-240702', owner: 'Priya Malhotra', ownerPhoto: 'priya', walker: 'Rohan Kapoor', walkerPhoto: 'rohan', dog: 'Coco', temper: 'calm', raisedBy: 'Owner',
    claim: 'Walk ended 14 minutes early', detail: 'Priya paid for 45 minutes. The Check-Out OTP was entered 31 minutes after Check-In.',
    amount: 329, age: '14 h', bookedMin: 45, actualMin: 31, plannedKm: 2.6, actualKm: 1.7, path: 0.64,
    events: [
      { at: '5:58 pm', label: 'Booking paid', detail: '45 min, Schedule Later', kind: 'booked' },
      { at: '6:31 pm', label: 'Check-In OTP verified', detail: 'At the owner’s gate, 1 min after the slot', kind: 'otp' },
      { at: '6:44 pm', label: 'Pee break logged', kind: 'log' },
      { at: '7:02 pm', label: 'Check-Out OTP verified', detail: '31 min after Check-In', kind: 'otp' },
      { at: '14 min', label: 'Unwalked time', detail: 'Booked until 7:16 pm. No log, no GPS movement after 7:02 pm.', kind: 'gap' },
      { at: '7:48 pm', label: 'Dispute raised by the owner', kind: 'pay' },
    ],
    chat: [
      { from: 'system', text: 'Booking VF-240702 confirmed. Phone numbers stay private.', at: '5:58 pm' },
      { from: 'walker', text: 'Hi Priya, reaching in 5 minutes.', at: '6:24 pm' },
      { from: 'owner', text: 'Okay, Coco is ready at the door.', at: '6:25 pm' },
      { from: 'walker', text: 'It has started drizzling, bringing Coco back a little early.', at: '6:58 pm' },
      { from: 'owner', text: 'It is barely raining here. I paid for 45 minutes.', at: '7:04 pm' },
      { from: 'walker', text: 'Sorry, I did not want her to get wet. You can raise it with support.', at: '7:06 pm' },
    ],
  },
  {
    id: 'dp3', booking: 'VF-240719', owner: 'Isha Chawla', ownerPhoto: 'isha', walker: 'Yash Tomar', walkerPhoto: 'yash', dog: 'Mishti', temper: 'calm', raisedBy: 'Owner',
    claim: 'Walker never arrived, booking still charged', detail: 'No Check-In OTP was ever verified. Yash says he waited at the wrong tower gate.',
    amount: 235, age: '1 d', bookedMin: 30, actualMin: 0, plannedKm: 1.8, actualKm: 0, path: 0,
    events: [
      { at: '6:02 pm', label: 'Booking paid', detail: '30 min, Walk Now', kind: 'booked' },
      { at: '6:19 pm', label: 'Walker marked "Arrived"', detail: 'GPS pin 240 m from the pickup address', kind: 'log' },
      { at: '21 min', label: 'No Check-In OTP', detail: 'Code generated at 6:19 pm, expired at 6:29 pm, never entered.', kind: 'gap' },
      { at: '6:40 pm', label: 'Booking auto-closed', detail: 'No-show timer ran out', kind: 'pay' },
    ],
    chat: [
      { from: 'system', text: 'Booking VF-240719 confirmed. Phone numbers stay private.', at: '6:02 pm' },
      { from: 'walker', text: 'I am at the gate.', at: '6:19 pm' },
      { from: 'owner', text: 'Which gate? I am at Gate 1 with Mishti.', at: '6:21 pm' },
      { from: 'owner', text: 'Hello? The guard says nobody has come.', at: '6:27 pm' },
      { from: 'walker', text: 'Sorry, I was at Tower 4 back gate. Coming round.', at: '6:38 pm' },
    ],
  },
  {
    id: 'dp4', booking: 'VF-240664', owner: 'Aman Grewal', ownerPhoto: 'aman', walker: 'Gurpreet Sandhu', walkerPhoto: 'gurpreet', dog: 'Tyson', temper: 'reactive', raisedBy: 'Walker',
    claim: 'Dog tagged Calm, lunged twice. Surcharge not paid', detail: 'Gurpreet asks for the aggressive dog surcharge on a walk booked as Calm. The temperament tag is now in the vetting queue.',
    amount: 120, age: '2 d', bookedMin: 60, actualMin: 60, plannedKm: 3.2, actualKm: 2.9, path: 0.9,
    events: [
      { at: '6:40 am', label: 'Booking paid', detail: '60 min, tagged Calm by the owner', kind: 'booked' },
      { at: '7:01 am', label: 'Check-In OTP verified', kind: 'otp' },
      { at: '7:18 am', label: 'Note logged', detail: 'Lunged at a cyclist. Switched to the short leash.', kind: 'log' },
      { at: '7:39 am', label: 'Note logged', detail: 'Second lunge near the market. Muzzle requested.', kind: 'gap' },
      { at: '8:01 am', label: 'Check-Out OTP verified', detail: '60 min after Check-In', kind: 'otp' },
    ],
    chat: [
      { from: 'system', text: 'Booking VF-240664 confirmed. Phone numbers stay private.', at: '6:40 am' },
      { from: 'walker', text: 'Sir, Tyson went for a cyclist. Is he usually reactive?', at: '7:19 am' },
      { from: 'owner', text: 'He is just excited in the morning. He is friendly.', at: '7:22 am' },
      { from: 'walker', text: 'He needs a muzzle on this route. I am certified, but the booking says Calm.', at: '7:41 am' },
      { from: 'owner', text: 'Fine, take it up with the app.', at: '7:44 am' },
    ],
  },
  {
    id: 'dp5', booking: 'VF-240705', owner: 'Tara Oberoi', ownerPhoto: 'tara', walker: 'Nikhil Arora', walkerPhoto: 'nikhil', dog: 'Laila', temper: 'calm', raisedBy: 'Owner',
    claim: 'Debited twice for one walk', detail: 'The gateway shows two captures 40 seconds apart. The walk itself is not contested.',
    amount: 412, age: '2 d', bookedMin: 60, actualMin: 61, plannedKm: 3.2, actualKm: 3.3, path: 1,
    events: [
      { at: '6:28 am', label: 'Payment captured', detail: 'UPI, first attempt timed out on her phone', kind: 'booked' },
      { at: '40 sec', label: 'Second capture', detail: 'Same amount, same UPI ID, new gateway reference.', kind: 'gap' },
      { at: '7:02 am', label: 'Check-In OTP verified', kind: 'otp' },
      { at: '7:31 am', label: 'Water break logged', kind: 'log' },
      { at: '8:03 am', label: 'Check-Out OTP verified', detail: '61 min after Check-In', kind: 'otp' },
    ],
    chat: [
      { from: 'system', text: 'Booking VF-240705 confirmed. Phone numbers stay private.', at: '6:29 am' },
      { from: 'walker', text: 'Good morning, on my way to DLF Phase 2.', at: '6:45 am' },
      { from: 'owner', text: 'Thanks. Laila has had breakfast already, no treats please.', at: '6:47 am' },
      { from: 'walker', text: 'Noted. Back at 8.', at: '7:03 am' },
    ],
  },
  {
    id: 'dp6', booking: 'VF-240641', owner: 'Vikram Bedi', ownerPhoto: 'vikram', walker: 'Imran Qureshi', walkerPhoto: 'imran', dog: 'Rocky', temper: 'reactive', raisedBy: 'Owner',
    claim: 'Route left the agreed lanes, went via the main road', detail: 'Vikram asked for inner lanes only. The GPS path shows 600 m on the Sector 35 main road.',
    amount: 553, age: '3 d', bookedMin: 60, actualMin: 58, plannedKm: 3.2, actualKm: 3.6, path: 1,
    events: [
      { at: '6:35 am', label: 'Booking paid', detail: '60 min, Aggressive surcharge applied', kind: 'booked' },
      { at: '7:00 am', label: 'Check-In OTP verified', kind: 'otp' },
      { at: '7:22 am', label: 'Left the planned route', detail: '600 m along the Sector 35 main road, 7 minutes.', kind: 'gap' },
      { at: '7:40 am', label: 'Water break logged', kind: 'log' },
      { at: '7:58 am', label: 'Check-Out OTP verified', detail: '58 min after Check-In', kind: 'otp' },
    ],
    chat: [
      { from: 'system', text: 'Booking VF-240641 confirmed. Phone numbers stay private.', at: '6:35 am' },
      { from: 'owner', text: 'Inner lanes only please, Rocky reacts to buses.', at: '6:50 am' },
      { from: 'walker', text: 'Understood sir.', at: '6:51 am' },
      { from: 'walker', text: 'Inner lane is closed for a tent. Using the main road for one block.', at: '7:21 am' },
      { from: 'owner', text: 'I saw it on the map. That is exactly what I asked you not to do.', at: '7:30 am' },
    ],
  },
  {
    id: 'dp7', booking: 'VF-240612', owner: 'Rhea Suri', ownerPhoto: 'rhea', walker: 'Karan Gill', walkerPhoto: 'karan', dog: 'Biscuit', temper: 'calm', raisedBy: 'Walker',
    claim: 'Owner cancelled at the door, wants a full refund', detail: 'Karan had already arrived. The cancellation fee was charged and Rhea contests it.',
    amount: 270, age: '4 d', bookedMin: 30, actualMin: 0, plannedKm: 1.8, actualKm: 0, path: 0,
    events: [
      { at: '5:20 pm', label: 'Booking paid', detail: '30 min, Schedule Later', kind: 'booked' },
      { at: '5:52 pm', label: 'Walker marked "Arrived"', detail: 'GPS pin at the pickup address', kind: 'log' },
      { at: '5:55 pm', label: 'Cancelled by the owner', detail: '3 minutes after arrival, 5 minutes before the slot.', kind: 'gap' },
      { at: '5:56 pm', label: 'Cancellation fee charged', kind: 'pay' },
    ],
    chat: [
      { from: 'system', text: 'Booking VF-240612 confirmed. Phone numbers stay private.', at: '5:20 pm' },
      { from: 'walker', text: 'I have arrived at the gate.', at: '5:52 pm' },
      { from: 'owner', text: 'So sorry, guests just came. Need to cancel today.', at: '5:54 pm' },
      { from: 'walker', text: 'Okay ma’am. I came from Sector 22 for this.', at: '5:56 pm' },
    ],
  },
  {
    id: 'dp8', booking: 'VF-240588', owner: 'Kabir Anand', ownerPhoto: 'kabir', walker: 'Farhan Ali', walkerPhoto: 'farhan', dog: 'Zoro', temper: 'calm', raisedBy: 'Owner',
    claim: 'No photo check-in or logs during the walk', detail: 'Kabir expects the updates he gets on every Walk Pass walk. This walk has both OTPs and a full GPS path, but no logs.',
    amount: 296, age: '5 d', bookedMin: 45, actualMin: 46, plannedKm: 2.6, actualKm: 2.5, path: 0.96,
    events: [
      { at: '6:48 am', label: 'Walk Pass walk booked', detail: '45 min, walk 14 of 20', kind: 'booked' },
      { at: '7:05 am', label: 'Check-In OTP verified', kind: 'otp' },
      { at: '46 min', label: 'No activity logs', detail: 'No pee, poop, water or photo entries between the two OTPs.', kind: 'gap' },
      { at: '7:51 am', label: 'Check-Out OTP verified', detail: '46 min after Check-In', kind: 'otp' },
    ],
    chat: [
      { from: 'system', text: 'Booking VF-240588 confirmed. Phone numbers stay private.', at: '6:48 am' },
      { from: 'owner', text: 'Morning Farhan. Did Zoro do his business? No updates today.', at: '7:40 am' },
      { from: 'walker', text: 'Yes, all fine. My phone was on low battery so I skipped the logs.', at: '7:53 am' },
      { from: 'owner', text: 'The logs are why I use the app.', at: '7:55 am' },
    ],
  },
  {
    id: 'dp9', booking: 'VF-240571', owner: 'Neha Arora', ownerPhoto: 'neha', walker: 'Pooja Bhatia', walkerPhoto: 'pooja', dog: 'Pablo', temper: 'calm', raisedBy: 'Owner',
    claim: 'Check-Out OTP shared over chat before drop-off', detail: 'Neha sent the code while Pablo was still out. The GPS shows the walk closed 300 m from home.',
    amount: 235, age: '6 d', bookedMin: 30, actualMin: 27, plannedKm: 1.8, actualKm: 1.6, path: 0.86,
    events: [
      { at: '6:10 pm', label: 'Booking paid', detail: '30 min, Walk Now', kind: 'booked' },
      { at: '6:26 pm', label: 'Check-In OTP verified', kind: 'otp' },
      { at: '6:49 pm', label: 'Check-Out OTP sent in chat', detail: 'Entered at 6:53 pm, 300 m from the pickup pin.', kind: 'gap' },
      { at: '6:58 pm', label: 'GPS reaches the pickup pin', kind: 'log' },
    ],
    chat: [
      { from: 'system', text: 'Booking VF-240571 confirmed. Phone numbers stay private.', at: '6:10 pm' },
      { from: 'walker', text: 'Almost back. Can you share the Check-Out OTP so I can close it at the gate?', at: '6:48 pm' },
      { from: 'owner', text: '5 5 0 2. I am in a meeting, guard will take Pablo.', at: '6:49 pm' },
      { from: 'walker', text: 'Closed. Handing him to the guard now.', at: '6:57 pm' },
    ],
  },
]

export type ModReview = { id: string; rating: number; text: string; owner: string; ownerPhoto: MediaKey; walker: string; walkerPhoto: MediaKey; booking: string; when: string; flags: string[] }
export const MOD_REVIEWS: ModReview[] = [
  { id: 'mr1', rating: 1, text: 'Never came. Call me on 98140 22871 if you want the full story, do not book this guy.', owner: 'Isha Chawla', ownerPhoto: 'isha', walker: 'Yash Tomar', walkerPhoto: 'yash', booking: 'VF-240719', when: '1 d ago', flags: ['Contains phone number', 'Dispute open'] },
  { id: 'mr2', rating: 2, text: 'Brought Coco back early and blamed the rain. Not what I paid for.', owner: 'Priya Malhotra', ownerPhoto: 'priya', walker: 'Rohan Kapoor', walkerPhoto: 'rohan', booking: 'VF-240702', when: '14 h ago', flags: ['Reported by walker', 'Dispute open'] },
  { id: 'mr3', rating: 5, text: 'On time at the gate, OTP in ten seconds, and a photo at the water break. Simba came back tired and happy.', owner: 'Meera Sodhi', ownerPhoto: 'meera', walker: 'Arjun Mehta', walkerPhoto: 'arjun', booking: 'VF-240733', when: '2 d ago', flags: [] },
  { id: 'mr4', rating: 1, text: 'Useless fellow, typical of these people. Should not be allowed near dogs.', owner: 'Aman Grewal', ownerPhoto: 'aman', walker: 'Gurpreet Sandhu', walkerPhoto: 'gurpreet', booking: 'VF-240664', when: '2 d ago', flags: ['Abusive language', 'Reported by walker'] },
  { id: 'mr5', rating: 5, text: 'Rocky is not easy with strangers. Imran kept him on a short leash past the market and never rushed him.', owner: 'Vikram Bedi', ownerPhoto: 'vikram', walker: 'Imran Qureshi', walkerPhoto: 'imran', booking: 'VF-240601', when: '3 d ago', flags: [] },
  { id: 'mr6', rating: 4, text: 'Good walk. Cheaper if you pay him directly on GPay next time, he said so himself.', owner: 'Dev Khanna', ownerPhoto: 'dev', walker: 'Divya Rawat', walkerPhoto: 'divya', booking: 'VF-240655', when: '3 d ago', flags: ['Off-platform payment'] },
  { id: 'mr7', rating: 5, text: 'Sends the potty log without being asked. Exactly what I wanted to know from the office.', owner: 'Simran Kaur', ownerPhoto: 'simran', walker: 'Tenzin Dorje', walkerPhoto: 'tenzin', booking: 'VF-240640', when: '4 d ago', flags: [] },
  { id: 'mr8', rating: 3, text: 'Fine walk but no logs at all this time. Zoro waits at the door at 7 though.', owner: 'Kabir Anand', ownerPhoto: 'kabir', walker: 'Farhan Ali', walkerPhoto: 'farhan', booking: 'VF-240588', when: '5 d ago', flags: ['Dispute open'] },
  { id: 'mr9', rating: 5, text: 'Laila came back calm, which never happens. Booking the 60 minute slot every Saturday.', owner: 'Tara Oberoi', ownerPhoto: 'tara', walker: 'Nikhil Arora', walkerPhoto: 'nikhil', booking: 'VF-240622', when: '5 d ago', flags: [] },
  { id: 'mr10', rating: 1, text: 'BEST WALKER BOOK NOW 5 STARS visit pawdeals dot in for discount', owner: 'Rhea Suri', ownerPhoto: 'rhea', walker: 'Karan Gill', walkerPhoto: 'karan', booking: 'VF-240612', when: '6 d ago', flags: ['Spam link', 'Rating and text do not match'] },
  { id: 'mr11', rating: 4, text: 'Pablo gets tired fast and Pooja noticed before I said anything. Slowed down and gave him water.', owner: 'Neha Arora', ownerPhoto: 'neha', walker: 'Pooja Bhatia', walkerPhoto: 'pooja', booking: 'VF-240571', when: '6 d ago', flags: [] },
  { id: 'mr12', rating: 5, text: 'Biscuit loves him. Friendly and always messages when he is five minutes away.', owner: 'Rhea Suri', ownerPhoto: 'rhea', walker: 'Karan Gill', walkerPhoto: 'karan', booking: 'VF-240559', when: '1 wk ago', flags: [] },
]

/* ── Analytics ─────────────────────────────────────────────── */

export type DayRow = {
  iso: string
  label: string
  mohali: number
  chandigarh: number
  ncr: number
  gmv: number
  net: number
  calm: number
  reactive: number
  now: number
  scheduled: number
  pass: number
  bookings: number
  dogs: number
  walkers: number
  repeat: number
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 365 days ending Sat 14 Nov 2026. Growth through the year, softer mid-week,
    busier weekends, a monsoon sag in July and a festival spike in late October. */
function buildDays(): DayRow[] {
  const rnd = seeded(240781)
  const end = Date.UTC(2026, 10, 14)
  const rows: DayRow[] = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end - i * 86_400_000)
    const t = (364 - i) / 364
    const dow = d.getUTCDay()
    const m = d.getUTCMonth()
    const day = d.getUTCDate()
    const week = [1.24, 0.93, 0.84, 0.8, 0.88, 0.97, 1.3][dow]
    const monsoon = m === 6 ? 0.86 : m === 7 ? 0.92 : 1
    const festival = m === 9 && day >= 19 && day <= 31 ? 1 + 0.42 * Math.exp(-Math.pow((day - 25) / 3.2, 2)) : 1
    const growth = 0.34 + 0.66 * Math.pow(t, 1.5)
    const noise = 0.92 + rnd() * 0.16
    const k = week * monsoon * festival * growth * noise
    const bookings = Math.round(1180 * k)
    const reactive = Math.round(bookings * (0.17 + rnd() * 0.04))
    const now = Math.round(bookings * (0.36 + (dow === 0 || dow === 6 ? 0.07 : 0) + rnd() * 0.05))
    const pass = Math.round(bookings * (0.12 + 0.17 * t + rnd() * 0.02))
    const avg = 318 + reactive / Math.max(1, bookings) * 110 + rnd() * 14
    const gmv = Math.round(bookings * avg)
    const ncrShare = 0.16 + 0.2 * t + rnd() * 0.02
    const chdShare = 0.29 + rnd() * 0.03
    const ncr = Math.round(gmv * ncrShare)
    const chandigarh = Math.round(gmv * chdShare)
    rows.push({
      iso: d.toISOString().slice(0, 10),
      label: `${day} ${MON[m]}`,
      mohali: gmv - ncr - chandigarh,
      chandigarh,
      ncr,
      gmv,
      net: Math.round(gmv * (0.198 + rnd() * 0.012) + now * 30),
      calm: bookings - reactive,
      reactive,
      now,
      scheduled: bookings - now,
      pass,
      bookings,
      dogs: Math.round(2140 + 7260 * Math.pow(t, 1.35) + rnd() * 40),
      walkers: Math.round(310 + 930 * Math.pow(t, 1.2) + rnd() * 10),
      repeat: 48 + 16 * t + (rnd() - 0.5) * 2.4,
    })
  }
  return rows
}
export const DAYS: DayRow[] = buildDays()

const SUM_KEYS = ['mohali', 'chandigarh', 'ncr', 'gmv', 'net', 'calm', 'reactive', 'now', 'scheduled', 'pass', 'bookings'] as const
/** Roll daily rows into buckets of `size` days (the last bucket ends today). */
export function bucket(rows: DayRow[], size: number, monthName = false): DayRow[] {
  const out: DayRow[] = []
  for (let end = rows.length; end > 0; end -= size) {
    const part = rows.slice(Math.max(0, end - size), end)
    const first = part[0]
    const last = part[part.length - 1]
    const row: DayRow = { ...last, label: monthName ? `${MON[Number(last.iso.slice(5, 7)) - 1]}` : first.label }
    for (const key of SUM_KEYS) row[key] = part.reduce((a, r) => a + r[key], 0)
    row.repeat = part.reduce((a, r) => a + r.repeat, 0) / part.length
    out.unshift(row)
  }
  return out
}

export type RangeId = '7d' | '30d' | '90d' | '12m'
export const RANGES: { id: RangeId; label: string; days: number; from: string; noun: string }[] = [
  { id: '7d', label: '7d', days: 7, from: '2026-11-08', noun: 'last 7 days' },
  { id: '30d', label: '30d', days: 30, from: '2026-10-16', noun: 'last 30 days' },
  { id: '90d', label: '90d', days: 90, from: '2026-08-16', noun: 'last 90 days' },
  { id: '12m', label: '12m', days: 364, from: '2025-11-15', noun: 'last 12 months' },
]

/** Series for a range: `line` for the area and line charts, `bars` for the bar charts,
    `prev` is the same-length period before it (for deltas). */
export function rangeSeries(id: RangeId) {
  const r = RANGES.find((x) => x.id === id) ?? RANGES[2]
  const cur = DAYS.slice(-r.days)
  const prevAvail = DAYS.slice(Math.max(0, DAYS.length - r.days * 2), DAYS.length - r.days)
  const line = id === '12m' ? bucket(cur, 7) : cur
  const bars = id === '12m' ? bucket(cur, 28, true) : id === '90d' ? bucket(cur, 7) : id === '30d' ? bucket(cur, 2) : cur
  return { range: r, cur, prev: prevAvail, line, bars }
}

/* Geographic demand: bookings per week by locality and hour of day (6 am to 10 pm). */
export const HEAT_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
export const HEAT_ROWS: { locality: string; city: City; scale: number; skew: number }[] = [
  { locality: 'Sector 70, Mohali', city: 'Mohali', scale: 1, skew: 0 },
  { locality: 'Phase 7, Mohali', city: 'Mohali', scale: 0.86, skew: 0.2 },
  { locality: 'Phase 3B2, Mohali', city: 'Mohali', scale: 0.71, skew: -0.3 },
  { locality: 'Sector 79, Mohali', city: 'Mohali', scale: 0.44, skew: 0.5 },
  { locality: 'Sector 17, Chandigarh', city: 'Chandigarh', scale: 0.62, skew: 0.9 },
  { locality: 'Sector 35, Chandigarh', city: 'Chandigarh', scale: 0.8, skew: 0.1 },
  { locality: 'Sector 8, Chandigarh', city: 'Chandigarh', scale: 0.57, skew: -0.4 },
  { locality: 'DLF Phase 3, Gurugram', city: 'Delhi NCR', scale: 0.93, skew: 0.6 },
  { locality: 'Sector 45, Gurugram', city: 'Delhi NCR', scale: 0.52, skew: 0.3 },
  { locality: 'Sector 62, Noida', city: 'Delhi NCR', scale: 0.68, skew: 0.8 },
  { locality: 'Indirapuram, Ghaziabad', city: 'Delhi NCR', scale: 0.36, skew: 0.4 },
  { locality: 'Saket, New Delhi', city: 'Delhi NCR', scale: 0.75, skew: 1 },
]
function buildHeat(): number[][] {
  const rnd = seeded(7391)
  return HEAT_ROWS.map((row) =>
    HEAT_HOURS.map((h) => {
      const morning = Math.exp(-Math.pow((h - 7.3) / 1.25, 2))
      const evening = Math.exp(-Math.pow((h - (18.6 + row.skew * 0.8)) / 1.7, 2)) * (0.72 + row.skew * 0.22)
      const noon = 0.07 + (h >= 12 && h <= 15 ? 0.03 : 0)
      return Math.round((morning + evening + noon) * 64 * row.scale * (0.86 + rnd() * 0.28))
    }),
  )
}
export const HEAT: number[][] = buildHeat()
export const HEAT_MAX = Math.max(...HEAT.flat())
/** Pale yellow to royal blue, six steps. */
export const HEAT_RAMP = ['#FFF8DC', '#FDEBA3', '#C9D4F8', '#8FA6FF', '#4D6CEB', '#2348D6', '#14297F']
export const heatStep = (v: number) => Math.min(HEAT_RAMP.length - 1, Math.floor((v / HEAT_MAX) * (HEAT_RAMP.length - 0.01)))
export const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'am' : 'pm'}`

export const TOP_WALKERS: { walkerId: string; walks: number; gmv: number; repeat: number; trend: number[] }[] = [
  { walkerId: 'imran', walks: 412, gmv: 171800, repeat: 81, trend: [28, 31, 30, 34, 33, 36, 35, 38, 37, 41, 39, 44] },
  { walkerId: 'arjun', walks: 396, gmv: 158300, repeat: 84, trend: [24, 27, 29, 28, 32, 31, 35, 34, 36, 39, 38, 43] },
  { walkerId: 'gurpreet', walks: 351, gmv: 139900, repeat: 77, trend: [26, 25, 28, 27, 30, 29, 28, 32, 31, 33, 35, 34] },
  { walkerId: 'farhan', walks: 318, gmv: 112400, repeat: 73, trend: [20, 22, 21, 25, 24, 27, 26, 28, 30, 29, 31, 33] },
  { walkerId: 'nikhil', walks: 287, gmv: 118600, repeat: 69, trend: [14, 16, 19, 18, 22, 21, 25, 24, 27, 29, 28, 32] },
  { walkerId: 'divya', walks: 244, gmv: 76300, repeat: 71, trend: [22, 21, 23, 22, 20, 23, 24, 22, 25, 24, 23, 26] },
  { walkerId: 'pooja', walks: 229, gmv: 68900, repeat: 79, trend: [12, 14, 15, 17, 16, 19, 18, 21, 20, 22, 24, 23] },
  { walkerId: 'rohan', walks: 198, gmv: 61200, repeat: 58, trend: [19, 18, 20, 17, 19, 16, 18, 17, 15, 17, 16, 14] },
]

export const FUNNEL: { step: string; count: number }[] = [
  { step: 'Searched for a walker', count: 48210 },
  { step: 'Opened a walker profile', count: 33940 },
  { step: 'Started a booking', count: 19870 },
  { step: 'Paid', count: 16320 },
  { step: 'Walk completed (both OTPs)', count: 15710 },
  { step: 'Booked again within 14 days', count: 9640 },
]

/** Share of first-time owners who booked again, by weeks since their first walk. */
export const COHORTS: { cohort: string; size: number; weeks: number[] }[] = [
  { cohort: 'Aug', size: 1420, weeks: [100, 61, 52, 47, 44, 42, 41, 40] },
  { cohort: 'Sep', size: 1890, weeks: [100, 64, 55, 50, 47, 45, 44] },
  { cohort: 'Oct', size: 2610, weeks: [100, 68, 58, 54, 51] },
  { cohort: 'Nov', size: 1180, weeks: [100, 66, 57] },
]

/* ── Settings ──────────────────────────────────────────────── */

export const ROLES = ['Super Admin', 'Compliance Officer', 'Support Agent', 'Finance', 'Viewer'] as const
export type Role = (typeof ROLES)[number]
export const AREAS = ['Vetting', 'KYC', 'Messages', 'Pricing', 'Payouts', 'Disputes', 'Analytics', 'Settings'] as const
export type Area = (typeof AREAS)[number]
/** Default access: which areas each role can open and act in. */
export const DEFAULT_ACCESS: Record<Role, Area[]> = {
  'Super Admin': [...AREAS],
  'Compliance Officer': ['Vetting', 'KYC', 'Messages', 'Disputes'],
  'Support Agent': ['Messages', 'Disputes', 'Vetting'],
  Finance: ['Pricing', 'Payouts', 'Analytics', 'Disputes'],
  Viewer: ['Analytics'],
}

export type TeamMember = { id: string; name: string; email: string; photo: MediaKey; role: Role; city: City | 'All cities'; lastActive: string; twoStep: 'On' | 'Off' | 'Invite sent' }
export const TEAM: TeamMember[] = [
  { id: 'tm1', name: 'Kavya Nair', email: 'ops@demo-vuffora.app', photo: 'kavya', role: 'Super Admin', city: 'All cities', lastActive: 'Now', twoStep: 'On' },
  { id: 'tm2', name: 'Ritu Saxena', email: 'ritu.saxena@demo-vuffora.app', photo: 'rhea', role: 'Finance', city: 'All cities', lastActive: '12 min ago', twoStep: 'On' },
  { id: 'tm3', name: 'Harsh Vardhan', email: 'harsh.v@demo-vuffora.app', photo: 'vikram', role: 'Compliance Officer', city: 'Mohali', lastActive: '26 min ago', twoStep: 'On' },
  { id: 'tm4', name: 'Anjali Thakur', email: 'anjali.t@demo-vuffora.app', photo: 'tara', role: 'Compliance Officer', city: 'Delhi NCR', lastActive: '1 h ago', twoStep: 'On' },
  { id: 'tm5', name: 'Manpreet Dhaliwal', email: 'manpreet.d@demo-vuffora.app', photo: 'aman', role: 'Support Agent', city: 'Chandigarh', lastActive: '3 min ago', twoStep: 'Off' },
  { id: 'tm6', name: 'Sneha Pillai', email: 'sneha.p@demo-vuffora.app', photo: 'neha', role: 'Support Agent', city: 'Delhi NCR', lastActive: 'Yesterday 9:40 pm', twoStep: 'On' },
  { id: 'tm7', name: 'Aditya Rana', email: 'aditya.rana@demo-vuffora.app', photo: 'dev', role: 'Support Agent', city: 'Mohali', lastActive: 'Yesterday 6:15 pm', twoStep: 'On' },
  { id: 'tm8', name: 'Zoya Merchant', email: 'zoya.m@demo-vuffora.app', photo: 'isha', role: 'Viewer', city: 'All cities', lastActive: 'Tue 11 Nov', twoStep: 'Off' },
  { id: 'tm9', name: 'Kunal Bhasin', email: 'kunal.b@demo-vuffora.app', photo: 'kabir', role: 'Finance', city: 'Delhi NCR', lastActive: 'Mon 10 Nov', twoStep: 'On' },
]

export const CITY_TILES: { city: City; since: string; walkers: number; owners: number; live: number; localities: string }[] = [
  { city: 'Mohali', since: 'Aug 2026', walkers: 486, owners: 3920, live: 6, localities: 'Sector 66 to 80, Phase 3B2 to 11' },
  { city: 'Chandigarh', since: 'Aug 2026', walkers: 342, owners: 2740, live: 3, localities: 'Sector 8 to 44' },
  { city: 'Delhi NCR', since: 'Sep 2026', walkers: 414, owners: 2740, live: 3, localities: 'Gurugram, Noida, South Delhi, Ghaziabad' },
]
export const NEXT_CITIES: { city: string; waitlist: number }[] = [
  { city: 'Ludhiana', waitlist: 318 },
  { city: 'Jaipur', waitlist: 212 },
  { city: 'Pune', waitlist: 547 },
  { city: 'Bengaluru', waitlist: 903 },
  { city: 'Zirakpur', waitlist: 164 },
]

export type IntegrationState = 'Connected' | 'Sandbox' | 'Not enabled'
export const INTEGRATIONS: { id: string; name: string; use: string; state: IntegrationState; meta: string }[] = [
  { id: 'maps', name: 'Google Maps Platform', use: 'Walker discovery, live route polyline, distance and ETA', state: 'Connected', meta: 'Maps SDK, Directions, Geocoding' },
  { id: 'pay', name: 'Razorpay / Cashfree', use: 'UPI, cards and netbanking in INR, walker payouts, refunds', state: 'Sandbox', meta: 'Test keys, live keys after KYC of the business' },
  { id: 'rt', name: 'Socket.io / Firebase', use: 'Real-time chat, live walk position, job requests', state: 'Connected', meta: 'Median delivery 180 ms' },
  { id: 'sms', name: 'MSG91 / Twilio', use: 'Login OTP and handover OTP by SMS', state: 'Sandbox', meta: 'DLT template approval pending' },
  { id: 'push', name: 'FCM / APNs', use: 'Push alerts for walk start, logs, payouts and document status', state: 'Connected', meta: 'Android and iOS' },
  { id: 'call', name: 'Exotel / Kaleyra', use: 'Optional masked calling between owner and walker', state: 'Not enabled', meta: 'Optional in the specification' },
]

export const TEMPLATES: { id: string; name: string; channel: 'SMS' | 'Push' | 'Push + in-app'; to: string; body: string; vars: string[] }[] = [
  { id: 'tp1', name: 'Login OTP', channel: 'SMS', to: 'Owners and walkers', body: '{otp} is your Vuffora login code. It is valid for 10 minutes. Do not share it with anyone.', vars: ['{otp}'] },
  { id: 'tp2', name: 'Walk started', channel: 'Push', to: 'Owner', body: '{dog} is on the walk with {walker}. Check-In OTP verified at {time}. Tap to follow the route live.', vars: ['{dog}', '{walker}', '{time}'] },
  { id: 'tp3', name: 'Document rejected', channel: 'Push + in-app', to: 'Owner or walker', body: 'Your {document} could not be approved: {remark} Please upload it again from the app.', vars: ['{document}', '{remark}'] },
  { id: 'tp4', name: 'Payout sent', channel: 'Push', to: 'Walker', body: '{amount} is on its way to {upi}. It usually reaches within 2 hours.', vars: ['{amount}', '{upi}'] },
]
