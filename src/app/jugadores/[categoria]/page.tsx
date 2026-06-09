// Líderes por estadística (puntos, rebotes, robos, triples, bloqueos) de una categoría.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import { getJugadoresPorCategoria } from '@/lib/queries';
import { TeamLogo } from '@/components/TeamLogo';
import type { Jugador } from '@/types';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

type StatKey = 'puntos' | 'rebotes' | 'robos' | 'triples' | 'bloqueos';
const STAT_LABELS: Record<StatKey, { label: string; unit: string; color: string }> = {
  puntos:   { label: 'Goleadores', unit: 'PPP',          color: 'text-liga-gold' },
  rebotes:  { label: 'Rebotes',    unit: 'RPP',          color: 'text-emerald-400' },
  robos:    { label: 'Robos',      unit: 'por partido',  color: 'text-blue-400' },
  triples:  { label: 'Triples',    unit: 'por partido',  color: 'text-purple-400' },
  bloqueos: { label: 'Bloqueos',   unit: 'por partido',  color: 'text-red-400' },
};

function rankBy(jugadores: Jugador[], stat: StatKey, n = 10) {
  return jugadores
    .filter(j => ((j[stat] as number) || 0) > 0)
    .map(j => {
      const valor = (j[stat] as number) || 0;
      const pj = j.partidosJugados || 1;
      return { jugador: j, valor, promedio: valor / pj };
    })
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, n);
}

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) return { title: 'Estadísticas' };
  return {
    title: `Líderes ${cat.label}`,
    description: `Goleadores y líderes en todas las estadísticas de ${cat.label}.`,
  };
}

export default async function JugadoresPorCategoriaPage({ params }: { params: { categoria: string } }) {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) notFound();
  const c = cat!;

  const jugadores = await getJugadoresPorCategoria(c.id as CategoriaId);

  const rankings = {
    puntos:   rankBy(jugadores, 'puntos',   10),
    rebotes:  rankBy(jugadores, 'rebotes',  5),
    robos:    rankBy(jugadores, 'robos',    5),
    triples:  rankBy(jugadores, 'triples',  5),
    bloqueos: rankBy(jugadores, 'bloqueos', 5),
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <Link href="/jugadores" className="hover:text-[var(--color-text-dim)]">Stats</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)]">{c.label}</span>
      </p>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Líderes · <span className="text-liga-coral">{c.label}</span></h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">{jugadores.length} jugadores registrados</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-[var(--color-border)] pb-3">
        {CATEGORIAS.map(x => (
          <Link key={x.id} href={`/jugadores/${x.id}`}
            className={
              'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ' +
              (x.id === c.id
                ? 'bg-liga-dark border border-liga-dark text-white'
                : 'bg-white border border-[var(--color-border)] text-[var(--color-text-dim)] hover:bg-[var(--color-bg)]')
            }>
            {x.label}
          </Link>
        ))}
      </div>

      {(Object.keys(rankings) as StatKey[]).map(stat => {
        const cfg = STAT_LABELS[stat];
        const rank = rankings[stat];
        if (rank.length === 0) return null;
        return (
          <section key={stat}>
            <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
              {cfg.label}
            </h2>
            <div className="rounded-xl border border-[var(--color-border)] bg-white shadow-card divide-y divide-[var(--color-border)]">
              {rank.map((r, i) => (
                <Link key={r.jugador.id} href={`/jugador/${r.jugador.id}?categoria=${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg)] transition-colors">
                  <span className="text-xs font-bold text-[var(--color-text-dim2)] w-5 tabular-nums">{i + 1}.</span>
                  <TeamLogo nombre={r.jugador.nombre} logoUrl={r.jugador.fotoUrl} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      <span className="text-liga-coral mr-1.5">#{r.jugador.numero}</span>
                      {r.jugador.nombre}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-dim)] truncate">{r.jugador.equipoNombre}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={'text-lg font-extrabold tabular-nums ' + cfg.color}>
                      {r.promedio.toFixed(1)}
                    </span>
                    <p className="text-[9px] text-[var(--color-text-dim2)] uppercase font-bold">{cfg.unit}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {jugadores.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-[var(--color-border)] bg-white shadow-card">
          <p className="text-sm text-[var(--color-text-dim)]">Sin jugadores registrados aún.</p>
        </div>
      )}
    </div>
  );
}
