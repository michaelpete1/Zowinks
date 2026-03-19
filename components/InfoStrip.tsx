import type { ReactNode } from "react";

type InfoItem = {
  label: string;
  value: ReactNode;
};

type InfoStripProps = {
  items: InfoItem[];
  className?: string;
};

export default function InfoStrip({ items, className = "" }: InfoStripProps) {
  return (
    <div className={`rounded-[1.25rem] border border-slate-200 bg-slate-50 px-5 py-4 ${className}`}>
      <div className="grid gap-4 md:grid-cols-3 md:divide-x md:divide-slate-200">
        {items.map((item, index) => (
          <div key={item.label} className={index > 0 ? "md:pl-4" : ""}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-slate-800 md:text-base">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
