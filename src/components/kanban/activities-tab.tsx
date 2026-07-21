"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { Actividad } from "@/lib/types";

export function ActivitiesTab({
  actividades,
  onAgregar,
  onAbrir,
}: {
  actividades: Actividad[];
  onAgregar: (titulo: string) => void;
  onAbrir: (id: string) => void;
}) {
  const [titulo, setTitulo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    onAgregar(titulo);
    setTitulo("");
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nueva actividad (sin fecha, va al backlog)"
          className="flex-1 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          Añadir
        </button>
      </form>

      {actividades.length === 0 ? (
        <p className="text-sm text-text-muted">
          Sin actividades todavía. Las que crees aquí o en el Gantt aparecen
          en ambos lugares.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {actividades.map((a) => (
            <li
              key={a.id}
              onClick={() => onAbrir(a.id)}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-accent-soft"
            >
              {a.progreso >= 100 ? (
                <CheckCircle2 size={16} className="shrink-0 text-success" />
              ) : (
                <Circle size={16} className="shrink-0 text-text-muted" />
              )}
              <span className="flex-1">{a.titulo}</span>
              {!a.fecha_inicio && (
                <span className="rounded-sm bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                  Backlog
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
