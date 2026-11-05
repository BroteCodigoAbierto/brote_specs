# F06: Enviar un curso a revisión y publicarlo

**Estado**: Borrador
**Creada**: 2026-11-03
**Repos afectados**: backend | web
**Rama**: `feature/F06-publicar-curso` (en cada repo afectado)
**Descripción original**: "F06 Enviar un curso a revisión y publicarlo (solo web)."

## Objetivo

Que un autor pueda llevar su curso del editor al catálogo sin depender de que
alguien lo cargue a mano: lo envía a revisión, un administrador lo aprueba y los
alumnos ya pueden cursarlo. También define qué pasa cuando el autor quiere
corregir un curso que ya está publicado, que la decisión 0014 dejó para esta
feature.

## Actor

- **Autor**: usuario con sesión iniciada (F01) que envía a revisión, en la web,
  un curso que creó (F05).
- **Administrador**: persona con acceso a la base de datos que aprueba o
  rechaza los cursos en revisión. No es un rol de la aplicación y no tiene
  pantallas (decisión 0014).

## Precondiciones

- El autor tiene sesión iniciada. Sin sesión, cualquier pantalla de esta
  feature lleva a "Entrar" (F01).
- Usa la web: el móvil no tiene editor ni nada de esta feature (decisión 0003).
- El curso es suyo. Si no, se maneja en "Validaciones".
- Para enviar o retirar un curso hace falta llegar al servidor. Si no se puede,
  se maneja en "Casos de error".

## Datos de entrada

El autor no escribe nada: enviar y retirar son acciones sobre el curso que
tiene abierto.

- Motivo del rechazo: texto de varias líneas, opcional, hasta 1000 caracteres.
  Lo escribe el administrador en la base de datos al rechazar un curso.

## Flujo principal

### Estados de un curso

| De | A | Quién | Cómo |
|---|---|---|---|
| Borrador | En revisión | Autor | "Enviar a revisión" |
| En revisión | Borrador | Autor | "Retirar de revisión" |
| En revisión | Publicado | Administrador | Aprueba, en la base de datos |
| En revisión | Borrador | Administrador | Rechaza, en la base de datos |
| Publicado | Borrador | Autor | "Retirar del catálogo" |
| Publicado | Borrador | Administrador | Lo retira, en la base de datos |

No hay otro camino: el autor no puede publicar su curso por su cuenta.

### Ver los cursos que creé

1. En "Cursos que creé" (F05), cada curso muestra su estado: "Borrador", "En
   revisión" o "Publicado".
2. Todas las tarjetas abren el mapa del curso. Un borrador dice "Editar"; uno
   en revisión o publicado dice "Administrar".
3. Un borrador con la revisión rechazada muestra además "Revisión no aprobada".

### Enviar un curso a revisión

1. En el mapa de un borrador, junto a "Eliminar curso", está el botón "Enviar a
   revisión".
2. El autor lo pulsa. El sistema comprueba el curso como está guardado en ese
   momento, para no fallar por una lista vieja. Si no cumple el contenido mínimo
   (ver "Validaciones"), no pregunta nada y dice qué falta.
3. Si lo cumple, el autor confirma en "¿Enviar a revisión?", con el texto
   "Mientras esté en revisión no podrás editarlo. Un administrador lo revisará
   antes de publicarlo." y los botones "Cancelar" y "Enviar".
4. El sistema vuelve a comprobar el contenido con lo guardado. Si ya no lo cumple
   (por ejemplo, porque se eliminó algo en otra pestaña), no lo envía y dice qué
   falta.
5. Si lo cumple, el curso pasa a "En revisión" y el mapa muestra su estado en
   revisión, con el aviso "Curso enviado a revisión.".

### Retirar un curso de revisión

1. El mapa de un curso en revisión muestra su título, el estado "En revisión",
   "Este curso está en revisión y no se puede editar.", el texto "Un
   administrador lo revisará antes de publicarlo.", el botón "Retirar de
   revisión" y el enlace "Mi panel".
2. El autor pulsa "Retirar de revisión". No se pide confirmación, porque se
   deshace enviándolo otra vez.
3. El curso vuelve a "Borrador" y el mapa se puede editar, con el aviso "El curso
   volvió a borrador.".

### Aprobar un curso

1. El administrador revisa el contenido del curso y lo aprueba en la base de
   datos.
