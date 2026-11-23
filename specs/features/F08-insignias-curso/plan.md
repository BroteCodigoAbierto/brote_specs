# Plan técnico: F08 Insignias por curso completado

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-11-22 | **Rama**: `feature/F08-insignias-curso`

## Resumen

El curso gana un dato `daInsignia` (apagado por defecto) que el autor cambia en los
datos del curso del mapa (web), y una tabla nueva `insignia` guarda una fila por alumno y
curso. El backend da la insignia en el mismo `PUT` que registra una lección completada
(F04): si el curso da insignia y el alumno ya tiene todas sus lecciones, crea la fila (si
no existía) y la respuesta trae `insigniaNueva`. La pantalla final de los dos clientes la
muestra, y "Mis insignias" (Mi panel en la web, Cuenta en el móvil) la lee de
`GET /usuarios/yo/insignias`. La insignia se dibuja con un componente nuevo,
`InsigniaCurso`: la `PortadaCurso` en un círculo con una medalla.

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | Spec F08 con 16 criterios; `00-proyecto.md` ya cambió con ella |
| II. Un producto, cuatro repos | sí | Tipos nuevos en `contrato/` (0.12.0), copiados con `npm run contrato:copiar` |
| III. El backend es la autoridad | sí | El servidor decide si se gana la insignia (cuenta lecciones y progreso); el cliente solo muestra `insigniaNueva`. `daInsignia` solo cambia en un borrador del autor (la regla de F06 que ya aplica `actualizarCurso`) |
| IV. Actividades extensibles | no aplica | No agrega tipos de actividad |
| V. Estados explícitos | sí | "Mis insignias": cargando, con datos, vacío, error y sin conexión (móvil). Guardar la opción usa los estados de "Guardar cambios" de F05 |
| VI. Dependencias justificadas | sí | Sin dependencias nuevas: la medalla es `Medal` de Lucide, que ya está en los dos clientes |
| VII. Estilo propio | sí | Identificadores en español: `daInsignia`, `InsigniaCurso`, `insigniaNueva`, `traerInsignias` |
| VIII. Terminado = validado | sí | `quickstart.md` con un paso por criterio |

## Cambios al contrato

Detalle en [contracts/contrato.md](./contracts/contrato.md). `contrato/VERSION` pasa de
0.11.0 a 0.12.0.

- **Nuevo** `InsigniaCurso`: `{ idCurso, titulo, idPortada, ganadaEn }`.
- **Nuevo** `RespuestaInsignias`: `{ insignias: InsigniaCurso[] }`, de la más reciente a la
  más antigua.
- **Cambia** `RespuestaProgresoLeccion`: agrega `insigniaNueva: InsigniaCurso | null`.
- **Cambia** `CuerpoDatosCurso`: agrega `daInsignia?: boolean` (sin él no cambia; el `POST`
  sin él crea el curso con `false`).
- **Cambia** `CursoEnEditor`: agrega `daInsignia: boolean`.

## Cambios al modelo de datos

Detalle en [data-model.md](./data-model.md).

- `curso.da_insignia` (booleano, `false` por defecto).
- Tabla nueva `insignia`: `id_usuario`, `id_curso`, `ganada_en`; llave `(id_usuario,
  id_curso)`; se borra con el usuario y con el curso.
- Migración `f08_insignias`.

## API

Detalle en [contracts/api.md](./contracts/api.md).

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| PUT | `/cursos/:idCurso/lecciones/:idLeccion/progreso` | Alumno con sesión | (Cambia) Además de registrar la lección, da la insignia si corresponde y responde `insigniaNueva` |
| GET | `/usuarios/yo/insignias` | Usuario con sesión | (Nuevo) Las insignias de quien llama |
| POST / PUT | `/editor/cursos` · `/editor/cursos/:idCurso` | Autor | (Cambia) Aceptan `daInsignia`; el `PUT` solo en un borrador (como hoy) |
| GET | `/editor/cursos/:idCurso` | Autor | (Cambia) `CursoEnEditor` trae `daInsignia` |

## Por repo

### brote_backend_express

- **Archivos**:
  - `prisma/schema.prisma`: `Curso.daInsignia` y el modelo `Insignia`; migración
    `prisma/migrations/<fecha>_f08_insignias`.
  - `src/servicios/progreso.ts`: `registrarProgreso` devuelve `{ progreso, insigniaNueva }`;
    después del `upsert`, `darInsigniaSiCompleto` (ver research, punto 2). Nueva
    `traerInsignias(idUsuario)`.
  - `src/rutas/cursos.ts`: el `PUT` de progreso arma `RespuestaProgresoLeccion` con
    `insigniaNueva`.
  - `src/rutas/usuarios.ts`: `GET /yo/insignias`.
  - `src/validacion/editor.ts`: `daInsigniaDe(cuerpo)` en `validarDatosCurso`.
  - `src/servicios/editor.ts`: `crearCurso` y `actualizarCurso` guardan `daInsignia`; el
    `CursoEnEditor` lo incluye.
  - `scripts/datos-prueba.ts` y `scripts/sembrar-cursos.ts`: `daInsignia` en
    `CursoPrueba`; "Japonés sencillo" con insignia y un curso publicado nuevo, corto, con
    insignia ("Insignia rápida", 2 lecciones de teoría) para validar sin cursar mucho.
