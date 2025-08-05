import { Test, TestingModule } from '@nestjs/testing';
import { RandomUrlShorteningService } from './random-url-shortening.service';

describe('RandomUrlShorteningService', () => {
  let service: RandomUrlShorteningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomUrlShorteningService],
    }).compile();

    service = module.get<RandomUrlShorteningService>(
      RandomUrlShorteningService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateShortCode', () => {
    it('should generate a 6-character alphanumeric code', async () => {
      const code = await service.generateShortCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should generate different codes on multiple calls', async () => {
      const code1 = await service.generateShortCode();
      const code2 = await service.generateShortCode();
      expect(code1).not.toBe(code2);
    });
  });

  describe('validateUrl', () => {
    it('should return true for valid URLs', () => {
      const validUrls = [
        'https://www.google.com',
        'http://example.com',
        'https://api.github.com/users/octocat',
        'http://localhost:3000',
      ];

      validUrls.forEach((url) => {
        expect(service.validateUrl(url)).toBe(true);
      });
    });

    it('should return false for invalid URLs', () => {
      const invalidUrls = ['not-a-url', 'http://', 'https://', 'just-text', ''];

      invalidUrls.forEach((url) => {
        expect(service.validateUrl(url)).toBe(false);
      });
    });
  });
});
