import { motion } from 'framer-motion'
import { BadgeCheck, CalendarDays, ChevronRight, FileCheck2, Landmark, LifeBuoy, LogOut, MapPin, ShieldCheck, Wallet, type LucideIcon } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { Certified, StarRow, StatusPill } from '../../components/Brand'
import { ProgressRing } from '../../components/Charts'
import { MapCanvas } from '../../components/Map'
import { Rail } from '../../components/Media'
import { REVIEWS, WALKER_ACCOUNT, WALKER_ME } from '../../data/cast'
import { img } from '../../data/media'
import { RATING_BREAKDOWN, SERVICE_LOCALITIES, WALKER_STATS } from '../../data/walkerData'
import { type WalkerScreenId, useNav } from '../../lib/navigation'
import { useSession, walkerDocState } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, SectionHead, safeTop } from '../mobileShell'

/* Arjun's profile: what owners see (photo, rating, badges, reviews, the
   area he covers) and his own account rows underneath. The Police
   Verification badge follows the admin's KYC decision. */

const ROWS: { icon: LucideIcon; label: string; sub: string; to: WalkerScreenId }[] = [
  { icon: FileCheck2, label: 'Documents and KYC', sub: 'Aadhaar, PAN, police verification, payout account', to: 'walker.kyc' },
  { icon: CalendarDays, label: 'Availability', sub: 'Weekly slots and the Online switch', to: 'walker.schedule' },
  { icon: Wallet, label: 'Wallet', sub: 'Balance, ledger and withdrawals', to: 'walker.earnings' },
  { icon: LifeBuoy, label: 'Help', sub: 'Chat with the admin, partner FAQs', to: 'walker.support' },
]