- **Validación de entrada**: `daInsignia`, si viene, es booleano; si no, 400 con
  `MENSAJES_EDITOR.datosInvalidos` en el campo `daInsignia`.
- **Notas**: sin cambios en Better Auth ni en CORS.

### brote_web_react

- **Páginas y rutas**: sin rutas nuevas.
  - `paginas/MapaCurso/DatosCurso.tsx`: `CampoCasilla` "Dar una insignia a quien complete
    el curso", tratada como el idioma (se manda solo si cambió) y en la copia de lo no
    guardado (`utilidades/copiaEditor.ts`). Deshabilitada si el curso no es borrador.
  - `paginas/Panel/Panel.tsx`: sección "Mis insignias" (entre "Sigue aprendiendo" y
    "Cursos que creé") con `usePeticion(traerInsignias)`.
  - `paginas/Leccion/Leccion.tsx`: pasa la insignia de `useGuardarProgreso` a
    `ResultadoLeccion`.
- **Componentes**:
  - Nuevo `componentes/InsigniaCurso/` (ver `docs/diseno.md`).
  - `ResultadoLeccion`: prop `insignia?: InsigniaCurso | null`.
  - Se usan `EstadoVacio`, `ErrorCarga`, `IndicadorCarga`, `CampoCasilla`, `PortadaCurso`.
- **Estado**: local. `useGuardarProgreso` guarda también `insigniaNueva`; "Mis insignias"
  con `usePeticion`. No hace falta contexto.
- **Servicios**: `servicios/progreso.ts` (`guardarProgreso` devuelve la respuesta
  completa, `traerInsignias`).

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**: sin rutas nuevas.
  - `app/(tabs)/cuenta.tsx`: sección "Mis insignias" debajo de los datos de la cuenta, con
    `usePeticion` y `useRecargarAlVolver`.
  - `app/leccion/[idCurso]/[idLeccion].tsx`: pasa la insignia a `ResultadoLeccion`.
- **Componentes**: nuevo `componentes/InsigniaCurso.tsx`; `ResultadoLeccion` con prop
  `insignia`. Se usan `EstadoVacio`, `ErrorCarga`, `IndicadorCarga`, `PortadaCurso`.
- **Almacenamiento local**: no.
- **Notas**: el mensaje sin conexión sale de `servicios/api.ts` como en el resto. Después
  de fusionar, `eas update` para la liga de Expo Go.

## Interfaz

Lo nuevo va primero en `docs/diseno.md` (sección 4), y después en los dos clientes:

- **`InsigniaCurso`** (`insignia`, `tamano`: `lista` 64 px | `grande` 96 px): la
  `PortadaCurso` recortada en círculo (radio `pildora`) con borde de 3 px `acento`; abajo a la
  derecha, un círculo de 40 % del tamaño en `acento` con `Medal` en `sobrePrimario`.
  Decorativa con nombre accesible "Insignia de {título}". En `lista` va en una fila con el
  título (`cuerpo` seminegrita, 2 líneas) y "Ganada el {fecha}" (`nota` `textoSuave`).
- **`ResultadoLeccion`**, prop `insignia`: entre los aciertos y la zona del guardado,
  `InsigniaCurso` `grande` centrada y "¡Ganaste la insignia de {título}!" en `titulo3`; se
  anuncia con la misma zona `aria-live` / `accessibilityLiveRegion`.
- **"Mis insignias"**: título de sección como "Sigue aprendiendo"; lista de
  `InsigniaCurso` `lista` (web: rejilla de 2 columnas desde 640 px; móvil: una columna).
  Vacío: `EstadoVacio` con `Medal`, título "Todavía no tienes insignias" y texto "Completa
  un curso que dé insignia para ganar la primera.". Error: `ErrorCarga` "No se pudieron
  cargar tus insignias.".

## Cambios a la navegación

- Sin pantallas nuevas. `specs/01-navegacion.md`: "Mi panel" (web) suma la sección "Mis
  insignias"; la pestaña "Cuenta" (móvil) también.

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| — | — | — | — |

## Excepciones a la constitución

Ninguna.
