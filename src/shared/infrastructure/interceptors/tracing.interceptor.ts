import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JaegerService } from '../tracing/jaeger.service';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  constructor(private readonly jaegerService: JaegerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const user = (request as any).user;

    // Criar span para a requisição
    const span = this.jaegerService.startSpan(`${method} ${url}`, {
      'http.method': method,
      'http.url': url,
      'http.user_agent': request.get('User-Agent') || '',
      'user.id': user?.id || 'anonymous',
      'user.email': user?.email || 'anonymous',
    });

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;

          this.jaegerService.setSpanAttributes(span, {
            'http.status_code': 200,
            'http.response_time_ms': duration,
            'response.size': data ? JSON.stringify(data).length : 0,
          });

          this.jaegerService.setSpanStatus(span, 1); // OK
          this.jaegerService.endSpan(span);
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.jaegerService.setSpanAttributes(span, {
            'http.status_code': error.status || 500,
            'http.response_time_ms': duration,
            'error.type': error.constructor.name,
            'error.message': error.message,
          });

          this.jaegerService.recordException(span, error);
          this.jaegerService.endSpan(span);
        },
      }),
    );
  }
}
