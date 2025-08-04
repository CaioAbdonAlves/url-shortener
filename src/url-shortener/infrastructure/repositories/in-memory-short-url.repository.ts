import { Injectable } from '@nestjs/common';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { ShortUrl } from '../../domain/entities/short-url.entity';

@Injectable()
export class InMemoryShortUrlRepository implements IShortUrlRepository {
  private shortUrls: ShortUrl[] = [];

  async findByShortCode(shortCode: string): Promise<ShortUrl | null> {
    const shortUrl = this.shortUrls.find(u => u.getShortCode === shortCode);
    return shortUrl || null;
  }

  async findById(id: string): Promise<ShortUrl | null> {
    const shortUrl = this.shortUrls.find(u => u.getId === id);
    return shortUrl || null;
  }

  async findByUserId(userId: string): Promise<ShortUrl[]> {
    return this.shortUrls.filter(u => u.getUserId === userId && !u.isDeleted());
  }

  async create(shortUrl: ShortUrl): Promise<ShortUrl> {
    this.shortUrls.push(shortUrl);
    return shortUrl;
  }

  async update(shortUrl: ShortUrl): Promise<ShortUrl> {
    const index = this.shortUrls.findIndex(u => u.getId === shortUrl.getId);
    if (index !== -1) {
      this.shortUrls[index] = shortUrl;
    }
    return shortUrl;
  }

  async softDelete(id: string): Promise<void> {
    const shortUrl = this.shortUrls.find(u => u.getId === id);
    if (shortUrl) {
      shortUrl.softDelete();
    }
  }

  async incrementClicks(id: string): Promise<void> {
    const shortUrl = this.shortUrls.find(u => u.getId === id);
    if (shortUrl) {
      shortUrl.incrementClicks();
    }
  }

  async findAll(): Promise<ShortUrl[]> {
    return this.shortUrls.filter(u => !u.isDeleted());
  }

  // Helper method for testing
  clear(): void {
    this.shortUrls = [];
  }

  // Helper method for testing
  seed(shortUrls: ShortUrl[]): void {
    this.shortUrls = [...shortUrls];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 