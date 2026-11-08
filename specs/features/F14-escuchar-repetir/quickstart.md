# Guía de validación: F14 Escuchar y repetir, con audio propio

Cómo levantar los repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). La feature está terminada cuando todos están marcados (principio
VIII). Lo que acepta y rechaza el servidor está en [contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: los de F13 (Node 24, PostgreSQL en el contenedor, Chrome, una Mac y Expo Go para
el SDK 58 en el iPhone), con sonido y micrófono en la Mac y en el iPhone. Cada repo en su
rama `feature/F14-escuchar-repetir`, que sale de `feature/F13-imagenes-propias` mientras
F11, F12 y F13 no estén en `dev` (plan.md, "Resumen").

```bash
# brote_specs: copiar el contrato 0.11.0 y comprobar las copias
npm run contrato:copiar && npm run contrato:revisar

# brote_backend_express
npm install
npx prisma migrate deploy && npm run bd:generar
# antes de sembrar: B0 (sección 2)
npm run bd:sembrar         # borra el progreso de las cuentas @brote.test
npm run dev                # API en http://localhost:3000
npm run proxy:validacion   # proxy en :3001 hacia :3000 (sección 1.4)

# brote_web_react, contra el proxy
VITE_URL_API=http://localhost:3001 npm run dev    # http://localhost:5173

# brote_mobile_expo, contra el proxy (npm install trae expo-audio, expo-speech y expo-file-system)
npm install
echo "EXPO_PUBLIC_URL_API=http://$(ipconfig getifaddr en0):3001" > .env
npx expo start             # abrir con Expo Go en el iPhone
```

**Sin voz en coreano** (solo para su criterio, sección 3.8): la web se levanta con
`VITE_SIN_VOCES=ko VITE_URL_API=http://localhost:3001 npm run dev` y el móvil con
`EXPO_PUBLIC_SIN_VOCES=ko` en el `.env` (y `npx expo start -c`). Solo funciona en
desarrollo (research.md, punto 17). Después se quitan.

**El permiso del micrófono** se pide una sola vez por sitio o por app:

- Chrome: en `localhost:5173`, el candado de la barra de direcciones > "Restablecer
  permisos" lo deja como nunca preguntado.
- iPhone: en Expo Go, el permiso es de Expo Go. Si ya lo tenía, para que lo vuelva a pedir
  hay que borrar Expo Go e instalarlo otra vez (o Ajustes > General > Transferir o
  restablecer > Restablecer > Restablecer localización y privacidad, que lo hace con todas
  las apps). Para darlo después de negarlo: Ajustes > Expo Go > Micrófono.

### 1.1 Datos de prueba

`npm run bd:sembrar` deja las cuentas de siempre (`autor@`, `autor2@`, `creador@` y
`creador2@`, en `brote.test`, con `brote12345`). Los audios son melodías de notas
senoidales (research.md, punto 16). `HTML` es `<b>hola</b> <script>alert(1)</script>`.

**"Actividades de prueba"** (de `autor@`, en borrador, en Español) gana cuatro lecciones al
final, de la 19 a la 22:

| Lección | Actividades |
|---|---|
| 19. Escuchar con la voz | 1. "Buenos días, ¿cómo estás?", sin audio, con el texto a la vista. 2. "Me gusta aprender cosas nuevas.", sin audio, con el texto oculto |
| 20. Escuchar con audio propio | 1. "Do, re, mi, fa, sol" con `escala-sube.mp3` (las cinco notas subiendo, 4 s), a la vista. 2. "Sol, fa, mi, re, do" con `escala-baja.m4a` (bajando), oculta. 3. "Do, mi, sol" con `tres-notas.wav`, a la vista |
| 21. Escuchar al límite | 1. Una frase de 200 caracteres ("Esta frase tiene exactamente doscientos caracteres…"), sin audio, a la vista. 2. "Treinta segundos de notas" con `treinta-segundos.wav` (la escala despacio, 30.0 s), a la vista |
| 22. Escuchar con etiquetas | 1. "Repite: `HTML`", sin audio, a la vista |

**"Japonés sencillo"** (publicado) queda en Japonés y recupera sus dos escuchar y repetir
del prototipo, a la vista y sin audio: `あいうえお`, la cuarta y última de "1. Hiragana: las
vocales", y `こんにちは、元気ですか？`, la tercera de "2. Saludos" (antes de la pregunta
abierta).

