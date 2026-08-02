/**
 * LettBestilt API client — copy into src/lib/lettbestilt.ts in the new project.
 *
 * Required env:
 *   NEXT_PUBLIC_LETTBESTILT_URL  e.g. https://lettbestilt.no
 *   NEXT_PUBLIC_SLUG             e.g. milano
 *
 * Optional (server-only, for API-key auth path):
 *   LETTBESTILT_API_KEY          set if your domain is NOT on PUBLIC_API_ALLOWED_ORIGINS
 *
 * Auth: read endpoints (menu, restaurant, order tracking) need no auth.
 * Write endpoints (orders, coupon validation) need either:
 *   (a) the request comes from a CORS allow-listed browser origin, OR
 *   (b) a Bearer API key in the Authorization header.
 */

const BASE_URL = process.env.NEXT_PUBLIC_LETTBESTILT_URL ?? "https://www.lettbestilt.no";
const SLUG = process.env.NEXT_PUBLIC_SLUG!;

// ============================================================================
// Types
// ============================================================================

export type AddonGroup = {
  id: string;
  name: string;
  nameEn: string | null;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  sortOrder: number;
  addons: Array<{
    id: string;
    name: string;
    nameEn: string | null;
    price: number;
    sortOrder: number;
  }>;
};

export type Variant = {
  id: string;
  name: string;
  nameEn: string | null;
  price: number;
  isDefault: boolean;
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
  basePrice: number;
  sortOrder: number;
  isPopular: boolean;
  isRecommended: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  variants: Variant[];
  addonGroups: Array<AddonGroup & { sortOrder: number }>;
  allergens: string[];
};

export type Category = {
  id: string;
  menuId: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  addonGroups: AddonGroup[];
  products: Product[];
};

export type Menu = {
  id: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  isDefault: boolean;
  priority: number;
  sortOrder: number;
  locationId: string | null;
  schedules: Array<{
    id: string;
    dayOfWeek: number;
    startsAt: string;
    endsAt: string;
    priority: number;
    isActive: boolean;
  }>;
};

export type OpeningHour = {
  dayOfWeek: number;        // 0=Sunday, 6=Saturday
  opensAt: string;          // "11:00"
  closesAt: string;
  isClosed: boolean;
  locationId: string | null;
};

export type HoursOverride = {
  id: string;
  label: string;
  startDate: string;        // ISO
  endDate: string;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};

export type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
};

/**
 * Restaurantens besøksadresse slik LettBestilt returnerer den (august 2026).
 * `null` når restauranten ikke har oppgitt gateadresse — API-et sender aldri
 * et objekt med tomme felt, nettopp så `address ?? FALLBACK` virker.
 * `latitude`/`longitude` er begge satt eller begge null.
 */
