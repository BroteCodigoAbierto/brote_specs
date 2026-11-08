# Plan técnico: F13 Imágenes propias en los cursos

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-11-07 | **Rama**: `feature/F13-imagenes-propias`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

Brote empieza a guardar archivos. Las imágenes van en PostgreSQL, en una tabla `imagen`
con sus bytes (decisión 0016, tomada con el usuario al planear), y el backend gana dos
rutas: subir una imagen a un curso (el archivo crudo, con `express.raw`) y servirla con
permisos y caché larga. La web reduce cada foto antes de subirla (`createImageBitmap` y
`OffscreenCanvas`, sin paquetes) y la sube tal cual si es GIF. Las actividades llevan cada
imagen completa (`ImagenActividad`: id, formato, tamaño, peso y texto alternativo), y el
servidor la comprueba y la reescribe al guardar. Los dos clientes ganan los mismos
componentes de imagen (cargar con reintento, mosaico, miniatura, visor y pausa de GIF); el
móvil usa `expo-image`, el único paquete nuevo, para pausar GIF, mandar el token y
precargar. El contrato sube a 0.10.0.

**Ramas**: como dice `continuar.md` ("Las features que siguen", paso 1), mientras F11 y F12
no estén en `dev`, las ramas de F13 salen de `feature/F12-actividades-codigo-terminal` en
los cuatro repos. Es la misma excepción a la decisión 0013 que usó F12: cuando las
anteriores se fusionen, cada rama hace `git merge origin/dev`, y sus PRs van después.

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | El plan sigue la spec y sus aclaraciones. Al planear se corrigió que "Actividades de prueba" tiene 12 lecciones, no 14 |
| II. Un producto, cuatro repos | sí | `Imagen`, `ImagenActividad`, los límites y los mensajes en `contrato/` 0.10.0, copiados a los tres repos |
| III. El backend es la autoridad | sí | El servidor lee el formato real de los bytes, el peso y los lados, cuenta el espacio con el curso bloqueado, comprueba que cada imagen usada es del curso y reescribe sus datos. Las imágenes de un borrador solo las trae su autor. Se sirven con `nosniff` y una CSP que impide abrirlas como página, y el texto alternativo se muestra siempre como texto |
| IV. Actividades extensibles | con excepciones (ver "Excepciones a la constitución") | No hay tipo nuevo: las imágenes son una capacidad de cinco tipos y del curso. Cambian sus validadores, componentes y formularios, y además piezas comunes: el reproductor (precarga y reintento), el núcleo del editor (subidas, peso, imágenes perdidas) y componentes compartidos |
| V. Estados explícitos | sí | Cada imagen tiene cargando, cargada y no cargó (con reintento); el campo de imagen, vacío, subiendo, con imagen, error y perdida; guardar espera a las subidas. Las pantallas que cargan datos no cambian de estados |
| VI. Dependencias justificadas | sí | Solo `expo-image` en el móvil, en "Dependencias nuevas". El backend y la web, sin paquetes: `express.raw`, `node:crypto`, `node:zlib`, `createImageBitmap`, `OffscreenCanvas` e `ImageDecoder` ya están |
| VII. Estilo propio | sí | Identificadores en español sin acentos (`ImagenCurso`, `prepararImagen`, `pesoImagenes`, `textoAlternativo`) |
| VIII. Terminado = validado | sí | Cada uno de los 90 criterios tiene pasos en `quickstart.md`. Sin pruebas automáticas (decisión 0012) |

Revisión después del diseño: sin cambios; las excepciones están abajo.

## Cambios al contrato

`contrato/VERSION` 0.9.0 → **0.10.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- Nuevos: `FORMATOS_IMAGEN`, `FormatoImagen`, `TIPO_MIME_IMAGEN`, `Imagen`,
  `ImagenActividad`, `RespuestaImagen`, `RUTA_IMAGENES`, `MARCA_IMAGEN`,
  `LIMITES_IMAGENES`, `MENSAJES_IMAGENES` y `ContenidoElemento`.
- Cambian: `ActividadTeoria` (`imagenes`), `OpcionRespuesta` (`{ imagen }`),
  `ActividadOpcionMultiple` (`imagen`), `ParejaEmparejar`, `ElementoClasificar`,
  `ActividadOrdenar`, `ResumenCurso` y `CursoDelAutor` (`idPortada`), `CuerpoDatosCurso`
  (`idPortada?`) y `CursoEnEditor` (`portada`, `pesoImagenes`).

