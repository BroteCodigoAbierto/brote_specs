---
description: "Lista de tareas de F01 Crear cuenta e iniciar sesión"
---

# Tareas: F01 Crear cuenta e iniciar sesión

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F01-crear-cuenta`, creada desde `dev` en cada repo afectado

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase).
- Los mensajes, límites y el patrón de correo **siempre** salen de las
  constantes del contrato (`MENSAJES_CUENTA`, `LIMITES_CUENTA`,
  `PATRON_CORREO`); ninguna tarea los escribe a mano.

---

## Fase 1: Preparación

- [x] T001 [specs] Reemplazar el `export {};` de `contrato/contrato.ts` por los tipos y constantes de [contracts/contrato.md](./contracts/contrato.md) (`RespuestaError`, `Usuario`, `RespuestaUsuario`, `CuerpoCrearCuenta`, `CuerpoEntrar`, `CABECERA_CLIENTE`, `CABECERA_TOKEN`, `LIMITES_CUENTA`, `PATRON_CORREO`, `MENSAJES_CUENTA`), copiados tal cual, y subir `contrato/VERSION` de `0.1.0` a `0.2.0`
- [x] T002 [back] Preguntar al usuario y, con su visto bueno, integrar `base-sdd` en `dev` (hoy `dev` está en el commit inicial). Luego crear `feature/F01-crear-cuenta` desde `dev`
- [x] T003 [P] [web] Igual que T002 en `brote_web_react`: con visto bueno del usuario, integrar `base-sdd` en `dev` y crear `feature/F01-crear-cuenta` desde `dev`
- [x] T004 [P] [movil] `dev` tiene cambios sin commit (`src/app/_layout.tsx`, `src/app/curso/[id].tsx`, `src/app/index.tsx`, `src/app/inicio.tsx`, componentes, `src/datos/cursos.ts`, `src/tipos/tipos.ts`). Preguntar al usuario si hace commit o los descarta, y después crear `feature/F01-crear-cuenta` desde `dev`
- [x] T005 [specs] Copiar el contrato 0.2.0 a los tres repos: `npm run contrato:copiar` en brote_specs. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo

---

## Fase 2: Backend (brote_backend_express)

- [x] T006 [back] Instalar dependencias: `npm install better-auth@^1.7 @prisma/client@^7.10 @prisma/adapter-pg@^7.10` (`package.json`, `package-lock.json`)
- [x] T007 [back] En `src/config/entorno.ts`, agregar:
  - `secretoAuth` (variable `SECRETO_AUTH`, obligatoria, sin valor por defecto; si tiene menos de 32 caracteres, lanzar un error al arrancar);
  - `urlApi` (variable `URL_API`, por defecto `http://localhost:${puerto}`).

  Documentar ambas en `.env.example`, con el comentario `openssl rand -base64 32` para generar el secreto
- [x] T008 [back] Escribir en `prisma/schema.prisma` los modelos `User`, `Session`, `Account` y `Verification` de [data-model.md](./data-model.md), con nombres y columnas de Better Auth en inglés (excepción del plan) y un comentario que lo diga:
  - `User.email` `@unique`; `emailVerified` `Boolean @default(false)`; `createdAt` `@default(now())`; `updatedAt` `@updatedAt`;
  - `Session.token` `@unique`; `Session.userId` y `Account.userId` → `User.id` con `onDelete: Cascade` y `@@index([userId])`;
  - `Verification` con `@@index([identifier])`;
  - `@@map("user")`, `@@map("session")`, `@@map("account")`, `@@map("verification")`.

  Después, `npm run bd:migrar -- --name f01_cuentas` (crea `prisma/migrations/<fecha>_f01_cuentas/`). Opcional: comparar contra la salida de `npx @better-auth/cli@1.7 generate`, sin instalar la CLI
