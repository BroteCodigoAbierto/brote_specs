# F04: Registrar y consultar el progreso

**Estado**: Borrador
**Creada**: 2026-11-02
**Repos afectados**: backend | web | móvil
**Rama**: `feature/F04-registrar-progreso` (en cada repo afectado)
**Descripción original**: "F04 Registrar y consultar el progreso, en web y
móvil. Al llegar a "¡Lección completada!", esa lección queda registrada como
completada para el alumno, con su resultado (cuántas acertó). El progreso es
de la cuenta, no del dispositivo: lo que completo en la web aparece en el
teléfono y al revés. En el detalle del curso, cada lección completada se ve
marcada y arriba aparece cuántas llevo del total (por ejemplo "2 de 6
lecciones") con una barra. Se puede repetir una lección ya completada; sigue
contando como completada. En el móvil, la pestaña "Mis cursos" muestra los
cursos que empecé, con su avance, y desde ahí abro cada uno; en la web hay un
lugar equivalente para seguir donde me quedé. Salir de una lección a medias no
guarda nada (como en F03). Fuera de alcance: puntos e insignias (F08),
glosario (F09), progreso sin conexión (F10) y guardar el avance dentro de una
lección."

## Objetivo

Que lo que el alumno aprende quede registrado en su cuenta: cada lección que
termina queda marcada como completada, con cuántas acertó, y el alumno ve en
cualquier dispositivo cuánto lleva de cada curso y por dónde seguir. Sin esto,
cada vez que vuelve a Brote empieza sin saber qué ya hizo.

## Actor

- **Alumno**: usuario con sesión iniciada (F01) que cursa lecciones de cursos
  publicados (F03). Cualquier usuario puede serlo, incluido el autor de un
  curso con su propio curso.

## Precondiciones

- El alumno tiene sesión iniciada. Sin sesión, cualquier pantalla de esta
  feature lleva a "Entrar" (F01).
- Para registrar una lección completada y para ver el progreso hace falta
  llegar al servidor. Si no se puede, se maneja en "Casos de error".
- El reproductor de lecciones de F03 funciona en los dos clientes.

## Datos de entrada

- Lección completada: identificador del curso y de la lección, obligatorios.
  Los da la lección que el alumno acaba de terminar.
- Resultado de la lección: cuántas preguntas acertó (entero, 0 o más) de
  cuántas preguntas tiene la lección (entero, 0 o más), obligatorio. Es el
  mismo "Acertaste {aciertos} de {preguntas}" que muestra F03.

El alumno no escribe nada: estos datos salen de terminar una lección.

## Flujo principal

### Registrar una lección completada

1. El alumno recorre una lección hasta el final, como en F03.
2. Al aparecer la pantalla "¡Lección completada!", el sistema registra en la
   cuenta del alumno que completó esa lección, con su resultado. Mientras lo
   hace, la pantalla lo indica (ver "Estados de la pantalla").
3. Cuando queda registrado, la pantalla indica "Progreso guardado".
4. El alumno pulsa "Volver al curso" y llega al detalle del curso, que ya
   muestra la lección marcada y el avance actualizado.

### Ver el progreso en el detalle del curso

1. El alumno abre el detalle de un curso (desde el catálogo, desde su panel
   en la web o desde "Mis cursos" en el móvil).
2. Arriba de la lista de lecciones ve su avance: "{completadas} de {total}
   lecciones" con una barra que se llena en esa proporción.
3. Debajo del avance hay un botón que abre la primera lección del curso que
   no ha completado, en el orden del curso:
   - "Empezar: {n}. {título}" si no ha completado ninguna.
   - "Continuar: {n}. {título}" si ya completó alguna.
   - Si completó todas, no hay botón y el avance dice además "Curso
     terminado".
4. En la lista, cada lección completada se ve marcada como completada y, si
   tiene preguntas, muestra el resultado de la última vez que la completó:
   "{aciertos} de {preguntas} aciertos".
5. Cualquier lección de la lista, completada o no, se puede abrir pulsándola,
   como en F03.

### Repetir una lección completada

1. El alumno abre una lección que ya completó (desde la lista del detalle).
2. La recorre como cualquier otra, desde la primera actividad.
3. Al terminarla, sigue contando como completada y su resultado pasa a ser el
   de este intento, aunque sea peor que el anterior.
4. Si sale a medias, no cambia nada: la lección sigue completada con el
   resultado anterior.

### Mis cursos (móvil)

1. El alumno abre la pestaña "Mis cursos", que está en la barra de pestañas
   junto a "Explorar" y "Cuenta".
2. Ve los cursos que empezó, del que avanzó más recientemente al más
   antiguo. Cada curso muestra su portada, título, autor y su avance
   ("{completadas} de {total} lecciones" con su barra) y, si completó todas,
   además "Curso terminado".
3. Pulsa un curso y se abre su detalle, encima de las pestañas, como desde
   "Explorar".
4. Desliza hacia abajo para volver a cargar la lista.

### Mi panel (web)

1. En el encabezado de la web hay un enlace "Mi panel", visible en todas las
   pantallas con el marco común.
2. El alumno lo pulsa y llega a su panel: una página personal con el título
   "Mi panel". En esta feature solo tiene la sección "Sigue aprendiendo";
   otras secciones (por ejemplo, cursos favoritos) llegarán con sus
   features.
3. "Sigue aprendiendo" muestra los cursos que empezó, con el mismo orden y
   los mismos datos que "Mis cursos" del móvil.
4. Pulsa un curso y llega a su detalle.

### Salir de una lección a medias

1. El alumno sale de una lección antes de terminarla (con la X, el botón de
   volver o el gesto de atrás), como en F03.
2. No se registra nada: ni la lección como completada ni lo que respondió.
   Si la lección ya estaba completada, sigue igual.

## Validaciones

- **Cuándo cuenta como completada**: una lección queda completada solo al
  llegar a la pantalla "¡Lección completada!". Abrirla, recorrer una parte o
  salir a medias no registra nada. Una lección sin preguntas (solo teoría o
  tarjetas) también se completa, sin resultado.
- **Una lección, un registro**: cada lección cuenta una sola vez por alumno.
  Repetirla no suma lecciones; solo reemplaza el resultado y la fecha por los
  del último intento.
- **El progreso es de la cuenta**: lo que se completa en un dispositivo se ve
  en los demás al cargar la pantalla. Dos cuentas distintas en el mismo
  dispositivo tienen progresos independientes.
- **Resultado coherente**: el servidor comprueba el resultado contra la
  lección: no acepta más aciertos que preguntas ni un número de preguntas
  distinto al que tiene la lección. El servidor no confía en los aciertos que
  mande el cliente sin comprobarlos (ver "Supuestos").
- **Solo lecciones disponibles**: solo se registran lecciones de cursos
  publicados y con el curso al que pertenecen, con las mismas reglas que
  abrirlas en F03. Una lección inexistente, de otro curso o de un curso no
  publicado da la misma respuesta.
- **Cada alumno ve solo su progreso**: el progreso de un alumno no lo ve
  nadie más, ni el autor del curso.
- **Avance de un curso**: "{completadas} de {total} lecciones" cuenta las
  lecciones que el curso tiene hoy. "{total}" es el mismo número de
  lecciones que muestra el detalle de F02. La barra está vacía con 0 y llena
  cuando completó todas. Para los lectores de pantalla se anuncia como
  "{completadas} de {total} lecciones completadas". Con un curso de una sola
  lección va en singular, como en F02: "{completadas} de 1 lección" y
  "{completadas} de 1 lección completada".
- **Curso empezado**: un curso aparece en "Mis cursos" y en "Sigue
  aprendiendo" cuando el alumno completó al menos una de sus lecciones. Los
  cursos terminados siguen apareciendo, con "Curso terminado". Un curso que
  deja de estar publicado no aparece, aunque el alumno tenga lecciones
  completadas en él.
- **Orden de los cursos empezados**: primero el curso en el que completó una
  lección más recientemente (contando las repeticiones).
- **Lección marcada**: una lección completada se distingue de las demás sin
  depender solo del color (con un icono de completada), y los lectores de
  pantalla la anuncian como "completada".
- **Botón Empezar / Continuar**: abre la primera lección sin completar en el
  orden del curso, aunque haya lecciones completadas después de ella (si
  completó la 1 y la 3, abre la 2).
- **Pantalla de lección completada**: "Volver al curso" no se puede pulsar
  mientras se guarda el progreso, para no llegar al detalle sin la lección
  marcada. El registro se intenta una sola vez por lección terminada; no se
  repite solo.

## Estados de la pantalla

### Lección completada (cambio sobre F03, web y móvil)

- Guardando: "¡Lección completada!", el título y "Acertaste…" como en F03;
  debajo, "Guardando tu progreso…" con un indicador de carga, y "Volver al
  curso" deshabilitado, mostrando que espera.
- Guardado: debajo del resultado, "Progreso guardado" con un icono de
  completado; "Volver al curso" habilitado.
- Error: un aviso "No se pudo guardar tu progreso." con el botón
  "Reintentar"; "Volver al curso" habilitado. El resultado sigue en
  pantalla.
- Sin conexión (móvil): un aviso "Sin conexión. Tu progreso no se guardó."
  con el botón "Reintentar"; "Volver al curso" habilitado.
- Lección no disponible: un aviso "Esta lección ya no está disponible. Tu
  progreso no se guardó." sin "Reintentar"; "Volver al curso" habilitado.

### Detalle del curso (cambio sobre F02 y F03, web y móvil)

- Cargando y errores: como en F02. El progreso carga junto con el detalle:
  no aparece primero el curso y después el progreso.
- Con datos, sin lecciones completadas: "0 de {total} lecciones" con la
  barra vacía y el botón "Empezar: 1. {título}".
- Con datos, con algunas completadas: "{completadas} de {total} lecciones",
  la barra en proporción, el botón "Continuar: {n}. {título}" y las lecciones
  completadas marcadas con su resultado.
- Con datos, curso terminado: "{total} de {total} lecciones", la barra llena,
  "Curso terminado" y ningún botón; todas las lecciones marcadas.
- Sin lecciones: "Este curso todavía no tiene lecciones." como en F02, sin
  avance ni botón.
- Al volver de una lección (con "Volver al curso", la X o atrás), el detalle
  muestra el progreso actualizado sin que el alumno tenga que recargar.
- Al volver (móvil): el detalle se vuelve a cargar sin indicador de carga;
  mientras llega, se ve el avance anterior. Si no se puede cargar, el
  detalle sigue en pantalla con el aviso de error o de sin conexión encima y
  "Reintentar".

### Mis cursos (móvil) y Mi panel (web)

- Cargando: un indicador de carga.
- Con datos: la lista de cursos empezados, con su avance.
- Vacío: "Todavía no empiezas ningún curso." con el texto "Cuando completes
  tu primera lección, aquí verás tu avance." y el botón "Explorar cursos",
  que lleva al catálogo (en el móvil, a la pestaña "Explorar").
- Error: "No se pudo conectar con Brote. Inténtalo de nuevo en un momento."
  con el botón "Reintentar".
- Sin conexión (móvil): "Sin conexión. Revisa tu conexión e inténtalo de
  nuevo." con el botón "Reintentar".
- Recarga (móvil): al deslizar hacia abajo con cursos en pantalla, los
  cursos se quedan visibles mientras carga; si falla, siguen visibles y
  aparece el mensaje de error o de sin conexión.
- Al volver a la pestaña "Mis cursos" (móvil) o entrar a "Mi panel" (web),
  la lista se vuelve a cargar, para mostrar lo completado en otro
  dispositivo o en otra pantalla. En el móvil, sin indicador de carga y, si
  falla, como en la recarga: los cursos siguen visibles y aparece el
  mensaje de error o de sin conexión.

## Resultado esperado

- Cada lección que el alumno termina queda registrada en su cuenta como
  completada, con el resultado de la última vez. Sigue ahí después de cerrar
  sesión y volver a entrar, de recargar la página o de cerrar y abrir la app,
  y en el otro cliente con la misma cuenta.
- El detalle de cada curso muestra cuánto lleva el alumno, qué lecciones
  completó y con qué resultado, y le ofrece la siguiente lección.
- El alumno encuentra los cursos que empezó en "Mis cursos" (móvil) y en "Mi
  panel" (web), y desde ahí vuelve a cada uno.
- Salir de una lección a medias no deja nada registrado.

## Casos de error

- El servidor no responde o falla al guardar el progreso: "No se pudo
  guardar tu progreso." con "Reintentar". Si el alumno pulsa "Volver al
  curso" sin que se haya guardado, la lección no queda completada (o, si ya
  lo estaba, conserva el resultado anterior). En el móvil, 15 segundos sin
  respuesta cuentan como que el servidor no responde (igual que en F01 a
  F03).
