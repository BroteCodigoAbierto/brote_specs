# Plan técnico: F05 Crear y editar un curso

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-11-03 | **Rama**: `feature/F05-crear-editar-curso`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

El backend gana un grupo de rutas nuevo, `/editor/cursos/...`, separado de las
públicas de F02 y F03. Toda escritura pasa por una función que bloquea el curso y
comprueba que es de quien llama y que no está publicado (research.md, punto 2). La
base solo cambia en una columna: `leccion.version`, que detecta la versión más nueva
sin confundirse al reordenar (punto 4). En la web, "Mi panel" gana la sección
"Cursos que creé" y hay tres pantallas nuevas: nuevo curso, mapa y lienzo. Cada tipo
de actividad define su editor en un registro paralelo al de F03 (punto 8), y la
vista previa y "Probar lección" usan los componentes reales del alumno. Para eso,
las actividades de F03 ganan un contexto que las deja vivir en un recuadro (punto
11). No hay paquetes nuevos: arrastrar usa la API del navegador (punto 13).

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | El plan sigue la spec y sus siete aclaraciones. Lo único que amplía es técnico: los códigos de error y `version` como entero |
| II. Un producto, cuatro repos | sí | Tipos y constantes nuevos en `contrato/` 0.6.0, copiados a los tres repos. El móvil solo recibe la copia |
| III. El backend es la autoridad | sí | El autor sale de la sesión. Curso ajeno e inexistente dan el mismo 404. Publicado: 403 en todo. El servidor revalida cada actividad y comprueba todo bajo un bloqueo, así que publicar mientras se guarda no deja escrituras colgadas. Los textos solo se muestran como texto |
| IV. Actividades extensibles | sí | `registroEditor` obliga a tener entrada por tipo, igual que `registro.ts`. La paleta conoce los 13 identificadores y un tipo se activa solo al entrar al registro (research.md, puntos 8 y 10). La vista previa y "Probar lección" usan el mismo componente que el alumno |
| V. Estados explícitos | sí | Panel, mapa y lienzo: cargando, con datos, vacío, error, no disponible y publicado. Cada acción que guarda: listo, guardando (sin repetir) y error (sin perder lo capturado), también si expira la sesión (research.md, punto 15) |
| VI. Dependencias justificadas | sí | Ningún paquete nuevo |
| VII. Estilo propio | sí | Identificadores en español sin acentos (`traerCursosDelAutor`, `useEditorLeccion`) |
| VIII. Terminado = validado | sí | Cada uno de los 102 criterios tiene pasos en `quickstart.md` |

Revisión después del diseño: sin cambios ni excepciones.

## Cambios al contrato

`contrato/VERSION` 0.5.0 → **0.6.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- `LIMITES_ACTIVIDADES` gana los límites de lo que escribe el autor.
- Nuevos: `EstadoCurso`, `CursoDelAutor`, `RespuestaCursosDelAutor`,
  `CuerpoDatosCurso`, `LeccionEnMapa`, `CursoEnEditor`,
  `RespuestaCursoEnEditor`, `CuerpoNuevaLeccion`, `RespuestaLeccionEnMapa`,
  `CuerpoOrdenLecciones`, `LeccionEnEditor`, `RespuestaLeccionEnEditor`,
  `CuerpoGuardarLeccion`, `LIMITES_CURSO`, `LIMITES_LECCION` y
  `MENSAJES_EDITOR`.

## Cambios al modelo de datos

- Columna nueva `leccion.version`, entero, por defecto 1.
- Sin tablas nuevas. El curso gana reglas de escritura, no columnas. El idioma
  lo define F07. Detalle en [data-model.md](./data-model.md).
- Migración `prisma/migrations/<fecha>_f05_version_leccion/`.
- Al cerrar, `specs/02-modelo-datos.md` recibe `version` y los límites, y el
  idioma pasa de F05 a F07.

## API

