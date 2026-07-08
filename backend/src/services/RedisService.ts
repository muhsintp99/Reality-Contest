import Redis from 'ioredis';
import { logger } from '../core/logger';
import { config } from '../config/appConfig';

class RedisService {
  private client: Redis | null = null;
  private memoryDb = new Map<string, { value: string; expiry?: number }>();
  private isConnected = false;
  private connectionPromise: Promise<boolean> | null = null;
  private errorLogged = false;

  constructor() {
    this.connectionPromise = this.connect();
  }

  private connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.client = new Redis(config.REDIS_URL, {
          maxRetriesPerRequest: null, // Required by BullMQ
          connectTimeout: 2000,       // Connection timeout (2s to avoid blocking server startup)
          retryStrategy: (times) => {
            // Retrying connection up to a maximum interval of 30 seconds
            return Math.min(times * 2000, 30000);
          }
        });

        const timeout = setTimeout(() => {
          if (!this.isConnected && !this.errorLogged) {
            logger.info('Redis connection timed out. Running in fallback in-memory mode.');
            this.errorLogged = true;
          }
          resolve(false);
        }, 2500);

        this.client.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.errorLogged = false;
          logger.info('Redis client connected successfully.');
          resolve(true);
        });

        this.client.on('error', (err) => {
          clearTimeout(timeout);
          this.isConnected = false;
          
          if (!this.errorLogged) {
            logger.info(`Redis is offline: ${err.message}. Running in fallback in-memory mode.`);
            this.errorLogged = true;
          }
          
          resolve(false);
        });
      } catch (error: any) {
        this.isConnected = false;
        logger.error(`Failed to initialize Redis: ${error.message}`);
        resolve(false);
      }
    });
  }

  public async waitForConnection(): Promise<boolean> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    return this.isConnected;
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
