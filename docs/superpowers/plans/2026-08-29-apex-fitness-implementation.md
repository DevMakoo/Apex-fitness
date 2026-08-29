# APEX Fitness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the single-page APEX premium fitness marketing site — cinematic preloader, premium nav, GSAP/Lenis-driven scroll experience, a Three.js hero scene, and all content sections — on top of the existing Next.js 16 + React 19 + Tailwind v4 + shadcn scaffold.

**Architecture:** Root-level `components/`, `three/`, `lib/`, `hooks/`, `types/` folders (not nested in `app/`, since this is a single route). `app/page.tsx` composes section components in order; `app/layout.tsx` only wires fonts and the `SmoothScrollProvider`. Each section owns its own animation via `useGSAP` scoped to a local ref — no central master timeline. A single `<Canvas>` lives inside the Hero only.

**Tech Stack:** Next.js 16.3.3 (App Router), React 19.2.8, TypeScript, Tailwind v4, shadcn/ui, GSAP + `@gsap/react` + `ScrollTrigger` (no SplitText), Lenis, Three.js + `@react-three/fiber` + `@react-three/drei`, `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-08-29-apex-fitness-architecture-design.md`

## Global Constraints

- No SplitText — text/image reveals use CSS `clip-path` + `transform` + `opacity`, animated by GSAP, with lines authored as pre-broken JSX spans (no runtime text-splitting library). (Spec §3.3)
- Exactly one WebGL `<Canvas>` in the whole app, scoped to the Hero section, mounted via `next/dynamic(..., { ssr: false })`. (Spec §3.1, §7)
- The Hero's 3D object is a placeholder primitive — final visual direction is a design decision for later, not this plan. (Spec §3.1, §7)
- Lenis owns physical scroll; GSAP `ScrollTrigger` is synced to it via `gsap.ticker` — no separate scroll library, no `ScrollSmoother`. (Spec §3.2)
- Content is typed local mock data under `lib/data/*.ts` against `types/content.ts` — no CMS, no fetch calls. (Spec §3.4)
- Every scroll/pin/pointer-driven animation is gated by `prefers-reduced-motion` and degrades to an instantly-visible, non-pinned, non-WebGL state. (Spec §6)
- No new dependencies beyond what's already in `package.json` (GSAP, Lenis, Three/R3F/drei, `lucide-react`, shadcn primitives are all already installed).
- **Do not run `git commit`, `git push`, or any git history command.** Every phase ends with files left modified/untracked for the user to review and commit manually. No task in this plan includes a commit step.
- Verification per phase uses `npx tsc --noEmit`, `npm run lint`, `npm run build`, and a concrete manual browser check (`npm run dev`) — this is a visual/motion product, so "testing" here means specific, repeatable browser checks, not unit-test assertions.

---

## File Structure (target end-state)

```
app/
  layout.tsx
  page.tsx
  globals.css
components/
  ui/                       # shadcn (existing)
  layout/
    navbar.tsx
    footer.tsx
    smooth-scroll-provider.tsx
  preloader/
    preloader.tsx
    preloader-progress.tsx
  sections/
    hero/{hero-section,hero-copy,hero-scroll-cue}.tsx
    manifesto/manifesto-section.tsx
    programs/{programs-section,program-card}.tsx
    experience/experience-section.tsx
    stats/{stats-section,animated-stat}.tsx
    trainers/{trainers-section,trainer-card}.tsx
    membership/{membership-section,membership-tier-card}.tsx
    cta/final-cta-section.tsx
  common/
    reveal-text.tsx
    reveal-image.tsx
    magnetic-button.tsx
    section-heading.tsx
three/
  hero-scene/{hero-canvas,hero-scene,hero-mesh,use-hero-scroll-rig}.tsx|ts
  shared/{canvas-shell.tsx,pointer-parallax.ts}
lib/
  utils.ts                  # existing
  gsap/{register.ts,tokens.ts}
  data/{programs,trainers,stats,membership}.ts
hooks/
  use-lenis.ts
  use-reduced-motion.ts
  use-mouse-position.ts
types/
  content.ts
```

---

### Task 1: Design tokens, typography, and public cleanup

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Delete: `public/next.svg`, `public/vercel.svg`, `public/globe.svg`, `public/window.svg`, `public/file.svg`

**Dependencies:** None beyond `next/font/google` (part of Next.js already).

**Implementation details:**

Replace the neutral shadcn palette with a dark-first editorial palette, and add a type scale. In `app/globals.css`, change the `:root` block's color tokens to:

```css
:root {
  --background: oklch(0.09 0 0);
  --foreground: oklch(0.96 0 0);
  --card: oklch(0.13 0 0);
  --card-foreground: oklch(0.96 0 0);
  --popover: oklch(0.13 0 0);
  --popover-foreground: oklch(0.96 0 0);
  --primary: oklch(0.96 0 0);
  --primary-foreground: oklch(0.09 0 0);
  --secondary: oklch(0.18 0 0);
  --secondary-foreground: oklch(0.96 0 0);
  --muted: oklch(0.18 0 0);
  --muted-foreground: oklch(0.65 0 0);
  --accent: oklch(0.83 0.18 128);
  --accent-foreground: oklch(0.09 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.65 0 0);
  --radius: 0.25rem;
}
```

Remove/ignore the `.dark { ... }` block's special-casing — the site is dark-only, no theme toggle, so leave it as-is (unused) rather than deleting shadcn's generated block.