Detalle en [contracts/api.md](./contracts/api.md). Todas exigen sesión.

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| GET | `/usuarios/yo/cursos` | Con sesión | Los cursos que creó quien llama, del que cambió más recientemente al más antiguo |
| POST | `/editor/cursos` | Con sesión | Crea un curso como borrador |
| GET | `/editor/cursos/:idCurso` | Su autor | El mapa: datos del curso y lecciones con su cantidad de actividades. 403 si está publicado |
| PUT | `/editor/cursos/:idCurso` | Su autor, sin publicar | Guarda el título y la descripción |
| DELETE | `/editor/cursos/:idCurso` | Su autor, sin publicar | Elimina el curso |
| POST | `/editor/cursos/:idCurso/lecciones` | Su autor, sin publicar | Agrega una lección al final |
| PUT | `/editor/cursos/:idCurso/lecciones-orden` | Su autor, sin publicar | Reordena. 409 si la lista no coincide |
| GET | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor | La lección con sus actividades y su `version` |
| PUT | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Guarda la lección. 409 si hay una versión más nueva y no viene `reemplazar` |
| DELETE | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Elimina la lección y renumera |

## Interfaz

Según `docs/diseno.md`. Lo nuevo se agrega **primero** a `docs/diseno.md` (es una
tarea). El editor solo existe en la web (decisión 0003), así que sus componentes no
tienen par en el móvil: van en una subsección propia, "Editor (solo web)", que dice
esa excepción a la regla de "las mismas props en los dos clientes".

### Lo que se agrega a `docs/diseno.md`

- **Medidas** (sección 2.3): `anchoPaleta` 240 px y `anchoInspector` 440 px. El
  lienzo apila sus tres zonas por debajo de 1024 px.
- **Componentes** (sección 4, "Editor (solo web)"):

  | Componente | Props clave | Notas |
  |---|---|---|
  | `CampoTexto` (cambia) | `maxLongitud`, `deshabilitado` | Solo en la web |
  | `CampoArea` | `id`, `etiqueta`, `valor`, `alCambiar`, `error`, `ayuda`, `maxLongitud`, `filas`, `codigo`, `deshabilitado` | `CampoTexto` de varias líneas, con el mismo aspecto. Con `codigo`, en `--fuente-codigo`. Expone su `ref`, para escribir `___` donde está el cursor |
  | `ListaEditable` | `filas`, `alAgregar`, `alQuitar`, `textoAgregar`, `minimo`, `maximo` | Filas con "Quitar" y un `Boton` `secundario` chico para agregar. La usan los puntos clave, las opciones y las respuestas aceptadas |
  | `BotonesOrden` | `alSubir`, `alBajar`, `esPrimero`, `esUltimo`, `etiqueta` | "Subir" (`ChevronUp`) y "Bajar" (`ChevronDown`), de 44 px, con `aria-disabled` en los extremos (research.md, punto 18) |
  | `TarjetaCursoAutor` | `curso` | `Superficie` con portada, título, `Insignia` del estado, `Insignia` de lecciones y el texto de la acción. Toda la tarjeta es un enlace |
  | `PaletaActividades` | `alAgregar`, `deshabilitada`, `arrastre` | Grupos en `seccion`, tipos como botones con icono. Sin registro: texto en `textoSuave`, icono en `textoTenue` e `Insignia` `neutro` "Próximamente" |
  | `BloqueActividad` | `numero`, `etiqueta`, `icono`, `resumen`, `incompleta`, `seleccionado`, `alSeleccionar`, `alEliminar`, orden | `Superficie` con asa `GripVertical` y un `<button>` con número, tipo y resumen en una línea, hermano de los botones de orden y de "Eliminar". Seleccionado: borde `primario` y fondo `primarioSuave`. Incompleta: `Insignia` `acento` con `CircleAlert` |
  | `VistaPrevia` | `actividad`, `mensaje` | `Superficie` `suave` con "VISTA PREVIA" en `seccion` y "Reiniciar" (`RotateCcw`). Monta la actividad en `AmbitoActividad` |
  | `Dialogo` (cambia) | `enviando` | Pone `enviando` en el botón de confirmar. Solo en la web |
  | `ResultadoLeccion` (cambia) | `textoVolver` | Por defecto, "Volver al curso". Solo en la web |
  | `BarraRespuesta` (cambia) | — | En un `AmbitoActividad` va en línea, no fija. Solo en la web |

