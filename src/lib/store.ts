import { useSyncExternalStore } from 'react'
import { DEFAULT_PRICING, KYC_QUEUE, OWNER_CASE_ID, SEED_LOGS, SEED_THREADS, VET_QUEUE, WALKER_CASE_ID, quote, type Duration, type LogKind, type Msg, type Pricing, type Sender, type ThreadId, type VetState, type WalkLog, type WalkStage } from '../data/core'
import { dogById, type Temperament } from '../data/cast'
import type { MediaKey } from '../data/media'

/* Session state shared by every screen. In the real build all of this
   lives on the server; the prototype keeps it in memory so the demo
   behaves consistently across the three platforms: the walk Ananya pays
   for is the job on Arjun's phone, the OTP he enters starts the timer on
   hers, his activity logs land on her live walk, a message sent in one
   app appears in the other, and Kavya's decisions in the admin queues
   change the status banners in both mobile apps. */

export type SupportStatus = 'open' | 'progress' | 'resolved'

export type SessionState = {
  /* ── the walk, shared by all three platforms ── */
  stage: WalkStage
  dogId: string
  walkerId: string
  duration: Duration
  instant: boolean // Walk Now vs Schedule Later
  recurring: boolean // walk pass selected at booking
  payMethod: string
  logs: WalkLog[]
  rating: number // 0 until the owner reviews
  /* ── chat ── */
  threads: Record<ThreadId, Msg[]>
  supportStatus: Record<'support-owner' | 'support-walker', SupportStatus>
  /* ── Owner App ── */
  viewingWalker: string
  viewingDog: string
  radiusKm: number
  biometric: boolean
  favourites: string[]
  sos: boolean
  /* ── Walker App ── */
  online: boolean
  declined: boolean
  withdrawn: number // INR withdrawn this session
  slotsOff: string[] // weekly slots switched off, "Mon-AM"
  /* ── Admin ── */
  pricing: Pricing
  vetDecisions: Record<string, VetState>
  vetRemarks: Record<string, string>
  temperamentLocks: Record<string, Temperament> // dog name → locked tag
  kycDecisions: Record<string, VetState>
  badges: Record<string, boolean> // kyc case id → Aggressive Breed Certified granted
  viewingCase: string
  viewingKyc: string
  viewingThread: string
  payoutsPaid: string[]
  refundsDone: string[]
  disputesClosed: Record<string, 'owner' | 'walker' | 'split'>
  reviewsHidden: string[]
}

const initial: SessionState = {
  stage: 'none',
  dogId: 'bruno',
  walkerId: 'arjun',
  duration: 45,
  instant: true,
  recurring: false,
  payMethod: 'gpay',
  logs: SEED_LOGS,
  rating: 0,
  threads: SEED_THREADS,
  supportStatus: { 'support-owner': 'progress', 'support-walker': 'open' },
  viewingWalker: 'arjun',
  viewingDog: 'bruno',
  radiusKm: 5,
  biometric: true,
  favourites: ['arjun', 'pooja'],
  sos: false,
  online: true,
  declined: false,
  withdrawn: 0,
  slotsOff: ['Wed-PM', 'Sun-AM', 'Sun-PM'],
  pricing: DEFAULT_PRICING,
  vetDecisions: {},
  vetRemarks: {},
  temperamentLocks: {},
  kycDecisions: {},
  badges: {},
  viewingCase: 'vq1',
  viewingKyc: 'kq1',
  viewingThread: 'support-owner',
  payoutsPaid: [],
  refundsDone: [],
  disputesClosed: {},
  reviewsHidden: [],
}

let state: SessionState = initial
const listeners = new Set<() => void>()

function set(patch: Partial<SessionState> | ((s: SessionState) => Partial<SessionState>)) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

/** Select PRIMITIVES or stable references only (useSyncExternalStore compares by identity). */
export function useSession<T>(select: (s: SessionState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => select(state),
    () => select(state),
  )
}

export const getSession = () => state

const add = (list: string[], id: string) => (list.includes(id) ? list : [...list, id])
const remove = (list: string[], id: string) => list.filter((x) => x !== id)
let seq = 0
const uid = (p: string) => `${p}-${Date.now()}-${++seq}`
/* The demo runs on its own clock (Sat 14 Nov, the 8 am walk), not the visitor's wall clock,
   so new messages and logs sit naturally after the seeded ones. Each call moves it on a minute. */
