# Plan técnico: F03 Cursar una lección

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-11-02 | **Rama**: `feature/F03-cursar-leccion`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

`leccion` gana una columna JSONB `actividades`, con cinco tipos de actividad
definidos en el contrato como una unión por `tipo`. El backend valida cada
actividad antes de guardarla y expone `GET /cursos/:idCurso/lecciones/:idLeccion`,
que entrega la lección completa, con las respuestas, solo si su curso está
publicado. Los dos clientes tienen un reproductor que no sabe nada de los
tipos: busca el componente de cada actividad en un registro `tipo →
componente` (principio IV). Cada actividad dibuja su barra de
"Comprobar"/"Continuar" y califica en el cliente, sin volver a pedir nada al
servidor (research.md, punto 2). Salir a mitad de la lección se confirma con
`useBlocker` en la web y `usePreventRemove` en el móvil. `npm run bd:sembrar`
carga las 93 actividades del prototipo de esos cinco tipos, ya convertidas al
contrato, y el curso "Actividades de prueba".

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | Al planear se cambió en la spec el nombre del curso de prueba a "Actividades de prueba", sin publicar en el estado inicial, para no chocar con la consulta de F02 que publica los "Curso de prueba %" (research.md, punto 6) |
| II. Un producto, cuatro repos | sí | Tipos y constantes nuevos en `contrato/` 0.4.0, copiados a los tres repos |
| III. El backend es la autoridad | sí | El servidor decide quién abre cada lección: solo con sesión, solo de cursos publicados y del curso de la dirección, con el mismo 404 para todo lo demás. Toda actividad pasa por `validarActividades` antes de guardarse. Califica el cliente porque en F03 el backend no recibe respuestas ni guarda resultados; F04 y F08 no podrán confiar en los aciertos del cliente (research.md, punto 2). Los textos de las actividades se muestran siempre como texto, nunca como HTML |
| IV. Actividades extensibles | sí | Cada tipo es una variante del contrato, tiene su validación en `validarActividades` y su componente en `src/actividades/` de cada cliente. El reproductor usa `registroActividades`, cuyo tipo obliga a tener un componente por cada `tipo` (research.md, punto 7). El formulario del editor y la vista previa llegan con F05, con los mismos componentes |
| V. Estados explícitos | sí | Reproductor: cargando, con datos, actividad respondida, sin actividades, no disponible, error, sin conexión (móvil) y confirmar salida. Lección completada no carga nada |
| VI. Dependencias justificadas | sí | Ningún paquete nuevo (ver "Dependencias nuevas") |
| VII. Estilo propio | sí | Tipos de actividad en `camelCase` (`opcionMultiple`), campos en español, identificadores sin acentos |
| VIII. Terminado = validado | sí | Cada criterio tiene pasos en `quickstart.md` |

Revisión después del diseño: sin cambios ni excepciones.

## Cambios al contrato

`contrato/VERSION` 0.3.0 → **0.4.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- `ActividadTeoria`, `ActividadTarjeta`, `OpcionRespuesta`,
  `ActividadOpcionMultiple`, `EspacioRespuesta`,
  `ActividadCompletarEspacios`, `ActividadPreguntaAbierta`, la unión
  `Actividad` y `TipoActividad`.
- `DetalleLeccion` y `RespuestaLeccion`.
- Constantes `MARCA_ESPACIO` (`"___"`), `LIMITES_ACTIVIDADES` (`opcionesMin:
  2`, `opcionesMax: 9`, `respuestaEspacioMax: 100`, `respuestaAbiertaMax:
  2000`) y `MENSAJES_LECCION.leccionNoDisponible`.

## Cambios al modelo de datos

- `Leccion` gana `actividades Json @default("[]")` (columna JSONB). Detalle
  en [data-model.md](./data-model.md).
- Migración `prisma/migrations/<fecha>_f03_actividades/`.
- La entidad **Actividad** se define dentro de esa columna: sin tabla ni
  `id`.

## API

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| GET | `/cursos/:idCurso/lecciones/:idLeccion` | Con sesión | La lección con sus actividades si es de ese curso y el curso está publicado; 404 en cualquier otro caso |

## Interfaz

Según `docs/diseno.md`. Lo nuevo se agrega **primero** a `docs/diseno.md`
(es una tarea), después a los dos clientes con el mismo nombre.

### Lo que se agrega a `docs/diseno.md`

