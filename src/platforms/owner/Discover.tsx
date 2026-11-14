import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CalendarClock, LocateFixed, MapPin, ShieldCheck, Sparkles, Star, Timer, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Stars } from '../../components/Brand'
import { Button } from '../../components/Button'
import { MapCanvas, type MapPin as Pin } from '../../components/Map'
import { EmptyState } from '../../components/Media'
import { Segmented } from '../../components/Tabs'
import { WalkerRow } from '../../components/WalkerCard'
import { DOGS, WALKERS, dogById } from '../../data/cast'
import { HOME_PIN, quote } from '../../data/core'
import { DEMO_SEARCH_WALKER } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { AppTabBar, SAFE_TOP, TABBAR_H, safeBottom } from '../mobileShell'

/* Geo-location walker discovery. Yellow search bar, the drawn map with
   walker photo pins and a radius ring that follows the 2 to 10 km slider,
   and a sheet lapping the map with the filters and the list. */

type FilterId = 'rating' | 'years' | 'certified' | 'featured'
const FILTERS: { id: FilterId; label: string; icon: typeof Star }[] = [
  { id: 'rating', label: 'Rating 4.5+', icon: Star },
  { id: 'years', label: '3+ years', icon: Timer },
  { id: 'certified', label: 'Aggressive Breed Certified', icon: ShieldCheck },
  { id: 'featured', label: 'Featured first', icon: Sparkles },
]

