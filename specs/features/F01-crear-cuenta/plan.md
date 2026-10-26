# Plan técnico: F01 Crear cuenta e iniciar sesión

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-10-19 | **Rama**: `feature/F01-crear-cuenta`

Artefactos: [research.md](./research.md) · [data-model.md](./data-model.md) ·
[contracts/api.md](./contracts/api.md) · [contracts/contrato.md](./contracts/contrato.md) ·
[quickstart.md](./quickstart.md)

## Resumen

Cuentas con correo y contraseña, y sesión por dispositivo, en web y móvil.
El backend integra Better Auth **sin montar su handler**: expone cuatro rutas
propias (`POST /cuentas`, `POST /sesiones`, `DELETE /sesiones/actual`,
`GET /usuarios/yo`) que validan con las reglas y mensajes de la spec y llaman
a `auth.api.*` por dentro. La web recibe la sesión en una cookie `httpOnly`;
el móvil, como token Bearer guardado en `expo-secure-store` (lo pide con la
cabecera `X-Cliente: movil`). Cada cliente tiene un `SesionContext` (Context
+ useReducer) que arranca con `GET /usuarios/yo` y protege sus rutas. La
sesión dura 30 días sin uso y se renueva al usarla.

## Revisión contra la constitución

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | sí | Al planear se ajustaron cuatro detalles de la spec, ya escritos en ella: estado "Error" al abrir la web, arranque sin conexión en el móvil, botón "Mostrar"/"Ocultar" y cómo se cuentan los caracteres |
| II. Un producto, cuatro repos | sí | Tipos, límites y mensajes nuevos en `contrato/` 0.2.0, copiados a los tres repos |
| III. El backend es la autoridad | sí | Las rutas validan todo con las mismas reglas que el cliente. Al no montar el handler de Better Auth, no hay otra puerta para crear cuentas sin validar. `/usuarios/yo` y el middleware `requerirSesion` deciden quién tiene sesión |
| IV. Actividades extensibles | no aplica | |
| V. Estados explícitos | sí | Arranque (cargando / con sesión / sin sesión / error web / sin conexión móvil) y formularios (listo / errores / enviando / error) |
| VI. Dependencias justificadas | sí | Ver "Dependencias nuevas". Ninguna contradice `docs/decisiones/` |
| VII. Estilo propio | **no**, en un punto | Las tablas y columnas de Better Auth quedan en inglés (ver "Excepciones") |
| VIII. Terminado = validado | sí | Cada criterio tiene pasos en `quickstart.md` |

Revisión después del diseño: sin cambios; la única excepción es la de VII.

## Cambios al contrato

`contrato/VERSION` 0.1.0 → **0.2.0**. Detalle en [contracts/contrato.md](./contracts/contrato.md):

- `RespuestaError` (formato único de error de la API, con `campos` opcional).
- `Usuario`, `RespuestaUsuario`, `CuerpoCrearCuenta`, `CuerpoEntrar`.
- Constantes `CABECERA_CLIENTE`, `CABECERA_TOKEN`, `LIMITES_CUENTA`,
  `PATRON_CORREO`, `MENSAJES_CUENTA`.

## Cambios al modelo de datos

- Modelos Prisma `User`, `Session`, `Account` y `Verification`, con las tablas
  de Better Auth (`user`, `session`, `account`, `verification`). Detalle en
  [data-model.md](./data-model.md).
- Primera migración del proyecto: `prisma/migrations/<fecha>_f01_cuentas/`.

## API

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| POST | `/cuentas` | Cualquiera | Valida, crea la cuenta e inicia sesión |
| POST | `/sesiones` | Cualquiera | Entra con correo y contraseña |
| DELETE | `/sesiones/actual` | Cualquiera (idempotente) | Cierra la sesión de ese dispositivo |
| GET | `/usuarios/yo` | Con sesión | Devuelve el usuario; renueva la sesión si toca |

Además estrena el formato único de error (`RespuestaError`) para toda la API.

## Por repo

### brote_backend_express

