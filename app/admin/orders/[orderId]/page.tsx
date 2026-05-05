"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, AdminOrder, AdminOrderStatus, AdminPaymentStatus, ApiError } from "../../../../lib/zowkins-api";
import { AdminShell, AdminBadge } from "../../../../components/AdminShell";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [updateForm, setUpdateForm] = useState({
    orderStatus: "" as AdminOrderStatus,
    paymentStatus: "" as AdminPaymentStatus,
  });

  const orderStatusOptions: AdminOrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
    "refunded",
  ];

  const paymentStatusOptions: AdminPaymentStatus[] = [
    "pending",
    "paid",
    "failed",
    "refunded",
  ];

  useEffect(() => {
    if (orderId) {
      void fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      setUpdateForm({
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      });
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("zowkins-admin-access-token");
      if (!token) {
        setError("Please sign in as admin to view order details");
        return;
      }

      const response = await zowkinsApi.getAdminOrder(token, orderId);
      setOrder(response.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError(null);

    try {
      const token = localStorage.getItem("zowkins-admin-access-token");
      if (!token) throw new Error("No admin token found");

      const response = await zowkinsApi.updateAdminOrder(token, orderId, updateForm);
      setOrder(response.order);
      setMessage("Order updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const titleCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <AdminShell title="Order Details" subtitle="Loading...">
        <div className="flex items-center justify-center p-12">
          <div className="text-slate-500">Loading order details...</div>
        </div>
      </AdminShell>
    );
  }

  if (error || !order) {
    return (
      <AdminShell title="Order Details" subtitle="Error">
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="text-rose-700 font-medium">{error || "Order not found"}</p>
          <Link 
            href="/admin/orders" 
            className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            ← Back to Orders
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell 
      title={`Order #${order.orderNumber}`} 
      subtitle={`Management for order ${order.id}`}
    >
      <div className="mb-6">
        <Link 
          href="/admin/orders" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Status & Summary */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Overview</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Order Information</h2>
              </div>
              <div className="flex gap-2">
                <AdminBadge label={titleCase(order.orderStatus)} />
                <AdminBadge label={titleCase(order.paymentStatus)} />
              </div>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Customer</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{order.customer.firstName} {order.customer.lastName}</p>
                  <p className="text-sm text-slate-600">{order.customer.email}</p>
                  <p className="text-sm text-slate-600">{order.customer.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Delivery Address</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {typeof order.deliveryAddress === 'object' 
                      ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}`
                      : order.deliveryAddress}
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-right sm:text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Created At</p>
                  <p className="mt-1 text-slate-900 font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Last Updated</p>
                  <p className="mt-1 text-slate-900 font-medium">{new Date(order.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Delivery Method</p>
                  <p className="mt-1 text-slate-900 font-medium">
                    {typeof order.deliveryMethod === 'object' ? order.deliveryMethod.name : order.deliveryMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 pb-4">
                    <th className="pb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Product</th>
                    <th className="pb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Qty</th>
                    <th className="pb-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Price</th>
                    <th className="pb-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {order.products.map((product, idx) => (
                    <tr key={idx}>
                      <td className="py-4">
                        <p className="font-bold text-slate-900">{product.productName}</p>
                        <p className="text-xs text-slate-500">{product.productId}</p>
                      </td>
                      <td className="py-4 text-center font-medium text-slate-900">{product.quantity}</td>
                      <td className="py-4 text-right font-medium text-slate-900">{formatCurrency(product.price)}</td>
                      <td className="py-4 text-right font-bold text-slate-900">{formatCurrency(product.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar / Actions */}
        <div className="space-y-8">
          {/* Management Actions */}
          <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-[0_20px_50px_rgba(15,23,42,0.15)]">
            <h3 className="text-xl font-bold mb-6">Manage Order</h3>
            <form onSubmit={updateOrder} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Order Status</label>
                <select
                  value={updateForm.orderStatus}
                  onChange={(e) => setUpdateForm({ ...updateForm, orderStatus: e.target.value as AdminOrderStatus })}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[#f3c74d] focus:bg-white/10"
                >
                  {orderStatusOptions.map(status => (
                    <option key={status} value={status} className="bg-slate-900">{titleCase(status)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Payment Status</label>
                <select
                  value={updateForm.paymentStatus}
                  onChange={(e) => setUpdateForm({ ...updateForm, paymentStatus: e.target.value as AdminPaymentStatus })}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[#f3c74d] focus:bg-white/10"
                >
                  {paymentStatusOptions.map(status => (
                    <option key={status} value={status} className="bg-slate-900">{titleCase(status)}</option>
                  ))}
                </select>
              </div>
              
              {message && <p className="text-xs text-emerald-400 font-medium">{message}</p>}
              {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-[#f3c74d] px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-[#ffda75] disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Order"}
              </button>
            </form>
          </div>

          {/* Financial Summary */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-900 font-bold">{formatCurrency(order.transaction.subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Delivery Fee</span>
                <span className="text-slate-900 font-bold">{formatCurrency(order.transaction.deliveryFee)}</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between">
                <span className="text-slate-900 font-bold">Total Amount</span>
                <span className="text-2xl font-black text-[#0a2a78]">{formatCurrency(order.transaction.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
