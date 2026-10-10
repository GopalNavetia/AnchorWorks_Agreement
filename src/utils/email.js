import emailjs from '@emailjs/browser'

export async function uploadPdfToCloudinary(pdfBlob, fileName, config) {
  const { cloudName, uploadPreset } = config.cloudinary || {}
  if (!cloudName || !uploadPreset) throw new Error('Cloudinary upload is not configured.')

  const formData = new FormData()
  formData.append('file', pdfBlob, fileName)
  formData.append('upload_preset', uploadPreset)
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error(`Cloudinary upload failed: ${response.status}`)
  const data = await response.json()
  if (!data.secure_url) throw new Error('Cloudinary did not return a secure PDF URL.')
  return data.secure_url
}

export async function sendAgreementEmail({ config, pdfLink, values, agreementNo, recipient }) {
  const { emailjs: settings } = config
  if (!settings.serviceId || !settings.templateId || !settings.publicKey) return { skipped: true }
  if (!pdfLink) throw new Error('A PDF link is required before sending the agreement email.')

  const params = {
    to_email: recipient,
    title: `New Signed Website Agreement - ${values.name}`,
    name: values.name,
    email: values.email,
    time: values.date,
    message: `A website development agreement has been signed for ${config.project.name}. Agreement number: ${agreementNo}.`,
    reply_to: values.email,
    client_email: values.email,
    client_name: values.name,
    company: config.client.company,
    project: config.project.name,
    timeline: config.project.timeline,
    price: config.project.price,
    signing_date: values.date,
    agreement_number: agreementNo,
    pdf_link: pdfLink,
  }

  await emailjs.send(settings.serviceId, settings.templateId, params, settings.publicKey)
  if (settings.clientTemplateId) {
    try {
      await emailjs.send(settings.serviceId, settings.clientTemplateId, params, settings.publicKey)
    } catch (error) {
      console.error('Client confirmation email failed', error)
    }
  }
  return { skipped: false, pdfLink }
}
