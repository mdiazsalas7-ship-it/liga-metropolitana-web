import Link from 'next/link';
import type { Metadata } from 'next';
import { getTodasNoticias } from '@/lib/queries';
import { fechaRelativa } from '@/lib/fechas';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Noticias',
  description: 'Noticias y actualizaciones de la Liga Metropolitana Eje Este.',
};

export default async function NoticiasPage() {
  const noticias = await getTodasNoticias();

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)]">Noticias</span>
      </p>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Noticias</h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">
          {noticias.length} {noticias.length === 1 ? 'publicación' : 'publicaciones'}
        </p>
      </div>

      {noticias.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-[var(--color-border)] bg-white shadow-card">
          <p className="text-sm text-[var(--color-text-dim)]">Sin noticias publicadas todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {noticias.map(n => (
            <article key={n.id} className="rounded-xl border border-[var(--color-border)] bg-white shadow-card p-5">
              {n.fecha && (
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] mb-2 font-bold">
                  {fechaRelativa(n.fecha)}
                </p>
              )}
              <h2 className="text-lg font-bold leading-snug mb-2">{n.titulo}</h2>
              {n.contenido && (
                <p className="text-sm text-[var(--color-text-dim)] leading-relaxed whitespace-pre-wrap">
                  {n.contenido}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
