"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // If already signed in, send to profile; otherwise go to login
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("portalToken") : null;
      if (token) router.replace("/portal/profile");
      else router.replace("/portal/auth/login");
    } catch (e) {
      router.replace("/portal/auth/login");
    }
  }, [router]);

  return null;
}
