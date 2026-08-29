"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { ExperienceVisual } from "./experience-visual";

const STEPS = [
  {
    id: "assess",
    title: "Assess",
    copy: "Baseline testing across strength, conditioning, and movement quality.",
  },
  {
    id: "program",
    title: "Program",
    copy: "A periodized plan built around your data, not a generic template.",
  },
  {
    id: "train",
    title: "Train",
    copy: "Coached sessions with real-time load and form correction.",
  },
  {
    id: "adapt",
    title: "Adapt",
    copy: "Continuous re-testing keeps the program moving with you.",
  },
] as const;

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      const introEl = sectionRef.current!.querySelector<HTMLElement>("[data-experience-intro]");
      const outroEl = sectionRef.current!.querySelector<HTMLElement>("[data-experience-outro]");
      const textPanels = gsap.utils.toArray<HTMLElement>("[data-experience-text]");
      const visualPanels = gsap.utils.toArray<HTMLElement>("[data-experience-visual]");

      const totalTransitions = STEPS.length + 1; // intro→step1, step→step ×3, stepN→outro

      // Both conditions are declared (not just "isMobile") because GSAP's
      // matchMedia only invokes the callback when at least one named
      // condition currently matches — with only "isMobile" declared, the
      // callback (and therefore every gsap.set()/timeline/ScrollTrigger
      // below) never ran at all on desktop widths, leaving every panel at
      // its default visible state and causing all narrative states to
      // render stacked on top of each other.
      const mm = gsap.matchMedia();
      mm.add(
        { isMobile: "(max-width: 767px)", isDesktop: "(min-width: 768px)" },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean };
          const distancePerTransition = isMobile ? 300 : 500;

          // Initial state: intro visible, every step/outro hidden; the first
          // visual is already showing so the composition feels alive immediately.
          gsap.set(outroEl, { autoAlpha: 0 });
          gsap.set(textPanels, { autoAlpha: 0 });
          gsap.set(visualPanels.slice(1), { autoAlpha: 0 });
          gsap.set(visualPanels[0], { autoAlpha: 1 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: () => `+=${totalTransitions * distancePerTransition}`,
              pin: true,
              scrub: 1,
              onUpdate: (self) => {
                gsap.set(progressRef.current, { scaleX: self.progress });
              },
            },
          });

          // Beat 1 — intro hands off to the first step.
          tl.to(introEl, { autoAlpha: 0, duration: DURATION.fast, ease: EASE.standard }, 1).to(
            textPanels[0],
            { autoAlpha: 1, duration: DURATION.fast, ease: EASE.standard },
            1
          );

          // Beats 2–4 — step-to-step crossfades, text and visual together.
          for (let i = 1; i < STEPS.length; i += 1) {
            const position = i + 1;
            tl.to(
              textPanels[i - 1],
              { autoAlpha: 0, duration: DURATION.fast, ease: EASE.standard },
              position
            )
              .to(
                textPanels[i],
                { autoAlpha: 1, duration: DURATION.fast, ease: EASE.standard },
                position
              )
              .to(
                visualPanels[i - 1],
                { autoAlpha: 0, duration: DURATION.fast, ease: EASE.standard },
                position
              )
              .to(
                visualPanels[i],
                { autoAlpha: 1, duration: DURATION.fast, ease: EASE.standard },
                position
              );
          }

          // Final beat — the last step resolves into the outro line.
          const lastPosition = STEPS.length + 1;
          tl.to(
            textPanels[STEPS.length - 1],
            { autoAlpha: 0, duration: DURATION.fast, ease: EASE.standard },
            lastPosition
          ).to(outroEl, { autoAlpha: 1, duration: DURATION.fast, ease: EASE.standard }, lastPosition);
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-background"
    >
      <div
        className={
          reducedMotion
            ? "mx-auto flex max-w-6xl flex-col gap-16 px-6 py-24 md:px-12"
            : "mx-auto flex h-full max-w-6xl flex-col justify-center gap-10 px-6 md:flex-row md:items-center md:gap-16 md:px-12"
        }
      >
        {/* Visual composition panel */}
        <div
          className={
            reducedMotion
              ? "flex flex-col gap-6"
              : "relative aspect-[4/3] w-full shrink-0 md:aspect-square md:w-1/2"
          }
        >
          {STEPS.map((step, index) =>
            reducedMotion ? (
              <div key={step.id} className="aspect-[4/3] w-full">
                <ExperienceVisual index={index} label={`Visual for the ${step.title} phase`} />
              </div>
            ) : (
              <div key={step.id} data-experience-visual className="absolute inset-0">
                <ExperienceVisual index={index} label={`Visual for the ${step.title} phase`} />
              </div>
            )
          )}
        </div>

        {/* Narrative text panel */}
        <div className={reducedMotion ? "flex flex-col gap-16" : "relative w-full md:w-1/2"}>
          <div
            data-experience-intro
            className={reducedMotion ? undefined : "absolute inset-0 flex flex-col justify-center"}
          >
            <p className="text-caption uppercase tracking-widest text-muted-foreground">
              The Process
            </p>
            <h2 className="mt-3 font-display text-headline uppercase leading-tight text-foreground">
              The APEX Method
            </h2>
            <p className="mt-6 max-w-md text-body text-muted-foreground">
              Four phases, repeated relentlessly. Every session builds on data from the last.
            </p>
          </div>

          {STEPS.map((step, index) => (
            <div
              key={step.id}
              data-experience-text
              className={reducedMotion ? undefined : "absolute inset-0 flex flex-col justify-center"}
            >
              <span className="text-caption uppercase tracking-widest text-muted-foreground">
                0{index + 1} / 0{STEPS.length}
              </span>
              <h3 className="mt-3 font-display text-headline uppercase leading-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-4 max-w-md text-body text-muted-foreground">{step.copy}</p>
            </div>
          ))}

          <div
            data-experience-outro
            className={reducedMotion ? undefined : "absolute inset-0 flex flex-col justify-center"}
          >
            <p className="text-caption uppercase tracking-widest text-muted-foreground">
              The Result
            </p>
            <h3 className="mt-3 max-w-md font-display text-headline uppercase leading-tight text-foreground">
              Every Rep, Measured.
            </h3>
          </div>
        </div>
      </div>

      {!reducedMotion && (
        <div className="absolute inset-x-6 bottom-8 md:inset-x-12">
          <div className="h-px w-full bg-border">
            <div ref={progressRef} className="h-px w-full origin-left scale-x-0 bg-foreground" />
          </div>
        </div>
      )}
    </section>
  );
}
