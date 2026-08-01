// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('--- ⏳ Running Production Database Migrations ---');

  // Gunakan max 1 connection khusus untuk migrasi
  const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    // Membaca folder SQL migrasi dan mengeksekusi ke PostgreSQL
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('--- ✅ Migrations Completed Successfully! ---');
    process.exit(0);
  } catch (error) {
    console.error('--- ❌ Migration Failed! ---', error);
    process.exit(1);
  }
}

runMigration();
