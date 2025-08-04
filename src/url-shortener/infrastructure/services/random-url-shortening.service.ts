import { Injectable } from '@nestjs/common';
import { IUrlShorteningService } from '../../domain/services/url-shortening.service.interface';

@Injectable()
export class RandomUrlShorteningService implements IUrlShorteningService {
  private readonly CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  private readonly CODE_LENGTH = 6;

  async generateShortCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateRandomCode();
      attempts++;
    } while (attempts < maxAttempts);

    return code;
  }

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private generateRandomCode(): string {
    let result = '';
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      result += this.CHARS.charAt(
        Math.floor(Math.random() * this.CHARS.length),
      );
    }
    return result;
  }
}