- Sin conexión en el móvil al terminar la lección (por ejemplo, la conexión
  se perdió a mitad, que F03 permite): "Sin conexión. Tu progreso no se
  guardó." con "Reintentar". Al recuperar la conexión y pulsar
  "Reintentar", se guarda. No se guarda para después: eso es F10.
- El curso deja de estar publicado mientras el alumno cursa la lección: la
  termina (F03), pero al guardar ve "Esta lección ya no está disponible. Tu
  progreso no se guardó.".
- La sesión expiró al guardar: se llega a "Entrar" con el aviso "Tu sesión
  terminó. Vuelve a entrar." (F01). Esa lección no queda registrada.
- El servidor no responde al abrir "Mis cursos", "Mi panel" o el detalle del
  curso: el mensaje de error con "Reintentar" (y, en el móvil, el de sin
  conexión), como en "Estados de la pantalla".
- Un curso con lecciones completadas deja de estar publicado: desaparece de
  "Mis cursos" y de "Mi panel", y su detalle muestra "Este curso no existe o
  ya no está disponible." (F02). Si vuelve a publicarse, el alumno conserva
  lo que había completado.
- El alumno completa la misma lección en dos dispositivos casi al mismo
  tiempo: cuenta una sola vez, y queda el resultado del que se guardó al
  último.

