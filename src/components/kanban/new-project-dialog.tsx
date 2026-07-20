"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ETIQUETA_COLORES, PRIORIDADES, type Prioridad } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NewProjectDialog({
  onCreate,
}: {
  onCreate: (input: {
    nombre: string;
    descripcion: string;
    prioridad: Prioridad;
    etiqueta: string;
    color: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("media");
  const [etiqueta, setEtiqueta] = useState("");
  const [color, setColor] = useState(ETIQUETA_COLORES[0]);

  const reset = () => {
    setNombre("");
    setDescripcion("");
    setPrioridad("media");
    setEtiqueta("");
    setColor(ETIQUETA_COLORES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onCreate({ nombre: nombre.trim(), descripcion, prioridad, etiqueta, color });
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-accent-soft">
        <Plus size={16} />
        Nuevo proyecto
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <DialogTitle className="text-base font-semibold text-text-primary">
          Nuevo proyecto
        </DialogTitle>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Nombre
            </label>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
              placeholder="Ej. Meta Ads — Cliente X"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="resize-none rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Prioridad
            </label>
            <div className="flex gap-1.5">
              {PRIORIDADES.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPrioridad(p)}
                  className={cn(
                    "rounded-sm border px-2 py-1 text-xs font-medium capitalize",
                    prioridad === p
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-text-secondary",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Etiqueta (opcional)
            </label>
            <div className="flex items-center gap-2">
              <input
                value={etiqueta}
                onChange={(e) => setEtiqueta(e.target.value)}
                className="flex-1 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
                placeholder="Ej. Google Ads"
              />
              <div className="flex gap-1">
                {ETIQUETA_COLORES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-6 w-6 rounded-full border-2",
                      color === c ? "border-text-primary" : "border-transparent",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="mt-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Crear proyecto
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
