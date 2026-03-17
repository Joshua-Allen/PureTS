// ============================================================
// api/ReplayApi.ts  —  Fetches replay data from the RGS.
// ============================================================

import { ApiClient } from './ApiClient';

export interface ReplayParams {
  game:    string;
  version: string;
  mode:    string;
  event:   string;
}

export class ReplayApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * Fetches replay data for a given event.
   * Endpoint: GET /bet/replay/{game}/{version}/{mode}/{event}
   */
  async fetchReplay<T = unknown>(params: ReplayParams): Promise<T> {
    const { game, version, mode, event } = params;
    const endpoint = `/bet/replay/${game}/${version}/${mode}/${event}`;
    return this.client.get<T>(endpoint);
  }
}








