import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginDto, RegisterDto } from '../../application/dtos/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let registerUseCase: jest.Mocked<RegisterUseCase>;

  beforeEach(async () => {
    const mockLoginUseCase = {
      execute: jest.fn(),
    };

    const mockRegisterUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
        {
          provide: RegisterUseCase,
          useValue: mockRegisterUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get(LoginUseCase);
    registerUseCase = module.get(RegisterUseCase);
  });

  describe('login', () => {
    it('should return authentication response', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        accessToken: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      };

      loginUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('register', () => {
    it('should return authentication response', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        accessToken: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'new@example.com',
        },
      };

      registerUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(registerUseCase.execute).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });
  });
}); 