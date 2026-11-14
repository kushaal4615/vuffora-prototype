import type { City, Temperament } from './cast'
import type { MediaKey } from './media'
import type { SupportStatus } from '../lib/store'

/* Lists behind the first half of the Super Admin portal: the owners & dogs
   directory, the static support threads in the messaging console, and the
   overview's activity feed and GMV series. Everyone is fictional and uses
   the same cast as the rest of the prototype. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "09 Nov 2027" → "2027-11-09" */
export const dmyToIso = (dmy: string) => {
  const [d, m, y] = dmy.split(' ')
  return `${y}-${String(MONTHS.indexOf(m) + 1).padStart(2, '0')}-${d.padStart(2, '0')}`
}
/** +91 98765 43210 → +91 98••• ••210 */
export const maskPhone = (p: string) => {
  const digits = p.replace(/\D/g, '').slice(-10)
  return `+91 ${digits.slice(0, 2)}••• ••${digits.slice(7)}`
}
export const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('')

/* ── Owners & dogs directory ───────────────────────────────── */
export type VaxStatus = 'approved' | 'review' | 'expiring' | 'expired'
export type OwnerRow = {
  id: string
  owner: string
  photo?: MediaKey
  city: City
  locality: string
  phone: string
  dog: string
  dogPhoto: MediaKey
  breed: string
  temperament: Temperament
  locked: boolean
  vax: VaxStatus
  /** which document drives the status */
  vaxNote: string
  walks: number
  joined: string // ISO
  lastWalk: string // ISO
  /** linked case in the vetting queue, if one is open */
  caseId?: string
}

