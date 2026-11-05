# Investigación: F11 Actividades de relacionar

Solo lo que esta feature tiene de nuevo. El stack y lo decidido en F03 y F05 (registro
tipo → componente, borradores del editor, vista previa en un ámbito) no se repite.

## 1. Pulsar y arrastrar pasan por las mismas reglas

- **Decisión**: las reglas de los cuatro tipos son funciones puras en
  `src/utilidades/relacionar.ts`, iguales en la web y en el móvil, como
  `utilidades/actividades.ts` (research de F03, puntos 3 y 4). Reciben el estado y
  devuelven el estado nuevo. Pulsar y soltar solo traducen un gesto a una de esas
  funciones.

  | Función | Qué hace |
  |---|---|
  | `unirPareja(parejas, izquierda, derecha)` | Deshace lo que tuvieran los dos y agrega la pareja con el número libre más bajo |
  | `deshacerPareja(parejas, lado, indice)` | Quita la pareja de ese elemento |
  | `primerLibre(lugares)` | El primer lugar vacío, o -1 |
  | `colocarEnLugar(lugares, elemento, lugar)` | Pone el elemento en ese lugar. Si estaba ocupado, intercambia (ver "Soltar al arrastrar" en la spec) |
  | `quitarDeLugar(lugares, elemento)` | Lo devuelve; su lugar queda libre y nada se recorre |
  | `mezclarSinResolver(total)` | Índices mezclados, nunca en orden (punto 6) |
  | `solucionBanco(actividad, colocadas)` | La solución que se muestra (punto 5) |
  | `pulsarEnEmparejar(estado, elemento)` | "Pulsar en emparejar" de la spec, completo |
  | `pulsarCategoria` y `pulsarElementoClasificar` | "Pulsar en clasificar" de la spec |
  | `soltarEnClasificar` y `soltarEnLugares` | "Soltar al arrastrar" de la spec |
  | `claveDe` y `elementoDe` | Los elementos de emparejar como texto, para comparar con `===` al arrastrar |

- **Estado de cada actividad**: local, con `useState`, como en F03. Nada sale de la
  actividad salvo `alInteractuar` y `alTerminar`, así que el reproductor no cambia.
- **Por qué**: lo que más se puede desincronizar son las reglas de "qué pasa si
  suelto aquí" entre dos gestos y dos clientes. Con una sola función por regla, un
  caso validado pulsando vale también al arrastrar.
- **Alternativa descartada**: que cada componente lleve su lógica. Son cuatro tipos
  por dos clientes por dos gestos: dieciséis lugares donde equivocarse.

## 2. Arrastrar en la web: la API del navegador, con un hook nuevo

- **Decisión**: arrastrar y soltar nativo, como F05 (research de F05, punto 13), en un
  hook nuevo `src/hooks/useArrastrarElemento.ts`. La spec solo pide ratón en la web, y
  Brote se valida en Chrome.
- **Por qué no `useArrastrar`**: el de F05 ordena una lista: su destino es un número y
  la mitad del elemento decide si se suelta antes o después. Aquí el destino es un
  lugar concreto (una categoría, un espacio, un elemento). Forzarlo complicaría un
  hook que ya funciona en tres pantallas. El nuevo expone los mismos nombres
  (`propsOrigen`, `propsDestino`, `arrastrando`, `destino`), con un destino genérico:

  ```ts
  useArrastrarElemento<Item, Destino>({ alSoltar: (item: Item, destino: Destino) => void })
  ```

- **La vista previa no choca con el editor**: cada instancia solo acepta lo que empezó
  ella (`item === null` en `onDragOver`), igual que `useArrastrar`. Lo que se arrastra
  en la vista previa no lo acepta la secuencia, y un tipo de la paleta no lo acepta la
  actividad. No hace falta código para esto, y queda como criterio.
- **Desplazamiento**: mientras hay arrastre, un `dragover` en `document` llama a
  `window.scrollBy` si el puntero está a menos de 80 px del borde superior o a menos de
  140 px del inferior. Chrome ya desplaza solo, pero pegado al borde de la ventana, que
  en el reproductor queda debajo de la barra fija. Por eso la franja de abajo es más
  ancha.
- **Atenuar el origen**: el aviso de que empezó el arrastre va un cuadro después
  (`requestAnimationFrame`). Si la clase se pone en `dragstart`, la imagen que sigue al
  puntero sale atenuada también.
