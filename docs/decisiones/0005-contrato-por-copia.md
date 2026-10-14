# 0005. Contrato compartido por copia

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Contexto

Backend, web y móvil necesitan los mismos tipos: curso, lección, cada tipo de
actividad, respuestas y errores de la API.

## Decisión

- La copia **oficial** vive en `brote_specs/contrato/`, con su versión en
  `contrato/VERSION`.
- Cada repo tiene `src/tipos/contrato.ts`, que es una copia generada con
  encabezado de versión y advertencia de no editarla.
- `npm run contrato:copiar` escribe las copias y `npm run contrato:revisar`
  verifica que coincidan. Son scripts de Node sin dependencias.

## Alternativas consideradas

- **Paquete compartido (`brote_contrato`) con esquemas Zod**: daría tipos y
  validación en tiempo de ejecución de una sola fuente, a cambio de un repo y
  una dependencia más.
- **OpenAPI con generación de tipos**: estándar, pero agrega herramientas de
  generación en los tres repos.

## Consecuencias

- La validación en tiempo de ejecución (el backend validando lecciones e
  imports) se escribe en el backend, a partir de los tipos.
- El riesgo es que las copias se desincronicen; lo mitiga `contrato:revisar`,
  que es una tarea obligatoria del cierre de cada feature que toca el contrato.
