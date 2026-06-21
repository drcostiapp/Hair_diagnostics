import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EventRecord } from '../common/types';
import { TicketsService } from '../tickets/tickets.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tickets: TicketsService,
  ) {}

  async list(): Promise<EventRecord[]> {
    return this.db.many<EventRecord>(
      `SELECT * FROM events ORDER BY start_time ASC`,
    );
  }

  async getById(id: string): Promise<EventRecord> {
    const event = await this.db.one<EventRecord>(
      'SELECT * FROM events WHERE id = $1',
      [id],
    );
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(creatorId: string, dto: CreateEventDto): Promise<EventRecord> {
    const event = await this.db.one<EventRecord>(
      `INSERT INTO events
         (title, description, venue, city, start_time, end_time, price_cents, capacity, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        dto.title,
        dto.description ?? null,
        dto.venue ?? null,
        dto.city ?? null,
        dto.start_time,
        dto.end_time,
        dto.price_cents ?? 0,
        dto.capacity ?? null,
        creatorId,
      ],
    );
    if (!event) {
      throw new NotFoundException('Event could not be created');
    }
    await this.db.query(
      `INSERT INTO event_metrics (event_id) VALUES ($1)
       ON CONFLICT (event_id) DO NOTHING`,
      [event.id],
    );
    return event;
  }

  /**
   * Attendee list — only callable by a holder of a paid ticket for the event.
   */
  async getAttendees(eventId: string, requesterId: string) {
    await this.getById(eventId); // 404 if missing
    const hasTicket = await this.tickets.hasPaidTicket(requesterId, eventId);
    if (!hasTicket) {
      throw new ForbiddenException(
        'A paid ticket is required to view attendees',
      );
    }

    // Everyone with a paid ticket is an attendee. Exclude users the requester
    // has blocked or who have blocked the requester.
    return this.db.many(
      `SELECT u.id, u.name, u.age, u.gender, u.orientation, u.interests, u.bio,
              a.checked_in_at IS NOT NULL AS checked_in
         FROM tickets t
         JOIN users u ON u.id = t.user_id
         LEFT JOIN attendance a ON a.user_id = u.id AND a.event_id = t.event_id
        WHERE t.event_id = $1
          AND t.status = 'paid'
          AND u.id <> $2
          AND NOT EXISTS (
            SELECT 1 FROM blocks b
             WHERE (b.blocker_id = $2 AND b.blocked_id = u.id)
                OR (b.blocker_id = u.id AND b.blocked_id = $2)
          )
        ORDER BY u.name ASC`,
      [eventId, requesterId],
    );
  }

  async checkin(eventId: string, userId: string) {
    await this.getById(eventId);
    const hasTicket = await this.tickets.hasPaidTicket(userId, eventId);
    if (!hasTicket) {
      throw new ForbiddenException('A paid ticket is required to check in');
    }

    return this.db.transaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO attendance (event_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (event_id, user_id) DO NOTHING
         RETURNING id, checked_in_at`,
        [eventId, userId],
      );

      if (rows.length > 0) {
        await client.query(
          `UPDATE event_metrics SET checkins = checkins + 1, updated_at = now()
           WHERE event_id = $1`,
          [eventId],
        );
      }

      return { event_id: eventId, checked_in: true };
    });
  }
}
