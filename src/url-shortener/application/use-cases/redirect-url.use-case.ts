import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { PrometheusService } from '../../../shared/infrastructure/metrics/prometheus.service';

@Injectable()
export class RedirectUrlUseCase {
  constructor(
    @Inject('SHORT_URL_REPOSITORY')
    private readonly shortUrlRepository: IShortUrlRepository,
    private readonly prometheusService: PrometheusService,
  ) {}

  async execute(shortCode: string): Promise<string> {
    const shortUrl = await this.shortUrlRepository.findByShortCode(shortCode);

    if (!shortUrl) {
      this.prometheusService.incrementError('not_found', 'redirect');
      throw new NotFoundException('URL not found');
    }

    if (shortUrl.isDeleted()) {
      this.prometheusService.incrementError('deleted', 'redirect');
      throw new NotFoundException('URL has been deleted');
    }

    // Increment clicks count
    await this.shortUrlRepository.incrementClicks(shortUrl.getId);

    // Registrar métrica de redirecionamento
    this.prometheusService.incrementUrlRedirected(shortCode);

    return shortUrl.getOriginalUrl;
  }
}