**"Inglés para viajar"** (nuevo, de `autor@`, en borrador, en Inglés), una lección, "1. En el
aeropuerto": 1. "Where is the gate?", sin audio, a la vista. 2. "Can I have a coffee,
please?", sin audio, oculta. 3. "Do, re, mi, fa, sol" con `escala-sube.mp3`, a la vista.

Los demás cursos quedan en Español.

### 1.2 Archivos para subir

```bash
ARCH=<scratchpad>/archivos-f14
npm run audios:validacion -- $ARCH        # en brote_backend_express; usa afconvert de macOS
npm run imagenes:validacion -- $ARCH      # los GIF de F13 para la lección pesada
ls $ARCH
```

| Archivo | Qué es |
|---|---|
| `escala-4s.mp3` | El MP3 de `escala-sube`: 4.0 s, unos 32 KB |
| `escala.wav` | La misma escala en WAV PCM, 16 bits, mono, 22 050 Hz |
| `largo-31s.wav` | WAV de 31 s |
| `pesado-6mb.wav` | WAV de 6 MB y 16 s (96 kHz, estéreo): pasa del peso, no de la duración |
| `pesado-5mb-1.wav`, `pesado-5mb-2.wav` | Dos WAV distintos de 4.9 MB y unos 26.8 s (48 kHz, estéreo, 16 bits) |
| `audio.ogg`, `audio.flac` | Formatos que no se aceptan (solo su cabecera) |
| `texto.mp3` | Un archivo de texto con extensión `.mp3` |
| `con-etiquetas.mp3` | `escala-4s.mp3` con una etiqueta ID3v2.3 (título "Título de prueba", artista "Artista de prueba", carátula PNG de 300 × 300) y una ID3v1 al final |
| `sin-perdida.m4a` | La escala en M4A sin pérdida (ALAC) |
| `gif-5mb-1.gif` a `gif-5mb-4.gif` | Los de F13, de 4.8 MB cada uno |
| `gif-2mb.gif` | El de F13 |

Además, una **nota de voz** del iPhone (app Notas de voz, unos 5 s, con "Ubicación" activada
y "Calidad de audio" en "Comprimida" en Ajustes > Notas de voz), pasada a la Mac con
AirDrop: `nota-de-voz.m4a`. Con "Sin pérdida" se graba en ALAC, que Brote rechaza (spec,
"Al subir").

### 1.3 Atajos

Los de F13 (`API`, `J`, `bd`, `idCurso`, `idLeccion`, `entrar`), más:

```bash
subirAudio() { curl -s -w ' %{http_code}\n' -b $1.txt -X POST $API/editor/cursos/$2/audios -H "Content-Type: $3" --data-binary @$4; }

# L1. Publicar y retirar "Actividades de prueba"
bd <<< "UPDATE curso SET publicado = true  WHERE titulo = 'Actividades de prueba';"
bd <<< "UPDATE curso SET publicado = false WHERE titulo = 'Actividades de prueba';"

# L2. Publicar "Inglés para viajar"
bd <<< "UPDATE curso SET publicado = true WHERE titulo = 'Inglés para viajar';"

# L3. Los audios de un curso
bd <<< "SELECT id, formato, duracion, peso, subida_en FROM audio WHERE id_curso = '$(idCurso 'Actividades de prueba')' ORDER BY subida_en;"
```

**C1. Curso "Voz"** (de `creador@`), para el editor: créalo en la web ("Nuevo curso",
título "Voz", descripción "Prueba") con una lección "Una" y otra "Pesada".

