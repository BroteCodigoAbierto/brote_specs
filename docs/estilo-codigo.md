# Estilo de código

Este es el estilo de Brote, sacado de los trabajos de Aplicaciones Web y
Aplicaciones Móviles y del prototipo. El formato (comillas, sangría, punto y
coma) lo resuelven Prettier y ESLint; este documento cubre lo que una
herramienta no decide.

## Idioma

| Qué | Idioma | Ejemplo |
|---|---|---|
| Variables, funciones, componentes, tipos, archivos, tablas, columnas | Español **sin acentos ni ñ** | `traerCursos`, `leccionActual`, `anio`, `TarjetaCurso` |
| Textos que ve el usuario | Español con acentos | `"No se pudo guardar la lección."` |
| Comentarios, docs, specs, commits, PRs | Español con acentos | `// la sesión expira en 7 días` |
| Nombres que impone una librería | Como los pida | `useState`, `req`, `res`, `children`, `onPress` |

Vocabulario base, para no tener tres nombres para lo mismo:

| Concepto | Nombre en código |
|---|---|
| Course / Lesson / Activity | `curso`, `leccion`, `actividad` |
| User / Author / Student | `usuario`, `autor`, `alumno` |
| Progress / Points / Badge | `progreso`, `puntos`, `insignia` |
| Glossary entry | `entradaGlosario` |
| Draft / In review / Published | `borrador`, `enRevision`, `publicado` |
| Fetch from API | `traer...` (leer), `crear...`, `actualizar...`, `borrar...` |
| Event handler prop | `al...` (`alEntrar`, `alCambiar`, `alTerminar`) |
| Handler interno | `manejar...` (`manejarEnvio`) |

## Formato (Prettier)

- Comillas dobles, punto y coma, sangría de 2 espacios, coma final en
  multilínea, ancho de 100.
- No se discute en revisiones: se corre `npm run formato`.

## Funciones y componentes

- Componentes y funciones con nombre se declaran con `function`, no con flecha:

  ```tsx
  export default function TarjetaCurso({ curso, alAbrir }: PropsTarjetaCurso) {
    ...
  }
  ```

- Flechas solo para callbacks en línea (`lista.map((c) => ...)`).
- Un componente por archivo; el archivo se llama como el componente
  (`TarjetaCurso.tsx`).
- Props tipadas con un `type` arriba del componente, nombrado `Props<Componente>`.
- Funciones cortas que hacen una cosa y cuyo nombre la dice.

## TypeScript

- `strict` en los tres repos.
- Nada de `enum`, `namespace` ni propiedades en el constructor
  (`constructor(public x)`): el backend ejecuta TypeScript quitando los tipos y
  esa sintaxis no se puede quitar. Se usan uniones de texto
  (`type Estado = "borrador" | "enRevision" | "publicado"`) y campos normales.
  La web sigue la misma regla para que el código se vea igual.
- Imports relativos: con extensión `.ts`/`.tsx` en backend y web
  (`./app.ts`); sin extensión en el móvil (`../config`), como espera Expo.

## Comentarios

- Comentarios cortos que explican **por qué**, no qué hace la línea.
- Se vale dejar el enlace a la documentación que se usó:

  ```ts
  // https://reactnative.dev/docs/flatlist
  ```

- Nada de código comentado "por si acaso": para eso está git.

## Llamadas a la API

Cada cliente tiene un solo punto de salida a la red, `src/servicios/api.ts`,
con la función `pedir` (el mismo patrón del Taller 10):

```ts
export class ErrorHttp extends Error {
  estado: number;
  cuerpo: unknown;

  constructor(estado: number, cuerpo: unknown) {
    super(`HTTP ${estado}`);
    this.estado = estado;
    this.cuerpo = cuerpo;
  }
}

export async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(URL_API + ruta, {
    ...opciones,
    headers: { "Content-Type": "application/json", ...opciones.headers },
  });
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    throw new ErrorHttp(respuesta.status, cuerpo);
  }
  return respuesta.json() as Promise<T>;
}
```

Encima de `pedir` van funciones por recurso (`servicios/cursos.ts` →
`traerCursos`, `crearCurso`) y encima de esas, hooks (`hooks/useCursos.ts`) que
exponen `{ datos, cargando, error, recargar }`. Los componentes no llaman
`fetch` directamente.

## Almacenamiento local

Claves con espacio de nombres, como en los talleres: `"sesion.token"`,
`"cache.cursos"`, `"pref.tema"`. Las claves se declaran como constantes en un
solo lugar por repo.

## Estilos

- **Web**: un `NombreComponente.module.css` junto a cada componente. Colores,
  espacios, radios y tipografía salen de las variables de
  `src/estilos/tokens.css` (`var(--color-primario)`); no se escriben colores
  sueltos.
- **Móvil**: `StyleSheet.create` al final del archivo del componente. Los
  valores salen de `src/constantes/tema.ts`.

## Backend

- Capas: `rutas` (HTTP: leer la petición, responder) → `servicios` (reglas de
  negocio) → Prisma. Las rutas no hablan con Prisma directamente.
- Toda entrada se valida en la ruta antes de llegar al servicio.
- Los errores esperados se lanzan como `ErrorApi(estado, mensaje, campos?)`
  y los responde un manejador central con el tipo `RespuestaError` del
  contrato; los mensajes van en español.
- Tablas y columnas en español, en `snake_case` en la base
  (`@@map`/`@map` en Prisma) y `camelCase` en el código.
- **Única excepción**: los modelos de Better Auth (`User`, `Session`,
  `Account`, `Verification`; tablas `user`, `session`, `account`,
  `verification`) y sus campos quedan en inglés, tal como los define la
  librería, para no mantener un mapeo que se rompa con cada versión
  (decidido en el plan de F01). El código propio no los expone: el contrato
  habla de `Usuario` (`nombre`, `correo`) y los servicios traducen. Ninguna
  otra tabla sigue esta excepción.

## Git

- Ramas: `feature/F03-crear-curso` desde `dev`. Arreglos sueltos:
  `fix/descripcion-corta`.
- Commits: `F03: deshabilitar Guardar sin título`. Sin ID si no es de una
  feature: `docs: ...`, `chore: ...`.
- PR a `dev` con la plantilla del repo (spec enlazada y criterios cubiertos).
