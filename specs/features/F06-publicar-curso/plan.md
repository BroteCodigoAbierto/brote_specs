# Plan técnico: F06 Enviar un curso a revisión y publicarlo

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-11-04 | **Rama**: `feature/F06-publicar-curso`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

`curso.publicado` no cambia. El curso gana `revision` y `motivo_rechazo`, y el `estado`
del contrato se calcula de esos datos (research.md, punto 1). Un trigger limpia la
revisión cuando cambia `publicado`, así que aprobar sigue siendo el `UPDATE` de la
decisión 0014 (punto 2), y un `CHECK` protege lo que se escribe a mano (punto 3). El
backend gana tres rutas: enviar, retirar de revisión y retirar del catálogo, con el
bloqueo del editor (puntos 4 y 5). En la web, el mapa siempre carga: en borrador se
edita y gana "Enviar a revisión"; en revisión o publicado muestra una pantalla nueva con
sus acciones (puntos 7 y 8). Todas las tarjetas de "Cursos que creé" abren el mapa. El
móvil solo recibe la copia del contrato. No hay paquetes nuevos.

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | El plan sigue la spec y sus tres aclaraciones. Al planear, la spec ganó el estado "Comprobando": al pulsar "Enviar a revisión" se pide otra vez el curso (research.md, punto 6) |
| II. Un producto, cuatro repos | sí | Tipos y mensajes en `contrato/` 0.7.0, copiados a los tres repos. El móvil solo recibe la copia |
| III. El backend es la autoridad | no | Ver "Excepciones". Quién, estado y contenido se comprueban en el servidor, con el curso bloqueado. Curso ajeno e inexistente dan el mismo 404, y el autor no tiene ninguna forma de publicar. El motivo se muestra como texto. Lo único fuera del backend: limpiar la revisión al cambiar `publicado` y el `CHECK`, que viven en la base |
| IV. Actividades extensibles | no aplica | No toca actividades |
| V. Estados explícitos | sí | Mapa y tarjeta: borrador, rechazado, en revisión y publicado. Cada acción: listo, en curso (sin repetir) y error (el curso sigue como estaba) |
| VI. Dependencias justificadas | sí | Ningún paquete nuevo |
| VII. Estilo propio | sí | Identificadores en español sin acentos, con el vocabulario de `docs/estilo-codigo.md` (`enRevision`) |
| VIII. Terminado = validado | sí | Cada uno de los 42 criterios tiene pasos en `quickstart.md` |

Revisión después del diseño: sin cambios. La única excepción es la del trigger.

## Cambios al contrato

`contrato/VERSION` 0.6.0 → **0.7.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- `EstadoCurso` gana `"enRevision"`.
- `CursoDelAutor` gana `revisionRechazada`.
- `CursoEnEditor` gana `estado`, `revisionRechazada` y `motivoRechazo`.
- `MENSAJES_EDITOR` cambia `cursoPublicado` y `cursoPublicadoAlGuardar`, y gana
  `cursoEnRevision`, `cursoEnRevisionAlGuardar`, `cursoNoExiste`, `estadoCambiado`,
  `sinLecciones`, `unaLeccionVacia` y `leccionesVacias`.

## Cambios al modelo de datos

- Columnas nuevas en `curso`: `revision` y `motivo_rechazo`, las dos opcionales.
- Restricción `curso_revision_valida` y trigger `curso_publicado_limpia_revision`.
- Sin tablas nuevas. Detalle en [data-model.md](./data-model.md).
- Migración `prisma/migrations/<fecha>_f06_revision_curso/`.
- Al cerrar, `specs/02-modelo-datos.md` recibe todo esto, deja de decir "hasta F06" y
  saca el estado "en revisión" de "Entidades previstas".

## API

Detalle en [contracts/api.md](./contracts/api.md). Todas exigen sesión.

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| POST | `/editor/cursos/:idCurso/revision` | Su autor, en borrador | Envía a revisión. 400 si falta contenido, 409 si el estado cambió |
| DELETE | `/editor/cursos/:idCurso/revision` | Su autor, en revisión | Retira de revisión. 409 si el estado cambió |
| DELETE | `/editor/cursos/:idCurso/publicacion` | Su autor, publicado | Retira del catálogo. 409 si el estado cambió |
| GET | `/editor/cursos/:idCurso` (cambia) | Su autor | Ya no responde 403: trae `estado` en cualquier estado |
| GET | `/editor/cursos/:idCurso/lecciones/:idLeccion` (cambia) | Su autor | 403 con el mensaje según el estado |
| PUT, POST, DELETE | Las de escritura de F05 (cambian) | Su autor, sin publicar ni en revisión | También dan 403 con un curso en revisión |
| GET | `/usuarios/yo/cursos` (cambia) | Con sesión | Cada curso gana `revisionRechazada` |

## Interfaz

Según `docs/diseno.md`. Lo nuevo se agrega **primero** a `docs/diseno.md` (es una tarea).
Va en la subsección "Editor (solo web)", así que no tiene par en el móvil.

### Lo que se agrega a `docs/diseno.md`

