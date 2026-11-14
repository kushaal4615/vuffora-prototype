import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Camera, Check, ChevronLeft, LifeBuoy, MapPin, Minus, Plus, ShieldCheck, Upload } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Certified, StatusPill, type StatusKind } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Input, Toggle } from '../../components/Form'
import { MapCanvas } from '../../components/Map'
import { WALKER_ACCOUNT, WALKER_ME } from '../../data/cast'
import { DEMO_KYC } from '../../data/demoFill'
import { face } from '../../data/media'
import { SERVICE_LOCALITIES } from '../../data/walkerData'
import { useNav } from '../../lib/navigation'
import { useSession, walkerDocState } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { Dock, MobileScreen, SAFE_TOP, safeTop } from '../mobileShell'

/* Partner onboarding and KYC. A royal-blue header carries a four-step
   stepper that can be tapped in any order; every step arrives filled in.
   Step 3 draws the service radius on the map, step 4 shows the four
   documents as drawn thumbnails. The Police Verification status is not
   Arjun's to set: it follows the admin's decision in the KYC queue. */

const STEPS = ['Personal details', 'Experience', 'Service radius', 'Documents'] as const
const BREEDS = ['Large breeds', 'Aggressive / reactive', 'Puppies', 'Small breeds', 'Senior dogs', 'Guard breeds']
const CENTRE = { x: 54, y: 50 }

type DocId = 'aadhaar' | 'pan' | 'police' | 'payout'
type DocMeta = { id: DocId; name: string; number: string; file: string; note: string }
const DOCS: DocMeta[] = [
  { id: 'aadhaar', name: 'Aadhaar Card', number: DEMO_KYC.aadhaar, file: 'aadhaar-xxxx-4471.pdf', note: 'Front and back, all four corners visible' },
  { id: 'pan', name: 'PAN Card', number: DEMO_KYC.pan, file: 'pan-ABCPM####K.pdf', note: 'Name must match your Aadhaar' },
  { id: 'police', name: 'Police Verification Certificate', number: 'PVC/SAS/2026/···· 318', file: 'pvc-renewal-2026.pdf', note: 'Annual renewal, SSP Office, SAS Nagar' },
  { id: 'payout', name: 'Cancelled cheque / UPI ID', number: DEMO_KYC.upi, file: `${DEMO_KYC.account} · ${DEMO_KYC.ifsc}`, note: 'Where your payouts are sent' },
]

function DocThumb({ id }: { id: DocId }) {
  const line = 'block h-[5px] rounded-full bg-[rgb(14_27_87/0.16)]'
  return (
    <span aria-hidden className="relative block h-[76px] w-[112px] shrink-0 overflow-hidden rounded-[12px] bg-white shadow-[var(--shadow-raised)]" style={{ transform: id === 'pan' || id === 'payout' ? 'rotate(1.5deg)' : 'rotate(-1.5deg)' }}>
      {id === 'aadhaar' && (
        <>
          <span className="absolute inset-x-0 top-0 h-[9px]" style={{ background: 'linear-gradient(90deg,#f59e0b 0 33%,#ffffff 33% 66%,#1f9d61 66%)' }} />
          <img src={face('arjun', 80)} alt="" className="absolute left-2 top-4 h-9 w-8 rounded-[5px] object-cover" />
          <span className="absolute left-[48px] right-2 top-[18px] flex flex-col gap-[5px]">
            <span className={`${line} w-full`} />
            <span className={`${line} w-3/4`} />
            <span className={`${line} w-1/2`} />
          </span>
          <span className="meta absolute inset-x-2 bottom-1.5 text-[10px] font-semibold text-text">{DEMO_KYC.aadhaar}</span>
        </>
      )}
      {id === 'pan' && (
        <>
          <span className="absolute inset-0 bg-[#e3ecff]" />
          <span className="absolute inset-x-0 top-0 h-[14px] bg-accent" />
          <span className="absolute left-2 right-[44px] top-[22px] flex flex-col gap-[5px]">
            <span className={`${line} w-full`} />
            <span className={`${line} w-2/3`} />
          </span>
          <img src={face('arjun', 80)} alt="" className="absolute right-2 top-[20px] h-8 w-7 rounded-[4px] object-cover" />
          <span className="meta absolute inset-x-2 bottom-1.5 text-[10px] font-semibold text-text">{DEMO_KYC.pan}</span>
        </>
      )}
      {id === 'police' && (
        <>
          <span className="absolute inset-0 bg-[#fffaf0]" />
          <span className="absolute left-1/2 top-2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full bg-ink text-sun-light">
            <ShieldCheck size={15} strokeWidth={2.4} />
          </span>
          <span className="absolute inset-x-3 top-[42px] flex flex-col items-center gap-[5px]">
            <span className={`${line} w-full`} />
            <span className={`${line} w-4/5`} />
            <span className={`${line} w-3/5`} />
          </span>
          <span className="absolute bottom-1.5 right-2 h-4 w-4 rounded-full ring-2 ring-[var(--reactive)]" />
        </>
      )}
      {id === 'payout' && (
        <>
          <span className="absolute inset-0 bg-[#f1f7f3]" />
          <span className="absolute left-2 right-2 top-3 flex flex-col gap-[6px]">
            <span className={`${line} w-2/5`} />
            <span className={`${line} w-full`} />
            <span className={`${line} w-4/5`} />
          </span>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] whitespace-nowrap rounded-[4px] px-1.5 text-[10px] font-extrabold tracking-[0.12em] text-danger-text ring-[1.5px] ring-[var(--reactive)]">CANCELLED</span>
          <span className="meta absolute inset-x-2 bottom-1.5 truncate text-[10px] font-semibold text-text">{DEMO_KYC.account}</span>
        </>
      )}
    </span>
  )
}