- **Soltar fuera**: la raíz de la actividad acepta `dragover` sin destino. Sin eso, en
  algunos sistemas el navegador anima la imagen de regreso, y esa animación no respeta
  "reducir movimiento".
- **Alternativa descartada**: eventos de puntero propios. Darían control total y
  funcionarían con el dedo en la web, pero son unas 120 líneas (umbral, captura, copia
  flotante, no disparar el clic) para algo que la spec deja fuera.

## 3. Arrastrar en el móvil: gesture handler y reanimated, ya instalados

- **Decisión**: `usePanGesture` de `react-native-gesture-handler` 3.3 con
  `activateAfterLongPress: 250` y `maxPointers: 1`, y `react-native-reanimated` para
  mover la copia. Las dos están en `package.json` (la segunda ya se usa, y la versión
  de la primera es la que trae el SDK 58), así que **no hay paquetes nuevos** y siguen
  sirviendo en Expo Go.
- **La API cambió en la versión 3**: ya no es `Gesture.Pan()`, sino hooks. Los nombres
  salen de `node_modules/react-native-gesture-handler/src/v3/`: `onActivate`,
  `onUpdate`, `onFinalize` y `GestureDetector`, con `absoluteX`, `absoluteY` y
  `canceled` en el evento.
- **`GestureHandlerRootView`**: hoy no existe en la app y `GestureDetector` lanza un
  error sin él. Va en `src/app/_layout.tsx`, envolviendo todo.
- **Por qué mantener pulsado**: `activateAfterLongPress` hace que el gesto falle si el
  dedo se mueve antes de tiempo, y entonces se desplaza la pantalla. Es justo lo que
  pide la spec, sin ninguna lógica propia. 250 ms: lo bastante corto para no sentirse
  lento y más largo que un toque.
- **Pulsar sigue siendo `Pressable`**: cuida la accesibilidad (un lector de pantalla
  activa `onPress`, no un gesto). Cuando el arrastre se activa, gesture handler le
  cancela el toque al `Pressable`. Por si en algún dispositivo llega de todos modos,
  `onPress` se ignora mientras haya arrastre y en el toque que lo terminó.
- **`runOnJS: true`**: los callbacks corren en JavaScript, sin worklets. Mientras se
  arrastra, el hilo de JavaScript no hace nada más, y así la comprobación de destinos
  puede usar estado normal. La copia se mueve con valores compartidos.
- **Dónde vive** (`src/actividades/arrastre/`):
  - `useArrastrarElemento<Item, Destino>({ alSoltar })`: qué se arrastra, posición,
    destinos registrados y el destino bajo el dedo. Mismos nombres que en la web.
  - `Arrastrable`: envuelve una `ElementoRespuesta` en un `GestureDetector`. Un
    `usePanGesture` por elemento, por eso es un componente.
  - `DestinoArrastre`: registra su vista como destino.
  - `CapaArrastre`: la copia flotante. Va fuera del `ScrollView`, en `MarcoActividad`,
    porque dentro quedaría recortada.
- **Encontrar el destino**: al activarse el arrastre se mide cada destino una vez con
  `measureInWindow`, junto con el desplazamiento del `ScrollView`. En cada `onUpdate`
  se compara el dedo con esos rectángulos, corregidos por lo que se haya desplazado
  después. Nada cambia de lugar durante un arrastre, así que no hay que volver a medir.
- **El desplazamiento**: al activarse, `MarcoActividad` recibe `scrollEnabled={false}`
  para que el `ScrollView` no pelee con el dedo. A menos de 72 px del borde de la zona
  visible, un ciclo de `requestAnimationFrame` llama a `scrollTo` con 8 px por cuadro.
- **Al implementarlo** (T047 a T049):
  - El móvil tiene React Compiler: los valores compartidos van con `.get()` y `.set()`, y
    una función no se puede llamar a sí misma desde un `useCallback`.
  - La configuración de `usePanGesture` va memorizada, con funciones estables: si cambia,
    se vuelve a mandar al lado nativo, también a mitad de un arrastre.
  - `terminar` recibe qué elemento termina, para que el gesto fallido de otro dedo no corte
    este arrastre. `canceled` también es `true` en un gesto que nunca se activó.
  - El hook tiene una opción más, `acepta(item, destino)`, para no resaltar lo que no es un
    destino de ese elemento: en emparejar, los de su misma columna. La web la necesitará
    igual.
