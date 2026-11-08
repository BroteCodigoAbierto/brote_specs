---
description: "Lista de tareas de F13 Imágenes propias en los cursos"
---

# Tareas: F13 Imágenes propias en los cursos

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F13-imagenes-propias` en cada repo afectado, creada desde
`feature/F12-actividades-codigo-terminal` porque F11 y F12 todavía no están en `dev`
(excepción a la decisión 0013, como en F12: plan.md, "Resumen")

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase). Los
  codificadores de `scripts/imagenes-prueba.ts` y los recorridos de `editor/imagenes.ts`
  tampoco llevan pruebas (decisión 0012).
- Los límites, formatos, rutas y mensajes **siempre** salen del contrato
  (`LIMITES_IMAGENES`, `FORMATOS_IMAGEN`, `TIPO_MIME_IMAGEN`, `RUTA_IMAGENES`,
  `MARCA_IMAGEN`, `MENSAJES_IMAGENES`); ninguna tarea los escribe a mano.
- Toda pieza de interfaz usa los tokens y componentes de `docs/diseno.md`. Lo nuevo se
  agrega ahí primero (T002 a T005).
- El texto alternativo y todo texto del autor se muestran siempre como texto: nada de
  `dangerouslySetInnerHTML` (principio III).
- **Comunes a las imágenes, en los dos clientes**:
  - Toda imagen de un curso se pide con `urlImagen(id)` (web) o `fuenteImagen(id)` (móvil):
    `URL_API + RUTA_IMAGENES + "/" + id`, con la sesión (cookie en la web; `Authorization`
    y `X-Cliente` en el móvil).
  - Toda imagen de una actividad se dibuja con `ImagenCurso` (o los que la envuelven:
    `ImagenAmpliable`, `MosaicoImagen`, `MiniaturaImagen`), que reserva su lugar con
    `aspect-ratio: ancho / alto` y tiene los estados cargando, cargada y no cargó.
  - Pausar un GIF, abrir o cerrar el visor **no** llaman a `alInteractuar`. Elegir, unir o
    colocar un mosaico sí, como en F03 y F11.
  - El nombre accesible de un mosaico es su `textoAlternativo` o "Imagen {n}"
    (`nombreDeContenido`, T036): n es su lugar entre los mosaicos de la actividad al
    empezar, de izquierda a derecha y de arriba abajo, y en emparejar primero la columna
    izquierda.
- Textos fijos de la interfaz que no están en el contrato:
  - Al cursar: "Imagen", "Imagen {n}", "Ampliar" (web, en la etiqueta), "Toca para
    ampliarla" (móvil, `accessibilityHint`), "Imagen ampliada", "Cerrar", "Pausar
    animación" y "Reanudar animación".
  - Editor: "Elegir imagen", "Subiendo imagen…", "Cambiar", "Quitar", "Texto alternativo",
    "Describe la imagen para quien no la puede ver. Lo leen los lectores de pantalla y se
    muestra si la imagen no carga.", "JPEG, PNG o WebP de hasta 10 MB, o GIF de hasta 5
    MB.", "JPEG, PNG o WebP de hasta 10 MB.", "{ancho} × {alto} px · {peso}", "Agregar
    imagen", "Imagen {n}", "Quitar imagen", "Separa los párrafos con un renglón en blanco.
    Cada [imagen] es el lugar de una imagen.", "Imagen de la pregunta", "Tipo de opciones"
    con "Texto", "Símbolo" e "Imagen", "Columna izquierda", "Columna derecha", "Tipo de
    elementos", "Portada", "Imágenes de esta lección: {x} de 25 MB", "Imágenes del curso:
    {x} de 200 MB" y "Parejas de imágenes".

---

## Fase 1: Preparación

- [ ] T001 [specs] En `contrato/contrato.ts`, aplicar [contracts/contrato.md](./contracts/contrato.md) tal cual: la sección nueva "Imágenes (F13)" antes de "Lecciones y actividades (F03)", con `FORMATOS_IMAGEN`, `FormatoImagen`, `TIPO_MIME_IMAGEN`, `Imagen`, `ImagenActividad`, `RespuestaImagen`, `RUTA_IMAGENES`, `MARCA_IMAGEN` (`"[imagen]"`), `LIMITES_IMAGENES` (`pesoMax: 10 * 1024 * 1024`, `pesoGifMax: 5 * 1024 * 1024`, `ladoMax: 1600`, `pesoCursoMax: 200 * 1024 * 1024`, `pesoLeccionMax: 25 * 1024 * 1024`, `imagenesTeoriaMax: 5`, `textoAlternativoMax: 200`) y `MENSAJES_IMAGENES`; `ContenidoElemento`; los cambios de `ActividadTeoria`, `OpcionRespuesta`, `ActividadOpcionMultiple`, `ParejaEmparejar`, `ElementoClasificar`, `ActividadOrdenar`, `ResumenCurso`, `CursoDelAutor`, `CuerpoDatosCurso` y `CursoEnEditor`. Subir `contrato/VERSION` de `0.9.0` a `0.10.0`
- [ ] T002 [specs] En `docs/diseno.md`, sección 2: en 2.1, `fondoVisor` (`rgba(10,9,26,0.94)` en los dos modos, fondo del visor); en 2.3, las medidas `mosaicoOpcion` (144 px mínimo; en el móvil, nunca menos de dos columnas), `mosaicoElemento` (88 px), `miniatura` (48 px) y `altoImagenMax` (50 % del alto de la pantalla), con su uso, de plan.md ("Lo que se agrega a docs/diseno.md")
- [ ] T003 [specs] En `docs/diseno.md`, sección 4, tabla general, de plan.md: `ImagenCurso`, `BotonPausa`, `ImagenAmpliable`, `VisorImagen`, `MosaicoImagen` y `MiniaturaImagen` con sus props y notas; y en las filas de `OpcionRespuesta`, `ElementoRespuesta`, `LugarElemento`, `BarraRespuesta` y `PortadaCurso`, sus props nuevas (`imagen`, `forma` `mosaico`, `mosaico`, `lineas`, `idPortada`) y lo que cambia
- [ ] T004 [specs] En `docs/diseno.md`, sección 4, "Editor (solo web)": `CampoImagen`, `VistaPortada` y `PesoImagenes`, de plan.md
- [ ] T005 [specs] En `docs/diseno.md`, sección 6, de plan.md: **Teoría con imágenes**, **Opción múltiple con imágenes**, **Relacionar con imágenes**, **Imagen que no carga y GIF** y **Al fallar**; en "Teclado", que Tab llega a cada imagen ampliable y botón de pausa, y Enter o la barra espaciadora los pulsan; en "Iconos de los tipos" (o una línea aparte), `ImageOff`, `Pause`, `Play`, `X` e `ImagePlus`. La regla de "Teoría" y la de "Opciones" citan las imágenes
- [ ] T006 [P] [specs] En `docs/arquitectura.md`, "Contenido de los cursos": las imágenes de los cursos van en PostgreSQL, en la tabla `imagen` (decisión 0016), y se sirven con `GET /imagenes/:idImagen`, con los permisos del curso
- [ ] T007 [back] En `brote_backend_express`: `git fetch`, `git switch feature/F12-actividades-codigo-terminal` y crear `feature/F13-imagenes-propias` desde ahí. Si para entonces F11 y F12 ya están en `origin/dev`, crearla desde `dev` como siempre; si no, cuando se fusionen, la rama hace `git merge origin/dev` y su PR va después
- [ ] T008 [P] [web] Igual que T007 en `brote_web_react`
- [ ] T009 [P] [movil] Igual que T007 en `brote_mobile_expo`
- [ ] T010 [specs] Copiar el contrato 0.10.0 a los tres repos: `npm run contrato:copiar` en `brote_specs`. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo. **`npm run tipos` deja de pasar** donde se leen `izquierda`, `derecha`, los elementos o las opciones como texto: en back hasta T017, en web hasta T067 y en movil hasta T088

---

## Fase 2: Backend (brote_backend_express)

Las reglas están en [data-model.md](./data-model.md) y en [contracts/api.md](./contracts/api.md);
el porqué, en [research.md](./research.md), puntos 1 a 7 y 15.

### Base de datos

- [ ] T011 [back] En `prisma/schema.prisma`: modelo `Imagen` (`@@map("imagen")`) con `id String @id @default(uuid(7))`, `idCurso` (`@map("id_curso")`, relación `"ImagenesCurso"` con `onDelete: Cascade`), `huella String`, `formato String`, `ancho Int`, `alto Int`, `peso Int`, `datos Bytes`, `subidaEn DateTime @default(now()) @map("subida_en")`, `@@unique([idCurso, huella])` y la relación inversa de la portada; en `Curso`, `idPortada String? @map("id_portada")` con la relación `"PortadaCurso"` (`onDelete: SetNull`) y `imagenes Imagen[] @relation("ImagenesCurso")`; en `Leccion`, `imagenes String[] @default([])`. Comentarios cortos con el porqué (data-model.md)
- [ ] T012 [back] `npx prisma migrate dev --name f13_imagenes` y, en la migración generada (`prisma/migrations/<fecha>_f13_imagenes/migration.sql`), agregar a mano los `CHECK` de data-model.md: `formato IN ('jpeg', 'png', 'webp', 'gif')`, `ancho > 0 AND alto > 0`, `formato = 'gif' OR (ancho <= 1600 AND alto <= 1600)` y `peso = octet_length(datos) AND peso <= 10485760 AND (formato <> 'gif' OR peso <= 5242880)`, con un comentario como el de F06. `npm run bd:generar`

### Validación

- [ ] T013 [P] [back] Crear `src/validacion/imagenes.ts` con `leerImagen(bytes: Buffer): { formato, ancho, alto } | null` (research.md, punto 3): PNG por su firma `89 50 4E 47 0D 0A 1A 0A` y el ancho y alto de `IHDR`; JPEG por `FF D8 FF`, recorriendo los marcadores hasta el primer `SOF0` a `SOF15` que no sea `C4`, `C8` ni `CC`; WebP por `RIFF....WEBP` y su bloque `VP8 ` (14 bits de ancho y alto en los bytes 26 a 29), `VP8L` (14 bits más uno, desde el byte 21) o `VP8X` (24 bits más uno, desde el byte 24); GIF por `GIF87a` o `GIF89a` y su pantalla lógica (bytes 6 a 9, little endian). Si no es ninguno o la cabecera está cortada, `null`. Comentario con el enlace a cada especificación
- [ ] T014 [back] En `src/validacion/imagenes.ts`, agregar `comprobarImagenSubida(cuerpo: unknown, tipo: string | undefined)`, que devuelve `{ bytes, formato, ancho, alto }` o lanza `ErrorApi(400, ...)` en este orden: si `cuerpo` no es un `Buffer` no vacío o `tipo` no es uno de `TIPO_MIME_IMAGEN`, `formatoInvalido`; si `leerImagen` da `null`, `imagenIlegible`; un GIF de más de `pesoGifMax`, `gifPesado`; un JPEG, PNG o WebP de más de `ladoMax` de ancho o de alto, `imagenGrande`. El formato que cuenta es el de los bytes
- [ ] T015 [back] En `src/validacion/actividades.ts`, agregar las internas `contarMarcasImagen(texto)` (cuenta `MARCA_IMAGEN` como `contarMarcas` cuenta `___`) y `validarImagenActividad(valor, campo)`: objeto solo con `id` (texto no vacío), `formato` (uno de `FORMATOS_IMAGEN`), `ancho`, `alto` y `peso` (enteros mayores que 0) y `textoAlternativo` ("Si está, no vacío, de una línea, de hasta 200", `textoAlternativoMax`, con `deUnaLinea`); devuelve el id. En `validarTeoria`: `soloCampos` gana `imagenes`; con 0 marcas, `imagenes` no puede estar; con más de `imagenesTeoriaMax` (5), lanza; con 1 a 5, `imagenes` es una lista de exactamente tantas como marcas, cada una con `validarImagenActividad`
- [ ] T016 [back] En `src/validacion/actividades.ts`, opción múltiple: `soloCampos` gana `imagen` (si está, `validarImagenActividad`); `validarOpcion` acepta también `{ imagen }` (con `validarImagenActividad`); `compararOpciones` exige que todas sean de la misma forma (`texto`, `simbolo` o `imagen`) y, con imágenes, que no repitan id (mensaje `opciones repetidas`)
- [ ] T017 [back] En `src/validacion/actividades.ts`, relacionar: `validarPareja` acepta en `izquierda` y `derecha` un texto o una imagen; `validarEmparejar` exige una sola forma por columna y no repetir textos ni ids en cada columna (`textosSinRepetir` solo entre textos); `validarElementoClasificar` acepta `{ texto, categoria }` o `{ imagen, categoria }`, y `validarClasificar`, una sola forma y sin repetir; `validarOrdenar` acepta textos o imágenes, una sola forma y sin repetir. Exportar `idsDeImagenes(actividades: Actividad[]): string[]` (los ids de todas las imágenes, sin repetir, en el orden en que aparecen), que usan el servicio y el script de datos. Aquí `npm run tipos` vuelve a pasar
- [ ] T018 [P] [back] En `src/validacion/editor.ts`: `recortarTextos` recorta cada `textoAlternativo` (en la teoría, la pregunta, las opciones y los elementos), con un ayudante `recortarImagen`; `validarDatosCurso` acepta `idPortada` ausente, `null` o texto no vacío (si no, `campos.portada` con `datosInvalidos`) y lo devuelve tal cual en `CuerpoDatosCurso`. Actualizar sus comentarios

### Servicios y rutas

- [ ] T019 [back] En `src/servicios/editor.ts`, exportar `conCursoEditable` y `estadoDelCurso` (con un comentario: los usa `servicios/imagenes.ts`). Crear `src/servicios/imagenes.ts` con: `seleccionImagen` (`id`, `formato`, `ancho`, `alto`, `peso`; **nunca** `datos`) y `aImagen(fila): Imagen`; `imagenesDelCurso(tx, idCurso, ids)` (las filas de esos ids que son de ese curso); `idsEnUso(tx, idCurso)` (los de `leccion.imagenes` de sus lecciones y `curso.id_portada`, con `$queryRaw` y `unnest`); `borrarSinUso(tx, idCurso, ids)` (borra de esos ids los que no están en `idsEnUso`); y `limpiarImagenesSinUsar(idCurso?)`, que borra las de más de un día de `subida_en` que nada usa, del curso o de todos (research.md, punto 6), con una sola sentencia `DELETE ... WHERE subida_en < now() - interval '1 day' AND NOT EXISTS (...)`
- [ ] T020 [back] En `src/servicios/imagenes.ts`, agregar `subirImagen(idAutor, idCurso, { bytes, formato, ancho, alto }): Promise<{ imagen: Imagen; nueva: boolean }>`, dentro de `conCursoEditable` (los 404 y 403 de F05): `limpiarImagenesSinUsar(idCurso)`; la huella SHA-256 en hexadecimal (`node:crypto`); si el curso ya tiene esa huella, renueva `subida_en` y la devuelve con `nueva: false`; si no, suma `peso` de las imágenes del curso y, si con esta pasa de `pesoCursoMax`, lanza `ErrorApi(400, MENSAJES_IMAGENES.cursoLleno)`; luego la crea. Y `traerImagen(idUsuario, idImagen)`: los `datos`, el `formato` y la `huella` si el curso está publicado o es de `idUsuario`; si no, `ErrorApi(404, MENSAJES_IMAGENES.imagenNoDisponible)`
- [ ] T021 [back] En `src/rutas/editor.ts`, agregar `POST /cursos/:idCurso/imagenes` con `requerirSesion` y `leerArchivo`: un envoltorio de `express.raw({ type: Object.values(TIPO_MIME_IMAGEN), limit: LIMITES_IMAGENES.pesoMax })` que convierte el error `entity.too.large` en `ErrorApi(413, MENSAJES_IMAGENES.imagenPesada)`. Luego `comprobarImagenSubida(req.body, req.get("Content-Type"))`, `subirImagen` y `201` o `200` con `RespuestaImagen`. Actualizar el comentario del orden de la ruta
- [ ] T022 [back] Crear `src/rutas/imagenes.ts` con `GET /:idImagen` (`requerirSesion`, `traerImagen`) que responde los bytes con `Content-Type` de `TIPO_MIME_IMAGEN`, `Cache-Control: private, max-age=31536000, immutable`, `ETag` con la huella entre comillas, `X-Content-Type-Options: nosniff` y `Content-Security-Policy: default-src 'none'; sandbox`; con `req.fresh`, `304`. Montarla en `src/rutas/index.ts` como `rutas.use("/imagenes", rutasImagenes)`
- [ ] T023 [back] En `src/servicios/editor.ts`, `guardarLeccion` (research.md, punto 6; contracts/api.md, "PUT de la lección"): después de la versión, `idsDeImagenes(actividades)` e `imagenesDelCurso`; si falta alguna, `ErrorApi(400, datosInvalidos, { "actividades.N": ..., "imagenes.<id>": MENSAJES_IMAGENES.imagenNoEsta })` con la primera actividad que la usa y una clave por cada id que falta; si la suma de `peso` (sin repetir) pasa de `pesoLeccionMax`, `ErrorApi(400, MENSAJES_IMAGENES.leccionPesada)`; reescribir `formato`, `ancho`, `alto` y `peso` de cada imagen de las actividades con los de la base (un ayudante `conDatosDeLaBase(actividades, filas)`); guardar `imagenes` junto con las actividades, y `borrarSinUso` con los ids que la lección tenía antes y ya no
- [ ] T024 [back] En `src/servicios/editor.ts`: `borrarLeccion` lee las `imagenes` de la lección antes de borrarla y, después de renumerar, `borrarSinUso` con ellas; `actualizarCurso`, con `idPortada` presente, comprueba que es una imagen del curso (si no, `400` con `campos.portada: imagenNoEsta`) y que no es GIF (`campos.portada: portadaGif`), la guarda y hace `borrarSinUso` con la anterior; con `null`, la quita igual
- [ ] T025 [back] En `src/servicios/editor.ts`: `leerCursoEnEditor` agrega `portada` (`Imagen | null`, con `seleccionImagen`) y `pesoImagenes` (la suma de `peso`, con `aggregate`); `crearCurso` devuelve `portada: null` y `pesoImagenes: 0`; `traerCursosDelAutor` agrega `idPortada`
- [ ] T026 [P] [back] En `src/servicios/cursos.ts`, el catálogo (`c.id_portada AS "idPortada"` en la consulta y en `FilaCatalogo`/`aResumenCurso`) y el detalle (`idPortada` en `seleccionDetalle` y `aDetalleCurso`); en `src/servicios/progreso.ts`, `traerCursosEmpezados` agrega `idPortada` a cada curso
- [ ] T027 [P] [back] En `src/servidor.ts`, después de abrir el puerto: `limpiarImagenesSinUsar()` una vez y cada hora con `setInterval(...).unref()`, registrando el error con `console.error` sin tumbar la API

### Datos de prueba y herramientas

- [ ] T028 [P] [back] Crear `scripts/imagenes-prueba.ts` (research.md, punto 15), sin paquetes: un lienzo RGBA (`Uint8Array`), `dibujarFigura({ forma: "circulo" | "ovalo" | "estrella" | "poligono", lados?, color, relleno, ancho, alto })` (relleno o solo el contorno de 24 px, sobre fondo transparente), `codificarPng(lienzo)` (`zlib.deflateSync`, `zlib.crc32`, filtro 0 por fila, RGBA de 8 bits) y `codificarGif(cuadros, retraso)` (paleta de 256 colores, LZW, `NETSCAPE2.0` para repetir siempre); y `IMAGENES_PRUEBA`: un mapa de nombre a función que da los bytes, con las figuras de quickstart.md, sección 1.1 (círculo rojo, cuadrado azul, triángulo verde, estrella amarilla, óvalo morado, pentágono naranja, hexágono turquesa, sus contornos, los polígonos de 3 a 12 lados rellenos y de contorno, y círculo, cuadrado y triángulo en rojo, azul, verde y amarillo, todas de 400 × 400), el panorama (1600 × 400, un círculo a la izquierda, un cuadrado a la derecha y una barra negra en cada extremo), la chica (120 × 80), la alta (400 × 1600, cuatro figuras en columna), el GIF (200 × 200, un círculo que va y viene, 12 cuadros de 100 ms) y la portada (1600 × 900, una figura al centro, franja roja a la izquierda, azul a la derecha y verde abajo)
- [ ] T029 [back] En `scripts/datos-prueba.ts`: `imagenPrueba(nombre, textoAlternativo?)`, que da una `ImagenActividad` con `id: "prueba:" + nombre` y datos de relleno válidos (los reescribe T031); `portadaPrueba?: string` en `CursoPrueba`; la portada de "Actividades de prueba"; y **al final**, después de "Solo teoría", las lecciones 13 "Teoría con imágenes", 14 "Opción múltiple con imágenes" y 15 "Relacionar con imágenes" de quickstart.md, sección 1.1, con sus textos, marcas, imágenes y textos alternativos tal cual
- [ ] T030 [back] En `scripts/datos-prueba.ts`, las lecciones 16 "GIF", 17 "Imágenes al límite" y 18 "Imágenes con etiquetas" de quickstart.md, sección 1.1 (en 18, los textos alternativos `<b>hola</b>` y `<script>alert(1)</script>`). El encabezado del archivo agrega F13
- [ ] T031 [back] En `scripts/sembrar-cursos.ts`: antes de abrir la transacción, comprobar que cada `prueba:<nombre>` existe en `IMAGENES_PRUEBA`; dentro, por cada curso, crear sus imágenes (bytes de `IMAGENES_PRUEBA`, `leerImagen`, huella), cambiar cada referencia por la imagen guardada con sus datos y su texto alternativo, llenar `imagenes` de cada lección con `idsDeImagenes` y poner `id_portada`. Actualizar el mensaje final con cuántas imágenes se crearon
- [ ] T032 [P] [back] Crear `scripts/archivos-validacion.ts` y, en `package.json`, `"imagenes:validacion": "node scripts/archivos-validacion.ts"`: escribe en la carpeta que recibe los archivos de quickstart.md, sección 1.2, con los codificadores de T028 (PNG, GIF de ruido de 2 MB, 6 MB y seis distintos de 4.9 MB, SVG y el texto `texto.png`); llama a `sips` (con `child_process.execFileSync`) para los JPEG desde PNG y el HEIC, y avisa claro si no está; mete a mano un bloque `APP1` EXIF en `de-lado.jpg` (orientación 6) y en `con-ubicacion.jpg` (GPS 19.43 N, 99.13 W y `Model` "Brote Cam"); y rellena `grande-11mb.jpg` hasta 11 MB después de su `FF D9`
- [ ] T033 [P] [back] Crear `scripts/proxy-validacion.ts` y, en `package.json`, `"proxy:validacion": "node scripts/proxy-validacion.ts"`: con `node:http`, pasa toda petición de `:3001` a `:3000` con sus cabeceras (incluidas `Origin`, `Cookie`, `Set-Cookie` y `set-auth-token`) y su cuerpo; `POST /__modo/normal`, `/__modo/bloquear` y `/__modo/retrasar` cambian qué hace con `GET /imagenes/*` (pasar, cortar la conexión con `socket.destroy()` o esperar 4 s). Escucha en todas las interfaces, para el iPhone

**Punto de control**: `npm run tipos` y `npm run lint` pasan, `npx prisma migrate deploy` y
`npm run bd:sembrar` dejan "Actividades de prueba" con portada y las lecciones 13 a 18, y B1 a
B8 de [quickstart.md](./quickstart.md), sección 2, responden lo que dicen. Con esto ya se pueden
validar los criterios `[backend]` (V01 y V80 a V86).

---

## Fase 3: Web (brote_web_react)

### Base

- [ ] T034 [P] [web] En `src/estilos/tokens.css`, agregar `--color-fondo-visor: rgba(10, 9, 26, 0.94)` (igual en los dos modos), `--mosaico-opcion: 9rem`, `--mosaico-elemento: 5.5rem`, `--miniatura: 3rem` y `--alto-imagen-max: 50vh` (docs/diseno.md, secciones 2.1 y 2.3)
- [ ] T035 [P] [web] Crear `src/utilidades/imagenes.ts`: `urlImagen(id)`; `esGif(imagen)`; `imagenesDe(actividad): ImagenActividad[]` (todas las de una actividad: la teoría, la pregunta, las opciones y los elementos); `pesoSinRepetir(imagenes)` (suma `peso` sin repetir ids); `formatearPeso(bytes)` ("412 KB" con KB de 1024, o "2.3 MB" con un decimal) y `formatearMegas(bytes)` ("12.4", redondeado hacia arriba a un decimal, spec "Cuánto pesan las imágenes")
- [ ] T036 [P] [web] En `src/utilidades/actividades.ts`: `partirTeoria(texto)` → `({ parrafo: string } | { imagen: number })[]` (research.md, punto 8: primero por renglones en blanco, como `partirParrafos`, y después por `MARCA_IMAGEN`, quitando espacios y saltos de los bordes y los trozos vacíos); `textoOpcion` con `{ imagen }` da su texto alternativo o "" ; `esImagen(contenido): contenido is ImagenActividad`; y `nombreDeContenido(contenido, n)` (el texto, el texto alternativo o "Imagen {n}")
- [ ] T037 [web] En `src/utilidades/relacionar.ts` (research.md, punto 14): `type ParteRespuesta = { texto: string } | { imagen: ImagenActividad }`; `detalleParejas`, `detalleClasificar` y `detalleOrdenar` devuelven `{ detalle?: string; lineas?: ParteRespuesta[][] }`: sin imágenes, el `detalle` de hoy, igual carácter por carácter; con alguna imagen, `lineas` con las mismas partes (`{izquierda} → {derecha}`, `{elemento} → {categoría}`, `{n}. {elemento}`). Los nombres accesibles de los elementos usan `nombreDeContenido`. Ajustar las llamadas en `Emparejar.tsx`, `Clasificar.tsx` y `Ordenar.tsx` solo lo necesario para que compile
- [ ] T038 [P] [web] Crear `src/contextos/ContextoImagenes.ts` (`{ intento: number }`, por defecto 0) y `src/hooks/usePrecargarImagenes.ts` (research.md, punto 11): al montarse con las actividades de la lección, pide cada imagen una vez, sin repetir ids: las que no son GIF con `new Image()` y `src`, y los GIF con `fetch(url, { credentials: "include" })`. Crear `src/hooks/useReducirMovimiento.ts` (`matchMedia("(prefers-reduced-motion: reduce)")` con su evento `change`)

### Componentes (docs/diseno.md, sección 4)

- [ ] T039 [web] Crear `src/componentes/ImagenCurso/ImagenCurso.tsx` y `ImagenCurso.module.css`: props `imagen`, `ajuste` (`contener` por defecto, o `cubrir`), `quieta`, `pausada` y `etiqueta`. Un contenedor con `aspect-ratio: ancho / alto` (o el tamaño que le dé quien lo usa) y fondo `--color-vidrio-suave` mientras carga; un `<img>` con `urlImagen`, `alt={etiqueta ?? ""}`, `object-fit` según `ajuste`, `decoding="async"`; si falla (`onError`), `ImageOff` de 24 px en `--color-texto-tenue` y `etiqueta` o `MENSAJES_IMAGENES.sinCargar` en `nota` `--color-texto-suave`, centrados y partiendo líneas. Lee `intento` de `ContextoImagenes`: si cambia y la imagen había fallado, vuelve a pedirla. Con un GIF, usa `AnimacionGif` (T040)
- [ ] T040 [web] Crear `src/componentes/ImagenCurso/AnimacionGif.tsx` (research.md, punto 9): con `ImageDecoder`, trae los bytes con `fetch(urlImagen(id), { credentials: "include" })`, decodifica cuadro a cuadro en un `<canvas role="img" aria-label>` del tamaño del GIF (escalado con CSS como el `<img>`) y programa el siguiente con su `duration`; `pausada` detiene el temporizador en el cuadro actual y al quitarse sigue con el siguiente; `quieta` dibuja el cuadro 0 y nada más; respeta `repetitionCount`. Sin `ImageDecoder`, un `<img>` que se cambia por un `canvas` con el primer cuadro al pausar. Un error al traerlo o decodificarlo es "no cargó", como en T039
- [ ] T041 [P] [web] Crear `src/componentes/BotonPausa/BotonPausa.tsx` y `BotonPausa.module.css`: props `pausada` y `alPulsar`. `<button type="button">` circular de 44 px, `--color-vidrio-opaco`, `--sombra-suave`, icono `Pause` o `Play` de 20 px en `--color-texto`, `aria-label` "Pausar animación" o "Reanudar animación", foco visible (docs/diseno.md, sección 7). `onClick` llama a `evento.stopPropagation()` antes de `alPulsar`, para no elegir ni arrastrar lo que tiene detrás
- [ ] T042 [web] Crear `src/componentes/MosaicoImagen/MosaicoImagen.tsx` (cuadro `--color-vidrio-suave`, radio `medio`, con `ImagenCurso` `contener` y relleno `--espacio-2`; llena el cuadro que le dé su contenedor; prop `quieta`) y `src/componentes/MiniaturaImagen/MiniaturaImagen.tsx` (`--miniatura`, radio `chico`, fondo `--color-vidrio-opaco`, `ImagenCurso` `contener` `quieta`, decorativa: `aria-hidden`), con sus `.module.css`
- [ ] T043 [web] Crear `src/componentes/VisorImagen/VisorImagen.tsx` y `VisorImagen.module.css` (research.md, punto 12): props `imagen`, `abierto` y `alCerrar`. Un `<dialog>` con `showModal()` al abrirse, a pantalla completa con fondo `--color-fondo-visor`, `aria-label` "Imagen ampliada" y la descripción del texto alternativo; la imagen `ImagenCurso` `contener` con margen `--espacio-5`, hasta `100dvw` × `100dvh`; "Cerrar" con `X` arriba a la derecha, con el aspecto de `BotonPausa`; un GIF lleva su `BotonPausa`, con su propio estado inicial igual al de la actividad (prop `pausadaInicial`). Esc (`cancel`) y pulsar el propio `<dialog>` (no su contenido) llaman a `alCerrar`. Con "reducir movimiento", sin animación
- [ ] T044 [web] Crear `src/componentes/ImagenAmpliable/ImagenAmpliable.tsx` y `ImagenAmpliable.module.css`: prop `imagen`. Un `<button type="button">` con `ImagenCurso` `contener`, radio `medio`, `width: min(100%, {ancho}px)`, `max-height: var(--alto-imagen-max)` y centrado; `aria-label` con el texto alternativo (o "Imagen") y ". Ampliar". Abre `VisorImagen` y, al cerrar, devuelve el foco al botón. Con un GIF, `BotonPausa` como hermano del botón, en la esquina inferior izquierda, con el estado `pausada` (inicial: `useReducirMovimiento()`) que también pasa al visor
- [ ] T045 [web] En `src/componentes/OpcionRespuesta/OpcionRespuesta.tsx` y su CSS (docs/diseno.md, sección 4): prop `imagen?: ImagenActividad`. Con ella, la clase `mosaicoImagen` (cuadrado, `aspect-ratio: 1`), un `MosaicoImagen` dentro, la `kbd` del número como insignia de 22 px arriba a la izquierda y el icono de correcta o incorrecta como insignia arriba a la derecha; `aria-label` con `textoOpcion` o "Imagen {número}". Si es GIF, el componente devuelve un envoltorio con el botón y el `BotonPausa` hermano. Sin `imagen`, igual que hoy
- [ ] T046 [web] En `src/componentes/ElementoRespuesta/ElementoRespuesta.tsx` y su CSS: prop `imagen?: ImagenActividad` y `forma` `mosaico` (cuadrado de `--mosaico-elemento`, o `width: 100%` con `aspect-ratio: 1` si el contenedor lo pide con la clase `llenar`), con `MosaicoImagen`, la `marca` arriba a la izquierda y el icono arriba a la derecha; con GIF, el `BotonPausa` hermano, sin tocar `propsOrigen` ni `propsDestino`. En `src/componentes/LugarElemento/LugarElemento.tsx` y su CSS, prop `mosaico`: vacío mide `--mosaico-elemento`, con su borde punteado
- [ ] T047 [web] En `src/componentes/BarraRespuesta/BarraRespuesta.tsx` y su CSS: prop `lineas?: ParteRespuesta[][]`. Cada línea es una fila con sus partes: el texto en `cuerpo` y cada imagen como `MiniaturaImagen` seguida de su texto alternativo, si lo tiene. Va en `.desplazable`, junto con `codigo` y `detalle`. El texto que se anuncia (`aria-live`) lee el texto alternativo de cada imagen, o "Imagen"
- [ ] T048 [web] En `src/componentes/PortadaCurso/PortadaCurso.tsx` y su CSS: prop `idPortada?: string | null`. Con ella, `ImagenCurso` `cubrir` que llena la portada, sobre el color de la generada sin la inicial mientras carga; si no carga, la generada completa. Sin ella, igual que hoy. Sigue siendo decorativa (`aria-hidden`)
- [ ] T049 [web] Pasar `idPortada` a `PortadaCurso` en `src/componentes/TarjetaCurso/TarjetaCurso.tsx`, `src/componentes/TarjetaCursoAutor/TarjetaCursoAutor.tsx`, `src/paginas/DetalleCurso/DetalleCurso.tsx` y `src/paginas/MapaCurso/CursoNoEditable.tsx` (en este, `curso.portada?.id`)

### Cursar (docs/diseno.md, sección 6)

- [ ] T050 [web] En `src/actividades/Teoria/Teoria.tsx` y su CSS: el texto con `partirTeoria`; cada `{ parrafo }`, un `<p>` como hoy, y cada `{ imagen: n }`, `ImagenAmpliable` con `actividad.imagenes[n]`. Una teoría sin marcas, igual que hoy
- [ ] T051 [web] En `src/actividades/OpcionMultiple/OpcionMultiple.tsx` y su CSS: `actividad.imagen` como `ImagenAmpliable` entre la pregunta y el código; con opciones de imagen, la rejilla `repeat(auto-fill, minmax(var(--mosaico-opcion), 1fr))` y `OpcionRespuesta` con `imagen`; al fallar con opciones de imagen, `lineas={[[{ imagen: correcta.imagen }]]}` (la miniatura y su texto alternativo, research.md, punto 14), y sin imágenes, el `detalle` de hoy
- [ ] T052 [web] En `src/actividades/Emparejar/Emparejar.tsx` y su CSS: cada lado de imagen como `ElementoRespuesta` `mosaico` con la clase `llenar` (el ancho de su columna); el `detalle` o las `lineas` de `detalleParejas`. Las dos columnas siguen lado a lado
- [ ] T053 [web] En `src/actividades/Clasificar/Clasificar.tsx` y `src/actividades/Ordenar/Ordenar.tsx`, con su CSS: elementos de imagen como `ElementoRespuesta` `mosaico` en filas que se acomodan solas (`flex-wrap`), `LugarElemento` con `mosaico` en ordenar, y el `detalle` o las `lineas` de `detalleClasificar` y `detalleOrdenar`
- [ ] T054 [web] En `src/actividades/ReproductorLeccion/ReproductorLeccion.tsx`: `usePrecargarImagenes(actividades)` y `ContextoImagenes.Provider` con `intento`, que sube cada vez que cambia `indice` (research.md, punto 11). La vista previa del editor no lo tiene: ahí el intento es 0

### Editor (docs/diseno.md, sección 4, "Editor (solo web)")

- [ ] T055 [P] [web] Crear `src/servicios/imagenes.ts` con `subirImagen(idCurso, archivo: Blob): Promise<RespuestaImagen>`, con `pedir()`, `method: "POST"`, el `Blob` como cuerpo y `headers: { "Content-Type": archivo.type }`. En `src/servicios/editor.ts`, `actualizarCurso` manda `idPortada` cuando cambió
- [ ] T056 [web] En `src/utilidades/imagenes.ts`, agregar `prepararImagen(archivo: File): Promise<Blob>` (research.md, punto 4), que lanza `Error` con el mensaje de `MENSAJES_IMAGENES` de cada caso: tipo o extensión fuera de JPEG, PNG, WebP o GIF (`formatoInvalido`); peso (`imagenPesada`, `gifPesado`); un GIF que `createImageBitmap` no abre (`imagenIlegible`) se sube tal cual si sí; los demás con `createImageBitmap(archivo, { imageOrientation: "from-image" })` (si falla, `imagenIlegible`), un `OffscreenCanvas` de hasta `ladoMax` por su lado más largo con `imageSmoothingQuality = "high"`, y `convertToBlob({ type: "image/webp", quality: 0.85 })`; si el `Blob` no sale WebP, JPEG 0.85 si es opaca o PNG si tiene transparencia (`getImageData`). Parámetro `soloFotos` para la portada (`portadaGif`)
- [ ] T057 [web] Crear `src/editor/imagenes.ts` (research.md, punto 13): `ValorImagen` (`{ clase: "imagen"; imagen: Imagen | null; textoAlternativo: string; subida: string | null; error: string | null; perdida: boolean }`); `valorVacio()`, `aValorImagen(imagenActividad?)`, `aImagenActividad(valor)` (con `textoAlternativo` recortado solo si no está vacío) y `errorImagen(valor)` (`imagenFalta` o `imagenNoEsta`); y los recorridos genéricos, que buscan objetos con `clase: "imagen"` en cualquier borrador: `recorrerImagenes(borrador, fn)`, `reemplazarImagenes(borrador, fn)`, `limpiarSubidas(borrador)`, `haySubidas(bloques)` y `pesoLeccion(bloques)` (ids sin repetir)
- [ ] T058 [web] Crear `src/contextos/ContextoSubidas.ts` (`subir(archivo, opciones): string`, que devuelve el id de la subida). En `src/editor/estadoLeccion.ts`: las acciones `imagenSubida` (`{ idSubida, imagen }` o `{ idSubida, error }`: con `reemplazarImagenes`, pone la imagen y quita `subida`, `error` y `perdida`, o pone el error y deja la imagen anterior) y `marcarImagenesPerdidas` (`{ ids }`: `perdida: true` en esos); `estadoInicial` limpia las subidas de la copia (`limpiarSubidas`)
- [ ] T059 [web] En `src/hooks/useEditorLeccion.ts`: `subir(archivo)` (`prepararImagen`, `subirImagen` y la acción `imagenSubida`; un `401` guarda la copia sin subidas, como al guardar); `comprobar` no deja guardar ni probar con `haySubidas` (sin aviso: el botón ya está deshabilitado) y, con `pesoLeccion` mayor que `pesoLeccionMax`, muestra el aviso `leccionPesada`; un `400` con claves `imagenes.<id>` despacha `marcarImagenesPerdidas`, además de seleccionar la actividad como hoy; devuelve `subiendo` y `peso`
- [ ] T060 [web] Crear `src/componentes/CampoImagen/CampoImagen.tsx` y `CampoImagen.module.css` (docs/diseno.md, "Editor (solo web)"): props `id`, `etiqueta`, `valor`, `alCambiar`, `alElegirArchivo`, `error`, `soloFotos`, `conTextoAlternativo` y `deshabilitado`. Un `<input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif">` (sin GIF con `soloFotos`) que abre "Elegir imagen" (`Boton` `secundario` chico con `ImagePlus`) o "Cambiar"; la nota de formatos; "Subiendo imagen…" con un `IndicadorCarga` chico; con imagen, `ImagenCurso` de 96 px, "{ancho} × {alto} px · {peso}" (`formatearPeso`), "Cambiar" y "Quitar" (`fantasma` chico) y, con `conTextoAlternativo`, un `CampoTexto` "Texto alternativo" con su ayuda y `maxLongitud={textoAlternativoMax}`, que no acepta saltos de línea; el error de `valor.error`, `error` o `errorImagen` debajo, con `aria-describedby`. Al elegir, `alElegirArchivo(archivo)` y limpia el `input`
- [ ] T061 [P] [web] Crear `src/componentes/PesoImagenes/PesoImagenes.tsx` (props `peso`, `maximo` y `texto`: "{texto}: {formatearMegas(peso)} de {maximo / 1048576} MB" en `nota` `--color-texto-suave`; si pasa, `--color-error` con `CircleAlert`) y `src/componentes/VistaPortada/VistaPortada.tsx` (dos `PortadaCurso`, en tarjeta y en detalle, lado a lado), con sus `.module.css`
- [ ] T062 [web] En `src/paginas/LienzoLeccion/EditorLeccion.tsx`: `ContextoSubidas.Provider` con `subir` de `useEditorLeccion`; en la barra superior, `PesoImagenes` ("Imágenes de esta lección", `pesoLeccionMax`) si la lección tiene imágenes; "Guardar lección" y "Probar lección" deshabilitados mientras `subiendo`, con la nota `esperarSubidas` en `nota`
- [ ] T063 [web] Teoría en el editor: `src/actividades/Teoria/grupos.ts`, nuevo, con la lógica de los grupos por marca de `CompletarEspacios/grupos.ts` (un grupo por `MARCA_IMAGEN`; los vacíos que sobran se van solos; los que tienen imagen se quedan con `imagenesDeMas`); en `editorTeoria.ts`, `imagenes: (ValorImagen & { id })[]` en el borrador, `aBorrador`, `aActividad` (sin marcas, sin `imagenes`), `validar` (`demasiadasImagenes`, `imagenesDeMas` y `errorImagen` por grupo) y `resumen` sin cambios
- [ ] T064 [web] En `src/actividades/Teoria/FormularioTeoria.tsx`: debajo del texto, "Agregar imagen" (escribe `MARCA_IMAGEN` donde está el cursor, con la `ref` de `CampoArea`, y se deshabilita con 5 marcas), la ayuda nueva del texto y un grupo "Imagen {n}" con `CampoImagen` por marca, con "Quitar imagen" cuando sobran (spec, "Teoría")
- [ ] T065 [web] Opción múltiple en el editor (`src/actividades/OpcionMultiple/editorOpcionMultiple.ts` y `FormularioOpcionMultiple.tsx`): `TipoOpciones` gana `"imagen"`; cada opción guarda `valor` (texto) e `imagen: ValorImagen`, y el borrador, `imagenPregunta: ValorImagen`; "Imagen de la pregunta" (`CampoImagen` con texto alternativo) entre la pregunta y el código; con "Imagen", cada opción es un `CampoImagen`; al cambiar de tipo se conserva todo; `validar` con `errorImagen` y `imagenRepetida` (mismo id)
- [ ] T066 [web] Emparejar en el editor (`src/actividades/Emparejar/editorEmparejar.ts` y `FormularioEmparejar.tsx`): `tipoIzquierda` y `tipoDerecha` (`"texto" | "imagen"`) con `CampoSelector` "Columna izquierda" y "Columna derecha"; cada lado guarda su texto y su `ValorImagen`; `validar` con `errorImagen` e `imagenRepetida` por columna; `resumen`: el texto izquierdo, o el derecho si la izquierda es de imágenes, o "Parejas de imágenes"
- [ ] T067 [web] Clasificar y ordenar en el editor (`src/actividades/Clasificar/editorClasificar.ts`, `FormularioClasificar.tsx`, `src/actividades/Ordenar/editorOrdenar.ts` y `FormularioOrdenar.tsx`): `tipoElementos` con `CampoSelector` "Tipo de elementos" después de la consigna (y de las categorías en clasificar); cada elemento guarda su texto y su `ValorImagen`; `validar` con `errorImagen` e `imagenRepetida`. Aquí `npm run tipos` vuelve a pasar
- [ ] T068 [web] En `src/paginas/MapaCurso/DatosCurso.tsx` y `MapaCurso.module.css`: "Portada" arriba del título, con `VistaPortada` y `CampoImagen` `soloFotos` sin texto alternativo, en el estado del formulario (sube con `subirImagen` y una `ref` al último `alCambiar`, research.md, punto 13); cambiarla habilita "Guardar cambios", que manda `idPortada`; un `400` con `campos.portada` va en su campo. Debajo de los datos, `PesoImagenes` ("Imágenes del curso", `pesoCursoMax`) con `curso.pesoImagenes` si es mayor que 0

**Punto de control**: `npm run tipos`, `npm run lint` y `npm run build` pasan, y en Chrome se
puede recorrer "Actividades de prueba" de la 13 a la 18 y subir una imagen en el editor.

---

## Fase 4: Móvil (brote_mobile_expo)

### Base

- [ ] T069 [movil] `npx expo install expo-image` (la ~58.0.17 del SDK 58); comprobar que `package.json` y `package-lock.json` solo cambian en eso (plan.md, "Dependencias nuevas")
- [ ] T070 [P] [movil] En `src/constantes/tema.ts`, `fondoVisor` (`rgba(10,9,26,0.94)` en los dos modos) en los colores y, en las medidas, `mosaicoOpcion: 144`, `mosaicoElemento: 88`, `miniatura: 48` y `altoImagenMax: 0.5` (docs/diseno.md, secciones 2.1 y 2.3)
- [ ] T071 [P] [movil] En `src/servicios/api.ts`, exportar `cabecerasSesion()` (las de `pedir()`: `X-Cliente` y, si hay token, `Authorization`). Crear `src/utilidades/imagenes.ts` con `fuenteImagen(id)` (`{ uri, headers: cabecerasSesion(), cacheKey: id }`), `esGif` e `imagenesDe`, como la web (T035)
- [ ] T072 [P] [movil] En `src/utilidades/actividades.ts` y `src/utilidades/relacionar.ts`, lo mismo que la web en T036 y T037 (`partirTeoria`, `textoOpcion`, `esImagen`, `nombreDeContenido`, `ParteRespuesta` y los `detalle*` con `lineas`), copiado sin cambios de lógica
- [ ] T073 [movil] Crear `src/contextos/ContextoImagenes.ts` y `src/hooks/usePrecargarImagenes.ts` (research.md, punto 11): `Image.prefetch(urls, { headers: cabecerasSesion(), cachePolicy: "memory-disk" })` con las imágenes de la lección al montarse; `Network.addNetworkStateListener` sube `intento` cuando pasa de sin conexión a con conexión, y entonces vuelve a precargar

### Componentes (docs/diseno.md, sección 4)

- [ ] T074 [movil] Crear `src/componentes/ImagenCurso.tsx` con `Image` de `expo-image`: props `imagen`, `ajuste`, `quieta`, `pausada` y `etiqueta`; `source={fuenteImagen(imagen.id)}`, `contentFit` `contain` o `cover`, `cachePolicy="memory-disk"`, `accessibilityLabel`; el contenedor con `aspectRatio` y fondo `vidrioSuave` mientras carga; `onError` → `ImageOff` 24 en `textoTenue` y la etiqueta o `sinCargar` en `nota` `textoSuave`; un GIF con `autoplay={!quieta && !pausada}` y, con una `ref`, `stopAnimating()` y `startAnimating()` cuando cambia `pausada`. Con `intento` de `ContextoImagenes`, la que falló se vuelve a montar (su `key` incluye el intento)
- [ ] T075 [movil] **En el iPhone**, con el GIF de la lección 16 y una pantalla de prueba desechable (no se versiona): confirmar que `stopAnimating` deja el cuadro actual y `startAnimating` sigue desde ahí, que `autoplay={false}` muestra el primer cuadro y que la imagen llega con el token. Anotar el resultado en `specs/features/F13-imagenes-propias/research.md`, punto 10 (en `brote_specs`). Si algo no se cumple, parar y preguntarle al usuario antes de seguir
- [ ] T076 [P] [movil] Crear `src/componentes/BotonPausa.tsx`: `Pressable` circular de 44 px, `vidrioOpaco`, `useSombras().suave`, `Pause` o `Play` de 20 en `texto`, `accessibilityRole="button"` y `accessibilityLabel` "Pausar animación" o "Reanudar animación", con `hitSlop` para no pasar de 44 px
- [ ] T077 [movil] Crear `src/componentes/MosaicoImagen.tsx` y `src/componentes/MiniaturaImagen.tsx`, como la web (T042), con `StyleSheet.create`
- [ ] T078 [movil] Crear `src/componentes/VisorImagen.tsx` (research.md, punto 12): `Modal` `transparent` con `onRequestClose={alCerrar}` y `accessibilityViewIsModal`, `GestureHandlerRootView` dentro, fondo `fondoVisor`, área segura, la imagen `contener` y "Cerrar" (`X`) arriba a la derecha; `Gesture.Simultaneous(Gesture.Pinch(), Gesture.Pan())` con `react-native-reanimated`: escala entre 1 y 4 y arrastre solo con escala mayor que 1; `animationType` `fade`, o `none` con `useReducedMotion()`; un GIF con su `BotonPausa`
- [ ] T079 [movil] Crear `src/componentes/ImagenAmpliable.tsx`: `Pressable` con `ImagenCurso` `contener`, ancho `min(ancho disponible, imagen.ancho)` y alto máximo `altoImagenMax` de `useWindowDimensions().height`, centrado; `accessibilityRole="imagebutton"`, `accessibilityLabel` con el texto alternativo (o "Imagen") y `accessibilityHint` "Toca para ampliarla"; abre `VisorImagen`. Con un GIF, `BotonPausa` encima, en la esquina inferior izquierda, con `pausada` inicial de `useReducedMotion()`
- [ ] T080 [movil] En `src/componentes/OpcionRespuesta.tsx`: prop `imagen`, como la web (T045), con el mosaico cuadrado del ancho que le dé su rejilla y el icono de correcta o incorrecta como insignia arriba a la derecha (sin número: en el móvil no hay teclas); con GIF, el `BotonPausa` dentro, como un `Pressable` aparte
- [ ] T081 [movil] En `src/componentes/ElementoRespuesta.tsx` y `src/componentes/LugarElemento.tsx`: `imagen`, `forma` `mosaico` y `mosaico`, como la web (T046). Dentro de `Arrastrable`, el `BotonPausa` es un `Pressable` aparte que no empieza el arrastre; la copia de `CapaArrastre` muestra la imagen (quieta)
- [ ] T082 [movil] En `src/componentes/BarraRespuesta.tsx`: `lineas`, como la web (T047); el anuncio de iOS (`announceForAccessibility`) lee el texto alternativo de cada imagen, o "Imagen"
- [ ] T083 [movil] En `src/componentes/PortadaCurso.tsx`, `idPortada` como la web (T048), con `ImagenCurso` `cubrir`; pasarlo en `src/componentes/TarjetaCurso.tsx` y en `src/app/curso/[idCurso].tsx`

### Cursar (docs/diseno.md, sección 6)

- [ ] T084 [movil] En `src/actividades/Teoria.tsx`: `partirTeoria` con `ImagenAmpliable` en cada marca, como la web (T050)
- [ ] T085 [movil] En `src/actividades/OpcionMultiple.tsx`: la imagen de la pregunta y las opciones de imagen en filas de `max(2, floor((ancho + espacio[4]) / (mosaicoOpcion + espacio[4])))` columnas, con las `lineas` al fallar, como la web (T051)
- [ ] T086 [movil] En `src/actividades/Emparejar.tsx`: mosaicos del ancho de su columna, lado a lado, y `lineas` de `detalleParejas`
- [ ] T087 [movil] En `src/actividades/Clasificar.tsx`: mosaicos de `mosaicoElemento` en filas con `flexWrap`, y `lineas` de `detalleClasificar`
- [ ] T088 [movil] En `src/actividades/Ordenar.tsx`: `LugarElemento` con `mosaico`, mosaicos en los lugares y en los sin colocar, y `lineas` de `detalleOrdenar`
- [ ] T089 [movil] En `src/actividades/ReproductorLeccion.tsx`: `usePrecargarImagenes(actividades)` y `ContextoImagenes.Provider` con su `intento`
- [ ] T090 [movil] Comprobar que `npm run tipos` y `npm run lint` pasan (vuelven a pasar con T088) y recorrer en el iPhone "Actividades de prueba" de la 13 a la 18, con el visor, la pausa y el arrastre

**Punto de control**: el móvil compila y muestra las seis lecciones en el iPhone.

---

## Fase 5: Cierre

- [ ] T091 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`, como dice su sección "Al cerrar": la entidad **Imagen**, lo que cambia en **Curso** (`id_portada`, `pesoImagenes`, la portada generada solo sin imagen), **Leccion** (`imagenes`, 25 MB) y **Actividad** (las filas con imágenes y su título "Actividad (F03, F05, F11, F12, F13)"), y en "Entidades previstas" lo que ya no aplica
- [ ] T092 [specs] Integrar "Cambios a la navegación" de [plan.md](./plan.md) a `specs/01-navegacion.md`: en "Salir de una lección", el visor de una imagen se abre sobre la lección, el botón de volver de Android lo cierra a él, y abrirlo o pausar un GIF no cuenta como haber hecho algo
- [ ] T093 [specs] `npm run contrato:revisar`: las tres copias coinciden con la oficial. `npm run tipos` y `npm run lint` en los tres repos de código y `npm run build` en la web
- [ ] T094 [specs] Revisar que `specs/features/F13-imagenes-propias/spec.md` coincide con lo que se construyó; si algo cambió, actualizarla, junto con lo que T075 haya anotado en `research.md`

---

## Fase 6: Validación manual

Una tarea por criterio de aceptación de [spec.md](./spec.md), copiado tal cual. Los pasos de cada
uno están en [quickstart.md](./quickstart.md), sección 3, en el mismo orden. Se marcan aquí
(`[X]`) y en `spec.md` (`[x]`) solo si se vieron pasar; lo que se vio en otro lado lleva su nota.

### Cursos de prueba

- [ ] V01 [backend] "Actividades de prueba" tiene portada y, al final, las lecciones "Teoría con imágenes", "Opción múltiple con imágenes", "Relacionar con imágenes", "GIF", "Imágenes al límite" e "Imágenes con etiquetas", en ese orden, sin que cambien de lugar sus 12 lecciones anteriores.
- [ ] V02 [web, móvil] Las actividades sin imágenes de los cuatro cursos del prototipo se ven igual que antes de esta feature, y esos cursos se ven con su portada generada.

### Subir imágenes (editor)

- [ ] V03 [web] En un borrador, el campo de imagen vacío muestra "Elegir imagen" y "JPEG, PNG o WebP de hasta 10 MB, o GIF de hasta 5 MB.".
- [ ] V04 [web] Al elegir la foto de 4000 × 3000 px, el campo muestra "Subiendo imagen…" y luego la imagen, "1600 × 1200 px" con su peso, "Cambiar", "Quitar" y "Texto alternativo" con su ayuda.
- [ ] V05 [web] Al elegir la imagen de 800 × 600 px, se guarda de 800 × 600 px: una imagen más chica no se agranda.
- [ ] V06 [web] El PNG con fondo transparente, ya subido, sigue transparente en la vista previa.
- [ ] V07 [web] La foto tomada de lado se ve derecha en el campo y en la vista previa.
- [ ] V08 [web] La foto con ubicación se guarda sin ella ni el modelo de la cámara.
- [ ] V09 [web] El GIF de 2 MB se sube con su mismo peso y tamaño, y se mueve en la vista previa.
- [ ] V10 [web] El archivo de 11 MB muestra "La imagen puede pesar hasta 10 MB." y el GIF de 6 MB, "Un GIF puede pesar hasta 5 MB.". El campo se queda como estaba.
- [ ] V11 [web] El SVG y el HEIC muestran "Elige una imagen JPEG, PNG, WebP o GIF.", y el texto con extensión `.png`, "No se pudo leer la imagen. Elige otra.".
- [ ] V12 [web] Con una imagen en el campo, "Cambiar" y elegir el archivo de 11 MB muestra su error y deja la imagen anterior. "Cambiar" con otra válida la reemplaza.
- [ ] V13 [web] "Quitar" deja el campo vacío, sin confirmación, y aparece "Cambios sin guardar".
- [ ] V14 [web] Mientras se sube una imagen, "Guardar lección" y "Probar lección" están deshabilitados con "Espera a que terminen de subir las imágenes.", y se puede seguir escribiendo en otro campo.
- [ ] V15 [web] El texto alternativo no deja escribir más de 200 caracteres ni saltos de línea, y se guarda sin los espacios del inicio y del final.
- [ ] V16 [web] Una actividad con un campo de imagen vacío lleva "Incompleta" y, al guardar, el campo muestra "Elige una imagen.".
- [ ] V17 [web] Con el servidor apagado, subir una imagen muestra "No se pudo subir la imagen. Inténtalo de nuevo." y lo demás sigue en pantalla.
- [ ] V18 [web] Con la sesión expirada, subir una imagen lleva a "Entrar" con "Tu sesión terminó. Vuelve a entrar."; al entrar, la lección vuelve con sus cambios sin guardar y el campo de esa imagen como estaba antes.
- [ ] V19 [web] Después de guardar, al recargar la página, las imágenes y sus textos alternativos siguen en sus campos.

### Teoría

- [ ] V20 [web] En el formulario de teoría, "Agregar imagen" escribe `[imagen]` donde está el cursor y aparece el grupo "Imagen 1"; con otra marca, "Imagen 2".
- [ ] V21 [web] Al borrar del texto una marca cuyo grupo no tiene imagen, el grupo desaparece. Si tiene imagen, aparece "Hay más imágenes que marcas [imagen] en el texto. Quita las que sobran." y cada grupo muestra "Quitar imagen".
- [ ] V22 [web] Con 5 marcas, "Agregar imagen" se deshabilita; con 6 escritas a mano, al guardar aparece "El texto puede tener hasta 5 imágenes.".
- [ ] V23 [web] `[Imagen]` y `[ imagen ]` no cuentan como marcas y se ven como texto al cursar.
- [ ] V24 [web, móvil] En "Teoría con imágenes", "Imágenes entre párrafos" muestra el primer párrafo, el panorama, el segundo párrafo partido en dos por la imagen chica, el tercer párrafo y, al final, sus puntos clave.
- [ ] V25 [web, móvil] El panorama se ve completo, a lo ancho, con la marca de cada extremo a la vista y sin deformarse.
- [ ] V26 [web, móvil] La imagen chica (120 × 80 px) se ve de su tamaño, centrada, sin agrandarse.
- [ ] V27 [web, móvil] En "Solo una imagen alta", la imagen se ve completa y no pasa de la mitad del alto de la pantalla.
- [ ] V28 [web, móvil] "Cinco imágenes" muestra sus cinco imágenes, cada una en su lugar.

### Opción múltiple

- [ ] V29 [web] "Tipo de opciones" tiene "Texto", "Símbolo" e "Imagen". Con "Imagen", cada opción es un campo de imagen. Al pasar a "Texto" y volver a "Imagen", las imágenes siguen ahí.
- [ ] V30 [web] Dos opciones con el mismo archivo muestran "Esta imagen está repetida.".
- [ ] V31 [web, móvil] En "Opción múltiple con imágenes", "¿Qué figura es esta?" muestra la imagen del círculo rojo debajo de la pregunta y las opciones de texto.
- [ ] V32 [web, móvil] En "¿Cuál es el cuadrado azul?", las cuatro opciones son mosaicos cuadrados del mismo tamaño, con la figura completa, y en un teléfono de 360 px van al menos dos por fila.
- [ ] V33 [web, móvil] Al elegir el círculo y comprobar, el círculo se marca como incorrecto y el cuadrado como correcto, con su icono, y la barra muestra "Respuesta correcta:" con la miniatura del cuadrado y "Cuadrado azul".
- [ ] V34 [web, móvil] En "¿Cuál es el triángulo?", sin textos alternativos, al fallar la barra muestra solo la miniatura del triángulo.
- [ ] V35 [web] Con las teclas 1 a 4 se eligen los mosaicos según su lugar en pantalla, y cada mosaico muestra su número.

### Emparejar, clasificar y ordenar

- [ ] V36 [web] Emparejar tiene "Columna izquierda" y "Columna derecha", con "Texto" o "Imagen". Con "Imagen" a la izquierda, cada pareja tiene un campo de imagen a la izquierda y uno de texto a la derecha.
- [ ] V37 [web] Clasificar y ordenar tienen "Tipo de elementos", con "Texto" o "Imagen". Al cambiarlo y volver, lo escrito y las imágenes siguen ahí.
- [ ] V38 [web] Dos imágenes iguales en la misma columna de emparejar, o dos elementos de imagen iguales, muestran "Esta imagen está repetida.". La misma imagen en las dos columnas se guarda.
- [ ] V39 [web, móvil] En "Relacionar con imágenes", el primer emparejar muestra las figuras a la izquierda y sus nombres, mezclados, a la derecha, lado a lado también en el teléfono.
- [ ] V40 [web, móvil] Al formar una pareja, el número de la pareja se ve en la esquina del mosaico y en el texto. Al fallar una, la barra muestra la miniatura de la figura, "→" y el nombre que le tocaba.
- [ ] V41 [web, móvil] El emparejar de imagen con imagen une las figuras rellenas con las de contorno, y al fallar la barra muestra las dos miniaturas de cada pareja fallada.
- [ ] V42 [web, móvil] En el clasificar, los mosaicos se colocan en "Tiene esquinas" y "No tiene esquinas" pulsando y arrastrando, y al fallar la barra muestra la miniatura de cada elemento fallado, "→" y su categoría.
- [ ] V43 [web, móvil] En el ordenar, cada lugar numerado recibe un mosaico, y al fallar la barra muestra "1." a "4." con la miniatura de cada figura en su orden.
- [ ] V44 [móvil] Arrastrar un mosaico lleva una copia con la imagen, y mantener pulsado sigue siendo necesario para arrastrar (F11).

### Portada

- [ ] V45 [web] En el mapa de un borrador sin portada, "Portada" muestra la portada generada y "Elegir imagen". Al subir una, muestra su vista 16:9 y su vista cuadrada, y "Guardar cambios" se habilita.
- [ ] V46 [web] Al guardar, "Cambios guardados"; la portada sigue al recargar y se ve en "Cursos que creé" y, con el curso enviado a revisión, en su mapa (F06).
- [ ] V47 [web] Al elegir un GIF para la portada aparece "La portada puede ser JPEG, PNG o WebP.".
- [ ] V48 [web] "Quitar" y "Guardar cambios" devuelven la portada generada en el mapa y en "Cursos que creé".
- [ ] V49 [web] En el catálogo, la tarjeta de "Actividades de prueba" muestra su portada en 16:9 con las tres franjas a la vista; en su detalle, cuadrada y recortada al centro, sin las franjas de los lados.
- [ ] V50 [móvil] En el catálogo y en el detalle, la portada de "Actividades de prueba" se ve cuadrada y recortada al centro.
- [ ] V51 [web, móvil] Después de completar una lección de "Actividades de prueba", su portada se ve en "Sigue aprendiendo" (web) y en "Mis cursos" (móvil).
- [ ] V52 [web, móvil] Con el servidor apagado después de cargar el catálogo, una portada que no había cargado se ve como la generada.

### GIF

- [ ] V53 [web, móvil] En "GIF", la teoría muestra el GIF moviéndose, con un botón "Pausar" en su esquina.
- [ ] V54 [web, móvil] Al pulsar "Pausar", el GIF se queda quieto en ese cuadro y el botón dice "Reanudar"; al pulsarlo otra vez, sigue desde ahí.
- [ ] V55 [web, móvil] Con "reducir movimiento" activado, el GIF empieza quieto, en su primer cuadro, con "Reanudar".
- [ ] V56 [web, móvil] En la opción múltiple de "GIF", pulsar el botón de pausa del mosaico no elige la opción, y salir de la lección después de solo pausar no pide confirmación.
- [ ] V57 [web, móvil] En la barra inferior, la miniatura de un GIF se ve quieta.

### Ampliar

- [ ] V58 [web, móvil] Al tocar el panorama de "Imágenes entre párrafos", se abre sobre la lección, sobre fondo oscuro, completo y tan grande como cabe, con "Cerrar".
- [ ] V59 [web] "Cerrar", Esc y pulsar el fondo cierran el visor, y el foco vuelve a la imagen. Con Tab, el foco no sale del visor mientras está abierto.
- [ ] V60 [móvil] En el visor, pellizcar acerca la imagen y, acercada, se mueve con un dedo. "Cerrar" la cierra y la lección sigue como estaba.
- [ ] V61 [web, móvil] La imagen de "¿Qué figura es esta?" también se amplía al tocarla, y tocar un mosaico de opción lo elige sin abrir el visor.
- [ ] V62 [web, móvil] Abrir y cerrar el visor en la primera actividad no cuenta como haber hecho algo: salir no pide confirmación.

### Carga y errores al cursar

- [ ] V63 [web, móvil] Mientras una imagen carga, su lugar ya tiene su tamaño, y el texto de abajo no salta al llegar la imagen.
- [ ] V64 [web, móvil] Con el servidor apagado después de abrir la lección, una imagen que no había cargado muestra el icono de imagen rota y su texto alternativo; sin texto alternativo, "No se pudo cargar la imagen".
- [ ] V65 [web, móvil] Un mosaico que no cargó muestra su texto alternativo y se puede elegir y comprobar.
- [ ] V66 [móvil] Si las imágenes de "Opción múltiple con imágenes" no cargaron al abrirla porque se cayó la conexión, al volver la conexión aparecen solas en su lugar.
- [ ] V67 [web] Si las imágenes de "Opción múltiple con imágenes" no cargaron al abrirla y después el servidor vuelve a responder, al pasar a la siguiente actividad sus imágenes se ven.
- [ ] V68 [web, móvil] Si abro "Relacionar con imágenes", espero unos segundos en la primera actividad y apago el servidor (en el móvil, quito la conexión), las imágenes de las actividades siguientes se ven al llegar a ellas y la lección se termina como en F03.

### Accesibilidad y teclado

- [ ] V69 [web, móvil] Con lector de pantalla, la imagen del círculo rojo se anuncia con su texto alternativo y que se puede ampliar.
- [ ] V70 [web, móvil] Con lector de pantalla, un mosaico se anuncia con su texto alternativo y su estado; uno sin texto alternativo, como "Imagen {n}".
- [ ] V71 [web, móvil] El botón de un GIF se anuncia como "Pausar animación" o "Reanudar animación".
- [ ] V72 [web] Con Tab se llega a cada imagen ampliable y a cada botón de pausa, con foco visible; Enter o la barra espaciadora abren la imagen o pausan el GIF.
- [ ] V73 [web, móvil] Las imágenes, los mosaicos, el botón de pausa y el visor se ven bien en modo oscuro y con "reducir transparencia".

### Límites del curso y servidor

- [ ] V74 [web] En el curso casi lleno, subir una imagen que no cabe muestra "Este curso ya tiene 200 MB de imágenes. Quita alguna y guarda para hacer espacio.".
- [ ] V75 [web] En ese curso, al quitar una imagen ya guardada y guardar la lección, la misma imagen que no cabía ahora se sube.
- [ ] V76 [web] En la lección pesada, con seis GIF de 5 MB, "Guardar lección" y "Probar lección" muestran "Las imágenes de esta lección pesan más de 25 MB. Quita alguna." y no guardan ni abren la prueba. Al quitar dos GIF, se guarda.
- [ ] V77 [web] Una misma imagen usada en dos actividades de la lección cuenta una vez en los 25 MB.
- [ ] V78 [web] En el lienzo de una lección con imágenes, junto a "Guardar lección" se lee "Imágenes de esta lección: {x} de 25 MB", que sube al elegir una imagen y baja al quitarla, sin guardar. En la lección pesada se ve en el color de error, con su icono, y en una lección sin imágenes no aparece.
- [ ] V79 [web] El mapa de un borrador con imágenes muestra "Imágenes del curso: {x} de 200 MB"; el del curso casi lleno, un número cercano a 200, que baja al quitar una imagen, guardar la lección y volver al mapa.
- [ ] V80 [backend] Una imagen que se sube y no se guarda en ninguna parte se borra un día después de subirla.
- [ ] V81 [backend] Al eliminar una lección se borran sus imágenes que no se usan en otra parte del curso, y al eliminar el curso, todas.
- [ ] V82 [backend] Subir dos veces el mismo archivo al mismo curso da la misma imagen, que cuenta una vez.
- [ ] V83 [backend] El servidor rechaza subir sin sesión, a un curso ajeno, en revisión o publicado, un archivo que no es imagen aunque se llame `.png`, un JPEG de más de 1600 px por lado y un GIF de más de 5 MB.
- [ ] V84 [backend] El servidor rechaza guardar una lección con una imagen de otro curso, una imagen que no existe, imágenes de más de 25 MB entre todas, una teoría con más imágenes que marcas, o mosaicos de una columna con imágenes y textos mezclados. No guarda nada.
- [ ] V85 [backend] El servidor rechaza una portada GIF o de otro curso al guardar los datos del curso.
- [ ] V86 [backend] Las imágenes de un borrador solo las trae su autor; las de un curso publicado, cualquier usuario con sesión, y sin sesión, nadie.
- [ ] V87 [web] Si quito una imagen y guardo en una pestaña, y en otra pestaña con la versión anterior elijo "Reemplazar", aparece "Revisa los datos marcados." y el campo muestra "Esta imagen ya no está. Elige otra.".

### Contenido

- [ ] V88 [web, móvil] En "Imágenes con etiquetas", los textos alternativos con `<b>hola</b>` y `<script>` se ven tal cual en la barra inferior y en el lugar de una imagen que no carga, sin interpretarse.
- [ ] V89 [web, móvil] En "Imágenes al límite", la opción múltiple de 9 mosaicos, el emparejar de 8 parejas de imágenes, el clasificar de 12 mosaicos en 4 categorías y el ordenar de 10 se ven completos en un teléfono de 360 px, desplazando la actividad, sin cortar ni encimar mosaicos.
- [ ] V90 [web] La vista previa del editor muestra las imágenes, los GIF con su pausa y el visor igual que el reproductor, y "Probar lección" recorre "Relacionar con imágenes" como un alumno.

---

## Dependencias

- **Fase 1** va antes que todo. T001 primero. T001 → T010 y T007–T009 → T010 (cada copia se
  commitea en la rama de F13 de su repo). T002 → T003 → T004 → T005 (mismo archivo), las cuatro
  antes de cualquier tarea de interfaz. T006 cuando se quiera.
- **Backend** (fase 2):
  - T011 → T012; T013 → T014 (mismo archivo), en paralelo con la base de datos;
  - T015 → T016 → T017 (mismo archivo); T018 en paralelo;
  - T019 → T020 (mismo archivo) necesitan T012 y T017; T021 necesita T014 y T020; T022, T020;
  - T023 → T024 → T025 (mismo archivo) necesitan T019; T026 y T027 en paralelo con ellas;
  - T028 cuando se quiera; T029 → T030 (mismo archivo) necesitan T017; T031 necesita T012,
    T013, T017, T028 y T030; T032 necesita T028; T033 cuando se quiera.
- **Web** (fase 3), cuando el backend pasa su punto de control:
  - T034, T035, T036 y T038 en paralelo; T037 necesita T036;
  - T039 necesita T034, T035 y T038; T040 necesita T039; T041 en paralelo;
  - T042 necesita T039; T043 y T044 necesitan T039 a T042 (T044 usa T043);
  - T045 y T046 necesitan T041 y T042; T047 necesita T037 y T042; T048 necesita T039; T049, T048;
  - T050 necesita T044; T051, T044, T045 y T047; T052 y T053, T046 y T047; T054, T038;
  - T055 en paralelo; T056 necesita T035; T057 → T058 → T059 (T059 necesita T055 y T056);
  - T060 necesita T039 y T057; T061 necesita T048; T062 necesita T059, T060 y T061;
  - T063 → T064 y T065, T066 y T067 necesitan T057 y T060; T068 necesita T055, T060 y T061.
- **Móvil** (fase 4), en paralelo con la web cuando el backend pasa su punto de control:
  - T069 primero; T070, T071 y T072 en paralelo (T072 se copia de T036 y T037);
  - T073 necesita T069 y T071; T074 necesita T069, T070, T071 y T073; **T075 justo después de
    T074**: si `expo-image` no hace lo que dice research.md, punto 10, lo demás cambia;
  - T076 en paralelo; T077 necesita T074; T078 y T079 necesitan T074, T076 y T077;
  - T080 y T081 necesitan T076 y T077; T082, T072 y T077; T083, T074;
  - T084 necesita T079; T085, T079, T080 y T082; T086 a T088, T081 y T082; T089, T073; T090
    al final.
- **Cierre y validación** al final. Los criterios `[backend]` (V01 y V80 a V86) se pueden validar
  en cuanto termina la fase 2.

## Paralelo, por ejemplo

```text
Preparación: T002→T003→T004→T005 (diseño) ‖ T001→T010 (contrato) ‖ T006 ‖ T007 ‖ T008 ‖ T009
Backend:     T011→T012 ‖ T013→T014 ‖ T015→T016→T017 ‖ T018 ‖ T028 ‖ T033
             luego T019→T020→T021 ‖ T022, T023→T024→T025 ‖ T026 ‖ T027, y T029→T030→T031 ‖ T032
Web, base:   T034 ‖ T035 ‖ T036→T037 ‖ T038
Web, piezas: T039→T040 ‖ T041, T042, luego T043→T044 ‖ T045 ‖ T046 ‖ T047 ‖ T048→T049
Web, cursar: T050 ‖ T051 ‖ T052 ‖ T053 ‖ T054
Web, editor: T055 ‖ T056, T057→T058→T059, T060 ‖ T061, luego T062 ‖ T063→T064 ‖ T065 ‖ T066 ‖ T067 ‖ T068
Móvil:       T069, T070 ‖ T071 ‖ T072, T073→T074→T075, luego T076 ‖ T077, T078 ‖ T079 ‖ T080 ‖ T081 ‖ T082 ‖ T083
             y T084 ‖ T085 ‖ T086 ‖ T087 ‖ T088 ‖ T089, y T090
```

## Estrategia

1. Contrato y diseño en `brote_specs` (T001 a T006), porque todo lo demás los usa. Las ramas de
   código salen de la rama de F12 (T007 a T009), y se ponen al día con `dev` cuando F11 y F12 se
   fusionen.
2. Backend completo y probado con curl (punto de control de la fase 2): cubre los ocho
   criterios `[backend]` y deja las seis lecciones de prueba para los clientes.
3. **Lo más incierto es `expo-image` en el teléfono** (research.md, punto 10). T074 y T075 lo
   despejan con el GIF de la lección 16 antes de los mosaicos y el visor: conviene adelantarlos,
   aunque la web vaya después.
4. **Lo más largo es el editor web** (T055 a T068): las subidas dentro del borrador (T057 a T059)
   se prueban primero con la teoría (T063 y T064), que es la más simple, antes de los demás tipos.
5. En la web, primero lo que puede romper F03, F05 y F11 (`OpcionRespuesta`, `ElementoRespuesta`,
   `BarraRespuesta` y `PortadaCurso`, T045 a T049) y repetir esas comprobaciones (quickstart.md,
   sección 4); después cursar y editar.
6. Cierre de documentos y validación manual completa (V01 a V90) antes de los PR a `dev` de cada
   repo, con la spec enlazada y los criterios cubiertos.
