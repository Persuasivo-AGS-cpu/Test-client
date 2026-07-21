import { addDays, todayISO } from "@/lib/dates";
import type { Actividad } from "@/lib/types";

const hoy = todayISO();

function tarea(input: Partial<Actividad> & { id: string; titulo: string }): Actividad {
  return {
    proyecto_id: "p2",
    parent_id: null,
    descripcion: "",
    seccion: null,
    fecha_inicio: null,
    fecha_fin: null,
    progreso: 0,
    prioridad: "media",
    etiquetas: [],
    dependencias: [],
    checklist: [],
    comentarios: [],
    asignado_a: null,
    ...input,
  };
}

// Datos de arranque para construir y probar el Gantt (Fase 4) mientras se
// conecta Supabase. No se persiste en el navegador.
export const MOCK_ACTIVIDADES: Actividad[] = [
  tarea({
    id: "a1",
    titulo: "Wireframes de la landing",
    seccion: "Fase 1 · Diseño",
    fecha_inicio: addDays(hoy, -6),
    fecha_fin: addDays(hoy, -1),
    progreso: 100,
    asignado_a: "Abraham",
    etiquetas: [{ nombre: "Sitios web", color: "#0891B2" }],
  }),
  tarea({
    id: "a2",
    titulo: "Diseño visual final",
    seccion: "Fase 1 · Diseño",
    fecha_inicio: hoy,
    fecha_fin: addDays(hoy, 4),
    progreso: 40,
    asignado_a: "Abraham",
    etiquetas: [{ nombre: "Sitios web", color: "#0891B2" }],
  }),
  tarea({
    id: "a2s1",
    parent_id: "a2",
    titulo: "Revisión de paleta y tipografía",
    seccion: "Fase 1 · Diseño",
    fecha_inicio: hoy,
    fecha_fin: addDays(hoy, 1),
    progreso: 60,
  }),
  tarea({
    id: "a3",
    titulo: "Maquetación en Next.js",
    seccion: "Fase 2 · Desarrollo",
    fecha_inicio: addDays(hoy, 5),
    fecha_fin: addDays(hoy, 12),
    progreso: 0,
    asignado_a: "Abraham",
  }),
  tarea({
    id: "a4",
    titulo: "QA y ajustes finales",
    seccion: "Fase 2 · Desarrollo",
    fecha_inicio: addDays(hoy, 13),
    fecha_fin: addDays(hoy, 16),
    progreso: 0,
  }),
  tarea({
    id: "a5",
    titulo: "Definir estructura de contenidos",
    proyecto_id: "p2",
  }),
];