## Fuera de alcance

- Puntos, insignias, logros y rachas (F08 y "Rachas de días seguidos").
- Glosario (F09).
- Guardar el progreso sin conexión para enviarlo después, y la parte de
  cursos descargados de "Mis cursos" (F10).
- Guardar el avance dentro de una lección o retomarla en la actividad donde
  se dejó: una lección se completa entera o no cuenta.
- Guardar las respuestas de cada pregunta o un historial de intentos: solo
  se guarda el resultado del último.
- Borrar el progreso de un curso o reiniciarlo.
- Otras secciones de "Mi panel", como cursos favoritos (llegarán con sus
  features).
- Que el autor vea el progreso de sus alumnos o estadísticas de su curso.
- Ir directo a la lección siguiente desde la pantalla de lección completada
  (sigue como en F03).
- Actualizar el progreso en vivo en una pantalla ya abierta cuando se
  completa una lección en otro dispositivo: se ve al volver a cargarla.

## Criterios de aceptación

<!--
  Datos de prueba: los cuatro cursos del prototipo publicados, con sus
  actividades de F03, y dos cuentas: una nueva, sin progreso ("cuenta A"), y
  otra ("cuenta B"). Cómo prepararlas lo dice el quickstart.md del plan.
-->

### Registrar

- [ ] [web, móvil] Con la cuenta A, al terminar "1. ¿Qué es el control de
  versiones?" (Git esencial) acertando sus dos preguntas, veo "¡Lección completada!", "Guardando tu
  progreso…" con "Volver al curso" deshabilitado y después "Progreso
  guardado" con "Volver al curso" habilitado.
