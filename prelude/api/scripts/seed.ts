/* eslint-disable no-console */
import './load-env';
import { Client } from 'pg';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query('BEGIN');

    // Demo users -----------------------------------------------------------
    const demoUsers = [
      {
        name: 'Ava',
        phone: '+10000000001',
        age: 27,
        gender: 'female',
        orientation: 'straight',
        interests: ['techno', 'cocktails', 'art'],
        is_admin: false,
      },
      {
        name: 'Mateo',
        phone: '+10000000002',
        age: 29,
        gender: 'male',
        orientation: 'straight',
        interests: ['house', 'cocktails', 'travel'],
        is_admin: false,
      },
      {
        name: 'Noor',
        phone: '+10000000003',
        age: 25,
        gender: 'female',
        orientation: 'bisexual',
        interests: ['art', 'fashion', 'techno'],
        is_admin: false,
      },
      {
        name: 'Admin',
        phone: process.env.ADMIN_PHONE || '+10000000000',
        age: 35,
        gender: 'nonbinary',
        orientation: 'queer',
        interests: ['events'],
        is_admin: true,
      },
    ];

    const userIds: Record<string, string> = {};
    for (const u of demoUsers) {
      const { rows } = await client.query(
        `INSERT INTO users (name, phone, age, gender, orientation, interests, verification_status, phone_verified, is_admin)
         VALUES ($1,$2,$3,$4,$5,$6,'verified',true,$7)
         ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [u.name, u.phone, u.age, u.gender, u.orientation, u.interests, u.is_admin],
      );
      userIds[u.phone] = rows[0].id;
      console.log(`user   ${u.name} -> ${rows[0].id}`);
    }

    // Demo event -----------------------------------------------------------
    const adminId = userIds[process.env.ADMIN_PHONE || '+10000000000'];
    const start = new Date(Date.now() + 6 * 60 * 60 * 1000); // T-6h
    const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);

    const { rows: eventRows } = await client.query(
      `INSERT INTO events (title, description, venue, city, start_time, end_time, price_cents, capacity, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        'Prelude Launch — Warehouse Set',
        'A night of deep techno in an undisclosed warehouse.',
        'The Annex',
        'Berlin',
        start.toISOString(),
        end.toISOString(),
        2500,
        300,
        adminId,
      ],
    );
    const eventId = eventRows[0].id;
    console.log(`event  ${eventId}`);

    await client.query(
      `INSERT INTO event_metrics (event_id) VALUES ($1)
       ON CONFLICT (event_id) DO NOTHING`,
      [eventId],
    );

    // Give the three demo guests paid tickets ------------------------------
    for (const phone of ['+10000000001', '+10000000002', '+10000000003']) {
      await client.query(
        `INSERT INTO tickets (event_id, user_id, status, price_cents)
         VALUES ($1,$2,'paid',2500)
         ON CONFLICT (event_id, user_id) DO NOTHING`,
        [eventId, userIds[phone]],
      );
    }
    await client.query(
      `UPDATE event_metrics SET tickets_sold = 3, updated_at = now() WHERE event_id = $1`,
      [eventId],
    );

    await client.query('COMMIT');
    console.log('seed complete');
    console.log(`\nDemo event id: ${eventId}`);
    console.log('Log in with phone +10000000001 and otp 0000 to try the flow.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