- **Componentes** (sección 4, "Editor (solo web)"):

  | Componente | Props clave | Notas |
  |---|---|---|
  | `InsigniaEstadoCurso` | `estado` | La `Insignia` de "Estado de un curso". La usan `TarjetaCursoAutor`, `DatosCurso` y `CursoNoEditable` |
  | `Aviso` (cambia) | `titulo`, `icono` | `titulo` en seminegrita sobre el texto. `icono` reemplaza al del tono. El texto respeta los saltos de línea. Solo en la web |
  | `TarjetaCursoAutor` (cambia) | `curso` | Siempre enlaza al mapa. Acción: "Editar" o "Administrar". Con la revisión rechazada, la `Insignia` "Revisión no aprobada" |

- **Patrones** (sección 5):
  - **Estado de un curso**: agrega "En revisión" con `Insignia` `acento` y `Hourglass`.
    Aparte del estado, "Revisión no aprobada" con `Insignia` `acento` y
    `MessageSquareWarning`.
  - **Mapa del curso**: "Enviar a revisión" es un `Boton` primario con `Send`, al final,
    junto a "Eliminar curso". Debajo, si hay cambios sin guardar, la nota en `nota`
    `textoSuave`. Una lección vacía marcada cambia "Sin actividades" por `Insignia`
    `acento` con `CircleAlert`. El rechazo es un `Aviso` `calido` arriba de los datos.
  - **Curso que no se edita** (nuevo): arriba, `Boton` `enlace` chico "Mi panel". Una
    `Superficie` con `PortadaCurso`, el título en `titulo1`, `InsigniaEstadoCurso`, el
    mensaje en `titulo3`, el texto en `textoSuave` y los botones en fila.
    "Retirar de revisión" es `secundario` con `Undo2`. "Ver curso" es primario con `Eye`.
    "Retirar del catálogo" es `secundario` con `EyeOff`.

### Por pantalla

| Pantalla | Usa | Nuevo |
|---|---|---|
| Mi panel (cambio) | `TarjetaCursoAutor` | `InsigniaEstadoCurso`, "Revisión no aprobada", la acción "Administrar" |
| Mapa, en borrador (cambio) | Lo de F05, `Aviso`, `Dialogo`, `Boton`, `Insignia` | "Enviar a revisión", el `Aviso` del rechazo, la marca de lección vacía |
| Mapa, en revisión o publicado (nuevo) | `Superficie`, `PortadaCurso`, `Boton`, `Aviso`, `Dialogo` | `CursoNoEditable`, `InsigniaEstadoCurso` |
| Lienzo (cambio) | `EstadoVacio` | Mensaje según el estado y "Volver al curso" |

## Por repo

### brote_backend_express

- **Archivos**:
  - `prisma/schema.prisma`: `revision` y `motivoRechazo` en `Curso`, con el comentario
    que avisa del trigger.
  - `prisma/migrations/<fecha>_f06_revision_curso/migration.sql`: columnas, `CHECK`,
    función y trigger.
  - `src/servicios/editor.ts`: el grueso de la feature.
  - `src/rutas/editor.ts`: las tres rutas.
  - `scripts/datos-prueba.ts` y `scripts/sembrar-cursos.ts`: research.md, punto 12.
- **`src/servicios/editor.ts`**:
  - `estadoDelCurso({ publicado, revision })`: la única función que calcula `estado`.
  - `conCursoDelAutor(idAutor, idCurso, mensaje404, accion)`: bloquea y comprueba el
    autor. Selecciona también `revision`, y pasa el curso a `accion`.
  - `conCursoEditable`: la usa y rechaza con 403 un curso publicado o pendiente.
  - `comprobarCursoAbierto`: lo mismo para abrir una lección, con los mensajes de abrir.
    `traerCursoEnEditor` deja de usarla y solo comprueba el autor.
  - `enviarARevision`, `retirarDeRevision` y `retirarDelCatalogo`.
  - `leerCursoEnEditor`, `crearCurso` y `traerCursosDelAutor` agregan los campos nuevos.
- **Validación de entrada**: las rutas nuevas no llevan cuerpo. El contenido se comprueba
  en el servicio, porque depende de la base.
- **Notas**:
  - `retirarDelCatalogo` escribe `publicado: false` con `tx.curso.update`: el trigger
    corre igual, y `@updatedAt` sube el curso (research.md, punto 10).
  - El catálogo, las lecciones y el progreso no se tocan.

### brote_web_react

- **Páginas y rutas**: sin rutas nuevas.
  - `paginas/MapaCurso/MapaCurso.tsx`: quita la rama de `esCursoPublicado`. Agrega la
    pantalla que guarda `curso` y el aviso de arriba, y elige entre `ContenidoMapa` y
    `CursoNoEditable`. Mueve ahí el foco al cambiar de estado (research.md, punto 8).
    `ContenidoMapa` lleva la lista de lecciones y las marcadas, y muestra el rechazo.
  - `paginas/MapaCurso/ListaLecciones.tsx`: recibe `lecciones`, `alCambiarLecciones` y
    `marcadas`.
  - `paginas/LienzoLeccion/LienzoLeccion.tsx`: usa `esCursoNoEditable`, lee el mensaje del
    cuerpo y enlaza "Volver al curso".