**C2. Curso "Coreano"** (de `creador@`), para "sin voz": créalo en la web, pon "Idioma"
en "Coreano" y guarda; agrega una lección "Una" con dos escuchar y repetir: "안녕하세요"
sin audio y con el texto oculto, y "Do, re, mi, fa, sol" con `escala-4s.mp3`. Guarda y
publícalo: `bd <<< "UPDATE curso SET publicado = true WHERE titulo = 'Coreano';"`.

**C3. Curso casi lleno** (de `creador@`), con 199 MB de imágenes sin usar, recién subidas:

```bash
entrar creador
curl -s -o /dev/null -b creador.txt -X POST $API/editor/cursos -H "$J" -d '{"titulo":"Casi lleno","descripcion":"Prueba"}'
LLENO=$(idCurso 'Casi lleno')
curl -s -o /dev/null -b creador.txt -X POST $API/editor/cursos/$LLENO/lecciones -H "$J" -d '{"titulo":"Una"}'
bd <<SQL
INSERT INTO imagen (id, id_curso, huella, formato, ancho, alto, peso, datos)
SELECT gen_random_uuid()::text, '$LLENO', md5('relleno' || i), 'gif', 1, 1, 1048576, decode(repeat('00', 1048576), 'hex')
FROM generate_series(1, 199) i;
SQL
```

### 1.4 Proxy de validación

`npm run proxy:validacion` pasa todo de `:3001` a `:3000`, salvo que se le pida otra cosa
para las imágenes y los audios (`GET /imagenes/*` y `GET /audios/*`):

```bash
curl -X POST localhost:3001/__modo/normal     # pasa todo
curl -X POST localhost:3001/__modo/bloquear   # responden con error de red
curl -X POST localhost:3001/__modo/retrasar   # tardan 4 s
curl -X POST localhost:3001/__modo/danar      # nuevo: 200 con bytes al azar del mismo largo (solo audios)
```

Para el lector de pantalla: VoiceOver en la Mac y en el iPhone. "Reducir movimiento" y
"Reducir transparencia", como en F13. Para llegar a una actividad que no es la primera,
responde las anteriores.

## 2. Backend con curl

```bash
entrar autor; entrar creador
PRUEBA=$(idCurso 'Actividades de prueba')
```

