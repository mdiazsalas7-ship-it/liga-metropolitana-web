// Ficha del equipo: logo, roster, partidos del equipo.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import {
  getEquipoById, getJugadoresDeEquipo, getPartidosPorCategoria, getEquipos,
} from '@/lib/queries';
import { TeamLogo } from '@/components/TeamLogo';
import { MatchCard } from '@/components/MatchCard';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { categoria?: string };
}): Promise<Metadata> {
  const cat = CATEGORIAS.find(c => c.id === searchParams.categoria);
  if (!cat) return { title: 'Equipo' };
  const eq = await getEquipoById(cat.id as CategoriaId, params.id);
  if (!eq) return { title: 'Equipo' };
  return {
    title: eq.nombre,
    description: `Roster, estadísticas y partidos de ${eq.nombre} · ${cat.label}`,
  };
}

export default async function EquipoPage({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { categoria?: string };
}) {
  const cat = CATEGORIAS.find(c => c.id === searchParams.categoria);
  if (!cat) notFound();
  const c = cat!;

  const [equipo, jugadores, todosPartidos, equiposMap] = await Promise.all([
    getEquipoById(c.id as CategoriaId, params.id),
    getJugadoresDeEquipo(c.id as CategoriaId, params.id),
    getPartidosPorCategoria(c.id as CategoriaId),
    getEquipos(c.id as CategoriaId),
  ]);
  if (!equipo) notFound();
  const eq = equipo!;

  // Filtrar partidos de este equipo
  const partidosEquipo = todosPartidos.filter(
    p => p.equipoLocalId === eq.id || p.equipoVisitanteId === eq.id
  );

  // Calcular récord (G-P) en regular
  let ganados = 0, perdidos = 0;
  partidosEquipo.forEach(p => {
    if (p.estatus !== 'finalizado') return;
    const esLocal = p.equipoLocalId === eq.id;
    const mio   = esLocal ? (p.marcadorLocal ?? 0)     : (p.marcadorVisitante ?? 0);
    const otro  = esLocal ? (p.marcadorVisitante ?? 0) : (p.marcadorLocal ?? 0);
    if (mio > otro) ganados++;
    else if (mio < otro) perdidos++;
  });

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <Link href={`/equipos/${c.id}`} className="hover:text-[var(--color-text-dim)]">Equipos · {c.label}</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)]">{eq.nombre}</span>
      </p>

      {/* Header con logo, nombre, récord */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-white shadow-card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <TeamLogo nombre={eq.nombre} logoUrl={eq.logoUrl} size={80} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold truncate">{eq.nombre}</h1>
            <p className="text-xs text-[var(--color-text-dim)] mt-1">
              {c.label} {eq.grupo ? `· Grupo ${eq.grupo}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="rounded-lg bg-white p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Ganados</p>
            <p className="text-2xl font-extrabold text-emerald-500 mt-1 tabular-nums">{ganados}</p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Perdidos</p>
            <p className="text-2xl font-extrabold text-red-400 mt-1 tabular-nums">{perdidos}</p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Plantel</p>
            <p className="text-2xl font-extrabold text-white mt-1 tabular-nums">{jugadores.length}</p>
          </div>
        </div>
      </section>

      {/* Roster */}
      {jugadores.length > 0 && (
        <section>
          <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
            Roster
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {jugadores.map(j => (
              <Link key={j.id} href={`/jugador/${j.id}?categoria=${c.id}`}
                className="rounded-lg border border-[var(--color-border)] bg-white shadow-card hover:bg-[var(--color-bg)] transition-colors px-3.5 py-2.5 flex items-center gap-3">
                <TeamLogo nombre={j.nombre} logoUrl={j.fotoUrl} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">
                    <span className="text-liga-coral mr-1.5">#{j.numero}</span>
                    {j.nombre}
                  </p>
                  {(j.puntos ?? 0) > 0 && (
                    <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
                      {j.puntos} pts · {j.partidosJugados ?? 0} PJ
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Partidos */}
      {partidosEquipo.length > 0 && (
        <section>
          <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
            Partidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partidosEquipo.slice(0, 30).map(p => (
              <MatchCard key={p.id} partido={p} equipos={equiposMap}
                variant={p.estatus === 'finalizado' ? 'resultado' : 'proximo'} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
