"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { LabelFilter } from "@/components/kanban/label-filter";
import { NewProjectDialog } from "@/components/kanban/new-project-dialog";
import { ProjectDetailModal } from "@/components/kanban/project-detail-modal";
import { useClarityStore } from "@/lib/store";
import { COLUMNAS, type ColumnaKanban } from "@/lib/types";

export function KanbanBoard() {
  const { proyectos, createProyecto, moverProyecto } = useClarityStore();
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [proyectoAbierto, setProyectoAbierto] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

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
    moverProyecto(active.id as string, over.id as ColumnaKanban);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-6">
      <div className="flex items-center justify-between gap-4">
        <LabelFilter
          etiquetas={etiquetasUnicas}
          seleccionadas={seleccionadas}
          onToggle={toggleEtiqueta}
        />
        <NewProjectDialog onCreate={createProyecto} />
      </div>
      <DndContext id="kanban-dnd" sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto">
          {COLUMNAS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              titulo={col.titulo}
              proyectos={proyectosFiltrados.filter(
                (p) => p.columna_kanban === col.id,
              )}
              onAbrir={setProyectoAbierto}
            />
          ))}
        </div>
      </DndContext>

      <ProjectDetailModal
        proyectoId={proyectoAbierto}
        onClose={() => setProyectoAbierto(null)}
      />
    </div>
  );
}
