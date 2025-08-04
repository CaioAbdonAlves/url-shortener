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
  ValidationPipe,
  UsePipes,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ShortenUrlUseCase } from '../../application/use-cases/shorten-url.use-case';
import { GetUrlsByUserUseCase } from '../../application/use-cases/get-urls-by-user.use-case';
import { RedirectUrlUseCase } from '../../application/use-cases/redirect-url.use-case';
import { ShortenUrlDto, UpdateUrlDto, ShortUrlResponseDto, UrlListResponseDto } from '../../application/dtos/url-shortener.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { RequestWithUser } from '../../../auth/presentation/interfaces/request-with-user.interface';

@ApiTags('URL Shortener')
@Controller('urls')
export class UrlShortenerController {
  constructor(
    private readonly shortenUrlUseCase: ShortenUrlUseCase,
    private readonly getUrlsByUserUseCase: GetUrlsByUserUseCase,
    private readonly redirectUrlUseCase: RedirectUrlUseCase,
  ) {}

  @Post('shorten')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
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
    const userId = req.user?.id;
    return this.shortenUrlUseCase.execute(shortenUrlDto, userId);
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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
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
    // TODO: Implement update URL use case
    throw new Error('Not implemented yet');
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
    // TODO: Implement delete URL use case
    throw new Error('Not implemented yet');
  }
} 