export type PublicAddress = {
  line1: string;
  postalCode: string | null;
  city: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Adapter fra API-ets flate `address` til denne sidens interne Location-form.
 *
 * LettBestilt fjernet avdelinger og eksponerer nå én besøksadresse per
 * restaurant, ikke et `locations[]`. Vi beholder Location internt fordi hele
 * siden (footer, kontakt, JSON-LD, hentekart) allerede leser den formen —
 * bakoverkompatibiliteten hører hjemme her, ikke i den offentlige kontrakten.
 *
 * `id: ""` med vilje: det finnes ingen location-id lenger, og checkouten
 * sender `locationId: locationId || undefined` — en oppdiktet id ville blitt
 * sendt til serveren, som stille ignorerer den.
 */
export function locationFromAddress(
  address: PublicAddress | null | undefined,
  restaurant: { name: string; phone: string | null }
): Location | null {
  if (!address?.line1) return null;
  return {
    id: "",
    name: restaurant.name,
    address: address.line1,
    city: address.city ?? "",
    postalCode: address.postalCode ?? "",
    country: address.country ?? "NO",
    latitude: address.latitude,
    longitude: address.longitude,
    phone: restaurant.phone,
  };
}

export type DeliveryZone = {
  id: string;
  name: string;
  postalCodes: string[];
  deliveryFee: number;
  minimumOrder: number;
  estimatedMinutes: number;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cuisineType: string | null;
  currency: string;
  locale: string;
  // Branding
  logoUrl: string | null;
  faviconUrl: string | null;
  coverImageUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  fontFamily: string | null;
  // Contact
  email: string | null;
  phone: string | null;
  website: string | null;
  googleReviewUrl: string | null;
  // Legal
  orgNumber: string | null;
  vatNumber: string | null;
  // Capabilities
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  defaultPrepMinutes: number;
  defaultDeliveryMinutes: number;
  // Tracking
  trackingHeaderText: string | null;
  trackingPickupInstructions: string | null;
  trackingDeliveryInstructions: string | null;
  trackingShowEta: boolean;
  trackingShowMap: boolean;
  // Receipt
  receiptHeaderText: string | null;
  receiptFooterText: string | null;
  receiptShowUpsell: boolean;
  // Domains
  tenantDomains: Array<{ domain: string; isPrimary: boolean }>;
  // Schedule + locations
  openingHours: OpeningHour[];
  hoursOverrides: HoursOverride[];
  // Besøksadresse (LettBestilt august 2026). `locations` beholdes som intern
  // form og utledes fra `address` i fetchMenu — se locationFromAddress.
  address: PublicAddress | null;
  locations: Location[];
  deliveryZones: DeliveryZone[];
  // Restaurant-wide addon groups
  addonGroups: AddonGroup[];
  // Hvilke betalingsmåter eieren har slått på i dashbordet. Minst én er alltid true.
  // Optional fordi feltet ble lagt til etter at API-en kom på live; eldre snapshots
  // mangler det og klienten må fall tilbake til Stripe + Cash som før.
  payment?: { card: boolean; vipps: boolean; cash: boolean };
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minimumOrder: number;
  usageLimit: number | null;
  usageCount: number;
  validFrom: string | null;
  validTo: string | null;
  locationId: string | null;
};

export type Allergen = {
  code: string;
  name: string;
  nameEn: string;
  iconUrl: string | null;
  group: string;
};

export type AllergenIndexEntry = { number: number; allergen: Allergen };

export function buildAllergenIndex(allergens: Allergen[]): {
  byCode: Map<string, AllergenIndexEntry>;
  ordered: AllergenIndexEntry[];
} {
  const ordered: AllergenIndexEntry[] = allergens.map((allergen, i) => ({
    number: i + 1,
    allergen,
  }));
  const byCode = new Map<string, AllergenIndexEntry>();
  for (const entry of ordered) byCode.set(entry.allergen.code, entry);
  return { byCode, ordered };
}

export type UpsellConfig = {
  isActive: boolean;
  mode: string;
  products: Array<{
    sortOrder: number;
    id: string;
    name: string;
    nameEn: string | null;
    description: string | null;
    imageUrl: string | null;
    basePrice: number;
  }>;
};

export type MenuResponse = {
  restaurant: Restaurant;
  menus: Menu[];
  categories: Category[];
  coupons: Coupon[];
  allergens: Allergen[];
  upsell: UpsellConfig | null;
};

export type RestaurantLite = Pick<
  Restaurant,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "cuisineType"
  | "currency"
  | "locale"
  | "logoUrl"
  | "faviconUrl"
  | "coverImageUrl"
  | "primaryColor"
  | "secondaryColor"
  | "fontFamily"
  | "email"
  | "phone"
  | "website"
  | "googleReviewUrl"
  | "address"
  | "pickupEnabled"
  | "deliveryEnabled"
  | "defaultPrepMinutes"
  | "defaultDeliveryMinutes"
> & {
  // Returneres KUN når popupen er aktivert i dashboardet og koblet til en aktiv
  // kupong. Når null/missing: ikke render popupen — restauranten har slått den av.
  newsletterPopup: NewsletterPopupConfig | null;
};

export type NewsletterPopupConfig = {
  enabled: true;
  headline: string;
  body: string;
  ctaLabel: string;
  successMessage: string; // template med {{code}} og {{discount}}
  requireName: boolean;
  showAfterMs: number;
  cookieDays: number;
  coupon: {
    code: string;
    discountType: "PERCENT" | "FIXED" | "FREE_DELIVERY";
    discountValue: number;
  };
};

export type NewsletterSignupResponse = {
  couponCode: string;
  discountType: "PERCENT" | "FIXED" | "FREE_DELIVERY";
  discountValue: number;
  successMessage: string;
};

// ----- Order creation -----

export type CreateOrderInput = {
  locationId?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    addonIds: string[];
    quantity: number;
    notes?: string;
  }>;
  fulfillment: "PICKUP" | "DELIVERY";
  orderType?: "TAKEAWAY" | "DINE_IN";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPostalCode?: string;
  deliveryNotes?: string;
  pickupNotes?: string;
  requestedPickupAt?: string;
  couponCode?: string;
  paymentMethod: "STRIPE" | "CASH" | "VIPPS";
  locale?: "nb" | "en";
  consentGivenAt?: string;
};

