import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { LoginDto, AuthResponseDto } from '../dtos/auth.dto';
import { AUTH_SERVICE, USER_REPOSITORY } from '../../domain/tokens/auth.tokens';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  async execute(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await this.authService.validatePassword(
      loginDto.password,
      user.getPassword,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const accessToken = await this.authService.generateToken(
      user.getId,
      user.getEmail,
    );

    return {
      accessToken,
      user: {
        id: user.getId,
        email: user.getEmail,
      },
    };
  }
}
