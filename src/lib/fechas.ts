// Formato de fechas legible en español. Operamos sobre strings YYYY-MM-DD
// para evitar problemas de zona horaria (los partidos no tienen hora exacta UTC).

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** "viernes 17 de mayo" */
export function fechaLarga(iso?: string): string {
  if (!iso) return '';
  const d = parseISO(iso);
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/** "17 may" — formato compacto para chips */
export function fechaCorta(iso?: string): string {
  if (!iso) return '';
  const d = parseISO(iso);
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0,3)}`;
}

/** "hoy" / "mañana" / "viernes 17 de mayo" */
export function fechaRelativa(iso?: string): string {
  if (!iso) return '';
  const today    = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const d = parseISO(iso); d.setHours(0,0,0,0);

  if (d.getTime() === today.getTime())    return 'Hoy';
  if (d.getTime() === tomorrow.getTime()) return 'Mañana';
  return fechaLarga(iso);
}
