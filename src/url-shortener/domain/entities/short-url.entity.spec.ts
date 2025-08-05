import { ShortUrl } from './short-url.entity';

describe('ShortUrl Entity', () => {
  let shortUrl: ShortUrl;

  beforeEach(() => {
    shortUrl = new ShortUrl(
      'test-id',
      'https://example.com',
      'abc123',
      'user-id',
      0,
      new Date('2023-01-01'),
      new Date('2023-01-01'),
      null,
    );
  });

  describe('constructor', () => {
    it('should create a short URL with all properties', () => {
      expect(shortUrl.getId).toBe('test-id');
      expect(shortUrl.getOriginalUrl).toBe('https://example.com');
      expect(shortUrl.getShortCode).toBe('abc123');
      expect(shortUrl.getUserId).toBe('user-id');
      expect(shortUrl.getClicksCount).toBe(0);
      expect(shortUrl.getCreatedAt).toEqual(new Date('2023-01-01'));
      expect(shortUrl.getUpdatedAt).toEqual(new Date('2023-01-01'));
      expect(shortUrl.getDeletedAt).toBeNull();
    });
  });

  describe('incrementClicks', () => {
    it('should increment clicks count and update updatedAt', () => {
      const initialClicks = shortUrl.getClicksCount;
      const oldUpdatedAt = shortUrl.getUpdatedAt;

      shortUrl.incrementClicks();

      expect(shortUrl.getClicksCount).toBe(initialClicks + 1);
      expect(shortUrl.getUpdatedAt).not.toEqual(oldUpdatedAt);
    });
  });

  describe('updateOriginalUrl', () => {
    it('should update original URL and updatedAt', () => {
      const newUrl = 'https://newexample.com';
      const oldUpdatedAt = shortUrl.getUpdatedAt;

      shortUrl.updateOriginalUrl(newUrl);

      expect(shortUrl.getOriginalUrl).toBe(newUrl);
      expect(shortUrl.getUpdatedAt).not.toEqual(oldUpdatedAt);
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt and update updatedAt', () => {
      const oldUpdatedAt = shortUrl.getUpdatedAt;

      shortUrl.softDelete();

      expect(shortUrl.getDeletedAt).not.toBeNull();
      expect(shortUrl.getUpdatedAt).not.toEqual(oldUpdatedAt);
    });
  });

  describe('isDeleted', () => {
    it('should return false when deletedAt is null', () => {
      expect(shortUrl.isDeleted()).toBe(false);
    });

    it('should return true when deletedAt is not null', () => {
      shortUrl.softDelete();
      expect(shortUrl.isDeleted()).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return correct values', () => {
      expect(shortUrl.getId).toBe('test-id');
      expect(shortUrl.getOriginalUrl).toBe('https://example.com');
      expect(shortUrl.getShortCode).toBe('abc123');
      expect(shortUrl.getUserId).toBe('user-id');
      expect(shortUrl.getClicksCount).toBe(0);
      expect(shortUrl.getCreatedAt).toEqual(new Date('2023-01-01'));
      expect(shortUrl.getUpdatedAt).toEqual(new Date('2023-01-01'));
      expect(shortUrl.getDeletedAt).toBeNull();
    });
  });
});
