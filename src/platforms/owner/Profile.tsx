import { motion } from 'framer-motion'
import { Bell, Check, ChevronRight, CreditCard, FileCheck2, Fingerprint, LifeBuoy, LogOut, Mail, MapPin, Phone, Plus, ReceiptText, Smartphone, Ticket, UserRound } from 'lucide-react'
import { useState } from 'react'
import { StatusPill, TemperBadge } from '../../components/Brand'
import { Button, Pressable } from '../../components/Button'
import { ProgressRing } from '../../components/Charts'
import { Input, Toggle } from '../../components/Form'
import { Rail } from '../../components/Media'
import { DOGS, OWNER } from '../../data/cast'
import { DEMO_OWNER_PROFILE, DEMO_PAYMENT } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { ownerDocState, session, useSession } from '../../lib/store'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, SectionHead, safeTop } from '../mobileShell'

/* Account. Yellow hero with Ananya's photo cut as a circle off the right
   edge, her dogs as photo tiles, the documents row, a royal-ink security
   band with the biometric lock, the editable details, saved payment
   methods as a rail, notification toggles and the exits. */

const NOTIFS = [
  { id: 'walk', title: 'Walk updates', sub: 'Arrival, OTP handover, breaks and photos', on: true },
  { id: 'chat', title: 'Chat messages', sub: 'Your walker and Vuffora Support', on: true },
  { id: 'docs', title: 'Certificates', sub: 'Approvals, rejections and expiry reminders', on: true },
  { id: 'offers', title: 'Offers and Walk Pass', sub: 'Renewal reminders, new walkers nearby', on: false },
]

