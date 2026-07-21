"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GanttChart } from "@/components/gantt/gantt-chart";
import { NewTaskDialog } from "@/components/gantt/new-task-dialog";
import { ActivityDetailDialog } from "@/components/shared/activity-detail-dialog";
import { useClarityStore } from "@/lib/store";

export function GanttBoard() {
  const { proyectos, crearTareaProgramada } = useClarityStore();
  const iniciados = useMemo(
    () => proyectos.filter((p) => p.iniciado_en_gantt),
    [proyectos],
  );
  const [proyectoId, setProyectoId] = useState<string | null>(
    iniciados[0]?.id ?? null,
  );
  const [actividadAbierta, setActividadAbierta] = useState<string | null>(null);

  const proyecto = iniciados.find((p) => p.id === proyectoId) ?? iniciados[0];

  if (!proyecto) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-text-secondary">
          Todavía no hay proyectos iniciados en Gantt. Inicia uno desde su
          tarjeta en el Kanban.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-6">
      <div className="flex items-center justify-between gap-4">
        <Popover>
          <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-accent-soft">
            {proyecto.nombre}
            <ChevronDown size={14} />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-1">
            {iniciados.map((p) => (
              <button
                key={p.id}
                onClick={() => setProyectoId(p.id)}
                className="block w-full truncate rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent-soft"
              >
                {p.nombre}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <NewTaskDialog
          onCreate={(input) =>
            crearTareaProgramada({ proyectoId: proyecto.id, ...input })
          }
        />
      </div>

      <GanttChart proyectoId={proyecto.id} onAbrirActividad={setActividadAbierta} />

      <ActivityDetailDialog
        actividadId={actividadAbierta}
        onClose={() => setActividadAbierta(null)}
      />
    </div>
  );
}
