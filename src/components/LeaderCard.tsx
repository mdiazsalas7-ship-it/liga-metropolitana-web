import { TeamLogo } from './TeamLogo';
import type { Lider } from '@/lib/queries';

const STAT_LABELS: Record<string, { label: string; unit: string; bg: string; fg: string }> = {
  puntos:    { label: 'Goleador', unit: 'puntos por partido',   bg: 'bg-liga-coralSoft',          fg: 'text-liga-coral' },
  rebotes:   { label: 'Rebotes',  unit: 'rebotes por partido',  bg: 'bg-emerald-500/12',          fg: 'text-emerald-300' },
  robos:     { label: 'Robos',    unit: 'robos por partido',    bg: 'bg-blue-500/12',             fg: 'text-blue-300' },
  triples:   { label: 'Triples',  unit: 'triples por partido',  bg: 'bg-purple-500/12',           fg: 'text-purple-300' },
  bloqueos:  { label: 'Bloqueos', unit: 'bloqueos por partido', bg: 'bg-red-500/12',              fg: 'text-red-300' },
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
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-card card-hover p-5 flex flex-col items-center text-center">
      <span className={`inline-block ${cfg.bg} ${cfg.fg} text-[10px] font-extrabold tracking-[0.14em] uppercase px-2.5 py-1 rounded-full mb-3`}>
        {cfg.label}
      </span>

      <div className="relative mb-3">
        <TeamLogo nombre={j.nombre} logoUrl={j.fotoUrl} size={72} ring />
        {j.numero != null && (
          <span className="absolute -bottom-1 -right-1 bg-liga-dark text-white rounded-full w-7 h-7 flex items-center justify-center text-[10px] font-extrabold border-2 border-[var(--color-bg)]">
            {j.numero}
          </span>
        )}
      </div>

      <p className="text-sm font-extrabold text-[var(--color-text)] leading-tight">{j.nombre}</p>
      <p className="text-[11px] text-[var(--color-text-dim)] mt-0.5">{j.equipoNombre} · {categoria}</p>

      <p className={`cond text-5xl font-black mt-3 tabular-nums ${cfg.fg} leading-none`}>
        {lider.promedio.toFixed(1)}
      </p>
      <p className="text-[10px] text-[var(--color-text-dim2)] mt-1 uppercase tracking-wider font-bold">
        {cfg.unit}
      </p>
    </div>
  );
}