## Cambios al modelo de datos

- Tabla `imagen`, columnas `curso.id_portada` y `leccion.imagenes`, en la migración
  `f13_imagenes`. Detalle en [data-model.md](./data-model.md).
- Al cerrar, `specs/02-modelo-datos.md` recibe la entidad Imagen y lo que cambia en Curso,
  Leccion y Actividad.

## API

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| POST | `/editor/cursos/:idCurso/imagenes` | Su autor, con el curso en borrador | Sube una imagen al curso (nueva) |
| GET | `/imagenes/:idImagen` | Con sesión: su autor, o cualquiera si el curso está publicado | Los bytes de la imagen (nueva) |
| PUT | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Comprueba las imágenes y el peso de la lección; borra las que dejó de usar |
| DELETE | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Borra también sus imágenes sin uso |
| PUT | `/editor/cursos/:idCurso` | Su autor, sin publicar | Acepta `idPortada` |
| GET | las que responden cursos | Como en F02, F04 y F05 | Traen `idPortada`; el editor, `portada` y `pesoImagenes` |

Detalle en [contracts/api.md](./contracts/api.md).

## Interfaz

Según `docs/diseno.md`. Lo nuevo se agrega **primero** ahí (es una tarea) y después a los
dos clientes con el mismo nombre.

### Lo que se agrega a `docs/diseno.md`

- **Tokens**:

  | Token | Valor | Uso |
  |---|---|---|
  | `fondoVisor` (2.1) | `rgba(10,9,26,0.94)` en los dos modos | Fondo del visor de una imagen |
  | `mosaicoOpcion` (2.3) | 144 px (mínimo) | Opciones de imagen: rejilla de `minmax(144px, 1fr)` en la web; en el móvil, tantas columnas de al menos 144 px como quepan, y nunca menos de dos |
  | `mosaicoElemento` (2.3) | 88 px | Mosaicos de clasificar y ordenar, y lugares de ordenar con imagen |
  | `miniatura` (2.3) | 48 px | Imágenes en la barra inferior |
  | `altoImagenMax` (2.3) | 50 % del alto de la pantalla | Imágenes de la teoría y de la pregunta |

