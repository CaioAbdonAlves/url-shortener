import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlUseCase } from './shorten-url.use-case';
import { IShortUrlRepository } from '../../url-shortener/domain/repositories/short-url.repository.interface';
import { IUrlShorteningService } from '../../url-shortener/domain/services/url-shortening.service.interface';
import { ShortenUrlDto } from '../dtos/url-shortener.dto';
import { ShortUrl } from '../../url-shortener/domain/entities/short-url.entity';
import { SHORT_URL_REPOSITORY, URL_SHORTENING_SERVICE } from '../../url-shortener/domain/tokens/url-shortener.tokens';

describe('ShortenUrlUseCase', () => {
  let useCase: ShortenUrlUseCase;
  let shortUrlRepository: jest.Mocked<IShortUrlRepository>;
  let urlShorteningService: jest.Mocked<IUrlShorteningService>;

  beforeEach(async () => {
    const mockShortUrlRepository = {
      findByShortCode: jest.fn(),
      create: jest.fn(),
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
      ],
    }).compile();

    useCase = module.get<ShortenUrlUseCase>(ShortenUrlUseCase);
    shortUrlRepository = module.get(SHORT_URL_REPOSITORY);
    urlShorteningService = module.get(URL_SHORTENING_SERVICE);
  });

  describe('execute', () => {
    const shortenUrlDto: ShortenUrlDto = {
      originalUrl: 'https://example.com',
    };

    const mockShortUrl = new ShortUrl(
      'url-id',
      'https://example.com',
      'abc123',
      'user-id',
      0,
      new Date(),
      new Date(),
      null,
    );

    it('should create short URL with generated code when no custom code provided', async () => {
      const generatedCode = 'xyz789';

      urlShorteningService.validateUrl.mockReturnValue(true);
      urlShorteningService.generateShortCode.mockReturnValue(generatedCode);
      shortUrlRepository.findByShortCode.mockResolvedValue(null);
      shortUrlRepository.create.mockResolvedValue(mockShortUrl);

      const result = await useCase.execute(shortenUrlDto, 'user-id');

      expect(urlShorteningService.validateUrl).toHaveBeenCalledWith(shortenUrlDto.originalUrl);
      expect(urlShorteningService.generateShortCode).toHaveBeenCalled();
      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(generatedCode);
      expect(shortUrlRepository.create).toHaveBeenCalledWith({
        originalUrl: shortenUrlDto.originalUrl,
        shortCode: generatedCode,
        userId: 'user-id',
      });
      expect(result).toEqual({
        id: mockShortUrl.getId(),
        originalUrl: mockShortUrl.getOriginalUrl(),
        shortCode: mockShortUrl.getShortCode(),
        shortUrl: `http://localhost:3000/${mockShortUrl.getShortCode()}`,
        clicksCount: mockShortUrl.getClicksCount(),
        createdAt: mockShortUrl.getCreatedAt(),
      });
    });

    it('should create short URL with custom code when provided', async () => {
      const customCode = 'custom';
      const dtoWithCustomCode = { ...shortenUrlDto, customShortCode: customCode };

      urlShorteningService.validateUrl.mockReturnValue(true);
      shortUrlRepository.findByShortCode.mockResolvedValue(null);
      shortUrlRepository.create.mockResolvedValue(mockShortUrl);

      const result = await useCase.execute(dtoWithCustomCode, 'user-id');

      expect(urlShorteningService.validateUrl).toHaveBeenCalledWith(shortenUrlDto.originalUrl);
      expect(urlShorteningService.generateShortCode).not.toHaveBeenCalled();
      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(customCode);
      expect(shortUrlRepository.create).toHaveBeenCalledWith({
        originalUrl: shortenUrlDto.originalUrl,
        shortCode: customCode,
        userId: 'user-id',
      });
    });

    it('should create short URL without user when userId is not provided', async () => {
      urlShorteningService.validateUrl.mockReturnValue(true);
      urlShorteningService.generateShortCode.mockReturnValue('abc123');
      shortUrlRepository.findByShortCode.mockResolvedValue(null);
      shortUrlRepository.create.mockResolvedValue(mockShortUrl);

      const result = await useCase.execute(shortenUrlDto);

      expect(shortUrlRepository.create).toHaveBeenCalledWith({
        originalUrl: shortenUrlDto.originalUrl,
        shortCode: 'abc123',
        userId: null,
      });
    });

    it('should throw error when URL is invalid', async () => {
      urlShorteningService.validateUrl.mockReturnValue(false);

      await expect(useCase.execute(shortenUrlDto)).rejects.toThrow('Invalid URL');

      expect(urlShorteningService.validateUrl).toHaveBeenCalledWith(shortenUrlDto.originalUrl);
      expect(shortUrlRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when short code already exists', async () => {
      const customCode = 'existing';
      const dtoWithCustomCode = { ...shortenUrlDto, customShortCode: customCode };

      urlShorteningService.validateUrl.mockReturnValue(true);
      shortUrlRepository.findByShortCode.mockResolvedValue(mockShortUrl);

      await expect(useCase.execute(dtoWithCustomCode)).rejects.toThrow('Short code already exists');

      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(customCode);
      expect(shortUrlRepository.create).not.toHaveBeenCalled();
    });
  });
}); 