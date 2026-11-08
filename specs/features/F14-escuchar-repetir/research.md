# Investigación: F14 Escuchar y repetir, con audio propio

Lo que esta feature tiene de nuevo. El stack, `fetch` propio, Context y la validación
manual ya están decididos (`docs/decisiones/`). La forma de subir, servir, contar y borrar
archivos es la de F13 ([research de F13](../F13-imagenes-propias/research.md)); aquí solo
va lo que el audio cambia.

## 1. Dónde se guardan los audios

- **Decisión**: en PostgreSQL, en una tabla `audio` con los bytes (`bytea`), al lado de
  `imagen`. Lo decidió el usuario al planear (2026-11-08) y queda como la decisión 0017, que
  extiende la 0016.
- **Por qué**: las mismas razones de la 0016 (sin servicio ni paquete, borrar en la misma
  transacción, un solo respaldo), con archivos más chicos (5 MB) y los mismos límites por
  lección y por curso.
- **Una tabla aparte, no una `archivo` común**: un audio tiene duración y no tiene lados, y
  sus `CHECK` son otros. Juntar las dos tablas obligaría a migrar `imagen`, `id_portada` y
  el código de F13 sin ganar nada: lo que se comparte (el espacio del curso, el peso de la
  lección y la limpieza) son tres consultas que suman o recorren las dos.
- **Descartadas**: el disco del servidor y un almacenamiento tipo S3, por lo mismo que en la
  0016; además dejarían las imágenes y los audios en lugares distintos.

## 2. Cómo se sube un audio

