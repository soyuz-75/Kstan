import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

// Reuse one pool across hot reloads in dev and across invocations on a warm serverless instance.
const globalForDb = globalThis as unknown as { __kstanDb?: Db };

export function getDb(): Db {
  if (globalForDb.__kstanDb) return globalForDb.__kstanDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, {
    max: process.env.NODE_ENV === "production" ? 5 : 10,
    // Neon/Supabase poolers (PgBouncer, transaction mode) don't support prepared statements.
    prepare: false,
  });
  globalForDb.__kstanDb = drizzle(client, { schema });
  return globalForDb.__kstanDb;
}

export { schema };
