"use client";

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAdminSession } from "../hooks/useAdminSession";

type IconName =
  | "grid"
  | "layers"
  | "orders"
  | "contacts"
  | "settings"
  | "menu"
  | "logout"
  | "shield"
  | "mail"
  | "user"
  | "search"
  | "truck"
  | "team"
  | "plus"
  | "trash"
  | "edit"
  | "tag";

const navItems = [
  { label: "Dashboard", icon: "grid", href: "/admin" },
  { label: "Products", icon: "layers", href: "/admin/products" },
  { label: "Categories", icon: "tag", href: "/admin/categories" },
  { label: "Orders", icon: "orders", href: "/admin/orders" },
  { label: "Delivery", icon: "truck", href: "/admin/delivery-methods" },
  { label: "Customers", icon: "contacts", href: "/admin/customers" },
  { label: "Team", icon: "team", href: "/admin/team" },
  { label: "Settings", icon: "settings", href: "/admin/settings" },
] as const;

function getAccessTokenExpiry(accessToken: string): number | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(
      window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    ) as { exp?: unknown };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AdminIcon({ name }: { name: IconName }) {
  const base = "h-5 w-5 shrink-0";
  switch (name) {
    case "grid":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </svg>
      );
    case "layers":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3 3 8l9 5 9-5-9-5z" />
          <path d="M3 12l9 5 9-5" />
          <path d="M3 16l9 5 9-5" />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6h16v12H4z" />
          <path d="M8 10h8M8 14h5" />
        </svg>
      );
    case "contacts":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
          <path d="M19.4 15a7.97 7.97 0 0 0 .1-1 7.97 7.97 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L15 5h-6l-.3 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.97 7.97 0 0 0-.1 1 7.97 7.97 0 0 0 .1 1l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1L9 19h6l.3-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5z" />
        </svg>
      );
    case "menu":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M21 4v16" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3z" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        </svg>
      );
    case "truck":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 7h11v10H3z" />
          <path d="M14 10h4l3 3v4h-7z" />
          <circle cx="7" cy="19" r="1.5" />
          <circle cx="18" cy="19" r="1.5" />
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M17 11a4 4 0 1 0 0-8" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "trash":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 13h10l1-13" />
          <path d="M9 7V4h6v3" />
        </svg>
      );
    case "edit":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 20h4l10-10-4-4L4 16v4z" />
          <path d="M13 7l4 4" />
        </svg>
      );
    case "tag":
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 13 13 20l-9-9V4h7l9 9z" />
          <circle cx="8.5" cy="8.5" r="1.2" />
        </svg>
      );
    default:
      return null;
  }
}

export function AdminBadge({
  label,
  status,
}: {
  label: string;
  status?: string;
}) {
  const palette: Record<string, string> = {
    Delivered:  "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Processing: "bg-amber-100  text-amber-700  border border-amber-200",
    "In-Transit":"bg-sky-100   text-sky-700   border border-sky-200",
    Cancelled:  "bg-rose-100   text-rose-700   border border-rose-200",
    Pending:    "bg-slate-100  text-slate-600  border border-slate-200",
    Paid:       "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Failed:     "bg-rose-100   text-rose-700   border border-rose-200",
    High:       "bg-rose-100   text-rose-700   border border-rose-200",
    Medium:     "bg-amber-100  text-amber-700  border border-amber-200",
    Low:        "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Visible:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Hidden:     "bg-slate-100  text-slate-600  border border-slate-200",
  };

  const statusClass = status
    ? status === "active"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
      : "bg-slate-100 text-slate-600 border border-slate-200"
    : undefined;

  const classes =
    statusClass ?? palette[label] ?? "bg-slate-100 text-slate-600 border border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${classes}`}>
      {label}
    </span>
  );
}

type AdminShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
};

