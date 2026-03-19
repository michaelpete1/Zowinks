import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc,_#eef2ff)] text-slate-900">
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
        <Link href="/signup" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
          Create account
        </Link>
      </div>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-6 lg:grid-cols-[0.95fr_1.05fr] lg:pb-16 lg:pt-10">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:p-10">
          <div className="h-2 bg-[linear-gradient(90deg,#1d4f93_0%,#3b82f6_100%)]" />
          <div className="space-y-6 p-8 lg:p-0 lg:pt-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600">
              Member access
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl text-slate-900">
              Sign in to manage orders, quotes, and support.
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-600 md:text-base">
              Use your work email to continue. You can view cart history, download invoices, and track procurement requests from one place.
            </p>

            <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Priority support</span>
                <span className="text-xs uppercase tracking-[0.25em] text-amber-600">24h</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Business account access</span>
                <span className="text-xs uppercase tracking-[0.25em] text-cyan-700">B2B</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Secure login for your team</span>
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-700">Safe</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Welcome back</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter your details to continue to your dashboard.
          </p>

          <form className="mt-8 space-y-5">
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
                placeholder="Your password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                Remember me
              </label>
              <Link href="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            New here? <Link href="/signup" className="font-semibold text-slate-900 hover:text-emerald-700">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
