"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { MOCK_PROYECTOS } from "@/lib/mock/proyectos";
import { MOCK_ACTIVIDADES } from "@/lib/mock/actividades";
import { AUTOR_ACTUAL } from "@/lib/constants";
import { addDays } from "@/lib/dates";
import { COLUMNAS } from "@/lib/types";
import type {
  Actividad,
  ChecklistItem,
  ColumnaKanban,
  Etiqueta,
  LogEntry,
  Prioridad,
  Proyecto,
} from "@/lib/types";

interface ClarityStore {
  proyectos: Proyecto[];
  actividades: Actividad[];
  log: LogEntry[];

  getProyecto: (id: string) => Proyecto | undefined;
  getActividadesDeProyecto: (proyectoId: string) => Actividad[];
  getLogDeProyecto: (proyectoId: string) => LogEntry[];

  createProyecto: (input: {
    nombre: string;
    descripcion: string;
    prioridad: Prioridad;
    etiqueta: string;
    color: string;
  }) => void;

  moverProyecto: (id: string, columna: ColumnaKanban) => void;
  renombrarProyecto: (id: string, nombre: string) => void;
  editarDescripcion: (id: string, descripcion: string) => void;
  agregarEtiqueta: (id: string, etiqueta: Etiqueta) => void;
  quitarEtiqueta: (id: string, nombre: string) => void;
  setFechas: (
    id: string,
    fechaInicio: string | null,
    fechaFin: string | null,
  ) => void;
  agregarChecklistItem: (id: string, texto: string) => void;
  toggleChecklistItem: (id: string, index: number) => void;
  agregarMiembro: (id: string, nombre: string) => void;
  quitarMiembro: (id: string, nombre: string) => void;
  agregarComentario: (id: string, texto: string) => void;
  iniciarGantt: (id: string) => void;

  agregarActividad: (
    proyectoId: string,
    titulo: string,
    opciones?: { seccion?: string | null; parentId?: string | null },
  ) => void;
  crearTareaProgramada: (input: {
    proyectoId: string;
    titulo: string;
    seccion: string;
    fechaInicio: string;
    fechaFin: string;
  }) => void;
  getActividad: (id: string) => Actividad | undefined;
  getSubtareas: (actividadId: string) => Actividad[];
  editarActividad: (id: string, patch: Partial<Actividad>) => void;
  moverActividadConSubtareas: (id: string, deltaDias: number) => void;
  redimensionarActividad: (
    id: string,
    extremo: "inicio" | "fin",
    nuevaFecha: string,
  ) => void;
  programarActividad: (id: string, inicio: string, fin: string) => void;
}

const ClarityContext = createContext<ClarityStore | null>(null);

const nowIso = () => new Date().toISOString();

const COLUMNA_TITULO: Record<ColumnaKanban, string> = Object.fromEntries(
  COLUMNAS.map((c) => [c.id, c.titulo]),
) as Record<ColumnaKanban, string>;