export function AdminShell({
  title,
  subtitle,
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, isAdmin, session, clearSession, refreshSession } =
    useAdminSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (ready && !isAdmin) router.replace("/signin");
  }, [ready, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin || !ready || !session?.accessToken) return;

    let timer: number | undefined;
    let disposed = false;
    const retryDelay = 5 * 60 * 1000;

    const scheduleRefresh = (delay: number) => {
      timer = window.setTimeout(() => {
        void refreshSession().then((refreshed) => {
          if (!refreshed && !disposed) scheduleRefresh(retryDelay);
        });
      }, delay);
    };

    const expiresAt = getAccessTokenExpiry(session.accessToken);
    const refreshDelay = expiresAt
      ? Math.max(expiresAt - Date.now() - 60 * 1000, 1000)
      : 10 * 60 * 1000;
    scheduleRefresh(refreshDelay);

    const refreshIfExpiring = () => {
      if (document.visibilityState !== "visible") return;
      if (!expiresAt || expiresAt - Date.now() > 60 * 1000) return;

      window.clearTimeout(timer);
      void refreshSession().then((refreshed) => {
        if (!refreshed && !disposed) scheduleRefresh(retryDelay);
      });
    };

    document.addEventListener("visibilitychange", refreshIfExpiring);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshIfExpiring);
    };
  }, [isAdmin, ready, refreshSession, session?.accessToken]);

  const activeHref = useMemo(() => {
    return (
      navItems.find((item) =>
        item.href === "/admin"
          ? pathname === "/admin"
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
      )?.href ?? "/admin"
    );
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    router.push("/signin");
  };

  if (!ready || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#eef2f7,#f8fafc)] text-slate-900">
        <div className="rounded-[2rem] bg-white px-6 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-700">
            <AdminIcon name="shield" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Checking access</h1>
          <p className="mt-2 text-sm text-slate-600">
            Redirecting to sign in if this session is not an admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f1f4f9] text-slate-900">
      <div className="flex min-h-screen min-w-0">

        {/* ── Desktop sidebar ─────────────────────────────────── */}
        <aside className="hidden shrink-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex h-full flex-col border-r border-slate-200/80 bg-white shadow-[2px_0_24px_rgba(15,23,42,0.06)]">

            {/* Logo */}
            <div className="px-5 py-5 border-b border-slate-100">
              <Link href="/admin" className="flex items-center gap-3 rounded-2xl bg-[#0a2a78]/5 px-3 py-3 transition hover:bg-[#0a2a78]/10">
                <Image
                  src="/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png"
                  alt="Zowkins logo"
                  width={52}
                  height={52}
                  className="h-9 w-9 object-contain"
                />
                <div>
                  <p className="font-display text-sm font-bold leading-none text-slate-900">Zowkins Admin</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-slate-400">Control center</p>
                </div>
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Menu</p>
              {navItems.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#0a2a78] text-white shadow-[0_4px_14px_rgba(10,42,120,0.35)]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className={`transition-transform duration-150 ${isActive ? "" : "group-hover:scale-110"}`}>
                      <AdminIcon name={item.icon} />
                    </span>
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="space-y-2 px-3 py-4 border-t border-slate-100">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
                Back to Store
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                aria-label="Logout from admin"
              >
                <AdminIcon name="logout" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main column ─────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 px-3 py-3 sm:px-4 md:px-6 lg:px-8">

              {/* Mobile: hamburger + breadcrumb */}
              <div className="flex items-center gap-3 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                  aria-label="Open admin menu"
                >
                  <AdminIcon name="menu" />
                </button>
                <div className="flex flex-col leading-tight">
                  <p className="font-display text-sm font-bold leading-none text-slate-900">Zowkins Admin</p>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">{title}</p>
                </div>
              </div>

              {/* Desktop: page title */}
              <div className="hidden lg:flex flex-col gap-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">Admin dashboard</p>
                <h1 className="font-display text-lg font-bold text-slate-900 leading-tight">{title}</h1>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 sm:gap-3">
                {searchValue !== undefined && onSearchChange ? (
                  <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 transition focus-within:border-[#0a2a78]/40 focus-within:bg-white md:flex">
                    <AdminIcon name="search" />
                    <input
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder={searchPlaceholder ?? "Search..."}
                      className="w-48 bg-transparent outline-none placeholder:text-slate-400 lg:w-56"
                    />
                  </div>
                ) : null}

                {/* User pill */}
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 shadow-sm">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0a2a78] text-white shadow-[0_2px_8px_rgba(10,42,120,0.3)]">
                    <AdminIcon name="user" />
                  </div>
                  <div className="hidden flex-col leading-tight sm:flex">
                    <p className="text-xs font-semibold text-slate-900">{session?.name ?? "Admin"}</p>
                    <p className="text-[10px] text-slate-400">{session?.email ?? "contact@zowkins.com"}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 md:inline-flex"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
            {children}
          </main>
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-label="Close admin menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[82vw] max-w-xs flex-col bg-white shadow-2xl">
            {/* Mobile logo */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div className="flex items-center gap-3">
                <Image src="/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png" alt="Zowkins logo" width={44} height={44} className="h-9 w-9 object-contain" />
                <div>
                  <p className="font-display text-sm font-bold leading-none text-slate-900">Zowkins Admin</p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="Close admin menu"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Menu</p>
              {navItems.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#0a2a78] text-white shadow-[0_4px_14px_rgba(10,42,120,0.3)]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <AdminIcon name={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile footer */}
            <div className="shrink-0 space-y-2 border-t border-slate-100 px-3 py-4">
              <Link href="/" className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
                Back to Store
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                aria-label="Logout from admin"
              >
                <AdminIcon name="logout" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
