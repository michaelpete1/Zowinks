"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminBadge, AdminShell } from "../../../components/AdminShell";
import { useAdminSession } from "../../../hooks/useAdminSession";
import { AdminCustomer, ApiError, zowkinsApi } from "../../../lib/zowkins-api";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = {
  accessToken: string;
};

type CustomerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  isReferralPartner: boolean;
};

const emptyForm: CustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  status: "pending",
  isReferralPartner: false,
};

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function CustomersPage() {
  const { session, clearSession } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({ accessToken: "" });
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0, pendingUsers: 0 });
  const [nonReferralCount, setNonReferralCount] = useState(0);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterReferral, setFilterReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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

  const loadCustomers = async () => {
    if (!apiReady) return;

    setLoading(true);
    setError("");

    try {
      const [customerListResponse, statsResponse, nonReferralListResponse] = await Promise.all([
        zowkinsApi.listAdminCustomers(apiConnection.accessToken.trim(), {
          status: filterStatus || undefined,
          isReferralPartner:
            filterReferral === "" ? undefined : filterReferral === "true",
        }),
        zowkinsApi.getAdminCustomerStats(apiConnection.accessToken.trim()),
        zowkinsApi.listAdminNonReferralCustomers(apiConnection.accessToken.trim()),
      ]);

      const customerList: AdminCustomer[] = Array.isArray(customerListResponse)
        ? customerListResponse
        : (customerListResponse as any)?.users || 
          (customerListResponse as any)?.customers || [];
      
      const nonReferralList: AdminCustomer[] = Array.isArray(nonReferralListResponse)
        ? nonReferralListResponse
        : (nonReferralListResponse as any)?.users || 
          (nonReferralListResponse as any)?.customers || [];

      setCustomers(customerList);
      setStats(statsResponse.stats);
      setNonReferralCount(nonReferralList.length);
      setSelectedCustomer((current) => {
        if (!current) return customerList[0] ?? null;
        return customerList.find((customer) => (customer.id || (customer as any)._id) === (current.id || (current as any)._id)) ?? customerList[0] ?? null;
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession?.();
        if (typeof window !== "undefined") window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
        setError("Your admin API token looks missing or expired. Save the token again from Settings, then refresh this page.");
      } else {
        setError(err instanceof ApiError ? err.message : "Could not load customers.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready || !apiReady) return;
    void loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, ready, filterStatus, filterReferral]);

  useEffect(() => {
    if (!selectedCustomer) {
      setForm(emptyForm);
      return;
    }

    setForm({
      firstName: selectedCustomer.firstName,
      lastName: selectedCustomer.lastName,
      email: selectedCustomer.email,
      phoneNumber: selectedCustomer.phoneNumber,
      status: selectedCustomer.status,
      isReferralPartner: selectedCustomer.isReferralPartner,
    });
  }, [selectedCustomer]);

  const filteredCustomers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) =>
      [
        customer.id || (customer as any)._id,
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phoneNumber,
        customer.gender,
        customer.status,
        customer.referredBy ?? "",
      ].some((value) => value.toLowerCase().includes(needle)),
    );
  }, [customers, query]);

  const saveConnection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;

    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, apiConnection.accessToken.trim());
    setMessage("API connection saved.");
    setError("");
  };

  const clearForm = () => {
    setSelectedCustomer(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  const updateCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady || !selectedCustomer) {
      setError("Select a customer first.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await zowkinsApi.updateAdminCustomer(apiConnection.accessToken.trim(), (selectedCustomer.id || (selectedCustomer as any)._id), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        status: form.status.trim(),
        isReferralPartner: form.isReferralPartner,
      });
      setMessage("Customer updated successfully.");
      await loadCustomers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update customer.");
    } finally {
      setSaving(false);
    }
  };

  const removeCustomer = async (userId: string) => {
    if (!apiReady) return;
    if (typeof window !== "undefined" && !window.confirm("Delete this customer?")) {
      return;
    }

    setDeletingId(userId);
    setError("");
    setMessage("");

    try {
      await zowkinsApi.deleteAdminCustomer(apiConnection.accessToken.trim(), userId);
      setMessage("Customer deleted successfully.");
      if ((selectedCustomer?.id || (selectedCustomer as any)?._id) === userId) {
        clearForm();
      }
      await loadCustomers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete customer.");
    } finally {
      setDeletingId("");
    }
  };

  const openCustomer = async (customer: AdminCustomer) => {
    if (!apiReady) {
      setSelectedCustomer(customer);
      return;
    }

    try {
      const data = await zowkinsApi.getAdminCustomer(apiConnection.accessToken.trim(), (customer.id || (customer as any)._id));
      setSelectedCustomer(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load customer details.");
      setSelectedCustomer(customer);
    }
  };

  return (
    <AdminShell
      title="Customers"
      subtitle="Customer management for admins."
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder="Search customers..."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Records</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Customer records</h2>
            </div>
            <AdminBadge label={apiReady ? "Visible" : "Hidden"} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
            <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            </div>
            <div className="rounded-[1.2rem] bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Active</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
            </div>
            <div className="rounded-[1.2rem] bg-rose-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Inactive</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stats.inactiveUsers}</p>
            </div>
            <div className="rounded-[1.2rem] bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Pending</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stats.pendingUsers}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
            Non-referral customers: <span className="font-semibold">{nonReferralCount}</span>
          </div>

          {error ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
          {message ? <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="waitlist">Waitlist</option>
            </select>
            <select
              value={filterReferral}
              onChange={(event) => setFilterReferral(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
            >
              <option value="">All referral states</option>
              <option value="true">Referral partners</option>
              <option value="false">Non-referral partners</option>
            </select>
            <button
              type="button"
              onClick={() => void loadCustomers()}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? <p className="text-sm text-slate-500">Loading customers...</p> : null}
            {filteredCustomers.map((customer) => (
              <article
                key={customer.id || (customer as any)._id}
                className={`rounded-[1.4rem] border p-4 md:p-5 ${(selectedCustomer?.id || (selectedCustomer as any)?._id) === (customer.id || (customer as any)._id) ? "border-[#0a2a78] bg-[#f6f9ff]" : "border-slate-100 bg-slate-50"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{customer.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdminBadge label={titleCase(customer.status)} />
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${customer.isReferralPartner ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-600"}`}>
                      {customer.isReferralPartner ? "Referral" : "Standard"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <span>Phone: <strong className="text-slate-900">{customer.phoneNumber}</strong></span>
                  <span>Gender: <strong className="text-slate-900">{customer.gender}</strong></span>
                  <span>Referred by: <strong className="text-slate-900">{customer.referredBy || "N/A"}</strong></span>
                  <span>ID: <strong className="text-slate-900">{customer.id || (customer as any)._id}</strong></span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void openCustomer(customer)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeCustomer(customer.id || (customer as any)._id)}
                    disabled={deletingId === (customer.id || (customer as any)._id)}
                    className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin access</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Customer management</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <p>Save a bearer token once, then manage customers from this workspace.</p>
              <p>Filter by status or referral partner state and inspect full details on the right.</p>
              <p>Edit or delete a customer without leaving the admin panel.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/orders" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Orders
              </Link>
              <Link href="/admin/settings" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
                Profile settings
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">API connection</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Connect to the admin API</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The local dashboard login is separate from the protected admin customer API. Save a bearer token here to load records.
            </p>
            <form onSubmit={saveConnection} className="mt-6 space-y-4">
              <textarea
                value={apiConnection.accessToken}
                onChange={(event) => setApiConnection((current) => ({ ...current, accessToken: event.target.value }))}
                placeholder="Bearer access token"
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <button type="submit" className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a]">
                Save connection
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{selectedCustomer ? "Edit customer" : "Customer details"}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">{selectedCustomer ? "Update selected customer" : "Select a customer"}</h2>
            {selectedCustomer ? (
              <form onSubmit={updateCustomer} className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  value={form.firstName}
                  onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                  placeholder="First name"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
                <input
                  value={form.lastName}
                  onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                  placeholder="Last name"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white md:col-span-2"
                />
                <input
                  value={form.phoneNumber}
                  onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                  placeholder="Phone number"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="waitlist">Waitlist</option>
                </select>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    checked={form.isReferralPartner}
                    onChange={(event) => setForm((current) => ({ ...current, isReferralPartner: event.target.checked }))}
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#0a2a78] focus:ring-[#0a2a78]"
                  />
                  Referral partner
                </label>
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save customer"}
                  </button>
                  <button
                    type="button"
                    onClick={clearForm}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Select a customer from the list to edit their details.</p>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
