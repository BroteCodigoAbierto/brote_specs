# F05: Crear y editar un curso

**Estado**: Borrador
**Creada**: 2026-11-03
**Repos afectados**: backend | web
**Rama**: `feature/F05-crear-editar-curso` (en cada repo afectado)
**Descripción original**: "F05 Crear y editar un curso (editor, solo web).
Paleta agrupada para los 13 tipos del catálogo (specs/00-proyecto.md); en F05
solo se editan los 5 básicos."

## Objetivo

Que cualquier persona pueda enseñar lo que sabe sin programar: crear un curso,
armar sus lecciones con actividades en un editor visual y ver cada actividad
como la verá el alumno. Con esta feature los cursos dejan de salir solo de los
datos de prueba, y queda lista la paleta a la que F11, F12 y F14 les agregan
sus tipos.

## Actor

- **Autor**: usuario con sesión iniciada (F01) que crea cursos en la web.
  Cualquier usuario puede serlo, porque no hay roles; es autor de los cursos
  que creó y solo de esos.

## Precondiciones

- El autor tiene sesión iniciada. Sin sesión, cualquier pantalla de esta
  feature lleva a "Entrar" (F01).
- Usa la web: el editor no existe en el móvil (decisión 0003).
- Para abrir el editor y para guardar hace falta llegar al servidor. Si no se
  puede, se maneja en "Casos de error".
- Para editar un curso, tiene que ser suyo y no estar publicado. Si no, se
  maneja en "Estados de la pantalla".
- Las actividades de F03 funcionan en la web: la vista previa las usa.

## Datos de entrada

Las longitudes cuentan caracteres. Un texto formado solo por espacios cuenta
como vacío.

### Curso

- Título: texto de una línea, obligatorio, de 1 a 100 caracteres.
- Descripción: texto de varias líneas, obligatorio, de 1 a 1000 caracteres.

Un curso tiene hasta 100 lecciones.

### Lección

- Título: texto de una línea, obligatorio, de 1 a 100 caracteres.

Una lección tiene hasta 50 actividades, en el orden que elige el autor.

### Actividades

| Tipo | Campo | Dato | Obligatorio | Límites |
|---|---|---|---|---|
| Teoría | Título | texto de una línea | no | hasta 100 |
| | Texto | texto de varias líneas | sí | hasta 5000 |
| | Código | texto de varias líneas | no | hasta 2000 |
| | Puntos clave | lista de textos | no | hasta 10, de hasta 200 cada uno |
| Tarjeta | Frente | texto de varias líneas | sí | hasta 200 |
| | Reverso | texto de varias líneas | sí | hasta 1000 |
| Opción múltiple | Pregunta | texto de varias líneas | sí | hasta 500 |
| | Código | texto de varias líneas | no | hasta 2000 |
| | Tipo de opciones | "Texto" o "Símbolo" | sí | por defecto, "Texto"; vale para todas las opciones |
| | Opciones | lista de textos o de símbolos | sí | de 2 a 9; texto de hasta 200, símbolo de hasta 4 |
| | Opción correcta | una de las opciones | sí | exactamente una |
| Completar espacios | Texto | texto de varias líneas con `___` | sí | hasta 2000, con 1 a 20 espacios |
| | Respuestas aceptadas | lista de textos por cada espacio | sí | de 1 a 10 por espacio, de hasta 100 cada una |
| Pregunta abierta | Pregunta | texto de varias líneas | sí | hasta 500 |
| | Solución de referencia | texto de varias líneas | sí | hasta 2000 |

## Flujo principal

### Ver los cursos que creé

1. El autor abre "Mi panel". Debajo de "Sigue aprendiendo" (F04) está la
   sección "Cursos que creé", con el botón "Nuevo curso".
2. Ve sus cursos, del que cambió más recientemente al más antiguo. Cada uno
   muestra su portada, su título, su estado ("Borrador" o "Publicado") y
   cuántas lecciones tiene.
3. Un borrador tiene el enlace "Editar", que abre su mapa. Un curso publicado
   tiene el enlace "Ver curso", que abre su detalle (F02).

### Crear un curso

1. El autor pulsa "Nuevo curso" y se abre un formulario con el título y la
   descripción.
2. Llena los datos y pulsa "Crear curso".
3. El sistema crea el curso como borrador, sin lecciones, con el autor como
   dueño, y lo lleva al mapa del curso.

"Cancelar" vuelve a "Mi panel" sin crear nada.

### Editar los datos del curso

1. El mapa del curso muestra arriba el título, la descripción y el estado
   "Borrador". Tiene el enlace "Mi panel" para volver.
2. El autor cambia lo que quiera. "Guardar cambios" se habilita al cambiar
   algo.
3. Pulsa "Guardar cambios" y el sistema muestra "Cambios guardados".

### Armar las lecciones del curso

En el mapa, debajo de los datos del curso, está la lista de lecciones en orden,
numeradas, cada una con su título y cuántas actividades tiene ("Sin
actividades", "1 actividad", "2 actividades"). Cada acción de esta lista se
guarda al momento, sin pulsar nada más:

- **Agregar**: el autor pulsa "Nueva lección", escribe el título y pulsa
  "Agregar". La lección queda al final, sin actividades.
- **Reordenar**: arrastra una lección a otro lugar, o usa sus botones "Subir"
  y "Bajar". Las lecciones se renumeran.
- **Eliminar**: pulsa "Eliminar" en una lección y confirma en "¿Eliminar esta
  lección?", con el texto "Se borrará con todas sus actividades. No se puede
  deshacer." y los botones "Cancelar" y "Eliminar". Las demás se renumeran.
- **Abrir**: pulsa la lección y se abre su lienzo.

### Eliminar un curso

1. En el mapa, el autor pulsa "Eliminar curso".
2. Confirma en "¿Eliminar este curso?", con el texto "Se borrará con todas sus
   lecciones. No se puede deshacer." y los botones "Cancelar" y "Eliminar".
3. El sistema borra el curso y lo lleva a "Mi panel", donde ya no aparece.

### Armar una lección

El lienzo de la lección usa todo el ancho de la ventana y no lleva el marco
común, como el reproductor. Arriba tiene una barra con "Volver al curso", el
título de la lección (que se edita ahí mismo), "Probar lección" y "Guardar
lección". Debajo hay tres zonas: la paleta, la secuencia de actividades (cada
una es un bloque) y el inspector con la vista previa.

1. **Paleta**: muestra los 13 tipos de actividad en cuatro grupos, en este
   orden:
   - Básicos: Teoría, Tarjeta, Opción múltiple, Completar espacios y Pregunta
     abierta.
   - Relacionar: Emparejar, Clasificar, Ordenar y Banco de palabras.
   - Código y terminal: Reto de código, Terminal simulada y Grafo de commits.
   - Voz: Escuchar y repetir.

   Los cinco básicos se pueden agregar. Los otros ocho se ven deshabilitados,
   con "Próximamente".
