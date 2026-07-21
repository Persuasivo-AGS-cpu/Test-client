"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, CircleCheck, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addDays,
  diasHabiles,
  diffDays,
  formatDiaMes,
  formatMesAno,
  todayISO,
} from "@/lib/dates";
import { GanttBar, SectionBar, computeBarGeometry } from "@/components/gantt/gantt-bar";
import { useClarityStore } from "@/lib/store";
import type { Actividad } from "@/lib/types";

type Zoom = "dia" | "semana" | "mes";

const PX_POR_DIA: Record<Zoom, number> = {
  dia: 36,
  semana: 14,
  mes: 6,
};

const ROW_HEIGHT = 34;

type Row =
  | { kind: "section"; id: string; label: string; inicio: string; fin: string }
  | {
      kind: "item";
      actividad: Actividad;
      indent: boolean;
      scheduled: boolean;
      hasSubtareas: boolean;
    };

export function GanttChart({
  proyectoId,
  onAbrirActividad,
}: {
  proyectoId: string;
  onAbrirActividad: (id: string) => void;
}) {
  const {
    actividades: todas,
    getSubtareas,
    moverActividadConSubtareas,
    redimensionarActividad,
    programarActividad,
    agregarDependencia,
  } = useClarityStore();
  const [zoom, setZoom] = useState<Zoom>("semana");
  const [colapsadas, setColapsadas] = useState<Set<string>>(new Set());
  const [conectandoDesde, setConectandoDesde] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const cuerpoRef = useRef<HTMLDivElement>(null);

  const actividades = useMemo(
    () => todas.filter((a) => a.proyecto_id === proyectoId),
    [todas, proyectoId],
  );

  const pxPerDay = PX_POR_DIA[zoom];

  const scheduled = actividades.filter((a) => a.fecha_inicio && a.fecha_fin);
  const backlog = actividades.filter((a) => !a.fecha_inicio || !a.fecha_fin);

  const rangoTimeline = useMemo(() => {
    if (scheduled.length === 0) {
      return { inicio: addDays(todayISO(), -7), fin: addDays(todayISO(), 21) };
    }
    const inicios = scheduled.map((a) => a.fecha_inicio!);
    const fines = scheduled.map((a) => a.fecha_fin!);
    const inicio = inicios.reduce((a, b) => (a < b ? a : b));
    const fin = fines.reduce((a, b) => (a > b ? a : b));
    return { inicio: addDays(inicio, -3), fin: addDays(fin, 3) };
  }, [scheduled]);

  const totalDias = diffDays(rangoTimeline.inicio, rangoTimeline.fin) + 1;
  const totalWidth = totalDias * pxPerDay;

  const rows = useMemo(() => {
    const out: Row[] = [];
    const roots = scheduled
      .filter((a) => a.parent_id === null)
      .sort((a, b) => a.fecha_inicio!.localeCompare(b.fecha_inicio!));

    const grupos = new Map<string, Actividad[]>();
    for (const r of roots) {
      const key = r.seccion ?? "Sin sección";
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(r);
    }

    for (const [seccion, tareas] of grupos) {
      const inicios = tareas.flatMap((t) => [
        t.fecha_inicio!,
        ...getSubtareas(t.id)
          .filter((s) => s.fecha_inicio)
          .map((s) => s.fecha_inicio!),
      ]);
      const fines = tareas.flatMap((t) => [
        t.fecha_fin!,
        ...getSubtareas(t.id)
          .filter((s) => s.fecha_fin)
          .map((s) => s.fecha_fin!),
      ]);
      out.push({
        kind: "section",
        id: seccion,
        label: seccion,
        inicio: inicios.reduce((a, b) => (a < b ? a : b)),
        fin: fines.reduce((a, b) => (a > b ? a : b)),
      });
      for (const tarea of tareas) {
        const subtareas = getSubtareas(tarea.id);
        out.push({
          kind: "item",
          actividad: tarea,
          indent: false,
          scheduled: true,
          hasSubtareas: subtareas.length > 0,
        });
        if (!colapsadas.has(tarea.id)) {
          for (const sub of subtareas.filter(
            (s) => s.fecha_inicio && s.fecha_fin,
          )) {
            out.push({
              kind: "item",
              actividad: sub,
              indent: true,
              scheduled: true,
              hasSubtareas: false,
            });
          }
        }
      }
    }

    if (backlog.length > 0) {
      out.push({
        kind: "section",
        id: "__backlog",
        label: "Backlog",
        inicio: rangoTimeline.inicio,
        fin: rangoTimeline.inicio,
      });
      for (const a of backlog) {
        out.push({
          kind: "item",
          actividad: a,
          indent: a.parent_id !== null,
          scheduled: false,
          hasSubtareas: false,
        });
      }
    }

    return out;
  }, [scheduled, backlog, getSubtareas, colapsadas, rangoTimeline.inicio]);

  const filaIndicePorId = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row, i) => {
      if (row.kind === "item") map.set(row.actividad.id, i);
    });
    return map;
  }, [rows]);

  const dependenciasVisibles = useMemo(() => {
    const lineas: {
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }[] = [];
    for (const row of rows) {
      if (row.kind !== "item" || !row.scheduled) continue;
      for (const predId of row.actividad.dependencias) {
        const predIdx = filaIndicePorId.get(predId);
        const succIdx = filaIndicePorId.get(row.actividad.id);
        const predecesora = actividades.find((a) => a.id === predId);
        if (predIdx === undefined || succIdx === undefined || !predecesora) continue;
        if (!predecesora.fecha_inicio || !predecesora.fecha_fin) continue;
        const predGeom = computeBarGeometry(
          rangoTimeline.inicio,
          predecesora.fecha_inicio,
          predecesora.fecha_fin,
          pxPerDay,
        );
        const succGeom = computeBarGeometry(
          rangoTimeline.inicio,
          row.actividad.fecha_inicio!,
          row.actividad.fecha_fin!,
          pxPerDay,
        );
        lineas.push({
          key: `${predId}->${row.actividad.id}`,
          x1: predGeom.left + predGeom.width,
          y1: predIdx * ROW_HEIGHT + ROW_HEIGHT / 2,
          x2: succGeom.left,
          y2: succIdx * ROW_HEIGHT + ROW_HEIGHT / 2,
        });
      }
    }
    return lineas;
  }, [rows, filaIndicePorId, actividades, rangoTimeline.inicio, pxPerDay]);

  const iniciarConexion = (predecesoraId: string) => {
    setConectandoDesde(predecesoraId);

    const onMove = (ev: PointerEvent) => {
      const rect = cuerpoRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const destino = el?.closest("[data-actividad-id]") as HTMLElement | null;
      const sucesoraId = destino?.dataset.actividadId;
      if (sucesoraId && sucesoraId !== predecesoraId) {
        agregarDependencia(sucesoraId, predecesoraId);
      }
      setConectandoDesde(null);
      setMousePos(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const headerMeses = useMemo(() => {
    const segmentos: { label: string; dias: number }[] = [];
    let cursor = rangoTimeline.inicio;
    for (let i = 0; i < totalDias; i++) {
      const label = formatMesAno(cursor);
      if (segmentos.length > 0 && segmentos[segmentos.length - 1].label === label) {
        segmentos[segmentos.length - 1].dias++;
      } else {
        segmentos.push({ label, dias: 1 });
      }
      cursor = addDays(cursor, 1);
    }
    return segmentos;
  }, [rangoTimeline.inicio, totalDias]);

  const semanas = useMemo(() => {
    const ticks: { offset: number; label: string }[] = [];
    for (let i = 0; i < totalDias; i += 7) {
      ticks.push({
        offset: i * pxPerDay,
        label: formatDiaMes(addDays(rangoTimeline.inicio, i)),
      });
    }
    return ticks;
  }, [rangoTimeline.inicio, totalDias, pxPerDay]);

  const hoy = todayISO();
  const hoyDentroDeRango = hoy >= rangoTimeline.inicio && hoy <= rangoTimeline.fin;
  const hoyOffset = diffDays(rangoTimeline.inicio, hoy) * pxPerDay;

  const toggleColapsar = (id: string) => {
    setColapsadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-1">
        {(["dia", "semana", "mes"] as const).map((z) => (
          <button
            key={z}
            onClick={() => setZoom(z)}
            className={cn(
              "rounded-sm border px-2 py-1 text-xs font-medium capitalize",
              zoom === z
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-text-secondary",
            )}
          >
            {z}
          </button>
        ))}
      </div>

      <div className="flex max-h-[65vh] overflow-y-auto rounded-md border border-border">
        <div className="sticky left-0 z-10 w-[600px] shrink-0 bg-surface">
          <div
            className="grid grid-cols-[1fr_90px_80px_70px_80px_44px] items-center border-b border-border bg-zinc-50 text-[11px] font-semibold text-text-secondary"
            style={{ height: ROW_HEIGHT * 2 }}
          >
            <span className="px-2">ACTIVIDAD</span>
            <span>ASIGNADO</span>
            <span>INICIO</span>
            <span>DÍAS LAB.</span>
            <span>VENCE</span>
            <span>%</span>
          </div>
          {rows.map((row, i) =>
            row.kind === "section" ? (
              <div
                key={`s-${row.id}-${i}`}
                style={{ height: ROW_HEIGHT }}
                className="flex items-center border-b border-border bg-zinc-50 px-2 text-xs font-semibold text-text-primary"
              >
                {row.label}
              </div>
            ) : (
              <div
                key={row.actividad.id}
                style={{ height: ROW_HEIGHT }}
                className="grid grid-cols-[1fr_90px_80px_70px_80px_44px] items-center border-b border-border px-0 text-xs text-text-primary"
              >
                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 overflow-hidden px-2",
                    row.indent && "pl-6",
                  )}
                  onClick={() => onAbrirActividad(row.actividad.id)}
                >
                  {row.hasSubtareas && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColapsar(row.actividad.id);
                      }}
                      className="shrink-0 text-text-muted"
                    >
                      {colapsadas.has(row.actividad.id) ? (
                        <ChevronRight size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </button>
                  )}
                  {row.actividad.progreso >= 100 ? (
                    <CircleCheck size={14} className="shrink-0 text-success" />
                  ) : (
                    <Circle size={14} className="shrink-0 text-text-muted" />
                  )}
                  <span className="truncate">{row.actividad.titulo}</span>
                </div>
                <span className="truncate text-text-secondary">
                  {row.actividad.asignado_a ?? "—"}
                </span>
                <span className="font-mono text-[11px] text-text-secondary">
                  {row.scheduled ? row.actividad.fecha_inicio : "—"}
                </span>
                <span className="font-mono text-[11px] text-text-secondary">
                  {row.scheduled
                    ? diasHabiles(
                        row.actividad.fecha_inicio!,
                        row.actividad.fecha_fin!,
                      )
                    : "—"}
                </span>
                <span className="font-mono text-[11px] text-text-secondary">
                  {row.scheduled ? row.actividad.fecha_fin : "—"}
                </span>
                {row.scheduled ? (
                  <span className="font-mono text-[11px] text-text-secondary">
                    {row.actividad.progreso}%
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      programarActividad(
                        row.actividad.id,
                        todayISO(),
                        addDays(todayISO(), 4),
                      )
                    }
                    className="mr-2 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white"
                  >
                    Programar
                  </button>
                )}
              </div>
            ),
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          <div style={{ width: totalWidth }}>
            <div
              className="sticky top-0 z-10 border-b border-border bg-zinc-50"
              style={{ height: ROW_HEIGHT * 2 }}
            >
              <div className="flex h-1/2 border-b border-border">
                {headerMeses.map((m, i) => (
                  <div
                    key={i}
                    style={{ width: m.dias * pxPerDay }}
                    className="shrink-0 truncate border-r border-border px-1.5 text-[11px] font-semibold capitalize text-text-secondary"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
              <div className="relative h-1/2">
                {semanas.map((s, i) => (
                  <span
                    key={i}
                    style={{ left: s.offset }}
                    className="absolute top-0 px-1 font-mono text-[10px] text-text-muted"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative" ref={cuerpoRef}>
              {hoyDentroDeRango && (
                <div
                  className="absolute top-0 z-20 h-full w-px bg-accent"
                  style={{ left: hoyOffset }}
                >
                  <span className="absolute -left-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                    •
                  </span>
                </div>
              )}
              <svg
                className="pointer-events-none absolute left-0 top-0 z-10 overflow-visible"
                width={totalWidth}
                height={rows.length * ROW_HEIGHT}
              >
                {dependenciasVisibles.map((l) => {
                  const stub = 12;
                  const cx1 = l.x1 + stub;
                  const cx2 = l.x2 - stub;
                  return (
                    <path
                      key={l.key}
                      d={`M ${l.x1} ${l.y1} C ${cx1} ${l.y1}, ${cx2} ${l.y2}, ${l.x2 - 4} ${l.y2}`}
                      fill="none"
                      stroke="#71717A"
                      strokeWidth={1.5}
                      markerEnd="url(#flecha)"
                    />
                  );
                })}
                {conectandoDesde &&
                  mousePos &&
                  (() => {
                    const origen = actividades.find((a) => a.id === conectandoDesde);
                    const idx = filaIndicePorId.get(conectandoDesde);
                    if (!origen?.fecha_inicio || !origen.fecha_fin || idx === undefined)
                      return null;
                    const geom = computeBarGeometry(
                      rangoTimeline.inicio,
                      origen.fecha_inicio,
                      origen.fecha_fin,
                      pxPerDay,
                    );
                    return (
                      <line
                        x1={geom.left + geom.width}
                        y1={idx * ROW_HEIGHT + ROW_HEIGHT / 2}
                        x2={mousePos.x}
                        y2={mousePos.y}
                        stroke="#3B5BDB"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                      />
                    );
                  })()}
                <defs>
                  <marker
                    id="flecha"
                    markerWidth={8}
                    markerHeight={8}
                    refX={6}
                    refY={3}
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="#A1A1AA" />
                  </marker>
                </defs>
              </svg>
              {rows.map((row, i) =>
                row.kind === "section" ? (
                  <div
                    key={`st-${row.id}-${i}`}
                    style={{ height: ROW_HEIGHT }}
                    className="relative border-b border-border"
                  >
                    {row.id !== "__backlog" && (
                      <SectionBar
                        {...computeBarGeometry(
                          rangoTimeline.inicio,
                          row.inicio,
                          row.fin,
                          pxPerDay,
                        )}
                      />
                    )}
                  </div>
                ) : (
                  <div
                    key={`bar-${row.actividad.id}`}
                    data-actividad-id={row.actividad.id}
                    style={{ height: ROW_HEIGHT }}
                    className="relative border-b border-border"
                  >
                    {row.scheduled && (
                      <GanttBar
                        actividad={row.actividad}
                        pxPerDay={pxPerDay}
                        onClick={() => onAbrirActividad(row.actividad.id)}
                        onMover={(delta) =>
                          moverActividadConSubtareas(row.actividad.id, delta)
                        }
                        onRedimensionar={(extremo, delta) =>
                          redimensionarActividad(
                            row.actividad.id,
                            extremo,
                            addDays(
                              extremo === "inicio"
                                ? row.actividad.fecha_inicio!
                                : row.actividad.fecha_fin!,
                              delta,
                            ),
                          )
                        }
                        onIniciarConexion={() => iniciarConexion(row.actividad.id)}
                        {...computeBarGeometry(
                          rangoTimeline.inicio,
                          row.actividad.fecha_inicio!,
                          row.actividad.fecha_fin!,
                          pxPerDay,
                        )}
                      />
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
