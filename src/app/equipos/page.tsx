// Landing de Equipos: elegí una categoría.

import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS } from '@/lib/categorias';

export const metadata: Metadata = {
  title: 'Equipos',
  description: 'Equipos de todas las categorías de la Liga Metropolitana Eje Este.',
};

export default function EquiposLanding() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Equipos</h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">Elegí una categoría para ver sus equipos.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CATEGORIAS.map(c => (
          <Link
            key={c.id}
            href={`/equipos/${c.id}`}
            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-card card-hover px-4 py-6 text-center relative overflow-hidden group"
          >
            <p className="font-extrabold text-sm text-[var(--color-text)]">{c.label}</p>
            <p className="text-[11px] text-liga-coral mt-1 font-bold">Ver equipos →</p>
            <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-liga-coral scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
}