export default function WalkerProfile() {
  const { navigate, reset, toast } = useNav()
  const doc = useSession(walkerDocState)
  const totalRatings = RATING_BREAKDOWN.reduce((a, b) => a + b.count, 0)

  return (
    <MobileScreen tab="profile" cap="var(--ink)">
      {/* photo hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <img src={img(WALKER_ME.cover, 900)} alt="A golden retriever Arjun walks, holding a rose" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 28%' }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgb(10 18 56 / 0.72) 0%, rgb(35 72 214 / 0.3) 36%, rgb(14 27 87 / 0.94) 86%)' }} />
        <div className="relative px-5 pb-16" style={{ paddingTop: safeTop(12) }}>
          <p className="label text-sun-light">Your public profile</p>
          <div className="mt-[92px] flex items-end gap-4">
            <Avatar who={WALKER_ME.photo} size={92} ring verified alt="Arjun Mehta" />
            <div className="min-w-0 pb-1">
              <h1 className="grot text-[34px] leading-[0.95]">
                <span className="swoosh">{WALKER_ME.first}</span> Mehta
              </h1>
              <p className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-on-ink-2">
                <MapPin size={13} strokeWidth={2.6} aria-hidden /> {WALKER_ME.locality} · since {WALKER_ACCOUNT.joined}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* three figures lapping the photo */}
      <section className="relative z-10 mx-4 -mt-11 grid grid-cols-3 rounded-[var(--r-container)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow-floating)]">
        {[
          { v: WALKER_ME.rating.toFixed(1), k: `${WALKER_ME.reviews} reviews`, star: true },
          { v: WALKER_ME.walks.toLocaleString('en-IN'), k: 'walks done' },
          { v: String(WALKER_ME.years), k: 'years handling' },
        ].map((f, i) => (
          <div key={f.k} className={i > 0 ? 'pl-4 shadow-[inset_2px_0_0_var(--sun)]' : ''}>
            <p className="figure num text-[32px]">{f.v}</p>
            {f.star && <StarRow rating={WALKER_ME.rating} size={11} />}
            <p className="mt-0.5 text-[12px] font-semibold text-text-2">{f.k}</p>
          </div>
        ))}
      </section>

      {/* badges */}
      <div className="mt-4 flex flex-wrap items-center gap-2 px-5">
        <span className="flex h-7 items-center gap-1.5 rounded-full bg-success-soft px-3 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[var(--on-success-soft)]">
          <BadgeCheck size={14} strokeWidth={2.6} aria-hidden /> KYC verified
        </span>
        <Certified className="!h-7 !px-3" />
        <button type="button" onClick={() => navigate('walker.kyc')} className="flex h-11 items-center gap-2">
          <span className="flex items-center gap-1 text-[12px] font-bold text-text-2">
            <ShieldCheck size={14} strokeWidth={2.5} aria-hidden /> Police verification
          </span>
          <StatusPill kind={doc} label={doc === 'review' ? 'Renewal under review' : undefined} />
        </button>
      </div>
      <p className="mt-2 px-5 text-[14px] leading-relaxed text-text-2">{WALKER_ME.bio}</p>

      {/* rating breakdown */}
      <div className="mt-6 flex items-center gap-5 px-5">
        <div className="shrink-0 text-center">
          <p className="figure num text-[60px]">{WALKER_ME.rating.toFixed(1)}</p>
          <StarRow rating={WALKER_ME.rating} size={13} />
          <p className="num mt-1 text-[11px] font-bold text-text-2">{totalRatings} ratings</p>
        </div>
        <ul className="min-w-0 flex-1" aria-label="Rating breakdown">
          {RATING_BREAKDOWN.map((r) => (
            <li key={r.stars} className="flex h-6 items-center gap-2">
              <span className="num w-3 text-[12px] font-extrabold">{r.stars}</span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-high)]">
                <motion.span className="absolute inset-y-0 left-0 w-full rounded-full bg-sun" style={{ transformOrigin: 'left' }} initial={{ scaleX: 0 }} animate={{ scaleX: r.count / totalRatings }} transition={spring.page} />
              </span>
              <span className="num w-7 text-right text-[12px] font-semibold text-text-2">{r.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* reviews rail */}
      <SectionHead className="mt-6" title="What owners say" eyebrow={`${REVIEWS.length} latest`} />
      <Rail className="mt-3 pb-2" gap={12}>
        {REVIEWS.map((r) => (
          <article key={r.id} className="flex w-[272px] shrink-0 snap-start flex-col rounded-[var(--r-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-raised)]">
            <div className="flex items-center gap-2.5">
              <Avatar who={r.photo} size={38} />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[14px] font-extrabold">{r.who}</p>
                <p className="truncate text-[12px] font-semibold text-text-2">{r.dog}</p>
              </div>
              <StarRow rating={r.rating} size={11} />
            </div>
            <p className="mt-2.5 flex-1 text-[13px] leading-snug">{r.text}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="flex min-w-0 gap-1.5">
                {r.tags.slice(0, 2).map((t) => (
                  <span key={t} className="flex h-6 items-center whitespace-nowrap rounded-full bg-sun-soft px-2 text-[11px] font-bold text-[var(--on-sun-soft)]">{t}</span>
                ))}
              </span>
              <span className="shrink-0 text-[11px] font-semibold text-text-2">{r.when}</span>
            </div>
          </article>
        ))}
      </Rail>

      {/* reliability, full-bleed ink */}
      <section className="relative mt-6 overflow-hidden bg-ink px-5 py-6 text-on-ink">
        <span aria-hidden className="sun -right-[14%] -top-[60%] w-[42%]" />
        <p className="label relative text-sun-light">Reliability, last 90 days</p>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { v: WALKER_STATS.acceptance, k: 'Requests accepted' },
            { v: WALKER_STATS.onTime, k: 'On time at the gate' },
            { v: WALKER_STATS.repeat, k: 'Owners who rebook' },
          ].map((s) => (
            <div key={s.k} className="flex flex-col items-start gap-2">
              <ProgressRing value={s.v} size={62} stroke={6} color="var(--sun)">
                <span className="figure num text-[17px] text-white">{s.v}%</span>
              </ProgressRing>
              <p className="text-[12px] font-semibold leading-tight text-on-ink-2">{s.k}</p>
            </div>
          ))}
        </div>
      </section>

      {/* service area */}
      <div className="relative h-[210px] overflow-hidden">
        <div className="-mt-[23%]">
          <MapCanvas className="aspect-square w-full" radius={{ x: 54, y: 50, r: 23 }} pins={[{ id: 'me', x: 54, y: 50, photo: WALKER_ME.photo, active: true }]} />
        </div>
        <span className="glass num absolute left-4 top-4 flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-extrabold text-text">
          <MapPin size={14} strokeWidth={2.6} aria-hidden /> {WALKER_ACCOUNT.radiusKm} km service radius
        </span>
      </div>
      <div className="flex flex-wrap gap-2 px-5 pt-4">
        {SERVICE_LOCALITIES.map((l) => (
          <span key={l} className="flex h-8 items-center rounded-full bg-accent-soft px-3 text-[13px] font-bold text-[var(--on-accent-soft)]">{l}</span>
        ))}
      </div>

      {/* account rows */}
      <SectionHead className="mt-7" title="Your account" />
      <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-1 px-3">
        {ROWS.map((r) => (
          <motion.li key={r.to} variants={listItem}>
            <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={() => navigate(r.to)} className="flex min-h-[60px] w-full items-center gap-3 rounded-[var(--r-card)] px-2 py-2 text-left">
              <r.icon size={22} strokeWidth={2.1} className="shrink-0 text-accent-ink" aria-hidden />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-[15px] font-extrabold">{r.label}</span>
                <span className="mt-0.5 block truncate text-[12px] font-semibold text-text-2">{r.sub}</span>
              </span>
              {r.to === 'walker.kyc' && doc !== 'approved' && <span aria-label="Needs attention" className="h-2.5 w-2.5 shrink-0 rounded-full bg-warn" />}
              <ChevronRight size={18} className="shrink-0 text-text-2" aria-hidden />
            </motion.button>
          </motion.li>
        ))}
      </motion.ul>

      {/* payout account */}
      <button type="button" onClick={() => toast('Payout account changes are verified by the admin. Update it in Documents and KYC', 'neutral')} className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-[var(--r-card)] bg-sun-soft px-4 py-3.5 text-left text-[var(--on-sun-soft)]">
        <Landmark size={22} strokeWidth={2.2} className="shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="label block text-[10px]">Payout account</span>
          <span className="num mt-1 block truncate text-[14px] font-extrabold text-text">UPI ar···ta@okhdfc</span>
          <span className="num block truncate text-[12px] font-semibold">{WALKER_ACCOUNT.bank} · {WALKER_ACCOUNT.phone.slice(0, 4)}··· ··{WALKER_ACCOUNT.phone.slice(-3)}</span>
        </span>
        <StatusPill kind="verified" className="!bg-white" />
      </button>

      <button type="button" onClick={() => reset('walker.signin')} className="mx-auto mt-4 flex h-12 items-center gap-2 px-5 text-[14px] font-extrabold text-danger-text">
        <LogOut size={17} strokeWidth={2.4} aria-hidden /> Sign out
      </button>
      <p className="meta pb-2 text-center text-text-2">Vuffora Partner 1.0 · {WALKER_ACCOUNT.email}</p>
    </MobileScreen>
  )
}
