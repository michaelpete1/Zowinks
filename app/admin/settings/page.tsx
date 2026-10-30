"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminShell } from "../../../components/AdminShell";
import { useAdminSession } from "../../../hooks/useAdminSession";
import {
  AdminOrderStats,
  AdminUserProfile,
  ApiError,
  zowkinsApi,
} from "../../../lib/zowkins-api";
import { resolveImageSource } from "../../../lib/media";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

function defaultProfile(): AdminUserProfile {
  return {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    status: "",
    role: "admin",
    gender: "",
    phoneNumber: "",
    avatar: null,
    createdAt: "",
    updatedAt: "",
  };
}

function defaultOrderStats(): AdminOrderStats {
  return {
    totalOrders: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
    inTransit: 0,
    totalRevenue: 0,
  };
}

type ApiConnection = {
  userId: string;
  accessToken: string;
};

const normalizeToken = (value: string) =>
  value.trim().replace(/^Bearer\s+/i, "");

export default function AdminSettingsPage() {
  const { session } = useAdminSession();
  const [profile, setProfile] = useState<AdminUserProfile>(defaultProfile());
  const [orderStats, setOrderStats] = useState<AdminOrderStats>(defaultOrderStats());
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    phoneNumber: "",
    dateOfBirth: "",
    files: [] as File[],
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    userId: "",
    accessToken: "",
  });
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [connectionMessage, setConnectionMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [connectionSaving, setConnectionSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "orders">("profile");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionToken = normalizeToken(session?.accessToken ?? "");
    const storedToken = normalizeToken(window.localStorage.getItem(ADMIN_API_TOKEN_KEY) ?? "");
    const nextToken = sessionToken || storedToken;
    setApiConnection({ userId: session?.id ?? "", accessToken: nextToken });
    if (sessionToken && sessionToken !== storedToken) {
      window.localStorage.setItem(ADMIN_API_TOKEN_KEY, sessionToken);
    }
    setReady(true);
  }, [session?.accessToken, session?.id]);

  useEffect(() => {
    if (preview.startsWith("blob:")) {
      return () => URL.revokeObjectURL(preview);
    }
    return undefined;
  }, [preview]);

  useEffect(() => {
    if (!ready || !apiConnection.userId.trim() || !apiConnection.accessToken.trim()) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      zowkinsApi.getAdminUser(apiConnection.userId.trim(), apiConnection.accessToken.trim()),
      zowkinsApi.getAdminOrderStats(apiConnection.accessToken.trim()),
    ])
      .then(([data, stats]) => {
        if (cancelled) return;
        setProfile(data);
        setOrderStats(stats.stats);
        setProfileForm({ firstName: data.firstName ?? "", lastName: data.lastName ?? "", gender: data.gender ?? "", phoneNumber: data.phoneNumber ?? "", dateOfBirth: "", files: [] });
        setPreview(data.avatar?.url ?? "");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load admin profile and order stats.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [apiConnection.accessToken, apiConnection.userId, ready]);

  const apiReady = Boolean(apiConnection.userId.trim() && apiConnection.accessToken.trim());

  const handleConnectionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConnectionSaving(true);
    setConnectionMessage("");
    setError("");
    try {
      const nextConnection = { userId: apiConnection.userId.trim(), accessToken: normalizeToken(apiConnection.accessToken) };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ADMIN_API_TOKEN_KEY, nextConnection.accessToken);
      }
      setApiConnection(nextConnection);
      setConnectionMessage("Admin API connection saved. Loading profile...");
      const [data, stats] = await Promise.all([
        zowkinsApi.getAdminUser(nextConnection.userId, nextConnection.accessToken),
        zowkinsApi.getAdminOrderStats(nextConnection.accessToken),
      ]);
      setProfile(data);
      setOrderStats(stats.stats);
      setProfileForm({ firstName: data.firstName ?? "", lastName: data.lastName ?? "", gender: data.gender ?? "", phoneNumber: data.phoneNumber ?? "", dateOfBirth: "", files: [] });
      setPreview(data.avatar?.url ?? "");
      setConnectionMessage("Admin profile loaded successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load admin profile and order stats.");
    } finally { setConnectionSaving(false); }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileForm((c) => ({ ...c, files: [file] }));
    setPreview((c) => {
      if (c.startsWith("blob:")) URL.revokeObjectURL(c);
      return URL.createObjectURL(file);
    });
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady) { setError("Add a real admin user ID and access token to update this profile."); return; }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await zowkinsApi.updateAdminMe(apiConnection.accessToken.trim(), {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        gender: profileForm.gender.trim(),
        phoneNumber: profileForm.phoneNumber.trim(),
        dateOfBirth: profileForm.dateOfBirth,
        files: profileForm.files,
      });
      setProfile(updated);
      setPreview(updated.avatar?.url ?? preview);
      setMessage("Admin profile updated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update admin profile.");
    } finally { setSaving(false); }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady) { setError("Add a real admin user ID and access token to update this password."); return; }
    setPasswordSaving(true);
    setError("");
    setMessage("");
    try {
      await zowkinsApi.updateAdminPassword(apiConnection.accessToken.trim(), passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("Admin password updated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update admin password.");
    } finally { setPasswordSaving(false); }
  };

  const inputClass = (errors: boolean) =>
    `w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white ${errors ? "border-rose-500 focus:border-rose-600" : "border-slate-200 focus:border-[#0a2a78]"}`;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

  return (
    <AdminShell title="Settings" subtitle="Manage your admin profile, security, and order stats.">

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0a2a78_0%,#12386a_60%,#1a4a8a_100%)] text-white shadow-[0_8px_32px_rgba(10,42,120,0.28)]">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #f3c74d 0%, transparent 60%)" }} />
        <div className="relative grid gap-0 lg:grid-cols-[1fr_280px]">
          <div className="px-6 py-8 md:px-8 md:py-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-300">Admin profile</p>
            <h2 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">
              {session?.name ? `Welcome back, ${session.name.split(" ")[0]}` : "Your admin account"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{session?.email ?? "Manage your profile, security, and view live order data."}</p>

            {/* Stat chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { label: "Session", value: session?.name ?? "Admin" },
                { label: "API", value: apiReady ? "Connected" : "Not connected" },
                { label: "Status", value: loading ? "Loading…" : "Ready" },
              ].map((chip) => (
                <div key={chip.label} className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-cyan-200">{chip.label}</p>
                  <p className="mt-0.5 text-xs font-semibold text-white">{chip.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/team"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0a2a78] shadow transition hover:bg-slate-100"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M17 11a4 4 0 1 0 0-8"/></svg>
                Invite team member
              </Link>
              <Link
                href="/admin/settings/app"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                App settings
              </Link>
            </div>
          </div>

          {/* Avatar */}
          <div className="relative hidden min-h-[200px] lg:block">
            <Image
              src={resolveImageSource(preview || "/desktop.jpg")}
              alt="Admin avatar preview"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,42,120,0.6),rgba(10,42,120,0.1))]" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/40 px-3 py-2 backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-300">Avatar preview</p>
              <p className="mt-1 text-xs text-slate-200">Upload a new photo in the profile form.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="mt-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {(["profile", "security", "orders"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
              activeTab === tab
                ? "bg-[#0a2a78] text-white shadow-[0_2px_10px_rgba(10,42,120,0.3)]"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            {tab === "profile" ? "Profile" : tab === "security" ? "Security" : "Order Stats"}
          </button>
        ))}
      </div>

      {/* ── Global alerts ───────────────────────────────────────── */}
      {error   ? <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span className="mt-0.5 shrink-0">⚠</span>{error}</div> : null}
      {message ? <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><span className="mt-0.5 shrink-0">✓</span>{message}</div> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* ── Left column: tab content ────────────────────────── */}
        <div className="space-y-5">
          {activeTab === "profile" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Profile details</p>
                <h3 className="mt-1 font-display text-lg font-bold text-slate-900">Edit admin profile</h3>
              </div>
              <form onSubmit={handleProfileSubmit} className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">First name</label>
                  <input value={profileForm.firstName} onChange={(e) => setProfileForm((c) => ({ ...c, firstName: e.target.value }))} placeholder="First name" className={inputClass(false)} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Last name</label>
                  <input value={profileForm.lastName} onChange={(e) => setProfileForm((c) => ({ ...c, lastName: e.target.value }))} placeholder="Last name" className={inputClass(false)} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Gender</label>
                  <input value={profileForm.gender} onChange={(e) => setProfileForm((c) => ({ ...c, gender: e.target.value }))} placeholder="e.g. male / female" className={inputClass(false)} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Phone number</label>
                  <input value={profileForm.phoneNumber} onChange={(e) => setProfileForm((c) => ({ ...c, phoneNumber: e.target.value }))} placeholder="Phone number" className={inputClass(false)} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Date of birth</label>
                  <input value={profileForm.dateOfBirth} onChange={(e) => setProfileForm((c) => ({ ...c, dateOfBirth: e.target.value }))} type="date" className={inputClass(false)} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Avatar image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold hover:border-[#0a2a78]" />
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <button type="submit" disabled={saving || !apiReady} className="rounded-xl bg-[#0a2a78] px-5 py-2.5 text-sm font-bold text-white shadow-[0_2px_10px_rgba(10,42,120,0.25)] transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Saving…" : "Save profile"}
                  </button>
                  {!apiReady && <p className="text-xs text-slate-400">API connection required</p>}
                </div>
              </form>
            </div>
          )}

          {(activeTab === "profile" || activeTab === "security") && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Security</p>
                <h3 className="mt-1 font-display text-lg font-bold text-slate-900">Change password</h3>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 px-6 py-5">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Current password</label>
                  <input value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((c) => ({ ...c, currentPassword: e.target.value }))} type="password" placeholder="••••••••" className={inputClass(false)} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">New password</label>
                  <input value={passwordForm.newPassword} onChange={(e) => setPasswordForm((c) => ({ ...c, newPassword: e.target.value }))} type="password" placeholder="••••••••" className={inputClass(false)} />
                </div>
                <button type="submit" disabled={passwordSaving || !apiReady} className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {passwordSaving ? "Updating…" : "Update password"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Live data</p>
                <h3 className="mt-1 font-display text-lg font-bold text-slate-900">Order statistics</h3>
                <p className="mt-1 text-xs text-slate-500">Pulled from <code className="rounded bg-slate-100 px-1 py-0.5">/admin/orders/stats</code></p>
              </div>
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-6 py-8 text-sm text-slate-400">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Loading stats…
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-6 py-5 sm:grid-cols-3">
                  {[
                    { label: "Total orders",  value: orderStats.totalOrders, color: "bg-[#0a2a78]/8 text-[#0a2a78]" },
                    { label: "Processing",    value: orderStats.processing,  color: "bg-amber-50 text-amber-700" },
                    { label: "In transit",    value: orderStats.inTransit,   color: "bg-sky-50 text-sky-700" },
                    { label: "Delivered",     value: orderStats.delivered,   color: "bg-emerald-50 text-emerald-700" },
                    { label: "Cancelled",     value: orderStats.cancelled,   color: "bg-rose-50 text-rose-700" },
                    { label: "Revenue",       value: formatCurrency(orderStats.totalRevenue), color: "bg-slate-50 text-slate-900" },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">{stat.label}</p>
                      <p className="mt-2 text-xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right column: API connection + website settings ── */}
        <div className="space-y-5">
          {/* API connection */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">API connection</p>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900">Admin session token</h3>
            </div>
            <form onSubmit={handleConnectionSubmit} className="space-y-3 px-5 py-4">
              <input
                value={apiConnection.accessToken}
                onChange={(e) => setApiConnection((c) => ({ ...c, accessToken: e.target.value }))}
                placeholder="Paste Bearer token…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <button type="submit" disabled={connectionSaving} className="w-full rounded-xl bg-[#0a2a78] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:opacity-60">
                {connectionSaving ? "Connecting…" : "Connect"}
              </button>
              <div className={`rounded-lg px-3 py-2 text-xs font-medium ${session?.accessToken ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                Status: {session?.accessToken ? "✓ Connected via session" : "Not connected"}
              </div>
              {connectionMessage ? <p className="text-xs text-slate-500">{connectionMessage}</p> : null}
            </form>
          </div>

          {/* Website settings */}
          <div className="rounded-2xl border border-[#0a2a78]/15 bg-[#0a2a78]/4 shadow-sm">
            <div className="border-b border-[#0a2a78]/10 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#0a2a78]/70">Website</p>
              <h3 className="mt-1 font-display text-base font-bold text-slate-900">App settings</h3>
              <p className="mt-1 text-xs text-slate-500">Edit hero images, logo, contact info, and more.</p>
            </div>
            <div className="space-y-2 px-5 py-4">
              <Link href="/admin/settings/app" className="flex items-center gap-3 rounded-xl bg-[#0a2a78] px-4 py-3 text-sm font-bold text-white shadow-[0_2px_10px_rgba(10,42,120,0.25)] transition hover:bg-[#12386a]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16l4-4-4-4M12 20h8"/></svg>
                Open hero image editor
              </Link>
              <Link href="/admin/settings/app" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4"/></svg>
                Edit website settings
              </Link>
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}
