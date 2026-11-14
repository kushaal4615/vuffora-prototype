import { CLOCK, fmtDay } from './clock'

/* ZERO-TYPING DEMO DATA. Every input in the prototype mounts with one of
   these values already in it, so a visitor can walk every flow with taps
   alone. All credentials are dummies on the demo-vuffora.app domain; the
   card is the gateway's public test card; ID numbers are masked. One
   consistent cast: the same people and dogs appear on every platform. */

/* ── Dog Owner App: Ananya ── */
export const DEMO_OWNER_LOGIN = { phone: '98765 43210', countryCode: '+91', email: 'ananya.sharma@demo-vuffora.app', password: 'Demo@2026', biometric: true, agree: true }
export const DEMO_OTP = ['4', '8', '2', '6', '1', '9'] // SMS login OTP (6 digits). The walk handover OTPs are 4 digits, in data/core.ts
export const DEMO_DOG = {
  name: 'Bruno',
  breed: 'Labrador Retriever',
  age: '3',
  weight: '29',
  gender: 'Male' as 'Male' | 'Female',
  temperament: 'calm' as 'calm' | 'reactive',
  diet: 'Dry kibble twice a day. No chicken treats.',
  medical: 'Mild hip stiffness in winter. No medication.',
  notes: 'Pulls for the first five minutes, then settles.',
  rabiesExpiry: '2027-03-12',
  dhppExpiry: '2027-03-12',
  bordetellaExpiry: '2026-12-02',
}
export const DEMO_SEARCH_WALKER = 'Sector 70, Mohali'
export const DEMO_BOOKING = { mode: 'now' as 'now' | 'later', date: '2026-11-14', slot: '8:00 am', duration: 45 as 30 | 45 | 60, dogId: 'bruno', recurring: false, note: 'Gate 2, Tower B lobby. Leash is by the door.' }
/** The day and slot picked on the booking screen (Schedule Later); the checkout and confirmation tickets read it back. */
export const DEMO_SLOT_PICK = { date: '2026-11-14', slot: '8:00 am' }
/** "Walk Now · about 6 min" or "Today, Sat 14 Nov · 8:00 am" for the booking tickets */
export const slotLabel = (instant: boolean, etaMin: number) => (instant ? `Walk Now · about ${etaMin} min` : `${DEMO_SLOT_PICK.date === CLOCK.todayIso ? 'Today, ' : ''}${fmtDay(DEMO_SLOT_PICK.date)} · ${DEMO_SLOT_PICK.slot}`)
export const DEMO_SLOTS = ['6:30 am', '7:00 am', '8:00 am', '9:30 am', '5:30 pm', '6:15 pm', '7:00 pm']
export const DEMO_PAYMENT = { method: 'gpay', upiId: 'ananya.sharma@okaxis', card: { number: '4111 1111 1111 1111', expiry: '12/29', cvv: '123', name: 'ANANYA SHARMA' }, bank: 'HDFC Bank', gstin: '', saveCard: true }
export const DEMO_MESSAGE_OWNER = 'Guard at Gate 2 has your name. See you at 8!'
export const DEMO_REVIEW = { rating: 5, tags: ['On time', 'Great updates', 'Handles big dogs'], text: 'Arjun was at the gate on time and sent a photo at the water break. Bruno came back happy and tired.', tip: 50 }
export const DEMO_SUPPORT_OWNER = 'Thanks Kavya. Can I book Sheru for tomorrow morning once it is approved?'
export const DEMO_FAQ_SEARCH = 'refund'
export const DEMO_OWNER_PROFILE = { name: 'Ananya Sharma', email: 'ananya.sharma@demo-vuffora.app', phone: '+91 98765 43210', address: 'B-214, Homeland Heights, Sector 70, Mohali', emergencyName: 'Rohit Sharma', emergencyPhone: '+91 98765 43211' }

/* ── Dog Walker App: Arjun ── */
export const DEMO_WALKER_LOGIN = { phone: '98140 55210', countryCode: '+91', email: 'arjun.mehta@demo-vuffora.app', password: 'Demo@2026', agree: true }
export const DEMO_KYC = {
  fullName: 'Arjun Mehta',
  dob: '1996-04-18',
  address: 'HIG 1182, Phase 7, Mohali',
  experienceYears: '4',
  breeds: ['Large breeds', 'Aggressive / reactive', 'Puppies'],
  certified: true,
  radiusKm: 5,
  aadhaar: 'XXXX XXXX 4471',
  pan: 'ABCPM####K',
  upi: 'arjun.mehta@okhdfc',
  ifsc: 'HDFC0001234',
  account: 'XXXXXX4471',
}
export const DEMO_MESSAGE_WALKER = 'Reached Gate 2. Coming up to Tower B lobby.'
export const DEMO_WALK_NOTE = 'Bruno did the full park loop. Calm with the two dogs at the fountain.'
export const DEMO_SUPPORT_WALKER = 'Thank you. When will the renewed certificate show as verified?'
export const DEMO_WITHDRAW = { amount: '2500', to: 'arjun.mehta@okhdfc' }

