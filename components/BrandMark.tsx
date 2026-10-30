"use client";

import Image from "next/image";
import { useState } from "react";
import type { BrandLogoAsset } from "../lib/brands";

type BrandMarkProps = {
  label: string;
  logo: BrandLogoAsset | null;
  compact?: boolean;
};

function getInitials(label: string): string {
  const words = label.trim().split(/[\s-]+/).filter(Boolean);
  if (words.length > 1) {
    return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  }

  return (words[0] || "?").slice(0, 2).toUpperCase();
}

export default function BrandMark({ label, logo, compact = false }: BrandMarkProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(logo && !imageFailed);

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden px-2 ${
        compact ? "h-7 w-10 rounded-md" : "h-10 w-[5.5rem] rounded-md"
      } ${logo?.surface === "light" ? "bg-white" : "bg-[#111b2a]"}`}
    >
      {showImage && logo ? (
        <Image
          src={logo.src}
          alt=""
          width={160}
          height={64}
          sizes="88px"
          className={`h-full ${compact ? "max-h-5" : "max-h-8"} w-full object-contain ${
            logo.blend === "screen" ? "mix-blend-screen" : ""
          }`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          className={`font-display font-bold tracking-[0.08em] text-[#f3c74d] ${
            compact ? "text-xs" : "text-lg"
          }`}
        >
          {getInitials(label)}
        </span>
      )}
    </span>
  );
}