export const OWNER_ROWS: OwnerRow[] = [
  { id: 'or01', owner: 'Ananya Sharma', photo: 'ananya', city: 'Mohali', locality: 'Sector 70', phone: '+91 98765 43210', dog: 'Bruno', dogPhoto: 'bruno', breed: 'Labrador Retriever', temperament: 'calm', locked: true, vax: 'expiring', vaxNote: 'Bordetella ends 2 Dec', walks: 31, joined: '2026-08-04', lastWalk: '2026-11-12' },
  { id: 'or02', owner: 'Ananya Sharma', photo: 'ananya', city: 'Mohali', locality: 'Sector 70', phone: '+91 98765 43210', dog: 'Sheru', dogPhoto: 'sheru', breed: 'German Shepherd', temperament: 'reactive', locked: false, vax: 'review', vaxNote: 'Bordetella in queue', walks: 7, joined: '2026-08-04', lastWalk: '2026-11-08', caseId: 'vq1' },
  { id: 'or03', owner: 'Meera Sodhi', photo: 'meera', city: 'Mohali', locality: 'Sector 68', phone: '+91 98155 20114', dog: 'Simba', dogPhoto: 'goldenRose', breed: 'Golden Retriever', temperament: 'calm', locked: true, vax: 'approved', vaxNote: 'All 3 valid', walks: 64, joined: '2026-03-18', lastWalk: '2026-11-13' },
  { id: 'or04', owner: 'Meera Sodhi', photo: 'meera', city: 'Mohali', locality: 'Sector 68', phone: '+91 98155 20114', dog: 'Nala', dogPhoto: 'goldenPup', breed: 'Golden Retriever', temperament: 'calm', locked: false, vax: 'approved', vaxNote: 'All 3 valid', walks: 12, joined: '2026-03-18', lastWalk: '2026-11-11' },
  { id: 'or05', owner: 'Vikram Bedi', photo: 'vikram', city: 'Chandigarh', locality: 'Sector 9', phone: '+91 98720 66310', dog: 'Rocky', dogPhoto: 'indieBlack', breed: 'Rottweiler', temperament: 'reactive', locked: true, vax: 'approved', vaxNote: 'All 3 valid', walks: 48, joined: '2026-02-09', lastWalk: '2026-11-13' },
  { id: 'or06', owner: 'Priya Malhotra', photo: 'priya', city: 'Chandigarh', locality: 'Sector 34', phone: '+91 98888 41207', dog: 'Coco', dogPhoto: 'cocker', breed: 'Cocker Spaniel', temperament: 'calm', locked: false, vax: 'approved', vaxNote: 'All 3 valid', walks: 22, joined: '2026-06-21', lastWalk: '2026-11-10' },
  { id: 'or07', owner: 'Kabir Anand', photo: 'kabir', city: 'Delhi NCR', locality: 'Vasant Kunj, New Delhi', phone: '+91 98110 73355', dog: 'Zoro', dogPhoto: 'indieStreet', breed: 'Indie', temperament: 'calm', locked: true, vax: 'review', vaxNote: 'DHPP in queue', walks: 57, joined: '2026-04-02', lastWalk: '2026-11-13', caseId: 'vq8' },
  { id: 'or08', owner: 'Kabir Anand', photo: 'kabir', city: 'Delhi NCR', locality: 'Vasant Kunj, New Delhi', phone: '+91 98110 73355', dog: 'Chutki', dogPhoto: 'indiePups', breed: 'Indie', temperament: 'calm', locked: false, vax: 'approved', vaxNote: 'All 3 valid', walks: 9, joined: '2026-09-14', lastWalk: '2026-11-09' },
  { id: 'or09', owner: 'Simran Kaur', photo: 'simran', city: 'Mohali', locality: 'Phase 3B1', phone: '+91 98147 90022', dog: 'Momo', dogPhoto: 'shihtzu', breed: 'Shih Tzu', temperament: 'calm', locked: true, vax: 'approved', vaxNote: 'All 3 valid', walks: 41, joined: '2026-05-11', lastWalk: '2026-11-12' },
  { id: 'or10', owner: 'Dev Khanna', photo: 'dev', city: 'Chandigarh', locality: 'Sector 35', phone: '+91 98764 11890', dog: 'Oreo', dogPhoto: 'indie', breed: 'Indie', temperament: 'calm', locked: false, vax: 'review', vaxNote: 'Rabies in queue', walks: 3, joined: '2026-10-29', lastWalk: '2026-11-07', caseId: 'vq2' },
  { id: 'or11', owner: 'Tara Oberoi', photo: 'tara', city: 'Delhi NCR', locality: 'DLF Phase 2, Gurugram', phone: '+91 99100 28764', dog: 'Laila', dogPhoto: 'husky', breed: 'Siberian Husky', temperament: 'calm', locked: true, vax: 'expiring', vaxNote: 'DHPP ends today', walks: 73, joined: '2026-01-25', lastWalk: '2026-11-13', caseId: 'vq3' },
  { id: 'or12', owner: 'Tara Oberoi', photo: 'tara', city: 'Delhi NCR', locality: 'DLF Phase 2, Gurugram', phone: '+91 99100 28764', dog: 'Storm', dogPhoto: 'huskyBlue', breed: 'Siberian Husky', temperament: 'reactive', locked: true, vax: 'approved', vaxNote: 'All 3 valid', walks: 66, joined: '2026-01-25', lastWalk: '2026-11-13' },
  { id: 'or13', owner: 'Aman Grewal', photo: 'aman', city: 'Mohali', locality: 'Phase 10', phone: '+91 98030 55471', dog: 'Tyson', dogPhoto: 'lickLab', breed: 'Labrador Retriever', temperament: 'calm', locked: false, vax: 'review', vaxNote: 'Rabies in queue', walks: 14, joined: '2026-07-30', lastWalk: '2026-11-12', caseId: 'vq4' },
  { id: 'or14', owner: 'Isha Chawla', photo: 'isha', city: 'Delhi NCR', locality: 'Sector 50, Noida', phone: '+91 98990 14526', dog: 'Mishti', dogPhoto: 'spitz', breed: 'Indian Spitz', temperament: 'calm', locked: false, vax: 'review', vaxNote: 'Bordetella in queue', walks: 19, joined: '2026-06-03', lastWalk: '2026-11-11', caseId: 'vq5' },
  { id: 'or15', owner: 'Rhea Suri', photo: 'rhea', city: 'Chandigarh', locality: 'Sector 8', phone: '+91 98141 77608', dog: 'Biscuit', dogPhoto: 'beagle', breed: 'Beagle', temperament: 'calm', locked: true, vax: 'review', vaxNote: 'DHPP in queue', walks: 36, joined: '2026-04-27', lastWalk: '2026-11-13', caseId: 'vq6' },
  { id: 'or16', owner: 'Neha Arora', photo: 'neha', city: 'Mohali', locality: 'Sector 66', phone: '+91 98729 30415', dog: 'Pablo', dogPhoto: 'pugYellow', breed: 'Pug', temperament: 'calm', locked: false, vax: 'expired', vaxNote: 'Rabies ended 11 Aug', walks: 26, joined: '2026-02-28', lastWalk: '2026-10-30', caseId: 'vq7' },
  { id: 'or17', owner: 'Harsh Vardhan', city: 'Delhi NCR', locality: 'Sector 54, Gurugram', phone: '+91 98182 60931', dog: 'Bolt', dogPhoto: 'frenchieTee', breed: 'French Bulldog', temperament: 'calm', locked: false, vax: 'approved', vaxNote: 'All 3 valid', walks: 28, joined: '2026-05-19', lastWalk: '2026-11-12' },
  { id: 'or18', owner: 'Ritu Bhalla', city: 'Chandigarh', locality: 'Sector 11', phone: '+91 98880 45172', dog: 'Waffles', dogPhoto: 'corgi', breed: 'Corgi', temperament: 'calm', locked: true, vax: 'expiring', vaxNote: 'Rabies ends 28 Nov', walks: 52, joined: '2026-03-06', lastWalk: '2026-11-13' },
  { id: 'or19', owner: 'Sandeep Chahal', city: 'Mohali', locality: 'Phase 5', phone: '+91 98557 12048', dog: 'Sultan', dogPhoto: 'aussie', breed: 'Shepherd mix', temperament: 'reactive', locked: true, vax: 'approved', vaxNote: 'All 3 valid', walks: 33, joined: '2026-04-15', lastWalk: '2026-11-11' },
  { id: 'or20', owner: 'Ayesha Siddiqui', city: 'Delhi NCR', locality: 'Sector 137, Noida', phone: '+91 99712 08843', dog: 'Kiwi', dogPhoto: 'jackRussell', breed: 'Jack Russell Terrier', temperament: 'calm', locked: false, vax: 'approved', vaxNote: 'All 3 valid', walks: 17, joined: '2026-08-22', lastWalk: '2026-11-10' },
  { id: 'or21', owner: 'Manpreet Dhaliwal', city: 'Mohali', locality: 'Sector 82', phone: '+91 98765 90217', dog: 'Jaggu', dogPhoto: 'labChoc', breed: 'Labrador Retriever', temperament: 'calm', locked: true, vax: 'expired', vaxNote: 'DHPP ended 30 Oct', walks: 44, joined: '2026-02-14', lastWalk: '2026-10-28' },
  { id: 'or22', owner: 'Anjali Rao', city: 'Delhi NCR', locality: 'Sector 56, Gurugram', phone: '+91 98104 37725', dog: 'Cookie', dogPhoto: 'doodle', breed: 'Goldendoodle', temperament: 'calm', locked: false, vax: 'approved', vaxNote: 'All 3 valid', walks: 11, joined: '2026-09-27', lastWalk: '2026-11-12' },
  { id: 'or23', owner: 'Rajat Sethi', city: 'Chandigarh', locality: 'Sector 21', phone: '+91 98146 55093', dog: 'Max', dogPhoto: 'goldenFace', breed: 'Golden Retriever', temperament: 'calm', locked: true, vax: 'approved', vaxNote: 'All 3 valid', walks: 59, joined: '2026-01-12', lastWalk: '2026-11-13' },
  { id: 'or24', owner: 'Nidhi Ahuja', city: 'Delhi NCR', locality: 'Saket, New Delhi', phone: '+91 98111 62480', dog: 'Peanut', dogPhoto: 'yorkie', breed: 'Yorkshire Terrier', temperament: 'calm', locked: false, vax: 'expiring', vaxNote: 'Bordetella ends 6 Dec', walks: 8, joined: '2026-10-05', lastWalk: '2026-11-09' },
  { id: 'or25', owner: 'Gaurav Bansal', city: 'Mohali', locality: 'Sector 91', phone: '+91 98728 14406', dog: 'Leo', dogPhoto: 'labPup', breed: 'Labrador Retriever', temperament: 'calm', locked: false, vax: 'review', vaxNote: 'Rabies uploaded today', walks: 0, joined: '2026-11-13', lastWalk: '' },
  { id: 'or26', owner: 'Shreya Kapoor', city: 'Delhi NCR', locality: 'Sector 76, Noida', phone: '+91 99530 71168', dog: 'Mowgli', dogPhoto: 'toyDog', breed: 'Indie', temperament: 'calm', locked: true, vax: 'approved', vaxNote: 'All 3 valid', walks: 38, joined: '2026-05-02', lastWalk: '2026-11-12' },
  { id: 'or27', owner: 'Tanvi Goel', city: 'Chandigarh', locality: 'Sector 38', phone: '+91 98765 22931', dog: 'Snowy', dogPhoto: 'spitzSmile', breed: 'Indian Spitz', temperament: 'calm', locked: false, vax: 'approved', vaxNote: 'All 3 valid', walks: 21, joined: '2026-07-08', lastWalk: '2026-11-11' },
  { id: 'or28', owner: 'Kunal Dutta', city: 'Delhi NCR', locality: 'Sushant Lok, Gurugram', phone: '+91 98990 53317', dog: 'Rambo', dogPhoto: 'frenchieHoodie', breed: 'French Bulldog', temperament: 'reactive', locked: false, vax: 'expiring', vaxNote: 'DHPP ends 9 Dec', walks: 15, joined: '2026-08-17', lastWalk: '2026-11-10' },
]

