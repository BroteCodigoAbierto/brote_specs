# F03: Cursar una lección

**Estado**: Borrador
**Creada**: 2026-11-02
**Repos afectados**: backend | web | móvil
**Rama**: `feature/F03-cursar-leccion` (en cada repo afectado)
**Descripción original**: "F03 Cursar una lección, en web y móvil. Desde el
detalle de un curso, el alumno abre una lección y la recorre actividad por
actividad, con una barra de progreso arriba y un botón para salir. En esta
feature entran cinco tipos de actividad: teoría (texto con título, párrafos,
código y puntos clave), tarjeta de memoria (se voltea para ver el reverso),
opción múltiple (una respuesta correcta), completar espacios (se escribe en
cada espacio y se aceptan varias respuestas, sin importar mayúsculas ni
acentos) y pregunta abierta (escribe su respuesta, ve la solución y se
califica él mismo). En las preguntas, "Comprobar" dice si acertó y muestra la
respuesta correcta si no; luego "Continuar". Al terminar ve una pantalla de
lección completada con cuántas acertó. Los cursos de prueba traen sus
actividades reales del prototipo. Fuera de alcance: guardar el progreso
(F04), puntos e insignias (F08), glosario (F09), sin conexión (F10) y los
demás tipos de actividad (emparejar, ordenar, banco de palabras, clasificar,
código, terminal, grafo de commits y escuchar y repetir), que irán en
features siguientes."

## Objetivo

Que el alumno pueda aprender con un curso: abrir una de sus lecciones y
recorrerla actividad por actividad (leer teoría, repasar tarjetas y responder
preguntas con retroalimentación inmediata) hasta ver cuántas acertó. Es la
primera feature en la que Brote enseña, y deja listo el reproductor al que
las features siguientes le agregan más tipos de actividad.

## Actor

- **Alumno**: usuario con sesión iniciada (F01) que cursa una lección de un
  curso publicado. Cualquier usuario puede cursar cualquier curso publicado,
  incluido su autor; no hay inscripción (F02).

## Precondiciones

- El alumno tiene sesión iniciada. Sin sesión, la pantalla de la lección
  lleva a "Entrar" (F01).
- El alumno está en el detalle de un curso publicado (F02) o, en la web,
  abre directamente la dirección de una lección.
- Para abrir la lección hace falta llegar al servidor. Si no se puede, se
  maneja en "Casos de error".
- Los cursos de prueba (los cuatro del prototipo) tienen cargadas las
  actividades de sus lecciones que son de los cinco tipos de esta feature,
  tomadas de `referencia/cursos-prototipo/` (ver "Supuestos").

## Datos de entrada

- Lección que se abre: identificador de un curso y de una de sus lecciones,
  obligatorios. Vienen de la lección que se pulsa en el detalle del curso o,
  en la web, de la dirección de la página.
- Opción elegida (opción múltiple): una de las opciones de la pregunta,
  obligatoria para comprobar. Se puede cambiar mientras no se pulse
  "Comprobar".
- Texto de cada espacio (completar espacios): texto, obligatorio en cada
  espacio para comprobar, hasta 100 caracteres por espacio.
- Respuesta libre (pregunta abierta): texto de varias líneas, obligatorio
  para comprobar, hasta 2000 caracteres.
- Autoevaluación (pregunta abierta): "La tuve bien" o "No la tuve",
  obligatoria para continuar.

Nada de esto se guarda (ver "Resultado esperado").

## Flujo principal

### Abrir una lección

1. En el detalle del curso, el alumno pulsa una lección de la lista (en F02
   las lecciones solo se listaban; ahora cada una se puede abrir).
2. El sistema abre el reproductor de la lección. En la web tiene su propia
   dirección; en el móvil se abre encima del detalle del curso, a pantalla
   completa y sin la barra de pestañas.
3. Arriba se ven el botón de salir (X) y la barra de progreso; debajo, la
   primera actividad de la lección.

### Recorrer las actividades

1. El alumno resuelve la actividad que tiene en pantalla (ver cada tipo
   abajo).
2. Pulsa "Continuar" y pasa a la siguiente actividad, en el orden de la
   lección. La barra de progreso avanza.
3. No se puede volver a una actividad anterior ni saltarse una: se avanza
   solo con "Continuar".
4. Después de la última actividad, el sistema muestra la pantalla de lección
   completada.

