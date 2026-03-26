"use client";

import { FormEvent, useMemo, useState } from "react";

type QuoteFormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
  products: Array<{
    name: string;
    quantity: string;
  }>;
};

type QuoteRequestFormProps = {
  className?: string;
  title?: string;
  description?: string;
};

const ORDER_EMAIL = "info@zowkins.com";
const WHATSAPP_NUMBER = "971543895126";

const emptyFormState: QuoteFormState = {
  name: "",
  email: "",
  phone: "",
  location: "",
  message: "",
  products: [
    {
      name: "",
      quantity: "",
    },
  ],
};

function buildQuoteLines(formData: QuoteFormState) {
  return [
    "New quote request",
    `Name: ${formData.name}`,
    `Email: ${formData.email}`,
    `Phone: ${formData.phone}`,
    `Location: ${formData.location || "Not provided"}`,
    "",
    "Products:",
    ...formData.products.map((product, index) => `- ${index + 1}. ${product.name || "Not provided"} x${product.quantity || "1"}`),
    "",
    `Message: ${formData.message || "N/A"}`,
  ];
}

export default function QuoteRequestForm({
  className = "",
  title = "Request a Quote",
  description = "Tell us what you need and we will reply with pricing, delivery, and availability.",
}: QuoteRequestFormProps) {
  const [formData, setFormData] = useState<QuoteFormState>(emptyFormState);
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState("");

  const quoteSubject = useMemo(() => {
    const firstProduct = formData.products.find((product) => product.name.trim());
    return `Zowkins quote request - ${firstProduct?.name || "new inquiry"}`;
  }, [formData.products]);

  const validate = () => {
    const hasProduct = formData.products.some((product) => product.name.trim() && product.quantity.trim());

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !hasProduct) {
      setError("Fill in your name, email, phone, and at least one product with quantity.");
      return false;
    }

    setError("");
    return true;
  };

  const addProductRow = () => {
    setFormData((current) => ({
      ...current,
      products: [...current.products, { name: "", quantity: "" }],
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

  const openEmailDraft = () => {
    const body = buildQuoteLines(formData).join("\n");
    const mailto = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(quoteSubject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank", "noopener,noreferrer");
  };

  const openWhatsApp = () => {
    const body = buildQuoteLines(formData).join("\n");
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    openEmailDraft();
    setStatus("sent");
    window.setTimeout(() => setStatus("idle"), 2500);
    setFormData(emptyFormState);
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
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">Quote request</p>
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
                Your request has been prepared. You can send it by email or continue on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleEmailSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="sr-only" htmlFor="quote-name">
            Full name
          </label>
          <input
            id="quote-name"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="Full name"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          />
          <label className="sr-only" htmlFor="quote-email">
            Work email
          </label>
          <input
            id="quote-email"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="Work email"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="sr-only" htmlFor="quote-phone">
            Phone number
          </label>
          <input
            id="quote-phone"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="Phone number"
            value={formData.phone}
            onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
          />
          <label className="sr-only" htmlFor="quote-location">
            City, state, or delivery area
          </label>
          <input
            id="quote-location"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:bg-white/10 focus:ring-2 focus:ring-[#f3c74d]/20"
            placeholder="City / state / delivery area"
            value={formData.location}
            onChange={(event) => setFormData({ ...formData, location: event.target.value })}
          />
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p id="quote-products-label" className="text-sm font-semibold text-white">Product needed</p>
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
              <div key={`${index}-${product.name}`} className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
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
          placeholder="Tell us what you need, the quantity, and any delivery details..."
          value={formData.message}
          onChange={(event) => setFormData({ ...formData, message: event.target.value })}
        />

        {error ? <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
          >
            Send quote by email
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#5ab214]/45 hover:bg-white/10"
          >
            Request via WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
}
