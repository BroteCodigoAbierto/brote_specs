# Guía de validación: F03 Cursar una lección

Cómo levantar los tres repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). La feature está terminada cuando todos están marcados
(principio VIII). Rutas y respuestas en [contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: los de F01 y F02 (Node 24, PostgreSQL, Expo Go para el SDK 58).
Cada repo en su rama `feature/F03-cursar-leccion`.

```bash
# brote_specs: copiar el contrato 0.4.0 y comprobar las copias
npm run contrato:copiar && npm run contrato:revisar

# brote_backend_express
npm install
npm run bd:migrar          # columna leccion.actividades
                           # si el usuario no puede crear bases: npx prisma migrate deploy
npm run bd:generar         # Prisma 7 no regenera el cliente al migrar
npm run bd:sembrar         # cuentas, cursos y actividades de prueba (sección 1.1)
npm run dev                # API en http://localhost:3000

# brote_web_react
npm run dev                # http://localhost:5173

# brote_mobile_expo
npx expo start             # abrir con Expo Go
```

### 1.1 Datos de prueba

`npm run bd:sembrar` deja el mismo estado inicial que en F02 (cuentas
`autor@brote.test` y `autor2@brote.test`, contraseña `brote12345`; los cuatro
cursos del prototipo publicados y los extra sin publicar). Ahora además:

- Las lecciones de los cuatro cursos del prototipo tienen sus actividades de
  los cinco tipos, en el orden del prototipo (research.md, punto 6).
- Hay un curso más, **"Actividades de prueba"** (de `autor@`), **sin
  publicar**, con tres lecciones:

  | # | Lección | Actividades |
  |---|---|---|
  | 1 | Respuestas con acentos | Un completar espacios: "Sinónimo de pieza musical: ___", que acepta "canción" y "tema" |
  | 2 | Textos con etiquetas | Una de cada tipo, con `<b>hola</b>` y `<script>alert(1)</script>` en todos sus textos |
  | 3 | Lección sin actividades | Ninguna |

Lecciones del prototipo que usan los criterios, con lo que tienen después de
quitar los tipos fuera de alcance:

| Curso, lección | Actividades, en orden |
|---|---|
| Git esencial, 1. ¿Qué es el control de versiones? | Teoría "El problema que resuelve Git", tarjeta "¿Qué es un repositorio (repo)?", tarjeta "¿Qué es un commit?", teoría "Las tres áreas de Git", opción múltiple "¿Cuál de estas afirmaciones es correcta?", opción múltiple "¿Qué zona de Git contiene…?" |
| Git esencial, 2. Tu primer commit | Teoría |
| Git esencial, 3. Viajar en el tiempo | Teoría, opción múltiple "En el diff de arriba, ¿qué línea se eliminó…?" (con diff), teoría, opción múltiple |
| Git esencial, 6. Resolviendo conflictos | Teoría, teoría, completar espacios con dos espacios ("HEAD" y "======="), pregunta abierta |
| Programación en C sencilla, 1. Primeros pasos | Opción múltiple "¿Cuál es la forma correcta de declarar un entero en C?" (correcta: `int x;`), completar espacios `___ main() {` ("int"), pregunta abierta "¿Por qué en C hay que declarar el tipo…?" |
| Japonés sencillo, 1. Hiragana: las vocales | Opción múltiple con símbolos "あ", "い", "う"; tarjeta "お" |
| Examen unidad 1, 1. Formularios: label e input | Empieza con la teoría "El atributo for de <label>" (con código de dos líneas) |
| Examen unidad 1, 3. Enlaces, imágenes y accesibilidad | Empieza con la teoría `target="_blank" y rel="noopener"` (con una línea de código larga) |

### 1.2 Atajos

`bd` es el de F01 y F02:

```bash
bd() { psql -X -q postgresql://brote:brote@localhost:5432/brote; }
# o, sin psql, dentro del contenedor (desde brote_backend_express)
# bd() { podman compose exec -T postgres psql -X -q -U brote -d brote; }

# id de un curso y de una de sus lecciones, por título del curso y posición
idCurso() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM curso WHERE titulo = '$1';"; }
idLeccion() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT l.id FROM leccion l JOIN curso c ON c.id = l.id_curso WHERE c.titulo = '$1' AND l.posicion = $2;"; }
```

```bash
# L1. Publicar "Actividades de prueba"
bd <<'SQL'
UPDATE curso SET publicado = true WHERE titulo = 'Actividades de prueba';
SQL

# L2. Retirar "Git esencial"
bd <<'SQL'
UPDATE curso SET publicado = false WHERE titulo = 'Git esencial';
SQL

# L3. Cuántas actividades tiene cada lección del prototipo, y de qué tipos
bd <<'SQL'
SELECT c.titulo, l.posicion, jsonb_array_length(l.actividades) AS n,
       (SELECT string_agg(a->>'tipo', ' ') FROM jsonb_array_elements(l.actividades) a) AS tipos
FROM leccion l JOIN curso c ON c.id = l.id_curso
WHERE c.publicado ORDER BY c.titulo, l.posicion;
SQL
```

En la web, la dirección de una lección es
`/cursos/$(idCurso '<curso>')/lecciones/$(idLeccion '<curso>' <posición>)`.

Para pausar el backend sin apagarlo (y ver "cargando"): `kill -STOP <pid>`
del `npm run dev`, y luego `kill -CONT <pid>`. Para expirar la sesión:
`./expirar` desde `brote_specs`. Para "reducir movimiento": en la web,
DevTools → Renderizado → "Emular prefers-reduced-motion: reduce" (o la
opción del sistema); en el teléfono, Ajustes → Accesibilidad → "Reducir
movimiento" (iOS) o "Quitar animaciones" (Android).

## 2. Backend con curl

Corre estas primero: comprueban la autoridad del servidor sin ningún cliente.

```bash
API=http://localhost:3000
J='Content-Type: application/json'
GIT=$(idCurso 'Git esencial'); GIT1=$(idLeccion 'Git esencial' 1)

# B1. Sin sesión → 401, aunque los identificadores no existan
curl -s -w ' %{http_code}\n' $API/cursos/$GIT/lecciones/$GIT1
curl -s -w ' %{http_code}\n' $API/cursos/no-existe/lecciones/tampoco
# {"error":"Tu sesión terminó. Vuelve a entrar."} 401  (las dos)

# Entrar y guardar la cookie
curl -s -c galletas.txt -X POST $API/sesiones -H "$J" -d '{"correo":"autor@brote.test","contrasena":"brote12345"}'

# B2. Lección publicada: seis actividades en orden
curl -s -b galletas.txt $API/cursos/$GIT/lecciones/$GIT1 | python3 -c "
import json,sys; l=json.load(sys.stdin)['leccion']; print(l['titulo'], l['posicion']); print([a['tipo'] for a in l['actividades']])"
# ¿Qué es el control de versiones? 1
# ['teoria', 'tarjeta', 'tarjeta', 'teoria', 'opcionMultiple', 'opcionMultiple']

# B3. Lección de un curso sin publicar → igual que una que no existe
BOR=$(idCurso 'Curso en borrador'); BOR1=$(idLeccion 'Curso en borrador' 1)
curl -s -w ' %{http_code}\n' -b galletas.txt $API/cursos/$BOR/lecciones/$BOR1
curl -s -w ' %{http_code}\n' -b galletas.txt $API/cursos/$GIT/lecciones/no-existe
# los dos: {"error":"Esta lección no existe o ya no está disponible."} 404

# B4. Lección de otro curso → 404
C1=$(idLeccion 'Programación en C sencilla' 1)
curl -s -w ' %{http_code}\n' -b galletas.txt $API/cursos/$GIT/lecciones/$C1
# {"error":"Esta lección no existe o ya no está disponible."} 404

# B5. Ninguna actividad fuera de los cinco tipos
bd <<'SQL'
SELECT count(*) AS fuera_de_alcance FROM leccion l, jsonb_array_elements(l.actividades) a
WHERE a->>'tipo' NOT IN ('teoria', 'tarjeta', 'opcionMultiple', 'completarEspacios', 'preguntaAbierta');
SQL
# 0

# B6. El sembrado valida: una actividad inválida hace fallar bd:sembrar sin cambiar la base.
# En scripts/actividades-prototipo.ts cambia temporalmente un "correcta": 0 por 7 y corre
#   npm run bd:sembrar
# Falla con un mensaje que dice el curso, la lección y "correcta"; la consulta L3 da lo mismo
# que antes. Deshaz el cambio (git checkout del archivo).
```

## 3. Criterios de la spec

Empieza cada criterio en el estado inicial (`npm run bd:sembrar`), salvo que
diga otra cosa. Para los de "Actividades de prueba", corre antes L1.

### Abrir y recorrer

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Abrir desde el detalle | Abre "Git esencial" y pulsa "1. ¿Qué es el control de versiones?" | La X, la barra de progreso vacía y la teoría "El problema que resuelve Git". En el móvil no se ve la barra de pestañas; en la web, no se ve el encabezado de la marca |
| [web, móvil] Recorrer en orden | Recorre esa lección hasta el final (voltea las tarjetas y responde las preguntas) | El orden de la tabla 1.1. La barra avanza un paso con cada "Continuar" (6 pasos) y en la pantalla final está llena |
| [web, móvil] Sin tipos fuera de alcance | Abre "2. Tu primer commit". Corre L3 | Solo una teoría y luego la pantalla final. L3 solo muestra los cinco tipos |
| [web, móvil] Sin atrás ni saltos | En la lección 1, busca cómo volver a la actividad anterior o pasar a la siguiente sin "Continuar" (deslizar, flechas, Tab, el botón de volver) | No hay forma: el botón de volver es salir (ver "Salir") |
| [web] Recargar y abrir directo | A mitad de la lección 1, recarga. Copia la dirección, ciérrala y ábrela en otra pestaña | Las dos veces empieza en la teoría "El problema que resuelve Git", con la barra vacía |
| [web] Lección sin sesión | En una ventana privada abre la dirección de la lección 1 de Git esencial; entra con `autor@brote.test` | Llegas a esa lección, desde la primera actividad |

### Teoría

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Partes de la teoría | Mira la primera actividad de Git esencial, 1 | El título, dos párrafos y tres puntos clave en lista. "Continuar" habilitado desde el principio |
| [web, móvil] `<label>` como texto | Abre Examen unidad 1, 1 | El título dice "El atributo for de <label>" y el texto muestra `<label>` tal cual. El código, en letra monoespaciada, con sus dos líneas |
| [web, móvil] Diff | Abre Git esencial, 3 y avanza a la pregunta "En el diff de arriba, ¿qué línea se eliminó…?" | `-  <title>Mi app</title>` resaltada como eliminada, las dos líneas con `+` como agregadas y `@@ -1,5 +1,6 @@` como encabezado |
| [móvil] Línea larga | Abre Examen unidad 1, 3 | La línea `<a href="https://ejemplo.com" target="_blank" rel="noopener">Ir al sitio</a>` no se corta; deslizando el bloque hacia la izquierda se ve completa |

### Tarjeta de memoria

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Voltear | En Git esencial, 1, llega a "¿Qué es un commit?". Mira "Continuar"; pulsa la tarjeta; púlsala otra vez | "Continuar" deshabilitado al principio. Al pulsar: el reverso "Una fotografía guardada del proyecto en un momento dado…" y "Continuar" habilitado. Al pulsar otra vez: el frente (y "Continuar" sigue habilitado) |
| [web] Con el teclado | Con Tab, lleva el foco a la tarjeta; pulsa Enter y luego la barra espaciadora | Se voltea con cada una |

### Opción múltiple

En Git esencial, 1, llega a "¿Cuál de estas afirmaciones es correcta?" (es la
quinta actividad).

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Elegir y cambiar | Mira "Comprobar"; elige una opción y luego otra | "Comprobar" deshabilitado hasta elegir. La selección pasa de una a otra |
| [web, móvil] Acertar | Elige "Un commit es una fotografía del proyecto en un momento dado" y comprueba | Esa opción marcada como correcta (verde, con palomita); la barra inferior dice "¡Correcto!" |
| [web, móvil] Fallar | Vuelve a abrir la lección; elige "Un commit borra el historial anterior" y comprueba. Intenta elegir otra | La elegida marcada como incorrecta (roja, con X, se sacude); la correcta marcada como correcta; la barra dice "Respuesta correcta: Un commit es una fotografía del proyecto en un momento dado". Las opciones ya no cambian y el botón dice "Continuar" |
| [web, móvil] Mezcladas | Abre la lección cinco veces y anota el orden de las opciones de esa pregunta | No es siempre el mismo, y la correcta no siempre está arriba |
| [web, móvil] Símbolos | Abre Japonés sencillo, 1 | Tres mosaicos con "あ", "い" y "う" en grande |
| [web] Con el teclado | En la pregunta de Git esencial, pulsa 1, 2 y 3; luego Enter; luego Enter otra vez | Cada número elige la opción que está en ese lugar en pantalla. El primer Enter comprueba; el segundo pasa a la siguiente actividad |

### Completar espacios

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Texto y espacio | En C, 1, responde la opción múltiple y continúa. Mira "Comprobar"; escribe solo espacios | El texto en tres líneas (`___ main() {`, `  return 0;` con su sangría, `}`) con un campo en lugar de `___`. "Comprobar" deshabilitado vacío y con solo espacios |
| [web, móvil] Acierto sin mayúsculas | Escribe ` INT ` (con espacios) y comprueba | El espacio correcto y "¡Correcto!" |
| [web, móvil] Fallo | Vuelve a abrir la lección hasta ese punto; escribe `float` y comprueba; intenta editar | El espacio incorrecto con "int" a su lado. La barra muestra "Respuesta correcta:" con el texto completo y "int" en el espacio. El campo ya no se puede editar |
| [web, móvil] Dos espacios | En Git esencial, 6, llega a los espacios. Escribe solo `head` en el primero; luego `=====` en el segundo; comprueba | Con un espacio vacío, "Comprobar" deshabilitado. Al comprobar: el primero correcto, el segundo incorrecto con "=======" al lado, y la barra con la respuesta correcta (cuenta como fallada) |
| [web, móvil] Varias aceptadas y acentos | Corre L1. Abre "Actividades de prueba", 1. Prueba `Cancion`, `CANCIÓN`, `tema` y `canción  ` (dos espacios al final), cada una abriendo otra vez la lección; luego `canciones` | Las cuatro primeras: "¡Correcto!". `canciones`: incorrecto, con "canción" al lado |
| [web, móvil] 100 caracteres | En cualquier espacio, pega `python3 -c "print('a'*120)"` | El campo se queda con 100 "a" |
| [web] Tab y Enter | En Git esencial, 6, escribe en el primer espacio, pulsa Tab, escribe en el segundo y pulsa Enter | Tab lleva al segundo espacio; Enter comprueba |

### Pregunta abierta

En C, 1, llega a "¿Por qué en C hay que declarar el tipo de una variable
antes de usarla?" (la tercera).

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Hay que escribir | Mira "Comprobar"; escribe solo espacios | Deshabilitado en los dos casos |
| [web, móvil] Ver la solución | Escribe una respuesta y comprueba; intenta editarla | Tu respuesta sigue visible y no se edita. Aparece "Solución de referencia" con "Porque C es un lenguaje de tipado estático…", "¿La tuviste bien?", "La tuve bien" y "No la tuve". No hay "Continuar" hasta elegir |
| [web, móvil] Autoevaluarse | Elige "La tuve bien"; termina la lección y mira los aciertos. Repite eligiendo "No la tuve" | "¡Correcto!" y cuenta como acierto; luego "A repasar" y no cuenta (la pantalla final dice uno menos) |
| [web, móvil] 2000 caracteres | Pega `python3 -c "print('a'*2100)"` en el campo | Se queda con 2000 "a" |

### Lección completada

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Aciertos | En C, 1: elige `int x;`, escribe `float` en el espacio y elige "La tuve bien" | "¡Lección completada!", "Primeros pasos", "Acertaste 2 de 3" y una celebración breve |
| [web, móvil] Sin preguntas | Termina Git esencial, 2 | "¡Lección completada!" y "Tu primer commit", sin "Acertaste…" |
| [web, móvil] Volver y empezar de nuevo | Pulsa "Volver al curso"; abre otra vez la misma lección | El detalle del curso; la lección empieza desde la primera actividad, sin respuestas |
| [web, móvil] Reducir movimiento | Activa "reducir movimiento" y recorre C, 1, fallando la opción múltiple | La barra avanza, la opción incorrecta no se sacude y la pantalla final aparece sin animación |

### Salir

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Sin haber hecho nada | Abre Git esencial, 1 y pulsa la X | El detalle del curso, sin preguntar |
| [web, móvil] Con algo hecho | Abre C, 1 y elige una opción. Pulsa la X; pulsa "Seguir aquí". Pulsa la X otra vez y "Salir". Repite después de pasar a la segunda actividad | "¿Salir de la lección?" con "Perderás tu avance en esta lección.", "Salir" y "Seguir aquí". "Seguir aquí" deja la misma actividad con la opción elegida; "Salir" lleva al detalle. Igual en la segunda actividad |
| [web] Botón del navegador | Con una opción elegida, pulsa el botón de volver del navegador; luego "Salir" | La misma pregunta; "Salir" lleva al detalle |
| [móvil] Atrás del teléfono | Con una opción elegida: en Android, el botón o gesto de atrás; en iOS, desliza desde el borde izquierdo | La misma pregunta; "Salir" lleva al detalle |

### Contenido y acceso

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] HTML como texto | Corre L1. Abre "Actividades de prueba", 2 y recórrela | En cada actividad se lee `<b>hola</b>` y `<script>alert(1)</script>` tal cual, sin negritas; no se ejecuta nada (en la web, sin alertas ni errores en la consola) |
| [web, móvil] Sin actividades | Corre L1. Abre "Actividades de prueba", 3 | "Esta lección todavía no tiene actividades." y "Volver al curso", que lleva al detalle |
| [web] Dirección inventada | Abre `/cursos/<id de Git esencial>/lecciones/no-existe`; luego `/cursos/<id de Git esencial>/lecciones/<id de C, 1>`; pulsa "Ver cursos" | Las dos: "Esta lección no existe o ya no está disponible." y "Ver cursos", que lleva al catálogo |
| [backend] Autoridad del servidor | Sección 2, B1, B3 y B4 | Sin sesión: 401. Curso sin publicar, lección inexistente y lección de otro curso: el mismo 404 |

