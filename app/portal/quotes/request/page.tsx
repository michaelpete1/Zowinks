"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, DeliveryAddress, PortalUser, ApiError } from "../../../../lib/zowkins-api";

export default function PortalQuoteRequestPage() {
  const router = useRouter();

  const [user, setUser] = useState<PortalUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [quoteItems, setQuoteItems] = useState([{ name: "", quantity: 1 }]);
  const [note, setNote] = useState("");
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const [retryLabel, setRetryLabel] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const storedToken = localStorage.getItem("portalToken");
      if (!storedToken) { router.replace("/portal/auth/login"); return; }

      try {
        const portalUser = await zowkinsApi.getPortalMe(storedToken);
        const portalAddresses = await zowkinsApi.listDeliveryAddresses(storedToken, portalUser.id);
        setToken(storedToken);
        setUser(portalUser);
        setAddresses(portalAddresses);
        if (portalAddresses.length > 0) setSelectedAddressId(portalAddresses[0].id);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("portalToken");
          localStorage.removeItem("portalUser");
          router.replace("/portal/auth/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router]);

  // Rate-limit countdown
  useEffect(() => {
    if (!retryUntil) { setRetryLabel(null); return; }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
      if (remaining <= 0) { setRetryLabel(null); setRetryUntil(null); return; }
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setRetryLabel(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [retryUntil]);

  const changeItem = (index: number, field: "name" | "quantity", value: string | number) => {
    setQuoteItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    const validItems = quoteItems.filter((item) => item.name.trim() && item.quantity > 0);
    if (!validItems.length) { setError("Please add at least one item with a name and quantity"); return; }
    if (!selectedAddressId) { setError("Please select a delivery address"); return; }

    setSubmitting(true);
    setError(null);

    try {
      // Logged-in: send address ID, skip customer field
      const data = {
        deliveryAddress: selectedAddressId,
        items: validItems,
        note: note.trim() || undefined,
      };

      const response = await zowkinsApi.requestPortalQuote(token, {
        data: JSON.stringify(data),
        files: quoteFile ?? undefined,
      });

      router.push(`/portal/quotes/${response.order.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit quote request";
      if (err instanceof ApiError && err.status === 429 && typeof err.retryAfter === "number") {
        setRetryUntil(Date.now() + err.retryAfter * 1000);
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-center text-slate-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Request a Quote</h1>
        <p className="mt-2 text-slate-300">Get a personalised quote for your custom order</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {retryLabel && (
        <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <p className="text-yellow-200">Too many requests. Try again in {retryLabel}.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer info — read only */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Customer Information</h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div><p className="text-slate-400">Name</p><p className="font-medium text-white">{user?.firstName} {user?.lastName}</p></div>
            <div><p className="text-slate-400">Email</p><p className="font-medium text-white">{user?.email}</p></div>
            <div><p className="text-slate-400">Phone</p><p className="font-medium text-white">{user?.phoneNumber}</p></div>
          </div>
        </div>

        {/* Quote items */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Quote Items</h2>
            <button
              type="button"
              onClick={() => setQuoteItems((prev) => [...prev, { name: "", quantity: 1 }])}
              className="rounded-full bg-[#f3c74d] px-4 py-2 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-4">
            {quoteItems.map((item, index) => (
              <div key={index} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Item name or description"
                  value={item.name}
                  onChange={(e) => changeItem(index, "name", e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => changeItem(index, "quantity", parseInt(e.target.value) || 1)}
                  className="w-24 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                />
                {quoteItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setQuoteItems((prev) => prev.filter((_, i) => i !== index))}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Delivery Address</h2>
          {addresses.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-400 mb-4">No delivery addresses found</p>
              <Link href="/portal/delivery-addresses/create" className="inline-block rounded-full bg-[#f3c74d] px-4 py-2 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]">
                Add Address
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <label key={address.id} className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="deliveryAddress"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-white">{address.label}</p>
                    <p className="text-sm text-slate-300">{address.street}, {address.city}, {address.state}</p>
                    <p className="text-sm text-slate-300">{address.phoneNumber}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Additional info */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Notes (Optional)</label>
              <textarea
                placeholder="Any additional requirements or specifications..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
              />
            </div>
            <div>
              <label htmlFor="quote-file" className="mb-2 block text-sm font-medium text-white">
                Quote Document (Optional — Max 5MB)
              </label>
              <input
                id="quote-file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { setError("File size must be less than 5MB"); return; }
                  setQuoteFile(file);
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#f3c74d] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#050b16] hover:file:bg-[#e4b935]"
              />
              {quoteFile && (
                <p className="mt-2 text-sm text-slate-300">
                  Selected: {quoteFile.name} ({(quoteFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/portal" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || Boolean(retryUntil)}
            className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Request Quote"}
          </button>
        </div>
      </form>
    </main>
  );
}
