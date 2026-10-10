import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import logo from '../../assets/android-chrome-192x192.png'
export function Header({ onSign, minimal = false }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const goTo = (id) => {
    close()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-md">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
      <a href="#top" className="flex items-center gap-2.5 text-paper" aria-label="AnchorWorks home"><img src={logo} alt="AnchorWorks" className="h-7 w-7 object-contain" /><span className="font-serif text-xl font-semibold leading-none tracking-tight"><span className="text-paper">Anchor</span><span className="text-gold">Works</span></span></a>
      {minimal ? <a href="https://anchorworks.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-gold">anchorworks.in <ArrowUpRight size={14}/></a> : <nav className={`${open ? 'absolute left-0 right-0 top-full flex' : 'hidden'} flex-col gap-5 border-b border-white/10 bg-ink px-5 py-6 text-sm text-paper/70 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0`}><button type="button" onClick={() => goTo('summary')} className="text-left md:text-center">Overview</button><button type="button" onClick={() => goTo('terms')} className="text-left md:text-center">Agreement</button>{onSign ? <button type="button" onClick={() => { close(); onSign() }} className="text-left md:text-center">Sign</button> : <button type="button" onClick={() => goTo('summary')} className="text-left md:text-center">Sign</button>}<a href="https://anchorworks.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-gold">anchorworks.in <ArrowUpRight size={14}/></a></nav>}
      {!minimal && <button className="text-paper md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>}
    </div>
  </header>
}
