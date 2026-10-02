import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

function RegistrationHeader({ dark = false }: { dark?: boolean }) {
  return <header className={`absolute left-0 right-0 top-0 z-30 ${dark ? "text-white" : "text-[#173b46]"}`}><div className="container flex min-h-20 items-center justify-between"><Link href="/" className="font-display text-xl font-semibold">EdgePark <span className="ml-1 text-[9px] font-bold uppercase tracking-[.2em] opacity-60">Estate capital</span></Link><nav className="hidden items-center gap-6 text-sm font-medium md:flex"><Link href="/properties">Explore properties</Link><Link href="/about">About us</Link><Link href="/partner">Partner with us</Link><Link href="/registration">Register in Nigeria</Link></nav><Link href="/partner" className="rounded-full bg-[#bd7b4b] px-4 py-2 text-sm font-semibold text-white">Start a conversation</Link></div></header>;
}

function RegistrationFooter() {
  return <footer className="border-t border-[#deded5] bg-[#f1f0ea] py-10"><div className="container flex flex-wrap items-center justify-between gap-4 text-sm text-[#6c7776]"><span>© 2026 EdgePark Estate · Enugu, Nigeria</span><div className="flex gap-5"><Link href="/">Home</Link><Link href="/about">About us</Link><Link href="/partner">Partner with us</Link></div></div></footer>;
}

const packages = [
  {
    key: "businessName",
    label: "Business name registration",
    eyebrow: "For sole traders and partnerships",
    serviceFee: 25_000,
    cacAiFees: 700,
    total: 25_700,
    price: "From ₦25,700 + statutory CAC fees",
    includes: [
      "Name availability and reservation guidance",
      "Application preparation and submission support",
      "CAC document collection support",
      "Itemised quote before submission",
    ],
  },
  {
    key: "privateCompany",
    label: "Private limited company",
    eyebrow: "For incorporated businesses",
    serviceFee: 75_000,
    cacAiFees: 200,
    total: 75_200,
    price: "From ₦75,200 + statutory CAC fees and stamp duty",
    includes: [
      "Name reservation guidance",
      "Incorporation application support",
      "Director/shareholder information checklist",
      "Itemised quote based on share capital",
    ],
  },
] as const;

const money = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

