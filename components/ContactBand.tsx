"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const hiddenPaths = ["/admin"];

const officeMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=No%207%20Maputo%20Street%2C%20Wuse%20Zone%203%2C%20Abuja%2C%20FCT";

const contacts = [
  {
    label: "Phone",
    value: "+971 54 389 5126",
    href: "tel:+971543895126",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.3a2 2 0 0 1-.5 2.1L9 10a16 16 0 0 0 5 5l.9-1.1a2 2 0 0 1 2.1-.5c.7.3 1.5.5 2.3.6a2 2 0 0 1 1.7 2z" />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "contact@zowkins.com",
    href: "mailto:contact@zowkins.com",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
        <path d="M22 7l-10 7L2 7" />
      </svg>
    ),
  },
  {
    label: "Address",
    value: "No 7 Maputo Street, Wuse Zone 3, Abuja, FCT",
    href: officeMapsUrl,
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 21s6-4.8 6-10a6 6 0 10-12 0c0 5.2 6 10 6 10z" />
        <circle cx="12" cy="11" r="2.2" />
      </svg>
    ),
  },
];

export default function ContactBand() {
  const pathname = usePathname();

  if (hiddenPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <section className="border-t border-[#d4a11d]/20 bg-[linear-gradient(180deg,#0b1d3b_0%,#12386a_100%)] text-white">
      <div className="mx-auto max-w-6xl px-3 py-10 sm:px-4 md:px-8 md:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Contact Us
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
              Reach us directly
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {contacts.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.label === "Phone" ? undefined : "_blank"}
              rel={item.label === "Phone" ? undefined : "noopener noreferrer"}
              className="flex items-start gap-3 rounded-[1.35rem] bg-white/6 p-4 transition hover:bg-white/10 sm:p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-white">
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-white/70 sm:text-[11px] sm:tracking-[0.28em]">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm font-semibold leading-6 text-white">
                  {item.value}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
