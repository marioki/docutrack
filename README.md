# DocuTrack

Sistema moderno para la gestión de solicitudes y emisión de certificados.

## Version DEMO en linea
https://docutrack-six.vercel.app/

Cuenta admin:
email: admin@docutrack.com
clave: 123456


---

## 🚀 Requisitos previos

- Node.js 18 o superior
- pnpm (recomendado) o npm/yarn
- Cuenta y proyecto en [Supabase](https://supabase.com)

---

## ⚙️ Instalación y configuración

### 1. Clona el repositorio
```bash
git clone <URL-del-repo>
cd docutrack
```

### 2. Instala las dependencias
```bash
pnpm install
# o
npm install
```

### 3. Configura las variables de entorno
Copia el archivo `.env.example` a `.env.local` y completa los valores:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_supabase
SUPABASE_JWT_SECRET=tu_jwt_secret_supabase
```

Puedes encontrar estos valores en la sección **Project Settings > API** de tu panel de Supabase.

### 4. Configura la base de datos y el storage
- Crea las tablas necesarias en Supabase (ver estructura en `/app/api/requests/route.ts` y otros endpoints).
- Asegúrate de tener los buckets de storage:
  - `attachments` (para archivos subidos por el usuario)
  - `certificates` (para PDFs generados)
- Agrega las siguientes columnas a la tabla `requests` si no existen:

```sql
alter table public.requests
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists personal_id text,
  add column if not exists birth_date date,
  add column if not exists attachment_url text,
  add column if not exists certificate_pdf_url text;
```

---

## 🖥️ Ejecución en desarrollo

```bash
pnpm dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🛠️ Comandos útiles

- `pnpm dev` — Inicia el servidor de desarrollo
- `pnpm build` — Compila la app para producción
- `pnpm start` — Inicia la app en modo producción
- `pnpm lint` — Ejecuta el linter

---

## 📝 Notas de desarrollo

- El sistema usa Next.js App Router y componentes de [shadcn/ui](https://ui.shadcn.com/).
- La autenticación y la gestión de archivos se realiza con Supabase.
- Los certificados se generan como PDF automáticamente cuando un admin cambia el estado a `ISSUED`.
- El frontend está en español y es responsive.

---

## 🧑‍💻 Estructura principal

- `/app` — Páginas y rutas de la aplicación
- `/app/api` — Endpoints API (Next.js Route Handlers)
- `/components/ui` — Componentes de interfaz reutilizables
- `/lib` — Utilidades y configuración de Supabase

---

## 🆘 Soporte

Si tienes dudas o problemas, abre un issue o contacta al responsable del repositorio.
