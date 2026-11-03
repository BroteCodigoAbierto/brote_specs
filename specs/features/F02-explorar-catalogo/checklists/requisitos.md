# Lista de calidad de la spec: F02 Explorar el catálogo de cursos publicados

**Propósito**: comprobar que la spec está completa y bien escrita antes de pasar a planear.
**Creada**: 2026-10-26
**Feature**: [spec.md](../spec.md)

## Una spec está completa cuando (curso de SDD)

- [x] Tiene objetivo, actor y precondiciones.
- [x] Los datos de entrada indican tipo y si son obligatorios.
- [x] Incluye estados de la pantalla y casos de error.
- [x] Dice explícitamente qué queda fuera de alcance.
- [x] Cada criterio de aceptación puede marcarse como cumplido o no cumplido sin discusión.
- [x] No menciona librerías, tablas ni endpoints.

## Calidad del contenido

- [x] Sin detalles de implementación (lenguajes, frameworks, APIs).
- [x] Centrada en lo que necesita el usuario y en para qué.
- [x] Escrita para alguien que no programa.
- [x] Todas las secciones obligatorias están completas.

## Requisitos completos

- [x] No quedan marcas `[POR ACLARAR]`.
- [x] Los requisitos se pueden probar y no son ambiguos.
- [x] Los criterios de aceptación se pueden verificar a mano.
- [x] Los criterios de aceptación no dependen de la tecnología.
- [x] Todos los escenarios de aceptación están definidos.
- [x] Los casos límite están identificados.
- [x] El alcance está bien delimitado.
- [x] Las dependencias y los supuestos están identificados.

## Lista para planear

- [x] Cada validación y caso de error tiene un criterio de aceptación claro.
- [x] Los flujos cubren ver el catálogo, buscar, ver el detalle de un curso y recargar.
- [x] La feature cumple los resultados esperados de sus criterios de aceptación.
- [x] No se filtran detalles de implementación en la spec.

## Notas

- Aclaraciones resueltas con el usuario el 2026-10-26:
  1. El catálogo tiene buscador, que busca en el título, la descripción y el
     nombre del autor de los cursos.
  2. No hay inscripción: cualquier curso publicado se abre y se cursa
     directamente; "Mis cursos" (F04) se arma con el progreso.
  3. La portada del MVP es generada (inicial del título sobre un color), sin
     imagen y sin campo en el curso.
- Los criterios marcados `[backend]` se prueban enviando peticiones al servidor
  sin pasar por un cliente; cómo hacerlo lo dice el `quickstart.md` del plan.
- Al cerrar la feature: agregar Curso y Leccion a `specs/02-modelo-datos.md`
  (y quitar "portada" de los campos previstos de Curso), y en
  `specs/01-navegacion.md` confirmar el catálogo en `/`, el detalle del curso
  en los dos clientes y el cambio de nombre de la pestaña "Inicio" a
  "Explorar".
