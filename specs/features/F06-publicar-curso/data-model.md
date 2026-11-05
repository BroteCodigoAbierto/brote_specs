# Modelo de datos: F06 Enviar un curso a revisión y publicarlo

**Plan**: [plan.md](./plan.md) · **Investigación**: [research.md](./research.md) (puntos 1 a 3)

F06 no crea tablas. El curso gana dos columnas, una restricción y un trigger.

## Entidades

### Curso: tabla `curso` (F02, F05)

| Campo (contrato) | Columna | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| — | `publicado` | booleano | sí | Sin cambios: solo los `true` son públicos (principio III). Ahora también lo pone en `false` su autor, con "Retirar del catálogo". Ponerlo en `true` sigue siendo cosa de un administrador, en la base (decisión 0014) |
| — | `revision` | texto | no | **Nueva.** `null`, `"pendiente"` o `"rechazada"`. Por defecto `null`. No viaja por la API |
| `motivoRechazo` | `motivo_rechazo` | texto | no | **Nueva.** Hasta 1000 caracteres. Solo con `revision = "rechazada"`. Puede tener saltos de línea. Se muestra siempre como texto |
| `estado` | — | texto | sí | No se guarda. Ahora con tres valores (ver abajo) |
| `revisionRechazada` | — | booleano | sí | No se guarda: `revision = "rechazada"`. Sin motivo también es `true` |
| — | `actualizado_en` | fecha | sí | Enviar y retirar lo cambian, así que suben el curso en "Cursos que creé". Un `UPDATE` a mano no lo toca (research.md, punto 10) |

Cómo sale `estado`, en este orden:

| Si | `estado` |
|---|---|
| `publicado` | `"publicado"` |
| `revision = "pendiente"` | `"enRevision"` |
| Cualquier otro caso | `"borrador"` |

### Leccion y Actividad (F02, F03, F05)

Sin cambios. Enviar solo las lee: una lección está vacía si
`jsonb_array_length(actividades) = 0`.

### Progreso (F04)

Sin cambios. Sus filas se quedan al retirar un curso y vuelven a contar al publicarlo.

## Restricción y trigger

Van en la migración, porque Prisma no los declara. `schema.prisma` lleva un comentario
en el modelo que avisa del trigger.

- **`curso_revision_valida`** (`CHECK`):
  - `revision` es `null`, `"pendiente"` o `"rechazada"`.
  - Un curso publicado no tiene `revision`.
  - `motivo_rechazo` solo existe con `revision = "rechazada"`.
  - `motivo_rechazo` tiene hasta 1000 caracteres.
- **`curso_publicado_limpia_revision`** (`BEFORE UPDATE OF publicado`): si `publicado`
  cambia de valor, pone `revision` y `motivo_rechazo` en `NULL`. Corre antes del `CHECK`.

```sql
CREATE FUNCTION curso_limpiar_revision() RETURNS trigger AS $$
BEGIN
  NEW.revision := NULL;
  NEW.motivo_rechazo := NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER curso_publicado_limpia_revision
  BEFORE UPDATE OF publicado ON curso
  FOR EACH ROW
  WHEN (OLD.publicado IS DISTINCT FROM NEW.publicado)
  EXECUTE FUNCTION curso_limpiar_revision();
```

## Estados de un curso

```text
                  autor: "Enviar a revisión"
   borrador ──────────────────────────────────► en revisión
   ▲  ▲  ▲                                          │  │
   │  │  └──────────────────────────────────────────┘  │
   │  │     autor: "Retirar de revisión"               │ administrador:
   │  │     administrador: rechaza                     │ aprueba
   │  │                                                ▼
   │  └─────────────────────────────────────────── publicado
   │        autor: "Retirar del catálogo"
   │        administrador: lo retira
   │
 crea el autor
```

| De | A | Quién | Qué se escribe |
|---|---|---|---|
| Borrador | En revisión | Autor | `revision = 'pendiente'`, `motivo_rechazo = NULL` |
| En revisión | Borrador | Autor | `revision = NULL` |
| En revisión | Borrador | Administrador | `revision = 'rechazada'`, `motivo_rechazo` opcional |
| En revisión | Publicado | Administrador | `publicado = true`; el trigger limpia la revisión |
| Publicado | Borrador | Autor o administrador | `publicado = false`; el trigger no encuentra nada que limpiar |

## Reglas de escritura

- Solo se edita o elimina un curso que no esté publicado ni pendiente. Un curso con
  `revision = "rechazada"` se edita y se elimina como un borrador.
- Enviar exige al menos una lección y ninguna vacía.
- Al enviar se borran el rechazo y su motivo: solo se ve el último.

## Del modelo al contrato

| Contrato | Sale de |
|---|---|
| `CursoDelAutor.estado`, `CursoEnEditor.estado` | `publicado` y `revision`, con la tabla de arriba |
| `CursoDelAutor.revisionRechazada`, `CursoEnEditor.revisionRechazada` | `revision = "rechazada"` |
| `CursoEnEditor.motivoRechazo` | `motivo_rechazo` |

## Migración

`prisma/migrations/<fecha>_f06_revision_curso/`, creada con `prisma migrate dev
--create-only`. Después se le agregan a mano el `CHECK`, la función y el trigger, como en
F04. No toca datos: los cursos existentes quedan con `revision` en `NULL`.
