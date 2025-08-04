import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './shared/infrastructure/prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UrlShortenerModule } from './url-shortener/url-shortener.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UrlShortenerModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
