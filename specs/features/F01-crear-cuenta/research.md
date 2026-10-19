# Investigación: F01 Crear cuenta e iniciar sesión

**Fecha**: 2026-10-19 · **Plan**: [plan.md](./plan.md)

Solo cubre lo nuevo de esta feature. El stack, `pedir()` + hooks, Context +
useReducer y el contrato por copia ya están decididos en `docs/decisiones/`.

Versiones consultadas (npm, 2026-10-19): `better-auth` 1.7.11,
`@prisma/client` y `@prisma/adapter-pg` 7.10.1. En el móvil las versiones las
elige `npx expo install` para el SDK 57.

## 1. Cómo se integra Better Auth con Express

- **Decisión**: el backend **no monta** el handler de Better Auth
  (`/api/auth/*`). Expone rutas propias (`POST /cuentas`, `POST /sesiones`,
  `DELETE /sesiones/actual`, `GET /usuarios/yo`) que validan con las reglas y
  mensajes de la spec y luego llaman a Better Auth desde el servidor con
  `auth.api.signUpEmail`, `auth.api.signInEmail`, `auth.api.signOut` y
  `auth.api.getSession`, usando `returnHeaders: true` para recibir las
  cabeceras de sesión y reenviarlas.
- **Por qué**: lo eligió el usuario el 2026-10-19. Si se monta el handler, sus
  rutas aceptarían un nombre de 60 caracteres o un correo con espacios, y el
  backend dejaría de ser la autoridad (principio III). Además, los mensajes
  salen en español y con el formato de error de Brote, y los clientes siguen
  usando solo `pedir()` (decisión 0010).
- **Alternativas descartadas**: montar `toNodeHandler(auth)` y usar
  `better-auth/react` y `@better-auth/expo` en los clientes. Es menos código
  propio, pero agrega un segundo camino a la red y hooks propios de la
  librería junto al Context.
- **Consecuencia**: como no se monta el handler, `express.json()` puede seguir
  antes de las rutas (la documentación pide montar el handler antes del body
  parser, pero aquí no aplica).

Fuentes: <https://www.better-auth.com/docs/concepts/api>,
<https://www.better-auth.com/docs/integrations/express>.

## 2. Cómo viaja la sesión en cada cliente

- **Decisión**:
  - **Web**: cookie de sesión `httpOnly` que pone Better Auth. `pedir()` ya
    manda `credentials: "include"`. En desarrollo la web (`localhost:5173`) y
    la API (`localhost:3000`) son el mismo *site* (el puerto no cuenta), así
    que una cookie `SameSite=Lax` sí viaja.
  - **Móvil**: token Bearer con el plugin `bearer()` de Better Auth. El móvil
    manda la cabecera `X-Cliente: movil` en todas sus peticiones. Para esas
    peticiones el backend reenvía solo `set-auth-token` (nunca `Set-Cookie`)
    y, al validar la sesión, ignora la cabecera `Cookie`. El token se guarda
    en `expo-secure-store` con la clave `sesion.token` y se manda como
    `Authorization: Bearer <token>`.
- **Por qué**: React Native guarda cookies en un almacén nativo que no
  controlamos. Si el móvil recibiera `Set-Cookie`, al cerrar sesión sin
  conexión el token se borraría pero la cookie nativa seguiría abriendo la
  sesión. Con `X-Cliente` hay un solo mecanismo por cliente.
- **Alternativas descartadas**: mandar el token en el cuerpo de la respuesta.
  La web lo recibiría también, y esconder el token de JavaScript es el sentido
  de la cookie `httpOnly`.
- **A verificar al implementar**: que `auth.api.signInEmail({ returnHeaders:
  true })` traiga `set-auth-token` (lo agrega el hook *after* del plugin). Si
  no lo trae, el token es el valor firmado de la cookie
  `better-auth.session_token` del mismo `Set-Cookie`, que es lo que el plugin
  copia.

