'use client';

// Vista del partido. El filtrado de stats por equipo usa el NOMBRE o ID del equipo
// (no 'local'/'visitante') porque así viene en Firestore.

import { useEffect, useMemo, useState } from 'react';
import { onSnapshot, doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { colName, type CategoriaId } from '@/lib/categorias';
import { TeamLogo } from './TeamLogo';
import type { Partido, Equipo } from '@/types';
import type { StatPartido, JugadaPartido } from '@/lib/queries';

const ACCIONES: Record<string, { label: string; icon: string; bg: string; fg: string }> = {
  tirosLibres: { label: 'Tiro Libre',  icon: '🎯', bg: 'bg-zinc-100',     fg: 'text-zinc-700' },
  dobles:      { label: 'Doble',       icon: '🏀', bg: 'bg-blue-100',     fg: 'text-blue-700' },
  triples:     { label: 'Triple',      icon: '🔥', bg: 'bg-purple-100',   fg: 'text-purple-700' },
  rebotes:     { label: 'Rebote',      icon: '🖐️', bg: 'bg-emerald-100',  fg: 'text-emerald-700' },
  robos:       { label: 'Robo',        icon: '🛡️', bg: 'bg-amber-100',    fg: 'text-amber-700' },
  bloqueos:    { label: 'Bloqueo',     icon: '🚫', bg: 'bg-red-100',      fg: 'text-red-700' },
  sustitucion: { label: 'Cambio',      icon: '🔄', bg: 'bg-purple-50',    fg: 'text-purple-700' },
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

/** Filtra stats por equipo usando nombre o id (igual que la app vieja). */
function statsDelEquipo(stats: StatPartido[], teamName?: string, teamId?: string): StatPartido[] {
  const targetName = (teamName || '').trim().toUpperCase();
  return stats.filter(s => {
    if (teamId && s.equipoId && s.equipoId.toString() === teamId.toString()) return true;
    if (targetName && s.equipo && s.equipo.trim().toUpperCase() === targetName) return true;
    return false;
  });
}

function buildBoxScore(stats: StatPartido[]): BoxRow[] {
  return stats.map(s => ({
    jugadorId: s.jugadorId,
    nombre:    s.nombre || '',
    numero:    s.numero ?? '',
    pts:       (s.tirosLibres || 0) + (s.dobles || 0) * 2 + (s.triples || 0) * 3,
    reb:       s.rebotes  || 0,
    rob:       s.robos    || 0,
    blo:       s.bloqueos || 0,
    triples:   s.triples  || 0,
    dobles:    s.dobles   || 0,
    tl:        s.tirosLibres || 0,
  })).sort((a, b) => b.pts - a.pts);
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
  partidoInicial, categoria, equipos, statsInicial, jugadasInicial,
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

  const [pbpOpen, setPbpOpen]               = useState(false);
  const [collapsedTeams, setCollapsedTeams] = useState<Record<string, boolean>>({});
  const [pulse, setPulse]                   = useState(false);

  const isLive  = partido.enVivo === true && partido.estatus !== 'finalizado';
  const isFinal = partido.estatus === 'finalizado';

  useEffect(() => {
    const ref = doc(getDb(), colName('calendario', categoria), partidoInicial.id);
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() } as Partido;
      setPartido(prev => {
        if (prev.marcadorLocal !== data.marcadorLocal || prev.marcadorVisitante !== data.marcadorVisitante) {
          setPulse(true); setTimeout(() => setPulse(false), 500);
        }
        return data;
      });
    });
    return () => unsub();
  }, [partidoInicial.id, categoria]);

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

  // Filtrado por NOMBRE/ID del equipo (no por 'local'/'visitante')
  const statsLocal = useMemo(
    () => statsDelEquipo(stats, partido.equipoLocalNombre, partido.equipoLocalId),
    [stats, partido.equipoLocalNombre, partido.equipoLocalId]
  );
  const statsVisita = useMemo(
    () => statsDelEquipo(stats, partido.equipoVisitanteNombre, partido.equipoVisitanteId),
    [stats, partido.equipoVisitanteNombre, partido.equipoVisitanteId]
  );

  const boxLocal    = useMemo(() => buildBoxScore(statsLocal),  [statsLocal]);
  const boxVisita   = useMemo(() => buildBoxScore(statsVisita), [statsVisita]);
  const totalsLocal = useMemo(() => totalsOf(boxLocal),  [boxLocal]);
  const totalsVisit = useMemo(() => totalsOf(boxVisita), [boxVisita]);

  // Top performers: ahora calcula correctamente
  const topPerformers = useMemo(() => {
    return [...boxLocal, ...boxVisita].sort((a, b) => b.pts - a.pts).slice(0, 3);
  }, [boxLocal, boxVisita]);

  const lastJugada = jugadas[0];

  const ml = partido.marcadorLocal     ?? 0;
  const mv = partido.marcadorVisitante ?? 0;
  const cuarto = currentQuarter(partido);
  const local  = partido.equipoLocalNombre     ?? 'Local';
  const visit  = partido.equipoVisitanteNombre ?? 'Visitante';
  const logoLocal = equipos.get(partido.equipoLocalId     || '')?.logoUrl;
  const logoVisit = equipos.get(partido.equipoVisitanteId || '')?.logoUrl;
  const localGana = ml > mv;

  return (
    <div className="space-y-6">
      {/* MARCADOR */}
      <div className={
        'rounded-2xl bg-white shadow-card overflow-hidden border-2 ' +
        (isLive ? 'border-liga-coral' : isFinal ? 'border-liga-final' : 'border-[var(--color-border)]')
      }>
        {/* Top bar */}
        <div className={
          'flex items-center justify-between px-5 py-2.5 border-b ' +
          (isLive ? 'bg-liga-coralSoft border-liga-coral/20' : isFinal ? 'bg-liga-finalSoft border-liga-final/20' : 'bg-[var(--color-bg)] border-[var(--color-border)]')
        }>
          <div className="flex items-center gap-2">
            {isLive && (
              <>
                <span className="w-2 h-2 rounded-full bg-liga-live pulse-live" />
                <span className="text-[11px] font-extrabold text-liga-live tracking-widest uppercase">En vivo · {cuarto}</span>
              </>
            )}
            {isFinal && (
              <span className="text-[11px] font-extrabold text-liga-final tracking-widest uppercase">🏁 Final</span>
            )}
            {!isLive && !isFinal && (
              <span className="text-[11px] font-extrabold text-[var(--color-text-dim)] tracking-widest uppercase">
                Programado{partido.hora ? ` · ${partido.hora}` : ''}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-wider font-bold">
            {CAT_LABELS[categoria] ?? categoria}
            {partido.grupo ? ` · Grupo ${partido.grupo}` : ''}
            {partido.fase && partido.fase !== 'REGULAR' ? ` · ${partido.fase}` : ''}
          </span>
        </div>

        {/* Marcador — layout vertical estilo ESPN scoreboard */}
        <div className="px-4 sm:px-6 py-5">
          {/* Local */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 py-2">
            <TeamLogo nombre={local} logoUrl={logoLocal} size={52} ring />
            <p className={
              'font-extrabold text-base sm:text-2xl leading-tight truncate ' +
              (isFinal && !localGana ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text)]')
            }>
              {local}
            </p>
            <span className={
              'text-4xl sm:text-6xl font-extrabold tabular-nums leading-none transition-transform ' +
              (pulse ? 'scale-110 ' : '') +
              (isFinal && !localGana ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text)]')
            }>
              {ml}
            </span>
          </div>

          {/* Separator */}
          <div className="h-px bg-[var(--color-border)] my-2" />

          {/* Visitante */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4 py-2">
            <TeamLogo nombre={visit} logoUrl={logoVisit} size={52} ring />
            <p className={
              'font-extrabold text-base sm:text-2xl leading-tight truncate ' +
              (isFinal && localGana ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text)]')
            }>
              {visit}
            </p>
            <span className={
              'text-4xl sm:text-6xl font-extrabold tabular-nums leading-none transition-transform ' +
              (pulse ? 'scale-110 ' : '') +
              (isFinal && localGana ? 'text-[var(--color-text-dim)]' : 'text-[var(--color-text)]')
            }>
              {mv}
            </span>
          </div>

          {/* Mini box por cuartos */}
          {partido.cuartosLocal && (
            <div className="mt-5 pt-4 border-t border-[var(--color-border)] overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[var(--color-text-dim2)]">
                    <th className="text-left py-2 font-bold">&nbsp;</th>
                    <th className="py-2 px-2 font-bold">Q1</th>
                    <th className="py-2 px-2 font-bold">Q2</th>
                    <th className="py-2 px-2 font-bold">Q3</th>
                    <th className="py-2 px-2 font-bold">Q4</th>
                    <th className="py-2 px-2 font-extrabold text-liga-coral">TOT</th>
                  </tr>
                </thead>
                <tbody>
                  {['local', 'visitante'].map(team => {
                    const cuartos = team === 'local' ? partido.cuartosLocal : partido.cuartosVisitante;
                    const nombre  = team === 'local' ? local : visit;
                    const total   = team === 'local' ? ml : mv;
                    return (
                      <tr key={team} className="border-t border-[var(--color-border)]">
                        <td className="py-2 font-bold truncate max-w-[140px] sm:max-w-none">{nombre}</td>
                        {['Q1','Q2','Q3','Q4'].map(q => (
                          <td key={q} className={'py-2 px-2 text-center tabular-nums ' + (q === cuarto && isLive ? 'text-liga-live font-extrabold' : 'text-[var(--color-text-dim)]')}>
                            {cuartos?.[q] ?? 0}
                          </td>
                        ))}
                        <td className="py-2 px-2 text-center tabular-nums font-extrabold text-liga-coral">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ÚLTIMA JUGADA (solo si está EN VIVO — en finalizados no aporta) */}
      {isLive && lastJugada && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${ACCIONES[lastJugada.accion]?.bg ?? 'bg-zinc-100'}`}>
              {ACCIONES[lastJugada.accion]?.icon ?? '🏀'}
            </div>
            <div className="flex-1 min-w-0">
              {lastJugada.accion === 'sustitucion' ? (
                <>
                  <p className="text-[10px] font-extrabold tracking-widest text-purple-700 uppercase">Cambio</p>
                  <p className="text-xs mt-0.5">
                    <span className="text-red-600">↓ #{lastJugada.jugadorSaleNumero} {lastJugada.jugadorSaleNombre}</span>
                    <span className="mx-2 text-[var(--color-text-dim2)]">·</span>
                    <span className="text-emerald-600">↑ #{lastJugada.jugadorNumero} {lastJugada.jugadorNombre}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-extrabold text-[var(--color-text)]">#{lastJugada.jugadorNumero} {lastJugada.jugadorNombre}</p>
                  <p className="text-[11px] text-[var(--color-text-dim)]">
                    Última jugada · {ACCIONES[lastJugada.accion]?.label ?? lastJugada.accion}
                    {lastJugada.puntos > 0 && <span className="text-emerald-600 font-extrabold ml-1">+{lastJugada.puntos}</span>}
                    {lastJugada.cuarto && <span className="ml-2 text-[var(--color-text-dim2)]">· {lastJugada.cuarto}</span>}
                  </p>
                </>
              )}
            </div>
            <span className={
              'text-[10px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 ' +
              (lastJugada.equipo === 'local' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')
            }>
              {(lastJugada.equipo === 'local' ? local : visit).slice(0, 12)}
            </span>
          </div>
        </div>
      )}

      {/* TOP PERFORMERS */}
      {topPerformers.length > 0 && (
        <section>
          <h2 className="text-xs font-extrabold tracking-widest text-[var(--color-text)] uppercase mb-3 border-b-2 border-liga-coral pb-2">
            Mejores del partido
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topPerformers.map((p, idx) => (
              <div key={p.jugadorId} className="bg-white rounded-xl border border-[var(--color-border)] shadow-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold tracking-widest text-liga-gold uppercase">
                    {idx === 0 ? '⭐ MVP' : `#${idx + 1}`}
                  </span>
                  <span className="text-3xl font-extrabold text-liga-coral tabular-nums leading-none">{p.pts}</span>
                </div>
                <p className="text-sm font-extrabold mt-1 truncate text-[var(--color-text)]">#{p.numero} {p.nombre}</p>
                <p className="text-[11px] text-[var(--color-text-dim)] mt-2">
                  {p.reb} reb · {p.rob} robos · {p.triples} 3PT
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BOX SCORE */}
      {(boxLocal.length > 0 || boxVisita.length > 0) && (
        <section>
          <h2 className="text-xs font-extrabold tracking-widest text-[var(--color-text)] uppercase mb-3 border-b-2 border-liga-coral pb-2">
            📊 Box Score
          </h2>
          <div className="space-y-3">
            {[
              { team: local, rows: boxLocal,  totals: totalsLocal, bgHeader: 'bg-blue-50',    textHeader: 'text-blue-700' },
              { team: visit, rows: boxVisita, totals: totalsVisit, bgHeader: 'bg-red-50',     textHeader: 'text-red-700' },
            ].map(t => {
              const collapsed = !!collapsedTeams[t.team];
              return (
                <div key={t.team} className="bg-white rounded-xl border border-[var(--color-border)] shadow-card overflow-hidden">
                  <button
                    onClick={() => setCollapsedTeams(prev => ({ ...prev, [t.team]: !prev[t.team] }))}
                    className={`w-full flex items-center justify-between px-5 py-3 hover:bg-[var(--color-bg)] transition-colors ${t.bgHeader}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-block text-[10px] font-bold transition-transform ${t.textHeader} ` + (collapsed ? '-rotate-90' : 'rotate-0')}>▼</span>
                      <span className={`text-xs font-extrabold uppercase tracking-wider truncate ${t.textHeader}`}>{t.team}</span>
                    </div>
                    {t.rows.length > 0 && (
                      <div className="flex items-baseline gap-2 flex-shrink-0">
                        <span className="text-xl font-extrabold text-liga-coral tabular-nums">{t.totals.pts}</span>
                        <span className="text-[10px] font-bold text-[var(--color-text-dim)] uppercase">PTS</span>
                        <span className="text-xs text-[var(--color-text-dim)] ml-2 hidden sm:inline">
                          {t.totals.reb}R · {t.totals.rob}S · {t.totals.blo}B
                        </span>
                      </div>
                    )}
                  </button>

                  {!collapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-[var(--color-bg)] text-[var(--color-text-dim)] font-bold">
                          <tr>
                            <th className="text-left py-2 px-3">Jugador</th>
                            <th className="py-2 px-2 text-liga-coral">PTS</th>
                            <th className="py-2 px-2">REB</th>
                            <th className="py-2 px-2">ROB</th>
                            <th className="py-2 px-2">BLO</th>
                            <th className="py-2 px-2">3P</th>
                            <th className="py-2 px-2">2P</th>
                            <th className="py-2 px-2">TL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.rows.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-4 text-[var(--color-text-dim2)] text-xs">Sin jugadas aún</td></tr>
                          ) : t.rows.map(r => (
                            <tr key={r.jugadorId} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg)]">
                              <td className="py-2 px-3 font-bold truncate max-w-[160px] text-[var(--color-text)]">
                                <span className="text-liga-coral mr-1">#{r.numero}</span>
                                {r.nombre}
                              </td>
                              <td className="py-2 px-2 text-center font-extrabold text-liga-coral tabular-nums">{r.pts}</td>
                              <td className="py-2 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{r.reb}</td>
                              <td className="py-2 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{r.rob}</td>
                              <td className="py-2 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{r.blo}</td>
                              <td className="py-2 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{r.triples}</td>
                              <td className="py-2 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{r.dobles}</td>
                              <td className="py-2 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{r.tl}</td>
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

      {/* PLAY BY PLAY (al final) */}
      {jugadas.length > 0 && (
        <section className="bg-white rounded-xl border border-[var(--color-border)] shadow-card overflow-hidden">
          <button
            onClick={() => setPbpOpen(v => !v)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[var(--color-bg)] transition-colors"
          >
            <span className="text-xs font-extrabold tracking-widest text-[var(--color-text)] uppercase flex items-center gap-2">
              <span className={'inline-block transition-transform text-[10px] ' + (pbpOpen ? 'rotate-0' : '-rotate-90')}>▼</span>
              📋 Play by Play
            </span>
            <span className="text-xs text-[var(--color-text-dim)] font-bold">
              {jugadas.length} {jugadas.length === 1 ? 'jugada' : 'jugadas'}
            </span>
          </button>
          {pbpOpen && (
            <div className="max-h-96 overflow-y-auto border-t border-[var(--color-border)]">
              {jugadas.map((j, idx) => {
                const acc = ACCIONES[j.accion];
                const esSub = j.accion === 'sustitucion';
                return (
                  <div key={j.id} className={
                    'flex items-center gap-3 px-4 py-2.5 border-t border-[var(--color-border)] first:border-t-0 ' +
                    (idx === 0 && isLive ? 'bg-liga-coralSoft' : '')
                  }>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${acc?.bg ?? 'bg-zinc-100'}`}>
                      <span className="text-base">{acc?.icon ?? '🏀'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {esSub ? (
                        <>
                          <p className="text-[10px] font-extrabold text-purple-700 uppercase">Cambio</p>
                          <p className="text-[11px] leading-tight">
                            <span className="text-red-600">↓ #{j.jugadorSaleNumero} {j.jugadorSaleNombre}</span>
                            <br />
                            <span className="text-emerald-600">↑ #{j.jugadorNumero} {j.jugadorNombre}</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-extrabold truncate text-[var(--color-text)]">#{j.jugadorNumero} {j.jugadorNombre}</p>
                          <p className="text-[10px] text-[var(--color-text-dim)]">
                            {acc?.label ?? j.accion}
                            {j.puntos > 0 && <span className="text-emerald-600 font-extrabold ml-1">+{j.puntos}</span>}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={
                        'text-[9px] font-extrabold px-1.5 py-0.5 rounded ' +
                        (j.equipo === 'local' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')
                      }>
                        {(j.equipo === 'local' ? local : visit).slice(0, 8)}
                      </span>
                      {j.cuarto && (
                        <span className="text-[9px] font-bold text-[var(--color-text-dim2)]">{j.cuarto}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
