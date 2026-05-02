"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminBadge, AdminIcon, AdminShell } from "../../components/AdminShell";
import { useAdminSession } from "../../hooks/useAdminSession";
import { ApiError, ProductDetails, CategoryListItem, zowkinsApi } from "../../lib/zowkins-api";

const shortcuts = [
  { label: "Products", href: "/admin/products", description: "Add, edit, hide, or remove products.", icon: "layers" as const },
  { label: "Categories", href: "/admin/categories", description: "Upload and organize product categories.", icon: "tag" as const },
  { label: "Orders", href: "/admin/orders", description: "Track delivered and pending orders.", icon: "orders" as const },
  { label: "Customers", href: "/admin/customers", description: "Review customer records and contact details.", icon: "contacts" as const },
  { label: "Delivery", href: "/admin/delivery-methods", description: "Manage shipping methods and fees.", icon: "truck" as const },
  { label: "App Settings", href: "/admin/settings/app", description: "Manage application configuration and branding.", icon: "settings" as const },
  { label: "Profile", href: "/admin/settings", description: "Manage admin profile and credentials.", icon: "user" as const },
];

const extractArray = <T,>(response: unknown, keys: string[]): T[] => {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object") {
    for (const key of keys) {
      if (Array.isArray((response as Record<string, unknown>)[key])) {
        return (response as Record<string, unknown>)[key] as T[];
      }
    }

    if (Array.isArray((response as { data?: unknown }).data)) {
      return (response as { data: T[] }).data;
    }
  }

  return [];
};

export default function AdminDashboardPage() {
  const { session } = useAdminSession();
  const [productCount, setProductCount] = useState(0);
  const [visibleProductCount, setVisibleProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [processingOrderCount, setProcessingOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const accessToken = session?.accessToken ?? (typeof window !== "undefined" ? window.localStorage.getItem("zowkins-admin-access-token") : null);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    setLoading(true);
    setError("");
    setWarning("");

    const loadDashboard = async () => {
      const failures: string[] = [];

      const [productsResult, categoriesResult, orderStatsResult, customerStatsResult] = await Promise.allSettled([
        zowkinsApi.listAdminProducts(accessToken),
        zowkinsApi.listAdminCategories(accessToken),
        zowkinsApi.getAdminOrderStats(accessToken),
        zowkinsApi.getAdminCustomerStats(accessToken),
      ]);

      if (cancelled) return;

      if (productsResult.status === "fulfilled") {
        const products = extractArray<ProductDetails>(productsResult.value, ["products"]);
        setProductCount(products.length);
        setVisibleProductCount(products.filter((product) => product.visible).length);
      } else {
        failures.push("products");
      }

      if (categoriesResult.status === "fulfilled") {
        const categories = extractArray<CategoryListItem>(categoriesResult.value, ["categories"]);
        setCategoryCount(categories.length);
      } else {
        failures.push("categories");
      }

      if (orderStatsResult.status === "fulfilled") {
        setOrderCount(orderStatsResult.value.stats.totalOrders);
        setProcessingOrderCount(orderStatsResult.value.stats.processing);
      } else {
        failures.push("orders");
      }

      if (customerStatsResult.status === "fulfilled") {
        setCustomerCount(customerStatsResult.value.stats.totalUsers);
      } else {
        failures.push("customers");
      }

      if (failures.length > 0) {
        const authFailure = [productsResult, categoriesResult, orderStatsResult, customerStatsResult].some(
          (result) => result.status === "rejected" && result.reason instanceof ApiError && result.reason.status === 401,
        );

        setError(
          authFailure
            ? "Your admin session has expired. Please sign in again."
            : `Could not load: ${failures.join(", ")}.`,
        );
        setWarning(
          authFailure
            ? ""
            : "Some dashboard cards could not load, but the rest of the admin area is still available.",
        );
      }
    };

    void loadDashboard().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const stats = useMemo(
    () => [
      {
        label: "Products live",
        value: String(productCount),
        hint: `${visibleProductCount} visible`,
        tone: "bg-white",
      },
      {
        label: "Categories",
        value: String(categoryCount),
        hint: "catalog groups",
        tone: "bg-white",
      },
        {
          label: "Orders tracked",
          value: String(orderCount),
          hint: `${processingOrderCount} processing`,
          tone: "bg-white",
        },
      {
        label: "Customers",
        value: String(customerCount),
        hint: "records stored",
        tone: "bg-white",
      },
      { label: "Admin routes", value: "6", hint: "separated views", tone: "bg-white" },
    ],
    [productCount, visibleProductCount, categoryCount, orderCount, processingOrderCount, customerCount],
  );

  return (
    <AdminShell title="Admin overview" subtitle="Live summary cards and route shortcuts for the admin backend.">
      {error ? <p className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      {warning ? <p className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{warning}</p> : null}
      {loading ? <p className="mb-6 text-sm text-slate-500">Loading dashboard data...</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-[1.5rem] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <span className="font-display text-3xl font-bold text-slate-900">{stat.value}</span>
              <span className="text-xs text-slate-500">{stat.hint}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Quick access</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Go straight to the page you need</h2>
            </div>
            <AdminBadge label={session?.name ? "Visible" : "Pending"} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {shortcuts.map((item) => (
              <Link key={item.label} href={item.href} className="group rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0a2a78] text-white transition group-hover:bg-[#12386a]"><AdminIcon name={item.icon} /></div>
                  <span className="text-sm font-semibold text-emerald-700">Open</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Operations</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Keep the store moving</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              The overview now reflects live backend data for products, categories, orders, and customers.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/admin/products" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Open products</Link>
              <Link href="/admin/settings" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Profile settings</Link>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Status</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">What lives where</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p><strong className="text-slate-900">Products</strong> handles add, edit, hide, remove, and mark-new flows.</p>
              <p><strong className="text-slate-900">Categories</strong> handles category uploads and grouping.</p>
              <p><strong className="text-slate-900">Orders</strong> handles status updates and product line items.</p>
              <p><strong className="text-slate-900">Customers</strong> holds customer records and contact details.</p>
            </div>
          </section>
        </div>
      </section>
    </AdminShell>
  );
}
