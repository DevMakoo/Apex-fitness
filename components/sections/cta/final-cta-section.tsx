import { RevealText } from "@/components/common/reveal-text";

export function FinalCtaSection() {
  return (
    <section
      id="cta"
      className="flex min-h-[70vh] flex-col items-center justify-center bg-foreground px-6 text-center text-background md:px-12"
    >
      <RevealText
        as="h2"
        lines={["Ready To Become", "The Standard?"]}
        className="font-display text-headline uppercase leading-tight"
      />
      <a
        href="#membership"
        className="mt-8 inline-flex items-center rounded-full bg-background px-8 py-4 text-sm uppercase tracking-wide text-foreground"
      >
        Join APEX
      </a>
    </section>
  );
}
