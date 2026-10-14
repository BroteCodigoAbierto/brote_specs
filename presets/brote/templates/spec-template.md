# [ID]: [Nombre de la feature]

**Estado**: Borrador
**Creada**: [FECHA]
**Repos afectados**: [backend | web | móvil]
**Rama**: `feature/[ID]-[nombre-corto]` (en cada repo afectado)
**Descripción original**: "$ARGUMENTS"

<!--
  Esta spec dice QUÉ debe pasar, no CÓMO. Nada de librerías, tablas ni
  endpoints aquí: eso va en plan.md.
  Regla: otra persona debe poder implementarla sin preguntar qué quisimos decir.
-->

## Objetivo

[Una o dos frases: qué permite hacer esta feature y por qué importa.]

## Actor

[Quién la usa: Visitante (sin cuenta), Alumno, Autor, Administrador.]

## Precondiciones

- [Qué debe ser cierto antes de empezar. Si una precondición puede no
  cumplirse, se maneja en "Casos de error".]

## Datos de entrada

<!-- Cada dato con tipo, si es obligatorio y sus límites. -->

- [nombre]: [tipo], [obligatorio | opcional], [límites, p. ej. "máximo 100 caracteres"].

## Flujo principal

1. [El usuario ...]
2. [El sistema ...]

## Validaciones

- [Regla verificable, p. ej. "Un título formado solo por espacios cuenta como vacío".]

## Estados de la pantalla

<!-- Por cada pantalla involucrada, y por plataforma si difieren (web / móvil). -->

- Cargando: [...]
- Con datos: [...]
- Vacío: [...]
- Error: [...]
- Sin conexión: [...]

## Resultado esperado

[Qué queda distinto en el sistema cuando el flujo termina bien, y dónde se
comprueba (p. ej. "sigue ahí después de cerrar y abrir la app").]

## Casos de error

- [Situación]: [qué ve el usuario y qué pasa con lo que ya capturó].

## Fuera de alcance

<!-- Lo que esta feature NO hace, con el ID de la feature que sí lo hará, si existe. -->

- [...]

## Criterios de aceptación

<!--
  Cada criterio se marca como cumplido o no cumplido sin discusión.
  Se validan a mano: indica en qué plataforma se prueba cada uno.
  Opcional: formato Dado / Cuando / Entonces.
-->

- [ ] [web] [...]
- [ ] [móvil] [...]
- [ ] [web, móvil] [...]

## Datos que toca

<!-- Entidades involucradas, sin detalles de implementación. Se integran a specs/02-modelo-datos.md. -->

- **[Entidad]**: [qué representa y qué atributos importan aquí].

## Supuestos

- [Decisiones razonables que se tomaron porque la descripción no lo decía.]
