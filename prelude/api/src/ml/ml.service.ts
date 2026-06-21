import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DatabaseService } from '../database/database.service';

export interface RankCandidate {
  user_id: string;
  [key: string]: any;
}

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
  ) {}

  private baseUrl(): string {
    return this.config.get<string>('mlServiceUrl') || '';
  }

  private async audit(
    interaction: string,
    eventId: string | null,
    userId: string | null,
    payload: any,
  ) {
    try {
      await this.db.query(
        `INSERT INTO ml_interactions (event_id, user_id, interaction, payload)
         VALUES ($1, $2, $3, $4)`,
        [eventId, userId, interaction, payload ? JSON.stringify(payload) : null],
      );
    } catch (err) {
      this.logger.warn(`Failed to record ml_interaction: ${String(err)}`);
    }
  }

  /** Generic passthrough used by /ml/* proxy endpoints. */
  async forward(path: string, body: any): Promise<any> {
    const url = `${this.baseUrl()}${path}`;
    const res = await axios.post(url, body, { timeout: 5000 });
    void this.audit(
      path.replace('/ml/', '').replace('/', ''),
      body?.event_id ?? null,
      body?.user_id ?? null,
      { request: body },
    );
    return res.data;
  }

  /**
   * Ask the ML service to rank candidate user_ids for a viewer at an event.
   * Returns an ordered list of user_ids, or null if the service is unavailable
   * (so the caller can fall back to local ranking).
   */
  async rank(
    eventId: string,
    viewerId: string,
    candidates: RankCandidate[],
  ): Promise<string[] | null> {
    const url = `${this.baseUrl()}/ml/rank`;
    const requestBody = {
      event_id: eventId,
      user_id: viewerId,
      candidates,
    };
    try {
      const res = await axios.post(url, requestBody, { timeout: 3000 });
      void this.audit('rank', eventId, viewerId, { source: 'ml' });
      const ranked =
        res.data?.ranked_candidates ??
        res.data?.ranked ??
        res.data?.user_ids ??
        res.data;
      if (Array.isArray(ranked)) {
        // Accept either an array of ids or array of { user_id }.
        return ranked.map((r: any) =>
          typeof r === 'string' ? r : r.user_id,
        );
      }
      return null;
    } catch (err) {
      this.logger.warn(
        `ML rank unavailable, falling back to local ranking: ${String(err)}`,
      );
      return null;
    }
  }
}
