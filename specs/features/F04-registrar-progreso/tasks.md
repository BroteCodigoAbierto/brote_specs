---
description: "Lista de tareas de F04 Registrar y consultar el progreso"
---

# Tareas: F04 Registrar y consultar el progreso

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F04-registrar-progreso`, creada desde `dev` en cada repo afectado

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase).
- Qué actividades son preguntas (en el backend y en los dos clientes), el
  mensaje del 400 y el del 404 **siempre** salen del contrato (`CALIFICA_ACTIVIDAD`, `MENSAJES_PROGRESO`,
  `MENSAJES_LECCION`); ninguna tarea los escribe a mano.
- El usuario del progreso sale **siempre** de la sesión (`usuarioDe(res).id`),
  nunca de la dirección ni del cuerpo (principio III).
- Toda pieza de interfaz usa los tokens y componentes de `docs/diseno.md`; los
  nuevos y los cambios se agregan ahí primero (T002 y T003), y en los dos
  clientes con el mismo nombre y las mismas props.
- Textos fijos de la interfaz, iguales en web y móvil: "Guardando tu
  progreso…", "Progreso guardado", "No se pudo guardar tu progreso.", "Sin
  conexión. Tu progreso no se guardó." (solo móvil), "Esta lección ya no está
  disponible. Tu progreso no se guardó.", "Reintentar", "{c} de {t}
  lecciones" (con `t = 1`, "lección"), "{c} de {t} lecciones completadas"
  (lector de pantalla), "Avance del curso", "Curso terminado", "Empezar: {n}.
  {título}", "Continuar: {n}. {título}", "{a} de {p} aciertos", "completada",
  "Mis cursos", "Mi panel", "Sigue aprendiendo", "Todavía no empiezas ningún
  curso.", "Cuando completes tu primera lección, aquí verás tu avance." y
  "Explorar cursos".

---

## Fase 1: Preparación

- [X] T001 [specs] En `contrato/contrato.ts`, aplicar [contracts/contrato.md](./contracts/contrato.md) tal cual: en "Catálogo de cursos (F02)", `DetalleCurso.lecciones` pasa a `LeccionDelCurso[]` (con el comentario "Desde F04, cada lección trae el progreso de quien pregunta."); al final, el bloque "Progreso (F04)" con `CALIFICA_ACTIVIDAD`, `ProgresoLeccion`, `LeccionDelCurso`, `CuerpoProgresoLeccion`, `RespuestaProgresoLeccion`, `CursoEmpezado`, `RespuestaCursosEmpezados` y `MENSAJES_PROGRESO`. Subir `contrato/VERSION` de `0.4.0` a `0.5.0`
- [ ] T002 [specs] En `docs/diseno.md`, sección 4 (plan.md, "Lo que se agrega a docs/diseno.md"):
  - en la tabla de componentes: `BarraProgreso` gana `etiqueta` y `textoValor` (opcionales; sin ellas, lo de F03); `TarjetaCurso` gana `avance` (con él, `AvanceCurso` en lugar de la descripción y la insignia de lecciones); `ResultadoLeccion` gana `guardado` (`"guardando" | "guardado" | "error" | "sinConexion" | "noDisponible"`) y `alReintentar`, con el aspecto de cada estado; y la fila nueva `AvanceCurso` (`completadas`, `total`);
  - "Barra de pestañas (móvil)": iconos `Compass`, `BookMarked` y `UserRound`;
  - "Encabezado (web, en `Layout`)": el enlace "Mi panel" con `LayoutDashboard` entre la `Marca` y `MenuCuenta`, con el aspecto del `Boton` `fantasma` chico (es un enlace: estilos propios con los mismos tokens), activo en `primario`, solo el icono (con nombre accesible) en pantallas angostas.
- [ ] T003 [specs] En `docs/diseno.md`, sección 5, agregar los patrones de plan.md: **detalle del curso con progreso** (una `Superficie` con `AvanceCurso` y el `Boton` primario "Empezar…" / "Continuar…" con `iconoFinal` `ArrowRight`, debajo de la descripción y antes de "Lecciones"); **lección completada en la lista** (círculo del número en `broteSuave` con el número en `broteFuerte`, `CircleCheck` `broteFuerte` y "{a} de {p} aciertos" en `nota` `textoSuave` antes de la flecha; nombre accesible "{n}. {título}, completada, {a} de {p} aciertos"); y **página personal** (`titulo1` y una sección por bloque con su título en `seccion` y sus propios estados)
- [ ] T004 [back] En `brote_backend_express`: `git switch dev && git pull --ff-only` y crear `feature/F04-registrar-progreso` desde `dev`
- [ ] T005 [P] [web] Igual que T004 en `brote_web_react`
- [ ] T006 [P] [movil] Igual que T004 en `brote_mobile_expo`
- [ ] T007 [specs] Copiar el contrato 0.5.0 a los tres repos: `npm run contrato:copiar` en brote_specs. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo. En el backend, `npm run tipos` falla hasta T013 (`aDetalleCurso` no llena `progreso`); en web y móvil compila

---

## Fase 2: Backend (brote_backend_express)

- [ ] T008 [back] En `prisma/schema.prisma`, el modelo `Progreso` de [data-model.md](./data-model.md) tal cual (`@@id([idUsuario, idLeccion])`, `@@index([idLeccion])`, `@@map("progreso")`, relaciones con `onDelete: Cascade` a `User` y `Leccion`, `completadaEn` y `creadoEn` con `@default(now())`), bajo un bloque de comentario "Progreso (F04)"; y `progresos Progreso[]` en `User` (con el comentario `// F04: lecciones completadas (no crea columnas)`) y en `Leccion`. Generar la migración con `npm run bd:migrar -- --create-only --name f04_progreso` (o `prisma migrate diff` si no se puede crear la *shadow database*), agregarle a mano al final `ALTER TABLE "progreso" ADD CONSTRAINT "progreso_resultado_valido" CHECK ("aciertos" >= 0 AND "aciertos" <= "preguntas");`, aplicarla y correr `npm run bd:generar`
- [ ] T009 [P] [back] Crear `src/validacion/progreso.ts` con `validarCuerpoProgreso(cuerpo: unknown): CuerpoProgresoLeccion`: un objeto (no `null` ni arreglo) con **exactamente** las claves `aciertos` y `preguntas`, las dos `Number.isInteger` y `>= 0`. Cualquier otra cosa → `throw new ErrorApi(400, MENSAJES_PROGRESO.resultadoInvalido)`. La comparación con la lección no va aquí (T011)
- [ ] T010 [back] En `src/servicios/lecciones.ts`, sacar la condición de `traerLeccionPublicada` a `export function dondeLeccionPublicada(idCurso: string, idLeccion: string)`, que devuelve `{ id: idLeccion, idCurso, curso: { publicado: true } } satisfies Prisma.LeccionWhereInput`, con un comentario de que la usan abrir (F03) y registrar (F04) para que no se separen. `traerLeccionPublicada` la usa sin cambiar su comportamiento
- [ ] T011 [back] Crear `src/servicios/progreso.ts` (research.md, puntos 1 a 3):
  - `contarPreguntas(actividades: Actividad[]): number` con `CALIFICA_ACTIVIDAD[actividad.tipo]`;
  - `aProgresoLeccion({ aciertos, preguntas, completadaEn })`: `ProgresoLeccion` con `completadaEn.toISOString()`;
  - `registrarProgreso(idUsuario, idCurso, idLeccion, { aciertos, preguntas }): Promise<ProgresoLeccion>`: `bd.leccion.findFirst({ where: dondeLeccionPublicada(idCurso, idLeccion), select: { actividades: true } })`; si no hay, `ErrorApi(404, MENSAJES_LECCION.leccionNoDisponible)`; si `preguntas !== contarPreguntas(actividades)` o `aciertos > preguntas`, `ErrorApi(400, MENSAJES_PROGRESO.resultadoInvalido)`; si no, `bd.progreso.upsert({ where: { idUsuario_idLeccion: { idUsuario, idLeccion } }, create: { idUsuario, idLeccion, aciertos, preguntas }, update: { aciertos, preguntas, completadaEn: new Date() }, select: { aciertos: true, preguntas: true, completadaEn: true } })`, sin escrituras anidadas, para que Prisma lo haga con `ON CONFLICT` (research.md, punto 3).
