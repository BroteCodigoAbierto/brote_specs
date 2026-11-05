---
description: "Lista de tareas de F06 Enviar un curso a revisión y publicarlo"
---

# Tareas: F06 Enviar un curso a revisión y publicarlo

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F06-publicar-curso`, creada desde `dev` en cada repo afectado

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase).
- Los mensajes compartidos **siempre** salen de `MENSAJES_EDITOR` en el contrato; ninguna
  tarea los escribe a mano.
- El autor sale **siempre** de la sesión (`usuarioDe(res).id`), nunca de la dirección
  (principio III). Enviar y retirar pasan por `conCursoDelAutor` (T011).
- Toda pieza de interfaz usa los tokens y componentes de `docs/diseno.md`. Lo nuevo se
  agrega ahí primero (T003 y T004). No hay tareas de pantallas en el móvil (decisión 0003).
- El motivo del rechazo se muestra siempre como texto: nada de
  `dangerouslySetInnerHTML` (principio III).
- Textos fijos de la interfaz que no están en el contrato:
  - Panel: "Editar", "Administrar", "Borrador", "En revisión", "Publicado" y "Revisión no
    aprobada".
  - Enviar: "Enviar a revisión", "Guarda los cambios para poder enviarlo.", "Curso enviado
    a revisión." y "No se pudo enviar el curso a revisión.".
  - Curso en revisión: "Un administrador lo revisará antes de publicarlo.", "Retirar de
    revisión", "El curso volvió a borrador." y "No se pudo retirar el curso de revisión.".
  - Curso publicado: "Para editarlo, retíralo del catálogo. Cuando termines, tendrás que
    enviarlo otra vez a revisión.", "Ver curso", "Retirar del catálogo", "El curso se
    retiró del catálogo y volvió a borrador." y "No se pudo retirar el curso del catálogo.".
  - Rechazo: "La revisión no se aprobó." y "Corrígelo y envíalo otra vez.".
  - Lienzo: "Volver al curso".
  - Diálogos: los de la spec, en "Flujo principal".

---

## Fase 1: Preparación

- [X] T001 [specs] En `brote_specs`: desde `dev`, `git switch -c feature/F06-publicar-curso`. La spec y el plan ya están en `dev`; esta tarea commitea `specs/features/F06-publicar-curso/tasks.md`. No incluir `specs/metodologia.txt`, que no es de esta feature
- [ ] T002 [specs] En `contrato/contrato.ts`, aplicar [contracts/contrato.md](./contracts/contrato.md) tal cual: `EstadoCurso`, `CursoDelAutor`, `CursoEnEditor` y `MENSAJES_EDITOR`, y quitar el comentario `// F06 agrega "enRevision".`. Subir `contrato/VERSION` de `0.6.0` a `0.7.0`
- [ ] T003 [specs] En `docs/diseno.md`, sección 4, "Editor (solo web)", de plan.md: agregar `InsigniaEstadoCurso` (`estado`); agregar `Aviso` (cambia) con `titulo`, `icono` y saltos de línea, "Solo en la web"; y cambiar `TarjetaCursoAutor`: siempre enlaza al mapa, con la acción "Editar" o "Administrar" y la `Insignia` "Revisión no aprobada"
- [ ] T004 [specs] En `docs/diseno.md`, sección 5, de plan.md: en **Estado de un curso**, "En revisión" con `Insignia` `acento` y `Hourglass`, y "Revisión no aprobada" con `Insignia` `acento` y `MessageSquareWarning`. En **Mapa del curso**, "Enviar a revisión" (`Boton` primario, `Send`) junto a "Eliminar curso", su nota, la marca de lección vacía (`Insignia` `acento`, `CircleAlert`) y el rechazo (`Aviso` `calido`). Patrón nuevo **Curso que no se edita**
- [ ] T005 [back] En `brote_backend_express`: `git switch dev && git pull --ff-only` y crear `feature/F06-publicar-curso` desde `dev`
- [ ] T006 [P] [web] Igual que T005 en `brote_web_react`
- [ ] T007 [P] [movil] Igual que T005 en `brote_mobile_expo`
- [ ] T008 [specs] Copiar el contrato 0.7.0 a los tres repos: `npm run contrato:copiar` en brote_specs. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo. Es el único cambio del móvil, y ahí `npm run tipos` pasa. En la web también pasa. En el backend falla hasta T010, porque `CursoEnEditor` y `CursoDelAutor` ganan campos obligatorios