- **Archivos**:
  - `prisma/schema.prisma`: modelos `User`, `Session`, `Account` y
    `Verification` (Better Auth 1.7) + migración.
  - `src/config/entorno.ts`: nuevas `SECRETO_AUTH` (obligatoria, al menos 32
    caracteres) y `URL_API` (por defecto `http://localhost:<PUERTO>`).
    También en `.env.example`.
  - `src/config/bd.ts` (nuevo): `PrismaClient` con `PrismaPg` y
    `DATABASE_URL`. Los servicios lo importan; las rutas no.
  - `src/config/auth.ts` (nuevo): `betterAuth({ database: prismaAdapter(bd,
    { provider: "postgresql" }), secret, baseURL, trustedOrigins:
    origenesPermitidos, emailAndPassword: { enabled: true, autoSignIn: true,
    minPasswordLength: 8, maxPasswordLength: 512 }, session: { expiresIn: 30
    días, updateAge: 1 día }, rateLimit: { enabled: false }, plugins:
    [bearer()] })`. Los porqués están en research.md (puntos 3, 4 y 6).
  - `src/middleware/errores.ts`: `ErrorApi(estado, mensaje, campos?)` y
    respuesta `RespuestaError`.
  - `src/middleware/sesion.ts` (nuevo): `requerirSesion` llama a
    `auth.api.getSession({ headers, returnHeaders: true })`, reenvía la
    renovación y deja el usuario en `res.locals`; sin sesión lanza
    `ErrorApi(401, MENSAJES_CUENTA.sesionTerminada)`. Incluye
    `cabecerasParaAuth(req)` (si viene `X-Cliente: movil`, quita `Cookie`) y
    `reenviarSesion(desde, req, res)` (copia `Set-Cookie` a la web o
    `set-auth-token` al móvil, nunca los dos).
  - `src/validacion/cuenta.ts` (nuevo): `normalizarCorreo`,
    `validarCrearCuenta(cuerpo)`, `validarEntrar(cuerpo)`. Devuelven los datos
    limpios o lanzan `ErrorApi(400, datosInvalidos, campos)` con todos los
    campos que fallan.
  - `src/servicios/cuentas.ts` (nuevo): `crearCuenta`, `entrar`,
    `cerrarSesion` y `aUsuario(user)` (traduce a `Usuario`). Traduce los
    `APIError` de Better Auth: 422 → 409 correo repetido, 401 → credenciales
    incorrectas, 400 de correo → `campos.correo`.
  - `src/rutas/cuentas.ts`, `src/rutas/sesiones.ts`, `src/rutas/usuarios.ts`
    (nuevos), montadas en `src/rutas/index.ts`.
- **Validación de entrada**: en la ruta, antes del servicio. Un campo que no
  es texto cuenta como vacío. 400 con todos los campos que fallan; ver
  [contracts/api.md](./contracts/api.md).
- **Notas**:
  - No se monta `toNodeHandler(auth)`, así que no existe `/api/auth/*`
    (research.md, punto 1).
  - CORS no cambia: la web no manda `X-Cliente` y el móvil no pasa por CORS.
  - Actualizar la estructura de `CLAUDE.md` del repo (carpeta `validacion/`,
    `config/bd.ts`, `config/auth.ts`) y el `README.md` (`SECRETO_AUTH`).

### brote_web_react

- **Páginas y rutas** (`src/rutas.tsx`):
  - `/entrar` → `paginas/Entrar/Entrar.tsx` y `/registro` →
    `paginas/Registro/Registro.tsx`, envueltas en `SoloSinSesion` (con sesión
    → `<Navigate to="/" replace />`).
  - Rutas protegidas: `RutaProtegida` envuelve al `Layout`, con `/` (Inicio)
    y `*` (NoEncontrada) como hijas. Mientras `cargando` muestra
    `PantallaCarga`; si hay error de conexión, `PantallaSinServidor` con
    "Reintentar"; sin sesión, `<Navigate to="/entrar" replace state={{ desde
    }} />`. `desde` no se manda cuando el usuario cerró sesión.
  - Después de entrar se llega a `state.desde` o a `/`; después de crear
    cuenta, siempre a `/`. *Al implementar*: no navegan las páginas, sino
    `SoloSinSesion` en cuanto la sesión pasa a `conSesion` (así no compiten
    dos redirecciones); a `/registro` se llega sin `desde`.
  - `Inicio.tsx`: deja de mostrar el ping y muestra "Hola, {nombre}" (es
    provisional hasta F02).
- **Componentes** (`src/componentes/<Nombre>/<Nombre>.tsx + .module.css`):
  - `CampoTexto`: etiqueta, `error` debajo, `aria-invalid` y
    `aria-describedby`.
  - `CampoContrasena`: `CampoTexto` con el botón "Mostrar" / "Ocultar"
    (`type="button"`, `aria-pressed`).
  - `Boton`: `enviando` lo deshabilita y cambia el texto.
  - `MensajeFormulario`: error general o aviso arriba del formulario.
  - `MenuCuenta`: en el encabezado del `Layout`, un botón con el nombre que
    abre un menú con el correo y "Cerrar sesión". Se cierra con Escape o al
    hacer clic fuera.
  - `RutaProtegida`, `SoloSinSesion`, `PantallaCarga`, `PantallaSinServidor`.
  - *Al implementar*: `FormularioCuenta` (tarjeta, marca, título y pie
    comunes a Entrar y Crear cuenta), para que las dos páginas no repitan CSS.