2. **Agregar**: el autor arrastra un tipo al lugar de la secuencia donde lo
   quiere, o lo pulsa: queda después de la actividad seleccionada, o al final
   si no hay ninguna seleccionada. La actividad nueva queda seleccionada y el
   foco pasa al primer campo de su formulario.
3. **Secuencia**: las actividades se ven como bloques en orden, cada uno con
   su número, su tipo y el inicio de su texto principal (el título o el texto
   en la teoría, el frente en la tarjeta, la pregunta o el texto en las
   demás), en una línea con "…". Sin texto todavía, dice "Sin contenido". Una
   actividad a la que le falta algo lleva la marca "Incompleta".
4. **Seleccionar**: al pulsar un bloque, el inspector muestra el formulario de
   esa actividad y la vista previa la muestra como la verá el alumno.
5. **Editar**: lo que el autor escribe se ve al momento en su bloque y en la
   vista previa. Junto a "Guardar lección" aparece "Cambios sin guardar".
6. **Reordenar**: arrastra un bloque a otro lugar, o usa sus botones "Subir" y
   "Bajar".
7. **Eliminar**: pulsa "Eliminar" en un bloque y confirma en "¿Eliminar esta
   actividad?", con el texto "Perderás lo que escribiste en ella." y los
   botones "Cancelar" y "Eliminar". Si era la seleccionada, el inspector queda
   sin selección.

En pantallas angostas las tres zonas se apilan, y todo se puede hacer con los
botones, sin arrastrar.

### Formulario de cada tipo

**Teoría**: Título, Texto (con la ayuda "Separa los párrafos con un renglón en
blanco."), Código (en letra monoespaciada, con la ayuda "Las líneas que empiezan
con +, - o @@ se resaltan como un diff.") y Puntos clave ("Agregar punto" suma
una fila y cada fila tiene "Quitar").

**Tarjeta**: Frente y Reverso.

**Opción múltiple**:

1. Pregunta y Código, como en la teoría.
2. Tipo de opciones: "Texto" o "Símbolo" (hasta 4 caracteres que se muestran
   en grande, como "あ"). Al cambiarlo, lo escrito se conserva.
3. Empieza con dos opciones vacías. "Agregar opción" suma una y cada opción
   tiene "Quitar".
4. El autor marca cuál es la correcta. Si quita la opción correcta, ninguna
   queda marcada.

**Completar espacios**:

1. Texto, con el botón "Agregar espacio", que escribe `___` donde está el
   cursor, y con la ayuda "Cada ___ es un espacio que el alumno llena." El
   campo va en letra monoespaciada, porque muchas veces es código.
2. Por cada `___` del texto, en orden, aparece un grupo "Espacio {n}" con una
   respuesta aceptada vacía. "Agregar respuesta" suma otra y cada respuesta,
   menos la última que queda, tiene "Quitar". La primera lleva la nota "Es la
   que ve el alumno como respuesta esperada".
3. Si el texto tiene menos `___` que grupos, los grupos vacíos que sobran
   desaparecen solos. Si los que sobran tienen algo escrito, no se borran:
   aparece "Hay más grupos de respuestas que espacios en el texto. Quita los
   que sobran." y cada grupo muestra "Quitar espacio", para que el autor elija
   cuál sobra.

**Pregunta abierta**: Pregunta y Solución de referencia.

### Vista previa

1. Al seleccionar una actividad completa, la vista previa la muestra igual que
   en el reproductor, y funciona igual: el autor puede voltear la tarjeta,
   elegir una opción, escribir en los espacios y comprobar.
2. Cuando el autor cambia la actividad, la vista previa se actualiza sola y
   vuelve a empezar.
3. "Reiniciar" la devuelve al principio. "Continuar" hace lo mismo, porque no
   hay actividad siguiente.

Lo que se hace en la vista previa no guarda nada ni cuenta como progreso.

### Probar la lección

1. El autor pulsa "Probar lección", que está habilitado si la lección tiene al
   menos una actividad.
2. El sistema hace la misma comprobación que al guardar. Si el título está
   vacío o hay actividades incompletas, no se abre nada: muestra los errores
   (ver "Estados de la pantalla"), selecciona la primera actividad incompleta
   y pasa el foco a su primer campo con error.
3. Si todo está completo, se abre el reproductor a pantalla completa con las
   actividades como están en el lienzo, guardadas o no, desde la primera, y
   con el aviso "Modo de prueba: esto no cuenta como progreso.".
4. El autor recorre la lección como un alumno, hasta "¡Lección completada!",
   con el título y "Acertaste {aciertos} de {preguntas}". En lugar de "Volver
   al curso" está "Volver al editor", y no aparece nada sobre guardar el
   progreso.
5. "Volver al editor", la X o el botón de volver del navegador regresan al
   lienzo como estaba, con sus cambios sin guardar y la misma actividad
   seleccionada. La X no pide confirmación, porque no se pierde nada.

### Guardar la lección

1. El autor pulsa "Guardar lección", que está habilitado si hay cambios sin
   guardar.
2. Si la lección no se puede guardar porque el título está vacío o hay
   actividades incompletas, el sistema no guarda nada: muestra los errores
   (ver "Estados de la pantalla"), selecciona la primera actividad incompleta
   y pasa el foco a su primer campo con error.
3. Si todo está completo y no hay una versión más nueva (paso 4), el sistema
   guarda el título y todas las actividades juntos, y muestra "Lección
   guardada". "Guardar lección" se deshabilita hasta el siguiente cambio.
4. Si desde que el autor abrió la lección se guardó una versión más nueva en
   otra pestaña o dispositivo, el sistema no guarda y pregunta "Esta lección
   cambió en otro lugar", con el texto "Se guardó una versión más nueva en
   otra pestaña o dispositivo. Si guardas, la reemplazarás." y los botones
   "Cancelar" y "Reemplazar". "Reemplazar" guarda lo que hay en pantalla.
   "Cancelar" deja la pantalla como estaba, con sus cambios sin guardar.

### Salir con cambios sin guardar

1. Con cambios sin guardar en la lección o en los datos del curso, el autor
   intenta salir de esa pantalla ("Volver al curso", el enlace "Mi panel",
   abrir una lección desde el mapa o el botón de volver del navegador).
2. El sistema pregunta "¿Salir sin guardar?", con el texto "Perderás los
   cambios que no guardaste." y los botones "Seguir aquí" y "Salir". "Seguir
   aquí" deja la pantalla como estaba; "Salir" descarta los cambios y sale.
3. Si recarga la página o cierra la pestaña, el navegador muestra su propio
   aviso de salida.

## Validaciones

- **Quién edita**: solo el autor de un curso puede abrirlo en el editor,
  cambiarlo o eliminarlo. Para cualquier otro usuario, un curso ajeno da la
  misma respuesta que uno que no existe. El servidor es quien decide.
