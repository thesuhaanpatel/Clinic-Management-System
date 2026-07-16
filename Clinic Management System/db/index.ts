import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Enable WAL mode for better concurrency and real-time updates
const sqlite = new Database("hospital.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");

export const db = drizzle(sqlite, { schema });