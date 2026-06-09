import Link from 'next/link';
import { APP_URL } from '@/lib/site';

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
    <header className="bg-liga-dark text-white sticky top-0 z-30 shadow-md">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo + branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-md bg-liga-coral flex items-center justify-center font-extrabold text-white text-base group-hover:scale-105 transition-transform">
            LM
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-bold text-sm">Liga Metropolitana</span>
            <span className="text-[11px] text-zinc-400">Eje Este · 2026</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto no-scrollbar -mx-2 px-2">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap px-2.5 sm:px-3 py-2 rounded-md text-zinc-300 hover:text-white hover:bg-white/10 font-semibold transition-colors"
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
          className="hidden md:inline-flex items-center gap-1.5 rounded-md bg-liga-coral hover:bg-liga-coralDark text-white px-3.5 py-2 text-xs font-bold transition-colors"
        >
          📱 Descargar app
        </a>
      </div>
    </header>
  );
}
