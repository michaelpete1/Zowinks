"use client";

import { useCallback, useEffect, useState } from "react";

export type AdminRole = "admin";

export interface AdminSession {
  id?: string;
  role: AdminRole;
  name: string;
  email: string;
  loggedInAt: string;
  accessToken?: string;
}

const STORAGE_KEY = "zowkins-session";
const ADMIN_API_TOKEN_KEY = "zowkins-admin-access-token";

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
    if (session.accessToken) {
      window.localStorage.setItem(ADMIN_API_TOKEN_KEY, session.accessToken);
    } else {
      window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
    }
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ADMIN_API_TOKEN_KEY);
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

  const signInAdmin = useCallback(
    (name: string, email: string, accessToken?: string, id?: string) => {
      persistSession({
        id,
        role: "admin",
        name,
        email,
        loggedInAt: new Date().toISOString(),
        accessToken,
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
    signInAdmin,
    clearSession,
  };
}
