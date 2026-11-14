import { motion } from 'framer-motion'
import { ArrowRight, Camera, Check, IndianRupee, Leaf, Lock, Plus, ShieldAlert, Syringe, Users } from 'lucide-react'
import { useState } from 'react'
import { TEMPER_TONE, TemperBadge } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Input, TextArea } from '../../components/Form'
import { Segmented } from '../../components/Tabs'
import { DOGS, TEMPERAMENT, type Temperament } from '../../data/cast'
import { daysUntil, fmtShort, inr } from '../../data/clock'
import { DEMO_DOG_FORMS } from '../../data/demoFill'
import { img, type MediaKey } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { Dock, MobileScreen, StepBar } from '../mobileShell'

/* Pet profile, step 1 of 2. A full-bleed photo header for the dog in
   view, a switcher for the owner's dogs, the profile fields, and the
   mandatory temperament classification as two large panels with what
   each one means for matching and price. */

const NEW_ID = 'coco'
const PHOTO: Record<string, MediaKey> = { bruno: 'bruno', sheru: 'sheru', [NEW_ID]: 'beagle' }
const POSITION: Record<string, string> = { bruno: '50% 46%', sheru: '50% 30%', [NEW_ID]: '50% 36%' }

type Form = (typeof DEMO_DOG_FORMS)[string]

const PANELS: { id: Temperament; icon: typeof Leaf; points: string[] }[] = [
  { id: 'calm', icon: Leaf, points: ['Standard handling', 'Any verified walker'] },
  { id: 'reactive', icon: ShieldAlert, points: ['Experienced handlers', 'Muzzle and leash protocol'] },
]

