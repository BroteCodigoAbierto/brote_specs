# F13: Imágenes propias en los cursos

**Estado**: Borrador
**Creada**: 2026-11-07
**Repos afectados**: backend | web | móvil
**Rama**: `feature/F13-imagenes-propias` (en cada repo afectado)
**Descripción original**: "F13 Imágenes propias en los cursos. El autor sube imágenes
desde el editor (web) y el alumno las ve en la web y en el móvil (en el móvil solo se
ven). El audio propio pasa a F14, con escuchar y repetir, y usará la misma forma de
subir archivos. Decisiones tomadas con el usuario el 2026-11-07:
- Dónde: en la teoría (varias), en la pregunta de la opción múltiple (una), en las
  opciones de la opción múltiple, en la portada del curso y en los elementos de
  emparejar, clasificar y ordenar. El banco de palabras no.
- Teoría: varias imágenes donde el autor quiera, con una marca en el texto: "Agregar
  imagen" pone la marca donde está el cursor, como "Agregar espacio" en completar
  espacios, y debajo del texto aparece una fila por marca para subir esa imagen. Al
  cursar, cada imagen va en su lugar, entre párrafos. Hasta 5 por teoría. Las teorías
  que ya existen no cambian.
- Opciones y elementos de imagen: el alumno ve solo la imagen, en un mosaico cuadrado,
  completa y sin recortar. "Tipo de opciones" de la opción múltiple suma "Imagen" a
  "Texto" y "Símbolo"; en emparejar, cada columna es de texto o de imágenes (permite
  imagen con texto e imagen con imagen); en clasificar y ordenar, los elementos son
  todos de texto o todos de imágenes (las categorías siguen siendo texto).
- Texto alternativo: opcional en todas las imágenes. Lo leen los lectores de pantalla y
  se ve si la imagen no carga.
- Al fallar, la barra inferior muestra cada imagen de la respuesta correcta como una
  miniatura de 48 px, seguida de su texto alternativo si lo tiene.
- Formatos: JPEG, PNG y WebP de hasta 10 MB, que la web reduce antes de subirlos a 1600
  px por lado como máximo, sin recortar. GIF aparte: se sube tal cual, hasta 5 MB, para
  que se mueva.
- GIF al cursar: se mueve solo y lleva un botón para pausarlo y reanudarlo; con
  "reducir movimiento", empieza en pausa.
- Límite de 200 MB de imágenes por curso, comprobado al subir. Al quitar una imagen y
  guardar, el espacio se libera.
- Ampliar: en la teoría y en la pregunta, tocar la imagen la abre a pantalla completa,
  sobre fondo oscuro, con un botón para cerrar; en el móvil se puede pellizcar para
  acercar. Los mosaicos de opciones y elementos no se amplían: tocarlos los elige.
- Portada: se recorta al centro (16:9 en las tarjetas de la web, cuadrada en el detalle
  y en el móvil); sin ella, sigue la generada.
El curso "Actividades de prueba" gana lo necesario para probar cada caso. La rama ya
existe en brote_specs: feature/F13-imagenes-propias."

## Objetivo

Que el autor ilustre su curso con imágenes propias, sin depender de que todo se diga
con texto: en la teoría, en la opción múltiple, en emparejar, clasificar y ordenar, y en
la portada. Que el alumno las vea en la web y en el móvil, también con un lector de
pantalla, sin conexión estable y con "reducir movimiento". Deja lista la forma de subir
archivos que usará el audio propio de F14.

## Actor

- **Autor**: usuario con sesión iniciada que arma su curso en el editor (F05), solo en
  la web (decisión 0003). Sube, cambia y quita las imágenes.
- **Alumno**: usuario con sesión iniciada que explora el catálogo (F02), ve su panel
  (F04) y cursa lecciones (F03), en la web o en el móvil. Solo ve las imágenes.

## Precondiciones

- El catálogo (F02), el reproductor (F03), el panel (F04), el editor (F05), la
  publicación (F06) y las actividades de relacionar (F11) funcionan, y piden lo mismo
  que en esas features: sesión, curso publicado o curso propio, y llegar al servidor.
- Para subir o cambiar una imagen, el curso es un borrador de quien la sube: no está en
  revisión ni publicado (F06).
- Los cursos de prueba tienen cargado lo que dice "Supuestos".

## Datos de entrada

Las longitudes cuentan caracteres. Un texto formado solo por espacios cuenta como vacío.
Los pesos se cuentan en MB de 1024 × 1024 bytes.

### La imagen que sube el autor

- **Archivo**: una imagen de su computadora, obligatoria para llenar un campo de imagen.
  - JPEG, PNG o WebP de hasta 10 MB. Brote la reduce antes de guardarla, si hace falta,
    para que su lado más largo mida como máximo 1600 px, sin recortarla ni deformarla;
    una imagen más chica se queda de su tamaño. Conserva su transparencia.
  - GIF de hasta 5 MB. Se guarda tal cual, sin reducirlo, para que se mueva.
  - La portada solo admite JPEG, PNG o WebP.
- **Texto alternativo**: texto de una línea, opcional, de hasta 200. Describe la imagen
  para quien no la puede ver. La portada no lo lleva.

### Lo que escribe el autor

Lo nuevo o lo que cambia respecto de F05 y F11:

| Dónde | Campo | Dato | Obligatorio | Límites |
|---|---|---|---|---|
| Teoría | Texto | texto de varias líneas, con marcas `[imagen]` | sí | hasta 5000, con 0 a 5 marcas |
| | Imágenes | una por cada marca, en orden, con su texto alternativo | sí, una por marca | hasta 5 |
| Opción múltiple | Imagen de la pregunta | una imagen con su texto alternativo | no | 1 |
| | Tipo de opciones | "Texto", "Símbolo" o "Imagen" | sí | por defecto, "Texto"; vale para todas las opciones |
| | Opciones | lista de textos, de símbolos o de imágenes | sí | de 2 a 9 |
| Emparejar | Columna izquierda | "Texto" o "Imagen" | sí | por defecto, "Texto" |
| | Columna derecha | "Texto" o "Imagen" | sí | por defecto, "Texto" |
| | Parejas | cada lado, un texto o una imagen, según su columna | sí | de 3 a 8 |
| Clasificar | Tipo de elementos | "Texto" o "Imagen" | sí | por defecto, "Texto" |
| | Elementos | lista de textos o de imágenes, cada uno con su categoría | sí | de 2 a 12 |
| Ordenar | Tipo de elementos | "Texto" o "Imagen" | sí | por defecto, "Texto" |
| | Elementos | lista de textos o de imágenes, en el orden correcto | sí | de 3 a 10 |
| Curso | Portada | una imagen JPEG, PNG o WebP | no | 1 |

Los demás campos, sus límites y lo que responde el alumno no cambian.

### Límites del curso y de la lección

Las imágenes de un curso pesan, entre todas, hasta 200 MB, y las que usa una lección,
hasta 25 MB, con el peso con que se guardaron (ya reducidas). Una imagen que se usa en
varios lugares cuenta una vez. Ver "Espacio del curso" y "Peso de la lección" en
"Validaciones".

