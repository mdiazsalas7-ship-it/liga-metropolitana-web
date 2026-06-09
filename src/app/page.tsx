// Home pública. Server-rendered con revalidación de 60s para que los datos estén frescos.
// El partido en vivo es un Client Component que se suscribe a Firestore para actualizar
// el marcador en tiempo real sin recargar la página.

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

// Revalida la home cada 60 segundos.
export const revalidate = 60;

export default async function HomePage() {
  // Cargamos todo en paralelo en el server
  const [enVivo, proximos, resultados, noticias] = await Promise.all([
    getPartidoEnVivo(),
    getProximosPartidos(6),
    getUltimosResultados(4),
    getNoticias(3),
  ]);

  // Para mostrar logos en las cards, necesitamos los equipos por categoría.
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

  // Líderes destacados: top puntos de la primera categoría con datos
  let lideresPuntos: Awaited<ReturnType<typeof getLideres>> = [];
  let categoriaLider = '';
  for (const cat of CATEGORIAS) {
    const res = await getLideres(cat.id, 'puntos', 3);
    if (res.length > 0) {
      lideresPuntos = res;
      categoriaLider = cat.label;
      break;
    }
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-liga-navy/40 to-transparent p-6 sm:p-10">
        <span className="inline-block rounded-full bg-liga-orange/15 border border-liga-orange/40 text-liga-orange text-[11px] font-bold tracking-wider px-3 py-1 uppercase">
          Temporada 2026
        </span>
        <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold leading-tight">
          Liga Metropolitana <span className="text-liga-orange">Eje Este</span>
        </h1>
        <p className="mt-2 text-[var(--color-text-dim)] text-sm leading-relaxed max-w-2xl">
          Resultados en vivo, calendario, estadísticas y noticias de todas las categorías.
        </p>
      </section>

      {/* Partido en vivo (si hay) */}
      {enVivo && (
        <section>
          <LiveScoreCard
            partidoIdInicial={enVivo.id}
            categoriaInicial={enVivo.categoria}
            partidoInicial={enVivo}
          />
        </section>
      )}

      {/* Próximos partidos */}
      {proximos.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase">
              Próximos partidos
            </h2>
            <Link href="/calendario" className="text-xs text-liga-orange font-bold">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {proximos.map(p => (
              <MatchCard key={p.id} partido={p} equipos={equiposAll} variant="proximo" />
            ))}
          </div>
        </section>
      )}

      {/* Últimos resultados */}
      {resultados.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase">
              Últimos resultados
            </h2>
            <Link href="/calendario" className="text-xs text-liga-orange font-bold">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resultados.map(p => (
              <MatchCard key={p.id} partido={p} equipos={equiposAll} variant="resultado" />
            ))}
          </div>
        </section>
      )}

      {/* Líderes */}
      {lideresPuntos.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase">
              Líderes goleadores · {categoriaLider}
            </h2>
            <Link href="/jugadores" className="text-xs text-liga-orange font-bold">Ver stats →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {lideresPuntos.map(l => (
              <LeaderCard key={l.jugador.id} stat="puntos" lider={l} categoria={categoriaLider} />
            ))}
          </div>
        </section>
      )}

      {/* Noticias */}
      {noticias.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase">
              Noticias
            </h2>
            <Link href="/noticias" className="text-xs text-liga-orange font-bold">Ver todas →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {noticias.map(n => (
              <article key={n.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                {n.fecha && (
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim2)] mb-2 font-bold">
                    {fechaRelativa(n.fecha)}
                  </p>
                )}
                <h3 className="text-sm font-bold leading-snug mb-1">{n.titulo}</h3>
                {n.contenido && (
                  <p className="text-xs text-[var(--color-text-dim)] line-clamp-3 leading-relaxed">
                    {n.contenido}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Categorías (siempre visible) */}
      <section>
        <h2 className="text-xs font-bold tracking-widest text-[var(--color-text-dim)] uppercase mb-3">
          Explorar por categoría
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIAS.map(c => (
            <Link
              key={c.id}
              href={`/calendario/${c.id}`}
              className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors px-4 py-5 text-center"
            >
              <p className="font-bold text-sm">{c.label}</p>
              <p className="text-[11px] text-[var(--color-text-dim)] mt-1">Ver partidos →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
