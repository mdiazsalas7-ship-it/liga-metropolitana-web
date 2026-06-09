// Tipos compartidos en todo el sitio. Espejo de la app.

export interface Partido {
  id: string;
  categoria?: string;
  fechaAsignada?: string;
  hora?: string;
  estatus?: 'programado' | 'finalizado' | string;
  fase?: string;
  grupo?: string;
  equipoLocalId?: string;
  equipoLocalNombre?: string;
  equipoVisitanteId?: string;
  equipoVisitanteNombre?: string;
  marcadorLocal?: number;
  marcadorVisitante?: number;
  enVivo?: boolean;
  cuartosLocal?: Record<string, number>;
  cuartosVisitante?: Record<string, number>;
}

export interface Equipo {
  id: string;
  nombre: string;
  logoUrl?: string;
  grupo?: string;
  categoria?: string;
}

export interface Jugador {
  id: string;
  nombre: string;
  cedula?: string;
  numero?: number;
  equipoId?: string;
  equipoNombre?: string;
  categoria?: string;
  grupo?: string;
  fotoUrl?: string;
  puntos?: number;
  rebotes?: number;
  robos?: number;
  bloqueos?: number;
  asistencias?: number;
  dobles?: number;
  triples?: number;
  tirosLibres?: number;
  faltas?: number;
  partidosJugados?: number;
}

export interface Noticia {
  id: string;
  titulo: string;
  contenido?: string;
  fecha?: string;
  imagenUrl?: string;
}