- [ ] T012 [back] En `src/servicios/progreso.ts`, `traerCursosEmpezados(idUsuario): Promise<CursoEmpezado[]>` (research.md, punto 6): `bd.progreso.findMany({ where: { idUsuario, leccion: { curso: { publicado: true } } }, orderBy: [{ completadaEn: "desc" }, { idLeccion: "asc" }], select: { completadaEn: true, leccion: { select: { curso: { select: { id, titulo, descripcion, autor: { select: { id, name } }, _count: { select: { lecciones: true } } } } } } } })`; agrupar por `curso.id` en un `Map` conservando el orden de la primera aparición; `leccionesCompletadas` = filas del curso, `ultimoAvanceEn` = la `completadaEn` de la primera (ISO), `cantidadLecciones` = `_count.lecciones`, `autor` = `{ id, nombre: name }`
- [ ] T013 [back] En `src/servicios/cursos.ts`, `traerCursoPublicado(id: string, idUsuario: string)`: `seleccionDetalle` pasa a una función `seleccionDetalle(idUsuario)` cuyas `lecciones` seleccionan además `progresos: { where: { idUsuario }, select: { aciertos: true, preguntas: true, completadaEn: true } }`; `aDetalleCurso` arma cada `LeccionDelCurso` con `{ id, titulo, posicion, progreso: leccion.progresos[0] ? aProgresoLeccion(leccion.progresos[0]) : null }` (a lo sumo hay una fila, por la clave). `cantidadLecciones` sigue siendo `lecciones.length`
- [ ] T014 [back] En `src/rutas/cursos.ts`: el detalle llama a `traerCursoPublicado(req.params.idCurso, usuarioDe(res).id)`; y nueva `rutasCursos.put<{ idCurso: string; idLeccion: string }>("/:idCurso/lecciones/:idLeccion/progreso", requerirSesion, ...)`: `validarCuerpoProgreso(req.body)` → `registrarProgreso(usuarioDe(res).id, idCurso, idLeccion, cuerpo)` → `200` con `RespuestaProgresoLeccion` (`{ progreso }`). Orden: sesión, forma del cuerpo, lección, coherencia (contracts/api.md)
- [ ] T015 [back] En `src/rutas/usuarios.ts`, `rutasUsuarios.get("/yo/cursos-empezados", requerirSesion, ...)` → `200` con `RespuestaCursosEmpezados` (`{ cursos: await traerCursosEmpezados(usuarioDe(res).id) }`), con un comentario de que `/yo/cursos` queda para F05
- [ ] T016 [back] `npm run tipos` y `npm run lint` sin errores; `npm run bd:sembrar` sigue funcionando y deja `progreso` vacía para los cursos de prueba

