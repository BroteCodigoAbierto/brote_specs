# Plan técnico: F11 Actividades de relacionar

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-11-04 | **Rama**: `feature/F11-actividades-relacionar`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

La unión `Actividad` gana cuatro tipos. No hay rutas, tablas ni migraciones: las
actividades ya viajan en `leccion.actividades`, y el backend solo gana cuatro
validadores. Cada cliente agrega sus cuatro componentes al registro, y la web sus cuatro
editores, que activan solos su entrada de la paleta (research de F05, punto 10). Las
reglas de pulsar, soltar, mezclar y calcular la solución son funciones puras iguales en
los dos clientes, así que los dos gestos pasan por el mismo camino (research.md, punto
1). Arrastrar usa la API del navegador en la web (punto 2), y en el móvil, gesture handler
y reanimated, que ya están instalados (punto 3). No hay paquetes nuevos.

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | El plan sigue la spec y sus tres aclaraciones. Al planear se le agregó una regla: a dónde va el foco al devolver un elemento |
| II. Un producto, cuatro repos | sí | Tipos y constantes nuevos en `contrato/` 0.8.0, copiados a los tres repos |
| III. El backend es la autoridad | sí | `validarActividades` comprueba cada regla, también que el banco se pueda llenar, aunque el cliente lo haya dejado pasar. Los textos solo se muestran como texto. Las respuestas ya viajaban al cliente desde F03: F04 sigue sin confiar en los aciertos |
| IV. Actividades extensibles | con excepciones (ver "Excepciones a la constitución") | Cada tipo es lo que pide el principio: su variante, su validador, su componente en la web con su formulario y su componente en el móvil. El reproductor, la paleta, la secuencia y la vista previa no cambian. Sí se tocan piezas que no dependen del tipo: `BarraRespuesta` (punto 7), `MarcoActividad` y la raíz de la app (punto 3), y se generalizan dos piezas de completar espacios para no copiarlas (punto 9). La vista previa usa el componente del alumno |
| V. Estados explícitos | sí | Abrir y guardar no cambian (F03, F05). Cada actividad tiene sus estados en la spec: sin responder, seleccionado, arrastrando, completa y respondida |
| VI. Dependencias justificadas | sí | Ningún paquete nuevo. `react-native-gesture-handler` ya estaba en `package.json`, y lo que se agrega es usarlo (research.md, punto 3) |
| VII. Estilo propio | sí | Identificadores en español sin acentos (`useArrastrarElemento`, `solucionBanco`) |
| VIII. Terminado = validado | sí | Cada uno de los 108 criterios tiene pasos en `quickstart.md`. Las funciones de `relacionar.ts` no llevan pruebas automáticas (decisión 0012) |

Revisión después del diseño: sin cambios; las excepciones están abajo.

## Cambios al contrato

`contrato/VERSION` 0.7.0 → **0.8.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- Nuevos: `ParejaEmparejar`, `ActividadEmparejar`, `ElementoClasificar`,
  `ActividadClasificar`, `ActividadOrdenar`, `ActividadBancoPalabras` y
  `CONSIGNA_POR_DEFECTO`.
- Cambian: `Actividad`, `LIMITES_ACTIVIDADES`, `CALIFICA_ACTIVIDAD` y `MENSAJES_EDITOR`.

## Cambios al modelo de datos

- Sin tablas, columnas ni migraciones. Detalle en [data-model.md](./data-model.md).
- Al cerrar, `specs/02-modelo-datos.md` recibe los cuatro tipos y sus reglas.

## API

Sin rutas nuevas. Lo que cambia en las existentes está en
[contracts/api.md](./contracts/api.md): `PUT /editor/cursos/:idCurso/lecciones/:idLeccion`
acepta y valida los cuatro tipos, y los `GET` de lección pueden traerlos.

## Interfaz

Según `docs/diseno.md`. Lo nuevo se agrega **primero** ahí (es una tarea), y después a
los dos clientes con el mismo nombre.

### Lo que se agrega a `docs/diseno.md`

