# APEX Fitness — Site Architecture Design

**Date:** 2026-08-29
**Status:** Approved (architecture); implementation plan pending
**Scope:** Single-page, premium/cinematic fitness marketing site

## 1. Context & Goals

APEX is a new premium fitness brand website. The visual/interaction bar is
premium automotive/fashion/tech, not a generic gym site: dark, minimal,
editorial, athletic, high-performance. It must NOT copy any existing site
design — only general principles of cinematic premium web design.

The site is a **single long-scroll page** (no sub-routes for now) composed of
18 required elements: cinematic preloader, premium nav, full-screen hero,
GSAP entrance animations, GSAP ScrollTrigger animations, Lenis smooth
scrolling, a Three.js/R3F 3D hero scene, mouse interaction, scroll-driven 3D
movement, editorial typography, premium visual identity, Programs section,
Training Experience section, animated statistics, Trainers section,
Membership section, Final CTA, and Footer.

**Content:** placeholder/mock data for now, structured so real content or a
CMS can be swapped in later without touching components.

**Animation philosophy:** intentional and hierarchical — subtle
micro-interactions, text/image reveals, scroll-driven and pinned sections
where they earn their place, WebGL interaction. Explicitly avoid: excessive
animation, random motion, generic card effects, gratuitous gradients/
glassmorphism, animating every element.

## 2. Existing Stack (verified)

- Next.js 16.3.3, App Router, no `src/` directory, React 19.2.8, React
  Compiler already enabled (`next.config.ts`)
- Tailwind v4 (CSS-first config, no `tailwind.config.js`), theme tokens in
  `app/globals.css` via `@theme inline`
- shadcn/ui initialized (`base-vega` style, neutral base, CSS variables),
  only `Button` installed
- GSAP, `@gsap/react`, Lenis, Three.js, `@react-three/fiber`,
  `@react-three/drei`, `lucide-react` installed but unused
- Path alias `@/*` → repo root
- Verified against the Next 16 docs bundled in `node_modules/next/dist/docs`:
  App Router file conventions and the Server/Client Component model are
  unchanged from prior versions — no breaking-change workarounds needed for
  this architecture

## 3. Key Architecture Decisions

### 3.1 Three.js mounting strategy
A single `<Canvas>` scoped to the Hero section (`position: sticky` inside a
tall scroll-track wrapper, pinned via ScrollTrigger, then released into
normal flow), rather than one persistent full-page canvas behind every
section. Rationale: one WebGL context is far cheaper to keep at 60fps,
easier to gate behind `prefers-reduced-motion`, and matches the brief's
"earn the effect" philosophy rather than a gratuitous always-on background.

**The exact 3D object/composition is intentionally undecided at this stage.**
`HeroMesh` will start as a placeholder primitive (e.g. a simple geometry with
basic material) and the real visual direction — abstract form, product-like
object, particle field, etc. — is a design decision to be made during the
implementation/design phase, not locked in by this architecture doc. The
architecture only fixes *where* the 3D lives, *how* it's driven (scroll +
pointer), and *how* it's isolated/performance-gated — not *what* it renders.

### 3.2 Scroll orchestration
Lenis owns physical scroll. A single client `SmoothScrollProvider` in the
root layout creates the Lenis instance, drives it from `gsap.ticker`, and
calls `ScrollTrigger.update()` on every Lenis tick (standard Lenis+GSAP
integration). Each section owns its own animations via `useGSAP` scoped to a
local ref — no central hand-maintained master timeline.

### 3.3 Text/image reveals — no SplitText
Per approval, **SplitText is not used and not registered/installed** for
this phase. Text and image reveals are built from lightweight, native
techniques instead:

