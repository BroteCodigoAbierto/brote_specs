# Contrato

Tipos de TypeScript compartidos por `brote_backend_express`, `brote_web_react`
y `brote_mobile_expo`: lo que viaja por la API (cursos, lecciones, actividades,
progreso, errores). Ver la decisión [0005](../docs/decisiones/0005-contrato-por-copia.md).

## Archivos

- `contrato.ts`: la copia oficial. Es el único lugar donde se editan los tipos.
- `VERSION`: versión del contrato (semver). Se sube en cada cambio:
  - **mayor**: se quita o cambia un campo existente (los clientes viejos se rompen);
  - **menor**: se agrega un tipo o un campo opcional;
  - **parche**: comentarios.

## Uso

Desde la raíz de `brote_specs`:

```bash
npm run contrato:copiar    # escribe src/tipos/contrato.ts en cada repo hermano
npm run contrato:revisar   # falla si alguna copia no coincide con la oficial

# también se puede limitar a algunos repos
npm run contrato:copiar -- brote_backend_express brote_web_react
```

Las copias llevan un encabezado con la versión y no se editan a mano.

## Reglas

- Nombres en español sin acentos (`tipo`, `idCurso`, `creadoEn`).
- Solo tipos (`type`, uniones, constantes `as const`); nada de lógica ni
  dependencias, porque el archivo se copia tal cual a tres repos.
- Las actividades son una unión discriminada por el campo `tipo`.
