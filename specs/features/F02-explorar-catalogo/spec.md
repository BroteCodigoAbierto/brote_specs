# F02: Explorar el catálogo de cursos publicados

**Estado**: Borrador
**Creada**: 2026-10-26
**Repos afectados**: backend | web | móvil
**Rama**: `feature/F02-explorar-catalogo` (en cada repo afectado)
**Descripción original**: "F02" (feature del MVP en `specs/00-proyecto.md`:
"Explorar el catálogo de cursos publicados", en web y móvil).

## Objetivo

Que cualquier usuario vea qué cursos hay en Brote, encuentre uno que le
interese y vea de qué trata y qué lecciones tiene antes de empezarlo. El
catálogo pasa a ser el inicio de Brote en la web y en el móvil, y es la
entrada para cursar (F03).

## Actor

- **Usuario**: persona con sesión iniciada (F01). Si además es autor de algún
  curso, en el catálogo ve exactamente lo mismo que cualquier otro usuario.

## Precondiciones

- El usuario tiene sesión iniciada. Sin sesión, cualquier pantalla de esta
  feature lleva a "Entrar" (F01).
- Para ver el catálogo o el detalle de un curso hace falta llegar al
  servidor. Si no se puede, se maneja en "Casos de error".
- Hay cursos publicados. Mientras no existan el editor (F05), la publicación
  (F06) ni la importación (F07), los cursos de prueba se cargan directamente
  en el sistema a partir de los cursos del prototipo
  (`referencia/cursos-prototipo/`). Si no hay ninguno, se maneja en "Estados
  de la pantalla".

## Datos de entrada

- Texto de búsqueda: texto, opcional, hasta 100 caracteres. Busca en el
  título, la descripción y el nombre del autor de los cursos.
- Curso que se abre: identificador de un curso, obligatorio. Viene de la
  tarjeta que se pulsa en el catálogo o, en la web, de la dirección de la
  página.

## Flujo principal

### Ver el catálogo

1. El usuario abre Brote con sesión iniciada, o entra o crea su cuenta.
2. Llega al catálogo, que es el inicio: `/` en la web y la pestaña
   "Explorar" en el móvil (antes "Inicio").
3. El sistema muestra los primeros 10 cursos publicados, ordenados por
   título.
4. Cada curso aparece como una tarjeta con su portada, su título, "Por
   {nombre del autor}", el inicio de su descripción y cuántas lecciones tiene.

### Ver más cursos

1. En el móvil, el usuario llega al final de la lista; en la web, pulsa "Ver
   más", que está al final de la lista.
2. El sistema carga los siguientes 10 cursos y los agrega al final, sin
   quitar los que ya estaban.
3. Cuando ya están todos, no se cargan más: en la web desaparece "Ver más".

Los resultados de una búsqueda también llegan de 10 en 10, de la misma
forma.

### Buscar un curso

1. El usuario escribe en el buscador ("Buscar cursos").
2. Los resultados se actualizan solos mientras escribe, sin pulsar Enter ni
   ningún botón: el catálogo muestra solo los cursos publicados que coinciden
   (ver "Validaciones"), en el mismo orden.
3. Si vacía el buscador, o pulsa "Borrar búsqueda" cuando no hay resultados,
   vuelve a ver el catálogo completo, desde sus primeros 10 cursos.

### Ver el detalle de un curso

1. El usuario pulsa la tarjeta de un curso.
2. El sistema abre el detalle del curso: portada, título, "Por {nombre del
   autor}", descripción completa, número de lecciones y la lista de lecciones
   en el orden del curso, numeradas y con su título.
3. El usuario vuelve al catálogo con el botón de volver (del navegador o de
   la app) y lo encuentra como lo dejó: la misma búsqueda, los mismos cursos
   ya cargados y en la misma posición de la lista.

En la web, el catálogo con su búsqueda y el detalle de cada curso tienen su
propia dirección: se pueden recargar, guardar en favoritos o abrir
directamente (si no hay sesión, después de entrar se llega a esa dirección,
como en F01). Recargar el catálogo, o abrir su dirección, muestra esa
búsqueda desde sus primeros 10 resultados.

### Recargar (móvil)

1. En el catálogo o en el detalle de un curso, el usuario desliza hacia
   abajo.
2. El sistema vuelve a pedir los datos y actualiza la pantalla. En el
   catálogo, la lista vuelve a empezar desde sus primeros 10 cursos.

