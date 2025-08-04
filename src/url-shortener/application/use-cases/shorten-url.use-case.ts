import { Injectable, Inject } from '@nestjs/common';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { IUrlShorteningService } from '../../domain/services/url-shortening.service.interface';
import { ShortUrl } from '../../domain/entities/short-url.entity';
import { ShortenUrlDto, ShortUrlResponseDto } from '../dtos/url-shortener.dto';
import {
  SHORT_URL_REPOSITORY,
  URL_SHORTENING_SERVICE,
} from '../../domain/tokens/url-shortener.tokens';
import { PrometheusService } from '../../../shared/infrastructure/metrics/prometheus.service';

@Injectable()
export class ShortenUrlUseCase {
  constructor(
    @Inject(SHORT_URL_REPOSITORY)
    private readonly shortUrlRepository: IShortUrlRepository,
    @Inject(URL_SHORTENING_SERVICE)
    private readonly urlShorteningService: IUrlShorteningService,
    private readonly prometheusService: PrometheusService,
  ) {}

  async execute(
    dto: ShortenUrlDto,
    userId?: string,
  ): Promise<ShortUrlResponseDto> {
    // Validate URL
    if (!this.urlShorteningService.validateUrl(dto.originalUrl)) {
      throw new Error('Invalid URL format');
    }

    // Generate short code
    const shortCode =
      dto.customShortCode ||
      (await this.urlShorteningService.generateShortCode());

    // Check if short code already exists
    const existingUrl =
      await this.shortUrlRepository.findByShortCode(shortCode);
    if (existingUrl) {
      throw new Error('Short code already exists');
    }

    // Create short URL
    const shortUrl = ShortUrl.create(dto.originalUrl, shortCode, userId);
    const savedShortUrl = await this.shortUrlRepository.create(shortUrl);

    // Registrar métrica
    this.prometheusService.incrementUrlCreated(userId);

    return {
      id: savedShortUrl.getId,
      originalUrl: savedShortUrl.getOriginalUrl,
      shortCode: savedShortUrl.getShortCode,
      shortUrl: `${process.env.BASE_URL}/${savedShortUrl.getShortCode}`,
      clicksCount: savedShortUrl.getClicksCount,
      createdAt: savedShortUrl.getCreatedAt,
      updatedAt: savedShortUrl.getUpdatedAt,
    };
  }
}
