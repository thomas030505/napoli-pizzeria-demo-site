import { Hero } from "@/components/home/Hero";
import { USPStrip } from "@/components/home/USPStrip";
import { PopularDishes } from "@/components/home/PopularDishes";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { Reviews } from "@/components/home/Reviews";
import { LocationsBlock } from "@/components/home/LocationsBlock";
import { FinalCTA } from "@/components/home/FinalCTA";
import { fetchMenu } from "@/lib/lettbestilt";
import { restaurantJsonLd, jsonLdScript } from "@/lib/seo";

export const revalidate = 300;

export default async function Home() {
  let ld: string | null = null;
  try {
    const data = await fetchMenu({ revalidate: 300 });
    ld = jsonLdScript(restaurantJsonLd(data.restaurant));
  } catch {
    // SEO degrades gracefully
  }

  return (
    <>
      {ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ld }}
        />
      )}
      <Hero />
      <USPStrip />
      <PopularDishes />
      <AboutTeaser />
      <Reviews />
      <LocationsBlock />
      <FinalCTA />
    </>
  );
}
