"use client";

import { useState } from "react";
import { Plus, Tag, Calendar, CheckSquare, Users, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ETIQUETA_COLORES, type Etiqueta, type Proyecto } from "@/lib/types";
import { cn } from "@/lib/utils";

type Panel = "anadir" | "etiquetas" | "fechas" | "checklist" | "miembros" | null;

export function QuickActions({
  proyecto,
  onAgregarEtiqueta,
  onQuitarEtiqueta,
  onSetFechas,
  onAgregarChecklistItem,
  onAgregarMiembro,
}: {
  proyecto: Proyecto;
  onAgregarEtiqueta: (etiqueta: Etiqueta) => void;
  onQuitarEtiqueta: (nombre: string) => void;
  onSetFechas: (inicio: string | null, fin: string | null) => void;
  onAgregarChecklistItem: (texto: string) => void;
  onAgregarMiembro: (nombre: string) => void;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [color, setColor] = useState(ETIQUETA_COLORES[0]);
  const [inicio, setInicio] = useState(proyecto.fecha_inicio ?? "");
  const [fin, setFin] = useState(proyecto.fecha_fin ?? "");
  const [checklistTexto, setChecklistTexto] = useState("");
  const [miembroNombre, setMiembroNombre] = useState("");

  const open = (p: Panel) => (v: boolean) => setPanel(v ? p : null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={panel === "anadir"} onOpenChange={open("anadir")}>
        <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-text-primary hover:bg-accent-soft">
          <Plus size={14} />
          Añadir
        </PopoverTrigger>
        <PopoverContent align="start" className="w-40 p-1">
          {[
            { id: "etiquetas" as const, label: "Etiqueta", icon: Tag },
            { id: "fechas" as const, label: "Fecha", icon: Calendar },
            { id: "checklist" as const, label: "Checklist", icon: CheckSquare },
            { id: "miembros" as const, label: "Miembro", icon: Users },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPanel(opt.id)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent-soft"
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <Popover open={panel === "etiquetas"} onOpenChange={open("etiquetas")}>
        <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-text-primary hover:bg-accent-soft">
          <Tag size={14} />
          Etiquetas
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 space-y-2">
          {proyecto.etiquetas.map((et) => (
            <div key={et.nombre} className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: et.color }}
                />
                {et.nombre}
              </span>
              <button
                onClick={() => onQuitarEtiqueta(et.nombre)}
                className="text-text-muted hover:text-danger"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-1.5 border-t border-border pt-2">
            <input
              value={nuevaEtiqueta}
              onChange={(e) => setNuevaEtiqueta(e.target.value)}
              placeholder="Nueva etiqueta"
              className="flex-1 rounded-sm border border-border-strong px-2 py-1 text-xs outline-none focus:border-accent"
            />
            <div className="flex gap-1">
              {ETIQUETA_COLORES.slice(0, 3).map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-4 w-4 rounded-full border",
                    color === c ? "border-text-primary" : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              onClick={() => {
                if (!nuevaEtiqueta.trim()) return;
                onAgregarEtiqueta({ nombre: nuevaEtiqueta.trim(), color });
                setNuevaEtiqueta("");
              }}
              className="rounded-sm bg-accent px-2 py-1 text-xs font-medium text-white"
            >
              +
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={panel === "fechas"} onOpenChange={open("fechas")}>
        <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-text-primary hover:bg-accent-soft">
          <Calendar size={14} />
          Fechas
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 space-y-2">
          <label className="flex flex-col gap-1 text-xs text-text-secondary">
            Inicio
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="rounded-sm border border-border-strong px-2 py-1 font-mono text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-secondary">
            Fin
            <input
              type="date"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="rounded-sm border border-border-strong px-2 py-1 font-mono text-sm outline-none focus:border-accent"
            />
          </label>
          <button
            onClick={() => {
              onSetFechas(inicio || null, fin || null);
              setPanel(null);
            }}
            className="w-full rounded-sm bg-accent px-2 py-1.5 text-xs font-medium text-white"
          >
            Guardar
          </button>
        </PopoverContent>
      </Popover>

      <Popover open={panel === "checklist"} onOpenChange={open("checklist")}>
        <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-text-primary hover:bg-accent-soft">
          <CheckSquare size={14} />
          Checklist
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 space-y-2">
          <input
            autoFocus
            value={checklistTexto}
            onChange={(e) => setChecklistTexto(e.target.value)}
            placeholder="Nuevo elemento"
            className="w-full rounded-sm border border-border-strong px-2 py-1 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={() => {
              onAgregarChecklistItem(checklistTexto);
              setChecklistTexto("");
              setPanel(null);
            }}
            className="w-full rounded-sm bg-accent px-2 py-1.5 text-xs font-medium text-white"
          >
            Añadir
          </button>
        </PopoverContent>
      </Popover>

      <Popover open={panel === "miembros"} onOpenChange={open("miembros")}>
        <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-text-primary hover:bg-accent-soft">
          <Users size={14} />
          Miembros
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 space-y-2">
          <input
            autoFocus
            value={miembroNombre}
            onChange={(e) => setMiembroNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full rounded-sm border border-border-strong px-2 py-1 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={() => {
              onAgregarMiembro(miembroNombre);
              setMiembroNombre("");
              setPanel(null);
            }}
            className="w-full rounded-sm bg-accent px-2 py-1.5 text-xs font-medium text-white"
          >
            Añadir
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
