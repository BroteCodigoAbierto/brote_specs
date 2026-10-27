# Investigación: F02 Explorar el catálogo de cursos publicados

**Fecha**: 2026-10-26 · **Plan**: [plan.md](./plan.md)

Solo cubre lo nuevo de esta feature. El stack, `pedir()` + hooks, Context +
useReducer y el contrato por copia ya están decididos en `docs/decisiones/`.

Versiones revisadas el 2026-10-26: Prisma y `@prisma/client` 7.10.1,
PostgreSQL 18.6 (local, base `brote` con collation `en_US.UTF-8`), React
Router 8.4.0, Expo SDK 58.

## 1. Cómo se guarda si un curso está publicado

- **Decisión**: el curso tiene un booleano `publicado` (por defecto `false`).
  El administrador lo cambia a `true` directamente en la base de datos, como
  dicen la constitución (principio III), `docs/arquitectura.md` y la decisión
  0014. El catálogo y el detalle solo leen cursos con `publicado = true`.
- **Por qué**: lo eligió el usuario el 2026-10-26. Respeta los tres documentos
  sin cambiarlos, y no adelanta el diseño de la revisión, que le toca a F06
  (qué pasa al editar un curso publicado).
- **Alternativas descartadas**:
  - Un `estado` con tres valores (`borrador`, `enRevision`, `publicado`):
    obligaba a corregir la constitución, la arquitectura y la decisión 0014.
  - `publicado` más un `estado` del autor: adelantaba F06.
- **Consecuencia**: en F02 un curso "en borrador" y uno "en revisión" son,
  para el sistema, el mismo caso: `publicado = false`. El criterio de la spec
  se valida con dos cursos no publicados. Cuando F06 agregue el dato de la
  revisión, conviene repetir ese criterio.

## 2. Búsqueda sin mayúsculas ni acentos, por palabras

- **Decisión**: la búsqueda se hace en PostgreSQL con la extensión
  **`unaccent`**, en una consulta SQL propia (`bd.$queryRaw` con parámetros).
  - Por cada palabra del texto buscado se agrega una condición: el texto
    `titulo || ' ' || descripcion || ' ' || nombre del autor`, pasado por
    `lower(unaccent(...))`, debe contener `lower(unaccent(palabra))`, usando
    `LIKE '%' || ... || '%'`. Todas las condiciones se unen con `AND`.
  - Antes de mandarla, en cada palabra se escapan `\`, `%` y `_` (con
    `ESCAPE '\'`). Así, buscar "100%" no se vuelve un comodín.
  - `unaccent` convierte la ñ en n y quita los acentos, como pide la spec.
  - El nombre del autor se lee de `user.name` en la misma consulta, así que
    siempre es el nombre actual.
- **Comprobado el 2026-10-26**: en la base local, `unaccent` 1.1 está
  disponible y es *trusted*. El usuario `brote` es dueño de la base y puede
  instalarla sin ser superusuario.
- **Alternativas descartadas**:
  - **Columnas normalizadas guardadas** (`titulo_busqueda`, ...): permiten
    usar el `contains` de Prisma, pero F05 y F07 tendrían que recalcularlas
    en cada escritura. Además habría que copiar el nombre del autor al curso,
    y esa copia quedaría vieja si algún día se puede editar el perfil.
  - **Búsqueda de texto completo** (`tsvector`): busca palabras completas o
    raíces, no partes de palabra ("sencill" debe encontrar "sencilla").
  - **`pg_trgm`**: búsqueda aproximada; la spec pide coincidencias exactas.
  - **Filtrar en Node**: obliga a traer todos los cursos y rompe la carga de
    10 en 10.
- **A verificar al implementar**: sin la *preview feature*
  `postgresqlExtensions`, `prisma migrate` debería ignorar la extensión al
  comparar el esquema con la base. Si Prisma intentara quitarla, se declara
  con esa *preview feature*.
- *Comprobado al implementar*:
  - un segundo `prisma migrate dev` genera una migración vacía, así que
    Prisma ignora la extensión y no hace falta la *preview feature*;
  - en Prisma 7, `migrate dev` ya no regenera el cliente: después de migrar
    hay que correr `npm run bd:generar`;
  - `unaccent` convierte "¿" en "?" y "¡" en "!"; la clave de orden los quita
    igual, porque no son letras ni números;
  - el `%` y el `_` de la búsqueda se buscan literalmente.

Fuente: <https://www.postgresql.org/docs/18/unaccent.html>.

## 3. Orden alfabético estable

- **Decisión**: se ordena por una **clave** calculada en la consulta:
  `regexp_replace(lower(unaccent(titulo)), '^[^[:alnum:]]+', '')`, es decir,
  el título en minúsculas, sin acentos y sin signos al inicio ("¿", "¡").
  Desempatan `creado_en` y luego `id`. La clave y el `id` se comparan con
  `COLLATE "C"`.
