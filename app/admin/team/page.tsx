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

export default function TeamPage() {
  const { session } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    accessToken: "",
  });
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<AdminTeamMember | null>(
    null,
  );
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
  const [ready, setReady] = useState(false);

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
    () =>
      members.filter((member) =>
        member.status?.toLowerCase().includes("pending"),
      ).length,
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
          return (
            data.find((member) => member.id === current.id) ?? data[0] ?? null
          );
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load team members.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiReady, apiConnection.accessToken, ready]);

  useEffect(() => {
    setEditForm(selectedMember ? mapMemberToForm(selectedMember) : null);
  }, [selectedMember]);

  const saveConnection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      ADMIN_API_TOKEN_KEY,
      apiConnection.accessToken.trim(),
    );
    setInviteMessage(
      "API connection saved. Team data will load automatically.",
    );
    setError("");
  };

  const refreshTeam = async () => {
    if (!apiReady) return;

    setLoading(true);
    setError("");
    try {
      const data = await zowkinsApi.listAdminTeam(
        apiConnection.accessToken.trim(),
      );
      setMembers(data);
      setSelectedMember((current) => {
        if (!current) return data[0] ?? null;
        return (
          data.find((member) => member.id === current.id) ?? data[0] ?? null
        );
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not refresh team members.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady) {
      setError("Add a valid admin access token before inviting members.");
      return;
    }

    if (
      !inviteForm.firstName.trim() ||
      !inviteForm.lastName.trim() ||
      !inviteForm.email.trim()
    ) {
      setError(
        "First name, last name, and email are required to send an invitation.",
      );
      return;
    }

    const allowedRoles = ADMIN_ROLE_OPTIONS.map((option) => option.value);
    if (!allowedRoles.includes(inviteForm.role)) {
      setError("Please choose a valid admin role before sending the invite.");
      return;
    }

    if (!inviteForm.gender.trim()) {
      setError("Please choose a gender before sending the invite.");
      return;
    }

    setInviting(true);
    setError("");
    setInviteMessage("");

    try {
      const siteUrl = getSiteUrl();
      await zowkinsApi.inviteAdminTeamMember(apiConnection.accessToken.trim(), {
        ...inviteForm,
        redirectUrl: `${siteUrl}/admin/auth/accept-invite`,
      });
      setInviteForm(emptyInviteForm);
      setInviteMessage("Invite sent successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not send invite.",
      );
    } finally {
      setInviting(false);
    }
  };

  const handleSaveMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady || !selectedMember || !editForm) {
      setError("Select a team member and connect the API first.");
      return;
    }

    setSaving(true);
    setError("");
    setInviteMessage("");

    try {
      const updated = await zowkinsApi.updateAdminTeamMember(
        apiConnection.accessToken.trim(),
        selectedMember.id,
        editForm,
      );
      setMembers((current) =>
        current.map((member) => (member.id === updated.id ? updated : member)),
      );
      setSelectedMember(updated);
      setInviteMessage("Team member updated successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update team member.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResend = async (memberId: string) => {
    if (!apiReady) return;
    try {
      const siteUrl = getSiteUrl();
      await zowkinsApi.resendAdminTeamInvite(
        apiConnection.accessToken.trim(),
        memberId,
        { redirectUrl: `${siteUrl}/admin/auth/accept-invite` },
      );
      setInviteMessage("Invitation resent successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not resend invite.",
      );
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!apiReady) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Remove this team member?")
    ) {
      return;
    }

    try {
      await zowkinsApi.deleteAdminTeamMember(
        apiConnection.accessToken.trim(),
        memberId,
      );
      setMembers((current) =>
        current.filter((member) => member.id !== memberId),
      );
      setSelectedMember((current) =>
        current?.id === memberId ? null : current,
      );
      setInviteMessage("Team member removed successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not remove team member.",
      );
    }
  };

  const handleAcceptInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acceptInviteToken.trim() || !acceptPassword.trim()) {
      setError("Enter both the invite token and a password.");
      return;
    }

    setAccepting(true);
    setError("");
    setAcceptMessage("");

    try {
      await zowkinsApi.acceptAdminTeamInvite(acceptInviteToken.trim(), {
        password: acceptPassword,
      });
      setAcceptInviteToken("");
      setAcceptPassword("");
      setAcceptMessage("Invitation accepted successfully.");
      await refreshTeam();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not accept invite.",
      );
    } finally {
      setAccepting(false);
    }
  };

  return (
    <AdminShell title="Team" subtitle="Admin team management and invitations.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Team access
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                Manage admin members
              </h2>
            </div>
            <AdminBadge label={apiReady ? "Visible" : "Hidden"} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Members
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {memberCount}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Pending
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Session
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {session?.name ?? "Admin"}
              </p>
            </div>
          </div>

          {error ? (
            <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          {inviteMessage ? (
            <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {inviteMessage}
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading team members...</p>
            ) : null}
            {members.map((member) => (
              <article
                key={member.id}
                className={`rounded-[1.4rem] border p-4 md:p-5 ${selectedMember?.id === member.id ? "border-[#0a2a78] bg-[#f6f9ff]" : "border-slate-100 bg-slate-50"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-200">
                      <Image
                        src={resolveImageSource(member.avatar, "/desktop.jpg")}
                        alt={`${member.firstName} ${member.lastName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm text-slate-600">{member.email}</p>
                    </div>
                  </div>
                  <AdminBadge label={member.status || "Pending"} />
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <span>
                    Role:{" "}
                    <strong className="text-slate-900">{member.role}</strong>
                  </span>
                  <span>
                    Phone:{" "}
                    <strong className="text-slate-900">
                      {member.phoneNumber || "N/A"}
                    </strong>
                  </span>
                  <span>
                    Gender:{" "}
                    <strong className="text-slate-900">
                      {member.gender || "N/A"}
                    </strong>
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResend(member.id)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                  >
                    Resend invite
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(member.id)}
                    className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Quick actions
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              Team operations
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <p>Invite new admins with role and contact details.</p>
              <p>
                Edit an existing member, resend an invitation, or remove access.
              </p>
              <p>
                Accept a team invite with the invitation token and a new
                password.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/settings"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Profile settings
              </Link>
              <button
                onClick={refreshTeam}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Refresh team
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              API connection
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Admin session
            </h2>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              <p>
                Team data loads automatically from your signed-in admin session.
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                Status: {apiReady ? "Connected" : "Not connected"}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Invite member
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Invite a new admin team member
            </h2>
            <form
              onSubmit={handleInviteSubmit}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <input
                value={inviteForm.firstName}
                onChange={(event) =>
                  setInviteForm((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                placeholder="First name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={inviteForm.lastName}
                onChange={(event) =>
                  setInviteForm((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Last name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={inviteForm.email}
                onChange={(event) =>
                  setInviteForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Email"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white md:col-span-2"
              />
              <label className="sr-only" htmlFor="invite-role">
                Role
              </label>
              <select
                id="invite-role"
                value={inviteForm.role}
                onChange={(event) =>
                  setInviteForm((current) => ({
                    ...current,
                    role: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              >
                {ADMIN_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="invite-gender">
                Gender
              </label>
              <select
                id="invite-gender"
                value={inviteForm.gender}
                onChange={(event) =>
                  setInviteForm((current) => ({
                    ...current,
                    gender: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                value={inviteForm.phoneNumber}
                onChange={(event) =>
                  setInviteForm((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
                placeholder="Phone number"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={inviteForm.dateOfBirth}
                onChange={(event) =>
                  setInviteForm((current) => ({
                    ...current,
                    dateOfBirth: event.target.value,
                  }))
                }
                type="date"
                placeholder="Date of birth"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <button
                type="submit"
                disabled={inviting || !apiReady}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
              >
                {inviting ? "Sending..." : "Send invite"}
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Edit member
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Update a selected admin
            </h2>
            {selectedMember && editForm ? (
              <form
                onSubmit={handleSaveMember}
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <input
                  value={editForm.firstName}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, firstName: event.target.value }
                        : current,
                    )
                  }
                  placeholder="First name"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
                <input
                  value={editForm.lastName}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, lastName: event.target.value }
                        : current,
                    )
                  }
                  placeholder="Last name"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
                <input
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, email: event.target.value }
                        : current,
                    )
                  }
                  placeholder="Email"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white md:col-span-2"
                />
                <label className="sr-only" htmlFor="edit-role">
                  Role
                </label>
                <select
                  id="edit-role"
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, role: event.target.value }
                        : current,
                    )
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                >
                  {ADMIN_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, status: event.target.value }
                        : current,
                    )
                  }
                  placeholder="Status"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
                <input
                  value={editForm.gender}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, gender: event.target.value }
                        : current,
                    )
                  }
                  placeholder="Gender"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
                <input
                  value={editForm.phoneNumber}
                  onChange={(event) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, phoneNumber: event.target.value }
                        : current,
                    )
                  }
                  placeholder="Phone number"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={saving || !apiReady}
                  className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Select a team member from the list to edit their details.
              </p>
            )}
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Accept invite
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Join an invitation
            </h2>
            <form onSubmit={handleAcceptInvite} className="mt-6 space-y-4">
              <input
                value={acceptInviteToken}
                onChange={(event) => setAcceptInviteToken(event.target.value)}
                placeholder="Invitation token"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={acceptPassword}
                onChange={(event) => setAcceptPassword(event.target.value)}
                type="password"
                placeholder="Password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <button
                type="submit"
                disabled={accepting}
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {accepting ? "Accepting..." : "Accept invite"}
              </button>
            </form>
            {acceptMessage ? (
              <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {acceptMessage}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
