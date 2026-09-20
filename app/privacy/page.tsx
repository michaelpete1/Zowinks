import Link from "next/link";
import Navbar from "../../components/NewNavbar";

const lastUpdated = "July 2025";

const sections = [
  {
    title: "1. Who we are",
    body: "Zowkins Enterprise LTD is the data controller responsible for your personal information. We are an IT hardware procurement company located at No 7 Maputo Street, Wuse Zone 3, Abuja, FCT, Nigeria. Contact: contact@zowkins.com.",
  },
  {
    title: "2. What information we collect",
    body: "We collect: your full name, email address, phone number, delivery address, gender, and date of birth when you create a portal account or submit a quote; order history, product selections, and transaction amounts; OTP verification tokens (held in memory only, never stored); device and browser information needed to run the site; and messages you send us via email, contact forms, or WhatsApp.",
  },
  {
    title: "3. Why we collect it",
    body: "We collect your information to process and fulfil orders and quote requests; manage your customer portal account; verify your identity and email address via OTP; send order confirmations, delivery updates, and password reset emails; improve the site and our services; and comply with legal and regulatory obligations under Nigerian law.",
  },
  {
    title: "4. Legal basis for processing",
    body: "We process your personal data on the following bases under the Nigeria Data Protection Act 2023 (NDPA) and the Nigeria Data Protection Regulation (NDPR): performance of a contract — to fulfil your order or quote request; your consent — for account creation and email verification; our legitimate interests — to operate, secure, and improve the business; and compliance with legal obligations.",
  },
  {
    title: "5. How we use your data",
    body: "Your data is used strictly for business operations: processing orders and payments, managing delivery, responding to support and quote requests, sending transactional emails (order confirmations, OTP codes, password resets), and maintaining your account. We do not use your data for unsolicited marketing or advertising without your explicit consent.",
  },
  {
    title: "6. Payment data",
    body: "Payments are processed by third-party payment providers. We do not store your card number, CVV, bank account details, or full payment credentials on our servers. We only retain transaction references and order amounts needed for business records. Payment processors operate under their own security and privacy standards.",
  },
  {
    title: "7. Session tokens and local storage",
    body: "When you log in to the customer portal, your access token is stored in your browser's localStorage to maintain your session. This token is cleared when you log out. We recommend using a private or trusted device when accessing your portal account. We do not use advertising cookies or tracking pixels.",
  },
  {
    title: "8. Cookies",
    body: "We use only essential browser storage (localStorage and session cookies) to maintain your login state and keep items in your cart. We do not use advertising, analytics, or third-party tracking cookies. No personal data is shared with advertising networks.",
  },
  {
    title: "9. Sharing your information",
    body: "We do not sell your personal data to any third party. We may share it only with: delivery and logistics partners to fulfil your order; payment processors to complete transactions; our backend API and hosting infrastructure providers to operate the platform; and law enforcement or regulatory bodies if required by Nigerian law or a valid court order. All third parties are required to handle your data securely and only for the stated purpose.",
  },
  {
    title: "10. WhatsApp",
    body: "If you choose to contact us or submit a quote via WhatsApp, your message and the information you provide will be received by our team through WhatsApp (operated by Meta Platforms). WhatsApp's own privacy policy governs how that data is handled on their platform. We use the information you send only to respond to your inquiry.",
  },
  {
    title: "11. Data retention",
    body: "We retain your personal data for as long as necessary to fulfil the purposes described in this policy. Account data is retained while your account is active. Order and transaction records are retained for a minimum of 6 years for tax and legal compliance under Nigerian law. You may request deletion of your account data at any time, subject to legal retention requirements.",
  },
  {
    title: "12. Your rights",
    body: "Under the Nigeria Data Protection Act 2023, you have the right to: access the personal data we hold about you; request correction of inaccurate or incomplete data; request deletion of your data where no legal obligation requires us to retain it; withdraw consent where processing is based on consent; object to processing in certain circumstances; and lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng. To exercise any of these rights, contact us at contact@zowkins.com.",
  },
  {
    title: "13. Security",
    body: "We use industry-standard security measures including HTTPS encryption, JWT-based authentication, OTP email verification, token refresh mechanisms, and access controls to protect your data. OTP codes are held in component memory only and are never written to localStorage, URLs, or logs. No system is completely secure, and we cannot guarantee absolute security, but we take all reasonable steps to protect your information.",
  },
  {
    title: "14. Children",
    body: "Our services are intended for users aged 18 and above. We do not knowingly collect personal data from anyone under 18. If you believe a child has submitted personal data to us, please contact us at contact@zowkins.com and we will delete it promptly.",
  },
  {
    title: "15. Third-party links",
    body: "Our site may contain links to third-party websites including WhatsApp and payment providers. We are not responsible for the privacy practices or content of those sites. We encourage you to review their privacy policies before submitting any personal information.",
  },
  {
    title: "16. Changes to this policy",
    body: "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. The latest version will always be published on this page with the date it was last updated. Continued use of the site after changes are posted constitutes your acceptance of the updated policy.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">

        {/* Hero */}
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2f5d_0%,#183f73_52%,#224f8e_100%)] px-6 py-12 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:px-10 md:py-16">
          <p className="text-xs uppercase tracking-[0.35em] text-white/75">Legal</p>
          <div className="mt-4 max-w-3xl space-y-4">
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-sm leading-7 text-white/85 md:text-base">
              This policy explains what personal data Zowkins Enterprise LTD collects, why we collect it, how we use and protect it, and your rights under Nigerian data protection law.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Last updated: {lastUpdated}</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">NDPA 2023 compliant</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">No data selling</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">No ad tracking</span>
          </div>
        </section>

        {/* Sections */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <h2 className="font-display text-xl font-bold text-slate-900">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
            </article>
          ))}
        </section>

        {/* Contact sidebar */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">Data controller</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The data controller responsible for your personal information is Zowkins Enterprise LTD, No 7 Maputo Street, Wuse Zone 3, Abuja, FCT, Nigeria. For all data-related requests, contact us at contact@zowkins.com.
            </p>
            <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">Complaints</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              If you believe your data rights have been violated, you have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) at{" "}
              <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-800 underline hover:text-slate-900">
                ndpc.gov.ng
              </a>
              . We ask that you contact us first so we can try to resolve the matter directly and promptly.
            </p>
            <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">Response time</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              We will respond to all data rights requests within 30 days of receipt. Complex requests may take longer, in which case we will notify you of the expected timeline.
            </p>
          </article>

          <aside className="rounded-[1.75rem] bg-[linear-gradient(180deg,#12386a_0%,#0f2f5d_100%)] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-white/75">Your data rights</p>
            <h2 className="mt-3 font-display text-2xl font-bold">Questions about your data?</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">
              To access, correct, or delete your personal data, or to withdraw consent, contact us directly. We will respond within 30 days.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/90">
              <p>Email: contact@zowkins.com</p>
              <p>Phone: 07036359024</p>
              <p>Address: No 7 Maputo Street, Wuse Zone 3, Abuja, FCT, Nigeria</p>
              <p>Hours: Monday – Friday, 9:00 – 17:00</p>
            </div>
            <Link
              href="/request-quote"
              className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Contact us
            </Link>
          </aside>
        </section>

        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Zowkins Enterprise LTD. All rights reserved.{" "}
          ·{" "}
          <Link href="/terms" className="underline hover:text-slate-600">
            Terms of Service
          </Link>
        </p>
      </main>
    </div>
  );
}