- **Componentes** (sección 4, en los dos clientes):

  | Componente | Props clave | Notas |
  |---|---|---|
  | `ImagenCurso` | `imagen`, `ajuste` (`contener`, `cubrir`), `quieta`, `pausada`, `etiqueta` | La base de todas: trae la imagen con la sesión y reserva su lugar con la proporción de `ancho` y `alto`. Cargando: fondo `vidrioSuave`. No cargó: `ImageOff` de 24 px en `textoTenue` y `etiqueta` (el texto alternativo) o "No se pudo cargar la imagen" en `nota` `textoSuave`, centrados. Un GIF anima salvo con `quieta` o `pausada` (research.md, puntos 9 y 10). Reintenta con `ContextoImagenes` (punto 11) |
  | `BotonPausa` | `pausada`, `alPulsar` | Círculo de 44 px `vidrioOpaco` con `sombraSuave` e icono `Pause` o `Play` de 20 px en `texto`, en la esquina inferior izquierda del GIF, a espacio 3 del borde. Nombre: "Pausar animación" o "Reanudar animación". Nunca va dentro de otro botón |
  | `ImagenAmpliable` | `imagen` | La imagen de la teoría y de la pregunta: un botón con `ImagenCurso` `contener`, radio `medio`, tan ancho como la actividad o como la imagen (lo menor), sin pasar de `altoImagenMax`, centrado. Abre `VisorImagen`. Nombre: el texto alternativo o "Imagen", con "Ampliar" (web: en la etiqueta; móvil: `accessibilityHint` "Toca para ampliarla") |
  | `VisorImagen` | `imagen`, `abierto`, `alCerrar` | A pantalla completa sobre `fondoVisor`: la imagen `contener` con margen espacio 5 y "Cerrar" (`X`) arriba a la derecha, con el aspecto de `BotonPausa`. Un GIF lleva su `BotonPausa`. Web: `<dialog>` modal, Esc y pulsar el fondo cierran, el foco vuelve a la imagen. Móvil: `Modal` con pellizcar (1 a 4 veces) y arrastrar; el botón de volver de Android lo cierra |
  | `MosaicoImagen` | `imagen`, `quieta` | Cuadro con fondo `vidrioSuave` y `ImagenCurso` `contener` con relleno espacio 2. Llena el cuadro que le dé quien lo usa |
  | `MiniaturaImagen` | `imagen` | 48 px (`miniatura`), radio `chico`, fondo `vidrioOpaco`, `ImagenCurso` `contener` `quieta` |
  | `OpcionRespuesta` (cambia) | `imagen` | Con `imagen`: mosaico cuadrado (`mosaicoOpcion`) con `MosaicoImagen` y los bordes y colores de siempre. El número (web) es una insignia de 22 px en la esquina superior izquierda y el icono de correcta o incorrecta, otra en la superior derecha. Con GIF, el `BotonPausa` es hermano del botón |
  | `ElementoRespuesta` (cambia) | `imagen`, `forma` `mosaico` | Lo mismo para relacionar: la `marca` en la esquina superior izquierda y el icono en la superior derecha. Mide `mosaicoElemento`, o el ancho de su columna en emparejar |
  | `LugarElemento` (cambia) | `mosaico` | Vacío, mide lo mismo que un mosaico, con su borde punteado |
  | `BarraRespuesta` (cambia) | `lineas` | Lista de líneas; cada parte es un texto o una imagen. Cada imagen es una `MiniaturaImagen` seguida de su texto alternativo, en una fila. Va en la zona que se desplaza, como el `detalle` (research.md, punto 14) |
  | `PortadaCurso` (cambia) | `idPortada` | Con imagen: `ImagenCurso` `cubrir`; mientras carga, el color de la generada sin la inicial; si no carga, la generada completa |

- **Editor (solo web)**:

  | Componente | Props clave | Notas |
  |---|---|---|
  | `CampoImagen` | `id`, `etiqueta`, `valor`, `alCambiar`, `alElegirArchivo`, `error`, `soloFotos`, `conTextoAlternativo`, `deshabilitado` | Vacío: `Boton` `secundario` chico "Elegir imagen" con `ImagePlus` y la nota de formatos en `nota` `textoSuave`. Subiendo: un `IndicadorCarga` chico y "Subiendo imagen…". Con imagen: una `MiniaturaImagen` grande (96 px), "{ancho} × {alto} px · {peso}" en `nota`, "Cambiar" y "Quitar" (`fantasma` chico) y, con `conTextoAlternativo`, un `CampoTexto` "Texto alternativo" con su ayuda. El error, debajo, como en `CampoTexto`. El `<input type="file">` está oculto y lo abre el botón |
  | `VistaPortada` | `idCurso`, `titulo`, `portada` | La portada del mapa: dos `PortadaCurso`, en tarjeta (16:9) y en detalle (cuadrada), lado a lado |
  | `PesoImagenes` | `peso`, `maximo`, `texto` | "{texto}: {x} de {máximo} MB" en `nota` `textoSuave`; si pasa del máximo, en `error` con `CircleAlert` |

- **Actividades** (sección 6):
  - **Teoría con imágenes**: cada `[imagen]` es una `ImagenAmpliable` entre párrafos.
  - **Opción múltiple con imágenes**: la imagen de la pregunta, `ImagenAmpliable`, entre la
    pregunta y el código. Las opciones de imagen, en rejilla de `mosaicoOpcion`.
  - **Relacionar con imágenes**: emparejar con mosaicos del ancho de su columna; clasificar
    y ordenar con mosaicos de `mosaicoElemento`, en filas que se acomodan solas.
  - **Imagen que no carga** y **GIF**: los estados de `ImagenCurso` y `BotonPausa`.
  - **Al fallar**: las imágenes de la respuesta, como `MiniaturaImagen` en `lineas`.
  - **Teclado** (web): Tab llega a cada `ImagenAmpliable` y a cada `BotonPausa`; Enter o la
    barra espaciadora los pulsan. En la opción múltiple, las teclas 1 a 9 siguen eligiendo.
  - **Iconos**: `ImageOff` (no cargó), `Pause` y `Play` (GIF), `X` (cerrar el visor),
    `ImagePlus` (elegir imagen).

