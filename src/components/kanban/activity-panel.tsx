"use client";

import { useState } from "react";
import { formatFechaHora } from "@/lib/format";
import type { LogEntry } from "@/lib/types";

export function ActivityPanel({
  log,
  onComentar,
}: {
  log: LogEntry[];
  onComentar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [mostrarTodo, setMostrarTodo] = useState(false);

  const visibles = mostrarTodo ? log : log.slice(0, 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    onComentar(texto);
    setTexto("");
  };

  return (
    <div className="flex h-full flex-col gap-3 border-l border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Comentarios y Actividad
        </h3>
        {log.length > 4 && (
          <button
            onClick={() => setMostrarTodo((v) => !v)}
            className="text-xs font-medium text-accent hover:underline"
          >
            {mostrarTodo ? "Ocultar detalles" : "Mostrar detalles"}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={2}
          placeholder="Escribe un comentario..."
          className="w-full resize-none rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
        />
        {texto.trim() && (
          <button
            type="submit"
            className="mt-2 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Comentar
          </button>
        )}
      </form>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {visibles.length === 0 && (
          <p className="text-xs text-text-muted">Sin actividad todavía.</p>
        )}
        {visibles.map((entry) => (
          <div key={entry.id} className="text-sm leading-snug">
            <span className="font-semibold text-text-primary">
              {entry.autor}
            </span>{" "}
            <span className="text-text-secondary">{entry.detalle}</span>
            <div className="font-mono text-[11px] text-text-muted">
              {formatFechaHora(entry.creado_en)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
