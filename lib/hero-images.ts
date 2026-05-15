export const HERO_IMAGE_STORAGE_KEY = "zowkins-hero-images";

export const DEFAULT_HERO_IMAGES = [
  "/heroimage1.jpg",
  "/heroimage2.jpg",
  "/desktop.jpg",
];

export function normalizeHeroImages(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return Array.from(
    new Set(
      input
        .map((image) => (typeof image === "string" ? image.trim() : ""))
        .filter(Boolean),
    ),
  );
}

export function loadHeroImages(fallback = DEFAULT_HERO_IMAGES): string[] {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(HERO_IMAGE_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as unknown;
    const images = normalizeHeroImages(parsed);
    return images.length > 0 ? images : fallback;
  } catch {
    return fallback;
  }
}

export function saveHeroImages(images: unknown): string[] {
  const normalized = normalizeHeroImages(images);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      HERO_IMAGE_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  }

  return normalized;
}
