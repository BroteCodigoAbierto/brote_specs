---
description: "Lista de tareas de F12 Actividades de código y terminal"
---

# Tareas: F12 Actividades de código y terminal

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F12-actividades-codigo-terminal` en cada repo afectado, creada desde
`feature/F11-actividades-relacionar` porque F11 todavía no está en `dev` (excepción a la
decisión 0013, solo para F12: plan.md, "Resumen")

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase). Las funciones
  de `grafo.ts` y `codigo.ts` tampoco llevan pruebas (decisión 0012).
- Los límites, los lenguajes y los mensajes **siempre** salen del contrato
  (`LIMITES_ACTIVIDADES`, `LENGUAJES_CODIGO`, `NOMBRE_LENGUAJE`, `MENSAJES_EDITOR`); ninguna
  tarea los escribe a mano.
- Toda pieza de interfaz usa los tokens y componentes de `docs/diseno.md`. Lo nuevo se agrega ahí
  primero (T003 a T005).
- Los textos de las actividades se muestran siempre como texto: nada de
  `dangerouslySetInnerHTML`, tampoco dentro del SVG del grafo (principio III).
- **Comunes a los tres tipos, en los dos clientes**:
  - Cada actividad es `PropsActividad<"tipo">` y su estado es local (`useState`): se responde una
    sola vez y, al recargar, empieza de cero (spec, "Casos de error").
  - Toda acción, también escribir o elegir un commit, llama a `alInteractuar` (salir pide
    confirmación: `useReproductor` no cambia).
  - La barra es `BarraRespuesta`: "Comprobar" deshabilitado hasta que hay respuesta; después
    `correcto` con "¡Correcto!" o `incorrecto` con "Respuesta correcta:" (en el reto, "A
    repasar"), y "Continuar" llama a `alTerminar` con `"acierto"` o `"fallo"`.
  - Lo que escribe el alumno pasa siempre por `textoTecleado` (research.md, punto 5), y en la
    terminal antes por `texto.replace(/\r?\n/g, " ")` (punto 6).
  - La consigna en un `h2` con `tabIndex={-1}` y `useEnfocarAlMontar` (web), como los demás tipos.
- Textos fijos de la interfaz que no están en el contrato:
  - Al cursar: "Tu código", "Solución de referencia", "¿La tuviste bien?", "La tuve bien", "No
    la tuve", "Comando", "Tab agrega dos espacios. Para salir del campo, pulsa Esc y luego
    Tab." (solo web), "HEAD → {rama}" y "HEAD".
  - Nombre accesible de un commit (`nombreAccesibleCommit`): "Commit {nombre}", luego ", padre
    {a}" o ", padres {a} y {b}", luego las ramas y HEAD que apuntan a él y, al final, ",
    elegido", ", correcto" o ", incorrecto". Por ejemplo: "Commit c2, padre c1, elegido".
  - Formularios: "Consigna", "Lenguaje", "Elige un lenguaje", "Código inicial", "Solución",
    "Carpeta", "Salida previa", "Comandos aceptados", "Comando {n}", "Agregar comando", "Salida
    al acertar", "Pista", "Commits", "Commit {n}", "Padre", "Segundo padre", "Ninguno", "Primer
    commit: no tiene padre", "Agregar commit", "Ramas", "Rama {n}", "Commit", "Agregar rama",
    "HEAD", "Sin HEAD", "Rama {nombre}", "Commit {nombre}", "Respuesta", "Elige la respuesta",
    "Explicación" y "Quitar".
  - Ayudas: las de la spec, en "Formulario de cada tipo", tal cual.

---

## Fase 1: Preparación

- [X] T001 [specs] En `brote_specs`, rama `feature/F12-actividades-codigo-terminal` (ya existe, con spec, plan, artefactos y F11 fusionada en `0ded499`): `git merge feature/F11-actividades-relacionar` para traer lo último de F11 (y `git merge origin/dev` si F11 ya se fusionó). Comprobar que `contrato/VERSION` dice `0.8.0`
- [X] T002 [specs] En `contrato/contrato.ts`, aplicar [contracts/contrato.md](./contracts/contrato.md) tal cual: `LENGUAJES_CODIGO`, `LenguajeCodigo`, `NOMBRE_LENGUAJE`, `ActividadRetoCodigo`, `ActividadTerminalSimulada`, `CommitGrafo`, `RamaGrafo`, `HeadGrafo` y `ActividadGrafoCommits` después de `ActividadBancoPalabras`; las tres variantes en `Actividad`; las claves nuevas de `LIMITES_ACTIVIDADES` (`respuestaCodigoMax: 2000`, `carpetaMax: 100`, `salidaMax: 2000`, `comandosMax: 10`, `comandoMax: 200`, `pistaMax: 500`, `commitsMin: 2`, `commitsMax: 10`, `nombreCommitMax: 4`, `columnasGrafoMax: 6`, `ramasMax: 4`, `nombreRamaMax: 20`, `explicacionMax: 500`) y de `MENSAJES_EDITOR` (`lenguajeFalta` a `respuestaFalta`), y los tres `true` de `CALIFICA_ACTIVIDAD`. Subir `contrato/VERSION` de `0.8.0` a `0.9.0`
- [X] T003 [specs] En `docs/diseno.md`, sección 2.1, tabla "Código": agregar `codigoTenue` (`#A9A6C9`), `codigoCursor` (`#A3E635`) y `codigoEtiquetaFondo` (`rgba(255,255,255,0.10)`), con su uso y su contraste, de plan.md ("Lo que se agrega a docs/diseno.md"). Valen lo mismo en los dos modos. En la fila de `textoTenue`, el uso nuevo: las líneas y el borde de los commits del grafo
- [X] T004 [specs] En `docs/diseno.md`, sección 4, de plan.md: a la tabla general, `CampoCodigo`, `PanelTerminal` y `DiagramaCommits` con sus props y notas; en la fila de `BloqueCodigo`, las props `lenguaje` y `diff` (por defecto `true`); en la de `BarraRespuesta`, la prop `codigo`, que va entre el título y el detalle y se desplaza con él. En "Editor (solo web)", la prop `codigo` de `CampoTexto`
- [X] T005 [specs] En `docs/diseno.md`, sección 6, de plan.md: **Reto de código**, **Terminal simulada** y **Grafo de commits**. En "Teclado", lo de `CampoCodigo` (Tab, Mayús+Tab, Esc y Enter), Enter en la terminal y Tab por columnas en el grafo, sin teclas 1 a 9. La regla "Terminal simulada y código" pasa a citar `codigoCursor`
- [X] T006 [back] En `brote_backend_express`: `git fetch`, `git switch feature/F11-actividades-relacionar && git pull --ff-only` y crear `feature/F12-actividades-codigo-terminal` desde ahí. Si para entonces F11 ya está en `origin/dev`, crearla desde `dev` como siempre. Cuando F11 se fusione, la rama de F12 hace `git merge origin/dev`, y su PR va después del de F11
- [X] T007 [P] [web] Igual que T006 en `brote_web_react`
- [X] T008 [P] [movil] Igual que T006 en `brote_mobile_expo`
- [X] T009 [specs] Copiar el contrato 0.9.0 a los tres repos: `npm run contrato:copiar` en `brote_specs`. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo. **`npm run tipos` deja de pasar** hasta tener las entradas de sus `Record`: en back con T014, en web con T034 y T039, y en movil con T051 (principio IV)

---

## Fase 2: Backend (brote_backend_express)

Todo lo de las reglas está en [data-model.md](./data-model.md) y en
[contracts/api.md](./contracts/api.md), "Qué rechaza cada tipo". Los repetidos y `HEAD` se
comparan **recortados**, porque el recorte se hace después, en `editor.ts` (T015).

