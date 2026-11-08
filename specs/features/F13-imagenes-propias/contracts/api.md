# API: F13 Imágenes propias en los cursos

Dos rutas nuevas: subir una imagen a un curso y traer una imagen. Las demás no cambian de
ruta, pero sus cuerpos llevan imágenes ([contrato.md](./contrato.md)). Los mensajes están
en `MENSAJES_IMAGENES` y `MENSAJES_EDITOR`.

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| POST | `/editor/cursos/:idCurso/imagenes` | Su autor, con el curso en borrador | **Nueva.** Sube una imagen al curso |
| GET | `/imagenes/:idImagen` | Con sesión: su autor, o cualquiera si el curso está publicado | **Nueva.** Los bytes de la imagen |
| PUT | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Valida las imágenes de las actividades, el peso de la lección y borra las que dejó de usar |
| DELETE | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Borra también las imágenes de la lección que nada más usa |
| PUT | `/editor/cursos/:idCurso` | Su autor, sin publicar | Acepta `idPortada` |
| GET | `/editor/cursos/:idCurso` (y los que responden `CursoEnEditor`) | Su autor | Trae `portada` y `pesoImagenes` |
| GET | `/cursos`, `/cursos/:idCurso`, `/usuarios/yo/cursos-empezados`, `/usuarios/yo/cursos` | Con sesión | Cada curso trae `idPortada` |
| GET | `/cursos/:idCurso/lecciones/:idLeccion`, `/editor/cursos/:idCurso/lecciones/:idLeccion` | Como en F03 y F05 | Las actividades pueden traer imágenes |

## POST `/editor/cursos/:idCurso/imagenes`

Sube una imagen. El cuerpo es el archivo, sin JSON ni `multipart`:

```http
POST /editor/cursos/0193.../imagenes
Content-Type: image/webp

<bytes>
```

- `Content-Type`: `image/jpeg`, `image/png`, `image/webp` o `image/gif`. El formato que
  cuenta es el de los bytes (research.md, punto 3).
- Lo lee `express.raw` con `limit` de 10 MB, solo en esta ruta.

**Orden**: sesión (401) → tamaño del cuerpo (413) → formato y lectura (400) → peso del GIF,
lados y datos ocultos (400) → curso (404 y 403) → espacio (400).

