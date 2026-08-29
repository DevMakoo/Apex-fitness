import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero/hero-section";
import { ManifestoSection } from "@/components/sections/manifesto/manifesto-section";
import { ProgramsSection } from "@/components/sections/programs/programs-section";
import { ExperienceSection } from "@/components/sections/experience/experience-section";
import { StatsSection } from "@/components/sections/stats/stats-section";
import { TrainersSection } from "@/components/sections/trainers/trainers-section";
import { MembershipSection } from "@/components/sections/membership/membership-section";
import { FinalCtaSection } from "@/components/sections/cta/final-cta-section";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-foreground"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <ManifestoSection />
        <ProgramsSection />
        <ExperienceSection />
        <StatsSection />
        <TrainersSection />
        <MembershipSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