| Criterio | Pasos | Esperado |
|---|---|---|
| B0. Cursos de antes en Español | Después de `migrate deploy` y **antes** de `bd:sembrar`: `bd <<< "SELECT DISTINCT idioma FROM curso;"` | Solo `es` |
| B1. Lecciones de "Actividades de prueba" | `bd <<< "SELECT posicion, titulo FROM leccion WHERE id_curso = '$PRUEBA' ORDER BY posicion;"` | 1 a 18 como en F13; 19 "Escuchar con la voz", 20 "Escuchar con audio propio", 21 "Escuchar al límite", 22 "Escuchar con etiquetas" |
| B2. "Inglés para viajar" | `bd <<< "SELECT c.idioma, c.publicado, u.email FROM curso c JOIN \"user\" u ON u.id = c.id_autor WHERE c.titulo = 'Inglés para viajar';"` | `en`, `f` (antes de L2), `autor@brote.test`, y su lección "En el aeropuerto" con tres actividades |
| B3. Idioma inválido | `curl -s -w ' %{http_code}\n' -b autor.txt -X PUT $API/editor/cursos/$PRUEBA -H "$J" -d '{"titulo":"Actividades de prueba","descripcion":"Curso para comprobar a mano los tipos de actividad.","idioma":"xx"}'` | `400` con `campos.idioma`; el curso sigue en `es` |
| B4. Mismo archivo dos veces | `subirAudio autor $PRUEBA audio/mpeg $ARCH/escala-4s.mp3` dos veces y L3 | `201` y luego `200`, con el mismo `id`; una sola fila nueva |
| B5. Sin datos ocultos | `subirAudio autor $PRUEBA audio/mpeg $ARCH/con-etiquetas.mp3`; con su id, `curl -s -b autor.txt $API/audios/<id> -o limpio.mp3; grep -c -a "Artista de prueba\|TIT2\|APIC" limpio.mp3; ls -l $ARCH/con-etiquetas.mp3 limpio.mp3` | `201` (o `200` con el id de B4: limpio, es el mismo audio). `grep` cuenta 0; `limpio.mp3` pesa menos y suena igual |
| B6. Rechazos al subir | Sin `-b` (sin sesión); a `$(idCurso 'Huerto en casa')` (de `autor2@`); a `$(idCurso 'Curso en revisión')`; a `$(idCurso 'Git esencial')` (publicado); `texto.mp3` como `audio/mpeg`; `largo-31s.wav` como `audio/wav`; `pesado-6mb.wav`; `audio.ogg` como `audio/ogg`; `sin-perdida.m4a` como `audio/mp4` | `401`; `404`; `403` "…en revisión…"; `403` "…publicado…"; `400` "No se pudo leer el audio. Elige otro."; `400` "El audio puede durar hasta 30 segundos."; `413` "El audio puede pesar hasta 5 MB."; `400` "Elige un audio MP3, M4A o WAV."; `400` "No se pudo leer el audio. Elige otro." |
| B7. Rechazos al guardar | Con un audio subido a "Voz" (C1, de `creador@`) y el `version` actual de "Escuchar con la voz": `PUT` de esa lección con una actividad `escucharRepetir` que use ese audio; otra con un id inventado; otra con `"frase":""`, con `"frase":"a\nb"` y con 201 caracteres | `400` con `audios.<id>` en las dos primeras; `400` con `actividades.0` en las demás. La lección no cambia (`version` igual) |
| B8. Quién trae un audio | Con el id de B4: `curl -s -o /dev/null -w '%{http_code}\n'` con `-b autor.txt`, con `-b creador.txt` y sin `-b`; luego L1 y otra vez con `creador.txt`; luego L1 de retirar | `200`, `404`, `401`; después de publicar, `200` para `creador@` |
| B9. Borrar a un día | Sube `escala.wav` a `$PRUEBA` sin usarlo; `bd <<< "UPDATE audio SET subida_en = now() - interval '2 days' WHERE id = '<id>';"`; sube cualquier otro archivo a ese curso (o reinicia la API); L3 | El audio de `escala.wav` ya no está |
| B10. Borrar con la lección y con el curso | En "Voz" (C1), una lección con un audio, guardada. Elimina la lección en la web; luego elimina el curso | Después de cada paso, `bd <<< "SELECT count(*) FROM audio WHERE id_curso = '$(idCurso 'Voz')';"` baja; al final, 0 |

## 3. Web y móvil

### 3.1 Cursos de prueba

| Criterio | Pasos | Esperado |
|---|---|---|
| [backend] Lecciones al final | B1 | Ver B1 |
| [web, móvil] Japonés sencillo | Abre "Japonés sencillo"; recorre "Hiragana: las vocales" hasta el final y "Saludos" hasta la tercera | La última de "Hiragana" es escuchar y repetir con `あいうえお`; la tercera de "Saludos", con `こんにちは、元気ですか？` |
| [backend] Inglés para viajar | B2 | Ver B2 |
| [web, móvil] Los demás en Español | `bd <<< "SELECT titulo, idioma FROM curso ORDER BY titulo;"`; abre "Git esencial" y cursa su primera lección | Todos `es` salvo "Japonés sencillo" (`ja`) e "Inglés para viajar" (`en`); la lección se cursa como antes |

