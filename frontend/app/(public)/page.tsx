import Hero from "@/components/landing/Hero";
import DashboardPreview from "@/components/landing/DashboardPreview";
import FeaturesBento from "@/components/landing/FeaturesBento";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import PricingTable from "@/components/landing/PricingTable";
import CTA from "@/components/landing/CTA";
import LandingOrMobileWelcome from "@/components/mobile/LandingOrMobileWelcome";

export default function LandingPage() {
  return (
    <LandingOrMobileWelcome
      landing={
        <>
          <Hero />
          <DashboardPreview />
          <FeaturesBento />
          <HowItWorks />
          <Testimonials />
          <PricingTable />
          <CTA />
        </>
      }
    />
  );
}
