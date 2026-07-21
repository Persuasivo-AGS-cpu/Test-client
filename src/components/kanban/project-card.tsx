"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/badge";
import type { Proyecto } from "@/lib/types";

export function ProjectCard({
  proyecto,
  onAbrir,
}: {
  proyecto: Proyecto;
  onAbrir: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: proyecto.id });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const borderColor = proyecto.etiquetas[0]?.color ?? "transparent";

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderTopColor: borderColor }}
      {...listeners}
      {...attributes}
      onClick={() => onAbrir(proyecto.id)}
      className={cn(
        "cursor-grab select-none rounded-md border border-border border-t-2 bg-surface p-3 hover:border-border-strong active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-text-primary">
          {proyecto.nombre}
        </h3>
        {proyecto.iniciado_en_gantt && (
          <span className="shrink-0 rounded-sm bg-success-bg px-1.5 py-0.5 font-mono text-[10px] font-medium text-success">
            Gantt
          </span>
        )}
      </div>
      {proyecto.descripcion && (
        <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
          {proyecto.descripcion}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge prioridad={proyecto.prioridad} />
        {proyecto.etiquetas.map((et) => (
          <span
            key={et.nombre}
            className="rounded-sm px-1.5 py-0.5 text-[11px] font-medium text-text-secondary"
            style={{ backgroundColor: `${et.color}1a` }}
          >
            {et.nombre}
          </span>
        ))}
      </div>
    </div>
  );
}
