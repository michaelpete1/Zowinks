"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminBadge, AdminShell } from "../../../components/AdminShell";
import { useAdminSession } from "../../../hooks/useAdminSession";
import { AdminCustomer, ApiError, zowkinsApi } from "../../../lib/zowkins-api";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = { accessToken: string };

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
  const [activeTab, setActiveTab] = useState<"list" | "edit">("list");

  useEffect(() => {
    if (!session?.accessToken || typeof window === "undefined") return;
    const nextToken = session.accessToken.trim();
    const storedToken = window.localStorage.getItem(ADMIN_API_TOKEN_KEY) ?? "";
    setApiConnection({ accessToken: nextToken });
    if (nextToken && nextToken !== storedToken) window.localStorage.setItem(ADMIN_API_TOKEN_KEY, nextToken);
    setReady(true);
  }, [session?.accessToken]);

  const apiReady = Boolean(apiConnection.accessToken.trim());

  const loadCustomers = async () => {
    if (!apiReady) return;
    setLoading(true);
    setError("");
    try {
      const [customerListResponse, statsResponse, nonReferralListResponse] = await Promise.all([
        zowkinsApi.listAdminCustomers(apiConnection.accessToken.trim(), { status: filterStatus || undefined, isReferralPartner: filterReferral === "" ? undefined : filterReferral === "true" }),
        zowkinsApi.getAdminCustomerStats(apiConnection.accessToken.trim()),
        zowkinsApi.listAdminNonReferralCustomers(apiConnection.accessToken.trim()),
      ]);
      const customerList: AdminCustomer[] = Array.isArray(customerListResponse) ? customerListResponse : (customerListResponse as any)?.users || (customerListResponse as any)?.customers || [];
      const nonReferralList: AdminCustomer[] = Array.isArray(nonReferralListResponse) ? nonReferralListResponse : (nonReferralListResponse as any)?.users || (nonReferralListResponse as any)?.customers || [];
      setCustomers(customerList);
      setStats(statsResponse.stats);
      setNonReferralCount(nonReferralList.length);
      setSelectedCustomer((current) => {
        if (!current) return customerList[0] ?? null;
        return customerList.find((c) => (c.id || (c as any)._id) === (current.id || (current as any)._id)) ?? customerList[0] ?? null;
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) { clearSession?.(); if (typeof window !== "undefined") window.localStorage.removeItem(ADMIN_API_TOKEN_KEY); setError("Your admin API token looks missing or expired. Save the token again from Settings, then refresh this page."); return; }
      setError(err instanceof ApiError ? err.message : "Could not load customers.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!ready || !apiReady) return;
    void loadCustomers();
  }, [apiReady, ready, filterStatus, filterReferral]);

  useEffect(() => {
    if (!selectedCustomer) { setForm(emptyForm); return; }
    setForm({ firstName: selectedCustomer.firstName, lastName: selectedCustomer.lastName, email: selectedCustomer.email, phoneNumber: selectedCustomer.phoneNumber, status: selectedCustomer.status, isReferralPartner: selectedCustomer.isReferralPartner });
  }, [selectedCustomer]);

  const filteredCustomers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) => [customer.id || (customer as any)._id, customer.firstName, customer.lastName, customer.email, customer.phoneNumber, customer.gender, customer.status, customer.referredBy ?? ""].some((v) => v.toLowerCase().includes(needle)));
  }, [customers, query]);

  const saveConnection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, apiConnection.accessToken.trim());
    setMessage("API connection saved.");
    setError("");
  };

  const clearForm = () => { setSelectedCustomer(null); setForm(emptyForm); setMessage(""); setError(""); };

  const updateCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady || !selectedCustomer) { setError("Select a customer first."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      await zowkinsApi.updateAdminCustomer(apiConnection.accessToken.trim(), selectedCustomer.id || (selectedCustomer as any)._id, { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phoneNumber: form.phoneNumber.trim(), status: form.status.trim(), isReferralPartner: form.isReferralPartner });
      setMessage("Customer updated successfully.");
      await loadCustomers();
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not update customer."); }
    finally { setSaving(false); }
  };

  const removeCustomer = async (userId: string) => {
    if (!apiReady) return;
    if (typeof window !== "undefined" && !window.confirm("Delete this customer?")) return;
    setDeletingId(userId); setError(""); setMessage("");
    try {
      await zowkinsApi.deleteAdminCustomer(apiConnection.accessToken.trim(), userId);
      setMessage("Customer deleted successfully.");
      if ((selectedCustomer?.id || (selectedCustomer as any)?._id) === userId) clearForm();
      await loadCustomers();
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not delete customer."); }
    finally { setDeletingId(""); }
  };

  const openCustomer = async (customer: AdminCustomer) => {
    if (!apiReady) { setSelectedCustomer(customer); return; }
    try {
      const data = await zowkinsApi.getAdminCustomer(apiConnection.accessToken.trim(), customer.id || (customer as any)._id);
      setSelectedCustomer(data);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not load customer details."); setSelectedCustomer(customer); }
  };

  const inputClass = (errors: boolean) => `w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white ${errors ? "border-rose-500 focus:border-rose-600" : "border-slate-200 focus:border-[#0a2a78]"}`;

  return (
    <AdminShell title="Customers" subtitle="Customer management for admins." searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search customers...">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">← Back to Dashboard</Link>
        <button type="button" onClick={(e) => saveConnection(e as any)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">Save connection</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6 lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Records</p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">Customer records</h2>
              </div>
              <AdminBadge label={apiReady ? "Visible" : "Hidden"} />
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            {error ? <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            {message ? <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

            <div className="mb-6 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Active</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-700">Inactive</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.inactiveUsers}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">Pending</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.pendingUsers}</p>
              </div>
            </div>

            <div className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900">Non-referral customers: <span className="font-semibold">{nonReferralCount}</span></div>

            <div className="mb-6 flex flex-wrap gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-700">Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass(false)}>
                  <option value="">All statuses</option><option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="waitlist">Waitlist</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-slate-700">Referral state</label>
                <select value={filterReferral} onChange={(e) => setFilterReferral(e.target.value)} className={inputClass(false)}>
                  <option value="">All referral states</option><option value="true">Referral partners</option><option value="false">Non-referral partners</option>
                </select>
              </div>
              <button type="button" onClick={() => void loadCustomers()} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Refresh</button>
            </div>

            <div className="space-y-3">
              {loading ? <div className="rounded-xl border border-slate-100 bg-slate-50 h-32 flex items-center justify-center text-sm text-slate-500">Loading customers...</div> : null}
              {filteredCustomers.length === 0 && !loading ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 h-48 flex flex-col items-center justify-center text-sm text-slate-500">No customers found.</div> : null}
              {filteredCustomers.map((customer) => (
                <button key={customer.id || (customer as any)._id} type="button" onClick={() => openCustomer(customer)} className={`group flex items-center justify-between gap-4 rounded-xl border p-4 transition ${(selectedCustomer?.id || (selectedCustomer as any)?._id) === (customer.id || (customer as any)._id) ? "border-[#0a2a78] bg-[#f6f9ff]" : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"}`}>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{customer.firstName} {customer.lastName}</p>
                      <p className="text-xs text-slate-500">{customer.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AdminBadge label={titleCase(customer.status)} />
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${customer.isReferralPartner ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-600"}`}>{customer.isReferralPartner ? "Referral" : "Standard"}</span>
                    </div>
                  </div>
                  <AdminBadge label={titleCase(customer.status)} status={customer.status === "active" ? "active" : "inactive"} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {activeTab === "list" ? (
            <>
              <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin access</p>
                <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">Customer management</h2>
                <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
                  <p>Save a bearer token once, then manage customers from this workspace.</p>
                  <p>Filter by status or referral partner state and inspect full details.</p>
                  <p>Edit or delete a customer without leaving the admin panel.</p>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link href="/admin/orders" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">Orders</Link>
                  <Link href="/admin/settings" className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Profile settings</Link>
                </div>
              </section>

              <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">API connection</p>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-900 sm:text-2xl">Admin session</h2>
                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  <p>Customer records load automatically from your signed-in admin session.</p>
                  <p className="mt-2 font-semibold text-slate-900">Status: {apiReady ? "Connected" : "Not connected"}</p>
                </div>
              </section>
            </>
          ) : (
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{selectedCustomer ? "Edit customer" : "Customer details"}</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">{selectedCustomer ? "Update selected customer" : "Select a customer"}</h2>
                </div>
                <button type="button" onClick={() => setActiveTab("list")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Back</button>
              </div>
              {selectedCustomer ? (
                <form onSubmit={updateCustomer} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-700">First name</label>
                      <input value={form.firstName} onChange={(e) => setForm((c) => ({ ...c, firstName: e.target.value }))} placeholder="First name" className={inputClass(false)} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-700">Last name</label>
                      <input value={form.lastName} onChange={(e) => setForm((c) => ({ ...c, lastName: e.target.value }))} placeholder="Last name" className={inputClass(false)} />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">Email</label>
                    <input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="Email" className={inputClass(false)} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Phone number</label>
                    <input value={form.phoneNumber} onChange={(e) => setForm((c) => ({ ...c, phoneNumber: e.target.value }))} placeholder="Phone number" className={inputClass(false)} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Status</label>
                    <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))} className={inputClass(false)}>
                      <option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="waitlist">Waitlist</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    <input checked={form.isReferralPartner} onChange={(e) => setForm((c) => ({ ...c, isReferralPartner: e.target.checked }))} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#0a2a78] focus:ring-[#0a2a78]" /> Referral partner
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={saving} className="rounded-xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save customer"}</button>
                    <button type="button" onClick={clearForm} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Clear</button>
                  </div>
                </form>
              ) : (
                <p className="mt-4 text-sm text-slate-600">Select a customer from the list to edit their details.</p>
              )}
            </section>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
