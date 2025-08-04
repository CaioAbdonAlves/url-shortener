import { Module } from '@nestjs/common';
import { UrlShortenerController } from './presentation/controllers/url-shortener.controller';
import { ShortenUrlUseCase } from './application/use-cases/shorten-url.use-case';
import { GetUrlsByUserUseCase } from './application/use-cases/get-urls-by-user.use-case';
import { RedirectUrlUseCase } from './application/use-cases/redirect-url.use-case';
import { PrismaShortUrlRepository } from './infrastructure/repositories/prisma-short-url.repository';
import { RandomUrlShorteningService } from './infrastructure/services/random-url-shortening.service';
import { IShortUrlRepository } from './domain/repositories/short-url.repository.interface';
import { IUrlShorteningService } from './domain/services/url-shortening.service.interface';

@Module({
  controllers: [UrlShortenerController],
  providers: [
    ShortenUrlUseCase,
    GetUrlsByUserUseCase,
    RedirectUrlUseCase,
    {
      provide: IShortUrlRepository,
      useClass: PrismaShortUrlRepository,
    },
    {
      provide: IUrlShorteningService,
      useClass: RandomUrlShorteningService,
    },
  ],
  exports: [IShortUrlRepository, IUrlShorteningService],
})
export class UrlShortenerModule {} 