'use client';

// Modal de video compartido por EntrevistasCarousel y EntrevistasGrid.

import { useEffect } from 'react';
import type { Entrevista } from '@/types';

export function fechaShow(s?: string): string {
  if (!s || typeof s !== 'string') return '';
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const day = parseInt(m[1]);
    const mon = parseInt(m[2]);
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${day} ${meses[mon - 1] ?? ''}`;
  }
  return s;
}

export function VideoModal({ entrevista, onClose }: { entrevista: Entrevista; onClose: () => void }) {
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
      style={{ background: 'rgba(0, 0, 0, 0.92)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-black rounded-xl overflow-hidden w-full max-w-4xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white font-bold text-xl flex items-center justify-center backdrop-blur"
          aria-label="Cerrar video"
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

        <div className="bg-[var(--color-dark)] text-white px-5 py-3">
          <p className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-[0.13em]">
            {fechaShow(entrevista.fecha)}
          </p>
          <h3 className="text-base sm:text-lg font-extrabold mt-0.5">{entrevista.titulo}</h3>
        </div>
      </div>
    </div>
  );
}
