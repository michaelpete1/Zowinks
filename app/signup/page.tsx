import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_28%),linear-gradient(180deg,_#f8fafc,_#eef2ff)] text-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/zowinks-removebg-preview.png"
            alt="Zowkins logo"
            width={48}
            height={48}
            className="h-11 w-11 object-contain"
          />
          <div>
            <p className="font-display text-lg font-semibold leading-none">Zowkins</p>
            <p className="text-xs text-emerald-700">Enterprise LTD</p>
          </div>
        </Link>
        <Link href="/signin" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
          Sign in
        </Link>
      </div>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-6 lg:grid-cols-[0.95fr_1.05fr] lg:pb-16 lg:pt-10">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] lg:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">New account</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
            Create a business account for faster procurement.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300 md:text-base">
            Save quotes, manage team orders, and keep your devices and accessories in one clean dashboard.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold text-white">Fast</p>
              <p className="mt-1 text-sm text-slate-300">Setup in minutes</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold text-white">Team</p>
              <p className="mt-1 text-sm text-slate-300">Shared orders</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-bold text-white">Secure</p>
              <p className="mt-1 text-sm text-slate-300">Protected access</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Join Zowkins</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-slate-900">Sign up</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create your account to save quotes and track orders.
          </p>

          <form className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">First name</label>
                <input
                  type="text"
                  placeholder="Micha"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Last name</label>
                <input
                  type="text"
                  placeholder="Okafor"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Company name</label>
              <input
                type="text"
                placeholder="Company or team name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input type="checkbox" className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <span>
                I agree to the terms and privacy policy.
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have an account? <Link href="/signin" className="font-semibold text-slate-900 hover:text-emerald-700">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
