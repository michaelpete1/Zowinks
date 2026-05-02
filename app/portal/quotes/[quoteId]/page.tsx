"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, PortalOrderQuote } from "../../../../lib/zowkins-api";
import PortalNavbar from "../../../../components/PortalNavbar";

export default function PortalQuoteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.quoteId as string;

  const [user, setUser] = useState<any>(null);
  const [quote, setQuote] = useState<PortalOrderQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("portalToken");
    const userData = localStorage.getItem("portalUser");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setUser({ token, user });
      } catch (error) {
        console.error("Failed to parse user data", error);
        router.push("/portal/auth/login");
      }
    } else {
      router.push("/portal/auth/login");
    }
  };

  useEffect(() => {
    if (user && quoteId) {
      fetchQuoteDetails();
    }
  }, [user, quoteId]);

  const fetchQuoteDetails = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const cachedQuote = typeof window !== "undefined"
        ? window.sessionStorage.getItem("portalLastQuote")
        : null;

      if (cachedQuote) {
        const parsed = JSON.parse(cachedQuote) as PortalOrderQuote;
        if (parsed?.id === quoteId) {
          setQuote(parsed);
          return;
        }
      }

      setQuote(null);
      setError("We could not load the quote details for this session. The quote was submitted, but this page does not yet fetch saved quotes from the API.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quote details");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <PortalNavbar />
        <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <div className="text-center">
            <p className="text-slate-400">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <PortalNavbar />
      
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-sm text-[#f3c74d] hover:underline mb-4"
          >
            ← Back to Portal
          </Link>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Quote Details</h1>
          <p className="mt-2 text-slate-300">Quote #{quoteId}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading quote details...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-red-400 mb-4">{error}</p>
            <div className="text-center">
              <Link
                href="/portal/quotes/request"
                className="inline-block rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
              >
                Request New Quote
              </Link>
            </div>
          </div>
        ) : quote ? (
          <div className="space-y-6">
            {/* Quote Summary */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Quote Summary</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Quote Number</p>
                  <p className="font-medium text-white">{quote.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <span className="inline-flex items-center rounded-full bg-yellow-500/15 px-3 py-1 text-sm font-semibold text-yellow-300">
                    {quote.orderStatus}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Created Date</p>
                  <p className="font-medium text-white">{formatDate(quote.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Payment Status</p>
                  <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-sm font-semibold text-blue-300">
                    {quote.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Customer Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="font-medium text-white">{quote.customer.firstName} {quote.customer.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="font-medium text-white">{quote.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="font-medium text-white">{quote.customer.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Quote Items */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Quote Items</h2>
              <div className="space-y-4">
                {quote.quoteDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-slate-300">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-white">Quote Price</p>
                  </div>
                ))}
              </div>
              
              {quote.quoteDetails.note && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-400 mb-2">Notes:</p>
                  <p className="text-white">{quote.quoteDetails.note}</p>
                </div>
              )}

              {quote.quoteDetails.file && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-400 mb-2">Attached Document:</p>
                  <a
                    href={quote.quoteDetails.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#f3c74d] hover:underline"
                  >
                    📄 View Document
                  </a>
                </div>
              )}
            </div>

            {/* Delivery Information */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">Delivery Address</h2>
                <div className="space-y-2">
                  <p className="font-medium text-white">{quote.deliveryAddress.label}</p>
                  <p className="text-slate-300">{quote.deliveryAddress.street}</p>
                  <p className="text-slate-300">
                    {quote.deliveryAddress.city}, {quote.deliveryAddress.state}
                  </p>
                  <p className="text-slate-300">{quote.deliveryAddress.country}</p>
                  <p className="text-slate-300">{quote.deliveryAddress.postalCode}</p>
                  <p className="text-slate-300">{quote.deliveryAddress.phoneNumber}</p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">Delivery Method</h2>
                <div className="space-y-2">
                  <p className="font-medium text-white">{quote.deliveryMethod.name}</p>
                  <p className="text-slate-300">{quote.deliveryMethod.estimatedDeliveryTime}</p>
                  <p className="text-[#f3c74d] font-medium">Fee: {formatCurrency(quote.deliveryMethod.fee)}</p>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Pricing Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="font-medium text-white">{formatCurrency(quote.transaction.subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Delivery Fee</span>
                  <span className="font-medium text-white">{formatCurrency(quote.transaction.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-white pt-3 border-t border-white/10">
                  <span>Total Amount</span>
                  <span className="text-[#f3c74d]">{formatCurrency(quote.transaction.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Link
                href="/portal/quotes/request"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                Request Another Quote
              </Link>
              <button
                className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
              >
                Proceed to Order
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">Quote details are not cached for this session.</p>
            <Link
              href="/portal/quotes/request"
              className="inline-block rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
            >
              Request New Quote
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