- [ ] T010 [back] En `src/validacion/actividades.ts`, agregar las internas (research.md, puntos 2 y 6): `deUnaLinea(texto, campo)` (lanza si tiene `\n` o `\r`); `normalizarComando(texto)` (cambia `“ ” „ ‟` por `"`, `‘ ’ ‚ ‛` por `'`, `—` por `--` y `…` por `...`, recorta y cambia cada racha de `/\s+/` por un espacio); `indiceEn(valor, total, campo)` (entero entre 0 y `total - 1`, o lanza); y `contarColumnas(commits)` (`columna[0] = 0`, `columna[i] = 1 + la mayor columna de sus padres`; devuelve la mayor más uno). Cada una con su comentario
- [ ] T011 [back] En `src/validacion/actividades.ts`, agregar `validarRetoCodigo`: `soloCampos` con `tipo`, `consigna`, `lenguaje`, `codigoInicial` y `solucion`; `textoObligatorio` para `consigna` ("No vacía, de hasta 500", `consignaMax`); `lenguaje` "Uno de `LENGUAJES_CODIGO`" (se rechazan `"CSS"` y `"Otro"`); `textoOpcional` para `codigoInicial` ("Si está, no vacío, de hasta 2000", `codigoMax`); `textoObligatorio` para `solucion` ("No vacía, de hasta 2000", `solucionMax`). Agregarlo a `validadores`
- [ ] T012 [back] En `src/validacion/actividades.ts`, agregar `validarTerminalSimulada`: `soloCampos` con `tipo`, `consigna`, `carpeta`, `salidaPrevia`, `comandos`, `salidaAcierto` y `pista`; `consigna` como en T011; `carpeta` "Si está, no vacía, de una línea, de hasta 100" (`carpetaMax`, `deUnaLinea`); `salidaPrevia` y `salidaAcierto` "Si está, no vacía, de hasta 2000" (`salidaMax`); `comandos` "Entre 1 y 10" (`listaEntre` con 1 y `comandosMax`), cada uno "no vacío, de una línea, de hasta 200" (`comandoMax`), sin repetir comparando con `normalizarComando` (`git init` y `git  init` son el mismo, `git commit -m "Uno"` y `git commit -m “Uno”` también; `git init` y `Git init`, no); `pista` "Si está, no vacía, de hasta 500" (`pistaMax`). Agregarlo a `validadores`
- [ ] T013 [back] En `src/validacion/actividades.ts`, agregar la interna `validarCommitsGrafo(valor)`: `commits` "Entre 2 y 10" (`commitsMin`, `commitsMax`); cada commit, objeto solo con `nombre` y `padres`; `nombre` "No vacío, de una línea, de hasta 4" (`nombreCommitMax`), sin repetir con `textosSinRepetir`; `padres` lista de enteros: el primero `[]`, los demás "uno o dos, distintos", cada uno "menor que el del commit". Al final, `contarColumnas` "no pasa de 6" (`columnasGrafoMax`), con el mensaje `commits: hasta 6 columnas`. Devuelve los commits
- [ ] T014 [back] En `src/validacion/actividades.ts`, agregar `validarGrafoCommits`: `soloCampos` con `tipo`, `consigna`, `commits`, `ramas`, `head`, `respuesta` y `explicacion`; `consigna` como en T011; `validarCommitsGrafo`; `ramas` siempre presente, lista "Entre 0 y 4" (`ramasMax`), cada una objeto solo con `nombre` ("No vacío, de una línea, de hasta 20", `nombreRamaMax`, sin repetir, "No es `HEAD`" comparando recortado y con mayúsculas: `head` sí vale) y `commit` (`indiceEn` en `commits`); `head`, si está, objeto con un solo campo, `rama` (`indiceEn` en `ramas`) o `commit` (`indiceEn` en `commits`); `respuesta` con `indiceEn` en `commits`; `explicacion` "Si está, no vacía, de hasta 500" (`explicacionMax`). Agregarlo a `validadores`; aquí `npm run tipos` vuelve a pasar
- [ ] T015 [P] [back] En `src/validacion/editor.ts`, en `recortarTextos`, agregar los casos `terminalSimulada` (recorta `carpeta`, si está, y cada comando) y `grafoCommits` (recorta `commits[].nombre` y `ramas[].nombre`). `codigoInicial`, `solucion` y las salidas se guardan tal como llegan. Actualizar su comentario
- [ ] T016 [P] [back] Regenerar `scripts/actividades-prototipo.ts` con un script desechable en la carpeta temporal (no se versiona), como T014 de F11: ahora se quedan los doce tipos, en su orden, con la tabla de research.md, punto 10, además de las de F03 y F11. `language` `c` y `css` pasan sin cambio; en el grafo, `label` pasa a `nombre`, los `parents` y `branches[].commit` y `answer` pasan de ids a índices, y `id`, `x` e `y` se descartan. Los textos se copian sin cambios (incluido "Tenés") y `glossary` se descarta. Formatear con Prettier y actualizar el encabezado ("los doce tipos de F03, F11 y F12"; lo regenera la tarea T016 de F12). Comprobar el total: 146 actividades (26 `teoria`, 9 `tarjeta`, 28 `opcionMultiple`, 13 `completarEspacios`, 17 `preguntaAbierta`, 9 `emparejar`, 9 `clasificar`, 6 `ordenar`, 3 `bancoPalabras`, 13 `retoCodigo` (3 `c` y 10 `css`), 12 `terminalSimulada` y 1 `grafoCommits`)
- [ ] T017 [back] En `scripts/datos-prueba.ts`, en "Actividades de prueba", agregar **al final**, después de "Relacionar al límite", las lecciones 7, 8 y 9 de quickstart.md, sección 1.1: "Código con etiquetas" (un reto de `html`, una terminal y un grafo con `HTML` en todos sus textos; el grafo con los commits `<b>` y `c2` y la rama `<script>`); "Retos de código" (un reto de `sql` sin `codigoInicial`, con la solución `-- Todos los alumnos` y `SELECT * FROM alumnos;` en dos líneas, y un reto con lenguaje `otro`); y "Terminal mínima" (`{ tipo: "terminalSimulada", consigna: "Muestra los archivos de la carpeta.", comandos: ["ls"] }`)
- [ ] T018 [back] En `scripts/datos-prueba.ts`, agregar la lección 10 "Grafos" con los tres grafos de la tabla de quickstart.md, sección 1.1, con sus consignas, padres (como índices), ramas en ese orden, HEAD, respuesta y explicación tal cual: con un merge, rama ya borrada y HEAD suelto (sin explicación)
- [ ] T019 [back] En `scripts/datos-prueba.ts`, agregar la lección 11 "Código al límite" (un reto con `codigoInicial` y `solucion` de 2000 caracteres y una línea de 150; una terminal con carpeta de 100, 10 comandos, `salidaPrevia` y `salidaAcierto` de 2000 y `pista` de 500; y el grafo al límite de la tabla de quickstart.md, con sus 10 commits, sus 4 ramas de 20 caracteres en ese orden, HEAD → `funcion-del-registro`, la respuesta `x2j2` y una explicación de 500) con `textoLargo` y `listaDe`; y la lección 12 "Solo teoría" (una teoría y una tarjeta). Sin las palabras de los criterios de búsqueda de F02 (ver el comentario del archivo). El encabezado del archivo agrega F12

**Punto de control**: `npm run tipos` y `npm run lint` pasan, `npm run bd:sembrar` acepta las 146
actividades y las de prueba, y B1 a B8 de [quickstart.md](./quickstart.md), sección 2, responden lo
que dicen. Con esto ya se pueden validar los criterios `[backend]`.

