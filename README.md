# Clarity-PM

Herramienta interna de gestión de proyectos para Persuasivo: Kanban de proyectos + Gantt de actividades, con login restringido por Google OAuth y persistencia en Supabase.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Radix UI + dnd-kit
- Supabase (Postgres, Auth, RLS)
- Vercel (deploy)

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con las credenciales de Supabase
npm run dev
```

## Base de datos

El esquema vive en `supabase/migrations/`. Aplícalo al proyecto de Supabase con:

```bash
supabase db push
```

o pégalo directamente en el SQL editor del dashboard.
