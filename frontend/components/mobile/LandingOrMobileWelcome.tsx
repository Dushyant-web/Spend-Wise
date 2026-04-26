"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsCapacitor } from "@/lib/capacitor";

const MobileWelcome = dynamic(() => import("./MobileWelcome"), { ssr: false });

const IS_ADMIN_BUILD = process.env.NEXT_PUBLIC_APP_MODE === "admin";

export default function LandingOrMobileWelcome({
  landing,
}: {
  landing: React.ReactNode;
}) {
  const isNative = useIsCapacitor();
  const router = useRouter();

  useEffect(() => {
    if (IS_ADMIN_BUILD) router.replace("/admin/dashboard");
  }, [router]);

  if (IS_ADMIN_BUILD) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#060504",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(255,255,255,0.15)", borderTopColor: "#FF5267" }}
        />
      </div>
    );
  }

  // null = first paint / SSR — render nothing briefly to avoid flashing the landing on app
  if (isNative === null) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#0a0a18",
        }}
      />
    );
  }

  if (isNative) return <MobileWelcome />;
  return <>{landing}</>;
}
