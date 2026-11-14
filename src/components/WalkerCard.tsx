import { motion } from 'framer-motion'
import { MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import type { Walker } from '../data/cast'
import { img } from '../data/media'
import { spring } from '../motion/springs'
import { Avatar } from './Avatar'
import { Price, Stars } from './Brand'

/* The photo-led walker card from the client's reference: a dog photo on
   top, the walker's round avatar with a yellow ring lapping the photo's
   lower-right corner, the name with the yellow swoosh, the locality, and
   the price set big. `wide` is the list-row version for the discovery list. */

export function WalkerCard({ w, price, onClick, width = 172, className = '' }: { w: Walker; price: number; onClick: () => void; width?: number | string; className?: string }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={onClick} aria-label={`${w.name}, ${w.locality}, from ₹${price}`} className={`relative shrink-0 snap-start overflow-visible rounded-[var(--r-card)] bg-[var(--surface)] text-left shadow-[var(--shadow-raised)] ${className}`} style={{ width }}>
      <div className="relative">
        <img src={img(w.cover, 420)} alt="" loading="lazy" className="aspect-[4/3.4] w-full rounded-t-[var(--r-card)] object-cover" />
        {w.featured && (
          <span className="absolute left-2 top-2 flex h-6 items-center gap-1 rounded-full bg-sun px-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-on-sun">
            <Sparkles size={11} strokeWidth={2.6} aria-hidden /> Featured
          </span>
        )}
        <span className="absolute -bottom-5 right-3 z-10">
          <Avatar who={w.photo} size={46} ring />
        </span>
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <div className="flex items-baseline justify-between gap-2 pr-12">
          <span className="grot swoosh truncate text-[19px]">{w.first}</span>
        </div>
        <span className="mt-1.5 flex items-center gap-1 truncate text-[12px] font-semibold text-text-2">
          <MapPin size={12} strokeWidth={2.4} className="shrink-0" aria-hidden />
          <span className="truncate">{w.locality}</span>
        </span>
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="flex flex-col gap-0.5">
            <Stars rating={w.rating} count={w.reviews} size={12} />
            <span className="num text-[11px] font-semibold text-text-2">{w.km} km · {w.eta} min</span>
          </span>
          <Price amount={price} size={24} />
        </div>
        {w.certified && (
          <span className="mt-2 flex h-6 w-max max-w-full items-center gap-1 rounded-full bg-accent-soft px-2 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[var(--on-accent-soft)]">
            <ShieldCheck size={11} strokeWidth={2.6} className="shrink-0" aria-hidden /> <span className="truncate">Aggressive certified</span>
          </span>
        )}
      </div>
    </motion.button>
  )
}

/** List row: avatar, name, meta, price. Borderless; rhythm does the separating. */
export function WalkerRow({ w, price, onClick, active = false }: { w: Walker; price: number; onClick: () => void; active?: boolean }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={onClick} className={`flex w-full items-center gap-3 rounded-[var(--r-card)] px-3 py-2.5 text-left ${active ? 'bg-accent-soft' : ''}`}>
      <span className="relative shrink-0">
        <img src={img(w.cover, 200)} alt="" loading="lazy" className="h-[62px] w-[62px] rounded-[16px] object-cover" />
        <span className="absolute -bottom-1.5 -right-1.5">
          <Avatar who={w.photo} size={30} ring />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-extrabold">{w.name}</span>
          {w.certified && <ShieldCheck size={15} strokeWidth={2.5} className="shrink-0 text-accent-ink" aria-label="Aggressive Breed Certified" />}
          {w.featured && <span className="shrink-0 rounded-full bg-sun px-1.5 text-[10px] font-extrabold uppercase text-on-sun">Featured</span>}
        </span>
        <span className="block truncate text-[12px] font-semibold text-text-2">{w.locality} · {w.years} yr{w.years > 1 ? 's' : ''} · {w.walks.toLocaleString('en-IN')} walks</span>
        <span className="mt-0.5 flex items-center gap-2">
          <Stars rating={w.rating} count={w.reviews} size={12} />
          <span className="num text-[11px] font-semibold text-text-2">{w.km} km · {w.eta} min away</span>
        </span>
      </span>
      <Price amount={price} size={22} />
    </motion.button>
  )
}
