# 📊 Observabilidade - URL Shortener API

Este documento explica como configurar e usar as ferramentas de observabilidade implementadas no projeto.

## 🎯 Visão Geral

O projeto implementa múltiplas camadas de observabilidade que podem ser ativadas/desativadas através de variáveis de ambiente:

- **Métricas**: Prometheus + Grafana
- **Tracing**: Jaeger
- **Logs**: Estruturados com Winston

## 🔧 Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `config.example.env` para `.env` e configure as variáveis:

```bash
cp config.example.env .env
```

### 2. Configurações Disponíveis

#### **Prometheus (Métricas)**
```env
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
```

#### **Jaeger (Tracing)**
```env
JAEGER_ENABLED=false
JAEGER_ENDPOINT=http://localhost:16686/api/traces
JAEGER_SERVICE_NAME=url-shortener-api
```

## 📊 Prometheus + Grafana

### Configuração Local

1. **Iniciar containers:**
```bash
docker-compose up -d
```

2. **Acessar Prometheus:**
   - URL: http://localhost:9090
   - Verificar targets em Status > Targets

3. **Acessar Grafana:**
   - URL: http://localhost:3001
   - Login: admin/admin
   - Adicionar Prometheus como data source: http://prometheus:9090

### Queries Úteis para Grafana

#### **URLs Criadas**
```
url_shortener_urls_created_total
```

#### **URLs Redirecionadas**
```
url_shortener_urls_redirected_total
```

#### **Tentativas de Login**
```
url_shortener_login_attempts_total
```

#### **Registros de Usuário**
```
url_shortener_registrations_total
```

#### **Erros**
```
url_shortener_errors_total
```

#### **Tempo de Resposta Médio**
```
rate(url_shortener_response_time_seconds_sum[5m]) / rate(url_shortener_response_time_seconds_count[5m])
```

#### **Taxa de Requisições**
```
rate(url_shortener_response_time_seconds_count[1m])
```

#### **Taxa de Erros**
```
rate(url_shortener_errors_total[1m])
```

## 🔍 Jaeger (Tracing)

### Ativar Tracing

1. **Habilitar no .env:**
```env
JAEGER_ENABLED=true
```

2. **Instalar dependências (opcional):**
```bash
npm install @opentelemetry/sdk-trace-node @opentelemetry/exporter-jaeger @opentelemetry/instrumentation @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
```

3. **Acessar Jaeger:**
   - URL: http://localhost:16686
   - Selecionar serviço: `url-shortener-api`

### Spans Disponíveis

- **HTTP Requests**: Automático via interceptor
- **Use Cases**: Manual via JaegerService
- **Database Operations**: Via Prisma instrumentation

## 📝 Logs

### Configuração

```env
LOG_LEVEL=info
```

### Níveis Disponíveis

- `error`: Apenas erros
- `warn`: Avisos e erros
- `info`: Informações gerais (padrão)
- `debug`: Informações detalhadas
- `trace`: Tudo

### Estrutura dos Logs

```json
{
  "timestamp": "2025-08-04T21:54:30.290Z",
  "level": "info",
  "message": "Request processed",
  "method": "POST",
  "url": "/auth/login",
  "statusCode": 200,
  "duration": 45,
  "user": "user@example.com",
  "traceId": "abc123",
  "spanId": "def456"
}
```



## 🧪 Testando Observabilidade

### 1. Gerar Tráfego

```bash
# Registrar usuário
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Criar URL
curl -X POST http://localhost:3000/urls/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com"}'

# Redirecionar URL
curl -L http://localhost:3000/abc123
```

### 2. Verificar Métricas

```bash
curl http://localhost:3000/metrics
```

### 3. Verificar Logs

Os logs aparecem no console da aplicação com formato estruturado.

## 📈 Dashboards Recomendados

### Grafana Dashboard

1. **Overview Dashboard**
   - Requisições por minuto
   - Tempo de resposta médio
   - Taxa de erro
   - URLs criadas/redirecionadas

2. **APM Dashboard**
   - Traces por endpoint
   - Tempo de resposta por operação
   - Erros por tipo

3. **Business Dashboard**
   - URLs mais populares
   - Usuários mais ativos
   - Crescimento de usuários

## 🔧 Troubleshooting

### Prometheus não coleta métricas

1. Verificar se o endpoint `/metrics` responde
2. Verificar configuração do `prometheus.yml`
3. Verificar se o container está rodando

### Jaeger não mostra traces

1. Verificar se `JAEGER_ENABLED=true`
2. Verificar se dependências estão instaladas
3. Verificar logs da aplicação

### Grafana não conecta ao Prometheus

1. Verificar URL do data source: `http://prometheus:9090`
2. Verificar se containers estão na mesma rede
3. Testar conectividade entre containers

## 📚 Recursos Adicionais

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/) 