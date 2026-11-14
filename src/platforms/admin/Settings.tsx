import { motion } from 'framer-motion'
import { Bell, Check, Lock, LogOut, MapPinned, Plug, Plus, Send, ShieldCheck, UserPlus, Users, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Input, Toggle } from '../../components/Form'
import { Modal } from '../../components/Sheet'
import { AREAS, CITY_TILES, DEFAULT_ACCESS, INTEGRATIONS, NEXT_CITIES, ROLES, TEAM, TEMPLATES, type Area, type IntegrationState, type Role, type TeamMember } from '../../data/adminOps'
import { ADMIN, type City } from '../../data/cast'
import { DEMO_INVITE } from '../../data/demoFill'
import { useNav } from '../../lib/navigation'
import { spring } from '../../motion/springs'
import { listItem, listParent } from '../../motion/transitions'
import { ConsoleShell } from '../console/shell'

/* Roles, team and platform settings. A section spine on the left scrolls
   the page; each section is composed differently: a permissions matrix, a
   team table, city tiles, an integrations status list and a template
   editor with a phone preview. */

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'roles', label: 'Roles & access', icon: ShieldCheck },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'cities', label: 'Cities', icon: MapPinned },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'templates', label: 'Notification templates', icon: Bell },
  { id: 'session', label: 'Session', icon: LogOut },
]
const INTEGRATION_TONE: Record<IntegrationState, 'success' | 'warn' | 'neutral'> = { Connected: 'success', Sandbox: 'warn', 'Not enabled': 'neutral' }
const SAMPLE: Record<string, string> = { '{otp}': '482619', '{dog}': 'Bruno', '{walker}': 'Arjun', '{time}': '8:02 am', '{document}': 'Bordetella certificate', '{remark}': 'the vet’s stamp is cut off.', '{amount}': '₹3,240', '{upi}': 'arjun.mehta@okhdfc' }

