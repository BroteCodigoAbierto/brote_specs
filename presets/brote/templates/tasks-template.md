---
description: "Lista de tareas de una feature de Brote"
---

# Tareas: [ID] [Nombre de la feature]

**Entrada**: spec.md, plan.md, data-model.md, contracts/
**Rama**: `feature/[ID]-[nombre-corto]`, creada desde `dev` en cada repo afectado

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase).

<!--
  ============================================================================
  Las tareas de abajo son EJEMPLOS. /speckit-tasks las reemplaza por las
  reales a partir de spec.md y plan.md. Borra las fases de los repos que la
  feature no toca.
  ============================================================================
-->

## Fase 1: Preparación

- [ ] T001 [specs] Si cambia el contrato: actualizar `contrato/*.ts` y subir `contrato/VERSION`
- [ ] T002 [back] Crear la rama `feature/[ID]-[nombre-corto]` desde `dev`
- [ ] T003 [P] [web] Crear la rama `feature/[ID]-[nombre-corto]` desde `dev`
- [ ] T004 [P] [movil] Crear la rama `feature/[ID]-[nombre-corto]` desde `dev`
- [ ] T005 [specs] Copiar el contrato a los repos afectados: `npm run contrato:copiar` en brote_specs

---

## Fase 2: Backend (brote_backend_express)

- [ ] T006 [back] Modelo en `prisma/schema.prisma` y migración `npx prisma migrate dev --name [id]-[...]`
- [ ] T007 [back] Servicio en `src/servicios/[...].ts`
- [ ] T008 [back] Ruta en `src/rutas/[...].ts` con validación de entrada

**Punto de control**: los endpoints responden como dice `contracts/` (probar con curl).

---

## Fase 3: Web (brote_web_react)

- [ ] T009 [web] Funciones de API en `src/servicios/[...].ts`
- [ ] T010 [web] Página en `src/paginas/[...]/[...].tsx` con sus estados (cargando, vacío, error)
- [ ] T011 [web] Ruta en `src/rutas.tsx`

---

## Fase 4: Móvil (brote_mobile_expo)

- [ ] T012 [P] [movil] Funciones de API en `src/servicios/[...].ts`
- [ ] T013 [movil] Pantalla en `src/app/[...].tsx` con sus estados (cargando, vacío, error, sin conexión)

---

## Fase 5: Cierre

- [ ] T014 [specs] Integrar `data-model.md` a `specs/02-modelo-datos.md`
- [ ] T015 [specs] Integrar los cambios de pantallas a `specs/01-navegacion.md`
- [ ] T016 [specs] `npm run contrato:revisar`: todas las copias coinciden con la oficial
- [ ] T017 [specs] Revisar que `spec.md` coincide con lo que se construyó; si algo cambió, actualizarla

---

## Fase 6: Validación manual

<!--
  Una tarea por criterio de aceptación de spec.md, copiado tal cual, con la
  plataforma donde se prueba. La feature se cierra cuando todas están marcadas
  (y también se marcan en spec.md).
-->

- [ ] V01 [web] [criterio 1 de spec.md]
- [ ] V02 [movil] [criterio 2 de spec.md]

---

## Dependencias

- La fase 1 va antes que todo.
- El backend va antes que web y móvil (los clientes consumen sus endpoints).
- Web y móvil pueden ir en paralelo.
- Cierre y validación al final.
