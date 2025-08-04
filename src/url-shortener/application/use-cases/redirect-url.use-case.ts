import { Injectable, Inject } from '@nestjs/common';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { SHORT_URL_REPOSITORY } from '../../domain/tokens/url-shortener.tokens';

@Injectable()
export class RedirectUrlUseCase {
  constructor(
    @Inject(SHORT_URL_REPOSITORY)
    private readonly shortUrlRepository: IShortUrlRepository,
  ) {}

  async execute(shortCode: string): Promise<string> {
    const shortUrl = await this.shortUrlRepository.findByShortCode(shortCode);

    if (!shortUrl) {
      throw new Error('URL not found');
    }

    if (shortUrl.isDeleted()) {
      throw new Error('URL has been deleted');
    }

    // Increment clicks count
    await this.shortUrlRepository.incrementClicks(shortUrl.getId);

    return shortUrl.getOriginalUrl;
  }
}