## Validaciones

- Solo se ven cursos publicados. Un curso en borrador o en revisión no
  aparece en el catálogo ni en la búsqueda, y su detalle no se puede abrir,
  ni siquiera con la cuenta de su autor (sus cursos sin publicar los verá en
  "Mis cursos", F05). El servidor es quien filtra: un cliente nunca recibe
  cursos sin publicar.
- Orden: por título, de la A a la Z, sin importar mayúsculas, acentos ni los
  signos al inicio ("¿Cómo se dice hola?" va con la C). Si dos cursos tienen
  el mismo título, primero el que se creó antes. La búsqueda respeta el mismo
  orden.
- De 10 en 10:
  - El catálogo y los resultados de una búsqueda llegan de 10 en 10, en el
    orden de arriba. El servidor nunca entrega más de 10 cursos de una vez.
  - Un curso nunca aparece dos veces en la lista, y no falta ninguno de los
    que siguen publicados, aunque mientras el usuario carga más se publique o
    se retire algún curso. Un curso publicado mientras tanto puede no
    aparecer hasta recargar.
  - Mientras se cargan los siguientes 10, no se piden otra vez: pulsar "Ver
    más" varias veces seguidas (web) o seguir deslizando (móvil) los carga una
    sola vez.
  - Al cambiar el texto de búsqueda, la lista vuelve a empezar desde los
    primeros 10 resultados.
- Búsqueda:
  - Al texto se le quitan los espacios al inicio y al final. Un texto vacío o
    formado solo por espacios muestra el catálogo completo.
  - Un curso coincide si **cada palabra** del texto aparece en su título, en
    su descripción o en el nombre de su autor, en cualquier orden y aunque sea
    parte de una palabra más larga: "sencill" encuentra "Japonés sencillo" y
    "Programación en C sencilla"; "sencillo japones" encuentra "Japonés
    sencillo". Cada palabra puede estar en un lugar distinto: "git" seguido
    del nombre del autor encuentra "Git esencial".
  - El autor se busca por su nombre para mostrar actual. Como el nombre puede
    repetirse entre usuarios, buscar un nombre muestra los cursos de todos los
    autores que se llaman así.
  - No importan las mayúsculas ni los acentos, y la ñ cuenta como n:
    "JAPONES" encuentra "Japonés sencillo" y "programacion" encuentra
    "Programación en C sencilla".
  - El buscador no deja escribir más de 100 caracteres. El servidor también
    rechaza una búsqueda de más de 100 caracteres.
  - Lo que se muestra corresponde siempre al último texto escrito, nunca a uno
    anterior, aunque el usuario escriba y borre rápido.
- Textos de los cursos (título, descripción, títulos de las lecciones y
  nombre del autor): se muestran siempre como texto. Si contienen algo como
  `<b>hola</b>` o `<script>`, se ve tal cual y no se interpreta. Los saltos de
  línea de la descripción se respetan en el detalle.
- Portada: en el MVP es generada, sin imagen. Muestra la inicial del título
  en mayúscula sobre un color de una paleta fija de Brote. La inicial es la
  primera letra o número del título, sin contar signos como "¿" o "¡" (la
  de "¿Cómo se dice hola?" es "C"); si el título no tiene letras ni números,
  es su primer carácter. El color depende solo del curso: es el mismo en la
  tarjeta, en el detalle, al recargar y en la web y el móvil. Dos cursos
  distintos pueden tener el mismo color.
- Tarjeta: el título se corta a dos líneas y la descripción a tres, con "…"
  al final. En el detalle se ven completos.
- Número de lecciones: "1 lección", "2 lecciones", etc. Un curso sin
  lecciones dice "Sin lecciones" en su tarjeta.

## Estados de la pantalla

### Catálogo (web y móvil)

- Cargando: un indicador de carga en lugar de la lista. "Todavía no hay
  cursos publicados." no aparece ni un instante si sí hay cursos.
- Con datos: las tarjetas de los cursos, con el buscador arriba. En la web,
  "Ver más" al final mientras queden cursos por cargar.
- Cargando más: un indicador al final de la lista; los cursos ya cargados
  siguen visibles y, en la web, "Ver más" queda deshabilitado.
- Error al cargar más: los cursos ya cargados siguen visibles y al final
  aparece el mensaje de error (o, en el móvil, el de sin conexión) con
  "Reintentar", que vuelve a pedir los mismos 10.
