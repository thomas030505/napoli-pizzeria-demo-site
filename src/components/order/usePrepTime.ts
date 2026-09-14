"use client";

import { useEffect, useRef, useState } from "react";
import type { PrepTime } from "@/lib/lettbestilt";

/**
 * Fersk tilberedningstid (grunntid + rush) for «ca. X min».
 *
 * Hvorfor ikke bare `restaurant.prepTime` fra menypayloaden? Fordi `/menu` er
 * CDN-cachet i 5–11 minutter. Skrur kjøkkenet på rush, ville kunden sett
 * grunntiden helt fram til kassen — og først oppdaget den ekte ventetiden på
 * sporingssiden, etter at han hadde betalt.
 *
 * Kilderekkefølge, strengt:
 *   1. Siste vellykkede henting fra `/api/prep-time` (`no-store`)
 *   2. Sist kjente verdi fra denne økten — en feilet henting rører ingenting
 *   3. SSR-startverdien fra `restaurant.prepTime`
 * Aldri `defaultPrepMinutes`: den er grunntid uten rush, altså feil tall.
 *
 * Cacher i 25 s så kassen ikke hamrer på endepunktet (rate-limit 600/60 s per
 * slug+ip), men fortsatt fanger opp at rush skrus av eller på.
 *
 * @param initial SSR-verdien fra menypayloaden.
 * @param refreshKey Hent på nytt når denne endrer seg — send inn «kassen er
 *   åpen», så oppdateres tallet i det kunden kommer dit det betyr noe.
 */
const CACHE_MS = 25_000;
const TIMEOUT_MS = 4_000;

export function usePrepTime(initial: PrepTime, refreshKey?: unknown): PrepTime {
  // Settes KUN ved vellykket henting. Det er hele fallback-mekanismen: feiler
  // eller timer kallet ut, står sist kjente verdi igjen av seg selv — og har
  // ingen henting lykkes ennå, er det SSR-verdien fra menypayloaden.
  const [prepTime, setPrepTime] = useState<PrepTime>(initial);
  const fetchedAt = useRef<number>(0);

  useEffect(() => {
    // Første kjøring skal alltid hente; senere kjøringer respekterer cachen.
    if (fetchedAt.current > 0 && Date.now() - fetchedAt.current < CACHE_MS) return;

    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    fetch("/api/prep-time", { cache: "no-store", signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { prepTime?: PrepTime } | null) => {
        const next = data?.prepTime;
        if (cancelled || !next || typeof next.pickupMinutes !== "number") return;
        fetchedAt.current = Date.now();
        setPrepTime(next);
      })
      .catch(() => {
        // Nettverksfeil eller timeout: behold sist kjente verdi. Ventetiden er
        // ikke verdt å blokkere eller tømme kassen for.
      })
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [refreshKey]);

  return prepTime;
}
