import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import ActionFigureGallery from "@/components/landing/ActionFigureGallery";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ActionFigureGallery />
      <HowItWorks />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