- **Patrones** (sección 5):
  - **Página personal**: "Cursos que creé" es otra sección, con su título en
    `seccion` y "Nuevo curso" (`Boton` primario chico, `Plus`) a su derecha.
  - **Estado de un curso**: "Borrador" con `Insignia` `neutro` y `PencilLine`;
    "Publicado" con `Insignia` `primario` y `Globe`. El lima no se usa aquí: no
    es un avance del alumno.
  - **Mapa del curso**: arriba, `Boton` `enlace` chico "Mi panel" con
    `ArrowLeft`. Una `Superficie` con los datos del curso y otra con las
    lecciones. "Guardar cambios" es el `Boton` primario de la pantalla; "Nueva
    lección" y "Agregar", `secundario`. "Eliminar curso" al final, como `Boton`
    `peligro`.
  - **Lienzo de la lección**: fuera del marco común. Barra superior `Superficie`
    pegajosa con "Volver al curso", el título, "Cambios sin guardar" o "Lección
    guardada" en `nota`, "Probar lección" (`secundario`, `Play`) y "Guardar
    lección" (primario). Debajo, una rejilla de `anchoPaleta`, el resto y
    `anchoInspector`.
- **Actividades** (sección 6):
  - **Vista previa**: la actividad real en un recuadro, sin tomar el foco al
    actualizarse, con las teclas solo dentro y la barra de respuesta en línea.
  - **Modo de prueba**: el reproductor con un `Aviso` `info` "Modo de prueba:
    esto no cuenta como progreso." debajo del encabezado.
- **Iconos de la paleta**: Teoría `BookOpen`, Tarjeta `Layers`, Opción múltiple
  `ListChecks`, Completar espacios `TextCursorInput`, Pregunta abierta
  `MessageSquareText`, Emparejar `Link2`, Clasificar `Columns3`, Ordenar
  `ArrowDownUp`, Banco de palabras `WholeWord`, Reto de código `Code`, Terminal
  simulada `SquareTerminal`, Grafo de commits `GitGraph`, Escuchar y repetir
  `Mic`.

### Por pantalla

| Pantalla | Usa | Nuevo |
|---|---|---|
| Mi panel (cambio) | `IndicadorCarga`, `EstadoVacio` (icono `SquarePen`), `ErrorCarga`, `Boton`, rejilla de tarjetas | Sección "Cursos que creé", `TarjetaCursoAutor` |
| Nuevo curso (nueva) | `Superficie`, `CampoTexto`, `Boton`, `Aviso` | `CampoArea` |
| Mapa del curso (nueva) | `PortadaCurso`, `Superficie`, `CampoTexto`, `Boton`, `Aviso`, `Insignia`, `Dialogo`, `EstadoVacio`, `IndicadorCarga`, `ErrorCarga` | `CampoArea`, `BotonesOrden` |
| Lienzo de la lección (nueva) | `Superficie`, `CampoTexto`, `Boton`, `Aviso`, `Insignia`, `Dialogo`, `EstadoVacio`, `IndicadorCarga`, `ErrorCarga` | `PaletaActividades`, `BloqueActividad`, `BotonesOrden`, `CampoArea`, `ListaEditable`, `VistaPrevia` |
| Probar lección (nueva) | `ReproductorLeccion`, `ResultadoLeccion`, `EncabezadoLeccion`, `Aviso` | Props `aviso` y `textoVolver` |

## Por repo

### brote_backend_express

- **Archivos**:
  - `prisma/schema.prisma`: `Leccion.version` (data-model.md). Migración
    `f05_version_leccion`. Después, `npm run bd:generar`.
  - `src/validacion/actividades.ts`: agrega los límites, y en la opción múltiple
    que las opciones no se repitan y sean del mismo tipo. El error lleva
    `indice` (research.md, punto 7).
  - `src/validacion/editor.ts` (nuevo): `validarDatosCurso`,
    `validarNuevaLeccion`, `validarOrdenLecciones` y `validarCuerpoLeccion`, que
    usa `validarActividades`, recorta los títulos y convierte los errores en
    `ErrorApi(400, MENSAJES_EDITOR.datosInvalidos, campos)`.
  - `src/servicios/editor.ts` (nuevo):
    - Internas: `conCursoEditable(idAutor, idCurso, accion)` (research.md, punto
      2), `comprobarCursoAbierto(idAutor, idCurso)` para los `GET` y
      `renumerarLecciones(tx, idsEnOrden)` (punto 3).
    - `traerCursosDelAutor(idAutor)`, `crearCurso`, `traerCursoEnEditor` (con
      `$queryRaw` para `cantidadActividades`, punto 17), `actualizarCurso` y
      `borrarCurso`.
    - `crearLeccion`, `ordenarLecciones`, `traerLeccionEnEditor`,
      `guardarLeccion` (punto 4) y `borrarLeccion`.
    - Todo lo que cambia una lección actualiza `curso.actualizado_en` (punto 5).
  - `src/rutas/editor.ts` (nuevo): las nueve rutas, con `requerirSesion`,
    validación y servicio. `src/rutas/index.ts`: `rutas.use("/editor",
    rutasEditor)`.
  - `src/rutas/usuarios.ts`: `GET /yo/cursos`.
  - `scripts/datos-prueba.ts`: dos cuentas y los datos de research.md, punto 19.