/* ── Super Admin: Kavya ── */
export const DEMO_ADMIN = { email: 'ops@demo-vuffora.app', password: 'Demo@2026', role: 'Super Admin', remember: true, otp: ['3', '9', '1', '7', '4', '2'] }
export const DEMO_ADMIN_SEARCH = 'Ananya Sharma'
export const DEMO_VET_REMARK = 'Full page received. Vet stamp and batch number are readable. Approved.'
export const DEMO_VET_REJECT = 'The certificate has expired. Please upload the current one from your vet.'
export const DEMO_ADMIN_REPLY_OWNER = 'Approved just now, Ananya. Sheru is ready to book with any Aggressive Breed Certified walker.'
export const DEMO_ADMIN_REPLY_WALKER = 'Your renewal is verified, Arjun. Nothing else needed from you.'
export const DEMO_ADMIN_OUTBOUND = 'Hi, this is Kavya from Vuffora. The Rabies certificate you uploaded has expired. Could you upload the current one so we can approve your account?'
export const DEMO_REFUND = { amount: '329', reason: 'Walker cancelled 10 minutes before the slot', mode: 'full' as 'full' | 'partial' }
export const DEMO_DISPUTE_NOTE = 'GPS shows the full 45 minutes and both OTPs match. Refunding the instant-booking fee as goodwill.'
export const DEMO_INVITE = { name: 'Rahul Bansal', email: 'rahul.bansal@demo-vuffora.app', role: 'Support Agent' }
export const DEMO_DATE_RANGE = { from: '2026-08-16', to: '2026-11-14', preset: '90d' }

/* ── Dog Owner App: pet profile forms, one per dog (owner.dog). "coco" is the pre-filled "Add another" dog ── */
export const DEMO_DOG_FORMS: Record<string, { name: string; breed: string; age: string; weight: string; gender: 'Male' | 'Female'; temperament: 'calm' | 'reactive'; diet: string; medical: string; rabiesExpiry: string; dhppExpiry: string; bordetellaExpiry: string }> = {
  bruno: { name: DEMO_DOG.name, breed: DEMO_DOG.breed, age: DEMO_DOG.age, weight: DEMO_DOG.weight, gender: DEMO_DOG.gender, temperament: DEMO_DOG.temperament, diet: DEMO_DOG.diet, medical: DEMO_DOG.medical, rabiesExpiry: DEMO_DOG.rabiesExpiry, dhppExpiry: DEMO_DOG.dhppExpiry, bordetellaExpiry: DEMO_DOG.bordetellaExpiry },
  sheru: { name: 'Sheru', breed: 'German Shepherd', age: '5', weight: '34', gender: 'Male', temperament: 'reactive', diet: 'Home-cooked rice and chicken, evening only.', medical: 'None.', rabiesExpiry: '2027-06-20', dhppExpiry: '2027-06-20', bordetellaExpiry: '2027-11-09' },
  coco: { name: 'Coco', breed: 'Beagle', age: '1', weight: '11', gender: 'Female', temperament: 'calm', diet: 'Puppy kibble three times a day. Carrot sticks as treats.', medical: 'Spayed in September. No allergies.', rabiesExpiry: '2027-08-18', dhppExpiry: '2027-08-18', bordetellaExpiry: '2027-09-02' },
}
/* Admin: first half (vetting, KYC, owners, messages) */
export const DEMO_ADMIN_OUTBOUND_CHECK = 'Hi, this is Kavya from Vuffora. We are checking the certificate you uploaded. Could you confirm the batch number printed next to the vet’s stamp?'
export const DEMO_ADMIN_OUTBOUND_KYC = 'Hi, this is Kavya from Vuffora compliance. Could you confirm the name on your PAN card matches your Aadhaar, and re-upload the police verification if it has been renewed?'
export const DEMO_ADMIN_OUTBOUND_WALK = 'Hi, this is Kavya from Vuffora. We are watching the walk in progress and wanted to check that everything is fine at the handover. Reply here and we will step in straight away.'
export const DEMO_ADMIN_REMINDER = 'A vaccination certificate is due for renewal. Upload the new one from the vaccination vault to keep booking walks.'
export const DEMO_KYC_NOTE = 'Renewal matches the SSP Office record. Police verification is valid until Nov 2027.'
