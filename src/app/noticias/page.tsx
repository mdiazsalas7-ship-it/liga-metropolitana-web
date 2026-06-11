import Link from 'next/link';
import type { Metadata } from 'next';
import { getTodasNoticias } from '@/lib/queries';
import { fechaRelativa } from '@/lib/fechas';
import { imagenDeNoticia, cuerpoDeNoticia } from '@/lib/noticias';

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {noticias.map(n => {
            const img    = imagenDeNoticia(n);
            const cuerpo = cuerpoDeNoticia(n);
            return (
              <article key={n.id} className="bg-white rounded-xl border border-[var(--color-border)] shadow-card overflow-hidden card-hover">
                {img && (
                  <img
                    src={img}
                    alt={n.titulo}
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                )}
                <div className="p-5">
                  {n.fecha && (
                    <p className="text-[10px] uppercase tracking-wider text-liga-coral mb-2 font-extrabold">
                      {fechaRelativa(n.fecha)}
                    </p>
                  )}
                  <h2 className="text-lg font-extrabold leading-snug mb-2 text-[var(--color-text)]">{n.titulo}</h2>
                  {cuerpo && (
                    <p className="text-sm text-[var(--color-text-dim)] leading-relaxed whitespace-pre-wrap">
                      {cuerpo}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
