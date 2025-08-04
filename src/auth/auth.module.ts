import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { JwtAuthService } from './infrastructure/services/jwt-auth.service';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { PrismaUserRepository } from '../users/infrastructure/repositories/prisma-user.repository';
import { AUTH_SERVICE, USER_REPOSITORY } from './domain/tokens/auth.tokens';
import { PrismaService } from '../shared/infrastructure/prisma/prisma.service';
import { MetricsModule } from '../shared/infrastructure/metrics/metrics.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    MetricsModule,
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    JwtAuthGuard,
    PrismaService,
    {
      provide: AUTH_SERVICE,
      useClass: JwtAuthService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [JwtAuthGuard, AUTH_SERVICE, JwtModule],
})
export class AuthModule {}