## Flujo principal

### Subir una imagen (editor, web)

Todo lugar donde va una imagen tiene un campo de imagen, con el mismo funcionamiento:

1. Vacío, el campo muestra "Elegir imagen" y la nota "JPEG, PNG o WebP de hasta 10 MB,
   o GIF de hasta 5 MB." (en la portada, "JPEG, PNG o WebP de hasta 10 MB.").
2. El autor pulsa "Elegir imagen" y elige un archivo de su computadora.
3. El campo muestra "Subiendo imagen…" con un indicador. Mientras, el autor puede seguir
   editando lo demás.
4. Al terminar, el campo muestra la imagen completa, sin recortar, su tamaño y su peso
   ("1600 × 1200 px · 412 KB"), los botones "Cambiar" y "Quitar" y, salvo en la
   portada, el campo "Texto alternativo", con la ayuda "Describe la imagen para quien no
   la puede ver. Lo leen los lectores de pantalla y se muestra si la imagen no carga.".
   La vista previa ya la muestra.
5. "Cambiar" elige otro archivo, que reemplaza a la imagen al terminar de subirse. Si no
   se puede subir, la anterior se queda.
6. "Quitar" deja el campo vacío, sin confirmación.
7. Elegir, cambiar y quitar una imagen o escribir su texto alternativo son cambios sin
   guardar, como cualquier otro: cuentan al pulsar "Guardar lección" o, en la portada,
   "Guardar cambios" (F05).

### Cuánto pesan las imágenes (editor, web)

- **En el lienzo**, junto a "Guardar lección", se lee "Imágenes de esta lección: {x} de
  25 MB", con el peso de las imágenes que usa la lección en pantalla, guardada o no. Cambia
  al momento al elegir, cambiar o quitar una imagen. Si pasa de 25 MB, se ve en el color
  de error, con un icono. Una lección sin imágenes no lo muestra.
- **En el mapa del curso**, en los datos del curso, se lee "Imágenes del curso: {x} de
  200 MB", contado como "Espacio del curso" (ver "Validaciones"). Se actualiza al abrir el
  mapa y al guardar sus datos. Un curso sin imágenes no lo muestra.
- {x} va en MB con un decimal ("12.4"), redondeado hacia arriba, para que nunca diga que
  cabe algo que no cabe.

### Teoría

**En el editor**:

1. Debajo del campo Texto está "Agregar imagen", que escribe `[imagen]` donde está el
   cursor. La ayuda del campo pasa a ser "Separa los párrafos con un renglón en blanco.
   Cada [imagen] es el lugar de una imagen.".
2. Por cada `[imagen]` del texto, en orden, aparece debajo un grupo "Imagen {n}" con su
   campo de imagen.
3. Si el texto tiene menos marcas que grupos, pasa lo mismo que con los espacios de
   completar espacios (F05): los grupos sin imagen que sobran desaparecen solos; si los
   que sobran tienen imagen, no se borran: aparece "Hay más imágenes que marcas [imagen]
   en el texto. Quita las que sobran." y cada grupo muestra "Quitar imagen", para que el
   autor elija cuál sobra.
4. Con 5 marcas, "Agregar imagen" se deshabilita.

**Al cursar**:

1. El alumno ve el título y el texto, con cada imagen en el lugar de su marca, sola, a lo
   ancho, entre párrafos; después, el código y los puntos clave, como en F03.
2. Si una marca está a la mitad de un párrafo, el párrafo se parte en dos: el texto
   antes de la marca, la imagen y el texto después.
3. Tocar una imagen la amplía (ver "Ampliar una imagen").

Una teoría sin marcas se ve igual que antes de esta feature.

### Opción múltiple

**En el editor**:

1. Después de la pregunta va "Imagen de la pregunta", un campo de imagen opcional, y
   luego el código.
2. "Tipo de opciones" tiene "Texto", "Símbolo" e "Imagen". Al cambiarlo, lo escrito y
   las imágenes de cada tipo se conservan mientras el formulario siga abierto; al
   guardar solo cuenta el tipo elegido.
3. Con "Imagen", cada opción es un campo de imagen con "Quitar", "Agregar opción" suma
   una vacía y el autor marca la correcta como con los demás tipos.

**Al cursar**:

1. El alumno ve la pregunta, su imagen (si hay), el código (si hay) y las opciones,
   mezcladas como en F03. La imagen de la pregunta se amplía al tocarla.
2. Las opciones de imagen se ven como mosaicos cuadrados, todos del mismo tamaño, con la
   imagen completa y sin recortar. En un teléfono de 360 px caben al menos dos por fila.
3. Elige un mosaico (en la web, también con las teclas 1 a 9), pulsa "Comprobar" y los
   mosaicos se marcan como las opciones de F03: el correcto, y el suyo si eligió otro.
4. La barra inferior dice "¡Correcto!" o muestra "Respuesta correcta:" con la miniatura
   de la opción correcta y su texto alternativo, si lo tiene.

### Emparejar, clasificar y ordenar

**En el editor**:

- **Emparejar**: después de la consigna van "Columna izquierda" y "Columna derecha",
  cada una con "Texto" o "Imagen". En cada pareja, cada lado es un campo de texto o un
  campo de imagen, según su columna.
- **Clasificar** y **ordenar**: después de la consigna (y en clasificar, de las
  categorías) va "Tipo de elementos", con "Texto" o "Imagen". Cada elemento es un campo
  de texto o un campo de imagen; en clasificar, con su selector de categoría, y en
  ordenar, con "Subir" y "Bajar".
- Al cambiar el tipo de una columna o de los elementos, lo escrito y las imágenes se
  conservan mientras el formulario siga abierto, como en la opción múltiple.
- El bloque de la secuencia sigue mostrando un texto (F05, F11). En emparejar sin
  consigna, si la columna izquierda es de imágenes, muestra el texto derecho de la
  primera pareja; si las dos son de imágenes, "Parejas de imágenes".

**Al cursar**:

1. Todo funciona como en F11 (pulsar, arrastrar, mezclar, comprobar), con los elementos
   de imagen como mosaicos cuadrados, completos y sin recortar, todos del mismo tamaño
   dentro de una misma actividad.
2. **Emparejar**: las dos columnas siguen lado a lado, también en el móvil. En una
   columna de imágenes, cada mosaico ocupa el ancho de la columna. La pareja se ve por su
   número, en la esquina del mosaico.
3. **Clasificar**: los mosaicos se acomodan en filas dentro de los elementos sin colocar
   y de cada categoría. Las categorías se acomodan como en F11.
4. **Ordenar**: cada lugar numerado recibe un mosaico, con el número a su izquierda.
5. Al fallar, la barra inferior muestra "Respuesta correcta:" con las mismas líneas que
   en F11, y cada imagen como su miniatura seguida de su texto alternativo, si lo tiene:
   `{izquierda} → {derecha}`, `{elemento} → {categoría}` y `1. {elemento}`.