function DogScreen({ dogId }: { dogId: string }) {
  const { navigate, toast } = useNav()
  const seed = DEMO_DOG_FORMS[dogId] ?? DEMO_DOG_FORMS.bruno
  const cast = DOGS.find((d) => d.id === dogId)
  const surcharge = useSession((s) => s.pricing.reactiveSurcharge)
  const adminLock = useSession((s) => s.temperamentLocks[seed.name])
  const [f, setF] = useState<Form>(seed)
  const [tried, setTried] = useState(false)
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }))

  const locked = Boolean(adminLock) || Boolean(cast?.locked)
  const temper: Temperament = adminLock ?? f.temperament
  const tone = TEMPER_TONE[temper]

  const pick = (t: Temperament) => {
    if (t === temper) return
    if (locked) {
      toast(`${f.name || 'This dog'}’s tag is locked by Vuffora after a safety audit. Chat with Support to request a change.`, 'warn')
      return
    }
    set('temperament', t)
  }

  const save = () => {
    setTried(true)
    if (!f.name.trim() || !f.breed.trim()) {
      toast('Add a name and breed to continue', 'warn')
      return
    }
    session.viewDog(dogId)
    toast(`${f.name}’s profile saved`, 'accent')
    navigate('owner.vault')
  }

  const vaccines: { key: 'rabiesExpiry' | 'dhppExpiry' | 'bordetellaExpiry'; name: string }[] = [
    { key: 'rabiesExpiry', name: 'Rabies' },
    { key: 'dhppExpiry', name: 'DHPP' },
    { key: 'bordetellaExpiry', name: 'Bordetella' },
  ]

  return (
    <MobileScreen
      header={<StepBar step={1} total={2} label="Pet profile" />}
      dock={
        <Dock>
          <Button size="lg" block trailing={ArrowRight} onClick={save}>
            Save and add documents
          </Button>
        </Dock>
      }
    >
      {/* photo header */}
      <section className="relative h-[212px] overflow-hidden bg-ink">
        <img src={img(PHOTO[dogId] ?? 'bruno', 900)} alt={`${f.name}, ${f.breed}`} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: POSITION[dogId] ?? 'center' }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to top, rgb(10 18 56 / 0.9) 0%, rgb(10 18 56 / 0.55) 34%, rgb(10 18 56 / 0) 64%)' }} />
        <motion.button type="button" whileTap={{ scale: 0.94 }} transition={spring.ui} onClick={() => toast(`Camera opened. New photo of ${f.name || 'your dog'} saved.`, 'accent')} className="glass absolute right-4 top-4 flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-extrabold text-text">
          <Camera size={16} strokeWidth={2.4} aria-hidden /> Change photo
        </motion.button>
        <div className="absolute inset-x-5 bottom-9 flex items-end justify-between gap-3 text-white">
          <div className="min-w-0">
            <h1 className="grot truncate text-[38px] leading-none">
              <span className="swoosh">{f.name || 'Your dog'}</span>
            </h1>
            <p className="mt-2 truncate text-[13px] font-semibold">
              {f.breed} · {f.age || '0'} {f.age === '1' ? 'yr' : 'yrs'} · {f.weight || '0'} kg · {f.gender}
            </p>
          </div>
          <TemperBadge t={temper} solid size="md" />
        </div>
      </section>

      {/* dog switcher lapping the photo */}
      <div className="scroll-x relative z-10 -mt-6 flex gap-2 px-5 pb-1" style={{ scrollPaddingLeft: 20 }}>
        {DOGS.map((d) => {
          const on = d.id === dogId
          return (
            <motion.button key={d.id} type="button" whileTap={{ scale: 0.96 }} transition={spring.ui} onClick={() => session.viewDog(d.id)} aria-pressed={on} className={`flex h-12 shrink-0 snap-start items-center gap-2 rounded-full py-1 pl-1 pr-4 text-[14px] font-extrabold shadow-[var(--shadow-raised)] ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface)] text-text'}`}>
              <img src={img(d.photo, 120)} alt="" className="h-10 w-10 rounded-full object-cover" style={{ objectPosition: '50% 20%' }} />
              {d.name}
            </motion.button>
          )
        })}
        <motion.button type="button" whileTap={{ scale: 0.96 }} transition={spring.ui} onClick={() => session.viewDog(NEW_ID)} aria-pressed={dogId === NEW_ID} className={`flex h-12 shrink-0 snap-start items-center gap-2 rounded-full py-1 pl-1 pr-4 text-[14px] font-extrabold shadow-[var(--shadow-raised)] ${dogId === NEW_ID ? 'bg-accent text-on-accent' : 'bg-sun text-on-sun'}`}>
          <span className={`grid h-10 w-10 place-items-center rounded-full ${dogId === NEW_ID ? 'bg-[rgb(255_255_255/0.2)]' : 'bg-[rgb(255_255_255/0.55)]'}`}>
            <Plus size={20} strokeWidth={2.6} aria-hidden />
          </span>
          {dogId === NEW_ID ? 'Coco, new' : 'Add another'}
        </motion.button>
      </div>

      {/* basics */}
      <section className="mt-5 flex flex-col gap-3.5 px-5">
        <Input label="Name" value={f.name} onChange={(e) => set('name', e.target.value)} error={tried && !f.name.trim() ? 'What do we call your dog?' : undefined} autoComplete="off" />
        <Input label="Breed" value={f.breed} onChange={(e) => set('breed', e.target.value)} error={tried && !f.breed.trim() ? 'Add the breed, or Indie.' : undefined} autoComplete="off" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Age" inputMode="numeric" value={f.age} onChange={(e) => set('age', e.target.value)} className="num font-bold" trailing={<span className="text-[13px] font-bold">yrs</span>} />
          <Input label="Weight" inputMode="decimal" value={f.weight} onChange={(e) => set('weight', e.target.value)} className="num font-bold" trailing={<span className="text-[13px] font-bold">kg</span>} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-bold">Gender</span>
          <Segmented<'Male' | 'Female'> tone="ink" value={f.gender} onChange={(g) => set('gender', g)} items={[{ id: 'Male', label: 'Male' }, { id: 'Female', label: 'Female' }]} />
        </div>
      </section>

      {/* temperament classification: the centrepiece */}
      <section className="relative mt-6 overflow-hidden bg-sun-soft px-5 pb-6 pt-5">
        <span aria-hidden className="sun -right-[18%] -top-[26%] w-[52%]" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label text-[var(--on-sun-soft)]">Mandatory · safety</p>
            <h2 className="grot mt-1 text-[24px]">How is {f.name || 'your dog'} with strangers?</h2>
          </div>
          {locked && (
            <span className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-on-ink">
              <Lock size={12} strokeWidth={2.6} aria-hidden /> Locked by Vuffora
            </span>
          )}
        </div>

        <div role="radiogroup" aria-label="Temperament classification" className="relative mt-4 grid grid-cols-2 gap-2.5">
          {PANELS.map((p) => {
            const on = temper === p.id
            const t = TEMPER_TONE[p.id]
            return (
              <motion.button key={p.id} type="button" role="radio" aria-checked={on} whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => pick(p.id)} className="relative flex min-h-[188px] flex-col rounded-[var(--r-container)] p-3.5 text-left" style={{ background: on ? t.soft : 'var(--surface)', color: on ? t.onSoft : 'var(--text)', boxShadow: on ? `inset 0 0 0 2.5px ${t.fill}, var(--shadow-raised)` : 'var(--shadow-raised)' }}>
                <span className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full text-white" style={{ background: t.fill }}>
                    <p.icon size={22} strokeWidth={2.4} aria-hidden />
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full" style={on ? { background: t.fill, color: '#fff' } : { boxShadow: 'inset 0 0 0 2px var(--rule-strong)' }}>
                    {on && <Check size={16} strokeWidth={3.2} aria-hidden />}
                  </span>
                </span>
                <span className="grot mt-3 block text-[19px] leading-[1.05]">{TEMPERAMENT[p.id].label}</span>
                <span className="mt-2 flex flex-col gap-1">
                  {p.points.map((pt) => (
                    <span key={pt} className="text-[12px] font-semibold leading-snug" style={{ color: on ? t.onSoft : 'var(--text-2)' }}>
                      {pt}
                    </span>
                  ))}
                </span>
                <span className="num mt-auto pt-2.5 text-[13px] font-extrabold" style={{ color: on ? t.onSoft : 'var(--text)' }}>
                  {p.id === 'calm' ? 'No surcharge' : `+ ${inr(surcharge)} per walk`}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* what the choice means */}
        <motion.div key={temper} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="relative mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--r-card)] bg-[var(--rule)]">
          <div className="bg-[var(--surface)] p-3.5">
            <p className="label flex items-center gap-1.5 text-text-2">
              <Users size={13} strokeWidth={2.6} aria-hidden /> Matching
            </p>
            <p className="mt-1.5 text-[13px] font-bold leading-snug">{temper === 'calm' ? 'Shown to every KYC verified walker within your radius.' : 'Only Aggressive Breed Certified walkers see and accept the job.'}</p>
          </div>
          <div className="bg-[var(--surface)] p-3.5">
            <p className="label flex items-center gap-1.5 text-text-2">
              <IndianRupee size={13} strokeWidth={2.6} aria-hidden /> Price
            </p>
            <p className="figure num mt-1.5 text-[26px]" style={{ color: tone.text }}>
              {temper === 'calm' ? '₹0' : `+${inr(surcharge)}`}
            </p>
            <p className="mt-1 text-[12px] font-semibold leading-snug text-text-2">{temper === 'calm' ? 'Base walk fee only.' : 'Handling surcharge on every walk.'}</p>
          </div>
        </motion.div>
        <p className="relative mt-3 flex items-start gap-2 text-[12px] font-semibold leading-snug text-[var(--on-sun-soft)]">
          <Lock size={14} strokeWidth={2.5} className="mt-px shrink-0" aria-hidden />
          {locked ? `Vuffora reviewed ${f.name || 'this dog'} and locked the tag as ${TEMPERAMENT[temper].label}. Walkers always see it on the job card.` : 'Vuffora can review and lock this tag after owner disclosures or walker feedback.'}
        </p>
      </section>

      {/* notes */}
      <section className="mt-5 flex flex-col gap-3.5 px-5">
        <TextArea label="Dietary notes" rows={2} value={f.diet} onChange={(e) => set('diet', e.target.value)} />
        <TextArea label="Medical notes" rows={2} value={f.medical} onChange={(e) => set('medical', e.target.value)} hint="Shared with the walker on the job card only." />
      </section>

      {/* vaccination expiry dates: a spine with three dates */}
      <section className="mt-6 px-5">
        <div className="flex items-end justify-between gap-3">
          <h2 className="grot text-[22px]">Vaccination expiry</h2>
          <span className="flex items-center gap-1 text-[12px] font-bold text-text-2">
            <Syringe size={14} strokeWidth={2.4} aria-hidden /> 3 required
          </span>
        </div>
        <motion.ol variants={listParent} initial="hidden" animate="show" className="relative mt-3">
          <span aria-hidden className="absolute bottom-6 left-[9px] top-6 w-[2px] rounded-full bg-[var(--paper-300)]" />
          {vaccines.map((v) => {
            const iso = f[v.key]
            const left = iso ? daysUntil(iso) : 0
            const soon = left <= 30
            return (
              <motion.li key={v.key} variants={listItem} className="relative flex items-center gap-3 py-2 pl-8">
                <span aria-hidden className={`absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full ring-4 ring-[var(--bg)] ${soon ? 'bg-warn' : 'bg-calm'}`} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[15px] font-extrabold">{v.name}</span>
                  <span className={`num mt-0.5 block text-[12px] font-bold ${soon ? 'text-[var(--on-warn-soft)]' : 'text-text-2'}`}>{iso ? `${fmtShort(iso)} ${iso.slice(0, 4)} · ${left < 0 ? 'expired' : `${left} days left`}` : 'Pick a date'}</span>
                </span>
                <input type="date" aria-label={`${v.name} expiry date`} value={iso} onChange={(e) => set(v.key, e.target.value)} className="num well h-11 w-[142px] shrink-0 rounded-[var(--r-control)] px-2.5 text-[13px] font-bold outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </motion.li>
            )
          })}
        </motion.ol>
        <p className="mt-2 text-[12px] font-semibold text-text-2">We remind you 30 days before a certificate runs out. Certificates are uploaded in the next step.</p>
      </section>

    </MobileScreen>
  )
}

export default function OwnerDog() {
  const viewing = useSession((s) => s.viewingDog)
  const dogId = DEMO_DOG_FORMS[viewing] ? viewing : 'bruno'
  return <DogScreen key={dogId} dogId={dogId} />
}
