# Plan técnico: F12 Actividades de código y terminal

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-11-05 | **Rama**: `feature/F12-actividades-codigo-terminal`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

La unión `Actividad` gana tres tipos. No hay rutas, tablas ni migraciones: el backend gana
tres validadores, y cada cliente, sus tres componentes en el registro; la web, además, sus
tres editores, que activan solos su entrada de la paleta. Lo que se comparte entre tipos o
clientes va en funciones puras iguales en los dos clientes: `acomodarGrafo` (columnas por
generaciones y una fila por rama, research.md, punto 2), `normalizarComando` y
`textoTecleado`, que deshace lo que el teclado del teléfono cambia (punto 5). El grafo se
dibuja con SVG y botones encima (punto 3), con `react-native-svg` en el móvil, que ya está
instalado. No hay paquetes nuevos.

El plan usa el código de F11 (contrato 0.8.0, `CampoSelector`, `BarraRespuesta` con detalle
desplazable y la lección de prueba de F11). Como F11 todavía no está en `dev` (le faltan 7
criterios que piden el teléfono en la mano), **las ramas de F12 salen de
`feature/F11-actividades-relacionar`** en los tres repos de código, por decisión del usuario
(2026-11-06). Es una excepción, solo para F12, a la decisión 0013 (ramas desde `dev`): en
cuanto F11 se fusione, cada rama de F12 hace `git merge origin/dev`, y su PR va a `dev`
después del de F11.

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | El plan sigue la spec y sus aclaraciones. Al planear se le agregaron tres reglas: el teclado tampoco cambia `--` ni `...`, el campo de código del móvil crece hasta 12 líneas, y los saltos de línea pegados en la terminal pasan a espacios |
| II. Un producto, cuatro repos | sí | Tipos y constantes nuevos en `contrato/` 0.9.0, copiados a los tres repos |
| III. El backend es la autoridad | sí | `validarActividades` comprueba cada regla del grafo (padres anteriores, columnas, índices), los comandos repetidos y los lenguajes, aunque el cliente lo haya dejado pasar. Todos los textos se muestran como texto, también en el SVG. Las respuestas ya viajaban al cliente desde F03 |
| IV. Actividades extensibles | con excepciones (ver "Excepciones a la constitución") | Cada tipo es su variante, su validador, su componente en la web con su formulario y su componente en el móvil. El reproductor, la paleta, la secuencia y la vista previa no cambian. Sí se tocan piezas que no dependen del tipo: `BarraRespuesta` (research.md, punto 8), `BloqueCodigo` y `CampoTexto` |
| V. Estados explícitos | sí | Abrir y guardar no cambian (F03, F05). Cada actividad tiene sus estados en la spec: sin responder, con respuesta, comprobada y respondida |
| VI. Dependencias justificadas | sí | Ningún paquete nuevo. `react-native-svg` ya está en `package.json` del móvil, y la web dibuja con el SVG del navegador (research.md, punto 3) |
| VII. Estilo propio | sí | Identificadores en español sin acentos (`acomodarGrafo`, `textoTecleado`, `salidaAcierto`). `commit` y `head` son términos de Git, como en la spec |
| VIII. Terminado = validado | sí | Cada uno de los 86 criterios tiene pasos en `quickstart.md`. Las funciones de `grafo.ts` y `codigo.ts` no llevan pruebas automáticas (decisión 0012) |

Revisión después del diseño: sin cambios; las excepciones están abajo.

## Cambios al contrato

`contrato/VERSION` 0.8.0 → **0.9.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- Nuevos: `LENGUAJES_CODIGO`, `LenguajeCodigo`, `NOMBRE_LENGUAJE`, `ActividadRetoCodigo`,
  `ActividadTerminalSimulada`, `CommitGrafo`, `RamaGrafo`, `HeadGrafo` y
  `ActividadGrafoCommits`.
- Cambian: `Actividad`, `LIMITES_ACTIVIDADES`, `CALIFICA_ACTIVIDAD` y `MENSAJES_EDITOR`.

## Cambios al modelo de datos

- Sin tablas, columnas ni migraciones. Detalle en [data-model.md](./data-model.md).
- Al cerrar, `specs/02-modelo-datos.md` recibe los tres tipos y sus reglas.

## API

Sin rutas nuevas. Lo que cambia en las existentes está en
[contracts/api.md](./contracts/api.md): `PUT /editor/cursos/:idCurso/lecciones/:idLeccion`
acepta y valida los tres tipos, y los `GET` de lección pueden traerlos.

## Interfaz

Según `docs/diseno.md`. Lo nuevo se agrega **primero** ahí (es una tarea), y después a los
dos clientes con el mismo nombre.

### Lo que se agrega a `docs/diseno.md`

