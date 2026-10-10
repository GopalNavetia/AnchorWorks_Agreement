import { motion } from 'framer-motion'
import { sanitizeRichHtml } from './RichTextField'
export function SectionCard({ id, number, eyebrow, title, children, dark = false }) {
  return <motion.section id={id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .55 }} className={`rounded-[2rem] border p-6 shadow-sm sm:p-9 ${dark ? 'border-white/10 bg-[#191815] text-paper' : 'border-ink/10 bg-white/60'}`}>
    <div className="mb-7 flex items-start justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-gold">{eyebrow}</p><h2 className={`font-display text-3xl leading-none sm:text-4xl ${dark ? 'text-paper' : 'text-ink'}`}>{title}</h2></div><span className="font-display text-3xl text-gold/60">{number}</span></div>{children}
  </motion.section>
}
export function BulletList({ items = [] }) {
  if (!Array.isArray(items)) return <RichTextContent value={items} className="rich-list text-sm leading-6 text-ink/70" />
  return <ul className="grid gap-3 sm:grid-cols-2">{items.map((item, index) => <li key={`${index}-${item}`} className="flex gap-3 text-sm leading-relaxed text-ink/70"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"/><span dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(item) }}/></li>)}</ul>
}
export function RichTextContent({ value, className = '' }) { return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}/> }
