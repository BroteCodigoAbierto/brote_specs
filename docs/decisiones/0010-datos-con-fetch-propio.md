# 0010. Datos de la API con `fetch` propio y hooks

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Decisión

Cada cliente tiene `src/servicios/api.ts` con `pedir()` y `ErrorHttp` (el
patrón del Taller 10), funciones por recurso encima y hooks que exponen
`{ datos, cargando, error, recargar }`.

## Alternativas consideradas

- **TanStack Query**: caché, reintentos y persistencia offline ya resueltos,
  pero es una abstracción grande y se pierde ver cómo funciona.

## Consecuencias

- La caché de cursos descargados y la cola de progreso pendiente del móvil
  sin conexión (F10) se escriben a mano. Es de las features más pesadas del
  MVP; conviene dejarla al final.
