"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminBadge, AdminShell } from "../../../../components/AdminShell";
import FallbackImage from "../../../../components/FallbackImage";
import { useAdminSession } from "../../../../hooks/useAdminSession";
import { App, ApiError, zowkinsApi } from "../../../../lib/zowkins-api";
import { defaultAppSettings } from "../../../../lib/app-settings";
import { DEFAULT_HERO_IMAGES } from "../../../../lib/hero-images";
import { resolveImageSource } from "../../../../lib/media";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

type ApiConnection = {
  accessToken: string;
};

function normalizeToken(value: string) {
  return value.trim().replace(/^Bearer\s+/i, "");
}

type HeroSlotSelection = {
  file: File | null;
  previewUrl: string | null;
};

const HERO_SLOT_COUNT = 3;

function createEmptyHeroSlots(): HeroSlotSelection[] {
  return Array.from({ length: HERO_SLOT_COUNT }, () => ({
    file: null,
    previewUrl: null,
  }));
}

function renameFile(file: File, fileName: string) {
  const extension = file.type.includes("png")
    ? "png"
    : file.type.includes("webp")
      ? "webp"
      : file.type.includes("svg")
        ? "svg"
        : "jpg";

  return new File([file], `${fileName}.${extension}`, {
    type: file.type || "image/jpeg",
  });
}

