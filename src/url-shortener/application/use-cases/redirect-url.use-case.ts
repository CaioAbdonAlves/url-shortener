import { Injectable } from '@nestjs/common';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';

@Injectable()
export class RedirectUrlUseCase {
  constructor(private readonly shortUrlRepository: IShortUrlRepository) {}

  async execute(shortCode: string): Promise<string> {
    const shortUrl = await this.shortUrlRepository.findByShortCode(shortCode);

    if (!shortUrl) {
      throw new Error('URL not found');
    }

    if (shortUrl.isDeleted()) {
      throw new Error('URL has been deleted');
    }

    // Increment clicks
    await this.shortUrlRepository.incrementClicks(shortUrl.getId);

    return shortUrl.getOriginalUrl;
  }
}
