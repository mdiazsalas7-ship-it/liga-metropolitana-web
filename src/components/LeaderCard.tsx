import { TeamLogo } from './TeamLogo';
import type { Lider } from '@/lib/queries';

const STAT_LABELS: Record<string, { label: string; unit: string; color: string }> = {
  puntos:       { label: 'Goleador',    unit: 'PPP',  color: 'text-liga-gold' },
  rebotes:      { label: 'Rebotes',     unit: 'RPP',  color: 'text-emerald-500' },
  robos:        { label: 'Robos',       unit: 'por partido', color: 'text-blue-400' },
  triples:      { label: 'Triples',     unit: 'por partido', color: 'text-purple-400' },
  bloqueos:     { label: 'Bloqueos',    unit: 'por partido', color: 'text-red-400' },
};

export function LeaderCard({
  stat,
  lider,
  categoria,
}: {
  stat: keyof typeof STAT_LABELS;
  lider: Lider;
  categoria: string;
}) {
  const cfg = STAT_LABELS[stat];
  const j = lider.jugador;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-3 mb-3">
        <TeamLogo nombre={j.nombre} logoUrl={j.fotoUrl} size={44} />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)] font-bold">
            {cfg.label}
          </p>
          <p className="text-sm font-bold truncate">{j.nombre}</p>
          <p className="text-[10px] text-[var(--color-text-dim2)] truncate">{j.equipoNombre} · {categoria}</p>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={'text-2xl font-extrabold tabular-nums ' + cfg.color}>
          {lider.promedio.toFixed(1)}
        </span>
        <span className="text-[10px] text-[var(--color-text-dim2)] font-bold uppercase tracking-wider">
          {cfg.unit}
        </span>
      </div>
    </div>
  );
}
