import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: any;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('getUserUrls', () => {
    it('should return cached data when available', async () => {
      const userId = 'user-123';
      const cachedData = { urls: [], total: 0 };

      cacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getUserUrls(userId);

      expect(result).toEqual(cachedData);
      expect(cacheManager.get).toHaveBeenCalledWith('user_urls:user-123');
    });

    it('should return null when cache miss', async () => {
      const userId = 'user-123';

      cacheManager.get.mockResolvedValue(null);

      const result = await service.getUserUrls(userId);

      expect(result).toBeNull();
      expect(cacheManager.get).toHaveBeenCalledWith('user_urls:user-123');
    });

    it('should handle errors gracefully', async () => {
      const userId = 'user-123';

      cacheManager.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.getUserUrls(userId);

      expect(result).toBeNull();
    });
  });

  describe('setUserUrls', () => {
    it('should store data in cache', async () => {
      const userId = 'user-123';
      const urls = { urls: [], total: 0 };

      await service.setUserUrls(userId, urls);

      expect(cacheManager.set).toHaveBeenCalledWith('user_urls:user-123', urls);
    });

    it('should handle errors gracefully', async () => {
      const userId = 'user-123';
      const urls = { urls: [], total: 0 };

      cacheManager.set.mockRejectedValue(new Error('Redis error'));

      await expect(service.setUserUrls(userId, urls)).resolves.not.toThrow();
    });
  });

  describe('invalidateUserUrls', () => {
    it('should delete cache for user', async () => {
      const userId = 'user-123';

      await service.invalidateUserUrls(userId);

      expect(cacheManager.del).toHaveBeenCalledWith('user_urls:user-123');
    });

    it('should handle errors gracefully', async () => {
      const userId = 'user-123';

      cacheManager.del.mockRejectedValue(new Error('Redis error'));

      await expect(service.invalidateUserUrls(userId)).resolves.not.toThrow();
    });
  });

  describe('isHealthy', () => {
    it('should return true when Redis is available', async () => {
      cacheManager.get.mockResolvedValue('ok');

      const result = await service.isHealthy();

      expect(result).toBe(true);
      expect(cacheManager.get).toHaveBeenCalledWith('health_check');
    });

    it('should return false when Redis is not available', async () => {
      cacheManager.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.isHealthy();

      expect(result).toBe(false);
    });
  });
}); 