"use client";

import { create } from "zustand";

export type CatalogProduct = {
  id: string;
  brand: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  visibility: "Visible" | "Hidden";
  image?: string;
  featured?: boolean;
};

const initialProducts: CatalogProduct[] = [
  { id: "PRD-1042", brand: "HP", name: "EliteBook 840 G11", category: "Laptops", price: "₦1,249", stock: 14, visibility: "Visible", image: "/hp.jpg", featured: true },
  { id: "PRD-1041", brand: "Dell", name: "Latitude 7650", category: "Laptops", price: "₦1,398", stock: 9, visibility: "Visible", image: "/dell.jpg", featured: true },
  { id: "PRD-1040", brand: "Lenovo", name: "ThinkPad T14", category: "Laptops", price: "₦1,098", stock: 7, visibility: "Visible", image: "/desktop 2.jpg", featured: false },
  { id: "PRD-1039A", brand: "Asus", name: "ExpertBook B5", category: "Laptops", price: "₦1,179", stock: 11, visibility: "Visible", image: "/asus.jpg", featured: false },
  { id: "PRD-1039", brand: "HP", name: "ProDesk 400 G9", category: "Desktops", price: "₦899", stock: 10, visibility: "Visible", image: "/d.jpg", featured: false },
  { id: "PRD-1038", brand: "Lenovo", name: "ThinkCentre M70s", category: "Desktops", price: "₦949", stock: 8, visibility: "Visible", image: "/lenovo.jpg", featured: false },
  { id: "PRD-1037", brand: "Zowkins", name: "USB-C Dock Pro", category: "Accessories", price: "₦249", stock: 22, visibility: "Hidden", image: "/keyboard.jpg", featured: false },
  { id: "PRD-1036", brand: "Canon", name: "PIXMA G3430", category: "Accessories", price: "₦189", stock: 16, visibility: "Visible", image: "/canonlogo.jpg", featured: false },
];

interface CatalogState {
  products: CatalogProduct[];
  setProducts: (
    products: CatalogProduct[] | ((current: CatalogProduct[]) => CatalogProduct[]),
  ) => void;
  toggleFeatured: (id: string) => void;
}

export const useCatalog = create<CatalogState>()((set) => ({
  products: initialProducts,
  setProducts: (products) =>
    set((state) => ({
      products: typeof products === "function" ? products(state.products) : products,
    })),
  toggleFeatured: (id) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, featured: !product.featured } : product,
      ),
    })),
}));

export const defaultCatalogProducts = initialProducts;
