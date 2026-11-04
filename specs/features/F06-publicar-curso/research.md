# Investigación: F06 Enviar un curso a revisión y publicarlo

**Plan**: [plan.md](./plan.md)

Solo lo nuevo de esta feature. El stack, `fetch` propio con `usePeticion`, el
contrato por copia y la validación manual ya están decididos
(`docs/decisiones/`).

## 1. La revisión se guarda aparte de `publicado`

- **Decisión**: `curso.publicado` se queda como está, y el curso gana dos columnas:
  `revision` (texto, `null`, `"pendiente"` o `"rechazada"`) y `motivo_rechazo` (texto,
  `null` si no hay). El `estado` del contrato no se guarda: `"publicado"` si
  `publicado`, `"enRevision"` si `revision = "pendiente"` y `"borrador"` en cualquier
  otro caso.
- **Por qué**:
  - La constitución (principio III), la arquitectura y la decisión 0014 dicen que un
    curso es público cuando `publicado = true`. El catálogo, el detalle, las lecciones
    y el progreso ya filtran por esa columna, y siguen sin cambiar.
  - Un solo valor de `revision` impide combinaciones sin sentido, como un curso
    pendiente y rechazado a la vez.
  - Un curso rechazado es un borrador normal que además lleva una marca: se edita y
    se elimina como cualquier otro.
- **Alternativas descartadas**:
  - Un `estado` de tres valores en lugar de `publicado`: obligaba a corregir los tres
    documentos, y el research de F02 (punto 1) ya lo descartó.
  - Dos booleanos, `en_revision` y `rechazado`: permiten el caso imposible de los dos
    en `true`.
  - Un `enum` de PostgreSQL: agrega un tipo a la base para dos valores. Con un `CHECK`
    basta, como en F04 (punto 3).

## 2. Un trigger limpia la revisión cuando cambia `publicado`

- **Decisión** (del usuario, 2026-11-04): un trigger `BEFORE UPDATE OF publicado` en
  `curso` pone `revision` y `motivo_rechazo` en `NULL` cuando `publicado` cambia de
  valor. Aprobar y retirar siguen siendo un solo `UPDATE`:

  ```sql
  UPDATE curso SET publicado = true  WHERE id = '…';   -- aprobar
  UPDATE curso SET publicado = false WHERE id = '…';   -- retirar
  ```

- **Por qué**:
  - La decisión 0014 dice que aprobar es "cambiar `publicado` a `true`". Sin el
    trigger, ese `UPDATE` deja `revision = "pendiente"` puesta. El curso se vería bien
    mientras está publicado, porque `publicado` manda, pero al retirarlo volvería solo
    a "En revisión".
  - No se puede resolver solo con el dato: `publicado` no cambia de significado, así
    que hace falta que algo limpie la marca al cambiarlo.
  - Los `UPDATE` de los quickstarts de F02 a F05 siguen funcionando sin tocarlos.
- **Consecuencia**: es una regla de negocio que vive en la base, lo que rompe la letra
  del principio III. Va en "Excepciones" del plan: el administrador escribe directo en
  la base, así que el backend no está en ese camino y no tiene cómo aplicarla.
  `schema.prisma` no muestra el trigger, por eso lleva un comentario en el modelo.
- **Alternativas descartadas**:
  - Un script `./revisar aprobar "Título"` que cambie los dos datos, con un `CHECK`
    que rechace la combinación. Deja la regla en el código, pero un `UPDATE` de
    `publicado` a mano fallaría, y 0014 dice que basta con él.
  - Solo SQL documentado que cambie los dos datos: es fácil olvidar uno.
- **Comprobado** el 2026-11-04 en PostgreSQL con una tabla temporal: aprobar, retirar
  sin que vuelva a revisión, rechazar con motivo de dos líneas y reenviar.

## 3. Un `CHECK` protege lo que se escribe a mano

