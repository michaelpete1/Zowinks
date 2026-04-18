"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAdminSession } from "../hooks/useAdminSession";

type IconName = "grid" | "layers" | "orders" | "contacts" | "settings" | "menu" | "logout" | "shield" | "mail" | "user" | "search" | "truck" | "team" | "plus" | "trash" | "edit" | "tag";

const navItems = [
  { label: "Dashboard", icon: "grid", href: "/admin" },
  { label: "Products", icon: "layers", href: "/admin/products" },
  { label: "Categories", icon: "tag", href: "/admin/categories" },
  { label: "Orders", icon: "orders", href: "/admin/orders" },
  { label: "Delivery", icon: "truck", href: "/admin/delivery-methods" },
  { label: "Customers", icon: "contacts", href: "/admin/customers" },
  { label: "Settings", icon: "settings", href: "/admin/settings" },
] as const;

export function AdminIcon({ name }: { name: IconName }) {
  const base = "h-5 w-5 shrink-0";
  switch (name) {
    case "grid": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>;
    case "layers": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 3 8l9 5 9-5-9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 16l9 5 9-5" /></svg>;
    case "orders": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16v12H4z" /><path d="M8 10h8M8 14h5" /></svg>;
    case "contacts": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "settings": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /><path d="M19.4 15a7.97 7.97 0 0 0 .1-1 7.97 7.97 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L15 5h-6l-.3 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.97 7.97 0 0 0-.1 1 7.97 7.97 0 0 0 .1 1l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1L9 19h6l.3-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5z" /></svg>;
    case "menu": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
    case "logout": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 4v16" /></svg>;
    case "shield": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3z" /></svg>;
    case "mail": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>;
    case "user": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "search": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>;
    case "truck": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h11v10H3z" /><path d="M14 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="1.5" /><circle cx="18" cy="19" r="1.5" /></svg>;
    case "team": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M17 11a4 4 0 1 0 0-8" /></svg>;
    case "plus": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>;
    case "trash": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" /></svg>;
    case "edit": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M13 7l4 4" /></svg>;
    case "tag": return <svg viewBox="0 0 24 24" className={base} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 13 13 20l-9-9V4h7l9 9z" /><circle cx="8.5" cy="8.5" r="1.2" /></svg>;
    default: return null;
  }
}

export function AdminBadge({ label }: { label: string }) {
  const palette: Record<string, string> = {
    Delivered: "bg-emerald-50 text-emerald-700",
    Processing: "bg-amber-50 text-amber-700",
    Pending: "bg-slate-100 text-slate-600",
    High: "bg-rose-50 text-rose-700",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-emerald-50 text-emerald-700",
    Visible: "bg-emerald-50 text-emerald-700",
    Hidden: "bg-slate-100 text-slate-600",
  };

  return <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${palette[label] ?? "bg-slate-100 text-slate-600"}`}>{label}</span>;
}

type AdminShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
};

export function AdminShell({ title, subtitle, children, searchValue, onSearchChange, searchPlaceholder }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, isAdmin, session, clearSession } = useAdminSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (ready && !isAdmin) router.replace("/signin");
  }, [ready, isAdmin, router]);

  const activeHref = useMemo(() => {
    return navItems.find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`)))?.href ?? "/admin";
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    router.push("/signin");
  };

  if (!ready || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#eef2f7,#f8fafc)] text-slate-900">
        <div className="rounded-[2rem] bg-white px-6 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-700"><AdminIcon name="shield" /></div>
          <h1 className="mt-4 font-display text-2xl font-bold">Checking access</h1>
          <p className="mt-2 text-sm text-slate-600">Redirecting to sign in if this session is not an admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef2f7_0%,#f7f9fc_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white/95 px-5 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:flex lg:flex-col">
          <Link href="/admin" className="flex items-center gap-3 rounded-[1.4rem] bg-slate-50 px-4 py-3">
            <Image src="/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png" alt="Zowkins logo" width={56} height={56} className="h-12 w-12 object-contain" />
            <div>
              <p className="font-display text-sm font-bold leading-none">Zowkins Admin</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Control center</p>
            </div>
          </Link>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${activeHref === item.href ? "bg-[#0a2a78] text-white shadow-lg" : "text-slate-700 hover:bg-slate-50"}`}>
                <AdminIcon name={item.icon} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            <Link href="/" className="block rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-900">Back to Store</Link>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              aria-label="Logout from admin"
              title="Logout from admin"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl md:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <button type="button" onClick={() => setSidebarOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm" aria-label="Open admin menu">
                  <AdminIcon name="menu" />
                </button>
                <div>
                  <p className="font-display text-sm font-bold leading-none">Zowkins Admin</p>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">{title}</p>
                </div>
              </div>

              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-500">Admin dashboard</p>
                <h1 className="font-display text-2xl font-bold text-slate-900">{title}</h1>
                <p className="text-sm text-slate-500">{subtitle}</p>
              </div>

              <div className="flex items-center gap-3">
                {searchValue !== undefined && onSearchChange ? (
                  <div className="hidden items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600 md:flex">
                    <AdminIcon name="search" />
                    <input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder={searchPlaceholder ?? "Search..."} className="w-56 bg-transparent outline-none placeholder:text-slate-400" />
                  </div>
                ) : null}
                <div className="flex items-center gap-3 rounded-full bg-slate-50 px-3 py-2">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0a2a78] text-white"><AdminIcon name="user" /></div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900">{session?.name ?? "Admin"}</p>
                    <p className="text-xs text-slate-500">{session?.email ?? "admin@zowkins.com"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 md:inline-flex"
                  aria-label="Logout from admin"
                  title="Logout from admin"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">{children}</main>
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/55" aria-label="Close admin menu" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[86vw] max-w-sm bg-white px-5 py-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2">
            <Image src="/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png" alt="Zowkins logo" width={48} height={48} className="h-11 w-11 object-contain" />
                <div>
                  <p className="font-display text-sm font-bold leading-none">Zowkins Admin</p>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                aria-label="Close admin menu"
                title="Close admin menu"
              >
                Close menu
              </button>
            </div>

            <nav className="mt-5 space-y-2">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${activeHref === item.href ? "bg-[#0a2a78] text-white" : "text-slate-700 hover:bg-slate-50"}`}>
                  <AdminIcon name={item.icon} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 space-y-3 border-t border-slate-100 pt-5">
              <Link href="/" className="block rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-900">Back to Store</Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                aria-label="Logout from admin"
                title="Logout from admin"
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
