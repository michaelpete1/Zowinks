"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050b16] text-white p-4">
      <div className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-8 text-center shadow-2xl max-w-md">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-slate-400 mb-6">
          We encountered an error while loading this category. This usually happens if the backend API is temporarily slow or down.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
          >
            Try again
          </button>
          <Link
            href="/categories"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
