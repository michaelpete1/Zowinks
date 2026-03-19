import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/NewNavbar";
import InfoStrip from "../../components/InfoStrip";

const metrics = [
  { label: "Authorized supply", value: "Genuine stock" },
  { label: "Response time", value: "Within 24h" },
  { label: "Delivery scope", value: "Local and regional" },
];

const principles = [
  {
    title: "Procurement made simple",
    body: "We help businesses source the right laptops, desktops, and accessories without the usual back-and-forth.",
  },
  {
    title: "Built for real teams",
    body: "Our focus is on dependable stock, practical pricing, and support that keeps orders moving.",
  },
  {
    title: "Clear communication",
    body: "You get direct answers, structured quotes, and a process that is easy to follow from start to finish.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <section className="grid gap-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 px-6 py-10 md:px-10 md:py-14 lg:px-14 lg:py-16">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">About Zowkins</p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              A practical IT supplier for growing businesses.
            </h1>
            <p className="max-w-2xl text-lg leading-7 text-slate-600">
              Zowkins Enterprise LTD supplies laptops, desktops, networking equipment, and peripherals
              with a focus on dependable stock, responsive support, and clear procurement flows.
            </p>

            <InfoStrip
              items={metrics.map((metric) => ({
                label: metric.label,
                value: metric.value,
              }))}
            />
          </div>

          <div className="relative min-h-[320px] bg-[linear-gradient(180deg,#12386a_0%,#1d4f93_100%)]">
            <Image
              src="/desktop.jpg"
              alt="Business desktop setup"
              fill
              className="object-cover opacity-70 mix-blend-screen [mask-image:linear-gradient(180deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.7)_100%)]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,25,48,0.78)_0%,rgba(8,25,48,0.25)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-8 text-white md:p-10">
              <p className="text-xs uppercase tracking-[0.35em] text-white/75">Company focus</p>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Reliable hardware. Clear support.</h2>
              <p className="max-w-md text-sm leading-6 text-white/85">
                We keep the buying experience straightforward so teams can move from inquiry to delivery
                without unnecessary delays.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          {principles.map((item) => (
            <article key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
              <div className="mb-5 h-12 w-12 rounded-2xl bg-[linear-gradient(180deg,#1d4f93_0%,#12386a_100%)]" />
              <h3 className="font-display text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-14 rounded-[2rem] border border-slate-200 bg-white px-6 py-10 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:px-10 lg:px-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">What we do</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Support procurement from inquiry to delivery.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Whether you need a single laptop or a larger business rollout, we keep the process organized,
                practical, and easy to approve internally.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Laptops for business users",
                "Desktop systems for office teams",
                "Accessories and docking solutions",
                "Networking gear and support",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Contact us
          </Link>
          <Link href="/laptops" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900">
            Browse laptops
          </Link>
        </div>
      </main>
    </div>
  );
}


