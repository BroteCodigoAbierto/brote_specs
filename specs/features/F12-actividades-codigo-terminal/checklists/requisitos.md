# Lista de calidad de la spec: F12 Actividades de código y terminal

**Propósito**: comprobar que la spec está completa y bien escrita antes de pasar a planear.
**Creada**: 2026-11-05
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
- [x] Los flujos cubren los tres tipos, terminar y salir, y el editor.
- [x] La feature cumple los resultados esperados de sus criterios de aceptación.
- [x] No se filtran detalles de implementación en la spec.

## Notas

- Primera revisión: tres ambigüedades corregidas. El ejemplo de las comillas en la
  comparación de comandos, a dónde va el foco después de comprobar el reto (como en la
  pregunta abierta, no directo a "Continuar") y los padres del grafo con merge de
  "Actividades de prueba".
- Los títulos, textos y conteos que citan los criterios se comprobaron contra
  `referencia/cursos-prototipo/`: 13 retos (3 en C y 10 en CSS), 12 terminales y 1 grafo.
  Las 26 actividades cumplen las reglas de la spec.
- Las decisiones de producto se tomaron con el usuario: cuatro antes de la spec y el
  tamaño del grafo al escribirla (ver "Aclaraciones" en la spec).
- "Ancho" y "no se enciman" en el acomodo del grafo dependen de cómo se dibujen las
  etiquetas de las ramas: el plan lo resuelve (research.md, punto 3) y se escribe en
  `docs/diseno.md` antes del código.
- Al planear se agregaron tres reglas, con sus criterios: el teclado tampoco cambia `--` ni
  `...`, el campo de código del móvil crece hasta 12 líneas, y los saltos de línea pegados en
  la terminal pasan a espacios. La spec queda con 86 criterios.
