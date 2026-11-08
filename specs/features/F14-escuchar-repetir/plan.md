# Plan técnico: F14 Escuchar y repetir, con audio propio

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-11-08 | **Rama**: `feature/F14-escuchar-repetir`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

El último tipo del prototipo, `escucharRepetir`, y el idioma del curso. Los audios van en
PostgreSQL, en una tabla `audio` al lado de `imagen` (decisión 0017, tomada con el usuario
al planear), con dos rutas como las de F13: subir (el archivo crudo) y servir. El servidor
lee MP3, M4A y WAV sin paquetes, saca su duración y les quita los datos ocultos antes de
guardarlos. El espacio del curso y el peso de la lección cuentan imágenes y audios juntos.
En la web, la voz es la Web Speech API y la grabación, `MediaRecorder`; el audio propio se
trae entero al abrir la lección. El móvil suma `expo-speech`, `expo-audio` y
`expo-file-system` (descarga los audios a su caché). El contrato sube a 0.11.0.

**Ramas**: como dice `continuar.md` ("Las features que siguen", paso 1), mientras F11, F12 y
F13 no estén en `dev`, las ramas de F14 salen de `feature/F13-imagenes-propias` en los tres
repos de código (en `brote_specs` ya existe). Es la misma excepción a la decisión 0013 que
usaron F12 y F13: cuando las anteriores se fusionen, cada rama hace `git merge origin/dev`,
y sus PRs van después.

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | El plan sigue la spec y sus aclaraciones. Al planear se cambiaron en la spec los audios de prueba (melodías, no voces) y el criterio de "no logró sonar", que ahora usa un audio dañado por el proxy, porque una voz que necesita internet no se puede provocar a propósito (research.md, puntos 16 y 17) |
| II. Un producto, cuatro repos | sí | `Audio`, `ActividadEscucharRepetir`, los idiomas, los límites y los mensajes en `contrato/` 0.11.0, copiados a los tres repos |
| III. El backend es la autoridad | sí | El servidor lee el formato real de los bytes, la duración y si se puede oír en todos los clientes; les quita los datos ocultos (no lo deja en la web, que no puede); cuenta el espacio con el curso bloqueado; comprueba que cada audio usado es del curso y reescribe sus datos; valida el idioma. Los audios de un borrador solo los trae su autor. La frase se muestra siempre como texto |
| IV. Actividades extensibles | con excepciones (ver "Excepciones a la constitución") | El tipo nuevo es lo de siempre: su tipo en el contrato, `validarEscucharRepetir`, `EscucharRepetir` y su formulario en la web, y `EscucharRepetir` en el móvil, en los registros. Además, piezas comunes: el idioma del curso, el reproductor y la vista previa (idioma y audios) y el núcleo del editor (archivos en vez de imágenes) |
| V. Estados explícitos | sí | La actividad: cargando el audio, lista, sonando, no cargó, sin voz, no logró sonar, grabando, con grabación, sin permiso, sin micrófono, comprobada y autoevaluada. El campo de audio: vacío, subiendo, con audio, error y perdido; guardar espera a las subidas |
| VI. Dependencias justificadas | sí | Tres en el móvil, en "Dependencias nuevas". El backend y la web, sin paquetes: `express.raw`, `node:crypto`, `speechSynthesis`, `MediaRecorder` y `HTMLAudioElement` ya están |
| VII. Estilo propio | sí | Identificadores en español sin acentos (`ActividadEscucharRepetir`, `leerAudio`, `pesoArchivos`, `useGrabacion`, `mostrarTexto`) |
| VIII. Terminado = validado | sí | Cada uno de los 82 criterios tiene pasos en `quickstart.md`. Sin pruebas automáticas (decisión 0012). Dos interruptores solo de desarrollo para "sin voz" (research.md, punto 17) |

Revisión después del diseño: sin cambios; las excepciones están abajo.

## Cambios al contrato

