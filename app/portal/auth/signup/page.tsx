"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  zowkinsApi,
  PortalEmailVerificationPending,
  ApiError,
} from "../../../../lib/zowkins-api";

type Step = "form" | "verify";

export default function PortalSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    dateOfBirth: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof formData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const [retryLabel, setRetryLabel] = useState<string | null>(null);

  // OTP state — kept in memory only, never in localStorage/URL
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
      const firstName = params.get("firstName");
      const lastName = params.get("lastName");
      const phoneNumber = params.get("phoneNumber");
      if (email || firstName || lastName || phoneNumber) {
        setFormData((prev) => ({
          ...prev,
          email: email ?? prev.email,
          firstName: firstName ?? prev.firstName,
          lastName: lastName ?? prev.lastName,
          phoneNumber: phoneNumber ?? prev.phoneNumber,
        }));
      }
    }
  }, [router]);

  // Resend countdown ticker
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = window.setInterval(() => {
      setResendCountdown((c) => {
        if (c <= 1) { clearInterval(id); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [resendCountdown]);

  // Rate-limit retry countdown
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof typeof formData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must include at least one letter and one number";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { setError("Please fix the errors below"); return; }

    setLoading(true);
    setError(null);

    try {
      const response = await zowkinsApi.createPortalAccount({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
      });

      verificationRef.current = response;
      setResendCountdown(response.resendAvailableInSeconds);
      setStep("verify");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Account creation failed. Please try again.";
      if (err instanceof ApiError) {
        if (err.status === 429 && typeof err.retryAfter === "number") {
          setRetryUntil(Date.now() + err.retryAfter * 1000);
        }
        if (err.status === 400) {
          const txt = msg.toLowerCase();
          if (txt.includes("email") && txt.includes("taken")) {
            setFieldErrors((prev) => ({ ...prev, email: "Email already taken" }));
            setError("An account with this email already exists. Please sign in.");
            return;
          }
        }
      }
      setError(msg);
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
      // If session expired, send back to form
      if (typeof msg === "string" && /session has expired/i.test(msg)) {
        verificationRef.current = null;
        setStep("form");
        setError("Your verification session expired. Please sign up again.");
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
      // Too many resends — send back to form
      if (typeof msg === "string" && /session has expired|too many codes/i.test(msg)) {
        verificationRef.current = null;
        setStep("form");
        setError("Too many resend attempts. Please sign up again.");
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
            <h1 className="text-3xl font-bold text-white">Check your email</h1>
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
              <label htmlFor="otp" className="mb-2 block text-sm font-medium text-white">
                Verification Code
              </label>
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
              {resending
                ? "Sending..."
                : resendCountdown > 0
                ? `Resend code in ${resendCountdown}s`
                : "Resend code"}
            </button>
            {resendsRemaining !== null && (
              <p className="text-xs text-slate-400">{resendsRemaining} resend{resendsRemaining !== 1 ? "s" : ""} remaining</p>
            )}
            <p className="text-sm text-slate-400">
              Wrong email?{" "}
              <button
                onClick={() => { verificationRef.current = null; setStep("form"); setOtp(""); setOtpError(null); }}
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
    <main className="mx-auto max-w-2xl px-4 py-12 md:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-slate-300">Join the Zowkins portal community</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {retryLabel && (
          <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-yellow-200">Too many requests. Try again in {retryLabel}.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-white">First Name *</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter your first name" className={inputClass(!!fieldErrors.firstName)} />
              {fieldErrors.firstName && <p className="mt-1 text-sm text-red-400">{fieldErrors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-white">Last Name *</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter your last name" className={inputClass(!!fieldErrors.lastName)} />
              {fieldErrors.lastName && <p className="mt-1 text-sm text-red-400">{fieldErrors.lastName}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">Email Address *</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" className={inputClass(!!fieldErrors.email)} />
            {fieldErrors.email && (
              <div>
                <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
                {fieldErrors.email === "Email already taken" && (
                  <p className="mt-1 text-sm text-yellow-300">
                    Already registered?{" "}
                    <Link href={`/portal/auth/login?email=${encodeURIComponent(formData.email)}`} className="text-[#f3c74d] hover:underline">Sign in</Link>
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-white">Phone Number *</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Enter your phone number" className={inputClass(!!fieldErrors.phoneNumber)} />
            {fieldErrors.phoneNumber && <p className="mt-1 text-sm text-red-400">{fieldErrors.phoneNumber}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="gender" className="mb-2 block text-sm font-medium text-white">Gender *</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="w-full rounded-lg border border-white/10 bg-[#0a1020] px-4 py-3 text-white focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20" required>
                <option value="male" className="bg-[#0a1020]">Male</option>
                <option value="female" className="bg-[#0a1020]">Female</option>
                <option value="other" className="bg-[#0a1020]">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium text-white">Date of Birth</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-white">Password *</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Min. 8 characters, include a letter and number" className={inputClass(!!fieldErrors.password)} />
            {fieldErrors.password && <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white">Confirm Password *</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repeat your password" className={inputClass(!!fieldErrors.confirmPassword)} />
            {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-400">{fieldErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(retryUntil)}
            className="w-full rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-300">
            Already have an account?{" "}
            <Link href="/portal/auth/login" className="text-[#f3c74d] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
