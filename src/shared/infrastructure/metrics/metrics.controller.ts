import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrometheusService } from './prometheus.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    try {
      const metrics = await this.prometheusService.getMetrics();
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    } catch (error) {
      console.error('Error getting metrics:', error);
      res.status(500).send('Error getting metrics');
    }
  }

  @Get('test')
  async test(@Res() res: Response) {
    res.send('Metrics controller is working!');
  }
} 