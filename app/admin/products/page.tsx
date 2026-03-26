"use client";

import { ChangeEvent, FormEvent, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { AdminBadge, AdminIcon, AdminShell } from "../../../components/AdminShell";
import { useCatalog, type CatalogProduct } from "../../../hooks/useCatalog";

const brandOptionsByCategory: Record<string, string[]> = {
  Laptops: ["HP", "Dell", "Lenovo", "Asus", "Apple"],
  Desktops: ["HP", "Lenovo"],
  Accessories: ["Zowkins", "Logitech", "Lenovo", "Dell", "Canon"],
  Networking: ["Zowkins", "TP-Link", "Cisco", "D-Link"],
};

const defaultBrandByCategory: Record<string, string> = {
  Laptops: "HP",
  Desktops: "HP",
  Accessories: "Zowkins",
  Networking: "Zowkins",
};

function ProductModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  editing,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: { brand: string; name: string; category: string; price: string; stock: string; visibility: CatalogProduct["visibility"]; image: string };
  setForm: Dispatch<SetStateAction<{ brand: string; name: string; category: string; price: string; stock: string; visibility: CatalogProduct["visibility"]; image: string }>>;
  editing: CatalogProduct | null;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  if (!open) return null;

  const isLaptop = form.category === "Laptops";
  const isAccessory = form.category === "Accessories";
  const currentBrandOptions = brandOptionsByCategory[form.category] ?? ["Zowkins"];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="flex h-[100dvh] w-full max-w-none flex-col overflow-y-auto rounded-none bg-white p-4 shadow-2xl md:h-auto md:max-w-3xl md:rounded-[2rem] md:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Inventory</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">{editing ? "Edit product" : "Add product"}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">Close</button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 grid gap-4 rounded-[1.5rem] bg-slate-50 p-4">
            <div className="overflow-hidden rounded-[1.3rem] bg-white ring-1 ring-slate-200">
              <Image src={form.image || "/desktop.jpg"} alt="Product preview" width={1200} height={675} className="h-36 w-full object-cover md:h-48" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Image URL</span>
                <input
                  value={form.image}
                  onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                  placeholder="/hp.jpg or https://..."
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78]"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Upload file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUpload}
                  className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:border-[#0a2a78]"
                />
              </label>
            </div>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Product type</span>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                  brand:
                    event.target.value === "Accessories"
                      ? ""
                      : defaultBrandByCategory[event.target.value] ?? current.brand,
                  name: event.target.value === "Laptops" && !editing ? "" : current.name,
                }))
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
            >
              <option>Laptops</option>
              <option>Desktops</option>
              <option>Accessories</option>
              <option>Networking</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>{isAccessory ? "Accessory brand" : isLaptop ? "Laptop brand" : "Brand"}</span>
            {isAccessory ? (
              <input
                value={form.brand}
                onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
                placeholder="Canon"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              />
            ) : (
              <select
                value={form.brand}
                onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
              >
                {currentBrandOptions.map((brand) => (
                  <option key={brand}>{brand}</option>
                ))}
              </select>
            )}
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>{isLaptop ? "Laptop model" : "Product name"}</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder={isLaptop ? "EliteBook 840 G11" : "Product name"}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
            />
          </label>

          <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price, e.g. ₦1,250" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white" />
          <input value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} placeholder="Stock count" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white" />
          <select value={form.visibility} onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value as CatalogProduct["visibility"] }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white">
            <option>Visible</option>
            <option>Hidden</option>
          </select>
          <div className="flex items-center gap-3 md:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a]">{editing ? "Save changes" : "Add product"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const products = useCatalog((state) => state.products);
  const setProducts = useCatalog((state) => state.setProducts);
  const toggleFeatured = useCatalog((state) => state.toggleFeatured);
  const [query, setQuery] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [productForm, setProductForm] = useState({ brand: "HP", name: "", category: "Laptops", price: "", stock: "", visibility: "Visible" as CatalogProduct["visibility"], image: "" });

  const visibleCount = useMemo(() => products.filter((product) => product.visibility === "Visible").length, [products]);
  const featuredCount = useMemo(() => products.filter((product) => product.featured).length, [products]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) => [product.id, product.brand, product.name, product.category, product.price, product.visibility].some((value) => value.toLowerCase().includes(needle)));
  }, [products, query]);

  const resetForm = () => {
    setProductForm({ brand: "HP", name: "", category: "Laptops", price: "", stock: "", visibility: "Visible", image: "" });
    setEditingProduct(null);
  };

  const openAddProduct = () => {
    resetForm();
    setProductModalOpen(true);
  };

  const openEditProduct = (product: CatalogProduct) => {
    setEditingProduct(product);
    setProductForm({
      brand: product.brand,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: String(product.stock),
      visibility: product.visibility,
      image: product.image ?? "",
    });
    setProductModalOpen(true);
  };

  const closeModal = () => {
    setProductModalOpen(false);
    resetForm();
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProductForm((current) => ({ ...current, image: String(reader.result) }));
      }
    };
    reader.readAsDataURL(file);
  };

  const submitProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!productForm.brand.trim() || !productForm.name.trim() || !productForm.price.trim() || !productForm.stock.trim()) return;

    const nextProduct: CatalogProduct = {
      id: editingProduct?.id ?? `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: productForm.brand.trim(),
      name: productForm.name.trim(),
      category: productForm.category,
      price: productForm.price.trim(),
      stock: Number(productForm.stock) || 0,
      visibility: productForm.visibility,
      image: productForm.image.trim(),
      featured: editingProduct?.featured ?? false,
    };

    setProducts((current) => (editingProduct ? current.map((item) => (item.id === editingProduct.id ? nextProduct : item)) : [nextProduct, ...current]));
    closeModal();
  };

  const removeProduct = (id: string) => setProducts((current) => current.filter((item) => item.id !== id));

  return (
    <AdminShell title="Products" subtitle="Add, edit, hide, feature, or remove products from a dedicated inventory page." searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search products...">
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Inventory</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Manage products</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminBadge label="Visible" />
            <button type="button" onClick={openAddProduct} className="inline-flex items-center gap-2 rounded-full bg-[#0a2a78] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#12386a]"><AdminIcon name="plus" />Add product</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Total products</p><p className="mt-2 text-2xl font-bold text-slate-900">{products.length}</p></div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Visible</p><p className="mt-2 text-2xl font-bold text-slate-900">{visibleCount}</p></div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Hidden</p><p className="mt-2 text-2xl font-bold text-slate-900">{products.length - visibleCount}</p></div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">New</p><p className="mt-2 text-2xl font-bold text-slate-900">{featuredCount}</p></div>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Use <span className="font-semibold">Mark new</span> and <span className="font-semibold">Remove new</span> to control the homepage new products section.
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[1.5rem] border border-slate-100 md:block">
            <div className="grid grid-cols-[0.7fr_0.8fr_1.1fr_0.9fr_0.8fr_0.7fr_1fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            <span>Image</span><span>Brand</span><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Actions</span>
            </div>
          {filteredProducts.map((product) => (
            <div key={product.id} className="grid grid-cols-[0.7fr_0.8fr_1.1fr_0.9fr_0.8fr_0.7fr_1fr] gap-3 border-t border-slate-100 px-4 py-4 text-sm">
              <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"><Image src={product.image || "/desktop.jpg"} alt={product.name} width={56} height={56} className="h-full w-full object-cover" /></div>
              <div><p className="font-semibold text-slate-900">{product.brand}</p><p className="mt-1 text-xs text-slate-500">Brand</p></div>
              <div><p className="font-semibold text-slate-900">{product.name}</p><div className="mt-1 flex flex-wrap gap-2"><AdminBadge label={product.visibility} />{product.featured ? <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">New</span> : null}</div></div>
              <span className="text-slate-600">{product.category}</span>
              <span className="font-semibold text-slate-900">{product.price}</span>
              <span className="font-semibold text-slate-900">{product.stock}</span>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => toggleFeatured(product.id)} className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">{product.featured ? "Remove new" : "Mark new"}</button>
                <button type="button" onClick={() => openEditProduct(product)} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"><AdminIcon name="edit" />Edit</button>
                <button type="button" onClick={() => removeProduct(product.id)} className="inline-flex items-center justify-center rounded-full bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100" aria-label={`Remove ${product.name}`}><AdminIcon name="trash" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:hidden">
          {filteredProducts.map((product) => (
            <article key={product.id} className="rounded-[1.4rem] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 overflow-hidden rounded-[1.2rem] bg-slate-100"><Image src={product.image || "/desktop.jpg"} alt={product.name} width={640} height={360} className="h-40 w-full object-cover" /></div>
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{product.id}</p><h3 className="mt-2 text-base font-bold text-slate-900">{product.brand} {product.name}</h3></div>
                <AdminBadge label={product.visibility} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Brand</p><p className="mt-1 font-semibold text-slate-900">{product.brand}</p></div>
                <div><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Category</p><p className="mt-1 font-semibold text-slate-900">{product.category}</p></div>
                <div><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Price</p><p className="mt-1 font-semibold text-slate-900">{product.price}</p></div>
                <div><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stock</p><p className="mt-1 font-semibold text-slate-900">{product.stock}</p></div>
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Actions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => toggleFeatured(product.id)} className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">{product.featured ? "Remove new" : "Mark new"}</button>
                    <button type="button" onClick={() => openEditProduct(product)} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Edit</button>
                    <button type="button" onClick={() => removeProduct(product.id)} className="rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Delete</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ProductModal open={productModalOpen} onClose={closeModal} onSubmit={submitProduct} form={productForm} setForm={setProductForm} editing={editingProduct} onUpload={handleImageUpload} />
    </AdminShell>
  );
}
