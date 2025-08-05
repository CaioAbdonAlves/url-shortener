import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 10, // 10 requisições por minuto
      },
      {
        ttl: 3600000, // 1 hora
        limit: 100, // 100 requisições por hora
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
