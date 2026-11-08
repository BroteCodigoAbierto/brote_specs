# Investigación: F13 Imágenes propias en los cursos

Lo que esta feature tiene de nuevo. El stack, `fetch` propio, Context y la validación
manual ya están decididos (`docs/decisiones/`).

## 1. Dónde se guardan las imágenes

- **Decisión**: en PostgreSQL, en una tabla `imagen` con los bytes (`bytea`) y sus datos.
  Lo decidió el usuario al planear (2026-11-07) y queda como la decisión 0016.
- **Por qué**: no suma servicio ni paquete; borrar un curso borra sus imágenes en la
  misma transacción (`ON DELETE CASCADE`); el respaldo de la base las incluye; desplegar
  sigue siendo una API y una base. Con 10 MB por imagen, 25 MB por lección y 200 MB por
  curso, servirlas desde la API alcanza para el MVP.
- **Cuidado**: ninguna consulta de metadatos debe traer `datos`. Prisma solo lo lee con
  `select: { datos: true }`, y eso solo lo pide `GET /imagenes/:idImagen`.
- **Descartadas**: el disco del servidor (necesita un volumen que persista, borrar queda
  fuera de la transacción y el respaldo va aparte) y un almacenamiento compatible con S3
  (un contenedor más, el SDK de AWS y URLs firmadas para que los borradores sigan
  privados).

## 2. Cómo se sube un archivo

- **Decisión**: `POST /editor/cursos/:idCurso/imagenes` con el archivo crudo como cuerpo y
  su `Content-Type` (`image/jpeg`, `image/png`, `image/webp` o `image/gif`), leído con
  `express.raw` solo en esa ruta, con `limit` de 10 MB. Una imagen por petición.
- **Por qué**: `express.raw` viene con Express 5; un archivo por petición deja que cada
  campo muestre su propio "Subiendo imagen…" y su propio error.
- **Errores del lector**: si el cuerpo pasa de 10 MB, `express.raw` lanza
  `entity.too.large`. Un envoltorio en la ruta (`leerArchivo`) lo convierte en `413` con
  "La imagen puede pesar hasta 10 MB.", para no confundirlo con el límite de 2 MB del JSON.
- **Orden**: sesión (401), cuerpo (413 y 400), curso (404 y 403) y espacio (400), como en
  F05.
- **Descartada**: `multipart/form-data` con `multer` o `busboy` (un paquete para un solo
  archivo por petición).

## 3. Leer una imagen en el servidor sin paquetes

- **Decisión**: `leerImagen` (`src/validacion/imagenes.ts`) reconoce el formato por sus
  primeros bytes y saca el ancho y el alto de su cabecera:
  - PNG: la firma `89 50 4E 47 0D 0A 1A 0A` y el bloque `IHDR`.
  - JPEG: `FF D8 FF` y el primer marcador `SOF0` a `SOF15` (menos `C4`, `C8` y `CC`).
  - WebP: `RIFF....WEBP` y su bloque `VP8 `, `VP8L` o `VP8X`.
  - GIF: `GIF87a` o `GIF89a` y la pantalla lógica.
  Si no es ninguno, o la cabecera está cortada, la imagen no se puede leer.
- **Reglas**: el formato real manda sobre el `Content-Type`. Un JPEG, PNG o WebP de más de
  1600 px por lado se rechaza: la web siempre los reduce (punto 4), así que solo llega uno
  así si alguien salta la web.
- **Datos ocultos y animación** (principio III: la spec dice que una foto se guarda sin
  ellos, y el servidor no lo deja solo en manos de la web): `leerImagen` también dice si la
  imagen los trae, recorriendo sus bloques, y el servidor la rechaza con
  `imagenSinPreparar`. Se buscan:
  - JPEG: los segmentos `APP1` (EXIF, donde van la ubicación, la cámara y la orientación, y
    XMP) y `APP13` (IPTC), antes del primer `SOS`;
  - PNG: los bloques `eXIf`, `tEXt`, `zTXt` e `iTXt` (texto y XMP) y `acTL` (APNG);
  - WebP: los bloques `EXIF`, `XMP ` y `ANIM`.
  La web nunca los manda: `convertToBlob` solo escribe la imagen. Los GIF no se revisan:
  se suben tal cual y no son fotos. Se descartó borrar esos bloques en el servidor: es más
  código (en WebP hay que reescribir el encabezado `VP8X` y el tamaño del `RIFF`) para algo
  que el editor ya hace.