- **Componentes** (sección 4):

  | Componente | Props clave | Notas |
  |---|---|---|
  | `ElementoRespuesta` | `texto`, `estado` (como `OpcionRespuesta`), `forma` (`tarjeta`, `compacta`), `marca`, `atenuada`, `resaltada`, `deshabilitada`, `etiqueta`, `alPulsar` | Elemento que se mueve o se une. Los colores de `OpcionRespuesta`, con icono al comprobar. `tarjeta`: 56 px de alto, radio `medio`. `compacta`: 44 px, radio `medio` y no `pildora`, porque el texto puede ocupar varias líneas. `marca`: número en un círculo `primarioSuave`. `atenuada`: opacidad 0.4. `resaltada`: borde `primario` y fondo `primarioSuave`, sin sombra. Respeta la sangría. En la web acepta `propsOrigen` y `propsDestino`; en el móvil se envuelve en `Arrastrable` y `DestinoArrastre` |
  | `LugarElemento` | `numero`, `enLinea`, `estado` (`normal`, `correcto`, `incorrecto`), `esperada`, `resaltado`, `etiqueta`, `children` | Donde se coloca una `ElementoRespuesta`. Vacío: borde punteado de 2 px en `bordeFuerte`. `numero`: lugar de ordenar, a la izquierda. `enLinea`: espacio del banco, dentro del texto. `esperada` va al lado en `nota` `broteFuerte`, como en `CampoEspacio`. En la web acepta `propsDestino`; en el móvil se envuelve en `DestinoArrastre` |
  | `ZonaElementos` | `titulo`, `resaltada`, `etiqueta`, `alPulsar`, `children` | `Superficie` `suave` que agrupa elementos: los sin colocar, el banco o una categoría. Sigue visible aunque esté vacía. Con `titulo`, es una categoría: el título es el botón y toda la zona se puede pulsar (research.md, punto 8). En la web acepta `propsDestino`; en el móvil se envuelve en `DestinoArrastre` |
  | `BarraRespuesta` (cambia) | `enfocar` | Con `enfocar` en `true`, pasa el foco al botón (solo en la web: en el móvil no hay teclado). El detalle se desplaza a partir de cierta altura: 11rem en la web y 35 % del alto de la pantalla en el móvil (research.md, punto 7) |
  | `TextoConEspacios` (solo móvil) | `texto`, `dibujarEspacio` | Dibuja las líneas de un texto con espacios, porque en el móvil no se puede poner una vista dentro de un `Text`. Lo usan completar espacios y banco de palabras |
  | `CapaArrastre` (solo móvil) | `arrastre` | La copia flotante que sigue al dedo, con `pointerEvents="none"` y `sombraElevada`. La dibuja `MarcoActividad` fuera de su `ScrollView` |

- **Editor (solo web)** (sección 4):

  | Componente | Props clave | Notas |
  |---|---|---|
  | `CampoSelector` | `id`, `etiqueta`, `valor`, `opciones`, `textoVacio`, `alCambiar`, `error`, `deshabilitado` | `<select>` nativo con el aspecto de `CampoTexto` |
  | `CampoConEspacios` | `id`, `valor`, `alCambiar`, `ayuda`, `error`, `maxLongitud`, `deshabilitado` | El campo de texto en letra de código con "Agregar espacio". Lo usan completar espacios y banco de palabras |

- **Actividades** (sección 6):
  - **Emparejar**: dos columnas iguales de `ElementoRespuesta` `tarjeta`, lado a lado también
    en el móvil. La pareja se ve por su `marca`.
  - **Clasificar**: `ZonaElementos` con los elementos sin colocar y, debajo, una por
    categoría. Las categorías se acomodan solas: lado a lado si caben al menos 14rem,
    una debajo de otra si no.
  - **Ordenar**: los `LugarElemento` numerados en columna y, debajo, una `ZonaElementos` con las
    `ElementoRespuesta` `tarjeta`.
  - **Banco de palabras**: el texto en una `Superficie`, con un `LugarElemento` `enLinea` en
    cada espacio y, debajo, una `ZonaElementos` con las fichas.
  - **Arrastrar**: la copia que sigue al dedo lleva `sombraElevada`. El origen va
    `atenuada` y el destino, `resaltada`. Al soltar fuera no hay animación de regreso, con o
    sin "reducir movimiento": la copia desaparece y el elemento ya está en su lugar.
  - **Teclado**: se agrega a dónde va el foco al colocar, emparejar y devolver.
  - La primera regla de "Opciones" pasa a decir que estos tipos usan `ElementoRespuesta`.

