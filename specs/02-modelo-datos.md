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

### Curso (F02, F05, F06, F13, F14)

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
| `idPortada` (`ResumenCurso`, `CursoDelAutor`) · `portada` (`CursoEnEditor`) | `id_portada` | texto | no | → `imagen.id`, de este mismo curso y no GIF (lo comprueba el servicio). `ON DELETE SET NULL`. `portada` es la **Imagen** completa (el editor muestra su tamaño y su peso); las tarjetas solo reciben su id (F13) |
| `idioma` (`DetalleCurso`, `CursoEnEditor`) | `idioma` | texto | sí | Uno de `IDIOMAS_CURSO`: `es`, `en`, `fr`, `pt`, `de`, `it`, `ja`, `zh` o `ko`. Por defecto `es` (los cursos de antes de F14 quedaron así). `CHECK` `curso_idioma_valido`. Es el de la voz que lee las frases de escuchar y repetir; no ordena ni filtra el catálogo, y `ResumenCurso` no lo trae. Se cambia en los datos del curso del mapa (`CuerpoDatosCurso.idioma?`, sin él no cambia) (F14) |
| `pesoArchivos` (`CursoEnEditor`) | — | entero | sí | No se guarda: la suma de `peso` de sus imágenes y sus audios, usados o no, en bytes. Hasta 200 MB (`LIMITES_ARCHIVOS.pesoCursoMax`), comprobado al subir cualquiera de los dos (F13; antes `pesoImagenes`, F14) |
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
- **La portada generada no se guarda**: un curso sin `id_portada` la muestra, y
  cada cliente la calcula (la inicial del título sobre uno de 8 colores elegido
  por el `id`), así que no cambia si se corrige el título. También es la que se
  ve si su imagen no carga (F13). Regla en
  [`features/F02-explorar-catalogo/research.md`](./features/F02-explorar-catalogo/research.md),
  punto 7.
- Eliminar un curso borra también sus imágenes (F13) y sus audios (F14).

### Leccion (F02, F05, F13, F14)

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
| — | `imagenes` | lista de textos (`text[]`) | sí | Por defecto `{}`. Los ids de las imágenes que usan sus actividades, sin repetir. Lo escribe `guardarLeccion` con las actividades; no viaja por la API (F13) |
| — | `audios` | lista de textos (`text[]`) | sí | Lo mismo con los audios (F14) |
| `idioma` (`DetalleLeccion`, `LeccionEnEditor`) | — | texto | sí | No se guarda: el `idioma` de su curso, para la voz y los lectores de pantalla (F14) |
| — | `creado_en`, `actualizado_en` | fecha | sí | |

- Los archivos que usan sus actividades, imágenes y audios, pesan entre todos y sin
  repetir hasta 25 MB (`LIMITES_ARCHIVOS.pesoLeccionMax`). Lo comprueba `guardarLeccion`
  (F13, F14).

Detalle de las dos tablas, la migración y la búsqueda en
[`features/F02-explorar-catalogo/data-model.md`](./features/F02-explorar-catalogo/data-model.md).
Lo que agrega el editor, en
[`features/F05-crear-editar-curso/data-model.md`](./features/F05-crear-editar-curso/data-model.md).
Los estados de un curso, en
[`features/F06-publicar-curso/data-model.md`](./features/F06-publicar-curso/data-model.md).

### Imagen (F13)

Archivo de imagen de un curso: la portada o una imagen de sus actividades. Tabla
`imagen`; en el contrato, `Imagen` (sin los bytes), y dentro de una actividad,
`ImagenActividad` (la `Imagen` y su texto alternativo).

