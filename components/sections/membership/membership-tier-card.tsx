import type { MembershipTier } from "@/types/content";
import { cn } from "@/lib/utils";

export function MembershipTierCard({ tier }: { tier: MembershipTier }) {
  return (
    <li data-tier-block className="flex flex-col p-8 md:p-10">
      <span
        className={cn(
          "text-caption uppercase tracking-widest text-accent",
          !tier.featured && "invisible"
        )}
      >
        Recommended
      </span>
      <h3 className="mt-3 font-display text-subhead uppercase leading-tight text-foreground">
        {tier.name}
      </h3>
      <p
        className={cn(
          "mt-4 font-display text-headline leading-none",
          tier.featured ? "text-accent" : "text-foreground"
        )}
      >
        {tier.price}
        <span className="text-body text-muted-foreground">{tier.cadence}</span>
      </p>
      <ul className="mt-8 flex flex-1 flex-col gap-3 text-body text-muted-foreground">
        {tier.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <a
        href="#cta"
        className={cn(
          "mt-10 inline-flex items-center justify-center rounded-full border border-foreground px-6 py-3 text-sm uppercase tracking-wide transition-colors duration-300",
          tier.featured
            ? "bg-foreground text-background hover:opacity-90"
            : "text-foreground hover:bg-foreground hover:text-background"
        )}
      >
        Choose {tier.name}
      </a>
    </li>
  );
}
