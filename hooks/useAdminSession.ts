"use client";

import { useCallback, useEffect, useState } from "react";

export type AdminRole = "customer" | "admin";

export interface AdminSession {
  role: AdminRole;
  name: string;
  email: string;
  loggedInAt: string;
}

export const ADMIN_CREDENTIALS = {
  email: "admin@zowkins.com",
  password: "Admin@1234",
};

const STORAGE_KEY = "zowkins-session";

const readSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
};

const writeSession = (session: AdminSession | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  const persistSession = useCallback((next: AdminSession | null) => {
    setSession(next);
    writeSession(next);
  }, []);

  const signInCustomer = useCallback(
    (name: string, email: string) => {
      persistSession({
        role: "customer",
        name,
        email,
        loggedInAt: new Date().toISOString(),
      });
    },
    [persistSession],
  );

  const signInAdmin = useCallback(
    (name: string, email: string) => {
      persistSession({
        role: "admin",
        name,
        email,
        loggedInAt: new Date().toISOString(),
      });
    },
    [persistSession],
  );

  const clearSession = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  return {
    session,
    ready,
    isAdmin: session?.role === "admin",
    signInCustomer,
    signInAdmin,
    clearSession,
  };
}
