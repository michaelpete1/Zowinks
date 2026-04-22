'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const hiddenPaths = ["/admin", "/signin"];

export default function Footer() {
  const pathname = usePathname();

  if (hiddenPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <footer className="border-t border-[#d4a11d]/25 bg-[radial-gradient(circle_at_top,rgba(212,161,29,0.18),transparent_28%),linear-gradient(180deg,#09162c_0%,#050b16_100%)] text-slate-200">
      <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(212,161,29,0.72),rgba(90,178,20,0.65),transparent)]" />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png"
              alt="Zowkins"
              width={240}
              height={240}
              className="h-20 w-20 rounded-full object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.4)]"
              priority
            />
          </div>

          <nav className="flex flex-wrap items-center gap-5 text-sm text-slate-300 md:justify-center">
            <Link href="/" className="transition-colors hover:text-[#f3c74d]">Home</Link>
            <Link href="/products" className="transition-colors hover:text-[#5ab214]">Products</Link>
            <Link href="/desktops" className="transition-colors hover:text-[#f3c74d]">Desktops</Link>
            <Link href="/accessories" className="transition-colors hover:text-[#5ab214]">Accessories</Link>
            <Link href="/about" className="transition-colors hover:text-[#f3c74d]">About</Link>
            <Link href="/contact" className="transition-colors hover:text-[#5ab214]">Request a Quote</Link>
          </nav>

          <div className="flex flex-col items-start gap-2 text-xs text-slate-400 md:items-end">
            <Link href="/signin" className="transition-colors hover:text-[#f3c74d]">Admin Sign In</Link>
            <Link href="/privacy" className="transition-colors hover:text-[#f3c74d]">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-[#5ab214]">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
