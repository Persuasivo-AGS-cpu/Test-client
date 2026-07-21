"use client";

import { useRef, useState } from "react";
import { diffDays } from "@/lib/dates";
import type { Actividad } from "@/lib/types";

export function GanttBar({
  actividad,
  left,
  width,
  pxPerDay,
  onMover,
  onRedimensionar,
  onClick,
  onIniciarConexion,
}: {
  actividad: Actividad;
  left: number;
  width: number;
  pxPerDay: number;
  onMover: (deltaDias: number) => void;
  onRedimensionar: (extremo: "inicio" | "fin", deltaDias: number) => void;
  onClick: () => void;
  onIniciarConexion?: () => void;
}) {
  const [dragPx, setDragPx] = useState(0);
  const [resizing, setResizing] = useState<"inicio" | "fin" | null>(null);
  const moved = useRef(false);
  const borderColor = actividad.etiquetas[0]?.color ?? "#3B5BDB";

  const startBodyDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    moved.current = false;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 3) moved.current = true;
      setDragPx(dx);
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const dx = ev.clientX - startX;
      const deltaDias = Math.round(dx / pxPerDay);
      setDragPx(0);
      if (moved.current) {
        if (deltaDias !== 0) onMover(deltaDias);
      } else {
        onClick();
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startResize = (extremo: "inicio" | "fin") => (e: React.PointerEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    setResizing(extremo);

    const onMove = (ev: PointerEvent) => {
      setDragPx(ev.clientX - startX);
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const dx = ev.clientX - startX;
      const deltaDias = Math.round(dx / pxPerDay);
      setDragPx(0);
      setResizing(null);
      if (deltaDias !== 0) onRedimensionar(extremo, deltaDias);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  let visualLeft = left;
  let visualWidth = width;
  if (resizing === "inicio") {
    visualLeft = left + dragPx;
    visualWidth = Math.max(width - dragPx, pxPerDay);
  } else if (resizing === "fin") {
    visualWidth = Math.max(width + dragPx, pxPerDay);
  } else {
    visualLeft = left + dragPx;
  }

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: visualLeft, width: visualWidth, height: 20 }}
    >
      <div
        onPointerDown={startBodyDrag}
        style={{ borderTopColor: borderColor }}
        className="group relative h-full cursor-grab select-none rounded-md border-t-2 bg-accent-soft active:cursor-grabbing"
      >
        <div className="relative h-full w-full overflow-hidden rounded-md">
          <div
            className="h-full bg-[#BFD3F5]"
            style={{ width: `${Math.min(actividad.progreso, 100)}%` }}
          />
          <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 truncate text-[11px] font-medium text-text-primary">
            {visualWidth > 60 ? actividad.titulo : ""}
          </span>
        </div>
        <div
          onPointerDown={startResize("inicio")}
          className="absolute -left-1 top-0 h-full w-2 cursor-ew-resize opacity-0 group-hover:opacity-100"
        />
        <div
          onPointerDown={startResize("fin")}
          className="absolute -right-1 top-0 h-full w-2 cursor-ew-resize opacity-0 group-hover:opacity-100"
        />
        {onIniciarConexion && (
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              onIniciarConexion();
            }}
            className="absolute -right-3.5 top-1/2 h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-white bg-accent opacity-0 group-hover:opacity-100"
            title="Arrastra para crear una dependencia"
          />
        )}
      </div>
    </div>
  );
}

export function SectionBar({
  left,
  width,
}: {
  left: number;
  width: number;
}) {
  return (
    <div
      className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-sm bg-zinc-700"
      style={{ left, width }}
    >
      <div className="absolute -left-0.5 -top-1 h-2.5 w-0.5 bg-zinc-700" />
      <div className="absolute -right-0.5 -top-1 h-2.5 w-0.5 bg-zinc-700" />
    </div>
  );
}

// exported for potential future use in dependency drawing (Fase 5)
export function daysToPx(days: number, pxPerDay: number) {
  return days * pxPerDay;
}

export function computeBarGeometry(
  timelineStart: string,
  fechaInicio: string,
  fechaFin: string,
  pxPerDay: number,
) {
  const left = diffDays(timelineStart, fechaInicio) * pxPerDay;
  const width = (diffDays(fechaInicio, fechaFin) + 1) * pxPerDay;
  return { left, width };
}