Add a type scale and display font token inside the existing `@theme inline` block (append, don't remove existing lines):

```css
@theme inline {
  /* ...existing lines... */
  --font-display: var(--font-display);
  --text-display: clamp(2.75rem, 6vw + 1rem, 7rem);
  --text-headline: clamp(2rem, 3.5vw + 1rem, 3.5rem);
  --text-subhead: clamp(1.25rem, 1vw + 1rem, 1.5rem);
  --text-body: clamp(1rem, 0.3vw + 0.9rem, 1.125rem);
  --text-caption: 0.8125rem;
  --tracking-wide: 0.08em;
}
```

`clamp()` in a Tailwind v4 `@theme inline` token becomes usable as `text-display`, `text-headline`, etc. utility classes — confirm this works during validation (see below).

In `app/layout.tsx`, replace the `Inter`/`Geist`/`Geist_Mono` imports with:

```tsx
import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const displayFont = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APEX — Performance Training Studio",
  description:
    "APEX is a premium performance training studio for athletes who refuse to plateau.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", displayFont.variable, bodyFont.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

Delete the five unused create-next-app SVGs from `public/` (keep `favicon.ico`).

**Animation behavior:** None in this task — pure design tokens.

**Responsive considerations:** All new type tokens use `clamp()` so headline/body sizes scale fluidly between mobile and desktop without separate breakpoint overrides.

**Accessibility considerations:** Verify the new `--muted-foreground` (`oklch(0.65 0 0)`) against `--background` (`oklch(0.09 0 0)`) meets WCAG AA (4.5:1) for body-sized text — check with the browser's contrast checker during validation; if it fails, raise the lightness value slightly (e.g. `0.7`).

**Performance considerations:** `display: "swap"` on both fonts avoids invisible-text-on-load (FOIT).

- [ ] **Step 1: Apply the CSS token changes to `app/globals.css`.**
- [ ] **Step 2: Apply the font/layout changes to `app/layout.tsx`.**
- [ ] **Step 3: Delete the five unused SVGs from `public/`.**
- [ ] **Step 4: Run `npx tsc --noEmit` and `npm run lint` — both must pass clean.**
- [ ] **Step 5: Run `npm run dev`, open `localhost:3000`.** Expected: the existing boilerplate `app/page.tsx` content now renders on a near-black background with off-white text; inspect the `<h1>` in devtools and confirm its computed `font-family` includes "Oswald" once `font-display` utility is applied ad hoc (temporarily add `className="font-display"` to the boilerplate `<h1>` to confirm, then remove — this file is fully replaced in Task 5 anyway).
- [ ] **Step 6: Run `npm run build`.** Expected: succeeds with no warnings.

**Expected result:** Dark editorial theme and both fonts are loaded and available as `font-sans` / `font-display` utilities; unused starter assets are gone; nothing user-facing has structurally changed yet.

---

### Task 2: Global layout, GSAP registration, and smooth-scroll foundation

**Files:**
- Create: `lib/gsap/register.ts`
- Create: `lib/gsap/tokens.ts`
- Create: `hooks/use-reduced-motion.ts`
- Create: `hooks/use-lenis.ts`
- Create: `components/layout/smooth-scroll-provider.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx` (temporary scaffold — see below)

**Dependencies:** `gsap`, `gsap/ScrollTrigger`, `@gsap/react`, `lenis` (all already installed).

**Implementation details:**

`lib/gsap/register.ts`:

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}
```

`lib/gsap/tokens.ts`:

```ts
export const EASE = {
  standard: "power3.out",
  entrance: "power4.out",
  exit: "power2.in",
} as const;

export const DURATION = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
} as const;
```

`hooks/use-reduced-motion.ts`:

```tsx
"use client";

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}
```

`hooks/use-lenis.ts`:

```tsx
"use client";

import { createContext, useContext } from "react";
import type Lenis from "lenis";

export const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}
```

`components/layout/smooth-scroll-provider.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsap } from "@/lib/gsap/register";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LenisContext } from "@/hooks/use-lenis";

registerGsap();

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenisRef.current = lenis;
    setLenisInstance(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, [reducedMotion]);

  return <LenisContext.Provider value={lenisInstance}>{children}</LenisContext.Provider>;
}
```

Note: `gsap.ticker.add` callback receives time in seconds already scaled by GSAP; `lenis.raf` expects milliseconds-since-origin per Lenis's docs convention of passing the raw timestamp — pass `time * 1000` if using GSAP's ticker time (seconds since ticker start). Use:

```ts
function raf(time: number) {
  lenis.raf(time * 1000);
}
```

Modify `app/layout.tsx` to wrap `{children}`:

```tsx
import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
// ...
<body className="min-h-full flex flex-col bg-background text-foreground">
  <SmoothScrollProvider>{children}</SmoothScrollProvider>
</body>
```

**Scaffold `app/page.tsx`** so the page is scrollable and every later phase has exactly one placeholder to replace, in final order:

```tsx
const SECTIONS = [
  "hero",
  "manifesto",
  "programs",
  "experience",
  "stats",
  "trainers",
  "membership",
  "cta",
] as const;

export default function Home() {
  return (
    <main>
      {SECTIONS.map((id) => (
        <section
          key={id}
          id={id}
          className="flex h-screen items-center justify-center border-b border-border text-2xl uppercase tracking-widest text-muted-foreground"
        >
          {id} placeholder
        </section>
      ))}
    </main>
  );
}
```

Each later phase (5, 8–15) replaces exactly one `<section id="...">...</section>` placeholder with the real component's import — the rest stay placeholders until their own phase.

**Animation behavior:** None yet — this task only wires the scroll engine.

**Responsive considerations:** N/A (no visual components yet).

**Accessibility considerations:** When `prefers-reduced-motion` is set, `SmoothScrollProvider` never constructs a `Lenis` instance at all, so scrolling falls back to native browser scroll — the most accessible/predictable behavior for that preference.

**Performance considerations:** `gsap.ticker.lagSmoothing(0)` disables GSAP's tab-inactive catch-up behavior, which otherwise causes Lenis/ScrollTrigger desync after switching tabs and coming back.

- [ ] **Step 1: Create the four new files (`lib/gsap/register.ts`, `lib/gsap/tokens.ts`, `hooks/use-reduced-motion.ts`, `hooks/use-lenis.ts`).**
- [ ] **Step 2: Create `components/layout/smooth-scroll-provider.tsx`.**
- [ ] **Step 3: Modify `app/layout.tsx` to wrap children in `SmoothScrollProvider`.**
- [ ] **Step 4: Replace `app/page.tsx` with the 8-section scaffold above.**
- [ ] **Step 5: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 6: Run `npm run dev`.** Expected: page shows 8 stacked full-height labeled placeholder sections; scrolling feels smoothed/inertial (Lenis active); open devtools console — no errors.
- [ ] **Step 7: In devtools, emulate `prefers-reduced-motion: reduce` (Rendering tab → Emulate CSS media feature), reload.** Expected: scroll still works via native browser scroll (no smoothing), no console errors.
- [ ] **Step 8: Run `npm run build`.** Expected: succeeds.

**Expected result:** A scrollable 8-placeholder page with Lenis+GSAP wired end-to-end and reduced-motion already respected at the foundation level.

---

### Task 3: Preloader

**Files:**
- Create: `components/preloader/preloader.tsx`
- Create: `components/preloader/preloader-progress.tsx`
- Modify: `app/layout.tsx`

**Dependencies:** `@gsap/react`, `gsap` (installed). No new packages.

**Implementation details:**

`components/preloader/preloader-progress.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export function PreloaderProgress() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const counter = { value: 0 };
    gsap.to(counter, {
      value: 100,
      duration: 0.8,
      ease: "power1.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = `${Math.round(counter.value)}%`;
      },
    });
  }, []);

  return (
    <span
      ref={ref}
      className="absolute bottom-8 right-8 font-sans text-caption uppercase tracking-wide text-muted-foreground"
    >
      0%
    </span>
  );
}
```

`components/preloader/preloader.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useLenis } from "@/hooks/use-lenis";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { PreloaderProgress } from "./preloader-progress";

const PreloaderContext = createContext(false);

export function usePreloaderComplete(): boolean {
  return useContext(PreloaderContext);
}

export function Preloader({ children }: { children: ReactNode }) {
  const [complete, setComplete] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    lenis?.stop();
  }, [lenis]);

  useGSAP(
    () => {
      if (reducedMotion) {
        setComplete(true);
        lenis?.start();
        return;
      }

      const minimumDisplay = new Promise<void>((resolve) => setTimeout(resolve, 800));
      const fontsReady =
        typeof document !== "undefined" && "fonts" in document
          ? document.fonts.ready
          : Promise.resolve();

      Promise.all([minimumDisplay, fontsReady]).then(() => {
        gsap
          .timeline({
            onComplete: () => {
              setComplete(true);
              lenis?.start();
            },
          })
          .to("[data-preloader-word]", { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power4.out" })
          .to("[data-preloader-progress]", { opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.2")
          .to(overlayRef.current, { yPercent: -100, duration: 0.8, ease: "power4.inOut" })
          .set(overlayRef.current, { display: "none" });
      });
    },
    { scope: overlayRef, dependencies: [reducedMotion, lenis] }
  );

  return (
    <PreloaderContext.Provider value={complete}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        aria-hidden="true"
      >
        <span
          data-preloader-word
          className="font-display text-display uppercase tracking-wide text-foreground"
          style={{ clipPath: "inset(0 0 100% 0)" }}
        >
          APEX
        </span>
        <PreloaderProgress />
      </div>
      <div inert={complete ? undefined : true}>{children}</div>
    </PreloaderContext.Provider>
  );
}
```

Modify `app/layout.tsx` — wrap children with `Preloader` inside `SmoothScrollProvider`:

```tsx
<SmoothScrollProvider>
  <Preloader>{children}</Preloader>
</SmoothScrollProvider>
```

**Animation behavior:** Wordmark clip-path wipes open top-to-bottom, progress counts 0→100%, then the whole overlay slides up (`yPercent: -100`) and is removed from layout (`display: none`). Runs once per page load, gated on `document.fonts.ready` plus an 800ms minimum so it never feels like a flash.

**Responsive considerations:** Overlay is `fixed inset-0`, wordmark uses the fluid `text-display` token, so it centers correctly at any viewport size without breakpoint-specific rules.

**Accessibility considerations:** The overlay is `aria-hidden="true"` (it's decorative chrome, not content). The actual page content is wrapped in a `<div inert>` until `complete` flips true — this blocks focus and interaction with the page behind the preloader without needing manual `tabindex` management. `prefers-reduced-motion` skips straight to `complete`, `lenis?.start()`, and never mounts the timeline.

**Performance considerations:** The timeline only starts after `document.fonts.ready`, avoiding a wordmark reveal in a fallback font.

- [ ] **Step 1: Create `preloader-progress.tsx` and `preloader.tsx`.**
- [ ] **Step 2: Modify `app/layout.tsx` to wrap children in `Preloader`.**
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, hard-reload `localhost:3000`.** Expected: full-screen dark overlay shows "APEX" wiping in top-to-bottom, a `0%`→`100%` counter bottom-right, then the whole panel slides up revealing the 8 placeholder sections; page does not scroll during this sequence.
- [ ] **Step 5: While the preloader is visible, press Tab repeatedly.** Expected: focus does not land on anything behind the overlay (the `inert` wrapper is working).
- [ ] **Step 6: Emulate `prefers-reduced-motion: reduce`, reload.** Expected: preloader overlay is skipped entirely / instantly gone, page is immediately scrollable.
- [ ] **Step 7: Run `npm run build`.** Expected: succeeds.

**Expected result:** A working cinematic preloader that gates scroll and interaction until content/fonts are ready, fully bypassed under reduced motion.

---

### Task 4: Navigation

**Files:**
- Create: `components/layout/navbar.tsx`
- Modify: `app/page.tsx` (render `<Navbar />` and a skip link above `<main>`)

**Dependencies:** `@gsap/react`, `gsap/ScrollTrigger` (registered in Task 2). No new packages.

**Implementation details:**

`components/layout/navbar.tsx`:

```tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePreloaderComplete } from "@/components/preloader/preloader";

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
      <a
        href="#membership"
        className="rounded-full border border-foreground px-5 py-2 text-sm uppercase tracking-wide text-foreground"
      >
        Join
      </a>
    </nav>
  );
}
```

(A mobile hamburger menu is intentionally deferred to Task 17 — for now, the middle links simply hide below `md`, leaving wordmark + Join button, which is a complete, if minimal, mobile nav.)

Modify `app/page.tsx`:

```tsx
import { Navbar } from "@/components/layout/navbar";

const SECTIONS = [/* unchanged */] as const;

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-foreground"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        {SECTIONS.map((id) => (
          <section key={id} id={id} className="...">
            {id} placeholder
          </section>
        ))}
      </main>
    </>
  );
}
```

**Animation behavior:** Background/blur transition on scroll past 80px is a plain CSS `transition-colors` toggled via a `data-state` attribute driven by one `ScrollTrigger` — not a per-frame GSAP tween, avoiding unnecessary animation overhead for a binary state change.

**Responsive considerations:** Full link list only shows `md:flex` and up; mobile keeps wordmark + Join button. Full mobile drawer built in Task 17.

**Accessibility considerations:** `<nav aria-label="Primary">` gives the landmark a distinguishable name (useful once the footer also has nav-like links). Skip link is the first focusable element on the page, visually hidden until focused. All nav items are real `<a>`/`<Link>` text, not icon-only.

**Performance considerations:** The `ScrollTrigger.create` here has no `scrub`/`pin`, just a single `onUpdate` callback — negligible cost.

- [ ] **Step 1: Create `components/layout/navbar.tsx`.**
- [ ] **Step 2: Modify `app/page.tsx`** to add the skip link, `<Navbar />`, and `<main id="main-content">` wrapper around the placeholder sections.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`.** Expected: nav bar visible over the hero placeholder, transparent at top; scroll past ~80px and confirm it gains a translucent/blurred background.
- [ ] **Step 5: Keyboard-only pass** — load the page, press Tab once. Expected: "Skip to content" link appears top-left; press Enter, focus jumps to `#main-content`; continue tabbing through wordmark → nav links → Join button in visual order.
- [ ] **Step 6: Run `npm run build`.** Expected: succeeds.

**Expected result:** A fixed, scroll-aware nav bar with working anchor links, a skip link, and correct keyboard focus order.

---

### Task 5: Hero structure

**Files:**
- Create: `components/sections/hero/hero-section.tsx`
- Create: `components/sections/hero/hero-copy.tsx`
- Create: `components/sections/hero/hero-scroll-cue.tsx`
- Modify: `app/page.tsx` (replace the `hero` placeholder `<section>` with `<HeroSection />`)

**Dependencies:** None new.

**Implementation details:**

`components/sections/hero/hero-scroll-cue.tsx`:

```tsx
export function HeroScrollCue() {
  return (
    <div className="flex items-center gap-3 text-caption uppercase tracking-widest text-muted-foreground">
      <span>Scroll</span>
      <span aria-hidden="true" className="h-8 w-px bg-current motion-safe:animate-pulse" />
    </div>
  );
}
```

`components/sections/hero/hero-copy.tsx` (static version — GSAP reveal added in Task 7):

```tsx
export function HeroCopy() {
  return (
    <div className="max-w-3xl">
      <p className="text-caption uppercase tracking-widest text-muted-foreground">Est. Performance</p>
      <h1 className="mt-4 font-display text-display uppercase leading-[0.9] text-foreground">
        Train Like The
        <br />
        Machine You Are
      </h1>
      <p className="mt-6 max-w-md text-body text-muted-foreground">
        APEX is a performance training studio built for athletes who refuse to plateau. Precision
        programming, elite coaching, uncompromising standards.
      </p>
      <a
        href="#membership"
        className="mt-8 inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-wide text-background"
      >
        Start Training
      </a>
    </div>
  );
}
```

`components/sections/hero/hero-section.tsx`:

```tsx
import { HeroCopy } from "./hero-copy";
import { HeroScrollCue } from "./hero-scroll-cue";

export function HeroSection() {
  return (
    <section id="hero" className="relative h-[150vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-between overflow-hidden bg-background px-6 py-10 md:px-12">
        <HeroCopy />
        <HeroScrollCue />
      </div>
    </section>
  );
}
```

Modify `app/page.tsx`: remove `"hero"` from the `SECTIONS` placeholder array and render `<HeroSection />` as the first child of `<main>`, before the remaining placeholders.

**Animation behavior:** None yet — purely structural/typographic. The `150vh` outer wrapper + `sticky` inner container is the scroll-track the Three.js canvas (Task 6) and scroll-driven GSAP (Task 7) will use.

**Responsive considerations:** `text-display` clamp token scales the headline fluidly; `px-6 md:px-12` reduces side padding on mobile; `justify-between` keeps the scroll cue pinned to the bottom of the viewport regardless of headline length, tested down to 375px width.

**Accessibility considerations:** This is the only `<h1>` on the page — verify no other section introduces a second one. Scroll cue's pulsing line is `aria-hidden="true"` (decorative) and uses `motion-safe:animate-pulse`, a Tailwind variant that already no-ops under `prefers-reduced-motion` without any JS.

**Performance considerations:** No JS animation yet, so this task has no runtime cost beyond the CSS `motion-safe` keyframe.

- [ ] **Step 1: Create the three new Hero files.**
- [ ] **Step 2: Modify `app/page.tsx`** to swap the hero placeholder for `<HeroSection />`.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`.** Expected: hero fills the viewport, headline scales fluidly on resize (test 375px/768px/1440px), scroll cue stays bottom-aligned, scrolling past the hero takes ~1.5 viewport heights before the next placeholder appears (confirming the sticky/150vh track).
- [ ] **Step 5: Open devtools Accessibility tree, confirm exactly one `<h1>` exists on the page.**
- [ ] **Step 6: Run `npm run build`.** Expected: succeeds.

**Expected result:** A full-viewport hero with the scroll-track structure ready for the 3D scene and entrance animation.

---

### Task 6: Three.js hero scene

**Files:**
- Create: `hooks/use-mouse-position.ts`
- Create: `three/shared/pointer-parallax.ts`
- Create: `three/shared/canvas-shell.tsx`
- Create: `three/hero-scene/hero-mesh.tsx`
- Create: `three/hero-scene/use-hero-scroll-rig.ts`
- Create: `three/hero-scene/hero-scene.tsx`
- Create: `three/hero-scene/hero-canvas.tsx`
- Modify: `components/sections/hero/hero-section.tsx` (mount `<HeroCanvas />`, becomes `"use client"`)

**Dependencies:** `three`, `@react-three/fiber`, `@react-three/drei` (installed, `drei` not directly used yet but available for later polish).

**Implementation details:**

`hooks/use-mouse-position.ts`:

```tsx
"use client";

import { useEffect, useRef } from "react";

export function useMousePosition() {
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      position.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      position.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return position;
}
```

`three/shared/pointer-parallax.ts`:

```ts
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}
```

`three/shared/canvas-shell.tsx`:

```tsx
"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";

export function CanvasShell({ children }: { children: ReactNode }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 45, position: [0, 0, 6] }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
```

`three/hero-scene/hero-mesh.tsx`:

```tsx
// Placeholder geometry — swap for the final art direction once it's chosen
// (see docs/superpowers/specs/2026-08-29-apex-fitness-architecture-design.md §7).
export function HeroMesh() {
  return (
    <mesh castShadow receiveShadow>
      <icosahedronGeometry args={[1.6, 1]} />
      <meshStandardMaterial color="#e5e5e5" roughness={0.25} metalness={0.6} flatShading />
    </mesh>
  );
}
```

`three/hero-scene/use-hero-scroll-rig.ts`:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Group } from "three";
import { lerp } from "@/three/shared/pointer-parallax";
import { useMousePosition } from "@/hooks/use-mouse-position";

export function useHeroScrollRig(triggerSelector: string) {
  const groupRef = useRef<Group>(null);
  const scrollProgress = useRef(0);
  const pointer = useMousePosition();

  useGSAP(() => {
    const trigger = ScrollTrigger.create({
      trigger: triggerSelector,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, [triggerSelector]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    group.rotation.y = lerp(group.rotation.y, pointer.current.x * 0.4, 0.05);
    group.rotation.x = lerp(group.rotation.x, -pointer.current.y * 0.2, 0.05);
    group.position.y = lerp(group.position.y, -scrollProgress.current * 1.5, 0.08);
  });

  return groupRef;
}
```

`three/hero-scene/hero-scene.tsx`:

```tsx
"use client";

import { useHeroScrollRig } from "./use-hero-scroll-rig";
import { HeroMesh } from "./hero-mesh";

export function HeroScene({ triggerSelector }: { triggerSelector: string }) {
  const groupRef = useHeroScrollRig(triggerSelector);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 4, 4]} intensity={1.4} />
      <group ref={groupRef}>
        <HeroMesh />
      </group>
    </>
  );
}
```

`three/hero-scene/hero-canvas.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

const CanvasShell = dynamic(
  () => import("@/three/shared/canvas-shell").then((mod) => mod.CanvasShell),
  { ssr: false }
);
const HeroScene = dynamic(() => import("./hero-scene").then((mod) => mod.HeroScene), { ssr: false });

export function HeroCanvas({ triggerSelector }: { triggerSelector: string }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <CanvasShell>
        <HeroScene triggerSelector={triggerSelector} />
      </CanvasShell>
    </div>
  );
}
```

Modify `components/sections/hero/hero-section.tsx` — add `"use client"` (now needs `useReducedMotion`), mount the canvas behind the copy:

```tsx
"use client";

import { HeroCanvas } from "@/three/hero-scene/hero-canvas";
import { HeroCopy } from "./hero-copy";
import { HeroScrollCue } from "./hero-scroll-cue";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HeroSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="hero" className="relative h-[150vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        {!reducedMotion && <HeroCanvas triggerSelector="#hero" />}
        <div className="relative z-10 flex h-full flex-col justify-between px-6 py-10 md:px-12">
          <HeroCopy />
          <HeroScrollCue />
        </div>
      </div>
    </section>
  );
}
```

**Animation behavior:** The mesh's `group` rotates toward the normalized pointer position and drifts vertically with hero scroll progress, all lerped toward target each frame inside `useFrame` (never via React state) for smooth motion without re-renders.

**Responsive considerations:** `dpr={[1, 2]}` caps device-pixel-ratio cost on high-DPI phones; canvas is `absolute inset-0` so it always fills its sticky parent regardless of viewport size.

**Accessibility considerations:** The canvas wrapper is `pointer-events-none` and `aria-hidden="true"` — it's a decorative visual layer, not interactive content, and never receives focus. Under `prefers-reduced-motion`, `HeroCanvas` is not mounted at all — no WebGL context is created for those users.

**Performance considerations:** `frameloop` is left at R3F's default (`"always"`) because the rig has genuine continuous idle motion (constant lerp-toward-target); this is acceptable specifically because it's the *only* Canvas in the entire app. Both `HeroCanvas`'s internals are dynamically imported with `ssr: false`, keeping `three`/`@react-three/*` out of the server bundle and out of the initial client bundle until the Hero actually needs them.

- [ ] **Step 1: Create all six new Three.js/hook files.**
- [ ] **Step 2: Modify `hero-section.tsx`** to add `"use client"` and mount `<HeroCanvas />`.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`.** Expected: a lit, faceted icosahedron renders behind the hero copy; moving the mouse subtly rotates it; scrolling through the hero's 150vh track drifts it downward.
- [ ] **Step 5: View page source (`curl localhost:3000` or devtools "View Page Source") and confirm no `<canvas>` markup is present in the server-rendered HTML** (it should only appear after client-side hydration — confirms `ssr: false` is working).
- [ ] **Step 6: Emulate `prefers-reduced-motion: reduce`, reload.** Expected: no 3D object renders at all, hero copy is unaffected.
- [ ] **Step 7: Open devtools Performance panel, record ~5s of scrolling through the hero.** Expected: sustained frame rate close to the display refresh rate, no long tasks over ~50ms attributable to the render loop.
- [ ] **Step 8: Run `npm run build`.** Expected: succeeds; note the separate chunk for the three/r3f code in the build output.

**Expected result:** A single, isolated, scroll- and pointer-driven WebGL hero scene that never loads for reduced-motion users.

---

### Task 7: Hero GSAP entrance animation

**Files:**
- Create: `components/common/reveal-text.tsx`
- Modify: `components/sections/hero/hero-copy.tsx`
- Modify: `components/sections/hero/hero-section.tsx` (fade in the canvas on preloader completion)

**Dependencies:** None new.

**Implementation details:**

`components/common/reveal-text.tsx` (the shared reveal primitive — first used here, reused from Task 9 onward):

```tsx
"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type RevealTextProps = {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  trigger?: "scroll" | "manual";
  active?: boolean;
};