async function imageUrlToFile(imageUrl: string, fileName: string) {
  const proxyUrl =
    /^https?:\/\//i.test(imageUrl) || imageUrl.startsWith("//")
      ? `/api/image?src=${encodeURIComponent(imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl)}`
      : imageUrl;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Could not load ${fileName}.`);
  }

  const blob = await response.blob();
  const mimeType = blob.type || "image/jpeg";
  const extension = mimeType.includes("png")
    ? "png"
    : mimeType.includes("webp")
      ? "webp"
      : mimeType.includes("svg")
        ? "svg"
        : "jpg";

  return new File([blob], `${fileName}.${extension}`, { type: mimeType });
}

function extractHeroSlideUrls(
  app: {
    images?: unknown;
    heroImages?: unknown;
  } | null | undefined,
) {
  const source = Array.isArray(app?.heroImages)
    ? app?.heroImages
    : Array.isArray(app?.images)
      ? app?.images
      : [];

  return source
    .map((image) => resolveImageSource(image, ""))
    .filter((image): image is string => Boolean(image));
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
  const [heroSlots, setHeroSlots] = useState<HeroSlotSelection[]>(createEmptyHeroSlots());
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

  const backendHeroImages = extractHeroSlideUrls(currentApp).slice(0, HERO_SLOT_COUNT);
  const currentHeroImages = Array.from({ length: HERO_SLOT_COUNT }, (_, index) => {
    return (
      backendHeroImages[index] ||
      DEFAULT_HERO_IMAGES[index] ||
      DEFAULT_HERO_IMAGES[0]
    );
  });

  useEffect(() => {
    return () => {
      heroSlots.forEach((slot) => {
        if (slot.previewUrl) {
          URL.revokeObjectURL(slot.previewUrl);
        }
      });
    };
  }, [heroSlots]);

  const setHeroSlotFile = (slotIndex: number, file: File | null) => {
    if (file && !ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      setError("Invalid file type. Please upload a PNG, JPEG, WebP, SVG, or PDF.");
      return;
    }

    const previousPreviewUrl = heroSlots[slotIndex]?.previewUrl ?? null;
    const nextPreviewUrl = file ? URL.createObjectURL(file) : null;

    setHeroSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        file,
        previewUrl: nextPreviewUrl,
      };
      return next;
    });

    if (previousPreviewUrl) {
      URL.revokeObjectURL(previousPreviewUrl);
    }
  };

  const clearHeroSlot = (slotIndex: number) => {
    const previousPreviewUrl = heroSlots[slotIndex]?.previewUrl ?? null;
    setHeroSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        file: null,
        previewUrl: null,
      };
      return next;
    });

    if (previousPreviewUrl) {
      URL.revokeObjectURL(previousPreviewUrl);
    }
  };

  const uploadSelectedHeroImages = async () => {
    if (!apiReady) {
      setError("Connect an admin token before uploading images.");
      return;
    }

    setUploadingHero(true);
    setError("");
    setMessage("");

    try {
      const token = apiConnection.accessToken.trim();
      const files = await Promise.all(
        Array.from({ length: HERO_SLOT_COUNT }, async (_, index) => {
          const slot = heroSlots[index];
          if (slot?.file) {
            return renameFile(slot.file, `hero-slide-${index + 1}`);
          }

          const source =
            currentHeroImages[index] ||
            DEFAULT_HERO_IMAGES[index] ||
            DEFAULT_HERO_IMAGES[0];

          const sourceUrl = resolveImageSource(source, "");
          if (!sourceUrl) {
            throw new Error(`Slide ${index + 1} is missing an image.`);
          }

          return imageUrlToFile(sourceUrl, `hero-slide-${index + 1}`);
        }),
      );

      const hasSelectedFile = heroSlots.some((slot) => Boolean(slot.file));
      if (!hasSelectedFile) {
        setError("Choose at least one slide image before saving.");
        return;
      }

      const uploadResponse = await zowkinsApi.uploadHeroImage(token, files);
      const updatedApp = (uploadResponse as { app?: App }).app ?? null;
      if (updatedApp) {
        setAppSettings(updatedApp);
      }
      setHeroSlots(createEmptyHeroSlots());
      setMessage("Hero carousel updated successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not upload hero image.",
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
                      Upload each slide individually, then save the carousel to
                      update the homepage order.
                    </p>

                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                      {[0, 1, 2].map((index) => {
                        const slot = heroSlots[index];
                        const previewSource =
                          slot.previewUrl ||
                          resolveImageSource(currentHeroImages[index], "");

                        return (
                          <div
                            key={index}
                            className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(15,23,42,0.08)]"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0a2a78]">
                                  Slide {index + 1}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  This maps to `app.images[{index}]`
                                </p>
                              </div>
                              {slot.file ? (
                                <button
                                  type="button"
                                  onClick={() => clearHeroSlot(index)}
                                  className="text-[11px] font-semibold text-[#0a2a78] hover:underline"
                                  disabled={uploadingHero || !canUpdate}
                                >
                                  Clear
                                </button>
                              ) : null}
                            </div>

                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-950">
                              <FallbackImage
                                src={previewSource}
                                alt={`Hero ${index + 1}`}
                                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                loading="lazy"
                                fetchPriority="low"
                              />
                              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,28,0.08)_0%,rgba(8,15,28,0.46)_100%)]" />
                              <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                                {slot.file ? "New upload" : "Current image"}
                              </div>
                              <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/12 bg-black/50 px-3 py-2 text-[11px] text-white/90 backdrop-blur-sm">
                                {slot.file ? slot.file.name : "Ready to replace this slot"}
                              </div>
                            </div>

                            <label
                              className={`mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                                uploadingHero || !canUpdate
                                  ? "cursor-not-allowed bg-slate-400"
                                  : "bg-[#0a2a78] hover:bg-[#08215f]"
                              }`}
                            >
                              <span>
                                {slot.file ? "Replace slide image" : "Upload slide image"}
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(event) => {
                                  const file = event.target.files?.[0] ?? null;
                                  if (file) {
                                    setHeroSlotFile(index, file);
                                  }
                                  event.target.value = "";
                                }}
                                disabled={uploadingHero || !canUpdate}
                              />
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => void uploadSelectedHeroImages()}
                        disabled={uploadingHero || !canUpdate}
                        className="inline-flex items-center justify-center rounded-xl bg-[#0a2a78] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#08215f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploadingHero ? "Saving carousel..." : "Save carousel"}
                      </button>
                      <p className="max-w-2xl text-xs leading-5 text-slate-500">
                        Saving sends the 3 files in order and updates the backend
                        `app.images` array for Slide 1, Slide 2, and Slide 3.
                      </p>
                    </div>
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
                Hero payload
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                Backend `app.images`
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This is the exact array the backend returned for the hero
                section.
              </p>
              <div className="mt-4 space-y-3">
                {extractHeroSlideUrls(currentApp).length > 0 ? (
                  extractHeroSlideUrls(currentApp).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Slide {index + 1}
                      </p>
                      <p className="mt-1 break-all text-xs font-semibold text-slate-900">
                        {image}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    No hero images returned yet.
                  </div>
                )}
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
