import Link from 'next/link';
import { CATEGORIAS } from '@/lib/categorias';
import {
  getPartidoEnVivo, getProximosPartidos, getUltimosResultados,
  getLideres, getEquipos, getNoticias,
} from '@/lib/queries';
import { LiveScoreCard } from '@/components/LiveScoreCard';
import { MatchCard } from '@/components/MatchCard';
import { LeaderCard } from '@/components/LeaderCard';
import { fechaRelativa } from '@/lib/fechas';

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
  const [enVivo, proximos, resultados, noticias] = await Promise.all([
    getPartidoEnVivo(),
    getProximosPartidos(6),
    getUltimosResultados(4),
    getNoticias(3),
  ]);

  // Equipos por categorías visibles para mostrar logos
  const catsUsadas = new Set<string>();
  [...proximos, ...resultados].forEach(p => p.categoria && catsUsadas.add(p.categoria));
  const equiposPorCat = new Map<string, Awaited<ReturnType<typeof getEquipos>>>();
  await Promise.all(
    Array.from(catsUsadas).map(async cat => {
      equiposPorCat.set(cat, await getEquipos(cat as any));
    })
  );
  const equiposAll = new Map();
  equiposPorCat.forEach(m => m.forEach((v, k) => equiposAll.set(k, v)));

  // Top goleadores (primera categoría con datos)
  let lideresPuntos: Awaited<ReturnType<typeof getLideres>> = [];
  let categoriaLider = '';
  for (const cat of CATEGORIAS) {
    const res = await getLideres(cat.id, 'puntos', 3);
    if (res.length > 0) { lideresPuntos = res; categoriaLider = cat.label; break; }
  }

  return (
    <div className="space-y-10">
      {/* PARTIDO EN VIVO (si hay) — siempre arriba */}
      {enVivo && (
        <LiveScoreCard
          partidoIdInicial={enVivo.id}
          categoriaInicial={enVivo.categoria}
          partidoInicial={enVivo}
        />
      )}

      {/* HERO si NO hay en vivo */}
      {!enVivo && (
        <section className="rounded-2xl bg-gradient-to-br from-liga-dark to-liga-darkSoft text-white p-7 sm:p-10 shadow-card">
          <span className="inline-block rounded-full bg-liga-coral text-white text-[11px] font-extrabold tracking-widest px-3 py-1 uppercase">
            Temporada 2026
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold leading-none tracking-tight">
            Liga Metropolitana
            <span className="block text-liga-coral mt-1">Eje Este</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-xl">
            Resultados en vivo, calendario, estadísticas y noticias de todas las categorías. Sigue cada partido jugada por jugada.
          </p>
        </section>
      )}

      {/* PRÓXIMOS PARTIDOS */}
      {proximos.length > 0 && (
        <section>
          <SectionHeader title="Esta semana" sub="Próximos partidos" link="/calendario" linkLabel="Ver calendario →" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proximos.map(p => (
              <MatchCard key={p.id} partido={p} equipos={equiposAll} variant="proximo" />
            ))}
          </div>
        </section>
      )}

      {/* RESULTADOS */}
      {resultados.length > 0 && (
        <section>
          <SectionHeader title="Resultados recientes" link="/calendario" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resultados.map(p => (
              <MatchCard key={p.id} partido={p} equipos={equiposAll} variant="resultado" />
            ))}
          </div>
        </section>
      )}

      {/* LÍDERES */}
      {lideresPuntos.length > 0 && (
        <section>
          <SectionHeader
            title="Líderes goleadores"
            sub={`${categoriaLider} · Temporada 2026`}
            link="/jugadores"
            linkLabel="Ver stats →"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {lideresPuntos.map(l => (
              <LeaderCard key={l.jugador.id} stat="puntos" lider={l} categoria={categoriaLider} />
            ))}
          </div>
        </section>
      )}

      {/* NOTICIAS */}
      {noticias.length > 0 && (
        <section>
          <SectionHeader title="Noticias" link="/noticias" linkLabel="Ver todas →" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {noticias.map(n => (
              <article key={n.id} className="bg-white border border-[var(--color-border)] rounded-xl shadow-card p-5 card-hover">
                {n.fecha && (
                  <p className="text-[10px] uppercase tracking-wider text-liga-coral mb-2 font-extrabold">
                    {fechaRelativa(n.fecha)}
                  </p>
                )}
                <h3 className="text-base font-extrabold leading-snug mb-2 text-[var(--color-text)]">{n.titulo}</h3>
                {n.contenido && (
                  <p className="text-sm text-[var(--color-text-dim)] line-clamp-3 leading-relaxed">
                    {n.contenido}
                  </p>
                )}
              </article>
            ))}
          </div>
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
  );
}
