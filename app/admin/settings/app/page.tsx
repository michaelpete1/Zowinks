"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AdminBadge, AdminShell } from "../../../../components/AdminShell";
import { useAdminSession } from "../../../../hooks/useAdminSession";
import { App, ApiError, zowkinsApi } from "../../../../lib/zowkins-api";
import { defaultAppSettings } from "../../../../lib/app-settings";
import { resolveImageSource } from "../../../../lib/media";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = {
  accessToken: string;
};

function normalizeToken(value: string) {
  return value.trim().replace(/^Bearer\s+/i, "");
}

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
]);

export default function AdminAppSettingsPage() {
  const { session } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    accessToken: "",
  });
  const [appSettings, setAppSettings] = useState<App | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [selectedHeroFiles, setSelectedHeroFiles] = useState<File[]>([]);
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

        const appData = (response as any).app || response;
        const nextApp = appData ?? defaultAppSettings;
        setAppSettings(nextApp);
        setConnectionMessage("App settings loaded from the backend.");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setAppSettings(null);
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

  const currentHeroImages = [
    ...(Array.isArray(currentApp.images) ? currentApp.images : []),
  ].filter(Boolean);

  const handleHeroSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(Boolean);
    if (!files.length) return;

    const nextFiles = files.slice(0, 3);

    if (nextFiles.some((file) => !ALLOWED_IMAGE_MIME_TYPES.has(file.type))) {
      setError(
        "Invalid file type. Please upload a PNG, JPEG, WebP, SVG, or PDF.",
      );
      return;
    }

    setSelectedHeroFiles(nextFiles);
  };

  const moveSelectedHeroFile = (index: number, direction: -1 | 1) => {
    setSelectedHeroFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const removeSelectedHeroFile = (index: number) => {
    setSelectedHeroFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const clearHeroSelection = () => {
    setSelectedHeroFiles([]);
  };

  const uploadSelectedHeroImages = async () => {
    if (!selectedHeroFiles.length) {
      setError("Select at least one image before uploading.");
      return;
    }

    if (!apiReady) {
      setError("Connect an admin token before uploading images.");
      return;
    }

    setUploadingHero(true);
    setError("");
    setMessage("");

    try {
      await zowkinsApi.uploadHeroImage(
        apiConnection.accessToken.trim(),
        selectedHeroFiles,
      );

      const refreshed = await zowkinsApi.getApp();
      const refreshedApp = (refreshed as any).app || refreshed;
      setAppSettings(refreshedApp);
      setSelectedHeroFiles([]);
      setMessage(
        selectedHeroFiles.length > 1
          ? `${selectedHeroFiles.length} hero images uploaded successfully.`
          : "Hero image uploaded successfully.",
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not upload hero image.",
      );
    } finally {
      setUploadingHero(false);
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
              Use this page to manage the live app name, brand assets, contact
              information, and portal status.
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
                Hero carousel management
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
                  <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
                    <h4 className="font-display text-xl font-bold text-slate-900">
                      Hero carousel management
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      Upload up to 3 images for your homepage carousel.
                    </p>

                    <div className="mt-6 rounded-[1.4rem] border border-dashed border-slate-300 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Upload hero images
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Pick up to 3 images, reorder them, then upload the
                            whole set to the homepage carousel.
                          </p>
                        </div>
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#0a2a78] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#08215f]">
                          <span>{uploadingHero ? "Uploading..." : "Choose images"}</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleHeroSelection}
                            disabled={uploadingHero || !canUpdate}
                          />
                        </label>
                      </div>

                      {selectedHeroFiles.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                              Selected images
                            </p>
                            <button
                              type="button"
                              onClick={clearHeroSelection}
                              className="text-xs font-semibold text-[#0a2a78] hover:underline"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="grid gap-2">
                            {selectedHeroFiles.map((file, index) => (
                              <div
                                key={`${file.name}-${file.size}-${index}`}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {file.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {Math.round(file.size / 1024)} KB
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveSelectedHeroFile(index, -1)}
                                    disabled={index === 0}
                                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    Up
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveSelectedHeroFile(index, 1)}
                                    disabled={index === selectedHeroFiles.length - 1}
                                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    Down
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeSelectedHeroFile(index)}
                                    className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void uploadSelectedHeroImages()}
                          disabled={uploadingHero || !canUpdate || selectedHeroFiles.length === 0}
                          className="rounded-lg bg-[#0a2a78] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#08215f] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Save carousel
                        </button>
                        <p className="text-xs text-slate-500">
                          Current order maps to Slide 1, Slide 2, and Slide 3.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                      {[0, 1, 2].map((index) => {
                        const imgSource = currentHeroImages[index] || null;
                        const resolvedImg = resolveImageSource(imgSource, "");

                        return (
                          <div key={index} className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Slide {index + 1}
                            </p>

                            {resolvedImg ? (
                              <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <Image
                                  src={resolvedImg}
                                  alt={`Hero ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/50 text-[10px] text-slate-400">
                                No custom image
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <p className="mt-4 text-[11px] leading-relaxed text-slate-500 italic">
                      Uploading a set replaces the carousel order on the
                      homepage.
                    </p>
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
                    {currentApp.status?.portal || "online"}
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
                    {currentApp.branding?.logo ? "Configured" : "Missing"}
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
                <p>Homepage hero images and carousel slides.</p>
                <p>Portal status badge and application description.</p>
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
