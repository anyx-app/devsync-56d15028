
// Anyx Backend Configuration
// This file is auto-maintained by the AI Agent.
// Schema isolation is critical for multi-tenant security.

export const BACKEND_CONFIG = {
  // The database schema usage for this project.
  // When 'undefined', the SDK will attempt to read process.env.SUPABASE_SCHEMA.
  // If the agent populates this, it serves as a fallback/fail-safe.
  schema: undefined as string | undefined, 
};