export function RevealText({
  lines,
  as: Tag = "p",
  className,
  trigger = "scroll",
  active = true,
}: RevealTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (trigger !== "scroll" || reducedMotion) return;

      gsap.fromTo(
        containerRef.current!.querySelectorAll("[data-reveal-line]"),
        { clipPath: "inset(0 0 100% 0)", yPercent: 30 },
        {
          clipPath: "inset(0 0 0% 0)",
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: containerRef.current, start: "top 80%" },
        }
      );
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  useGSAP(
    () => {
      if (trigger !== "manual" || !active || reducedMotion) return;

      gsap.to(containerRef.current!.querySelectorAll("[data-reveal-line]"), {
        clipPath: "inset(0 0 0% 0)",
        yPercent: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.08,
      });
    },
    { scope: containerRef, dependencies: [trigger, active, reducedMotion] }
  );

  return (
    <Tag ref={containerRef} className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden">
          <span
            data-reveal-line
            className="block"
            style={reducedMotion ? undefined : { clipPath: "inset(0 0 100% 0)", transform: "translateY(30%)" }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
```

Modify `components/sections/hero/hero-copy.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { usePreloaderComplete } from "@/components/preloader/preloader";
import { RevealText } from "@/components/common/reveal-text";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HeroCopy() {
  const preloaderComplete = usePreloaderComplete();
  const reducedMotion = useReducedMotion();
  const supportingRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!preloaderComplete || reducedMotion) return;

      gsap.fromTo(
        supportingRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.6 }
      );
    },
    { scope: supportingRef, dependencies: [preloaderComplete, reducedMotion] }
  );

  return (
    <div className="max-w-3xl">
      <RevealText
        as="p"
        trigger="manual"
        active={preloaderComplete}
        lines={["Est. Performance"]}
        className="text-caption uppercase tracking-widest text-muted-foreground"
      />
      <RevealText
        as="h1"
        trigger="manual"
        active={preloaderComplete}
        lines={["Train Like The", "Machine You Are"]}
        className="mt-4 font-display text-display uppercase leading-[0.9] text-foreground"
      />
      <div
        ref={supportingRef}
        className="mt-6 max-w-md"
        style={{ opacity: reducedMotion ? 1 : 0 }}
      >
        <p className="text-body text-muted-foreground">
          APEX is a performance training studio built for athletes who refuse to plateau. Precision
          programming, elite coaching, uncompromising standards.
        </p>
        <a
          href="#membership"
          className="mt-8 inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-wide text-background"
        >
          Start Training
        </a>
      </div>
    </div>
  );
}
```

Modify `hero-section.tsx` to fade the canvas in on preloader completion:

```tsx
"use client";