/* ── Booking / OTP logs shown beside a chat and in the owner drawer ── */
export type BookingLog = { id: string; date: string; who: string; checkIn: string; checkOut: string; status: 'completed' | 'live' | 'upcoming' | 'cancelled' | 'refunded' }

const logs = (seed: number, who: string[], n = 4): BookingLog[] => {
  const days = ['Fri 13 Nov', 'Thu 12 Nov', 'Tue 10 Nov', 'Sun 8 Nov', 'Fri 6 Nov']
  const slots = [[7, 2], [18, 34], [6, 47], [17, 5], [8, 16]]
  return Array.from({ length: n }, (_, i) => {
    const [h, m] = slots[(seed + i) % slots.length]
    const dur = [30, 45, 60][(seed + i) % 3]
    const end = h * 60 + m + dur + ((seed + i) % 3)
    const fmt = (t: number) => `${Math.floor(t / 60) % 12 === 0 ? 12 : Math.floor(t / 60) % 12}:${String(t % 60).padStart(2, '0')} ${t < 720 ? 'am' : 'pm'}`
    const cancelled = (seed + i) % 7 === 5
    return { id: `VF-24${String(760 - seed * 7 - i * 13).padStart(4, '0')}`, date: days[i % days.length], who: who[i % who.length], checkIn: cancelled ? '' : fmt(h * 60 + m), checkOut: cancelled ? '' : fmt(end), status: cancelled ? (i % 2 ? 'refunded' : 'cancelled') : 'completed' }
  })
}
/** Deterministic recent bookings for any directory row. */
export const logsFor = (seed: number, who: string[], n = 4) => logs(seed, who, n)

