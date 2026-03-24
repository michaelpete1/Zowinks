"use client";

import { create } from "zustand";

export type OrderRecord = {
  id: string;
  customer: string;
  item: string;
  amount: string;
  status: "Delivered" | "Processing" | "Pending";
  destination: string;
  updated: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  status: "Active" | "Lead" | "Returning";
  lastOrder: string;
};

export type CategoryRecord = {
  id: string;
  name: string;
  description: string;
  productCount: number;
  visibility: "Visible" | "Hidden";
  image?: string;
};

const initialOrders: OrderRecord[] = [
  { id: "ORD-2042", customer: "Nova Logistics", item: "HP EliteBook 840 G11", amount: "₦3,747", status: "Delivered", destination: "Lagos", updated: "2h ago" },
  { id: "ORD-2041", customer: "Apex Finance", item: "Dell Latitude 7650", amount: "₦7,554", status: "Processing", destination: "Abuja", updated: "6h ago" },
  { id: "ORD-2040", customer: "Bluewave Group", item: "Lenovo ThinkPad T14", amount: "₦2,196", status: "Pending", destination: "Port Harcourt", updated: "1d ago" },
];

const initialCustomers: CustomerRecord[] = [
  { id: "CUS-301", name: "Amina Yusuf", company: "Meridian Health", email: "amina@meridianhealth.ng", phone: "+234 801 555 9012", location: "Lagos", status: "Lead", lastOrder: "No orders yet" },
  { id: "CUS-300", name: "Chinedu Okoye", company: "Swift Logistics", email: "chinedu@swiftlogistics.ng", phone: "+234 809 222 4411", location: "Abuja", status: "Returning", lastOrder: "2 laptops + accessories" },
  { id: "CUS-299", name: "Favour John", company: "Apex Media", email: "favour@apexmedia.ng", phone: "+234 803 778 1100", location: "Port Harcourt", status: "Active", lastOrder: "1 desktop + docking station" },
];

const initialCategories: CategoryRecord[] = [
  { id: "CAT-100", name: "Laptops", description: "Business laptops and premium notebooks.", productCount: 5, visibility: "Visible", image: "/mb.jpg" },
  { id: "CAT-101", name: "Desktops", description: "Office desktops and compact towers.", productCount: 2, visibility: "Visible", image: "/desktop.jpg" },
  { id: "CAT-102", name: "Accessories", description: "Peripherals, docks, printers, and everyday add-ons.", productCount: 2, visibility: "Visible", image: "/keyboard.jpg" },
  { id: "CAT-103", name: "Networking", description: "Routers, switches, and connectivity tools.", productCount: 0, visibility: "Hidden", image: "/d.jpg" },
];

interface AdminRecordsState {
  orders: OrderRecord[];
  customers: CustomerRecord[];
  categories: CategoryRecord[];
  setOrders: (orders: OrderRecord[] | ((current: OrderRecord[]) => OrderRecord[])) => void;
  setCustomers: (
    customers: CustomerRecord[] | ((current: CustomerRecord[]) => CustomerRecord[]),
  ) => void;
  setCategories: (
    categories: CategoryRecord[] | ((current: CategoryRecord[]) => CategoryRecord[]),
  ) => void;
  toggleOrderStatus: (id: string) => void;
  toggleCustomerStatus: (id: string) => void;
}

export const useAdminRecords = create<AdminRecordsState>()((set) => ({
  orders: initialOrders,
  customers: initialCustomers,
  categories: initialCategories,
  setOrders: (orders) =>
    set((state) => ({
      orders: typeof orders === "function" ? orders(state.orders) : orders,
    })),
  setCustomers: (customers) =>
    set((state) => ({
      customers: typeof customers === "function" ? customers(state.customers) : customers,
    })),
  setCategories: (categories) =>
    set((state) => ({
      categories: typeof categories === "function" ? categories(state.categories) : categories,
    })),
  toggleOrderStatus: (id) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: order.status === "Delivered" ? "Pending" : "Delivered",
              updated: "Just now",
            }
          : order,
      ),
    })),
  toggleCustomerStatus: (id) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === id
          ? {
              ...customer,
              status: customer.status === "Lead" ? "Active" : "Returning",
            }
          : customer,
      ),
    })),
}));
