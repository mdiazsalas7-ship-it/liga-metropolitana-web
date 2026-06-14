// Página de Noticias: grid de todos los artículos.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getTodasNoticias } from '@/lib/queries';
import { imagenDeNoticia, cuerpoDeNoticia, esDestacada } from '@/lib/noticias';
import { fechaRelativa } from '@/lib/fechas';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Noticias',
  description: 'Últimas noticias de la Liga Metropolitana Eje Este.',
};

export default async function NoticiasPage() {
  const noticias = await getTodasNoticias();

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-liga-coral pb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Noticias</h1>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">Lo último de la liga</p>
      </div>

      {noticias.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card">
          <p className="text-sm text-[var(--color-text-dim)]">Todavía no hay noticias publicadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {noticias.map(n => {
            const img    = imagenDeNoticia(n);
            const cuerpo = cuerpoDeNoticia(n);
            const dest   = esDestacada(n);
            return (
              <article
                key={n.id}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-card card-hover overflow-hidden flex flex-col"
              >
                <div className="relative aspect-video bg-[var(--color-bg-alt)]">
                  {img ? (
                    <img src={img} alt={n.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-bg-alt)]">
                      <span className="text-3xl">📰</span>
                    </div>
                  )}
                  {dest && (
                    <span className="absolute top-2.5 left-2.5 bg-liga-coral text-white text-[9px] font-extrabold tracking-[0.14em] uppercase px-2 py-0.5 rounded">
                      Destacado
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="text-sm sm:text-base font-extrabold leading-tight text-[var(--color-text)] line-clamp-2">
                    {n.titulo}
                  </h2>
                  {cuerpo && (
                    <p className="text-xs sm:text-sm text-[var(--color-text-dim)] mt-2 line-clamp-3 leading-relaxed flex-1">
                      {cuerpo}
                    </p>
                  )}
                  {n.fecha && (
                    <p className="text-[10px] text-[var(--color-text-dim2)] mt-3 font-bold uppercase tracking-wider">
                      {fechaRelativa(n.fecha)}
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