- **Tokens** (sección 2):
  - `progresoFin` `#84CC16`: final del degradado de la barra de progreso (la
    sección 6 ya lo menciona, pero no era token).
  - Código, iguales en modo claro y oscuro: `codigoFondo` `#16142E`,
    `codigoTexto` `#ECEBFA`, `codigoAgregado` (texto `#BEF264` sobre
    `rgba(163,230,53,0.16)`), `codigoEliminado` (texto `#FDA4AF` sobre
    `rgba(255,107,133,0.16)`) y `codigoEncabezado` `#A29DFF`. Al
    implementar se revisa que cada texto tenga contraste ≥ 4.5:1 con
    `codigoFondo`.
  - Tipografía `codigo`: 14/22, peso 400, fuente monoespaciada (web:
    `--fuente-codigo`, que ya existe; móvil: `fuentes.codigo`, Menlo en iOS
    y `monospace` en Android).
  - Medida `anchoLeccion` 680 px: ancho del contenido del reproductor en la
    web.
- **Componentes** (sección 4), en los dos clientes:

  | Componente | Props clave | Notas |
  |---|---|---|
  | `BarraProgreso` | `actual`, `total` | La barra de la sección 6. Web: `role="progressbar"` con `aria-valuetext="Actividad {n} de {total}"`; móvil: `accessibilityRole="progressbar"` y la misma etiqueta |
  | `BarraRespuesta` | `estado` (`neutro`, `correcto`, `incorrecto`), `titulo`, `detalle`, `textoBoton`, `deshabilitado`, `alPulsar` | La barra inferior fija de la sección 6, con el botón primario a ancho completo. Anuncia el cambio de estado (`aria-live` / `accessibilityLiveRegion`) |
  | `OpcionRespuesta` | `estado` (`normal`, `seleccionada`, `correcta`, `incorrecta`), `simbolo`, `numero` | Las opciones de la sección 6. Con `simbolo`, mosaico cuadrado con el símbolo en `display`. `numero` es la tecla (solo web) |
  | `BloqueCodigo` | `codigo` | Panel `codigoFondo`, una línea por fila, diff resaltado, desplazamiento horizontal (research.md, punto 13) |
  | `TarjetaVolteable` | `frente`, `reverso`, `volteada`, `alVoltear` | `Superficie` elevada de al menos 200 px de alto que gira en `lento`; sin giro con "reducir movimiento" |
  | `CampoEspacio` | `valor`, `estado` (`normal`, `correcto`, `incorrecto`), `esperada` | Campo en línea con el texto; borde y fondo como las opciones; la esperada en `nota` `broteFuerte` a su lado |
  | `Dialogo` (web) | `abierto`, `titulo`, `texto`, `textoConfirmar`, `textoCancelar`, `alConfirmar`, `alCancelar` | `<dialog>` modal, `Superficie` sólida, radio `enorme`. En el móvil, la misma confirmación es `Alert.alert` (research.md, punto 9) |
  | `ResultadoLeccion` | `titulo`, `aciertos`, `preguntas`, `alVolver` | Pantalla de fin de lección de la sección 6: icono `PartyPopper` en círculo `broteSuave`, "¡Lección completada!" en `display`, el título en `titulo3`, `Insignia` `brote` con "Acertaste {a} de {p}" (si hay preguntas) y "Volver al curso" |

- **Patrones** (sección 6): tarjeta de memoria, completar espacios, pregunta
  abierta (solución de referencia en `Superficie` `suave` con la etiqueta
  "SOLUCIÓN DE REFERENCIA" en `seccion`, y "La tuve bien" / "No la tuve"
  como dos `Boton` `secundario`), el bloque de código y la confirmación de
  salida. Teclado de la web: lo de research.md, punto 10.

### Por pantalla

