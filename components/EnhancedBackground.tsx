"use client";

import React from "react";
import AnimatedBackground from "./AnimatedBackground";
import RotaryLinesBackground from "./RotaryLinesBackground";

interface Props {
  /** particle count */
  particles?: number;
  /** line count */
  lines?: number;
}

export default function EnhancedBackground({
  particles = 48,
  lines = 10,
}: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* subtle vignette + gradient handled by page background; layer canvases */}
      <div className="absolute inset-0 mix-blend-screen opacity-60">
        <AnimatedBackground
          count={particles}
          linkDistance={120}
          className="opacity-85"
        />
      </div>

      <div className="absolute inset-0">
        <RotaryLinesBackground count={lines} speed={0.55} opacity={0.09} />
      </div>

      {/* soft animated overlay to add depth */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.02),transparent_20%),radial-gradient(ellipse_at_bottom_right,rgba(243,199,77,0.02),transparent_22%)]"
      />
    </div>
  );
}
