// Lista de equipos de una categoría, agrupados por grupo (A/B).

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import { getEquipos } from '@/lib/queries';
import { TeamLogo } from '@/components/TeamLogo';
import type { Equipo } from '@/types';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) return { title: 'Equipos' };
  return {
    title: `Equipos ${cat.label}`,
    description: `Todos los equipos de ${cat.label} de la Liga Metropolitana Eje Este.`,
  };
}

export default async function EquiposPorCategoriaPage({ params }: { params: { categoria: string } }) {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) notFound();
  const c = cat!;

  const equiposMap = await getEquipos(c.id as CategoriaId);
  const equipos = Array.from(equiposMap.values())
    .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

  const porGrupo: Record<string, Equipo[]> = {};
  equipos.forEach(e => {
    const g = (e.grupo || 'Sin grupo').toUpperCase();
    if (!porGrupo[g]) porGrupo[g] = [];
    porGrupo[g].push(e);
  });
  const grupos = Object.keys(porGrupo).sort();

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <Link href="/equipos" className="hover:text-[var(--color-text-dim)]">Equipos</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)]">{c.label}</span>
      </p>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Equipos · <span className="text-liga-coral">{c.label}</span></h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">{equipos.length} equipos</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-[var(--color-border)] pb-3">
        {CATEGORIAS.map(x => (
          <Link key={x.id} href={`/equipos/${x.id}`}
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

      {equipos.length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {porGrupo[g].map(e => (
                <Link
                  key={e.id}
                  href={`/equipo/${e.id}?categoria=${c.id}`}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-card hover:bg-[var(--color-card-2)] hover:border-liga-coral/40 transition-colors px-4 py-3 flex items-center gap-3"
                >
                  <TeamLogo nombre={e.nombre} logoUrl={e.logoUrl} size={40} ring />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold truncate text-[var(--color-text)]">{e.nombre}</p>
                    {e.grupo && <p className="text-[11px] text-[var(--color-text-dim)] mt-0.5">Grupo {e.grupo}</p>}
                  </div>
                  <span className="text-[10px] text-liga-coral font-extrabold uppercase tracking-wider whitespace-nowrap">Ver →</span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
