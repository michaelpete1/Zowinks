"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zowkinsApi, DeliveryMethod, DeliveryAddress, ProductDetails, PortalUser, CreatePortalOrderInput, normalizeOrderGender } from "../../../../lib/zowkins-api";
import PortalNavbar from "../../../../components/PortalNavbar";

const MONGO_OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export default function CreatePortalOrderPage() {
  const router = useRouter();

  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([]);
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<string>("");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("portalToken");
      if (!token) {
        setError("Please sign in to create an order");
        return;
      }

      const [productsResponse, deliveryMethodsResponse, userResponse] = await Promise.all([
        fetch("/api/zowkins/v1/products").then(res => res.json()),
        zowkinsApi.listDeliveryMethods(),
        zowkinsApi.getPortalMe(token),
      ]);

      // Filter only visible and in-stock products
      const availableProducts = productsResponse.filter((product: ProductDetails) => 
        product.visible && product.inStock
      );
      setProducts(availableProducts);
      const availableDeliveryMethods = deliveryMethodsResponse.filter(
        (method) =>
          method.isActive &&
          method.visibility &&
          MONGO_OBJECT_ID_PATTERN.test(method.id),
      );
      setDeliveryMethods(availableDeliveryMethods);
      setUser(userResponse);
      setSelectedGender(normalizeOrderGender(userResponse.gender));

      // Fetch delivery addresses for the user
      const addresses = await zowkinsApi.listDeliveryAddresses(token, userResponse.id);
      setDeliveryAddresses(addresses);

      // Set default selections
      if (addresses.length > 0) {
        setSelectedDeliveryAddress(addresses[0].id);
      }
      if (availableDeliveryMethods.length > 0) {
        setSelectedDeliveryMethod(availableDeliveryMethods[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleProductQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
    } else {
      setSelectedProducts(prev => {
        const existing = prev.find(p => p.productId === productId);
        if (existing) {
          return prev.map(p => p.productId === productId ? { ...p, quantity } : p);
        } else {
          return [...prev, { productId, quantity }];
        }
      });
    }
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, { productId, quantity }) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const calculateDeliveryFee = () => {
    const method = deliveryMethods.find(m => m.id === selectedDeliveryMethod);
    return method ? method.fee : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      setError("Please select at least one product");
      return;
    }

    if (!selectedDeliveryAddress) {
      setError("Please select a delivery address");
      return;
    }

    if (!selectedDeliveryMethod) {
      setError("Please select a delivery method");
      return;
    }

    if (!MONGO_OBJECT_ID_PATTERN.test(selectedDeliveryMethod)) {
      setError("Please select a valid delivery method");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("portalToken");
      if (!token) {
        throw new Error("Please sign in to create an order");
      }

      if (!user) {
        throw new Error("Customer information is not loaded yet");
      }

      const selectedAddressData = deliveryAddresses.find((address) => address.id === selectedDeliveryAddress);
      if (!selectedAddressData) {
        throw new Error("Please select a valid delivery address");
      }

      const orderData: CreatePortalOrderInput = {
        customer: {
          firstName: user.firstName,
          lastName: user.lastName,
          gender: selectedGender,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        from: {
          email: user.email,
        },
        argument: {
          from: {
            email: user.email,
          },
        },
        items: selectedProducts,
        deliveryAddress: {
          phoneNumber: selectedAddressData.phoneNumber,
          street: selectedAddressData.street,
          city: selectedAddressData.city,
          state: selectedAddressData.state,
          country: selectedAddressData.country,
          postalCode: selectedAddressData.postalCode,
        },
        deliveryMethod: selectedDeliveryMethod,
      };

      const response = await zowkinsApi.createPortalOrder(token, orderData);
      
      // Redirect to order details
      router.push(`/portal/orders/${response.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
        <PortalNavbar />
        <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#050b16_0%,#07142a_48%,#0b1d3b_100%)] text-slate-100">
      <PortalNavbar />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <Link 
            href="/portal/orders" 
            className="mb-4 inline-block text-[#f3c74d] hover:underline"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Create New Order</h1>
          <p className="mt-2 text-slate-300">Select products and delivery options</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Customer Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">First name</label>
                <input
                  value={user?.firstName || ""}
                  readOnly
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Last name</label>
                <input
                  value={user?.lastName || ""}
                  readOnly
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                <input
                  value={user?.email || ""}
                  readOnly
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Phone number</label>
                <input
                  value={user?.phoneNumber || ""}
                  readOnly
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Gender</label>
                <select
                  value={selectedGender}
                  onChange={(event) =>
                    setSelectedGender(event.target.value === "female" ? "female" : "male")
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0a1020] px-4 py-3 text-white outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Selection */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Select Products</h2>
            {products.length === 0 ? (
              <p className="text-slate-300">No available products found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {products.map((product) => {
                  const selectedProduct = selectedProducts.find(p => p.productId === product.id);
                  const quantity = selectedProduct?.quantity || 0;
                  
                  return (
                    <div key={product.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{product.name}</h3>
                          <p className="text-sm text-slate-300 line-clamp-2">{product.description}</p>
                          <p className="mt-2 font-semibold text-[#f3c74d]">₦{product.price.toLocaleString()}</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleProductQuantityChange(product.id, Math.max(0, quantity - 1))}
                            className="rounded-full border border-white/10 bg-white/5 p-1 text-white transition hover:bg-white/10"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center text-white">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleProductQuantityChange(product.id, quantity + 1)}
                            className="rounded-full border border-white/10 bg-white/5 p-1 text-white transition hover:bg-white/10"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delivery Options */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Delivery Address */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Delivery Address</h2>
              {deliveryAddresses.length === 0 ? (
                <div>
                  <p className="mb-4 text-slate-300">No delivery addresses found.</p>
                  <Link 
                    href="/portal/profile" 
                    className="inline-block rounded-full bg-[#f3c74d] px-4 py-2 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935]"
                  >
                    Add Delivery Address
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveryAddresses.map((address) => (
                    <label key={address.id} className="flex cursor-pointer items-start space-x-3">
                      <input
                        type="radio"
                        name="deliveryAddress"
                        value={address.id}
                        checked={selectedDeliveryAddress === address.id}
                        onChange={(e) => setSelectedDeliveryAddress(e.target.value)}
                        className="mt-1 h-4 w-4 text-[#f3c74d] focus:ring-[#f3c74d]"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{address.label}</p>
                        <p className="text-sm text-slate-300">
                          {address.street}, {address.city}, {address.state}
                        </p>
                        <p className="text-xs text-slate-400">
                          {address.country}, {address.postalCode} • {address.phoneNumber}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Method */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Delivery Method</h2>
              {deliveryMethods.length === 0 ? (
                <p className="text-slate-300">No delivery methods available.</p>
              ) : (
                <div className="space-y-3">
                  {deliveryMethods
                    .filter(method => method.isActive && method.visibility)
                    .map((method) => (
                      <label key={method.id} className="flex cursor-pointer items-start space-x-3">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={method.id}
                          checked={selectedDeliveryMethod === method.id}
                          onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
                          className="mt-1 h-4 w-4 text-[#f3c74d] focus:ring-[#f3c74d]"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-white">{method.name}</p>
                          <p className="text-sm text-slate-300">{method.estimatedDeliveryTime}</p>
                          <p className="text-sm font-medium text-[#f3c74d]">₦{method.fee.toLocaleString()}</p>
                        </div>
                      </label>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {selectedProducts.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Subtotal ({selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} items):</span>
                  <span className="text-white">₦{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Delivery Fee:</span>
                  <span className="text-white">₦{calculateDeliveryFee().toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-white">Total:</span>
                    <span className="text-xl font-bold text-[#f3c74d]">₦{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/portal/orders"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#f3c74d]/45 hover:bg-white/10"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || selectedProducts.length === 0}
              className="rounded-full bg-[#f3c74d] px-6 py-3 text-sm font-semibold text-[#050b16] transition hover:bg-[#e4b935] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating Order..." : "Create Order"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
