"use client";

import { ChangeEvent, FormEvent, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { AdminBadge, AdminIcon, AdminShell } from "../../../components/AdminShell";
import { useAdminRecords, type CategoryRecord } from "../../../hooks/useAdminRecords";

function CategoryModal({
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
  form: { name: string; description: string; productCount: string; visibility: CategoryRecord["visibility"]; image: string };
  setForm: Dispatch<SetStateAction<{ name: string; description: string; productCount: string; visibility: CategoryRecord["visibility"]; image: string }>>;
  editing: CategoryRecord | null;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="flex h-[100dvh] w-full max-w-none flex-col overflow-y-auto rounded-none bg-white p-4 shadow-2xl md:h-auto md:max-w-2xl md:rounded-[2rem] md:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Catalog</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">{editing ? "Edit category" : "Add category"}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">Close</button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 grid gap-4 rounded-[1.5rem] bg-slate-50 p-4">
            <div className="overflow-hidden rounded-[1.3rem] bg-white ring-1 ring-slate-200">
              <Image src={form.image || "/desktop.jpg"} alt="Category preview" width={1200} height={675} className="h-36 w-full object-cover md:h-48" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Image URL</span>
                <input
                  value={form.image}
                  onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                  placeholder="/mb.jpg or https://..."
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

          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Category name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Laptops"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              placeholder="Short category description"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
            />
          </label>

          <input
            value={form.productCount}
            onChange={(event) => setForm((current) => ({ ...current, productCount: event.target.value }))}
            placeholder="Product count"
            type="number"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
          />

          <select
            value={form.visibility}
            onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value as CategoryRecord["visibility"] }))}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
          >
            <option>Visible</option>
            <option>Hidden</option>
          </select>

          <div className="flex items-center gap-3 md:justify-end md:col-span-2">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a]">{editing ? "Save changes" : "Add category"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const categories = useAdminRecords((state) => state.categories);
  const setCategories = useAdminRecords((state) => state.setCategories);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [form, setForm] = useState({ name: "", description: "", productCount: "", visibility: "Visible" as CategoryRecord["visibility"], image: "" });

  const visibleCount = useMemo(() => categories.filter((category) => category.visibility === "Visible").length, [categories]);

  const filteredCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((category) => [category.id, category.name, category.description, String(category.productCount), category.visibility].some((value) => value.toLowerCase().includes(needle)));
  }, [categories, query]);

  const resetForm = () => {
    setForm({ name: "", description: "", productCount: "", visibility: "Visible", image: "" });
    setEditingCategory(null);
  };

  const openAddCategory = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditCategory = (category: CategoryRecord) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description,
      productCount: String(category.productCount),
      visibility: category.visibility,
      image: category.image ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((current) => ({ ...current, image: String(reader.result) }));
      }
    };
    reader.readAsDataURL(file);
  };

  const submitCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;

    const nextCategory: CategoryRecord = {
      id: editingCategory?.id ?? `CAT-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name.trim(),
      description: form.description.trim(),
      productCount: Number(form.productCount) || 0,
      visibility: form.visibility,
      image: form.image.trim(),
    };

    setCategories((current) => (editingCategory ? current.map((item) => (item.id === editingCategory.id ? nextCategory : item)) : [nextCategory, ...current]));
    closeModal();
  };

  const removeCategory = (id: string) => setCategories((current) => current.filter((item) => item.id !== id));

  return (
    <AdminShell title="Categories" subtitle="Upload, edit, hide, or remove catalog categories from one place." searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search categories...">
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Catalog</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Manage categories</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminBadge label="Visible" />
            <button type="button" onClick={openAddCategory} className="inline-flex items-center gap-2 rounded-full bg-[#0a2a78] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#12386a]"><AdminIcon name="plus" />Add category</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Total categories</p><p className="mt-2 text-2xl font-bold text-slate-900">{categories.length}</p></div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Visible</p><p className="mt-2 text-2xl font-bold text-slate-900">{visibleCount}</p></div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Hidden</p><p className="mt-2 text-2xl font-bold text-slate-900">{categories.length - visibleCount}</p></div>
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-[1.5rem] border border-slate-100 md:block">
          <div className="grid grid-cols-[0.75fr_1fr_1.5fr_0.7fr_0.8fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            <span>Image</span><span>Name</span><span>Description</span><span>Count</span><span>Actions</span>
          </div>
          {filteredCategories.map((category) => (
            <div key={category.id} className="grid grid-cols-[0.75fr_1fr_1.5fr_0.7fr_0.8fr] gap-3 border-t border-slate-100 px-4 py-4 text-sm">
              <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"><Image src={category.image || "/desktop.jpg"} alt={category.name} width={56} height={56} className="h-full w-full object-cover" /></div>
              <div><p className="font-semibold text-slate-900">{category.name}</p><div className="mt-1"><AdminBadge label={category.visibility} /></div></div>
              <p className="text-slate-600">{category.description}</p>
              <span className="font-semibold text-slate-900">{category.productCount}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => openEditCategory(category)} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"><AdminIcon name="edit" />Edit</button>
                <button type="button" onClick={() => removeCategory(category.id)} className="inline-flex items-center justify-center rounded-full bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100" aria-label={`Remove ${category.name}`}><AdminIcon name="trash" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:hidden">
          {filteredCategories.map((category) => (
            <article key={category.id} className="rounded-[1.4rem] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 overflow-hidden rounded-[1.2rem] bg-slate-100"><Image src={category.image || "/desktop.jpg"} alt={category.name} width={640} height={360} className="h-40 w-full object-cover" /></div>
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{category.id}</p><h3 className="mt-2 text-base font-bold text-slate-900">{category.name}</h3></div>
                <AdminBadge label={category.visibility} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Products</p><p className="mt-1 font-semibold text-slate-900">{category.productCount}</p></div>
                <div><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p><p className="mt-1 font-semibold text-slate-900">{category.visibility}</p></div>
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Actions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openEditCategory(category)} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Edit</button>
                    <button type="button" onClick={() => removeCategory(category.id)} className="rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Delete</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CategoryModal open={modalOpen} onClose={closeModal} onSubmit={submitCategory} form={form} setForm={setForm} editing={editingCategory} onUpload={handleImageUpload} />
    </AdminShell>
  );
}