- **Decisión**: `POST /editor/cursos/:idCurso/audios`, igual que las imágenes: el archivo
  crudo como cuerpo, leído con `express.raw` solo en esa ruta, con `limit` de 5 MB. El
  `leerArchivo` de F13 se generaliza para recibir el lector y el mensaje del `413` ("El
  audio puede pesar hasta 5 MB.").
- **`Content-Type` aceptados**: `audio/mpeg`, `audio/mp4`, `audio/x-m4a`, `audio/m4a`,
  `audio/wav`, `audio/x-wav`, `audio/wave` y `audio/vnd.wave` (`TIPOS_MIME_AUDIO_SUBIDA`):
  los navegadores no se ponen de acuerdo en cómo llamar a un M4A o a un WAV. La web manda
  siempre el de `TIPO_MIME_AUDIO`; los demás son para quien sube sin la web.
- **Orden**: sesión (401), tamaño (413), formato (400), lectura (400), duración (400),
  curso (404 y 403) y espacio (400). Si un audio pasa del peso y de la duración, el `413`
  sale primero, como pide la spec.
- **El original manda en los 5 MB**: el límite es el del archivo que elige el autor. Lo que
  se guarda es el audio limpio (punto 4), que pesa igual o menos.

## 3. Leer un audio en el servidor sin paquetes

- **Decisión**: `leerAudio(bytes)` (`src/validacion/audios.ts`) reconoce el formato por sus
  bytes, saca la duración y devuelve el audio limpio: `{ formato, duracion, limpio }`, con
  la duración en milisegundos, o `null` si no es ninguno de los tres, está cortado o guarda
  el sonido de una forma que no se oye en todos los clientes. Como en F13, un
  `Content-Type` que no es de la lista es "Elige un audio MP3, M4A o WAV." (un OGG o un FLAC
  llegan así) y unos bytes que `leerAudio` no acepta, "No se pudo leer el audio. Elige
  otro.".
  - **MP3**: salta la etiqueta ID3v2 del inicio (`ID3`, tamaño en *synchsafe*, más 10 si
    trae pie) y recorre los cuadros MPEG uno por uno desde el primer encabezado válido
    (sincronía `0xFFE`, MPEG 1, 2 o 2.5, capa III, tasa y frecuencia válidas). Cada
    encabezado da el largo de su cuadro; la duración es la suma de muestras (1152 por
    cuadro en MPEG 1, 576 en los demás) entre la frecuencia. Se detiene al llegar a una
    etiqueta del final (`TAG` de ID3v1, `APETAGEX`, `LYRICS`) o a bytes que no son un
    cuadro. Pide al menos 10 cuadros seguidos para no confundir datos con un MP3. Las capas
    I y II se rechazan.
  - **WAV**: `RIFF…WAVE` y sus bloques. Pide un `fmt ` de PCM entero (formato 1, o `0xFFFE`
    con el subformato PCM), de 1 o 2 canales, de 8, 16 o 24 bits y entre 8 000 y 48 000 Hz,
    y un `data`. La duración es el largo de `data` entre los bytes por segundo. Un WAV de
    punto flotante, ADPCM o µ-law es `null`.
  - **M4A**: recorre las cajas: `ftyp`, un solo `moov` con un solo `trak` de sonido
    (`hdlr` `soun`), cuya entrada de `stsd` es `mp4a` con un `esds` de AAC (tipo de objeto
    `0x40`), y un solo `mdat`. La duración es la de `mdhd` entre su escala. Un ALAC, un Opus
    en MP4, un archivo fragmentado (`moof`), con más de una pista de sonido o con una de
    video es `null`. Las pistas que no son de sonido ni de video (`meta`, `text`, `sbtl`,
    `tmcd`; una nota de voz reciente del iPhone puede traer una de metadatos) se descartan
    al limpiar.
- **Por qué sin paquetes**: hay que recorrer los bloques de todos modos para limpiar el
  audio (punto 4), y con eso sale la duración. `music-metadata` lee la duración pero no
  limpia; `ffmpeg` es un binario aparte en el servidor (principio VI).
- **Duración**: se compara redondeada a décimas (`Math.round(duracion / 100) * 100 <=
  LIMITES_AUDIOS.duracionMax`): un audio de 30.04 s, por el relleno que agrega el
  codificador, cuenta como 30. La web usa la misma regla.
- **Seguridad**: el audio limpio se guarda y se sirve sin interpretarlo, con `nosniff` y
  la CSP de las imágenes.

## 4. Quitar los datos ocultos (spec: "Datos ocultos")

- **Decisión**: el servidor los quita al recibir el audio (lo decidió el usuario al
  especificar). La web no puede hacerlo sin volver a comprimir el sonido, que es justo lo
  que la spec no quiere.
  - **MP3**: lo limpio son solo los cuadros MPEG contados en el punto 3, uno tras otro: se
    van las etiquetas ID3v2, ID3v1, APE y Lyrics3, con el título, el artista, la carátula y
    los comentarios. El cuadro `Xing`/`Info` del codificador se queda: es un cuadro más y
    solo dice cómo se codificó.
  - **WAV**: se vuelve a escribir con solo `RIFF`, `fmt ` y `data` (con su byte de relleno
    si el largo es impar). Se van `LIST`/`INFO`, `id3 `, `bext`, `iXML` y lo demás.
  - **M4A**: se arma de nuevo como `ftyp` + `moov` + `mdat`. El `moov` se queda con `mvhd` y
    solo el `trak` de sonido, y en los dos se quitan `udta` y `meta` (ahí van el título, la
    carátula y, en las notas de voz del iPhone, el lugar y el nombre de la grabación) y
    cualquier `uuid`; fuera, `free`, `skip` y `wide`. El `mdat` nuevo lleva solo los trozos
    de esa pista, en orden (dónde empieza cada uno lo dice `stco` o `co64`, y cuánto mide,
    `stsc` y `stsz`), así que tampoco quedan dentro los datos de las pistas descartadas; y
    `stco` o `co64` se reescriben con los nuevos inicios. El sonido no se toca.
- **Comprobación**: `leerAudio(limpio)` tiene que dar el mismo formato y la misma
  duración; si no, el audio es `null` ("No se pudo leer el audio. Elige otro."). Así, un
  error al limpiar nunca guarda un audio roto.
- **Descartada**: rechazar los audios con datos ocultos, como el servidor hace con las
  fotos de F13. Ahí la web limpia antes de subir; aquí no puede, así que el autor no tendría
  forma de subir una nota de voz normal.

## 5. Preparar el audio en la web

- **Decisión**: `prepararAudio(archivo)` (`src/utilidades/audios.ts`, web), antes de subir:
  1. Por el tipo o, si el navegador no lo sabe, la extensión (`.mp3`, `.m4a`, `.wav`): si
     no es ninguno, "Elige un audio MP3, M4A o WAV." (un OGG, un FLAC o un video caen
     aquí).
  2. Más de 5 MB: "El audio puede pesar hasta 5 MB.".
  3. Lo abre en un `<audio>` con su `URL.createObjectURL` y espera `loadedmetadata`: si
     falla (`error`), "No se pudo leer el audio. Elige otro." (un texto con extensión `.mp3`
     o un M4A sin pérdida en Chrome); si dura más de 30 s, "El audio puede durar hasta 30
     segundos.".
  4. Devuelve el archivo tal cual, con el `Content-Type` de `TIPO_MIME_AUDIO`.
- La duración que muestra el campo es la del servidor (`Audio.duracion`), no la del
  navegador.
- `selector` del campo: `accept="audio/*,.mp3,.m4a,.wav"`, para que un OGG o un FLAC se
  puedan elegir y muestren su error.

## 6. Servir los audios

- **Decisión**: `GET /audios/:idAudio` (`src/rutas/audios.ts`), con las mismas reglas que
  `GET /imagenes/:idImagen`: con sesión; su autor, o cualquiera si el curso está publicado;
  si no, `404`. Cabeceras: `Content-Type` del formato, `Cache-Control: private,
  max-age=31536000, immutable`, `ETag` con la huella, `nosniff` y la CSP.
- **Sin `Range`**: los dos clientes traen el audio completo antes de reproducirlo (puntos 9
  y 10), así que no hace falta responder por partes. Si algún día se reproduce directo de
  la API, se agrega.
- **Web**: `fetch` con `credentials: "include"`, como los GIF de F13 (la API ya responde
  con CORS a la web). **Móvil**: la descarga del punto 10, con `cabecerasSesion()`.

## 7. Espacio del curso, peso de la lección y limpieza

- **Quién usa cada audio**: `leccion.audios` (`text[]`, por defecto `{}`), como
  `leccion.imagenes`. Lo escribe `guardarLeccion`.
- **Espacio del curso**: `pesoArchivosCurso(tx, idCurso)` (`servicios/archivos.ts`, nuevo)
  suma el `peso` de `imagen` y de `audio` del curso en una consulta. La usan `subirImagen`,
  `subirAudio` y `leerCursoEnEditor` (`CursoEnEditor.pesoArchivos`).
- **Peso de la lección**: `guardarLeccion` comprueba las imágenes y los audios de la
  lección (que existan y sean del curso, como en F13) y después la suma de los dos, sin
  repetir ids, contra `LIMITES_ARCHIVOS.pesoLeccionMax`. El `400` dice
  `MENSAJES_ARCHIVOS.leccionPesada`. Un audio que falta va en `campos["audios.<id>"]`, como
  `imagenes.<id>`.
- **Borrar al momento**: al guardar una lección, los audios que tenía y ya no tiene, si
  ninguna otra lección del curso los usa; lo mismo al eliminar una lección. Con su curso,
  en cascada. Un audio no puede ser portada, así que solo cuentan las lecciones.
- **Borrar a un día**: `limpiarArchivosSinUsar(idCurso?)` llama a la de imágenes de F13 y a
  `limpiarAudiosSinUsar`. Corre donde hoy corre la de imágenes: al subir cualquier archivo
  (para ese curso, antes de contar el espacio), al arrancar la API y cada hora.
- **Concurrencia**: subir un audio pasa por `conCursoEditable`, que bloquea la fila del
  curso: una imagen y un audio subidos a la vez no se pasan de los 200 MB.

## 8. La forma en el contrato

- `ActividadEscucharRepetir = { tipo: "escucharRepetir"; frase: string; mostrarTexto:
  boolean; audio?: Audio }`. `mostrarTexto` siempre va (sin valor por defecto escondido en
  los clientes); `audio`, solo si el autor subió uno.
- `Audio = { id, formato, duracion, peso }`: el cliente sabe la duración y el peso sin
  traer el audio (el campo del editor y el peso de la lección), como con `Imagen`. Al
  guardar, el servidor reescribe `formato`, `duracion` y `peso` con los de la base.
- **El idioma del curso**: `curso.idioma`, uno de `IDIOMAS_CURSO` (`es`, `en`, `fr`, `pt`,
  `de`, `it`, `ja`, `zh`, `ko`: las etiquetas de idioma de BCP 47, que entienden la voz y
  los lectores de pantalla). `NOMBRE_IDIOMA` da cómo se escribe ("Japonés") y
  `ETIQUETA_VOZ` la variante que se prefiere para la voz (`es-MX`, `en-US`, `fr-FR`,
  `pt-BR`, `de-DE`, `it-IT`, `ja-JP`, `zh-CN`, `ko-KR`), como dice la spec en "Supuestos".
- **Dónde viaja**: `DetalleCurso.idioma` (el detalle), `CursoEnEditor.idioma` (el mapa),
  `CuerpoDatosCurso.idioma?` (sin él no cambia; `POST` sin él crea el curso en `es`) y
  `DetalleLeccion.idioma`, el de su curso. Así el reproductor y el editor (con
  `LeccionEnEditor`, que extiende `DetalleLeccion`) lo tienen sin pedir el curso.
- **Los límites de F13 que ahora son de archivos** se mueven: `LIMITES_IMAGENES.pesoCursoMax`
  y `pesoLeccionMax` pasan a `LIMITES_ARCHIVOS`, y `MENSAJES_IMAGENES.cursoLleno`,
  `leccionPesada` y `esperarSubidas`, a `MENSAJES_ARCHIVOS` con los textos nuevos.
  `CursoEnEditor.pesoImagenes` pasa a `pesoArchivos`. Al copiar el contrato, los tres repos
  dejan de compilar donde los usaban: es lo que se busca, para que ningún texto se quede
  diciendo "imágenes".

## 9. Escuchar en la web

- **Voz**: la Web Speech API (`speechSynthesis`), sin paquetes. `src/utilidades/voz.ts`:
  - `vocesDelIdioma(idioma)`: `speechSynthesis.getVoices()`; si viene vacía (Chrome las
    carga después), espera `voiceschanged` hasta 1.5 s. Filtra por idioma (`lang` empieza
    con el código, con `_` leído como `-`). Sin `speechSynthesis` o sin voces, el aviso de
    "sin voz".
  - `elegirVoz(voces, idioma)`: primero una local (`localService`) de `ETIQUETA_VOZ`,
    luego cualquier local del idioma, luego una remota de la etiqueta y luego cualquiera.
    Las locales van primero porque funcionan sin conexión y porque Chrome corta las remotas
    a los 15 s, más o menos, y una frase de 200 caracteres "Más lento" se acerca a eso.
  - `decir(frase, voz, velocidad, eventos)`: `speechSynthesis.cancel()` y un
    `SpeechSynthesisUtterance` con `lang` y `voice`, `rate` 1 o `VELOCIDAD_LENTA` (0.6).
    La voz sintetizada no cambia de tono al ir más lento. `onstart` cuenta como que sonó;
    `onend`, que terminó; `onerror` (salvo `interrupted` y `canceled`, que son nuestros) y
    no recibir `onstart` en 3 s, que no logró sonar.
- **Audio propio**: `ContextoAudios` (`src/contextos/ContextoAudios.ts`) da un almacén por
  lección: id → promesa de una URL de objeto. `usePrecargarAudios(actividades)`, en el
  reproductor, pide todos los audios al abrir la lección (`fetch` → `Blob` →
  `URL.createObjectURL`), con las imágenes. Si una petición falla, sale del almacén: la
  pide otra vez el siguiente intento (punto 11) o el botón. Al salir de la lección, las URL
  se revocan.
  - Se reproduce en un `HTMLAudioElement` con `playbackRate` 1 o 0.6 y `preservesPitch =
    true` (es el valor por defecto en Chrome; se pone igual), así que no se oye más grave.
  - `play()` rechazada o el evento `error` cuentan como que no logró sonar; además, ese audio
    sale del almacén, para que el siguiente "Escuchar" lo traiga otra vez (un audio dañado
    en el camino, spec "La frase no logra sonar").
  - La vista previa del editor da su propio almacén, así que la actividad funciona igual
    dentro y fuera del reproductor.
- **"Detener"**: `speechSynthesis.cancel()` o `pause()` y volver al inicio.

## 10. Escuchar en el móvil

- **Voz**: `expo-speech` (paquete nuevo, incluido en Expo Go).
  `Speech.getAvailableVoicesAsync()`, filtrada por idioma como en la web; en Android puede
  venir vacía la primera vez, mientras arranca el motor, así que se pregunta otra vez a los
  500 ms antes de decidir "sin voz". Se prefiere la de `ETIQUETA_VOZ` y, entre iguales, la
  de calidad `Enhanced`. `Speech.speak(frase, { language, voice, rate, onStart, onDone,
  onStopped, onError, useApplicationAudioSession: true })`, con el mismo tiempo de 3 s para
  `onStart`.
- **Modo silencio**: la documentación de `expo-speech` dice que en el iPhone no suena en
  silencio. Con `useApplicationAudioSession: true`, la voz usa la sesión de audio de la app,
  y `setAudioModeAsync({ playsInSilentMode: true })` de `expo-audio` (al montar la
  actividad) la deja sonar. **Por confirmar en el teléfono** (como `expo-image` en F13): si
  no, se anota aquí y en la spec.
- **Audio propio**: `expo-audio` (paquete nuevo, incluido en Expo Go) reproduce un archivo
  local. `ContextoAudios` (móvil) descarga cada audio de la lección al abrirla con
  `File.createDownloadTask(url, new File(Paths.cache, "audios", "<id>.<ext>"), { headers:
  cabecerasSesion() }).downloadAsync()` de `expo-file-system`; si el archivo ya está (otra
  lección lo trajo), no lo pide otra vez, porque un audio nunca cambia. Un error borra lo
  que haya quedado a medias.
  - `createAudioPlayer({ uri })`, `setPlaybackRate(1 | 0.6, "high")` y `shouldCorrectPitch
    = true`; `playing` cuenta como que sonó, `didJustFinish` como que terminó y `error`
    como que no logró sonar (y borra el archivo, como la web saca el audio del almacén).
- **Segundo plano**: al pasar la app a segundo plano (`AppState`), la actividad detiene la
  voz, el audio y la grabación.
- **Descartada**: reproducir directo de la API con `{ uri, headers }` (`expo-audio` lo
  permite). No precarga al abrir la lección ni se puede oír sin conexión después de
  cargar, que es lo que pide la spec.

## 11. Cuándo se vuelve a pedir un audio

- Los mismos momentos que las imágenes: el `intento` del reproductor (web: al pasar de
  actividad; móvil: al volver la conexión), el mismo que da `ContextoImagenes`.
  `usePrecargarAudios` lo recibe como parámetro, porque lo llama el propio reproductor, y
  vuelve a pedir los que fallaron cuando cambia.
- Además, pulsar "Escuchar" o "Más lento" con el audio sin cargar lo pide en ese momento y,
  si llega, suena (spec, "Cargar el audio al cursar"). En la web es la única forma de
  reintentar el audio de la actividad en pantalla, porque no detecta "sin conexión".

## 12. Grabarse en la web

- `navigator.mediaDevices.getUserMedia({ audio: true })` y `MediaRecorder`, sin paquetes.
  El navegador pide el permiso la primera vez; Chrome recuerda un "No" y rechaza solo
  después, y entonces sale el aviso otra vez.
- Errores: `NotAllowedError` o `SecurityError` → "Brote no tiene permiso para usar el
  micrófono…"; `NotFoundError`, `OverconstrainedError` o no hay `mediaDevices` (una página
  sin HTTPS fuera de `localhost`) → "No se encontró un micrófono…".
