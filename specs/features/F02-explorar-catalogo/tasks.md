---
description: "Lista de tareas de F02 Explorar el catálogo de cursos publicados"
---

# Tareas: F02 Explorar el catálogo de cursos publicados

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F02-explorar-catalogo`, creada desde `dev` en cada repo afectado

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase).
- Los límites y los mensajes que comparten servidor y clientes **siempre**
  salen del contrato (`LIMITES_CATALOGO`, `MENSAJES_CATALOGO`); ninguna tarea
  los escribe a mano.
- Ningún texto de un curso (título, descripción, lecciones, autor) se inserta
  como HTML: en la web nada de `dangerouslySetInnerHTML` (principio III).

---

## Fase 1: Preparación

- [X] T001 [specs] Agregar al final de `contrato/contrato.ts` el bloque "Catálogo de cursos (F02)" de [contracts/contrato.md](./contracts/contrato.md), copiado tal cual: `AutorCurso`, `ResumenCurso`, `ResumenLeccion`, `DetalleCurso`, `RespuestaCatalogo`, `RespuestaCurso`, `LIMITES_CATALOGO` y `MENSAJES_CATALOGO`. Subir `contrato/VERSION` de `0.2.0` a `0.3.0`
- [X] T002 [back] En `brote_backend_express`: `git switch dev && git pull --ff-only` (la `dev` local está atrás de `origin/dev`, que ya trae F01) y crear `feature/F02-explorar-catalogo` desde `dev`
- [X] T003 [P] [web] Igual que T002 en `brote_web_react`
- [X] T004 [P] [movil] Igual que T002 en `brote_mobile_expo`
- [X] T005 [specs] Copiar el contrato 0.3.0 a los tres repos: `npm run contrato:copiar` en brote_specs. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo

---

## Fase 2: Backend (brote_backend_express)

- [X] T006 [back] En `prisma/schema.prisma`, agregar los modelos de [data-model.md](./data-model.md), con el comentario de la feature arriba:
  - `Curso` (`@@map("curso")`): `id String @id @default(uuid(7))`, `titulo String`, `descripcion String`, `publicado Boolean @default(false)`, `idAutor String @map("id_autor")` con `autor User @relation(fields: [idAutor], references: [id], onDelete: Restrict)` y `@@index([idAutor])`, `creadoEn DateTime @default(now()) @map("creado_en")`, `actualizadoEn DateTime @updatedAt @map("actualizado_en")` y `lecciones Leccion[]`;
  - `Leccion` (`@@map("leccion")`): `id String @id @default(uuid(7))`, `idCurso String @map("id_curso")` con `curso Curso @relation(fields: [idCurso], references: [id], onDelete: Cascade)`, `titulo String`, `posicion Int`, `creadoEn` y `actualizadoEn` como en `Curso`, y `@@unique([idCurso, posicion])`;
  - en `User`, el campo de relación `cursos Curso[]` (no crea columnas).

  Generar la migración `prisma/migrations/<fecha>_f02_cursos/migration.sql` con `npm run bd:migrar -- --create-only --name f02_cursos` (o, si no se puede crear la *shadow database*, con `prisma migrate diff` desde la base actual hacia el esquema, como en F01). Agregar a mano `CREATE EXTENSION IF NOT EXISTS unaccent;` como primera línea, aplicarla y correr `npm run bd:generar`. Comprobar que un segundo `prisma migrate dev` no intenta quitar la extensión (research.md, punto 2)
- [X] T007 [P] [back] Crear `src/validacion/catalogo.ts`:
  - `type PosicionCurso = { clave: string; creadoEn: Date; id: string }`.
  - `validarConsultaCatalogo(query: unknown): { palabras: string[]; despues: PosicionCurso | null }`:
    - `q`: si no es texto, cuenta como `""`. Se recorta. Si `Array.from(q).length > LIMITES_CATALOGO.busquedaMax`, lanzar `new ErrorApi(400, MENSAJES_CATALOGO.busquedaLarga)`. `palabras` es `[]` si queda vacío; si no, `q.split(/\s+/)`;
    - `despues`: ausente o `""` → `null`; texto → `leerCursor(despues)`; cualquier otra cosa → `ErrorApi(400, MENSAJES_CATALOGO.cargaInvalida)`;
    - cualquier otro parámetro se ignora.
  - `leerCursor(texto)`: `Buffer.from(texto, "base64url")` → JSON. Tiene que ser un arreglo de 3 textos, y el segundo una fecha válida. Si no (o si `JSON.parse` falla), `ErrorApi(400, MENSAJES_CATALOGO.cargaInvalida)`.
  - `crearCursor(posicion)`: `Buffer.from(JSON.stringify([clave, creadoEn.toISOString(), id])).toString("base64url")`.
- [X] T008 [back] Crear `src/servicios/cursos.ts` con `traerCatalogo({ palabras, despues }): Promise<RespuestaCatalogo>`, una sola consulta con `bd.$queryRaw` armada con `Prisma.sql`, `Prisma.join` y `Prisma.empty` (de `../generado/prisma/client.ts`). Ningún valor se concatena como texto:
  - subconsulta sobre `curso c JOIN "user" u ON u.id = c.id_autor WHERE c.publicado`, que devuelve:
    - `id`, `titulo`, `descripcion`, `creado_en`, `u.id` y `u.name`;
    - `(SELECT count(*)::int FROM leccion l WHERE l.id_curso = c.id)`;
    - la clave `regexp_replace(lower(unaccent(c.titulo)), '^[^[:alnum:]]+', '')`;
    - el texto de búsqueda `lower(unaccent(c.titulo || ' ' || c.descripcion || ' ' || u.name))`;
  - por cada palabra, `texto LIKE '%' || lower(unaccent(${palabra})) || '%' ESCAPE '\'`, con `\`, `%` y `_` de la palabra escapados antes con `\`, todas unidas con `AND`;
  - con `despues`, `(clave COLLATE "C", creado_en, id COLLATE "C") > (${clave} COLLATE "C", CAST(${iso} AS timestamp(3)), ${id} COLLATE "C")`. La columna no tiene zona horaria y guarda UTC: por eso se compara con el ISO convertido a `timestamp(3)`, no con un `Date`;
  - `ORDER BY clave COLLATE "C", creado_en, id COLLATE "C" LIMIT 11`;
  - se responden las primeras 10 filas, traducidas con `aResumenCurso(fila)` (`autor: { id, nombre: name }`). Si llegó la undécima, `siguiente = crearCursor(décima fila)`; si no, `null`.

  Comprobar con `psql` que la comparación de filas con `COLLATE` funciona como se espera (research.md, puntos 2 a 4)
