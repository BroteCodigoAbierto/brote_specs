# F14: Escuchar y repetir, con audio propio

**Estado**: Borrador
**Creada**: 2026-11-08
**Repos afectados**: backend | web | móvil
**Rama**: `feature/F14-escuchar-repetir` (en cada repo afectado)
**Descripción original**: "F14 escuchar-repetir: nueva actividad "Escuchar y repetir" (en
la paleta, grupo "Voz", icono Mic; hoy sale con "Próximamente"), con audio propio. Es el
último tipo del prototipo (listen_and_repeat: expected_text, lang?, audio?). Autor (editor
web): escribe la frase que el alumno debe repetir (obligatoria) y marca o desmarca
"Mostrar el texto desde el inicio" (marcada por defecto). Puede subir su propio audio de
la frase, opcional, de la misma forma que las imágenes de F13 (se sube al elegirlo; con
"Cambiar", "Quitar", el progreso y los mismos errores): MP3, M4A o WAV, de hasta 30 s y 5
MB. Sin audio propio, la frase se lee con la voz sintetizada del dispositivo. Idioma del
curso: los datos del curso (F05) agregan un campo "Idioma", con una lista fija: español,
inglés, francés, portugués, alemán, italiano, japonés, chino y coreano. Lleva la ayuda "El
idioma de la voz que lee las frases de escuchar y repetir.", y los cursos que ya existen
quedan en español. La voz sintetizada usa el idioma del curso. El detalle del curso (F02),
en la web y en el móvil, muestra "Idioma: {idioma}". El catálogo no se filtra por idioma.
Límites: el audio cuenta junto con las imágenes en los 25 MB por lección y los 200 MB por
curso de F13, y los textos de F13 pasan de "imágenes" a "archivos" ("Archivos del curso:
{x} de 200 MB", "Archivos de esta lección: {x} de 25 MB" y los mensajes de curso lleno y
lección pesada). El audio sigue las reglas de las imágenes: un borrador solo lo trae su
autor, un curso publicado cualquiera con sesión, y se borra con su lección o su curso, o
un día después si nada lo usa. Alumno (web y móvil): ve la consigna y, si el autor lo
eligió, el texto. "Escuchar" reproduce la frase y "Más lento" la reproduce a 0.6 de
velocidad, con voz sintetizada y con audio propio. Puede escucharla las veces que quiera,
y la frase no suena sola al abrir la actividad. Puede grabarse (opcional, hasta 30 s),
escuchar su grabación junto al modelo y volver a grabarse. La grabación no se guarda ni se
envía. El permiso del micrófono se pide al pulsar grabar por primera vez; si lo niega, ve
un aviso y sigue sin grabar. Al comprobar, siempre ve el texto y se autoevalúa con "Lo
dije bien" o "No me salió", como en el reto de código (F12): es obligatorio para continuar
y cuenta como pregunta en el progreso. Errores: si el audio propio no carga, se comporta
como una imagen rota de F13: "No se pudo cargar el audio" y reintenta al volver la
conexión; sin voz sintetizada de respaldo. Aun así puede comprobar y autoevaluarse. Si el
dispositivo no tiene voz para el idioma del curso, ve un aviso y también puede seguir.
Cursos de prueba: lecciones nuevas al final de "Actividades de prueba", con y sin audio
propio, con el texto a la vista y oculto, y un curso de prueba en inglés. Fuera de
alcance: reconocimiento de voz automático, grabar audio desde el editor, guardar la
grabación del alumno y filtrar el catálogo por idioma. El editor es solo de la web; en el
móvil solo se escucha y se graba."

## Objetivo

Que el alumno practique la pronunciación: escucha una frase, la dice en voz alta, se graba
si quiere para compararse con el modelo y se autoevalúa. Que el autor cree esta actividad
en el editor, con la voz del dispositivo o con su propio audio, y elija el idioma en que
esa voz lee las frases de su curso. Con esta feature, Brote tiene los 13 tipos de
actividad del prototipo y la paleta ya no tiene tipos con "Próximamente".

## Actor

- **Autor**: usuario con sesión iniciada que arma su curso en el editor (F05), solo en la
  web (decisión 0003). Escribe la frase, sube, cambia y quita su audio, y elige el idioma
  del curso.
- **Alumno**: usuario con sesión iniciada que ve el detalle de un curso (F02) y cursa sus
  lecciones (F03), en la web o en el móvil. Escucha la frase, puede grabarse y se
  autoevalúa.

## Precondiciones

- El catálogo (F02), el reproductor (F03), el progreso (F04), el editor (F05), la
  publicación (F06) y la forma de subir y traer archivos de F13 funcionan, y piden lo
  mismo que en esas features: sesión, curso publicado o curso propio, y llegar al
  servidor.
- Para subir o cambiar un audio, o cambiar el idioma, el curso es un borrador de quien lo
  cambia: no está en revisión ni publicado (F06).
- Para oír la frase sin audio propio, el dispositivo tiene una voz en el idioma del curso;
  para grabarse, un micrófono y el permiso para usarlo. Lo que pasa si no, está en "Casos
  de error".
- Los cursos de prueba tienen cargado lo que dice "Supuestos".

## Datos de entrada

Las longitudes cuentan caracteres. Un texto formado solo por espacios cuenta como vacío.
Los pesos se cuentan en MB de 1024 × 1024 bytes, como en F13.

### Lo que escribe el autor

| Dónde | Campo | Dato | Obligatorio | Límites |
|---|---|---|---|---|
| Escuchar y repetir | Frase | texto de una línea | sí | hasta 200 |
| | Mostrar el texto desde el inicio | casilla | sí | marcada por defecto |
| | Audio de la frase | un audio (ver abajo) | no | 1 |
| Datos del curso | Idioma | uno de: Español, Inglés, Francés, Portugués, Alemán, Italiano, Japonés, Chino o Coreano | sí | por defecto, Español |

### El audio que sube el autor

- **Archivo**: un audio de su computadora, MP3, M4A o WAV, de hasta 30 segundos y 5 MB.
  Brote no lo recorta, no lo comprime y no lo convierte: se oye como se subió. Al subirlo,
  le quita sus datos ocultos (título, artista, carátula, comentarios, el nombre de la nota
  de voz) y guarda solo el sonido, como hace con las fotos (F13).
- No lleva texto alternativo: la frase ya dice lo que se oye.

### Lo que hace el alumno

Nada de esto se guarda: solo la autoevaluación cuenta para el resultado de la lección
(F03, F04).

- **Grabación**: opcional, de hasta 30 segundos. Vive solo en su dispositivo mientras está
  en la actividad: no se guarda ni se envía.
- **Autoevaluación**: "Lo dije bien" o "No me salió", obligatoria para continuar.

