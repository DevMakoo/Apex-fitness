"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePreloaderComplete } from "@/components/preloader/preloader";
import { MagneticButton } from "@/components/common/magnetic-button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#programs", label: "Programs" },
  { href: "#trainers", label: "Trainers" },
  { href: "#membership", label: "Membership" },
] as const;

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const preloaderComplete = usePreloaderComplete();
  const [open, setOpen] = useState(false);

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
      <div className="flex items-center gap-4">
        <MagneticButton
          href="#membership"
          className="hidden rounded-full border border-foreground px-5 py-2 text-sm uppercase tracking-wide text-foreground md:inline-flex"
        >
          Join
        </MagneticButton>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
          className="text-foreground md:hidden"
        >
          <span className="sr-only">Toggle menu</span>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      <ul
        id="mobile-nav"
        className={cn(
          "absolute inset-x-0 top-full flex-col gap-4 bg-background p-6 text-foreground md:hidden",
          open ? "flex" : "hidden"
        )}
      >
        {[...NAV_LINKS, { href: "#membership", label: "Join" }].map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm uppercase tracking-wide"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
