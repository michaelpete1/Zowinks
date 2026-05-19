"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, PortalAuthResponse } from "../../../../lib/zowkins-api";
import PortalNavbar from "../../../../components/PortalNavbar";

export default function PortalSignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    dateOfBirth: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof formData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("portalToken");
    if (token) {
      router.push("/portal");
    }
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user types
    if (fieldErrors[name as keyof typeof formData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the errors below");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response: PortalAuthResponse = await zowkinsApi.createPortalAccount(
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          password: formData.password,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth || undefined,
        },
      );

      // Store token and user info
      localStorage.setItem("portalToken", response.accessToken);
      localStorage.setItem("portalUser", JSON.stringify(response.user));

      setMessage("Account created successfully! Redirecting...");

      // Redirect to portal dashboard
      setTimeout(() => {
        router.push("/portal");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Account creation failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <PortalNavbar />

      <main className="mx-auto max-w-2xl px-4 py-12 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="mt-2 text-slate-300">
              Join the Zowkins portal community
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                    fieldErrors.firstName
                      ? "border-red-500"
                      : "border-white/10 focus:border-[#f3c74d]/45"
                  }`}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-sm text-red-400">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                    fieldErrors.lastName
                      ? "border-red-500"
                      : "border-white/10 focus:border-[#f3c74d]/45"
                  }`}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-sm text-red-400">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.email
                    ? "border-red-500"
                    : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-sm font-medium text-white"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.phoneNumber
                    ? "border-red-500"
                    : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-400">
                  {fieldErrors.phoneNumber}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-[#0a1020] px-4 py-3 text-white focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                  required
                >
                  <option value="male" className="bg-[#0a1020] text-white">
                    Male
                  </option>
                  <option value="female" className="bg-[#0a1020] text-white">
                    Female
                  </option>
                  <option value="other" className="bg-[#0a1020] text-white">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-white"
              >
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password (min. 6 characters)"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.password
                    ? "border-red-500"
                    : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-white"
              >
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repeat your password"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                  fieldErrors.confirmPassword
                    ? "border-red-500"
                    : "border-white/10 focus:border-[#f3c74d]/45"
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-300">
              Already have an account?{" "}
              <Link
                href="/portal/auth/login"
                className="text-[#f3c74d] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