**Punto de control**: quickstart.md, sección 2 (B1 a B7), responde como dice.

---

## Fase 3: Web (brote_web_react)

- [ ] T017 [P] [web] Crear `src/servicios/progreso.ts` sobre `pedir()`: `guardarProgreso(idCurso, idLeccion, cuerpo: CuerpoProgresoLeccion)` → `pedir<RespuestaProgresoLeccion>(`/cursos/${encodeURIComponent(idCurso)}/lecciones/${encodeURIComponent(idLeccion)}/progreso`, { method: "PUT", body: JSON.stringify(cuerpo) })`, y `traerCursosEmpezados()` → `pedir<RespuestaCursosEmpezados>("/usuarios/yo/cursos-empezados")`
- [ ] T018 [P] [web] Crear `src/utilidades/progreso.ts` (research.md, punto 9), con un comentario de que el móvil tiene las mismas funciones: `avanceCurso(lecciones: LeccionDelCurso[])` → `{ completadas, total, siguiente }` (`siguiente`: la primera por `posicion` sin `progreso`, o `null`); `textoAvance(completadas, total)` ("2 de 6 lecciones"; con `total === 1`, "… de 1 lección"); `textoAvanceAccesible(completadas, total)` ("{c} de {t} lecciones completadas"; con `total === 1`, "… de 1 lección completada"); `textoAciertos(progreso)` ("{a} de {p} aciertos", o `null` si `preguntas === 0`); `textoBotonSiguiente(siguiente, completadas)` ("Empezar: {n}. {título}" si `completadas === 0`, si no "Continuar: {n}. {título}")
- [ ] T019 [P] [web] En `src/componentes/BarraProgreso/BarraProgreso.tsx`, props opcionales `etiqueta` (por defecto "Progreso de la lección") y `textoValor` (por defecto el texto de F03: "Actividad {n} de {total}" o "Lección completada"), usadas en `aria-label` y `aria-valuetext` (docs/diseno.md, sección 4). La lección no cambia
- [ ] T020 [web] Crear `src/componentes/AvanceCurso/AvanceCurso.tsx` y `.module.css` (docs/diseno.md, sección 4): props `completadas` y `total`; `textoAvance` en `cuerpoChico` seminegrita; debajo, `BarraProgreso` con `actual={completadas}`, `total`, `etiqueta="Avance del curso"` y `textoValor={textoAvanceAccesible(...)}`; si `completadas === total`, `Insignia` `brote` con `CircleCheck` "Curso terminado"
- [ ] T021 [web] En `src/componentes/TarjetaCurso/TarjetaCurso.tsx` y `.module.css`, prop opcional `avance?: { completadas: number; total: number }`: con ella, en lugar de la descripción y la `Insignia` de lecciones, `AvanceCurso`. Sin ella, la tarjeta del catálogo no cambia
- [ ] T022 [P] [web] En `src/componentes/ResultadoLeccion/ResultadoLeccion.tsx` y `.module.css` (docs/diseno.md, secciones 4 y 6), props `guardado: "guardando" | "guardado" | "error" | "sinConexion" | "noDisponible"` (las mismas que en el móvil; la web nunca produce `"sinConexion"`, que se ve como `"error"`) y `alReintentar`. Entre los aciertos y el botón, una zona con `aria-live="polite"`: `"guardando"` → "Guardando tu progreso…" en `nota` `textoSuave` con un indicador chico, y "Volver al curso" con `enviando`; `"guardado"` → `CircleCheck` y "Progreso guardado" en `nota` `broteFuerte`; `"error"` → `Aviso` `error` "No se pudo guardar tu progreso." con `Boton` `secundario` chico "Reintentar" → `alReintentar`; `"noDisponible"` → `Aviso` `error` "Esta lección ya no está disponible. Tu progreso no se guardó." sin botón. El foco inicial sigue en "¡Lección completada!"
- [ ] T023 [P] [web] En `src/actividades/ReproductorLeccion/EncabezadoLeccion.tsx`, prop opcional `deshabilitada` que se pasa como `deshabilitado` al `Boton` de la X
- [ ] T024 [P] [web] En `src/hooks/useReproductor.ts` (research.md, punto 2), `useReproductor(actividades: Actividad[])` en lugar de `useReproductor(total)`: `total = actividades.length` y `preguntas = actividades.filter((actividad) => CALIFICA_ACTIVIDAD[actividad.tipo]).length`; `aciertos` sigue contando los resultados `"acierto"`. Actualizar el comentario (ya no "el progreso llega con F04") y la llamada en `src/paginas/Leccion/Leccion.tsx` (`useReproductor(actividades)`). El reproductor sigue sin saber de la red
- [ ] T025 [web] Crear `src/hooks/useGuardarProgreso.ts` (research.md, punto 7): `useGuardarProgreso(idCurso, idLeccion, cuerpo: CuerpoProgresoLeccion)` → `{ estado, reintentar }`. Al montarse envía `guardarProgreso` **una vez** (un `useRef` marca que ya se envió, para el doble efecto de `StrictMode`); `estado` empieza en `"guardando"`; 200 → `"guardado"`; `esNoDisponible(error)` → `"noDisponible"`; cualquier otro error → `"error"` (el 401 ya lo maneja `pedir()`). Ignora la respuesta si se desmontó. `reintentar()` vuelve a `"guardando"` y manda el mismo cuerpo
- [ ] T026 [web] En `src/paginas/Leccion/Leccion.tsx`, con `terminada`, renderizar `<LeccionTerminada>` (componente nuevo en el mismo archivo) con `idCurso`, `idLeccion`, `titulo`, `aciertos`, `preguntas` y `alSalir`: usa `useGuardarProgreso(idCurso, idLeccion, { aciertos, preguntas })`, pasa `guardado` y `alReintentar` a `ResultadoLeccion`, y `deshabilitada={estado === "guardando"}` a `EncabezadoLeccion`. `CursarLeccion` recibe `idCurso` e `idLeccion`. El `useBlocker` no cambia
- [ ] T027 [web] En `src/paginas/DetalleCurso/DetalleCurso.tsx` y `.module.css` (docs/diseno.md, sección 5, "Detalle del curso con progreso"): con `curso.lecciones.length > 0`, entre la descripción y "Lecciones", una `Superficie` con `AvanceCurso` (de `avanceCurso(curso.lecciones)`) y, si hay `siguiente`, `Boton` primario con `iconoFinal={ArrowRight}` y `textoBotonSiguiente(...)` que hace `navegar(`/cursos/${curso.id}/lecciones/${siguiente.id}`, { state: ESTADO_DESDE_CURSO })`. Sin lecciones, nada de esto
- [ ] T028 [web] En `src/paginas/DetalleCurso/DetalleCurso.tsx` y `.module.css` (docs/diseno.md, sección 5, "Lección completada en la lista"): las lecciones con `progreso` llevan el número en el círculo `broteSuave` / `broteFuerte`, un `CircleCheck` `broteFuerte` (`aria-hidden`) y, si `textoAciertos` no es `null`, ese texto en `nota` `textoSuave`, antes del `ChevronRight`. El texto oculto queda "{n}. " + título + ", completada" (+ ", {a} de {p} aciertos")
- [ ] T029 [web] Crear `src/paginas/Panel/Panel.tsx` y `.module.css` (docs/diseno.md, sección 5, "Página personal" y "Listas de tarjetas"): `h1` "Mi panel" (`titulo1`) y la sección "Sigue aprendiendo" (`h2` `seccion`) con `usePeticion(traerCursosEmpezados)`: cargando → `IndicadorCarga`; error → `ErrorCarga` con `leerErrorDeCarga` y "Reintentar"; vacío → `EstadoVacio` (icono `BookMarked`) "Todavía no empiezas ningún curso.", texto "Cuando completes tu primera lección, aquí verás tu avance." y un `Link` "Explorar cursos" a `/`; con datos → rejilla de `TarjetaCurso` con `avance={{ completadas: curso.leccionesCompletadas, total: curso.cantidadLecciones }}`, en el orden de la respuesta
- [ ] T030 [web] En `src/rutas.tsx`, `{ path: "/panel", element: <Panel /> }` dentro del `Layout`, antes de `*`, y actualizar el comentario del mapa de rutas
- [ ] T031 [web] En `src/componentes/Layout/Layout.tsx` y `.module.css` (docs/diseno.md, sección 4, "Encabezado"): `NavLink` a `/panel` con `LayoutDashboard` y "Mi panel", entre el enlace de la marca y `MenuCuenta`, con el aspecto del `Boton` `fantasma` chico hecho con los mismos tokens en `Layout.module.css` (`Boton` solo dibuja `<button>`); activo (`aria-current="page"`) en `primario`; en pantallas angostas, solo el icono con `aria-label="Mi panel"`
- [ ] T032 [P] [web] Actualizar `CLAUDE.md`: `AvanceCurso` en la lista de componentes del sistema de diseño
- [ ] T033 [web] `npm run tipos` y `npm run lint` sin errores

