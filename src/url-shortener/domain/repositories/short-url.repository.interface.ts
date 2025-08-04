import { ShortUrl } from '../entities/short-url.entity';

export interface IShortUrlRepository {
  create(shortUrl: ShortUrl): Promise<ShortUrl>;
  findByShortCode(shortCode: string): Promise<ShortUrl | null>;
  findByUserId(userId: string): Promise<ShortUrl[]>;
  findById(id: string): Promise<ShortUrl | null>;
  update(shortUrl: ShortUrl): Promise<ShortUrl>;
  softDelete(id: string): Promise<void>;
  incrementClicks(id: string): Promise<void>;
}
