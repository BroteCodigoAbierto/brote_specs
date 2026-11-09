# F12: Actividades de código y terminal

**Estado**: Borrador
**Creada**: 2026-11-05
**Repos afectados**: backend | web | móvil
**Rama**: `feature/F12-actividades-codigo-terminal` (en cada repo afectado)
**Descripción original**: "F12 Actividades de código y terminal: reto de código,
terminal simulada y grafo de commits. Se cursan en la web y el móvil y se crean en el
editor de la web, como las de F11 (principio IV). En la paleta dejan de decir
"Próximamente". Siguen docs/diseno.md, sección 6 (panel oscuro #16142E, ui-monospace
14/22, cursor brote, también en modo claro). Decisiones ya tomadas:
- Reto de código: consigna, lenguaje de una lista fija (C, CSS, HTML, JavaScript,
  Python, SQL, Bash, Otro) que se muestra como etiqueta en el panel, código inicial
  opcional y solución. El alumno escribe en un campo de código de varias líneas, sin
  autocorrección ni mayúsculas automáticas en el móvil. Se califica por
  autoevaluación, como la pregunta abierta: al comprobar, el código queda de solo
  lectura, aparece la solución de referencia y el alumno dice si la tuvo bien. Sin
  coloreado de sintaxis. En la web, Tab mete dos espacios y Mayús+Tab los quita;
  después de Esc, Tab saca el foco del campo, y eso se anuncia debajo del campo.
- Terminal simulada: consigna, carpeta opcional, salida previa opcional, uno o más
  comandos aceptados, salida al acertar opcional y pista opcional. Un solo intento,
  como las demás actividades: Enter comprueba. Al comparar solo se ignoran los
  espacios al inicio, al final y repetidos; las mayúsculas y las comillas cuentan, y
  el autor da las formas que acepta. Si acierta, la terminal muestra la salida; si
  falla, la barra inferior muestra el comando esperado y, si hay, la pista.
- Grafo de commits: consigna, commits con nombre y padres (ninguno para el primero,
  dos para un merge), ramas que apuntan a un commit, HEAD opcional que apunta a una
  rama o a un commit, la respuesta (un commit) y una explicación opcional que sale al
  comprobar. El autor no da coordenadas: Brote acomoda el grafo solo, de izquierda a
  derecha, con una fila por rama, y lo ajusta al ancho del teléfono. El alumno elige
  un commit.
Los cursos de prueba ganan las actividades de estos tres tipos que están en
referencia/cursos-prototipo (13 retos, 12 terminales y 1 grafo), sin las coordenadas
del grafo."

## Objetivo

Que el alumno practique lo que se hace frente a una computadora: escribir código,
escribir un comando en una terminal y leer la historia de un repositorio. Que el
autor pueda crear estas tres actividades en el editor, sin programar. Con esta
feature y F11, Brote llega a 12 de sus 13 tipos de actividad, y los cursos de prueba
recuperan las 26 actividades de estos tipos que tenía el prototipo.

## Actor

- **Alumno**: usuario con sesión iniciada (F01) que cursa una lección de un curso
  publicado (F03), en la web o en el móvil.
- **Autor**: usuario con sesión iniciada que arma sus lecciones en el editor (F05),
  solo en la web (decisión 0003).

## Precondiciones

- El reproductor de lecciones (F03) y el editor (F05) funcionan. Abrir una lección y
  abrir el editor piden lo mismo que en esas features: sesión, curso publicado o curso
  propio, y llegar al servidor.
- Los cursos de prueba tienen cargadas las actividades de estos tres tipos (ver
  "Supuestos").

## Datos de entrada

Las longitudes cuentan caracteres. Un texto formado solo por espacios o saltos de
línea cuenta como vacío.

### Lo que responde el alumno

No se guarda: solo cuenta para el resultado de la lección (F03, F04).

- Código (reto de código): texto de varias líneas, de hasta 2000. Empieza con el
  código inicial. Para comprobar, tiene que tener algo escrito y ser distinto del
  código inicial.
- Autoevaluación (reto de código): "La tuve bien" o "No la tuve", obligatoria para
  continuar.
- Comando (terminal simulada): texto de una línea, de hasta 200, obligatorio para
  comprobar.
- Commit elegido (grafo de commits): uno de los commits del grafo, obligatorio para
  comprobar.

### Lo que escribe el autor

| Tipo | Campo | Dato | Obligatorio | Límites |
|---|---|---|---|---|
| Reto de código | Consigna | texto de varias líneas | sí | hasta 500 |
| | Lenguaje | uno de: C, CSS, HTML, JavaScript, Python, SQL, Bash u Otro | sí | — |
| | Código inicial | texto de varias líneas | no | hasta 2000 |
| | Solución | texto de varias líneas | sí | hasta 2000 |
| Terminal simulada | Consigna | texto de varias líneas | sí | hasta 500 |
| | Carpeta | texto de una línea | no | hasta 100 |
| | Salida previa | texto de varias líneas | no | hasta 2000 |
| | Comandos aceptados | lista de textos de una línea | sí | de 1 a 10, de hasta 200 cada uno |
| | Salida al acertar | texto de varias líneas | no | hasta 2000 |
| | Pista | texto de varias líneas | no | hasta 500 |
| Grafo de commits | Consigna | texto de varias líneas | sí | hasta 500 |
| | Commits | lista de commits, cada uno con su nombre (texto de una línea) y sus padres | sí | de 2 a 10; nombres de hasta 4; hasta 6 columnas (ver "Acomodo del grafo") |
| | Ramas | lista de ramas, cada una con su nombre (texto de una línea) y el commit al que apunta | no | de 0 a 4; nombres de hasta 20 |
| | HEAD | una de las ramas o uno de los commits | no | — |
| | Respuesta | uno de los commits | sí | — |
| | Explicación | texto de varias líneas | no | hasta 500 |

## Flujo principal

### Reto de código

1. El alumno ve la consigna y, debajo, un panel de código oscuro (también en modo
   claro) con el lenguaje como etiqueta (con "Otro", sin etiqueta). Dentro está el
   campo de código, en letra monoespaciada y con el cursor en verde, que empieza con
   el código inicial o vacío.
2. Escribe su código. Enter salta de línea. En la web, Tab mete dos espacios (ver
   "Campo de código" en "Validaciones").
3. Pulsa "Comprobar".
4. Su código queda de solo lectura y, debajo, aparece "Solución de referencia" con la
   solución en un panel de código igual, con la misma etiqueta. Luego, "¿La tuviste
   bien?" con "La tuve bien" y "No la tuve", como en la pregunta abierta (F03).
5. Elige uno. La barra inferior dice "¡Correcto!" o "A repasar", y el botón pasa a
   "Continuar".

### Terminal simulada

1. El alumno ve la consigna y, debajo, la terminal: un panel oscuro, como el del
   código, con la salida previa (si hay) y, después, la línea del comando: la carpeta
   (si hay), seguida de `$` y del cursor en verde.
