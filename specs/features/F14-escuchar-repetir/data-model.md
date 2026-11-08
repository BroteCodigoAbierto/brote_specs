# Modelo de datos: F14 Escuchar y repetir, con audio propio

Una tabla nueva (`audio`), una columna nueva en `curso` (`idioma`) y otra en `leccion`
(`audios`), en la migración `f14_escuchar_repetir`. Las actividades siguen en el JSON de
`leccion.actividades`, con un tipo nuevo. Por qué así: [research.md](./research.md),
puntos 1, 7 y 8.

## Audio (nueva)

Archivo de audio de un curso: el de la frase de un escuchar y repetir. Tabla `audio`; en el
contrato, `Audio` (sin los bytes). Sigue las reglas de **Imagen** (F13).

| Campo (contrato) | Columna (`audio`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | UUID v7, lo genera Prisma (`uuid(7)`) |
| — | `id_curso` | texto | sí | → `curso.id`; se borra con el curso (`ON DELETE CASCADE`) |
| — | `huella` | texto | sí | SHA-256 de `datos` (el audio ya limpio), en hexadecimal. **Única** por curso (`id_curso`, `huella`) |
| `formato` | `formato` | texto | sí | `mp3`, `m4a` o `wav` (`FORMATOS_AUDIO`). `CHECK` en la base |
| `duracion` | `duracion` | entero | sí | En milisegundos, mayor que 0 y hasta 30 049 (30 s redondeados a décimas, `LIMITES_AUDIOS.duracionMax`). `CHECK` en la base |
| `peso` | `peso` | entero | sí | En bytes, igual a la longitud de `datos`. Mayor que 0 y hasta 5 MB (`LIMITES_AUDIOS.pesoMax`). `CHECK` en la base |
| — | `datos` | bytes (`bytea`) | sí | El audio sin sus datos ocultos (research.md, punto 4). Solo lo lee `GET /audios/:idAudio` |
| — | `subida_en` | fecha | sí | Por defecto, el momento de subirlo. Se renueva si se sube otra vez el mismo audio. Decide cuándo se borra si nada lo usa |

- **Restricción** `audio_valido` (`CHECK`): el formato, la duración y el peso de arriba.
- **Se usa** si su id está en `audios` de alguna lección del curso. Un audio no es portada.
- **Se ve** si el curso está publicado, o si quien lo pide es su autor; si no, la misma
  respuesta que uno que no existe.
- **Se borra**: al guardar una lección o al eliminarla, si la lección lo tenía, lo dejó de
  tener y ninguna otra lección del curso lo usa; un día después de `subida_en` si nada lo
  usa (`limpiarAudiosSinUsar`); y con su curso.
- El nombre del archivo no se guarda. Se sirve con su `Content-Type` y nunca se interpreta.

## Curso (cambia)

| Campo (contrato) | Columna (`curso`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `idioma` (`DetalleCurso`, `CursoEnEditor`) | `idioma` | texto | sí | Uno de `IDIOMAS_CURSO`: `es`, `en`, `fr`, `pt`, `de`, `it`, `ja`, `zh` o `ko`. Por defecto `es`. `CHECK` `curso_idioma_valido`. La migración deja `es` en los que ya existen |
| `pesoArchivos` (`CursoEnEditor`) | — | entero | sí | No se guarda: la suma de `peso` de sus imágenes y sus audios, en bytes. Hasta 200 MB (`LIMITES_ARCHIVOS.pesoCursoMax`), comprobado al subir. Antes `pesoImagenes` (F13) |

- El idioma es el de la voz que lee las frases de escuchar y repetir. No ordena ni filtra
  el catálogo, y las tarjetas no lo traen (`ResumenCurso` no cambia).
- Se cambia en los datos del curso del mapa, como el título; `POST /editor/cursos` sin
  `idioma` crea el curso en `es`.

## Leccion (cambia)

| Campo (contrato) | Columna (`leccion`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `idioma` (`DetalleLeccion`, `LeccionEnEditor`) | — | texto | sí | No se guarda: el `idioma` de su curso, para la voz y los lectores de pantalla |
| — | `audios` | lista de textos (`text[]`) | sí | Por defecto `{}`. Los ids de los audios que usan sus actividades, sin repetir. Lo escribe `guardarLeccion` con las actividades; no viaja por la API |

- Los archivos que usan sus actividades (imágenes y audios) pesan, entre todos y sin
  repetir, hasta 25 MB (`LIMITES_ARCHIVOS.pesoLeccionMax`). Lo comprueba `guardarLeccion`.
- La migración deja `{}` en las lecciones que ya existen: ninguna tiene audios.

## Actividad (cambia)

Un tipo nuevo, el último del prototipo (`listen_and_repeat`):

| Tipo (`tipo`) | Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `escucharRepetir` | `frase` | texto | sí | No vacía, de una línea, de hasta 200 (`fraseMax`). Se guarda recortada |
| | `mostrarTexto` | booleano | sí | `true`: el alumno ve la frase desde el inicio; `false`: al comprobar (o si no se puede oír) |
| | `audio` | `Audio` | no | Un audio de este curso. Al guardar, el servidor reescribe `formato`, `duracion` y `peso` con los de la base. Sin él, la frase se lee con la voz del dispositivo en el idioma del curso |

- Es una pregunta: `CALIFICA_ACTIVIDAD.escucharRepetir = true`. Se acierta si el alumno
  elige "Lo dije bien". Los tipos que califican pasan a ser once.
- El `lang` de cada actividad del prototipo no pasa: el idioma es del curso.
- Un campo que el tipo no tiene se rechaza, como en todos.

## Progreso (no cambia)

Las lecciones con escuchar y repetir tienen una pregunta más por cada uno. En los cursos de
prueba, "Hiragana: las vocales" pasa de 2 a 3 y "Saludos", de 3 a 4 (spec, "Supuestos").

## Lo que se comprueba y dónde

| Regla | Web (al editar) | Servidor |
|---|---|---|
| Formato por tipo o extensión, peso, que se pueda abrir, duración | `prepararAudio` | — |
| Formato real, que se pueda leer y oír en todos los clientes, duración; quitar los datos ocultos | — | `leerAudio` y `comprobarAudioSubido`, al subir |
| Peso del archivo (5 MB) | `prepararAudio` | `express.raw` (`413`) |
| Espacio del curso (200 MB, imágenes y audios) | — | `subirAudio` y `subirImagen`, con el curso bloqueado |
| Frase, casilla, forma del audio | `validar` de `editorEscucharRepetir.ts` | `validarEscucharRepetir` (`validarActividades`) |
| Cada audio existe y es del curso; peso de la lección (25 MB, imágenes y audios) | el peso, `pesoArchivos` | `guardarLeccion` |
| Idioma del curso | `CampoSelector` con los nueve | `validarDatosCurso` y el `CHECK` |

## Al cerrar

`specs/02-modelo-datos.md` recibe:

- La entidad **Audio** (esta tabla).
- En **Curso**: `idioma` y `pesoArchivos` (en lugar de `pesoImagenes`); el espacio cuenta
  imágenes y audios.
- En **Leccion**: `audios`, el `idioma` que viaja con ella y el límite de 25 MB de archivos.
- En **Actividad**: la fila de `escucharRepetir`, los once tipos que califican y que ya no
  falta ningún tipo del prototipo.
- "Entidades previstas": quitar "Actividad: escuchar y repetir" y el idioma de "Curso: lo
  que falta" (llegó con F14, no con F07).