---

## Fase 3: Web (brote_web_react)

### Base

- [ ] T020 [P] [web] En `src/estilos/tokens.css`, agregar `--color-codigo-tenue: #a9a6c9`, `--color-codigo-cursor: #a3e635` y `--color-codigo-etiqueta-fondo: rgba(255, 255, 255, 0.1)` junto a los demás `--color-codigo-*`, iguales en los dos modos (docs/diseno.md, sección 2.1)
- [ ] T021 [P] [web] Crear `src/utilidades/codigo.ts` (research.md, puntos 4 a 6): `textoTecleado(texto)` (`“ ” „ ‟` → `"`, `‘ ’ ‚ ‛` → `'`, `—` → `--` y `…` → `...`); `normalizarComando(texto)` (los reemplazos de `textoTecleado`, recortar y una racha de espacios como uno, igual que T010) y `comandoAceptado(escrito, comandos)` (compara con `===` después de normalizar los dos, así un comando del autor con `“ ”` se puede acertar); `sangrarLineas(valor, inicio, fin)` y `quitarSangria(valor, inicio, fin)`, que devuelven el texto de las líneas completas que toca la selección con dos espacios más o hasta dos menos, y el rango de esas líneas, para que `CampoCodigo` lo escriba con `execCommand`
- [ ] T022 [P] [web] Crear `src/utilidades/grafo.ts` con `acomodarGrafo(actividad)` (research.md, punto 2): devuelve `{ columna, fila }[]` por commit y el número de columnas y de filas. Columnas por generaciones; filas con `trazar(desde)` siguiendo el primer padre, primero por cada rama en el orden del autor y después por cada commit del último al primero. Sin ramas, la primera fila sale del último commit. Con el ejemplo de data-model.md da `c1` (0, 0), `c2` (1, 0), `c3` (2, 0), `c5` (3, 0) y `c4` (2, 1), y con el grafo al límite, las columnas y filas de la tabla de quickstart.md
- [ ] T023 [web] En `src/utilidades/grafo.ts`, agregar (research.md, punto 3): `MEDIDAS_GRAFO` (círculo 40, área 44, columnas de 48 a 96, filas de 64); `medirGrafo(acomodo, actividad, ancho, escalaLetra)`, que da la separación entre columnas, la posición de cada commit y de cada etiqueta (encima de su commit, ancho `caracteres × 0.62 × tamaño + relleno`, recortada a la caja y un nivel más arriba si se encima con otra de su fila; cada fila reserva sus niveles), el alto total y si no cabe (para desplazarse a los lados); las etiquetas son las ramas (con "HEAD → " si HEAD apunta a ellas) y "HEAD" si apunta a un commit; `rutaLinea(desde, hasta, esPrimerPadre)` (recta en la misma fila; si no, la curva junto al padre con el primer padre y junto al hijo con el segundo); y `nombreAccesibleCommit(actividad, indice, estado)` con el texto de "Formato"
- [ ] T024 [P] [web] Crear `src/hooks/useAncho.ts` (el ancho de un elemento con `ResizeObserver`: devuelve `[ref, ancho]`) y `src/hooks/useAlturaAutomatica.ts` (ajusta el alto de un `textarea` a su `scrollHeight` cada vez que cambia su valor)

### Componentes (docs/diseno.md, sección 4)

- [ ] T025 [P] [web] En `src/componentes/BloqueCodigo/BloqueCodigo.tsx` y `BloqueCodigo.module.css`, props `lenguaje?: LenguajeCodigo` y `diff = true`: con `lenguaje` distinto de `otro`, la etiqueta `NOMBRE_LENGUAJE[lenguaje]` arriba a la derecha (píldora `--color-codigo-etiqueta-fondo`, `nota` en `--color-codigo-tenue`); con `diff={false}`, todas las líneas en `normal`. Sin las props, igual que hoy
- [ ] T026 [P] [web] En `src/componentes/BarraRespuesta/BarraRespuesta.tsx` y `BarraRespuesta.module.css`, prop `codigo?: string`: entre el título y el detalle, en `--texto-codigo`, sin panel y con `white-space: pre-wrap` y `overflow-wrap: anywhere`. Va dentro de la misma zona que `.detalle` (`max-height: 11rem; overflow-y: auto`), para que se desplace con él y "Continuar" siga a la vista (research.md, punto 8)
- [ ] T027 [P] [web] En `src/componentes/CampoTexto/CampoTexto.tsx` y `CampoTexto.module.css`, prop `codigo = false`: letra `--fuente-codigo`, `spellCheck={false}`, `autoCapitalize="off"`, `autoCorrect="off"` y `autoComplete="off"`, como `CampoArea` (docs/diseno.md, "Editor (solo web)")
- [ ] T028 [web] Crear `src/componentes/CampoCodigo/CampoCodigo.tsx` y `CampoCodigo.module.css` (docs/diseno.md, sección 4; research.md, punto 4): props `valor`, `alCambiar`, `lenguaje`, `soloLectura` y `etiqueta` (el nombre accesible del campo; el reto pasa "Tu código"). Panel `--color-codigo-fondo`, radio `medio`, etiqueta del lenguaje como en T025. `<textarea wrap="off">` con `rows = max(6, líneas)`, `--texto-codigo`, `--color-codigo-texto`, `caret-color: var(--color-codigo-cursor)` y, en solo lectura, `--color-codigo-tenue`; `maxLength={LIMITES_ACTIVIDADES.respuestaCodigoMax}`; `aria-label` con `etiqueta` más el nombre del lenguaje (si no es `otro`); `spellCheck`, `autoCapitalize`, `autoCorrect` y `autoComplete` apagados. Cada cambio pasa por `textoTecleado` y se recorta al límite; si eso cambió el largo, después de pintar se restaura el cursor con `setSelectionRange`, corrido por lo que creció el texto antes de él (research.md, punto 5). `onKeyDown`: Tab y Mayús+Tab con `sangrarLineas` y `quitarSangria`, escritos con `document.execCommand("insertText")` (y `setRangeText` si no existe); Esc pone una marca en un `ref`, y con ella el siguiente Tab (o Mayús+Tab) no se cancela; otra tecla y `blur` la quitan, **menos** `Shift`, `Control`, `Alt` y `Meta`, porque Mayús+Tab empieza con un `keydown` de `Shift`. Debajo, un `<p>` en `nota` `--color-texto-suave` con el texto de Tab, enlazado con `aria-describedby`, que desaparece en solo lectura (y Tab ya no se cancela). Foco: anillo `primario` en el panel
- [ ] T029 [web] Crear `src/componentes/PanelTerminal/PanelTerminal.tsx` y `PanelTerminal.module.css` (docs/diseno.md, sección 4; research.md, punto 6): props `salidaPrevia`, `carpeta`, `comando`, `alCambiar`, `alEnviar`, `soloLectura` y `salida`. Panel `--color-codigo-fondo`, radio `medio`, `--texto-codigo`. La salida previa y `salida` en `<pre>` con `white-space: pre-wrap`, `overflow-wrap: anywhere` y `tab-size: 4`. La línea del comando: la carpeta en `--color-codigo-tenue`, `$` en `--color-codigo-cursor` y un `<textarea rows={1}>` sin bordes ni fondo, con `caret-color` brote, `useAlturaAutomatica`, `aria-label` "Comando" y la carpeta en su descripción, `maxLength={LIMITES_ACTIVIDADES.comandoMax}` y el corrector apagado. Cada cambio pasa por `texto.replace(/\r?\n/g, " ")`, `textoTecleado` y el recorte al límite, y restaura el cursor como T028. Enter (sin `isComposing`) se cancela y llama a `alEnviar` solo con el comando recortado no vacío; vacío o solo con espacios no hace nada. Va en un `<form>`. `onClick` en el panel enfoca la línea, salvo con texto seleccionado. Foco: anillo `primario` en el panel
- [ ] T030 [web] Crear `src/componentes/DiagramaCommits/DiagramaCommits.tsx` y `DiagramaCommits.module.css` (docs/diseno.md, sección 4; research.md, punto 3): props `actividad`, `elegido`, `comprobado` y `alElegir`. Dentro de una `Superficie`, una caja relativa con `useAncho`; `acomodarGrafo` y `medirGrafo`, con la escala de 1rem. `<svg aria-hidden="true">` con un `<path>` de 2 px en `--color-texto-tenue` por cada padre (`rutaLinea`). Cada commit, un `<button type="button">` absoluto de 44 px con el círculo de 40, el nombre en `--texto-codigo` y `aria-label={nombreAccesibleCommit(...)}`: normal, `vidrioOpaco` con borde de 2 px `textoTenue`; elegido, borde `primario` y fondo `primarioSuave`; correcto e incorrecto, como las opciones, con `CircleCheck` o `CircleX` de 16 px en la esquina. Los botones van en el DOM por columna y, en cada una, por fila, para que Tab siga ese orden. Pulsar el elegido lo deja elegido; con `comprobado`, `disabled`. Ramas: píldoras `primarioSuave` con el nombre en `codigo` `primario`; HEAD: píldora `primario` con `sobrePrimario`. Si no cabe, `overflow-x: auto`

