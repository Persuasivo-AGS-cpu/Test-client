-- Clarity-PM: esquema inicial (proyectos, actividades, log de actividad)

create table if not exists proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  prioridad text not null check (prioridad in ('baja','media','alta','urgente')) default 'media',
  etiquetas jsonb not null default '[]',
  columna_kanban text not null check (columna_kanban in ('idea','en_progreso','revision','completado')) default 'idea',
  iniciado_en_gantt boolean not null default false,
  fecha_inicio date,
  fecha_fin date,
  checklist jsonb not null default '[]',
  miembros text[] not null default '{}',
  propietario_user_id uuid not null references auth.users(id) default auth.uid(),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists actividades (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  parent_id uuid references actividades(id) on delete cascade,
  titulo text not null,
  descripcion text,
  seccion text,
  fecha_inicio date,
  fecha_fin date,
  progreso int not null default 0 check (progreso between 0 and 100),
  prioridad text not null check (prioridad in ('baja','media','alta','urgente')) default 'media',
  etiquetas jsonb not null default '[]',
  dependencias uuid[] not null default '{}',
  checklist jsonb not null default '[]',
  comentarios jsonb not null default '[]',
  asignado_a text,
  propietario_user_id uuid not null references auth.users(id) default auth.uid(),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists actividad_log (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  actividad_id uuid references actividades(id) on delete cascade,
  autor text not null,
  detalle text not null,
  creado_en timestamptz not null default now()
);

create index if not exists actividades_proyecto_id_idx on actividades(proyecto_id);
create index if not exists actividades_parent_id_idx on actividades(parent_id);
create index if not exists actividad_log_proyecto_id_idx on actividad_log(proyecto_id);

alter table proyectos enable row level security;
alter table actividades enable row level security;
alter table actividad_log enable row level security;

create policy "solo dueño" on proyectos
  for all using (propietario_user_id = auth.uid()) with check (propietario_user_id = auth.uid());

create policy "solo dueño" on actividades
  for all using (propietario_user_id = auth.uid()) with check (propietario_user_id = auth.uid());

create policy "solo dueño" on actividad_log
  for all using (
    exists (
      select 1 from proyectos p
      where p.id = actividad_log.proyecto_id
        and p.propietario_user_id = auth.uid()
    )
  );

-- Mantiene actualizado_en al día en cada update
create or replace function set_actualizado_en()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

create trigger proyectos_actualizado_en
  before update on proyectos
  for each row execute function set_actualizado_en();

create trigger actividades_actualizado_en
  before update on actividades
  for each row execute function set_actualizado_en();
