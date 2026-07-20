"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/kanban/project-card";
import type { ColumnaKanban, Proyecto } from "@/lib/types";

export function KanbanColumn({
  id,
  titulo,
  proyectos,
}: {
  id: ColumnaKanban;
  titulo: string;
  proyectos: Proyecto[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-text-primary">{titulo}</h2>
        <span className="font-mono text-xs text-text-muted">
          {proyectos.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-md border border-dashed border-transparent p-1 transition-colors",
          isOver && "border-accent bg-accent-soft",
        )}
      >
        {proyectos.map((p) => (
          <ProjectCard key={p.id} proyecto={p} />
        ))}
      </div>
    </div>
  );
}
