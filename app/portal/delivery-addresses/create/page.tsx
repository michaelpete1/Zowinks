"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, DeliveryAddress } from "../../../../lib/zowkins-api";
import PortalNavbar from "../../../../components/PortalNavbar";

export default function CreateDeliveryAddressPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof formData>>({});

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
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("portalToken");
      if (!token) {
        setError("Please sign in to create a delivery address");
        return;
      }

      const userResponse = await zowkinsApi.getPortalMe(token);
      setUser(userResponse);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user information",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.label.trim())
      newErrors.label = "Label is required (e.g. Home, Office)";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.street.trim())
      newErrors.street = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "Postal code is required";

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!user) {
      setError("User information not available");
      return;
    }

    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("portalToken");
      if (!token) {
        throw new Error("Please sign in to create a delivery address");
      }

      const addressData = {
        label: formData.label.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country,
        postalCode: formData.postalCode.trim(),
      };

      await zowkinsApi.createDeliveryAddress(token, user.id, addressData);

      // Redirect to addresses list
      router.push("/portal/delivery-addresses");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create delivery address",
      );
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
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Add New Delivery Address
          </h1>
          <p className="mt-2 text-slate-300">
            Enter your delivery address details
          </p>
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (fieldErrors.label) setFieldErrors((prev) => ({ ...prev, label: undefined }));
                }}
                placeholder="e.g., Home, Office, Work"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.label ? "border-red-500" : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.label && <p className="mt-1 text-sm text-red-400">{fieldErrors.label}</p>}
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (fieldErrors.phoneNumber) setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                }}
                placeholder="e.g., 08012345678"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.phoneNumber ? "border-red-500" : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.phoneNumber && <p className="mt-1 text-sm text-red-400">{fieldErrors.phoneNumber}</p>}
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (fieldErrors.street) setFieldErrors((prev) => ({ ...prev, street: undefined }));
                }}
                placeholder="e.g., 123 Main Street, Apartment 4B"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.street ? "border-red-500" : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.street && <p className="mt-1 text-sm text-red-400">{fieldErrors.street}</p>}
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (fieldErrors.city) setFieldErrors((prev) => ({ ...prev, city: undefined }));
                }}
                placeholder="e.g., Lagos"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.city ? "border-red-500" : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.city && <p className="mt-1 text-sm text-red-400">{fieldErrors.city}</p>}
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (fieldErrors.state) setFieldErrors((prev) => ({ ...prev, state: undefined }));
                }}
                placeholder="e.g., Lagos State"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.state ? "border-red-500" : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.state && <p className="mt-1 text-sm text-red-400">{fieldErrors.state}</p>}
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
                className="w-full rounded-lg border border-white/10 bg-[#0a1020] px-4 py-3 text-white focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                required
              >
                <option value="Nigeria" className="bg-[#0a1020] text-white">Nigeria</option>
                <option value="Ghana" className="bg-[#0a1020] text-white">Ghana</option>
                <option value="Kenya" className="bg-[#0a1020] text-white">Kenya</option>
                <option value="South Africa" className="bg-[#0a1020] text-white">South Africa</option>
                <option value="Other" className="bg-[#0a1020] text-white">Other</option>
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
                onChange={(e) => {
                  handleInputChange(e);
                  if (fieldErrors.postalCode) setFieldErrors((prev) => ({ ...prev, postalCode: undefined }));
                }}
                placeholder="e.g., 100234"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.postalCode ? "border-red-500" : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.postalCode && <p className="mt-1 text-sm text-red-400">{fieldErrors.postalCode}</p>}
            </div>
          </div>
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
              {submitting ? "Creating Address..." : "Create Address"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
