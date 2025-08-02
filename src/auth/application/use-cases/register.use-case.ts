import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { User } from '../../domain/entities/user.entity';
import { RegisterDto, AuthResponseDto } from '../dtos/auth.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  async execute(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(
      registerDto.password,
    );

    // Create user
    const user = User.create(registerDto.email, hashedPassword);
    const savedUser = await this.userRepository.create(user);

    // Generate token
    const accessToken = await this.authService.generateToken(
      savedUser.getId,
      savedUser.getEmail,
    );

    return {
      accessToken,
      user: {
        id: savedUser.getId,
        email: savedUser.getEmail,
      },
    };
  }
}