- **Un curso publicado no se edita**: el servidor rechaza cualquier cambio en
  un curso publicado, en sus datos, en sus lecciones y en sus actividades, y
  también eliminarlo. Qué pasa al editar un curso publicado lo decide F06
  (decisión 0014).
- **Lo que no está publicado sigue oculto**: un borrador solo se ve en "Cursos
  que creé" y en el editor. No aparece en el catálogo ni se abre su detalle o
  sus lecciones, ni siquiera con la cuenta de su autor (F02, F03).
- **Estado del curso**: "Publicado" si está publicado y "Borrador" en
  cualquier otro caso. Distinguir "en revisión" le toca a F06.
- **Orden de "Cursos que creé"**: cualquier cambio guardado en el curso o en
  sus lecciones lo sube al primer lugar. Un curso recién creado va primero.
- **Número de lecciones en la tarjeta del curso**: como en F02 ("1 lección",
  "2 lecciones", "Sin lecciones").
- **Campos obligatorios**: un campo obligatorio vacío muestra "Este campo es
  obligatorio." debajo del campo.
- **Límites de longitud**: cada campo no deja escribir más de su límite. El
  servidor también rechaza lo que se pase.
- **Lo que se guarda**: el título del curso, el de la lección y el de la
  teoría se guardan sin espacios al inicio ni al final. Los demás textos se
  guardan tal como se escribieron, con sus saltos de línea y su sangría. Un
  campo opcional vacío, o un punto clave vacío, no se guarda.
- **Actividad completa**: una actividad está completa cuando tiene sus campos
  obligatorios llenos y cumple sus reglas. Mientras no lo esté, su bloque
  lleva la marca "Incompleta", desde que se agrega, con un icono además del
  color. Los errores de sus campos aparecen al intentar guardar y, desde ahí,
  se actualizan mientras el autor corrige.
- **Opción múltiple**:
  - Cada opción tiene texto. Una opción vacía muestra "Este campo es
    obligatorio.".
  - Sin opción correcta marcada, aparece "Elige la opción correcta.".
  - Dos opciones no pueden ser iguales. Se comparan sin los espacios al inicio
    y al final, respetando las mayúsculas, y la repetida muestra "Esta opción
    está repetida.".
  - Todas las opciones son del mismo tipo: texto o símbolo.
  - Con tipo "Símbolo", una opción de más de 4 caracteres muestra "Un símbolo
    puede tener hasta 4 caracteres.".
  - Con 2 opciones, "Quitar" está deshabilitado; con 9, también "Agregar
    opción".
- **Completar espacios**:
  - Un texto sin `___` muestra "Agrega al menos un espacio con ___.". Con más
    de 20, "El texto puede tener hasta 20 espacios.".
  - Hay exactamente un grupo de respuestas por cada `___`, y cada grupo tiene
    al menos una respuesta con texto.
  - Con 10 respuestas en un espacio, "Agregar respuesta" se deshabilita.
- **Puntos clave**: con 10, "Agregar punto" se deshabilita.
- **Lecciones y cursos vacíos**: un curso sin lecciones y una lección sin
  actividades se pueden guardar. Exigir contenido le toca a F06.
- **Máximos**: con 100 lecciones, "Nueva lección" se deshabilita con la nota
  "Un curso puede tener hasta 100 lecciones.". Con 50 actividades, los tipos
  de la paleta se deshabilitan con la nota "Una lección puede tener hasta 50
  actividades.".
- **Todo o nada**: la lección se guarda completa o no se guarda. Si algo está
  mal, queda como estaba la última vez que se guardó.
- **Versión más nueva**: la comprueba el servidor, y solo cuenta guardar la
  lección: reordenar las lecciones o cambiar los datos del curso no la hacen
  más nueva. Después de guardar, lo guardado es la versión de esa pestaña, así
  que guardar otra vez no pregunta nada. Vale también para lo que se recupera
  después de que expiró la sesión.
- **El servidor comprueba todo**: los datos del curso, los títulos, los
  límites y cada actividad con las reglas de arriba y las de F03. Si algo no
  cumple, rechaza el cambio y no guarda nada, aunque el cliente lo haya dejado
  pasar.
- **Solo los tipos disponibles**: el servidor rechaza una actividad de un tipo
  que no sea uno de los cinco básicos.
- **Paleta**: los tipos con "Próximamente" no se pueden arrastrar ni agregar,
  ni con el ratón ni con el teclado, y los lectores de pantalla los anuncian
  como no disponibles.
- **Reordenar**: en la primera posición "Subir" está deshabilitado, y en la
  última, "Bajar". Después de mover algo con esos botones, el foco sigue en el
  botón y los lectores de pantalla anuncian la nueva posición.
- **Vista previa**:
  - Usa las mismas actividades que ve el alumno: las opciones se mezclan, los
    espacios se califican igual y la barra de respuesta aparece igual, pero
    dentro de la vista previa, sin tapar el inspector ni la barra superior.
  - Actualizarse no le quita el foco al campo donde el autor escribe.
  - Las teclas de la actividad (1 a 9 y Enter) solo actúan con el foco dentro
    de la vista previa: fuera de ella no eligen opciones ni comprueban.
- **Probar la lección**: funciona igual que cursarla (F03), pero no guarda
  nada, no cuenta como progreso y no necesita al servidor, así que sirve
  aunque el servidor no responda. Las lecciones sin publicar siguen sin poder
  abrirse en el reproductor normal, ni siquiera con la cuenta de su autor.
- **Textos**: se muestran siempre como texto. Si contienen algo como
  `<b>hola</b>` o `<script>`, se ve tal cual y no se interpreta, en "Cursos
  que creé", el mapa, los bloques de la secuencia, el inspector, la vista
  previa y la prueba de la lección.
- **Mientras se guarda**: no se puede editar ni repetir la acción. El botón
  que guarda muestra un indicador y lo demás de la pantalla queda
  deshabilitado.

## Estados de la pantalla

### Sección "Cursos que creé" de "Mi panel"

Tiene sus propios estados, independientes de "Sigue aprendiendo". El botón
"Nuevo curso" se ve en todos.

- Cargando: un indicador de carga.
- Con datos: los cursos del autor, del más reciente al más antiguo.
- Vacío: "Todavía no creas ningún curso." con el texto "Crea uno y enseña lo
  que sabes.".
- Error: "No se pudo conectar con Brote. Inténtalo de nuevo en un momento."
  con el botón "Reintentar".

La sección se vuelve a cargar cada vez que se entra a "Mi panel".

### Nuevo curso

- Listo: el formulario, con "Crear curso" y "Cancelar".
- Guardando: "Crear curso" con un indicador.
- Error: "No se pudo crear el curso. Inténtalo de nuevo en un momento." arriba
  del botón, con lo escrito en el formulario.

