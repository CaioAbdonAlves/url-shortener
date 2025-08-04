import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RedirectUrlUseCase } from '../../application/use-cases/redirect-url.use-case';

@ApiTags('Redirect')
@Controller()
export class RedirectController {
  constructor(private readonly redirectUrlUseCase: RedirectUrlUseCase) {}

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
}
