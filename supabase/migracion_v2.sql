alter table matches
  add column status text not null default 'scheduled'
    check (status in ('scheduled', 'first_half', 'half_time', 'second_half', 'finished')),
  add column half_minutes int not null default 45 check (half_minutes between 1 and 120),
  add column half_started_at timestamptz;


update matches set status = 'finished' where home_goals is not null;

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

alter table match_events enable row level security;
alter table lineups      enable row level security;

create policy "ver eventos"      on match_events for select using (true);
create policy "ver alineaciones" on lineups      for select using (true);
create policy "editar eventos" on match_events for all to authenticated
  using (is_editor()) with check (is_editor());
create policy "editar alineaciones" on lineups for all to authenticated
  using (is_editor()) with check (is_editor());
