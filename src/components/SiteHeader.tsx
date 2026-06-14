import Link from 'next/link';
import { APP_URL, LEAGUE_LOGO_URL } from '@/lib/site';

const NAV = [
  { href: '/',            label: 'Inicio' },
  { href: '/calendario',  label: 'Calendario' },
  { href: '/posiciones',  label: 'Tabla' },
  { href: '/equipos',     label: 'Equipos' },
  { href: '/jugadores',   label: 'Estadísticas' },
  { href: '/entrevistas', label: 'Videos' },
  { href: '/noticias',    label: 'Noticias' },
];

export function SiteHeader() {
  return (
    <header className="bg-[var(--color-dark)] text-white sticky top-0 z-30 border-b border-[var(--color-border)] backdrop-blur supports-[backdrop-filter]:bg-[var(--color-dark)]/90">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo + branding */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-white shadow-md ring-2 ring-white/10 group-hover:ring-liga-coral/60 transition-all flex-shrink-0">
            <img
              src={LEAGUE_LOGO_URL}
              alt="Liga Metropolitana Eje Este"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-extrabold text-sm">Liga Metropolitana</span>
            <span className="text-[11px] text-[var(--color-text-dim)]">Eje Este · 2026</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm overflow-x-auto no-scrollbar -mx-2 px-2">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap px-2.5 sm:px-3 py-2 rounded-md text-[var(--color-text-dim)] hover:text-white hover:bg-white/[0.06] font-semibold transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <a
          href={APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-liga-coral hover:bg-[#ff7350] text-white px-3.5 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 shadow-[0_8px_20px_-6px_rgba(255,90,48,0.5)] flex-shrink-0"
        >
          📱 Descargar app
        </a>
      </div>
    </header>
  );
}
