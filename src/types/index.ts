// Tipos compartidos del dominio.

export interface Partido {
  id: string;
  categoria?: string;
  fechaAsignada?: string;
  hora?: string;
  estatus?: string;
  enVivo?: boolean;
  fase?: string;
  grupo?: string;
  esForfait?: boolean;
  inicioPartidoTs?: any;

  equipoLocalId?: string;
  equipoLocalNombre?: string;
  equipoVisitanteId?: string;
  equipoVisitanteNombre?: string;

  marcadorLocal?: number;
  marcadorVisitante?: number;
  cuartosLocal?: Record<string, number>;
  cuartosVisitante?: Record<string, number>;
}

export interface Equipo {
  id: string;
  nombre?: string;
  logoUrl?: string;
  grupo?: string;
  categoria?: string;
}

export interface Jugador {
  id: string;
  nombre?: string;
  numero?: number;
  equipoId?: string;
  equipoNombre?: string;
  grupo?: string;
  fotoUrl?: string;

  partidosJugados?: number;
  puntos?: number;
  rebotes?: number;
  asistencias?: number;
  robos?: number;
  bloqueos?: number;
  triples?: number;
  dobles?: number;
  tirosLibres?: number;
}

// Noticia: el modelo del usuario usa estos nombres en Firestore.
// Soporta nombres alternativos para compatibilidad con datos viejos.
export interface Noticia {
  id: string;
  titulo: string;

  // Cuerpo del artículo. Firestore usa 'cuerpo'; aceptamos 'contenido' también.
  cuerpo?: string;
  contenido?: string;

  // Fecha. Firestore actualmente usa string formateado en español
  // ("26 de febrero de 2026 a las 1:18:51 p.m. UTC-4") o Timestamp.
  fecha?: any;

  // URL de la imagen. Firestore usa 'imageUrl'; aceptamos 'imagenUrl' también.
  imageUrl?: string;
  imagenUrl?: string;

  // Tipo opcional: 'destacado' lleva la noticia al hero principal.
  tipo?: string;
}
