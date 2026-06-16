// Página institucional de la liga: historia, categorías, sedes y contacto.
// URL: /liga

import Link from 'next/link';
import type { Metadata } from 'next';
import {
  INSTAGRAM_URL, TIKTOK_URL, YOUTUBE_URL,
  WHATSAPP_NUMERO, WHATSAPP_URL, CONTACTO_EMAIL,
  LEAGUE_LOGO_URL,
} from '@/lib/site';
import { CATEGORIAS } from '@/lib/categorias';

export const metadata: Metadata = {
  title: 'La Liga',
  description:
    'Liga Metropolitana de Baloncesto del Eje Este del Estado Aragua (L.I.M.B.E.A.): historia, categorías, sedes y contacto.',
};

const SEDES = [
  {
    nombre: 'Cancha 23 de Enero',
    detalle: 'Casa principal · Cancha de usos múltiples',
    direccion: 'San Mateo — Municipio Bolívar, Aragua',
  },
  {
    nombre: 'Cancha Carlos Salas',
    detalle: 'Sede de desarrollo y competición',
    direccion: 'San Mateo — Municipio Bolívar, Aragua',
  },
  {
    nombre: 'Cancha Madera 15',
    detalle: 'Sede de desarrollo y competición',
    direccion: 'La Victoria — Municipio José Félix Ribas, Aragua',
  },
];

const FICHA = [
  { k: 'Nombre oficial', v: 'Asociación Civil Deportiva Liga Metropolitana de Baloncesto del Eje Este del Estado Aragua (L.I.M.B.E.A.)' },
  { k: 'Carácter jurídico', v: 'Asociación Civil sin fines de lucro' },
  { k: 'Registro legal', v: 'Registro Público de los Municipios José Félix Ribas, José Rafael Revenga, Santos Michelena, Bolívar y Tovar del Estado Aragua — La Victoria (Nº 47, folio 509, Tomo 1, Año 2026)' },
  { k: 'Afiliaciones', v: 'Asociación de Baloncesto del Estado Aragua · Federación Venezolana de Baloncesto (F.V.B.)' },
  { k: 'Liderazgo', v: 'Edisson Zea Gamboa y Manuel Alejandro Díaz Salas' },
];

