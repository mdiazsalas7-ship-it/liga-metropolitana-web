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
import { RosterClient } from '@/components/RosterClient';

export const dynamic = 'force-dynamic';

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

  // Resultados finalizados, ordenados cronológicamente
  type ResRow = { fecha: string; esLocal: boolean; mio: number; otro: number; gano: boolean; empate: boolean };
  const resultados: ResRow[] = partidosEquipo
    .filter(p => p.estatus === 'finalizado')
    .map(p => {
      const esLocal = p.equipoLocalId === eq.id;
      const mio  = esLocal ? (p.marcadorLocal ?? 0)     : (p.marcadorVisitante ?? 0);
      const otro = esLocal ? (p.marcadorVisitante ?? 0) : (p.marcadorLocal ?? 0);
      return {
        fecha: typeof p.fechaAsignada === 'string' ? p.fechaAsignada : '',
        esLocal, mio, otro,
        gano: mio > otro,
        empate: mio === otro,
      };
    })
    .sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));

  let ganados = 0, perdidos = 0;
  resultados.forEach(r => { if (r.empate) return; if (r.gano) ganados++; else perdidos++; });

  // Racha actual (desde el último partido hacia atrás)
  let racha = 0;
  let rachaTipo: 'G' | 'P' | null = null;
  for (let i = resultados.length - 1; i >= 0; i--) {
    const r = resultados[i];
    if (r.empate) break;
    const tipo: 'G' | 'P' = r.gano ? 'G' : 'P';
    if (rachaTipo === null) { rachaTipo = tipo; racha = 1; }
    else if (tipo === rachaTipo) { racha++; }
    else break;
  }

  // Forma: últimos 5 (cronológico)
  const ultimos5 = resultados.slice(-5);

  // Splits local / visitante
  const rec = (filtro: (r: ResRow) => boolean) => {
    let g = 0, p = 0;
    resultados.filter(filtro).forEach(r => { if (r.empate) return; if (r.gano) g++; else p++; });
    return { g, p };
  };
  const recLocal  = rec(r => r.esLocal);
  const recVisita = rec(r => !r.esLocal);

  // Promedios de puntos
  const njuegos = resultados.length;
  const promPF = njuegos ? resultados.reduce((a, r) => a + r.mio, 0) / njuegos : 0;
  const promPC = njuegos ? resultados.reduce((a, r) => a + r.otro, 0) / njuegos : 0;

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
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <TeamLogo nombre={eq.nombre} logoUrl={eq.logoUrl} size={80} ring />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold truncate">{eq.nombre}</h1>
            <p className="text-xs text-[var(--color-text-dim)] mt-1">
              {c.label} {eq.grupo ? `· Grupo ${eq.grupo}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Ganados</p>
            <p className="cond text-3xl font-extrabold text-liga-final mt-1 tabular-nums leading-none">{ganados}</p>
          </div>
          <div className="rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Perdidos</p>
            <p className="cond text-3xl font-extrabold text-liga-live mt-1 tabular-nums leading-none">{perdidos}</p>
          </div>
          <div className="rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Plantel</p>
            <p className="cond text-3xl font-extrabold text-[var(--color-text)] mt-1 tabular-nums leading-none">{jugadores.length}</p>
          </div>
        </div>
      </section>

      {/* Forma reciente */}
      {resultados.length > 0 && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card p-5 sm:p-6">
          <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-4">
            Forma reciente
          </h2>

          <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
            {/* Racha */}
            {rachaTipo && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Racha</p>
                <p className={'cond text-3xl font-black mt-1 leading-none ' + (rachaTipo === 'G' ? 'text-liga-final' : 'text-liga-live')}>
                  {racha}{rachaTipo}
                </p>
                <p className="text-[10px] text-[var(--color-text-dim)] mt-1">
                  {rachaTipo === 'G' ? (racha === 1 ? 'victoria' : 'victorias seguidas') : (racha === 1 ? 'derrota' : 'derrotas seguidas')}
                </p>
              </div>
            )}

            {/* Últimos 5 */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold mb-2">
                Últimos {ultimos5.length}
              </p>
              <div className="flex items-center gap-1.5">
                {ultimos5.map((r, i) => (
                  <span
                    key={i}
                    title={`${r.mio}-${r.otro} ${r.esLocal ? '(local)' : '(visitante)'}`}
                    className={
                      'w-7 h-7 rounded-md flex items-center justify-center text-xs font-extrabold ' +
                      (r.empate
                        ? 'bg-[var(--color-card-2)] text-[var(--color-text-dim)]'
                        : r.gano
                          ? 'bg-liga-finalSoft text-liga-final'
                          : 'bg-liga-liveSoft text-liga-live')
                    }
                  >
                    {r.empate ? 'E' : r.gano ? 'G' : 'P'}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-[var(--color-text-dim2)] mt-1.5">del más viejo al más reciente</p>
            </div>
          </div>

          {/* Splits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">De local</p>
              <p className="cond text-2xl font-extrabold mt-1 tabular-nums leading-none text-[var(--color-text)]">{recLocal.g}-{recLocal.p}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">De visitante</p>
              <p className="cond text-2xl font-extrabold mt-1 tabular-nums leading-none text-[var(--color-text)]">{recVisita.g}-{recVisita.p}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Prom. a favor</p>
              <p className="cond text-2xl font-extrabold mt-1 tabular-nums leading-none text-liga-gold">{promPF.toFixed(1)}</p>
            </div>
            <div className="rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Prom. en contra</p>
              <p className="cond text-2xl font-extrabold mt-1 tabular-nums leading-none text-[var(--color-text-dim)]">{promPC.toFixed(1)}</p>
            </div>
          </div>
        </section>
      )}

      {/* Roster */}
      {jugadores.length > 0 && (
        <section>
          <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
            Roster
          </h2>
          <RosterClient
            jugadores={jugadores}
            categoriaId={c.id}
            equipoNombre={eq.nombre}
            equipoLogoUrl={eq.logoUrl}
          />
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
