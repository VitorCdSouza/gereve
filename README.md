# Gereve (GEstão de REservas e eVEntos)

API REST para gestão de reservas e eventos. Projeto da disciplina SPOPWEB (Programação Dinâmica para Web), RESAB, IFSP Campus São Paulo.

Feito com Node.js 22, TypeScript, Express 5, Prisma 6, PostgreSQL 16, JWT, bcrypt, Zod, multer e Swagger.

## Estrutura

`routes` -> `controllers` -> `services` -> `repositories`. Só os repositories falam com o Prisma. Validação com Zod nos controllers. Autenticação por JWT (Bearer).

## Entidades e regras

- **User**, **Event**, **Reservation** e **Attachment** (ver `prisma/schema.prisma`).
- Papéis: ADMIN, ORGANIZER e CUSTOMER (padrão no cadastro).
- A reserva não pode passar da capacidade do evento.
- O mesmo usuário não reserva o mesmo evento duas vezes.
- Só o organizador dono do evento ou um ADMIN edita, exclui ou anexa arquivos.
- Só o dono da reserva ou um ADMIN cancela a reserva.

## Como rodar

Precisa de Node.js 22 e Docker (ou um PostgreSQL 16 local, ajustando a `DATABASE_URL`).

```bash
docker compose up -d     # sobe o PostgreSQL na porta 5432
npm install
cp .env.example .env     # depois troque o JWT_SECRET
npm run db:migrate
npm run db:seed
npm run dev              # http://localhost:3333
```

## Variáveis de ambiente (`.env`)

| Variável | Exemplo |
|---|---|
| NODE_ENV | development |
| PORT | 3333 |
| DATABASE_URL | postgresql://gereve:gereve@localhost:5432/gereve?schema=public |
| CORS_ORIGINS | http://localhost:3333 (separadas por vírgula) |
| JWT_SECRET | obrigatório, mínimo 32 caracteres |
| JWT_EXPIRES_IN_SECONDS | 86400 |

As variáveis são validadas com Zod quando a API sobe. Se alguma estiver errada, ela não inicia.

## Usuários do seed

Todos com a senha `senha-forte-123`:

- `admin@gereve.dev` (ADMIN)
- `organizador@gereve.dev` e `organizadora@gereve.dev` (ORGANIZER)
- `cliente@gereve.dev` (CUSTOMER)

O seed também cria 4 eventos. Um deles tem capacidade 2, para testar o erro de lotação.

## Rotas

| Método | Rota | Acesso |
|---|---|---|
| POST | /auth/register | Público |
| POST | /auth/login | Público |
| GET | /auth/me | Autenticado |
| GET | /users | ADMIN |
| PATCH | /users/:id/role | ADMIN |
| GET | /events | Público |
| GET | /events/me | ORGANIZER ou ADMIN |
| GET | /events/:id | Público |
| POST | /events | ORGANIZER ou ADMIN |
| PATCH | /events/:id | Dono do evento ou ADMIN |
| DELETE | /events/:id | Dono do evento ou ADMIN |
| POST | /events/:id/reservations | CUSTOMER |
| GET | /events/:id/reservations | Dono do evento ou ADMIN |
| GET | /reservations/me | Autenticado |
| PATCH | /reservations/:id/cancel | Dono da reserva ou ADMIN |
| POST | /events/:id/attachments | Dono do evento ou ADMIN |
| GET | /attachments/:id/download | Autenticado |
| GET | /health | Público |
| GET | /docs | Público (Swagger) |

Listagens são paginadas com `?page=1&limit=10` (máximo 100). Em `/events` dá para filtrar por `title`, `status`, `from`, `to` e `organizerId` e ordenar com `sort=startsAt&order=asc`; a listagem pública não mostra eventos em rascunho (DRAFT). Em `/events/me` o organizador vê os próprios eventos em qualquer status, com os mesmos filtros exceto `organizerId`.

Os erros sempre voltam no formato:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Dados inválidos", "details": [] } }
```

## Upload

Campo `file` em multipart/form-data, até 5 MB, aceita JPEG, PNG, WEBP e PDF. Os arquivos vão para `uploads/` (fora do Git) e o banco guarda só os metadados.

## Testando

- Swagger em `http://localhost:3333/docs`: faça login, clique em "Authorize" e cole o token.
- `requests/api.http` (extensão REST Client do VS Code): rode as requisições de cima para baixo, porque o token é repassado automaticamente.
