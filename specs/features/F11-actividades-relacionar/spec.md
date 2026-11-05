# F11: Actividades de relacionar

**Estado**: Borrador
**Creada**: 2026-11-04
**Repos afectados**: backend | web | móvil
**Rama**: `feature/F11-actividades-relacionar` (en cada repo afectado)
**Descripción original**: "F11 Actividades de relacionar: emparejar, clasificar,
ordenar y banco de palabras (web y móvil)."

## Objetivo

Que el alumno pueda aprender relacionando ideas, y no solo eligiendo o
escribiendo: formar parejas, repartir elementos en categorías, poner pasos en
orden y completar un texto con fichas. Que el autor pueda crear estas cuatro
actividades en el editor, sin programar. Con esta feature Brote llega a 9 de sus
13 tipos de actividad, y los cursos de prueba recuperan las 27 actividades de
estos tipos que tenía el prototipo.

## Actor

- **Alumno**: usuario con sesión iniciada (F01) que cursa una lección de un
  curso publicado (F03), en la web o en el móvil.
- **Autor**: usuario con sesión iniciada que arma sus lecciones en el editor
  (F05), solo en la web (decisión 0003).

## Precondiciones

- El reproductor de lecciones (F03) y el editor (F05) funcionan. Abrir una
  lección y abrir el editor piden lo mismo que en esas features: sesión, curso
  publicado o curso propio, y llegar al servidor.
- Los cursos de prueba tienen cargadas las actividades de estos cuatro tipos
  (ver "Supuestos").

## Datos de entrada

Las longitudes cuentan caracteres. Un texto formado solo por espacios cuenta
como vacío.

### Lo que responde el alumno

Obligatorio para comprobar. No se guarda: solo cuenta para el resultado de la
lección (F03, F04).

- Parejas (emparejar): cada elemento de la izquierda unido con uno de la
  derecha.
- Categoría de cada elemento (clasificar): una de las categorías de la
  actividad.
- Orden (ordenar): cada elemento en uno de los lugares numerados.
- Ficha de cada espacio (banco de palabras): una ficha del banco en cada
  espacio del texto.

### Lo que escribe el autor

| Tipo | Campo | Dato | Obligatorio | Límites |
|---|---|---|---|---|
| Emparejar | Consigna | texto de varias líneas | no | hasta 500 |
| | Parejas | lista de dos textos de una línea (izquierda y derecha) | sí | de 3 a 8; cada texto, hasta 200 |
| Clasificar | Consigna | texto de varias líneas | no | hasta 500 |
| | Categorías | lista de textos de una línea | sí | de 2 a 4, de hasta 100 cada una |
| | Elementos | lista de textos de una línea, cada uno con su categoría | sí | de 2 a 12, de hasta 100 cada uno |
| Ordenar | Consigna | texto de varias líneas | sí | hasta 500 |
| | Elementos | lista de textos de una línea, en el orden correcto | sí | de 3 a 10, de hasta 200 cada uno |
| Banco de palabras | Consigna | texto de varias líneas | no | hasta 500 |
| | Texto | texto de varias líneas con `___` | sí | hasta 2000, con 1 a 10 espacios |
| | Fichas | lista de textos de una línea | sí | de 2 a 20, de hasta 100 cada una |
| | Fichas que valen | una o más fichas marcadas por cada espacio | sí | al menos una por espacio |

## Flujo principal

### Pulsar y arrastrar

Los cuatro tipos se responden de dos formas, en la web y en el móvil, y las dos
dan el mismo resultado:

- **Pulsar**: con el dedo, con el ratón o, en la web, con Enter o la barra
  espaciadora cuando el elemento tiene el foco.
- **Arrastrar**: en la web, con el ratón; en el móvil, manteniendo pulsado el
  elemento un momento y moviendo el dedo. Mientras se arrastra, el elemento
  sigue al puntero o al dedo y el destino que tiene debajo se resalta. Al
  soltarlo sobre un destino válido pasa lo que dice cada tipo; al soltarlo en
  cualquier otro lugar, vuelve a donde estaba y nada cambia.

Como en F03, "Comprobar" se habilita cuando la respuesta está completa y se
pulsa una sola vez. Después nada se puede mover y el botón pasa a "Continuar".

### Emparejar

1. El alumno ve la consigna (sin ella, "Empareja los conceptos") y dos columnas:
   a la izquierda los elementos en el orden del autor, y a la derecha sus
   parejas, mezcladas.
2. Pulsa un elemento de cualquiera de las dos columnas, que queda seleccionado,
   y luego uno de la otra columna. También puede arrastrar un elemento hasta uno
   de la otra columna.
3. Los dos quedan como pareja: llevan el mismo número, que la distingue de las
   demás sin depender del color.
4. Para corregir, pulsa un elemento que ya tiene pareja y la pareja se deshace.
   También puede unir un elemento con otro que ya tenía pareja: la pareja
   anterior se deshace sola.
5. Cuando todos tienen pareja, pulsa "Comprobar".
6. Cada pareja se marca como correcta o incorrecta. La barra inferior dice
   "¡Correcto!" si todas están bien, o muestra "Respuesta correcta:" con una
   línea por cada pareja fallada: `{izquierda} → {derecha que le tocaba}`.

### Clasificar

1. El alumno ve la consigna (sin ella, "Clasifica cada elemento"), los elementos
   sin colocar, mezclados, y una zona por cada categoría, en el orden del autor.
2. Pulsa un elemento, que queda seleccionado, y luego una categoría. También
   puede arrastrarlo hasta la categoría.
3. Para corregir, pulsa un elemento ya colocado y vuelve a los elementos sin
   colocar, o lo arrastra a otra categoría.
4. Cuando no queda ninguno sin colocar, pulsa "Comprobar".
5. Cada elemento se marca como correcto o incorrecto. La barra inferior dice
   "¡Correcto!" si todos están bien, o muestra "Respuesta correcta:" con una
   línea por cada elemento fallado: `{elemento} → {categoría correcta}`.

### Ordenar

1. El alumno ve la consigna, los lugares numerados, vacíos, y debajo los
   elementos sin colocar, mezclados.