export type CreateOrderResponse =
  | { orderId: string; publicToken: string }
  | { orderId: string; publicToken: string; stripeUrl: string }
  | { orderId: string; publicToken: string; vippsUrl: string };

// ----- Coupon validation -----

export type CouponValidation =
  | {
      valid: true;
      discount: number;
      coupon: {
        code: string;
        description: string | null;
        discountType: "PERCENT" | "FIXED";
        discountValue: number;
        minimumOrder: number;
      };
    }
  | {
      valid: false;
      discount: 0;
      reason:
        | "UNKNOWN_OR_INACTIVE"
        | "NOT_YET_VALID"
        | "EXPIRED"
        | "EXHAUSTED"
        | "MINIMUM_NOT_MET"
        | "WRONG_LOCATION";
    };

// ----- Auto-promo preview -----

export type AutoPromoPreview =
  | {
      applies: true;
      discount: number;
      coupon: {
        code: string;
        description: string | null;
        displayName: string | null;
        discountType: "PERCENT" | "FIXED" | "FIXED_PRICE" | "FREE_DELIVERY";
        appliesTo: "ORDER" | "CATEGORIES" | "PRODUCTS";
      };
    }
  | {
      applies: false;
      discount: 0;
    };

// ----- Order tracking -----

export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PENDING"
  | "PAID"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "REFUNDED"
  | "FAILED";

export type OrderTracking = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  fulfillment: "PICKUP" | "DELIVERY";
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  locale: "nb" | "en";
  couponCode: string | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryPostalCode: string | null;
  deliveryNotes: string | null;
  pickupNotes: string | null;
  estimatedReadyAt: string | null;
  requestedPickupAt: string | null;
  completedAt: string | null;
  createdAt: string;
  consentGivenAt: string | null;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    googleReviewUrl: string | null;
    trackingHeaderText: string | null;
    trackingPickupInstructions: string | null;
    trackingDeliveryInstructions: string | null;
    trackingShowEta: boolean;
    trackingShowMap: boolean;
    // Hentestedet. Utledes til `location` under i fetchOrder.
    address: PublicAddress | null;
  };
  location: Pick<
    Location,
    "id" | "name" | "address" | "city" | "postalCode" | "phone" | "latitude" | "longitude"
  > | null;
  customer: { name: string };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    variantName: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    addons: Array<{ id: string; name: string; price: number }>;
    notes: string | null;
  }>;
  payment: {
    provider: "STRIPE" | "CASH";
    status: PaymentStatus;
    amount: number;
    currency: string;
    capturedAt: string | null;
  } | null;
};

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