- **Seguridad**: la imagen se guarda y se sirve tal cual, sin interpretarla. Al servirla
  van `X-Content-Type-Options: nosniff` y `Content-Security-Policy: default-src 'none';
  sandbox`, así que un archivo raro nunca se abre como página.
- **Descartada**: `sharp` (dependencia nativa pesada solo para leer dos números de la
  cabecera; reducir lo hace la web).

## 4. Reducir la imagen en la web

- **Decisión**: `src/utilidades/imagenes.ts` (web), `prepararImagen(archivo)`:
  1. Por el tipo o la extensión: si no es JPEG, PNG, WebP ni GIF, "Elige una imagen JPEG,
     PNG, WebP o GIF." (un SVG o un HEIC caen aquí).
  2. Por el peso: más de 10 MB, o un GIF de más de 5 MB, su mensaje.
  3. Un GIF se sube tal cual, después de comprobar que el navegador lo puede abrir
     (`createImageBitmap`). Si no, "No se pudo leer la imagen. Elige otra.".
  4. Los demás se abren con `createImageBitmap(archivo, { imageOrientation: "from-image" })`,
     que endereza la foto según su EXIF, y se dibujan en un `OffscreenCanvas` de hasta
     1600 px por su lado más largo, con `imageSmoothingQuality = "high"`.
  5. Se codifican con `convertToBlob({ type: "image/webp", quality: 0.85 })`, que conserva
     la transparencia. Si el navegador no sabe hacer WebP (devuelve otro tipo), un JPEG
     de calidad 0.85 si la imagen es opaca, o un PNG si tiene transparencia.
- **Por qué siempre se vuelve a codificar**: así se van los datos ocultos (EXIF, la
  ubicación y el modelo de la cámara) y la orientación queda aplicada, también en una
  imagen chica. Un PNG o un WebP animados quedan quietos, como pide la spec.
- **Determinismo**: el mismo archivo en el mismo navegador da los mismos bytes, así que
  subirlo dos veces da la misma imagen (punto 6).
- **Descartadas**: reducir en el servidor (necesita `sharp`) y subir el original (una
  foto de teléfono pesa de 3 a 5 MB).

## 5. Servir las imágenes

- **Decisión**: `GET /imagenes/:idImagen` (ruta nueva, `src/rutas/imagenes.ts`), con
  `requerirSesion`. Responde si el curso de la imagen está publicado o si quien pide es
  su autor; si no, `404`, igual que si no existe (F02, F03).
- **Cabeceras**: `Content-Type` del formato, `Cache-Control: private, max-age=31536000,
  immutable` (una imagen nunca cambia: otra imagen tiene otro id), `ETag` con su huella,
  `nosniff` y la CSP del punto 3. Con `If-None-Match`, `304`.
- **Web**: un `<img src>` normal. La cookie de sesión es `SameSite=Lax` y la web y la API
  son del mismo sitio (`localhost`), así que el navegador la manda. Para los GIF, `fetch`
  con `credentials: "include"` (punto 9): la API ya responde con CORS a la web.
- **Móvil**: `expo-image` con `source={{ uri, headers }}`, con `Authorization: Bearer` y
  `X-Cliente: movil`, como `pedir()` (`src/servicios/api.ts`).
- **Rendimiento**: cada imagen comprueba la sesión, como cualquier ruta. Con 25 MB por
  lección y la caché del cliente, alcanza; si estorba, se mide antes de cambiarlo.

## 6. Imágenes iguales, espacio del curso y limpieza

- **Huella**: SHA-256 de los bytes guardados (`node:crypto`). `(id_curso, huella)` es
  único: subir otra vez el mismo archivo devuelve la imagen que ya existe (`200` en vez de
  `201`) y le renueva `subida_en`, para que no se borre mientras se usa en un formulario.
  Por eso "repetida" en el cliente es comparar ids.
- **Quién usa cada imagen**: `leccion.imagenes` (`text[]`, por defecto `{}`) guarda los
  ids que usa la lección. Lo escribe `guardarLeccion`, junto con las actividades. La
  portada es `curso.id_portada`. Así, "se usa en el curso" es una consulta sin leer el
  JSON de las actividades.