**Punto de control**: con el backend sembrado, la parte web de cada tabla de quickstart.md, sección 3, funciona.

---

## Fase 4: Móvil (brote_mobile_expo)

- [ ] T034 [P] [movil] Crear `src/servicios/progreso.ts`: igual que en la web (T017), sobre el `pedir()` del móvil
- [ ] T035 [P] [movil] Crear `src/utilidades/progreso.ts`: las mismas funciones que la web (T018)
- [ ] T036 [P] [movil] En `src/hooks/usePeticion.ts`, agregar `recargarEnSilencio()` (research.md, punto 8): vuelve a pedir sin poner `cargando`; si responde, reemplaza `datos` y borra `error`; si falla, conserva `datos` y pone `error` (la pantalla muestra el `Aviso` encima). `recargar()` no cambia
- [ ] T037 [P] [movil] Crear `src/hooks/useRecargarAlVolver.ts`: `useRecargarAlVolver(recargar: () => void)` con `useFocusEffect` de expo-router (y `useCallback`) que llama a `recargar` cada vez que la pantalla vuelve a tener el foco, salvo la primera (un `useRef`)
- [ ] T038 [P] [movil] En `src/componentes/BarraProgreso.tsx`, props `etiqueta` y `textoValor` como en la web (T019), en `accessibilityLabel` y `accessibilityValue.text`
- [ ] T039 [movil] Crear `src/componentes/AvanceCurso.tsx`: igual que en la web (T020), con `Texto` (`cuerpoChico`, `fuentes.seminegrita`) e `Insignia`
- [ ] T040 [movil] En `src/componentes/TarjetaCurso.tsx`, prop `avance` como en la web (T021); con ella, `accessibilityLabel` "{título}, {textoAvance}" y, con el curso terminado, además ", Curso terminado"
- [ ] T041 [P] [movil] En `src/componentes/ResultadoLeccion.tsx`, props `guardado` (`"guardando" | "guardado" | "error" | "sinConexion" | "noDisponible"`) y `alReintentar`, como en la web (T022), con la zona en `accessibilityLiveRegion="polite"`; `"sinConexion"` → `Aviso` `error` "Sin conexión. Tu progreso no se guardó." con "Reintentar"
- [ ] T042 [P] [movil] En `src/actividades/EncabezadoLeccion.tsx`, prop `deshabilitada` como en la web (T023)
- [ ] T043 [P] [movil] En `src/hooks/useReproductor.ts`, lo mismo que en la web (T024), y la llamada en `src/app/leccion/[idCurso]/[idLeccion].tsx` (`useReproductor(actividades)`)
- [ ] T044 [movil] Crear `src/hooks/useGuardarProgreso.ts`: igual que en la web (T025); además, `ErrorConexion` con `sinConexion` → `"sinConexion"`
- [ ] T045 [movil] En `src/app/leccion/[idCurso]/[idLeccion].tsx`, `LeccionTerminada` como en la web (T026). `usePreventRemove` no cambia (con `terminada` no bloquea)
- [ ] T046 [movil] En `src/app/curso/[idCurso].tsx` (docs/diseno.md, sección 5, "Detalle del curso con progreso"): con `curso.lecciones.length > 0`, la `Superficie` con `AvanceCurso` y el `Boton` "Empezar…" / "Continuar…" a ancho completo, que hace `router.push({ pathname: "/leccion/[idCurso]/[idLeccion]", params: { idCurso: curso.id, idLeccion: siguiente.id } })`; sin lecciones, nada de esto. `useRecargarAlVolver(recargarEnSilencio)`. Con `error` y `datos` (recarga al volver o al deslizar que falló), el detalle sigue en pantalla con el `Aviso` de error (`leerErrorDeCarga`, que distingue "sin conexión") y "Reintentar" encima, como en "Explorar" (F02), en lugar de `ErrorCarga`; `esNoDisponible(error)` sigue reemplazando la pantalla (research.md, punto 8)
- [ ] T047 [movil] En `src/app/curso/[idCurso].tsx` (docs/diseno.md, sección 5, "Lección completada en la lista"): la marca de completada como en la web (T028), con `accessibilityLabel` "{n}. {título}, completada" (+ ", {a} de {p} aciertos")
- [ ] T048 [movil] Crear `src/app/(tabs)/mis-cursos.tsx` (docs/diseno.md, sección 5): dentro de `FondoAmbiental` y `SafeAreaView` (arriba), título "Mis cursos" en `titulo1` y `usePeticion(traerCursosEmpezados)` con `useRecargarAlVolver(recargarEnSilencio)`. Cargando sin datos → `IndicadorCarga`; error sin datos → `ErrorCarga` con `leerErrorDeCarga` (distingue "sin conexión") y "Reintentar"; vacío → `EstadoVacio` (icono `BookMarked`) con el título y el texto de la spec y `Boton` "Explorar cursos" → `router.navigate("/")`; con datos → `FlatList` de `TarjetaCurso` con `avance`, `RefreshControl` (`refreshing={cargando && datos !== null}`, `onRefresh={recargar}`) y, si una recarga falló con cursos en pantalla, el `Aviso` de error encima de la lista, como en "Explorar" (F02)
- [ ] T049 [movil] En `src/app/(tabs)/_layout.tsx`, `Tabs.Screen name="mis-cursos"` entre `index` y `cuenta`, con `title: "Mis cursos"` y el icono `BookMarked`; actualizar el comentario del archivo
- [ ] T050 [P] [movil] Actualizar `CLAUDE.md`: la pestaña "Mis cursos" en las pantallas y `AvanceCurso` en la lista de componentes del sistema de diseño
- [ ] T051 [movil] `npm run tipos` y `npm run lint` sin errores, y `npx expo export --platform android` compila. Comprobar en el dispositivo que `useFocusEffect` dispara al volver de la lección al detalle y de un detalle a "Mis cursos" (plan.md, notas del móvil); si no, anotarlo en research.md, punto 8

