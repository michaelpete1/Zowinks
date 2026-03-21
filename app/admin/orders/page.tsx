"use client";

import { useMemo, useState } from "react";
import { AdminBadge, AdminShell } from "../../../components/AdminShell";

type Order = {
  id: string;
  customer: string;
  item: string;
  amount: string;
  status: "Delivered" | "Processing" | "Pending";
  destination: string;
  updated: string;
};

const initialOrders: Order[] = [
  { id: "ORD-2042", customer: "Nova Logistics", item: "HP EliteBook 840 G11", amount: "$3,747", status: "Delivered", destination: "Lagos", updated: "2h ago" },
  { id: "ORD-2041", customer: "Apex Finance", item: "Dell Latitude 7650", amount: "$7,554", status: "Processing", destination: "Abuja", updated: "6h ago" },
  { id: "ORD-2040", customer: "Bluewave Group", item: "Lenovo ThinkPad T14", amount: "$2,196", status: "Pending", destination: "Port Harcourt", updated: "1d ago" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [query, setQuery] = useState("");

  const deliveredCount = useMemo(() => orders.filter((order) => order.status === "Delivered").length, [orders]);
  const pendingCount = useMemo(() => orders.filter((order) => order.status !== "Delivered").length, [orders]);

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((order) => [order.id, order.customer, order.item, order.amount, order.status, order.destination].some((value) => value.toLowerCase().includes(needle)));
  }, [orders, query]);

  const toggleDelivery = (id: string) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: order.status === "Delivered" ? "Pending" : "Delivered", updated: "Just now" } : order,
      ),
    );
  };

  return (
    <AdminShell title="Orders" subtitle="Monitor delivered and pending orders from a dedicated page." searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search orders...">
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Delivery</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Order status monitoring</h2>
          </div>
          <AdminBadge label="Delivered" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.2rem] bg-emerald-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Delivered</p><p className="mt-2 text-2xl font-bold text-slate-900">{deliveredCount}</p></div>
          <div className="rounded-[1.2rem] bg-amber-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Processing</p><p className="mt-2 text-2xl font-bold text-slate-900">{orders.filter((order) => order.status === "Processing").length}</p></div>
          <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Pending</p><p className="mt-2 text-2xl font-bold text-slate-900">{pendingCount}</p></div>
        </div>

        <div className="mt-6 grid gap-4">
          {filteredOrders.map((order) => (
            <article key={order.id} className="rounded-[1.4rem] bg-slate-50 p-4 md:p-5">
              <div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-slate-900">{order.customer}</p><p className="mt-1 text-sm text-slate-600">{order.item}</p></div><AdminBadge label={order.status} /></div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <span>Order: <strong className="text-slate-900">{order.id}</strong></span>
                <span>Amount: <strong className="text-slate-900">{order.amount}</strong></span>
                <span>Destination: <strong className="text-slate-900">{order.destination}</strong></span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Updated {order.updated}</span>
                <button type="button" onClick={() => toggleDelivery(order.id)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100">{order.status === "Delivered" ? "Mark pending" : "Mark delivered"}</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
