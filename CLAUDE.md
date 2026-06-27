# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# Proyecto: ayuda-venezuela

Directorio bilingüe (ES/EN) de voluntarios, activistas y organizaciones verificadas que reciben donaciones para víctimas del terremoto de Venezuela (junio 2026). No recauda dinero directamente.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| API | Cloudflare Workers (fetch nativo, sin framework) |
| Base de datos | Cloudflare D1 (SQLite en el edge) |
| Deploy | Cloudflare Pages (dominio por definir) |
| Tipos | TypeScript 6, strict mode |

## Comandos principales

```bash
pnpm dev              # Vite dev server (solo frontend, sin API real)
pnpm dev:worker       # Build + wrangler dev (frontend + Worker + D1 local)
pnpm build            # Build de producción (tsc + vite build)
pnpm deploy           # Build + wrangler deploy
pnpm typecheck        # tsc sin emit
pnpm lint             # ESLint
pnpm format           # Prettier --write
pnpm format:check     # Prettier --check
pnpm test             # Vitest run
make check            # lint + typecheck + test (gate completo)
```

## Base de datos local

```bash
pnpm db:migrate:local   # Aplica schema.sql a D1 local
pnpm db:seed:local      # Carga seed.sql con datos de prueba
pnpm db:migrate:remote  # Producción (requiere wrangler login)
pnpm db:seed:remote
```

D1 local vive en `.wrangler/state/` — no se versiona.

## Variables de entorno

Copiar `.dev.vars.example` a `.dev.vars` para desarrollo:

```
ADMIN_SECRET=cualquier-string-para-local
TURNSTILE_SECRET=    # Vacío = Turnstile se salta automáticamente
```

En producción se configuran con `wrangler secret put`.

## Arquitectura de datos

### Separación crítica: contacto vs. pago

**`metodos_contacto`** — cómo llegar a la persona/org:
- Tipos: `whatsapp` | `instagram` | `x` | `web`
- `label`: nombre opcional (ej. "Luis Alamo")
- `detalle`: número de teléfono, handle (`@fulano`), o URL completa
- WhatsApp **no es un método de pago** — siempre va aquí

**`metodos_pago`** — cómo enviar dinero:
- Tipos: `banco_ve` | `banco_us` | `banco_cl` | `paypal` | `zelle` | `binance` | `venmo` | `pago_movil` | `donorbox` | `globalgiving` | `gofundme` | `otro`

### `entradas`

- `tipo`: `persona` | `organizacion`
- `estado_ve` / `ciudad_ve`: ubicación venezolana (nullable — Chile/USA no la tienen)
- `verificacion_url`: link de verificación (Instagram/web oficial)
- `activo` / `destacado`: visibilidad y orden

### `solicitudes`

Formulario público. Estado: `pendiente` → `aprobado` | `rechazado`.

## API (Cloudflare Worker)

```
GET  /api/entradas              → lista pública
POST /api/solicitudes           → formulario público (Turnstile)

# Admin (Authorization: Bearer {ADMIN_SECRET})
GET/POST   /api/admin/entradas
PUT/DELETE /api/admin/entradas/:id
POST/DELETE /api/admin/metodos/:id
POST/DELETE /api/admin/contactos/:id
GET        /api/admin/solicitudes
PUT        /api/admin/solicitudes/:id
```

## Panel de admin

Ruta `/admin`, protegido con `ADMIN_SECRET` en el form (guardado en `sessionStorage`).

## Estados venezolanos

Lista canónica en `src/lib/venezuela.ts` — 25 estados + Distrito Capital + La Guaira. Se usa en el select del admin.

## Alcabala de calidad (pre-commit)

Lefthook corre en paralelo sobre archivos staged:
1. `prettier --check` — formato
2. `eslint --max-warnings 0` — linting
3. `pnpm typecheck` — TypeScript estricto

En pre-push corre `make check` (lint + typecheck + tests).

Para formatear: `pnpm format` o `make format`.

## Dominio

Por definir. Al comprar, se conecta desde Cloudflare Pages dashboard (DNS automático si es Cloudflare Registrar).
