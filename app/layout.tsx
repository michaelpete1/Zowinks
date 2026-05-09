import type { Metadata } from "next";
import Footer from "../components/Footer";
import "./globals.css";

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
      <body className="antialiased bg-[linear-gradient(180deg,#050b16_0%,#07142a_45%,#0b1d3b_100%)] text-slate-100">
        {children}
        <Footer />
      </body>
    </html>
  );
}