- [ ] [web, móvil] Al pulsar "Volver al curso", el detalle de "Git esencial"
  muestra "1 de 6 lecciones", la barra con una sexta parte llena, la lección
  1 marcada como completada con "2 de 2 aciertos" y el
  botón "Continuar: 2. Tu primer commit", sin recargar.
- [ ] [web, móvil] Al terminar "2. Tu primer commit", que solo tiene
  teoría, queda marcada como completada sin resultado, y el detalle dice "2
  de 6 lecciones".
- [ ] [web, móvil] Si salgo de "3. Viajar en el tiempo: historial y diffs"
  a mitad (con la X y "Salir"), el detalle sigue diciendo "2 de 6
  lecciones" y la lección 3 no está marcada.
- [ ] [web] Al recargar la página a mitad de una lección no completada, la
  lección sigue sin marcar en el detalle.
- [ ] [móvil] Al cerrar la app a mitad de una lección no completada y
  volver a abrirla, la lección sigue sin marcar en el detalle.

### De la cuenta, no del dispositivo

- [ ] [web, móvil] Dado que con la cuenta A completé la lección 1 de "Git
  esencial" en la web, cuando entro con la cuenta A en el móvil y abro el
  detalle de "Git esencial", entonces la lección 1 aparece completada con el
  mismo resultado. Y al revés: lo que completo en el móvil aparece en la
  web.