---

## Fase 2: Backend (brote_backend_express)

- [ ] T009 [back] En `prisma/schema.prisma`, en `Curso`, agregar `revision String?` y `motivoRechazo String? @map("motivo_rechazo")`, con un comentario que diga los valores (`null`, `"pendiente"` o `"rechazada"`) y que un trigger los limpia al cambiar `publicado` (spec F06). Crear `prisma/migrations/<fecha>_f06_revision_curso/migration.sql` con `npm run bd:migrar -- --create-only --name f06_revision_curso` (si no se puede crear la *shadow database*, escribirla a mano) y agregarle, después de las columnas, el `CHECK` `curso_revision_valida` de research.md, punto 3, tal cual (`IS NOT DISTINCT FROM` en el renglón del motivo), y la función `curso_limpiar_revision` y el trigger `curso_publicado_limpia_revision` de [data-model.md](./data-model.md). Aplicarla (`npm run bd:migrar` o `npx prisma migrate deploy`) y correr `npm run bd:generar`
- [ ] T010 [back] En `src/servicios/editor.ts`, agregar `estadoDelCurso({ publicado, revision })`: `"publicado"` si `publicado`, `"enRevision"` si `revision === "pendiente"` y `"borrador"` en cualquier otro caso. Usarla en `traerCursosDelAutor` y `leerCursoEnEditor`, que seleccionan `revision` (y `motivoRechazo` la segunda) y agregan `revisionRechazada` (`revision === "rechazada"`) y `motivoRechazo`. `crearCurso` responde `estado: "borrador"`, `revisionRechazada: false` y `motivoRechazo: null`
- [ ] T011 [back] En `src/servicios/editor.ts`, partir `conCursoEditable` (research.md, punto 5): `conCursoDelAutor(idAutor, idCurso, mensaje404, accion)` bloquea con `FOR UPDATE`, selecciona `idAutor`, `publicado` y `revision`, responde 404 con `mensaje404` si el curso no es de quien llama y le pasa el curso a `accion`. `conCursoEditable` la usa con `cursoEliminado` y responde 403: `cursoPublicadoAlGuardar` si `publicado`, `cursoEnRevisionAlGuardar` si `revision === "pendiente"`. Un curso con `revision = "rechazada"` se edita. `comprobarCursoAbierto` responde 403 con `cursoPublicado` o `cursoEnRevision`, y `traerCursoEnEditor` deja de usarla: solo comprueba el autor, con el 404 de `MENSAJES_CATALOGO.cursoNoDisponible`
- [ ] T012 [back] En `src/servicios/editor.ts`, agregar `enviarARevision(idAutor, idCurso)` con `conCursoDelAutor` y `cursoNoExiste`. Orden: estado distinto de `"borrador"` → 409 `estadoCambiado`; sin lecciones → 400 `sinLecciones`; lecciones con `jsonb_array_length(actividades) = 0` → 400 `unaLeccionVacia` con una, y `leccionesVacias` con `{n}` reemplazado con dos o más. Si cumple, `tx.curso.update` con `revision: "pendiente"` y `motivoRechazo: null`, y devuelve `leerCursoEnEditor`. `@updatedAt` sube el curso: no hace falta `tocarCurso`
- [ ] T013 [back] En `src/servicios/editor.ts`, agregar `retirarDeRevision(idAutor, idCurso)` (estado `"enRevision"`, escribe `revision: null`) y `retirarDelCatalogo(idAutor, idCurso)` (estado `"publicado"`, escribe `publicado: false`), con `conCursoDelAutor` y `cursoNoExiste`. Otro estado → 409 `estadoCambiado`. Devuelven `leerCursoEnEditor`
- [ ] T014 [back] En `src/rutas/editor.ts`, agregar `POST /cursos/:idCurso/revision`, `DELETE /cursos/:idCurso/revision` y `DELETE /cursos/:idCurso/publicacion`, con `requerirSesion` y sin cuerpo. Las tres responden 200 con `RespuestaCursoEnEditor` ([contracts/api.md](./contracts/api.md)). Actualizar el comentario del orden de comprobaciones
- [ ] T015 [P] [back] En `scripts/datos-prueba.ts` y `scripts/sembrar-cursos.ts` (research.md, punto 12): `CursoPrueba` gana `revision?: "pendiente"` y el sembrado la escribe. "Curso en revisión" queda con `revision: "pendiente"` y su lección gana una tarjeta y una opción múltiple. Curso nuevo "Curso listo para enviar", de la cuenta autor, en borrador, con una lección con actividades y sin las palabras de los criterios de búsqueda (lista al inicio del archivo). Quitar el comentario "en F02 es lo mismo que un borrador". Correr `npm run bd:sembrar`

