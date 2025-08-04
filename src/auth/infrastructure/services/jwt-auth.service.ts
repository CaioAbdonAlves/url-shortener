import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IAuthService } from '../../domain/services/auth.service.interface';

@Injectable()
export class JwtAuthService implements IAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async generateToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string }> {
    const payload = await this.jwtService.verify(token);
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
