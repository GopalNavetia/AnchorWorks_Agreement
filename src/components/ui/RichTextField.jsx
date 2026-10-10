import { Bold, Italic, List, ListOrdered, Underline } from 'lucide-react'
import { useEffect, useRef } from 'react'

const allowedTags = /<(?!\/?(?:p|br|strong|b|em|i|u|ul|ol|li)(?:\s[^>]*)?>)[^>]*>/gi
export function sanitizeRichHtml(value = '') {
  return value.replace(allowedTags, '').replace(/ on\w+="[^"]*"/gi, '').replace(/ on\w+='[^']*'/gi, '')
}
export function richTextToPlain(value = '') {
  return sanitizeRichHtml(value).replace(/<\/p>|<br\s*\/?>|<\/li>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}
export function RichTextField({ value, onChange, rows = 6, placeholder }) {
  const editor = useRef(null)
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value || ''
  }, [value])
  const command = (name) => {
    document.execCommand(name, false)
    onChange(sanitizeRichHtml(editor.current?.innerHTML || ''))
  }
  return <div className="overflow-hidden rounded-xl border border-ink/10 bg-paper/50 focus-within:border-gold">
    <div className="flex items-center gap-1 border-b border-ink/10 bg-white/50 px-2 py-2" role="toolbar" aria-label="Text formatting">
      {[[Bold, 'bold', 'Bold'], [Italic, 'italic', 'Italic'], [Underline, 'underline', 'Underline'], [List, 'insertUnorderedList', 'Bulleted list'], [ListOrdered, 'insertOrderedList', 'Numbered list']].map(([Icon, commandName, label]) => <button type="button" key={commandName} onMouseDown={(event) => { event.preventDefault(); command(commandName) }} aria-label={label} className="grid h-8 w-8 place-items-center rounded text-ink/55 hover:bg-ink/10 hover:text-ink"><Icon size={15}/></button>)}
    </div>
    <div ref={editor} contentEditable role="textbox" aria-multiline="true" data-placeholder={placeholder} style={{ minHeight: `${rows * 24}px` }} className="rich-editor px-4 py-3.5 text-sm leading-6 outline-none empty:before:text-ink/35 empty:before:content-[attr(data-placeholder)]" onInput={() => onChange(sanitizeRichHtml(editor.current?.innerHTML || ''))}/>
  </div>
}