**Punto de control**: `npm run tipos` y `npm run lint` pasan, `npm run bd:sembrar` funciona y B1 a B7 de [quickstart.md](./quickstart.md), sección 2, responden como dicen.

---

## Fase 3: Web (brote_web_react)

### Base

- [ ] T016 [web] En `src/servicios/editor.ts`, agregar `enviarARevision(idCurso)` (`POST`), `retirarDeRevision(idCurso)` (`DELETE`) y `retirarDelCatalogo(idCurso)` (`DELETE .../publicacion`), que devuelven `RespuestaCursoEnEditor`, y `esContenidoIncompleto(error)` (estado 400). Renombrar `esCursoPublicado` a `esCursoNoEditable`, también en `src/paginas/MapaCurso/MapaCurso.tsx` y `src/paginas/LienzoLeccion/LienzoLeccion.tsx`
- [ ] T017 [P] [web] En `src/utilidades/editor.ts`, agregar `textoLeccionesVacias(n)`: `MENSAJES_EDITOR.unaLeccionVacia` con 1, y `leccionesVacias` con `{n}` reemplazado en los demás casos
- [ ] T018 [P] [web] En `src/componentes/Aviso/Aviso.tsx` y `Aviso.module.css` (docs/diseno.md, sección 4): props opcionales `titulo` (en seminegrita, encima del texto) e `icono` (reemplaza al del tono), y `white-space: pre-line` en el texto. Los avisos que ya existen no cambian
- [ ] T019 [P] [web] Crear `src/componentes/InsigniaEstadoCurso/InsigniaEstadoCurso.tsx` (docs/diseno.md, sección 5, "Estado de un curso"): "Borrador" (`neutro`, `PencilLine`), "En revisión" (`acento`, `Hourglass`) y "Publicado" (`primario`, `Globe`). Usarla en `src/paginas/MapaCurso/DatosCurso.tsx`

### Mi panel y lienzo

- [ ] T020 [web] En `src/componentes/TarjetaCursoAutor/TarjetaCursoAutor.tsx` (docs/diseno.md, sección 4): siempre enlaza a `/editor/:id`. Usa `InsigniaEstadoCurso`, agrega "Revisión no aprobada" con `curso.revisionRechazada`, y la acción dice "Editar" en borrador y "Administrar" en los demás. Actualizar su comentario
- [ ] T021 [P] [web] En `src/paginas/LienzoLeccion/LienzoLeccion.tsx`: con `esCursoNoEditable`, `EstadoVacio` muestra el mensaje del servidor con `leerErrorDeCarga(error)`, en lugar de la constante, y el enlace "Volver al curso" a `/editor/${idCurso}`, en lugar de "Ver curso"

### Mapa del curso (docs/diseno.md, sección 5)

