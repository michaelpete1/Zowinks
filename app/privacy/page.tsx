import Link from "next/link";
import Navbar from "../../components/NewNavbar";

const sections = [
  {
    title: "Information we collect",
    body: "We collect information you submit through forms, checkout, and account creation, along with basic device and usage data needed to run the site.",
  },
  {
    title: "How we use it",
    body: "We use the data to process orders, respond to inquiries, improve the site, and support customer and admin workflows.",
  },
  {
    title: "Sharing",
    body: "We only share data with service providers needed to operate the business, fulfill orders, or comply with legal obligations.",
  },
  {
    title: "Your choices",
    body: "You can request updates, corrections, or deletion of your data where applicable by contacting us directly.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2f5d_0%,#183f73_52%,#224f8e_100%)] px-6 py-12 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:px-10 md:py-16">
          <p className="text-xs uppercase tracking-[0.35em] text-white/75">Privacy Policy</p>
          <div className="mt-4 max-w-3xl space-y-4">
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              How we handle your information
            </h1>
            <p className="text-sm leading-7 text-white/85 md:text-base">
              This page explains what we collect, why we collect it, and how we keep it
              limited to the business functions that matter: orders, support, and account management.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/90">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Orders and support</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Account data</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Secure handling</span>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <h2 className="font-display text-xl font-bold text-slate-900">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">Data retention</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              We keep information only as long as needed to complete orders, manage support, meet legal requirements, and maintain business records.
            </p>
            <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">Security</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              We use reasonable administrative and technical safeguards to reduce unauthorized access, misuse, or disclosure of data.
            </p>
          </article>

          <aside className="rounded-[1.75rem] bg-[linear-gradient(180deg,#12386a_0%,#0f2f5d_100%)] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-white/75">Need help?</p>
            <h2 className="mt-3 font-display text-2xl font-bold">Questions about privacy</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">
              Contact us if you want clarification about the data we hold or how we use it.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/90">
              <p>Email: contact@zowkins.com</p>
              <p>Location: Nigeria</p>
            </div>
            <Link
              href="/request-quote"
              className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Contact us
            </Link>
          </aside>
        </section>
      </main>
    </div>
  );
}
