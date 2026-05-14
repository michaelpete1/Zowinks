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
  const [, setProfile] = useState<AdminUserProfile>(defaultProfile());
  const [orderStats, setOrderStats] =
    useState<AdminOrderStats>(defaultOrderStats());
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sessionToken = normalizeToken(session?.accessToken ?? "");
    const storedToken = normalizeToken(
      window.localStorage.getItem(ADMIN_API_TOKEN_KEY) ?? "",
    );
    const nextToken = sessionToken || storedToken;

    setApiConnection({
      userId: session?.id ?? "",
      accessToken: nextToken,
    });

    if (sessionToken && sessionToken !== storedToken) {
      window.localStorage.setItem(ADMIN_API_TOKEN_KEY, sessionToken);
    }

    setReady(true);
  }, [session?.accessToken, session?.id]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (
      !ready ||
      !apiConnection.userId.trim() ||
      !apiConnection.accessToken.trim()
    ) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      zowkinsApi.getAdminUser(
        apiConnection.userId.trim(),
        apiConnection.accessToken.trim(),
      ),
      zowkinsApi.getAdminOrderStats(apiConnection.accessToken.trim()),
    ])
      .then(([data, stats]) => {
        if (cancelled) return;

        setProfile(data);
        setOrderStats(stats.stats);
        setProfileForm({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          gender: data.gender ?? "",
          phoneNumber: data.phoneNumber ?? "",
          dateOfBirth: "",
          files: [],
        });
        setPreview(data.avatar?.url ?? "");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load admin profile and order stats.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiConnection.accessToken, apiConnection.userId, ready]);

  const apiReady = Boolean(
    apiConnection.userId.trim() && apiConnection.accessToken.trim(),
  );

  const handleConnectionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConnectionSaving(true);
    setConnectionMessage("");
    setError("");

    try {
      const nextConnection = {
        userId: apiConnection.userId.trim(),
        accessToken: normalizeToken(apiConnection.accessToken),
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          ADMIN_API_TOKEN_KEY,
          nextConnection.accessToken,
        );
      }

      setApiConnection(nextConnection);
      setConnectionMessage("Admin API connection saved. Loading profile...");

      const [data, stats] = await Promise.all([
        zowkinsApi.getAdminUser(
          nextConnection.userId,
          nextConnection.accessToken,
        ),
        zowkinsApi.getAdminOrderStats(nextConnection.accessToken),
      ]);
      setProfile(data);
      setOrderStats(stats.stats);
      setProfileForm({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        gender: data.gender ?? "",
        phoneNumber: data.phoneNumber ?? "",
        dateOfBirth: "",
        files: [],
      });
      setPreview(data.avatar?.url ?? "");
      setConnectionMessage("Admin profile loaded successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load admin profile and order stats.",
      );
    } finally {
      setConnectionSaving(false);
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileForm((current) => ({ ...current, files: [file] }));
    setPreview((current) => {
      if (current.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady) {
      setError(
        "Add a real admin user ID and access token to update this profile.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await zowkinsApi.updateAdminMe(
        apiConnection.accessToken.trim(),
        {
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          gender: profileForm.gender.trim(),
          phoneNumber: profileForm.phoneNumber.trim(),
          dateOfBirth: profileForm.dateOfBirth,
          files: profileForm.files,
        },
      );
      setProfile(updated);
      setPreview(updated.avatar?.url ?? preview);
      setMessage("Admin profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update admin profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady) {
      setError(
        "Add a real admin user ID and access token to update this password.",
      );
      return;
    }

    setPasswordSaving(true);
    setError("");
    setMessage("");

    try {
      await zowkinsApi.updateAdminPassword(
        apiConnection.accessToken.trim(),
        passwordForm,
      );
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("Admin password updated successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update admin password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <AdminShell
      title="Settings"
      subtitle="Admin profile and password management."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                Admin profile
              </p>
              <h2 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight md:text-4xl">
                Update your account details and avatar from one place.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 md:text-base">
                Manage your admin user profile, then change your password
                without leaving the dashboard.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">
                    Session
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {session?.name ?? "Admin"}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">
                    API link
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {apiReady ? "Connected" : "Not connected"}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">
                    Loading
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {loading ? "Fetching..." : "Ready"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/admin/team"
                  className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Invite admin team member
                </Link>
              </div>
            </div>

            <div className="relative min-h-[280px] overflow-hidden bg-slate-900/40 md:min-h-[320px]">
              <Image
                src={resolveImageSource(preview || "/desktop.jpg")}
                alt="Admin avatar preview"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,42,120,0.15),rgba(10,42,120,0.8))]" />
              <div className="absolute bottom-4 left-4 right-4 rounded-[1.4rem] bg-slate-950/50 p-4 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">
                  Avatar preview
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  Upload a new avatar image or keep your current profile
                  picture.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              API connection
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Admin session
            </h2>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              <p>
                The signed-in admin session is used automatically for profile
                and password updates.
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                Status: {session?.accessToken ? "Connected" : "Not connected"}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Profile details
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Edit admin profile
            </h2>

            {error ? (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            ) : null}

            <form
              onSubmit={handleProfileSubmit}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <input
                value={profileForm.firstName}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                placeholder="First name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={profileForm.lastName}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Last name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={profileForm.gender}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    gender: event.target.value,
                  }))
                }
                placeholder="Gender"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={profileForm.phoneNumber}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
                placeholder="Phone number"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Date of birth</span>
                <input
                  value={profileForm.dateOfBirth}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      dateOfBirth: event.target.value,
                    }))
                  }
                  type="date"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:border-[#0a2a78]"
                />
              </label>
              <div className="flex items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving || !apiReady}
                  className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
                {!apiReady ? (
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    API connection required
                  </span>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Security
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Change admin password
            </h2>
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <input
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                type="password"
                placeholder="Current password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                type="password"
                placeholder="New password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <button
                type="submit"
                disabled={passwordSaving || !apiReady}
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordSaving ? "Updating..." : "Update password"}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Orders
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Order statistics
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Quick snapshot of live order activity pulled from{" "}
              <code>/admin/orders/stats</code>.
            </p>

            {loading ? (
              <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Loading order stats...
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Total orders
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {orderStats.totalOrders}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Processing
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {orderStats.processing}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  In transit
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {orderStats.inTransit}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Delivered
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {orderStats.delivered}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Cancelled
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {orderStats.cancelled}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Revenue
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 0,
                  }).format(orderStats.totalRevenue)}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