| Estado | Cuerpo | Cuándo |
|---|---|---|
| `201` | `RespuestaImagen` | Imagen nueva |
| `200` | `RespuestaImagen` | El curso ya tenía ese mismo archivo (misma huella): se devuelve esa imagen y se renueva su `subida_en` |
| `401` | `{ error: "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión |
| `413` | `{ error: "La imagen puede pesar hasta 10 MB." }` | Cuerpo de más de 10 MB |
| `400` | `{ error: "Elige una imagen JPEG, PNG, WebP o GIF." }` | Sin cuerpo, o `Content-Type` que no es de los cuatro |
| `400` | `{ error: "No se pudo leer la imagen. Elige otra." }` | Los bytes no son una imagen de los cuatro formatos, o su cabecera está cortada |
| `400` | `{ error: "Un GIF puede pesar hasta 5 MB." }` | GIF de más de 5 MB |
| `400` | `{ error: "La imagen puede medir hasta 1600 px por lado." }` | JPEG, PNG o WebP de más de 1600 px de ancho o de alto (la web nunca lo manda) |
| `400` | `{ error: "La imagen trae datos ocultos o una animación. Súbela desde el editor de Brote." }` | JPEG con un bloque `APP1` (EXIF o XMP) o `APP13` (IPTC); PNG con un bloque `eXIf`, `tEXt`, `zTXt`, `iTXt` o `acTL` (animado); WebP con un bloque `EXIF`, `XMP ` o `ANIM`. La web nunca lo manda: vuelve a codificar cada foto (research.md, punto 4). Los GIF no se revisan |
| `404` | `{ error: "Este curso ya no existe. Tus cambios no se guardaron." }` | El curso no existe o es de otro |
| `403` | `{ error: "Este curso está publicado y no se puede editar. Tus cambios no se guardaron." }` | Publicado |
| `403` | `{ error: "Este curso está en revisión y no se puede editar. Tus cambios no se guardaron." }` | En revisión |
| `400` | `{ error: "Este curso ya tiene 200 MB de imágenes. Quita alguna y guarda para hacer espacio." }` | La suma de sus imágenes, con esta, pasaría de 200 MB. Antes de sumar se borran las que nada usa desde hace más de un día |

```json
{
  "imagen": { "id": "0193a2b4-...", "formato": "webp", "ancho": 1600, "alto": 1200, "peso": 421888 }
}
```

`peso` en bytes. La web muestra "1600 × 1200 px · 412 KB".

## GET `/imagenes/:idImagen`

Los bytes de una imagen, para un `<img>` en la web y `expo-image` en el móvil.

- **Quién**: con sesión (cookie en la web, `Authorization: Bearer` con `X-Cliente: movil` en
  el móvil). Responde si el curso de la imagen está publicado o si quien pide es su autor.
- **No se valida el id**: uno inventado es un `404` como cualquier otro.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| `200` | Los bytes | Con las cabeceras de abajo |
| `304` | — | `If-None-Match` coincide con su `ETag` |
| `401` | `{ error: "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión |
| `404` | `{ error: "Esta imagen no existe o ya no está disponible." }` | No existe, o su curso no está publicado y quien pide no es su autor. El mismo mensaje en los dos casos |

Cabeceras de un `200`:

```http
Content-Type: image/webp
Content-Length: 421888
Cache-Control: private, max-age=31536000, immutable
ETag: "9f86d081884c7d65..."
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'none'; sandbox
```

Una imagen nunca cambia (otro archivo es otra imagen), por eso la caché es de un año. Si
el curso deja de estar publicado, quien ya la tenía en caché puede seguir viéndola ahí.

## PUT `/editor/cursos/:idCurso/lecciones/:idLeccion` (cambia)

Cuerpo: `CuerpoGuardarLeccion`, como en F05. Las actividades pueden traer imágenes:

```json
{
  "titulo": "Figuras",
  "version": 3,
  "actividades": [
    {
      "tipo": "teoria",
      "texto": "Mira esta figura:\n\n[imagen]",
      "imagenes": [
        { "id": "0193a2b4-...", "formato": "png", "ancho": 400, "alto": 400, "peso": 2048, "textoAlternativo": "  Círculo rojo  " }
      ]
    },
    {
      "tipo": "opcionMultiple",
      "pregunta": "¿Cuál es el cuadrado?",
      "opciones": [
        { "imagen": { "id": "0193a2b4-...", "formato": "png", "ancho": 400, "alto": 400, "peso": 2048 } },
        { "imagen": { "id": "0193a2c9-...", "formato": "png", "ancho": 400, "alto": 400, "peso": 1980 } }
      ],
      "correcta": 1
    }
  ]
}
```

**Orden**: el de F05 (sesión, cuerpo, curso, lección, versión) y, al final, las imágenes,
que necesitan la base:

1. `validarActividades` (en la ruta) comprueba la forma: cada imagen con su `id` (texto no
   vacío), su `formato`, `ancho`, `alto` y `peso` (enteros mayores que 0) y su
   `textoAlternativo` opcional; una imagen por marca en la teoría; la misma forma en todas
   las opciones, en cada columna de emparejar y en los elementos de clasificar y ordenar; y
   sin ids repetidos en cada grupo. Lo que no cumple es el `400` de F05 con
   `campos["actividades.N"]`.
2. `guardarLeccion` (en el servicio, con el curso bloqueado):
   - Cada id tiene que ser una imagen **de este curso**. Si alguno no lo es (no existe, se
     borró o es de otro curso), no guarda nada y responde:

     ```json
     {
       "error": "Revisa los datos marcados.",
       "campos": {
         "actividades.1": "actividad 2 (opcionMultiple): una imagen ya no está",
         "imagenes.0193a2c9-...": "Esta imagen ya no está. Elige otra."
       }
     }
     ```

     `400`, con la primera actividad que la usa y una clave `imagenes.<id>` por cada imagen
     que falta. El editor selecciona esa actividad y marca los campos con ese id.
   - Las imágenes de la lección, sin repetir ids, pesan hasta 25 MB. Si no, `400` con
     `{ "error": "Las imágenes de esta lección pesan más de 25 MB. Quita alguna." }`.
   - Reescribe `formato`, `ancho`, `alto` y `peso` de cada imagen con los de la base, y
     guarda el texto alternativo recortado.
   - Guarda las actividades y `imagenes` (los ids), sube la `version` y borra las imágenes
     que la lección tenía y ya no, si nada más del curso las usa.

**Respuesta**: `200` con `RespuestaLeccionEnEditor`, ya con los datos de la base en cada
imagen.

## DELETE `/editor/cursos/:idCurso/lecciones/:idLeccion` (cambia)

Igual que en F05 (`204`). Además, en la misma transacción, borra las imágenes de la lección
que no usa otra lección del curso ni la portada.

## PUT `/editor/cursos/:idCurso` (cambia)

Cuerpo: `CuerpoDatosCurso`, que gana `idPortada`, opcional:

| `idPortada` | Qué pasa |
|---|---|
| no está | La portada no cambia (así sigue funcionando "Nuevo curso", que no la manda) |
| `null` | Se quita: vuelve la generada |
| un id | Tiene que ser una imagen de este curso y no GIF |

| Estado | Cuerpo | Cuándo |
|---|---|---|
| `200` | `RespuestaCursoEnEditor` | Guardado. Si la portada cambió, la anterior se borra si nada más la usa |
| `400` | `{ error: "Revisa los datos marcados.", campos: { portada: "Esta imagen ya no está. Elige otra." } }` | El id no es una imagen del curso |
| `400` | `{ error: "Revisa los datos marcados.", campos: { portada: "La portada puede ser JPEG, PNG o WebP." } }` | Es un GIF |

Los demás errores, los de F05 y F06. `POST /editor/cursos` ignora `idPortada`: un curso
nuevo no tiene imágenes.

## Lo que traen los cursos (cambia)

- `ResumenCurso` (catálogo, detalle, cursos empezados) y `CursoDelAutor` ("Cursos que
  creé"): `idPortada`, el id de la imagen o `null`. La dirección es
  `URL_API + RUTA_IMAGENES + "/" + idPortada`.
- `CursoEnEditor`: `portada` (la `Imagen` completa, o `null`) y `pesoImagenes`, la suma de
  sus imágenes en bytes.

```json
{
  "curso": {
    "id": "0193...",
    "titulo": "Actividades de prueba",
    "portada": { "id": "0193a2f0-...", "formato": "png", "ancho": 1600, "alto": 900, "peso": 30211 },
    "pesoImagenes": 1843200,
    "...": "lo de F05 y F06"
  }
}
```

## Lo que se comprueba con curl

La sección 2 de [quickstart.md](../quickstart.md) prueba cada fila de estas tablas.
