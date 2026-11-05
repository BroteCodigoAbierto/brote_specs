# Guía de validación: F11 Actividades de relacionar

Cómo levantar los repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). La feature está terminada cuando todos están marcados
(principio VIII). Lo que acepta y rechaza el servidor está en
[contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: los de F01 a F06 (Node 24, PostgreSQL, Chrome y Expo Go para el SDK 58, en un
teléfono). Cada repo en su rama `feature/F11-actividades-relacionar`.

```bash
# brote_specs: copiar el contrato 0.8.0 y comprobar las copias
npm run contrato:copiar && npm run contrato:revisar

# brote_backend_express (no hay migración)
npm install
npm run bd:sembrar         # borra el progreso de las cuentas @brote.test
npm run dev                # API en http://localhost:3000

# brote_web_react
npm run dev                # http://localhost:5173

# brote_mobile_expo
npx expo start             # abrir con Expo Go
```

### 1.1 Datos de prueba

`npm run bd:sembrar` deja las cuentas de F05 (`creador@`, `creador2@` y `autor@`, en
`brote.test`, con la contraseña `brote12345`) y los cuatro cursos del prototipo con sus
120 actividades. "Actividades de prueba" gana tres lecciones al final:

| Lección | Qué tiene |
|---|---|
| 4. Relacionar con etiquetas | Una actividad de cada tipo con `<b>hola</b>` y `<script>alert(1)</script>` en todos sus textos |
| 5. Fichas que se repiten | Banco "Mis colores favoritos son ___ y ___." (fichas `rojo`, `azul` y `verde`; los dos espacios aceptan `rojo` y `azul`) y banco `___ doble(___ x)` (fichas `int`, `int` y `char`; los dos aceptan `int`) |
| 6. Relacionar al límite | Emparejar con 8 parejas, clasificar con 12 elementos y 4 categorías, ordenar con 10 elementos y banco con 10 espacios y 20 fichas, con textos largos |

Publícalo antes de los criterios que lo citan (L1) y retíralo al terminar.

Para los criterios del editor, con la cuenta A, crea el curso "Huerto urbano" y una lección
"Semillas". Si un criterio pide actividades completas, usa estos textos:

| Tipo | Campos |
|---|---|
| Emparejar | "Riego" / "Agua", "Abono" / "Nutrientes", "Poda" / "Forma" |
| Clasificar | Categorías: "Hortaliza" y "Fruta". Elementos: "Lechuga" (Hortaliza) y "Manzana" (Fruta) |
| Ordenar | Consigna: "Ordena los pasos.". Elementos: "Sembrar", "Regar" y "Cosechar" |
| Banco de palabras | Texto: "La semilla necesita ___". Fichas: "agua" y "sal". Espacio 1: "agua" |

### 1.2 Atajos

`bd`, `idCurso` e `idLeccion` son los de F03:

```bash
bd() { psql -X -q postgresql://brote:brote@localhost:5432/brote; }
idCurso() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM curso WHERE titulo = '$1';"; }
idLeccion() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT l.id FROM leccion l JOIN curso c ON c.id = l.id_curso WHERE c.titulo = '$1' AND l.posicion = $2;"; }

# L1. Publicar y retirar "Actividades de prueba"
bd <<< "UPDATE curso SET publicado = true  WHERE titulo = 'Actividades de prueba';"
bd <<< "UPDATE curso SET publicado = false WHERE titulo = 'Actividades de prueba';"

# P1. Publicar "Huerto urbano", como lo hace un administrador
bd <<< "UPDATE curso SET publicado = true WHERE titulo = 'Huerto urbano';"

# P2. Las actividades guardadas de una lección
bd <<'SQL'
SELECT jsonb_pretty(l.actividades)
FROM leccion l JOIN curso c ON c.id = l.id_curso
WHERE c.titulo = 'Huerto urbano' AND l.posicion = 1;
SQL
```

Para llegar a una actividad que no es la primera, responde lo que sea en las anteriores.
"Pulsar" es con el ratón en la web y con el dedo en el móvil. "Arrastrar" es con el ratón en
la web; en el móvil, mantén pulsado un momento antes de mover el dedo.

## 2. Backend con curl

Corre estas primero: comprueban la autoridad del servidor sin ningún cliente.

```bash
API=http://localhost:3000
J='Content-Type: application/json'

# B1. Las actividades de los cuatro cursos de prueba
bd <<'SQL'
SELECT a->>'tipo' AS tipo, count(*)
FROM leccion l
JOIN curso c ON c.id = l.id_curso
CROSS JOIN LATERAL jsonb_array_elements(l.actividades) a
WHERE c.titulo IN ('Git esencial', 'Japonés sencillo', 'Programación en C sencilla', 'Examen unidad 1')
GROUP BY 1 ORDER BY 1;
SQL
# bancoPalabras 3, clasificar 9, completarEspacios 13, emparejar 9, opcionMultiple 28,
# ordenar 6, preguntaAbierta 17, tarjeta 9, teoria 26

# Un curso y una lección para probar
curl -s -o /dev/null -c a.txt -X POST $API/sesiones -H "$J" \
  -d '{"correo":"creador@brote.test","contrasena":"brote12345"}'
curl -s -o /dev/null -b a.txt -X POST $API/editor/cursos -H "$J" -d '{"titulo":"Curl","descripcion":"Prueba"}'
CURL=$(idCurso 'Curl')
curl -s -o /dev/null -b a.txt -X POST $API/editor/cursos/$CURL/lecciones -H "$J" -d '{"titulo":"Uno"}'
UNO=$(idLeccion 'Curl' 1)
LECCION=$API/editor/cursos/$CURL/lecciones/$UNO
guardar() { curl -s -w ' %{http_code}\n' -b a.txt -X PUT $LECCION -H "$J" -d "{\"titulo\":\"Uno\",\"version\":1,\"actividades\":[$1]}"; }
lista() { node -p "JSON.stringify(Array.from({length:$1},(_,i)=>$2))"; }

# De B2 a B7, cada una responde {"error":"Revisa los datos marcados.","campos":{"actividades.0":"…"}} 400

# B2. Emparejar: 2 parejas, 9 parejas y un texto repetido en una columna
guardar "{\"tipo\":\"emparejar\",\"parejas\":$(lista 2 "({izquierda:'a'+i,derecha:'b'+i})")}"
guardar "{\"tipo\":\"emparejar\",\"parejas\":$(lista 9 "({izquierda:'a'+i,derecha:'b'+i})")}"
guardar '{"tipo":"emparejar","parejas":[{"izquierda":"a","derecha":"1"},{"izquierda":" a ","derecha":"2"},{"izquierda":"c","derecha":"3"}]}'

# B3. Clasificar: 1 categoría, 5 categorías, 13 elementos, un elemento repetido, sin
# categoría, con una que no existe y una categoría sin elementos
guardar '{"tipo":"clasificar","categorias":["A"],"elementos":[{"texto":"x","categoria":0},{"texto":"y","categoria":0}]}'
guardar '{"tipo":"clasificar","categorias":["A","B","C","D","E"],"elementos":[{"texto":"x","categoria":0},{"texto":"y","categoria":1}]}'
guardar "{\"tipo\":\"clasificar\",\"categorias\":[\"A\",\"B\"],\"elementos\":$(lista 13 "({texto:'x'+i,categoria:i%2})")}"
guardar '{"tipo":"clasificar","categorias":["A","B"],"elementos":[{"texto":"x","categoria":0},{"texto":"x","categoria":1}]}'
guardar '{"tipo":"clasificar","categorias":["A","B"],"elementos":[{"texto":"x","categoria":0},{"texto":"y"}]}'
guardar '{"tipo":"clasificar","categorias":["A","B"],"elementos":[{"texto":"x","categoria":0},{"texto":"y","categoria":2}]}'
guardar '{"tipo":"clasificar","categorias":["A","B"],"elementos":[{"texto":"x","categoria":0},{"texto":"y","categoria":0}]}'

# B4. Ordenar: sin consigna, 2 elementos, 11 elementos y un elemento repetido
guardar '{"tipo":"ordenar","elementos":["a","b","c"]}'
guardar '{"tipo":"ordenar","consigna":"Ordena","elementos":["a","b"]}'
guardar "{\"tipo\":\"ordenar\",\"consigna\":\"Ordena\",\"elementos\":$(lista 11 "'e'+i")}"
guardar '{"tipo":"ordenar","consigna":"Ordena","elementos":["a","b"," a "]}'

# B5. Banco: 11 espacios, 21 fichas, grupos de menos, un espacio sin fichas, una aceptada
# que no está en el banco, y dos espacios que solo aceptan "int" con una sola ficha "int"
ONCE=$(node -p "'___ '.repeat(11)")
guardar "{\"tipo\":\"bancoPalabras\",\"texto\":\"$ONCE\",\"fichas\":$(lista 11 "'f'+i"),\"espacios\":$(lista 11 "({aceptadas:['f'+i]})")}"
guardar "{\"tipo\":\"bancoPalabras\",\"texto\":\"___\",\"fichas\":$(lista 21 "'f'+i"),\"espacios\":[{\"aceptadas\":[\"f0\"]}]}"
guardar '{"tipo":"bancoPalabras","texto":"___ y ___","fichas":["a","b"],"espacios":[{"aceptadas":["a"]}]}'
guardar '{"tipo":"bancoPalabras","texto":"___","fichas":["a","b"],"espacios":[{"aceptadas":[]}]}'
guardar '{"tipo":"bancoPalabras","texto":"___","fichas":["a","b"],"espacios":[{"aceptadas":["c"]}]}'
guardar '{"tipo":"bancoPalabras","texto":"___ y ___","fichas":["int","char"],"espacios":[{"aceptadas":["int"]},{"aceptadas":["int"]}]}'

# B6. Textos largos y un campo que el tipo no tiene
L201=$(node -p "'x'.repeat(201)"); L101=$(node -p "'x'.repeat(101)"); L501=$(node -p "'x'.repeat(501)")
guardar "{\"tipo\":\"emparejar\",\"parejas\":[{\"izquierda\":\"$L201\",\"derecha\":\"1\"},{\"izquierda\":\"b\",\"derecha\":\"2\"},{\"izquierda\":\"c\",\"derecha\":\"3\"}]}"
guardar "{\"tipo\":\"clasificar\",\"categorias\":[\"$L101\",\"B\"],\"elementos\":[{\"texto\":\"x\",\"categoria\":0},{\"texto\":\"y\",\"categoria\":1}]}"
guardar "{\"tipo\":\"ordenar\",\"consigna\":\"$L501\",\"elementos\":[\"a\",\"b\",\"c\"]}"
guardar "{\"tipo\":\"bancoPalabras\",\"texto\":\"___\",\"fichas\":[\"$L101\",\"b\"],\"espacios\":[{\"aceptadas\":[\"b\"]}]}"
guardar '{"tipo":"ordenar","consigna":"Ordena","elementos":["a","b","c"],"pista":"x"}'

# B7. Un tipo que todavía no existe
guardar '{"tipo":"retoCodigo","consigna":"x"}'
# ... "actividad 1 (retoCodigo): tipo desconocido"

bd <<< "SELECT version, actividades FROM leccion WHERE id = '$UNO';"
# 1 | []   (nada de lo anterior se guardó)

# B8. Espacios intercambiables y fichas recortadas → 200
guardar '{"tipo":"bancoPalabras","texto":"___ y ___","fichas":[" rojo ","azul","verde"],"espacios":[{"aceptadas":["rojo","azul"]},{"aceptadas":["rojo","azul"]}]}'
bd <<< "SELECT actividades->0->'fichas', actividades->0->'espacios' FROM leccion WHERE id = '$UNO';"
# ["rojo", "azul", "verde"] | [{"aceptadas": ["rojo", "azul"]}, {"aceptadas": ["rojo", "azul"]}]
```

## 3. Criterios de la spec

Un renglón por criterio, en el orden de la spec. Los marcados `[web, móvil]` se prueban en
los dos, con cualquier cuenta si no se dice otra cosa.

### Cursos de prueba

| Criterio | Pasos | Esperado |
|---|---|---|
| [backend] Las 27 actividades | Corre B1 | `emparejar` 9, `clasificar` 9, `ordenar` 6 y `bancoPalabras` 3 |
| [web, móvil] Orden en la lección | Recorre "Números del 1 al 5" (Japonés sencillo, 3) | Emparejar, opción múltiple, tarjeta y ordenar, en ese orden |
| [web, móvil] Tu primer commit | Recorre "Tu primer commit" (Git esencial, 2) | Su teoría y luego clasificar, con "Clasifica cada comando según lo que afecta." |

### Emparejar

Salvo que se diga otra cosa, en "Remotos: compartir tu trabajo" (Git esencial, 5), después de
su teoría.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Inicio | Llega a emparejar | "Empareja los conceptos"; a la izquierda `git clone <url>`, `git push`, `git pull` y `git fetch`, en ese orden y con `<url>` tal cual; a la derecha sus cuatro descripciones. "Comprobar" deshabilitado |
| [web, móvil] Mezcla | Abre la lección unas seis veces y anota la columna derecha | No siempre el mismo orden, y nunca con cada comando frente a su descripción |
| [web, móvil] Formar pareja | Pulsa `git push` y luego "Sube tus commits locales al remoto". Repite con otra, empezando por la derecha | `git push` queda seleccionado, y al segundo pulso los dos llevan el mismo número. Empezando por la derecha, igual |
| [web, móvil] Mover la selección | Pulsa `git push`, luego `git pull`, y otra vez `git pull` | La selección pasa a `git pull`; al final no hay nada seleccionado |
| [web, móvil] Deshacer | Forma una pareja y pulsa uno de sus dos elementos | Los dos pierden su número |
| [web, móvil] Reemplazar | Une `git push` con una descripción. Pulsa `git pull` y luego esa misma descripción | `git pull` y la descripción forman pareja, y `git push` se queda sin número |
| [web, móvil] Comprobar | Forma tres parejas, luego la cuarta, y deshaz una | Se habilita con la cuarta y se deshabilita al deshacer |
| [web, móvil] Todas bien | Forma las cuatro bien y comprueba | Las ocho marcadas como correctas, "¡Correcto!" y "Continuar". Pulsar un elemento ya no hace nada |
| [web, móvil] Dos cruzadas | Cruza `git pull` y `git fetch`, deja las otras bien y comprueba | Esas dos parejas incorrectas y las otras correctas. "Respuesta correcta:" con `git pull → Descarga y combina los commits nuevos del remoto` y `git fetch → Descarga los commits nuevos sin combinarlos todavía`, cada una en su línea |
| [móvil] Textos largos | Abre "align-items: el eje cruzado" (Examen unidad 1, 7) hasta emparejar | Dos columnas lado a lado, con las descripciones completas en varias líneas, sin "…" |

### Clasificar

Salvo que se diga otra cosa, en "Primeros pasos" (Programación en C sencilla, 1), en la tercera
actividad. Bien: `int`, `char` y `float` en "Tipo de dato"; `if`, `while` y `return` en "Palabra
clave".

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Inicio | Llega a clasificar | "Clasifica cada elemento", seis elementos sin colocar y "Tipo de dato" y "Palabra clave", en ese orden. "Comprobar" deshabilitado |
| [web, móvil] Mezcla | Abre la lección varias veces | Los elementos no salen siempre en el mismo orden |
| [web, móvil] Colocar | Pulsa `if` y luego "Palabra clave". Sin nada seleccionado, pulsa "Tipo de dato" | `if` se selecciona y queda en "Palabra clave". Lo segundo no hace nada |
| [web, móvil] Devolver | Sin nada seleccionado, pulsa `if` ya colocado | Vuelve a los elementos sin colocar |
| [web, móvil] Encima de un elemento | Con `if` en "Palabra clave", pulsa `while` y luego encima de `if` | `while` queda en "Palabra clave", y `if` sigue ahí |
| [web, móvil] Comprobar | Coloca los seis y devuelve uno | Se habilita con el último y se deshabilita al devolver |
| [web, móvil] Todos bien | Clasifica todo bien y comprueba | Todos marcados como correctos y "¡Correcto!" |
| [web, móvil] Uno mal | Pon `if` en "Tipo de dato", los demás bien, y comprueba | `if` incorrecto, los demás correctos, y "Respuesta correcta:" con `if → Palabra clave` |
| [web, móvil] Etiquetas | Abre "Estructura semántica de HTML" (Examen unidad 1, 4) hasta clasificar | "Va dentro de <head>", "Va dentro de <body>", `<title>` y `<article>` se leen tal cual |
| [web] Acomodo | Mira las categorías en una ventana ancha, en una de 400 px y en la vista previa de una lección con clasificar | Lado a lado en la ancha; una debajo de otra en las otras dos |
| [móvil] Acomodo | Mira las categorías | Una debajo de otra |

### Ordenar

Salvo que se diga otra cosa, en "Condicionales y operadores" (Programación en C sencilla, 2), en
la segunda actividad. Bien: `if (x > 5) {`, `printf("Hola");` y `}`.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Inicio | Llega a ordenar | La consigna, tres lugares numerados y vacíos, y los tres elementos, con `printf("Hola");` con su sangría. "Comprobar" deshabilitado |
| [web, móvil] Mezcla | Abre la lección unas seis veces | No siempre el mismo orden, y nunca el correcto |
| [web, móvil] Primer lugar libre | Pulsa un elemento y luego otro. Pulsa un lugar vacío | El primero va al lugar 1 y el segundo, al 2. Pulsar un lugar vacío no hace nada |
| [web, móvil] Devolver | Coloca los tres; pulsa el del lugar 1; pulsa el que quedó sin colocar | Vuelve a los sin colocar, los otros dos no se mueven y "Comprobar" se deshabilita. Después va al lugar 1 |
| [web, móvil] Todo bien | Colócalos en el orden correcto y comprueba | Los tres correctos y "¡Correcto!" |
| [web, móvil] Dos cambiados | Pon bien el lugar 1, cambia el 2 y el 3, y comprueba | Lugar 1 correcto, los otros incorrectos, y "Respuesta correcta:" con las tres líneas numeradas |
| [móvil] Textos largos | Abre "Patrones comunes con Flexbox" (Examen unidad 1, 11) hasta ordenar, equivócate y comprueba | Los elementos se leen completos. El detalle de la barra se desplaza y "Continuar" sigue a la vista |
| [web] Barra con respuesta larga | Corre L1. En "Actividades de prueba", 6, en el ordenar de 10 elementos, pon un orden equivocado y comprueba | El texto de la barra se desplaza y se lee completo. "Continuar" sigue a la vista |

### Banco de palabras

Salvo que se diga otra cosa, en "Funciones" (Programación en C sencilla, 3), en la segunda
actividad. Para los de "Actividades de prueba", corre antes L1 y abre su lección 5.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Inicio | Llega al banco | "Completa con las fichas del banco", `___ suma(int a, int b) {` con un espacio, y `int`, `void` y `char`. "Comprobar" deshabilitado |
| [web, móvil] Mezcla | Abre la lección varias veces | Las fichas no salen siempre en el mismo orden |
| [web, móvil] Colocar y devolver | Pulsa `void`; luego púlsala en el espacio | Sale del banco, queda en el espacio y "Comprobar" se habilita. Vuelve al banco y se deshabilita |
| [web, móvil] Espacio lleno | Con `void` colocada, pulsa `int` | No pasa nada |
| [web, móvil] Correcta | Coloca `int` y comprueba | Espacio correcto y "¡Correcto!" |
| [web, móvil] Incorrecta | Coloca `void` y comprueba | Espacio incorrecto, `int` junto a él, y "Respuesta correcta:" con `int suma(int a, int b) {` |
| [web, móvil] Otro alfabeto | Abre "Saludos" (Japonés sencillo, 2) hasta el banco; coloca `元気` y comprueba | `こんにちは、___ ですか？` se ve con su espacio, y da "¡Correcto!" |
| [web, móvil] Intercambiables | En "Mis colores favoritos son ___ y ___.", prueba "rojo y azul"; abre la lección otra vez y prueba "azul y rojo" | "¡Correcto!" las dos veces |
| [web, móvil] Una sola vez | Coloca `rojo` | Ya no hay otra ficha `rojo` en el banco |
| [web, móvil] Solución coherente | Coloca `verde` en el primero y `rojo` en el segundo, y comprueba | Primero incorrecto con `azul` junto a él, segundo correcto, y "Mis colores favoritos son azul y rojo." |
| [web, móvil] Fichas repetidas | En `___ doble(___ x)`, coloca una `int` en cada espacio y comprueba | El banco tiene dos fichas `int`, y da "¡Correcto!" |

### Arrastrar

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Emparejar | En "Remotos", arrastra `git push` hasta su descripción. Arrastra `git pull` sobre `git fetch` | Forman pareja, como al pulsar. Lo segundo no cambia nada |
| [web, móvil] Clasificar | En "Primeros pasos", arrastra `if` a una categoría, de ahí a la otra y de vuelta a los sin colocar. Coloca todos y arrastra uno a la zona de los sin colocar | Queda en cada lugar. Con todos colocados, la zona sigue visible y se puede soltar ahí |
| [web, móvil] Un lugar concreto | En "Condicionales", arrastra un elemento al lugar 3 y pulsa otro | El primero queda en el 3 y el segundo va al 1 |
| [web, móvil] Intercambiar | Con el 1 y el 2 llenos, suelta el del 1 sobre el 2. Luego suelta el que queda sin colocar sobre el lugar 1 | Se intercambian. Después, el que estaba en el 1 vuelve a los sin colocar |
| [web, móvil] Banco | Corre L1. En "Mis colores favoritos son ___ y ___.", arrastra una ficha al segundo espacio, con el primero libre. Devuélvela arrastrándola al banco | Queda en el segundo, y vuelve al banco |
| [web, móvil] Aspecto y soltar fuera | Arrastra despacio un elemento sobre un destino; luego suéltalo donde no hay destino | Sigue al puntero o al dedo, su origen atenuado y el destino resaltado. Vuelve a donde estaba y nada cambia |
| [web, móvil] Quita la selección | Pulsa un elemento y empieza a arrastrar otro | La selección desaparece |
| [web, móvil] Desplazarse sola | Corre L1. En "Actividades de prueba", 6, en clasificar, deja la última categoría fuera de la vista (en la web, con una ventana baja). Arrastra un elemento hacia el borde y suéltalo en ella | La pantalla se desplaza sola y el elemento queda en esa categoría |
| [web, móvil] Después de comprobar | Comprueba cualquier actividad e intenta arrastrar y pulsar | Nada se mueve |
| [móvil] Deslizar | En una actividad que no cabe en la pantalla, desliza rápido sobre un elemento | La pantalla se desplaza y el elemento no se mueve |
| [móvil] Un dedo | Arrastra un elemento y, sin soltarlo, mantén otro dedo sobre otro elemento y muévelo | El segundo no se mueve ni se selecciona |
| [móvil] Borde | Mantén pulsado un elemento de la columna izquierda y muévelo hacia el borde de la pantalla | No sale de la lección |
| [móvil] Segundo plano | Arrastra un elemento y, sin soltarlo, manda la app a segundo plano. Vuelve | El elemento está donde estaba |
| [móvil] Botón de atrás | Solo aplica en Android. Con algo ya colocado, arrastra otro elemento y, sin soltarlo, pulsa atrás | El arrastre se cancela y aparece "¿Salir de la lección?" |
| [web, móvil] Reducir movimiento | Activa "reducir movimiento". Suelta un elemento fuera; luego equivócate en una actividad y comprueba | Vuelve sin animación, y lo incorrecto no se sacude |

### Teclado y accesibilidad

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Solo teclado | Resuelve un emparejar, un clasificar, un ordenar y un banco solo con Tab, Enter y la barra espaciadora | Se llega a "Continuar" en los cuatro |
| [web] Foco al colocar | En clasificar, ordenar y banco, coloca con el teclado hasta el último | El foco queda en el siguiente sin colocar y, cuando la respuesta queda completa, en "Comprobar" |
| [web] Foco al emparejar | En emparejar, forma parejas empezando por la izquierda | El foco queda en el siguiente sin pareja de esa columna, y después de la última, en "Comprobar" |
| [web] Foco al devolver | En clasificar, ordenar y banco, devuelve con el teclado un elemento colocado | El foco queda en ese elemento |
| [web] Teclas 1 a 9 | En cada tipo, pulsa las teclas 1 a 9 | No pasa nada |
| [web, móvil] Lector de pantalla | Con NVDA, Orca, TalkBack o VoiceOver, recorre los cuatro tipos y mueve algo en cada uno | Cada elemento dice su estado ("Seleccionado", "Pareja {n}", "En {categoría}", "Lugar {n}" o "Espacio {n}"), y cada cambio se anuncia |
| [web, móvil] Sin depender del color | Comprueba una respuesta con errores en cada tipo | Lo correcto y lo incorrecto llevan icono |

### Resultado y salir

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Aciertos | En "Números del 1 al 5": une `一` con `1`, `二` con `2`, `三` con `3` y `四` con `4`; elige `五`; voltea la tarjeta; pon mal el orden | "Acertaste 2 de 3" |
| [web, móvil] Sin parciales | Repite con una sola pareja mal y lo demás bien | "Acertaste 2 de 3": emparejar cuenta como fallada |
| [web, móvil] Progreso | Pulsa "Volver al curso" | La lección muestra "2 de 3 aciertos" |
| [web, móvil] Confirmar al salir | Abre "Números del 1 al 5" y pulsa la X. Ábrela otra vez, elige un elemento, pulsa la X y luego "Seguir aquí" | La primera vez sale directo. La segunda pregunta, y "Seguir aquí" deja lo elegido |
| [web, móvil] Salir pierde lo hecho | Forma parejas, pulsa la X, "Salir", y abre otra vez la lección | Empieza sin respuestas |

### Paleta y bloques

Con la cuenta A, en el lienzo de "Semillas".

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Paleta | Mira la paleta | Los cuatro de "Relacionar" se pueden usar y no dicen "Próximamente". Reto de código, Terminal simulada, Grafo de commits y Escuchar y repetir siguen deshabilitados, con "Próximamente" |
| [web] Agregar | Agrega cada uno, dos arrastrándolos y dos pulsándolos | Queda con "Incompleta", seleccionado y con el foco en su primer campo |
| [web] Resumen del bloque | Llena y vacía en cada tipo la consigna y el texto que la reemplaza | Emparejar: la consigna o la izquierda de la primera pareja. Clasificar: la consigna o la primera categoría. Ordenar: la consigna. Banco: la consigna o el texto. Sin nada, "Sin contenido" |

### Formularios

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Parejas | Agrega emparejar. Pulsa "Agregar pareja" hasta el tope | Empieza con tres vacías, con "Quitar" deshabilitado. Con 8, "Agregar pareja" se deshabilita |
| [web] Repetidos en emparejar | Escribe "git" y " git " en la izquierda y guarda. Cambia a "git" y "Git"; escribe "git" también en la derecha | "Este texto está repetido." en el segundo. Lo demás se acepta |
| [web] Clasificar incompleto | Agrega clasificar. Escribe los nombres de las dos categorías y los dos elementos, deja uno sin categoría y guarda. Ponlos a los dos en la misma categoría y guarda | Empieza con dos categorías y dos elementos vacíos. "Elige una categoría.", y luego "Esta categoría no tiene elementos." |
| [web] Selector | Mira el selector con una categoría sin nombre; escríbele "Fruta" | Muestra "Categoría 2" y luego "Fruta" |
| [web] Quitar categoría | Con tres categorías, quita la que usa un elemento | El elemento se queda sin categoría |
| [web] Repetidos y límites en clasificar | Escribe dos categorías iguales y dos elementos iguales, y guarda. Agrega hasta el tope | "Esta categoría está repetida." y "Este elemento está repetido.". "Quitar" deshabilitado con 2, y "Agregar" con 4 categorías y con 12 elementos |
| [web] Ordenar | Agrega ordenar. Mira su ayuda, usa "Subir" y "Bajar", y guarda sin consigna | Tres elementos vacíos y "Escríbelos en el orden correcto. El alumno los verá mezclados.". Los botones cambian el orden, y la consigna muestra "Este campo es obligatorio." |
| [web] Límites en ordenar | Agrega y quita hasta los topes; escribe dos elementos iguales y guarda | "Quitar" deshabilitado con 3 y "Agregar elemento" con 10. "Este elemento está repetido." |
| [web] Espacios del banco | Agrega banco, escribe dos fichas, pulsa "Agregar espacio" y luego escribe otro `___` a mano | `___` aparece donde está el cursor, con "Espacio 1" y las dos palabras como casillas. Después aparece "Espacio 2" |
| [web] Casillas sin repetir | Escribe dos fichas "int". Luego escribe "Rojo" y "rojo" | "int" sale una sola vez en cada grupo. "Rojo" y "rojo" salen como dos casillas |
| [web] Errores del banco | Guarda con un espacio sin marcas; luego con un texto sin `___`; luego con 11 | "Marca al menos una ficha.", "Agrega al menos un espacio con ___." y "El texto puede tener hasta 10 espacios." |
| [web] No alcanzan | Texto `___ y ___`, fichas `int` y `char`, y solo `int` marcada en los dos. Guarda. Agrega otra ficha `int` y guarda | "No alcanzan las fichas para llenar todos los espacios. Si una palabra va en dos, agrégala dos veces.". Después se guarda |
| [web] Marcas de las fichas | Marca una ficha y corrige su texto. Luego quítala | Sigue marcada. Después su palabra desaparece de los grupos |
| [web] Grupos que sobran | Con dos espacios con marcas, borra un `___`. Pulsa "Quitar espacio". Repite con un grupo sin marcas | Los dos grupos siguen, con "Hay más grupos de respuestas que espacios en el texto. Quita los que sobran." y "Quitar espacio". Sin marcas, desaparece solo |
| [web] Límites del banco | Agrega y quita fichas hasta los topes | "Quitar" deshabilitado con 2 y "Agregar ficha" con 20 |
| [web] Límites de los campos | Pega en cada campo un texto más largo que su límite de "Datos de entrada" | Se queda en el límite |
| [web] Ayudas de la consigna | Mira la consigna de emparejar, clasificar y banco | Cada ayuda dice el texto que verá el alumno si se deja vacía |

### Vista previa y prueba

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Cada tipo | Completa una actividad de cada tipo y resuélvela en la vista previa, pulsando y arrastrando | Se ve como en el reproductor, y funciona de las dos formas |
| [web] Sin cruces con el editor | Arrastra un elemento de la vista previa hacia la secuencia y suéltalo. Arrastra un bloque y un tipo de la paleta sobre la vista previa y suéltalos | Nada cambia: ni bloques, ni actividades, ni la actividad de la vista previa |
| [web] Actualizarse y reiniciar | Coloca algo en la vista previa; cambia un texto en el inspector y sigue escribiendo. Coloca algo y pulsa "Reiniciar" | La vista previa vuelve a empezar y el foco se queda en el campo. "Reiniciar" la devuelve al principio |
| [web] Incompleta | Borra un campo obligatorio de cada tipo | "Completa esta actividad para ver su vista previa." |
| [web] Probar lección | Con las cuatro completas, pulsa "Probar lección" y recórrela | Se cursa como en el reproductor, y al final "Acertaste {aciertos} de 4" |

### Guardar y servidor

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Guardar | Guarda una lección con los cuatro tipos, con un elemento de ordenar con cuatro espacios al inicio. Recarga | Sigue igual, con sus datos y en su orden, y con la sangría |
| [web] Fichas y consigna | Escribe la ficha "  agua  " y deja vacía la consigna del banco. Guarda; corre P2; abre "Probar lección" | En P2 la ficha es `agua` y no hay `consigna`. Se ve "Completa con las fichas del banco" |
| [web, móvil] De principio a fin | Con la lección anterior, corre P1 y cúrsala con la cuenta B | Se ve igual que en la vista previa, y el resultado cuenta las cuatro preguntas |
| [backend] Emparejar | Corre B2 | Las tres, 400; la lección queda igual |
| [backend] Clasificar | Corre B3 | Las siete, 400; la lección queda igual |
| [backend] Ordenar | Corre B4 | Las cuatro, 400; la lección queda igual |
| [backend] Banco | Corre B5 | Las seis, 400; la lección queda igual |
| [backend] Largos y campos | Corre B6 | Las cinco, 400; la lección queda igual |
| [backend] Tipo que no existe | Corre B7 y la consulta que le sigue | 400, y `1 \| []` |

### Contenido

Corre L1.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Etiquetas al cursar | Recorre "Actividades de prueba", 4, con respuestas mal | `<b>hola</b>` y `<script>alert(1)</script>` se leen tal cual, también en la barra inferior, sin negritas y sin ejecutar nada |
| [web] Etiquetas en el editor | Con la cuenta autor, escribe esos textos en una actividad de cada tipo | Formulario, bloque y vista previa los muestran tal cual |
| [web, móvil] Marcadores | Abre "Resolviendo conflictos" (Git esencial, 6) hasta clasificar | "Ver los marcadores <<<<<<< ======= >>>>>>>" se lee tal cual |
| [web, móvil] Límites más altos | Recorre "Actividades de prueba", 6, hasta terminarla | Las cuatro se responden, con los textos completos |

## 4. Antes del PR

- `npm run tipos` y `npm run lint` en los tres repos de código.
- `npm run contrato:revisar` en `brote_specs`.
- `npm run bd:sembrar` deja la base como al principio. Retira "Actividades de prueba" (L1).
- Repite de F03 "Opción múltiple" y "Completar espacios", porque F11 toca `BarraRespuesta` y,
  en el móvil, el dibujo del texto con espacios y `MarcoActividad`. Repite también la salida
  con el gesto de atrás: la raíz de la app cambió.
- Repite de F05 lo de completar espacios en "Formularios": `ajustarGrupos` y el campo del
  texto cambiaron.
- Si repites algo de F03 o F04 con los datos de prueba, mira la nota de "Supuestos" en la
  spec: "Primeros pasos" tiene 4 preguntas, "Hiragana: las vocales" tiene 2, y la lección sin
  preguntas es "Ramas: trabajar en paralelo".
- Marca los criterios en `spec.md` y enlista en cada PR los que cubre.
