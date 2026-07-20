export type Prioridad = "baja" | "media" | "alta" | "urgente";

export type ColumnaKanban = "idea" | "en_progreso" | "revision" | "completado";

export interface Etiqueta {
  nombre: string;
  color: string;
}

export interface ChecklistItem {
  texto: string;
  hecho: boolean;
  asignado_a?: string;
}

export interface Comentario {
  autor: string;
  texto: string;
  fecha: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  prioridad: Prioridad;
  etiquetas: Etiqueta[];
  columna_kanban: ColumnaKanban;
  iniciado_en_gantt: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Actividad {
  id: string;
  proyecto_id: string;
  parent_id: string | null;
  titulo: string;
  descripcion: string;
  seccion: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  progreso: number;
  prioridad: Prioridad;
  etiquetas: Etiqueta[];
  dependencias: string[];
  checklist: ChecklistItem[];
  comentarios: Comentario[];
  asignado_a: string | null;
}

export const COLUMNAS: { id: ColumnaKanban; titulo: string }[] = [
  { id: "idea", titulo: "Ideas" },
  { id: "en_progreso", titulo: "En progreso" },
  { id: "revision", titulo: "Revisión" },
  { id: "completado", titulo: "Completado" },
];

export const PRIORIDADES: Prioridad[] = ["baja", "media", "alta", "urgente"];

export const ETIQUETA_COLORES = [
  "#3B5BDB",
  "#15803D",
  "#B45309",
  "#B91C1C",
  "#7C3AED",
  "#0891B2",
];
