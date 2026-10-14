# 0006. PostgreSQL con Prisma

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Contexto

Usuarios, cursos, progreso y puntos son datos relacionales. Las actividades
de una lección son documentos con formas distintas según su tipo.

## Decisión

- **PostgreSQL**: tablas relacionales, y las actividades de cada lección en
  una columna **JSONB**, validada por el backend antes de guardar.
- **Prisma** como ORM: esquema en `prisma/schema.prisma`, cliente tipado y
  migraciones.
- En desarrollo, PostgreSQL corre en un contenedor (`compose.yaml` del
  backend, con Podman o Docker).

## Alternativas consideradas

- **SQLite**: cero instalación, pero se queda corto con varios usuarios
  escribiendo a la vez y no tiene JSONB.
- **MongoDB**: los cursos caben natural como documentos, pero usuarios,
  progreso y puntos son relacionales.
- **Drizzle / SQL directo con `pg`**: más cerca del SQL; Prisma se eligió por
  su esquema declarativo y sus migraciones.

## Consecuencias

- Los tipos de Prisma (modelos de la base) no son el contrato: el contrato
  describe lo que viaja por la API y los servicios traducen entre ambos.
- Tablas y columnas en español, `snake_case` en la base con `@@map`/`@map`.
