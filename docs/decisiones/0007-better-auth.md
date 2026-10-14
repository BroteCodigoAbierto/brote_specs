# 0007. Autenticación con Better Auth

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Contexto

Las cuentas entran en el MVP: el progreso es por usuario y los cursos tienen
autor. La autenticación debe servir igual para la web y el móvil.

## Decisión

**Better Auth**, una librería open source que corre dentro del backend de
Express, con su adaptador de Prisma y su soporte para Expo. Los usuarios
viven en nuestra base de datos.

## Alternativas consideradas

- **JWT propio** (hash de contraseña, token de acceso y de renovación): todo
  el flujo bajo control, pero hay más código propio sensible a errores de
  seguridad.
- **Servicio externo** (Clerk, Supabase Auth, Firebase Auth): lo más rápido,
  pero los usuarios vivirían con un tercero, cosa rara en un proyecto open
  source autohospedable.

## Consecuencias

- Better Auth define sus propias tablas (`user`, `session`, `account`,
  `verification`). El plan de F01 decide si se renombran a español.
- La configuración exacta para web (cookies) y móvil (almacenamiento seguro)
  se define en el plan de F01, leyendo la documentación de la versión que se
  instale.
