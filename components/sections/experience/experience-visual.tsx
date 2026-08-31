import Image from "next/image";

// The `role="img"` div previously here was a placeholder for real photography;
// the crossfade/timeline logic in experience-section.tsx only ever targets the
// outer `[data-experience-visual]` wrapper, so swapping this inner element for
// real images requires no restructuring there.
const PHASE_IMAGES = [
  {
    src: "/references/experience/experience-01.jpg",
    position: "object-[50%_20%]",
  },
  {
    src: "/references/experience/experience-02.jpg",
    position: "object-[50%_25%]",
  },
] as const;

export function ExperienceVisual({ index, label }: { index: number; label: string }) {
  const image = PHASE_IMAGES[index % PHASE_IMAGES.length];

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden border border-border bg-card/40">
      <Image
        src={image.src}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className={`object-cover ${image.position}`}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-background/20" />
      <span
        aria-hidden="true"
        className="pointer-events-none relative z-10 select-none font-display text-[7rem] leading-none text-muted-foreground/30 md:text-[10rem]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div role="img" aria-label={label} className="absolute inset-0 z-10" />
    </div>
  );
}
