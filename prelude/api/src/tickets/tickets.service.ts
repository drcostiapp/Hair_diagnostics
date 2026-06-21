import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface TicketRecord {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  price_cents: number;
  created_at: Date;
}

@Injectable()
export class TicketsService {
  constructor(private readonly db: DatabaseService) {}

  /** True if the user holds a paid ticket for the event. */
  async hasPaidTicket(userId: string, eventId: string): Promise<boolean> {
    const row = await this.db.one(
      `SELECT 1 FROM tickets
        WHERE user_id = $1 AND event_id = $2 AND status = 'paid'`,
      [userId, eventId],
    );
    return !!row;
  }

  /** Mock-payment purchase. Idempotent on (event_id, user_id). */
  async purchase(userId: string, eventId: string): Promise<TicketRecord> {
    const event = await this.db.one<{ id: string; price_cents: number }>(
      'SELECT id, price_cents FROM events WHERE id = $1',
      [eventId],
    );
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.db.transaction(async (client) => {
      const { rows } = await client.query<TicketRecord>(
        `INSERT INTO tickets (event_id, user_id, status, price_cents)
         VALUES ($1, $2, 'paid', $3)
         ON CONFLICT (event_id, user_id)
         DO UPDATE SET status = 'paid'
         RETURNING *`,
        [eventId, userId, event.price_cents],
      );

      await client.query(
        `INSERT INTO event_metrics (event_id, tickets_sold)
         VALUES ($1, 1)
         ON CONFLICT (event_id)
         DO UPDATE SET tickets_sold = event_metrics.tickets_sold + 1,
                       updated_at = now()`,
        [eventId],
      );

      return rows[0];
    });
  }
}