- [ ] T022 [web] En `src/paginas/MapaCurso/ListaLecciones.tsx` y `MapaCurso.tsx` (research.md, punto 8): la lista de lecciones sube a `ContenidoMapa`. `ListaLecciones` recibe `lecciones`, `alCambiarLecciones` (el `setState`, que acepta función) y `marcadas` (`Set<string>`), y deja de tener `leccionesIniciales`. Una lección en `marcadas` cambia "Sin actividades" por `Insignia` `acento` con `CircleAlert`, con el mismo texto
- [ ] T023 [web] Crear `src/paginas/MapaCurso/EnviarRevision.tsx`: el `Boton` primario "Enviar a revisión" con `Send`, la nota "Guarda los cambios para poder enviarlo." con `hayCambios`, y el `Dialogo` de la spec. Props: `idCurso`, `hayCambios`, `ocupado`, `alCambiarOcupado`, `alCambiarLecciones`, `alMarcarVacias`, `alAviso`, `alCambiarCurso` y `alSesionPerdida`. Con una ref contra el doble clic, como `ListaLecciones`. **Al pulsar** (research.md, punto 6): `traerCursoEnEditor` con el botón en `enviando`. Si `estado` no es `"borrador"`, `alCambiarCurso(curso, estadoCambiado)`. Si no, actualiza las lecciones. Sin lecciones, `alAviso(sinLecciones)`. Con vacías, las marca y `alAviso(textoLeccionesVacias(n))`. Si cumple, abre el diálogo. Con 401, `alSesionPerdida`; con 404, `cursoNoExiste`; en otro caso, "No se pudo enviar el curso a revisión."
- [ ] T024 [web] En `src/paginas/MapaCurso/EnviarRevision.tsx`, **al confirmar**: `enviarARevision` con `enviando` en el `Dialogo`. Bien: `alCambiarCurso(curso, "Curso enviado a revisión.")`. El diálogo se cierra en todos los casos. Con `esContenidoIncompleto`, muestra el mensaje del cuerpo y vuelve a pedir el curso para actualizar las lecciones y las marcas. Con `esConflicto`, vuelve a pedirlo y llama `alCambiarCurso(curso, estadoCambiado)`. Con 401, `alSesionPerdida`. En otro caso, `leerErrorDeAccion(error, "No se pudo enviar el curso a revisión.")`
- [ ] T025 [web] Crear `src/paginas/MapaCurso/CursoNoEditable.tsx` (docs/diseno.md, sección 5, "Curso que no se edita"): "Mi panel", `PortadaCurso`, el título, `InsigniaEstadoCurso`, el mensaje (`cursoEnRevision` o `cursoPublicado`) y el texto de cada estado. En revisión: "Retirar de revisión" (`secundario`, `Undo2`), sin confirmación. Publicado: "Ver curso" (primario, `Eye`, navega a `/cursos/:id`) y "Retirar del catálogo" (`secundario`, `EyeOff`). Los dos botones de retirar se conectan en T026. Props: `curso`, `alCambiarCurso` y `alLimpiarAviso`. Sin datos, lecciones ni "Eliminar curso". Al montarse, borra la copia de esa dirección con `tomarCopia` (research.md, punto 8). Estilos en `MapaCurso.module.css`
- [ ] T026 [web] En `src/paginas/MapaCurso/CursoNoEditable.tsx`, las dos acciones. Al empezar, `alLimpiarAviso`. "Retirar de revisión" con `enviando`. "Retirar del catálogo" con el `Dialogo` de la spec, con `enviando`, que se cierra en todos los casos. Bien: `alCambiarCurso(curso, ...)` con el aviso de éxito de cada una. Con `esConflicto`, vuelve a pedir el curso y llama `alCambiarCurso(curso, estadoCambiado)`; si eso falla, muestra `estadoCambiado` ahí. Con 401, nada: `pedir()` ya avisó. En otro caso, `leerErrorDeAccion` con "No se pudo retirar el curso de revisión." o "No se pudo retirar el curso del catálogo.", en un `Aviso` arriba de los botones
- [ ] T027 [web] En `src/paginas/MapaCurso/MapaCurso.tsx` (research.md, punto 8): quitar la rama de `esCursoNoEditable`. Debajo de `usePeticion`, una pantalla con los estados `curso` y `avisoEstado` (`{ texto, tono }`) que muestra arriba ese `Aviso` y elige `ContenidoMapa` (`key` con el estado) si `estado === "borrador"` o `CursoNoEditable`. Su contenedor lleva `tabIndex={-1}` y recibe el foco cuando cambia `curso.estado`, no al montarse
- [ ] T028 [web] En `src/paginas/MapaCurso/MapaCurso.tsx`, en `ContenidoMapa`: montar `EnviarRevision` junto a "Eliminar curso", arriba del `aviso`, en una fila. Guardar `marcadas`. Al pasar `ocupado` a `true`, limpiar `marcadas` y `aviso`, y llamar `alLimpiarAviso` para `avisoEstado`. Con `curso.revisionRechazada`, arriba de `DatosCurso`, `Aviso` `calido` con `MessageSquareWarning`, `titulo` "La revisión no se aprobó." y, en `texto`, el motivo si hay y "Corrígelo y envíalo otra vez." separados por un renglón en blanco
- [ ] T029 [web] `npm run tipos`, `npm run lint` y `npm run formato:revisar` pasan