### Mapa del curso

- Cargando: un indicador de carga.
- Con datos: los datos del curso y la lista de lecciones.
- Sin lecciones: "Este curso todavía no tiene lecciones." con el texto "Agrega
  la primera para empezar.", en lugar de la lista.
- No disponible: "Este curso no existe o ya no está disponible." con el enlace
  "Ir a Mi panel".
- Publicado: "Este curso ya está publicado y por ahora no se puede editar."
  con el enlace "Ver curso".
- Error: "No se pudo conectar con Brote. Inténtalo de nuevo en un momento."
  con el botón "Reintentar".
- Guardando los datos: "Guardar cambios" con un indicador.
- Datos guardados: "Cambios guardados" junto al botón, hasta el siguiente
  cambio.
- Error al guardar los datos: "No se pudieron guardar los cambios." arriba del
  botón, con lo escrito en el formulario.
- Agregando una lección: "Agregar" con un indicador. Si falla, "No se pudo
  agregar la lección." y el título escrito sigue en el campo.
- Reordenando: la lista se ve en el orden nuevo y no se puede mover otra
  lección hasta que termine. Si falla, vuelve al orden anterior con "No se
  pudo guardar el nuevo orden.".
- Eliminando: "Eliminar" con un indicador en la confirmación. Si falla, la
  confirmación se cierra, la lección o el curso siguen ahí y aparece "No se
  pudo eliminar la lección." o "No se pudo eliminar el curso.".

### Lienzo de la lección

- Cargando: "Volver al curso" y un indicador de carga.
- Con datos: la barra superior, la paleta, la secuencia y el inspector.
- Sin actividades: en la secuencia, "Esta lección todavía no tiene
  actividades." con el texto "Arrastra un tipo de la paleta o púlsalo para
  agregarlo.", y "Probar lección" deshabilitado.
- Sin selección: en el inspector, "Elige una actividad para editarla.", y la
  vista previa vacía.
- Actividad incompleta: en la vista previa, "Completa esta actividad para ver
  su vista previa.".
- No disponible: "Esta lección no existe o ya no está disponible." con el
  enlace "Ir a Mi panel".
- Publicado: "Este curso ya está publicado y por ahora no se puede editar."
  con el enlace "Ver curso".
- Error: "No se pudo conectar con Brote. Inténtalo de nuevo en un momento."
  con el botón "Reintentar".
- Sin cambios: "Guardar lección" deshabilitado.
- Con cambios: "Cambios sin guardar" y "Guardar lección" habilitado.
- Guardando: "Guardar lección" con un indicador, y la paleta, la secuencia y
  el inspector deshabilitados.
- Guardada: "Lección guardada" junto al botón, hasta el siguiente cambio.
- No se pudo guardar por actividades incompletas: un aviso "No se guardó: hay
  {n} actividades incompletas." (con una, "hay 1 actividad incompleta"), su
  marca en cada bloque y los errores en los campos.
- Error al guardar: "No se pudo guardar la lección. Tus cambios siguen aquí."
  y "Guardar lección" habilitado para reintentar.
- Versión más nueva: la pregunta "Esta lección cambió en otro lugar", encima
  del lienzo, que sigue visible detrás.
- No se pudo probar por actividades incompletas: un aviso "No se puede probar:
  hay {n} actividades incompletas." (con una, "hay 1 actividad incompleta"),
  su marca en cada bloque y los errores en los campos.
- Probando: el reproductor a pantalla completa, con el aviso del modo de
  prueba.

## Resultado esperado

- El autor tiene un curso propio, con sus lecciones y actividades, que sigue
  ahí después de recargar la página y de cerrar sesión y volver a entrar.
- Lo que guardó se ve en "Cursos que creé" y en el editor, y no aparece en el
  catálogo ni para él ni para nadie más.
- Cuando un administrador publica el curso (decisión 0014), sus lecciones se
  cursan en la web y en el móvil tal como se armaron, y el curso deja de poder
  editarse.

## Casos de error

- El servidor no responde o falla al cargar una pantalla: el mensaje de error
  con "Reintentar".
- El servidor no responde o falla al guardar: el mensaje de error de esa
  acción (ver "Estados de la pantalla"). Lo capturado sigue en pantalla y el
  autor puede reintentar.
- El servidor rechaza una lección que el cliente dejó pasar: "Revisa los datos
  marcados." y, si el servidor dice qué actividad falló, esa actividad queda
  seleccionada. Nada se guarda y los cambios siguen en pantalla.
- La sesión expiró al guardar (al crear el curso, al guardar sus datos o al
  guardar la lección): se llega a "Entrar" con el aviso "Tu sesión terminó.
  Vuelve a entrar." (F01). Al entrar con la misma cuenta en ese navegador, se
  regresa a esa pantalla con lo que estaba sin guardar, listo para guardarse.
  Si entra otra cuenta, se descarta y no se le muestra.
- La sesión expiró al abrir una pantalla: se llega a "Entrar" con el mismo
  aviso y, al entrar, se regresa a esa pantalla.
- La sesión expiró al agregar, reordenar o eliminar en el mapa: se llega a
  "Entrar" con el mismo aviso. Al entrar con la misma cuenta en ese navegador,
  se regresa al mapa con los datos del curso sin guardar y el título escrito
  en "Nueva lección". La acción que falló no se repite sola.
- El curso se publica mientras el autor lo edita: al guardar, o al agregar,
  reordenar o eliminar, ve "Este curso ya está publicado y por ahora no se
  puede editar. Tus cambios no se guardaron.". Lo capturado sigue en pantalla.
- La lección o el curso se eliminaron en otra pestaña: al guardar, o al
  agregar, reordenar o eliminar, ve "Esta lección ya no existe. Tus cambios no
  se guardaron." o "Este curso ya no existe. Tus cambios no se guardaron.". Lo
  capturado sigue en pantalla.
- Se guardó una versión más nueva de la lección en otra pestaña o dispositivo:
  la pregunta "Esta lección cambió en otro lugar". Nada se reemplaza sin que
  el autor lo elija, y lo capturado sigue en pantalla.
- La dirección del editor tiene un identificador inventado, o es de un curso
  de otra persona, o la lección es de otro curso: "Este curso no existe o ya
  no está disponible." o "Esta lección no existe o ya no está disponible.",
  con "Ir a Mi panel". El mensaje es el mismo en todos los casos, para no
  revelar cursos ajenos sin publicar.
- El autor pulsa "Crear curso" varias veces seguidas: se crea un solo curso.

## Fuera de alcance

- Editar los 8 tipos que no son básicos: F11 (emparejar, clasificar, ordenar y
  banco de palabras), F12 (reto de código, terminal simulada y grafo de
  commits) y F14 (escuchar y repetir). Aquí solo se ven en la paleta.
