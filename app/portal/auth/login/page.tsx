"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, PortalEmailVerificationPending, ApiError } from "../../../../lib/zowkins-api";

type Step = "login" | "verify";

export default function PortalLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("login");

  // Login form
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof formData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestSignup, setSuggestSignup] = useState(false);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const [retryLabel, setRetryLabel] = useState<string | null>(null);

  // OTP state — kept in memory only
  const verificationRef = useRef<PortalEmailVerificationPending | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendsRemaining, setResendsRemaining] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("portalToken");
    if (token) router.push("/portal");

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const email = params.get("email");
      if (email) setFormData((prev) => ({ ...prev, email }));
    }
  }, [router]);

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = window.setInterval(() => {
      setResendCountdown((c) => { if (c <= 1) { clearInterval(id); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [resendCountdown]);

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

  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) newErrors.password = "Please enter your password";
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { setError("Please fix the errors below"); return; }

    setLoading(true);
    setError(null);
    setSuggestSignup(false);

    try {
      const response = await zowkinsApi.loginPortal({
        email: formData.email.trim(),
        password: formData.password,
      });

      // 403 requiresEmailVerification comes back as a resolved value (not thrown)
      if ("requiresEmailVerification" in response && response.requiresEmailVerification) {
        verificationRef.current = response as PortalEmailVerificationPending;
        setResendCountdown(response.resendAvailableInSeconds);
        setStep("verify");
        return;
      }

      // Normal login success
      const authResponse = response as { user: object; accessToken: string };
      localStorage.setItem("portalToken", authResponse.accessToken);
      localStorage.setItem("portalUser", JSON.stringify(authResponse.user));
      router.push("/portal");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setError(msg);
      if (err instanceof ApiError) {
        if (err.status === 429 && typeof err.retryAfter === "number") {
          setRetryUntil(Date.now() + err.retryAfter * 1000);
        }
        if (err.status === 401 && typeof msg === "string" && /no account exists/i.test(msg)) {
          setSuggestSignup(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationRef.current) return;
    if (otp.length !== 6) { setOtpError("Please enter the 6-digit code"); return; }

    setVerifying(true);
    setOtpError(null);

    try {
      const response = await zowkinsApi.verifyPortalEmail({
        verificationToken: verificationRef.current.verificationToken,
        otp,
      });
      localStorage.setItem("portalToken", response.accessToken);
      localStorage.setItem("portalUser", JSON.stringify(response.user));
      router.push("/portal");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed. Please try again.";
      if (err instanceof ApiError && err.status === 429 && typeof err.retryAfter === "number") {
        setRetryUntil(Date.now() + err.retryAfter * 1000);
      }
      if (typeof msg === "string" && /session has expired/i.test(msg)) {
        verificationRef.current = null;
        setStep("login");
        setError("Your verification session expired. Please sign in again.");
        return;
      }
      setOtpError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!verificationRef.current || resendCountdown > 0) return;
    setResending(true);
    setOtpError(null);
    try {
      const response = await zowkinsApi.resendPortalOtp({
        verificationToken: verificationRef.current.verificationToken,
      });
      setResendCountdown(response.resendAvailableInSeconds);
      setResendsRemaining(response.resendsRemaining);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not resend code.";
      if (err instanceof ApiError && err.status === 429 && typeof err.retryAfter === "number") {
        setResendCountdown(err.retryAfter);
      }
      if (typeof msg === "string" && /session has expired|too many codes/i.test(msg)) {
        verificationRef.current = null;
        setStep("login");
        setError("Too many resend attempts. Please sign in again.");
        return;
      }
      setOtpError(msg);
    } finally {
      setResending(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
      hasError ? "border-red-500" : "border-white/10 focus:border-[#f3c74d]/45"
    }`;

  if (step === "verify" && verificationRef.current) {
    const { email, expiresInMinutes } = verificationRef.current;
    return (
      <main className="mx-auto max-w-md px-4 py-12 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">Verify your email</h1>
            <p className="mt-2 text-slate-300">
              We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">Code expires in {expiresInMinutes} minutes</p>
          </div>

          {otpError && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-red-400">{otpError}</p>
            </div>
          )}

          {retryLabel && (
            <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-yellow-200">Too many attempts. Try again in {retryLabel}.</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="otp" className="mb-2 block text-sm font-medium text-white">Verification Code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(val);
                  if (otpError) setOtpError(null);
                }}
                placeholder="000000"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder:text-slate-600 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
              />
            </div>

            <button
              type="submit"
              disabled={verifying || otp.length !== 6 || Boolean(retryUntil)}
              className="w-full rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              onClick={handleResend}
              disabled={resending || resendCountdown > 0}
              className="text-sm text-[#f3c74d] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
            >
              {resending ? "Sending..." : resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : "Resend code"}
            </button>
            {resendsRemaining !== null && (
              <p className="text-xs text-slate-400">{resendsRemaining} resend{resendsRemaining !== 1 ? "s" : ""} remaining</p>
            )}
            <p className="text-sm text-slate-400">
              Wrong email?{" "}
              <button
                onClick={() => { verificationRef.current = null; setStep("login"); setOtp(""); setOtpError(null); }}
                className="text-[#f3c74d] hover:underline"
              >
                Go back
              </button>
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
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-slate-300">Sign in to your portal account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
            {suggestSignup && (
              <p className="mt-2 text-sm text-slate-300">
                <Link href={`/portal/auth/signup?email=${encodeURIComponent(formData.email)}`} className="text-[#f3c74d] hover:underline">
                  Create an account
                </Link>
              </p>
            )}
          </div>
        )}

        {retryLabel && (
          <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-yellow-200">Too many requests. Try again in {retryLabel}.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">Email Address</label>
            <input
              type="email" id="email" name="email" value={formData.email}
              onChange={(e) => { setFormData((p) => ({ ...p, email: e.target.value })); if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined })); }}
              placeholder="Enter your email"
              className={inputClass(!!fieldErrors.email)}
            />
            {fieldErrors.email && <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-white">Password</label>
            <input
              type="password" id="password" name="password" value={formData.password}
              onChange={(e) => { setFormData((p) => ({ ...p, password: e.target.value })); if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined })); }}
              placeholder="Enter your password"
              className={inputClass(!!fieldErrors.password)}
            />
            {fieldErrors.password && <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(retryUntil)}
            className="w-full rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-slate-300">
            Don&apos;t have an account?{" "}
            <Link href="/portal/auth/signup" className="text-[#f3c74d] hover:underline">Sign up</Link>
          </p>
          <p className="text-sm text-slate-300">
            <Link href="/portal/auth/reset-password" className="text-[#f3c74d] hover:underline">Forgot your password?</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
