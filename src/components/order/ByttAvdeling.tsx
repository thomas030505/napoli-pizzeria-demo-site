"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LOCATION_STORAGE_KEY } from "@/lib/locations";

export function ByttAvdelingLink({ mode }: { mode: "bestill" | "meny" }) {
  function handleClick() {
    try {
      window.localStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <Link
      href={`/${mode}`}
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-[color:var(--color-pomodoro)] transition-colors"
    >
      <ChevronLeft className="h-4 w-4" />
      Bytt avdeling
    </Link>
  );
}
