---
description: "Lista de tareas de F14 Escuchar y repetir, con audio propio"
---

# Tareas: F14 Escuchar y repetir, con audio propio

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F14-escuchar-repetir` en cada repo afectado, creada desde
`feature/F13-imagenes-propias` porque F11, F12 y F13 todavía no están en `dev`
(excepción a la decisión 0013, como en F12 y F13: plan.md, "Resumen")

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase). Los
  lectores de audio de `src/validacion/audios.ts` y el WAV de `scripts/audios-prueba.ts`
  tampoco llevan pruebas (decisión 0012).
- Los límites, formatos, rutas, idiomas y mensajes **siempre** salen del contrato
  (`LIMITES_AUDIOS`, `LIMITES_ARCHIVOS`, `FORMATOS_AUDIO`, `TIPO_MIME_AUDIO`,
  `TIPOS_MIME_AUDIO_SUBIDA`, `RUTA_AUDIOS`, `IDIOMAS_CURSO`, `NOMBRE_IDIOMA`, `ETIQUETA_VOZ`,
  `VELOCIDAD_LENTA`, `CONSIGNA_ESCUCHAR_REPETIR`, `MENSAJES_AUDIOS`, `MENSAJES_ARCHIVOS`,
  `LIMITES_ACTIVIDADES.fraseMax`); ninguna tarea los escribe a mano.
- Toda pieza de interfaz usa los tokens y componentes de `docs/diseno.md`. Lo nuevo se
  agrega ahí primero (T002 a T004).
- La frase y todo texto del autor se muestran siempre como texto: nada de
  `dangerouslySetInnerHTML` (principio III).
- **Comunes a escuchar y repetir, en los dos clientes** (research.md, puntos 9 a 14):
  - El idioma sale de `ContextoIdioma` (por defecto `es`), que dan el reproductor, la
    vista previa y el lienzo. `{idioma}` dentro de una frase va en minúsculas
    (`NOMBRE_IDIOMA[idioma].toLowerCase()`); en "Idioma: {idioma}" y en la lista, tal cual.
  - "Escuchar" a velocidad 1 y "Más lento" a `VELOCIDAD_LENTA`, con la voz y con el audio
    propio, sin cambiar el tono. Nunca suenan dos cosas a la vez; mientras se graba, nada
    suena.
  - `sePuedeComprobar` pasa a `true` en cuanto la frase empieza a sonar (`onstart` de la
    voz o `playing` del audio) o en cuanto se sabe que no se puede oír (`noCargo`, `sinVoz`
    o `noSono`), y ya no vuelve a `false`. La frase oculta aparece al comprobar y en esos
    mismos casos de "no se puede oír" y, como `sePuedeComprobar`, ya no se vuelve a ocultar,
    aunque el audio llegue después.
  - Escuchar y grabarse **no** llaman a `alInteractuar`; "Comprobar" sí.
  - La grabación nunca sale del dispositivo: ningún `fetch` ni descarga la lleva.
- Textos fijos de la interfaz que no están en el contrato:
  - Al cursar: "Escuchar", "Más lento", "Detener", "Grabarme", "Volver a grabarme",
    "Escuchar mi grabación", "Grabando… {m:ss} de 0:30", "El texto aparece al comprobar.",
    "¿Lo dijiste bien?", "Lo dije bien", "No me salió", "Abrir ajustes" y, para lectores
    de pantalla, "Escuchar la frase", "Escuchar la frase más lento", "Detener la
    grabación", "Grabando" y "Grabación lista".
  - Detalle y mapa: "Idioma", "El idioma de la voz que lee las frases de escuchar y
    repetir." e "Idioma: {idioma}".
  - Editor: "Frase", "Lo que el alumno escucha y repite.", "Mostrar el texto desde el
    inicio", "Si la desmarcas, el alumno ve el texto al comprobar.", "Audio de la frase",
    "Sin audio, la frase se lee con la voz del dispositivo, en {idioma}, el idioma del
    curso.", "Elegir audio", "MP3, M4A o WAV de hasta 30 segundos y 5 MB.", "Subiendo
    audio…", "Cambiar", "Quitar", "{m:ss} · {peso}", "Archivos de esta lección: {x} de 25
    MB" y "Archivos del curso: {x} de 200 MB".

---

## Fase 1: Preparación

- [ ] T001 [specs] En `contrato/contrato.ts`, aplicar [contracts/contrato.md](./contracts/contrato.md) tal cual: `IDIOMAS_CURSO`, `IdiomaCurso`, `NOMBRE_IDIOMA` y `ETIQUETA_VOZ` en "Catálogo (F02)"; `idioma` en `DetalleCurso`, `CuerpoDatosCurso` (`idioma?`) y `CursoEnEditor`, y `pesoImagenes` → `pesoArchivos`; la sección nueva "Archivos y audios (F14)" después de "Imágenes (F13)" (`LIMITES_ARCHIVOS` con `pesoCursoMax: 200 * 1024 * 1024` y `pesoLeccionMax: 25 * 1024 * 1024`, `MENSAJES_ARCHIVOS`, `FORMATOS_AUDIO`, `TIPO_MIME_AUDIO`, `TIPOS_MIME_AUDIO_SUBIDA`, `Audio`, `RespuestaAudio`, `RUTA_AUDIOS`, `LIMITES_AUDIOS` con `pesoMax: 5 * 1024 * 1024`, `duracionMax: 30_000` y `grabacionMax: 30_000`, y `MENSAJES_AUDIOS`); quitar de `LIMITES_IMAGENES` `pesoCursoMax` y `pesoLeccionMax`, y de `MENSAJES_IMAGENES` `cursoLleno`, `leccionPesada` y `esperarSubidas`; `ActividadEscucharRepetir` en la unión `Actividad`; `idioma` en `DetalleLeccion`; `CONSIGNA_ESCUCHAR_REPETIR` (`"Escucha y repite."`), `VELOCIDAD_LENTA` (`0.6`), `fraseMax: 200` y `escucharRepetir: true` en `CALIFICA_ACTIVIDAD`. Subir `contrato/VERSION` de `0.10.0` a `0.11.0`
- [ ] T002 [specs] En `docs/diseno.md`, sección 4, tabla general, de plan.md ("Lo que se agrega a docs/diseno.md"): `BotonEscuchar`, `BotonGrabar`, `FraseEscuchar` y `EstadoAudio` con sus props y notas; en la fila de `Aviso`, que en el móvil acepta `accion` (un `Boton` `secundario` chico debajo del texto, como "Abrir ajustes") y que el texto respeta los saltos de línea en los dos clientes; en la de `CampoSelector`, que `textoVacio` es opcional (sin él, no hay opción vacía: el "Idioma")
- [ ] T003 [specs] En `docs/diseno.md`, sección 4, "Editor (solo web)": `CampoAudio` y `CampoCasilla` (`id`, `etiqueta`, `ayuda`, `valor`, `alCambiar`, `deshabilitado`: un `<input type="checkbox">` nativo de 20 px con `accent-color: primario`, la etiqueta a su derecha en `cuerpo`, la ayuda debajo como en `CampoTexto` y el mismo anillo de foco), de plan.md; la fila de `PesoImagenes` pasa a `PesoArchivos`, con "Archivos de esta lección" y "Archivos del curso"
- [ ] T004 [specs] En `docs/diseno.md`, sección 6, de plan.md: el patrón **Escuchar y repetir** (de arriba abajo, la autoevaluación como en la pregunta abierta, la barra como en el reto de código); en "Teclado", que en escuchar y repetir las teclas 1 a 9 no hacen nada, Tab recorre sus botones y, al comprobar, el foco pasa a "Lo dije bien" y luego a "Continuar"; en "Iconos de los tipos" (o una línea aparte), `Volume2`, `Snail`, `Square`, `Mic`, `VolumeX` y `FileAudio`
- [ ] T005 [P] [specs] En `docs/arquitectura.md`, "Contenido de los cursos": un punto **Audios** (F14): sus bytes van en PostgreSQL, en la tabla `audio` (decisión 0017), sin sus datos ocultos; la API los recibe en `POST /editor/cursos/:idCurso/audios` y los sirve en `GET /audios/:idAudio` con los permisos del curso. Y en **Curso**, que tiene un idioma (`IDIOMAS_CURSO`), el de la voz de escuchar y repetir
- [ ] T006 [back] En `brote_backend_express`: `git fetch`, `git switch feature/F13-imagenes-propias` y crear `feature/F14-escuchar-repetir` desde ahí. Si para entonces F11 a F13 ya están en `origin/dev`, crearla desde `dev` como siempre; si no, cuando se fusionen, la rama hace `git merge origin/dev` y su PR va después
- [ ] T007 [P] [web] Igual que T006 en `brote_web_react`
- [ ] T008 [P] [movil] Igual que T006 en `brote_mobile_expo`
- [ ] T009 [specs] Copiar el contrato 0.11.0 a los tres repos: `npm run contrato:copiar` en `brote_specs`. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo. **`npm run tipos` deja de pasar** donde se usan `pesoCursoMax`, `pesoLeccionMax`, `cursoLleno`, `leccionPesada`, `esperarSubidas` o `pesoImagenes`, y en los `Record<TipoActividad, …>` sin `escucharRepetir`: en back hasta T026, en web hasta T059 y en movil hasta T069

---

## Fase 2: Backend (brote_backend_express)

Las reglas están en [data-model.md](./data-model.md) y en [contracts/api.md](./contracts/api.md);
el porqué, en [research.md](./research.md), puntos 1 a 8, 16 y 17.

### Base de datos

- [ ] T010 [back] En `prisma/schema.prisma`: modelo `Audio` (`@@map("audio")`) con `id String @id @default(uuid(7))`, `idCurso` (`@map("id_curso")`, relación `"AudiosCurso"` con `onDelete: Cascade`), `huella String`, `formato String`, `duracion Int`, `peso Int`, `datos Bytes`, `subidaEn DateTime @default(now()) @map("subida_en")` y `@@unique([idCurso, huella])`; en `Curso`, `idioma String @default("es")` y `audios Audio[] @relation("AudiosCurso")`; en `Leccion`, `audios String[] @default([])`. Comentarios cortos con el porqué (data-model.md)
- [ ] T011 [back] `npx prisma migrate dev --name f14_escuchar_repetir` y, en la migración generada (`prisma/migrations/<fecha>_f14_escuchar_repetir/migration.sql`), agregar a mano los `CHECK` de data-model.md: `audio_valido` (`formato IN ('mp3', 'm4a', 'wav') AND duracion > 0 AND duracion <= 30049 AND peso > 0 AND peso = octet_length(datos) AND peso <= 5242880`) y `curso_idioma_valido` (`idioma IN ('es', 'en', 'fr', 'pt', 'de', 'it', 'ja', 'zh', 'ko')`), con un comentario como el de F13. La columna `idioma` con `DEFAULT 'es'` deja en Español los cursos que ya existen. `npm run bd:generar`

### Validación

- [ ] T012 [P] [back] Crear `src/validacion/audios.ts` con el lector de MP3 (research.md, puntos 3 y 4): `leerMp3(bytes: Buffer): { duracion: number; limpio: Buffer } | null`. Salta la etiqueta ID3v2 del inicio (`ID3`, tamaño *synchsafe* de 4 bytes desde el byte 6, más 10 de cabecera y 10 si la bandera de pie está puesta); busca el primer encabezado de cuadro (sincronía de 11 bits, MPEG 1, 2 o 2.5, capa III, índice de tasa 1 a 14, frecuencia válida); recorre los cuadros por su largo (`144 * tasa / frecuencia + relleno` en MPEG 1, `72 * …` en 2 y 2.5) hasta los bytes que no son un cuadro (`TAG`, `APETAGEX`, `LYRICS` o basura); con menos de 10 cuadros seguidos, `null`. `duracion` = suma de muestras (1152 o 576 por cuadro) / frecuencia × 1000, redondeada; `limpio`, los cuadros contados uno tras otro. Comentario con el enlace a la especificación del encabezado
- [ ] T013 [back] En `src/validacion/audios.ts`, el lector de WAV: `leerWav(bytes)`, con `RIFF…WAVE`, recorriendo bloques (largo de 4 bytes little endian, más uno de relleno si es impar). Pide un `fmt ` con formato 1 (o `0xFFFE` con el subformato PCM `00000001-0000-0010-8000-00aa00389b71`), 1 o 2 canales, 8, 16 o 24 bits y entre 8 000 y 48 000 Hz, y un `data`; si no, `null`. `duracion` = largo de `data` / bytes por segundo × 1000; `limpio`, un WAV nuevo con solo `RIFF`, `fmt ` y `data`
- [ ] T014 [back] En `src/validacion/audios.ts`, el lector de M4A: `leerM4a(bytes)`, recorriendo cajas (largo de 4 bytes, o 64 bits si vale 1). Pide `ftyp` al inicio, un solo `moov`, un solo `mdat`, ningún `moof`, ningún `trak` de video (`vide`) y exactamente un `trak` de sonido (`mdia/hdlr` `soun`) con `stsd` de entrada `mp4a` y un `esds` con tipo de objeto `0x40`; si no, `null`. Los demás `trak` (`meta`, `text`, `sbtl`, `tmcd`: las notas de voz recientes del iPhone pueden traer uno de metadatos) se descartan. `duracion` = `mdhd` duración / escala × 1000 (versiones 0 y 1). `limpio`: `ftyp` + `moov` con `mvhd` y solo el `trak` de sonido, sin `udta`, `meta` ni `uuid` (con los largos de cada caja padre corregidos) + un `mdat` nuevo armado solo con los trozos de esa pista, en orden: cada trozo empieza donde dice `stco` (32 bits) o `co64` (64 bits) y mide la suma de sus muestras (`stsc` dice cuántas tiene cada trozo y `stsz`, cuánto mide cada una). `stco` o `co64` se reescriben con los nuevos inicios. Así no quedan dentro del archivo los datos de otras pistas, como el lugar de una nota de voz
- [ ] T015 [back] En `src/validacion/audios.ts`, `leerAudio(bytes): { formato, duracion, limpio } | null`, que prueba los tres por sus primeros bytes (`ID3` o sincronía MPEG → MP3; `RIFF…WAVE` → WAV; `ftyp` en el byte 4 → M4A) y comprueba que `leer<Formato>(limpio)` da el mismo formato y la misma duración (si no, `null`); y `comprobarAudioSubido(cuerpo: unknown, tipo: string | undefined)`, que devuelve `{ bytes: limpio, formato, duracion }` o lanza `ErrorApi(400, …)` en este orden: si `cuerpo` no es un `Buffer` no vacío o `tipo` (sin parámetros, en minúsculas) no es uno de `TIPOS_MIME_AUDIO_SUBIDA`, `formatoInvalido`; si `leerAudio` da `null`, `audioIlegible`; si `Math.round(duracion / 100) * 100 > duracionMax`, `audioLargo`
- [ ] T016 [back] En `src/validacion/actividades.ts`: `validarAudioActividad(valor, campo)` (objeto solo con `id`, texto no vacío; `formato`, uno de `FORMATOS_AUDIO`; `duracion` y `peso`, enteros mayores que 0; devuelve el id) y `validarEscucharRepetir(actividad)` en `validadores`: `soloCampos` `tipo`, `frase`, `mostrarTexto` y `audio`; `frase` "No vacía, de una línea, de hasta 200 (`fraseMax`)", con `deUnaLinea`; `mostrarTexto` booleano obligatorio; `audio` opcional con `validarAudioActividad`. Exportar `audiosDeActividad(actividad): Audio[]`, `idsDeAudios(actividades): string[]` (sin repetir, en orden) y `mapearAudios(actividad, fn)`, como los de imágenes
- [ ] T017 [P] [back] En `src/validacion/editor.ts`: `recortarTextos` recorta `frase` (se guarda recortada); `validarDatosCurso` acepta `idioma` ausente o uno de `IDIOMAS_CURSO` (si no, `campos.idioma` con `datosInvalidos`) y lo devuelve en `CuerpoDatosCurso`. Actualizar sus comentarios

### Servicios y rutas

- [ ] T018 [back] Crear `src/servicios/archivos.ts` (research.md, punto 7): mover aquí `limpiarImagenesSinUsar` desde `src/servicios/imagenes.ts` (sin cambiarla) y agregar `limpiarAudiosSinUsar(idCurso?, cliente)` (borra los audios de más de un día de `subida_en` que ninguna lección del curso tiene en `audios`, con una sola sentencia como la de imágenes), `limpiarArchivosSinUsar(idCurso?, cliente)` (las dos) y `pesoArchivosCurso(tx, idCurso)` (la suma de `peso` de `imagen` y de `audio` del curso, en una consulta con `$queryRaw`). Así `imagenes.ts` y `audios.ts` la importan sin ciclos. Actualizar las importaciones de `limpiarImagenesSinUsar`
- [ ] T019 [back] Crear `src/servicios/audios.ts`, como `servicios/imagenes.ts`: `seleccionAudio` (`id`, `formato`, `duracion`, `peso`; **nunca** `datos`) y `aAudio(fila)`; `audiosDelCurso(tx, idCurso, ids)`; `borrarAudiosSinUso(tx, idCurso, ids)` (los que ya no están en `audios` de ninguna lección del curso, con `unnest`); `subirAudio(idAutor, idCurso, { bytes, formato, duracion })` dentro de `conCursoEditable`: `limpiarArchivosSinUsar(idCurso, tx)`, huella SHA-256 de los bytes limpios, si ya existe renueva `subida_en` y la devuelve con `nueva: false`, si no, con `pesoArchivosCurso` + `bytes.length` mayor que `LIMITES_ARCHIVOS.pesoCursoMax` lanza `ErrorApi(400, MENSAJES_ARCHIVOS.cursoLleno)`, y la crea; y `traerAudio(idUsuario, idAudio)` (los `datos`, el `formato` y la `huella` si el curso está publicado o es de `idUsuario`; si no, `ErrorApi(404, MENSAJES_AUDIOS.audioNoDisponible)`)
- [ ] T020 [back] En `src/servicios/imagenes.ts`, `subirImagen`: `limpiarArchivosSinUsar(idCurso, tx)` en lugar de `limpiarImagenesSinUsar`, el espacio con `pesoArchivosCurso` contra `LIMITES_ARCHIVOS.pesoCursoMax` y el mensaje `MENSAJES_ARCHIVOS.cursoLleno`. Actualizar el comentario del archivo
- [ ] T021 [back] En `src/rutas/editor.ts`: generalizar `leerArchivo` en `lectorDeArchivo(tipos, limite, mensaje413)`, que devuelve el envoltorio de `express.raw`; las imágenes lo usan igual que hoy, y `POST /cursos/:idCurso/audios` con `requerirSesion`, `lectorDeArchivo(TIPOS_MIME_AUDIO_SUBIDA, LIMITES_AUDIOS.pesoMax, MENSAJES_AUDIOS.audioPesado)`, `comprobarAudioSubido(req.body, req.get("Content-Type"))`, `subirAudio` y `201` o `200` con `RespuestaAudio`. Actualizar el comentario del orden de las rutas
- [ ] T022 [back] Crear `src/rutas/audios.ts` con `GET /:idAudio` (`requerirSesion`, `traerAudio`), con las cabeceras de `src/rutas/imagenes.ts` y `Content-Type` de `TIPO_MIME_AUDIO`; con `req.fresh`, `304`. Montarla en `src/rutas/index.ts` como `rutas.use(RUTA_AUDIOS, rutasAudios)`
- [ ] T023 [back] En `src/servicios/editor.ts`, `guardarLeccion` (contracts/api.md, "PUT de la lección"): junto a `conImagenesDelCurso`, `conAudiosDelCurso` (los audios de `idsDeAudios` que son del curso; si falta alguno, `ErrorApi(400, datosInvalidos, { "actividades.N": "actividad N+1 (escucharRepetir): un audio ya no está", "audios.<id>": MENSAJES_AUDIOS.audioNoEsta })`, y reescribe `formato`, `duracion` y `peso` de cada `audio` con `mapearAudios`). `conImagenesDelCurso` ya no comprueba el peso: devuelve también la suma de sus imágenes, y `guardarLeccion` lanza `ErrorApi(400, MENSAJES_ARCHIVOS.leccionPesada)` si imágenes más audios (sin repetir) pasan de `LIMITES_ARCHIVOS.pesoLeccionMax`. Guarda `audios` con las actividades y llama a `borrarAudiosSinUso` con los que la lección tenía y ya no
- [ ] T024 [back] En `src/servicios/editor.ts`: `borrarLeccion` lee también `audios` y, después de renumerar, `borrarAudiosSinUso` con ellos; `crearCurso` guarda `idioma` (o `es`) y `actualizarCurso`, el que venga (sin él, no cambia)
- [ ] T025 [back] En `src/servicios/editor.ts`: `leerCursoEnEditor` agrega `idioma` y cambia `pesoImagenes` por `pesoArchivos` (`pesoArchivosCurso`); `crearCurso` devuelve `pesoArchivos: 0`; `traerLeccionEnEditor` (`aLeccionEnEditor`) agrega `idioma` del curso
- [ ] T026 [P] [back] En `src/servicios/cursos.ts`, el detalle (`idioma` en `seleccionDetalle` y `aDetalleCurso`); en `src/servicios/lecciones.ts`, `traerLeccionPublicada` agrega `idioma` (`curso: { select: { idioma: true } }` en `seleccionLeccion` y `aDetalleLeccion`). Aquí `npm run tipos` vuelve a pasar
- [ ] T027 [P] [back] En `src/servidor.ts`, `limpiarArchivosSinUsar()` (de `servicios/archivos.ts`) en lugar de `limpiarImagenesSinUsar()`, al arrancar y cada hora

### Datos de prueba y herramientas

- [ ] T028 [P] [back] Crear `scripts/audios-prueba.ts` (research.md, punto 16), sin paquetes: `codificarWav({ muestras: Int16Array, frecuencia, canales })` (PCM de 16 bits), `melodia(notas: { hz, segundos }[], frecuencia = 22050)` (senoides con 10 ms de ataque y de caída) y `AUDIOS_PRUEBA`: mapa de nombre a bytes con `escala-sube.wav` (do 262, re 294, mi 330, fa 349 y sol 392 Hz, 0.8 s cada una: 4.0 s), `escala-baja.wav` (al revés), `tres-notas.wav` (do, mi, sol) y `treinta-segundos.wav` (la escala que sube y baja, despacio, hasta 30.0 s), más `escala-sube.mp3` y `escala-baja.m4a` leídos de `scripts/audios-prueba/`
- [ ] T029 [back] Crear `scripts/generar-audios-prueba.ts` y, en `package.json`, `"audios:generar": "node scripts/generar-audios-prueba.ts"`: escribe los WAV de T028 en una carpeta temporal, `afconvert -f m4af -d aac` para `scripts/audios-prueba/escala-baja.m4a` y `lame -m m -b 64` para `scripts/audios-prueba/escala-sube.mp3` (`child_process.execFileSync`), y avisa claro si falta alguno de los dos. Correrlo y commitear los dos archivos. **`lame` no está instalado**: preguntarle al usuario antes de `brew install lame`
- [ ] T030 [P] [back] En `scripts/actividades-prototipo.ts`, en "Japonés sencillo": `{ tipo: "escucharRepetir", frase: "あいうえお", mostrarTexto: true }` como cuarta y última actividad de la lección 1 y `{ tipo: "escucharRepetir", frase: "こんにちは、元気ですか？", mostrarTexto: true }` como tercera de la lección 2 (antes de la pregunta abierta), como en `referencia/cursos-prototipo/japones-sencillo/lessons/`. El comentario de arriba dice los trece tipos y agrega F14
- [ ] T031 [back] En `scripts/datos-prueba.ts`: `idioma?: IdiomaCurso` en `CursoPrueba` (sin él, `es`), "Japonés sencillo" con `idioma: "ja"`, `audioPrueba(nombre)` (un `Audio` con `id: "prueba:" + nombre` y datos de relleno válidos, como `imagenPrueba`) y **al final** de "Actividades de prueba", después de "Imágenes con etiquetas", las lecciones 19 "Escuchar con la voz", 20 "Escuchar con audio propio", 21 "Escuchar al límite" (la frase de 200 caracteres exactos, con `Array.from(frase).length === 200` comprobado al cargar) y 22 "Escuchar con etiquetas" (`Repite: ${HTML}`) de quickstart.md, sección 1.1, tal cual
- [ ] T032 [back] En `scripts/datos-prueba.ts`, "Inglés para viajar" (de `AUTOR`, `publicado: false`, `idioma: "en"`, descripción "Frases para practicar el inglés de un viaje.") con la lección "En el aeropuerto" de quickstart.md, sección 1.1, en `extras`. El encabezado del archivo agrega F14
- [ ] T033 [back] En `scripts/sembrar-cursos.ts`: antes de abrir la transacción, comprobar que cada `prueba:<nombre>` de audio existe en `AUDIOS_PRUEBA`; dentro, por cada curso, crear sus audios (`leerAudio` de los bytes, huella, `formato`, `duracion`, `peso` y los bytes limpios), cambiar cada referencia por el audio guardado, llenar `audios` de cada lección con `idsDeAudios` y guardar `idioma`. El mensaje final dice cuántos audios se crearon
- [ ] T034 [P] [back] Crear `scripts/archivos-audio-validacion.ts` y, en `package.json`, `"audios:validacion": "node scripts/archivos-audio-validacion.ts"`: escribe en la carpeta que recibe los archivos de quickstart.md, sección 1.2, con `codificarWav` (`escala.wav`, `largo-31s.wav`, `pesado-6mb.wav` a 96 kHz estéreo de 16 s, y dos `pesado-5mb-*.wav` distintos de 4.9 MB a 48 kHz estéreo de 16 bits, unos 26.8 s: dentro de los 8 000 a 48 000 Hz que acepta el servidor, T013), una copia de `escala-sube.mp3` como `escala-4s.mp3`, `con-etiquetas.mp3` (ID3v2.3 con `TIT2` "Título de prueba", `TPE1` "Artista de prueba" y `APIC` con un PNG de 300 × 300 de `imagenes-prueba.ts`, más 128 bytes de ID3v1 con `TAG` al final), `audio.ogg` (`OggS` y relleno), `audio.flac` (`fLaC` y relleno), `texto.mp3` y `sin-perdida.m4a` (`afconvert -f m4af -d alac`, avisando si no está)
- [ ] T035 [P] [back] En `scripts/proxy-validacion.ts`: `bloquear` y `retrasar` también para `GET /audios/*`, y un modo nuevo `POST /__modo/danar` que, solo en `GET /audios/*`, responde `200` con las cabeceras de la API y bytes al azar (`crypto.randomBytes`) del mismo largo. Actualizar el comentario de los modos

**Punto de control**: `npm run tipos` y `npm run lint` pasan, `npx prisma migrate deploy` y
`npm run bd:sembrar` dejan "Actividades de prueba" con las lecciones 19 a 22, "Japonés
sencillo" en `ja` e "Inglés para viajar", y B0 a B10 de [quickstart.md](./quickstart.md),
sección 2, responden lo que dicen. Con esto ya se pueden validar los criterios `[backend]`
(V01, V03, V11 y V74 a V79).

---

## Fase 3: Web (brote_web_react)

### Base

- [ ] T036 [P] [web] Crear `src/utilidades/audios.ts`: `urlAudio(id)` (`URL_API + RUTA_AUDIOS + "/" + id`), `audiosDe(actividad): Audio[]` (el de un `escucharRepetir`, si tiene) y `formatearDuracion(ms)` ("0:04": minutos y segundos redondeados)
- [ ] T037 [web] En `src/utilidades/audios.ts`, `prepararAudio(archivo: File): Promise<Blob>` (research.md, punto 5), que lanza `Error` con el mensaje de `MENSAJES_AUDIOS` de cada caso: el formato por su tipo (`audio/mpeg`, `audio/mp4`, `audio/x-m4a`, `audio/m4a`, `audio/wav`, `audio/x-wav`, `audio/wave`, `audio/vnd.wave`) o, con tipo vacío, por su extensión (`.mp3`, `.m4a`, `.wav`), si no `formatoInvalido`; más de `pesoMax`, `audioPesado`; un `<audio>` con `URL.createObjectURL` y `preload="metadata"`: `error`, `audioIlegible`; `duration` redondeada a décimas mayor que `duracionMax / 1000`, `audioLargo`. Revoca la URL y devuelve un `Blob` con el archivo y el tipo de `TIPO_MIME_AUDIO`
- [ ] T038 [P] [web] Crear `src/utilidades/voz.ts` (research.md, punto 9): `vocesDelIdioma(idioma): Promise<SpeechSynthesisVoice[]>` (sin `speechSynthesis`, `[]`; si `getVoices()` viene vacía, espera `voiceschanged` hasta 1.5 s; filtra por `lang` que empieza con el código, leyendo `_` como `-`; con `import.meta.env.DEV` y el idioma en `VITE_SIN_VOCES`, separado por comas, `[]`), `elegirVoz(voces, idioma)` (local de `ETIQUETA_VOZ`, local del idioma, remota de la etiqueta, cualquiera) y `decir(frase, voz, idioma, velocidad, { alEmpezar, alTerminar, alFallar }): () => void` (`speechSynthesis.cancel()`, `SpeechSynthesisUtterance` con `lang = ETIQUETA_VOZ[idioma]`, `voice` y `rate`; `onerror` salvo `interrupted` y `canceled` y no recibir `onstart` en 3 s llaman a `alFallar`; devuelve cómo detenerla). Declarar `VITE_SIN_VOCES` en `src/vite-env.d.ts`
- [ ] T039 [P] [web] Crear `src/contextos/ContextoIdioma.ts` (`IdiomaCurso`, por defecto `es`, con `useIdioma()`) y `src/contextos/ContextoAudios.ts` (research.md, punto 9): un almacén `crearAlmacenAudios()` con `traer(audio): Promise<string>` (una sola petición por id: `fetch(urlAudio(id), { credentials: "include" })`, `Blob` y `URL.createObjectURL`; si falla, sale del almacén), `olvidar(id)` (revoca y saca, para un audio dañado) y `liberar()` (revoca todo); `useAudios()` da el del proveedor o, sin proveedor, uno propio del componente. Crear `src/hooks/usePrecargarAudios.ts`: `usePrecargarAudios(almacen, actividades, intento)`, que hace `traer` de cada `audiosDe` al montarse y otra vez de los que fallaron cuando cambia `intento`. Lo recibe como parámetro, como en el móvil (T063): quien lo llama es el reproductor, que es el que da `ContextoImagenes`, así que no puede leerlo de ahí
- [ ] T040 [web] Crear `src/hooks/useFrase.ts` (research.md, puntos 9, 11 y 14): con la actividad, el idioma y el almacén, devuelve `{ estado, velocidad, sono, escuchar(velocidad), detener() }`, con `estado` `cargando`, `lista`, `sonando`, `noCargo`, `sinVoz` o `noSono`. Con `audio`: espera `traer`; si falla, `noCargo`, y `escuchar` lo pide otra vez y suena si llega; suena en un `HTMLAudioElement` con `playbackRate` y `preservesPitch = true`; `play()` rechazada o `error` → `noSono` y `olvidar(id)`. Sin audio: `vocesDelIdioma` y `elegirVoz`; sin voces, `sinVoz`; si no, `decir`, y `alFallar` → `noSono`. `escuchar` con la otra velocidad mientras suena empieza de nuevo; `sono` pasa a `true` al primer `alEmpezar` o `playing`. Al desmontarse, detiene todo
- [ ] T041 [web] Crear `src/hooks/useGrabacion.ts` (research.md, punto 12): `{ estado, segundos, grabar(), detener(), escuchar(), detenerEscucha() }`, con `estado` `lista`, `pidiendoPermiso`, `grabando`, `conGrabacion`, `sonando`, `sinPermiso` o `sinMicrofono`. `getUserMedia({ audio: true })` y `MediaRecorder`; `NotAllowedError` y `SecurityError` → `sinPermiso`; `NotFoundError`, `OverconstrainedError` o sin `navigator.mediaDevices` → `sinMicrofono`; se detiene sola a los `grabacionMax` ms y si la pista termina (`ended`); al detener, apaga las pistas y arma el `Blob` y su URL, que se revoca al grabar otra vez y al desmontarse. Nunca la manda a ningún lado

### Componentes (docs/diseno.md, sección 4)

- [ ] T042 [P] [web] Crear `src/componentes/BotonEscuchar/BotonEscuchar.tsx` y su `.module.css`: props `velocidad` (`normal`, `lenta`), `sonando`, `cargando`, `deshabilitado`, `alPulsar` y `etiqueta` (para "Escuchar mi grabación"). `Boton` `secundario` con `Volume2` "Escuchar" o `Snail` "Más lento"; sonando, `Square` "Detener"; cargando, un `IndicadorCarga` chico en lugar del icono y deshabilitado. `aria-label` "Escuchar la frase", "Escuchar la frase más lento" o "Detener"
- [ ] T043 [P] [web] Crear `src/componentes/BotonGrabar/BotonGrabar.tsx` y su `.module.css`: props `estado` (`listo`, `grabando`, `conGrabacion`), `segundos`, `deshabilitado` y `alPulsar`. `Boton` `secundario` con `Mic` "Grabarme" o "Volver a grabarme"; grabando, `Square` "Detener" y "Grabando… {m:ss} de 0:30" en `nota` `--color-texto-suave` con un punto de 8 px en `--color-error` que late (`--duracion-lento`) salvo con `prefers-reduced-motion`. `aria-label` "Grabarme", "Detener la grabación" o "Volver a grabarme"; una región `aria-live="polite"` dice "Grabando" al empezar y "Grabación lista" al terminar
- [ ] T044 [P] [web] Crear `src/componentes/FraseEscuchar/FraseEscuchar.tsx` (props `frase`, `idioma`, `oculta`: la frase en `titulo2`, centrada, con `lang={ETIQUETA_VOZ[idioma]}` y `overflow-wrap: anywhere`; oculta, "El texto aparece al comprobar." en `cuerpo` `--color-texto-suave` y la frase fuera del DOM) y `src/componentes/EstadoAudio/EstadoAudio.tsx` (`VolumeX` de 20 px en `--color-texto-tenue` y `MENSAJES_AUDIOS.sinCargar` en `nota` `--color-texto-suave`, en una fila, con `role="status"`), con sus `.module.css`
- [ ] T045 [P] [web] Renombrar `src/componentes/PesoImagenes/` a `src/componentes/PesoArchivos/` (`PesoArchivos.tsx` y `PesoArchivos.module.css`, con su comentario) y cambiar sus dos usos (`src/paginas/MapaCurso/DatosCurso.tsx` y `src/paginas/LienzoLeccion/EditorLeccion.tsx`) solo en el nombre; los textos y los límites, en T056 y T058
- [ ] T046 [P] [web] En `src/componentes/CampoSelector/CampoSelector.tsx`, `textoVacio` opcional: sin él, no hay opción vacía (docs/diseno.md, sección 4)

### Cursar (docs/diseno.md, sección 6)

- [ ] T047 [web] Crear `src/actividades/EscucharRepetir/EscucharRepetir.tsx` y `EscucharRepetir.module.css` (spec, "Cursar la actividad" y "Grabarse"): la consigna `CONSIGNA_ESCUCHAR_REPETIR` en el `h2` con `useEnfocarAlMontar`; `FraseEscuchar` (oculta si `!mostrarTexto`, hasta que se comprueba o se sabe que no se puede oír; una vez a la vista, no se vuelve a ocultar aunque el audio llegue después, V59); los dos `BotonEscuchar` con `useFrase`; `EstadoAudio` con `noCargo`; un `Aviso` `info` con `sinVoz` (`{idioma}` en minúsculas), `noSono`, `sinPermiso` con `permitirWeb` en otra línea, o `sinMicrofono`; `BotonGrabar` y "Escuchar mi grabación" con `useGrabacion`, coordinados (empezar a grabar detiene la frase; escuchar una cosa detiene la otra); "Comprobar" en `BarraRespuesta` deshabilitado hasta `sePuedeComprobar`, que llama a `alInteractuar`; la autoevaluación "¿Lo dijiste bien?" con "Lo dije bien" y "No me salió", con el foco, como `RetoCodigo.tsx`; y la barra "¡Correcto!" o "A repasar" con "Continuar". Agregarlo en `src/actividades/registro.ts`
- [ ] T048 [web] En `src/actividades/ReproductorLeccion/ReproductorLeccion.tsx`: prop `idioma`, `ContextoIdioma.Provider`, un almacén de `crearAlmacenAudios()` en `ContextoAudios.Provider` (liberado al desmontarse) y `usePrecargarAudios(almacen, actividades, intento.valor)`, con el mismo `intento` que ya sube al cambiar de actividad para las imágenes; en `src/paginas/Leccion/Leccion.tsx`, pasar `leccion.idioma`

### Editor (docs/diseno.md, sección 4, "Editor (solo web)")

- [ ] T049 [P] [web] Crear `src/servicios/audios.ts` con `subirAudio(idCurso, archivo: Blob): Promise<RespuestaAudio>` (con `pedir()`, `POST` a `/editor/cursos/:idCurso/audios`, el `Blob` como cuerpo y su `Content-Type`) y `leerErrorDeSubidaAudio(error)` (como `leerErrorDeSubida`, con `MENSAJES_AUDIOS.subidaFallida`). En `src/servicios/editor.ts`, `actualizarCurso` manda `idioma` cuando cambió
- [ ] T050 [web] Crear `src/editor/archivos.ts` (research.md, punto 15): `ValorArchivo = ValorImagen | ValorAudio` y los recorridos genéricos movidos desde `src/editor/imagenes.ts`, que ahora buscan `clase: "imagen"` o `clase: "audio"`: `recorrerArchivos`, `reemplazarArchivos`, `limpiarSubidas`, `haySubidas`, `pesoArchivos` (ids sin repetir) y `hayArchivos`. En `imagenes.ts` quedan solo las de imagen. Actualizar las importaciones en `src/editor/estadoLeccion.ts` y `src/hooks/useEditorLeccion.ts`
- [ ] T051 [web] Crear `src/editor/audios.ts`: `ValorAudio` (`{ clase: "audio"; audio: Audio | null; subida: string | null; error: string | null; perdida: boolean }`), `valorAudioVacio()`, `aValorAudio(audio?)` y `errorAudio(valor)` (solo `audioNoEsta` si está perdido: el audio es opcional)
- [ ] T052 [web] En `src/editor/estadoLeccion.ts`: las acciones pasan a `archivoSubido` (`{ idSubida, archivo: { imagen } | { audio } }`, que pone el archivo en el valor de su clase y quita `subida`, `error` y `perdida`), `archivoNoSubido` (`{ idSubida, error }`) y `marcarArchivosPerdidos` (`{ ids }`, por id de imagen o de audio), con `reemplazarArchivos`. En `src/contextos/ContextoSubidas.ts`, `subirAudio: (archivo: File) => string` junto a `subir`
- [ ] T053 [web] En `src/hooks/useEditorLeccion.ts`: `subirAudio(archivo)` (`prepararAudio`, `subirAudio` y `archivoSubido`; el `401` y los errores como `subir`, con `leerErrorDeSubidaAudio`); `subir` despacha las acciones nuevas; `comprobar` usa `pesoArchivos` contra `LIMITES_ARCHIVOS.pesoLeccionMax` y `MENSAJES_ARCHIVOS.leccionPesada`; un `400` con claves `imagenes.<id>` o `audios.<id>` despacha `marcarArchivosPerdidos`; devuelve `pesoArchivos` y `conArchivos` en lugar de `pesoImagenes` y `conImagenes`
- [ ] T054 [web] Crear `src/componentes/CampoAudio/CampoAudio.tsx` y su `.module.css`, como `CampoImagen` (docs/diseno.md, "Editor (solo web)"): props `id`, `etiqueta`, `ayuda`, `valor`, `alCambiar`, `alElegirArchivo`, `error`, `mostrarErrores` y `deshabilitado`; `<input type="file" hidden accept="audio/*,.mp3,.m4a,.wav">`; vacío, "Elegir audio" (`FileAudio`) y la nota; subiendo, "Subiendo audio…"; con audio, un `BotonEscuchar` chico que lo trae con `ContextoAudios` y lo reproduce, "{formatearDuracion} · {formatearPeso}", "Cambiar" y "Quitar" (deja `valorAudioVacio()`, sin confirmación); la ayuda debajo; el error de `valor.error`, `errorAudio` o `error`, con `aria-describedby`
- [ ] T055 [P] [web] Crear `src/componentes/CampoCasilla/CampoCasilla.tsx` y su `.module.css` (docs/diseno.md, "Editor (solo web)"): props `id`, `etiqueta`, `ayuda`, `valor`, `alCambiar` y `deshabilitado`; `<input type="checkbox">` nativo con su `<label htmlFor>`, `accent-color: var(--color-primario)`, la ayuda con `aria-describedby` y el anillo de foco de la sección 7
- [ ] T056 [web] Crear `src/actividades/EscucharRepetir/editorEscucharRepetir.ts` (borrador `{ frase: string; mostrarTexto: boolean; audio: ValorAudio }`, por defecto `mostrarTexto: true`; `aBorrador`; `aActividad` con `frase` recortada y sin `audio` si no hay; `validar`: frase vacía → `campoObligatorio`, y `errorAudio`; `resumen`: la frase) y `FormularioEscucharRepetir.tsx` ("Frase" con `CampoTexto` de una línea y `maxLongitud={fraseMax}`, que quita los saltos de línea al pegar; "Mostrar el texto desde el inicio" con `CampoCasilla`; "Audio de la frase" con `CampoAudio`, `alElegirArchivo` de `useSubidas().subirAudio` y la ayuda con el idioma de `useIdioma()`). Agregarlo en `src/actividades/registroEditor.ts`
- [ ] T057 [web] En `src/paginas/LienzoLeccion/EditorLeccion.tsx`: `ContextoIdioma.Provider` con `leccion.idioma` (también para el inspector); `ContextoSubidas` con `subir` y `subirAudio`; `PesoArchivos` con "Archivos de esta lección", `pesoArchivos` y `LIMITES_ARCHIVOS.pesoLeccionMax` si `conArchivos`; la nota `MENSAJES_ARCHIVOS.esperarSubidas` mientras `subiendo`
- [ ] T058 [web] En `src/editor/VistaPrevia/VistaPrevia.tsx`: prop `idioma`, `ContextoIdioma.Provider` y su propio almacén en `ContextoAudios.Provider` (liberado al desmontarse); en `src/editor/ProbarLeccion/ProbarLeccion.tsx`, pasar `leccion.idioma` a `ReproductorLeccion`; y en `EditorLeccion.tsx`, `idioma` a `VistaPrevia`

### Curso (docs/diseno.md, sección 5)

- [ ] T059 [web] En `src/paginas/MapaCurso/DatosCurso.tsx`: "Idioma" con `CampoSelector` sin `textoVacio`, después de la descripción, con las opciones de `IDIOMAS_CURSO` y `NOMBRE_IDIOMA`, la ayuda y el valor en el estado del formulario (como la portada: cambiarlo habilita "Guardar cambios" y cuenta como cambio sin guardar; `actualizarCurso` lo manda); `PesoArchivos` con "Archivos del curso", `curso.pesoArchivos` y `LIMITES_ARCHIVOS.pesoCursoMax`; `MENSAJES_ARCHIVOS.esperarSubidas`. En `src/paginas/MapaCurso/MapaCurso.tsx`, la copia que se recupera al perder la sesión (`CopiaMapa`) guarda también el idioma. Aquí `npm run tipos` vuelve a pasar
- [ ] T060 [P] [web] En `src/paginas/MapaCurso/CursoNoEditable.tsx` y `src/paginas/DetalleCurso/DetalleCurso.tsx` (con su `.module.css`): "Idioma: {NOMBRE_IDIOMA[idioma]}" en `nota` `--color-texto-suave`, debajo de "Por {nombre del autor}" en el detalle y junto a los datos del curso en el mapa

**Punto de control**: `npm run tipos`, `npm run lint` y `npm run build` pasan, y en Chrome se
puede recorrer "Actividades de prueba" de la 19 a la 22, subir un audio en el editor y cambiar
el idioma de un curso.

---

## Fase 4: Móvil (brote_mobile_expo)

### Base

- [ ] T061 [movil] `npx expo install expo-speech expo-audio expo-file-system` (las del SDK 58); comprobar que `package.json` y `package-lock.json` solo cambian en eso (plan.md, "Dependencias nuevas"). En `app.json`, el plugin `["expo-audio", { "microphonePermission": "Brote usa el micrófono para que te grabes y te compares con la frase. La grabación no sale de tu teléfono." }]`
- [ ] T062 [P] [movil] Crear `src/utilidades/audios.ts` (`urlAudio`, `audiosDe` y `formatearDuracion`, como la web en T036) y `src/utilidades/voz.ts` (research.md, punto 10): `vocesDelIdioma(idioma)` con `Speech.getAvailableVoicesAsync()`, filtradas como en la web, preguntando otra vez a los 500 ms si viene vacía, y `[]` con `__DEV__` y el idioma en `process.env.EXPO_PUBLIC_SIN_VOCES`; `elegirVoz(voces, idioma)` (la de `ETIQUETA_VOZ` y, entre iguales, `Enhanced`; si no, cualquiera del idioma)
- [ ] T063 [movil] Crear `src/contextos/ContextoIdioma.ts` y `src/contextos/ContextoAudios.ts`, y `src/hooks/usePrecargarAudios.ts` (research.md, puntos 10 y 11): por cada audio de la lección, `new File(Paths.cache, "audios", "<id>.<formato>")`; si existe, listo; si no, `File.createDownloadTask(urlAudio(id), archivo, { headers: cabecerasSesion() }).downloadAsync()` (creando la carpeta); un error borra lo que quedó y marca `noCargo`. El contexto da el estado de cada id (`cargando`, `{ uri }` o `noCargo`), `pedir(id)` (lo intenta otra vez) y `olvidar(id)` (borra el archivo dañado). Los que fallaron se piden otra vez cuando sube el `intento` de `ContextoImagenes`
- [ ] T064 [movil] Crear `src/hooks/useFrase.ts`, como el de la web (T040), con `expo-speech` (`Speech.speak` con `language: ETIQUETA_VOZ[idioma]`, `voice`, `rate`, `useApplicationAudioSession: true`, `onStart`, `onDone`, `onStopped` y `onError`, y los 3 s para `onStart`) y `expo-audio` para el audio propio (`createAudioPlayer({ uri })`, `setPlaybackRate(velocidad, "high")`, `shouldCorrectPitch = true`; `playing` → sonó, `didJustFinish` → lista, `error` → `noSono` y `olvidar`). Al montarse, `setAudioModeAsync({ playsInSilentMode: true })`; con `AppState` a segundo plano, detiene todo
- [ ] T065 [movil] Crear `src/hooks/useGrabacion.ts`, como el de la web (T041), con `expo-audio` (research.md, punto 13): `requestRecordingPermissionsAsync()` la primera vez que se graba (`granted` y `canAskAgain`; sin permiso, `sinPermiso` con `puedeAbrirAjustes: !canAskAgain`); `abrirAjustes()` con `Linking.openSettings()` y, con `AppState` `active`, `getRecordingPermissionsAsync()` que quita el aviso si ya hay permiso; `useAudioRecorder(RecordingPresets.HIGH_QUALITY)`, `prepareToRecordAsync()` y `record({ forDuration: grabacionMax / 1000 })`, con `setAudioModeAsync({ allowsRecording: true })` solo mientras graba; el tiempo con `useAudioRecorderState`; a segundo plano o al interrumpirse, se detiene y se queda lo grabado; el archivo se borra (`new File(uri).delete()`) al grabar otra vez y al desmontarse
- [ ] T066 [movil] **En el iPhone**, con una pantalla de prueba desechable (no se versiona) que use T064 y T065: confirmar que la voz suena con el interruptor de silencio puesto, que "Más lento" del audio propio no lo vuelve más grave y que, después de grabar, la frase y la grabación suenan por el altavoz con su volumen normal. Anotar el resultado en `specs/features/F14-escuchar-repetir/research.md`, puntos 10 y 13 (en `brote_specs`). Si algo no se cumple, parar y preguntarle al usuario antes de seguir

### Componentes (docs/diseno.md, sección 4)

- [ ] T067 [P] [movil] Crear `src/componentes/BotonEscuchar.tsx` y `src/componentes/BotonGrabar.tsx`, como la web (T042 y T043), con `accessibilityLabel` y, en `BotonGrabar`, `accessibilityLiveRegion="polite"` (y `AccessibilityInfo.announceForAccessibility` en iOS) para "Grabando" y "Grabación lista"; el punto late con `react-native-reanimated`, quieto con `useReducedMotion()`
- [ ] T068 [P] [movil] Crear `src/componentes/FraseEscuchar.tsx` (con `accessibilityLanguage={ETIQUETA_VOZ[idioma]}` en el `Texto` de la frase; oculta, la frase no se dibuja) y `src/componentes/EstadoAudio.tsx`, como la web (T044); en `src/componentes/Aviso.tsx`, la prop `accion?: ReactNode`, que va debajo del texto

### Cursar (docs/diseno.md, sección 6)

- [ ] T069 [movil] Crear `src/actividades/EscucharRepetir.tsx`, como la web (T047), dentro de `MarcoActividad`, con `permitirMovil` en el aviso de sin permiso y "Abrir ajustes" (`Boton` `secundario` chico, como `accion` de `Aviso`) cuando `puedeAbrirAjustes`. Agregarlo en `src/actividades/registro.ts`. Aquí `npm run tipos` vuelve a pasar
- [ ] T070 [movil] En `src/actividades/ReproductorLeccion.tsx`: prop `idioma`, `ContextoIdioma.Provider`, `ContextoAudios.Provider` con `usePrecargarAudios(actividades, intento)`; en `src/app/leccion/[idCurso]/[idLeccion].tsx`, pasar `leccion.idioma`
- [ ] T071 [P] [movil] En `src/app/curso/[idCurso].tsx`: "Idioma: {NOMBRE_IDIOMA[idioma]}" en `nota` `textoSuave`, debajo de "Por {nombre del autor}"
- [ ] T072 [movil] Comprobar que `npm run tipos`, `npm run lint` y `npx expo export --platform ios` pasan, y recorrer en el iPhone "Actividades de prueba" de la 19 a la 22, "Japonés sencillo" e "Inglés para viajar", con la grabación y "Abrir ajustes"

**Punto de control**: el móvil compila y cursa las cuatro lecciones nuevas en el iPhone.

---

## Fase 5: Cierre

- [ ] T073 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`, como dice su sección "Al cerrar": la entidad **Audio**, lo que cambia en **Curso** (`idioma`, `pesoArchivos`), **Leccion** (`audios`, `idioma`, 25 MB de archivos) y **Actividad** (`escucharRepetir`, los once tipos que califican, ya sin tipos pendientes, y el título "Actividad (F03, F05, F11, F12, F13, F14)"), y en "Entidades previstas" lo que ya no aplica
- [ ] T074 [specs] Integrar "Cambios a la navegación" de [plan.md](./plan.md) a `specs/01-navegacion.md`: en "Salir de una lección", escuchar y grabarse no cuentan como haber hecho algo y comprobar sí; en el móvil, "Abrir ajustes" sale a los ajustes del teléfono y, al volver, la lección sigue como estaba
- [ ] T075 [P] [specs] En `specs/00-proyecto.md`, "Catálogo de actividades": los 13 tipos ya están, y el idioma del curso llegó con F14
- [ ] T076 [specs] `npm run contrato:revisar`: las tres copias coinciden con la oficial. `npm run tipos` y `npm run lint` en los tres repos de código y `npm run build` en la web
- [ ] T077 [specs] Revisar que `specs/features/F14-escuchar-repetir/spec.md` coincide con lo que se construyó; si algo cambió, actualizarla, junto con lo que T066 haya anotado en `research.md`

---

## Fase 6: Validación manual

Una tarea por criterio de aceptación de [spec.md](./spec.md), copiado tal cual. Los pasos de cada
uno están en [quickstart.md](./quickstart.md), sección 3 (y la 2 para `[backend]`), en el mismo
orden. Se marcan aquí (`[X]`) y en `spec.md` (`[x]`) solo si se vieron pasar; lo que se vio en
otro lado lleva su nota.

### Cursos de prueba

- [ ] V01 [backend] "Actividades de prueba" tiene al final las lecciones "Escuchar con la voz", "Escuchar con audio propio", "Escuchar al límite" y "Escuchar con etiquetas", en ese orden, sin que cambien de lugar sus 18 lecciones anteriores.
- [ ] V02 [web, móvil] "Japonés sencillo" está en japonés y recupera sus dos escuchar y repetir del prototipo en su lugar: la última actividad de "Hiragana: las vocales" (`あいうえお`) y la tercera de "Saludos" (`こんにちは、元気ですか？`).
- [ ] V03 [backend] Existe "Inglés para viajar", del autor de los cursos de prueba, en inglés y sin publicar, con sus lecciones de escuchar y repetir.
- [ ] V04 [web, móvil] Los demás cursos de prueba están en español, y sus actividades se ven y se cursan igual que antes de esta feature.

### Idioma del curso

- [ ] V05 [web] En el mapa de un borrador, "Idioma" muestra "Español", con las nueve opciones en orden, después de la descripción, y la ayuda "El idioma de la voz que lee las frases de escuchar y repetir.".
- [ ] V06 [web] Al elegir "Inglés", "Guardar cambios" se habilita; al guardar aparece "Cambios guardados" y, al recargar, sigue en "Inglés".
- [ ] V07 [web] Un curso recién creado con "Nuevo curso" está en Español.
- [ ] V08 [web] El mapa de un curso en revisión muestra "Idioma: {idioma}" como texto, sin la lista.
- [ ] V09 [web, móvil] El detalle de "Japonés sencillo" muestra "Idioma: Japonés" debajo de "Por {nombre del autor}", y el de "Git esencial", "Idioma: Español".
- [ ] V10 [web, móvil] Las tarjetas del catálogo no muestran el idioma, y el catálogo y la búsqueda muestran los mismos cursos que antes de esta feature.
- [ ] V11 [backend] El servidor rechaza guardar los datos de un curso con un idioma que no es de la lista, y un curso creado antes de esta feature está en Español.

### Crear la actividad (editor)

- [ ] V12 [web] En la paleta, en "Voz", "Escuchar y repetir" ya no dice "Próximamente", se agrega al pulsarlo o arrastrarlo, y ningún tipo de la paleta dice "Próximamente".
- [ ] V13 [web] Su formulario tiene "Frase", la casilla "Mostrar el texto desde el inicio" marcada y "Audio de la frase", en ese orden, con sus ayudas.
- [ ] V14 [web] En un curso en Inglés, la ayuda del audio dice "Sin audio, la frase se lee con la voz del dispositivo, en inglés, el idioma del curso.".
- [ ] V15 [web] Con la frase vacía, la actividad lleva "Incompleta" y, al guardar, la frase muestra "Este campo es obligatorio.".
- [ ] V16 [web] La frase no deja escribir más de 200 caracteres ni saltos de línea, y se guarda sin los espacios del inicio y del final.
- [ ] V17 [web] El bloque de la secuencia muestra la frase.
- [ ] V18 [web] Al desmarcar la casilla, la vista previa muestra "El texto aparece al comprobar." en lugar de la frase.
- [ ] V19 [web] Después de guardar, al recargar la página, la frase, la casilla y el audio siguen como se guardaron.

### Subir un audio (editor)

- [ ] V20 [web] El campo vacío muestra "Elegir audio" y "MP3, M4A o WAV de hasta 30 segundos y 5 MB.".
- [ ] V21 [web] Al elegir el MP3 de 4 segundos, el campo muestra "Subiendo audio…" y luego "Escuchar", "0:04" con su peso, "Cambiar" y "Quitar". "Escuchar" lo reproduce.
- [ ] V22 [web] El M4A de una nota de voz del teléfono y el WAV también se suben y se oyen.
- [ ] V23 [web] El audio de 31 segundos muestra "El audio puede durar hasta 30 segundos." y el de 6 MB, "El audio puede pesar hasta 5 MB.". El campo se queda como estaba.
- [ ] V24 [web] El OGG y el FLAC muestran "Elige un audio MP3, M4A o WAV.", y el texto con extensión `.mp3`, "No se pudo leer el audio. Elige otro.".
- [ ] V25 [web] El MP3 con título, artista y carátula se sube, se oye igual y el campo muestra un peso menor que el del archivo; al descargarlo de Brote, ya no trae esos datos.
- [ ] V26 [web] Con un audio en el campo, "Cambiar" y elegir el de 31 segundos muestra su error y deja el anterior; "Cambiar" con otro válido lo reemplaza.
- [ ] V27 [web] "Quitar" deja el campo vacío, sin confirmación, aparece "Cambios sin guardar" y la vista previa lee la frase con la voz del navegador.
- [ ] V28 [web] Mientras se sube un audio, "Guardar lección" y "Probar lección" están deshabilitados con "Espera a que terminen de subir los archivos.", y se puede seguir escribiendo en otro campo.
- [ ] V29 [web] Con el servidor apagado, subir un audio muestra "No se pudo subir el audio. Inténtalo de nuevo." y lo demás sigue en pantalla.
- [ ] V30 [web] Con la sesión expirada, subir un audio lleva a "Entrar" con "Tu sesión terminó. Vuelve a entrar."; al entrar, la lección vuelve con sus cambios sin guardar y el campo de audio como estaba antes.

### Escuchar (cursar)

- [ ] V31 [web, móvil] En "Escuchar con la voz", la primera actividad muestra "Escucha y repite.", la frase en letra grande, "Escuchar", "Más lento" y "Grabarme", y no suena nada al abrirla.
- [ ] V32 [web, móvil] "Escuchar" lee la frase con una voz en español; "Más lento" la lee más despacio, sin que se oiga más grave.
- [ ] V33 [web, móvil] Mientras suena, el botón pulsado dice "Detener" y la detiene. Pulsar el otro mientras suena la empieza de nuevo a su velocidad.
- [ ] V34 [web, móvil] La segunda actividad, con el texto oculto, muestra "El texto aparece al comprobar." y no la frase.
- [ ] V35 [web, móvil] En "Escuchar con audio propio", "Escuchar" reproduce el audio subido, no la voz del dispositivo, y "Más lento" lo reproduce más despacio, sin que se oiga más grave.
- [ ] V36 [web, móvil] En "Inglés para viajar", la frase se lee con una voz en inglés, y en "Japonés sencillo", con una voz en japonés.
- [ ] V37 [web, móvil] Después de comprobar, "Escuchar" y "Más lento" siguen funcionando.
- [ ] V38 [móvil] Con el teléfono en silencio y el volumen arriba, "Escuchar" se oye.
- [ ] V39 [móvil] Al pasar la app a segundo plano mientras suena la frase, deja de sonar.

### Comprobar y autoevaluarse

- [ ] V40 [web, móvil] Al abrir la actividad, "Comprobar" está deshabilitado; grabarse no lo habilita, y se habilita en cuanto la frase empieza a sonar con "Escuchar" o con "Más lento". Al detenerla, sigue habilitado.
- [ ] V41 [web, móvil] Al comprobar la actividad con el texto oculto, la frase aparece en su lugar y, debajo, "¿Lo dijiste bien?" con "Lo dije bien" y "No me salió".
- [ ] V42 [web, móvil] Hasta autoevaluarse no aparece "Continuar".
- [ ] V43 [web, móvil] "Lo dije bien" muestra "¡Correcto!" y "No me salió", "A repasar".
- [ ] V44 [web, móvil] En "Escuchar con la voz", eligiendo "Lo dije bien" en una actividad y "No me salió" en la otra, al terminar se ve "Acertaste 1 de 2".
- [ ] V45 [web, móvil] "Hiragana: las vocales" cuenta 3 preguntas y "Saludos", 4.

### Grabarse

- [ ] V46 [web, móvil] La primera vez que pulso "Grabarme", el dispositivo pide permiso para el micrófono; abrir la actividad no lo pide.
- [ ] V47 [web, móvil] Con el permiso, se ve "Grabando…" con el tiempo que avanza, "Detener", y "Escuchar" y "Más lento" deshabilitados. "Detener" termina la grabación.
- [ ] V48 [web, móvil] Si no detengo la grabación, termina sola al llegar a "0:30 de 0:30".
- [ ] V49 [web, móvil] "Escuchar mi grabación" reproduce lo que dije, y "Escuchar" sigue reproduciendo el modelo; al empezar uno, el otro se detiene.
- [ ] V50 [web, móvil] "Volver a grabarme" reemplaza la grabación anterior.
- [ ] V51 [web, móvil] Al pasar a la siguiente actividad y repetir la lección, la actividad ya no tiene grabación.
- [ ] V52 [web] Con las herramientas del navegador abiertas, grabarse y escucharse no envían nada al servidor.
- [ ] V53 [web, móvil] Si niego el permiso, veo "Brote no tiene permiso para usar el micrófono. Puedes seguir sin grabarte." con dónde permitirlo, y puedo escuchar, comprobar y autoevaluarme.
- [ ] V54 [móvil] Con el permiso negado sin que el sistema lo vuelva a pedir, el aviso lleva "Abrir ajustes", que abre los ajustes de Brote en el teléfono. Al dar el permiso y volver, el aviso ya no está y "Grabarme" graba.
- [ ] V55 [web] En una computadora sin micrófono, "Grabarme" muestra "No se encontró un micrófono. Puedes seguir sin grabarte.".
- [ ] V56 [móvil] Al pasar la app a segundo plano mientras grabo, la grabación se detiene y, al volver, "Escuchar mi grabación" reproduce lo grabado hasta ese momento.
- [ ] V57 [web, móvil] Si la primera actividad es escuchar y repetir y solo la escucho y me grabo, salir no pide confirmación.

### Errores al cursar

- [ ] V58 [web, móvil] Si el audio propio no cargó, se ve el icono de audio roto y "No se pudo cargar el audio", no suena la voz del dispositivo, "Comprobar" está habilitado sin haber escuchado, y puedo grabarme, comprobar y autoevaluarme.
- [ ] V59 [web, móvil] Si no cargó el audio de la actividad con el texto oculto de "Escuchar con audio propio", la frase se ve en lugar de "El texto aparece al comprobar." y sigue a la vista cuando el audio llega.
- [ ] V60 [móvil] Si el audio no cargó porque se cayó la conexión, al volver la conexión carga solo y "Escuchar" lo reproduce.
- [ ] V61 [web] Si el audio no cargó y el servidor vuelve a responder, pulsar "Escuchar" lo vuelve a pedir y suena.
- [ ] V62 [web, móvil] En un dispositivo sin voz en coreano, una actividad sin audio de un curso en Coreano muestra "Este dispositivo no tiene una voz en coreano para leer la frase. Puedes instalar una en sus ajustes.", con "Escuchar" y "Más lento" deshabilitados, "Comprobar" habilitado y la frase a la vista aunque el autor la haya ocultado, y puedo comprobar y autoevaluarme. Una con audio propio del mismo curso no muestra el aviso.
- [ ] V63 [web, móvil] Si el audio propio llega dañado, al pulsar "Escuchar" en la actividad con el texto oculto de "Escuchar con audio propio" se ve "No se pudo reproducir la frase. Inténtalo de nuevo.", "Comprobar" se habilita y la frase aparece. Cuando el audio vuelve a llegar bien, "Escuchar" lo reproduce y el aviso desaparece.

### Accesibilidad y teclado

- [ ] V64 [web, móvil] Con lector de pantalla, los botones se anuncian como "Escuchar la frase", "Escuchar la frase más lento", "Grabarme", "Detener la grabación", "Escuchar mi grabación" y "Volver a grabarme", y se anuncian "Grabando" y "Grabación lista".
- [ ] V65 [web, móvil] Con lector de pantalla, la frase oculta no se lee antes de comprobar.
- [ ] V66 [web, móvil] Con lector de pantalla, en "Japonés sencillo" la frase `あいうえお` se lee con la voz japonesa del lector, y la consigna y los botones, en español.
- [ ] V67 [web] Con Tab se llega a cada botón, con foco visible, y Enter o la barra espaciadora lo pulsan. Al comprobar, el foco pasa a "Lo dije bien" y, al autoevaluarme, a "Continuar".
- [ ] V68 [web, móvil] La actividad se ve bien en modo oscuro y con "reducir transparencia", y con "reducir movimiento" el indicador de "Grabando…" no se mueve.

### Límites del curso y servidor

- [ ] V69 [web] En el lienzo, al elegir un audio en una lección sin otros archivos aparece "Archivos de esta lección: {x} de 25 MB" con su peso, y desaparece al quitarlo.
- [ ] V70 [web] Una lección con imágenes muestra "Archivos de esta lección", no "Imágenes de esta lección", y el mapa de un curso con imágenes o audios, "Archivos del curso: {x} de 200 MB".
- [ ] V71 [web] En el curso casi lleno, subir un audio que no cabe muestra "Este curso ya tiene 200 MB de archivos. Quita alguno y guarda para hacer espacio.", y subir una imagen que no cabe, lo mismo.
- [ ] V72 [web] En una lección con cuatro GIF de 5 MB y dos audios de 5 MB, "Guardar lección" y "Probar lección" muestran "Los archivos de esta lección pesan más de 25 MB. Quita alguno." y no guardan ni abren la prueba. Al quitar los dos audios, se guarda.
- [ ] V73 [web] Si quito un audio y guardo en una pestaña, y en otra pestaña con la versión anterior elijo "Reemplazar", aparece "Revisa los datos marcados." y el campo muestra "Este audio ya no está. Elige otro.".
- [ ] V74 [backend] Un audio que se sube y no se guarda en ninguna parte se borra un día después de subirlo; al eliminar una lección se borran sus audios que no se usan en otra parte del curso, y al eliminar el curso, todos.
- [ ] V75 [backend] Subir dos veces el mismo archivo al mismo curso da el mismo audio, que cuenta una vez.
- [ ] V76 [backend] Un audio subido sin pasar por el editor, con título, artista y carátula, se guarda sin ellos.
- [ ] V77 [backend] El servidor rechaza subir un audio sin sesión, a un curso ajeno, en revisión o publicado, un archivo que no es audio aunque se llame `.mp3`, uno de más de 30 segundos y uno de más de 5 MB.
- [ ] V78 [backend] El servidor rechaza guardar una lección con un audio de otro curso, un audio que no existe, una frase vacía, con un salto de línea o de más de 200 caracteres. No guarda nada.
- [ ] V79 [backend] Los audios de un borrador solo los trae su autor; los de un curso publicado, cualquier usuario con sesión, y sin sesión, nadie.

### Contenido

- [ ] V80 [web, móvil] En "Escuchar con etiquetas", la frase con `<b>hola</b>` y `<script>` se ve tal cual, sin interpretarse.
- [ ] V81 [web, móvil] En "Escuchar al límite", la frase de 200 caracteres se ve completa en un teléfono de 360 px, partida en renglones, y el audio de 30 segundos suena completo, a las dos velocidades.
- [ ] V82 [web] La vista previa del editor muestra la actividad igual que el reproductor, y "Probar lección" recorre "Escuchar con audio propio" como un alumno.

---

## Dependencias

- **Fase 1**: T001 antes que T009; T002 a T004 antes de las tareas de componentes de los
  clientes; T006 a T008 antes de cualquier tarea de su repo; T009 después de T001 y de las
  ramas.
- **Backend**: T010→T011 antes que todo lo que toca la base; T012→T013→T014→T015 (mismo
  archivo); T016 y T017 en paralelo con los lectores; T018→T019→T020; T021 necesita T015 y
  T019; T022, T019; T023 necesita T016 y T019; T024 y T025, T023 (mismo archivo); T026 y T027
  en paralelo; T028→T029 (el MP3 y el M4A); T030 en paralelo; T031→T032→T033 necesitan T016,
  T019 y T028; T034 necesita T028; T035 en paralelo.
- **Web** (después del punto de control del backend, o con la API de pie para probar):
  - T036→T037; T038 y T039 en paralelo; T040 necesita T036, T038 y T039; T041 en paralelo;
  - T042 a T046 en paralelo; T047 necesita T040 a T044; T048, T039 y T047;
  - T049 en paralelo; T050→T051→T052→T053 (el núcleo del editor); T054 necesita T042, T051 y
    T039; T055 en paralelo; T056 necesita T053 a T055; T057 necesita T045 y T053; T058, T048
    y T057;
  - T059 necesita T045, T046 y T049; T060 en paralelo.
- **Móvil**: T061 antes que todo; T062 y T063 en paralelo después; T064 necesita T062 y T063;
  T065, T061; **T066 justo después de T064 y T065**: si la voz no suena en silencio o el audio
  sale por el auricular, lo demás cambia; T067 y T068 en paralelo; T069 necesita T064, T065,
  T067 y T068; T070, T063 y T069; T071 en paralelo; T072 al final.
- **Cierre y validación** al final. Los criterios `[backend]` (V01, V03, V11 y V74 a V79) se
  pueden validar en cuanto termina la fase 2.

## Paralelo, por ejemplo

```text
Preparación: T002→T003→T004 (diseño) ‖ T001→T009 (contrato) ‖ T005 ‖ T006 ‖ T007 ‖ T008
Backend:     T010→T011 ‖ T012→T013→T014→T015 ‖ T016 ‖ T017 ‖ T028→T029 ‖ T030 ‖ T035
             luego T018→T019→T020, T021 ‖ T022, T023→T024→T025 ‖ T026 ‖ T027, y T031→T032→T033 ‖ T034
Web, base:   T036→T037 ‖ T038 ‖ T039, luego T040 ‖ T041
Web, piezas: T042 ‖ T043 ‖ T044 ‖ T045 ‖ T046, luego T047→T048
Web, editor: T049 ‖ T050→T051→T052→T053, T054 ‖ T055, luego T056 ‖ T057→T058, y T059 ‖ T060
Móvil:       T061, T062 ‖ T063, T064 ‖ T065→T066, luego T067 ‖ T068, T069→T070 ‖ T071, y T072
```

## Estrategia

1. Contrato y diseño en `brote_specs` (T001 a T005), porque todo lo demás los usa. Las ramas de
   código salen de la rama de F13 (T006 a T008), y se ponen al día con `dev` cuando F11 a F13 se
   fusionen.
2. **Lo más delicado del backend es limpiar el M4A** (T014): reescribir cajas, rearmar el `mdat`
   y los desplazamientos de `stco`. T015 lo protege (vuelve a leer lo limpio), y conviene probarlo
   pronto con la nota de voz del iPhone (B5 con `nota-de-voz.m4a`) antes de seguir.
3. Backend completo y probado con curl (punto de control de la fase 2): cubre los nueve
   criterios `[backend]` y deja las lecciones de prueba para los clientes.
4. **Lo más incierto es el audio en el iPhone** (research.md, puntos 10 y 13): T064 a T066 lo
   despejan con una pantalla desechable antes de la actividad. Conviene adelantarlos, aunque la
   web vaya después.
5. En la web, primero el núcleo del editor (T050 a T053), porque cambia lo que usan las
   imágenes de F13: después de T053, subir una imagen y guardar una teoría de F13 tiene que
   seguir igual. Luego la actividad y su formulario.
6. Cierre de documentos y validación manual completa (V01 a V82) antes de los PR a `dev` de cada
   repo, con la spec enlazada y los criterios cubiertos.
