export function HeroScrollCue() {
  return (
    <div className="flex items-center gap-3 text-caption uppercase tracking-widest text-muted-foreground">
      <span>Scroll</span>
      <span aria-hidden="true" className="h-8 w-px bg-current motion-safe:animate-pulse" />
    </div>
  );
}
