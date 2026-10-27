# Guía de validación: F02 Explorar el catálogo de cursos publicados

Cómo levantar los tres repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). La feature está terminada cuando todos están marcados
(principio VIII). Rutas y respuestas en [contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: los de F01 (Node 24, PostgreSQL, Expo Go para el SDK 58). Cada
repo en su rama `feature/F02-explorar-catalogo`.

```bash
# brote_specs: copiar el contrato 0.3.0 y comprobar las copias
npm run contrato:copiar && npm run contrato:revisar

# brote_backend_express
npm install
npm run bd:migrar          # tablas curso y leccion, y la extensión unaccent
                           # si el usuario no puede crear bases: npx prisma migrate deploy && npm run bd:generar
npm run bd:sembrar         # cuentas y cursos de prueba (sección 1.1)
npm run dev                # API en http://localhost:3000

# brote_web_react
npm run dev                # http://localhost:5173

# brote_mobile_expo
npx expo start             # abrir con Expo Go
```

### 1.1 Datos de prueba

`npm run bd:sembrar` deja siempre el mismo **estado inicial**. Vuelve a
correrlo después de cada criterio que publique o retire cursos.

| Cuenta | Contraseña | Nombre |
|---|---|---|
| `autor@brote.test` | `brote12345` | Equipo Brote |
| `autor2@brote.test` | `brote12345` | Equipo Brote |

| Curso | Autor | Lecciones | En el estado inicial |
|---|---|---|---|
| Examen unidad 1 | `autor@` | 11 | publicado |
| Git esencial | `autor@` | 6 | publicado |
| Japonés sencillo | `autor@` | 4 | publicado |
| Programación en C sencilla | `autor@` | 4 | publicado |
| Curso en borrador | `autor@` | 1 | no publicado |
| Curso en revisión | `autor@` | 1 | no publicado (en F02 es lo mismo que borrador; ver research.md, punto 1) |
| Sin lecciones todavía | `autor@` | 0 | no publicado |
| Una sola lección | `autor@` | 1 | no publicado |
| ¿Cómo se dice hola? | `autor@` | 2 | no publicado |
| `Texto <b>hola</b> <script>` (descripción: `Si ves <b>hola</b> sin negritas y <script>alert(1)</script> como texto, se muestra bien.`) | `autor@` | 1 | no publicado |
| Curso de prueba 01 a Curso de prueba 21 | `autor@` | 1 a 3 | no publicados |
| Huerto en casa | `autor2@` | 2 | no publicado |

Para los criterios de "de 10 en 10", con los genéricos publicados hay **25**
cursos, en este orden: Curso de prueba 01 a 21, Examen unidad 1, Git
esencial, Japonés sencillo y Programación en C sencilla. La primera carga va
de 01 a 10, la segunda de 11 a 20 y la tercera de 21 a Programación en C.

Para usar la app como un usuario cualquiera, crea una cuenta propia (F01). Para
los criterios que dicen "aunque entre con la cuenta de su autor", entra con
`autor@brote.test`.

### 1.2 Atajos

`bd` es el de F01:

```bash
bd() { psql -X -q postgresql://brote:brote@localhost:5432/brote; }
# o, sin psql, dentro del contenedor (desde brote_backend_express)
# bd() { podman compose exec -T postgres psql -X -q -U brote -d brote; }
```

Consultas con nombre que usan las tablas de la sección 3:

```bash
# C1. Ver los cursos, si están publicados y cuántas lecciones tienen
bd <<'SQL'
SELECT titulo, publicado, (SELECT count(*) FROM leccion l WHERE l.id_curso = c.id) AS lecciones
FROM curso c ORDER BY titulo;
SQL

# C2. Publicar los 21 genéricos (quedan 25 publicados)
bd <<'SQL'
UPDATE curso SET publicado = true WHERE titulo LIKE 'Curso de prueba %';
SQL

# C3. Publicar un curso por su título (cámbialo)
bd <<'SQL'
UPDATE curso SET publicado = true WHERE titulo = 'Una sola lección';
SQL

# C4. Retirar un curso por su título (cámbialo)
bd <<'SQL'
UPDATE curso SET publicado = false WHERE titulo = 'Git esencial';
SQL

# C5. Ningún curso publicado
bd <<'SQL'
UPDATE curso SET publicado = false;
SQL
```

Para pausar el backend sin apagarlo (y ver estados de "cargando"), como en
F01: `kill -STOP <pid>` del `npm run dev` y luego `kill -CONT <pid>`. En la
web también sirve DevTools → Red → "3G lento".

Para expirar la sesión: `./expirar` desde `brote_specs` (F01).

## 2. Backend con curl

Corre estas primero: comprueban la autoridad del servidor sin ningún cliente.

```bash
API=http://localhost:3000
J='Content-Type: application/json'
cuantos() { python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d['cursos']), 'cursos; siguiente:', d['siguiente'])"; }
siguiente() { python3 -c "import json,sys; print(json.load(sys.stdin)['siguiente'])"; }

# B1. Sin sesión → 401 en las dos rutas
curl -s -w ' %{http_code}\n' $API/cursos
curl -s -w ' %{http_code}\n' $API/cursos/cualquiera
# {"error":"Tu sesión terminó. Vuelve a entrar."} 401  (las dos)

# Entrar y guardar la cookie
curl -s -c galletas.txt -X POST $API/sesiones -H "$J" -d '{"correo":"autor@brote.test","contrasena":"brote12345"}'

# B2. Estado inicial: 4 cursos en orden, sin siguiente
curl -s -b galletas.txt $API/cursos | python3 -m json.tool
# Examen unidad 1, Git esencial, Japonés sencillo, Programación en C sencilla; "siguiente": null

# B3. Búsqueda de 101 caracteres → 400; de 100 → 200
curl -s -w ' %{http_code}\n' -b galletas.txt -G --data-urlencode "q=$(python3 -c "print('a'*101)")" $API/cursos
# {"error":"La búsqueda puede tener hasta 100 caracteres."} 400
curl -s -w ' %{http_code}\n' -b galletas.txt -G --data-urlencode "q=$(python3 -c "print('a'*100)")" $API/cursos
# {"cursos":[],"siguiente":null} 200

# B4. Nunca más de 10: corre C2 y luego
curl -s -b galletas.txt "$API/cursos?limite=50" | cuantos                    # 10 cursos; siguiente: <cursor>
SIG=$(curl -s -b galletas.txt $API/cursos | siguiente)
curl -s -b galletas.txt -G --data-urlencode "despues=$SIG" $API/cursos | cuantos   # 10 cursos; siguiente: <cursor>

# B5. Cursor inválido → 400
curl -s -w ' %{http_code}\n' -b galletas.txt "$API/cursos?despues=no-es-un-cursor"
# {"error":"No se pudieron cargar más cursos. Vuelve a buscar."} 400

# B6. Un curso no publicado responde igual que uno que no existe
ID=$(psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM curso WHERE titulo = 'Curso en borrador';")
curl -s -w ' %{http_code}\n' -b galletas.txt $API/cursos/$ID
curl -s -w ' %{http_code}\n' -b galletas.txt $API/cursos/no-existe
# los dos: {"error":"Este curso no existe o ya no está disponible."} 404

# B7. Detalle publicado
ID=$(psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM curso WHERE titulo = 'Git esencial';")
curl -s -b galletas.txt $API/cursos/$ID | python3 -m json.tool
# "cantidadLecciones": 6 y las lecciones con posicion 1 a 6
```

Vuelve al estado inicial (`npm run bd:sembrar`) antes de la sección 3.

## 3. Criterios de la spec

Empieza cada criterio en el estado inicial, salvo que diga otra cosa. En la
web, la dirección del detalle es `/cursos/<id>` (el id sale de C1 o de la
barra de direcciones).

### Catálogo

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Con sesión, el catálogo es el inicio | Entra. Web: mira `/`. Móvil: mira la primera pestaña | Web: el catálogo en `/`. Móvil: pestaña "Explorar" con el catálogo. En ninguno aparece "Hola, ..." |
| [web, móvil] Orden de los cuatro cursos | Mira el catálogo | "Examen unidad 1", "Git esencial", "Japonés sencillo", "Programación en C sencilla" |
| [web, móvil] Contenido de la tarjeta | Mira la tarjeta de "Git esencial". Corre C3 con "Una sola lección" y con "Sin lecciones todavía"; recarga (web) o desliza hacia abajo (móvil) | Portada, título, "Por Equipo Brote", inicio de la descripción y "6 lecciones". "Una sola lección" dice "1 lección"; "Sin lecciones todavía" dice "Sin lecciones" |
| [web, móvil] Portada | Mira "Japonés sencillo". Corre C3 con "¿Cómo se dice hola?" y recarga. Anota el color de cada uno; abre su detalle; recarga; ábrelo en el otro cliente | "J" y "C" sobre un color. Cada curso tiene el mismo color en la tarjeta, en el detalle, después de recargar y en el otro cliente |
| [web, móvil] Descripción cortada | Mira la tarjeta de "Examen unidad 1" y ábrela | En la tarjeta, tres líneas que terminan en "…"; en el detalle, la descripción completa |
| [web, móvil] Borrador y revisión no aparecen | Entra con `autor@brote.test`. Busca "Curso en borrador" y luego "Curso en revisión" | No aparecen en el catálogo; las dos búsquedas muestran "No hay cursos que coincidan con «...»." |
| [web, móvil] Sin cursos publicados | Corre C5; recarga (web) o desliza hacia abajo (móvil) | "Todavía no hay cursos publicados." y no hay buscador |
| [web, móvil] HTML como texto | Corre C3 con el título `Texto <b>hola</b> <script>`. Mira su tarjeta y su detalle | Se lee `<b>hola</b>` y `<script>` tal cual, sin negritas; no se ejecuta nada (en la web, sin alertas ni errores en la consola) |

### Búsqueda

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Busca mientras escribes | Escribe `git` y no pulses nada más | La lista cambia sola: solo "Git esencial" |
| [web, móvil] Sin mayúsculas ni acentos | Busca `JAPONES`; luego `programacion` | "Japonés sencillo"; luego "Programación en C sencilla" |
| [web, móvil] Busca en la descripción | Busca `flexbox` | "Examen unidad 1" |
| [web, móvil] Parte de palabra y en desorden | Busca `sencill`; luego `sencillo japones` | "Japonés sencillo" y "Programación en C sencilla"; luego solo "Japonés sencillo" |
| [web, móvil] Por nombre del autor | Busca `Equipo Brote`; luego `git equipo brote`. Corre C3 con "Huerto en casa" (es de `autor2@`, que también se llama "Equipo Brote"), recarga y busca `Equipo Brote` | Los cuatro cursos; luego solo "Git esencial"; al final, los cuatro más "Huerto en casa" |
| [web, móvil] Sin resultados | Busca `cocina`; pulsa "Borrar búsqueda" | "No hay cursos que coincidan con «cocina»." y "Borrar búsqueda"; después, el buscador vacío y los cuatro cursos |
| [web, móvil] Espacios y 100 caracteres | Escribe solo espacios. Luego pega `python3 -c "print('a'*120)"` en el buscador | Con espacios, los cuatro cursos. El buscador se queda con 100 "a" |
| [web, móvil] Gana el último texto | Escribe `japo`, bórralo y escribe `git` de corrido (en la web, con "3G lento") | Al final, solo "Git esencial" |
| [web, móvil] "Buscando" | Pausa el backend (`kill -STOP`) y escribe `git`; luego `kill -CONT` | Mientras tanto, la lista anterior atenuada y un indicador junto al buscador; la lista no desaparece. Al reanudar, solo "Git esencial" |
| [backend] Autoridad del servidor | Sección 2, B1 y B3 | 101 caracteres: 400; sin sesión: 401 en las dos rutas |
| [backend] Borrador igual que inexistente | Sección 2, B6 | Mismo estado y mismo cuerpo |

### De 10 en 10

Corre C2 antes de cada uno (25 publicados).

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Tres cargas | Web: pulsa "Ver más" dos veces. Móvil: baja hasta el final dos veces | Primero 01 a 10; luego 11 a 20; luego 21, Examen, Git, Japonés y Programación (25, ninguno repetido). Ya no se cargan más; en la web, "Ver más" desaparece |
| [web, móvil] Búsqueda de 10 en 10 | Busca `curso de prueba`; carga más dos veces; borra la búsqueda | 10, luego 20, luego 21; al borrar, Curso de prueba 01 a 10 |
| [web, móvil] Una sola carga a la vez | Web: con "3G lento", pulsa "Ver más" varias veces seguidas. Móvil: pausa el backend, baja al final y sigue deslizando; luego `kill -CONT` | Se agregan solo los 10 siguientes (11 a 20), sin repetidos. En la web, "Ver más" queda deshabilitado mientras carga |
| [web, móvil] Retirar a mitad de la lista | Con los primeros 10 cargados, corre C4 con `Curso de prueba 03` y carga más | Aparecen 11 a 20, sin repetidos y sin que falte ninguno; "Curso de prueba 03" sigue en pantalla hasta recargar |
| [web, móvil] Error al cargar más | Con 10 cargados, apaga el backend y pide más; enciéndelo y pulsa "Reintentar" | Los 10 siguen en pantalla y al final aparece "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." con "Reintentar". Al reintentar, se agregan 11 a 20 |
| [backend] Nunca más de 10 | Sección 2, B4 | 10 cursos aunque se pidan 50 |

### Detalle

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Detalle completo | Abre "Git esencial" | Portada, título, "Por Equipo Brote", la descripción completa, "6 lecciones" y de "1. ¿Qué es el control de versiones?" a "6. Resolviendo conflictos" |
| [web, móvil] Sin lecciones | Corre C3 con "Sin lecciones todavía"; recarga y ábrelo | "Este curso todavía no tiene lecciones." |
| [web, móvil] Volver con la búsqueda | Busca `git`, abre "Git esencial" y vuelve atrás | El buscador dice `git` y solo está "Git esencial" |
| [web, móvil] Volver con lo cargado | Corre C2. Carga 20 cursos, abre "Curso de prueba 20" y vuelve | Siguen los 20 cargados, en la misma posición de la lista |
| [web] Recargar | Con `git` buscado, recarga. Corre C2, carga 20 y recarga. Abre un detalle y recarga | `git` y solo "Git esencial"; luego solo los primeros 10; el detalle sigue mostrando el mismo curso |
| [web] Detalle sin sesión | En una ventana privada abre `/cursos/<id de Git esencial>`; entra | Llegas a ese detalle |
| [web] Identificador inventado | Abre `/cursos/no-existe`; pulsa "Ver cursos" | "Este curso no existe o ya no está disponible." y "Ver cursos", que lleva al catálogo |
| [web, móvil] Curso retirado | Con el catálogo cargado, corre C4 con "Git esencial" y pulsa su tarjeta; vuelve y recarga | "Este curso no existe o ya no está disponible."; al recargar ya no está en el catálogo |

### Estados

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Indicador de carga | Pausa el backend y recarga la web, o abre la app (con sesión); luego `kill -CONT`. Haz lo mismo al abrir un detalle | Un indicador de carga; "Todavía no hay cursos publicados." nunca aparece |
| [web, móvil] Servidor apagado | Con el catálogo abierto, apaga el backend. Busca `git`; luego borra y abre un curso. Enciende el backend y pulsa "Reintentar" | "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y "Reintentar"; `git` sigue en el buscador. Al reintentar, los cursos o el detalle |
| [móvil] Sin conexión | Modo avión: busca, desliza hacia abajo y abre un curso. Quita el modo avión y pulsa "Reintentar" | "Sin conexión. Revisa tu conexión e inténtalo de nuevo." y "Reintentar"; después, los datos |
| [móvil] Deslizar para recargar | Con el catálogo abierto, corre C3 con "Una sola lección" y desliza hacia abajo. Luego apaga el backend y vuelve a deslizar | Aparece "Una sola lección" y la lista empieza otra vez desde el primero. Con el backend apagado, los cursos siguen en pantalla junto al mensaje de error |
| [web, móvil] Sesión expirada | Busca `git` (web) y abre un curso en el otro cliente. Corre `./expirar`. Web: borra una letra del buscador. Móvil: desliza hacia abajo. Entra | "Entrar" con "Tu sesión terminó. Vuelve a entrar.". En la web, al entrar regresas a `/?q=gi` con esa búsqueda; repite estando en un detalle y regresas a ese detalle |

## 4. Antes del PR

- `npm run tipos` y `npm run lint` en los tres repos de código.
- `npm run contrato:revisar` en `brote_specs`.
- `npm run bd:sembrar` deja la base como al principio.
- Marca los criterios en `spec.md` y enlista en cada PR los que cubre.