2. Pulsa un elemento y va al primer lugar libre. También puede arrastrarlo a un
   lugar en concreto.
3. Para corregir, pulsa un elemento ya colocado: vuelve a los elementos sin
   colocar y su lugar queda libre, sin que los demás se muevan.
4. Cuando todos los lugares están llenos, pulsa "Comprobar".
5. Cada lugar se marca como correcto o incorrecto. La barra inferior dice
   "¡Correcto!" si todos están bien, o muestra "Respuesta correcta:" con el
   orden completo, una línea por lugar: `1. {elemento}`.

### Banco de palabras

1. El alumno ve la consigna (sin ella, "Completa con las fichas del banco"), el
   texto con sus espacios y, debajo, las fichas mezcladas.
2. Pulsa una ficha, que sale del banco y va al primer espacio libre. También
   puede arrastrarla a un espacio en concreto.
3. Para corregir, pulsa una ficha ya colocada: vuelve al banco y su espacio
   queda libre.
4. Cuando todos los espacios están llenos, pulsa "Comprobar".
5. Cada espacio se marca como correcto o incorrecto, y junto a cada espacio
   incorrecto aparece la ficha esperada. La barra inferior dice "¡Correcto!" si
   todos están bien, o muestra "Respuesta correcta:" con el texto completo y sus
   espacios llenos (ver "Solución que se muestra" en "Validaciones").

### Soltar al arrastrar

| Tipo | Se suelta sobre | Qué pasa |
|---|---|---|
| Emparejar | Un elemento de la otra columna | Forman pareja, y se deshacen las que tuvieran antes |
| Clasificar | Una categoría | El elemento queda en ella, venga de donde venga |
| Clasificar | Los elementos sin colocar | Un elemento colocado vuelve ahí |
| Ordenar y banco | Un lugar libre | El elemento queda ahí |
| Ordenar y banco | Un lugar ocupado | Se intercambian: el que estaba ahí pasa a donde estaba el otro, o a los elementos sin colocar si el otro venía de ahí |
| Ordenar y banco | Los elementos sin colocar | Un elemento colocado vuelve ahí y su lugar queda libre |

### Terminar la lección

Cada actividad de estos tipos cuenta como una pregunta en "Acertaste {aciertos}
de {preguntas}" y en el progreso (F03, F04). Salir de la lección funciona como
en F03: elegir un elemento, formar una pareja o colocar algo cuenta como haber
hecho algo, así que salir pide confirmación.

### Agregar la actividad en el editor

En la paleta (F05), Emparejar, Clasificar, Ordenar y Banco de palabras dejan de
decir "Próximamente" y se agregan como los básicos: arrastrándolos o pulsándolos.
Reto de código, Terminal simulada, Grafo de commits y Escuchar y repetir siguen
deshabilitados.

El bloque de la secuencia muestra el inicio de la consigna. Sin ella muestra, en
emparejar, el texto izquierdo de la primera pareja; en clasificar, la primera
categoría; y en banco de palabras, el texto. Sin nada de eso, "Sin contenido".

### Formulario de cada tipo

**Emparejar**:

1. Consigna, con la ayuda "Si la dejas vacía, el alumno ve: Empareja los
   conceptos".
2. Empieza con tres parejas vacías. Cada fila tiene un campo a la izquierda, otro
   a la derecha y "Quitar". "Agregar pareja" suma una.

**Clasificar**:

1. Consigna, con la ayuda "Si la dejas vacía, el alumno ve: Clasifica cada
   elemento".
2. Categorías: empieza con dos vacías. "Agregar categoría" suma una y cada una
   tiene "Quitar".
3. Elementos: empieza con dos vacíos. Cada fila tiene su texto, un selector con
   las categorías y "Quitar". "Agregar elemento" suma uno. Una categoría sin
   nombre aparece en el selector como "Categoría {n}".
4. Si el autor quita una categoría, sus elementos se quedan sin categoría.

**Ordenar**:

1. Consigna.
2. Elementos: empieza con tres vacíos, con la ayuda "Escríbelos en el orden
   correcto. El alumno los verá mezclados.". Cada fila tiene su texto, "Subir",
   "Bajar" y "Quitar". "Agregar elemento" suma uno.

**Banco de palabras**:

1. Consigna, con la ayuda "Si la dejas vacía, el alumno ve: Completa con las
   fichas del banco".
2. Texto, con el botón "Agregar espacio" y la ayuda "Cada ___ es un espacio que
   el alumno llena con una ficha.". Va en letra monoespaciada, como en completar
   espacios.
3. Fichas: empieza con dos vacías, con la ayuda "Incluye las que van en los
   espacios y otras de más. Si una palabra va en dos espacios, agrégala dos
   veces.". "Agregar ficha" suma una y cada una tiene "Quitar".
4. Por cada `___` del texto, en orden, aparece un grupo "Espacio {n}" con las
   palabras del banco, sin repetir, como casillas. El autor marca las que valen
   en ese espacio. Si marca varias, cualquiera de ellas es correcta.
5. Cambiar el texto de una ficha conserva sus marcas. Quitar la última ficha con
   una palabra quita esa palabra de los grupos.
6. Si el texto tiene menos `___` que grupos, pasa lo mismo que en completar
   espacios (F05): los grupos sin marcas desaparecen solos y, si los que sobran
   tienen marcas, aparece "Hay más grupos de respuestas que espacios en el
   texto. Quita los que sobran." y cada grupo muestra "Quitar espacio".

### Vista previa y probar la lección

Funcionan igual que con los tipos básicos (F05): la vista previa muestra la
actividad real, se responde pulsando o arrastrando, y "Probar lección" la recorre
como un alumno.

## Validaciones

### Al cursar

- **Preguntas y aciertos**:
  - Los cuatro tipos cuentan como preguntas, una por actividad.
  - Se acierta solo si todo está bien: todas las parejas, todos los elementos,
    todos los lugares o todos los espacios. No hay aciertos parciales.
  - Cada una se responde una sola vez, como en F03: después de "Comprobar" no se
    puede cambiar ni reintentar.