`contrato/VERSION` 0.10.0 → **0.11.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- Nuevos: `IDIOMAS_CURSO`, `IdiomaCurso`, `NOMBRE_IDIOMA`, `ETIQUETA_VOZ`,
  `LIMITES_ARCHIVOS`, `MENSAJES_ARCHIVOS`, `FORMATOS_AUDIO`, `FormatoAudio`,
  `TIPO_MIME_AUDIO`, `TIPOS_MIME_AUDIO_SUBIDA`, `Audio`, `RespuestaAudio`, `RUTA_AUDIOS`,
  `LIMITES_AUDIOS`, `MENSAJES_AUDIOS`, `ActividadEscucharRepetir`,
  `CONSIGNA_ESCUCHAR_REPETIR` y `VELOCIDAD_LENTA`.
- Cambian: `Actividad` (el tipo nuevo), `CALIFICA_ACTIVIDAD` (`escucharRepetir: true`),
  `LIMITES_ACTIVIDADES` (`fraseMax`), `DetalleCurso` y `DetalleLeccion` (`idioma`),
  `CuerpoDatosCurso` (`idioma?`) y `CursoEnEditor` (`idioma`, y `pesoImagenes` pasa a
  `pesoArchivos`).
- Se mueven: `pesoCursoMax` y `pesoLeccionMax` de `LIMITES_IMAGENES` a `LIMITES_ARCHIVOS`, y
  `cursoLleno`, `leccionPesada` y `esperarSubidas` de `MENSAJES_IMAGENES` a
  `MENSAJES_ARCHIVOS`, con los textos de "archivos".

## Cambios al modelo de datos

- Tabla `audio`, columnas `curso.idioma` y `leccion.audios`, en la migración
  `f14_escuchar_repetir`, con los `CHECK` `audio_valido` y `curso_idioma_valido` a mano.
  Detalle en [data-model.md](./data-model.md).
- Al cerrar, `specs/02-modelo-datos.md` recibe la entidad Audio y lo que cambia en Curso,
  Leccion y Actividad.

## API

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| POST | `/editor/cursos/:idCurso/audios` | Su autor, con el curso en borrador | Sube un audio al curso, sin sus datos ocultos (nueva) |
| GET | `/audios/:idAudio` | Con sesión: su autor, o cualquiera si el curso está publicado | Los bytes del audio (nueva) |
| PUT | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Valida `escucharRepetir` y sus audios; el peso cuenta imágenes y audios; borra los audios que dejó |
| DELETE | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Borra también sus audios sin uso |
| POST, PUT | `/editor/cursos`, `/editor/cursos/:idCurso` | Con sesión / su autor, sin publicar | Aceptan `idioma` |
| POST | `/editor/cursos/:idCurso/imagenes` | Como en F13 | El espacio cuenta también los audios |
| GET | `/cursos/:idCurso`, las lecciones y el editor | Como en F02, F03 y F05 | Traen `idioma`; el editor, `pesoArchivos` |

Detalle en [contracts/api.md](./contracts/api.md).

## Interfaz

Según `docs/diseno.md`. Lo nuevo se agrega **primero** ahí (es una tarea) y después a los
dos clientes con el mismo nombre.

### Lo que se agrega a `docs/diseno.md`

