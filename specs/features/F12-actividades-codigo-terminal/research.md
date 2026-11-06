# Investigación: F12 Actividades de código y terminal

Solo lo que esta feature tiene de nuevo. El stack y lo decidido en F03, F05 y F11 (registro
tipo → componente, borradores del editor, vista previa en un ámbito, ids en los borradores,
`BarraRespuesta` con detalle desplazable) no se repite.

## 1. Forma de los datos en el contrato

- **Identificadores de tipo**: `retoCodigo`, `terminalSimulada` y `grafoCommits`, los que
  ya reserva la paleta de la web (`src/editor/paleta.ts`). Con ellos, cada entrada se
  activa sola al llegar a `registroEditor` (research de F05, punto 10).
- **Lenguaje**: un id en minúsculas (`c`, `css`, `html`, `javascript`, `python`, `sql`,
  `bash`, `otro`) en `LENGUAJES_CODIGO`, y el nombre que se muestra en `NOMBRE_LENGUAJE`.
  Se guarda el id y no el nombre: es lo que usaba el prototipo (`c`, `css`) y deja
  cambiar cómo se escribe un nombre sin tocar los datos. Que "Otro" no se muestre lo
  decide cada cliente, no el contrato.
- **Comandos aceptados**: `comandos`, una lista de textos. El primero es el que se
  muestra como respuesta correcta, como la primera aceptada de completar espacios.
- **Commits por índice**, como `categoria` en clasificar y `correcta` en la opción
  múltiple (research de F11, punto 4), no por nombre como el prototipo:
  - `padres` son índices de commits **anteriores** en la lista. Así no hay ciclos que
    buscar: basta con comprobar `padre < indice`, y el primer commit es el único sin
    padres.
  - `ramas[].commit`, `head` y `respuesta` también son índices.
  - Renombrar un commit en el editor no rompe nada, porque el borrador usa ids (punto 9).
- **HEAD**: `head?: { rama: number } | { commit: number }`, una unión con un solo campo,
  como `OpcionRespuesta` (`{ texto }` o `{ simbolo }`). Sin HEAD, no hay campo.
- **`ramas` siempre está**, aunque esté vacía. Una lista vacía significa "sin ramas", y
  así los clientes no tienen que distinguir entre vacía y ausente.
- **`consigna`** en los tres, obligatoria, como `ordenar` (F11). Usa `consignaMax`.
- **Alternativa descartada**: guardar el nombre del lenguaje ("CSS") y los commits por
  nombre. Lo primero ata los datos a cómo se escribe hoy; lo segundo obliga a validar
  ciclos y nombres en cada referencia.

## 2. Acomodar el grafo: columnas y filas

- **Decisión**: una función pura `acomodarGrafo(actividad)` que devuelve la columna y la
  fila de cada commit, igual en la web y en el móvil (`src/utilidades/grafo.ts`), como
  `relacionar.ts` en F11. El backend solo necesita las columnas para el límite de 6, y
  tiene su propia `contarColumnas` en `src/validacion/actividades.ts`: el contrato no lleva
  lógica (como `hayFormaDeLlenar`).
- **Columnas** (por generaciones):

  ```text
  columna[0] = 0
  columna[i] = 1 + la mayor columna de sus padres
  ```

  Como los padres siempre van antes en la lista, se calcula en una pasada. Dos commits en
  paralelo (`c3` y `c4`, hijos de `c2`) quedan en la misma columna, que es lo que permite
  que 10 commits quepan en 6 columnas.
- **Filas** ("Acomodo del grafo" en la spec):

  ```text
  trazar(desde):
    si desde ya tiene fila: no hacer nada
    f = una fila nueva, debajo de las anteriores
    c = desde
    mientras c exista y no tenga fila:
      fila[c] = f
      c = primer padre de c

  para cada rama, en el orden del autor: trazar(rama.commit)
  para cada commit, del último al primero: trazar(commit)
  ```

  Dentro de una fila, cada commit está a la derecha de su primer padre, así que dos
  commits nunca caen en la misma fila y columna.
- **Por qué el primer padre**: es la historia "principal" de la rama, la que sigue
  `git log --first-parent`. Un merge queda en la fila de la rama que lo recibió, y su
  segundo padre, en la suya.
- **El grafo del prototipo**: `feature` apunta a `c3` y alcanza `c2` y `c1`, así que los
  tres quedan en una fila. Es lo que dice la spec en "Supuestos".
