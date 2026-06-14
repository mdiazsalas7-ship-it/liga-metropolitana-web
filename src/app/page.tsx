// Home tipo NBA.com: GamesStrip arriba, hero con noticia destacada + EN VIVO,
// sidebar de HEADLINES + líderes, "Alrededor de la liga" abajo.

import Link from 'next/link';
import { CATEGORIAS } from '@/lib/categorias';
import {
  getPartidoEnVivo, getEquipos, getNoticias,
  getPartidosParaStrip, getEntrevistas,
} from '@/lib/queries';
import { GamesStrip } from '@/components/GamesStrip';
import { FeaturedStory } from '@/components/FeaturedStory';
import { HeadlinesSidebar } from '@/components/HeadlinesSidebar';
import { AroundLeagueList } from '@/components/AroundLeagueList';
import { EntrevistasCarousel } from '@/components/EntrevistasCarousel';
import { LiveScoreCard } from '@/components/LiveScoreCard';
import { esDestacada, imagenDeNoticia } from '@/lib/noticias';

export const revalidate = 60;

function SectionHeader({ title, sub, link, linkLabel = 'Ver todos →' }: {
  title: string; sub?: string; link?: string; linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-4 border-b-2 border-liga-coral pb-2">
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-[var(--color-text)] leading-tight">{title}</h2>
        {sub && <p className="text-xs text-[var(--color-text-dim)] mt-0.5">{sub}</p>}
      </div>
      {link && (
        <Link href={link} className="text-xs text-liga-coral font-extrabold whitespace-nowrap hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [
    enVivo, noticias, partidosStrip, entrevistas,
  ] = await Promise.all([
    getPartidoEnVivo(),
    getNoticias(12),
    getPartidosParaStrip(),
    getEntrevistas(8),
  ]);

  const catsUsadas = new Set<string>();
  partidosStrip.forEach(p => p.categoria && catsUsadas.add(p.categoria));
  const equiposPorCat = new Map<string, Awaited<ReturnType<typeof getEquipos>>>();
  await Promise.all(
    Array.from(catsUsadas).map(async cat => {
      equiposPorCat.set(cat, await getEquipos(cat as any));
    })
  );
  const equiposAll = new Map();
  equiposPorCat.forEach(m => m.forEach((v, k) => equiposAll.set(k, v)));

  const featured =
    noticias.find(esDestacada) ??
    noticias.find(n => !!imagenDeNoticia(n)) ??
    noticias[0];
  const headlinesNews = noticias.filter(n => !featured || n.id !== featured.id);

  return (
    <>
      {/* TOP STRIP fuera del max-width */}
      {partidosStrip.length > 0 && (
        <div className="-mx-4 -mt-6 mb-6">
          <GamesStrip partidos={partidosStrip} equipos={equiposAll} />
        </div>
      )}

      <div className="space-y-10">
        {/* PARTIDO EN VIVO — primero, es lo más importante */}
        {enVivo && (
          <LiveScoreCard
            partidoIdInicial={enVivo.id}
            categoriaInicial={enVivo.categoria}
            partidoInicial={enVivo}
          />
        )}

        {/* HERO ROW: noticia destacada + headlines */}
        {featured && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FeaturedStory noticia={featured} />
            </div>
            <div>
              <HeadlinesSidebar noticias={headlinesNews} />
            </div>
          </section>
        )}

        {/* Si NO hay noticias, hero alternativo */}
        {!featured && (
          <section
            className="rounded-2xl text-white p-7 sm:p-10 shadow-card relative overflow-hidden border border-[var(--color-border)]"
            style={{
              background:
                'radial-gradient(700px 320px at 90% 0%, rgba(255,90,48,0.22), transparent 60%), linear-gradient(135deg, var(--color-navy), var(--color-bg-alt))',
            }}
          >
            <span className="inline-block rounded-full bg-liga-coral text-white text-[11px] font-extrabold tracking-[0.13em] px-3 py-1 uppercase">
              Temporada 2026
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold leading-none tracking-tight">
              Liga Metropolitana
              <span className="block text-liga-coral mt-1">Eje Este</span>
            </h1>
          </section>
        )}

        {/* ENTREVISTAS / VIDEOS */}
        {entrevistas.length > 0 && (
          <section>
            <SectionHeader
              title="Entrevistas y videos"
              sub="Lo último de la liga en cámara"
              link="/entrevistas"
              linkLabel="Ver todas →"
            />
            <EntrevistasCarousel entrevistas={entrevistas} />
          </section>
        )}

        {/* ALREDEDOR DE LA LIGA */}
        {noticias.length > 0 && (
          <section>
            <SectionHeader title="Alrededor de la liga" link="/noticias" linkLabel="Ver todas →" />
            <AroundLeagueList noticias={noticias.slice(0, 8)} />
          </section>
        )}

        {/* CATEGORÍAS */}
        <section>
          <SectionHeader title="Explorar por categoría" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIAS.map(c => (
              <Link
                key={c.id}
                href={`/calendario/${c.id}`}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-card card-hover px-4 py-5 text-center relative overflow-hidden group"
              >
                <p className="font-extrabold text-sm text-[var(--color-text)]">{c.label}</p>
                <p className="text-[11px] text-liga-coral mt-1 font-bold">Ver partidos →</p>
                <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-liga-coral scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