- [x] T009 [back] Crear `src/config/bd.ts`: exporta `bd = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`, importando el cliente de `../generado/prisma/client.ts`. Correr `npm run bd:generar` antes si hace falta. Agregar `DATABASE_URL` a `entorno` (obligatoria) y usarla desde ahí
- [x] T010 [back] Crear `src/config/auth.ts` con `betterAuth({...})`:
  - `database: prismaAdapter(bd, { provider: "postgresql" })`, `secret: entorno.secretoAuth`, `baseURL: entorno.urlApi`, `trustedOrigins: entorno.origenesPermitidos`;
  - `emailAndPassword: { enabled: true, autoSignIn: true, minPasswordLength: 8, maxPasswordLength: 512 }`;
  - `session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 }`, sin `cookieCache`;
  - `rateLimit: { enabled: false }` y `plugins: [bearer()]`.

  Poner al lado de cada opción no obvia un comentario corto con su porqué (research.md, puntos 3, 4 y 6)
- [x] T011 [P] [back] En `src/middleware/errores.ts`:
  - `ErrorApi` recibe un tercer parámetro opcional `campos?: Record<string, string>` y lo guarda;
  - `manejarErrores` responde `RespuestaError` (`{ error, campos }`, sin `campos` cuando no hay), tipado con el contrato;
  - el 500 sigue con `"Error interno del servidor"`
- [x] T012 [back] Crear `src/middleware/sesion.ts` con:
  - `esMovil(req)`: `req.get(CABECERA_CLIENTE.nombre) === CABECERA_CLIENTE.movil`.
  - `cabecerasParaAuth(req)`: `fromNodeHeaders(req.headers)`; si `esMovil`, sin `cookie`.
  - `reenviarSesion(cabeceras: Headers, req, res)`:
    - si es móvil, copia solo `set-auth-token` (`CABECERA_TOKEN`);
    - si es web, copia solo los `Set-Cookie` (`cabeceras.getSetCookie()`).
  - `requerirSesion` (middleware async):
    - llama a `auth.api.getSession({ headers: cabecerasParaAuth(req), returnHeaders: true })` y aplica `reenviarSesion` a la renovación;
    - sin sesión, `throw new ErrorApi(401, MENSAJES_CUENTA.sesionTerminada)`;
    - con sesión, guarda el usuario en `res.locals.usuario`.
  - `usuarioDe(res)`: devuelve `res.locals.usuario` tipado como el `user` de Better Auth.
- [x] T013 [P] [back] Crear `src/validacion/cuenta.ts`:
  - `largo(texto)`: `Array.from(texto).length`.
  - `normalizarCorreo(texto)`: `trim().toLowerCase()`.
  - `validarCrearCuenta(cuerpo: unknown): CuerpoCrearCuenta`, con datos ya limpios:
    - nombre recortado; vacío → `nombreVacio`; más de `LIMITES_CUENTA.nombreMax` → `nombreLargo`;
    - correo normalizado; vacío → `correoVacio`; no cumple `PATRON_CORREO` o más de `correoMax` → `correoInvalido`;
    - contraseña sin tocar; vacía → `contrasenaVacia`; menos de `contrasenaMin` → `contrasenaCorta`; más de `contrasenaMax` → `contrasenaLarga`.
  - `validarEntrar(cuerpo: unknown): CuerpoEntrar`: correo como arriba; contraseña vacía → `contrasenaVaciaEntrar`, sin revisar longitud.
  - Un campo ausente o que no es texto cuenta como vacío.
  - Junta todos los errores y lanza `new ErrorApi(400, MENSAJES_CUENTA.datosInvalidos, campos)`.
- [x] T014 [back] Crear `src/servicios/cuentas.ts`:
  - `aUsuario(user)` → `Usuario` (`name` → `nombre`, `email` → `correo`, `createdAt.toISOString()` → `creadoEn`).
  - `crearCuenta(datos, cabeceras)`:
    - si `bd.user.findUnique({ where: { email } })` existe → `ErrorApi(409, correoRepetido, { correo: correoRepetido })`;
    - si no, `auth.api.signUpEmail({ body: { name, email, password }, headers: cabeceras, returnHeaders: true })` → `{ usuario, cabeceras }`.
  - `entrar(datos, cabeceras)`: `auth.api.signInEmail({ ..., returnHeaders: true })`.
  - `cerrarSesion(cabeceras)`: `auth.api.signOut({ headers, returnHeaders: true })`; si no había sesión, no falla.
  - Traducir los errores con `isAPIError`:
    - 422 en registro → el mismo 409;
    - 401 al entrar → `ErrorApi(401, credencialesIncorrectas)` sin `campos`;
    - 400 por correo inválido → `ErrorApi(400, datosInvalidos, { correo: correoInvalido })`;
    - cualquier otro error se relanza (será un 500).