export default function LigaPage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">

      {/* HERO */}
      <section
        className="rounded-2xl text-white p-7 sm:p-10 shadow-card relative overflow-hidden border border-[var(--color-border)]"
        style={{
          background:
            'radial-gradient(700px 320px at 90% 0%, rgba(255,90,48,0.20), transparent 60%), linear-gradient(135deg, var(--color-navy), var(--color-bg-alt))',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white ring-2 ring-white/10 flex-shrink-0">
            <img src={LEAGUE_LOGO_URL} alt="L.I.M.B.E.A." className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-liga-coral text-white text-[10px] font-extrabold tracking-[0.14em] px-3 py-1 uppercase">
              L.I.M.B.E.A.
            </span>
            <h1 className="mt-2 text-2xl sm:text-4xl font-extrabold leading-none tracking-tight">
              Liga Metropolitana de Baloncesto
              <span className="block text-liga-coral mt-1">del Eje Este · Estado Aragua</span>
            </h1>
          </div>
        </div>
      </section>

      {/* MISIÓN */}
      <section>
        <h2 className="text-xs font-extrabold tracking-[0.13em] text-[var(--color-text)] uppercase mb-3 border-b-2 border-liga-coral pb-2">
          Nuestra misión
        </h2>
        <div className="space-y-4 text-[15px] sm:text-base text-[var(--color-text)] leading-relaxed text-justify hyphens-auto">
          <p>
            La Asociación Civil Deportiva Liga Metropolitana de Baloncesto del Eje Este del Estado Aragua —conocida por sus siglas <strong>L.I.M.B.E.A.</strong>— es una organización deportiva sin fines de lucro, legalmente constituida para ser el motor del deporte en nuestra región.
          </p>
          <p>
            Nuestro objetivo fundamental es la masificación de la práctica del baloncesto, con foco en la inclusión de niños, niñas, adolescentes y la población en general. Más allá de lo competitivo, promovemos valores que mejoran la calidad de vida de nuestros atletas a través de un aprendizaje integral, con fundamento socioeducativo, recreativo y deportivo.
          </p>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section>
        <h2 className="text-xs font-extrabold tracking-[0.13em] text-[var(--color-text)] uppercase mb-3 border-b-2 border-liga-coral pb-2">
          Estructura competitiva
        </h2>
        <p className="text-[15px] sm:text-base text-[var(--color-text)] leading-relaxed text-justify hyphens-auto mb-5">
          Organizamos campeonatos, torneos y clínicas para todos los niveles. Una estructura amplia y progresiva: desde las bases formativas con el <strong>mini basket</strong>, pasando por todo el ciclo de desarrollo juvenil hasta la categoría <strong>U20</strong>, y abriendo espacios para la competición adulta y laboral con nuestros torneos <strong>Interindustriales</strong>.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIAS.map(c => (
            <Link
              key={c.id}
              href={`/posiciones/${c.id}`}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-card card-hover px-4 py-5 text-center relative overflow-hidden group"
            >
              <p className="font-extrabold text-sm text-[var(--color-text)]">{c.label}</p>
              <p className="text-[11px] text-liga-coral mt-1 font-bold">Ver tabla →</p>
              <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-liga-coral scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
            </Link>
          ))}
        </div>
      </section>

      {/* SEDES */}
      <section>
        <h2 className="text-xs font-extrabold tracking-[0.13em] text-[var(--color-text)] uppercase mb-3 border-b-2 border-liga-coral pb-2">
          Sedes y canchas
        </h2>
        <p className="text-[15px] sm:text-base text-[var(--color-text)] leading-relaxed text-justify hyphens-auto mb-5">
          El epicentro de nuestra acción deportiva se concentra en instalaciones estratégicas del eje este, donde se forma el talento de la región.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEDES.map(s => (
            <div key={s.nombre} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">📍</span>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-[var(--color-text)]">{s.nombre}</h3>
                  <p className="text-[11px] text-liga-coral font-bold uppercase tracking-wider mt-0.5">{s.detalle}</p>
                  <p className="text-sm text-[var(--color-text-dim)] mt-2 leading-relaxed">{s.direccion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AVAL INSTITUCIONAL */}
      <section>
        <h2 className="text-xs font-extrabold tracking-[0.13em] text-[var(--color-text)] uppercase mb-3 border-b-2 border-liga-coral pb-2">
          Aval institucional
        </h2>
        <p className="text-[15px] sm:text-base text-[var(--color-text)] leading-relaxed text-justify hyphens-auto mb-5">
          La L.I.M.B.E.A. está debidamente registrada y reconocida por la Asociación de Baloncesto del Estado Aragua, y afiliada a la Federación Venezolana de Baloncesto (F.V.B.). Este aval nos permite dirigir, coordinar y respaldar oficialmente las actuaciones de todos los clubes afiliados, proyectando a nuestros jugadores en competencias zonales y nacionales. La liga fue protocolizada oficialmente en La Victoria el 20 de febrero de 2026.
        </p>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-card divide-y divide-[var(--color-border)]">
          {FICHA.map(f => (
            <div key={f.k} className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
              <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">{f.k}</p>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">{f.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section>
        <h2 className="text-xs font-extrabold tracking-[0.13em] text-[var(--color-text)] uppercase mb-3 border-b-2 border-liga-coral pb-2">
          Contacto
        </h2>
        <p className="text-[15px] sm:text-base text-[var(--color-text)] leading-relaxed text-justify hyphens-auto mb-5">
          Para inscripciones, alianzas estratégicas, patrocinios o más información sobre los torneos, escribinos:
        </p>

        {/* WhatsApp destacado */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-xl border border-liga-final/40 bg-liga-finalSoft hover:bg-liga-final/20 transition-colors p-5 mb-4"
        >
          <span className="text-3xl">💬</span>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-liga-final font-bold">WhatsApp</p>
            <p className="text-lg font-extrabold text-[var(--color-text)]">{WHATSAPP_NUMERO}</p>
          </div>
          <span className="ml-auto text-liga-final font-extrabold text-sm">Escribir →</span>
        </a>

        {/* Email (si está configurado) */}
        {CONTACTO_EMAIL && (
          <a
            href={`mailto:${CONTACTO_EMAIL}`}
            className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-2)] transition-colors p-5 mb-4"
          >
            <span className="text-3xl">✉️</span>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim2)] font-bold">Email</p>
              <p className="text-lg font-extrabold text-[var(--color-text)]">{CONTACTO_EMAIL}</p>
            </div>
          </a>
        )}

        {/* Redes */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-2)] hover:border-liga-coral/40 px-4 py-2 text-xs font-bold text-[var(--color-text)] transition-colors">
            Instagram
          </a>
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-2)] hover:border-liga-coral/40 px-4 py-2 text-xs font-bold text-[var(--color-text)] transition-colors">
            TikTok
          </a>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-2)] hover:border-liga-coral/40 px-4 py-2 text-xs font-bold text-[var(--color-text)] transition-colors">
            YouTube
          </a>
        </div>
      </section>
    </div>
  );
}