### Límites del curso y de la lección

Los de F13, ahora para imágenes y audios juntos: los archivos de un curso pesan, entre
todos, hasta 200 MB, y los que usa una lección, hasta 25 MB. Un archivo que se usa en
varios lugares cuenta una vez.

## Flujo principal

### Idioma del curso (editor, web)

1. En el mapa del curso, en los datos del curso, después de la descripción, está "Idioma":
   una lista con Español, Inglés, Francés, Portugués, Alemán, Italiano, Japonés, Chino y
   Coreano, en ese orden, y la ayuda "El idioma de la voz que lee las frases de escuchar y
   repetir.".
2. Un curso nuevo empieza en Español: "Nuevo curso" no lo pide, como la portada (F13).
3. Cambiar el idioma habilita "Guardar cambios"; al guardar, "Cambios guardados" (F05).
4. En un curso que no se edita (en revisión o publicado, F06), el mapa muestra "Idioma:
   {idioma}" como texto.

### Idioma en el detalle del curso (web y móvil)

El detalle del curso (F02) muestra "Idioma: {idioma}" debajo de "Por {nombre del autor}".
El catálogo no cambia: sus tarjetas no muestran el idioma, la búsqueda no lo usa y no se
filtra por él.

### Crear la actividad (editor, web)

1. En la paleta, en el grupo "Voz", "Escuchar y repetir" (icono `Mic`) deja de decir
   "Próximamente" y se agrega como los demás tipos (F05).
2. Su formulario tiene, en este orden:
   1. **Frase**, con la ayuda "Lo que el alumno escucha y repite.".
   2. **Mostrar el texto desde el inicio**, una casilla marcada, con la ayuda "Si la
      desmarcas, el alumno ve el texto al comprobar.".
   3. **Audio de la frase**, un campo de audio opcional (ver "Subir un audio"), con la
      ayuda "Sin audio, la frase se lee con la voz del dispositivo, en {idioma}, el idioma
      del curso.".
3. El bloque de la secuencia muestra la frase, como los demás tipos muestran su texto
   (F05).
4. La vista previa y "Probar lección" muestran la actividad real (F05), con la voz del
   navegador del autor o con el audio subido. Ahí "Grabarme" funciona como para el alumno
   y tampoco guarda nada.

### Subir un audio (editor, web)

Funciona como el campo de imagen de F13:

1. Vacío, el campo muestra "Elegir audio" y la nota "MP3, M4A o WAV de hasta 30 segundos y
   5 MB.".
2. El autor pulsa "Elegir audio" y elige un archivo de su computadora.
3. El campo muestra "Subiendo audio…" con un indicador. Mientras, el autor puede seguir
   editando lo demás.
4. Al terminar, el campo muestra "Escuchar", para oírlo ahí mismo, su duración y su peso
   ("0:04 · 86 KB") y los botones "Cambiar" y "Quitar". La vista previa ya lo usa.
5. "Cambiar" elige otro archivo, que reemplaza al audio al terminar de subirse. Si no se
   puede subir, el anterior se queda.
6. "Quitar" deja el campo vacío, sin confirmación: la frase vuelve a leerse con la voz del
   dispositivo.
7. Elegir, cambiar y quitar el audio son cambios sin guardar, como cualquier otro: cuentan
   al pulsar "Guardar lección" (F05).

### Cuánto pesan los archivos (editor, web)

Los dos contadores de F13 cuentan imágenes y audios juntos, y sus textos cambian:

- En el lienzo, junto a "Guardar lección": "Archivos de esta lección: {x} de 25 MB" (antes
  "Imágenes de esta lección"). Una lección sin imágenes ni audios no lo muestra.
- En el mapa, en los datos del curso: "Archivos del curso: {x} de 200 MB" (antes
  "Imágenes del curso"). Un curso sin imágenes ni audios no lo muestra.
- {x} se calcula, se actualiza y cambia de color como en F13.

### Cursar la actividad (web y móvil)

1. El alumno ve la consigna "Escucha y repite." y, si el autor dejó marcada "Mostrar el
   texto desde el inicio", la frase, en letra grande. Si no, en su lugar ve "El texto
   aparece al comprobar.".
2. Debajo están "Escuchar" y "Más lento". La frase no suena sola al abrir la actividad.
3. "Escuchar" reproduce la frase a su velocidad y "Más lento", a 0.6 de su velocidad, sin
   que se oiga más grave. Con audio propio suena el audio; sin él, la voz del dispositivo
   la lee en el idioma del curso.
4. Mientras suena, el botón que la hizo sonar pasa a "Detener", que la detiene. Pulsar el
   otro la vuelve a empezar desde el principio, a su velocidad. Puede escucharla las veces
   que quiera, antes y después de comprobar.
5. Si quiere, se graba diciendo la frase (ver "Grabarse").
6. Pulsa "Comprobar". Está deshabilitado al abrir la actividad y se habilita en cuanto la
   frase empieza a sonar por primera vez, con "Escuchar" o con "Más lento". Si la frase no
   se puede oír (el audio no cargó, no hay voz en el idioma del curso o no logró sonar), se
   habilita desde ese momento. Grabarse no lo habilita.
7. Ve la frase (si estaba oculta, aparece en su lugar) y, debajo, "¿Lo dijiste bien?" con
   "Lo dije bien" y "No me salió", como en la pregunta abierta y el reto de código (F03,
   F12).
8. Elige uno. La barra inferior dice "¡Correcto!" o "A repasar", y el botón pasa a
   "Continuar".

### Grabarse (web y móvil)

1. Debajo de "Escuchar" y "Más lento" está "Grabarme". La primera vez que el alumno lo
   pulsa, el dispositivo le pide permiso para usar el micrófono; abrir la actividad no lo
   pide.
2. Con el permiso, empieza a grabar: se ve "Grabando…" con el tiempo ("0:05 de 0:30") y el
   botón pasa a "Detener". Mientras graba, "Escuchar" y "Más lento" se deshabilitan y, si
   la frase sonaba, se detiene.
3. La grabación termina al pulsar "Detener" o sola, a los 30 segundos.
4. Aparecen "Escuchar mi grabación", que pasa a "Detener" mientras suena, y "Volver a
   grabarme", que graba otra y reemplaza a la anterior. "Escuchar" y "Más lento" siguen
   ahí, para comparar.
5. Puede grabarse y escucharse las veces que quiera, antes y después de comprobar.
6. Al pasar a la siguiente actividad o salir de la lección, la grabación se descarta.

Escuchar la frase y grabarse no cuentan como haber hecho algo en la lección: si es la
primera actividad y todavía no comprueba, salir no pide confirmación (F03).

### Cargar el audio al cursar

Como las imágenes de F13 ("Cargar las imágenes al cursar"):