- Se detiene con "Detener" o a los 30 s (`setTimeout`), y al detener se apagan las pistas
  del micrófono para que el navegador quite su indicador. Los trozos forman un `Blob` del
  tipo que dé el navegador (WebM con Opus en Chrome, MP4 en Safari) y se oye con un
  `HTMLAudioElement`. La URL se revoca al grabar otra vez y al desmontar la actividad.
- **Nunca sale del navegador**: no hay `fetch` con la grabación; el criterio lo comprueba
  en la pestaña Red.
- Si el micrófono se desconecta a mitad (`ended` en la pista), se detiene y se queda lo
  grabado.

## 13. Grabarse en el móvil

- `expo-audio`: `requestRecordingPermissionsAsync()` la primera vez que se pulsa
  "Grabarme"; devuelve `granted` y `canAskAgain`. Sin permiso y con `canAskAgain` en
  `false`, el aviso lleva "Abrir ajustes" (`Linking.openSettings()` de React Native). Al
  volver a la app (`AppState` `active`), `getRecordingPermissionsAsync()`: si ya hay
  permiso, el aviso se quita.
- `useAudioRecorder(RecordingPresets.HIGH_QUALITY)`, `prepareToRecordAsync()` y
  `record({ forDuration: 30 })`; el tiempo sale de `useAudioRecorderState`. Mientras graba,
  `setAudioModeAsync({ allowsRecording: true })`; al terminar, `false` otra vez, para que
  lo que suene después salga por el altavoz con su volumen normal.
