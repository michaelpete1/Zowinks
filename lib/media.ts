import { ZOWKINS_API_BASE, ApiImage } from "./zowkins-api";

const API_ORIGIN = (() => {
  try {
    return new URL(ZOWKINS_API_BASE, "http://localhost").origin;
  } catch {
    return "https://zowkins-api.onrender.com";
  }
})();
const IMAGE_ORIGIN = "https://pub-8c6bb3ce4d88417e9f57a8967cf9363d.r2.dev";

function extractMediaValue(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    const keys = [
      "url",
      "src",
      "path",
      "imageUrl",
      "imagePath",
      "location",
      "Location",
      "publicUrl",
      "publicURL",
      "downloadUrl",
      "downloadURL",
      "fileUrl",
      "fileURL",
      "secureUrl",
      "secureURL",
      "key",
      "value",
    ];

    for (const key of keys) {
      const entry = candidate[key];
      if (typeof entry === "string" && entry.trim()) {
        return entry;
      }
    }

    for (const entry of Object.values(candidate)) {
      const extracted = extractMediaValue(entry);
      if (
        extracted &&
        (/^(https?:)?\/\//i.test(extracted) ||
          extracted.startsWith("/") ||
          extracted.startsWith("data:") ||
          extracted.startsWith("blob:") ||
          extracted.includes("/"))
      ) {
        return extracted;
      }
    }
  }

  return "";
}

export function resolveApiMediaUrl(value?: unknown): string {
  const raw = extractMediaValue(value);
  if (!raw) return "";

  if (raw.startsWith("/api/image")) {
    try {
      const url = new URL(raw, "http://localhost");
      const src = url.searchParams.get("src");
      return src ? decodeURIComponent(src) : "";
    } catch {
      return "";
    }
  }

  if (raw.startsWith("/")) {
    const pathSegments = raw.split("/").filter(Boolean);
    if (pathSegments.length === 1) {
      return raw;
    }
  }

  if (raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }

  if (/^(https?:)?\/\//i.test(raw)) {
    return raw;
  }

  return raw.startsWith("/") ? `${IMAGE_ORIGIN}${raw}` : `${IMAGE_ORIGIN}/${raw}`;
}

export function resolveImageSource(image?: string | ApiImage | Record<string, unknown> | null, fallback = "/file.svg"): string {
  const raw = resolveApiMediaUrl(image);
  return resolveApiMediaUrl(raw) || fallback;
}
