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

### Curso (F02)

Curso creado por un usuario, que es su autor. Tabla `curso`; en el contrato
viaja como `ResumenCurso` (catálogo) y `DetalleCurso` (detalle).

| Campo (contrato) | Columna (`curso`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | UUID v7, lo genera la base |
| `titulo` | `titulo` | texto | sí | Sus límites de longitud los define F05 |
| `descripcion` | `descripcion` | texto | sí | Puede tener saltos de línea. Límites en F05 |
| — | `publicado` | booleano | sí | Por defecto `false`. Solo los `true` se ven en el catálogo y el detalle, para cualquier usuario, incluido su autor. Lo cambia un administrador en la base (decisión 0014). En F02 "en revisión" es lo mismo que no publicado; F06 lo distingue |
| `autor` | `id_autor` | texto | sí | → `user.id`, sin borrado en cascada (borrar cuentas está fuera del MVP). En el contrato, `{ id, nombre }` con el nombre actual del usuario |
| `cantidadLecciones` | — | entero | sí | No se guarda: se cuenta al responder |
| — | `creado_en` | fecha | sí | Por defecto, el momento de crearlo. Desempata el orden |
| — | `actualizado_en` | fecha | sí | |

- Un curso no publicado y uno que no existe dan la misma respuesta.
- Orden del catálogo: el título sin mayúsculas, acentos ni signos al inicio
  ("¿", "¡"); luego `creado_en` y luego `id`.
- **La portada no se guarda**: cada cliente la calcula (la inicial del título
  sobre uno de 8 colores elegido por el `id`), así que no cambia si se corrige
  el título. Regla en
  [`features/F02-explorar-catalogo/research.md`](./features/F02-explorar-catalogo/research.md),
  punto 7.

### Leccion (F02)

Lección ordenada dentro de un curso. Tabla `leccion`; en el contrato,
`ResumenLeccion`.

| Campo (contrato) | Columna (`leccion`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | UUID v7, lo genera la base |
| — | `id_curso` | texto | sí | → `curso.id`; se borra con el curso |
| `titulo` | `titulo` | texto | sí | Sus límites los define F05 |
| `posicion` | `posicion` | entero | sí | 1, 2, 3, ... dentro del curso. **Única** por curso |
| `actividades` | `actividades` | JSONB | sí | Lista de **Actividad** en el orden de la lección (F03). Por defecto `[]`. Solo se escribe después de `validarActividades`. En el contrato viaja en `DetalleLeccion`; `ResumenLeccion` y el detalle del curso no la traen |
| — | `creado_en`, `actualizado_en` | fecha | sí | |

Detalle de las dos tablas, la migración y la búsqueda en
[`features/F02-explorar-catalogo/data-model.md`](./features/F02-explorar-catalogo/data-model.md).

### Actividad (F03)

Ejercicio o bloque de teoría de una lección. No tiene tabla ni `id`: es un
elemento de `leccion.actividades`, y su lugar en la lista es su orden. En el
contrato, la unión `Actividad`, distinguida por `tipo`. La base no comprueba
su forma: el backend la valida antes de guardarla.

| Tipo (`tipo`) | Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `teoria` | `titulo` | texto | no | Si está, no vacío |
| | `texto` | texto | sí | No vacío. Párrafos separados por un renglón en blanco |
| | `codigo` | texto | no | Si está, no vacío. Las líneas con `+`, `-` o `@@` se leen como diff |
| | `puntosClave` | lista de textos | no | Si está, al menos uno; cada uno no vacío |
| `tarjeta` | `frente`, `reverso` | texto | sí | No vacíos |
| `opcionMultiple` | `pregunta` | texto | sí | No vacía |
| | `codigo` | texto | no | Igual que en `teoria` |
| | `opciones` | lista de `{ texto }` o `{ simbolo }` | sí | Entre 2 y 9; cada texto o símbolo no vacío |
| | `correcta` | entero | sí | Índice en `opciones`: exactamente una correcta |
| `completarEspacios` | `texto` | texto | sí | Con al menos un `___` (`MARCA_ESPACIO`) |
| | `espacios` | lista de `{ aceptadas }` | sí | Uno por cada `___`. Al menos una aceptada por espacio, no vacía y de hasta 100 caracteres; la primera es la que se muestra como esperada |
| `preguntaAbierta` | `pregunta`, `solucion` | texto | sí | No vacías |

- "No vacío": recortado, tiene al menos un carácter. Un campo que el tipo no
  tiene se rechaza.
- Las respuestas viajan al cliente, que califica sin volver a pedir nada
  (research de F03, punto 2). F04 y F08 no pueden confiar en los aciertos que
  mande el cliente.
- Los otros 8 tipos del prototipo llegan con sus features; los límites de
  longitud de cada texto, con F05, y el glosario de cada actividad, con F09.

Detalle en
[`features/F03-cursar-leccion/data-model.md`](./features/F03-cursar-leccion/data-model.md).

## Entidades previstas

Salen del prototipo (ver `docs/prototipo.md`). Sus campos se definen en la
spec de cada feature.

| Entidad | Qué representa | Feature |
|---|---|---|
| Actividad: los demás tipos | Emparejar, ordenar, banco de palabras, clasificar, código, terminal, grafo de commits y escuchar y repetir (8 del prototipo), y los límites de longitud de los textos (F05) | Features siguientes, F05 |
| Curso: lo que falta | Límites del título y la descripción (F05), el estado "en revisión" (F06), el idioma (F05) y la configuración de gamificación (F08) | F05, F06, F08 |
| Progreso | Lección completada por un usuario | F04 |
| Puntos / Insignia | Recompensas de un usuario en un curso | F08 |
| EntradaGlosario | Término y definición, derivados de lecciones completadas o agregados por el alumno | F09 |
