import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  public async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  public async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  public async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== undefined) return cached;

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  public async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }
}
