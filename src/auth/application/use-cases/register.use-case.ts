import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { IAuthService } from '../../domain/services/auth.service.interface';
import { User } from '../../../users/domain/entities/user.entity';
import { RegisterDto, AuthResponseDto } from '../dtos/auth.dto';
import { PrometheusService } from '../../../shared/infrastructure/metrics/prometheus.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    @Inject('AUTH_SERVICE')
    private readonly authService: IAuthService,
    private readonly prometheusService: PrometheusService,
  ) {}

  async execute(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      this.prometheusService.incrementRegistration('failure');
      throw new ConflictException('User already exists');
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

    // Registrar métrica de sucesso
    this.prometheusService.incrementRegistration('success');

    return {
      accessToken,
      user: {
        id: savedUser.getId,
        email: savedUser.getEmail,
      },
    };
  }
}