### Cursar (docs/diseno.md, sección 6)

- [ ] T031 [P] [web] Crear `src/actividades/RetoCodigo/RetoCodigo.tsx` y `RetoCodigo.module.css`, según la spec ("Reto de código" en "Flujo principal" y "Estados de la pantalla"), con la estructura de `PreguntaAbierta`: la consigna; `CampoCodigo` con `actividad.codigoInicial ?? ""`; "Comprobar" deshabilitado si el código recortado está vacío o es igual a `codigoInicial`. Al comprobar, `soloLectura`, una `Superficie` `suave` con "Solución de referencia" en `seccion` y `BloqueCodigo` con `lenguaje` y `diff={false}`, y la autoevaluación, con el foco en su primer botón. Después, la barra con "¡Correcto!" o "A repasar" y el foco en "Continuar"
- [ ] T032 [P] [web] Crear `src/actividades/TerminalSimulada/TerminalSimulada.tsx` y `TerminalSimulada.module.css`, según la spec ("Terminal simulada"): la consigna y `PanelTerminal`; "Comprobar" deshabilitado con el comando recortado vacío; `alEnviar` y "Comprobar" comprueban con `comandoAceptado`. Después, `soloLectura`; si acertó, `salida={actividad.salidaAcierto}` y "¡Correcto!"; si no, "Respuesta correcta:" con `codigo={actividad.comandos[0]}` y `detalle={actividad.pista}`. El foco pasa a "Continuar"
- [ ] T033 [P] [web] Crear `src/actividades/GrafoCommits/GrafoCommits.tsx` y `GrafoCommits.module.css`, según la spec ("Grafo de commits"): la consigna y `DiagramaCommits`; estado `elegido` y `comprobado`. Sin atajos de las teclas 1 a 9. Al comprobar, "¡Correcto!" o "Respuesta correcta:" con `codigo` el nombre del commit correcto, y en los dos `detalle={actividad.explicacion}`. El foco pasa a "Continuar"
- [ ] T034 [web] En `src/actividades/registro.ts`, importar los tres y agregarlos a `registroActividades`

### Editor (docs/diseno.md, sección 4, "Editor (solo web)")

- [ ] T035 [P] [web] Crear `src/actividades/RetoCodigo/editorRetoCodigo.ts` y `FormularioRetoCodigo.tsx`, según la spec ("Formulario de cada tipo", "Al editar"): borrador `{ consigna, lenguaje: LenguajeCodigo | null, codigoInicial, solucion }`. `CampoArea` para la consigna (`consignaMax`); `CampoSelector` con `textoVacio="Elige un lenguaje"` y `LENGUAJES_CODIGO` en su orden con `NOMBRE_LENGUAJE`; `CampoArea` con `codigo` para el código inicial (`codigoMax`) y la solución (`solucionMax`). Errores: `campoObligatorio` en consigna y solución, `lenguajeFalta`. `resumen`: el inicio de la consigna. `aActividad` guarda los textos tal cual y omite `codigoInicial` si, recortado, está vacío
- [ ] T036 [P] [web] Crear `src/actividades/TerminalSimulada/editorTerminalSimulada.ts` y `FormularioTerminalSimulada.tsx`, según la spec: borrador `{ consigna, carpeta, salidaPrevia, comandos: FilaTexto[], salidaAcierto, pista }`, con un comando vacío. `CampoArea` para la consigna (`consignaMax`); `CampoTexto` con `codigo` para la carpeta (`carpetaMax`) y cada comando (`comandoMax`); `CampoArea` con `codigo` para las salidas (`salidaMax`); `CampoArea` para la pista (`pistaMax`). `ListaEditable` de comandos con `minimo` 1 y `maximo` `comandosMax`, "Agregar comando" y la nota "Es el que ve el alumno como respuesta correcta" en el primero. Errores: `campoObligatorio` y `comandoRepetido` (con `marcarRepetidos` sobre `normalizarComando`). `resumen`: la consigna. `aActividad` omite los opcionales que, recortados, están vacíos
- [ ] T037 [web] Crear `src/actividades/GrafoCommits/editorGrafoCommits.ts` con el borrador de research.md, punto 9 (`FilaCommit`, `FilaRama`, `BorradorGrafoCommits`): empieza con dos commits sin nombre, el segundo con el primero como padre, sin ramas, `head: null` e `idRespuesta: null`. `validar`: `campoObligatorio` en la consigna y en cada nombre; `nombreCommitRepetido`, `padreFalta` (menos el primero, que ignora su `idPadre`), `segundoPadreIgual`, `ramaRepetida`, `ramaHead`, `commitFalta` y `respuestaFalta`; y, solo con todos los padres válidos, `demasiadasColumnas` con `acomodarGrafo` (clave `columnas`, con `aria-invalid` en el "Padre" del último commit). `resumen`: la consigna. `aActividad` cambia ids por índices; `aBorrador`, índices por ids nuevos
- [ ] T038 [web] Crear `src/actividades/GrafoCommits/FormularioGrafoCommits.tsx`, según la spec ("Grafo de commits" en "Formulario de cada tipo"): la consigna; `ListaEditable` de commits (`commitsMin` a `commitsMax`, "Agregar commit" suma uno con el último como padre), cada fila con `CampoTexto` `codigo` de `nombreCommitMax` y, menos la primera ("Primer commit: no tiene padre"), `CampoSelector` "Padre" con los de arriba y "Segundo padre" con "Ninguno" y los de arriba; un sin nombre se ve como "Commit {n}". El `Aviso` de `demasiadasColumnas` debajo de los commits. `ListaEditable` de ramas (0 a `ramasMax`, `CampoTexto` `codigo` de `nombreRamaMax` y `CampoSelector` "Commit"). HEAD: `CampoSelector` con "Sin HEAD", "Rama {nombre}" y "Commit {nombre}", con valores `rama:<id>` y `commit:<id>`. "Respuesta" con "Elige la respuesta", y la explicación (`explicacionMax`, omitida en `aActividad` si, recortada, está vacía). Quitar un commit pone en `null` lo que lo usaba (`idSegundoPadre` y `head` vuelven a "Ninguno" y "Sin HEAD"); quitar la rama de HEAD lo deja en "Sin HEAD"
- [ ] T039 [web] En `src/actividades/registroEditor.ts`, agregar los tres con `registrar`. Con esto la paleta los activa sola y `npm run tipos` vuelve a pasar

