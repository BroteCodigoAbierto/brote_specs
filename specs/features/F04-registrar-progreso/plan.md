# Plan técnico: F04 Registrar y consultar el progreso

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-11-02 | **Rama**: `feature/F04-registrar-progreso`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

Una tabla nueva, `progreso`, guarda una fila por alumno y lección completada,
con el resultado de la última vez. Al llegar a "¡Lección completada!", los dos
clientes mandan `PUT /cursos/:idCurso/lecciones/:idLeccion/progreso` con `{
aciertos, preguntas }`. El servidor comprueba que el resultado cuadre con la
lección: cuenta sus preguntas con `CALIFICA_ACTIVIDAD`, una constante nueva
del contrato (research.md, puntos 1 y 2). Después hace un `upsert`. El
detalle del curso (`GET /cursos/:idCurso`) trae el progreso de cada lección
en la misma respuesta, y `GET /usuarios/yo/cursos-empezados` alimenta la
pestaña "Mis cursos" del móvil y la página "Mi panel" de la web (`/panel`). En
el móvil, el detalle y "Mis cursos" se recargan en silencio al volver a
tenerlos delante (research.md, punto 8).

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | El plan sigue la spec y sus tres aclaraciones. La forma de comprobar los aciertos, que la spec dejaba al plan, la eligió el usuario (research.md, punto 1) |
| II. Un producto, cuatro repos | sí | Tipos y constantes nuevos en `contrato/` 0.5.0, copiados a los tres repos |
| III. El backend es la autoridad | sí | El usuario sale siempre de la sesión. Solo se registran lecciones que se pueden abrir (mismo 404 que F03). El cuerpo se valida entero y el resultado se compara con las preguntas que cuenta el servidor, con un `CHECK` en la base. No se recalifican las respuestas porque el cliente ya las conoce desde F03 (research.md, punto 1) |
| IV. Actividades extensibles | sí | `CALIFICA_ACTIVIDAD` es un `Record<TipoActividad, boolean>` en el contrato. Un tipo nuevo se declara ahí y no hay que tocar nada más (research.md, punto 2) |
| V. Estados explícitos | sí | Guardar: guardando (sin poder salir con el botón), guardado, error y sin conexión (sin perder el resultado), y no disponible. Detalle, Mis cursos y Mi panel: cargando, con datos, vacío, error y sin conexión (móvil) |
| VI. Dependencias justificadas | sí | Ningún paquete nuevo |
| VII. Estilo propio | sí | Identificadores en español sin acentos (`ultimoAvanceEn`, `useGuardarProgreso`) |
| VIII. Terminado = validado | sí | Cada criterio tiene pasos en `quickstart.md` |

Revisión después del diseño: sin cambios ni excepciones.

## Cambios al contrato

`contrato/VERSION` 0.4.0 → **0.5.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- `DetalleCurso.lecciones` pasa de `ResumenLeccion[]` a `LeccionDelCurso[]`
  (`ResumenLeccion & { progreso: ProgresoLeccion | null }`).
- Nuevos: `CALIFICA_ACTIVIDAD`, `ProgresoLeccion`, `LeccionDelCurso`,
  `CuerpoProgresoLeccion`, `RespuestaProgresoLeccion`, `CursoEmpezado`,
  `RespuestaCursosEmpezados` y `MENSAJES_PROGRESO.resultadoInvalido`.

## Cambios al modelo de datos

- Tabla nueva `progreso` (modelo `Progreso`), con clave primaria
  `(id_usuario, id_leccion)`, borrado en cascada desde `user` y `leccion`, y
  un `CHECK` de `0 ≤ aciertos ≤ preguntas`. Detalle en
  [data-model.md](./data-model.md).
- Migración `prisma/migrations/<fecha>_f04_progreso/`.

## API

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| PUT | `/cursos/:idCurso/lecciones/:idLeccion/progreso` | Con sesión | Registra (o reemplaza) el resultado de quien llama en esa lección. 400 si no cuadra con la lección; 404 como el `GET` de F03 |
| GET | `/cursos/:idCurso` (cambia) | Con sesión | Lo de F02 y, en cada lección, el progreso de quien llama |
| GET | `/usuarios/yo/cursos-empezados` | Con sesión | Los cursos publicados en los que quien llama completó alguna lección, del avance más reciente al más antiguo |

## Interfaz

Según `docs/diseno.md`. Lo nuevo se agrega **primero** a `docs/diseno.md`
(es una tarea), después a los dos clientes con el mismo nombre.

### Lo que se agrega a `docs/diseno.md`

