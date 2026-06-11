// Listado completo de entrevistas/videos.
// Server side: trae todos los videos. Cliente: maneja el modal.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getEntrevistas } from '@/lib/queries';
import { EntrevistasGrid } from '@/components/EntrevistasGrid';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Entrevistas y Videos',
  description: 'Entrevistas, jugadas destacadas y videos de la Liga Metropolitana Eje Este.',
};

export default async function EntrevistasPage() {
  const entrevistas = await getEntrevistas(50);

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)]">Entrevistas</span>
      </p>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Entrevistas y Videos</h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">
          {entrevistas.length} {entrevistas.length === 1 ? 'video' : 'videos'} disponibles
        </p>
      </div>

      {entrevistas.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-[var(--color-border)] bg-white shadow-card">
          <p className="text-sm text-[var(--color-text-dim)]">Aún no hay videos publicados.</p>
        </div>
      ) : (
        <EntrevistasGrid entrevistas={entrevistas} />
      )}
    </div>
  );
}
