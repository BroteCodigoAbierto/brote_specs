# Lista de calidad de la spec: F13 Imágenes propias en los cursos

**Propósito**: comprobar que la spec está completa y bien escrita antes de pasar a planear.
**Creada**: 2026-11-07
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
- [x] Los flujos cubren subir, cada lugar con imagen, la portada, los GIF, ampliar, cargar
  al cursar y el espacio del curso.
- [x] La feature cumple los resultados esperados de sus criterios de aceptación.
- [x] No se filtran detalles de implementación en la spec.

## Notas

- Primera revisión: tres correcciones. El bloque de la secuencia no muestra la imagen
  (sigue con un texto, y emparejar con imágenes tiene su resumen), una imagen subiéndose
  no marca la actividad como incompleta (solo deshabilita guardar y probar), y "Imagen
  {n}" dice cómo se cuentan los mosaicos.
- Las decisiones de producto se tomaron con el usuario antes de la spec (ver
  "Descripción original"). Al escribirla se eligieron, en "Supuestos": la marca
  `[imagen]`, la portada sin GIF ni texto alternativo, el día de gracia de una imagen sin
  guardar, el límite de 200 caracteres del texto alternativo y que las imágenes no pasen
  de la mitad del alto de la pantalla. `/speckit-clarify` puede revisarlas.
- El espacio del curso borra al momento lo que se quita y se guarda (lo decidió el
  usuario), así que una pestaña vieja o lo recuperado después de expirar la sesión puede
  traer una imagen que ya no está: "Casos de error" lo cubre con "Esta imagen ya no está.
  Elige otra.".
- 84 criterios. Los archivos para subir y el curso casi lleno los prepara el quickstart
  del plan.
