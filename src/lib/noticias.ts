// Helpers para leer campos de noticias. El modelo del usuario usa 'imageUrl' y
// 'cuerpo' en Firestore, pero por compatibilidad aceptamos también los alternativos.

import type { Noticia } from '@/types';

export function imagenDeNoticia(n: Noticia): string | undefined {
  return n.imageUrl ?? n.imagenUrl ?? undefined;
}

export function cuerpoDeNoticia(n: Noticia): string | undefined {
  return n.cuerpo ?? n.contenido ?? undefined;
}

export function esDestacada(n: Noticia): boolean {
  return (n.tipo || '').toLowerCase() === 'destacado';
}
