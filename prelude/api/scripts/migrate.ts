/* eslint-disable no-console */
import './load-env';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'migrations');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         filename TEXT PRIMARY KEY,
         applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`,
    );

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [file],
      );
      if (rows.length > 0) {
        console.log(`skip   ${file} (already applied)`);
        continue;
      }

      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`apply  ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('migrations complete');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