- [ ] [web, móvil] Al cerrar sesión, entrar con la cuenta B y abrir "Git
  esencial", no aparece ninguna lección completada y veo "0 de 6
  lecciones"; al volver a la cuenta A, su progreso sigue ahí.
- [ ] [backend] Pedir al servidor el progreso sin sesión se rechaza; con la
  sesión de la cuenta B no aparece nada de lo que completó la cuenta A.

### Repetir

- [ ] [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1),
  completándola primero con "Acertaste 1 de 3" y luego otra vez con
  "Acertaste 3 de 3", el detalle muestra "3 de 3 aciertos"; repitiéndola
  una tercera vez con "Acertaste 2 de 3", muestra "2 de 3 aciertos". El
  avance del curso sube en una lección con el primer intento y no cambia con
  los otros dos.
- [ ] [web, móvil] Al abrir una lección ya completada empieza desde la
  primera actividad, sin respuestas; si salgo a medias, sigue completada con
  el resultado anterior.

### Detalle del curso

- [ ] [web, móvil] En un curso sin lecciones completadas veo "0 de {total}
  lecciones", la barra vacía y "Empezar: 1. {título de la primera}", que abre
  esa lección.
- [ ] [web, móvil] En "Git esencial", con las lecciones 1 y 3 completadas,
  el botón dice "Continuar: 2. Tu primer commit" y abre esa lección.
- [ ] [web, móvil] Con todas las lecciones de un curso completadas veo
  "{total} de {total} lecciones", la barra llena, "Curso terminado" y ningún
  botón Empezar ni Continuar; cualquier lección se puede abrir desde la
  lista.
- [ ] [web, móvil] Mientras carga el detalle, el avance no aparece en "0 de
  {total}" ni por un instante antes de mostrar el real.
- [ ] [web, móvil] Con un lector de pantalla, la barra se anuncia como
  "{completadas} de {total} lecciones completadas" y cada lección
  completada como "completada".

### Mis cursos (móvil)

- [ ] [móvil] La barra de pestañas tiene "Explorar", "Mis cursos" y
  "Cuenta".