2. El curso pasa a "Publicado": aparece en el catálogo y se puede cursar en la
   web y en el móvil, y el autor lo ve como "Publicado" en "Cursos que creé".

### Rechazar un curso

1. El administrador rechaza el curso en la base de datos y puede dejar un motivo.
2. El curso vuelve a "Borrador", y en "Cursos que creé" muestra además "Revisión
   no aprobada".
3. El mapa muestra arriba el aviso "La revisión no se aprobó.", con el motivo si
   hay uno, y el texto "Corrígelo y envíalo otra vez.".
4. El autor corrige el curso y lo envía de nuevo. El aviso y "Revisión no
   aprobada" desaparecen al enviarlo.

### Editar un curso publicado

1. El mapa de un curso publicado muestra su título, el estado "Publicado", "Este
   curso está publicado y no se puede editar.", el texto "Para editarlo, retíralo
   del catálogo. Cuando termines, tendrás que enviarlo otra vez a revisión.", los
   botones "Ver curso" y "Retirar del catálogo" y el enlace "Mi panel".
2. El autor pulsa "Retirar del catálogo" y confirma en "¿Retirar este curso del
   catálogo?", con el texto "Los alumnos dejarán de verlo y no podrán cursarlo,
   pero conservarán su progreso. Para publicarlo otra vez tendrás que enviarlo a
   revisión." y los botones "Cancelar" y "Retirar".
3. El curso vuelve a "Borrador" y el mapa se puede editar, con el aviso "El curso
   se retiró del catálogo y volvió a borrador.".
4. El curso desaparece del catálogo, de "Sigue aprendiendo" (web) y de "Mis
   cursos" (móvil), y su detalle muestra "Este curso no existe o ya no está
   disponible.", como cualquier curso sin publicar (F02, F04).
5. El autor lo edita como cualquier borrador (F05) y lo envía a revisión. Al
   aprobarse, vuelve al catálogo y los alumnos recuperan su progreso (F04).

## Validaciones

- **Quién**: solo el autor de un curso puede enviarlo, retirarlo o abrir su mapa.
  Para cualquier otro usuario, un curso ajeno da la misma respuesta que uno que
  no existe. El servidor es quien decide.
- **Estado de partida**: solo se envía un borrador, solo se retira de revisión un
  curso en revisión y solo se retira del catálogo uno publicado. El servidor
  rechaza lo demás y no cambia nada.
- **Contenido mínimo para enviar**: el curso tiene al menos una lección y todas
  sus lecciones tienen al menos una actividad. El servidor lo comprueba con lo
  guardado.
  - Sin lecciones: el mapa muestra "No se envió: el curso no tiene lecciones.".
  - Con lecciones vacías: "No se envió: hay {n} lecciones sin actividades." (con
    una, "hay 1 lección sin actividades"), y cada una lleva una marca con icono,
    además del color, hasta la siguiente acción.
- **Cambios sin guardar**: con cambios sin guardar en los datos del curso, "Enviar
  a revisión" está deshabilitado, con la nota "Guarda los cambios para poder
  enviarlo.".
- **Lo que está en revisión no se edita**: lo que aprueba el administrador tiene
  que ser lo que se publica. El servidor rechaza cualquier cambio en un curso en
  revisión o publicado, en sus datos, en sus lecciones y en sus actividades, y
  también eliminarlo.
- **Lo que no está publicado sigue oculto**: un curso en revisión solo se ve en
  "Cursos que creé" y en su mapa. No aparece en el catálogo ni se abre su detalle
  o sus lecciones, ni siquiera con la cuenta de su autor (F02, F03).
- **Orden de "Cursos que creé"**: enviar y retirar cuentan como un cambio del
  autor y suben el curso al primer lugar (F05).
- **Textos**: el motivo del rechazo se muestra siempre como texto, con sus saltos
  de línea. Si contiene algo como `<b>hola</b>` o `<script>`, se ve tal cual y no
  se interpreta.
- **Mientras se envía o se retira**: no se puede repetir la acción. El botón
  muestra un indicador y lo demás del mapa queda deshabilitado.

## Estados de la pantalla

### Tarjeta en "Cursos que creé"

Los estados de la sección son los de F05. Cambia cada tarjeta:

- Borrador: "Borrador" y "Editar".
- Borrador con la revisión rechazada: "Borrador", "Revisión no aprobada" y
  "Editar".
