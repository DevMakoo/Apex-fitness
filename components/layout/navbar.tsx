"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePreloaderComplete } from "@/components/preloader/preloader";
import { MagneticButton } from "@/components/common/magnetic-button";

const NAV_LINKS = [
  { href: "#programs", label: "Programs" },
  { href: "#trainers", label: "Trainers" },
  { href: "#membership", label: "Membership" },
] as const;

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const preloaderComplete = usePreloaderComplete();

  useGSAP(
    () => {
      if (!preloaderComplete) return;

      const trigger = ScrollTrigger.create({
        start: "top -80",
        onUpdate: (self) => {
          navRef.current?.setAttribute("data-state", self.scroll() > 80 ? "solid" : "transparent");
        },
      });

      return () => trigger.kill();
    },
    { scope: navRef, dependencies: [preloaderComplete] }
  );

  return (
    <nav
      ref={navRef}
      data-state="transparent"
      aria-label="Primary"
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 transition-colors duration-300 data-[state=solid]:bg-background/90 data-[state=solid]:backdrop-blur md:px-12"
    >
      <Link href="#hero" className="font-display text-lg uppercase tracking-widest text-foreground">
        Apex
      </Link>
      <ul className="hidden gap-8 font-sans text-sm uppercase tracking-wide text-foreground md:flex">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
      <MagneticButton
        href="#membership"
        className="rounded-full border border-foreground px-5 py-2 text-sm uppercase tracking-wide text-foreground"
      >
        Join
      </MagneticButton>
    </nav>
  );
}
