# Gereve (GEstão de REservas e eVEntos)

Sistema de gestão de reservas e eventos com API RESTful.

Projeto avaliativo da disciplina SPOPWEB (Programação Dinâmica para Web), para RESAB, IFSP Campus São Paulo.

## Stack

Node.js 22 LTS, TypeScript, Express 5, Prisma 6, PostgreSQL 16, JWT (jsonwebtoken), bcrypt, Zod, multer e swagger-ui-express.

## Arquitetura

O sistema é dividido em camadas: `routes` -> `controllers` -> `services` -> `repositories`. Apenas os `repositories` acessam o Prisma. Os middlewares são isolados no diretório `src/middlewares/`: `authenticate`, `authorize`, `errorHandler` e `notFound`.

A validação de dados é feita com Zod diretamente nos controllers, aplicando regras sobre `body`, `params` e `query`.
A API é stateless e utiliza autenticação por meio de token JWT (Bearer).

## Entidades e Regras de Negócio

*   **User:** id, name, email (único), passwordHash, role, createdAt, updatedAt.
*   **Event:** id, title, description, location, startsAt, endsAt, capacity, status, organizerId.
*   **Reservation:** id, userId, eventId, status, createdAt.
*   **Attachment:** id, originalName, storedName, mimeType, size, eventId, uploadedById, createdAt.

**Papéis de Usuário:**
O sistema possui os papéis ADMIN, ORGANIZER e CUSTOMER. O padrão ao cadastrar é CUSTOMER.

**Regras:**
*   A reserva não pode ultrapassar a capacidade limite do evento.
*   Um usuário não pode reservar o mesmo evento duas vezes.
*   Apenas o organizador dono do evento ou um ADMIN pode editar, excluir ou anexar arquivos ao evento.
*   Apenas o dono da reserva ou um ADMIN pode cancelá-la.

## Pré-requisitos

*   Node.js 22 LTS e npm.
*   Docker e Docker Compose (para subir o PostgreSQL).
*   Alternativa: possuir um PostgreSQL 16 já instalado na máquina, bastando ajustar a variável `DATABASE_URL`.

## Variáveis de Ambiente

As configurações são feitas no arquivo `.env`, que deve ser criado a partir de `.env.example` (o `.env` não é versionado). Todas as variáveis são validadas com Zod na subida da API; caso alguma esteja inválida, o processo é encerrado listando o problema.

| Variável | Descrição | Exemplo / Padrão |
|---|---|---|
| NODE_ENV | Ambiente de execução (development, test ou production) | development |
| PORT | Porta de execução da API | 3333 |
| DATABASE_URL | URL de conexão PostgreSQL | postgresql://gereve:gereve@localhost:5432/gereve?schema=public |
| CORS_ORIGINS | Origens permitidas no CORS, separadas por vírgula | http://localhost:3333 |
| JWT_SECRET | Segredo de assinatura do token (mínimo de 32 caracteres) | Obrigatório |
| JWT_EXPIRES_IN_SECONDS | Validade do token em segundos | 86400 |

## Instalação e Execução

Na raiz do projeto (sobe o container gereve-postgres, PostgreSQL 16, na porta 5432, com usuário, senha e banco gereve):
```bash
docker compose up -d
```

Na raiz do projeto (instala as dependências):
```bash
npm install
```

Na raiz do projeto (copia as variáveis de ambiente, devendo-se editar o JWT_SECRET em seguida):
```bash
cp .env.example .env
```

Na raiz do projeto (aplica as migrations no banco em desenvolvimento):
```bash
npm run db:migrate
```

Na raiz do projeto (popula o banco com os dados iniciais):
```bash
npm run db:seed
```

