"use client";

import { useMemo, useState } from "react";
import { AdminBadge, AdminIcon, AdminShell } from "../../../components/AdminShell";
import { useAdminRecords } from "../../../hooks/useAdminRecords";

export default function CustomersPage() {
  const customers = useAdminRecords((state) => state.customers);
  const toggleCustomerStatus = useAdminRecords((state) => state.toggleCustomerStatus);
  const [query, setQuery] = useState("");

  const activeCount = useMemo(() => customers.filter((customer) => customer.status !== "Lead").length, [customers]);
  const leadCount = useMemo(() => customers.filter((customer) => customer.status === "Lead").length, [customers]);

  const filteredCustomers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) => [customer.id, customer.name, customer.company, customer.email, customer.phone, customer.location, customer.status, customer.lastOrder].some((value) => value.toLowerCase().includes(needle)));
  }, [customers, query]);

  return (
    <AdminShell title="Customers" subtitle="Manage customer records and contact details from one page." searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search customers...">
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Records</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Customer records</h2>
          </div>
          <AdminBadge label="Active" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.2rem] bg-emerald-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Active/returning</p><p className="mt-2 text-2xl font-bold text-slate-900">{activeCount}</p></div>
          <div className="rounded-[1.2rem] bg-amber-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Leads</p><p className="mt-2 text-2xl font-bold text-slate-900">{leadCount}</p></div>
          <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Total records</p><p className="mt-2 text-2xl font-bold text-slate-900">{customers.length}</p></div>
        </div>

        <div className="mt-6 grid gap-4">
          {filteredCustomers.map((customer) => (
            <article key={customer.id} className="rounded-[1.4rem] border border-slate-100 p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{customer.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{customer.company}</p>
                </div>
                <AdminBadge label={customer.status} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><AdminIcon name="mail" />{customer.email}</div>
                <div className="flex items-center gap-2"><AdminIcon name="user" />{customer.phone}</div>
                <div className="flex items-center gap-2"><AdminIcon name="truck" />{customer.location}</div>
                <p className="leading-6 text-slate-700">Last order: {customer.lastOrder}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={() => toggleCustomerStatus(customer.id)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                  {customer.status === "Lead" ? "Mark active" : "Mark returning"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
