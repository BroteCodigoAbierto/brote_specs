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

### Curso (F02, F05, F06)

Curso creado por un usuario, que es su autor. Tabla `curso`; en el contrato
viaja como `ResumenCurso` (catálogo), `DetalleCurso` (detalle), `CursoDelAutor`
("Cursos que creé") y `CursoEnEditor` (mapa del curso).

| Campo (contrato) | Columna (`curso`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | UUID v7, lo genera la base |
| `titulo` | `titulo` | texto | sí | De 1 a 100 caracteres. Se guarda recortado |
| `descripcion` | `descripcion` | texto | sí | De 1 a 1000 caracteres. Puede tener saltos de línea. Se guarda tal como se escribió |
| — | `publicado` | booleano | sí | Por defecto `false`. Solo los `true` se ven en el catálogo y el detalle, para cualquier usuario, incluido su autor. Lo pone en `true` un administrador en la base (decisión 0014), y en `false` también su autor, con "Retirar del catálogo". Un curso publicado no se edita ni se elimina |
| — | `revision` | texto | no | `null`, `"pendiente"` o `"rechazada"`. No viaja por la API. Un curso pendiente no se edita ni se elimina; uno rechazado es un borrador |
| `motivoRechazo` | `motivo_rechazo` | texto | no | Hasta 1000 caracteres. Solo con `revision = "rechazada"`. Puede tener saltos de línea. Se muestra siempre como texto |
| `estado` | — | texto | sí | No se guarda: `"publicado"` si `publicado`, `"enRevision"` si `revision = "pendiente"` y `"borrador"` en cualquier otro caso |
| `revisionRechazada` | — | booleano | sí | No se guarda: `revision = "rechazada"`. Sin motivo también es `true` |
| `autor` | `id_autor` | texto | sí | → `user.id`, sin borrado en cascada (borrar cuentas está fuera del MVP). En el contrato, `{ id, nombre }` con el nombre actual del usuario |
| `cantidadLecciones` | — | entero | sí | No se guarda: se cuenta al responder |
| — | `creado_en` | fecha | sí | Por defecto, el momento de crearlo. Desempata el orden |
| — | `actualizado_en` | fecha | sí | Ordena "Cursos que creé". Se actualiza también al cambiar sus lecciones |

- Un curso no publicado y uno que no existe dan la misma respuesta.
- **Restricción** `curso_revision_valida` (`CHECK`): `revision` solo tiene sus dos
  valores, un curso publicado no tiene `revision`, y `motivo_rechazo` solo existe con
  `revision = "rechazada"` y tiene hasta 1000 caracteres.
- **Trigger** `curso_publicado_limpia_revision`: cuando `publicado` cambia de valor,
  pone `revision` y `motivo_rechazo` en `NULL`. Aprobar y retirar a mano siguen siendo
  un `UPDATE` de `publicado`. Es la excepción al principio III del plan de F06.
- Para enviar a revisión hace falta al menos una lección, y que ninguna esté vacía. Al
  enviar se borran el rechazo y su motivo.
- Un curso tiene hasta 100 lecciones.
- Solo su autor abre, cambia o elimina un borrador. Para cualquier otro, un curso
  ajeno da la misma respuesta que uno que no existe.
- Eliminar un curso borra sus lecciones y el progreso de ellas. Si estuvo publicado
  y se retiró, el progreso de sus alumnos se borra con él.
- Orden del catálogo: el título sin mayúsculas, acentos ni signos al inicio
  ("¿", "¡"); luego `creado_en` y luego `id`.
- **La portada no se guarda**: cada cliente la calcula (la inicial del título
  sobre uno de 8 colores elegido por el `id`), así que no cambia si se corrige
  el título. Regla en
  [`features/F02-explorar-catalogo/research.md`](./features/F02-explorar-catalogo/research.md),
  punto 7.

### Leccion (F02, F05)

Lección ordenada dentro de un curso. Tabla `leccion`; en el contrato,
`ResumenLeccion`, y en el editor, `LeccionEnMapa` y `LeccionEnEditor`.

| Campo (contrato) | Columna (`leccion`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | UUID v7, lo genera la base |
| — | `id_curso` | texto | sí | → `curso.id`; se borra con el curso |
| `titulo` | `titulo` | texto | sí | De 1 a 100 caracteres. Se guarda recortado |
| `posicion` | `posicion` | entero | sí | 1, 2, 3, ... dentro del curso, sin huecos. **Única** por curso. Se renumera al reordenar y al eliminar, en dos pasos, porque el índice único se comprueba fila por fila (research de F05, punto 3) |
| `actividades` | `actividades` | JSONB | sí | Lista de **Actividad** en el orden de la lección (F03). Por defecto `[]`. Solo se escribe después de `validarActividades`. En el contrato viaja en `DetalleLeccion`; `ResumenLeccion` y el detalle del curso no la traen. Hasta 50 actividades |
| `version` | `version` | entero | sí | Por defecto 1. Sube 1 cada vez que se guarda la lección, para detectar una versión más nueva. Agregarla, reordenar o renumerar no la cambian. Solo viaja en `LeccionEnEditor` |
| — | `creado_en`, `actualizado_en` | fecha | sí | |

Detalle de las dos tablas, la migración y la búsqueda en
[`features/F02-explorar-catalogo/data-model.md`](./features/F02-explorar-catalogo/data-model.md).
Lo que agrega el editor, en
[`features/F05-crear-editar-curso/data-model.md`](./features/F05-crear-editar-curso/data-model.md).
Los estados de un curso, en
[`features/F06-publicar-curso/data-model.md`](./features/F06-publicar-curso/data-model.md).

### Actividad (F03, F05, F11, F12)

Ejercicio o bloque de teoría de una lección. No tiene tabla ni `id`: es un
elemento de `leccion.actividades`, y su lugar en la lista es su orden. En el
contrato, la unión `Actividad`, distinguida por `tipo`. La base no comprueba
su forma: el backend la valida antes de guardarla.

| Tipo (`tipo`) | Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `teoria` | `titulo` | texto | no | Si está, no vacío, de hasta 100. Se guarda recortado |
| | `texto` | texto | sí | No vacío, de hasta 5000. Párrafos separados por un renglón en blanco |
| | `codigo` | texto | no | Si está, no vacío, de hasta 2000. Las líneas con `+`, `-` o `@@` se leen como diff |
| | `puntosClave` | lista de textos | no | Si está, de 1 a 10; cada uno no vacío, de hasta 200 |
| `tarjeta` | `frente` | texto | sí | No vacío, de hasta 200 |
| | `reverso` | texto | sí | No vacío, de hasta 1000 |
| `opcionMultiple` | `pregunta` | texto | sí | No vacía, de hasta 500 |
| | `codigo` | texto | no | Igual que en `teoria` |
| | `opciones` | lista de `{ texto }` o `{ simbolo }` | sí | Entre 2 y 9, todas de texto o todas de símbolo. Cada texto no vacío, de hasta 200; cada símbolo, de hasta 4. No se repiten: se comparan recortadas, respetando las mayúsculas |
| | `correcta` | entero | sí | Índice en `opciones`: exactamente una correcta |
| `completarEspacios` | `texto` | texto | sí | De hasta 2000, con 1 a 20 `___` (`MARCA_ESPACIO`) |
| | `espacios` | lista de `{ aceptadas }` | sí | Uno por cada `___`. De 1 a 10 aceptadas por espacio, no vacías y de hasta 100 caracteres; la primera es la que se muestra como esperada |
| `preguntaAbierta` | `pregunta` | texto | sí | No vacía, de hasta 500 |
| | `solucion` | texto | sí | No vacía, de hasta 2000 |
| `emparejar` | `consigna` | texto | no | Si está, no vacía, de hasta 500 |
| | `parejas` | lista de `{ izquierda, derecha }` | sí | Entre 3 y 8, en el orden del autor. Cada texto no vacío, de hasta 200. No se repite en su columna |
| `clasificar` | `consigna` | texto | no | Si está, no vacía, de hasta 500 |
| | `categorias` | lista de textos | sí | Entre 2 y 4, en el orden del autor. Cada una no vacía, de hasta 100. No se repiten |
| | `elementos` | lista de `{ texto, categoria }` | sí | Entre 2 y 12. `texto`, no vacío, de hasta 100, sin repetirse. `categoria`, índice en `categorias`. Toda categoría tiene al menos un elemento |
| `ordenar` | `consigna` | texto | sí | No vacía, de hasta 500 |
| | `elementos` | lista de textos | sí | Entre 3 y 10, **en el orden correcto**. Cada uno no vacío, de hasta 200. No se repiten |
| `bancoPalabras` | `consigna` | texto | no | Si está, no vacía, de hasta 500 |
| | `texto` | texto | sí | De hasta 2000, con 1 a 10 `___` (`MARCA_ESPACIO`) |
| | `fichas` | lista de textos | sí | Entre 2 y 20. Cada una no vacía, de hasta 100. Se guardan recortadas. **Se pueden repetir** |
| | `espacios` | lista de `{ aceptadas }` | sí | Uno por cada `___`. Cada `aceptadas` tiene de 1 a 20 textos (`fichasMax`), y cada texto es el de una ficha |
| `retoCodigo` | `consigna` | texto | sí | No vacía, de hasta 500 |
| | `lenguaje` | texto | sí | Uno de `LENGUAJES_CODIGO`: `c`, `css`, `html`, `javascript`, `python`, `sql`, `bash` u `otro` |
| | `codigoInicial` | texto | no | Si está, no vacío, de hasta 2000 |
| | `solucion` | texto | sí | No vacía, de hasta 2000 |
| `terminalSimulada` | `consigna` | texto | sí | No vacía, de hasta 500 |
| | `carpeta` | texto | no | Si está, no vacía, de una línea, de hasta 100. Se guarda recortada |
| | `salidaPrevia` | texto | no | Si está, no vacía, de hasta 2000 |
| | `comandos` | lista de textos | sí | Entre 1 y 10. Cada uno no vacío, de una línea, de hasta 200. Se guardan recortados. No se repiten (ver abajo). El primero es el que se muestra como respuesta correcta |
| | `salidaAcierto` | texto | no | Si está, no vacía, de hasta 2000 |
| | `pista` | texto | no | Si está, no vacía, de hasta 500 |
| `grafoCommits` | `consigna` | texto | sí | No vacía, de hasta 500 |
| | `commits` | lista de `{ nombre, padres }` | sí | Entre 2 y 10, **del más antiguo al más nuevo**. A lo más 6 columnas (ver abajo) |
| | `commits[].nombre` | texto | sí | No vacío, de una línea, de hasta 4. Se guarda recortado. No se repite |
| | `commits[].padres` | lista de enteros | sí | Índices en `commits`, menores que el del commit. El primero tiene `[]`; los demás, uno o dos, distintos |
| | `ramas` | lista de `{ nombre, commit }` | sí | Entre 0 y 4, en el orden del autor (ordena las filas) |
| | `ramas[].nombre` | texto | sí | No vacío, de una línea, de hasta 20. Se guarda recortado. No se repite. No es `HEAD` |
| | `ramas[].commit` | entero | sí | Índice en `commits` |
| | `head` | `{ rama }` o `{ commit }` | no | Un solo campo: un índice en `ramas` o en `commits` |
| | `respuesta` | entero | sí | Índice en `commits` |
| | `explicacion` | texto | no | Si está, no vacía, de hasta 500 |

- "No vacío": recortado, tiene al menos un carácter. Un campo que el tipo no
  tiene se rechaza. "De una línea": sin `\n` ni `\r` (F12).
- Las respuestas viajan al cliente, que califica sin volver a pedir nada
  (research de F03, punto 2). Por eso el servidor no puede confiar en los
  aciertos que mande el cliente: F04 solo comprueba que el resultado cuadre
  con la lección (ver Progreso), y F08 decide si eso basta para los puntos.
- Qué tipos son preguntas lo dice `CALIFICA_ACTIVIDAD` en el contrato (F04):
  `opcionMultiple`, `completarEspacios`, `preguntaAbierta`, `emparejar`,
  `clasificar`, `ordenar`, `bancoPalabras`, `retoCodigo`, `terminalSimulada` y
  `grafoCommits`, diez en total. Con esa constante cuentan las preguntas el backend y
  los dos clientes.
- En el banco de palabras tiene que haber una forma de llenar todos los espacios
  usando cada ficha una sola vez; una ficha se compara por su texto exacto. Sin
  consigna, los clientes usan `CONSIGNA_POR_DEFECTO` (F11).
- Los repetidos se comparan recortados, respetando las mayúsculas. Lo que se guarda
  conserva sus espacios al inicio, que en `ordenar` son la sangría de una línea de
  código (F11).
- Los comandos de la terminal no se repiten: se comparan recortados, con cada racha
  de espacios como una y con `“ ” „ ‟` como `"`, `‘ ’ ‚ ‛` como `'`, `—` como `--` y
  `…` como `...`, respetando las mayúsculas (`git init` y `git  init` son el mismo;
  `git init` y `Git init`, no). Se guardan como los escribió el autor, solo recortados
  (F12).
- En el grafo, los commits se apuntan **por índice** (los padres, las ramas, HEAD y la
  respuesta), del más antiguo al más nuevo: un padre siempre va antes que su hijo, así
  que no hay ciclos y solo el primero no tiene padres. El acomodo (columnas por
  generaciones y una fila por rama) no se guarda: lo calcula cada cliente. Las columnas
  se cuentan igual en el servidor: el primero va en la 0 y cada uno de los demás en 1
  más la mayor de sus padres; no pasan de 6 (`columnasGrafoMax`). Una rama llamada
  `HEAD` se rechaza respetando las mayúsculas: `head` sí vale (F12).
- El código inicial, la solución y las salidas se guardan tal como se escribieron, con
  su sangría (F12).
- Falta un tipo del prototipo, escuchar y repetir, que llega con F14. El glosario de
  cada actividad llega con F09.
- Las longitudes cuentan caracteres Unicode. Los límites están en
  `LIMITES_ACTIVIDADES` (F05).

Detalle en
[`features/F03-cursar-leccion/data-model.md`](./features/F03-cursar-leccion/data-model.md).
Los tipos de relacionar, en
[`features/F11-actividades-relacionar/data-model.md`](./features/F11-actividades-relacionar/data-model.md).
Los de código y terminal, en
[`features/F12-actividades-codigo-terminal/data-model.md`](./features/F12-actividades-codigo-terminal/data-model.md).

### Progreso (F04)

Que un alumno completó una lección, con el resultado de la última vez. Hay a
lo sumo uno por alumno y lección: repetir la lección reemplaza el resultado y
la fecha. Tabla `progreso`; en el contrato, `ProgresoLeccion` (dentro de cada
`LeccionDelCurso` del detalle) y `CursoEmpezado`.

| Campo (contrato) | Columna (`progreso`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| — | `id_usuario` | texto | sí | → `user.id`; se borra con el usuario. Siempre el de la sesión: no viaja por la API |
| — | `id_leccion` | texto | sí | → `leccion.id`; se borra con la lección (y así con su curso) |
| `aciertos` | `aciertos` | entero | sí | Entre 0 y `preguntas` |
| `preguntas` | `preguntas` | entero | sí | Las preguntas que tenía la lección al completarla, contadas con `CALIFICA_ACTIVIDAD`. 0 en una lección sin preguntas |
| `completadaEn` | `completada_en` | fecha (ISO 8601 en la API) | sí | La última vez que la completó; la pone el servidor. Ordena los cursos empezados |
| — | `creado_en` | fecha | sí | La primera vez que la completó |

- **Clave primaria** `(id_usuario, id_leccion)`, sin `id` propio. **Índice**
  en `id_leccion`. Una restricción `CHECK` (`progreso_resultado_valido`)
  exige `0 <= aciertos <= preguntas`.
- Solo se escribe al completar una lección que se puede abrir (curso
  publicado y lección de ese curso, como en F03), y solo si `preguntas` es el
  número de preguntas que la lección tiene hoy y `aciertos <= preguntas`. No
  se recalifican las respuestas. Escribir es un `upsert`: dos escrituras casi
  al mismo tiempo dejan la última.
- Cada alumno lee solo sus filas; el autor de un curso no ve el progreso de
  sus alumnos.
- **Lecciones completadas de un curso**: las filas del alumno en lecciones de
  ese curso. Como la fila se borra con la lección, cuentan solo las
  lecciones que el curso tiene hoy.
- **Curso empezado**: un curso publicado con al menos una fila del alumno.
  Un curso que deja de estar publicado no aparece, pero sus filas se quedan:
  si vuelve a publicarse, el progreso sigue ahí.
- El curso no se guarda: sale de la lección.

Detalle, la migración y lo que viaja en el contrato en
[`features/F04-registrar-progreso/data-model.md`](./features/F04-registrar-progreso/data-model.md).

## Entidades previstas

Salen del prototipo (ver `docs/prototipo.md`). Sus campos se definen en la
spec de cada feature.

| Entidad | Qué representa | Feature |
|---|---|---|
| Actividad: escuchar y repetir | El último tipo del prototipo | F14 |
| Curso: lo que falta | El idioma (F07) y la configuración de gamificación (F08) | F07, F08 |
| Puntos / Insignia | Recompensas de un usuario en un curso | F08 |
| EntradaGlosario | Término y definición, derivados de lecciones completadas o agregados por el alumno | F09 |