- **"Comprobar" deshabilitado** hasta que la respuesta está completa: todos los
  elementos con pareja, ninguno sin colocar, todos los lugares llenos o todos los
  espacios llenos. Si después se deshace algo, vuelve a deshabilitarse.
- **Mezcla**: se mezcla cada vez que aparece la actividad, y al abrir de nuevo la
  lección puede salir en otro orden.
  - Emparejar: solo la columna derecha. Nunca sale con cada elemento frente a su
    pareja.
  - Clasificar: los elementos sin colocar. Las categorías no se mezclan.
  - Ordenar: los elementos sin colocar. Nunca salen ya en el orden correcto.
  - Banco de palabras: las fichas.
- **Pulsar en emparejar**:
  - Con un elemento seleccionado en la otra columna, pulsar forma la pareja,
    aunque el elemento pulsado ya tuviera una: esa se deshace.
  - Si no, pulsar un elemento con pareja la deshace, y pulsar uno sin pareja lo
    selecciona, en lugar del que estuviera seleccionado.
  - Pulsar el elemento seleccionado quita la selección.
- **Pulsar en clasificar**:
  - Con un elemento seleccionado, pulsar en cualquier parte de una categoría lo
    coloca ahí, también si se pulsa encima de un elemento ya colocado.
  - Sin selección, pulsar un elemento colocado lo devuelve, y pulsar una categoría
    no hace nada.
  - Pulsar otro elemento sin colocar mueve la selección, y pulsar el seleccionado
    la quita.
- **Pulsar en ordenar y banco**: pulsar un lugar vacío no hace nada. Con todos los
  espacios llenos, pulsar una ficha del banco tampoco.
- **Selección al arrastrar**: empezar a arrastrar quita la selección.
- **Una ficha se usa una vez**: al colocarla sale del banco. Dos fichas con el
  mismo texto son dos fichas, y da igual cuál se coloque.
- **Comparación en banco de palabras**: una ficha es correcta en un espacio si es
  una de las que valen en ese espacio. Se compara el texto exacto: "Rojo" y
  "rojo" son fichas distintas.
- **Solución que se muestra** (banco de palabras): tanto la ficha esperada junto
  a cada espacio incorrecto como el texto de "Respuesta correcta:" salen de una
  sola solución válida, que usa cada ficha una sola vez y, si se puede, deja en
  su lugar lo que el alumno acertó.
- **Zonas vacías**: la de los elementos sin colocar, el banco y las categorías
  siguen visibles aunque se queden vacías, para poder soltar ahí.
- **Acomodo**:
  - Emparejar: las dos columnas van lado a lado también en el móvil y en la vista
    previa, y los textos largos ocupan varias líneas.
  - Clasificar: las categorías van lado a lado en pantallas anchas, y una debajo
    de otra en pantallas angostas, en el móvil y en la vista previa.
  - Ningún texto se corta con "…". Si la actividad no cabe en la pantalla, se
    desplaza.
- **Barra inferior**: si la respuesta correcta es muy larga, "Continuar" sigue a
  la vista y su texto se desplaza.
- **Arrastrar**:
  - En el móvil, deslizar el dedo sin mantener pulsado desplaza la pantalla, aun
    si empieza sobre un elemento.
  - Si el destino no está a la vista, la pantalla se desplaza sola al acercar el
    elemento al borde.
  - Se arrastra un elemento a la vez.
  - Arrastrar no activa el gesto de atrás del teléfono.
  - Con "reducir movimiento", el elemento vuelve a su lugar sin animación y nada
    se sacude.
- **Texto de los elementos**: se muestran siempre como texto. Algo como
  `<title>`, `<b>hola</b>` o `<<<<<<<` se ve tal cual y no se interpreta, en las
  consignas, los elementos, las categorías, el texto, las fichas y la barra
  inferior.
- **Sangría**: los espacios al inicio de un elemento se respetan al mostrarlo,
  porque muchas veces es una línea de código. El texto del banco de palabras
  respeta sus saltos de línea y su sangría, como completar espacios.
- **Teclado** (web):
  - Todo se hace con Tab, Enter y la barra espaciadora, sin arrastrar. Las teclas
    1 a 9 no hacen nada en estos tipos.
  - Después de colocar algo, el foco pasa al siguiente elemento sin colocar; si
    ya no queda ninguno, a "Comprobar".
  - Después de formar una pareja, pasa al siguiente elemento sin pareja de la
    columna donde se empezó; si ya no queda ninguno, a "Comprobar".
  - Al devolver un elemento colocado, pasa a ese elemento.
- **Lectores de pantalla**: cada elemento anuncia su estado ("Seleccionado",
  "Pareja {n}", "En {categoría}", "Lugar {n}" o "Espacio {n}"), y cada cambio se
  anuncia al hacerlo. Correcto e incorrecto llevan icono además de color.

### Al editar

- **Actividad completa**: como en F05, su bloque lleva la marca "Incompleta"
  mientras le falte algo, y los errores de sus campos aparecen al intentar
  guardar.
- **Campos**: un campo obligatorio vacío muestra "Este campo es obligatorio.".
  Cada campo no deja escribir más de su límite.
- **Repetidos**: se comparan sin los espacios al inicio y al final, respetando las
  mayúsculas, como las opciones de F05.
- **Emparejar**:
  - Dos textos iguales en una misma columna muestran "Este texto está repetido.".
    Un texto sí se puede repetir en las dos columnas.
  - Con 3 parejas, "Quitar" está deshabilitado; con 8, también "Agregar pareja".
- **Clasificar**:
  - Dos categorías iguales muestran "Esta categoría está repetida.", y dos
    elementos iguales, "Este elemento está repetido.".
  - Un elemento sin categoría muestra "Elige una categoría.".
  - Una categoría sin elementos muestra "Esta categoría no tiene elementos.".
  - Con 2 categorías, su "Quitar" está deshabilitado; con 4, también "Agregar
    categoría". Con 2 elementos, su "Quitar" está deshabilitado; con 12, también
    "Agregar elemento".
- **Ordenar**:
  - Dos elementos iguales muestran "Este elemento está repetido.".
  - Con 3 elementos, "Quitar" está deshabilitado; con 10, también "Agregar
    elemento". "Subir" y "Bajar" siguen las reglas de F05.
