"use client";

import { useIsCapacitor } from "@/lib/capacitor";

export default function HideOnCapacitor({ children }: { children: React.ReactNode }) {
  const isNative = useIsCapacitor();
  if (isNative) return null;
  return <>{children}</>;
}