let demoMin = 8 * 60 + 21
const nowLabel = () => {
  demoMin += 1
  const h = Math.floor(demoMin / 60) % 24
  return `${h % 12 === 0 ? 12 : h % 12}:${String(demoMin % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

export const session = {
  set,
  reset: () => set(initial),

  /* ── the walk ── */
  /** Owner pays: the job request lands on the walker's phone. */
  book: (o: { dogId: string; walkerId: string; duration: Duration; instant: boolean; recurring: boolean; payMethod: string }) => set({ ...o, stage: 'requested', declined: false, logs: SEED_LOGS, rating: 0 }),
  setStage: (stage: WalkStage) => set({ stage }),
  /** Move forward only: never drags the walk back to an earlier stage. */
  advance: (to: WalkStage) =>
    set((s) => {
      const order: WalkStage[] = ['none', 'requested', 'accepted', 'arrived', 'walking', 'ended', 'reviewed']
      return order.indexOf(to) > order.indexOf(s.stage) ? { stage: to } : {}
    }),
  addLog: (kind: LogKind, text: string, photo?: MediaKey) =>
    set((s) => ({ logs: [...s.logs, { id: uid('lg'), kind, at: nowLabel(), text, photo, t: Math.min(0.95, 0.5 + (s.logs.length - SEED_LOGS.length + 1) * 0.1) }] })),
  review: (rating: number) => set({ rating, stage: 'reviewed' }),
  setDuration: (duration: Duration) => set({ duration }),
  setDog: (dogId: string) => set({ dogId }),

  /* ── chat ── */
  send: (thread: ThreadId, from: Sender, text: string, photo?: MediaKey) =>
    set((s) => ({ threads: { ...s.threads, [thread]: [...s.threads[thread], { id: uid('m'), from, text, at: nowLabel(), photo }] } })),
  setSupportStatus: (thread: 'support-owner' | 'support-walker', status: SupportStatus) => set((s) => ({ supportStatus: { ...s.supportStatus, [thread]: status } })),

  /* ── Owner App ── */
  viewWalker: (id: string) => set({ viewingWalker: id }),
  viewDog: (id: string) => set({ viewingDog: id }),
  setRadius: (radiusKm: number) => set({ radiusKm }),
  setBiometric: (biometric: boolean) => set({ biometric }),
  toggleFavourite: (id: string) => set((s) => ({ favourites: s.favourites.includes(id) ? remove(s.favourites, id) : add(s.favourites, id) })),
  setSos: (sos: boolean) => set({ sos }),

  /* ── Walker App ── */
  setOnline: (online: boolean) => set({ online }),
  decline: () => set({ declined: true }),
  withdraw: (amount: number) => set((s) => ({ withdrawn: s.withdrawn + amount })),
  toggleSlot: (key: string) => set((s) => ({ slotsOff: s.slotsOff.includes(key) ? remove(s.slotsOff, key) : add(s.slotsOff, key) })),

  /* ── Admin ── */
  setPricing: (patch: Partial<Pricing>) => set((s) => ({ pricing: { ...s.pricing, ...patch } })),
  setBase: (d: Duration, value: number) => set((s) => ({ pricing: { ...s.pricing, base: { ...s.pricing.base, [d]: value } } })),
  decideVet: (id: string, d: VetState, remark = '') => set((s) => ({ vetDecisions: { ...s.vetDecisions, [id]: d }, vetRemarks: { ...s.vetRemarks, [id]: remark } })),
  lockTemperament: (dog: string, t: Temperament) => set((s) => ({ temperamentLocks: { ...s.temperamentLocks, [dog]: t } })),
  decideKyc: (id: string, d: VetState) => set((s) => ({ kycDecisions: { ...s.kycDecisions, [id]: d } })),
  setBadge: (id: string, on: boolean) => set((s) => ({ badges: { ...s.badges, [id]: on } })),
  viewCase: (id: string) => set({ viewingCase: id }),
  viewKyc: (id: string) => set({ viewingKyc: id }),
  viewThread: (id: string) => set({ viewingThread: id }),
  payOut: (id: string) => set((s) => ({ payoutsPaid: add(s.payoutsPaid, id) })),
  refund: (id: string) => set((s) => ({ refundsDone: add(s.refundsDone, id) })),
  closeDispute: (id: string, to: 'owner' | 'walker' | 'split') => set((s) => ({ disputesClosed: { ...s.disputesClosed, [id]: to } })),
  hideReview: (id: string) => set((s) => ({ reviewsHidden: add(s.reviewsHidden, id) })),
}

/* ── Derived values (pass `s` from useSession selectors, primitives out) ── */

/** The price of the walk in progress, from the admin's current rate card. */
export const currentQuote = (s: SessionState = state) => quote(s.pricing, s.duration, dogById(s.dogId).temperament, s.instant)

/** Effective state of a vetting case after this session's decisions. */
export const vetState = (id: string, s: SessionState = state): VetState => s.vetDecisions[id] ?? VET_QUEUE.find((v) => v.id === id)?.state ?? 'pending'
export const kycState = (id: string, s: SessionState = state): VetState => s.kycDecisions[id] ?? KYC_QUEUE.find((v) => v.id === id)?.state ?? 'pending'
export const pendingVet = (s: SessionState = state) => VET_QUEUE.filter((v) => vetState(v.id, s) === 'pending').length
export const pendingKyc = (s: SessionState = state) => KYC_QUEUE.filter((v) => kycState(v.id, s) === 'pending').length

/** What the Owner App shows for Sheru's Bordetella certificate: follows the admin's decision on case vq1. */
export const ownerDocState = (s: SessionState = state): 'review' | 'approved' | 'rejected' => {
  const d = vetState(OWNER_CASE_ID, s)
  return d === 'pending' ? 'review' : d
}
export const ownerDocRemark = (s: SessionState = state) => s.vetRemarks[OWNER_CASE_ID] ?? ''
/** What the Walker App shows for Arjun's police-verification renewal: follows the admin's decision on case kq1. */
export const walkerDocState = (s: SessionState = state): 'review' | 'approved' | 'rejected' => {
  const d = kycState(WALKER_CASE_ID, s)
  return d === 'pending' ? 'review' : d
}

/** Open support threads for the admin's sidebar badge. */
export const openSupport = (s: SessionState = state) => (s.supportStatus['support-owner'] !== 'resolved' ? 1 : 0) + (s.supportStatus['support-walker'] !== 'resolved' ? 1 : 0)
/** Number of messages in a thread (a primitive, safe to select). */
export const threadCount = (id: ThreadId, s: SessionState = state) => s.threads[id].length
