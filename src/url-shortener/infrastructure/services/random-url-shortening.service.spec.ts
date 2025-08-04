import { Test, TestingModule } from '@nestjs/testing';
import { RandomUrlShorteningService } from './random-url-shortening.service';
import { URL_SHORTENING_SERVICE } from '../../url-shortener/domain/tokens/url-shortener.tokens';

describe('RandomUrlShorteningService', () => {
  let service: RandomUrlShorteningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: URL_SHORTENING_SERVICE,
          useClass: RandomUrlShorteningService,
        },
      ],
    }).compile();

    service = module.get<RandomUrlShorteningService>(URL_SHORTENING_SERVICE);
  });

  describe('generateShortCode', () => {
    it('should generate a 6-character alphanumeric code', () => {
      const code = service.generateShortCode();

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should generate different codes on multiple calls', () => {
      const code1 = service.generateShortCode();
      const code2 = service.generateShortCode();

      expect(code1).not.toBe(code2);
    });
  });

  describe('validateUrl', () => {
    it('should return true for valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://www.google.com/search?q=test',
        'ftp://ftp.example.com',
        'https://example.com/path/to/resource',
      ];

      validUrls.forEach(url => {
        expect(service.validateUrl(url)).toBe(true);
      });
    });

    it('should return false for invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'http://',
        'https://',
        'example.com',
        'ftp://',
        '',
        'https://',
        'http://invalid',
      ];

      invalidUrls.forEach(url => {
        expect(service.validateUrl(url)).toBe(false);
      });
    });

    it('should handle URLs with special characters', () => {
      const validUrls = [
        'https://example.com/path with spaces',
        'https://example.com/path%20with%20spaces',
        'https://example.com/path?param=value&other=123',
        'https://example.com/path#fragment',
      ];

      validUrls.forEach(url => {
        expect(service.validateUrl(url)).toBe(true);
      });
    });
  });
}); 