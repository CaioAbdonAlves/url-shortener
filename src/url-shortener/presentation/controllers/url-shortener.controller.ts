import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ShortenUrlUseCase } from '../../application/use-cases/shorten-url.use-case';
import { GetUrlsByUserUseCase } from '../../application/use-cases/get-urls-by-user.use-case';
import { RedirectUrlUseCase } from '../../application/use-cases/redirect-url.use-case';
import { UpdateUrlUseCase } from '../../application/use-cases/update-url.use-case';
import { DeleteUrlUseCase } from '../../application/use-cases/delete-url.use-case';
import {
  ShortenUrlDto,
  UpdateUrlDto,
  ShortUrlResponseDto,
  UrlListResponseDto,
} from '../../application/dtos/url-shortener.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RequestWithUser } from '../../../auth/presentation/interfaces/request-with-user.interface';

@ApiTags('URL Shortener')
@Controller('urls')
export class UrlShortenerController {
  constructor(
    private readonly shortenUrlUseCase: ShortenUrlUseCase,
    private readonly getUrlsByUserUseCase: GetUrlsByUserUseCase,
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
    private readonly updateUrlUseCase: UpdateUrlUseCase,
    private readonly deleteUrlUseCase: DeleteUrlUseCase,
  ) {}

  @Post('shorten')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 URLs por minuto
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiResponse({
    status: 201,
    description: 'URL shortened successfully',
    type: ShortUrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL or short code already exists',
  })
  async shortenUrl(
    @Body() shortenUrlDto: ShortenUrlDto,
    @Req() req: RequestWithUser,
  ): Promise<ShortUrlResponseDto> {
    // Extract user ID from token if present
    const authHeader = req.headers.authorization;
    let userId: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Decode JWT payload
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );
        userId = payload.sub;
      } catch (error) {
        // Token is invalid, but we don't fail the request
        userId = undefined;
      }
    }

    return this.shortenUrlUseCase.execute(shortenUrlDto, userId);
  }

  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to original URL',
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
  })
  async redirectToUrl(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ): Promise<void> {
    const originalUrl = await this.redirectUrlUseCase.execute(shortCode);
    res.redirect(originalUrl);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user URLs' })
  @ApiResponse({
    status: 200,
    description: 'User URLs retrieved successfully',
    type: UrlListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserUrls(@Req() req: RequestWithUser): Promise<UrlListResponseDto> {
    return this.getUrlsByUserUseCase.execute(req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update URL' })
  @ApiResponse({
    status: 200,
    description: 'URL updated successfully',
    type: ShortUrlResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
  })
  async updateUrl(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Req() req: RequestWithUser,
  ): Promise<ShortUrlResponseDto> {
    return this.updateUrlUseCase.execute(id, updateUrlDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete URL' })
  @ApiResponse({
    status: 204,
    description: 'URL deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
  })
  async deleteUrl(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    await this.deleteUrlUseCase.execute(id, req.user.id);
  }
}
