# API: F01 Crear cuenta e iniciar sesión

**Plan**: [plan.md](../plan.md) · Tipos: [contrato.md](./contrato.md)

Base en desarrollo: `http://localhost:3000`. Cuerpos en JSON.

## Convenciones que estrena F01

### Formato de error (para toda la API)

Todo error responde `RespuestaError`:

```json
{ "error": "Revisa los datos marcados.", "campos": { "correo": "Escribe un correo válido." } }
```

- `error`: mensaje general en español, siempre presente.
- `campos`: solo en errores de formulario. Lleva un mensaje por campo con
  error, con el nombre del campo del cuerpo (`nombre`, `correo`,
  `contrasena`). Si hay varios campos con error, vienen todos a la vez.

El manejador central ya existente (`middleware/errores.ts`) responde así;
`ErrorApi` recibe `campos` opcional. Un cuerpo que no es JSON válido responde
`400 { "error": "El cuerpo de la petición no es JSON válido." }` (antes era un
500).

### Cómo viaja la sesión

| Cliente | Petición | Respuesta que inicia sesión |
|---|---|---|
| Web | Cookie de sesión (el navegador la manda con `credentials: "include"`) | `Set-Cookie` (`httpOnly`, `SameSite=Lax`, `Max-Age` = 30 días) |
| Móvil | Cabeceras `X-Cliente: movil` y `Authorization: Bearer <token>` | Cabecera `set-auth-token: <token>`; **nunca** `Set-Cookie` |

- Con `X-Cliente: movil`, el backend ignora la cabecera `Cookie`.
- Toda ruta que valida la sesión puede renovarla (ver research.md, punto 3).
  En la web la renovación llega como `Set-Cookie` en cualquier respuesta; en
  el móvil el token no cambia.

### Sesión requerida

Las rutas marcadas "Con sesión" responden, si no hay sesión válida (no hay,
venció o se cerró):

```http
401
{ "error": "Tu sesión terminó. Vuelve a entrar." }
```

---

## POST /cuentas: crear cuenta

**Quién**: cualquiera. **Cuerpo**: `CuerpoCrearCuenta`

```json
{ "nombre": "  Ana López ", "correo": " Ana@Correo.com", "contrasena": "secreta123" }
```

**Proceso**: valida con las reglas de [data-model.md](../data-model.md), crea
el usuario con el nombre recortado y el correo normalizado, e inicia sesión
(como `POST /sesiones`).

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 201 | `RespuestaUsuario` + cabecera de sesión | Cuenta creada y sesión iniciada |
| 400 | `RespuestaError` con `campos` | Uno o más campos inválidos; no se crea nada |
| 409 | `{ "error": "Ya existe una cuenta con ese correo.", "campos": { "correo": "Ya existe una cuenta con ese correo." } }` | El correo normalizado ya existe |
| 500 | `{ "error": "Error interno del servidor" }` | Fallo inesperado |

```json
{ "usuario": { "id": "k3x...", "nombre": "Ana López", "correo": "ana@correo.com", "creadoEn": "2026-10-20T18:30:00.000Z" } }
```

Ejemplo de 400 con todos los campos vacíos:

```json
{
  "error": "Revisa los datos marcados.",
  "campos": {
    "nombre": "Escribe tu nombre.",
    "correo": "Escribe tu correo.",
    "contrasena": "Escribe una contraseña."
  }
}
```

Un campo que falta o no es texto cuenta como vacío.

## POST /sesiones: entrar

**Quién**: cualquiera. **Cuerpo**: `CuerpoEntrar`

```json
{ "correo": " ANA@correo.com ", "contrasena": "secreta123" }
```

**Proceso**: valida que `correo` no esté vacío y cumpla `PATRON_CORREO`, y que
`contrasena` no esté vacía (sin revisar su longitud). Normaliza el correo y
comprueba las credenciales.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaUsuario` + cabecera de sesión | Credenciales correctas |
| 400 | `RespuestaError` con `campos` (`correo`, `contrasena`: "Escribe tu contraseña.") | Campos vacíos o correo con mal formato |
| 401 | `{ "error": "Correo o contraseña incorrectos." }` (sin `campos`) | El correo no existe **o** la contraseña no coincide: mismo estado y cuerpo |
| 500 | `{ "error": "Error interno del servidor" }` | Fallo inesperado |

No hay límite de intentos (fuera de alcance en la spec).

## DELETE /sesiones/actual: cerrar sesión

**Quién**: cualquiera. Con sesión, la cierra; sin sesión no hace nada
(idempotente, para poder reintentar un cierre pendiente).

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 204 | (vacío) | Siempre que no haya fallo inesperado. En la web incluye `Set-Cookie` que borra la cookie |
| 500 | `{ "error": "Error interno del servidor" }` | Fallo inesperado |

Solo afecta a la sesión de esa petición; las de otros dispositivos siguen.

## GET /usuarios/yo: quién soy

**Quién**: con sesión. Los clientes la usan al arrancar para saber si la
sesión sigue viva y traer el usuario.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaUsuario` | Sesión válida (puede traer la renovación) |
| 401 | `{ "error": "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión, vencida o cerrada |

---

## CORS

Sin cambios: `ORIGENES_PERMITIDOS` con credenciales. `set-auth-token` **no**
se agrega a `Access-Control-Expose-Headers`, y además el backend nunca lo
manda sin `X-Cliente: movil`.
