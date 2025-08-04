# URL Shortener API

Uma API REST completa para encurtamento de URLs construída com NestJS, TypeScript e PostgreSQL, seguindo os princípios de Clean Architecture, Domain-Driven Design (DDD) e SOLID.

## 🚀 Funcionalidades

- **Encurtamento de URLs**: Gera códigos curtos de até 6 caracteres
- **Autenticação JWT**: Sistema completo de registro e login
- **URLs Personalizadas**: Suporte a códigos customizados
- **Contagem de Clicks**: Rastreamento de acessos às URLs
- **Soft Delete**: Exclusão lógica com preservação de dados
- **Swagger/OpenAPI**: Documentação automática da API
- **Observabilidade**: Logs estruturados e métricas
- **Testes Unitários**: Cobertura completa com Jest

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** e **Domain-Driven Design**:

```
src/
├── auth/                    # Módulo de autenticação
│   ├── domain/             # Regras de negócio
│   ├── application/        # Casos de uso
│   ├── infrastructure/     # Implementações externas
│   └── presentation/       # Controllers e DTOs
├── users/                  # Módulo de usuários
│   ├── domain/             # Entidades e regras
│   └── infrastructure/     # Repositórios
├── url-shortener/          # Módulo de encurtamento
│   ├── domain/             # Entidades e serviços
│   ├── application/        # Casos de uso
│   ├── infrastructure/     # Repositórios e serviços
│   └── presentation/       # Controllers
└── shared/                 # Componentes compartilhados
    └── infrastructure/     # Filtros e interceptors
```

## 🛠️ Tecnologias

- **Framework**: NestJS 10.x
- **Linguagem**: TypeScript 5.x
- **Banco de Dados**: PostgreSQL 15
- **ORM**: Prisma 6.x
- **Autenticação**: JWT + bcryptjs
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest + Supertest
- **Containerização**: Docker + Docker Compose
- **Observabilidade**: Winston + Prometheus (planejado)

## 📋 Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- Git

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <repository-url>
cd url-shortener
```

### 2. Configure as variáveis de ambiente

```bash
cp config.example.env .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:55432/url_shortener"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="24h"

# Application
PORT=3000
BASE_URL="http://localhost:3000"

# Redis (opcional)
REDIS_URL="redis://localhost:6378"

# Observability
ENABLE_LOGGING=true
ENABLE_METRICS=true
ENABLE_TRACING=true
```

### 3. Inicie os serviços com Docker Compose

```bash
docker-compose up -d
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Execute as migrações do banco

```bash
npx prisma migrate dev
```

### 6. Inicie a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod
```

## 📚 Documentação da API

A documentação Swagger está disponível em:
- **Desenvolvimento**: http://localhost:3000/api
- **Produção**: https://your-domain.com/api

## 🔧 Endpoints

### Autenticação

#### POST `/auth/register`
Registra um novo usuário.

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/auth/login`
Realiza login do usuário.

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### URLs

#### POST `/urls/shorten`
Encurta uma URL (com ou sem autenticação).

```json
{
  "originalUrl": "https://example.com/very-long-url",
  "customShortCode": "custom" // opcional
}
```

#### GET `/urls`
Lista URLs do usuário autenticado.

#### PUT `/urls/:id`
Atualiza uma URL (apenas proprietário).

```json
{
  "originalUrl": "https://new-url.com"
}
```

#### DELETE `/urls/:id`
Remove uma URL (soft delete, apenas proprietário).

### Redirecionamento

#### GET `/:shortCode`
Redireciona para a URL original e incrementa contador.

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes com cobertura

```bash
npm run test:cov
```

### Executar testes em modo watch

```bash
npm run test:watch
```

### Executar testes de integração

```bash
npm run test:e2e
```

## 🐳 Docker

### Construir imagem

```bash
docker build -t url-shortener .
```

### Executar com Docker Compose

```bash
docker-compose up -d
```

## 📊 Monitoramento

### Logs
A aplicação utiliza Winston para logging estruturado com diferentes níveis:
- `error`: Erros da aplicação
- `warn`: Avisos importantes
- `info`: Informações gerais
- `debug`: Informações detalhadas

### Métricas (Planejado)
- Prometheus para coleta de métricas
- Grafana para visualização
- Métricas customizadas de negócio

### Tracing (Planejado)
- Jaeger para distributed tracing
- OpenTelemetry para instrumentação

## 🔒 Segurança

- **Autenticação**: JWT com expiração configurável
- **Senhas**: Hash com bcrypt (salt rounds: 10)
- **Validação**: class-validator para validação de entrada
- **CORS**: Configurado para desenvolvimento
- **Rate Limiting**: Implementação planejada

## 🚀 Deploy

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="super-secret-production-key"
BASE_URL="https://your-domain.com"
```

### Estratégias de Deploy

1. **Docker**: Imagem otimizada para produção
2. **Kubernetes**: Manifests para orquestração
3. **Cloud Providers**: AWS, GCP, Azure
4. **CI/CD**: GitHub Actions, GitLab CI

## 📈 Escalabilidade

### Escalabilidade Vertical
- Otimização de queries
- Índices de banco de dados
- Cache com Redis
- Connection pooling

### Escalabilidade Horizontal (Planejado)
- Load balancer
- Múltiplas instâncias
- Database sharding
- Microserviços

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para alvesabdon431@gmail.com ou abra uma issue no GitHub.

## 🔄 Roadmap

- [ ] Implementação de métricas com Prometheus
- [ ] Distributed tracing com Jaeger
- [ ] Rate limiting
- [ ] Cache com Redis
- [ ] Microserviços
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Monitoramento avançado
- [ ] API Gateway
- [ ] Multi-tenancy

## 📄 Changelog

### v0.1.0 (2024-08-04)
- ✅ Implementação inicial da API
- ✅ Sistema de autenticação JWT
- ✅ Encurtamento de URLs
- ✅ CRUD de URLs para usuários autenticados
- ✅ Contagem de clicks
- ✅ Soft delete
- ✅ Documentação Swagger
- ✅ Testes unitários
- ✅ Docker e Docker Compose
- ✅ Logging estruturado
- ✅ Tratamento de erros global
- ✅ Validação de entrada
- ✅ Clean Architecture e DDD