- **Banco de palabras**:
  - Un texto sin `___` muestra "Agrega al menos un espacio con ___.". Con más de
    10, "El texto puede tener hasta 10 espacios.".
  - Hay exactamente un grupo por cada `___`.
  - Un espacio sin fichas marcadas muestra "Marca al menos una ficha.".
  - Las fichas sí se pueden repetir.
  - Tiene que haber una forma de llenar todos los espacios usando cada ficha una
    sola vez. Si no la hay, aparece "No alcanzan las fichas para llenar todos los
    espacios. Si una palabra va en dos, agrégala dos veces.".
  - Con 2 fichas, "Quitar" está deshabilitado; con 20, también "Agregar ficha".
- **Lo que se guarda**: las fichas se guardan sin espacios al inicio ni al final.
  Los demás textos, tal como se escribieron, con sus espacios al inicio (F05). Una
  consigna vacía no se guarda.
- **Vista previa**: arrastrar dentro de ella no mueve bloques de la secuencia ni
  agrega actividades, y arrastrar un bloque o un tipo de la paleta encima de ella
  no cambia la actividad.
- **El servidor comprueba todo**: los límites y las reglas de arriba, cada vez que
  se guarda una lección. Una palabra que vale en un espacio tiene que estar en el
  banco. Si algo no cumple, rechaza el cambio y no guarda nada, como en F05.
- **Solo los tipos disponibles**: el servidor acepta los nueve tipos que ya
  existen y sigue rechazando cualquier otro.

## Estados de la pantalla

### Reproductor de la lección (web y móvil)

Cargando, sin actividades, no disponible, error, sin conexión y confirmar salida
no cambian (F03): estas actividades llegan con la lección y no le piden nada al
servidor. Dentro de una actividad de estos tipos:

- Sin responder: la consigna, los elementos y "Comprobar" deshabilitado.
- Elemento seleccionado: con el aspecto de una opción seleccionada.
- Arrastrando: el elemento sigue al puntero o al dedo, su lugar de origen se ve
  atenuado y el destino que tiene debajo, resaltado.
- Respuesta completa: "Comprobar" habilitado.
- Respondida: cada elemento marcado como correcto o incorrecto, nada se puede
  mover, la barra inferior en verde con "¡Correcto!" o en rojo con la respuesta
  correcta, y el botón "Continuar".

### Lienzo de la lección (web)

No cambia (F05), salvo:

- Paleta: el grupo "Relacionar" se puede usar, y los cuatro tipos de "Código y
  terminal" y "Voz" siguen con "Próximamente".
- Actividad incompleta: en la vista previa, "Completa esta actividad para ver su
  vista previa.", también con estos tipos.

## Resultado esperado

- El alumno cursa los cuatro tipos en la web y en el móvil, pulsando o
  arrastrando, y cada uno suma una pregunta a su resultado y a su progreso.
- El autor agrega los cuatro tipos en el editor. Lo que guarda sigue ahí al
  recargar y, cuando el curso se publica, se cursa como se ve en la vista previa.
- Los cuatro cursos de prueba tienen las 27 actividades de estos tipos, en el
  lugar que ocupaban en el prototipo.

## Casos de error

- Lo que puede fallar al abrir, cursar, guardar o probar una lección no cambia
  (F03, F04, F05): la lección ya abierta se puede terminar sin conexión, y lo que
  el autor capturó sigue en pantalla si no se pudo guardar.
- El servidor rechaza una lección que el cliente dejó pasar: "Revisa los datos
  marcados." y, si dice qué actividad falló, esa actividad queda seleccionada
  (F05).
- Se suelta el elemento fuera de cualquier destino, o el arrastre se interrumpe
  (por ejemplo, llega una llamada o la app pasa a segundo plano): el elemento
  vuelve a donde estaba y nada cambia.
- Se pone un segundo dedo sobre otro elemento mientras se arrastra: ese elemento
  no se arrastra ni se selecciona.
- El alumno pulsa el botón de atrás del teléfono mientras arrastra: el arrastre se
  cancela y se aplica lo de F03 para salir de la lección.
- El alumno recarga la página o cierra la app a mitad de una actividad: como en
  F03, la lección empieza desde la primera actividad, sin respuestas.

## Fuera de alcance

- Corregir al momento cada pareja o elemento, reintentar una pregunta fallada y
  dar aciertos parciales.
- Arrastrar con el dedo en la web: en una pantalla táctil, ahí se pulsa.
- Arrastrar dentro de los formularios del editor: ahí se usan "Subir" y "Bajar".
- Dibujar líneas entre las parejas.
- Parejas de uno a varios, y elementos que van en más de una categoría.
- Varios órdenes correctos en ordenar.
- Elementos con imagen o con audio (F13), o con símbolos en grande como los
  mosaicos de la opción múltiple.
- Marcar los elementos de ordenar como código para verlos en letra monoespaciada.
- Sonidos y vibración al responder o al arrastrar (F15).
- Puntos e insignias (F08), glosario (F09) y cursar sin conexión (F10).
- Importar y exportar cursos en JSON (F07).
- Los demás tipos de actividad: F12 y F14.
- El editor en el móvil (decisión 0003).

## Criterios de aceptación

<!--
  Datos de prueba: los cuatro cursos del prototipo publicados, con sus 27
  actividades de estos tipos, y el curso "Actividades de prueba" con lo que se
  agrega en "Supuestos". Cómo prepararlos lo dice el quickstart.md del plan.
-->

### Cursos de prueba

- [ ] [backend] Los cuatro cursos de prueba tienen, entre todos, 9 actividades de
  emparejar, 9 de clasificar, 6 de ordenar y 3 de banco de palabras.
- [ ] [web, móvil] "Números del 1 al 5" (Japonés sencillo, 3) muestra, en este
  orden: emparejar, opción múltiple, tarjeta y ordenar.
- [ ] [web, móvil] "Tu primer commit" (Git esencial, 2) muestra su teoría y luego
  clasificar, con "Clasifica cada comando según lo que afecta.".

### Emparejar

