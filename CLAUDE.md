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

# Proyecto: dondeayudarvenezuela

Directorio de campañas de ayuda para Venezuela tras el terremoto de junio 2026. Cualquiera puede publicar su campaña directamente — sin moderación manual, el captcha Turnstile evita spam. El sitio no recauda ni mueve dinero.

**Sitio:** https://dondeayudarvenezuela.com
**Repo:** https://github.com/luismalamoc/dondeayudarvenezuela

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| API | Cloudflare Workers (fetch nativo, sin framework) |
| Base de datos | Cloudflare D1 (SQLite en el edge) |
| Deploy | Cloudflare Pages |
| Tipos | TypeScript 6, strict mode |
| Captcha | Cloudflare Turnstile |

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Listado de campañas con búsqueda y filtros server-side |
| `/publicar` | Formulario público — publica de inmediato tras Turnstile |
| `/acerca` | Sobre el proyecto |
| `/admin` | Panel para desactivar spam (`ADMIN_SECRET`) |

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

## Base de datos

```bash
pnpm db:migrate:local    # Aplica schema.sql a D1 local
pnpm db:seed:local       # Carga seed.sql con datos de prueba
pnpm db:reset:local      # drop + migrate + seed (cambios de schema)
pnpm db:migrate:remote   # Producción (requiere wrangler login)
pnpm db:seed:remote
pnpm db:reset:remote
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

### Tablas

**`publicaciones`** — una campaña de ayuda:
- `tipo`: `persona` | `organizacion`
- `titulo`: nombre de la campaña
- `info`: texto libre — datos bancarios, links a GoFundMe, instrucciones, etc.
- `pais`: código ISO (VE, CL, US, ES, etc.)
- `estado_ve`: estado venezolano (nullable — solo aplica si `pais = 'VE'`)
- `ciudad`: ciudad (nullable)
- `activo`: `1` activo / `0` desactivado por admin (spam control)
- `creado_en`: timestamp

**`contactos`** — métodos de contacto de una publicación (relación 1→N):
- `tipo`: `instagram` | `twitter_x` | `whatsapp`
- `valor`: handle (`@fulano`) o número de teléfono

### Separación conceptual clave

`contactos` es cómo llegar a la persona. La información de cómo donar (cuentas bancarias, Zelle, PayPal, GoFundMe, etc.) va en el campo `info` de `publicaciones` como texto libre — esto elimina la complejidad de tipar métodos de pago.

## API (Cloudflare Worker)

```
# Pública
GET  /api/publicaciones?q=&tipo=&pais=&estado_ve=&limit=&offset=
POST /api/publicaciones   (body: { tipo, titulo, info, pais, estado_ve?, ciudad?, contactos[], turnstileToken? })

# Admin (Authorization: Bearer {ADMIN_SECRET})
GET    /api/admin/publicaciones
DELETE /api/admin/publicaciones/:id   (soft delete: activo = 0)
```

El filtrado es server-side en el Worker. La búsqueda usa `LIKE` sobre `titulo` e `info`. Paginación con el truco `limit+1` para detectar `hasMore` sin COUNT.

## Panel de admin

Ruta `/admin`, protegido con `ADMIN_SECRET` en el form (guardado en `sessionStorage`). Solo permite desactivar publicaciones (spam control).

## Listas de referencia

- `src/lib/venezuela.ts` — `ESTADOS_VENEZUELA` (24 estados + Distrito Capital + La Guaira) y `PAISES` (28 países)

## Alcabala de calidad (pre-commit)

Lefthook corre en paralelo sobre archivos staged:
1. `prettier --check` — formato
2. `eslint --max-warnings 0` — linting
3. `pnpm typecheck` — TypeScript estricto

En pre-push corre `make check` (lint + typecheck + tests).

Para formatear antes de commitear: `pnpm format`.
