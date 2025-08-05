import { Module } from '@nestjs/common';
import { JaegerService } from './jaeger.service';

@Module({
  providers: [JaegerService],
  exports: [JaegerService],
})
export class TracingModule {} 