"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AdminBadge, AdminShell } from "../../../../components/AdminShell";
import { useAdminSession } from "../../../../hooks/useAdminSession";
import {
  App,
  AppContactUpdate,
  AppInput,
  AppUpdate,
  ApiError,
  zowkinsApi,
} from "../../../../lib/zowkins-api";
import { defaultAppSettings } from "../../../../lib/app-settings";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = {
  accessToken: string;
};

const emptyAppForm = (): AppInput => ({
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
  images: [...defaultAppSettings.images],
  branding: {
    logo: "",
    logoLight: "",
    logomark: "",
    logomarkLight: "",
  },
});

const emptyContactForm: AppContactUpdate = {
  address: "",
  phoneNumber: "",
  whatsAppNumber: "",
  email: "",
};

function normalizeToken(value: string) {
  return value.trim().replace(/^Bearer\s+/i, "");
}

function toAppForm(app: App): AppInput {
  return {
    name: app.name ?? "",
    address: app.address ?? "",
    phoneNumber: app.phoneNumber ?? "",
    whatsAppNumber: app.whatsAppNumber ?? "",
    email: app.email ?? "",
    status: {
      portal: app.status?.portal ?? "online",
    },
    description: app.description ?? "",
    ratings: Number(app.ratings ?? 5),
    images:
      Array.isArray(app.images) && app.images.length > 0
        ? app.images
        : [...defaultAppSettings.images],
    branding: {
      logo: app.branding?.logo ?? "",
      logoLight: app.branding?.logoLight ?? "",
      logomark: app.branding?.logomark ?? "",
      logomarkLight: app.branding?.logomarkLight ?? "",
    },
  };
}

function toContactForm(app: App): AppContactUpdate {
  return {
    address: app.address ?? "",
    phoneNumber: app.phoneNumber ?? "",
    whatsAppNumber: app.whatsAppNumber ?? "",
    email: app.email ?? "",
  };
}

function fieldClassName(hasError?: boolean) {
  return [
    "w-full rounded-2xl border bg-slate-50 px-4 py-3",
    "text-slate-900 outline-none transition placeholder:text-slate-400",
    "focus:bg-white focus:ring-2 focus:ring-[#0a2a78]/10",
    hasError
      ? "border-rose-500 focus:border-rose-600"
      : "border-slate-200 focus:border-[#0a2a78]",
  ].join(" ");
}

