import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';
import { InMemoryUserRepository } from '../../users/infrastructure/repositories/in-memory-user.repository';
import { JwtAuthService } from '../../infrastructure/services/jwt-auth.service';
import { LoginDto } from '../dtos/auth.dto';
import { User } from '../../users/domain/entities/user.entity';
import { AUTH_SERVICE, USER_REPOSITORY } from '../../auth/domain/tokens/auth.tokens';

describe('LoginUseCase Integration', () => {
  let useCase: LoginUseCase;
  let userRepository: InMemoryUserRepository;
  let authService: JwtAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: USER_REPOSITORY,
          useClass: InMemoryUserRepository,
        },
        {
          provide: AUTH_SERVICE,
          useClass: JwtAuthService,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(USER_REPOSITORY);
    authService = module.get(AUTH_SERVICE);
  });

  afterEach(() => {
    userRepository.clear();
  });

  describe('execute', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return token when credentials are valid', async () => {
      // Arrange
      const hashedPassword = await authService.hashPassword('password123');
      const user = new User(
        'user-id',
        'test@example.com',
        hashedPassword,
        new Date(),
        new Date(),
      );
      userRepository.seed([user]);

      // Act
      const result = await useCase.execute(loginDto);

      // Assert
      expect(result.access_token).toBeDefined();
      expect(result.user).toEqual({
        id: user.getId(),
        email: user.getEmail(),
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Act & Assert
      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const hashedPassword = await authService.hashPassword('wrongpassword');
      const user = new User(
        'user-id',
        'test@example.com',
        hashedPassword,
        new Date(),
        new Date(),
      );
      userRepository.seed([user]);

      // Act & Assert
      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
}); 