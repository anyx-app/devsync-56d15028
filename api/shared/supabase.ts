
import { BACKEND_CONFIG } from '../config.js';

// Supabase Backend Proxy SDK (Hybrid Strategy)
// Designed to run in Vercel Serverless Functions
// Routes queries through Anyx Backend similarly to the frontend SDK

interface QueryFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: unknown;
}

interface QueryOrder {
  column: string;
  ascending?: boolean;
}

class QueryBuilder {
  private tableName: string;
  private selectClause: string = '*';
  private filtersList: QueryFilter[] = [];
  private orderList: QueryOrder[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private singleMode: boolean = false;
  private operation?: 'select' | 'insert' | 'update' | 'delete';
  private insertValues?: Record<string, unknown>[];
  private updateValues?: Record<string, unknown>;

  constructor(table: string) {
    this.tableName = table;
  }

  select(columns: string = '*') {
    this.selectClause = columns;
    this.operation = 'select';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filtersList.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: unknown) { this.filtersList.push({ column, operator: 'neq', value }); return this; }
  gt(column: string, value: unknown) { this.filtersList.push({ column, operator: 'gt', value }); return this; }
  gte(column: string, value: unknown) { this.filtersList.push({ column, operator: 'gte', value }); return this; }
  lt(column: string, value: unknown) { this.filtersList.push({ column, operator: 'lt', value }); return this; }
  lte(column: string, value: unknown) { this.filtersList.push({ column, operator: 'lte', value }); return this; }
  like(column: string, value: string) { this.filtersList.push({ column, operator: 'like', value }); return this; }
  ilike(column: string, value: string) { this.filtersList.push({ column, operator: 'ilike', value }); return this; }
  in(column: string, values: unknown[]) { this.filtersList.push({ column, operator: 'in', value: values }); return this; }
  is(column: string, value: null) { this.filtersList.push({ column, operator: 'is', value }); return this; }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderList.push({ column, ascending: options?.ascending ?? true });
    return this;
  }

  limit(count: number) { this.limitValue = count; return this; }
  offset(count: number) { this.offsetValue = count; return this; }
  single() { this.singleMode = true; return this; }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = 'insert';
    this.insertValues = Array.isArray(values) ? values : [values];
    return this;
  }

  update(values: Record<string, unknown>) {
    this.operation = 'update';
    this.updateValues = values;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  async execute() {
    // STRICT process.env usage for Vercel Node Runtime
    const projectId = process.env.VITE_PROJECT_ID || process.env.NEXT_PUBLIC_PROJECT_ID;
    const backendUrl = process.env.VITE_ANYX_SERVER_URL || process.env.NEXT_PUBLIC_ANYX_SERVER_URL;
    
    // HYBRID STRATEGY for Schema Isolation:
    // 1. Env Var (Preferred, set by automation)
    // 2. Config File (Fallback, set by Agent)
    const schema = process.env.SUPABASE_SCHEMA || process.env.VITE_SUPABASE_SCHEMA || BACKEND_CONFIG.schema;

    if (!projectId || !backendUrl) {
      console.error('Environment check failed:', { hasProjectId: !!projectId, hasBackendUrl: !!backendUrl });
      throw new Error(`CRITICAL_CONFIG_ERROR: Missing env vars in Backend. PID: ${!!projectId}, URL: ${!!backendUrl}`);
    }

    const payload: Record<string, unknown> = {
      table: this.tableName,
      operation: this.operation || 'select'
    };

    // INJECT SCHEMA: Critical fix for multi-tenant isolation
    if (schema) {
      payload.schema = schema;
    } else {
        // Warn if both missing - this likely means default to public which might fail for Shared Schema projects
        console.warn('Backend SDK: SUPABASE_SCHEMA not set and BACKEND_CONFIG.schema is empty. Defaulting to public.');
    }

    // Construct payload (simplified for clarity)
    if (this.operation === 'insert') {
        payload.values = this.insertValues;
        payload.select = this.selectClause;
    } else if (this.operation === 'update') {
        payload.values = this.updateValues;
        payload.filters = this.filtersList;
        payload.select = this.selectClause;
    } else if (this.operation === 'delete') {
        payload.filters = this.filtersList;
    } else {
        payload.select = this.selectClause || '*';
        payload.filters = this.filtersList;
        payload.order = this.orderList;
        payload.limit = this.limitValue;
        payload.offset = this.offsetValue;
        payload.single = this.singleMode;
    }

    try {
      // Use global fetch (available in Node 18+)
      const response = await fetch(`${backendUrl}/api/projects/${projectId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Database Proxy Failed: ${response.status} ${text}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend Proxy Request Failed:', error);
      throw error;
    }
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from: (table: string) => new QueryBuilder(table)
};
