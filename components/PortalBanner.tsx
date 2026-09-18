export default function PortalBanner() {
  return (
    <div className="border-b border-white/10 bg-[#07142a] text-slate-100">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8">
        <span className="rounded-md bg-[#0b2238] px-3 py-2 text-sm font-semibold text-slate-100">
          Customer portal
        </span>
        <p className="text-sm text-slate-300">
          Manage orders, delivery addresses, quotes, and account settings.
        </p>
      </div>
    </div>
  );
}
