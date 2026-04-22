"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminBadge, AdminShell } from "../../../components/AdminShell";
import { useAdminSession } from "../../../hooks/useAdminSession";
import {
  AdminCategory,
  AdminCategoryInput,
  ApiError,
  zowkinsApi,
} from "../../../lib/zowkins-api";
import { resolveImageSource } from "../../../lib/media";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = {
  accessToken: string;
};

type CategoryForm = {
  name: string;
  description: string;
  slug: string;
  visible: boolean;
  file: File | null;
  subcategories: string;
};

const emptyForm = (): CategoryForm => ({
  name: "",
  description: "",
  slug: "",
  visible: true,
  file: null,
  subcategories: "",
});

const STANDARD_CATEGORIES = [
  { name: "Laptops", slug: "laptops", description: "Professional laptop collections for business and creative work." },
  { name: "Desktops", slug: "desktops", description: "Powerful desktop systems for office and enterprise deployment." },
  { name: "Accessories", slug: "accessories", description: "Essential peripherals, docks, and workspace add-ons." },
];

const normalizeToken = (value: string) =>
  value.trim().replace(/^Bearer\s+/i, "");

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const normalizeAdminCategories = (response: unknown): AdminCategory[] => {
  if (Array.isArray(response)) return response;

  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as { categories?: unknown }).categories)
  ) {
    return (response as { categories: AdminCategory[] }).categories;
  }

  return [];
};

const asText = (value: unknown) => (typeof value === "string" ? value : "");

const getCategoryId = (category?: AdminCategory | null) =>
  category ? asText(category.id || (category as any)._id).trim() : "";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const safeJson = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

function CategoryPreview({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <img
      src={resolveImageSource(src, "/desktop.jpg")}
      alt={alt}
      className="h-40 w-full object-cover md:h-48"
    />
  );
}

