"use client";

import { useEffect, useState } from "react";

export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor injects a global; on web it stays undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor;
  return !!cap?.isNativePlatform?.() || !!cap?.platform && cap.platform !== "web";
}

export function useIsCapacitor(): boolean | null {
  // null = not yet determined (SSR / first render). Avoids flash.
  const [isNative, setIsNative] = useState<boolean | null>(null);
  useEffect(() => {
    setIsNative(isCapacitorNative());
  }, []);
  return isNative;
}
