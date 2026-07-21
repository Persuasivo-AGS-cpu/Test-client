"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ColumnSelect } from "@/components/kanban/column-select";
import { QuickActions } from "@/components/kanban/quick-actions";
import { ActivityPanel } from "@/components/kanban/activity-panel";
import { ActivitiesTab } from "@/components/kanban/activities-tab";
import { ActivityDetailDialog } from "@/components/shared/activity-detail-dialog";
import { PriorityBadge } from "@/components/ui/badge";
import { useClarityStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProjectDetailModal({
  proyectoId,
  onClose,
}: {
  proyectoId: string | null;
  onClose: () => void;
}) {
  const {
    getProyecto,
    getActividadesDeProyecto,
    getLogDeProyecto,
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
  } = useClarityStore();

  const [tab, setTab] = useState<"detalle" | "actividades">("detalle");
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [tituloBorrador, setTituloBorrador] = useState("");
  const [actividadAbierta, setActividadAbierta] = useState<string | null>(null);

  const proyecto = proyectoId ? getProyecto(proyectoId) : undefined;

  if (!proyecto) return null;

  const actividades = getActividadesDeProyecto(proyecto.id);
  const log = getLogDeProyecto(proyecto.id);

  return (
    <>
      <Dialog open={!!proyectoId} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="grid max-h-[85vh] w-full max-w-3xl grid-rows-[auto_1fr] gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">{proyecto.nombre}</DialogTitle>

          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <ColumnSelect
              value={proyecto.columna_kanban}
              onChange={(col) => moverProyecto(proyecto.id, col)}
            />
          </div>

          <div className="grid grid-cols-[1fr_300px] overflow-hidden">
            <div className="flex flex-col gap-4 overflow-y-auto p-6">
              {editandoTitulo ? (
                <input
                  autoFocus
                  value={tituloBorrador}
                  onChange={(e) => setTituloBorrador(e.target.value)}
                  onBlur={() => {
                    renombrarProyecto(proyecto.id, tituloBorrador);
                    setEditandoTitulo(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  className="rounded-md border border-accent bg-surface px-2 py-1 text-xl font-semibold text-text-primary outline-none"
                />
              ) : (
                <h2
                  onClick={() => {
                    setTituloBorrador(proyecto.nombre);
                    setEditandoTitulo(true);
                  }}
                  className="cursor-text rounded-md px-2 py-1 text-xl font-semibold text-text-primary hover:bg-accent-soft"
                >
                  {proyecto.nombre}
                </h2>
              )}

              <QuickActions
                proyecto={proyecto}
                onAgregarEtiqueta={(et) => agregarEtiqueta(proyecto.id, et)}
                onQuitarEtiqueta={(n) => quitarEtiqueta(proyecto.id, n)}
                onSetFechas={(i, f) => setFechas(proyecto.id, i, f)}
                onAgregarChecklistItem={(t) =>
                  agregarChecklistItem(proyecto.id, t)
                }
                onAgregarMiembro={(n) => agregarMiembro(proyecto.id, n)}
              />

              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge prioridad={proyecto.prioridad} />
                {proyecto.etiquetas.map((et) => (
                  <span
                    key={et.nombre}
                    className="rounded-sm px-1.5 py-0.5 text-xs font-medium text-text-secondary"
                    style={{ backgroundColor: `${et.color}1a` }}
                  >
                    {et.nombre}
                  </span>
                ))}
                {!proyecto.iniciado_en_gantt && (
                  <button
                    onClick={() => iniciarGantt(proyecto.id)}
                    className="ml-auto rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    Iniciar proyecto en Gantt
                  </button>
                )}
              </div>

              {(proyecto.fecha_inicio || proyecto.fecha_fin) && (
                <p className="font-mono text-xs text-text-secondary">
                  {proyecto.fecha_inicio ?? "?"} → {proyecto.fecha_fin ?? "?"}
                </p>
              )}

              {proyecto.miembros.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {proyecto.miembros.map((m) => (
                    <button
                      key={m}
                      onClick={() => quitarMiembro(proyecto.id, m)}
                      className="inline-flex items-center gap-1 rounded-sm border border-border-strong px-2 py-0.5 text-xs text-text-primary hover:bg-accent-soft"
                      title="Quitar"
                    >
                      {m}
                      <X size={12} />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-4 border-b border-border text-sm font-medium">
                {(["detalle", "actividades"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "-mb-px border-b-2 px-1 pb-2 capitalize",
                      tab === t
                        ? "border-accent text-accent"
                        : "border-transparent text-text-secondary",
                    )}
                  >
                    {t === "detalle" ? "Detalle" : "Actividades"}
                    {t === "actividades" && actividades.length > 0
                      ? ` (${actividades.length})`
                      : ""}
                  </button>
                ))}
              </div>

              {tab === "detalle" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Descripción
                    </h3>
                    <DescripcionField
                      valor={proyecto.descripcion}
                      onGuardar={(d) => editarDescripcion(proyecto.id, d)}
                    />
                  </div>

                  {proyecto.checklist.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm font-semibold text-text-primary">
                        Checklist
                      </h3>
                      <ul className="flex flex-col gap-1">
                        {proyecto.checklist.map((item, i) => (
                          <li key={i}>
                            <label className="flex items-center gap-2 text-sm text-text-primary">
                              <input
                                type="checkbox"
                                checked={item.hecho}
                                onChange={() =>
                                  toggleChecklistItem(proyecto.id, i)
                                }
                              />
                              <span
                                className={cn(
                                  item.hecho &&
                                    "text-text-muted line-through",
                                )}
                              >
                                {item.texto}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <ActivitiesTab
                  actividades={actividades}
                  onAgregar={(titulo) => agregarActividad(proyecto.id, titulo)}
                  onAbrir={setActividadAbierta}
                />
              )}
            </div>

            <ActivityPanel
              log={log}
              onComentar={(texto) => agregarComentario(proyecto.id, texto)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <ActivityDetailDialog
        actividadId={actividadAbierta}
        onClose={() => setActividadAbierta(null)}
      />
    </>
  );
}

function DescripcionField({
  valor,
  onGuardar,
}: {
  valor: string;
  onGuardar: (v: string) => void;
}) {
  const [texto, setTexto] = useState(valor);
  return (
    <textarea
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={() => {
        if (texto !== valor) onGuardar(texto);
      }}
      rows={3}
      placeholder="Añadir una descripción más detallada..."
      className="resize-none rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
    />
  );
}
