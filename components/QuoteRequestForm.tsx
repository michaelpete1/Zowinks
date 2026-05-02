"use client";

import { FormEvent, useState } from "react";
import { zowkinsApi } from "../lib/zowkins-api";

type QuoteFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  note: string;
  products: Array<{
    id: string;
    name: string;
    quantity: string;
  }>;
};

type QuoteRequestFormProps = {
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  whatsappLabel?: string;
};

const WHATSAPP_NUMBER = "971543895126";

function createProductRow() {
  return {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `row_${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    quantity: "",
  };
}

const emptyFormState: QuoteFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  street: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  note: "",
  products: [createProductRow()],
};

function buildQuoteLines(formData: QuoteFormState) {
  return [
    "New quote request",
    `Name: ${formData.firstName} ${formData.lastName}`,
    `Email: ${formData.email}`,
    `Phone: ${formData.phoneNumber}`,
    `Street: ${formData.street}`,
    `City: ${formData.city}`,
    `State: ${formData.state}`,
    `Country: ${formData.country}`,
    `Postal code: ${formData.postalCode}`,
    "",
    "Products:",
    ...formData.products.map((product, index) => `- ${index + 1}. ${product.name || "Not provided"} x${product.quantity || "1"}`),
    "",
    `Note: ${formData.note || "N/A"}`,
  ];
}

export default function QuoteRequestForm({
  className = "",
  eyebrow = "Quote request",
  title = "Request a Quote",
  description = "Tell us what you need and we will reply with pricing, delivery, and availability.",
  submitLabel = "Submit quote request",
  whatsappLabel = "Request via WhatsApp",
}: QuoteRequestFormProps) {
  const [formData, setFormData] = useState<QuoteFormState>(emptyFormState);
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const hasProduct = formData.products.some((product) => product.name.trim() && product.quantity.trim());

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.country.trim() ||
      !formData.postalCode.trim() ||
      !hasProduct
    ) {
      setError("Fill in your name, contact details, delivery address, and at least one product with quantity.");
      return false;
    }

    setError("");
    return true;
  };

  const addProductRow = () => {
    setFormData((current) => ({
      ...current,
      products: [...current.products, createProductRow()],
    }));
  };

  const updateProductRow = (index: number, field: "name" | "quantity", value: string) => {
    setFormData((current) => ({
      ...current,
      products: current.products.map((product, productIndex) =>
        productIndex === index ? { ...product, [field]: value } : product,
      ),
    }));
  };

  const removeProductRow = (index: number) => {
    setFormData((current) => ({
      ...current,
      products: current.products.length > 1
        ? current.products.filter((_, productIndex) => productIndex !== index)
        : current.products,
    }));
  };

  const openWhatsApp = () => {
    const body = buildQuoteLines(formData).join("\n");
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleApiSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError("");

    try {
      const validItems = formData.products
        .filter((product) => product.name.trim() && product.quantity.trim())
        .map((product) => ({
          name: product.name.trim(),
          quantity: Number(product.quantity),
        }));

      await zowkinsApi.requestPortalQuote(null, {
        customer: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
        },
        items: validItems,
        deliveryAddress: {
          phoneNumber: formData.phoneNumber.trim(),
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          postalCode: formData.postalCode.trim(),
        },
        note: formData.note.trim() || undefined,
      });

      setStatus("sent");
      window.setTimeout(() => setStatus("idle"), 2500);
      setFormData(emptyFormState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    if (!validate()) return;

    openWhatsApp();
    setStatus("sent");
    window.setTimeout(() => setStatus("idle"), 2500);
    setFormData(emptyFormState);
  };

  return (
    <div className={`rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:p-8 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">{eyebrow}</p>
      <h3 className="mt-3 font-display text-3xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>

      {status === "sent" ? (
        <div className="mt-6 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-50 shadow-[0_12px_30px_rgba(0,0,0,0.16)] animate-[fadeIn_0.4s_ease-out]">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">Quote request opened</p>
              <p className="mt-1 text-sm leading-6 text-emerald-50/80">
                Your request has been sent to the backend. You can still continue on WhatsApp if you want.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleApiSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="sr-only" htmlFor="quote-first-name">
            First name
          </label>
          <input
            id="quote-first-name"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="First name"
            value={formData.firstName}
            onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
          />
          <label className="sr-only" htmlFor="quote-last-name">
            Last name
          </label>
          <input
            id="quote-last-name"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="sr-only" htmlFor="quote-email">
            Email address
          </label>
          <input
            id="quote-email"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="Email address"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          />
          <label className="sr-only" htmlFor="quote-phone">
            Phone number
          </label>
          <input
            id="quote-phone"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="Phone number"
            value={formData.phoneNumber}
            onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20 md:col-span-2"
            placeholder="Street address"
            value={formData.street}
            onChange={(event) => setFormData({ ...formData, street: event.target.value })}
          />
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="City"
            value={formData.city}
            onChange={(event) => setFormData({ ...formData, city: event.target.value })}
          />
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="State"
            value={formData.state}
            onChange={(event) => setFormData({ ...formData, state: event.target.value })}
          />
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="Country"
            value={formData.country}
            onChange={(event) => setFormData({ ...formData, country: event.target.value })}
          />
          <input
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="Postal code"
            value={formData.postalCode}
            onChange={(event) => setFormData({ ...formData, postalCode: event.target.value })}
          />
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p id="quote-products-label" className="text-sm font-semibold text-white">Products needed</p>
              <p className="text-xs text-slate-400">Add one product or multiple products with their quantities.</p>
            </div>
            <button
              type="button"
              onClick={addProductRow}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
            >
              Add another product
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {formData.products.map((product, index) => (
              <div key={product.id} className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
                <label className="sr-only" htmlFor={`quote-product-${index}`}>
                  Product {index + 1}
                </label>
                <input
                  id={`quote-product-${index}`}
                  aria-labelledby="quote-products-label"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
                  placeholder={`Product ${index + 1}`}
                  value={product.name}
                  onChange={(event) => updateProductRow(index, "name", event.target.value)}
                />
                <label className="sr-only" htmlFor={`quote-qty-${index}`}>
                  Quantity for product {index + 1}
                </label>
                <input
                  id={`quote-qty-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
                  placeholder="Qty"
                  inputMode="numeric"
                  value={product.quantity}
                  onChange={(event) => updateProductRow(index, "quantity", event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeProductRow(index)}
                  className="rounded-2xl border border-white/10 bg-[#0a1020] px-4 py-3 text-sm font-semibold text-white transition hover:border-rose-500/40 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={formData.products.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <textarea
          aria-label="Additional quote details"
          rows={5}
          className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
          placeholder="Tell us what you need, the quantity, and any extra notes..."
          value={formData.note}
          onChange={(event) => setFormData({ ...formData, note: event.target.value })}
        />

        {error ? <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
          >
            {submitting ? "Submitting..." : submitLabel}
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#5ab214]/45 hover:bg-white/10"
          >
            {whatsappLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