- [X] T009 [back] En `src/servicios/cursos.ts`, agregar `traerCursoPublicado(id): Promise<DetalleCurso>`:
  - `bd.curso.findFirst({ where: { id, publicado: true } })`, con `autor` (`id`, `name`) y `lecciones` (`id`, `titulo`, `posicion`, ordenadas por `posicion`);
  - si no hay, `throw new ErrorApi(404, MENSAJES_CATALOGO.cursoNoDisponible)`, igual exista o no el curso;
  - si hay, `aDetalleCurso(curso)`: `ResumenCurso` + `lecciones`, con `cantidadLecciones = lecciones.length`.
- [X] T010 [back] Crear `src/rutas/cursos.ts` y montarlo en `src/rutas/index.ts` con `rutas.use("/cursos", rutasCursos)`:
  - `GET /`: `requerirSesion` → `validarConsultaCatalogo(req.query)` → `traerCatalogo` → `200` con `RespuestaCatalogo`;
  - `GET /:idCurso`: `requerirSesion` → `traerCursoPublicado(req.params.idCurso)` → `200` con `RespuestaCurso` (`{ curso }`).

  La sesión va primero: sin sesión es 401 aunque los parámetros estén mal
- [X] T011 [P] [back] Crear `scripts/datos-prueba.ts`, que exporta las cuentas y los cursos de [quickstart.md](./quickstart.md), sección 1.1, sin leer `brote_specs`:
  - cuentas `autor@brote.test` y `autor2@brote.test`, las dos "Equipo Brote" con contraseña `brote12345`;
  - **publicados**: los cuatro cursos del prototipo, con `title`, `description` y los `lessons[].title` (en orden) copiados de `../brote_specs/referencia/cursos-prototipo/<carpeta>/manifest.json`;
  - **no publicados**, todos de `autor@`:
    - "Curso en borrador" (1 lección), "Curso en revisión" (1), "Sin lecciones todavía" (0), "Una sola lección" (1) y "¿Cómo se dice hola?" (2);
    - `Texto <b>hola</b> <script>`, con descripción `Si ves <b>hola</b> sin negritas y <script>alert(1)</script> como texto, se muestra bien.` (1 lección);
    - "Curso de prueba 01" a "Curso de prueba 21", con la descripción "Curso genérico para probar la carga de 10 en 10." y de 1 a 3 lecciones;
  - **no publicado**, de `autor2@`: "Huerto en casa" (2 lecciones).

  Las descripciones y lecciones de los extra no usan las palabras de los criterios de búsqueda (`git`, `japones`, `programacion`, `flex`, `sencill`, `cocina`, `equipo`, `brote`)