### Estados

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Indicador de carga | Pausa el backend (`kill -STOP`) y abre una lección; luego `kill -CONT` | La X y un indicador de carga; "Esta lección todavía no tiene actividades." nunca aparece |
| [web, móvil] Servidor apagado | Apaga el backend y abre una lección. Enciéndelo y pulsa "Reintentar" | "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y "Reintentar"; después, la primera actividad |
| [móvil] Sin conexión | Modo avión: abre una lección. Quita el modo avión y pulsa "Reintentar" | "Sin conexión. Revisa tu conexión e inténtalo de nuevo." y "Reintentar"; después, la primera actividad |
| [web, móvil] Perder la conexión a mitad | Abre C, 1. Apaga el backend (en el móvil, o activa el modo avión) y termina la lección | Se puede comprobar y continuar hasta "¡Lección completada!" |
| [web, móvil] Sesión expirada | En el detalle de Git esencial, corre `./expirar` y abre la lección 1. Entra | "Entrar" con "Tu sesión terminó. Vuelve a entrar.". En la web, al entrar regresas a esa lección |

## 4. Antes del PR

- `npm run tipos` y `npm run lint` en los tres repos de código.
- `npm run contrato:revisar` en `brote_specs`.
- `npm run bd:sembrar` deja la base como al principio (con "Actividades de
  prueba" sin publicar).
- Repite los criterios de F02 "Orden de los cuatro cursos" y "Volver con lo
  cargado": la lección no debe cambiar el catálogo, y el catálogo debe seguir
  cargado después de abrir una lección y volver.
- Marca los criterios en `spec.md` y enlista en cada PR los que cubre.