- Enviar un curso a revisión, el estado "en revisión", publicar y qué pasa al
  editar un curso publicado (F06).
- Importar y exportar un curso en JSON (F07).
- Configurar la gamificación de un curso (F08).
- Agregar términos de glosario a las actividades (F09).
- Imágenes y audio: portadas con imagen, imágenes en la teoría y en las
  opciones (F13).
- El editor en el móvil (decisión 0003).
- Guardado automático, deshacer y rehacer, e historial de versiones.
- Duplicar actividades o lecciones, y mover una actividad a otra lección.
- Texto con formato (negritas, enlaces) en las actividades.
- Opción múltiple con más de una respuesta correcta.
- Coautores de un curso y transferir un curso a otra cuenta.
- Combinar dos versiones de una lección, y actualizar en vivo una pantalla
  abierta cuando se guarda en otra pestaña o dispositivo.
- El idioma del curso (F07): hoy nada lo usa.

## Criterios de aceptación

<!--
  Datos de prueba: una cuenta nueva sin cursos ("cuenta A"), otra cuenta sin
  cursos ("cuenta B") y la cuenta autora de los cuatro cursos del prototipo
  ("cuenta autor"), que además tiene "Curso en borrador". Hacen falta, además,
  un borrador con 100 lecciones y una lección con 50 actividades. Cómo
  prepararlos lo dice el quickstart.md del plan.
-->

### Cursos que creé

- [ ] [web] Con la cuenta A, "Mi panel" muestra "Sigue aprendiendo" y debajo
  "Cursos que creé", con "Todavía no creas ningún curso.", "Crea uno y enseña
  lo que sabes." y el botón "Nuevo curso".
- [ ] [web] Con la cuenta autor, "Cursos que creé" muestra "Git esencial" con
  "Publicado", "6 lecciones" y el enlace "Ver curso", y "Curso en borrador"
  con "Borrador" y el enlace "Editar".
- [ ] [web] "Editar" abre el mapa de "Curso en borrador". "Ver curso" abre el
  detalle de "Git esencial", y volver desde ahí regresa a "Mi panel".
- [ ] [web] Con dos borradores en la cuenta A, al guardar un cambio en el de
  abajo y volver a "Mi panel", ese curso queda primero.
- [ ] [web] Con la cuenta B, "Cursos que creé" no muestra ningún curso de la
  cuenta A.

### Crear un curso

- [ ] [web] "Nuevo curso" abre un formulario con título y descripción.
  "Cancelar" vuelve a "Mi panel" sin crear nada.
- [ ] [web] Al pulsar "Crear curso" con el título solo con espacios y la
  descripción vacía, los dos campos muestran "Este campo es obligatorio." y no
  se crea nada.
- [ ] [web] El título no deja escribir más de 100 caracteres, y la
  descripción, más de 1000.
- [ ] [web] Al crear "Huerto urbano" llego a su mapa, con "Borrador", "Este
  curso todavía no tiene lecciones." y "Agrega la primera para empezar.". En
  "Mi panel" aparece primero, con "Sin lecciones".
- [ ] [web, móvil] "Huerto urbano" no aparece en el catálogo ni al buscar su
  título, ni siquiera con la cuenta A.
- [ ] [web] Con la cuenta A, la dirección del detalle de "Huerto urbano"
  muestra "Este curso no existe o ya no está disponible.".
- [ ] [web] Pulsar "Crear curso" varias veces seguidas crea un solo curso.

### Datos del curso

- [ ] [web] En el mapa, "Guardar cambios" está deshabilitado hasta que cambio
  algo. Al cambiar el título a "Azotea verde" y guardar veo "Cambios
  guardados", y al recargar sigue ese título, con la "A" en la portada.
- [ ] [web] Con el título vacío, "Guardar cambios" muestra "Este campo es
  obligatorio." y al recargar sigue el título anterior.
- [ ] [web] Mientras se guardan los datos del curso, "Guardar cambios" muestra
  un indicador y no puedo agregar, mover ni eliminar lecciones.
- [ ] [web] "Eliminar curso" pregunta "¿Eliminar este curso?" con "Se borrará
  con todas sus lecciones. No se puede deshacer.". "Cancelar" no cambia nada;
  "Eliminar" me lleva a "Mi panel", el curso ya no aparece y su dirección del
  editor muestra "Este curso no existe o ya no está disponible.".

### Lecciones

- [ ] [web] "Nueva lección" con el título vacío muestra "Este campo es
  obligatorio." y no la agrega. El campo no deja escribir más de 100
  caracteres.
- [ ] [web] Al agregar "Semillas", "Riego" y "Cosecha", aparecen en ese orden,
  numeradas de 1 a 3 y con "Sin actividades".
- [ ] [web] Pulsar "Agregar" varias veces seguidas agrega una sola lección.
- [ ] [web] Al arrastrar "Cosecha" al primer lugar veo "1. Cosecha", "2.
  Semillas" y "3. Riego", y sigue así al recargar.
- [ ] [web] Con el teclado, usando "Subir" y "Bajar", logro el mismo cambio y
  el foco sigue en el botón. "Subir" está deshabilitado en la primera lección
  y "Bajar" en la última.
- [ ] [web] "Eliminar" en una lección pregunta "¿Eliminar esta lección?" con
  "Se borrará con todas sus actividades. No se puede deshacer.". "Cancelar" no
  cambia nada; "Eliminar" la quita, las demás se renumeran y sigue así al
  recargar.
- [ ] [web] En el borrador con 100 lecciones, "Nueva lección" está
  deshabilitado y veo "Un curso puede tener hasta 100 lecciones.".

### Paleta

- [ ] [web] La paleta muestra, en este orden: "Básicos" con Teoría, Tarjeta,
  Opción múltiple, Completar espacios y Pregunta abierta; "Relacionar" con
  Emparejar, Clasificar, Ordenar y Banco de palabras; "Código y terminal" con
  Reto de código, Terminal simulada y Grafo de commits; y "Voz" con Escuchar y
  repetir.
- [ ] [web] Los 8 tipos que no son básicos se ven deshabilitados con
  "Próximamente": no se pueden arrastrar a la secuencia, y pulsarlos o usarlos
  con el teclado no agrega nada.
- [ ] [web] Al arrastrar "Tarjeta" entre dos actividades, queda entre esas
  dos.
- [ ] [web] Al pulsar "Teoría" con la actividad 2 seleccionada, queda en el
  lugar 3; sin ninguna seleccionada, queda al final. En los dos casos queda
  seleccionada y el foco está en su primer campo.
- [ ] [web] Con el teclado (Tab y Enter) agrego una actividad sin usar el
  ratón.
- [ ] [web] En la lección con 50 actividades, los tipos de la paleta están
  deshabilitados y veo "Una lección puede tener hasta 50 actividades.".

### Secuencia de bloques