- Una llamada o pasar a segundo plano detienen la grabación; `recorder.uri` sigue
  apuntando a lo grabado. El archivo vive en la caché de la app y se borra al grabar otra
  vez y al desmontar la actividad (`new File(uri).delete()`).
- **Config plugin** de `expo-audio` en `app.json`, con `microphonePermission`: "Brote usa
  el micrófono para que te grabes y te compares con la frase. La grabación no sale de tu
  teléfono.". En Expo Go se ve el texto de Expo Go; el nuestro, en una compilación propia.

## 14. Una cosa a la vez y "Comprobar"

- Cada cliente tiene dos hooks, `useFrase(actividad)` (la voz o el audio propio, con su
  estado: `cargando`, `lista`, `sonando` con su velocidad, `noCargo`, `sinVoz` y
  `noSono`) y `useGrabacion()` (`lista`, `pidiendoPermiso`, `grabando`, `conGrabacion`,
  `sinPermiso`, `sinMicrofono`, y el tiempo). El componente los coordina: empezar a sonar
  detiene la grabación que suena; empezar a grabar detiene la frase.
- `sePuedeComprobar` se vuelve `true` en cuanto `useFrase` dice que sonó, o que no se puede
  oír (`noCargo`, `sinVoz`, `noSono`), y ya no vuelve a `false`. La frase oculta se muestra
  en esos mismos casos de "no se puede oír", y al comprobar; una vez a la vista, ya no se
  vuelve a ocultar aunque el audio llegue después.
