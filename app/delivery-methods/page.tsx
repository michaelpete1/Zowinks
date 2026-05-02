import type { Metadata } from "next";
import Navbar from "../../components/NewNavbar";
import { zowkinsApi } from "../../lib/zowkins-api";

export const metadata: Metadata = {
  title: "Delivery Methods",
  description:
    "Browse available delivery methods and estimated shipping times.",
};

export const dynamic = "force-dynamic";

function money(value: number) {
  return value.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default async function DeliveryMethodsPage() {
  let methods: Awaited<ReturnType<typeof zowkinsApi.listDeliveryMethods>> = [];
  try {
    methods = await zowkinsApi.listDeliveryMethods();
  } catch (error) {
    console.error("Error loading delivery methods:", error);
    // Return empty array to allow build to succeed
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">
            Delivery methods
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white md:text-5xl">
            Choose a shipping option
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Available delivery methods from the API, including fees and delivery
            estimates.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {methods.map((method) => (
            <article
              key={method.id}
              className="rounded-[1.75rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-white">
                    {method.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {method.estimatedDeliveryTime}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${method.visibility ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-300"}`}
                >
                  {method.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Fee</span>
                  <span className="font-semibold text-white">
                    {money(method.fee)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Visible</span>
                  <span className="font-semibold text-white">
                    {method.visibility ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
