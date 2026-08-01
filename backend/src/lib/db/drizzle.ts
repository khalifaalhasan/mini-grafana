import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

// Tabel di-import langsung di service saat dibutuhkan (from './schema')
export const db = drizzle(process.env.DATABASE_URL!);

export type Db = typeof db;
