// "ALREDEDOR DE LA LIGA": lista vertical de noticias con thumbnail grande
// + título + extracto + fecha. Estilo "Around the NBA".

import Link from 'next/link';
import { fechaRelativa } from '@/lib/fechas';
import type { Noticia } from '@/types';

export function AroundLeagueList({ noticias }: { noticias: Noticia[] }) {
  if (noticias.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-card overflow-hidden">
      <h2 className="px-5 py-4 border-b border-[var(--color-border)] text-xs font-extrabold tracking-widest text-[var(--color-text)] uppercase">
        Alrededor de la liga
      </h2>
      <ul className="divide-y divide-[var(--color-border)]">
        {noticias.map(n => (
          <li key={n.id}>
            <Link
              href="/noticias"
              className="flex gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors"
            >
              {n.imagenUrl ? (
                <img
                  src={n.imagenUrl}
                  alt=""
                  className="w-20 h-20 sm:w-28 sm:h-20 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 sm:w-28 sm:h-20 rounded flex-shrink-0 bg-liga-coralSoft flex items-center justify-center">
                  <span className="text-2xl">📰</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-extrabold leading-tight text-[var(--color-text)] line-clamp-2">
                  {n.titulo}
                </h3>
                {n.contenido && (
                  <p className="text-xs sm:text-sm text-[var(--color-text-dim)] mt-1.5 line-clamp-2 leading-relaxed">
                    {n.contenido}
                  </p>
                )}
                {n.fecha && (
                  <p className="text-[10px] text-[var(--color-text-dim2)] mt-2 font-bold uppercase tracking-wider">
                    {fechaRelativa(n.fecha)}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
