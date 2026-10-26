# Modelo de datos

> **Crece con cada feature.** Una entidad se escribe aquí completa cuando la
> spec que la usa se cierra (tarea de cierre de su `tasks.md`). Mientras, se
> lista abajo como prevista.

Convenciones:

- Nombres en español sin acentos (`idCurso`, `creadoEn`). **Única
  excepción**: las tablas de Better Auth (`user`, `session`, `account`,
  `verification`) y sus columnas quedan en inglés, como las define la
  librería (decidido en el plan de F01). En la API y en el contrato se
  exponen en español.
- Fechas como texto ISO 8601 en la API (`"2026-10-20T18:30:00Z"`).
- IDs como texto.

## Entidades definidas

### Usuario (F01)

Persona con cuenta. La misma cuenta cursa y crea cursos; no hay roles.
Tabla `user`; en el contrato, el tipo `Usuario`.

| Campo (contrato) | Columna (`user`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | Lo genera Better Auth |
| `nombre` | `name` | texto | sí | Nombre para mostrar: 1 a 50 caracteres Unicode, sin espacios al inicio ni al final. Puede repetirse. Es el que aparece como autor de los cursos |
| `correo` | `email` | texto | sí | En minúsculas y sin espacios al inicio ni al final, hasta 254 caracteres. **Único** |
| `creadoEn` | `createdAt` | fecha (ISO 8601 en la API) | sí | |
| — | `emailVerified` | booleano | sí | Siempre `false` en el MVP (no se verifica el correo) |
| — | `image` | texto | no | Sin uso todavía |
| — | `updatedAt` | fecha | sí | |

La contraseña no está en `user`: vive como hash scrypt en `account`
(proveedor `credential`) y nunca sale del servidor.

### Sesion (F01)

Acceso abierto de un usuario en un dispositivo (un navegador o una
instalación de la app); un usuario puede tener varias a la vez. Tabla
`session`. No viaja por la API: la web la lleva en una cookie `httpOnly` y el
móvil como token Bearer.

| Columna (`session`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| `id` | texto | sí | |
| `token` | texto | sí | **Único** |
| `userId` | texto | sí | → `user.id`; se borra con el usuario |
| `expiresAt` | fecha | sí | Último uso + 30 días; se renueva como máximo una vez al día |
| `ipAddress`, `userAgent` | texto | no | Los llena Better Auth |
| `createdAt`, `updatedAt` | fecha | sí | |

Cerrar sesión borra la fila de ese dispositivo; las demás siguen.

### Tablas de soporte de Better Auth (F01)

- `account`: forma de entrar de un usuario. En el MVP solo la de correo y
  contraseña (`providerId = "credential"`, con el hash en `password`). Las
  columnas para proveedores externos quedan vacías.
- `verification`: Better Auth la exige, pero no se usa en el MVP (no hay
  verificación de correo ni recuperación de contraseña).

Detalle de las cuatro tablas en
[`features/F01-crear-cuenta/data-model.md`](./features/F01-crear-cuenta/data-model.md).

## Entidades previstas

Salen del prototipo (ver `docs/prototipo.md`). Sus campos se definen en la
spec de cada feature.

| Entidad | Qué representa | Feature |
|---|---|---|
| Curso | Título, descripción, portada, idioma, autor, estado (borrador / en revisión / publicado), configuración de gamificación | F02, F05, F06 |
| Leccion | Lección ordenada dentro de un curso, con su lista de actividades | F03, F05 |
| Actividad | Ejercicio o bloque de teoría de una lección; una variante por tipo (13 en el prototipo) | F03, F05 |
| Progreso | Lección completada por un usuario | F04 |
| Puntos / Insignia | Recompensas de un usuario en un curso | F08 |
| EntradaGlosario | Término y definición, derivados de lecciones completadas o agregados por el alumno | F09 |
