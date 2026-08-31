import Image from "next/image";
import { RevealText } from "@/components/common/reveal-text";
import { MagneticButton } from "@/components/common/magnetic-button";
import { RevealImage } from "@/components/common/reveal-image";

export function FinalCtaSection() {
  return (
    <section
      id="cta"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center md:px-12"
    >
      <RevealImage className="absolute inset-0 overflow-hidden">
        <Image
          src="/references/CTA/cta-01.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-[50%_35%]"
        />
      </RevealImage>
      <div aria-hidden="true" className="absolute inset-0 bg-background/55" />
      <div className="relative z-10 flex flex-col items-center">
        <RevealText
          as="h2"
          lines={["Ready To Become", "The Standard?"]}
          className="font-display text-headline uppercase leading-tight text-foreground"
        />
        <MagneticButton
          href="#membership"
          className="mt-8 inline-flex items-center rounded-full bg-foreground px-8 py-4 text-sm uppercase tracking-wide text-background"
        >
          Join APEX
        </MagneticButton>
      </div>
    </section>
  );
}
