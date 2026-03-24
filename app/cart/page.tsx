"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import { useCart, type CartItem } from "../../hooks/useCart";
import { useAnonymousSession } from "../../hooks/useAnonymousSession";

type OrderStage = "form" | "payment" | "processing" | "success";
type PaymentMethod = "pay_now" | "pay_on_delivery";

type OrderFormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  deliveryAddress: string;
  pickupPoint: string;
  note: string;
  paymentMethod: PaymentMethod;
};

const PAYMENT_DETAILS = {
  accountName: "Zowkins Enterprise LTD",
  bankName: "Add your bank name",
  accountNumber: "Add your account number",
};

const ORDER_EMAIL = "info@zowkins.com";

const emptyFormState: OrderFormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  deliveryAddress: "",
  pickupPoint: "",
  note: "",
  paymentMethod: "pay_now",
};

function currency(value: number) {
  return value.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function Cart() {
  const items = useCart((state): CartItem[] => state.items);
  const clearCart = useCart((state) => state.clearCart);
  const sessionId = useAnonymousSession();
  const [formData, setFormData] = useState<OrderFormState>(emptyFormState);
  const [stage, setStage] = useState<OrderStage>("form");
  const [orderReference, setOrderReference] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState<{
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const shipping = 0;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;
  const summaryItems = submittedOrder?.items ?? items;
  const summarySubtotal = submittedOrder?.subtotal ?? subtotal;
  const summaryTax = submittedOrder?.tax ?? tax;
  const summaryTotal = submittedOrder?.total ?? total;

  const totalLabel = currency(summaryTotal);

  const selectedLocation = formData.deliveryAddress || formData.pickupPoint || "Not provided yet";

  const sendOrderEmail = (reference = orderReference) => {
    const lines = [
      `Order reference: ${reference}`,
      `Session ID: ${sessionId || "Pending"}`,
      `Customer name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone}`,
      `City: ${formData.city}`,
      `State: ${formData.state}`,
      `Delivery address: ${formData.deliveryAddress || "N/A"}`,
      `Pickup point: ${formData.pickupPoint || "N/A"}`,
      `Preferred location: ${selectedLocation}`,
      `Payment method: ${formData.paymentMethod === "pay_now" ? "Pay now" : "Pay on delivery"}`,
      `Note: ${formData.note || "N/A"}`,
      "",
      "Products:",
      ...summaryItems.map((item) => `- ${item.title} x${item.qty} | ${currency(item.price * item.qty)}${item.spec ? ` | ${item.spec}` : ""}`),
      "",
      `Subtotal: ${currency(summarySubtotal)}`,
      `Shipping: ${shipping === 0 ? "Free" : currency(shipping)}`,
      `Tax: ${currency(summaryTax)}`,
      `Total: ${currency(summaryTotal)}`,
    ];

    const subject = `New Zowkins order ${reference}`;
    const body = lines.join("\n");
    const mailto = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank", "noopener,noreferrer");
  };

  const createReference = () => `ZWK-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!items.length) {
      setError("Add a product first, then place the order.");
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.state.trim()) {
      setError("Fill in your name, email, phone, city, and state.");
      return;
    }

    if (!formData.deliveryAddress.trim() && !formData.pickupPoint.trim()) {
      setError("Add either a delivery address or a pick-up point.");
      return;
    }

    const nextReference = createReference();
    setOrderReference(nextReference);
    setSubmittedOrder({
      items,
      subtotal,
      tax,
      total,
    });
    setError("");

    if (formData.paymentMethod === "pay_now") {
      setStage("payment");
      return;
    }

    setStage("processing");
    sendOrderEmail(nextReference);
    clearCart();
  };

  const handlePaymentConfirm = () => {
    sendOrderEmail();
    clearCart();
    setStage("success");
  };

  const resetFlow = () => {
    setFormData(emptyFormState);
    setStage("form");
    setOrderReference("");
    setSubmittedOrder(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.35em] text-[#5ab214]">Order form</p>
              <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
                Fill in your order details and choose how you want to pay.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                The items you selected are listed below with their price and quantity. Complete the form, then continue to payment or pay on delivery.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/laptops" className="rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]">
                  Continue shopping
                </Link>
                <button type="button" onClick={resetFlow} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                  Reset form
                </button>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-800">
                  {items.length} selected item{items.length === 1 ? "" : "s"}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                <span>Pay now or pay on delivery</span>
                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                <span>Email order details after checkout</span>
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Session {sessionId || "loading..."}
              </p>
            </div>
          </div>
        </section>

        {!items.length && stage === "form" ? (
          <section className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-12">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-white/10">
              <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold text-white">No selected product yet</h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-slate-300">
              Use the Order Now button on any product page and each selected item will appear here automatically.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/laptops" className="rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]">
                Shop laptops
              </Link>
              <Link href="/accessories" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
                Shop accessories
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-5">
              {stage === "form" && (
                <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-8">
                  <div className="mb-6 border-b border-slate-200 pb-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/55">Checkout details</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">Tell us where to deliver or where to pick up</h2>
                  </div>

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">Full name</label>
                        <input
                          value={formData.name}
                          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5ab214] focus:bg-white"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5ab214] focus:bg-white"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">Phone</label>
                        <input
                          value={formData.phone}
                          onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5ab214] focus:bg-white"
                          placeholder="+234..."
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">City</label>
                        <input
                          value={formData.city}
                          onChange={(event) => setFormData({ ...formData, city: event.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5ab214] focus:bg-white"
                          placeholder="City"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">State</label>
                        <input
                          value={formData.state}
                          onChange={(event) => setFormData({ ...formData, state: event.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5ab214] focus:bg-white"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">Pick-up point</label>
                        <input
                          value={formData.pickupPoint}
                          onChange={(event) => setFormData({ ...formData, pickupPoint: event.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5ab214] focus:bg-white"
                          placeholder="Store, office, or pickup location"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-900">Delivery address</label>
                      <textarea
                        rows={4}
                        value={formData.deliveryAddress}
                        onChange={(event) => setFormData({ ...formData, deliveryAddress: event.target.value })}
                        className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5ab214] focus:bg-white"
                        placeholder="House number, street, landmark, and any delivery notes"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-900">Order note</label>
                      <textarea
                        rows={3}
                        value={formData.note}
                        onChange={(event) => setFormData({ ...formData, note: event.target.value })}
                        className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#5ab214] focus:bg-white"
                        placeholder="Any extra instructions for the order"
                      />
                    </div>

                    <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Payment method</p>
                      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="pay_now"
                          checked={formData.paymentMethod === "pay_now"}
                          onChange={() => setFormData({ ...formData, paymentMethod: "pay_now" })}
                          className="mt-1"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">Pay now</span>
                          <span className="block text-sm text-slate-600">See the payment gateway with account details after you submit.</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="pay_on_delivery"
                          checked={formData.paymentMethod === "pay_on_delivery"}
                          onChange={() => setFormData({ ...formData, paymentMethod: "pay_on_delivery" })}
                          className="mt-1"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">Pay on delivery</span>
                          <span className="block text-sm text-slate-600">Your order will be marked as processing and sent by email.</span>
                        </span>
                      </label>
                    </div>

                    {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#0b1d3b] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#0b1d3b]/20 transition hover:bg-[#12386a]"
                    >
                      {formData.paymentMethod === "pay_now" ? "Proceed to payment gateway" : "Place order"}
                    </button>
                  </form>
                </div>
              )}

              {stage === "payment" && (
                <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-8">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/55">Payment gateway</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">Transfer to our account details</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Use the details below, then click the confirmation button so we can email your order information.
                  </p>

                  <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                      <span className="text-sm font-semibold text-slate-300">Account name</span>
                      <span className="text-sm font-bold text-white">{PAYMENT_DETAILS.accountName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                      <span className="text-sm font-semibold text-slate-300">Bank name</span>
                      <span className="text-sm font-bold text-white">{PAYMENT_DETAILS.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-slate-300">Account number</span>
                      <span className="text-sm font-bold text-white">{PAYMENT_DETAILS.accountNumber}</span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] bg-[#0b1d3b] p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Reference</p>
                    <p className="mt-2 text-2xl font-bold">{orderReference}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/70">Session {sessionId || "loading..."}</p>
                    <p className="mt-2 text-sm text-white/80">Total due: {totalLabel}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handlePaymentConfirm}
                      className="rounded-full bg-[#5ab214] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4b9810]"
                    >
                      I have paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setStage("form")}
                      className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                    >
                      Back to form
                    </button>
                  </div>
                </div>
              )}

              {stage === "processing" && (
                <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-10">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-500/10 text-amber-300">
                    <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-[0.35em] text-white/55">Processing</p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-white">Your order is being processed</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    We have prepared your order and opened an email draft with the details. Our team can now follow up.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link href="/laptops" className="rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]">
                      Order another product
                    </Link>
                    <button
                      type="button"
                      onClick={resetFlow}
                      className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                    >
                      New order
                    </button>
                  </div>
                </div>
              )}

              {stage === "success" && (
                <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-10">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-[#050b16]">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-[0.35em] text-emerald-300">Success</p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-white">Order sent</h2>
                  <p className="mt-3 text-sm leading-6 text-emerald-50/80">
                    Your order details have been prepared for email and the selected products are ready for processing.
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.28em] text-emerald-700">
                    Session {sessionId || "loading..."}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link href="/laptops" className="rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]">
                      Shop more
                    </Link>
                    <button
                      type="button"
                      onClick={resetFlow}
                      className="rounded-full border border-emerald-500/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-400 hover:bg-white/10"
                    >
                      Start new order
                    </button>
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-5">
                <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-8 lg:sticky lg:top-24">
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">Selected product</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Your order summary</h2>

                <div className="mt-6 space-y-4">
                  {summaryItems.map((item) => (
                    <article key={item.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-400">{item.spec}</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Qty {item.qty}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-slate-300">Item price</span>
                        <span className="text-sm font-semibold text-white">{currency(item.price)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-slate-300">Line total</span>
                        <span className="text-sm font-semibold text-white">{currency(item.price * item.qty)}</span>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{currency(summarySubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : currency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (5%)</span>
                    <span>{currency(summaryTax)}</span>
                  </div>
                </div>

                <div className="my-6 border-t border-slate-200 pt-6">
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-semibold text-slate-900">Total</span>
                    <span className="text-3xl font-bold text-slate-900">{currency(summaryTotal)}</span>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-[#0b1d3b] p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">Current step</p>
                  <p className="mt-2 font-semibold">
                    {stage === "form" && "Fill the form"}
                    {stage === "payment" && "Confirm payment"}
                    {stage === "processing" && "Processing your order"}
                    {stage === "success" && "Email draft sent"}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
