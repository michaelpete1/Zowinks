"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug?: string;
  title: string;
  price: number;
  spec?: string;
  qty: number;
}

export interface CartItemInput {
  id: string;
  slug?: string;
  title: string;
  price: string;
  spec?: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItemInput) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => string;
}

const parsePrice = (price: string) =>
  Number(price.replace(/[^0-9.]/g, "")) || 0;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (!item.id) return state;

          const cartItem: CartItem = {
            ...item,
            price: parsePrice(item.price),
            qty: 1,
          };

          const existing = state.items.find((i) => i.id === cartItem.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === cartItem.id ? { ...i, qty: i.qty + 1 } : i,
              ),
            };
          }

          return { items: [...state.items, cartItem] };
        }),
      updateQty: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const { items } = get();
        const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
        return total.toLocaleString("en-NG", {
          style: "currency",
          currency: "NGN",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      },
    }),
    {
      name: "zowkins-cart-v3",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
