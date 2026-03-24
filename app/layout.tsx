import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Footer from "../components/Footer";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://zowkins.com"),
  title: {
    default: "Zowkins Enterprise",
    template: "%s | Zowkins Enterprise",
  },
  description:
    "Business laptops, desktops, accessories, and IT procurement solutions for modern teams.",
  openGraph: {
    title: "Zowkins Enterprise",
    description:
      "Business laptops, desktops, accessories, and IT procurement solutions for modern teams.",
    url: "/",
    siteName: "Zowkins Enterprise",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zowkins Enterprise",
    description:
      "Business laptops, desktops, accessories, and IT procurement solutions for modern teams.",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} antialiased font-manrope bg-[linear-gradient(180deg,#050b16_0%,#07142a_45%,#0b1d3b_100%)] text-slate-100`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
