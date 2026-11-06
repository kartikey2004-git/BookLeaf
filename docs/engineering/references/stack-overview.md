# Stack Overview

| Layer                | Actual package/version                   | Owner                                       |
| -------------------- | ---------------------------------------- | ------------------------------------------- |
| Web                  | Next.js 15.5, React 19                   | `apps/web`                                  |
| API                  | Express 5.1                              | `apps/api`                                  |
| Auth                 | Better Auth 1.7                          | `packages/auth`                             |
| Database             | Prisma Client/CLI 7.2, PostgreSQL        | `packages/database`                         |
| Background work      | Inngest 3.38                             | (serverless via Next.js)                    |
| Validation/contracts | Zod 4.1                                  | `packages/validation`, `packages/contracts` |
| Monorepo             | pnpm 10.23, Turborepo 2.3 manifest range | root                                        |

The API owns business logic. Next.js consumes stable API contracts. Do not replace listed technology during ordinary feature work.