export default function AdminAppSettingsPage() {
  const { session } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    accessToken: "",
  });
  const [appSettings, setAppSettings] = useState<App | null>(null);
  const [form, setForm] = useState<AppInput>(emptyAppForm());
  const [contactForm, setContactForm] =
    useState<AppContactUpdate>(emptyContactForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AppInput, string>>
  >({});
  const [contactFieldErrors, setContactFieldErrors] = useState<
    Partial<Record<keyof AppContactUpdate, string>>
  >({});
  const [connectionMessage, setConnectionMessage] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const currentApp = appSettings ?? defaultAppSettings;
  const apiReady = Boolean(apiConnection.accessToken.trim());
  const canUpdate = Boolean(apiReady);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(ADMIN_API_TOKEN_KEY);
    const sessionToken = normalizeToken(session?.accessToken ?? "");
    const nextToken = sessionToken || normalizeToken(savedToken ?? "");

    if (sessionToken && sessionToken !== savedToken) {
      window.localStorage.setItem(ADMIN_API_TOKEN_KEY, sessionToken);
    }

    setApiConnection({ accessToken: nextToken });
    setReady(true);
  }, [session?.accessToken]);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    setLoading(true);
    setError("");
    setConnectionMessage("");

    zowkinsApi
      .getApp()
      .then((response) => {
        if (cancelled) return;

        const nextApp = response.app ?? defaultAppSettings;
        setAppSettings(nextApp);
        setForm(toAppForm(nextApp));
        setContactForm(toContactForm(nextApp));
        setConnectionMessage("App settings loaded from the backend.");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setAppSettings(null);
        setForm(toAppForm(defaultAppSettings));
        setContactForm(toContactForm(defaultAppSettings));
        setConnectionMessage(
          err instanceof ApiError
            ? "Could not reach the backend. Showing default app settings."
            : "Could not load app settings. Showing default app settings.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    if (name === "portal") {
      setForm((current) => ({
        ...current,
        status: {
          ...current.status,
          portal: value,
        },
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: name === "ratings" ? Number(value) : value,
    }));
  };

  const handleContactInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setContactForm((current) => ({ ...current, [name]: value }));
  };

  const handleBrandingInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      branding: {
        ...current.branding,
        [name]: value,
      },
    }));
  };

  const validateAppForm = () => {
    const newErrors: Partial<Record<keyof AppInput, string>> = {};
    if (!form.name.trim()) newErrors.name = "App name is required";
    if (!form.description.trim())
      newErrors.description = "App description is required";

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContactForm = () => {
    const newErrors: Partial<Record<keyof AppContactUpdate, string>> = {};
    if (!contactForm.email.trim()) {
      newErrors.email = "Support email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!contactForm.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!contactForm.address.trim())
      newErrors.address = "Business address is required";

    setContactFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrUpdateApp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    if (!apiReady) {
      setError("Connect an admin token before saving settings.");
      return;
    }

    if (!validateAppForm()) {
      setError("Please fix the errors in the app settings form.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload: AppUpdate = {
      name: form.name,
      address: form.address,
      phoneNumber: form.phoneNumber,
      whatsAppNumber: form.whatsAppNumber,
      email: form.email,
      status: form.status,
      description: form.description,
      ratings: Number(form.ratings),
      branding: form.branding,
    };

    try {
      const response = appSettings
        ? await zowkinsApi.updateApp(apiConnection.accessToken.trim(), payload)
        : await zowkinsApi.createApp(apiConnection.accessToken.trim(), {
            ...payload,
            images: [...defaultAppSettings.images],
          } as AppInput);

      const nextApp = response.app ?? currentApp;
      setAppSettings(nextApp);
      setForm(toAppForm(nextApp));
      setContactForm(toContactForm(nextApp));
      setMessage(
        appSettings
          ? "Application settings updated successfully."
          : "Application settings created successfully.",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not save application settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactFieldErrors({});

    if (!apiReady) {
      setError("Connect an admin token before updating contact information.");
      return;
    }

    if (!validateContactForm()) {
      setError("Please fix the errors in the contact form.");
      return;
    }

    setSavingContact(true);
    setError("");
    setMessage("");

    try {
      const response = await zowkinsApi.updateAppContact(
        apiConnection.accessToken.trim(),
        contactForm,
      );

      const nextApp = response.app ?? currentApp;
      setAppSettings(nextApp);
      setForm(toAppForm(nextApp));
      setContactForm(toContactForm(nextApp));
      setMessage("Contact information updated successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update contact information.",
      );
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <AdminShell
      title="Application Settings"
      subtitle="Manage branding, contact details, and portal status."
    >
      <div className="space-y-6 text-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Application settings
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Keep the site identity and contact details in one place
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The homepage hero stays hardcoded for now. Use this page to manage
              the live app name, brand assets, contact information, and portal
              status.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Back to Admin
          </Link>
        </div>

        {connectionMessage ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            {connectionMessage}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Backend controls
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                General, contact, and brand settings
              </h3>
            </div>

            <div className="p-5 sm:p-6 md:p-8">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-slate-500">
                  Loading settings...
                </div>
              ) : null}

              {!loading ? (
                <div className="space-y-8">
                  <form
                    onSubmit={handleCreateOrUpdateApp}
                    className="space-y-6"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2 text-sm font-medium text-slate-700">
                        <span>App Name</span>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (fieldErrors.name)
                              setFieldErrors((prev) => ({
                                ...prev,
                                name: undefined,
                              }));
                          }}
                          placeholder="Zowkins Enterprise"
                          className={fieldClassName(Boolean(fieldErrors.name))}
                        />
                        {fieldErrors.name && (
                          <p className="px-1 text-xs font-medium text-rose-600">
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        <span>Ratings</span>
                        <input
                          type="number"
                          name="ratings"
                          value={form.ratings}
                          onChange={handleInputChange}
                          min="1"
                          max="5"
                          step="0.1"
                          className={fieldClassName()}
                          required
                        />
                      </label>
                    </div>

                    <div className="grid gap-2 text-sm font-medium text-slate-700">
                      <span>Description</span>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (fieldErrors.description)
                            setFieldErrors((prev) => ({
                              ...prev,
                              description: undefined,
                            }));
                        }}
                        rows={4}
                        placeholder="Business laptops, desktops, accessories, and IT procurement solutions for modern teams."
                        className={fieldClassName(
                          Boolean(fieldErrors.description),
                        )}
                      />
                      {fieldErrors.description && (
                        <p className="px-1 text-xs font-medium text-rose-600">
                          {fieldErrors.description}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        <span>Portal Status</span>
                        <select
                          name="portal"
                          value={form.status.portal}
                          onChange={handleInputChange}
                          className={fieldClassName()}
                        >
                          <option value="online">Online</option>
                          <option value="offline">Offline</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        <span>What this affects</span>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                          Homepage intro, portal badge, and app identity across
                          the site.
                        </div>
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        <span>Logo URL</span>
                        <input
                          type="url"
                          name="logo"
                          value={form.branding.logo}
                          onChange={handleBrandingInputChange}
                          placeholder="https://example.com/logo.png"
                          className={fieldClassName()}
                          required
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        <span>Light Logo URL</span>
                        <input
                          type="url"
                          name="logoLight"
                          value={form.branding.logoLight}
                          onChange={handleBrandingInputChange}
                          placeholder="https://example.com/logo-light.png"
                          className={fieldClassName()}
                          required
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        <span>Logomark URL</span>
                        <input
                          type="url"
                          name="logomark"
                          value={form.branding.logomark}
                          onChange={handleBrandingInputChange}
                          placeholder="https://example.com/logomark.png"
                          className={fieldClassName()}
                          required
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        <span>Light Logomark URL</span>
                        <input
                          type="url"
                          name="logomarkLight"
                          value={form.branding.logomarkLight}
                          onChange={handleBrandingInputChange}
                          placeholder="https://example.com/logomark-light.png"
                          className={fieldClassName()}
                          required
                        />
                      </label>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        disabled={saving || !canUpdate}
                        className="rounded-full bg-[#0a2a78] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving
                          ? "Saving..."
                          : appSettings
                            ? "Update Settings"
                            : "Create Settings"}
                      </button>
                      <span className="text-sm text-slate-500">
                        General and branding changes are saved to the backend
                        app object.
                      </span>
                    </div>
                  </form>

                  <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
                    <h4 className="font-display text-xl font-bold text-slate-900">
                      Contact information
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      Updated separately through the contact endpoint.
                    </p>

                    <form
                      onSubmit={handleContactSubmit}
                      className="mt-5 space-y-6"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2 text-sm font-medium text-slate-700">
                          <span>Email</span>
                          <input
                            type="email"
                            name="email"
                            value={contactForm.email ?? ""}
                            onChange={(e) => {
                              handleContactInputChange(e);
                              if (contactFieldErrors.email)
                                setContactFieldErrors((prev) => ({
                                  ...prev,
                                  email: undefined,
                                }));
                            }}
                            placeholder="contact@zowkins.com"
                            className={fieldClassName(
                              Boolean(contactFieldErrors.email),
                            )}
                          />
                          {contactFieldErrors.email && (
                            <p className="px-1 text-xs font-medium text-rose-600">
                              {contactFieldErrors.email}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2 text-sm font-medium text-slate-700">
                          <span>Phone Number</span>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={contactForm.phoneNumber ?? ""}
                            onChange={(e) => {
                              handleContactInputChange(e);
                              if (contactFieldErrors.phoneNumber)
                                setContactFieldErrors((prev) => ({
                                  ...prev,
                                  phoneNumber: undefined,
                                }));
                            }}
                            placeholder="+971 54 389 5126"
                            className={fieldClassName(
                              Boolean(contactFieldErrors.phoneNumber),
                            )}
                          />
                          {contactFieldErrors.phoneNumber && (
                            <p className="px-1 text-xs font-medium text-rose-600">
                              {contactFieldErrors.phoneNumber}
                            </p>
                          )}
                        </div>

                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          <span>WhatsApp Number</span>
                          <input
                            type="tel"
                            name="whatsAppNumber"
                            value={contactForm.whatsAppNumber ?? ""}
                            onChange={handleContactInputChange}
                            placeholder="+971 54 389 5126"
                            className={fieldClassName()}
                            required
                          />
                        </label>
                      </div>

                      <div className="grid gap-2 text-sm font-medium text-slate-700">
                        <span>Address</span>
                        <textarea
                          name="address"
                          value={contactForm.address ?? ""}
                          onChange={(e) => {
                            handleContactInputChange(e);
                            if (contactFieldErrors.address)
                              setContactFieldErrors((prev) => ({
                                ...prev,
                                address: undefined,
                              }));
                          }}
                          rows={3}
                          placeholder="Wuse Zone 3, No 7 Maputo Street, Abuja, FCT, Nigeria"
                          className={fieldClassName(
                            Boolean(contactFieldErrors.address),
                          )}
                        />
                        {contactFieldErrors.address && (
                          <p className="px-1 text-xs font-medium text-rose-600">
                            {contactFieldErrors.address}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={savingContact || !canUpdate}
                        className="rounded-full bg-[#0a2a78] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingContact ? "Updating..." : "Update Contact Info"}
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Current settings
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                Live backend snapshot
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    App name
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {currentApp.name}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Portal
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {currentApp.status.portal}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Ratings
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {currentApp.ratings}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Logo
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {currentApp.branding.logo ? "Configured" : "Missing"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Notes
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                What this page controls
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>Brand logos and logomarks for the site chrome.</p>
                <p>Contact details for footer, about, and support links.</p>
                <p>Portal status badge and application description.</p>
                <p>Homepage hero remains hardcoded for now.</p>
              </div>
              <div className="mt-4">
                <AdminBadge
                  label={apiReady ? "Connected" : "Disconnected"}
                  status={apiReady ? "active" : "inactive"}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
