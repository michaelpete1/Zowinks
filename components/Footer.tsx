"use client";

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zowkinsApi } from "../lib/zowkins-api";

const hiddenPaths = ["/admin"];

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPortalSession, setIsPortalSession] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const syncSession = () => setIsPortalSession(Boolean(localStorage.getItem("portalToken")));
    syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener("portal-session-expired", syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("portal-session-expired", syncSession);
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await zowkinsApi.logoutPortal();
    } catch {
      // Clear the local session even if the server session has already expired.
    } finally {
      localStorage.removeItem("portalToken");
      localStorage.removeItem("portalUser");
      setIsPortalSession(false);
      setLoggingOut(false);
      router.push("/portal/auth/login");
    }
  };

  if (hiddenPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  const socialLinks = [
    {
      href: "https://wa.me/message/6U6S7AJM4GECJ1",
      label: "WhatsApp",
      title: "Chat on WhatsApp",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19.11 4.93A10.94 10.94 0 0 0 11.41 2a10.84 10.84 0 0 0-9.22 16.56L1 22l3.58-1.15A10.84 10.84 0 0 0 11.4 22h.01A10.93 10.93 0 0 0 19.11 4.93Zm-7.7 16a9 9 0 0 1-4.59-1.25l-.33-.2-2.13.69.7-2.07-.21-.34A8.98 8.98 0 1 1 20 13.07a8.87 8.87 0 0 1-8.59 7.86Zm5.23-6.76c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.3-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.43-1.72-1.6-2.01-.17-.29-.02-.44.13-.59.13-.12.29-.32.44-.48.15-.16.2-.27.3-.45.1-.17.05-.34-.02-.48-.07-.15-.66-1.58-.9-2.16-.24-.58-.49-.5-.66-.51h-.56c-.19 0-.48.07-.73.34-.25.27-.95.93-.95 2.26s.98 2.62 1.12 2.8c.15.19 1.9 2.91 4.61 4.08.64.28 1.14.45 1.53.58.64.21 1.23.18 1.69.11.51-.08 1.72-.7 1.96-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.19-.56-.34Z" />
        </svg>
      ),
    },
    {
      href: "https://www.instagram.com/zowkinsenterprise?utm_source=qr&igsh=ZG1qODFhZnB1Mm5p",
      label: "Instagram",
      title: "Visit Instagram",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 3.5A4.5 4.5 0 1 1 7.5 12 4.51 4.51 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5ZM17.75 6.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
        </svg>
      ),
    },
    {
      href: "https://www.linkedin.com/in/zowkins-enterprise-ltd-7395ab3ba?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      label: "LinkedIn",
      title: "Visit LinkedIn",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4.98 3.5A2.49 2.49 0 1 1 2.5 5.99 2.49 2.49 0 0 1 4.98 3.5ZM3 8.75h4v12H3v-12Zm7 0h3.84v1.64h.05a4.2 4.2 0 0 1 3.79-2.08c4.05 0 4.8 2.66 4.8 6.12v6.32h-4v-5.6c0-1.34-.02-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-4v-12Z" />
        </svg>
      ),
    },
    {
      href: "https://www.facebook.com/share/18k2otvVkU/",
      label: "Facebook",
      title: "Visit Facebook",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.05c0-.87.24-1.46 1.49-1.46h1.62V5.01c-.28-.04-1.23-.13-2.34-.13-2.3 0-3.87 1.4-3.87 3.96V11H7.7v3h2.7v8h3.1Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="border-t border-[#d4a11d]/25 bg-[radial-gradient(circle_at_top,rgba(212,161,29,0.18),transparent_28%),linear-gradient(180deg,#09162c_0%,#050b16_100%)] text-slate-200">
      <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(212,161,29,0.72),rgba(90,178,20,0.65),transparent)]" />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png"
              alt="Zowkins"
              width={240}
              height={240}
              className="h-20 w-20 rounded-full object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.4)]"
              priority
            />
          </div>

          <nav className="flex flex-wrap items-center gap-5 text-sm text-slate-300 md:justify-center">
            <Link href="/" className="transition-colors hover:text-[#f3c74d]">
              Home
            </Link>
            <Link
              href="/products"
              className="transition-colors hover:text-[#5ab214]"
            >
              Products
            </Link>
            <Link
              href="/desktops"
              className="transition-colors hover:text-[#f3c74d]"
            >
              Desktops
            </Link>
            <Link
              href="/accessories"
              className="transition-colors hover:text-[#5ab214]"
            >
              Accessories
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-[#f3c74d]"
            >
              About
            </Link>
            <Link
              href="/request-quote"
              className="transition-colors hover:text-[#5ab214]"
            >
              Request a Quote
            </Link>
          </nav>

          <div className="flex flex-col items-start gap-2 text-xs text-slate-400 md:items-end">
            <a
              href="tel:07036359024"
              className="transition-colors hover:text-[#f3c74d]"
            >
              07036359024
            </a>
            <a
              href="https://wa.me/message/6U6S7AJM4GECJ1"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#5ab214]"
            >
              WhatsApp
            </a>
            <Link
              href="/privacy"
              className="transition-colors hover:text-[#f3c74d]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[#5ab214]"
            >
              Terms and Conditions
            </Link>
            {pathname.startsWith("/portal") && isPortalSession && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-1 rounded-full border border-rose-400/30 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:border-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#f3c74d]">
                Contact
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Call, chat, or visit our social profiles.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="tel:07036359024"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#050b16] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:text-[#f3c74d]"
              >
                <span aria-hidden="true">📞</span>
                Phone
              </a>
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  title={item.title}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#050b16] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:text-[#f3c74d]"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
