import {
  IsUrl,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShortenUrlDto {
  @ApiProperty({
    description: 'Original URL to be shortened',
    example: 'https://example.com/very-long-url',
  })
  @IsUrl()
  originalUrl: string;

  @ApiProperty({
    description:
      'Custom short code (optional, 3-6 characters, alphanumeric only)',
    example: 'abc123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'Custom short code must be at least 3 characters long',
  })
  @MaxLength(6, {
    message: 'Custom short code must be at most 6 characters long',
  })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Custom short code must contain only letters and numbers',
  })
  customShortCode?: string;
}

export class UpdateUrlDto {
  @ApiProperty({
    description: 'New original URL',
    example: 'https://example.com/new-url',
  })
  @IsUrl()
  originalUrl: string;
}

export class ShortUrlResponseDto {
  @ApiProperty({
    description: 'URL ID',
  })
  id: string;

  @ApiProperty({
    description: 'Original URL',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'Short code',
  })
  shortCode: string;

  @ApiProperty({
    description: 'Complete short URL',
  })
  shortUrl: string;

  @ApiProperty({
    description: 'Number of clicks',
  })
  clicksCount: number;

  @ApiProperty({
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
  })
  updatedAt: Date;
}

export class UrlListResponseDto {
  @ApiProperty({
    description: 'List of URLs',
    type: [ShortUrlResponseDto],
  })
  urls: ShortUrlResponseDto[];

  @ApiProperty({
    description: 'Total number of URLs',
  })
  total: number;
}