import { HeroCanvas } from "@/three/hero-scene/hero-canvas";
import { HeroCopy } from "./hero-copy";
import { HeroScrollCue } from "./hero-scroll-cue";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { usePreloaderComplete } from "@/components/preloader/preloader";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  const preloaderComplete = usePreloaderComplete();

  return (
    <section id="hero" className="relative h-[150vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        {!reducedMotion && (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              preloaderComplete ? "opacity-100" : "opacity-0"
            )}
          >
            <HeroCanvas triggerSelector="#hero" />
          </div>
        )}
        <div className="relative z-10 flex h-full flex-col justify-between px-6 py-10 md:px-12">
          <HeroCopy />
          <HeroScrollCue />
        </div>
      </div>
    </section>
  );
}
```

**Animation behavior:** On preloader completion: headline + kicker clip-reveal in a staggered sequence (`RevealText` manual mode), supporting copy/CTA fade up 0.6s later, and the 3D canvas cross-fades in over 700ms — three beats, not simultaneous, matching the spec's animation hierarchy (§6).

**Responsive considerations:** Unchanged from Task 5 — reveal only affects opacity/clip-path, not layout.

**Accessibility considerations:** When `reducedMotion` is true, `RevealText`'s inline `style` is `undefined` so every line is visible immediately and both of its internal `useGSAP` effects bail out; `HeroCopy`'s supporting block starts at `opacity: 1` in that case too — nothing depends on a GSAP tween ever firing to become visible.

**Performance considerations:** All reveal work is `clip-path`/`opacity`/`transform`, which the browser can composite on the GPU — no layout thrashing.

- [ ] **Step 1: Create `components/common/reveal-text.tsx`.**
- [ ] **Step 2: Modify `hero-copy.tsx` and `hero-section.tsx`** as above.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, hard-reload.** Expected: after the preloader slides away, the kicker line and the two headline lines clip-reveal in a quick stagger, then the supporting paragraph/CTA fade up, then the 3D object fades in — in that order, not all at once.
- [ ] **Step 5: Emulate `prefers-reduced-motion: reduce`, reload.** Expected: preloader is skipped, and the full hero (text + no 3D scene) is visible immediately with no hidden/clipped elements stuck invisible.
- [ ] **Step 6: Run `npm run build`.** Expected: succeeds.

**Expected result:** A complete, hierarchical Hero entrance sequence, with a reusable `RevealText` component ready for reuse in later sections.

---

### Task 8: Manifesto section

> Note: this section was not in the original 18-element brief or the approved architecture spec — it's an addition from the plan-ordering request. It introduces no new architecture: it's a full-bleed statement built entirely from the `RevealText` component already created in Task 7, used in its default `trigger="scroll"` mode for the first time.

**Files:**
- Create: `components/sections/manifesto/manifesto-section.tsx`
- Modify: `app/page.tsx` (replace the `manifesto` placeholder)

**Dependencies:** None new.

**Implementation details:**

```tsx
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
```

**Animation behavior:** Default `RevealText` scroll mode — the two lines clip-reveal with a stagger once the section reaches 80% of the viewport height, exactly like Programs/Trainers/Membership headings will (Task 9+). This is the first real test of that default (non-manual) path.

**Responsive considerations:** `max-w-4xl` + `text-center` keeps the statement readable and centered from mobile to desktop; `text-headline`'s `clamp()` handles font scaling.

**Accessibility considerations:** This is an `<h2>` — the second heading level on the page after the Hero's `<h1>`, preserving correct heading order.

**Performance considerations:** No new component logic — reuses `RevealText`'s existing `ScrollTrigger`.

- [ ] **Step 1: Create `manifesto-section.tsx`.**
- [ ] **Step 2: Modify `app/page.tsx`** to replace the `manifesto` placeholder `<section>` with `<ManifestoSection />`.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, scroll to the manifesto section.** Expected: the two lines clip-reveal with a stagger as the section enters the viewport (scrolling up past it and back down should not re-trigger it oddly — confirm no flicker).
- [ ] **Step 5: Confirm in devtools Accessibility tree that this heading is an `<h2>`, immediately after the Hero's `<h1>` in DOM order.**
- [ ] **Step 6: Run `npm run build`.** Expected: succeeds.

**Expected result:** A minimal, high-impact editorial statement section, and confirmation that `RevealText`'s default scroll-triggered mode works standalone.

---

### Task 9: Programs section

**Files:**
- Create: `types/content.ts`
- Create: `lib/data/programs.ts`
- Create: `components/common/section-heading.tsx`
- Create: `components/sections/programs/programs-section.tsx`
- Create: `components/sections/programs/program-card.tsx`
- Modify: `app/page.tsx` (replace the `programs` placeholder)

**Dependencies:** None new.

**Implementation details:**

`types/content.ts`:

```ts
export type Program = {
  id: string;
  name: string;
  description: string;
  duration: string;
  intensity: "Low" | "Moderate" | "High" | "Elite";
};

export type Trainer = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageAlt: string;
};

export type Stat = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
};

export type MembershipTier = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  features: string[];
  featured?: boolean;
};
```

`lib/data/programs.ts`:

```ts
import type { Program } from "@/types/content";

export const programs: Program[] = [
  {
    id: "strength",
    name: "Strength Foundations",
    description: "Progressive overload programming built on compound movement mastery.",
    duration: "60 min",
    intensity: "High",
  },
  {
    id: "conditioning",
    name: "Metabolic Conditioning",
    description: "High-output interval work engineered for lasting endurance capacity.",
    duration: "45 min",
    intensity: "Elite",
  },
  {
    id: "mobility",
    name: "Mobility & Recovery",
    description: "Structured movement restoration for longevity under heavy load.",
    duration: "40 min",
    intensity: "Low",
  },
  {
    id: "performance",
    name: "Performance Lab",
    description: "Data-driven athletic testing and individualized correction.",
    duration: "75 min",
    intensity: "Moderate",
  },
];
```

`components/common/section-heading.tsx`:

```tsx
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
```

`components/sections/programs/program-card.tsx`:

```tsx
import type { Program } from "@/types/content";

