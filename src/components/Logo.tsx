import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "dark" | "light";
};

export function Logo({ className, variant = "dark" }: Props) {
  const ink = variant === "dark" ? "var(--color-forno)" : "var(--color-pane)";
  const accent = "var(--color-pomodoro)";
  const gold = "var(--color-olivolio)";

  return (
    <span
      className={cn("inline-flex flex-col items-center leading-none select-none", className)}
      aria-label="Napoli Pizzeria"
    >
      <span
        className="display-italic text-[1.85rem] sm:text-[2.05rem]"
        style={{ color: ink, lineHeight: 0.95 }}
      >
        Napoli<span style={{ color: accent }}>.</span>
      </span>
      <span
        className="flex items-center gap-1.5 mt-0.5"
        style={{ color: variant === "dark" ? "var(--color-stone-700)" : "var(--color-stone-300)" }}
      >
        <span aria-hidden className="block h-px w-4" style={{ background: gold }} />
        <span className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.34em] font-medium">
          Pizzeria · 1987
        </span>
        <span aria-hidden className="block h-px w-4" style={{ background: gold }} />
      </span>
    </span>
  );
}
