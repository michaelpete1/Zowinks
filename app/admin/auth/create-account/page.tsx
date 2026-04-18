"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminSession } from "../../../../hooks/useAdminSession";
import { ApiError, zowkinsApi } from "../../../../lib/zowkins-api";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type CreateForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: string;
  role: string;
  gender: string;
  phoneNumber: string;
};

const emptyCreate: CreateForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  status: "active",
  role: "administrator",
  gender: "Male",
  phoneNumber: "",
};

function persistAuth(
  sessionTools: ReturnType<typeof useAdminSession>,
  accessToken: string,
  user: { id: string; firstName: string; lastName: string; email: string },
) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, accessToken);
  }

  sessionTools.signInAdmin(`${user.firstName} ${user.lastName}`.trim() || "Admin", user.email, accessToken, user.id);
}

export default function CreateAdminAccountPage() {
  const router = useRouter();
  const sessionTools = useAdminSession();
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreate);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!createForm.email.trim() || !createForm.password.trim()) {
      setError("Enter the account details before creating an admin.");
      return;
    }

    setCreating(true);
    try {
      const response = await zowkinsApi.createAdminAccount({
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        status: createForm.status,
        role: createForm.role,
        gender: createForm.gender,
        phoneNumber: createForm.phoneNumber.trim() || undefined,
      });

      persistAuth(sessionTools, response.accessToken, response.user);
      setMessage("Admin account created successfully.");
      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Could not create admin account.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc,_#eef2ff)] text-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/signin" className="flex items-center" aria-label="Back to sign in">
          <Image
            src="/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png"
            alt="Zowkins logo"
            width={180}
            height={68}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>
        <Link href="/signin" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
          Back to sign in
        </Link>
      </div>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-6 lg:grid-cols-[0.92fr_1.08fr] lg:pb-16 lg:pt-10">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:p-10">
          <div className="h-2 bg-[linear-gradient(90deg,#0a2a78_0%,#1d4f93_100%)]" />
          <div className="space-y-6 p-8 lg:p-0 lg:pt-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600">
              Admin creation
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Create a new admin account.
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-600 md:text-base">
              This page is separate from sign in so the flow stays focused. Use it when the backend team has approved a new admin user.
            </p>

            <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 px-5 py-4 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <span>Status</span>
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-700">Ready</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Route</span>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-500">/admin/auth/create-account</span>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Account setup</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-slate-900">Create admin account</h2>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateAccount}>
            <input value={createForm.firstName} onChange={(event) => setCreateForm((current) => ({ ...current, firstName: event.target.value }))} placeholder="First name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white" />
            <input value={createForm.lastName} onChange={(event) => setCreateForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Last name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white" />
            <input value={createForm.email} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} type="email" placeholder="admin@example.com" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white md:col-span-2" />
            <input value={createForm.password} onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))} type="password" placeholder="Password" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white md:col-span-2" />
            <input value={createForm.role} onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value }))} placeholder="Role" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white" />
            <input value={createForm.status} onChange={(event) => setCreateForm((current) => ({ ...current, status: event.target.value }))} placeholder="Status" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white" />
            <input value={createForm.gender} onChange={(event) => setCreateForm((current) => ({ ...current, gender: event.target.value }))} placeholder="Gender" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white" />
            <input value={createForm.phoneNumber} onChange={(event) => setCreateForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder="Phone number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white" />
            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2">{error}</p> : null}
            {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 md:col-span-2">{message}</p> : null}
            <button type="submit" disabled={creating} className="rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
              {creating ? "Creating..." : "Create admin account"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
