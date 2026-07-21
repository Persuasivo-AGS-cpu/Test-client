"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const RUTAS_SIN_NAV = ["/login", "/unauthorized"];

export function AppNav() {
  const pathname = usePathname();
  if (RUTAS_SIN_NAV.some((r) => pathname.startsWith(r))) return null;

  const links = [
    { href: "/kanban", label: "Kanban" },
    { href: "/gantt", label: "Gantt" },
  ];

  return (
    <nav className="flex items-center gap-1 border-b border-border bg-surface px-6 py-2">
      <span className="mr-4 text-sm font-semibold text-text-primary">
        Clarity-PM
      </span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "rounded-sm px-2.5 py-1 text-sm font-medium",
            pathname.startsWith(l.href)
              ? "bg-accent-soft text-accent"
              : "text-text-secondary hover:bg-zinc-100",
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
