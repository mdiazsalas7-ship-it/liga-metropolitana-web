// Formato de fechas legible en español.
// Acepta string YYYY-MM-DD, Firestore Timestamp (con .toDate o {seconds, nanoseconds}), o Date.

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function parseISO(s?: unknown): Date | null {
  if (s == null) return null;

  // String
  if (typeof s === 'string') {
    const str = s.trim();
    if (!str) return null;

    // YYYY-MM-DD
    if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
      const [y, m, d] = str.split('-').map(Number);
      if (!y) return null;
      return new Date(y, (m || 1) - 1, d || 1);
    }

    // Español: "26 de febrero de 2026 a las 1:18:51 p.m. UTC-4"
    const low = str.toLowerCase();
    const fechaMatch = low.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})/);
    if (fechaMatch) {
      const dia  = parseInt(fechaMatch[1], 10);
      const mes  = MESES.indexOf(fechaMatch[2]);
      const anio = parseInt(fechaMatch[3], 10);
      if (mes >= 0) {
        let hh = 0, mm = 0, ss = 0;
        const horaMatch = low.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/);
        if (horaMatch) {
          hh = parseInt(horaMatch[1], 10);
          mm = parseInt(horaMatch[2], 10);
          ss = horaMatch[3] ? parseInt(horaMatch[3], 10) : 0;
          const ap = (horaMatch[4] || '').replace(/[\s.]/g, '');
          if (ap === 'pm' && hh < 12) hh += 12;
          if (ap === 'am' && hh === 12) hh = 0;
        }
        return new Date(anio, mes, dia, hh, mm, ss);
      }
    }

    // Último intento: que el motor parsee lo que pueda (ISO completo, etc.)
    const dp = Date.parse(str);
    if (!Number.isNaN(dp)) return new Date(dp);
    return null;
  }

  // Date instance
  if (s instanceof Date) return s;

  // Firestore Timestamp con .toDate()
  if (typeof s === 'object' && s !== null && typeof (s as any).toDate === 'function') {
    try { return (s as any).toDate(); } catch { return null; }
  }

  // Firestore Timestamp serializado: { seconds, nanoseconds } o { _seconds }
  if (typeof s === 'object' && s !== null) {
    const secs = (s as any).seconds ?? (s as any)._seconds;
    if (typeof secs === 'number') return new Date(secs * 1000);
  }

  // Número (milliseconds since epoch, o segundos)
  if (typeof s === 'number') return new Date(s < 1e12 ? s * 1000 : s);

  return null;
}

/** Milisegundos para ordenar cronológicamente. 0 si no se pudo parsear. */
export function fechaMs(iso?: unknown): number {
  const d = parseISO(iso);
  return d ? d.getTime() : 0;
}

/** "viernes 17 de mayo" — devuelve "" si la fecha es inválida. */
export function fechaLarga(iso?: unknown): string {
  const d = parseISO(iso);
  if (!d) return '';
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/** "17 may" — formato compacto */
export function fechaCorta(iso?: unknown): string {
  const d = parseISO(iso);
  if (!d) return '';
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0,3)}`;
}

/** "Hoy" / "Mañana" / "viernes 17 de mayo" */
export function fechaRelativa(iso?: unknown): string {
  const d = parseISO(iso);
  if (!d) return '';
  const today    = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const target = new Date(d); target.setHours(0,0,0,0);

  if (target.getTime() === today.getTime())    return 'Hoy';
  if (target.getTime() === tomorrow.getTime()) return 'Mañana';
  return fechaLarga(d);
}
