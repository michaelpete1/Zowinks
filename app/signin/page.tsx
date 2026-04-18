"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminSession } from "../../hooks/useAdminSession";
import { ApiError, zowkinsApi } from "../../lib/zowkins-api";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type LoginForm = {
  email: string;
  password: string;
};

const emptyLogin: LoginForm = {
  email: "",
  password: "",
};

function persistAuth(
  sessionTools: ReturnType<typeof useAdminSession>,
  accessToken: string,
  user: { id: string; firstName: string; lastName: string; email: string },
) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, accessToken);
  }

  sessionTools.signInAdmin(`${user.firstName} ${user.lastName}`.trim() || "Admin", user.email, accessToken, user.id);
}

export default function SignInPage() {
  const router = useRouter();
  const sessionTools = useAdminSession();
  const { session, clearSession } = sessionTools;
  const [loginForm, setLoginForm] = useState<LoginForm>(emptyLogin);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = window.localStorage.getItem(ADMIN_API_TOKEN_KEY);
    if (!storedToken || session?.accessToken) return;
    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, storedToken);
  }, [session?.accessToken]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError("Enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await zowkinsApi.loginAdmin({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
      persistAuth(sessionTools, response.accessToken, response.user);
      setMessage("Signed in successfully.");
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setMessage("");
    setLoggingOut(true);

    try {
      await zowkinsApi.logoutAdmin();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not log out cleanly.");
    } finally {
      clearSession();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
      }
      setLoggingOut(false);
      router.push("/signin");
    }
  };

  const tokenStatus = session?.accessToken ? "Available" : "Not set";

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
              Sign in to the admin dashboard.
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-600 md:text-base">
              Use this page only for admin login. Account creation and password recovery now live on their own pages so the flow stays clear.
            </p>

            <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 px-5 py-4 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Current session</span>
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-700">{session?.email ?? "None"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Stored token</span>
                <span className="text-xs uppercase tracking-[0.25em] text-amber-600">{tokenStatus}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/admin/auth/create-account" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Create admin account
              </Link>
              <Link href="/admin/auth/reset-password" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                Reset password
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Welcome back</p>
            <h2 className="mt-4 font-display text-3xl font-bold text-slate-900">Sign in</h2>
            <form className="mt-6 space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="admin@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="password123"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </div>
              {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
              {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                {loading ? "Signing in..." : "Enter admin dashboard"}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Quick actions</p>
            <h2 className="mt-4 font-display text-2xl font-bold text-slate-900">Access options</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/admin/auth/create-account" className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white">
                Create a new admin account
              </Link>
              <Link href="/admin/auth/reset-password" className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white">
                Send or complete a password reset
              </Link>
              <button onClick={handleLogout} disabled={loggingOut} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                {loggingOut ? "Logging out..." : "Clear current session"}
              </button>
              <Link href="/" className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white">
                Back to storefront
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
