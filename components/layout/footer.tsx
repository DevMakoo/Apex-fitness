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