- Vacío (no hay ningún curso publicado): "Todavía no hay cursos publicados.",
  sin buscador.
- Sin resultados: "No hay cursos que coincidan con «{texto}»." y el botón
  "Borrar búsqueda", que vacía el buscador y muestra el catálogo completo. Lo
  escrito sigue en el buscador hasta que se borra.
- Buscando: la lista anterior sigue visible, atenuada, con un indicador
  pequeño junto al buscador, hasta que llegan los resultados nuevos; la lista
  no desaparece entre letra y letra. Se puede seguir escribiendo: lo escrito
  no se pierde ni se bloquea el buscador.
- Error: "No se pudo conectar con Brote. Inténtalo de nuevo en un momento."
  con el botón "Reintentar". Lo escrito en el buscador sigue ahí.
- Sin conexión (móvil): "Sin conexión. Revisa tu conexión e inténtalo de
  nuevo." con el botón "Reintentar". Lo escrito en el buscador sigue ahí.
- Recarga fallida (móvil): si ya había cursos en pantalla y falla la recarga
  al deslizar hacia abajo, los cursos siguen visibles y aparece el mensaje de
  error o de sin conexión.

### Detalle del curso (web y móvil)

- Cargando: un indicador de carga.
- Con datos: portada, título, autor, descripción completa, número de
  lecciones y lista de lecciones.
- Sin lecciones: "Este curso todavía no tiene lecciones." en lugar de la
  lista.
- No disponible: "Este curso no existe o ya no está disponible." con el
  enlace "Ver cursos", que lleva al catálogo.
- Error: "No se pudo conectar con Brote. Inténtalo de nuevo en un momento."
  con el botón "Reintentar".
- Sin conexión (móvil): "Sin conexión. Revisa tu conexión e inténtalo de
  nuevo." con el botón "Reintentar".

## Resultado esperado

- El usuario encuentra cualquier curso publicado (recorriendo el catálogo o
  buscándolo) y ve su detalle con la lista de lecciones.
- El inicio deja de mostrar "Hola, {nombre}": ahora es el catálogo, en la
  web y en el móvil.
- Esta feature no guarda nada: no cambia cursos, ni lecciones, ni el usuario.
  La búsqueda solo se conserva en la dirección de la página (web) y mientras
  la app sigue abierta (móvil); los cursos ya cargados, solo mientras el
  usuario va y vuelve entre el catálogo y el detalle.

## Casos de error

- El servidor no responde o falla al cargar el catálogo, al buscar o al abrir
  un detalle: "No se pudo conectar con Brote. Inténtalo de nuevo en un
  momento." con "Reintentar"; lo escrito en el buscador sigue ahí. En el
  móvil, 15 segundos sin respuesta cuentan como que el servidor no responde
  (igual que en F01).
- Sin conexión en el móvil: "Sin conexión. Revisa tu conexión e inténtalo de
  nuevo." con "Reintentar".
- El curso no existe, nunca se publicó o dejó de estar publicado (por
  ejemplo, se pulsa su tarjeta después de que lo retiraron, o en la web se
  escribe una dirección con un identificador inventado): "Este curso no existe
  o ya no está disponible." con "Ver cursos". El mensaje es el mismo en los
  tres casos, para no revelar que existe un curso sin publicar.
- La sesión expiró: la siguiente carga, búsqueda o apertura de un curso lleva
  a "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar." (F01). En la
  web, después de entrar se regresa al catálogo con la misma búsqueda o al
  mismo detalle.

## Fuera de alcance

- Abrir y cursar una lección (F03). En esta feature las lecciones del detalle
  solo se listan.
- Botón "Empezar" o "Continuar" y el progreso del usuario en cada curso o
  lección (F04).
- Inscribirse a un curso: en Brote no hay inscripción. Cualquier curso
  publicado se abre y se cursa directamente, y "Mis cursos" (F04) se arma con
  los cursos en los que el usuario ya completó alguna lección.
- Ver los cursos propios sin publicar ("Mis cursos", F05).
- Puntos e insignias del curso (F08).
- Ver el catálogo sin conexión o descargar cursos (F10).
- Filtrar por idioma, tema o autor (al autor solo se le busca por su nombre
  con el buscador); categorías; ordenar de otra forma.
