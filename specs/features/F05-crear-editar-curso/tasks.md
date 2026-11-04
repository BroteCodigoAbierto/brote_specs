---
description: "Lista de tareas de F05 Crear y editar un curso"
---

# Tareas: F05 Crear y editar un curso

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F05-crear-editar-curso`, creada desde `dev` en cada repo afectado

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase).
- Los límites y los mensajes compartidos **siempre** salen del contrato
  (`LIMITES_CURSO`, `LIMITES_LECCION`, `LIMITES_ACTIVIDADES`, `MENSAJES_EDITOR`,
  `MENSAJES_CATALOGO`, `MENSAJES_LECCION`); ninguna tarea los escribe a mano.
- El autor sale **siempre** de la sesión (`usuarioDe(res).id`), nunca de la
  dirección ni del cuerpo (principio III). Toda escritura pasa por
  `conCursoEditable` (T014).
- Toda pieza de interfaz usa los tokens y componentes de `docs/diseno.md`. Lo nuevo
  se agrega ahí primero (T003 y T004). El editor solo existe en la web (decisión
  0003), así que no hay tareas de componentes en el móvil.
- Los textos de los cursos se muestran siempre como texto: nada de
  `dangerouslySetInnerHTML` (principio III).
- Textos fijos de la interfaz que no están en el contrato:
  - Panel: "Cursos que creé", "Nuevo curso", "Editar", "Ver curso", "Borrador",
    "Publicado", "Todavía no creas ningún curso." y "Crea uno y enseña lo que
    sabes.".
  - Curso: "Crear curso", "Cancelar", "Guardar cambios", "Cambios guardados", "Mi
    panel", "Ir a Mi panel", "Eliminar curso", "Nueva lección", "Agregar", "Subir",
    "Bajar", "Eliminar", "Este curso todavía no tiene lecciones." y "Agrega la
    primera para empezar.".
  - Lienzo: "Volver al curso", "Probar lección", "Guardar lección", "Cambios sin
    guardar", "Lección guardada", "Próximamente", "Incompleta", "Sin contenido",
    "Esta lección todavía no tiene actividades.", "Arrastra un tipo de la paleta o
    púlsalo para agregarlo.", "Elige una actividad para editarla.", "Completa esta
    actividad para ver su vista previa.", "Reiniciar", "Modo de prueba: esto no
    cuenta como progreso." y "Volver al editor".
  - Errores: "No se pudo crear el curso. Inténtalo de nuevo en un momento.", "No se
    pudieron guardar los cambios.", "No se pudo agregar la lección.", "No se pudo
    guardar el nuevo orden.", "No se pudo eliminar la lección.", "No se pudo eliminar
    el curso.", "No se pudo guardar la lección. Tus cambios siguen aquí.", "No se
    guardó: hay {n} actividades incompletas." y "No se puede probar: hay {n}
    actividades incompletas." (con una, "hay 1 actividad incompleta").
  - Diálogos: los de la spec, en "Flujo principal".

---

## Fase 1: Preparación

- [X] T001 [specs] En `brote_specs`: desde `dev`, `git switch -c feature/F05-crear-editar-curso` y commitear `specs/features/F05-crear-editar-curso/` (spec, plan y artefactos). No incluir `specs/metodologia.txt`, que no es de esta feature
- [X] T002 [specs] En `contrato/contrato.ts`, aplicar [contracts/contrato.md](./contracts/contrato.md) tal cual: las claves nuevas de `LIMITES_ACTIVIDADES` y, al final, el bloque "Editor de cursos (F05)". Subir `contrato/VERSION` de `0.5.0` a `0.6.0`
- [X] T003 [specs] En `docs/diseno.md` (plan.md, "Lo que se agrega a docs/diseno.md"): en la sección 2.3, `anchoPaleta` 240 px, `anchoInspector` 440 px y que el lienzo apila sus zonas por debajo de 1024 px. En la sección 4, una subsección "Editor (solo web)" que explique que estos componentes no tienen par en el móvil (decisión 0003), con la tabla del plan: `CampoTexto` (`maxLongitud`, `deshabilitado`), `CampoArea`, `ListaEditable` (además `dibujarFila`), `BotonesOrden`, `TarjetaCursoAutor`, `PaletaActividades`, `BloqueActividad`, `VistaPrevia`, `Dialogo` (`enviando`), `ResultadoLeccion` (`textoVolver`) y `BarraRespuesta` (en línea dentro de un `AmbitoActividad`)
- [X] T004 [specs] En `docs/diseno.md`, agregar de plan.md: en la sección 5, **página personal** ("Cursos que creé" con "Nuevo curso" a la derecha de su título), **estado de un curso** ("Borrador" con `Insignia` `neutro` y `PencilLine`; "Publicado" con `Insignia` `primario` y `Globe`), **mapa del curso** y **lienzo de la lección**. En la sección 6, **vista previa** y **modo de prueba**. En "Iconos", los 13 de la paleta
- [X] T005 [back] En `brote_backend_express`: `git switch dev && git pull --ff-only` y crear `feature/F05-crear-editar-curso` desde `dev`
- [X] T006 [P] [web] Igual que T005 en `brote_web_react`
- [X] T007 [P] [movil] Igual que T005 en `brote_mobile_expo`
- [X] T008 [specs] Copiar el contrato 0.6.0 a los tres repos: `npm run contrato:copiar` en brote_specs. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo. Son solo agregados: `npm run tipos` pasa en los tres. Es el único cambio del móvil

---

## Fase 2: Backend (brote_backend_express)

- [X] T009 [back] En `prisma/schema.prisma`, en `Leccion`, agregar `version Int @default(1)` con el comentario `// sube cada vez que se guarda la lección; reordenar no la cambia (spec F05)`. Generar y aplicar la migración `f05_version_leccion` con `npm run bd:migrar -- --name f05_version_leccion` (o `prisma migrate diff` y `prisma migrate deploy` si no se puede crear la *shadow database*) y correr `npm run bd:generar`
- [X] T010 [P] [back] En `src/validacion/actividades.ts`, que el error diga qué actividad falló sin leerlo de un texto (research.md, punto 7): exportar `class ErrorActividades extends Error` con un campo `indice: number` (declarado aparte, sin `constructor(public ...)`). `validarActividades` lanza `ErrorActividades` con `indice` y el mismo mensaje de hoy, `actividad N (tipo): ...`, también para un tipo desconocido. `scripts/sembrar-cursos.ts` sigue mostrando ese mensaje sin cambios
- [X] T011 [back] En `src/validacion/actividades.ts`, agregar los límites de [data-model.md](./data-model.md) con `LIMITES_ACTIVIDADES` y `largo()`: `teoria` (`titulo` 100, `texto` 5000, `codigo` 2000, `puntosClave` hasta 10 de hasta 200), `tarjeta` (`frente` 200, `reverso` 1000), `opcionMultiple` (`pregunta` 500, `codigo` 2000, opción de texto 200, símbolo 4), `completarEspacios` (`texto` 2000, hasta 20 `___`, hasta 10 aceptadas por espacio) y `preguntaAbierta` (`pregunta` 500, `solucion` 2000). Y dos reglas nuevas en `validarOpcionMultiple`: "Todas las opciones son `{ texto }` o todas `{ simbolo }`" y "Dos opciones no pueden ser iguales. Se comparan recortadas, respetando las mayúsculas"
- [X] T012 [P] [back] Crear `src/validacion/editor.ts` con `validarDatosCurso(cuerpo: unknown): CuerpoDatosCurso` (`titulo` recortado, de 1 a 100; `descripcion` no vacía y de hasta 1000, sin recortar), `validarNuevaLeccion(cuerpo: unknown): CuerpoNuevaLeccion` (`titulo` recortado, de 1 a 100) y `validarOrdenLecciones(cuerpo: unknown): CuerpoOrdenLecciones` (un objeto con `idsLecciones`, lista de textos). Un campo que falta o no es texto cuenta como vacío. Vacío → `MENSAJES_EDITOR.campoObligatorio`; largo → `MENSAJES_EDITOR.textoLargo`, contando con `Array.from(texto).length`. Los errores van en `new ErrorApi(400, MENSAJES_EDITOR.datosInvalidos, campos)`; si `idsLecciones` no sirve, sin `campos`
- [X] T013 [back] En `src/validacion/editor.ts`, `validarCuerpoLeccion(cuerpo: unknown): CuerpoGuardarLeccion` (contracts/api.md): solo las claves `titulo`, `actividades`, `version` y `reemplazar`; `version` entero ≥ 1; `reemplazar` booleano si viene; `actividades` una lista. Si la forma no sirve, `ErrorApi(400, MENSAJES_EDITOR.datosInvalidos)` sin `campos`. Después, `titulo` recortado de 1 a 100 (`campos.titulo`); más de 50 actividades → `campos.actividades` con `MENSAJES_EDITOR.maxActividades`; `validarActividades` capturando `ErrorActividades` → `campos["actividades.N"]` con su `indice` (desde 0) y su mensaje. Devuelve el cuerpo con el título recortado y el `titulo` de cada `teoria` recortado; los demás textos no se tocan
- [X] T014 [back] Crear `src/servicios/editor.ts` con la base (research.md, puntos 2, 3 y 5):
  - `conCursoEditable(idAutor, idCurso, accion)`: `bd.$transaction`; dentro, `tx.$queryRaw` con `SELECT id_autor AS "idAutor", publicado FROM curso WHERE id = ${idCurso} FOR UPDATE`. Sin fila, o de otro autor → `ErrorApi(404, MENSAJES_EDITOR.cursoEliminado)`. `publicado` → `ErrorApi(403, MENSAJES_EDITOR.cursoPublicadoAlGuardar)`. Si no, `accion(tx)`;
  - `comprobarCursoAbierto(idAutor, idCurso)`, para los `GET`, sin bloqueo: mismas condiciones, con `MENSAJES_CATALOGO.cursoNoDisponible` (404) y `MENSAJES_EDITOR.cursoPublicado` (403);
  - `renumerarLecciones(tx, idCurso, idsEnOrden)`: `tx.leccion.updateMany({ where: { idCurso }, data: { posicion: { multiply: -1 } } })` y después `tx.leccion.update` con `posicion: i + 1` por cada id, con un comentario que cite research.md, punto 3. Nunca `posicion: { decrement: 1 }`;
  - `tocarCurso(tx, idCurso)`: `tx.curso.update({ where: { id: idCurso }, data: { actualizadoEn: new Date() } })`;
  - `leerCursoEnEditor(cliente, idCurso)`: el curso y sus lecciones por `posicion`, con `cliente.$queryRaw` y `jsonb_array_length(actividades) AS "cantidadActividades"`.