- [ ] [web, móvil] En "Remotos: compartir tu trabajo" (Git esencial, 5) veo
  "Empareja los conceptos", a la izquierda `git clone <url>`, `git push`,
  `git pull` y `git fetch`, en ese orden y con `<url>` tal cual, y a la derecha
  sus cuatro descripciones. "Comprobar" está deshabilitado.
- [ ] [web, móvil] Al abrir varias veces esa lección, la columna derecha no sale
  siempre en el mismo orden, y nunca con cada comando frente a su descripción.
- [ ] [web, móvil] Al pulsar `git push` queda seleccionado; al pulsar "Sube tus
  commits locales al remoto", los dos llevan el mismo número. Empezando por la
  columna derecha pasa lo mismo.
- [ ] [web, móvil] Con `git push` seleccionado, al pulsar `git pull` la selección
  pasa a `git pull`; al pulsarlo otra vez ya no hay nada seleccionado.
- [ ] [web, móvil] Al pulsar un elemento que ya tiene pareja, los dos pierden su
  número.
- [ ] [web, móvil] Con `git push` unido a una descripción, al seleccionar `git
  pull` y pulsar esa misma descripción, forman pareja y `git push` se queda sin
  pareja.
- [ ] [web, móvil] "Comprobar" se habilita al formar la cuarta pareja y se
  deshabilita si deshago una.
- [ ] [web, móvil] Con las cuatro parejas bien, al comprobar todas quedan marcadas
  como correctas y la barra dice "¡Correcto!". Ya no puedo cambiar nada y el botón
  dice "Continuar".
- [ ] [web, móvil] Con `git pull` y `git fetch` cruzadas, al comprobar esas dos
  parejas quedan incorrectas y las otras dos correctas, y la barra muestra
  "Respuesta correcta:" con dos líneas: `git pull → Descarga y combina los commits
  nuevos del remoto` y `git fetch → Descarga los commits nuevos sin combinarlos
  todavía`.
- [ ] [móvil] En "align-items: el eje cruzado" (Examen unidad 1, 7), las dos
  columnas van lado a lado y las descripciones se leen completas, sin "…".

### Clasificar

- [ ] [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1) veo
  "Clasifica cada elemento", los seis elementos sin colocar y las categorías "Tipo
  de dato" y "Palabra clave", en ese orden. "Comprobar" está deshabilitado.
- [ ] [web, móvil] Al abrir varias veces esa lección, los elementos no salen
  siempre en el mismo orden.
- [ ] [web, móvil] Al pulsar `if` queda seleccionado; al pulsar "Palabra clave",
  queda en esa categoría. Sin elemento seleccionado, pulsar una categoría no hace
  nada.
- [ ] [web, móvil] Sin nada seleccionado, al pulsar `if` ya colocado vuelve a los
  elementos sin colocar.
- [ ] [web, móvil] Con `while` seleccionado, al pulsar encima de `if` ya colocado en
  "Palabra clave", `while` queda en esa categoría e `if` sigue ahí.
- [ ] [web, móvil] "Comprobar" se habilita al colocar el último elemento y se
  deshabilita si devuelvo uno.
- [ ] [web, móvil] Con todos bien, al comprobar quedan marcados como correctos y
  la barra dice "¡Correcto!".
- [ ] [web, móvil] Con `if` en "Tipo de dato" y los demás bien, al comprobar `if`
  queda incorrecto, los demás correctos, y la barra muestra "Respuesta correcta:"
  con `if → Palabra clave`.
- [ ] [web, móvil] En "Estructura semántica de HTML" (Examen unidad 1, 4), las
  categorías "Va dentro de <head>" y "Va dentro de <body>" y los elementos
  `<title>` y `<article>` se ven tal cual.
- [ ] [web] En una ventana ancha las categorías van lado a lado; en una angosta
  y en la vista previa, una debajo de otra.
- [ ] [móvil] Las categorías van una debajo de otra.

### Ordenar

- [ ] [web, móvil] En "Condicionales y operadores" (Programación en C sencilla, 2)
  veo la consigna, tres lugares numerados y vacíos y los tres elementos sin
  colocar, con `printf("Hola");` con su sangría. "Comprobar" está deshabilitado.
- [ ] [web, móvil] Al abrir varias veces esa lección, los elementos no salen
  siempre en el mismo orden, y nunca en el orden correcto.
- [ ] [web, móvil] Al pulsar un elemento va al lugar 1, y al pulsar otro, al lugar
  2.
- [ ] [web, móvil] Con tres elementos colocados, al pulsar el del lugar 1 vuelve a
  los elementos sin colocar, los otros dos no se mueven y "Comprobar" se
  deshabilita. El siguiente que pulso va al lugar 1.
- [ ] [web, móvil] En el orden correcto, al comprobar los tres lugares quedan
  correctos y la barra dice "¡Correcto!".
- [ ] [web, móvil] Con los lugares 2 y 3 cambiados, al comprobar el lugar 1 queda
  correcto, los otros dos incorrectos, y la barra muestra "Respuesta correcta:" con
  el orden completo, en líneas numeradas.
- [ ] [móvil] En "Patrones comunes con Flexbox" (Examen unidad 1, 11), con el orden
  equivocado, los elementos se leen completos y puedo leer toda la barra sin perder
  de vista "Continuar".

### Banco de palabras

- [ ] [web, móvil] En "Funciones" (Programación en C sencilla, 3) veo "Completa con
  las fichas del banco", `___ suma(int a, int b) {` con un espacio y las fichas
  `int`, `void` y `char`. "Comprobar" está deshabilitado.
- [ ] [web, móvil] Al abrir varias veces esa lección, las fichas no salen siempre
  en el mismo orden.
- [ ] [web, móvil] Al pulsar `void`, sale del banco y queda en el espacio, y
  "Comprobar" se habilita. Al pulsarla en el espacio, vuelve al banco y "Comprobar"
  se deshabilita.
- [ ] [web, móvil] Con el espacio lleno, pulsar otra ficha no hace nada.
- [ ] [web, móvil] Con `int`, al comprobar el espacio queda correcto y la barra
  dice "¡Correcto!".
- [ ] [web, móvil] Con `void`, al comprobar el espacio queda incorrecto, aparece
  `int` junto a él y la barra muestra "Respuesta correcta:" con `int suma(int a,
  int b) {`.
