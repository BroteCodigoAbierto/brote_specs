# API: F14 Escuchar y repetir, con audio propio

Dos rutas nuevas, como las de imágenes de F13: subir un audio a un curso y traer un audio.
Las demás no cambian de ruta, pero sus cuerpos llevan el idioma y el tipo nuevo
([contrato.md](./contrato.md)). Los mensajes están en `MENSAJES_AUDIOS`,
`MENSAJES_ARCHIVOS` y `MENSAJES_EDITOR`.

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| POST | `/editor/cursos/:idCurso/audios` | Su autor, con el curso en borrador | **Nueva.** Sube un audio al curso, sin sus datos ocultos |
| GET | `/audios/:idAudio` | Con sesión: su autor, o cualquiera si el curso está publicado | **Nueva.** Los bytes del audio |
| PUT | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Valida `escucharRepetir`, sus audios y el peso de la lección con imágenes y audios; borra los audios que dejó de usar |
| DELETE | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Borra también los audios de la lección que nada más usa |
| POST, PUT | `/editor/cursos`, `/editor/cursos/:idCurso` | Con sesión / su autor, sin publicar | Aceptan `idioma` |
| GET | `/editor/cursos/:idCurso` (y los que responden `CursoEnEditor`) | Su autor | Traen `idioma` y `pesoArchivos` (antes `pesoImagenes`) |
| GET | `/cursos/:idCurso` | Con sesión | El detalle trae `idioma` |
| GET | `/cursos/:idCurso/lecciones/:idLeccion`, `/editor/cursos/:idCurso/lecciones/:idLeccion` | Como en F03 y F05 | La lección trae `idioma`; sus actividades pueden ser `escucharRepetir` |
| POST | `/editor/cursos/:idCurso/imagenes` | Como en F13 | El espacio cuenta también los audios, con el mensaje nuevo |

## POST `/editor/cursos/:idCurso/audios`

Sube un audio. El cuerpo es el archivo, sin JSON ni `multipart`:

```http
POST /editor/cursos/0193.../audios
Content-Type: audio/mpeg

<bytes>
```

- `Content-Type`: uno de `TIPOS_MIME_AUDIO_SUBIDA`. El formato que cuenta es el de los
  bytes (research.md, punto 3).
- Lo lee `express.raw` con `limit` de 5 MB, solo en esta ruta.
- Se guarda **limpio**: sin etiquetas ID3 ni APE, sin los bloques de texto de un WAV y sin
  `udta` ni `meta` en un M4A (research.md, punto 4). `peso` y la huella son los del audio
  limpio.

**Orden**: sesión (401) → tamaño del cuerpo (413) → formato (400) → lectura (400) →
duración (400) → curso (404 y 403) → espacio (400).