- **Espacio del curso**: la suma de `peso` de las imágenes del curso. Como lo que se deja
  de usar se borra (abajo), esa suma es justo lo que dice la spec: lo que se usa más lo
  subido que aún no se guarda.
- **Borrar al momento**: al guardar una lección, las imágenes que tenía y ya no tiene, si
  ninguna otra lección del curso ni la portada las usan, se borran en la misma
  transacción. Lo mismo al cambiar la portada y al eliminar una lección. Al eliminar el
  curso, todas (cascada).
- **Borrar a un día**: `limpiarImagenesSinUsar(idCurso?)` borra las de más de un día
  (`subida_en`) que nada usa. Corre al subir una imagen (para ese curso, antes de contar
  el espacio), al arrancar la API y cada hora (`setInterval(...).unref()` en
  `servidor.ts`).
- **Concurrencia**: subir, guardar una lección, guardar los datos y eliminar pasan por
  `conCursoEditable`, que bloquea la fila del curso (`FOR UPDATE`): dos subidas a la vez
  no se pasan del espacio.
- **Caso raro aceptado**: una imagen que se reusa en un formulario sin guardar (misma
  huella) y se quita y se guarda en otra lección se borra; al guardar el formulario, sale
  "Esta imagen ya no está. Elige otra." (spec, "Casos de error").

## 7. La forma de una imagen en el contrato

- **Decisión**: cada imagen que usa una actividad viaja completa: `ImagenActividad =
  Imagen & { textoAlternativo?: string }`, con `id`, `formato`, `ancho`, `alto` y `peso`.
- **Por qué**: el cliente reserva el lugar de la imagen con su proporción antes de que
  llegue, el editor suma el peso de la lección sin pedir nada y `formato` dice si es GIF.
  Al guardar, el servidor comprueba que cada id es una imagen del curso y **reescribe**
  `formato`, `ancho`, `alto` y `peso` con lo de la base: el cliente no puede mentir.
- **Dónde va** (sin cambiar la forma de lo que ya existe, para no migrar el JSON):
  - Teoría: `imagenes?: ImagenActividad[]`, una por cada `MARCA_IMAGEN` del texto.
  - Opción múltiple: `imagen?: ImagenActividad` (la de la pregunta) y una tercera forma de
    opción, `{ imagen: ImagenActividad }`.
  - Emparejar: `izquierda` y `derecha` son `ContenidoElemento = string | ImagenActividad`.
  - Clasificar: un elemento es `{ texto, categoria }` o `{ imagen, categoria }`.
  - Ordenar: `elementos: ContenidoElemento[]`.
- **La portada**: `CursoEnEditor.portada: Imagen | null` (el editor muestra su tamaño y
  peso) y `idPortada: string | null` en `ResumenCurso` y `CursoDelAutor` (la portada solo
  necesita la dirección). `CuerpoDatosCurso` gana `idPortada?: string | null`: sin él no
  cambia, con `null` se quita.
- **El espacio**: `CursoEnEditor.pesoImagenes` (bytes). El de la lección lo suma el
  cliente con los `peso` de sus imágenes, sin repetir ids.

## 8. La marca de la teoría

- `MARCA_IMAGEN = "[imagen]"`, en el contrato. Solo cuenta escrita así.
- `partirTeoria(texto)` (en `utilidades/actividades.ts`, igual en los dos clientes)
  devuelve bloques `{ parrafo }` o `{ imagen: n }`: primero parte en párrafos por los
  renglones en blanco (como hoy `partirParrafos`) y después parte cada párrafo en sus
  marcas, quitando los espacios y saltos de línea de los bordes de cada trozo y los trozos
  vacíos. La n-ésima marca es `imagenes[n]`.
- El servidor cuenta las marcas como `contarMarcas` cuenta `___`.

## 9. GIF con pausa en la web

- **Problema**: un `<img>` con un GIF no se puede pausar, y dibujarlo en un `canvas` da el
  primer cuadro, no el actual.
- **Decisión**: `ImagenCurso` (web), con un GIF, lo trae con `fetch` y lo decodifica con
  `ImageDecoder` (WebCodecs, en Chrome desde la versión 94). Dibuja cada cuadro en un
  `canvas` y programa el siguiente con su `duration`; pausar detiene el temporizador y deja
  el cuadro actual; reanudar sigue con el siguiente. Respeta el número de repeticiones del
  archivo (`repetitionCount`). Con "reducir movimiento" (`matchMedia`), empieza pausado en
  el cuadro 0. Quieto (miniatura), dibuja el cuadro 0 y no programa nada.
