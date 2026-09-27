export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** 404s are permanent; everything else is worth a retry. */
  get isRetryable(): boolean {
    return !(this.kind === 'http' && this.status !== undefined && this.status < 500);
  }
}

export interface HttpClient {
  getJson<T>(path: string): Promise<T>;
}

type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export function createHttpClient(baseUrl: string, timeoutMs: number, fetchFn: FetchFn = fetch): HttpClient {
  return {
    async getJson<T>(path: string): Promise<T> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetchFn(`${baseUrl}${path}`, { signal: controller.signal });
      } catch (error) {
        const aborted = error instanceof Error && error.name === 'AbortError';
        throw aborted
          ? new ApiError('timeout', `Request timed out after ${timeoutMs}ms: ${path}`)
          : new ApiError('network', `Network request failed: ${path}`);
      } finally {
        clearTimeout(timer);
      }
      if (!response.ok) throw new ApiError('http', `HTTP ${response.status} for ${path}`, response.status);
      try {
        return (await response.json()) as T;
      } catch {
        throw new ApiError('parse', `Invalid JSON from ${path}`);
      }
    },
  };
}
