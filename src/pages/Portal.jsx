import { forwardRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  LoaderCircle,
  Mail,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { today, agreementNumber } from "../utils/format";
import { buildAgreementPdf } from "../utils/pdf";
import { sendAgreementEmail, uploadPdfToCloudinary } from "../utils/email";
import { SignaturePad } from "../components/signature/SignaturePad";
export function Portal({ onBack, config }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: config.client.name,
      email: config.client.email,
      phone: config.client.phone,
      date: today(),
      accepted: false,
    },
  });
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [pdf, setPdf] = useState(null);
  const submit = async (values) => {
    if (!signature) {
      setError("Please add your signature before submitting.");
      return;
    }
    setError("");
    setStatus("loading");
    try {
      const no = config.agreement?.number || agreementNumber();
      const doc = buildAgreementPdf({
        config,
        signature,
        signingDate: values.date,
        agreementNo: no,
      });
      const blob = doc.output("blob");
      setPdf({ doc, blob, no });
      let pdfLink;
      let uploadError;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          pdfLink = await uploadPdfToCloudinary(
            blob,
            `AnchorWorks-Agreement-${no}.pdf`,
            config,
          );
          break;
        } catch (uploadFailure) {
          uploadError = uploadFailure;
          if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      if (!pdfLink) throw uploadError || new Error("Cloudinary upload failed.");
      await sendAgreementEmail({
        config,
        pdfLink,
        values,
        agreementNo: no,
        recipient: config.agency.email,
      });
      setStatus("success");
    } catch (e) {
      console.error(e);
      const message = e instanceof Error && e.message.includes("Cloudinary")
        ? "The PDF could not be uploaded. Please check your connection and try submitting again."
        : "The PDF was created, but the email could not be sent. Please try submitting again or contact AnchorWorks.";
      setError(message);
      setStatus("idle");
    }
  };
  if (status === "success") return <Success pdf={pdf} onBack={onBack} />;
  return (
    <main className="min-h-screen bg-paper px-5 pb-20 pt-28 text-ink">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={onBack}
          className="mb-12 flex items-center gap-2 text-sm text-ink/55 hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to agreement
        </button>
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-gold">
          Final step · secure signing
        </p>
        <h1 className="mt-4 font-display text-5xl sm:text-7xl">
          Make it official.
        </h1>
        <p className="mt-5 max-w-xl leading-7 text-ink/60">
          Review your details, add a digital signature, and accept the
          agreement. A PDF copy will be generated for both parties.
        </p>
        <form onSubmit={handleSubmit(submit)} className="mt-12 space-y-5">
          <div className="rounded-[2rem] border border-ink/10 bg-white/60 p-6 sm:p-9">
            <h2 className="font-display text-3xl">Your details</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                error={errors.name}
                {...register("name", { required: "Name is required" })}
              />
              <Field
                label="Email address"
                type="email"
                error={errors.email}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
              <Field
                label="Phone number"
                error={errors.phone}
                {...register("phone", {
                  required: "Phone is required",
                  minLength: { value: 7, message: "Enter a valid phone" },
                })}
              />
              <Field
                label="Signing date"
                type="text"
                readOnly
                {...register("date")}
              />
            </div>
          </div>
          <div
            id="signature"
            className="rounded-[2rem] border border-ink/10 bg-white/60 p-6 sm:p-9"
          >
            <h2 className="font-display text-3xl">Your signature</h2>
            <p className="mt-2 text-sm text-ink/55">
              Draw your signature below using your finger, stylus, or mouse.
            </p>
            <div className="mt-6">
              <SignaturePad
                onChange={setSignature}
                error={error && !signature ? error : ""}
              />
            </div>
            <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm leading-6 text-ink/70">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-ink"
                {...register("accepted", {
                  required: "You must accept the agreement",
                })}
              />
              <span>
                I confirm that I have reviewed this agreement and agree to the
                terms on behalf of my company.
              </span>
            </label>
            {errors.accepted && (
              <p className="mt-2 text-xs text-red-600">
                {errors.accepted.message}
              </p>
            )}
            {error && signature && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            {error && pdf && (
              <button
                type="button"
                onClick={() => pdf.doc.save(`AnchorWorks-Agreement-${pdf.no}.pdf`)}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink underline underline-offset-4"
              >
                <Download size={16} /> Download generated PDF
              </button>
            )}
          </div>
          <button
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-5 font-semibold text-paper transition hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-60"
          >
            {status === "loading" ? (
              <>
                <LoaderCircle className="animate-spin" size={18} /> Uploading PDF
                and sending email…
              </>
            ) : (
              <>
                Sign & submit agreement <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
const Field = forwardRef(function Field({ label, error, ...props }, ref) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-ink/50">
        {label}
      </span>
      <input
        ref={ref}
        className={`w-full rounded-xl border bg-paper/50 px-4 py-3.5 outline-none transition focus:border-gold ${error ? "border-red-400" : "border-ink/10"}`}
        {...props}
      />
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error.message}</span>
      )}
    </label>
  );
});
function Success({ pdf, onBack }) {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5 py-20 text-paper">
      <div className="max-w-xl text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
          <CheckCircle2 size={38} />
        </div>
        <p className="mt-9 text-xs font-semibold uppercase tracking-[.25em] text-gold">
          Agreement received
        </p>
        <h1 className="mt-4 font-display text-6xl">Thank you.</h1>
        <p className="mt-5 leading-7 text-paper/60">
          Your signed agreement is safely recorded. We’ll be in touch shortly
          with next steps and your project kickoff details.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => pdf.doc.save(`AnchorWorks-Agreement-${pdf.no}.pdf`)}
            className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 font-semibold text-ink hover:bg-paper"
          >
            <Download size={17} /> Download PDF
          </button>
          <a
            href="mailto:contact@anchorworks.in"
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-4 font-semibold hover:border-gold"
          >
            <Mail size={17} /> Contact AnchorWorks
          </a>
        </div>
        <button
          onClick={onBack}
          className="mt-8 inline-flex items-center gap-2 text-sm text-paper/45 hover:text-paper"
        >
          <ExternalLink size={14} /> Back to website
        </button>
        <p className="mt-16 text-xs text-paper/30">
          Agreement number · {pdf.no}
        </p>
      </div>
    </main>
  );
}
