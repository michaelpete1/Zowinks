"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, PortalUser } from "../../../lib/zowkins-api";

const inputClass = (hasError?: boolean) =>
  `w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 transition ${
    hasError ? "border-red-500" : "border-white/10 focus:border-[#f3c74d]/45"
  }`;

export default function PortalProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNumber: "", gender: "male", dateOfBirth: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof formData>>({});

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Partial<typeof passwordForm>>({});

  useEffect(() => { void fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("portalToken");
      if (!token) { router.push("/portal/auth/login"); return; }
      const userData = await zowkinsApi.getPortalMe(token);
      setUser(userData);
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split("T")[0] : "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<typeof formData> = {};
    if (!formData.firstName.trim()) errs.firstName = "Required";
    if (!formData.lastName.trim()) errs.lastName = "Required";
    if (!formData.phoneNumber.trim()) errs.phoneNumber = "Required";
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    const token = localStorage.getItem("portalToken");
    if (!token || !user) return;
    setSaving(true);
    try {
      const updated = await zowkinsApi.updatePortalMe(token, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
      });
      setUser(updated);
      setEditing(false);
      setMessage("Profile updated successfully.");
      localStorage.setItem("portalUser", JSON.stringify(updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<typeof passwordForm> = {};
    if (!passwordForm.currentPassword) errs.currentPassword = "Required";
    if (!passwordForm.newPassword) errs.newPassword = "Required";
    else if (passwordForm.newPassword.length < 8) errs.newPassword = "Min. 8 characters";
    else if (!/[A-Za-z]/.test(passwordForm.newPassword) || !/[0-9]/.test(passwordForm.newPassword))
      errs.newPassword = "Must include a letter and a number";
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword)
      errs.confirmNewPassword = "Passwords do not match";
    setPasswordFieldErrors(errs);
    if (Object.keys(errs).length) return;

    const token = localStorage.getItem("portalToken");
    if (!token) return;
    setChangingPassword(true);
    try {
      await zowkinsApi.updatePortalPassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage("Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try { await zowkinsApi.logoutPortal(); } catch {}
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalUser");
    router.push("/portal/auth/login");
  };

  if (loading) return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <div className="flex items-center justify-center gap-3 text-slate-300">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        Loading profile...
      </div>
    </main>
  );

  if (error && !user) return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16 space-y-4">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
        <p className="text-red-400">{error}</p>
      </div>
      <Link href="/portal/auth/login" className="inline-block text-sm text-[#f3c74d] hover:underline">← Back to Login</Link>
    </main>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your account information</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-sm text-green-400">{message}</p>
        </div>
      )}

      {user && (
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Main column */}
          <div className="space-y-5 lg:col-span-2">

            {/* Personal info */}
            <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">Personal Information</h2>
                {!editing ? (
                  <button
                    onClick={() => { setEditing(true); setError(null); setMessage(null); }}
                    className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#f3c74d]/40 hover:text-[#f3c74d]"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFieldErrors({});
                        if (user) setFormData({
                          firstName: user.firstName, lastName: user.lastName,
                          phoneNumber: user.phoneNumber, gender: user.gender,
                          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
                        });
                      }}
                      className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-500/30 hover:text-red-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="rounded-full bg-[#f3c74d] px-4 py-2 text-xs font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-300">First Name</label>
                      <input type="text" value={formData.firstName}
                        onChange={(e) => { setFormData(p => ({ ...p, firstName: e.target.value })); setFieldErrors(p => ({ ...p, firstName: undefined })); }}
                        className={inputClass(!!fieldErrors.firstName)} />
                      {fieldErrors.firstName && <p className="mt-1 text-xs text-red-400">{fieldErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-300">Last Name</label>
                      <input type="text" value={formData.lastName}
                        onChange={(e) => { setFormData(p => ({ ...p, lastName: e.target.value })); setFieldErrors(p => ({ ...p, lastName: undefined })); }}
                        className={inputClass(!!fieldErrors.lastName)} />
                      {fieldErrors.lastName && <p className="mt-1 text-xs text-red-400">{fieldErrors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">Phone Number</label>
                    <input type="tel" value={formData.phoneNumber}
                      onChange={(e) => { setFormData(p => ({ ...p, phoneNumber: e.target.value })); setFieldErrors(p => ({ ...p, phoneNumber: undefined })); }}
                      className={inputClass(!!fieldErrors.phoneNumber)} />
                    {fieldErrors.phoneNumber && <p className="mt-1 text-xs text-red-400">{fieldErrors.phoneNumber}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-300">Gender</label>
                      <select value={formData.gender} onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value }))}
                        className={inputClass()}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-300">Date of Birth</label>
                      <input type="date" value={formData.dateOfBirth}
                        onChange={(e) => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))}
                        className={inputClass()} />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "First Name", value: user.firstName },
                    { label: "Last Name", value: user.lastName },
                    { label: "Email", value: user.email },
                    { label: "Phone", value: user.phoneNumber },
                    { label: "Gender", value: <span className="capitalize">{user.gender}</span> },
                    { label: "Date of Birth", value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-NG") : "Not specified" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-0.5 text-sm font-medium text-white break-words">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Change password */}
            <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
              <h2 className="mb-5 text-base font-semibold text-white">Change Password</h2>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {(["currentPassword", "newPassword", "confirmNewPassword"] as const).map((field) => (
                  <div key={field}>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      {field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
                    </label>
                    <input
                      type="password"
                      value={passwordForm[field]}
                      onChange={(e) => { setPasswordForm(p => ({ ...p, [field]: e.target.value })); setPasswordFieldErrors(p => ({ ...p, [field]: undefined })); }}
                      placeholder={field === "newPassword" ? "Min. 8 characters, include a letter and number" : ""}
                      className={inputClass(!!passwordFieldErrors[field])}
                    />
                    {passwordFieldErrors[field] && <p className="mt-1 text-xs text-red-400">{passwordFieldErrors[field]}</p>}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-full bg-[#f3c74d] px-6 py-2.5 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:opacity-60"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Account status */}
            <div className="rounded-2xl border border-white/8 bg-white/5 p-5 space-y-3">
              <h2 className="text-base font-semibold text-white">Account Status</h2>
              {[
                { label: "Status", value: user.status, color: user.status === "active" ? "text-green-400" : "text-yellow-400" },
                { label: "Email Verified", value: user.isEmailVerified ? "Yes" : "No", color: user.isEmailVerified ? "text-green-400" : "text-yellow-400" },
                { label: "Referral Partner", value: user.isReferralPartner ? "Yes" : "No", color: user.isReferralPartner ? "text-green-400" : "text-slate-400" },
                { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-NG"), color: "text-white" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className={`text-sm font-medium capitalize ${color}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-white/8 bg-white/5 p-5 space-y-3">
              <h2 className="text-base font-semibold text-white">Quick Actions</h2>
              <Link href="/portal/delivery-addresses"
                className="block rounded-full border border-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:border-[#f3c74d]/40 hover:text-[#f3c74d]">
                Manage Addresses
              </Link>
              <Link href="/portal/orders"
                className="block rounded-full border border-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:border-[#f3c74d]/40 hover:text-[#f3c74d]">
                View Orders
              </Link>
              <button onClick={handleLogout}
                className="w-full rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
