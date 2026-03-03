import {
  HeroSection,
  HowItWorksSection,
  GamesShowcase,
  FeaturesSection,
  CTASection,
  Footer,
} from "@/components/landing";

export function Home() {
  return (
    <div className="bg-gamion-dark text-white min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <GamesShowcase />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
