'use client';

// Strip horizontal de partidos arriba de la home.
// - Selector de categorías arriba (tabs)
// - Mezcla EN VIVO + próximos + resultados recientes
// - Scroll horizontal con flechas de navegación (desktop) + swipe (móvil)

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { colName, type CategoriaId } from '@/lib/categorias';
import { TeamLogo } from './TeamLogo';
import type { Partido, Equipo } from '@/types';

const CAT_LABELS: Record<string, string> = {
  INTERINDUSTRIAL: 'INTER',
  U16_FEMENINO:    'U16F',
  U16M:            'U16M',
  MASTER40:        'M40',
  LIBRE:           'LIBRE',
};

const CAT_FULL: Record<string, string> = {
  INTERINDUSTRIAL: 'Interindustrial',
  U16_FEMENINO:    'U16 Femenino',
  U16M:            'U16M',
  MASTER40:        'Master 40',
  LIBRE:           'Libre',
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
  partidos: partidosIniciales,
  equipos,
}: {
  partidos: Partido[];
  equipos: Map<string, Equipo>;
}) {
  const [activeCat, setActiveCat] = useState<string>('TODAS');
  const [partidos, setPartidos]   = useState<Partido[]>(partidosIniciales);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPartidos(partidosIniciales);
  }, [partidosIniciales]);

  // Suscripción en tiempo real a cada partido EN VIVO de la franja.
  useEffect(() => {
    const livePartidos = partidosIniciales.filter(
      p => p.enVivo === true && p.estatus !== 'finalizado' && p.categoria
    );
    if (livePartidos.length === 0) return;

    const unsubs = livePartidos.map(p => {
      const ref = doc(getDb(), colName('calendario', p.categoria as CategoriaId), p.id);
      return onSnapshot(ref, snap => {
        if (!snap.exists()) return;
        const data = snap.data() as any;
        setPartidos(prev =>
          prev.map(x => x.id === p.id ? {
            ...x,
            ...data,
            id: p.id,
            categoria: p.categoria,
          } : x)
        );
      });
    });

    return () => unsubs.forEach(u => u());
  }, [partidosIniciales]);

  const cats = useMemo(() => {
    const set = new Set<string>();
    partidos.forEach(p => p.categoria && set.add(p.categoria));
    return Array.from(set);
  }, [partidos]);

  const filtered = useMemo(() => {
    if (activeCat === 'TODAS') return partidos;
    return partidos.filter(p => p.categoria === activeCat);
  }, [partidos, activeCat]);

  const ordered = useMemo(() => {
    const live = filtered.filter(p => p.enVivo === true && p.estatus !== 'finalizado');
    const next = filtered
      .filter(p => p.estatus !== 'finalizado' && !(p.enVivo === true))
      .sort((a, b) => {
        const fa = typeof a.fechaAsignada === 'string' ? a.fechaAsignada : '';
        const fb = typeof b.fechaAsignada === 'string' ? b.fechaAsignada : '';
        return fa.localeCompare(fb);
      });
    const done = filtered
      .filter(p => p.estatus === 'finalizado')
      .sort((a, b) => {
        const fa = typeof a.fechaAsignada === 'string' ? a.fechaAsignada : '';
        const fb = typeof b.fechaAsignada === 'string' ? b.fechaAsignada : '';
        return fb.localeCompare(fa);
      });
    return [...live, ...next, ...done];
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    partidos.forEach(p => {
      if (p.categoria) c[p.categoria] = (c[p.categoria] ?? 0) + 1;
    });
    return c;
  }, [partidos]);

  const liveCount = useMemo(
    () => partidos.filter(p => p.enVivo === true && p.estatus !== 'finalizado').length,
    [partidos]
  );

  const scrollBy = (dir: -1 | 1) => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: dir * Math.max(w * 0.7, 300), behavior: 'smooth' });
  };

  if (partidos.length === 0) return null;

  return (
    <div className="bg-gradient-to-b from-[var(--color-bg-alt)] to-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl">

        {/* Selector de categorías */}
        <div className="px-4 pt-2 flex gap-1.5 overflow-x-auto no-scrollbar items-center">
          <button
            onClick={() => setActiveCat('TODAS')}
            className={
              'whitespace-nowrap rounded-md px-3 py-1.5 text-[10px] font-extrabold tracking-[0.13em] uppercase transition-colors flex items-center gap-1.5 ' +
              (activeCat === 'TODAS'
                ? 'bg-liga-coral text-white'
                : 'text-[var(--color-text-dim)] hover:text-white hover:bg-white/10')
            }
          >
            Todas
            {liveCount > 0 && (
              <span className={
                'rounded-full px-1.5 text-[9px] font-extrabold ' +
                (activeCat === 'TODAS' ? 'bg-white text-liga-coral' : 'bg-liga-live text-white')
              }>
                {liveCount} LIVE
              </span>
            )}
          </button>
          {cats.map(cat => {
            const active = activeCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-[10px] font-extrabold tracking-[0.13em] uppercase transition-colors ' +
                  (active
                    ? 'bg-liga-coral text-white'
                    : 'text-[var(--color-text-dim)] hover:text-white hover:bg-white/10')
                }
              >
                {CAT_FULL[cat] ?? cat}
                <span className={
                  'ml-1.5 text-[9px] ' +
                  (active ? 'text-white/70' : 'text-[var(--color-text-dim2)]')
                }>
                  {counts[cat] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Strip con flechas de scroll */}
        <div className="relative">
          <button
            onClick={() => scrollBy(-1)}
            className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[var(--color-card-2)] hover:bg-liga-coral border border-[var(--color-border-strong)] hover:border-liga-coral items-center justify-center text-white shadow-lg transition-colors"
            aria-label="Partidos anteriores"
          >
            ‹
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[var(--color-card-2)] hover:bg-liga-coral border border-[var(--color-border-strong)] hover:border-liga-coral items-center justify-center text-white shadow-lg transition-colors"
            aria-label="Partidos siguientes"
          >
            ›
          </button>

          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-12 py-2.5"
          >
            {ordered.length === 0 ? (
              <div className="flex-1 text-center py-3 text-xs text-[var(--color-text-dim2)] font-bold">
                Sin partidos en {CAT_FULL[activeCat] ?? activeCat}
              </div>
            ) : ordered.map(p => {
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
                    'flex-shrink-0 w-[205px] rounded-xl border transition-all px-3 py-2.5 hover:-translate-y-0.5 ' +
                    (isLive
                      ? 'bg-liga-liveSoft border-liga-live/50 hover:border-liga-live'
                      : 'bg-[var(--color-card)] border-[var(--color-border)] hover:bg-[var(--color-card-2)] hover:border-[var(--color-border-strong)]')
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    {isLive ? (
                      <span className="text-[9px] font-extrabold text-liga-live tracking-[0.14em] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-liga-live pulse-live" /> LIVE
                      </span>
                    ) : isFinal ? (
                      <span className="text-[9px] font-extrabold text-[var(--color-text-dim2)] tracking-[0.14em]">
                        FINAL
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold text-[var(--color-text-dim)] tracking-[0.14em]">
                        {diaCorto(p.fechaAsignada)}{p.hora ? ` · ${p.hora}` : ''}
                      </span>
                    )}
                    <span className="text-[9px] font-bold text-[var(--color-text-dim2)] tracking-[0.06em]">
                      {CAT_LABELS[cat] ?? cat}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TeamLogo nombre={p.equipoLocalNombre} logoUrl={logoL} size={20} />
                      <span className={
                        'text-[11px] font-bold truncate ' +
                        (isFinal && !localGana ? 'text-[var(--color-text-dim2)]' : 'text-white')
                      }>
                        {p.equipoLocalNombre}
                      </span>
                    </div>
                    {(isLive || isFinal) && (
                      <span className={
                        'cond text-base font-extrabold tabular-nums ' +
                        (isFinal && !localGana ? 'text-[var(--color-text-dim2)]' : 'text-white')
                      }>
                        {ml}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TeamLogo nombre={p.equipoVisitanteNombre} logoUrl={logoV} size={20} />
                      <span className={
                        'text-[11px] font-bold truncate ' +
                        (isFinal && localGana ? 'text-[var(--color-text-dim2)]' : 'text-white')
                      }>
                        {p.equipoVisitanteNombre}
                      </span>
                    </div>
                    {(isLive || isFinal) && (
                      <span className={
                        'cond text-base font-extrabold tabular-nums ' +
                        (isFinal && localGana ? 'text-[var(--color-text-dim2)]' : 'text-white')
                      }>
                        {mv}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}

            {ordered.length > 0 && (
              <Link
                href={activeCat === 'TODAS' ? '/calendario' : `/calendario/${activeCat}`}
                className="flex-shrink-0 flex items-center justify-center px-4 text-[10px] font-extrabold text-[var(--color-text-dim)] hover:text-white tracking-[0.1em] uppercase whitespace-nowrap rounded-md hover:bg-white/5"
              >
                Ver todos →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
