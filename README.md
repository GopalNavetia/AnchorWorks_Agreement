# AnchorWorks Agreement Portal

Frontend-only Vite + React portal for creating, sharing, reviewing, signing, and downloading website development agreements.

## Run locally

```bash
npm install
npm run dev
```

## Create an agreement

Open the root URL after starting the app. The **Agreement Builder** is the agency workspace. Enter the client and project details, then select **Generate client link**. Copy that URL and send it to the client. The URL contains the agreement configuration, so the client can open it without a backend or database.

The client link opens the branded agreement view. The client reviews the scope and terms, signs in the browser, accepts the agreement, and submits. Agreement data is compressed into the URL to keep links shorter while preserving the frontend-only workflow. A PDF is generated locally, uploaded to Cloudinary, and its secure link is sent through EmailJS when configured. The client can still download the locally generated PDF.

Long agreement fields use the built-in rich-text editor. Select text or place the cursor in a content field and use the toolbar for bold, italic, underline, bulleted lists, and numbered lists. The formatting is preserved in the client agreement and carried into the generated PDF as readable text.

Because this is frontend-only, the generated link is not a secret and there is no server-side storage or revocation. New links use compressed URL data; older links remain readable for compatibility. Use a real deployment URL (not `localhost`) when sending links to clients.

## Configure defaults

Edit [`src/config/agreement.js`](./src/config/agreement.js). The client, project, payment, deliverable, warranty, and launch values are consumed by the agreement UI and generated PDF.

## Configure EmailJS

Create EmailJS templates for the agency and client, then add the EmailJS service ID, template IDs, and public key to the `emailjs` object in [`src/config/agreement.js`](./src/config/agreement.js). The agency template receives a `pdf_link` value instead of a file attachment. The app intentionally leaves client-template configuration empty until the deployment owner supplies their own EmailJS credentials.

The template receives `to_email`, `client_email`, `client_name`, `company`, `project`, `timeline`, `price`, `signing_date`, `agreement_number`, and `pdf_link`. Set the agency template’s recipient to `{{to_email}}`, reply-to to `{{client_email}}`, and include `{{pdf_link}}` as the Cloudinary PDF link. Set the client template’s recipient to `{{client_email}}` and provide `clientTemplateId` if you also want a separate confirmation template sent to the client.

Cloudinary uses the unsigned upload settings in the `cloudinary` object in [`src/config/agreement.js`](./src/config/agreement.js). The browser uploads to the `agreements` folder through the configured unsigned preset; no Cloudinary API secret belongs in this frontend project.

## Production build

```bash
npm run build
```
