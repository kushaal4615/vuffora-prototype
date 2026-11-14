import type { MediaKey } from './media'

/* The demo cast. One consistent set of people and dogs across the Owner
   App, the Walker App and the Admin portal. Everyone is fictional. */

export type Temperament = 'calm' | 'reactive'
export const TEMPERAMENT: Record<Temperament, { label: string; short: string; note: string }> = {
  calm: { label: 'Calm / Friendly', short: 'Calm', note: 'Standard handling' },
  reactive: { label: 'Aggressive / Reactive', short: 'Aggressive', note: 'Experienced handler, muzzle and leash protocol' },
}

export type City = 'Mohali' | 'Chandigarh' | 'Delhi NCR'
export const CITIES: City[] = ['Mohali', 'Chandigarh', 'Delhi NCR']

/* ── The owner ── */
export const OWNER = {
  id: 'own-1042',
  name: 'Ananya Sharma',
  first: 'Ananya',
  photo: 'ananya' as MediaKey,
  phone: '+91 98765 43210',
  email: 'ananya.sharma@demo-vuffora.app',
  address: 'B-214, Homeland Heights, Sector 70',
  locality: 'Sector 70, Mohali',
  city: 'Mohali' as City,
  since: 'Aug 2026',
  walks: 38,
}

export type VaccineKey = 'rabies' | 'dhpp' | 'bordetella'
export type DocState = 'approved' | 'review' | 'rejected' | 'expiring'
export type Vaccine = { key: VaccineKey; name: string; file: string; given: string; expires: string; state: DocState; remark?: string }

export type Dog = {
  id: string
  name: string
  breed: string
  photo: MediaKey
  age: string
  weight: string
  gender: 'Male' | 'Female'
  temperament: Temperament
  locked: boolean // temperament tag locked by admin
  diet: string
  medical: string
  notes: string
  vaccines: Vaccine[]
  walks: number
}

export const DOGS: Dog[] = [
  {
    id: 'bruno',
    name: 'Bruno',
    breed: 'Labrador Retriever',
    photo: 'bruno',
    age: '3 yrs',
    weight: '29 kg',
    gender: 'Male',
    temperament: 'calm',
    locked: true,
    diet: 'Dry kibble twice a day. No chicken treats.',
    medical: 'Mild hip stiffness in winter. No medication.',
    notes: 'Pulls for the first five minutes, then settles. Loves the Sector 70 park loop.',
    vaccines: [
      { key: 'rabies', name: 'Rabies', file: 'bruno-rabies-2026.pdf', given: '12 Mar 2026', expires: '12 Mar 2027', state: 'approved' },
      { key: 'dhpp', name: 'DHPP', file: 'bruno-dhpp-2026.pdf', given: '12 Mar 2026', expires: '12 Mar 2027', state: 'approved' },
      { key: 'bordetella', name: 'Bordetella', file: 'bruno-bordetella.jpg', given: '02 Dec 2025', expires: '02 Dec 2026', state: 'expiring' },
    ],
    walks: 31,
  },
  {
    id: 'sheru',
    name: 'Sheru',
    breed: 'German Shepherd',
    photo: 'sheru',
    age: '5 yrs',
    weight: '34 kg',
    gender: 'Male',
    temperament: 'reactive',
    locked: false,
    diet: 'Home-cooked rice and chicken, evening only.',
    medical: 'None.',
    notes: 'Reactive to other male dogs and scooters. Muzzle in lifts and at the gate. Short leash near the market.',
    vaccines: [
      { key: 'rabies', name: 'Rabies', file: 'sheru-rabies-2026.pdf', given: '20 Jun 2026', expires: '20 Jun 2027', state: 'approved' },
      { key: 'dhpp', name: 'DHPP', file: 'sheru-dhpp-2026.pdf', given: '20 Jun 2026', expires: '20 Jun 2027', state: 'approved' },
      { key: 'bordetella', name: 'Bordetella', file: 'sheru-bordetella-scan.jpg', given: '09 Nov 2026', expires: '09 Nov 2027', state: 'review' },
    ],
    walks: 7,
  },
]
export const dogById = (id: string) => DOGS.find((d) => d.id === id) ?? DOGS[0]

