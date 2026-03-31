// ============================================================
// managers/UrlManager.ts  —  Reads and exposes URL query params.
//                            Instantiate once in main.ts and pass
//                            into screens that need it.
// ============================================================

import { Logger } from '../utils/Logger';

const TRUSTED_RGS_DOMAINS = [
  'api.stake-engine.com',
  'staging-api.stake-engine.com',
  'localhost',
  '127.0.0.1',
] as const;

export class UrlManager {
  private readonly params: URLSearchParams;

  constructor(search: string = window.location.search) {
    this.params = new URLSearchParams(search);
  }

  get sessionID(): string | null { return this.params.get('sessionID');           }
  get game():      string | null { return this.params.get('game');                }
  get version():   string | null { return this.params.get('version');             }
  get mode():      string | null { return this.params.get('mode');                }
  get event():     string | null { return this.params.get('event');               }
  get currency():  string        { return this.params.get('currency') ?? 'USD';   }
  get lang():      string        { return this.params.get('lang')     ?? 'en';    }
  get device():    string        { return this.params.get('device')   ?? 'desktop'; }
  get social():    boolean       { return this.params.get('social')   === 'true'; }
  get replay():    boolean       { return this.params.get('replay')   === 'true'; }

  /** e.g. ?amount=100 — in micro-cents; defaults to 1000000 (1.00 USD) */
  get amount(): number {
    return parseInt(this.params.get('amount') ?? '') || 1000000;
  }

  /**
   * Returns a validated, normalised RGS URL, or null if the domain is
   * untrusted or the URL is malformed.
   * Defaults to the production API endpoint in normal (non-replay) mode.
   */
  get rgsUrl(): string | null {
    // Accept both ?rgs_url= (test platform / Example-Main.js convention) and
    // ?rgsUrl= (camelCase legacy fallback).
    const raw = this.params.get('rgs_url') ?? this.params.get('rgsUrl') ?? (this.replay ? null : 'https://api.stake-engine.com');
    return this.validateRgsUrl(raw);
  }

  // ── Validation ─────────────────────────────────────────────

  /**
   * Validates required params based on mode.
   * Returns { ok: true } or { ok: false, error: string } — the caller
   * is responsible for surfacing the error message to the player.
   */
  validate(): { ok: true } | { ok: false; error: string } {
    if (this.replay) {
      if (!this.rgsUrl) {
        return { ok: false, error: 'Invalid replay link - missing server URL. Please use a valid replay link.' };
      }
      if (!this.event) {
        return { ok: false, error: 'Invalid replay link - missing event ID. Please use a valid replay link.' };
      }
    } else {
      if (!this.sessionID) {
        return { ok: false, error: 'Invalid game link - missing session ID. Please use a valid game link or refresh the page.' };
      }
      if (!this.rgsUrl) {
        return { ok: false, error: 'Invalid game link - missing server URL. Please use a valid game link.' };
      }
    }

    return { ok: true };
  }

  // ── Private ────────────────────────────────────────────────

  private validateRgsUrl(raw: string | null): string | null {
    if (!raw) return null;

    // Normalise: prepend https:// if no protocol is present.
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

    try {
      const parsed = new URL(withProtocol);
      const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

      if (!isLocal && parsed.protocol !== 'https:') {
        Logger.error('UrlManager', 'rgsUrl rejected: HTTPS required for non-local domains');
        return null;
      }

      const isTrusted = (TRUSTED_RGS_DOMAINS as readonly string[]).includes(parsed.hostname)
                     || parsed.hostname.endsWith('.stake-engine.com');

      if (!isTrusted) {
        Logger.error('UrlManager', 'rgsUrl rejected: untrusted domain', parsed.hostname);
        return null;
      }

      // Strip trailing slash to prevent double-slash in API paths.
      return parsed.href.replace(/\/+$/, '');
    } catch {
      Logger.error('UrlManager', 'rgsUrl rejected: invalid URL format');
      return null;
    }
  }
}