export function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="border-t border-border py-8">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-subhead uppercase text-foreground">{program.name}</h3>
        <span className="text-caption uppercase tracking-wide text-muted-foreground">
          {program.duration} · {program.intensity}
        </span>
      </div>
      <p className="mt-3 max-w-xl text-body text-muted-foreground">{program.description}</p>
    </article>
  );
}
```

`components/sections/programs/programs-section.tsx`:

```tsx
import { programs } from "@/lib/data/programs";
import { SectionHeading } from "@/components/common/section-heading";
import { ProgramCard } from "./program-card";

export function ProgramsSection() {
  return (
    <section id="programs" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="Programs" title="Built To Progress" />
      <div className="mt-12">
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </section>
  );
}
```

**Animation behavior:** Section heading uses the shared scroll-reveal from `SectionHeading`/`RevealText`; the four program rows themselves are static (no per-card animation) — deliberately restrained, per the "avoid animation on every element" rule.

**Responsive considerations:** Program rows stack full-width at all breakpoints (single-column list, not a grid), so nothing needs to change between mobile and desktop beyond the existing `px-6 md:px-12` padding.

**Accessibility considerations:** Each program is a semantic `<article>` with an `<h3>` — correct heading order (`h1` Hero → `h2` Manifesto/section headings → `h3` program names).

**Performance considerations:** Purely static content render — no additional `useGSAP` calls beyond what `SectionHeading` already sets up.

- [ ] **Step 1: Create `types/content.ts` and `lib/data/programs.ts`.**
- [ ] **Step 2: Create `section-heading.tsx`, `program-card.tsx`, `programs-section.tsx`.**
- [ ] **Step 3: Modify `app/page.tsx`** to replace the `programs` placeholder.
- [ ] **Step 4: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 5: Run `npm run dev`, scroll to Programs.** Expected: heading reveals on scroll-in, all four programs render with name/duration/intensity/description.
- [ ] **Step 6: Run `npm run build`.** Expected: succeeds.

**Expected result:** The first data-driven content section, plus the shared `SectionHeading` component reused by every remaining content section.

---

### Task 10: Training Experience pinned section

**Files:**
- Create: `components/sections/experience/experience-section.tsx`
- Modify: `app/page.tsx` (replace the `experience` placeholder)

**Dependencies:** None new.

**Implementation details:**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "assess", title: "Assess", copy: "Baseline testing across strength, conditioning, and movement quality." },
  { id: "program", title: "Program", copy: "A periodized plan built around your data, not a generic template." },
  { id: "train", title: "Train", copy: "Coached sessions with real-time load and form correction." },
  { id: "adapt", title: "Adapt", copy: "Continuous re-testing keeps the program moving with you." },
] as const;

export function ExperienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      const panels = gsap.utils.toArray<HTMLElement>("[data-experience-panel]");
      gsap.set(panels.slice(1), { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${panels.length * 500}`,
          pin: true,
          scrub: 1,
        },
      });

      panels.forEach((panel, index) => {
        if (index === 0) return;
        tl.to(panels[index - 1], { autoAlpha: 0, duration: 0.4 }, index).to(
          panel,
          { autoAlpha: 1, duration: 0.4 },
          index
        );
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative flex h-screen items-center overflow-hidden bg-background px-6 md:px-12"
    >
      {STEPS.map((step, index) => (
        <div
          key={step.id}
          data-experience-panel
          className={cn(reducedMotion ? "mb-16 last:mb-0" : "absolute inset-x-6 md:inset-x-12")}
        >
          <span className="text-caption uppercase tracking-widest text-muted-foreground">
            0{index + 1}
          </span>
          <h3 className="mt-2 font-display text-headline uppercase text-foreground">{step.title}</h3>
          <p className="mt-4 max-w-md text-body text-muted-foreground">{step.copy}</p>
        </div>
      ))}
    </section>
  );
}
```

**Animation behavior:** Section pins for `panels.length * 500` px of scroll (2000px total) while the four step panels crossfade via `autoAlpha` (opacity + `visibility`) driven by a scrubbed timeline — this is the one genuinely pinned/scrubbed section in the site, per spec §6.4.

**Responsive considerations:** The 500px-per-step scrub distance is a fixed default here; Task 17 revisits this with `gsap.matchMedia()` to shorten it on narrow viewports so the pin doesn't feel excessively long on mobile.

**Accessibility considerations:** `autoAlpha` (not plain `opacity`) sets `visibility: hidden` on inactive panels, which correctly removes them from the tab order and the accessibility tree — a screen reader won't announce three redundant hidden panels. Under `prefers-reduced-motion`, the section renders as a normal, non-pinned, vertically stacked list of all four steps (`mb-16 last:mb-0`, no `absolute` positioning, no `autoAlpha` applied).

**Performance considerations:** Only one `ScrollTrigger` with `pin: true` on the whole page — pinning is comparatively expensive if overused, so this is deliberately the only section that does it.

- [ ] **Step 1: Create `experience-section.tsx`.**
- [ ] **Step 2: Modify `app/page.tsx`** to replace the `experience` placeholder.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, scroll into the Experience section.** Expected: section pins in place; continuing to scroll crossfades Assess → Program → Train → Adapt; scrolling back up reverses the crossfade correctly; after the last step, scrolling further releases the pin and continues to Stats.
- [ ] **Step 5: Emulate `prefers-reduced-motion: reduce`, reload, scroll through this section.** Expected: no pin — all four steps are visible, stacked vertically, in normal scroll flow.
- [ ] **Step 6: Resize the browser window while mid-scroll through this section.** Expected: `ScrollTrigger` recalculates without visibly breaking the pin (no huge blank gap or premature release).
- [ ] **Step 7: Run `npm run build`.** Expected: succeeds.

**Expected result:** A working pinned, scroll-scrubbed 4-step showcase with a full non-pinned fallback for reduced motion.

---

### Task 11: Animated statistics

**Files:**
- Create: `lib/data/stats.ts`
- Create: `components/sections/stats/animated-stat.tsx`
- Create: `components/sections/stats/stats-section.tsx`
- Modify: `app/page.tsx` (replace the `stats` placeholder)

**Dependencies:** None new.

**Implementation details:**

`lib/data/stats.ts`:

```ts
import type { Stat } from "@/types/content";

export const stats: Stat[] = [
  { id: "members", label: "Active Members", value: 2400, suffix: "+" },
  { id: "coaches", label: "Certified Coaches", value: 18 },
  { id: "years", label: "Years Operating", value: 9 },
  { id: "sessions", label: "Sessions Delivered", value: 120000, suffix: "+" },
];
```

`components/sections/stats/animated-stat.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { Stat } from "@/types/content";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function AnimatedStat({ stat }: { stat: Stat }) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const node = valueRef.current;
      if (!node) return;

      if (reducedMotion) {
        node.textContent = `${stat.value.toLocaleString()}${stat.suffix ?? ""}`;
        return;
      }

      const counter = { value: 0 };
      gsap.to(counter, {
        value: stat.value,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: node, start: "top 85%", once: true },
        onUpdate: () => {
          node.textContent = `${Math.round(counter.value).toLocaleString()}${stat.suffix ?? ""}`;
        },
      });
    },
    { scope: valueRef, dependencies: [reducedMotion, stat.value, stat.suffix] }
  );

  return (
    <div className="border-t border-border py-8">
      <span ref={valueRef} className="block font-display text-headline text-foreground">
        0
      </span>
      <span className="mt-2 block text-caption uppercase tracking-widest text-muted-foreground">
        {stat.label}
      </span>
    </div>
  );
}
```

`components/sections/stats/stats-section.tsx`:

```tsx
import { stats } from "@/lib/data/stats";
import { SectionHeading } from "@/components/common/section-heading";
import { AnimatedStat } from "./animated-stat";

export function StatsSection() {
  return (
    <section id="stats" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="By The Numbers" title="Results, Measured" />
      <div className="mt-12 grid grid-cols-2 gap-x-8 md:grid-cols-4">
        {stats.map((stat) => (
          <AnimatedStat key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}
```

**Animation behavior:** Each stat counts up from 0 to its final value once, triggered when it reaches 85% of the viewport (`once: true`). **Deliberate deviation from spec §6.4's "scrub-tied to scroll progress":** a literal scroll-scrub on a numeric counter means the number visibly counts backward if the user scrolls up mid-viewport, which reads as broken rather than intentional. A one-shot count-up on first entry delivers the same "scroll-driven statistic" requirement without that artifact, so that's what this task implements.

**Responsive considerations:** `grid-cols-2` on mobile, `md:grid-cols-4` on desktop — four stats always readable without excessive scrolling on narrow viewports.

**Accessibility considerations:** Final formatted value (with `toLocaleString()` commas and `suffix`) is written directly into the element's `textContent`, so a screen reader visiting after the animation completes reads the correct final number either way (animated or reduced-motion instant).

**Performance considerions:** `once: true` ensures the `ScrollTrigger` self-disables after firing — no ongoing per-scroll cost once a stat has counted up.

- [ ] **Step 1: Create `lib/data/stats.ts`, `animated-stat.tsx`, `stats-section.tsx`.**
- [ ] **Step 2: Modify `app/page.tsx`** to replace the `stats` placeholder.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, scroll to Stats.** Expected: all four numbers count up from 0 to their final formatted value once, staying at the final value on further scroll up/down past the section.
- [ ] **Step 5: Emulate `prefers-reduced-motion: reduce`, reload, scroll to Stats.** Expected: final values appear immediately, correctly formatted.
- [ ] **Step 6: Run `npm run build`.** Expected: succeeds.

**Expected result:** A statistics grid with a one-shot, correctly-formatted scroll-triggered count-up.

---

### Task 12: Trainers section

**Files:**
- Create: `lib/data/trainers.ts`
- Create: `components/common/reveal-image.tsx`
- Create: `components/sections/trainers/trainer-card.tsx`
- Create: `components/sections/trainers/trainers-section.tsx`
- Modify: `app/page.tsx` (replace the `trainers` placeholder)

**Dependencies:** None new.

**Implementation details:**

`lib/data/trainers.ts`:

```ts
import type { Trainer } from "@/types/content";

export const trainers: Trainer[] = [
  {
    id: "morgan",
    name: "Morgan Reyes",
    role: "Head of Strength",
    bio: "12 years coaching elite and recreational athletes toward measurable strength gains.",
    imageAlt: "Portrait of trainer Morgan Reyes",
  },
  {
    id: "devon",
    name: "Devon Ashford",
    role: "Conditioning Coach",
    bio: "Specializes in metabolic conditioning and high-output interval design.",
    imageAlt: "Portrait of trainer Devon Ashford",
  },
  {
    id: "priya",
    name: "Priya Nathan",
    role: "Movement & Recovery",
    bio: "Focused on mobility, joint health, and long-term training longevity.",
    imageAlt: "Portrait of trainer Priya Nathan",
  },
];
```

`components/common/reveal-image.tsx`:

```tsx
"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function RevealImage({ children, className }: { children: ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.fromTo(
        containerRef.current,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1,
          ease: "power4.out",
          scrollTrigger: { trigger: containerRef.current, start: "top 85%" },
        }
      );
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={reducedMotion ? undefined : { clipPath: "inset(0 0 100% 0)" }}
    >
      {children}
    </div>
  );
}
```

`components/sections/trainers/trainer-card.tsx` (placeholder image block — no real photography yet):

```tsx
import type { Trainer } from "@/types/content";
import { RevealImage } from "@/components/common/reveal-image";

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <article>
      <RevealImage className="aspect-[3/4] w-full bg-muted">
        <div role="img" aria-label={trainer.imageAlt} className="h-full w-full" />
      </RevealImage>
      <h3 className="mt-4 font-display text-subhead uppercase text-foreground">{trainer.name}</h3>
      <p className="text-caption uppercase tracking-wide text-muted-foreground">{trainer.role}</p>
      <p className="mt-2 max-w-sm text-body text-muted-foreground">{trainer.bio}</p>
    </article>
  );
}
```

`components/sections/trainers/trainers-section.tsx`:

```tsx
import { trainers } from "@/lib/data/trainers";
import { SectionHeading } from "@/components/common/section-heading";
import { TrainerCard } from "./trainer-card";