- [ ] [web] Una lección sin actividades muestra "Esta lección todavía no tiene
  actividades." y "Arrastra un tipo de la paleta o púlsalo para agregarlo.".
- [ ] [web] Cada bloque muestra su número, su tipo y el inicio de su texto,
  que cambia mientras escribo en el inspector. Una actividad sin texto dice
  "Sin contenido".
- [ ] [web] Al agregar una actividad, su bloque lleva la marca "Incompleta"
  desde el principio, y la pierde en cuanto la completo.
- [ ] [web] Sin actividad seleccionada, el inspector dice "Elige una actividad
  para editarla.". Al pulsar un bloque, también con el teclado (Tab y Enter),
  aparece su formulario.
- [ ] [web] Puedo reordenar los bloques arrastrándolos y con "Subir" y
  "Bajar".
- [ ] [web] "Eliminar" en un bloque pregunta "¿Eliminar esta actividad?" con
  "Perderás lo que escribiste en ella.". Si era la seleccionada, el inspector
  vuelve a "Elige una actividad para editarla.".
- [ ] [web] En una ventana angosta las zonas se apilan y puedo agregar,
  editar, reordenar y guardar sin arrastrar.
- [ ] [web] Con un lector de pantalla, los tipos con "Próximamente" se
  anuncian como no disponibles, y al mover una lección o un bloque con "Subir"
  o "Bajar" se anuncia "Movida a la posición {n}".

### Formularios

- [ ] [web] En la teoría, con solo el texto lleno, la actividad deja de estar
  incompleta. "Agregar punto" suma filas hasta 10; una fila vacía no se
  guarda.
- [ ] [web] Los formularios muestran sus ayudas: "Separa los párrafos con un
  renglón en blanco." y "Las líneas que empiezan con +, - o @@ se resaltan
  como un diff." en la teoría, y "Cada ___ es un espacio que el alumno llena."
  en completar espacios.
- [ ] [web] La tarjeta queda completa cuando tiene frente y reverso.
- [ ] [web] La opción múltiple empieza con dos opciones vacías. Con 2,
  "Quitar" está deshabilitado; con 9, también "Agregar opción".
- [ ] [web] Sin opción correcta marcada, al guardar veo "Elige la opción
  correcta.". Si quito la opción correcta, ninguna queda marcada.
- [ ] [web] Con dos opciones "Rojo" y " Rojo ", al guardar la repetida muestra
  "Esta opción está repetida."; "Rojo" y "rojo" sí se aceptan.
- [ ] [web] Con tipo "Símbolo", las opciones "あ" e "い" se ven como mosaicos en
  la vista previa. Al cambiar a "Símbolo" con una opción de más de 4
  caracteres, lo escrito se conserva y al guardar veo "Un símbolo puede tener
  hasta 4 caracteres.".
- [ ] [web] En completar espacios, "Agregar espacio" escribe `___` donde está
  el cursor y aparece el grupo "Espacio 1". Escribir otro `___` a mano agrega
  "Espacio 2".
- [ ] [web] Un texto sin `___` muestra, al guardar, "Agrega al menos un
  espacio con ___.". Con 21, "El texto puede tener hasta 20 espacios.".
- [ ] [web] Con dos espacios con respuestas, al borrar un `___` del texto los
  dos grupos siguen ahí, con "Hay más grupos de respuestas que espacios en el
  texto. Quita los que sobran." y "Quitar espacio". La actividad sigue
  incompleta hasta que quito uno. Si el grupo que sobra estaba vacío,
  desaparece solo.
- [ ] [web] Un espacio deja agregar hasta 10 respuestas, y la primera lleva la
  nota "Es la que ve el alumno como respuesta esperada".
- [ ] [web] La pregunta abierta queda completa cuando tiene pregunta y
  solución.
- [ ] [web] Cada campo no deja escribir más del límite de "Datos de entrada".

### Vista previa

- [ ] [web] Una opción múltiple completa se ve en la vista previa como en el
  reproductor: elijo una opción, compruebo y veo "¡Correcto!" o la respuesta
  correcta. La barra de respuesta queda dentro de la vista previa.
- [ ] [web] En la vista previa, la tarjeta se voltea, los espacios se
  califican sin importar mayúsculas ni acentos, y la pregunta abierta muestra
  la solución.
- [ ] [web] Mientras escribo en un campo del inspector, la vista previa se
  actualiza y el foco se queda en el campo: sigo escribiendo sin perder
  letras.
- [ ] [web] Con el foco en el inspector o en la secuencia, fuera de un campo,
  las teclas 1 a 9 y Enter no eligen opciones ni comprueban en la vista
  previa. Con el foco dentro de la vista previa, sí.
- [ ] [web] "Reiniciar" devuelve la actividad al principio, y "Continuar" hace
  lo mismo.
- [ ] [web] Una actividad incompleta muestra "Completa esta actividad para ver
  su vista previa.".

### Probar la lección

- [ ] [web] En una lección sin actividades, "Probar lección" está
  deshabilitado.
