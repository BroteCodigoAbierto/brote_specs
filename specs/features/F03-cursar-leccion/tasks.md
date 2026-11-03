---
description: "Lista de tareas de F03 Cursar una lección"
---

# Tareas: F03 Cursar una lección

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F03-cursar-leccion`, creada desde `dev` en cada repo afectado

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase).
- Los límites, la marca de espacio y el mensaje del 404 **siempre** salen del
  contrato (`LIMITES_ACTIVIDADES`, `MARCA_ESPACIO`, `MENSAJES_LECCION`);
  ninguna tarea los escribe a mano.
- Ningún texto de una actividad se inserta como HTML: en la web nada de
  `dangerouslySetInnerHTML` (principio III).
- Toda pieza de interfaz usa los tokens y componentes de `docs/diseno.md`; los
  nuevos se agregan ahí primero (T002 y T003) y en los dos clientes con el
  mismo nombre y las mismas props.
- Textos fijos de la interfaz, iguales en web y móvil: "Comprobar",
  "Continuar", "¡Correcto!", "Respuesta correcta: …", "A repasar", "Toca la
  tarjeta para voltearla", "Escribe tu respuesta…", "Solución de referencia",
  "¿La tuviste bien?", "La tuve bien", "No la tuve", "¡Lección completada!",
  "Acertaste {aciertos} de {preguntas}", "Volver al curso", "Esta lección
  todavía no tiene actividades.", "Ver cursos", "¿Salir de la lección?",
  "Perderás tu avance en esta lección.", "Salir", "Seguir aquí" y, como
  etiqueta accesible de la X, "Salir de la lección".

---

## Fase 1: Preparación

- [X] T001 [specs] Agregar al final de `contrato/contrato.ts` el bloque "Lecciones y actividades (F03)" de [contracts/contrato.md](./contracts/contrato.md), copiado tal cual: `ActividadTeoria`, `ActividadTarjeta`, `OpcionRespuesta`, `ActividadOpcionMultiple`, `EspacioRespuesta`, `ActividadCompletarEspacios`, `ActividadPreguntaAbierta`, `Actividad`, `TipoActividad`, `DetalleLeccion`, `RespuestaLeccion`, `MARCA_ESPACIO`, `LIMITES_ACTIVIDADES` y `MENSAJES_LECCION`. Subir `contrato/VERSION` de `0.3.0` a `0.4.0`
- [X] T002 [specs] En `docs/diseno.md`, sección 2, agregar los tokens de plan.md ("Lo que se agrega a docs/diseno.md"):
  - 2.1 Color: `progresoFin` `#84CC16` (claro y oscuro) y los de código, iguales en claro y oscuro: `codigoFondo` `#16142E`, `codigoTexto` `#ECEBFA`, `codigoAgregado` `#BEF264` con `codigoAgregadoFondo` `rgba(163,230,53,0.16)`, `codigoEliminado` `#FDA4AF` con `codigoEliminadoFondo` `rgba(255,107,133,0.16)` y `codigoEncabezado` `#A29DFF`;
  - 2.2 Tipografía: `codigo` 14 / 22, peso 400, monoespaciada (web `--fuente-codigo`; móvil `fuentes.codigo`: Menlo en iOS, `monospace` en Android);
  - 2.3 Medidas: `anchoLeccion` 680 px (contenido del reproductor en la web).

  Comprobar con una calculadora de contraste que `codigoTexto`, `codigoAgregado`, `codigoEliminado` y `codigoEncabezado` llegan a 4.5:1 sobre `codigoFondo` (y los dos de diff sobre su fondo encima de `codigoFondo`); si alguno no llega, ajustarlo aquí antes de usarlo
- [X] T003 [specs] En `docs/diseno.md`:
  - sección 4, agregar a la tabla `BarraProgreso`, `BarraRespuesta`, `OpcionRespuesta`, `BloqueCodigo`, `TarjetaVolteable`, `CampoEspacio`, `Dialogo` (web; en el móvil, `Alert.alert`) y `ResultadoLeccion`, con las props y notas de plan.md;
  - sección 6, agregar los patrones: tarjeta de memoria (indicación con `RotateCw`, gira en `lento`, "Continuar" al primer giro), completar espacios (campos en línea, respuesta esperada al lado de cada incorrecto), pregunta abierta ("SOLUCIÓN DE REFERENCIA" en `seccion` sobre `Superficie` `suave`, "La tuve bien" / "No la tuve" como `Boton` `secundario`), bloque de código con diff (research.md, punto 13), confirmación de salida (research.md, puntos 8 y 9) y el teclado de la web (research.md, punto 10).
- [X] T004 [back] En `brote_backend_express`: `git switch dev && git pull --ff-only` y crear `feature/F03-cursar-leccion` desde `dev`
- [X] T005 [P] [web] Igual que T004 en `brote_web_react`
- [X] T006 [P] [movil] Igual que T004 en `brote_mobile_expo`
- [X] T007 [specs] Copiar el contrato 0.4.0 a los tres repos: `npm run contrato:copiar` en brote_specs. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo

---

## Fase 2: Backend (brote_backend_express)

- [ ] T008 [back] En `prisma/schema.prisma`, en el modelo `Leccion`, agregar `actividades Json @default("[]")` con el comentario `// F03: lista de Actividad del contrato, en orden; solo se escribe después de validarActividades`. Actualizar el comentario del bloque "Cursos (F02)" (las actividades ya llegaron). Generar la migración `prisma/migrations/<fecha>_f03_actividades/migration.sql` con `npm run bd:migrar -- --create-only --name f03_actividades` (o con `prisma migrate diff` si no se puede crear la *shadow database*, como en F01). Debe quedar `ALTER TABLE "leccion" ADD COLUMN "actividades" JSONB NOT NULL DEFAULT '[]';`. Aplicarla y correr `npm run bd:generar`
- [ ] T009 [P] [back] Crear `src/validacion/actividades.ts` con `validarActividades(valor: unknown): Actividad[]` (research.md, punto 5; data-model.md). Lanza `new Error("actividad N (tipo): ...")` (N desde 1) en el primer problema:
  - `valor` es un arreglo; cada elemento, un objeto con `tipo` en `teoria | tarjeta | opcionMultiple | completarEspacios | preguntaAbierta`;
  - ayudantes: `textoObligatorio(objeto, campo)` (texto que, recortado, tiene al menos un carácter), `textoOpcional` (ausente o como el anterior) y `soloCampos(objeto, permitidos)` (rechaza cualquier campo que el tipo no tiene);
  - `teoria`: `titulo` opcional, `texto` obligatorio, `codigo` opcional, `puntosClave` opcional ("si está, al menos uno; cada uno no vacío");
  - `tarjeta`: `frente` y `reverso` obligatorios;
  - `opcionMultiple`: `pregunta` obligatoria, `codigo` opcional, `opciones` con entre `LIMITES_ACTIVIDADES.opcionesMin` y `opcionesMax` elementos, cada uno exactamente `{ texto }` o `{ simbolo }` con texto no vacío; `correcta` entero "entre 0 y `opciones.length - 1`";
  - `completarEspacios`: `texto` con al menos una `MARCA_ESPACIO`; `espacios` con "tantos como marcas en `texto`" (`texto.split(MARCA_ESPACIO).length - 1`); cada espacio exactamente `{ aceptadas }`, con al menos una aceptada, "cada una no vacía y de hasta 100 caracteres" (`Array.from(a).length <= LIMITES_ACTIVIDADES.respuestaEspacioMax`);
  - `preguntaAbierta`: `pregunta` y `solucion` obligatorias.

  Devuelve el mismo arreglo, ya tipado
