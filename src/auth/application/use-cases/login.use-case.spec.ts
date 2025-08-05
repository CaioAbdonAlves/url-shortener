import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { LoginDto } from '../../application/dtos/auth.dto';
import { User } from '../../../users/domain/entities/user.entity';
import { PrometheusService } from '../../../shared/infrastructure/metrics/prometheus.service';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let authService: jest.Mocked<IAuthService>;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
    };

    const mockAuthService = {
      validatePassword: jest.fn(),
      generateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: 'USER_REPOSITORY',
          useValue: mockUserRepository,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthService,
        },
        {
          provide: PrometheusService,
          useValue: {
            incrementLoginAttempts: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get('USER_REPOSITORY');
    authService = module.get('AUTH_SERVICE');
  });

  describe('execute', () => {
    it('should return token when credentials are valid', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = new User(
        'user-id',
        'test@example.com',
        'hashedPassword',
        new Date(),
        new Date()
      );

      const token = 'jwt-token';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      authService.validatePassword.mockResolvedValue(true);
      authService.generateToken.mockResolvedValue(token);

      // Act
      const result = await useCase.execute(loginDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(authService.validatePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.getPassword,
      );
      expect(authService.generateToken).toHaveBeenCalledWith(mockUser.getId, mockUser.getEmail);
      expect(result).toEqual({
        accessToken: token,
        user: {
          id: mockUser.getId,
          email: mockUser.getEmail,
        },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(authService.validatePassword).not.toHaveBeenCalled();
      expect(authService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = new User(
        'user-id',
        'test@example.com',
        'hashedPassword',
        new Date(),
        new Date()
      );

      userRepository.findByEmail.mockResolvedValue(mockUser);
      authService.validatePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(authService.validatePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.getPassword,
      );
      expect(authService.generateToken).not.toHaveBeenCalled();
    });
  });
}); 