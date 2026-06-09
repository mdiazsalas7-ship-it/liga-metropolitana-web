// Página individual del partido.
// Server: trae partido + stats + jugadas + equipos para el primer render (SEO).
// Cliente: PartidoView se suscribe a Firestore para actualizar en tiempo real.
//
// URL: /partido/[id]?categoria=U16M

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIAS, type CategoriaId } from '@/lib/categorias';
import {
  getPartidoById, getStatsDePartido, getJugadasDePartido, getEquipos,
} from '@/lib/queries';
import { PartidoView } from '@/components/PartidoView';
import { ShareButton } from '@/components/ShareButton';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

const CAT_LABELS: Record<string, string> = {
  INTERINDUSTRIAL: 'Interindustrial',
  U16_FEMENINO:    'U16 Femenino',
  U16M:            'U16M',
  MASTER40:        'Master 40',
  LIBRE:           'Libre',
};

export async function generateMetadata({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { categoria?: string };
}): Promise<Metadata> {
  const cat = CATEGORIAS.find(c => c.id === searchParams.categoria);
  if (!cat) return { title: 'Partido' };
  const partido = await getPartidoById(cat.id as CategoriaId, params.id);
  if (!partido) return { title: 'Partido' };

  const local = partido.equipoLocalNombre ?? 'Local';
  const visit = partido.equipoVisitanteNombre ?? 'Visitante';
  const ml = partido.marcadorLocal ?? 0;
  const mv = partido.marcadorVisitante ?? 0;
  const score = partido.estatus === 'finalizado' ? `${local} ${ml} - ${mv} ${visit}` : `${local} vs ${visit}`;

  return {
    title: score,
    description: `${score} · ${cat.label} · Liga Metropolitana Eje Este`,
    openGraph: {
      title: score,
      description: `${cat.label} · ${partido.fechaAsignada ?? ''}`,
      type: 'website',
    },
  };
}

export default async function PartidoPage({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { categoria?: string };
}) {
  // La categoría viene como query param desde los links (?categoria=U16M)
  const cat = CATEGORIAS.find(c => c.id === searchParams.categoria);
  if (!cat) notFound();
  const c = cat!;

  const [partido, stats, jugadas, equiposMap] = await Promise.all([
    getPartidoById(c.id as CategoriaId, params.id),
    getStatsDePartido(params.id),
    getJugadasDePartido(params.id),
    getEquipos(c.id as CategoriaId),
  ]);

  if (!partido) notFound();
  // Después del notFound, partido existe (notFound throws).
  const p = partido!;

  const shareTitle = `${p.equipoLocalNombre} ${p.marcadorLocal ?? 0} - ${p.marcadorVisitante ?? 0} ${p.equipoVisitanteNombre}`;
  const shareUrl   = `${SITE_URL}/partido/${p.id}?categoria=${c.id}`;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + compartir */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-text-dim2)] min-w-0">
          <Link href="/" className="hover:text-[var(--color-text-dim)]">Inicio</Link>
          <span className="mx-1.5">›</span>
          <Link href={`/calendario/${c.id}`} className="hover:text-[var(--color-text-dim)]">{c.label}</Link>
          <span className="mx-1.5">›</span>
          <span className="text-[var(--color-text-dim)]">
            vs
          </span>
        </p>
        <ShareButton
          title={shareTitle}
          text={`${shareTitle} · ${c.label}`}
          url={shareUrl}
        />
      </div>

      <PartidoView
        partidoInicial={p}
        categoria={c.id as CategoriaId}
        equipos={equiposMap}
        statsInicial={stats}
        jugadasInicial={jugadas}
      />
    </div>
  );
}
