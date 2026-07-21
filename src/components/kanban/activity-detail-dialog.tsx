"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useClarityStore } from "@/lib/store";

export function ActivityDetailDialog({
  actividadId,
  onClose,
}: {
  actividadId: string | null;
  onClose: () => void;
}) {
  const { getActividad, editarActividad } = useClarityStore();
  const actividad = actividadId ? getActividad(actividadId) : undefined;
  const [descripcion, setDescripcion] = useState(actividad?.descripcion ?? "");

  if (!actividad) return null;

  return (
    <Dialog open={!!actividadId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogTitle className="text-base font-semibold text-text-primary">
          {actividad.titulo}
        </DialogTitle>
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={actividad.progreso >= 100}
              onChange={(e) =>
                editarActividad(actividad.id, {
                  progreso: e.target.checked ? 100 : 0,
                })
              }
            />
            Completada
          </label>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              onBlur={() => editarActividad(actividad.id, { descripcion })}
              rows={3}
              placeholder="Añadir una descripción más detallada..."
              className="resize-none rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
            />
          </div>
          {!actividad.fecha_inicio && (
            <p className="text-xs text-text-muted">
              Sin fechas — vive en el backlog del Gantt hasta que se
              programe (Fase 4).
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
