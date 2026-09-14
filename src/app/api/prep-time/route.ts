import { NextResponse } from "next/server";
import { fetchPrepTimeServer } from "@/lib/lettbestilt";

/**
 * GET /api/prep-time — tynn proxy foran LettBestilts `/api/v1/prep-time`.
 *
 * Finnes utelukkende for å holde `LETTBESTILT_API_KEY` på serveren. Kassen
 * spør denne ruten fra nettleseren; nøkkelen legges på her og går aldri ut i
 * klient-bundelen.
 *
 * `no-store` hele veien: rush er en fersk-tilstand, og et cachet svar ville
 * vist kunden feil ventetid akkurat når det koster mest. Klienten cacher selv
 * i ~25 s (se `usePrepTime`).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prepTime = await fetchPrepTimeServer();
    return NextResponse.json(
      { prepTime },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // Kassen beholder sist kjente verdi ved feil, så en 503 her degraderer
    // pent i stedet for å blokkere bestillingen.
    return NextResponse.json(
      { error: { code: "PREP_TIME_UNAVAILABLE", message: "Kunne ikke hente ventetid." } },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