- Páginas numeradas, saltar a una página concreta o mostrar cuántos cursos
  hay en total: el catálogo solo carga de 10 en 10 hacia abajo.
- Portadas con imagen: elegir, subir o enlazar una imagen de portada llega
  con la funcionalidad futura "Subir imágenes y audio propios a los cursos".
- Perfil público del autor.
- Valoraciones, comentarios y número de alumnos (funcionalidades futuras).
- Compartir un curso desde la app y abrir un curso del móvil desde un enlace
  externo.

## Criterios de aceptación

<!--
  Datos de prueba: los cuatro cursos del prototipo publicados ("Examen unidad
  1", "Git esencial", "Japonés sencillo" y "Programación en C sencilla"), más
  los cursos extra que pida cada criterio. Los extra solo están publicados
  mientras se valida el criterio que los pide, para que no cambien los
  resultados de los demás. Cómo prepararlos lo dice el quickstart.md del plan.
-->

### Catálogo

- [x] [web, móvil] Con sesión iniciada, al abrir Brote llego al catálogo: en
  la web en `/` y en el móvil en la pestaña "Explorar". Ya no aparece "Hola,
  {nombre}".
- [x] [web, móvil] Con los cuatro cursos de prueba publicados, el catálogo
  los muestra en este orden: "Examen unidad 1", "Git esencial", "Japonés
  sencillo", "Programación en C sencilla".
- [x] [web, móvil] Cada tarjeta muestra la portada, el título, "Por {nombre
  del autor}", el inicio de la descripción y el número de lecciones: la de
  "Git esencial" dice "6 lecciones"; la de un curso con una sola lección dice
  "1 lección"; la de un curso sin lecciones dice "Sin lecciones".
- [x] [web, móvil] La portada de "Japonés sencillo" es una "J" sobre un
  color, y la de un curso titulado "¿Cómo se dice hola?" es una "C". Un
  mismo curso tiene el mismo color en su tarjeta, en su detalle, al recargar
  y en el otro cliente.
- [x] [web, móvil] Una descripción que no cabe en tres líneas se corta con
  "…" en la tarjeta y se ve completa en el detalle.
- [x] [web, móvil] Un curso en borrador y otro en revisión no aparecen en el
  catálogo ni al buscar su título exacto, aunque entre con la cuenta de su
  autor.
- [ ] [web, móvil] Sin ningún curso publicado, el catálogo muestra "Todavía
  no hay cursos publicados." y no muestra el buscador.
- [x] [web, móvil] Un curso cuyo título y descripción contienen `<b>hola</b>`
  y `<script>` muestra esos textos tal cual en la tarjeta y en el detalle,
  sin negritas y sin ejecutar nada.

### Búsqueda

- [x] [web, móvil] Al escribir "git" en el buscador, sin pulsar Enter ni
  ningún botón, el catálogo muestra solo "Git esencial".
- [x] [web, móvil] "JAPONES" encuentra "Japonés sencillo" y "programacion"
  encuentra "Programación en C sencilla".
- [x] [web, móvil] "flex" encuentra "Examen unidad 1" (la palabra solo
  está en su descripción).
- [x] [web, móvil] "sencill" encuentra "Japonés sencillo" y "Programación en
  C sencilla"; "sencillo japones" encuentra solo "Japonés sencillo".
- [x] [web, móvil] El nombre del autor de los cursos de prueba encuentra sus
  cuatro cursos; "git" seguido de ese nombre encuentra solo "Git esencial".
  Si otra cuenta con el mismo nombre publica un curso, buscar ese nombre
  también lo encuentra.
- [x] [web, móvil] Con "cocina" veo "No hay cursos que coincidan con
  «cocina»." y "Borrar búsqueda"; al pulsarlo, el buscador queda vacío y veo
  los cuatro cursos.
- [x] [web, móvil] Un texto de solo espacios muestra el catálogo completo, y el
  buscador no acepta más de 100 caracteres.
- [x] [web, móvil] Si escribo "japo", lo borro y escribo "git" de corrido,
  termino viendo solo "Git esencial".
- [x] [web, móvil] Mientras llegan los resultados de una búsqueda, la lista
  anterior sigue en pantalla, atenuada, con un indicador junto al buscador;
  la lista no desaparece ni aparece el indicador de carga del catálogo en su
  lugar.
