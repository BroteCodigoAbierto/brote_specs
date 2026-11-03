# Investigación: F04 Registrar y consultar el progreso

**Plan**: [plan.md](./plan.md)

Solo lo nuevo de esta feature. El stack, `fetch` propio con `usePeticion`,
el contrato por copia y la validación manual ya están decididos
(`docs/decisiones/`).

## 1. Cómo comprueba el servidor el resultado

- **Decisión**: el cliente manda `{ aciertos, preguntas }` y el servidor
  comprueba que **cuadren con la lección**: `preguntas` tiene que ser el
  número de preguntas que la lección tiene hoy, y `aciertos` estar entre 0 y
  `preguntas`. No vuelve a calificar las respuestas. Lo eligió el usuario el
  2026-11-02.
- **Por qué**:
  - Recalificar no evita la trampa: desde F03 las respuestas correctas viajan
    al cliente (research de F03, punto 2), así que quien arme la petición a
    mano también puede mandar las respuestas correctas. Y la pregunta
    abierta se autoevalúa, así que ese acierto siempre depende del alumno.
  - En F04 el resultado no da nada que valga (no hay puntos ni
    calificaciones): solo lo ve el propio alumno.
  - Lo que sí protege la comprobación es la **coherencia** de los datos: no
    puede quedar "5 de 3", ni un resultado de una lección que tenía otras
    preguntas. Además, la base lo refuerza con un `CHECK` (data-model.md).
  - Cumple el principio III: el servidor valida todo lo que recibe y decide
    quién puede registrar qué (solo con sesión, solo lecciones que se pueden
    abrir, solo para sí mismo).
- **Alternativa descartada**: que el cliente mande sus respuestas y el
  servidor las califique con las reglas de F03. Habría que mantener la
  calificación en tres lugares (y la comparación de los espacios, con sus
  reglas de acentos y ñ, en el backend), sin ganar protección real.
- **Para F08**: si los puntos llegan a valer algo, F08 decide si endurece
  esto. Para que sirva de algo, habría que dejar de mandar las respuestas al
  cliente, y eso cambia F03 y F10.

## 2. Qué actividades cuentan como pregunta

- **Decisión**: una constante en el contrato, `CALIFICA_ACTIVIDAD:
  Record<TipoActividad, boolean>`, con `opcionMultiple`, `completarEspacios`
  y `preguntaAbierta` en `true`. Con ella cuentan las preguntas de la
  lección el backend y los dos clientes.
- **Por qué**: el servidor necesita saber cuántas preguntas tiene una lección
  sin depender de los componentes de los clientes. Al ser un `Record` sobre
  `TipoActividad`, cuando una feature agregue un tipo de actividad el
  contrato no compila hasta decidir si se califica. Sigue siendo "agregar un
  tipo" en el contrato (principio IV): no hay que tocar más código.
- **Los clientes**: en F03, `useReproductor` contaba como preguntas los
  resultados que no eran `"sinCalificar"`, que decide cada componente. Eran
  dos reglas: si un componente y el contrato no coincidían, todos los
  guardados de esa lección darían 400. Desde F04, `useReproductor` recibe las
  actividades de la lección y cuenta `preguntas` con `CALIFICA_ACTIVIDAD`;
  los aciertos siguen saliendo de los resultados (`"acierto"`). Si un
  componente de un tipo calificable reportara `"sinCalificar"`, contaría
  como fallo: se ve en el resultado, pero el guardado no falla. Lo decidió
  el usuario el 2026-11-03 (revisión de `/speckit-analyze`).
- **Alternativa descartada**: una lista `TIPOS_PREGUNTA` en el contrato. Al
  agregar un tipo nadie obliga a decidir si va en la lista.

## 3. Dónde se guarda, y repetir la lección

- **Decisión**: tabla `progreso` con clave primaria `(id_usuario,
  id_leccion)` y `upsert` de Prisma: la primera vez crea la fila; al repetir,
  reemplaza `aciertos`, `preguntas` y `completada_en`.
