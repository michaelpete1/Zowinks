"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCart, type CartItemInput } from "../hooks/useCart";

interface AddToCartButtonProps {
  item: CartItemInput;
  className?: string;
  children: ReactNode;
}

export default function AddToCartButton({ item, className, children }: AddToCartButtonProps) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(item);
        router.push("/cart");
      }}
    >
      {children}
    </button>
  );
}
