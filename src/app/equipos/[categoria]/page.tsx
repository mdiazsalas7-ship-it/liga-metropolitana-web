// Lista de equipos de una categoría con sus logos.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import { getEquipos } from '@/lib/queries';
import { TeamLogo } from '@/components/TeamLogo';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

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
  const equipos = Array.from(equiposMap.values()).sort((a, b) =>
    (a.nombre || '').localeCompare(b.nombre || '')
  );

  // Agrupar por grupo
  const grupos: Record<string, typeof equipos> = {};
  equipos.forEach(e => {
    const k = (e.grupo || 'SIN GRUPO').toUpperCase();
    if (!grupos[k]) grupos[k] = [];
    grupos[k].push(e);
  });
  const gruposKeys = Object.keys(grupos).sort();

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
        <p className="text-sm text-[var(--color-text-dim)] mt-1">
          {equipos.length} {equipos.length === 1 ? 'equipo' : 'equipos'}
        </p>
      </div>

      {/* Tabs entre categorías */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-[var(--color-border)] pb-3">
        {CATEGORIAS.map(x => (
          <Link key={x.id} href={`/equipos/${x.id}`}
            className={
              'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ' +
              (x.id === c.id
                ? 'bg-liga-dark border border-liga-dark text-white'
                : 'bg-white border border-[var(--color-border)] text-[var(--color-text-dim)] hover:bg-[var(--color-bg)]')
            }>
            {x.label}
          </Link>
        ))}
      </div>

      {equipos.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-[var(--color-border)] bg-white shadow-card">
          <p className="text-sm text-[var(--color-text-dim)]">Aún no hay equipos cargados para {c.label}.</p>
        </div>
      ) : (
        gruposKeys.map(g => (
          <section key={g}>
            {gruposKeys.length > 1 && (
              <h3 className="text-[11px] uppercase tracking-widest text-[var(--color-text-dim)] font-bold mb-2.5">
                Grupo {g}
              </h3>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {grupos[g].map(eq => (
                <Link key={eq.id} href={`/equipo/${eq.id}?categoria=${c.id}`}
                  className="rounded-xl border border-[var(--color-border)] bg-white shadow-card hover:bg-[var(--color-bg)] transition-colors p-4 flex flex-col items-center text-center">
                  <TeamLogo nombre={eq.nombre} logoUrl={eq.logoUrl} size={60} />
                  <p className="font-bold text-sm mt-3 truncate w-full">{eq.nombre}</p>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
