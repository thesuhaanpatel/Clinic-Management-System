import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",   // where your schema is
  out: "./drizzle",               // migrations output folder
  dialect: "sqlite",              // 👈 this is required now
  dbCredentials: {
    url: "./hospital.db",         // SQLite file path
  },
});