### Por pantalla

| Pantalla | Usa | Nuevo |
|---|---|---|
| Reproductor de la lección (web y móvil) | `BarraRespuesta`, `OpcionRespuesta`, `ElementoRespuesta`, `LugarElemento`, `ZonaElementos` | `ImagenCurso`, `ImagenAmpliable`, `VisorImagen`, `MosaicoImagen`, `MiniaturaImagen`, `BotonPausa`; `ContextoImagenes` con precarga y reintento |
| Catálogo, detalle, "Mi panel", "Mis cursos" (web y móvil) | `TarjetaCurso`, `TarjetaCursoAutor`, `PortadaCurso` | `PortadaCurso` con `idPortada` |
| Mapa del curso (web) | `Superficie`, `CampoTexto`, `CampoArea`, `Boton` | `CampoImagen` (`soloFotos`, sin texto alternativo), `VistaPortada`, `PesoImagenes` |
| Curso que no se edita (web) | `PortadaCurso` | `idPortada` |
| Lienzo, inspector (web) | Los formularios de F05 y F11 | `CampoImagen` en teoría, opción múltiple, emparejar, clasificar y ordenar; "Agregar imagen" en la teoría; `CampoSelector` para "Columna izquierda", "Columna derecha" y "Tipo de elementos" |
| Lienzo, barra superior (web) | La de F05 | `PesoImagenes` y la nota "Espera a que terminen de subir las imágenes." |
| Lienzo, vista previa y probar (web) | `VistaPrevia`, `ProbarLeccion` | Nada: montan la actividad real |

## Por repo

### brote_backend_express

- **Archivos**:
  - `prisma/schema.prisma`: modelo `Imagen` (`@@map("imagen")`, `@@unique([idCurso,
    huella])`); en `Curso`, `idPortada` (`@map("id_portada")`) con la relación
    `"PortadaCurso"` (`onDelete: SetNull`) y `imagenes` con `"ImagenesCurso"`; en
    `Leccion`, `imagenes String[] @default([])`.
  - `prisma/migrations/<fecha>_f13_imagenes/migration.sql`: la que genera
    `prisma migrate dev`, más a mano los `CHECK` de `formato`, `ancho`, `alto` y `peso`
    (data-model.md).
  - `src/validacion/imagenes.ts`, nuevo: `leerImagen(bytes)` → `{ formato, ancho, alto }`
    o `null` (research.md, punto 3) y `comprobarImagenSubida(bytes, tipo)`, que lanza el
    `ErrorApi` de cada caso.
  - `src/validacion/actividades.ts`: `validarImagenActividad(valor, campo)`, las formas de
    imagen en `validarTeoria` (con `contarMarcasImagen`), `validarOpcion` y
    `compararOpciones`, `validarPareja` y `validarEmparejar` (una forma por columna),
    `validarElementoClasificar`, `validarClasificar` y `validarOrdenar`; y, exportada,
    `idsDeImagenes(actividades)`. Los textos repetidos siguen comparándose solo entre
    textos.
  - `src/validacion/editor.ts`: `recortarTextos` recorta también cada
    `textoAlternativo`; `validarDatosCurso` acepta `idPortada` (texto, `null` o ausente).
  - `src/servicios/imagenes.ts`, nuevo: `subirImagen(idAutor, idCurso, bytes)`
    (dentro de `conCursoEditable`: limpia las viejas del curso, busca la huella, cuenta el
    espacio y crea), `traerImagen(idUsuario, idImagen)` (solo `datos` y lo de las
    cabeceras), `imagenesDelCurso(tx, idCurso, ids)`, `borrarSinUso(tx, idCurso, ids)`
    (las de esa lista que ninguna lección ni la portada usan) y
    `limpiarImagenesSinUsar(idCurso?)` (research.md, punto 6). `conCursoEditable` y
    `estadoDelCurso` se exportan desde `servicios/editor.ts` para usarlas aquí.
  - `src/servicios/editor.ts`: `guardarLeccion` (imágenes del curso, peso de la lección,
    reescribir datos, `imagenes`, borrar las que dejó), `borrarLeccion` (borrar las suyas
    sin uso), `actualizarCurso` (portada), `leerCursoEnEditor` (`portada` y
    `pesoImagenes`), `crearCurso` (`portada: null`, `pesoImagenes: 0`) y
    `traerCursosDelAutor` (`idPortada`).
  - `src/servicios/cursos.ts` (catálogo y detalle) y `src/servicios/progreso.ts` (cursos
    empezados): `idPortada`.
  - `src/rutas/imagenes.ts`, nuevo, montado en `/imagenes` en `src/rutas/index.ts`.
  - `src/rutas/editor.ts`: `POST /cursos/:idCurso/imagenes`, con `requerirSesion` y
    `leerArchivo` (`express.raw` con el `413` propio).
  - `src/servidor.ts`: `limpiarImagenesSinUsar()` al arrancar y cada hora, con `unref()`.
  - `scripts/imagenes-prueba.ts`, nuevo: dibuja figuras y las codifica en PNG y GIF, sin
    paquetes (research.md, punto 15).
  - `scripts/datos-prueba.ts`: la portada y las seis lecciones de "Actividades de prueba"
    (quickstart.md, sección 1.1), con `imagenPrueba(nombre, textoAlternativo?)`.
  - `scripts/sembrar-cursos.ts`: crea las imágenes de cada curso, cambia las referencias,
    llena `leccion.imagenes` y `curso.id_portada`.
  - `scripts/archivos-validacion.ts`, nuevo, con `npm run imagenes:validacion -- <carpeta>`:
    los archivos para subir del quickstart (sección 1.2). Llama a `sips` (macOS) para los
    JPEG y el HEIC, y mete el EXIF a mano.
  - `scripts/proxy-validacion.ts`, nuevo, con `npm run proxy:validacion`: un proxy de
    `:3001` a `:3000` que, a pedido (`POST /__modo/normal|bloquear|retrasar`), bloquea o
    retrasa `GET /imagenes/*`, para validar "no cargó", el lugar reservado y el reintento
    en la web y en el iPhone (quickstart.md, sección 1.4). Solo `node:http`.