### 3.2 Idioma del curso

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Campo Idioma | Como `creador@`, abre el mapa de "Voz" (C1) | Después de la descripción, "Idioma" con "Español" y la ayuda "El idioma de la voz que lee las frases de escuchar y repetir."; la lista: Español, Inglés, Francés, Portugués, Alemán, Italiano, Japonés, Chino y Coreano |
| [web] Cambiar y guardar | Elige "Inglés", pulsa "Guardar cambios" y recarga | "Guardar cambios" se habilita; "Cambios guardados"; sigue en Inglés |
| [web] Curso nuevo | Crea "Otro" con "Nuevo curso" | El formulario no pide idioma; en su mapa, "Español" |
| [web] Curso en revisión | Como `autor@`, abre el mapa de "Curso en revisión" | "Idioma: Español" como texto, sin la lista |
| [web, móvil] Detalle | Abre el detalle de "Japonés sencillo" y el de "Git esencial" | "Idioma: Japonés" e "Idioma: Español", debajo de "Por Equipo Brote" |
| [web, móvil] Catálogo | Mira el catálogo y busca "git" y "japones" | Las tarjetas no muestran el idioma; los mismos cursos y resultados que en F02 |
| [backend] Idioma inválido y cursos de antes | B3 y B0 | Ver B3 y B0 |

### 3.3 Crear la actividad (editor)

En "Voz" (C1), lección "Una", como `creador@`.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Paleta | Mira el grupo "Voz"; pulsa "Escuchar y repetir"; arrastra otra | Sin "Próximamente" en ningún tipo; se agregan dos bloques |
| [web] Formulario | Selecciona el bloque | "Frase" ("Lo que el alumno escucha y repite."), la casilla "Mostrar el texto desde el inicio" marcada ("Si la desmarcas, el alumno ve el texto al comprobar.") y "Audio de la frase", en ese orden |
| [web] Ayuda en inglés | Con "Voz" en Inglés (3.2), mira la ayuda del audio | "Sin audio, la frase se lee con la voz del dispositivo, en inglés, el idioma del curso." |
| [web] Frase vacía | Deja la frase vacía y pulsa "Guardar lección" | El bloque dice "Incompleta" y la frase, "Este campo es obligatorio." |
| [web] Límite y saltos | Pega 250 caracteres con un salto de línea; escribe "  Hola  " y guarda | Quedan 200 y sin salto; al recargar, "Hola" |
| [web] Bloque | Escribe "Where is the gate?" | El bloque de la secuencia dice "Where is the gate?" |
| [web] Vista previa oculta | Desmarca la casilla | La vista previa dice "El texto aparece al comprobar." |
| [web] Al recargar | Con frase, casilla desmarcada y `escala-4s.mp3`, guarda y recarga | Los tres como se guardaron |

### 3.4 Subir un audio (editor)

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Campo vacío | Mira "Audio de la frase" | "Elegir audio" y "MP3, M4A o WAV de hasta 30 segundos y 5 MB." |
| [web] MP3 | Con Chrome DevTools > Red en "3G lenta" para verlo subir, elige `escala-4s.mp3` | "Subiendo audio…" y luego "Escuchar", "0:04 · {peso}", "Cambiar" y "Quitar"; "Escuchar" suena |
| [web] M4A y WAV | Con "Cambiar", `nota-de-voz.m4a`; luego `escala.wav` | Los dos se suben y suenan |
| [web] Largo y pesado | Elige `largo-31s.wav`; luego `pesado-6mb.wav` | "El audio puede durar hasta 30 segundos."; "El audio puede pesar hasta 5 MB."; el campo queda como estaba |
| [web] Formatos y texto | Elige `audio.ogg`, `audio.flac` y `texto.mp3` | "Elige un audio MP3, M4A o WAV." en los dos primeros; "No se pudo leer el audio. Elige otro." en el último |
| [web] Datos ocultos | Elige `con-etiquetas.mp3`; guarda; descarga el audio como en B5 | Suena igual; el campo muestra un peso menor que el del archivo (`ls -l`); el descargado no tiene "Artista de prueba" |
| [web] Cambiar con error | Con un audio, "Cambiar" y `largo-31s.wav`; luego "Cambiar" y `escala.wav` | El error y el audio anterior; después, el WAV |
| [web] Quitar | "Quitar" | Campo vacío, sin confirmación; "Cambios sin guardar"; la vista previa lee la frase con la voz del navegador |
| [web] Esperar la subida | Con Chrome DevTools > Red en "3G lenta", elige `pesado-5mb-1.wav` | Mientras sube, "Guardar lección" y "Probar lección" deshabilitados con "Espera a que terminen de subir los archivos."; se puede escribir en la frase |
| [web] Servidor apagado | Detén la API (`npm run dev`) y elige un audio | "No se pudo subir el audio. Inténtalo de nuevo."; lo demás sigue |
| [web] Sesión expirada | Con un audio ya guardado en el campo, `./expirar creador@brote.test` (en `brote_specs`), escribe algo en la frase y elige otro audio | "Entrar" con "Tu sesión terminó. Vuelve a entrar."; al entrar, la lección con sus cambios y el campo como estaba |

