import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const data = await this.prisma.user.create({
      data: {
        id: user.getId,
        email: user.getEmail,
        password: user.getPassword,
        createdAt: user.getCreatedAt,
        updatedAt: user.getUpdatedAt,
      },
    });

    return User.reconstruct(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!data) return null;

    return User.reconstruct(data);
  }

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!data) return null;

    return User.reconstruct(data);
  }

  async update(user: User): Promise<User> {
    const data = await this.prisma.user.update({
      where: { id: user.getId },
      data: {
        email: user.getEmail,
        password: user.getPassword,
        updatedAt: user.getUpdatedAt,
      },
    });

    return User.reconstruct(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
