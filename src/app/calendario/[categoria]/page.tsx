// Calendario público de una categoría.
// Server: trae todos los partidos y equipos. Pasa a un client component para filtros/búsqueda.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import { getPartidosPorCategoria, getEquipos } from '@/lib/queries';
import { CalendarioCliente } from '@/components/CalendarioCliente';

export const revalidate = 60;

export function generateStaticParams() {
  return CATEGORIAS.map(c => ({ categoria: c.id }));
}

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) return { title: 'Calendario' };
  return {
    title: `Calendario ${cat.label}`,
    description: `Calendario completo de la categoría ${cat.label} de la Liga Metropolitana Eje Este.`,
  };
}

export default async function CalendarioCategoriaPage({ params }: { params: { categoria: string } }) {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) notFound();
  // Después del notFound, cat existe (notFound throws). Aliasamos para TS.
  const c = cat!;

  const [partidos, equiposMap] = await Promise.all([
    getPartidosPorCategoria(c.id as CategoriaId),
    getEquipos(c.id as CategoriaId),
  ]);
  const equipos = Array.from(equiposMap.values());

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <Link href="/calendario" className="hover:text-[var(--color-text-dim)]">Calendario</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)]">{c.label}</span>
      </p>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Calendario · <span className="text-liga-orange">{c.label}</span></h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">
          {partidos.length} {partidos.length === 1 ? 'partido' : 'partidos'} en la temporada
        </p>
      </div>

      {/* Selector de categoría (tabs entre todas) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-white/10 pb-3">
        {CATEGORIAS.map(x => (
          <Link
            key={x.id}
            href={`/calendario/${x.id}`}
            className={
              'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ' +
              (x.id === c.id
                ? 'bg-liga-navy/60 border border-liga-navy text-white'
                : 'bg-white/[0.04] border border-white/10 text-[var(--color-text-dim)] hover:bg-white/[0.08]')
            }
          >
            {x.label}
          </Link>
        ))}
      </div>

      {/* Listado con filtros / búsqueda (cliente) */}
      {partidos.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-white/10 bg-white/[0.02]">
          <p className="text-sm text-[var(--color-text-dim)]">
            Aún no hay partidos cargados para {c.label}.
          </p>
        </div>
      ) : (
        <CalendarioCliente
          partidos={partidos}
          equipos={equipos}
          categoriaLabel={c.label}
        />
      )}
    </div>
  );
}
