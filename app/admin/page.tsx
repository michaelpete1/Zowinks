"use client";

import Link from "next/link";
import { AdminBadge, AdminIcon, AdminShell } from "../../components/AdminShell";

const stats = [
  { label: "Products live", value: "4", hint: "2 visible", tone: "bg-white" },
  { label: "Orders tracked", value: "3", hint: "1 pending", tone: "bg-white" },
  { label: "Messages", value: "3", hint: "customer leads", tone: "bg-white" },
  { label: "Admin routes", value: "6", hint: "separated views", tone: "bg-white" },
];

const shortcuts = [
  { label: "Products", href: "/admin/products", description: "Add, edit, hide, or remove products.", icon: "layers" as const },
  { label: "Orders", href: "/admin/orders", description: "Track delivered and pending orders.", icon: "orders" as const },
  { label: "Messages", href: "/admin/messages", description: "Review customer contact details.", icon: "contacts" as const },
  { label: "Team", href: "/admin/team", description: "Keep internal notes and controls together.", icon: "team" as const },
  { label: "Settings", href: "/admin/settings", description: "Manage product image workflow.", icon: "settings" as const },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell title="Admin overview" subtitle="Summary cards and route shortcuts. No management tables live here anymore.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-[1.5rem] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <span className="font-display text-3xl font-bold text-slate-900">{stat.value}</span>
              <span className="text-xs text-slate-500">{stat.hint}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Quick access</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Go straight to the page you need</h2>
            </div>
            <AdminBadge label="Visible" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {shortcuts.map((item) => (
              <Link key={item.label} href={item.href} className="group rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0a2a78] text-white transition group-hover:bg-[#12386a]"><AdminIcon name={item.icon} /></div>
                  <span className="text-sm font-semibold text-emerald-700">Open</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Operations</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Keep the store moving</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200">Use the separate pages for inventory, orders, and customer messages. The dashboard stays as a compact control entry point.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/admin/products" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Open products</Link>
              <Link href="/admin/settings" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Image settings</Link>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Status</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">What lives where</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p><strong className="text-slate-900">Products</strong> handles add, edit, hide, and remove flows.</p>
              <p><strong className="text-slate-900">Orders</strong> handles delivered and pending tracking.</p>
              <p><strong className="text-slate-900">Messages</strong> holds customer leads and contact details.</p>
              <p><strong className="text-slate-900">Team</strong> keeps internal notes and support controls.</p>
            </div>
          </section>
        </div>
      </section>
    </AdminShell>
  );
}
