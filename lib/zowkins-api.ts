export const ZOWKINS_API_BASE = process.env.NEXT_PUBLIC_ZOWKINS_API_BASE || "/api/zowkins/v1";
const SERVER_ZOWKINS_API_BASE =
  process.env.ZOWKINS_UPSTREAM_API_BASE || "https://zowkins-api.onrender.com/v1";

export type ApiImage = {
  url: string;
  key: string;
};

export type ProductDetails = {
  id: string;
  name: string;
  slug: string;
  category: string | any;
  subcategory: string | any;
  image: ApiImage | null;
  price: number;
  description: string;
  visible: boolean;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductStats = {
  total: number;
  visible: number;
  invisible: number;
  instock: number;
  outofstock: number;
  totalInventoryUnitCost: number;
};

export type AdminProductStatsResponse = {
  stats: AdminProductStats;
};

export type AdminProductInput = {
  name: string;
  slug?: string;
  category: string;
  subcategory: string;
  price: number;
  description: string;
  visible: boolean;
  inStock: boolean;
  file: File | null;
};

export type DeliveryMethod = {
  id: string;
  _id?: string;
  name: string;
  fee: number;
  estimatedDeliveryTime: string;
  isActive: boolean;
  visibility: boolean;
};

export type AdminDeliveryMethodInput = {
  name: string;
  fee: number;
  estimatedDeliveryTime: string;
  isActive: boolean;
  visibility: boolean;
};

export type AdminCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female" | "other" | string;
  status: "pending" | "active" | "inactive" | "waitlist" | string;
  isReferralPartner: boolean;
  referredBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCustomerStats = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingUsers: number;
};

export type AdminCustomerStatsResponse = {
  stats: AdminCustomerStats;
};

export type AdminCustomerUpdateInput = {
  firstName?: string;
  lastName?: string;
  status?: string;
  isReferralPartner?: boolean;
  email?: string;
  phoneNumber?: string;
};