- **Validación de entrada**: sesión (401), forma del cuerpo y datos (400), curso
  (404 o 403), lección (404) y versión (409), en ese orden (contracts/api.md).
  Ningún error escribe nada.
- **Notas**:
  - Las rutas no usan Prisma (llaman a servicios), como pide `CLAUDE.md`.
  - `traerLeccionPublicada` y `traerCursoPublicado` no cambian: los borradores
    siguen sin abrirse por ahí.
  - `bd:sembrar` pasa por los límites nuevos. Correrlo temprano: si algo no
    cabe, falla antes de tocar la base.
  - Comprobar con `npm run tipos` y `npm run lint`.

### brote_web_react

- **Páginas y rutas** (`src/rutas.tsx`): `/editor/nuevo` y `/editor/:idCurso`
  dentro del `Layout`; `/editor/:idCurso/lecciones/:idLeccion` fuera, junto a la
  lección. Quitar del comentario la mención a `/mis-cursos`.
- **Mi panel** (`paginas/Panel/Panel.tsx`): sección `CursosQueCree`, con
  `usePeticion(traerCursosDelAutor)` y sus propios estados.
- **Nuevo curso** (`paginas/NuevoCurso/`): `useFormulario` con
  `validarDatosCurso`. Al crear, navega al mapa con `replace`.
- **Mapa del curso** (`paginas/MapaCurso/`): `usePeticion(traerCursoEnEditor)`,
  con los estados de 404 y 403. Dentro, el formulario de datos, la lista de
  lecciones (research.md, punto 17) y "Eliminar curso".
- **Lienzo de la lección** (`paginas/LienzoLeccion/`): `LienzoLeccion` carga y dibuja los estados, y `EditorLeccion`, con `useEditorLeccion`, dibuja la barra superior, `PaletaActividades`, `Secuencia` e `Inspector`. Con
  `state.probando`, dibuja `ProbarLeccion` (research.md, punto 12).
- **Actividades** (`src/actividades/`):
  - `ambito.ts` (nuevo): el contexto `AmbitoActividad` (research.md, punto 11).
  - `registroEditor.ts` (nuevo) y `tipos.ts` (agrega `EditorActividad<T>`).
  - Dos archivos por tipo: `Teoria/editorTeoria.ts` (borrador, `validar`,
    conversiones y resumen) y `Teoria/FormularioTeoria.tsx`, y lo mismo en
    `TarjetaMemoria/`, `OpcionMultiple/`, `CompletarEspacios/` y
    `PreguntaAbierta/`.
  - `OpcionMultiple.tsx`: las teclas pasan a `useTeclasActividad`.
  - `CompletarEspacios.tsx`: sin `autoFocus` en un ámbito.
  - `ReproductorLeccion.tsx`: prop `aviso`.
- **Editor** (`src/editor/`, lo que no depende del tipo): `paleta.ts`,
  `PaletaActividades/`, `Secuencia/` con `BloqueActividad`, `Inspector/`,
  `VistaPrevia/` y `ProbarLeccion/`.
- **Componentes**: nuevos `CampoArea`, `ListaEditable`, `BotonesOrden` y
  `TarjetaCursoAutor`. Cambian `CampoTexto`, `Dialogo`, `ResultadoLeccion` y
  `BarraRespuesta`.
