import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';
dotenv.config();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    host: process.env.PGHOST!,
    user: process.env.PGUSER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB!,
  },
} satisfies Config;
