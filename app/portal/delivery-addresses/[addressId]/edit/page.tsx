"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, DeliveryAddress } from "../../../../../lib/zowkins-api";
import PortalNavbar from "../../../../../components/PortalNavbar";

export default function EditDeliveryAddressPage() {
  const params = useParams();
  const router = useRouter();
  const addressId = params.addressId as string;

  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    label: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
  });

  useEffect(() => {
    if (addressId) {
      fetchAddress();
    }
  }, [addressId]);

  const fetchAddress = async () => {
    try {
      const token = localStorage.getItem("portalToken");
      if (!token) {
        setError("Please sign in to edit delivery address");
        return;
      }

      // Get user info first
      const userResponse = await zowkinsApi.getPortalMe(token);
      setUser(userResponse);

      // Get address details
      const addressResponse = await zowkinsApi.getDeliveryAddress(token, userResponse.id, addressId);
      setAddress(addressResponse);
      
      // Populate form
      setFormData({
        label: addressResponse.label,
        phoneNumber: addressResponse.phoneNumber,
        street: addressResponse.street,
        city: addressResponse.city,
        state: addressResponse.state,
        country: addressResponse.country,
        postalCode: addressResponse.postalCode,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch delivery address");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("User information not available");
      return;
    }

    // Basic validation
    if (!formData.label || !formData.phoneNumber || !formData.street || !formData.city || !formData.state || !formData.postalCode) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("portalToken");
      if (!token) {
        throw new Error("Please sign in to update delivery address");
      }

      const addressData = {
        label: formData.label,
        phoneNumber: formData.phoneNumber,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
      };

      await zowkinsApi.updateDeliveryAddress(token, user.id, addressId, addressData);
      
      // Redirect to addresses list
      router.push("/portal/delivery-addresses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update delivery address");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <PortalNavbar />
        <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (error && !address) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <PortalNavbar />
        <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
            <Link 
              href="/portal/delivery-addresses" 
              className="mt-4 inline-block text-[#f3c74d] hover:underline"
            >
              ← Back to Delivery Addresses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <PortalNavbar />
        <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
          <div className="text-center">
            <p className="text-slate-300">Delivery address not found</p>
            <Link 
              href="/portal/delivery-addresses" 
              className="mt-4 inline-block text-[#f3c74d] hover:underline"
            >
              ← Back to Delivery Addresses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <PortalNavbar />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <Link 
            href="/portal/delivery-addresses" 
            className="mb-4 inline-block text-[#f3c74d] hover:underline"
          >
            ← Back to Delivery Addresses
          </Link>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Edit Delivery Address</h1>
          <p className="mt-2 text-slate-300">Update your delivery address details</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Address Label */}
            <div>
              <label htmlFor="label" className="mb-2 block text-sm font-medium text-white">
                Address Label *
              </label>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                placeholder="e.g., Home, Office, Work"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-white">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="e.g., 08012345678"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                required
              />
            </div>

            {/* Street Address */}
            <div className="md:col-span-2">
              <label htmlFor="street" className="mb-2 block text-sm font-medium text-white">
                Street Address *
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main Street, Apartment 4B"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                required
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-medium text-white">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., Lagos"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                required
              />
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="mb-2 block text-sm font-medium text-white">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="e.g., Lagos State"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="mb-2 block text-sm font-medium text-white">
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                required
              >
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Postal Code */}
            <div>
              <label htmlFor="postalCode" className="mb-2 block text-sm font-medium text-white">
                Postal Code *
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="e.g., 100234"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                required
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              href="/portal/delivery-addresses"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Updating Address..." : "Update Address"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