| Pantalla | Usa | Nuevo |
|---|---|---|
| Detalle del curso (cambio) | Lo de F02 | Cada lección de la lista se puede pulsar: en la web, un `Link` que ocupa la fila (hover y foco como las tarjetas); en el móvil, un `Pressable` con `accessibilityRole="button"` y presión 0.98, con un `ChevronRight` al final |
| Reproductor | `FondoAmbiental`, `Boton` `fantasma` chico con `X` (etiqueta "Salir de la lección"), `IndicadorCarga`, `EstadoVacio`, `ErrorCarga`, `Superficie` | `BarraProgreso`, `BarraRespuesta`, `Dialogo` (web) y los componentes de cada actividad |
| Teoría | `Superficie`, títulos en `titulo2`, texto en `cuerpo`, puntos clave como lista con un `Check` `brote` | `BloqueCodigo` |
| Tarjeta de memoria | Indicación en `nota` `textoSuave` con el icono `RotateCw` | `TarjetaVolteable` |
| Opción múltiple | Pregunta en `titulo2` | `BloqueCodigo`, `OpcionRespuesta` |
| Completar espacios | `Superficie` con el texto en `cuerpo` | `CampoEspacio` |
| Pregunta abierta | Pregunta en `titulo2`, campo de varias líneas con el aspecto de `CampoTexto` (en la web, `<textarea>`; en el móvil, `TextInput multiline`), `Boton` `secundario` | — |
| Lección completada | `Insignia`, `Boton` | `ResultadoLeccion` |

## Por repo

### brote_backend_express

- **Archivos**:
  - `prisma/schema.prisma`: `actividades Json @default("[]")` en `Leccion`,
    más la migración `f03_actividades`. Después, `npm run bd:generar`.
  - `src/validacion/actividades.ts` (nuevo): `validarActividades(valor:
    unknown): Actividad[]`, con una función por tipo (`validarTeoria`, ...)
    y ayudantes `textoObligatorio`, `textoOpcional` y `soloCampos` (rechaza
    campos de más). Lanza `Error` con la posición, el tipo y el campo
    (research.md, punto 5). F05 y F07 la envolverán en `ErrorApi(400, ...)`.
  - `src/servicios/lecciones.ts` (nuevo): `traerLeccionPublicada(idCurso,
    idLeccion)` con `bd.leccion.findFirst({ where: { id: idLeccion, idCurso,
    curso: { publicado: true } }, select: { id, titulo, posicion, actividades
    } })`. Si no la encuentra, lanza `ErrorApi(404,
    MENSAJES_LECCION.leccionNoDisponible)`. `aDetalleLeccion` traduce al
    contrato (`actividades as unknown as Actividad[]`: ya se validaron al
    guardar).
  - `src/rutas/cursos.ts`: `GET /:idCurso/lecciones/:idLeccion` con
    `requerirSesion`, que llama al servicio. Es parte del recurso cursos, así
    que va en el mismo archivo y no se monta nada nuevo.
  - `scripts/actividades-prototipo.ts` (nuevo, generado una vez):
    `ACTIVIDADES_PROTOTIPO: Record<string, Actividad[][]>`, por título del
    curso y en el orden de sus lecciones (research.md, punto 6).
  - `scripts/datos-prueba.ts`: `CursoPrueba.lecciones` pasa a ser
    `LeccionPrueba[]` (`{ titulo, actividades }`). Los cuatro cursos del
    prototipo toman sus actividades de `ACTIVIDADES_PROTOTIPO`; los extra de
    F02 quedan con `actividades: []`. Se agrega "Actividades de prueba",
    sin publicar, con sus tres lecciones.
  - `scripts/sembrar-cursos.ts`: pasa las actividades de cada lección por
    `validarActividades` **antes** de abrir la transacción (si una falla,
    dice el curso y la lección, y la base no cambia) y las guarda.
- **Validación de entrada**: `:idCurso` e `:idLeccion` no se validan: un
  identificador que no existe es un 404. La sesión va antes que todo, como en
  F02.
- **Notas**:
  - Las rutas no usan Prisma (llaman al servicio), como pide `CLAUDE.md`.
  - Actualizar en `CLAUDE.md` la lista de `scripts/`
    (`actividades-prototipo.ts`).
  - Comprobar el contrato con `npm run tipos`: si `ACTIVIDADES_PROTOTIPO`
    tiene un campo mal escrito, no compila.

### brote_web_react

- **Páginas y rutas** (`src/rutas.tsx`):
  - Nuevo `componentes/ZonaConSesion/ZonaConSesion.tsx`: `<CatalogoProvider><Outlet
    /></CatalogoProvider>` y `<ScrollRestoration />`, que salen del `Layout`
    (research.md, punto 8). Cuelga de `RutaProtegida`.
  - De `ZonaConSesion` cuelgan el `Layout` (con `/`, `/cursos/:idCurso` y
    `*`, como hoy) y, fuera del `Layout`,
    `/cursos/:idCurso/lecciones/:idLeccion` → `paginas/Leccion/Leccion.tsx`.