- [ ] [móvil] Con la cuenta B sin progreso, "Mis cursos" muestra "Todavía
  no empiezas ningún curso." y "Explorar cursos", que lleva a la pestaña
  "Explorar".
- [ ] [móvil] Con lecciones completadas en "Git esencial" y luego en
  "Japonés sencillo", "Mis cursos" muestra primero "Japonés sencillo" y
  después "Git esencial", cada uno con su "{completadas} de {total}
  lecciones" y su barra; no aparecen los cursos que no empecé.
- [ ] [móvil] Al completar después una lección de "Git esencial" y volver a
  "Mis cursos", "Git esencial" pasa al primer lugar con el avance
  actualizado.
- [ ] [móvil] Pulsar un curso abre su detalle encima de las pestañas;
  volver regresa a "Mis cursos".
- [ ] [móvil] Un curso con todas sus lecciones completadas muestra "Curso
  terminado".
- [ ] [móvil] Con una lección completada en la web mientras "Mis cursos"
  está abierta en el móvil, al deslizar hacia abajo aparece el avance nuevo.

### Mi panel (web)

- [ ] [web] El encabezado tiene el enlace "Mi panel" en todas las pantallas
  con el marco común, y lleva a la página "Mi panel" con la sección "Sigue
  aprendiendo".
- [ ] [web] Con la cuenta B sin progreso, "Sigue aprendiendo" muestra
  "Todavía no empiezas ningún curso." y "Explorar cursos", que lleva al
  catálogo.
- [ ] [web] "Sigue aprendiendo" muestra los mismos cursos, en el mismo orden
  y con el mismo avance que "Mis cursos" del móvil con la misma cuenta.
  Pulsar un curso lleva a su detalle.

### Errores y estados

- [ ] [web, móvil] Con el servidor apagado justo antes de terminar una
  lección, la pantalla de lección completada muestra "No se pudo guardar tu
  progreso." y "Reintentar"; al encender el servidor y pulsar "Reintentar",
  aparece "Progreso guardado" y la lección queda completada.
- [ ] [web, móvil] Si en ese error pulso "Volver al curso" sin reintentar,
  la lección no queda completada en el detalle.
- [ ] [móvil] En modo avión al terminar una lección veo "Sin conexión. Tu
  progreso no se guardó." y "Reintentar"; al quitar el modo avión y pulsar
  "Reintentar", se guarda.
- [ ] [web, móvil] Si el curso deja de estar publicado mientras curso una
  lección, al terminarla veo "Esta lección ya no está disponible. Tu progreso
  no se guardó." sin "Reintentar", y el curso ya no aparece en "Mis cursos" ni
  en "Mi panel". Al volver a publicarlo, reaparece con lo que había
  completado.
- [ ] [web, móvil] Con el servidor apagado, "Mis cursos" (móvil) y "Mi
  panel" (web) muestran "No se pudo conectar con Brote. Inténtalo de nuevo en
  un momento." y "Reintentar"; al encender el servidor y pulsar "Reintentar",
  aparece la lista.
- [ ] [móvil] En modo avión, "Mis cursos" muestra "Sin conexión. Revisa tu
  conexión e inténtalo de nuevo." y "Reintentar".
- [ ] [móvil] Si al volver de una lección completada al detalle del curso no
  hay conexión, el detalle sigue en pantalla con "Sin conexión. Revisa tu
  conexión e inténtalo de nuevo." encima y "Reintentar"; al quitar el modo
  avión y pulsar "Reintentar", la lección aparece marcada.
- [ ] [web, móvil] Dado que la sesión expiró, cuando abro "Mis cursos" o "Mi
  panel", entonces llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a
  entrar.".
- [ ] [web, móvil] Dado que la sesión expiró mientras cursaba una lección,
  cuando la termino, llego a "Entrar" con el aviso "Tu sesión terminó.
  Vuelve a entrar."; al volver a entrar, esa lección no está completada.
