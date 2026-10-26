# Lista de calidad de la spec: F01 Crear cuenta e iniciar sesión

**Propósito**: comprobar que la spec está completa y bien escrita antes de pasar a planear.
**Creada**: 2026-10-19
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
- [x] Los flujos cubren crear cuenta, entrar, volver con sesión, sesión expirada y cerrar sesión.
- [x] La feature cumple los resultados esperados de sus criterios de aceptación.
- [x] No se filtran detalles de implementación en la spec.

## Notas

- Aclaraciones resueltas con el usuario el 2026-10-19:
  1. La sesión expira tras 30 días sin usarse en ese dispositivo; cada uso la renueva.
  2. "Cerrar sesión" va en el menú de la cuenta de la barra superior (web) y en una pestaña nueva "Cuenta" (móvil).
  3. Sin límite de intentos fallidos al entrar en el MVP (queda fuera de alcance).
- Los criterios marcados `[backend]` se prueban enviando datos al servidor sin pasar por un cliente; cómo hacerlo lo dice el `quickstart.md` del plan.
- Al cerrar la feature: agregar Usuario y Sesion a `specs/02-modelo-datos.md` y la pestaña "Cuenta" del móvil a `specs/01-navegacion.md`.