- **Componentes** (sección 4, en los dos clientes):

  | Componente | Props clave | Notas |
  |---|---|---|
  | `BotonEscuchar` | `velocidad` (`normal`, `lenta`), `sonando`, `cargando`, `deshabilitado`, `alPulsar` | `Boton` `secundario` con `Volume2` "Escuchar" o `Snail` "Más lento". Sonando: `Square` y "Detener". Cargando: un `IndicadorCarga` chico en lugar del icono, sin poder pulsarse. Nombre: "Escuchar la frase", "Escuchar la frase más lento" o "Detener" |
  | `BotonGrabar` | `estado` (`listo`, `grabando`, `conGrabacion`), `segundos`, `deshabilitado`, `alPulsar` | `Boton` `secundario` con `Mic` "Grabarme" (o "Volver a grabarme"); grabando, `Square` "Detener" y al lado "Grabando… 0:05 de 0:30" en `nota` `textoSuave` con un punto de 8 px en `error` que late (`lento`); con "reducir movimiento", quieto. Nombre: "Grabarme", "Detener la grabación" o "Volver a grabarme". "Grabando" y "Grabación lista" se anuncian (`aria-live` / `accessibilityLiveRegion`) |
  | `FraseEscuchar` | `frase`, `idioma`, `oculta` | La frase en `titulo2`, centrada, que se parte en renglones; marcada con `ETIQUETA_VOZ` (web `lang`, iOS `accessibilityLanguage`). Oculta: "El texto aparece al comprobar." en `cuerpo` `textoSuave`, sin la frase en el árbol de accesibilidad |
  | `EstadoAudio` | `estado` (`noCargo`) | `VolumeX` de 20 px en `textoTenue` y "No se pudo cargar el audio" en `nota` `textoSuave`, en una fila, debajo de los botones. Se anuncia |
  | `Aviso` (cambia) | `tono` `info`, `accion` (móvil) | Los avisos de sin voz, no logró sonar, sin permiso (con su segunda línea) y sin micrófono. En el móvil gana `accion`, que va debajo del texto: el de sin permiso lleva ahí un `Boton` `secundario` chico "Abrir ajustes" |

- **Editor (solo web)**:

  | Componente | Props clave | Notas |
  |---|---|---|
  | `CampoAudio` | `id`, `etiqueta`, `ayuda`, `valor`, `alCambiar`, `alElegirArchivo`, `error`, `mostrarErrores`, `deshabilitado` | Como `CampoImagen`. Vacío: `Boton` `secundario` chico "Elegir audio" con `FileAudio` y la nota "MP3, M4A o WAV de hasta 30 segundos y 5 MB." en `nota` `textoSuave`. Subiendo: `IndicadorCarga` chico y "Subiendo audio…". Con audio: un `BotonEscuchar` chico, "0:04 · 86 KB" en `nota` y "Cambiar" y "Quitar" (`fantasma` chico). La ayuda va debajo, como en `CampoTexto`; el error, debajo de todo |
  | `PesoArchivos` (antes `PesoImagenes`) | `peso`, `maximo`, `texto` | Igual, con "Archivos de esta lección" y "Archivos del curso" |

