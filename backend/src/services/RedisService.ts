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
        let redisHost = '127.0.0.1';
        let redisPort = 6379;
        let redisPassword: string | undefined = undefined;

        try {
          const parsed = new URL(config.REDIS_URL);
          redisHost = parsed.hostname === 'localhost' ? '127.0.0.1' : (parsed.hostname || '127.0.0.1');
          redisPort = parsed.port ? parseInt(parsed.port, 10) : 6379;
          if (parsed.password) redisPassword = decodeURIComponent(parsed.password);
        } catch {
          // fallback to defaults
        }

        this.client = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          family: 4, // Force IPv4 to prevent Windows IPv6 (::1) lookup delay
          maxRetriesPerRequest: null, // Required by BullMQ
          connectTimeout: 5000,
          retryStrategy: (times) => {
            return Math.min(times * 500, 3000);
          }
        });

        let resolved = false;

        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            if (!this.isConnected && !this.errorLogged) {
              logger.info('Redis connection timed out. Running in fallback in-memory mode.');
              this.errorLogged = true;
            }
            resolve(false);
          }
        }, 10000);

        this.client.on('connect', () => {
          this.isConnected = true;
          this.errorLogged = false;
          logger.info('Redis client connected successfully.');
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve(true);
          }
        });

        this.client.on('ready', () => {
          this.isConnected = true;
        });

        this.client.on('error', (err) => {
          this.isConnected = false;
          if (!this.errorLogged) {
            logger.info(`Redis connection notice: ${err.message}`);
            this.errorLogged = true;
          }
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