- [X] T015 [back] En `src/servicios/editor.ts`, los cursos:
  - `traerCursosDelAutor(idAutor)`: `bd.curso.findMany` de `idAutor`, con `orderBy: [{ actualizadoEn: "desc" }, { id: "asc" }]` y `_count` de lecciones; `estado` = `"publicado"` si `publicado`, si no `"borrador"`;
  - `crearCurso(idAutor, datos)`: `publicado` queda en `false` por defecto; devuelve `CursoEnEditor` con `lecciones: []`;
  - `traerCursoEnEditor(idAutor, idCurso)`: `comprobarCursoAbierto` y `leerCursoEnEditor`;
  - `actualizarCurso(idAutor, idCurso, datos)` con `conCursoEditable`;
  - `borrarCurso(idAutor, idCurso)` con `conCursoEditable` y `tx.curso.delete`: lecciones y progreso caen en cascada.
- [X] T016 [back] En `src/servicios/editor.ts`, las lecciones del mapa, todas con `conCursoEditable` y `tocarCurso`:
  - `crearLeccion(idAutor, idCurso, { titulo })`: con `LIMITES_CURSO.leccionesMax` lecciones → `ErrorApi(400, MENSAJES_EDITOR.maxLecciones)`; si no, `posicion` = cantidad + 1 (no hay huecos). Devuelve `LeccionEnMapa` con `cantidadActividades: 0`;
  - `ordenarLecciones(idAutor, idCurso, idsLecciones)`: si la lista no tiene exactamente las lecciones del curso, cada una una vez, `ErrorApi(409, MENSAJES_EDITOR.ordenDesactualizado)`; si no, `renumerarLecciones` y devuelve `leerCursoEnEditor`. No toca `version`;
  - `borrarLeccion(idAutor, idCurso, idLeccion)`: lección que no es de ese curso → `ErrorApi(404, MENSAJES_EDITOR.leccionEliminada)`; si no, la borra y renumera las que quedan.
- [X] T017 [back] En `src/servicios/editor.ts`, la lección del lienzo (research.md, punto 4):
  - `traerLeccionEnEditor(idAutor, idCurso, idLeccion)`: `comprobarCursoAbierto` y `bd.leccion.findFirst({ where: { id: idLeccion, idCurso } })`; sin fila → `ErrorApi(404, MENSAJES_LECCION.leccionNoDisponible)`;
  - `guardarLeccion(idAutor, idCurso, idLeccion, cuerpo)`, con `conCursoEditable`: sin fila → `ErrorApi(404, MENSAJES_EDITOR.leccionEliminada)`; si `!reemplazar` y `version` no es la actual → `ErrorApi(409, MENSAJES_EDITOR.versionMasNueva)`; si no, `tx.leccion.update` con `titulo`, `actividades` y `version: { increment: 1 }`, `tocarCurso`, y devuelve `LeccionEnEditor` con la `version` nueva.
- [X] T018 [back] Crear `src/rutas/editor.ts` con las nueve rutas de [contracts/api.md](./contracts/api.md), cada una con `requerirSesion`, su validación de T012 y T013 y su servicio, en ese orden: `POST /cursos` (201), `GET`, `PUT` y `DELETE /cursos/:idCurso` (204), `POST /cursos/:idCurso/lecciones` (201), `PUT /cursos/:idCurso/lecciones-orden`, y `GET`, `PUT` y `DELETE /cursos/:idCurso/lecciones/:idLeccion` (204). En `src/rutas/index.ts`, `rutas.use("/editor", rutasEditor)`
- [X] T019 [back] En `src/rutas/usuarios.ts`, `rutasUsuarios.get("/yo/cursos", requerirSesion, ...)` → `200` con `RespuestaCursosDelAutor`. Quitar el comentario que decía que `/yo/cursos` quedaba libre
- [X] T020 [P] [back] En `scripts/datos-prueba.ts` (research.md, punto 19): las cuentas `creador@brote.test` y `creador2@brote.test` en `CUENTAS_PRUEBA`, sin cursos; los borradores de `autor@brote.test` "Curso con cien lecciones" (`leccionesNumeradas(100)`) y "Lección con el máximo", con una lección de 50 tarjetas; y "Texto <b>hola</b> <script>" gana una lección con `HTML` en su título y las cinco actividades de "Textos con etiquetas", sacadas a una constante para no repetirlas
- [X] T021 [back] `npm run tipos` y `npm run lint` sin errores. `npm run bd:sembrar` pasa con los límites nuevos: si un curso del prototipo no cupiera, se detiene aquí y se revisa el límite con el usuario, sin cambiarlo por su cuenta

**Punto de control**: quickstart.md, sección 2 (B1 a B9), responde como dice.

---

## Fase 3: Web (brote_web_react)

### Base

