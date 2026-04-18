import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import Carousel from "./Carousel";
import { fetchAllProducts } from "../lib/catalog";

export default async function FeaturedProductsSection() {
  const allProducts = await fetchAllProducts();
  const featured = allProducts.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
          New products
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
          Fresh picks for modern teams
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
          Explore the latest products from our catalog.
        </p>
      </div>

      {featured.length > 0 ? (
        <>
          <div className="mx-auto mt-8 md:hidden">
            <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(11,29,59,0.98),rgba(7,12,24,0.96)_55%,rgba(5,11,22,0.98)_100%)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-5">
              <Carousel
                title="New Products"
                titleClassName="text-white"
                slides={featured.map((item) => ({
                  img: item.image || "/desktop.jpg",
                  title: item.title,
                  href: item.href,
                }))}
              />
            </div>
          </div>

          <div className="mx-auto mt-8 hidden gap-6 md:grid sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a1020] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.34)]"
            >
              <div className="relative h-52 overflow-hidden bg-[#0b1220]">
                <img
                  src={item.image || "/desktop.jpg"}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-3 p-5 text-center">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f3c74d]">
                    {item.category}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-bold text-white">
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">{item.price}</span>
                  <AddToCartButton
                    item={{
                      id: item.id,
                      slug: item.slug,
                      title: item.title,
                      price: item.price,
                      spec: item.category,
                      image: item.image,
                    }}
                    className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
                  >
                    Order Now
                  </AddToCartButton>
                </div>
              </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-[#0a1020] p-8 text-center text-sm text-slate-300">
          No products available yet. Products will appear here when added through the admin.
        </div>
      )}
    </section>
  );
}
