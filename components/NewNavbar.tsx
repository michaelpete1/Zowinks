"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
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
    ? "sticky top-0 z-50 border-b border-[#f3c74d]/15 bg-[linear-gradient(180deg,rgba(7,12,24,0.98),rgba(6,14,30,0.96))] text-slate-100 shadow-[0_14px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl"
    : "sticky top-0 z-50 border-b border-[#f3c74d]/15 bg-[linear-gradient(180deg,rgba(7,12,24,0.98),rgba(6,14,30,0.95))] text-slate-100 shadow-sm backdrop-blur-xl";

  const navLinkClassName =
    "text-sm font-semibold tracking-[0.01em] text-slate-300 transition hover:text-white";

  const mobileSurfaceClassName = isHome
    ? "bg-[linear-gradient(180deg,#07142a_0%,#050b16_100%)]"
    : "bg-[#050b16]";

  return (
    <header className={shellClassName}>
      <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-1.5 md:px-8 md:py-2">
        <Link
          href="/"
          className="inline-flex items-center"
          aria-label="Zowkins home"
        >
          <Image
            src="/zowinks-removebg-preview.png"
            alt="Zowkins logo"
            width={132}
            height={72}
            className="h-9 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.14)]"
            priority={isHome}
          />
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
            href="/full-quote-bill"
            className="rounded-full bg-[#f3c74d] px-5 py-2 text-sm font-semibold text-[#050b16] shadow-lg shadow-[#f3c74d]/20 transition hover:bg-[#e4b935]"
          >
            Request Bulk Quote
          </Link>
        </div>

        <button
          type="button"
          className={`ml-auto grid h-8 w-8 place-items-center rounded-full border lg:hidden ${
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

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/75 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className={`fixed inset-y-0 right-0 z-50 w-[92vw] max-w-sm shadow-2xl lg:hidden ${isHome ? "bg-[#050b16] text-slate-100" : "bg-[#050b16] text-slate-100"}`}
          >
            <div
              className={`flex items-center justify-between border-b px-4 py-2.5 ${isHome ? "border-white/10 bg-[#050b16]" : "border-white/10 bg-[#050b16]"}`}
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

            <div className={`space-y-4 px-4 py-3.5 ${mobileSurfaceClassName}`}>
              <form
                onSubmit={submitSearch}
                className="flex items-center gap-2 rounded-full border border-[#d4a11d]/25 bg-white px-4 py-2"
              >
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#f3c74d] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#050b16]"
                >
                  Go
                </button>
              </form>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-4 py-3 text-center font-medium text-slate-100 transition hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4">
                <Link
                  href="/full-quote-bill"
                  className="block rounded-full bg-[#f3c74d] px-4 py-3 text-center text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                  onClick={() => setOpen(false)}
                >
                  Request Bulk Quote
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