### Teoría

1. El alumno ve, en este orden y solo los que la actividad tenga: el título,
   los párrafos, un bloque de código y una lista de puntos clave.
2. Pulsa "Continuar", que está disponible desde el principio.

### Tarjeta de memoria

1. El alumno ve el frente de la tarjeta y la indicación "Toca la tarjeta para
   voltearla".
2. Pulsa la tarjeta (en la web, también con Enter o la barra espaciadora
   cuando tiene el foco) y la tarjeta se voltea y muestra el reverso. Puede
   volver a voltearla las veces que quiera.
3. "Continuar" se habilita después de voltearla por primera vez.

### Opción múltiple

1. El alumno ve la pregunta, un bloque de código si la pregunta lo tiene, y
   las opciones en un orden al azar.
2. Elige una opción (en la web, también con las teclas 1 a 9, según su
   lugar en pantalla). Puede cambiar de opción.
3. Pulsa "Comprobar" (en la web, también con Enter).
4. El sistema marca la opción correcta y, si eligió otra, marca la suya como
   incorrecta. La barra inferior dice "¡Correcto!" o muestra "Respuesta
   correcta: {opción correcta}". Las opciones ya no se pueden cambiar.
5. El botón pasa a "Continuar" (en la web, también con Enter).

### Completar espacios

1. El alumno ve un texto con uno o más espacios en blanco; cada espacio es un
   campo donde se puede escribir.
2. Escribe en cada espacio. En la web, Tab pasa al siguiente espacio.
3. Pulsa "Comprobar" (en la web, también con Enter desde cualquier
   espacio).
4. El sistema marca cada espacio como correcto o incorrecto. Junto a cada
   espacio incorrecto aparece la respuesta esperada. La barra inferior dice
   "¡Correcto!" si acertó todos, o muestra "Respuesta correcta:" con el texto
   completo y los espacios llenos con las respuestas esperadas. Los espacios
   ya no se pueden editar.
5. El botón pasa a "Continuar".

### Pregunta abierta