Fuente: <https://www.better-auth.com/docs/plugins/bearer>.

## 3. Duración de la sesión (30 días sin uso)

- **Decisión**: `session.expiresIn = 30 días` y `session.updateAge = 1 día`.
  Cada vez que una petición valida la sesión y pasó más de un día desde la
  última renovación, Better Auth mueve `expiresAt` a ahora + 30 días.
  `cookieCache` queda apagado (es el valor por defecto) para que cerrar sesión
  y expirar se noten de inmediato.
- **Detalle**: la renovación en la web cambia la cookie. El middleware
  `requerirSesion` llama a `getSession` con `returnHeaders: true` y reenvía su
  `Set-Cookie`; si no, la cookie del navegador vencería a los 30 días de
  entrar aunque la sesión en la base siguiera viva.

Fuente: <https://www.better-auth.com/docs/concepts/session-management>.

## 4. Contraseñas

- **Decisión**: hash con scrypt, lo que Better Auth trae por defecto. La
  contraseña vive en la tabla `account` (proveedor `credential`) y nunca sale
  del servidor.
- **Longitud**: Better Auth mide con `password.length` (unidades UTF-16) y la
  spec cuenta caracteres Unicode. Para que manden las reglas de la spec, la
  ruta valida 8 a 128 caracteres Unicode y Better Auth queda con
  `minPasswordLength: 8` (nunca rechaza algo que la ruta aceptó, porque UTF-16
  ≥ caracteres) y `maxPasswordLength: 512` (red de seguridad contra cuerpos
  enormes).

Fuente: <https://www.better-auth.com/docs/authentication/email-password>.

## 5. Validación y mensajes iguales en los tres repos

- **Decisión**: los límites (`LIMITES_CUENTA`), el patrón de correo
  (`PATRON_CORREO`) y los mensajes (`MENSAJES_CUENTA`) se agregan como
  constantes al contrato. Cada repo escribe su propia función de validación
  (el contrato no lleva lógica) usando esas constantes.
- **Contar caracteres**: `Array.from(texto).length` (puntos de código). Se
  descartó `Intl.Segmenter` porque no hay certeza de que Hermes lo soporte en
  el SDK 57; con puntos de código, cliente y servidor cuentan igual en los
  tres entornos. La spec ya lo dice en "Supuestos".
- **Correo**: `PATRON_CORREO = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/` cubre la
  regla de la spec (una sola `@`, algo antes, dominio con al menos un punto
  que no está al inicio ni al final, sin espacios). Better Auth valida el
  correo otra vez con su propio esquema, más estricto. Si lo rechaza (400), la
  ruta responde el mismo "Escribe un correo válido." en el campo `correo`.
- **Correo repetido**: el servicio busca el correo antes de crear la cuenta
  y responde 409. Si dos registros llegan a la vez, Better Auth responde 422
  y se traduce al mismo 409.

## 6. Límite de intentos

- **Decisión**: `rateLimit: { enabled: false }`.
- **Por qué**: la spec deja el límite de intentos fuera del MVP. Better Auth
  lo enciende solo en producción, así que sin apagarlo explícitamente la app
  se comportaría distinto en desarrollo y en producción.

## 7. Prisma 7 con PostgreSQL

- **Decisión**: el cliente generado (`src/generado/prisma`) se crea con el
  driver adapter `PrismaPg` en `src/config/bd.ts`:
  `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`.
  Dependencias: `@prisma/client` (runtime del cliente generado) y
  `@prisma/adapter-pg`.
- Better Auth recibe ese cliente con `prismaAdapter(bd, { provider:
  "postgresql" })` y acepta Prisma 7 (`peerDependencies` de la 1.7).

Fuente: <https://www.prisma.io/docs/orm/overview/databases/postgresql>.

## 8. Tablas de Better Auth

