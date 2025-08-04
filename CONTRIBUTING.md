# Guia de Contribuição

Projeto Teddy Open Finance, URL-Shortener.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

## 🤝 Como Contribuir

### Tipos de Contribuição

- 🐛 **Bug Fixes**: Correção de bugs
- ✨ **Features**: Novas funcionalidades
- 📚 **Documentação**: Melhorias na documentação
- 🧪 **Testes**: Adição ou melhoria de testes
- 🔧 **Refatoração**: Melhorias no código
- ⚡ **Performance**: Otimizações de performance

### Processo de Contribuição

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie** uma branch para sua feature
4. **Desenvolva** sua feature
5. **Teste** suas mudanças
6. **Commit** suas mudanças
7. **Push** para sua branch
8. **Abra** um Pull Request

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Git

### Setup Local

```bash
# Clone o repositório
git clone https://github.com/CaioAbdonAlves/url-shortener
cd url-shortener

# Instale dependências
npm install

# Configure variáveis de ambiente
cp config.example.env .env

# Inicie serviços com Docker
docker-compose up -d

# Execute migrações
npx prisma migrate dev

# Inicie em modo desenvolvimento
npm run start:dev
```

## 📝 Padrões de Código

### Estrutura de Pastas

Siga a estrutura de Clean Architecture:

```
src/
├── [module]/
│   ├── domain/           # Entidades, interfaces, regras de negócio
│   ├── application/      # Casos de uso, DTOs
│   ├── infrastructure/   # Implementações externas
│   └── presentation/     # Controllers, guards, interceptors
```

### Convenções de Nomenclatura

- **Arquivos**: kebab-case (`user-repository.ts`)
- **Classes**: PascalCase (`UserRepository`)
- **Interfaces**: PascalCase com prefixo `I` (`IUserRepository`)
- **Variáveis/Funções**: camelCase (`getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (`JWT_SECRET`)

### TypeScript

- Use tipagem estrita
- Evite `any` - use `unknown` quando necessário
- Prefira interfaces sobre types para objetos
- Use enums para valores constantes

### Exemplo de Código

```typescript
// ✅ Bom
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // implementação
  }
}

// ❌ Evite
export class userRepository {
  async findById(id: any): Promise<any> {
    // implementação
  }
}
```

## 🧪 Testes

### Estrutura de Testes

```
src/
├── [module]/
│   ├── domain/
│   │   └── entities/
│   │       └── entity.spec.ts
│   ├── application/
│   │   └── use-cases/
│   │       └── use-case.spec.ts
│   └── infrastructure/
│       └── services/
│           └── service.spec.ts
```

### Padrões de Teste

```typescript
describe('UserEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User('id', 'email', 'password');
  });

  describe('updateEmail', () => {
    it('should update email successfully', () => {
      // Arrange
      const newEmail = 'new@example.com';

      // Act
      user.updateEmail(newEmail);

      // Assert
      expect(user.getEmail).toBe(newEmail);
    });
  });
});
```

### Executar Testes

```bash
# Todos os testes
npm test

# Com cobertura
npm run test:cov

# Modo watch
npm run test:watch

# Testes específicos
npm test -- --testPathPattern="user"
```

### Cobertura Mínima

- **Domain**: 100%
- **Application**: 90%
- **Infrastructure**: 80%
- **Presentation**: 70%

## 📝 Commits

### Convenção de Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula, etc.
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de build, dependências, etc.

### Exemplos

```bash
# ✅ Bom
git commit -m "feat: add user registration endpoint"
git commit -m "fix: resolve JWT token validation issue"
git commit -m "test: add unit tests for User entity"
git commit -m "docs: update API documentation"

# ❌ Evite
git commit -m "added stuff"
git commit -m "fix bug"
git commit -m "wip"
```

## 🔄 Pull Requests

### Checklist do PR

- [ ] Código segue os padrões estabelecidos
- [ ] Testes passam e cobertura é adequada
- [ ] Documentação foi atualizada
- [ ] Commits seguem a convenção
- [ ] PR tem descrição clara
- [ ] Não há conflitos

### Template do PR

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Clone a branch
2. Execute `npm install`
3. Execute `npm test`
4. Teste manualmente...

## Checklist
- [ ] Código segue os padrões
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Commits seguem convenção

## Screenshots (se aplicável)
```

## 🐛 Reportando Bugs

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
Descrição do que deveria acontecer.

**Comportamento Atual**
Descrição do que está acontecendo.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [ex: Windows 10]
- Node.js: [ex: 18.0.0]
- NPM: [ex: 9.0.0]

**Contexto Adicional**
Qualquer outra informação relevante.
```

## 💡 Sugerindo Features

### Template de Feature Request

```markdown
**Problema**
Descrição clara do problema que a feature resolveria.

**Solução Proposta**
Descrição da solução desejada.

**Alternativas Consideradas**
Outras soluções que foram consideradas.

**Contexto Adicional**
Qualquer contexto adicional, screenshots, etc.
```

## 📚 Recursos Úteis

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

## 🤝 Comunidade

- **Issues**: Para bugs e feature requests
- **Discussions**: Para discussões gerais
- **Wiki**: Para documentação adicional

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

Obrigado por contribuir! 🎉 