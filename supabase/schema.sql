-- SocraActif — Supabase Schema
-- Projet partagé dfoaumjleqtxjeaplnna
-- À exécuter dans l'éditeur SQL Supabase
-- NE PAS recréer la table profiles ni le trigger updated_at (déjà existants)

create table if not exists sequences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  subject text not null,
  mode text not null check (mode in ('autonomie', 'projection')),
  validation_threshold int not null default 70,
  blocking_mode text not null default 'soft' check (blocking_mode in ('strict', 'soft')),
  max_socratic_turns int not null default 4,
  session_code text unique,
  created_at timestamptz default now()
);

create table if not exists steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references sequences on delete cascade not null,
  position int not null,
  content text not null,
  expected_answer text not null,
  procedure_steps text not null,
  error_type_hypothesis text not null check (error_type_hypothesis in ('technique', 'technologie')),
  rupture_point text not null,
  distraction_errors text,
  scaffolding_level text not null default 'explicite' check (scaffolding_level in ('explicite', 'inductif')),
  explicit_hint text
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  step_id uuid references steps on delete cascade not null,
  student_code text not null,
  answer text not null,
  error_classification text check (error_classification in ('faute', 'technique', 'technologie', 'correct')),
  match_hypothesis boolean,
  solved boolean default false,
  attempt_number int not null default 1,
  created_at timestamptz default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references attempts on delete cascade not null,
  turn int not null,
  role text not null check (role in ('assistant', 'student')),
  content text not null,
  created_at timestamptz default now()
);

-- RLS
alter table sequences enable row level security;
alter table steps enable row level security;
alter table attempts enable row level security;
alter table conversations enable row level security;

-- Policies enseignant (propriétaire)
create policy "sequences_owner" on sequences
  for all using (auth.uid() = user_id);

create policy "steps_owner" on steps
  for all using (
    exists (select 1 from sequences where sequences.id = steps.sequence_id and sequences.user_id = auth.uid())
  );

create policy "attempts_owner" on attempts
  for all using (
    exists (
      select 1 from steps
      join sequences on sequences.id = steps.sequence_id
      where steps.id = attempts.step_id and sequences.user_id = auth.uid()
    )
  );

create policy "conversations_owner" on conversations
  for all using (
    exists (
      select 1 from attempts
      join steps on steps.id = attempts.step_id
      join sequences on sequences.id = steps.sequence_id
      where attempts.id = conversations.attempt_id and sequences.user_id = auth.uid()
    )
  );

-- Policies élève (accès public via session_code pour mode autonomie)
create policy "sequences_student_read" on sequences
  for select using (session_code is not null);

create policy "steps_student_read" on steps
  for select using (
    exists (select 1 from sequences where sequences.id = steps.sequence_id and sequences.session_code is not null)
  );

create policy "attempts_student_insert" on attempts
  for insert with check (true);

create policy "attempts_student_read" on attempts
  for select using (true);

create policy "conversations_student_all" on conversations
  for all using (true);