- **Por qué**: la spec pide de la A a la Z sin importar mayúsculas ni acentos.
  La collation de la base (`en_US.UTF-8` en local) puede cambiar en otro
  servidor y, con ella, el orden. La paginación por cursor (punto 4) necesita
  que el `ORDER BY` y la comparación usen exactamente el mismo orden. Como la
  clave ya está normalizada, ordenarla byte a byte (`"C"`) da el mismo
  resultado en cualquier servidor. Quitar los signos iniciales sigue la misma
  regla que la inicial de la portada (punto 7).
- **Ejemplo**: "Curso de prueba 01..21", "Examen unidad 1", "Git esencial",
  "Japonés sencillo", "Programación en C sencilla" (los números van antes que
  las letras).

## 4. De 10 en 10: cursor en lugar de desplazamiento

- **Decisión**: paginación por **cursor** (*keyset*). La respuesta trae hasta
  10 cursos y `siguiente`: un texto opaco con la posición del último curso
  entregado, o `null` si ya no hay más. Para pedir los siguientes, el cliente
  lo devuelve en `?despues=`.
  - El cursor es `[clave, creadoEn, id]` del último curso, en JSON y
    codificado en base64url. El servidor no busca ese curso: compara
    `(clave, creado_en, id) > (cursor)` con una comparación de filas de
    PostgreSQL.
  - Se piden 11 filas: si llega la undécima, hay más. Se entregan 10, y el
    cursor es el del décimo curso.
  - El servidor usa siempre 10 y no acepta otro tamaño (`?limite=` se ignora).
  - Un cursor que no se puede leer responde 400.
