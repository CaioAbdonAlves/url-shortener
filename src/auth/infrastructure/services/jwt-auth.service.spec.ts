import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtAuthService } from './jwt-auth.service';
import { AUTH_SERVICE } from '../../auth/domain/tokens/auth.tokens';

jest.mock('bcryptjs');

describe('JwtAuthService', () => {
  let service: JwtAuthService;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<JwtAuthService>(JwtAuthService);
    jwtService = module.get(JwtService);
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('validatePassword', () => {
    it('should return true when password is valid', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when password is invalid', async () => {
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token', async () => {
      const payload = { id: 'user-id', email: 'test@example.com' };
      const token = 'jwt-token';

      jwtService.sign.mockReturnValue(token);

      const result = await service.generateToken(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe(token);
    });
  });

  describe('verifyToken', () => {
    it('should verify JWT token and return payload', async () => {
      const token = 'jwt-token';
      const payload = { id: 'user-id', email: 'test@example.com' };

      jwtService.verify.mockReturnValue(payload);

      const result = await service.verifyToken(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual(payload);
    });

    it('should throw error when token is invalid', async () => {
      const token = 'invalid-token';

      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyToken(token)).rejects.toThrow('Invalid token');
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });
  });
}); 