export function ClarityStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [proyectos, setProyectos] = useState<Proyecto[]>(MOCK_PROYECTOS);
  const [actividades, setActividades] = useState<Actividad[]>(MOCK_ACTIVIDADES);
  const [log, setLog] = useState<LogEntry[]>([]);

  const registrarLog = useCallback(
    (proyectoId: string, detalle: string, actividadId: string | null = null) => {
      setLog((prev) => [
        {
          id: crypto.randomUUID(),
          proyecto_id: proyectoId,
          actividad_id: actividadId,
          autor: AUTOR_ACTUAL,
          detalle,
          creado_en: nowIso(),
        },
        ...prev,
      ]);
    },
    [],
  );

  const patchProyecto = useCallback(
    (id: string, patch: Partial<Proyecto>) => {
      setProyectos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...patch, actualizado_en: nowIso() } : p,
        ),
      );
    },
    [],
  );

  const getProyecto = useCallback(
    (id: string) => proyectos.find((p) => p.id === id),
    [proyectos],
  );

  const getActividadesDeProyecto = useCallback(
    (proyectoId: string) =>
      actividades.filter((a) => a.proyecto_id === proyectoId),
    [actividades],
  );

  const getLogDeProyecto = useCallback(
    (proyectoId: string) => log.filter((l) => l.proyecto_id === proyectoId),
    [log],
  );

  const createProyecto: ClarityStore["createProyecto"] = useCallback(
    (input) => {
      const id = crypto.randomUUID();
      const nuevo: Proyecto = {
        id,
        nombre: input.nombre,
        descripcion: input.descripcion,
        prioridad: input.prioridad,
        etiquetas: input.etiqueta
          ? [{ nombre: input.etiqueta, color: input.color }]
          : [],
        columna_kanban: "idea",
        iniciado_en_gantt: false,
        fecha_inicio: null,
        fecha_fin: null,
        checklist: [],
        miembros: [],
        creado_en: nowIso(),
        actualizado_en: nowIso(),
      };
      setProyectos((prev) => [nuevo, ...prev]);
      registrarLog(id, `ha añadido esta tarjeta a ${COLUMNA_TITULO.idea}`);
    },
    [registrarLog],
  );

  const moverProyecto = useCallback(
    (id: string, columna: ColumnaKanban) => {
      const actual = proyectos.find((p) => p.id === id);
      if (!actual || actual.columna_kanban === columna) return;
      patchProyecto(id, { columna_kanban: columna });
      registrarLog(id, `ha movido esta tarjeta a ${COLUMNA_TITULO[columna]}`);
    },
    [proyectos, patchProyecto, registrarLog],
  );

  const renombrarProyecto = useCallback(
    (id: string, nombre: string) => {
      if (!nombre.trim()) return;
      patchProyecto(id, { nombre: nombre.trim() });
      registrarLog(id, "ha cambiado el nombre de esta tarjeta");
    },
    [patchProyecto, registrarLog],
  );

  const editarDescripcion = useCallback(
    (id: string, descripcion: string) => {
      patchProyecto(id, { descripcion });
      registrarLog(id, "ha actualizado la descripción");
    },
    [patchProyecto, registrarLog],
  );

  const agregarEtiqueta = useCallback(
    (id: string, etiqueta: Etiqueta) => {
      const actual = proyectos.find((p) => p.id === id);
      if (!actual || actual.etiquetas.some((e) => e.nombre === etiqueta.nombre))
        return;
      patchProyecto(id, { etiquetas: [...actual.etiquetas, etiqueta] });
      registrarLog(id, `ha añadido la etiqueta "${etiqueta.nombre}"`);
    },
    [proyectos, patchProyecto, registrarLog],
  );

  const quitarEtiqueta = useCallback(
    (id: string, nombre: string) => {
      const actual = proyectos.find((p) => p.id === id);
      if (!actual) return;
      patchProyecto(id, {
        etiquetas: actual.etiquetas.filter((e) => e.nombre !== nombre),
      });
      registrarLog(id, `ha quitado la etiqueta "${nombre}"`);
    },
    [proyectos, patchProyecto, registrarLog],
  );

  const setFechas = useCallback(
    (id: string, fechaInicio: string | null, fechaFin: string | null) => {
      patchProyecto(id, { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
      registrarLog(id, "ha actualizado las fechas de esta tarjeta");
    },
    [patchProyecto, registrarLog],
  );

  const agregarChecklistItem = useCallback(
    (id: string, texto: string) => {
      if (!texto.trim()) return;
      const actual = proyectos.find((p) => p.id === id);
      if (!actual) return;
      const item: ChecklistItem = { texto: texto.trim(), hecho: false };
      patchProyecto(id, { checklist: [...actual.checklist, item] });
      registrarLog(id, `ha añadido "${item.texto}" al checklist`);
    },
    [proyectos, patchProyecto, registrarLog],
  );

  const toggleChecklistItem = useCallback(
    (id: string, index: number) => {
      const actual = proyectos.find((p) => p.id === id);
      if (!actual) return;
      const item = actual.checklist[index];
      if (!item) return;
      const checklist = actual.checklist.map((it, i) =>
        i === index ? { ...it, hecho: !it.hecho } : it,
      );
      patchProyecto(id, { checklist });
      registrarLog(
        id,
        `ha marcado "${item.texto}" como ${item.hecho ? "pendiente" : "completado"}`,
      );
    },
    [proyectos, patchProyecto, registrarLog],
  );

  const agregarMiembro = useCallback(
    (id: string, nombre: string) => {
      const actual = proyectos.find((p) => p.id === id);
      if (!actual || !nombre.trim() || actual.miembros.includes(nombre.trim()))
        return;
      patchProyecto(id, { miembros: [...actual.miembros, nombre.trim()] });
      registrarLog(id, `ha añadido a ${nombre.trim()} a esta tarjeta`);
    },
    [proyectos, patchProyecto, registrarLog],
  );

  const quitarMiembro = useCallback(
    (id: string, nombre: string) => {
      const actual = proyectos.find((p) => p.id === id);
      if (!actual) return;
      patchProyecto(id, {
        miembros: actual.miembros.filter((m) => m !== nombre),
      });
      registrarLog(id, `ha quitado a ${nombre} de esta tarjeta`);
    },
    [proyectos, patchProyecto, registrarLog],
  );

  const agregarComentario = useCallback(
    (id: string, texto: string) => {
      if (!texto.trim()) return;
      registrarLog(id, `comentó: "${texto.trim()}"`);
    },
    [registrarLog],
  );

  const iniciarGantt = useCallback(
    (id: string) => {
      const actual = proyectos.find((p) => p.id === id);
      if (!actual || actual.iniciado_en_gantt) return;
      patchProyecto(id, {
        iniciado_en_gantt: true,
        columna_kanban: "en_progreso",
      });
      registrarLog(id, "ha iniciado el proyecto en Gantt");
    },
    [proyectos, patchProyecto, registrarLog],
  );

  const agregarActividad = useCallback(
    (
      proyectoId: string,
      titulo: string,
      opciones?: { seccion?: string | null; parentId?: string | null },
    ) => {
      if (!titulo.trim()) return;
      const nueva: Actividad = {
        id: crypto.randomUUID(),
        proyecto_id: proyectoId,
        parent_id: opciones?.parentId ?? null,
        titulo: titulo.trim(),
        descripcion: "",
        seccion: opciones?.seccion ?? null,
        fecha_inicio: null,
        fecha_fin: null,
        progreso: 0,
        prioridad: "media",
        etiquetas: [],
        dependencias: [],
        checklist: [],
        comentarios: [],
        asignado_a: null,
      };
      setActividades((prev) => [...prev, nueva]);
      registrarLog(
        proyectoId,
        `ha añadido la ${opciones?.parentId ? "subtarea" : "actividad"} "${nueva.titulo}" al backlog`,
        nueva.id,
      );
    },
    [registrarLog],
  );

  const crearTareaProgramada = useCallback(
    (input: {
      proyectoId: string;
      titulo: string;
      seccion: string;
      fechaInicio: string;
      fechaFin: string;
    }) => {
      if (!input.titulo.trim()) return;
      const nueva: Actividad = {
        id: crypto.randomUUID(),
        proyecto_id: input.proyectoId,
        parent_id: null,
        titulo: input.titulo.trim(),
        descripcion: "",
        seccion: input.seccion.trim(),
        fecha_inicio: input.fechaInicio,
        fecha_fin: input.fechaFin,
        progreso: 0,
        prioridad: "media",
        etiquetas: [],
        dependencias: [],
        checklist: [],
        comentarios: [],
        asignado_a: null,
      };
      setActividades((prev) => [...prev, nueva]);
      registrarLog(
        input.proyectoId,
        `ha creado la tarea "${nueva.titulo}" en ${nueva.seccion}`,
        nueva.id,
      );
    },
    [registrarLog],
  );

  const getActividad = useCallback(
    (id: string) => actividades.find((a) => a.id === id),
    [actividades],
  );

  const getSubtareas = useCallback(
    (actividadId: string) =>
      actividades.filter((a) => a.parent_id === actividadId),
    [actividades],
  );

  const editarActividad = useCallback(
    (id: string, patch: Partial<Actividad>) => {
      const actual = actividades.find((a) => a.id === id);
      if (!actual) return;
      setActividades((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      );
      registrarLog(actual.proyecto_id, "ha actualizado una actividad", id);
    },
    [actividades, registrarLog],
  );

  const moverActividadConSubtareas = useCallback(
    (id: string, deltaDias: number) => {
      if (deltaDias === 0) return;
      const actual = actividades.find((a) => a.id === id);
      if (!actual || !actual.fecha_inicio || !actual.fecha_fin) return;
      const afectadas = new Set([
        id,
        ...actividades.filter((a) => a.parent_id === id).map((a) => a.id),
      ]);
      setActividades((prev) =>
        prev.map((a) =>
          afectadas.has(a.id) && a.fecha_inicio && a.fecha_fin
            ? {
                ...a,
                fecha_inicio: addDays(a.fecha_inicio, deltaDias),
                fecha_fin: addDays(a.fecha_fin, deltaDias),
              }
            : a,
        ),
      );
      registrarLog(actual.proyecto_id, "ha movido las fechas de una actividad", id);
    },
    [actividades, registrarLog],
  );

  const redimensionarActividad = useCallback(
    (id: string, extremo: "inicio" | "fin", nuevaFecha: string) => {
      const actual = actividades.find((a) => a.id === id);
      if (!actual) return;
      if (extremo === "inicio" && actual.fecha_fin && nuevaFecha > actual.fecha_fin) return;
      if (extremo === "fin" && actual.fecha_inicio && nuevaFecha < actual.fecha_inicio) return;
      setActividades((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                fecha_inicio: extremo === "inicio" ? nuevaFecha : a.fecha_inicio,
                fecha_fin: extremo === "fin" ? nuevaFecha : a.fecha_fin,
              }
            : a,
        ),
      );
      registrarLog(actual.proyecto_id, "ha cambiado la duración de una actividad", id);
    },
    [actividades, registrarLog],
  );

  const programarActividad = useCallback(
    (id: string, inicio: string, fin: string) => {
      const actual = actividades.find((a) => a.id === id);
      if (!actual) return;
      setActividades((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, fecha_inicio: inicio, fecha_fin: fin } : a,
        ),
      );
      registrarLog(actual.proyecto_id, "ha programado una actividad", id);
    },
    [actividades, registrarLog],
  );

  const value = useMemo<ClarityStore>(
    () => ({
      proyectos,
      actividades,
      log,
      getProyecto,
      getActividadesDeProyecto,
      getLogDeProyecto,
      createProyecto,
      moverProyecto,
      renombrarProyecto,
      editarDescripcion,
      agregarEtiqueta,
      quitarEtiqueta,
      setFechas,
      agregarChecklistItem,
      toggleChecklistItem,
      agregarMiembro,
      quitarMiembro,
      agregarComentario,
      iniciarGantt,
      agregarActividad,
      crearTareaProgramada,
      getActividad,
      getSubtareas,
      editarActividad,
      moverActividadConSubtareas,
      redimensionarActividad,
      programarActividad,
    }),
    [
      proyectos,
      actividades,
      log,
      getProyecto,
      getActividadesDeProyecto,
      getLogDeProyecto,
      createProyecto,
      moverProyecto,
      renombrarProyecto,
      editarDescripcion,
      agregarEtiqueta,
      quitarEtiqueta,
      setFechas,
      agregarChecklistItem,
      toggleChecklistItem,
      agregarMiembro,
      quitarMiembro,
      agregarComentario,
      iniciarGantt,
      agregarActividad,
      crearTareaProgramada,
      getActividad,
      getSubtareas,
      editarActividad,
      moverActividadConSubtareas,
      redimensionarActividad,
      programarActividad,
    ],
  );

  return (
    <ClarityContext.Provider value={value}>
      {children}
    </ClarityContext.Provider>
  );
}

export function useClarityStore() {
  const ctx = useContext(ClarityContext);
  if (!ctx) {
    throw new Error("useClarityStore debe usarse dentro de ClarityStoreProvider");
  }
  return ctx;
}