- **Lección** (`paginas/Leccion/Leccion.tsx` + `.module.css`):
  - `usePeticion` con `traerLeccion(idCurso, idLeccion)`. Estados: cargando
    (X e `IndicadorCarga`), 404 (`EstadoVacio` con
    `leccionNoDisponible` y un `Link` "Ver cursos" a `/`), error
    (`ErrorCarga` con "Reintentar"), sin actividades (`EstadoVacio` "Esta
    lección todavía no tiene actividades." y "Volver al curso") y con datos.
  - Con datos: `useReproductor(actividades)` y `<ReproductorLeccion>`; al
    terminar, `<ResultadoLeccion>`.
  - Salir: `salir()` (research.md, punto 8) en la X y en "Volver al curso".
    `useBlocker` con `hizoAlgo && !terminada` y cambio de ruta; con el
    bloqueo activo, `<Dialogo>`.
  - Contenido centrado a `anchoLeccion`, a pantalla completa, con la barra
    superior y la `BarraRespuesta` fijas.
- **Actividades** (carpeta nueva `src/actividades/`):
  - `tipos.ts`: `ResultadoActividad` y `PropsActividad<T>`.
  - `registro.ts`: `registroActividades` (research.md, punto 7).
  - `ReproductorLeccion/ReproductorLeccion.tsx`: X, `BarraProgreso` y la
    actividad actual (`key` = índice) buscada en el registro. Las actividades
    de un tipo sin componente se saltan.
  - Un componente por tipo, cada uno con su `.module.css`, que dibuja su
    contenido y su `BarraRespuesta`:
    - `Teoria/`: título, párrafos (se parten por `/\n\s*\n/`, cada uno con
      `white-space: pre-line`), `BloqueCodigo` y puntos clave.
      `"sinCalificar"`.
    - `TarjetaMemoria/`: `TarjetaVolteable`; "Continuar" se habilita al
      voltearla. `"sinCalificar"`.
    - `OpcionMultiple/`: opciones mezcladas al montar, `role="radiogroup"`,
      teclas 1 a 9. Comprobar → marca la correcta y la elegida.
    - `CompletarEspacios/`: `<form>` con el texto partido por
      `MARCA_ESPACIO` y un `CampoEspacio` por espacio (research.md, punto
      12).
    - `PreguntaAbierta/`: `<textarea maxLength={2000}>`, "Solución de
      referencia" y la autoevaluación.
- **Hooks**: `hooks/useReproductor.ts` con `useReducer`: estado `{ indice,
  resultados, hizoAlgo }` y acciones `interactuar` y `terminarActividad`;
  expone `actual`, `total`, `terminada`, `aciertos` y `preguntas`. Es estado
  local de la pantalla: no hace falta un contexto.
- **Componentes** (`src/componentes/<Nombre>/`): `BarraProgreso`,
  `BarraRespuesta`, `OpcionRespuesta`, `BloqueCodigo`, `TarjetaVolteable`,
  `CampoEspacio`, `Dialogo`, `ResultadoLeccion` y `ZonaConSesion`.
  - `Boton` gana la prop `deshabilitado`, que ya tiene en el móvil.
  - `DetalleCurso`: cada lección de la lista es un `Link` a
    `/cursos/:idCurso/lecciones/:idLeccion`.
- **Servicios y utilidades**:
  - `servicios/lecciones.ts`: `traerLeccion(idCurso, idLeccion)` sobre
    `pedir()`. `esNoDisponible` y `leerErrorDeCarga` de `servicios/cursos.ts`
    sirven igual (404 y 5xx).
  - `utilidades/actividades.ts`: `normalizarRespuesta`, `esAceptada(escrito,
    espacio)`, `mezclar(lista)` (Fisher-Yates), `partirEnEspacios(texto)`,
    `partirParrafos(texto)` y `tipoLineaCodigo(linea)` (`"agregada" |
    "eliminada" | "encabezado" | "normal"`).
  - `estilos/tokens.css`: los tokens nuevos (`--color-progreso-fin`,
    `--color-codigo-*`, `--texto-codigo`, `--ancho-leccion`).
- **Notas**:
  - Ningún texto de actividad se inserta como HTML.
  - La sesión expirada no necesita nada nuevo: `RutaProtegida` guarda la
    dirección de la lección y regresa ahí después de entrar.
  - Actualizar la estructura de `CLAUDE.md` (`actividades/`).

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**:
  - `src/app/leccion/[idCurso]/[idLeccion].tsx` (nuevo): la misma lógica que
    la página de la web, con `usePeticion`, `useReproductor` y
    `useLocalSearchParams`. Dentro de `FondoAmbiental` y `SafeAreaView`
    (arriba y abajo).
  - `src/componentes/NavegacionRaiz.tsx`: `<Stack.Screen
    name="leccion/[idCurso]/[idLeccion]" />` dentro del `Stack.Protected` con
    sesión.
  - `src/app/curso/[idCurso].tsx`: cada lección es un `Pressable` que hace
    `router.push({ pathname: "/leccion/[idCurso]/[idLeccion]", params: {
    idCurso, idLeccion } })`.
  - Salir: `router.back()` en la X y en "Volver al curso";
    `usePreventRemove(hizoAlgo && !terminada, ...)` con `Alert.alert`
    (research.md, punto 9).
- **Actividades** (`src/actividades/`): `tipos.ts`, `registro.ts`,
  `ReproductorLeccion.tsx`, `Teoria.tsx`, `TarjetaMemoria.tsx`,
  `OpcionMultiple.tsx`, `CompletarEspacios.tsx` y `PreguntaAbierta.tsx`, con
  las mismas reglas que en la web. El contenido va en un `ScrollView` con
  `keyboardShouldPersistTaps="handled"`, y la `BarraRespuesta` queda fija
  abajo, por encima del teclado (`KeyboardAvoidingView` en iOS).
- **Componentes** (`src/componentes/`): `BarraProgreso`, `BarraRespuesta`,
  `OpcionRespuesta`, `BloqueCodigo` (`ScrollView horizontal`),
  `TarjetaVolteable`, `CampoEspacio` y `ResultadoLeccion`. Animaciones con
  Reanimated y `useReducedMotion()` (research.md, punto 11).
- **Hooks, servicios y utilidades**: `hooks/useReproductor.ts`,
  `servicios/lecciones.ts` y `utilidades/actividades.ts`, iguales a los de la
  web. `constantes/tema.ts`: `progresoFin`, `codigo*`, `fuentes.codigo` y
  `tipografia.codigo`.
- **Almacenamiento local**: no se usa. La lección vive mientras la pantalla
  está abierta, como dice la spec.
- **Notas**:
  - Verificar `normalize("NFD")` en Hermes (research.md, punto 4) y el gesto
    de iOS con `usePreventRemove` (punto 9).
  - Actualizar la estructura de `CLAUDE.md` (`actividades/`) y su lista de
    componentes del sistema de diseño.

## Cambios a la navegación

Se integran a `specs/01-navegacion.md` al cerrar la feature.

- **Web**:
  - `/cursos/:idCurso/lecciones/:idLeccion` es el reproductor (estaba
    previsto). Va a pantalla completa, fuera del marco común, pero el
    catálogo sigue cargado mientras tanto (`ZonaConSesion`).
  - Salir lleva a la pantalla anterior (el detalle) o, si se abrió la
    dirección directo, la reemplaza por el detalle del curso.
- **Móvil**:
  - `leccion/[idCurso]/[idLeccion]` es una pantalla del `Stack` raíz, encima
    del detalle, sin encabezado ni pestañas.
- **Las dos**: la X, el botón de volver y el gesto de atrás piden
  confirmación si el alumno ya hizo algo.
- **Qué viaja**: Detalle del curso → Reproductor: `idCurso` e `idLeccion`
  (en la dirección en la web; como parámetros de ruta en el móvil).

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| — | — | — | — |

Ningún repo agrega paquetes:

- `useBlocker` viene en React Router, y `<dialog>` en el navegador.
- `usePreventRemove` viene en expo-router 58, y `Alert` en React Native.
- Reanimated ya está instalado en el móvil (lo pide Expo Router).
- La validación de actividades se escribe a mano, como la de F01, en lugar de
  usar una librería de esquemas (research.md, punto 5).

## Excepciones a la constitución

Ninguna.

## Antes de implementar

- En los tres repos de código, `dev` local está al día con `origin/dev`
  (comprobado el 2026-11-02). `feature/F03-cursar-leccion` se crea desde
  `dev` en cada uno (decisión 0013).
- En `brote_specs` la rama ya existe. Ahí se editan, antes que el código,
  `contrato/` 0.4.0 y `docs/diseno.md`. Después se copia el contrato a cada
  repo, en su rama de F03.