- [x] T015 [back] Crear `src/rutas/cuentas.ts` con `POST /` y montarlo en `src/rutas/index.ts` como `/cuentas`:
  - valida con `validarCrearCuenta` y llama a `crearCuenta(datos, cabecerasParaAuth(req))`;
  - aplica `reenviarSesion` y responde `201` con `RespuestaUsuario`.
- [x] T016 [back] Crear `src/rutas/sesiones.ts` y montarlo en `src/rutas/index.ts` como `/sesiones`:
  - `POST /`: `validarEntrar` → `entrar` → `reenviarSesion` → `200` con `RespuestaUsuario`;
  - `DELETE /actual`: `cerrarSesion` → `reenviarSesion` (borra la cookie en la web) → `204`.

  Comprobar con curl (quickstart B6) que `X-Cliente: movil` recibe `set-auth-token` y ningún `Set-Cookie`. Si `set-auth-token` no llega, tomar el token del `Set-Cookie` `better-auth.session_token`, como dice research.md punto 2
- [x] T017 [back] Crear `src/rutas/usuarios.ts` con `GET /yo` protegido por `requerirSesion` (responde `200` con `{ usuario: aUsuario(usuarioDe(res)) }`) y montarlo en `src/rutas/index.ts` como `/usuarios`
- [x] T018 [P] [back] Actualizar `CLAUDE.md`: en la estructura, `config/bd.ts`, `config/auth.ts`, `validacion/` y la nota de que las tablas de Better Auth van en inglés (única excepción). Actualizar también `README.md`: `SECRETO_AUTH` en "Arrancar en local"
- [x] T019 [back] `npm run tipos` y `npm run lint` sin errores

**Punto de control**: quickstart.md sección 2 (B1 a B9) da exactamente las respuestas de [contracts/api.md](./contracts/api.md).

---

## Fase 3: Web (brote_web_react)

- [x] T020 [web] En `src/servicios/api.ts`:
  - `pedir()` devuelve `undefined` en una respuesta `204` (sin leer JSON);
  - agregar `alPerderSesion(fn: () => void)`, que guarda un solo oyente;
  - cuando una respuesta es `401` y la ruta no es `POST /sesiones`, llamar al oyente antes de lanzar `ErrorHttp`.
- [x] T021 [P] [web] Crear `src/constantes/almacenamiento.ts` con `CLAVES = { sesionActiva: "sesion.activa", cierrePendiente: "sesion.cierrePendiente" } as const` y funciones `leerMarca`, `ponerMarca` y `quitarMarca` sobre `localStorage`, envueltas en try/catch
- [x] T022 [P] [web] Crear `src/validacion/cuenta.ts`:
  - `validarCrearCuenta(valores)` y `validarEntrar(valores)` devuelven `Partial<Record<"nombre" | "correo" | "contrasena", string>>` (vacío = válido);
  - mismas reglas y orden que el backend (T013), con `Array.from(texto).length`;
  - mensajes de `MENSAJES_CUENTA`.
- [x] T023 [web] Crear `src/servicios/sesion.ts` sobre `pedir()`:
  - `crearCuenta(cuerpo)` → `POST /cuentas`; `entrar(cuerpo)` → `POST /sesiones`;
  - `cerrarSesion()` → `DELETE /sesiones/actual`; `traerYo()` → `GET /usuarios/yo`;
  - `leerErrorDeEnvio(error)` → `{ general?: string; campos?: Record<string, string> }`:
    - `ErrorHttp` con `cuerpo.campos` → `campos` (y `general` si no hay campos);
    - `TypeError` o estado ≥ 500 → `general: "No se pudo conectar con Brote. Inténtalo de nuevo en un momento."`.