1. Al abrir una lección, Brote empieza a traer todos sus archivos, imágenes y audios, de
   todas sus actividades, sin esperarlos para mostrar la primera.
2. Mientras el audio carga, "Escuchar" y "Más lento" muestran un indicador y no se pueden
   pulsar.
3. Si no se puede cargar, en lugar del indicador se ve un icono de audio roto y "No se pudo
   cargar el audio". No se usa la voz del dispositivo en su lugar.
4. Se vuelve a pedir solo, como una imagen que no cargó: en el móvil, cuando vuelve la
   conexión; en la web, cada vez que el alumno pasa a otra actividad. Además, en los dos,
   "Escuchar" y "Más lento" siguen habilitados y pulsarlos lo vuelve a pedir: si llega,
   suena.
5. Aunque no cargue, el alumno puede grabarse, comprobar y autoevaluarse: "Comprobar" se
   habilita en cuanto el audio no carga.
6. Si el autor ocultó el texto, la frase aparece en su lugar en cuanto el audio no carga,
   para que el alumno pueda practicar leyéndola. Se queda a la vista aunque el audio llegue
   después.

### Sin voz en el idioma del curso

Si la actividad no tiene audio propio y el dispositivo no tiene una voz en el idioma del
curso, el alumno ve el aviso "Este dispositivo no tiene una voz en {idioma} para leer la
frase. Puedes instalar una en sus ajustes.", y "Escuchar" y "Más lento" se deshabilitan.
"Comprobar" está habilitado desde el inicio y, si el autor ocultó el texto, la frase se ve
desde el inicio. Puede grabarse, comprobar y autoevaluarse. Con audio propio, el aviso no
aparece aunque falte la voz.

## Validaciones

### Al cursar

- **Velocidad**: "Escuchar" suena a la velocidad normal y "Más lento", a 0.6, con la voz
  y con el audio propio. Más lento no cambia el tono: no se oye más grave.
- **Una cosa a la vez**: la frase y la grabación nunca suenan juntas; al empezar a sonar
  una, la otra se detiene. Mientras se graba no suena nada.
- **Todo se detiene** al pasar a otra actividad y al salir de la lección. En el móvil,
  también al pasar la app a segundo plano: si grababa, se queda lo grabado hasta ahí.
- **Modo silencio**: en el móvil, la frase y la grabación suenan aunque el teléfono esté en
  silencio, porque el alumno las pidió; con el volumen en cero no se oyen.
- **"Comprobar"**: deshabilitado hasta que la frase empieza a sonar por primera vez, o
  hasta que se sabe que no se puede oír: el audio no cargó, no hay voz en el idioma del
  curso o, al pulsar "Escuchar" o "Más lento", no logró sonar. Una vez habilitado, no se
  vuelve a deshabilitar.
- **Calificación**: escuchar y repetir cuenta como pregunta en el progreso (F04), igual
  que la pregunta abierta: se acierta si el alumno elige "Lo dije bien". Con ella, los
  tipos que son preguntas pasan de diez a once.
- **La frase** se muestra siempre como texto: algo como `<b>hola</b>` o `<script>` se ve
  tal cual y no se interpreta. Una frase larga se parte en varios renglones, sin cortarse.
- **Texto oculto**: mientras está oculto, la frase no está en la pantalla, tampoco para un
  lector de pantalla; aparece al comprobar o en cuanto se sabe que no se puede oír.
- **Lectores de pantalla**: los botones se llaman "Escuchar la frase", "Escuchar la frase
  más lento", "Detener", "Grabarme", "Detener la grabación", "Escuchar mi grabación" y
  "Volver a grabarme". Se anuncian "Grabando", "Grabación lista", "No se pudo cargar el
  audio" y los avisos. La frase se marca con el idioma del curso: un lector de pantalla la
  lee con su voz de ese idioma, si la tiene, y lo demás de la pantalla sigue en español.
- **Teclado** (web): Tab recorre los botones en orden, y Enter o la barra espaciadora los
  pulsan. Las teclas 1 a 9 no hacen nada. Al comprobar, el foco pasa a la autoevaluación y,
  al autoevaluarse, a "Continuar", como en el reto de código (F12).
- **Reducir movimiento, reducir transparencia y modo oscuro**: los botones, el indicador de
  "Grabando…" y los avisos se ven bien en los dos modos y con "reducir transparencia"; con
  "reducir movimiento", el indicador de "Grabando…" no se mueve.

### Al editar