- **Estado**: contexto de sesión (decisión 0011), con `useReducer`. *Al
  implementar* quedó en tres archivos para cumplir "un componente por
  archivo" y la regla `react-refresh` de ESLint: `src/contextos/SesionContext.ts`
  (contexto y tipos), `src/contextos/SesionProvider.tsx` (reducer y
  arranque) y `src/hooks/useSesion.ts`.
  - Estado: `{ estado: "cargando" | "conSesion" | "sinSesion" | "sinServidor",
    usuario, aviso: "sesionTerminada" | null, motivo }`.
  - Acciones: `iniciada(usuario)`, `terminada(aviso)`, `perdida` (401
    durante el uso; se ignora si no había sesión), `cerrada`, `sinServidor`,
    `reintentar`.
  - La marca `sesion.activa` solo se borra con la respuesta vigente del
    arranque: en desarrollo `StrictMode` arranca dos veces y, si la primera
    vuelta la borraba, no aparecía el aviso de sesión terminada.
  - Hook `useSesion()` que expone `{ ...estado, crearCuenta, entrar,
    cerrarSesion, reintentar }`.
  - El estado local de cada formulario (valores, errores por campo,
    `enviando`) vive en su página, con el hook `src/hooks/useFormulario.ts`.
- **Servicios y validación**:
  - `src/servicios/sesion.ts`: `crearCuenta`, `entrar`, `cerrarSesion`,
    `traerYo`, todos sobre `pedir()`.
  - `src/servicios/api.ts`: `pedir()` acepta una respuesta 204 sin cuerpo y
    agrega `alPerderSesion(fn)`, que avisa al contexto de un 401 (salvo en
    `POST /sesiones`).
  - `src/validacion/cuenta.ts`: mismas reglas que el backend, con las
    constantes del contrato.
  - `src/constantes/almacenamiento.ts`: claves `sesion.activa` y
    `sesion.cierrePendiente` (research.md, punto 10).
- **Notas**:
  - Los errores de campo se muestran al enviar; editar un campo borra su
    error.
  - `ErrorHttp` con `cuerpo.campos` → errores por campo; con solo
    `cuerpo.error`, mensaje general.
  - Un `TypeError` de `fetch` o un 5xx → "No se pudo conectar con Brote.
    Inténtalo de nuevo en un momento.".
  - Los formularios usan `<form onSubmit>` y `noValidate` (los mensajes son
    los nuestros, no los del navegador), y `autoComplete` `name` / `email` /
    `new-password` / `current-password`.

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**:
  - `src/app/_layout.tsx`: `SesionProvider`; el splash sigue visible mientras
    `cargando`. `Stack` con `Stack.Protected guard={conSesion}` para
    `(tabs)` y `Stack.Protected guard={!conSesion}` para `(auth)`
    (research.md, punto 9).
  - `src/app/(auth)/_layout.tsx`, `(auth)/entrar.tsx` y `(auth)/registro.tsx`.
  - `src/app/(tabs)/_layout.tsx`: `Tabs` con "Inicio" y "Cuenta".
  - `(tabs)/index.tsx`: inicio provisional, "Hola, {nombre}".
  - `(tabs)/cuenta.tsx`: nombre, correo y "Cerrar sesión".
  - Se borra la demo: `src/app/index.tsx`, `src/app/inicio.tsx`,
    `src/app/curso/[id].tsx`, `src/datos/cursos.ts`, `src/tipos/tipos.ts`,
    `src/componentes/TarjetaCurso.tsx` y `src/componentes/FilaLeccion.tsx`.
    Estos dos dependen de los datos falsos; F02 y F03 los rehacen con el
    contrato, y siguen en el historial de git. `BarraProgreso` se queda.
- **Componentes**:
  - `CampoTexto`: agrega `error`, `tipo` (`"texto" | "correo"`, que define
    `keyboardType`, `autoComplete` y `textContentType`) y usa `useColores()`
    (hoy usa `colores.claro`).
  - `CampoContrasena` (nuevo): con el botón "Mostrar" / "Ocultar".
  - `Boton`: agrega `enviando` (muestra un `ActivityIndicator` y queda
    deshabilitado).
  - `MensajeFormulario` (nuevo).
  - Las pantallas usan `KeyboardAvoidingView` y un `ScrollView` con
    `keyboardShouldPersistTaps="handled"`.
- **Almacenamiento local**: `expo-secure-store` con `sesion.token` y
  `sesion.usuario` (`Usuario` en JSON). Las claves van en
  `src/constantes/almacenamiento.ts`.