- **Text reveals:** CSS `clip-path` + `transform: translateY(...)` +
  `opacity` animated via GSAP tweening the container/line elements (lines
  authored as pre-broken `<span>`/`<div>` blocks per line where a
  line-by-line reveal is needed, or a single block fade/slide where it
  isn't). No runtime text-splitting library.
- **Image reveals:** `clip-path` (inset/polygon) wipes and/or scale+opacity
  transitions on the image container, animated with GSAP/ScrollTrigger.
- This keeps the reveal system dependency-light. SplitText (now free under
  GSAP's current licensing) can be introduced later if a genuine
  character/word-level reveal need arises — this is deferred, not ruled out
  permanently.

### 3.4 Content layer
Typed local data modules (`lib/data/*.ts`) against a shared contract
(`types/content.ts`): `Program`, `Trainer`, `Stat`, `MembershipTier`. Section
components render from these arrays. Swapping to a CMS later changes the
data source, not the components.

## 4. Folder Structure

```
apex-fitness/
├── app/
│   ├── layout.tsx                     # fonts, <SmoothScrollProvider>, metadata, <Preloader>
│   ├── page.tsx                       # composes sections in order
│   └── globals.css                    # design tokens, editorial type scale
│
├── components/
│   ├── ui/                            # shadcn primitives (as generated, untouched conventions)
│   │
│   ├── layout/
│   │   ├── navbar.tsx                 # scroll-aware, blends over hero → solid on scroll
│   │   ├── footer.tsx
│   │   └── smooth-scroll-provider.tsx # Lenis + GSAP ScrollTrigger sync (client)
│   │
│   ├── preloader/
│   │   ├── preloader.tsx              # gates first paint, runs entrance handoff
│   │   └── preloader-progress.tsx
│   │
│   ├── sections/
│   │   ├── hero/
│   │   │   ├── hero-section.tsx
│   │   │   ├── hero-copy.tsx          # editorial headline reveal (CSS/GSAP, no SplitText)
│   │   │   └── hero-scroll-cue.tsx
│   │   ├── programs/
│   │   │   ├── programs-section.tsx
│   │   │   └── program-card.tsx
│   │   ├── experience/
│   │   │   └── experience-section.tsx # "training experience" — pinned/scrubbed
│   │   ├── stats/
│   │   │   ├── stats-section.tsx
│   │   │   └── animated-stat.tsx      # count-up on scroll
│   │   ├── trainers/
│   │   │   ├── trainers-section.tsx
│   │   │   └── trainer-card.tsx
│   │   ├── membership/
│   │   │   ├── membership-section.tsx
│   │   │   └── membership-tier-card.tsx
│   │   └── cta/
│   │       └── final-cta-section.tsx
│   │
│   └── common/                        # site-specific reusable primitives (not shadcn)
│       ├── reveal-text.tsx            # CSS clip-path/transform/opacity line reveal wrapper
│       ├── reveal-image.tsx           # clip-path image reveal
│       ├── magnetic-button.tsx        # mouse-follow micro-interaction
│       └── section-heading.tsx
│
├── three/
│   ├── hero-scene/
│   │   ├── hero-canvas.tsx            # mounts <Canvas>, dynamic(ssr:false)
│   │   ├── hero-scene.tsx             # lights, camera rig, composition
│   │   ├── hero-mesh.tsx              # placeholder 3D object; visual direction TBD in design phase
│   │   └── use-hero-scroll-rig.ts     # ScrollTrigger progress → camera/mesh transform
│   └── shared/
│       ├── canvas-shell.tsx           # shared <Canvas> config: dpr, gl flags, Suspense
│       └── pointer-parallax.ts        # normalized pointer → lerped target vector
│
├── lib/
│   ├── utils.ts                       # existing cn()
│   ├── gsap/
│   │   ├── register.ts                # gsap.registerPlugin(useGSAP, ScrollTrigger) — no SplitText
│   │   └── tokens.ts                  # shared durations/eases
│   └── data/
│       ├── programs.ts
│       ├── trainers.ts
│       ├── stats.ts
│       └── membership.ts
│
├── hooks/
│   ├── use-lenis.ts                   # context accessor for the Lenis instance
│   ├── use-reduced-motion.ts          # prefers-reduced-motion gate
│   └── use-mouse-position.ts          # normalized pointer tracking
│
├── types/
│   └── content.ts                     # Program, Trainer, Stat, MembershipTier
│
└── public/
    ├── fonts/                         # self-hosted variable fonts (if not using next/font/google)
    └── images/, video/                # posters, placeholder media
```

Rationale for root-level (not `app/`-nested) folders: this is a single route,
so colocating non-routing code under `app/` buys nothing and would mix
routing concerns with 3D/animation code. `app/` stays limited to
`layout.tsx`, `page.tsx`, `globals.css`.

## 5. Component Architecture

- **`app/layout.tsx`** (server): sets up fonts via `next/font`, renders
  `<SmoothScrollProvider>` wrapping `{children}`, holds metadata/OG config.
  Stays a Server Component — only the provider inside is `"use client"`.
- **`SmoothScrollProvider`** (client): owns the Lenis instance in a ref,
  exposes it via context (`use-lenis`), drives `gsap.ticker` →
  `lenis.raf`, disables Lenis (`lenis.stop()`) while the preloader is
  active, re-enables on handoff.
- **`Preloader`** (client): mounted once above the page content; plays a
  short GSAP timeline (logo/wordmark reveal + progress) using CSS
  transform/opacity tweens, then reverts itself out of the DOM and fires the
  Hero's entrance timeline. Tied to asset/font readiness where possible
  rather than a fixed timer.
- **`Navbar`**: fixed, transparent-over-hero → solid-on-scroll via a
  ScrollTrigger toggling a class, not React state re-renders, to avoid
  layout thrash.
- **Section components**: each section folder is self-contained — one
  `*-section.tsx` orchestrates layout + owns its `useGSAP` scope, smaller
  files (`*-card.tsx`, etc.) stay presentational and animation-agnostic.
  `app/page.tsx` just imports and stacks them in order — no shared layout
  logic between sections beyond consistent spacing/typography utilities.
- **`common/`**: cross-section primitives (`RevealText`, `RevealImage`,
  `MagneticButton`, `SectionHeading`) — generic enough to be reused by Hero,
  Programs, CTA, etc., but specific to this site's motion language built on
  CSS transforms/clip-path/opacity + GSAP (no text-splitting library).
- **shadcn (`components/ui`)**: reserved for genuinely generic interactive
  primitives if/when needed (e.g. a `Dialog` for a trainer bio, `Accordion`
  for membership FAQ) — not used for the bespoke section visuals.

## 6. Animation Architecture

**Registration:** `lib/gsap/register.ts` calls
`gsap.registerPlugin(useGSAP, ScrollTrigger)` once, guarded so it's a no-op
on the server. **SplitText is not registered or installed** for this phase
(see §3.3).

**Hierarchy** (intentional, not simultaneous):
1. **Preloader timeline** — blocks interaction, plays once.
2. **Hero entrance timeline** — fires on preloader handoff: clip-path/
   transform/opacity reveal on the headline and supporting copy, hero 3D
   scene fades/settles in.
3. **Per-section scroll reveals** — each section's
   `useGSAP(() => {...}, { scope: sectionRef })` registers a `ScrollTrigger`
   (`start: "top 80%"`) for a one-shot entrance (text/image reveal via
   clip-path/transform/opacity) as it enters the viewport. Default pattern
   for Programs, Trainers, Membership, CTA.
4. **Pinned/scrubbed sections** — only where it earns its place: **Training
   Experience** pins (`pin: true, scrub: true`) to choreograph a multi-step
   reveal against scroll position; **Stats** count-up is scrub-tied to
   scroll progress rather than pinned.
5. **Micro-interactions** — `MagneticButton`, nav hover states, card hover
   tilts: small, local `useGSAP` hover-scoped timelines, no ScrollTrigger
   involved.

**Cross-cutting rules:**
- Every `useGSAP` call is scoped to a ref so cleanup/revert is automatic on
  unmount (important on one long page — no leaked ScrollTriggers).
- `use-reduced-motion.ts` gates step 3/4/hero-scroll-rig: reduced-motion
  users get instant/opacity-only states, no pins, no scrub, no camera
  movement.
- No element gets more than one animated property class at once (a
  transform-reveal *or* a fade, not stacked effects), keeping with "avoid
  animation on every element."

## 7. Three.js Architecture

- **`three/hero-scene/hero-canvas.tsx`**: the only `<Canvas>` in the app,
  loaded via `next/dynamic(() => import(...), { ssr: false })` from
  `hero-section.tsx`, positioned `sticky` inside a tall (~150vh) scroll-track
  wrapper so it can be pinned by ScrollTrigger and then release into normal
  flow.
- **`hero-scene.tsx`**: composition — lighting (simple directional/ambient,
  no heavy HDRI unless justified later), camera, and `<HeroMesh>`. Kept
  declarative/small; no business logic here.
- **`hero-mesh.tsx`**: **placeholder geometry/material for now** — the final
  3D visual direction (abstract form vs. product-like object vs. particle
  field, materials, color treatment) is deferred to the design/
  implementation phase and is out of scope for this architecture doc. This
  file's boundaries (inputs: scroll progress + pointer target; outputs: a
  mesh in the scene) are fixed; its visual content is not.
- **`use-hero-scroll-rig.ts`**: reads ScrollTrigger progress (0–1) into a
  ref (not React state) and, inside `useFrame`, lerps the mesh/camera toward
  that target each frame — avoids re-renders driving WebGL, keeps motion
  smooth.
- **`three/shared/pointer-parallax.ts`**: normalized pointer position →
  lerped target vector, consumed by both the hero rig (subtle tilt) and
  `MagneticButton` (2D case) — one implementation, two consumers.
- **Performance defaults:** `frameloop="demand"` with explicit
  `invalidate()` calls on scroll/pointer updates unless a genuinely
  continuous idle animation is designed in (then `"always"`, capped via
  `dpr={[1, 2]}` and `performance={{ min: 0.5 }}`); reduced-motion users get
  a static single frame, no rig.
- **Isolation:** nothing outside `three/` imports `three`/`@react-three/*`
  directly — `hero-section.tsx` only imports `HeroCanvas`, keeping the 3D
  dependency graph tree-shaken away from the rest of the bundle.

## 8. Configuration Changes

- **`app/globals.css`**: replace the generic neutral shadcn palette with a
  dark-first editorial theme — near-black background, off-white foreground,
  one restrained accent (not a gradient), and an extended type scale
  (`--text-display`, `--text-headline`, etc.) for the editorial hierarchy;
  add a `--font-display` token alongside the existing `--font-sans` token in
  `@theme inline`.
- **Fonts** (`app/layout.tsx`): drop the current `Inter`/`Geist` combo for a
  deliberate pairing — a tall, condensed display/grotesk for headlines
  (candidate: self-hosted via `next/font/local`) paired with a clean grotesk
  sans for body/UI (candidate: `next/font/google`, variable font,
  `display: "swap"`). Exact families to be confirmed during implementation,
  not locked in this doc.
- **`next.config.ts`**: no changes required for Three.js/R3F (Next 16 +
  Turbopack handles ESM/WebGL deps without extra config); revisit only if a
  specific asset pipeline need comes up (e.g. `next/image` remote patterns
  once real media exists).
- **`lib/utils.ts`**: unchanged, `cn()` stays the single className utility.
- **`public/`**: remove the unused create-next-app SVGs (`next.svg`,
  `vercel.svg`, `globe.svg`, `window.svg`, `file.svg`) once real assets
  replace them.
- **shadcn**: keep `components.json` as-is (`base-vega`, neutral base,
  css-variables) — custom tokens in `globals.css` cascade through the same
  `@theme inline` block it already uses; no shadcn reconfiguration needed.

## 9. Explicitly Out of Scope (for this doc)

- Exact 3D object/visual direction for the Hero scene (§3.1, §7)
- Exact typeface families (§8) — pairing *approach* only
- Real content/copy/media (placeholder data structure only)
- Any additional routes/pages beyond the single-page site
- SplitText or other GSAP club-plugin adoption (deferred, not ruled out)

## 10. Next Step

Proceed to an implementation plan (via the writing-plans skill) that breaks
this architecture into ordered, reviewable build steps. No implementation
code until that plan is reviewed and approved.
