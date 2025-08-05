import { Test, TestingModule } from '@nestjs/testing';
import { RedirectUrlUseCase } from './redirect-url.use-case';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { ShortUrl } from '../../domain/entities/short-url.entity';
import { PrometheusService } from '../../../shared/infrastructure/metrics/prometheus.service';

describe('RedirectUrlUseCase', () => {
  let useCase: RedirectUrlUseCase;
  let shortUrlRepository: jest.Mocked<IShortUrlRepository>;

  beforeEach(async () => {
    const mockShortUrlRepository = {
      findByShortCode: jest.fn(),
      incrementClicks: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedirectUrlUseCase,
        {
          provide: 'SHORT_URL_REPOSITORY',
          useValue: mockShortUrlRepository,
        },
        {
          provide: PrometheusService,
          useValue: {
            incrementUrlRedirected: jest.fn(),
            incrementError: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RedirectUrlUseCase>(RedirectUrlUseCase);
    shortUrlRepository = module.get('SHORT_URL_REPOSITORY');
  });

  describe('execute', () => {
    it('should return original URL and increment clicks when short code exists', async () => {
      // Arrange
      const shortCode = 'abc123';
      const originalUrl = 'https://example.com/very/long/url';

      const mockShortUrl = ShortUrl.create(originalUrl, shortCode, 'user-id');

      shortUrlRepository.findByShortCode.mockResolvedValue(mockShortUrl);
      shortUrlRepository.incrementClicks.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(shortCode);

      // Assert
      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(
        shortCode,
      );
      expect(shortUrlRepository.incrementClicks).toHaveBeenCalledWith(
        mockShortUrl.getId,
      );
      expect(result).toBe(originalUrl);
    });

    it('should throw error when short code does not exist', async () => {
      // Arrange
      const shortCode = 'nonexistent';

      shortUrlRepository.findByShortCode.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(shortCode)).rejects.toThrow('URL not found');
      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(
        shortCode,
      );
      expect(shortUrlRepository.incrementClicks).not.toHaveBeenCalled();
    });

    it('should throw error when short URL is deleted', async () => {
      // Arrange
      const shortCode = 'deleted';
      const originalUrl = 'https://example.com';

      const mockShortUrl = ShortUrl.create(originalUrl, shortCode, 'user-id');

      // Simulate deleted URL
      mockShortUrl.softDelete();

      shortUrlRepository.findByShortCode.mockResolvedValue(mockShortUrl);

      // Act & Assert
      await expect(useCase.execute(shortCode)).rejects.toThrow(
        'URL has been deleted',
      );
      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(
        shortCode,
      );
      expect(shortUrlRepository.incrementClicks).not.toHaveBeenCalled();
    });

    it('should increment clicks count when redirecting', async () => {
      // Arrange
      const shortCode = 'abc123';
      const originalUrl = 'https://example.com';

      const mockShortUrl = ShortUrl.create(originalUrl, shortCode, 'user-id');

      shortUrlRepository.findByShortCode.mockResolvedValue(mockShortUrl);
      shortUrlRepository.incrementClicks.mockResolvedValue(undefined);

      // Act
      await useCase.execute(shortCode);

      // Assert
      expect(shortUrlRepository.incrementClicks).toHaveBeenCalledWith(
        mockShortUrl.getId,
      );
    });
  });
});
