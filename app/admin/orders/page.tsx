"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminBadge, AdminShell } from "../../../components/AdminShell";
import { useAdminSession } from "../../../hooks/useAdminSession";
import {
  AdminOrder,
  AdminCustomer,
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
  customer: string;
  deliveryAddress: string;
  deliveryMethod: string;
  items: OrderItemForm[];
};

const emptyCreateForm = (): CreateOrderForm => ({
  customer: "",
  deliveryAddress: "",
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

const titleCase = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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
  return (
    `${order.customer.firstName} ${order.customer.lastName}`.trim() ||
    order.customer.email ||
    order.orderNumber
  );
}

function getOrderAddress(order: AdminOrder) {
  if (typeof order.deliveryAddress === "string") return order.deliveryAddress;
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
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
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
      const [ordersResponse, nextPageResponse, statsResponse, productsResponse, methodsResponse, customersResponse] =
        await Promise.all([
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
          zowkinsApi.listAdminCustomers(apiConnection.accessToken.trim()),
        ]);

      setOrders(ordersResponse.orders || []);
      setStats(statsResponse.stats || {
        totalOrders: 0,
        processing: 0,
        delivered: 0,
        cancelled: 0,
        inTransit: 0,
        totalRevenue: 0,
      });
      setProducts(extractArray<ProductDetails>(productsResponse, ["products"]));
      setDeliveryMethods(extractArray<DeliveryMethod>(methodsResponse, ["deliveryMethods", "methods", "data"]));
      setCustomers(extractArray<AdminCustomer>(customersResponse, ["customers", "users", "data"]));
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

    setUpdateForm({
      orderStatus: normalizeOrderStatus(selectedOrder.orderStatus),
      paymentStatus: normalizePaymentStatus(selectedOrder.paymentStatus),
    });
    setUpdateItems(
      selectedOrder.products.length
        ? selectedOrder.products.map((product) => ({
            productId: product.productId,
            quantity: String(product.quantity),
          }))
        : [{ productId: "", quantity: "1" }],
    );
  }, [selectedOrder]);

  const getCustomerLabel = (customer: AdminCustomer) =>
    `${customer.firstName} ${customer.lastName}`.trim() ||
    customer.email ||
    customer.id;

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((order) =>
      [
        order.id,
        order.orderNumber,
        order.customer.firstName,
        order.customer.lastName,
        order.customer.email,
        order.orderStatus,
        order.paymentStatus,
        getOrderMethod(order),
        getOrderAddress(order),
      ].some((value) => value.toLowerCase().includes(needle)),
    );
  }, [orders, query]);

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

    const payload = {
      customer: createForm.customer.trim(),
      deliveryAddress: createForm.deliveryAddress.trim(),
      deliveryMethod: createForm.deliveryMethod.trim(),
      items: createForm.items
        .map((item) => ({
          productId: item.productId.trim(),
          quantity: Number(item.quantity),
        }))
        .filter(
          (item) =>
            item.productId &&
            Number.isFinite(item.quantity) &&
            item.quantity > 0,
        ),
    };

    if (
      !payload.customer ||
      !payload.deliveryAddress ||
      !payload.deliveryMethod ||
      payload.items.length === 0
    ) {
      setError(
        "Fill out the customer, delivery address, delivery method, and at least one product.",
      );
      return;
    }

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
        setError("Add at least one valid product with a quantity greater than zero.");
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
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
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

          <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Total
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.totalOrders}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Processing
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.processing}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Delivered
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.delivered}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-rose-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                Cancelled
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.cancelled}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-cyan-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Transit
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.inTransit}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Revenue
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
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

          <div className="mt-6 flex flex-wrap gap-3">
            <label className="sr-only">
              Order status
                <select
                  value={filterOrderStatus}
                  onChange={(event) => {
                    setPage(1);
                    setFilterOrderStatus(event.target.value);
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                >
                <option value="">All order statuses</option>
                {orderStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="sr-only">
              Payment status
                <select
                  value={filterPaymentStatus}
                  onChange={(event) => {
                    setPage(1);
                    setFilterPaymentStatus(event.target.value);
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
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
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
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
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>
              Page <strong className="text-slate-900">{page}</strong>
              <span className="ml-2">
                {filteredOrders.length
                  ? `Showing ${filteredOrders.length} orders on this page`
                  : "No orders on this page"}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={loading || page === 1}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={loading || !hasNextPage}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                className={`rounded-[1.4rem] border p-4 md:p-5 ${selectedOrder?.id === order.id ? "border-[#0a2a78] bg-[#f6f9ff]" : "border-slate-100 bg-slate-50"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {getOrderTitle(order)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.orderNumber}
                    </p>
                  </div>
                  <AdminBadge label={titleCase(order.orderStatus)} />
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <span>
                    Products:{" "}
                    <strong className="text-slate-900">
                      {order.products.length}
                    </strong>
                  </span>
                  <span>
                    Total:{" "}
                    <strong className="text-slate-900">
                      {formatCurrency(order.transaction.totalAmount)}
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
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Updated {new Date(order.updatedAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => void setSelectedOrderById(order.id)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                  >
                    View details
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2a78_0%,#12386a_100%)] p-6 text-white shadow-[0_14px_30px_rgba(15,23,42,0.10)] md:p-8">
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
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/products"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Products
              </Link>
              <Link
                href="/admin/settings"
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
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
              <p>Your signed-in admin session is used automatically for orders.</p>
              <p className="mt-2 font-semibold text-slate-900">Status: {apiReady ? "Connected" : "Not connected"}</p>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Create order
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Create a new admin order
            </h2>
            <form onSubmit={createOrder} className="mt-6 space-y-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Customer</span>
                <select
                  value={createForm.customer}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      customer: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {getCustomerLabel(customer)} - {customer.email}
                    </option>
                  ))}
                </select>
              </label>
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
                    className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_120px_auto]"
                  >
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Product</span>
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
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                      >
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.slug})
                          </option>
                        ))}
                      </select>
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
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
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
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Selected order
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Update status and items
            </h2>
            {selectedOrder ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-[1.4rem] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {getOrderTitle(selectedOrder)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedOrder.orderNumber}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {getOrderAddress(selectedOrder)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {getOrderMethod(selectedOrder)}
                  </p>
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
                          paymentStatus: event.target.value as AdminPaymentStatus,
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
                        className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_120px_auto]"
                      >
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Product</span>
                          <select
                            value={item.productId}
                            onChange={(event) =>
                              setUpdateItems((current) =>
                                current.map((row, rowIndex) =>
                                  rowIndex === index
                                    ? { ...row, productId: event.target.value }
                                    : row,
                                ),
                              )
                            }
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                          >
                            <option value="">Select product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.slug})
                              </option>
                            ))}
                          </select>
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
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0a2a78] focus:bg-white"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
