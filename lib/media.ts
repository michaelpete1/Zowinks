import { ZOWKINS_API_BASE, ApiImage } from "./zowkins-api";

const API_ORIGIN = new URL(ZOWKINS_API_BASE).origin;
const IMAGE_PROXY_ROUTE = "/api/image";

export function resolveApiMediaUrl(value?: string | null): string {
  if (!value) return "";

  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_ORIGIN}${value}`;
  }

  return `${API_ORIGIN}/${value}`;
}

export function resolveImageSource(image?: string | ApiImage | null, fallback = "/file.svg"): string {
  const raw = typeof image === "string" ? image : image?.url;
  const url = resolveApiMediaUrl(raw) || fallback;
  if (!image) {
    console.warn('No image data for product/category');
  } else if (raw && !raw.startsWith('http') && !raw.startsWith('data:')) {
    console.warn('Image URL may be relative - resolving:', url);
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return `${IMAGE_PROXY_ROUTE}?src=${encodeURIComponent(url)}`;
  }

  return url;
}