/* ── Static support threads for the messaging console ────────
   The two live threads (Ananya, Arjun) come from the session store. */
export type StaticMsg = { id: string; from: 'user' | 'admin'; text: string; at: string; ref?: string }
export type ThreadDog = { name: string; breed: string; photo: MediaKey; temperament: Temperament; locked: boolean }
export type AdminThread = {
  id: string
  kind: 'owner' | 'walker'
  name: string
  photo: MediaKey
  city: City
  locality: string
  phone: string
  joined: string
  status: SupportStatus
  unread: number
  time: string
  topic: string
  messages: StaticMsg[]
  /** what the composer starts with */
  draft: string
  dogs?: ThreadDog[]
  walker?: { rating: number; walks: number; years: number; certified: boolean; kyc: 'verified' | 'review' | 'rejected'; online: boolean }
  bookings: BookingLog[]
  caseId?: string
  kycId?: string
}

const m = (id: string, from: 'user' | 'admin', text: string, at: string, ref?: string): StaticMsg => ({ id, from, text, at, ref })

export const OWNER_THREADS: AdminThread[] = [
  {
    id: 'ot-neha', kind: 'owner', name: 'Neha Arora', photo: 'neha', city: 'Mohali', locality: 'Sector 66', phone: '+91 98729 30415', joined: 'Feb 2026', status: 'open', unread: 2, time: '7:36 am', topic: 'Expired certificate', caseId: 'vq7',
    messages: [
      m('a1', 'user', 'Why can I not book a walk for Pablo? It says documents pending.', 'Thu 11:52 am', 'Pablo · Rabies'),
      m('a2', 'admin', 'Hi Neha, Kavya here. Pablo’s Rabies certificate ended on 11 Aug 2026, so bookings are paused until the new one is uploaded.', 'Thu 12:04 pm'),
      m('a3', 'user', 'He got the booster last week. I only have the old paper at home.', 'Today 7:31 am'),
      m('a4', 'user', 'Can the vet send it to you directly?', 'Today 7:36 am'),
    ],
    draft: 'Yes, ask Mohali Pet Clinic to email it to you and upload it from Pablo’s vaccination vault. I will approve it the same day.',
    dogs: [{ name: 'Pablo', breed: 'Pug', photo: 'pugYellow', temperament: 'calm', locked: false }],
    bookings: logs(3, ['Pooja Bhatia', 'Sahil Verma']),
  },
  {
    id: 'ot-aman', kind: 'owner', name: 'Aman Grewal', photo: 'aman', city: 'Mohali', locality: 'Phase 10', phone: '+91 98030 55471', joined: 'Jul 2026', status: 'open', unread: 1, time: '7:18 am', topic: 'Temperament tag', caseId: 'vq4',
    messages: [
      m('b1', 'admin', 'Hi Aman, a walker reported that Tyson lunged at a cyclist on Thursday. His profile says Calm. Could you tell us how he is around bikes?', 'Yesterday 8:40 pm', 'Tyson · Temperament'),
      m('b2', 'user', 'He only does that with fast bikes. He is friendly otherwise, I do not want the surcharge.', 'Today 7:18 am'),
    ],
    draft: 'Understood. For walker safety we will tag Tyson Aggressive / Reactive for now and review it after three clean walks.',
    dogs: [{ name: 'Tyson', breed: 'Labrador Retriever', photo: 'lickLab', temperament: 'calm', locked: false }],
    bookings: logs(1, ['Gurpreet Sandhu', 'Rohan Kapoor']),
  },
  {
    id: 'ot-tara', kind: 'owner', name: 'Tara Oberoi', photo: 'tara', city: 'Delhi NCR', locality: 'DLF Phase 2, Gurugram', phone: '+91 99100 28764', joined: 'Jan 2026', status: 'progress', unread: 0, time: '6:52 am', topic: 'Renewal', caseId: 'vq3',
    messages: [
      m('c1', 'user', 'Laila’s DHPP ends today. I have uploaded the renewal, can you check before her 9 am walk?', 'Today 6:49 am', 'Laila · DHPP'),
      m('c2', 'admin', 'On it, Tara. It is second in this morning’s queue.', 'Today 6:52 am'),
    ],
    draft: 'Checked. The upload is last year’s certificate. Please send the page with the 2026 booster date.',
    dogs: [
      { name: 'Laila', breed: 'Siberian Husky', photo: 'husky', temperament: 'calm', locked: true },
      { name: 'Storm', breed: 'Siberian Husky', photo: 'huskyBlue', temperament: 'reactive', locked: true },
    ],
    bookings: logs(2, ['Nikhil Arora', 'Farhan Ali']),
  },
  {
    id: 'ot-vikram', kind: 'owner', name: 'Vikram Bedi', photo: 'vikram', city: 'Chandigarh', locality: 'Sector 9', phone: '+91 98720 66310', joined: 'Feb 2026', status: 'progress', unread: 0, time: 'Yesterday', topic: 'Refund',
    messages: [
      m('d1', 'user', 'Walker cancelled ten minutes before Rocky’s slot yesterday. I was charged ₹553.', 'Yesterday 7:12 am', 'Booking VF-240733'),
      m('d2', 'admin', 'Sorry about that, Vikram. A full refund of ₹553 is initiated to your UPI. It usually lands within a day.', 'Yesterday 7:25 am'),
      m('d3', 'user', 'Thanks. Please do not match me with him again.', 'Yesterday 7:27 am'),
    ],
    draft: 'Done. He is removed from Rocky’s matches and your refund reference is RF-88213.',
    dogs: [{ name: 'Rocky', breed: 'Rottweiler', photo: 'indieBlack', temperament: 'reactive', locked: true }],
    bookings: logs(5, ['Imran Qureshi', 'Karan Gill']),
  },
  {
    id: 'ot-isha', kind: 'owner', name: 'Isha Chawla', photo: 'isha', city: 'Delhi NCR', locality: 'Sector 50, Noida', phone: '+91 98990 14526', joined: 'Jun 2026', status: 'open', unread: 1, time: 'Yesterday', topic: 'Walk Pass', caseId: 'vq5',
    messages: [
      m('e1', 'user', 'If I buy the walk pass, can I pause it when we travel in December?', 'Yesterday 5:44 pm'),
    ],
    draft: 'Yes. A pass can be paused once for up to 14 days from Bookings, and unused walks carry over.',
    dogs: [{ name: 'Mishti', breed: 'Indian Spitz', photo: 'spitz', temperament: 'calm', locked: false }],
    bookings: logs(4, ['Yash Tomar', 'Nikhil Arora']),
  },
  {
    id: 'ot-dev', kind: 'owner', name: 'Dev Khanna', photo: 'dev', city: 'Chandigarh', locality: 'Sector 35', phone: '+91 98764 11890', joined: 'Oct 2026', status: 'open', unread: 1, time: '7:12 am', topic: 'First booking', caseId: 'vq2',
    messages: [
      m('t1', 'user', 'I uploaded Oreo’s Rabies certificate at 7:10. How long before I can book his first paid walk?', 'Today 7:12 am', 'Oreo · Rabies'),
    ],
    draft: 'Welcome, Dev. Certificates are checked within 4 hours, usually much sooner in the morning. You will get a notification the moment Oreo is approved.',
    dogs: [{ name: 'Oreo', breed: 'Indie', photo: 'indie', temperament: 'calm', locked: false }],
    bookings: logs(9, ['Karan Gill'], 1),
  },
  {
    id: 'ot-meera', kind: 'owner', name: 'Meera Sodhi', photo: 'meera', city: 'Mohali', locality: 'Sector 68', phone: '+91 98155 20114', joined: 'Mar 2026', status: 'resolved', unread: 0, time: 'Thu', topic: 'Invoice',
    messages: [
      m('f1', 'user', 'I need a GST invoice for October for both dogs.', 'Thu 10:02 am'),
      m('f2', 'admin', 'Sent to your email, Meera. 18 walks, ₹6,214 including GST.', 'Thu 10:15 am'),
      m('f3', 'user', 'Got it, thank you!', 'Thu 10:16 am'),
    ],
    draft: 'Happy to help. Simba and Nala are all set for November.',
    dogs: [
      { name: 'Simba', breed: 'Golden Retriever', photo: 'goldenRose', temperament: 'calm', locked: true },
      { name: 'Nala', breed: 'Golden Retriever', photo: 'goldenPup', temperament: 'calm', locked: false },
    ],
    bookings: logs(0, ['Arjun Mehta', 'Pooja Bhatia']),
  },
  {
    id: 'ot-kabir', kind: 'owner', name: 'Kabir Anand', photo: 'kabir', city: 'Delhi NCR', locality: 'Vasant Kunj, New Delhi', phone: '+91 98110 73355', joined: 'Apr 2026', status: 'resolved', unread: 0, time: 'Wed', topic: 'OTP', caseId: 'vq8',
    messages: [
      m('g1', 'user', 'The Check-Out OTP expired before the walker reached my door.', 'Wed 8:01 am', 'Booking VF-240702'),
      m('g2', 'admin', 'It refreshes every 10 minutes. Pull down on the live walk screen and a new code appears. I have closed the walk at 7:58 am from our side.', 'Wed 8:06 am'),
      m('g3', 'user', 'Works now. Thanks.', 'Wed 8:09 am'),
    ],
    draft: 'Glad it worked. Zoro’s DHPP certificate is also in today’s queue.',
    dogs: [
      { name: 'Zoro', breed: 'Indie', photo: 'indieStreet', temperament: 'calm', locked: true },
      { name: 'Chutki', breed: 'Indie', photo: 'indiePups', temperament: 'calm', locked: false },
    ],
    bookings: logs(6, ['Farhan Ali', 'Nikhil Arora']),
  },
  {
    id: 'ot-rhea', kind: 'owner', name: 'Rhea Suri', photo: 'rhea', city: 'Chandigarh', locality: 'Sector 8', phone: '+91 98141 77608', joined: 'Apr 2026', status: 'progress', unread: 0, time: 'Wed', topic: 'Walker change', caseId: 'vq6',
    messages: [
      m('h1', 'user', 'Can Biscuit always get Divya? He hides from new people.', 'Wed 6:30 pm'),
      m('h2', 'admin', 'You can mark her as a favourite and book her slots a week ahead. I have added a note for dispatch as well.', 'Wed 6:41 pm'),
    ],
    draft: 'Divya has confirmed weekday mornings for Biscuit through November.',
    dogs: [{ name: 'Biscuit', breed: 'Beagle', photo: 'beagle', temperament: 'calm', locked: true }],
    bookings: logs(8, ['Divya Rawat', 'Karan Gill']),
  },
  {
    id: 'ot-simran', kind: 'owner', name: 'Simran Kaur', photo: 'simran', city: 'Mohali', locality: 'Phase 3B1', phone: '+91 98147 90022', joined: 'May 2026', status: 'resolved', unread: 0, time: 'Tue', topic: 'Feedback',
    messages: [
      m('i1', 'user', 'Just wanted to say the potty log is the best thing in the app.', 'Tue 9:20 am'),
      m('i2', 'admin', 'That made our morning, Simran. I have passed it on to Arjun.', 'Tue 9:26 am'),
    ],
    draft: 'Thank you for walking with Vuffora. Momo has a 41-walk streak now.',
    dogs: [{ name: 'Momo', breed: 'Shih Tzu', photo: 'shihtzu', temperament: 'calm', locked: true }],
    bookings: logs(7, ['Arjun Mehta', 'Tenzin Dorje']),
  },
]

