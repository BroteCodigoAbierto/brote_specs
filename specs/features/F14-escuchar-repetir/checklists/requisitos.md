# Lista de calidad de la spec: F14 Escuchar y repetir, con audio propio

**Propósito**: comprobar que la spec está completa y bien escrita antes de pasar a planear.
**Creada**: 2026-11-08
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
- [x] Los flujos cubren el idioma del curso, crear la actividad, subir el audio, los
  límites de archivos, escuchar, grabarse, comprobar, cargar el audio y la falta de voz.
- [x] La feature cumple los resultados esperados de sus criterios de aceptación.
- [x] No se filtran detalles de implementación en la spec.

## Notas

- Las tres marcas `[POR ACLARAR]` se resolvieron con el usuario el 2026-11-08, una por una
  y con la recomendada: Brote le quita al audio sus datos ocultos al subirlo, "Comprobar"
  se habilita en cuanto la frase empieza a sonar (o en cuanto se sabe que no se puede
  oír), y el texto oculto se muestra si la frase no se puede oír. Quedan en
  "Aclaraciones".
- Al escribirla se eligieron, en "Supuestos": la consigna fija "Escucha y repite.", la
  frase de una línea y de hasta 200, el idioma solo en el mapa (no en "Nuevo curso"), las
  voces preferidas por país, que escuchar y grabarse no cuentan para confirmar la salida,
  que el modelo no suena mientras se graba, el reintento con "Escuchar" en la web, que la
  frase suena con el teléfono en silencio y la nota "Espera a que terminen de subir los
  archivos.". `/speckit-clarify` puede revisarlas.
- Los cursos de prueba siguen la regla de F03 ("cada feature carga las de sus tipos"):
  "Japonés sencillo" recupera sus dos escuchar y repetir y pasa a japonés; los demás
  quedan en español. "Inglés para viajar" no se publica en la semilla, para no cambiar el
  catálogo que citan F02 y F04.
- `/speckit-clarify` (2026-11-08), tres preguntas: una frase que no logra sonar cuenta como
  que no se puede oír, la frase se marca con el idioma del curso para los lectores de
  pantalla y, en el móvil, el aviso del micrófono lleva "Abrir ajustes". La lista sigue
  pasando completa.
- 82 criterios. Los archivos para subir, el curso casi lleno, la lección pesada, un
  dispositivo sin voz en coreano y una voz que necesita internet los prepara el
  quickstart del plan.
