import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/sections/hero/hero-section";

const PLACEHOLDER_SECTIONS = [
  "manifesto",
  "programs",
  "experience",
  "stats",
  "trainers",
  "membership",
  "cta",
] as const;

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
        {PLACEHOLDER_SECTIONS.map((id) => (
          <section
            key={id}
            id={id}
            className="flex h-screen items-center justify-center border-b border-border text-2xl uppercase tracking-widest text-muted-foreground"
          >
            {id} placeholder
          </section>
        ))}
      </main>
    </>
  );
}
