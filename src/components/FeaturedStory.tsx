// Hero principal: noticia destacada con foto grande, título y extracto.
// Si la noticia tiene `imagenUrl`, la usa de fondo; si no, usa color del navy.

import Link from 'next/link';
import { fechaRelativa } from '@/lib/fechas';
import { imagenDeNoticia, cuerpoDeNoticia } from '@/lib/noticias';
import type { Noticia } from '@/types';

export function FeaturedStory({ noticia }: { noticia: Noticia }) {
  const imagen   = imagenDeNoticia(noticia);
  const cuerpo   = cuerpoDeNoticia(noticia);
  const hasImage = !!imagen;

  return (
    <Link
      href="/noticias"
      className="block relative rounded-2xl overflow-hidden bg-liga-dark shadow-card card-hover min-h-[320px] sm:min-h-[440px]"
    >
      {/* Imagen de fondo */}
      {hasImage && (
        <img
          src={imagen}
          alt={noticia.titulo}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay para legibilidad del texto */}
      <div
        className="absolute inset-0"
        style={{
          background: hasImage
            ? 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.25) 100%)'
            : 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
        }}
      />

      {/* Contenido */}
      <div className="relative h-full flex flex-col justify-end p-6 sm:p-8 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-liga-coral text-white text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded">
            Destacado
          </span>
          {noticia.fecha && (
            <span className="text-[11px] text-zinc-300 font-bold uppercase tracking-wider">
              {fechaRelativa(noticia.fecha)}
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 max-w-3xl drop-shadow-lg">
          {noticia.titulo}
        </h1>
        {cuerpo && (
          <p className="text-sm sm:text-base text-zinc-200 max-w-2xl line-clamp-2 leading-relaxed drop-shadow-md">
            {cuerpo}
          </p>
        )}
        <div className="mt-4">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-liga-coral uppercase tracking-widest">
            Leer más <span className="text-base">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
