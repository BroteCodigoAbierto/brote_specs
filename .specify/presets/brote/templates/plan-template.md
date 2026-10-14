# Plan técnico: [ID] [Nombre de la feature]

**Spec**: [spec.md](./spec.md) | **Fecha**: [FECHA] | **Rama**: `feature/[ID]-[nombre-corto]`

<!--
  Aquí sí va el CÓMO. Se llena con /speckit-plan a partir de spec.md,
  la constitución (.specify/memory/constitution.md) y docs/arquitectura.md.
-->

## Resumen

[Qué se construye y el enfoque técnico en 3 a 5 líneas.]

## Revisión contra la constitución

<!-- Un renglón por principio. Si algo no cumple, se justifica en "Excepciones". -->

| Principio | Cumple | Nota |
|---|---|---|
| I. La spec manda | [sí/no] | |
| II. Un producto, cuatro repos | [sí/no] | |
| III. El backend es la autoridad | [sí/no] | |
| IV. Actividades extensibles | [sí/no/no aplica] | |
| V. Estados explícitos | [sí/no] | |
| VI. Dependencias justificadas | [sí/no] | |
| VII. Estilo propio | [sí/no] | |
| VIII. Terminado = validado | [sí/no] | |

## Cambios al contrato

<!--
  Tipos que se agregan o cambian en contrato/ (la copia oficial).
  Si hay cambios, se sube contrato/VERSION y las tareas incluyen copiarlo
  a cada repo afectado.
-->

- [Tipo nuevo o cambiado, o "Sin cambios".]

## Cambios al modelo de datos

<!-- Resumen. El detalle va en data-model.md y al cerrar se integra a specs/02-modelo-datos.md. -->

- [...]

## API

<!-- Endpoints nuevos o cambiados. El detalle (entradas, respuestas, errores) va en contracts/. -->

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| | | | |

## Por repo

<!-- Borra las secciones de los repos que la feature no toca. -->

### brote_backend_express

- **Archivos**: [rutas, servicios, middleware, prisma/schema.prisma ...]
- **Validación de entrada**: [qué se valida y cómo responde si falla]
- **Notas**: [...]

### brote_web_react

- **Páginas y rutas**: [...]
- **Componentes**: [...]
- **Estado**: [contexto o estado local, y por qué]
- **Notas**: [...]

### brote_mobile_expo

- **Pantallas y rutas (expo-router)**: [...]
- **Componentes**: [...]
- **Almacenamiento local**: [si aplica]
- **Notas**: [...]

## Cambios a la navegación

<!-- Pantallas nuevas y cómo se llega a ellas. Al cerrar se integra a specs/01-navegacion.md. -->

- [...]

## Dependencias nuevas

| Paquete | Repo | Para qué | Alternativa descartada |
|---|---|---|---|
| | | | |

## Excepciones a la constitución

<!-- Solo si algún principio no se cumple. -->

| Qué | Por qué hace falta | Por qué no sirve la opción simple |
|---|---|---|
| | | |