1. El alumno ve la pregunta y un campo para escribir su respuesta ("Escribe
   tu respuesta…").
2. Escribe y pulsa "Comprobar".
3. El sistema muestra, debajo de su respuesta (que ya no se puede editar), la
   "Solución de referencia" y la pregunta "¿La tuviste bien?" con los botones
   "La tuve bien" y "No la tuve".
4. El alumno elige uno. La barra inferior dice "¡Correcto!" o "A repasar", y
   el botón pasa a "Continuar".

### Terminar la lección

1. Después de la última actividad, el sistema muestra la pantalla de lección
   completada: "¡Lección completada!", el título de la lección y "Acertaste
   {aciertos} de {preguntas}", con una celebración breve.
2. El alumno pulsa "Volver al curso" y regresa al detalle del curso.

### Salir antes de terminar

1. El alumno pulsa la X (o el botón de volver del navegador, o el de atrás
   del teléfono).
2. Si todavía no hizo nada en la lección (está en la primera actividad y no
   ha elegido, escrito ni volteado nada), sale directo al detalle del curso.
3. Si ya hizo algo, el sistema pregunta "¿Salir de la lección?" con el texto
   "Perderás tu avance en esta lección." y los botones "Salir" y "Seguir
   aquí". "Salir" lleva al detalle del curso; "Seguir aquí" cierra la
   pregunta y deja la lección exactamente como estaba.

## Validaciones

- Solo se cursan lecciones de cursos publicados, con las mismas reglas que el
  detalle del curso en F02: una lección de un curso en borrador o en
  revisión no se puede abrir, ni siquiera con la cuenta de su autor, y da la
  misma respuesta que una lección que no existe. Una lección solo se abre con
  el curso al que pertenece. El servidor es quien filtra.
- Barra de progreso: muestra cuántas actividades de la lección ya se
  pasaron con "Continuar" del total. En la primera actividad está vacía; en
  la pantalla de lección completada, llena. Avanza con una animación breve
  (sin animación con "reducir movimiento"). Para los lectores de pantalla se
  anuncia como "Actividad {n} de {total}".
- Preguntas y aciertos:
  - Cuentan como preguntas la opción múltiple, completar espacios y la
    pregunta abierta. La teoría y las tarjetas de memoria no cuentan.
  - Cada pregunta se responde una sola vez: después de "Comprobar" no se
    puede cambiar la respuesta ni volver a intentarla.
  - Una opción múltiple se acierta si la opción elegida es la correcta.
  - Completar espacios se acierta solo si todos sus espacios son correctos.
  - Una pregunta abierta se acierta si el alumno elige "La tuve bien".
- "Comprobar" está deshabilitado hasta que hay respuesta: una opción
  elegida; todos los espacios con algo escrito; o una respuesta libre con
  algo escrito. Un texto formado solo por espacios cuenta como vacío.
- Comparación de los espacios: lo escrito es correcto si coincide con
  cualquiera de las respuestas aceptadas de ese espacio, sin importar
  mayúsculas, acentos ni espacios al inicio o al final, y contando varios
  espacios seguidos como uno. La ñ cuenta como n (igual que la búsqueda de
  F02). Los signos sí importan: si la respuesta aceptada es `>`, escribir
  `<` es incorrecto. La respuesta esperada que se muestra es la primera de
  las aceptadas, tal como la escribió el autor.
- Los campos de los espacios no dejan escribir más de 100 caracteres, y el de
  la respuesta libre no deja escribir más de 2000.
- Opción múltiple: las opciones se mezclan al azar cada vez que aparece la
  pregunta (al abrir de nuevo la lección pueden salir en otro orden). Las
  teclas 1 a 9 corresponden al orden en pantalla, no al guardado. Una opción
  puede ser un texto o un símbolo grande, como "あ" (en ese caso las opciones
  se acomodan como mosaicos).
- Textos de las actividades: se muestran siempre como texto. Si contienen
  algo como `<label>`, `<b>hola</b>` o `<script>`, se ve tal cual y no se
  interpreta. Esto incluye títulos, párrafos, código, puntos clave, frente y
  reverso de las tarjetas, preguntas, opciones, textos con espacios y
  soluciones.
- Párrafos (teoría): un renglón en blanco separa un párrafo del siguiente;
  los saltos de línea simples se respetan.
- Bloques de código (teoría y opción múltiple): en letra monoespaciada,
  respetando saltos de línea y sangría. Si una línea es más ancha que la
  pantalla, el bloque se desplaza hacia los lados en vez de cortar la línea.
  Si las líneas siguen el formato de un diff, las que empiezan con `+` se
  resaltan como agregadas, las que empiezan con `-` como eliminadas y las
  que empiezan con `@@` como encabezado del cambio.
- Texto con espacios (completar espacios): se respetan sus saltos de línea y
  su sangría, porque muchas veces es código.
- Pantalla de lección completada: si la lección no tiene preguntas, no
  aparece "Acertaste…"; solo "¡Lección completada!" y el título. Con
  "reducir movimiento", la celebración no se mueve. No hay sonido.

## Estados de la pantalla

### Reproductor de la lección (web y móvil)

- Cargando: la X y un indicador de carga en lugar de la actividad. La barra
  de progreso no aparece hasta que carga la lección.
- Con datos: la X, la barra de progreso, la actividad actual y la barra
  inferior con su botón ("Continuar" o "Comprobar").
- Actividad respondida: la barra inferior en verde con "¡Correcto!" o en
  rojo con la respuesta correcta (o "A repasar" en la pregunta abierta), y el
  botón "Continuar".
- Sin actividades: "Esta lección todavía no tiene actividades." con el
  botón "Volver al curso".
- No disponible: "Esta lección no existe o ya no está disponible." con el
  enlace "Ver cursos", que lleva al catálogo.
- Error: "No se pudo conectar con Brote. Inténtalo de nuevo en un momento."
  con el botón "Reintentar".
- Sin conexión (móvil): "Sin conexión. Revisa tu conexión e inténtalo de
  nuevo." con el botón "Reintentar".
- Confirmar salida: la pregunta "¿Salir de la lección?" encima de la
  lección, que sigue visible detrás.

### Lección completada (web y móvil)

- "¡Lección completada!", el título de la lección, "Acertaste {aciertos} de
  {preguntas}" (si tiene preguntas) y "Volver al curso". No carga nada, así
  que no tiene estados de carga ni de error.

### Detalle del curso (cambio sobre F02)

- Cada lección de la lista se puede pulsar para abrirla. El resto de sus
  estados no cambia.

## Resultado esperado

- El alumno recorre cualquier lección de un curso publicado de principio a
  fin, recibe retroalimentación en cada pregunta y al final ve cuántas
  acertó.
- Esta feature no guarda nada: ni las respuestas, ni los aciertos, ni que la
  lección se completó. Al volver a abrir una lección empieza desde la
  primera actividad, sin respuestas. Registrar el progreso le toca a F04.
- Los cuatro cursos de prueba tienen cargadas sus actividades de los cinco
  tipos de esta feature.

## Casos de error

- El servidor no responde o falla al abrir la lección: "No se pudo conectar
  con Brote. Inténtalo de nuevo en un momento." con "Reintentar". En el
  móvil, 15 segundos sin respuesta cuentan como que el servidor no responde
  (igual que en F01 y F02).
- Sin conexión en el móvil al abrir la lección: "Sin conexión. Revisa tu
  conexión e inténtalo de nuevo." con "Reintentar".
- Se pierde la conexión, o se apaga el servidor, a mitad de la lección: la
  lección sigue y se puede terminar, porque ya está cargada completa.
- La lección no existe, no pertenece a ese curso, o su curso no existe o no
  está publicado (por ejemplo, en la web se escribe una dirección con un
  identificador inventado): "Esta lección no existe o ya no está
  disponible." con "Ver cursos". El mensaje es el mismo en todos los casos,
  para no revelar que existe un curso sin publicar.
- El curso deja de estar publicado mientras el alumno cursa una lección: la
  lección que ya abrió se puede terminar; la siguiente vez que la abra verá
  "Esta lección no existe o ya no está disponible.".
- La sesión expiró: al abrir la lección se llega a "Entrar" con el aviso "Tu
  sesión terminó. Vuelve a entrar." (F01). En la web, después de entrar se
  regresa a esa lección, desde la primera actividad.
- El alumno recarga la página (web) o cierra la app (móvil) a mitad de la
  lección: no hay confirmación; al volver, la lección empieza desde la
  primera actividad.

## Fuera de alcance

- Guardar el progreso: marcar la lección como completada, ver qué lecciones
  ya se hicieron, "Empezar" o "Continuar" en el detalle del curso, "Mis
  cursos" y retomar una lección donde se dejó (F04).
- Puntos, insignias y logros de la pantalla de lección completada (F08).
- Glosario: los términos que traen algunas actividades del prototipo no se
  cargan ni se muestran (F09).
- Cursar sin conexión o descargar lecciones (F10).
- Los demás tipos de actividad: emparejar, ordenar, banco de palabras,
  clasificar, código, terminal simulada, grafo de commits y escuchar y
  repetir. Llegan en features siguientes, y con cada una se cargan las
  actividades de ese tipo en los cursos de prueba.
- Opciones con imagen en la opción múltiple (llega con "Subir imágenes y
  audio propios a los cursos").
- Opción múltiple con más de una respuesta correcta.
- Volver a una actividad anterior, saltarse actividades, reintentar una
  pregunta fallada o repetir al final las que se fallaron.
- Ir directo a la lección siguiente desde la pantalla de lección completada.
- Crear o editar actividades (F05).
- Sonidos y vibración.

## Criterios de aceptación

<!--
  Datos de prueba: los cuatro cursos del prototipo publicados, con las
  actividades de los cinco tipos de esta feature, más el curso "Curso de
  prueba de actividades" descrito en "Supuestos". Cómo prepararlos lo dice
  el quickstart.md del plan.
-->

### Abrir y recorrer

- [ ] [web, móvil] En el detalle de "Git esencial", al pulsar "1. ¿Qué es el
  control de versiones?" se abre su reproductor: la X, la barra de progreso
  vacía y la teoría "El problema que resuelve Git". En el móvil no se ve la
  barra de pestañas.
- [ ] [web, móvil] Recorro esa lección hasta el final y veo, en este orden:
  teoría "El problema que resuelve Git", tarjeta "¿Qué es un repositorio
  (repo)?", tarjeta "¿Qué es un commit?", teoría "Las tres áreas de Git" y
  dos preguntas de opción múltiple. La barra de progreso avanza un paso con
  cada "Continuar" y en la pantalla de lección completada está llena.
- [ ] [web, móvil] En ninguna lección de los cursos de prueba aparece una
  actividad de los tipos que quedan fuera de alcance: "Tu primer commit"
  (Git esencial, 2) tiene solo su teoría.
- [ ] [web, móvil] No hay forma de volver a la actividad anterior ni de pasar
  a la siguiente sin pulsar "Continuar".
- [ ] [web] Al recargar la página a mitad de una lección, la lección vuelve a
  empezar desde la primera actividad. La dirección del reproductor se puede
  abrir directamente.
- [ ] [web] Dado que no hay sesión, cuando abro la dirección de una lección y
  entro, entonces llego a esa lección.

### Teoría

- [ ] [web, móvil] La teoría "El problema que resuelve Git" muestra su
  título, dos párrafos y tres puntos clave en lista; "Continuar" está
  disponible desde el principio.
- [ ] [web, móvil] La teoría "El atributo for de <label>" (Examen unidad 1,
  lección 1) muestra `<label>` en el título y en el texto tal cual, y su
  bloque de código en letra monoespaciada con sus dos líneas.
- [ ] [web, móvil] En "Viajar en el tiempo: historial y diffs" (Git esencial,
  3), en el diff de la pregunta "En el diff de arriba, ¿qué línea se
  eliminó…?" la línea que empieza con `-` se ve resaltada como eliminada, las
  que empiezan con `+` como agregadas y la de `@@` como encabezado.
- [ ] [móvil] En la teoría `target="_blank" y rel="noopener"` (Examen unidad
  1, lección 3), la línea de código `<a href="https://ejemplo.com" …>` no se
  corta: el bloque se desplaza hacia los lados para verla completa.

### Tarjeta de memoria

- [ ] [web, móvil] En la tarjeta "¿Qué es un commit?", "Continuar" está
  deshabilitado; al pulsar la tarjeta veo el reverso ("Una fotografía
  guardada del proyecto…") y "Continuar" se habilita. Al pulsarla otra vez
  vuelve al frente.
- [ ] [web] Con el foco en la tarjeta, Enter o la barra espaciadora la
  voltean.

### Opción múltiple

- [ ] [web, móvil] En "¿Cuál de estas afirmaciones es correcta?" (Git
  esencial, 1), "Comprobar" está deshabilitado hasta que elijo una opción, y
  puedo cambiar de opción antes de comprobar.
- [ ] [web, móvil] Al elegir "Un commit es una fotografía del proyecto en un
  momento dado" y comprobar, esa opción queda marcada como correcta y la
  barra inferior dice "¡Correcto!".
- [ ] [web, móvil] Al elegir "Un commit borra el historial anterior" y
  comprobar, esa opción queda marcada como incorrecta, la correcta queda
  marcada como correcta y la barra inferior muestra "Respuesta correcta: Un
  commit es una fotografía del proyecto en un momento dado". Las opciones ya
  no se pueden cambiar y el botón dice "Continuar".
- [ ] [web, móvil] Al abrir varias veces la misma lección, las opciones de
  esa pregunta no salen siempre en el mismo orden, y la correcta no está
  siempre arriba.
- [ ] [web, móvil] En "Hiragana: las vocales" (Japonés sencillo, 1), las
  opciones de "¿Cuál hiragana se lee 'a'?" se ven como mosaicos con los
  símbolos "あ", "い" y "う" en grande.
- [ ] [web] Con las teclas 1, 2 y 3 elijo la opción que está en ese lugar en
  pantalla; Enter comprueba y, después, Enter continúa.

### Completar espacios

- [ ] [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1), el
  texto `___ main() {` con sus tres líneas se ve con su sangría y un espacio
  para escribir; "Comprobar" está deshabilitado mientras el espacio está
  vacío o tiene solo espacios.
- [ ] [web, móvil] Escribir " INT " en ese espacio y comprobar lo marca como
  correcto y la barra dice "¡Correcto!".
- [ ] [web, móvil] Escribir "float" lo marca como incorrecto, muestra "int"
  junto al espacio y la barra inferior muestra "Respuesta correcta:" con el
  texto completo y "int" en el espacio. El espacio ya no se puede editar.
- [ ] [web, móvil] En "Resolviendo conflictos" (Git esencial, 6), con
  "head" en el primer espacio y "=====" en el segundo, el primero queda
  correcto y el segundo incorrecto (con "=======" junto a él), y la pregunta
  cuenta como fallada. "Comprobar" no se habilita mientras uno de los dos
  espacios esté vacío.
- [ ] [web, móvil] En "Curso de prueba de actividades", el espacio que acepta
  "canción" y "tema" da por correctas "Cancion", "CANCIÓN", "tema" y
  "canción  " (con espacios al final), y por incorrecta "canciones".
- [ ] [web, móvil] Un espacio no deja escribir más de 100 caracteres.
- [ ] [web] Tab pasa de un espacio al siguiente y Enter comprueba.

### Pregunta abierta

- [ ] [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1),
  "Comprobar" está deshabilitado hasta que escribo algo que no sean solo
  espacios.
- [ ] [web, móvil] Al escribir una respuesta y comprobar, mi respuesta queda
  visible y sin poder editarse, aparece la "Solución de referencia" ("Porque C
  es un lenguaje de tipado estático…") y los botones "La tuve bien" y "No la
  tuve"; "Continuar" no aparece hasta que elijo uno.
- [ ] [web, móvil] Al elegir "La tuve bien" la barra dice "¡Correcto!" y la
  pregunta cuenta como acertada; al elegir "No la tuve" la barra dice "A
  repasar" y cuenta como fallada.
- [ ] [web, móvil] El campo de la respuesta no deja escribir más de 2000
  caracteres.

### Lección completada

- [ ] [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1),
  acertando la opción múltiple, fallando el espacio y eligiendo "La tuve
  bien" en la pregunta abierta, al terminar veo "¡Lección completada!",
  "Primeros pasos" y "Acertaste 2 de 3", con una celebración breve.
- [ ] [web, móvil] En "Tu primer commit" (Git esencial, 2), que solo tiene
  teoría, al terminar veo "¡Lección completada!" sin "Acertaste…".
- [ ] [web, móvil] "Volver al curso" lleva al detalle del curso. Al abrir
  otra vez la misma lección, empieza desde la primera actividad, sin
  respuestas.
- [ ] [web, móvil] Con "reducir movimiento" activado, la barra de progreso
  avanza y la celebración aparece sin animaciones, y la opción incorrecta no
  se sacude.

### Salir

- [ ] [web, móvil] En la primera actividad, sin haber hecho nada, la X lleva
  directo al detalle del curso, sin preguntar.
- [ ] [web, móvil] Después de pasar de la primera actividad, o de elegir una
  opción en ella, la X muestra "¿Salir de la lección?" con "Perderás tu
  avance en esta lección.", "Salir" y "Seguir aquí". "Seguir aquí" me deja en
  la misma actividad con lo que había elegido o escrito; "Salir" lleva al
  detalle del curso.
- [ ] [web] El botón de volver del navegador a mitad de la lección hace lo
  mismo que la X.
- [ ] [móvil] El botón o gesto de atrás del teléfono a mitad de la lección
  hace lo mismo que la X.

### Contenido y acceso

- [ ] [web, móvil] En "Curso de prueba de actividades", la lección con
  `<b>hola</b>` y `<script>` en sus textos (teoría, tarjeta, pregunta,
  opciones, texto con espacios y solución) los muestra tal cual, sin
  negritas y sin ejecutar nada.
- [ ] [web, móvil] En "Curso de prueba de actividades", la lección sin
  actividades muestra "Esta lección todavía no tiene actividades." y "Volver
  al curso".
- [ ] [web] Una dirección de lección con un identificador inventado, o con
  una lección que es de otro curso, muestra "Esta lección no existe o ya no
  está disponible." y "Ver cursos", que lleva al catálogo.
- [ ] [backend] Pedir al servidor, sin pasar por un cliente, una lección de
  un curso en borrador responde exactamente igual que con un identificador
  que no existe; pedir una lección sin sesión se rechaza.

### Estados

- [ ] [web, móvil] Mientras carga la lección se ven la X y un indicador de
  carga; "Esta lección todavía no tiene actividades." no aparece ni por un
  instante.
- [ ] [web, móvil] Con el servidor apagado, al abrir una lección veo "No se
  pudo conectar con Brote. Inténtalo de nuevo en un momento." y
  "Reintentar"; al encender el servidor y pulsar "Reintentar" veo la primera
  actividad.
- [ ] [móvil] En modo avión, al abrir una lección veo "Sin conexión. Revisa
  tu conexión e inténtalo de nuevo." y "Reintentar"; al quitar el modo avión
  y pulsar "Reintentar" veo la primera actividad.
- [ ] [web, móvil] Con una lección ya abierta, apago el servidor (en el
  móvil, o activo el modo avión) y puedo terminarla hasta la pantalla de
  lección completada.
- [ ] [web, móvil] Dado que la sesión expiró, cuando abro una lección,
  entonces llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a
  entrar."; en la web, al entrar regreso a esa lección.

## Datos que toca

- **Leccion** (F02): ahora además tiene sus actividades, en orden. Una
  lección puede no tener ninguna.
- **Actividad**: ejercicio o bloque de teoría de una lección. Tiene un tipo
  y, según el tipo, sus propios datos. En esta feature hay cinco tipos:
  - Teoría: título (opcional), párrafos (obligatorio), código (opcional) y
    puntos clave (opcional, una lista de textos).
  - Tarjeta de memoria: frente y reverso (obligatorios).
  - Opción múltiple: pregunta (obligatoria), código (opcional), opciones
    (al menos dos; cada una es un texto o un símbolo) y cuál es la correcta
    (exactamente una).
  - Completar espacios: texto con uno o más espacios marcados (obligatorio)
    y, por cada espacio, una o más respuestas aceptadas.
  - Pregunta abierta: pregunta y solución de referencia (obligatorias).

  Los límites de longitud de cada texto y los demás tipos los definen F05 y
  las features de cada tipo. El glosario de cada actividad lo agrega F09.
- **Curso** (F02): solo para saber si está publicado y a qué curso pertenece
  la lección.

## Supuestos

- Los cursos de prueba solo traen las actividades de los cinco tipos de esta
  feature, en el orden en que están en el prototipo; las de los demás tipos
  no se cargan. Cada feature que agregue un tipo carga las actividades de ese
  tipo. Así, el sistema solo guarda actividades de tipos que sabe mostrar y
  validar. Hoy, todas las lecciones de los cursos del prototipo quedan con al
  menos una actividad.
- Los textos de las actividades del prototipo se cargan tal cual, sin
  corregirlos; solo cambia el formato en que se guardan. Los términos de
  glosario no se cargan.
- Para validar los criterios hace falta además un curso publicado "Curso de
  prueba de actividades" con: una lección con un espacio que acepta "canción"
  y "tema"; una lección con `<b>hola</b>` y `<script>` en los textos de una
  actividad de cada tipo; y una lección sin actividades.
- Se mezclan las opciones porque en el prototipo la correcta siempre es la
  primera.
- La tarjeta de memoria no se califica: en el prototipo tenía "Lo sabía" y "A
  repasar", pero en esta feature solo se voltea.
- La pregunta abierta pide escribir algo antes de ver la solución, para que
  el alumno intente responder antes de compararse.
- "Acertaste {aciertos} de {preguntas}" usa siempre esa forma, también con 1
  ("Acertaste 1 de 1").
- La pantalla de lección completada tendrá logros e insignias con F08; por
  ahora solo muestra los aciertos.
- La lección se carga completa al abrirla, así que perder la conexión a mitad
  no la interrumpe. Esto no es "cursar sin conexión" (F10): abrir una lección
  sigue necesitando conexión.
- En la web no se detecta "sin conexión" aparte: se muestra el mismo mensaje
  que con el servidor caído (igual que en F01 y F02).
- Recargar la página o cerrar la app no pide confirmación; solo la X y el
  botón de volver.
- En el móvil, una lección solo se abre desde el detalle de su curso.
- `specs/01-navegacion.md` y `specs/02-modelo-datos.md` se actualizan al
  cerrar la feature (reproductor en los dos clientes y la entidad Actividad).

## Aclaraciones

### Sesión 2026-11-02

- P: ¿Qué pasa con las actividades de los cursos del prototipo que son de
  tipos que no entran en F03? → R: No se cargan. Los cursos de prueba solo
  traen las actividades de los cinco tipos, en su orden original, y cada
  feature siguiente carga las de sus tipos.
- P: ¿En qué orden se muestran las opciones de una opción múltiple? → R:
  Mezcladas al azar cada vez que aparece la pregunta.
- P: ¿Qué pasa al salir a mitad de una lección? → R: Si el alumno ya hizo
  algo, se le pide confirmar ("¿Salir de la lección?", "Salir" / "Seguir
  aquí"); si no, sale directo al detalle del curso.
