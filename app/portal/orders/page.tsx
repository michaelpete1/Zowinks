"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zowkinsApi, PortalOrder, PortalOrderStats } from "../../../lib/zowkins-api";
import PortalNavbar from "../../../components/PortalNavbar";

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<PortalOrder[]>([]);
  const [stats, setStats] = useState<PortalOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrdersAndStats();
  }, []);

  const fetchOrdersAndStats = async () => {
    try {
      const token = localStorage.getItem("portalToken");
      if (!token) {
        setError("Please sign in to view your orders");
        return;
      }

      const [ordersResponse, statsResponse] = await Promise.all([
        zowkinsApi.listPortalOrders(token),
        zowkinsApi.getPortalOrderStats(token),
      ]);

      setOrders(ordersResponse.orders);
      setStats(statsResponse.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in-transit":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <PortalNavbar />
        <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <PortalNavbar />
        <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <PortalNavbar />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Your Orders</h1>
          <p className="mt-2 text-slate-300">Manage and track your orders</p>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
              <p className="text-sm text-slate-400">Total Orders</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold text-yellow-400">{stats.processing}</p>
              <p className="text-sm text-slate-400">Processing</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold text-blue-400">{stats.inTransit}</p>
              <p className="text-sm text-slate-400">In Transit</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
              <p className="text-sm text-slate-400">Completed</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
              <p className="text-sm text-slate-400">Cancelled</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold text-[#f3c74d]">₦{stats.totalSpent.toLocaleString()}</p>
              <p className="text-sm text-slate-400">Total Spent</p>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-slate-300">You haven't placed any orders yet.</p>
            <Link 
              href="/portal/orders/create" 
              className="mt-4 inline-block rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
            >
              Create Your First Order
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/portal/orders/${order.id}`}
                className="block rounded-lg border border-white/10 bg-white/5 p-6 transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                <div className="flex flex-col justify-between md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                      <h3 className="font-semibold text-white">Order #{order.orderNumber}</h3>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      {order.products.length} items • ₦{order.transaction.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <p className="text-sm font-medium text-slate-300">View Details →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
