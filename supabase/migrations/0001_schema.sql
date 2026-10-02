-- Veritas Lab Suite · esquema de referencia (Postgres ≥ 11, compatible con Supabase)
-- Diseñado considerando 21 CFR Part 11 §11.10(e) (audit trail) y ALCOA+. Demo: no validado.

create table if not exists samples (
  id           text primary key,
  patient_id   text not null,
  patient_name text not null,
  matrix       text not null,
  status       text not null check (status in ('received', 'in_analysis', 'reviewed', 'released', 'rejected')),
  revision     integer not null default 1,
  received_at  timestamptz not null default now()
);

create table if not exists qc_runs (
  id                text primary key,
  analyte           text not null,
  run_index         integer not null,
  run_at            timestamptz not null default now(),
  corrective_action text,
  created_by        text not null,
  unique (analyte, run_index)
);

create table if not exists qc_points (
  run_id text not null references qc_runs (id),
  level  text not null,
  value  double precision not null,
  primary key (run_id, level)
);

create table if not exists results (
  id              text primary key,
  sample_id       text not null references samples (id),
  test_code       text not null,
  loinc           text,
  value           double precision,
  raw_value       text not null,
  units           text not null,
  reference_range text not null default '',
  flag            text not null default '',
  status          text not null default 'F',
  run_id          text references qc_runs (id),
  source          text not null check (source in ('astm', 'hl7', 'manual')),
  completed_at    timestamptz
);

create table if not exists signatures (
  id          bigserial primary key,
  sample_id   text not null references samples (id),
  revision    integer not null,
  user_id     text not null,
  role        text not null,
  meaning     text not null check (meaning in ('reviewed', 'approved')),
  signed_at   timestamptz not null default now(),
  record_hash text not null
);

create table if not exists audit_log (
  seq        bigserial primary key,
  created_at timestamptz not null default now(),
  actor      text not null,
  action     text not null,
  entity     text not null,
  entity_id  text not null,
  payload    jsonb,
  prev_hash  text not null default '',
  hash       text not null default ''
);

-- Encadena cada registro con el anterior (hash SHA-256 nativo de Postgres).
create or replace function audit_log_row_hash(r audit_log) returns text
language sql stable as $$
  select encode(sha256(convert_to(
    r.prev_hash || '|' || r.seq::text || '|' || r.created_at::text || '|' || r.actor || '|' ||
    r.action || '|' || r.entity || '|' || r.entity_id || '|' || coalesce(r.payload::text, ''),
    'UTF8')), 'hex')
$$;

create or replace function audit_log_chain() returns trigger
language plpgsql as $$
declare
  last_hash text;
begin
  perform pg_advisory_xact_lock(424242); -- serializa inserciones concurrentes
  select hash into last_hash from audit_log order by seq desc limit 1;
  new.prev_hash := coalesce(last_hash, repeat('0', 64));
  new.hash := audit_log_row_hash(new);
  return new;
end
$$;

drop trigger if exists audit_log_chain on audit_log;
create trigger audit_log_chain before insert on audit_log
  for each row execute function audit_log_chain();

-- Solo-agregado: nada se modifica ni se borra.
create or replace function audit_log_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log es append-only: % no permitido', tg_op;
end
$$;

drop trigger if exists audit_log_no_update on audit_log;
create trigger audit_log_no_update before update or delete on audit_log
  for each row execute function audit_log_immutable();

drop trigger if exists audit_log_no_truncate on audit_log;
create trigger audit_log_no_truncate before truncate on audit_log
  for each statement execute function audit_log_immutable();

-- Devuelve el seq del primer registro alterado, o NULL si la cadena está íntegra.
create or replace function audit_log_verify() returns bigint
language plpgsql as $$
declare
  r audit_log;
  expected_prev text := repeat('0', 64);
begin
  for r in select * from audit_log order by seq loop
    if r.prev_hash <> expected_prev or audit_log_row_hash(r) <> r.hash then
      return r.seq;
    end if;
    expected_prev := r.hash;
  end loop;
  return null;
end
$$;
