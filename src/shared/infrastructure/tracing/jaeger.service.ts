import { Injectable, OnModuleInit } from '@nestjs/common';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class JaegerService implements OnModuleInit {
  private tracer: any;

  onModuleInit() {
    // Inicializar tracer se Jaeger estiver habilitado
    if (process.env.JAEGER_ENABLED === 'true') {
      this.initializeTracer();
    }
  }

  private initializeTracer() {
    try {
      // Importação dinâmica para evitar dependências desnecessárias
      const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
      const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
      const { registerInstrumentations } = require('@opentelemetry/instrumentation');
      const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
      const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
      const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');

      const provider = new NodeTracerProvider();
      
      const exporter = new JaegerExporter({
        endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
        serviceName: process.env.JAEGER_SERVICE_NAME || 'url-shortener-api',
      });

      // Usar a API correta para OpenTelemetry 2.x
      const spanProcessor = new SimpleSpanProcessor(exporter);
      provider.addSpanProcessor(spanProcessor);
      provider.register();

      registerInstrumentations({
        instrumentations: [
          new HttpInstrumentation(),
          new ExpressInstrumentation(),
        ],
      });

      this.tracer = trace.getTracer('url-shortener');
      console.log('Jaeger tracing initialized successfully');
    } catch (error) {
      console.warn('Jaeger tracing not available:', error.message);
      console.error('Full error:', error);
    }
  }

  startSpan(name: string, attributes?: Record<string, any>) {
    if (!this.tracer || process.env.JAEGER_ENABLED !== 'true') {
      return null;
    }

    return this.tracer.startSpan(name, {
      attributes,
    });
  }

  setSpanAttributes(span: any, attributes: Record<string, any>) {
    if (span) {
      span.setAttributes(attributes);
    }
  }

  setSpanStatus(span: any, status: SpanStatusCode, message?: string) {
    if (span) {
      span.setStatus({ code: status, message });
    }
  }

  endSpan(span: any) {
    if (span) {
      span.end();
    }
  }

  recordException(span: any, error: Error) {
    if (span) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    }
  }

  getTraceId(): string | null {
    if (process.env.JAEGER_ENABLED !== 'true') {
      return null;
    }

    const currentSpan = trace.getActiveSpan();
    return currentSpan?.spanContext().traceId || null;
  }

  getSpanId(): string | null {
    if (process.env.JAEGER_ENABLED !== 'true') {
      return null;
    }

    const currentSpan = trace.getActiveSpan();
    return currentSpan?.spanContext().spanId || null;
  }
} 