// Placeholder visual panel — the `role="img"` div is where real photography
// or video swaps in later; the crossfade/timeline logic in experience-section.tsx
// only ever targets the outer `[data-experience-visual]` wrapper, so replacing
// the placeholder inner element requires no restructuring.
export function ExperienceVisual({ index, label }: { index: number; label: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden border border-border bg-card/40">
      <span
        aria-hidden="true"
        className="pointer-events-none select-none font-display text-[7rem] leading-none text-muted-foreground/20 md:text-[10rem]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div role="img" aria-label={label} className="absolute inset-0" />
    </div>
  );
}
