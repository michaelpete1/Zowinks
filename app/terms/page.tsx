import Link from "next/link";
import Navbar from "../../components/NewNavbar";

const sections = [
  {
    title: "Acceptable use",
    body: "Use this site for lawful purposes only. Do not attempt to disrupt the service, scrape restricted areas, or submit false information.",
  },
  {
    title: "Orders and pricing",
    body: "Product details, pricing, and availability may change without notice. Orders are only confirmed once reviewed and accepted.",
  },
  {
    title: "Intellectual property",
    body: "All branding, content, and layout on this site remain the property of Zowkins Enterprises LTD unless otherwise noted.",
  },
  {
    title: "Limitation of liability",
    body: "We are not liable for indirect losses arising from site use, service interruptions, or reliance on outdated information.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2f5d_0%,#183f73_52%,#224f8e_100%)] px-6 py-12 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:px-10 md:py-16">
          <p className="text-xs uppercase tracking-[0.35em] text-white/75">Terms and Conditions</p>
          <div className="mt-4 max-w-3xl space-y-4">
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              The rules for using this site
            </h1>
            <p className="text-sm leading-7 text-white/85 md:text-base">
              These terms describe how you may use the website, place orders, and interact with our content and services.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/90">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Website use</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Orders</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Liability</span>
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
            <h2 className="font-display text-2xl font-bold text-slate-900">Changes to terms</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              We may update these terms as the business grows or the site changes. The latest version will always live on this page.
            </p>
            <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">Governing law</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Any disputes related to the use of this site will be handled under the applicable laws governing our business operations.
            </p>
          </article>

          <aside className="rounded-[1.75rem] bg-[linear-gradient(180deg,#12386a_0%,#0f2f5d_100%)] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-white/75">Need help?</p>
            <h2 className="mt-3 font-display text-2xl font-bold">Questions about the terms</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">
              Contact us if you need clarification before placing an order or creating an account.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/90">
              <p>Email: info@zowkins.com</p>
              <p>Location: Nigeria</p>
            </div>
            <Link
              href="/contact"
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