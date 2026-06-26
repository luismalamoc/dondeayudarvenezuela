# ¿Dónde puedo ayudar a Venezuela?

Directorio de campañas de ayuda tras el terremoto de Venezuela de junio 2026. Cualquier persona u organización puede publicar su campaña directamente — sin moderación, sin intermediarios. El sitio no recauda ni mueve dinero.

**Sitio en vivo:** [dondeayudarvenezuela.com](https://dondeayudarvenezuela.com)
**Código fuente:** [github.com/luismalamoc/dondeayudarvenezuela](https://github.com/luismalamoc/dondeayudarvenezuela)

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 + TypeScript 6 |
| API | Cloudflare Workers (fetch nativo, sin framework) |
| Base de datos | Cloudflare D1 (SQLite en el edge) |
| Deploy | Cloudflare Pages |
| Captcha | Cloudflare Turnstile |

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Listado de campañas con búsqueda y filtros |
| `/publicar` | Formulario público para publicar una campaña |
| `/acerca` | Sobre el proyecto |
| `/admin` | Panel para desactivar spam (requiere `ADMIN_SECRET`) |

## Desarrollo local

```sh
pnpm install
cp .dev.vars.example .dev.vars   # define ADMIN_SECRET=cualquier-valor
pnpm db:migrate:local
pnpm db:seed:local
pnpm dev:worker                  # frontend + API + D1 local en http://localhost:8787
```

> Para HMR: corre `pnpm dev` en una terminal y `wrangler dev` en otra. Vite proxya `/api` a `localhost:8787`.

## Base de datos

```sh
pnpm db:migrate:local    # aplica schema.sql a D1 local
pnpm db:seed:local       # carga datos de prueba
pnpm db:reset:local      # drop + migrate + seed (útil al cambiar schema)

pnpm db:migrate:remote   # producción
pnpm db:seed:remote
pnpm db:reset:remote
```

## Variables de entorno

En `.dev.vars` para desarrollo (no versionar):

```
ADMIN_SECRET=cualquier-string-para-local
TURNSTILE_SECRET=    # vacío = Turnstile se salta automáticamente
```

En producción se configuran con `wrangler secret put`.

## Deploy en Cloudflare

1. Crea tu propia base D1 y actualiza `database_id` en `wrangler.toml`:

   ```sh
   wrangler d1 create dondeayudarvenezuela
   ```

2. Configura los secretos:

   ```sh
   wrangler secret put ADMIN_SECRET
   wrangler secret put TURNSTILE_SECRET   # opcional
   ```

3. Migra y despliega:

   ```sh
   pnpm db:migrate:remote
   pnpm db:seed:remote
   pnpm deploy
   ```

## API

| Método | Ruta | Auth |
|---|---|---|
| `GET` | `/api/publicaciones?q=&tipo=&pais=&estado_ve=&limit=&offset=` | no |
| `POST` | `/api/publicaciones` | no (Turnstile) |
| `GET` | `/api/admin/publicaciones` | Bearer token |
| `DELETE` | `/api/admin/publicaciones/:id` | Bearer token |

## Contribuir

El proyecto está bajo licencia MIT. Si quieres agregar campañas verificadas al seed, corregir datos o mejorar el código, abre un PR — toda contribución es bienvenida.

## Licencia

[MIT](LICENSE) — Luis Alamo, 2026