/* ── Walkers ── */
export type Walker = {
  id: string
  name: string
  first: string
  photo: MediaKey
  cover: MediaKey // photo-led card image
  locality: string
  city: City
  km: number // distance from Ananya's pin
  eta: number // minutes
  rating: number
  reviews: number
  walks: number
  years: number
  certified: boolean // Aggressive Breed Certified
  featured: boolean // paid featured listing
  online: boolean
  bio: string
  tags: string[]
  /** position on the discovery map, 0–100 */
  x: number
  y: number
}

export const WALKERS: Walker[] = [
  { id: 'arjun', name: 'Arjun Mehta', first: 'Arjun', photo: 'arjun', cover: 'goldenRose', locality: 'Phase 7, Mohali', city: 'Mohali', km: 1.4, eta: 6, rating: 4.9, reviews: 212, walks: 1184, years: 4, certified: true, featured: true, online: true, bio: 'Four years walking big breeds across Mohali. Trained with a K9 handler in Zirakpur; calm voice, short leash, no shortcuts.', tags: ['Large breeds', 'Aggressive Breed Certified', 'Pet first aid'], x: 58, y: 40 },
  { id: 'gurpreet', name: 'Gurpreet Sandhu', first: 'Gurpreet', photo: 'gurpreet', cover: 'walkerPack', locality: 'Sector 71, Mohali', city: 'Mohali', km: 0.8, eta: 4, rating: 4.8, reviews: 164, walks: 902, years: 3, certified: true, featured: false, online: true, bio: 'Ex-army kennel volunteer. Happy with reactive dogs and early starts.', tags: ['Aggressive Breed Certified', 'Early mornings'], x: 36, y: 58 },
  { id: 'pooja', name: 'Pooja Bhatia', first: 'Pooja', photo: 'pooja', cover: 'twoHarness', locality: 'Sector 69, Mohali', city: 'Mohali', km: 1.1, eta: 5, rating: 4.9, reviews: 98, walks: 431, years: 2, certified: false, featured: true, online: true, bio: 'Vet nursing student. Gentle with seniors and puppies.', tags: ['Puppies', 'Senior dogs'], x: 24, y: 34 },
  { id: 'rohan', name: 'Rohan Kapoor', first: 'Rohan', photo: 'rohan', cover: 'runBall', locality: 'Phase 3B2, Mohali', city: 'Mohali', km: 2.3, eta: 9, rating: 4.7, reviews: 77, walks: 356, years: 2, certified: false, featured: false, online: true, bio: 'Runner. Good for high-energy dogs who need more than a stroll.', tags: ['High energy', 'Jog walks'], x: 74, y: 22 },
  { id: 'sahil', name: 'Sahil Verma', first: 'Sahil', photo: 'sahil', cover: 'harnessGrass', locality: 'Sector 68, Mohali', city: 'Mohali', km: 2.9, eta: 11, rating: 4.6, reviews: 54, walks: 240, years: 1, certified: false, featured: false, online: true, bio: 'Weekends and evenings. Sends a photo at every water break.', tags: ['Evenings', 'Photo updates'], x: 14, y: 70 },
  { id: 'imran', name: 'Imran Qureshi', first: 'Imran', photo: 'imran', cover: 'goldenRocks', locality: 'Sector 35, Chandigarh', city: 'Chandigarh', km: 4.6, eta: 16, rating: 4.9, reviews: 301, walks: 2040, years: 7, certified: true, featured: false, online: true, bio: 'Seven years, two thousand walks. Handles guard breeds.', tags: ['Aggressive Breed Certified', 'Guard breeds'], x: 82, y: 62 },
  { id: 'karan', name: 'Karan Gill', first: 'Karan', photo: 'karan', cover: 'twoRun', locality: 'Sector 22, Chandigarh', city: 'Chandigarh', km: 5.8, eta: 19, rating: 4.5, reviews: 41, walks: 188, years: 1, certified: false, featured: false, online: true, bio: 'College athlete. Friendly with small breeds.', tags: ['Small breeds'], x: 90, y: 30 },
  { id: 'divya', name: 'Divya Rawat', first: 'Divya', photo: 'divya', cover: 'runGrass', locality: 'Sector 17, Chandigarh', city: 'Chandigarh', km: 6.4, eta: 22, rating: 4.8, reviews: 119, walks: 640, years: 3, certified: false, featured: false, online: false, bio: 'Groomer by trade. Brushes after every walk.', tags: ['Grooming', 'Small breeds'], x: 66, y: 78 },
  { id: 'nikhil', name: 'Nikhil Arora', first: 'Nikhil', photo: 'nikhil', cover: 'goldenBeach', locality: 'DLF Phase 3, Gurugram', city: 'Delhi NCR', km: 8.2, eta: 27, rating: 4.7, reviews: 143, walks: 720, years: 3, certified: true, featured: false, online: true, bio: 'Works with a Gurugram behaviourist on leash reactivity.', tags: ['Aggressive Breed Certified', 'Leash training'], x: 44, y: 16 },
  { id: 'yash', name: 'Yash Tomar', first: 'Yash', photo: 'yash', cover: 'runPup', locality: 'Sector 62, Noida', city: 'Delhi NCR', km: 9.1, eta: 31, rating: 4.4, reviews: 28, walks: 96, years: 1, certified: false, featured: false, online: true, bio: 'New on Vuffora. Puppies and first-time owners.', tags: ['Puppies'], x: 8, y: 20 },
  { id: 'farhan', name: 'Farhan Ali', first: 'Farhan', photo: 'farhan', cover: 'twoField', locality: 'Saket, New Delhi', city: 'Delhi NCR', km: 9.7, eta: 34, rating: 4.8, reviews: 187, walks: 1010, years: 5, certified: true, featured: false, online: false, bio: 'Five years with rescue Indies and shepherds.', tags: ['Aggressive Breed Certified', 'Rescues'], x: 50, y: 88 },
  { id: 'tenzin', name: 'Tenzin Dorje', first: 'Tenzin', photo: 'tenzin', cover: 'beachDog', locality: 'Sector 79, Mohali', city: 'Mohali', km: 3.4, eta: 13, rating: 4.6, reviews: 63, walks: 277, years: 2, certified: false, featured: false, online: true, bio: 'Quiet walker for nervous dogs. Keeps to low-traffic lanes.', tags: ['Nervous dogs'], x: 30, y: 84 },
]
export const walkerById = (id: string) => WALKERS.find((w) => w.id === id) ?? WALKERS[0]