export default function OwnerProfile() {
  const { navigate, reset, toast } = useNav()
  const biometric = useSession((s) => s.biometric)
  const doc = useSession(ownerDocState)
  const passWalks = useSession((s) => s.pricing.passWalks)
  const [f, setF] = useState(DEMO_OWNER_PROFILE)
  const [dirty, setDirty] = useState(false)
  const [tried, setTried] = useState(false)
  const [pay, setPay] = useState(DEMO_PAYMENT.method)
  const [emailLogin, setEmailLogin] = useState(true)
  const [notifs, setNotifs] = useState<Record<string, boolean>>(() => Object.fromEntries(NOTIFS.map((n) => [n.id, n.on])))

  const set = (k: keyof typeof f, v: string) => {
    setF((p) => ({ ...p, [k]: v }))
    setDirty(true)
  }
  const save = () => {
    setTried(true)
    if (!f.name.trim() || !f.phone.trim() || !f.address.trim()) {
      toast('Name, phone and address cannot be empty', 'warn')
      return
    }
    setDirty(false)
    toast('Profile saved', 'accent')
  }
  const approvedDocs = DOGS.reduce((a, d) => a + d.vaccines.filter((v) => v.state === 'approved' || v.state === 'expiring').length, 0) + (doc === 'approved' ? 1 : 0)
  const totalDocs = DOGS.length * 3
  const first = f.name.trim().split(' ')[0] || OWNER.first

  return (
    <MobileScreen tab="account" cap="var(--sun)">
      {/* yellow hero */}
      <section className="relative overflow-hidden bg-sun px-5 pb-12 text-on-sun" style={{ paddingTop: safeTop(14) }}>
        <span aria-hidden className="pointer-events-none absolute -left-[26%] -top-[40%] aspect-square w-[76%] rounded-full bg-[rgb(255_255_255/0.3)]" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.page} className="absolute -right-[9%] top-[22%] aspect-square w-[44%] overflow-hidden rounded-full bg-white ring-[7px] ring-white">
          <img src={img(OWNER.photo, 420)} alt={OWNER.name} className="h-full w-full object-cover" style={{ objectPosition: '50% 20%' }} />
        </motion.div>
        <p className="label relative">Account</p>
        <h1 className="grot relative mt-1.5 max-w-[62%] text-[clamp(30px,8.6vw,36px)] leading-[0.98]">
          <span className="swoosh swoosh-blue">{first}</span> {f.name.trim().split(' ').slice(1).join(' ')}
        </h1>
        <p className="relative mt-3 flex items-center gap-1 text-[13px] font-bold">
          <MapPin size={13} strokeWidth={2.6} aria-hidden /> {OWNER.locality}
        </p>
        <p className="relative mt-1 text-[13px] font-semibold">Member since {OWNER.since}</p>
      </section>

      {/* stats lapping the hero */}
      <div className="relative z-10 mx-4 -mt-8 grid grid-cols-3 rounded-[var(--r-card)] bg-[var(--surface)] py-3.5 shadow-[var(--shadow-floating)]">
        {[
          { v: String(OWNER.walks), l: 'walks' },
          { v: '96.4', l: 'km walked' },
          { v: '4.9', l: 'owner rating' },
        ].map((s, i) => (
          <div key={s.l} className="flex flex-col items-center" style={i > 0 ? { boxShadow: 'inset 1px 0 0 var(--rule)' } : undefined}>
            <span className="figure num text-[26px]">{s.v}</span>
            <span className="mt-1 text-[11px] font-bold text-text-2">{s.l}</span>
          </div>
        ))}
      </div>

      {/* dogs: photo tiles */}
      <SectionHead className="mt-6" title="My dogs" action="Add a dog" onAction={() => { session.viewDog('coco'); navigate('owner.dog') }} />
      <div className="mt-3 grid grid-cols-2 gap-3 px-4">
        {DOGS.map((d) => (
          <motion.button key={d.id} type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => { session.viewDog(d.id); navigate('owner.dog') }} aria-label={`${d.name}, edit profile`} className="relative aspect-[1/1.12] overflow-hidden rounded-[var(--r-card)] bg-ink text-left shadow-[var(--shadow-raised)]">
            <img src={img(d.photo, 420)} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 18%' }} />
            <div className="scrim-b pointer-events-none absolute inset-0" />
            <TemperBadge t={d.temperament} solid className="absolute left-2.5 top-2.5" />
            <span className="absolute inset-x-3 bottom-3 text-white">
              <span className="grot block text-[26px] leading-none">{d.name}</span>
              <span className="mt-1 block truncate text-[12px] font-semibold">{d.breed}</span>
              <span className="num mt-0.5 block text-[11px] font-semibold">
                {d.age} · {d.weight} · {d.walks} walks
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* documents row */}
      <Pressable onClick={() => { session.viewDog('sheru'); navigate('owner.vault') }} className="mt-3 px-4">
        <span className={`flex items-center gap-3.5 rounded-[var(--r-card)] p-3.5 ${doc === 'approved' ? 'bg-success-soft' : doc === 'rejected' ? 'bg-danger-soft' : 'bg-warn-soft'}`}>
          <ProgressRing value={(approvedDocs / totalDocs) * 100} size={52} stroke={6} color="var(--ink)">
            <FileCheck2 size={18} strokeWidth={2.3} aria-hidden />
          </ProgressRing>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold">Documents</span>
              <StatusPill kind={doc} />
            </span>
            <span className="num mt-1 block text-[12px] font-semibold text-text">
              {approvedDocs} of {totalDocs} certificates approved · Sheru’s Bordetella {doc === 'approved' ? 'is approved' : doc === 'rejected' ? 'needs a new upload' : 'is being checked'}
            </span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-text-2" aria-hidden />
        </span>
      </Pressable>

      {/* security: full-bleed royal ink */}
      <section className="relative mt-6 overflow-hidden bg-ink px-5 py-5 text-on-ink">
        <span aria-hidden className="sun -right-[14%] -top-[30%] w-[34%]" />
        <p className="label relative text-sun-light">Security</p>
        <div className="relative mt-3 flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[rgb(255_255_255/0.14)]">
            <Fingerprint size={24} strokeWidth={2.1} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="grot block text-[20px]">Biometric app lock</span>
            <span className="mt-1 block text-[12px] font-semibold text-on-ink-2">{biometric ? 'On. Face ID or fingerprint every time the app opens.' : 'Off. Turn it on to protect bookings and OTPs.'}</span>
          </span>
          <span className="rounded-full bg-ink p-0.5">
            <Toggle
              on={biometric}
              label="Biometric app lock"
              onChange={(v) => {
                session.setBiometric(v)
                toast(v ? 'Biometric app lock on' : 'Biometric app lock off', v ? 'accent' : 'neutral')
              }}
            />
          </span>
        </div>
        <p className="label relative mt-5 text-on-ink-2">Login methods</p>
        <div className="relative mt-2 flex items-center gap-3 py-1.5">
          <Smartphone size={18} strokeWidth={2.2} className="shrink-0 text-sun-light" aria-hidden />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[14px] font-extrabold">Mobile number with SMS OTP</span>
            <span className="num block text-[12px] font-semibold text-on-ink-2">{f.phone}</span>
          </span>
          <span className="flex h-6 shrink-0 items-center gap-1 rounded-full bg-[rgb(255_255_255/0.16)] px-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em]">
            <Check size={12} strokeWidth={3} aria-hidden /> Primary
          </span>
        </div>
        <div className="relative flex items-center gap-3 py-1.5">
          <Mail size={18} strokeWidth={2.2} className="shrink-0 text-sun-light" aria-hidden />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[14px] font-extrabold">Email and password</span>
            <span className="block truncate text-[12px] font-semibold text-on-ink-2">{f.email}</span>
          </span>
          <span className="rounded-full bg-ink p-0.5">
            <Toggle on={emailLogin} label="Email login" onChange={(v) => { setEmailLogin(v); toast(v ? 'Email login on' : 'Email login off. Mobile OTP still works.', v ? 'accent' : 'neutral') }} />
          </span>
        </div>
      </section>

      {/* details: fields on the page, no card */}
      <SectionHead className="mt-6" title="Your details" />
      <div className="mt-3 flex flex-col gap-3.5 px-5">
        <Input label="Full name" value={f.name} onChange={(e) => set('name', e.target.value)} error={tried && !f.name.trim() ? 'Add your name.' : undefined} leading={<UserRound size={17} aria-hidden />} autoComplete="name" />
        <Input label="Email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} leading={<Mail size={17} aria-hidden />} autoComplete="email" />
        <Input label="Phone" type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} error={tried && !f.phone.trim() ? 'Add a phone number.' : undefined} className="num" leading={<Phone size={17} aria-hidden />} autoComplete="tel" />
        <Input label="Pickup address" value={f.address} onChange={(e) => set('address', e.target.value)} error={tried && !f.address.trim() ? 'Walkers need a pickup address.' : undefined} hint="Gate 2, Tower B lobby is saved as the handover point." leading={<MapPin size={17} aria-hidden />} autoComplete="street-address" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Emergency contact" value={f.emergencyName} onChange={(e) => set('emergencyName', e.target.value)} />
          <Input label="Their phone" type="tel" value={f.emergencyPhone} onChange={(e) => set('emergencyPhone', e.target.value)} className="num" />
        </div>
        <p className="-mt-1 text-[12px] font-semibold text-text-2">The SOS button alerts Vuffora Support and this contact.</p>
        <Button variant={dirty ? 'accent' : 'ink'} icon={Check} className="!w-full" onClick={save}>
          Save changes
        </Button>
      </div>

      {/* payment methods: a rail */}
      <SectionHead className="mt-6" title="Payment methods" action="Add new" onAction={() => toast('Add UPI, card or net banking at your next checkout', 'info')} />
      <Rail className="mt-3 pb-3" gap={12}>
        <motion.button type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => { setPay('gpay'); toast('GPay UPI is your default', 'accent') }} aria-pressed={pay === 'gpay'} className="relative flex h-[136px] w-[232px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[var(--r-card)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-raised)]" style={pay === 'gpay' ? { boxShadow: 'inset 0 0 0 2.5px var(--accent), var(--shadow-raised)' } : undefined}>
          <span aria-hidden className="sun-soft -right-8 -top-10 w-28" />
          <span className="relative flex items-center justify-between">
            <span className="grot text-[20px]">
              <span className="text-[#4285F4]">G</span>Pay UPI
            </span>
            {pay === 'gpay' && <StatusPill kind="approved" label="Default" />}
          </span>
          <span className="relative leading-tight">
            <span className="block truncate text-[14px] font-extrabold">{DEMO_PAYMENT.upiId}</span>
            <span className="mt-0.5 block text-[12px] font-semibold text-text-2">Used for 31 walks</span>
          </span>
        </motion.button>
        <motion.button type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => { setPay('card'); toast('Visa ending 1111 is your default', 'accent') }} aria-pressed={pay === 'card'} className="relative flex h-[136px] w-[232px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[var(--r-card)] bg-accent p-4 text-left text-on-accent shadow-[var(--shadow-raised)]" style={pay === 'card' ? { boxShadow: 'inset 0 0 0 2.5px var(--sun), var(--shadow-raised)' } : undefined}>
          <span aria-hidden className="dots-light" />
          <span className="relative flex items-center justify-between">
            <CreditCard size={24} strokeWidth={2.1} aria-hidden />
            {pay === 'card' ? <span className="flex h-6 items-center rounded-full bg-sun px-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-on-sun">Default</span> : <span className="grot text-[18px] italic">VISA</span>}
          </span>
          <span className="relative leading-tight">
            <span className="num block text-[16px] font-extrabold tracking-[0.08em]">•••• •••• •••• {DEMO_PAYMENT.card.number.slice(-4)}</span>
            <span className="num mt-1 flex justify-between text-[12px] font-semibold text-[var(--on-accent-2)]">
              <span>{DEMO_PAYMENT.card.name}</span>
              <span>{DEMO_PAYMENT.card.expiry}</span>
            </span>
          </span>
        </motion.button>
        <motion.button type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} onClick={() => toast('Add UPI, card or net banking at your next checkout', 'info')} aria-label="Add a payment method" className="flex h-[136px] w-[104px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[var(--r-card)] bg-sun-soft text-[var(--on-sun-soft)]" style={{ boxShadow: 'inset 0 0 0 2px var(--sun)' }}>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-sun text-on-sun">
            <Plus size={22} strokeWidth={2.6} aria-hidden />
          </span>
          <span className="text-[12px] font-extrabold">Add new</span>
        </motion.button>
      </Rail>

      {/* notifications */}
      <SectionHead className="mt-4" title="Notifications" />
      <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-1 px-5">
        {NOTIFS.map((n) => (
          <motion.li key={n.id} variants={listItem} className="flex items-center gap-3 py-2.5">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${notifs[n.id] ? 'bg-sun text-on-sun' : 'bg-[var(--surface-high)] text-text-2'}`}>
              <Bell size={17} strokeWidth={2.3} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[15px] font-extrabold">{n.title}</span>
              <span className="mt-0.5 block text-[12px] font-semibold text-text-2">{n.sub}</span>
            </span>
            <Toggle on={notifs[n.id]} label={n.title} onChange={(v) => { setNotifs((p) => ({ ...p, [n.id]: v })); toast(`${n.title} ${v ? 'on' : 'off'}`, v ? 'accent' : 'neutral') }} />
          </motion.li>
        ))}
      </motion.ul>

      {/* links */}
      <div className="mt-4 px-2">
        {[
          { icon: LifeBuoy, title: 'Help & Support', sub: 'FAQs and chat with Vuffora', go: () => navigate('owner.help') },
          { icon: ReceiptText, title: 'My bookings', sub: 'Upcoming, past walks and GST invoices', go: () => navigate('owner.bookings') },
          { icon: Ticket, title: 'Walk Pass', sub: `13 of ${passWalks} walks used, renews 1 Dec`, go: () => navigate('owner.bookings') },
        ].map((r) => (
          <Pressable key={r.title} onClick={r.go} className="flex items-center gap-3 rounded-[var(--r-card)] px-3 py-3">
            <r.icon size={20} strokeWidth={2.2} className="shrink-0 text-accent-ink" aria-hidden />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[15px] font-extrabold">{r.title}</span>
              <span className="mt-0.5 block truncate text-[12px] font-semibold text-text-2">{r.sub}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-text-2" aria-hidden />
          </Pressable>
        ))}
      </div>

      <div className="mt-3 px-5">
        <Button variant="danger" icon={LogOut} className="!w-full" onClick={() => { toast('Signed out', 'neutral'); reset('owner.welcome') }}>
          Sign out
        </Button>
        <p className="mt-3 text-center text-[12px] font-semibold text-text-2">Vuffora 1.0 · Intelligent care. Happier paws.</p>
      </div>
    </MobileScreen>
  )
}
