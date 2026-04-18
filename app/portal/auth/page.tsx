"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../../components/NewNavbar";
import {
  ApiError,
  PortalAuthResponse,
  PortalUser,
  zowkinsApi,
} from "../../../lib/zowkins-api";

const TOKEN_KEY = "zowkins-portal-token";

export default function PortalAuthPage() {
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<PortalUser | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    gender: "male",
  });
  const [resetForm, setResetForm] = useState({ email: "" });
  const [setNewPasswordForm, setSetNewPasswordForm] = useState({ token: "", password: "" });

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_KEY);
    if (savedToken) setToken(savedToken);
  }, []);

  const syncAuth = async (response: PortalAuthResponse) => {
    setToken(response.accessToken);
    window.localStorage.setItem(TOKEN_KEY, response.accessToken);
    setProfile(response.user);
  };

  const loadProfile = async (accessToken: string) => {
    setLoading(true);
    try {
      const data = await zowkinsApi.getPortalMe(accessToken);
      setProfile(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token.trim()) {
      void loadProfile(token.trim());
    }
  }, [token]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await zowkinsApi.loginPortal({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });
      await syncAuth(response);
      setMessage("Logged in successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    }
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await zowkinsApi.createPortalAccount({
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        phoneNumber: createForm.phoneNumber.trim(),
        password: createForm.password,
        gender: createForm.gender,
      });
      await syncAuth(response);
      setMessage("Account created successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Account creation failed.");
    }
  };

  const handleRefreshTokens = async () => {
    setError("");
    setMessage("");

    try {
      const response = await zowkinsApi.refreshPortalTokens();
      setToken(response.accessToken);
      window.localStorage.setItem(TOKEN_KEY, response.accessToken);
      setMessage("Tokens refreshed successfully.");
      await loadProfile(response.accessToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Token refresh failed.");
    }
  };

  const handleLogout = async () => {
    setError("");
    setMessage("");

    try {
      await zowkinsApi.logoutPortal();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Logout failed.");
    } finally {
      setToken("");
      setProfile(null);
      window.localStorage.removeItem(TOKEN_KEY);
      setMessage("Logged out.");
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await zowkinsApi.resetPortalPassword({ email: resetForm.email.trim() });
      setMessage("Password reset email sent.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Password reset failed.");
    }
  };

  const handleSetNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await zowkinsApi.setNewPortalPassword(setNewPasswordForm.token.trim(), {
        password: setNewPasswordForm.password,
      });
      await syncAuth(response);
      setMessage("Password reset successful.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not set new password.");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">Portal auth</p>
              <h1 className="mt-2 font-display text-4xl font-bold text-white md:text-5xl">Sign in and manage your account</h1>
            </div>
            <Link href="/portal" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
              Back to portal
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white">
              {loading ? "Loading..." : profile ? "Profile loaded" : "No profile loaded"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white">
              Token stored locally
            </span>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Access token"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            />
            <div className="flex gap-3">
              <button type="button" onClick={handleRefreshTokens} className="rounded-2xl bg-[#f3c74d] px-5 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]">
                Refresh tokens
              </button>
              <button type="button" onClick={handleLogout} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-rose-400/45 hover:bg-white/10">
                Logout
              </button>
            </div>
          </div>

          {error ? <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
          {message ? <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{message}</p> : null}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleLogin} className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-8">
            <h2 className="font-display text-2xl font-semibold text-white">Login</h2>
            <div className="mt-5 space-y-4">
              <input value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <input value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <button type="submit" className="w-full rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]">
                Login
              </button>
            </div>
          </form>

          <form onSubmit={handleCreateAccount} className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-8">
            <h2 className="font-display text-2xl font-semibold text-white">Create account</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input value={createForm.firstName} onChange={(event) => setCreateForm((current) => ({ ...current, firstName: event.target.value }))} placeholder="First name" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <input value={createForm.lastName} onChange={(event) => setCreateForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Last name" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <input value={createForm.email} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none md:col-span-2" />
              <input value={createForm.phoneNumber} onChange={(event) => setCreateForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder="Phone number" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <select value={createForm.gender} onChange={(event) => setCreateForm((current) => ({ ...current, gender: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input value={createForm.password} onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" type="password" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none md:col-span-2" />
              <button type="submit" className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] md:col-span-2">
                Create account
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleResetPassword} className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-8">
            <h2 className="font-display text-2xl font-semibold text-white">Reset password</h2>
            <div className="mt-5 space-y-4">
              <input value={resetForm.email} onChange={(event) => setResetForm({ email: event.target.value })} placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <button type="submit" className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
                Send reset email
              </button>
            </div>
          </form>

          <form onSubmit={handleSetNewPassword} className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-8">
            <h2 className="font-display text-2xl font-semibold text-white">Set new password</h2>
            <div className="mt-5 space-y-4">
              <input value={setNewPasswordForm.token} onChange={(event) => setSetNewPasswordForm((current) => ({ ...current, token: event.target.value }))} placeholder="Reset token" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <input value={setNewPasswordForm.password} onChange={(event) => setSetNewPasswordForm((current) => ({ ...current, password: event.target.value }))} placeholder="New password" type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              <button type="submit" className="w-full rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]">
                Update password
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
