"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LOCATION_STORAGE_KEY, findLocationBySlug } from "@/lib/locations";

/**
 * On mount, if a remembered location slug is present, redirect to the
 * matching per-location page. Otherwise stay on the picker.
 */
export function PickerRedirect({ mode }: { mode: "bestill" | "meny" }) {
  const router = useRouter();
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored && findLocationBySlug(stored)) {
        router.replace(`/${mode}/${stored}`);
      }
    } catch {
      // ignore
    }
  }, [router, mode]);
  return null;
}
