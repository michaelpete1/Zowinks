"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, PortalOrder, ApiError } from "../../../../lib/zowkins-api";

export default function PortalQuoteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.quoteId as string;

  const [quote, setQuote] = useState<PortalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quoteId) return;
    const load = async () => {
      const token = localStorage.getItem("portalToken");
      if (!token) { router.replace("/portal/auth/login"); return; }

      try {
        const response = await zowkinsApi.getPortalOrder(token, quoteId);
        setQuote(response.order);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("portalToken");
          localStorage.removeItem("portalUser");
          router.replace("/portal/auth/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load quote details");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [quoteId, router]);

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-center text-slate-400">Loading quote details...</p>
      </main>
    );
  }

  if (error || !quote) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-red-400 mb-4">{error ?? "Quote not found"}</p>
          <Link href="/portal/quotes/request" className="inline-block rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]">
            Request New Quote
          </Link>
        </div>
      </main>
    );
  }

  const statusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case "processing": return "bg-yellow-500/15 text-yellow-300";
      case "delivered": return "bg-green-500/15 text-green-300";
      case "cancelled": return "bg-red-500/15 text-red-300";
      case "in-transit": return "bg-blue-500/15 text-blue-300";
      default: return "bg-white/10 text-slate-300";
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
      <div className="mb-8">
        <Link href="/portal" className="mb-4 inline-block text-sm text-[#f3c74d] hover:underline">← Back to Portal</Link>
        <h1 className="text-3xl font-bold text-white md:text-4xl">Quote Details</h1>
        <p className="mt-1 text-slate-300">#{quote.orderNumber}</p>
      </div>

      <div className="space-y-6">
        {/* Summary */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Summary</h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div><p className="text-slate-400">Quote Number</p><p className="font-medium text-white">{quote.orderNumber}</p></div>
            <div>
              <p className="text-slate-400">Status</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColor(quote.orderStatus)}`}>{quote.orderStatus}</span>
            </div>
            <div><p className="text-slate-400">Payment Status</p><span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColor(quote.paymentStatus)}`}>{quote.paymentStatus}</span></div>
            <div><p className="text-slate-400">Date</p><p className="font-medium text-white">{new Date(quote.createdAt).toLocaleDateString()}</p></div>
          </div>
        </div>

        {/* Quote items */}
        {quote.quoteDetails && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Requested Items</h2>
            <div className="space-y-3">
              {quote.quoteDetails.items.map((item, i) => (
                <div key={i} className="flex justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <p className="text-white">{item.name}</p>
                  <p className="text-slate-300">Qty: {item.quantity}</p>
                </div>
              ))}
            </div>
            {quote.quoteDetails.note && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400 mb-1">Notes</p>
                <p className="text-white">{quote.quoteDetails.note}</p>
              </div>
            )}
            {quote.quoteDetails.file && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400 mb-1">Attached Document</p>
                <a href={quote.quoteDetails.file.url} target="_blank" rel="noopener noreferrer" className="text-[#f3c74d] hover:underline text-sm">
                  📄 View Document
                </a>
              </div>
            )}
          </div>
        )}

        {/* Delivery */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Delivery Address</h2>
            {typeof quote.deliveryAddress === "object" ? (
              <div className="space-y-1 text-sm text-slate-300">
                <p className="font-medium text-white">{quote.deliveryAddress.label}</p>
                <p>{quote.deliveryAddress.street}</p>
                <p>{quote.deliveryAddress.city}, {quote.deliveryAddress.state}</p>
                <p>{quote.deliveryAddress.country} {quote.deliveryAddress.postalCode}</p>
                <p>{quote.deliveryAddress.phoneNumber}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-300">{quote.deliveryAddress}</p>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Delivery Method</h2>
            {typeof quote.deliveryMethod === "object" ? (
              <div className="space-y-1 text-sm text-slate-300">
                <p className="font-medium text-white">{quote.deliveryMethod.name}</p>
                <p>{quote.deliveryMethod.estimatedDeliveryTime}</p>
                <p className="text-[#f3c74d] font-medium">Fee: {fmt(quote.deliveryMethod.fee)}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-300">{quote.deliveryMethod}</p>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Pricing Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-300">Subtotal</span><span className="text-white">{fmt(quote.transaction.subTotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-300">Delivery Fee</span><span className="text-white">{fmt(quote.transaction.deliveryFee)}</span></div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
              <span className="text-white">Total</span>
              <span className="text-[#f3c74d]">{fmt(quote.transaction.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/portal/quotes/request" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
            Request Another Quote
          </Link>
          <Link href="/portal/orders/create" className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]">
            Create a Standard Order
          </Link>
        </div>
        <p className="text-center text-sm text-slate-400">Our team will contact you with next steps for this quote.</p>
      </div>
    </main>
  );
}