- **Estado**: `src/contextos/SesionContext.tsx`, igual que en la web pero sin
  `sinServidor`. Al arrancar:
  - sin token → `sinSesion`;
  - con token, `traerYo()`: 200 → `conSesion` (y actualiza
    `sesion.usuario`); 401 → borra el token y queda `sinSesion` con el aviso;
    fallo de red → `conSesion` con el usuario guardado.
  - Cerrar sesión: borra token y usuario, pasa a `sinSesion` y luego intenta
    `DELETE /sesiones/actual` con el token que tenía (si falla, no importa).
- **Servicios**: `src/servicios/api.ts`:
  - `pedir()` manda siempre `X-Cliente: movil` y, si hay token,
    `Authorization`.
  - Guarda el token cuando llega `set-auth-token`.
  - Acepta una respuesta 204.
  - Avisa los 401 con `alPerderSesion`.
  - Cuando `fetch` falla, lanza `ErrorConexion` con `sinConexion`
    (expo-network, research.md punto 9).

  Además, `src/servicios/sesion.ts` y `src/validacion/cuenta.ts`, como en la
  web.
- **Notas**:
  - Mensajes de red: "Sin conexión. Revisa tu conexión e inténtalo de
    nuevo." y "No se pudo conectar con Brote. Inténtalo de nuevo en un
    momento.".
  - Las dos dependencias nativas nuevas vienen en Expo Go: no hace falta
    *development build*.

## Cambios a la navegación

Se integran a `specs/01-navegacion.md` al cerrar la feature.

- **Web**: `/entrar` y `/registro` (ya previstas). Todas las demás rutas
  exigen sesión. Encabezado con el menú de la cuenta.
- **Móvil**:
  - `(auth)/entrar` y `(auth)/registro` (previstas).
  - **Nueva** `(tabs)/cuenta` (nombre, correo, "Cerrar sesión").
  - `(tabs)/index` es el inicio provisional hasta que F02 lo convierta en el
    catálogo.
  - Se quita la demo (`inicio`, `curso/[id]`); el `curso/[idCurso]` previsto
    llega con F02.
- **Qué viaja**: `/entrar` recibe `state.desde` (web) para regresar a la
  página pedida.

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| `better-auth` (^1.7) | back | Cuentas, hash de contraseñas, sesiones y plugin `bearer` (decisión 0007) | JWT propio: más código sensible (0007) |
| `@prisma/client` (^7.10) | back | Runtime que importa el cliente generado por Prisma 7 (decisión 0006) | Ninguna: lo exige el generador `prisma-client` |
| `@prisma/adapter-pg` (^7.10) | back | Conexión de Prisma 7 a PostgreSQL con driver adapter | Ninguna: Prisma 7 se conecta a PostgreSQL con un driver adapter, y este es el oficial |
| `expo-secure-store` (`npx expo install`) | movil | Guardar el token cifrado en el dispositivo | AsyncStorage: no cifra y también sería una dependencia |
| `expo-network` (`npx expo install`) | movil | Distinguir "sin conexión" de "servidor caído" | `@react-native-community/netinfo` (fuera del SDK de Expo); tratar todo fallo como sin conexión (contradice la spec) |

La web no agrega dependencias.

## Excepciones a la constitución

| Qué | Por qué hace falta | Por qué no sirve la opción simple |
|---|---|---|
| VII: tablas, modelos y columnas de Better Auth en inglés (`user`, `session`, `account`, `verification`, `name`, `email`, `expiresAt`, ...) | El usuario lo decidió el 2026-10-19 como **único caso en inglés**: se dejan como las define Better Auth para no mantener un mapeo de unos 25 campos al actualizar la librería | Renombrarlas (`modelName` / `fields`) es posible, pero ese mapeo se rompe en silencio con cada versión de Better Auth. El contrato y el código propio siguen en español (`Usuario`, `nombre`, `correo`), y el servicio traduce |

Al cerrar la feature, conviene registrar esta excepción en
`docs/estilo-codigo.md` (sección Backend) o en una nota de la decisión 0007,
para que no se repita en otras tablas.

## Antes de implementar

- En `brote_backend_express` y `brote_web_react`, la rama `dev` está en el
  commit inicial y la base para SDD vive en `base-sdd`. Hay que integrar
  `base-sdd` en `dev` antes de crear `feature/F01-crear-cuenta` desde `dev`
  (decisión 0013).
- En `brote_mobile_expo`, `dev` tiene cambios sin commit (en `_layout.tsx`,
  `curso/[id].tsx`, `index.tsx`, `inicio.tsx` y componentes). Hay que hacer
  commit o descartarlos antes de crear la rama: F01 borra o reescribe esos
  archivos.