- **Componentes**:
  - `paginas/MapaCurso/EnviarRevision.tsx` (nuevo): el botón, la nota, la comprobación y
    la confirmación.
  - `paginas/MapaCurso/CursoNoEditable.tsx` (nuevo): la pantalla en revisión o publicado,
    con sus dos acciones y la confirmación de "Retirar del catálogo".
  - `componentes/InsigniaEstadoCurso/` (nuevo).
  - `componentes/Aviso/` y `componentes/TarjetaCursoAutor/` (cambian).
- **Servicios**: en `servicios/editor.ts`, `enviarARevision`, `retirarDeRevision` y
  `retirarDelCatalogo`, y `esCursoPublicado` pasa a ser `esCursoNoEditable`. En
  `utilidades/editor.ts`, `textoLeccionesVacias(n)`.
- **Estado**: local de la pantalla. Nada global: el estado del curso solo le importa al
  mapa, y "Mi panel" se recarga al entrar.
- **Notas**:
  - Al pulsar: `traerCursoEnEditor` y entonces decide. Curso en otro estado: pasa el
    curso a la pantalla con `estadoCambiado`. Con 404, muestra `cursoNoExiste`, no el
    mensaje de abrir que trae el cuerpo. Sin red, "No se pudo enviar el curso a
    revisión.". Con 401, guarda la copia del mapa.
  - Al confirmar: 400 muestra el cuerpo y vuelve a pedir el curso para marcar lecciones;
    409 vuelve a pedirlo y pasa a su estado.
  - Las marcas y los avisos se limpian al empezar otra acción: `ContenidoMapa` lo hace
    cuando `ocupado` pasa a `true`.
  - `leerErrorDeAccion` no cambia: los 409 de aquí se tratan aparte, porque los de
    `ListaLecciones` significan otra cosa.

### brote_mobile_expo

Solo la copia del contrato. Sin pantallas, rutas ni componentes nuevos (decisión 0003).
Los criterios `[web, móvil]` comprueban que el catálogo y "Mis cursos" respetan
`publicado`, como ya hacen.

## Cambios a la navegación

Se integran a `specs/01-navegacion.md` al cerrar la feature.

- **Web**:
  - Sin rutas nuevas.
  - En "Cursos que creé", todas las tarjetas abren `/editor/:idCurso`: "Editar" un
    borrador y "Administrar" uno en revisión o publicado.
  - `/editor/:idCurso` muestra el mapa en borrador y, en revisión o publicado, la pantalla
    del curso que no se edita. Ya no dice que un curso publicado "no se abre".
  - "Ver curso" abre el detalle desde esa pantalla, y volver regresa al mapa: `Volver`
    usa `navegar(-1)`, así que no cambia.
  - En el lienzo de un curso que no se edita, "Volver al curso" abre el mapa, en lugar de
    "Ver curso".
- **Móvil**: sin cambios.
- **Qué viaja**: Mapa → Detalle del curso: `idCurso`, en la dirección. Nada más.

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| — | — | — | — |

Ningún repo agrega paquetes. Los iconos vienen en Lucide: `Hourglass`, `Send`,
`MessageSquareWarning`, `Undo2`, `Eye` y `EyeOff` existen en la versión instalada
(1.66.0), comprobado el 2026-11-04.

## Excepciones a la constitución

| Qué | Por qué hace falta | Por qué no sirve la opción simple |
|---|---|---|
| Principio III ("Toda regla de negocio y toda validación vive en el backend"): el trigger y el `CHECK` de `curso` son reglas que viven en la base | El administrador aprueba, rechaza y retira escribiendo directo en la base (decisión 0014), así que el backend no está en ese camino. La regla tiene que estar donde ocurre la escritura | Hacer que el backend lo arregle al leer no alcanza: una marca vieja no se distingue de una vigente al retirar el curso. Un script pondría la regla en el código, pero un `UPDATE` a mano, que es lo que dice 0014, la saltaría. Lo decidió el usuario (research.md, punto 2). Se puede quitar cuando exista la pantalla de moderación, que escribiría por la API |

## Antes de implementar

- En los cuatro repos, `dev` local está al día con `origin/dev` (comprobado el
  2026-11-04): `brote_specs` en `962da45`, backend en `e5e543b`, web en `fceacca` y móvil
  en `03fe3cc`. `feature/F06-publicar-curso` se crea desde `dev` en cada uno (decisión
  0013).
- La spec y este plan ya están en `dev` de `brote_specs`, y ahí todavía no hay rama. En
  ella se editan, antes que el código, `contrato/` 0.7.0 y `docs/diseno.md`. Después se
  copia el contrato a cada repo, en su rama de F06.
- La decisión 0014 no cambia, porque aprobar sigue siendo cambiar `publicado`. Su
  pendiente sobre editar un curso publicado queda resuelto en la spec.
