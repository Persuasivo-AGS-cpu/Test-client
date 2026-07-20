import { cn } from "@/lib/utils";
import type { Prioridad } from "@/lib/types";

const PRIORIDAD_STYLES: Record<Prioridad, string> = {
  baja: "text-text-secondary bg-zinc-100",
  media: "text-accent bg-accent-soft",
  alta: "text-warning bg-warning-bg",
  urgente: "text-danger bg-danger-bg",
};

const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

export function PriorityBadge({ prioridad }: { prioridad: Prioridad }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[11px] font-medium",
        PRIORIDAD_STYLES[prioridad],
      )}
    >
      {PRIORIDAD_LABEL[prioridad]}
    </span>
  );
}

export function LabelChip({
  nombre,
  color,
  active,
  onClick,
}: {
  nombre: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors",
        active === false
          ? "border-border text-text-muted"
          : "border-border-strong text-text-primary bg-surface",
      )}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {nombre}
    </Comp>
  );
}
