import { motion } from 'framer-motion'
import { Camera, Check, FileUp, Headset, PawPrint, ShieldCheck, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { Bar, StatusPill } from '../../components/Brand'
import { Button } from '../../components/Button'
import { ProgressRing } from '../../components/Charts'
import { DOGS, dogById, type VaccineKey } from '../../data/cast'
import { daysUntil } from '../../data/clock'
import { img, type MediaKey } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { ownerDocRemark, ownerDocState, session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { Dock, MobileScreen, StepBar } from '../mobileShell'

/* Document vault, step 2 of 2. A yellow band with the dog switcher and
   how many certificates are approved, the three certificates as drawn
   paper sheets with camera / upload actions, and the approval tracker as
   a timeline on a royal-ink band. Sheru's Bordetella follows the admin's
   decision in the vetting queue, remark included. */

type State = 'approved' | 'review' | 'rejected' | 'expiring' | 'missing'
type Doc = { key: VaccineKey; name: string; file: string; given: string; expires: string; state: State; submitted: string }

const NEW_ID = 'coco'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "12 Mar 2027" → "2027-03-12" */
const toIso = (dmy: string) => {
  const [d, m, y] = dmy.split(' ')
  return `${y}-${String(MONTHS.indexOf(m) + 1).padStart(2, '0')}-${d.padStart(2, '0')}`
}

const COCO_DOCS: Doc[] = [
  { key: 'rabies', name: 'Rabies', file: '', given: '', expires: '', state: 'missing', submitted: '' },
  { key: 'dhpp', name: 'DHPP', file: '', given: '', expires: '', state: 'missing', submitted: '' },
  { key: 'bordetella', name: 'Bordetella', file: '', given: '', expires: '', state: 'missing', submitted: '' },
]
const COCO_FILL: Record<VaccineKey, { given: string; expires: string }> = {
  rabies: { given: '18 Aug 2026', expires: '18 Aug 2027' },
  dhpp: { given: '18 Aug 2026', expires: '18 Aug 2027' },
  bordetella: { given: '02 Sep 2026', expires: '02 Sep 2027' },
}
const DEFAULT_REMARK = 'The scan is cut off at the bottom, so the vet’s stamp and batch number are not readable. Please upload the full page.'

/** The certificate as a drawn sheet of paper: header rule, text lines, the vet's stamp. */
function Sheet({ doc, fresh }: { doc: Doc; fresh: boolean }) {
  if (doc.state === 'missing') {
    return (
      <span className="grid h-[112px] w-[86px] shrink-0 place-items-center rounded-[12px] bg-[var(--surface-raised)] text-text-2" style={{ boxShadow: 'inset 0 0 0 2px var(--paper-400)' }}>
        <span className="flex flex-col items-center gap-1.5">
          <Upload size={20} strokeWidth={2.3} aria-hidden />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.06em]">No file</span>
        </span>
      </span>
    )
  }
  const stamp = doc.state === 'rejected' ? 'var(--reactive)' : 'var(--accent)'
  return (
    <motion.span key={fresh ? 'fresh' : 'old'} initial={fresh ? { scale: 0.86, opacity: 0, rotate: -6 } : false} animate={{ scale: 1, opacity: 1, rotate: -2 }} transition={spring.pop} className="relative block h-[112px] w-[86px] shrink-0 rounded-[10px] bg-white p-2.5 shadow-[var(--shadow-floating)]" style={{ rotate: '-2deg' }}>
      <span className="block h-[5px] w-[62%] rounded-full bg-accent" />
      <span className="mt-1 block h-[3px] w-[40%] rounded-full bg-[var(--paper-400)]" />
      <span className="mt-2.5 flex flex-col gap-[5px]">
        {[100, 86, 94, 70, 90].map((w, i) => (
          <span key={i} className="block h-[3px] rounded-full bg-[var(--paper-300)]" style={{ width: `${w}%` }} />
        ))}
      </span>
      <span className="absolute bottom-2.5 left-2.5 block h-[3px] w-[34%] rounded-full bg-[var(--paper-400)]" />
      <span className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full" style={{ boxShadow: `inset 0 0 0 2px ${stamp}`, color: stamp, rotate: '-14deg' }}>
        <PawPrint size={15} strokeWidth={2.4} aria-hidden />
      </span>
      {doc.state === 'rejected' && (
        <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-reactive text-white ring-2 ring-[var(--surface)]">
          <X size={14} strokeWidth={3} aria-hidden />
        </span>
      )}
      {fresh && <span className="absolute -left-2 -top-2 rounded-full bg-sun px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-on-sun ring-2 ring-[var(--surface)]">New</span>}
    </motion.span>
  )
}

type Step = { title: string; body: string; at?: string; tone: 'done' | 'now' | 'todo' | 'bad' }

function stepsFor(doc: Doc, dog: string, remark: string): Step[] {
  const sub: Step = { title: 'Submitted', body: doc.file ? doc.file : 'Take a photo or upload the certificate to start.', at: doc.submitted, tone: doc.state === 'missing' ? 'now' : 'done' }
  if (doc.state === 'missing') return [sub, { title: 'Under review', body: 'A Vuffora admin checks the expiry date, vet stamp and batch number.', tone: 'todo' }, { title: 'Approved', body: `${dog} can be booked once all three are approved.`, tone: 'todo' }]
  if (doc.state === 'review') return [sub, { title: 'Under review', body: 'Kavya from Vuffora is checking the expiry date, vet stamp and batch number. Usually under 4 hours.', at: 'In today’s queue', tone: 'now' }, { title: 'Approved', body: `${dog} can be booked as soon as this is approved.`, tone: 'todo' }]
  if (doc.state === 'rejected') return [sub, { title: 'Under review', body: 'Checked by Kavya, Vuffora compliance.', tone: 'done' }, { title: 'Rejected', body: remark || DEFAULT_REMARK, at: 'Admin remarks', tone: 'bad' }]
  const ok: Step[] = [sub, { title: 'Under review', body: 'Checked by Kavya, Vuffora compliance.', tone: 'done' }, { title: 'Approved', body: `Valid till ${doc.expires}.`, tone: 'done' }]
  if (doc.state === 'expiring') ok.push({ title: 'Renewal due', body: `Expires in ${daysUntil(toIso(doc.expires))} days. Upload the new certificate before then to keep ${dog} bookable.`, at: doc.expires, tone: 'now' })
  return ok
}

export default function OwnerVault() {
  const { navigate, reset, toast } = useNav()
  const viewing = useSession((s) => s.viewingDog)
  const adminState = useSession(ownerDocState)
  const adminRemark = useSession(ownerDocRemark)
  /* uploads made in this visit, "dogId:key" → how */
  const [uploads, setUploads] = useState<Record<string, 'photo' | 'file'>>({})
  const [picked, setPicked] = useState<Record<string, VaccineKey>>({})

  const isNew = viewing === NEW_ID
  const dog = dogById(viewing)
  const dogId = isNew ? NEW_ID : dog.id
  const name = isNew ? 'Coco' : dog.name
  const photo: MediaKey = isNew ? 'beagle' : dog.photo

  const base: Doc[] = isNew ? COCO_DOCS : dog.vaccines.map((v) => ({ ...v, state: dogId === 'sheru' && v.key === 'bordetella' ? adminState : v.state, submitted: dogId === 'sheru' && v.key === 'bordetella' ? 'Fri 9:05 am' : v.given }))
  const docs: Doc[] = base.map((d) => {
    const how = uploads[`${dogId}:${d.key}`]
    if (!how) return d
    const dates = isNew ? COCO_FILL[d.key] : { given: d.given, expires: d.state === 'expiring' ? d.expires.replace('2026', '2027') : d.expires }
    return { ...d, ...dates, state: 'review', submitted: 'Today 7:42 am', file: `${name.toLowerCase()}-${d.key}-${how === 'photo' ? 'photo.jpg' : 'certificate.pdf'}` }
  })
  const approved = docs.filter((d) => d.state === 'approved' || d.state === 'expiring').length
  const activeKey = picked[dogId] ?? (docs.find((d) => d.state !== 'approved') ?? docs[0]).key
  const active = docs.find((d) => d.key === activeKey) ?? docs[0]
  const steps = stepsFor(active, name, dogId === 'sheru' && active.key === 'bordetella' ? adminRemark : '')
  const needsHelp = active.state === 'review' || active.state === 'rejected'

  const upload = (key: VaccineKey, how: 'photo' | 'file', label: string) => {
    setUploads((u) => ({ ...u, [`${dogId}:${key}`]: how }))
    setPicked((p) => ({ ...p, [dogId]: key }))
    toast(how === 'photo' ? `${label} certificate captured. Sent for review.` : `${label} certificate uploaded. Sent for review.`, 'accent')
  }

  return (
    <MobileScreen
      header={<StepBar step={2} total={2} label="Document vault" />}
      dock={
        <Dock>
          <Button size="lg" block icon={Check} onClick={() => { toast(`${name}’s documents saved`, 'accent'); reset('owner.home') }}>
            Done
          </Button>
        </Dock>
      }
    >
      {/* yellow band: dog switcher + approved count */}
      <section className="relative overflow-hidden bg-sun px-5 pb-6 pt-4 text-on-sun">
        <span aria-hidden className="pointer-events-none absolute -left-[24%] -top-[70%] aspect-square w-[70%] rounded-full bg-[rgb(255_255_255/0.3)]" />
        <div className="absolute -right-[12%] top-1/2 aspect-square w-[44%] -translate-y-1/2 overflow-hidden rounded-full bg-white ring-[6px] ring-white">
          <img src={img(photo, 420)} alt={name} className="h-full w-full object-cover" style={{ objectPosition: '50% 20%' }} />
        </div>
        <div className="relative flex gap-2" role="tablist" aria-label="Dog">
          {[...DOGS.map((d) => ({ id: d.id, name: d.name })), ...(isNew ? [{ id: NEW_ID, name: 'Coco' }] : [])].map((d) => {
            const on = d.id === dogId
            return (
              <motion.button key={d.id} type="button" role="tab" aria-selected={on} whileTap={{ scale: 0.95 }} transition={spring.ui} onClick={() => session.viewDog(d.id)} className={`flex h-11 items-center rounded-full px-4 text-[14px] font-extrabold ${on ? 'bg-ink text-on-ink' : 'bg-[rgb(255_255_255/0.6)] text-text'}`}>
                {d.name}
              </motion.button>
            )
          })}
        </div>
        <div className="relative mt-4 flex max-w-[66%] items-center gap-3.5">
          <ProgressRing value={(approved / 3) * 100} size={76} stroke={8} color="var(--ink)">
            <span className="figure num text-[26px]">
              {approved}
              <span className="text-[15px]">/3</span>
            </span>
          </ProgressRing>
          <div className="min-w-0 leading-tight">
            <h1 className="grot text-[24px]">
              <span className="swoosh swoosh-blue">{name}</span>’s vault
            </h1>
            <p className="mt-2 text-[13px] font-bold">{approved === 3 ? (docs.some((d) => d.state === 'expiring') ? 'All approved. One expires soon.' : 'All certificates approved. Ready to book.') : `${approved} of 3 approved. ${3 - approved} to go.`}</p>
          </div>
        </div>
      </section>

      {/* the three certificates */}
      <motion.ul key={dogId} variants={listParent} initial="hidden" animate="show" className="relative z-10 -mt-3 flex flex-col gap-3 px-4">
        {docs.map((d) => {
          const fresh = Boolean(uploads[`${dogId}:${d.key}`])
          const left = d.expires ? daysUntil(toIso(d.expires)) : 0
          const on = d.key === active.key
          return (
            <motion.li key={d.key} variants={listItem} className="rounded-[var(--r-card)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-raised)]" style={on ? { boxShadow: 'inset 0 0 0 2px var(--accent), var(--shadow-raised)' } : undefined}>
              <button type="button" onClick={() => setPicked((p) => ({ ...p, [dogId]: d.key }))} aria-label={`${d.name} certificate, show approval status`} className="flex w-full items-start gap-3.5 text-left">
                <span className="flex w-[86px] shrink-0 flex-col items-center gap-2">
                  <Sheet doc={d} fresh={fresh} />
                  <span className="meta block w-full truncate text-center text-[10px] text-text-2">{d.file || 'not uploaded'}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
                    <span className="grot text-[20px]">{d.name}</span>
                    <StatusPill kind={d.state} label={fresh ? 'Uploaded just now' : undefined} />
                  </span>
                  {d.state === 'missing' ? (
                    <span className="mt-2 block text-[13px] font-semibold leading-snug text-text-2">Needed before {name}’s first walk. A clear photo of the full page works.</span>
                  ) : (
                    <>
                      <span className="mt-2 grid grid-cols-2 gap-2">
                        <span className="leading-tight">
                          <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-text-2">Given</span>
                          <span className="num block text-[13px] font-extrabold">{d.given}</span>
                        </span>
                        <span className="leading-tight">
                          <span className="block text-[11px] font-bold uppercase tracking-[0.06em] text-text-2">Expires</span>
                          <span className="num block text-[13px] font-extrabold">{d.expires}</span>
                        </span>
                      </span>
                      <span className="mt-2.5 flex items-center gap-2">
                        <Bar value={Math.max(4, Math.min(100, (left / 365) * 100))} tone={left <= 30 ? 'danger' : 'calm'} height={5} />
                        <span className={`num shrink-0 text-[12px] font-extrabold ${left <= 30 ? 'text-danger-text' : 'text-text'}`}>{left} days left</span>
                      </span>
                    </>
                  )}
                </span>
              </button>
              <div className="mt-3 flex gap-2">
                <Button variant="paper" size="sm" icon={Camera} className="!h-11 !px-3" onClick={() => upload(d.key, 'photo', d.name)}>
                  Take photo
                </Button>
                <Button variant={d.state === 'missing' || d.state === 'rejected' || d.state === 'expiring' ? 'accent' : 'paper'} size="sm" icon={FileUp} block className="!h-11 !px-3" onClick={() => upload(d.key, 'file', d.name)}>
                  Upload PDF / image
                </Button>
              </div>
            </motion.li>
          )
        })}
      </motion.ul>

      {/* approval status tracker: a timeline with a spine */}
      <section className="relative mt-6 overflow-hidden bg-ink px-5 pb-6 pt-5 text-on-ink">
        <span aria-hidden className="sun -right-[16%] -top-[22%] w-[42%]" />
        <span aria-hidden className="dots-light" />
        <div className="relative">
          <p className="label text-sun-light">Approval status tracker</p>
          <h2 className="grot mt-1 max-w-[74%] text-[24px]">
            {name} · {active.name}
          </h2>
        </div>
        <motion.ol key={`${dogId}-${active.key}-${active.state}`} variants={listParent} initial="hidden" animate="show" className="relative mt-5">
          <span aria-hidden className="absolute bottom-5 left-[13px] top-3 w-[2px] rounded-full bg-[rgb(255_255_255/0.22)]" />
          {steps.map((st, i) => (
            <motion.li key={st.title} variants={listItem} className={`relative pl-11 ${i < steps.length - 1 ? 'pb-5' : ''}`}>
              <span aria-hidden className={`absolute left-0 top-0 grid h-7 w-7 place-items-center rounded-full ring-4 ring-[var(--ink)] ${st.tone === 'done' ? 'bg-calm text-white' : st.tone === 'now' ? 'bg-sun text-on-sun' : st.tone === 'bad' ? 'bg-reactive text-white' : 'bg-ink text-on-ink-2'}`} style={st.tone === 'todo' ? { boxShadow: 'inset 0 0 0 2px rgb(255 255 255 / 0.4), 0 0 0 4px var(--ink)' } : undefined}>
                {st.tone === 'done' ? <Check size={15} strokeWidth={3.2} /> : st.tone === 'bad' ? <X size={15} strokeWidth={3.2} /> : st.tone === 'now' ? <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--ink)]" /> : null}
              </span>
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-[16px] font-extrabold ${st.tone === 'todo' ? 'text-on-ink-2' : ''}`}>{st.title}</span>
                {st.at && <span className="meta shrink-0 text-on-ink-2">{st.at}</span>}
              </div>
              {st.tone === 'bad' ? (
                <p className="mt-2 rounded-[var(--r-control)] bg-danger-soft p-3 text-[13px] font-semibold leading-snug text-[var(--on-danger-soft)]">{st.body}</p>
              ) : (
                <p className="mt-1 break-words text-[13px] font-semibold leading-snug text-on-ink-2">{st.body}</p>
              )}
            </motion.li>
          ))}
        </motion.ol>
        {needsHelp && (
          <div className="relative mt-5 flex items-center gap-3">
            <Button variant="white" icon={Headset} block onClick={() => navigate('owner.support')}>
              Chat with Support
            </Button>
          </div>
        )}
      </section>

      <p className="flex items-start gap-2 px-5 pt-4 text-[12px] font-semibold leading-snug text-text-2">
        <ShieldCheck size={15} strokeWidth={2.4} className="mt-px shrink-0 text-accent-ink" aria-hidden />
        PDF, JPG or PNG up to 10 MB. Certificates are seen only by Vuffora compliance, never by walkers.
      </p>
    </MobileScreen>
  )
}
