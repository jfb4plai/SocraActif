-- SocraActif — Supabase Schema
-- Projet partagé dfoaumjleqtxjeaplnna
-- Tables préfixées "socra_" pour éviter les conflits avec DiffActif (table sequences existante)
-- NE PAS recréer la table profiles ni le trigger updated_at (déjà existants)

create table if not exists socra_sequences (
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

create table if not exists socra_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references socra_sequences on delete cascade not null,
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

create table if not exists socra_attempts (
  id uuid primary key default gen_random_uuid(),
  step_id uuid references socra_steps on delete cascade not null,
  student_code text not null,
  answer text not null,
  error_classification text check (error_classification in ('faute', 'technique', 'technologie', 'correct')),
  match_hypothesis boolean,
  solved boolean default false,
  attempt_number int not null default 1,
  created_at timestamptz default now()
);

create table if not exists socra_conversations (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references socra_attempts on delete cascade not null,
  turn int not null,
  role text not null check (role in ('assistant', 'student')),
  content text not null,
  created_at timestamptz default now()
);

-- RLS
alter table socra_sequences enable row level security;
alter table socra_steps enable row level security;
alter table socra_attempts enable row level security;
alter table socra_conversations enable row level security;

-- Policies enseignant (propriétaire)
create policy "socra_sequences_owner" on socra_sequences
  for all using (auth.uid() = user_id);

create policy "socra_steps_owner" on socra_steps
  for all using (
    exists (select 1 from socra_sequences where socra_sequences.id = socra_steps.sequence_id and socra_sequences.user_id = auth.uid())
  );

create policy "socra_attempts_owner" on socra_attempts
  for all using (
    exists (
      select 1 from socra_steps
      join socra_sequences on socra_sequences.id = socra_steps.sequence_id
      where socra_steps.id = socra_attempts.step_id and socra_sequences.user_id = auth.uid()
    )
  );

create policy "socra_conversations_owner" on socra_conversations
  for all using (
    exists (
      select 1 from socra_attempts
      join socra_steps on socra_steps.id = socra_attempts.step_id
      join socra_sequences on socra_sequences.id = socra_steps.sequence_id
      where socra_attempts.id = socra_conversations.attempt_id and socra_sequences.user_id = auth.uid()
    )
  );

-- Policies élève (accès public via session_code pour mode autonomie)
create policy "socra_sequences_student_read" on socra_sequences
  for select using (session_code is not null);

create policy "socra_steps_student_read" on socra_steps
  for select using (
    exists (select 1 from socra_sequences where socra_sequences.id = socra_steps.sequence_id and socra_sequences.session_code is not null)
  );

create policy "socra_attempts_student_insert" on socra_attempts
  for insert with check (true);

create policy "socra_attempts_student_read" on socra_attempts
  for select using (true);

create policy "socra_conversations_student_all" on socra_conversations
  for all using (true);
