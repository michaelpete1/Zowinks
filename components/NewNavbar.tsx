"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const cartCount = useCart((state) =>
    state.items.reduce((sum, item) => sum + item.qty, 0),
  );

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/laptops", label: "Products" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const shellClassName = isHome
    ? "sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(180deg,rgba(7,19,41,0.96),rgba(12,34,72,0.92))] text-white shadow-[0_14px_40px_rgba(2,6,23,0.35)] backdrop-blur-xl"
    : "sticky top-0 z-50 border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl";

  const navLinkClassName = isHome
    ? "text-sm font-semibold tracking-[0.01em] text-white/85 transition hover:text-white"
    : "text-sm font-semibold tracking-[0.01em] text-slate-600 transition hover:text-slate-900";

  return (
    <header className={shellClassName}>
      <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 md:px-8 md:py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-md ring-1 ring-black/5">
            <Image
              src="/zowinks-removebg-preview.png"
              alt="Zowkins logo"
              width={56}
              height={56}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="hidden lg:block">
            <p className={`font-display text-lg font-semibold leading-none ${isHome ? "text-white" : "text-slate-900"}`}>
              Zowkins
            </p>
            <p className={`text-xs font-medium uppercase tracking-[0.22em] ${isHome ? "text-cyan-100/80" : "text-emerald-700"}`}>
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
            href="/signup"
            className={
              isHome
                ? "rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
            }
          >
            Sign Up
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-amber-200"
          >
            Contact Us
          </Link>
          <Link
            href="/cart"
            className={`relative grid h-10 w-10 place-items-center rounded-full border transition ${
              isHome ? "border-white/12 bg-white/10 text-white hover:bg-white/15" : "border-slate-200 bg-white text-slate-700 hover:border-slate-900"
            }`}
            aria-label="Open cart"
            title="Open cart"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-950 shadow-lg">
              {cartCount}
            </span>
          </Link>
        </div>

        <button
          type="button"
          className={`ml-auto grid h-8 w-8 place-items-center rounded-full border lg:hidden ${
            isHome ? "border-white/12 bg-white/10 text-white" : "border-slate-200 bg-white text-slate-700"
          }`}
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
          title="Toggle menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>
      </nav>

      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/75 lg:hidden" onClick={() => setOpen(false)} />
          <div className={`fixed inset-y-0 right-0 z-50 w-[92vw] max-w-sm shadow-2xl lg:hidden ${isHome ? "bg-[#071529] text-white" : "bg-white text-slate-900"}`}>
            <div className={`flex items-center justify-between border-b px-4 py-2.5 ${isHome ? "border-white/10 bg-[#071529]" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-md ring-1 ring-black/5">
                  <Image
                    src="/zowinks-removebg-preview.png"
                    alt="Zowkins logo"
                    width={56}
                    height={56}
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div>
                  <p className={`font-display text-lg font-semibold leading-none ${isHome ? "text-white" : "text-slate-900"}`}>
                    Zowkins
                  </p>
                  <p className={`text-xs font-medium uppercase tracking-[0.22em] ${isHome ? "text-cyan-100/80" : "text-emerald-700"}`}>
                    Enterprise LTD
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`grid h-8 w-8 place-items-center rounded-lg border ${isHome ? "border-white/10 hover:bg-white/10" : "border-slate-200 hover:bg-slate-50"}`}
                aria-label="Close menu"
                title="Close menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`space-y-4 px-4 py-3.5 ${isHome ? "bg-[#071529]" : "bg-white"}`}>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-xl px-4 py-3 text-center font-medium transition ${isHome ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-50"}`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/signup"
                className={`block rounded-full px-4 py-3 text-center text-sm font-semibold transition ${isHome ? "border border-white/10 bg-white/5 text-white hover:bg-white/10" : "border border-slate-200 bg-white text-slate-900 hover:border-slate-900"}`}
                onClick={() => setOpen(false)}
              >
                Sign Up
              </Link>
              <div className={`space-y-3 border-t pt-4 ${isHome ? "border-white/10" : "border-slate-200"}`}>
                <Link
                  href="/contact"
                  className={`block rounded-full px-4 py-3 text-center text-sm font-semibold transition ${isHome ? "bg-white text-slate-950 hover:bg-amber-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                  onClick={() => setOpen(false)}
                >
                  Contact Us
                </Link>
                <Link
                  href="/cart"
                  className={`relative mx-auto grid h-12 w-12 place-items-center rounded-full border transition ${isHome ? "border-white/12 bg-white/10 text-white hover:bg-white/15" : "border-slate-200 bg-white text-slate-700"}`}
                  onClick={() => setOpen(false)}
                  aria-label="Open cart"
                  title="Open cart"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-950 shadow-lg">
                    {cartCount}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}




