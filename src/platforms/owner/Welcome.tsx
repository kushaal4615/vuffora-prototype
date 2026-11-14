import { motion } from 'framer-motion'
import { ArrowRight, KeyRound, MapPinned, ShieldCheck } from 'lucide-react'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { Mark, Stars } from '../../components/Brand'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { spring } from '../../motion/springs'
import { fadeUp, listItem, listParent } from '../../motion/transitions'
import { safeBottom, safeTop } from '../mobileShell'

/* Entry screen of the Dog Owner App. Full-bleed brand yellow, the dog
   photo cut as a circle that bleeds off the right edge (the "sun" device),
   two live chips floating over it, and a white sheet lapping the photo. */

const PROMISES = [
  { icon: ShieldCheck, title: 'Verified walkers', body: 'KYC and police verification on every walker' },
  { icon: KeyRound, title: 'OTP handover', body: 'A code at pickup, another at drop-off' },
  { icon: MapPinned, title: 'Live GPS', body: 'Watch the route, breaks and photos' },
]

export default function OwnerWelcome() {
  const { navigate } = useNav()
  return (
    <div data-screen-root className="relative flex h-full flex-col overflow-hidden bg-sun text-on-sun">
      {/* the sun: a pale disc behind the photo, bleeding off the top-left */}
      <span aria-hidden className="pointer-events-none absolute -left-[38%] -top-[14%] aspect-square w-[92%] rounded-full bg-[rgb(255_255_255/0.28)]" />

      <header className="relative z-10 flex items-center justify-between px-5" style={{ paddingTop: safeTop(14) }}>
        <span className="flex items-center gap-2">
          <Mark size={44} />
          <span className="display text-[26px] text-text">Vuffora</span>
        </span>
        <span className="rounded-full bg-[rgb(255_255_255/0.6)] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-text">Mohali · Chandigarh · NCR</span>
      </header>

      {/* photo circle bleeding off the right edge */}
      <div className="relative min-h-0 flex-1">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.page} className="absolute -right-[17%] top-[4%] aspect-square w-[98%] overflow-hidden rounded-full bg-white shadow-[var(--shadow-floating)] ring-[10px] ring-white">
          <img src={img('goldenRose', 900)} alt="A golden retriever holding a rose in its mouth" className="h-full w-full object-cover" style={{ objectPosition: '50% 30%' }} />
        </motion.div>

        {/* live chip: a walk in progress */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.25 }} className="glass absolute left-4 top-[9%] z-10 flex items-center gap-2.5 rounded-[20px] py-2 pl-2 pr-3.5">
          <Avatar who="arjun" size={38} ring />
          <span className="leading-tight">
            <span className="block text-[13px] font-extrabold text-text">Arjun is walking Bruno</span>
            <span className="num block text-[11px] font-semibold text-text-2">1.4 km · 22 min · 3 updates</span>
          </span>
        </motion.div>

        {/* OTP chip */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }} className="absolute bottom-[26%] left-5 z-10 rounded-[20px] bg-accent px-3.5 py-2.5 text-on-accent shadow-[var(--glow-accent)]">
          <span className="label block text-[10px] text-[var(--on-accent-2)]">Check-In OTP</span>
          <span className="figure num block text-[26px] tracking-[0.14em]">4826</span>
        </motion.div>
      </div>

      {/* white sheet lapping the photo */}
      <section className="relative z-10 -mt-[22%] rounded-t-[36px] bg-[var(--surface)] px-5 pt-6 text-text shadow-[0_-18px_44px_-18px_rgb(14_27_87/0.28)]" style={{ paddingBottom: `calc(${safeBottom(10)} + var(--chrome-space, 0px))` }}>
        <div className="flex items-center gap-2">
          <Stars rating={4.9} size={13} />
          <span className="text-[13px] font-semibold text-text-2">from 3,180 walks this month</span>
        </div>
        <h1 className="grot mt-2 text-[clamp(32px,9.6vw,40px)] leading-[0.98]">
          Intelligent care. <span className="swoosh">Happier paws.</span>
        </h1>
        <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-4 flex flex-col gap-2.5">
          {PROMISES.map((p) => (
            <motion.li key={p.title} variants={listItem} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sun text-on-sun">
                <p.icon size={19} strokeWidth={2.3} aria-hidden />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[15px] font-extrabold">{p.title}</span>
                <span className="block truncate text-[13px] text-text-2">{p.body}</span>
              </span>
            </motion.li>
          ))}
        </motion.ul>
        <Button size="lg" block trailing={ArrowRight} className="mt-5" onClick={() => navigate('owner.signin')}>
          Get started
        </Button>
        <p className="mt-3 text-center text-[13px] font-semibold text-text-2">
          Already with us?{' '}
          <button type="button" onClick={() => navigate('owner.signin')} className="inline-flex h-11 items-center font-extrabold text-accent-ink">
            Sign in
          </button>
        </p>
      </section>
    </div>
  )
}
