import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { JwtAuthService } from './infrastructure/services/jwt-auth.service';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { PrismaUserRepository } from '../users/infrastructure/repositories/prisma-user.repository';
import { IUserRepository } from '../users/domain/repositories/user.repository.interface';
import { IAuthService } from './domain/services/auth.service.interface';

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
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    JwtAuthGuard,
    {
      provide: IAuthService,
      useClass: JwtAuthService,
    },
    {
      provide: IUserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [JwtAuthGuard, IAuthService],
})
export class AuthModule {} 