**Punto de control**: con el backend sembrado y Expo Go, la parte móvil de cada tabla de quickstart.md, sección 3, funciona.

---

## Fase 5: Cierre

- [ ] T052 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`: **Progreso (F04)** en "Entidades definidas" (tabla de campos, clave primaria, índice, `CHECK` y reglas), y quitarlo de "Entidades previstas"
- [ ] T053 [specs] Integrar a `specs/01-navegacion.md` lo de plan.md, "Cambios a la navegación": web `/panel` ("Mi panel", dentro del marco, con el enlace en el encabezado) y el botón Empezar / Continuar del detalle; móvil `(tabs)/mis-cursos` deja de estar prevista para F04 (la parte de descargados sigue prevista para F10) y abre `curso/[idCurso]` encima de las pestañas; en "Qué viaja", Mis cursos / Mi panel → Detalle del curso
- [ ] T054 [specs] `npm run contrato:revisar`: todas las copias coinciden con la oficial (0.5.0)
- [ ] T055 [specs] Revisar que `spec.md` coincide con lo que se construyó; si algo cambió, actualizarla en el mismo PR
- [ ] T056 [specs] Repetir de F03 "Volver y empezar de nuevo" y "Con algo hecho", y de F02 "Volver con lo cargado" (quickstart.md, sección 4)

---

## Fase 6: Validación manual

Pasos de cada criterio en [quickstart.md](./quickstart.md). Al marcar uno aquí,
se marca también en spec.md. Antes de cada grupo, `npm run bd:sembrar` deja el
estado inicial; cuenta A = `autor@brote.test`, cuenta B = `autor2@brote.test`.

- [ ] V01 [web, móvil] Con la cuenta A, al terminar "1. ¿Qué es el control de versiones?" (Git esencial) acertando sus dos preguntas, veo "¡Lección completada!", "Guardando tu progreso…" con "Volver al curso" deshabilitado y después "Progreso guardado" con "Volver al curso" habilitado.
- [ ] V02 [web, móvil] Al pulsar "Volver al curso", el detalle de "Git esencial" muestra "1 de 6 lecciones", la barra con una sexta parte llena, la lección 1 marcada como completada con "2 de 2 aciertos" y el botón "Continuar: 2. Tu primer commit", sin recargar.
- [ ] V03 [web, móvil] Al terminar "2. Tu primer commit", que solo tiene teoría, queda marcada como completada sin resultado, y el detalle dice "2 de 6 lecciones".
- [ ] V04 [web, móvil] Si salgo de "3. Viajar en el tiempo: historial y diffs" a mitad (con la X y "Salir"), el detalle sigue diciendo "2 de 6 lecciones" y la lección 3 no está marcada.
- [ ] V05 [web] Al recargar la página a mitad de una lección no completada, la lección sigue sin marcar en el detalle.
- [ ] V06 [móvil] Al cerrar la app a mitad de una lección no completada y volver a abrirla, la lección sigue sin marcar en el detalle.
- [ ] V07 [web, móvil] Dado que con la cuenta A completé la lección 1 de "Git esencial" en la web, cuando entro con la cuenta A en el móvil y abro el detalle de "Git esencial", entonces la lección 1 aparece completada con el mismo resultado. Y al revés: lo que completo en el móvil aparece en la web.
- [ ] V08 [web, móvil] Al cerrar sesión, entrar con la cuenta B y abrir "Git esencial", no aparece ninguna lección completada y veo "0 de 6 lecciones"; al volver a la cuenta A, su progreso sigue ahí.
- [ ] V09 [backend] Pedir al servidor el progreso sin sesión se rechaza; con la sesión de la cuenta B no aparece nada de lo que completó la cuenta A.
- [ ] V10 [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1), completándola primero con "Acertaste 1 de 3" y luego otra vez con "Acertaste 3 de 3", el detalle muestra "3 de 3 aciertos"; repitiéndola una tercera vez con "Acertaste 2 de 3", muestra "2 de 3 aciertos". El avance del curso sube en una lección con el primer intento y no cambia con los otros dos.
- [ ] V11 [web, móvil] Al abrir una lección ya completada empieza desde la primera actividad, sin respuestas; si salgo a medias, sigue completada con el resultado anterior.
- [ ] V12 [web, móvil] En un curso sin lecciones completadas veo "0 de {total} lecciones", la barra vacía y "Empezar: 1. {título de la primera}", que abre esa lección.
- [ ] V13 [web, móvil] En "Git esencial", con las lecciones 1 y 3 completadas, el botón dice "Continuar: 2. Tu primer commit" y abre esa lección.
- [ ] V14 [web, móvil] Con todas las lecciones de un curso completadas veo "{total} de {total} lecciones", la barra llena, "Curso terminado" y ningún botón Empezar ni Continuar; cualquier lección se puede abrir desde la lista.
- [ ] V15 [web, móvil] Mientras carga el detalle, el avance no aparece en "0 de {total}" ni por un instante antes de mostrar el real.
- [ ] V16 [web, móvil] Con un lector de pantalla, la barra se anuncia como "{completadas} de {total} lecciones completadas" y cada lección completada como "completada".
- [ ] V17 [móvil] La barra de pestañas tiene "Explorar", "Mis cursos" y "Cuenta".
- [ ] V18 [móvil] Con la cuenta B sin progreso, "Mis cursos" muestra "Todavía no empiezas ningún curso." y "Explorar cursos", que lleva a la pestaña "Explorar".
- [ ] V19 [móvil] Con lecciones completadas en "Git esencial" y luego en "Japonés sencillo", "Mis cursos" muestra primero "Japonés sencillo" y después "Git esencial", cada uno con su "{completadas} de {total} lecciones" y su barra; no aparecen los cursos que no empecé.
- [ ] V20 [móvil] Al completar después una lección de "Git esencial" y volver a "Mis cursos", "Git esencial" pasa al primer lugar con el avance actualizado.
- [ ] V21 [móvil] Pulsar un curso abre su detalle encima de las pestañas; volver regresa a "Mis cursos".
- [ ] V22 [móvil] Un curso con todas sus lecciones completadas muestra "Curso terminado".
- [ ] V23 [móvil] Con una lección completada en la web mientras "Mis cursos" está abierta en el móvil, al deslizar hacia abajo aparece el avance nuevo.
- [ ] V24 [web] El encabezado tiene el enlace "Mi panel" en todas las pantallas con el marco común, y lleva a la página "Mi panel" con la sección "Sigue aprendiendo".
- [ ] V25 [web] Con la cuenta B sin progreso, "Sigue aprendiendo" muestra "Todavía no empiezas ningún curso." y "Explorar cursos", que lleva al catálogo.
- [ ] V26 [web] "Sigue aprendiendo" muestra los mismos cursos, en el mismo orden y con el mismo avance que "Mis cursos" del móvil con la misma cuenta. Pulsar un curso lleva a su detalle.
- [ ] V27 [web, móvil] Con el servidor apagado justo antes de terminar una lección, la pantalla de lección completada muestra "No se pudo guardar tu progreso." y "Reintentar"; al encender el servidor y pulsar "Reintentar", aparece "Progreso guardado" y la lección queda completada.
- [ ] V28 [web, móvil] Si en ese error pulso "Volver al curso" sin reintentar, la lección no queda completada en el detalle.
- [ ] V29 [móvil] En modo avión al terminar una lección veo "Sin conexión. Tu progreso no se guardó." y "Reintentar"; al quitar el modo avión y pulsar "Reintentar", se guarda.
- [ ] V30 [web, móvil] Si el curso deja de estar publicado mientras curso una lección, al terminarla veo "Esta lección ya no está disponible. Tu progreso no se guardó." sin "Reintentar", y el curso ya no aparece en "Mis cursos" ni en "Mi panel". Al volver a publicarlo, reaparece con lo que había completado.
- [ ] V31 [web, móvil] Con el servidor apagado, "Mis cursos" (móvil) y "Mi panel" (web) muestran "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y "Reintentar"; al encender el servidor y pulsar "Reintentar", aparece la lista.
- [ ] V32 [móvil] En modo avión, "Mis cursos" muestra "Sin conexión. Revisa tu conexión e inténtalo de nuevo." y "Reintentar".
- [ ] V33 [móvil] Si al volver de una lección completada al detalle del curso no hay conexión, el detalle sigue en pantalla con "Sin conexión. Revisa tu conexión e inténtalo de nuevo." encima y "Reintentar"; al quitar el modo avión y pulsar "Reintentar", la lección aparece marcada.
- [ ] V34 [web, móvil] Dado que la sesión expiró, cuando abro "Mis cursos" o "Mi panel", entonces llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar.".
- [ ] V35 [web, móvil] Dado que la sesión expiró mientras cursaba una lección, cuando la termino, llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar."; al volver a entrar, esa lección no está completada.
- [ ] V36 [backend] Registrar, sin pasar por un cliente, una lección de un curso en borrador responde exactamente igual que con un identificador que no existe; registrar más aciertos que preguntas, o un número de preguntas que no es el de la lección, se rechaza y no cambia el progreso.

---

## Dependencias

- **Fase 1** va antes que todo. T001 → T007 (el contrato se edita antes de copiarlo) y T004–T006 → T007 (cada copia se commitea en la rama de F04 de su repo). T002 → T003. T004, T005 y T006 son independientes entre sí. T002 y T003 van antes de cualquier tarea de interfaz.
- **Backend** (fase 2): T008 → T010 → T011 → T012; T009 en paralelo desde el inicio; T013 necesita T008 y T011 (`aProgresoLeccion`), y vuelve a dejar compilando el backend después de T007; T014 necesita T009, T011 y T013; T015 necesita T012; T016 al final.
- **Web** (fase 3), cuando el backend pasa su punto de control:
  - T017, T018, T019, T022, T023 y T024 en paralelo;
  - T020 necesita T018 y T019; T021 necesita T020;
  - T025 necesita T017; T026 necesita T022, T023, T024 y T025;
  - T027 necesita T018 y T020; T028 necesita T018 (y va después de T027, mismo archivo);
  - T029 necesita T017 y T021; T030 necesita T029; T031 cuando se quiera;
  - T032 cuando se quiera; T033 al final.
- **Móvil** (fase 4), en paralelo con la web, con el mismo orden: T034 a T038, T041, T042 y T043 en paralelo; T039 necesita T035 y T038; T040 necesita T039; T044 necesita T034; T045 necesita T041 a T044; T046 necesita T036, T037 y T039; T047 después de T046; T048 necesita T034, T036, T037 y T040; T049 después de T048; T051 al final.
- **Cierre y validación** al final. V09 y V36 (backend) se pueden validar en cuanto termina la fase 2.

## Paralelo, por ejemplo

```text
Preparación: T002→T003 (diseño) ‖ T001→T007 (contrato) ‖ T004 ‖ T005 ‖ T006
Backend:     T009 (validación del cuerpo)   mientras T008→T010→T011→T013 avanzan
Web:         T017 ‖ T018 ‖ T019 ‖ T022 ‖ T023 ‖ T024, luego T020→T021 ‖ T025→T026
Móvil:       T034 ‖ T035 ‖ T036 ‖ T037 ‖ T038 ‖ T041 ‖ T042 ‖ T043, luego T039→T040 ‖ T044→T045
Repos:       fase 3 (web) ‖ fase 4 (móvil)
```

## Estrategia

1. Diseño y contrato en `brote_specs` (T001 a T003), porque los tres repos
   los usan.
2. Backend completo y probado con curl (punto de control de la fase 2): ya
   cubre V09 y V36, y deja listas las tres rutas para los dos clientes.
3. En cada cliente, primero registrar (servicio, hook, pantalla final): con
   eso ya se ve la fila en la base (quickstart.md, P2). Después el detalle
   con su avance, y al final "Mi panel" / "Mis cursos".
4. Cierre de documentos y validación manual completa (V01 a V36) antes de los
   PR a `dev` de cada repo, con la spec enlazada y los criterios cubiertos.
