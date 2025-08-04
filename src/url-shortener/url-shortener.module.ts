import { Module } from '@nestjs/common';
import { UrlShortenerController } from './presentation/controllers/url-shortener.controller';
import { RedirectController } from './presentation/controllers/redirect.controller';
import { ShortenUrlUseCase } from './application/use-cases/shorten-url.use-case';
import { GetUrlsByUserUseCase } from './application/use-cases/get-urls-by-user.use-case';
import { RedirectUrlUseCase } from './application/use-cases/redirect-url.use-case';
import { PrismaShortUrlRepository } from './infrastructure/repositories/prisma-short-url.repository';
import { RandomUrlShorteningService } from './infrastructure/services/random-url-shortening.service';

import {
  SHORT_URL_REPOSITORY,
  URL_SHORTENING_SERVICE,
} from './domain/tokens/url-shortener.tokens';
import { PrismaService } from '../shared/infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UrlShortenerController, RedirectController],
  providers: [
    ShortenUrlUseCase,
    GetUrlsByUserUseCase,
    RedirectUrlUseCase,
    PrismaService,
    {
      provide: SHORT_URL_REPOSITORY,
      useClass: PrismaShortUrlRepository,
    },
    {
      provide: URL_SHORTENING_SERVICE,
      useClass: RandomUrlShorteningService,
    },
  ],
  exports: [SHORT_URL_REPOSITORY, URL_SHORTENING_SERVICE],
})
export class UrlShortenerModule {}