### Portada del curso

**En el editor**:

1. En el mapa del curso, arriba del título, está "Portada", un campo de imagen. Vacío,
   muestra la portada generada (F02) con "Elegir imagen".
2. Con imagen, muestra cómo se verá: en una tarjeta de la web (16:9) y en el detalle
   (cuadrada), con "Cambiar" y "Quitar".
3. Elegir, cambiar o quitar la portada habilita "Guardar cambios"; al guardar, "Cambios
   guardados" (F05). Quitarla y guardar devuelve la portada generada.
4. "Nuevo curso" no pide portada: se agrega después, en el mapa.

**Dónde se ve**: en todos los lugares donde hoy se ve la portada generada, en la web y
en el móvil: el catálogo, el detalle del curso, "Sigue aprendiendo" y "Cursos que creé"
de "Mi panel", "Mis cursos" del móvil, el mapa del curso y el de un curso que no se
edita (F06). La imagen llena el lugar de la portada y se recorta al centro: 16:9 en las
tarjetas de la web y cuadrada en el detalle y en las tarjetas del móvil. Un curso sin
portada se sigue viendo con la generada.

### GIF

1. Al cursar, un GIF se mueve solo, como lo indica su archivo, con un botón redondo
   "Pausar" en una esquina.
2. Al pulsarlo, el GIF se queda quieto en el cuadro donde estaba y el botón pasa a
   "Reanudar"; al pulsarlo otra vez, sigue moviéndose desde ahí.
3. Con "reducir movimiento" activado, el GIF empieza quieto, en su primer cuadro, con
   "Reanudar".
4. En un mosaico, pulsar el botón no elige la opción ni el elemento, no empieza a
   arrastrarlo y no cuenta como haber hecho algo en la lección.
5. Cada GIF se pausa por separado. Al volver a abrir la lección, empiezan otra vez como
   en el paso 1 o el 3.

### Ampliar una imagen

1. En la teoría y en la pregunta de la opción múltiple, el alumno toca una imagen (en la
   web, también con Enter o la barra espaciadora cuando tiene el foco).
2. La imagen se abre sobre la lección, sobre fondo oscuro, completa y tan grande como
   quepa en la pantalla, con el botón "Cerrar" arriba a la derecha.
3. En el móvil, puede pellizcar para acercarla hasta cuatro veces su tamaño en pantalla y
   moverla con un dedo mientras está acercada.
4. "Cerrar", Esc (en la web), pulsar el fondo oscuro (en la web) o el botón de volver de
   Android la cierran, y la lección queda como estaba. En la web, el foco vuelve a la
   imagen.
5. Un GIF ampliado se mueve o está quieto como estaba en la actividad, y lleva su botón
   de pausa.

Abrir la imagen en grande no cuenta como haber hecho algo en la lección. Los mosaicos de
opciones y de elementos no se amplían: tocarlos los elige, como en F03 y F11.

### Cargar las imágenes al cursar

1. Al abrir una lección, Brote empieza a traer todas sus imágenes, de todas sus
   actividades, sin esperarlas para mostrar la primera (F03). Así, si después se pierde
   la conexión, lo que ya llegó se sigue viendo en las actividades que siguen.
2. Mientras una imagen carga, su lugar ya tiene el tamaño que tendrá, con un fondo
   suave, para que nada salte al llegar.
3. Si no se puede cargar (sin conexión o sin servidor), en su lugar se ve un icono de
   imagen rota y su texto alternativo o, sin él, "No se pudo cargar la imagen". La
   actividad se responde igual.
4. Las que no cargaron se vuelven a pedir solas, sin que el alumno haga nada: en el
   móvil, cuando vuelve la conexión; en la web, cada vez que pasa a otra actividad. Al
   llegar, aparecen en su lugar.
5. Una portada que no carga se ve como la generada.

### Vista previa y probar la lección

Funcionan como con los demás tipos (F05): la vista previa muestra la actividad real,
con sus imágenes, sus GIF con pausa y la imagen ampliada, y "Probar lección" la recorre
como un alumno.

## Validaciones

### Al cursar

- **Tamaño de una imagen** (teoría y pregunta): se ve completa, sin recortar ni
  deformar, tan ancha como la actividad o como la imagen misma, lo que sea menor, y sin
  pasar de la mitad del alto de la pantalla. Una imagen más chica que la actividad se ve
  de su tamaño, centrada, sin agrandarse.
- **Mosaicos**: cuadrados, todos del mismo tamaño en una misma actividad, con la imagen
  completa y centrada; lo que sobra del cuadro se ve con el fondo del mosaico. Un PNG
  transparente deja ver ese fondo. Correcto e incorrecto llevan su borde, su color y su
  icono, como las opciones (F03, F11).
- **Miniaturas** de la barra inferior: cuadradas, de 48 px, con la imagen completa. Un
  GIF se ve quieto en su miniatura. Si la respuesta es larga, la barra se desplaza y
  "Continuar" sigue a la vista (F11).
- **Mezcla, comprobar, teclado, arrastre y salir**: como en F03 y F11, también con
  imágenes. En la web, las teclas 1 a 9 eligen los mosaicos de la opción múltiple según
  su lugar en pantalla, de izquierda a derecha y de arriba abajo.
- **Lectores de pantalla**:
  - Una imagen de la teoría o de la pregunta se anuncia como imagen con su texto
    alternativo, y que se puede ampliar. Sin texto alternativo, como "Imagen".
  - Un mosaico se llama como su texto alternativo. Sin él, "Imagen {n}", donde n es su
    lugar entre los mosaicos de la actividad cuando empieza, contados de izquierda a
    derecha y de arriba abajo y, en emparejar, primero la columna izquierda (en la
    opción múltiple, coincide con el número de la tecla). No cambia al moverlo. Después
    dice su estado, como en F03 y F11.
  - El botón de un GIF se llama "Pausar animación" o "Reanudar animación".
  - El visor se anuncia como "Imagen ampliada", con su texto alternativo, y el foco queda
    dentro de él mientras está abierto (web).
- **Texto**: el texto alternativo se muestra siempre como texto, en el lugar de una
  imagen que no carga y en la barra inferior. Algo como `<b>hola</b>` o `<script>` se ve
  tal cual y no se interpreta.
- **Reducir transparencia y modo oscuro**: las imágenes, los mosaicos, el botón de pausa
  y el visor se ven bien en los dos modos y con "reducir transparencia".

### Al editar

- **Actividad completa**: como en F05. Le falta algo si una marca, una opción, un lado
  de una pareja o un elemento de imagen no tiene imagen ("Elige una imagen.").
- **Teoría**: con más de 5 marcas, "El texto puede tener hasta 5 imágenes.". Hay
  exactamente un grupo por cada `[imagen]`. Solo cuenta como marca `[imagen]` escrito
  así, en minúsculas y sin espacios.
