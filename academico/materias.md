# Brote en las materias

> Este documento es **aparte de la arquitectura**. Aquí se registra qué pide
> cada materia y qué parte de Brote lo cubre. Si una rúbrica pide algo que el
> producto no necesita, se anota aquí cómo se cubre (o por qué no), pero no se
> cambia la constitución ni las decisiones de `docs/decisiones/` por eso.

- **Alumno**: Pedro Carlos Balderrama Campos (372267)
- **Docente**: Carlos Laurence Escobar Erunez
- **Organización en GitHub**: https://github.com/BroteCodigoAbierto

## Aplicaciones Móviles

Fuente: "Desarrollo de Aplicaciones Móviles: SDD" (documento del curso, en la
raíz del workspace).

### Lo que pide el curso de SDD y dónde está

| Pide | En Brote | Nota |
|---|---|---|
| `specs/00-project.md` con nombre, problema, usuario, propuesta, MVP con IDs y funcionalidades futuras | `specs/00-proyecto.md` | Nombre en español |
| `specs/01-navigation.md` | `specs/01-navegacion.md` | |
| `specs/02-data-model.md` que crece con cada feature | `specs/02-modelo-datos.md` | |
| Una spec por feature en `specs/features/F01-....md` | `specs/features/F01-.../spec.md` | Spec Kit usa una carpeta por feature (spec, plan, tareas); la spec es `spec.md` |
| Secciones de la spec (Objetivo ... Criterios de aceptación) | Plantilla `presets/brote/templates/spec-template.md` | Mismas secciones, más "Datos que toca" y "Supuestos" |
| Spec → tareas → implementación | `tasks.md` de cada feature | |
| Ramas `feature/F03-...` y commits `F03: ...` | Decisión 0013 | |
| La spec se actualiza en el mismo commit/PR que el código | Constitución, principio I | El PR de `brote_specs` acompaña a los de código |
| Lista "Una spec está completa cuando" | Checklist que genera `/speckit-specify` en `checklists/requisitos.md` | |
| Specs dentro del repositorio para que la IA las lea | Las specs están en `brote_specs` y el `CLAUDE.md` de `brote_mobile_expo` apunta ahí | **Explicar al profesor** que el repo móvil no contiene las specs |
| Entre 4 y 8 features en el MVP | El MVP tiene 15 (F01 a F15) | **Pendiente de decidir** si se presenta como está, se agrupan o se marca un subconjunto como "MVP de la materia" |

### Temas del curso y features que los cubren

| Tema | Feature |
|---|---|
| Navegación | F01, F02, F03 (expo-router) |
| Estado global | F01 (sesión, Context) |
| Formularios | F01 (registro y entrada) |
| APIs | F02, F03, F04 |
| Almacenamiento | F01 (sesión en almacenamiento seguro), F10 (cursos descargados) |
| Sin conexión / red | F10 |
| Audio, micrófono | F03 (actividad escuchar y repetir) |
| Notificaciones | Futura (recordatorios) |
| Cámara, sensores, ubicación | No los necesita el producto. Si la rúbrica los exige, anotarlo aquí y decidir aparte |

## Aplicaciones Web

| Pide | En Brote | Nota |
|---|---|---|
| _Por llenar con la rúbrica de la materia_ | | |

## Cambios respecto a los planes entregados

El "Plan de proyecto final" entregado en ambas materias (30-08-2026) proponía
otro stack. El producto es el mismo; la tecnología cambió:

| Pieza | Plan entregado | Ahora | Decisión |
|---|---|---|---|
| Backend | Spring Boot (Java 25) + Spring Data JPA | Express 5 + TypeScript + Prisma | 0006 |
| Base de datos | PostgreSQL | PostgreSQL | 0006 |
| Web | Vue 3 + Vite + Vue Router + PrimeVue | React + Vite + React Router + CSS Modules | 0008, 0009 |
| Móvil | Expo (React Native), solo cursar | Expo (React Native), solo cursar | 0003 |

Los repos `brote_backend` y `brote_frontend_vue` de la organización son de ese
plan y ya no se usan; conviene archivarlos en GitHub.

## Bitácora de IA

En entregas anteriores se pidió una bitácora de uso de IA. Si se vuelve a
pedir, los insumos son: el historial de commits de cada repo, los `spec.md` y
`plan.md` de cada feature y las decisiones de `docs/decisiones/` (la base del
proyecto se estructuró con Claude Code el 2026-10-14).
