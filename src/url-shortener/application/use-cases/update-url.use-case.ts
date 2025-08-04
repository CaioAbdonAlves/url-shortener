import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { UpdateUrlDto, ShortUrlResponseDto } from '../dtos/url-shortener.dto';
import { SHORT_URL_REPOSITORY } from '../../domain/tokens/url-shortener.tokens';

@Injectable()
export class UpdateUrlUseCase {
  constructor(
    @Inject(SHORT_URL_REPOSITORY)
    private readonly shortUrlRepository: IShortUrlRepository,
  ) {}

  async execute(
    id: string,
    updateUrlDto: UpdateUrlDto,
    userId: string,
  ): Promise<ShortUrlResponseDto> {
    // Find the URL by ID
    const shortUrl = await this.shortUrlRepository.findById(id);
    
    if (!shortUrl) {
      throw new NotFoundException('URL not found');
    }

    // Check if the URL belongs to the user
    if (shortUrl.getUserId !== userId) {
      throw new ForbiddenException('You can only update your own URLs');
    }

    // Check if the URL has been deleted
    if (shortUrl.isDeleted()) {
      throw new NotFoundException('URL has been deleted');
    }

    // Update the URL
    shortUrl.updateOriginalUrl(updateUrlDto.originalUrl);
    const updatedShortUrl = await this.shortUrlRepository.update(shortUrl);

    return {
      id: updatedShortUrl.getId,
      originalUrl: updatedShortUrl.getOriginalUrl,
      shortCode: updatedShortUrl.getShortCode,
      shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/${updatedShortUrl.getShortCode}`,
      clicksCount: updatedShortUrl.getClicksCount,
      createdAt: updatedShortUrl.getCreatedAt,
      updatedAt: updatedShortUrl.getUpdatedAt,
    };
  }
} 