- **Validación de entrada**: la forma, en la ruta (`validarActividades`, `validarDatosCurso`
  y `comprobarImagenSubida`); lo que necesita la base (que la imagen sea del curso, el
  espacio, el peso de la lección), en el servicio con el curso bloqueado. Los errores son
  `ErrorApi`, con los estados de contracts/api.md.
- **Notas**:
  - `bd:sembrar` valida las actividades antes de tocar la base, también con imágenes.
  - Ninguna consulta de metadatos trae `datos` (research.md, punto 1).
  - Comprobar con `npm run tipos`, `npm run lint` y la sección 2 del quickstart.

### brote_web_react

- **Páginas y rutas**: sin rutas nuevas. Cambian `paginas/MapaCurso/DatosCurso.tsx`
  (portada y peso del curso), `paginas/MapaCurso/CursoNoEditable.tsx`,
  `paginas/DetalleCurso/DetalleCurso.tsx` y `paginas/LienzoLeccion/EditorLeccion.tsx`
  (`ContextoSubidas`, `PesoImagenes` y la nota de esperar).
- **Componentes** (`src/componentes/`):
  - Nuevos: `ImagenCurso/`, `BotonPausa/`, `ImagenAmpliable/`, `VisorImagen/`,
    `MosaicoImagen/`, `MiniaturaImagen/`, `CampoImagen/`, `VistaPortada/` y
    `PesoImagenes/`.
  - Cambian: `OpcionRespuesta/`, `ElementoRespuesta/`, `LugarElemento/`, `BarraRespuesta/`,
    `PortadaCurso/`, `TarjetaCurso/` y `TarjetaCursoAutor/`.
- **Actividades** (`src/actividades/`):
  - `Teoria/`: `Teoria.tsx` con `partirTeoria`; `FormularioTeoria.tsx` con "Agregar imagen"
    y los grupos "Imagen {n}"; `editorTeoria.ts` y `grupos.ts` nuevo, como el de
    completar espacios.
  - `OpcionMultiple/`: imagen de la pregunta, "Imagen" en "Tipo de opciones" y las líneas
    de la barra.
  - `Emparejar/`, `Clasificar/` y `Ordenar/`: mosaicos al cursar; "Columna izquierda",
    "Columna derecha" y "Tipo de elementos" en el formulario.
  - `ReproductorLeccion/ReproductorLeccion.tsx`: `ContextoImagenes` con
    `usePrecargarImagenes` y el intento que sube al cambiar de actividad.
