// Ficha individual del jugador con stats acumuladas y promedios.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import { getJugadorById, getEquipoById, getStatsDeJugador, getPartidoById, getEquipos } from '@/lib/queries';
import { fechaCorta } from '@/lib/fechas';
import { TeamLogo } from '@/components/TeamLogo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { categoria?: string };
}): Promise<Metadata> {
  const cat = CATEGORIAS.find(c => c.id === searchParams.categoria);
  if (!cat) return { title: 'Jugador' };
  const j = await getJugadorById(cat.id as CategoriaId, params.id);
  if (!j) return { title: 'Jugador' };
  return {
    title: j.nombre,
    description: `Estadísticas y partidos de ${j.nombre} · ${j.equipoNombre} · ${cat.label}`,
  };
}

export default async function JugadorPage({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { categoria?: string };
}) {
  const cat = CATEGORIAS.find(c => c.id === searchParams.categoria);
  if (!cat) notFound();
  const c = cat!;

  const jug = await getJugadorById(c.id as CategoriaId, params.id);
  if (!jug) notFound();
  const j = jug!;

  const eq = j.equipoId ? await getEquipoById(c.id as CategoriaId, j.equipoId) : null;

  // ===== GAME LOG: rendimiento partido por partido =====
  const statsPorPartido = await getStatsDeJugador(j.id);
  const equiposMap = await getEquipos(c.id as CategoriaId);

  const idsUnicos = Array.from(
    new Set(statsPorPartido.map(s => s.partidoId).filter(Boolean))
  ) as string[];
  const partidosArr = await Promise.all(
    idsUnicos.map(id => getPartidoById(c.id as CategoriaId, id))
  );
  const partidosMap = new Map<string, any>();
  partidosArr.forEach((p, i) => { if (p) partidosMap.set(idsUnicos[i], p); });

  const ptsDe = (s: any) => (s.tirosLibres || 0) + (s.dobles || 0) * 2 + (s.triples || 0) * 3;
  const teamId = j.equipoId;
  const teamName = (j.equipoNombre || '').trim().toUpperCase();

  const gameLog = (statsPorPartido
    .map(s => {
      const p = partidosMap.get(s.partidoId);
      if (!p) return null;
      const esLocal =
        (!!teamId && p.equipoLocalId === teamId) ||
        (!!teamName && (p.equipoLocalNombre || '').trim().toUpperCase() === teamName);
      const rivalNombre = esLocal ? p.equipoVisitanteNombre : p.equipoLocalNombre;
      const rivalId     = esLocal ? p.equipoVisitanteId : p.equipoLocalId;
      const mio  = esLocal ? (p.marcadorLocal ?? 0)     : (p.marcadorVisitante ?? 0);
      const otro = esLocal ? (p.marcadorVisitante ?? 0) : (p.marcadorLocal ?? 0);
      const fin  = p.estatus === 'finalizado';
      return {
        partidoId: s.partidoId,
        fecha: typeof p.fechaAsignada === 'string' ? p.fechaAsignada : '',
        rivalNombre: rivalNombre || 'Rival',
        rivalLogo: equiposMap.get(rivalId || '')?.logoUrl,
        esLocal, mio, otro, fin,
        gano: fin ? mio > otro : null,
        pts: ptsDe(s),
        reb: s.rebotes  || 0,
        rob: s.robos    || 0,
        blo: s.bloqueos || 0,
        triples: s.triples || 0,
      };
    })
    .filter(Boolean) as any[])
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  // Mejor partido (más puntos) y promedio últimos 5
  const mejor = gameLog.reduce((best: any, g: any) => (!best || g.pts > best.pts ? g : best), null);
  const ult5 = gameLog.slice(0, 5);
  const prom5 = ult5.length
    ? {
        pts: ult5.reduce((a: number, g: any) => a + g.pts, 0) / ult5.length,
        reb: ult5.reduce((a: number, g: any) => a + g.reb, 0) / ult5.length,
      }
    : null;

  const pj = j.partidosJugados || 0;
  const stats = [
    { key: 'puntos',      label: 'Puntos',      value: j.puntos      ?? 0, color: 'text-liga-gold' },
    { key: 'rebotes',     label: 'Rebotes',     value: j.rebotes     ?? 0, color: 'text-liga-final' },
    { key: 'robos',       label: 'Robos',       value: j.robos       ?? 0, color: 'text-blue-400' },
    { key: 'bloqueos',    label: 'Bloqueos',    value: j.bloqueos    ?? 0, color: 'text-liga-live' },
    { key: 'triples',     label: 'Triples',     value: j.triples     ?? 0, color: 'text-purple-400' },
    { key: 'dobles',      label: 'Dobles',      value: j.dobles      ?? 0, color: 'text-blue-300' },
    { key: 'tirosLibres', label: 'Tiros libres', value: j.tirosLibres ?? 0, color: 'text-[var(--color-text-dim)]' },
    { key: 'asistencias', label: 'Asistencias', value: j.asistencias ?? 0, color: 'text-orange-300' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <Link href={`/jugadores/${c.id}`} className="hover:text-[var(--color-text-dim)]">Estadísticas · {c.label}</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)] truncate">{j.nombre}</span>
      </p>

      {/* Header */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <TeamLogo nombre={j.nombre} logoUrl={j.fotoUrl} size={88} ring />
            {j.numero != null && (
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-liga-coral border-4 border-[var(--color-bg)] flex items-center justify-center text-xs font-extrabold text-white">
                {j.numero}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold leading-tight">{j.nombre}</h1>
            <p className="text-xs text-[var(--color-text-dim)] mt-1.5">
              {eq && (
                <Link href={`/equipo/${eq.id}?categoria=${c.id}`} className="hover:text-liga-coral transition-colors">
                  {j.equipoNombre}
                </Link>
              )}
              {!eq && <span>{j.equipoNombre}</span>}
              <span className="mx-1.5">·</span>
              {c.label}
              {j.grupo && <><span className="mx-1.5">·</span>Grupo {j.grupo}</>}
            </p>
          </div>
        </div>

        {/* Promedios destacados */}
        {pj > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'PPP', val: (j.puntos ?? 0) / pj, color: 'text-liga-gold' },
              { label: 'RPP', val: (j.rebotes ?? 0) / pj, color: 'text-liga-final' },
              { label: '3PP', val: (j.triples ?? 0) / pj, color: 'text-purple-400' },
              { label: 'PJ',  val: pj,                   color: 'text-[var(--color-text)]', isInt: true },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">{s.label}</p>
                <p className={`cond text-3xl font-extrabold mt-1 tabular-nums leading-none ${s.color}`}>
                  {(s as any).isInt ? s.val : s.val.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        )}
        {pj === 0 && (
          <p className="mt-4 text-xs text-[var(--color-text-dim2)]">Aún no jugó partidos de la temporada.</p>
        )}
      </section>

      {/* GAME LOG */}
      {gameLog.length > 0 && (
        <section>
          <h2 className="text-xs font-extrabold tracking-[0.13em] text-[var(--color-text)] uppercase mb-3 border-b-2 border-liga-coral pb-2">
            Rendimiento partido por partido
          </h2>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {mejor && (
              <div className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-card p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Mejor partido</p>
                <p className="cond text-4xl font-black text-liga-gold mt-1 tabular-nums leading-none">{mejor.pts}</p>
                <p className="text-[11px] text-[var(--color-text-dim)] mt-1.5 truncate">
                  pts vs {mejor.rivalNombre}
                </p>
              </div>
            )}
            {prom5 && (
              <div className="rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-card p-4">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Últimos {ult5.length}</p>
                <p className="cond text-4xl font-black text-liga-coral mt-1 tabular-nums leading-none">{prom5.pts.toFixed(1)}</p>
                <p className="text-[11px] text-[var(--color-text-dim)] mt-1.5">
                  pts · {prom5.reb.toFixed(1)} reb de promedio
                </p>
              </div>
            )}
          </div>

          {/* Tabla */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[var(--color-bg-alt)] text-[var(--color-text-dim)] font-bold">
                <tr>
                  <th className="text-left py-2.5 px-3">Fecha</th>
                  <th className="text-left py-2.5">Rival</th>
                  <th className="py-2.5 px-2 text-center">Res.</th>
                  <th className="py-2.5 px-2 text-center text-liga-coral">PTS</th>
                  <th className="py-2.5 px-2 text-center">REB</th>
                  <th className="py-2.5 px-2 text-center">ROB</th>
                  <th className="py-2.5 px-2 text-center">BLO</th>
                  <th className="py-2.5 px-2 text-center">3P</th>
                </tr>
              </thead>
              <tbody>
                {gameLog.map((g: any) => (
                  <tr key={g.partidoId} className="border-t border-[var(--color-border)] hover:bg-[var(--color-card-2)] transition-colors">
                    <td className="py-2.5 px-3 text-[var(--color-text-dim)] whitespace-nowrap">
                      {g.fecha ? fechaCorta(g.fecha) : '—'}
                    </td>
                    <td className="py-2.5">
                      <Link
                        href={`/partido/${g.partidoId}?categoria=${c.id}`}
                        className="flex items-center gap-2 min-w-0 hover:text-liga-coral transition-colors"
                      >
                        <span className="text-[var(--color-text-dim2)] text-[10px] w-5 flex-shrink-0">{g.esLocal ? 'vs' : '@'}</span>
                        <TeamLogo nombre={g.rivalNombre} logoUrl={g.rivalLogo} size={22} />
                        <span className="font-semibold truncate max-w-[120px]">{g.rivalNombre}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {g.fin ? (
                        <span className={'font-extrabold ' + (g.gano ? 'text-liga-final' : 'text-liga-live')}>
                          {g.gano ? 'G' : 'P'} {g.mio}-{g.otro}
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-dim2)]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center font-extrabold text-liga-coral tabular-nums">{g.pts}</td>
                    <td className="py-2.5 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{g.reb}</td>
                    <td className="py-2.5 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{g.rob}</td>
                    <td className="py-2.5 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{g.blo}</td>
                    <td className="py-2.5 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{g.triples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Totales acumulados */}
      <section>
        <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
          Totales acumulados
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stats.map(s => (
            <div key={s.key} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">{s.label}</p>
              <p className={`cond text-2xl font-extrabold mt-1 tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