- **Sin `ImageDecoder`** (no se valida: la web se valida en Chrome): un `<img>`; pausar lo
  cambia por un `canvas` con el primer cuadro y reanudar vuelve al `<img>`, que empieza
  desde el principio.
- **Accesibilidad**: el `canvas` lleva `role="img"` y el texto alternativo.
- **Descartada**: una librería de GIF (`gifuct-js` y similares): `ImageDecoder` ya lo
  resuelve en el navegador que se valida.

## 10. GIF con pausa en el móvil: `expo-image`

- **Decisión**: agregar `expo-image` (~58.0.17, la del SDK 58, ya incluida en Expo Go).
  Da `autoplay`, `startAnimating()` y `stopAnimating()` en iOS y Android, `headers` en la
  fuente, `contentFit` (`contain` y `cover`), `onLoad` y `onError`, caché en disco e
  `Image.prefetch(urls, { headers, cachePolicy })`.
- **Por qué**: el `Image` de React Native no pausa un GIF, en Android no siempre anima GIF
  y no tiene precarga con cabeceras. Pintar los cuadros a mano en el móvil pediría un
  decodificador.
- **Por confirmar en el teléfono** (como el teclado en F12): que `stopAnimating` deja el
  cuadro actual y `startAnimating` sigue desde ahí, y que `autoplay={false}` muestra el
  primer cuadro. Si no, se anota aquí y en la spec.
- Todas las imágenes del móvil usan `expo-image`, no solo los GIF, para tener una sola
  caché y una sola forma de mandar el token.

## 11. Precarga y reintento

- **Precarga** (spec: todas al abrir la lección): `usePrecargarImagenes(actividades)` en
  el reproductor de cada cliente recorre las actividades (`imagenesDe(actividad)`, en
  `utilidades/imagenes.ts`) y pide cada imagen una vez:
  - Web: las que no son GIF con `new Image().src` y los GIF con `fetch` (los dos llenan la
    caché del navegador, que con `immutable` las sirve sin pedirlas otra vez). Por separado
    porque el `<img>` y el `fetch` con CORS no comparten la misma entrada de caché.
  - Móvil: `Image.prefetch(urls, { headers, cachePolicy: "memory-disk" })`.
- **Reintento** (spec: solas): un contexto del reproductor, `ContextoImagenes`, lleva un
  número `intento`. Cada `ImagenCurso` que falló vuelve a pedirse cuando cambia (su `key`
  incluye el intento):
  - Web: sube al pasar de actividad.
  - Móvil: sube cuando `Network.addNetworkStateListener` (`expo-network`, ya instalado)
    pasa de sin conexión a con conexión.
  Sin proveedor (la vista previa del editor), el intento es 0 y no hay precarga.

## 12. El visor de una imagen

- **Web**: `VisorImagen` es un `<dialog>` modal (como `Dialogo`), a pantalla completa, con
  el fondo `fondoVisor`. `showModal()` deja el foco dentro y Esc lo cierra; pulsar el
  fondo (el propio `<dialog>`, no la imagen) también. Al cerrar, el foco vuelve a la
  imagen que lo abrió. La imagen va con `object-fit: contain` a `100dvw` × `100dvh`, menos
  el margen.
- **Móvil**: `Modal` de React Native (`transparent`, `onRequestClose` para el botón de
  volver de Android, `accessibilityViewIsModal`), con un `GestureHandlerRootView` adentro
  (los gestos de un `Modal` no llegan al de la raíz en Android). `Gesture.Simultaneous` de
  `Pinch` y `Pan` (ya instalados), con la escala entre 1 y 4; el arrastre solo con escala
  mayor que 1. Con "reducir movimiento", sin animación al abrir y cerrar.
- **Descartada**: una librería de visor (`react-native-image-viewing` y similares): los
  gestos ya están en el proyecto.

## 13. El editor: subidas dentro del borrador

- **Problema**: una subida tarda; mientras, el autor puede escribir en otro campo,
  seleccionar otro bloque o moverlo. Si el campo guardara el resultado con el borrador que
  tenía al empezar, borraría lo escrito entretanto.
