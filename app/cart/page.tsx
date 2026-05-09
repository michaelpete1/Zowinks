"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/NewNavbar";
import { useCart, type CartItem } from "../../hooks/useCart";
import {
  zowkinsApi,
  type DeliveryMethod,
  type PortalCreateAccountInput,
  type PortalLoginInput,
  type CreatePortalOrderInput,
  type PortalOrder,
  normalizeOrderGender,
} from "../../lib/zowkins-api";

type OrderStage = "form" | "processing" | "success";

const MONGO_OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

type OrderFormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  gender: "male" | "female";
  deliveryAddress: string;
  pickupPoint: string;
  note: string;
  deliveryMethod: string;
};

const emptyFormState: OrderFormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  country: "Nigeria",
  postalCode: "",
  gender: "male",
  deliveryAddress: "",
  pickupPoint: "",
  note: "",
  deliveryMethod: "",
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
  const removeItem = useCart((state) => state.removeItem);
  const [formData, setFormData] = useState<OrderFormState>(emptyFormState);
  const [stage, setStage] = useState<OrderStage>("form");
  const [orderReference, setOrderReference] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [loadingDeliveryMethods, setLoadingDeliveryMethods] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<{
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const shipping = 0;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;
  const summaryItems = submittedOrder?.items ?? items;
  const summarySubtotal = submittedOrder?.subtotal ?? subtotal;
  const summaryTax = submittedOrder?.tax ?? tax;
  const summaryTotal = submittedOrder?.total ?? total;

  const totalLabel = currency(summaryTotal);

  const selectedLocation =
    formData.deliveryAddress || formData.pickupPoint || "Not provided yet";

  useEffect(() => {
    setSelectedItemIds((current) =>
      current.filter((id) => items.some((item) => item.id === id)),
    );
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    const loadDeliveryMethods = async () => {
      setLoadingDeliveryMethods(true);
      try {
        const methods: DeliveryMethod[] = await zowkinsApi.listDeliveryMethods();
        if (cancelled) return;

        const availableMethods = methods.filter(
          (method) =>
            method.isActive &&
            method.visibility &&
            MONGO_OBJECT_ID_PATTERN.test(method.id),
        );
        setDeliveryMethods(availableMethods);

        setFormData((current) => {
          if (current.deliveryMethod || !availableMethods.length) {
            return current;
          }

          return {
            ...current,
            deliveryMethod: availableMethods[0].id,
          };
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load delivery methods");
        }
      } finally {
        if (!cancelled) {
          setLoadingDeliveryMethods(false);
        }
      }
    };

    loadDeliveryMethods();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedItemCount = selectedItemIds.length;

  const toggleSelectedItem = (id: string) => {
    setSelectedItemIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemCount === summaryItems.length) {
      setSelectedItemIds([]);
      return;
    }

    setSelectedItemIds(summaryItems.map((item) => item.id));
  };

  const removeSelectedItems = () => {
    selectedItemIds.forEach((id) => removeItem(id));
    setSelectedItemIds([]);
  };

  const submitOrder = async () => {
    const nameParts = formData.name.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || formData.name.trim();
    const lastName = nameParts.slice(1).join(" ") || "";
    const street = formData.deliveryAddress.trim() || formData.pickupPoint.trim();

    if (!street) {
      throw new Error("Add either a delivery address or a pick-up point.");
    }

    const selectedDeliveryMethod = formData.deliveryMethod.trim();

    if (!selectedDeliveryMethod) {
      throw new Error("Select a delivery method before placing your order.");
    }

    if (!MONGO_OBJECT_ID_PATTERN.test(selectedDeliveryMethod)) {
      throw new Error("Select a valid delivery method.");
    }

    const payload: CreatePortalOrderInput = {
      customer: {
        firstName,
        lastName,
        gender: normalizeOrderGender(formData.gender),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
      },
      from: {
        email: formData.email.trim(),
      },
      argument: {
        from: {
          email: formData.email.trim(),
        },
      },
      items: summaryItems.map((item) => ({
        productId: item.id,
        quantity: item.qty,
      })),
      deliveryAddress: {
        phoneNumber: formData.phone.trim(),
        street,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || "Nigeria",
        postalCode: formData.postalCode.trim(),
      },
      deliveryMethod: selectedDeliveryMethod,
    };

    const response = await zowkinsApi.createPortalOrder(
      localStorage.getItem("portalToken"),
      payload,
    );

    return response.order;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!items.length) {
      setError("Add a product first, then place the order.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.city.trim() ||
      !formData.state.trim()
    ) {
      setError("Fill in your name, email, phone, city, and state.");
      return;
    }

    if (!formData.deliveryAddress.trim() && !formData.pickupPoint.trim()) {
      setError("Add either a delivery address or a pick-up point.");
      return;
    }

    setSubmittedOrder({
      items,
      subtotal,
      tax,
      total,
    });
    setSubmitting(true);

    try {
      setStage("processing");
      const order = await submitOrder();
      setOrderReference(order.orderNumber || order.id);
      setStage("success");
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
      setStage("form");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setFormData(emptyFormState);
    setStage("form");
    setOrderReference("");
    setSubmittedOrder(null);
    setSelectedItemIds([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-3 py-8 sm:px-4 sm:py-10 md:py-16">
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1020] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="grid gap-8 px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
            <div className="space-y-4 sm:space-y-5">
              <p className="text-xs uppercase tracking-[0.35em] text-[#5ab214]">
                Order form
              </p>
              <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Fill in your order details and choose how you want to pay.
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                The items you selected are listed below with their price and
                quantity. Complete the form, then continue to payment or pay on
                delivery.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="w-full rounded-full bg-[#0b1d3b] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#12386a] sm:w-auto"
                >
                  Continue shopping
                </Link>
                <Link
                  href="/delivery-methods"
                  className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10 sm:w-auto"
                >
                  Delivery methods
                </Link>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10 sm:w-auto"
                >
                  Reset form
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full rounded-full border border-rose-500/20 bg-rose-500/10 px-6 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 sm:w-auto"
                >
                  Clear all items
                </button>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-medium text-white">
                  {items.length} selected item{items.length === 1 ? "" : "s"}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-white/25 sm:inline-block" />
                <span>Pay now or pay on delivery</span>
                <span className="hidden h-1 w-1 rounded-full bg-white/25 sm:inline-block" />
                <span>Email order details after checkout</span>
              </div>
            </div>
          </div>
        </section>

        {!items.length && stage === "form" ? (
          <section className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-12">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-white/10">
              <svg
                className="h-12 w-12 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold text-white">
              No selected product yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-slate-300">
              Use the Order Now button on any product page and each selected
              item will appear here automatically.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]"
              >
                Shop products
              </Link>
              <Link
                href="/accessories"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                Shop accessories
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-5">
              {stage === "form" && (
                <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:p-6 md:p-8">
                  <div className="mb-6 border-b border-white/10 pb-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                      Checkout details
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                      Tell us where to deliver or where to pick up
                    </h2>
                  </div>

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                          Full name
                        </label>
                        <input
                          value={formData.name}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              name: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              email: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                          Gender
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              gender: event.target.value === "female" ? "female" : "male",
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                          Phone
                        </label>
                        <input
                          value={formData.phone}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              phone: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                          placeholder="+234..."
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                          City
                        </label>
                        <input
                          value={formData.city}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              city: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                          placeholder="City"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                          State
                        </label>
                        <input
                          value={formData.state}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              state: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                            placeholder="State"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white">
                            Country
                          </label>
                          <input
                            value={formData.country}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                country: event.target.value,
                              })
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                            placeholder="Country"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white">
                            Postal code
                          </label>
                          <input
                            value={formData.postalCode}
                            onChange={(event) =>
                              setFormData({
                                ...formData,
                                postalCode: event.target.value,
                              })
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                            placeholder="Postal code"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                          Delivery address
                        </label>
                        <textarea
                          rows={4}
                          value={formData.deliveryAddress}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              deliveryAddress: event.target.value,
                            })
                          }
                          className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                          placeholder="House number, street, landmark, and any delivery notes"
                        />
                      </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">
                        Order note
                      </label>
                      <textarea
                        rows={3}
                        value={formData.note}
                        onChange={(event) =>
                          setFormData({ ...formData, note: event.target.value })
                        }
                        className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#f3c74d]/60 focus:bg-white/10 sm:text-sm"
                        placeholder="Any extra instructions for the order"
                      />
                    </div>

                      <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <label className="block text-sm font-semibold text-white">
                        Delivery method
                      </label>
                      <select
                        value={formData.deliveryMethod}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            deliveryMethod: event.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-white/10 bg-[#0a1020] px-4 py-3 text-base text-white outline-none transition focus:border-[#f3c74d]/60 sm:text-sm"
                        disabled={loadingDeliveryMethods}
                      >
                        <option value="">
                          {loadingDeliveryMethods
                            ? "Loading delivery methods..."
                            : "Choose a delivery method"}
                        </option>
                        {deliveryMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.name} - {currency(method.fee)}
                          </option>
                        ))}
                      </select>
                      {deliveryMethods.length === 0 && !loadingDeliveryMethods ? (
                        <p className="text-xs text-slate-300">
                          Delivery methods are not available right now. Please try again later.
                        </p>
                      ) : null}
                      </div>

                      {error ? (
                        <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                          {error}
                        </p>
                      ) : null}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-full bg-[#0b1d3b] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#0b1d3b]/20 transition hover:bg-[#12386a]"
                      >
                        {submitting ? "Submitting..." : "Place order"}
                      </button>
                  </form>
                </div>
              )}

              {stage === "processing" && (
                <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:p-10">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-500/10 text-amber-300">
                    <svg
                      className="h-8 w-8 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-[0.35em] text-white/55">
                    Processing
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-white">
                    Your order is being processed
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    We have created your order in the backend. Our team can now
                    follow up.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/laptops"
                      className="rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]"
                    >
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
                    <svg
                      viewBox="0 0 24 24"
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-[0.35em] text-emerald-300">
                    Success
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-white">
                    Order sent
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-emerald-50/80">
                    Your order has been submitted successfully and the selected
                    products are ready for processing.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/laptops"
                      className="rounded-full bg-[#0b1d3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a]"
                    >
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
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                  Selected product
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                  Your order summary
                </h2>

                {stage === "form" && summaryItems.length > 0 ? (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10 sm:w-auto"
                    >
                      {selectedItemCount === summaryItems.length
                        ? "Deselect all"
                        : "Select all"}
                    </button>
                    <button
                      type="button"
                      onClick={removeSelectedItems}
                      disabled={!selectedItemCount}
                      className="w-full rounded-full bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      Cancel selected ({selectedItemCount})
                    </button>
                  </div>
                ) : null}

                <div className="mt-6 space-y-4">
                  {summaryItems.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          {stage === "form" ? (
                            <input
                              type="checkbox"
                              checked={selectedItemIds.includes(item.id)}
                              onChange={() => toggleSelectedItem(item.id)}
                              aria-label={`Select ${item.title} for cancellation`}
                              title={`Select ${item.title} for cancellation`}
                              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-[#f3c74d] focus:ring-[#f3c74d]"
                            />
                          ) : null}
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                              <Image
                                src={
                                  typeof item.image === "string"
                                    ? item.image
                                    : (item.image as any)?.url || "/desktop.jpg"
                                }
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white sm:text-base truncate">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-400 sm:text-xs">
                                {item.spec}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white shrink-0 sm:text-xs">
                          Qty {item.qty}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-slate-300">
                          Item price
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {currency(item.price)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-slate-300">
                          Line total
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {currency(item.price * item.qty)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>{currency(summarySubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : currency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tax (5%)</span>
                    <span>{currency(summaryTax)}</span>
                  </div>
                </div>

                <div className="my-6 border-t border-white/10 pt-6">
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-semibold text-white">
                      Total
                    </span>
                    <span className="text-3xl font-bold text-white">
                      {currency(summaryTotal)}
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-[#0b1d3b] p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Current step
                  </p>
                  <p className="mt-2 font-semibold">
                    {stage === "form" && "Fill the form"}
                    {stage === "processing" && "Processing your order"}
                    {stage === "success" && "Order created"}
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
