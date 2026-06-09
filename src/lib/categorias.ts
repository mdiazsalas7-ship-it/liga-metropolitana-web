// Categorías de la liga. Espejo de las que usa la app.
// Importante: MASTER40 usa colecciones SIN sufijo (calendario, jugadores, equipos).

export const CATEGORIAS = [
  { id: 'INTERINDUSTRIAL', label: 'Interindustrial' },
  { id: 'U16_FEMENINO',    label: 'U16 Femenino' },
  { id: 'U16M',            label: 'U16M' },
  { id: 'MASTER40',        label: 'Master 40' },
  { id: 'LIBRE',           label: 'Libre' },
] as const;

export type CategoriaId = typeof CATEGORIAS[number]['id'];

/** Devuelve el nombre real de una colección de Firestore para una categoría. */
export function colName(base: 'calendario' | 'equipos' | 'jugadores', cat: CategoriaId | string): string {
  return cat === 'MASTER40' ? base : `${base}_${cat}`;
}
