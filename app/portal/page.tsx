import Link from "next/link";

const portalLinks = [
  {
    href: "/portal/orders",
    title: "Orders",
    description: "Track purchases, view order details, or create a new order.",
    action: "View orders",
    icon: "🛍",
  },
  {
    href: "/portal/delivery-addresses",
    title: "Delivery addresses",
    description: "Add and manage the addresses you use for delivery.",
    action: "Manage addresses",
    icon: "⌂",
  },
  {
    href: "/portal/profile",
    title: "Profile",
    description: "Review your personal details and account preferences.",
    action: "Manage profile",
    icon: "◉",
  },
];

export default function PortalPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <section className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#f3c74d]">
          Customer portal
        </p>
        <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
              Everything for your order
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Place and track orders, keep delivery details up to date, and request custom quotes.
            </p>
          </div>
          <Link
            href="/portal/orders/create"
            className="shrink-0 rounded-full bg-[#f3c74d] px-5 py-3 text-center text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
          >
            Create order
          </Link>
        </div>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2">
        {portalLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-[#f3c74d]/45 hover:bg-white/[0.08]"
          >
            <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-[#f3c74d]/15 text-lg text-[#f3c74d]">
              {link.icon}
            </span>
            <h2 className="mt-5 text-xl font-semibold text-white">{link.title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-300">{link.description}</p>
            <span className="mt-5 inline-block text-sm font-semibold text-[#f3c74d]">
              {link.action} →
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
