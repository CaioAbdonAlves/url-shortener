import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '../../users/domain/repositories/user.repository.interface';
import { IAuthService } from '../../auth/domain/services/auth.service.interface';
import { RegisterDto } from '../dtos/auth.dto';
import { User } from '../../users/domain/entities/user.entity';
import { AUTH_SERVICE, USER_REPOSITORY } from '../../auth/domain/tokens/auth.tokens';

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
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = new User(
      'user-id',
      'test@example.com',
      'hashedPassword',
      new Date(),
      new Date(),
    );

    it('should create user and return token when registration is successful', async () => {
      const mockToken = 'jwt-token';
      const hashedPassword = 'hashedPassword';

      userRepository.findByEmail.mockResolvedValue(null);
      authService.hashPassword.mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockUser);
      authService.generateToken.mockResolvedValue(mockToken);

      const result = await useCase.execute(registerDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(authService.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
      });
      expect(authService.generateToken).toHaveBeenCalledWith({
        id: mockUser.getId(),
        email: mockUser.getEmail(),
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.getId(),
          email: mockUser.getEmail(),
        },
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(useCase.execute(registerDto)).rejects.toThrow(
        ConflictException,
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(authService.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(authService.generateToken).not.toHaveBeenCalled();
    });
  });
}); 