- [X] T022 [P] [web] Crear `src/servicios/editor.ts` sobre `pedir()`, con `encodeURIComponent` en los identificadores: `traerCursosDelAutor`, `crearCurso`, `traerCursoEnEditor`, `actualizarCurso`, `borrarCurso`, `crearLeccion`, `ordenarLecciones`, `traerLeccionEnEditor`, `guardarLeccion` y `borrarLeccion`, con las rutas de [contracts/api.md](./contracts/api.md). Además: `esCursoPublicado(error)` (`ErrorHttp` 403), `esConflicto(error)` (409), `esSesionPerdida(error)` (401) y `leerErrorDeAccion(error, respaldo)`, que devuelve el `error` del cuerpo con 403 o 404 y `respaldo` en cualquier otro caso
- [X] T023 [P] [web] Crear `src/validacion/curso.ts`: `validarDatosCurso(valores: Record<"titulo" | "descripcion", string>)`, para `useFormulario`, y `validarTituloLeccion(titulo: string): string | undefined`. Vacío o solo espacios → `MENSAJES_EDITOR.campoObligatorio`
- [X] T024 [P] [web] En `src/estilos/tokens.css`, `--ancho-paleta: 15rem` y `--ancho-inspector: 27.5rem`, junto a `--ancho-leccion` (`docs/diseno.md`, sección 2.3)
- [X] T025 [P] [web] En `src/hooks/useFormulario.ts`, opción `leerError?: (error: unknown) => ErrorDeEnvio`, por defecto `leerErrorDeEnvio` (research.md, punto 17). F01 no cambia
- [X] T026 [P] [web] Crear `src/hooks/useValorDemorado.ts`: `useValorDemorado<T>(valor: T, espera = 300): T`, que devuelve el valor cuando deja de cambiar (research.md, punto 11)
- [X] T027 [P] [web] Crear `src/hooks/useArrastrar.ts` (research.md, punto 13): `useArrastrar<T>({ alSoltar: (item: T, destino: number) => void })`, con la API de HTML5. Devuelve `propsOrigen(item)`, `propsDestino(indice)` (con la mitad del elemento decide si suelta antes o después), `propsZona(total)` (para soltar en una lista vacía o al final)  y `destino`, para dibujar la línea
- [X] T028 [P] [web] Crear `src/hooks/useSalirSinGuardar.ts` (research.md, punto 14): `useSalirSinGuardar(hayCambios: boolean)`. `useBlocker` con `hayCambios && !saliendo.current && currentLocation.pathname !== nextLocation.pathname`, y un `beforeunload` solo mientras hay cambios. Devuelve `propsDialogo` para `Dialogo` ("¿Salir sin guardar?", "Perderás los cambios que no guardaste.", "Salir", "Seguir aquí") y `salirSinPreguntar()`
- [X] T029 [P] [web] Copia de lo no guardado (research.md, punto 15). En `src/constantes/almacenamiento.ts`, `copiaEditor: "editor.copia"`. Crear `src/utilidades/copiaEditor.ts` con `guardarCopia({ idUsuario, ruta, datos })`, `tomarCopia<T>(idUsuario, ruta): T | null` (lee y borra solo si coinciden los dos) y `descartarCopiaAjena(idUsuario)`, todas con `try/catch`. En `src/contextos/SesionProvider.tsx`, un efecto que llama a `descartarCopiaAjena` cuando cambia `estado.usuario`

### Actividades en un recuadro (docs/diseno.md, sección 6)

- [X] T030 [web] Crear `src/actividades/ambito.ts`: `export const AmbitoActividad = createContext<{ contenedor: RefObject<HTMLElement | null> } | null>(null)` y `useAmbito()`. En `src/hooks/useEnfocarAlMontar.ts`, no enfocar si hay ámbito. Con `null`, todo sigue exactamente como en F03 (research.md, punto 11)
- [X] T031 [web] Crear `src/hooks/useTeclasActividad.ts`: `useTeclasActividad(manejador)`, que registra `keydown` en `document` con `useEffectEvent` e ignora los eventos de afuera del `contenedor` si hay ámbito. En `src/actividades/OpcionMultiple/OpcionMultiple.tsx`, usarlo en lugar de su `useEffect`
- [X] T032 [web] En `src/componentes/BarraRespuesta/BarraRespuesta.tsx`, usar `useTeclasActividad` y, si hay ámbito, agregar la clase `enLinea`. En `BarraRespuesta.module.css`, `.enLinea { position: static; padding: 0; }`. Sin ámbito, sigue fija abajo
- [X] T033 [P] [web] En `src/actividades/CompletarEspacios/CompletarEspacios.tsx`, `autoFocus={i === 0 && !ambito}`, con `useAmbito()`. Es el único componente de actividad que toma el foco sin `useEnfocarAlMontar`
- [X] T034 [P] [web] En `src/componentes/ResultadoLeccion/ResultadoLeccion.tsx`, prop `textoVolver = "Volver al curso"`, también en `textoEnviando`. En `src/actividades/ReproductorLeccion/ReproductorLeccion.tsx` y su `.module.css`, prop `aviso?: ReactNode`, entre el encabezado y `main`, con el ancho de `--ancho-leccion`

### Componentes (docs/diseno.md, sección 4, "Editor (solo web)")

- [X] T035 [P] [web] En `src/componentes/CampoTexto/CampoTexto.tsx`, props `maxLongitud?: number` (`maxLength`) y `deshabilitado?: boolean` (`disabled`)
- [X] T036 [P] [web] Crear `src/componentes/CampoArea/CampoArea.tsx` y `.module.css`: como `CampoTexto`, pero con `<textarea>`. Props `id`, `etiqueta`, `valor`, `alCambiar`, `error`, `ayuda`, `maxLongitud`, `filas` (por defecto 4), `codigo` (`--fuente-codigo`), `deshabilitado` y `ref`, para leer el cursor. `resize: vertical`
- [X] T037 [P] [web] Crear `src/componentes/ListaEditable/ListaEditable.tsx` y `.module.css`: genérico sobre `T extends { id: string }`, con `filas`, `dibujarFila(fila, indice)`, `alAgregar`, `alQuitar(id)`, `textoAgregar`, `minimo`, `maximo` y `deshabilitada`. Cada fila lleva "Quitar", deshabilitado con `filas.length <= minimo`. El botón de agregar, `Boton` `secundario` chico con `Plus`, se deshabilita con `filas.length >= maximo`
- [X] T038 [P] [web] Crear `src/componentes/BotonesOrden/BotonesOrden.tsx` y `.module.css` (research.md, punto 18): props `alSubir`, `alBajar`, `esPrimero`, `esUltimo` y `etiqueta`. Dos botones de 44 px con `ChevronUp` y `ChevronDown`, de nombre "Subir {etiqueta}" y "Bajar {etiqueta}". En los extremos, `aria-disabled` y sin acción, **no** `disabled`. Después de mover, devuelve el foco al botón con `requestAnimationFrame`
- [X] T039 [P] [web] Crear `src/componentes/TarjetaCursoAutor/TarjetaCursoAutor.tsx` y `.module.css` (`docs/diseno.md`, sección 5, "Estado de un curso"): `Superficie como={Link}`, a `/editor/{id}` si es borrador y a `/cursos/{id}` si está publicado, con `PortadaCurso`, el título, las dos `Insignia` (el estado, y lecciones con `textoCantidadLecciones`) y el texto "Editar" o "Ver curso" con `ArrowRight`
- [X] T040 [P] [web] En `src/componentes/Dialogo/Dialogo.tsx`, prop `enviando?: boolean`: va al botón de confirmar, deshabilita el de cancelar e ignora Esc mientras dura

### Mi panel y mapa del curso