**Punto de control**: con la cuenta autor, el camino completo funciona: enviar, aprobar con el atajo de [quickstart.md](./quickstart.md), retirar del catálogo y volver a enviar. Las tarjetas muestran cada estado.

---

## Fase 4: Cierre

- [ ] T030 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`: en Curso, `revision`, `motivo_rechazo`, `estado` con tres valores, `revisionRechazada`, la restricción y el trigger. Quitar "hasta F06" y "F06 lo distingue". En "Entidades previstas", sacar el estado "en revisión"
- [ ] T031 [specs] Integrar "Cambios a la navegación" de [plan.md](./plan.md) a `specs/01-navegacion.md`: las tarjetas de "Cursos que creé", el mapa en revisión o publicado, "Ver curso" desde el mapa y "Volver al curso" en el lienzo. Quitar "Un curso publicado no se abre en el editor". Agregar Mapa → Detalle a "Qué viaja entre pantallas"
- [ ] T032 [P] [specs] En `docs/arquitectura.md`, "Publicación de cursos": el rechazo con motivo, retirar del catálogo y el trigger, con los `UPDATE` que usa el administrador para aprobar, rechazar y retirar
- [ ] T033 [specs] `npm run contrato:revisar`: las tres copias coinciden con la oficial
- [ ] T034 [specs] Revisar que `specs/features/F06-publicar-curso/spec.md` coincide con lo que se construyó; si algo cambió, actualizarla

---

## Fase 5: Validación manual

Cada criterio se comprueba con [quickstart.md](./quickstart.md), secciones 2 y 3, y se
marca también en `spec.md`. Antes de los PR, las repeticiones de F02 y F05 de la sección 4:
F06 cambia el mapa y el servicio del editor.

- [ ] V01 [web] Con la cuenta autor, "Curso en borrador" muestra "Borrador" y "Editar"; "Curso en revisión", "En revisión" y "Administrar"; y "Git esencial", "Publicado" y "Administrar".
- [ ] V02 [web] Las tres tarjetas abren el mapa de su curso.
- [ ] V03 [web] Al enviar a revisión el curso de abajo y volver a "Mi panel", ese curso queda primero.
- [ ] V04 [web] En el mapa de un borrador completo veo "Enviar a revisión". Al pulsarlo, pregunta "¿Enviar a revisión?" con "Mientras esté en revisión no podrás editarlo. Un administrador lo revisará antes de publicarlo.". "Cancelar" no cambia nada.
- [ ] V05 [web] Con un borrador sin lecciones, al pulsar "Enviar a revisión" no se pregunta nada: veo "No se envió: el curso no tiene lecciones." y sigue en borrador.
- [ ] V06 [web] Con dos lecciones vacías, al pulsar "Enviar a revisión" no se pregunta nada: veo "No se envió: hay 2 lecciones sin actividades." (con una, "No se envió: hay 1 lección sin actividades.") y esas lecciones llevan su marca con icono.
- [ ] V07 [web] Con el mapa abierto, vacío una lección en otra pestaña. Al confirmar el envío veo "No se envió: hay 1 lección sin actividades." y el curso sigue en borrador.
- [ ] V08 [web] Con el título del curso cambiado sin guardar, "Enviar a revisión" está deshabilitado y veo "Guarda los cambios para poder enviarlo.". Al guardar, se habilita.
- [ ] V09 [web] Con un borrador completo, al confirmar veo "Curso enviado a revisión." y el mapa muestra "Este curso está en revisión y no se puede editar.", sin los datos del curso, sin las lecciones y sin "Eliminar curso". Sigue así al recargar y al cerrar sesión y volver a entrar.
- [ ] V10 [web] Mientras se envía, "Enviar" muestra un indicador y no puedo repetir la acción.
- [ ] V11 [web] Con el servidor apagado, al confirmar veo "No se pudo enviar el curso a revisión." y el curso sigue en borrador; al encender el servidor y enviarlo otra vez, se envía.
- [ ] V12 [web, móvil] Un curso en revisión no aparece en el catálogo ni al buscar su título exacto, aunque entre con la cuenta de su autor.
- [ ] V13 [web] La dirección del detalle de un curso en revisión muestra "Este curso no existe o ya no está disponible.", también con la cuenta de su autor.
- [ ] V14 [web] "Retirar de revisión" deja el curso en "Borrador", sin preguntar, con el aviso "El curso volvió a borrador.", y el mapa se puede editar.
- [ ] V15 [web] Con el servidor apagado, veo "No se pudo retirar el curso de revisión." y el curso sigue en revisión.
- [ ] V16 [web] Un administrador aprueba "Curso en revisión". Al recargar "Mi panel" lo veo como "Publicado", y su mapa muestra "Este curso está publicado y no se puede editar.", "Ver curso" y "Retirar del catálogo".
- [ ] V17 [web, móvil] Ese curso aparece en el catálogo, y un alumno lo cursa de principio a fin con su progreso guardado.
- [ ] V18 [web] "Ver curso" abre su detalle, y volver regresa al mapa.
- [ ] V19 [web] Un administrador rechaza un curso con un motivo. En "Mi panel" lo veo como "Borrador" con "Revisión no aprobada", y su mapa muestra "La revisión no se aprobó.", el motivo con sus saltos de línea y "Corrígelo y envíalo otra vez.".
- [ ] V20 [web] Si lo rechaza sin motivo, veo lo mismo, sin motivo.
- [ ] V21 [web] Un motivo con `<b>hola</b>` y `<script>` se ve tal cual, sin negritas y sin ejecutar nada.
- [ ] V22 [web] Después de un rechazo, el curso se edita como cualquier borrador. Al enviarlo otra vez, el aviso y "Revisión no aprobada" desaparecen.
- [ ] V23 [web] En el mapa de "Git esencial", "Retirar del catálogo" pregunta "¿Retirar este curso del catálogo?" con "Los alumnos dejarán de verlo y no podrán cursarlo, pero conservarán su progreso. Para publicarlo otra vez tendrás que enviarlo a revisión.". "Cancelar" no cambia nada.
- [ ] V24 [web] Al confirmar veo "El curso se retiró del catálogo y volvió a borrador." y el mapa se puede editar.
- [ ] V25 [web, móvil] El curso retirado no aparece en el catálogo, y su detalle muestra "Este curso no existe o ya no está disponible.".
- [ ] V26 [web, móvil] El curso retirado desaparece de "Sigue aprendiendo" (web) y de "Mis cursos" (móvil) para el alumno que lo había empezado.
- [ ] V27 [web, móvil] Con el curso retirado, le agrego una lección con actividades y lo envío; un administrador lo aprueba. El alumno ve otra vez sus lecciones completadas, y el total cuenta la lección nueva.
- [ ] V28 [web, móvil] Si el curso se retira mientras el alumno cursa una lección, al terminarla ve "Esta lección ya no está disponible. Tu progreso no se guardó.".
- [ ] V29 [web] Con el servidor apagado, al confirmar veo "No se pudo retirar el curso del catálogo." y el curso sigue publicado.
- [ ] V30 [web] La dirección del lienzo de una lección de un curso en revisión muestra "Este curso está en revisión y no se puede editar."; la de uno publicado, "Este curso está publicado y no se puede editar.". En los dos casos, "Volver al curso" abre el mapa.
- [ ] V31 [web] Con el lienzo abierto en una pestaña, envío el curso a revisión en otra. Al guardar veo "Este curso está en revisión y no se puede editar. Tus cambios no se guardaron." y lo que escribí sigue en pantalla.
- [ ] V32 [web] Con el lienzo abierto, un administrador publica el curso. Al guardar veo "Este curso está publicado y no se puede editar. Tus cambios no se guardaron." y lo que escribí sigue en pantalla.
- [ ] V33 [web] Con el mapa de un curso en revisión abierto, un administrador lo aprueba. Al pulsar "Retirar de revisión" veo "El estado de este curso cambió en otro lugar." y el mapa muestra el curso publicado.
- [ ] V34 [web] Con el mapa de un borrador abierto en dos pestañas, lo envío en la primera. Al enviarlo en la segunda veo "El estado de este curso cambió en otro lugar." y el mapa muestra el curso en revisión.
- [ ] V35 [web] Con el mapa de un borrador abierto, elimino el curso en otra pestaña. Al enviarlo veo "Este curso ya no existe.".
- [ ] V36 [web] Dado que la sesión expiró, cuando confirmo el envío con un título escrito en "Nueva lección", llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar."; al entrar con la misma cuenta regreso al mapa con ese título, y el curso sigue en borrador.
- [ ] V37 [web] Dado que la sesión expiró, cuando pulso "Retirar de revisión" o confirmo "Retirar del catálogo", llego a "Entrar" con el aviso; al entrar regreso al mapa y el curso sigue como estaba.
- [ ] V38 [web] Con la cuenta B, la dirección del mapa de "Curso en revisión" muestra "Este curso no existe o ya no está disponible." y "Ir a Mi panel".
- [ ] V39 [backend] Enviar o retirar sin sesión se rechaza. Enviar o retirar un curso de otra cuenta responde exactamente igual que con un identificador que no existe.
- [ ] V40 [backend] Enviar, sin pasar por un cliente, un curso sin lecciones o con una lección vacía se rechaza y sigue en borrador.
- [ ] V41 [backend] Enviar un curso en revisión o publicado, retirar de revisión un borrador y retirar del catálogo un borrador se rechazan y no cambian nada.
- [ ] V42 [backend] Cambiar los datos, una lección o el orden de un curso en revisión con la sesión de su autor, o eliminarlo, se rechaza y no cambia nada.

---

## Dependencias

- **Preparación** (fase 1) va antes que todo. T002 → T008; T005 a T007 antes de T008. T003 → T004: el mismo archivo.
- **Backend** (fase 2): T009 → T010 → T011 → T012 → T013 → T014. Las cinco editan `src/servicios/editor.ts` o dependen de él. T015 necesita T009.
- **Web** (fase 3), cuando el backend pasa su punto de control:
  - T016 a T019 en paralelo;
  - T020 necesita T019; T021 necesita T016;
  - T022 → T023 → T024: T023 necesita T016 y T017;
  - T025 necesita T019; T026 necesita T016 y T025;
  - T027 necesita T022 y T025; T028 necesita T018, T024 y T027;
  - T029 al final.
- **Cierre y validación** al final. Los criterios `[backend]` se pueden validar en cuanto termina la fase 2.

## Paralelo, por ejemplo

```text
Preparación: T003→T004 (diseño) ‖ T002→T008 (contrato) ‖ T005 ‖ T006 ‖ T007
Backend:     T009→T010→T011→T012→T013→T014 ‖ T015 después de T009
Web, base:   T016 ‖ T017 ‖ T018 ‖ T019
Web, piezas: T020 ‖ T021 ‖ T022→T023→T024 ‖ T025→T026
Web, mapa:   T027→T028, cuando terminan las dos cadenas de arriba
Cierre:      T030 ‖ T031 ‖ T032
```

## Estrategia

1. Rama, contrato y diseño en `brote_specs` (T001 a T004), porque todo lo demás los usa.
2. Primero la migración (T009): el trigger y el `CHECK` son la parte que no se ve en
   `schema.prisma`. Conviene correr B6 y B7 en cuanto exista el backend.
3. Backend completo y probado con curl (punto de control de la fase 2): ya cubre los
   cuatro criterios `[backend]`.
4. En la web, primero las piezas sueltas y el panel (T016 a T021), que no tocan el mapa.
5. El mapa al final (T022 a T028), que es lo delicado: vale la pena repetir "Lecciones"
   de F05 después de T022, porque mueve la lista de lecciones.
6. Cierre de documentos y validación manual completa (V01 a V42) antes de los PR a `dev`
   de cada repo, con la spec enlazada y los criterios cubiertos. El móvil solo lleva la
   copia del contrato, pero también va en su PR.
