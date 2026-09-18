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
    if (!confirm("Are you sure you want to delete this delivery address?")) return;
    const token = localStorage.getItem("portalToken");
    if (!token || !user) return;
    try {
      await zowkinsApi.deleteDeliveryAddress(token, user.id, addressId);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete delivery address");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Delivery Addresses</h1>
            <p className="mt-2 text-slate-300">Manage your delivery addresses for orders</p>
          </div>
          <Link
            href="/portal/delivery-addresses/create"
            className="mt-4 inline-flex rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] md:mt-0"
          >
            Add New Address
          </Link>
        </div>

        {addresses.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-slate-300">You haven&apos;t added any delivery addresses yet.</p>
            <Link 
              href="/portal/delivery-addresses/create" 
              className="mt-4 inline-block rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
            >
              Add Your First Address
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{address.label}</h3>
                    <p className="text-sm text-slate-400">Address ID: {address.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/portal/delivery-addresses/${address.id}/edit`}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                      title="Edit address"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:border-red-500/45 hover:bg-red-500/10"
                      title="Delete address"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-white">{address.street}</p>
                      <p className="text-slate-300">{address.city}, {address.state}</p>
                      <p className="text-slate-300">{address.country}, {address.postalCode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-slate-300">{address.phoneNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
  );
}
