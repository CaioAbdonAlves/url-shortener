import { Injectable, OnModuleInit } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class PrometheusService implements OnModuleInit {
  // Contadores para URLs criadas e redirecionadas
  private urlCreatedCounter: Counter;
  private urlRedirectedCounter: Counter;
  private urlDeletedCounter: Counter;
  private urlUpdatedCounter: Counter;

  // Histograma para tempo de resposta
  private responseTimeHistogram: Histogram;

  // Gauge para URLs ativas
  private activeUrlsGauge: Gauge;

  // Contadores para autenticação
  private loginAttemptsCounter: Counter;
  private registrationCounter: Counter;

  // Contadores para erros
  private errorCounter: Counter;

  onModuleInit() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // Contadores para URLs
    this.urlCreatedCounter = new Counter({
      name: 'url_shortener_urls_created_total',
      help: 'Total number of URLs created',
      labelNames: ['user_id'],
    });

    this.urlRedirectedCounter = new Counter({
      name: 'url_shortener_urls_redirected_total',
      help: 'Total number of URLs redirected',
      labelNames: ['short_code'],
    });

    this.urlDeletedCounter = new Counter({
      name: 'url_shortener_urls_deleted_total',
      help: 'Total number of URLs deleted',
      labelNames: ['user_id'],
    });

    this.urlUpdatedCounter = new Counter({
      name: 'url_shortener_urls_updated_total',
      help: 'Total number of URLs updated',
      labelNames: ['user_id'],
    });

    // Histograma para tempo de resposta
    this.responseTimeHistogram = new Histogram({
      name: 'url_shortener_response_time_seconds',
      help: 'Response time in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    // Gauge para URLs ativas
    this.activeUrlsGauge = new Gauge({
      name: 'url_shortener_active_urls',
      help: 'Number of active URLs',
      labelNames: ['user_id'],
    });

    // Contadores para autenticação
    this.loginAttemptsCounter = new Counter({
      name: 'url_shortener_login_attempts_total',
      help: 'Total number of login attempts',
      labelNames: ['status'], // success, failure
    });

    this.registrationCounter = new Counter({
      name: 'url_shortener_registrations_total',
      help: 'Total number of user registrations',
      labelNames: ['status'], // success, failure
    });

    // Contador para erros
    this.errorCounter = new Counter({
      name: 'url_shortener_errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'endpoint'],
    });

    // Registrar todas as métricas
    register.registerMetric(this.urlCreatedCounter);
    register.registerMetric(this.urlRedirectedCounter);
    register.registerMetric(this.urlDeletedCounter);
    register.registerMetric(this.urlUpdatedCounter);
    register.registerMetric(this.responseTimeHistogram);
    register.registerMetric(this.activeUrlsGauge);
    register.registerMetric(this.loginAttemptsCounter);
    register.registerMetric(this.registrationCounter);
    register.registerMetric(this.errorCounter);
  }

  // Métodos para incrementar contadores
  incrementUrlCreated(userId?: string) {
    this.urlCreatedCounter.inc({ user_id: userId || 'anonymous' });
  }

  incrementUrlRedirected(shortCode: string) {
    this.urlRedirectedCounter.inc({ short_code: shortCode });
  }

  incrementUrlDeleted(userId: string) {
    this.urlDeletedCounter.inc({ user_id: userId });
  }

  incrementUrlUpdated(userId: string) {
    this.urlUpdatedCounter.inc({ user_id: userId });
  }

  // Método para registrar tempo de resposta
  recordResponseTime(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.responseTimeHistogram.observe(
      { method, route, status_code: statusCode.toString() },
      duration / 1000, // Converter para segundos
    );
  }

  // Método para atualizar gauge de URLs ativas
  setActiveUrls(userId: string, count: number) {
    this.activeUrlsGauge.set({ user_id: userId }, count);
  }

  // Métodos para autenticação
  incrementLoginAttempts(status: 'success' | 'failure') {
    this.loginAttemptsCounter.inc({ status });
  }

  incrementRegistration(status: 'success' | 'failure') {
    this.registrationCounter.inc({ status });
  }

  // Método para registrar erros
  incrementError(type: string, endpoint: string) {
    this.errorCounter.inc({ type, endpoint });
  }

  // Método para obter métricas em formato Prometheus
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