**Punto de control**: `npm run tipos`, `npm run lint` y `npm run build` pasan. En Chrome, con el backend
sembrado, la parte web de cada tabla de [quickstart.md](./quickstart.md), sección 3, funciona. Conviene
repetir aquí de F03 "Teoría" (el diff de "Viajar en el tiempo") y "Opción múltiple", de F11 una
respuesta larga en la barra y de F05 los campos de texto: T025, T026 y T027 tocan lo que ya funcionaba.

---

## Fase 4: Móvil (brote_mobile_expo)

### Base

- [ ] T040 [P] [movil] En `src/constantes/tema.ts`, agregar `codigoTenue: "#A9A6C9"`, `codigoCursor: "#A3E635"` y `codigoEtiquetaFondo: "rgba(255, 255, 255, 0.10)"` en los dos modos, con el mismo valor (docs/diseno.md, sección 2.1)
- [ ] T041 [P] [movil] Crear `src/utilidades/codigo.ts`, igual que el de la web (T021) pero sin `sangrarLineas` ni `quitarSangria` (en el teléfono no hay Tab)
- [ ] T042 [P] [movil] Crear `src/utilidades/grafo.ts`, igual que el de la web (T022 y T023), con imports sin extensión
- [ ] T043 [P] [movil] En `src/componentes/BloqueCodigo.tsx`, props `lenguaje?: LenguajeCodigo` y `diff = true`, como T025: la etiqueta arriba a la derecha (sin ella con `otro`) y, con `diff={false}`, todas las líneas `normal`. Sin las props, igual que hoy
- [ ] T044 [P] [movil] En `src/componentes/BarraRespuesta.tsx`, prop `codigo?: string`: entre el título y el detalle, con `tipografia.codigo`, dentro del mismo `ScrollView` que `detalle` (research.md, punto 8). El anuncio de `announceForAccessibility` lo incluye entre el título y el detalle

### Terminal primero, para probar el teclado

- [ ] T045 [movil] Crear `src/componentes/PanelTerminal.tsx` (docs/diseno.md, sección 4; research.md, puntos 5 y 6): las props de T029. Un `Pressable` sin estilo de presión, con `codigoFondo` y radio `medio`, que enfoca la línea. La salida previa y `salida` en `Texto` con `tipografia.codigo`. La línea: la carpeta en `codigoTenue`, `$` en `codigoCursor` y un `TextInput` `multiline` con `cursorColor` y `selectionColor` `codigoCursor`, `accessibilityLabel` "Comando" con la carpeta, `maxLength={LIMITES_ACTIVIDADES.comandoMax}`, `autoCorrect={false}`, `autoCapitalize="none"`, `spellCheck={false}`, `autoComplete="off"`, `smartInsertDelete={false}`, `returnKeyType="send"`, `enablesReturnKeyAutomatically` y `submitBehavior` `"blurAndSubmit"` con el comando recortado no vacío y `"submit"` vacío o solo con espacios (research.md, punto 6). Cada cambio pasa por `texto.replace(/\r?\n/g, " ")`, `textoTecleado` y el recorte al límite
- [ ] T046 [movil] Crear `src/actividades/TerminalSimulada.tsx`, con las mismas reglas que T032, dentro de `MarcoActividad`. Comprobar, con la tecla de enviar o con el botón de la barra, llama a `Keyboard.dismiss()` (`keyboardShouldPersistTaps="handled"` lo deja abierto al pulsar un botón). En `src/actividades/registro.ts`, agregar `terminalSimulada`. `npm run tipos` sigue sin pasar, pero Metro no lo necesita: `actividadesConocidas` se salta los otros dos
- [ ] T047 [movil] En **un teléfono con Expo Go**, no en Expo web, comprobar con "Tu primer commit" y "Viajar en el tiempo" los tres supuestos de research.md, punto 7, y el del cursor del punto 5: que en iOS el `ScrollView` deja a la vista la terminal al enfocarla; que con `autoCorrect={false}` el teclado no reemplaza palabras; que `--` y `"` se quedan como se escribieron; y que el cursor no salta al final al escribir `--` a mitad de la línea. Si uno falla, aplicar su salida de la tabla (`alAbrirTeclado` en `src/actividades/MarcoActividad.tsx`, `keyboardType="visible-password"` solo en Android o `selection` controlada) antes de seguir, y anotar en `research.md` lo que resultó. Hacerlo aquí evita repetir el arreglo en el reto

### Reto y grafo (docs/diseno.md, sección 6)

- [ ] T048 [movil] Crear `src/componentes/CampoCodigo.tsx` (docs/diseno.md, sección 4): las props de T028, sin Tab ni texto de ayuda. Panel `codigoFondo` con la etiqueta del lenguaje como en T043, y un `TextInput` `multiline` con `tipografia.codigo`, `minHeight` de 6 líneas y `maxHeight` de 12 (después se desplaza por dentro), `textAlignVertical="top"`, `cursorColor` `codigoCursor`, `codigoTenue` en solo lectura (`editable={false}`), `maxLength={LIMITES_ACTIVIDADES.respuestaCodigoMax}`, `accessibilityLabel` "Tu código" con el lenguaje, y los mismos atributos del teclado que T045 (más lo que haya resultado de T047). Cada cambio pasa por `textoTecleado` y el recorte al límite
- [ ] T049 [movil] Crear `src/actividades/RetoCodigo.tsx`, con las mismas reglas que T031 y la estructura de `src/actividades/PreguntaAbierta.tsx`. Al comprobar, `Keyboard.dismiss()`, para que el teclado no tape la solución. Agregar `retoCodigo` a `src/actividades/registro.ts`
- [ ] T050 [movil] Crear `src/componentes/DiagramaCommits.tsx` (docs/diseno.md, sección 4; research.md, punto 3): las props y el aspecto de T030, con el ancho de `onLayout` y `medirGrafo` con `PixelRatio.getFontScale()`. Líneas con `Svg` y `Path` de `react-native-svg` (`pointerEvents="none"`, sin accesibilidad), y cada commit un `Pressable` absoluto de 44 con `accessibilityRole="button"`, `accessibilityLabel={nombreAccesibleCommit(...)}` y `accessibilityState` con `selected` y `disabled`. Si no cabe, un `ScrollView` horizontal
- [ ] T051 [movil] Crear `src/actividades/GrafoCommits.tsx`, con las mismas reglas que T033. Agregar `grafoCommits` a `src/actividades/registro.ts`; aquí `npm run tipos` vuelve a pasar

**Punto de control**: `npm run tipos` y `npm run lint` pasan. Con el backend sembrado y Expo Go en un
teléfono, la parte móvil de cada tabla de [quickstart.md](./quickstart.md), sección 3, funciona.
Conviene repetir de F03 "Teoría" y "Opción múltiple": T043 y T044 tocan lo que ya funcionaba.

---

## Fase 5: Cierre

