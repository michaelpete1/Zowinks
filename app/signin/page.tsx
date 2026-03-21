"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ADMIN_CREDENTIALS, useAdminSession } from "../../hooks/useAdminSession";

export default function SignInPage() {
  const router = useRouter();
  const { signInAdmin, signInCustomer } = useAdminSession();
  const [accountType, setAccountType] = useState<"customer" | "admin">("customer");
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

    if (accountType === "admin") {
      const isAdminEmail = normalizedEmail === ADMIN_CREDENTIALS.email;
      const isAdminPassword = trimmedPassword === ADMIN_CREDENTIALS.password;

      if (!isAdminEmail || !isAdminPassword) {
        setLoading(false);
        setError("Use the admin credentials to access the admin dashboard.");
        return;
      }

      signInAdmin("Admin", ADMIN_CREDENTIALS.email);
      router.push("/admin");
      return;
    }

    signInCustomer(normalizedEmail.split("@")[0] || "Customer", normalizedEmail);
    router.push("/");
    setLoading(false);
  };

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
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Sign in to manage orders, quotes, and admin tools.
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-600 md:text-base">
              Use customer access for shopping and account history. Use admin access to manage products, orders, and customer inquiries.
            </p>

            <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 px-5 py-4 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Customer dashboard</span>
                <span className="text-xs uppercase tracking-[0.25em] text-cyan-700">Store</span>
              </div>
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
            Enter your details to continue.
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setAccountType("customer")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${accountType === "customer" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setAccountType("admin")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${accountType === "admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Admin
            </button>
          </div>

          {accountType === "admin" ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Admin credentials: <span className="font-semibold">{ADMIN_CREDENTIALS.email}</span> / <span className="font-semibold">{ADMIN_CREDENTIALS.password}</span>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Customer login continues to the store homepage.
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={accountType === "admin" ? "admin@zowkins.com" : "you@company.com"}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={accountType === "admin" ? "Admin@1234" : "Your password"}
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

            {error ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {loading ? "Signing in..." : accountType === "admin" ? "Enter admin dashboard" : "Sign in"}
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
