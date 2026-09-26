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

type ApiConnection = {
  accessToken: string;
};

type OrderItemForm = {
  productId: string;
  quantity: string;
};

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

const orderStatusOptions: AdminOrderStatus[] = [
  "processing",
  "in-transit",
  "cancelled",
  "delivered",
];
const paymentStatusOptions: AdminPaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "abandoned",
  "reversed",
];

const titleCase = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "Unknown";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const extractArray = <T,>(response: unknown, keys: string[]): T[] => {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object") {
    // Check common wrapper fields
    for (const key of keys) {
      if (Array.isArray((response as Record<string, unknown>)[key])) {
        return (response as Record<string, unknown>)[key] as T[];
      }
    }
    // Also check standard generic placeholders
    if (Array.isArray((response as { data?: unknown }).data)) {
      return (response as { data: T[] }).data;
    }
  }
  return [];
};

const normalizeOrderStatus = (value: string): AdminOrderStatus =>
  orderStatusOptions.includes(value as AdminOrderStatus)
    ? (value as AdminOrderStatus)
    : "processing";

const normalizePaymentStatus = (value: string): AdminPaymentStatus =>
  paymentStatusOptions.includes(value as AdminPaymentStatus)
    ? (value as AdminPaymentStatus)
    : "pending";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

function getOrderTitle(order: AdminOrder) {
  const firstName =
    typeof order.customer === "object" ? order.customer.firstName : "";
  const lastName =
    typeof order.customer === "object" ? order.customer.lastName : "";
  const email = typeof order.customer === "object" ? order.customer.email : "";
  const customerName = `${firstName} ${lastName}`.trim();

  return customerName || email || order.orderNumber;
}

function getOrderAddress(order: AdminOrder) {
  if (typeof order.deliveryAddress === "string") return order.deliveryAddress;
  if (
    order.deliveryAddress == null ||
    typeof order.deliveryAddress !== "object"
  ) {
    return "Address not available";
  }
  return [
    order.deliveryAddress.street,
    order.deliveryAddress.city,
    order.deliveryAddress.state,
  ]
    .filter(Boolean)
    .join(", ");
}

function getOrderMethod(order: AdminOrder) {
  if (typeof order.deliveryMethod === "string") return order.deliveryMethod;
  if (
    order.deliveryMethod == null ||
    typeof order.deliveryMethod !== "object" ||
    typeof order.deliveryMethod.name !== "string"
  ) {
    return "Unknown delivery method";
  }
  return order.deliveryMethod.name;
}

