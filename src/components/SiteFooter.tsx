export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[var(--color-bg)] mt-10">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-[var(--color-text-dim2)]">
        <span>© {new Date().getFullYear()} Liga Metropolitana Eje Este</span>
        <span>
          Powered by{' '}
          <span className="text-[var(--color-text-dim)] font-semibold">El Comisionado</span>
        </span>
      </div>
    </footer>
  );
}