- **Tokens** (sección 2.1, tabla "Código"; valen lo mismo en los dos modos):

  | Token | Valor | Uso |
  |---|---|---|
  | `codigoTenue` | `#A9A6C9` | La carpeta antes del `$`, la etiqueta del lenguaje y el código de solo lectura. 7.6:1 sobre `codigoFondo` |
  | `codigoCursor` | `#A3E635` | El cursor del campo de código y de la terminal, y el `$` ("cursor brote"). 11.9:1 |
  | `codigoEtiquetaFondo` | `rgba(255,255,255,0.10)` | Fondo de la etiqueta del lenguaje |

  `textoTenue` suma un uso: las líneas y el borde de los commits del grafo (3.6:1 sobre el
  vidrio claro, 3.5:1 sobre el oscuro).

- **Componentes** (sección 4):

  | Componente | Props clave | Notas |
  |---|---|---|
  | `CampoCodigo` | `valor`, `alCambiar`, `lenguaje`, `soloLectura`, `etiqueta` (nombre accesible) | Panel `codigoFondo`, radio `medio`, con la etiqueta del lenguaje arriba a la derecha (píldora `codigoEtiquetaFondo`, `nota` en `codigoTenue`; sin ella con `lenguaje` nulo). El texto en `codigo` 14/22, `codigoTexto`, con el cursor `codigoCursor`; en solo lectura, `codigoTenue`. Pasa todo cambio por `textoTecleado`. Web: un `textarea` sin ajuste de línea, de al menos 6 filas, con Tab, Mayús+Tab y Esc (research.md, punto 4; las teclas modificadoras no quitan la marca de Esc) y debajo el texto de ayuda en `nota` `textoSuave`; foco: anillo `primario` en el panel. Móvil: de 6 a 12 líneas y después se desplaza por dentro |
  | `PanelTerminal` | `salidaPrevia`, `carpeta`, `comando`, `alCambiar`, `alEnviar`, `soloLectura`, `salida` | Panel `codigoFondo`, radio `medio`, `codigo` 14/22. La salida previa en `codigoTexto`, luego la línea del comando: la carpeta en `codigoTenue`, `$` en `codigoCursor` y el comando, que pasa a la línea siguiente si no cabe. `salida` va debajo del comando. Pulsar en el panel enfoca la línea. Foco: anillo `primario` en el panel |
  | `DiagramaCommits` | `actividad`, `elegido`, `comprobado`, `alElegir` | El grafo de `acomodarGrafo` dentro de una `Superficie`. Líneas de 2 px en `textoTenue`. Cada commit es un círculo de 40 px en un área de 44, con el nombre en `codigo`: normal, fondo `vidrioOpaco` y borde de 2 px `textoTenue`; elegido, borde `primario` y fondo `primarioSuave`; correcto e incorrecto, como las opciones (sección 6), con `CircleCheck` o `CircleX` de 16 px en la esquina. Las ramas, píldoras `primarioSuave` con el nombre en `codigo` `primario`; HEAD, píldora `primario` con `sobrePrimario`. Van encima de su commit y suben un nivel si se enciman (research.md, punto 3) |
  | `BloqueCodigo` (cambia) | `lenguaje`, `diff` | `lenguaje`: la etiqueta de `CampoCodigo`, arriba a la derecha. `diff={false}`: sin colores de diff. Por defecto `true`, como hasta ahora |
  | `BarraRespuesta` (cambia) | `codigo` | Entre el título y el detalle, en `codigo`, sin panel. Se desplaza junto con el detalle (research.md, punto 8) |

- **Editor (solo web)** (sección 4):

  | Componente | Props clave | Notas |
  |---|---|---|
  | `CampoTexto` (cambia) | `codigo` | Letra `--fuente-codigo` y sin corrector, como `CampoArea` |
  | `CampoSelector` (cambia) | `ayuda`, `invalido` | Como en `CampoTexto`. La ayuda del lenguaje va debajo del selector, y `invalido` marca el "Padre" del último commit con el error de columnas, que va en un `Aviso` (agregado al implementar) |

- **Actividades** (sección 6):
  - **Reto de código**: la consigna y `CampoCodigo`. Al comprobar, una `Superficie` `suave`
    con "SOLUCIÓN DE REFERENCIA" en `seccion` y `BloqueCodigo` con `lenguaje` y
    `diff={false}`; luego la autoevaluación, como la pregunta abierta.
  - **Terminal simulada**: la consigna y `PanelTerminal`. Al acertar, la salida va en el
    panel; la barra inferior lleva el comando esperado en `codigo` y la pista en `detalle`.
  - **Grafo de commits**: la consigna y `DiagramaCommits`. La barra inferior lleva el nombre
    del commit correcto en `codigo` y la explicación en `detalle`.
  - **Teclado**: en `CampoCodigo`, Tab mete dos espacios, Mayús+Tab los quita y, después de
    Esc, Tab sale; Enter salta de línea. En la terminal, Enter comprueba. En el grafo, Tab
    recorre los commits por columnas y, en cada una, de arriba abajo; las teclas 1 a 9 no
    hacen nada.
  - La regla "Terminal simulada y código" pasa a citar `codigoCursor`.