### 3.5 Escuchar (cursar)

Con L1 y L2. En la web, como `creador@`; en el móvil, igual.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Al abrir | Abre "Escuchar con la voz" (19) | "Escucha y repite.", "Buenos días, ¿cómo estás?" en letra grande, "Escuchar", "Más lento" y "Grabarme"; no suena nada |
| [web, móvil] Voz y más lento | "Escuchar"; luego "Más lento" | Una voz en español; más despacio, con el mismo tono |
| [web, móvil] Detener y cambiar | "Escuchar" y, mientras suena, "Escuchar" (ahora "Detener"); luego "Escuchar" y, mientras suena, "Más lento" | Se detiene; después empieza otra vez desde el principio, más despacio |
| [web, móvil] Texto oculto | Pasa a la segunda | "El texto aparece al comprobar." y no la frase |
| [web, móvil] Audio propio | Abre "Escuchar con audio propio" (20); "Escuchar" y "Más lento" en la primera | Suena la escala que sube (notas, no una voz); "Más lento", más despacio y con las mismas notas (no más graves) |
| [web, móvil] Inglés y japonés | Abre "Inglés para viajar" y la última de "Hiragana" | Una voz en inglés; una voz en japonés |
| [web, móvil] Después de comprobar | En cualquiera, comprueba y pulsa "Escuchar" y "Más lento" | Siguen sonando |
| [móvil] Silencio | Con el interruptor de silencio del iPhone puesto y el volumen arriba, "Escuchar" (voz) y, en 20, "Escuchar" (audio) | Se oyen los dos (research.md, punto 10: por confirmar) |
| [móvil] Segundo plano | En 21, "Escuchar" en "Treinta segundos de notas" y ve a la pantalla de inicio | Deja de sonar |

### 3.6 Comprobar y autoevaluarse

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Comprobar | Abre 19; mira "Comprobar"; "Grabarme" y graba 2 s; mira otra vez; "Escuchar" y "Detener" | Deshabilitado, sigue deshabilitado después de grabar, y se habilita en cuanto empieza a sonar; sigue habilitado al detener |
| [web, móvil] Frase al comprobar | En la segunda de 19, "Escuchar" y "Comprobar" | La frase aparece donde estaba el aviso; debajo, "¿Lo dijiste bien?", "Lo dije bien" y "No me salió" |
| [web, móvil] Sin Continuar | Después de comprobar, antes de elegir | No hay "Continuar" |
| [web, móvil] Resultado | "Lo dije bien" en una; "No me salió" en otra | "¡Correcto!"; "A repasar" |
| [web, móvil] Acertaste 1 de 2 | Termina 19 con una de cada | "Acertaste 1 de 2" |
| [web, móvil] Preguntas de Japonés | Termina "Hiragana: las vocales" y "Saludos" | "Acertaste {a} de 3" y "Acertaste {a} de 4" |

