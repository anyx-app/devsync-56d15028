# Schema Plan - DevSync

## Overview
DevSync requires a robust schema to handle teams, projects, environment templates, and real-time synchronization of configurations and dependencies. The schema is designed for Supabase (PostgreSQL).

## Core Tables

### 1. `profiles` (extends `auth.users`)
- **id** (uuid, PK): References `auth.users.id`
- **username** (text, unique)
- **full_name** (text)
- **avatar_url** (text)
- **created_at** (timestamptz)
- **updated_at** (timestamptz)

### 2. `teams`
- **id** (uuid, PK)
- **name** (text)
- **slug** (text, unique)
- **owner_id** (uuid): References `profiles.id`
- **created_at** (timestamptz)
- **updated_at** (timestamptz)

### 3. `team_members`
- **team_id** (uuid, PK): References `teams.id`
- **user_id** (uuid, PK): References `profiles.id`
- **role** (text): 'admin', 'member', 'viewer'
- **joined_at** (timestamptz)

### 4. `projects`
- **id** (uuid, PK)
- **team_id** (uuid): References `teams.id`
- **name** (text)
- **description** (text)
- **repository_url** (text): Optional git repo link
- **created_at** (timestamptz)
- **updated_at** (timestamptz)

## Feature Specific Tables

### 5. `env_templates`
Blueprints for spinning up new environments.
- **id** (uuid, PK)
- **project_id** (uuid): References `projects.id`
- **name** (text): e.g., "Node.js Starter", "Python Data Science"
- **config_json** (jsonb): Default configuration structure
- **dependencies_json** (jsonb): Default list of dependencies
- **is_public** (boolean): For community sharing (future proofing)
- **created_by** (uuid): References `profiles.id`
- **created_at** (timestamptz)

### 6. `environments`
Actual instances of development setups.
- **id** (uuid, PK)
- **project_id** (uuid): References `projects.id`
- **template_id** (uuid, nullable): References `env_templates.id`
- **user_id** (uuid): The developer who owns this local env (References `profiles.id`)
- **name** (text): e.g., "John's MacBook", "Staging Server"
- **status** (text): 'active', 'offline', 'syncing', 'error'
- **last_sync_at** (timestamptz)
- **created_at** (timestamptz)

### 7. `configurations`
Synced environment variables or config files.
- **id** (uuid, PK)
- **project_id** (uuid): References `projects.id`
- **environment_id** (uuid, nullable): If specific to an env, otherwise project global default
- **key** (text): e.g., "DATABASE_URL", ".eslintrc"
- **value** (text): The actual value or file content
- **is_secret** (boolean): If true, value might be encrypted or masked in UI
- **type** (text): 'env_var', 'file'
- **version** (int): For optimistic concurrency control
- **updated_at** (timestamptz)

### 8. `dependencies`
Tracked packages.
- **id** (uuid, PK)
- **project_id** (uuid): References `projects.id`
- **environment_id** (uuid, nullable): If identifying drift in a specific env
- **package_manager** (text): 'npm', 'pip', 'gem', 'cargo'
- **package_name** (text)
- **version_constraint** (text): e.g., "^1.0.0"
- **resolved_version** (text): e.g., "1.2.3"
- **status** (text): 'healthy', 'outdated', 'vulnerable'
- **updated_at** (timestamptz)

### 9. `health_checks`
Monitoring logs for environments.
- **id** (uuid, PK)
- **environment_id** (uuid): References `environments.id`
- **metric_type** (text): 'cpu', 'memory', 'disk', 'ping'
- **value** (jsonb): The measurement data
- **recorded_at** (timestamptz)

## Security Policies (RLS)
- **Profiles**: Users can read all, update own.
- **Teams**: Members can read. Admins can update.
- **Projects**: Team members can read/write.
- **Environments**: Team members can read. Owners can write.
- **Secrets**: Only 'admin' role or the environment owner can reveal secrets.
