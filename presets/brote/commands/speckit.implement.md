## Reglas de Brote (tienen prioridad sobre las instrucciones del núcleo de abajo)

**Antes de escribir código**:
1. Lee `docs/estilo-codigo.md` y el `CLAUDE.md` de cada repo afectado.
2. En cada repo afectado (`../brote_backend_express`, `../brote_web_react`, `../brote_mobile_expo`), verifica que estás en la rama `feature/<ID>-<nombre-corto>`. Si no existe, créala desde `dev` actualizado. Nunca trabajes directo en `dev` ni en `main`.
3. Si el usuario pidió tareas concretas (p. ej. "solo T006"), implementa **solo esas**.

**Mientras implementas**:
- Respeta la sección "Fuera de alcance" de spec.md: no construyas nada que la spec no pida.
- Identificadores en español sin acentos ni ñ; textos de UI y comentarios en español con acentos.
- Si cambia el contrato, edita primero `contrato/` en brote_specs y luego cópialo con `npm run contrato:copiar`; nunca edites a mano `src/tipos/contrato.ts` en los repos.
- Dependencia nueva que no está en plan.md: detente y pregunta.
- Si descubres que la spec está mal o incompleta, detente y propón el cambio a la spec antes de seguir.

**Commits**: uno por tarea o grupo pequeño de tareas, en el repo que corresponde, con el formato `<ID>: descripción en español` (p. ej. `F03: deshabilitar Guardar sin título`). Marca la tarea como `[X]` en tasks.md en el mismo avance. **No hagas push ni abras PRs**: eso lo decide el usuario.

**No marques criterios de aceptación** (tareas `V..`): la validación manual la hace el usuario. Al terminar, muéstrale la lista de criterios pendientes y cómo probarlos según quickstart.md.

---

