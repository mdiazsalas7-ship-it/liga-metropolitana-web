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
        const fecha = typeof data.fechaAsignada === 'string' ? data.fechaAsignada : '';
        if (data.estatus === 'programado' && fecha >= today) {
          all.push({ id: d.id, ...data, fechaAsignada: fecha, categoria: cat.id });
        }
      });
    } catch { /* col no existe */ }
  }

  return all
    .sort((a, b) => {
      const fa = typeof a.fechaAsignada === 'string' ? a.fechaAsignada : '';
      const fb = typeof b.fechaAsignada === 'string' ? b.fechaAsignada : '';
      const f = fa.localeCompare(fb);
      if (f !== 0) return f;
      const ha = typeof a.hora === 'string' ? a.hora : '';
      const hb = typeof b.hora === 'string' ? b.hora : '';
      return ha.localeCompare(hb);
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
          const fecha = typeof data.fechaAsignada === 'string' ? data.fechaAsignada : '';
          all.push({ id: d.id, ...data, fechaAsignada: fecha, categoria: cat.id });
        }
      });
    } catch { /* col no existe */ }
  }

  return all
    .sort((a, b) => {
      const fa = typeof a.fechaAsignada === 'string' ? a.fechaAsignada : '';
      const fb = typeof b.fechaAsignada === 'string' ? b.fechaAsignada : '';
      return fb.localeCompare(fa);
    })
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
  } catch {
    // Fallback: leer sin orderBy (por si el campo fecha no es ordenable)
    try {
      const snap = await getDocs(query(collection(db, 'noticias'), limit(50)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Noticia)).slice(0, n);
    } catch { return []; }
  }
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
    return snap.docs.map(d => {
      const data = d.data() as any;
      return {
        id: d.id,
        ...data,
        // Normalizar fechaAsignada a string (por si vino como Timestamp)
        fechaAsignada: typeof data.fechaAsignada === 'string' ? data.fechaAsignada : '',
        categoria: cat,
      } as Partido;
    });
  } catch { return []; }
}

/** Partido individual por ID + categoría. */
export async function getPartidoById(cat: CategoriaId, id: string): Promise<Partido | null> {
  const db = getDb();
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const ref = doc(db, colName('calendario', cat), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    return {
      id: snap.id,
      ...data,
      fechaAsignada: typeof data.fechaAsignada === 'string' ? data.fechaAsignada : '',
      categoria: cat,
    } as Partido;
  } catch { return null; }
}

/** Stats por jugador de un partido.
 *  IMPORTANTE: `equipo` es el NOMBRE del equipo (ej. "ESPARTANOS"), no 'local'|'visitante'.
 *  `equipoId` puede o no estar — comparamos primero por id y caemos al nombre. */
export interface StatPartido {
  jugadorId: string;
  nombre?: string;
  numero?: number | string;
  equipo?: string;        // nombre del equipo
  equipoId?: string;      // id del equipo (puede no existir en datos viejos)
  fotoUrl?: string;
  dobles: number;
  triples: number;
  tirosLibres: number;
  rebotes: number;
  robos: number;
  bloqueos: number;
}

export async function getStatsDePartido(partidoId: string): Promise<StatPartido[]> {
  const db = getDb();
  try {
    const snap = await getDocs(query(
      collection(db, 'stats_partido'),
      where('partidoId', '==', partidoId)
    ));
    return snap.docs.map(d => {
      const data = d.data() as any;
      return {
        jugadorId:   data.jugadorId,
        nombre:      data.nombre,
        numero:      data.numero,
        equipo:      data.equipo,
        equipoId:    data.equipoId,
        fotoUrl:     data.fotoUrl,
        dobles:      data.dobles      || 0,
        triples:     data.triples     || 0,
        tirosLibres: data.tirosLibres || 0,
        rebotes:     data.rebotes     || 0,
        robos:       data.robos       || 0,
        bloqueos:    data.bloqueos    || 0,
      };
    });
  } catch { return []; }
}

/** Jugadas (play-by-play) de un partido, orden cronológico DESC. */
export interface JugadaPartido {
  id: string;
  partidoId: string;
  jugadorId: string;
  jugadorNombre?: string;
  jugadorNumero?: string | number;
  equipo: 'local' | 'visitante';
  accion: string;
  puntos: number;
  cuarto?: string;
  timestamp?: any;
  jugadorSaleId?: string;
  jugadorSaleNombre?: string;
  jugadorSaleNumero?: string | number;
}

export async function getJugadasDePartido(partidoId: string, max = 300): Promise<JugadaPartido[]> {
  const db = getDb();
  try {
    const snap = await getDocs(query(
      collection(db, 'jugadas_partido'),
      where('partidoId', '==', partidoId),
      orderBy('timestamp', 'desc'),
      limit(max)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as JugadaPartido));
  } catch { return []; }
}

