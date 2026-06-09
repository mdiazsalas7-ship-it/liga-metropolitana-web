'use client';

// Vista del partido: marcador + box score por cuartos + play-by-play.
// Suscripción con onSnapshot para que el marcador y las jugadas se actualicen
// en tiempo real cuando el partido está EN VIVO.

import { useEffect, useMemo, useState } from 'react';
import { onSnapshot, doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { colName, type CategoriaId } from '@/lib/categorias';
import { TeamLogo } from './TeamLogo';
import type { Partido, Equipo } from '@/types';
import type { StatPartido, JugadaPartido } from '@/lib/queries';

const ACCIONES: Record<string, { label: string; icon: string; color: string }> = {
  tirosLibres: { label: 'Tiro Libre',  icon: '🎯', color: '#475569' },
  dobles:      { label: 'Doble',       icon: '🏀', color: '#1e40af' },
  triples:     { label: 'Triple',      icon: '🔥', color: '#7c3aed' },
  rebotes:     { label: 'Rebote',      icon: '🖐️', color: '#047857' },
  robos:       { label: 'Robo',        icon: '🛡️', color: '#b45309' },
  bloqueos:    { label: 'Bloqueo',     icon: '🚫', color: '#991b1b' },
  sustitucion: { label: 'Cambio',      icon: '🔄', color: '#8b5cf6' },
};

const CAT_LABELS: Record<string, string> = {
  INTERINDUSTRIAL: 'Interindustrial',
  U16_FEMENINO:    'U16 Femenino',
  U16M:            'U16M',
  MASTER40:        'Master 40',
  LIBRE:           'Libre',
};

function currentQuarter(p: Partido): string {
  const orden = ['Q4', 'Q3', 'Q2', 'Q1'];
  for (const k of orden) {
    if ((p.cuartosLocal?.[k] ?? 0) > 0 || (p.cuartosVisitante?.[k] ?? 0) > 0) return k;
  }
  return 'Q1';
}

interface BoxRow {
  jugadorId: string;
  nombre: string;
  numero: string | number;
  pts: number; reb: number; rob: number; blo: number;
  triples: number; dobles: number; tl: number;
}

function buildBoxScore(stats: StatPartido[], equipo: 'local' | 'visitante'): BoxRow[] {
  return stats
    .filter(s => s.equipo === equipo)
    .map(s => ({
      jugadorId: s.jugadorId,
      nombre:    s.nombre || '',
      numero:    s.numero ?? '',
      pts:       s.tirosLibres + s.dobles * 2 + s.triples * 3,
      reb:       s.rebotes,
      rob:       s.robos,
      blo:       s.bloqueos,
      triples:   s.triples,
      dobles:    s.dobles,
      tl:        s.tirosLibres,
    }))
    .sort((a, b) => b.pts - a.pts);
}

function totalsOf(rows: BoxRow[]) {
  return rows.reduce(
    (acc, r) => ({
      pts: acc.pts + r.pts, reb: acc.reb + r.reb, rob: acc.rob + r.rob, blo: acc.blo + r.blo,
      triples: acc.triples + r.triples, dobles: acc.dobles + r.dobles, tl: acc.tl + r.tl,
    }),
    { pts: 0, reb: 0, rob: 0, blo: 0, triples: 0, dobles: 0, tl: 0 }
  );
}

export function PartidoView({
  partidoInicial,
  categoria,
  equipos,
  statsInicial,
  jugadasInicial,
}: {
  partidoInicial: Partido;
  categoria: CategoriaId;
  equipos: Map<string, Equipo>;
  statsInicial: StatPartido[];
  jugadasInicial: JugadaPartido[];
}) {
  const [partido, setPartido] = useState<Partido>(partidoInicial);
  const [jugadas, setJugadas] = useState<JugadaPartido[]>(jugadasInicial);
  const [stats]   = useState<StatPartido[]>(statsInicial);

  const [pbpOpen, setPbpOpen]                   = useState(false);
  const [collapsedTeams, setCollapsedTeams]     = useState<Record<string, boolean>>({});
  const [pulse, setPulse]                       = useState(false);

  const isLive  = partido.enVivo === true && partido.estatus !== 'finalizado';
  const isFinal = partido.estatus === 'finalizado';

  // Suscripción al partido (marcador y estado)
  useEffect(() => {
    const ref = doc(getDb(), colName('calendario', categoria), partidoInicial.id);
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() } as Partido;
      setPartido(prev => {
        if (prev.marcadorLocal !== data.marcadorLocal || prev.marcadorVisitante !== data.marcadorVisitante) {
          setPulse(true);
          setTimeout(() => setPulse(false), 500);
        }
        return data;
      });
    });
    return () => unsub();
  }, [partidoInicial.id, categoria]);

  // Suscripción al play-by-play SOLO si está en vivo
  useEffect(() => {
    if (!isLive) return;
    const q = query(
      collection(getDb(), 'jugadas_partido'),
      where('partidoId', '==', partidoInicial.id),
      orderBy('timestamp', 'desc'),
      limit(300)
    );
    const unsub = onSnapshot(q, snap => {
      setJugadas(snap.docs.map(d => ({ id: d.id, ...d.data() } as JugadaPartido)));
    });
    return () => unsub();
  }, [partidoInicial.id, isLive]);

  const boxLocal    = useMemo(() => buildBoxScore(stats, 'local'),     [stats]);
  const boxVisita   = useMemo(() => buildBoxScore(stats, 'visitante'), [stats]);
  const totalsLocal = useMemo(() => totalsOf(boxLocal),   [boxLocal]);
  const totalsVisit = useMemo(() => totalsOf(boxVisita),  [boxVisita]);

  // Top performers globales (los 3 mejores por puntos, mostrar a 4)
  const topPerformers = useMemo(() => {
    const all = [...boxLocal, ...boxVisita].sort((a, b) => b.pts - a.pts).slice(0, 3);
    const topReb = [...boxLocal, ...boxVisita].sort((a, b) => b.reb - a.reb)[0];
    return { puntos: all, rebotes: topReb };
  }, [boxLocal, boxVisita]);

  const lastJugada = jugadas[0];

  const ml = partido.marcadorLocal     ?? 0;
  const mv = partido.marcadorVisitante ?? 0;
  const cuarto = currentQuarter(partido);
  const local  = partido.equipoLocalNombre     ?? 'Local';
  const visit  = partido.equipoVisitanteNombre ?? 'Visitante';
  const logoLocal = equipos.get(partido.equipoLocalId     || '')?.logoUrl;
  const logoVisit = equipos.get(partido.equipoVisitanteId || '')?.logoUrl;

  return (
    <div className="space-y-6">
      {/* MARCADOR */}
      <div className={
        'rounded-2xl p-5 sm:p-6 border-2 transition-colors ' +
        (isLive ? 'border-red-500/60 bg-red-500/5' : isFinal ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]')
      }>
        <div className="flex items-center justify-between mb-4">
          {isLive ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 pulse-live" />
              <span className="text-xs font-bold text-red-500 tracking-widest uppercase">En vivo · {cuarto}</span>
            </div>
          ) : isFinal ? (
            <span className="text-xs font-bold text-emerald-500 tracking-widest uppercase">🏁 Final</span>
          ) : (
            <span className="text-xs font-bold text-[var(--color-text-dim)] tracking-widest uppercase">Programado</span>
          )}
          <span className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-wider">
            {CAT_LABELS[categoria] ?? categoria} {partido.grupo ? `· Grupo ${partido.grupo}` : ''} {partido.fase && partido.fase !== 'REGULAR' ? `· ${partido.fase}` : ''}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <TeamLogo nombre={local} logoUrl={logoLocal} size={56} />
            <div className="min-w-0">
              <p className="font-bold text-sm sm:text-lg leading-tight truncate">{local}</p>
              <p className="text-[11px] text-[var(--color-text-dim)] mt-0.5">Local</p>
            </div>
          </div>
          <div className={'flex items-baseline gap-3 sm:gap-5 transition-transform ' + (pulse ? 'scale-110' : '')}>
            <span className="text-4xl sm:text-6xl font-extrabold tabular-nums">{ml}</span>
            <span className="text-lg sm:text-2xl text-[var(--color-text-dim)]">·</span>
            <span className="text-4xl sm:text-6xl font-extrabold tabular-nums">{mv}</span>
          </div>
          <div className="flex items-center gap-3 min-w-0 justify-end">
            <div className="min-w-0 text-right">
              <p className="font-bold text-sm sm:text-lg leading-tight truncate">{visit}</p>
              <p className="text-[11px] text-[var(--color-text-dim)] mt-0.5">Visitante</p>
            </div>
            <TeamLogo nombre={visit} logoUrl={logoVisit} size={56} />
          </div>
        </div>

        {/* Mini box score por cuartos */}
        {partido.cuartosLocal && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[var(--color-text-dim2)]">
                  <th className="text-left py-1.5 font-semibold">&nbsp;</th>
                  <th className="py-1.5 px-2 font-semibold">Q1</th>
                  <th className="py-1.5 px-2 font-semibold">Q2</th>
                  <th className="py-1.5 px-2 font-semibold">Q3</th>
                  <th className="py-1.5 px-2 font-semibold">Q4</th>
                  <th className="py-1.5 px-2 font-bold text-liga-gold">TOT</th>
                </tr>
              </thead>
              <tbody>
                {['local', 'visitante'].map(team => {
                  const cuartos = team === 'local' ? partido.cuartosLocal : partido.cuartosVisitante;
                  const nombre  = team === 'local' ? local : visit;
                  const total   = team === 'local' ? ml : mv;
                  return (
                    <tr key={team} className="border-t border-white/10">
                      <td className="py-1.5 font-semibold truncate max-w-[160px]">{nombre}</td>
                      {['Q1','Q2','Q3','Q4'].map(q => (
                        <td key={q} className={'py-1.5 px-2 text-center tabular-nums ' + (q === cuarto && isLive ? 'text-red-400 font-bold' : '')}>
                          {cuartos?.[q] ?? 0}
                        </td>
                      ))}
                      <td className="py-1.5 px-2 text-center tabular-nums font-bold text-liga-gold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ÚLTIMA JUGADA (si hay) */}
      {lastJugada && (
        <div className={
          'rounded-xl p-3.5 border ' +
          `border-[${ACCIONES[lastJugada.accion]?.color ?? '#334155'}55]`
        }
        style={{
          background: `${ACCIONES[lastJugada.accion]?.color ?? '#334155'}15`,
          borderColor: `${ACCIONES[lastJugada.accion]?.color ?? '#334155'}55`,
        }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{ACCIONES[lastJugada.accion]?.icon ?? '🏀'}</span>
            <div className="flex-1 min-w-0">
              {lastJugada.accion === 'sustitucion' ? (
                <>
                  <p className="text-[10px] font-extrabold tracking-wider text-purple-400">CAMBIO</p>
                  <p className="text-xs">
                    <span className="text-red-400">↓ #{lastJugada.jugadorSaleNumero} {lastJugada.jugadorSaleNombre}</span>
                    <span className="mx-2 text-[var(--color-text-dim2)]">·</span>
                    <span className="text-emerald-400">↑ #{lastJugada.jugadorNumero} {lastJugada.jugadorNombre}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold">#{lastJugada.jugadorNumero} {lastJugada.jugadorNombre}</p>
                  <p className="text-[11px] text-[var(--color-text-dim)]">
                    {ACCIONES[lastJugada.accion]?.label ?? lastJugada.accion}
                    {lastJugada.puntos > 0 && <span className="text-emerald-400 font-bold ml-1">+{lastJugada.puntos}</span>}
                    {lastJugada.cuarto && <span className="ml-2 text-[var(--color-text-dim2)]">· {lastJugada.cuarto}</span>}
                  </p>
                </>
              )}
            </div>
            <span className={
              'text-[10px] font-bold px-2.5 py-1 rounded-full ' +
              (lastJugada.equipo === 'local' ? 'bg-blue-900/60 text-blue-200' : 'bg-red-900/60 text-red-200')
            }>
              {lastJugada.equipo === 'local' ? local : visit}
            </span>
          </div>
        </div>
      )}

      {/* PLAY-BY-PLAY (colapsable) */}
      {jugadas.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <button
            onClick={() => setPbpOpen(v => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02]"
          >
            <span className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase flex items-center gap-2">
              <span className={'inline-block transition-transform ' + (pbpOpen ? 'rotate-0' : '-rotate-90')}>▼</span>
              📋 Play by Play
            </span>
            <span className="text-xs text-[var(--color-text-dim2)]">
              {jugadas.length} {jugadas.length === 1 ? 'jugada' : 'jugadas'}
            </span>
          </button>
          {pbpOpen && (
            <div className="max-h-96 overflow-y-auto border-t border-white/10">
              {jugadas.map((j, idx) => {
                const acc = ACCIONES[j.accion];
                const esSub = j.accion === 'sustitucion';
                return (
                  <div key={j.id} className={
                    'flex items-center gap-3 px-4 py-2.5 border-t border-white/5 ' +
                    (idx === 0 ? 'bg-blue-500/5' : '') +
                    (j.equipo === 'visitante' ? ' flex-row-reverse text-right' : '')
                  }>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${acc?.color ?? '#334155'}33` }}>
                      <span className="text-base">{acc?.icon ?? '🏀'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {esSub ? (
                        <>
                          <p className="text-[10px] font-extrabold text-purple-400">CAMBIO</p>
                          <p className="text-[11px] leading-tight">
                            <span className="text-red-400">↓ #{j.jugadorSaleNumero} {j.jugadorSaleNombre}</span>
                            <br />
                            <span className="text-emerald-400">↑ #{j.jugadorNumero} {j.jugadorNombre}</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-bold truncate">#{j.jugadorNumero} {j.jugadorNombre}</p>
                          <p className="text-[10px] text-[var(--color-text-dim)]">
                            {acc?.label ?? j.accion}
                            {j.puntos > 0 && <span className="text-emerald-400 font-bold ml-1">+{j.puntos}</span>}
                          </p>
                        </>
                      )}
                    </div>
                    {j.cuarto && (
                      <span className="text-[9px] font-bold text-[var(--color-text-dim2)] flex-shrink-0">{j.cuarto}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TOP PERFORMERS */}
      {topPerformers.puntos.length > 0 && (
        <section>
          <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
            Mejores del partido
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topPerformers.puntos.map(p => (
              <div key={p.jugadorId} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <p className="text-[10px] font-bold tracking-wider text-liga-gold uppercase">⭐ {p.pts} puntos</p>
                <p className="text-sm font-bold mt-1 truncate">#{p.numero} {p.nombre}</p>
                <p className="text-[10px] text-[var(--color-text-dim)] mt-2">
                  {p.reb}R · {p.rob}S · {p.triples} 3PT
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BOX SCORE (colapsable por equipo) */}
      {(boxLocal.length > 0 || boxVisita.length > 0) && (
        <section>
          <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
            📊 Box Score
          </h2>
          <div className="space-y-2">
            {[
              { team: local, rows: boxLocal,  totals: totalsLocal, color: '#3b82f6', borderColor: 'rgba(59,130,246,0.4)' },
              { team: visit, rows: boxVisita, totals: totalsVisit, color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' },
            ].map(t => {
              const collapsed = !!collapsedTeams[t.team];
              return (
                <div key={t.team} className="rounded-xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setCollapsedTeams(prev => ({ ...prev, [t.team]: !prev[t.team] }))}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
                    style={{ background: `${t.color}1a` }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={'inline-block text-[10px] font-bold transition-transform ' + (collapsed ? '-rotate-90' : 'rotate-0')} style={{ color: t.color }}>▼</span>
                      <span className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: t.color }}>{t.team}</span>
                    </div>
                    {t.rows.length > 0 && (
                      <div className="flex items-baseline gap-2 flex-shrink-0">
                        <span className="text-lg font-extrabold text-liga-gold tabular-nums">{t.totals.pts}</span>
                        <span className="text-[10px] font-bold text-[var(--color-text-dim)] uppercase">PTS</span>
                        <span className="text-xs text-[var(--color-text-dim)] ml-2">
                          {t.totals.reb}R · {t.totals.rob}S · {t.totals.blo}B
                        </span>
                      </div>
                    )}
                  </button>

                  {!collapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-black/30 text-[var(--color-text-dim2)] font-bold">
                          <tr>
                            <th className="text-left py-2 px-3">Jugador</th>
                            <th className="py-2 px-2 text-liga-gold">PTS</th>
                            <th className="py-2 px-2 text-emerald-500">REB</th>
                            <th className="py-2 px-2 text-purple-400">ROB</th>
                            <th className="py-2 px-2 text-red-400">BLO</th>
                            <th className="py-2 px-2 text-purple-500">3P</th>
                            <th className="py-2 px-2 text-blue-400">2P</th>
                            <th className="py-2 px-2 text-[var(--color-text-dim2)]">TL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.rows.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-4 text-[var(--color-text-dim2)] text-xs">Sin jugadas aún</td></tr>
                          ) : t.rows.map(r => (
                            <tr key={r.jugadorId} className="border-t border-white/5">
                              <td className="py-2 px-3 font-semibold truncate max-w-[140px]">
                                <span style={{ color: t.color }} className="mr-1">#{r.numero}</span>
                                {r.nombre}
                              </td>
                              <td className="py-2 px-2 text-center font-bold text-liga-gold tabular-nums">{r.pts}</td>
                              <td className="py-2 px-2 text-center tabular-nums">{r.reb}</td>
                              <td className="py-2 px-2 text-center tabular-nums">{r.rob}</td>
                              <td className="py-2 px-2 text-center tabular-nums">{r.blo}</td>
                              <td className="py-2 px-2 text-center tabular-nums">{r.triples}</td>
                              <td className="py-2 px-2 text-center tabular-nums">{r.dobles}</td>
                              <td className="py-2 px-2 text-center tabular-nums">{r.tl}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