- [X] T012 [back] Crear `scripts/sembrar-cursos.ts` y agregar `"bd:sembrar": "node --env-file-if-exists=.env scripts/sembrar-cursos.ts"` a `package.json`. El script:
  1. crea cada cuenta de prueba que no exista con `auth.api.signUpEmail({ body: { name, email, password } })`;
  2. borra los cursos de autores con correo `@brote.test` (las lecciones se borran en cascada);
  3. crea los cursos de `datos-prueba.ts` con sus lecciones (`posicion` 1, 2, 3, ...) y su `publicado`;
  4. imprime cuántos cursos creó y cuántos quedaron publicados, y llama a `bd.$disconnect()`.

  Lleva un comentario de uso como el de `scripts/expirar-sesiones.ts`. Correrlo dos veces seguidas deja el mismo estado
- [X] T013 [P] [back] Actualizar `CLAUDE.md`: en la estructura, `scripts/` (herramientas de desarrollo: `expirar-sesiones.ts`, `sembrar-cursos.ts`). En `README.md`, `npm run bd:sembrar` en "Arrancar en local"
- [X] T014 [back] `npm run tipos` y `npm run lint` sin errores

**Punto de control**: después de `npm run bd:sembrar`, quickstart.md sección 2 (B1 a B7) da exactamente las respuestas de [contracts/api.md](./contracts/api.md).

---

## Fase 3: Web (brote_web_react)

- [X] T015 [web] Mover `MENSAJE_SIN_SERVIDOR` de `src/servicios/sesion.ts` a `src/servicios/api.ts` y actualizar sus imports en `src/servicios/sesion.ts` y `src/componentes/PantallaSinServidor/PantallaSinServidor.tsx`
- [X] T016 [web] Crear `src/servicios/cursos.ts` sobre `pedir()`:
  - `traerCatalogo({ q, despues }: { q: string; despues?: string | null })`: `GET /cursos` con `URLSearchParams`; `q` solo si no está vacía, y `despues` solo si viene;
  - `traerCurso(id)`: `GET /cursos/${encodeURIComponent(id)}`;
  - `esNoDisponible(error)`: `ErrorHttp` con estado 404;
  - `leerErrorDeCarga(error): string`: un `ErrorHttp` con estado < 500 y `cuerpo.error` devuelve ese texto; cualquier otra cosa, `MENSAJE_SIN_SERVIDOR`.
- [X] T017 [P] [web] Crear `src/utilidades/cursos.ts` (carpeta nueva), con funciones de research.md, punto 7:
  - `textoCantidadLecciones(n)`: `0` → "Sin lecciones", `1` → "1 lección", si no, "N lecciones";
  - `inicialPortada(titulo)`: primer carácter que cumple `/[\p{L}\p{N}]/u`, en `toLocaleUpperCase("es")`; si no hay, el primer carácter del título;
  - `indiceColorPortada(id)`: `h = (h * 31 + codePoint) % 2147483647` por cada carácter, y devuelve `h % 8`.
- [X] T018 [P] [web] En `src/estilos/tokens.css`, agregar `--color-portada-1` a `--color-portada-8` (`#2f7d4f`, `#2c6aa0`, `#7b4fa0`, `#a8443f`, `#9a5b13`, `#1f7a7a`, `#8a4a6b`, `#4a5a6a`) y `--color-sobre-portada: #ffffff`, iguales en claro y oscuro. Revisar que cada color tenga contraste ≥ 4.5:1 con el blanco; si alguno no llega, oscurecerlo y anotar el valor nuevo en research.md, punto 7, para que el móvil use el mismo
- [X] T019 [web] Crear `src/componentes/PortadaCurso/PortadaCurso.tsx` y `.module.css`:
  - props `id`, `titulo` y `tamano: "tarjeta" | "detalle"`;
  - un cuadro con la inicial (`inicialPortada`) sobre `var(--color-portada-N)`, donde N es `indiceColorPortada(id) + 1`;
  - `aria-hidden="true"`: es decorativa y el título va al lado.
- [X] T020 [web] Crear `src/componentes/TarjetaCurso/TarjetaCurso.tsx` y `.module.css`. Recibe `curso: ResumenCurso` y es un `Link` a `/cursos/${curso.id}` con:
  - `PortadaCurso`;
  - el título (`h2`), cortado a 2 líneas con `line-clamp`;
  - "Por {autor.nombre}";
  - la descripción, cortada a 3 líneas con `line-clamp` y "…";
  - `textoCantidadLecciones(curso.cantidadLecciones)`.