- **Decisión**: los modelos `User`, `Session`, `Account` y `Verification` se
  quedan con los nombres de Better Auth: tablas `user`, `session`, `account`
  y `verification`, columnas en inglés. Lo eligió el usuario el 2026-10-19
  como **único caso en inglés** del proyecto (ver "Excepciones" del plan).
  Desde F02, las tablas propias se relacionan con `user.id`.
- `verification` no se usa en F01, pero Better Auth exige las cuatro tablas.
- El esquema se escribe a mano a partir del de Better Auth 1.7. Para
  revisarlo se puede generar una vez con `npx @better-auth/cli@1.7 generate`
  y comparar, sin agregar la CLI como dependencia.
- El contrato no expone estas tablas: el servicio traduce `user` →
  `Usuario` (`name` → `nombre`, `email` → `correo`, `createdAt` → `creadoEn`),
  como pide la decisión 0006.

Fuente: <https://www.better-auth.com/docs/concepts/database>.

## 9. Móvil: rutas protegidas, almacenamiento y red

- **Rutas**: `Stack.Protected` de expo-router, con `guard` según el estado
  del `SesionContext`. Si el guard pasa a `false`, expo-router manda a la
  primera pantalla disponible y borra el historial de las protegidas. Eso hace
  "Cerrar sesión" y "sesión expirada" sin navegar a mano. `redirectTo` es del
  SDK 58; en el 57 el orden de las pantallas decide a dónde se llega. Hay que
  seguir la guía de autenticación de la versión 57.
- **Splash**: la pantalla de arranque (`expo-splash-screen`, ya instalado) se
  mantiene hasta que el contexto deja el estado `cargando`. Ese es el
  "Cargando" de la spec y evita que "Entrar" se vea un instante.
- **Almacenamiento**: `expo-secure-store` guarda `sesion.token` y
  `sesion.usuario` (el `Usuario` en JSON, para entrar sin conexión con el
  nombre a la vista). Se descartó AsyncStorage porque no cifra y también sería
  una dependencia nueva.
- **Sin conexión vs. servidor caído**: cuando `fetch` falla, `pedir()`
  consulta `Network.getNetworkStateAsync()` de `expo-network` (incluido en
  Expo Go). Si `isConnected` o `isInternetReachable` es `false`, el error es
  "sin conexión"; si no, "servidor caído". Se descartó
  `@react-native-community/netinfo` porque no es del SDK de Expo, y tratar
  todo fallo como "sin conexión" contradice la spec.

Fuentes: <https://docs.expo.dev/router/advanced/protected/>,
<https://docs.expo.dev/router/advanced/authentication/>,
<https://docs.expo.dev/versions/latest/sdk/network/>.

## 10. Web: aviso de sesión terminada y cerrar sesión sin servidor

- **Aviso al abrir**: cuando la sesión vence, el navegador ya borró la cookie
  (su vida es la misma), así que al abrir la web no se distingue "expiró" de
  "nunca entró". Se guarda `sesion.activa = "1"` en `localStorage` al entrar
  y se borra al cerrar sesión. Si al arrancar `GET /usuarios/yo` responde 401
  y la marca existe, se muestra "Tu sesión terminó. Vuelve a entrar.". El
  móvil lo sabe porque tiene un token que el servidor rechaza.
- **Durante el uso**: `pedir()` avisa al `SesionContext` cuando una petición
  responde 401, salvo `POST /sesiones`, donde 401 significa credenciales
  incorrectas.
- **Cerrar sesión con el servidor caído**: la cookie es `httpOnly` y
  JavaScript no puede borrarla. Se guarda `sesion.cierrePendiente = "1"`, el
  contexto pasa a "sin sesión" y, al siguiente arranque, antes de nada se
  reintenta `DELETE /sesiones/actual`. Así se cumple que "el dispositivo queda
  sin sesión de todos modos".
- **Volver a la página**: la ruta protegida manda a `/entrar` con
  `state: { desde }` (la ubicación que se intentaba abrir). Se descartó
  `?volver=` en la URL: haría falta validar que no apunte a otro sitio y no
  aporta nada.
