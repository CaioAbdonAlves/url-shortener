import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { LoginDto, AuthResponseDto } from '../dtos/auth.dto';
import { PrometheusService } from '../../../shared/infrastructure/metrics/prometheus.service';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    @Inject('AUTH_SERVICE')
    private readonly authService: IAuthService,
    private readonly prometheusService: PrometheusService,
  ) {}

  async execute(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      this.prometheusService.incrementLoginAttempts('failure');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await this.authService.validatePassword(
      loginDto.password,
      user.getPassword,
    );
    if (!isPasswordValid) {
      this.prometheusService.incrementLoginAttempts('failure');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const accessToken = await this.authService.generateToken(
      user.getId,
      user.getEmail,
    );

    // Registrar métrica de sucesso
    this.prometheusService.incrementLoginAttempts('success');

    return {
      accessToken,
      user: {
        id: user.getId,
        email: user.getEmail,
      },
    };
  }
}
