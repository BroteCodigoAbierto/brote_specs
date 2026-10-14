# 0012. Validación manual, sin pruebas automáticas

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Decisión

Una feature se da por terminada cuando todos sus criterios de aceptación se
comprueban **a mano** siguiendo su `quickstart.md`. No hay pruebas
automáticas obligatorias.

## Alternativas consideradas

- **Pruebas de los criterios clave** (Vitest, Supertest, Testing Library).
- **TDD estricto**.

## Consecuencias

- Los criterios tienen que ser muy concretos, porque son la única red.
- Esto no quita la **validación de datos** en el backend, que es seguridad, no
  pruebas.
- Si una feature agrega pruebas, se justifica en su plan.
