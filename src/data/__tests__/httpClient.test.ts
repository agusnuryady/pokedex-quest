import { ApiError, createHttpClient } from '../api/httpClient';

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

describe('createHttpClient', () => {
  it('prefixes the base url and returns parsed JSON', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse({ hello: 'world' }));
    const client = createHttpClient('https://api.test', 1000, fetchFn);
    await expect(client.getJson('/thing')).resolves.toEqual({ hello: 'world' });
    expect(fetchFn).toHaveBeenCalledWith('https://api.test/thing', expect.objectContaining({ signal: expect.anything() }));
  });

  it('throws a non-retryable http error on 404', async () => {
    const client = createHttpClient('https://api.test', 1000, jest.fn().mockResolvedValue(jsonResponse({}, 404)));
    const error = await client.getJson('/missing').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'http', status: 404, isRetryable: false });
  });

  it('marks 5xx errors as retryable', async () => {
    const client = createHttpClient('https://api.test', 1000, jest.fn().mockResolvedValue(jsonResponse({}, 503)));
    await expect(client.getJson('/x')).rejects.toMatchObject({ kind: 'http', isRetryable: true });
  });

  it('wraps network failures', async () => {
    const client = createHttpClient('https://api.test', 1000, jest.fn().mockRejectedValue(new TypeError('offline')));
    await expect(client.getJson('/x')).rejects.toMatchObject({ kind: 'network' });
  });

  it('reports a timeout when the request is aborted', async () => {
    jest.useFakeTimers();
    const fetchFn = jest.fn((_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        });
      }),
    );
    const promise = createHttpClient('https://api.test', 50, fetchFn).getJson('/slow');
    jest.advanceTimersByTime(60);
    await expect(promise).rejects.toMatchObject({ kind: 'timeout' });
    jest.useRealTimers();
  });

  it('wraps invalid JSON', async () => {
    const bad = { ok: true, status: 200, json: async () => { throw new SyntaxError('bad'); } } as unknown as Response;
    const client = createHttpClient('https://api.test', 1000, jest.fn().mockResolvedValue(bad));
    await expect(client.getJson('/x')).rejects.toMatchObject({ kind: 'parse' });
  });
});
