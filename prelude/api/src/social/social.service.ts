import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { TicketsService } from '../tickets/tickets.service';
import { MlService } from '../ml/ml.service';
import { EventsGateway } from '../gateway/events.gateway';
import { EventRecord, UserRecord } from '../common/types';
import {
  interestSimilarity,
  matchScore,
  MatchScoreFactors,
} from '../common/match-score';

interface CandidateRow {
  id: string;
  name: string;
  age: number;
  gender: string;
  orientation: string;
  interests: string[];
  bio: string | null;
  likes_received_from_me: number;
  likes_sent_to_me: number;
}

@Injectable()
export class SocialService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tickets: TicketsService,
    private readonly ml: MlService,
    private readonly gateway: EventsGateway,
    private readonly config: ConfigService,
  ) {}

  /** Guard: caller must hold a paid ticket for the event. Returns the event. */
  private async requireTicket(
    userId: string,
    eventId: string,
  ): Promise<EventRecord> {
    const event = await this.db.one<EventRecord>(
      'SELECT * FROM events WHERE id = $1',
      [eventId],
    );
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const hasTicket = await this.tickets.hasPaidTicket(userId, eventId);
    if (!hasTicket) {
      throw new ForbiddenException('A paid ticket is required for this event');
    }
    return event;
  }

  // ----------------------------------------------------------------- feed
  async feed(userId: string, eventId: string) {
    const event = await this.requireTicket(userId, eventId);

    const me = await this.db.one<UserRecord>(
      'SELECT * FROM users WHERE id = $1',
      [userId],
    );
    if (!me) throw new NotFoundException('User not found');

    // Candidates: other paid-ticket holders not yet acted on by me, excluding
    // blocks in either direction.
    const candidates = await this.db.many<CandidateRow>(
      `SELECT u.id, u.name, u.age, u.gender, u.orientation, u.interests, u.bio,
              0 AS likes_received_from_me,
              CASE WHEN EXISTS (
                SELECT 1 FROM social_edges se
                 WHERE se.event_id = $1 AND se.user_a = u.id AND se.user_b = $2
                   AND se.edge_type IN ('like','superlike')
              ) THEN 1 ELSE 0 END AS likes_sent_to_me
         FROM tickets t
         JOIN users u ON u.id = t.user_id
        WHERE t.event_id = $1
          AND t.status = 'paid'
          AND u.id <> $2
          AND NOT EXISTS (
            SELECT 1 FROM social_edges e
             WHERE e.event_id = $1 AND e.user_a = $2 AND e.user_b = u.id
          )
          AND NOT EXISTS (
            SELECT 1 FROM blocks b
             WHERE (b.blocker_id = $2 AND b.blocked_id = u.id)
                OR (b.blocker_id = u.id AND b.blocked_id = $2)
          )`,
      [eventId, userId],
    );

    if (candidates.length === 0) {
      return { source: 'local', event_id: eventId, users: [] };
    }

    // Try ML ranking first.
    const mlInput = candidates.map((c) => ({
      user_id: c.id,
      interests: c.interests,
      age: c.age,
      gender: c.gender,
      orientation: c.orientation,
    }));
    const mlOrder = await this.ml.rank(eventId, userId, mlInput);

    if (mlOrder && mlOrder.length) {
      const byId = new Map(candidates.map((c) => [c.id, c]));
      const ordered = mlOrder
        .map((id) => byId.get(id))
        .filter((c): c is CandidateRow => !!c)
        .map((c) => this.shapeCandidate(c));
      // Append any candidates the ML omitted.
      const seen = new Set(mlOrder);
      for (const c of candidates) {
        if (!seen.has(c.id)) ordered.push(this.shapeCandidate(c));
      }
      return { source: 'ml', event_id: eventId, users: ordered };
    }

    // Local deterministic fallback ranking via MATCH_SCORE.
    const minutesUntilStart =
      (new Date(event.start_time).getTime() - Date.now()) / 60000;

    const scored = candidates
      .map((c) => {
        const factors = this.localFactors(me, c);
        const score = matchScore(factors, minutesUntilStart);
        return { c, score };
      })
      // Deterministic: sort by score desc, tie-break by id.
      .sort((a, b) => b.score - a.score || a.c.id.localeCompare(b.c.id))
      .map(({ c, score }) => ({
        ...this.shapeCandidate(c),
        score: Number(score.toFixed(4)),
      }));

    return { source: 'local', event_id: eventId, users: scored };
  }

  private shapeCandidate(c: CandidateRow) {
    return {
      user_id: c.id,
      name: c.name,
      age: c.age,
      gender: c.gender,
      orientation: c.orientation,
      interests: c.interests,
      bio: c.bio,
    };
  }

  /** Deterministic local factors (no randomness in exploration noise). */
  private localFactors(me: UserRecord, c: CandidateRow): MatchScoreFactors {
    const interest = interestSimilarity(me.interests, c.interests);
    // Intent alignment: orientation compatibility heuristic.
    const intent = this.orientationAlignment(me, c);
    // Behavioral compatibility: closeness in age (within 10y).
    const ageGap = Math.abs(me.age - c.age);
    const behavioral = Math.max(0, 1 - ageGap / 10);
    // Reciprocity: did they already like me?
    const reciprocity = c.likes_sent_to_me > 0 ? 1 : 0.3;
    // Diversity boost: small bump for differing interests sets.
    const diversity = 1 - interest;
    // Exploration noise: deterministic pseudo-noise from id hash.
    const noise = this.idNoise(c.id);
    return {
      intentAlignment: intent,
      interestSimilarity: interest,
      behavioralCompatibility: behavioral,
      reciprocityLikelihood: reciprocity,
      diversityBoost: diversity,
      explorationNoise: noise,
    };
  }

  private orientationAlignment(me: UserRecord, c: CandidateRow): number {
    // Very rough heuristic; the ML service is expected to do the real work.
    const straight = (o: string) => o.toLowerCase().includes('straight');
    if (straight(me.orientation) && straight(c.orientation)) {
      return me.gender !== c.gender ? 1 : 0.2;
    }
    return 0.7;
  }

  private idNoise(id: string): number {
    let h = 0;
    for (let i = 0; i < id.length; i++) {
      h = (h * 31 + id.charCodeAt(i)) % 1000;
    }
    return h / 1000;
  }

  // ---------------------------------------------------------------- swipes
  async swipe(
    userId: string,
    eventId: string,
    targetId: string,
    edgeType: 'like' | 'pass' | 'superlike',
  ) {
    if (userId === targetId) {
      throw new ForbiddenException('Cannot swipe on yourself');
    }
    const event = await this.requireTicket(userId, eventId);

    // Target must also hold a paid ticket (event-scoped social graph).
    const targetHasTicket = await this.tickets.hasPaidTicket(targetId, eventId);
    if (!targetHasTicket) {
      throw new NotFoundException('Target is not attending this event');
    }

    // Block check.
    const blocked = await this.db.one(
      `SELECT 1 FROM blocks
        WHERE (blocker_id = $1 AND blocked_id = $2)
           OR (blocker_id = $2 AND blocked_id = $1)`,
      [userId, targetId],
    );
    if (blocked) {
      throw new ForbiddenException('Interaction blocked');
    }

    // Anti-spam: cap likes/superlikes per user per event.
    if (edgeType === 'like' || edgeType === 'superlike') {
      const limit = this.config.get<number>('swipeLimit') ?? 100;
      const { rows } = await this.db.query<{ count: string }>(
        `SELECT count(*)::int AS count FROM social_edges
          WHERE event_id = $1 AND user_a = $2
            AND edge_type IN ('like','superlike')`,
        [eventId, userId],
      );
      const used = Number(rows[0]?.count ?? 0);
      if (used >= limit) {
        throw new HttpException(
          `Swipe limit of ${limit} reached for this event`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // Record the edge (idempotent on the unique key).
    await this.db.query(
      `INSERT INTO social_edges (event_id, user_a, user_b, edge_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (event_id, user_a, user_b)
       DO UPDATE SET edge_type = EXCLUDED.edge_type`,
      [eventId, userId, targetId, edgeType],
    );

    if (edgeType === 'pass') {
      return { matched: false, edge: 'pass' };
    }

    await this.db.query(
      `UPDATE event_metrics SET likes = likes + 1, updated_at = now()
       WHERE event_id = $1`,
      [eventId],
    );

    // Reciprocity check: did target already like/superlike me?
    const reciprocal = await this.db.one(
      `SELECT 1 FROM social_edges
        WHERE event_id = $1 AND user_a = $2 AND user_b = $3
          AND edge_type IN ('like','superlike')`,
      [eventId, targetId, userId],
    );

    if (!reciprocal) {
      return { matched: false, edge: edgeType };
    }

    // It's a match — create match + chat atomically, then notify.
    const result = await this.createMatch(event, userId, targetId);
    this.gateway.notifyMatchCreated({
      matchId: result.matchId,
      chatId: result.chatId,
      eventId,
      users: [userId, targetId],
      expiresAt: event.end_time,
    });

    const peer = await this.db.one<{ name: string }>(
      'SELECT name FROM users WHERE id = $1',
      [targetId],
    );

    return {
      matched: true,
      edge: edgeType,
      match_id: result.matchId,
      chat_id: result.chatId,
      // Shaped for the mobile client (Match): keyed by `id`, peer in `user_id`.
      match: {
        id: result.matchId,
        event_id: eventId,
        chat_id: result.chatId,
        user_id: targetId,
        name: peer?.name,
        expires_at: event.end_time,
      },
    };
  }

  private async createMatch(
    event: EventRecord,
    a: string,
    b: string,
  ): Promise<{ matchId: string; chatId: string }> {
    const [low, high] = a < b ? [a, b] : [b, a];
    return this.db.transaction(async (client) => {
      const matchRes = await client.query<{ id: string }>(
        `INSERT INTO matches (event_id, user_low, user_high)
         VALUES ($1, $2, $3)
         ON CONFLICT (event_id, user_low, user_high) DO UPDATE
           SET event_id = EXCLUDED.event_id
         RETURNING id`,
        [event.id, low, high],
      );
      const matchId = matchRes.rows[0].id;

      const chatRes = await client.query<{ id: string }>(
        `INSERT INTO chats (match_id, event_id, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (match_id) DO UPDATE SET expires_at = EXCLUDED.expires_at
         RETURNING id`,
        [matchId, event.id, event.end_time],
      );
      const chatId = chatRes.rows[0].id;

      await client.query(
        `UPDATE event_metrics SET matches = matches + 1, updated_at = now()
         WHERE event_id = $1`,
        [event.id],
      );

      return { matchId, chatId };
    });
  }

  // --------------------------------------------------------------- matches
  async matches(userId: string, eventId: string) {
    await this.requireTicket(userId, eventId);
    return this.db.many(
      `SELECT m.id AS id,
              c.id AS chat_id,
              c.expires_at,
              other.id   AS user_id,
              other.name AS name,
              other.age  AS age,
              other.interests AS interests,
              other.bio  AS bio
         FROM matches m
         JOIN chats c ON c.match_id = m.id
         JOIN users other ON other.id = CASE
              WHEN m.user_low = $2 THEN m.user_high ELSE m.user_low END
        WHERE m.event_id = $1
          AND (m.user_low = $2 OR m.user_high = $2)
        ORDER BY m.created_at DESC`,
      [eventId, userId],
    );
  }

  // ---------------------------------------------------------------- safety
  async report(
    reporterId: string,
    eventId: string,
    targetId: string,
    reason: string,
  ) {
    if (reporterId === targetId) {
      throw new ForbiddenException('Cannot report yourself');
    }
    await this.db.query(
      `INSERT INTO reports (event_id, reporter_id, target_id, reason)
       VALUES ($1, $2, $3, $4)`,
      [eventId, reporterId, targetId, reason],
    );
    return { reported: true };
  }

  async block(blockerId: string, targetId: string) {
    if (blockerId === targetId) {
      throw new ForbiddenException('Cannot block yourself');
    }
    await this.db.query(
      `INSERT INTO blocks (blocker_id, blocked_id)
       VALUES ($1, $2)
       ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
      [blockerId, targetId],
    );
    return { blocked: true };
  }
}
