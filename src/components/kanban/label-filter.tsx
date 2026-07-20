"use client";

import { LabelChip } from "@/components/ui/badge";
import type { Etiqueta } from "@/lib/types";

export function LabelFilter({
  etiquetas,
  seleccionadas,
  onToggle,
}: {
  etiquetas: Etiqueta[];
  seleccionadas: Set<string>;
  onToggle: (nombre: string) => void;
}) {
  if (etiquetas.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-text-secondary">
        Filtrar:
      </span>
      {etiquetas.map((et) => (
        <LabelChip
          key={et.nombre}
          nombre={et.nombre}
          color={et.color}
          active={seleccionadas.size === 0 || seleccionadas.has(et.nombre)}
          onClick={() => onToggle(et.nombre)}
        />
      ))}
    </div>
  );
}