- **Editor** (`src/editor/`): `imagenes.ts`, nuevo (`ValorImagen`, `recorrerImagenes`,
  `reemplazarImagenes`, `limpiarSubidas`, `errorImagen`, `aImagenActividad`,
  `aValorImagen` y `pesoLeccion`, research.md, punto 13); `estadoLeccion.ts`, con las
  acciones `imagenSubida` y `marcarImagenesPerdidas` y la copia sin subidas.
- **Hooks**: `useEditorLeccion.ts` (no guarda ni prueba con subidas pendientes ni con más
  de 25 MB; lee `imagenes.<id>` de un `400`), `usePrecargarImagenes.ts` y
  `useReducirMovimiento.ts`, nuevos.
- **Contextos**: `ContextoImagenes.ts` (reproductor) y `ContextoSubidas.ts` (editor),
  nuevos.
- **Servicios**: `servicios/imagenes.ts`, nuevo (`subirImagen(idCurso, archivo)` con
  `pedir()` y el `Content-Type` de la imagen); `servicios/editor.ts`, `actualizarCurso`
  con `idPortada`.
- **Utilidades**: `utilidades/imagenes.ts`, nueva (`urlImagen`, `prepararImagen`,
  `imagenesDe`, `formatearPeso` y `formatearMegas`, research.md, puntos 4 y 11);
  `utilidades/actividades.ts` (`partirTeoria`, `textoOpcion` con imágenes) y
  `utilidades/relacionar.ts` (las líneas de la barra y los nombres de los elementos de
  imagen).
- **Estilos**: `tokens.css` gana `--color-fondo-visor`, `--mosaico-opcion`,
  `--mosaico-elemento`, `--miniatura` y `--alto-imagen-max`.
- **Estado**: local en cada componente; las subidas viven en el borrador (research.md,
  punto 13) y el intento de reintento, en `ContextoImagenes`.
- **Notas**:
  - `paleta.ts`, `Inspector`, `VistaPrevia`, `Secuencia` y `ProbarLeccion` no se tocan.
  - `useTeclasActividad` sigue igual: las teclas 1 a 9 no actúan con el foco en un
    `BotonPausa` porque es un botón.
  - Comprobar con `npm run tipos`, `npm run lint`, `npm run build` y en Chrome.

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**: sin rutas nuevas. `app/curso/[idCurso].tsx` pasa
  `idPortada` a `PortadaCurso`; `app/leccion/[idCurso]/[idLeccion].tsx` no cambia.
- **Componentes** (`src/componentes/`):
  - Nuevos: `ImagenCurso.tsx`, `BotonPausa.tsx`, `ImagenAmpliable.tsx`, `VisorImagen.tsx`,
    `MosaicoImagen.tsx` y `MiniaturaImagen.tsx`, con `expo-image`.
  - Cambian: `OpcionRespuesta.tsx`, `ElementoRespuesta.tsx`, `LugarElemento.tsx`,
    `BarraRespuesta.tsx`, `PortadaCurso.tsx` y `TarjetaCurso.tsx`.
- **Actividades** (`src/actividades/`): `Teoria.tsx`, `OpcionMultiple.tsx`,
  `Emparejar.tsx`, `Clasificar.tsx` y `Ordenar.tsx` (mosaicos, líneas de la barra);
  `ReproductorLeccion.tsx` (`ContextoImagenes`).
- **Hooks**: `usePrecargarImagenes.ts`, nuevo (`Image.prefetch` con cabeceras y el
  intento que sube al volver la conexión, research.md, punto 11).
- **Contextos**: `ContextoImagenes.ts`, nuevo.
- **Utilidades**: `utilidades/imagenes.ts`, nueva (`fuenteImagen(id)` con `uri` y
  cabeceras, `imagenesDe`); `utilidades/actividades.ts` (`partirTeoria`) y
  `utilidades/relacionar.ts` (líneas y nombres), iguales a los de la web.
