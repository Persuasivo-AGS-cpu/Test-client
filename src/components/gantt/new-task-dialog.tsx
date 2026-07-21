"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NewTaskDialog({
  onCreate,
}: {
  onCreate: (input: {
    titulo: string;
    seccion: string;
    fechaInicio: string;
    fechaFin: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [seccion, setSeccion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const reset = () => {
    setTitulo("");
    setSeccion("");
    setFechaInicio("");
    setFechaFin("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !seccion.trim() || !fechaInicio || !fechaFin) return;
    onCreate({ titulo: titulo.trim(), seccion: seccion.trim(), fechaInicio, fechaFin });
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
        Nueva tarea
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <DialogTitle className="text-base font-semibold text-text-primary">
          Nueva tarea raíz
        </DialogTitle>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
            Título
            <input
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
            Sección (fase)
            <input
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
              placeholder="Ej. Fase 1 · Planeación"
              className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
              Inicio
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="rounded-md border border-border-strong bg-surface px-3 py-1.5 font-mono text-sm text-text-primary outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
              Fin
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="rounded-md border border-border-strong bg-surface px-3 py-1.5 font-mono text-sm text-text-primary outline-none focus:border-accent"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Crear tarea
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
