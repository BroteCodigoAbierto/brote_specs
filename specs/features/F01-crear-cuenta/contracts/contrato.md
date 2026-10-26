# Cambios al contrato: F01

**Versión**: `contrato/VERSION` pasa de `0.1.0` a `0.2.0` (menor: tipos y
constantes nuevos, nada se quita).

Se agrega a `contrato/contrato.ts` (en lugar del `export {};` actual):

```ts
// ---------------------------------------------------------------------------
// Errores (F01): forma de toda respuesta de error de la API.
// ---------------------------------------------------------------------------

export type RespuestaError = {
  error: string;
  // solo en errores de formulario: nombre del campo del cuerpo → mensaje
  campos?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// Cuentas y sesión (F01)
// ---------------------------------------------------------------------------

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  creadoEn: string; // ISO 8601
};

export type RespuestaUsuario = {
  usuario: Usuario;
};

export type CuerpoCrearCuenta = {
  nombre: string;
  correo: string;
  contrasena: string;
};

export type CuerpoEntrar = {
  correo: string;
  contrasena: string;
};

// El móvil manda esta cabecera para recibir la sesión como token
// (cabecera `set-auth-token`) y no como cookie.
export const CABECERA_CLIENTE = { nombre: "X-Cliente", movil: "movil" } as const;
export const CABECERA_TOKEN = "set-auth-token";

// Longitudes en caracteres Unicode: Array.from(texto).length
export const LIMITES_CUENTA = {
  nombreMax: 50,
  correoMax: 254,
  contrasenaMin: 8,
  contrasenaMax: 128,
} as const;

// Una sola @, algo antes, dominio con al menos un punto que no está al inicio
// ni al final, sin espacios. Se aplica al correo ya recortado.
export const PATRON_CORREO = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const MENSAJES_CUENTA = {
  datosInvalidos: "Revisa los datos marcados.",
  nombreVacio: "Escribe tu nombre.",
  nombreLargo: "El nombre puede tener hasta 50 caracteres.",
  correoVacio: "Escribe tu correo.",
  correoInvalido: "Escribe un correo válido.",
  correoRepetido: "Ya existe una cuenta con ese correo.",
  contrasenaVacia: "Escribe una contraseña.",
  contrasenaVaciaEntrar: "Escribe tu contraseña.",
  contrasenaCorta: "La contraseña debe tener al menos 8 caracteres.",
  contrasenaLarga: "La contraseña puede tener hasta 128 caracteres.",
  credencialesIncorrectas: "Correo o contraseña incorrectos.",
  sesionTerminada: "Tu sesión terminó. Vuelve a entrar.",
} as const;
```

Los mensajes que dependen de la red ("No se pudo conectar con Brote...",
"Sin conexión...") no viajan por la API: viven en cada cliente.

Después de editar: `npm run contrato:copiar` y `npm run contrato:revisar`
desde `brote_specs`.