- [X] T021 [P] [web] Crear `src/componentes/Buscador/Buscador.tsx` y `.module.css`:
  - props `valor`, `alCambiar` y `buscando`;
  - `<input type="search">` con `aria-label="Buscar cursos"`, `placeholder="Buscar cursos"` y `maxLength={LIMITES_CATALOGO.busquedaMax}`;
  - cuando `buscando`, un indicador pequeño junto al campo, dentro de un `role="status"` con el texto oculto "Buscando...".
- [X] T022 [P] [web] Crear `src/componentes/IndicadorCarga/IndicadorCarga.tsx` y `.module.css`: el mismo indicador de `PantallaCarga`, pero dentro de la página (sin ocupar toda la ventana), con `role="status"` y el texto oculto "Cargando..."
- [X] T023 [P] [web] Crear `src/componentes/ErrorCarga/ErrorCarga.tsx` y `.module.css`: props `mensaje` y `alReintentar`; el mensaje con `role="alert"` y un `Boton` "Reintentar"
- [X] T024 [web] Crear el contexto del catálogo en tres archivos, como el de la sesión: `src/contextos/CatalogoContext.ts` (tipos y contexto), `src/contextos/CatalogoProvider.tsx` (reducer y pedidos) y `src/hooks/useCatalogo.ts`.
  - Estado: `{ consulta, cursos, siguiente, fase: "cargando" | "listo" | "error", buscando, cargandoMas, errorMas, error }`. Empieza con `fase: "cargando"` y sin consulta pedida.
  - `buscar(consulta)`:
    - si es la consulta vigente y `fase` no es `"error"`, no hace nada (así, al volver del detalle no se pide otra vez);
    - si hay una lista en pantalla (`fase: "listo"`), la deja y marca `buscando`; si no, `fase: "cargando"`;
    - pide `traerCatalogo({ q: consulta })`. Al llegar, reemplaza `cursos` y `siguiente` y quita `buscando`; si falla, `fase: "error"`.
  - `cargarMas()`: no hace nada sin `siguiente` o con `cargandoMas`. Pide `traerCatalogo({ q: consulta, despues: siguiente })`; al llegar, agrega al final; si falla, `errorMas`.
  - `reintentar()`: repite lo que falló (la primera carga o la de más).
  - Cada respuesta lleva la consulta que la pidió, y el reducer la ignora si ya no es la vigente.
  - `useCatalogo()` expone el estado, las tres acciones y `mensajeError` (`leerErrorDeCarga`).
- [X] T025 [web] En `src/componentes/Layout/Layout.tsx`, envolver el `<Outlet />` con `<CatalogoProvider>` (así sigue montado al ir de `/` a `/cursos/:idCurso` y volver) y agregar `<ScrollRestoration />` de `react-router` (research.md, punto 8)
- [X] T026 [web] Crear `src/paginas/Catalogo/Catalogo.tsx` y `Catalogo.module.css`:
  - `q` sale de `useSearchParams`, y el texto del buscador (`useState`) empieza con `q`;
  - al escribir, el texto cambia al instante. A los 300 ms sin escribir, si difiere de `q`, `setSearchParams(texto ? { q: texto } : {}, { replace: true, preventScrollReset: true })`;
  - un efecto llama a `buscar(q.trim())` cada vez que cambia `q`;
  - estados:
    - `fase: "cargando"` → `IndicadorCarga`, sin lista;
    - `"error"` → buscador y `ErrorCarga` con `mensajeError` y `reintentar`;
    - `"listo"`, sin consulta y sin cursos → "Todavía no hay cursos publicados.", **sin** buscador;
    - con consulta y sin cursos → "No hay cursos que coincidan con «{consulta}»." y un `Boton` "Borrar búsqueda", que vacía el texto y quita `q` en el momento;
    - con cursos → buscador y una cuadrícula de `TarjetaCurso`, atenuada (opacidad) mientras `buscando`;
  - al final de la lista:
    - con `siguiente`, `Boton` "Ver más" → `cargarMas()`, con `enviando={cargandoMas}` y `textoEnviando="Cargando..."`;
    - con `errorMas`, `ErrorCarga` → `reintentar`.
- [X] T027 [web] Crear `src/paginas/DetalleCurso/DetalleCurso.tsx` y `DetalleCurso.module.css`:
  - `idCurso` sale de `useParams`; los datos, de `usePeticion(useCallback(() => traerCurso(idCurso), [idCurso]))`;
  - estados:
    - cargando → `IndicadorCarga`;
    - `esNoDisponible(error)` → `MENSAJES_CATALOGO.cursoNoDisponible` y un `Link` "Ver cursos" a `/`;
    - otro error → `ErrorCarga` con `leerErrorDeCarga` y `recargar`;
  - con datos:
    - `PortadaCurso` `tamano="detalle"`, el título en `h1`, "Por {autor.nombre}", la descripción completa (`white-space: pre-line`) y `textoCantidadLecciones`;
    - la lista `<ol>` con "{posicion}. {titulo}" por lección (`list-style: none`);
    - sin lecciones, "Este curso todavía no tiene lecciones." en lugar de la lista.