- [x] T024 [web] Crear `src/contextos/SesionContext.tsx` con `useReducer`. Estado y acciones como en plan.md.
  - Al montar:
    1. si existe la marca `cierrePendiente`, intentar `cerrarSesion()` y quitarla si responde;
    2. llamar a `traerYo()`: 200 → `iniciada`; 401 → `terminada` con aviso `"sesionTerminada"` solo si existía `sesionActiva` (y quitarla); error de red o 5xx → `sinServidor`.
  - Exponer `useSesion()` con estas funciones:
    - `crearCuenta` / `entrar`: llaman al servicio, ponen `sesionActiva` e `iniciada`, y relanzan el error para que el formulario lo muestre;
    - `cerrarSesion`: quita `sesionActiva`, despacha `cerrada` y llama al servicio; si falla por red, pone `cierrePendiente`;
    - `reintentar`.
  - Registrar `alPerderSesion` para despachar `terminada("sesionTerminada")`.
  - Envolver el `RouterProvider` con `SesionProvider` en `src/main.tsx`.
- [x] T025 [P] [web] Crear `src/componentes/CampoTexto/CampoTexto.tsx` y `CampoTexto.module.css`:
  - props `id`, `etiqueta`, `valor`, `alCambiar`, `error?`, `tipo?` (`"text" | "email" | "password"`) y `autoComplete?`;
  - el error va debajo con `id` propio, `aria-invalid` y `aria-describedby`;
  - colores con `var(--color-error)` y demás tokens.
- [x] T026 [P] [web] Crear `src/componentes/CampoContrasena/CampoContrasena.tsx` y `.module.css`: usa `CampoTexto` y alterna `password` ↔ `text` con un botón `type="button"` "Mostrar" / "Ocultar" (`aria-pressed`), sin perder el valor
- [x] T027 [P] [web] Crear `src/componentes/Boton/Boton.tsx` y `.module.css`: props `children`, `tipo?` (`"submit" | "button"`), `variante?` (`"primario" | "secundario"`), `enviando?` (deshabilita y muestra `textoEnviando`) y `alPulsar?`
- [x] T028 [P] [web] Crear `src/componentes/MensajeFormulario/MensajeFormulario.tsx` y `.module.css`: muestra un mensaje general con `variante` `"error" | "aviso"` y `role="alert"`
- [x] T029 [P] [web] Crear `src/componentes/PantallaCarga/PantallaCarga.tsx` (indicador centrado, `aria-busy`) y `src/componentes/PantallaSinServidor/PantallaSinServidor.tsx`: "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y el botón "Reintentar" → `reintentar()`. Cada uno con su `.module.css`
- [x] T030 [web] Crear `src/componentes/RutaProtegida/RutaProtegida.tsx` y `src/componentes/SoloSinSesion/SoloSinSesion.tsx`:
  - `RutaProtegida`:
    - `cargando` → `PantallaCarga`; `sinServidor` → `PantallaSinServidor`;
    - `sinSesion` → `<Navigate to="/entrar" replace state={motivo === "cerrada" ? undefined : { desde: location }} />`;
    - `conSesion` → `<Outlet />`.
  - `SoloSinSesion`: `cargando` → `PantallaCarga`; `conSesion` → `<Navigate to="/" replace />`; si no, `<Outlet />`.
- [x] T031 [web] Crear `src/paginas/Entrar/Entrar.tsx` y `Entrar.module.css`:
  - formulario `noValidate` con `CampoTexto` correo (`email`, `autoComplete="email"`), `CampoContrasena` (`current-password`) y `Boton` "Entrar";
  - al enviar:
    - `validarEntrar`; con errores, no envía;
    - si no, `entrar()` con `enviando`, ignorando envíos mientras `enviando`;
    - en error, `leerErrorDeEnvio` sin limpiar los valores;
    - en éxito, `navigate(state?.desde ?? "/", { replace: true })`;
  - editar un campo borra su error;
  - si `aviso === "sesionTerminada"`, `MensajeFormulario` aviso con `MENSAJES_CUENTA.sesionTerminada`;
  - enlace a `/registro`.
