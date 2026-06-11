// Sidebar tipo NBA "HEADLINES": lista compacta de titulares con thumb pequeño.

import Link from 'next/link';
import { fechaRelativa } from '@/lib/fechas';
import { imagenDeNoticia } from '@/lib/noticias';
import type { Noticia } from '@/types';

export function HeadlinesSidebar({ noticias }: { noticias: Noticia[] }) {
  if (noticias.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-zinc-50">
        <h2 className="text-xs font-extrabold tracking-widest text-[var(--color-text)] uppercase">
          Headlines
        </h2>
        <Link href="/noticias" className="text-[10px] text-liga-coral font-extrabold hover:underline">
          Ver todas →
        </Link>
      </div>
      <ul className="divide-y divide-[var(--color-border)]">
        {noticias.slice(0, 6).map(n => {
          const img = imagenDeNoticia(n);
          return (
            <li key={n.id}>
              <Link
                href="/noticias"
                className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors"
              >
                {img && (
                  <img
                    src={img}
                    alt=""
                    className="w-14 h-14 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold leading-tight text-[var(--color-text)] line-clamp-2">
                    {n.titulo}
                  </p>
                  {n.fecha && (
                    <p className="text-[10px] text-[var(--color-text-dim)] mt-1 font-bold uppercase tracking-wider">
                      {fechaRelativa(n.fecha)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
