"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const quoteMailto = "mailto:info@zowkins.com?subject=Zowkins%20enterprise%20inquiry";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 md:gap-4">
        <div className="flex flex-shrink-0 items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-900">
            <Image
              src="/zowinks-removebg-preview.png"
              alt="Zowkins logo"
              width={56}
              height={56}
              className="h-11 w-11 object-contain"
            />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-none">Zowkins Enterprise</p>
          </div>
        </div>

        <div className="hidden items-center lg:flex lg:flex-1 xl:flex-[2]">
          <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="text-slate-900 hover:text-slate-900">
              Home
            </Link>
            <Link href="/about" className="text-slate-900">
              About
            </Link>
            <Link href="/accessories">Accessories</Link>
            <Link href="/laptops">Laptops</Link>
            <Link href="/support">Support</Link>
          </div>
        </div>

        <div className="hidden max-w-md flex-1 items-center lg:block xl:flex-[1]">
          <div className="relative">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">All</span>
              <div className="h-3 w-px bg-slate-300" />
              <input
                className="flex-1 bg-transparent pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                placeholder="Search products..."
              />
              <svg
                className="h-4 w-4 text-slate-400"
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
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={quoteMailto}
            className="rounded-full bg-emerald-700 px-3 py-2 text-xs text-white shadow-lg transition hover:bg-emerald-600 lg:px-4 lg:py-2 lg:text-sm"
            aria-label="Message us here"
          >
            Message us here
          </a>
        </div>

        <button
          type="button"
          className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-slate-200 lg:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle menu"
          title="Toggle menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-slate-700"
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

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 h-full w-80 max-w-[90vw] animate-in slide-in-from-right-4 bg-white shadow-2xl duration-300 lg:hidden">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-900">
                <Image
                  src="/zowinks-removebg-preview.png"
                  alt="Zowkins logo"
                  width={56}
                  height={56}
                      className="h-11 w-11 object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold leading-none">Zowkins Enterprise</p>
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
                  <span className="sr-only">Close menu</span>
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">All</span>
                <div className="h-4 w-px bg-slate-300" />
                <input
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  placeholder="Search products..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link
                  href="/"
                  className="block rounded-lg px-4 py-3 text-center font-medium text-slate-900 hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="block rounded-lg px-4 py-3 text-center font-medium text-slate-900 hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/laptops"
                  className="block rounded-lg px-4 py-3 text-center font-medium text-slate-900 hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  Laptops
                </Link>
                <Link
                  href="/accessories"
                  className="block rounded-lg px-4 py-3 text-center font-medium text-slate-900 hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  Accessories
                </Link>
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-4">
                <Link
                  href="/support"
                  className="block rounded-lg px-3 py-3 font-medium text-slate-900 hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  Support
                </Link>
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4">
                <a
                  href={quoteMailto}
                  className="block w-full rounded-full bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600"
                  aria-label="Message us here"
                  onClick={() => setIsOpen(false)}
                >
                  Message us here
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