export type CategorySubcategory = {
  id: string;
  name: string;
  slug: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryDetails = {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: ApiImage | null;
  visible: boolean;
  subcategories: CategorySubcategory[];
  productsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategory = CategoryDetails;

export type AdminCategoryInput = {
  name: string;
  description: string;
  slug?: string;
  visible: boolean;
  subcategories: { name: string; _id?: string }[];
  file: File | null;
};

export type CategoryListItem = CategoryDetails;

export type CategoryListResponse = {
  categories: CategoryListItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

export type CategoryProductsResponse = {
  products: ProductDetails[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  maxPrice: number;
};

export type AdminUserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  role: string;
  gender: string;
  phoneNumber: string;
  avatar: ApiImage | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminTeamMember = AdminUserProfile;

export type AdminTeamInviteInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gender: string;
  phoneNumber?: string;
  dateOfBirth?: string;
};

export type AdminTeamUpdateInput = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  gender: string;
  phoneNumber: string;
}>;

export type AdminTeamAcceptInviteInput = {
  password: string;
};

export type PortalUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female" | "other" | string;
  dateOfBirth: string;
  isEmailVerified: boolean;
  isReferralPartner: boolean;
  status: string;
  referredBy: string | null;
  deliveryAddresses: string[];
  createdAt: string;
  updatedAt: string;
};

export type PortalAuthUser = PortalUser;

export type PortalAuthResponse = {
  user: PortalAuthUser;
  accessToken: string;
};

export type PortalRefreshResponse = {
  accessToken: string;
};

export type PortalLogoutResponse = {
  message: string;
};

export type DeliveryAddress = {
  id: string;
  label: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type PortalOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  amount: number;
};

export type PortalOrder = {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  products: PortalOrderItem[];
  transaction: {
    deliveryFee: number;
    totalAmount: number;
    subTotal: number;
  };
  deliveryAddress: DeliveryAddress | string;
  deliveryMethod:
    | {
        id: string;
        name: string;
        fee: number;
        estimatedDeliveryTime: string;
        isActive: boolean;
        visibility: boolean;
      }
    | string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type PortalOrderCustomerInput = {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  email: string;
  phoneNumber: string;
};

export type PortalOrderDeliveryAddressInput = {
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type PortalOrderStats = {
  totalOrders: number;
  processing: number;
  completed: number;
  cancelled: number;
  inTransit: number;
  totalSpent: number;
};

export type PortalOrderListResponse = {
  success: true;
  orders: PortalOrder[];
};

export type PortalOrderDetailResponse = {
  success: true;
  order: PortalOrder;
};

export type PortalOrderStatsResponse = {
  success: true;
  stats: PortalOrderStats;
};

export type CreatePortalOrderInput = {
  customer: PortalOrderCustomerInput;
  from?: {
    email: string;
  };
  argument?: {
    from?: {
      email: string;
    };
  };
  items: Array<{ productId: string; quantity: number }>;
  deliveryAddress: PortalOrderDeliveryAddressInput;
  deliveryMethod: string;
};

export function normalizeOrderGender(value: string | null | undefined): "male" | "female" {
  return String(value || "")
    .trim()
    .toLowerCase() === "female"
    ? "female"
    : "male";
}

// Portal Quote Types
export type PortalQuoteItem = {
  name: string;
  quantity: number;
};

export type PortalQuoteDetails = {
  items: PortalQuoteItem[];
  note?: string;
  file?: {
    url: string;
    key: string;
  };
};

export type PortalOrderQuote = {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    amount: number;
  }>;
  quoteDetails: PortalQuoteDetails;
  transaction: {
    deliveryFee: number;
    totalAmount: number;
    subTotal: number;
  };
  deliveryAddress: DeliveryAddress;
  deliveryMethod: DeliveryMethod;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type PortalOrderQuoteResponse = {
  success: true;
  order: PortalOrderQuote;
};

export type AdminOrder = PortalOrder;

export type AdminOrderStatus = "processing" | "in-transit" | "cancelled" | "delivered";

export type AdminPaymentStatus = "pending" | "paid" | "failed" | "abandoned" | "reversed";

export type AdminOrderListResponse = {
  success: true;
  orders: AdminOrder[];
};

export type AdminOrderDetailResponse = {
  success: true;
  order: AdminOrder;
};

export type AdminOrderStats = {
  totalOrders: number;
  processing: number;
  delivered: number;
  cancelled: number;
  inTransit: number;
  totalRevenue: number;
};

export type AdminOrderStatsResponse = {
  success: true;
  stats: AdminOrderStats;
};

export type AdminOrderCreateInput = {
  customer: string;
  items: Array<{ productId: string; quantity: number }>;
  deliveryAddress: string;
  deliveryMethod: string;
};

export type AdminOrderUpdateInput = {
  orderStatus?: AdminOrderStatus;
  paymentStatus?: AdminPaymentStatus;
};

export type AdminOrderProductsUpdateInput = {
  products: AdminOrderProductUpdateItem[];
};

export type AdminOrderProductUpdateItem = {
  productId: string;
  quantity: number;
};

export type PortalCreateAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  gender: "male" | "female" | "other" | string;
  dateOfBirth?: string;
};

export type PortalLoginInput = {
  email: string;
  password: string;
};

export type PortalResetPasswordInput = {
  email: string;
};

export type PortalSetNewPasswordInput = {
  password: string;
};

export type AdminProfileUpdateInput = {
  firstName?: string;
  lastName?: string;
  gender?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  image?: File | null;
};

export type AdminAuthUser = AdminUserProfile;

export type AdminAuthResponse = {
  user: AdminAuthUser;
  accessToken: string;
};

export type AdminRefreshResponse = {
  accessToken: string;
};

export type AdminLogoutResponse = {
  message: string;
};

export type AdminCreateAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: string;
  role: string;
  gender: string;
  phoneNumber?: string;
};

export type AdminLoginInput = {
  email: string;
  password: string;
};

export type AdminResetPasswordInput = {
  email: string;
};

export type AdminSetNewPasswordInput = {
  password: string;
};

// App Settings Types
export type App = {
  name: string;
  address: string;
  phoneNumber: string;
  whatsAppNumber: string;
  email: string;
  status: {
    portal: string;
  };
  description: string;
  ratings: number;
  images: string[];
  branding: {
    logo: string;
    logoLight: string;
    logomark: string;
    logomarkLight: string;
  };
};

export type AppInput = {
  name: string;
  address: string;
  phoneNumber: string;
  whatsAppNumber: string;
  email: string;
  status: {
    portal: string;
  };
  description: string;
  ratings: number;
  images: string[];
  branding: {
    logo: string;
    logoLight: string;
    logomark: string;
    logomarkLight: string;
  };
};

export type AppUpdate = Partial<{
  name: string;
  address: string;
  phoneNumber: string;
  whatsAppNumber: string;
  email: string;
  status: {
    portal: string;
  };
  description: string;
  ratings: number;
  images: string[];
  branding: {
    logo: string;
    logoLight: string;
    logomark: string;
    logomarkLight: string;
  };
}>;

export type AppContactUpdate = {
  address?: string;
  phoneNumber?: string;
  whatsAppNumber?: string;
  email?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const makeHeaders = (headers?: HeadersInit) => {
  const next = new Headers(headers);
  next.set("Accept", "application/json");

  const authorization = next.get("Authorization");
  if (authorization) {
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      next.set("Authorization", `Bearer ${token}`);
    } else {
      next.delete("Authorization");
    }
  }

  return next;
};

const MONGO_OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const normalizeDeliveryMethod = (method: DeliveryMethod): DeliveryMethod => ({
  ...method,
  id: MONGO_OBJECT_ID_PATTERN.test(method._id || "") ? method._id! : MONGO_OBJECT_ID_PATTERN.test(method.id) ? method.id : "",
});

const normalizeDeliveryMethods = (methods: DeliveryMethod[]) =>
  methods
    .map(normalizeDeliveryMethod)
    .filter((method) => Boolean(method.id));

type ApiEntityWithId = {
  id?: string;
  _id?: string;
};

const normalizeEntityId = <T extends ApiEntityWithId>(entity: T): T & { id: string } => ({
  ...entity,
  id: MONGO_OBJECT_ID_PATTERN.test(entity._id || "")
    ? entity._id!
    : entity.id || "",
});

const normalizeAdminTeamMember = (
  member: AdminTeamMember & { _id?: string },
): AdminTeamMember => normalizeEntityId(member);

const normalizeOrder = (order: PortalOrder & { _id?: string }): PortalOrder =>
  normalizeEntityId(order);

const normalizeOrders = (orders: (PortalOrder & { _id?: string })[]): PortalOrder[] =>
  (orders || []).map(normalizeOrder).filter((order) => Boolean(order.id));

const normalizeProduct = (product: ProductDetails & { _id?: string }): ProductDetails =>
  normalizeEntityId(product);

const normalizeProducts = (
  response: unknown,
): ProductDetails[] => {
  const products = Array.isArray(response)
    ? response
    : response &&
        typeof response === "object" &&
        Array.isArray((response as { products?: unknown[] }).products)
      ? (response as { products: unknown[] }).products
      : [];

  return products
    .map((product) =>
      product && typeof product === "object"
        ? normalizeProduct(product as ProductDetails & { _id?: string })
        : null,
    )
    .filter((product): product is ProductDetails => Boolean(product?.id));
};

const extractCategoryPayload = (
  response: unknown,
): (AdminCategory & { _id?: string }) | null => {
  if (!response || typeof response !== "object") return null;

  const candidate = response as Record<string, unknown>;
  const nested =
    candidate.category ??
    candidate.data ??
    candidate.item ??
    candidate.result ??
    candidate.categoryDetails ??
    candidate.categoryDetail;

  if (nested && typeof nested === "object") {
    return nested as AdminCategory & { _id?: string };
  }

  return candidate as AdminCategory & { _id?: string };
};

const normalizeCategory = (
  category: AdminCategory & { _id?: string },
): AdminCategory => normalizeEntityId(category);

const normalizeCategoryResponse = (response: unknown): AdminCategory | null => {
  const category = extractCategoryPayload(response);
  if (!category) return null;

  const normalized = normalizeCategory(category);
  return normalized.id ? normalized : null;
};

const normalizeCategories = (response: unknown): AdminCategory[] => {
  const categories = Array.isArray(response)
    ? response
    : response &&
        typeof response === "object" &&
        Array.isArray((response as { categories?: unknown[] }).categories)
      ? (response as { categories: unknown[] }).categories
      : [];

  return categories
    .map((category) =>
      category && typeof category === "object"
        ? normalizeCategory(category as AdminCategory & { _id?: string })
        : null,
    )
    .filter((category): category is AdminCategory => Boolean(category?.id));
};

const getApiRequestUrl = (path: string) => {
  if (typeof window !== "undefined") {
    return `${ZOWKINS_API_BASE}${path}`;
  }

  const base = ZOWKINS_API_BASE.startsWith("http")
    ? ZOWKINS_API_BASE
    : SERVER_ZOWKINS_API_BASE;
  return new URL(`${base}${path}`, base).toString();
};

async function readApiError(response: Response) {
  const text = await response.text().catch(() => "");
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch(e) {}
  console.error("API ERROR TRACE", response.status, response.url, text, payload);

  const msg = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;

  if (response.status === 401) {
    return (
      msg ||
      "Unauthorized. Please sign in again or save a valid admin bearer token in settings."
    );
  }

  return msg || payload?.error || text || response.statusText || "Request failed";
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiRequestUrl(path), {
    ...init,
    credentials: "include",
    headers: makeHeaders(init?.headers),
  });

  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export const zowkinsApi = {
  createAdminAccount(payload: AdminCreateAccountInput) {
    return apiRequest<AdminAuthResponse>("/admin/auth/create-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  loginAdmin(payload: AdminLoginInput) {
    return apiRequest<AdminAuthResponse>("/admin/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  refreshAdminTokens() {
    return apiRequest<AdminRefreshResponse>("/admin/auth/refresh-tokens", {
      method: "POST",
    });
  },
  logoutAdmin() {
    return apiRequest<AdminLogoutResponse>("/admin/auth/logout", {
      method: "POST",
    });
  },
  resetAdminPassword(payload: AdminResetPasswordInput & { redirectUrl?: string }) {
    const params = new URLSearchParams();
    if (payload.redirectUrl) params.set("redirectUrl", payload.redirectUrl);
    const search = params.toString();

    return apiRequest<void>(`/admin/auth/reset-password${search ? `?${search}` : ""}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        argument: { redirectUrl: payload.redirectUrl },
      }),
    });
  },
  setNewAdminPassword(token: string, payload: AdminSetNewPasswordInput) {
    return apiRequest<AdminAuthResponse>(`/admin/auth/set-new-password/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  getAdminUser(id: string, token: string) {
    return apiRequest<AdminUserProfile>(`/admin/users/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  updateAdminMe(token: string, payload: AdminProfileUpdateInput) {
    const formData = new FormData();
    const { image, ...data } = payload;
    formData.set("data", JSON.stringify(data));
    if (image) {
      formData.set("image", image);
    }

    return apiRequest<AdminUserProfile>("/admin/users/me", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },
  updateAdminPassword(token: string, payload: { currentPassword: string; newPassword: string }) {
    return apiRequest<AdminUserProfile>("/admin/users/me/password", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  listAdminProducts(token: string) {
    return apiRequest<ProductDetails[]>("/admin/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  listProducts() {
    return apiRequest<unknown>("/products").then((response) => normalizeProducts(response));
  },
  getAdminProductStats(token: string) {
    return apiRequest<AdminProductStatsResponse>("/admin/products/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getAdminProduct(token: string, id: string) {
    return apiRequest<ProductDetails>(`/admin/products/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  createAdminProduct(token: string, payload: AdminProductInput) {
    const formData = new FormData();
    const { file, ...data } = payload;
    formData.set("data", JSON.stringify(data));
    if (file) {
      formData.set("file", file);
    }

    return apiRequest<ProductDetails>("/admin/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },
  updateAdminProduct(token: string, id: string, payload: AdminProductInput) {
    const formData = new FormData();
    const { file, ...data } = payload;
    formData.set("data", JSON.stringify(data));
    if (file) {
      formData.set("file", file);
    }

    return apiRequest<ProductDetails>(`/admin/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },
  deleteAdminProduct(token: string, id: string) {
    return apiRequest<void>(`/admin/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  createAdminDeliveryMethod(token: string, payload: AdminDeliveryMethodInput) {
    return apiRequest<DeliveryMethod>("/admin/delivery-methods", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  listAdminDeliveryMethods(
    token: string,
    query?: {
      name?: string;
      isActive?: string;
      visibility?: string;
    },
  ) {
    const params = new URLSearchParams();
    if (query?.name) params.set("name", query.name);
    if (query?.isActive) params.set("isActive", query.isActive);
    if (query?.visibility) params.set("visibility", query.visibility);
    const search = params.toString();

    return apiRequest<DeliveryMethod[]>(`/admin/delivery-methods${search ? `?${search}` : ""}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getAdminDeliveryMethod(token: string, deliveryMethodId: string) {
    return apiRequest<DeliveryMethod>(`/admin/delivery-methods/${encodeURIComponent(deliveryMethodId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  updateAdminDeliveryMethod(token: string, deliveryMethodId: string, payload: AdminDeliveryMethodInput) {
    return apiRequest<DeliveryMethod>(`/admin/delivery-methods/${encodeURIComponent(deliveryMethodId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  deleteAdminDeliveryMethod(token: string, deliveryMethodId: string) {
    return apiRequest<void>(`/admin/delivery-methods/${encodeURIComponent(deliveryMethodId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  createAdminCategory(token: string, payload: AdminCategoryInput) {
    const formData = new FormData();
    const { file, ...data } = payload;
    formData.set("data", JSON.stringify(data));
    if (file) {
      formData.set("file", file);
    }

    return apiRequest<unknown>("/admin/categories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then((response) => {
      const category = normalizeCategoryResponse(response);
      if (!category) {
        throw new Error("Category response is missing an id.");
      }
      return category;
    });
  },
  listAdminCategories(token: string) {
    return apiRequest<unknown>("/admin/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => normalizeCategories(response));
  },
  getAdminCategory(token: string, id: string) {
    return apiRequest<unknown>(`/admin/categories/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      const category = normalizeCategoryResponse(response);
      if (!category) {
        throw new Error("Category response is missing an id.");
      }
      return category;
    });
  },
  updateAdminCategory(token: string, id: string, payload: AdminCategoryInput) {
    const formData = new FormData();
    const { file, ...data } = payload;
    formData.set("data", JSON.stringify(data));
    if (file) {
      formData.set("file", file);
    }

    return apiRequest<unknown>(`/admin/categories/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then((response) => {
      const category = normalizeCategoryResponse(response);
      if (!category) {
        throw new Error("Category response is missing an id.");
      }
      return category;
    });
  },
  deleteAdminCategory(token: string, id: string) {
    return apiRequest<void>(`/admin/categories/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  listAdminCustomers(
    token: string,
    query?: {
      status?: string;
      isReferralPartner?: boolean;
    },
  ) {
    const params = new URLSearchParams();
    if (query?.status) params.set("status", query.status);
    if (typeof query?.isReferralPartner === "boolean") params.set("isReferralPartner", String(query.isReferralPartner));
    const search = params.toString();

    return apiRequest<AdminCustomer[]>(`/admin/customers${search ? `?${search}` : ""}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getAdminCustomerStats(token: string) {
    return apiRequest<AdminCustomerStatsResponse>("/admin/customers/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  listAdminNonReferralCustomers(token: string) {
    return this.listAdminCustomers(token, {
      isReferralPartner: false,
    });
  },
  getAdminCustomer(token: string, userId: string) {
    return apiRequest<AdminCustomer>(`/admin/customers/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  updateAdminCustomer(token: string, userId: string, payload: AdminCustomerUpdateInput) {
    return apiRequest<void>(`/admin/customers/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  deleteAdminCustomer(token: string, userId: string) {
    return apiRequest<void>(`/admin/customers/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  createAdminOrder(token: string, payload: AdminOrderCreateInput) {
    return apiRequest<AdminOrderDetailResponse>("/admin/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((res) => ({
      ...res,
      order: normalizeOrder(res.order as AdminOrder & { _id?: string }),
    }));
  },
  listAdminOrders(
    token: string,
    query?: {
      orderStatus?: string;
      paymentStatus?: string;
      customer?: string;
      referralPartner?: string;
      sortBy?: string;
      limit?: number;
      page?: number;
    },
  ) {
    const params = new URLSearchParams();
    if (query?.orderStatus) params.set("orderStatus", query.orderStatus);
    if (query?.paymentStatus) params.set("paymentStatus", query.paymentStatus);
    if (query?.customer) params.set("customer", query.customer);
    if (query?.referralPartner) params.set("referralPartner", query.referralPartner);
    if (query?.sortBy) params.set("sortBy", query.sortBy);
    if (typeof query?.limit === "number") params.set("limit", String(query.limit));
    if (typeof query?.page === "number") params.set("page", String(query.page));
    const search = params.toString();

    return apiRequest<AdminOrderListResponse>(`/admin/orders${search ? `?${search}` : ""}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => ({
      ...res,
      orders: normalizeOrders(res.orders as (AdminOrder & { _id?: string })[]),
    }));
  },
  getAdminOrderStats(token: string) {
    return apiRequest<AdminOrderStatsResponse>("/admin/orders/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getAdminOrder(token: string, orderId: string) {
    return apiRequest<AdminOrderDetailResponse>(`/admin/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => ({
      ...res,
      order: normalizeOrder(res.order as AdminOrder & { _id?: string }),
    }));
  },
  updateAdminOrder(token: string, orderId: string, payload: AdminOrderUpdateInput) {
    return apiRequest<AdminOrderDetailResponse>(`/admin/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((res) => ({
      ...res,
      order: normalizeOrder(res.order as AdminOrder & { _id?: string }),
    }));
  },
  updateAdminOrderProducts(token: string, orderId: string, payload: AdminOrderProductsUpdateInput) {
    return apiRequest<AdminOrderDetailResponse>(`/admin/orders/${encodeURIComponent(orderId)}/products`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((res) => ({
      ...res,
      order: normalizeOrder(res.order as AdminOrder & { _id?: string }),
    }));
  },
  listAdminTeam(token: string) {
    return apiRequest<AdminTeamMember[]>("/admin/team", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((members) =>
      members
        .map((member) => normalizeAdminTeamMember(member as AdminTeamMember & { _id?: string }))
        .filter((member) => Boolean(member.id)),
    );
  },
  inviteAdminTeamMember(token: string, payload: AdminTeamInviteInput & { redirectUrl?: string }) {
    const params = new URLSearchParams();
    if (payload.redirectUrl) params.set("redirectUrl", payload.redirectUrl);
    const search = params.toString();

    return apiRequest<void>(`/admin/team/invite-member${search ? `?${search}` : ""}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        argument: { redirectUrl: payload.redirectUrl },
      }),
    });
  },
  acceptAdminTeamInvite(token: string, payload: AdminTeamAcceptInviteInput) {
    return apiRequest<{ user: AdminTeamMember; accessToken: string }>(`/admin/team/accept-invite/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((response) => ({
      ...response,
      user: normalizeAdminTeamMember(response.user as AdminTeamMember & { _id?: string }),
    }));
  },
  resendAdminTeamInvite(token: string, memberId: string, payload?: { redirectUrl?: string }) {
    const params = new URLSearchParams();
    if (payload?.redirectUrl) {
      params.set("redirectUrl", payload.redirectUrl);
    }
    const search = params.toString();

    return apiRequest<void>(
      `/admin/team/resend-invite/${encodeURIComponent(memberId)}${search ? `?${search}` : ""}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: payload
          ? JSON.stringify({
              ...payload,
              argument: { redirectUrl: payload.redirectUrl },
            })
          : undefined,
      },
    );
  },
  updateAdminTeamMember(token: string, memberId: string, payload: AdminTeamUpdateInput) {
    return apiRequest<AdminTeamMember>(`/admin/team/${encodeURIComponent(memberId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((member) => normalizeAdminTeamMember(member as AdminTeamMember & { _id?: string }));
  },
  deleteAdminTeamMember(token: string, memberId: string) {
    return apiRequest<AdminTeamMember>(`/admin/team/${encodeURIComponent(memberId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  listDeliveryMethods() {
    return apiRequest<DeliveryMethod[]>("/delivery-methods").then(normalizeDeliveryMethods);
  },
  listCategories(query?: { page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (typeof query?.page === "number") params.set("page", String(query.page));
    if (typeof query?.limit === "number") params.set("limit", String(query.limit));
    const search = params.toString();

    return apiRequest<CategoryListResponse>(`/categories${search ? `?${search}` : ""}`);
  },
  getCategoryBySlug(slug: string) {
    return apiRequest<CategoryDetails>(`/categories/${encodeURIComponent(slug)}`);
  },
  listCategoryProducts(
    slug: string,
    query?: { page?: number; limit?: number; minPrice?: number; maxPrice?: number; subcategories?: string[] },
  ) {
    const params = new URLSearchParams();
    if (typeof query?.page === "number") params.set("page", String(query.page));
    if (typeof query?.limit === "number") params.set("limit", String(query.limit));
    if (typeof query?.minPrice === "number") params.set("minPrice", String(query.minPrice));
    if (typeof query?.maxPrice === "number") params.set("maxPrice", String(query.maxPrice));
    query?.subcategories?.forEach((sub) => params.append("subcategories", sub));
    const search = params.toString();

    return apiRequest<CategoryProductsResponse>(
      `/categories/${encodeURIComponent(slug)}/products${search ? `?${search}` : ""}`,
    );
  },
  createPortalAccount(payload: PortalCreateAccountInput) {
    return apiRequest<PortalAuthResponse>("/portal/auth/create-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  loginPortal(payload: PortalLoginInput) {
    return apiRequest<PortalAuthResponse>("/portal/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  refreshPortalTokens() {
    return apiRequest<PortalRefreshResponse>("/portal/auth/refresh-tokens", {
      method: "POST",
    });
  },
  logoutPortal() {
    return apiRequest<PortalLogoutResponse>("/portal/auth/logout", {
      method: "POST",
    });
  },
  resetPortalPassword(payload: PortalResetPasswordInput & { redirectUrl?: string }) {
    const params = new URLSearchParams();
    if (payload.redirectUrl) params.set("redirectUrl", payload.redirectUrl);
    const search = params.toString();

    return apiRequest<void>(`/portal/auth/reset-password${search ? `?${search}` : ""}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        argument: { redirectUrl: payload.redirectUrl },
      }),
    });
  },
  setNewPortalPassword(token: string, payload: PortalSetNewPasswordInput) {
    return apiRequest<PortalAuthResponse>(`/portal/auth/set-new-password/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  getProductBySlug(slug: string) {
    return apiRequest<ProductDetails>(`/products/${encodeURIComponent(slug)}`);
  },
  getPortalMe(token: string) {
    return apiRequest<PortalUser>("/portal/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  updatePortalMe(
    token: string,
    payload: Partial<Pick<PortalUser, "firstName" | "lastName" | "phoneNumber" | "gender" | "dateOfBirth">>,
  ) {
    return apiRequest<PortalUser>("/portal/users/me", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  updatePortalPassword(token: string, payload: { currentPassword: string; newPassword: string }) {
    return apiRequest<PortalUser>("/portal/users/me/password", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  createPortalOrder(token: string | null | undefined, payload: CreatePortalOrderInput) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Ensure from and argument are populated if missing, as they seem to be required by some backends
    const finalPayload = {
      ...payload,
      from: payload.from || { email: payload.customer.email },
      argument: payload.argument || { from: { email: payload.customer.email } },
    };

    return apiRequest<{ success: true; order: PortalOrder }>("/portal/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(finalPayload),
    }).then((res) => ({
      ...res,
      order: normalizeOrder(res.order as PortalOrder & { _id?: string }),
    }));
  },
  listPortalOrders(token: string, query?: { sortBy?: string; limit?: number; page?: number }) {
    const params = new URLSearchParams();
    if (query?.sortBy) params.set("sortBy", query.sortBy);
    if (typeof query?.limit === "number") params.set("limit", String(query.limit));
    if (typeof query?.page === "number") params.set("page", String(query.page));
    const search = params.toString();

    return apiRequest<PortalOrderListResponse>(`/portal/orders${search ? `?${search}` : ""}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => ({
      ...res,
      orders: normalizeOrders(res.orders as (PortalOrder & { _id?: string })[]),
    }));
  },
  getPortalOrder(token: string, orderId: string) {
    return apiRequest<PortalOrderDetailResponse>(`/portal/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => ({
      ...res,
      order: normalizeOrder(res.order as PortalOrder & { _id?: string }),
    }));
  },
  getRecentPortalOrders(token: string) {
    return apiRequest<PortalOrderListResponse>("/portal/orders/recent", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => ({
      ...res,
      orders: normalizeOrders(res.orders as (PortalOrder & { _id?: string })[]),
    }));
  },
  getPortalOrderStats(token: string) {
    return apiRequest<PortalOrderStatsResponse>("/portal/orders/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  createDeliveryAddress(token: string, userId: string, payload: Omit<DeliveryAddress, "id">) {
    return apiRequest<DeliveryAddress>(`/portal/delivery-address/${encodeURIComponent(userId)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
  listDeliveryAddresses(token: string, userId: string) {
    return apiRequest<DeliveryAddress[]>(`/portal/delivery-address/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getDeliveryAddress(token: string, userId: string, addressId: string) {
    return apiRequest<DeliveryAddress>(
      `/portal/delivery-address/${encodeURIComponent(userId)}/${encodeURIComponent(addressId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
  updateDeliveryAddress(
    token: string,
    userId: string,
    addressId: string,
    payload: Omit<DeliveryAddress, "id">,
  ) {
    return apiRequest<DeliveryAddress>(
      `/portal/delivery-address/${encodeURIComponent(userId)}/${encodeURIComponent(addressId)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
  },
  deleteDeliveryAddress(token: string, userId: string, addressId: string) {
    return apiRequest<void>(
      `/portal/delivery-address/${encodeURIComponent(userId)}/${encodeURIComponent(addressId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

// Portal Quote
  requestPortalQuote(
    token: string | null | undefined,
    payload:
      | {
          data: string;
          file?: File;
        }
      | {
          customer: {
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
          };
          items: Array<{ name: string; quantity: number }>;
          deliveryAddress: {
            phoneNumber: string;
            street: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
          };
          note?: string;
          file?: File;
        },
  ) {
    const formData = new FormData();

    if ("data" in payload) {
      formData.set("data", payload.data);
    } else {
      const data = {
        customer: payload.customer,
        items: payload.items,
        deliveryAddress: payload.deliveryAddress,
        note: payload.note,
      };

      formData.set("data", JSON.stringify(data));
    }

    if (payload.file) {
      formData.set("file", payload.file);
    }

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return apiRequest<PortalOrderQuoteResponse>("/portal/orders/quote", {
      method: "POST",
      headers,
      body: formData,
    });
  },

  // App Settings
  getApp() {
    return apiRequest<{ app: App }>("/app");
  },

  createApp(token: string, payload: AppInput) {
    return apiRequest<{ app: App }>("/app", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  updateApp(token: string, payload: AppUpdate) {
    return apiRequest<{ app: App }>("/app", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  updateAppContact(token: string, payload: AppContactUpdate) {
    return apiRequest<{ app: App }>("/app/contact", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
};
