"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminBadge, AdminShell } from "../../../../components/AdminShell";
import { useAdminSession } from "../../../../hooks/useAdminSession";
import {
  App,
  AppInput,
  AppUpdate,
  AppContactUpdate,
  ApiError,
  zowkinsApi,
} from "../../../../lib/zowkins-api";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = {
  accessToken: string;
};

type AppForm = AppInput & {
  id?: string;
};

const emptyForm = (): AppForm => ({
  name: "",
  address: "",
  phoneNumber: "",
  whatsAppNumber: "",
  email: "",
  status: {
    portal: "online",
  },
  description: "",
  ratings: 5,
  images: [],
  branding: {
    logo: "",
    logoLight: "",
    logomark: "",
    logomarkLight: "",
  },
});

export default function AdminAppSettingsPage() {
  const { session } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    accessToken: "",
  });
  const [appSettings, setAppSettings] = useState<App | null>(null);
  const [form, setForm] = useState<AppForm>(emptyForm());
  const [contactForm, setContactForm] = useState<AppContactUpdate>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "contact" | "branding"
  >("general");

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => setToastMessage(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(ADMIN_API_TOKEN_KEY);
    if (savedToken) {
      setApiConnection({ accessToken: savedToken });
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready && apiConnection.accessToken) {
      fetchAppSettings();
    }
  }, [ready, apiConnection.accessToken]);

  const fetchAppSettings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await zowkinsApi.getApp();
      setAppSettings(response.app);
      setForm({
        ...response.app,
        id: response.app.name, // Use name as ID for editing
      });
      setContactForm({
        address: response.app.address,
        phoneNumber: response.app.phoneNumber,
        whatsAppNumber: response.app.whatsAppNumber,
        email: response.app.email,
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to fetch app settings",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await zowkinsApi.createApp(
        apiConnection.accessToken.trim(),
        form,
      );
      setAppSettings(response.app);
      setMessage("App settings created successfully!");
      setForm({
        ...response.app,
        id: response.app.name,
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create app settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateApp = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updateData: AppUpdate = {
        name: form.name,
        address: form.address,
        phoneNumber: form.phoneNumber,
        whatsAppNumber: form.whatsAppNumber,
        email: form.email,
        status: form.status,
        description: form.description,
        ratings: form.ratings,
        images: form.images,
        branding: form.branding,
      };

      const response = await zowkinsApi.updateApp(
        apiConnection.accessToken.trim(),
        updateData,
      );
      setAppSettings(response.app);
      setMessage("App settings updated successfully!");
      setToastMessage("Settings saved successfully!");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update app settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateContact = async (e: FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    setError("");
    setMessage("");

    try {
      const response = await zowkinsApi.updateAppContact(
        apiConnection.accessToken.trim(),
        contactForm,
      );
      setAppSettings(response.app);
      setMessage("Contact information updated successfully!");
      setToastMessage("Contact info updated!");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to update contact information",
      );
    } finally {
      setSavingContact(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContactInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandingInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        [name]: value,
      },
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = e.target;
    const images = value.split("\n").filter((img) => img.trim());
    setForm((prev) => ({ ...prev, images }));
  };

  return (
    <AdminShell
      title="Application Settings"
      subtitle="Manage your application configuration and branding"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>{/* Title and subtitle moved to AdminShell props */}</div>
          <Link
            href="/admin"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
          >
            ← Back to Admin
          </Link>
        </div>

        {toastMessage && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-green-400">{toastMessage}</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <p className="text-blue-400">{message}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading settings...</p>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5">
            {/* Tab Navigation */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeTab === "general"
                    ? "border-b-2 border-[#f3c74d] text-[#f3c74d]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                General Settings
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeTab === "contact"
                    ? "border-b-2 border-[#f3c74d] text-[#f3c74d]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Contact Information
              </button>
              <button
                onClick={() => setActiveTab("branding")}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeTab === "branding"
                    ? "border-b-2 border-[#f3c74d] text-[#f3c74d]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Branding
              </button>
            </div>

            <div className="p-6">
              {/* General Settings Tab */}
              {activeTab === "general" && (
                <form
                  onSubmit={appSettings ? handleUpdateApp : handleCreateApp}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        App Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        placeholder="Enter app name"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="contact@example.com"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+2348000000000"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        name="whatsAppNumber"
                        value={form.whatsAppNumber}
                        onChange={handleInputChange}
                        placeholder="+2348000000000"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      placeholder="123 Health Way, Lagos, Nigeria"
                      rows={3}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      placeholder="Premium pharmaceutical delivery service."
                      rows={4}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                      required
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Portal Status
                      </label>
                      <select
                        name="status.portal"
                        value={form.status.portal}
                        onChange={handleInputChange}
                        title="Portal status"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Ratings
                      </label>
                      <input
                        type="number"
                        name="ratings"
                        value={form.ratings}
                        onChange={handleInputChange}
                        min="1"
                        max="5"
                        step="0.1"
                        title="Rating value between 1 and 5"
                        placeholder="Enter rating (1-5)"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      App Images (one per line)
                    </label>
                    <textarea
                      value={form.images.join("\n")}
                      onChange={handleImageChange}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      rows={4}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving
                        ? "Saving..."
                        : appSettings
                          ? "Update Settings"
                          : "Create Settings"}
                    </button>
                  </div>
                </form>
              )}

              {/* Contact Information Tab */}
              {activeTab === "contact" && (
                <form onSubmit={handleUpdateContact} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={contactForm.email || ""}
                        onChange={handleContactInputChange}
                        placeholder="contact@example.com"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={contactForm.phoneNumber || ""}
                        onChange={handleContactInputChange}
                        placeholder="+2348000000000"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        name="whatsAppNumber"
                        value={contactForm.whatsAppNumber || ""}
                        onChange={handleContactInputChange}
                        placeholder="+2348000000000"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={contactForm.address || ""}
                      onChange={handleContactInputChange}
                      placeholder="123 Health Way, Lagos, Nigeria"
                      rows={3}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingContact}
                      className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingContact ? "Updating..." : "Update Contact Info"}
                    </button>
                  </div>
                </form>
              )}

              {/* Branding Tab */}
              {activeTab === "branding" && (
                <form
                  onSubmit={appSettings ? handleUpdateApp : handleCreateApp}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        name="logo"
                        value={form.branding.logo}
                        onChange={handleBrandingInputChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Light Logo URL
                      </label>
                      <input
                        type="url"
                        name="logoLight"
                        value={form.branding.logoLight}
                        onChange={handleBrandingInputChange}
                        placeholder="https://example.com/logo-light.png"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Logomark URL
                      </label>
                      <input
                        type="url"
                        name="logomark"
                        value={form.branding.logomark}
                        onChange={handleBrandingInputChange}
                        placeholder="https://example.com/logomark.png"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white">
                        Light Logomark URL
                      </label>
                      <input
                        type="url"
                        name="logomarkLight"
                        value={form.branding.logomarkLight}
                        onChange={handleBrandingInputChange}
                        placeholder="https://example.com/logomark-light.png"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#f3c74d]/45 focus:outline-none focus:ring-2 focus:ring-[#f3c74d]/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Update Branding"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Current Settings Display */}
        {appSettings && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Current Settings
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">App Name</p>
                <p className="font-medium text-white">{appSettings.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="font-medium text-white">{appSettings.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                <p className="font-medium text-white">
                  {appSettings.phoneNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">WhatsApp</p>
                <p className="font-medium text-white">
                  {appSettings.whatsAppNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Portal Status</p>
                <AdminBadge
                  status={
                    appSettings.status.portal === "online"
                      ? "active"
                      : "inactive"
                  }
                  label={appSettings.status.portal}
                />
              </div>
              <div>
                <p className="text-sm text-slate-400">Ratings</p>
                <p className="font-medium text-white">
                  {appSettings.ratings} ⭐
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
