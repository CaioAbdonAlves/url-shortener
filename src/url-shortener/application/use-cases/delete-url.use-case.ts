import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { SHORT_URL_REPOSITORY } from '../../domain/tokens/url-shortener.tokens';

@Injectable()
export class DeleteUrlUseCase {
  constructor(
    @Inject(SHORT_URL_REPOSITORY)
    private readonly shortUrlRepository: IShortUrlRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    // Find the URL by ID
    const shortUrl = await this.shortUrlRepository.findById(id);
    
    if (!shortUrl) {
      throw new NotFoundException('URL not found');
    }

    // Check if the URL belongs to the user
    if (shortUrl.getUserId !== userId) {
      throw new ForbiddenException('You can only delete your own URLs');
    }

    // Check if the URL has been deleted
    if (shortUrl.isDeleted()) {
      throw new NotFoundException('URL has been deleted');
    }

    // Soft delete the URL
    await this.shortUrlRepository.softDelete(id);
  }
} 