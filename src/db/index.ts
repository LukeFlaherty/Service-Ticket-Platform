import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy singleton — defers connection until the first query so the module
// can be imported at build time without DATABASE_URL being set.
type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

let _instance: DrizzleDB | undefined;

function getInstance(): DrizzleDB {
  if (!_instance) {
    _instance = drizzle(neon(process.env.DATABASE_URL!), { schema });
  }
  return _instance;
}

export const db: DrizzleDB = new Proxy({} as DrizzleDB, {
  get(_, prop: string | symbol) {
    return getInstance()[prop as keyof DrizzleDB];
  },
});

export type DB = DrizzleDB;
