"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** Number of rotating lines — default 8 */
  count?: number;
  /** Base rotation speed multiplier — default 1 */
  speed?: number;
  /** Line color — default gold */
  color?: string;
  /** Opacity of lines — default 0.15 */
  opacity?: number;
  /** className applied to the canvas wrapper */
  className?: string;
}

export default function RotaryLinesBackground({
  count = 8,
  speed = 1,
  color = "#f3c74d",
  opacity = 0.15,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      W = canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      H = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    };

    const draw = (timestamp: number) => {
      const elapsed = (timestamp - startTimeRef.current) * 0.001 * speed;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const maxRadius = Math.sqrt(cx * cx + cy * cy);

      for (let i = 0; i < count; i++) {
        const angleOffset = (i / count) * Math.PI * 2;
        const rotationSpeed = 0.3 + (i % 3) * 0.15;
        const radius = (0.15 + (i % 4) * 0.12) * maxRadius;
        const lineLength = 0.4 + (i % 3) * 0.2;
        const lineWidth = 1 + (i % 2) * 1.5;

        const angle = elapsed * rotationSpeed + angleOffset;
        const x1 = cx + Math.cos(angle) * radius * (1 - lineLength);
        const y1 = cy + Math.sin(angle) * radius * (1 - lineLength);
        const x2 = cx + Math.cos(angle) * radius * (1 + lineLength);
        const y2 = cy + Math.sin(angle) * radius * (1 + lineLength);

        // Draw outer glow
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${opacity * 0.3})`;
        ctx.lineWidth = lineWidth + 4;
        ctx.lineCap = "round";
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.stroke();

        // Draw main line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${opacity})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.shadowBlur = 0;
        ctx.stroke();

        // Draw orbit circle (optional subtle ring)
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${opacity * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Central subtle pulse
      const pulse = (Math.sin(elapsed * 1.5) + 1) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 20 + pulse * 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(color)}, ${opacity * 0.1 * pulse})`;
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };

    const hexToRgb = (hex: string): string => {
      const clean = hex.replace("#", "");
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    resize();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [count, speed, color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}