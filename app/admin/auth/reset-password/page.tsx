"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminSession } from "../../../../hooks/useAdminSession";
import { ApiError, zowkinsApi } from "../../../../lib/zowkins-api";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

function persistAuth(
  sessionTools: ReturnType<typeof useAdminSession>,
  accessToken: string,
  user: { id: string; firstName: string; lastName: string; email: string },
) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, accessToken);
  }

  sessionTools.signInAdmin(
    `${user.firstName} ${user.lastName}`.trim() || "Admin",
    user.email,
    accessToken,
    user.id,
  );
}

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const sessionTools = useAdminSession();
  const [resetEmail, setResetEmail] = useState("");
  const [newPasswordToken, setNewPasswordToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = window.localStorage.getItem(ADMIN_API_TOKEN_KEY);
    if (!storedToken) return;
    setSessionMessage("A token is already stored locally.");
  }, []);

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!resetEmail.trim()) {
      setError("Enter the email address to reset.");
      return;
    }

    setResetting(true);
    try {
      await zowkinsApi.resetAdminPassword({ email: resetEmail.trim() });
      setMessage("Password reset email sent.");
    } catch (err: unknown) {
      setError(
        err instanceof ApiError ? err.message : "Could not send reset email.",
      );
    } finally {
      setResetting(false);
    }
  };

  const handleSetNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!newPasswordToken.trim() || !newPassword.trim()) {
      setError("Enter the reset token and a new password.");
      return;
    }

    setSettingPassword(true);
    try {
      const response = await zowkinsApi.setNewAdminPassword(
        newPasswordToken.trim(),
        {
          password: newPassword,
        },
      );
      persistAuth(sessionTools, response.accessToken, response.user);
      setMessage("Password reset successful.");
      router.push("/admin");
    } catch (err: unknown) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not set the new password.",
      );
    } finally {
      setSettingPassword(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc,_#eef2ff)] text-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link
          href="/signin"
          className="flex items-center"
          aria-label="Back to sign in"
        >
          <Image
            src="/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png"
            alt="Zowkins logo"
            width={180}
            height={68}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>
        <Link
          href="/signin"
          className="text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          Back to sign in
        </Link>
      </div>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:pb-16 lg:pt-10">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:p-10">
          <div className="h-2 bg-[linear-gradient(90deg,#be185d_0%,#0a2a78_100%)]" />
          <div className="space-y-6 p-8 lg:p-0 lg:pt-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600">
              Password recovery
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Reset an admin password.
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-600 md:text-base">
              Use this page to request a reset email and to complete the reset
              with the token from the backend flow.
            </p>

            {sessionMessage ? (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                {sessionMessage}
              </div>
            ) : null}

            <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 px-5 py-4 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Flow</span>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Email + token
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Route</span>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  /admin/auth/reset-password
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Request reset
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold text-slate-900">
              Send reset email
            </h2>
            <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
              <input
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                type="email"
                placeholder="Admin email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={resetting}
                className="w-full rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetting ? "Sending..." : "Send password reset"}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Complete reset
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold text-slate-900">
              Set a new password
            </h2>
            <form className="mt-6 space-y-4" onSubmit={handleSetNewPassword}>
              <input
                value={newPasswordToken}
                onChange={(event) => setNewPasswordToken(event.target.value)}
                placeholder="Reset token"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-500 focus:bg-white"
              />
              <input
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                placeholder="New password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-500 focus:bg-white"
              />
              {error ? (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={settingPassword}
                className="w-full rounded-2xl bg-[#0a2a78] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {settingPassword ? "Updating..." : "Set new password"}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
