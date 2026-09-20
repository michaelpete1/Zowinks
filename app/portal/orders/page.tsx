"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zowkinsApi, PortalOrder, PortalOrderStats } from "../../../lib/zowkins-api";

const statusStyles: Record<string, string> = {
  processing: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/20",
  completed:  "bg-green-400/15 text-green-300 border border-green-400/20",
  cancelled:  "bg-red-400/15 text-red-300 border border-red-400/20",
  "in-transit": "bg-blue-400/15 text-blue-300 border border-blue-400/20",
};
const paymentStyles: Record<string, string> = {
  paid:    "bg-green-400/15 text-green-300 border border-green-400/20",
  pending: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/20",
  failed:  "bg-red-400/15 text-red-300 border border-red-400/20",
};
const badge = (map: Record<string, string>, key: string) =>
  map[key?.toLowerCase()] ?? "bg-slate-400/15 text-slate-300 border border-slate-400/20";

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<PortalOrder[]>([]);
  const [stats, setStats] = useState<PortalOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("portalToken");
      if (!token) { window.location.replace("/portal/auth/login"); return; }
      const [ordersRes, statsRes] = await Promise.all([
        zowkinsApi.listPortalOrders(token),
        zowkinsApi.getPortalOrderStats(token),
      ]);
      setOrders(ordersRes.orders);
      setStats(statsRes.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <div className="flex items-center justify-center gap-3 text-slate-300">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        Loading orders...
      </div>
    </main>
  );

  if (error) return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
        <p className="text-red-400">{error}</p>
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12 space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Your Orders</h1>
          <p className="mt-1 text-sm text-slate-400">Track and manage your purchases</p>
        </div>
        <Link
          href="/portal/orders/create"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f3c74d] px-5 py-2.5 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] active:scale-95"
        >
          + New Order
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total", value: stats.totalOrders, color: "text-white" },
            { label: "Processing", value: stats.processing, color: "text-yellow-300" },
            { label: "In Transit", value: stats.inTransit, color: "text-blue-300" },
            { label: "Completed", value: stats.completed, color: "text-green-300" },
            { label: "Cancelled", value: stats.cancelled, color: "text-red-300" },
            { label: "Spent", value: `₦${stats.totalSpent.toLocaleString()}`, color: "text-[#f3c74d]", small: true },
          ].map(({ label, value, color, small }) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className={`font-bold leading-tight ${small ? "text-base break-all" : "text-2xl"} ${color}`}>
                {value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-slate-300">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/portal/orders/create"
            className="mt-5 inline-block rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
          >
            Create Your First Order
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/portal/orders/${order.id}`}
              className="group block rounded-2xl border border-white/8 bg-white/5 p-5 transition hover:border-[#f3c74d]/30 hover:bg-white/8"
            >
              {/* Top row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  Order #{order.orderNumber}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge(statusStyles, order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge(paymentStyles, order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>

              {/* Bottom row */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                  <span>{order.products.length} item{order.products.length !== 1 ? "s" : ""}</span>
                  <span className="font-semibold text-white">₦{order.transaction.totalAmount.toLocaleString()}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <span className="text-xs font-medium text-[#f3c74d] group-hover:underline">
                  View details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
