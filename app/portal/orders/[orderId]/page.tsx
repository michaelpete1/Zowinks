"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, PortalOrder } from "../../../../lib/zowkins-api";
import PortalNavbar from "../../../../components/PortalNavbar";

export default function PortalOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<PortalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("portalToken");
      if (!token) {
        setError("Please sign in to view order details");
        return;
      }

      const response = await zowkinsApi.getPortalOrder(token, orderId);
      setOrder(response.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order details");
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
            <Link 
              href="/portal/orders" 
              className="mt-4 inline-block text-[#f3c74d] hover:underline"
            >
              ← Back to Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <PortalNavbar />
        <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
          <div className="text-center">
            <p className="text-slate-300">Order not found</p>
            <Link 
              href="/portal/orders" 
              className="mt-4 inline-block text-[#f3c74d] hover:underline"
            >
              ← Back to Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <PortalNavbar />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/portal/orders" 
            className="mb-4 inline-block text-[#f3c74d] hover:underline"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Order #{order.orderNumber}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Products</h2>
              <div className="space-y-4">
                {order.products.map((product, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0">
                    <div>
                      <h3 className="font-medium text-white">{product.productName}</h3>
                      <p className="text-sm text-slate-300">Quantity: {product.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">₦{product.price.toLocaleString()}</p>
                      <p className="text-sm text-slate-300">₦{product.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Delivery Information</h2>
              
              {/* Delivery Address */}
              <div className="mb-6">
                <h3 className="mb-2 font-medium text-white">Delivery Address</h3>
                {typeof order.deliveryAddress === 'object' ? (
                  <div className="text-sm text-slate-300">
                    <p>{order.deliveryAddress.label}</p>
                    <p>{order.deliveryAddress.street}</p>
                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                    <p>{order.deliveryAddress.country}, {order.deliveryAddress.postalCode}</p>
                    <p>Phone: {order.deliveryAddress.phoneNumber}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300">{order.deliveryAddress}</p>
                )}
              </div>

              {/* Delivery Method */}
              <div>
                <h3 className="mb-2 font-medium text-white">Delivery Method</h3>
                {typeof order.deliveryMethod === 'object' ? (
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-white">{order.deliveryMethod.name}</p>
                    <p>Fee: ₦{order.deliveryMethod.fee.toLocaleString()}</p>
                    <p>Estimated: {order.deliveryMethod.estimatedDeliveryTime}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300">{order.deliveryMethod}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Customer Information</h2>
              <div className="space-y-2 text-sm">
                <p className="text-slate-300">
                  <span className="font-medium text-white">Name:</span> {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className="text-slate-300">
                  <span className="font-medium text-white">Email:</span> {order.customer.email}
                </p>
                <p className="text-slate-300">
                  <span className="font-medium text-white">Phone:</span> {order.customer.phoneNumber}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Subtotal:</span>
                  <span className="text-white">₦{order.transaction.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Delivery Fee:</span>
                  <span className="text-white">₦{order.transaction.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-white">Total:</span>
                    <span className="text-xl font-bold text-[#f3c74d]">₦{order.transaction.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Order Timeline</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Order Placed:</span>
                  <span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Last Updated:</span>
                  <span className="text-white">{new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
