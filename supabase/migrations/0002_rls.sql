-- Solo para un proyecto Supabase (usa auth.jwt()). No se ejecuta en los tests con PGlite.
-- Rol del usuario en app_metadata.role: 'analyst' | 'validator' | 'admin'.

alter table samples    enable row level security;
alter table results    enable row level security;
alter table qc_runs    enable row level security;
alter table qc_points  enable row level security;
alter table signatures enable row level security;
alter table audit_log  enable row level security;

create policy "lectura para usuarios autenticados" on samples    for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on results    for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on qc_runs    for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on qc_points  for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on signatures for select to authenticated using (true);
create policy "lectura para usuarios autenticados" on audit_log  for select to authenticated using (true);

create policy "registro de muestras por personal del laboratorio" on samples for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('analyst', 'validator', 'admin'));

-- Solo el validador puede dejar una muestra en estado 'released'.
create policy "solo validador libera" on samples for update to authenticated
  using (true)
  with check (status <> 'released' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'validator');

-- La firma es del propio usuario; 'approved' solo para validadores.
create policy "firma propia y por rol" on signatures for insert to authenticated
  with check (
    user_id = auth.uid()::text
    and (meaning = 'reviewed' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'validator')
  );

-- El audit trail solo acepta inserciones a nombre del propio usuario; no hay políticas de update/delete.
create policy "auditoría a nombre propio" on audit_log for insert to authenticated
  with check (actor = auth.uid()::text);