- [ ] [backend] Registrar, sin pasar por un cliente, una lección de un curso
  en borrador responde exactamente igual que con un identificador que no
  existe; registrar más aciertos que preguntas, o un número de preguntas que
  no es el de la lección, se rechaza y no cambia el progreso.

## Datos que toca

- **Progreso** (nueva): que un alumno completó una lección. Por cada alumno
  y lección hay a lo sumo uno, con:
  - el alumno (Usuario, F01) y la lección (Leccion, F02);
  - cuántas acertó y cuántas preguntas tenía la lección, del último intento;
  - cuándo la completó por última vez (ordena "Mis cursos" y "Sigue
    aprendiendo").
- **Curso** (F02): para saber si está publicado, cuántas lecciones tiene y
  los datos de las tarjetas.
- **Leccion** (F02, F03): su orden (para "Empezar" / "Continuar") y cuántas
  preguntas tiene (para comprobar el resultado).
- **Usuario** (F01): dueño del progreso.

## Supuestos

- Un curso cuenta como empezado solo con una lección completada: como el
  avance dentro de una lección no se guarda, abrir una lección y salir no lo
  agrega a "Mis cursos".
- "Volver al curso" espera a que termine de guardarse para que el detalle ya
  muestre la lección marcada. Si el guardado falla, el alumno puede irse
  igual; la lección no queda registrada. En el móvil, el detalle que quedó
  debajo de la lección se vuelve a cargar al volver, así que la marca
  aparece en cuanto llega la respuesta (una fracción de segundo).
- En el detalle, el resultado de cada lección se muestra como "{aciertos} de
  {preguntas} aciertos", también con 1 ("1 de 1 aciertos"), para no
  confundirlo con "{completadas} de {total} lecciones".
- Si el autor cambia una lección después de que el alumno la completó (F05),
  el resultado guardado se muestra como estaba; si borra lecciones, el
  avance cuenta solo las que el curso tiene hoy, y si agrega, el total
  crece. Con F05 se revisa.
- Cómo comprueba el servidor que los aciertos son reales lo decide el plan.
  La research de F03 (punto 2) deja anotado que el cliente califica y que
  F04 no puede confiar en los aciertos que mande. La pregunta abierta se
  autoevalúa, así que ese acierto siempre depende de lo que diga el alumno.
- "Mis cursos" y "Sigue aprendiendo" muestran todos los cursos empezados, sin
  paginar: en el MVP un alumno empieza pocos cursos.
- La tarjeta de un curso empezado abre su detalle; la lección siguiente se
  abre desde ahí con "Continuar".
- "Mi panel" es una página nueva de la web, enlazada desde el encabezado. El
  catálogo sigue siendo la página de inicio. El panel crecerá con otras
  secciones (por ejemplo, cursos favoritos), cada una en su feature.
- En la web no se detecta "sin conexión" aparte: se muestra el mismo mensaje
  que con el servidor caído (igual que en F01 a F03).
- `specs/01-navegacion.md` (pestaña "Mis cursos", página "Mi panel" y el
  enlace del encabezado) y `specs/02-modelo-datos.md` (entidad Progreso) se
  actualizan al cerrar la feature.

## Aclaraciones

### Sesión 2026-11-02

- P: ¿Dónde está en la web el equivalente a "Mis cursos" del móvil? → R: En
  una página propia, un panel personal ("Mi panel"), enlazada desde el
  encabezado. Por ahora solo tiene el progreso ("Sigue aprendiendo"); a
  futuro tendrá otras secciones, como cursos favoritos.
- P: Al repetir una lección completada, ¿qué resultado se guarda y se
  muestra? → R: El del último intento, aunque sea peor que el anterior.
- P: ¿El detalle del curso tiene un botón para seguir? → R: Sí: "Empezar"
  si no ha completado ninguna lección y "Continuar" si ya completó alguna;
  abre la primera lección sin completar en el orden del curso. Con el curso
  terminado no aparece.
