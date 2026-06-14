import Link from 'next/link';
import { TeamLogo } from './TeamLogo';
import { fechaCorta, fechaRelativa } from '@/lib/fechas';
import type { Partido, Equipo } from '@/types';

const CAT_LABELS: Record<string, string> = {
  INTERINDUSTRIAL: 'Interindustrial',
  U16_FEMENINO:    'U16 Femenino',
  U16M:            'U16M',
  MASTER40:        'Master 40',
  LIBRE:           'Libre',
};

export function MatchCard({
  partido,
  equipos,
  variant = 'proximo',
}: {
  partido: Partido;
  equipos?: Map<string, Equipo>;
  variant?: 'proximo' | 'resultado';
}) {
  const cat = partido.categoria || '';
  const logoLocal = equipos?.get(partido.equipoLocalId || '')?.logoUrl;
  const logoVisit = equipos?.get(partido.equipoVisitanteId || '')?.logoUrl;

  const isRes = variant === 'resultado';
  const ml = partido.marcadorLocal     ?? 0;
  const mv = partido.marcadorVisitante ?? 0;
  const localGana = ml > mv;
  const empate    = ml === mv && isRes;

  return (
    <Link
      href={`/partido/${partido.id}?categoria=${cat}`}
      className="block bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-card card-hover overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]">
        {isRes ? (
          <span className="text-[10px] font-extrabold tracking-[0.13em] text-liga-final uppercase">
            ● Final
          </span>
        ) : (
          <span className="text-[10px] font-extrabold tracking-[0.1em] text-liga-coral uppercase">
            {fechaRelativa(partido.fechaAsignada)}
            {partido.hora ? ` · ${partido.hora}` : ''}
          </span>
        )}
        <span className="text-[10px] text-[var(--color-text-dim2)] uppercase tracking-wider font-bold">
          {CAT_LABELS[cat] ?? cat}
          {isRes ? ` · ${fechaCorta(partido.fechaAsignada)}` : ''}
        </span>
      </div>

      {/* Equipos */}
      <div className="px-4 py-3 space-y-2.5">
        {/* Local */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamLogo nombre={partido.equipoLocalNombre} logoUrl={logoLocal} size={32} />
            <span className={
              'text-sm font-bold truncate ' +
              (isRes && !localGana && !empate ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text)]')
            }>
              {partido.equipoLocalNombre}
            </span>
          </div>
          {isRes && (
            <span className={
              'cond text-2xl font-extrabold tabular-nums ' +
              (localGana ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim2)]')
            }>
              {ml}
            </span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamLogo nombre={partido.equipoVisitanteNombre} logoUrl={logoVisit} size={32} />
            <span className={
              'text-sm font-bold truncate ' +
              (isRes && localGana && !empate ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text)]')
            }>
              {partido.equipoVisitanteNombre}
            </span>
          </div>
          {isRes && (
            <span className={
              'cond text-2xl font-extrabold tabular-nums ' +
              (!localGana ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim2)]')
            }>
              {mv}
            </span>
          )}
        </div>

        {/* En próximos: vs */}
        {!isRes && (
          <div className="text-center pt-1">
            <span className="text-[10px] text-[var(--color-text-dim2)] font-bold uppercase tracking-[0.13em]">vs</span>
          </div>
        )}
      </div>
    </Link>
  );
}