- [X] T041 [web] En `src/paginas/Panel/Panel.tsx` y `Panel.module.css` (`docs/diseno.md`, sección 5, "Página personal"): sección `CursosQueCree`, debajo de `SigueAprendiendo`, con `usePeticion(traerCursosDelAutor)` y sus propios estados: cargando (`IndicadorCarga`), error (`ErrorCarga`), vacío (`EstadoVacio` con `SquarePen`, "Todavía no creas ningún curso." y "Crea uno y enseña lo que sabes.") y rejilla de `TarjetaCursoAutor`. "Nuevo curso" (`Boton` chico con `Plus`, a `/editor/nuevo`) a la derecha del título, visible en todos los estados. Quitar del comentario "Por ahora solo"
- [X] T042 [web] Crear `src/paginas/NuevoCurso/NuevoCurso.tsx` y `.module.css` (`docs/diseno.md`, sección 5, "Formularios"): `CampoTexto` Título y `CampoArea` Descripción, con sus límites; "Crear curso" con `enviando` y "Cancelar" a `/panel`. `useFormulario` con `validarDatosCurso`, `inicial` de `tomarCopia` o vacío, y `leerError` que cambia `MENSAJE_SIN_SERVIDOR` por "No se pudo crear el curso. Inténtalo de nuevo en un momento.". `enviar`: `crearCurso` y `navegar` al mapa con `replace`; con `esSesionPerdida`, `guardarCopia` antes de relanzar. En `src/rutas.tsx`, `/editor/nuevo` dentro del `Layout`
- [X] T043 [web] Crear `src/paginas/MapaCurso/MapaCurso.tsx` y `.module.css` (`docs/diseno.md`, sección 5, "Mapa del curso"): `usePeticion` con `traerCursoEnEditor`, con cargando, 404 (`EstadoVacio` con el mensaje y `Link` "Ir a Mi panel"), 403 (`esCursoPublicado`: `EstadoVacio` con `MENSAJES_EDITOR.cursoPublicado` y `Link` "Ver curso") y error (`ErrorCarga`). Con datos, "Mi panel" (`Boton` `enlace` con `ArrowLeft`), `PortadaCurso`, `Insignia` "Borrador" y `ContenidoMapa`, un componente interno con `key` del curso. En `src/rutas.tsx`, `/editor/:idCurso` dentro del `Layout`, y quitar del comentario la mención a `/mis-cursos`
- [X] T044 [web] Crear `src/paginas/MapaCurso/DatosCurso.tsx`: `useFormulario` con `validarDatosCurso` y `leerError` ("No se pudieron guardar los cambios."; 403 y 404 con `leerErrorDeAccion`). "Guardar cambios" es el `Boton` primario de la pantalla, deshabilitado si los valores son los guardados; al guardar, "Cambios guardados" hasta el siguiente cambio. Recibe de `ContenidoMapa` (T047) `inicial`, `ocupado`, `alCambiarOcupado`, `alCambiarPendientes(hayCambios)`, `alCambiarCapturado(valores)` y `alSesionPerdida()`, que llama con `esSesionPerdida`
- [X] T045 [web] Crear `src/paginas/MapaCurso/ListaLecciones.tsx`: la lista en estado local, numerada, cada una con su título (enlace al lienzo), su cantidad ("Sin actividades", "1 actividad", "{n} actividades"), `BotonesOrden` y "Eliminar" (`Boton` `fantasma` chico; `Dialogo` con `enviando`, "¿Eliminar esta lección?", "Se borrará con todas sus actividades. No se puede deshacer.", "Eliminar", "Cancelar"). Sin lecciones, "Este curso todavía no tiene lecciones." y "Agrega la primera para empezar."
- [X] T046 [web] En `src/paginas/MapaCurso/ListaLecciones.tsx`, las acciones: "Nueva lección" (`Boton` `secundario`) abre un `CampoTexto` con "Agregar" (`secundario`, con `enviando` para que no se pueda repetir mientras se crea; `validarTituloLeccion`; deshabilitado con `LIMITES_CURSO.leccionesMax`, con `MENSAJES_EDITOR.maxLecciones`). Arrastrar con `useArrastrar`. Reordenar muestra el orden nuevo al instante; si falla, vuelve al anterior con "No se pudo guardar el nuevo orden." y con 409 vuelve a pedir la lista. Una región `role="status"` oculta anuncia "Movida a la posición {n}". Los errores usan `leerErrorDeAccion`. Recibe de `ContenidoMapa` `ocupado` y `alCambiarOcupado` (mientras dura una acción, nada se puede repetir ni mover), `tituloInicial`, `alCambiarCapturado(titulo)` y `alSesionPerdida()`, que llama cualquier acción con `esSesionPerdida`

- [X] T047 [web] En `src/paginas/MapaCurso/MapaCurso.tsx`, `ContenidoMapa`:
  - toma la copia una sola vez con `tomarCopia` y reparte `inicial` y `tituloInicial`;
  - guarda en una ref lo capturado (`titulo`, `descripcion` y el título de "Nueva lección"), y `alSesionPerdida()` lo escribe con `guardarCopia`. Lo usan `DatosCurso`, `ListaLecciones` y eliminar el curso (research.md, punto 15);
  - un estado `ocupado`: mientras una acción guarda, el formulario, la lista y "Eliminar curso" quedan deshabilitados (spec, "Mientras se guarda");
  - `useSalirSinGuardar(hayCambios)` con su `Dialogo`, y "Eliminar curso" (`Boton` `peligro`, al final; `Dialogo` con `enviando`, "¿Eliminar este curso?", "Se borrará con todas sus lecciones. No se puede deshacer."). Al eliminar, `salirSinPreguntar()` y `navegar("/panel")`. Si falla, `Aviso` con `leerErrorDeAccion(error, "No se pudo eliminar el curso.")`.

### Editor de cada tipo de actividad

- [X] T048 [web] En `src/actividades/tipos.ts`, agregar `ErroresBorrador` (`Record<string, string>`), `PropsFormularioActividad<B>` (`borrador`, `alCambiar`, `errores`, `idBase`, `deshabilitado`) y `EditorActividad<T, B>` con `crearBorrador`, `aBorrador`, `aActividad`, `validar`, `resumen` y `Formulario` (research.md, punto 8)
- [X] T049 [P] [web] Crear `src/actividades/Teoria/editorTeoria.ts` (borrador, conversiones, `validar` y `resumen`) y `FormularioTeoria.tsx` (un solo componente). Borrador `{ titulo, texto, codigo, puntosClave: { id, texto }[] }`. `validar`: `texto` vacío. `aActividad`: quita `titulo`, `codigo` y `puntosClave` vacíos y los puntos vacíos; `titulo` recortado. `resumen`: el título o el texto. Formulario: `CampoTexto` Título, `CampoArea` Texto con "Separa los párrafos con un renglón en blanco.", `CampoArea` `codigo` Código con "Las líneas que empiezan con +, - o @@ se resaltan como un diff." y `ListaEditable` Puntos clave (`minimo` 0, `maximo` 10, "Agregar punto"), con sus límites
- [X] T050 [P] [web] Crear `src/actividades/TarjetaMemoria/editorTarjeta.ts` (borrador, conversiones, `validar` y `resumen`) y `FormularioTarjeta.tsx` (un solo componente). Borrador `{ frente, reverso }`, los dos obligatorios, con `frenteMax` y `reversoMax`, en `CampoArea`. `resumen`: el frente
- [X] T051 [P] [web] Crear `src/actividades/OpcionMultiple/editorOpcionMultiple.ts` (borrador, conversiones, `validar` y `resumen`) y `FormularioOpcionMultiple.tsx` (un solo componente). Borrador `{ pregunta, codigo, tipoOpciones: "texto" | "simbolo", opciones: { id, valor }[], idCorrecta: string | null }`, con dos opciones vacías al crear. `validar`, con clave por campo: `pregunta`; `opciones.{id}` vacía, repetida (recortadas, respetando mayúsculas; la segunda lleva `opcionRepetida`) o de más de 4 con "Símbolo" (`simboloLargo`); `correcta` sin `idCorrecta` (`opcionCorrectaFalta`). `aActividad`: `{ texto }` o `{ simbolo }` según el tipo, y `correcta` como índice. Formulario: Pregunta (`preguntaMax`), Código (`codigoMax`), tipo de opciones (al cambiarlo lo escrito se conserva), `ListaEditable` (`minimo` 2, `maximo` 9, "Agregar opción") con un radio "Correcta" por fila y `maxLongitud` `opcionTextoMax` u `opcionSimboloMax`, según el tipo. Quitar la correcta deja `idCorrecta` en `null`
- [X] T052 [P] [web] Crear `src/actividades/CompletarEspacios/editorCompletarEspacios.ts` (borrador, conversiones, `validar` y `resumen`), `FormularioCompletarEspacios.tsx` (un solo componente) y `grupos.ts`, para que el formulario y su editor no se importen entre sí. Borrador `{ texto, grupos: { id, aceptadas: { id, texto }[] }[] }`. `ajustarGrupos(texto, grupos)`, al cambiar el texto y con `partirEnEspacios`: si faltan grupos, agrega vacíos al final; si sobran, quita solo los vacíos. `validar`: `texto` vacío; sin `___` (`sinEspacios`); más de 20 (`demasiadosEspacios`); más grupos que `___` (`gruposDeMas`); grupo sin respuesta con texto. `aActividad` quita las respuestas vacías. Formulario: `CampoArea` `codigo` (`textoEspaciosMax`) con "Cada ___ es un espacio que el alumno llena." y "Agregar espacio", que escribe `MARCA_ESPACIO` en `selectionStart` con el `ref`; por grupo, "Espacio {n}" y `ListaEditable` (`minimo` 1, `maximo` 10, "Agregar respuesta", cada una con `maxLongitud` `respuestaEspacioMax`), con "Es la que ve el alumno como respuesta esperada" en la primera. Mientras sobren grupos, el mensaje y "Quitar espacio" en cada grupo
- [X] T053 [P] [web] Crear `src/actividades/PreguntaAbierta/editorPreguntaAbierta.ts` (borrador, conversiones, `validar` y `resumen`) y `FormularioPreguntaAbierta.tsx` (un solo componente). Borrador `{ pregunta, solucion }`, las dos obligatorias, con `preguntaMax` y `solucionMax`, en `CampoArea`. `resumen`: la pregunta
- [X] T054 [web] Crear `src/actividades/registroEditor.ts`: `registroEditor`, con una entrada por cada `TipoActividad` y el mismo tipo mapeado de `registro.ts`, para que si falta un tipo no compile
- [X] T055 [web] Crear `src/editor/paleta.ts`: `GRUPOS_PALETA` con los cuatro grupos, en el orden de la spec, y por tipo `{ tipo, etiqueta, icono }` con los iconos de `docs/diseno.md`. Los identificadores de los que no existen son `emparejar`, `clasificar`, `ordenar`, `bancoPalabras`, `retoCodigo`, `terminalSimulada`, `grafoCommits` y `escucharRepetir` (research.md, punto 10). `tipoDisponible(tipo)` con `Object.hasOwn(registroEditor, tipo)` y `datosTipo(tipo)`

