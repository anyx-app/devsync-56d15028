-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- TEAMS
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  owner_id uuid references public.profiles(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.teams enable row level security;

-- TEAM MEMBERS
create table public.team_members (
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'member', 'viewer')) default 'member',
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);
alter table public.team_members enable row level security;

-- PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  description text,
  repository_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.projects enable row level security;

-- ENV TEMPLATES
create table public.env_templates (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  config_json jsonb default '{}'::jsonb,
  dependencies_json jsonb default '[]'::jsonb,
  is_public boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.env_templates enable row level security;

-- ENVIRONMENTS
create table public.environments (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  template_id uuid references public.env_templates(id),
  user_id uuid references public.profiles(id),
  name text not null,
  status text check (status in ('active', 'offline', 'syncing', 'error')) default 'offline',
  last_sync_at timestamptz,
  created_at timestamptz default now()
);
alter table public.environments enable row level security;

-- CONFIGURATIONS
create table public.configurations (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  environment_id uuid references public.environments(id) on delete cascade, -- Nullable for project-wide defaults
  key text not null,
  value text,
  is_secret boolean default false,
  type text check (type in ('env_var', 'file')) default 'env_var',
  version int default 1,
  updated_at timestamptz default now()
);
alter table public.configurations enable row level security;

-- DEPENDENCIES
create table public.dependencies (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  environment_id uuid references public.environments(id) on delete cascade,
  package_manager text check (package_manager in ('npm', 'pip', 'gem', 'cargo')) not null,
  package_name text not null,
  version_constraint text,
  resolved_version text,
  status text check (status in ('healthy', 'outdated', 'vulnerable')) default 'healthy',
  updated_at timestamptz default now()
);
alter table public.dependencies enable row level security;

-- HEALTH CHECKS
create table public.health_checks (
  id uuid default uuid_generate_v4() primary key,
  environment_id uuid references public.environments(id) on delete cascade not null,
  metric_type text not null,
  value jsonb not null,
  recorded_at timestamptz default now()
);
alter table public.health_checks enable row level security;


-- POLICIES (Simplified for Init)

-- Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Teams
create policy "Team members can view teams." on public.teams for select using (
  auth.uid() in (select user_id from public.team_members where team_id = id)
);
create policy "Owners can update teams." on public.teams for update using (auth.uid() = owner_id);
create policy "Owners can delete teams." on public.teams for delete using (auth.uid() = owner_id);
create policy "Authenticated users can create teams." on public.teams for insert with check (auth.uid() = owner_id);

-- Projects
create policy "Team members can view projects." on public.projects for select using (
  exists (select 1 from public.team_members where team_id = projects.team_id and user_id = auth.uid())
);
create policy "Team members can insert projects." on public.projects for insert with check (
  exists (select 1 from public.team_members where team_id = projects.team_id and user_id = auth.uid())
);

-- Environments
create policy "Team members can view environments." on public.environments for select using (
  exists (select 1 from public.team_members tm
          join public.projects p on p.team_id = tm.team_id
          where p.id = environments.project_id and tm.user_id = auth.uid())
);
create policy "Users can manage their own environments." on public.environments for all using (user_id = auth.uid());

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
