# Investigación: F03 Cursar una lección

**Fecha**: 2026-11-02 · **Plan**: [plan.md](./plan.md)

Solo cubre lo nuevo de esta feature. El stack, `pedir()` + hooks, Context +
useReducer y el contrato por copia ya están decididos en `docs/decisiones/`.

Versiones revisadas el 2026-11-02: Prisma 7.10.1, React Router 8.4.0, Expo SDK
58 (expo-router 58.0.26, React Native 0.88, Reanimated 4.7.1).

## 1. Dónde se guardan las actividades

- **Decisión**: una columna `actividades` de tipo JSONB en `leccion`
  (`Json` en Prisma), con la lista de actividades en orden. Por defecto
  `[]`.
- **Por qué**: lo dice `docs/arquitectura.md` ("una columna JSONB con la
  lista de actividades, porque hay muchos tipos con formas distintas"). El
  orden de la lista es el orden de la lección, así que no hace falta una
  columna de posición, y agregar un tipo no cambia la base.
- **Alternativa descartada**: una tabla `actividad` con una columna por campo
  posible o una tabla por tipo. Con 13 tipos, cada uno con campos propios,
  serían decenas de columnas vacías o 13 tablas, y cada tipo nuevo sería una
  migración.
- **Consecuencia**: la base no comprueba la forma de las actividades; la
  comprueba el backend antes de guardarlas (punto 5).

## 2. Quién califica las respuestas

- **Decisión**: el **cliente**. `GET /cursos/:idCurso/lecciones/:idLeccion`
  entrega la lección completa, con las respuestas (`correcta`, `aceptadas`,
  `solucion`), y cada cliente califica sin volver a pedir nada al servidor.
- **Por qué**:
  - La spec pide que perder la conexión a mitad de la lección no la
    interrumpa. Si cada "Comprobar" fuera al servidor, sin conexión no se
    podría seguir.
  - En F03 la calificación no se guarda ni tiene efecto: no hay progreso
    (F04), ni puntos (F08). El principio III pide que el backend valide lo
    que **recibe** y decida quién puede hacer qué; en esta feature el backend
    no recibe respuestas, y sigue decidiendo quién puede abrir cada lección.
  - La pregunta abierta se autoevalúa: el servidor no podría calificarla de
    todos modos.
  - Es lo que hacía el prototipo, y lo que necesita F10 (cursar sin
    conexión).
- **Lo que se acepta**: quien abra las herramientas del navegador puede ver
  las respuestas. En una plataforma para estudiar por cuenta propia, sin
  calificaciones que valgan algo, solo se engaña a sí mismo.
- **Alternativa descartada**: un `POST .../comprobar` por pregunta. Rompe el
  caso de error de la spec y agrega latencia a cada pregunta.
- **Pendiente para F04 y F08**: cuando completar una lección dé progreso o
  puntos, el servidor no puede confiar en los aciertos que mande el cliente.
  Esas features deciden cómo se registra (p. ej., que el cliente mande las
  respuestas y el servidor las vuelva a calificar con estas mismas reglas).

## 3. Mezclar las opciones

- **Decisión**: cada cliente mezcla las opciones con Fisher-Yates
  (`Math.random`) **al montar** la actividad, y guarda la permutación en el
  estado del componente (`useState` con inicializador), para que no cambie
  en cada render. Cada opción mezclada conserva su índice original, que es
  el que se compara con `correcta`.
- **Por qué**: la spec pide un orden al azar cada vez que aparece la
  pregunta. En el prototipo la correcta siempre es la primera.
- **Consecuencia**: con 3 opciones, la correcta queda arriba 1 de cada 3
  veces. El criterio de la spec ("no salen siempre en el mismo orden") se
  valida abriendo la lección varias veces.
- **Alternativa descartada**: mezclarlas en el servidor. El orden cambiaría
  solo al recargar, y el backend tendría que traducir `correcta`.

## 4. Comparar lo escrito en un espacio

- **Decisión**: los dos clientes usan la misma función,
  `normalizarRespuesta(texto)`:

  ```ts
  texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // quita acentos y diéresis; la ñ queda como n
    .toLocaleLowerCase("es")
    .trim()
    .replace(/\s+/g, " ");
  ```

  Un espacio es correcto si `normalizarRespuesta(escrito)` es igual a
  `normalizarRespuesta(aceptada)` para alguna de sus aceptadas. Se compara la
  cadena completa: "canciones" no es "canción".
- **Por qué**: la spec pide no distinguir mayúsculas, acentos ni espacios al
  inicio o al final, contar varios espacios seguidos como uno y tratar la ñ
  como n, igual que la búsqueda de F02 (`unaccent`). Separar en NFD y quitar
  las marcas combinantes (`\p{M}`) hace las dos cosas a la vez. Los signos no
  se tocan: `>` y `<` siguen siendo distintos.
- **Dónde vive**: en `src/utilidades/actividades.ts` de cada cliente, como la
  portada de F02. El contrato no lleva lógica (`contrato/README.md`).
- **A verificar al implementar**: que Hermes (SDK 58) tenga
  `String.prototype.normalize("NFD")`. Si no, la alternativa es una tabla de
  las vocales acentuadas, la ü y la ñ (`á→a`, ..., `ñ→n`), con la que dan el
  mismo resultado todos los textos de los criterios.

## 5. Validar las actividades en el backend

- **Decisión**: `src/validacion/actividades.ts` con `validarActividades(valor:
  unknown): Actividad[]`, escrita a mano con las constantes del contrato,
  como la validación de cuentas de F01. Si algo no cumple, lanza un error que
  dice qué actividad y qué campo (`"actividad 3 (opcionMultiple): correcta
  fuera de rango"`).
- **Reglas**:
  - Es una lista; cada elemento es un objeto con un `tipo` conocido.
  - Textos obligatorios: texto no vacío después de recortar. Opcionales:
    ausentes o texto no vacío. `puntosClave`: lista no vacía de textos no
    vacíos.
  - `opciones`: entre 2 y 9, cada una `{ texto }` o `{ simbolo }` no vacío,
    sin otros campos. `correcta`: entero entre 0 y `opciones.length - 1`.
  - `completarEspacios`: el texto tiene al menos una `MARCA_ESPACIO`, y hay
    tantos `espacios` como marcas. Cada espacio tiene al menos una aceptada;
    cada aceptada es un texto no vacío de hasta 100 caracteres (si no, nadie
    podría escribirla en el campo).
  - Un campo que el tipo no conoce se rechaza, para que un error de dedo
    (`"puntoClave"`) no se pierda en silencio.
- **Quién la usa en F03**: solo el script de datos de prueba, antes de
  guardar. Si una actividad no pasa, el script falla sin cambiar la base.
  F05 (editor) y F07 (importar) la usarán al recibir lecciones, con
  `ErrorApi(400, ...)`.
- **Al leer**: el servicio no vuelve a validar lo que sale de la base; la
  columna solo se escribe a través de esta validación.
- **Alternativa descartada**: una librería de esquemas (zod, valibot). F01 ya
  valida a mano; cinco tipos no justifican una dependencia (principio VI). Si
  con F05 la validación crece mucho, se puede proponer en una decisión.

## 6. Datos de prueba: las actividades del prototipo

- **Decisión**: las actividades de los cuatro cursos se convierten **una vez**
  al formato del contrato y se guardan en el backend, en
  `scripts/actividades-prototipo.ts`, tipadas con `Actividad[]`. El backend
  sigue sin leer `brote_specs`, como en F02.
  - La conversión la hace una tarea con un script desechable (en la carpeta
    temporal, no se versiona). Lee `referencia/cursos-prototipo/`, se queda
    con las actividades de los cinco tipos en su orden, quita `glossary` y
    escribe el archivo, que luego se formatea con Prettier.
  - `npm run bd:sembrar` toma esas actividades para cada lección del
    prototipo y las pasa por `validarActividades` (punto 5) antes de
    guardarlas.
- **Correspondencia** (la puede reusar F07, que define la importación oficial):

  | Prototipo | Contrato |
  |---|---|
  | `content`: `title`, `body`, `code`, `bullets` | `teoria`: `titulo`, `texto`, `codigo`, `puntosClave` |
  | `flashcard`: `front`, `back` | `tarjeta`: `frente`, `reverso` |
  | `multiple_choice`: `prompt`, `code`, `options`, `answer` | `opcionMultiple`: `pregunta`, `codigo`, `opciones`, `correcta` |
  | opción `"texto"` / `{ icon }` | `{ texto }` / `{ simbolo }` |
  | `fill_blank`: `text`, `blanks[].accepted` | `completarEspacios`: `texto`, `espacios[].aceptadas` |
  | `open_question`: `prompt`, `solution` | `preguntaAbierta`: `pregunta`, `solucion` |
  | `glossary` | no se carga (F09) |
  | los otros 8 tipos | no se cargan (spec, "Aclaraciones") |

- **Resultado**: 93 actividades (26 de teoría, 9 tarjetas, 28 de opción
  múltiple, 13 de completar espacios y 17 preguntas abiertas). Todas las
  lecciones quedan con al menos una; "Tu primer commit" y "Ramas: trabajar
  en paralelo" quedan solo con teoría. Ninguna opción del prototipo usa
  `image` ni `label`.
- **Curso "Actividades de prueba"** (de `autor@brote.test`, sin publicar en
  el estado inicial, como los extra de F02). Su nombre no empieza con
  "Curso de prueba", porque la consulta C2 de F02 publica los cursos con ese
  nombre. Lecciones:
  1. **Respuestas con acentos**: un `completarEspacios` "Sinónimo de pieza
     musical: ___" que acepta `["canción", "tema"]`.
  2. **Textos con etiquetas**: una actividad de cada tipo con `<b>hola</b>` y
     `<script>alert(1)</script>` en todos sus textos (título, texto, código,
     puntos clave, frente, reverso, pregunta, opciones, texto con espacios y
     solución).
  3. **Lección sin actividades**: `[]`.
- **Alternativa descartada**: que el script lea los JSON del prototipo al
  sembrar. Ataría el backend a `brote_specs` y adelantaría la importación
  (F07).

## 7. Registro tipo → componente

- **Decisión**: en cada cliente, una carpeta `src/actividades/` con un
  componente por tipo y un `registro.ts`:

  ```ts
  type ResultadoActividad = "acierto" | "fallo" | "sinCalificar";

  type PropsActividad<T extends TipoActividad> = {
    actividad: Extract<Actividad, { tipo: T }>;
    alInteractuar: () => void; // la primera vez que elige, escribe o voltea algo
    alTerminar: (resultado: ResultadoActividad) => void; // al pulsar "Continuar"
  };

  export const registroActividades: {
    [T in TipoActividad]: ComponentType<PropsActividad<T>>;
  } = { teoria: Teoria, tarjeta: TarjetaMemoria, opcionMultiple: OpcionMultiple, ... };
  ```

  - El tipo del registro obliga a tener un componente por cada `tipo` del
    contrato: si el contrato agrega uno y el cliente no, `npm run tipos`
    falla.
  - Cada actividad dibuja su contenido **y** su `BarraRespuesta` (la barra
    inferior con "Comprobar"/"Continuar"), y le avisa al reproductor con
    `alTerminar`. El reproductor no sabe nada de ningún tipo: muestra la X,
    la barra de progreso y la actividad actual (con `key` = índice, para que
    cada una empiece sin estado), y cuenta los resultados.
  - Preguntas = resultados distintos de `"sinCalificar"`; aciertos =
    `"acierto"`. Así la pantalla final no necesita saber qué tipos son
    preguntas.
- **Por qué**: es el principio IV y lo que mejor funcionó en el prototipo
  (`render(contenedor, actividad, alTerminar)`). Con esta forma, F05 puede
  usar el mismo componente en la vista previa del editor.
- **Tipos desconocidos**: si una versión vieja de la app recibe una
  actividad de un tipo que todavía no conoce (cuando el contrato crezca), el
  reproductor la **salta** (filtra las actividades sin componente antes de
  empezar), en vez de romperse. En F03 no puede pasar, porque el backend solo
  guarda los cinco tipos. La feature que agregue el sexto tipo revisa si
  basta con esto.

## 8. Web: el reproductor, fuera del marco común

- **Ruta**: `/cursos/:idCurso/lecciones/:idLeccion`, dentro de
  `RutaProtegida` pero **fuera del `Layout`**: la lección va a pantalla
  completa, sin el encabezado de la marca, como pide `docs/diseno.md`
  (sección 6: "barra superior con botón de cerrar y barra de progreso").
- **El catálogo sobrevive a la lección**: hoy el `CatalogoProvider` y el
  `<ScrollRestoration />` están dentro del `Layout`. Si la lección queda fuera
  del `Layout`, al abrirla se desmontaría el catálogo. Se mueven a un
  componente de ruta nuevo, `ZonaConSesion` (`<CatalogoProvider><Outlet
  /></CatalogoProvider>` y `<ScrollRestoration />`), entre `RutaProtegida` y
  el `Layout`, del que cuelgan el `Layout` y la lección. Así siguen montados
  al pasar del catálogo al detalle y a la lección, y de regreso.
- **Salir**:
  - La X y "Volver al curso" hacen lo mismo que el "Volver" del detalle de
    F02: `navegar(-1)` si se llegó desde otra pantalla de Brote
    (`ubicacion.key !== "default"`) o, si se abrió la dirección directo,
    `navegar("/cursos/:idCurso", { replace: true })`. Así, después de salir,
    "atrás" no regresa a la lección.
  - La confirmación usa **`useBlocker`** de React Router, con la condición
    "hizo algo y no ha terminado" y solo si cambia la ruta. Bloquea por igual
    la X, el botón de volver del navegador y cualquier enlace. Mientras
    `blocker.state === "blocked"`, se muestra el `Dialogo` ("Salir" →
    `blocker.proceed()`, "Seguir aquí" → `blocker.reset()`).
  - Recargar o cerrar la pestaña no se bloquea (sin `beforeunload`), como
    dice la spec.
- **`Dialogo`**: componente nuevo sobre el elemento nativo `<dialog>` con
  `showModal()`. Encierra el foco, cierra con Esc (que cuenta como "Seguir
  aquí") y lo anuncian los lectores de pantalla, sin librería.
- **Alternativas descartadas**: el reproductor dentro del `Layout` (el
  encabezado distrae y quita alto en pantallas chicas); `window.confirm`
  (no sigue el sistema de diseño y no deja nombrar los botones); un
  `beforeunload` (la spec no lo pide y el navegador muestra su propio texto).

Fuente: <https://reactrouter.com/api/hooks/useBlocker>.

## 9. Móvil: pantalla encima del detalle y "atrás"

- **Ruta**: `src/app/leccion/[idCurso]/[idLeccion].tsx`, declarada en el
  `Stack` raíz dentro del `Stack.Protected` con sesión, como
  `curso/[idCurso]`. Se abre con `router.push` desde el detalle, encima de
  todo y sin la barra de pestañas.
- **Salir**: la X y "Volver al curso" llaman a `router.back()`.
  `usePreventRemove(hizoAlgo && !terminada, ...)`, que expo-router 58
  exporta (`import { usePreventRemove } from "expo-router"`), intercepta la
  X, el botón atrás de Android y el gesto de deslizar de iOS. En su callback
  se muestra la confirmación y, si elige "Salir", se ejecuta la acción
  detenida (`navigation.dispatch(data.action)`).
- **Confirmación**: `Alert.alert("¿Salir de la lección?", "Perderás tu avance
  en esta lección.", [{ text: "Seguir aquí", style: "cancel" }, { text:
  "Salir", style: "destructive", onPress }])`. Es el diálogo nativo de cada
  plataforma: accesible, con los botones donde los espera la persona y sin
  un componente nuevo. `docs/diseno.md` lo registra como la versión móvil
  del `Dialogo`.
- **A verificar al implementar**: que en iOS el gesto de deslizar quede
  detenido mientras `usePreventRemove` está activo en el `Stack` nativo. Si
  no, se agrega `gestureEnabled: false` a la pantalla mientras el alumno
  haya hecho algo. En Android, `app.json` ya tiene
  `predictiveBackGestureEnabled: false`.
- **Sesión expirada y "sin conexión"**: no hace falta nada nuevo. `pedir()`
  ya avisa el 401, espera 15 segundos y distingue "sin conexión" (F01).

Fuente: <https://reactnavigation.org/docs/preventing-going-back/>.

## 10. Teclado en la web

- **Opción múltiple**: mientras la pregunta está sin comprobar, un
  `keydown` en `document` elige con las teclas 1 a 9 la opción que está en
  ese lugar en pantalla. Se ignora si el foco está en un campo de texto. Las
  opciones son un grupo de radios (`role="radiogroup"` y `role="radio"`),
  así que también se recorren con las flechas.
- **Enter**: `BarraRespuesta` escucha Enter en `document` y pulsa su botón
  (si está habilitado), salvo cuando el foco está en un `<textarea>` (Enter
  hace un salto de línea en la pregunta abierta) o en otro botón o enlace
  (que ya se activa solo con Enter).
- **Completar espacios**: los campos están en un `<form>`; Enter en
  cualquiera envía el formulario, que comprueba. Tab pasa al siguiente campo
  sin código extra.
- **Foco**: al comprobar, el foco pasa al botón "Continuar", así un lector de
  pantalla lee la retroalimentación y Enter continúa. Al pasar a la
  siguiente actividad, el foco va a su título (`tabIndex={-1}`).

## 11. Animaciones y "reducir movimiento"

- **Web**: transiciones y `@keyframes` en CSS Modules con los tokens de
  movimiento: la barra de progreso (`medio`), el giro de la tarjeta
  (`transform: rotateY` con `backface-visibility: hidden`), la sacudida de la
  opción incorrecta (6 px) y la celebración (`lento`). Con
  `@media (prefers-reduced-motion: reduce)` se quitan los movimientos y queda
  solo el cambio de color, como en el resto de los componentes.
- **Móvil**: Reanimated, que ya está instalado (lo pide Expo Router):
  `withTiming` para la barra y el giro, `withSequence` para la sacudida y
  `useReducedMotion()` para quitarlas. La tarjeta gira con `rotateY` y
  `backfaceVisibility: "hidden"` en las dos caras.
- **Celebración**: el icono de la pantalla final (`PartyPopper` de Lucide)
  aparece creciendo con un rebote breve, y la insignia de aciertos aparece
  después. No hay sonido.

## 12. Completar espacios: los campos dentro del texto

- **Web**: el texto va en un elemento con `white-space: pre-wrap` (respeta
  saltos de línea y sangría) y cada `___` se reemplaza por un `<input>` en
  línea, con `maxLength={100}`, `autoComplete="off"`, `spellCheck={false}` y
  `aria-label="Espacio {n} de {total}"`. El ancho crece con lo escrito
  (`size` = largo del texto, mínimo 4).
- **Móvil**: React Native no puede poner un `TextInput` dentro de un
  `Text`. El texto se parte en líneas (por `\n`). Cada línea es una fila con
  `flexWrap: "wrap"`, hecha de palabras (`Texto`) y campos (`TextInput`).
  Los espacios al inicio de una línea se conservan como sangría. El teclado
  "siguiente" pasa al próximo espacio, y en el último, "listo" cierra el
  teclado.
- **Respuesta correcta**: después de comprobar, cada espacio incorrecto
  muestra la respuesta esperada a su lado, y la barra inferior dice
  "Respuesta correcta:" con el texto completo y los espacios llenos con la
  primera aceptada.

## 13. Bloque de código y diff

- **Decisión**: `BloqueCodigo` dibuja cada línea por separado, en un panel
  oscuro (`codigoFondo` `#16142E`, también en modo claro, como pide
  `docs/diseno.md` para la terminal y el código) con la fuente monoespaciada
  14/22. Desplaza hacia los lados en vez de cortar líneas (`overflow-x:
  auto` en la web; `ScrollView horizontal` en el móvil).
- **Diff**: las mismas reglas que el prototipo. Una línea que empieza con
  `+` (pero no `+++`) es agregada; con `-` (pero no `---`), eliminada; con
  `@@`, encabezado. Se aplican siempre: en el código de los cursos del
  prototipo ninguna otra línea empieza así.
- **Seguridad**: cada línea es texto (`{linea}` en React), nunca HTML; no hay
  resaltado de sintaxis que inserte marcas.
