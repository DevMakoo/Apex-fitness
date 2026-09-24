import Image from "next/image";
import { membershipTiers } from "@/lib/data/membership";
import { SectionHeading } from "@/components/common/section-heading";
import { StaggerReveal } from "@/components/common/stagger-reveal";
import { RevealImage } from "@/components/common/reveal-image";
import { MembershipTierCard } from "./membership-tier-card";

export function MembershipSection() {
  return (
    <section id="membership" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="Planos" title="Escolha o seu padrão" />
      <RevealImage className="relative mt-16 aspect-[4/3] md:aspect-[21/9] w-full overflow-hidden border border-border">
        <Image
          src="/references/membership/membership-01.jpg"
          alt="Salão de treino com paredes de vidro, com vista para palmeiras e para o litoral na hora dourada"
          fill
          sizes="100vw"
          className="object-cover object-[50%_35%]"
        />
      </RevealImage>
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
