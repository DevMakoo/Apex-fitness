import { membershipTiers } from "@/lib/data/membership";
import { SectionHeading } from "@/components/common/section-heading";
import { StaggerReveal } from "@/components/common/stagger-reveal";
import { MembershipTierCard } from "./membership-tier-card";

export function MembershipSection() {
  return (
    <section id="membership" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="Membership" title="Choose Your Standard" />
      <StaggerReveal
        itemSelector="[data-tier-block]"
        className="mt-16 grid divide-y divide-border border-t border-border md:grid-cols-3 md:divide-x md:divide-y-0"
      >
        {membershipTiers.map((tier) => (
          <MembershipTierCard key={tier.id} tier={tier} />
        ))}
      </StaggerReveal>
    </section>
  );
}