- **Hooks**:
  - Nuevos: `useEditorLeccion` (`useReducer` con la lección que se edita y las
    acciones agregar, cambiar, mover, quitar, seleccionar, comprobar y guardar;
    guardar y probar usan la misma comprobación, como pide la spec),
    `useSalirSinGuardar` (punto 14), `useArrastrar` (punto 13),
    `useValorDemorado` (punto 11) y `useTeclasActividad` (punto 11).
  - Cambian: `useEnfocarAlMontar` (no enfoca en un ámbito) y `useFormulario`
    (opción `leerError`, punto 17).
- **Servicios**: `servicios/editor.ts`, sobre `pedir()`, con una función por
  ruta, más `esCursoPublicado(error)` y `leerErrorDeAccion(error, respaldo)`.
- **Validación**: `validacion/curso.ts` para el curso y la lección. Las de cada
  actividad van en su editor.
- **Recuperar lo no guardado** (research.md, punto 15):
  `utilidades/copiaEditor.ts`, la clave en `constantes/almacenamiento.ts` y el
  descarte en `SesionProvider`.
- **Estilos**: `--ancho-paleta` y `--ancho-inspector` en `estilos/tokens.css`.
- **Estado**: ninguno global. La lección que se edita vive en
  `useEditorLeccion`, en la página. Por eso "Probar lección" la conserva sin
  contexto.
- **Notas**:
  - Actualizar en `CLAUDE.md` la lista de componentes, la carpeta `editor/` y
    qué hay que tocar para agregar un tipo.
  - Comprobar con `npm run tipos` y `npm run lint`.

### brote_mobile_expo

- Sin pantallas ni componentes nuevos: solo la copia del contrato 0.6.0, con
  `npm run contrato:copiar` desde `brote_specs`. Comprobar con `npm run tipos`.
- Los criterios `[web, móvil]` comprueban que el móvil cursa lo que se creó en
  el editor, sin cambiar su código.

## Cambios a la navegación

Se integran a `specs/01-navegacion.md` al cerrar la feature.

- **Web**:
  - `/mis-cursos` sale de lo previsto: los cursos del autor están en `/panel`, y
    "Mis cursos" queda solo como la pestaña del móvil. La línea de `/panel` deja
    de decir "por ahora solo 'Sigue aprendiendo'".
  - `/editor/nuevo`: nuevo curso, dentro del marco común. Se llega con "Nuevo
    curso". Al crear, reemplaza la entrada del historial por el mapa.
  - `/editor/:idCurso`: mapa del curso, dentro del marco común, deja de estar
    prevista. Se llega con "Editar". "Mi panel" vuelve a `/panel`.
  - `/editor/:idCurso/lecciones/:idLeccion`: lienzo, deja de estar prevista. A
    pantalla completa y fuera del marco común, como la lección. "Volver al
    curso" lleva a `/editor/:idCurso`.
  - "Probar lección" agrega una entrada de historial en la misma dirección, con
    `state.probando`: volver regresa al lienzo.
  - Salir del mapa con datos sin guardar o del lienzo con cambios pide
    confirmación: "¿Salir sin guardar?".
- **Móvil**: sin cambios.
- **Qué viaja**: Mi panel → Mapa del curso: `idCurso` en la dirección. Mapa →
  Lienzo: `idCurso` e `idLeccion` en la dirección. Cualquier pantalla del editor
  → `/entrar`: `state.desde`, como en F01, y lo no guardado va en la copia local
  (research.md, punto 15).

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| — | — | — | — |

Ningún repo agrega paquetes:

- Arrastrar usa la API de HTML5; se descartó `@dnd-kit` (research.md, punto 13).
- `useBlocker` viene en React Router, y `<dialog>` ya lo usa `Dialogo`.
- Los iconos vienen en Lucide, que ya está. Se comprobó que los 13 de la paleta
  existen en la versión instalada.
- La validación se escribe a mano, como en F01 a F04.

## Excepciones a la constitución

Ninguna.

## Antes de implementar

- En los cuatro repos, `dev` local está al día con `origin/dev` (comprobado el
  2026-11-03): `brote_specs` en `0964362`, backend en `685e765`, web en
  `f6a70d2` y móvil en `e188274`. `feature/F05-crear-editar-curso` se crea desde
  `dev` en cada uno (decisión 0013).
- En `brote_specs` todavía no hay rama y la spec y este plan están sin commit.
  Ahí se editan, antes que el código, `contrato/` 0.6.0 y `docs/diseno.md`.
  Después se copia el contrato a cada repo, en su rama de F05.