- **Repetidos**: dos imágenes son iguales si son el mismo archivo; elegir dos veces el
  mismo archivo da la misma imagen. Dos opciones de imagen iguales, dos imágenes iguales
  en una misma columna de emparejar o dos elementos de imagen iguales muestran "Esta
  imagen está repetida.". Una imagen sí se puede repetir en las dos columnas de
  emparejar, y en actividades distintas.
- **Texto alternativo**: no deja escribir más de 200 caracteres ni saltos de línea. Se
  guarda sin espacios al inicio ni al final; vacío, no se guarda.
- **Mientras se sube una imagen**, "Guardar lección" y "Probar lección" (o "Guardar
  cambios", en la portada) se deshabilitan, con la nota "Espera a que terminen de subir
  las imágenes.".
- **Al subir**:
  - Un archivo que no es JPEG, PNG, WebP ni GIF (por ejemplo, un SVG, un HEIC o un PDF)
    muestra "Elige una imagen JPEG, PNG, WebP o GIF.". En la portada, un GIF muestra "La
    portada puede ser JPEG, PNG o WebP.".
  - Un JPEG, PNG o WebP de más de 10 MB muestra "La imagen puede pesar hasta 10 MB.". Un
    GIF de más de 5 MB muestra "Un GIF puede pesar hasta 5 MB.".
  - Un archivo que dice ser imagen pero no se puede leer como tal (por ejemplo, un texto
    con la extensión `.png`) muestra "No se pudo leer la imagen. Elige otra.".
  - Los errores van debajo del campo, y la imagen que tenía el campo se queda.
- **Fotos**: una foto se guarda derecha, como se ve en el visor de fotos de la
  computadora aunque se haya tomado de lado, y sin sus datos ocultos (como el lugar
  donde se tomó o el modelo de la cámara). Solo los GIF se mueven: un PNG o un WebP
  animado se guarda quieto. El nombre del archivo no se guarda ni se muestra. Como el
  editor prepara así cada foto, el servidor rechaza un JPEG, PNG o WebP que todavía traiga
  esos datos o una animación: solo llega así si alguien sube la imagen sin el editor.
- **Espacio del curso**:
  - Cuenta las imágenes que el curso usa (en sus lecciones guardadas y en su portada) y
    las que se subieron y todavía no se guardan. Una imagen que se usa en varios lugares
    del curso cuenta una vez.
  - Si una imagen no cabe en los 200 MB, no se sube y el campo muestra "Este curso ya
    tiene 200 MB de imágenes. Quita alguna y guarda para hacer espacio.".
  - Al guardar una lección o los datos del curso, las imágenes que se quitaron y ya no se
    usan en ninguna parte del curso se borran y dejan de contar. Al eliminar una lección,
    también las suyas; al eliminar el curso, todas.
  - Una imagen que se subió y nunca se guardó se borra sola un día después de subirla.
- **Peso de la lección**: al guardar o probar una lección cuyas imágenes pasan de 25 MB,
  no se guarda ni se abre la prueba, y aparece el aviso "Las imágenes de esta lección
  pesan más de 25 MB. Quita alguna." (como el de actividades incompletas, F05). Lo
  capturado sigue en pantalla.
- **Quién sube**: solo el autor de un borrador sube imágenes a ese curso. Si el curso
  está en revisión, publicado o ya no existe, la imagen no se sube y se ve el mensaje de
  F05 y F06 para ese caso.
- **Quién ve las imágenes**: las de un curso se ven donde se ve el curso. Las de un
  borrador o de un curso en revisión, solo su autor (en el editor, la vista previa y
  "Probar lección"); las de un curso publicado, cualquier usuario con sesión. Si el
  curso deja de estar publicado, sus imágenes dejan de verse para los demás.
- **Cada imagen es de su curso**: una lección o una portada solo usan imágenes que se
  subieron a ese mismo curso. Para usar la misma imagen en otro curso, se sube otra vez.
- **El servidor comprueba todo**, al subir y cada vez que se guarda una lección o los
  datos del curso: el formato real del archivo (no su nombre), su peso, que un JPEG, PNG
  o WebP no pase de 1600 px por lado ni traiga datos ocultos o una animación, el espacio
  del curso, el peso de la lección, quién sube, que cada imagen
  usada exista y sea de ese curso, que la portada no sea GIF, que haya una imagen por
  marca y las reglas de arriba. Si algo no cumple, rechaza el cambio y no guarda nada,
  como en F05.
- **Lo que no cambia**: las actividades de texto y de símbolo, las teorías sin marcas y
  los cursos sin portada se guardan, se ven y se cursan igual que antes de esta feature.

## Estados de la pantalla

### Reproductor de la lección (web y móvil)

Cargando, sin actividades, no disponible, error, sin conexión y confirmar salida no
cambian (F03). Dentro de una actividad, cada imagen tiene sus estados:

- **Cargando**: su lugar, ya de su tamaño, con un fondo suave.
- **Cargada**: la imagen.
- **No cargó**: el icono de imagen rota y su texto alternativo, o "No se pudo cargar la
  imagen", hasta que se vuelve a pedir y llega.
- **GIF**: moviéndose, con "Pausar", o quieto, con "Reanudar".
- **Ampliada**: el visor sobre la lección.

### Lienzo de la lección (web)

No cambia (F05, F11, F12), salvo en el campo de imagen:

- **Vacío**: "Elegir imagen" y la nota de formatos.
- **Subiendo**: "Subiendo imagen…" con un indicador; "Guardar lección" y "Probar
  lección" deshabilitados, con la nota.
- **Con imagen**: la imagen, su tamaño y su peso, "Cambiar", "Quitar" y el texto
  alternativo.
- **Error al subir**: el mensaje debajo del campo y la imagen que tenía, o el campo
  vacío.
- **Imagen que ya no está**: "Esta imagen ya no está. Elige otra." (ver "Casos de
  error").
- **Peso de la lección**: "Imágenes de esta lección: {x} de 25 MB" junto a "Guardar
  lección", en el color de error si pasa de 25 MB, y el aviso al guardar o probar.

### Mapa del curso (web)

No cambia (F05, F06), salvo la portada: vacía, con la portada generada; subiendo; con
imagen, con sus dos vistas; y error al subir. Guardar los datos sigue igual. Con
imágenes, los datos muestran "Imágenes del curso: {x} de 200 MB".

### Catálogo, detalle, "Mi panel" y "Mis cursos" (web y móvil)

No cambian (F02, F04, F05), salvo la portada de cada curso: mientras su imagen carga, su
lugar tiene el color de la portada generada, sin la inicial; si no carga, se ve la
generada completa.

## Resultado esperado

- El autor tiene en su borrador imágenes en la teoría, la opción múltiple, emparejar,
  clasificar, ordenar y la portada, que siguen ahí al recargar y al volver a entrar.
- Cuando el curso se publica, el alumno ve esas imágenes en la web y en el móvil, como
  en la vista previa, y responde las actividades de imagen igual que las de texto. Cada
  una suma su pregunta como siempre (F04).
- Las imágenes que nadie usa ya no ocupan espacio, un curso nunca pasa de 200 MB de
  imágenes y una lección, de 25 MB.
- El curso "Actividades de prueba" tiene una portada y las lecciones de imágenes de
  "Supuestos".

## Casos de error

- **No se pudo subir** (el servidor no responde o falla): "No se pudo subir la imagen.
  Inténtalo de nuevo." debajo del campo. La imagen que tenía el campo se queda y lo
  demás de la pantalla sigue como estaba.
- **La sesión expiró al subir**: como al guardar en F05, se llega a "Entrar" con "Tu
  sesión terminó. Vuelve a entrar." y, al entrar con la misma cuenta, se regresa a la
  pantalla con lo que estaba sin guardar. La imagen que no se subió no está: hay que
  elegirla otra vez.
- **El curso se envió a revisión, se publicó o se eliminó** en otra pestaña mientras el
  autor sube una imagen: el mensaje de F05 y F06 para ese caso. Lo capturado sigue en
  pantalla.
- **Una imagen ya no está al guardar**: por ejemplo, se quitó y se guardó en otra
  pestaña, o se recuperó lo escrito antes de que expirara la sesión más de un día
  después. El servidor rechaza la lección con "Revisa los datos marcados.", la
  actividad queda seleccionada (F05) y el campo muestra "Esta imagen ya no está. Elige
  otra.". En la portada, "Guardar cambios" muestra lo mismo en su campo.
- **La imagen no carga al cursar**: ver "Cargar las imágenes al cursar". En el móvil, una
  lección abierta se termina sin conexión como en F03; las imágenes que no llegaron a
  cargar se ven con su texto alternativo.
- **"Probar lección" sin servidor**: funciona como en F05; las imágenes que no se
  cargaron se ven con su texto alternativo.
- **Salir con una imagen subiéndose**: cuenta como cambios sin guardar y pide
  confirmación (F05). Si sale, la imagen no se guarda.

## Fuera de alcance

- Audio propio (F14, con escuchar y repetir) y video.
- Editar imágenes en Brote: recortar, girar, filtros o elegir qué parte de la portada se
  ve.
- Una biblioteca de imágenes para elegir una ya subida, y usar imágenes de otro curso o
  de una dirección web.
- Arrastrar o pegar archivos en el editor para subirlos.
- Imágenes en la tarjeta, completar espacios, pregunta abierta, banco de palabras, reto
  de código, terminal simulada y grafo de commits, y en las categorías de clasificar.
- Opciones o elementos con imagen y texto visible a la vez, y mezclar textos e imágenes
  en una misma columna o lista.
- SVG, HEIC, AVIF, BMP, TIFF y otros formatos, y animaciones que no sean GIF.
- Pie de foto visible, y un texto alternativo largo aparte.
- Ampliar mosaicos, miniaturas o portadas, y acercar con un gesto en la web.
- Revisar si una imagen es inapropiada: lo ve el administrador al aprobar el curso, como
  el resto del contenido (decisión 0014).
- Descargar las imágenes para cursar sin conexión (F10), e importar y exportar cursos
  con imágenes (F07).
- El editor en el móvil (decisión 0003).

## Criterios de aceptación

<!--
  Datos de prueba: el curso "Actividades de prueba" publicado, con su portada y las
  lecciones de imágenes de "Supuestos", y los archivos para subir que dice el
  quickstart.md del plan. Cómo prepararlos lo dice el quickstart.md.
-->

### Cursos de prueba

- [x] [backend] "Actividades de prueba" tiene portada y, al final, las lecciones "Teoría
  con imágenes", "Opción múltiple con imágenes", "Relacionar con imágenes", "GIF",
  "Imágenes al límite" e "Imágenes con etiquetas", en ese orden, sin que cambien de lugar
  sus 12 lecciones anteriores.
- [ ] [web, móvil] Las actividades sin imágenes de los cuatro cursos del prototipo se ven
  igual que antes de esta feature, y esos cursos se ven con su portada generada.

### Subir imágenes (editor)

- [x] [web] En un borrador, el campo de imagen vacío muestra "Elegir imagen" y "JPEG,
  PNG o WebP de hasta 10 MB, o GIF de hasta 5 MB.".
- [x] [web] Al elegir la foto de 4000 × 3000 px, el campo muestra "Subiendo imagen…" y
  luego la imagen, "1600 × 1200 px" con su peso, "Cambiar", "Quitar" y "Texto
  alternativo" con su ayuda.
- [x] [web] Al elegir la imagen de 800 × 600 px, se guarda de 800 × 600 px: una imagen
  más chica no se agranda.
- [x] [web] El PNG con fondo transparente, ya subido, sigue transparente en la vista
  previa.
- [x] [web] La foto tomada de lado se ve derecha en el campo y en la vista previa.
- [x] [web] La foto con ubicación se guarda sin ella ni el modelo de la cámara.
- [x] [web] El GIF de 2 MB se sube con su mismo peso y tamaño, y se mueve en la vista
  previa.
- [x] [web] El archivo de 11 MB muestra "La imagen puede pesar hasta 10 MB." y el GIF de
  6 MB, "Un GIF puede pesar hasta 5 MB.". El campo se queda como estaba.
- [x] [web] El SVG y el HEIC muestran "Elige una imagen JPEG, PNG, WebP o GIF.", y el
  texto con extensión `.png`, "No se pudo leer la imagen. Elige otra.".
- [x] [web] Con una imagen en el campo, "Cambiar" y elegir el archivo de 11 MB muestra
  su error y deja la imagen anterior. "Cambiar" con otra válida la reemplaza.
- [x] [web] "Quitar" deja el campo vacío, sin confirmación, y aparece "Cambios sin
  guardar".
- [x] [web] Mientras se sube una imagen, "Guardar lección" y "Probar lección" están
  deshabilitados con "Espera a que terminen de subir las imágenes.", y se puede seguir
  escribiendo en otro campo.
- [x] [web] El texto alternativo no deja escribir más de 200 caracteres ni saltos de
  línea, y se guarda sin los espacios del inicio y del final.
- [x] [web] Una actividad con un campo de imagen vacío lleva "Incompleta" y, al guardar,
  el campo muestra "Elige una imagen.".
- [x] [web] Con el servidor apagado, subir una imagen muestra "No se pudo subir la
  imagen. Inténtalo de nuevo." y lo demás sigue en pantalla.
- [x] [web] Con la sesión expirada, subir una imagen lleva a "Entrar" con "Tu sesión
  terminó. Vuelve a entrar."; al entrar, la lección vuelve con sus cambios sin guardar y
  el campo de esa imagen como estaba antes.
- [x] [web] Después de guardar, al recargar la página, las imágenes y sus textos
  alternativos siguen en sus campos.

### Teoría

- [x] [web] En el formulario de teoría, "Agregar imagen" escribe `[imagen]` donde está el
  cursor y aparece el grupo "Imagen 1"; con otra marca, "Imagen 2".
- [x] [web] Al borrar del texto una marca cuyo grupo no tiene imagen, el grupo
  desaparece. Si tiene imagen, aparece "Hay más imágenes que marcas [imagen] en el
  texto. Quita las que sobran." y cada grupo muestra "Quitar imagen".
- [x] [web] Con 5 marcas, "Agregar imagen" se deshabilita; con 6 escritas a mano, al
  guardar aparece "El texto puede tener hasta 5 imágenes.".
- [x] [web] `[Imagen]` y `[ imagen ]` no cuentan como marcas y se ven como texto al
  cursar.
- [ ] [web, móvil] En "Teoría con imágenes", "Imágenes entre párrafos" muestra el primer
  párrafo, el panorama, el segundo párrafo partido en dos por la imagen chica, el tercer
  párrafo y, al final, sus puntos clave.
- [ ] [web, móvil] El panorama se ve completo, a lo ancho, con la marca de cada extremo
  a la vista y sin deformarse.
- [ ] [web, móvil] La imagen chica (120 × 80 px) se ve de su tamaño, centrada, sin
  agrandarse.
- [ ] [web, móvil] En "Solo una imagen alta", la imagen se ve completa y no pasa de la
  mitad del alto de la pantalla.
- [ ] [web, móvil] "Cinco imágenes" muestra sus cinco imágenes, cada una en su lugar.

### Opción múltiple

- [x] [web] "Tipo de opciones" tiene "Texto", "Símbolo" e "Imagen". Con "Imagen", cada
  opción es un campo de imagen. Al pasar a "Texto" y volver a "Imagen", las imágenes
  siguen ahí.
- [x] [web] Dos opciones con el mismo archivo muestran "Esta imagen está repetida.".
- [ ] [web, móvil] En "Opción múltiple con imágenes", "¿Qué figura es esta?" muestra la
  imagen del círculo rojo debajo de la pregunta y las opciones de texto.
- [ ] [web, móvil] En "¿Cuál es el cuadrado azul?", las cuatro opciones son mosaicos
  cuadrados del mismo tamaño, con la figura completa, y en un teléfono de 360 px van al
  menos dos por fila.
- [ ] [web, móvil] Al elegir el círculo y comprobar, el círculo se marca como incorrecto
  y el cuadrado como correcto, con su icono, y la barra muestra "Respuesta correcta:" con
  la miniatura del cuadrado y "Cuadrado azul".
- [ ] [web, móvil] En "¿Cuál es el triángulo?", sin textos alternativos, al fallar la
  barra muestra solo la miniatura del triángulo.
- [x] [web] Con las teclas 1 a 4 se eligen los mosaicos según su lugar en pantalla, y
  cada mosaico muestra su número.

### Emparejar, clasificar y ordenar

- [x] [web] Emparejar tiene "Columna izquierda" y "Columna derecha", con "Texto" o
  "Imagen". Con "Imagen" a la izquierda, cada pareja tiene un campo de imagen a la
  izquierda y uno de texto a la derecha.
- [x] [web] Clasificar y ordenar tienen "Tipo de elementos", con "Texto" o "Imagen". Al
  cambiarlo y volver, lo escrito y las imágenes siguen ahí.
- [x] [web] Dos imágenes iguales en la misma columna de emparejar, o dos elementos de
  imagen iguales, muestran "Esta imagen está repetida.". La misma imagen en las dos
  columnas se guarda.
- [ ] [web, móvil] En "Relacionar con imágenes", el primer emparejar muestra las figuras a
  la izquierda y sus nombres, mezclados, a la derecha, lado a lado también en el
  teléfono.
- [ ] [web, móvil] Al formar una pareja, el número de la pareja se ve en la esquina del
  mosaico y en el texto. Al fallar una, la barra muestra la miniatura de la figura, "→"
  y el nombre que le tocaba.
- [ ] [web, móvil] El emparejar de imagen con imagen une las figuras rellenas con las de
  contorno, y al fallar la barra muestra las dos miniaturas de cada pareja fallada.
- [ ] [web, móvil] En el clasificar, los mosaicos se colocan en "Tiene esquinas" y "No
  tiene esquinas" pulsando y arrastrando, y al fallar la barra muestra la miniatura de
  cada elemento fallado, "→" y su categoría.
- [ ] [web, móvil] En el ordenar, cada lugar numerado recibe un mosaico, y al fallar la
  barra muestra "1." a "4." con la miniatura de cada figura en su orden.
- [ ] [móvil] Arrastrar un mosaico lleva una copia con la imagen, y mantener pulsado
  sigue siendo necesario para arrastrar (F11).

### Portada

- [x] [web] En el mapa de un borrador sin portada, "Portada" muestra la portada generada y
  "Elegir imagen". Al subir una, muestra su vista 16:9 y su vista cuadrada, y "Guardar
  cambios" se habilita.
- [x] [web] Al guardar, "Cambios guardados"; la portada sigue al recargar y se ve en
  "Cursos que creé" y, con el curso enviado a revisión, en su mapa (F06).
- [x] [web] Al elegir un GIF para la portada aparece "La portada puede ser JPEG, PNG o
  WebP.".
- [x] [web] "Quitar" y "Guardar cambios" devuelven la portada generada en el mapa y en
  "Cursos que creé".
- [x] [web] En el catálogo, la tarjeta de "Actividades de prueba" muestra su portada en
  16:9 con las tres franjas a la vista; en su detalle, cuadrada y recortada al centro,
  sin las franjas de los lados.
- [ ] [móvil] En el catálogo y en el detalle, la portada de "Actividades de prueba" se ve
  cuadrada y recortada al centro.
- [ ] [web, móvil] Después de completar una lección de "Actividades de prueba", su
  portada se ve en "Sigue aprendiendo" (web) y en "Mis cursos" (móvil).
- [ ] [web, móvil] Con el servidor apagado después de cargar el catálogo, una portada que
  no había cargado se ve como la generada.

### GIF

- [ ] [web, móvil] En "GIF", la teoría muestra el GIF moviéndose, con un botón "Pausar"
  en su esquina.
- [ ] [web, móvil] Al pulsar "Pausar", el GIF se queda quieto en ese cuadro y el botón
  dice "Reanudar"; al pulsarlo otra vez, sigue desde ahí.
- [ ] [web, móvil] Con "reducir movimiento" activado, el GIF empieza quieto, en su primer
  cuadro, con "Reanudar".
- [ ] [web, móvil] En la opción múltiple de "GIF", pulsar el botón de pausa del mosaico
  no elige la opción, y salir de la lección después de solo pausar no pide confirmación.
- [ ] [web, móvil] En la barra inferior, la miniatura de un GIF se ve quieta.

### Ampliar

- [ ] [web, móvil] Al tocar el panorama de "Imágenes entre párrafos", se abre sobre la
  lección, sobre fondo oscuro, completo y tan grande como cabe, con "Cerrar".
- [x] [web] "Cerrar", Esc y pulsar el fondo cierran el visor, y el foco vuelve a la
  imagen. Con Tab, el foco no sale del visor mientras está abierto.
- [ ] [móvil] En el visor, pellizcar acerca la imagen y, acercada, se mueve con un dedo.
  "Cerrar" la cierra y la lección sigue como estaba.
- [ ] [web, móvil] La imagen de "¿Qué figura es esta?" también se amplía al tocarla, y
  tocar un mosaico de opción lo elige sin abrir el visor.
- [ ] [web, móvil] Abrir y cerrar el visor en la primera actividad no cuenta como haber
  hecho algo: salir no pide confirmación.

### Carga y errores al cursar

- [ ] [web, móvil] Mientras una imagen carga, su lugar ya tiene su tamaño, y el texto de
  abajo no salta al llegar la imagen.
- [ ] [web, móvil] Con el servidor apagado después de abrir la lección, una imagen que no
  había cargado muestra el icono de imagen rota y su texto alternativo; sin texto
  alternativo, "No se pudo cargar la imagen".
- [ ] [web, móvil] Un mosaico que no cargó muestra su texto alternativo y se puede elegir
  y comprobar.
- [ ] [móvil] Si las imágenes de "Opción múltiple con imágenes" no cargaron al abrirla
  porque se cayó la conexión, al volver la conexión aparecen solas en su lugar.
- [x] [web] Si las imágenes de "Opción múltiple con imágenes" no cargaron al abrirla y
  después el servidor vuelve a responder, al pasar a la siguiente actividad sus imágenes
  se ven.
- [ ] [web, móvil] Si abro "Relacionar con imágenes", espero unos segundos en la primera
  actividad y apago el servidor (en el móvil, quito la conexión), las imágenes de las
  actividades siguientes se ven al llegar a ellas y la lección se termina como en F03.

### Accesibilidad y teclado

- [ ] [web, móvil] Con lector de pantalla, la imagen del círculo rojo se anuncia con su
  texto alternativo y que se puede ampliar.
- [ ] [web, móvil] Con lector de pantalla, un mosaico se anuncia con su texto
  alternativo y su estado; uno sin texto alternativo, como "Imagen {n}".
- [ ] [web, móvil] El botón de un GIF se anuncia como "Pausar animación" o "Reanudar
  animación".
- [x] [web] Con Tab se llega a cada imagen ampliable y a cada botón de pausa, con foco
  visible; Enter o la barra espaciadora abren la imagen o pausan el GIF.
- [ ] [web, móvil] Las imágenes, los mosaicos, el botón de pausa y el visor se ven bien en
  modo oscuro y con "reducir transparencia".

### Límites del curso y servidor

- [x] [web] En el curso casi lleno, subir una imagen que no cabe muestra "Este curso ya
  tiene 200 MB de imágenes. Quita alguna y guarda para hacer espacio.".
- [x] [web] En ese curso, al quitar una imagen ya guardada y guardar la lección, la misma
  imagen que no cabía ahora se sube.
- [x] [web] En la lección pesada, con seis GIF de 5 MB, "Guardar lección" y "Probar
  lección" muestran "Las imágenes de esta lección pesan más de 25 MB. Quita alguna." y
  no guardan ni abren la prueba. Al quitar dos GIF, se guarda.
- [x] [web] Una misma imagen usada en dos actividades de la lección cuenta una vez en
  los 25 MB.
- [x] [web] En el lienzo de una lección con imágenes, junto a "Guardar lección" se lee
  "Imágenes de esta lección: {x} de 25 MB", que sube al elegir una imagen y baja al
  quitarla, sin guardar. En la lección pesada se ve en el color de error, con su icono, y
  en una lección sin imágenes no aparece.
- [x] [web] El mapa de un borrador con imágenes muestra "Imágenes del curso: {x} de 200
  MB"; el del curso casi lleno, un número cercano a 200, que baja al quitar una imagen,
  guardar la lección y volver al mapa.
- [x] [backend] Una imagen que se sube y no se guarda en ninguna parte se borra un día
  después de subirla.
- [x] [backend] Al eliminar una lección se borran sus imágenes que no se usan en otra
  parte del curso, y al eliminar el curso, todas.
- [x] [backend] Subir dos veces el mismo archivo al mismo curso da la misma imagen, que
  cuenta una vez.
- [x] [backend] El servidor rechaza subir sin sesión, a un curso ajeno, en revisión o
  publicado, un archivo que no es imagen aunque se llame `.png`, un JPEG de más de 1600
  px por lado, un JPEG con su ubicación, un PNG animado y un GIF de más de 5 MB.
- [x] [backend] El servidor rechaza guardar una lección con una imagen de otro curso, una
  imagen que no existe, imágenes de más de 25 MB entre todas, una teoría con más imágenes
  que marcas, o mosaicos de una columna con imágenes y textos mezclados. No guarda
  nada.
- [x] [backend] El servidor rechaza una portada GIF o de otro curso al guardar los datos
  del curso.
- [x] [backend] Las imágenes de un borrador solo las trae su autor; las de un curso
  publicado, cualquier usuario con sesión, y sin sesión, nadie.
- [x] [web] Si quito una imagen y guardo en una pestaña, y en otra pestaña con la versión
  anterior elijo "Reemplazar", aparece "Revisa los datos marcados." y el campo muestra
  "Esta imagen ya no está. Elige otra.".

### Contenido

- [ ] [web, móvil] En "Imágenes con etiquetas", los textos alternativos con `<b>hola</b>`
  y `<script>` se ven tal cual en la barra inferior y en el lugar de una imagen que no
  carga, sin interpretarse.
- [ ] [web, móvil] En "Imágenes al límite", la opción múltiple de 9 mosaicos, el emparejar
  de 8 parejas de imágenes, el clasificar de 12 mosaicos en 4 categorías y el ordenar de
  10 se ven completos en un teléfono de 360 px, desplazando la actividad, sin cortar ni
  encimar mosaicos.
- [x] [web] La vista previa del editor muestra las imágenes, los GIF con su pausa y el
  visor igual que el reproductor, y "Probar lección" recorre "Relacionar con imágenes"
  como un alumno.

## Datos que toca

- **Imagen** (nueva): archivo de imagen de un curso. Importan su curso, su formato
  (JPEG, PNG, WebP o GIF), su tamaño en px (ancho y alto), su peso y cuándo se subió.
  Subir dos veces el mismo archivo al mismo curso da la misma imagen. Se borra cuando el
  curso deja de usarla (al guardar o al eliminar una lección), con el curso, o un día
  después de subirla si nunca se usó. No guarda el nombre del archivo.
- **Curso** (F02, F05, F06): gana la portada, opcional, una de sus imágenes que no sea
  GIF. Sus imágenes pesan hasta 200 MB entre todas. Las tarjetas, el detalle, "Cursos que
  creé" y el mapa la muestran.
- **Actividad** (F03, F05, F11): cada imagen que usa una actividad lleva su texto
  alternativo, opcional.
  - Teoría: su texto puede tener hasta 5 marcas `[imagen]`, y lleva una imagen por marca,
    en orden.
  - Opción múltiple: una imagen opcional para la pregunta, y las opciones pueden ser
    imágenes.
  - Emparejar: cada columna es de textos o de imágenes.
  - Clasificar y ordenar: los elementos son todos textos o todos imágenes.
- **Leccion** (F02, F05): no cambia; al guardarla se comprueban sus imágenes (que pesen
  hasta 25 MB entre todas), y las que dejó de usar se borran si nada más las usa.
- **Progreso** (F04): no cambia.

## Supuestos

- El audio propio pasa a F14, que lo sube como aquí sube las imágenes: sin una actividad
  de audio, F13 no podría validarlo. `specs/00-proyecto.md` cambia el nombre de F13 a
  "Imágenes propias en los cursos", y F14 suma el audio propio.
- Para validar los criterios, el curso "Actividades de prueba" gana una portada (de
  1600 × 900 px, con una figura al centro y una franja de color en cada lado y abajo, para
  ver el recorte) y, al final, estas lecciones, solo mientras se valida (como en F03, F11
  y F12):
  - **Teoría con imágenes**: "Imágenes entre párrafos" (tres párrafos; una marca entre el
    primero y el segundo, con un panorama de 1600 × 400 px que tiene una marca en cada
    extremo; otra a la mitad del segundo, con una imagen de 120 × 80 px sin texto
    alternativo; y puntos clave), "Solo una imagen alta" (solo la marca, con una imagen de
    400 × 1600 px) y "Cinco imágenes".
  - **Opción múltiple con imágenes**: "¿Qué figura es esta?" (con la imagen de un círculo
    rojo y opciones de texto), "¿Cuál es el cuadrado azul?" (cuatro figuras con texto
    alternativo, entre ellas "Círculo rojo" y "Cuadrado azul") y "¿Cuál es el triángulo?"
    (tres figuras sin texto alternativo).
  - **Relacionar con imágenes**: un emparejar de figuras con sus nombres, uno de figuras
    rellenas con figuras de contorno, un clasificar de figuras en "Tiene esquinas" y "No
    tiene esquinas" y un ordenar de figuras de menos a más lados (de 3 a 6).
  - **GIF**: una teoría con un GIF y una opción múltiple con un GIF entre sus mosaicos.
  - **Imágenes al límite**: una opción múltiple de 9 mosaicos, un emparejar de 8 parejas
    de imagen con imagen, un clasificar de 12 mosaicos en 4 categorías y un ordenar de 10
    mosaicos.
  - **Imágenes con etiquetas**: opciones y elementos con `<b>hola</b>` y `<script>` en su
    texto alternativo.
  Van al final para no mover las posiciones que citan F03, F05, F11 y F12. Las figuras
  son dibujos simples hechos para las pruebas, no fotos. El quickstart trae además los
  archivos para subir: la foto de 4000 × 3000 px, la de 800 × 600, el PNG transparente,
  la foto de lado, la foto con ubicación, el GIF de 2 MB, el archivo de 11 MB, el GIF de
  6 MB, el SVG, el HEIC, el texto con extensión `.png`, lo que llena un curso casi hasta
  los 200 MB y una lección pesada, con seis GIF de 5 MB.
- Los cursos del prototipo no traían imágenes, así que no cambian y siguen con su
  portada generada.
- Las imágenes son de un curso, no de una actividad: así, quitar una imagen de un lugar no
  la borra si otro lugar del mismo curso la usa, y el espacio se cuenta por curso.
- Una imagen recién subida no se borra al momento si no se guarda, sino un día después:
  el autor puede tener la lección abierta en otra pestaña o recuperar lo escrito al
  volver a entrar (F05). Mientras, cuenta para el espacio del curso, para que nadie llene
  el servidor subiendo sin guardar.
- La portada no lleva texto alternativo porque siempre va junto al título del curso, que
  ya la nombra, y no admite GIF porque en el catálogo se moverían muchas a la vez.
- El texto alternativo es opcional, como lo decidió el usuario. Sin él, un mosaico se
  llama "Imagen {n}" para que un lector de pantalla pueda al menos distinguirlo de los
  demás.
- La marca es `[imagen]` porque se lee sola en el campo, como `___` en completar
  espacios, y es difícil que un texto la traiga sin querer. No lleva número: las
  imágenes siguen el orden de las marcas, como los espacios.
- Las imágenes de la teoría y la pregunta no pasan de la mitad del alto de la pantalla,
  para que una imagen alta no empuje el resto de la actividad fuera de la vista; para
  verla entera en grande está el visor.
- La miniatura de un GIF va quieta porque en la barra inferior no hay lugar para su botón
  de pausa.
- El tamaño de los mosaicos, las miniaturas y el botón de pausa, y cómo se ven el visor
  y el campo de imagen, se escriben primero en `docs/diseno.md`.
- La web, el móvil y el servidor cambian juntos: todavía no hay versiones publicadas del
  móvil que deban seguir funcionando.
- En la web no se detecta "sin conexión" aparte (igual que en F01 a F06, F11 y F12).
- Al cerrar la feature se actualizan `specs/02-modelo-datos.md` (la entidad Imagen, la
  portada del curso y las actividades con imágenes) y `specs/01-navegacion.md` (el visor
  de imágenes se abre sobre la lección y el botón de volver de Android lo cierra).

## Aclaraciones

### Sesión 2026-11-07

Decididas con el usuario antes de la spec (ver "Descripción original"): el audio propio
pasa a F14; dónde van las imágenes; varias en la teoría con una marca en el texto; las
opciones y los elementos de imagen, solo la imagen, completa en un mosaico; cada columna
de emparejar de texto o de imágenes; el texto alternativo opcional; las miniaturas en la
barra al fallar; reducir las fotos a 1600 px y los GIF tal cual, hasta 5 MB; el botón de
pausa de los GIF; 200 MB por curso; y ampliar la imagen de la teoría y de la pregunta.

Decididas al aclarar la spec:

- P: ¿La portada del curso puede ser un GIF? → R: No. La portada es JPEG, PNG o WebP; los
  GIF van dentro de las lecciones, donde tienen su botón de pausa.
- P: ¿Cuándo trae el alumno las imágenes de una lección? → R: Todas al abrirla, sin
  esperarlas: si después se pierde la conexión, lo que ya llegó se sigue viendo.
- P: Si una imagen no cargó, ¿se vuelve a intentar? → R: Sí, sola: en el móvil, al volver
  la conexión; en la web, al pasar a otra actividad.
- P: ¿Hay un límite de peso de imágenes por lección? → R: Sí, 25 MB entre todas sus
  imágenes, comprobado al guardar y al probar la lección, porque el alumno las trae todas
  al abrirla.
- P: ¿El autor ve cuánto lleva usado de los dos límites? → R: Sí: el lienzo muestra
  "Imágenes de esta lección: {x} de 25 MB" junto a "Guardar lección", al momento, y el
  mapa, "Imágenes del curso: {x} de 200 MB" en los datos del curso.