- [X] T028 [web] En `src/rutas.tsx`, dentro del `Layout`: `/` → `Catalogo` y `/cursos/:idCurso` → `DetalleCurso` (antes de `*`). Borrar `src/paginas/Inicio/Inicio.tsx` e `Inicio.module.css`, y actualizar el comentario del archivo
- [X] T029 [P] [web] Actualizar `CLAUDE.md`: en la estructura, `utilidades/` (funciones de presentación sin estado, p. ej. la portada de un curso)
- [X] T030 [web] `npm run tipos` y `npm run lint` sin errores

**Punto de control**: con el backend sembrado, la parte web de cada tabla de quickstart.md, sección 3, funciona.

---

## Fase 4: Móvil (brote_mobile_expo)

- [X] T031 [movil] Mover `MENSAJE_SIN_CONEXION` y `MENSAJE_SIN_SERVIDOR` de `src/servicios/sesion.ts` a `src/servicios/api.ts`, y actualizar los imports de `src/servicios/sesion.ts`
- [X] T032 [movil] Crear `src/servicios/cursos.ts` con `traerCatalogo`, `traerCurso` y `esNoDisponible`, como en la web (T016), y `leerErrorDeCarga(error)` con un caso más: `ErrorConexion` con `sinConexion` → `MENSAJE_SIN_CONEXION`
- [X] T033 [P] [movil] Crear `src/utilidades/cursos.ts`, igual que la web (T017). Comprobar en Expo Go que Hermes acepta `/[\p{L}\p{N}]/u`. Si no, usar la alternativa de research.md, punto 7: letra si `c.toLowerCase() !== c.toUpperCase()`, número si `/[0-9]/`
- [X] T034 [P] [movil] En `src/constantes/tema.ts`, agregar `coloresPortada` (los mismos 8 valores de la web, T018, en el mismo orden) y `sobrePortada: "#ffffff"`
- [X] T035 [movil] Crear `src/componentes/PortadaCurso.tsx`: props `id`, `titulo` y `tamano: "tarjeta" | "detalle"`; un `View` con `coloresPortada[indiceColorPortada(id)]` y la inicial; `accessibilityElementsHidden` e `importantForAccessibility="no-hide-descendants"`
- [X] T036 [movil] Crear `src/componentes/TarjetaCurso.tsx`:
  - un `Pressable` con `accessibilityRole="button"` y `accessibilityLabel` igual al título;
  - abre el detalle con `router.push({ pathname: "/curso/[idCurso]", params: { idCurso: curso.id } })`;
  - en fila: `PortadaCurso` y, al lado, el título (`numberOfLines={2}`), "Por {autor.nombre}", la descripción (`numberOfLines={3}`) y `textoCantidadLecciones`;
  - colores de `useColores()`.
- [X] T037 [P] [movil] Crear `src/componentes/Buscador.tsx`: `TextInput` con `placeholder="Buscar cursos"`, `accessibilityLabel="Buscar cursos"`, `maxLength={LIMITES_CATALOGO.busquedaMax}`, `returnKeyType="search"`, `autoCorrect={false}` y `clearButtonMode="while-editing"`; cuando `buscando`, un `ActivityIndicator` pequeño a la derecha
- [X] T038 [P] [movil] Crear `src/componentes/ErrorCarga.tsx`: el mensaje (`accessibilityRole="alert"`) y un `Boton` "Reintentar"
- [X] T039 [movil] Crear `src/hooks/useCatalogo.ts` con `useReducer`. Tiene el mismo estado, acciones y reglas que el contexto de la web (T024), más:
  - `recargar()`: pide la primera carga de la consulta vigente y deja la lista en pantalla con `recargando`. Al llegar, reemplaza la lista (vuelve a los primeros 10); si falla, deja la lista y pone `errorRecarga`. Con `fase: "error"`, hace lo mismo que `reintentar()`;
  - `mensajeError` y `mensajeErrorRecarga` con `leerErrorDeCarga`.

  No hace falta un contexto: la pestaña sigue montada debajo del detalle