| Estado | Cuerpo | Cuándo |
|---|---|---|
| `201` | `RespuestaAudio` | Audio nuevo |
| `200` | `RespuestaAudio` | El curso ya tenía ese mismo audio (misma huella, ya limpio): se devuelve ese y se renueva su `subida_en` |
| `401` | `{ error: "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión |
| `413` | `{ error: "El audio puede pesar hasta 5 MB." }` | Cuerpo de más de 5 MB |
| `400` | `{ error: "Elige un audio MP3, M4A o WAV." }` | Sin cuerpo, o `Content-Type` que no es de la lista (`audio/ogg`, `audio/flac`, `video/mp4`) |
| `400` | `{ error: "No se pudo leer el audio. Elige otro." }` | Los bytes no son un MP3, un M4A ni un WAV (un texto, un OGG que se dice MP3), están cortados, o guardan el sonido de una forma que no se oye en todos los clientes: MP3 de capa I o II, WAV que no es PCM entero de 8, 16 o 24 bits, de 1 o 2 canales y de 8 000 a 48 000 Hz, M4A que no es AAC (ALAC, Opus), fragmentado, con más de una pista de sonido o con video. Las pistas que no son de sonido ni de video se descartan al limpiar |
| `400` | `{ error: "El audio puede durar hasta 30 segundos." }` | Dura más de 30 s, redondeado a décimas |
| `404` | `{ error: "Este curso ya no existe. Tus cambios no se guardaron." }` | El curso no existe o es de otro |
| `403` | `{ error: "Este curso está publicado y no se puede editar. Tus cambios no se guardaron." }` | Publicado |
| `403` | `{ error: "Este curso está en revisión y no se puede editar. Tus cambios no se guardaron." }` | En revisión |
| `400` | `{ error: "Este curso ya tiene 200 MB de archivos. Quita alguno y guarda para hacer espacio." }` | Sus imágenes y audios, con este, pasarían de 200 MB. Antes de sumar se borran los archivos que nada usa desde hace más de un día |

```json
{
  "audio": { "id": "0193a2b4-...", "formato": "mp3", "duracion": 4012, "peso": 32640 }
}
```

`duracion` en ms y `peso` en bytes. La web muestra "0:04 · 32 KB".

## GET `/audios/:idAudio`

Los bytes de un audio. La web lo trae con `fetch` (`credentials: "include"`) y el móvil lo
descarga a su caché con `Authorization: Bearer` y `X-Cliente: movil`.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| `200` | Los bytes | Con las cabeceras de abajo |
| `304` | — | `If-None-Match` coincide con su `ETag` |
| `401` | `{ error: "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión |
| `404` | `{ error: "Este audio no existe o ya no está disponible." }` | No existe, o su curso no está publicado y quien pide no es su autor. El mismo mensaje en los dos casos |

Cabeceras de un `200`:

```http
Content-Type: audio/mpeg
Content-Length: 32640
Cache-Control: private, max-age=31536000, immutable
ETag: "<huella>"
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'none'; sandbox
```

Sin `Accept-Ranges`: los clientes traen el audio completo (research.md, punto 6).

## PUT `/editor/cursos/:idCurso/lecciones/:idLeccion` (cambia)

El cuerpo puede traer actividades `escucharRepetir`. Además de lo de F05 y F13:

| Estado | Cuerpo | Cuándo |
|---|---|---|
| `400` | `{ error: "Revisa los datos marcados.", campos: { "actividades.3": "actividad 4 (escucharRepetir): …" } }` | `frase` vacía, con salto de línea o de más de 200; `mostrarTexto` que no es booleano; `audio` sin `id` de texto; un campo que el tipo no tiene (`validarActividades`) |
| `400` | `{ error: "Revisa los datos marcados.", campos: { "actividades.3": "actividad 4 (escucharRepetir): un audio ya no está", "audios.<id>": "Este audio ya no está. Elige otro." } }` | Un audio que no existe o es de otro curso. Como con las imágenes: la primera actividad que lo usa y cada id que falta |
| `400` | `{ error: "Los archivos de esta lección pesan más de 25 MB. Quita alguno." }` | Sus imágenes y audios, sin repetir, pasan de 25 MB. Sin `campos` |

Al guardar, el servidor reescribe `formato`, `duracion` y `peso` de cada `audio` con los de
la base, llena `leccion.audios` y borra los audios que la lección dejó de usar si nada más
del curso los usa.

## POST `/editor/cursos/:idCurso/imagenes` (cambia)

Igual que en F13, salvo el espacio: cuenta imágenes y audios, y el mensaje es
`MENSAJES_ARCHIVOS.cursoLleno` ("Este curso ya tiene 200 MB de archivos. Quita alguno y
guarda para hacer espacio.").

## POST `/editor/cursos` y PUT `/editor/cursos/:idCurso` (cambian)

`idioma` es opcional. Si viene, tiene que ser uno de `IDIOMAS_CURSO`:

| Estado | Cuerpo | Cuándo |
|---|---|---|
| `400` | `{ error: "Revisa los datos marcados.", campos: { idioma: "Revisa los datos marcados." } }` | `idioma` que no es de la lista (lo ve solo quien salta la web: la lista no deja elegir otro) |

Sin `idioma`, el `PUT` no lo cambia y el `POST` crea el curso en `es`. La respuesta
(`CursoEnEditor`) trae `idioma` y `pesoArchivos`.

## GET `/cursos/:idCurso` y las lecciones (cambian)

- `DetalleCurso.idioma`: el del curso. El catálogo (`GET /cursos`) no cambia.
- `DetalleLeccion.idioma` y `LeccionEnEditor.idioma`: el de su curso.
