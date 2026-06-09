// Logo de equipo con fallback a un círculo con las iniciales del nombre.

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
}: {
  nombre?: string;
  logoUrl?: string;
  size?: number;
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={nombre || 'logo'}
        width={size}
        height={size}
        className="rounded-full object-cover bg-white/5"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-white/10 text-white flex items-center justify-center font-bold"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {getInitials(nombre)}
    </div>
  );
}