- [x] T032 [web] Crear `src/paginas/Registro/Registro.tsx` y `Registro.module.css`. Igual que T031 con:
  - nombre (`autoComplete="name"`), correo y contraseña (`new-password`);
  - `validarCrearCuenta`, `crearCuenta()` y botón "Crear cuenta";
  - en éxito, siempre `navigate("/", { replace: true })`;
  - enlace a `/entrar`.
- [x] T033 [web] En `src/rutas.tsx`:
  - `SoloSinSesion` con hijas `/entrar` (Entrar) y `/registro` (Registro);
  - `RutaProtegida` → `Layout` con hijas `/` (Inicio) y `*` (NoEncontrada).
- [x] T034 [web] Crear `src/componentes/MenuCuenta/MenuCuenta.tsx` y `.module.css`:
  - botón con el nombre del usuario (`aria-expanded`) que abre un menú con el correo y "Cerrar sesión";
  - se cierra con Escape o con un clic fuera;
  - "Cerrar sesión" llama a `cerrarSesion()`.

  Agregarlo a la derecha del encabezado en `src/componentes/Layout/Layout.tsx` (y su CSS)
- [x] T035 [web] En `src/paginas/Inicio/Inicio.tsx` (y su CSS), quitar el ping y mostrar "Hola, {nombre}" con el usuario de `useSesion()`, más un párrafo que diga que el catálogo llega pronto. El comentario dice que es provisional hasta F02
- [x] T036 [web] `npm run tipos` y `npm run lint` sin errores

**Punto de control**: con el backend corriendo, la sección "Web" de cada tabla de quickstart.md funciona.

---

## Fase 4: Móvil (brote_mobile_expo)

- [x] T037 [movil] Instalar con `npx expo install expo-secure-store expo-network` (`package.json`, `package-lock.json`). Correr `npm run doctor` sin avisos nuevos
- [x] T038 [P] [movil] Crear:
  - `src/constantes/almacenamiento.ts` con `CLAVES = { token: "sesion.token", usuario: "sesion.usuario" } as const`;
  - `src/servicios/almacenSesion.ts` sobre `expo-secure-store`, con `leerToken`, `guardarToken`, `leerUsuario` (JSON → `Usuario | null`), `guardarUsuario` y `borrarSesionGuardada`.
- [x] T039 [movil] En `src/servicios/api.ts`:
  - token en memoria, con `fijarToken(token | null)`;
  - `pedir()` agrega siempre `X-Cliente: movil` (`CABECERA_CLIENTE`) y, si hay token, `Authorization: Bearer <token>`;
  - si la respuesta trae `set-auth-token` (`CABECERA_TOKEN`), lo fija y lo guarda con `guardarToken`;
  - `204` → `undefined`;
  - `alPerderSesion(fn)` como en la web (401 salvo `POST /sesiones`);
  - si `fetch` lanza, consulta `Network.getNetworkStateAsync()` y lanza `ErrorConexion` (clase nueva con `sinConexion: boolean`; `true` si `isConnected === false` o `isInternetReachable === false`).
- [x] T040 [P] [movil] Crear `src/validacion/cuenta.ts`, igual a la de la web (T022)
- [x] T041 [movil] Crear `src/servicios/sesion.ts` con `crearCuenta`, `entrar`, `cerrarSesion`, `traerYo` y `leerErrorDeEnvio`, como en la web (T023), con dos casos más:
  - `ErrorConexion` con `sinConexion` → `"Sin conexión. Revisa tu conexión e inténtalo de nuevo."`;
  - sin `sinConexion` o estado ≥ 500 → `"No se pudo conectar con Brote. Inténtalo de nuevo en un momento."`.
