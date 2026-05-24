import { fetchRestaurantLite } from "@/lib/lettbestilt";
import { NewsletterPopup } from "./NewsletterPopup";

/**
 * Server component som henter popup-konfigurasjon fra LettBestilt og bare
 * mounter popupen når restauranten har slått den på i dashboardet (med en
 * aktiv koblet kupong). Else: render null — popup vises ikke.
 *
 * Plassert i root layout. Feiler ikke siden: API-feil → ingen popup.
 */
export async function NewsletterPopupMount({ slug }: { slug: string }) {
  try {
    const restaurant = await fetchRestaurantLite();
    if (!restaurant.newsletterPopup) return null;
    return (
      <NewsletterPopup
        restaurantKey={slug}
        config={restaurant.newsletterPopup}
      />
    );
  } catch {
    return null;
  }
}
