import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.getEmail === email);
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.getId === id);
    return user || null;
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async update(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.getId === user.getId);
    if (index !== -1) {
      this.users[index] = user;
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex((u) => u.getId === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  // Helper method for testing
  clear(): void {
    this.users = [];
  }

  // Helper method for testing
  seed(users: User[]): void {
    this.users = [...users];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