- **Componentes** (sección 4), en los dos clientes:

  | Componente | Props clave | Notas |
  |---|---|---|
  | `BarraProgreso` (cambia) | `actual`, `total`, `etiqueta`, `textoValor` | Las dos nuevas son opcionales; sin ellas, lo de F03 ("Progreso de la lección", "Actividad {n} de {total}"). La usa también el avance del curso |
  | `AvanceCurso` | `completadas`, `total` | "{c} de {t} lecciones" en `cuerpoChico` seminegrita y debajo `BarraProgreso` con `etiqueta` "Avance del curso" y `textoValor` "{c} de {t} lecciones completadas". Con el curso terminado, además una `Insignia` `brote` con `CircleCheck` "Curso terminado" |
  | `TarjetaCurso` (cambia) | `curso`, `avance` | Con `avance` (`{ completadas, total }`), en lugar de la descripción y la insignia de lecciones muestra `AvanceCurso`. Es la tarjeta de "Mis cursos" y "Sigue aprendiendo" |
  | `ResultadoLeccion` (cambia) | `titulo`, `aciertos`, `preguntas`, `alVolver`, `guardado`, `alReintentar` | `guardado`: `"guardando"` (texto "Guardando tu progreso…" en `nota` `textoSuave` con un indicador chico; "Volver al curso" con `enviando`), `"guardado"` ("Progreso guardado" en `nota` `broteFuerte` con `CircleCheck`), `"error"` / `"sinConexion"` (`Aviso` `error` con su texto y `Boton` `secundario` chico "Reintentar"), `"noDisponible"` (`Aviso` `error` sin "Reintentar"). El cambio se anuncia (`aria-live` / `accessibilityLiveRegion`) |

- **Patrones** (sección 5):
  - **Detalle del curso con progreso**: debajo de la descripción y antes de
    "Lecciones", una `Superficie` con `AvanceCurso` y, si queda alguna, el
    `Boton` primario "Empezar: 1. {título}" / "Continuar: {n}. {título}"
    con `iconoFinal` `ArrowRight` (en el móvil, a ancho completo).
  - **Lección completada en la lista**: el círculo del número pasa a
    `broteSuave` con el número en `broteFuerte`, y antes de la flecha van un
    `CircleCheck` `broteFuerte` y, si tiene preguntas, "{a} de {p} aciertos"
    en `nota` `textoSuave`. Nombre accesible: "{n}. {título}, completada" y,
    si hay, ", {a} de {p} aciertos".
  - **Página personal** ("Mi panel", web): título `titulo1` "Mi panel" y una
    sección por bloque con su título en `seccion` ("Sigue aprendiendo"),
    cada una con sus propios estados. Las tarjetas en la rejilla de "Listas
    de tarjetas".
- **Navegación** (sección 4):
  - Barra de pestañas (móvil): `Compass` (Explorar), `BookMarked` (Mis
    cursos), `UserRound` (Cuenta).
  - Encabezado (web): enlace "Mi panel" con `LayoutDashboard`, `Boton`
    `fantasma` chico; activo en `primario`. En pantallas angostas queda solo
    el icono, con su nombre accesible.

### Por pantalla

| Pantalla | Usa | Nuevo |
|---|---|---|
| Lección completada (cambio) | `ResultadoLeccion`, `Aviso`, `Boton`, `IndicadorCarga` | Props `guardado` y `alReintentar`; la X deshabilitada mientras guarda |
| Detalle del curso (cambio) | Lo de F02 y F03, `Superficie`, `Boton`, `Insignia` | `AvanceCurso`, el botón Empezar / Continuar y la marca de lección completada |
| Mis cursos (móvil, nueva) | `FondoAmbiental`, `Texto` `titulo1`, `IndicadorCarga`, `EstadoVacio` (icono `BookMarked`), `ErrorCarga`, `Boton`, `RefreshControl` | `TarjetaCurso` con `avance` |
| Mi panel (web, nueva) | `IndicadorCarga`, `EstadoVacio` (icono `BookMarked`), `ErrorCarga`, rejilla de tarjetas | `TarjetaCurso` con `avance`; enlace "Mi panel" en el encabezado |

## Por repo

### brote_backend_express

