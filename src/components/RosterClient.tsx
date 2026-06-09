'use client';

// Roster del equipo. Al click en un jugador abre el modal con la card Upper Deck.

import { useState } from 'react';
import { TeamLogo } from './TeamLogo';
import { PlayerCardModal } from './PlayerCardModal';
import type { Jugador } from '@/types';

export function RosterClient({
  jugadores,
  categoriaId,
  equipoNombre,
  equipoLogoUrl,
}: {
  jugadores: Jugador[];
  categoriaId: string;
  equipoNombre?: string;
  equipoLogoUrl?: string;
}) {
  const [selected, setSelected] = useState<Jugador | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {jugadores.map(j => (
          <button
            key={j.id}
            onClick={() => setSelected(j)}
            className="rounded-lg border border-[var(--color-border)] bg-white shadow-card hover:bg-[var(--color-bg)] hover:border-liga-coral/40 transition-colors px-3.5 py-2.5 flex items-center gap-3 text-left w-full"
          >
            <TeamLogo nombre={j.nombre} logoUrl={j.fotoUrl} size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold truncate text-[var(--color-text)]">
                <span className="text-liga-coral mr-1.5">#{j.numero}</span>
                {j.nombre}
              </p>
              {(j.puntos ?? 0) > 0 && (
                <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5 font-bold">
                  {j.puntos} pts · {j.partidosJugados ?? 0} PJ
                </p>
              )}
            </div>
            <span className="text-[10px] text-liga-coral font-extrabold uppercase tracking-wider whitespace-nowrap">
              Ver →
            </span>
          </button>
        ))}
      </div>

      <PlayerCardModal
        jugador={selected}
        categoriaId={categoriaId}
        equipoNombre={equipoNombre}
        equipoLogoUrl={equipoLogoUrl}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
