// Constantes globales del sitio.
// Cuando se compre el dominio, actualizar SITE_URL acá y todo el sitio se entera.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ?? 'https://liga-metropolitana-web.vercel.app';

export const SITE_NAME = 'Liga Metropolitana Eje Este';
export const SITE_DESC =
  'Resultados, calendario, estadísticas y noticias de la Liga Metropolitana Eje Este. Sigue todos los partidos en vivo.';

export const APP_URL = 'https://estadisticasavanzadas.vercel.app';

// Logo principal de la liga — mismo que usa la app.
export const LEAGUE_LOGO_URL = 'https://i.postimg.cc/hhF5fTPn/image.png';

// Redes sociales
export const INSTAGRAM_URL = 'https://www.instagram.com/liga_metropolitana_eje_este';
export const TIKTOK_URL    = 'https://www.tiktok.com/@liga_metropolitana_eje';
export const YOUTUBE_URL   = 'https://www.youtube.com/@limbearagua';

// Contacto
// WhatsApp: 0424-3740258 → formato internacional Venezuela (+58, sin el 0 inicial)
export const WHATSAPP_NUMERO  = '0424-3740258';
export const WHATSAPP_URL     = 'https://wa.me/584243740258';
export const CONTACTO_EMAIL: string = ''; // ← completar cuando tengan email oficial
