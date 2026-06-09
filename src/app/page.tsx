// Fase 1: home placeholder. Confirma visualmente que el sitio está vivo
// y que la conexión a Firestore va a poder leer datos.
// La Fase 2 reemplazará esto por: partido en vivo + próximos + líderes + noticias.

import Link from 'next/link';
import { CATEGORIAS } from '@/lib/categorias';

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-liga-navy/40 to-transparent p-8 sm:p-12">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-liga-orange/15 border border-liga-orange/40 text-liga-orange text-xs font-bold tracking-wider px-3 py-1 uppercase">
            Temporada 2026
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold leading-tight">
            Liga Metropolitana<br />
            <span className="text-liga-orange">Eje Este</span>
          </h1>
          <p className="mt-4 text-[var(--color-text-dim)] text-sm sm:text-base leading-relaxed">
            Resultados en vivo, calendario, estadísticas y noticias de todas las categorías de la liga.
            Sigue cada partido jugada por jugada.
          </p>
        </div>
      </section>

      {/* Categorías */}
      <section>
        <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
          Categorías
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIAS.map(c => (
            <Link
              key={c.id}
              href={`/calendario/${c.id}`}
              className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors px-4 py-5 text-center"
            >
              <p className="font-bold text-sm">{c.label}</p>
              <p className="text-[11px] text-[var(--color-text-dim)] mt-1">Ver partidos →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Próximos pasos (placeholder visible para vos en Fase 1) */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
          Estado del sitio
        </h2>
        <p className="text-sm leading-relaxed">
          <span className="text-liga-gold font-bold">Fase 1 completada:</span>{' '}
          el sitio está vivo y conectado a Firestore.
        </p>
        <p className="text-sm text-[var(--color-text-dim)] mt-2">
          Próximas fases en construcción: marcador en vivo del partido actual, calendario navegable,
          páginas de partido con box score y play-by-play, fichas de jugadores y equipos, tabla de
          posiciones y noticias.
        </p>
      </section>
    </div>
  );
}