- **Alternativa descartada**: una columna por commit, en el orden de la lista. Se lee
  igual de bien, pero con 10 commits no cabría en el teléfono.

## 3. Dibujar el grafo

- **Decisión**: líneas en SVG y commits como botones encima, en una caja con posición
  relativa. Las posiciones salen de `acomodarGrafo` y de `medirGrafo` (abajo).
  - Web: `<svg aria-hidden="true">` con un `<path>` por línea, y cada commit, un
    `<button>` con `position: absolute`. El ancho se lee con un `ResizeObserver` en un hook
    nuevo `useAncho`.
  - Móvil: `Svg` y `Path` de `react-native-svg`, que **ya está** en `package.json` (lo usa
    `lucide-react-native`), y cada commit, un `Pressable` con `position: "absolute"`. El
    ancho sale de `onLayout`.
  - **Por qué botones y no círculos de SVG**: un botón ya tiene foco, Enter, barra
    espaciadora, nombre accesible y área táctil. En SVG habría que rehacer todo eso.
- **Medidas** (`MEDIDAS_GRAFO` en `utilidades/grafo.ts`):

  | Qué | Valor |
  |---|---|
  | Círculo | 40 px de diámetro, dentro de un área de 44 × 44 |
  | Separación mínima entre columnas | 48 px (44 de área y 4 de aire) |
  | Separación máxima entre columnas | 96 px: en la web, el grafo no se estira de más |
  | Separación entre filas | 64 px, más lo que ocupen las etiquetas (abajo) |

  Con 6 columnas, el grafo pide 5 × 48 + 44 = 284 px. En un teléfono de 360 px, quitando
  los 20 px de margen de cada lado y los 16 px de relleno de la `Superficie`, quedan 288:
  cabe. Con 4 caracteres en `codigo` (14 px, unos 8.4 px por carácter), el nombre mide
  unos 34 px y cabe dentro del círculo.
- **Etiquetas**: van **encima** de su commit, centradas y recortadas a los bordes de la
  caja. Se escriben en la letra de código, así que su ancho se calcula sin medir
  (`caracteres × 0.62 × tamaño + relleno`), igual en los dos clientes. Si una etiqueta se
  encimaría con otra de la misma fila, sube un nivel. Cada fila reserva los niveles que
  use. 0.62 cubre las monoespaciadas de los dos clientes (Menlo, Consolas, Roboto Mono y
  DejaVu Sans Mono miden entre 0.55 y 0.61).
  - La etiqueta más larga, `HEAD → ` y 20 caracteres (27 en total) en `codigo` de 14 px,
    mide unos 250 px con su relleno: también cabe en 288.
  - HEAD hacia una rama va en la etiqueta de la rama ("HEAD → main"); hacia un commit, en
    una etiqueta propia ("HEAD").
- **Líneas**: recta si el padre y el hijo están en la misma fila. Si no, una curva que
  cambia de fila en un solo paso de columna:
  - si es el primer padre (el hijo es el primero de su fila), la curva va junto al padre y
    la línea sigue recta por la fila del hijo;
  - si es el segundo padre de un merge, va recta por la fila del padre y la curva va junto
    al hijo.

  Con el primer padre, el hijo siempre es el primer commit de su fila, así que el tramo
  recto no cruza ningún commit. Con un segundo padre, sí podría cruzar uno si la rama
  siguió después del merge; es raro y no lo pide ningún criterio.
- **Letra grande**: `medirGrafo` recibe el factor de la letra (`PixelRatio.getFontScale()`
  en el móvil; en la web, el tamaño de 1rem) y lo aplica a círculos y etiquetas. Si con eso
  el grafo no cabe, la caja se desplaza hacia los lados (`overflow-x: auto` en la web, un
  `ScrollView` horizontal en el móvil), como pide la spec.
- **Alternativa descartada**: medir cada etiqueta después de pintarla (`onLayout`,
  `getBoundingClientRect`). Pide dos pasadas, el grafo salta al aparecer, y en el móvil
  `onLayout` llega un cuadro tarde.

## 4. El campo de código en la web

- **Decisión**: un `<textarea>` en el panel oscuro, con `wrap="off"` (las líneas largas se
  desplazan hacia los lados, como `BloqueCodigo`) y `rows` igual al número de líneas, con
  un mínimo de 6. Sin `wrap`, cada línea es una fila, así que crecer no necesita medir.