### Lienzo de la lección

- [X] T056 [web] Crear `src/editor/estadoLeccion.ts`, un reductor puro sin red: `Bloque` (`{ id, tipo, borrador }`), `EstadoLeccion` (`titulo`, `bloques`, `idSeleccionado`, `version`, `hayCambios`, `mostrarErrores`) con `estadoInicial(leccion, copia)`, y las acciones `cambiarTitulo`, `agregar` (con `posicion` o después de la seleccionada, o al final; queda seleccionada), `cambiarBorrador`, `mover`, `quitar` (si era la seleccionada, sin selección), `seleccionar`, `mostrarErrores` y `guardada`. Más `erroresDe(bloque)`, `bloquesIncompletos(bloques)` y `aActividades(bloques)`, con `registroEditor`
- [X] T057 [web] Crear `src/hooks/useEditorLeccion.ts`, que recibe la lección ya cargada: `useReducer` con `estadoLeccion` y su `estadoInicial`, con `aBorrador`, o con `tomarCopia` si hay (queda con `hayCambios`). `comprobar(textoAviso)`, la misma para guardar y probar: con título vacío o bloques incompletos, `mostrarErrores` y pide foco. Si hay bloques incompletos, además selecciona el primero y pone el aviso ("No se guardó: hay…" o "No se puede probar: hay…"). Con solo el título vacío no hay aviso: el error va en su campo. `guardar(reemplazar?)`, con `estadoGuardado` (`"listo" | "guardando" | "guardada"`): 409 → `versionMasNueva`; 400 con `campos` → `MENSAJES_EDITOR.datosInvalidos` y selecciona `actividades.N`; `esSesionPerdida` → `guardarCopia` con `{ titulo, bloques, version }`; lo demás → `leerErrorDeAccion(error, "No se pudo guardar la lección. Tus cambios siguen aquí.")`
- [X] T058 [P] [web] Crear `src/editor/PaletaActividades/PaletaActividades.tsx` y `.module.css` (`docs/diseno.md`, sección 4): recorre `GRUPOS_PALETA`, con cada tipo como `<button>`. Disponibles: `alAgregar(tipo)` y `arrastre.propsOrigen({ origen: "paleta", tipo })`, con la prop `arrastre` de T064. Sin registro: `disabled`, sin arrastre, texto en `textoSuave`, icono en `textoTenue` e `Insignia` "Próximamente". Con `LIMITES_LECCION.actividadesMax` bloques, todos deshabilitados y `MENSAJES_EDITOR.maxActividades` en `nota`
- [X] T059 [P] [web] Crear `src/editor/Secuencia/BloqueActividad.tsx`, `Secuencia.tsx` y `Secuencia.module.css` (`docs/diseno.md`, sección 4): lista de `BloqueActividad`: el asa `GripVertical`; un `<button>` con `aria-pressed={seleccionado}` y `alSeleccionar`, con número, etiqueta, `resumen` en una línea o "Sin contenido" e `Insignia` `acento` con `CircleAlert` "Incompleta"; y, como hermanos de ese botón (sin botones anidados), `BotonesOrden` y "Eliminar". Arrastra con la prop `arrastre` de T064, sin crear su propio `useArrastrar`, y dibuja la línea de destino. Vacía, `EstadoVacio` con los textos de la spec. `Dialogo` "¿Eliminar esta actividad?" con "Perderás lo que escribiste en ella.". Una región `role="status"` oculta anuncia "Movida a la posición {n}"
- [X] T060 [P] [web] Crear `src/editor/VistaPrevia/VistaPrevia.tsx` y `.module.css` (research.md, punto 11): "VISTA PREVIA" y "Reiniciar". Monta `registroActividades[tipo]` dentro de `AmbitoActividad`, con un contenedor con `tabIndex={-1}`, para que pulsar dentro ponga ahí el foco. `key` con el id del bloque, `JSON.stringify` de la actividad demorada (`useValorDemorado`) y un contador. `alTerminar` sube el contador y pasa el foco a "Reiniciar". Sin la animación de entrada de `.actividad`, que parpadearía con cada cambio. Sin actividad, su mensaje
- [X] T061 [web] Crear `src/editor/Inspector/Inspector.tsx` y `.module.css`: sin selección, "Elige una actividad para editarla."; con selección, el `Formulario` de `registroEditor` con `errores` solo si `mostrarErrores`, y debajo `VistaPrevia` con `aActividad` si el bloque está completo, o "Completa esta actividad para ver su vista previa."
- [X] T062 [P] [web] Crear `src/editor/ProbarLeccion/ProbarLeccion.tsx` (research.md, punto 12): `useReproductor(actividades)` y `ReproductorLeccion` con `aviso={<Aviso tono="info" texto="Modo de prueba: esto no cuenta como progreso." />}`. Al terminar, `EncabezadoLeccion` y `ResultadoLeccion` con `textoVolver="Volver al editor"` y sin `guardado`. No usa `useGuardarProgreso` ni pide nada al servidor
- [X] T063 [web] Crear `src/paginas/LienzoLeccion/LienzoLeccion.tsx` y `.module.css` (`docs/diseno.md`, sección 5, "Lienzo de la lección"): `usePeticion` con `traerLeccionEnEditor`, los estados cargando ("Volver al curso" e `IndicadorCarga`), 404, 403 y error, como `MapaCurso`. En `src/rutas.tsx`, `/editor/:idCurso/lecciones/:idLeccion` fuera del `Layout`, junto a la lección
- [X] T064 [web] Crear `src/paginas/LienzoLeccion/EditorLeccion.tsx`, con `useEditorLeccion`, y en `LienzoLeccion.module.css`, con datos: la barra superior ("Volver al curso", `CampoTexto` del título, "Cambios sin guardar" o "Lección guardada", "Probar lección" deshabilitado sin actividades, y "Guardar lección" con `enviando` y deshabilitado sin cambios) y la rejilla de `PaletaActividades`, `Secuencia` e `Inspector`, que se apila por debajo de 64rem. Aquí se crea la única instancia de `useArrastrar`: `alSoltar` agrega si el origen es la paleta y mueve si es la secuencia, y se pasa como `arrastre` a `PaletaActividades` y `Secuencia`. El `Aviso` del hook. Al pedir foco, enfocar el primer `[aria-invalid="true"]` del inspector o, si no hay, el del título. Al agregar, enfocar el primer campo del formulario. Mientras guarda, todo deshabilitado
- [X] T065 [web] En `src/paginas/LienzoLeccion/EditorLeccion.tsx`: `useSalirSinGuardar(hayCambios)` con su `Dialogo`, y el de versión más nueva ("Esta lección cambió en otro lugar", "Se guardó una versión más nueva en otra pestaña o dispositivo. Si guardas, la reemplazarás.", "Reemplazar", "Cancelar"), que llama a `guardar(true)`
- [X] T066 [web] En `src/paginas/LienzoLeccion/EditorLeccion.tsx`, "Probar lección" (research.md, punto 12): `comprobar`, y si pasa, `navegar(ubicacion.pathname, { state: { probando: true } })`. Con `state.probando` y todo completo, dibuja `ProbarLeccion` con `alSalir={() => navegar(-1)}`. Al montarse, si llega `state.probando` sin haber abierto la prueba en esta visita, reemplaza la entrada
- [X] T067 [web] En `CLAUDE.md`: la carpeta `editor/` en "Estructura", los componentes nuevos en "Reglas", que el editor no tiene par en el móvil, y que agregar un tipo es su carpeta en `actividades/` con su componente y su editor, y una línea en `registro.ts` y en `registroEditor.ts`
- [ ] T068 [web] `npm run tipos`, `npm run lint` y `npm run build` sin errores