- **Archivos**:
  - `prisma/schema.prisma`: modelo `Progreso` y las relaciones `progresos` en
    `User` y `Leccion` (data-model.md). Migración `f04_progreso` con el
    `CHECK` agregado a mano. Después, `npm run bd:generar`.
  - `src/validacion/progreso.ts` (nuevo): `validarCuerpoProgreso(cuerpo:
    unknown): CuerpoProgresoLeccion`. Un objeto con exactamente `aciertos` y
    `preguntas`, enteros (`Number.isInteger`) y ≥ 0; si no,
    `ErrorApi(400, MENSAJES_PROGRESO.resultadoInvalido)`.
  - `src/servicios/progreso.ts` (nuevo):
    - `contarPreguntas(actividades: Actividad[])` con `CALIFICA_ACTIVIDAD`.
    - `registrarProgreso(idUsuario, idCurso, idLeccion, cuerpo)`: busca la
      lección con las condiciones de `traerLeccionPublicada` (solo
      `actividades`); si no está, `ErrorApi(404,
      MENSAJES_LECCION.leccionNoDisponible)`. Compara con `contarPreguntas`
      (400) y hace `bd.progreso.upsert({ where: { idUsuario_idLeccion }, create,
      update: { aciertos, preguntas, completadaEn: new Date() } })`. Devuelve
      `ProgresoLeccion`.
    - `traerCursosEmpezados(idUsuario)`: research.md, punto 6. Devuelve
      `CursoEmpezado[]`.
    - `aProgresoLeccion(fila)`: fecha a ISO.
  - `src/servicios/lecciones.ts`: la condición de "lección que se puede
    abrir" (`{ id: idLeccion, idCurso, curso: { publicado: true } }`) pasa a
    una función `dondeLeccionPublicada(idCurso, idLeccion)` que usan el
    `GET` de F03 y `registrarProgreso`, para que no se separen.
  - `src/servicios/cursos.ts`: `traerCursoPublicado(id, idUsuario)` agrega a
    `seleccionDetalle` el `progresos` filtrado por usuario (research.md,
    punto 5), y `aDetalleCurso` arma `LeccionDelCurso` con `progreso` (la
    fila, o `null`).
  - `src/rutas/cursos.ts`: el detalle pasa `usuarioDe(res).id`. Nueva `PUT
    /:idCurso/lecciones/:idLeccion/progreso` con `requerirSesion` →
    `validarCuerpoProgreso(req.body)` → `registrarProgreso`.
  - `src/rutas/usuarios.ts`: `GET /yo/cursos-empezados` con
    `requerirSesion` → `traerCursosEmpezados`.
- **Validación de entrada**: sesión primero (401), después la forma del
  cuerpo (400), la lección (404) y la coherencia con la lección (400), en
  ese orden (contracts/api.md). Un 400 o un 404 no escriben nada.
- **Notas**:
  - Las rutas no usan Prisma (llaman a servicios), como pide `CLAUDE.md`.
  - `express.json()` ya está montado (F01).
  - Comprobar con `npm run tipos` y `npm run lint`.

### brote_web_react

- **Páginas y rutas** (`src/rutas.tsx`): `/panel` → `paginas/Panel/Panel.tsx`,
  dentro del `Layout`, antes de `*`.
- **Mi panel** (`paginas/Panel/Panel.tsx` + `.module.css`): título "Mi
  panel" y la sección "Sigue aprendiendo" con `usePeticion(traerCursosEmpezados)`:
  cargando (`IndicadorCarga`), error (`ErrorCarga` con "Reintentar"), vacío
  (`EstadoVacio` "Todavía no empiezas ningún curso.", "Cuando completes tu
  primera lección, aquí verás tu avance." y un `Link` "Explorar cursos" a
  `/`) y la rejilla de `TarjetaCurso` con `avance`. La página se monta cada
  vez que se entra, así que siempre trae lo último (research.md, punto 8).
- **Layout** (`componentes/Layout/Layout.tsx`): `NavLink` "Mi panel" a
  `/panel` entre la marca y `MenuCuenta`.
- **Detalle del curso** (`paginas/DetalleCurso/DetalleCurso.tsx`):
  - `avanceCurso(curso.lecciones)`. Si hay lecciones, la `Superficie` con
    `AvanceCurso` y el botón Empezar / Continuar, que navega a la lección
    `siguiente` con `state={ESTADO_DESDE_CURSO}` (como la lista, para que
    salir vuelva al detalle).
  - En la lista, las lecciones con `progreso` llevan la marca de completada
    y `textoAciertos`.
- **Lección** (`paginas/Leccion/Leccion.tsx`): con `terminada`, en lugar de
  `ResultadoLeccion` directo, `<LeccionTerminada idCurso idLeccion leccion
  aciertos preguntas alSalir />` (en el mismo archivo), que usa
  `useGuardarProgreso` y pasa `guardado` y `alReintentar` a
  `ResultadoLeccion`. La X de `EncabezadoLeccion` recibe `deshabilitada`
  mientras se guarda.
- **Componentes**: `AvanceCurso` (nuevo); cambian `BarraProgreso`
  (`etiqueta`, `textoValor`), `TarjetaCurso` (`avance`), `ResultadoLeccion`
  (`guardado`, `alReintentar`) y `EncabezadoLeccion` (`deshabilitada`).
- **Hooks**: `hooks/useGuardarProgreso.ts` (research.md, punto 7). El 404 →
  `"noDisponible"`; cualquier otro error → `"error"` (en la web no se
  distingue "sin conexión", spec "Supuestos"). El 401 ya lo maneja `pedir()`.
- **Servicios**: `servicios/progreso.ts` con `guardarProgreso(idCurso,
  idLeccion, cuerpo)` (`PUT`) y `traerCursosEmpezados()`, sobre `pedir()`.