- [ ] T010 [back] Crear `src/servicios/lecciones.ts` con `traerLeccionPublicada(idCurso: string, idLeccion: string): Promise<DetalleLeccion>`:
  - `bd.leccion.findFirst({ where: { id: idLeccion, idCurso, curso: { publicado: true } }, select: { id: true, titulo: true, posicion: true, actividades: true } })`;
  - si no hay, `throw new ErrorApi(404, MENSAJES_LECCION.leccionNoDisponible)`, sea que no exista, que sea de otro curso o que el curso no esté publicado;
  - `aDetalleLeccion(leccion)`: `{ id, titulo, posicion, actividades: leccion.actividades as unknown as Actividad[] }`, con un comentario de que ya se validaron al guardarse.
- [ ] T011 [back] En `src/rutas/cursos.ts`, agregar `rutasCursos.get<{ idCurso: string; idLeccion: string }>("/:idCurso/lecciones/:idLeccion", requerirSesion, ...)`, que responde `200` con `RespuestaLeccion` (`{ leccion }`). Sin validar los parámetros; la sesión va primero (401 aunque los identificadores no existan)
- [ ] T012 [P] [back] Crear `scripts/actividades-prototipo.ts` con `export const ACTIVIDADES_PROTOTIPO: Record<string, Actividad[][]>`, por título del curso ("Git esencial", "Japonés sencillo", "Programación en C sencilla", "Examen unidad 1") y una lista por lección, en el orden de su `manifest.json`. Se genera **una vez** con un script desechable en la carpeta temporal (no se versiona) que lee `../brote_specs/referencia/cursos-prototipo/<carpeta>/lessons/*.json` en el orden del manifest y aplica la tabla de research.md, punto 6:
  - solo `content`, `flashcard`, `multiple_choice`, `fill_blank` y `open_question`, en su orden; los demás tipos y `glossary` se descartan;
  - `content` → `teoria` (`title` → `titulo`, `body` → `texto`, `code` → `codigo`, `bullets` → `puntosClave`); `flashcard` → `tarjeta` (`front` → `frente`, `back` → `reverso`); `multiple_choice` → `opcionMultiple` (`prompt` → `pregunta`, `code` → `codigo`, opción texto → `{ texto }`, `{ icon }` → `{ simbolo }`, `answer` → `correcta`); `fill_blank` → `completarEspacios` (`text` → `texto`, `blanks[].accepted` → `espacios[].aceptadas`); `open_question` → `preguntaAbierta` (`prompt` → `pregunta`, `solution` → `solucion`);
  - los textos se copian sin cambios.

  Formatear con Prettier. Encabezado: de dónde sale y que lo regenera la tarea T012 de F03 si cambia `referencia/`. Comprobar el total: 93 actividades (26 `teoria`, 9 `tarjeta`, 28 `opcionMultiple`, 13 `completarEspacios`, 17 `preguntaAbierta`)
- [ ] T013 [back] En `scripts/datos-prueba.ts`:
  - `type LeccionPrueba = { titulo: string; actividades: Actividad[] }` y `CursoPrueba.lecciones: LeccionPrueba[]`; `leccionesNumeradas(n)` devuelve lecciones con `actividades: []`;
  - los cuatro cursos del prototipo toman las actividades de `ACTIVIDADES_PROTOTIPO[titulo][i]`;
  - nuevo curso de `AUTOR`, `publicado: false`: "Actividades de prueba", descripción "Curso para comprobar a mano los cinco tipos de actividad." (sin las palabras de los criterios de búsqueda de F02), con las lecciones de quickstart.md, sección 1.1:
    1. "Respuestas con acentos": `{ tipo: "completarEspacios", texto: "Sinónimo de pieza musical: ___", espacios: [{ aceptadas: ["canción", "tema"] }] }`;
    2. "Textos con etiquetas": una actividad de cada tipo con `<b>hola</b>` y `<script>alert(1)</script>` en **todos** sus textos (título, texto, código, puntos clave, frente, reverso, pregunta, opciones, texto con espacios —con su `___`— y solución);
    3. "Lección sin actividades": `[]`.
  - actualizar el comentario de arriba (ahora también hay actividades).
- [ ] T014 [back] En `scripts/sembrar-cursos.ts`, **antes** de la transacción, pasar las actividades de cada lección por `validarActividades`; si falla, terminar con un error que diga el curso, la lección y el mensaje, sin tocar la base. En la transacción, crear cada lección con `actividades`. Imprimir también cuántas actividades se crearon. Actualizar el comentario de uso (F02 y F03)
- [ ] T015 [P] [back] Actualizar `CLAUDE.md`: en la estructura, `scripts/actividades-prototipo.ts` (actividades del prototipo ya convertidas al contrato, F03)
- [ ] T016 [back] `npm run tipos` y `npm run lint` sin errores

**Punto de control**: después de `npm run bd:sembrar`, quickstart.md sección 2 (B1 a B6) da exactamente las respuestas de [contracts/api.md](./contracts/api.md). V41 ya se puede validar.

---

## Fase 3: Web (brote_web_react)