export default function OwnerDiscover() {
  const { navigate, toast } = useNav()
  const radiusKm = useSession((s) => s.radiusKm)
  const instant = useSession((s) => s.instant)
  const duration = useSession((s) => s.duration)
  const pricing = useSession((s) => s.pricing)
  const dogId = useSession((s) => s.dogId)
  const dog = dogById(dogId)
  const reactive = dog.temperament === 'reactive'

  const [view, setView] = useState<'map' | 'list'>('map')
  const [place, setPlace] = useState(DEMO_SEARCH_WALKER)
  const [on, setOn] = useState<Record<FilterId, boolean>>({ rating: false, years: false, certified: false, featured: true })
  const [activeId, setActiveId] = useState<string | null>(null)

  const certifiedOn = on.certified || reactive
  const price = quote(pricing, duration, dog.temperament, instant).base

  const inRange = WALKERS.filter((w) => w.online && w.km <= radiusKm)
  const list = inRange
    .filter((w) => (!on.rating || w.rating >= 4.5) && (!on.years || w.years >= 3) && (!certifiedOn || w.certified))
    .sort((a, b) => (on.featured ? Number(b.featured) - Number(a.featured) : 0) || a.km - b.km)
  const active = list.find((w) => w.id === activeId) ?? null
  const fastest = [...list].sort((a, b) => a.eta - b.eta)[0]

  const toggle = (id: FilterId) => {
    if (id === 'certified' && reactive) {
      toast(`${dog.name} is tagged Aggressive / Reactive, so only certified walkers are shown.`, 'warn')
      return
    }
    setOn((f) => ({ ...f, [id]: !f[id] }))
  }
  const open = (id: string) => {
    session.viewWalker(id)
    navigate('owner.walker')
  }
  const bookFastest = () => {
    if (!fastest) return
    session.viewWalker(fastest.id)
    navigate('owner.booking')
  }

  const pins: Pin[] = list.map((w) => ({
    id: w.id,
    x: w.x,
    y: w.y,
    photo: w.photo,
    label: `${w.km} km`,
    tone: w.id === activeId ? 'sun' : w.featured ? 'ink' : 'accent',
    active: w.id === activeId,
    ariaLabel: `${w.name}, ${w.km} km away`,
    onClick: () => setActiveId((id) => (id === w.id ? null : w.id)),
  }))

  return (
    <div data-screen-root className="relative flex h-full flex-col bg-bg">
      {/* yellow search bar */}
      <header className="relative z-20 shrink-0 overflow-hidden bg-sun px-4 pb-3 text-on-sun" style={{ paddingTop: `calc(${SAFE_TOP} + 6px)` }}>
        <span aria-hidden className="pointer-events-none absolute -right-[18%] -top-[120%] aspect-square w-[62%] rounded-full bg-[rgb(255_255_255/0.3)]" />
        <label className="relative flex h-12 items-center gap-2.5 rounded-full bg-[var(--surface)] pl-4 pr-1.5 text-text shadow-[var(--shadow-raised)]">
          <MapPin size={18} strokeWidth={2.5} className="shrink-0 text-accent-ink" aria-hidden />
          <span className="sr-only">Search area</span>
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Sector, society or landmark" className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-bold outline-none placeholder:font-semibold placeholder:text-text-3" />
          <motion.button type="button" whileTap={{ scale: 0.92 }} transition={spring.ui} onClick={() => { setPlace(DEMO_SEARCH_WALKER); toast('Using your home pin at Homeland Heights', 'info') }} aria-label="Use my location" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
            <LocateFixed size={18} strokeWidth={2.4} aria-hidden />
          </motion.button>
        </label>
      </header>

      {/* the map */}
      {view === 'map' && (
        <MapCanvas className="h-[41%] shrink-0" home={HOME_PIN} pins={pins} radius={{ x: HOME_PIN[0], y: HOME_PIN[1], r: radiusKm * 5.5 }}>
          <span className="glass num absolute right-3 top-3 z-[6] flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-extrabold text-text">
            {instant ? <Zap size={13} strokeWidth={2.6} className="text-accent-ink" aria-hidden /> : <CalendarClock size={13} strokeWidth={2.6} className="text-accent-ink" aria-hidden />}
            {instant ? 'Walk Now' : 'Schedule Later'}
          </span>
          <span className="num absolute left-3 top-3 z-[6] flex h-8 items-center rounded-full bg-ink px-3 text-[12px] font-extrabold text-on-ink shadow-[var(--shadow-raised)]">{radiusKm} km radius</span>

          <AnimatePresence>
            {active && (
              <motion.div key={active.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10, transition: { duration: 0.14 } }} transition={spring.ui} className="glass absolute inset-x-3 bottom-8 z-[7] flex items-center gap-2.5 rounded-[var(--r-card)] p-2.5">
                <Avatar who={active.photo} size={46} ring />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-extrabold">{active.name}</span>
                    {active.certified && <ShieldCheck size={15} strokeWidth={2.5} className="shrink-0 text-accent-ink" aria-label="Aggressive Breed Certified" />}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <Stars rating={active.rating} size={12} />
                    <span className="num truncate text-[11px] font-bold text-text-2">
                      {active.km} km · {active.eta} min
                    </span>
                  </span>
                </span>
                <Button size="sm" className="!h-11" onClick={() => open(active.id)}>
                  View profile
                </Button>
                <button type="button" onClick={() => setActiveId(null)} aria-label="Close" className="-ml-1 -mr-1 grid h-11 w-8 shrink-0 place-items-center text-text-2">
                  <X size={18} strokeWidth={2.4} aria-hidden />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </MapCanvas>
      )}

      {/* the sheet: lapping the map */}
      <main className={`scroll-y relative z-10 min-h-0 flex-1 bg-bg ${view === 'map' ? '-mt-5 rounded-t-[28px] shadow-[0_-14px_36px_-16px_rgb(14_27_87/0.35)]' : ''}`} style={{ paddingBottom: `calc(${safeBottom(TABBAR_H + 20)} + var(--chrome-space, 0px))` }}>
        <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
          <Segmented<'map' | 'list'> size="sm" tone="ink" value={view} onChange={setView} items={[{ id: 'map', label: 'Map' }, { id: 'list', label: 'List' }]} />
          <div className="flex items-center gap-1 rounded-full bg-[var(--surface-high)] p-1" role="tablist" aria-label="Walk for">
            {DOGS.map((d) => {
              const sel = d.id === dog.id
              return (
                <button key={d.id} type="button" role="tab" aria-selected={sel} onClick={() => { session.setDog(d.id); setActiveId(null) }} className={`flex h-9 items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-3 text-[12px] font-extrabold ${sel ? 'bg-[var(--surface)] text-text shadow-[var(--shadow-raised)]' : 'text-text-2'}`}>
                  <img src={img(d.photo, 80)} alt="" className="h-8 w-8 rounded-full object-cover" style={{ objectPosition: '50% 20%' }} />
                  {d.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* radius slider */}
        <div className="mt-2 px-5">
          <div className="flex items-center gap-3">
            <label htmlFor="radius" className="shrink-0 text-[12px] font-bold leading-tight text-text-2">
              Radius
              <span className="num block text-[11px]">2 to 10 km</span>
            </label>
            <div className="relative flex h-11 min-w-0 flex-1 items-center">
              <span aria-hidden className="absolute inset-x-0 h-[8px] rounded-full bg-[var(--surface-high)]" />
              <span aria-hidden className="absolute left-0 h-[8px] rounded-full bg-accent" style={{ width: `${((radiusKm - 2) / 8) * 100}%` }} />
              <input
                id="radius"
                type="range"
                min={2}
                max={10}
                step={1}
                value={radiusKm}
                onChange={(e) => { session.setRadius(Number(e.target.value)); setActiveId(null) }}
                aria-valuetext={`${radiusKm} kilometres`}
                className="vf-range relative h-11 w-full cursor-pointer appearance-none bg-transparent"
              />
            </div>
            <span className="figure num w-[58px] shrink-0 text-right text-[26px]">
              <span className="swoosh">{radiusKm}</span>
              <span className="unit" style={{ verticalAlign: 'baseline', fontSize: '0.5em' }}>km</span>
            </span>
          </div>
          <style>{`.vf-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:28px;height:28px;border-radius:999px;background:#fff;border:4px solid var(--accent);box-shadow:0 4px 12px -2px rgb(14 27 87 / .4)}.vf-range::-moz-range-thumb{width:20px;height:20px;border-radius:999px;background:#fff;border:4px solid var(--accent)}.vf-range::-moz-range-track{background:transparent}`}</style>
        </div>

        {/* filter chips: a rail that bleeds off the right edge */}
        <div className="scroll-x mt-1 flex gap-2 px-4 pb-1" style={{ scrollPaddingLeft: 16 }}>
          {FILTERS.map((f) => {
            const sel = f.id === 'certified' ? certifiedOn : on[f.id]
            return (
              <motion.button key={f.id} type="button" aria-pressed={sel} whileTap={{ scale: 0.95 }} transition={spring.ui} onClick={() => toggle(f.id)} className={`flex h-11 shrink-0 snap-start items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold ${sel ? 'bg-accent text-on-accent' : 'bg-[var(--surface)] text-text shadow-[var(--shadow-raised)]'}`}>
                <f.icon size={14} strokeWidth={2.5} aria-hidden />
                {f.label}
              </motion.button>
            )
          })}
        </div>
        {reactive && (
          <p className="mx-4 mt-2 flex items-start gap-2 rounded-[var(--r-control)] bg-reactive-soft px-3 py-2.5 text-[12px] font-semibold leading-snug text-[var(--on-reactive-soft)]">
            <ShieldCheck size={15} strokeWidth={2.5} className="mt-px shrink-0" aria-hidden />
            {dog.name} is tagged Aggressive / Reactive, so we only show Aggressive Breed Certified walkers. The filter stays on.
          </p>
        )}

        {/* count + book fastest */}
        <div className="mt-2.5 flex items-center justify-between gap-3 px-5">
          <p className="min-w-0 leading-tight">
            <span className="grot block text-[20px]">
              {list.length} {list.length === 1 ? 'walker' : 'walkers'} within {radiusKm} km
            </span>
            <span className="num mt-1 block truncate text-[12px] font-semibold text-text-2">
              {instant ? 'Walk Now' : 'Schedule Later'} · {duration} min for {dog.name} · {inRange.length - list.length > 0 ? `${inRange.length - list.length} hidden by filters` : 'online now'}
            </span>
          </p>
          {fastest && (
            <Button size="sm" trailing={ArrowRight} className="!h-11" onClick={bookFastest}>
              Book fastest
            </Button>
          )}
        </div>

        {list.length === 0 ? (
          <EmptyState
            title="No walkers match"
            body={`Nobody online within ${radiusKm} km fits these filters. Widen the radius or clear a filter.`}
            action={
              <Button variant="ink" onClick={() => { setOn({ rating: false, years: false, certified: false, featured: true }); session.setRadius(10) }}>
                Clear filters, search 10 km
              </Button>
            }
          />
        ) : (
          <motion.ul key={`${radiusKm}-${dogId}-${Object.values(on).join('')}`} variants={listParent} initial="hidden" animate="show" className="mt-2 px-2">
            {list.map((w) => (
              <motion.li key={w.id} variants={listItem}>
                <WalkerRow w={w} price={price} active={w.id === activeId} onClick={() => open(w.id)} />
              </motion.li>
            ))}
          </motion.ul>
        )}

        {list.length > 0 && (
          <p className="num px-5 pt-3 text-center text-[12px] font-semibold text-text-2">
            Base fee ₹{price} for {duration} min. GST and any surcharge are shown before you pay.
          </p>
        )}
      </main>

      <AppTabBar active="discover" />
    </div>
  )
}
