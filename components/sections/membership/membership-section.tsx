"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { membershipTiers } from "@/lib/data/membership";
import { SectionHeading } from "@/components/common/section-heading";
import { MembershipTierCard } from "./membership-tier-card";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function MembershipSection() {
  const listRef = useRef<HTMLUListElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.fromTo(
        "[data-tier-block]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.base,
          ease: EASE.entrance,
          stagger: 0.12,
          scrollTrigger: { trigger: listRef.current, start: "top 80%" },
        }
      );
    },
    { scope: listRef, dependencies: [reducedMotion] }
  );

  return (
    <section id="membership" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="Membership" title="Choose Your Standard" />
      <ul
        ref={listRef}
        className="mt-16 grid divide-y divide-border border-t border-border md:grid-cols-3 md:divide-x md:divide-y-0"
      >
        {membershipTiers.map((tier) => (
          <MembershipTierCard key={tier.id} tier={tier} />
        ))}
      </ul>
    </section>
  );
}