- **Un elemento a la vez**: `maxPointers: 1` cubre el mismo elemento. Para otro, cada
  `Arrastrable` se apaga con `enabled` mientras haya arrastre, y `onPress` lo ignora.
- **Cancelar**: en `onFinalize`, `canceled` significa llamada, segundo plano o diálogo:
  la copia desaparece y nada cambia. Se espera que abrir la confirmación de F03 con el
  botón de atrás llegue también como cancelación.
- **El gesto de atrás**: en principio no hace falta apagarlo. El elemento más cercano
  al borde está a `MARGEN_PANTALLA` (20 px), y el gesto de iOS empieza en el borde. En
  Android el sistema lo descarta si el dedo se queda quieto, que es justo lo que pide
  mantener pulsado.
- **Sin comprobar todavía** (no se pueden leer en el código; los cubren criterios de la
  spec, y cada uno tiene salida):

  | Qué se supone | Si no se cumple |
  |---|---|
  | `absoluteX/Y` y `measureInWindow` usan el mismo origen | Se mide también la capa y se resta |
  | Al activarse el arrastre, `Pressable` se cancela en Android y en iOS. `cancelsJSResponder` viene en `true` en los dos (`GestureHandler.kt`, `RNGestureHandler.mm`): falta verlo en un teléfono | Ya está el filtro de `onPress` |
  | El gesto de atrás no se activa desde un elemento | `gestureEnabled: false` mientras se arrastra en iOS, y en Android ampliar el margen de la actividad |
  | Abrir la confirmación de salida cancela el arrastre | Cancelarlo a mano desde `usePreventRemove` |

  **Resultado de T051** (2026-11-05, con emparejar en un iPhone con Expo Go): los tres
  primeros se cumplen, sin aplicar ninguna salida. El destino resaltado es el que está
  bajo el dedo, soltar no dispara también el pulso y arrastrar hacia el borde no sale de
  la lección. Falta probarlos en Android. El cuarto no se probó: el botón de atrás solo
  existe en Android y no hubo un teléfono con él, así que el criterio de ese caso sigue
  sin validar.
- **Alternativa descartada**: `PanResponder` de React Native. No necesita raíz, pero
  compite mal con el `ScrollView` en Android y no da la activación por tiempo.

## 4. Forma de los datos en el contrato

- **Clasificar**: cada elemento guarda el índice de su categoría, como el prototipo y
  como `correcta` en la opción múltiple. Un índice que no existe se rechaza.
- **Ordenar**: la lista guardada es la respuesta. No hace falta otro campo.
- **Banco de palabras**: `fichas` es la lista de textos, y `espacios` reutiliza
  `EspacioRespuesta`, con `aceptadas` como **textos**, no índices:
  - se parece al prototipo y a completar espacios, y la conversión (punto 11) es directa;
  - dos fichas con el mismo texto son la misma para calificar, que es lo que dice la
    spec, y eso con índices habría que deducirlo;
  - el editor sí usa ids mientras se edita (punto 9), y los convierte en textos al
    guardar.
- **`consigna`**: un campo nuevo y no `pregunta`, porque "Ordena los pasos" no es una
  pregunta. Es opcional salvo en ordenar.
- **Los textos por defecto** van en `CONSIGNA_POR_DEFECTO` del contrato: los usan los
  dos clientes y la ayuda del formulario, y una constante `as const` cabe en la regla de
  que el contrato no lleva lógica.

## 5. Llenar los espacios: emparejamiento, en tres lugares

- **El problema**: "¿se pueden llenar todos los espacios usando cada ficha una vez?" no
  se resuelve mirando espacio por espacio. Con `{a, b}` y `{a}` y las fichas `a`, `b`
  hay solución, pero si el primer espacio toma `a`, el segundo se queda sin nada.
- **Decisión**: emparejamiento por caminos de aumento (algoritmo de Kuhn), unas 15
  líneas. Con 10 espacios y 20 fichas es instantáneo.

  ```text
  asignar(espacio):
    para cada ficha que vale en espacio y no se visitó en esta vuelta:
      marcarla como visitada
      si la ficha está libre, o asignar(espacio que la tiene) encuentra otra:
        dársela a este espacio y devolver sí
    devolver no
  ```

