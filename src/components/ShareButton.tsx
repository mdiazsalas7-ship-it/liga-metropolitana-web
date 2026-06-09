'use client';

// Botón de compartir. Usa la Web Share API en mobile (abre el menú nativo
// con WhatsApp, Twitter, etc) y cae en "copiar al portapapeles" en desktop.

import { useState } from 'react';

export function ShareButton({
  title, text, url,
}: {
  title: string;
  text?: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
        return;
      } catch { /* usuario canceló o no soporta */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* nada */ }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-xs font-bold px-3 py-1.5 transition-colors"
    >
      {copied ? '✓ Copiado' : '🔗 Compartir'}
    </button>
  );
}