- [ ] T017 [P] [web] En `src/estilos/tokens.css`, los tokens de T002 con el mismo nombre en `kebab-case`: `--color-progreso-fin`, `--color-codigo-fondo`, `--color-codigo-texto`, `--color-codigo-agregado`, `--color-codigo-agregado-fondo`, `--color-codigo-eliminado`, `--color-codigo-eliminado-fondo`, `--color-codigo-encabezado` (iguales en claro y oscuro), `--texto-codigo: 400 0.875rem/1.375rem var(--fuente-codigo)` y `--ancho-leccion: 680px` (docs/diseno.md, sección 2)
- [ ] T018 [P] [web] En `src/componentes/Boton/Boton.tsx` y `.module.css`, agregar la prop `deshabilitado?: boolean` (como en el móvil): `disabled={deshabilitado || enviando}` y el estilo de deshabilitado (opacidad 0.5, sin hover ni presión, `cursor: not-allowed`)
- [ ] T019 [P] [web] Crear `src/servicios/lecciones.ts` con `traerLeccion(idCurso, idLeccion)`: `pedir<RespuestaLeccion>(`/cursos/${encodeURIComponent(idCurso)}/lecciones/${encodeURIComponent(idLeccion)}`)`. Para errores se reusan `esNoDisponible` y `leerErrorDeCarga` de `servicios/cursos.ts`
- [ ] T020 [P] [web] Crear `src/utilidades/actividades.ts` (research.md, puntos 3, 4, 12 y 13), con un comentario de que el móvil tiene las mismas funciones:
  - `normalizarRespuesta(texto)`: `normalize("NFD")`, quitar `/\p{M}/gu`, `toLocaleLowerCase("es")`, `trim()` y `replace(/\s+/g, " ")`;
  - `esAceptada(escrito, espacio: EspacioRespuesta)`: alguna aceptada con la misma normalización;
  - `mezclar<T>(lista): T[]`: copia mezclada con Fisher-Yates;
  - `partirEnEspacios(texto): string[]`: `texto.split(MARCA_ESPACIO)` (n marcas → n + 1 trozos);
  - `textoConRespuestas(actividad)`: el texto con cada marca reemplazada por la primera aceptada de su espacio;
  - `partirParrafos(texto)`: `texto.split(/\n\s*\n/)` sin los vacíos;
  - `tipoLineaCodigo(linea): "agregada" | "eliminada" | "encabezado" | "normal"`: `/^\+(?!\+\+)/`, `/^-(?!--)/`, `/^@@/`;
  - `textoOpcion(opcion: OpcionRespuesta)`: el texto o el símbolo.
- [ ] T021 [web] Crear `src/componentes/BarraProgreso/BarraProgreso.tsx` y `.module.css` (docs/diseno.md, secciones 4 y 6): props `actual` y `total`; barra de 10 px, radio `pildora`, fondo `borde`, relleno `brote` → `progresoFin` con ancho `actual / total` que cambia con transición `medio` (sin transición con `prefers-reduced-motion`); `role="progressbar"`, `aria-valuemin={0}`, `aria-valuemax={total}`, `aria-valuenow={actual}` y `aria-valuetext="Actividad {actual + 1} de {total}"` (o "Lección completada" cuando `actual === total`)
- [ ] T022 [web] Crear `src/componentes/BarraRespuesta/BarraRespuesta.tsx` y `.module.css` (docs/diseno.md, sección 6):
  - props `estado: "neutro" | "correcto" | "incorrecto"`, `titulo?`, `detalle?`, `textoBoton`, `deshabilitado?` y `alPulsar`;
  - `Superficie` fija abajo (dentro de `anchoLeccion`); con `correcto`, fondo `broteSuave`, `titulo` en `broteFuerte` con `CircleCheck`; con `incorrecto`, fondo `errorSuave`, `titulo` en `error` con `CircleX`; `detalle` debajo en `cuerpo`; la zona del mensaje con `aria-live="polite"`;
  - `Boton` primario a ancho completo con `textoBoton` y `deshabilitado`;
  - cuando `estado` pasa de `neutro` a otro, el foco va al botón;
  - Enter en `document` pulsa el botón si está habilitado, salvo con el foco en un `<textarea>`, un `<button>` o un enlace (research.md, punto 10).
- [ ] T023 [P] [web] Crear `src/componentes/OpcionRespuesta/OpcionRespuesta.tsx` y `.module.css` (docs/diseno.md, sección 6, "Opciones"): un `<button role="radio" aria-checked>` con props `estado: "normal" | "seleccionada" | "correcta" | "incorrecta"`, `texto` o `simbolo`, `numero`, `deshabilitada` y `alElegir`. Mínimo 56 px de alto, borde de 2 px y los colores de cada estado; `CircleCheck` en correcta y `CircleX` en incorrecta, con la sacudida horizontal de 6 px (`@keyframes`, quitada con `prefers-reduced-motion`). Con `simbolo`, mosaico cuadrado con el símbolo en `display`. `numero` se ve como una pequeña marca de la tecla
- [ ] T024 [web] Crear `src/componentes/BloqueCodigo/BloqueCodigo.tsx` y `.module.css` (research.md, punto 13): `<pre>` con fondo `codigoFondo`, `--texto-codigo`, radio `medio` y `overflow-x: auto`; una fila (`<span>` con `display: block`) por línea de `codigo.split("\n")`, con clase según `tipoLineaCodigo` (agregada, eliminada, encabezado). Cada línea se pone como texto (`{linea}`); una línea vacía lleva un espacio para conservar su alto
- [ ] T025 [P] [web] Crear `src/componentes/TarjetaVolteable/TarjetaVolteable.tsx` y `.module.css` (docs/diseno.md, sección 6, "Tarjeta de memoria"): props `frente`, `reverso`, `volteada` y `alVoltear`. Un `<button>` (Enter y espacio lo activan solos) con dos caras de `Superficie` elevada de al menos 200 px de alto, texto `titulo2` centrado; gira con `transform: rotateY(180deg)`, `backface-visibility: hidden` y transición `lento`; con `prefers-reduced-motion`, cambia de cara sin girar. `aria-label` "Tarjeta, frente: {frente}" o "Tarjeta, reverso: {reverso}"; el texto visible respeta saltos de línea (`white-space: pre-line`)
- [ ] T026 [P] [web] Crear `src/componentes/CampoEspacio/CampoEspacio.tsx` y `.module.css` (docs/diseno.md, sección 6, "Completar espacios"): `<input>` en línea con props `valor`, `alCambiar`, `estado: "normal" | "correcto" | "incorrecto"`, `esperada?`, `etiqueta` (`aria-label`, p. ej. "Espacio 1 de 2") y `deshabilitado`; `maxLength={LIMITES_ACTIVIDADES.respuestaEspacioMax}`, `autoComplete="off"`, `spellCheck={false}`, `size` igual al largo de lo escrito (mínimo 4). Bordes y fondos como las opciones; con `esperada`, la muestra a su lado en `nota` `broteFuerte`
- [ ] T027 [P] [web] Crear `src/componentes/Dialogo/Dialogo.tsx` y `.module.css` (research.md, punto 8): props `abierto`, `titulo`, `texto`, `textoConfirmar`, `textoCancelar`, `alConfirmar` y `alCancelar`. Un `<dialog>` que llama a `showModal()` / `close()` según `abierto`; Esc (evento `cancel`) llama a `alCancelar`. `Superficie` sólida, radio `enorme`, `titulo` en `titulo2` (`aria-labelledby`), `texto` en `cuerpo` (`aria-describedby`) y dos `Boton`: `textoCancelar` `secundario` (con el foco al abrir) y `textoConfirmar` `peligro`. Fondo de atrás con `::backdrop` semitransparente
- [ ] T028 [P] [web] Crear `src/componentes/ResultadoLeccion/ResultadoLeccion.tsx` y `.module.css` (docs/diseno.md, sección 6, "Fin de lección"): props `titulo`, `aciertos`, `preguntas` y `alVolver`. Icono `PartyPopper` en un círculo `broteSuave`; "¡Lección completada!" en `display` (con el foco al aparecer); `titulo` en `titulo3`; si `preguntas > 0`, `Insignia` `brote` con "Acertaste {aciertos} de {preguntas}"; `Boton` primario "Volver al curso". Celebración: el icono crece con un rebote en `lento` y la insignia aparece después; sin animación con `prefers-reduced-motion`. Sin sonido
- [ ] T029 [web] Crear `src/actividades/tipos.ts` (carpeta nueva) con `ResultadoActividad = "acierto" | "fallo" | "sinCalificar"` y `PropsActividad<T extends TipoActividad>` (`actividad: Extract<Actividad, { tipo: T }>`, `alInteractuar: () => void`, `alTerminar: (resultado: ResultadoActividad) => void`), como en research.md, punto 7
- [ ] T030 [web] Crear `src/actividades/Teoria/Teoria.tsx` y `.module.css`: en `Superficie`, el `titulo` (si hay) en `h2` `titulo2` con `tabIndex={-1}` y el foco al montar; cada párrafo de `partirParrafos(texto)` en un `<p>` con `white-space: pre-line`; `BloqueCodigo` si hay `codigo`; `puntosClave` como `<ul>` con un `Check` `brote` por punto. `BarraRespuesta` `neutro` con "Continuar" habilitado → `alTerminar("sinCalificar")`
- [ ] T031 [web] Crear `src/actividades/TarjetaMemoria/TarjetaMemoria.tsx` y `.module.css`: `TarjetaVolteable` con estado `volteada` y `yaVolteada`; al primer giro, `alInteractuar()`. Debajo, "Toca la tarjeta para voltearla" en `nota` `textoSuave` con `RotateCw` (se oculta después del primer giro). `BarraRespuesta` con "Continuar" deshabilitado hasta `yaVolteada` → `alTerminar("sinCalificar")`
- [ ] T032 [web] Crear `src/actividades/OpcionMultiple/OpcionMultiple.tsx` y `.module.css`:
  - `pregunta` en `h2` `titulo2` (foco al montar); `BloqueCodigo` si hay `codigo`;
  - `useState(() => mezclar(opciones.map((opcion, indice) => ({ opcion, indice }))))`, para mezclar una sola vez al montar;
  - un `role="radiogroup"` con una `OpcionRespuesta` por opción (`numero` = lugar en pantalla); si alguna es `simbolo`, rejilla de mosaicos;
  - elegir guarda el índice original y llama a `alInteractuar()`; se puede cambiar hasta comprobar;
  - teclas 1 a 9 en `document` eligen la opción de ese lugar mientras no se haya comprobado (se ignoran con el foco en un campo de texto);
  - `BarraRespuesta`: "Comprobar", deshabilitado sin elección. Al comprobar, la correcta en `correcta`, la elegida (si es otra) en `incorrecta`, todas deshabilitadas, y la barra con "¡Correcto!" o "Respuesta correcta: {textoOpcion(correcta)}" en `incorrecto`; el botón pasa a "Continuar" → `alTerminar("acierto" | "fallo")`.
