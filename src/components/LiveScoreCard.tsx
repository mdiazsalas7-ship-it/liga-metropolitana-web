'use client';

// Card del partido en vivo en la home.
// Cliente puro: usa onSnapshot para que el marcador se actualice en tiempo real
// sin recargar la página.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onSnapshot, doc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { colName, type CategoriaId } from '@/lib/categorias';
import type { Partido } from '@/types';

const CAT_LABELS: Record<string, string> = {
  INTERINDUSTRIAL: 'Interindustrial',
  U16_FEMENINO:    'U16 Femenino',
  U16M:            'U16M',
  MASTER40:        'Master 40',
  LIBRE:           'Libre',
};

function getCurrentQuarter(p: Partido | null): string {
  if (!p?.cuartosLocal) return '';
  const q = ['Q4', 'Q3', 'Q2', 'Q1'];
  for (const k of q) {
    if ((p.cuartosLocal?.[k] ?? 0) > 0 || (p.cuartosVisitante?.[k] ?? 0) > 0) return k;
  }
  return 'Q1';
}

export function LiveScoreCard({
  partidoIdInicial,
  categoriaInicial,
  partidoInicial,
}: {
  partidoIdInicial: string;
  categoriaInicial: CategoriaId;
  partidoInicial: Partido;
}) {
  const [partido, setPartido] = useState<Partido>(partidoInicial);
  const [pegado, setPegado]   = useState(false);

  useEffect(() => {
    const ref = doc(getDb(), colName('calendario', categoriaInicial), partidoIdInicial);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Partido;
        setPartido(prev => {
          // Pulso al marcador cuando cambia
          if (prev.marcadorLocal !== data.marcadorLocal || prev.marcadorVisitante !== data.marcadorVisitante) {
            setPegado(true);
            setTimeout(() => setPegado(false), 600);
          }
          return data;
        });
      }
    });
    return () => unsub();
  }, [partidoIdInicial, categoriaInicial]);

  if (!partido.enVivo) return null;

  const cuarto = getCurrentQuarter(partido);
  const local  = partido.equipoLocalNombre     ?? 'Local';
  const visit  = partido.equipoVisitanteNombre ?? 'Visitante';
  const ml     = partido.marcadorLocal     ?? 0;
  const mv     = partido.marcadorVisitante ?? 0;

  return (
    <Link
      href={`/partido/${partidoIdInicial}?categoria=${categoriaInicial}`}
      className="block rounded-2xl border-2 border-red-500/60 bg-red-500/5 hover:bg-red-500/10 transition-colors p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 pulse-live" />
          <span className="text-xs font-bold text-red-500 tracking-widest uppercase">En vivo ahora</span>
        </div>
        <span className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-wider">
          {CAT_LABELS[categoriaInicial] ?? categoriaInicial} {partido.grupo ? `· Grupo ${partido.grupo}` : ''}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        <div className="text-right sm:text-left">
          <p className="font-bold text-sm sm:text-base leading-tight">{local}</p>
          <p className="text-[11px] text-[var(--color-text-dim)] mt-1">Local</p>
        </div>
        <div className={'flex items-baseline gap-3 sm:gap-4 transition-transform ' + (pegado ? 'scale-110' : '')}>
          <span className="text-4xl sm:text-5xl font-extrabold tabular-nums">{ml}</span>
          <span className="text-lg text-[var(--color-text-dim)]">·</span>
          <span className="text-4xl sm:text-5xl font-extrabold tabular-nums">{mv}</span>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-bold text-sm sm:text-base leading-tight">{visit}</p>
          <p className="text-[11px] text-[var(--color-text-dim)] mt-1">Visitante</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-red-500/15 text-red-400 px-3 py-1 text-[11px] font-bold tracking-wider">
          {cuarto || 'Q1'} EN CURSO
        </span>
        <span className="text-xs text-liga-orange font-bold">
          Ver partido →
        </span>
      </div>
    </Link>
  );
}
