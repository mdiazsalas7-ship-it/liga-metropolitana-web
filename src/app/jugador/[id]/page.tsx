// Ficha individual del jugador con stats acumuladas y promedios.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import { getJugadorById, getEquipoById } from '@/lib/queries';
import { TeamLogo } from '@/components/TeamLogo';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

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

  const pj = j.partidosJugados || 0;
  const stats = [
    { key: 'puntos',      label: 'Puntos',      value: j.puntos      ?? 0, color: 'text-liga-gold' },
    { key: 'rebotes',     label: 'Rebotes',     value: j.rebotes     ?? 0, color: 'text-emerald-400' },
    { key: 'robos',       label: 'Robos',       value: j.robos       ?? 0, color: 'text-blue-400' },
    { key: 'bloqueos',    label: 'Bloqueos',    value: j.bloqueos    ?? 0, color: 'text-red-400' },
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
      <section className="rounded-2xl border border-[var(--color-border)] bg-white shadow-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <TeamLogo nombre={j.nombre} logoUrl={j.fotoUrl} size={88} />
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
              { label: 'RPP', val: (j.rebotes ?? 0) / pj, color: 'text-emerald-400' },
              { label: '3PP', val: (j.triples ?? 0) / pj, color: 'text-purple-400' },
              { label: 'PJ',  val: pj,                   color: 'text-white', isInt: true },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-white p-3">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">{s.label}</p>
                <p className={`text-2xl font-extrabold mt-1 tabular-nums ${s.color}`}>
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

      {/* Totales acumulados */}
      <section>
        <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
          Totales acumulados
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stats.map(s => (
            <div key={s.key} className="rounded-lg border border-[var(--color-border)] bg-white shadow-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">{s.label}</p>
              <p className={`text-xl font-extrabold mt-1 tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