- [ ] [web, móvil] En "Saludos" (Japonés sencillo, 2), el texto `こんにちは、___
  ですか？` se ve con su espacio, y `元気` lo completa correctamente.
- [ ] [web, móvil] En "Actividades de prueba", en "Mis colores favoritos son ___ y
  ___." (donde los dos espacios aceptan "rojo" y "azul"), tanto "rojo y azul" como
  "azul y rojo" dan "¡Correcto!".
- [ ] [web, móvil] En esa actividad, después de colocar `rojo` ya no hay otra
  ficha `rojo` en el banco.
- [ ] [web, móvil] En esa actividad, con `verde` en el primer espacio y `rojo` en
  el segundo, el primero queda incorrecto con `azul` junto a él, el segundo
  correcto, y la barra muestra "Mis colores favoritos son azul y rojo.".
- [ ] [web, móvil] En "Actividades de prueba", en `___ doble(___ x)`, el banco
  tiene dos fichas `int`, y con una en cada espacio da "¡Correcto!".

### Arrastrar

- [ ] [web, móvil] En emparejar, al arrastrar `git push` hasta su descripción
  forman pareja, igual que pulsándolos. Al soltarlo sobre otro elemento de su misma
  columna, nada cambia.
- [ ] [web, móvil] En clasificar, arrastro un elemento a una categoría, de ahí a la
  otra y de vuelta a los elementos sin colocar.
- [ ] [web, móvil] En ordenar, con todos los lugares libres, arrastro un elemento
  al lugar 3 y queda ahí. Al pulsar otro, va al lugar 1.
- [ ] [web, móvil] En ordenar, al soltar el elemento del lugar 1 sobre el lugar 2,
  se intercambian. Al soltar un elemento sin colocar sobre un lugar ocupado, el que
  estaba ahí vuelve a los elementos sin colocar.
- [ ] [web, móvil] En "Mis colores favoritos son ___ y ___.", arrastro una ficha al
  segundo espacio con el primero libre, y de ahí de vuelta al banco.
- [ ] [web, móvil] Mientras arrastro, el elemento sigue al puntero o al dedo, su
  lugar de origen se ve atenuado y el destino debajo se resalta. Al soltarlo fuera
  de cualquier destino vuelve a donde estaba y nada cambia.
- [ ] [web, móvil] Con un elemento seleccionado, al empezar a arrastrar otro la
  selección se quita.
- [ ] [web, móvil] En "Actividades de prueba", en el clasificar de 12 elementos y 4
  categorías, con la última categoría fuera de la vista, al acercar un elemento al
  borde de la pantalla esta se desplaza sola y puedo soltarlo en esa categoría.
- [ ] [web, móvil] Después de "Comprobar", nada se puede arrastrar ni pulsar.
- [ ] [móvil] Al deslizar el dedo sobre un elemento sin mantenerlo pulsado, la
  pantalla se desplaza y el elemento no se mueve.
- [ ] [móvil] Mientras arrastro, un segundo dedo no arrastra otro elemento.
- [ ] [móvil] Arrastrar un elemento desde el borde de la pantalla no sale de la
  lección.
- [ ] [móvil] Si la app pasa a segundo plano mientras arrastro, al volver el
  elemento está donde estaba.
- [ ] [web, móvil] Con "reducir movimiento" activado, al soltar fuera el elemento
  vuelve sin animación, y lo incorrecto no se sacude.

### Teclado y accesibilidad

- [ ] [web] Resuelvo los cuatro tipos solo con Tab, Enter y la barra espaciadora,
  hasta "Continuar".
- [ ] [web] En clasificar, ordenar y banco, después de colocar un elemento el foco
  queda en el siguiente sin colocar, y después del último, en "Comprobar".
- [ ] [web] En emparejar, después de formar una pareja el foco queda en el
  siguiente sin pareja de la columna donde empecé, y después de la última, en
  "Comprobar".
- [ ] [web] En clasificar, ordenar y banco, al devolver un elemento colocado el foco
  queda en ese elemento.
- [ ] [web] En estos tipos, las teclas 1 a 9 no hacen nada.
- [ ] [web, móvil] Con un lector de pantalla, cada elemento anuncia su estado
  ("Seleccionado", "Pareja {n}", "En {categoría}", "Lugar {n}" o "Espacio {n}"), y
  se anuncia cada cambio al hacerlo.
- [ ] [web, móvil] Lo correcto y lo incorrecto llevan icono además de color.

### Resultado y salir

- [ ] [web, móvil] En "Números del 1 al 5" (Japonés sencillo, 3), acertando emparejar
  y la opción múltiple, y fallando ordenar, al terminar veo "Acertaste 2 de 3": la
  tarjeta no cuenta.
- [ ] [web, móvil] En esa lección, con una sola pareja mal, emparejar cuenta como
  fallada.
- [ ] [web, móvil] Al volver al curso, esa lección muestra "2 de 3 aciertos".
- [ ] [web, móvil] En "Números del 1 al 5", sin haber hecho nada, la X lleva directo
  al detalle del curso. Después de elegir un elemento, pide confirmación, y "Seguir
  aquí" me deja con lo que había elegido.
- [ ] [web, móvil] Con parejas formadas, confirmar la salida y abrir otra vez la
  lección empieza sin respuestas.

### Paleta y bloques

- [ ] [web] En la paleta, Emparejar, Clasificar, Ordenar y Banco de palabras se
  pueden agregar y no dicen "Próximamente". Reto de código, Terminal simulada, Grafo
  de commits y Escuchar y repetir siguen deshabilitados, con "Próximamente".
- [ ] [web] Al arrastrar o pulsar cada uno de los cuatro, queda en la secuencia con
  la marca "Incompleta", seleccionado y con el foco en su primer campo.
- [ ] [web] El bloque de emparejar muestra la consigna y, sin ella, el texto
  izquierdo de la primera pareja. El de clasificar, la consigna o la primera
  categoría. El de ordenar, la consigna. El de banco de palabras, la consigna o el
  texto. Sin nada de eso, "Sin contenido".

### Formularios

