# Skills Registry

## Installed this audit

| Skill/source                                                                                      | Project-local path                                            | Status                                   |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------- |
| Better Auth best practices, create auth — `better-auth/skills`                                    | `.claude/skills/best-practices`, `.claude/skills/create-auth` | Installed; leaf `SKILL.md` verified      |
| Prisma CLI, Client API, database setup, ORM setup, PostgreSQL setup, v7 upgrade — `prisma/skills` | `.claude/skills/prisma-*`                                     | Installed; relevant leaf skills verified |
| Supabase PostgreSQL best practices — `supabase/agent-skills`                                      | `.claude/skills/supabase-postgres-best-practices`             | Installed; PostgreSQL guidance only      |
| Inngest portable collection — `inngest/inngest-skills`                                            | `.claude/skills/inngest-*`                                    | 15 leaf skills installed and verified    |

## Classified but not installed

`vercel-labs/next-skills` had no discovered `SKILL.md`; no installation. Vercel Agent Skills already exist locally (`react-best-practices`, `composition-patterns`, `web-design-guidelines`) and remain frontend guidance, not backend skills. Turborepo is documentation/source, not an installable skill. Existing local `prisma-postgres`, `better-auth`, and `inngest-workflows` were preserved; they were not overwritten. The requested StackSkills command was not run because CLI identity was not verified.

Installed directories are ignored by Git via `.claude/`; no dependencies, scripts, MCP configuration, or global skills were installed. Official repository source was shallow-cloned only to a temporary review directory; no source-provided executables were run.