- **Tab y Mayús+Tab**: `onKeyDown` cancela el Tab y escribe con
  `document.execCommand("insertText")`:
  - sin selección, mete dos espacios en el cursor;
  - con varias líneas seleccionadas, selecciona esas líneas completas, las reemplaza con
    la versión con sangría y vuelve a seleccionarlas;
  - Mayús+Tab hace lo mismo quitando hasta dos espacios del inicio de cada línea.

  `execCommand` está marcado como obsoleto, pero es la única forma de escribir en un
  `<textarea>` que **entra en el historial de deshacer** en Chrome y en Firefox:
  `setRangeText` y cambiar `value` lo borran. Si un día deja de existir, Tab sigue
  funcionando con `setRangeText`, sin poder deshacerlo.
- **Esc**: pone una marca en un `ref`. El siguiente Tab, con la marca, no se cancela y el
  navegador mueve el foco. Cualquier otra tecla y `blur` quitan la marca, **menos las
  modificadoras** (`Shift`, `Control`, `Alt` y `Meta`): Mayús+Tab llega como un `keydown`
  de `Shift` y luego otro de `Tab`, y sin esa excepción Esc y Mayús+Tab metería espacios.
- **El texto de ayuda**: un `<p>` debajo del panel, enlazado con `aria-describedby`, así
  que el lector de pantalla lo lee al entrar al campo. Desaparece en solo lectura, cuando
  Tab ya sale del campo.
- **Atributos**: `spellCheck={false}`, `autoCapitalize="off"`, `autoCorrect="off"` (lo
  respeta Safari) y `autoComplete="off"`.
- **Alternativa descartada**: un editor de código (CodeMirror, Monaco). Traen coloreado,
  números de línea y sangría, que la spec deja fuera, a cambio de cientos de kB y de no
  tener par en el móvil.

## 5. Lo que el teclado no debe cambiar

- **El problema**: en iOS, la "puntuación inteligente" cambia `"` por `“`, `--` por `—` y
  `...` por `…` mientras se escribe. Con las comillas contando al comparar, `git commit -m
  "Primer commit"` saldría mal, y `git log --oneline` también.
- **React Native no lo apaga directamente**: `TextInput` expone `autoCorrect`,
  `autoCapitalize`, `spellCheck` y `smartInsertDelete`, pero no `smartQuotesType` ni
  `smartDashesType` de iOS (se revisó `RCTTextInputComponentView.mm` en
  `node_modules/react-native`). Apagar `autoCorrect` suele apagarlos también, pero no está
  garantizado en todos los teclados.
- **Decisión**: dos capas, en los dos clientes:
  1. Los atributos: `autoCorrect={false}`, `autoCapitalize="none"`, `spellCheck={false}`,
     `autoComplete="off"` y `smartInsertDelete={false}` en el móvil; los del punto 4 en la
     web.
  2. `textoTecleado(texto)`, en `utilidades/codigo.ts`, en cada cambio del campo de código
     y de la terminal: `“ ” „ ‟` → `"`, `‘ ’ ‚ ‛` → `'`, `—` → `--` y `…` → `...`. Es la
     garantía: aunque el teclado cambie algo, el campo muestra lo que se tecleó.
- **El cursor**: los dos primeros reemplazos no cambian la longitud y el cursor no se
  mueve. `—` → `--` y `…` → `...` la cambian; en el móvil un `TextInput` controlado
  puede dejar el cursor al final. Se comprueba en el teléfono escribiendo `--` a mitad de
  una línea, y si pasa, se corrige con `selection`. En la web pasa siempre: si el valor
  que se guarda no es el del `textarea`, React lo reemplaza y el cursor salta al final. Ahí
  se restaura con `setSelectionRange` después de pintar, corrido por lo que creció el
  texto antes del cursor (en ese caso se pierde el deshacer de ese cambio, que es raro).
- **El largo**: como `…` → `...` alarga el texto, después de `textoTecleado` se recorta al
  límite del campo (`respuestaCodigoMax` o `comandoMax`).
- **En la web**: Chrome no cambia la puntuación en un `<textarea>`, pero macOS sí lo hace
  si el usuario tiene las sustituciones activadas en el sistema. `textoTecleado` también lo
  cubre.
- **Alternativa descartada**: `keyboardType="ascii-capable"` en iOS. Apaga la puntuación
  inteligente, pero también las letras con acento, y un comando puede tenerlas (`mkdir
  canción`).

## 6. La terminal

