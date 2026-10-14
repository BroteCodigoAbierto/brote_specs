# 0001. SDD con Spec Kit y el formato del curso

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Contexto

El prototipo se programó sin especificar nada y terminó con decisiones
implícitas difíciles de rastrear. Brote se desarrolla con Spec-Driven
Development: primero la spec, después el código.

## Decisión

- Se usa **GitHub Spec Kit** (v1.2.0, MIT) con su integración para Claude Code.
- Su plantilla de spec se reemplaza por el formato del curso de SDD: Objetivo,
  Actor, Precondiciones, Datos de entrada, Flujo principal, Validaciones,
  Estados de la pantalla, Resultado esperado, Casos de error, Fuera de
  alcance, Criterios de aceptación.
- Las features se numeran `F01`, `F02`, ... y viven en `specs/features/`.
- Todo en español.
- Las adaptaciones viven en el preset local `presets/brote/`, que **antepone**
  reglas a los comandos del núcleo en lugar de reemplazarlos.

## Alternativas consideradas

- **Plantilla nativa de Spec Kit** (historias de usuario P1/P2, requisitos
  FR-001): más pensada para equipos grandes; el formato del curso es más
  directo y obliga a pensar en estados y errores.
- **SDD sin herramienta** (solo carpetas de markdown): no da los comandos
  para pasar de spec a plan y tareas.

## Consecuencias

- Al actualizar Spec Kit, las mejoras del núcleo llegan solas; solo hay que
  revisar que el preset siga encajando.
- Las features muy grandes se parten en dos IDs en lugar de priorizar
  historias dentro de una spec.
