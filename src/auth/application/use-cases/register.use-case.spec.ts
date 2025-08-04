import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { RegisterDto } from '../../application/dtos/auth.dto';
import { User } from '../../../users/domain/entities/user.entity';
import { USER_REPOSITORY } from '../../domain/tokens/auth.tokens';
import { AUTH_SERVICE } from '../../domain/tokens/auth.tokens';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let authService: jest.Mocked<IAuthService>;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockAuthService = {
      hashPassword: jest.fn(),
      generateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: AUTH_SERVICE,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get(USER_REPOSITORY);
    authService = module.get(AUTH_SERVICE);
  });

  describe('execute', () => {
    it('should create user and return token when registration is successful', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword';
      const token = 'jwt-token';

      const mockUser = new User(
        'user-id',
        'test@example.com',
        'hashedPassword',
        new Date(),
        new Date(),
      );

      userRepository.findByEmail.mockResolvedValue(null);
      authService.hashPassword.mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockUser);
      authService.generateToken.mockResolvedValue(token);

      // Act
      const result = await useCase.execute(registerDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(authService.hashPassword).toHaveBeenCalledWith(
        registerDto.password,
      );
      expect(userRepository.create).toHaveBeenCalledWith(expect.any(User));
      expect(authService.generateToken).toHaveBeenCalledWith(
        mockUser.getId,
        mockUser.getEmail,
      );
      expect(result).toEqual({
        accessToken: token,
        user: {
          id: mockUser.getId,
          email: mockUser.getEmail,
        },
      });
    });

    it('should throw error when user already exists', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const existingUser = new User(
        'existing-id',
        'existing@example.com',
        'hashedPassword',
        new Date(),
        new Date(),
      );

      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(registerDto)).rejects.toThrow(
        'User already exists',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(authService.generateToken).not.toHaveBeenCalled();
    });
  });
});
