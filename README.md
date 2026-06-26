# Ayuda Venezuela

Directorio bilingue ES/EN para centralizar informacion verificada de donaciones tras el terremoto de Venezuela de junio de 2026. El sitio no recauda, gestiona ni mueve dinero: solo agrega y muestra quien recibe ayuda, con enlaces a sus redes para verificacion.

## Stack

- React + Vite + TypeScript + Tailwind CSS
- Cloudflare Workers (`fetch` nativo, TypeScript)
- Cloudflare D1 (SQLite)
- Wrangler para desarrollo local y deploy

## Estructura

```
.
├── db/
│   ├── schema.sql        # Tablas entradas, metodos_pago, solicitudes
│   └── seed.sql          # Datos iniciales
├── public/
│   └── og-image.svg
├── src/
│   ├── components/        # EntryCard, FilterBar, LangToggle, SubmitForm
│   ├── pages/            # Home, Admin
│   ├── i18n/             # es, en y tipos del diccionario
│   ├── lib/api.ts        # Cliente tipado de la API
│   ├── types.ts          # Tipos del dominio
│   ├── App.tsx
│   └── main.tsx
├── workers/
│   └── api.ts            # Cloudflare Worker (toda la API + assets)
├── wrangler.toml
└── vite.config.ts
```

## Desarrollo local

1. Instala dependencias:

   ```sh
   pnpm install
   ```

2. Crea variables locales (define un `ADMIN_SECRET` para el panel admin):

   ```sh
   cp .dev.vars.example .dev.vars
   ```

3. Crea el schema y carga los datos seed en D1 local:

   ```sh
   pnpm db:migrate:local
   pnpm db:seed:local
   ```

4. Corre el Worker sirviendo API + assets:

   ```sh
   pnpm dev:worker
   ```

   Para frontend con HMR: corre `pnpm dev` y, en otra terminal, `wrangler dev`. Vite proxya `/api` a `localhost:8787`.

## Deploy en Cloudflare

1. Crea la base D1 y copia el `database_id` a `wrangler.toml`:

   ```sh
   wrangler d1 create ayuda-venezuela-db
   ```

2. Configura el secreto admin (nunca en el codigo):

   ```sh
   wrangler secret put ADMIN_SECRET
   ```

3. Migra, carga seed y despliega:

   ```sh
   pnpm db:migrate:remote
   pnpm db:seed:remote
   pnpm deploy
   ```

4. Conecta el dominio en el dashboard de Cloudflare.

## Rutas

- `/` sitio publico en espanol
- `/en` sitio publico en ingles
- `/admin` panel admin (usa `ADMIN_SECRET` como password; envia `Authorization: Bearer <secret>`)

### API

| Metodo | Ruta | Auth |
| --- | --- | --- |
| GET | `/api/entradas` | no |
| GET | `/api/entradas/:id` | no |
| POST | `/api/solicitudes` | no |
| GET | `/api/admin/entradas` | admin |
| POST | `/api/admin/entradas` | admin |
| PUT | `/api/admin/entradas/:id` | admin |
| DELETE | `/api/admin/entradas/:id` | admin (soft delete) |
| POST | `/api/admin/metodos` | admin |
| DELETE | `/api/admin/metodos/:id` | admin |
| GET | `/api/admin/solicitudes` | admin |
| PUT | `/api/admin/solicitudes/:id` | admin |