| Campo (contrato) | Columna (`imagen`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | UUID v7, lo genera la base |
| — | `id_curso` | texto | sí | → `curso.id`; se borra con el curso |
| — | `huella` | texto | sí | SHA-256 de `datos`, en hexadecimal. **Única** por curso (`id_curso`, `huella`): el mismo archivo subido dos veces al mismo curso es la misma imagen |
| `formato` | `formato` | texto | sí | `jpeg`, `png`, `webp` o `gif` (`FORMATOS_IMAGEN`) |
| `ancho`, `alto` | `ancho`, `alto` | entero | sí | En px, mayores que 0. Sin GIF, hasta 1600 (`LIMITES_IMAGENES.ladoMax`) |
| `peso` | `peso` | entero | sí | En bytes, igual a la longitud de `datos`. Hasta 10 MB; un GIF, hasta 5 MB |
| — | `datos` | bytes (`bytea`) | sí | El archivo tal como se subió. Solo lo lee `GET /imagenes/:idImagen` (decisión 0016) |
| — | `subida_en` | fecha | sí | Por defecto, el momento de subirla. Se renueva si se sube otra vez el mismo archivo |

- **Restricción** `imagen_valida` (`CHECK`): el formato, las medidas y el peso de arriba.
- Al subirla, el servidor lee el formato real del archivo (no el que dice el cliente) y
  rechaza una foto con datos ocultos (EXIF, XMP o IPTC) o animada (PNG o WebP). El nombre
  del archivo no se guarda.
- **Se usa** si su id está en `imagenes` de alguna lección del curso o es su
  `curso.id_portada`. Se ve si el curso está publicado, o si quien la pide es su autor;
  si no, da la misma respuesta que una que no existe.
- **Se borra**: al guardar una lección, al cambiar la portada o al eliminar una lección,
  si la dejó de usar y nada más del curso la usa; un día después de `subida_en` si nada
  la usa; y con su curso.

### Audio (F14)

Archivo de audio de un curso: el de la frase de un escuchar y repetir. Tabla `audio`; en
el contrato, `Audio` (sin los bytes). Sigue las reglas de **Imagen**.

| Campo (contrato) | Columna (`audio`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | UUID v7, lo genera la base |
| — | `id_curso` | texto | sí | → `curso.id`; se borra con el curso |
| — | `huella` | texto | sí | SHA-256 de `datos` (el audio ya limpio), en hexadecimal. **Única** por curso (`id_curso`, `huella`) |
| `formato` | `formato` | texto | sí | `mp3`, `m4a` o `wav` (`FORMATOS_AUDIO`) |
| `duracion` | `duracion` | entero | sí | En milisegundos, mayor que 0 y hasta 30 049 (30 s redondeados a décimas, `LIMITES_AUDIOS.duracionMax`) |
| `peso` | `peso` | entero | sí | En bytes, igual a la longitud de `datos`. Hasta 5 MB (`LIMITES_AUDIOS.pesoMax`) |
| — | `datos` | bytes (`bytea`) | sí | El audio sin sus datos ocultos. Solo lo lee `GET /audios/:idAudio` (decisión 0017) |
| — | `subida_en` | fecha | sí | Por defecto, el momento de subirlo. Se renueva si se sube otra vez el mismo audio |

- **Restricción** `audio_valido` (`CHECK`): el formato, la duración y el peso de arriba.
- Al subirlo, el servidor lee el formato real y la duración de los bytes, y le quita los
  datos ocultos sin volver a comprimir el sonido: de un MP3 quedan solo sus cuadros; de un
  WAV, `fmt ` y `data`; de un M4A, la pista de sonido sin `udta`, `meta` ni las demás
  pistas. Solo acepta lo que se oye en todos los clientes: MP3 de capa III, WAV PCM entero
  de 1 o 2 canales, de 8, 16 o 24 bits y de 8 000 a 48 000 Hz, y M4A con una sola pista de
  AAC. El nombre del archivo no se guarda.
- **Se usa** si su id está en `audios` de alguna lección del curso (un audio no es
  portada). Se oye si el curso está publicado, o si quien lo pide es su autor; si no, da la
  misma respuesta que uno que no existe.
- **Se borra**: al guardar o eliminar una lección, si la dejó de usar y nada más del curso
  lo usa; un día después de `subida_en` si nada lo usa; y con su curso.

### Actividad (F03, F05, F11, F12, F13, F14)

Ejercicio o bloque de teoría de una lección. No tiene tabla ni `id`: es un
elemento de `leccion.actividades`, y su lugar en la lista es su orden. En el
contrato, la unión `Actividad`, distinguida por `tipo`. La base no comprueba
su forma: el backend la valida antes de guardarla.

| Tipo (`tipo`) | Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `teoria` | `titulo` | texto | no | Si está, no vacío, de hasta 100. Se guarda recortado |
| | `texto` | texto | sí | No vacío, de hasta 5000. Párrafos separados por un renglón en blanco. De 0 a 5 marcas `[imagen]` (`MARCA_IMAGEN`, `imagenesTeoriaMax`), escritas así; al cursar, cada una parte su párrafo y su imagen va en ese lugar (F13) |
| | `codigo` | texto | no | Si está, no vacío, de hasta 2000. Las líneas con `+`, `-` o `@@` se leen como diff |
| | `puntosClave` | lista de textos | no | Si está, de 1 a 10; cada uno no vacío, de hasta 200 |
| | `imagenes` | lista de `ImagenActividad` | no | Una por marca, en orden. Sin marcas, no está (F13) |
| `tarjeta` | `frente` | texto | sí | No vacío, de hasta 200 |
| | `reverso` | texto | sí | No vacío, de hasta 1000 |
| `opcionMultiple` | `pregunta` | texto | sí | No vacía, de hasta 500 |
| | `imagen` | `ImagenActividad` | no | La de la pregunta (F13) |
| | `codigo` | texto | no | Igual que en `teoria` |
| | `opciones` | lista de `{ texto }`, `{ simbolo }` o `{ imagen }` | sí | Entre 2 y 9, **todas de la misma forma**. Cada texto no vacío, de hasta 200; cada símbolo, de hasta 4. No se repiten: los textos se comparan recortados, respetando las mayúsculas, y las imágenes por su id (F13) |
| | `correcta` | entero | sí | Índice en `opciones`: exactamente una correcta |
| `completarEspacios` | `texto` | texto | sí | De hasta 2000, con 1 a 20 `___` (`MARCA_ESPACIO`) |
| | `espacios` | lista de `{ aceptadas }` | sí | Uno por cada `___`. De 1 a 10 aceptadas por espacio, no vacías y de hasta 100 caracteres; la primera es la que se muestra como esperada |
| `preguntaAbierta` | `pregunta` | texto | sí | No vacía, de hasta 500 |
| | `solucion` | texto | sí | No vacía, de hasta 2000 |
| `emparejar` | `consigna` | texto | no | Si está, no vacía, de hasta 500 |
| | `parejas` | lista de `{ izquierda, derecha }` | sí | Entre 3 y 8, en el orden del autor. Cada lado es un texto o una `ImagenActividad`, y toda una columna es de textos o de imágenes (F13). Cada texto no vacío, de hasta 200. No se repite en su columna |
| `clasificar` | `consigna` | texto | no | Si está, no vacía, de hasta 500 |
| | `categorias` | lista de textos | sí | Entre 2 y 4, en el orden del autor. Cada una no vacía, de hasta 100. No se repiten |
| | `elementos` | lista de `{ texto, categoria }` o `{ imagen, categoria }` | sí | Entre 2 y 12, todos de la misma forma (F13). `texto`, no vacío, de hasta 100; ni un texto ni una imagen se repiten. `categoria`, índice en `categorias`. Toda categoría tiene al menos un elemento |
| `ordenar` | `consigna` | texto | sí | No vacía, de hasta 500 |
| | `elementos` | lista de textos o de `ImagenActividad` | sí | Entre 3 y 10, **en el orden correcto**, todos de la misma forma (F13). Cada texto no vacío, de hasta 200. No se repiten |
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
| `escucharRepetir` | `frase` | texto | sí | No vacía, de una línea, de hasta 200 (`fraseMax`). Se guarda recortada (F14) |
| | `mostrarTexto` | booleano | sí | `true`: el alumno ve la frase desde el inicio; `false`: al comprobar, o en cuanto se sabe que no se puede oír |
| | `audio` | `Audio` | no | Un **Audio** del mismo curso; al guardar, el servidor reescribe `formato`, `duracion` y `peso` con los de la base. Sin él, la frase se lee con la voz del dispositivo en el idioma del curso |

- "No vacío": recortado, tiene al menos un carácter. Un campo que el tipo no
  tiene se rechaza. "De una línea": sin `\n` ni `\r` (F12).
- Toda imagen de una actividad es una `ImagenActividad`: el `id` de una **Imagen** del
  mismo curso (al guardar, el servidor reescribe `formato`, `ancho`, `alto` y `peso` con
  los de la base) y un `textoAlternativo` opcional que, si está, es no vacío, de una
  línea, de hasta 200 (`textoAlternativoMax`), y se guarda recortado. Una actividad con
  imágenes cuenta igual que una de texto, y una sin imágenes tiene la misma forma que
  antes de F13. El banco de palabras no lleva imágenes (F13).
- Las respuestas viajan al cliente, que califica sin volver a pedir nada
  (research de F03, punto 2). Por eso el servidor no puede confiar en los
  aciertos que mande el cliente: F04 solo comprueba que el resultado cuadre
  con la lección (ver Progreso), y F08 decide si eso basta para los puntos.
- Qué tipos son preguntas lo dice `CALIFICA_ACTIVIDAD` en el contrato (F04):
  `opcionMultiple`, `completarEspacios`, `preguntaAbierta`, `emparejar`,
  `clasificar`, `ordenar`, `bancoPalabras`, `retoCodigo`, `terminalSimulada`,
  `grafoCommits` y `escucharRepetir` (F14: se acierta si el alumno elige "Lo dije bien"),
  once en total. Con esa constante cuentan las preguntas el backend y los dos clientes.
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
- Con escuchar y repetir (F14) están los 13 tipos del prototipo. Su `lang` por actividad
  no pasó: el idioma es del curso. El glosario de cada actividad llega con F09.
- Las longitudes cuentan caracteres Unicode. Los límites están en
  `LIMITES_ACTIVIDADES` (F05).

Detalle en
[`features/F03-cursar-leccion/data-model.md`](./features/F03-cursar-leccion/data-model.md).
Los tipos de relacionar, en
[`features/F11-actividades-relacionar/data-model.md`](./features/F11-actividades-relacionar/data-model.md).
Los de código y terminal, en
[`features/F12-actividades-codigo-terminal/data-model.md`](./features/F12-actividades-codigo-terminal/data-model.md).
Las imágenes, en
[`features/F13-imagenes-propias/data-model.md`](./features/F13-imagenes-propias/data-model.md).
Escuchar y repetir, los audios y el idioma del curso, en
[`features/F14-escuchar-repetir/data-model.md`](./features/F14-escuchar-repetir/data-model.md).

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
| Curso: lo que falta | La configuración de gamificación (el idioma llegó con F14) | F08 |
| Puntos / Insignia | Recompensas de un usuario en un curso | F08 |
| EntradaGlosario | Término y definición, derivados de lecciones completadas o agregados por el alumno | F09 |