export function TrainersSection() {
  return (
    <section id="trainers" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="Coaching Staff" title="Trained By The Best" />
      <div className="mt-12 grid gap-12 md:grid-cols-3">
        {trainers.map((trainer) => (
          <TrainerCard key={trainer.id} trainer={trainer} />
        ))}
      </div>
    </section>
  );
}
```

(When real photography exists, swap the placeholder `<div role="img">` for `next/image`; `RevealImage` itself needs no changes.)

**Animation behavior:** Each trainer card's image block reveals independently via its own `ScrollTrigger` as it individually enters the viewport — naturally staggered by scroll position rather than a single shared timeline.

**Responsive considerations:** `grid gap-12 md:grid-cols-3` — single column on mobile, 3 columns from `md` up.

**Accessibility considerations:** Placeholder image blocks use `role="img"` with a real `aria-label` from the data (`trainer.imageAlt`), so screen readers get a meaningful description even before real photography exists.

**Performance considerations:** No new patterns — reuses `SectionHeading` + a new but equally lightweight `RevealImage`.

- [ ] **Step 1: Create `lib/data/trainers.ts`, `reveal-image.tsx`, `trainer-card.tsx`, `trainers-section.tsx`.**
- [ ] **Step 2: Modify `app/page.tsx`** to replace the `trainers` placeholder.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, scroll to Trainers.** Expected: each of the 3 placeholder image blocks wipes in via clip-path independently as it scrolls into view; grid collapses to 1 column below `md`.
- [ ] **Step 5: In devtools Accessibility tree, confirm each placeholder image block is announced with its `aria-label` text.**
- [ ] **Step 6: Run `npm run build`.** Expected: succeeds.

**Expected result:** A trainers grid with independent image reveals and a reusable `RevealImage` primitive.

---

### Task 13: Membership section

**Files:**
- Create: `lib/data/membership.ts`
- Create: `components/sections/membership/membership-tier-card.tsx`
- Create: `components/sections/membership/membership-section.tsx`
- Modify: `app/page.tsx` (replace the `membership` placeholder)

**Dependencies:** None new.

**Implementation details:**

`lib/data/membership.ts`:

```ts
import type { MembershipTier } from "@/types/content";

export const membershipTiers: MembershipTier[] = [
  {
    id: "essential",
    name: "Essential",
    price: "$129",
    cadence: "/month",
    features: ["Unlimited studio access", "Program library", "Monthly check-in"],
  },
  {
    id: "performance",
    name: "Performance",
    price: "$219",
    cadence: "/month",
    features: ["Everything in Essential", "Weekly coached sessions", "Quarterly performance testing"],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "$349",
    cadence: "/month",
    features: ["Everything in Performance", "1:1 coaching", "Recovery suite access"],
  },
];
```

`components/sections/membership/membership-tier-card.tsx`:

```tsx
import type { MembershipTier } from "@/types/content";
import { cn } from "@/lib/utils";