export const WALKER_THREADS: AdminThread[] = [
  {
    id: 'wt-gurpreet', kind: 'walker', name: 'Gurpreet Sandhu', photo: 'gurpreet', city: 'Mohali', locality: 'Sector 71', phone: '+91 98159 44021', joined: 'Jan 2024', status: 'open', unread: 2, time: '7:39 am', topic: 'Active walk',
    messages: [
      m('j1', 'user', 'Owner is not at the gate for the Check-In OTP. Waiting 8 minutes now.', 'Today 7:34 am', 'Booking VF-240779'),
      m('j2', 'user', 'Guard says flat 402 is not answering the intercom.', 'Today 7:39 am'),
    ],
    draft: 'Calling the owner now, Gurpreet. Please wait 5 more minutes. If nobody comes, you get the full no-show fee.',
    walker: { rating: 4.8, walks: 902, years: 3, certified: true, kyc: 'verified', online: true },
    bookings: [{ id: 'VF-240779', date: 'Today, Sat 14 Nov', who: 'Tyson · Aman Grewal', checkIn: '', checkOut: '', status: 'upcoming' }, ...logs(1, ['Tyson · Aman Grewal', 'Sultan · Sandeep Chahal'], 3)],
  },
  {
    id: 'wt-pooja', kind: 'walker', name: 'Pooja Bhatia', photo: 'pooja', city: 'Mohali', locality: 'Sector 69', phone: '+91 98760 31877', joined: 'Sep 2024', status: 'open', unread: 1, time: '7:05 am', topic: 'Featured listing',
    messages: [
      m('k1', 'user', 'My featured listing shows as active but I am not on the first row in Sector 70.', 'Today 7:05 am'),
    ],
    draft: 'Featured walkers rotate every 30 minutes in each sector. You are on the first row from 7:30 to 8:00 today.',
    walker: { rating: 4.9, walks: 431, years: 2, certified: false, kyc: 'verified', online: true },
    bookings: logs(2, ['Pablo · Neha Arora', 'Nala · Meera Sodhi']),
  },
  {
    id: 'wt-rohan', kind: 'walker', name: 'Rohan Kapoor', photo: 'rohan', city: 'Mohali', locality: 'Phase 3B2', phone: '+91 98728 60094', joined: 'Oct 2024', status: 'progress', unread: 0, time: 'Yesterday', topic: 'Payout',
    messages: [
      m('l1', 'user', 'Thursday’s payout shows ₹1,860 but I count ₹2,084.', 'Yesterday 6:15 pm', 'Payout PO-55131'),
      m('l2', 'admin', 'One walk closed after the 6 pm cut-off, so ₹224 moves to today’s settlement. You will see it by noon.', 'Yesterday 6:28 pm'),
    ],
    draft: 'Today’s settlement is out, Rohan. ₹224 is included in PO-55160.',
    walker: { rating: 4.7, walks: 356, years: 2, certified: false, kyc: 'verified', online: true },
    bookings: logs(3, ['Tyson · Aman Grewal', 'Leo · Gaurav Bansal']),
  },
  {
    id: 'wt-nikhil', kind: 'walker', name: 'Nikhil Arora', photo: 'nikhil', city: 'Delhi NCR', locality: 'DLF Phase 3, Gurugram', phone: '+91 98182 09456', joined: 'Mar 2024', status: 'progress', unread: 0, time: 'Yesterday', topic: 'Dog behaviour',
    messages: [
      m('n1', 'user', 'Storm is tagged Aggressive but his muzzle was not handed over today.', 'Yesterday 7:48 am', 'Booking VF-240745'),
      m('n2', 'admin', 'Thanks for flagging. I have messaged Tara and added "muzzle at handover" to Storm’s checklist.', 'Yesterday 7:55 am'),
      m('n3', 'user', 'Good. Walk went fine on the short leash.', 'Yesterday 8:52 am'),
    ],
    draft: 'Noted on Storm’s profile. Tara has confirmed the muzzle will be at the door from tomorrow.',
    walker: { rating: 4.7, walks: 720, years: 3, certified: true, kyc: 'verified', online: true },
    bookings: logs(4, ['Storm · Tara Oberoi', 'Laila · Tara Oberoi']),
  },
  {
    id: 'wt-yash', kind: 'walker', name: 'Yash Tomar', photo: 'yash', city: 'Delhi NCR', locality: 'Sector 62, Noida', phone: '+91 99100 77312', joined: 'Oct 2026', status: 'open', unread: 1, time: 'Yesterday', topic: 'KYC',
    messages: [
      m('o1', 'user', 'How do I apply for the Aggressive Breed Certified badge?', 'Yesterday 4:10 pm'),
    ],
    draft: 'You need 100 completed walks and a handling assessment. You are at 96, so I will book your assessment for next week.',
    walker: { rating: 4.4, walks: 96, years: 1, certified: false, kyc: 'verified', online: true },
    bookings: logs(5, ['Mishti · Isha Chawla', 'Kiwi · Ayesha Siddiqui']),
  },
  {
    id: 'wt-imran', kind: 'walker', name: 'Imran Qureshi', photo: 'imran', city: 'Chandigarh', locality: 'Sector 35', phone: '+91 98140 23358', joined: 'Jun 2023', status: 'resolved', unread: 0, time: 'Thu', topic: 'Cancellation',
    messages: [
      m('p1', 'user', 'I had to cancel Rocky’s walk, my scooter broke down at Sector 22.', 'Thu 6:48 am', 'Booking VF-240733'),
      m('p2', 'admin', 'Understood, Imran. Since it was inside 15 minutes, the owner is refunded and it counts as one late cancellation this month.', 'Thu 6:55 am'),
      m('p3', 'user', 'Fair. Back online from 9.', 'Thu 6:57 am'),
    ],
    draft: 'Thanks Imran. Your cancellation count resets on 1 Dec.',
    walker: { rating: 4.9, walks: 2040, years: 7, certified: true, kyc: 'verified', online: true },
    bookings: logs(5, ['Rocky · Vikram Bedi', 'Max · Rajat Sethi']),
  },
  {
    id: 'wt-divya', kind: 'walker', name: 'Divya Rawat', photo: 'divya', city: 'Chandigarh', locality: 'Sector 17', phone: '+91 98881 50276', joined: 'Aug 2024', status: 'resolved', unread: 0, time: 'Wed', topic: 'Schedule',
    messages: [
      m('q1', 'user', 'Please block my Sundays in November, I have grooming appointments.', 'Wed 5:02 pm'),
      m('q2', 'admin', 'You can switch slots off from Schedule, but I have done it for you: Sundays are off until 30 Nov.', 'Wed 5:10 pm'),
    ],
    draft: 'All four Sundays are blocked, Divya. Weekday mornings with Biscuit are confirmed.',
    walker: { rating: 4.8, walks: 640, years: 3, certified: false, kyc: 'verified', online: false },
    bookings: logs(8, ['Biscuit · Rhea Suri', 'Waffles · Ritu Bhalla']),
  },
  {
    id: 'wt-farhan', kind: 'walker', name: 'Farhan Ali', photo: 'farhan', city: 'Delhi NCR', locality: 'Saket, New Delhi', phone: '+91 98115 68803', joined: 'Dec 2023', status: 'progress', unread: 0, time: 'Wed', topic: 'KYC renewal',
    messages: [
      m('r1', 'admin', 'Hi Farhan, your police verification ends on 30 Nov. Please upload the renewal to keep your Aggressive Breed badge.', 'Wed 11:30 am', 'KYC · Police Verification'),
      m('r2', 'user', 'Applied at Saket thana on Monday. Receipt uploaded.', 'Wed 12:14 pm'),
    ],
    draft: 'Receipt received. Your badge stays active till 30 Nov. Upload the certificate when it arrives.',
    walker: { rating: 4.8, walks: 1010, years: 5, certified: true, kyc: 'review', online: false },
    bookings: logs(6, ['Zoro · Kabir Anand', 'Peanut · Nidhi Ahuja']),
  },
  {
    id: 'wt-tenzin', kind: 'walker', name: 'Tenzin Dorje', photo: 'tenzin', city: 'Mohali', locality: 'Sector 79', phone: '+91 98765 10592', joined: 'Nov 2024', status: 'resolved', unread: 0, time: 'Tue', topic: 'App issue',
    messages: [
      m('s1', 'user', 'GPS trail stopped recording near the Sector 79 underpass.', 'Tue 7:40 am', 'Booking VF-240699'),
      m('s2', 'admin', 'We can see the gap of 3 minutes. Both OTPs match, so the walk is paid in full.', 'Tue 7:52 am'),
    ],
    draft: 'Keep the app open in the foreground near underpasses, Tenzin. It reconnects faster.',
    walker: { rating: 4.6, walks: 277, years: 2, certified: false, kyc: 'verified', online: true },
    bookings: logs(7, ['Momo · Simran Kaur', 'Jaggu · Manpreet Dhaliwal']),
  },
]