- Comprobar llama a `alInteractuar` (spec F03: comprobar sí cuenta para confirmar la
  salida); escuchar y grabarse no.

## 15. El editor: el audio dentro del borrador

- **Decisión**: lo de F13 ([research de F13](../F13-imagenes-propias/research.md), punto
  13) se generaliza a archivos. `ValorAudio` (`src/editor/audios.ts`, web): `{ clase:
  "audio", audio: Audio | null, subida, error, perdida }`, como `ValorImagen`.
- `src/editor/archivos.ts`, nuevo, recorre los dos: `recorrerArchivos`,
  `reemplazarArchivos`, `limpiarSubidas`, `haySubidas`, `pesoArchivos` y `hayArchivos`
  pasan aquí desde `editor/imagenes.ts` (ahí quedan solo las de imagen). Las acciones del
  reductor pasan a `archivoSubido` (con `{ imagen }` o `{ audio }`), `archivoNoSubido` y
  `marcarArchivosPerdidos` (por id: los de imagen y de audio no se repiten).
- `useEditorLeccion` gana `subirAudio(archivo)` (con `prepararAudio` y `subirAudio` de
  `servicios/audios.ts`) y `ContextoSubidas`, `{ subir, subirAudio }`. Lee
  `audios.<id>` de un `400` como `imagenes.<id>`.
