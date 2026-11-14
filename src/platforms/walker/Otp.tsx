import { motion } from 'framer-motion'
import { Check, LockKeyhole, MessageCircle, Satellite, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { TemperBadge } from '../../components/Brand'
import { IconButton } from '../../components/Button'
import { OtpKeypad } from '../../components/Otp'
import { OWNER, dogById } from '../../data/cast'
import { WALK } from '../../data/core'
import { img } from '../../data/media'
import { useNav } from '../../lib/navigation'
import { session, useSession } from '../../lib/store'
import { spring, tap } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { MobileScreen, TopBar } from '../mobileShell'

/* Check-In OTP. A royal-blue band says whose dog is being handed over,
   the handling checklist arrives ticked, and the keypad arrives with the
   code in it. Nothing downstream (timer, GPS) starts without the match. */

export default function WalkerOtp() {
  const { navigate } = useNav()
  const dogId = useSession((s) => s.dogId)
  const duration = useSession((s) => s.duration)
  const dog = dogById(dogId)
  const reactive = dog.temperament === 'reactive'
  const items = [...(reactive ? ['Muzzle on'] : []), 'Leash checked', 'Harness fitted', 'Water bottle']
  const [off, setOff] = useState<string[]>([])

  useEffect(() => {
    session.advance('arrived')
  }, [])

  return (
    <MobileScreen header={<TopBar title="Check-In OTP" sub={`${WALK.id} · ${WALK.gate}`} right={<IconButton icon={MessageCircle} label={`Chat with ${OWNER.first}`} tone="paper" onClick={() => navigate('walker.chat')} />} />}>
      {/* who and which dog */}
      <section className="relative overflow-hidden bg-accent px-5 py-4 text-on-accent">
        <span aria-hidden className="sun -bottom-[62%] -right-[6%] w-[24%]" />
        <div className="relative flex items-center gap-3.5">
          <span className="relative shrink-0">
            <img src={img(dog.photo, 220)} alt={`${dog.name}, ${dog.breed}`} className="h-[68px] w-[68px] rounded-full object-cover ring-[3px] ring-white" style={{ objectPosition: '50% 20%' }} />
            <span className="absolute -bottom-1 -right-2 rounded-full ring-[3px] ring-[var(--accent)]">
              <Avatar who={OWNER.photo} size={30} />
            </span>
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="label text-[var(--on-accent-2)]">Custody handover</p>
            <p className="grot mt-1 truncate text-[26px]">Start {dog.name}’s walk</p>
            <p className="mt-1 flex items-center gap-2 text-[13px] font-semibold text-[var(--on-accent-2)]">
              <TemperBadge t={dog.temperament} solid />
              <span className="truncate">from {OWNER.first} · {duration} min</span>
            </p>
          </div>
        </div>
      </section>

      {/* handling checklist, pre-ticked */}
      <motion.div variants={listParent} initial="hidden" animate="show" className="flex flex-wrap gap-2 px-5 pt-4">
        {items.map((it) => {
          const on = !off.includes(it)
          return (
            <motion.button key={it} variants={listItem} type="button" role="checkbox" aria-checked={on} whileTap={tap} transition={spring.ui} onClick={() => setOff((list) => (on ? [...list, it] : list.filter((x) => x !== it)))} className={`flex h-11 items-center gap-2 rounded-full pl-2 pr-4 text-[13px] font-extrabold ${on ? (it === 'Muzzle on' ? 'bg-reactive-soft text-[var(--on-reactive-soft)]' : 'bg-calm-soft text-[var(--on-calm-soft)]') : 'text-text-2'}`} style={on ? undefined : { boxShadow: 'inset 0 0 0 1.5px var(--rule-strong)' }}>
              <span className={`grid h-7 w-7 place-items-center rounded-full ${on ? (it === 'Muzzle on' ? 'bg-reactive text-white' : 'bg-calm text-white') : 'bg-[var(--surface-high)]'}`}>{on && <Check size={15} strokeWidth={3.2} aria-hidden />}</span>
              {it}
            </motion.button>
          )
        })}
      </motion.div>

      <div className="px-5 pt-5">
        <OtpKeypad
          expected={WALK.checkInOtp}
          label="Verify and start walk"
          onVerified={() => {
            session.advance('walking')
            navigate('walker.walk')
          }}
        />
      </div>

      {/* what the code unlocks */}
      <div className="mt-5 flex items-stretch gap-0 bg-ink px-5 py-4 text-on-ink">
        <LockKeyhole size={20} strokeWidth={2.3} className="mt-0.5 shrink-0 text-sun-light" aria-hidden />
        <div className="min-w-0 flex-1 pl-3">
          <p className="text-[14px] font-extrabold leading-snug">The walk timer and GPS recording cannot start without this code.</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-bold text-on-ink-2">
            <span className="flex items-center gap-1.5"><Timer size={13} strokeWidth={2.6} aria-hidden /> Timer locked</span>
            <span className="flex items-center gap-1.5"><Satellite size={13} strokeWidth={2.6} aria-hidden /> GPS locked</span>
            <span className="num">Code valid {WALK.otpTtlMin} min</span>
          </p>
        </div>
      </div>

      <button type="button" onClick={() => navigate('walker.chat')} className="mx-auto mt-1 flex h-11 items-center gap-1.5 px-5 text-[13px] font-extrabold text-accent-ink">
        <MessageCircle size={15} strokeWidth={2.4} aria-hidden /> {OWNER.first} not at the gate? Message her
      </button>
    </MobileScreen>
  )
}