- [ ] [web] Con dos actividades incompletas, "Probar lección" no abre nada:
  veo "No se puede probar: hay 2 actividades incompletas." (con una, "No se
  puede probar: hay 1 actividad incompleta."), queda seleccionada la primera
  con sus errores y el foco en su primer campo con error.
- [ ] [web] Con actividades completas y cambios sin guardar, "Probar lección"
  abre el reproductor a pantalla completa, con "Modo de prueba: esto no cuenta
  como progreso." y las actividades como están en el lienzo, desde la primera.
- [ ] [web] Al terminar veo "¡Lección completada!", el título de la lección y
  "Acertaste {aciertos} de {preguntas}", con "Volver al editor", sin
  "Guardando tu progreso…" ni "Progreso guardado".
- [ ] [web] "Volver al editor", la X (sin preguntar nada) y el botón de volver
  del navegador regresan al lienzo con mis cambios sin guardar y la misma
  actividad seleccionada.
- [ ] [web] Con el servidor apagado, puedo probar la lección de principio a
  fin.
- [ ] [web, móvil] Después de probar una lección y publicar el curso, esa
  lección aparece sin completar para el autor.

### Guardar

- [ ] [web] "Guardar lección" está deshabilitado al abrir la lección. Al
  cambiar algo aparece "Cambios sin guardar" y se habilita.
- [ ] [web] Con una lección de tres actividades completas, al guardar veo
  "Lección guardada". Al recargar, las tres siguen ahí en el mismo orden y con
  sus datos, y el mapa dice "3 actividades".
- [ ] [web] Con dos actividades incompletas, al guardar veo "No se guardó: hay
  2 actividades incompletas." (con una, "No se guardó: hay 1 actividad
  incompleta."), queda seleccionada la primera con sus errores y el foco en su
  primer campo con error. Al recargar y aceptar salir, la lección está como
  antes de esos cambios.
- [ ] [web] Con el título de la lección vacío, al guardar veo "Este campo es
  obligatorio." en el título y no se guarda.
- [ ] [web] Puedo guardar una lección sin actividades.
- [ ] [web] Una teoría con el título vacío y sin puntos clave se guarda sin
  esos campos. Un código con sangría conserva su sangría después de guardar y
  recargar.
- [ ] [web] Mientras se guarda, "Guardar lección" muestra un indicador y no
  puedo editar nada.
- [ ] [web, móvil] Armo una lección con los cinco tipos, un administrador
  publica el curso, y un alumno la cursa de principio a fin con lo que
  escribí: en la web y en el móvil se ve igual que en la vista previa y su
  resultado cuenta las tres preguntas.

### Versión más nueva

- [ ] [web] Con la misma lección abierta en dos pestañas, guardo un cambio en
  la primera y otro en la segunda: la segunda pregunta "Esta lección cambió en
  otro lugar" con "Se guardó una versión más nueva en otra pestaña o
  dispositivo. Si guardas, la reemplazarás.", "Cancelar" y "Reemplazar".
- [ ] [web] "Cancelar" me deja en la lección con mis cambios y "Cambios sin
  guardar"; si recargo y acepto salir, veo lo que guardó la primera pestaña.
- [ ] [web] "Reemplazar" guarda, veo "Lección guardada" y, al recargar la
  primera pestaña, veo lo de la segunda.
- [ ] [web] Guardar dos veces seguidas en la misma pestaña no pregunta nada.
- [ ] [web] Con el lienzo abierto, reordenar las lecciones o cambiar los datos
  del curso en otra pestaña no hace aparecer la pregunta al guardar.
- [ ] [backend] Guardar, sin pasar por un cliente, una lección a partir de una
  versión que ya no es la última se rechaza y la lección queda como estaba,
  salvo que se pida reemplazarla.

### Salir sin guardar

- [ ] [web] Con cambios sin guardar, "Volver al curso" pregunta "¿Salir sin
  guardar?" con "Perderás los cambios que no guardaste.". "Seguir aquí" deja
  todo como estaba; "Salir" me lleva al mapa y los cambios se pierden.
- [ ] [web] El botón de volver del navegador hace lo mismo.
- [ ] [web] Con cambios sin guardar en los datos del curso, "Mi panel" y abrir
  una lección preguntan lo mismo.
- [ ] [web] Sin cambios pendientes, "Volver al curso" sale directo.
- [ ] [web] Al recargar la página con cambios sin guardar, el navegador avisa
  antes de salir; sin cambios, no avisa.

### Permisos y cursos publicados

- [ ] [web] Con la cuenta B, la dirección del editor de un borrador de la
  cuenta A muestra "Este curso no existe o ya no está disponible." y "Ir a Mi
  panel". Una dirección con un identificador de curso inventado muestra lo
  mismo.
- [ ] [web] En un borrador propio, la dirección de una lección con un
  identificador inventado, o de una lección de otro curso, muestra "Esta
  lección no existe o ya no está disponible." y "Ir a Mi panel".
- [ ] [web] Con la cuenta autor, la dirección del editor de "Git esencial" y
  la de una de sus lecciones muestran "Este curso ya está publicado y por
  ahora no se puede editar." y "Ver curso".
- [ ] [web] Con el lienzo abierto, un administrador publica el curso. Al
  guardar veo "Este curso ya está publicado y por ahora no se puede editar.
  Tus cambios no se guardaron." y lo que escribí sigue en pantalla.
- [ ] [backend] Crear un curso sin sesión se rechaza. Cambiar, sin pasar por
  un cliente, un borrador de la cuenta A con la sesión de la cuenta B responde
  exactamente igual que con un identificador que no existe.
- [ ] [backend] Cambiar los datos, una lección o el orden de "Git esencial"
  con la sesión de su autor, o eliminarlo, se rechaza y no cambia nada.
- [ ] [backend] Guardar, sin pasar por un cliente, una lección con una
  actividad incompleta, con un texto más largo que su límite, con dos opciones
  iguales, con opciones de texto y de símbolo mezcladas, con un número de
  grupos distinto al de `___`, con un tipo que no es básico o con 51
  actividades, se rechaza y la lección queda como estaba.
- [ ] [backend] Crear o cambiar un curso con un título de 101 caracteres, o
  agregar la lección 101, se rechaza y no cambia nada.

### Contenido

- [ ] [web] Un curso con `<b>hola</b>` y `<script>` en el título, la
  descripción, los títulos de sus lecciones y los textos de una actividad de
  cada tipo los muestra tal cual en "Cursos que creé", el mapa, los bloques de
  la secuencia, el inspector y la vista previa, sin negritas y sin ejecutar
  nada.

### Estados y errores

- [ ] [web] Mientras carga, "Cursos que creé", el mapa y el lienzo muestran un
  indicador, y sus mensajes de vacío no aparecen ni por un instante.
- [ ] [web] Con el servidor apagado, "Sigue aprendiendo" y "Cursos que creé"
  muestran cada una "No se pudo conectar con Brote. Inténtalo de nuevo en un
  momento." y su "Reintentar". El mapa y el lienzo también; al encender el
  servidor y pulsar "Reintentar" veo los datos.
- [ ] [web] Con el servidor apagado, al guardar la lección veo "No se pudo
  guardar la lección. Tus cambios siguen aquí."; al encender el servidor y
  pulsar otra vez "Guardar lección", se guarda.
- [ ] [web] Con el servidor apagado, "Crear curso" muestra "No se pudo crear
  el curso. Inténtalo de nuevo en un momento." y "Guardar cambios" muestra "No
  se pudieron guardar los cambios.". En los dos casos lo escrito sigue en el
  formulario.
- [ ] [web] Con el servidor apagado, al reordenar lecciones la lista vuelve al
  orden anterior con "No se pudo guardar el nuevo orden.". Al agregar, veo "No
  se pudo agregar la lección." y el título escrito sigue en el campo. Al
  eliminar, la lección sigue en la lista con "No se pudo eliminar la
  lección.", y el curso, con "No se pudo eliminar el curso.".
- [ ] [web] Con la lección eliminada en otra pestaña, al guardar veo "Esta
  lección ya no existe. Tus cambios no se guardaron."; con el curso eliminado,
  "Este curso ya no existe. Tus cambios no se guardaron.". Lo que escribí
  sigue en pantalla.
- [ ] [web] Dado que la sesión expiró, cuando guardo la lección, llego a
  "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar."; al entrar con
  la misma cuenta regreso al lienzo con mis cambios sin guardar y, al pulsar
  "Guardar lección", se guardan.
- [ ] [web] Dado que la sesión expiró, cuando pulso "Crear curso" o "Guardar
  cambios", llego a "Entrar" con el aviso; al entrar con la misma cuenta
  regreso al formulario con lo que escribí.
- [ ] [web] Dado que la sesión expiró, con el título del curso cambiado sin
  guardar y un título escrito en "Nueva lección", cuando reordeno las
  lecciones llego a "Entrar" con el aviso; al entrar con la misma cuenta
  regreso al mapa con lo que escribí.
- [ ] [web] Si después de que expiró la sesión entro con otra cuenta, no veo
  los cambios sin guardar de la cuenta anterior.
- [ ] [web] Dado que la sesión expiró, cuando abro el mapa de un curso, llego
  a "Entrar" con el aviso; al entrar regreso a ese mapa.

## Datos que toca

- **Curso** (F02): ahora lo crea, lo cambia y lo elimina su autor. Aquí
  importan:
  - título y descripción, con los límites de "Datos de entrada";
  - autor: quien lo creó, que no cambia;
  - publicado: solo se lee, y decide si se puede editar;
  - cuándo cambió por última vez, contando sus lecciones (ordena "Cursos que
    creé").
- **Leccion** (F02, F03): ahora se crea, se cambia, se reordena y se elimina.
  Su título tiene los límites de "Datos de entrada"; su posición se renumera
  al reordenar o eliminar. Para detectar una versión más nueva, importa cuándo
  se guardó su contenido por última vez.
- **Actividad** (F03): ahora la escribe el autor. Se agregan los límites de
  "Datos de entrada" y estas reglas: las opciones no se repiten y son todas
  del mismo tipo. Los otros 8 tipos llegan con sus features.
- **Progreso** (F04): al eliminar una lección o un curso se borra el progreso
  que tenía, como ya pasa en F04.
- **Usuario** (F01): autor del curso.

## Supuestos

- El idioma del curso no entra aquí, aunque `specs/02-modelo-datos.md` lo
  asignaba a F05: ninguna pantalla lo usa, la voz de F14 trae su propio idioma
  por actividad y el prototipo lo usaba con dos sentidos. Lo define F07, que
  mueve cursos con su formato.
- Los límites se eligieron con holgura sobre los valores más altos de los
  cursos del prototipo (por ejemplo, 897 caracteres en una teoría, 408 en un
  reverso y 8 actividades básicas en una lección), para que todos sigan siendo
  válidos. También los usará la importación (F07).
- Un curso que dejó de estar publicado vuelve a ser "Borrador" y se puede
  editar. Si se publica otra vez, vale lo que dijo F04: el resultado guardado
  de una lección que cambió se muestra como estaba, una lección borrada deja
  de contar y las nuevas suman al total. Como los cursos publicados no se
  editan, solo pasa en ese caso.
- "Curso en revisión" de los datos de prueba se ve como "Borrador" hasta F06.
- Eliminar un curso entra aquí aunque la descripción no lo nombra: sin eso, un
  autor no puede quitar un borrador de su panel. Solo se eliminan cursos sin
  publicar. Si el curso estuvo publicado y un administrador lo retiró, el
  progreso de sus alumnos se borra con él.
- Los títulos de las lecciones se cambian en el lienzo, no en el mapa. Los
  títulos se pueden repetir, entre cursos y entre lecciones de un curso (F02
  ya desempata los cursos con el mismo título).
- "Probar lección" corre en el editor, con lo que hay en pantalla: no abre el
  reproductor de F03 con la dirección de la lección, que sigue rechazando las
  lecciones sin publicar. Por eso no cambia ninguna regla de F02 ni de F03.
- Eliminar una actividad pide confirmación aunque esté vacía, para que la
  regla sea una sola. Eliminar una actividad no es definitivo hasta guardar la
  lección; eliminar una lección o un curso sí.
- Las opciones de una opción múltiple no se ordenan en el editor, porque el
  alumno las ve mezcladas.
- Solo la lección avisa de una versión más nueva, porque guardarla reemplaza
  todo su contenido. Los datos del curso son dos campos cortos: si se cambian
  en dos pestañas, queda lo último que se guardó, sin aviso (como en F04).
- Cerrar sesión desde el menú de la cuenta con cambios sin guardar no pide
  confirmación: es una acción deliberada.
- "Cursos que creé" muestra todos los cursos del autor, sin paginar: en el MVP
  un autor crea pocos cursos. No hay límite de cursos por autor.
- En la web no se detecta "sin conexión" aparte: se muestra el mismo mensaje
  que con el servidor caído (igual que en F01 a F04).
- Cuando F11, F12 y F14 agreguen un tipo, su entrada de la paleta deja de
  decir "Próximamente" al agregar su formulario, sin cambiar el resto del
  editor (principio IV).
- El móvil no tiene pantallas nuevas: solo recibe la copia del contrato. El
  criterio que lo nombra comprueba que cursa lo que se creó en el editor.
- Al cerrar la feature se actualizan `specs/01-navegacion.md` (quitar
  `/mis-cursos`, porque los cursos del autor quedan en "Mi panel", y confirmar
  las pantallas del editor) y `specs/02-modelo-datos.md` (los límites, y el
  idioma pasa a F07).

## Aclaraciones

### Sesión 2026-11-03

- P: Mientras F06 no exista, ¿qué puede hacer el autor con un curso suyo que
  ya está publicado? → R: No se edita. Sale en su lista como "Publicado", con
  "Ver curso" y sin "Editar", y el servidor rechaza los cambios. F06 decide
  qué pasa al editar un curso publicado (decisión 0014).
- P: ¿Cómo se guarda el trabajo del autor al editar una lección? → R: Con el
  botón "Guardar lección": se guarda todo junto y solo si todas las
  actividades están completas. Las incompletas se marcan, y salir con cambios
  pendientes pide confirmación.
- P: ¿Dónde ve el autor los cursos que creó en la web? → R: En una sección
  "Cursos que creé" dentro de "Mi panel", debajo de "Sigue aprendiendo", con
  el botón "Nuevo curso". Así "Mis cursos" queda solo como la pestaña del
  móvil, con los cursos empezados.
- P: ¿El autor puede recorrer su lección completa antes de publicarla? → R:
  Sí, con el botón "Probar lección" del lienzo: abre el reproductor a pantalla
  completa con lo que hay en pantalla, guardado o no, sin registrar progreso.
  Pide que las actividades estén completas.
- P: Si el autor abre la misma lección en dos pestañas o computadoras y guarda
  en las dos, ¿qué pasa con lo que guardó primero? → R: El segundo guardado se
  detiene y pregunta si reemplazar la versión más nueva o cancelar. Nada se
  pierde sin que el autor lo decida.
- P: ¿F05 pide y guarda el idioma del curso? → R: No. Sale de F05 y lo define
  F07, porque hoy nada lo lee.
- P: ¿El autor puede eliminar un curso suyo sin publicar? → R: Sí, cualquiera
  sin publicar, con confirmación. Si el curso estuvo publicado y se retiró, el
  progreso de sus alumnos se borra con él.