/* ── Outbound message presets (New message) ── */
export const OUTBOUND_REASONS = [
  { id: 'vax', label: 'Clearer vaccination document', forKind: 'owner' as const },
  { id: 'kyc', label: 'Confirm KYC details', forKind: 'walker' as const },
  { id: 'walk', label: 'Active walk escalation', forKind: 'both' as const },
] as const
export type OutboundReason = (typeof OUTBOUND_REASONS)[number]['id']

/* ── Overview: activity feed ── */
export type FeedKind = 'otp' | 'doc' | 'payout' | 'review' | 'signup' | 'refund' | 'kyc' | 'support'
export const FEED: { id: string; kind: FeedKind; who: string; photo: MediaKey; text: string; mins: number; city: City }[] = [
  { id: 'f1', kind: 'otp', who: 'Imran Qureshi', photo: 'imran', text: 'Check-In OTP verified for Max, Sector 21', mins: 2, city: 'Chandigarh' },
  { id: 'f2', kind: 'doc', who: 'Gaurav Bansal', photo: 'dev', text: 'Uploaded Leo’s Rabies certificate', mins: 4, city: 'Mohali' },
  { id: 'f3', kind: 'otp', who: 'Nikhil Arora', photo: 'nikhil', text: 'Check-Out OTP verified for Storm, DLF Phase 2', mins: 6, city: 'Delhi NCR' },
  { id: 'f4', kind: 'payout', who: 'Rohan Kapoor', photo: 'rohan', text: 'Payout PO-55160 of ₹2,084 sent to UPI', mins: 9, city: 'Mohali' },
  { id: 'f5', kind: 'review', who: 'Meera Sodhi', photo: 'meera', text: 'Left 5 stars for Arjun Mehta', mins: 14, city: 'Mohali' },
  { id: 'f6', kind: 'support', who: 'Neha Arora', photo: 'neha', text: 'New support message about Pablo’s Rabies certificate', mins: 16, city: 'Mohali' },
  { id: 'f7', kind: 'signup', who: 'Isha Chawla', photo: 'isha', text: 'Bought a 20-walk pass for Mishti', mins: 21, city: 'Delhi NCR' },
  { id: 'f8', kind: 'kyc', who: 'Harleen Brar', photo: 'meera', text: 'Submitted walker KYC, 4 documents', mins: 22, city: 'Mohali' },
  { id: 'f9', kind: 'otp', who: 'Divya Rawat', photo: 'divya', text: 'Check-In OTP verified for Biscuit, Sector 8', mins: 27, city: 'Chandigarh' },
  { id: 'f10', kind: 'doc', who: 'Tara Oberoi', photo: 'tara', text: 'Uploaded Laila’s DHPP renewal', mins: 53, city: 'Delhi NCR' },
  { id: 'f11', kind: 'refund', who: 'Vikram Bedi', photo: 'vikram', text: 'Refund RF-88213 of ₹553 completed', mins: 58, city: 'Chandigarh' },
  { id: 'f12', kind: 'review', who: 'Kabir Anand', photo: 'kabir', text: 'Left 4 stars for Farhan Ali', mins: 66, city: 'Delhi NCR' },
  { id: 'f13', kind: 'payout', who: 'Pooja Bhatia', photo: 'pooja', text: 'Payout PO-55158 of ₹1,412 sent to bank', mins: 74, city: 'Mohali' },
  { id: 'f14', kind: 'otp', who: 'Yash Tomar', photo: 'yash', text: 'Check-Out OTP verified for Kiwi, Sector 137', mins: 81, city: 'Delhi NCR' },
]

/* ── Overview: GMV for the last 30 days, by city (INR) ── */
const wobble = (i: number, k: number) => Math.sin(i * 1.7 + k) * 0.5 + Math.sin(i * 0.53 + k * 2.1) * 0.35 + Math.cos(i * 3.1 + k) * 0.15
export const GMV_30: { day: string; mohali: number; chandigarh: number; ncr: number }[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 9, 16 + i)) // 16 Oct → 14 Nov
  const dow = date.getUTCDay()
  const weekend = dow === 0 || dow === 6 ? 1.22 : dow === 3 ? 0.9 : 1
  const festive = i >= 3 && i <= 5 ? 0.78 : 1 // quiet few days in the third week of October
  const grow = 1 + i * 0.011
  const round = (n: number) => Math.round(n / 10) * 10
  return {
    day: `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`,
    mohali: round(58_000 * grow * weekend * festive * (1 + wobble(i, 1) * 0.09)),
    chandigarh: round(36_500 * grow * weekend * festive * (1 + wobble(i, 2.4) * 0.12)),
    ncr: round(71_000 * (1 + i * 0.016) * weekend * festive * (1 + wobble(i, 4.2) * 0.1)),
  }
})
