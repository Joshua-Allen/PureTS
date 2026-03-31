// ============================================================
// api/PlayerApi.ts  —  Player profile and save data endpoints.
// ============================================================

// ---- Win (winInfo.wins entries) ----------------------------------

export interface Win {
  symbol:    string;
  kind:      number;
  amount:    number;                      // cents (also referred to as win/payout)
  positions: { reel: number; row: number }[];
}

// ---- State events ------------------------------------------------

export interface RevealEvent {
  type:         'reveal';
  board:        string[][];               // 5 reels × 3 rows
  gameType:     string;
  anticipation: number[];
}

export interface WinInfoEvent {
  type:     'winInfo';
  totalWin: number;                       // cents
  wins:     Win[];
}

export interface FinalWinEvent {
  type:   'finalWin';
  amount: number;                         // cents
}

export interface SetWinEvent {
  type:   'setWin';
  amount: number;
}

export interface SetTotalWinEvent {
  type:   'setTotalWin';
  amount: number;
}

export interface FreeSpinTriggerEvent {
  type:      'freeSpinTrigger';
  totalFs:   number;
  positions: { reel: number; row: number }[];
}

export interface UpdateFreeSpinEvent {
  type:   'updateFreeSpin';
  total:  number;
  amount: number;                         // spins used
}

export interface FreeSpinEndEvent {
  type: 'freeSpinEnd';
}

export type StateEvent =
  | RevealEvent
  | WinInfoEvent
  | FinalWinEvent
  | SetWinEvent
  | SetTotalWinEvent
  | FreeSpinTriggerEvent
  | UpdateFreeSpinEvent
  | FreeSpinEndEvent;

// ---- Config (authenticate only) ----------------------------------

export interface Jurisdiction {
  socialCasino:           boolean;
  disabledFullscreen:     boolean;
  disabledTurbo:          boolean;
  disabledSuperTurbo:     boolean;
  disabledAutoplay:       boolean;
  disabledSlamstop:       boolean;
  disabledSpacebar:       boolean;
  disabledBuyFeature:     boolean;
  displayNetPosition:     boolean;
  displayRTP:             boolean;
  displaySessionTimer:    boolean;
  minimumRoundDuration:   number;
}

export interface GameConfig {
  gameID:           string;
  minBet:           number;               // cents
  maxBet:           number;               // cents
  stepBet:          number;               // cents
  defaultBetLevel:  number;               // cents
  betLevels:        number[];             // available bet amounts, in cents
  betModes:         Record<string, unknown>;
  jurisdiction:     Jurisdiction;
}

// ---- Authenticate response ---------------------------------------
// Includes config + state, which /wallet/play does not return.

export interface AuthenticateResponse {
  balance: { amount: number; currency: string };
  config:  GameConfig;
  state?:  StateEvent[];
}

export class PlayerApi {
}
