import { YOUTUBE_URL, TIKTOK_URL } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-dark)] mt-12">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-dim)]">
        <p>© 2026 Liga Metropolitana Eje Este</p>
        <div className="flex items-center gap-4">
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-semibold">
            YouTube
          </a>
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-semibold">
            TikTok
          </a>
          <span className="text-[var(--color-text-dim2)]">·</span>
          <p>
            Powered by{' '}
            <span className="text-liga-coral font-bold">El Comisionado</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
