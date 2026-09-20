import Link from "next/link";
import Navbar from "../../components/NewNavbar";

const lastUpdated = "July 2025";

const sections = [
  {
    title: "1. Acceptance of terms",
    body: "By visiting the Zowkins website, submitting a quote request, placing an order, or creating a customer portal account, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the site or our services.",
  },
  {
    title: "2. Who we are",
    body: "Zowkins Enterprise LTD is an IT hardware procurement company based at No 7 Maputo Street, Wuse Zone 3, Abuja, FCT, Nigeria. We supply laptops, desktops, accessories, networking equipment, and related IT products to individuals and businesses.",
  },
  {
    title: "3. Products and pricing",
    body: "All product listings, prices, and availability are subject to change without notice. Prices are displayed in Nigerian Naira (₦). We reserve the right to correct pricing errors at any time before an order is confirmed. Product images are for illustration purposes and may differ slightly from the actual item.",
  },
  {
    title: "4. Quote requests",
    body: "Quote requests submitted through the website, customer portal, or WhatsApp are non-binding inquiries. A quote we provide is valid only for the period stated in the quote document. Prices in a quote may change if stock, exchange rates, or supplier costs change before the order is confirmed. Submitting a quote request does not create a contract.",
  },
  {
    title: "5. Orders and confirmation",
    body: "Placing an order through the portal or requesting a quote does not constitute a binding contract. An order is only confirmed once we have reviewed it, verified stock availability, and sent you a written or electronic confirmation. We reserve the right to decline or cancel any order at our discretion, including where pricing errors have occurred or stock is unavailable.",
  },
  {
    title: "6. Payment",
    body: "Payments are processed through third-party payment providers. By completing a payment, you authorise the charge to your selected payment method. We do not store your card details on our servers. If a payment fails, is reversed, or is disputed, your order may be cancelled. For bulk or invoice orders, payment terms will be agreed in writing before fulfilment.",
  },
  {
    title: "7. Delivery",
    body: "Delivery timelines provided are estimates and not guarantees. We are not liable for delays caused by logistics providers, weather, customs, or any circumstances outside our control. Risk of loss passes to you upon delivery to the address you provided. You are solely responsible for providing an accurate and accessible delivery address. Additional charges may apply for deliveries outside Abuja FCT.",
  },
  {
    title: "8. Returns and warranty",
    body: "Returns are accepted within 7 days of delivery for items that are defective, damaged in transit, or materially different from what was ordered. Items must be unused, in original packaging, and accompanied by proof of purchase. Warranty claims for manufacturer defects are handled in accordance with the relevant manufacturer's warranty policy. We do not accept returns for change of mind, incorrect orders placed by the customer, or items damaged through misuse.",
  },
  {
    title: "9. Customer portal accounts",
    body: "You must be at least 18 years old to create a portal account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must not share your account or allow unauthorised access. We may suspend or terminate accounts that violate these terms, engage in fraudulent activity, submit false information, or remain inactive for an extended period. You must notify us immediately if you suspect unauthorised access to your account.",
  },
  {
    title: "10. Email verification and OTP",
    body: "Account creation and certain login actions require email verification via a one-time passcode (OTP). OTP codes are time-limited and must not be shared with anyone. We will never ask you for your OTP by phone, email, or any other channel. If you receive an OTP you did not request, contact us immediately.",
  },
  {
    title: "11. Acceptable use",
    body: "You agree not to use this site to submit false, fraudulent, or misleading orders or quote requests; scrape, copy, or reproduce content without permission; attempt to gain unauthorised access to any part of the system or backend; interfere with the site's operation or security; impersonate another person or entity; or use the site for any unlawful purpose under Nigerian law. Violations may result in immediate account termination and legal action.",
  },
  {
    title: "12. Intellectual property",
    body: "All content on this site — including the Zowkins name, logo, product descriptions, images, and site layout — is the property of Zowkins Enterprise LTD or its licensors. You may not reproduce, distribute, modify, or use any content for commercial purposes without our prior written consent.",
  },
  {
    title: "13. Third-party services",
    body: "This site integrates with third-party services including payment processors and WhatsApp. We are not responsible for the availability, practices, or content of those services. Your use of third-party services is governed by their own terms and privacy policies. We are not liable for any loss arising from your use of those services.",
  },
  {
    title: "14. Limitation of liability",
    body: "To the fullest extent permitted by Nigerian law, Zowkins Enterprise LTD is not liable for any indirect, incidental, special, or consequential losses arising from your use of the site, reliance on product information, service interruptions, payment failures, or delivery delays. Our total liability for any claim shall not exceed the amount you paid for the specific order in question.",
  },
  {
    title: "15. Changes to these terms",
    body: "We may update these terms as the business grows or applicable law changes. The latest version will always be published on this page with the date it was last updated. Continued use of the site after changes are posted constitutes your acceptance of the updated terms.",
  },
  {
    title: "16. Governing law and disputes",
    body: "These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from your use of this site or our services shall be subject to the exclusive jurisdiction of the courts of the Federal Capital Territory, Abuja, Nigeria. We encourage you to contact us first to resolve any issue before pursuing formal legal action.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">

        {/* Hero */}
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2f5d_0%,#183f73_52%,#224f8e_100%)] px-6 py-12 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:px-10 md:py-16">
          <p className="text-xs uppercase tracking-[0.35em] text-white/75">Legal</p>
          <div className="mt-4 max-w-3xl space-y-4">
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Terms of Service
            </h1>
            <p className="text-sm leading-7 text-white/85 md:text-base">
              These terms govern your use of the Zowkins website, customer portal, and all services we provide. Please read them carefully before placing an order or creating an account.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Last updated: {lastUpdated}</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Governing law: Nigeria</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Zowkins Enterprise LTD</span>
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
            <h2 className="font-display text-2xl font-bold text-slate-900">Severability</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              If any provision of these terms is found to be invalid or unenforceable under Nigerian law, the remaining provisions will continue in full force and effect.
            </p>
            <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">Entire agreement</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              These Terms of Service and our Privacy Policy constitute the entire agreement between you and Zowkins Enterprise LTD regarding your use of this site and supersede any prior agreements or understandings.
            </p>
            <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">Contact us</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              If you have questions about these terms, your order, or your account, please reach out to us before taking any formal action. We aim to resolve all issues directly and promptly.
            </p>
          </article>

          <aside className="rounded-[1.75rem] bg-[linear-gradient(180deg,#12386a_0%,#0f2f5d_100%)] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-white/75">Questions?</p>
            <h2 className="mt-3 font-display text-2xl font-bold">Get in touch</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">
              Contact us if you need clarification on any of these terms before placing an order or creating an account.
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
          <Link href="/privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
        </p>
      </main>
    </div>
  );
}