- [x] T042 [movil] Crear `src/contextos/SesionContext.tsx` con `useReducer`. Estados `cargando | conSesion | sinSesion`, más `usuario` y `aviso`.
  - Al montar:
    - sin token → `sinSesion`;
    - con token → `fijarToken` y `traerYo()`: 200 → `iniciada` y `guardarUsuario`; 401 → `borrarSesionGuardada`, `fijarToken(null)` y `terminada("sesionTerminada")`; `ErrorConexion` o 5xx → `iniciada(leerUsuario())`, o `sinSesion` si no hay usuario guardado.
  - `crearCuenta` / `entrar` guardan el usuario.
  - `cerrarSesion`:
    1. guarda el token actual en una variable;
    2. `borrarSesionGuardada`, `fijarToken(null)` y `cerrada`;
    3. `DELETE /sesiones/actual` con ese token, ignorando el error.
  - `alPerderSesion` → borrar la sesión guardada y `terminada("sesionTerminada")`.
  - Exponer `useSesion()`.
- [x] T043 [P] [movil] En `src/componentes/CampoTexto.tsx`:
  - agregar `error?` (texto en rojo debajo) y `tipo?` (`"texto" | "correo"`: `keyboardType="email-address"`, `autoComplete="email"`, `textContentType="emailAddress"`);
  - pasar `nativeID` y `accessibilityLabel`;
  - cambiar `colores.claro` por `useColores()`.
- [x] T044 [P] [movil] Crear `src/componentes/CampoContrasena.tsx`: campo con `secureTextEntry` y un `Pressable` "Mostrar" / "Ocultar" que lo alterna sin perder el valor; acepta `error?` y `autoComplete` (`"current-password" | "new-password"`)
- [x] T045 [P] [movil] En `src/componentes/Boton.tsx`, agregar `enviando?` (deshabilita y muestra `ActivityIndicator`) y pasar a `useColores()`. Crear `src/componentes/MensajeFormulario.tsx` (error o aviso, `accessibilityRole="alert"`)
- [x] T046 [movil] Crear `src/app/(auth)/_layout.tsx` (`Stack` sin encabezado, ruta inicial `entrar`) y `src/app/(auth)/entrar.tsx`:
  - mismo comportamiento que la web (T031), con `KeyboardAvoidingView` y `ScrollView` (`keyboardShouldPersistTaps="handled"`);
  - aviso de sesión terminada;
  - `router.push("/registro")`.

  No navega al entrar: el `Stack.Protected` cambia de pantalla solo
- [x] T047 [movil] Crear `src/app/(auth)/registro.tsx`: igual que T046 con nombre, correo y contraseña, `crearCuenta()` y un enlace para volver a "Entrar" (`router.back()` o `router.replace("/entrar")`)
- [x] T048 [movil] Crear `src/app/(tabs)/_layout.tsx` (`Tabs` con "Inicio" y "Cuenta", colores de `useColores()`) y `src/app/(tabs)/index.tsx`: "Hola, {nombre}" y que el catálogo llega pronto, con el comentario de que es provisional hasta F02
- [x] T049 [movil] Crear `src/app/(tabs)/cuenta.tsx`: nombre, correo y botón "Cerrar sesión" → `cerrarSesion()`
- [x] T050 [movil] Reescribir `src/app/_layout.tsx`:
  - `SesionProvider`;
  - `SplashScreen.preventAutoHideAsync()` y `hideAsync()` cuando el estado deja `cargando`;
  - `Stack` con `<Stack.Protected guard={conSesion} redirectTo="/entrar">` para `(tabs)` y `<Stack.Protected guard={!conSesion} redirectTo="/">` para `(auth)` (SDK 58), siguiendo la guía de autenticación de expo-router.

  En el mismo commit, borrar la demo: `src/app/index.tsx`, `src/app/inicio.tsx`, `src/app/curso/[id].tsx`, `src/datos/cursos.ts`, `src/tipos/tipos.ts`, `src/componentes/TarjetaCurso.tsx` y `src/componentes/FilaLeccion.tsx`
- [x] T051 [movil] `npm run tipos` y `npm run lint` sin errores

**Punto de control**: con el backend corriendo y Expo Go, la sección "Móvil" de cada tabla de quickstart.md funciona.

---

## Fase 5: Cierre

