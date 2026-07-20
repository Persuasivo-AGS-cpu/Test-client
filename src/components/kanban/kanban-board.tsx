"use client";

import { useMemo, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { LabelFilter } from "@/components/kanban/label-filter";
import { NewProjectDialog } from "@/components/kanban/new-project-dialog";
import { COLUMNAS, type ColumnaKanban, type Proyecto } from "@/lib/types";

export function KanbanBoard({
  initialProyectos,
}: {
  initialProyectos: Proyecto[];
}) {
  const [proyectos, setProyectos] = useState(initialProyectos);
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());

  const etiquetasUnicas = useMemo(() => {
    const map = new Map<string, string>();
    proyectos.forEach((p) =>
      p.etiquetas.forEach((et) => map.set(et.nombre, et.color)),
    );
    return Array.from(map, ([nombre, color]) => ({ nombre, color }));
  }, [proyectos]);

  const proyectosFiltrados = useMemo(() => {
    if (seleccionadas.size === 0) return proyectos;
    return proyectos.filter((p) =>
      p.etiquetas.some((et) => seleccionadas.has(et.nombre)),
    );
  }, [proyectos, seleccionadas]);

  const toggleEtiqueta = (nombre: string) => {
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(nombre)) next.delete(nombre);
      else next.add(nombre);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const nuevaColumna = over.id as ColumnaKanban;
    setProyectos((prev) =>
      prev.map((p) =>
        p.id === active.id
          ? {
              ...p,
              columna_kanban: nuevaColumna,
              actualizado_en: new Date().toISOString(),
            }
          : p,
      ),
    );
  };

  const handleCreate = (input: {
    nombre: string;
    descripcion: string;
    prioridad: Proyecto["prioridad"];
    etiqueta: string;
    color: string;
  }) => {
    const nuevo: Proyecto = {
      id: crypto.randomUUID(),
      nombre: input.nombre,
      descripcion: input.descripcion,
      prioridad: input.prioridad,
      etiquetas: input.etiqueta
        ? [{ nombre: input.etiqueta, color: input.color }]
        : [],
      columna_kanban: "idea",
      iniciado_en_gantt: false,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };
    setProyectos((prev) => [nuevo, ...prev]);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-6">
      <div className="flex items-center justify-between gap-4">
        <LabelFilter
          etiquetas={etiquetasUnicas}
          seleccionadas={seleccionadas}
          onToggle={toggleEtiqueta}
        />
        <NewProjectDialog onCreate={handleCreate} />
      </div>
      <DndContext id="kanban-dnd" onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto">
          {COLUMNAS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              titulo={col.titulo}
              proyectos={proyectosFiltrados.filter(
                (p) => p.columna_kanban === col.id,
              )}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
