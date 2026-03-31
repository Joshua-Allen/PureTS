// ============================================================
// api/ApiClient.ts  —  Base HTTP wrapper.
//                      All API classes use this for fetch calls,
//                      shared headers, and error handling.
// ============================================================

import { Logger } from '../utils/Logger';

/** Classifies a fetch/HTTP error into a user-facing message. */
function classifyError(error: unknown): string {
  const msg  = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name    : '';

  if (msg.includes('400') || msg.includes('Bad Request'))       return 'Invalid request. Please refresh the page.';
  if (msg.includes('401') || msg.includes('Unauthorized'))      return 'Session expired. Please refresh the page.';
  if (msg.includes('403') || msg.includes('Forbidden'))         return 'Access denied. Please check your game link or contact support.';
  if (msg.includes('404') || msg.includes('Not Found'))         return 'Game server endpoint not found. Please verify your game URL.';
  if (msg.includes('500') || msg.includes('Internal Server'))   return 'Game server error. Please try again in a moment.';
  if (name === 'SyntaxError' || msg.includes('JSON'))           return 'Server returned invalid data. Please refresh the page or try again.';
  if (msg.includes('Failed to fetch') || name === 'TypeError'
   || msg.includes('NetworkError')    || msg.includes('CORS'))  return 'Unable to connect to game server. Please check your internet connection and game URL.';

  return 'Connection failed. Please refresh the page or contact support if the problem persists.';
}

/** Detects whether the error indicates an authentication/session failure. */
function isAuthError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('400') || msg.includes('401') || msg.includes('403')
      || msg.includes('ERR_IPB') || msg.includes('Bad Request') || msg.includes('Unauthorized');
}

export interface ApiClientOptions {
  /** Maximum consecutive failures before the client is considered unhealthy. */
  maxFailures?: number;
}

export class ApiClient {
  private failureCount    = 0;
  private sessionValid    = true;
  private authFailed      = false;

  private readonly maxFailures: number;

  constructor(
    private readonly baseUrl: string,
    options: ApiClientOptions = {},
  ) {
    this.maxFailures = options.maxFailures ?? 3;
  }

  get isSessionValid():   boolean { return this.sessionValid; }
  get isAuthFailed():     boolean { return this.authFailed;   }
  get consecutiveFails(): number  { return this.failureCount; }
  get isUnhealthy():      boolean { return this.failureCount >= this.maxFailures; }

  /** POST JSON to an endpoint. Throws on failure after logging. */
  async post<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    Logger.info('ApiClient', `POST ${endpoint}`, data);

    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
    } catch (error) {
      this.handleFailure(error);
      throw error;
    }

    return this.parseResponse<T>(endpoint, response);
  }

  /** GET an endpoint. Throws on failure after logging. */
  async get<T = unknown>(endpoint: string): Promise<T> {
    Logger.info('ApiClient', `GET ${endpoint}`);

    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        method:  'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      this.handleFailure(error);
      throw error;
    }

    return this.parseResponse<T>(endpoint, response);
  }

  // ── Private ────────────────────────────────────────────────

  private async parseResponse<T>(endpoint: string, response: Response): Promise<T> {
    // Check HTTP status before attempting JSON parse — error bodies may be plain text.
    if (!response.ok) {
      let errorDetail = response.statusText;
      try {
        const body = await response.json() as Record<string, string>;
        errorDetail = body?.error ?? errorDetail;
      } catch {
        // Non-JSON body (e.g. plain-text "404 page not found") — use status text.
      }
      const err = new Error(`API Error ${response.status}: ${errorDetail}`);
      this.handleFailure(err);
      throw err;
    }

    let result: T;
    try {
      result = await response.json() as T;
    } catch (error) {
      this.handleFailure(error);
      throw error;
    }

    Logger.info('ApiClient', `Response ${endpoint}`, result);
    this.failureCount = 0;
    return result;
  }

  private handleFailure(error: unknown): void {
    this.failureCount++;

    if (isAuthError(error)) {
      this.sessionValid = false;
      this.authFailed   = true;
      Logger.error('ApiClient', 'Session authentication failed', error);
    } else {
      Logger.error('ApiClient', classifyError(error), error);
    }
  }
}

