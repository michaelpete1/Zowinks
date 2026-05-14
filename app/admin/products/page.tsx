"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AdminBadge,
  AdminIcon,
  AdminShell,
} from "../../../components/AdminShell";
import { useAdminSession } from "../../../hooks/useAdminSession";
import {
  CategoryListItem,
  ProductDetails,
  ApiError,
  zowkinsApi,
} from "../../../lib/zowkins-api";
import { resolveImageSource } from "../../../lib/media";

const STANDARD_CATEGORIES = [
  { name: "Laptops", subcategories: ["HP", "Dell", "Lenovo", "Apple", "Asus"] },
  { name: "Desktops", subcategories: ["HP", "Dell", "Lenovo"] },
  {
    name: "Accessories",
    subcategories: ["Keyboards", "Mice", "Monitors", "Printers", "Docks"],
  },
];

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = {
  accessToken: string;
};

type ProductForm = {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  price: string;
  description: string;
  specRows: { key: string; value: string }[];
  visible: boolean;
  inStock: boolean;
  files: (File | null)[];
};

const emptyForm = (category = "", subcategory = ""): ProductForm => ({
  name: "",
  slug: "",
  category,
  subcategory,
  price: "",
  description: "",
  specRows: [{ key: "", value: "" }],
  visible: true,
  inStock: true,
  files: [null],
});

const slugify = (value: string = "") =>
  (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const asString = (value: unknown) =>
  typeof value === "string" ? value : value == null ? "" : String(value);

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const MAX_PRODUCT_IMAGES = 6;

const safeJson = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const createSpecRow = () => ({ key: "", value: "" });

const normalizeSpecRows = (specs: unknown): { key: string; value: string }[] => {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) {
    return [createSpecRow()];
  }

  const entries = Object.entries(specs as Record<string, unknown>).map(
    ([key, value]) => ({
      key,
      value:
        typeof value === "string"
          ? value
          : value == null
            ? ""
            : typeof value === "object"
              ? JSON.stringify(value)
              : String(value),
    }),
  );

  return entries.length ? entries : [createSpecRow()];
};

const buildSpecsObject = (rows: { key: string; value: string }[]) => {
  const specEntries = rows
    .map(({ key, value }) => [key.trim(), value.trim()] as const)
    .filter(([key, value]) => key && value);

  if (!specEntries.length) return null;

  return Object.fromEntries(specEntries) as Record<string, unknown>;
};

function ProductPreview({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[1.2rem] bg-slate-100 ring-1 ring-slate-200">
      <img
        src={resolveImageSource(src, "/desktop.jpg")}
        alt={alt}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/desktop.jpg";
        }}
        className="h-40 w-full object-cover md:h-48"
      />
    </div>
  );
}

function getPrimaryProductImage(product: ProductDetails | null) {
  return product?.images?.[0] ?? product?.image ?? null;
}

function getImageLabel(index: number) {
  return index === 0 ? "Main image" : `Image ${index + 1}`;
}

