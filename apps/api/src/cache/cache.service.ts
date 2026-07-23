import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis?: Redis;
  private readonly memory = new Map<string, { value: string; expiresAt: number }>();
  constructor() { if (process.env.REDIS_URL) this.redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: true }); }
  async get<T>(key: string): Promise<T | null> {
    const raw = this.redis ? await this.redis.get(key) : this.getMemory(key);
    return raw ? JSON.parse(raw) as T : null;
  }
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (this.redis) await this.redis.set(key, serialized, 'EX', ttlSeconds); else this.memory.set(key, { value: serialized, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
  async onModuleDestroy(): Promise<void> { await this.redis?.quit(); }
  private getMemory(key: string): string | null { const item = this.memory.get(key); if (!item) return null; if (item.expiresAt < Date.now()) { this.memory.delete(key); return null; } return item.value; }
}
