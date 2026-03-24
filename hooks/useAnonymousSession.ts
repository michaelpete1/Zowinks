"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "zowkins-anon-session";

function createSessionId() {
  return `SES-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function useAnonymousSession() {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      setSessionId(existing);
      return;
    }

    const next = createSessionId();
    window.localStorage.setItem(STORAGE_KEY, next);
    setSessionId(next);
  }, []);

  return sessionId;
}
