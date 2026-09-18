"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, PortalUser } from "../../../lib/zowkins-api";

export default function PortalProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof formData>>({});
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<
    Partial<typeof passwordForm>
  >({});
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "male",
    dateOfBirth: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("portalToken");
      if (!token) {
        router.push("/portal/auth/login");
        return;
      }

      const userData = await zowkinsApi.getPortalMe(token);
      setUser(userData);

      // Populate form data
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
          : "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
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

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateProfileForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateProfileForm()) {
      setError("Please fix the errors in the profile form");
      return;
    }

    const token = localStorage.getItem("portalToken");
    if (!token || !user) return;

    try {
      const updatedUser = await zowkinsApi.updatePortalMe(token, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
      });

      setUser(updatedUser);
      setEditing(false);
      setMessage("Profile updated successfully!");

      // Update stored user data
      localStorage.setItem("portalUser", JSON.stringify(updatedUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const validatePasswordForm = () => {
    const newErrors: Partial<typeof passwordForm> = {};
    if (!passwordForm.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (
      !/[A-Za-z]/.test(passwordForm.newPassword) ||
      !/[0-9]/.test(passwordForm.newPassword)
    ) {
      newErrors.newPassword = "Password must include at least one letter and one number";
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }
    setPasswordFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFieldErrors({});

    if (!validatePasswordForm()) {
      setError("Please fix the errors in the password form");
      return;
    }

    const token = localStorage.getItem("portalToken");
    if (!token) return;

    try {
      await zowkinsApi.updatePortalPassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setMessage("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    }
  };

  const handleLogout = async () => {
    try {
      await zowkinsApi.logoutPortal();
    } catch {
      // ignore — clear session regardless
    }
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalUser");
    router.push("/portal/auth/login");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
          <Link href="/portal/auth/login" className="mt-4 inline-block text-[#f3c74d] hover:underline">
            ← Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Profile</h1>
          <p className="mt-2 text-slate-300">Manage your account information</p>
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

        {user && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Personal Information
                  </h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(false);
                          // Reset form data
                          setFormData({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            phoneNumber: user.phoneNumber,
                            gender: user.gender,
                            dateOfBirth: user.dateOfBirth
                              ? new Date(user.dateOfBirth)
                                  .toISOString()
                                  .split("T")[0]
                              : "",
                          });
                        }}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-500/45 hover:bg-red-500/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="rounded-full bg-[#f3c74d] px-4 py-2 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="mb-2 block text-sm font-medium text-white"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (fieldErrors.firstName)
                              setFieldErrors((prev) => ({
                                ...prev,
                                firstName: undefined,
                              }));
                          }}
                          className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
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
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (fieldErrors.lastName)
                              setFieldErrors((prev) => ({
                                ...prev,
                                lastName: undefined,
                              }));
                          }}
                          className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
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
                        htmlFor="phoneNumber"
                        className="mb-2 block text-sm font-medium text-white"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (fieldErrors.phoneNumber)
                            setFieldErrors((prev) => ({
                              ...prev,
                              phoneNumber: undefined,
                            }));
                        }}
                        className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
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
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
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
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-400">First Name</p>
                        <p className="font-medium text-white">
                          {user.firstName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Last Name</p>
                        <p className="font-medium text-white">
                          {user.lastName}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Email Address</p>
                      <p className="font-medium text-white">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Phone Number</p>
                      <p className="font-medium text-white">
                        {user.phoneNumber}
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-400">Gender</p>
                        <p className="font-medium text-white capitalize">
                          {user.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Date of Birth</p>
                        <p className="font-medium text-white">
                          {user.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString()
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Change */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h2 className="mb-6 text-xl font-semibold text-white">
                  Change Password
                </h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => {
                        handlePasswordInputChange(e);
                        if (passwordFieldErrors.currentPassword)
                          setPasswordFieldErrors((prev) => ({
                            ...prev,
                            currentPassword: undefined,
                          }));
                      }}
                      placeholder="Enter your current password"
                      className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                        passwordFieldErrors.currentPassword
                          ? "border-red-500"
                          : "border-white/10 focus:border-[#f3c74d]/45"
                      }`}
                    />
                    {passwordFieldErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-400">
                        {passwordFieldErrors.currentPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        handlePasswordInputChange(e);
                        if (passwordFieldErrors.newPassword)
                          setPasswordFieldErrors((prev) => ({
                            ...prev,
                            newPassword: undefined,
                          }));
                      }}
                      placeholder="Enter your new password (min. 6 characters)"
                      className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                        passwordFieldErrors.newPassword
                          ? "border-red-500"
                          : "border-white/10 focus:border-[#f3c74d]/45"
                      }`}
                    />
                    {passwordFieldErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-400">
                        {passwordFieldErrors.newPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="confirmNewPassword"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => {
                        handlePasswordInputChange(e);
                        if (passwordFieldErrors.confirmNewPassword)
                          setPasswordFieldErrors((prev) => ({
                            ...prev,
                            confirmNewPassword: undefined,
                          }));
                      }}
                      placeholder="Confirm your new password"
                      className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20 ${
                        passwordFieldErrors.confirmNewPassword
                          ? "border-red-500"
                          : "border-white/10 focus:border-[#f3c74d]/45"
                      }`}
                    />
                    {passwordFieldErrors.confirmNewPassword && (
                      <p className="mt-1 text-sm text-red-400">
                        {passwordFieldErrors.confirmNewPassword}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Account Status
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Status:</span>
                    <span
                      className={`font-medium ${
                        user.status === "active"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Email Verified:</span>
                    <span
                      className={`font-medium ${
                        user.isEmailVerified
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {user.isEmailVerified ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Referral Partner:</span>
                    <span
                      className={`font-medium ${
                        user.isReferralPartner
                          ? "text-green-400"
                          : "text-slate-400"
                      }`}
                    >
                      {user.isReferralPartner ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Member Since:</span>
                    <span className="text-white">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link
                    href="/portal/delivery-addresses"
                    className="block rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                  >
                    Manage Addresses
                  </Link>
                  <Link
                    href="/portal/orders"
                    className="block rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                  >
                    View Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-center text-sm font-semibold text-red-400 transition hover:border-red-500/45 hover:bg-red-500/20"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
  );
}