- [x] T052 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`: **Usuario** (tabla `user`) y **Sesion** (tabla `session`) en "Entidades definidas", con una nota sobre `account` y `verification` y la excepción de nombres en inglés; quitar Usuario de "Entidades previstas"
- [x] T053 [specs] Integrar a `specs/01-navegacion.md`:
  - web: `/entrar`, `/registro`, que todas las demás rutas exigen sesión, y el menú de la cuenta;
  - móvil: `(auth)/entrar`, `(auth)/registro`, `(tabs)/index` (inicio provisional) y `(tabs)/cuenta` (nueva);
  - en "Qué viaja", `state.desde` hacia `/entrar` en la web.
- [x] T054 [P] [specs] Registrar en `docs/estilo-codigo.md` (sección Backend) la excepción: las tablas y columnas de Better Auth (`user`, `session`, `account`, `verification`) van en inglés, y es el único caso
- [x] T055 [specs] `npm run contrato:revisar`: todas las copias coinciden con la oficial (0.2.0)
- [x] T056 [specs] Revisar que `spec.md` coincide con lo que se construyó; si algo cambió, actualizarla en el mismo PR

---

## Fase 6: Validación manual

Pasos de cada criterio en [quickstart.md](./quickstart.md). Al marcar uno aquí,
se marca también en spec.md.

- [ ] V01 [web] Dado que no hay sesión, cuando abro `/` o cualquier otra dirección de Brote que no sea "Entrar" ni "Crear cuenta", entonces veo "Entrar".
- [ ] V02 [móvil] Dado que no hay sesión, cuando abro la app, entonces veo "Entrar" y no puedo llegar a ninguna otra pantalla salvo "Crear cuenta".
- [ ] V03 [web, móvil] Desde "Entrar" puedo ir a "Crear cuenta" y desde "Crear cuenta" puedo volver a "Entrar".
- [ ] V04 [web, móvil] Con nombre, correo y contraseña válidos, al pulsar "Crear cuenta" llego al inicio con la sesión iniciada.
- [ ] V05 [web, móvil] Con todos los campos vacíos, al pulsar "Crear cuenta" veo "Escribe tu nombre.", "Escribe tu correo." y "Escribe una contraseña.", cada uno junto a su campo.
- [ ] V06 [web, móvil] Un nombre de solo espacios muestra "Escribe tu nombre.".
- [ ] V07 [web, móvil] Un nombre de 50 caracteres con espacios al inicio y al final se acepta y se guarda sin esos espacios; uno de 51 caracteres muestra "El nombre puede tener hasta 50 caracteres.".
- [ ] V08 [web, móvil] Puedo crear una cuenta con un nombre que ya usa otra cuenta.
- [ ] V09 [web, móvil] `ana@correo` y `ana correo@x.com` muestran "Escribe un correo válido.".
- [ ] V10 [web, móvil] Si ya existe `ana@correo.com`, crear una cuenta con ` ANA@Correo.com ` muestra "Ya existe una cuenta con ese correo." junto al correo y conserva lo capturado.
- [ ] V11 [web, móvil] Una contraseña de 7 caracteres muestra "La contraseña debe tener al menos 8 caracteres."; una de 8 se acepta; una de 129 muestra "La contraseña puede tener hasta 128 caracteres.".
- [ ] V12 [web, móvil] El botón "Mostrar" / "Ocultar" muestra y oculta la contraseña sin borrar lo escrito; no hay campo para repetir la contraseña.
- [ ] V13 [web, móvil] Corregir un campo con error quita su mensaje.
- [ ] V14 [backend] Enviar al servidor, sin pasar por el cliente, un nombre vacío, un correo inválido o una contraseña de 7 caracteres se rechaza con el mismo mensaje que da el cliente y no crea la cuenta.
- [ ] V15 [web, móvil] Con el correo y la contraseña de una cuenta existente, escribiendo el correo con mayúsculas y espacios alrededor, entro y llego al inicio.
- [ ] V16 [web, móvil] Con un correo que no existe veo "Correo o contraseña incorrectos."; con un correo existente y otra contraseña veo exactamente el mismo mensaje.
- [ ] V17 [web] Dado que no hay sesión, cuando abro una dirección protegida (p. ej. `/glosario`) y entro, entonces llego a esa misma dirección.
- [ ] V18 [móvil] Después de entrar llego al inicio.
- [ ] V19 [web, móvil] Con sesión iniciada, abrir "Entrar" o "Crear cuenta" me lleva al inicio.
- [ ] V20 [web, móvil] Mientras se envía el formulario, el botón está deshabilitado; pulsarlo varias veces seguidas (o pulsar Enter) crea una sola cuenta o hace un solo intento de entrar.
- [ ] V21 [web, móvil] Con el servidor apagado, al enviar veo "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y lo capturado sigue en los campos, incluida la contraseña.
- [ ] V22 [móvil] En modo avión, al enviar veo "Sin conexión. Revisa tu conexión e inténtalo de nuevo." y lo capturado sigue en los campos.
- [ ] V23 [web, móvil] Al abrir Brote con una sesión guardada no se ve "Entrar" ni por un instante.
- [ ] V24 [web] Con el servidor apagado, al recargar Brote veo "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y "Reintentar"; al encender el servidor y pulsar "Reintentar" veo la pantalla que corresponde.
- [ ] V25 [móvil] Con una sesión iniciada, en modo avión cierro y abro la app y entro al inicio con mi nombre.
- [ ] V26 [web] Después de entrar, cierro el navegador por completo, lo vuelvo a abrir y sigo con sesión.
- [ ] V27 [móvil] Después de entrar, cierro la app por completo (no solo la mando al fondo), la vuelvo a abrir y sigo con sesión.
- [ ] V28 [web, móvil] Con la misma cuenta puedo tener sesión en la web y en el móvil al mismo tiempo.
- [ ] V29 [web] Con sesión, la barra superior muestra mi nombre y abre un menú con "Cerrar sesión".
- [ ] V30 [móvil] Con sesión, la pestaña "Cuenta" muestra mi nombre, mi correo y "Cerrar sesión".
- [ ] V31 [web, móvil] Al pulsar "Cerrar sesión" llego a "Entrar"; al volver atrás o recargar no recupero la sesión; en el otro dispositivo sigo con sesión.
- [ ] V32 [web, móvil] Dado que la sesión del dispositivo expiró, cuando hago cualquier acción que necesita al servidor, entonces llego a "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar.".
- [ ] V33 [web] Después de entrar tras una sesión expirada, regreso a la página donde estaba.

---

## Dependencias

- **Fase 1** va antes que todo. T001 → T005 (hay que editar el contrato antes de copiarlo); T002, T003 y T004 son decisiones del usuario sobre ramas.
- **Backend** (fase 2): T006 → T007 → T008 → T009 → T010. T011 y T013 en paralelo desde el inicio. T012 necesita T010 y T011. T014 necesita T010, T011 y T013. T015, T016 y T017 necesitan T012 y T014, y se hacen en orden porque los tres editan `src/rutas/index.ts`.
- **Web** (fase 3), después de que el backend pase su punto de control:
  - T020 → T023 → T024;
  - T021, T022 y T025 a T029 en paralelo;
  - T030 necesita T024 y T029; T031 y T032 necesitan T024 a T028; T033 necesita T030 a T032; T034 y T035 necesitan T024.
- **Móvil** (fase 4), en paralelo con la web:
  - T037 → T038 → T039 → T041 → T042;
  - T040 y T043 a T045 en paralelo;
  - T046 a T049 necesitan T042 a T045; T050 va al final de la fase.
- **Cierre y validación** al final. V14 se puede validar en cuanto termina el backend.

## Paralelo, por ejemplo

```text
Backend:  T011 (errores) ‖ T013 (validación)         mientras T006→T010 avanzan
Web:      T021 ‖ T022 ‖ T025 ‖ T026 ‖ T027 ‖ T028 ‖ T029
Móvil:    T040 ‖ T043 ‖ T044 ‖ T045
Repos:    fase 3 (web) ‖ fase 4 (móvil)
```

## Estrategia

1. Backend completo y probado con curl (punto de control de la fase 2): ya
   cubre V14 y deja la API estable para los dos clientes.
2. Web, luego móvil (o en paralelo). Cada cliente termina con su punto de
   control.
3. Cierre de documentos y validación manual completa (V01 a V33) antes de los
   PR a `dev` de cada repo, con la spec enlazada y los criterios cubiertos.
