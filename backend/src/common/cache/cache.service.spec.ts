import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import type { Cache } from 'cache-manager';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: any;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as unknown as Cache;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService, { provide: CACHE_MANAGER, useValue: cacheManager }],
    }).compile();

    service = module.get<CacheService>(CacheService);
    jest.clearAllMocks();
  });

  it('get should return cached value', async () => {
    cacheManager.get.mockResolvedValueOnce('value');
    await expect(service.get('key')).resolves.toBe('value');
    expect(cacheManager.get).toHaveBeenCalledWith('key');
  });

  it('set should store value with ttl', async () => {
    cacheManager.set.mockResolvedValueOnce(undefined as any);
    await expect(service.set('key', 'value', 60)).resolves.toBeUndefined();
    expect(cacheManager.set).toHaveBeenCalledWith('key', 'value', 60);
  });

  it('del should remove key', async () => {
    cacheManager.del.mockResolvedValueOnce(undefined as any);
    await expect(service.del('key')).resolves.toBeUndefined();
    expect(cacheManager.del).toHaveBeenCalledWith('key');
  });

  it('getOrSet should return cached when exists', async () => {
    cacheManager.get.mockResolvedValueOnce('cached');
    const factory = jest.fn().mockResolvedValue('new');
    await expect(service.getOrSet('key', factory, 30)).resolves.toBe('cached');
    expect(factory).not.toHaveBeenCalled();
    expect(cacheManager.set).not.toHaveBeenCalled();
  });

  it('getOrSet should call factory and set when not cached', async () => {
    cacheManager.get.mockResolvedValueOnce(undefined);
    const factory = jest.fn().mockResolvedValue('new');
    cacheManager.set.mockResolvedValueOnce(undefined as any);

    await expect(service.getOrSet('key', factory, 45)).resolves.toBe('new');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(cacheManager.set).toHaveBeenCalledWith('key', 'new', 45);
  });

  it('exists should return true when value present', async () => {
    cacheManager.get.mockResolvedValueOnce('present');
    await expect(service.exists('key')).resolves.toBe(true);
  });

  it('exists should return false when value absent', async () => {
    cacheManager.get.mockResolvedValueOnce(undefined);
    await expect(service.exists('key')).resolves.toBe(false);
  });
});