- [ ] T033 [web] Crear `src/actividades/CompletarEspacios/CompletarEspacios.tsx` y `.module.css` (research.md, punto 12):
  - un `<form>` (Enter en cualquier campo lo envía = "Comprobar"); el texto en un elemento con `white-space: pre-wrap`, hecho de los trozos de `partirEnEspacios(texto)` con un `CampoEspacio` entre cada dos (`etiqueta` "Espacio {n} de {total}"; foco al primero al montar);
  - escribir llama a `alInteractuar()`;
  - "Comprobar" deshabilitado mientras algún espacio, recortado, esté vacío;
  - al comprobar, cada espacio `correcto` o `incorrecto` con `esAceptada`, y los incorrectos con `esperada` = su primera aceptada; campos deshabilitados. `BarraRespuesta`: "¡Correcto!" si todos lo son; si no, `incorrecto` con "Respuesta correcta:" y `textoConRespuestas(actividad)` en `detalle` (con `white-space: pre-wrap`). "Continuar" → `alTerminar("acierto")` solo si todos son correctos; si no, `"fallo"`.
- [ ] T034 [web] Crear `src/actividades/PreguntaAbierta/PreguntaAbierta.tsx` y `.module.css` (docs/diseno.md, sección 6, "Pregunta abierta"):
  - `pregunta` en `h2` `titulo2` (foco al montar); `<textarea>` con el aspecto de `CampoTexto`, `placeholder="Escribe tu respuesta…"`, `aria-label` igual a la pregunta y `maxLength={LIMITES_ACTIVIDADES.respuestaAbiertaMax}`; escribir llama a `alInteractuar()`;
  - "Comprobar" deshabilitado mientras la respuesta, recortada, esté vacía;
  - al comprobar, el `<textarea>` queda `readOnly`; debajo, en `Superficie` `suave`, "SOLUCIÓN DE REFERENCIA" (`seccion`) y la `solucion` (`white-space: pre-line`); luego "¿La tuviste bien?" con "La tuve bien" y "No la tuve" (`Boton` `secundario`). La `BarraRespuesta` queda con su botón deshabilitado hasta elegir;
  - al elegir, se ocultan los dos botones y la barra dice "¡Correcto!" (`correcto`) o "A repasar" (`incorrecto`); "Continuar" → `alTerminar("acierto" | "fallo")`.
- [ ] T035 [web] Crear `src/actividades/registro.ts`: `registroActividades` con el tipo `{ [T in TipoActividad]: ComponentType<PropsActividad<T>> }` y las cinco entradas (`teoria: Teoria`, `tarjeta: TarjetaMemoria`, `opcionMultiple: OpcionMultiple`, `completarEspacios: CompletarEspacios`, `preguntaAbierta: PreguntaAbierta`), y `actividadesConocidas(actividades)`, que filtra las de un `tipo` sin componente (research.md, punto 7). Comentario: agregar un tipo es su componente y una línea aquí
- [ ] T036 [P] [web] Crear `src/hooks/useReproductor.ts` con `useReducer`:
  - estado `{ indice: number; resultados: ResultadoActividad[]; hizoAlgo: boolean }`, empezando en `{ 0, [], false }`;
  - acciones `interactuar` (pone `hizoAlgo`) y `terminarActividad(resultado)` (agrega el resultado, avanza `indice` y pone `hizoAlgo`);
  - devuelve `{ indice, total, terminada: indice >= total, hizoAlgo, preguntas, aciertos, interactuar, terminarActividad }`, con `preguntas` = resultados distintos de `"sinCalificar"` y `aciertos` = `"acierto"`.
