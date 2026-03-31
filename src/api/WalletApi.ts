// ============================================================
// api/WalletApi.ts  —  Wallet and session endpoints.
// ============================================================

import { ApiClient }            from './ApiClient';
import { AuthenticateResponse } from './PlayerApi';

export interface PlayResponse {
  balance:  number;
  currency: string;
  roundId:  string;
}

export interface EndRoundResponse {
  balance:  number;
  currency: string;
}

export class WalletApi {
  constructor(private readonly client: ApiClient) {}


  // Returns balance, currency, config (bet levels), and the initial state event array.
  authenticate(sessionID: string): Promise<AuthenticateResponse> {
    return this.client.post<AuthenticateResponse>('/wallet/authenticate', { sessionID });
  }

  // 
  play(sessionID: string, amount: number, mode: string): Promise<PlayResponse> {
    return this.client.post<PlayResponse>('/wallet/play', { sessionID, amount, mode });
  }

  // returns a round
  endRound(sessionID: string): Promise<EndRoundResponse> {
    return this.client.post<EndRoundResponse>('/wallet/end-round', { sessionID });
  }
}