- En revisión: "En revisión" y "Administrar".
- Publicado: "Publicado" y "Administrar".

### Mapa del curso

Cargando, No disponible y Error son los de F05. Los avisos de "Curso enviado a
revisión.", "El curso volvió a borrador." y "El curso se retiró del catálogo y volvió
a borrador." se ven hasta la siguiente acción o hasta salir del mapa. Además:

- Borrador: como en F05, con "Enviar a revisión".
- Borrador con la revisión rechazada: arriba, el aviso del rechazo.
- Comprobando: "Enviar a revisión" con un indicador, y lo demás del mapa
  deshabilitado. Si falla, aparece "No se pudo enviar el curso a revisión.".
- Confirmando: la pregunta "¿Enviar a revisión?" o "¿Retirar este curso del
  catálogo?", encima del mapa.
- Enviando: "Enviar" con un indicador en la confirmación.
- No se envió por el contenido: el curso sigue en borrador y aparece el aviso con
  lo que falta, con las lecciones vacías marcadas. Si la confirmación estaba
  abierta, se cierra.
- Error al enviar: la confirmación se cierra, el curso sigue en borrador y
  aparece "No se pudo enviar el curso a revisión.".
- En revisión: el título, el estado, el mensaje y "Retirar de revisión". Sin los
  datos del curso, sin la lista de lecciones y sin "Eliminar curso".
- Retirando de revisión: "Retirar de revisión" con un indicador. Si falla, el
  curso sigue en revisión y aparece "No se pudo retirar el curso de revisión.".
- Publicado: el título, el estado, el mensaje, "Ver curso" y "Retirar del
  catálogo". Sin los datos del curso, sin la lista de lecciones y sin "Eliminar
  curso".
- Retirando del catálogo: "Retirar" con un indicador en la confirmación. Si
  falla, la confirmación se cierra, el curso sigue publicado y aparece "No se
  pudo retirar el curso del catálogo.".

### Lienzo de la lección

Los estados son los de F05, salvo el estado Publicado, que cambia:

- En revisión: "Este curso está en revisión y no se puede editar." con el enlace
  "Volver al curso", que abre el mapa.
- Publicado: "Este curso está publicado y no se puede editar." con el enlace
  "Volver al curso".

## Resultado esperado

- Un curso aprobado está en el catálogo y se cursa en la web y en el móvil sin
  que nadie lo haya cargado a mano.
- Lo que se publica es exactamente lo que el autor envió, porque en revisión no
  cambia.
- El estado de cada curso se ve en "Cursos que creé" y sigue igual después de
  recargar la página y de cerrar sesión y volver a entrar.
- Un curso retirado se puede editar y volver a publicar, y sus alumnos conservan
  su progreso.

## Casos de error

- El servidor no responde o falla al enviar o retirar: el mensaje de esa acción
  (ver "Estados de la pantalla"). El curso sigue como estaba y el autor puede
  reintentar.
- El estado cambió en otro lugar (otra pestaña, o un administrador lo aprobó, lo
  rechazó o lo retiró): al enviar o retirar, el sistema no cambia nada, muestra
  "El estado de este curso cambió en otro lugar." y el mapa se actualiza con el
  estado real.
- El curso se envió a revisión mientras el autor lo editaba en otra pestaña: al
  guardar, o al agregar, reordenar o eliminar, ve "Este curso está en revisión y
  no se puede editar. Tus cambios no se guardaron.". Lo capturado sigue en
  pantalla.
- El curso se publicó mientras el autor lo editaba: lo mismo, con "Este curso está
  publicado y no se puede editar. Tus cambios no se guardaron.".
- El curso se eliminó en otra pestaña: al enviarlo o retirarlo ve "Este curso ya no
  existe.", sin más cambios en la pantalla.
- La sesión expiró al enviar o retirar: se llega a "Entrar" con el aviso "Tu
  sesión terminó. Vuelve a entrar." (F01). Al entrar se regresa al mapa, con lo
  capturado como en F05. La acción que falló no se repite sola.
- El curso se retira del catálogo mientras un alumno cursa una lección: la termina
  y ve "Esta lección ya no está disponible. Tu progreso no se guardó." (F03, F04).
- La dirección del mapa es de un curso de otra persona, aunque esté en revisión:
  "Este curso no existe o ya no está disponible." con "Ir a Mi panel" (F05).

