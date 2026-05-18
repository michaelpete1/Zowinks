const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  accessory: "Accessories",
  accessories: "Accessories",
  category: "Category",
  categories: "Categories",
  desktop: "Desktops",
  desktops: "Desktops",
  dedktops: "Desktops",
  gaming: "Gaming",
  laptop: "Laptops",
  laptops: "Laptops",
  speaker: "Speakers",
  speakers: "Speakers",
};

const WORD_OVERRIDES: Record<string, string> = {
  ai: "AI",
  hp: "HP",
  jbl: "JBL",
  ram: "RAM",
  ssd: "SSD",
  hdd: "HDD",
  cpu: "CPU",
  gpu: "GPU",
  pc: "PC",
  ui: "UI",
  usb: "USB",
  mac: "Mac",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleCaseWord = (word: string) => {
  const normalized = word.trim();
  if (!normalized) return normalized;

  const override = WORD_OVERRIDES[slugify(normalized)];
  if (override) return override;

  if (/^[A-Z0-9]{2,5}$/.test(normalized)) return normalized;

  const lower = normalized.toLowerCase();
  if (lower.length <= 3) {
    return normalized.length <= 2 ? normalized.toUpperCase() : normalized;
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const formatDisplayName = (value: string, fallback = "") => {
  const cleaned = value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;

  const override = DISPLAY_NAME_OVERRIDES[slugify(cleaned)];
  if (override) return override;

  return cleaned
    .split(" ")
    .map((word) => titleCaseWord(word))
    .join(" ");
};

export const compactProductTitle = (value: string, maxWords = 6) => {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;

  const primary = cleaned
    .split(/\s+\|\s+|\s+•\s+|,\s+|\s+\(/g)[0]
    .trim()
    .replace(/[)]+$/g, "")
    .trim();

  const words = primary.split(" ");
  if (words.length > 0) {
    const firstWordOverride = DISPLAY_NAME_OVERRIDES[slugify(words[0])];
    if (firstWordOverride) {
      words[0] = firstWordOverride;
    }
  }

  const compact = words.slice(0, maxWords).join(" ").trim();
  if (words.length <= maxWords) {
    return compact;
  }

  return `${compact}…`;
};