- **Utilidades**: `utilidades/progreso.ts` (research.md, punto 9).
- **Estado**: ninguno global. El progreso vive en la respuesta de cada
  pantalla; el del guardado, en el hook de la pantalla final.
- **Notas**: actualizar en `CLAUDE.md` la lista de componentes
  (`AvanceCurso`).

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**:
  - `src/app/(tabs)/mis-cursos.tsx` (nuevo): título "Mis cursos" en
    `titulo1` y una `FlatList` de `TarjetaCurso` con `avance`, con
    `usePeticion(traerCursosEmpezados)`, `RefreshControl` (deslizar para
    recargar, con los cursos visibles) y
    `useRecargarAlVolver(recargarEnSilencio)`. Estados:
    cargando, error / sin conexión (`ErrorCarga` con `leerErrorDeCarga`),
    vacío (`EstadoVacio` con `Boton` "Explorar cursos" →
    `router.navigate("/")`), y una recarga fallida con cursos en pantalla
    los deja visibles y muestra el `Aviso` de error encima, como el
    catálogo de F02.
  - `src/app/(tabs)/_layout.tsx`: `Tabs.Screen name="mis-cursos"` entre
    `index` y `cuenta`, con `BookMarked`.
  - `src/app/curso/[idCurso].tsx`: lo mismo que la web (avance, botón,
    marca de completada) y `useRecargarAlVolver(recargarEnSilencio)`. El
    botón hace `router.push` a la lección, como la lista.
  - `src/app/leccion/[idCurso]/[idLeccion].tsx`: `LeccionTerminada` con
    `useGuardarProgreso`, como en la web. `ErrorConexion` con `sinConexion`
    → `"sinConexion"`. `usePreventRemove` no cambia (ya no bloquea con
    `terminada`).
- **Componentes**: `AvanceCurso` (nuevo); cambian `BarraProgreso`,
  `TarjetaCurso`, `ResultadoLeccion` y `EncabezadoLeccion`, con las mismas
  props que en la web.
- **Hooks**: `useGuardarProgreso.ts` y `useRecargarAlVolver.ts` (nuevos).
  `usePeticion.ts` gana `recargarEnSilencio()` (research.md, punto 8).
- **Servicios y utilidades**: `servicios/progreso.ts` y
  `utilidades/progreso.ts`, iguales a los de la web.
- **Almacenamiento local**: ninguno. Guardar sin conexión para después es
  F10.
- **Notas**:
  - Comprobar que `useFocusEffect` dispara al volver de la lección al
    detalle (pantalla del `Stack` raíz) y al volver de un detalle a "Mis
    cursos" (pestaña debajo del `Stack`).
  - Actualizar en `CLAUDE.md` la lista de componentes y de pantallas.

## Cambios a la navegación

Se integran a `specs/01-navegacion.md` al cerrar la feature.

- **Web**:
  - `/panel`: "Mi panel", dentro del marco común. El encabezado tiene el
    enlace "Mi panel" en todas las páginas del marco.
  - `/cursos/:idCurso` gana el botón Empezar / Continuar, que abre la
    lección siguiente con `state.desdeCurso` (igual que la lista, F03).
  - De "Mi panel" al detalle y "Cursos" (volver) regresa a "Mi panel".
- **Móvil**:
  - `(tabs)/mis-cursos` deja de estar prevista: pestaña "Mis cursos", entre
    "Explorar" y "Cuenta". La parte de cursos descargados sigue prevista para
    F10.
  - Pulsar un curso de "Mis cursos" abre `curso/[idCurso]` encima de las
    pestañas, como desde "Explorar"; volver regresa a "Mis cursos".
- **Qué viaja**: Mis cursos / Mi panel → Detalle del curso: `idCurso` (como
  desde el catálogo). Detalle → Reproductor con el botón: `idCurso` e
  `idLeccion` (como desde la lista).

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| — | — | — | — |

Ningún repo agrega paquetes:

- `NavLink` viene en React Router; `useFocusEffect`, en expo-router.
- `BookMarked`, `LayoutDashboard`, `CircleCheck` y `ArrowRight` vienen en
  Lucide, que ya está en los dos clientes.
- La validación del cuerpo se escribe a mano, como las de F01 a F03.

## Excepciones a la constitución

Ninguna.

## Antes de implementar

- En los tres repos de código, `dev` local está al día con `origin/dev`, en
  el merge de F03 (comprobado el 2026-11-02). `feature/F04-registrar-progreso`
  se crea desde `dev` en cada uno (decisión 0013).
- En `brote_specs` la rama ya existe. Ahí se editan, antes que el código,
  `contrato/` 0.5.0 y `docs/diseno.md`. Después se copia el contrato a cada
  repo, en su rama de F04.