- [ ] T037 [web] Crear `src/actividades/ReproductorLeccion/ReproductorLeccion.tsx` y `.module.css` (docs/diseno.md, sección 6, "Pantalla de lección"): props `actividades` (ya filtradas), el resultado de `useReproductor` y `alSalir`. Barra superior: `Boton` `fantasma` chico con `X` y la etiqueta "Salir de la lección" → `alSalir`, y `BarraProgreso` (`actual = indice`, `total`). Debajo, el componente de `registroActividades[actividad.tipo]` de la actividad actual, con `key={indice}`, `alInteractuar` y `alTerminar`. Contenido centrado a `--ancho-leccion`, con espacio abajo para la `BarraRespuesta` fija
- [ ] T038 [web] Crear `src/componentes/ZonaConSesion/ZonaConSesion.tsx`: `<CatalogoProvider><Outlet /></CatalogoProvider>` y `<ScrollRestoration />`. Quitar los dos de `src/componentes/Layout/Layout.tsx` (y actualizar su comentario). En `src/rutas.tsx`, `ZonaConSesion` cuelga de `RutaProtegida` y de él cuelgan el `Layout` (con `/`, `/cursos/:idCurso` y `*`, sin cambios) y, fuera del `Layout`, `/cursos/:idCurso/lecciones/:idLeccion` → `Leccion` (research.md, punto 8). Actualizar el comentario de `rutas.tsx`
- [ ] T039 [web] Crear `src/paginas/Leccion/Leccion.tsx` y `.module.css` (docs/diseno.md, secciones 5 y 6):
  - `useParams` (`idCurso`, `idLeccion`) y `usePeticion(useCallback(() => traerLeccion(idCurso, idLeccion), [idCurso, idLeccion]))`;
  - `salir()`: `navegar(-1)` si `ubicacion.key !== "default"`; si no, `navegar(`/cursos/${idCurso}`, { replace: true })`;
  - estados, todos con la X arriba: cargando → `IndicadorCarga`; `esNoDisponible` → `EstadoVacio` con `MENSAJES_LECCION.leccionNoDisponible` (`anunciar`) y un `Link` "Ver cursos" a `/`; otro error → `ErrorCarga` con `leerErrorDeCarga` y "Reintentar"; `actividadesConocidas(...)` vacía → `EstadoVacio` "Esta lección todavía no tiene actividades." con `Boton` "Volver al curso" → `salir`;
  - con actividades: `useReproductor(conocidas)`; si no `terminada`, `ReproductorLeccion`; si `terminada`, `ResultadoLeccion` con `leccion.titulo`, `aciertos`, `preguntas` y `alVolver={salir}`;
  - `useBlocker(({ currentLocation, nextLocation }) => hizoAlgo && !terminada && currentLocation.pathname !== nextLocation.pathname)` y, con `blocker.state === "blocked"`, `Dialogo` ("¿Salir de la lección?", "Perderás tu avance en esta lección.", "Salir" → `blocker.proceed()`, "Seguir aquí" → `blocker.reset()`);
  - sin `beforeunload`. Ocupa toda la pantalla, sin el encabezado de la marca.
- [ ] T040 [web] En `src/paginas/DetalleCurso/DetalleCurso.tsx` y `.module.css`, cada lección de la lista es un `Link` a `/cursos/${curso.id}/lecciones/${leccion.id}` que ocupa toda la fila, con un `ChevronRight` al final, hover y foco como las tarjetas (docs/diseno.md, sección 4, `TarjetaCurso`). Se conservan el número y el texto oculto "N. "
- [ ] T041 [P] [web] Actualizar `CLAUDE.md`: en la estructura, `actividades/` (un componente por tipo de actividad, el registro y el reproductor) y los componentes nuevos del sistema de diseño
- [ ] T042 [web] `npm run tipos` y `npm run lint` sin errores; buscar `dangerouslySetInnerHTML` en `src/` (no debe haber)

**Punto de control**: con el backend sembrado, la parte web de cada tabla de quickstart.md, sección 3, funciona.

---

## Fase 4: Móvil (brote_mobile_expo)