- **Comparar**: `normalizarComando(texto)` aplica los reemplazos de `textoTecleado`
  (punto 5), recorta y cambia cada racha de espacios (`/\s+/`) por uno.
  `comandoAceptado(escrito, comandos)` compara con `===` después de normalizar los dos. Es
  una copia en los tres repos, como `normalizarRespuesta`: el backend la usa para los
  comandos repetidos, con sus propios reemplazos (no hay `textoTecleado` en el backend).
  - **Por qué también los reemplazos**: lo que escribe el alumno nunca tiene `“`, `—` ni
    `…`. Si el autor los pone en un comando aceptado (por ejemplo, al pegarlo de un
    documento), sin esto nadie podría acertarlo. Lo que se muestra como respuesta
    correcta sigue siendo el comando tal como lo escribió el autor (spec, "Aclaraciones",
    sesión 2026-11-06).
- **La línea del comando crece**: la spec pide que un comando largo pase a la línea
  siguiente mientras se escribe, y un `<input>` no lo hace.
  - Web: un `<textarea rows={1}>` sin bordes ni fondo, con `caret-color` brote. Enter lo
    cancela y comprueba; el alto se ajusta a `scrollHeight` en cada cambio
    (`useAlturaAutomatica`, hook nuevo). Va en un `<form>`, como completar espacios.
  - Móvil: un `TextInput` `multiline` con `submitBehavior`: `"blurAndSubmit"` con el
    comando recortado no vacío (comprueba y cierra el teclado, como pide la spec) y
    `"submit"` vacío o solo con espacios (no hace nada ni cierra el teclado). Comprobar con
    el botón de la barra también cierra el teclado (`Keyboard.dismiss()`), porque
    `keyboardShouldPersistTaps="handled"` lo deja abierto al pulsar un botón. `returnKeyType="send"` y, en iOS,
    `enablesReturnKeyAutomatically`.
- **Pegar con saltos de línea**: en los dos, cada cambio pasa por
  `texto.replace(/\r?\n/g, " ")` antes de `textoTecleado`. Un `multiline` acepta el salto
  de línea al pegar; así queda en una línea y no se comprueba solo.
- **Pulsar en la terminal**: `onClick` en el panel (web) y un `Pressable` sin estilo de
  presión (móvil) llaman a `focus()` del campo. En la web no lo hace si hay texto
  seleccionado, para dejar copiar la salida.
- **La salida**: `<pre>` con `white-space: pre-wrap` y `tab-size: 4` en la web; `Texto` con
  la letra de código en el móvil, que ya respeta saltos de línea. Las tabulaciones de
  `git status` (`\tREADME.md`) se ven como sangría.
- **Alternativa descartada**: una línea que no crece, con desplazamiento lateral. La spec
  pide leer el comando completo mientras se escribe.

## 7. Que se vea lo que se escribe en el móvil

- `MarcoActividad` ya envuelve todo en `KeyboardAvoidingView` (`padding` en iOS) y un
  `ScrollView` con `keyboardShouldPersistTaps="handled"`. En Android el sistema desplaza
  solo hasta el campo con el foco; en iOS, no siempre.
- **Decisión**: el campo de código crece hasta 12 líneas (`maxHeight`) y después se
  desplaza por dentro, y un `TextInput` que se desplaza por dentro mantiene el cursor a la
  vista. Lo que falta es que el campo entero quede a la vista al abrir el teclado.
- **Sin comprobar todavía** (no se puede saber leyendo el código; lo cubren criterios de
  la spec):

  | Qué se supone | Si no se cumple |
  |---|---|
  | En iOS, al enfocar la terminal o el campo de código, el `ScrollView` los deja a la vista | `MarcoActividad` gana la prop opcional `alAbrirTeclado`: con ella, en `keyboardDidShow` desplaza su `ScrollView` hasta el final. El campo es lo último antes de comprobar, así que basta |
  | Con `autoCorrect={false}`, Gboard no reemplaza palabras | Ya está `textoTecleado` para la puntuación; para palabras, `keyboardType="visible-password"` solo en Android |
  | Reemplazar `--` por sí mismo en `onChangeText` no mueve el cursor | `selection` controlada (punto 5) |

  Conviene comprobarlos con la terminal, antes de hacer el reto y el grafo.

## 8. La barra con un comando

- **El problema**: la spec pide el comando esperado y el nombre del commit en letra
  monoespaciada, y `detalle` es texto normal.
- **Decisión**: `BarraRespuesta` gana la prop `codigo`, que va entre el título y el
  detalle, en la letra de código, sin el panel oscuro (la barra ya tiene su color). La usan
  la terminal (`codigo`: el comando; `detalle`: la pista) y el grafo (`codigo`: el nombre
  del commit; `detalle`: la explicación). El título sigue siendo "¡Correcto!" o "Respuesta
  correcta:", como en los demás tipos.