2. Pulsa en cualquier parte de la terminal, lo que pone el cursor en la línea del
   comando (en el móvil, abre el teclado), y escribe el comando.
3. Pulsa Enter (en el móvil, la tecla de enviar del teclado) o "Comprobar". En el
   móvil, el teclado se cierra.
4. El comando se queda en su línea y ya no se puede cambiar.
   - Si es uno de los aceptados, la terminal muestra debajo la salida al acertar (si
     hay) y la barra inferior dice "¡Correcto!".
   - Si no, la terminal no muestra nada más, y la barra inferior muestra "Respuesta
     correcta:" con el primero de los comandos aceptados y, debajo, la pista (si hay).
5. El botón pasa a "Continuar".

### Grafo de commits

1. El alumno ve la consigna y el grafo, de izquierda a derecha (ver "Acomodo del
   grafo"): cada commit es un círculo con su nombre dentro, unido con una línea a cada
   uno de sus padres. Cada rama es una etiqueta con su nombre junto al commit al que
   apunta. HEAD es otra etiqueta: si apunta a una rama, va con ella y dice "HEAD →
   {rama}"; si apunta a un commit, va junto al commit y dice "HEAD".
2. Pulsa un commit, que queda seleccionado. Puede cambiar de commit.
3. Pulsa "Comprobar".
4. Como en la opción múltiple (F03): se marca el commit correcto y, si eligió otro, el
   suyo se marca como incorrecto. La barra inferior dice "¡Correcto!" o muestra
   "Respuesta correcta: {commit}" y, en los dos casos, debajo la explicación (si hay).
   Ya no se puede elegir otro commit.
5. El botón pasa a "Continuar".

### Terminar la lección

Cada actividad de estos tipos cuenta como una pregunta en "Acertaste {aciertos} de
{preguntas}" y en el progreso (F03, F04). Salir de la lección funciona como en F03:
escribir en el campo de código o en la terminal, o elegir un commit, cuenta como haber
hecho algo, así que salir pide confirmación.

### Agregar la actividad en el editor

En la paleta (F05), Reto de código, Terminal simulada y Grafo de commits dejan de
decir "Próximamente" y se agregan como los demás tipos: arrastrándolos o pulsándolos.
Escuchar y repetir sigue deshabilitado.

El bloque de la secuencia muestra el inicio de la consigna. Sin ella, "Sin
contenido".

### Formulario de cada tipo

**Reto de código**:

1. Consigna.
2. Lenguaje: un selector con "Elige un lenguaje" y los ocho lenguajes, en el orden de
   "Datos de entrada", con la ayuda "Se muestra como etiqueta en el panel de código.
   Con Otro, no se muestra.".
3. Código inicial, en letra monoespaciada, con la ayuda "El alumno empieza con este
   código. Si lo dejas vacío, empieza en blanco.".
4. Solución, en letra monoespaciada, con la ayuda "El alumno la ve al comprobar, para
   compararla con lo que escribió.".

**Terminal simulada**:

1. Consigna.
2. Carpeta, con la ayuda "Se ve antes del $. Por ejemplo: ~/proyectos/mi-app
   (main).".
3. Salida previa, en letra monoespaciada, con la ayuda "Lo que la terminal ya muestra
   antes de que el alumno escriba.".
4. Comandos aceptados: empieza con uno vacío, en letra monoespaciada, con la ayuda
   "Escribe cada forma que aceptas. Los espacios de sobra no cuentan; las mayúsculas y
   las comillas, sí.". El primero lleva la nota "Es el que ve el alumno como respuesta
   correcta". "Agregar comando" suma uno y cada uno tiene "Quitar".
5. Salida al acertar, en letra monoespaciada, con la ayuda "La terminal la muestra si
   el alumno acierta.".
6. Pista, con la ayuda "Se muestra solo si el alumno falla, junto al comando
   esperado.".

**Grafo de commits**:

1. Consigna.
2. Commits, con la ayuda "Escríbelos del más antiguo al más nuevo: un commit solo
   puede tener como padres a los de arriba. Con un segundo padre, es un merge.".
   - Empieza con dos commits sin nombre: el primero sin padre y el segundo con el
     primero como padre.
   - Cada fila tiene su nombre, un selector "Padre" con los commits de arriba, un
     selector "Segundo padre" con "Ninguno" y los commits de arriba, y "Quitar". La
     primera fila no tiene selectores: dice "Primer commit: no tiene padre".
   - "Agregar commit" suma uno al final, con el último como padre.
   - Un commit sin nombre aparece en los selectores como "Commit {n}".
3. Ramas: empieza sin ninguna. "Agregar rama" suma una fila con su nombre, un selector
   "Commit" y "Quitar". Una rama sin nombre aparece en los selectores como "Rama {n}".
4. HEAD: un selector con "Sin HEAD", luego cada rama ("Rama {nombre}") y luego cada
   commit ("Commit {nombre}"). Empieza en "Sin HEAD".
5. Respuesta: un selector con "Elige la respuesta" y los commits.
6. Explicación, con la ayuda "El alumno la ve al comprobar, acierte o no.".
7. Cambiarle el nombre a un commit o a una rama no cambia nada más: los selectores
   muestran el nombre nuevo y siguen eligiendo lo mismo.
8. Al quitar un commit, lo que lo usaba se queda vacío: un padre, el commit de una rama
   y la respuesta muestran su error al guardar; un segundo padre vuelve a "Ninguno" y
   HEAD, a "Sin HEAD". Si se quita el primero, el que sigue pasa a ser el primero y
   se queda sin padre.
9. Al quitar una rama a la que apunta HEAD, HEAD vuelve a "Sin HEAD".

### Vista previa y probar la lección

Funcionan igual que con los demás tipos (F05, F11): la vista previa muestra la
actividad real, que se responde como en el reproductor, y "Probar lección" la recorre
como un alumno.

## Validaciones

### Al cursar

- **Preguntas y aciertos**:
  - Los tres tipos cuentan como preguntas, una por actividad.
  - El reto de código se acierta si el alumno elige "La tuve bien"; la terminal, si el
    comando es uno de los aceptados; y el grafo, si el commit elegido es la respuesta.
  - Cada una se responde una sola vez, como en F03: después de "Comprobar" no se puede
    cambiar ni reintentar.
- **"Comprobar" deshabilitado** hasta que hay respuesta:
  - Reto de código: el código tiene algo escrito y es distinto del código inicial. Si
    el alumno lo deja otra vez igual al inicial, vuelve a deshabilitarse.
  - Terminal: el comando tiene algo escrito. Con el comando vacío, Enter no hace nada.
  - Grafo: hay un commit elegido. Pulsar el commit elegido lo deja elegido.
- **Comparación de comandos**: el comando es correcto si coincide con alguno de los
  aceptados sin contar los espacios al inicio y al final, y contando varios espacios
  seguidos como uno. Todo lo demás cuenta: mayúsculas, comillas, acentos y signos.
  `Git init` no es `git init`, y si el único comando aceptado es `git commit -m
  "Primer commit"`, escribir `git commit -m 'Primer commit'` es incorrecto. El comando
  que se muestra como respuesta correcta es el primero de los aceptados, tal como lo
  escribió el autor. Como lo que escribe el alumno no cambia (ver abajo), si el autor
  escribe comillas tipográficas (“ ” ‘ ’), una raya (—) o puntos suspensivos (…) en un
  comando aceptado, al comparar cuentan como `"`, `'`, `--` y `...`: así el comando se
  puede acertar.
- **Lo que se escribe no cambia**: en el campo de código y en la terminal no hay
  corrector ortográfico, autocorrección ni mayúsculas automáticas. Las comillas se
  quedan rectas (`"` y `'`) y no pasan a comillas tipográficas (“ ” ‘ ’), dos guiones
  (`--`) no pasan a una raya (—) y tres puntos (`...`) no pasan a puntos suspensivos
  (…). Vale en la web y en el móvil.
- **Límites**: el campo de código no deja escribir más de 2000 caracteres, y la
  terminal, más de 200. Al pegar un texto más largo, se queda lo que cabe.
- **Campo de código** (web):
  - Tab mete dos espacios donde está el cursor; con varias líneas seleccionadas, los
    mete al inicio de cada una. Mayús+Tab quita hasta dos espacios del inicio de la
    línea del cursor o de cada línea seleccionada.
  - Deshacer (Ctrl+Z, o Cmd+Z en Mac) deshace los espacios de Tab y de Mayús+Tab como
    cualquier otra escritura.
  - Después de pulsar Esc, el siguiente Tab saca el foco del campo hacia adelante, y
    Mayús+Tab, hacia atrás. Si después de Esc se escribe otra cosa, Tab vuelve a meter
    espacios. Al volver al campo, Tab mete espacios otra vez.
  - Debajo del campo se lee "Tab agrega dos espacios. Para salir del campo, pulsa Esc
    y luego Tab.", y los lectores de pantalla lo anuncian al entrar al campo.
  - Ya de solo lectura, Tab sale del campo como en cualquier otro, y ese texto ya no
    aparece.
  - Enter salta de línea y no comprueba, como en el campo de la pregunta abierta (F03).
- **Campo de código** (móvil): el teclado no tiene Tab, así que la sangría se escribe
  con espacios. El campo no cambia lo que se escribe (ver arriba).
- **Código**: el del alumno, el inicial y la solución se ven en letra monoespaciada,
  con sus saltos de línea, su sangría y sus espacios, y sin colores: ni de sintaxis ni
  de diff (una línea que empieza con `-`, `+` o `@@` se ve como las demás). En el
  panel de la solución, una línea más ancha que el panel se desplaza hacia los lados
  en vez de cortarse. En el campo del alumno, pasa a la línea siguiente o se desplaza
  hacia los lados, y nunca se corta.
- **Altura**: el campo de código muestra al menos 6 líneas y crece con el código. En el
  móvil crece hasta 12 líneas y, con más, se desplaza por dentro, para que la línea que
  se escribe no quede debajo del teclado. La terminal crece con lo que muestra. Si la
  actividad no cabe en la pantalla, se desplaza.
- **Terminal**:
  - La salida previa, el comando y la salida al acertar respetan sus saltos de línea,
    sus líneas en blanco, su sangría y sus tabulaciones.
  - Una línea más ancha que la terminal pasa a la línea siguiente, como en una terminal
    real, también mientras se escribe el comando.
  - Sin carpeta, la línea del comando empieza solo con `$`.
  - Pegar un texto con saltos de línea no comprueba: el texto queda en la línea del
    comando, con cada salto de línea convertido en un espacio, y el alumno pulsa Enter.
- **Acomodo del grafo**:
  - **Columnas**: el primer commit va en la primera columna, y cada uno de los demás,
    en la columna que sigue a la del padre que esté más a la derecha. Así, los commits
    que van en paralelo quedan en la misma columna.
  - **Filas**: las ramas se recorren en el orden del autor. Cada una ocupa una fila
    nueva, debajo de las anteriores, con su commit y los anteriores que se alcanzan
    siguiendo siempre el primer padre, hasta llegar a uno que ya tiene fila. Una rama
    cuyo commit ya tiene fila no agrega fila. Después, los commits que quedan sin fila
    se acomodan igual, en filas nuevas, empezando por el último de la lista que no
    tenga fila.
  - Sin ramas, la primera fila sale del último commit de la lista.
  - Las líneas unen cada commit con sus padres. Un merge tiene dos.
  - **Ancho**: el grafo cabe en el ancho disponible, sin estirarse de más en una ventana
    ancha, y no se desplaza hacia los lados, en la web, el móvil y la vista previa, también con 6 columnas en un teléfono de 360
    px de ancho. Cada commit se pulsa en un área de al menos 44 px que no se encima con
    la de otro. Con letra grande en el teléfono, el grafo se puede desplazar hacia los
    lados antes que cortar o encimar un nombre.
  - Los nombres de los commits y las etiquetas se leen completos, sin "…", y no se
    enciman entre sí. Varias etiquetas en un mismo commit se ven todas.
- **Barra inferior**: el comando esperado y el nombre del commit van en letra
  monoespaciada. Si la respuesta, la pista o la explicación son muy largas,
  "Continuar" sigue a la vista y el texto se desplaza (F11).
- **Texto**: todo se muestra como texto. Algo como `<title>`, `<b>hola</b>` o
  `<script>` se ve tal cual y no se interpreta, en las consignas, el código, la
  solución, la carpeta, las salidas, los comandos, la pista, los nombres de commits y
  ramas, la explicación y la barra inferior.
- **Teclado** (web):
  - Terminal: Enter comprueba, también con el foco en la línea del comando.
  - Grafo: Tab recorre los commits de izquierda a derecha y, en una misma columna, de
    arriba abajo. Enter o la barra espaciadora eligen el commit que tiene el foco. Las
    teclas 1 a 9 no hacen nada.
  - En la terminal y el grafo, al comprobar, el foco pasa a "Continuar", como en F03.
    En el reto, el foco se mueve como en la pregunta abierta, y pasa a "Continuar" al
    autoevaluarse.
- **Lectores de pantalla**:
  - El campo de código se llama "Tu código" y anuncia el lenguaje (si no es "Otro").
  - La línea de la terminal se llama "Comando" y anuncia la carpeta, si hay.
  - Cada commit anuncia su nombre, sus padres, las ramas y HEAD que apuntan a él y si
    está elegido; al comprobar, si es el correcto o el incorrecto. Por ejemplo:
    "Commit c2, padre c1, elegido".
  - Correcto e incorrecto llevan icono además de color.

### Al editar

- **Actividad completa**: como en F05, su bloque lleva la marca "Incompleta" mientras
  le falte algo, y los errores de sus campos aparecen al intentar guardar.
- **Campos**: un campo obligatorio vacío muestra "Este campo es obligatorio.". Cada
  campo no deja escribir más de su límite. Los campos de una línea no aceptan saltos
  de línea.
- **Repetidos**: se comparan sin los espacios al inicio y al final, respetando las
  mayúsculas, como las opciones de F05. Los comandos, además, cuentan varios espacios
  seguidos como uno y las comillas tipográficas, la raya y los puntos suspensivos como
  sus versiones rectas, igual que al cursar.
- **Reto de código**: sin lenguaje, "Elige un lenguaje.".
- **Terminal simulada**:
  - Dos comandos iguales muestran "Este comando está repetido.". `git init` y `Git
    init` no son iguales.
  - Con 1 comando, "Quitar" está deshabilitado; con 10, también "Agregar comando".
- **Grafo de commits**:
  - Dos commits con el mismo nombre muestran "Este nombre ya lo tiene otro commit.".
  - Cada commit, menos el primero, tiene padre: sin él, "Elige un padre.". Un segundo
    padre igual al primero muestra "El segundo padre tiene que ser otro commit.".
  - Con 2 commits, "Quitar" está deshabilitado; con 10, también "Agregar commit".
  - Si el grafo pasa de 6 columnas, debajo de los commits aparece "El grafo puede
    tener hasta 6 commits seguidos de izquierda a derecha. Pon alguno en paralelo o
    quita alguno.".
  - Dos ramas con el mismo nombre muestran "Esta rama está repetida.". Una rama
    llamada `HEAD` muestra "Una rama no se puede llamar HEAD.". Una rama sin commit
    muestra "Elige un commit.".
  - Con 4 ramas, "Agregar rama" está deshabilitado.
  - Sin respuesta, "Elige la respuesta.".
- **Lo que se guarda**: la carpeta, los comandos y los nombres de commits y ramas se
  guardan sin espacios al inicio ni al final. Los demás textos, tal como se
  escribieron, con su sangría (F05). Un campo opcional vacío no se guarda.
- **Vista previa**: las teclas de la actividad solo actúan con el foco dentro (F05):
  Tab en su campo de código mete espacios, y Enter en su terminal comprueba solo esa
  actividad. Pulsar un commit no selecciona ningún bloque.
- **El servidor comprueba todo**: los límites y las reglas de arriba, cada vez que se
  guarda una lección. Además: el lenguaje es uno de la lista; el primer commit no
  tiene padres y cada uno de los demás tiene uno o dos, distintos y de más arriba en la
  lista; las ramas, HEAD y la respuesta apuntan a algo que existe. Si algo no cumple,
  rechaza el cambio y no guarda nada, como en F05.
- **Solo los tipos disponibles**: el servidor acepta estos tres además de los que ya
  existen, y sigue rechazando escuchar y repetir y cualquier otro.

## Estados de la pantalla

### Reproductor de la lección (web y móvil)

Cargando, sin actividades, no disponible, error, sin conexión y confirmar salida no
cambian (F03): estas actividades llegan con la lección y no le piden nada al servidor.
Dentro de una actividad de estos tipos:

- **Reto de código**:
  - Sin responder: la consigna, el panel con el código inicial (o vacío) y "Comprobar"
    deshabilitado.
  - Con código: "Comprobar" habilitado.
  - Comprobado: el código de solo lectura, la solución de referencia y "¿La tuviste
    bien?".
  - Respondida: la barra inferior en verde con "¡Correcto!" o en rojo con "A
    repasar", y el botón "Continuar".
- **Terminal simulada**:
  - Sin responder: la consigna, la terminal con la línea del comando vacía y
    "Comprobar" deshabilitado.
  - Con comando: "Comprobar" habilitado.
  - Respondida: el comando fijo en su línea; si acertó, la salida debajo y la barra en
    verde con "¡Correcto!"; si no, la barra en rojo con la respuesta correcta y la
    pista. El botón "Continuar".
- **Grafo de commits**:
  - Sin responder: la consigna, el grafo y "Comprobar" deshabilitado.
  - Commit elegido: con el aspecto de una opción seleccionada, y "Comprobar"
    habilitado.
  - Respondida: el commit correcto marcado y, si se eligió otro, ese marcado como
    incorrecto; la barra inferior en verde o en rojo, con la explicación; y el botón
    "Continuar".

### Lienzo de la lección (web)

No cambia (F05), salvo:

- Paleta: el grupo "Código y terminal" se puede usar, y Escuchar y repetir sigue con
  "Próximamente".
- Actividad incompleta: en la vista previa, "Completa esta actividad para ver su vista
  previa.", también con estos tipos y con un grafo de más de 6 columnas.

## Resultado esperado

- El alumno cursa los tres tipos en la web y en el móvil, y cada uno suma una pregunta
  a su resultado y a su progreso.
- El autor agrega los tres tipos en el editor. Lo que guarda sigue ahí al recargar y,
  cuando el curso se publica, se cursa como se ve en la vista previa.
- Los cuatro cursos de prueba tienen las 26 actividades de estos tipos, en el lugar
  que ocupaban en el prototipo.

## Casos de error

- Lo que puede fallar al abrir, cursar, guardar o probar una lección no cambia (F03,
  F04, F05): la lección ya abierta se puede terminar sin conexión, y lo que el autor
  capturó sigue en pantalla si no se pudo guardar.
- El servidor rechaza una lección que el cliente dejó pasar: "Revisa los datos
  marcados." y, si dice qué actividad falló, esa actividad queda seleccionada (F05).
- El teclado del teléfono tapa el campo de código o la terminal: la actividad se
  desplaza para que se vea la línea que se está escribiendo.
- El alumno pega en la terminal un texto con saltos de línea, o en el campo de código
  uno más largo que el límite: ver "Terminal" y "Límites" en "Validaciones".
- El alumno recarga la página o cierra la app a mitad de una actividad: como en F03,
  la lección empieza desde la primera actividad, sin respuestas, y el campo de código
  vuelve a tener el código inicial.

## Fuera de alcance

- Ejecutar el código o los comandos, y calificar el código sin autoevaluación.
- Coloreado de sintaxis, números de línea, autocompletar, sangría automática al saltar
  de línea y cerrar paréntesis o comillas solo.
- Una terminal que responda a cualquier comando (por ejemplo, con "comando no
  encontrado" o cambiando de carpeta), varios comandos seguidos en una misma
  actividad, historial con las flechas y autocompletar con Tab en la terminal.
- Comparar comandos sin mayúsculas o sin comillas, o aceptarlos por patrón.
- Que el alumno mueva commits o ramas, elija más de un commit o vea el grafo cambiar.
- Coordenadas del autor, grafos con más de un commit sin padre, de más de 10 commits o
  de más de 6 columnas, y nombres de commit largos como un hash completo.
- Reordenar los commits en el formulario: la historia se cambia con sus padres.
- Tab con espacios en los campos de código del editor: ahí Tab cambia de campo, como
  en F05.
- Sonidos y vibración al responder (F15), puntos e insignias (F08), glosario (F09) y
  cursar sin conexión (F10).
- Importar y exportar cursos en JSON (F07) e imágenes y audio propios (F13).
- Escuchar y repetir (F14).
- El editor en el móvil (decisión 0003).

## Criterios de aceptación

<!--
  Datos de prueba: los cuatro cursos del prototipo publicados, con sus 26
  actividades de estos tipos y las de F11, y el curso "Actividades de prueba" con lo
  que se agrega en "Supuestos". Cómo prepararlos lo dice el quickstart.md del plan.
-->

### Cursos de prueba

- [x] [backend] Los cuatro cursos de prueba tienen, entre todos, 13 retos de código (3
  en C y 10 en CSS), 12 terminales simuladas y 1 grafo de commits.
- [x] [web, móvil] "Tu primer commit" (Git esencial, 2) muestra, en este orden: teoría,
  cuatro terminales y clasificar.
- [x] [web, móvil] "Ramas: trabajar en paralelo" (Git esencial, 4) muestra, en este
  orden: teoría, terminal, grafo, teoría, terminal y terminal.
- [x] [web, móvil] "Patrones comunes con Flexbox" (Examen unidad 1, 11) muestra, en este
  orden: teoría, opción múltiple, reto, reto, ordenar, reto, tarjeta y pregunta
  abierta.

### Reto de código

- [x] [web, móvil] En "Condicionales y operadores" (Programación en C sencilla, 2), el
  reto muestra "Escribe una función 'esPar' en C que reciba un entero y devuelva 1 si
  es par, 0 si no.", la etiqueta "C" y el campo con `int esPar(int n) {`, una línea con
  dos espacios y `}`. "Comprobar" está deshabilitado.
- [x] [web, móvil] El panel es oscuro en modo claro y en modo oscuro, con letra
  monoespaciada y el cursor en verde.
- [x] [web, móvil] Al escribir en el campo, "Comprobar" se habilita. Si borro lo que
  escribí y el código queda igual al inicial, se deshabilita.
- [x] [web, móvil] Al comprobar, mi código queda de solo lectura y aparece "Solución de
  referencia" con la etiqueta "C" y `return n % 2 == 0;` con su sangría, y "¿La
  tuviste bien?" con "La tuve bien" y "No la tuve".
- [x] [web, móvil] Con "La tuve bien", la barra dice "¡Correcto!" y la pregunta cuenta
  como acertada; con "No la tuve", dice "A repasar" y cuenta como fallada.
- [x] [web, móvil] En "flex: 1 y el tamaño de los elementos" (Examen unidad 1, 8), el
  código inicial muestra sus tres bloques, `.layout`, `.sidebar` y `.main`, separados
  por líneas en blanco, y la etiqueta "CSS".
- [x] [web, móvil] En "Actividades de prueba", el reto de SQL sin código inicial empieza
  con el campo vacío y "Comprobar" deshabilitado. Su solución, con una línea `--
  Todos los alumnos`, se ve sin colores, igual que las demás líneas.
- [x] [web, móvil] En "Actividades de prueba", el reto con lenguaje "Otro" no muestra
  etiqueta.
- [x] [web, móvil] En "Actividades de prueba", en el reto al límite, una línea más ancha
  que el panel se lee completa en el campo y en la solución.
- [x] [web] Con el cursor al final de la segunda línea, Tab mete dos espacios más y
  Mayús+Tab los quita. Con tres líneas seleccionadas, Tab mete dos espacios al inicio de cada una, y
  Ctrl+Z (Cmd+Z en Mac) lo deshace.
- [x] [web] Debajo del campo veo "Tab agrega dos espacios. Para salir del campo, pulsa
  Esc y luego Tab.". Después de Esc, Tab lleva el foco a lo que sigue y Mayús+Tab a lo
  anterior. Al volver al campo, Tab mete espacios otra vez.
- [x] [web] Enter en el campo salta de línea y no comprueba.
- [x] [web] Después de comprobar, Tab sale del campo y el texto sobre Tab ya no
  aparece.
- [ ] [móvil] En el campo de código, el teclado no corrige palabras ni pone mayúscula al
  empezar una línea, `"` y `'` quedan rectas, y `...` se queda como tres puntos.
- [ ] [móvil] Con más de 12 líneas, el campo deja de crecer y se desplaza por dentro, y la
  línea que escribo sigue a la vista con el teclado abierto.

### Terminal simulada

- [x] [web, móvil] En "Tu primer commit" (Git esencial, 2), la primera terminal muestra
  "Estás en una carpeta con un proyecto nuevo. Conviértela en un repositorio Git.", la
  salida previa `README.md` e `index.html` en dos líneas y, debajo, `~/proyectos/mi-app
  $` con el cursor. "Comprobar" está deshabilitado.
- [x] [web, móvil] La terminal es oscura en modo claro y en modo oscuro, con el cursor en
  verde. Al pulsar en cualquier parte de ella, el cursor queda en la línea del comando
  (en el móvil, se abre el teclado).
- [x] [web, móvil] Con el comando vacío o solo con espacios, "Comprobar" está
  deshabilitado y Enter no hace nada.
- [x] [web, móvil] Al escribir `git init` y pulsar Enter (en el móvil, la tecla de enviar
  del teclado), la terminal muestra debajo `Initialized empty Git repository in
  ~/proyectos/mi-app/.git/` y la barra dice "¡Correcto!". El comando ya no se puede
  cambiar y el botón dice "Continuar".
- [x] [web, móvil] `  git   init  ` también es correcto.
- [x] [web, móvil] `Git init` es incorrecto: la terminal no muestra nada más, y la barra
  muestra "Respuesta correcta:" con `git init` y, debajo, "El comando que inicializa un
  repositorio es "git init".".
- [x] [web, móvil] En la cuarta terminal de esa lección, `git commit -m "Primer commit"`
  y `git commit -m 'Primer commit'` son correctos. `git commit -m Primer commit` es
  incorrecto, y la barra muestra `git commit -m "Primer commit"`.
- [x] [web, móvil] En la segunda terminal de esa lección, al acertar, la salida respeta
  sus líneas en blanco y la sangría de `README.md` e `index.html`.
- [x] [web, móvil] En "Remotos: compartir tu trabajo" (Git esencial, 5), al escribir
  `git clone https://github.com/usuario/mi-app.git` el comando se lee completo mientras
  lo escribo, y la salida al acertar se lee completa, sin desplazarse hacia los lados.
- [x] [web, móvil] En "Actividades de prueba", la terminal sin carpeta, salida previa,
  salida al acertar ni pista muestra solo `$` y el cursor. Al acertar, solo queda el
  comando y "¡Correcto!"; al fallar, la barra muestra solo el comando esperado.
- [x] [web, móvil] Al pegar `git init` con un salto de línea al final, no se comprueba:
  el comando queda en su línea hasta que pulso Enter.
- [ ] [móvil] En la terminal, el teclado no corrige palabras ni pone mayúscula al
  empezar, y `"` y `'` quedan rectas.
- [ ] [móvil] En "Viajar en el tiempo: historial y diffs" (Git esencial, 3), al escribir
  `git log --oneline` los dos guiones se quedan como dos guiones, y es correcto.
- [ ] [móvil] Con el teclado abierto, la línea del comando sigue a la vista. Al
  comprobar, el teclado se cierra.

### Grafo de commits

- [x] [web, móvil] En "Ramas: trabajar en paralelo" (Git esencial, 4), el grafo muestra
  "Hiciste dos commits en main (c1, c2). Luego creaste la rama feature en c2 e
  hiciste ahí un commit más (c3). ¿A qué commit apunta main ahora mismo?", y `c1`,
  `c2` y `c3` en una fila, de izquierda a derecha, unidos por líneas, con la etiqueta
  `feature` en `c3` y sin HEAD. "Comprobar" está deshabilitado.
- [x] [web, móvil] Al pulsar `c3` queda elegido; al pulsar `c2`, la elección pasa a
  `c2`. "Comprobar" se habilita con el primero.
- [x] [web, móvil] Con `c2`, al comprobar queda marcado como correcto y la barra dice
  "¡Correcto!" y, debajo, "Crear y moverte a una rama nueva no mueve main: se queda
  apuntando a c2, el commit desde el que creaste feature. El nuevo commit c3 solo
  existe en feature.".
- [x] [web, móvil] Con `c3`, al comprobar `c3` queda incorrecto y `c2` correcto, y la
  barra muestra "Respuesta correcta: c2" y la explicación. Ya no puedo elegir otro
  commit.
- [x] [web, móvil] En "Actividades de prueba", en el grafo con un merge, `c1`, `c2`, `c3`
  y `c5` van en la primera fila, con "HEAD → main" en `c5`, y `c4` va en la segunda,
  debajo de `c3`, con `feature`. `c5` está unido a `c3` y a `c4`.
- [x] [web, móvil] En "Actividades de prueba", en el grafo de una rama ya borrada, el
  commit sin rama va en una segunda fila, debajo del commit de la primera fila que
  está en su misma columna.
- [x] [web, móvil] En "Actividades de prueba", en el grafo con HEAD en un commit, la
  etiqueta "HEAD", sin flecha, va en ese commit, a la mitad de la fila.
- [x] [web, móvil] En "Actividades de prueba", en el grafo sin explicación, la barra
  muestra solo "¡Correcto!" o "Respuesta correcta: {commit}".
- [ ] [móvil] En un teléfono de 360 px de ancho, el grafo al límite de "Actividades de
  prueba" (10 commits, 6 columnas y 4 ramas con nombres de 20 caracteres, una con
  HEAD) cabe sin desplazarse hacia los lados, con los nombres y las etiquetas completos
  y sin encimarse, y puedo pulsar cada commit sin pulsar el de al lado.
- [x] [web] En una ventana ancha y en la vista previa, ese grafo cabe en el ancho
  disponible sin desplazarse hacia los lados.

### Teclado y accesibilidad

- [x] [web] Resuelvo los tres tipos solo con el teclado, hasta "Continuar": en el reto
  salgo del campo con Esc y Tab; en la terminal escribo y pulso Enter; en el grafo
  recorro los commits con Tab, de izquierda a derecha y, en la misma columna, de arriba
  abajo, y elijo con Enter o la barra espaciadora.
- [x] [web] En el grafo, las teclas 1 a 9 no eligen commits.
- [x] [web] Al comprobar la terminal o el grafo, y al autoevaluarme en el reto, el foco
  queda en "Continuar".
- [ ] [web, móvil] Con un lector de pantalla, el campo de código se anuncia como "Tu
  código" con su lenguaje (y en la web, con el texto sobre Tab), la terminal como
  "Comando" con su carpeta, y cada commit con su nombre, sus padres, sus ramas y HEAD y
  si está elegido, correcto o incorrecto.
- [x] [web, móvil] Lo correcto y lo incorrecto del grafo llevan icono además de color.

### Resultado y salir

- [x] [web, móvil] En "Tu primer commit" (Git esencial, 2), acertando las cuatro
  terminales y fallando clasificar, al terminar veo "Acertaste 4 de 5".
- [x] [web, móvil] Al volver al curso, esa lección muestra "4 de 5 aciertos".
- [x] [web, móvil] En "Actividades de prueba", en la terminal mínima (la primera actividad
  de su lección), sin haber escrito nada la X lleva directo al detalle del curso. Después
  de escribir, pide confirmación, y "Seguir aquí" me deja con lo que escribí. En el grafo
  con un merge (también el primero de su lección), elegir un commit también pide
  confirmación al salir.
- [x] [web, móvil] En "Condicionales y operadores", después de escribir en el reto,
  confirmar la salida y abrir otra vez la lección empieza desde la primera actividad, y
  el reto tiene otra vez su código inicial.

### Paleta y bloques

- [x] [web] En la paleta, Reto de código, Terminal simulada y Grafo de commits se pueden
  agregar y no dicen "Próximamente". Escuchar y repetir sigue deshabilitado, con
  "Próximamente".
- [x] [web] Al arrastrar o pulsar cada uno de los tres, queda en la secuencia con la
  marca "Incompleta", seleccionado y con el foco en su primer campo.
- [x] [web] El bloque de cada uno muestra el inicio de la consigna y, sin ella, "Sin
  contenido".

### Formularios

- [x] [web] El reto tiene un selector con "Elige un lenguaje" y, en este orden, C, CSS,
  HTML, JavaScript, Python, SQL, Bash y Otro. Sin lenguaje, al guardar veo "Elige un
  lenguaje.". El código inicial y la solución van en letra monoespaciada.
- [x] [web] En el reto, la terminal y el grafo, sin consigna, al guardar veo "Este campo
  es obligatorio.". En el reto, también sin solución.
- [x] [web] La terminal empieza con un comando vacío, con la nota "Es el que ve el alumno
  como respuesta correcta". Con 1 comando, "Quitar" está deshabilitado; con 10,
  también "Agregar comando".
- [x] [web] Con `git init` y `git  init ` como comandos, al guardar el segundo muestra
  "Este comando está repetido."; `git init` y `Git init` sí se aceptan.
- [x] [web] Un comando escrito con espacios al inicio y al final se guarda sin ellos.
- [x] [web] El grafo empieza con dos commits sin nombre: el primero dice "Primer commit:
  no tiene padre" y el segundo tiene al primero como padre. "Agregar commit" suma uno
  con el último como padre. Con 2 commits, "Quitar" está deshabilitado; con 10,
  también "Agregar commit".
- [x] [web] El selector "Padre" de cada commit solo ofrece los commits de arriba, y
  muestra "Commit {n}" en uno sin nombre. Al cambiarle el nombre a un commit, los
  selectores lo muestran y siguen eligiendo el mismo.
- [x] [web] Un nombre de commit no deja escribir más de 4 caracteres. Dos commits con el
  mismo nombre muestran, al guardar, "Este nombre ya lo tiene otro commit.".
- [x] [web] Un segundo padre igual al primero muestra "El segundo padre tiene que ser
  otro commit.".
- [x] [web] Al quitar un commit que era padre, commit de una rama y respuesta, al
  guardar veo "Elige un padre.", "Elige un commit." y "Elige la respuesta.". Si era
  segundo padre, vuelve a "Ninguno", y si HEAD apuntaba a él, a "Sin HEAD".
- [x] [web] Al quitar el primer commit, el que seguía dice "Primer commit: no tiene
  padre".
- [x] [web] Con 7 commits seguidos, al guardar veo "El grafo puede tener hasta 6 commits
  seguidos de izquierda a derecha. Pon alguno en paralelo o quita alguno.". Al cambiar
  el padre del último para que vaya en paralelo, se guarda.
- [x] [web] Con 4 ramas, "Agregar rama" está deshabilitado. Dos ramas iguales muestran
  "Esta rama está repetida."; una llamada `HEAD`, "Una rama no se puede llamar HEAD.";
  y una sin commit, "Elige un commit.".
- [x] [web] El selector de HEAD muestra "Sin HEAD", las ramas y los commits. Al quitar
  la rama a la que apunta, vuelve a "Sin HEAD".
- [x] [web] Cada campo no deja escribir más del límite de "Datos de entrada", y los
  formularios muestran las ayudas de "Formulario de cada tipo".

### Vista previa y prueba

- [x] [web] Una actividad completa de cada tipo se ve en la vista previa como en el
  reproductor y se responde igual.
- [x] [web] En la vista previa, Tab en el campo de código mete espacios, Enter en la
  terminal comprueba solo esa actividad, y pulsar un commit no selecciona ningún
  bloque.
- [x] [web] Al cambiar la actividad en el inspector, la vista previa vuelve a empezar y
  el foco se queda en el campo. "Reiniciar" la devuelve al principio.
- [x] [web] Una actividad incompleta de estos tipos, y un grafo de más de 6 columnas,
  muestran "Completa esta actividad para ver su vista previa.".
- [x] [web] "Probar lección" recorre una lección con los tres tipos, y al terminar veo
  "Acertaste {aciertos} de 3".

### Guardar y servidor

- [x] [web] Una lección con los tres tipos se guarda y, al recargar, sigue igual, con sus
  datos y en su orden. El código inicial y la solución conservan su sangría y sus líneas
  en blanco. Un campo opcional vacío no se guarda.
- [x] [web, móvil] Armo una lección con los tres tipos, un administrador publica el
  curso, y un alumno la cursa de principio a fin: en la web y en el móvil se ve igual
  que en la vista previa y su resultado cuenta las tres preguntas.
- [x] [backend] Guardar, sin pasar por un cliente, un reto sin consigna, sin solución o
  con un lenguaje que no está en la lista, se rechaza y la lección queda como estaba.
- [x] [backend] Guardar una terminal sin comandos, con 11, con un comando repetido (también
  si solo cambian los espacios o las comillas tipográficas) o con un salto de línea en la carpeta o en un comando,
  se rechaza y la lección queda como estaba.
- [x] [backend] Guardar un grafo con 1 o con 11 commits, con un nombre de commit repetido o
  de 5 caracteres, con el primer commit con padre, con otro sin padre, con tres padres
  o con dos iguales, con un padre que no existe o que está más abajo en la lista, o con
  más de 6 columnas, se rechaza y la lección queda como estaba.
- [x] [backend] Guardar un grafo con 5 ramas, con una rama repetida, llamada `HEAD` o que
  apunta a un commit que no existe, con HEAD apuntando a algo que no existe, o con una
  respuesta que no es uno de sus commits, se rechaza y la lección queda como estaba.
- [x] [backend] Guardar un texto más largo que su límite en cualquiera de los tres tipos, o
  un campo que el tipo no tiene, se rechaza y la lección queda como estaba.
- [x] [backend] Guardar una actividad de escuchar y repetir se rechaza y la lección queda
  como estaba.

### Contenido

- [x] [web, móvil] En "Actividades de prueba", la lección con `<b>hola</b>` y `<script>`
  en los textos de una actividad de cada tipo (también un commit llamado `<b>` y una
  rama `<script>`) los muestra tal cual, también en la barra inferior, sin negritas y
  sin ejecutar nada.
- [x] [web] Con esos textos, el formulario, el bloque y la vista previa los muestran tal
  cual.
- [x] [web, móvil] Las actividades de "Actividades de prueba" con los límites más altos
  (código y solución de 2000 caracteres, 10 comandos y salidas de 2000, y el grafo al
  límite) se pueden responder de principio a fin, con los textos completos.

## Datos que toca

- **Actividad** (F03, F05, F11): se agregan tres tipos, con los límites de "Datos de
  entrada":
  - Reto de código: consigna, lenguaje (uno de los ocho), código inicial (opcional) y
    solución.
  - Terminal simulada: consigna, carpeta (opcional), salida previa (opcional), comandos
    aceptados (el primero es el que se muestra), salida al acertar (opcional) y pista
    (opcional).
  - Grafo de commits: consigna, commits (del más antiguo al más nuevo, cada uno con su
    nombre y de cero a dos padres de más arriba en la lista), ramas (cada una con su
    nombre y su commit), HEAD (opcional: una rama o un commit), respuesta (un commit) y
    explicación (opcional). No lleva coordenadas.

  Los tres cuentan como preguntas.
- **Leccion** (F02, F05): no cambia; sus actividades pueden ser de estos tipos.
- **Progreso** (F04): no cambia; estos tipos suman a las preguntas de la lección.

## Supuestos

- Los límites se eligieron con holgura sobre los valores más altos de los cursos del
  prototipo: consignas de hasta 240 caracteres; códigos iniciales de hasta 45 y
  soluciones de hasta 124, en 7 líneas; carpetas de hasta 34; salidas previas de hasta
  20 y al acertar de hasta 161; hasta 2 comandos por terminal, de hasta 47; pistas de
  hasta 104; 3 commits y una explicación de 155. Las 26 actividades cumplen todas las
  reglas de esta spec.
- La consigna es obligatoria en los tres tipos, como en el prototipo: sin ella, el
  alumno no sabe qué se le pide.
- El reto pide cambiar el código inicial antes de comprobar por la misma razón que la
  pregunta abierta pide escribir algo (F03): que el alumno intente antes de ver la
  solución.
- Con "Otro" no se muestra etiqueta, porque "Otro" no le dice nada al alumno.
- La solución tampoco resalta líneas de diff, como sí lo hace el código de la teoría:
  en SQL o en Bash, una línea que empieza con `-` o `--` es código normal.
- El campo de código y la terminal no cambian las comillas porque las comillas
  cuentan al comparar: si el teclado del teléfono las cambiara, un comando bien escrito
  saldría mal.
- La terminal no responde con un error cuando el comando no es el esperado porque no
  ejecuta nada: inventar una salida podría enseñar algo falso. El comando esperado que
  se muestra es el primero de los aceptados, así que el autor decide cuál ve el alumno.
- Los commits se escriben del más antiguo al más nuevo y sus padres solo pueden ser de
  más arriba. Así no puede haber ciclos, hay un solo commit sin padre y el orden de la
  lista ya es el de la historia.
- Las columnas se cuentan por generaciones, y no una por commit, para que el trabajo en
  paralelo se vea en paralelo y quepan más commits en el ancho del teléfono. Con 6
  columnas, el grafo cabe en un teléfono de 360 px con áreas de 44 px; es el teléfono
  más angosto que se considera.
- Los nombres de commit tienen hasta 4 caracteres para caber dentro del círculo (`c1`,
  `A`, `m2`), como en el prototipo.
- La regla de las filas da una fila por cada rama que agrega commits. Los commits que
  ninguna rama alcanza por su primer padre (el segundo padre de un merge cuya rama ya
  se borró, o la punta de una rama que la pregunta esconde) van en filas debajo, para
  que nunca se encimen.
- El grafo del prototipo no tiene la rama `main`, porque es lo que pregunta. Como
  `feature` alcanza a `c1`, `c2` y `c3`, los tres quedan en una sola fila, igual que en
  Git, donde la historia no se bifurca hasta que `main` tenga un commit propio. El
  prototipo dibujaba `c3` más arriba; Brote lo dibuja en línea.
- Las actividades del prototipo se cargan con sus textos sin cambios (incluido el
  "Tenés" de "Box model: padding, gap y margin"), en su lugar dentro de la lección y
  sin glosario, como en F03 y F11. Solo cambia el formato: el lenguaje `c` pasa a C y
  `css` a CSS; en el grafo, el identificador y la etiqueta de cada commit pasan a ser su
  nombre, y las coordenadas se descartan.
- Para validar los criterios, el curso "Actividades de prueba" agrega, solo mientras se
  valida (como en F03 y F11):
  - Una lección con `<b>hola</b>` y `<script>` en una actividad de cada tipo, con un
    commit llamado `<b>` y una rama `<script>`.
  - Una lección de retos: uno de SQL sin código inicial, con una línea `-- Todos los
    alumnos` en la solución, y uno con lenguaje "Otro".
  - Una terminal sin carpeta, salida previa, salida al acertar ni pista.
  - Una lección de grafos: uno con un merge (`c1`; `c2`, hijo de `c1`; `c3` y `c4`,
    hijos de `c2`; `c5`, con padres `c3` y `c4`; las ramas `main` en `c5` y `feature`
    en `c4`, en ese orden, y HEAD en `main`); uno de una rama ya borrada (un merge cuyo
    segundo padre no tiene rama);
    y uno con HEAD en un commit a la mitad de la fila, sin explicación.
  - Una lección con los límites más altos de cada tipo: código inicial y solución de
    2000 caracteres con una línea más ancha que el panel; una terminal con 10 comandos
    y salidas de 2000; y un grafo de 10 commits, 6 columnas y 4 ramas con nombres de 20
    caracteres, una con HEAD.
  - Una lección solo con teoría y tarjetas (ver el punto siguiente).
- Cargar estas actividades cambia datos que citan criterios ya validados de F03, F04 y
  F11, que no se reescriben porque registran lo que se validó entonces. Si hay que
  repetirlos: "Tu primer commit" (Git esencial, 2) tiene 5 preguntas y muestra teoría,
  cuatro terminales y clasificar; "Ramas: trabajar en paralelo" (Git esencial, 4) pasa
  de 0 a 4 preguntas, y ya ninguna lección de los cursos del prototipo queda sin
  preguntas, así que la lección sin preguntas pasa a ser la de solo teoría de
  "Actividades de prueba".
- Los criterios que citan los cursos de prueba suponen que F11 ya está integrada: sus
  actividades de relacionar están en las mismas lecciones (por ejemplo, el clasificar
  de "Tu primer commit").
- La web, el móvil y el servidor cambian juntos: todavía no hay versiones publicadas
  del móvil que deban seguir funcionando con estos tipos.
- En la web no se detecta "sin conexión" aparte (igual que en F01 a F06 y F11).
- Lo que estas actividades agreguen a la interfaz (el campo de código, la terminal, el
  grafo y sus etiquetas) se escribe primero en `docs/diseno.md`.
- Al cerrar la feature se actualiza `specs/02-modelo-datos.md` (los tres tipos, sus
  límites y que cuentan como preguntas). `specs/01-navegacion.md` solo agrega que
  escribir código o un comando, o elegir un commit, también pide confirmación al salir.

## Aclaraciones

### Sesión 2026-11-05

Decididas con el usuario antes de la spec (ver "Descripción original"):

- P: ¿Cómo se califica el reto de código? → R: Por autoevaluación, como la pregunta
  abierta. El lenguaje sale de una lista fija y solo se muestra como etiqueta; no hay
  coloreado de sintaxis.
- P: ¿Cómo se escribe la sangría en el campo de código de la web? → R: Tab mete dos
  espacios y Mayús+Tab los quita. Después de Esc, Tab saca el foco del campo, y eso se
  anuncia debajo del campo.
- P: ¿Cómo se compara el comando de la terminal? → R: Un solo intento. Solo se ignoran
  los espacios al inicio, al final y repetidos; las mayúsculas y las comillas cuentan,
  y el autor da las formas que acepta. La pista sale solo al fallar, junto al comando
  esperado.
- P: ¿Quién acomoda el grafo de commits? → R: Brote, a partir de los padres, sin
  coordenadas del autor, de izquierda a derecha y con una fila por rama. Las etiquetas
  son las ramas y un HEAD opcional, que apunta a una rama o a un commit.

Decidida al escribir la spec:

- P: ¿Qué tan grande puede ser un grafo, para que se ajuste al ancho del teléfono? → R:
  Hasta 10 commits y como máximo 6 columnas, con los commits en paralelo en la misma
  columna, y nombres de commit de hasta 4 caracteres dentro del círculo.

### Sesión 2026-11-06

Decidida al analizar spec, plan y tareas:

- P: Lo que escribe el alumno nunca tiene comillas tipográficas, rayas ni puntos
  suspensivos. ¿Qué pasa si el autor los pone en un comando aceptado? → R: Al comparar,
  y al buscar comandos repetidos, cuentan como sus versiones rectas (`"`, `'`, `--` y
  `...`). La respuesta correcta se muestra tal como la escribió el autor.
