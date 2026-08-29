import { RevealText } from "@/components/common/reveal-text";

export function ManifestoSection() {
  return (
    <section
      id="manifesto"
      className="flex min-h-screen items-center justify-center bg-background px-6 py-24 md:px-12"
    >
      <RevealText
        as="h2"
        lines={["We don't chase comfort.", "We engineer capacity."]}
        className="max-w-4xl text-center font-display text-headline uppercase leading-tight text-foreground"
      />
    </section>
  );
}
