"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminBadge, AdminShell } from "../../../components/AdminShell";
import { useAdminSession } from "../../../hooks/useAdminSession";
import { getSiteUrl } from "../../../lib/site-url";
import {
  AdminTeamMember,
  ApiError,
  zowkinsApi,
} from "../../../lib/zowkins-api";
import { resolveImageSource } from "../../../lib/media";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = {
  accessToken: string;
};

type InviteForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string;
};

type EditForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  gender: string;
  phoneNumber: string;
};

const emptyInviteForm: InviteForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "administrator",
  gender: "Male",
  phoneNumber: "",
  dateOfBirth: "",
};

const ADMIN_ROLE_OPTIONS = [
  { label: "Administrator", value: "administrator" },
  { label: "Operations", value: "operations" },
  { label: "DevOps", value: "devOps" },
  { label: "Store manager", value: "storeManager" },
  { label: "Marketing & Sales", value: "marketingAndSales" },
  { label: "Accountant", value: "accountant" },
  { label: "Driver", value: "driver" },
];

const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

function mapMemberToForm(member: AdminTeamMember): EditForm {
  return {
    firstName: member.firstName ?? "",
    lastName: member.lastName ?? "",
    email: member.email ?? "",
    role: member.role === "admin" ? "administrator" : (member.role ?? ""),
    status: member.status ?? "",
    gender: member.gender ?? "",
    phoneNumber: member.phoneNumber ?? "",
  };
}

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administrator",
  operations: "Operations",
  devOps: "DevOps",
  storeManager: "Store manager",
  marketingAndSales: "Marketing & Sales",
  accountant: "Accountant",
  driver: "Driver",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border border-amber-100",
  inactive: "bg-slate-100 text-slate-600 border border-slate-200",
  suspended: "bg-rose-50 text-rose-700 border border-rose-100",
};

function statusClass(status: string) {
  const key = status.toLowerCase();
  return STATUS_COLORS[key] ?? "bg-slate-100 text-slate-600 border border-slate-200";
}