- **Tema**: `constantes/tema.ts` gana `fondoVisor` y las medidas `mosaicoOpcion`,
  `mosaicoElemento`, `miniatura` y `altoImagenMax`.
- **Almacenamiento local**: la caché de `expo-image` (memoria y disco). Nada propio.
- **Notas**:
  - `servicios/api.ts` exporta `cabecerasSesion()` (las de `pedir()`), para `expo-image`.
  - El visor envuelve su contenido en `GestureHandlerRootView` (research.md, punto 12).
  - En un `Arrastrable`, el `BotonPausa` es un `Pressable` aparte, que no empieza el
    arrastre.
  - Comprobar con `npm run tipos`, `npm run lint` y en el iPhone. Lo primero en el teléfono:
    que `stopAnimating` deja el cuadro actual y que `autoplay={false}` muestra el primero
    (research.md, punto 10).

### brote_specs

- `contrato/contrato.ts` y `contrato/VERSION`.
- `docs/decisiones/0016-imagenes-en-postgresql.md` y su fila en `docs/decisiones/README.md`
  (con este plan).
- `docs/diseno.md`: lo de "Interfaz", antes que el código.
- `docs/arquitectura.md`, "Contenido de los cursos": las imágenes van en PostgreSQL y se
  sirven con `GET /imagenes/:idImagen`.
- Al cerrar: `specs/02-modelo-datos.md` (data-model.md, "Al cerrar") y
  `specs/01-navegacion.md`.

## Cambios a la navegación

- Sin pantallas ni rutas nuevas.
- `specs/01-navegacion.md`, "Salir de una lección": el visor de una imagen se abre sobre
  la lección; el botón de volver de Android lo cierra a él y no a la lección, y abrirlo o
  pausar un GIF no cuenta como haber hecho algo.

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| `expo-image` (~58.0.17, la del SDK 58) | móvil | Pausar y reanudar un GIF en el cuadro donde está (`stopAnimating`, `startAnimating`), empezarlo quieto (`autoplay`), mandar el token en cada imagen (`headers`), precargar con cabeceras (`Image.prefetch`) y `contain`/`cover` | El `Image` de React Native: no pausa un GIF, en Android no siempre lo anima y no precarga con cabeceras. Pintar los cuadros a mano pediría un decodificador de GIF (research.md, punto 10) |

El backend y la web no suman paquetes (research.md, puntos 2 a 4 y 9).

## Excepciones a la constitución

| Qué | Por qué hace falta | Por qué no sirve la opción simple |
|---|---|---|
| `ReproductorLeccion` en los dos clientes | La spec pide traer todas las imágenes al abrir la lección y reintentar las que fallan | Si cada actividad trajera las suyas al montarse, la precarga no existiría, y el reintento necesita saber cuándo se cambia de actividad o vuelve la conexión |
| El núcleo del editor web (`estadoLeccion.ts`, `useEditorLeccion.ts`, `EditorLeccion.tsx`) | Las subidas terminan después de que el autor siguió editando, guardar espera a las subidas y al peso de la lección, y el servidor marca imágenes perdidas | Resolverlo en cada formulario perdería la subida al cambiar de bloque y repetiría la misma lógica en cinco tipos (research.md, punto 13). Lo nuevo recorre los borradores sin saber de ningún tipo |
| `BarraRespuesta`, `OpcionRespuesta`, `ElementoRespuesta`, `LugarElemento` y `PortadaCurso` en los dos clientes | Las miniaturas al fallar, los mosaicos y la portada con imagen | Componentes aparte para la versión con imagen copiarían los estados, los bordes, el arrastre y los anuncios de cada uno |
| `servicios/editor.ts` y `servicios/cursos.ts` del backend, fuera de los validadores | La portada, el espacio y el uso de cada imagen dependen de la base | Comprobarlo en `validarActividades` la haría depender de la base, y el script de datos la usa sin conexión a una lección |
| Ramas desde `feature/F12-actividades-codigo-terminal` (decisión 0013) | F11 y F12 no están en `dev` y F13 usa su código (contrato 0.9.0, `BarraRespuesta` con `codigo`, las lecciones de prueba de F12) | Esperar a que se fusionen detendría el trabajo; es lo que dice `continuar.md`, como en F12 |
