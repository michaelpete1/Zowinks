"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ADMIN_CREDENTIALS, useAdminSession } from "../../hooks/useAdminSession";

export default function SignInPage() {
  const router = useRouter();
  const { signInAdmin } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      setError("Enter both email and password.");
      return;
    }

    setLoading(true);

    const isAdminEmail = normalizedEmail === ADMIN_CREDENTIALS.email;
    const isAdminPassword = trimmedPassword === ADMIN_CREDENTIALS.password;

    if (!isAdminEmail || !isAdminPassword) {
      setLoading(false);
      setError("Use the admin credentials to access the dashboard.");
      return;
    }

    signInAdmin("Admin", ADMIN_CREDENTIALS.email);
    router.push("/admin");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc,_#eef2ff)] text-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center" aria-label="Zowkins home">
            <Image
              src="/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png"
              alt="Zowkins logo"
            width={180}
            height={68}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>
        <Link href="/admin" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
          Admin dashboard
        </Link>
      </div>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-6 lg:grid-cols-[0.95fr_1.05fr] lg:pb-16 lg:pt-10">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:p-10">
          <div className="h-2 bg-[linear-gradient(90deg,#1d4f93_0%,#3b82f6_100%)]" />
          <div className="space-y-6 p-8 lg:p-0 lg:pt-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600">
              Admin access
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Sign in to access the admin dashboard.
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-600 md:text-base">
              This page is reserved for administrators who manage products, orders, and customer inquiries.
            </p>

            <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 px-5 py-4 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Admin control center</span>
                <span className="text-xs uppercase tracking-[0.25em] text-amber-600">Admin</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Secure session storage</span>
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-700">Safe</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Welcome back</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter the admin credentials to continue.
          </p>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Admin credentials: <span className="font-semibold">{ADMIN_CREDENTIALS.email}</span> / <span className="font-semibold">{ADMIN_CREDENTIALS.password}</span>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@zowkins.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Admin@1234"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                Remember me
              </label>
              <span className="font-semibold text-slate-500">Contact support for password resets</span>
            </div>

            {error ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {loading ? "Signing in..." : "Enter admin dashboard"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
