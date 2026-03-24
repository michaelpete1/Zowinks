import type { ReactNode } from "react";

type InfoItem = {
  label: string;
  value: ReactNode;
};

type InfoStripProps = {
  items: InfoItem[];
  className?: string;
  variant?: "light" | "dark";
};

export default function InfoStrip({ items, className = "", variant = "light" }: InfoStripProps) {
  const isDark = variant === "dark";
  return (
    <div
      className={`rounded-[1.25rem] border px-5 py-4 ${
        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
      } ${className}`}
    >
      <div className={`grid gap-4 md:grid-cols-3 ${isDark ? "md:divide-white/10" : "md:divide-slate-200"} md:divide-x`}>
        {items.map((item, index) => (
          <div key={item.label} className={index > 0 ? "md:pl-4" : ""}>
            <p className={`text-[11px] uppercase tracking-[0.28em] ${isDark ? "text-white/55" : "text-slate-500"}`}>{item.label}</p>
            <p className={`mt-2 text-sm font-medium md:text-base ${isDark ? "text-white" : "text-slate-800"}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
