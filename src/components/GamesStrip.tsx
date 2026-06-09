'use client';

// Strip horizontal de partidos arriba de la home (como el "games bar" de NBA.com).
// Mezcla: partidos EN VIVO + próximos (hoy/mañana) + últimos resultados.

import Link from 'next/link';
import { useMemo } from 'react';
import { TeamLogo } from './TeamLogo';
import type { Partido, Equipo } from '@/types';

const CAT_LABELS: Record<string, string> = {
  INTERINDUSTRIAL: 'INTER',
  U16_FEMENINO:    'U16F',
  U16M:            'U16M',
  MASTER40:        'M40',
  LIBRE:           'LIBRE',
};

function diaCorto(iso?: string): string {
  if (!iso || typeof iso !== 'string') return '';
  const parts = iso.split('-');
  if (parts.length < 3) return '';
  const [y, m, d] = parts.map(Number);
  if (!y) return '';
  const date = new Date(y, (m || 1) - 1, d || 1);
  const dias  = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB'];
  const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(date); target.setHours(0,0,0,0);
  if (target.getTime() === today.getTime()) return 'HOY';
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  if (target.getTime() === tomorrow.getTime()) return 'MAÑ';
  return `${dias[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]}`;
}

export function GamesStrip({
  partidos,
  equipos,
}: {
  partidos: Partido[];
  equipos: Map<string, Equipo>;
}) {
  // Orden: EN VIVO primero, luego próximos (asc por fecha), luego finalizados (desc)
  const ordered = useMemo(() => {
    const live = partidos.filter(p => p.enVivo === true && p.estatus !== 'finalizado');
    const next = partidos
      .filter(p => p.estatus !== 'finalizado' && !(p.enVivo === true))
      .sort((a, b) => {
        const fa = typeof a.fechaAsignada === 'string' ? a.fechaAsignada : '';
        const fb = typeof b.fechaAsignada === 'string' ? b.fechaAsignada : '';
        return fa.localeCompare(fb);
      });
    const done = partidos
      .filter(p => p.estatus === 'finalizado')
      .sort((a, b) => {
        const fa = typeof a.fechaAsignada === 'string' ? a.fechaAsignada : '';
        const fb = typeof b.fechaAsignada === 'string' ? b.fechaAsignada : '';
        return fb.localeCompare(fa);
      });
    return [...live, ...next.slice(0, 6), ...done.slice(0, 4)];
  }, [partidos]);

  if (ordered.length === 0) return null;

  return (
    <div className="bg-liga-dark border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1">
          {ordered.map(p => {
            const isLive   = p.enVivo === true && p.estatus !== 'finalizado';
            const isFinal  = p.estatus === 'finalizado';
            const ml = p.marcadorLocal ?? 0;
            const mv = p.marcadorVisitante ?? 0;
            const cat = p.categoria || '';
            const logoL = equipos.get(p.equipoLocalId     || '')?.logoUrl;
            const logoV = equipos.get(p.equipoVisitanteId || '')?.logoUrl;
            const localGana = ml > mv;

            return (
              <Link
                key={p.id}
                href={`/partido/${p.id}?categoria=${cat}`}
                className={
                  'flex-shrink-0 w-[180px] rounded-md border transition-colors px-3 py-2 ' +
                  (isLive
                    ? 'bg-liga-live/15 border-liga-live hover:bg-liga-live/25'
                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700')
                }
              >
                {/* Top bar tag */}
                <div className="flex items-center justify-between mb-1.5">
                  {isLive ? (
                    <span className="text-[9px] font-extrabold text-liga-live tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-liga-live pulse-live" /> LIVE
                    </span>
                  ) : isFinal ? (
                    <span className="text-[9px] font-extrabold text-zinc-500 tracking-widest">
                      FINAL
                    </span>
                  ) : (
                    <span className="text-[9px] font-extrabold text-zinc-400 tracking-widest">
                      {diaCorto(p.fechaAsignada)}{p.hora ? ` · ${p.hora}` : ''}
                    </span>
                  )}
                  <span className="text-[9px] font-bold text-zinc-500 tracking-widest">
                    {CAT_LABELS[cat] ?? cat}
                  </span>
                </div>

                {/* Local */}
                <div className="flex items-center justify-between gap-1.5 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TeamLogo nombre={p.equipoLocalNombre} logoUrl={logoL} size={20} />
                    <span className={
                      'text-[11px] font-bold truncate ' +
                      (isFinal && !localGana ? 'text-zinc-500' : 'text-white')
                    }>
                      {p.equipoLocalNombre}
                    </span>
                  </div>
                  {(isLive || isFinal) && (
                    <span className={
                      'text-sm font-extrabold tabular-nums ' +
                      (isFinal && !localGana ? 'text-zinc-500' : 'text-white')
                    }>
                      {ml}
                    </span>
                  )}
                </div>

                {/* Visitante */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TeamLogo nombre={p.equipoVisitanteNombre} logoUrl={logoV} size={20} />
                    <span className={
                      'text-[11px] font-bold truncate ' +
                      (isFinal && localGana ? 'text-zinc-500' : 'text-white')
                    }>
                      {p.equipoVisitanteNombre}
                    </span>
                  </div>
                  {(isLive || isFinal) && (
                    <span className={
                      'text-sm font-extrabold tabular-nums ' +
                      (isFinal && localGana ? 'text-zinc-500' : 'text-white')
                    }>
                      {mv}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Ver todos */}
          <Link
            href="/calendario"
            className="flex-shrink-0 flex items-center justify-center px-3 text-[10px] font-extrabold text-zinc-400 hover:text-white tracking-widest uppercase whitespace-nowrap"
          >
            Ver todos →
          </Link>
        </div>
      </div>
    </div>
  );
}
