import { jsPDF } from 'jspdf'
import { richTextToPlain } from '../components/ui/RichTextField'

const clean = (value) => richTextToPlain(Array.isArray(value) ? value.join('<br>') : String(value || '')).replace(/₹/g, 'INR ')

export function buildAgreementPdf({ config, signature, signingDate, agreementNo }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const { agency, client, project } = config
  const margin = 18
  const contentWidth = 174
  let y = 31
  const footer = () => {
    doc.setDrawColor(220, 213, 202); doc.line(margin, 283, 210 - margin, 283)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(125, 118, 108)
    doc.text(`${agency.name}  ·  ${agency.website}  ·  ${agency.email}`, margin, 289)
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, 210 - margin, 289, { align: 'right' })
  }
  const header = () => {
    doc.setFillColor(17, 16, 14); doc.rect(0, 0, 210, 18, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(201, 169, 110); doc.text(agency.name.toUpperCase(), margin, 11)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(190, 185, 176); doc.text(agreementNo, 210 - margin, 11, { align: 'right' })
    y = 29
  }
  const newPage = () => { footer(); doc.addPage(); header() }
  const ensure = (height = 15) => { if (y + height > 276) newPage() }
  const text = (value, size = 9, color = [48, 45, 40], gap = 4, bold = false) => {
    const content = clean(value); if (!content) return
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color)
    const rows = doc.splitTextToSize(content, contentWidth); ensure(rows.length * 4.4 + gap); doc.text(rows, margin, y); y += rows.length * 4.4 + gap
  }
  const section = (heading, body) => {
    const isList = Array.isArray(body)
    const source = isList ? body : String(body || '').replace(/<\/(?:p|li)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
    const items = (Array.isArray(source) ? source : source.split('\n')).flatMap((item) => clean(item).split('\n')).map((item) => item.trim()).filter(Boolean)
    if (!items.length) return
    ensure(16)
    doc.setFillColor(248, 245, 239); doc.roundedRect(margin, y - 5, contentWidth, 10, 2, 2, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(155, 112, 54); doc.text(heading, margin + 4, y + 1); y += 10
    if (heading === 'DELIVERABLES') {
      const columnWidth = (contentWidth - 8) / 2
      const rowHeight = (index) => {
        const left = doc.splitTextToSize(items[index] || '', columnWidth - 6)
        const right = doc.splitTextToSize(items[index + 1] || '', columnWidth - 6)
        return Math.max(left.length, right.length) * 4.1 + 2
      }
      for (let index = 0; index < items.length; index += 2) {
        const height = rowHeight(index)
        ensure(height + 2)
        const leftRows = doc.splitTextToSize(items[index], columnWidth - 6)
        const rightRows = items[index + 1] ? doc.splitTextToSize(items[index + 1], columnWidth - 6) : []
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.7); doc.setTextColor(48, 45, 40)
        doc.text(`• ${leftRows.join('\n• ')}`, margin + 2, y)
        if (rightRows.length) doc.text(`• ${rightRows.join('\n• ')}`, margin + 2 + columnWidth + 8, y)
        y += height
      }
      return
    }
    items.forEach((item) => {
      const parts = item.match(/^([^:]{2,70}):\s*(.*)$/i)
      const hasLabel = Boolean(parts)
      const bullet = isList ? '• ' : ''
      const label = hasLabel ? `${bullet}${parts[1]}:` : bullet
      const value = hasLabel ? parts[2] : item
      const labelWidth = hasLabel ? 56 : contentWidth
      const labelRows = doc.splitTextToSize(label, labelWidth)
      const valueX = margin + 2 + labelWidth + 4
      const valueRows = doc.splitTextToSize(value, hasLabel ? contentWidth - labelWidth - 4 : contentWidth)
      const lineCount = hasLabel ? Math.max(labelRows.length, valueRows.length) : valueRows.length
      ensure(lineCount * 4.2 + 4)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.7); doc.setTextColor(48, 45, 40); doc.text(labelRows, margin + 2, y)
      doc.setFont('helvetica', 'normal')
      if (hasLabel) doc.text(valueRows, valueX, y)
      else doc.text(valueRows, margin + 2, y)
      y += lineCount * 4.1 + 2
    })
  }
  header()
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(17, 16, 14); doc.text('WEBSITE DEVELOPMENT', margin, y); y += 8; doc.text('SERVICE AGREEMENT', margin, y); y += 7
  text('A clear, considered framework for a collaborative digital project.', 10, [125, 108, 83], 11)
  text(`Prepared for ${client.company} · ${client.contact}`, 10, [48, 45, 40], 2, true)
  text(`Agreement date: ${config.agreement?.date || ''} · Project: ${project.name}`, 9, [90, 84, 76], 10)
  const sections = [
    ['PROJECT SUMMARY', `${project.description}\nTechnology: ${project.technology} · ${project.pages} pages · Timeline: ${project.timeline}`],
    ['SCOPE & TECHNICAL ARCHITECTURE', project.scope],
    ['DELIVERABLES', project.deliverables],
    ['CLIENT RESPONSIBILITIES & CONTENT DELIVERY', project.clientResponsibilities],
    ['DESIGN APPROVAL & CHANGE ORDER POLICY', project.designApproval],
    ['PAYMENT SCHEDULE', `Total: ${project.price}\nAdvance: ${project.advance}\nStaging milestone: ${project.milestone}\nFinal delivery: ${project.final}`],
    ['PROJECT TIMELINE & EXCLUSIONS', project.timelineExclusions],
    ['WARRANTY & ASSET OWNERSHIP', project.warrantyOwnership],
    ['TERMINATION & REFUND TERMS', project.termination],
    ['REMITTANCE DETAILS', project.remittance],
    ['ADDITIONAL TERMS', project.notes]
  ]
  sections.forEach(([heading, body]) => section(heading, body))
  ensure(42); section('SIGNATURE', `Signed by: ${client.name}\nSigning date: ${signingDate}\nAgreement number: ${agreementNo}`)
  if (signature) { try { ensure(28); doc.addImage(signature, 'PNG', margin + 2, y, 58, 22); y += 28 } catch { text('Signature captured digitally', 9) } }
  footer()
  return doc
}
