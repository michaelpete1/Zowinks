"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminBadge, AdminShell } from "../../../components/AdminShell";
import { useAdminSession } from "../../../hooks/useAdminSession";
import { AdminDeliveryMethodInput, DeliveryMethod, ApiError, zowkinsApi } from "../../../lib/zowkins-api";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = {
  accessToken: string;
};

type DeliveryMethodForm = AdminDeliveryMethodInput;

const emptyForm: DeliveryMethodForm = {
  name: "",
  fee: 0,
  estimatedDeliveryTime: "",
  isActive: true,
  visibility: true,
};

export default function DeliveryMethodsPage() {
  const { session } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({ accessToken: "" });
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod | null>(null);
  const [form, setForm] = useState<DeliveryMethodForm>(emptyForm);
  const [queryName, setQueryName] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [deletedMethod, setDeletedMethod] = useState<DeliveryMethod | null>(null);
  const [undoingDelete, setUndoingDelete] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => setToastMessage(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

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

  const loadMethods = async () => {
    if (!apiReady) return;

    setLoading(true);
    setError("");

    try {
      const data = await zowkinsApi.listAdminDeliveryMethods(apiConnection.accessToken.trim(), {
        name: queryName.trim() || undefined,
        isActive: filterActive || undefined,
        visibility: filterVisibility || undefined,
      });
      setMethods(data);
      setSelectedMethod((current) => {
        if (!current) return data[0] ?? null;
        return data.find((method) => (method.id || (method as any)._id) === (current.id || (current as any)._id)) ?? data[0] ?? null;
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load delivery methods.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready || !apiReady) return;
    void loadMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, ready, queryName, filterActive, filterVisibility]);

  useEffect(() => {
    if (!selectedMethod) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: selectedMethod.name,
      fee: selectedMethod.fee,
      estimatedDeliveryTime: selectedMethod.estimatedDeliveryTime,
      isActive: selectedMethod.isActive,
      visibility: selectedMethod.visibility,
    });
  }, [selectedMethod]);

  const saveConnection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;

    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, apiConnection.accessToken.trim());
    setConnectionMessage("API connection saved.");
    setError("");
  };

  const clearForm = () => {
    setSelectedMethod(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setDeletedMethod(null);
  };

  const undoDelete = async () => {
    if (!apiReady || !deletedMethod) return;

    setUndoingDelete(true);
    setError("");
    setMessage("");

    try {
      const restored = await zowkinsApi.createAdminDeliveryMethod(apiConnection.accessToken.trim(), {
        name: deletedMethod.name,
        fee: deletedMethod.fee,
        estimatedDeliveryTime: deletedMethod.estimatedDeliveryTime,
        isActive: deletedMethod.isActive,
        visibility: deletedMethod.visibility,
      });

      setMessage("Delivery method restored successfully.");
      setDeletedMethod(null);
      await loadMethods();
      setSelectedMethod(restored);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not restore delivery method.");
    } finally {
      setUndoingDelete(false);
    }
  };

  const submitMethod = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady) {
      setError("Save a bearer token first.");
      return;
    }

    const name = form.name.trim().replace(/\s+/g, " ");
    const estimatedDeliveryTime = form.estimatedDeliveryTime.trim().replace(/\s+/g, " ");
    const fee = Number(form.fee);

    if (name.length < 3 || name.length > 80) {
      setError("Delivery method name must be between 3 and 80 characters.");
      return;
    }

    if (estimatedDeliveryTime.length < 3 || estimatedDeliveryTime.length > 80) {
      setError("Estimated delivery time must be between 3 and 80 characters.");
      return;
    }

    if (!/[a-zA-Z]/.test(estimatedDeliveryTime) || !/[0-9a-zA-Z]/.test(estimatedDeliveryTime)) {
      setError("Estimated delivery time should include clear text such as '2-3 business days'.");
      return;
    }

    if (!Number.isFinite(fee) || fee < 0 || fee > 1000000000) {
      setError("Enter a valid delivery fee.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload: AdminDeliveryMethodInput = {
        name,
        fee,
        estimatedDeliveryTime,
        isActive: form.isActive,
        visibility: form.visibility,
      };

      const saved = selectedMethod
        ? await zowkinsApi.updateAdminDeliveryMethod(apiConnection.accessToken.trim(), (selectedMethod.id || (selectedMethod as any)._id), payload)
        : await zowkinsApi.createAdminDeliveryMethod(apiConnection.accessToken.trim(), payload);

      setSelectedMethod(saved);
      if (selectedMethod) {
        setToastMessage("Delivery method updated successfully.");
        setMessage("Delivery method updated successfully.");
      } else {
        setMessage("Delivery method created successfully.");
      }
      await loadMethods();
      setSelectedMethod(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save delivery method.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMethod = async (deliveryMethodId: string) => {
    if (!apiReady) return;

    setDeletingId(deliveryMethodId);
    setError("");
    setMessage("");

    try {
      const methodToDelete = methods.find((method) => (method.id || (method as any)._id) === deliveryMethodId) ?? null;
      await zowkinsApi.deleteAdminDeliveryMethod(apiConnection.accessToken.trim(), deliveryMethodId);
      setMessage("Delivery method deleted successfully.");
      setDeletedMethod(methodToDelete);
      if ((selectedMethod?.id || (selectedMethod as any)?._id) === deliveryMethodId) {
        setSelectedMethod(null);
        setForm(emptyForm);
      }
      await loadMethods();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete delivery method.");
    } finally {
      setDeletingId("");
    }
  };

  const visibleCount = useMemo(() => methods.filter((method) => method.visibility).length, [methods]);
  const activeCount = useMemo(() => methods.filter((method) => method.isActive).length, [methods]);

  return (
    <AdminShell
      title="Delivery Methods"
      subtitle="Delivery method management for admins."
      searchValue={queryName}
      onSearchChange={setQueryName}
      searchPlaceholder="Search delivery methods..."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Shipping</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Manage delivery methods</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={clearForm}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                New delivery method
              </button>
              <AdminBadge label={apiReady ? "Visible" : "Hidden"} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{methods.length}</p>
            </div>
            <div className="rounded-[1.2rem] bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Active</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
            <div className="rounded-[1.2rem] bg-cyan-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Visible</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{visibleCount}</p>
            </div>
          </div>

          {error ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
          {message ? <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
          {toastMessage ? (
            <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              {toastMessage}
            </div>
          ) : null}
          {deletedMethod ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p>
                Deleted <strong>{deletedMethod.name}</strong>. You can restore it for a moment.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void undoDelete()}
                  disabled={undoingDelete}
                  className="rounded-full bg-amber-600 px-4 py-2 font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {undoingDelete ? "Restoring..." : "Undo"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeletedMethod(null)}
                  className="rounded-full border border-amber-200 bg-white px-4 py-2 font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <input
              value={queryName}
              onChange={(event) => setQueryName(event.target.value)}
              placeholder="Filter by name"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
            />
            <select
              value={filterActive}
              onChange={(event) => setFilterActive(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
            >
              <option value="">All active states</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              value={filterVisibility}
              onChange={(event) => setFilterVisibility(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
            >
              <option value="">All visibility states</option>
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
            <button
              type="button"
              onClick={() => void loadMethods()}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? <p className="text-sm text-slate-500">Loading delivery methods...</p> : null}
            {methods.map((method) => (
              <article
                key={method.id || (method as any)._id}
                className={`rounded-[1.4rem] border p-4 md:p-5 ${(selectedMethod?.id || (selectedMethod as any)?._id) === (method.id || (method as any)._id) ? "border-[#0a2a78] bg-[#f6f9ff]" : "border-slate-100 bg-slate-50"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{method.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{method.estimatedDeliveryTime}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdminBadge label={method.visibility ? "Visible" : "Hidden"} />
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${method.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {method.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <span>Fee: <strong className="text-slate-900">{method.fee}</strong></span>
                  <span>ID: <strong className="text-slate-900">{method.id || (method as any)._id}</strong></span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteMethod(method.id || (method as any)._id)}
                    disabled={deletingId === (method.id || (method as any)._id)}
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
            <h2 className="mt-2 font-display text-2xl font-bold">Shipping configuration</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <p>Save a bearer token once, then manage shipping options from this workspace.</p>
              <p>Toggle active and visibility states to control what customers can choose at checkout.</p>
              <p>Create, edit, or delete delivery methods without leaving the admin panel.</p>
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
              The local dashboard login is separate from the protected admin delivery-method API. Save a bearer token here to load methods.
            </p>
            {connectionMessage ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{connectionMessage}</p> : null}
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{selectedMethod ? "Edit method" : "Create method"}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">{selectedMethod ? "Update delivery method" : "Add a new delivery method"}</h2>
            <form onSubmit={submitMethod} className="mt-6 grid gap-4">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={form.fee}
                onChange={(event) => setForm((current) => ({ ...current, fee: Number(event.target.value) }))}
                placeholder="Fee"
                type="number"
                min="0"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <input
                value={form.estimatedDeliveryTime}
                onChange={(event) => setForm((current) => ({ ...current, estimatedDeliveryTime: event.target.value }))}
                placeholder="Estimated delivery time"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#0a2a78] focus:ring-[#0a2a78]"
                />
                Active
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  checked={form.visibility}
                  onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.checked }))}
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#0a2a78] focus:ring-[#0a2a78]"
                />
                Visible to customers
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving || !apiReady}
                  className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : selectedMethod ? "Save changes" : "Add method"}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear fields
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
