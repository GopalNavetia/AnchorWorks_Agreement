import SignatureCanvas from 'react-signature-canvas'
import { Eraser } from 'lucide-react'
import { useRef } from 'react'
export function SignaturePad({ onChange, error }) {
  const ref = useRef(null)
  return <div><div className={`overflow-hidden rounded-2xl border-2 bg-white ${error ? 'border-red-400' : 'border-ink/10'}`}><SignatureCanvas ref={ref} penColor="#11100e" canvasProps={{ className: 'h-40 w-full' }} onEnd={() => onChange(ref.current.isEmpty() ? '' : ref.current.toDataURL('image/png'))}/></div><button type="button" onClick={() => { ref.current.clear(); onChange('') }} className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink/60 hover:text-ink"><Eraser size={14}/> Clear signature</button>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</div>
}
