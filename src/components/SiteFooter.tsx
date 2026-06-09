export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white mt-12">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--color-text-dim)]">
        <p>© 2026 Liga Metropolitana Eje Este</p>
        <p>
          Powered by{' '}
          <span className="text-liga-coral font-bold">El Comisionado</span>
        </p>
      </div>
    </footer>
  );
}
