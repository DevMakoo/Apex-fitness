import Image from "next/image";
import { HeroCopy } from "./hero-copy";
import { HeroScrollCue } from "./hero-scroll-cue";

export function HeroSection() {
  return (
    <section id="hero" className="relative h-screen overflow-hidden bg-background">
      <div
        className="absolute inset-y-0 right-0 w-full md:w-[64%] lg:w-[56%]"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 22%)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 22%)",
        }}
      >
        <Image
          src="/references/hero/hero-01.jpg"
          alt="Group of athletes in dark performance apparel, dramatically lit against a black studio background"
          fill
          priority
          sizes="(min-width: 1024px) 56vw, (min-width: 768px) 64vw, 100vw"
          className="object-cover object-[60%_25%]"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-background via-background/55 to-transparent md:hidden"
      />
      <div className="relative z-10 flex h-full flex-col justify-between px-6 py-10 md:px-12">
        <HeroCopy />
        <HeroScrollCue />
      </div>
    </section>
  );
}