export default function RegistrationPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    registrationType: "",
    businessName: "",
    details: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const submit = trpc.leads.submitInquiry.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Your registration quote request was received.");
    },
    onError: (error) => {
      setErrors([error.message || "We could not submit your request. Please try again."]);
    },
  });

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (form.name.trim().length < 2) nextErrors.push("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.push("Enter a valid email address.");
    if (!form.registrationType) nextErrors.push("Choose the registration type.");
    if (form.details.trim().length < 10) nextErrors.push("Tell us a little about what you need.");
    setErrors(nextErrors);
    if (nextErrors.length) return;
    submit.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      propertyTitle: `Registration quote — ${form.registrationType}`,
      message: [
        `Registration type: ${form.registrationType}`,
        form.businessName.trim() ? `Proposed business/company name: ${form.businessName.trim()}` : "",
        `Details: ${form.details.trim()}`,
      ].filter(Boolean).join("\n"),
    });
  };

  return (
    <div className="min-h-screen bg-[#f1f0ea] text-[#173b46]">
      <section className="relative overflow-hidden bg-[#173b46] pb-20 pt-32 text-white">
        <RegistrationHeader dark />
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="container relative">
          <div className="eyebrow text-[#d59462]">Nigeria registration desk</div>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight md:text-7xl">
            Register the right business structure with <em className="text-[#e6bd83]">clear pricing.</em>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
            Choose between a Business Name and a Private Limited Company. We show our service fee separately from CAC and other government charges before any application is submitted.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold text-white/75">
            <span className="rounded-full border border-white/15 px-4 py-2">Enugu · Nigeria</span>
            <span className="rounded-full border border-white/15 px-4 py-2">Itemised quote first</span>
            <span className="rounded-full border border-white/15 px-4 py-2">Private provider · not CAC</span>
          </div>
        </div>
      </section>

      <main className="container py-16 md:py-24">
        <section>
          <div className="max-w-2xl">
            <div className="eyebrow">Transparent starting prices</div>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[#173b46] md:text-5xl">One quote. Every line explained.</h2>
            <p className="mt-5 text-base leading-8 text-[#6c7776]">
              Government filing fees and stamp duty are confirmed against the official CAC portal because the final amount depends on the structure, share capital and other requirements.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {packages.map((item, index) => (
              <article key={item.key} className={`rounded-[1.5rem] border bg-white p-7 shadow-sm ${index === 1 ? "border-[#bd7b4b]" : "border-[#deded5]"}`}>
                {index === 1 && <div className="mb-4 inline-flex rounded-full bg-[#fdf4e0] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#8b6530]">Most requested</div>}
                <div className="eyebrow">{item.eyebrow}</div>
                <h3 className="mt-3 font-display text-3xl text-[#173b46]">{item.label}</h3>
                <p className="mt-4 text-lg font-bold text-[#173b46]">{item.price}</p>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#8a918e]">Starting subtotal includes EdgeSpark&apos;s service fee and the displayed CAC AI service charges. Statutory CAC filing fees are confirmed separately.</p>
                <div className="my-6 border-y border-[#deded5] py-4 text-sm">
                  <div className="flex justify-between gap-4 py-2 text-[#6c7776]"><span>EdgeSpark service fee</span><strong>{money(item.serviceFee)}</strong></div>
                  <div className="flex justify-between gap-4 py-2 text-[#6c7776]"><span>CAC AI service charges</span><strong>{money(item.cacAiFees)}</strong></div>
                  <div className="flex justify-between gap-4 border-t border-dashed border-[#deded5] pt-3 font-semibold"><span>Statutory CAC / stamp duty</span><strong className="text-[#8b6530]">Confirmed at quote</strong></div>
                  <div className="mt-2 flex justify-between gap-4 font-bold"><span>Starting subtotal</span><strong className="text-[#8b6530]">{money(item.total)}+</strong></div>
                </div>
                <ul className="grid gap-3 text-sm text-[#6c7776]">{item.includes.map((included) => <li key={included} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#bd7b4b]" />{included}</li>)}</ul>
                <a href="#quote" onClick={() => setForm((current) => ({ ...current, registrationType: index === 0 ? "Business name registration" : "Private limited company" }))} className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#173b46] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245462]">Request this quote <ArrowRight className="ml-2 h-4 w-4" /></a>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-r-xl border-l-4 border-[#c9a24b] bg-[#fdf4e0] p-5 text-sm leading-6 text-[#6c7776]"><strong className="text-[#173b46]">Important price notice.</strong> Government charges can change. Final cost depends on registration type, share capital, directors/shareholders, regulated activities, stamp duty and optional services. EdgeSpark is a private service provider and is not the Corporate Affairs Commission.</div>
        </section>

        <section id="quote" className="mt-20 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <div className="eyebrow">Start your application</div>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[#173b46] md:text-5xl">Get a quote tailored to your business.</h2>
            <p className="mt-5 text-base leading-8 text-[#6c7776]">Tell us what you want to register. Your enquiry is saved in the EdgePark lead inbox, and a team member confirms the final government charges before submission.</p>
            <div className="mt-7 grid gap-4 text-sm text-[#6c7776]"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-[#bd7b4b]" />No payment is taken on this page.</div><div className="flex gap-3"><FileText className="h-5 w-5 shrink-0 text-[#bd7b4b]" />You receive an itemised quote before approval.</div></div>
          </div>
          <form onSubmit={submitForm} className="rounded-[1.5rem] border border-[#deded5] bg-white p-7 shadow-sm">
            <div className="eyebrow">Registration quote request</div>
            {submitted ? <div className="mt-6 rounded-xl bg-[#e8efe9] p-5 text-sm leading-6 text-[#173b46]" role="status"><div className="font-semibold">Your request was received.</div><p className="mt-2">Thank you. We&apos;ll contact you with the final itemised quote.</p><button type="button" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", registrationType: "", businessName: "", details: "" }); }} className="mt-4 font-semibold text-[#bd7b4b]">Submit another request</button></div> : <div className="mt-6 grid gap-4"><Input required aria-label="Full name" placeholder="Full name *" value={form.name} onChange={(event) => update("name", event.target.value)} /><Input required type="email" aria-label="Email address" placeholder="Email address *" value={form.email} onChange={(event) => update("email", event.target.value)} /><Input aria-label="Phone or WhatsApp" placeholder="Phone / WhatsApp" value={form.phone} onChange={(event) => update("phone", event.target.value)} /><select aria-label="Registration type" required value={form.registrationType} onChange={(event) => update("registrationType", event.target.value)} className="h-10 rounded-md border border-[#deded5] bg-white px-3 text-sm"><option value="">What do you need? *</option><option>Business name registration</option><option>Private limited company</option><option>Not sure yet</option></select><Input aria-label="Proposed business name" placeholder="Proposed business/company name" value={form.businessName} onChange={(event) => update("businessName", event.target.value)} /><Textarea required rows={6} placeholder="Tell us your business activity, state, proposed share capital or questions. *" value={form.details} onChange={(event) => update("details", event.target.value)} />{errors.length > 0 && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><ul className="list-disc pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}<Button type="submit" disabled={submit.isPending} className="rounded-full bg-[#173b46] py-6 text-white hover:bg-[#245462]">{submit.isPending ? "Submitting…" : "Request my itemised quote"}<ArrowRight className="ml-2 h-4 w-4" /></Button><p className="text-xs leading-5 text-[#8a918e]">By sending this enquiry, you agree that EdgeSpark may contact you about this registration request.</p></div>}
          </form>
        </section>
      </main>
      <RegistrationFooter />
    </div>
  );
}