export default function ProductsPage() {
  const { session, ready: sessionReady, clearSession } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    accessToken: "",
  });
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(
    null,
  );
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [preview, setPreview] = useState("");
  const [query, setQuery] = useState("");
  const [statsTotal, setStatsTotal] = useState(0);
  const [statsVisible, setStatsVisible] = useState(0);
  const [statsInvisible, setStatsInvisible] = useState(0);
  const [statsInStock, setStatsInStock] = useState(0);
  const [statsOutOfStock, setStatsOutOfStock] = useState(0);
  const [statsInventoryValue, setStatsInventoryValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [imageDebug, setImageDebug] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  // Use session token (same pattern as categories page)
  useEffect(() => {
    if (!sessionReady || typeof window === "undefined") return;

    const storedToken = window.localStorage.getItem(ADMIN_API_TOKEN_KEY) ?? "";
    const sessionToken = session?.accessToken ?? "";
    const nextToken = sessionToken || storedToken;

    setApiConnection({ accessToken: nextToken });

    if (sessionToken && sessionToken !== storedToken) {
      window.localStorage.setItem(ADMIN_API_TOKEN_KEY, sessionToken);
    }

    setReady(true);
  }, [session?.accessToken, sessionReady]);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          (category.id || (category as any)._id) === form.category ||
          category.name === form.category,
      ) ?? null,
    [categories, form.category],
  );
  const subcategoryOptions = selectedCategory?.subcategories ?? [];

  const getCategoryLabel = (value: any) => {
    if (typeof value === "object" && value !== null)
      return value.name || "Unknown";
    return (
      categories.find(
        (category) =>
          category.name === value ||
          category.slug === value ||
          category.id === value,
      )?.name ?? value
    );
  };

  const isEditing = Boolean(selectedProduct);
  const isCreating = !isEditing;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (preview.startsWith("blob:")) {
      return () => URL.revokeObjectURL(preview);
    }
    return undefined;
  }, [preview]);

  const apiReady = Boolean(apiConnection.accessToken.trim());
  const authFailureMessage =
    "Your admin API token looks missing or expired. Save the token again from Settings, then refresh this page.";

  // Load categories using the token from state (set after sessionReady)
  useEffect(() => {
    if (!ready || !apiConnection.accessToken.trim()) return;

    zowkinsApi
      .listAdminCategories(apiConnection.accessToken.trim())
      .then((catList: any) => {
        const list = Array.isArray(catList)
          ? catList
          : (catList?.categories ?? []);
        console.log(
          "First category structure:",
          JSON.stringify(list[0], null, 2),
        );
        setCategories(list);
        if (list[0]) {
          const firstCat = list[0];
          const firstCatId = firstCat.id || firstCat._id;
          const firstSub = firstCat.subcategories?.[0];
          const firstSubId = firstSub ? firstSub.id || firstSub._id : "";
          setForm((current) => ({
            ...current,
            category: current.category || asString(firstCatId),
            subcategory: current.subcategory || asString(firstSubId),
          }));
        }
      })
      .catch(() => setCategories([]));
  }, [ready, apiConnection.accessToken]);

  const describeApiError = (err: unknown, fallback: string) => {
    if (err instanceof ApiError && err.status === 401) {
      clearSession?.();
      if (typeof window !== "undefined")
        window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
      return authFailureMessage;
    }
    return err instanceof ApiError ? err.message : fallback;
  };

  const loadProducts = async () => {
    if (!apiReady) return;

    setLoading(true);
    setError("");

    try {
      const [productList, statsResponse] = await Promise.all([
        zowkinsApi.listAdminProducts(apiConnection.accessToken.trim()),
        zowkinsApi.getAdminProductStats(apiConnection.accessToken.trim()),
      ]);
      const normalizedProducts: ProductDetails[] = Array.isArray(productList)
        ? productList
        : Array.isArray((productList as any)?.products)
          ? (productList as any).products
          : [];
      setProducts(normalizedProducts);
      setStatsTotal(statsResponse.stats.total);
      setStatsVisible(statsResponse.stats.visible);
      setStatsInvisible(statsResponse.stats.invisible);
      setStatsInStock(statsResponse.stats.instock);
      setStatsOutOfStock(statsResponse.stats.outofstock);
      setStatsInventoryValue(statsResponse.stats.totalInventoryUnitCost);
      // Don't auto-select first product to avoid unexpected edit mode
      // setSelectedProduct(normalizedProducts[0] ?? null);
    } catch (err) {
      setError(describeApiError(err, "Could not load products."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready || !apiReady) return;
    void loadProducts();
  }, [apiReady, ready]);

  useEffect(() => {
    if (!selectedProduct) return;

    const categoryObj = selectedProduct.category;
    const subcategoryObj = selectedProduct.subcategory;

    const categoryId =
      typeof categoryObj === "object"
        ? categoryObj?.id || (categoryObj as any)?._id
        : categoryObj;
    const subcategoryId =
      typeof subcategoryObj === "object"
        ? subcategoryObj?.id || (subcategoryObj as any)?._id
        : subcategoryObj;

    setForm({
      name: asString(selectedProduct.name),
      slug: asString(selectedProduct.slug),
      category: asString(categoryId),
      subcategory: asString(subcategoryId),
      price:
        typeof selectedProduct.price === "number"
          ? String(selectedProduct.price)
          : "",
      description: asString(selectedProduct.description),
      specRows: normalizeSpecRows(selectedProduct.specs),
      visible: Boolean(selectedProduct.visible),
      inStock: Boolean(selectedProduct.inStock),
      files: [null],
    });
    const resolvedImage = resolveImageSource(
      getPrimaryProductImage(selectedProduct),
      "/desktop.jpg",
    );
    setPreview(resolvedImage);
    setImageDebug(
      [
        `raw: ${safeJson(getPrimaryProductImage(selectedProduct))}`,
        `resolved: ${resolvedImage}`,
        `fallback: ${resolvedImage === "/desktop.jpg" ? "yes" : "no"}`,
      ].join("\n"),
    );
  }, [selectedProduct]);

  useEffect(() => {
    const primaryFile = form.files.find(
      (file): file is File => Boolean(file),
    );

    if (primaryFile) {
      setPreview((current) => {
        if (current.startsWith("blob:")) {
          URL.revokeObjectURL(current);
        }
        return URL.createObjectURL(primaryFile);
      });
      return;
    }

    if (selectedProduct) {
      setPreview(resolveImageSource(getPrimaryProductImage(selectedProduct), "/desktop.jpg"));
      return;
    }

    setPreview("");
  }, [form.files, selectedProduct]);

  const filteredProducts = useMemo(() => {
    const normalizedProducts = Array.isArray(products) ? products : [];
    const needle = query.trim().toLowerCase();
    if (!needle) return normalizedProducts;
    return normalizedProducts.filter((product) =>
      [
        product.id || (product as any)._id,
        product.name,
        product.slug,
        product.category,
        product.subcategory,
        product.description,
      ].some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [products, query]);

  const resetForm = () => {
    const firstCat = categories[0];
    const defaultCategoryId = firstCat
      ? firstCat.id || (firstCat as any)._id
      : "";
    const defaultSubcategoryId = firstCat?.subcategories?.[0]
      ? firstCat.subcategories[0].id || (firstCat.subcategories[0] as any)._id
      : "";

    setSelectedProduct(null);
    setForm(emptyForm(defaultCategoryId, defaultSubcategoryId));
    setPreview("");
  };

  const openCreate = () => {
    resetForm();
    setMessage("");
    setError("");
  };

  const openEdit = (product: ProductDetails) => {
    setSelectedProduct(product);
    setMessage("");
    setError("");
  };

  const updateImageSlot = (
    index: number,
    file: File | null,
    input?: HTMLInputElement | null,
  ) => {
    if (file && !ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      setError("Upload PNG, JPEG, WebP, or SVG images for the product.");
      if (input) input.value = "";
      return;
    }

    setError("");
    setForm((current) => {
      const nextFiles = [...current.files];
      nextFiles[index] = file;
      return { ...current, files: nextFiles };
    });

    if (input) input.value = "";
  };

  const handleImageUpload = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    updateImageSlot(index, file, event.target);
  };

  const addImageSlot = () => {
    setForm((current) => {
      if (current.files.length >= MAX_PRODUCT_IMAGES) return current;
      return { ...current, files: [...current.files, null] };
    });
  };

  const removeImageSlot = (index: number) => {
    setForm((current) => {
      if (current.files.length <= 1) {
        return { ...current, files: [null] };
      }

      const nextFiles = current.files.filter((_, fileIndex) => fileIndex !== index);
      return { ...current, files: nextFiles.length ? nextFiles : [null] };
    });
  };

  const updateSpecRow = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      specRows: current.specRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const addSpecRow = () => {
    setForm((current) => ({
      ...current,
      specRows: [...current.specRows, createSpecRow()],
    }));
  };

  const removeSelectedImage = (index: number) => {
    setForm((current) => ({
      ...current,
      files:
        current.files.length > 1
          ? current.files.filter((_, fileIndex) => fileIndex !== index)
          : [],
    }));
  };

  const removeSpecRow = (index: number) => {
    setForm((current) => ({
      ...current,
      specRows:
        current.specRows.length > 1
          ? current.specRows.filter((_, rowIndex) => rowIndex !== index)
          : [createSpecRow()],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!apiReady) {
      setError("Save a bearer token first.");
      return;
    }

    if (isCreating && !form.files.some((file) => Boolean(file))) {
      setError("Upload at least one product image before creating a product.");
      return;
    }

    const selectedFiles = form.files.filter(
      (file): file is File => Boolean(file),
    );

    if (selectedFiles.length > MAX_PRODUCT_IMAGES) {
      setError(`Upload up to ${MAX_PRODUCT_IMAGES} product images.`);
      return;
    }

    if (selectedFiles.some((file) => !ALLOWED_IMAGE_MIME_TYPES.has(file.type))) {
      setError("Upload PNG, JPEG, WebP, or SVG images for the product.");
      return;
    }

    const specs = buildSpecsObject(form.specRows);

    const payload = {
      name: (form.name || "").trim(),
      category: form.category || "",
      subcategory: form.subcategory || "",
      price: Number(form.price),
      description: (form.description || "").trim(),
      visible: form.visible,
      inStock: form.inStock,
      files: selectedFiles,
      specs,
    };

    const missing = [];
    if (!payload.name) missing.push("Product Name");
    if (!payload.category) missing.push("Category");
    if (!payload.subcategory) missing.push("Subcategory");
    if (!form.price || Number.isNaN(payload.price)) missing.push("Price");

    if (missing.length > 0) {
      setError(
        `Please fill out the following required fields: ${missing.join(", ")}`,
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    console.log("selectedProduct:", selectedProduct);
    console.log(
      "selectedProduct id:",
      selectedProduct?.id,
      (selectedProduct as any)?._id,
    );
    console.log(
      "payload booleans:",
      payload.visible,
      payload.inStock,
      typeof payload.visible,
      typeof payload.inStock,
      "payload keys:",
      Object.keys(payload),
    );

    try {
      const productId = selectedProduct?.id || (selectedProduct as any)?._id;
      const isValidProduct = selectedProduct && productId;
      console.log("isValidProduct:", isValidProduct, "productId:", productId);

      const saved = isValidProduct
        ? await zowkinsApi.updateAdminProduct(
            apiConnection.accessToken.trim(),
            productId,
            payload,
          )
        : await zowkinsApi.createAdminProduct(
            apiConnection.accessToken.trim(),
            payload,
          );

      console.log("saved:", saved);

      setMessage(
        selectedProduct
          ? "Product updated successfully."
          : "Product created successfully.",
      );
      setSelectedProduct(saved);
      const resolvedSavedImage = resolveImageSource(
        getPrimaryProductImage(saved),
        "/desktop.jpg",
      );
      setPreview(resolvedSavedImage);
      setImageDebug(
        [
          `saved raw: ${safeJson(getPrimaryProductImage(saved))}`,
          `saved resolved: ${resolvedSavedImage}`,
          `saved fallback: ${resolvedSavedImage === "/desktop.jpg" ? "yes" : "no"}`,
        ].join("\n"),
      );
      await loadProducts();
      setSelectedProduct(saved);
    } catch (err) {
      setError(describeApiError(err, "Could not save product."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!apiReady) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this product?")
    )
      return;

    setDeletingId(productId);
    setError("");
    setMessage("");

    try {
      await zowkinsApi.deleteAdminProduct(
        apiConnection.accessToken.trim(),
        productId,
      );
      setMessage("Product deleted successfully.");
      if ((selectedProduct?.id || (selectedProduct as any)?._id) === productId)
        resetForm();
      await loadProducts();
    } catch (err) {
      setError(describeApiError(err, "Could not delete product."));
    } finally {
      setDeletingId("");
    }
  };

  return (
    <AdminShell
      title="Products"
      subtitle="Create, update, and remove inventory through the admin API."
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder="Search products..."
    >
      <div className="grid gap-6 min-w-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)] xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
        <section className="min-w-0 rounded-[2rem] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                Inventory management
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                Product catalog
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Manage product inventory, pricing and visibility with the admin
                API. Create new products, edit existing items, and keep the
                catalog aligned with your storefront.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <AdminBadge label={apiReady ? "Connected" : "Disconnected"} />
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0a2a78] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a] sm:w-auto sm:py-2"
              >
                <AdminIcon name="plus" />
                Add product
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-[1.5rem] bg-slate-50 p-4 text-slate-600 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
            {[
              { label: "Total", value: statsTotal || products.length },
              { label: "Visible", value: statsVisible },
              { label: "Hidden", value: statsInvisible },
              { label: "In stock", value: statsInStock },
              { label: "Out of stock", value: statsOutOfStock },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Inventory value
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {formatCurrency(statsInventoryValue)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
            Use the form on the right to create or edit products.
          </div>

          {error && (
            <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}
          {apiReady ? (
            <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                API token status:
              </span>{" "}
              Connected.
            </div>
          ) : (
            <div className="mt-4 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-semibold">API token required:</span> connect
              your admin token in Settings.
            </div>
          )}
          {message && (
            <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="hidden min-w-full border-separate border-spacing-0 text-left text-sm md:table">
                <thead className="bg-slate-50 text-slate-500">
                  <tr className="divide-x divide-slate-200">
                    <th className="px-4 py-4 font-semibold">Product</th>
                    <th className="px-4 py-4 font-semibold">Category</th>
                    <th className="px-4 py-4 font-semibold">Subcategory</th>
                    <th className="px-4 py-4 font-semibold">Price</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Loading products...
                      </td>
                    </tr>
                  ) : filteredProducts.length ? (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id || (product as any)._id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                              <img
                                src={resolveImageSource(
                                  product.image,
                                  "/desktop.jpg",
                                )}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {product.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {getCategoryLabel(product.category)}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {typeof product.subcategory === "object" &&
                          product.subcategory !== null
                            ? (product.subcategory as any).name
                            : product.subcategory}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <AdminBadge
                              label={product.visible ? "Visible" : "Hidden"}
                            />
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${product.inStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                            >
                              {product.inStock ? "In stock" : "Out"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                              <AdminIcon name="edit" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(product.id || (product as any)._id)
                              }
                              disabled={
                                deletingId ===
                                (product.id || (product as any)._id)
                              }
                              className="inline-flex items-center justify-center rounded-full bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={`Delete ${product.name}`}
                            >
                              <AdminIcon name="trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:hidden">
            {loading ? (
              <div className="rounded-[1.4rem] border border-slate-100 bg-white p-4 text-sm text-slate-500 shadow-sm">
                Loading products...
              </div>
            ) : filteredProducts.length ? (
              filteredProducts.map((product) => (
                <article
                  key={product.id || (product as any)._id}
                  className="rounded-[1.4rem] border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <ProductPreview
                    src={resolveImageSource(
                      getPrimaryProductImage(product),
                      "/desktop.jpg",
                    )}
                    alt={product.name}
                  />
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {product.slug}
                      </p>
                      <h3 className="mt-2 break-words text-base font-bold text-slate-900">
                        {product.name}
                      </h3>
                    </div>
                    <AdminBadge
                      label={product.visible ? "Visible" : "Hidden"}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Category
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {getCategoryLabel(product.category)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Subcategory
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {typeof product.subcategory === "object" &&
                        product.subcategory !== null
                          ? (product.subcategory as any).name
                          : product.subcategory}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Price
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Stock
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {product.inStock ? "In stock" : "Out of stock"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(product.id || (product as any)._id)
                      }
                      disabled={
                        deletingId === (product.id || (product as any)._id)
                      }
                      className="rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-slate-100 bg-white p-4 text-sm text-slate-500 shadow-sm">
                No products found.
              </div>
            )}
          </div>
        </section>

        <div className="w-full min-w-0 space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-5 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] sm:p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Admin access
            </p>
            <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">
              Protected product workflow
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <p>
                Save a bearer token once, then manage products from this
                workspace.
              </p>
              <p>
                Load categories from the admin API so the product form stays
                aligned with the catalog structure.
              </p>
              <p>
                Edit, create, and delete inventory items without leaving the
                admin dashboard.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/admin/settings"
                className="rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:py-2"
              >
                Profile settings
              </Link>
              <button
                onClick={() => void loadProducts()}
                className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 sm:py-2"
              >
                Refresh products
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              API connection
            </p>
            <h2 className="mt-2 font-display text-xl font-bold text-slate-900 sm:text-2xl">
              Admin API status
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The admin product page uses your session token automatically.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Connection
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {apiReady ? "Connected" : "Not connected"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => window.location.assign("/admin/settings")}
                  className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a]"
                >
                  Go to settings
                </button>
                <button
                  type="button"
                  onClick={() => window.location.assign("/admin/settings")}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Reconnect token
                </button>
                <button
                  type="button"
                  onClick={() => void loadProducts()}
                  disabled={loading}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {loading ? "Refreshing..." : "Refresh products"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 md:p-8">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {selectedProduct ? "Edit product" : "Create product"}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-900 sm:text-2xl">
                  {selectedProduct
                    ? "Update inventory item"
                    : "Add a new product"}
                </h2>
              </div>
              <AdminBadge label={session?.name ? "Visible" : "Pending"} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 lg:grid-cols-2"
            >
              <div className="grid gap-4 rounded-[1.5rem] bg-slate-50 p-4 md:col-span-2">
                <ProductPreview
                  src={
                    preview ||
                    resolveImageSource(
                      getPrimaryProductImage(selectedProduct),
                      "/desktop.jpg",
                    )
                  }
                  alt={form.name || "Product preview"}
                />
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-[11px] leading-5 text-slate-600">
                  <p className="mb-2 font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Image debug
                  </p>
                  <pre className="whitespace-pre-wrap break-words font-mono">
                    {imageDebug || "No product selected yet."}
                  </pre>
                </div>
                <div className="grid gap-3">
                  <div className="grid gap-2 text-sm font-medium text-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Product images
                        </p>
                        <p className="text-xs leading-5 text-slate-500">
                          Add up to {MAX_PRODUCT_IMAGES} image slots. The first
                          slot is used as the main preview.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addImageSlot}
                        disabled={form.files.length >= MAX_PRODUCT_IMAGES}
                        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add slot
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {form.files.map((file, index) => (
                      <div
                        key={index}
                        className="grid gap-3 rounded-[1.4rem] border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1.2fr)_auto]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                              {getImageLabel(index)}
                            </p>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              {index === 0 ? "Main" : "Extra"}
                            </span>
                          </div>
                          <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {file ? file.name : "No image selected"}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {file
                                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                : "Choose a PNG, JPEG, WebP, or SVG file"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:items-end">
                          <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#0a2a78] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#12386a]">
                            Choose file
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/svg+xml"
                              onChange={(event) => handleImageUpload(index, event)}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeImageSlot(index)}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100"
                          >
                            Remove slot
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden rounded-2xl border border-dashed border-slate-300 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Selected images
                      </p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {form.files.length}/{MAX_PRODUCT_IMAGES}
                      </span>
                    </div>
                    {form.files.length > 0 ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {form.files
                          .filter((file): file is File => Boolean(file))
                          .map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                              {index === 0 ? "Main" : `#${index + 1}`}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        No images selected yet.
                      </p>
                    )}
                  </div>
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
                        placeholder="product-slug"
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
                  <p className="text-xs font-medium text-slate-500">
                    Selected images: {form.files.length || "none"}
                  </p>
                </div>
              </div>

              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
                <span>Product name</span>
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
                  placeholder="EliteBook 840 G11"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
              </label>

              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
                <span>Price</span>
                <input
                  value={form.price ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  placeholder="1249"
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
              </label>

              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
                <span>Category</span>
                {categories.length ? (
                  <select
                    value={form.category}
                    onChange={(event) => {
                      const nextCategoryId = event.target.value;
                      const nextCategory =
                        categories.find(
                          (c) => (c.id || (c as any)._id) === nextCategoryId,
                        ) ?? null;
                      setForm((current) => ({
                        ...current,
                        category: nextCategoryId,
                        subcategory:
                          (nextCategory?.subcategories[0]?.id ||
                            (nextCategory?.subcategories[0] as any)?._id) ??
                          "",
                      }));
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => {
                      const id = category.id || (category as any)._id;
                      return (
                        <option key={id} value={id}>
                          {category.name}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <>
                    <input
                      value={form.category}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      placeholder="Laptops"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {STANDARD_CATEGORIES.map((std) => (
                        <button
                          key={std.name}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              category: std.name,
                              subcategory: std.subcategories[0],
                            }))
                          }
                          className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition hover:bg-[#0a2a78] hover:text-white"
                        >
                          {std.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </label>

              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700">
                <span>Subcategory</span>
                {subcategoryOptions.length ? (
                  <select
                    value={form.subcategory}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        subcategory: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                  >
                    <option value="">Select subcategory</option>
                    {subcategoryOptions.map((subcategory) => {
                      const subId = subcategory.id || (subcategory as any)._id;
                      return (
                        <option key={subId} value={subId}>
                          {subcategory.name}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <>
                    <input
                      value={form.subcategory}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          subcategory: event.target.value,
                        }))
                      }
                      placeholder="Business laptops"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(
                        STANDARD_CATEGORIES.find(
                          (s) => s.name === form.category,
                        )?.subcategories || [
                          "Business",
                          "Enterprise",
                          "Productivity",
                        ]
                      ).map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() =>
                            setForm((c) => ({ ...c, subcategory: sub }))
                          }
                          className="rounded-full border border-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 transition hover:border-[#0a2a78] hover:text-[#0a2a78]"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </label>

              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Short product description"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
              </label>

              <label className="grid min-w-0 gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Specs</span>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-slate-600">
                      Add structured product details like RAM, storage, GPU,
                      or processor. These become a flexible specs object in the
                      backend.
                    </p>
                    <button
                      type="button"
                      onClick={addSpecRow}
                      className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-slate-800 sm:w-auto"
                    >
                      Add field
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {form.specRows.map((row, index) => (
                      <div
                        key={`${index}-${row.key}`}
                        className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
                      >
                        <input
                          value={row.key}
                          onChange={(event) =>
                            updateSpecRow(index, "key", event.target.value)
                          }
                          placeholder="Spec name"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                        />
                        <input
                          value={row.value}
                          onChange={(event) =>
                            updateSpecRow(index, "value", event.target.value)
                          }
                          placeholder="Spec value"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecRow(index)}
                          className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-xs leading-5 text-slate-500">
                    Example: <span className="font-semibold">RAM</span>,{" "}
                    <span className="font-semibold">Storage</span>,{" "}
                    <span className="font-semibold">Processor</span>,{" "}
                    <span className="font-semibold">Graphics</span>,{" "}
                    <span className="font-semibold">Battery</span>.
                  </div>
                </div>
              </label>

              <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
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
                Visible on storefront
              </label>

              <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  checked={form.inStock}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      inStock: event.target.checked,
                    }))
                  }
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#0a2a78] focus:ring-[#0a2a78]"
                />
                In stock
              </label>

              {error && (
                <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2">
                  <strong className="block mb-1 font-semibold text-rose-800">
                    Error
                  </strong>
                  {typeof error === "string" && error.includes("{") ? (
                    <pre className="whitespace-pre-wrap font-mono text-[11px]">
                      {error}
                    </pre>
                  ) : (
                    error
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving || !apiReady}
                  className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving
                    ? "Saving..."
                    : selectedProduct
                      ? "Save changes"
                      : "Add product"}
                </button>
                <button
                  type="button"
                  onClick={openCreate}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                >
                  Clear form
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
