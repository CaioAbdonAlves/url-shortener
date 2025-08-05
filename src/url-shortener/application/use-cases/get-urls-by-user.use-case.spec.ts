import { Test, TestingModule } from '@nestjs/testing';
import { GetUrlsByUserUseCase } from './get-urls-by-user.use-case';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { ShortUrl } from '../../domain/entities/short-url.entity';
import { CacheService } from '../../../shared/infrastructure/cache/cache.service';

describe('GetUrlsByUserUseCase', () => {
  let useCase: GetUrlsByUserUseCase;
  let shortUrlRepository: jest.Mocked<IShortUrlRepository>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    // Mock environment variable
    process.env.BASE_URL = 'http://localhost:3000';

    const mockShortUrlRepository = {
      findByUserId: jest.fn(),
    };

    const mockCacheService = {
      getUserUrls: jest.fn(),
      setUserUrls: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUrlsByUserUseCase,
        {
          provide: 'SHORT_URL_REPOSITORY',
          useValue: mockShortUrlRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    useCase = module.get<GetUrlsByUserUseCase>(GetUrlsByUserUseCase);
    shortUrlRepository = module.get('SHORT_URL_REPOSITORY');
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    delete process.env.BASE_URL;
  });

  describe('execute', () => {
    it('should return cached data when available', async () => {
      // Arrange
      const userId = 'user-123';
      const cachedData = {
        urls: [
          {
            id: 'url-1',
            originalUrl: 'https://example.com',
            shortCode: 'abc123',
            shortUrl: 'http://localhost:3000/abc123',
            clicksCount: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
      };

      cacheService.getUserUrls.mockResolvedValue(cachedData);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result).toEqual(cachedData);
      expect(cacheService.getUserUrls).toHaveBeenCalledWith(userId);
      expect(shortUrlRepository.findByUserId).not.toHaveBeenCalled();
      expect(cacheService.setUserUrls).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when cache miss', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUrls = [
        ShortUrl.create('https://example.com', 'abc123', userId),
        ShortUrl.create('https://google.com', 'def456', userId),
      ];

      cacheService.getUserUrls.mockResolvedValue(null);
      shortUrlRepository.findByUserId.mockResolvedValue(mockUrls);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.urls).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(cacheService.getUserUrls).toHaveBeenCalledWith(userId);
      expect(shortUrlRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(cacheService.setUserUrls).toHaveBeenCalledWith(userId, result);
    });

    it('should handle empty user URLs', async () => {
      // Arrange
      const userId = 'user-123';

      cacheService.getUserUrls.mockResolvedValue(null);
      shortUrlRepository.findByUserId.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.urls).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(cacheService.setUserUrls).toHaveBeenCalledWith(userId, result);
    });

    it('should handle cache errors gracefully', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUrls = [
        ShortUrl.create('https://example.com', 'abc123', userId),
      ];

      cacheService.getUserUrls.mockResolvedValue(null);
      shortUrlRepository.findByUserId.mockResolvedValue(mockUrls);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(result.urls).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(shortUrlRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });
}); 