- [ ] T052 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`, como dice su sección "Al cerrar": el título "Actividad (F03, F05, F11, F12)", las filas de los tres tipos y sus reglas, que las preguntas son diez, que solo queda escuchar y repetir (F14), y la nota de los commits por índice, del más antiguo al más nuevo, sin acomodo guardado. En "Entidades previstas", la fila de los demás tipos queda solo con F14
- [ ] T053 [specs] Integrar "Cambios a la navegación" de [plan.md](./plan.md) a `specs/01-navegacion.md`: en "Salir de una lección", que salir también pide confirmación si el alumno escribió código o un comando, o eligió un commit
- [ ] T054 [specs] `npm run contrato:revisar`: las tres copias coinciden con la oficial
- [ ] T055 [specs] Revisar que `specs/features/F12-actividades-codigo-terminal/spec.md` coincide con lo que se construyó; si algo cambió, actualizarla, junto con lo que T047 haya anotado en `research.md`

---

## Fase 6: Validación manual

Cada criterio se comprueba con [quickstart.md](./quickstart.md), sección 3, y se marca también en
`spec.md`. Antes de los PR, las repeticiones de F03, F05 y F11 de la sección 4.

**El móvil se valida en un teléfono con Expo Go**: el teclado, la puntuación inteligente, la tecla de
enviar y el ancho de 360 son del teléfono real. Si un criterio de móvil se ve en Expo web o en el
simulador, se anota en su línea, como en F11.

- [ ] V01 [backend] Los cuatro cursos de prueba tienen, entre todos, 13 retos de código (3 en C y 10 en CSS), 12 terminales simuladas y 1 grafo de commits.
- [ ] V02 [web, móvil] "Tu primer commit" (Git esencial, 2) muestra, en este orden: teoría, cuatro terminales y clasificar.
- [ ] V03 [web, móvil] "Ramas: trabajar en paralelo" (Git esencial, 4) muestra, en este orden: teoría, terminal, grafo, teoría, terminal y terminal.
- [ ] V04 [web, móvil] "Patrones comunes con Flexbox" (Examen unidad 1, 11) muestra, en este orden: teoría, opción múltiple, reto, reto, ordenar, reto, tarjeta y pregunta abierta.
- [ ] V05 [web, móvil] En "Condicionales y operadores" (Programación en C sencilla, 2), el reto muestra "Escribe una función 'esPar' en C que reciba un entero y devuelva 1 si es par, 0 si no.", la etiqueta "C" y el campo con `int esPar(int n) {`, una línea con dos espacios y `}`. "Comprobar" está deshabilitado.
- [ ] V06 [web, móvil] El panel es oscuro en modo claro y en modo oscuro, con letra monoespaciada y el cursor en verde.
- [ ] V07 [web, móvil] Al escribir en el campo, "Comprobar" se habilita. Si borro lo que escribí y el código queda igual al inicial, se deshabilita.
- [ ] V08 [web, móvil] Al comprobar, mi código queda de solo lectura y aparece "Solución de referencia" con la etiqueta "C" y `return n % 2 == 0;` con su sangría, y "¿La tuviste bien?" con "La tuve bien" y "No la tuve".
- [ ] V09 [web, móvil] Con "La tuve bien", la barra dice "¡Correcto!" y la pregunta cuenta como acertada; con "No la tuve", dice "A repasar" y cuenta como fallada.
- [ ] V10 [web, móvil] En "flex: 1 y el tamaño de los elementos" (Examen unidad 1, 8), el código inicial muestra sus tres bloques, `.layout`, `.sidebar` y `.main`, separados por líneas en blanco, y la etiqueta "CSS".
- [ ] V11 [web, móvil] En "Actividades de prueba", el reto de SQL sin código inicial empieza con el campo vacío y "Comprobar" deshabilitado. Su solución, con una línea `-- Todos los alumnos`, se ve sin colores, igual que las demás líneas.
- [ ] V12 [web, móvil] En "Actividades de prueba", el reto con lenguaje "Otro" no muestra etiqueta.
- [ ] V13 [web, móvil] En "Actividades de prueba", en el reto al límite, una línea más ancha que el panel se lee completa en el campo y en la solución.
- [ ] V14 [web] Con el cursor al final de la segunda línea, Tab mete dos espacios más y Mayús+Tab los quita. Con tres líneas seleccionadas, Tab mete dos espacios al inicio de cada una, y Ctrl+Z (Cmd+Z en Mac) lo deshace.
- [ ] V15 [web] Debajo del campo veo "Tab agrega dos espacios. Para salir del campo, pulsa Esc y luego Tab.". Después de Esc, Tab lleva el foco a lo que sigue y Mayús+Tab a lo anterior. Al volver al campo, Tab mete espacios otra vez.
- [ ] V16 [web] Enter en el campo salta de línea y no comprueba.
- [ ] V17 [web] Después de comprobar, Tab sale del campo y el texto sobre Tab ya no aparece.
- [ ] V18 [móvil] En el campo de código, el teclado no corrige palabras ni pone mayúscula al empezar una línea, `"` y `'` quedan rectas, y `...` se queda como tres puntos.
- [ ] V19 [móvil] Con más de 12 líneas, el campo deja de crecer y se desplaza por dentro, y la línea que escribo sigue a la vista con el teclado abierto.
- [ ] V20 [web, móvil] En "Tu primer commit" (Git esencial, 2), la primera terminal muestra "Estás en una carpeta con un proyecto nuevo. Conviértela en un repositorio Git.", la salida previa `README.md` e `index.html` en dos líneas y, debajo, `~/proyectos/mi-app $` con el cursor. "Comprobar" está deshabilitado.
- [ ] V21 [web, móvil] La terminal es oscura en modo claro y en modo oscuro, con el cursor en verde. Al pulsar en cualquier parte de ella, el cursor queda en la línea del comando (en el móvil, se abre el teclado).
- [ ] V22 [web, móvil] Con el comando vacío o solo con espacios, "Comprobar" está deshabilitado y Enter no hace nada.
- [ ] V23 [web, móvil] Al escribir `git init` y pulsar Enter (en el móvil, la tecla de enviar del teclado), la terminal muestra debajo `Initialized empty Git repository in ~/proyectos/mi-app/.git/` y la barra dice "¡Correcto!". El comando ya no se puede cambiar y el botón dice "Continuar".
- [ ] V24 [web, móvil] `  git   init  ` también es correcto.
- [ ] V25 [web, móvil] `Git init` es incorrecto: la terminal no muestra nada más, y la barra muestra "Respuesta correcta:" con `git init` y, debajo, "El comando que inicializa un repositorio es "git init".".
- [ ] V26 [web, móvil] En la cuarta terminal de esa lección, `git commit -m "Primer commit"` y `git commit -m 'Primer commit'` son correctos. `git commit -m Primer commit` es incorrecto, y la barra muestra `git commit -m "Primer commit"`.
- [ ] V27 [web, móvil] En la segunda terminal de esa lección, al acertar, la salida respeta sus líneas en blanco y la sangría de `README.md` e `index.html`.
- [ ] V28 [web, móvil] En "Remotos: compartir tu trabajo" (Git esencial, 5), al escribir `git clone https://github.com/usuario/mi-app.git` el comando se lee completo mientras lo escribo, y la salida al acertar se lee completa, sin desplazarse hacia los lados.
- [ ] V29 [web, móvil] En "Actividades de prueba", la terminal sin carpeta, salida previa, salida al acertar ni pista muestra solo `$` y el cursor. Al acertar, solo queda el comando y "¡Correcto!"; al fallar, la barra muestra solo el comando esperado.
- [ ] V30 [web, móvil] Al pegar `git init` con un salto de línea al final, no se comprueba: el comando queda en su línea hasta que pulso Enter.
- [ ] V31 [móvil] En la terminal, el teclado no corrige palabras ni pone mayúscula al empezar, y `"` y `'` quedan rectas.
- [ ] V32 [móvil] En "Viajar en el tiempo: historial y diffs" (Git esencial, 3), al escribir `git log --oneline` los dos guiones se quedan como dos guiones, y es correcto.
- [ ] V33 [móvil] Con el teclado abierto, la línea del comando sigue a la vista. Al comprobar, el teclado se cierra.
- [ ] V34 [web, móvil] En "Ramas: trabajar en paralelo" (Git esencial, 4), el grafo muestra "Hiciste dos commits en main (c1, c2). Luego creaste la rama feature en c2 e hiciste ahí un commit más (c3). ¿A qué commit apunta main ahora mismo?", y `c1`, `c2` y `c3` en una fila, de izquierda a derecha, unidos por líneas, con la etiqueta `feature` en `c3` y sin HEAD. "Comprobar" está deshabilitado.
- [ ] V35 [web, móvil] Al pulsar `c3` queda elegido; al pulsar `c2`, la elección pasa a `c2`. "Comprobar" se habilita con el primero.
- [ ] V36 [web, móvil] Con `c2`, al comprobar queda marcado como correcto y la barra dice "¡Correcto!" y, debajo, "Crear y moverte a una rama nueva no mueve main: se queda apuntando a c2, el commit desde el que creaste feature. El nuevo commit c3 solo existe en feature.".
- [ ] V37 [web, móvil] Con `c3`, al comprobar `c3` queda incorrecto y `c2` correcto, y la barra muestra "Respuesta correcta: c2" y la explicación. Ya no puedo elegir otro commit.
- [ ] V38 [web, móvil] En "Actividades de prueba", en el grafo con un merge, `c1`, `c2`, `c3` y `c5` van en la primera fila, con "HEAD → main" en `c5`, y `c4` va en la segunda, debajo de `c3`, con `feature`. `c5` está unido a `c3` y a `c4`.
- [ ] V39 [web, móvil] En "Actividades de prueba", en el grafo de una rama ya borrada, el commit sin rama va en una segunda fila, debajo del commit de la primera fila que está en su misma columna.
- [ ] V40 [web, móvil] En "Actividades de prueba", en el grafo con HEAD en un commit, la etiqueta "HEAD", sin flecha, va en ese commit, a la mitad de la fila.
- [ ] V41 [web, móvil] En "Actividades de prueba", en el grafo sin explicación, la barra muestra solo "¡Correcto!" o "Respuesta correcta: {commit}".
- [ ] V42 [móvil] En un teléfono de 360 px de ancho, el grafo al límite de "Actividades de prueba" (10 commits, 6 columnas y 4 ramas con nombres de 20 caracteres, una con HEAD) cabe sin desplazarse hacia los lados, con los nombres y las etiquetas completos y sin encimarse, y puedo pulsar cada commit sin pulsar el de al lado.
- [ ] V43 [web] En una ventana ancha y en la vista previa, ese grafo cabe en el ancho disponible sin desplazarse hacia los lados.
- [ ] V44 [web] Resuelvo los tres tipos solo con el teclado, hasta "Continuar": en el reto salgo del campo con Esc y Tab; en la terminal escribo y pulso Enter; en el grafo recorro los commits con Tab, de izquierda a derecha y, en la misma columna, de arriba abajo, y elijo con Enter o la barra espaciadora.
- [ ] V45 [web] En el grafo, las teclas 1 a 9 no eligen commits.
- [ ] V46 [web] Al comprobar la terminal o el grafo, y al autoevaluarme en el reto, el foco queda en "Continuar".
- [ ] V47 [web, móvil] Con un lector de pantalla, el campo de código se anuncia como "Tu código" con su lenguaje (y en la web, con el texto sobre Tab), la terminal como "Comando" con su carpeta, y cada commit con su nombre, sus padres, sus ramas y HEAD y si está elegido, correcto o incorrecto.
- [ ] V48 [web, móvil] Lo correcto y lo incorrecto del grafo llevan icono además de color.
- [ ] V49 [web, móvil] En "Tu primer commit" (Git esencial, 2), acertando las cuatro terminales y fallando clasificar, al terminar veo "Acertaste 4 de 5".
- [ ] V50 [web, móvil] Al volver al curso, esa lección muestra "4 de 5 aciertos".
- [ ] V51 [web, móvil] En "Ramas: trabajar en paralelo", en la primera terminal, sin haber escrito nada la X lleva directo al detalle del curso. Después de escribir, pide confirmación, y "Seguir aquí" me deja con lo que escribí. En el grafo, elegir un commit también pide confirmación al salir.
- [ ] V52 [web, móvil] En "Condicionales y operadores", después de escribir en el reto, confirmar la salida y abrir otra vez la lección empieza desde la primera actividad, y el reto tiene otra vez su código inicial.
- [ ] V53 [web] En la paleta, Reto de código, Terminal simulada y Grafo de commits se pueden agregar y no dicen "Próximamente". Escuchar y repetir sigue deshabilitado, con "Próximamente".
- [ ] V54 [web] Al arrastrar o pulsar cada uno de los tres, queda en la secuencia con la marca "Incompleta", seleccionado y con el foco en su primer campo.
- [ ] V55 [web] El bloque de cada uno muestra el inicio de la consigna y, sin ella, "Sin contenido".
- [ ] V56 [web] El reto tiene un selector con "Elige un lenguaje" y, en este orden, C, CSS, HTML, JavaScript, Python, SQL, Bash y Otro. Sin lenguaje, al guardar veo "Elige un lenguaje.". El código inicial y la solución van en letra monoespaciada.
- [ ] V57 [web] En el reto, la terminal y el grafo, sin consigna, al guardar veo "Este campo es obligatorio.". En el reto, también sin solución.
- [ ] V58 [web] La terminal empieza con un comando vacío, con la nota "Es el que ve el alumno como respuesta correcta". Con 1 comando, "Quitar" está deshabilitado; con 10, también "Agregar comando".
- [ ] V59 [web] Con `git init` y `git  init ` como comandos, al guardar el segundo muestra "Este comando está repetido."; `git init` y `Git init` sí se aceptan.
- [ ] V60 [web] Un comando escrito con espacios al inicio y al final se guarda sin ellos.
- [ ] V61 [web] El grafo empieza con dos commits sin nombre: el primero dice "Primer commit: no tiene padre" y el segundo tiene al primero como padre. "Agregar commit" suma uno con el último como padre. Con 2 commits, "Quitar" está deshabilitado; con 10, también "Agregar commit".
- [ ] V62 [web] El selector "Padre" de cada commit solo ofrece los commits de arriba, y muestra "Commit {n}" en uno sin nombre. Al cambiarle el nombre a un commit, los selectores lo muestran y siguen eligiendo el mismo.
- [ ] V63 [web] Un nombre de commit no deja escribir más de 4 caracteres. Dos commits con el mismo nombre muestran, al guardar, "Este nombre ya lo tiene otro commit.".
- [ ] V64 [web] Un segundo padre igual al primero muestra "El segundo padre tiene que ser otro commit.".
- [ ] V65 [web] Al quitar un commit que era padre, commit de una rama y respuesta, al guardar veo "Elige un padre.", "Elige un commit." y "Elige la respuesta.". Si era segundo padre, vuelve a "Ninguno", y si HEAD apuntaba a él, a "Sin HEAD".
- [ ] V66 [web] Al quitar el primer commit, el que seguía dice "Primer commit: no tiene padre".
- [ ] V67 [web] Con 7 commits seguidos, al guardar veo "El grafo puede tener hasta 6 commits seguidos de izquierda a derecha. Pon alguno en paralelo o quita alguno.". Al cambiar el padre del último para que vaya en paralelo, se guarda.
- [ ] V68 [web] Con 4 ramas, "Agregar rama" está deshabilitado. Dos ramas iguales muestran "Esta rama está repetida."; una llamada `HEAD`, "Una rama no se puede llamar HEAD."; y una sin commit, "Elige un commit.".
- [ ] V69 [web] El selector de HEAD muestra "Sin HEAD", las ramas y los commits. Al quitar la rama a la que apunta, vuelve a "Sin HEAD".
- [ ] V70 [web] Cada campo no deja escribir más del límite de "Datos de entrada", y los formularios muestran las ayudas de "Formulario de cada tipo".
- [ ] V71 [web] Una actividad completa de cada tipo se ve en la vista previa como en el reproductor y se responde igual.
- [ ] V72 [web] En la vista previa, Tab en el campo de código mete espacios, Enter en la terminal comprueba solo esa actividad, y pulsar un commit no selecciona ningún bloque.
- [ ] V73 [web] Al cambiar la actividad en el inspector, la vista previa vuelve a empezar y el foco se queda en el campo. "Reiniciar" la devuelve al principio.
- [ ] V74 [web] Una actividad incompleta de estos tipos, y un grafo de más de 6 columnas, muestran "Completa esta actividad para ver su vista previa.".
- [ ] V75 [web] "Probar lección" recorre una lección con los tres tipos, y al terminar veo "Acertaste {aciertos} de 3".
- [ ] V76 [web] Una lección con los tres tipos se guarda y, al recargar, sigue igual, con sus datos y en su orden. El código inicial y la solución conservan su sangría y sus líneas en blanco. Un campo opcional vacío no se guarda.
- [ ] V77 [web, móvil] Armo una lección con los tres tipos, un administrador publica el curso, y un alumno la cursa de principio a fin: en la web y en el móvil se ve igual que en la vista previa y su resultado cuenta las tres preguntas.
- [ ] V78 [backend] Guardar, sin pasar por un cliente, un reto sin consigna, sin solución o con un lenguaje que no está en la lista, se rechaza y la lección queda como estaba.
- [ ] V79 [backend] Guardar una terminal sin comandos, con 11, con un comando repetido (también si solo cambian los espacios o las comillas tipográficas) o con un salto de línea en la carpeta o en un comando, se rechaza y la lección queda como estaba.
- [ ] V80 [backend] Guardar un grafo con 1 o con 11 commits, con un nombre de commit repetido o de 5 caracteres, con el primer commit con padre, con otro sin padre, con tres padres o con dos iguales, con un padre que no existe o que está más abajo en la lista, o con más de 6 columnas, se rechaza y la lección queda como estaba.
- [ ] V81 [backend] Guardar un grafo con 5 ramas, con una rama repetida, llamada `HEAD` o que apunta a un commit que no existe, con HEAD apuntando a algo que no existe, o con una respuesta que no es uno de sus commits, se rechaza y la lección queda como estaba.
- [ ] V82 [backend] Guardar un texto más largo que su límite en cualquiera de los tres tipos, o un campo que el tipo no tiene, se rechaza y la lección queda como estaba.
- [ ] V83 [backend] Guardar una actividad de escuchar y repetir se rechaza y la lección queda como estaba.
- [ ] V84 [web, móvil] En "Actividades de prueba", la lección con `<b>hola</b>` y `<script>` en los textos de una actividad de cada tipo (también un commit llamado `<b>` y una rama `<script>`) los muestra tal cual, también en la barra inferior, sin negritas y sin ejecutar nada.
- [ ] V85 [web] Con esos textos, el formulario, el bloque y la vista previa los muestran tal cual.
- [ ] V86 [web, móvil] Las actividades de "Actividades de prueba" con los límites más altos (código y solución de 2000 caracteres, 10 comandos y salidas de 2000, y el grafo al límite) se pueden responder de principio a fin, con los textos completos.

