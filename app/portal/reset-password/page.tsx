"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, ApiError } from "../../../lib/zowkins-api";

export default function PortalResetPasswordTokenPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setting, setSetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
    else setTokenMissing(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) { setError("Please enter a new password"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must include at least one letter and one number");
      return;
    }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }

    setSetting(true);
    try {
      const response = await zowkinsApi.setNewPortalPassword(token, { password: newPassword });
      localStorage.setItem("portalToken", response.accessToken);
      localStorage.setItem("portalUser", JSON.stringify(response.user));
      setSuccess(true);
      setTimeout(() => router.push("/portal"), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? "This reset link has expired or already been used. Please request a new one."
          : err instanceof Error ? err.message : "Failed to reset password. Please try again."
      );
    } finally {
      setSetting(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 transition duration-200";

  if (tokenMissing) {
    return (
      <main className="relative min-h-screen bg-[#07142a] flex items-center justify-center px-4 overflow-hidden">
        {/* background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#f3c74d]/5 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#f3c74d]/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite_1s]" />
        </div>
        <div className="relative w-full max-w-md animate-nav-slide-down rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-white">Invalid Reset Link</h1>
          <p className="mt-2 text-slate-300">This password reset link is missing a token. Please request a new one.</p>
          <Link
            href="/portal/auth/reset-password"
            className="mt-6 inline-block rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] hover:-translate-y-0.5 active:scale-95"
          >
            Request New Reset Email
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#07142a] flex items-center justify-center px-4 overflow-hidden">
      {/* animated background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#f3c74d]/6 blur-3xl animate-[pulse_7s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-[#f3c74d]/4 blur-3xl animate-[pulse_9s_ease-in-out_infinite_2s]" />
        <div className="absolute -bottom-40 left-1/3 h-[350px] w-[350px] rounded-full bg-blue-500/4 blur-3xl animate-[pulse_11s_ease-in-out_infinite_1s]" />
      </div>

      <div
        className={`relative w-full max-w-md transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">

          {success ? (
            /* ── success state ── */
            <div className="py-4 text-center animate-nav-slide-down">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 ring-4 ring-green-500/20">
                <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Password Updated!</h2>
              <p className="mt-2 text-slate-300">Redirecting you to your portal...</p>
              <div className="mt-5 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-[#f3c74d] animate-[pulse_1s_ease-in-out_infinite]"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* header */}
              <div
                className={`mb-8 text-center transition-all duration-500 delay-100 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3c74d]/10 ring-1 ring-[#f3c74d]/20">
                  <svg className="h-7 w-7 text-[#f3c74d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white">Set New Password</h1>
                <p className="mt-2 text-slate-300">Choose a new password for your account</p>
              </div>

              {/* error */}
              {error && (
                <div className="mb-6 animate-nav-slide-down rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-red-400">{error}</p>
                  {error.includes("expired") && (
                    <Link href="/portal/auth/reset-password" className="mt-2 inline-block text-sm text-[#f3c74d] hover:underline">
                      Request a new reset email →
                    </Link>
                  )}
                </div>
              )}

              {/* form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div
                  className={`transition-all duration-500 delay-200 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-white">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters, include a letter and number"
                    className={inputClass}
                  />
                </div>

                <div
                  className={`transition-all duration-500 delay-300 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className={inputClass}
                  />
                </div>

                <div
                  className={`transition-all duration-500 delay-[400ms] ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <button
                    type="submit"
                    disabled={setting || !token}
                    className="relative w-full overflow-hidden rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition duration-200 hover:bg-[#e4b935] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(243,199,77,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {setting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Saving...
                      </span>
                    ) : "Set New Password"}
                  </button>
                </div>
              </form>

              <div
                className={`mt-6 text-center transition-all duration-500 delay-500 ${
                  mounted ? "opacity-100" : "opacity-0"
                }`}
              >
                <Link href="/portal/auth/login" className="text-sm text-[#f3c74d] hover:underline">
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
