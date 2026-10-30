"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface Props {
  count?: number;
  linkDistance?: number;
  className?: string;
}

export default function AnimatedBackground({
  count = 55,
  linkDistance = 140,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

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

    const spawn = (): Particle => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.4 + 0.6,
      opacity: Math.random() * 0.45 + 0.2,
    });

    const init = () => {
      resize();
      particlesRef.current = Array.from({ length: count }, spawn);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const particles = particlesRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243,199,77,${p.opacity * 0.75})`;
        ctx.fill();
      }

      // Particle-to-particle lines
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * 0.16;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(243,199,77,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Mouse proximity lines
        const mx = mouse.current.x;
        const my = mouse.current.y;
        const dx = a.x - mx;
        const dy = a.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseRange = linkDistance * 1.7;
        if (dist < mouseRange) {
          const alpha = (1 - dist / mouseRange) * 0.32;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);

    init();
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [count, linkDistance]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
