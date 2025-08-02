import { Injectable } from '@nestjs/common';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import {
  ShortUrlResponseDto,
  UrlListResponseDto,
} from '../dtos/url-shortener.dto';

@Injectable()
export class GetUrlsByUserUseCase {
  constructor(private readonly shortUrlRepository: IShortUrlRepository) {}

  async execute(userId: string): Promise<UrlListResponseDto> {
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

    return {
      urls: responseUrls,
      total: responseUrls.length,
    };
  }
}
