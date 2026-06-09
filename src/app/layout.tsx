import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: {
    default: 'Liga Metropolitana Eje Este',
    template: '%s — Liga Metropolitana Eje Este',
  },
  description:
    'Resultados, calendario, estadísticas y noticias de la Liga Metropolitana Eje Este. Sigue todos los partidos en vivo.',
  openGraph: {
    title: 'Liga Metropolitana Eje Este',
    description: 'Resultados, calendario, estadísticas y noticias en vivo.',
    type: 'website',
    locale: 'es',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-6 min-h-[70vh]">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
