import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlUseCase } from './shorten-url.use-case';
import { InMemoryShortUrlRepository } from '../../infrastructure/repositories/in-memory-short-url.repository';
import { RandomUrlShorteningService } from '../../infrastructure/services/random-url-shortening.service';
import { ShortenUrlDto } from '../dtos/url-shortener.dto';
import { SHORT_URL_REPOSITORY, URL_SHORTENING_SERVICE } from '../../domain/tokens/url-shortener.tokens';

describe('ShortenUrlUseCase Integration', () => {
  let useCase: ShortenUrlUseCase;
  let shortUrlRepository: InMemoryShortUrlRepository;
  let urlShorteningService: RandomUrlShorteningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenUrlUseCase,
        {
          provide: SHORT_URL_REPOSITORY,
          useClass: InMemoryShortUrlRepository,
        },
        {
          provide: URL_SHORTENING_SERVICE,
          useClass: RandomUrlShorteningService,
        },
      ],
    }).compile();

    useCase = module.get<ShortenUrlUseCase>(ShortenUrlUseCase);
    shortUrlRepository = module.get(SHORT_URL_REPOSITORY);
    urlShorteningService = module.get(URL_SHORTENING_SERVICE);
  });

  afterEach(() => {
    shortUrlRepository.clear();
  });

  describe('execute', () => {
    const shortenUrlDto: ShortenUrlDto = {
      originalUrl: 'https://example.com',
    };

    it('should create short URL with generated code when no custom code provided', async () => {
      // Act
      const result = await useCase.execute(shortenUrlDto, 'user-id');

      // Assert
      expect(result.id).toBeDefined();
      expect(result.originalUrl).toBe(shortenUrlDto.originalUrl);
      expect(result.shortCode).toHaveLength(6);
      expect(result.shortCode).toMatch(/^[a-zA-Z0-9]+$/);
      expect(result.shortUrl).toBe(`http://localhost:3000/${result.shortCode}`);
      expect(result.clicksCount).toBe(0);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should create short URL with custom code when provided', async () => {
      // Arrange
      const customCode = 'custom';
      const dtoWithCustomCode = { ...shortenUrlDto, customShortCode: customCode };

      // Act
      const result = await useCase.execute(dtoWithCustomCode, 'user-id');

      // Assert
      expect(result.shortCode).toBe(customCode);
      expect(result.shortUrl).toBe(`http://localhost:3000/${customCode}`);
    });

    it('should create short URL without user when userId is not provided', async () => {
      // Act
      const result = await useCase.execute(shortenUrlDto);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.originalUrl).toBe(shortenUrlDto.originalUrl);
    });

    it('should throw error when URL is invalid', async () => {
      // Arrange
      const invalidDto = { originalUrl: 'not-a-url' };

      // Act & Assert
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Invalid URL');
    });

    it('should throw error when short code already exists', async () => {
      // Arrange
      const customCode = 'existing';
      const dtoWithCustomCode = { ...shortenUrlDto, customShortCode: customCode };

      // Create first URL
      await useCase.execute(dtoWithCustomCode, 'user-id');

      // Act & Assert - Try to create second URL with same code
      await expect(useCase.execute(dtoWithCustomCode)).rejects.toThrow('Short code already exists');
    });

    it('should generate different codes for different URLs', async () => {
      // Act
      const result1 = await useCase.execute(shortenUrlDto, 'user-id');
      const result2 = await useCase.execute({ originalUrl: 'https://another.com' }, 'user-id');

      // Assert
      expect(result1.shortCode).not.toBe(result2.shortCode);
    });
  });
}); 