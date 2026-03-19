"use client";

import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import { useCart, type CartItem } from "../../hooks/useCart";

export default function Cart() {
  const items = useCart((state): CartItem[] => state.items);
  const updateQty = useCart((state) => state.updateQty);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clearCart);
  const getTotal = useCart((state) => state.getTotal);

  const subtotal: number = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping: number = 0;
  const tax: number = subtotal * 0.05;
  const total: number = subtotal + shipping + tax;
  const totalLabel = total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc,_#eef2ff)] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Shopping cart</p>
              <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
                Review your selected items before checkout.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Your cart keeps track of each product you add across the store, so you can compare,
                adjust quantities, and check out when ready.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/laptops" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Continue shopping
                </Link>
                <button type="button" onClick={clearCart} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                  Clear cart
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-3xl font-bold text-slate-900">{items.length}</p>
                <p className="mt-1 text-sm text-slate-600">Items in cart</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-3xl font-bold text-slate-900">Free</p>
                <p className="mt-1 text-sm text-slate-600">Shipping eligible</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-3xl font-bold text-slate-900">24h</p>
                <p className="mt-1 text-sm text-slate-600">Quote support</p>
              </div>
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-12">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-slate-100">
              <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold text-slate-900">Your cart is empty</h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-slate-600">
              Add products from HP, Dell, Lenovo, or accessories and they will appear here.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/laptops" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Shop laptops
              </Link>
              <Link href="/accessories" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
                Shop accessories
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-5">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Items</p>
                    <h2 className="font-display text-2xl font-semibold text-slate-900">Selected products</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{items.length} items</span>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <article key={item.id} className="group flex gap-4 rounded-[1.5rem] border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50/80 md:gap-6 md:p-5">
                      <div className="grid h-24 w-24 flex-shrink-0 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-display text-2xl font-bold text-slate-700">
                            {item.title.slice(0, 1)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-xl font-semibold text-slate-900">{item.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">{item.spec}</p>
                          </div>
                          <button type="button" onClick={() => removeItem(item.id)} className="text-sm font-semibold text-red-500 transition hover:text-red-600">
                            Remove
                          </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1">
                            <button type="button" onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} className="grid h-9 w-9 place-items-center rounded-full text-lg font-semibold text-slate-600 transition hover:bg-slate-100">
                              -
                            </button>
                            <span className="min-w-8 px-2 text-center font-mono text-sm font-semibold">{item.qty}</span>
                            <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} className="grid h-9 w-9 place-items-center rounded-full text-lg font-semibold text-slate-600 transition hover:bg-slate-100">
                              +
                            </button>
                          </div>
                          <span className="text-2xl font-bold text-emerald-700">
                            {(item.price * item.qty).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recommended</p>
                    <h2 className="font-display text-2xl font-semibold text-slate-900">Complete the setup</h2>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { title: "Wireless Mouse", price: "$49" },
                    { title: "USB-C Hub", price: "$59" },
                    { title: "Laptop Bag", price: "$69" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-4 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200" />
                      <p className="font-display text-lg font-semibold text-slate-900">{item.title}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-700">{item.price}</span>
                        <Link href="/accessories" className="text-sm font-semibold text-slate-900 underline-offset-4 hover:underline">
                          Add
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-8 lg:sticky lg:top-24">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Order summary</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900">Your totals</h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : shipping.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (5%)</span>
                    <span>{tax.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                  </div>
                </div>

                <div className="my-6 border-t border-slate-200 pt-6">
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-semibold text-slate-900">Total</span>
                    <span className="text-3xl font-bold text-slate-900">{totalLabel}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button type="button" className="w-full rounded-full bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-700">
                    Proceed to checkout
                  </button>
                  <Link href="/laptops" className="block w-full rounded-full border border-slate-200 bg-white px-6 py-4 text-center text-base font-semibold text-slate-900 transition hover:border-slate-900">
                    Continue shopping
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Secure checkout</p>
                <h3 className="mt-2 font-display text-2xl font-semibold">Fast payment flow</h3>
                <p className="mt-3 text-sm text-slate-300">
                  We can move this order into a quote, invoice, or direct checkout depending on your procurement flow.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}


