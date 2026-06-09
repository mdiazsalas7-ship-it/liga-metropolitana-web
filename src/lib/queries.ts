// Funciones de lectura para usar desde Server Components.
// Leen del Firestore directamente desde el servidor de Vercel.
// Las páginas que las usan se cachean con `revalidate` para no hacer reads en cada visita.

import { getDb } from './firebase';
import { CATEGORIAS, colName, type CategoriaId } from './categorias';
import type { Partido, Equipo, Jugador, Noticia } from '@/types';
import {
  collection, getDocs, query, orderBy, limit, where,
} from 'firebase/firestore';

/** Hoy en formato YYYY-MM-DD según la TZ del servidor (Vercel usa UTC). */
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Cualquier partido EN VIVO de cualquier categoría, si existe. */
export async function getPartidoEnVivo(): Promise<(Partido & { categoria: CategoriaId }) | null> {
  const db = getDb();
  for (const cat of CATEGORIAS) {
    try {
      const snap = await getDocs(query(
        collection(db, colName('calendario', cat.id)),
        where('enVivo', '==', true),
        limit(1)
      ));
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data(), categoria: cat.id } as any;
      }
    } catch { /* col no existe */ }
  }
  return null;
}

/** Próximos N partidos (programados a futuro) de TODAS las categorías. */
export async function getProximosPartidos(n = 6): Promise<Partido[]> {
  const db = getDb();
  const today = todayISO();
  const all: Partido[] = [];

  for (const cat of CATEGORIAS) {
    try {
      const snap = await getDocs(query(
        collection(db, colName('calendario', cat.id)),
        orderBy('fechaAsignada', 'asc'),
        limit(40)
      ));
      snap.forEach(d => {
        const data = d.data() as any;
        if (data.estatus === 'programado' && (data.fechaAsignada || '') >= today) {
          all.push({ id: d.id, ...data, categoria: cat.id });
        }
      });
    } catch { /* col no existe */ }
  }

  return all
    .sort((a, b) => {
      const f = (a.fechaAsignada || '').localeCompare(b.fechaAsignada || '');
      if (f !== 0) return f;
      return (a.hora || '').localeCompare(b.hora || '');
    })
    .slice(0, n);
}

/** Últimos N resultados (partidos finalizados) de TODAS las categorías. */
export async function getUltimosResultados(n = 6): Promise<Partido[]> {
  const db = getDb();
  const all: Partido[] = [];

  for (const cat of CATEGORIAS) {
    try {
      const snap = await getDocs(query(
        collection(db, colName('calendario', cat.id)),
        orderBy('fechaAsignada', 'desc'),
        limit(20)
      ));
      snap.forEach(d => {
        const data = d.data() as any;
        if (data.estatus === 'finalizado') {
          all.push({ id: d.id, ...data, categoria: cat.id });
        }
      });
    } catch { /* col no existe */ }
  }

  return all
    .sort((a, b) => (b.fechaAsignada || '').localeCompare(a.fechaAsignada || ''))
    .slice(0, n);
}

/** Líder absoluto por estadística (puntos, rebotes, robos, etc) de una categoría. */
export type Lider = { jugador: Jugador; valor: number; promedio: number };

export async function getLideres(cat: CategoriaId, stat: keyof Jugador, n = 3): Promise<Lider[]> {
  const db = getDb();
  try {
    const snap = await getDocs(collection(db, colName('jugadores', cat)));
    const jugs: Jugador[] = [];
    snap.forEach(d => jugs.push({ id: d.id, ...d.data() } as Jugador));

    return jugs
      .filter(j => ((j[stat] as number) || 0) > 0)
      .map(j => {
        const valor = (j[stat] as number) || 0;
        const pj = j.partidosJugados || 1;
        return { jugador: j, valor, promedio: valor / pj };
      })
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, n);
  } catch { return []; }
}

/** Logos de equipos por categoría → Map<id, logoUrl>. */
export async function getEquipos(cat: CategoriaId): Promise<Map<string, Equipo>> {
  const db = getDb();
  const map = new Map<string, Equipo>();
  try {
    const snap = await getDocs(collection(db, colName('equipos', cat)));
    snap.forEach(d => map.set(d.id, { id: d.id, ...d.data() } as Equipo));
  } catch { /* col no existe */ }
  return map;
}

/** Últimas N noticias publicadas. */
export async function getNoticias(n = 3): Promise<Noticia[]> {
  const db = getDb();
  try {
    const snap = await getDocs(query(
      collection(db, 'noticias'),
      orderBy('fecha', 'desc'),
      limit(n)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Noticia));
  } catch { return []; }
}

/** Todos los partidos de una categoría (ordenados por fecha desc). */
export async function getPartidosPorCategoria(cat: CategoriaId, max = 300): Promise<Partido[]> {
  const db = getDb();
  try {
    const snap = await getDocs(query(
      collection(db, colName('calendario', cat)),
      orderBy('fechaAsignada', 'desc'),
      limit(max)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data(), categoria: cat } as Partido));
  } catch { return []; }
}
