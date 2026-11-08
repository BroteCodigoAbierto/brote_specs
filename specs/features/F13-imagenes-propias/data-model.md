# Modelo de datos: F13 Imágenes propias en los cursos

Una tabla nueva (`imagen`), una columna nueva en `curso` (`id_portada`) y otra en
`leccion` (`imagenes`), en la migración `f13_imagenes`. Las actividades siguen en el JSON
de `leccion.actividades`, con imágenes dentro. Por qué así: [research.md](./research.md),
puntos 1, 6 y 7.

## Imagen (nueva)

Archivo de imagen de un curso. Tabla `imagen`; en el contrato, `Imagen` (sin los bytes).

| Campo (contrato) | Columna (`imagen`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | UUID v7, lo genera Prisma (`uuid(7)`), como `curso` y `leccion` |
| — | `id_curso` | texto | sí | → `curso.id`; se borra con el curso (`ON DELETE CASCADE`) |
| — | `huella` | texto | sí | SHA-256 de `datos`, en hexadecimal. **Única** por curso (`id_curso`, `huella`) |
| `formato` | `formato` | texto | sí | `jpeg`, `png`, `webp` o `gif` (`FORMATOS_IMAGEN`). `CHECK` en la base |
| `ancho`, `alto` | `ancho`, `alto` | entero | sí | En px, mayores que 0. Sin GIF, hasta 1600 (`LIMITES_IMAGENES.ladoMax`). `CHECK` en la base |
| `peso` | `peso` | entero | sí | En bytes, igual a la longitud de `datos`. Hasta 10 MB; un GIF, hasta 5 MB. `CHECK` en la base |
| — | `datos` | bytes (`bytea`) | sí | El archivo tal como se subió. Solo lo lee `GET /imagenes/:idImagen` |
| — | `subida_en` | fecha | sí | Por defecto, el momento de subirla. Se renueva si se sube otra vez el mismo archivo. Decide cuándo se borra si nada la usa |

- **Índice** en `id_curso` (lo cubre el índice único de `id_curso, huella`).
- **Se usa** si su id está en `imagenes` de alguna lección del curso o es su
  `curso.id_portada`.
- **Se borra**:
  - al guardar una lección, al cambiar la portada o al eliminar una lección, si la tenía,
    la dejó de tener y nada más del curso la usa;
  - un día después de `subida_en` si nada la usa (`limpiarImagenesSinUsar`);
  - con su curso.
- El nombre del archivo no se guarda. La imagen se sirve con su `Content-Type` y nunca se
  interpreta (research.md, punto 3).

## Curso (cambia)

| Campo (contrato) | Columna (`curso`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `idPortada` (`ResumenCurso`, `CursoDelAutor`) · `portada` (`CursoEnEditor`) | `id_portada` | texto | no | → `imagen.id`, de este mismo curso y no GIF (lo comprueba el servicio). `ON DELETE SET NULL`. Sin ella, la portada generada |
| `pesoImagenes` (`CursoEnEditor`) | — | entero | sí | No se guarda: la suma de `peso` de sus imágenes, en bytes. Hasta 200 MB (`LIMITES_IMAGENES.pesoCursoMax`), comprobado al subir |

`portada` en `CursoEnEditor` es la `Imagen` completa (el editor muestra su tamaño y su
peso); las tarjetas solo reciben su id.

## Leccion (cambia)

| Campo (contrato) | Columna (`leccion`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| — | `imagenes` | lista de textos (`text[]`) | sí | Por defecto `{}`. Los ids de las imágenes que usan sus actividades, sin repetir. Lo escribe `guardarLeccion` con las actividades; no viaja por la API |

- Las imágenes que usan sus actividades pesan, entre todas y sin repetir, hasta 25 MB
  (`LIMITES_IMAGENES.pesoLeccionMax`). Lo comprueba `guardarLeccion`.
- La migración deja `{}` en las lecciones que ya existen: ninguna tiene imágenes.

## Actividad (cambia)

Cada imagen que usa una actividad es una `ImagenActividad`: la `Imagen` (`id`, `formato`,
`ancho`, `alto`, `peso`) y su texto alternativo.

| Tipo (`tipo`) | Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| (toda imagen) | `id` | texto | sí | Una imagen de este curso. Al guardar, el servidor reescribe `formato`, `ancho`, `alto` y `peso` con los de la base |
| | `textoAlternativo` | texto | no | Si está, no vacío, de una línea, de hasta 200 (`textoAlternativoMax`). Se guarda recortado |
| `teoria` | `texto` | texto | sí | Como en F03, con 0 a 5 marcas `[imagen]` (`MARCA_IMAGEN`, `imagenesTeoriaMax`) |
| | `imagenes` | lista de `ImagenActividad` | no | Una por marca, en orden. Sin marcas, no está |
| `opcionMultiple` | `imagen` | `ImagenActividad` | no | La de la pregunta |
| | `opciones` | lista de `{ texto }`, `{ simbolo }` o `{ imagen }` | sí | Entre 2 y 9, **todas de la misma forma**. Las de imagen no repiten id |
| `emparejar` | `parejas[].izquierda`, `parejas[].derecha` | texto o `ImagenActividad` | sí | Toda una columna es de textos o de imágenes. Una imagen no se repite en su columna |
| `clasificar` | `elementos` | lista de `{ texto, categoria }` o `{ imagen, categoria }` | sí | Todos de la misma forma. Una imagen no se repite |
| `ordenar` | `elementos` | lista de textos o de `ImagenActividad` | sí | Todos de la misma forma, en el orden correcto. Una imagen no se repite |

- Las imágenes iguales se comparan por su id: el mismo archivo subido dos veces al mismo
  curso es la misma imagen (research.md, punto 6).
- Una actividad sin imágenes tiene la misma forma que antes de F13.

## Lo que se comprueba y dónde

| Regla | Web (al editar) | Servidor |
|---|---|---|
| Formato por tipo o extensión, peso, que se pueda abrir | `prepararImagen` | — |
| Formato real, que se pueda leer, peso, 1600 px por lado y sin datos ocultos ni animación (sin GIF) | — | `leerImagen` y `comprobarImagenSubida`, al subir |
| Espacio del curso (200 MB) | — | `subirImagen`, con el curso bloqueado |
| Forma de cada imagen, marcas, misma forma por grupo, repetidas, texto alternativo | `validar` de cada `editorX.ts` | `validarActividades` |
| Cada imagen existe y es del curso; peso de la lección (25 MB) | el peso, `pesoLeccion` | `guardarLeccion` |
| Portada del curso y no GIF | `CampoImagen` (`soloFotos`) | `actualizarCurso` |

## Al cerrar

`specs/02-modelo-datos.md` recibe:

- La entidad **Imagen** (esta tabla, sin el detalle de la limpieza, que va en un punto).
- En **Curso**: `id_portada` y `pesoImagenes`; la nota de "La portada no se guarda" pasa a
  decir que la generada queda para los cursos sin portada.
- En **Leccion**: `imagenes` y el límite de 25 MB.
- En **Actividad**: las filas de la tabla de arriba y que una actividad de imagen cuenta
  igual que una de texto.
- "Entidades previstas": quitar lo de F13 que ya no aplica.
