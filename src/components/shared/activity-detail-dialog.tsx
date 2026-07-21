"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useClarityStore } from "@/lib/store";

export function ActivityDetailDialog({
  actividadId,
  onClose,
}: {
  actividadId: string | null;
  onClose: () => void;
}) {
  const {
    getActividad,
    getSubtareas,
    editarActividad,
    agregarActividad,
    quitarDependencia,
  } = useClarityStore();
  const actividad = actividadId ? getActividad(actividadId) : undefined;
  const [descripcion, setDescripcion] = useState(actividad?.descripcion ?? "");
  const [nuevaSubtarea, setNuevaSubtarea] = useState("");

  if (!actividad) return null;

  const subtareas = getSubtareas(actividad.id);
  const esRaiz = actividad.parent_id === null;

  return (
    <Dialog open={!!actividadId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogTitle className="text-base font-semibold text-text-primary">
          {actividad.titulo}
        </DialogTitle>
        <div className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-text-secondary">
              Asignado a
              <input
                defaultValue={actividad.asignado_a ?? ""}
                onBlur={(e) =>
                  editarActividad(actividad.id, {
                    asignado_a: e.target.value || null,
                  })
                }
                className="rounded-sm border border-border-strong px-2 py-1 text-sm text-text-primary outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-secondary">
              Progreso (%)
              <input
                type="number"
                min={0}
                max={100}
                defaultValue={actividad.progreso}
                onBlur={(e) =>
                  editarActividad(actividad.id, {
                    progreso: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
                className="rounded-sm border border-border-strong px-2 py-1 font-mono text-sm text-text-primary outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-secondary">
              Inicio
              <input
                type="date"
                defaultValue={actividad.fecha_inicio ?? ""}
                onBlur={(e) =>
                  editarActividad(actividad.id, {
                    fecha_inicio: e.target.value || null,
                  })
                }
                className="rounded-sm border border-border-strong px-2 py-1 font-mono text-sm text-text-primary outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-secondary">
              Fin
              <input
                type="date"
                defaultValue={actividad.fecha_fin ?? ""}
                onBlur={(e) =>
                  editarActividad(actividad.id, {
                    fecha_fin: e.target.value || null,
                  })
                }
                className="rounded-sm border border-border-strong px-2 py-1 font-mono text-sm text-text-primary outline-none focus:border-accent"
              />
            </label>
          </div>

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
              programe.
            </p>
          )}

          {actividad.dependencias.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-border pt-3">
              <h3 className="text-xs font-semibold text-text-primary">
                Depende de
              </h3>
              <ul className="flex flex-col gap-1">
                {actividad.dependencias.map((depId) => {
                  const predecesora = getActividad(depId);
                  return (
                    <li
                      key={depId}
                      className="flex items-center justify-between text-sm text-text-primary"
                    >
                      <span>{predecesora?.titulo ?? "Actividad eliminada"}</span>
                      <button
                        onClick={() => quitarDependencia(actividad.id, depId)}
                        className="text-text-muted hover:text-danger"
                        title="Quitar dependencia"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {esRaiz && (
            <div className="flex flex-col gap-1.5 border-t border-border pt-3">
              <h3 className="text-xs font-semibold text-text-primary">
                Subtareas
              </h3>
              {subtareas.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {subtareas.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between text-sm text-text-primary"
                    >
                      <span>{s.titulo}</span>
                      {!s.fecha_inicio && (
                        <span className="rounded-sm bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                          Backlog
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!nuevaSubtarea.trim()) return;
                  agregarActividad(actividad.proyecto_id, nuevaSubtarea, {
                    seccion: actividad.seccion,
                    parentId: actividad.id,
                  });
                  setNuevaSubtarea("");
                }}
                className="flex gap-2"
              >
                <input
                  value={nuevaSubtarea}
                  onChange={(e) => setNuevaSubtarea(e.target.value)}
                  placeholder="Nueva subtarea"
                  className="flex-1 rounded-sm border border-border-strong px-2 py-1 text-sm outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="rounded-sm bg-accent px-2 py-1 text-xs font-medium text-white"
                >
                  Añadir
                </button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
