"use client";

import dynamic from "next/dynamic";
import { useIsCapacitor } from "@/lib/capacitor";

const MobileWelcome = dynamic(() => import("./MobileWelcome"), { ssr: false });

export default function LandingOrMobileWelcome({
  landing,
}: {
  landing: React.ReactNode;
}) {
  const isNative = useIsCapacitor();

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