### Por pantalla

| Pantalla | Usa | Nuevo |
|---|---|---|
| Reproductor de la lección (web y móvil) | `BarraRespuesta`, `Superficie` | Los cuatro componentes de actividad, con `ElementoRespuesta`, `LugarElemento` y `ZonaElementos` |
| Lienzo, inspector (web) | `CampoArea`, `CampoTexto`, `ListaEditable`, `BotonesOrden`, `Aviso`, `Boton` | Los cuatro formularios, `CampoSelector` y `CampoConEspacios` |
| Lienzo, vista previa (web) | `VistaPrevia`, sin cambios | Nada: monta la actividad real |
| Lienzo, paleta y secuencia (web) | `PaletaActividades`, `BloqueActividad`, sin cambios | Nada: se activan con `registroEditor` |

## Por repo

### brote_backend_express

- **Archivos**:
  - `src/validacion/actividades.ts`: `validarEmparejar`, `validarClasificar`,
    `validarOrdenar` y `validarBancoPalabras`, cada uno en `validadores`. Nuevas internas:
    `textosSinRepetir(textos, campo)` y `hayFormaDeLlenar(espacios, fichas)` (research.md,
    punto 5). `consigna` usa `textoOpcional` y `textoObligatorio`.
  - `src/validacion/editor.ts`: `recortarTitulos` pasa a `recortarTextos` y recorta también
    `fichas` y `aceptadas` del banco.
  - `scripts/actividades-prototipo.ts`: se regenera con los nueve tipos (research.md, punto
    11). Comprobar el total: 120 actividades.
  - `scripts/datos-prueba.ts`: tres lecciones más al final de "Actividades de prueba"
    (quickstart.md, sección 1.1). La descripción deja de decir "los cinco tipos".
- **Validación de entrada**: la de F05. `validarActividades` lanza `ErrorActividades` con el
  índice, y la ruta responde 400 sin guardar nada (contracts/api.md).
- **Notas**:
  - `servicios/`, `rutas/` y `prisma/` no cambian. `contarPreguntas` usa
    `CALIFICA_ACTIVIDAD`.
  - `bd:sembrar` pasa todo por `validarActividades` antes de tocar la base: correrlo temprano
    comprueba que las 27 actividades cumplen las reglas.
  - Comprobar con `npm run tipos` y `npm run lint`.

### brote_web_react

- **Páginas y rutas**: sin cambios.
- **Actividades** (`src/actividades/`), cuatro carpetas nuevas con los mismos cuatro archivos
  que `OpcionMultiple/`:
  - `Emparejar/`: `Emparejar.tsx`, `Emparejar.module.css`, `FormularioEmparejar.tsx` y
    `editorEmparejar.ts`.
  - `Clasificar/`, `Ordenar/` y `BancoPalabras/`, igual.
  - `registro.ts` y `registroEditor.ts`: una línea por tipo.
  - `CompletarEspacios/grupos.ts`: `ajustarGrupos` se vuelve genérica (research.md, punto 9).
  - `CompletarEspacios/FormularioCompletarEspacios.tsx`: usa `CampoConEspacios`.
- **Componentes** (`src/componentes/`): `ElementoRespuesta/`, `LugarElemento/`, `ZonaElementos/`,
  `CampoSelector/` y `CampoConEspacios/`, nuevos. `BarraRespuesta/` cambia.
- **Hooks**: `src/hooks/useArrastrarElemento.ts`, nuevo (research.md, punto 2).
  `src/hooks/useFocoElementos.ts`, nuevo: el efecto del foco (research.md, punto 10).
- **Utilidades**: `src/utilidades/relacionar.ts`, nuevo (research.md, puntos 1, 5 y 6), con
  `hayFormaDeLlenar` además de lo que comparte con el móvil.
- **Reproductor**: `ReproductorLeccion.module.css`, `.contenido` pasa a `20rem` de margen abajo
  (research.md, punto 7).
- **Estado**: local en cada actividad, con `useState`. El borrador de cada tipo vive en
  `useEditorLeccion`, sin cambios.
