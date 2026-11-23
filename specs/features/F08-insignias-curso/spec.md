# F08: Insignias por curso completado

**Estado**: Borrador
**Creada**: 2026-11-22
**Repos afectados**: backend | web | móvil
**Rama**: `feature/F08-insignias-curso` (en cada repo afectado)
**Descripción original**: "F08 Insignias por curso completado: el autor activa
en el editor (web) si su curso da insignia (apagado por defecto). Al completar
todas las lecciones de un curso con insignia, el alumno la gana y se le muestra
en la pantalla final de la lección ("¡Ganaste la insignia de <curso>!"). Una
insignia ganada no se pierde aunque el curso agregue lecciones o el autor la
desactive. El alumno ve sus insignias en "Mis insignias" (web: Mi panel; móvil:
pestaña Cuenta), con estado vacío. La insignia se ve como la portada del curso
en un círculo con un icono de medalla. Reemplaza el F08 anterior (puntos e
insignias por curso) en el MVP."

## Objetivo

Darle al alumno una recompensa visible por terminar un curso: una insignia por
cada curso completado, que se queda en su cuenta. Así terminar un curso se
siente como un logro y el alumno tiene un lugar donde ver lo que ya completó.
El autor decide si su curso da insignia.

## Actor

- **Autor**: usuario con sesión iniciada que crea y edita cursos en la web
  (F05). Activa o desactiva la insignia de su curso.
- **Alumno**: usuario con sesión iniciada que cursa lecciones de cursos
  publicados (F03, F04), en la web o en el móvil. Cualquier usuario puede serlo,
  incluido el autor con su propio curso publicado.

## Precondiciones

- El usuario tiene sesión iniciada. Sin sesión, cualquier pantalla de esta
  feature lleva a "Entrar" (F01).
- Registrar lecciones completadas (F04) funciona en los dos clientes.
- Para cambiar la opción de insignia, el curso es un borrador: un curso en
  revisión o publicado no se edita (F06).
- Ganar una insignia y ver "Mis insignias" necesita llegar al servidor. Si no se
  puede, se maneja en "Casos de error".

## Datos de entrada

- **Da insignia** (autor, web): sí o no, obligatorio. Por defecto **no**, en los
  cursos nuevos y en los que ya existían antes de F08. Se guarda junto con los
  demás datos del curso ("Guardar cambios" del mapa del curso, F05).

El alumno no escribe nada: la insignia sale de terminar lecciones.

## Flujo principal

### El autor activa la insignia (web)

1. El autor abre el mapa de su curso en borrador (F05).
2. En los datos del curso ve la opción "Dar una insignia a quien complete el
   curso", desactivada.
3. La activa y pulsa "Guardar cambios".
4. El sistema guarda la opción y muestra "Cambios guardados", como con los demás
   datos del curso.
5. Cuando el curso se publica (F06), los alumnos que lo completen ganan su
   insignia.

### El alumno gana una insignia (web y móvil)

1. El alumno cursa un curso publicado que da insignia.
2. Termina una lección y llega a "¡Lección completada!" (F03); el sistema la
   registra como completada (F04).
3. Si con esa lección el alumno ya tiene completadas todas las lecciones del
   curso, y todavía no tenía la insignia de ese curso, el sistema se la da.
4. En la misma pantalla final, además del resultado de la lección, aparece la
   insignia (la portada del curso en un círculo con una medalla) y el texto
   "¡Ganaste la insignia de *<título del curso>*!".
5. Si el alumno ya tenía esa insignia (por ejemplo, porque repite una lección),
   la pantalla final es la de siempre, sin el aviso.

### El alumno ve sus insignias (web y móvil)

1. El alumno abre "Mis insignias": en la web es una sección de "Mi panel"; en el
   móvil, una sección de la pestaña "Cuenta".
2. El sistema muestra sus insignias, de la más reciente a la más antigua. Cada
   una con la portada del curso en un círculo con una medalla, el título del
   curso y la fecha en que la ganó.

## Validaciones

- Un curso da insignia solo si su autor activó la opción. Activarla o
  desactivarla solo se puede en un borrador del que el usuario es autor.
- Un alumno tiene como mucho una insignia por curso.
- "Completó el curso" significa: tiene registrada como completada (F04) cada una
  de las lecciones que el curso tiene en ese momento.
- La insignia se gana al registrar una lección completada que cumple lo
  anterior, en un curso que en ese momento da insignia.
- Una insignia ganada no se pierde si el curso agrega lecciones, si el autor
  desactiva la opción o si el curso se retira del catálogo.
- El servidor decide si se gana la insignia; el cliente solo muestra lo que el
  servidor responde.

## Estados de la pantalla

### Opción de insignia en el mapa del curso (web)

- Curso en borrador: la opción se puede cambiar.
- Curso en revisión o publicado: la opción se ve con su valor, pero no se puede
  cambiar, igual que los demás datos del curso (F06). Como en esos cursos el mapa
  muestra la pantalla de un curso que no se edita, el valor va como texto, junto al
  idioma: "Da una insignia a quien lo complete" o "No da insignia a quien lo complete".
- Guardando: la opción no se puede cambiar mientras se guardan los datos del
  curso.

### Pantalla final de la lección (web y móvil)

- Sin insignia nueva: la de F03/F04, sin cambios.
- Con insignia nueva: además del resultado, la insignia y "¡Ganaste la insignia
  de *<curso>*!".
- Error al registrar la lección: el aviso de F04 con "Reintentar". La insignia no
  se muestra hasta que el registro sale bien; si al reintentar se gana, aparece
  entonces.

### "Mis insignias" (web: Mi panel; móvil: Cuenta)

