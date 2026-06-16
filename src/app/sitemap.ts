// Sitemap dinámico que incluye todas las páginas estáticas + un sample
// de partidos y equipos por categoría. Google lo lee y indexa todo.

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { CATEGORIAS } from '@/lib/categorias';
import { getPartidosPorCategoria, getEquipos } from '@/lib/queries';

export const revalidate = 3600; // 1 hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,           changeFrequency: 'hourly',  priority: 1.0, lastModified: now },
    { url: `${SITE_URL}/calendario`, changeFrequency: 'hourly',  priority: 0.9, lastModified: now },
    { url: `${SITE_URL}/posiciones`, changeFrequency: 'daily',   priority: 0.9, lastModified: now },
    { url: `${SITE_URL}/equipos`,    changeFrequency: 'weekly',  priority: 0.7, lastModified: now },
    { url: `${SITE_URL}/jugadores`,  changeFrequency: 'daily',   priority: 0.7, lastModified: now },
    { url: `${SITE_URL}/entrevistas`, changeFrequency: 'daily',  priority: 0.7, lastModified: now },
    { url: `${SITE_URL}/noticias`,   changeFrequency: 'daily',   priority: 0.8, lastModified: now },
    { url: `${SITE_URL}/liga`,       changeFrequency: 'monthly', priority: 0.6, lastModified: now },
  ];

  // Páginas de cada categoría
  CATEGORIAS.forEach(c => {
    base.push(
      { url: `${SITE_URL}/calendario/${c.id}`, changeFrequency: 'hourly', priority: 0.9, lastModified: now },
      { url: `${SITE_URL}/posiciones/${c.id}`, changeFrequency: 'daily',  priority: 0.8, lastModified: now },
      { url: `${SITE_URL}/equipos/${c.id}`,    changeFrequency: 'weekly', priority: 0.6, lastModified: now },
      { url: `${SITE_URL}/jugadores/${c.id}`,  changeFrequency: 'daily',  priority: 0.7, lastModified: now },
    );
  });

  // Partidos y equipos individuales (limit razonable para no inflar el sitemap)
  for (const cat of CATEGORIAS) {
    try {
      const [partidos, equipos] = await Promise.all([
        getPartidosPorCategoria(cat.id, 100),
        getEquipos(cat.id),
      ]);
      partidos.forEach(p => {
        base.push({
          url: `${SITE_URL}/partido/${p.id}?categoria=${cat.id}`,
          changeFrequency: p.estatus === 'finalizado' ? 'monthly' : 'hourly',
          priority: 0.6,
          lastModified: now,
        });
      });
      equipos.forEach(e => {
        base.push({
          url: `${SITE_URL}/equipo/${e.id}?categoria=${cat.id}`,
          changeFrequency: 'weekly',
          priority: 0.5,
          lastModified: now,
        });
      });
    } catch { /* col no existe */ }
  }

  return base;
}
