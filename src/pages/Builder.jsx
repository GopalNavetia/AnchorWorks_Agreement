import { Copy, ExternalLink, FilePlus2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { agreementConfig } from '../config/agreement'
import { encodeAgreement } from '../utils/share'
import { RichTextField } from '../components/ui/RichTextField'
import { Controller } from 'react-hook-form'
import { readableDate } from '../utils/format'

const fields = [
  ['agreement.number', 'Agreement number', ''], ['agreement.date', 'Agreement date', '', 'date'], ['agreement.estimatedTimeline', 'Estimated timeline (days)', '', 'number'],
  ['client.name', 'Client name', ''], ['client.company', 'Company name', ''], ['client.contact', 'Contact person', ''],
  ['client.email', 'Client email', ''], ['client.phone', 'Phone number', ''], ['project.name', 'Project name', ''],
  ['project.description', 'Project description', ''], ['project.technology', 'Technology', ''], ['project.pages', 'Number of pages', '', 'number'],
  ['project.price', 'Total price', ''], ['project.advance', 'Advance amount', ''],
  ['project.milestone', 'Second milestone', ''], ['project.final', 'Final payment', ''],
  ['project.revisions', 'Revision rounds', '', 'number'], ['project.warranty', 'Warranty duration', ''], ['project.deliverables', 'Deliverables (one per line)', ''],
  ['project.notes', 'Additional notes', ''],
  ['project.scope', 'Scope of services & technical architecture (one item per line)', ''],
  ['project.clientResponsibilities', 'Client responsibilities & content delivery (one item per line)', ''],
  ['project.designApproval', 'Design approval & change order policy (one item per line)', ''],
  ['project.timelineExclusions', 'Project timeline & exclusions (one item per line)', ''],
  ['project.warrantyOwnership', 'Post-launch warranty & asset ownership (one item per line)', ''],
  ['project.termination', 'Termination & refund terms (one item per line)', ''],
  ['project.remittance', 'Remittance details', '']
]

function initialValues() {
  return fields.reduce((result, [path, , fallback]) => { const [parent, key] = path.split('.'); const value = agreementConfig[parent][key] ?? fallback;   result[path] = path === 'agreement.estimatedTimeline'
    ? String(value).replace(/\s*days?$/i, '')
    : Array.isArray(value) ? value.map((item) => `<p>${item}</p>`).join('') : String(value); return result }, {})
}
function fromValues(values) {
  const next = JSON.parse(JSON.stringify(agreementConfig))
  fields.forEach(([path]) => {
    const [parent, key] = path.split('.')
    const submittedValue = values[parent]?.[key] ?? values[path] ?? ''
    next[parent][key] = path === 'agreement.date' || path === 'project.launchDate'
      ? readableDate(submittedValue)
      : path === 'agreement.estimatedTimeline' && submittedValue
        ? `${submittedValue} days`
        : submittedValue
  })
  next.project.pages = Number(values.project?.pages ?? values['project.pages'] ?? 0)
  next.project.revisions = Number(values.project?.revisions ?? values['project.revisions'] ?? 0)
  return next
}
export function Builder({ onOpen }) {
  const { register, control, handleSubmit } = useForm({ defaultValues: initialValues() })
  const [link, setLink] = useState(''); const [copied, setCopied] = useState(false); const [generateError, setGenerateError] = useState('')
  const generate = (values) => {
    try {
      const config = fromValues(values)
      const url = `${window.location.origin}${window.location.pathname}?agreement=${encodeAgreement(config)}`
      localStorage.setItem('anchorworks:last-agreement', JSON.stringify(config))
      setGenerateError(''); setLink(url)
    } catch (error) {
      console.error('Agreement link generation failed', error)
      setGenerateError('We could not create the link. Please check the project details and try again.')
    }
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true) } catch { setGenerateError('The link is ready. Please select and copy it manually from the box below.') }
    setTimeout(() => setCopied(false), 1800)
  }
  return <main className="min-h-screen bg-paper px-5 pb-20 pt-28 text-ink"><div className="mx-auto max-w-6xl"><div className="max-w-3xl"><p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.25em] text-gold"><span className="h-px w-10 bg-gold"/>AnchorWorks workspace</p><h1 className="mt-5 font-display text-6xl leading-[.9] sm:text-8xl">Build an agreement <i className="text-gold">in minutes.</i></h1><p className="mt-7 max-w-xl leading-7 text-ink/60">Enter project details once. We’ll create a private client link with the branded agreement, signature flow, PDF generation, and email notification.</p></div>
    <form onSubmit={handleSubmit(generate)} className="mt-14 grid gap-5 lg:grid-cols-[1fr_320px]"><div className="rounded-[2rem] border border-ink/10 bg-white/60 p-6 sm:p-9"><div className="mb-8 flex items-center gap-3"><FilePlus2 className="text-gold"/><div><h2 className="font-display text-3xl">Agreement details</h2><p className="text-sm text-ink/50">Format long content with bold, italic, underline, and lists. The formatting carries into the agreement.</p></div></div><div className="grid gap-5 sm:grid-cols-2">{fields.map(([path, label, , type]) => { const large = path.includes('description') || path.includes('notes') || path.includes('deliverables') || path.includes('scope') || path.includes('Responsibilities') || path.includes('Approval') || path.includes('Exclusions') || path.includes('Ownership') || path.includes('termination') || path.includes('remittance'); const fieldLabel = <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-ink/50">{label}</span>; return large ? <div key={path} className="sm:col-span-2">{fieldLabel}<Controller name={path} control={control} render={({ field }) => <RichTextField value={field.value} onChange={field.onChange} rows={path.includes('scope') || path.includes('Responsibilities') || path.includes('Approval') || path.includes('Exclusions') || path.includes('Ownership') || path.includes('termination') ? 8 : 4} placeholder="Write agreement content..." />}/></div> : <label key={path}>{fieldLabel}<input type={type || 'text'} min={type === 'number' ? 1 : undefined} className="w-full rounded-xl border border-ink/10 bg-paper/50 px-4 py-3.5 outline-none focus:border-gold" {...register(path)}/></label> })}</div><div className="mt-9 flex flex-col gap-3 sm:flex-row"><button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 font-semibold text-paper transition hover:bg-gold hover:text-ink"><Sparkles size={17}/> Generate client link</button><button type="button" onClick={copy} disabled={!link} className="flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-4 font-semibold text-ink transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"><Copy size={17}/>{copied ? 'Copied' : 'Copy link'}</button></div>{generateError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{generateError}</p>}{link && <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 p-4"><p className="text-sm font-semibold text-ink">Your client link is ready</p><input readOnly value={link} aria-label="Generated client link" className="mt-3 w-full rounded-xl border border-ink/10 bg-white px-3 py-3 text-xs text-ink/70"/></div>}</div>
      <aside className="h-fit rounded-[2rem] bg-ink p-6 text-paper sm:p-8"><p className="text-xs uppercase tracking-[.2em] text-gold">How it works</p><ol className="mt-6 space-y-6">{['Fill in the project details', 'Generate a private share link', 'Send it to your client', 'Receive the signed PDF by email'].map((item, index) => <li className="flex gap-4" key={item}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/40 text-xs text-gold">{index + 1}</span><span className="pt-1 text-sm leading-5 text-paper/70">{item}</span></li>)}</ol></aside></form>
  </div></main>
}
