# Plan técnico: F02 Explorar el catálogo de cursos publicados

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-10-26 | **Rama**: `feature/F02-explorar-catalogo`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

Primeras tablas propias de Brote: `curso` (con el booleano `publicado`) y
`leccion` (título y posición). El backend expone `GET /cursos` (catálogo y
búsqueda, de 10 en 10 con cursor) y `GET /cursos/:idCurso` (detalle), las dos
con sesión. La búsqueda y el orden se resuelven en PostgreSQL con `unaccent`.
La web reemplaza el inicio provisional por el catálogo, guarda la búsqueda en
`?q=` y conserva lo cargado en un `CatalogoContext` al ir y volver del
detalle. El móvil convierte la pestaña "Inicio" en "Explorar", con una
`FlatList`, y agrega la pantalla `curso/[idCurso]`. Un script carga los
cursos del prototipo y los extra que piden los criterios.

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | Al planear se ajustó "Datos que toca" de la spec: el curso tiene `publicado` (sí/no), y "en revisión" llega con F06 (research.md, punto 1) |
| II. Un producto, cuatro repos | sí | Tipos y constantes nuevos en `contrato/` 0.3.0, copiados a los tres repos |
| III. El backend es la autoridad | sí | El servidor filtra `publicado = true`: ningún cliente recibe cursos sin publicar. Valida `q` y el cursor, y fija el tamaño en 10. Mismo 404 para "no existe" y "no publicado". El texto de los cursos se muestra siempre como texto, nunca como HTML |
| IV. Actividades extensibles | no aplica | Las actividades llegan con F03 |
| V. Estados explícitos | sí | Catálogo: cargando, con datos, vacío, sin resultados, buscando, cargando más, error al cargar más, error y sin conexión. Detalle: cargando, con datos, sin lecciones, no disponible, error y sin conexión |
| VI. Dependencias justificadas | sí | Ningún paquete nuevo. Se activa la extensión `unaccent` de PostgreSQL (ver "Dependencias nuevas") |
| VII. Estilo propio | sí | Tablas y columnas en español y `snake_case`; identificadores sin acentos |
| VIII. Terminado = validado | sí | Cada criterio tiene pasos en `quickstart.md` |

Revisión después del diseño: sin cambios ni excepciones.

## Cambios al contrato

`contrato/VERSION` 0.2.0 → **0.3.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- `AutorCurso`, `ResumenCurso`, `ResumenLeccion`, `DetalleCurso`,
  `RespuestaCatalogo`, `RespuestaCurso`.
- Constantes `LIMITES_CATALOGO` (`busquedaMax: 100`, `cursosPorCarga: 10`) y
  `MENSAJES_CATALOGO` (`busquedaLarga`, `cargaInvalida`, `cursoNoDisponible`).

## Cambios al modelo de datos

- Modelos Prisma `Curso` (tabla `curso`) y `Leccion` (tabla `leccion`); `User`
  gana la relación `cursos`. Detalle en [data-model.md](./data-model.md).
- Migración `prisma/migrations/<fecha>_f02_cursos/`, que instala `unaccent`.

## API

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| GET | `/cursos?q=&despues=` | Con sesión | Hasta 10 cursos publicados, filtrados y ordenados, y el cursor `siguiente` |
| GET | `/cursos/:idCurso` | Con sesión | Detalle de un curso publicado con sus lecciones; 404 si no existe o no está publicado |

## Por repo

### brote_backend_express