### 3.7 Grabarse

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Pedir el permiso | Con el permiso sin preguntar (sección 1), abre 19 y luego pulsa "Grabarme" | Al abrir, nada; al pulsar, el sistema pide el micrófono |
| [web, móvil] Grabando | Permítelo | "Grabando…" con "0:01 de 0:30", "0:02 de 0:30"…, "Detener", y "Escuchar" y "Más lento" deshabilitados; "Detener" termina |
| [web, móvil] 30 s | "Grabarme" y espera | Termina sola en "0:30 de 0:30" |
| [web, móvil] Mi grabación | "Escuchar mi grabación"; mientras suena, "Escuchar" | Se oye lo que dije; al pulsar "Escuchar", mi grabación se detiene y suena la frase |
| [web, móvil] Volver a grabarme | "Volver a grabarme", di otra cosa, "Escuchar mi grabación" | Se oye lo nuevo |
| [web, móvil] Se descarta | Termina la lección y ábrela otra vez | Sin "Escuchar mi grabación" |
| [web] Nada al servidor | Chrome DevTools > Red, sin filtro; grábate y escúchate | Ninguna petición nueva |
| [web, móvil] Permiso negado | Restablece el permiso (sección 1); "Grabarme" y niégalo | "Brote no tiene permiso para usar el micrófono. Puedes seguir sin grabarte." y "Para grabarte, permite el micrófono en los ajustes del navegador." (web) o "…del teléfono." (móvil); "Escuchar", "Comprobar" y la autoevaluación funcionan |
| [móvil] Abrir ajustes | Con el permiso negado, "Grabarme" otra vez; "Abrir ajustes"; activa "Micrófono"; vuelve a Expo Go | El aviso con "Abrir ajustes", que abre los ajustes de Expo Go; al volver, sin aviso, y "Grabarme" graba |
| [web] Sin micrófono | En la consola de Chrome: `navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("", "NotFoundError"))`; "Grabarme" | "No se encontró un micrófono. Puedes seguir sin grabarte." |
| [móvil] Segundo plano al grabar | "Grabarme", habla 3 s y ve a la pantalla de inicio; vuelve | La grabación terminó; "Escuchar mi grabación" tiene esos 3 s |
| [web, móvil] Salir sin confirmar | En la primera de 19, "Escuchar", "Grabarme" y "Detener"; pulsa la X | Sale al detalle sin preguntar |

### 3.8 Errores al cursar

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] No cargó | `__modo/bloquear`; abre 20 | El icono de audio roto y "No se pudo cargar el audio"; no suena la voz; "Comprobar" habilitado sin escuchar; "Grabarme" y la autoevaluación funcionan |
| [web, móvil] Texto a la vista | Con `bloquear`, pasa a la segunda de 20 (oculta); luego `__modo/normal` y espera a que llegue | La frase "Sol, fa, mi, re, do" a la vista desde el inicio, y sigue a la vista cuando el audio llega |
| [móvil] Vuelve la conexión | Con `normal`, abre 20 en modo avión; quita el modo avión | Al volver la conexión, el audio carga solo y "Escuchar" lo reproduce |
| [web] Reintento con Escuchar | Con `bloquear`, abre 20; `__modo/normal`; "Escuchar" | Lo pide otra vez y suena |
| [web, móvil] Sin voz en coreano | Levanta la web y el móvil con el interruptor (sección 1); abre "Coreano" (C2) | La primera: "Este dispositivo no tiene una voz en coreano para leer la frase. Puedes instalar una en sus ajustes.", "Escuchar" y "Más lento" deshabilitados, "Comprobar" habilitado y "안녕하세요" a la vista; se comprueba y se autoevalúa. La segunda (con audio): sin aviso, y suena |
| [web, móvil] Audio dañado | `__modo/danar`; abre 20 y ve a la segunda; "Escuchar"; luego `__modo/normal` y "Escuchar" | "No se pudo reproducir la frase. Inténtalo de nuevo.", "Comprobar" habilitado y la frase a la vista; después suena y el aviso desaparece |

