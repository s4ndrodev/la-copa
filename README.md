# LaCopa

Campeonatos de fútbol con Next.js (JavaScript) y Supabase.

- **Público:** bienvenida, campeonatos, tabla de posiciones y partidos por día (con contador en vivo).
- **Administrador (correo autorizado):** crea campeonatos, equipos, calendario y controla el partido en vivo.

## Rutas

| Ruta | Quién | Qué |
|---|---|---|
| `/` | todos | Bienvenida y botón de login |
| `/campeonatos` | todos | Lista de campeonatos |
| `/campeonato/[id]` | todos | Tabla y partidos por día |
| `/login` | admin | Acceso con correo y contraseña |
| `/admin` | admin | Crear y borrar campeonatos |
| `/admin/campeonato/[id]` | admin | Equipos y partidos (generador, resultados, en vivo) |

## Puesta en marcha

1. Crea un proyecto en https://supabase.com
2. **SQL Editor:**
   - Proyecto nuevo: ejecuta `supabase/schema.sql` (antes cambia `TU_CORREO@ejemplo.com`).
   - Ya usabas la versión anterior: ejecuta solo `supabase/migracion_v2.sql`.
3. **Authentication → Users → Add user** con ese correo y una contraseña (Auto confirm).
4. **Authentication → Sign In / Providers:** desactiva "Allow new users to sign up".
5. Copia `.env.local.example` a `.env.local` y rellena la URL y la anon key.
6. `npm install` y `npm run dev`.

## Partido en vivo

En `/admin/campeonato/[id]` → Partidos → "Control del partido":

- Define los **minutos por tiempo** (45 por defecto, el que quieras).
- Botones: iniciar 1er tiempo → terminar 1er tiempo → iniciar 2º tiempo → finalizar.
- Añade **goles y tarjetas** (el marcador sube solo con cada gol) y las **alineaciones**
  (una línea por jugador; opcional número al inicio: `10 Messi`).

El público solo ve lo que el admin haya rellenado. Si el reloj pasa del tiempo reglamentario
se muestra como `45+2'`. La vista pública se refresca sola cada 20 s mientras hay un partido en curso.
La tabla cuenta únicamente partidos finalizados.

## Seguridad

La anon key es pública; la protección está en las políticas RLS: todos leen, solo los correos
de la tabla `editors` escriben. Para dar acceso a otra persona, crea su usuario y añade su correo a `editors`.

## Añadir administradores desde el panel

En `/admin` → "Administradores" puedes añadir un correo y contraseña nuevos, o quitar el acceso a otro admin.
Esto necesita la variable de servidor `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API Keys → `service_role` o *secret*):

- En local: ponla en `.env.local`.
- En Vercel: Settings → Environment Variables, **sin** prefijo `NEXT_PUBLIC_`, y vuelve a desplegar.

La clave solo se usa en `app/api/admins/route.js`, que comprueba que quien llama es administrador antes de hacer nada.
Quitar el acceso no borra la cuenta: queda con permisos de solo lectura.
