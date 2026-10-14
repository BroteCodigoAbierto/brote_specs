## Reglas de Brote (tienen prioridad sobre las instrucciones del núcleo de abajo)

**Idioma**: todo lo que escribas (spec, checklist, preguntas, reporte final) va en español con acentos. El nombre corto de la carpeta va en español, en minúsculas, sin acentos ni ñ y separado por guiones (p. ej. `crear-cuenta`).

**Numeración y carpeta**: en Brote las features se identifican como `F01`, `F02`, ..., no `001`. Antes de seguir el paso 3 del núcleo, calcula `SPECIFY_FEATURE_DIRECTORY` así y trátalo como si el usuario lo hubiera dado de forma explícita:

1. Si la descripción del usuario empieza con un ID `F` seguido de dos dígitos (p. ej. `F03 ...`), usa ese ID. Si no, revisa la lista del MVP y de funcionalidades futuras en `specs/00-proyecto.md`: si la descripción corresponde claramente a una feature de esa lista, usa su ID.
2. Si no hay ID, toma el número más alto entre las carpetas `specs/features/F*` y los IDs de `specs/00-proyecto.md`, y súmale uno (con dos dígitos).
3. Si ya existe una carpeta `specs/features/<ID>-*`, no crees otra: estás actualizando esa spec.
4. `SPECIFY_FEATURE_DIRECTORY = specs/features/<ID>-<nombre-corto>`.

**Plantilla**: la plantilla resuelta de spec (formato del curso de SDD) manda sobre los nombres de sección que menciona el núcleo. Equivalencias:

| El núcleo dice | En Brote es |
|---|---|
| User Scenarios / Acceptance Scenarios | Flujo principal + Criterios de aceptación (puedes usar Dado / Cuando / Entonces) |
| Edge Cases | Casos de error + Estados de la pantalla |
| Functional Requirements | Validaciones + Datos de entrada + Resultado esperado |
| Key Entities | Datos que toca |
| Success Criteria | Criterios de aceptación: verificables a mano, sin métricas inventadas (no pongas "90% de los usuarios...") |
| Assumptions | Supuestos |

No agregues historias de usuario con prioridad (P1, P2) ni requisitos FR-001: si una feature es tan grande que necesita prioridades, propón dividirla en dos IDs.

**Contexto que debes leer antes de escribir**: `specs/00-proyecto.md` (alcance del MVP), `specs/02-modelo-datos.md` (entidades que ya existen; reutiliza sus nombres), `specs/01-navegacion.md` y `docs/arquitectura.md` (solo para saber qué hace cada cliente: la web cursa y crea cursos, el móvil solo cursa).

**Checklist de calidad**: en el paso 8 genera `checklists/requisitos.md` en español con la lista "Una spec está completa cuando" del curso además de los puntos del núcleo:

- [ ] Tiene objetivo, actor y precondiciones.
- [ ] Los datos de entrada indican tipo y si son obligatorios.
- [ ] Incluye estados de la pantalla y casos de error.
- [ ] Dice explícitamente qué queda fuera de alcance.
- [ ] Cada criterio de aceptación puede marcarse como cumplido o no cumplido sin discusión.
- [ ] No menciona librerías, tablas ni endpoints.

**Preguntas**: si quedan marcas `[NEEDS CLARIFICATION]`, escríbelas como `[POR ACLARAR: ...]` y haz las preguntas **una por una** (usa la herramienta de preguntas si está disponible), con la opción recomendada primero.

**Al terminar**: no crees ramas de git. Recuerda al usuario el siguiente paso (`/speckit-clarify` o `/speckit-plan`) y que la rama de código será `feature/<ID>-<nombre-corto>`.

---