/* Reviews shown on a walker's profile */
export const REVIEWS: { id: string; who: string; photo: MediaKey; dog: string; rating: number; when: string; text: string; tags: string[] }[] = [
  { id: 'rv1', who: 'Meera Sodhi', photo: 'meera', dog: 'Simba · Golden Retriever', rating: 5, when: '2 days ago', text: 'On time at the gate, OTP in ten seconds, and a photo at the water break. Simba came back tired and happy.', tags: ['On time', 'Great updates'] },
  { id: 'rv2', who: 'Vikram Bedi', photo: 'vikram', dog: 'Rocky · Rottweiler', rating: 5, when: '1 week ago', text: 'Rocky is not easy with strangers. Arjun kept him on a short leash past the market and never rushed him.', tags: ['Handles big dogs', 'Calm'] },
  { id: 'rv3', who: 'Priya Malhotra', photo: 'priya', dog: 'Coco · Beagle', rating: 4, when: '2 weeks ago', text: 'Good walk and a clear route on the map. Was five minutes late once but messaged ahead.', tags: ['Clear route'] },
  { id: 'rv4', who: 'Kabir Anand', photo: 'kabir', dog: 'Zoro · Indie', rating: 5, when: '3 weeks ago', text: 'Booked the 20-walk pass after the first week. Zoro waits at the door at 7.', tags: ['Friendly', 'Reliable'] },
  { id: 'rv5', who: 'Simran Kaur', photo: 'simran', dog: 'Momo · Shih Tzu', rating: 5, when: '1 month ago', text: 'Sends the potty log without being asked. Exactly what I wanted to know from the office.', tags: ['Great updates'] },
]

/* ── The demo walker and the admin team ── */
export const WALKER_ME = WALKERS[0] // Arjun, the persona of the Walker App
export const WALKER_ACCOUNT = { phone: '+91 98140 55210', email: 'arjun.mehta@demo-vuffora.app', upi: 'arjun.mehta@okhdfc', bank: 'HDFC Bank ···· 4471', radiusKm: 5, joined: 'Feb 2023' }

export const ADMIN = { name: 'Kavya Nair', first: 'Kavya', role: 'Super Admin', photo: 'kavya' as MediaKey, email: 'ops@demo-vuffora.app' }
export const SUPPORT_AGENT = { name: 'Rahul Bansal', role: 'Support', photo: 'rahul' as MediaKey }
