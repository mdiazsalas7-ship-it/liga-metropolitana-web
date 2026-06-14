// Calendario de una categoría: tabs de categorías + CalendarioCliente (filtros/búsqueda).

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import { getPartidosPorCategoria, getEquipos } from '@/lib/queries';
import { CalendarioCliente } from '@/components/CalendarioCliente';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { categoria: string } }): Promise<Metadata> {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) return { title: 'Calendario' };
  return {
    title: `Calendario ${cat.label}`,
    description: `Partidos, resultados y próximos encuentros de ${cat.label}.`,
  };
}

export default async function CalendarioPorCategoriaPage({ params }: { params: { categoria: string } }) {
  const cat = CATEGORIAS.find(c => c.id === params.categoria);
  if (!cat) notFound();
  const c = cat!;

  const [partidos, equiposMap] = await Promise.all([
    getPartidosPorCategoria(c.id as CategoriaId),
    getEquipos(c.id as CategoriaId),
  ]);
  const equipos = Array.from(equiposMap.values());

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <Link href="/calendario" className="hover:text-[var(--color-text-dim)]">Calendario</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)]">{c.label}</span>
      </p>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Calendario · <span className="text-liga-coral">{c.label}</span></h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">{partidos.length} partidos en total</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-[var(--color-border)] pb-3">
        {CATEGORIAS.map(x => (
          <Link key={x.id} href={`/calendario/${x.id}`}
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

      <CalendarioCliente partidos={partidos} equipos={equipos} categoriaLabel={c.label} />
    </div>
  );
}
