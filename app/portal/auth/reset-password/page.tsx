"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, ApiError } from "../../../../lib/zowkins-api";

type Step = "request" | "set";

export default function PortalResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");

  // Request reset
  const [email, setEmail] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const [retryLabel, setRetryLabel] = useState<string | null>(null);

  // Set new password
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setting, setSetting] = useState(false);
  const [setError, setSetError] = useState<string | null>(null);

  // Read ?token= from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      setStep("set");
    }
  }, []);

  // Rate-limit countdown
  useEffect(() => {
    if (!retryUntil) { setRetryLabel(null); return; }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
      if (remaining <= 0) { setRetryLabel(null); setRetryUntil(null); return; }
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setRetryLabel(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [retryUntil]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setRequestError("Please enter your email address"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setRequestError("Please enter a valid email address"); return; }

    setRequesting(true);
    setRequestError(null);

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zowkins.vercel.app";
      await zowkinsApi.resetPortalPassword({
        email: email.trim(),
        redirectUrl: `${siteUrl}/portal/reset-password`,
      });
      setRequestSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email. Please try again.";
      if (err instanceof ApiError && err.status === 429 && typeof err.retryAfter === "number") {
        setRetryUntil(Date.now() + err.retryAfter * 1000);
      }
      setRequestError(msg);
    } finally {
      setRequesting(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) { setSetError("Reset token is missing. Please use the link from your email."); return; }
    if (!newPassword) { setSetError("Please enter a new password"); return; }
    if (newPassword.length < 8) { setSetError("Password must be at least 8 characters"); return; }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setSetError("Password must include at least one letter and one number");
      return;
    }
    if (newPassword !== confirmPassword) { setSetError("Passwords do not match"); return; }

    setSetting(true);
    setSetError(null);

    try {
      const response = await zowkinsApi.setNewPortalPassword(token.trim(), { password: newPassword });
      localStorage.setItem("portalToken", response.accessToken);
      localStorage.setItem("portalUser", JSON.stringify(response.user));
      router.push("/portal");
    } catch (err) {
      setSetError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setSetting(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20";

  if (step === "set") {
    return (
      <main className="mx-auto max-w-md px-4 py-12 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">Set New Password</h1>
            <p className="mt-2 text-slate-300">Enter your new password below</p>
          </div>

          {setError && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-red-400">{setError}</p>
            </div>
          )}

          <form onSubmit={handleSetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-white">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters, include a letter and number"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={setting}
              className="w-full rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {setting ? "Saving..." : "Set New Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-300">
              <Link href="/portal/auth/login" className="text-[#f3c74d] hover:underline">Back to sign in</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12 md:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="mt-2 text-slate-300">Enter your email to receive a password reset link</p>
        </div>

        {requestError && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{requestError}</p>
          </div>
        )}

        {requestSuccess && (
          <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-green-400">Password reset email sent! Please check your inbox.</p>
          </div>
        )}

        {retryLabel && (
          <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-yellow-200">Too many requests. Try again in {retryLabel}.</p>
          </div>
        )}

        <form onSubmit={handleRequest} className="space-y-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (requestError) setRequestError(null); }}
              placeholder="Enter your email address"
              className={inputClass}
              required
            />
          </div>
          <button
            type="submit"
            disabled={requesting || Boolean(retryUntil) || requestSuccess}
            className="w-full rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {requesting ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-slate-300">
            Remember your password?{" "}
            <Link href="/portal/auth/login" className="text-[#f3c74d] hover:underline">Sign in</Link>
          </p>
          <p className="text-sm text-slate-300">
            Don&apos;t have an account?{" "}
            <Link href="/portal/auth/signup" className="text-[#f3c74d] hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