- **Dónde**: `hayFormaDeLlenar` en `src/validacion/actividades.ts` (backend) y en
  `src/utilidades/relacionar.ts` (web, para el formulario). El móvil solo necesita
  `solucionBanco`. Son copias porque el contrato no lleva lógica, igual que
  `normalizarRespuesta`.
- **`solucionBanco`**: dos pasadas, para cumplir "si se puede, deja en su lugar lo que
  el alumno acertó":
  1. Fija las fichas que el alumno acertó y asigna solo los demás espacios.
  2. Si eso no llena todos, empieza con las acertadas como punto de partida y deja que
     el algoritmo las mueva.

  La validación garantiza que siempre hay solución. De aquí salen la ficha esperada de
  cada espacio incorrecto y el texto de "Respuesta correcta:".
- **Alternativa descartada**: mostrar la primera aceptada de cada espacio, como
  completar espacios. Con "rojo" y "azul" en los dos espacios diría "rojo y rojo".

## 6. Mezclar sin dejar resuelto

- **Decisión**: `mezclarSinResolver(total)` repite `mezclar` hasta que el resultado no
  sea el orden original. Con 3 elementos o más y sin repetidos, casi siempre sale a la
  primera, y no se puede atorar. Lo usan emparejar (columna derecha) y ordenar.
  Clasificar y banco usan `mezclar` sin más: que salgan "en orden" no delata nada.
- Como en la opción múltiple, se mezcla una vez, en el `useState` inicial. Cada elemento
  recuerda su índice original.

## 7. La barra inferior con respuestas largas

- **El problema**: el orden completo de 10 elementos puede tener 2000 caracteres, y hoy
  la barra crece sin límite: en el móvil taparía todo, "Continuar" incluido.
- **Decisión**: solo `detalle` se desplaza, con la altura limitada. El título y el botón
  quedan fijos.
  - Web: `max-height: 11rem; overflow-y: auto`. `.contenido` del reproductor pasa de
    `16rem` a `20rem` de margen abajo, para que el final de la actividad no quede debajo
    de la barra en su altura máxima.
  - Móvil: `detalle` dentro de un `ScrollView` con `maxHeight` del 35 % del alto de la
    pantalla. Ahí no tapa nada: `MarcoActividad` ya le deja su lugar a la barra.
- Las líneas de la respuesta van separadas por `\n`, que los dos clientes ya respetan.
- También arregla completar espacios, que tenía el mismo problema con textos largos.

## 8. Componentes nuevos y no `OpcionRespuesta`

- **Decisión**: tres componentes nuevos en los dos clientes: `ElementoRespuesta`,
  `LugarElemento` y `ZonaElementos` (detalle en plan.md, "Interfaz").
- **Por qué no `OpcionRespuesta`**: es un `radio` con `aria-checked` y tecla. Estos son
  botones que se mueven, llevan número y son origen y destino de un arrastre. Comparten
  el aspecto, y por eso reutilizan `EstadoOpcion` y sus colores.
- **Nombres**: "ficha" significa solo una palabra del banco, en la spec y en el código
  (`fichas`, `fichaMax`). Lo que se mueve en cualquier tipo es un "elemento", y de ahí
  `ElementoRespuesta`, `LugarElemento` y `ZonaElementos`.
- **Zona pulsable sin botones anidados**: una categoría tiene que reaccionar al pulsar
  en cualquier parte, incluso encima de un elemento colocado. En la web un `<button>` no
  puede contener otro, así que:
  - el título de la zona es el `<button>` (teclado y lector de pantalla);
  - la zona tiene un `onClick` para el ratón en su parte vacía;
  - el elemento colocado resuelve su propio clic: con selección, coloca; sin ella,
    vuelve.

  En el móvil un `Pressable` sí puede contener a otro: gana el de adentro y aplica la
  misma regla. Pero `Pressable` es accesible por defecto, y una vista accesible agrupa a
  sus hijos: el lector de pantalla leería la categoría como un solo elemento. Por eso el
  de la zona lleva `accessible={false}` y sigue atendiendo los toques, y el título es
  otro `Pressable` con `accessibilityRole="button"`, el que usa el lector de pantalla. Es
  el equivalente del botón en el título de la web.