- [x] [backend] Pedir al servidor, sin pasar por un cliente, una búsqueda de
  101 caracteres se rechaza; pedir el catálogo o el detalle de un curso sin
  sesión también se rechaza.
- [x] [backend] Pedir al servidor el detalle de un curso en borrador, con su
  identificador, responde exactamente igual que con un identificador que no
  existe.

### De 10 en 10

- [x] [web, móvil] Con 25 cursos publicados, el catálogo muestra los 10
  primeros por título. En el móvil, al llegar al final de la lista se agregan
  los 10 siguientes; en la web, al pulsar "Ver más". Después de la tercera
  carga veo los 25, ninguno repetido, y no se cargan más (en la web, "Ver
  más" ya no aparece).
- [x] [web, móvil] Al buscar "curso de prueba" veo 10 de los 21 cursos
  genéricos; al cargar más, otros 10, y después el último. Al borrar la
  búsqueda, la lista vuelve a empezar desde los primeros 10 del catálogo.
- [x] [web, móvil] Pulsar "Ver más" varias veces seguidas (web), o seguir
  deslizando mientras se cargan (móvil), agrega los 10 siguientes una sola
  vez.
- [ ] [web, móvil] Con 25 cursos publicados y los primeros 10 cargados,
  retiro uno de esos 10; al cargar más, no se repite ni falta ninguno de los
  que siguen publicados.
- [ ] [web, móvil] Con 10 cursos cargados, apago el servidor y pido más: los
  10 siguen en pantalla y al final veo "No se pudo conectar con Brote.
  Inténtalo de nuevo en un momento." y "Reintentar"; al encender el servidor
  y pulsar "Reintentar" se agregan los 10 siguientes.
- [x] [backend] Pedir cursos al servidor, sin pasar por un cliente, nunca
  devuelve más de 10 de una vez, aunque se le pidan más.

### Detalle

- [x] [web, móvil] Al pulsar la tarjeta de "Git esencial" veo su portada, el
  título, "Por {nombre del autor}", la descripción completa, "6 lecciones" y
  las seis lecciones numeradas en orden, de "1. ¿Qué es el control de
  versiones?" a "6. Resolviendo conflictos".
- [x] [web, móvil] Un curso publicado sin lecciones muestra "Este curso
  todavía no tiene lecciones." en su detalle.
- [x] [web, móvil] Después de buscar "git" y abrir "Git esencial", al volver
  al catálogo el buscador sigue diciendo "git" y veo solo "Git esencial".
- [x] [web, móvil] Con 20 cursos cargados, abro el vigésimo y vuelvo al
  catálogo: siguen los 20 cargados y la lista está en la misma posición.
- [x] [web] Al recargar el catálogo con "git" en el buscador, sigo viendo
  "git" y solo "Git esencial"; con 20 cursos cargados, al recargar veo solo
  los primeros 10. Al recargar el detalle de un curso, sigo viendo ese
  curso.
- [x] [web] Dado que no hay sesión, cuando abro la dirección del detalle de
  "Git esencial" y entro, entonces llego a ese detalle.
- [x] [web] Una dirección de curso con un identificador que no existe muestra
  "Este curso no existe o ya no está disponible." y "Ver cursos", que lleva
  al catálogo.
- [ ] [web, móvil] Si un curso deja de estar publicado después de cargar el
  catálogo, al pulsar su tarjeta veo "Este curso no existe o ya no está
  disponible."; al recargar el catálogo, ya no aparece.

### Estados

- [ ] [web, móvil] Mientras carga el catálogo o el detalle de un curso se ve
  un indicador de carga, y "Todavía no hay cursos publicados." no aparece ni
  por un instante.
- [ ] [web, móvil] Con el catálogo abierto, apago el servidor; al buscar o al
  abrir un curso veo "No se pudo conectar con Brote. Inténtalo de nuevo en un
  momento." y "Reintentar", y lo escrito en el buscador sigue ahí. Al encender
  el servidor y pulsar "Reintentar" veo los cursos o el detalle.
- [ ] [móvil] En modo avión, al buscar, recargar o abrir un curso veo "Sin
  conexión. Revisa tu conexión e inténtalo de nuevo." y "Reintentar"; al
  quitar el modo avión y pulsar "Reintentar" veo los datos.
- [ ] [móvil] Con la app abierta en el catálogo, publico un curso nuevo; al
  deslizar hacia abajo, aparece y la lista vuelve a empezar desde los
  primeros 10. Si la recarga falla, los cursos que ya estaban siguen en
  pantalla junto al mensaje de error.
- [ ] [web, móvil] Dado que la sesión expiró, cuando busco o abro un curso,
  entonces llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a
  entrar."; en la web, al entrar regreso al catálogo con mi búsqueda o al
  detalle donde estaba.

## Datos que toca

- **Curso**: curso creado por un autor. En esta feature importan:
  - id.
  - título.
  - descripción.
  - autor: el usuario que lo creó; se muestra su nombre para mostrar actual,
    y por ese nombre se le busca.
  - publicado: sí o no. Aquí solo se ven los publicados. Un curso en borrador
    o en revisión es, para esta feature, uno no publicado; distinguir esos dos
    estados le toca a F06.
  - portada: en el MVP no es un dato del curso ni una imagen; se genera a
    partir del título (ver "Validaciones").
  - lecciones, en orden.
  - creadoEn: fecha de creación (solo para desempatar el orden).

  El resto de sus datos (idioma, gamificación, ...) los definen F05 y F08.
- **Leccion**: lección de un curso. En esta feature importan:
  - id.
  - curso al que pertenece.
  - título.
  - posición dentro del curso (1, 2, 3, ...).

  Sus actividades las define F03.
- **Usuario** (F01): solo su nombre, como autor del curso y para buscar.

## Supuestos

- El catálogo reemplaza al inicio provisional de F01 ("Hola, {nombre}"). En
  el móvil, la primera pestaña cambia de "Inicio" a "Explorar", porque F04
  agregará "Mis cursos" a su lado. `specs/01-navegacion.md` se actualiza al
  cerrar la feature.
- El orden es alfabético porque en el MVP no se registra cuándo se publica un
  curso: la aprobación se hace a mano en la base de datos (decisión 0014).
- El catálogo carga de 10 en 10 aunque el MVP tenga pocos cursos, para que
  aguante cuando crezca sin cambiar cómo se piden los cursos.
- En la web, al volver del detalle se recuperan los cursos ya cargados y la
  posición en la lista; al recargar la página, en cambio, se empieza otra vez
  desde los primeros 10 de esa búsqueda.
- Los cursos de prueba son los cuatro del prototipo, con sus títulos,
  descripciones y títulos de lecciones tal cual, y su autor es una cuenta de
  prueba. Las actividades de sus lecciones no hacen falta en esta feature.
- Para validar los criterios hacen falta, además, cursos de prueba extra: uno
  en borrador, uno en revisión, uno publicado sin lecciones, uno con una sola
  lección, uno titulado "¿Cómo se dice hola?", uno con `<b>hola</b>` y
  `<script>` en el título y la descripción, y 21 cursos genéricos ("Curso de
  prueba 01" a "Curso de prueba 21") para llegar a 25 publicados y probar la
  carga de 10 en 10.
- La portada generada no se guarda: el curso del MVP no tiene campo de
  portada, y el editor (F05) no pide una. Cuando se puedan subir imágenes, la
  portada generada queda para los cursos que no tengan imagen.
- "No existe" y "no está publicado" dan el mismo mensaje a propósito, para no
  revelar cursos en borrador.
- En la web no se detecta "sin conexión" aparte: se muestra el mismo mensaje
  que con el servidor caído (igual que en F01).
- En el móvil, el detalle de un curso solo se abre desde el catálogo.
- Los límites de longitud del título y la descripción los define F05; aquí
  solo se cortan en la tarjeta.

## Aclaraciones

### Sesión 2026-10-26

- P: ¿En qué orden aparecen los cursos en el catálogo? → R: Alfabético por
  título, de la A a la Z; a igual título, primero el que se creó antes. No se
  registra la fecha de publicación.
- P: ¿El catálogo carga todos los cursos de una vez o por partes? → R: De 10
  en 10, también los resultados de búsqueda: en el móvil, al llegar al final
  de la lista; en la web, con el botón "Ver más".
- P: ¿Cómo se llama la pestaña del catálogo en el móvil? → R: "Explorar"
  (antes "Inicio"), para no confundirse con "Mis cursos" (F04).
- P: Mientras llegan los resultados de una búsqueda, ¿qué se ve en la lista?
  → R: La lista anterior, atenuada, con un indicador pequeño junto al
  buscador, hasta que llegan los resultados nuevos.
