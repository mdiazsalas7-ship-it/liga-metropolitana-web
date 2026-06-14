// Página de Entrevistas/Videos: grilla completa.

import type { Metadata } from 'next';
import { getEntrevistas } from '@/lib/queries';
import { EntrevistasGrid } from '@/components/EntrevistasGrid';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Entrevistas y videos de la Liga Metropolitana Eje Este.',
};

export default async function EntrevistasPage() {
  const entrevistas = await getEntrevistas(60);

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-liga-coral pb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Videos y entrevistas</h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">Lo último de la liga en cámara</p>
      </div>

      {entrevistas.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card">
          <p className="text-sm text-[var(--color-text-dim)]">Todavía no hay videos publicados.</p>
        </div>
      ) : (
        <EntrevistasGrid entrevistas={entrevistas} />
      )}
    </div>
  );
}
