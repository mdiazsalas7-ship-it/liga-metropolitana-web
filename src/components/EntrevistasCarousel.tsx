'use client';

// Carrusel horizontal de entrevistas estilo NBA "Trending now".

import { useState } from 'react';
import Link from 'next/link';
import type { Entrevista } from '@/types';
import { VideoModal, fechaShow } from './VideoModal';

export function EntrevistasCarousel({ entrevistas }: { entrevistas: Entrevista[] }) {
  const [selected, setSelected] = useState<Entrevista | null>(null);

  if (entrevistas.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
        {entrevistas.map(v => (
          <button
            key={v.id}
            onClick={() => setSelected(v)}
            className="flex-shrink-0 w-[240px] sm:w-[280px] text-left group"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-card">
              {v.thumbnailUrl ? (
                <img
                  src={v.thumbnailUrl}
                  alt={v.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <video
                  src={v.videoUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/95 group-hover:bg-liga-coral group-hover:scale-110 flex items-center justify-center shadow-xl transition-all duration-200">
                  <span className="text-liga-dark group-hover:text-white text-xl ml-0.5">▶</span>
                </div>
              </div>
              <span className="absolute top-2 left-2 bg-liga-coral text-white text-[9px] font-extrabold tracking-[0.14em] uppercase px-2 py-0.5 rounded">
                Video
              </span>
            </div>
            <div className="mt-2.5">
              <p className="text-sm font-extrabold text-[var(--color-text)] leading-tight line-clamp-2 group-hover:text-liga-coral transition-colors">
                {v.titulo}
              </p>
              {v.fecha && (
                <p className="text-[10px] text-[var(--color-text-dim)] mt-1 font-bold uppercase tracking-wider">
                  {fechaShow(v.fecha)}
                </p>
              )}
            </div>
          </button>
        ))}

        <Link
          href="/entrevistas"
          className="flex-shrink-0 w-[180px] flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border-strong)] hover:border-liga-coral hover:bg-liga-coralSoft transition-colors text-center px-4"
        >
          <span className="text-xs font-extrabold text-liga-coral uppercase tracking-[0.13em]">
            Ver todas →
          </span>
        </Link>
      </div>

      {selected && <VideoModal entrevista={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
