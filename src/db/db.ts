import pg from 'pg';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