export default function OrdersPage() {
  const { session, clearSession } = useAdminSession();
  const [apiConnection, setApiConnection] = useState<ApiConnection>({
    accessToken: "",
  });
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
    inTransit: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [createForm, setCreateForm] =
    useState<CreateOrderForm>(emptyCreateForm());
  const [updateForm, setUpdateForm] = useState<{
    orderStatus: AdminOrderStatus;
    paymentStatus: AdminPaymentStatus;
  }>({
    orderStatus: "processing",
    paymentStatus: "pending",
  });
  const [updateItems, setUpdateItems] = useState<OrderItemForm[]>([
    { productId: "", quantity: "1" },
  ]);
  const [query, setQuery] = useState("");
  const [filterOrderStatus, setFilterOrderStatus] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
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

  useEffect(() => {
    if (!session?.accessToken || typeof window === "undefined") return;

    const nextToken = session.accessToken.trim();
    const storedToken = window.localStorage.getItem(ADMIN_API_TOKEN_KEY) ?? "";

    setApiConnection({ accessToken: nextToken });

    if (nextToken && nextToken !== storedToken) {
      window.localStorage.setItem(ADMIN_API_TOKEN_KEY, nextToken);
    }

    setReady(true);
  }, [session?.accessToken]);

  const apiReady = Boolean(apiConnection.accessToken.trim());

  const loadOrders = async () => {
    if (!apiReady) return;

    setLoading(true);
    setError("");

    try {
      const [
        ordersResponse,
        nextPageResponse,
        statsResponse,
        productsResponse,
        methodsResponse,
      ] = await Promise.all([
        zowkinsApi.listAdminOrders(apiConnection.accessToken.trim(), {
          orderStatus: filterOrderStatus || undefined,
          paymentStatus: filterPaymentStatus || undefined,
          sortBy: "createdAt:desc",
          limit: pageSize,
          page,
        }),
        zowkinsApi.listAdminOrders(apiConnection.accessToken.trim(), {
          orderStatus: filterOrderStatus || undefined,
          paymentStatus: filterPaymentStatus || undefined,
          sortBy: "createdAt:desc",
          limit: 1,
          page: page + 1,
        }),
        zowkinsApi.getAdminOrderStats(apiConnection.accessToken.trim()),
        zowkinsApi.listAdminProducts(apiConnection.accessToken.trim()),
        zowkinsApi.listDeliveryMethods(),
      ]);

      setOrders(ordersResponse.orders || []);
      setStats(
        statsResponse.stats || {
          totalOrders: 0,
          processing: 0,
          delivered: 0,
          cancelled: 0,
          inTransit: 0,
          totalRevenue: 0,
        },
      );
      setProducts(extractArray<ProductDetails>(productsResponse, ["products"]));
      setDeliveryMethods(
        extractArray<DeliveryMethod>(methodsResponse, [
          "deliveryMethods",
          "methods",
          "data",
        ]),
      );
      setHasNextPage(nextPageResponse.orders.length > 0);
      setSelectedOrder((current) => {
        if (!current) return ordersResponse.orders[0] ?? null;
        return (
          ordersResponse.orders.find((order) => order.id === current.id) ??
          ordersResponse.orders[0] ??
          null
        );
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
        window.location.href = "/signin";
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Could not load orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready || !apiReady) return;
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, ready, filterOrderStatus, filterPaymentStatus, page, pageSize]);

  useEffect(() => {
    if (!selectedOrder) return;

    setGeneratedLink("");
    setLinkCallbackUrl("");
    setUpdateForm({
      orderStatus: normalizeOrderStatus(selectedOrder.orderStatus),
      paymentStatus: normalizePaymentStatus(selectedOrder.paymentStatus),
    });
    const selectedOrderProducts = selectedOrder.products ?? [];
    setUpdateItems(
      selectedOrderProducts.length
        ? selectedOrderProducts.map((product) => ({
            productId: product.productId,
            quantity: String(product.quantity),
          }))
        : [{ productId: "", quantity: "1" }],
    );
  }, [selectedOrder]);

  const deliveryCityOptions = useMemo(
    () =>
      STATE_TO_CITIES[createForm.deliveryAddressState] ??
      ([] as readonly string[]),
    [createForm.deliveryAddressState],
  );

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((order) => {
      const customerFirstName =
        typeof order.customer === "object" ? order.customer.firstName : "";
      const customerLastName =
        typeof order.customer === "object" ? order.customer.lastName : "";
      const customerEmail =
        typeof order.customer === "object" ? order.customer.email : "";

      return [
        order.id,
        order.orderNumber,
        customerFirstName,
        customerLastName,
        customerEmail,
        order.orderStatus,
        order.paymentStatus,
        getOrderMethod(order),
        getOrderAddress(order),
      ].some((value) => value.toLowerCase().includes(needle));
    });
  }, [orders, query]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveConnection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      ADMIN_API_TOKEN_KEY,
      apiConnection.accessToken.trim(),
    );
    setMessage("API connection saved.");
    setError("");
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const createOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady) {
      setError("Save a bearer token first.");
      return;
    }

    const items = createForm.items
      .map((item) => ({
        productId: item.productId.trim(),
        quantity: Number(item.quantity),
      }))
      .filter(
        (item) =>
          item.productId && Number.isFinite(item.quantity) && item.quantity > 0,
      );

    const customerValid = Boolean(
      createForm.customerFirstName.trim() &&
        createForm.customerLastName.trim() &&
        createForm.customerEmail.trim() &&
        createForm.customerPhone.trim(),
    );

    const deliveryAddressValid = Boolean(
      createForm.deliveryAddress.trim() &&
      createForm.deliveryAddressPhoneNumber.trim() &&
      createForm.deliveryAddressCity.trim() &&
      createForm.deliveryAddressState.trim() &&
      createForm.deliveryAddressCountry.trim() &&
      createForm.deliveryAddressPostalCode.trim(),
    );

    if (!customerValid) {
      const reason =
        "Please fill out all customer details (first name, last name, email, phone).";
      setError(reason);
      return;
    }

    if (
      !deliveryAddressValid ||
      !createForm.deliveryMethod.trim() ||
      items.length === 0
    ) {
      setError(
        "Fill out the delivery address, delivery method, and add at least one product.",
      );
      return;
    }

    const payload: Parameters<typeof zowkinsApi.createAdminOrder>[1] = {
      customer: {
        firstName: createForm.customerFirstName.trim(),
        lastName: createForm.customerLastName.trim(),
        email: createForm.customerEmail.trim(),
        phoneNumber: createForm.customerPhone.trim(),
      },
      deliveryAddress: {
        phoneNumber: createForm.deliveryAddressPhoneNumber.trim(),
        street: createForm.deliveryAddress.trim(),
        city: createForm.deliveryAddressCity.trim(),
        state: createForm.deliveryAddressState.trim(),
        country: createForm.deliveryAddressCountry.trim(),
        postalCode: createForm.deliveryAddressPostalCode.trim(),
      },
      deliveryMethod: createForm.deliveryMethod.trim(),
      items,
    };

    setCreating(true);
    setError("");
    setMessage("");

    try {
      const response = await zowkinsApi.createAdminOrder(
        apiConnection.accessToken.trim(),
        payload,
      );

      setMessage("Order created successfully.");
      setSelectedOrder(response.order);
      setCreateForm(emptyCreateForm());
      await loadOrders();

      // Scroll to order details section
      setTimeout(() => {
        const orderDetailsSection = document.getElementById("order-details");
        if (orderDetailsSection) {
          orderDetailsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create order.",
      );
    } finally {
      setCreating(false);
    }
  };

  const updateOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiReady || !selectedOrder) {
      setError("Select an order first.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await zowkinsApi.updateAdminOrder(
        apiConnection.accessToken.trim(),
        selectedOrder.id,
        updateForm,
      );
      setSelectedOrder(response.order);
      setMessage("Order status updated successfully.");
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update order.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateProducts = async () => {
    if (!apiReady || !selectedOrder) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const productsPayload: AdminOrderProductUpdateItem[] = updateItems
        .map((item) => ({
          productId: item.productId.trim(),
          quantity: Number(item.quantity),
        }))
        .filter(
          (item) =>
            item.productId &&
            Number.isFinite(item.quantity) &&
            item.quantity > 0,
        );

      if (!productsPayload.length) {
        setError(
          "Add at least one valid product with a quantity greater than zero.",
        );
        return;
      }

      const response = await zowkinsApi.updateAdminOrderProducts(
        apiConnection.accessToken.trim(),
        selectedOrder.id,
        {
          products: productsPayload,
        },
      );
      setSelectedOrder(response.order);
      setMessage("Order products updated successfully.");
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update order products.",
      );
    } finally {
      setSaving(false);
    }
  };

  const setSelectedOrderById = async (orderId: string) => {
    if (!apiReady) return;

    try {
      const response = await zowkinsApi.getAdminOrder(
        apiConnection.accessToken.trim(),
        orderId,
      );
      setSelectedOrder(response.order);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load order details.",
      );
    }
  };

  const generateOrderPaymentLink = async () => {
    if (!apiReady || !selectedOrder) return;
    setGeneratingLink(true);
    setError("");
    setMessage("");
    setGeneratedLink("");
    try {
      const response = await zowkinsApi.generateAdminOrderPaymentLink(
        apiConnection.accessToken.trim(),
        selectedOrder.id,
        linkCallbackUrl.trim()
          ? { callbackUrl: linkCallbackUrl.trim() }
          : undefined,
      );
      setGeneratedLink(response.paymentLink);
      setMessage("Payment link generated successfully.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not generate payment link.",
      );
    } finally {
      setGeneratingLink(false);
    }
  };

  const addItemRow = () =>
    setUpdateItems((current) => [...current, { productId: "", quantity: "1" }]);
  const removeItemRow = (index: number) =>
    setUpdateItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );

  return (
    <AdminShell
      title="Orders"
      subtitle="Order management for administrators."
      searchValue={query}
      onSearchChange={setQuery}
      searchPlaceholder="Search orders..."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="min-w-0 rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Operations
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                Live order dashboard
              </h2>
            </div>
            <AdminBadge label={apiReady ? "Visible" : "Hidden"} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="relative min-w-0 overflow-hidden rounded-[1.4rem] border border-slate-100 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-slate-200" />
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Total
              </p>
              <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">
                {stats.totalOrders}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setPage(1); setFilterOrderStatus(filterOrderStatus === "processing" ? "" : "processing"); }}
              className={`relative min-w-0 w-full overflow-hidden rounded-[1.4rem] border bg-amber-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] text-left transition hover:brightness-95 ${filterOrderStatus === "processing" ? "border-amber-400 ring-2 ring-amber-300" : "border-amber-100"}`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-amber-300" />
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-amber-700">Processing</p>
              <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">{stats.processing}</p>
            </button>
            <button
              type="button"
              onClick={() => { setPage(1); setFilterOrderStatus(filterOrderStatus === "delivered" ? "" : "delivered"); }}
              className={`relative min-w-0 w-full overflow-hidden rounded-[1.4rem] border bg-emerald-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] text-left transition hover:brightness-95 ${filterOrderStatus === "delivered" ? "border-emerald-400 ring-2 ring-emerald-300" : "border-emerald-100"}`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-emerald-300" />
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-emerald-700">Delivered</p>
              <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">{stats.delivered}</p>
            </button>
            <button
              type="button"
              onClick={() => { setPage(1); setFilterOrderStatus(filterOrderStatus === "cancelled" ? "" : "cancelled"); }}
              className={`relative min-w-0 w-full overflow-hidden rounded-[1.4rem] border bg-rose-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] text-left transition hover:brightness-95 ${filterOrderStatus === "cancelled" ? "border-rose-400 ring-2 ring-rose-300" : "border-rose-100"}`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-rose-300" />
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-rose-700">Cancelled</p>
              <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">{stats.cancelled}</p>
            </button>
            <button
              type="button"
              onClick={() => { setPage(1); setFilterOrderStatus(filterOrderStatus === "in-transit" ? "" : "in-transit"); }}
              className={`relative min-w-0 w-full overflow-hidden rounded-[1.4rem] border bg-cyan-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] text-left transition hover:brightness-95 ${filterOrderStatus === "in-transit" ? "border-cyan-400 ring-2 ring-cyan-300" : "border-cyan-100"}`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-cyan-300" />
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cyan-700">Transit</p>
              <p className="mt-3 text-2xl font-bold leading-none tracking-tight text-slate-900">{stats.inTransit}</p>
            </button>
            <div className="relative min-w-0 overflow-hidden rounded-[1.4rem] border border-slate-100 bg-slate-50 px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] sm:col-span-2 xl:col-span-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-slate-300" />
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Revenue
              </p>
              <p className="mt-3 break-words text-2xl font-bold leading-none tracking-tight text-slate-900 sm:text-3xl">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>

          {error ? (
            <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Order status</span>
              <select
                value={filterOrderStatus}
                onChange={(event) => {
                  setPage(1);
                  setFilterOrderStatus(event.target.value);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white sm:w-auto"
              >
                <option value="">All order statuses</option>
                {orderStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Payment status</span>
              <select
                value={filterPaymentStatus}
                onChange={(event) => {
                  setPage(1);
                  setFilterPaymentStatus(event.target.value);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white sm:w-auto"
              >
                <option value="">All payment statuses</option>
                {paymentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Page size</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPage(1);
                  setPageSize(Number(event.target.value));
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white sm:w-auto"
              >
                {ORDER_PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={refreshing}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p>
              Page <strong className="text-slate-900">{page}</strong>
              <span className="ml-2">
                {filteredOrders.length
                  ? `Showing ${filteredOrders.length} orders on this page`
                  : "No orders on this page"}
              </span>
            </p>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={loading || page === 1}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={loading || !hasNextPage}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading orders...</p>
            ) : null}
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className={`min-w-0 rounded-[1.4rem] border p-4 md:p-5 ${selectedOrder?.id === order.id ? "border-[#0a2a78] bg-[#f6f9ff]" : "border-slate-100 bg-slate-50"}`}
              >
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {getOrderTitle(order)}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-600">
                      {order.orderNumber}
                    </p>
                  </div>
                  <AdminBadge label={titleCase(order.orderStatus)} />
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <span>
                    Products:{" "}
                    <strong className="text-slate-900">
                      {order.products?.length ?? 0}
                    </strong>
                  </span>
                  <span>
                    Total:{" "}
                    <strong className="text-slate-900">
                      {formatCurrency(order.transaction?.totalAmount ?? 0)}
                    </strong>
                  </span>
                  <span>
                    Payment:{" "}
                    <strong className="text-slate-900">
                      {titleCase(order.paymentStatus)}
                    </strong>
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Updated {new Date(order.updatedAt).toLocaleString()}
                  </span>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        void setSelectedOrderById(order.id);
                        document
                          .getElementById("order-details")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-200 sm:w-auto sm:text-sm sm:normal-case sm:tracking-normal"
                    >
                      Quick view
                    </button>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="w-full rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-slate-800 sm:w-auto sm:text-sm sm:normal-case sm:tracking-normal"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="min-w-0 space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Admin access
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              Protected order workflow
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <p>
                Save a bearer token once, then manage orders from this
                workspace.
              </p>
              <p>Create orders with product, delivery, and customer IDs.</p>
              <p>
                Patch order status or update order line items without leaving
                the dashboard.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/admin/products"
                className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:w-auto"
              >
                Products
              </Link>
              <Link
                href="/admin/settings"
                className="w-full rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
              >
                Profile settings
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              API connection
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Admin session
            </h2>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              <p>
                Your signed-in admin session is used automatically for orders.
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                Status: {apiReady ? "Connected" : "Not connected"}
              </p>
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Create order
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Create a new admin order
            </h2>
            <form onSubmit={createOrder} className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>First name</span>
                  <input
                    value={createForm.customerFirstName}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        customerFirstName: event.target.value,
                      }))
                    }
                    placeholder="John"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  <span>Last name</span>
                  <input
                    value={createForm.customerLastName}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        customerLastName: event.target.value,
                      }))
                    }
                    placeholder="Doe"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                  <span>Email</span>
                  <input
                    value={createForm.customerEmail}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        customerEmail: event.target.value,
                      }))
                    }
                    placeholder="john@example.com"
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                  <span>Phone number</span>
                  <input
                    value={createForm.customerPhone}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        customerPhone: event.target.value,
                      }))
                    }
                    placeholder="+2348012345678"
                    type="tel"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Delivery address</span>
                <input
                  value={createForm.deliveryAddress}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      deliveryAddress: event.target.value,
                    }))
                  }
                  placeholder="Delivery address"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Delivery phone number</span>
                <input
                  value={createForm.deliveryAddressPhoneNumber}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      deliveryAddressPhoneNumber: event.target.value,
                    }))
                  }
                  placeholder="+2348012345678"
                  type="tel"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>City</span>
                <select
                  value={createForm.deliveryAddressCity}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      deliveryAddressCity: event.target.value,
                    }))
                  }
                  disabled={!createForm.deliveryAddressState}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                >
                  <option value="">
                    {createForm.deliveryAddressState
                      ? "Select city"
                      : "Select state first"}
                  </option>
                  {deliveryCityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>State</span>
                <select
                  value={createForm.deliveryAddressState}
                  onChange={(event) =>
                    setCreateForm((current) => {
                      const nextState = event.target.value;
                      const cities = STATE_TO_CITIES[nextState] ?? [];
                      return {
                        ...current,
                        deliveryAddressState: nextState,
                        deliveryAddressCity: cities.includes(
                          current.deliveryAddressCity,
                        )
                          ? current.deliveryAddressCity
                          : "",
                      };
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                >
                  <option value="">Select state</option>
                  {NIGERIA_36_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Country</span>
                <input
                  value={createForm.deliveryAddressCountry}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      deliveryAddressCountry: event.target.value,
                    }))
                  }
                  placeholder="Nigeria"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Postal code</span>
                <input
                  value={createForm.deliveryAddressPostalCode}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      deliveryAddressPostalCode: event.target.value,
                    }))
                  }
                  placeholder="100001"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Delivery method</span>
                <select
                  value={createForm.deliveryMethod}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      deliveryMethod: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                >
                  <option value="">Select delivery method</option>
                  {deliveryMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name} - {formatCurrency(method.fee)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-3">
                {createForm.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4"
                  >
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      <span>Product</span>
                      <div className="relative overflow-hidden rounded-2xl max-w-full">
                        <select
                          value={item.productId}
                          onChange={(event) =>
                            setCreateForm((current) => ({
                              ...current,
                              items: current.items.map((row, rowIndex) =>
                                rowIndex === index
                                  ? { ...row, productId: event.target.value }
                                  : row,
                              ),
                            }))
                          }
                          className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-5 text-sm leading-tight outline-none transition focus:border-[#0a2a78] focus:bg-white"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      <span>Quantity</span>
                      <input
                        value={item.quantity}
                        onChange={(event) =>
                          setCreateForm((current) => ({
                            ...current,
                            items: current.items.map((row, rowIndex) =>
                              rowIndex === index
                                ? { ...row, quantity: event.target.value }
                                : row,
                            ),
                          }))
                        }
                        type="number"
                        min="1"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setCreateForm((current) => ({
                          ...current,
                          items:
                            current.items.length > 1
                              ? current.items.filter(
                                  (_, rowIndex) => rowIndex !== index,
                                )
                              : current.items,
                        }))
                      }
                      className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCreateForm((current) => ({
                      ...current,
                      items: [
                        ...current.items,
                        { productId: "", quantity: "1" },
                      ],
                    }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Add item
                </button>
                <button
                  type="submit"
                  disabled={creating || !apiReady}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create order"}
                </button>
              </div>
            </form>
          </section>

          <section
            id="order-details"
            className="min-w-0 overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Selected order
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Update status and items
            </h2>
            {selectedOrder ? (
              <div className="mt-6 space-y-5">
                {/* Order Header */}
                <div className="rounded-[1.4rem] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {getOrderTitle(selectedOrder)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Order: <strong>{selectedOrder.orderNumber}</strong>
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedOrder.customer?.email ?? "No customer email"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedOrder.customer?.phoneNumber ?? "No customer phone"}
                  </p>
                </div>

                {/* Dates */}
                <div className="grid gap-3 rounded-[1.4rem] bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Created
                    </p>
                    <p className="mt-1 text-slate-900">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Last updated
                    </p>
                    <p className="mt-1 text-slate-900">
                      {new Date(selectedOrder.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Current Status */}
                <div className="grid gap-3 rounded-[1.4rem] bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Order Status
                    </p>
                    <p className="mt-1 text-slate-900 font-semibold">
                      {titleCase(selectedOrder.orderStatus)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Payment Status
                    </p>
                    <p className="mt-1 text-slate-900 font-semibold">
                      {titleCase(selectedOrder.paymentStatus)}
                    </p>
                  </div>
                </div>

                {/* Delivery Details */}
                <div className="rounded-[1.4rem] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    Delivery Details
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Address:</strong> {getOrderAddress(selectedOrder)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    <strong>Method:</strong> {getOrderMethod(selectedOrder)}
                  </p>
                  {typeof selectedOrder.deliveryMethod === "object" &&
                    selectedOrder.deliveryMethod != null &&
                    typeof selectedOrder.deliveryMethod.fee === "number" && (
                      <>
                        <p className="mt-1 text-sm text-slate-600">
                          <strong>Fee:</strong>{" "}
                          {formatCurrency(selectedOrder.deliveryMethod.fee)}
                        </p>
                        <p className="text-sm text-slate-600">
                          <strong>Estimated:</strong>{" "}
                          {selectedOrder.deliveryMethod.estimatedDeliveryTime}
                        </p>
                      </>
                    )}
                </div>

                {/* Products Summary */}
                <div className="rounded-[1.4rem] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    Order Items
                  </p>
                  <div className="space-y-2">
                    {(selectedOrder.products ?? []).map((product, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm border-b border-slate-200 pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.productName}
                          </p>
                          <p className="text-xs text-slate-600">
                            Qty: {product.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-900 font-medium">
                            {formatCurrency(product.amount)}
                          </p>
                          <p className="text-xs text-slate-600">
                            @ {formatCurrency(product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction Summary */}
                <div className="rounded-[1.4rem] bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    Transaction Summary
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="text-slate-900 font-medium">
                        {formatCurrency(selectedOrder.transaction?.subTotal ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Delivery Fee:</span>
                      <span className="text-slate-900 font-medium">
                        {formatCurrency(selectedOrder.transaction?.deliveryFee ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                      <span className="font-semibold text-slate-900">
                        Total:
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(selectedOrder.transaction?.totalAmount ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Generate Payment Link */}
                <div className="rounded-[1.4rem] bg-slate-50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Generate Payment Link
                  </p>
                  <p className="text-xs text-slate-500">
                    Send a fresh payment link to the customer for this order.
                  </p>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    <span>
                      Callback URL{" "}
                      <span className="font-normal text-slate-500">
                        (optional)
                      </span>
                    </span>
                    <input
                      value={linkCallbackUrl}
                      onChange={(e) => setLinkCallbackUrl(e.target.value)}
                      placeholder="https://your-site.com/orders"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                    />
                  </label>
                  {generatedLink ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        Payment link
                      </p>
                      <a
                        href={generatedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block break-all text-sm font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
                      >
                        {generatedLink}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(generatedLink);
                        }}
                        className="rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Copy link
                      </button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void generateOrderPaymentLink()}
                    disabled={generatingLink}
                    className="w-full rounded-2xl bg-[#0a2a78] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {generatingLink ? "Generating..." : "Generate payment link"}
                  </button>
                </div>

                <form
                  onSubmit={updateOrder}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    <span>Order status</span>
                    <select
                      value={updateForm.orderStatus}
                      onChange={(event) =>
                        setUpdateForm((current) => ({
                          ...current,
                          orderStatus: event.target.value as AdminOrderStatus,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                    >
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {titleCase(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    <span>Payment status</span>
                    <select
                      value={updateForm.paymentStatus}
                      onChange={(event) =>
                        setUpdateForm((current) => ({
                          ...current,
                          paymentStatus: event.target
                            .value as AdminPaymentStatus,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                    >
                      {paymentStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {titleCase(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-[#0a2a78] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12386a] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
                  >
                    {saving ? "Saving..." : "Update order status"}
                  </button>
                </form>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Order products
                  </p>
                  <div className="mt-3 space-y-3">
                    {updateItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4"
                      >
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          <span>Product</span>
                          <div className="relative overflow-hidden rounded-2xl max-w-full">
                            <select
                              value={item.productId}
                              onChange={(event) =>
                                setUpdateItems((current) =>
                                  current.map((row, rowIndex) =>
                                    rowIndex === index
                                      ? {
                                          ...row,
                                          productId: event.target.value,
                                        }
                                      : row,
                                  ),
                                )
                              }
                              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-5 text-sm leading-tight outline-none transition focus:border-[#0a2a78] focus:bg-white"
                            >
                              <option value="">Select product</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          <span>Quantity</span>
                          <input
                            value={item.quantity}
                            onChange={(event) =>
                              setUpdateItems((current) =>
                                current.map((row, rowIndex) =>
                                  rowIndex === index
                                    ? { ...row, quantity: event.target.value }
                                    : row,
                                ),
                              )
                            }
                            type="number"
                            min="1"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Add item
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateProducts()}
                      disabled={saving}
                      className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Updating..." : "Update products"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Select an order from the list to inspect or edit it.
              </p>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
