create table championships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null references championships(id) on delete cascade,
  name text not null,
  unique (championship_id, name)
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null references championships(id) on delete cascade,
  home_id uuid not null references teams(id) on delete cascade,
  away_id uuid not null references teams(id) on delete cascade,
  match_date timestamp,              -- hora local, sin zona horaria
  round int,                         -- jornada (la llena el generador)
  home_goals int check (home_goals >= 0),
  away_goals int check (away_goals >= 0),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'first_half', 'half_time', 'second_half', 'finished')),
  half_minutes int not null default 45 check (half_minutes between 1 and 120),
  half_started_at timestamptz,       -- cuándo empezó el tiempo en curso
  check (home_id <> away_id),
  check ((home_goals is null) = (away_goals is null))
);

-- Goles y tarjetas
create table match_events (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null references championships(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  type text not null check (type in ('goal', 'yellow', 'red')),
  player text,
  minute int check (minute >= 0),
  created_at timestamptz not null default now()
);

-- Alineaciones
create table lineups (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid not null references championships(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  player text not null,
  number int,
  is_starter boolean not null default true,
  sort_order int not null default 0
);

-- Correos que pueden editar. Cambia el correo por el tuyo.
create table editors (email text primary key);
insert into editors (email) values ('TU_CORREO@ejemplo.com');

create or replace function is_editor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.editors
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;
grant execute on function is_editor() to anon, authenticated;

-- Seguridad: todos leen, solo los editores escriben.
alter table championships enable row level security;
alter table teams         enable row level security;
alter table matches       enable row level security;
alter table match_events  enable row level security;
alter table lineups       enable row level security;
alter table editors       enable row level security;  -- sin políticas: nadie la lee por la API

create policy "ver campeonatos" on championships for select using (true);
create policy "ver equipos"     on teams         for select using (true);
create policy "ver partidos"    on matches       for select using (true);
create policy "ver eventos"     on match_events  for select using (true);
create policy "ver alineaciones" on lineups      for select using (true);

create policy "editar campeonatos" on championships for all to authenticated
  using (is_editor()) with check (is_editor());
create policy "editar equipos" on teams for all to authenticated
  using (is_editor()) with check (is_editor());
create policy "editar partidos" on matches for all to authenticated
  using (is_editor()) with check (is_editor());
create policy "editar eventos" on match_events for all to authenticated
  using (is_editor()) with check (is_editor());
create policy "editar alineaciones" on lineups for all to authenticated
  using (is_editor()) with check (is_editor());
