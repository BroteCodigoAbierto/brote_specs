# Lista de calidad de la spec: F04 Registrar y consultar el progreso

**Propósito**: comprobar que la spec está completa y bien escrita antes de pasar a planear.
**Creada**: 2026-11-02
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
- [x] Los flujos cubren registrar, ver el progreso en el detalle, repetir,
      "Mis cursos" (móvil), "Mi panel" (web) y salir a medias.
- [x] La feature cumple los resultados esperados de sus criterios de aceptación.
- [x] No se filtran detalles de implementación en la spec.

## Notas

- Aclaraciones resueltas con el usuario el 2026-11-02:
  1. En la web, el equivalente a "Mis cursos" es una página propia, "Mi
     panel", enlazada desde el encabezado; por ahora solo tiene "Sigue
     aprendiendo" y a futuro tendrá otras secciones (cursos favoritos, ...).
  2. Al repetir una lección se guarda y se muestra el resultado del último
     intento.
  3. El detalle del curso tiene "Empezar" / "Continuar", que abre la primera
     lección sin completar.
- Cómo comprueba el servidor los aciertos (research de F03, punto 2, lo dejó
  abierto para F04): lo resolvió el plan con el usuario. Se comprueba que el
  resultado cuadre con la lección, sin recalificar (research de F04,
  punto 1).
- `docs/diseno.md` no tiene todavía: el avance de un curso (barra y "{n} de
  {total} lecciones"), la marca de lección completada, el estado de guardado
  en `ResultadoLeccion`, la tarjeta de curso empezado, la pestaña "Mis
  cursos" (icono) ni la página "Mi panel" y su enlace en el encabezado. El
  plan debe agregarlos ahí antes de usarlos.
- La dirección de "Mi panel" en la web la fija el plan (`/mis-cursos` ya está
  prevista para F05 en `specs/01-navegacion.md`).
- Revisión de `/speckit-analyze` (2026-11-03): se agregaron los criterios de
  sesión expirada al guardar y de recarga fallida al volver al detalle
  (móvil). Dos casos de error quedan sin criterio propio a propósito: los 15
  segundos sin respuesta en el móvil (es el mismo cliente que ya se validó en
  F01 a F03) y la misma lección en dos dispositivos a la vez (lo garantiza
  que haya un solo registro por alumno y lección; el criterio de repetir
  comprueba que gana el último).
- Los criterios marcados `[backend]` se prueban enviando peticiones al
  servidor sin pasar por un cliente; cómo hacerlo lo dice el `quickstart.md`
  del plan.
- Al cerrar la feature: agregar Progreso a `specs/02-modelo-datos.md` y
  confirmar "Mis cursos" y "Mi panel" en `specs/01-navegacion.md`.
