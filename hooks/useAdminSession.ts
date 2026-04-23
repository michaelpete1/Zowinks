"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, zowkinsApi } from "../lib/zowkins-api";

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
const ADMIN_SESSION_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

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
  const refreshPromiseRef = useRef<Promise<AdminSession | null> | null>(null);

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  const persistSession = useCallback((next: AdminSession | null) => {
    setSession(next);
    writeSession(next);
  }, []);

  const refreshAdminSession = useCallback(async () => {
    const current = readSession() ?? session;
    if (!current?.accessToken) {
      return null;
    }

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = zowkinsApi
      .refreshAdminTokens()
      .then((response) => {
        const nextSession: AdminSession = {
          ...current,
          accessToken: response.accessToken,
        };
        persistSession(nextSession);
        return nextSession;
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          return null;
        }

        return null;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [persistSession, session]);

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

  useEffect(() => {
    if (!ready || !session?.accessToken) {
      return;
    }

    void refreshAdminSession();

    const refreshTimer = window.setInterval(() => {
      void refreshAdminSession();
    }, ADMIN_SESSION_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshAdminSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [ready, refreshAdminSession, session?.accessToken]);

  return {
    session,
    ready,
    isAdmin: session?.role === "admin",
    signInAdmin,
    clearSession,
    refreshAdminSession,
  };
}
