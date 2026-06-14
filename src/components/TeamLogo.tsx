// Logo de equipo con fallback a un círculo con las iniciales.
// El color del círculo se deriva del nombre para que cada equipo tenga
// su propia identidad visual incluso sin logo. Paleta pensada para fondo oscuro.

const COLOR_POOL = [
  { bg: '#13315c', fg: '#9ec5ff' }, // azul
  { bg: '#3b1d12', fg: '#ffb38a' }, // coral
  { bg: '#10362e', fg: '#7ff0cf' }, // teal
  { bg: '#241b4d', fg: '#c3b4ff' }, // purple
  { bg: '#3a2a06', fg: '#ffda8a' }, // amber
  { bg: '#3a0f22', fg: '#ff9bc0' }, // pink
  { bg: '#1c3a0c', fg: '#bff08a' }, // green
  { bg: '#3a1010', fg: '#ff9b9b' }, // red
];

function hashColor(nombre?: string) {
  if (!nombre) return COLOR_POOL[0];
  let h = 0;
  for (let i = 0; i < nombre.length; i++) {
    h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
  }
  return COLOR_POOL[h % COLOR_POOL.length];
}

function getInitials(nombre?: string): string {
  if (!nombre) return '??';
  const words = nombre.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function TeamLogo({
  nombre,
  logoUrl,
  size = 36,
  ring = false,
}: {
  nombre?: string;
  logoUrl?: string;
  size?: number;
  ring?: boolean;
}) {
  // ring oscuro: doble halo (fondo + borde sutil) para separar del fondo negro
  const ringStyle = ring
    ? { boxShadow: '0 0 0 2px var(--color-bg), 0 0 0 3px var(--color-border-strong)' }
    : undefined;

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={nombre || 'logo'}
        width={size}
        height={size}
        className="rounded-full object-cover bg-white"
        style={{ width: size, height: size, ...ringStyle }}
      />
    );
  }
  const c = hashColor(nombre);
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold"
      style={{
        width: size, height: size,
        fontSize: Math.max(size * 0.34, 10),
        background: c.bg,
        color: c.fg,
        ...ringStyle,
      }}
    >
      {getInitials(nombre)}
    </div>
  );
}
