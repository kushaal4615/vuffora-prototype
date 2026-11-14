import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Check, CreditCard, FileText, Loader2, LockKeyhole, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Avatar } from '../../components/Avatar'
import { Price, Stub, TemperBadge } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Input, Toggle } from '../../components/Form'
import { dogById, walkerById } from '../../data/cast'
import { inr } from '../../data/clock'
import { WALK, quote } from '../../data/core'
import { DEMO_PAYMENT, slotLabel } from '../../data/demoFill'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { currentQuote, session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { Dock, MobileScreen, SectionHead, StepBar } from '../mobileShell'

/* INR checkout. Order ticket, a real three-way payment selector (UPI,
   card, net banking), the GST invoice row and the gateway note. Paying
   books the walk: the request lands on the walker's phone. */

type Group = 'upi' | 'card' | 'bank'
const UPI_APPS = [
  { id: 'gpay', name: 'GPay', mark: 'G', bg: '#ffffff', fg: '#2348d6' },
  { id: 'phonepe', name: 'PhonePe', mark: 'Pe', bg: '#5f259f', fg: '#ffffff' },
  { id: 'paytm', name: 'Paytm', mark: 'Pay', bg: '#00baf2', fg: '#0a1238' },
] as const
const BANKS = ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank']

export default function OwnerCheckout() {
  const { navigate, toast } = useNav()
  const walkerId = useSession((s) => s.walkerId)
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const instant = useSession((s) => s.instant)
  const recurring = useSession((s) => s.recurring)
  const pricing = useSession((s) => s.pricing)
  const total = useSession((s) => currentQuote(s).total)
  const walker = walkerById(walkerId)
  const dog = dogById(dogId)
  const q = quote(pricing, duration, dog.temperament, instant)

  const [group, setGroup] = useState<Group>('upi')
  const [app, setApp] = useState<string>(DEMO_PAYMENT.method)
  const [upi, setUpi] = useState(DEMO_PAYMENT.upiId)
  const [card, setCard] = useState(DEMO_PAYMENT.card)
  const [save, setSave] = useState(DEMO_PAYMENT.saveCard)
  const [bank, setBank] = useState(DEMO_PAYMENT.bank)
  const [gstin, setGstin] = useState(DEMO_PAYMENT.gstin)
  const [err, setErr] = useState('')
  const [paying, setPaying] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const pay = () => {
    if (paying) return
    if (group === 'upi' && !upi.trim()) {
      setErr('upi')
      return toast('Enter your UPI ID to pay with UPI', 'warn')
    }
    if (group === 'card' && (!card.number.trim() || !card.expiry.trim() || !card.cvv.trim())) {
      setErr('card')
      return toast('Fill in the card number, expiry and CVV', 'warn')
    }
    setErr('')
    setPaying(true)
    const payMethod = group === 'upi' ? app : group === 'card' ? 'card' : 'netbanking'
    timer.current = window.setTimeout(() => {
      session.book({ dogId, walkerId, duration, instant, recurring, payMethod })
      navigate('owner.confirmed')
    }, 1200)
  }

  const methodLine = group === 'upi' ? `${UPI_APPS.find((a) => a.id === app)?.name} · ${upi}` : group === 'card' ? `Card ending ${card.number.replace(/\s/g, '').slice(-4)}` : `Net banking · ${bank}`

  return (
    <MobileScreen
      header={<StepBar step={2} total={3} label="Pay securely" />}
      dockHeight={96}
      dock={
        <Dock>
          <Button size="lg" block onClick={pay} aria-busy={paying} className={paying ? '!bg-ink' : ''}>
            {paying ? (
              <>
                <Loader2 size={19} strokeWidth={2.6} className="animate-spin" aria-hidden /> Confirming with your bank
              </>
            ) : (
              <>
                <LockKeyhole size={17} strokeWidth={2.5} aria-hidden /> Pay {inr(total)}
              </>
            )}
          </Button>
        </Dock>
      }
    >
      {/* yellow band the ticket laps */}
      <section className="relative overflow-hidden bg-sun px-5 pb-16 pt-4 text-on-sun">
        <span aria-hidden className="pointer-events-none absolute -right-[18%] -top-[60%] aspect-square w-[64%] rounded-full bg-[rgb(255_255_255/0.32)]" />
        <p className="label relative">Amount to pay</p>
        <div className="relative mt-1 flex items-end justify-between gap-3">
          <Price amount={total} size={54} />
          <span className="num pb-1.5 text-right text-[12px] font-bold leading-tight">
            incl. {inr(q.gst)} GST
            <br />
            {WALK.id}
          </span>
        </div>
      </section>

      <Stub
        className="relative z-10 mx-4 -mt-12"
        top={
          <div className="flex items-center gap-3">
            <span className="relative shrink-0">
              <img src={img(dog.photo, 200)} alt={dog.name} className="h-[60px] w-[60px] rounded-[16px] object-cover" style={{ objectPosition: '50% 20%' }} />
              <span className="absolute -bottom-1.5 -right-1.5 rounded-full ring-2 ring-[var(--surface)]">
                <Avatar who={walker.photo} size={28} />
              </span>
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[16px] font-extrabold">
                {dog.name} with <span className="swoosh">{walker.first}</span>
              </p>
              <p className="num mt-1 truncate text-[13px] font-semibold text-text-2">{slotLabel(instant, walker.eta)}</p>
              <p className="mt-1.5 flex items-center gap-2">
                <TemperBadge t={dog.temperament} />
                <span className="num text-[12px] font-bold text-text-2">{duration} min</span>
              </p>
            </div>
          </div>
        }
        bottom={
          <dl className="num flex flex-col gap-1.5 text-[14px]">
            <Row k={`Base fee, ${duration} min`} v={inr(q.base)} />
            {q.surcharge > 0 && <Row k="Aggressive-dog handling" v={inr(q.surcharge)} tone />}
            {q.instant > 0 && <Row k="Instant booking fee" v={inr(q.instant)} />}
            <Row k={`GST at ${pricing.gstPct}%`} v={inr(q.gst)} />
            {recurring && <Row k={`Walk Pass, ${pricing.passWalks} walks`} v={`${pricing.passDiscountPct}% off next`} />}
            <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-[var(--rule)] pt-2.5">
              <dt className="text-[15px] font-extrabold">Total</dt>
              <dd className="text-[18px] font-extrabold">{inr(q.total)}</dd>
            </div>
          </dl>
        }
      />

      <SectionHead className="mt-6" title="Pay with" />

      {/* UPI */}
      <Method icon={Smartphone} title="UPI" sub="Any UPI app or UPI ID" on={group === 'upi'} onPick={() => setGroup('upi')} badge="Fastest">
        <div className="grid grid-cols-3 gap-2">
          {UPI_APPS.map((a) => {
            const on = app === a.id
            return (
              <motion.button key={a.id} type="button" whileTap={tap} transition={spring.ui} aria-pressed={on} onClick={() => setApp(a.id)} className="relative flex flex-col items-center gap-1.5 rounded-[var(--r-control)] bg-[var(--surface)] px-2 py-3" style={{ boxShadow: on ? 'inset 0 0 0 2.5px var(--accent)' : 'inset 0 0 0 1.5px var(--rule-strong)' }}>
                <span className="grot grid h-10 w-10 place-items-center rounded-[12px] text-[15px] shadow-[var(--shadow-raised)]" style={{ background: a.bg, color: a.fg }}>
                  {a.mark}
                </span>
                <span className="text-[13px] font-extrabold">{a.name}</span>
                {on && (
                  <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-on-accent">
                    <Check size={12} strokeWidth={3.4} aria-hidden />
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
        <div className="mt-3">
          <Input label="UPI ID" value={upi} onChange={(e) => setUpi(e.target.value)} autoCapitalize="none" error={err === 'upi' && !upi.trim() ? 'Enter a UPI ID like name@okaxis' : undefined} trailing={upi.trim() ? <span className="flex items-center gap-1 text-[12px] font-bold text-calm-ink"><Check size={14} strokeWidth={3} aria-hidden /> Verified</span> : undefined} />
        </div>
      </Method>

      {/* Card */}
      <Method icon={CreditCard} title="Credit / debit card" sub="Visa, Mastercard, RuPay" on={group === 'card'} onPick={() => setGroup('card')}>
        <div className="flex flex-col gap-3">
          <Input label="Card number" inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} error={err === 'card' && !card.number.trim() ? 'Enter the 16-digit card number' : undefined} trailing={<span className="grot text-[13px] text-accent-ink">VISA</span>} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Expiry" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
            <Input label="CVV" inputMode="numeric" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
          </div>
          <Input label="Name on card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold text-text-2">Save this card for next time (tokenised, RBI compliant)</span>
            <Toggle on={save} onChange={setSave} label="Save this card" />
          </div>
        </div>
      </Method>

      {/* Net banking */}
      <Method icon={Building2} title="Net banking" sub="All major Indian banks" on={group === 'bank'} onPick={() => setGroup('bank')}>
        <div className="flex flex-wrap gap-2">
          {BANKS.map((b) => {
            const on = b === bank
            return (
              <motion.button key={b} type="button" whileTap={tap} transition={spring.ui} aria-pressed={on} onClick={() => setBank(b)} className={`h-11 rounded-full px-4 text-[13px] font-bold ${on ? 'bg-accent text-on-accent' : 'bg-[var(--surface)] text-text'}`} style={on ? undefined : { boxShadow: 'inset 0 0 0 1.5px var(--rule-strong)' }}>
                {b}
              </motion.button>
            )
          })}
        </div>
        <p className="mt-3 text-[13px] font-semibold text-text-2">You will be taken to {bank} to approve {inr(total)} and brought straight back.</p>
      </Method>

      {/* GST invoice */}
      <section className="mt-6 bg-[var(--surface-tint)] px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
            <FileText size={19} strokeWidth={2.3} aria-hidden />
          </span>
          <div className="min-w-0 flex-1 leading-snug">
            <p className="text-[16px] font-extrabold">GST invoice</p>
            <p className="num text-[13px] font-semibold text-text-2">Invoice {WALK.invoice} will be emailed and downloadable.</p>
          </div>
        </div>
        <div className="mt-3">
          <Input label="GSTIN (optional)" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="03ABCDE1234F1Z5" hint="Leave blank for a personal invoice in your name." autoCapitalize="characters" />
        </div>
      </section>

      {/* gateway note */}
      <div className="mx-4 mt-5 flex items-center gap-3 rounded-[var(--r-card)] bg-ink p-4 text-on-ink">
        <ShieldCheck size={26} strokeWidth={2.1} className="shrink-0 text-sun-light" aria-hidden />
        <div className="min-w-0 leading-snug">
          <p className="text-[14px] font-extrabold">Secured payment by Razorpay</p>
          <p className="text-[12px] font-medium text-on-ink-2">256-bit encryption. Vuffora never stores your card or UPI PIN. Money is held until the Check-Out OTP closes the walk.</p>
        </div>
      </div>
      <p className="num px-5 pt-4 text-center text-[12px] font-semibold text-text-2">Paying with {methodLine}</p>
    </MobileScreen>
  )
}

function Row({ k, v, tone = false }: { k: string; v: string; tone?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={`min-w-0 truncate font-semibold ${tone ? 'text-reactive-ink' : 'text-text-2'}`}>{k}</dt>
      <dd className="shrink-0 font-bold">{v}</dd>
    </div>
  )
}

function Method({ icon: Icon, title, sub, on, onPick, badge, children }: { icon: LucideIcon; title: string; sub: string; on: boolean; onPick: () => void; badge?: string; children: ReactNode }) {
  return (
    <div className={`mx-4 mt-2.5 overflow-hidden rounded-[var(--r-card)] transition-colors duration-150 ${on ? 'bg-[var(--surface)] shadow-[var(--shadow-raised)]' : 'bg-[var(--surface-high)]'}`} style={on ? { boxShadow: 'inset 0 0 0 2px var(--accent), var(--shadow-raised)' } : undefined}>
      <motion.button type="button" role="radio" aria-checked={on} whileTap={{ scale: 0.985 }} transition={spring.ui} onClick={onPick} className="flex min-h-[60px] w-full items-center gap-3 px-3.5 py-2.5 text-left">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${on ? 'bg-accent' : 'bg-[var(--surface)]'}`} style={on ? undefined : { boxShadow: 'inset 0 0 0 2px var(--rule-strong)' }}>
          {on && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
        </span>
        <Icon size={20} strokeWidth={2.2} className="shrink-0 text-text" aria-hidden />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[15px] font-extrabold">{title}</span>
          <span className="block truncate text-[12px] font-semibold text-text-2">{sub}</span>
        </span>
        {badge && <span className="shrink-0 rounded-full bg-sun px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.06em] text-on-sun">{badge}</span>}
      </motion.button>
      <AnimatePresence initial={false}>
        {on && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={spring.ui} className="px-3.5 pb-4 pt-1">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
