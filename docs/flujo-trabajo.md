# Flujo de trabajo

Cómo se lleva una feature de idea a código con Spec Kit, a través de los
cuatro repos.

## Preparación (una vez por computadora)

```bash
# uv y la CLI de Spec Kit (fijada en la versión con la que se armó el repo)
python3 -m pip install --user uv
uv tool install "specify-cli @ git+https://github.com/github/spec-kit.git@v1.2.0"

# Los cuatro repos, uno junto al otro
mkdir brote && cd brote
git clone https://github.com/BroteCodigoAbierto/brote_specs.git
git clone https://github.com/BroteCodigoAbierto/brote_backend_express.git
git clone https://github.com/BroteCodigoAbierto/brote_web_react.git
git clone https://github.com/BroteCodigoAbierto/brote_mobile_expo.git
```

Las rutas `../brote_*` de las specs y los scripts suponen esa estructura.

## Dónde abrir Claude Code

En **`brote_specs`**. Ahí están los comandos `/speckit-*` y la constitución, y
`.claude/settings.json` le da acceso a los tres repos hermanos para poder
implementar.

## El ciclo de una feature

```text
 00-proyecto.md ─▶ /speckit-specify ─▶ /speckit-clarify ─▶ /speckit-plan ─▶ /speckit-tasks
  (¿está en el        spec.md          (opcional)         plan.md          tasks.md
   MVP?)                                                   data-model.md
                                                           contracts/
                                                           quickstart.md
        ─▶ /speckit-analyze ─▶ /speckit-implement ─▶ validación manual ─▶ PRs a dev
           (opcional)            código en ramas       criterios marcados
                                 feature/F0X-...
```

### 1. Especificar

```text
/speckit-specify F02 Explorar el catálogo de cursos publicados: ...
```

- Crea `specs/features/F02-explorar-catalogo/spec.md` con el formato del curso
  (Objetivo, Actor, ..., Criterios de aceptación).
- **Revisa la spec tú.** Pregúntate lo del curso: ¿otra persona podría
  implementarla sin preguntarme qué quise decir? ¿Cada criterio se puede marcar
  sin discutir?
- Commit en `brote_specs`: `F02: spec`.

### 2. Aclarar (opcional)

`/speckit-clarify` busca huecos en la spec y te hace preguntas. Úsalo cuando la
feature es grande o tiene reglas que no has pensado (gamificación, offline).

### 3. Planear

`/speckit-plan` agrega `plan.md` (qué cambia en cada repo), `data-model.md`,
`contracts/api.md` y `quickstart.md` (cómo validar cada criterio a mano).

- Revisa sobre todo la tabla de la constitución y las dependencias nuevas.
- Commit: `F02: plan`.

### 4. Tareas

`/speckit-tasks` genera `tasks.md` agrupado por repo, con una tarea `V..` por
criterio de aceptación al final. Commit: `F02: tareas`.

`/speckit-analyze` (opcional) revisa que spec, plan y tareas digan lo mismo.

### 5. Implementar

`/speckit-implement` (o `/speckit-implement solo T006 a T008`):

- Crea `feature/F02-explorar-catalogo` desde `dev` en cada repo afectado.
- Hace un commit por tarea en su repo, con el formato `F02: ...`.
- No hace push.

También puedes implementar tú las tareas a mano; tasks.md es la guía de
cualquier forma.

### 6. Validar

Sigue `quickstart.md` y marca cada criterio de aceptación en `spec.md` y su
tarea `V..` en `tasks.md`. Si algo no se cumple, se arregla (o se corrige la
spec, si la spec estaba mal) antes de seguir.

### 7. Integrar

En cada repo afectado:

```bash
git push -u origin feature/F02-explorar-catalogo
```

y PR a `dev` usando la plantilla del repo. El PR de `brote_specs` (con la spec
marcada y el modelo de datos actualizado) se integra al mismo tiempo que los
de código. En cada entrega, `dev` se integra a `main` con un PR por repo.

## Cuando cambia el contrato

1. Edita `contrato/*.ts` en `brote_specs` y sube `contrato/VERSION`.
2. `npm run contrato:copiar` → escribe `src/tipos/contrato.ts` en cada repo.
3. `npm run contrato:revisar` → confirma que todas las copias coinciden.
4. El commit de la copia va en la rama de la feature de cada repo.

## Cuando cambia una spec ya implementada

Una spec cerrada se puede cambiar, pero en el mismo PR que el código que la
hace cierta. Si el cambio es grande, se especifica como feature nueva.

## Comandos de Spec Kit

| Comando | Para qué |
|---|---|
| `/speckit-specify` | Crear o actualizar la spec de una feature |
| `/speckit-clarify` | Preguntas para cerrar ambigüedades de la spec |
| `/speckit-plan` | Plan técnico, modelo de datos, API y guía de validación |
| `/speckit-checklist` | Checklists extra de calidad (seguridad, UX, ...) |
| `/speckit-tasks` | Lista de tareas por repo |
| `/speckit-analyze` | Revisión de consistencia entre spec, plan y tareas |
| `/speckit-implement` | Implementar tareas |
| `/speckit-converge` | Comparar el código con la spec y agregar lo que falte como tareas |
| `/speckit-constitution` | Modificar la constitución |

Las reglas propias de Brote (numeración F01, formato del curso, español,
multi-repo) están en el preset `presets/brote/`. Si lo modificas:

```bash
specify preset remove brote
specify preset add --dev ./presets/brote
specify integration upgrade claude --force --integration-options="--no-model-invocation"
```

El último comando hace que los `/speckit-*` solo corran cuando tú los
invocas (el preset quita esa opción al reinstalarse).
