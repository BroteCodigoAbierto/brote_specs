# Checklist de calidad de la spec: F08 Insignias por curso completado

**Propósito**: validar que la spec está completa antes de `/speckit-plan`
**Creada**: 2026-11-22
**Feature**: [spec.md](../spec.md)

## Una spec está completa cuando (curso de SDD)

- [x] Tiene objetivo, actor y precondiciones.
- [x] Los datos de entrada indican tipo y si son obligatorios.
- [x] Incluye estados de la pantalla y casos de error.
- [x] Dice explícitamente qué queda fuera de alcance.
- [x] Cada criterio de aceptación puede marcarse como cumplido o no cumplido sin discusión.
- [x] No menciona librerías, tablas ni endpoints.

## Calidad del contenido

- [x] Sin detalles de implementación (lenguajes, frameworks, APIs)
- [x] Centrada en el valor para el alumno y el autor
- [x] Escrita para alguien que no programa
- [x] Todas las secciones obligatorias completas

## Requisitos completos

- [x] No quedan marcas [POR ACLARAR]
- [x] Las reglas se pueden probar y no son ambiguas
- [x] Los criterios de aceptación se verifican a mano, con la plataforma indicada
- [x] Los criterios no dependen de la tecnología
- [x] Flujos principales cubiertos (autor activa, alumno gana, alumno ve sus insignias)
- [x] Casos de error y estados identificados
- [x] Alcance delimitado (fuera de alcance explícito)
- [x] Dependencias (F03, F04, F05, F06, F13) y supuestos identificados

## Lista para el plan

- [x] Cada regla tiene un criterio de aceptación
- [x] Las decisiones del usuario están reflejadas: la insignia ganada se queda; solo
  dan insignia los cursos con la opción activada; la opción viene apagada; aviso al
  ganarla y lista "Mis insignias"; portada del curso en círculo con medalla

## Notas

- La spec respeta que un curso en revisión o publicado no se edita (F06): la opción
  solo cambia en un borrador.
- Eliminar un curso borra sus insignias, igual que el progreso (F04). Es la única
  forma de perder una insignia ganada.
