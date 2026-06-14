// Tabla de posiciones por grupo.
// Regla FIBA: 2 puntos ganar, 1 perder, 0 por forfait.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import { getEquipos, getPartidosPorCategoria } from '@/lib/queries';
import { TeamLogo } from '@/components/TeamLogo';

export const revalidate = 300;

interface RowPos {
  equipoId: string;
  nombre: string;
  logoUrl?: string;
  grupo: string;
  pj: number; g: number; p: number;
  pf: number; pc: number; dif: number;
  pts: number;
}

function calcularTabla(equipos: Map<string, any>, partidos: any[]): RowPos[] {
  const rows: Record<string, RowPos> = {};
  equipos.forEach(eq => {
    rows[eq.id] = {
      equipoId: eq.id,
      nombre: eq.nombre || '?',
      logoUrl: eq.logoUrl,
      grupo: (eq.grupo || 'A').toUpperCase(),
      pj: 0, g: 0, p: 0, pf: 0, pc: 0, dif: 0, pts: 0,
    };
  });

  partidos.forEach(p => {
    if (p.estatus !== 'finalizado') return;
    const fase = (p.fase || '').toUpperCase().trim();
    if (fase && fase !== 'REGULAR') return;

    const lId = p.equipoLocalId;
    const vId = p.equipoVisitanteId;
    const l = rows[lId]; const v = rows[vId];
    if (!l || !v) return;

    const ml = p.marcadorLocal ?? 0;
    const mv = p.marcadorVisitante ?? 0;
    l.pj++; v.pj++;
    l.pf += ml; l.pc += mv;
    v.pf += mv; v.pc += ml;

    if (ml > mv) {
      l.g++; v.p++;
      l.pts += 2;
      v.pts += p.esForfait ? 0 : 1;
    } else if (mv > ml) {
      v.g++; l.p++;
      v.pts += 2;
      l.pts += p.esForfait ? 0 : 1;
    }
  });

  Object.values(rows).forEach(r => { r.dif = r.pf - r.pc; });
  return Object.values(rows).sort((a, b) => b.pts - a.pts || b.dif - a.dif);
}

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) return { title: 'Tabla' };
  return {
    title: `Posiciones ${cat.label}`,
    description: `Tabla de posiciones de ${cat.label} de la Liga Metropolitana Eje Este.`,
  };
}

export default async function PosicionesPorCategoriaPage({ params }: { params: { categoria: string } }) {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) notFound();
  const c = cat!;

  const [equiposMap, partidos] = await Promise.all([
    getEquipos(c.id as CategoriaId),
    getPartidosPorCategoria(c.id as CategoriaId),
  ]);

  const tabla = calcularTabla(equiposMap, partidos);

  const porGrupo: Record<string, RowPos[]> = {};
  tabla.forEach(r => {
    if (!porGrupo[r.grupo]) porGrupo[r.grupo] = [];
    porGrupo[r.grupo].push(r);
  });
  const grupos = Object.keys(porGrupo).sort();

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <Link href="/posiciones" className="hover:text-[var(--color-text-dim)]">Posiciones</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)]">{c.label}</span>
      </p>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Posiciones · <span className="text-liga-coral">{c.label}</span></h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">
          Sistema FIBA: 2 pts por victoria · 1 pt por derrota · 0 por forfait
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-[var(--color-border)] pb-3">
        {CATEGORIAS.map(x => (
          <Link key={x.id} href={`/posiciones/${x.id}`}
            className={
              'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ' +
              (x.id === c.id
                ? 'bg-liga-coral border border-liga-coral text-white'
                : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-dim)] hover:bg-[var(--color-card-2)]')
            }>
            {x.label}
          </Link>
        ))}
      </div>

      {tabla.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card">
          <p className="text-sm text-[var(--color-text-dim)]">Sin equipos cargados para {c.label}.</p>
        </div>
      ) : (
        grupos.map(g => (
          <section key={g}>
            {grupos.length > 1 && (
              <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
                Grupo {g}
              </h2>
            )}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold border-b border-[var(--color-border)]">
                    <th className="text-left py-2.5 px-3">#</th>
                    <th className="text-left py-2.5">Equipo</th>
                    <th className="py-2.5 px-2 text-center">PJ</th>
                    <th className="py-2.5 px-2 text-center">G</th>
                    <th className="py-2.5 px-2 text-center">P</th>
                    <th className="py-2.5 px-2 text-center hidden sm:table-cell">PF</th>
                    <th className="py-2.5 px-2 text-center hidden sm:table-cell">PC</th>
                    <th className="py-2.5 px-2 text-center">Dif</th>
                    <th className="py-2.5 px-3 text-right text-liga-gold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {porGrupo[g].map((r, i) => (
                    <tr key={r.equipoId} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-card-2)] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[var(--color-text-dim)] tabular-nums">
                        {i < 4 ? <span className="text-liga-coral">{i + 1}</span> : i + 1}
                      </td>
                      <td className="py-2.5">
                        <Link href={`/equipo/${r.equipoId}?categoria=${c.id}`} className="flex items-center gap-2.5 min-w-0">
                          <TeamLogo nombre={r.nombre} logoUrl={r.logoUrl} size={28} />
                          <span className="font-semibold truncate">{r.nombre}</span>
                        </Link>
                      </td>
                      <td className="py-2.5 px-2 text-center tabular-nums text-[var(--color-text-dim)]">{r.pj}</td>
                      <td className="py-2.5 px-2 text-center tabular-nums text-liga-final">{r.g}</td>
                      <td className="py-2.5 px-2 text-center tabular-nums text-liga-live">{r.p}</td>
                      <td className="py-2.5 px-2 text-center tabular-nums hidden sm:table-cell">{r.pf}</td>
                      <td className="py-2.5 px-2 text-center tabular-nums hidden sm:table-cell">{r.pc}</td>
                      <td className={'py-2.5 px-2 text-center tabular-nums font-semibold ' + (r.dif > 0 ? 'text-liga-final' : r.dif < 0 ? 'text-liga-live' : 'text-[var(--color-text-dim)]')}>
                        {r.dif > 0 ? '+' : ''}{r.dif}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-extrabold text-liga-gold">{r.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
