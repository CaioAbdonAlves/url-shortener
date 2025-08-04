import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { IShortUrlRepository } from '../../domain/repositories/short-url.repository.interface';
import { ShortUrl } from '../../domain/entities/short-url.entity';

@Injectable()
export class PrismaShortUrlRepository implements IShortUrlRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(shortUrl: ShortUrl): Promise<ShortUrl> {
    const data = await this.prisma.shortUrl.create({
      data: {
        id: shortUrl.getId,
        originalUrl: shortUrl.getOriginalUrl,
        shortCode: shortUrl.getShortCode,
        userId: shortUrl.getUserId,
        clicksCount: shortUrl.getClicksCount,
        createdAt: shortUrl.getCreatedAt,
        updatedAt: shortUrl.getUpdatedAt,
        deletedAt: shortUrl.getDeletedAt,
      },
    });

    return ShortUrl.reconstruct(data);
  }

  async findByShortCode(shortCode: string): Promise<ShortUrl | null> {
    const data = await this.prisma.shortUrl.findFirst({
      where: {
        shortCode,
        deletedAt: null,
      },
    });

    if (!data) return null;

    return ShortUrl.reconstruct(data);
  }

  async findByUserId(userId: string): Promise<ShortUrl[]> {
    const data = await this.prisma.shortUrl.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return data.map((item) => ShortUrl.reconstruct(item));
  }

  async findById(id: string): Promise<ShortUrl | null> {
    const data = await this.prisma.shortUrl.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!data) return null;

    return ShortUrl.reconstruct(data);
  }

  async update(shortUrl: ShortUrl): Promise<ShortUrl> {
    const data = await this.prisma.shortUrl.update({
      where: { id: shortUrl.getId },
      data: {
        originalUrl: shortUrl.getOriginalUrl,
        shortCode: shortUrl.getShortCode,
        clicksCount: shortUrl.getClicksCount,
        updatedAt: shortUrl.getUpdatedAt,
        deletedAt: shortUrl.getDeletedAt,
      },
    });

    return ShortUrl.reconstruct(data);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.shortUrl.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async incrementClicks(id: string): Promise<void> {
    await this.prisma.shortUrl.update({
      where: { id },
      data: {
        clicksCount: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
    });
  }
}
