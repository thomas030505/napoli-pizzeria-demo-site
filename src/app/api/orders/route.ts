import type { NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_LETTBESTILT_URL ?? "https://lettbestilt.no";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const API_KEY = process.env.LETTBESTILT_API_KEY;

export async function POST(request: NextRequest) {
  const search = request.nextUrl.searchParams.toString();
  const body = await request.text();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const idempotency = request.headers.get("idempotency-key");
  if (idempotency) headers["Idempotency-Key"] = idempotency;
  if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;
  if (SITE_URL) headers["Origin"] = SITE_URL;

  const upstream = await fetch(`${BASE_URL}/api/v1/orders?${search}`, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