---

## Dependencias

- **Fase 1** va antes que todo. T001 primero. T002 → T009 y T006–T008 → T009 (cada copia se commitea en la rama de F12 de su repo). T003 → T004 → T005 (mismo archivo), las tres antes de cualquier tarea de interfaz.
- **Backend** (fase 2):
  - T010 → T011 → T012 → T013 → T014 (mismo archivo);
  - T015 en paralelo; T016 cuando se quiera, pero `bd:sembrar` necesita T014;
  - T017 → T018 → T019 (mismo archivo); T017 necesita T014.
- **Web** (fase 3), cuando el backend pasa su punto de control:
  - T020, T021, T022 y T024 en paralelo; T022 → T023 (mismo archivo);
  - T025, T026 y T027 en paralelo; T025 necesita T020;
  - T028 necesita T020, T021 y T025; T029 necesita T020, T021 y T024; T030 necesita T023 y T024;
  - T031 necesita T025, T026 y T028; T032, T026 y T029; T033, T026 y T030; T034 necesita T031 a T033;
  - T035 a T037 en paralelo; T036 necesita T021 y T027; T037 necesita T022; T038 necesita T027 y T037;
  - T039 necesita T035, T036 y T038.
- **Móvil** (fase 4), en paralelo con la web cuando el backend pasa su punto de control:
  - T040 a T044 en paralelo; T041 necesita T021 y T042 necesita T023 si se copian de ahí;
  - T045 necesita T040 y T041; T046 necesita T044 y T045; T047 necesita T046;
  - T048 necesita T043 y T047; T049 necesita T048; T050 necesita T042; T051 necesita T050;
  - T046, T049 y T051 van una tras otra porque editan `registro.ts`.
