// Página de detalle de una noticia: imagen + cuerpo completo del artículo.
// URL: /noticia/[id]

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getNoticiaById, getTodasNoticias } from '@/lib/queries';
import { imagenDeNoticia, cuerpoDeNoticia, esDestacada } from '@/lib/noticias';
import { fechaRelativa } from '@/lib/fechas';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const n = await getNoticiaById(params.id);
  if (!n) return { title: 'Noticia' };
  const cuerpo = cuerpoDeNoticia(n);
  const img = imagenDeNoticia(n);
  return {
    title: n.titulo,
    description: cuerpo ? cuerpo.slice(0, 160) : n.titulo,
    openGraph: {
      title: n.titulo,
      description: cuerpo ? cuerpo.slice(0, 200) : '',
      images: img ? [img] : undefined,
      type: 'article',
    },
  };
}

export default async function NoticiaPage({ params }: { params: { id: string } }) {
  const noticia = await getNoticiaById(params.id);
  if (!noticia) notFound();
  const n = noticia!;

  const img    = imagenDeNoticia(n);
  const cuerpo = cuerpoDeNoticia(n);
  const dest   = esDestacada(n);

  // Partir el cuerpo en párrafos por saltos de línea
  const parrafos = (cuerpo || '')
    .split(/\n{1,}/)
    .map(p => p.trim())
    .filter(Boolean);

  // Otras noticias para "Seguí leyendo"
  const todas = await getTodasNoticias();
  const otras = todas.filter(x => x.id !== n.id).slice(0, 3);

  return (
    <article className="space-y-6 max-w-3xl mx-auto">
      <p className="text-xs text-[var(--color-text-dim2)]">
        <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
        <span className="mx-1.5">›</span>
        <Link href="/noticias" className="hover:text-[var(--color-text-dim)]">Noticias</Link>
        <span className="mx-1.5">›</span>
        <span className="text-[var(--color-text-dim)] truncate">{n.titulo}</span>
      </p>

      {/* Encabezado */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          {dest && (
            <span className="bg-liga-coral text-white text-[10px] font-extrabold tracking-[0.14em] uppercase px-2.5 py-1 rounded">
              Destacado
            </span>
          )}
          {n.fecha && (
            <span className="text-[11px] text-[var(--color-text-dim)] font-bold uppercase tracking-wider">
              {fechaRelativa(n.fecha)}
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
          {n.titulo}
        </h1>
      </header>

      {/* Imagen */}
      {img && (
        <img
          src={img}
          alt={n.titulo}
          className="w-full rounded-2xl object-cover max-h-[480px] border border-[var(--color-border)]"
        />
      )}

      {/* Cuerpo completo */}
      <div className="space-y-4">
        {parrafos.length > 0 ? (
          parrafos.map((p, i) => (
            <p key={i} className="text-[15px] sm:text-base text-[var(--color-text)] leading-relaxed">
              {p}
            </p>
          ))
        ) : (
          <p className="text-sm text-[var(--color-text-dim)]">Esta noticia no tiene contenido todavía.</p>
        )}
      </div>

      {/* Seguí leyendo */}
      {otras.length > 0 && (
        <section className="pt-6 mt-6 border-t border-[var(--color-border)]">
          <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-4">
            Seguí leyendo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {otras.map(o => {
              const oimg = imagenDeNoticia(o);
              return (
                <Link
                  key={o.id}
                  href={`/noticia/${o.id}`}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-card card-hover overflow-hidden"
                >
                  <div className="aspect-video bg-[var(--color-bg-alt)]">
                    {oimg ? (
                      <img src={oimg} alt={o.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-bg-alt)]">
                        <span className="text-2xl">📰</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-extrabold leading-tight text-[var(--color-text)] line-clamp-2">
                      {o.titulo}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
