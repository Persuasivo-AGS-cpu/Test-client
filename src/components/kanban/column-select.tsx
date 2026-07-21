"use client";

import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COLUMNAS, type ColumnaKanban } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ColumnSelect({
  value,
  onChange,
}: {
  value: ColumnaKanban;
  onChange: (columna: ColumnaKanban) => void;
}) {
  const titulo = COLUMNAS.find((c) => c.id === value)?.titulo ?? value;

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1 rounded-sm border border-border-strong bg-surface px-2 py-1 text-xs font-medium text-text-primary hover:bg-accent-soft">
        {titulo}
        <ChevronDown size={14} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-1">
        {COLUMNAS.map((col) => (
          <button
            key={col.id}
            onClick={() => onChange(col.id)}
            className={cn(
              "block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent-soft",
              col.id === value && "font-medium text-accent",
            )}
          >
            {col.titulo}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
