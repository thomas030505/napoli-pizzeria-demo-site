"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import {
  LOCATION_STORAGE_KEY,
  findLocationBySlug,
} from "@/lib/locations";

type NavItem = { href: string; key: string; label: string };

const NAV_BASE: NavItem[] = [
  { key: "meny", href: "/meny", label: "Meny" },
  { key: "bestill", href: "/bestill", label: "Bestill" },
  { key: "om-oss", href: "/om-oss", label: "Om oss" },
  { key: "lokasjoner", href: "/lokasjoner", label: "Lokasjoner" },
  { key: "kontakt", href: "/kontakt", label: "Kontakt" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [rememberedSlug, setRememberedSlug] = useState<string | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Transparent over dark hero only on home page until user scrolls
  const onDarkHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored && findLocationBySlug(stored)) setRememberedSlug(stored);
    } catch {
      // ignore
    }
  }, [pathname]);

  const NAV: NavItem[] = NAV_BASE.map((item) => {
    if (rememberedSlug && (item.key === "bestill" || item.key === "meny")) {
      return { ...item, href: `/${item.key}/${rememberedSlug}` };
    }
    return item;
  });
  const bestillHref = rememberedSlug ? `/bestill/${rememberedSlug}` : "/bestill";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        onDarkHero
          ? "bg-transparent"
          : "border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75",
      )}
    >
      <div className="container-wide flex h-20 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Logo variant={onDarkHero ? "light" : "dark"} />
          <span className="sr-only">Napoli Pizzeria — forsiden</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[0.875rem] font-medium">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "transition-colors relative group hover:text-[color:var(--color-pomodoro)]",
                onDarkHero ? "text-[color:var(--color-pane)]/90 hover:text-[color:var(--color-olivolio)]" : "text-foreground/85",
              )}
            >
              {item.label}
              <span className={cn("absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full", onDarkHero ? "bg-[color:var(--color-olivolio)]" : "bg-[color:var(--color-pomodoro)]")} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="lg" className="hidden sm:inline-flex rounded-full px-6">
            <Link href={bestillHref}>Bestill nå</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("lg:hidden h-11 w-11", onDarkHero && "text-[color:var(--color-pane)] hover:bg-white/10 hover:text-[color:var(--color-pane)]")}
                aria-label="Åpne meny"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background border-l border-border">
              <SheetTitle className="sr-only">Meny</SheetTitle>
              <div className="flex flex-col gap-1 p-6 pt-12">
                <div className="mb-6">
                  <Logo />
                </div>
                {NAV.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="display-italic text-2xl py-3 border-b border-border/60 hover:text-[color:var(--color-pomodoro)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild size="lg" className="mt-6 rounded-full">
                  <Link href={bestillHref} onClick={() => setOpen(false)}>
                    Bestill nå
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
