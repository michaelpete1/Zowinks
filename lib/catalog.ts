export type CatalogItem = {
  id: string;
  title: string;
  category: "Laptop" | "Desktop" | "Accessory";
  brand: string;
  price: string;
  href: string;
  image: string;
  description: string;
};

export const catalog: CatalogItem[] = [
  {
    id: "hp-probook-450",
    title: "HP ProBook 450",
    category: "Laptop",
    brand: "HP",
    price: "$849",
    href: "/laptops/hp",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=900&auto=format&fit=crop",
    description: "Business laptop for secure office and remote work.",
  },
  {
    id: "hp-elitebook-840",
    title: "HP EliteBook 840",
    category: "Laptop",
    brand: "HP",
    price: "$1,199",
    href: "/laptops/hp",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=900&auto=format&fit=crop",
    description: "Premium enterprise notebook with strong mobility.",
  },
  {
    id: "dell-latitude-5440",
    title: "Dell Latitude 5440",
    category: "Laptop",
    brand: "Dell",
    price: "$929",
    href: "/laptops/dell",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=900&auto=format&fit=crop",
    description: "Reliable Dell workstation for daily productivity.",
  },
  {
    id: "lenovo-thinkpad-t14",
    title: "Lenovo ThinkPad T14",
    category: "Laptop",
    brand: "Lenovo",
    price: "$999",
    href: "/laptops/lenovo",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=900&auto=format&fit=crop",
    description: "Durable ThinkPad built for hybrid teams.",
  },
  {
    id: "hp-prodesk-400",
    title: "HP ProDesk 400",
    category: "Desktop",
    brand: "HP",
    price: "$699",
    href: "/desktops/hp",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=900&auto=format&fit=crop",
    description: "Compact desktop for office deployments.",
  },
  {
    id: "dell-optiplex-7010",
    title: "Dell OptiPlex 7010",
    category: "Desktop",
    brand: "Dell",
    price: "$749",
    href: "/desktops/hp",
    image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=900&auto=format&fit=crop",
    description: "Stable desktop platform for scaling teams.",
  },
  {
    id: "usb-c-dock",
    title: "USB-C Dock",
    category: "Accessory",
    brand: "Zowkins",
    price: "$229",
    href: "/accessories",
    image: "https://images.unsplash.com/photo-1588580000645-4562a6d2c839?q=80&w=900&auto=format&fit=crop",
    description: "One-cable expansion for monitor and peripherals.",
  },
  {
    id: "wireless-headset",
    title: "Wireless Headset",
    category: "Accessory",
    brand: "Zowkins",
    price: "$179",
    href: "/accessories",
    image: "https://images.unsplash.com/photo-1518441902117-f0a5a1f0f9b4?q=80&w=900&auto=format&fit=crop",
    description: "Clear audio for meetings and support teams.",
  },
];

export function searchCatalog(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return [];

  return catalog.filter((item) => {
    const haystack = [
      item.title,
      item.brand,
      item.category,
      item.description,
      item.price,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
