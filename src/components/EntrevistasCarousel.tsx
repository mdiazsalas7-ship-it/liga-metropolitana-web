'use client';

// Carrusel horizontal de entrevistas estilo NBA "Trending now".
// Click en una card → abre modal con el video.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Entrevista } from '@/types';

function fechaShow(s?: string): string {
  if (!s || typeof s !== 'string') return '';
  // DD/M/YYYY → "14 feb"
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const day = parseInt(m[1]);
    const mon = parseInt(m[2]);
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${day} ${meses[mon - 1] ?? ''}`;
  }
  // Else: devolver como viene
  return s;
}

function VideoModal({ entrevista, onClose }: { entrevista: Entrevista; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-black rounded-xl overflow-hidden w-full max-w-4xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white font-bold text-xl flex items-center justify-center backdrop-blur"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="aspect-video w-full bg-black">
          <video
            src={entrevista.videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Tu navegador no puede reproducir este video.
          </video>
        </div>

        <div className="bg-liga-dark text-white px-5 py-3">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
            {fechaShow(entrevista.fecha)}
          </p>
          <h3 className="text-base sm:text-lg font-extrabold mt-0.5">{entrevista.titulo}</h3>
        </div>
      </div>
    </div>
  );
}

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
            {/* Thumb */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 shadow-card">
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
              {/* Overlay con play */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/95 group-hover:bg-liga-coral group-hover:scale-110 flex items-center justify-center shadow-xl transition-all duration-200">
                  <span className="text-liga-dark group-hover:text-white text-xl ml-0.5">▶</span>
                </div>
              </div>
              {/* Tag */}
              <span className="absolute top-2 left-2 bg-liga-coral text-white text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded">
                Video
              </span>
            </div>
            {/* Title + fecha */}
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

        {/* Tarjeta de "Ver todos" */}
        <Link
          href="/entrevistas"
          className="flex-shrink-0 w-[180px] flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border-strong)] hover:border-liga-coral hover:bg-liga-coralSoft transition-colors text-center px-4"
        >
          <span className="text-xs font-extrabold text-liga-coral uppercase tracking-widest">
            Ver todas →
          </span>
        </Link>
      </div>

      {selected && (
        <VideoModal entrevista={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
