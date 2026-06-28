import Redis from 'ioredis';
import { logger } from '../core/logger';
import { config } from '../config/appConfig';

class RedisService {
  private client: Redis | null = null;
  private memoryDb = new Map<string, { value: string; expiry?: number }>();
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    // Redis is temporarily disabled to prevent startup delays and docker requirements.
    this.isConnected = false;
    logger.info('Redis connection bypassed. Using in-memory fallback cache.');
  }

  public getClient(): Redis | null {
    return this.isConnected ? this.client : null;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  // 1. SET
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value);

    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, stringified, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, stringified);
        }
        return;
      } catch (err: any) {
        logger.error(`Redis set operation error: ${err.message}`);
      }
    }

    // In-memory fallback
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryDb.set(key, { value: stringified, expiry });
  }

  // 2. GET
  async get<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const val = await this.client.get(key);
        if (!val) return null;
        try {
          return JSON.parse(val) as T;
        } catch {
          return val as unknown as T;
        }
      } catch (err: any) {
        logger.error(`Redis get operation error: ${err.message}`);
      }
    }

    // In-memory fallback
    const cached = this.memoryDb.get(key);
    if (!cached) return null;

    if (cached.expiry && cached.expiry < Date.now()) {
      this.memoryDb.delete(key);
      return null;
    }

    try {
      return JSON.parse(cached.value) as T;
    } catch {
      return cached.value as unknown as T;
    }
  }

  // 3. DEL
  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err: any) {
        logger.error(`Redis del operation error: ${err.message}`);
      }
    }

    this.memoryDb.delete(key);
  }

  // 4. INVALIDATE BY PATTERN
  async invalidatePattern(pattern: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
          logger.info(`Invalidated cache keys matching: ${pattern}`);
        }
        return;
      } catch (err: any) {
        logger.error(`Redis keys invalidation error: ${err.message}`);
      }
    }

    // In-memory fallback
    for (const key of this.memoryDb.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        this.memoryDb.delete(key);
      }
    }
  }
}

export const redisService = new RedisService();
export default redisService;