- [ ] [web] Emparejar empieza con tres parejas vacías. Con 3, "Quitar" está
  deshabilitado; con 8, también "Agregar pareja".
- [ ] [web] Con dos textos iguales en una columna (también " git " y "git"), al
  guardar el repetido muestra "Este texto está repetido.". Un mismo texto en las dos
  columnas sí se acepta, y "git" y "Git" también.
- [ ] [web] Clasificar empieza con dos categorías y dos elementos vacíos. Un
  elemento sin categoría muestra, al guardar, "Elige una categoría.", y una categoría
  sin elementos, "Esta categoría no tiene elementos.".
- [ ] [web] El selector de cada elemento muestra los nombres de las categorías, y
  "Categoría {n}" en una sin nombre. Al cambiarle el nombre a una categoría, el
  selector lo muestra.
- [ ] [web] Al quitar una categoría, sus elementos se quedan sin categoría.
- [ ] [web] Dos categorías iguales muestran "Esta categoría está repetida.", y dos
  elementos iguales, "Este elemento está repetido.". Clasificar deja tener de 2 a 4
  categorías y de 2 a 12 elementos.
- [ ] [web] Ordenar empieza con tres elementos vacíos y la ayuda "Escríbelos en el
  orden correcto. El alumno los verá mezclados.". "Subir" y "Bajar" cambian el orden
  correcto. Sin consigna, al guardar veo "Este campo es obligatorio.".
- [ ] [web] Ordenar deja tener de 3 a 10 elementos, y dos iguales muestran "Este
  elemento está repetido.".
- [ ] [web] En banco de palabras, "Agregar espacio" escribe `___` donde está el
  cursor y aparece el grupo "Espacio 1" con las palabras del banco como casillas.
  Escribir otro `___` a mano agrega "Espacio 2".
- [ ] [web] Una palabra repetida en las fichas aparece una sola vez en las casillas.
- [ ] [web] Un espacio sin marcas muestra, al guardar, "Marca al menos una ficha.".
  Un texto sin `___` muestra "Agrega al menos un espacio con ___.", y con 11, "El
  texto puede tener hasta 10 espacios.".
- [ ] [web] Con dos espacios que solo aceptan `int` y una sola ficha `int`, al
  guardar veo "No alcanzan las fichas para llenar todos los espacios. Si una palabra
  va en dos, agrégala dos veces."; al agregar otra ficha `int`, se guarda.
- [ ] [web] Al corregir el texto de una ficha marcada, sigue marcada. Al quitarla,
  su palabra desaparece de los grupos.
- [ ] [web] Con dos espacios con marcas, al borrar un `___` del texto los dos grupos
  siguen ahí, con "Hay más grupos de respuestas que espacios en el texto. Quita los
  que sobran." y "Quitar espacio". Si el grupo que sobra no tenía marcas, desaparece
  solo.
- [ ] [web] Banco de palabras deja tener de 2 a 20 fichas.
- [ ] [web] Cada campo no deja escribir más del límite de "Datos de entrada".
- [ ] [web] Las ayudas de la consigna dicen qué verá el alumno si se deja vacía, en
  los tres tipos en los que es opcional.

### Vista previa y prueba

- [ ] [web] Una actividad completa de cada tipo se ve en la vista previa como en el
  reproductor, y se responde pulsando y arrastrando.
- [ ] [web] Arrastrar un elemento dentro de la vista previa no mueve ningún bloque ni
  agrega actividades. Arrastrar un bloque o un tipo de la paleta encima de la vista
  previa no cambia la actividad.
- [ ] [web] Al cambiar la actividad en el inspector, la vista previa vuelve a
  empezar y el foco se queda en el campo. "Reiniciar" la devuelve al principio.
- [ ] [web] Una actividad incompleta de estos tipos muestra "Completa esta actividad
  para ver su vista previa.".
- [ ] [web] "Probar lección" recorre una lección con los cuatro tipos, y al terminar
  veo "Acertaste {aciertos} de 4".

### Guardar y servidor

- [ ] [web] Una lección con los cuatro tipos se guarda y, al recargar, sigue igual,
  con sus datos y en su orden. Un elemento de ordenar con sangría conserva su
  sangría.
- [ ] [web] Una ficha escrita con espacios al inicio y al final se guarda sin ellos.
  Una consigna vacía no se guarda: el alumno ve el texto por defecto.
- [ ] [web, móvil] Armo una lección con los cuatro tipos, un administrador publica el
  curso, y un alumno la cursa de principio a fin: en la web y en el móvil se ve igual
  que en la vista previa y su resultado cuenta las cuatro preguntas.
- [ ] [backend] Guardar, sin pasar por un cliente, emparejar con 2 o con 9 parejas, o
  con un texto repetido en una columna, se rechaza y la lección queda como estaba.
- [ ] [backend] Guardar clasificar con 1 o con 5 categorías, con 13 elementos, con un
  elemento repetido, con un elemento sin categoría o con una que no existe, o con una
  categoría sin elementos, se rechaza y la lección queda como estaba.
- [ ] [backend] Guardar ordenar sin consigna, con 2 o con 11 elementos, o con un
  elemento repetido, se rechaza y la lección queda como estaba.
- [ ] [backend] Guardar banco de palabras con 11 espacios, con 21 fichas, con un
  número de grupos distinto al de `___`, con un espacio sin fichas que valgan, con
  una palabra que vale y no está en el banco, o sin forma de llenar todos los
  espacios con cada ficha una sola vez, se rechaza y la lección queda como estaba.
- [ ] [backend] Guardar un texto más largo que su límite en cualquiera de los cuatro
  tipos, o un campo que el tipo no tiene, se rechaza y la lección queda como estaba.
- [ ] [backend] Guardar una actividad de un tipo que todavía no existe (por ejemplo,
  reto de código) se rechaza y la lección queda como estaba.

### Contenido

- [ ] [web, móvil] En "Actividades de prueba", la lección con `<b>hola</b>` y
  `<script>` en los textos de una actividad de cada uno de los cuatro tipos los
  muestra tal cual, también en la barra inferior, sin negritas y sin ejecutar nada.
