// Formato de fechas legible en español.
// Acepta string YYYY-MM-DD, Firestore Timestamp (con .toDate o {seconds, nanoseconds}), o Date.

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function parseISO(s?: unknown): Date | null {
  if (s == null) return null;

  // String YYYY-MM-DD
  if (typeof s === 'string') {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) return null;
    const [y, m, d] = s.split('-').map(Number);
    if (!y) return null;
    return new Date(y, (m || 1) - 1, d || 1);
  }

  // Date instance
  if (s instanceof Date) return s;

  // Firestore Timestamp con .toDate()
  if (typeof s === 'object' && s !== null && typeof (s as any).toDate === 'function') {
    try { return (s as any).toDate(); } catch { return null; }
  }

  // Firestore Timestamp serializado (después de pasar por server): { seconds, nanoseconds }
  if (typeof s === 'object' && s !== null && typeof (s as any).seconds === 'number') {
    return new Date((s as any).seconds * 1000);
  }

  // Número (milliseconds since epoch)
  if (typeof s === 'number') return new Date(s);

  return null;
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
