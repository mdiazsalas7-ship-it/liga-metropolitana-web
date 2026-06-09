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
  const ml = partido.marcadorLocal ?? 0;
  const mv = partido.marcadorVisitante ?? 0;
  const localGana = ml > mv;

  return (
    <Link
      href={`/partido/${partido.id}?categoria=${cat}`}
      className="block rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors p-3.5"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)] font-bold">
          {isRes
            ? <><span className="text-emerald-500">●</span> Finalizado · {CAT_LABELS[cat] ?? cat}</>
            : <>{fechaRelativa(partido.fechaAsignada)} · {CAT_LABELS[cat] ?? cat}</>
          }
        </span>
        {!isRes && partido.hora && (
          <span className="text-[10px] text-[var(--color-text-dim2)] font-bold">{partido.hora}</span>
        )}
        {isRes && (
          <span className="text-[10px] text-[var(--color-text-dim2)]">{fechaCorta(partido.fechaAsignada)}</span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <TeamLogo nombre={partido.equipoLocalNombre} logoUrl={logoLocal} size={28} />
          <span className={
            'text-sm font-semibold truncate ' +
            (isRes && !localGana ? 'text-[var(--color-text-dim)]' : 'text-white')
          }>
            {partido.equipoLocalNombre}
          </span>
        </div>

        {isRes ? (
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className={'text-lg font-extrabold ' + (localGana ? 'text-white' : 'text-[var(--color-text-dim)]')}>{ml}</span>
            <span className="text-xs text-[var(--color-text-dim2)]">·</span>
            <span className={'text-lg font-extrabold ' + (!localGana ? 'text-white' : 'text-[var(--color-text-dim)]')}>{mv}</span>
          </div>
        ) : (
          <span className="text-xs text-[var(--color-text-dim2)] font-bold">vs</span>
        )}

        <div className="flex items-center gap-2 min-w-0 justify-end">
          <span className={
            'text-sm font-semibold truncate text-right ' +
            (isRes && localGana ? 'text-[var(--color-text-dim)]' : 'text-white')
          }>
            {partido.equipoVisitanteNombre}
          </span>
          <TeamLogo nombre={partido.equipoVisitanteNombre} logoUrl={logoVisit} size={28} />
        </div>
      </div>
    </Link>
  );
}
