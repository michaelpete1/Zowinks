"use client";

import Link from "next/link";
import { AdminShell } from "../../../components/AdminShell";

const roles = [
  { title: "Store admin", note: "Product edits, removals, and inventory checks." },
  { title: "Support desk", note: "Customer messages, follow-ups, and lead review." },
  { title: "Operations", note: "Orders, delivery status, and fulfilment checks." },
];

export default function TeamPage() {
  return (
    <AdminShell title="Team" subtitle="Internal controls and support shortcuts live here.">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Internal controls</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Keep the admin workflow in one place</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Use this area for team responsibilities, support handoffs, and quick access to store operations without crowding the dashboard.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <article key={role.title} className="rounded-[1.4rem] bg-slate-50 p-4">
                <h3 className="text-base font-bold text-slate-900">{role.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{role.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Quick actions</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Operational shortcuts</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
            <p>Move to products when you need to add or edit a device.</p>
            <p>Open orders to check whether a shipment is delivered or still pending.</p>
            <p>Review messages before handing them to sales or support.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/products" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Products</Link>
            <Link href="/admin/orders" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">Orders</Link>
            <Link href="/admin/messages" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">Messages</Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