- **Cierre y validación** al final. Los criterios `[backend]` (V01 y V78 a V83) se pueden validar en cuanto termina la fase 2.

## Paralelo, por ejemplo

```text
Preparación: T003→T004→T005 (diseño) ‖ T002→T009 (contrato) ‖ T006 ‖ T007 ‖ T008
Backend:     T010→T011→T012→T013→T014→T017→T018→T019 ‖ T015 ‖ T016
Web, base:   T020 ‖ T021 ‖ T022→T023 ‖ T024 ‖ T025 ‖ T026 ‖ T027
Web, piezas: T028 ‖ T029 ‖ T030, y luego T031 ‖ T032 ‖ T033, y T034
Web, editor: T035 ‖ T036 ‖ T037→T038, y luego T039
Móvil, base: T040 ‖ T041 ‖ T042 ‖ T043 ‖ T044
Móvil:       T045→T046→T047, luego T048→T049 ‖ T050, y T051
```

## Estrategia

1. Contrato y diseño en `brote_specs` (T001 a T005), porque todo lo demás los usa. Las ramas de
   código salen de la rama de F11 (T006), y se ponen al día con `dev` cuando F11 se fusione.
2. Backend completo y probado con curl (punto de control de la fase 2): ya cubre los siete
   criterios `[backend]` y confirma que las 26 actividades del prototipo cumplen las reglas.
3. **Lo más incierto es el teclado del teléfono** (research.md, punto 7). T045 a T047 lo despejan
   con la terminal antes de hacer el reto y el grafo en el móvil: conviene adelantarlos, aunque la
   web vaya después. T041 necesita T021, que es corto.
4. **Lo más largo es el grafo**: `acomodarGrafo` y `medirGrafo` (T022 y T023) se escriben una vez
   y se copian al móvil. Comprobarlos temprano con los grafos de quickstart.md, sección 1.1
   (columnas y filas de la tabla del grafo al límite), antes de dibujar.
5. En la web, primero lo que puede romper lo de F03, F05 y F11 (T025 a T027) y repetir esas
   comprobaciones; después cursar y editar.
6. Cierre de documentos y validación manual completa (V01 a V86) antes de los PR a `dev` de cada
   repo, con la spec enlazada y los criterios cubiertos.
