"use client";

import Link from "next/link";
import Image from "next/image";
import { AdminShell } from "../../../components/AdminShell";

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Settings" subtitle="Product media workflow and image standards for the catalog.">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Settings</p>
              <h2 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight md:text-4xl">Keep product images clean, consistent, and ready for the storefront.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 md:text-base">This page documents the image workflow before the backend upload pipeline is connected. Use it to keep the inventory presentation consistent.</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">Image URL</p>
                  <p className="mt-1 text-sm font-semibold">Paste a local or remote link</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">Upload</p>
                  <p className="mt-1 text-sm font-semibold">Preview files before publish</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">Backend ready</p>
                  <p className="mt-1 text-sm font-semibold">Swap to storage when ready</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[280px] overflow-hidden bg-slate-900/40 md:min-h-[320px]">
              <Image src="/desktop.jpg" alt="Desktop product preview" fill className="object-cover opacity-90" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,42,120,0.15),rgba(10,42,120,0.8))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.22),transparent_35%)]" />
              <div className="absolute bottom-4 left-4 right-4 rounded-[1.4rem] bg-slate-950/50 p-4 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">Preview panel</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">Keep the hero and product cards aligned with the same image standards so the store feels consistent.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Where to add pictures</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Use the inventory modal</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.3rem] bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Add product modal</p>
                <p className="mt-2 leading-6">Enter an image URL or upload a file while creating a product.</p>
              </div>
              <div className="rounded-[1.3rem] bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Edit product modal</p>
                <p className="mt-2 leading-6">Update the image whenever a product needs a new photo or crop.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Image standards</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Keep assets consistent</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Aspect ratio</p><p className="mt-1 text-sm font-semibold text-slate-900">4:3 or 16:9</p></div>
              <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Format</p><p className="mt-1 text-sm font-semibold text-slate-900">JPG, PNG, or WebP</p></div>
              <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Size</p><p className="mt-1 text-sm font-semibold text-slate-900">At least 1200px wide</p></div>
              <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Focus</p><p className="mt-1 text-sm font-semibold text-slate-900">Clean product framing</p></div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Operational note</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Ready for backend integration</h2>
            <p className="mt-3 text-sm leading-7 text-slate-200">When the backend lands, this workflow can point to storage without changing the admin experience.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/admin/products" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Open products</Link>
              <Link href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Back to dashboard</Link>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