- [X] T040 [P] [movil] En `src/app/(tabs)/_layout.tsx`, la pestaña `index` pasa a llamarse "Explorar"; actualizar el comentario (ya no es provisional)
- [X] T041 [movil] Reescribir `src/app/(tabs)/index.tsx` como el catálogo:
  - el texto del buscador está en `useState`; a los 300 ms sin escribir, `buscar(texto.trim())`;
  - estados:
    - `fase: "cargando"` → `ActivityIndicator` centrado;
    - `"error"` → buscador y `ErrorCarga`;
    - si no: el buscador (salvo en el estado vacío), `MensajeFormulario` con `mensajeErrorRecarga` si hay, y la `FlatList`;
  - la `FlatList`:
    - `data={cursos}` y `renderItem` con `TarjetaCurso`;
    - `onEndReached={cargarMas}` y `onEndReachedThreshold={0.5}`;
    - `refreshing={recargando}` y `onRefresh={recargar}`;
    - opacidad reducida mientras `buscando`;
    - `ListEmptyComponent`: "Todavía no hay cursos publicados." (sin consulta) o "No hay cursos que coincidan con «{consulta}»." con "Borrar búsqueda". Va dentro de la lista para que deslizar hacia abajo siga funcionando;
    - `ListFooterComponent`: `ActivityIndicator` con `cargandoMas`; `ErrorCarga` con `errorMas`.
- [X] T042 [movil] Crear `src/app/curso/[idCurso].tsx` y registrar `<Stack.Screen name="curso/[idCurso]" options={{ headerShown: true, title: "" }} />` dentro del `Stack.Protected` con sesión de `src/componentes/NavegacionRaiz.tsx`. La pantalla:
  - lee `idCurso` con `useLocalSearchParams` y los datos con `usePeticion(useCallback(() => traerCurso(idCurso), [idCurso]))`;
  - es un `ScrollView` con `RefreshControl` (`refreshing={cargando && datos !== null}`, `onRefresh={recargar}`);
  - estados:
    - cargando sin datos → `ActivityIndicator`;
    - `esNoDisponible` → `MENSAJES_CATALOGO.cursoNoDisponible` y `Boton` "Ver cursos" → `router.back()`;
    - otro error → `ErrorCarga`;
  - con datos: los mismos contenidos que la web (T027), con la descripción completa y "Este curso todavía no tiene lecciones." cuando no hay.
- [X] T043 [P] [movil] Actualizar `CLAUDE.md`: en la estructura, `utilidades/`
- [X] T044 [movil] `npm run tipos`, `npm run lint` y `npm run doctor` sin errores ni avisos nuevos

**Punto de control**: con el backend sembrado y Expo Go, la parte móvil de cada tabla de quickstart.md, sección 3, funciona.

---

## Fase 5: Cierre