export function MembershipTierCard({ tier }: { tier: MembershipTier }) {
  return (
    <article
      className={cn(
        "flex flex-col border border-border p-8",
        tier.featured && "border-foreground bg-foreground/[0.03]"
      )}
    >
      <h3 className="font-display text-subhead uppercase text-foreground">{tier.name}</h3>
      <p className="mt-4 font-display text-headline text-foreground">
        {tier.price}
        <span className="text-body text-muted-foreground">{tier.cadence}</span>
      </p>
      <ul className="mt-6 flex flex-1 flex-col gap-3 text-body text-muted-foreground">
        {tier.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <a
        href="#cta"
        className={cn(
          "mt-8 inline-flex items-center justify-center rounded-full border border-foreground px-6 py-3 text-sm uppercase tracking-wide",
          tier.featured ? "bg-foreground text-background" : "text-foreground"
        )}
      >
        Choose {tier.name}
      </a>
    </article>
  );
}
```

`components/sections/membership/membership-section.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { membershipTiers } from "@/lib/data/membership";
import { SectionHeading } from "@/components/common/section-heading";
import { MembershipTierCard } from "./membership-tier-card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function MembershipSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.fromTo(
        "[data-tier-card]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
        }
      );
    },
    { scope: gridRef, dependencies: [reducedMotion] }
  );

  return (
    <section id="membership" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="Membership" title="Choose Your Standard" />
      <div ref={gridRef} className="mt-12 grid gap-6 md:grid-cols-3">
        {membershipTiers.map((tier) => (
          <div key={tier.id} data-tier-card>
            <MembershipTierCard tier={tier} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Animation behavior:** The 3 tier cards fade+rise in with a short stagger as the grid enters the viewport — deliberately quick and simple (`0.7s`, no clip-path), since this is a conversion-critical section that should feel snappy, not showy.

**Responsive considerations:** `grid gap-6 md:grid-cols-3` — single column on mobile, 3 columns from `md`.

**Accessibility considerations:** "Choose {tier.name}" link text is unique per card (not three identical "Choose" links), which matters for screen reader users navigating by link text.

**Performance considerations:** Single `ScrollTrigger` for the whole grid (not one per card) — cheaper than 3 separate triggers for what is effectively one animation.

- [ ] **Step 1: Create `lib/data/membership.ts`, `membership-tier-card.tsx`, `membership-section.tsx`.**
- [ ] **Step 2: Modify `app/page.tsx`** to replace the `membership` placeholder.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, scroll to Membership.** Expected: 3 cards fade/rise in staggered; "Performance" card visually distinct (featured styling); all "Choose ___" links are keyboard-focusable with visible focus rings.
- [ ] **Step 5: Run `npm run build`.** Expected: succeeds.

**Expected result:** A complete, conversion-focused membership grid.

---

### Task 14: Final CTA

**Files:**
- Create: `components/sections/cta/final-cta-section.tsx`
- Modify: `app/page.tsx` (replace the `cta` placeholder)

**Dependencies:** None new.

**Implementation details:**

```tsx
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
```

**Animation behavior:** Reuses `RevealText`'s default scroll-triggered mode — no bespoke animation code needed.

**Responsive considerations:** `min-h-[70vh]` plus centered flex layout keeps this readable and impactful at any viewport size.

**Accessibility considerations:** Inverted color scheme (`bg-foreground`/`text-background`, i.e. off-white background with near-black text) — verify contrast during Task 18's audit; note `RevealText`'s `className` here has no explicit text color, so its `<h2>` correctly inherits `text-background` (near-black) from the section, which then reads as dark text on the light inverted panel.

**Performance considerations:** None beyond the existing `RevealText` mechanism.

- [ ] **Step 1: Create `final-cta-section.tsx`.**
- [ ] **Step 2: Modify `app/page.tsx`** to replace the `cta` placeholder.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, scroll to the Final CTA.** Expected: inverted-color panel, heading reveals on scroll-in, "Join APEX" button clearly legible and focusable.
- [ ] **Step 5: Run `npm run build`.** Expected: succeeds.

**Expected result:** A visually distinct closing CTA panel using only already-built primitives.

---

### Task 15: Footer and final page assembly

**Files:**
- Create: `components/layout/footer.tsx`
- Modify: `app/page.tsx` (this task removes the last of the original scaffold — confirm no `SECTIONS.map` placeholder loop remains)

**Dependencies:** None new.

**Implementation details:**

`components/layout/footer.tsx`:

```tsx
const FOOTER_LINKS = [
  { href: "#programs", label: "Programs" },
  { href: "#trainers", label: "Trainers" },
  { href: "#membership", label: "Membership" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-12 text-muted-foreground md:px-12">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-lg uppercase tracking-widest text-foreground">Apex</p>
          <p className="mt-2 max-w-xs text-body">Performance training, engineered.</p>
        </div>
        <ul className="flex gap-6 text-sm uppercase tracking-wide">
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-12 text-xs">© {new Date().getFullYear()} APEX Performance Studio. All rights reserved.</p>
    </footer>
  );
}
```

Final `app/page.tsx` (every placeholder now replaced; this is the complete target composition):

```tsx
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero/hero-section";
import { ManifestoSection } from "@/components/sections/manifesto/manifesto-section";
import { ProgramsSection } from "@/components/sections/programs/programs-section";
import { ExperienceSection } from "@/components/sections/experience/experience-section";
import { StatsSection } from "@/components/sections/stats/stats-section";
import { TrainersSection } from "@/components/sections/trainers/trainers-section";
import { MembershipSection } from "@/components/sections/membership/membership-section";
import { FinalCtaSection } from "@/components/sections/cta/final-cta-section";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-foreground"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <ManifestoSection />
        <ProgramsSection />
        <ExperienceSection />
        <StatsSection />
        <TrainersSection />
        <MembershipSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
```

**Animation behavior:** None — footer is deliberately static, matching "avoid animation on every element."

**Responsive considerations:** `flex-col md:flex-row` stacks wordmark/tagline above links on mobile, side-by-side on desktop.

**Accessibility considerations:** Footer is a real `<footer>` landmark; link text is descriptive, not "click here."

**Performance considerations:** `new Date().getFullYear()` is computed per-request/per-build, not per-client-render — note as a known limitation that the year could go stale between deploys if the page is statically cached for a long time; not a concern to fix now.

- [ ] **Step 1: Create `footer.tsx`.**
- [ ] **Step 2: Modify `app/page.tsx`** to its final form above, rendering `<Footer />` after `<main>`.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, scroll the entire page top to bottom once.** Expected: every section from Hero through Footer renders in order, no leftover placeholder text anywhere, footer links jump to the correct anchors.
- [ ] **Step 5: Run `npm run build`.** Expected: succeeds.

**Expected result:** The complete single-page site, fully assembled, with the placeholder scaffold from Task 2 entirely gone.

---

### Task 16: Global animation polish (magnetic buttons + token consistency sweep)

**Files:**
- Create: `components/common/magnetic-button.tsx`
- Modify: `components/sections/hero/hero-copy.tsx` (swap CTA `<a>` for `<MagneticButton>`)
- Modify: `components/sections/cta/final-cta-section.tsx` (swap CTA `<a>` for `<MagneticButton>`)
- Modify: `components/layout/navbar.tsx` ("Join" button)
- Modify: any earlier file using a raw GSAP ease string (sweep, see Step 3 below) to use `EASE`/`DURATION` from `lib/gsap/tokens.ts`

**Dependencies:** None new.

**Implementation details:**

`components/common/magnetic-button.tsx`:

```tsx
"use client";

import { useRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type MagneticButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function MagneticButton({ children, ...anchorProps }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const node = ref.current;
      if (!node || reducedMotion) return;

      function handlePointerMove(event: PointerEvent) {
        const bounds = node!.getBoundingClientRect();
        const relativeX = event.clientX - (bounds.left + bounds.width / 2);
        const relativeY = event.clientY - (bounds.top + bounds.height / 2);
        gsap.to(node, { x: relativeX * 0.3, y: relativeY * 0.3, duration: 0.4, ease: "power3.out" });
      }

      function handlePointerLeave() {
        gsap.to(node, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      }

      node.addEventListener("pointermove", handlePointerMove);
      node.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        node.removeEventListener("pointermove", handlePointerMove);
        node.removeEventListener("pointerleave", handlePointerLeave);
      };
    },
    { scope: ref, dependencies: [reducedMotion] }
  );

  return (
    <a ref={ref} {...anchorProps}>
      {children}
    </a>
  );
}
```

Swap usage in `hero-copy.tsx`, `final-cta-section.tsx`, and `navbar.tsx` — e.g. in `hero-copy.tsx`:

```tsx
import { MagneticButton } from "@/components/common/magnetic-button";
// ...
<MagneticButton
  href="#membership"
  className="mt-8 inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-wide text-background"
>
  Start Training
</MagneticButton>
```

(Same pattern for the Final CTA's "Join APEX" and the Navbar's "Join" — same `className`, just swap the tag/import.)

**Token consistency sweep:** search across `components/`, `three/` for hardcoded GSAP ease strings (`"power4.out"`, `"power3.out"`, `"power2.in"`, `"power1.out"`) introduced in Tasks 3, 6, 7, 9–14, and replace them with `EASE.entrance` / `EASE.standard` / `EASE.exit` from `lib/gsap/tokens.ts` (mapping: `power4.out` → `EASE.entrance`, `power3.out` → `EASE.standard`, `power2.in`/`power2.out` → `EASE.exit`). This is a mechanical find-and-replace plus import addition per file — no behavior change, just centralizing the values that were written as literals during earlier tasks for readability.

**Animation behavior:** Buttons pull toward the cursor within a small radius on hover/pointer-move and elastically snap back on pointer-leave — a subtle, premium micro-interaction applied only to primary CTAs, not every clickable element.

**Responsive considerations:** `pointermove`/`pointerleave` are pointer events, so this naturally does nothing on touch-only devices (no `pointermove` without a pointer hovering) — no separate mobile handling needed.

**Accessibility considerations:** Under `prefers-reduced-motion`, no listeners are attached at all — buttons behave as plain static links. The component still renders a real `<a>` with normal `href`/text content, so it's fully keyboard/screen-reader operable regardless of the pointer-driven effect.

**Performance considerations:** Listeners are added/removed via `useGSAP`'s cleanup, scoped per-button — no global mousemove listener running for the whole page.

- [ ] **Step 1: Create `magnetic-button.tsx`.**
- [ ] **Step 2: Modify `hero-copy.tsx`, `final-cta-section.tsx`, `navbar.tsx`** to use it for their primary CTA links.
- [ ] **Step 3: Grep for raw ease strings** (`grep -rn "power4.out\|power3.out\|power2.in\|power1.out" components/ three/ | grep -v lib/gsap/tokens.ts`) and replace each with the matching `EASE.*` token, adding the import where missing.
- [ ] **Step 4: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 5: Run `npm run dev`.** Move the mouse over the Hero CTA, the Final CTA, and the Navbar Join button. Expected: each pulls slightly toward the cursor and snaps back elastically on leave.
- [ ] **Step 6: Emulate `prefers-reduced-motion: reduce`.** Expected: all three buttons are static (no pull effect), still fully clickable.
- [ ] **Step 7: Re-run the grep from Step 3.** Expected: no results outside `lib/gsap/tokens.ts`.
- [ ] **Step 8: Run `npm run build`.** Expected: succeeds.

**Expected result:** Consistent, restrained micro-interactions on primary CTAs and a single source of truth for easing/duration values across the codebase.

---

### Task 17: Responsive and mobile optimization pass

**Files:**
- Modify: `components/layout/navbar.tsx` (mobile menu)
- Modify: `components/sections/experience/experience-section.tsx` (shorter scrub distance on mobile via `gsap.matchMedia()`)
- Spot-check (modify only if an issue is found): any section with fixed pixel widths/overflow at narrow viewports

**Dependencies:** `lucide-react` (already installed) for menu/close icons.

**Implementation details:**

Add a mobile menu to `navbar.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePreloaderComplete } from "@/components/preloader/preloader";

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
        <a
          href="#membership"
          className="hidden rounded-full border border-foreground px-5 py-2 text-sm uppercase tracking-wide text-foreground md:inline-flex"
        >
          Join
        </a>
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
      {open && (
        <ul
          id="mobile-nav"
          className="absolute inset-x-0 top-full flex flex-col gap-4 bg-background p-6 text-foreground md:hidden"
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
      )}
    </nav>
  );
}
```

Add `gsap.matchMedia()` to `experience-section.tsx` to shorten the scrub distance on mobile:

```tsx
useGSAP(
  () => {
    if (reducedMotion) return;

    const mm = gsap.matchMedia();
    mm.add({ isMobile: "(max-width: 767px)" }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean };
      const panels = gsap.utils.toArray<HTMLElement>("[data-experience-panel]");
      const distancePerStep = isMobile ? 300 : 500;

      gsap.set(panels.slice(1), { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${panels.length * distancePerStep}`,
          pin: true,
          scrub: 1,
        },
      });

      panels.forEach((panel, index) => {
        if (index === 0) return;
        tl.to(panels[index - 1], { autoAlpha: 0, duration: 0.4 }, index).to(
          panel,
          { autoAlpha: 1, duration: 0.4 },
          index
        );
      });
    });

    return () => mm.revert();
  },
  { scope: sectionRef, dependencies: [reducedMotion] }
);
```

**Animation behavior:** Mobile nav is a simple show/hide `<ul>` (CSS only, no GSAP — a menu open/close doesn't need a physics-driven reveal). Experience section keeps its crossfade animation but with a shorter, mobile-appropriate scroll distance.

**Responsive considerations:** This whole task *is* the responsive pass — additionally spot-check (during validation) that no section produces horizontal scroll at 320–375px width, and that the Hero headline doesn't overflow or wrap awkwardly at the narrowest supported width (320px).

**Accessibility considerations:** Mobile menu button has `aria-expanded`/`aria-controls`, an `sr-only` label, and swaps its icon (`Menu`/`X`) to reflect state; menu closes on link click (returns focus naturally to the clicked link's destination) and each link is fully keyboard-operable via Tab + Enter.

**Performance considerations:** `gsap.matchMedia()` automatically re-runs its handler on breakpoint crossing (e.g. rotating a tablet) and its returned cleanup (`mm.revert()`) tears down the old `ScrollTrigger` first — no leaked duplicate triggers when resizing across the breakpoint.

- [ ] **Step 1: Modify `navbar.tsx`** to add the mobile menu.
- [ ] **Step 2: Modify `experience-section.tsx`** to add `gsap.matchMedia()`.
- [ ] **Step 3: Run `npx tsc --noEmit` and `npm run lint`.**
- [ ] **Step 4: Run `npm run dev`, emulate iPhone SE (375×667) in devtools.** Expected: hamburger icon visible, tapping opens the mobile menu with all links + Join, tapping a link closes the menu and scrolls to the anchor; no horizontal scrollbar anywhere on the page.
- [ ] **Step 5: Emulate iPad (768×1024) and Desktop (1440×900).** Expected: nav switches to the full inline link list at `md`, hamburger disappears.
- [ ] **Step 6: On the mobile viewport, scroll through the Experience section.** Expected: pin/scrub distance is noticeably shorter than on desktop.
- [ ] **Step 7: Keyboard-only pass on mobile viewport width:** Tab to the hamburger button, press Enter to open, Tab through the revealed links, confirm focus order is logical.
- [ ] **Step 8: Run `npm run build`.** Expected: succeeds.

**Expected result:** A fully responsive nav and an appropriately-tuned pinned section across mobile/tablet/desktop.

---

### Task 18: Accessibility and reduced-motion audit

**Files:** No new files expected — this task is a checklist-driven review, with fixes applied inline to whatever file needs them (e.g. adjusting a color token in `app/globals.css` if contrast fails).

**Dependencies:** None new. Uses Chrome DevTools' built-in Lighthouup panel (no install) and the browser's contrast checker — deliberately avoiding adding an `axe-core` CLI dependency per the "no unnecessary libraries" constraint; the user can additionally run their own axe DevTools browser extension if they have one installed.

**Implementation details — run and resolve each of the following:**

1. **Run Lighthouse (Chrome DevTools → Lighthouse tab → Accessibility category) against the built site** (`npm run build && npm run start`, audit `localhost:3000`). Fix any flagged issue before proceeding.
2. **Heading order:** in devtools Accessibility tree (or the Lighthouse "headings" audit), confirm exactly one `<h1>` (Hero) and no skipped heading levels (`h2`s for section headings, `h3`s for card titles within sections) anywhere in the DOM.
3. **Keyboard-only walkthrough:** starting from a fresh page load, use only Tab/Shift+Tab/Enter/Space to: activate the skip link, reach and use every nav link, open/use/close the mobile menu (at a mobile viewport width), reach and activate the Hero CTA, every Membership "Choose" link, and the Final CTA — confirm focus is always visible (outline) and never trapped or lost.
4. **Reduced-motion completeness:** with `prefers-reduced-motion: reduce` emulated, reload and scroll the entire page top to bottom, confirming each of the following individually: Preloader completes instantly; Hero canvas is absent; Hero headline/copy fully visible with no residual `clip-path`; Experience section shows all 4 steps stacked, unpinned; Stats show final values immediately; Manifesto/Programs/Trainers/Membership/CTA headings and images are fully visible with no stuck `clip-path`; Magnetic buttons don't move on hover.
5. **Color contrast:** using devtools' contrast checker on rendered text, verify `--muted-foreground` on `--background` (used for captions/body copy throughout) meets 4.5:1 for normal-size text; verify the inverted Final CTA panel (`--foreground` background, `--background` text) also passes. If either fails, adjust the relevant `oklch` lightness value in `app/globals.css` (Task 1) and re-check.
6. **Decorative elements:** confirm `HeroCanvas`'s wrapper (`aria-hidden="true"`, `pointer-events-none`), the scroll cue's pulsing line (`aria-hidden="true"`), and any placeholder trainer image blocks (`role="img"` + `aria-label`) are all correctly exposed or hidden in the Accessibility tree.
7. **Preloader `inert` behavior:** reload the page and immediately mash Tab before the preloader finishes. Expected: focus never lands on anything behind the overlay.

- [ ] **Step 1: Run the Lighthouse Accessibility audit and resolve any findings.**
- [ ] **Step 2: Complete checklist items 2–7 above, fixing issues inline as found** (e.g. bump a color token, add a missing `aria-label`).
- [ ] **Step 3: Re-run `npx tsc --noEmit` and `npm run lint`** after any fixes.
- [ ] **Step 4: Re-run the full keyboard-only and reduced-motion walkthroughs once more** after fixes to confirm nothing regressed.
- [ ] **Step 5: Run `npm run build`.** Expected: succeeds.

**Expected result:** A documented, verified pass confirming the site is fully keyboard-operable, correctly structured for screen readers, contrast-compliant, and completely non-jarring under `prefers-reduced-motion`.

---

### Task 19: Performance optimization pass

**Files:** No new files expected — this task inspects build output and runtime behavior, applying targeted fixes only where a real issue is found.

**Dependencies:** None new.

**Implementation details — run and resolve each of the following:**

1. **Run `npm run build`** and inspect the printed route size table. Confirm the single page's First Load JS is reasonable; note the separate chunk(s) for `three`/`@react-three/*` (from the `next/dynamic({ ssr: false })` boundary in Task 6) are not part of the main initial bundle — check `.next/static/chunks` for a distinctly-named chunk containing the Three.js code, separate from the main app chunk.
2. **Record a Performance profile** (Chrome DevTools → Performance) while scrolling from Hero through Experience on the production build (`npm run start`). Confirm no long tasks over ~50ms attributable to the R3F render loop or GSAP, and that frame rate stays close to the display's refresh rate.
3. **Confirm `gsap.ticker.lagSmoothing(0)`** (set in Task 2) is still present — switch to another browser tab for 5+ seconds, switch back, and confirm Lenis/ScrollTrigger don't visibly "catch up" or jump.
4. **Confirm fonts load without FOIT:** in the Network tab, reload with cache disabled, and confirm text is visible (in a fallback font) before the Oswald/Inter font files finish downloading (`display: "swap"` from Task 1 doing its job).
5. **Check for leaked ScrollTriggers:** load the page, scroll through it fully once, then open the console and run `ScrollTrigger.getAll().length`. Note the count, then scroll through again and resize the window twice; run the same command again. Expected: the count does not keep growing — the same triggers are reused/refreshed, not duplicated.
6. **Document (do not implement) a follow-up:** once real trainer/program photography replaces the placeholder blocks from Task 12, those images must go through `next/image` for automatic optimization — call this out explicitly as a note for whoever adds real media, since there is nothing to implement yet with placeholder `<div>`s.

- [ ] **Step 1: Run `npm run build`, inspect the route size table and `.next/static/chunks`.**
- [ ] **Step 2: Record and review a Performance profile per Step 2 above.**
- [ ] **Step 3: Verify tab-switch/return behavior per Step 3 above.**
- [ ] **Step 4: Verify font-swap behavior per Step 4 above.**
- [ ] **Step 5: Run the `ScrollTrigger.getAll().length` check per Step 5 above.**
- [ ] **Step 6: If any of the above reveals a real issue, fix it and re-run the relevant check.**

**Expected result:** Confirmed WebGL/animation performance budget, no leaked triggers, no font-loading jank, and a documented note about `next/image` for future real media.

---

### Task 20: Final production QA

**Files:** None expected, unless the checklist below surfaces a last-mile fix.

**Dependencies:** None new.

**Implementation details — full end-to-end sign-off:**

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — clean.
3. `npm run build` — succeeds with no warnings.
4. `npm run start` (production build) — click through every section, every interactive element, at three breakpoints (375px, 768px, 1440px), in both normal motion and `prefers-reduced-motion: reduce`, and in at least two browser engines if available (e.g. Chrome and Firefox) to catch any GSAP/R3F engine-specific quirks.
5. Cross-reference the built site against the design spec's requirement list (spec §1) plus the added Manifesto section — confirm each of the following 19 items is present and behaves as specified: cinematic preloader, premium nav, full-screen hero, GSAP entrance animations, GSAP ScrollTrigger animations, Lenis smooth scrolling, Three.js/R3F 3D hero scene, mouse interaction, scroll-driven 3D movement, editorial typography, premium visual identity, Manifesto section, Programs section, Training Experience pinned section, animated statistics, Trainers section, Membership section, Final CTA, Footer.
6. Full top-to-bottom scroll-through with the devtools console open — confirm zero `console.error`/`console.warn` output.
7. `git status` — confirm only the expected new/modified project files are listed (no stray temp files, no `node_modules`/`.next` accidentally tracked). **Read-only check — do not stage or commit anything; leave everything for the user to review and commit manually.**

- [ ] **Step 1: Run Steps 1–3 (`tsc`, `lint`, `build`).**
- [ ] **Step 2: Complete the full manual click-through in Step 4 across all breakpoints and both motion settings.**
- [ ] **Step 3: Complete the spec cross-reference checklist in Step 5 — list any gaps found.**
- [ ] **Step 4: Complete the console-error check in Step 6.**
- [ ] **Step 5: Run `git status` per Step 7 and report the result — do not run any git command beyond `status`/`diff`/`log`.**

**Expected result:** A verified, complete, production-buildable APEX site matching the approved spec, left entirely uncommitted for the user's manual review and git workflow.

---

## Plan Self-Review Notes

- **Spec coverage:** All of spec §3.1–§3.4 (Three.js mounting, scroll orchestration, no-SplitText reveals, content layer), §4 (folder structure), §5 (component architecture), §6 (animation hierarchy), §7 (Three.js architecture), and §8 (config changes, including the public/ SVG cleanup) are each implemented in a specific task above. §9's deferred items (exact 3D art direction, exact fonts) are resolved here with explicit, swappable placeholders rather than left vague, since an implementation plan — unlike the design spec — cannot contain open placeholders.
- **Naming consistency checked:** `usePreloaderComplete`, `useLenis`, `useReducedMotion`, `useMousePosition`, `lerp`, `RevealText`/`RevealImage`/`SectionHeading`/`MagneticButton` props and exports are used identically everywhere they're consumed across tasks.
- **No commits anywhere in this plan** — every task's steps end at verification, per the standing instruction that git is handled manually.