- **Actividad completa**: como en F05. Le falta algo si la frase está vacía ("Este campo
  es obligatorio."). El audio es opcional.
- **Frase**: no deja escribir más de 200 caracteres ni saltos de línea. Se guarda sin
  espacios al inicio ni al final.
- **Mientras se sube un audio o una imagen**, "Guardar lección" y "Probar lección" se
  deshabilitan, con la nota "Espera a que terminen de subir los archivos." (antes, "…las
  imágenes.").
- **Al subir**:
  - Un archivo que no es MP3, M4A ni WAV (por ejemplo, un OGG, un FLAC o un video) muestra
    "Elige un audio MP3, M4A o WAV.".
  - Uno de más de 5 MB muestra "El audio puede pesar hasta 5 MB.", y uno de más de 30
    segundos, "El audio puede durar hasta 30 segundos.". Si pasa de los dos, se ve el del
    peso.
  - Un archivo que dice ser audio pero no se puede leer como tal (por ejemplo, un texto con
    la extensión `.mp3`), o que guarda el sonido de una forma que no se puede oír en todos
    los dispositivos, muestra "No se pudo leer el audio. Elige otro.".
  - Los errores van debajo del campo, y el audio que tenía el campo se queda.
- **Datos ocultos**: el audio se guarda sin ellos, solo con el sonido, que se oye igual que
  en el archivo original. Los 5 MB se cuentan en el archivo que elige el autor; para el
  espacio del curso y el peso de la lección cuenta el audio ya limpio, que es el que
  muestra el campo. El nombre del archivo no se guarda ni se muestra.
- **Espacio del curso**: como en F13, contando imágenes y audios. Si un audio no cabe en
  los 200 MB, no se sube y el campo muestra "Este curso ya tiene 200 MB de archivos. Quita
  alguno y guarda para hacer espacio.". Con una imagen, el mensaje es el mismo.
- **Peso de la lección**: como en F13, contando imágenes y audios. Al guardar o probar una
  lección cuyos archivos pasan de 25 MB aparece "Los archivos de esta lección pesan más de
  25 MB. Quita alguno.", y no se guarda ni se abre la prueba.
- **Repetidos**: subir dos veces el mismo archivo al mismo curso da el mismo audio, que
  cuenta una vez. Un audio se puede usar en varias actividades.
- **Quién sube, quién oye y cuándo se borra**: como las imágenes (F13). Solo el autor de un
  borrador sube audios a ese curso. Los de un borrador o de un curso en revisión solo los
  oye su autor; los de un curso publicado, cualquier usuario con sesión. Una actividad solo
  usa audios de su mismo curso. Un audio se borra al guardar una lección o al eliminarla,
  si dejó de usarse y nada más del curso lo usa; un día después de subirlo, si nada lo usa;
  y con su curso.
- **Idioma**: siempre uno de los nueve de la lista.
- **El servidor comprueba todo**, al subir y cada vez que se guarda una lección o los datos
  del curso: el formato real del archivo (no su nombre), su peso, su duración, que se pueda
  leer, el espacio del curso, el peso de la lección, quién sube, que cada audio usado
  exista y sea de ese curso, la frase, la casilla y el idioma. Si algo no cumple, rechaza
  el cambio y no guarda nada, como en F05.
- **Lo que no cambia**: las demás actividades y sus imágenes se guardan, se ven y se cursan
  igual que antes de esta feature. Los cursos que ya existen quedan en Español.

## Estados de la pantalla

### Escuchar y repetir al cursar (web y móvil)

Cargando, sin actividades, no disponible, error, sin conexión y confirmar salida no
cambian (F03). Dentro de la actividad:

- **Sin comprobar**: la consigna, la frase o "El texto aparece al comprobar.", "Escuchar",
  "Más lento", "Grabarme" y "Comprobar", deshabilitado hasta que la frase suena.
- **Cargando el audio**: "Escuchar" y "Más lento" con un indicador, sin poder pulsarse.
- **Sonando**: el botón que la hizo sonar dice "Detener".
- **El audio no cargó**: el icono de audio roto y "No se pudo cargar el audio", hasta que
  se vuelve a pedir y llega; la frase a la vista y "Comprobar" habilitado.
- **Sin voz en el idioma**: el aviso, "Escuchar" y "Más lento" deshabilitados, la frase a
  la vista y "Comprobar" habilitado.
- **No logró sonar**: "No se pudo reproducir la frase. Inténtalo de nuevo.", los botones
  habilitados para reintentar, la frase a la vista y "Comprobar" habilitado.
- **Grabando**: "Grabando…" con el tiempo y "Detener"; "Escuchar" y "Más lento"
  deshabilitados.
- **Con grabación**: "Escuchar mi grabación" y "Volver a grabarme".
- **Sin micrófono o sin permiso**: el aviso (ver "Casos de error"), y lo demás funciona.
- **Comprobada**: la frase, "¿Lo dijiste bien?", "Lo dije bien" y "No me salió".
- **Autoevaluada**: la barra con "¡Correcto!" o "A repasar" y "Continuar".

### Lienzo de la lección (web)

No cambia (F05, F11, F12, F13), salvo el formulario de escuchar y repetir y su campo de
audio:

- **Vacío**: "Elegir audio" y la nota de formatos.
- **Subiendo**: "Subiendo audio…" con un indicador; "Guardar lección" y "Probar lección"
  deshabilitados, con la nota.
- **Con audio**: "Escuchar" (o "Detener" mientras suena), su duración y su peso, "Cambiar"
  y "Quitar".
- **Error al subir**: el mensaje debajo del campo y el audio que tenía, o el campo vacío.
- **Audio que ya no está**: "Este audio ya no está. Elige otro." (ver "Casos de error").
- **Peso de la lección**: "Archivos de esta lección: {x} de 25 MB" junto a "Guardar
  lección", en el color de error si pasa de 25 MB, y el aviso al guardar o probar.

### Mapa del curso (web)

No cambia (F05, F06, F13), salvo los datos del curso: "Idioma" con su lista (o como texto,
en un curso que no se edita) y "Archivos del curso: {x} de 200 MB" en lugar de "Imágenes
del curso".

### Detalle del curso (web y móvil)

No cambia (F02, F04, F13), salvo "Idioma: {idioma}" debajo de "Por {nombre del autor}".

## Resultado esperado

- El autor tiene en su borrador actividades de escuchar y repetir, con o sin audio propio,
  con el texto a la vista u oculto, y el idioma de su curso, que siguen ahí al recargar y al
  volver a entrar.
- Cuando el curso se publica, el alumno ve el idioma en su detalle y cursa esas
  actividades en la web y en el móvil, como en la vista previa: oye la frase con el audio
  o con la voz del idioma del curso, se graba si quiere y se autoevalúa. Cada una suma su
  pregunta (F04).
- Ninguna grabación sale del dispositivo del alumno.
- Un curso nunca pasa de 200 MB de archivos y una lección, de 25 MB, contando imágenes y
  audios; los audios que nadie usa ya no ocupan espacio.
- Los cursos de prueba tienen lo que dice "Supuestos".

## Casos de error

- **No se pudo subir** (el servidor no responde o falla): "No se pudo subir el audio.
  Inténtalo de nuevo." debajo del campo. El audio que tenía se queda y lo demás sigue como
  estaba.
- **La sesión expiró al subir**: como con una imagen (F13): se llega a "Entrar" con "Tu
  sesión terminó. Vuelve a entrar." y, al entrar con la misma cuenta, se regresa a la
  pantalla con lo que estaba sin guardar; el audio que no se subió hay que elegirlo otra
  vez.
- **El curso se envió a revisión, se publicó o se eliminó** en otra pestaña mientras el
  autor sube un audio o cambia el idioma: el mensaje de F05 y F06 para ese caso. Lo
  capturado sigue en pantalla.
- **Un audio ya no está al guardar** (se quitó y se guardó en otra pestaña, o pasó más de
  un día sin guardarlo): el servidor rechaza la lección con "Revisa los datos marcados.",
  la actividad queda seleccionada (F05) y el campo muestra "Este audio ya no está. Elige
  otro.".
- **El audio no carga al cursar**: ver "Cargar el audio al cursar". En el móvil, una
  lección abierta se termina sin conexión como en F03.
- **Sin voz en el idioma del curso**: ver "Sin voz en el idioma del curso".
- **La frase no logra sonar** (la voz necesita internet y no lo hay, el navegador no puede
  reproducir el audio o la voz falla): al pulsar "Escuchar" o "Más lento", el botón vuelve
  a su estado y se ve "No se pudo reproducir la frase. Inténtalo de nuevo.". Cuenta como
  que la frase no se puede oír: "Comprobar" se habilita y, si el autor ocultó el texto, la
  frase aparece. Los botones siguen habilitados para reintentar; si después suena, el aviso
  desaparece. Si falla a mitad, deja de sonar igual, con el mismo aviso.
- **El alumno niega el permiso del micrófono**: ve el aviso "Brote no tiene permiso para
  usar el micrófono. Puedes seguir sin grabarte." y, en una línea aparte, "Para grabarte,
  permite el micrófono en los ajustes del navegador." (web) o "…en los ajustes del
  teléfono." (móvil). En el móvil, el aviso lleva además "Abrir ajustes", que abre la página
  de Brote en los ajustes del teléfono; al volver con el permiso dado, el aviso desaparece
  y "Grabarme" graba. Al pulsar "Grabarme" otra vez, el dispositivo vuelve a pedir el
  permiso si lo permite; si no, se ve el mismo aviso. Escuchar, comprobar y autoevaluarse
  funcionan igual.
- **No hay micrófono**: "No se encontró un micrófono. Puedes seguir sin grabarte.", y lo
  demás funciona igual.
- **La grabación se interrumpe** (entra una llamada, se desconecta el micrófono o la app
  pasa a segundo plano): se detiene y queda lo grabado hasta ese momento.
- **"Probar lección" sin servidor**: funciona como en F05; un audio que no se cargó muestra
  "No se pudo cargar el audio".
- **Salir con un audio subiéndose**: cuenta como cambios sin guardar y pide confirmación
  (F05). Si sale, el audio no se guarda.

## Fuera de alcance

- Reconocimiento de voz: Brote no escucha la grabación ni califica la pronunciación; el
  alumno se autoevalúa.
- Grabar el audio de la frase desde el editor: el autor sube un archivo.
- Guardar, enviar o descargar la grabación del alumno.
- Filtrar o buscar el catálogo por idioma, y mostrar el idioma en las tarjetas.
- Un idioma distinto en cada actividad (el prototipo tenía `lang` por actividad), elegir
  la voz (de mujer, de hombre o de un país) y otras velocidades además de "Más lento".
- Idiomas fuera de la lista de nueve.
- Recortar, editar o comprimir audios en Brote, y otros formatos (OGG, FLAC, AAC suelto,
  video).
- Audio en otras actividades (en la teoría, en las opciones o en las tarjetas).
- Traducir la interfaz de Brote al idioma del curso.
- Descargar los audios para cursar sin conexión (F10), e importar y exportar cursos con
  audio e idioma (F07).
- Sonidos al responder y al terminar (F15).
- El editor en el móvil (decisión 0003): en el móvil solo se escucha y se graba.

## Criterios de aceptación

<!--
  Datos de prueba: "Actividades de prueba" e "Inglés para viajar" publicados para cursar,
  "Japonés sencillo" con sus dos escuchar y repetir, y los archivos para subir que dice el
  quickstart.md del plan. Cómo prepararlos lo dice el quickstart.md.
-->

### Cursos de prueba

- [ ] [backend] "Actividades de prueba" tiene al final las lecciones "Escuchar con la voz",
  "Escuchar con audio propio", "Escuchar al límite" y "Escuchar con etiquetas", en ese
  orden, sin que cambien de lugar sus 18 lecciones anteriores.
- [ ] [web, móvil] "Japonés sencillo" está en japonés y recupera sus dos escuchar y repetir
  del prototipo en su lugar: la última actividad de "Hiragana: las vocales" (`あいうえお`)
  y la tercera de "Saludos" (`こんにちは、元気ですか？`).
- [ ] [backend] Existe "Inglés para viajar", del autor de los cursos de prueba, en inglés y
  sin publicar, con sus lecciones de escuchar y repetir.
- [ ] [web, móvil] Los demás cursos de prueba están en español, y sus actividades se ven y
  se cursan igual que antes de esta feature.

### Idioma del curso

- [ ] [web] En el mapa de un borrador, "Idioma" muestra "Español", con las nueve opciones
  en orden, después de la descripción, y la ayuda "El idioma de la voz que lee las frases
  de escuchar y repetir.".
- [ ] [web] Al elegir "Inglés", "Guardar cambios" se habilita; al guardar aparece "Cambios
  guardados" y, al recargar, sigue en "Inglés".
- [ ] [web] Un curso recién creado con "Nuevo curso" está en Español.
- [ ] [web] El mapa de un curso en revisión muestra "Idioma: {idioma}" como texto, sin la
  lista.
- [ ] [web, móvil] El detalle de "Japonés sencillo" muestra "Idioma: Japonés" debajo de
  "Por {nombre del autor}", y el de "Git esencial", "Idioma: Español".
- [ ] [web, móvil] Las tarjetas del catálogo no muestran el idioma, y el catálogo y la
  búsqueda muestran los mismos cursos que antes de esta feature.
- [ ] [backend] El servidor rechaza guardar los datos de un curso con un idioma que no es
  de la lista, y un curso creado antes de esta feature está en Español.

### Crear la actividad (editor)

- [ ] [web] En la paleta, en "Voz", "Escuchar y repetir" ya no dice "Próximamente", se
  agrega al pulsarlo o arrastrarlo, y ningún tipo de la paleta dice "Próximamente".
- [ ] [web] Su formulario tiene "Frase", la casilla "Mostrar el texto desde el inicio"
  marcada y "Audio de la frase", en ese orden, con sus ayudas.
- [ ] [web] En un curso en Inglés, la ayuda del audio dice "Sin audio, la frase se lee con
  la voz del dispositivo, en inglés, el idioma del curso.".
- [ ] [web] Con la frase vacía, la actividad lleva "Incompleta" y, al guardar, la frase
  muestra "Este campo es obligatorio.".
- [ ] [web] La frase no deja escribir más de 200 caracteres ni saltos de línea, y se guarda
  sin los espacios del inicio y del final.
- [ ] [web] El bloque de la secuencia muestra la frase.
- [ ] [web] Al desmarcar la casilla, la vista previa muestra "El texto aparece al
  comprobar." en lugar de la frase.
- [ ] [web] Después de guardar, al recargar la página, la frase, la casilla y el audio
  siguen como se guardaron.

### Subir un audio (editor)

- [ ] [web] El campo vacío muestra "Elegir audio" y "MP3, M4A o WAV de hasta 30 segundos
  y 5 MB.".
- [ ] [web] Al elegir el MP3 de 4 segundos, el campo muestra "Subiendo audio…" y luego
  "Escuchar", "0:04" con su peso, "Cambiar" y "Quitar". "Escuchar" lo reproduce.
- [ ] [web] El M4A de una nota de voz del teléfono y el WAV también se suben y se oyen.
- [ ] [web] El audio de 31 segundos muestra "El audio puede durar hasta 30 segundos." y el
  de 6 MB, "El audio puede pesar hasta 5 MB.". El campo se queda como estaba.
- [ ] [web] El OGG y el FLAC muestran "Elige un audio MP3, M4A o WAV.", y el texto con
  extensión `.mp3`, "No se pudo leer el audio. Elige otro.".
- [ ] [web] El MP3 con título, artista y carátula se sube, se oye igual y el campo muestra
  un peso menor que el del archivo; al descargarlo de Brote, ya no trae esos datos.
- [ ] [web] Con un audio en el campo, "Cambiar" y elegir el de 31 segundos muestra su error
  y deja el anterior; "Cambiar" con otro válido lo reemplaza.
- [ ] [web] "Quitar" deja el campo vacío, sin confirmación, aparece "Cambios sin guardar" y
  la vista previa lee la frase con la voz del navegador.
- [ ] [web] Mientras se sube un audio, "Guardar lección" y "Probar lección" están
  deshabilitados con "Espera a que terminen de subir los archivos.", y se puede seguir
  escribiendo en otro campo.
- [ ] [web] Con el servidor apagado, subir un audio muestra "No se pudo subir el audio.
  Inténtalo de nuevo." y lo demás sigue en pantalla.
- [ ] [web] Con la sesión expirada, subir un audio lleva a "Entrar" con "Tu sesión terminó.
  Vuelve a entrar."; al entrar, la lección vuelve con sus cambios sin guardar y el campo de
  audio como estaba antes.

### Escuchar (cursar)

- [ ] [web, móvil] En "Escuchar con la voz", la primera actividad muestra "Escucha y
  repite.", la frase en letra grande, "Escuchar", "Más lento" y "Grabarme", y no suena
  nada al abrirla.
- [ ] [web, móvil] "Escuchar" lee la frase con una voz en español; "Más lento" la lee más
  despacio, sin que se oiga más grave.
- [ ] [web, móvil] Mientras suena, el botón pulsado dice "Detener" y la detiene. Pulsar el
  otro mientras suena la empieza de nuevo a su velocidad.
- [ ] [web, móvil] La segunda actividad, con el texto oculto, muestra "El texto aparece al
  comprobar." y no la frase.
- [ ] [web, móvil] En "Escuchar con audio propio", "Escuchar" reproduce el audio subido, no
  la voz del dispositivo, y "Más lento" lo reproduce más despacio, sin que se oiga más
  grave.
- [ ] [web, móvil] En "Inglés para viajar", la frase se lee con una voz en inglés, y en
  "Japonés sencillo", con una voz en japonés.
- [ ] [web, móvil] Después de comprobar, "Escuchar" y "Más lento" siguen funcionando.
- [ ] [móvil] Con el teléfono en silencio y el volumen arriba, "Escuchar" se oye.
- [ ] [móvil] Al pasar la app a segundo plano mientras suena la frase, deja de sonar.

### Comprobar y autoevaluarse

- [ ] [web, móvil] Al abrir la actividad, "Comprobar" está deshabilitado; grabarse no lo
  habilita, y se habilita en cuanto la frase empieza a sonar con "Escuchar" o con "Más
  lento". Al detenerla, sigue habilitado.
- [ ] [web, móvil] Al comprobar la actividad con el texto oculto, la frase aparece en su
  lugar y, debajo, "¿Lo dijiste bien?" con "Lo dije bien" y "No me salió".
- [ ] [web, móvil] Hasta autoevaluarse no aparece "Continuar".
- [ ] [web, móvil] "Lo dije bien" muestra "¡Correcto!" y "No me salió", "A repasar".
- [ ] [web, móvil] En "Escuchar con la voz", eligiendo "Lo dije bien" en una actividad y
  "No me salió" en la otra, al terminar se ve "Acertaste 1 de 2".
- [ ] [web, móvil] "Hiragana: las vocales" cuenta 3 preguntas y "Saludos", 4.

### Grabarse

- [ ] [web, móvil] La primera vez que pulso "Grabarme", el dispositivo pide permiso para el
  micrófono; abrir la actividad no lo pide.
- [ ] [web, móvil] Con el permiso, se ve "Grabando…" con el tiempo que avanza, "Detener", y
  "Escuchar" y "Más lento" deshabilitados. "Detener" termina la grabación.
- [ ] [web, móvil] Si no detengo la grabación, termina sola al llegar a "0:30 de 0:30".
- [ ] [web, móvil] "Escuchar mi grabación" reproduce lo que dije, y "Escuchar" sigue
  reproduciendo el modelo; al empezar uno, el otro se detiene.
- [ ] [web, móvil] "Volver a grabarme" reemplaza la grabación anterior.
- [ ] [web, móvil] Al pasar a la siguiente actividad y repetir la lección, la actividad ya
  no tiene grabación.
- [ ] [web] Con las herramientas del navegador abiertas, grabarse y escucharse no envían
  nada al servidor.
- [ ] [web, móvil] Si niego el permiso, veo "Brote no tiene permiso para usar el micrófono.
  Puedes seguir sin grabarte." con dónde permitirlo, y puedo escuchar, comprobar y
  autoevaluarme.
- [ ] [móvil] Con el permiso negado sin que el sistema lo vuelva a pedir, el aviso lleva
  "Abrir ajustes", que abre los ajustes de Brote en el teléfono. Al dar el permiso y volver,
  el aviso ya no está y "Grabarme" graba.
- [ ] [web] En una computadora sin micrófono, "Grabarme" muestra "No se encontró un
  micrófono. Puedes seguir sin grabarte.".
- [ ] [móvil] Al pasar la app a segundo plano mientras grabo, la grabación se detiene y,
  al volver, "Escuchar mi grabación" reproduce lo grabado hasta ese momento.
- [ ] [web, móvil] Si la primera actividad es escuchar y repetir y solo la escucho y me
  grabo, salir no pide confirmación.

### Errores al cursar

- [ ] [web, móvil] Si el audio propio no cargó, se ve el icono de audio roto y "No se pudo
  cargar el audio", no suena la voz del dispositivo, "Comprobar" está habilitado sin haber
  escuchado, y puedo grabarme, comprobar y autoevaluarme.
- [ ] [web, móvil] Si no cargó el audio de la actividad con el texto oculto de "Escuchar con
  audio propio", la frase se ve en lugar de "El texto aparece al comprobar." y sigue a la
  vista cuando el audio llega.
- [ ] [móvil] Si el audio no cargó porque se cayó la conexión, al volver la conexión carga
  solo y "Escuchar" lo reproduce.
- [ ] [web] Si el audio no cargó y el servidor vuelve a responder, pulsar "Escuchar" lo
  vuelve a pedir y suena.
- [ ] [web, móvil] En un dispositivo sin voz en coreano, una actividad sin audio de un
  curso en Coreano muestra "Este dispositivo no tiene una voz en coreano para leer la
  frase. Puedes instalar una en sus ajustes.", con "Escuchar" y "Más lento"
  deshabilitados, "Comprobar" habilitado y la frase a la vista aunque el autor la haya
  ocultado, y puedo comprobar y autoevaluarme. Una con audio propio del mismo curso no
  muestra el aviso.

- [ ] [web, móvil] Si el audio propio llega dañado, al pulsar "Escuchar" en la actividad con
  el texto oculto de "Escuchar con audio propio" se ve "No se pudo reproducir la frase.
  Inténtalo de nuevo.", "Comprobar" se habilita y la frase aparece. Cuando el audio vuelve
  a llegar bien, "Escuchar" lo reproduce y el aviso desaparece.

### Accesibilidad y teclado

- [ ] [web, móvil] Con lector de pantalla, los botones se anuncian como "Escuchar la
  frase", "Escuchar la frase más lento", "Grabarme", "Detener la grabación", "Escuchar mi
  grabación" y "Volver a grabarme", y se anuncian "Grabando" y "Grabación lista".
- [ ] [web, móvil] Con lector de pantalla, la frase oculta no se lee antes de comprobar.
- [ ] [web, móvil] Con lector de pantalla, en "Japonés sencillo" la frase `あいうえお` se lee
  con la voz japonesa del lector, y la consigna y los botones, en español.
- [ ] [web] Con Tab se llega a cada botón, con foco visible, y Enter o la barra espaciadora
  lo pulsan. Al comprobar, el foco pasa a "Lo dije bien" y, al autoevaluarme, a
  "Continuar".
- [ ] [web, móvil] La actividad se ve bien en modo oscuro y con "reducir transparencia", y
  con "reducir movimiento" el indicador de "Grabando…" no se mueve.

### Límites del curso y servidor

- [ ] [web] En el lienzo, al elegir un audio en una lección sin otros archivos aparece
  "Archivos de esta lección: {x} de 25 MB" con su peso, y desaparece al quitarlo.
- [ ] [web] Una lección con imágenes muestra "Archivos de esta lección", no "Imágenes de
  esta lección", y el mapa de un curso con imágenes o audios, "Archivos del curso: {x} de
  200 MB".
- [ ] [web] En el curso casi lleno, subir un audio que no cabe muestra "Este curso ya tiene
  200 MB de archivos. Quita alguno y guarda para hacer espacio.", y subir una imagen que no
  cabe, lo mismo.
- [ ] [web] En una lección con cuatro GIF de 5 MB y dos audios de 5 MB, "Guardar lección" y
  "Probar lección" muestran "Los archivos de esta lección pesan más de 25 MB. Quita
  alguno." y no guardan ni abren la prueba. Al quitar los dos audios, se guarda.
- [ ] [web] Si quito un audio y guardo en una pestaña, y en otra pestaña con la versión
  anterior elijo "Reemplazar", aparece "Revisa los datos marcados." y el campo muestra
  "Este audio ya no está. Elige otro.".
- [ ] [backend] Un audio que se sube y no se guarda en ninguna parte se borra un día
  después de subirlo; al eliminar una lección se borran sus audios que no se usan en otra
  parte del curso, y al eliminar el curso, todos.
- [ ] [backend] Subir dos veces el mismo archivo al mismo curso da el mismo audio, que
  cuenta una vez.
- [ ] [backend] Un audio subido sin pasar por el editor, con título, artista y carátula, se
  guarda sin ellos.
- [ ] [backend] El servidor rechaza subir un audio sin sesión, a un curso ajeno, en
  revisión o publicado, un archivo que no es audio aunque se llame `.mp3`, uno de más de 30
  segundos y uno de más de 5 MB.
- [ ] [backend] El servidor rechaza guardar una lección con un audio de otro curso, un
  audio que no existe, una frase vacía, con un salto de línea o de más de 200 caracteres.
  No guarda nada.
- [ ] [backend] Los audios de un borrador solo los trae su autor; los de un curso
  publicado, cualquier usuario con sesión, y sin sesión, nadie.

### Contenido

- [ ] [web, móvil] En "Escuchar con etiquetas", la frase con `<b>hola</b>` y `<script>`
  se ve tal cual, sin interpretarse.
- [ ] [web, móvil] En "Escuchar al límite", la frase de 200 caracteres se ve completa en un
  teléfono de 360 px, partida en renglones, y el audio de 30 segundos suena completo, a
  las dos velocidades.
- [ ] [web] La vista previa del editor muestra la actividad igual que el reproductor, y
  "Probar lección" recorre "Escuchar con audio propio" como un alumno.

## Datos que toca

- **Audio** (nuevo): archivo de audio de un curso, como **Imagen** (F13). Importan su
  curso, su formato (MP3, M4A o WAV), su duración, su peso y cuándo se subió. Subir dos
  veces el mismo archivo al mismo curso da el mismo audio. Se ve, se usa y se borra con las
  mismas reglas que una imagen. Se guarda sin sus datos ocultos ni el nombre del archivo.
- **Curso** (F02, F05, F06, F13): gana su idioma, obligatorio, uno de nueve, por defecto
  Español. Los cursos que ya existen quedan en Español. Sus archivos, imágenes y audios
  juntos, pesan hasta 200 MB.
- **Actividad** (F03, F05, F11, F12, F13): nuevo tipo, escuchar y repetir, con su frase
  (texto de una línea, obligatoria, de hasta 200), si el texto se muestra desde el inicio
  (sí o no; por defecto, sí) y un audio opcional del mismo curso. Es una pregunta: los
  tipos que califican pasan a ser once.
- **Leccion** (F02, F05, F13): no cambia; al guardarla, los archivos que usa, imágenes y
  audios, pesan hasta 25 MB entre todos, y los que dejó de usar se borran si nada más los
  usa.
- **Progreso** (F04): no cambia.

## Supuestos

- La consigna es fija, "Escucha y repite.": la descripción no le da al autor un campo para
  escribirla, y la frase ya dice qué hay que decir.
- La frase es de una línea y de hasta 200 caracteres: cabe de sobra en 30 segundos, aun
  "Más lento", y el prototipo solo tenía frases cortas.
- El idioma es del curso, no de cada actividad, como lo decidió el usuario: el `lang` de
  cada actividad del prototipo no pasa a Brote.
- Si el dispositivo tiene voces de varios países para un idioma, se prefiere la de México
  para el español, la de Estados Unidos para el inglés, la de Brasil para el portugués y
  el mandarín de China continental para el chino; si no tiene esa, cualquiera del idioma.
- El idioma va en los datos del curso del mapa y no en "Nuevo curso", como la portada
  (F13): un curso nuevo empieza en Español y se cambia después.
- La lista de idiomas se ve con la primera letra en mayúscula ("Japonés"); dentro de una
  frase, en minúsculas ("en japonés").
- "Lo dije bien" y "No me salió" siguen el patrón de "La tuve bien" y "No la tuve" de la
  pregunta abierta y el reto de código, con la pregunta "¿Lo dijiste bien?".
- Escuchar y grabarse no cuentan como haber hecho algo en la lección, como abrir una imagen
  o pausar un GIF en F13: nada de eso se pierde al salir.
- Mientras se graba, el modelo no suena, para que no quede en la grabación.
- En la web, pulsar "Escuchar" vuelve a pedir un audio que no cargó porque la web no
  detecta "sin conexión" aparte (igual que en F01 a F06 y F11 a F13), y esperar a pasar de
  actividad, como con las imágenes, no serviría en la actividad que lo necesita.
- La frase y la grabación suenan con el teléfono en silencio porque el alumno las pide al
  pulsar un botón, como un video.
- Los datos ocultos los quita Brote al recibir el audio, no la web antes de subirlo (como
  con las fotos de F13): la web no puede limpiar un audio sin volver a comprimirlo. Por eso
  un audio subido sin el editor también se guarda limpio, en vez de rechazarse.
- Brote solo acepta audios que se pueden oír en la web y en el móvil: un M4A o un WAV que
  guarda el sonido de otra forma (por ejemplo, un M4A sin pérdida) se rechaza con "No se
  pudo leer el audio. Elige otro.". El plan dice qué formas se aceptan.
- Los textos de F13 que hablan de "imágenes" para los dos límites pasan a "archivos", como
  lo pidió el usuario, y con ellos la nota "Espera a que terminen de subir los archivos.",
  que también aplica a un audio subiéndose. Los demás mensajes de las imágenes no cambian.
- Para validar los criterios, los cursos de prueba cambian así, solo mientras se valida
  (como en F03, F11, F12 y F13):
  - **"Actividades de prueba"** (en Español) gana al final estas lecciones:
    - **Escuchar con la voz**: dos actividades sin audio propio, una con el texto a la
      vista y otra con el texto oculto.
    - **Escuchar con audio propio**: una con un MP3 y el texto a la vista, una con un M4A
      y el texto oculto, y una con un WAV.
    - **Escuchar al límite**: una frase de 200 caracteres y un audio de 30 segundos.
    - **Escuchar con etiquetas**: una frase con `<b>hola</b>` y `<script>`.
  - **"Japonés sencillo"** pasa a Japonés, para que su voz lea el hiragana, y recupera sus
    dos escuchar y repetir del prototipo, en su lugar, como F11 y F12 recuperaron las de
    sus tipos: la cuarta de "Hiragana: las vocales" y la tercera de "Saludos".
  - **"Inglés para viajar"** (nuevo, en Inglés, sin publicar como "Actividades de prueba"
    para no cambiar el catálogo que citan F02 y F04): una lección con frases de viaje, con
    la voz y el texto a la vista, con la voz y el texto oculto, y con un audio propio.
  Las lecciones nuevas van al final para no mover las posiciones que citan F03, F05 y F11 a
  F13. Los audios de prueba son melodías de notas hechas para las pruebas, con frases que
  las nombran ("Do, re, mi, fa, sol"), no una voz grabada: no se confunden con la voz del
  dispositivo, en una nota se oye fácil que "Más lento" no la vuelve más grave, y no
  dependen de la licencia de ninguna voz (se cambió al planear). Para validar un
  dispositivo sin voz en coreano, el quickstart esconde esas voces solo en desarrollo. El
  quickstart trae además los archivos para subir: el MP3 de 4
  segundos, el M4A de una nota de voz, el WAV, el audio de 31 segundos, el de 6 MB, el OGG,
  el FLAC, el texto con extensión `.mp3`, el MP3 con título, artista y carátula, lo que
  llena un curso casi hasta los 200 MB y la lección pesada.
- Cargar las dos actividades de "Japonés sencillo" cambia datos que citan criterios ya
  validados de F03, F04 y F11, que no se reescriben porque registran lo que se validó
  entonces. Si hay que repetirlos: "Hiragana: las vocales" tiene 3 preguntas en lugar de 2
  y "Saludos", 4 en lugar de 3.
- Los demás cursos del prototipo no traían escuchar y repetir y quedan en Español.
- Cómo se ven los botones de escuchar y de grabar, el indicador de "Grabando…", el campo de
  audio, el icono de audio roto y los avisos se escribe primero en `docs/diseno.md`.
- La web, el móvil y el servidor cambian juntos: todavía no hay versiones publicadas del
  móvil que deban seguir funcionando.
- Al cerrar la feature se actualizan `specs/02-modelo-datos.md` (la entidad Audio, el
  idioma del curso, el tipo escuchar y repetir, los once tipos que califican y el peso de
  los archivos de la lección, y se quitan de "Entidades previstas" el tipo y el idioma, que
  ahí se esperaba con F07) y `specs/00-proyecto.md`, si cambia algo del catálogo de
  actividades.

## Aclaraciones

### Sesión 2026-11-08

Decididas con el usuario antes de la spec (ver "Descripción original"): la frase, la
casilla del texto y el audio propio opcional; el idioma del curso, con sus nueve
opciones; los límites de archivos compartidos con las imágenes; escuchar, más lento y
grabarse; la autoevaluación; y qué pasa si el audio no carga o falta la voz.

Decididas al escribir la spec:

- P: ¿Qué hace Brote con los datos ocultos del audio (título, artista, carátula,
  comentarios)? → R: Los quita al subirlo y guarda solo el sonido, como con las fotos de
  F13.
- P: ¿Cuándo se habilita "Comprobar"? → R: En cuanto la frase empieza a sonar por primera
  vez; si no se puede oír (el audio no cargó o no hay voz en el idioma), desde ese momento.
- P: Si el autor ocultó el texto y la frase no se puede oír, ¿el alumno lo ve? → R: Sí: la
  frase aparece en cuanto se sabe que no se puede oír, y se queda a la vista aunque el
  audio llegue después.

Decididas con `/speckit-clarify`:

- P: Si al pulsar "Escuchar" la frase no logra sonar (la voz necesita internet o el
  navegador no puede reproducir el audio), ¿qué pasa? → R: Cuenta como que no se puede
  oír: aviso "No se pudo reproducir la frase. Inténtalo de nuevo.", "Comprobar" habilitado
  y la frase a la vista; los botones siguen para reintentar.
- P: ¿La frase se marca con el idioma del curso para que un lector de pantalla la lea en
  ese idioma? → R: Sí. La frase de la actividad se marca con el idioma del curso; lo demás
  de la pantalla sigue en español.
- P: En el móvil, cuando el sistema ya no vuelve a pedir el permiso del micrófono, ¿el
  aviso lleva un botón a los ajustes? → R: Sí, "Abrir ajustes", que abre la página de
  Brote en los ajustes del teléfono. En la web solo va el texto.
