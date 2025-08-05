import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlUseCase } from './shorten-url.use-case';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { IUrlShorteningService } from '../../domain/services/url-shortening.service.interface';
import { ShortenUrlDto } from '../dtos/url-shortener.dto';
import { ShortUrl } from '../../domain/entities/short-url.entity';
import {
  SHORT_URL_REPOSITORY,
  URL_SHORTENING_SERVICE,
} from '../../domain/tokens/url-shortener.tokens';
import { PrometheusService } from '../../../shared/infrastructure/metrics/prometheus.service';

describe('ShortenUrlUseCase', () => {
  let useCase: ShortenUrlUseCase;
  let shortUrlRepository: jest.Mocked<IShortUrlRepository>;
  let urlShorteningService: jest.Mocked<IUrlShorteningService>;

  beforeEach(async () => {
    // Mock environment variable
    process.env.BASE_URL = 'http://localhost:3000';

    const mockShortUrlRepository = {
      findByShortCode: jest.fn(),
      create: jest.fn(),
      findByOriginalUrl: jest.fn(),
    };

    const mockUrlShorteningService = {
      generateShortCode: jest.fn(),
      validateUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenUrlUseCase,
        {
          provide: SHORT_URL_REPOSITORY,
          useValue: mockShortUrlRepository,
        },
        {
          provide: URL_SHORTENING_SERVICE,
          useValue: mockUrlShorteningService,
        },
        {
          provide: PrometheusService,
          useValue: {
            incrementUrlCreated: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ShortenUrlUseCase>(ShortenUrlUseCase);
    shortUrlRepository = module.get(SHORT_URL_REPOSITORY);
    urlShorteningService = module.get(URL_SHORTENING_SERVICE);
  });

  afterEach(() => {
    delete process.env.BASE_URL;
  });

  describe('execute', () => {
    it('should create short URL with generated code when no custom code provided', async () => {
      // Arrange
      const shortenUrlDto: ShortenUrlDto = {
        originalUrl: 'https://example.com/very/long/url',
      };

      const generatedCode = 'abc123';
      const baseUrl = 'http://localhost:3000';

      const mockShortUrl = ShortUrl.create(
        shortenUrlDto.originalUrl,
        generatedCode,
        'user-id',
      );

      urlShorteningService.validateUrl.mockReturnValue(true);
      urlShorteningService.generateShortCode.mockResolvedValue(generatedCode);
      shortUrlRepository.findByShortCode.mockResolvedValue(null);
      shortUrlRepository.create.mockResolvedValue(mockShortUrl);

      // Act
      const result = await useCase.execute(shortenUrlDto, 'user-id');

      // Assert
      expect(urlShorteningService.validateUrl).toHaveBeenCalledWith(
        shortenUrlDto.originalUrl,
      );
      expect(urlShorteningService.generateShortCode).toHaveBeenCalled();
      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(
        generatedCode,
      );
      expect(shortUrlRepository.create).toHaveBeenCalledWith(
        expect.any(ShortUrl),
      );
      expect(result.shortCode).toHaveLength(6);
      expect(result.shortCode).toMatch(/^[a-zA-Z0-9]+$/);
      expect(result.shortUrl).toBe(`${baseUrl}/${result.shortCode}`);
      expect(result.clicksCount).toBe(0);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should create short URL with custom code when provided', async () => {
      // Arrange
      const customCode = 'custom';
      const baseUrl = 'http://localhost:3000';
      const shortenUrlDto: ShortenUrlDto = {
        originalUrl: 'https://example.com',
        customShortCode: customCode,
      };

      const mockShortUrl = ShortUrl.create(
        shortenUrlDto.originalUrl,
        customCode,
        'user-id',
      );

      urlShorteningService.validateUrl.mockReturnValue(true);
      shortUrlRepository.findByShortCode.mockResolvedValue(null);
      shortUrlRepository.create.mockResolvedValue(mockShortUrl);

      // Act
      const result = await useCase.execute(shortenUrlDto, 'user-id');

      // Assert
      expect(result.shortCode).toBe(customCode);
      expect(result.shortUrl).toBe(`${baseUrl}/${customCode}`);
    });

    it('should throw error when URL is invalid', async () => {
      // Arrange
      const shortenUrlDto: ShortenUrlDto = {
        originalUrl: 'not-a-url',
      };

      urlShorteningService.validateUrl.mockReturnValue(false);

      // Act & Assert
      await expect(useCase.execute(shortenUrlDto, 'user-id')).rejects.toThrow(
        'Invalid URL format',
      );
      expect(urlShorteningService.validateUrl).toHaveBeenCalledWith(
        shortenUrlDto.originalUrl,
      );
      expect(shortUrlRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when short code already exists', async () => {
      // Arrange
      const customCode = 'existing';
      const shortenUrlDto: ShortenUrlDto = {
        originalUrl: 'https://example.com',
        customShortCode: customCode,
      };

      const existingShortUrl = ShortUrl.create(
        'https://another.com',
        customCode,
        'another-user',
      );

      urlShorteningService.validateUrl.mockReturnValue(true);
      shortUrlRepository.findByShortCode.mockResolvedValue(existingShortUrl);

      // Act & Assert
      await expect(useCase.execute(shortenUrlDto, 'user-id')).rejects.toThrow(
        'Short code already exists',
      );
      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(
        customCode,
      );
      expect(shortUrlRepository.create).not.toHaveBeenCalled();
    });
  });
});
