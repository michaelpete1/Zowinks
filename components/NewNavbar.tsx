"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";

export default function Navbar() {
  const items = useCart((state) => state.items);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/categories", label: "Categories" },
    { href: "/products", label: "Products" },
    { href: "/services", label: "Services" },
  ];
  const commerceLinks = [];

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const shellClassName = isHome
    ? "sticky top-0 z-[9999] border-b border-[#f3c74d]/15 bg-[linear-gradient(180deg,rgba(7,12,24,0.98),rgba(6,14,30,0.96))] text-slate-100 shadow-[0_14px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl"
    : "sticky top-0 z-[9999] border-b border-[#f3c74d]/15 bg-[linear-gradient(180deg,rgba(7,12,24,0.98),rgba(6,14,30,0.95))] text-slate-100 shadow-sm backdrop-blur-xl";

  const navLinkClassName =
    "text-sm font-semibold tracking-[0.01em] text-slate-300 transition hover:text-white";

  const mobileSurfaceClassName = isHome
    ? "bg-[linear-gradient(180deg,#07142a_0%,#050b16_100%)]"
    : "bg-[#050b16]";

  return (
    <>
      <header className={shellClassName}>
        <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 sm:px-4 md:px-8 md:py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-white/8 px-2.5 py-1.5 ring-1 ring-white/10 backdrop-blur-sm"
          aria-label="Zowkins home"
        >
          <Image
            src="/zowinks-removebg-preview.png"
            alt="Zowkins logo"
            width={118}
            height={64}
            className="h-8 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.14)] sm:h-9"
            priority={isHome}
          />
          <div className="hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
              Zowkins
            </p>
            <p className="font-display text-sm font-semibold text-white">
              Enterprise LTD
            </p>
          </div>
        </Link>

        <div className="hidden items-center justify-center gap-6 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClassName}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/cart"
            className="relative rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:border-[#f3c74d]/45 hover:bg-white/10"
            aria-label="View cart"
            title="View cart"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.6}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#f3c74d] text-[10px] font-bold text-[#050b16]">
                {items.length}
              </span>
            )}
          </Link>
          <Link
            href="/full-quote-bill"
            className="rounded-full bg-[#f3c74d] px-5 py-2 text-sm font-semibold text-[#050b16] shadow-lg shadow-[#f3c74d]/20 transition hover:bg-[#e4b935]"
          >
            Request Bulk Quote
          </Link>
        </div>

        <button
          type="button"
          className={`ml-auto grid h-10 w-10 place-items-center rounded-full border bg-[#050b16]/95 shadow-[0_8px_20px_rgba(0,0,0,0.18)] lg:hidden ${
            isHome
              ? "border-[#f3c74d]/25 bg-white/8 text-white"
              : "border-[#f3c74d]/25 bg-white/8 text-white"
          }`}
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
          title="Toggle menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>
        </nav>
    </header>

    {open ? (
      <>
        <div
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        />
        <div
          className={`fixed inset-0 z-[10001] overflow-y-auto shadow-2xl transition-transform duration-300 ease-out lg:hidden ${isHome ? "bg-[linear-gradient(180deg,#07142a_0%,#050b16_100%)] text-slate-100" : "bg-[#050b16] text-slate-100"} animate-[rise_0.45s_ease-out]`}
        >
          <div
            className={`flex items-center justify-between border-b px-4 py-3 backdrop-blur-xl ${isHome ? "border-white/10 bg-[#07142a]/95" : "border-white/10 bg-[#050b16]/95"}`}
          >
            <Link
              href="/"
              className="inline-flex items-center"
              onClick={() => setOpen(false)}
              aria-label="Zowkins home"
            >
              <Image
                src="/zowinks-removebg-preview.png"
                alt="Zowkins logo"
                width={132}
                height={72}
                className="h-9 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.14)]"
              />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 hover:bg-white/10"
              aria-label="Close menu"
              title="Close menu"
            >
              <svg
                className="h-5 w-5"
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

          <div className={`space-y-5 px-4 py-5 ${mobileSurfaceClassName}`}>
            <form
              onSubmit={submitSearch}
              className="flex items-center gap-2 rounded-[1.4rem] border border-[#d4a11d]/25 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition focus-within:border-[#f3c74d] focus-within:shadow-[0_16px_36px_rgba(243,199,77,0.16)]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3c74d]/15 text-[#050b16]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4 4" strokeLinecap="round" />
                </svg>
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products"
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 sm:text-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-[#f3c74d] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#050b16] transition hover:bg-[#e4b935] active:scale-[0.98]"
              >
                Go
              </button>
            </form>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 animate-[fadeIn_0.35s_ease-out]">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-center font-semibold text-slate-100 transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4 animate-[fadeIn_0.45s_ease-out]">
              <Link
                href="/cart"
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#f3c74d]/45 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.6}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Cart {items.length > 0 && `(${items.length})`}
              </Link>
              <Link
                href="/full-quote-bill"
                className="block rounded-full bg-[#f3c74d] px-4 py-3 text-center text-sm font-semibold text-[#050b16] transition duration-200 hover:-translate-y-0.5 hover:bg-[#e4b935]"
                onClick={() => setOpen(false)}
              >
                Request Bulk Quote
              </Link>
            </div>
          </div>
        </div>
      </>
    ) : null}
    </>
  );
}