- [ ] T043 [P] [movil] En `src/constantes/tema.ts`, los tokens de T002 con el mismo nombre: en `colores.claro` y `colores.oscuro` (con el mismo valor) `progresoFin`, `codigoFondo`, `codigoTexto`, `codigoAgregado`, `codigoAgregadoFondo`, `codigoEliminado`, `codigoEliminadoFondo` y `codigoEncabezado`; `fuentes.codigo` con `Platform.select({ ios: "Menlo", default: "monospace" })`; y `tipografia.codigo` (14 / 22, `fuentes.codigo`)
- [ ] T044 [P] [movil] Crear `src/servicios/lecciones.ts` con `traerLeccion(idCurso, idLeccion)`, igual que en la web (T019). Para errores se reusan `esNoDisponible` y `leerErrorDeCarga` de `servicios/cursos.ts` (que ya distingue "sin conexión")
- [ ] T045 [P] [movil] Crear `src/utilidades/actividades.ts` con las mismas funciones que la web (T020). Verificar en el dispositivo (Hermes, SDK 58) que `"canción".normalize("NFD").replace(/\p{M}/gu, "")` da `"cancion"` y `"Ñ"` da `"N"`. Si `normalize` no existe o no separa los acentos, usar la tabla de research.md, punto 4, y anotar el resultado en research.md
- [ ] T046 [movil] Crear `src/componentes/BarraProgreso.tsx` (docs/diseno.md, secciones 4 y 6): mismas props y aspecto que en la web; el relleno es una vista con degradado `brote` → `progresoFin` (`experimental_backgroundImage`, como `FondoAmbiental`) cuyo ancho anima con `withTiming` (`movimiento.medio`) de Reanimated, sin animar si `useReducedMotion()`. `accessibilityRole="progressbar"`, `accessibilityValue={{ min: 0, max: total, now: actual }}` y `accessibilityLabel` "Actividad {actual + 1} de {total}"
- [ ] T047 [movil] Crear `src/componentes/BarraRespuesta.tsx`: mismas props y aspecto que en la web (T022), sin el atajo de Enter. `Superficie` abajo, por encima del área segura inferior, con el mensaje en `accessibilityLiveRegion="polite"` (y `AccessibilityInfo.announceForAccessibility` en iOS) y `Boton` primario `deshabilitado`
- [ ] T048 [P] [movil] Crear `src/componentes/OpcionRespuesta.tsx`: mismas props que en la web (sin `numero`). `Pressable` con `accessibilityRole="radio"`, `accessibilityState={{ checked, disabled }}`, presión 0.98, mínimo 56 px, borde de 2 px y colores por estado; `CircleCheck`/`CircleX`; la sacudida de 6 px con `withSequence` de Reanimated, sin ella si `useReducedMotion()`. Con `simbolo`, mosaico cuadrado con el símbolo en `display`
- [ ] T049 [movil] Crear `src/componentes/BloqueCodigo.tsx` (research.md, punto 13): `ScrollView horizontal` con fondo `codigoFondo` y radio `medio`; una `Texto` por línea con `tipografia.codigo`, color y fondo según `tipoLineaCodigo`; las líneas no se cortan (cada una es una sola línea, el bloque se desplaza)
- [ ] T050 [P] [movil] Crear `src/componentes/TarjetaVolteable.tsx`: mismas props que en la web. `Pressable` con dos caras (`Superficie` elevada, mínimo 200 px) superpuestas con `backfaceVisibility: "hidden"`; gira con `rotateY` animado (`withTiming`, `movimiento.lento`) o cambia de cara sin girar con `useReducedMotion()`. `accessibilityRole="button"`, `accessibilityLabel` como en la web y `accessibilityHint` "Voltea la tarjeta"
- [ ] T051 [P] [movil] Crear `src/componentes/CampoEspacio.tsx`: mismas props que en la web (T026). `TextInput` con `maxLength={LIMITES_ACTIVIDADES.respuestaEspacioMax}`, `autoCorrect={false}`, `autoCapitalize="none"`, `accessibilityLabel={etiqueta}`, `editable={!deshabilitado}`, ancho mínimo para 4 caracteres que crece con lo escrito, y `esperada` a su lado en `nota` `broteFuerte`. Acepta `ref`, `returnKeyType` y `onSubmitEditing` para pasar al siguiente espacio
- [ ] T052 [P] [movil] Crear `src/componentes/ResultadoLeccion.tsx`: mismas props y contenido que en la web (T028); la celebración con Reanimated (`withSpring` en la escala del icono, `withDelay` + `withTiming` en la insignia), sin animación con `useReducedMotion()`
- [ ] T053 [movil] Crear `src/actividades/tipos.ts` (carpeta nueva), igual que en la web (T029)
- [ ] T054 [movil] Crear `src/actividades/Teoria.tsx`: igual que en la web (T030), con `Texto` (`titulo2` con `accessibilityRole="header"`, `cuerpo` por párrafo; los saltos de línea simples se respetan solos) y la lista de puntos clave como filas con `Check`
- [ ] T055 [movil] Crear `src/actividades/TarjetaMemoria.tsx`: igual que en la web (T031)
- [ ] T056 [movil] Crear `src/actividades/OpcionMultiple.tsx`: igual que en la web (T032), sin el atajo de teclado; las opciones en columna (o en fila de mosaicos con `flexWrap` si son símbolos)
- [ ] T057 [movil] Crear `src/actividades/CompletarEspacios.tsx` (research.md, punto 12): el texto partido por `\n` en filas con `flexDirection: "row"` y `flexWrap: "wrap"`; cada fila hecha de palabras (`Texto`, conservando los espacios del inicio de la línea como sangría) y de `CampoEspacio` donde había `MARCA_ESPACIO`. `returnKeyType="next"` lleva al siguiente espacio; en el último, `"done"` cierra el teclado. Comprobar y la retroalimentación, igual que en la web (T033)
- [ ] T058 [movil] Crear `src/actividades/PreguntaAbierta.tsx`: igual que en la web (T034), con un `TextInput multiline` (`maxLength={LIMITES_ACTIVIDADES.respuestaAbiertaMax}`, `textAlignVertical="top"`, mínimo 120 px de alto, `editable` en falso después de comprobar)
- [ ] T059 [movil] Crear `src/actividades/registro.ts`: igual que en la web (T035)
- [ ] T060 [P] [movil] Crear `src/hooks/useReproductor.ts`: igual que en la web (T036)
- [ ] T061 [movil] Crear `src/actividades/ReproductorLeccion.tsx`: igual que en la web (T037). La barra superior con la X y `BarraProgreso`; la actividad en un `ScrollView` con `keyboardShouldPersistTaps="handled"`; la `BarraRespuesta` fija abajo, por encima del teclado (`KeyboardAvoidingView` con `behavior="padding"` en iOS)
- [ ] T062 [movil] Crear `src/app/leccion/[idCurso]/[idLeccion].tsx` y registrar `<Stack.Screen name="leccion/[idCurso]/[idLeccion]" />` en el `Stack.Protected` con sesión de `src/componentes/NavegacionRaiz.tsx` (y actualizar su comentario). La pantalla, dentro de `FondoAmbiental` y `SafeAreaView` (arriba y abajo):
  - `useLocalSearchParams` y `usePeticion(useCallback(() => traerLeccion(idCurso, idLeccion), [idCurso, idLeccion]))`;
  - `salir()`: `router.back()` si `router.canGoBack()`; si no, `router.replace({ pathname: "/curso/[idCurso]", params: { idCurso } })`;
  - los mismos estados que la web (T039), con la X arriba; "Ver cursos" → `router.dismissTo("/")`;
  - `usePreventRemove(hizoAlgo && !terminada, ({ data }) => Alert.alert("¿Salir de la lección?", "Perderás tu avance en esta lección.", [{ text: "Seguir aquí", style: "cancel" }, { text: "Salir", style: "destructive", onPress: () => navigation.dispatch(data.action) }]))`, importando `usePreventRemove` y `useNavigation` de `expo-router` (research.md, punto 9).

  Verificar en iOS que el gesto de deslizar desde el borde pide la confirmación; si no, poner `gestureEnabled: false` en las opciones de la pantalla mientras `hizoAlgo && !terminada` y anotarlo en research.md, punto 9
- [ ] T063 [movil] En `src/app/curso/[idCurso].tsx`, cada lección es un `Pressable` (`accessibilityRole="button"`, `accessibilityLabel` "{posicion}. {titulo}", presión 0.98, `ChevronRight` al final) que hace `router.push({ pathname: "/leccion/[idCurso]/[idLeccion]", params: { idCurso: curso.id, idLeccion: leccion.id } })`
- [ ] T064 [P] [movil] Actualizar `CLAUDE.md`: en la estructura, `actividades/`; en la lista de componentes del sistema de diseño, los nuevos
- [ ] T065 [movil] `npm run tipos`, `npm run lint` y `npm run doctor` sin errores ni avisos nuevos

**Punto de control**: con el backend sembrado y Expo Go (en iOS y en Android), la parte móvil de cada tabla de quickstart.md, sección 3, funciona.

---

## Fase 5: Cierre

