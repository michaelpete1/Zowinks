'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const hiddenPaths = ["/admin", "/signin", "/signup"];

export default function Footer() {
  const pathname = usePathname();

  if (hiddenPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-[linear-gradient(180deg,#071529_0%,#0b1d3b_100%)] text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/zowinks-removebg-preview.png"
              alt="Zowkins"
              width={180}
              height={120}
              className="h-16 w-auto drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
              priority
            />
          </div>

          <nav className="flex flex-wrap items-center gap-5 text-sm md:justify-center">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <Link href="/laptops" className="transition-colors hover:text-white">Laptops</Link>
            <Link href="/desktops" className="transition-colors hover:text-white">Desktops</Link>
            <Link href="/accessories" className="transition-colors hover:text-white">Accessories</Link>
            <Link href="/about" className="transition-colors hover:text-white">About</Link>
            <Link href="/contact" className="transition-colors hover:text-white">Contact</Link>
            <Link href="/cart" className="transition-colors hover:text-white">Cart</Link>
          </nav>

          <div className="flex flex-col items-start gap-2 text-xs md:items-end">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}