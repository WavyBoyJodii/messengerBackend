import pg from 'pg';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema: schema });