### Por pantalla

| Pantalla | Usa | Nuevo |
|---|---|---|
| Reproductor de la lección (web y móvil) | `BarraRespuesta`, `BloqueCodigo`, `Superficie`, `Boton` | Los tres componentes de actividad, con `CampoCodigo`, `PanelTerminal` y `DiagramaCommits` |
| Lienzo, inspector (web) | `CampoArea`, `CampoTexto`, `CampoSelector`, `ListaEditable`, `Aviso`, `Boton` | Los tres formularios |
| Lienzo, vista previa (web) | `VistaPrevia`, sin cambios | Nada: monta la actividad real |
| Lienzo, paleta y secuencia (web) | `PaletaActividades`, `BloqueActividad`, sin cambios | Nada: se activan con `registroEditor` |

## Por repo

### brote_backend_express

- **Archivos**:
  - `src/validacion/actividades.ts`: `validarRetoCodigo`, `validarTerminalSimulada` y
    `validarGrafoCommits`, cada uno en `validadores`. Nuevas internas: `deUnaLinea(texto,
    campo)`, `normalizarComando(texto)`, `indiceEn(valor, total, campo)` y
    `contarColumnas(commits)` (research.md, puntos 2 y 6). `consigna` usa
    `textoObligatorio`; `codigoInicial`, `salidaPrevia`, `salidaAcierto`, `pista` y
    `explicacion`, `textoOpcional`.
  - `src/validacion/editor.ts`: `recortarTextos` recorta también `carpeta` y `comandos` de
    la terminal y los nombres de commits y ramas del grafo.
  - `scripts/actividades-prototipo.ts`: se regenera con los doce tipos (research.md, punto
    10). Comprobar el total: 146 actividades.
  - `scripts/datos-prueba.ts`: seis lecciones más al final de "Actividades de prueba"
    (quickstart.md, sección 1.1).
- **Validación de entrada**: la de F05. `validarActividades` lanza `ErrorActividades` con el
  índice, y la ruta responde 400 sin guardar nada (contracts/api.md).
- **Notas**:
  - `servicios/`, `rutas/` y `prisma/` no cambian. `contarPreguntas` usa
    `CALIFICA_ACTIVIDAD`.
  - Los repetidos y `HEAD` se comparan recortados, porque el recorte viene después, en
    `editor.ts` (como las fichas de F11).
  - `bd:sembrar` pasa todo por `validarActividades` antes de tocar la base: correrlo temprano
    comprueba que las 26 actividades cumplen las reglas.
  - Comprobar con `npm run tipos` y `npm run lint`.

### brote_web_react

- **Páginas y rutas**: sin cambios.
- **Actividades** (`src/actividades/`), tres carpetas nuevas con los mismos cuatro archivos
  que `PreguntaAbierta/`:
  - `RetoCodigo/`: `RetoCodigo.tsx`, `RetoCodigo.module.css`, `FormularioRetoCodigo.tsx` y
    `editorRetoCodigo.ts`.
  - `TerminalSimulada/` y `GrafoCommits/`, igual.
  - `registro.ts` y `registroEditor.ts`: una línea por tipo.
- **Componentes** (`src/componentes/`): `CampoCodigo/`, `PanelTerminal/` y
  `DiagramaCommits/`, nuevos. `BloqueCodigo/`, `BarraRespuesta/`, `CampoTexto/` y
  `CampoSelector/` cambian.
- **Hooks**: `src/hooks/useAncho.ts` (el ancho de un elemento, con `ResizeObserver`) y
  `src/hooks/useAlturaAutomatica.ts` (la línea de la terminal), nuevos.
- **Utilidades**:
  - `src/utilidades/grafo.ts`, nuevo: `acomodarGrafo`, `medirGrafo`, `MEDIDAS_GRAFO`,
    `rutaLinea` y `nombreAccesibleCommit` (research.md, puntos 2 y 3).
  - `src/utilidades/codigo.ts`, nuevo: `textoTecleado`, `normalizarComando`,
    `comandoAceptado`, `sangrarLineas` y `quitarSangria` (research.md, puntos 4 a 6).
- **Estilos**: `src/estilos/tokens.css` gana `--color-codigo-tenue`,
  `--color-codigo-cursor` y `--color-codigo-etiqueta-fondo`.
- **Estado**: local en cada actividad, con `useState`. El borrador de cada tipo vive en
  `useEditorLeccion`, sin cambios.
