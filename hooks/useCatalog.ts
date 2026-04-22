"use client";

import { create } from "zustand";

export type CatalogProduct = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  visibility: "Visible" | "Hidden";
  image?: string;
  featured?: boolean;
};

// DEPRECATED: Use dynamic API fetches from lib/catalog.ts instead
// Static mocks removed - product images now from Zowkins API /products

export const useCatalog = () => {
  throw new Error('useCatalog deprecated. Use zowkinsApi from lib/zowkins-api.ts and fetchAllProducts/searchCatalog from lib/catalog.ts');
};

// No CatalogProduct type here - defined in lib/catalog.ts
// useCatalog deprecated: use lib/catalog.ts + zowkinsApi instead
