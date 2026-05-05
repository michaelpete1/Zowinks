"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminAcceptInviteLegacyPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  useEffect(() => {
    if (!token) return;

    const search = typeof window === "undefined" ? "" : window.location.search;
    router.replace(
      `/admin/auth/accept-invite/${encodeURIComponent(String(token))}${search}`,
    );
  }, [router, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 text-center">
        <h2 className="text-2xl font-extrabold text-gray-900">
          Redirecting…
        </h2>
        <p className="text-sm text-gray-600">
          If you are not redirected automatically, use the link below.
        </p>
        <Link
          href="/admin/auth"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Go to Admin Sign In
        </Link>
      </div>
    </div>
  );
}

