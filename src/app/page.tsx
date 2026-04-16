import { Hero } from "@/components/landing/hero";
import { FeaturedShelf } from "@/components/landing/featured-shelf";
import { CategoryGrid } from "@/components/landing/category-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MakerSpotlight } from "@/components/landing/maker-spotlight";
import { ClosingCta } from "@/components/landing/closing-cta";

export const revalidate = 60;

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturedShelf />
      <CategoryGrid />
      <HowItWorks />
      <MakerSpotlight />
      <ClosingCta />
    </>
  );
}
