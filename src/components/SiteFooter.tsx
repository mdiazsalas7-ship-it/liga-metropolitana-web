import { INSTAGRAM_URL, TIKTOK_URL, YOUTUBE_URL, APP_URL } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-dark)] mt-12">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">

        {/* Descargar app — visible en TODOS los dispositivos (en mobile el header lo oculta) */}
        <div className="flex flex-col items-center text-center gap-3">
          <p className="text-sm font-extrabold text-[var(--color-text)]">Seguí la liga en tu celular</p>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-liga-coral hover:bg-[#ff7350] text-white px-5 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 shadow-[0_8px_20px_-6px_rgba(255,90,48,0.5)]"
          >
            📱 Descargar la app
          </a>
        </div>

        {/* Redes sociales */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-2)] hover:border-liga-coral/40 px-4 py-2 text-xs font-bold text-[var(--color-text)] transition-colors"
          >
            Instagram
          </a>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-2)] hover:border-liga-coral/40 px-4 py-2 text-xs font-bold text-[var(--color-text)] transition-colors"
          >
            TikTok
          </a>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-2)] hover:border-liga-coral/40 px-4 py-2 text-xs font-bold text-[var(--color-text)] transition-colors"
          >
            YouTube
          </a>
        </div>

        {/* Línea final */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-dim2)]">
          <p>© 2026 Liga Metropolitana Eje Este</p>
          <p>
            Powered by <span className="text-liga-coral font-bold">El Comisionado</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
