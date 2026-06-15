// Bracket de playoffs por columnas de ronda.
//
// La liga marca la ronda con el campo `fase` del partido (CUARTOS, SEMIS, FINAL,
// TERCER PUESTO, PLAYIN). No hay dato de sembrado/posición en el cuadro, así que
// renderizamos cada ronda como una columna con sus llaves — fiel a los datos, sin
// inventar conexiones. Componente presentacional (server-safe).

import Link from 'next/link';
import { TeamLogo } from './TeamLogo';
import type { Partido, Equipo } from '@/types';

function normFase(f?: string): string {
  return (f || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

interface Ronda { idx: number; label: string }

function rondaDe(fase?: string): Ronda | null {
  const f = normFase(fase);
  if (!f || f === 'REGULAR') return null;
  if (f.includes('PLAY'))                       return { idx: 0, label: 'Play-In' };
  if (f.includes('OCTAVO') || f.includes('8VO'))return { idx: 1, label: 'Octavos' };
  if (f.includes('CUARTO') || f.includes('4TO'))return { idx: 2, label: 'Cuartos' };
  if (f.includes('TERCER') || f.includes('3ER'))return { idx: 5, label: 'Tercer puesto' };
  if (f.includes('SEMI'))                        return { idx: 3, label: 'Semifinales' };
  if (f.includes('FINAL'))                       return { idx: 4, label: 'Final' };
  // Fase de playoff desconocida: la mostramos con su nombre tal cual, al final.
  return { idx: 50, label: (fase || '').trim() };
}

export function PlayoffBracket({
  partidos,
  equipos,
  categoria,
}: {
  partidos: Partido[];
  equipos: Map<string, Equipo>;
  categoria: string;
}) {
  // Filtrar a partidos de playoff y agrupar por ronda
  const porRonda = new Map<number, { label: string; partidos: Partido[] }>();
  partidos.forEach(p => {
    const r = rondaDe(p.fase);
    if (!r) return;
    if (!porRonda.has(r.idx)) porRonda.set(r.idx, { label: r.label, partidos: [] });
    porRonda.get(r.idx)!.partidos.push(p);
  });

  if (porRonda.size === 0) return null;

  const rondas = Array.from(porRonda.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([idx, v]) => ({ idx, label: v.label, partidos: v.partidos }));

  return (
    <section>
      <h2 className="text-xs font-extrabold tracking-[0.13em] text-[var(--color-text)] uppercase mb-4 border-b-2 border-liga-coral pb-2">
        🏆 Playoffs
      </h2>

      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-4 min-w-max items-stretch pb-2">
          {rondas.map(ronda => (
            <div key={ronda.idx} className="flex flex-col justify-around gap-4 min-w-[230px] w-[230px]">
              <h3 className="text-[10px] font-extrabold tracking-[0.14em] text-[var(--color-text-dim)] uppercase text-center">
                {ronda.label}
              </h3>

              {ronda.partidos.map(p => {
                const isFinal = ronda.idx === 4;
                const fin = p.estatus === 'finalizado';
                const ml = p.marcadorLocal     ?? 0;
                const mv = p.marcadorVisitante ?? 0;
                const localGana = fin && ml > mv;
                const visitGana = fin && mv > ml;
                const logoL = equipos.get(p.equipoLocalId     || '')?.logoUrl;
                const logoV = equipos.get(p.equipoVisitanteId || '')?.logoUrl;

                return (
                  <Link
                    key={p.id}
                    href={`/partido/${p.id}?categoria=${categoria}`}
                    className={
                      'block rounded-xl border shadow-card card-hover overflow-hidden ' +
                      (isFinal
                        ? 'border-liga-gold/50 bg-liga-goldSoft'
                        : 'border-[var(--color-border)] bg-[var(--color-card)]')
                    }
                  >
                    {/* Local */}
                    <div className={
                      'flex items-center gap-2 px-3 py-2.5 ' +
                      (visitGana ? 'opacity-45' : '')
                    }>
                      <TeamLogo nombre={p.equipoLocalNombre} logoUrl={logoL} size={24} />
                      <span className={
                        'text-xs font-bold truncate flex-1 ' +
                        (localGana ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim)]')
                      }>
                        {p.equipoLocalNombre || 'Por definir'}
                      </span>
                      {fin && (
                        <span className={
                          'cond text-lg font-black tabular-nums ' +
                          (localGana ? 'text-liga-coral' : 'text-[var(--color-text-dim2)]')
                        }>
                          {ml}
                        </span>
                      )}
                    </div>

                    <div className="h-px bg-[var(--color-border)]" />

                    {/* Visitante */}
                    <div className={
                      'flex items-center gap-2 px-3 py-2.5 ' +
                      (localGana ? 'opacity-45' : '')
                    }>
                      <TeamLogo nombre={p.equipoVisitanteNombre} logoUrl={logoV} size={24} />
                      <span className={
                        'text-xs font-bold truncate flex-1 ' +
                        (visitGana ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim)]')
                      }>
                        {p.equipoVisitanteNombre || 'Por definir'}
                      </span>
                      {fin && (
                        <span className={
                          'cond text-lg font-black tabular-nums ' +
                          (visitGana ? 'text-liga-coral' : 'text-[var(--color-text-dim2)]')
                        }>
                          {mv}
                        </span>
                      )}
                    </div>

                    {/* Estado */}
                    {!fin && (
                      <div className="px-3 py-1.5 bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] text-center">
                        <span className="text-[9px] font-extrabold tracking-[0.13em] uppercase text-liga-coral">
                          {p.enVivo ? '● En vivo' : 'Por jugar'}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