export default function CategoriesPage() {
  const { session, ready: sessionReady, clearSession } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    accessToken: "",
  });
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<AdminCategory | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm());
  const [preview, setPreview] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState("");
  const [message, setMessage] = useState("");
  const [connectionMessage, setConnectionMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [imageDebug, setImageDebug] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => setToastMessage(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!sessionReady || typeof window === "undefined") return;

    const storedToken = normalizeToken(
      window.localStorage.getItem(ADMIN_API_TOKEN_KEY) ?? "",
    );
    const sessionToken = normalizeToken(session?.accessToken ?? "");
    const nextToken = sessionToken || storedToken;

    setApiConnection({
      accessToken: nextToken,
    });

    if (sessionToken && sessionToken !== storedToken) {
      window.localStorage.setItem(ADMIN_API_TOKEN_KEY, sessionToken);
    }

    setConnectionMessage(
      sessionToken
        ? "Connected automatically from your admin session."
        : storedToken
          ? "Loaded saved API connection from this browser."
          : "Add a token if you need a manual connection.",
    );
    setReady(true);
  }, [session?.accessToken, sessionReady]);

  const apiReady = Boolean(apiConnection.accessToken.trim());

  const loadCategories = async () => {
    if (!apiReady) return;

    setLoading(true);
    setError("");

    try {
      const data = await zowkinsApi.listAdminCategories(
        apiConnection.accessToken.trim(),
      );
      const normalizedCategories = normalizeAdminCategories(data);
      setCategories(normalizedCategories);
      setSelectedCategory((current) => {
        if (!current) return normalizedCategories[0] ?? null;
        return (
          normalizedCategories.find((category) => (category.id || (category as any)._id) === (current.id || (current as any)._id)) ??
          normalizedCategories[0] ??
          null
        );
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
        window.location.href = "/signin";
        return;
      }
      
      setError(
        err instanceof ApiError ? err.message : "Could not load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready || !apiReady) return;
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, ready]);

  useEffect(() => {
    if (!selectedCategory) {
      setForm(emptyForm());
      setPreview("");
      return;
    }

    setForm({
      name: selectedCategory.name,
      description: selectedCategory.description,
      slug: selectedCategory.slug,
      visible: Boolean(selectedCategory.visible),
      file: null,
      subcategories: Array.isArray(selectedCategory.subcategories) ? selectedCategory.subcategories.map(s => s.name || s).join(", ") : "",
    });
    const resolvedImage = resolveImageSource(selectedCategory.image, "/desktop.jpg");
    setPreview(resolvedImage);
    setImageDebug(
      [
        `raw: ${safeJson(selectedCategory.image)}`,
        `resolved: ${resolvedImage}`,
        `fallback: ${resolvedImage === "/desktop.jpg" ? "yes" : "no"}`,
      ].join("\n"),
    );
  }, [selectedCategory]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const filteredCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((category) =>
      [
        category.id || (category as any)._id,
        category.name,
        category.description,
        category.slug,
        String(category.productsCount),
      ].some((value) => value.toLowerCase().includes(needle)),
    );
  }, [categories, query]);

  const missingStandards = useMemo(() => {
    return STANDARD_CATEGORIES.filter(
      (std) => !categories.some((cat) => cat.slug === std.slug)
    );
  }, [categories]);

  const prefillStandard = (std: (typeof STANDARD_CATEGORIES)[0]) => {
    setSelectedCategory(null);
    setForm({
      ...emptyForm(),
      name: std.name,
      slug: std.slug,
      description: std.description,
    });
    setPreview("");
    setError("");
    setMessage(`Form pre-filled for "${std.name}". Just upload an image and click Add Category.`);
  };

  const visibleCount = useMemo(
    () => categories.filter((category) => category.visible).length,
    [categories],
  );

  const saveConnection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      ADMIN_API_TOKEN_KEY,
      apiConnection.accessToken.trim(),
    );
    setMessage("API connection saved.");
    setError("");
  };

  const clearForm = () => {
    setSelectedCategory(null);
    setForm(emptyForm());
    setPreview("");
    setMessage("");
    setError("");
    setPendingDeleteId("");
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setForm((current) => ({ ...current, file }));
    setPreview((current) => {
      if (current.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady) {
      setError("Use your admin session token or save a bearer token first.");
      return;
    }

    const name = asText(form.name).trim().replace(/\s+/g, " ");
    const description = asText(form.description).trim().replace(/\s+/g, " ");
    const slug = asText(form.slug).trim().toLowerCase();

    if (name.length < 3 || name.length > 80) {
      setError("Category name must be between 3 and 80 characters.");
      return;
    }

    if (description.length < 10 || description.length > 500) {
      setError("Category description must be between 10 and 500 characters.");
      return;
    }

    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError(
        "Category slug can only use lowercase letters, numbers, and hyphens.",
      );
      return;
    }

    if (form.file && !ALLOWED_IMAGE_MIME_TYPES.has(form.file.type)) {
      setError(
        "Upload a PNG, JPEG, WebP, or SVG image for the category.",
      );
      return;
    }

    if (!selectedCategory && !form.file) {
      setError("Add a category image before creating a new category.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const rawSubcategoryNames = asText(form.subcategories)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const subcategoryNames = rawSubcategoryNames.length
        ? rawSubcategoryNames
        : Array.isArray(selectedCategory?.subcategories)
          ? selectedCategory.subcategories
              .map((subcategory) =>
                asText(
                  typeof subcategory === "object" && subcategory !== null
                    ? (subcategory as any).name || ""
                    : subcategory,
                ).trim(),
              )
              .filter(Boolean)
          : [];

      const payload: AdminCategoryInput = {
        name,
        description,
        visible: Boolean(form.visible),
        subcategories: subcategoryNames.map((name) => ({ name })),
        file: form.file,
      };

      const categoryId = getCategoryId(selectedCategory);
      if (selectedCategory && !categoryId) {
        setError("Selected category is missing an id. Refresh categories and try again.");
        setSaving(false);
        return;
      }

      const saved = selectedCategory
        ? await zowkinsApi.updateAdminCategory(
            apiConnection.accessToken.trim(),
            categoryId,
            payload,
          )
        : await zowkinsApi.createAdminCategory(
            apiConnection.accessToken.trim(),
            payload,
          );

      setSelectedCategory(saved);
      const resolvedSavedImage = resolveImageSource(saved.image, "/desktop.jpg");
      setImageDebug(
        [
          `saved raw: ${safeJson(saved.image)}`,
          `saved resolved: ${resolvedSavedImage}`,
          `saved fallback: ${resolvedSavedImage === "/desktop.jpg" ? "yes" : "no"}`,
        ].join("\n"),
      );
      const nextMessage = selectedCategory
        ? "Category updated successfully."
        : "Category created successfully.";
      setMessage(nextMessage);
      setToastMessage(nextMessage);
      await loadCategories();
      setSelectedCategory(saved);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
        window.location.href = "/signin";
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Could not save category.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!apiReady) return;
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      return;
    }

    setDeletingId(id);
    setError("");
    setMessage("");
    setPendingDeleteId("");

    try {
      await zowkinsApi.deleteAdminCategory(
        apiConnection.accessToken.trim(),
        id,
      );
      setMessage("Category deleted successfully.");
      if ((selectedCategory?.id || (selectedCategory as any)?._id) === id) {
        clearForm();
      }
      await loadCategories();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
        window.location.href = "/signin";
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Could not delete category.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const openCategory = async (category: AdminCategory) => {
    if (!apiReady) {
      setSelectedCategory(category);
      return;
    }

    try {
      const data = await zowkinsApi.getAdminCategory(
        apiConnection.accessToken.trim(),
        category.id || (category as any)._id,
      );
      setSelectedCategory(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
        window.location.href = "/signin";
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load category details.",
      );
      setSelectedCategory(category);
    }
  };

  return (
    <AdminShell
      title="Categories"
      subtitle="Operations related to categories from the admin access."
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder="Search categories..."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Catalog
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                Manage categories
              </h2>
            </div>
            <AdminBadge label={apiReady ? "Visible" : "Hidden"} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Total
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {categories.length}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Visible
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {visibleCount}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Hidden
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {categories.length - visibleCount}
              </p>
            </div>
          </div>

          {missingStandards.length > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-amber-900">Recommended Standards</h3>
              </div>
              <p className="mt-2 text-sm text-amber-700/80">
                You are missing some standard categories. Pre-fill the form below to create them quickly:
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {missingStandards.map((std) => (
                  <button
                    key={std.slug}
                    type="button"
                    onClick={() => prefillStandard(std)}
                    className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-700 shadow-sm transition hover:bg-amber-100"
                  >
                    + Add {std.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error ? (
            <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
          {toastMessage ? (
            <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              {toastMessage}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading categories...</p>
            ) : null}
            {filteredCategories.map((category) => (
              <article
                key={category.id || (category as any)._id}
                className={`rounded-[1.4rem] border p-4 md:p-5 ${(selectedCategory?.id || (selectedCategory as any)?._id) === (category.id || (category as any)._id) ? "border-[#0a2a78] bg-[#f6f9ff]" : "border-slate-100 bg-slate-50"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {category.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {category.slug}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdminBadge
                      label={category.visible ? "Visible" : "Hidden"}
                    />
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
                      {category.productsCount} products
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void openCategory(category)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteCategory(category.id || (category as any)._id)}
                    disabled={deletingId === (category.id || (category as any)._id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      pendingDeleteId === (category.id || (category as any)._id)
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {pendingDeleteId === (category.id || (category as any)._id)
                      ? "Confirm delete"
                      : "Delete"}
                  </button>
                  {pendingDeleteId === (category.id || (category as any)._id) ? (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId("")}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Admin access
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              Category workflow
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <p>
                Save a bearer token once, then manage categories from this
                workspace.
              </p>
              <p>
                Upload a category image, change visibility, and keep catalog
                groups organized.
              </p>
              <p>
                Create, inspect, update, or delete categories without leaving
                the dashboard.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/products"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Products
              </Link>
              <Link
                href="/admin/settings"
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Profile settings
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              API connection
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Connect to the admin API
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your signed-in admin session is used automatically when available.
              Save a bearer token only if you need to connect from another
              session.
            </p>
            {connectionMessage ? (
              <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {connectionMessage}
              </p>
            ) : null}
            <form onSubmit={saveConnection} className="mt-6 space-y-4">
              <textarea
                value={apiConnection.accessToken}
                onChange={(event) =>
                  setApiConnection((current) => ({
                    ...current,
                    accessToken: event.target.value,
                  }))
                }
                placeholder={
                  session?.accessToken
                    ? "Using admin session token automatically"
                    : "Bearer access token"
                }
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              <button
                type="submit"
                className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a]"
              >
                Save connection
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              {selectedCategory ? "Edit category" : "Create category"}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              {selectedCategory
                ? "Update selected category"
                : "Add a new category"}
            </h2>
            <form onSubmit={submitCategory} className="mt-6 grid gap-4">
              <div className="grid gap-4 rounded-[1.5rem] bg-slate-50 p-4">
                <CategoryPreview
                  src={preview || resolveImageSource(selectedCategory?.image, "/desktop.jpg")}
                  alt={form.name || "Category preview"}
                />
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-[11px] leading-5 text-slate-600">
                  <p className="mb-2 font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Image debug
                  </p>
                  <pre className="whitespace-pre-wrap break-words font-mono">
                    {imageDebug || "No category selected yet."}
                  </pre>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
                    <span>Image file</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleImageUpload}
                      className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:border-[#0a2a78]"
                    />
                  </label>
                  <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
                    <span>Slug</span>
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                      <input
                        value={form.slug}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            slug: event.target.value,
                          }))
                        }
                        placeholder="category-slug"
                        className="min-w-0 w-full flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            slug: slugify(current.name || current.slug),
                          }))
                        }
                        className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                      >
                        Suggest
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: current.slug
                      ? current.slug
                      : slugify(event.target.value),
                  }))
                }
                placeholder="Category name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Category description"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
              
              <input
                value={form.subcategories}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subcategories: event.target.value,
                  }))
                }
                placeholder="Subcategories (comma separated)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  checked={form.visible}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visible: event.target.checked,
                    }))
                  }
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#0a2a78] focus:ring-[#0a2a78]"
                />
                Visible to customers
              </label>

              {error && (
                <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <strong className="block mb-1 font-semibold text-rose-800">Error</strong>
                  {typeof error === "string" && error.includes("{") ? (
                    <pre className="whitespace-pre-wrap font-mono text-[11px]">{error}</pre>
                  ) : (
                    error
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving || !apiReady}
                  className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : !apiReady
                      ? "Connect first"
                      : selectedCategory
                        ? "Save changes"
                        : "Add category"}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear form
                </button>
              </div>
              {!apiReady ? (
                <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Save a bearer token or sign in again to enable category
                  creation.
                </p>
              ) : null}
            </form>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
