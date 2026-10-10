export const today = () => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())
export const agreementNumber = () => `AW-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
export const readableDate = (value) => {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return String(value)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
}
