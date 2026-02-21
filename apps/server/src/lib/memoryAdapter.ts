/**
 * Shared interface for key-value store operations.
 * Both the Redis client and the in-memory adapter implement this.
 */
export interface StoreClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<any>;
  del(key: string | string[]): Promise<any>;
  keys(pattern: string): Promise<string[]>;
}

/**
 * In-memory adapter that implements StoreClient.
 * Used as fallback when REDIS_URL is not configured.
 */
const store = new Map<string, { value: string; expiresAt: number | null }>();

function cleanup(key: string): string | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export const memoryAdapter: StoreClient = {
  async get(key: string): Promise<string | null> {
    return cleanup(key);
  },

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    const expiresAt = options?.EX ? Date.now() + options.EX * 1000 : null;
    store.set(key, { value, expiresAt });
  },

  async del(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key : [key];
    for (const k of keys) store.delete(k);
  },

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const result: string[] = [];
    for (const [k] of store) {
      if (regex.test(k) && cleanup(k) !== null) {
        result.push(k);
      }
    }
    return result;
  },
};