- [ ] T045 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`:
  - **Curso** y **Leccion** en "Entidades definidas", con `publicado` booleano y una nota de que la portada no se guarda;
  - en "Entidades previstas", dejar solo lo que falta: actividades de la lección (F03), límites y revisión (F05, F06), idioma y gamificación (F05, F08).
- [ ] T046 [specs] Integrar a `specs/01-navegacion.md`:
  - web: `/` es el catálogo con `?q=`, y `/cursos/:idCurso` deja de estar prevista;
  - móvil: `(tabs)/index` se llama "Explorar", y `curso/[idCurso]` es una pantalla del `Stack` raíz, encima de las pestañas;
  - en "Qué viaja", `idCurso` del catálogo al detalle, y `state.desde` con `?q=`.
- [ ] T047 [specs] `npm run contrato:revisar`: todas las copias coinciden con la oficial (0.3.0)
- [ ] T048 [specs] Revisar que `spec.md` coincide con lo que se construyó; si algo cambió, actualizarla en el mismo PR

---

## Fase 6: Validación manual

Pasos de cada criterio en [quickstart.md](./quickstart.md). Al marcar uno aquí,
se marca también en spec.md. Antes de cada criterio, `npm run bd:sembrar`
deja el estado inicial.

- [ ] V01 [web, móvil] Con sesión iniciada, al abrir Brote llego al catálogo: en la web en `/` y en el móvil en la pestaña "Explorar". Ya no aparece "Hola, {nombre}".
- [ ] V02 [web, móvil] Con los cuatro cursos de prueba publicados, el catálogo los muestra en este orden: "Examen unidad 1", "Git esencial", "Japonés sencillo", "Programación en C sencilla".
- [ ] V03 [web, móvil] Cada tarjeta muestra la portada, el título, "Por {nombre del autor}", el inicio de la descripción y el número de lecciones: la de "Git esencial" dice "6 lecciones"; la de un curso con una sola lección dice "1 lección"; la de un curso sin lecciones dice "Sin lecciones".
- [ ] V04 [web, móvil] La portada de "Japonés sencillo" es una "J" sobre un color, y la de un curso titulado "¿Cómo se dice hola?" es una "C". Un mismo curso tiene el mismo color en su tarjeta, en su detalle, al recargar y en el otro cliente.
- [ ] V05 [web, móvil] Una descripción que no cabe en tres líneas se corta con "…" en la tarjeta y se ve completa en el detalle.
- [ ] V06 [web, móvil] Un curso en borrador y otro en revisión no aparecen en el catálogo ni al buscar su título exacto, aunque entre con la cuenta de su autor.
- [ ] V07 [web, móvil] Sin ningún curso publicado, el catálogo muestra "Todavía no hay cursos publicados." y no muestra el buscador.
- [ ] V08 [web, móvil] Un curso cuyo título y descripción contienen `<b>hola</b>` y `<script>` muestra esos textos tal cual en la tarjeta y en el detalle, sin negritas y sin ejecutar nada.
- [ ] V09 [web, móvil] Al escribir "git" en el buscador, sin pulsar Enter ni ningún botón, el catálogo muestra solo "Git esencial".
- [ ] V10 [web, móvil] "JAPONES" encuentra "Japonés sencillo" y "programacion" encuentra "Programación en C sencilla".
- [ ] V11 [web, móvil] "flex" encuentra "Examen unidad 1" (la palabra solo está en su descripción).
- [ ] V12 [web, móvil] "sencill" encuentra "Japonés sencillo" y "Programación en C sencilla"; "sencillo japones" encuentra solo "Japonés sencillo".
- [ ] V13 [web, móvil] El nombre del autor de los cursos de prueba encuentra sus cuatro cursos; "git" seguido de ese nombre encuentra solo "Git esencial". Si otra cuenta con el mismo nombre publica un curso, buscar ese nombre también lo encuentra.
- [ ] V14 [web, móvil] Con "cocina" veo "No hay cursos que coincidan con «cocina»." y "Borrar búsqueda"; al pulsarlo, el buscador queda vacío y veo los cuatro cursos.
- [ ] V15 [web, móvil] Un texto de solo espacios muestra el catálogo completo, y el buscador no acepta más de 100 caracteres.
- [ ] V16 [web, móvil] Si escribo "japo", lo borro y escribo "git" de corrido, termino viendo solo "Git esencial".
- [ ] V17 [web, móvil] Mientras llegan los resultados de una búsqueda, la lista anterior sigue en pantalla, atenuada, con un indicador junto al buscador; la lista no desaparece ni aparece el indicador de carga del catálogo en su lugar.
- [ ] V18 [backend] Pedir al servidor, sin pasar por un cliente, una búsqueda de 101 caracteres se rechaza; pedir el catálogo o el detalle de un curso sin sesión también se rechaza.
- [ ] V19 [backend] Pedir al servidor el detalle de un curso en borrador, con su identificador, responde exactamente igual que con un identificador que no existe.
- [ ] V20 [web, móvil] Con 25 cursos publicados, el catálogo muestra los 10 primeros por título. En el móvil, al llegar al final de la lista se agregan los 10 siguientes; en la web, al pulsar "Ver más". Después de la tercera carga veo los 25, ninguno repetido, y no se cargan más (en la web, "Ver más" ya no aparece).
- [ ] V21 [web, móvil] Al buscar "curso de prueba" veo 10 de los 21 cursos genéricos; al cargar más, otros 10, y después el último. Al borrar la búsqueda, la lista vuelve a empezar desde los primeros 10 del catálogo.
- [ ] V22 [web, móvil] Pulsar "Ver más" varias veces seguidas (web), o seguir deslizando mientras se cargan (móvil), agrega los 10 siguientes una sola vez.
- [ ] V23 [web, móvil] Con 25 cursos publicados y los primeros 10 cargados, retiro uno de esos 10; al cargar más, no se repite ni falta ninguno de los que siguen publicados.
- [ ] V24 [web, móvil] Con 10 cursos cargados, apago el servidor y pido más: los 10 siguen en pantalla y al final veo "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y "Reintentar"; al encender el servidor y pulsar "Reintentar" se agregan los 10 siguientes.
- [ ] V25 [backend] Pedir cursos al servidor, sin pasar por un cliente, nunca devuelve más de 10 de una vez, aunque se le pidan más.
- [ ] V26 [web, móvil] Al pulsar la tarjeta de "Git esencial" veo su portada, el título, "Por {nombre del autor}", la descripción completa, "6 lecciones" y las seis lecciones numeradas en orden, de "1. ¿Qué es el control de versiones?" a "6. Resolviendo conflictos".
- [ ] V27 [web, móvil] Un curso publicado sin lecciones muestra "Este curso todavía no tiene lecciones." en su detalle.
- [ ] V28 [web, móvil] Después de buscar "git" y abrir "Git esencial", al volver al catálogo el buscador sigue diciendo "git" y veo solo "Git esencial".
- [ ] V29 [web, móvil] Con 20 cursos cargados, abro el vigésimo y vuelvo al catálogo: siguen los 20 cargados y la lista está en la misma posición.
- [ ] V30 [web] Al recargar el catálogo con "git" en el buscador, sigo viendo "git" y solo "Git esencial"; con 20 cursos cargados, al recargar veo solo los primeros 10. Al recargar el detalle de un curso, sigo viendo ese curso.
- [ ] V31 [web] Dado que no hay sesión, cuando abro la dirección del detalle de "Git esencial" y entro, entonces llego a ese detalle.
- [ ] V32 [web] Una dirección de curso con un identificador que no existe muestra "Este curso no existe o ya no está disponible." y "Ver cursos", que lleva al catálogo.
- [ ] V33 [web, móvil] Si un curso deja de estar publicado después de cargar el catálogo, al pulsar su tarjeta veo "Este curso no existe o ya no está disponible."; al recargar el catálogo, ya no aparece.
- [ ] V34 [web, móvil] Mientras carga el catálogo o el detalle de un curso se ve un indicador de carga, y "Todavía no hay cursos publicados." no aparece ni por un instante.
- [ ] V35 [web, móvil] Con el catálogo abierto, apago el servidor; al buscar o al abrir un curso veo "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y "Reintentar", y lo escrito en el buscador sigue ahí. Al encender el servidor y pulsar "Reintentar" veo los cursos o el detalle.
- [ ] V36 [móvil] En modo avión, al buscar, recargar o abrir un curso veo "Sin conexión. Revisa tu conexión e inténtalo de nuevo." y "Reintentar"; al quitar el modo avión y pulsar "Reintentar" veo los datos.
- [ ] V37 [móvil] Con la app abierta en el catálogo, publico un curso nuevo; al deslizar hacia abajo, aparece y la lista vuelve a empezar desde los primeros 10. Si la recarga falla, los cursos que ya estaban siguen en pantalla junto al mensaje de error.
- [ ] V38 [web, móvil] Dado que la sesión expiró, cuando busco o abro un curso, entonces llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar."; en la web, al entrar regreso al catálogo con mi búsqueda o al detalle donde estaba.

---

## Dependencias

- **Fase 1** va antes que todo. T001 → T005 (el contrato se edita antes de copiarlo). T002, T003 y T004 son independientes entre sí.
- **Backend** (fase 2):
  - T006 → T008 → T009 → T010; T007 se puede hacer desde el inicio, pero T008 y T010 lo necesitan;
  - T011 en paralelo desde T006; T012 necesita T006 y T011;
  - T013 cuando se quiera; T014 al final.
- **Web** (fase 3), cuando el backend pasa su punto de control:
  - T015 → T016;
  - T017, T018, T021, T022 y T023 en paralelo;
  - T019 necesita T017 y T018; T020 necesita T019;
  - T024 necesita T016; T025 necesita T024;
  - T026 necesita T020 a T025; T027 necesita T016, T019, T022 y T023;
  - T028 necesita T026 y T027.
- **Móvil** (fase 4), en paralelo con la web:
  - T031 → T032 → T039;
  - T033, T034, T037, T038 y T040 en paralelo;
  - T035 necesita T033 y T034; T036 necesita T035;
  - T041 necesita T036 a T039; T042 necesita T032, T035 y T038.
- **Cierre y validación** al final. V18, V19 y V25 se pueden validar en cuanto termina el backend.

## Paralelo, por ejemplo

```text
Backend:  T007 (validación) ‖ T011 (datos de prueba)   mientras T006→T008 avanzan
Web:      T017 ‖ T018 ‖ T021 ‖ T022 ‖ T023
Móvil:    T033 ‖ T034 ‖ T037 ‖ T038 ‖ T040
Repos:    fase 3 (web) ‖ fase 4 (móvil)
```

## Estrategia

1. Backend completo, sembrado y probado con curl (punto de control de la
   fase 2): ya cubre V18, V19 y V25 y deja la API estable para los dos
   clientes.
2. Web y móvil, en paralelo o uno detrás del otro. Cada cliente termina con
   su punto de control.
3. Cierre de documentos y validación manual completa (V01 a V38) antes de los
   PR a `dev` de cada repo, con la spec enlazada y los criterios cubiertos.