export default function AdminSettings() {
  const { reset, toast } = useNav()
  const [active, setActive] = useState('roles')
  const [access, setAccess] = useState<Record<Role, Area[]>>(DEFAULT_ACCESS)
  const [team, setTeam] = useState<TeamMember[]>(TEAM)
  const [invite, setInvite] = useState(false)
  const [form, setForm] = useState<{ name: string; email: string; role: Role }>({ name: DEMO_INVITE.name, email: DEMO_INVITE.email, role: DEMO_INVITE.role as Role })
  const [cities, setCities] = useState<Record<City, boolean>>({ Mohali: true, Chandigarh: true, 'Delhi NCR': true })
  const [integrations, setIntegrations] = useState<Record<string, IntegrationState>>(() => Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.state])))
  const [tpl, setTpl] = useState(TEMPLATES[0].id)
  const [bodies, setBodies] = useState<Record<string, string>>(() => Object.fromEntries(TEMPLATES.map((t) => [t.id, t.body])))
  const refs = useRef<Record<string, HTMLElement | null>>({})
  const root = useRef<HTMLDivElement>(null)

  /* the spine follows the scroll position */
  useEffect(() => {
    const main = root.current?.closest('main')
    if (!main) return
    const onScroll = () => {
      const top = main.getBoundingClientRect().top
      let cur = SECTIONS[0].id
      for (const s of SECTIONS) {
        const el = refs.current[s.id]
        if (el && el.getBoundingClientRect().top - top < 150) cur = s.id
      }
      if (main.scrollTop + main.clientHeight >= main.scrollHeight - 4) cur = SECTIONS[SECTIONS.length - 1].id
      setActive(cur)
    }
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => {
    setActive(id)
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const toggleAccess = (role: Role, area: Area) => {
    if (role === 'Super Admin') return toast('Super Admin always has full access', 'neutral')
    setAccess((a) => ({ ...a, [role]: a[role].includes(area) ? a[role].filter((x) => x !== area) : [...a[role], area] }))
  }
  const sendInvite = () => {
    if (!form.name.trim() || !form.email.trim()) return toast('Add a name and a work email for the invite', 'warn')
    if (team.some((m) => m.email === form.email.trim())) return toast(`${form.email.trim()} is already on the team`, 'warn')
    setTeam((t) => [...t, { id: `tm-${t.length + 1}`, name: form.name.trim(), email: form.email.trim(), photo: 'rahul', role: form.role, city: 'All cities', lastActive: 'Not signed in yet', twoStep: 'Invite sent' }])
    setInvite(false)
    toast(`Invite sent to ${form.email.trim()} as ${form.role}`, 'accent')
  }
  const cycleIntegration = (id: string, name: string) => {
    const order: IntegrationState[] = ['Connected', 'Sandbox', 'Not enabled']
    const next = order[(order.indexOf(integrations[id]) + 1) % order.length]
    setIntegrations((s) => ({ ...s, [id]: next }))
    toast(`${name}: ${next}`, next === 'Connected' ? 'accent' : 'neutral')
  }

  const t = TEMPLATES.find((x) => x.id === tpl) ?? TEMPLATES[0]
  const body = bodies[t.id] ?? ''
  const preview = Object.entries(SAMPLE).reduce((s, [k, v]) => s.split(k).join(v), body)
  const sec = (id: string) => (el: HTMLElement | null) => { refs.current[id] = el }

  return (
    <ConsoleShell active="admin.settings" title="Roles & settings" sub="Who can do what, where Vuffora runs, and what it is connected to" actions={<Button size="sm" icon={UserPlus} className="max-md:h-11" onClick={() => setInvite(true)}>Invite teammate</Button>}>
      <div ref={root} className="grid grid-cols-[212px_minmax(0,1fr)] items-start gap-8 px-8 pb-12 max-md:grid-cols-1 max-md:gap-4 max-md:px-4 max-md:pb-6">
        {/* section spine */}
        <nav aria-label="Settings sections" className="sticky top-4 max-md:static max-md:-mx-4">
          <ul className="relative flex flex-col gap-0.5 max-md:flex-row max-md:gap-2 max-md:overflow-x-auto max-md:px-4 max-md:[scrollbar-width:none]">
            <span aria-hidden className="absolute bottom-3 left-[17px] top-3 w-[2px] rounded-full bg-[var(--paper-300)] max-md:hidden" />
            {SECTIONS.map((s) => {
              const on = s.id === active
              return (
                <li key={s.id} className="max-md:shrink-0">
                  <motion.button type="button" whileTap={{ scale: 0.97 }} transition={spring.ui} aria-current={on ? 'true' : undefined} onClick={() => go(s.id)} className={`relative flex h-11 w-full items-center gap-3 rounded-full pl-1.5 pr-3 text-left text-[14px] font-bold transition-colors duration-150 max-md:pr-4 ${on ? 'text-text max-md:bg-ink max-md:text-on-ink' : 'text-text-2 hover:text-text max-md:shadow-[inset_0_0_0_1px_var(--rule-strong)]'}`}>
                    <span className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full ring-4 ring-[var(--bg)] max-md:ring-0 ${on ? 'bg-accent text-on-accent' : 'bg-[var(--paper-300)] text-text-2'}`}>
                      <s.icon size={14} strokeWidth={2.4} aria-hidden />
                    </span>
                    <span className="whitespace-nowrap">{s.label}</span>
                  </motion.button>
                </li>
              )
            })}
          </ul>
          <div className="mt-5 flex items-center gap-2.5 rounded-[var(--r-card)] bg-sun-soft p-3 max-md:hidden">
            <Avatar who={ADMIN.photo} size={36} ring />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-extrabold">{ADMIN.name}</span>
              <span className="block truncate text-[11px] font-semibold text-[var(--on-sun-soft)]">{ADMIN.role} · 2-step on</span>
            </span>
          </div>
        </nav>

        <div className="min-w-0">
          {/* roles: permissions matrix */}
          <section ref={sec('roles')} className="scroll-mt-4">
            <SectionHead title="Role-based access control" sub="Tick an area to let a role open it and act in it. Changes apply at the next sign-in." />
            <div className="mt-4 overflow-x-auto rounded-[var(--r-container)] bg-[var(--surface)] p-2 shadow-[var(--shadow-raised)] [scrollbar-width:none] max-md:hidden">
              <table className="w-full table-fixed text-[13px]">
                <thead>
                  <tr>
                    <th className="w-[190px] px-3 py-2.5 text-left"><span className="label text-text-2">Role</span></th>
                    {AREAS.map((a) => <th key={a} className="px-1 py-2.5"><span className="label text-text-2">{a}</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map((role) => {
                    const locked = role === 'Super Admin'
                    return (
                      <tr key={role} className={locked ? 'bg-sun-soft' : ''}>
                        <td className={`px-3 py-1.5 ${locked ? 'rounded-l-[16px]' : ''}`}>
                          <span className="flex items-center gap-2 font-extrabold">{role}{locked && <Lock size={13} className="text-[var(--on-sun-soft)]" aria-label="Locked on" />}</span>
                          <span className="block text-[11px] font-semibold text-text-2">{team.filter((m) => m.role === role).length} people · {access[role].length} of {AREAS.length} areas</span>
                        </td>
                        {AREAS.map((area, i) => (
                          <td key={area} className={`px-1 py-1.5 text-center ${locked && i === AREAS.length - 1 ? 'rounded-r-[16px]' : ''}`}>
                            <AccessCell on={access[role].includes(area)} locked={locked} label={`${role}: ${area}`} onClick={() => toggleAccess(role, area)} />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* phone: one block per role */}
            <ul className="mt-3 flex flex-col gap-4 md:hidden">
              {ROLES.map((role) => (
                <li key={role}>
                  <p className="flex items-center gap-2 text-[15px] font-extrabold">{role}{role === 'Super Admin' && <Lock size={13} aria-label="Locked on" />}<span className="ml-auto text-[12px] font-semibold text-text-2">{access[role].length} of {AREAS.length}</span></p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {AREAS.map((area) => {
                      const on = access[role].includes(area)
                      return (
                        <button key={area} type="button" aria-pressed={on} onClick={() => toggleAccess(role, area)} className={`flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold ${on ? (role === 'Super Admin' ? 'bg-sun text-on-sun' : 'bg-accent text-on-accent') : 'text-text-2 shadow-[inset_0_0_0_1px_var(--rule-strong)]'}`}>
                          {on && <Check size={14} strokeWidth={3} aria-hidden />}{area}
                        </button>
                      )
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* team */}
          <section ref={sec('team')} className="mt-11 scroll-mt-4">
            <SectionHead title="Team" sub={`${team.length} people, ${team.filter((m) => m.twoStep === 'On').length} with 2-step verification on`} action={<Button size="sm" variant="outline" icon={Plus} className="max-md:h-11" onClick={() => setInvite(true)}>Invite teammate</Button>} />
            <table className="mt-3 w-full table-fixed text-left text-[13px] max-md:hidden">
              <thead>
                <tr className="label text-text-2">
                  <th className="w-[300px] pb-2 font-extrabold">Member</th>
                  <th className="w-[170px] pb-2 font-extrabold">Role</th>
                  <th className="w-[120px] pb-2 font-extrabold">City</th>
                  <th className="pb-2 font-extrabold">Last active</th>
                  <th className="w-[112px] pb-2 font-extrabold">2-step</th>
                </tr>
              </thead>
              <tbody>
                {team.map((m) => (
                  <tr key={m.id} className="border-t border-[var(--rule)]">
                    <td className="py-2.5">
                      <span className="flex items-center gap-2.5">
                        <Avatar who={m.photo} size={34} ring={m.id === 'tm1'} />
                        <span className="min-w-0 leading-tight">
                          <span className="block truncate font-extrabold">{m.name}{m.id === 'tm1' && <span className="ml-1.5 font-semibold text-text-2">you</span>}</span>
                          <span className="meta block truncate text-text-2">{m.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 font-bold">{m.role}</td>
                    <td className="py-2.5 font-semibold text-text-2">{m.city}</td>
                    <td className="truncate py-2.5 font-semibold text-text-2">{m.lastActive === 'Now' ? <span className="flex items-center gap-1.5 text-text"><span className="h-2 w-2 rounded-full bg-calm" /> Online now</span> : m.lastActive}</td>
                    <td className="py-2.5"><Badge tone={m.twoStep === 'On' ? 'success' : m.twoStep === 'Off' ? 'danger' : 'warn'}>{m.twoStep}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-2 md:hidden">
              {team.map((m) => (
                <motion.li key={m.id} variants={listItem} className="flex items-center gap-3 border-b border-[var(--rule)] py-3">
                  <Avatar who={m.photo} size={40} ring={m.id === 'tm1'} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[15px] font-extrabold">{m.name}</span>
                    <span className="mt-0.5 block truncate text-[12px] font-semibold text-text-2">{m.role} · {m.city} · {m.lastActive}</span>
                  </span>
                  <Badge tone={m.twoStep === 'On' ? 'success' : m.twoStep === 'Off' ? 'danger' : 'warn'}>{m.twoStep === 'Invite sent' ? 'Invited' : `2-step ${m.twoStep.toLowerCase()}`}</Badge>
                </motion.li>
              ))}
            </motion.ul>
          </section>

          {/* cities */}
          <section ref={sec('cities')} className="mt-11 scroll-mt-4">
            <SectionHead title="Cities" sub="Switch a city off to stop new bookings there. Walks already booked still run." />
            <div className="mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
              {CITY_TILES.map((c, i) => {
                const on = cities[c.city]
                return (
                  <div key={c.city} className={`relative overflow-hidden rounded-[var(--r-container)] p-5 transition-colors duration-200 ${on ? (i === 0 ? 'bg-sun text-on-sun' : i === 1 ? 'bg-accent text-on-accent' : 'bg-ink text-on-ink') : 'bg-[var(--surface-high)] text-text-2'}`}>
                    {on && <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 aspect-square w-40 rounded-full bg-[rgb(255_255_255/0.16)]" />}
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="label">{on ? `Live since ${c.since}` : 'Paused'}</p>
                        <h3 className="grot mt-1 text-[28px]">{c.city}</h3>
                      </div>
                      <Toggle on={on} tone="ink" label={`${c.city} bookings`} onChange={(v) => { setCities((s) => ({ ...s, [c.city]: v })); toast(v ? `${c.city} is taking bookings again` : `${c.city} paused. No new bookings from now.`, v ? 'accent' : 'warn') }} />
                    </div>
                    <dl className="relative mt-4 grid grid-cols-3 gap-2">
                      {[['Walkers', c.walkers], ['Owners', c.owners], ['Live now', on ? c.live : 0]].map(([k, v]) => (
                        <div key={k}>
                          <dd className="figure num text-[26px]">{Number(v).toLocaleString('en-IN')}</dd>
                          <dt className="mt-0.5 text-[11px] font-bold">{k}</dt>
                        </div>
                      ))}
                    </dl>
                    <p className="relative mt-3 truncate text-[12px] font-semibold">{c.localities}</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="label mr-1 text-text-2">Coming next</span>
              {NEXT_CITIES.map((c) => (
                <motion.button key={c.city} type="button" whileTap={{ scale: 0.96 }} transition={spring.ui} onClick={() => toast(`${c.city} is on the waitlist: ${c.waitlist} owners have asked for it`, 'info')} className="flex h-10 items-center gap-2 rounded-full border border-dashed border-[var(--rule-strong)] px-3.5 text-[13px] font-bold text-text-2 max-md:h-11">
                  {c.city}
                  <span className="num text-[11px] font-semibold">{c.waitlist}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* integrations */}
          <section ref={sec('integrations')} className="mt-11 scroll-mt-4">
            <SectionHead title="Integrations" sub="The third-party services named in the specification. Tap a status to change it." />
            <motion.ul variants={listParent} initial="hidden" animate="show" className="mt-2 grid grid-cols-2 gap-x-10 max-md:grid-cols-1">
              {INTEGRATIONS.map((it) => {
                const state = integrations[it.id]
                return (
                  <motion.li key={it.id} variants={listItem} className="flex items-center gap-3 border-b border-[var(--rule)] py-3.5">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${state === 'Connected' ? 'bg-calm' : state === 'Sandbox' ? 'bg-warn' : 'bg-[var(--paper-400)]'}`} aria-hidden />
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[15px] font-extrabold">{it.name}</span>
                      <span className="mt-0.5 block text-[12px] font-semibold leading-snug text-text-2">{it.use}</span>
                      <span className="meta mt-1 block truncate text-text-2">{it.meta}</span>
                    </span>
                    <motion.button type="button" whileTap={{ scale: 0.95 }} transition={spring.ui} onClick={() => cycleIntegration(it.id, it.name)} aria-label={`${it.name} status: ${state}. Change`} className="grid h-11 shrink-0 place-items-center">
                      <Badge tone={INTEGRATION_TONE[state]}>{state}</Badge>
                    </motion.button>
                  </motion.li>
                )
              })}
            </motion.ul>
          </section>

          {/* notification templates: editor + phone preview */}
          <section ref={sec('templates')} className="mt-11 scroll-mt-4">
            <SectionHead title="Notification templates" sub="What owners and walkers read on their phones. Variables in braces are filled in when it is sent." />
            <div className="mt-4 grid grid-cols-[200px_minmax(0,1fr)_280px] gap-5 rounded-[var(--r-container)] bg-ink p-5 text-on-ink max-md:grid-cols-1 max-md:gap-4 max-md:p-4">
              <ul className="flex flex-col gap-1 max-md:flex-row max-md:overflow-x-auto max-md:[scrollbar-width:none]">
                {TEMPLATES.map((x) => {
                  const on = x.id === t.id
                  return (
                    <li key={x.id} className="max-md:shrink-0">
                      <button type="button" aria-pressed={on} onClick={() => setTpl(x.id)} className={`block min-h-11 w-full rounded-[var(--r-control)] px-3 py-2 text-left leading-tight ${on ? 'bg-sun text-on-sun' : 'text-on-ink hover:bg-[rgb(255_255_255/0.08)]'}`}>
                        <span className="block whitespace-nowrap text-[14px] font-extrabold">{x.name}</span>
                        <span className={`block whitespace-nowrap text-[11px] font-bold ${on ? '' : 'text-on-ink-2'}`}>{x.channel}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="min-w-0">
                <label htmlFor="tpl-body" className="flex items-baseline justify-between gap-3 text-[12px] font-bold text-on-ink-2"><span>{t.name} · to {t.to.toLowerCase()}</span><span className="num">{body.length} / 160</span></label>
                <textarea id="tpl-body" rows={4} value={body} onChange={(e) => setBodies((b) => ({ ...b, [t.id]: e.target.value }))} className="mt-2 w-full resize-none rounded-[var(--r-control)] bg-[rgb(255_255_255/0.1)] px-3.5 py-3 text-[14px] font-medium leading-relaxed text-white outline-none ring-1 ring-inset ring-[rgb(255_255_255/0.18)] focus:ring-2 focus:ring-[var(--sun)]" />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {t.vars.map((v) => (
                    <button key={v} type="button" onClick={() => setBodies((b) => ({ ...b, [t.id]: `${b[t.id]} ${v}` }))} className="meta h-8 rounded-full bg-[rgb(255_255_255/0.12)] px-2.5 text-sun-light max-md:h-11">{v}</button>
                  ))}
                  <Button size="sm" variant="white" icon={Send} className="ml-auto max-md:h-11" onClick={() => (body.trim() ? toast(`"${t.name}" template saved`, 'accent') : toast('The template cannot be empty', 'warn'))}>Save template</Button>
                </div>
              </div>
              <div className="rounded-[22px] bg-[rgb(255_255_255/0.08)] p-3">
                <p className="meta text-center text-on-ink-2">8:02 am · preview</p>
                <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-2 rounded-[16px] bg-white p-3 text-[13px] font-medium leading-snug text-[#14172b]">
                  <span className="mb-1 flex items-center gap-1.5 text-[11px] font-extrabold text-[#4a5068]"><span className="grid h-4 w-4 place-items-center rounded-[5px] bg-sun text-[9px] text-on-sun">V</span>{t.channel === 'SMS' ? 'VM-VUFORA' : 'Vuffora'}</span>
                  {preview || 'Empty template'}
                </motion.div>
              </div>
            </div>
          </section>

          {/* session */}
          <section ref={sec('session')} className="mt-11 flex scroll-mt-4 flex-wrap items-center justify-between gap-4 border-t border-[var(--rule)] pt-6">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar who={ADMIN.photo} size={48} ring />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[16px] font-extrabold">Signed in as {ADMIN.name}</p>
                <p className="meta mt-1 truncate text-text-2">{ADMIN.email} · Chrome on macOS, Mohali · since 7:38 am</p>
              </div>
            </div>
            <Button variant="outline" icon={LogOut} onClick={() => reset('admin.signin')}>Sign out</Button>
          </section>
        </div>
      </div>

      <Modal open={invite} onClose={() => setInvite(false)} title="Invite teammate">
        <div className="flex flex-col gap-4">
          <Input label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Work email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} hint="They get a sign-in link and set up 2-step verification on first use." />
          <div>
            <p className="text-[13px] font-bold">Role</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ROLES.filter((r) => r !== 'Super Admin').map((r) => (
                <button key={r} type="button" aria-pressed={form.role === r} onClick={() => setForm((f) => ({ ...f, role: r }))} className={`h-10 rounded-full px-3.5 text-[13px] font-bold max-md:h-11 ${form.role === r ? 'bg-accent text-on-accent' : 'text-text shadow-[inset_0_0_0_1px_var(--rule-strong)]'}`}>{r}</button>
              ))}
            </div>
            <p className="mt-2 text-[12px] font-semibold text-text-2">Can open: {access[form.role].join(', ') || 'nothing yet'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" block onClick={() => setInvite(false)}>Cancel</Button>
            <Button block icon={Send} onClick={sendInvite}>Send invite</Button>
          </div>
        </div>
      </Modal>
    </ConsoleShell>
  )
}

function SectionHead({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="grot text-[28px] max-md:text-[24px]">{title}</h2>
        <p className="mt-1 text-[13px] font-medium text-text-2">{sub}</p>
      </div>
      {action}
    </div>
  )
}

function AccessCell({ on, locked, label, onClick }: { on: boolean; locked: boolean; label: string; onClick: () => void }) {
  return (
    <motion.button type="button" role="checkbox" aria-checked={on} aria-label={label} whileTap={{ scale: 0.88 }} transition={spring.ui} onClick={onClick} className="mx-auto grid h-10 w-full max-w-[64px] place-items-center rounded-[12px] hover:bg-[rgb(14_27_87/0.05)]">
      <span className={`grid h-7 w-7 place-items-center rounded-full transition-colors duration-150 ${on ? (locked ? 'bg-ink text-on-ink' : 'bg-accent text-on-accent') : 'shadow-[inset_0_0_0_1.5px_var(--rule-strong)]'}`}>
        {on && <Check size={15} strokeWidth={3} aria-hidden />}
      </span>
    </motion.button>
  )
}