/** Equipo individual por ID + categoría (incluye roster). */
export async function getEquipoById(cat: CategoriaId, equipoId: string): Promise<Equipo | null> {
  const db = getDb();
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const ref = doc(db, colName('equipos', cat), equipoId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Equipo;
  } catch { return null; }
}

/** Roster (jugadores) de un equipo. */
export async function getJugadoresDeEquipo(cat: CategoriaId, equipoId: string): Promise<Jugador[]> {
  const db = getDb();
  try {
    const snap = await getDocs(query(
      collection(db, colName('jugadores', cat)),
      where('equipoId', '==', equipoId)
    ));
    const arr = snap.docs.map(d => ({ id: d.id, ...d.data() } as Jugador));
    return arr.sort((a, b) => (a.numero ?? 999) - (b.numero ?? 999));
  } catch { return []; }
}

/** Jugador individual por ID + categoría. */
export async function getJugadorById(cat: CategoriaId, jugadorId: string): Promise<Jugador | null> {
  const db = getDb();
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const ref = doc(db, colName('jugadores', cat), jugadorId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Jugador;
  } catch { return null; }
}

/** Stats por partido de un jugador específico. */
export async function getStatsDeJugador(jugadorId: string): Promise<(StatPartido & { partidoId: string })[]> {
  const db = getDb();
  try {
    const snap = await getDocs(query(
      collection(db, 'stats_partido'),
      where('jugadorId', '==', jugadorId)
    ));
    return snap.docs.map(d => {
      const data = d.data() as any;
      return {
        jugadorId:   data.jugadorId,
        nombre:      data.nombre,
        numero:      data.numero,
        equipo:      data.equipo,
        equipoId:    data.equipoId,
        fotoUrl:     data.fotoUrl,
        dobles:      data.dobles      || 0,
        triples:     data.triples     || 0,
        tirosLibres: data.tirosLibres || 0,
        rebotes:     data.rebotes     || 0,
        robos:       data.robos       || 0,
        bloqueos:    data.bloqueos    || 0,
        partidoId:   data.partidoId,
      };
    });
  } catch { return []; }
}

/** Todos los jugadores de una categoría (para listados de líderes). */
export async function getJugadoresPorCategoria(cat: CategoriaId): Promise<Jugador[]> {
  const db = getDb();
  try {
    const snap = await getDocs(collection(db, colName('jugadores', cat)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Jugador));
  } catch { return []; }
}

/** Todas las noticias (para la página listado). */
export async function getTodasNoticias(): Promise<Noticia[]> {
  const db = getDb();
  try {
    const snap = await getDocs(query(
      collection(db, 'noticias'),
      orderBy('fecha', 'desc'),
      limit(50)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Noticia));
  } catch { return []; }
}

/** Una noticia puntual por su ID (para la página de detalle). */
export async function getNoticiaById(id: string): Promise<Noticia | null> {
  const db = getDb();
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'noticias', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Noticia;
  } catch {
    return null;
  }
}

/** Para el strip de partidos del home: trae EN VIVO + próximos + recientes
 *  de TODAS las categorías. Ordenado por relevancia (live primero, después fecha). */
export async function getPartidosParaStrip(): Promise<Partido[]> {
  const db = getDb();
  const today = todayISO();
  const all: Partido[] = [];

  for (const cat of CATEGORIAS) {
    try {
      const snap = await getDocs(query(
        collection(db, colName('calendario', cat.id)),
        orderBy('fechaAsignada', 'desc'),
        limit(40)
      ));
      snap.forEach(d => {
        const data = d.data() as any;
        const fecha = typeof data.fechaAsignada === 'string' ? data.fechaAsignada : '';
        const isLive = data.enVivo === true && data.estatus !== 'finalizado';
        const isFinal = data.estatus === 'finalizado';
        const upcoming = data.estatus === 'programado' && fecha >= today;
        if (isLive || isFinal || upcoming) {
          all.push({ id: d.id, ...data, fechaAsignada: fecha, categoria: cat.id });
        }
      });
    } catch { /* col no existe */ }
  }
  return all;
}

/** Entrevistas (videos). Ordenadas por createdAt desc. */
export async function getEntrevistas(n = 12): Promise<import('@/types').Entrevista[]> {
  const db = getDb();
  try {
    // createdAt es number ms; orderBy funciona perfecto
    const snap = await getDocs(query(
      collection(db, 'entrevistas'),
      orderBy('createdAt', 'desc'),
      limit(n)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as import('@/types').Entrevista));
  } catch {
    // Fallback: sin orderBy si createdAt no existe en algunos docs
    try {
      const snap = await getDocs(query(collection(db, 'entrevistas'), limit(50)));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as import('@/types').Entrevista));
      return all.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)).slice(0, n);
    } catch { return []; }
  }
}