- **Decisión**: la restricción `curso_revision_valida`, escrita en la migración porque
  Prisma no sabe declarar `CHECK` (como `progreso_resultado_valido` en F04):

  ```sql
  CHECK (
    (revision IS NULL OR revision IN ('pendiente', 'rechazada'))
    AND NOT (publicado AND revision IS NOT NULL)
    AND (motivo_rechazo IS NULL OR revision IS NOT DISTINCT FROM 'rechazada')
    AND (motivo_rechazo IS NULL OR char_length(motivo_rechazo) <= 1000)
  )
  ```

- **Por qué**: rechazar se escribe a mano en la base. Una errata como `'rechazado'`
  dejaría el curso en un estado que el backend no conoce, y rechazar un curso publicado
  no tiene sentido. El `CHECK` los para con un error claro. No estorba a aprobar: el
  trigger corre antes y limpia la marca.
- **Cuidado**: el tercer renglón necesita `IS NOT DISTINCT FROM`. Con `revision =
  'rechazada'`, un motivo con `revision` en `NULL` da `NULL`, y un `CHECK` acepta `NULL`.
  La primera versión de este diseño tenía ese error, y salió al probarla.

## 4. Enviar y retirar: dos recursos debajo del curso

- **Decisión**:
  - `POST /editor/cursos/:idCurso/revision`: enviar.
  - `DELETE /editor/cursos/:idCurso/revision`: retirar de revisión.
  - `DELETE /editor/cursos/:idCurso/publicacion`: retirar del catálogo.

  Las tres responden 200 con `RespuestaCursoEnEditor`, para que el mapa cambie de
  estado sin volver a pedir nada.
- **Por qué**: cada una es una transición con sus reglas, y el cuerpo no lleva datos.
  `publicacion` no tiene `POST`, y así se ve en la API que el autor no puede publicar.
- **Alternativa descartada**: un `PUT /editor/cursos/:idCurso/estado` con el estado
  pedido. Abre la puerta a pedir `"publicado"`, y obliga a escribir una tabla de
  transiciones para rechazarlo.

## 5. Las transiciones usan el mismo bloqueo que el editor

- **Decisión**: `conCursoEditable` se parte en dos. `conCursoDelAutor` bloquea la fila
  (`SELECT ... FOR UPDATE`) y comprueba que es de quien llama. `conCursoEditable` la usa
  y agrega el rechazo por estado. Enviar y retirar usan `conCursoDelAutor` y comprueban
  su estado de partida, ya con el bloqueo. Orden: sesión (401), curso (404), estado
  (409) y contenido (400).
- **Por qué**: cierra las carreras de la spec sin casos especiales.
  - Enviar mientras otra pestaña guarda una lección: una espera a la otra, y lo que se
    envía es lo último guardado.
  - El `UPDATE` de un administrador espera al bloqueo, así que una aprobación y un
    "Retirar de revisión" no se pisan: la segunda ve el estado real y responde 409.
- **El estado distinto es 409, no 403**: 403 significa "este curso no se edita" y la web
  ya lo trata así. 409 ya significa "lo que tienes en pantalla está viejo" (F05).

## 6. Cuándo se comprueba el contenido

- **Decisión**: la web comprueba al pulsar "Enviar a revisión", pidiendo otra vez el
  curso, y el servidor comprueba al enviar, con el bloqueo. Las lecciones vacías se
  cuentan en la base con `jsonb_array_length(actividades) = 0`, igual que el mapa.
- **Por qué pedir otra vez**: la lista del mapa solo se carga al abrirlo. Si el autor
  agregó actividades en otra pestaña, la lista dice "Sin actividades" y una comprobación
  con esos datos lo bloquearía sin razón. Pedirlo también descubre un curso que cambió
  de estado o se eliminó, antes de preguntar nada.
- **Respuesta del servidor**: un 400 con el mensaje, sin decir qué lecciones son. La web
  ya vuelve a pedir el curso, así que las marca con `cantidadActividades === 0`. No hace
  falta un tipo de error nuevo.
- **Las actividades no se revisan otra vez**: `actividades` solo se escribe después de
  `validarActividades` (spec, "Supuestos").

## 7. El mapa siempre carga; el lienzo no

- **Decisión**: `GET /editor/cursos/:idCurso` deja de responder 403: a su autor le
  responde 200 con `estado`, en cualquier estado. `GET` de una lección sigue
  respondiendo 403, con el mensaje según el estado.
