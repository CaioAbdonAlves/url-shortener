# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Métricas com Prometheus
- Distributed tracing com Jaeger
- Rate limiting
- Cache com Redis

### Changed
- Melhorias na performance

### Fixed
- Correções de bugs

## [0.1.0] - 2024-08-04

### Added
- ✅ **Implementação inicial da API**
  - Estrutura base com NestJS e TypeScript
  - Configuração do projeto com Clean Architecture

- ✅ **Sistema de autenticação JWT**
  - Endpoint de registro (`POST /auth/register`)
  - Endpoint de login (`POST /auth/login`)
  - JWT com expiração configurável
  - Hash de senhas com bcryptjs
  - Guard para proteção de rotas

- ✅ **Encurtamento de URLs**
  - Endpoint único (`POST /urls/shorten`)
  - Geração de códigos curtos (máximo 6 caracteres)
  - Suporte a códigos customizados
  - Validação de URLs
  - Funciona com e sem autenticação

- ✅ **CRUD de URLs para usuários autenticados**
  - Listagem de URLs (`GET /urls`)
  - Atualização de URLs (`PUT /urls/:id`)
  - Exclusão de URLs (`DELETE /urls/:id`)
  - Autorização baseada em propriedade

- ✅ **Contagem de clicks**
  - Rastreamento automático de acessos
  - Incremento de contador em redirecionamentos
  - Exibição na listagem de URLs

- ✅ **Soft delete**
  - Exclusão lógica com preservação de dados
  - Campo `deleted_at` para controle
  - URLs deletadas não aparecem em consultas

- ✅ **Documentação Swagger**
  - Documentação automática da API
  - Exemplos de uso
  - Autenticação integrada no Swagger

- ✅ **Testes unitários**
  - Cobertura completa com Jest
  - Testes para entidades de domínio
  - Testes para casos de uso
  - Testes para serviços de infraestrutura
  - Testes para controllers
  - Repositórios em memória para testes

- ✅ **Docker e Docker Compose**
  - Containerização da aplicação
  - PostgreSQL em container
  - Redis em container (preparado)
  - Prometheus e Grafana (preparado)
  - Jaeger (preparado)

- ✅ **Logging estruturado**
  - Winston para logging
  - Logs de requests e responses
  - Logs de erros estruturados
  - Interceptor global de logging

- ✅ **Tratamento de erros global**
  - GlobalExceptionFilter
  - Respostas de erro padronizadas
  - Mapeamento de exceções para HTTP status codes
  - Logs de erros detalhados

- ✅ **Validação de entrada**
  - class-validator para validação
  - class-transformer para transformação
  - DTOs com validações
  - Validação automática com ValidationPipe

- ✅ **Clean Architecture e DDD**
  - Separação clara de responsabilidades
  - Domain entities com regras de negócio
  - Application use cases
  - Infrastructure implementations
  - Presentation controllers
  - Dependency injection com tokens

### Technical Details

#### Arquitetura
- **Clean Architecture**: Separação em camadas (Domain, Application, Infrastructure, Presentation)
- **Domain-Driven Design**: Entidades ricas com regras de negócio
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Design Patterns**: Repository, Factory, Dependency Injection, Observer

#### Tecnologias
- **Backend**: NestJS 10.x, TypeScript 5.x
- **Database**: PostgreSQL 15, Prisma 6.x
- **Authentication**: JWT, bcryptjs
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose
- **Observability**: Winston (logs), Prometheus (métricas - planejado), Jaeger (tracing - planejado)

#### Estrutura do Projeto
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

#### Endpoints Implementados
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login de usuário
- `POST /urls/shorten` - Encurtamento de URL
- `GET /urls` - Listagem de URLs do usuário
- `PUT /urls/:id` - Atualização de URL
- `DELETE /urls/:id` - Exclusão de URL
- `GET /:shortCode` - Redirecionamento

#### Funcionalidades de Negócio
- Encurtamento de URLs com códigos de até 6 caracteres
- Suporte a códigos customizados
- Contagem automática de clicks
- Soft delete para preservação de dados
- Autenticação opcional para encurtamento
- Autorização baseada em propriedade para CRUD

#### Qualidade de Código
- Testes unitários com cobertura
- Validação de entrada robusta
- Tratamento de erros centralizado
- Logging estruturado
- Documentação automática
- Código tipado com TypeScript
- Padrões de projeto consistentes

---

## Tipos de Mudanças

- **Added** para novas funcionalidades
- **Changed** para mudanças em funcionalidades existentes
- **Deprecated** para funcionalidades que serão removidas
- **Removed** para funcionalidades removidas
- **Fixed** para correções de bugs
- **Security** para correções de vulnerabilidades 