- **Actividades** (sección 6), "Escuchar y repetir":
  - De arriba abajo: la consigna (`CONSIGNA_ESCUCHAR_REPETIR`), `FraseEscuchar`, una fila
    con los dos `BotonEscuchar`, `EstadoAudio` o el `Aviso` si los hay, `BotonGrabar` con
    "Escuchar mi grabación" (`BotonEscuchar` con la etiqueta propia) y, al comprobar, la
    autoevaluación de la pregunta abierta ("¿Lo dijiste bien?", "Lo dije bien", "No me
    salió"). La barra inferior, como en el reto de código.
  - **Teclado** (web): las teclas 1 a 9 no hacen nada; Tab recorre los botones; al
    comprobar, el foco pasa a "Lo dije bien" y, al autoevaluarse, a "Continuar".
  - **Iconos**: `Volume2` (escuchar), `Snail` (más lento), `Square` (detener), `Mic`
    (grabar), `VolumeX` (no cargó), `FileAudio` (elegir audio).

### Por pantalla

| Pantalla | Usa | Nuevo |
|---|---|---|
| Reproductor de la lección (web y móvil) | `BarraRespuesta`, `Boton`, `Aviso`, `Superficie` | `EscucharRepetir` con `FraseEscuchar`, `BotonEscuchar`, `BotonGrabar` y `EstadoAudio`; `ContextoIdioma` y `ContextoAudios` con precarga y reintento |
| Detalle del curso (web y móvil) | El de F02 | "Idioma: {idioma}" debajo del autor, en `nota` `textoSuave` |
| Mapa del curso (web) | `CampoSelector`, `PesoImagenes` | "Idioma" con `CampoSelector` (sin `textoVacio`); `PesoArchivos` |
| Curso que no se edita (web) | El de F06 | "Idioma: {idioma}" |
| Lienzo, inspector (web) | Los formularios de F05 a F13 | `FormularioEscucharRepetir` con `CampoTexto`, una casilla y `CampoAudio` |
| Lienzo, barra superior (web) | La de F13 | `PesoArchivos` y "Espera a que terminen de subir los archivos." |
| Lienzo, vista previa y probar (web) | `VistaPrevia`, `ProbarLeccion` | La vista previa da `ContextoIdioma` y su propio `ContextoAudios` |
| Paleta (web) | `PaletaActividades` | Nada: el tipo entra al registro y deja de decir "Próximamente" |

La casilla "Mostrar el texto desde el inicio" es un `<input type="checkbox">` nativo con el
aspecto de los campos (foco y etiqueta como `CampoTexto`); si no existe ya un componente de
casilla en la sección 4, se agrega como `CampoCasilla` (`id`, `etiqueta`, `ayuda`, `valor`,
`alCambiar`, `deshabilitado`).

## Por repo

### brote_backend_express

- **Archivos**:
  - `prisma/schema.prisma`: modelo `Audio` (`@@map("audio")`, `@@unique([idCurso,
    huella])`, relación `"AudiosCurso"` con `onDelete: Cascade`); en `Curso`, `idioma String
    @default("es")` y `audios`; en `Leccion`, `audios String[] @default([])`.
  - `prisma/migrations/<fecha>_f14_escuchar_repetir/migration.sql`: la que genera `prisma
    migrate dev`, más a mano los `CHECK` `audio_valido` y `curso_idioma_valido`
    (data-model.md).
  - `src/validacion/audios.ts`, nuevo: `leerAudio(bytes)` → `{ formato, duracion, limpio }`
    o `null` (research.md, puntos 3 y 4), con un lector por formato, y
    `comprobarAudioSubido(cuerpo, tipo)`, que lanza el `ErrorApi` de cada caso.
  - `src/validacion/actividades.ts`: `validarEscucharRepetir` en `validadores`,
    `validarAudioActividad`, y, exportadas, `audiosDeActividad`, `idsDeAudios` y
    `mapearAudios`.
  - `src/validacion/editor.ts`: `validarDatosCurso` acepta `idioma` (ausente o de
    `IDIOMAS_CURSO`).
  - `src/servicios/archivos.ts`, nuevo: `pesoArchivosCurso(tx, idCurso)` y
    `limpiarArchivosSinUsar(idCurso?)` (research.md, punto 7).
  - `src/servicios/audios.ts`, nuevo: `subirAudio`, `traerAudio`, `audiosDelCurso`,
    `borrarAudiosSinUso` y `limpiarAudiosSinUsar`, como los de `servicios/imagenes.ts`.
  - `src/servicios/imagenes.ts`: `subirImagen` cuenta el espacio con `pesoArchivosCurso` y
    el mensaje de `MENSAJES_ARCHIVOS`.
  - `src/servicios/editor.ts`: `guardarLeccion` (audios del curso, peso de la lección con
    los dos, `audios`, borrar los que dejó), `borrarLeccion` (sus audios sin uso),
    `crearCurso` y `actualizarCurso` (`idioma`), `leerCursoEnEditor` (`idioma` y
    `pesoArchivos`).
  - `src/servicios/cursos.ts` (detalle) y `src/servicios/lecciones.ts` (lección publicada):
    `idioma`. `traerLeccionEnEditor` también.
  - `src/rutas/audios.ts`, nuevo, montado en `/audios` en `src/rutas/index.ts`.
  - `src/rutas/editor.ts`: `POST /cursos/:idCurso/audios`, con `requerirSesion` y
    `leerArchivo` generalizado (lector y mensaje del `413`).
  - `src/servidor.ts`: `limpiarArchivosSinUsar()` en lugar de `limpiarImagenesSinUsar()`.
  - `scripts/audios-prueba.ts`, nuevo: las melodías en WAV, en código (research.md, punto
    16); `scripts/audios-prueba/escala-sube.mp3` y `escala-baja.m4a`, ya hechos, y
    `scripts/generar-audios-prueba.ts` (`npm run audios:generar`), que los rehace con
    `afconvert` y `lame`.
  - `scripts/actividades-prototipo.ts`: las dos de "Japonés sencillo", en su lugar, y el
    comentario de arriba con los trece tipos.
  - `scripts/datos-prueba.ts`: `idioma` en `CursoPrueba` (por defecto `es`), "Japonés
    sencillo" en `ja`, las lecciones 19 a 22 de "Actividades de prueba" e "Inglés para
    viajar" (quickstart.md, sección 1.1), con `audioPrueba(nombre)`.
  - `scripts/sembrar-cursos.ts`: crea los audios de cada curso con `leerAudio`, cambia las
    referencias, llena `leccion.audios` y `curso.idioma`.
  - `scripts/archivos-audio-validacion.ts`, nuevo, con `npm run audios:validacion --
    <carpeta>`: los archivos del quickstart (sección 1.2).
  - `scripts/proxy-validacion.ts`: `/audios/*` en `bloquear` y `retrasar`, y el modo
    `danar`.
- **Validación de entrada**: la forma, en la ruta (`validarActividades`, `validarDatosCurso`
  y `comprobarAudioSubido`); lo que necesita la base (que el audio sea del curso, el espacio,
  el peso de la lección), en el servicio con el curso bloqueado. Los errores son `ErrorApi`,
  con los estados de contracts/api.md.
- **Notas**:
  - `bd:sembrar` valida las actividades antes de tocar la base, también con audios.
  - Ninguna consulta de metadatos trae `audio.datos`.
  - Comprobar con `npm run tipos`, `npm run lint` y la sección 2 del quickstart.

### brote_web_react

- **Páginas y rutas**: sin rutas nuevas. Cambian `paginas/MapaCurso/DatosCurso.tsx`
  ("Idioma", `PesoArchivos`, `pesoArchivos`), `paginas/MapaCurso/CursoNoEditable.tsx`
  ("Idioma: {idioma}"), `paginas/DetalleCurso/DetalleCurso.tsx` ("Idioma: {idioma}"),
  `paginas/Leccion/Leccion.tsx` (pasa `idioma` al reproductor) y
  `paginas/LienzoLeccion/EditorLeccion.tsx` (`ContextoIdioma`, `subirAudio` en
  `ContextoSubidas`, `PesoArchivos`, la nota de esperar).
- **Componentes** (`src/componentes/`):
  - Nuevos: `BotonEscuchar/`, `BotonGrabar/`, `FraseEscuchar/`, `EstadoAudio/`,
    `CampoAudio/` y, si hace falta, `CampoCasilla/`.
  - Cambia de nombre: `PesoImagenes/` → `PesoArchivos/`.
- **Actividades** (`src/actividades/`):
  - `EscucharRepetir/`, nuevo: `EscucharRepetir.tsx` (cursar), `FormularioEscucharRepetir.tsx`,
    `editorEscucharRepetir.ts` y su `.module.css`. Entra en `registro.ts` y
    `registroEditor.ts`.
  - `ReproductorLeccion/ReproductorLeccion.tsx`: prop `idioma`, `ContextoIdioma`,
    `ContextoAudios` y `usePrecargarAudios`.
- **Editor** (`src/editor/`): `archivos.ts`, nuevo, con lo genérico de `imagenes.ts`
  (research.md, punto 15); `audios.ts`, nuevo (`ValorAudio`, `valorAudioVacio`,
  `aValorAudio`, `errorAudio`); `estadoLeccion.ts` con `archivoSubido`, `archivoNoSubido` y
  `marcarArchivosPerdidos`; `VistaPrevia/VistaPrevia.tsx` con prop `idioma` y sus
  proveedores; `ProbarLeccion/ProbarLeccion.tsx` pasa `idioma`.
- **Hooks**: `useEditorLeccion.ts` (`subirAudio`, el peso con los dos, `audios.<id>` de un
  `400`), y nuevos `usePrecargarAudios.ts`, `useFrase.ts` y `useGrabacion.ts` (research.md,
  puntos 9, 12 y 14).
- **Contextos**: `ContextoIdioma.ts` y `ContextoAudios.ts`, nuevos; `ContextoSubidas.ts`
  gana `subirAudio`.
- **Servicios**: `servicios/audios.ts`, nuevo (`subirAudio(idCurso, archivo)` y
  `leerErrorDeSubidaAudio`); `servicios/editor.ts`, `actualizarCurso` con `idioma`.
- **Utilidades**: `utilidades/audios.ts`, nueva (`urlAudio`, `prepararAudio`,
  `audiosDe(actividad)`, `formatearDuracion`); `utilidades/voz.ts`, nueva
  (`vocesDelIdioma`, `elegirVoz`, `decir`, con `VITE_SIN_VOCES` solo en desarrollo);
  `utilidades/imagenes.ts` sigue con `formatearPeso` y `formatearMegas`, que usa también
  el audio.
- **Estado**: local en la actividad (`useFrase`, `useGrabacion`); los audios precargados,
  en `ContextoAudios` del reproductor; las subidas, en el borrador (como en F13).
- **Notas**:
  - `paleta.ts`, `Inspector`, `Secuencia` y `useTeclasActividad` no se tocan.
  - Comprobar con `npm run tipos`, `npm run lint`, `npm run build` y en Chrome.

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**: sin rutas nuevas. `app/curso/[idCurso].tsx` muestra
  "Idioma: {idioma}"; `app/leccion/[idCurso]/[idLeccion].tsx` pasa `idioma` al
  reproductor.
- **Componentes** (`src/componentes/`): nuevos `BotonEscuchar.tsx`, `BotonGrabar.tsx`,
  `FraseEscuchar.tsx` y `EstadoAudio.tsx`; `Aviso.tsx` acepta una acción (el botón "Abrir
  ajustes") si no la acepta ya.
- **Actividades** (`src/actividades/`): `EscucharRepetir.tsx`, nuevo, en `registro.ts`;
  `ReproductorLeccion.tsx` con `idioma`, `ContextoIdioma` y `ContextoAudios`.
- **Hooks**: `usePrecargarAudios.ts` (descarga con `expo-file-system`, reintento con el
  `intento` de las imágenes), `useFrase.ts` (`expo-speech` y `expo-audio`) y
  `useGrabacion.ts` (`expo-audio`, permisos, `AppState` y "Abrir ajustes"), nuevos
  (research.md, puntos 10, 13 y 14).
- **Contextos**: `ContextoIdioma.ts` y `ContextoAudios.ts`, nuevos.
- **Utilidades**: `utilidades/audios.ts` (`urlAudio`, `audiosDe`, `formatearDuracion`) y
  `utilidades/voz.ts` (`vocesDelIdioma`, `elegirVoz`, con `EXPO_PUBLIC_SIN_VOCES` solo en
  `__DEV__`), nuevas.
- **Configuración**: `app.json` gana el plugin `expo-audio` con `microphonePermission`
  (research.md, punto 13).
- **Almacenamiento local**: los audios descargados en `Paths.cache/audios/` (por id: un audio
  nunca cambia) y la grabación en curso, que se borra al descartarla. Nada más.
- **Notas**:
  - Lo primero en el teléfono, antes de terminar la actividad: que la voz suena con el
    interruptor de silencio (`useApplicationAudioSession`), que "Más lento" del audio propio
    no lo vuelve más grave y que, después de grabar, el audio suena por el altavoz con su
    volumen (research.md, puntos 10 y 13).
  - Comprobar con `npm run tipos`, `npm run lint`, `npx expo export --platform ios` y en el
    iPhone.

### brote_specs

- `contrato/contrato.ts` y `contrato/VERSION`.
- `docs/decisiones/0017-audios-en-postgresql.md` y su fila en `docs/decisiones/README.md`
  (con este plan).
- `docs/diseno.md`: lo de "Interfaz", antes que el código.
- `docs/arquitectura.md`, "Contenido de los cursos": los audios van en PostgreSQL, se
  sirven con `GET /audios/:idAudio` y se guardan sin sus datos ocultos; el idioma del curso.
- Al cerrar: `specs/02-modelo-datos.md` (data-model.md, "Al cerrar"), `specs/00-proyecto.md`
  (los 13 tipos, ya completos) y `specs/01-navegacion.md`.

## Cambios a la navegación

- Sin pantallas ni rutas nuevas.
- `specs/01-navegacion.md`, "Salir de una lección": escuchar y grabarse no cuentan como
  haber hecho algo; comprobar, sí. En el móvil, "Abrir ajustes" sale a los ajustes del
  teléfono y, al volver, la lección sigue como estaba.

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| `expo-speech` (la del SDK 58, con `npx expo install`) | móvil | La voz sintetizada del dispositivo: `speak` con idioma, voz y velocidad, sus eventos y `getAvailableVoicesAsync` para saber si hay voz en el idioma | Ninguna: React Native no trae voz sintetizada, y un servicio de voz en la nube pediría conexión, una cuenta y mandar la frase afuera |
| `expo-audio` (la del SDK 58) | móvil | Reproducir el audio propio y la grabación con `setPlaybackRate` y corrección de tono, grabar (`useAudioRecorder`), los permisos del micrófono y la sesión de audio (modo silencio) | `expo-av`, que Expo ya no mantiene y `expo-audio` reemplaza; React Native no reproduce ni graba audio |
| `expo-file-system` (la del SDK 58; ya viene con `expo`, pasa a dependencia directa) | móvil | Descargar los audios de la lección a la caché al abrirla, con las cabeceras de la sesión, y borrar las grabaciones | Reproducir directo de la API con `expo-audio` (`{ uri, headers }`): no precarga al abrir la lección ni se oye sin conexión después (research.md, punto 10) |

El backend y la web no suman paquetes (research.md, puntos 3, 4, 9 y 12). `lame` (Homebrew)
solo hace falta para regenerar los dos audios de prueba que van en git, no para correr ni
validar Brote.

## Excepciones a la constitución

| Qué | Por qué hace falta | Por qué no sirve la opción simple |
|---|---|---|
| El idioma del curso en `Curso`, `DetalleLeccion`, el mapa y el detalle | La voz lee las frases en el idioma del curso, y el alumno lo ve en el detalle | Un idioma en cada actividad (el `lang` del prototipo) es justo lo que el usuario descartó |
| `ReproductorLeccion` y `VistaPrevia` en los dos clientes (`ContextoIdioma`, `ContextoAudios`) | La actividad necesita el idioma del curso, y la spec pide traer todos los audios al abrir la lección y reintentar | Pasar el idioma en `PropsActividad` cambiaría los trece componentes; traer cada audio al montar la actividad no sería precarga |
| El núcleo del editor web (`editor/archivos.ts`, `estadoLeccion.ts`, `useEditorLeccion.ts`, `EditorLeccion.tsx`, `ContextoSubidas`) | El audio se sube como las imágenes, y guardar espera a los dos y cuenta su peso juntos | Un camino aparte para el audio duplicaría las subidas, el peso y los archivos perdidos de F13 (research.md, punto 15). Lo nuevo sigue sin saber de ningún tipo |
| `PesoImagenes` → `PesoArchivos`, y los textos de F13 que pasan a "archivos" | Lo pide la spec | Dejar el nombre viejo haría que el código dijera "imágenes" donde cuenta audios |
| `servicios/imagenes.ts` y `servicios/editor.ts` del backend, fuera de los validadores | El espacio del curso y el peso de la lección cuentan imágenes y audios | Contarlo por separado dejaría pasar un curso de 200 MB de imágenes más audios |
| Interruptores de desarrollo `VITE_SIN_VOCES` y `EXPO_PUBLIC_SIN_VOCES` | Validar "sin voz en el idioma", que no se puede provocar en la Mac ni en el iPhone | Sin él, ese criterio no se valida a mano (principio VIII). No existe en producción (research.md, punto 17) |
| Ramas desde `feature/F13-imagenes-propias` (decisión 0013) | F11, F12 y F13 no están en `dev` y F14 usa su código (subir archivos, `ContextoImagenes`, el proxy) | Esperar a que se fusionen detendría el trabajo; es lo que dice `continuar.md`, como en F12 y F13 |