## Fuera de alcance

- Pantalla de moderación y rol de administrador (decisión 0014): la aprobación y
  el rechazo se hacen en la base de datos.
- Avisar al autor por correo o con notificaciones: se entera al abrir "Mi panel".
- Publicar una versión nueva de un curso sin sacarlo del catálogo.
- Ver el contenido de un curso propio en revisión sin retirarlo.
- Fecha programada de publicación.
- Historial de revisiones y de motivos de rechazo: solo se ve el último.
- Cualquier pantalla nueva en el móvil (decisión 0003).
- Importar un curso como publicado (F07).

## Criterios de aceptación

<!--
  Datos de prueba: la cuenta autor, con "Git esencial" (publicado), "Curso en
  borrador" y "Curso en revisión" (ahora en revisión de verdad); una cuenta B sin
  cursos; un alumno con lecciones completadas en "Git esencial"; un borrador sin
  lecciones y otro con una lección vacía. Cómo aprobar, rechazar y retirar en la
  base lo dice el quickstart.md del plan.
-->

### Cursos que creé

- [x] [web] Con la cuenta autor, "Curso en borrador" muestra "Borrador" y "Editar";
  "Curso en revisión", "En revisión" y "Administrar"; y "Git esencial", "Publicado"
  y "Administrar".
- [x] [web] Las tres tarjetas abren el mapa de su curso.
- [x] [web] Al enviar a revisión el curso de abajo y volver a "Mi panel", ese curso
  queda primero.

### Enviar a revisión

- [x] [web] En el mapa de un borrador completo veo "Enviar a revisión". Al pulsarlo,
  pregunta "¿Enviar a revisión?" con "Mientras esté en revisión no podrás editarlo.
  Un administrador lo revisará antes de publicarlo.". "Cancelar" no cambia nada.
- [x] [web] Con un borrador sin lecciones, al pulsar "Enviar a revisión" no se
  pregunta nada: veo "No se envió: el curso no tiene lecciones." y sigue en borrador.
