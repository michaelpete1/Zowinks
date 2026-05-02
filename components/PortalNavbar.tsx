"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function PortalNavbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("portalToken");
    const userData = localStorage.getItem("portalUser");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setUser({ token, user });
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem("portalToken");
        localStorage.removeItem("portalUser");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalUser");
    setUser(null);
    router.push("/portal/auth/login");
  };

  const links = [
    { href: "/portal", label: "Dashboard" },
    { href: "/portal/orders", label: "Orders" },
    { href: "/portal/quotes/request", label: "Request Quote" },
    { href: "/portal/delivery-addresses", label: "Addresses" },
    { href: "/portal/profile", label: "Profile" },
  ];

  const navLinkClassName = (href: string) =>
    `text-sm font-semibold tracking-[0.01em] transition ${
      pathname === href ? "text-[#f3c74d]" : "text-slate-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#f3c74d]/15 bg-[linear-gradient(180deg,rgba(7,12,24,0.98),rgba(6,14,30,0.96))] text-slate-100 shadow-[0_14px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-1.5 md:px-8 md:py-2">
        <Link
          href="/portal"
          className="inline-flex items-center"
          aria-label="Portal home"
        >
          <Image
            src="/zowinks-removebg-preview.png"
            alt="Zowkins logo"
            width={132}
            height={72}
            className="h-9 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.14)]"
          />
        </Link>

        <div className="hidden items-center justify-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClassName(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link
                href="/portal/orders/create"
                className="rounded-full bg-[#f3c74d] px-4 py-2 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
              >
                New Order
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>

        <button
          type="button"
          className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-[#f3c74d]/25 bg-white/8 text-white lg:hidden"
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
          <div className="fixed inset-y-0 right-0 z-50 w-[92vw] max-w-sm shadow-2xl bg-[#050b16] text-slate-100 lg:hidden">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#050b16] px-4 py-2.5">
              <Link
                href="/portal"
                className="inline-flex items-center"
                onClick={() => setOpen(false)}
                aria-label="Portal home"
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

            <div className="space-y-4 px-4 py-3.5 bg-[#050b16]">
              <div className="grid grid-cols-1 gap-3 text-sm">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-xl px-4 py-3 font-medium transition ${
                      pathname === link.href
                        ? "bg-[#f3c74d]/20 text-[#f3c74d]"
                        : "text-slate-100 hover:bg-white/10"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4">
                {user ? (
                  <>
                    <Link
                      href="/portal/orders/create"
                      className="block rounded-full bg-[#f3c74d] px-4 py-3 text-center text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                      onClick={() => setOpen(false)}
                    >
                      New Order
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="block w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                    >
                      Logout
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
