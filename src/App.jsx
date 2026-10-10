import { useMemo, useState } from 'react'
import { Header } from './components/layout/Header'
import { AgreementView } from './components/agreement/AgreementView'
import { Portal } from './pages/Portal'
import { Builder } from './pages/Builder'
import { agreementConfig } from './config/agreement'
import { decodeAgreement } from './utils/share'
import logo from './assets/android-chrome-192x192.png'

function Footer() { return <footer className="bg-ink px-5 py-10 text-paper/50"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs sm:flex-row sm:items-center lg:px-5"><span className="flex items-center gap-2.5"><img src={logo} alt="AnchorWorks" className="h-7 w-7 object-contain" /><span className="font-serif text-xl font-semibold leading-none tracking-tight"><span className="text-paper">Anchor</span><span className="text-gold">Works</span></span></span><span>Thoughtful digital experiences · anchorworks.in</span><span>© {new Date().getFullYear()} Anchor Works</span></div></footer> }
export default function App() {
  const shared = useMemo(() => new URLSearchParams(window.location.search).get('agreement'), [])
  const sharedConfig = useMemo(() => {
    const decoded = shared ? decodeAgreement(shared) : null
    if (!decoded) return null
    return {
      ...agreementConfig,
      ...decoded,
      agreement: { ...agreementConfig.agreement, ...(decoded.agreement || {}) },
      agency: { ...agreementConfig.agency, ...(decoded.agency || {}) },
      client: { ...agreementConfig.client, ...(decoded.client || {}) },
      project: { ...agreementConfig.project, ...(decoded.project || {}) },
      emailjs: { ...agreementConfig.emailjs, ...(decoded.emailjs || {}) },
      cloudinary: { ...agreementConfig.cloudinary, ...(decoded.cloudinary || {}) }
    }
  }, [shared])
  const [mode, setMode] = useState(sharedConfig ? 'agreement' : 'builder')
  const [signing, setSigning] = useState(false)
  const config = sharedConfig || agreementConfig
  const openLink = (url) => { window.history.pushState({}, '', url); window.location.reload() }
  if (mode === 'builder') return <><Header minimal/><Builder onOpen={openLink}/><Footer/></>
  if (signing) return <Portal config={config} onBack={() => setSigning(false)}/>
  return <><Header onSign={() => setSigning(true)}/><AgreementView config={config} onSign={() => setSigning(true)}/><Footer/></>
}