- El peso de la lección y "Espera a que terminen de subir los archivos." cuentan los dos.

## 16. Datos de prueba: melodías, no voces

- **Decisión**: los audios de los cursos de prueba son melodías de notas, hechas en código:
  `scripts/audios-prueba.ts` (backend) arma un WAV PCM de 16 bits, mono, de 22 050 Hz, con
  notas senoidales y un ataque y caída cortos para que no truenen. "Escala que sube" (do, re,
  mi, fa, sol, 4 s), "escala que baja" (sol, fa, mi, re, do), "tres notas" (do, mi, sol) y
  "treinta segundos" (la escala, despacio, hasta 30.0 s).
- **Por qué melodías**: no se confunden con la voz del dispositivo, en una nota sostenida se
  oye fácil si "Más lento" la vuelve más grave, y no hay licencia de ninguna voz de por
  medio (la salida de `say` de macOS es para uso personal). Cambia lo que decía la spec en
  "Supuestos" (actualizada al planear).
- **MP3 y M4A**: no se pueden codificar en código sin un paquete grande, así que se guardan
  en git, ya hechos: `scripts/audios-prueba/escala-sube.mp3` y `escala-baja.m4a` (unos 30
  KB cada uno). Los hace `npm run audios:generar` a partir de los WAV del código, con
  `afconvert` (viene con macOS) para el M4A AAC y `lame` (Homebrew, solo para regenerarlos)
  para el MP3. Es la excepción a "nada binario en git" de F13 (research de F13, punto 15):
  dos archivos chicos y reproducibles.
