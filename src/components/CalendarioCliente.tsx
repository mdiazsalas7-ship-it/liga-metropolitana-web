'use client';

// Cliente: filtros de pestaña + buscador + agrupación por fecha.
// El listado completo de partidos viene del server (props), acá solo filtramos.

import { useMemo, useState } from 'react';
import { MatchCard } from './MatchCard';
import type { Partido, Equipo } from '@/types';

const FASES_PLAYOFF = ['PLAYIN', 'CUARTOS', 'SEMIS', 'FINAL', 'TERCER PUESTO'];
const esFasePlayoff = (fase?: string) =>
  !!fase && FASES_PLAYOFF.includes(fase.trim().toUpperCase());

type FilterType = 'TODOS' | 'A' | 'B' | 'PLAYOFFS' | 'PENDIENTES' | 'FINALIZADOS' | 'ENVIVO';

function agruparPorFecha(partidos: Partido[]): Map<string, Partido[]> {
  const map = new Map<string, Partido[]>();
  partidos.forEach(p => {
    const k = p.fechaAsignada || 'sin-fecha';
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(p);
  });
  return map;
}

function fechaHeader(iso: string): string {
  if (!iso || iso === 'sin-fecha') return 'Sin fecha';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const dias  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const target = new Date(date); target.setHours(0,0,0,0);

  if (target.getTime() === today.getTime())     return `Hoy · ${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`;
  if (target.getTime() === tomorrow.getTime())  return `Mañana · ${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`;
  if (target.getTime() === yesterday.getTime()) return `Ayer · ${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`;
  return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`;
}

export function CalendarioCliente({
  partidos,
  equipos,
  categoriaLabel,
}: {
  partidos: Partido[];
  equipos: Equipo[];
  categoriaLabel: string;
}) {
  const [filter, setFilter]         = useState<FilterType>('TODOS');
  const [search, setSearch]         = useState('');

  const equiposMap = useMemo(() => {
    const m = new Map<string, Equipo>();
    equipos.forEach(e => m.set(e.id, e));
    return m;
  }, [equipos]);

  const liveCount = useMemo(
    () => partidos.filter(p => p.enVivo === true && p.estatus !== 'finalizado').length,
    [partidos]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return partidos.filter(m => {
      // Filtro de pestaña
      let pass = true;
      switch (filter) {
        case 'TODOS':       pass = true; break;
        case 'PLAYOFFS':    pass = esFasePlayoff(m.fase); break;
        case 'PENDIENTES':  pass = m.estatus !== 'finalizado'; break;
        case 'FINALIZADOS': pass = m.estatus === 'finalizado'; break;
        case 'ENVIVO':      pass = m.enVivo === true && m.estatus !== 'finalizado'; break;
        case 'A':           pass = (m.grupo || '').toUpperCase() === 'A'; break;
        case 'B':           pass = (m.grupo || '').toUpperCase() === 'B'; break;
      }
      if (!pass) return false;
      if (q) {
        const l = (m.equipoLocalNombre     || '').toLowerCase();
        const v = (m.equipoVisitanteNombre || '').toLowerCase();
        if (!l.includes(q) && !v.includes(q)) return false;
      }
      return true;
    });
  }, [partidos, filter, search]);

  // Orden: primero por fecha desc, los EN VIVO arriba siempre
  const ordered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aLive = a.enVivo === true && a.estatus !== 'finalizado';
      const bLive = b.enVivo === true && b.estatus !== 'finalizado';
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      return (b.fechaAsignada || '').localeCompare(a.fechaAsignada || '');
    });
  }, [filtered]);

  const grupos = useMemo(() => agruparPorFecha(ordered), [ordered]);

  const filters: { id: FilterType; label: string }[] = [
    { id: 'TODOS',       label: 'Todos' },
    { id: 'ENVIVO',      label: '🔴 En vivo' },
    { id: 'PENDIENTES',  label: 'Próximos' },
    { id: 'FINALIZADOS', label: 'Resultados' },
    { id: 'PLAYOFFS',    label: '🔥 Playoffs' },
    { id: 'A',           label: 'Grupo A' },
    { id: 'B',           label: 'Grupo B' },
  ];

  return (
    <div className="space-y-5">
      {/* Chips de filtro */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {filters.map(f => {
          const active = filter === f.id;
          const isLive = f.id === 'ENVIVO';
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors flex items-center gap-1.5 ' +
                (active
                  ? (isLive ? 'bg-red-500 text-white border border-red-500' : 'bg-liga-orange text-white border border-liga-orange')
                  : (isLive && liveCount > 0
                      ? 'bg-red-500/15 text-red-400 border border-red-500/40'
                      : 'bg-white/[0.04] text-[var(--color-text-dim)] border border-white/10 hover:bg-white/[0.08]'))
              }
            >
              {f.label}
              {isLive && liveCount > 0 && (
                <span className={
                  'rounded-full px-1.5 text-[10px] font-extrabold ' +
                  (active ? 'bg-white/25 text-white' : 'bg-red-500 text-white')
                }>
                  {liveCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Buscador */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] text-sm">🔍</span>
        <input
          type="text"
          placeholder={`Buscar equipo en ${categoriaLabel}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-9 pr-9 py-2 text-sm outline-none focus:border-liga-orange/60 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Limpiar"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>

      {/* Resultado vacío */}
      {ordered.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-white/10 bg-white/[0.02]">
          <p className="text-sm text-[var(--color-text-dim)]">
            No hay partidos {search ? `para "${search}"` : 'con esos filtros'}.
          </p>
        </div>
      )}

      {/* Grupos por fecha */}
      {[...grupos.entries()].map(([fecha, lista]) => (
        <section key={fecha}>
          <h3 className="text-[11px] uppercase tracking-widest text-[var(--color-text-dim)] font-bold mb-2.5">
            {fechaHeader(fecha)}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {lista.map(p => (
              <MatchCard
                key={p.id}
                partido={p}
                equipos={equiposMap}
                variant={p.estatus === 'finalizado' ? 'resultado' : 'proximo'}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