// ============================================================================
// Read endpoints (no auth)
// ============================================================================

/**
 * Authorization-header for LESE-kall (/menu, /restaurant). LETTBESTILT_API_KEY
 * er bevisst ikke NEXT_PUBLIC_, så nøkkelen finnes kun på server; window-guarden
 * gjør det eksplisitt at den aldri skal havne i klient-bundelen. Mangler den,
 * sendes ingen header og LettBestilt faller tilbake på origin-allowlisten.
 */
function readAuthHeaders(): Record<string, string> {
  if (typeof window !== "undefined") return {};
  const apiKey = process.env.LETTBESTILT_API_KEY;
  return apiKey ? { Authorization: `Bearer ${apiKey.trim()}` } : {};
}

export async function fetchMenu(
  opts: { cache?: RequestCache; revalidate?: number } = {}
): Promise<MenuResponse> {
  const fetchOpts: RequestInit =
    opts.cache === "no-store"
      ? { cache: "no-store", headers: readAuthHeaders() }
      : { next: { revalidate: opts.revalidate ?? 60 }, headers: readAuthHeaders() };
  const res = await fetch(`${BASE_URL}/api/v1/menu?slug=${SLUG}`, fetchOpts);
  if (!res.ok) throw new Error(`Menu fetch failed: ${res.status}`);
  const data = (await res.json()) as MenuResponse;
  // LettBestilt har fjernet restaurant.locations fra payload — normaliser til []
  // så SSR ikke krasjer på .find()/[0]. Samme defensive mønster som milano-bardufoss.
  if (data.restaurant && !Array.isArray(data.restaurant.locations)) {
    // API-et returnerer ikke locations[] lenger. Utled den fra besøksadressen
    // så footer, kontaktside, JSON-LD og hentekart får ekte data; er adressen
    // ikke fylt ut i dashbordet blir dette [] og siden faller tilbake på
    // FALLBACK som før.
    const synthesized = locationFromAddress(data.restaurant.address, data.restaurant);
    data.restaurant.locations = synthesized ? [synthesized] : [];
  }
  return data;
}