### 3.9 Accesibilidad y teclado

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Nombres | VoiceOver en 19: recorre los botones; graba y detén | "Escuchar la frase", "Escuchar la frase más lento", "Grabarme", "Detener la grabación", "Escuchar mi grabación" y "Volver a grabarme"; anuncia "Grabando" y "Grabación lista" |
| [web, móvil] Frase oculta | VoiceOver en la segunda de 19, antes de comprobar | No lee "Me gusta aprender cosas nuevas." |
| [web, móvil] Idioma de la frase | VoiceOver en la última de "Hiragana" | `あいうえお` con la voz japonesa; la consigna y los botones en español |
| [web] Teclado | En 19, solo con Tab, Enter y la barra espaciadora: escucha, comprueba y autoevalúate | Foco visible en cada botón; al comprobar, el foco en "Lo dije bien"; al elegir, en "Continuar" |
| [web, móvil] Modos | Modo oscuro y "Reducir transparencia"; "Reducir movimiento" y graba | Todo legible; el indicador de "Grabando…" no se mueve |

### 3.10 Límites del curso y servidor

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Peso en el lienzo | En "Una" de "Voz" sin otros archivos, elige `escala-4s.mp3`; luego "Quitar" | Aparece "Archivos de esta lección: 0.1 de 25 MB" junto a "Guardar lección"; desaparece al quitarlo |
| [web] Textos de archivos | Abre en el editor una lección de "Actividades de prueba" con imágenes (13) y el mapa de "Actividades de prueba" | "Archivos de esta lección: …" y "Archivos del curso: … de 200 MB" (nunca "Imágenes") |
| [web] Curso lleno | En "Casi lleno" (C3), en "Una", un escuchar y repetir con `escala.wav`; luego, una teoría con `[imagen]` y `gif-2mb.gif` | Las dos veces: "Este curso ya tiene 200 MB de archivos. Quita alguno y guarda para hacer espacio." |
| [web] Lección pesada | En "Pesada" de "Voz": una teoría con cuatro `[imagen]` y `gif-5mb-1` a `-4`, y dos escuchar y repetir con `pesado-5mb-1.wav` y `-2.wav`; "Guardar lección" y "Probar lección"; quita los dos audios y guarda | "Los archivos de esta lección pesan más de 25 MB. Quita alguno." y no guarda ni abre la prueba; sin los audios, se guarda |
| [web] Audio que ya no está | En dos pestañas con "Una" (con un audio guardado): en la primera, "Quitar" y guarda; en la segunda, cambia la frase, guarda y elige "Reemplazar" | "Revisa los datos marcados." y el campo: "Este audio ya no está. Elige otro." |
| [backend] Borrar | B9 y B10 | Ver B9 y B10 |
| [backend] Mismo archivo | B4 | Ver B4 |
| [backend] Datos ocultos | B5 | Ver B5 |
| [backend] Rechazos al subir | B6 | Ver B6 |
| [backend] Rechazos al guardar | B7 | Ver B7 |
| [backend] Quién trae | B8 | Ver B8 |

### 3.11 Contenido

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Etiquetas | Abre "Escuchar con etiquetas" (22) | "Repite: `<b>hola</b> <script>alert(1)</script>`" tal cual, sin negritas ni alerta |
| [web, móvil] Al límite | Abre 21 en un teléfono de 360 px (web: DevTools en 360 × 740) | La frase completa en varios renglones, sin cortarse; "Treinta segundos de notas" suena 30 s con "Escuchar" y unos 50 con "Más lento" |
| [web] Vista previa y probar | En el editor de "Actividades de prueba" (como `autor@`), selecciona una actividad de 20; luego "Probar lección" | La vista previa se ve y suena como en el reproductor; "Probar lección" recorre las tres como un alumno |