export default function WalkerKyc() {
  const { navigate, reset, back, canGoBack, toast } = useNav()
  const police = useSession(walkerDocState)
  const [step, setStep] = useState(0)

  /* step 1 */
  const [name, setName] = useState(DEMO_KYC.fullName)
  const [dob, setDob] = useState(DEMO_KYC.dob)
  const [address, setAddress] = useState(DEMO_KYC.address)
  const [nameError, setNameError] = useState('')
  /* step 2 */
  const [years, setYears] = useState(Number(DEMO_KYC.experienceYears))
  const [breeds, setBreeds] = useState<string[]>(DEMO_KYC.breeds)
  const [certified, setCertified] = useState(DEMO_KYC.certified)
  /* step 3 */
  const [radius, setRadius] = useState(DEMO_KYC.radiusKm)
  /* step 4: documents Arjun re-captured this session */
  const [redone, setRedone] = useState<Partial<Record<DocId, string>>>({})
  const [upi, setUpi] = useState(DEMO_KYC.upi)

  const go = (to: number) => {
    if (step === 0 && to > 0 && !name.trim()) return setNameError('Enter your full name as it appears on your Aadhaar card')
    setStep(Math.max(0, Math.min(STEPS.length - 1, to)))
  }
  const capture = (d: DocMeta, how: 'photo' | 'upload') => {
    const file = how === 'photo' ? `${d.id}-camera-14nov.jpg` : `${d.id}-upload-14nov.pdf`
    setRedone((r) => ({ ...r, [d.id]: file }))
    toast(`${d.name} ${how === 'photo' ? 'photo captured' : 'uploaded'}. Sent to the admin for review`, 'accent')
  }
  const docStatus = (id: DocId): { kind: StatusKind; label?: string } => {
    if (id === 'police') return police === 'approved' ? { kind: 'approved' } : police === 'rejected' ? { kind: 'rejected' } : { kind: 'review' }
    return redone[id] ? { kind: 'review' } : { kind: 'verified' }
  }
  const verifiedCount = DOCS.filter((d) => ['verified', 'approved'].includes(docStatus(d.id).kind)).length
  const requests = Math.round(radius * 7.6)

  const header = (
    <header className="relative z-20 shrink-0 overflow-hidden bg-accent text-on-accent" style={{ paddingTop: SAFE_TOP }}>
      <span aria-hidden className="sun -right-[6%] w-[22%]" style={{ top: safeTop(-4) }} />
      <div className="relative flex h-[52px] items-center gap-1 px-2">
        {canGoBack ? (
          <motion.button type="button" whileTap={tap} transition={spring.ui} onClick={back} aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full">
            <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
          </motion.button>
        ) : (
          <span className="w-3" />
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="grot truncate text-[20px]">Partner onboarding</p>
          <p className="text-[12px] font-semibold text-[var(--on-accent-2)]">Step {step + 1} of 4 · about 4 minutes in all</p>
        </div>
      </div>
      <div role="tablist" aria-label="Onboarding steps" className="relative grid grid-cols-4 gap-1.5 px-3 pb-3 pt-1">
        {STEPS.map((label, i) => {
          const on = i === step
          const done = i < step
          return (
            <motion.button key={label} role="tab" aria-selected={on} type="button" whileTap={tap} transition={spring.ui} onClick={() => go(i)} className={`flex min-h-[56px] flex-col items-start justify-between gap-1 rounded-[var(--r-control)] px-2 py-1.5 text-left ${on ? 'bg-white text-text' : 'bg-[rgb(255_255_255/0.14)] text-white'}`}>
              <span className={`num grid h-5 w-5 place-items-center rounded-full text-[11px] font-extrabold ${on ? 'bg-accent text-on-accent' : done ? 'bg-sun text-on-sun' : 'bg-[rgb(255_255_255/0.22)] text-white'}`}>{done ? <Check size={12} strokeWidth={3.2} aria-hidden /> : i + 1}</span>
              <span className="text-[11px] font-extrabold leading-[1.15]">{label}</span>
            </motion.button>
          )
        })}
      </div>
    </header>
  )

  return (
    <MobileScreen
      header={header}
      dockHeight={84}
      dock={
        <Dock>
          {step > 0 && (
            <Button variant="outline" size="lg" icon={ArrowLeft} aria-label="Previous step" className="!px-4" onClick={() => go(step - 1)} />
          )}
          {step < 3 ? (
            <Button size="lg" block trailing={ArrowRight} onClick={() => go(step + 1)}>
              Continue to {STEPS[step + 1].toLowerCase()}
            </Button>
          ) : (
            <Button size="lg" block trailing={ArrowRight} onClick={() => { toast('Submitted. The admin reviews new documents within 24 hours', 'accent'); reset('walker.home') }}>
              Submit for verification
            </Button>
          )}
        </Dock>
      }
    >
      <motion.div key={step} variants={listParent} initial="hidden" animate="show">
        {step === 0 && (
          <>
            <motion.div variants={listItem} className="flex items-center gap-4 px-5 pt-5">
              <Avatar who={WALKER_ME.photo} size={76} ring verified />
              <div className="min-w-0 leading-tight">
                <p className="label text-accent-ink">Profile photo matched to Aadhaar</p>
                <p className="grot mt-1 text-[26px]"><span className="swoosh">{name.split(' ')[0] || 'Partner'}</span>, tell us who you are</p>
              </div>
            </motion.div>
            <motion.div variants={listItem} className="mt-5 flex flex-col gap-4 px-5">
              <Input label="Full name (as on Aadhaar)" value={name} onChange={(e) => { setName(e.target.value); setNameError('') }} error={nameError || undefined} autoComplete="name" />
              <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-3">
                <Input label="Date of birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                <Input label="Mobile" value={WALKER_ACCOUNT.phone} readOnly trailing={<Check size={16} strokeWidth={3} className="text-calm-ink" aria-label="Verified by SMS" />} className="num" />
              </div>
              <Input label="Home address" value={address} onChange={(e) => setAddress(e.target.value)} leading={<MapPin size={17} aria-hidden />} hint="Your radius is measured from here. Owners never see this address." />
            </motion.div>
            <motion.div variants={listItem} className="relative mt-6 overflow-hidden bg-ink px-5 py-5 text-on-ink">
              <span aria-hidden className="sun -bottom-[62%] -right-[8%] w-[30%]" />
              <p className="label relative text-sun-light">Why we ask</p>
              <p className="relative mt-1.5 max-w-[27ch] text-[15px] font-semibold leading-snug">Every Vuffora walker is identity-checked and police-verified before the first job. It is why owners hand you the leash.</p>
            </motion.div>
          </>
        )}

        {step === 1 && (
          <>
            <motion.div variants={listItem} className="flex items-end justify-between gap-4 px-5 pt-6">
              <div className="min-w-0">
                <p className="label text-accent-ink">Dog handling experience</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="figure num text-[72px]">{years}</span>
                  <span className="text-[17px] font-extrabold">{years === 1 ? 'year' : 'years'}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 pb-2">
                <motion.button type="button" whileTap={tap} transition={spring.ui} aria-label="One year less" onClick={() => setYears((y) => Math.max(0, y - 1))} className="grid h-12 w-12 place-items-center rounded-full bg-[var(--surface-high)]">
                  <Minus size={20} strokeWidth={2.6} aria-hidden />
                </motion.button>
                <motion.button type="button" whileTap={tap} transition={spring.ui} aria-label="One year more" onClick={() => setYears((y) => Math.min(30, y + 1))} className="grid h-12 w-12 place-items-center rounded-full bg-accent text-on-accent shadow-[var(--glow-accent)]">
                  <Plus size={20} strokeWidth={2.6} aria-hidden />
                </motion.button>
              </div>
            </motion.div>

            <motion.div variants={listItem} className="mt-5 px-5">
              <p className="text-[13px] font-bold">Breeds you are comfortable with</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {BREEDS.map((b) => {
                  const on = breeds.includes(b)
                  const hot = b === 'Aggressive / reactive'
                  return (
                    <motion.button key={b} type="button" aria-pressed={on} whileTap={tap} transition={spring.ui} onClick={() => setBreeds((list) => (on ? list.filter((x) => x !== b) : [...list, b]))} className={`flex h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold ${on ? (hot ? 'bg-reactive text-white' : 'bg-accent text-on-accent') : 'text-text'}`} style={on ? undefined : { boxShadow: 'inset 0 0 0 1.5px var(--rule-strong)' }}>
                      {on && <Check size={14} strokeWidth={3} aria-hidden />}
                      {b}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            <motion.div variants={listItem} className="mt-6 flex items-center gap-3 px-5">
              <div className="min-w-0 flex-1 leading-snug">
                <p className="text-[15px] font-extrabold">Certified for large and aggressive breeds</p>
                <p className="text-[13px] text-text-2">Unlocks the higher-paying surcharge jobs.</p>
              </div>
              <Toggle on={certified} onChange={setCertified} label="Certified for large and aggressive breeds" />
            </motion.div>

            {/* the badge, as granted by the admin */}
            <motion.div variants={listItem} className="relative mt-6 overflow-hidden bg-ink px-5 py-6 text-on-ink">
              <div className="relative flex items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-sun text-on-sun shadow-[var(--glow-sun)]">
                  <ShieldCheck size={32} strokeWidth={2.2} aria-hidden />
                </span>
                <div className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <Certified tone="ink" />
                    <span className="flex h-6 items-center gap-1 rounded-full bg-calm px-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-white">
                      <Check size={12} strokeWidth={3} aria-hidden /> Granted
                    </span>
                  </span>
                  <p className="mt-2 text-[13px] font-semibold leading-snug text-on-ink-2">Handling assessment passed at the Mohali centre, 12 Mar 2024. {certified ? 'Aggressive / reactive dogs are routed to you.' : 'Switched off: you will not receive reactive-dog jobs.'}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {step === 2 && (
          <>
            {/* the canvas is kept square so the radius ring is a true circle; the window crops it */}
            <motion.div variants={listItem} className="relative h-[290px] overflow-hidden">
              <div className="-mt-[14%]">
                <MapCanvas className="aspect-square w-full" radius={{ x: CENTRE.x, y: CENTRE.y, r: 4 + radius * 3.8 }} pins={[{ id: 'me', x: CENTRE.x, y: CENTRE.y, photo: WALKER_ME.photo, active: true, label: 'You', tone: 'ink' }, { id: 'a', x: 26, y: 70, label: 'Sector 70', tone: 'sun' }, { id: 'b', x: 82, y: 30, label: 'Phase 7', tone: 'sun' }]} />
              </div>
              <span className="glass absolute left-4 top-4 flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-extrabold text-text">
                <MapPin size={14} strokeWidth={2.6} aria-hidden /> {DEMO_KYC.address}
              </span>
            </motion.div>
            <motion.div variants={listItem} className="relative z-10 -mt-7 rounded-t-[var(--r-container)] bg-[var(--bg)] px-5 pt-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="label text-accent-ink">Service radius</p>
                  <p className="mt-1 flex items-baseline gap-1.5">
                    <span className="figure num text-[64px]">{radius}</span>
                    <span className="text-[17px] font-extrabold">km</span>
                  </p>
                </div>
                <p className="pb-2 text-right text-[13px] font-semibold leading-snug text-text-2">
                  about <span className="num font-extrabold text-text">{requests}</span> requests a day
                  <br />
                  up to <span className="num font-extrabold text-text">{Math.round(radius * 2.4 + 2)} min</span> to pickup
                </p>
              </div>
              <input type="range" min={1} max={10} step={1} value={radius} onChange={(e) => setRadius(Number(e.target.value))} aria-label="Service radius in kilometres" className="mt-1 h-11 w-full accent-[var(--accent)]" />
              <div className="meta flex justify-between text-text-2">
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
              </div>
              <p className="mt-5 text-[13px] font-bold">Localities inside your ring</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SERVICE_LOCALITIES.slice(0, Math.max(2, Math.min(SERVICE_LOCALITIES.length, radius + 2))).map((l) => (
                  <span key={l} className="flex h-8 items-center rounded-full bg-accent-soft px-3 text-[13px] font-bold text-[var(--on-accent-soft)]">{l}</span>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {step === 3 && (
          <>
            <motion.div variants={listItem} className="flex items-end justify-between gap-3 px-5 pt-5">
              <div>
                <p className="label text-accent-ink">Documents</p>
                <p className="grot mt-1 text-[26px]"><span className="num">{verifiedCount}</span> of 4 verified</p>
              </div>
              <Certified short />
            </motion.div>
            <ul className="mt-2">
              {DOCS.map((d) => {
                const st = docStatus(d.id)
                const isPolice = d.id === 'police'
                return (
                  <motion.li key={d.id} variants={listItem} className={`px-5 py-4 ${isPolice ? (police === 'approved' ? 'bg-success-soft' : police === 'rejected' ? 'bg-danger-soft' : 'bg-warn-soft') : ''}`}>
                    <div className="flex items-start gap-4">
                      <DocThumb id={d.id} />
                      <div className="min-w-0 flex-1">
                        <StatusPill kind={st.kind} />
                        <p className="mt-1.5 text-[15px] font-extrabold leading-tight">{d.name}</p>
                        <p className="meta mt-1 truncate text-[12px] text-text">{d.id === 'payout' ? upi : d.number}</p>
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-text-2">{redone[d.id] ?? d.file}</p>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[13px] font-semibold leading-snug text-text-2">
                      {isPolice ? (police === 'approved' ? 'Renewal approved by the admin. Valid until Nov 2027.' : police === 'rejected' ? 'The admin could not read this copy. Take a new photo of the full page with the seal.' : 'Renewal with compliance. Your current certificate stays valid meanwhile.') : redone[d.id] ? 'New copy received. The admin will check it within 24 hours.' : d.note}
                    </p>
                    {d.id === 'payout' && (
                      <div className="mt-3">
                        <Input label="UPI ID for payouts" dense value={upi} onChange={(e) => setUpi(e.target.value)} className="num" />
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button variant={isPolice && police !== 'approved' ? 'accent' : 'paper'} size="md" icon={Camera} block onClick={() => capture(d, 'photo')}>
                        Take photo
                      </Button>
                      <Button variant="outline" size="md" icon={Upload} block onClick={() => capture(d, 'upload')}>
                        Upload
                      </Button>
                    </div>
                  </motion.li>
                )
              })}
            </ul>
          </>
        )}

        <motion.div variants={listItem} className="px-5 pb-2 pt-3">
          <button type="button" onClick={() => navigate('walker.support')} className="flex h-11 items-center gap-2 text-[13px] font-extrabold text-accent-ink">
            <LifeBuoy size={16} strokeWidth={2.4} aria-hidden /> Question about KYC? Ask support
          </button>
        </motion.div>
      </motion.div>
    </MobileScreen>
  )
}
