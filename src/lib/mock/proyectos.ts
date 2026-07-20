import type { Proyecto } from "@/lib/types";

// Datos de arranque solo para construir la UI del Kanban en la Fase 1,
// mientras se conecta Supabase. No se persiste en el navegador: al
// recargar vuelve a este set inicial.
export const MOCK_PROYECTOS: Proyecto[] = [
  {
    id: "p1",
    nombre: "Meta Ads — Renters.mx",
    descripcion: "Campaña de generación de leads para el lanzamiento Q3.",
    prioridad: "alta",
    etiquetas: [{ nombre: "Meta Ads", color: "#3B5BDB" }],
    columna_kanban: "idea",
    iniciado_en_gantt: false,
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  },
  {
    id: "p2",
    nombre: "Rediseño landing — Clarity-PM",
    descripcion: "Nueva landing page para el producto interno.",
    prioridad: "media",
    etiquetas: [{ nombre: "Sitios web", color: "#0891B2" }],
    columna_kanban: "en_progreso",
    iniciado_en_gantt: true,
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  },
  {
    id: "p3",
    nombre: "Google Ads — CODI checkout",
    descripcion: "Optimización de campañas de búsqueda.",
    prioridad: "urgente",
    etiquetas: [{ nombre: "Google Ads", color: "#B91C1C" }],
    columna_kanban: "revision",
    iniciado_en_gantt: true,
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  },
];
