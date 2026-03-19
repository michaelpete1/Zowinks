"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const cartCount = useCart((state) =>
    state.items.reduce((total, item) => total + item.qty, 0),
  );

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/laptops", label: "Laptops" },
    { href: "/accessories", label: "Accessories" },
    { href: "/contact", label: "Contact" },
  ];

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/90 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-8 lg:px-12">
        <Link href="/" className="flex flex-shrink-0 items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl ring-2 ring-white/20">
            <Image
              src="/zowinkss-removebg-preview.png"
              alt="Zowkins logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain drop-shadow-lg"
            />
          </div>
          <div className="hidden lg:block">
            <p className="font-display text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Zowkins
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
              Enterprise LTD
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.slice(0, 4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-slate-700 transition hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <form
          onSubmit={handleSearch}
          className="hidden flex-1 items-center lg:flex xl:w-1/2"
        >
          <div className="relative ml-8 w-full max-w-xl">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-2xl border border-white/50 bg-white/80 py-3 pl-12 pr-16 text-sm shadow-xl outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
              placeholder="Search products, brands, or accessories..."
              aria-label="Search products"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
              aria-label="Submit search"
            >
              Search
            </button>
          </div>
        </form>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/signin"
            className="rounded-2xl border border-white/40 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-white"
          >
            Sign In
          </Link>
          <button
            type="button"
            className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-2xl transition hover:from-emerald-600 hover:to-emerald-700"
          >
            Request Quote
          </button>
          <Link
            href="/cart"
            className="relative ml-2 grid h-12 w-12 place-items-center rounded-3xl border border-white/40 bg-white/80 shadow-xl transition hover:shadow-2xl"
            aria-label="Open cart"
            title="Open cart"
          >
            <svg
              className="h-5 w-5 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-xs font-bold text-white shadow-lg">
              {cartCount}
            </span>
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto grid h-12 w-12 place-items-center rounded-3xl border border-white/40 bg-white/80 shadow-xl transition hover:shadow-2xl lg:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle menu"
          title="Toggle menu"
        >
          <svg
            className="h-6 w-6 text-slate-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-white/30 bg-white/95 shadow-2xl lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl">
                  <Image
                    src="/zowinkss-removebg-preview.png"
                    alt="Zowkins"
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-slate-900">
                    Zowkins
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
                    Enterprise LTD
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg border hover:bg-slate-50"
                aria-label="Close menu"
                title="Close menu"
              >
                <svg
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <svg
                  className="mr-4 h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="flex-1 bg-transparent text-base placeholder:text-slate-500 focus:outline-none"
                  placeholder="Search products..."
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="ml-3 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Go
                </button>
              </div>
            </form>

            <div className="mb-6 grid grid-cols-2 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center text-lg font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-4">
              <Link
                href="/signin"
                className="block w-full rounded-2xl border border-slate-200 bg-white/70 px-6 py-4 text-center text-lg font-semibold backdrop-blur transition hover:bg-white hover:shadow-xl"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <button className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-lg font-bold text-white shadow-2xl transition hover:from-emerald-600 hover:to-emerald-700">
                Request Quote
              </button>
              <Link
                href="/cart"
                className="relative mx-auto grid h-14 w-14 place-items-center rounded-3xl border border-white/40 bg-white/80 shadow-xl transition hover:shadow-2xl"
                aria-label="Open cart"
                title="Open cart"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="h-6 w-6 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-sm font-bold text-white shadow-lg">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

