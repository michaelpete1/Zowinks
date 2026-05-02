"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  zowkinsApi,
  PortalOrderQuote,
  DeliveryAddress,
} from "../../../../lib/zowkins-api";
import PortalNavbar from "../../../../components/PortalNavbar";

export default function PortalQuoteRequestPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>(
    [],
  );
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [quoteItems, setQuoteItems] = useState([{ name: "", quantity: 1 }]);
  const [note, setNote] = useState("");
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("portalToken");
    const userData = localStorage.getItem("portalUser");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setUser({ token, user });
        fetchData(token, user.id);
      } catch (error) {
        console.error("Failed to parse user data", error);
        router.push("/portal/auth/login");
      }
    } else {
      router.push("/portal/auth/login");
    }
  };

  const fetchData = async (token: string, userId: string) => {
    try {
      const addressesResponse = await zowkinsApi.listDeliveryAddresses(
        token,
        userId,
      );

      setDeliveryAddresses(addressesResponse);

      // Set default selections
      if (addressesResponse.length > 0) {
        setSelectedAddress(addressesResponse[0].id);
      }
    } catch (err) {
      setError("Failed to load delivery information");
    }
  };

  const handleAddItem = () => {
    setQuoteItems((prev) => [...prev, { name: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setQuoteItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: "name" | "quantity",
    value: string | number,
  ) => {
    setQuoteItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setQuoteFile(file);
    }
  };

  const validateForm = () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return false;
    }

    const validItems = quoteItems.filter(
      (item) => item.name.trim() !== "" && item.quantity > 0,
    );
    if (validItems.length === 0) {
      setError("Please add at least one item with name and quantity");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const validItems = quoteItems.filter(
        (item) => item.name.trim() !== "" && item.quantity > 0,
      );
      const selectedAddressData = deliveryAddresses.find(
        (addr) => addr.id === selectedAddress,
      );

      if (!selectedAddressData) {
        setError("Invalid delivery address selected");
        return;
      }

      const payload = {
        data: JSON.stringify({
          customer: {
            firstName: user.user.firstName,
            lastName: user.user.lastName,
            email: user.user.email,
            phoneNumber: user.user.phoneNumber,
          },
          items: validItems,
          deliveryAddress: {
            phoneNumber: selectedAddressData.phoneNumber,
            street: selectedAddressData.street,
            city: selectedAddressData.city,
            state: selectedAddressData.state,
            country: selectedAddressData.country,
            postalCode: selectedAddressData.postalCode,
          },
          note: note.trim() || undefined,
        }),
        file: quoteFile || undefined,
      };

      const response = await zowkinsApi.requestPortalQuote(user.token, payload);

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "portalLastQuote",
          JSON.stringify(response.order),
        );
      }

      setMessage(
        "Quote request submitted successfully! Redirecting to your quote details...",
      );

      // Redirect to quote details page
      setTimeout(() => {
        router.push(`/portal/quotes/${response.order.id}`);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit quote request",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <PortalNavbar />
        <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <div className="text-center">
            <p className="text-slate-400">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <PortalNavbar />

      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Request a Quote
          </h1>
          <p className="mt-2 text-slate-300">
            Get a personalized quote for your custom order
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-green-400">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Customer Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="font-medium text-white">
                  {user.user.firstName} {user.user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="font-medium text-white">{user.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                <p className="font-medium text-white">
                  {user.user.phoneNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Quote Items */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Quote Items</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="rounded-full bg-[#f3c74d] px-4 py-2 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {quoteItems.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor={`item-name-${index}`} className="sr-only">
                      Item name or description
                    </label>
                    <input
                      id={`item-name-${index}`}
                      type="text"
                      placeholder="Item name or description"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                    />
                  </div>
                  <div className="w-24">
                    <label
                      htmlFor={`item-quantity-${index}`}
                      className="sr-only"
                    >
                      Quantity
                    </label>
                    <input
                      id={`item-quantity-${index}`}
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                    />
                  </div>
                  {quoteItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 transition hover:border-red-500/45 hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Delivery Address */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Delivery Address
              </h2>
              {deliveryAddresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-400 mb-4">
                    No delivery addresses found
                  </p>
                  <Link
                    href="/portal/delivery-addresses/create"
                    className="inline-block rounded-full bg-[#f3c74d] px-4 py-2 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                  >
                    Add Address
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveryAddresses.map((address) => (
                    <label
                      key={address.id}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="deliveryAddress"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {address.label}
                        </p>
                        <p className="text-sm text-slate-300">
                          {address.street}
                        </p>
                        <p className="text-sm text-slate-300">
                          {address.city}, {address.state}, {address.country}
                        </p>
                        <p className="text-sm text-slate-300">
                          {address.phoneNumber}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Method */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Delivery Method
              </h2>
              <p className="text-sm text-slate-400">
                Delivery method will be confirmed by the team after reviewing
                your quote.
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Any additional requirements or specifications..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="quote-file"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Quote Document (Optional - Max 5MB)
                </label>
                <input
                  id="quote-file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#f3c74d] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#050b16] hover:file:bg-[#e4b935]"
                />
                {quoteFile && (
                  <p className="mt-2 text-sm text-slate-300">
                    Selected: {quoteFile.name} (
                    {(quoteFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/portal"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Request Quote"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
