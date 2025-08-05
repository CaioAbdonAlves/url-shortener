import { Injectable, Inject } from '@nestjs/common';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import {
  ShortUrlResponseDto,
  UrlListResponseDto,
} from '../dtos/url-shortener.dto';
import { CacheService } from '../../../shared/infrastructure/cache/cache.service';

@Injectable()
export class GetUrlsByUserUseCase {
  constructor(
    @Inject('SHORT_URL_REPOSITORY')
    private readonly shortUrlRepository: IShortUrlRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(userId: string): Promise<UrlListResponseDto> {
    // Tentar obter do cache primeiro
    const cached = await this.cacheService.getUserUrls(userId);
    if (cached) {
      return cached;
    }

    // Se não estiver no cache, buscar do banco
    const urls = await this.shortUrlRepository.findByUserId(userId);

    const responseUrls: ShortUrlResponseDto[] = urls.map((url) => ({
      id: url.getId,
      originalUrl: url.getOriginalUrl,
      shortCode: url.getShortCode,
      shortUrl: `${process.env.BASE_URL}/${url.getShortCode}`,
      clicksCount: url.getClicksCount,
      createdAt: url.getCreatedAt,
      updatedAt: url.getUpdatedAt,
    }));

    const result = {
      urls: responseUrls,
      total: responseUrls.length,
    };

    // Armazenar no cache
    await this.cacheService.setUserUrls(userId, result);

    return result;
  }
}