- `datos-prueba.ts` usa `audioPrueba("escala-sube.mp3")`, como `imagenPrueba`; y
  `sembrar-cursos.ts` crea los audios del curso con `leerAudio` (limpios, con su duración),
  cambia las referencias y llena `leccion.audios`.
- **Para validar**, `npm run audios:validacion -- <carpeta>` deja los archivos para subir
  (quickstart.md, sección 1.2), con `afconvert` para el M4A sin pérdida.

## 17. Validar sin voz y sin micrófono

- **Sin voz en un idioma**: en el iPhone y en Chrome de la Mac hay voces de los nueve
  idiomas, así que "un dispositivo sin voz en coreano" no se puede probar tal cual. Solo en
  desarrollo, `VITE_SIN_VOCES=ko` (web, `import.meta.env.DEV`) y `EXPO_PUBLIC_SIN_VOCES=ko`
  (móvil, `__DEV__`) hacen que `vocesDelIdioma` no encuentre voces de esos idiomas
  (separados por comas). En una compilación de producción no existen.
- **Sin micrófono** (solo web): en la consola de Chrome, antes de pulsar "Grabarme",
  `navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("",
  "NotFoundError"))`. No hace falta código.
- **Audio dañado o que no llega**: el proxy de validación de F13 (`npm run
  proxy:validacion`) gana `/audios/*` en `bloquear` y `retrasar`, y un modo nuevo,
  `danar`, que responde `200` con bytes al azar del mismo largo.
- **Descartada**: monkeypatch de `speechSynthesis.getVoices` desde la consola: no sirve en el
  móvil, y con el interruptor las dos plataformas se validan igual.
