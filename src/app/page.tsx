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

  // Equipos por categorías visibles para mostrar logos (los del strip)
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

  // Noticia destacada: primero la marcada con `tipo: 'destacado'`,
  // si no hay, la más reciente con imagen, y si no, la primera.
  const featured =
    noticias.find(esDestacada) ??
    noticias.find(n => !!imagenDeNoticia(n)) ??
    noticias[0];
  const headlinesNews = noticias.filter(n => !featured || n.id !== featured.id);

  return (
    <>
      {/* TOP STRIP fuera del max-width para que ocupe todo el ancho */}
      {partidosStrip.length > 0 && (
        <div className="-mx-4 -mt-6 mb-6">
          <GamesStrip partidos={partidosStrip} equipos={equiposAll} />
        </div>
      )}

      <div className="space-y-10">
        {/* HERO ROW: 2/3 noticia destacada + 1/3 sidebar headlines */}
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
          <section className="rounded-2xl bg-gradient-to-br from-liga-dark to-liga-darkSoft text-white p-7 sm:p-10 shadow-card">
            <span className="inline-block rounded-full bg-liga-coral text-white text-[11px] font-extrabold tracking-widest px-3 py-1 uppercase">
              Temporada 2026
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold leading-none tracking-tight">
              Liga Metropolitana
              <span className="block text-liga-coral mt-1">Eje Este</span>
            </h1>
          </section>
        )}

        {/* PARTIDO EN VIVO si hay */}
        {enVivo && (
          <LiveScoreCard
            partidoIdInicial={enVivo.id}
            categoriaInicial={enVivo.categoria}
            partidoInicial={enVivo}
          />
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
                className="bg-white border border-[var(--color-border)] rounded-xl shadow-card card-hover px-4 py-5 text-center"
              >
                <p className="font-extrabold text-sm text-[var(--color-text)]">{c.label}</p>
                <p className="text-[11px] text-liga-coral mt-1 font-bold">Ver partidos →</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
