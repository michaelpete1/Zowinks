"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useCart, type CartItemInput } from "../hooks/useCart";

interface AddToCartButtonProps {
  item: CartItemInput;
  className?: string;
  children: ReactNode;
}

export default function AddToCartButton({ item, className, children }: AddToCartButtonProps) {
  const addItem = useCart((state) => state.addItem);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [added]);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(item);
        setAdded(true);
      }}
    >
      {added ? "Added" : children}
    </button>
  );
}
