import Link from 'next/link';

const NAV = [
  { href: '/',           label: 'Inicio' },
  { href: '/calendario', label: 'Calendario' },
  { href: '/posiciones', label: 'Tabla' },
  { href: '/equipos',    label: 'Equipos' },
  { href: '/jugadores',  label: 'Stats' },
  { href: '/noticias',   label: 'Noticias' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--color-bg)]/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-liga-navy text-white flex items-center justify-center font-bold text-sm">
            LM
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">Liga Metropolitana</p>
            <p className="text-[11px] text-[var(--color-text-dim)]">Eje Este · 2026</p>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-sm">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[var(--color-text-dim)] hover:text-white transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://estadisticasavanzadas.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-liga-orange/15 border border-liga-orange/40 text-liga-orange px-3 py-1.5 text-xs font-bold hover:bg-liga-orange/25 transition-colors"
        >
          Descargar app
        </a>
      </div>

      {/* Nav móvil simple */}
      <nav className="sm:hidden flex gap-4 px-4 pb-2 overflow-x-auto no-scrollbar text-xs">
        {NAV.map(n => (
          <Link key={n.href} href={n.href} className="text-[var(--color-text-dim)] whitespace-nowrap">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