- **Decisión**: el valor de un campo de imagen en un borrador es `ValorImagen` (web,
  `src/editor/imagenes.ts`): `{ clase: "imagen", imagen: Imagen | null, textoAlternativo,
  subida: string | null, error: string | null, perdida: boolean }`.
  1. Al elegir el archivo, el campo pone `subida` con un id nuevo y llama a
     `subirImagen` de `ContextoSubidas` (lo da `EditorLeccion`).
  2. Al terminar, el contexto despacha `{ tipo: "imagenSubida", idSubida, imagen | error }`
     al reductor, que recorre **todos** los borradores (`reemplazarImagenes`, genérico:
     busca objetos con `clase: "imagen"`) y actualiza el que tenga esa subida. Así no
     importa dónde esté el campo ni si el inspector se volvió a montar.
- **Lo que sale de recorrer borradores** (`recorrerImagenes`, sin saber de ningún tipo):
  cuántas subidas hay (deshabilita "Guardar lección" y "Probar lección"), el peso de la
  lección (ids sin repetir) y marcar `perdida` en las imágenes que el servidor dijo que ya
  no están (`campos["imagenes.<id>"]`, contracts/api.md).
- **Validar**: cada `editorX.ts` usa `errorImagen(valor)` (`Elige una imagen.` o `Esta
  imagen ya no está. Elige otra.`) y `aImagenActividad(valor)`.
- **Sesión perdida al subir**: como al guardar (F05), se guarda la copia y se va a
  "Entrar". Al recuperarla, `limpiarSubidas` quita `subida` de todos los campos: la imagen
  anterior se queda y la que se estaba subiendo no.
- **Portada**: el mapa no tiene borradores; `DatosCurso` usa el mismo `CampoImagen` con el
  valor en su estado y una ref al último `alCambiar`.

## 14. La barra de respuesta con miniaturas

- **Decisión**: `BarraRespuesta` gana `lineas?: ParteRespuesta[][]`, donde una parte es
  `{ texto }` o `{ imagen: ImagenActividad }`. Cada línea es un renglón; cada imagen, una
  `MiniaturaImagen` de 48 px seguida de su texto alternativo, si lo tiene.
- `detalleParejas`, `detalleClasificar`, `detalleOrdenar` y la opción múltiple arman
  `lineas` cuando hay alguna imagen; si no, siguen dando el `detalle` de texto de hoy, así
  que F03 y F11 no cambian.
- **Anuncio**: el texto que se lee (web `aria-live`, iOS `announceForAccessibility`) usa
  el texto alternativo de cada imagen, o "Imagen".

## 15. Datos de prueba sin archivos binarios

- **Decisión**: las imágenes de "Actividades de prueba" se dibujan en código al sembrar:
  `scripts/imagenes-prueba.ts` (backend) dibuja figuras simples en un búfer RGBA y lo
  codifica como PNG (`node:zlib`, `deflateSync` y `crc32`) o como GIF animado (un
  codificador LZW de unas 60 líneas). Nada de archivos binarios en git.
- `datos-prueba.ts` pone en las actividades una referencia por nombre
  (`imagenPrueba("circulo-rojo", "Círculo rojo")`); `sembrar-cursos.ts` crea cada imagen en
  el curso, cambia la referencia por la imagen guardada y llena `leccion.imagenes` y
  `curso.id_portada`.
- **Para validar** (quickstart, sección 1.2), `scripts/archivos-validacion.ts` deja en una
  carpeta los archivos para subir: PNG grandes y chicos, uno transparente, GIF de 2 y 6 MB
  (ruido, que no se comprime), un SVG y un texto con extensión `.png`. Los JPEG y el HEIC
  los saca `sips` de macOS a partir de esos PNG, y el script mete un bloque EXIF
  (orientación 6, ubicación y modelo de cámara) en un JPEG.

## 16. Medidas de los mosaicos

Se escriben en `docs/diseno.md` antes del código (plan.md, "Interfaz"). Lo que sale de la
spec: dos opciones por fila en un teléfono de 360 px (con 20 px de margen y 12 de
separación, cada mosaico mide 154 px); en emparejar, el ancho de la columna; en clasificar
y ordenar, 88 px, que deja tres por fila en una categoría de un teléfono de 360 px y
cumple los 44 px de área táctil.
