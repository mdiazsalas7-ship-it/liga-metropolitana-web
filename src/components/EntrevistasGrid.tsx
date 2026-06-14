'use client';

// Grid completo para la página /entrevistas. Reutiliza el VideoModal compartido.

import { useState } from 'react';
import type { Entrevista } from '@/types';
import { VideoModal, fechaShow } from './VideoModal';

export function EntrevistasGrid({ entrevistas }: { entrevistas: Entrevista[] }) {
  const [selected, setSelected] = useState<Entrevista | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {entrevistas.map(v => (
          <button
            key={v.id}
            onClick={() => setSelected(v)}
            className="text-left group"
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
                <div className="w-16 h-16 rounded-full bg-white/95 group-hover:bg-liga-coral group-hover:scale-110 flex items-center justify-center shadow-xl transition-all duration-200">
                  <span className="text-liga-dark group-hover:text-white text-2xl ml-1">▶</span>
                </div>
              </div>
              <span className="absolute top-2.5 left-2.5 bg-liga-coral text-white text-[9px] font-extrabold tracking-[0.14em] uppercase px-2 py-0.5 rounded">
                Video
              </span>
            </div>
            <div className="mt-3">
              <p className="text-sm sm:text-base font-extrabold text-[var(--color-text)] leading-tight line-clamp-2 group-hover:text-liga-coral transition-colors">
                {v.titulo}
              </p>
              {v.fecha && (
                <p className="text-[10px] text-[var(--color-text-dim)] mt-1.5 font-bold uppercase tracking-wider">
                  {fechaShow(v.fecha)}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && <VideoModal entrevista={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