- **Archivos**:
  - `prisma/schema.prisma`: modelos `Curso` y `Leccion`, y `cursos Curso[]`
    en `User`, más la migración (`CREATE EXTENSION IF NOT EXISTS unaccent;`
    se agrega a mano al principio del SQL).
  - `src/validacion/catalogo.ts` (nuevo):
    - `validarConsultaCatalogo(query)` devuelve `{ palabras, despues }` o
      lanza `ErrorApi(400, ...)`. `q` que no es texto cuenta como vacío. Se
      recorta, se mide con `Array.from` y se parte por espacios.
    - `leerCursor(texto)`: base64url → JSON `[clave, creadoEn, id]`, con
      `creadoEn` como fecha válida. Si no, lanza `cargaInvalida`.
    - `crearCursor(fila)`: lo inverso.
  - `src/servicios/cursos.ts` (nuevo):
    - `traerCatalogo({ palabras, despues })`: una consulta
      `bd.$queryRaw` con `Prisma.sql` y `Prisma.join`, parametrizada. Hace
      `JOIN "user"`, cuenta las lecciones, calcula la clave de orden en una
      subconsulta, agrega una condición `LIKE ... ESCAPE '\'` por palabra
      (con `%`, `_` y `\` escapados) y la comparación de filas con el cursor.
      Ordena con `COLLATE "C"` y pide `LIMIT 11` (research.md, puntos 2 a 4).
      Devuelve `RespuestaCatalogo`.
    - `traerCursoPublicado(id)`: `bd.curso.findFirst({ where: { id,
      publicado: true } })`, con el autor (`id`, `name`) y las lecciones
      ordenadas por `posicion`. Si no lo encuentra, lanza `ErrorApi(404,
      MENSAJES_CATALOGO.cursoNoDisponible)`.
    - `aResumenCurso` y `aDetalleCurso` traducen al contrato
      (`user.name` → `autor.nombre`).
  - `src/rutas/cursos.ts` (nuevo): `GET /` y `GET /:idCurso`, las dos con
    `requerirSesion`. Se monta en `src/rutas/index.ts` con
    `rutas.use("/cursos", rutasCursos)`.
  - `scripts/datos-prueba.ts` y `scripts/sembrar-cursos.ts` (nuevos), y el
    script `"bd:sembrar"` en `package.json`. Las cuentas, los cursos y el
    estado inicial están en research.md, punto 6, y en quickstart.md, sección
    1.1.
- **Validación de entrada**: en la ruta, antes del servicio. `q` de más de 100
  caracteres → 400 `busquedaLarga`; `despues` ilegible → 400 `cargaInvalida`;
  cualquier otro parámetro se ignora. `:idCurso` no se valida: un id que no
  existe es un 404 como cualquier otro.
- **Notas**:
  - Las rutas no usan Prisma (llaman al servicio), como pide `CLAUDE.md`.
  - Actualizar en `CLAUDE.md` la estructura (`scripts/`) y en `README.md`
    `npm run bd:sembrar`.

### brote_web_react

- **Páginas y rutas** (`src/rutas.tsx`, dentro del `Layout`):
  - `/` → `paginas/Catalogo/Catalogo.tsx` (reemplaza a `Inicio`, que se
    borra con su CSS).
  - `/cursos/:idCurso` → `paginas/DetalleCurso/DetalleCurso.tsx`.
- **Catálogo** (`Catalogo.tsx`):
  - Lee `q` con `useSearchParams` y lo usa como texto inicial del buscador.
  - Al escribir, el texto se ve al instante. A los 300 ms sin escribir,
    actualiza `?q=` con `{ replace: true, preventScrollReset: true }` (sin
    `q` si el texto está vacío).
  - Cuando cambia `q`, pide `buscar(q.trim())` al contexto. Si el contexto
    ya tiene esa consulta (porque se vuelve del detalle), no pide nada.
  - Muestra los estados de la spec: cargando, vacío (sin buscador), sin
    resultados (con "Borrar búsqueda"), buscando (lista atenuada e indicador
    junto al buscador), error con "Reintentar", "Ver más", cargando más y
    error al cargar más.
- **Detalle** (`DetalleCurso.tsx`): `usePeticion` con `traerCurso(idCurso)`.
  - 404 → "Este curso no existe o ya no está disponible." y un `Link`
    "Ver cursos" a `/`.
  - Otros errores → mensaje y "Reintentar".
  - La descripción lleva `white-space: pre-line`, para respetar sus saltos de
    línea.
- **Componentes** (`src/componentes/<Nombre>/<Nombre>.tsx + .module.css`):
  - `TarjetaCurso`: un `Link` a `/cursos/:id` con la portada, el título (2
    líneas), "Por {nombre}", la descripción (3 líneas, con `line-clamp`) y
    la cantidad de lecciones.
  - `PortadaCurso`: inicial y color, en dos tamaños (tarjeta y detalle).
  - `Buscador`: `<input type="search">` con `aria-label="Buscar cursos"`,
    `maxLength={LIMITES_CATALOGO.busquedaMax}` y el indicador de "buscando"
    (`role="status"`).
  - `IndicadorCarga`: el indicador dentro de la página (`PantallaCarga`
    ocupa toda la ventana).
  - `ErrorCarga`: un mensaje y el botón "Reintentar".
- **Estado**: catálogo en un contexto (decisión 0011), en los mismos tres
  archivos que la sesión: `contextos/CatalogoContext.ts`,
  `contextos/CatalogoProvider.tsx` (reducer) y `hooks/useCatalogo.ts`. El
  `CatalogoProvider` envuelve el `<Outlet />` del `Layout`, así sigue montado
  al ir y volver del detalle (research.md, punto 8). El `Layout` agrega
  `<ScrollRestoration />`.
  - Estado: `{ consulta, cursos, siguiente, fase: "cargando" | "listo" |
    "error", buscando, cargandoMas, errorMas, error }`.
  - Acciones: `buscar(consulta)` (si ya hay cursos, deja la lista y marca
    `buscando`), `cargarMas()` (no hace nada si ya hay una carga en curso o
    no hay `siguiente`) y `reintentar()`.
  - Cada respuesta trae la consulta que la pidió; si ya no es la vigente, se
    ignora.
- **Servicios y utilidades**:
  - `src/servicios/cursos.ts`: `traerCatalogo({ q, despues })` (arma la
    dirección con `URLSearchParams`) y `traerCurso(id)`, sobre `pedir()`.
  - `MENSAJE_SIN_SERVIDOR` pasa de `servicios/sesion.ts` a `servicios/api.ts`,
    para que `cursos.ts` no dependa de `sesion.ts`. Se actualizan sus
    imports.
  - `src/utilidades/cursos.ts` (carpeta nueva): `textoCantidadLecciones(n)`
    ("Sin lecciones", "1 lección", "N lecciones"), `inicialPortada(titulo)` e
    `indiceColorPortada(id)` (research.md, punto 7).
  - `src/estilos/tokens.css`: `--color-portada-1` a `--color-portada-8`.
- **Notas**:
  - Ningún texto de curso se inserta como HTML (`CLAUDE.md`; principio III).
  - La sesión expirada no necesita nada nuevo. `pedir()` avisa el 401 y
    `RutaProtegida` guarda la dirección con `?q=`; después de entrar se
    regresa ahí.
  - Actualizar la estructura de `CLAUDE.md` (`utilidades/`).

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**:
  - `src/app/(tabs)/_layout.tsx`: la pestaña `index` se llama "Explorar".
  - `src/app/(tabs)/index.tsx`: el catálogo (reemplaza el "Hola, {nombre}").
    - Arriba de la `FlatList`, el buscador.
    - La lista usa `onEndReached` (carga más), `refreshing` y `onRefresh`
      (deslizar), `ListFooterComponent` (cargando más, error al cargar más) y
      `ListEmptyComponent` (vacío y sin resultados).
    - Si falla una recarga con cursos en pantalla, el error se ve arriba de
      la lista, con `MensajeFormulario`.
  - `src/app/curso/[idCurso].tsx` (nuevo): el detalle, en un `ScrollView`
    con `RefreshControl`. Lee el id con `useLocalSearchParams`.
  - `src/componentes/NavegacionRaiz.tsx`: agrega `<Stack.Screen
    name="curso/[idCurso]" options={{ headerShown: true, title: "" }} />`
    dentro del `Stack.Protected` con sesión (research.md, punto 9).
  - La tarjeta abre el detalle con `router.push({ pathname:
    "/curso/[idCurso]", params: { idCurso } })` (rutas tipadas activadas).
- **Componentes** (`src/componentes/`): `TarjetaCurso` (un `Pressable` con
  `accessibilityRole="button"` y `numberOfLines` 2 y 3), `PortadaCurso`,
  `Buscador` (`TextInput` con `maxLength`, `returnKeyType="search"` y el
  indicador de "buscando") y `ErrorCarga` (mensaje y "Reintentar").
- **Estado**: hook `src/hooks/useCatalogo.ts` con `useReducer`, con las mismas
  reglas que el contexto de la web y además `recargar()` y `errorRecarga`. No
  hace falta un contexto: la pestaña sigue montada debajo del detalle.
- **Servicios y utilidades**:
  - `src/servicios/cursos.ts`, como en la web.
  - `MENSAJE_SIN_CONEXION` y `MENSAJE_SIN_SERVIDOR` pasan a
    `servicios/api.ts`.
  - `src/utilidades/cursos.ts`, igual que en la web.
  - `src/constantes/tema.ts`: `coloresPortada`.
- **Almacenamiento local**: no se usa. La búsqueda y lo cargado viven
  mientras la app está abierta, como dice la spec.
- **Notas**:
  - Esperar 300 ms sin escribir antes de pedir, como en la web.
  - Si Hermes no acepta `\p{L}`, ver la alternativa de research.md, punto 7.
  - Actualizar la estructura de `CLAUDE.md` (`utilidades/`).

## Cambios a la navegación

Se integran a `specs/01-navegacion.md` al cerrar la feature.

- **Web**:
  - `/` es el catálogo, con la búsqueda en `?q=`.
  - `/cursos/:idCurso` es el detalle (estaba prevista; F04 le agrega el
    progreso).
  - Volver del detalle conserva lo cargado y la posición; recargar empieza
    desde los primeros 10.
- **Móvil**:
  - `(tabs)/index` se llama **"Explorar"** y es el catálogo.
  - `curso/[idCurso]` es una pantalla del `Stack` raíz, encima de las
    pestañas, con encabezado y botón de volver.
- **Qué viaja**:
  - Catálogo → Detalle: `idCurso` (en la dirección, en la web; como
    parámetro de ruta, en el móvil).
  - En la web, `/entrar` recibe en `state.desde` la dirección con su `?q=`.

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| Extensión `unaccent` de PostgreSQL (no es un paquete de npm) | back | Buscar y ordenar sin acentos y con ñ = n | Columnas normalizadas guardadas, búsqueda de texto completo o filtrar en Node (research.md, punto 2) |

Ningún repo agrega paquetes de npm: `ScrollRestoration` y `useSearchParams`
vienen en React Router, y `FlatList` y `RefreshControl`, en React Native.

## Excepciones a la constitución

Ninguna.

## Antes de implementar

- En los tres repos de código, la rama `dev` local está atrás de
  `origin/dev`, que ya trae F01 (PR #1). Hay que hacer `git switch dev && git
  pull --ff-only` antes de crear `feature/F02-explorar-catalogo` desde `dev`
  (decisión 0013).
- El contrato 0.3.0 se edita en `brote_specs` (rama ya creada) y se copia a
  cada repo en su rama de F02.
