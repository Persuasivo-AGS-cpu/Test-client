const DAY_MS = 24 * 60 * 60 * 1000;

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, dias: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + dias);
  return toISODate(date);
}

export function diffDays(isoA: string, isoB: string): number {
  const a = parseISODate(isoA);
  const b = parseISODate(isoB);
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function formatDiaMes(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit" }).format(
    parseISODate(iso),
  );
}

export function formatMesAno(iso: string): string {
  const label = new Intl.DateTimeFormat("es-MX", {
    month: "short",
    year: "2-digit",
  }).format(parseISODate(iso));
  return label.replace(".", "");
}

export function diasHabiles(inicio: string, fin: string): number {
  let count = 0;
  let cursor = parseISODate(inicio);
  const end = parseISODate(fin);
  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor = new Date(cursor.getTime() + DAY_MS);
  }
  return count;
}
