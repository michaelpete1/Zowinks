import Link from "next/link";
import PortalNavbar from "../../components/PortalNavbar";

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <PortalNavbar />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <section className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:p-12">
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">Portal</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white md:text-5xl">Account and order tools</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Manage portal login, account creation, password resets, orders, and delivery addresses.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/portal/auth" className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]">
              Open auth tools
            </Link>
            <Link href="/portal/auth" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
              Manage profile and orders
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