- Con el detalle, `codigo` se desplaza (F11): los dos van en la misma zona con altura
  limitada.
- **Alternativa descartada**: `detalle` como `ReactNode`. Abriría la barra a cualquier
  contenido, y en el móvil el anuncio de iOS necesita texto.

## 9. El editor

- **Reto de código**: borrador `{ consigna, lenguaje: LenguajeCodigo | null, codigoInicial,
  solucion }`. El selector usa `CampoSelector` (F11) con `textoVacio` "Elige un lenguaje".
  Los dos campos de código son `CampoArea` con `codigo`, sin el Tab del alumno (la spec lo
  deja fuera).
- **Terminal simulada**: `comandos` es `FilaTexto[]` en una `ListaEditable` con `minimo`
  1, como las respuestas aceptadas de F05. Los comandos y la carpeta son `CampoTexto`, que
  gana la prop `codigo` (letra monoespaciada, sin corrector), igual que `CampoArea`.
- **Grafo de commits**: el borrador guarda ids, como el banco de palabras (research de
  F11, punto 9):

  ```ts
  type FilaCommit = { id: string; nombre: string; idPadre: string | null; idSegundoPadre: string | null };
  type FilaRama = { id: string; nombre: string; idCommit: string | null };
  type BorradorGrafoCommits = {
    consigna: string;
    commits: FilaCommit[];
    ramas: FilaRama[];
    head: { idRama: string } | { idCommit: string } | null;
    idRespuesta: string | null;
    explicacion: string;
  };
  ```

  - Los selectores de padre listan solo los commits de arriba. Como las filas no se
    reordenan, un padre elegido siempre sigue arriba.
  - Quitar un commit pone en `null` lo que lo usaba: `idPadre`, `idCommit` e
    `idRespuesta` muestran su error; `idSegundoPadre` y `head` quedan en "Ninguno" y "Sin
    HEAD" porque son opcionales. El que pasa a ser primero ignora su `idPadre`.
  - `aActividad` cambia ids por índices. `aBorrador` hace el camino de regreso, con ids
    nuevos.
  - `validar` llama a `acomodarGrafo` solo cuando todos los padres son válidos, y el error
    de columnas va en un `Aviso` debajo de los commits, como `fichasInsuficientes`. El foco
    va al selector "Padre" del último commit, con `aria-invalid`.
  - El selector de HEAD codifica su valor como `rama:<id>` o `commit:<id>`.
- **Foco al agregar** y **al primer error**: no cambian (research de F11, punto 9). La
  consigna va primero en los tres formularios.

## 10. Datos de prueba

- **Decisión**: se regenera `scripts/actividades-prototipo.ts` con el script desechable de
  F11 (tarea T014 de F11), ahora con doce tipos. Son 146 actividades (120 + 26).
- **Correspondencia** (la reutiliza F07):

  | Prototipo | Contrato |
  |---|---|
  | `code_challenge.prompt` / `.language` | `retoCodigo.consigna` / `.lenguaje` (`c` y `css`, sin cambio) |
  | `code_challenge.starter_code` / `.solution` | `retoCodigo.codigoInicial` / `.solucion` |
  | `terminal_sim.prompt` / `.cwd` / `.setup_output` | `terminalSimulada.consigna` / `.carpeta` / `.salidaPrevia` |
  | `terminal_sim.accepted` / `.success_output` / `.hint` | `terminalSimulada.comandos` / `.salidaAcierto` / `.pista` |
  | `commit_graph.prompt` / `.explanation` | `grafoCommits.consigna` / `.explicacion` |
  | `commit_graph.commits[].label` | `grafoCommits.commits[].nombre` |
  | `commit_graph.commits[].parents` (ids) | `grafoCommits.commits[].padres` (índices) |
  | `commit_graph.branches[]` | `grafoCommits.ramas[]` (`name` → `nombre`, `commit` → índice) |
  | `commit_graph.answer` (id) | `grafoCommits.respuesta` (índice) |
  | `commit_graph.commits[].id`, `.x`, `.y` | se descartan |

  Los commits del prototipo ya vienen del más antiguo al más nuevo, así que sus padres
  siempre están antes.
- **"Actividades de prueba"** gana seis lecciones **al final** (quickstart.md, sección
  1.1), para que las posiciones que citan F03, F05 y F11 no cambien.