- **Espacios en línea**: la web pone `LugarElemento` dentro de un texto con `pre-wrap`,
  como `CampoEspacio`. En el móvil no se puede poner una vista dentro de un `Text`, así
  que `partirEnLineas` sale de `CompletarEspacios.tsx` a `utilidades/actividades.ts`,
  junto con un componente `TextoConEspacios` que dibuja las líneas y recibe qué poner en
  cada espacio.

## 9. El editor

- **Fichas que valen**: el borrador guarda ids, no textos:

  ```ts
  type BorradorBancoPalabras = {
    consigna: string;
    texto: string;
    fichas: FilaTexto[];
    grupos: { id: string; idFichas: string[] }[];
  };
  ```

  Es lo que hace que cambiar el texto de una ficha conserve sus marcas, igual que
  `idCorrecta` en la opción múltiple. Las casillas agrupan por texto recortado, y marcar
  una marca todas las fichas con ese texto. `aActividad` recorta y quita repetidos.
  `aBorrador` hace el camino de regreso, buscando las fichas por su texto.
- **Reutilizar lo de completar espacios**:
  - `ajustarGrupos` se vuelve genérica: recibe cómo saber si un grupo está vacío y cómo
    crearlo. `contarEspacios` no cambia.
  - El campo de texto con "Agregar espacio" sale a `CampoConEspacios`, con el texto de
    ayuda y el máximo como props. Los dos formularios lo usan.
- **Selector de categoría**: `CampoSelector` nuevo, con el aspecto de `CampoTexto`. Por
  debajo es un `<select>` nativo: es accesible y no agrega dependencias. El elemento
  guarda `idCategoria`, así que renombrar una categoría no pierde nada y quitarla deja
  `null`.
- **Foco al primer error**: `EditorLeccion` busca `[aria-invalid="true"]`, así que el
  selector y las casillas lo llevan. Un error de las fichas sin campo propio
  (`fichasInsuficientes`) se muestra en un `Aviso`, y el foco va a la primera ficha, con
  `aria-invalid`.
- **Foco al agregar**: `EditorLeccion` busca `input, textarea`. La consigna va primero
  en los cuatro formularios, así que no cambia nada.

## 10. Foco y anuncios

- **Web**: los elementos se mueven de un contenedor a otro, así que React los desmonta y
  el foco se pierde. Cada acción pide a dónde va después, y un efecto lo aplica ya
  pintado, con `querySelector` sobre la raíz de la actividad:
  - colocar: el primer `[data-sin-colocar]`;
  - formar pareja: el primer `[data-sin-pareja="<columna>"]`;
  - devolver: el elemento devuelto, por `data-elemento`;
  - si la respuesta quedó completa: "Comprobar", con la prop nueva `enfocar` de `BarraRespuesta`, que
    pasa el foco al botón cuando ya está habilitado.

  Solo al pulsar: al soltar un arrastre el foco no importa. En la vista previa no
  contradice a F05: solo se mueve si la acción empezó dentro de ella.
- **Anuncios**: un `<p className="oculto" aria-live="polite">` en la web y
  `AccessibilityInfo.announceForAccessibility` en el móvil, con el texto de lo que acaba
  de pasar ("Pareja 2: git push con Sube tus commits…", "if en Palabra clave"). El estado
  va además en el nombre accesible de cada elemento.

## 11. Datos de prueba

- **Decisión**: se regenera `scripts/actividades-prototipo.ts` con un script
  desechable como el de F03 (tarea T012), ahora con nueve tipos. Son 120 actividades (93 + 27).
  Como `bd:sembrar` borra y vuelve a crear los cursos de `@brote.test`, también borra su
  progreso.
- **Correspondencia** (la reutiliza F07):

  | Prototipo | Contrato |
  |---|---|
  | `matching.pairs[].left` / `.right` | `emparejar.parejas[].izquierda` / `.derecha` |
  | `categorize.prompt` | `clasificar.consigna` (si existe) |
  | `categorize.categories` | `clasificar.categorias` |
  | `categorize.items[].text` / `.category` | `clasificar.elementos[].texto` / `.categoria` |
  | `reorder.prompt` / `.items` | `ordenar.consigna` / `.elementos` |
  | `word_bank.text` / `.bank` | `bancoPalabras.texto` / `.fichas` |
  | `word_bank.blanks[].accepted` | `bancoPalabras.espacios[].aceptadas` |

- "Actividades de prueba" gana tres lecciones **al final**, para que las posiciones que
  citan F03 y F05 no cambien.
