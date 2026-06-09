// Landing del calendario: lista las categorías para que el usuario elija.

import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS } from '@/lib/categorias';

export const metadata: Metadata = {
  title: 'Calendario',
  description: 'Calendario completo de todas las categorías de la Liga Metropolitana Eje Este.',
};

export default function CalendarioLandingPage() {
  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)]">Calendario</span>
      </p>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Calendario</h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">
          Elegí una categoría para ver todos sus partidos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIAS.map(c => (
          <Link
            key={c.id}
            href={`/calendario/${c.id}`}
            className="rounded-xl border border-[var(--color-border)] bg-white shadow-card hover:bg-[var(--color-bg)] hover:border-liga-coral/40 transition-colors p-5"
          >
            <p className="font-bold text-base">{c.label}</p>
            <p className="text-xs text-liga-coral mt-2">Ver partidos →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
