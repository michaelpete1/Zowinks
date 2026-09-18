"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NewNavbar from "../../components/NewNavbar";
import PortalBanner from "../../components/PortalBanner";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("portalToken");
    if (!token) router.replace("/portal/auth/login");
  }, [router]);

  return (
    <>
      <NewNavbar />
      <div className="min-h-screen bg-[#07142a] text-slate-100">
        <PortalBanner />
        <div>{children}</div>
      </div>
    </>
  );
}