- [ ] T066 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`:
  - en **Leccion**, la columna `actividades` (JSONB, por defecto `[]`) y la línea "Las actividades de la lección llegan con F03" fuera;
  - **Actividad** en "Entidades definidas", con la tabla por tipo de data-model.md y una nota de que los otros 8 tipos llegan con sus features y el glosario con F09;
  - en "Entidades previstas", quitar Actividad (o dejar solo "los demás tipos de actividad").
- [ ] T067 [specs] Integrar a `specs/01-navegacion.md`:
  - web: `/cursos/:idCurso/lecciones/:idLeccion` deja de estar prevista; va a pantalla completa, fuera del marco común, con el catálogo aún cargado; salir lleva a la pantalla anterior o reemplaza la dirección por el detalle del curso;
  - móvil: `leccion/[idCurso]/[idLeccion]` es una pantalla del `Stack` raíz, encima del detalle, sin pestañas;
  - las dos: la X, volver y el gesto de atrás piden confirmación si el alumno ya hizo algo;
  - en "Qué viaja", Detalle del curso → Reproductor deja de estar prevista.
- [ ] T068 [specs] `npm run contrato:revisar`: todas las copias coinciden con la oficial (0.4.0)
- [ ] T069 [specs] Revisar que `spec.md` coincide con lo que se construyó; si algo cambió, actualizarla en el mismo PR
- [ ] T070 [specs] Repetir los criterios de F02 "Orden de los cuatro cursos" y "Volver con lo cargado" (quickstart de F02, sección 3), más uno nuevo: con 20 cursos cargados, abrir un curso, abrir una lección, salir y volver al catálogo deja los 20 en la misma posición (quickstart.md, sección 4)

---

## Fase 6: Validación manual

Pasos de cada criterio en [quickstart.md](./quickstart.md). Al marcar uno aquí,
se marca también en spec.md. Antes de cada criterio, `npm run bd:sembrar`
deja el estado inicial; los de "Actividades de prueba" piden además la
consulta L1.

- [ ] V01 [web, móvil] En el detalle de "Git esencial", al pulsar "1. ¿Qué es el control de versiones?" se abre su reproductor: la X, la barra de progreso vacía y la teoría "El problema que resuelve Git". En el móvil no se ve la barra de pestañas.
- [ ] V02 [web, móvil] Recorro esa lección hasta el final y veo, en este orden: teoría "El problema que resuelve Git", tarjeta "¿Qué es un repositorio (repo)?", tarjeta "¿Qué es un commit?", teoría "Las tres áreas de Git" y dos preguntas de opción múltiple. La barra de progreso avanza un paso con cada "Continuar" y en la pantalla de lección completada está llena.
- [ ] V03 [web, móvil] En ninguna lección de los cursos de prueba aparece una actividad de los tipos que quedan fuera de alcance: "Tu primer commit" (Git esencial, 2) tiene solo su teoría.
- [ ] V04 [web, móvil] No hay forma de volver a la actividad anterior ni de pasar a la siguiente sin pulsar "Continuar".
- [ ] V05 [web] Al recargar la página a mitad de una lección, la lección vuelve a empezar desde la primera actividad. La dirección del reproductor se puede abrir directamente.
- [ ] V06 [web] Dado que no hay sesión, cuando abro la dirección de una lección y entro, entonces llego a esa lección.
- [ ] V07 [web, móvil] La teoría "El problema que resuelve Git" muestra su título, dos párrafos y tres puntos clave en lista; "Continuar" está disponible desde el principio.
- [ ] V08 [web, móvil] La teoría "El atributo for de <label>" (Examen unidad 1, lección 1) muestra `<label>` en el título y en el texto tal cual, y su bloque de código en letra monoespaciada con sus dos líneas.
- [ ] V09 [web, móvil] En "Viajar en el tiempo: historial y diffs" (Git esencial, 3), en el diff de la pregunta "En el diff de arriba, ¿qué línea se eliminó…?" la línea que empieza con `-` se ve resaltada como eliminada, las que empiezan con `+` como agregadas y la de `@@` como encabezado.
- [ ] V10 [móvil] En la teoría `target="_blank" y rel="noopener"` (Examen unidad 1, lección 3), la línea de código `<a href="https://ejemplo.com" …>` no se corta: el bloque se desplaza hacia los lados para verla completa.
- [ ] V11 [web, móvil] En la tarjeta "¿Qué es un commit?", "Continuar" está deshabilitado; al pulsar la tarjeta veo el reverso ("Una fotografía guardada del proyecto…") y "Continuar" se habilita. Al pulsarla otra vez vuelve al frente.
- [ ] V12 [web] Con el foco en la tarjeta, Enter o la barra espaciadora la voltean.
- [ ] V13 [web, móvil] En "¿Cuál de estas afirmaciones es correcta?" (Git esencial, 1), "Comprobar" está deshabilitado hasta que elijo una opción, y puedo cambiar de opción antes de comprobar.
- [ ] V14 [web, móvil] Al elegir "Un commit es una fotografía del proyecto en un momento dado" y comprobar, esa opción queda marcada como correcta y la barra inferior dice "¡Correcto!".
- [ ] V15 [web, móvil] Al elegir "Un commit borra el historial anterior" y comprobar, esa opción queda marcada como incorrecta, la correcta queda marcada como correcta y la barra inferior muestra "Respuesta correcta: Un commit es una fotografía del proyecto en un momento dado". Las opciones ya no se pueden cambiar y el botón dice "Continuar".
- [ ] V16 [web, móvil] Al abrir varias veces la misma lección, las opciones de esa pregunta no salen siempre en el mismo orden, y la correcta no está siempre arriba.
- [ ] V17 [web, móvil] En "Hiragana: las vocales" (Japonés sencillo, 1), las opciones de "¿Cuál hiragana se lee 'a'?" se ven como mosaicos con los símbolos "あ", "い" y "う" en grande.
- [ ] V18 [web] Con las teclas 1, 2 y 3 elijo la opción que está en ese lugar en pantalla; Enter comprueba y, después, Enter continúa.
- [ ] V19 [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1), el texto `___ main() {` con sus tres líneas se ve con su sangría y un espacio para escribir; "Comprobar" está deshabilitado mientras el espacio está vacío o tiene solo espacios.
- [ ] V20 [web, móvil] Escribir " INT " en ese espacio y comprobar lo marca como correcto y la barra dice "¡Correcto!".
- [ ] V21 [web, móvil] Escribir "float" lo marca como incorrecto, muestra "int" junto al espacio y la barra inferior muestra "Respuesta correcta:" con el texto completo y "int" en el espacio. El espacio ya no se puede editar.
- [ ] V22 [web, móvil] En "Resolviendo conflictos" (Git esencial, 6), con "head" en el primer espacio y "=====" en el segundo, el primero queda correcto y el segundo incorrecto (con "=======" junto a él), y la pregunta cuenta como fallada. "Comprobar" no se habilita mientras uno de los dos espacios esté vacío.
- [ ] V23 [web, móvil] En "Actividades de prueba", el espacio que acepta "canción" y "tema" da por correctas "Cancion", "CANCIÓN", "tema" y "canción  " (con espacios al final), y por incorrecta "canciones".
- [ ] V24 [web, móvil] Un espacio no deja escribir más de 100 caracteres.
- [ ] V25 [web] Tab pasa de un espacio al siguiente y Enter comprueba.
- [ ] V26 [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1), "Comprobar" está deshabilitado hasta que escribo algo que no sean solo espacios.
- [ ] V27 [web, móvil] Al escribir una respuesta y comprobar, mi respuesta queda visible y sin poder editarse, aparece la "Solución de referencia" ("Porque C es un lenguaje de tipado estático…") y los botones "La tuve bien" y "No la tuve"; "Continuar" no aparece hasta que elijo uno.
- [ ] V28 [web, móvil] Al elegir "La tuve bien" la barra dice "¡Correcto!" y la pregunta cuenta como acertada; al elegir "No la tuve" la barra dice "A repasar" y cuenta como fallada.
- [ ] V29 [web, móvil] El campo de la respuesta no deja escribir más de 2000 caracteres.
- [ ] V30 [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1), acertando la opción múltiple, fallando el espacio y eligiendo "La tuve bien" en la pregunta abierta, al terminar veo "¡Lección completada!", "Primeros pasos" y "Acertaste 2 de 3", con una celebración breve.
- [ ] V31 [web, móvil] En "Tu primer commit" (Git esencial, 2), que solo tiene teoría, al terminar veo "¡Lección completada!" sin "Acertaste…".
- [ ] V32 [web, móvil] "Volver al curso" lleva al detalle del curso. Al abrir otra vez la misma lección, empieza desde la primera actividad, sin respuestas.
- [ ] V33 [web, móvil] Con "reducir movimiento" activado, la barra de progreso avanza y la celebración aparece sin animaciones, y la opción incorrecta no se sacude.
- [ ] V34 [web, móvil] En la primera actividad, sin haber hecho nada, la X lleva directo al detalle del curso, sin preguntar.
- [ ] V35 [web, móvil] Después de pasar de la primera actividad, o de elegir una opción en ella, la X muestra "¿Salir de la lección?" con "Perderás tu avance en esta lección.", "Salir" y "Seguir aquí". "Seguir aquí" me deja en la misma actividad con lo que había elegido o escrito; "Salir" lleva al detalle del curso.
- [ ] V36 [web] El botón de volver del navegador a mitad de la lección hace lo mismo que la X.
- [ ] V37 [móvil] El botón o gesto de atrás del teléfono a mitad de la lección hace lo mismo que la X.
- [ ] V38 [web, móvil] En "Actividades de prueba", la lección con `<b>hola</b>` y `<script>` en sus textos (teoría, tarjeta, pregunta, opciones, texto con espacios y solución) los muestra tal cual, sin negritas y sin ejecutar nada.
- [ ] V39 [web, móvil] En "Actividades de prueba", la lección sin actividades muestra "Esta lección todavía no tiene actividades." y "Volver al curso".
- [ ] V40 [web] Una dirección de lección con un identificador inventado, o con una lección que es de otro curso, muestra "Esta lección no existe o ya no está disponible." y "Ver cursos", que lleva al catálogo.
- [ ] V41 [backend] Pedir al servidor, sin pasar por un cliente, una lección de un curso en borrador responde exactamente igual que con un identificador que no existe; pedir una lección sin sesión se rechaza.
- [ ] V42 [web, móvil] Mientras carga la lección se ven la X y un indicador de carga; "Esta lección todavía no tiene actividades." no aparece ni por un instante.
- [ ] V43 [web, móvil] Con el servidor apagado, al abrir una lección veo "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y "Reintentar"; al encender el servidor y pulsar "Reintentar" veo la primera actividad.
- [ ] V44 [móvil] En modo avión, al abrir una lección veo "Sin conexión. Revisa tu conexión e inténtalo de nuevo." y "Reintentar"; al quitar el modo avión y pulsar "Reintentar" veo la primera actividad.
- [ ] V45 [web, móvil] Con una lección ya abierta, apago el servidor (en el móvil, o activo el modo avión) y puedo terminarla hasta la pantalla de lección completada.
- [ ] V46 [web, móvil] Dado que la sesión expiró, cuando abro una lección, entonces llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar."; en la web, al entrar regreso a esa lección.

---

## Dependencias

- **Fase 1** va antes que todo. T001 → T007 (el contrato se edita antes de copiarlo). T002 → T003. T004, T005 y T006 son independientes entre sí. T002 y T003 van antes de cualquier componente de interfaz.
- **Backend** (fase 2):
  - T008 → T010 → T011;
  - T009 y T012 en paralelo desde el inicio; T013 necesita T012; T014 necesita T008, T009 y T013;
  - T015 cuando se quiera; T016 al final.
- **Web** (fase 3), cuando el backend pasa su punto de control:
  - T017, T018, T019, T020, T023, T025, T026, T027, T028 y T036 en paralelo (T023, T025 a T028 después de T017; T027 y T028 usan T018);
  - T021 necesita T017; T022 necesita T018; T024 necesita T017 y T020;
  - T029 antes de T030 a T034; cada uno de T030 a T034 necesita T022 y sus componentes (T024, T025, T023, T026);
  - T035 necesita T030 a T034; T037 necesita T021, T035 y T036;
  - T038 → T039; T039 necesita T019, T027, T028 y T037; T040 cuando se quiera;
  - T041 cuando se quiera; T042 al final.
- **Móvil** (fase 4), en paralelo con la web, con el mismo orden: T043 a T045 y T048, T050 a T052 y T060 en paralelo; T046 y T049 necesitan T043 (T049 también T045); T053 → T054 a T058 → T059 → T061 → T062; T063 cuando se quiera; T065 al final.
- **Cierre y validación** al final. V41 se puede validar en cuanto termina el backend.

## Paralelo, por ejemplo

```text
Preparación: T002→T003 (diseño) ‖ T001→T007 (contrato) ‖ T004 ‖ T005 ‖ T006
Backend:     T009 (validación) ‖ T012 (convertir el prototipo)   mientras T008→T010→T011 avanzan
Web:         T017 ‖ T018 ‖ T019 ‖ T020 ‖ T036, luego T023 ‖ T025 ‖ T026 ‖ T027 ‖ T028
Móvil:       T043 ‖ T044 ‖ T045 ‖ T060, luego T048 ‖ T050 ‖ T051 ‖ T052
Repos:       fase 3 (web) ‖ fase 4 (móvil)
```

## Estrategia

1. Diseño y contrato en `brote_specs` (T001 a T003), porque los tres repos
   los usan.
2. Backend completo, sembrado y probado con curl (punto de control de la
   fase 2): ya cubre V41 y deja las 93 actividades listas para los dos
   clientes.
3. En cada cliente, primero el camino más corto a una lección que se puede
   recorrer: componentes base, `Teoria` y `TarjetaMemoria`, registro,
   reproductor y pantalla (con Git esencial, 2 y la teoría de la 1 ya se
   puede navegar). Después `OpcionMultiple`, `CompletarEspacios` y
   `PreguntaAbierta`, y al final la confirmación de salida.
4. Cierre de documentos y validación manual completa (V01 a V46) antes de los
   PR a `dev` de cada repo, con la spec enlazada y los criterios cubiertos.
