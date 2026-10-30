export type BrandLogoAsset = {
  src: string;
  surface: "dark" | "light";
  blend?: "screen";
};

export type ProductBrand = {
  label: string;
  slug: string;
  searchTerms: string[];
  logo: BrandLogoAsset | null;
};

export const PRODUCT_BRANDS: ProductBrand[] = [
  {
    label: "HP",
    slug: "hp",
    searchTerms: ["hp", "hewlett packard"],
    logo: { src: "/hplogo.jpg", surface: "dark", blend: "screen" },
  },
  {
    label: "Dell",
    slug: "dell",
    searchTerms: ["dell"],
    logo: { src: "/delllogo.jpg", surface: "dark", blend: "screen" },
  },
  {
    label: "Lenovo",
    slug: "lenovo",
    searchTerms: ["lenovo"],
    logo: { src: "/lenovologo.jpg", surface: "dark", blend: "screen" },
  },
  {
    label: "ASUS",
    slug: "asus",
    searchTerms: ["asus"],
    logo: { src: "/asuslogo.jpg", surface: "dark", blend: "screen" },
  },
  {
    label: "Canon",
    slug: "canon",
    searchTerms: ["canon"],
    logo: { src: "/canonlogo.jpg", surface: "light" },
  },
  {
    label: "Microsoft",
    slug: "microsoft",
    searchTerms: ["microsoft", "surface"],
    logo: { src: "/microsoft%20logo.jpg", surface: "dark", blend: "screen" },
  },
  {
    label: "Apple",
    slug: "apple",
    searchTerms: ["apple", "macbook", "iphone", "ipad"],
    logo: null,
  },
  {
    label: "Logitech",
    slug: "logitech",
    searchTerms: ["logitech"],
    logo: null,
  },
  {
    label: "Premax",
    slug: "premax",
    searchTerms: ["premax"],
    logo: { src: "/premaxlogo.png", surface: "dark", blend: "screen" },
  },
];