- **Por qué**: la pantalla de un curso que no se edita necesita su título y su estado, y
  un 403 no los trae. El lienzo no muestra nada del curso: solo el mensaje y "Volver al
  curso".
- **Consecuencia**: en la web, `esCursoPublicado` pasa a llamarse `esCursoNoEditable`, y
  el lienzo deja de usar una constante y lee el mensaje del cuerpo, porque hay dos
  posibles. Lo que guarda ya lo hace con `leerErrorDeAccion`.

## 8. El mapa cambia de estado sin recargar

- **Decisión**: debajo de `usePeticion` hay una pantalla que guarda el `curso` y el aviso
  de arriba. Con `estado === "borrador"` muestra `ContenidoMapa`, y si no, el componente
  nuevo `CursoNoEditable`. Las acciones le pasan el curso que devolvió el servidor.
- **Por qué**:
  - `recargar()` de `usePeticion` pone `cargando` en `true`: el indicador se comería el
    aviso "Curso enviado a revisión.".
  - `ContenidoMapa` lleva `key` con el estado, para empezar limpio al volver a borrador.
- **Lecciones**: su lista sube de `ListaLecciones` a `ContenidoMapa`, porque enviar
  necesita actualizarla y marcarla. `ListaLecciones` recibe `lecciones` y el
  `setState`, así que su código sigue casi igual.
- **Foco**: el botón pulsado desaparece al cambiar de estado. La pantalla mueve el foco a
  su contenedor (`tabIndex={-1}`), para no dejar al teclado en el vacío.
- **Copia local**: `CursoNoEditable` borra la copia de esa dirección con `tomarCopia`.
  Sin esto, una copia vieja reaparecería cuando el curso volviera a borrador.

## 9. Los mensajes con cantidad son dos constantes

- **Decisión**: `MENSAJES_EDITOR` gana `unaLeccionVacia` y `leccionesVacias`, esta con
  `{n}`, que se reemplaza en el backend y en la web.
- **Por qué**: el contrato solo tiene tipos y constantes, sin funciones, y los dos lados
  necesitan el mismo texto.

## 10. El orden de "Cursos que creé" sale solo

- **Decisión**: enviar y retirar usan `tx.curso.update`, y `@updatedAt` de Prisma pone
  `actualizado_en`. No hace falta `tocarCurso`.
- **Por qué funciona lo del administrador**: `@updatedAt` lo pone el cliente de Prisma,
  no la base. Un `UPDATE` a mano no toca `actualizado_en`, así que no cambia el orden,
  como pide la spec.

## 11. El aviso del rechazo usa `Aviso`

- **Decisión**: `Aviso` gana `titulo` e `icono`, y su texto respeta los saltos de línea
  (`white-space: pre-line`). El rechazo usa tono `calido` con `MessageSquareWarning`.
- **Por qué**: `docs/diseno.md` ya lista `titulo` en `Aviso`, pero la web nunca lo
  implementó. Tono `error` no sirve: anunciaría una alerta cada vez que se abre el mapa,
  y no es un error de lo que acaba de hacer el autor. El tono `calido` usa `role="status"`.
- **Seguridad**: el motivo llega como texto de React, sin `dangerouslySetInnerHTML`
  (principio III).

## 12. Datos de prueba

- **Decisión**: en `scripts/datos-prueba.ts`:
  - `CursoPrueba` gana `revision?: "pendiente"`, y `sembrar-cursos.ts` la escribe.
  - "Curso en revisión" queda pendiente, y su lección gana actividades, porque el
    criterio de aprobar lo cursa de principio a fin.
  - Curso nuevo "Curso listo para enviar": un borrador con una lección con actividades.
    Ningún otro borrador sirve: "Curso en borrador" tiene una lección vacía.
- **Ya sirven**: "Sin lecciones todavía" (sin lecciones), "Curso en borrador" (una
  vacía) y "¿Cómo se dice hola?" (dos vacías).
- **Alumno**: `creador@brote.test`, con progreso en "Git esencial" por SQL, como en F04.