**Punto de control**: se puede crear un curso, armar una lección con los cinco tipos, probarla y guardarla.

---

## Fase 4: Cierre

- [X] T069 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`: `version` en Leccion; en Curso, `estado` y los límites del título y la descripción; en Actividad, los límites y las dos reglas nuevas de la opción múltiple. Actualizar "Entidades previstas": el idioma pasa de F05 a F07
- [X] T070 [specs] Integrar "Cambios a la navegación" de [plan.md](./plan.md) a `specs/01-navegacion.md`: quitar `/mis-cursos`, agregar `/editor/nuevo`, confirmar `/editor/:idCurso` y `/editor/:idCurso/lecciones/:idLeccion`, actualizar la línea de `/panel`, agregar la salida con cambios sin guardar y "Probar lección", y actualizar "Qué viaja entre pantallas"
- [ ] T071 [specs] `npm run contrato:revisar`: las tres copias coinciden con la oficial
- [ ] T072 [specs] Revisar que `specs/features/F05-crear-editar-curso/spec.md` coincide con lo que se construyó; si algo cambió, actualizarla

---

## Fase 5: Validación manual

Cada criterio se comprueba con [quickstart.md](./quickstart.md), sección 3, y se marca
también en `spec.md`. Antes de los PR, las repeticiones de F03 y F04 de la sección 4:
F05 toca `BarraRespuesta` y `useEnfocarAlMontar`, que usa el reproductor.

- [ ] V01 [web] Con la cuenta A, "Mi panel" muestra "Sigue aprendiendo" y debajo "Cursos que creé", con "Todavía no creas ningún curso.", "Crea uno y enseña lo que sabes." y el botón "Nuevo curso".
- [ ] V02 [web] Con la cuenta autor, "Cursos que creé" muestra "Git esencial" con "Publicado", "6 lecciones" y el enlace "Ver curso", y "Curso en borrador" con "Borrador" y el enlace "Editar".
- [ ] V03 [web] "Editar" abre el mapa de "Curso en borrador". "Ver curso" abre el detalle de "Git esencial", y volver desde ahí regresa a "Mi panel".
- [ ] V04 [web] Con dos borradores en la cuenta A, al guardar un cambio en el de abajo y volver a "Mi panel", ese curso queda primero.
- [ ] V05 [web] Con la cuenta B, "Cursos que creé" no muestra ningún curso de la cuenta A.
- [ ] V06 [web] "Nuevo curso" abre un formulario con título y descripción. "Cancelar" vuelve a "Mi panel" sin crear nada.
- [ ] V07 [web] Al pulsar "Crear curso" con el título solo con espacios y la descripción vacía, los dos campos muestran "Este campo es obligatorio." y no se crea nada.
- [ ] V08 [web] El título no deja escribir más de 100 caracteres, y la descripción, más de 1000.
- [ ] V09 [web] Al crear "Huerto urbano" llego a su mapa, con "Borrador", "Este curso todavía no tiene lecciones." y "Agrega la primera para empezar.". En "Mi panel" aparece primero, con "Sin lecciones".
- [ ] V10 [web, móvil] "Huerto urbano" no aparece en el catálogo ni al buscar su título, ni siquiera con la cuenta A.
- [ ] V11 [web] Con la cuenta A, la dirección del detalle de "Huerto urbano" muestra "Este curso no existe o ya no está disponible.".
- [ ] V12 [web] Pulsar "Crear curso" varias veces seguidas crea un solo curso.
- [ ] V13 [web] En el mapa, "Guardar cambios" está deshabilitado hasta que cambio algo. Al cambiar el título a "Azotea verde" y guardar veo "Cambios guardados", y al recargar sigue ese título, con la "A" en la portada.
- [ ] V14 [web] Con el título vacío, "Guardar cambios" muestra "Este campo es obligatorio." y al recargar sigue el título anterior.
- [ ] V15 [web] Mientras se guardan los datos del curso, "Guardar cambios" muestra un indicador y no puedo agregar, mover ni eliminar lecciones.
- [ ] V16 [web] "Eliminar curso" pregunta "¿Eliminar este curso?" con "Se borrará con todas sus lecciones. No se puede deshacer.". "Cancelar" no cambia nada; "Eliminar" me lleva a "Mi panel", el curso ya no aparece y su dirección del editor muestra "Este curso no existe o ya no está disponible.".
- [ ] V17 [web] "Nueva lección" con el título vacío muestra "Este campo es obligatorio." y no la agrega. El campo no deja escribir más de 100 caracteres.
- [ ] V18 [web] Al agregar "Semillas", "Riego" y "Cosecha", aparecen en ese orden, numeradas de 1 a 3 y con "Sin actividades".
- [ ] V19 [web] Pulsar "Agregar" varias veces seguidas agrega una sola lección.
- [ ] V20 [web] Al arrastrar "Cosecha" al primer lugar veo "1. Cosecha", "2. Semillas" y "3. Riego", y sigue así al recargar.
- [ ] V21 [web] Con el teclado, usando "Subir" y "Bajar", logro el mismo cambio y el foco sigue en el botón. "Subir" está deshabilitado en la primera lección y "Bajar" en la última.
- [ ] V22 [web] "Eliminar" en una lección pregunta "¿Eliminar esta lección?" con "Se borrará con todas sus actividades. No se puede deshacer.". "Cancelar" no cambia nada; "Eliminar" la quita, las demás se renumeran y sigue así al recargar.
- [ ] V23 [web] En el borrador con 100 lecciones, "Nueva lección" está deshabilitado y veo "Un curso puede tener hasta 100 lecciones.".
- [ ] V24 [web] La paleta muestra, en este orden: "Básicos" con Teoría, Tarjeta, Opción múltiple, Completar espacios y Pregunta abierta; "Relacionar" con Emparejar, Clasificar, Ordenar y Banco de palabras; "Código y terminal" con Reto de código, Terminal simulada y Grafo de commits; y "Voz" con Escuchar y repetir.
- [ ] V25 [web] Los 8 tipos que no son básicos se ven deshabilitados con "Próximamente": no se pueden arrastrar a la secuencia, y pulsarlos o usarlos con el teclado no agrega nada.
- [ ] V26 [web] Al arrastrar "Tarjeta" entre dos actividades, queda entre esas dos.
- [ ] V27 [web] Al pulsar "Teoría" con la actividad 2 seleccionada, queda en el lugar 3; sin ninguna seleccionada, queda al final. En los dos casos queda seleccionada y el foco está en su primer campo.
- [ ] V28 [web] Con el teclado (Tab y Enter) agrego una actividad sin usar el ratón.
- [ ] V29 [web] En la lección con 50 actividades, los tipos de la paleta están deshabilitados y veo "Una lección puede tener hasta 50 actividades.".
- [ ] V30 [web] Una lección sin actividades muestra "Esta lección todavía no tiene actividades." y "Arrastra un tipo de la paleta o púlsalo para agregarlo.".
- [ ] V31 [web] Cada bloque muestra su número, su tipo y el inicio de su texto, que cambia mientras escribo en el inspector. Una actividad sin texto dice "Sin contenido".
- [ ] V32 [web] Al agregar una actividad, su bloque lleva la marca "Incompleta" desde el principio, y la pierde en cuanto la completo.
- [ ] V33 [web] Sin actividad seleccionada, el inspector dice "Elige una actividad para editarla.". Al pulsar un bloque, también con el teclado (Tab y Enter), aparece su formulario.
- [ ] V34 [web] Puedo reordenar los bloques arrastrándolos y con "Subir" y "Bajar".
- [ ] V35 [web] "Eliminar" en un bloque pregunta "¿Eliminar esta actividad?" con "Perderás lo que escribiste en ella.". Si era la seleccionada, el inspector vuelve a "Elige una actividad para editarla.".
- [ ] V36 [web] En una ventana angosta las zonas se apilan y puedo agregar, editar, reordenar y guardar sin arrastrar.
- [ ] V37 [web] Con un lector de pantalla, los tipos con "Próximamente" se anuncian como no disponibles, y al mover una lección o un bloque con "Subir" o "Bajar" se anuncia "Movida a la posición {n}".
- [ ] V38 [web] En la teoría, con solo el texto lleno, la actividad deja de estar incompleta. "Agregar punto" suma filas hasta 10; una fila vacía no se guarda.
- [ ] V39 [web] Los formularios muestran sus ayudas: "Separa los párrafos con un renglón en blanco." y "Las líneas que empiezan con +, - o @@ se resaltan como un diff." en la teoría, y "Cada ___ es un espacio que el alumno llena." en completar espacios.
- [ ] V40 [web] La tarjeta queda completa cuando tiene frente y reverso.
- [ ] V41 [web] La opción múltiple empieza con dos opciones vacías. Con 2, "Quitar" está deshabilitado; con 9, también "Agregar opción".
- [ ] V42 [web] Sin opción correcta marcada, al guardar veo "Elige la opción correcta.". Si quito la opción correcta, ninguna queda marcada.
- [ ] V43 [web] Con dos opciones "Rojo" y " Rojo ", al guardar la repetida muestra "Esta opción está repetida."; "Rojo" y "rojo" sí se aceptan.
- [ ] V44 [web] Con tipo "Símbolo", las opciones "あ" e "い" se ven como mosaicos en la vista previa. Al cambiar a "Símbolo" con una opción de más de 4 caracteres, lo escrito se conserva y al guardar veo "Un símbolo puede tener hasta 4 caracteres.".
- [ ] V45 [web] En completar espacios, "Agregar espacio" escribe `___` donde está el cursor y aparece el grupo "Espacio 1". Escribir otro `___` a mano agrega "Espacio 2".
- [ ] V46 [web] Un texto sin `___` muestra, al guardar, "Agrega al menos un espacio con ___.". Con 21, "El texto puede tener hasta 20 espacios.".
- [ ] V47 [web] Con dos espacios con respuestas, al borrar un `___` del texto los dos grupos siguen ahí, con "Hay más grupos de respuestas que espacios en el texto. Quita los que sobran." y "Quitar espacio". La actividad sigue incompleta hasta que quito uno. Si el grupo que sobra estaba vacío, desaparece solo.
- [ ] V48 [web] Un espacio deja agregar hasta 10 respuestas, y la primera lleva la nota "Es la que ve el alumno como respuesta esperada".
- [ ] V49 [web] La pregunta abierta queda completa cuando tiene pregunta y solución.
- [ ] V50 [web] Cada campo no deja escribir más del límite de "Datos de entrada".
- [ ] V51 [web] Una opción múltiple completa se ve en la vista previa como en el reproductor: elijo una opción, compruebo y veo "¡Correcto!" o la respuesta correcta. La barra de respuesta queda dentro de la vista previa.
- [ ] V52 [web] En la vista previa, la tarjeta se voltea, los espacios se califican sin importar mayúsculas ni acentos, y la pregunta abierta muestra la solución.
- [ ] V53 [web] Mientras escribo en un campo del inspector, la vista previa se actualiza y el foco se queda en el campo: sigo escribiendo sin perder letras.
- [ ] V54 [web] Con el foco en el inspector o en la secuencia, fuera de un campo, las teclas 1 a 9 y Enter no eligen opciones ni comprueban en la vista previa. Con el foco dentro de la vista previa, sí.
- [ ] V55 [web] "Reiniciar" devuelve la actividad al principio, y "Continuar" hace lo mismo.
- [ ] V56 [web] Una actividad incompleta muestra "Completa esta actividad para ver su vista previa.".
- [ ] V57 [web] En una lección sin actividades, "Probar lección" está deshabilitado.
- [ ] V58 [web] Con dos actividades incompletas, "Probar lección" no abre nada: veo "No se puede probar: hay 2 actividades incompletas." (con una, "No se puede probar: hay 1 actividad incompleta."), queda seleccionada la primera con sus errores y el foco en su primer campo con error.
- [ ] V59 [web] Con actividades completas y cambios sin guardar, "Probar lección" abre el reproductor a pantalla completa, con "Modo de prueba: esto no cuenta como progreso." y las actividades como están en el lienzo, desde la primera.
- [ ] V60 [web] Al terminar veo "¡Lección completada!", el título de la lección y "Acertaste {aciertos} de {preguntas}", con "Volver al editor", sin "Guardando tu progreso…" ni "Progreso guardado".
- [ ] V61 [web] "Volver al editor", la X (sin preguntar nada) y el botón de volver del navegador regresan al lienzo con mis cambios sin guardar y la misma actividad seleccionada.
- [ ] V62 [web] Con el servidor apagado, puedo probar la lección de principio a fin.
- [ ] V63 [web, móvil] Después de probar una lección y publicar el curso, esa lección aparece sin completar para el autor.
- [ ] V64 [web] "Guardar lección" está deshabilitado al abrir la lección. Al cambiar algo aparece "Cambios sin guardar" y se habilita.
- [ ] V65 [web] Con una lección de tres actividades completas, al guardar veo "Lección guardada". Al recargar, las tres siguen ahí en el mismo orden y con sus datos, y el mapa dice "3 actividades".
- [ ] V66 [web] Con dos actividades incompletas, al guardar veo "No se guardó: hay 2 actividades incompletas." (con una, "No se guardó: hay 1 actividad incompleta."), queda seleccionada la primera con sus errores y el foco en su primer campo con error. Al recargar y aceptar salir, la lección está como antes de esos cambios.
- [ ] V67 [web] Con el título de la lección vacío, al guardar veo "Este campo es obligatorio." en el título y no se guarda.
- [ ] V68 [web] Puedo guardar una lección sin actividades.
- [ ] V69 [web] Una teoría con el título vacío y sin puntos clave se guarda sin esos campos. Un código con sangría conserva su sangría después de guardar y recargar.
- [ ] V70 [web] Mientras se guarda, "Guardar lección" muestra un indicador y no puedo editar nada.
- [ ] V71 [web, móvil] Armo una lección con los cinco tipos, un administrador publica el curso, y un alumno la cursa de principio a fin con lo que escribí: en la web y en el móvil se ve igual que en la vista previa y su resultado cuenta las tres preguntas.
- [ ] V72 [web] Con la misma lección abierta en dos pestañas, guardo un cambio en la primera y otro en la segunda: la segunda pregunta "Esta lección cambió en otro lugar" con "Se guardó una versión más nueva en otra pestaña o dispositivo. Si guardas, la reemplazarás.", "Cancelar" y "Reemplazar".
- [ ] V73 [web] "Cancelar" me deja en la lección con mis cambios y "Cambios sin guardar"; si recargo y acepto salir, veo lo que guardó la primera pestaña.
- [ ] V74 [web] "Reemplazar" guarda, veo "Lección guardada" y, al recargar la primera pestaña, veo lo de la segunda.
- [ ] V75 [web] Guardar dos veces seguidas en la misma pestaña no pregunta nada.
- [ ] V76 [web] Con el lienzo abierto, reordenar las lecciones o cambiar los datos del curso en otra pestaña no hace aparecer la pregunta al guardar.
- [ ] V77 [backend] Guardar, sin pasar por un cliente, una lección a partir de una versión que ya no es la última se rechaza y la lección queda como estaba, salvo que se pida reemplazarla.
- [ ] V78 [web] Con cambios sin guardar, "Volver al curso" pregunta "¿Salir sin guardar?" con "Perderás los cambios que no guardaste.". "Seguir aquí" deja todo como estaba; "Salir" me lleva al mapa y los cambios se pierden.
- [ ] V79 [web] El botón de volver del navegador hace lo mismo.
- [ ] V80 [web] Con cambios sin guardar en los datos del curso, "Mi panel" y abrir una lección preguntan lo mismo.
- [ ] V81 [web] Sin cambios pendientes, "Volver al curso" sale directo.
- [ ] V82 [web] Al recargar la página con cambios sin guardar, el navegador avisa antes de salir; sin cambios, no avisa.
- [ ] V83 [web] Con la cuenta B, la dirección del editor de un borrador de la cuenta A muestra "Este curso no existe o ya no está disponible." y "Ir a Mi panel". Una dirección con un identificador de curso inventado muestra lo mismo.
- [ ] V84 [web] En un borrador propio, la dirección de una lección con un identificador inventado, o de una lección de otro curso, muestra "Esta lección no existe o ya no está disponible." y "Ir a Mi panel".
- [ ] V85 [web] Con la cuenta autor, la dirección del editor de "Git esencial" y la de una de sus lecciones muestran "Este curso ya está publicado y por ahora no se puede editar." y "Ver curso".
- [ ] V86 [web] Con el lienzo abierto, un administrador publica el curso. Al guardar veo "Este curso ya está publicado y por ahora no se puede editar. Tus cambios no se guardaron." y lo que escribí sigue en pantalla.
- [ ] V87 [backend] Crear un curso sin sesión se rechaza. Cambiar, sin pasar por un cliente, un borrador de la cuenta A con la sesión de la cuenta B responde exactamente igual que con un identificador que no existe.
- [ ] V88 [backend] Cambiar los datos, una lección o el orden de "Git esencial" con la sesión de su autor, o eliminarlo, se rechaza y no cambia nada.
- [ ] V89 [backend] Guardar, sin pasar por un cliente, una lección con una actividad incompleta, con un texto más largo que su límite, con dos opciones iguales, con opciones de texto y de símbolo mezcladas, con un número de grupos distinto al de `___`, con un tipo que no es básico o con 51 actividades, se rechaza y la lección queda como estaba.
- [ ] V90 [backend] Crear o cambiar un curso con un título de 101 caracteres, o agregar la lección 101, se rechaza y no cambia nada.
- [ ] V91 [web] Un curso con `<b>hola</b>` y `<script>` en el título, la descripción, los títulos de sus lecciones y los textos de una actividad de cada tipo los muestra tal cual en "Cursos que creé", el mapa, los bloques de la secuencia, el inspector y la vista previa, sin negritas y sin ejecutar nada.
- [ ] V92 [web] Mientras carga, "Cursos que creé", el mapa y el lienzo muestran un indicador, y sus mensajes de vacío no aparecen ni por un instante.
- [ ] V93 [web] Con el servidor apagado, "Sigue aprendiendo" y "Cursos que creé" muestran cada una "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y su "Reintentar". El mapa y el lienzo también; al encender el servidor y pulsar "Reintentar" veo los datos.
- [ ] V94 [web] Con el servidor apagado, al guardar la lección veo "No se pudo guardar la lección. Tus cambios siguen aquí."; al encender el servidor y pulsar otra vez "Guardar lección", se guarda.
- [ ] V95 [web] Con el servidor apagado, "Crear curso" muestra "No se pudo crear el curso. Inténtalo de nuevo en un momento." y "Guardar cambios" muestra "No se pudieron guardar los cambios.". En los dos casos lo escrito sigue en el formulario.
- [ ] V96 [web] Con el servidor apagado, al reordenar lecciones la lista vuelve al orden anterior con "No se pudo guardar el nuevo orden.". Al agregar, veo "No se pudo agregar la lección." y el título escrito sigue en el campo. Al eliminar, la lección sigue en la lista con "No se pudo eliminar la lección.", y el curso, con "No se pudo eliminar el curso.".
- [ ] V97 [web] Con la lección eliminada en otra pestaña, al guardar veo "Esta lección ya no existe. Tus cambios no se guardaron."; con el curso eliminado, "Este curso ya no existe. Tus cambios no se guardaron.". Lo que escribí sigue en pantalla.
- [ ] V98 [web] Dado que la sesión expiró, cuando guardo la lección, llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar."; al entrar con la misma cuenta regreso al lienzo con mis cambios sin guardar y, al pulsar "Guardar lección", se guardan.
- [ ] V99 [web] Dado que la sesión expiró, cuando pulso "Crear curso" o "Guardar cambios", llego a "Entrar" con el aviso; al entrar con la misma cuenta regreso al formulario con lo que escribí.
- [ ] V100 [web] Dado que la sesión expiró, con el título del curso cambiado sin guardar y un título escrito en "Nueva lección", cuando reordeno las lecciones llego a "Entrar" con el aviso; al entrar con la misma cuenta regreso al mapa con lo que escribí.
- [ ] V101 [web] Si después de que expiró la sesión entro con otra cuenta, no veo los cambios sin guardar de la cuenta anterior.
- [ ] V102 [web] Dado que la sesión expiró, cuando abro el mapa de un curso, llego a "Entrar" con el aviso; al entrar regreso a ese mapa.

---

## Dependencias

- **Fase 1** va antes que todo. T001 primero, para que todo quede en la rama. T002 → T008 y T005–T007 → T008 (cada copia se commitea en la rama de F05 de su repo). T003 → T004, las dos antes de cualquier tarea de interfaz.
- **Backend** (fase 2):
  - T009 antes de T014;
  - T010 → T011 (mismo archivo);
  - T012 en paralelo desde el inicio; T013 necesita T011 y T012;
  - T014 → T015 → T016 → T017 (mismo archivo);
  - T018 necesita T013 y T017; T019 necesita T015;
  - T020 en paralelo; T021 al final.
- **Web** (fase 3), cuando el backend pasa su punto de control:
  - T022 a T029 en paralelo;
  - T030 → T031 → T032; T033 necesita T030; T034 en paralelo;
  - T035 a T040 en paralelo;
  - T041 necesita T022 y T039;
  - T042 necesita T022, T023, T025, T029, T035 y T036. T042, T043 y T063 editan `src/rutas.tsx`: van una tras otra;
  - T043 necesita T022; T044 necesita T022, T023, T025, T035, T036 y T043; T045 necesita T038, T040 y T043; T046 necesita T023, T027, T035 y T045; T047 necesita T028, T029, T040, T044 y T046;
  - T048 → T049 a T053 (en paralelo; necesitan T035 a T037) → T054 → T055;
  - T056 necesita T054; T057 necesita T022, T029 y T056;
  - T058 necesita T027 y T055; T059 necesita T027, T038, T040 y T056; T060 necesita T026, T030 a T033; T061 necesita T054 y T060; T062 necesita T034;
  - T063 necesita T057; T064 necesita T024, T058, T059 y T061; T065 necesita T028 y T064; T066 necesita T062 y T065;
  - T067 cuando se quiera; T068 al final.
- **Cierre y validación** al final. Los criterios `[backend]` se pueden validar en cuanto termina la fase 2.

## Paralelo, por ejemplo

```text
Preparación: T003→T004 (diseño) ‖ T002→T008 (contrato) ‖ T005 ‖ T006 ‖ T007
Backend:     T010→T011 ‖ T012 ‖ T020, mientras T009→T014→T015→T016→T017 avanzan
Web, base:   T022 ‖ T023 ‖ T024 ‖ T025 ‖ T026 ‖ T027 ‖ T028 ‖ T029
Web, piezas: T030→T031→T032 ‖ T034 ‖ T035 ‖ T036 ‖ T037 ‖ T038 ‖ T039 ‖ T040
Editores:    T049 ‖ T050 ‖ T051 ‖ T052 ‖ T053
Lienzo:      T058 ‖ T059 ‖ T060 ‖ T062
```

## Estrategia

1. Rama, contrato y diseño en `brote_specs` (T001 a T004), porque todo lo demás los usa.
2. Backend completo y probado con curl (punto de control de la fase 2): ya cubre los
   cinco criterios `[backend]` y confirma que `bd:sembrar` acepta los límites.
3. En la web, primero lo que no es del editor y puede romper lo de F03 (T030 a T034).
   Conviene probar el reproductor ahí mismo, antes de seguir: si algo se rompe, se ve
   de inmediato y no 30 tareas después.
4. Después el camino corto: panel, nuevo curso y mapa (T041 a T047). Con eso el autor
   ya crea cursos y lecciones vacías.
5. Al final el lienzo, que es lo más grande (T048 a T066).
6. Cierre de documentos y validación manual completa (V01 a V102) antes de los PR a
   `dev` de cada repo, con la spec enlazada y los criterios cubiertos. El móvil solo
   lleva la copia del contrato, pero también va en su PR.
