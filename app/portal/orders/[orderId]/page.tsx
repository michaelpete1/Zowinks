"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, PortalOrder } from "../../../../lib/zowkins-api";

const statusStyles: Record<string, string> = {
  processing:   "bg-yellow-400/15 text-yellow-300 border border-yellow-400/20",
  completed:    "bg-green-400/15 text-green-300 border border-green-400/20",
  cancelled:    "bg-red-400/15 text-red-300 border border-red-400/20",
  "in-transit": "bg-blue-400/15 text-blue-300 border border-blue-400/20",
};
const paymentStyles: Record<string, string> = {
  paid:    "bg-green-400/15 text-green-300 border border-green-400/20",
  pending: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/20",
  failed:  "bg-red-400/15 text-red-300 border border-red-400/20",
};
const badge = (map: Record<string, string>, key: string) =>
  map[key?.toLowerCase()] ?? "bg-slate-400/15 text-slate-300 border border-slate-400/20";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <span className="shrink-0 text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-white sm:text-right">{value}</span>
    </div>
  );
}

export default function PortalOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<PortalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) void fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("portalToken");
      if (!token) { window.location.replace("/portal/auth/login"); return; }
      const response = await zowkinsApi.getPortalOrder(token, orderId);
      if (!response?.order) throw new Error("Order not found");
      setOrder(response.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order");
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
        Loading order...
      </div>
    </main>
  );

  if (error || !order) return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16 space-y-4">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
        <p className="text-red-400">{error ?? "Order not found"}</p>
      </div>
      <Link href="/portal/orders" className="inline-block text-sm text-[#f3c74d] hover:underline">
        ← Back to Orders
      </Link>
    </main>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12 space-y-6">

      {/* Header */}
      <div>
        <Link href="/portal/orders" className="inline-flex items-center gap-1 text-sm text-[#f3c74d] hover:underline">
          ← Back to Orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Order #{order.orderNumber}
          </h1>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge(statusStyles, order.orderStatus)}`}>
            {order.orderStatus}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge(paymentStyles, order.paymentStatus)}`}>
            {order.paymentStatus}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Placed {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">

        {/* Left — products + delivery */}
        <div className="space-y-5 lg:col-span-2">

          {/* Products */}
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
            <h2 className="mb-4 text-base font-semibold text-white">Products</h2>
            <div className="space-y-3">
              {order.products.map((product, i) => (
                <div key={i} className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{product.productName}</p>
                    <p className="mt-0.5 text-xs text-slate-400">Qty: {product.quantity} × ₦{product.price.toLocaleString()}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-white">
                    ₦{product.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery */}
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5 space-y-5">
            <h2 className="text-base font-semibold text-white">Delivery Information</h2>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Address</p>
              {typeof order.deliveryAddress === "object" ? (
                <div className="space-y-0.5 text-sm text-slate-300">
                  {order.deliveryAddress.label && <p className="font-medium text-white">{order.deliveryAddress.label}</p>}
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                  <p>{order.deliveryAddress.country}{order.deliveryAddress.postalCode ? `, ${order.deliveryAddress.postalCode}` : ""}</p>
                  <p className="text-slate-400">{order.deliveryAddress.phoneNumber}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-300">{order.deliveryAddress}</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Method</p>
              {typeof order.deliveryMethod === "object" ? (
                <div className="space-y-0.5 text-sm text-slate-300">
                  <p className="font-medium text-white">{order.deliveryMethod.name}</p>
                  <p>Fee: ₦{order.deliveryMethod.fee.toLocaleString()}</p>
                  <p>Est. delivery: {order.deliveryMethod.estimatedDeliveryTime}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-300">{order.deliveryMethod}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Order summary */}
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5 space-y-3">
            <h2 className="text-base font-semibold text-white">Order Summary</h2>
            <InfoRow label="Subtotal" value={`₦${order.transaction.subTotal.toLocaleString()}`} />
            <InfoRow label="Delivery fee" value={`₦${order.transaction.deliveryFee.toLocaleString()}`} />
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-[#f3c74d]">₦{order.transaction.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5 space-y-3">
            <h2 className="text-base font-semibold text-white">Customer</h2>
            <InfoRow label="Name" value={`${order.customer.firstName} ${order.customer.lastName}`} />
            <InfoRow label="Email" value={<span className="break-all">{order.customer.email}</span>} />
            <InfoRow label="Phone" value={order.customer.phoneNumber} />
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5 space-y-3">
            <h2 className="text-base font-semibold text-white">Timeline</h2>
            <InfoRow
              label="Placed"
              value={new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
            />
            <InfoRow
              label="Updated"
              value={new Date(order.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
