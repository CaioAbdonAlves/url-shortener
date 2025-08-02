import { z } from 'zod';

// Validation schemas
export const ShortenUrlDtoSchema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
  customShortCode: z.string().min(1).max(6).optional(),
});

export const UpdateUrlDtoSchema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
});

// DTOs
export class ShortenUrlDto {
  originalUrl: string;
  customShortCode?: string;
}

export class UpdateUrlDto {
  originalUrl: string;
}

export class ShortUrlResponseDto {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UrlListResponseDto {
  urls: ShortUrlResponseDto[];
  total: number;
}