- **Por qué**: con `OFFSET`, retirar un curso que ya se vio corre a todos los
  demás una posición y uno de ellos nunca aparece. La spec lo prohíbe ("no
  falta ninguno de los que siguen publicados"). Con el cursor, lo que se
  compara es la posición en el orden, no el número de fila. Tampoco depende
  de que el último curso siga existiendo o publicado.
- **Alternativa descartada**: el `cursor` de Prisma (`cursor: { id }`). Busca
  la fila del cursor en la base, así que falla si el curso se borró, y no
  funciona con una clave calculada.
- *Comprobado al implementar*:
  - `creado_en` es `timestamp(3)` sin zona horaria y guarda UTC, así que el
    cursor se compara con `CAST(<ISO> AS timestamp(3))`, no con un `Date`.
    Con la sesión de la base en `America/Tijuana`, 25 cursos con el mismo
    título (5 de ellos con la misma fecha exacta) salen en 3 cargas, sin
    repetir ninguno;
  - retirar un curso de la primera carga no cambia la segunda.

## 5. Identificadores

- **Decisión**: `curso.id` y `leccion.id` son texto con `@default(uuid(7))`.
- **Por qué**: la convención del modelo de datos es "IDs como texto". UUID v7
  no se puede adivinar ni contar ("¿cuántos cursos hay?"), y está ordenado
  por tiempo, lo que ayuda a los índices. Prisma lo genera sin dependencias.
- **Alternativa descartada**: enteros autoincrementales. Exponen cuántos
  cursos hay y dejan probar identificadores de cursos sin publicar uno por
  uno.

## 6. Datos de prueba

- **Decisión**: un script del backend, `npm run bd:sembrar`
  (`scripts/sembrar-cursos.ts`), con el mismo estilo que `sesiones:expirar`.
  - Crea, si no existen, dos cuentas con el nombre "Equipo Brote":
    `autor@brote.test` y `autor2@brote.test`, las dos con contraseña
    `brote12345`. Usa `auth.api.signUpEmail`, para que la contraseña quede
    con el mismo hash que una cuenta normal y se pueda entrar con ellas.
  - Borra los cursos de esas dos cuentas (las lecciones se van en cascada) y
    los vuelve a crear. Así correrlo otra vez regresa al estado inicial.
  - Los datos están en `scripts/datos-prueba.ts`, sin leer `brote_specs`, para
    que el backend funcione clonado solo:
    - **Publicados**: los cuatro cursos del prototipo, con su título, su
      descripción y los títulos de sus lecciones (de los `manifest.json` de
      `referencia/cursos-prototipo/`).
    - **No publicados**: "Curso en borrador", "Curso en revisión", "Sin
      lecciones todavía" (0 lecciones), "Una sola lección" (1), "¿Cómo se dice
      hola?" (2), uno con `<b>hola</b>` y `<script>` en el título y la
      descripción, y 21 genéricos "Curso de prueba 01" a "21" (todos de
      `autor@`). Además, "Huerto en casa", de `autor2@`, para el criterio del
      autor con el mismo nombre.
  - La guía de validación publica y retira cursos con `UPDATE curso SET
    publicado = ...`, igual que hará el administrador.
- **Por qué**: ningún criterio necesita las actividades. Los cursos completos
  del prototipo los trae F07 (importación).
- **A verificar al implementar**: `auth.api.signUpEmail` sin cabeceras desde
  un script (con `autoSignIn` crea una sesión que no se usa; no estorba).

## 7. Portada generada

- **Decisión**: cada cliente calcula la portada; el backend no la conoce.
  - **Inicial**: el primer carácter del título que sea letra o número
    (`/[\p{L}\p{N}]/u`), en mayúscula (`toLocaleUpperCase("es")`). Si no hay
    ninguno, el primer carácter del título.
  - **Color**: uno de 8, elegido por el `id` del curso:

    ```ts
    let h = 0;
    for (const c of id) h = (h * 31 + c.codePointAt(0)!) % 2147483647;
    return h % 8; // índice en la paleta
    ```

  - **Paleta**: igual en la web (`--color-portada-1` a `-8` en `tokens.css`)
    y en el móvil (`coloresPortada` en `tema.ts`). Se usa en modo claro y
    oscuro, con la letra en blanco: `#2f7d4f`, `#2c6aa0`, `#7b4fa0`,
    `#a8443f`, `#9a5b13`, `#1f7a7a`, `#8a4a6b`, `#4a5a6a`. Al implementar se
    revisa que cada color tenga contraste ≥ 4.5:1 con el blanco.
- **Por qué**: la regla es de presentación y cabe en dos funciones cortas por
  cliente, igual que la validación de F01 (cada repo la escribe con las
  constantes del contrato). Como el color sale del `id` y no del título, no
  cambia si el autor corrige el título (F05).
- **A verificar al implementar**: que Hermes (SDK 58) acepte `\p{L}` con la
  bandera `u`. Si no, en el móvil una letra es un carácter con
  `c.toLowerCase() !== c.toUpperCase()`, y un número es `/[0-9]/`.

## 8. Web: búsqueda en la dirección y catálogo que sobrevive al detalle

- **Búsqueda en la dirección**: el texto escrito vive en `?q=`
  (`useSearchParams`). Al escribir, la dirección se actualiza con `replace:
  true` (no llena el historial) y `preventScrollReset: true` (no salta al
  inicio de la página). Recargar o abrir `/?q=git` empieza con esa búsqueda.
  F01 ya guarda en `state.desde` la dirección completa, con `?q=`, así que
  al volver de "Entrar" se recupera la búsqueda.
- **Esperar a que deje de escribir**: el pedido sale 300 ms después de la
  última tecla. Lo escrito se ve al instante en el buscador.
- **Respuestas viejas**: cada pedido lleva la consulta que lo originó. Una
  respuesta que no es de la consulta vigente se ignora. Así se cumple "lo que
  se muestra corresponde siempre al último texto escrito".
- **Volver del detalle como se dejó**: el estado del catálogo (consulta,
  cursos cargados y `siguiente`) vive en un `CatalogoContext` (decisión 0011)
  montado en el `Layout`, que no se desmonta al ir de `/` a `/cursos/:idCurso`
  y volver. `<ScrollRestoration />` de React Router restaura la posición: como
  los cursos ya están en el contexto, la lista tiene su altura al volver.
  Recargar la página vacía el contexto y empieza otra vez desde los primeros
  10, como dice la spec.
- **Alternativa descartada**: guardar el catálogo en `sessionStorage`. Habría
  que serializarlo, y una recarga lo recuperaría, cuando la spec pide empezar
  desde los primeros 10.

Fuentes: <https://reactrouter.com/api/components/ScrollRestoration>,
<https://reactrouter.com/api/hooks/useSearchParams>.

## 9. Móvil: lista, recarga y detalle

- **Lista**: `FlatList`. `onEndReached` pide los siguientes 10 solo si hay
  `siguiente` y no hay otra carga en curso (`onEndReached` puede dispararse
  varias veces seguidas). Las propiedades `refreshing` y `onRefresh` dan el
  "deslizar hacia abajo". `numberOfLines` corta el título (2) y la
  descripción (3) con "…".
- **Buscador**: un `TextInput` arriba de la `FlatList`, no dentro de
  `ListHeaderComponent`, donde podría perder el foco al cambiar la lista.
  Tiene `maxLength={100}`.
- **Detalle**: pantalla `curso/[idCurso]` en el `Stack` raíz, dentro del
  `Stack.Protected` con sesión, por encima de las pestañas. Al abrirla, la
  pestaña "Explorar" sigue montada debajo, así que al volver la lista y su
  posición están como se dejaron, sin un contexto. Tiene encabezado con el
  botón de volver.
- **Sesión expirada**: no hace falta nada nuevo. `pedir()` avisa el 401 y
  `Stack.Protected` lleva a "Entrar" (F01).

Fuentes: <https://reactnative.dev/docs/flatlist>,
<https://docs.expo.dev/router/advanced/protected/>.

## 10. Cuántos caracteres tiene la búsqueda

- El servidor cuenta con `Array.from(texto).length`, igual que F01.
- `maxLength` de un `<input>` y de un `TextInput` cuenta unidades UTF-16: un
  emoji cuenta 2. El cliente puede dejar escribir menos de 100 caracteres
  Unicode, pero nunca más, así que lo que manda siempre pasa la validación del
  servidor.
