"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminBadge, AdminShell } from "../../../components/AdminShell";
import { NIGERIA_36_STATES, STATE_TO_CITIES } from "../../../lib/location-data";
import { useAdminSession } from "../../../hooks/useAdminSession";
import {
  AdminOrder,
  AdminOrderProductUpdateItem,
  AdminOrderStatus,
  AdminPaymentStatus,
  ApiError,
  DeliveryMethod,
  ProductDetails,
  zowkinsApi,
} from "../../../lib/zowkins-api";

const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";
const ORDERS_PAGE_SIZE = 10;
const ORDER_PAGE_SIZE_OPTIONS = [10, 25, 50];

type ApiConnection = { accessToken: string };

type OrderItemForm = { productId: string; quantity: string };

type CreateOrderForm = {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryAddressPhoneNumber: string;
  deliveryAddressCity: string;
  deliveryAddressState: string;
  deliveryAddressCountry: string;
  deliveryAddressPostalCode: string;
  deliveryMethod: string;
  items: OrderItemForm[];
};

const emptyCreateForm = (): CreateOrderForm => ({
  customerFirstName: "",
  customerLastName: "",
  customerEmail: "",
  customerPhone: "",
  deliveryAddress: "",
  deliveryAddressPhoneNumber: "",
  deliveryAddressCity: "",
  deliveryAddressState: "",
  deliveryAddressCountry: "",
  deliveryAddressPostalCode: "",
  deliveryMethod: "",
  items: [{ productId: "", quantity: "1" }],
});

const orderStatusOptions: AdminOrderStatus[] = ["processing", "in-transit", "cancelled", "delivered"];
const paymentStatusOptions: AdminPaymentStatus[] = ["pending", "paid", "failed", "abandoned", "reversed"];

const titleCase = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "Unknown";
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
};

const extractArray = <T,>(response: unknown, keys: string[]): T[] => {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object") {
    for (const key of keys) {
      if (Array.isArray((response as Record<string, unknown>)[key])) {
        return (response as Record<string, unknown>)[key] as T[];
      }
    }
    if (Array.isArray((response as { data?: unknown }).data)) {
      return (response as { data: T[] }).data;
    }
  }
  return [];
};

const normalizeOrderStatus = (value: string): AdminOrderStatus =>
  orderStatusOptions.includes(value as AdminOrderStatus) ? (value as AdminOrderStatus) : "processing";

const normalizePaymentStatus = (value: string): AdminPaymentStatus =>
  paymentStatusOptions.includes(value as AdminPaymentStatus) ? (value as AdminPaymentStatus) : "pending";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

function getOrderTitle(order: AdminOrder) {
  const firstName = typeof order.customer === "object" ? order.customer.firstName : "";
  const lastName = typeof order.customer === "object" ? order.customer.lastName : "";
  const email = typeof order.customer === "object" ? order.customer.email : "";
  const customerName = `${firstName} ${lastName}`.trim();
  return customerName || email || order.orderNumber;
}

function getOrderAddress(order: AdminOrder) {
  if (typeof order.deliveryAddress === "string") return order.deliveryAddress;
  if (order.deliveryAddress == null || typeof order.deliveryAddress !== "object") return "Address not available";
  return [order.deliveryAddress.street, order.deliveryAddress.city, order.deliveryAddress.state].filter(Boolean).join(", ");
}

function getOrderMethod(order: AdminOrder) {
  if (typeof order.deliveryMethod === "string") return order.deliveryMethod;
  if (order.deliveryMethod == null || typeof order.deliveryMethod !== "object" || typeof order.deliveryMethod.name !== "string") return "Unknown delivery method";
  return order.deliveryMethod.name;
}