- **Notas**:
  - `paleta.ts`, `Inspector`, `VistaPrevia`, `Secuencia` y `ProbarLeccion` no se tocan.
  - `useEnfocarAlMontar` en la consigna (`h2` con `tabIndex={-1}`), como los demás tipos.
  - El reto mueve el foco a la autoevaluación al comprobar, igual que `PreguntaAbierta`.
  - Enter en la línea de la terminal lo atiende `PanelTerminal`; `BarraRespuesta` ya ignora
    Enter en un `textarea`.
  - Comprobar con `npm run tipos`, `npm run lint` y en Chrome.

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**: sin cambios.
- **Actividades** (`src/actividades/`):
  - `RetoCodigo.tsx`, `TerminalSimulada.tsx` y `GrafoCommits.tsx`, nuevos.
  - `registro.ts`: una línea por tipo.
  - `MarcoActividad.tsx`: solo si en iOS el campo no queda a la vista al abrir el teclado,
    gana la prop opcional `alAbrirTeclado` (research.md, punto 7).
- **Componentes** (`src/componentes/`): `CampoCodigo.tsx`, `PanelTerminal.tsx` y
  `DiagramaCommits.tsx`, nuevos. `BloqueCodigo.tsx` y `BarraRespuesta.tsx` cambian.
- **Utilidades**: `src/utilidades/grafo.ts` y `src/utilidades/codigo.ts`, nuevos, iguales a
  los de la web, sin `sangrarLineas` ni `quitarSangria` (en el teléfono no hay Tab).
- **Tema**: `src/constantes/tema.ts` gana `codigoTenue`, `codigoCursor` y
  `codigoEtiquetaFondo` en los dos modos, con el mismo valor.
- **Almacenamiento local**: no aplica.
- **Notas**:
  - `useReproductor` no cambia: `alInteractuar` ya cubre escribir y elegir.
  - Los campos llevan `autoCorrect={false}`, `autoCapitalize="none"`, `spellCheck={false}`,
    `autoComplete="off"` y `smartInsertDelete={false}` (research.md, punto 5).
  - `DiagramaCommits` usa `Svg` y `Path` de `react-native-svg` y `PixelRatio.getFontScale()`
    para la letra grande.
  - Comprobar con `npm run tipos`, `npm run lint` y en un teléfono. Hay tres supuestos del
    teclado que solo se confirman ahí (research.md, punto 7): conviene probarlos con la
    terminal, antes de hacer el reto y el grafo.

### brote_specs

- `contrato/contrato.ts` y `contrato/VERSION`.
- `docs/diseno.md`: lo de "Interfaz", antes que el código.
- Al cerrar: `specs/02-modelo-datos.md` (data-model.md, "Al cerrar") y
  `specs/01-navegacion.md`.

## Cambios a la navegación

- Sin pantallas nuevas.
- `specs/01-navegacion.md`, "Salir de una lección": salir también pide confirmación si el
  alumno escribió código o un comando, o eligió un commit.

## Dependencias nuevas

Ninguna.

`react-native-svg` (15.16.0) ya está en `package.json` del móvil, en la versión que trae el
SDK 58, y hoy lo usa `lucide-react-native`. La web dibuja el grafo con el SVG del navegador.
Se descartaron un editor de código (CodeMirror o Monaco) y una librería de grafos de Git
(research.md, puntos 3 y 4).

## Excepciones a la constitución

| Qué | Por qué hace falta | Por qué no sirve la opción simple |
|---|---|---|
| `BarraRespuesta` en los dos clientes | La spec pide el comando y el nombre del commit en letra monoespaciada | Ponerlos en `detalle` los dejaría en letra normal, y un `ReactNode` rompería el anuncio de iOS (research.md, punto 8) |
| `BloqueCodigo` en los dos clientes | La solución del reto lleva la etiqueta del lenguaje y no colorea el diff | Un bloque propio en el reto copiaría el panel, el desplazamiento lateral y las líneas vacías |
| `CampoTexto` (web) | Los comandos van en letra monoespaciada y sin corrector | Usar `CampoArea` de una fila dejaría escribir saltos de línea en un campo de una línea |
| `CampoSelector` (web) | La spec pide una ayuda debajo del selector de lenguaje, y el foco del primer error busca `aria-invalid` | Poner la ayuda en un párrafo aparte no la enlazaría al selector, y sin `invalido` el error de columnas no tendría a dónde llevar el foco |
| `recortarTextos` en `src/validacion/editor.ts` (backend) | Recorta la carpeta, los comandos y los nombres, que se comparan recortados | Rechazar los espacios de sobra le pasaría al cliente una regla que hoy resuelve el servidor, como en F11 |
| `MarcoActividad.tsx` (móvil), solo si hace falta | Dejar a la vista el campo con el foco al abrir el teclado en iOS | Un `ScrollView` propio en dos actividades repetiría el marco (research.md, punto 7) |
