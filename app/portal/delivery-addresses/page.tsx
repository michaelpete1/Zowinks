"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, DeliveryAddress, PortalUser, ApiError } from "../../../lib/zowkins-api";

export default function PortalDeliveryAddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("portalToken");
      if (!token) { router.replace("/portal/auth/login"); return; }
      try {
        const portalUser = await zowkinsApi.getPortalMe(token);
        const portalAddresses = await zowkinsApi.listDeliveryAddresses(token, portalUser.id);
        setUser(portalUser);
        setAddresses(portalAddresses);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("portalToken");
          localStorage.removeItem("portalUser");
          router.replace("/portal/auth/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to fetch delivery addresses");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router]);

  const handleDelete = async (addressId: string) => {
    if (!confirm("Delete this delivery address?")) return;
    const token = localStorage.getItem("portalToken");
    if (!token || !user) return;
    setDeletingId(addressId);
    try {
      await zowkinsApi.deleteDeliveryAddress(token, user.id, addressId);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <div className="flex items-center justify-center gap-3 text-slate-300">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        Loading addresses...
      </div>
    </main>
  );

  if (error) return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
        <p className="text-red-400">{error}</p>
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Delivery Addresses</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your saved delivery addresses</p>
        </div>
        <Link
          href="/portal/delivery-addresses/create"
          className="inline-flex items-center gap-2 rounded-full bg-[#f3c74d] px-5 py-2.5 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] active:scale-95"
        >
          + Add Address
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-slate-300">You haven&apos;t added any delivery addresses yet.</p>
          <Link
            href="/portal/delivery-addresses/create"
            className="mt-5 inline-block rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
          >
            Add Your First Address
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-white/8 bg-white/5 p-5">

              {/* Card header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-white leading-snug">{address.label || "Address"}</h3>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/portal/delivery-addresses/${address.id}/edit`}
                    title="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-[#f3c74d]/40 hover:text-[#f3c74d]"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
                  >
                    {deletingId === address.id ? (
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                    ) : (
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-2 text-sm text-slate-300">
                <p>{address.street}</p>
                <p>{address.city}, {address.state}</p>
                <p>{address.country}{address.postalCode ? `, ${address.postalCode}` : ""}</p>
                <p className="text-slate-400">{address.phoneNumber}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