- Cargando: un indicador en el lugar de la lista.
- Con datos: las insignias, de la más reciente a la más antigua.
- Vacío: "Todavía no tienes insignias. Completa un curso que dé insignia para
  ganar la primera."
- Error: "No se pudieron cargar tus insignias." con "Reintentar". El resto de la
  pantalla sigue funcionando.
- Sin conexión (móvil): el mensaje de sin conexión de la app, con "Reintentar".

## Resultado esperado

- El autor ve la opción guardada al volver a abrir el mapa del curso.
- El alumno que completa un curso con insignia la ve en la pantalla final y,
  desde entonces, en "Mis insignias" en la web y en el móvil (la insignia es de
  la cuenta, no del dispositivo). Sigue ahí después de cerrar sesión y volver a
  entrar.

## Casos de error

- **No se pudo guardar la opción** (sin conexión o error del servidor): el aviso
  de error de "Guardar cambios" (F05); la opción conserva lo que eligió el autor
  para que vuelva a intentarlo.
- **No se pudo registrar la lección** (F04): no se gana la insignia todavía; al
  reintentar con éxito se gana si corresponde.
- **No se pudo cargar "Mis insignias"**: estado de error con "Reintentar"; no
  afecta al resto de "Mi panel" ni de "Cuenta".
- **La portada del curso no carga**: se ve la portada generada (la inicial del
  título sobre su color), como en las tarjetas de curso (F13).
- **El curso de una insignia se retira del catálogo**: la insignia se sigue
  viendo en "Mis insignias" con su portada y su título.
- **El autor elimina el curso**: sus insignias se borran con él, como el
  progreso de sus lecciones (F04).

## Fuera de alcance

- Puntos, rachas, niveles o clasificaciones: quedan fuera del MVP (antes eran
  parte de F08).
- Mostrar en el catálogo o en el detalle del curso si un curso da insignia.
- Una imagen de insignia propia que suba el autor: la insignia usa la portada
  del curso.
- Abrir el curso desde una insignia de "Mis insignias".
- Dar insignias por completar un curso antes de que su autor activara la opción,
  sin terminar una lección después.
- Compartir insignias fuera de Brote.
- Ganar insignias sin conexión (F10).

## Criterios de aceptación

- [ ] [web] En el mapa de un curso en borrador aparece la opción "Dar una
  insignia a quien complete el curso", desactivada en un curso nuevo y en uno
  que ya existía.
- [ ] [web] Al activar la opción y pulsar "Guardar cambios" sale "Cambios
  guardados", y la opción sigue activada al recargar la página.
- [ ] [web] En un curso en revisión o publicado la opción se ve con su valor y
  no se puede cambiar.
- [ ] [web] Si guardar falla (con la API apagada), sale el aviso de error y la
  opción conserva lo que eligió el autor.
- [ ] [web, móvil] Dado un curso publicado con insignia, cuando el alumno termina
  la última lección que le faltaba, entonces la pantalla final muestra la
  insignia y "¡Ganaste la insignia de *<curso>*!".
- [ ] [web, móvil] Al repetir una lección de un curso cuya insignia ya tiene, la
  pantalla final no muestra el aviso.
- [ ] [web, móvil] Al terminar todas las lecciones de un curso sin insignia, la
  pantalla final no muestra ningún aviso y "Mis insignias" no cambia.
- [ ] [web, móvil] Al terminar una lección que no es la última que faltaba, no
  aparece el aviso.
- [ ] [web] "Mi panel" tiene la sección "Mis insignias" con las insignias del
  alumno, de la más reciente a la más antigua, cada una con la portada en un
  círculo con medalla, el título y la fecha.
- [ ] [móvil] La pestaña "Cuenta" tiene la sección "Mis insignias" con lo mismo.
- [ ] [web, móvil] Una cuenta sin insignias ve el estado vacío: "Todavía no
  tienes insignias. Completa un curso que dé insignia para ganar la primera."
- [ ] [web, móvil] Una insignia ganada en la web aparece en el móvil, y al revés.
- [ ] [web, móvil] Si el autor agrega una lección al curso o desactiva la opción,
  la insignia que el alumno ya ganó sigue en "Mis insignias".
- [ ] [web, móvil] Si falla el registro de la última lección, no aparece el
  aviso; al pulsar "Reintentar" y salir bien, aparece.
- [ ] [web, móvil] Con la API apagada, "Mis insignias" muestra el error con
  "Reintentar" y el resto de la pantalla sigue usable; al volver la API,
  "Reintentar" la carga.
- [ ] [web, móvil] Si la portada del curso no carga, la insignia muestra la
  portada generada.

## Datos que toca

- **Curso**: nuevo dato "da insignia" (sí o no, por defecto no), que cambia su
  autor en un borrador.
- **Insignia** (nueva): que un alumno completó un curso con insignia. Guarda el
  alumno, el curso y cuándo la ganó. Una por alumno y curso. Se borra si se
  elimina el curso.
- **Progreso** (F04): se usa para saber si el alumno ya completó todas las
  lecciones del curso.

## Supuestos

- La insignia se gana en el momento de registrar una lección completada. Un
  alumno que ya había completado el curso antes de que el autor activara la
  opción la gana al terminar de nuevo cualquier lección del curso.
- Como la opción solo se cambia en un borrador, para activarla en un curso
  publicado el autor primero lo retira del catálogo (F06), la activa y lo vuelve
  a enviar a revisión.
- El autor que cursa y completa su propio curso publicado también gana la
  insignia.
- La fecha de la insignia se muestra sin hora, en el formato de fecha que ya usa
  cada cliente.
- Los cursos de prueba incluyen al menos uno con insignia y uno sin ella, para
  poder validar.
- La pantalla final muestra a lo más una insignia, porque una lección pertenece
  a un solo curso.
