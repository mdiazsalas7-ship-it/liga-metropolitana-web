// Logo de equipo con fallback a un círculo con las iniciales.
// El color del círculo se deriva del nombre para que cada equipo tenga
// su propia identidad visual incluso sin logo.

const COLOR_POOL = [
  { bg: '#E6F1FB', fg: '#0C447C' }, // azul
  { bg: '#FAECE7', fg: '#993C1D' }, // coral
  { bg: '#E1F5EE', fg: '#085041' }, // teal
  { bg: '#EEEDFE', fg: '#3C3489' }, // purple
  { bg: '#FAEEDA', fg: '#633806' }, // amber
  { bg: '#FBEAF0', fg: '#72243E' }, // pink
  { bg: '#EAF3DE', fg: '#27500A' }, // green
  { bg: '#FCEBEB', fg: '#791F1F' }, // red
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
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={nombre || 'logo'}
        width={size}
        height={size}
        className={'rounded-full object-cover bg-white ' + (ring ? 'ring-2 ring-white shadow-sm' : '')}
        style={{ width: size, height: size }}
      />
    );
  }
  const c = hashColor(nombre);
  return (
    <div
      className={'rounded-full flex items-center justify-center font-extrabold ' + (ring ? 'ring-2 ring-white shadow-sm' : '')}
      style={{
        width: size, height: size,
        fontSize: Math.max(size * 0.34, 10),
        background: c.bg,
        color: c.fg,
      }}
    >
      {getInitials(nombre)}
    </div>
  );
}
