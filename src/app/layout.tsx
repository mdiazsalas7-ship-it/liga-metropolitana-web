import type { Metadata } from 'next';
import { Archivo, Barlow_Condensed } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SITE_URL, SITE_NAME, SITE_DESC } from '@/lib/site';

// Body: Archivo (limpia, moderna)
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
});

// Display / números: Barlow Condensed (atlética)
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-cond',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESC,
  themeColor: '#0a0e1a',
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESC,
    type: 'website',
    locale: 'es',
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESC,
  },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${barlow.variable}`}>
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-6 min-h-[70vh]">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