export default function OrdersPage() {
  const { session, clearSession } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({ accessToken: "" });
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [stats, setStats] = useState({ totalOrders: 0, processing: 0, delivered: 0, cancelled: 0, inTransit: 0, totalRevenue: 0 });
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [createForm, setCreateForm] = useState<CreateOrderForm>(emptyCreateForm());
  const [updateForm, setUpdateForm] = useState<{ orderStatus: AdminOrderStatus; paymentStatus: AdminPaymentStatus }>({ orderStatus: "processing", paymentStatus: "pending" });
  const [updateItems, setUpdateItems] = useState<OrderItemForm[]>([{ productId: "", quantity: "1" }]);
  const [query, setQuery] = useState("");
  const [filterOrderStatus, setFilterOrderStatus] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [pageSize, setPageSize] = useState(ORDERS_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkCallbackUrl, setLinkCallbackUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "create" | "detail">("dashboard");

  useEffect(() => {
    if (!session?.accessToken || typeof window === "undefined") return;
    const nextToken = session.accessToken.trim();
    const storedToken = window.localStorage.getItem(ADMIN_API_TOKEN_KEY) ?? "";
    setApiConnection({ accessToken: nextToken });
    if (nextToken && nextToken !== storedToken) window.localStorage.setItem(ADMIN_API_TOKEN_KEY, nextToken);
    setReady(true);
  }, [session?.accessToken]);

  const apiReady = Boolean(apiConnection.accessToken.trim());

  const loadOrders = async (overridePage?: number) => {
    if (!apiReady) return;
    const activePage = overridePage ?? page;
    setLoading(true);
    setError("");
    try {
      const [ordersResponse, nextPageResponse, statsResponse, productsResponse, methodsResponse] = await Promise.all([
        zowkinsApi.listAdminOrders(apiConnection.accessToken.trim(), { orderStatus: filterOrderStatus || undefined, paymentStatus: filterPaymentStatus || undefined, sortBy: `createdAt:${sortOrder}`, limit: pageSize, page: activePage }),
        zowkinsApi.listAdminOrders(apiConnection.accessToken.trim(), { orderStatus: filterOrderStatus || undefined, paymentStatus: filterPaymentStatus || undefined, sortBy: `createdAt:${sortOrder}`, limit: 1, page: activePage + 1 }),
        zowkinsApi.getAdminOrderStats(apiConnection.accessToken.trim()),
        zowkinsApi.listAdminProducts(apiConnection.accessToken.trim()),
        zowkinsApi.listDeliveryMethods(),
      ]);
      setOrders(ordersResponse.orders || []);
      setStats(statsResponse.stats || { totalOrders: 0, processing: 0, delivered: 0, cancelled: 0, inTransit: 0, totalRevenue: 0 });
      setProducts(extractArray<ProductDetails>(productsResponse, ["products"]));
      setDeliveryMethods(extractArray<DeliveryMethod>(methodsResponse, ["deliveryMethods", "methods", "data"]));
      setHasNextPage(nextPageResponse.orders.length > 0);
      setSelectedOrder((current) => {
        if (!current) return ordersResponse.orders[0] ?? null;
        return ordersResponse.orders.find((order) => order.id === current.id) ?? ordersResponse.orders[0] ?? null;
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) { clearSession(); window.localStorage.removeItem(ADMIN_API_TOKEN_KEY); window.location.href = "/signin"; return; }
      setError(err instanceof ApiError ? err.message : "Could not load orders.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!ready || !apiReady) return;
    void loadOrders();
  }, [apiReady, ready, filterOrderStatus, filterPaymentStatus, sortOrder, page, pageSize]);

  useEffect(() => {
    if (!ready || !apiReady) return;
    const id = window.setInterval(() => { if (document.visibilityState === "hidden") return; if (page === 1) void loadOrders(1); }, 30_000);
    return () => window.clearInterval(id);
  }, [ready, apiReady, page, filterOrderStatus, filterPaymentStatus, pageSize]);

  useEffect(() => {
    if (!selectedOrder) return;
    setGeneratedLink("");
    setLinkCallbackUrl("");
    setUpdateForm({ orderStatus: normalizeOrderStatus(selectedOrder.orderStatus), paymentStatus: normalizePaymentStatus(selectedOrder.paymentStatus) });
    const selectedOrderProducts = selectedOrder.products ?? [];
    setUpdateItems(selectedOrderProducts.length ? selectedOrderProducts.map((product) => ({ productId: product.productId, quantity: String(product.quantity) })) : [{ productId: "", quantity: "1" }]);
  }, [selectedOrder]);

  const deliveryCityOptions = useMemo(
    () => STATE_TO_CITIES[createForm.deliveryAddressState] ?? ([] as readonly string[]),
    [createForm.deliveryAddressState],
  );

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = !needle ? orders : orders.filter((order) => {
      const customerFirstName = typeof order.customer === "object" ? order.customer.firstName : "";
      const customerLastName = typeof order.customer === "object" ? order.customer.lastName : "";
      const customerEmail = typeof order.customer === "object" ? order.customer.email : "";
      return [order.id, order.orderNumber, customerFirstName, customerLastName, customerEmail, order.orderStatus, order.paymentStatus, getOrderMethod(order), getOrderAddress(order)].some((value) => value.toLowerCase().includes(needle));
    });
    return [...filtered].sort((a, b) => sortOrder === "desc" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [orders, query, sortOrder]);

  const saveConnection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_API_TOKEN_KEY, apiConnection.accessToken.trim());
    setMessage("API connection saved.");
    setError("");
  };

  const refresh = async () => { setRefreshing(true); setPage(1); try { await loadOrders(1); } finally { setRefreshing(false); } };

  const createOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady) { setError("Save a bearer token first."); return; }
    const items = createForm.items.map((item) => ({ productId: item.productId.trim(), quantity: Number(item.quantity) })).filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0);
    const customerValid = Boolean(createForm.customerFirstName.trim() && createForm.customerLastName.trim() && createForm.customerEmail.trim() && createForm.customerPhone.trim());
    const deliveryAddressValid = Boolean(createForm.deliveryAddress.trim() && createForm.deliveryAddressPhoneNumber.trim() && createForm.deliveryAddressCity.trim() && createForm.deliveryAddressState.trim() && createForm.deliveryAddressCountry.trim() && createForm.deliveryAddressPostalCode.trim());
    if (!customerValid) { setError("Please fill out all customer details (first name, last name, email, phone)."); return; }
    if (!deliveryAddressValid || !createForm.deliveryMethod.trim() || items.length === 0) { setError("Fill out the delivery address, delivery method, and add at least one product."); return; }
    const payload = { customer: { firstName: createForm.customerFirstName.trim(), lastName: createForm.customerLastName.trim(), email: createForm.customerEmail.trim(), phoneNumber: createForm.customerPhone.trim() }, deliveryAddress: { phoneNumber: createForm.deliveryAddressPhoneNumber.trim(), street: createForm.deliveryAddress.trim(), city: createForm.deliveryAddressCity.trim(), state: createForm.deliveryAddressState.trim(), country: createForm.deliveryAddressCountry.trim(), postalCode: createForm.deliveryAddressPostalCode.trim() }, deliveryMethod: createForm.deliveryMethod.trim(), items };
    setCreating(true); setError(""); setMessage("");
    try {
      const response = await zowkinsApi.createAdminOrder(apiConnection.accessToken.trim(), payload);
      setMessage("Order created successfully.");
      setSelectedOrder(response.order);
      setCreateForm(emptyCreateForm());
      await loadOrders();
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not create order."); }
    finally { setCreating(false); }
  };

  const updateOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady || !selectedOrder) { setError("Select an order first."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await zowkinsApi.updateAdminOrder(apiConnection.accessToken.trim(), selectedOrder.id, updateForm);
      setSelectedOrder(response.order);
      setMessage("Order status updated successfully.");
      await loadOrders();
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not update order."); }
    finally { setSaving(false); }
  };

  const updateProducts = async () => {
    if (!apiReady || !selectedOrder) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const productsPayload: AdminOrderProductUpdateItem[] = updateItems.map((item) => ({ productId: item.productId.trim(), quantity: Number(item.quantity) })).filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0);
      if (!productsPayload.length) { setError("Add at least one valid product with a quantity greater than zero."); return; }
      const response = await zowkinsApi.updateAdminOrderProducts(apiConnection.accessToken.trim(), selectedOrder.id, { products: productsPayload });
      setSelectedOrder(response.order);
      setMessage("Order products updated successfully.");
      await loadOrders();
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not update order products."); }
    finally { setSaving(false); }
  };

  const setSelectedOrderById = async (orderId: string) => {
    if (!apiReady) return;
    try {
      const response = await zowkinsApi.getAdminOrder(apiConnection.accessToken.trim(), orderId);
      setSelectedOrder(response.order);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not load order details."); }
  };

  const generateOrderPaymentLink = async () => {
    if (!apiReady || !selectedOrder) return;
    setGeneratingLink(true); setError(""); setMessage(""); setGeneratedLink("");
    try {
      const response = await zowkinsApi.generateAdminOrderPaymentLink(apiConnection.accessToken.trim(), selectedOrder.id, linkCallbackUrl.trim() ? { callbackUrl: linkCallbackUrl.trim() } : undefined);
      setGeneratedLink(response.paymentLink);
      setMessage("Payment link generated successfully.");
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not generate payment link."); }
    finally { setGeneratingLink(false); }
  };

  const addItemRow = () => setUpdateItems((current) => [...current, { productId: "", quantity: "1" }]);
  const removeItemRow = (index: number) => setUpdateItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const inputClass = (errors: boolean) => `w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white ${errors ? "border-rose-500 focus:border-rose-600" : "border-slate-200 focus:border-[#0a2a78]"}`;

  return (
    <AdminShell title="Orders" subtitle="Order management for administrators." searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search orders...">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)]">
        {activeTab === "dashboard" ? (
          <>
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Operations</p>
                    <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">Live order dashboard</h2>
                  </div>
                  <AdminBadge label={apiReady ? "Visible" : "Hidden"} />
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                {error ? <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
                {message ? <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

                <div className="mb-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                    <div className="absolute inset-x-0 top-0 h-1 bg-slate-200" />
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Total</p>
                    <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">{stats.totalOrders}</p>
                  </div>
                  <button type="button" onClick={() => { setPage(1); setFilterOrderStatus(filterOrderStatus === "processing" ? "" : "processing"); }} className={`relative overflow-hidden rounded-xl border bg-amber-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] text-left transition hover:brightness-95 ${filterOrderStatus === "processing" ? "border-amber-400 ring-2 ring-amber-300" : "border-amber-100"}`}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-amber-300" />
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-amber-700">Processing</p>
                    <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">{stats.processing}</p>
                  </button>
                  <button type="button" onClick={() => { setPage(1); setFilterOrderStatus(filterOrderStatus === "delivered" ? "" : "delivered"); }} className={`relative overflow-hidden rounded-xl border bg-emerald-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] text-left transition hover:brightness-95 ${filterOrderStatus === "delivered" ? "border-emerald-400 ring-2 ring-emerald-300" : "border-emerald-100"}`}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-emerald-300" />
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-emerald-700">Delivered</p>
                    <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">{stats.delivered}</p>
                  </button>
                  <button type="button" onClick={() => { setPage(1); setFilterOrderStatus(filterOrderStatus === "cancelled" ? "" : "cancelled"); }} className={`relative overflow-hidden rounded-xl border bg-rose-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] text-left transition hover:brightness-95 ${filterOrderStatus === "cancelled" ? "border-rose-400 ring-2 ring-rose-300" : "border-rose-100"}`}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-rose-300" />
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-rose-700">Cancelled</p>
                    <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">{stats.cancelled}</p>
                  </button>
                  <button type="button" onClick={() => { setPage(1); setFilterOrderStatus(filterOrderStatus === "in-transit" ? "" : "in-transit"); }} className={`relative overflow-hidden rounded-xl border bg-cyan-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] text-left transition hover:brightness-95 ${filterOrderStatus === "in-transit" ? "border-cyan-400 ring-2 ring-cyan-300" : "border-cyan-100"}`}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-cyan-300" />
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cyan-700">Transit</p>
                    <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">{stats.inTransit}</p>
                  </button>
                  <div className="xl:col-span-5 relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] sm:col-span-2">
                    <div className="absolute inset-x-0 top-0 h-1 bg-slate-300" />
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Revenue</p>
                    <p className="mt-3 break-words text-2xl font-bold leading-none tracking-tight text-slate-900 sm:text-3xl">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Order status</label>
                    <select value={filterOrderStatus} onChange={(e) => { setPage(1); setFilterOrderStatus(e.target.value); }} className={inputClass(false)}>
                      <option value="">All order statuses</option>
                      {orderStatusOptions.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Payment status</label>
                    <select value={filterPaymentStatus} onChange={(e) => { setPage(1); setFilterPaymentStatus(e.target.value); }} className={inputClass(false)}>
                      <option value="">All payment statuses</option>
                      {paymentStatusOptions.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Page size</label>
                    <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }} className={inputClass(false)}>
                      {ORDER_PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} per page</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-700">Sort by date</label>
                    <select value={sortOrder} onChange={(e) => { setPage(1); setSortOrder(e.target.value as "desc" | "asc"); }} className={inputClass(false)}>
                      <option value="desc">Newest first</option><option value="asc">Oldest first</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => void refresh()} disabled={refreshing} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{refreshing ? "Refreshing..." : "Refresh"}</button>
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <p>Page <strong className="text-slate-900">{page}</strong><span className="ml-2">{filteredOrders.length ? `Showing ${filteredOrders.length} orders on this page` : "No orders on this page"}</span></p>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <button type="button" onClick={() => setPage((c) => Math.max(1, c - 1))} disabled={loading || page === 1} className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">Previous</button>
                    <button type="button" onClick={() => setPage((c) => c + 1)} disabled={loading || !hasNextPage} className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">Next</button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {loading ? <p className="text-sm text-slate-500">Loading orders...</p> : null}
                  {filteredOrders.map((order) => (
                    <article key={order.id} className={`min-w-0 rounded-xl border p-4 transition ${selectedOrder?.id === order.id ? "border-[#0a2a78] bg-[#f6f9ff]" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{getOrderTitle(order)}</p>
                          <p className="mt-1 truncate text-sm text-slate-600">{order.orderNumber}</p>
                        </div>
                        <AdminBadge label={titleCase(order.orderStatus)} />
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                        <span>Products: <strong className="text-slate-900">{order.products?.length ?? 0}</strong></span>
                        <span>Total: <strong className="text-slate-900">{formatCurrency(order.transaction?.totalAmount ?? 0)}</strong></span>
                        <span>Payment: <strong className="text-slate-900">{titleCase(order.paymentStatus)}</strong></span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">Placed {new Date(order.createdAt).toLocaleString()}</span>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                          <button type="button" onClick={() => { void setSelectedOrderById(order.id); setActiveTab("detail"); }} className="w-full rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-200 sm:w-auto sm:text-sm sm:normal-case sm:tracking-normal">Quick view</button>
                          <Link href={`/admin/orders/${order.id}`} className="w-full rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-slate-800 sm:w-auto sm:text-sm sm:normal-case sm:tracking-normal">View details</Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Admin access</p>
              <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">Protected order workflow</h2>
              <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
                <p>Save a bearer token once, then manage orders from this workspace.</p>
                <p>Create orders with product, delivery, and customer IDs.</p>
                <p>Patch order status or update order line items without leaving the dashboard.</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href="/admin/products" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">Products</Link>
                <Link href="/admin/settings" className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Profile settings</Link>
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">API connection</p>
              <h2 className="mt-2 font-display text-xl font-bold text-slate-900 sm:text-2xl">Admin session</h2>
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <p>Your signed-in admin session is used automatically for orders.</p>
                <p className="mt-2 font-semibold text-slate-900">Status: {apiReady ? "Connected" : "Not connected"}</p>
              </div>
            </section>
          </>
        ) : activeTab === "create" ? (
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Create order</p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">Create a new admin order</h2>
              </div>
              <button type="button" onClick={() => setActiveTab("dashboard")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Back</button>
            </div>
            <form onSubmit={createOrder} className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>First name</span>
                  <input value={createForm.customerFirstName} onChange={(e) => setCreateForm((c) => ({ ...c, customerFirstName: e.target.value }))} placeholder="John" className={inputClass(false)} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>Last name</span>
                  <input value={createForm.customerLastName} onChange={(e) => setCreateForm((c) => ({ ...c, customerLastName: e.target.value }))} placeholder="Doe" className={inputClass(false)} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                  <span>Email</span>
                  <input value={createForm.customerEmail} onChange={(e) => setCreateForm((c) => ({ ...c, customerEmail: e.target.value }))} placeholder="john@example.com" type="email" className={inputClass(false)} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                  <span>Phone number</span>
                  <input value={createForm.customerPhone} onChange={(e) => setCreateForm((c) => ({ ...c, customerPhone: e.target.value }))} placeholder="+2348012345678" type="tel" className={inputClass(false)} />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Delivery address</span>
                <input value={createForm.deliveryAddress} onChange={(e) => setCreateForm((c) => ({ ...c, deliveryAddress: e.target.value }))} placeholder="Delivery address" className={inputClass(false)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Delivery phone number</span>
                <input value={createForm.deliveryAddressPhoneNumber} onChange={(e) => setCreateForm((c) => ({ ...c, deliveryAddressPhoneNumber: e.target.value }))} placeholder="+2348012345678" type="tel" className={inputClass(false)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>State</span>
                <select value={createForm.deliveryAddressState} onChange={(e) => setCreateForm((c) => ({ ...c, deliveryAddressState: e.target.value, deliveryAddressCity: "" }))} className={inputClass(false)}>
                  <option value="">Select state</option>
                  {NIGERIA_36_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>City</span>
                <select value={createForm.deliveryAddressCity} onChange={(e) => setCreateForm((c) => ({ ...c, deliveryAddressCity: e.target.value }))} disabled={!createForm.deliveryAddressState} className={inputClass(false)}>
                  <option value="">{createForm.deliveryAddressState ? "Select city" : "Select state first"}</option>
                  {deliveryCityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Country</span>
                <input value={createForm.deliveryAddressCountry} onChange={(e) => setCreateForm((c) => ({ ...c, deliveryAddressCountry: e.target.value }))} placeholder="Nigeria" className={inputClass(false)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Postal code</span>
                <input value={createForm.deliveryAddressPostalCode} onChange={(e) => setCreateForm((c) => ({ ...c, deliveryAddressPostalCode: e.target.value }))} placeholder="100001" className={inputClass(false)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Delivery method</span>
                <select value={createForm.deliveryMethod} onChange={(e) => setCreateForm((c) => ({ ...c, deliveryMethod: e.target.value }))} className={inputClass(false)}>
                  <option value="">Select delivery method</option>
                  {deliveryMethods.map((method) => <option key={method.id} value={method.id}>{method.name} - {formatCurrency(method.fee)}</option>)}
                </select>
              </label>
              <div className="space-y-3">
                {createForm.items.map((item, index) => (
                  <div key={index} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      <span>Product</span>
                      <div className="relative overflow-hidden rounded-xl max-w-full">
                        <select value={item.productId} onChange={(event) => setCreateForm((c) => ({ ...c, items: c.items.map((row, rowIndex) => rowIndex === index ? { ...row, productId: event.target.value } : row) }))} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-5 text-sm leading-tight outline-none transition focus:border-[#0a2a78] focus:bg-white">
                          <option value="">Select product</option>
                          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                        </select>
                      </div>
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      <span>Quantity</span>
                      <input value={item.quantity} onChange={(event) => setCreateForm((c) => ({ ...c, items: c.items.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: event.target.value } : row) }))} type="number" min="1" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white" />
                    </label>
                    <button type="button" onClick={() => setCreateForm((c) => ({ ...c, items: c.items.length > 1 ? c.items.filter((_, rowIndex) => rowIndex !== index) : c.items }))} className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Remove</button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setCreateForm((c) => ({ ...c, items: [...c.items, { productId: "", quantity: "1" }] }))} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Add item</button>
                <button type="submit" disabled={creating || !apiReady} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{creating ? "Creating..." : "Create order"}</button>
              </div>
            </form>
          </section>
        ) : (
          <section id="order-details" className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Selected order</p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">Update status and items</h2>
              </div>
              <button type="button" onClick={() => setActiveTab("dashboard")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Back</button>
            </div>
            {selectedOrder ? (
              <div className="space-y-5">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{getOrderTitle(selectedOrder)}</p>
                  <p className="mt-1 text-sm text-slate-600">Order: <strong>{selectedOrder.orderNumber}</strong></p>
                  <p className="mt-2 text-sm text-slate-600">{selectedOrder.customer?.email ?? "No customer email"}</p>
                  <p className="text-sm text-slate-600">{selectedOrder.customer?.phoneNumber ?? "No customer phone"}</p>
                </div>
                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Created</p>
                    <p className="mt-1 text-slate-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Last updated</p>
                    <p className="mt-1 text-slate-900">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Order Status</p>
                    <p className="mt-1 text-slate-900 font-semibold">{titleCase(selectedOrder.orderStatus)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payment Status</p>
                    <p className="mt-1 text-slate-900 font-semibold">{titleCase(selectedOrder.paymentStatus)}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-3">Delivery Details</p>
                  <p className="text-sm text-slate-600"><strong>Address:</strong> {getOrderAddress(selectedOrder)}</p>
                  <p className="mt-2 text-sm text-slate-600"><strong>Method:</strong> {getOrderMethod(selectedOrder)}</p>
                  {typeof selectedOrder.deliveryMethod === "object" && selectedOrder.deliveryMethod != null && typeof selectedOrder.deliveryMethod.fee === "number" && (
                    <>
                      <p className="mt-1 text-sm text-slate-600"><strong>Fee:</strong> {formatCurrency(selectedOrder.deliveryMethod.fee)}</p>
                      <p className="text-sm text-slate-600"><strong>Estimated:</strong> {selectedOrder.deliveryMethod.estimatedDeliveryTime}</p>
                    </>
                  )}
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-3">Order Items</p>
                  <div className="space-y-2">
                    {(selectedOrder.products ?? []).map((product, idx) => (
                      <div key={idx} className="flex justify-between text-sm border-b border-slate-200 pb-2 last:border-0">
                        <div>
                          <p className="font-medium text-slate-900">{product.productName}</p>
                          <p className="text-xs text-slate-600">Qty: {product.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-900 font-medium">{formatCurrency(product.amount)}</p>
                          <p className="text-xs text-slate-600">@ {formatCurrency(product.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Generate Payment Link</p>
                  <p className="text-xs text-slate-500">Send a fresh payment link to the customer for this order.</p>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    <span>Callback URL <span className="font-normal text-slate-500">(optional)</span></span>
                    <input value={linkCallbackUrl} onChange={(e) => setLinkCallbackUrl(e.target.value)} placeholder="https://your-site.com/orders" className={inputClass(false)} />
                  </label>
                  {generatedLink ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Payment link</p>
                      <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="block break-all text-sm font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-600">{generatedLink}</a>
                      <button type="button" onClick={() => void navigator.clipboard.writeText(generatedLink)} className="rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">Copy link</button>
                    </div>
                  ) : null}
                  <button type="button" onClick={() => void generateOrderPaymentLink()} disabled={generatingLink} className="w-full rounded-xl bg-[#0a2a78] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60">{generatingLink ? "Generating..." : "Generate payment link"}</button>
                </div>
                <form onSubmit={updateOrder} className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    <span>Order status</span>
                    <select value={updateForm.orderStatus} onChange={(event) => setUpdateForm((c) => ({ ...c, orderStatus: event.target.value as AdminOrderStatus }))} className={inputClass(false)}>
                      {orderStatusOptions.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    <span>Payment status</span>
                    <select value={updateForm.paymentStatus} onChange={(event) => setUpdateForm((c) => ({ ...c, paymentStatus: event.target.value as AdminPaymentStatus }))} className={inputClass(false)}>
                      {paymentStatusOptions.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                    </select>
                  </label>
                  <button type="submit" disabled={saving} className="rounded-xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{saving ? "Saving..." : "Update order status"}</button>
                </form>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Order products</p>
                  <div className="mt-3 space-y-3">
                    {updateItems.map((item, index) => (
                      <div key={index} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          <span>Product</span>
                          <div className="relative overflow-hidden rounded-xl max-w-full">
                            <select value={item.productId} onChange={(event) => setUpdateItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, productId: event.target.value } : row))} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-5 text-sm leading-tight outline-none transition focus:border-[#0a2a78] focus:bg-white">
                              <option value="">Select product</option>
                              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                            </select>
                          </div>
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          <span>Quantity</span>
                          <input value={item.quantity} onChange={(event) => setUpdateItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: event.target.value } : row))} type="number" min="1" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white" />
                        </label>
                        <button type="button" onClick={() => removeItemRow(index)} className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={addItemRow} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Add item</button>
                    <button type="button" onClick={() => void updateProducts()} disabled={saving} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Updating..." : "Update products"}</button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Select an order from the list to inspect or edit it.</p>
            )}
          </section>
        )}
      </div>
    </AdminShell>
  );
}
