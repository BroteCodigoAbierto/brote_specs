# Lista de calidad de la spec: F03 Cursar una lección

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
- [x] Los flujos cubren abrir, recorrer, cada uno de los cinco tipos, terminar y salir.
- [x] La feature cumple los resultados esperados de sus criterios de aceptación.
- [x] No se filtran detalles de implementación en la spec.

## Notas

- Aclaraciones resueltas con el usuario el 2026-11-02:
  1. Las actividades del prototipo de tipos fuera de alcance no se cargan;
     cada feature siguiente carga las de sus tipos.
  2. Las opciones de la opción múltiple se mezclan al azar cada vez (en el
     prototipo la correcta siempre es la primera).
  3. Salir a mitad de la lección pide confirmación solo si el alumno ya hizo
     algo.
- Límites que la descripción no daba y se fijaron como supuesto: 100
  caracteres por espacio y 2000 para la respuesta libre.
- Los criterios marcados `[backend]` se prueban enviando peticiones al
  servidor sin pasar por un cliente; cómo hacerlo lo dice el `quickstart.md`
  del plan.
- `docs/diseno.md` sección 6 ya cubre la pantalla de lección, opciones,
  Comprobar, retroalimentación y fin de lección. El plan debe agregar ahí lo
  que falte (tarjeta de memoria, espacios, pregunta abierta, bloque de código
  con diff y la confirmación de salida) antes de usarlo.
- Al cerrar la feature: agregar Actividad (y las actividades de Leccion) a
  `specs/02-modelo-datos.md`, y confirmar el reproductor en los dos clientes
  en `specs/01-navegacion.md`.