export default function TeamPage() {
  const { session } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    accessToken: "",
  });
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<AdminTeamMember | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [inviteForm, setInviteForm] = useState<InviteForm>(emptyInviteForm);
  const [acceptInviteToken, setAcceptInviteToken] = useState("");
  const [acceptPassword, setAcceptPassword] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [acceptMessage, setAcceptMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [inviteFieldErrors, setInviteFieldErrors] = useState<Partial<Record<keyof InviteForm, string>>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<Partial<Record<keyof EditForm, string>>>({});
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "invite" | "edit">("list");

  useEffect(() => {
    if (!session?.accessToken || typeof window === "undefined") return;
    const nextToken = session.accessToken.trim();
    const storedToken = window.localStorage.getItem(ADMIN_API_TOKEN_KEY) ?? "";
    setApiConnection({ accessToken: nextToken });
    if (nextToken && nextToken !== storedToken) {
      window.localStorage.setItem(ADMIN_API_TOKEN_KEY, nextToken);
    }
    setReady(true);
  }, [session?.accessToken]);

  const apiReady = Boolean(apiConnection.accessToken.trim());

  const memberCount = members.length;
  const pendingCount = useMemo(
    () => members.filter((m) => m.status?.toLowerCase().includes("pending")).length,
    [members],
  );

  useEffect(() => {
    if (!ready || !apiReady) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    zowkinsApi
      .listAdminTeam(apiConnection.accessToken.trim())
      .then((data) => {
        if (cancelled) return;
        setMembers(data);
        setSelectedMember((current) => {
          if (!current) return data[0] ?? null;
          return data.find((m) => m.id === current.id) ?? data[0] ?? null;
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load team members.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [apiReady, apiConnection.accessToken, ready]);

  useEffect(() => {
    setEditForm(selectedMember ? mapMemberToForm(selectedMember) : null);
  }, [selectedMember]);

  const saveConnection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, apiConnection.accessToken.trim());
    setInviteMessage("API connection saved. Team data will load automatically.");
    setError("");
  };

  const refreshTeam = async () => {
    if (!apiReady) return;
    setLoading(true);
    setError("");
    try {
      const data = await zowkinsApi.listAdminTeam(apiConnection.accessToken.trim());
      setMembers(data);
      setSelectedMember((current) => {
        if (!current) return data[0] ?? null;
        return data.find((m) => m.id === current.id) ?? data[0] ?? null;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not refresh team members.");
    } finally {
      setLoading(false);
    }
  };

  const validateInviteForm = () => {
    const newErrors: Partial<Record<keyof InviteForm, string>> = {};
    if (!inviteForm.firstName.trim()) newErrors.firstName = "First name is required";
    if (!inviteForm.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!inviteForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(inviteForm.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!inviteForm.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    setInviteFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInviteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteFieldErrors({});
    if (!apiReady) { setError("Add a valid admin access token before inviting members."); return; }
    if (!validateInviteForm()) { setError("Please fix the errors in the invitation form."); return; }
    const allowedRoles = ADMIN_ROLE_OPTIONS.map((o) => o.value);
    if (!allowedRoles.includes(inviteForm.role)) { setError("Please choose a valid admin role before sending the invite."); return; }
    if (!inviteForm.gender.trim()) { setError("Please choose a gender before sending the invite."); return; }
    setInviting(true);
    setError("");
    setInviteMessage("");
    try {
      const siteUrl = getSiteUrl();
      await zowkinsApi.inviteAdminTeamMember(apiConnection.accessToken.trim(), { ...inviteForm, redirectUrl: `${siteUrl}/admin/auth/accept-invite` });
      setInviteForm(emptyInviteForm);
      setInviteMessage("Invite sent successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send invite.");
    } finally { setInviting(false); }
  };

  const handleSaveMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady || !selectedMember || !editForm) { setError("Select a team member and connect the API first."); return; }
    setSaving(true);
    setError("");
    setInviteMessage("");
    try {
      const updated = await zowkinsApi.updateAdminTeamMember(apiConnection.accessToken.trim(), selectedMember.id, editForm);
      setMembers((c) => c.map((m) => m.id === updated.id ? updated : m));
      setSelectedMember(updated);
      setInviteMessage("Team member updated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update team member.");
    } finally { setSaving(false); }
  };

  const handleResend = async (memberId: string) => {
    if (!apiReady) return;
    try {
      const siteUrl = getSiteUrl();
      await zowkinsApi.resendAdminTeamInvite(apiConnection.accessToken.trim(), memberId, { redirectUrl: `${siteUrl}/admin/auth/accept-invite` });
      setInviteMessage("Invitation resent successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend invite.");
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!apiReady) return;
    if (typeof window !== "undefined" && !window.confirm("Remove this team member?")) return;
    try {
      await zowkinsApi.deleteAdminTeamMember(apiConnection.accessToken.trim(), memberId);
      setMembers((c) => c.filter((m) => m.id !== memberId));
      setSelectedMember((c) => c?.id === memberId ? null : c);
      setInviteMessage("Team member removed successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove team member.");
    }
  };

  const handleAcceptInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acceptInviteToken.trim() || !acceptPassword.trim()) { setError("Enter both the invite token and a password."); return; }
    setAccepting(true);
    setError("");
    setAcceptMessage("");
    try {
      await zowkinsApi.acceptAdminTeamInvite(acceptInviteToken.trim(), { password: acceptPassword });
      setAcceptInviteToken("");
      setAcceptPassword("");
      setAcceptMessage("Invitation accepted successfully.");
      await refreshTeam();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not accept invite.");
    } finally { setAccepting(false); }
  };

  const inputClass = (fieldName: keyof InviteForm | keyof EditForm, errors: Record<string, string>) =>
    `w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white ${errors[fieldName] ? "border-rose-500 focus:border-rose-600" : "border-slate-200 focus:border-[#0a2a78]"}`;

  const selectClass = `rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white`;

  return (
    <AdminShell title="Team" subtitle="Admin team management and invitations.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">
          ← Back to Dashboard
        </Link>
        <button type="button" onClick={(e) => saveConnection(e as any)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">
          Save connection
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)]">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6 lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Team access</p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-900 lg:text-2xl">Manage admin members</h2>
              </div>
              <AdminBadge label={apiReady ? "Connected" : "Not connected"} />
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            {error ? (
              <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}
            {inviteMessage ? (
              <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{inviteMessage}</div>
            ) : null}

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Members</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{memberCount}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">Pending</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{pendingCount}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Session</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{session?.name ?? "Admin"}</p>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Team members</span>
              <button type="button" onClick={refreshTeam} disabled={loading} className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 h-32 flex items-center justify-center text-sm text-slate-500">Loading team members...</div>
              ) : members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 h-48 flex flex-col items-center justify-center text-sm text-slate-500">
                  No team members yet. Invite your first admin.
                </div>
              ) : (
                members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className={`group flex items-center justify-between gap-4 rounded-xl border p-4 transition ${selectedMember?.id === member.id ? "border-[#0a2a78] bg-[#f6f9ff]" : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-200">
                        <Image src={resolveImageSource(member.avatar, "/desktop.jpg")} alt={`${member.firstName} ${member.lastName}`} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <AdminBadge label={member.status || "Pending"} />
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {activeTab === "list" ? (
            <>
              <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Team operations</p>
                <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">Quick actions</h2>
                <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
                  <p>Invite new admins with role and contact details.</p>
                  <p>Edit an existing member, resend an invitation, or remove access.</p>
                  <p>Accept a team invite with the invitation token and a new password.</p>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setActiveTab("invite")} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                    Invite new member
                  </button>
                  <button type="button" onClick={refreshTeam} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                    Refresh team
                  </button>
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">API connection</p>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-900 sm:text-2xl">Admin session</h2>
                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  <p>Team data loads automatically from your signed-in admin session.</p>
                  <p className="mt-2 font-semibold text-slate-900">Status: {apiReady ? "Connected" : "Not connected"}</p>
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Accept invite</p>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-900 sm:text-2xl">Join an invitation</h2>
                <form onSubmit={handleAcceptInvite} className="mt-5 space-y-3">
                  <input value={acceptInviteToken} onChange={(e) => setAcceptInviteToken(e.target.value)} placeholder="Invitation token" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white" />
                  <input value={acceptPassword} onChange={(e) => setAcceptPassword(e.target.value)} type="password" placeholder="New password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white" />
                  <button type="submit" disabled={accepting} className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{accepting ? "Accepting..." : "Accept invite"}</button>
                </form>
                {acceptMessage ? <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{acceptMessage}</p> : null}
              </section>
            </>
          ) : activeTab === "invite" ? (
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Invite member</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">Invite a new admin team member</h2>
                </div>
                <button type="button" onClick={() => setActiveTab("list")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Back</button>
              </div>
              <form onSubmit={handleInviteSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">First name</label>
                    <input value={inviteForm.firstName} onChange={(e) => { setInviteForm((c) => ({ ...c, firstName: e.target.value })); if (inviteFieldErrors.firstName) setInviteFieldErrors((p) => ({ ...p, firstName: undefined })); }} placeholder="First name" className={inputClass("firstName", inviteFieldErrors)} />
                    {inviteFieldErrors.firstName && <p className="px-1 text-xs font-medium text-rose-600">{inviteFieldErrors.firstName}</p>}
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Last name</label>
                    <input value={inviteForm.lastName} onChange={(e) => { setInviteForm((c) => ({ ...c, lastName: e.target.value })); if (inviteFieldErrors.lastName) setInviteFieldErrors((p) => ({ ...p, lastName: undefined })); }} placeholder="Last name" className={inputClass("lastName", inviteFieldErrors)} />
                    {inviteFieldErrors.lastName && <p className="px-1 text-xs font-medium text-rose-600">{inviteFieldErrors.lastName}</p>}
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-700">Email</label>
                  <input value={inviteForm.email} onChange={(e) => { setInviteForm((c) => ({ ...c, email: e.target.value })); if (inviteFieldErrors.email) setInviteFieldErrors((p) => ({ ...p, email: undefined })); }} placeholder="Email" className={inputClass("email", inviteFieldErrors)} />
                  {inviteFieldErrors.email && <p className="px-1 text-xs font-medium text-rose-600">{inviteFieldErrors.email}</p>}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Role</label>
                    <select value={inviteForm.role} onChange={(e) => setInviteForm((c) => ({ ...c, role: e.target.value }))} className={selectClass}>
                      {ADMIN_ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Gender</label>
                    <select value={inviteForm.gender} onChange={(e) => setInviteForm((c) => ({ ...c, gender: e.target.value }))} className={selectClass}>
                      {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-700">Phone number</label>
                  <input value={inviteForm.phoneNumber} onChange={(e) => { setInviteForm((c) => ({ ...c, phoneNumber: e.target.value })); if (inviteFieldErrors.phoneNumber) setInviteFieldErrors((p) => ({ ...p, phoneNumber: undefined })); }} placeholder="Phone number" className={inputClass("phoneNumber", inviteFieldErrors)} />
                  {inviteFieldErrors.phoneNumber && <p className="px-1 text-xs font-medium text-rose-600">{inviteFieldErrors.phoneNumber}</p>}
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-700">Date of birth</label>
                  <input value={inviteForm.dateOfBirth} onChange={(e) => setInviteForm((c) => ({ ...c, dateOfBirth: e.target.value }))} type="date" placeholder="Date of birth" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white" />
                </div>
                <button type="submit" disabled={inviting || !apiReady} className="rounded-xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60">{inviting ? "Sending..." : "Send invite"}</button>
              </form>
            </section>
          ) : (
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Edit member</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">Update {selectedMember ? selectedMember.firstName + " " + selectedMember.lastName : "member"}</h2>
                </div>
                <button type="button" onClick={() => setActiveTab("list")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Back</button>
              </div>
              {selectedMember && editForm ? (
                <form onSubmit={handleSaveMember} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-700">First name</label>
                      <input value={editForm.firstName} onChange={(e) => setEditForm((c) => c ? { ...c, firstName: e.target.value } : c)} placeholder="First name" className={inputClass("firstName", editFieldErrors)} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-700">Last name</label>
                      <input value={editForm.lastName} onChange={(e) => setEditForm((c) => c ? { ...c, lastName: e.target.value } : c)} placeholder="Last name" className={inputClass("lastName", editFieldErrors)} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Email</label>
                    <input value={editForm.email} onChange={(e) => setEditForm((c) => c ? { ...c, email: e.target.value } : c)} placeholder="Email" className={inputClass("email", editFieldErrors)} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-700">Role</label>
                      <select value={editForm.role} onChange={(e) => setEditForm((c) => c ? { ...c, role: e.target.value } : c)} className={selectClass}>
                        {ADMIN_ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-700">Status</label>
                      <input value={editForm.status} onChange={(e) => setEditForm((c) => c ? { ...c, status: e.target.value } : c)} placeholder="Status" className={inputClass("status", editFieldErrors)} />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-700">Gender</label>
                      <input value={editForm.gender} onChange={(e) => setEditForm((c) => c ? { ...c, gender: e.target.value } : c)} placeholder="Gender" className={inputClass("gender", editFieldErrors)} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-700">Phone number</label>
                      <input value={editForm.phoneNumber} onChange={(e) => setEditForm((c) => c ? { ...c, phoneNumber: e.target.value } : c)} placeholder="Phone number" className={inputClass("phoneNumber", editFieldErrors)} />
                    </div>
                  </div>
                  <button type="submit" disabled={saving || !apiReady} className="rounded-xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
                  <button type="button" onClick={() => handleResend(selectedMember.id)} disabled={saving} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Resend invite</button>
                  <button type="button" onClick={() => handleDelete(selectedMember.id)} disabled={saving} className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">Remove member</button>
                </form>
              ) : (
                <p className="mt-4 text-sm text-slate-600">Select a team member from the list to edit their details.</p>
              )}
            </section>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