- **Por qué**:
  - La spec pide un registro por lección y el resultado de la última vez,
    sin historial: eso es exactamente una fila por par.
  - Con una sola condición única en el `where` (la clave compuesta) y sin
    escrituras anidadas, Prisma resuelve el `upsert` en la base con `INSERT …
    ON CONFLICT DO UPDATE`
    ([documentación](https://www.prisma.io/docs/orm/reference/prisma-client-reference#database-upserts)).
    Dos dispositivos que completan la misma lección a la vez no chocan, y
    queda el último, como pide la spec.
  - Las relaciones con borrado en cascada hacen que el progreso desaparezca
    con su lección o su usuario, y que el avance cuente solo las lecciones
    que el curso tiene hoy sin filtrar nada.
- **Alternativa descartada**: una tabla de intentos (una fila por cada vez
  que se completa) y el último por consulta. Guarda un historial que la spec
  deja fuera de alcance y complica todas las consultas.

## 4. La API: PUT sobre la lección, y los cursos empezados bajo "yo"

- **Decisión**:
  - Registrar: `PUT /cursos/:idCurso/lecciones/:idLeccion/progreso`.
  - Cursos empezados: `GET /usuarios/yo/cursos-empezados`.
  - El progreso de cada lección viaja en el `GET /cursos/:idCurso` de F02
    (punto 5).
- **Por qué**:
  - `PUT` porque el recurso es "mi progreso en esta lección": hay uno solo y
    se reemplaza. Repetir la petición (p. ej., "Reintentar" después de una
    respuesta que no llegó) deja lo mismo.
  - La ruta cuelga de la lección, con el curso en la dirección, como el
    `GET` de F03: así se reutilizan las mismas reglas (lección de ese curso,
    curso publicado, mismo 404).
  - `/usuarios/yo/...` deja claro que el usuario sale de la sesión, y deja
    `/usuarios/yo/cursos` para los cursos que creo (F05).
- **Alternativa descartada**: `POST /progreso` con `idLeccion` en el cuerpo.
  Habría que repetir la validación de curso y lección por otro camino, y
  `POST` sugiere que cada llamada crea algo nuevo.

## 5. El progreso viaja con el detalle del curso

- **Decisión**: `GET /cursos/:idCurso` agrega a cada lección su `progreso`
  (o `null`). No hay un endpoint aparte para el progreso de un curso.
- **Por qué**:
  - La spec pide que el progreso cargue junto con el detalle, sin que aparezca
    primero el curso y después el avance. Con una sola petición no hay estado
    intermedio.
  - El detalle ya exige sesión (F02), así que siempre hay a quién pedirle el
    progreso. Prisma lo trae en la misma consulta: `lecciones: { select: {
    …, progresos: { where: { idUsuario }, select: { aciertos, preguntas,
    completadaEn } } } }`.
  - Cuántas completó, la barra y la lección siguiente se calculan en el
    cliente a partir de la lista (punto 9): no viajan datos repetidos.
- **Alternativa descartada**: `GET /cursos/:idCurso/progreso` aparte. Dos
  peticiones, dos estados de carga y el parpadeo que la spec prohíbe.

## 6. Consulta de los cursos empezados

- **Decisión**: con Prisma, las filas de `progreso` del usuario cuyas
  lecciones son de cursos publicados, ordenadas por `completadaEn`
  descendente, con el curso, su autor y `_count` de lecciones; después se
  agrupan por curso en el servicio, conservando el orden de la primera
  aparición (la más reciente).
- **Por qué**: un alumno tiene pocas filas (el MVP no pagina esta lista,
  spec "Supuestos"), y así no hace falta SQL a mano: no hay búsqueda sin
  acentos como en el catálogo de F02. El empate de fechas se resuelve
  ordenando también por `idLeccion`, y los cursos que empatan quedan por `id`.
- **Alternativa descartada**: `$queryRaw` con `GROUP BY`. Más rápida con
  muchas filas, pero más código que mantener a mano sin necesidad hoy. Si
  algún día se pagina, se cambia.

## 7. Guardar al terminar, una sola vez

- **Decisión**: cuando el reproductor llega a `terminada`, la página muestra
  `LeccionTerminada`, que usa el hook nuevo `useGuardarProgreso(idCurso,
  idLeccion, { aciertos, preguntas })`. El hook envía el `PUT` al montarse y
  expone `estado` (`"guardando" | "guardado" | "error" | "sinConexion" |
  "noDisponible"`) y `reintentar()`.
  - Un `useRef` marca que ya se envió, para que el doble montaje de
    `StrictMode` en desarrollo no mande dos veces (los refs se conservan
    entre las dos ejecuciones del efecto).
  - La respuesta se ignora si la pantalla ya se desmontó.
  - "Reintentar" vuelve a mandar el mismo cuerpo. No se reintenta solo.
- **Mientras guarda**: "Volver al curso" va con `enviando` (deshabilitado y
  con indicador, sin cambiar de ancho) y la X también se deshabilita, para no
  llegar al detalle antes de que se guarde. El botón de volver del
  navegador y el gesto de atrás no se bloquean: la petición sigue y el
  servidor la registra igual; solo el detalle podría no mostrarla hasta
  recargar. Bloquearlos obligaría a un diálogo más para un caso de una
  fracción de segundo.
- **Después de un error**: "Volver al curso" y la X se habilitan. Salir sin
  guardar no pide confirmación: la spec dice que la lección no queda
  registrada.
- **Alternativa descartada**: guardar en el manejador del último
  "Continuar". Mezcla el reproductor (que no sabe de la red, F03) con el
  guardado, y no da un lugar natural para "Reintentar".

## 8. Que el detalle muestre el avance al volver de la lección

- **Web**: la lección está fuera del `Layout` (F03), así que al volver al
  detalle la página se monta de nuevo y `usePeticion` lo vuelve a pedir. No
  hace falta nada nuevo. Lo mismo pasa con "Mi panel" al entrar.
- **Móvil**: el detalle se queda montado debajo de la lección (F03), y
  "Explorar" y "Mis cursos" debajo del detalle. Hook nuevo
  `useRecargarAlVolver(recargar)`: con `useFocusEffect` de expo-router,
  llama a `recargar()` cada vez que la pantalla vuelve a tener el foco,
  **salvo la primera** (al montarse ya pide los datos). Lo usan el detalle
  del curso y "Mis cursos".
  - Al recargar con datos en pantalla, los datos se quedan (patrón de la
    sección 5 de `docs/diseno.md`) y el `RefreshControl` no se muestra: es
    una recarga silenciosa. Mientras llega, se ve el avance anterior (una
    fracción de segundo; spec, "Supuestos").
  - Si falla, se quedan los datos que había y aparece encima el `Aviso` de
    error o de sin conexión con "Reintentar", como en "Explorar" al deslizar
    hacia abajo (F02). Así no se queda en pantalla, sin avisar, un avance
    viejo que no muestra la lección recién guardada. Lo decidió el usuario
    el 2026-11-03 (revisión de `/speckit-analyze`).
  - `usePeticion` del móvil necesita para esto `recargarEnSilencio()`: pide
    otra vez sin poner `cargando` (así el `RefreshControl` no aparece). Si
    responde, reemplaza los datos y borra el error; si falla, conserva los
    datos y pone el error. `recargar()` sigue como está para "Reintentar" y
    deslizar hacia abajo.
  - El detalle del móvil, que en F02 reemplazaba la pantalla por
    `ErrorCarga` ante cualquier error, pasa a mostrar el `Aviso` encima
    cuando ya tiene datos (también al deslizar hacia abajo). "No
    disponible" sigue reemplazando la pantalla.
- **Alternativa descartada**: un contexto de progreso compartido que la
  lección actualice con la respuesta del `PUT`. Más estado global para algo
  que una recarga resuelve, y no cubriría lo completado en otro
  dispositivo.

## 9. Cálculos del avance en los clientes

En `utilidades/progreso.ts` de cada cliente, iguales en los dos:

- `avanceCurso(lecciones: LeccionDelCurso[])` → `{ completadas, total,
  siguiente }`: `completadas` cuenta las que tienen `progreso`; `total` es
  `lecciones.length` (igual que `cantidadLecciones`); `siguiente` es la
  primera, por posición, sin `progreso`, o `null` si completó todas.
- `textoAvance(completadas, total)` → `"2 de 6 lecciones"`; con `total = 1`,
  `"0 de 1 lección"` / `"1 de 1 lección"`, como `textoCantidadLecciones` de
  F02 ("1 lección").
- `textoAvanceAccesible(completadas, total)` → `"2 de 6 lecciones
  completadas"`; con `total = 1`, `"1 de 1 lección completada"` (spec,
  "Avance de un curso").
- `textoAciertos({ aciertos, preguntas })` → `"2 de 3 aciertos"`, o `null`
  si `preguntas = 0` (la lección se marca sin resultado).
- `textoBotonSiguiente(siguiente, completadas)` → `"Empezar: 1. {título}"`
  si `completadas = 0`, si no `"Continuar: {n}. {título}"`.

## 10. Web: "Mi panel" en `/panel`

- **Decisión**: página `paginas/Panel/Panel.tsx` en `/panel`, dentro del
  `Layout`. El encabezado gana un enlace "Mi panel" (`NavLink`, con
  `aria-current="page"` cuando está activo) entre la marca y el menú de la
  cuenta. El catálogo sigue en `/`.
- **Por qué**: `/mis-cursos` está prevista para los cursos que creo (F05,
  `specs/01-navegacion.md`). "Panel" deja espacio para las secciones que
  llegarán (favoritos, ...), como pidió el usuario. Ir del panel al detalle y
  volver con "Cursos" regresa al panel, porque el detalle vuelve a la página
  anterior (F02).
- **Alternativa descartada**: `/mi-aprendizaje`: describe solo la sección de
  hoy.

## 11. Datos de prueba

- **Decisión**: no se siembra progreso. La cuenta A de la spec es
  `autor@brote.test` y la cuenta B es `autor2@brote.test` (las de F02).
  Después de `npm run bd:sembrar`, las dos empiezan sin progreso, porque
  sembrar borra los cursos de prueba y el progreso cae en cascada.
- **Por qué**: casi todos los criterios empiezan desde "sin progreso" y lo
  construyen cursando en pantalla. Para los que necesitan un punto de partida
  (todas las lecciones de un curso completadas), la guía trae un atajo SQL.