- [x] [web] Con dos lecciones vacías, al pulsar "Enviar a revisión" no se pregunta
  nada: veo "No se envió: hay 2 lecciones sin actividades." (con una, "No se envió:
  hay 1 lección sin actividades.") y esas lecciones llevan su marca con icono.
- [x] [web] Con el mapa abierto, vacío una lección en otra pestaña. Al confirmar el
  envío veo "No se envió: hay 1 lección sin actividades." y el curso sigue en
  borrador.
- [x] [web] Con el título del curso cambiado sin guardar, "Enviar a revisión" está
  deshabilitado y veo "Guarda los cambios para poder enviarlo.". Al guardar, se
  habilita.
- [x] [web] Con un borrador completo, al confirmar veo "Curso enviado a revisión." y
  el mapa muestra "Este curso está en revisión y no se puede editar.", sin los datos
  del curso, sin las lecciones y sin "Eliminar curso". Sigue así al recargar y al
  cerrar sesión y volver a entrar.
- [x] [web] Mientras se envía, "Enviar" muestra un indicador y no puedo repetir la
  acción.
- [x] [web] Con el servidor apagado, al confirmar veo "No se pudo enviar el curso a
  revisión." y el curso sigue en borrador; al encender el servidor y enviarlo otra
  vez, se envía.
- [x] [web, móvil] Un curso en revisión no aparece en el catálogo ni al buscar su
  título exacto, aunque entre con la cuenta de su autor.
- [x] [web] La dirección del detalle de un curso en revisión muestra "Este curso no
  existe o ya no está disponible.", también con la cuenta de su autor.

### Retirar de revisión

- [x] [web] "Retirar de revisión" deja el curso en "Borrador", sin preguntar, con el
  aviso "El curso volvió a borrador.", y el mapa se puede editar.
- [x] [web] Con el servidor apagado, veo "No se pudo retirar el curso de revisión." y
  el curso sigue en revisión.

### Aprobar

- [x] [web] Un administrador aprueba "Curso en revisión". Al recargar "Mi panel" lo
  veo como "Publicado", y su mapa muestra "Este curso está publicado y no se puede
  editar.", "Ver curso" y "Retirar del catálogo".
- [x] [web, móvil] Ese curso aparece en el catálogo, y un alumno lo cursa de principio
  a fin con su progreso guardado.
- [x] [web] "Ver curso" abre su detalle, y volver regresa al mapa.

### Rechazar

- [x] [web] Un administrador rechaza un curso con un motivo. En "Mi panel" lo veo como
  "Borrador" con "Revisión no aprobada", y su mapa muestra "La revisión no se aprobó.",
  el motivo con sus saltos de línea y "Corrígelo y envíalo otra vez.".
- [x] [web] Si lo rechaza sin motivo, veo lo mismo, sin motivo.
- [x] [web] Un motivo con `<b>hola</b>` y `<script>` se ve tal cual, sin negritas y sin
  ejecutar nada.
- [x] [web] Después de un rechazo, el curso se edita como cualquier borrador. Al
  enviarlo otra vez, el aviso y "Revisión no aprobada" desaparecen.

### Retirar del catálogo

- [x] [web] En el mapa de "Git esencial", "Retirar del catálogo" pregunta "¿Retirar
  este curso del catálogo?" con "Los alumnos dejarán de verlo y no podrán cursarlo,
  pero conservarán su progreso. Para publicarlo otra vez tendrás que enviarlo a
  revisión.". "Cancelar" no cambia nada.
- [x] [web] Al confirmar veo "El curso se retiró del catálogo y volvió a borrador." y
  el mapa se puede editar.
- [x] [web, móvil] El curso retirado no aparece en el catálogo, y su detalle muestra
  "Este curso no existe o ya no está disponible.".
- [x] [web, móvil] El curso retirado desaparece de "Sigue aprendiendo" (web) y de "Mis
  cursos" (móvil) para el alumno que lo había empezado.
- [x] [web, móvil] Con el curso retirado, le agrego una lección con actividades y lo
  envío; un administrador lo aprueba. El alumno ve otra vez sus lecciones completadas,
  y el total cuenta la lección nueva.
- [x] [web, móvil] Si el curso se retira mientras el alumno cursa una lección, al
  terminarla ve "Esta lección ya no está disponible. Tu progreso no se guardó.".
- [x] [web] Con el servidor apagado, al confirmar veo "No se pudo retirar el curso del
  catálogo." y el curso sigue publicado.

### Lienzo y cambios en otro lugar

- [x] [web] La dirección del lienzo de una lección de un curso en revisión muestra
  "Este curso está en revisión y no se puede editar."; la de uno publicado, "Este curso
  está publicado y no se puede editar.". En los dos casos, "Volver al curso" abre el
  mapa.
- [x] [web] Con el lienzo abierto en una pestaña, envío el curso a revisión en otra. Al
  guardar veo "Este curso está en revisión y no se puede editar. Tus cambios no se
  guardaron." y lo que escribí sigue en pantalla.
- [x] [web] Con el lienzo abierto, un administrador publica el curso. Al guardar veo
  "Este curso está publicado y no se puede editar. Tus cambios no se guardaron." y lo
  que escribí sigue en pantalla.
- [x] [web] Con el mapa de un curso en revisión abierto, un administrador lo aprueba. Al
  pulsar "Retirar de revisión" veo "El estado de este curso cambió en otro lugar." y el
  mapa muestra el curso publicado.
- [x] [web] Con el mapa de un borrador abierto en dos pestañas, lo envío en la primera.
  Al enviarlo en la segunda veo "El estado de este curso cambió en otro lugar." y el
  mapa muestra el curso en revisión.
- [x] [web] Con el mapa de un borrador abierto, elimino el curso en otra pestaña. Al
  enviarlo veo "Este curso ya no existe.".
- [x] [web] Dado que la sesión expiró, cuando confirmo el envío con un título escrito
  en "Nueva lección", llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a
  entrar."; al entrar con la misma cuenta regreso al mapa con ese título, y el curso
  sigue en borrador.
- [x] [web] Dado que la sesión expiró, cuando pulso "Retirar de revisión" o confirmo
  "Retirar del catálogo", llego a "Entrar" con el aviso; al entrar regreso al mapa y
  el curso sigue como estaba.

### Permisos

- [x] [web] Con la cuenta B, la dirección del mapa de "Curso en revisión" muestra "Este
  curso no existe o ya no está disponible." y "Ir a Mi panel".
- [x] [backend] Enviar o retirar sin sesión se rechaza. Enviar o retirar un curso de
  otra cuenta responde exactamente igual que con un identificador que no existe.
- [x] [backend] Enviar, sin pasar por un cliente, un curso sin lecciones o con una
  lección vacía se rechaza y sigue en borrador.
- [x] [backend] Enviar un curso en revisión o publicado, retirar de revisión un borrador
  y retirar del catálogo un borrador se rechazan y no cambian nada.
- [x] [backend] Cambiar los datos, una lección o el orden de un curso en revisión con la
  sesión de su autor, o eliminarlo, se rechaza y no cambia nada.

## Datos que toca

- **Curso** (F02, F05): ahora tiene tres estados: borrador, en revisión y publicado.
  Publicado sigue siendo lo único que lo hace público (principio III). Aquí importan:
  - el estado, que el autor cambia con enviar y retirar, y el administrador con
    aprobar y rechazar;
  - si la última revisión fue rechazada, y el motivo, hasta que se envía de nuevo;
  - cuándo cambió por última vez, que ordena "Cursos que creé".
- **Leccion** (F02, F05): solo se leen, para saber si el curso tiene lecciones y si
  alguna está vacía.
- **Progreso** (F04): no cambia. Se conserva al retirar el curso y vuelve a verse al
  publicarlo. Si se elimina un curso retirado, se borra con él (F05).
- **Usuario** (F01): autor del curso.

## Supuestos

- Enviar a revisión no vuelve a comprobar cada actividad: una lección solo se guarda
  con todas sus actividades completas (F05).
- Las actividades pueden ser solo teoría: una lección sin preguntas es válida (F04).
- Mientras un curso está en revisión, el autor no ve su contenido en el mapa. Si quiere
  revisarlo o corregirlo, lo retira de revisión.
- El autor puede retirar su curso de revisión en cualquier momento antes de que se
  apruebe, para no quedar bloqueado si el administrador tarda.
- Lo que hace el administrador en la base no cambia el orden de "Cursos que creé": solo
  lo cambia lo que hace el autor.
- Rechazar solo tiene sentido con un curso en revisión. Si el administrador lo intenta
  con uno publicado, la base lo rechaza.
- Un curso que un administrador publique sin pasar por revisión, como los datos de
  prueba, se ve como "Publicado" y funciona igual.
- Un curso retirado del catálogo se elimina como cualquier borrador, y con él se borra
  el progreso de sus alumnos, como ya aceptó F05. Uno en revisión o publicado hay que
  retirarlo primero.
- Volver a publicar un curso sigue lo que dijo F05: el resultado guardado de una lección
  que cambió se muestra como estaba, una lección borrada deja de contar y las nuevas
  suman al total.
- "Curso en revisión" de los datos de prueba pasa a estar en revisión de verdad.
- F06 reemplaza los textos de F05 "Este curso ya está publicado y por ahora no se puede
  editar." y su versión con "Tus cambios no se guardaron.", y el enlace "Ver curso" de
  la tarjeta y del lienzo de un curso publicado.
- En la web no se detecta "sin conexión" aparte: se muestra el mismo mensaje que con el
  servidor caído (igual que en F01 a F05).
- El móvil no tiene pantallas nuevas: solo recibe la copia del contrato. Los criterios
  que lo nombran comprueban que el catálogo y "Mis cursos" respetan el estado del curso.
- Al cerrar la feature se actualizan `specs/02-modelo-datos.md` (el estado y el rechazo,
  y lo que dice "hasta F06"), `specs/01-navegacion.md` (la tarjeta y el mapa de un curso
  publicado) y `docs/arquitectura.md` (la publicación de cursos).

## Aclaraciones

### Sesión 2026-11-03

- P: ¿Qué pasa cuando un autor quiere corregir un curso publicado (decisión 0014)?
  → R: Lo retira del catálogo, vuelve a ser borrador, lo edita y lo envía otra vez a
  revisión. Los alumnos conservan su progreso, pero no pueden cursarlo hasta que se
  apruebe de nuevo.
- P: ¿Cómo se entera el autor de que su curso fue rechazado, y de por qué? → R: El
  administrador puede dejar un motivo. El autor ve "Revisión no aprobada" en su
  tarjeta y, en el mapa, el aviso con el motivo, hasta que envía el curso otra vez.
- P: ¿Qué contenido se le exige a un curso para enviarlo a revisión? → R: Al menos una
  lección, y todas con al menos una actividad.
