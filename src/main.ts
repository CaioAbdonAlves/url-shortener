import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/infrastructure/filters/global-exception.filter';
import { LoggingInterceptor } from './shared/infrastructure/interceptors/logging.interceptor';
import { MetricsInterceptor } from './shared/infrastructure/interceptors/metrics.interceptor';
import { TracingInterceptor } from './shared/infrastructure/interceptors/tracing.interceptor';
import { PrometheusService } from './shared/infrastructure/metrics/prometheus.service';
import { JaegerService } from './shared/infrastructure/tracing/jaeger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obter instâncias dos serviços
  const prometheusService = app.get(PrometheusService);
  const jaegerService = app.get(JaegerService);

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(prometheusService));

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new MetricsInterceptor(prometheusService));

  // Aplicar tracing interceptor apenas se Jaeger estiver habilitado
  if (process.env.JAEGER_ENABLED === 'true') {
    app.useGlobalInterceptors(new TracingInterceptor(jaegerService));
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API for shortening URLs with user authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
  console.log(`Metrics endpoint: http://localhost:${port}/metrics`);
}

bootstrap();
