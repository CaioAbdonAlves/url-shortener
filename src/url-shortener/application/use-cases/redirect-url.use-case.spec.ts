import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RedirectUrlUseCase } from './redirect-url.use-case';
import { IShortUrlRepository } from '../../url-shortener/domain/repositories/short-url.repository.interface';
import { ShortUrl } from '../../url-shortener/domain/entities/short-url.entity';
import { SHORT_URL_REPOSITORY } from '../../url-shortener/domain/tokens/url-shortener.tokens';

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
          provide: SHORT_URL_REPOSITORY,
          useValue: mockShortUrlRepository,
        },
      ],
    }).compile();

    useCase = module.get<RedirectUrlUseCase>(RedirectUrlUseCase);
    shortUrlRepository = module.get(SHORT_URL_REPOSITORY);
  });

  describe('execute', () => {
    const shortCode = 'abc123';
    const mockShortUrl = new ShortUrl(
      'url-id',
      'https://example.com',
      shortCode,
      'user-id',
      5,
      new Date(),
      new Date(),
      null,
    );

    it('should return original URL and increment clicks when short code exists', async () => {
      shortUrlRepository.findByShortCode.mockResolvedValue(mockShortUrl);
      shortUrlRepository.incrementClicks.mockResolvedValue(undefined);

      const result = await useCase.execute(shortCode);

      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(shortUrlRepository.incrementClicks).toHaveBeenCalledWith(mockShortUrl.getId());
      expect(result).toBe(mockShortUrl.getOriginalUrl());
    });

    it('should throw NotFoundException when short code does not exist', async () => {
      shortUrlRepository.findByShortCode.mockResolvedValue(null);

      await expect(useCase.execute(shortCode)).rejects.toThrow(NotFoundException);

      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(shortUrlRepository.incrementClicks).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when URL is deleted', async () => {
      const deletedShortUrl = new ShortUrl(
        'url-id',
        'https://example.com',
        shortCode,
        'user-id',
        5,
        new Date(),
        new Date(),
        new Date(), // deletedAt is set
      );

      shortUrlRepository.findByShortCode.mockResolvedValue(deletedShortUrl);

      await expect(useCase.execute(shortCode)).rejects.toThrow(NotFoundException);

      expect(shortUrlRepository.findByShortCode).toHaveBeenCalledWith(shortCode);
      expect(shortUrlRepository.incrementClicks).not.toHaveBeenCalled();
    });
  });
}); 