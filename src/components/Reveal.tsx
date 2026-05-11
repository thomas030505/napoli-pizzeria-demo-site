"use client";

import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
}: {
  as?: "div" | "section" | "article";
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", inView && "is-in-view", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
