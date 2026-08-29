import { RevealText } from "@/components/common/reveal-text";

type SectionHeadingProps = {
  kicker: string;
  title: string;
  className?: string;
};

export function SectionHeading({ kicker, title, className }: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="text-caption uppercase tracking-widest text-muted-foreground">{kicker}</p>
      <RevealText
        as="h2"
        lines={[title]}
        className="mt-3 font-display text-headline uppercase leading-tight text-foreground"
      />
    </div>
  );
}
