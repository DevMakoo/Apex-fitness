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