Na raiz do projeto (inicia a API em http://localhost:3333):
```bash
npm run dev
```

## Scripts Disponíveis

Todos os comandos abaixo devem ser executados na raiz do projeto, utilizando o prefixo `npm run`:
*   `dev`: Inicia o servidor em modo de desenvolvimento (`tsx watch src/server.ts`).
*   `build`: Compila o código TypeScript e copia o arquivo `openapi.yaml` para o diretório de saída.
*   `start`: Executa o código compilado (`node dist/server.js`).
*   `db:migrate`: Cria e aplica migrations no ambiente de desenvolvimento (`prisma migrate dev`).
*   `db:deploy`: Aplica migrations em produção (`prisma migrate deploy`).
*   `db:seed`: Executa o seed do banco de dados (`prisma db seed`).
*   `format`: Aplica a formatação de código com o Prettier.
*   `format:check`: Verifica se o código está formatado corretamente.

## Dados do Seed

O seed cria uma carga inicial de dados e é idempotente (utiliza upsert, podendo rodar várias vezes). Todos os usuários criados utilizam a senha `senha-forte-123`.

*   `admin@gereve.dev` (papel: ADMIN)
*   `organizador@gereve.dev` e `organizadora@gereve.dev` (papel: ORGANIZER)
*   `cliente@gereve.dev` (papel: CUSTOMER)

Também são criados 4 eventos. Um deles possui capacidade definida para 2 participantes, sendo utilizado para demonstrar o erro de capacidade esgotada.

## Documentação Interativa

A API possui documentação baseada em OpenAPI 3.0 disponível via Swagger UI no endereço `http://localhost:3333/docs`. O arquivo base está em `src/docs/openapi.yaml`. Para testar as rotas protegidas na interface do Swagger, utilize o botão "Authorize" e cole o token JWT obtido no endpoint de login.

## Endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | /auth/register | Público | Efetua o cadastro de usuário (devolve 201) |
| POST | /auth/login | Público | Autenticação, devolve token e usuário logado |
| GET | /auth/me | Autenticado | Retorna os dados do usuário vinculado ao token |
| GET | /users | ADMIN | Listagem paginada de usuários do sistema |
| PATCH | /users/:id/role | ADMIN | Altera o papel (role) de um usuário específico |
| GET | /events | Público | Listagem de eventos com suporte a paginação, filtros e ordenação |
| GET | /events/:id | Público | Retorna os detalhes de um evento específico |
| POST | /events | ORGANIZER ou ADMIN | Cria um evento (status inicial DRAFT) |
| PATCH | /events/:id | Dono do evento ou ADMIN | Atualiza os dados de um evento existente |
| DELETE | /events/:id | Dono do evento ou ADMIN | Remove um evento do sistema (devolve 204) |
| POST | /events/:id/reservations | CUSTOMER | Cria uma reserva para o evento informado |
| GET | /events/:id/reservations | Dono do evento ou ADMIN | Lista as reservas realizadas para o evento (paginado) |
| GET | /reservations/me | Autenticado | Lista as reservas efetuadas pelo usuário do token (paginado) |
| PATCH | /reservations/:id/cancel | Dono da reserva ou ADMIN | Realiza o cancelamento de uma reserva |
| POST | /events/:id/attachments | Dono do evento ou ADMIN | Realiza o upload de arquivo via multipart/form-data |
| GET | /attachments/:id/download | Autenticado | Permite o download de um arquivo anexado |
| GET | /health | Público | Verifica a disponibilidade e integridade da API |
| GET | /docs | Público | Interface interativa da documentação Swagger UI |

## Paginação, Filtros e Formato das Respostas

A paginação é controlada via query string (`?page=1&limit=10`), com limite máximo de 100 itens por página.
Para eventos, os filtros disponíveis são `title`, `status`, `from`, `to` e `organizerId`. A ordenação padrão é manipulada via `sort=startsAt&order=asc`.

**Formato padrão de listagens:**
```json
{
  "data": [],
  "infos": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

**Formato padrão de erros:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": []
  }
}
```

**Códigos HTTP e de sistema utilizados:**
*   **400**: `VALIDATION_ERROR`, `INVALID_JSON`, `FILE_REQUIRED`, `INVALID_FILE_TYPE`.
*   **401**: `UNAUTHORIZED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `INVALID_CREDENTIALS`.
*   **403**: `FORBIDDEN`.
*   **404**: `RESOURCE_NOT_FOUND` e rotas inexistentes.
*   **409**: `RESOURCE_ALREADY_EXISTS`.
*   **413**: `FILE_TOO_LARGE`.
*   **500**: `INTERNAL_SERVER_ERROR`.

## Upload de Arquivos

O upload deve ser enviado com o campo de formulário `file`. O tamanho máximo permitido é de 5242880 bytes (5 MB). Os tipos MIME aceitos são `image/jpeg`, `image/png`, `image/webp` e `application/pdf`.

Os arquivos são gravados fisicamente no diretório `uploads/`. Este diretório não é versionado pelo Git (contém apenas o arquivo `.gitkeep`). O banco de dados armazena os metadados do upload e o endpoint de download devolve o arquivo respeitando seu nome original.

## Coleção de Requisições

O projeto inclui o arquivo `requests/api.http`, desenvolvido para ser utilizado com a extensão REST Client do VS Code. O arquivo concentra todas as requisições na ordem de demonstração do sistema. Como ele encadeia as variáveis com as respostas (extraindo e repassando o token), basta realizar as execuções de cima para baixo.
