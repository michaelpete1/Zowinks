"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, CreatePortalOrderInput, DeliveryAddress, DeliveryMethod, normalizeOrderGender, PortalUser, ProductDetails, zowkinsApi } from "../../../../lib/zowkins-api";

const MONGO_OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

function getPaymentLink(response: Record<string, unknown>) {
  const data = response.data as Record<string, unknown> | undefined;
  const candidates = [response.paymentLink, response.paymentUrl, response.authorizationUrl, response.authorization_url, response.link, response.url, data?.paymentLink, data?.paymentUrl, data?.authorizationUrl, data?.authorization_url, data?.link, data?.url];
  return candidates.find((value): value is string => typeof value === "string" && Boolean(value.trim()))?.trim() ?? "";
}

export default function CreatePortalOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [user, setUser] = useState<PortalUser | null>(null);
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [addressId, setAddressId] = useState("");
  const [methodId, setMethodId] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("portalToken");
      if (!token) return router.replace("/portal/auth/login");
      try {
        const [productResponse, methodResponse] = await Promise.all([
          fetch("/api/zowkins/v1/products").then(async (response) => {
            if (!response.ok) throw new Error("Unable to load products");
            return response.json() as Promise<ProductDetails[]>;
          }),
          zowkinsApi.listDeliveryMethods(),
        ]);
        let activeToken = token;
        let portalUser: PortalUser;
        try {
          portalUser = await zowkinsApi.getPortalMe(activeToken);
        } catch (cause) {
          if (!(cause instanceof ApiError) || cause.status !== 401) throw cause;
          const refreshed = await zowkinsApi.refreshPortalTokens();
          activeToken = refreshed.accessToken;
          localStorage.setItem("portalToken", activeToken);
          portalUser = await zowkinsApi.getPortalMe(activeToken);
        }
        localStorage.setItem("portalUser", JSON.stringify(portalUser));
        const availableMethods = methodResponse.filter((method) => method.isActive && method.visibility && MONGO_OBJECT_ID_PATTERN.test(method.id));
        const deliveryAddresses = await zowkinsApi.listDeliveryAddresses(activeToken, portalUser.id);
        setProducts(productResponse.filter((product) => product.visible && product.inStock));
        setMethods(availableMethods);
        setAddresses(deliveryAddresses);
        setUser(portalUser);
        setGender(normalizeOrderGender(portalUser.gender));
        setAddressId(deliveryAddresses[0]?.id ?? "");
        setMethodId(availableMethods[0]?.id ?? "");
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
          localStorage.removeItem("portalToken");
          localStorage.removeItem("portalUser");
          router.replace("/portal/auth/login");
          return;
        }
        setError(cause instanceof Error ? cause.message : "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router]);

  const changeQuantity = (productId: string, quantity: number) => setItems((current) => {
    if (quantity <= 0) return current.filter((item) => item.productId !== productId);
    return current.some((item) => item.productId === productId)
      ? current.map((item) => item.productId === productId ? { ...item, quantity } : item)
      : [...current, { productId, quantity }];
  });
  const subtotal = items.reduce((total, item) => total + (products.find((product) => product.id === item.productId)?.price ?? 0) * item.quantity, 0);
  const fee = methods.find((method) => method.id === methodId)?.fee ?? 0;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const address = addresses.find((item) => item.id === addressId);
    if (!items.length || !user || !address || !MONGO_OBJECT_ID_PATTERN.test(methodId)) {
      setError("Select at least one product, a delivery address, and a delivery method.");
      return;
    }
    const token = localStorage.getItem("portalToken");
    if (!token) return router.replace("/portal/auth/login");
    setSubmitting(true);
    try {
      const input: CreatePortalOrderInput = {
        customer: { firstName: user.firstName, lastName: user.lastName, gender, email: user.email, phoneNumber: user.phoneNumber },
        items,
        callbackUrl: `${window.location.origin}/portal/orders`,
        deliveryAddress: { phoneNumber: address.phoneNumber, street: address.street, city: address.city, state: address.state, country: address.country, postalCode: address.postalCode },
        deliveryMethod: methodId,
      };
      const response = await zowkinsApi.createPortalOrder(token, input);
      const paymentLink = getPaymentLink(response as Record<string, unknown>);
      if (paymentLink) window.location.assign(paymentLink);
      else router.push(response.order?.id ? `/portal/orders/${response.order.id}` : "/portal/orders");
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        localStorage.removeItem("portalToken");
        localStorage.removeItem("portalUser");
        router.replace("/portal/auth/login");
        return;
      }
      setError(cause instanceof Error ? cause.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16"><p className="text-center">Loading...</p></main>;
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <Link href="/portal/orders" className="mb-4 inline-block text-[#f3c74d] hover:underline">← Back to Orders</Link>
      <h1 className="text-3xl font-bold text-white md:text-4xl">Create New Order</h1>
      <p className="mt-2 text-slate-300">Select products and delivery options.</p>
      {error && <p className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">{error}</p>}
      <form onSubmit={submit} className="mt-8 space-y-8">
        <section className="rounded-lg border border-white/10 bg-white/5 p-6"><h2 className="mb-4 text-xl font-semibold text-white">Customer Details</h2><div className="grid gap-4 md:grid-cols-2">
          {[["First name", user?.firstName], ["Last name", user?.lastName], ["Email", user?.email], ["Phone number", user?.phoneNumber]].map(([label, value]) => <label key={label as string} className="text-sm text-slate-300">{label}<input value={value ?? ""} readOnly className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white" /></label>)}
          <label className="text-sm text-slate-300">Gender<select value={gender} onChange={(event) => setGender(event.target.value === "female" ? "female" : "male")} className="mt-2 w-full rounded-lg border border-white/10 bg-[#0a1020] px-4 py-3 text-white"><option value="male">Male</option><option value="female">Female</option></select></label>
        </div></section>
        <section className="rounded-lg border border-white/10 bg-white/5 p-6"><h2 className="mb-4 text-xl font-semibold text-white">Select Products</h2>{products.length ? <div className="grid gap-4 md:grid-cols-2">{products.map((product) => { const quantity = items.find((item) => item.productId === product.id)?.quantity ?? 0; return <div key={product.id} className="rounded-lg border border-white/10 bg-white/5 p-4"><h3 className="font-medium text-white">{product.name}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-300">{product.description}</p><div className="mt-3 flex items-center justify-between"><b className="text-[#f3c74d]">₦{product.price.toLocaleString()}</b><span className="flex items-center gap-3"><button type="button" onClick={() => changeQuantity(product.id, quantity - 1)} className="rounded border border-white/10 px-2 text-white">−</button>{quantity}<button type="button" onClick={() => changeQuantity(product.id, quantity + 1)} className="rounded border border-white/10 px-2 text-white">+</button></span></div></div>; })}</div> : <p className="text-slate-300">No available products found.</p>}</section>
        <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-lg border border-white/10 bg-white/5 p-6"><h2 className="mb-4 text-xl font-semibold text-white">Delivery Address</h2>{addresses.map((address) => <label key={address.id} className="mb-3 flex gap-3 text-slate-300"><input type="radio" checked={addressId === address.id} onChange={() => setAddressId(address.id)} /><span><b className="text-white">{address.label}</b><br />{address.street}, {address.city}, {address.state}</span></label>)}{!addresses.length && <Link href="/portal/delivery-addresses/create" className="text-[#f3c74d] hover:underline">Add a delivery address</Link>}</section><section className="rounded-lg border border-white/10 bg-white/5 p-6"><h2 className="mb-4 text-xl font-semibold text-white">Delivery Method</h2>{methods.map((method) => <label key={method.id} className="mb-3 flex gap-3 text-slate-300"><input type="radio" checked={methodId === method.id} onChange={() => setMethodId(method.id)} /><span><b className="text-white">{method.name}</b><br />{method.estimatedDeliveryTime} · ₦{method.fee.toLocaleString()}</span></label>)}</section></div>
        {!!items.length && <section className="rounded-lg border border-white/10 bg-white/5 p-6"><h2 className="mb-4 text-xl font-semibold text-white">Order Summary</h2><p className="flex justify-between text-slate-300"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></p><p className="mt-2 flex justify-between text-slate-300"><span>Delivery fee</span><span>₦{fee.toLocaleString()}</span></p><p className="mt-2 flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-white"><span>Total</span><span className="text-[#f3c74d]">₦{(subtotal + fee).toLocaleString()}</span></p></section>}
        <div className="flex justify-end gap-4"><Link href="/portal/orders" className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white">Cancel</Link><button disabled={submitting || !items.length} className="rounded-full bg-[#f3c74d] px-6 py-3 font-semibold text-[#050b16] disabled:opacity-50">{submitting ? "Creating Order..." : "Create Order"}</button></div>
      </form>
    </main>
  );
}