- **Notas**:
  - `paleta.ts`, `Inspector`, `VistaPrevia`, `Secuencia` y `ProbarLeccion` no se tocan.
  - `useEnfocarAlMontar` en la consigna (`h2` con `tabIndex={-1}`), como la opción múltiple.
  - Comprobar con `npm run tipos`, `npm run lint` y en Chrome.

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**: sin cambios. `src/app/_layout.tsx` envuelve todo en
  `GestureHandlerRootView` (research.md, punto 3).
- **Actividades** (`src/actividades/`):
  - `Emparejar.tsx`, `Clasificar.tsx`, `Ordenar.tsx` y `BancoPalabras.tsx`, nuevos.
  - `registro.ts`: una línea por tipo.
  - `MarcoActividad.tsx`: prop opcional `arrastre`, con la que da su `ScrollView`, apaga
    `scrollEnabled`, informa del desplazamiento y dibuja `CapaArrastre`.
  - `CompletarEspacios.tsx`: usa `TextoConEspacios`.
  - `arrastre/`, nueva: `useArrastrarElemento.ts`, `Arrastrable.tsx`, `DestinoArrastre.tsx` y
    `CapaArrastre.tsx`.
- **Componentes** (`src/componentes/`): `ElementoRespuesta.tsx`, `LugarElemento.tsx`, `ZonaElementos.tsx`
  y `TextoConEspacios.tsx`, nuevos. `BarraRespuesta.tsx` cambia.
- **Utilidades**: `src/utilidades/relacionar.ts`, nuevo, igual que el de la web pero sin
  `hayFormaDeLlenar`. `partirEnLineas` pasa a `utilidades/actividades.ts`.
- **Almacenamiento local**: no aplica.
- **Notas**:
  - `useReproductor` solo cambia en un comentario, porque `alInteractuar` ya lo cubre.
  - `activateAfterLongPress` usa una constante `ESPERA_ARRASTRE_MS = 250`.
  - Comprobar con `npm run tipos`, `npm run lint` y en un teléfono. Hay cuatro supuestos del
    arrastre que solo se confirman ahí (research.md, punto 3): conviene probarlos con el
    primer tipo, antes de hacer los otros tres.

### brote_specs

- `contrato/contrato.ts` y `contrato/VERSION`.
- `docs/diseno.md`: lo de "Interfaz", antes que el código.
- Al cerrar: `specs/02-modelo-datos.md`, `specs/01-navegacion.md` y una nota en
  `specs/features/F05-crear-editar-curso/research.md`, punto 13: arrastrar con el dedo sí se
  justificó, en el móvil.

## Cambios a la navegación

- Sin pantallas nuevas.
- `specs/01-navegacion.md`, "Salir de una lección": salir también pide confirmación si el
  alumno colocó o unió algo.

## Dependencias nuevas

Ninguna.

`react-native-gesture-handler` (~3.3.0) ya está en `package.json`, en la versión que trae el SDK
58. La web usa la API del navegador. Se descartó `@dnd-kit` en la web y `PanResponder` en el
móvil (research.md, puntos 2 y 3).

## Excepciones a la constitución

| Qué | Por qué hace falta | Por qué no sirve la opción simple |
|---|---|---|
| `BarraRespuesta` en los dos clientes y `ReproductorLeccion.module.css` | Una respuesta de ordenar o banco puede tener 2000 caracteres y taparía "Continuar". La web también necesita pasarle el foco a "Comprobar" | Recortar el detalle en cada actividad escondería parte de la respuesta |
| `MarcoActividad.tsx` y `src/app/_layout.tsx` (móvil) | Arrastrar necesita el `ScrollView` de la actividad y `GestureHandlerRootView` en la raíz | Un `ScrollView` propio por actividad repetiría lo mismo cuatro veces, y sin la raíz `GestureDetector` lanza un error |
| `CompletarEspacios/grupos.ts`, `FormularioCompletarEspacios.tsx` (web) y `CompletarEspacios.tsx` (móvil) | El banco de palabras reutiliza sus grupos, su campo de texto y su dibujo de líneas | Copiarlos dejaría dos versiones de la misma regla |
| `recortarTitulos` en `src/validacion/editor.ts` (backend) | Recorta las fichas, que se comparan por su texto exacto. Es un caso por tipo fuera del validador, como el que ya existe para la teoría | Rechazar fichas con espacios le pasaría al cliente una regla que hoy resuelve el servidor |
