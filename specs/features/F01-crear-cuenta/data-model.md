# Modelo de datos: F01 Crear cuenta e iniciar sesión

**Plan**: [plan.md](./plan.md) · **Investigación**: [research.md](./research.md) (puntos 4 y 8)

Las cuatro tablas son las que exige Better Auth 1.7, con sus nombres en
inglés (excepción aprobada; ver "Excepciones" del plan). En la API y en el
contrato el usuario se llama `Usuario` y sus campos van en español.

## Entidades

### Usuario: tabla `user` (modelo Prisma `User`)

| Campo (BD) | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | texto | sí | Lo genera Better Auth. Clave primaria |
| `name` | texto | sí | Nombre para mostrar, ya recortado: 1 a 50 caracteres. Puede repetirse |
| `email` | texto | sí | En minúsculas y recortado, hasta 254 caracteres. **Único** |
| `emailVerified` | booleano | sí | Siempre `false` en el MVP (no se verifica el correo) |
| `image` | texto | no | No se usa en F01 |
| `createdAt` | fecha y hora | sí | Por defecto `now()` |
| `updatedAt` | fecha y hora | sí | `@updatedAt` |

Relaciones: un usuario tiene muchas `Session` y muchas `Account`.
Desde F02, los cursos tendrán un autor que apunta a `user.id`.

### Sesion: tabla `session` (modelo `Session`)

| Campo (BD) | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | texto | sí | Clave primaria |
| `token` | texto | sí | **Único**. Es lo que viaja (firmado) en la cookie o como Bearer |
| `expiresAt` | fecha y hora | sí | Último uso + 30 días; se renueva como máximo una vez al día |
| `userId` | texto | sí | → `user.id`, `onDelete: Cascade`. Índice |
| `ipAddress` | texto | no | Lo llena Better Auth |
| `userAgent` | texto | no | Lo llena Better Auth |
| `createdAt` | fecha y hora | sí | |
| `updatedAt` | fecha y hora | sí | |

Una sesión por dispositivo: entrar en la web y en el móvil crea dos filas.
Cerrar sesión borra la fila de ese dispositivo.

### Credencial: tabla `account` (modelo `Account`)

Forma de entrar de un usuario. En F01 solo existe la de correo y contraseña.

| Campo (BD) | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | texto | sí | Clave primaria |
| `accountId` | texto | sí | Para correo y contraseña es el `user.id` |
| `providerId` | texto | sí | `"credential"` |
| `userId` | texto | sí | → `user.id`, `onDelete: Cascade`. Índice |
| `password` | texto | no | Hash scrypt. Nunca sale del servidor |
| `accessToken`, `refreshToken`, `idToken`, `scope` | texto | no | Para proveedores externos; no se usan en el MVP |
| `accessTokenExpiresAt`, `refreshTokenExpiresAt` | fecha y hora | no | Ídem |
| `createdAt`, `updatedAt` | fecha y hora | sí | |

### Verificacion: tabla `verification` (modelo `Verification`)

Better Auth la exige, pero F01 no la usa (no hay verificación de correo ni
recuperación de contraseña).

| Campo (BD) | Tipo | Obligatorio |
|---|---|---|
| `id` | texto | sí |
| `identifier` | texto | sí (con índice) |
| `value` | texto | sí |
| `expiresAt` | fecha y hora | sí |
| `createdAt`, `updatedAt` | fecha y hora | sí |

## Reglas que aplica el backend antes de guardar

| Dato | Regla | Error |
|---|---|---|
| `nombre` | Recortar; 1 a 50 caracteres Unicode | 400, `campos.nombre` |
| `correo` | Recortar y pasar a minúsculas; `PATRON_CORREO`; máximo 254 | 400, `campos.correo` |
| `correo` | No existe otro `user.email` igual | 409, `campos.correo` |
| `contrasena` | Tal cual; 8 a 128 caracteres Unicode | 400, `campos.contrasena` |

Los mensajes exactos están en `MENSAJES_CUENTA` ([contracts/contrato.md](./contracts/contrato.md)).

## Del modelo al contrato

| Contrato (`Usuario`) | BD (`user`) |
|---|---|
| `id` | `id` |
| `nombre` | `name` |
| `correo` | `email` |
| `creadoEn` | `createdAt` en ISO 8601 |

## Estados de una sesión

```text
(no existe) ──entrar / crear cuenta──▶ vigente ──uso tras > 1 día──▶ vigente (expiresAt = ahora + 30 d)
                                          │
                     cerrar sesión ───────┤──▶ (borrada)
                                          │
                     30 días sin uso ─────┴──▶ vencida → la API responde 401
```

## Al cerrar la feature

Se agregan a `specs/02-modelo-datos.md`, en "Entidades definidas", **Usuario**
(tabla `user`) y **Sesion** (tabla `session`), con una nota sobre `account`
y `verification` y la excepción de nombres en inglés.