export async function fetchRestaurantLite(): Promise<RestaurantLite> {
  const res = await fetch(`${BASE_URL}/api/v1/restaurant?slug=${SLUG}`, {
    next: { revalidate: 300 },
    headers: readAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Restaurant fetch failed: ${res.status}`);
  const data = await res.json();
  return data.restaurant;
}

/**
 * Idempotent newsletter signup. Returnerer velkomstkoden popupen viser fram.
 */
export async function subscribeToNewsletter(input: {
  email: string;
  name?: string;
  locationId?: string;
}): Promise<NewsletterSignupResponse> {
  const url = new URL(`${BASE_URL}/api/v1/newsletter/signup`);
  url.searchParams.set("slug", SLUG);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = data?.error?.message ?? `Påmelding feilet (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchOrder(token: string): Promise<OrderTracking> {
  const res = await fetch(`${BASE_URL}/api/v1/orders/${token}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Order fetch failed: ${res.status}`);
  const data = await res.json();
  const order = data.order as OrderTracking;
  // Hentestedet ligger nå på order.restaurant.address. Sporingssiden leser
  // fortsatt order.location, så vi utleder den her — uten dette er kartet på
  // sporingssiden dødt uansett hva trackingShowMap står på.
  if (order?.restaurant && !order.location) {
    order.location = locationFromAddress(order.restaurant.address, order.restaurant);
  }
  return order;
}

// ============================================================================
// Write endpoints (browser-origin OR Bearer key)
// ============================================================================

/**
 * Create an order. Call from a client component when the restaurant's domain
 * is in PUBLIC_API_ALLOWED_ORIGINS. Otherwise route through a Next.js route
 * handler that adds Authorization: Bearer <LETTBESTILT_API_KEY>.
 *
 * `origin` is used for the cancelUrl (where Stripe sends users on cancel).
 */
export async function placeOrder(
  payload: CreateOrderInput,
  origin: string,
  options: { idempotencyKey?: string } = {}
): Promise<CreateOrderResponse> {
  // NOTE: LettBestilt's safe-redirect logic only allows redirects to the
  // LettBestilt domain right now. Stripe success URL must be on lettbestilt.no.
  // The customer lands on lettbestilt.no/order/<token> after payment.
  void origin;
  const params = new URLSearchParams({
    slug: SLUG,
    successUrl: `${BASE_URL}/order/{TOKEN}?payment=success`,
    cancelUrl: `${BASE_URL}/order/canceled`,
  });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Idempotency-Key": options.idempotencyKey ?? crypto.randomUUID(),
  };
  const res = await fetch(`/api/orders?${params}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err: ApiError = data?.error ?? { code: "INTERNAL_ERROR", message: "Bestilling feilet" };
    throw Object.assign(new Error(err.message), { code: err.code, details: err.details });
  }
  if (
    !data ||
    typeof data !== "object" ||
    typeof data.orderId !== "string" ||
    typeof data.publicToken !== "string"
  ) {
    throw Object.assign(
      new Error("Uventet svar fra bestillingstjenesten. Prøv igjen."),
      { code: "INVALID_RESPONSE" as const }
    );
  }
  return data as CreateOrderResponse;
}

export async function validateCoupon(input: {
  code: string;
  subtotal: number;
  locationId?: string;
}): Promise<CouponValidation> {
  const res = await fetch(`/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: SLUG, ...input }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const err: ApiError = data?.error ?? { code: "INTERNAL_ERROR", message: "Validering feilet" };
    throw Object.assign(new Error(err.message), { code: err.code });
  }
  return res.json();
}

/**
 * Forhåndsvis hvilket automatisk tilbud LettBestilt-serveren vil anvende på
 * denne kurven (uten manuell kode). Server re-evaluerer ved order-create.
 * Returnerer { applies: false, discount: 0 } hvis ingen auto-promo gjelder.
 */
export async function previewAutoCoupon(input: {
  subtotal: number;
  locationId?: string;
  fulfillment?: "PICKUP" | "DELIVERY";
  deliveryFee?: number;
  cart: Array<{
    productId: string;
    quantity: number;
    variantName?: string | null;
    lineTotal: number;
  }>;
}): Promise<AutoPromoPreview> {
  const res = await fetch(`/api/coupons/preview-auto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: SLUG, ...input }),
  });
  if (!res.ok) {
    // Preview er ikke kritisk — fall stille tilbake til "ingen rabatt".
    return { applies: false, discount: 0 };
  }
  return res.json();
}

// ============================================================================
// Helpers
// ============================================================================

export function trackingUrl(publicToken: string): string {
  return `${BASE_URL}/order/${publicToken}`;
}

/**
 * Find delivery zone for a postal code. Returns null if no zone matches.
 */
export function findDeliveryZone(
  zones: DeliveryZone[],
  postalCode: string
): DeliveryZone | null {
  const trimmed = postalCode.replace(/\s/g, "");
  return zones.find((z) => z.postalCodes.includes(trimmed)) ?? null;
}

/**
 * Resolve effective addon groups for a product, merging restaurant-global +
 * category + product-level groups in that order, deduplicated by id.
 */
export function resolveAddonGroups(
  product: Product,
  category: Category,
  restaurant: Restaurant
): AddonGroup[] {
  const seen = new Set<string>();
  const out: AddonGroup[] = [];
  const layers: AddonGroup[][] = [
    restaurant.addonGroups,
    category.addonGroups,
    product.addonGroups,
  ];
  for (const layer of layers) {
    for (const g of layer) {
      if (seen.has(g.id)) continue;
      seen.add(g.id);
      out.push(g);
    }
  }
  return out.sort((a, b) => a.sortOrder - b.sortOrder);
}