- [ ] [web] Con esos textos, el formulario, el bloque y la vista previa los muestran
  tal cual.
- [ ] [web, móvil] En "Resolviendo conflictos" (Git esencial, 6), el elemento "Ver los
  marcadores <<<<<<< ======= >>>>>>>" se ve tal cual.
- [ ] [web, móvil] Las actividades de "Actividades de prueba" con los límites más
  altos (8 parejas, 12 elementos y 4 categorías, 10 elementos para ordenar y 20
  fichas) se pueden responder de principio a fin, con los textos completos.

## Datos que toca

- **Actividad** (F03, F05): se agregan cuatro tipos, con los límites de "Datos de
  entrada":
  - Emparejar: consigna (opcional) y parejas, cada una con su texto izquierdo y
    derecho. El orden de las parejas es el del autor.
  - Clasificar: consigna (opcional), categorías y elementos, cada uno con su texto y
    su categoría.
  - Ordenar: consigna y elementos, guardados en el orden correcto.
  - Banco de palabras: consigna (opcional), texto con espacios, fichas y, por cada
    espacio, las fichas que valen.

  Los cuatro cuentan como preguntas.
- **Leccion** (F02, F05): no cambia; sus actividades pueden ser de estos tipos.
- **Progreso** (F04): no cambia; estos tipos suman a las preguntas de la lección.

## Supuestos

- Los límites se eligieron con holgura sobre los valores más altos de los cursos del
  prototipo (4 parejas con textos de hasta 97 caracteres; 2 categorías de hasta 46 y
  6 elementos de hasta 50; 5 elementos para ordenar, de hasta 125; 1 espacio y 3
  fichas; consignas de hasta 134). Las 27 actividades cumplen todas las reglas de
  esta spec.
- Emparejar y ordenar piden al menos 3 elementos: con 2, la regla de que nunca salen
  resueltos delataría la respuesta.
- La consigna es opcional en tres tipos porque en el prototipo emparejar y banco de
  palabras no la tenían, y clasificar podía no tenerla. Ordenar la exige, como en el
  prototipo: sin ella no se sabe qué orden se pide. El texto por defecto de emparejar
  es el del prototipo.
- Ordenar se responde llenando lugares numerados, como en el prototipo, y no moviendo
  una lista ya armada. Así usa el mismo gesto que el banco de palabras, nunca hay una
  respuesta completa sin que el alumno haya hecho nada, y "Comprobar" sigue la regla
  de F03.
- A diferencia del prototipo, un lugar que se vacía queda libre y los demás no se
  recorren: al arrastrar se puede dejar un lugar libre antes de uno ocupado.
- En el móvil, arrastrar pide mantener pulsado un momento porque las actividades
  largas se desplazan: sin eso, cada intento de desplazar la pantalla movería un
  elemento.
- Las fichas que valen se marcan en casillas y no se escriben. Así el autor escribe
  cada palabra una sola vez y no puede aceptar una palabra que no está en el banco.
- Una ficha se usa una sola vez para que, si los dos espacios aceptan "rojo" y
  "azul", "rojo y rojo" no cuente como correcto. Por eso las fichas se pueden
  repetir: es la forma de usar una palabra en dos espacios.
- Las fichas se guardan recortadas porque se comparan por su texto exacto. No se
  ignoran mayúsculas ni acentos como en completar espacios, porque el alumno no
  escribe: elige.
- La barra inferior lista solo lo fallado en emparejar y clasificar, porque esas
  respuestas se entienden por partes. Ordenar y banco de palabras muestran la
  respuesta completa, porque solo se entienden juntas.
- Las actividades del prototipo se cargan con sus textos sin cambios, en su lugar
  dentro de la lección y sin glosario, como en F03. Solo cambia el formato: la
  instrucción pasa a consigna, el banco a fichas y las respuestas aceptadas a fichas
  que valen.
- Para validar los criterios, el curso "Actividades de prueba" agrega, solo mientras
  se valida (como en F03): una lección con `<b>hola</b>` y `<script>` en una actividad
  de cada tipo; una con "Mis colores favoritos son ___ y ___." (fichas "rojo", "azul"
  y "verde", y los dos espacios aceptan "rojo" y "azul") y `___ doble(___ x)` (dos
  fichas "int" y una "char"); y una con los límites más altos de cada tipo y textos
  largos.
- Cargar estas actividades cambia datos que citan criterios ya validados de F03 y F04,
  que no se reescriben porque registran lo que se validó entonces. Si hay que
  repetirlos: "Primeros pasos" (Programación en C sencilla, 1) tiene 4 preguntas en
  lugar de 3, "Hiragana: las vocales" (Japonés sencillo, 1) tiene 2 en lugar de 1, y
  "Tu primer commit" (Git esencial, 2) ya no es solo teoría: la lección sin preguntas
  pasa a ser "Ramas: trabajar en paralelo" (Git esencial, 4).
- La web, el móvil y el servidor cambian juntos: todavía no hay versiones publicadas
  del móvil que deban seguir funcionando con estos tipos.
- En la web no se detecta "sin conexión" aparte (igual que en F01 a F06).
- Lo que estas actividades agreguen a la interfaz se escribe primero en
  `docs/diseno.md`.
- Al cerrar la feature se actualiza `specs/02-modelo-datos.md` (los cuatro tipos, sus
  límites y que cuentan como preguntas). `specs/01-navegacion.md` solo agrega que
  colocar algo también pide confirmación al salir.

## Aclaraciones

### Sesión 2026-11-04

- P: En el prototipo, emparejar y clasificar corregían al momento y no se podían
  fallar. ¿Cómo se califican en Brote? → R: Con "Comprobar", como las demás preguntas
  de F03: el alumno arma toda su respuesta, se comprueba una sola vez y se acierta
  solo si todo está bien.
- P: ¿Cómo mueve el alumno los elementos? → R: Pulsando y arrastrando, en los dos
  clientes: en la web con el ratón y en el móvil con el dedo.
- P: ¿Cómo define el autor un banco de palabras? → R: Como en el prototipo: escribe la
  lista de fichas y, por cada espacio, indica cuáles valen. Un espacio puede aceptar
  varias, lo que permite espacios intercambiables.
