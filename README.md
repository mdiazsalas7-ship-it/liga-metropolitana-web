# Liga Metropolitana Eje Este — Sitio Web

Sitio público de solo lectura para la Liga Metropolitana Eje Este.
Lee datos en tiempo real del mismo Firestore que la app de administración.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** para estilos
- **Firebase Firestore** para datos (solo lectura)
- **Vercel** para hosting

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Deploy a Vercel

1. Conectar el repo a Vercel (`vercel.com/new`).
2. Framework: Next.js (autodetecta).
3. Deploy.

No requiere variables de entorno — las credenciales públicas de Firebase
están embebidas en `src/lib/firebase.ts` (esto es seguro: la protección
de escritura está en las Security Rules de Firestore).

## Estructura

```
src/
  app/
    layout.tsx        # Header + Footer compartido
    page.tsx          # Home
    globals.css       # CSS base
  components/
    SiteHeader.tsx
    SiteFooter.tsx
  lib/
    firebase.ts       # Conexión a Firestore
    categorias.ts     # Configuración de categorías
  types/
    index.ts          # Tipos de dominio
```

## Roadmap

- [x] **Fase 1 — Cimientos**: setup del proyecto, deploy inicial
- [ ] **Fase 2 — Páginas principales**: home con datos reales, calendario, partido, equipos, jugadores
- [ ] **Fase 3 — Polish**: tabla de posiciones, noticias completas, OpenGraph, optimizaciones
- [ ] **Fase 4 — Lanzamiento**: dominio propio, testing final
