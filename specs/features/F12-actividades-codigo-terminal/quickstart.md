# Guía de validación: F12 Actividades de código y terminal

Cómo levantar los repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). La feature está terminada cuando todos están marcados
(principio VIII). Lo que acepta y rechaza el servidor está en
[contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: los de F01 a F11 (Node 24, PostgreSQL, Chrome y Expo Go para el SDK 58, en un
teléfono). Cada repo en su rama `feature/F12-actividades-codigo-terminal`, que sale de
`feature/F11-actividades-relacionar` mientras F11 no esté en `dev` (plan.md, "Resumen").

```bash
# brote_specs: copiar el contrato 0.9.0 y comprobar las copias
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
146 actividades. "Actividades de prueba" gana seis lecciones al final. `HTML` es
`<b>hola</b> <script>alert(1)</script>`, como en F03 y F11.

| Lección | Qué tiene |
|---|---|
| 7. Código con etiquetas | Un reto de HTML, una terminal y un grafo con `HTML` en todos sus textos. El grafo tiene los commits `<b>` y `c2` y la rama `<script>` |
| 8. Retos de código | Un reto de SQL sin código inicial, con la solución `-- Todos los alumnos` y `SELECT * FROM alumnos;`; y un reto con lenguaje "Otro" |
| 9. Terminal mínima | "Muestra los archivos de la carpeta.", con el comando `ls` y nada más |
| 10. Grafos | Los tres grafos de abajo |
| 11. Código al límite | Un reto con código inicial y solución de 2000 caracteres y una línea de 150; una terminal con carpeta de 100, 10 comandos, salida previa y salida al acertar de 2000 y pista de 500; y el grafo al límite de abajo |
| 12. Solo teoría | Una teoría y una tarjeta: es la lección sin preguntas |

Los grafos de la lección 10:

| Grafo | Commits (padres) | Ramas, en orden | HEAD | Respuesta | Explicación |
|---|---|---|---|---|---|
| Con un merge: "¿Qué commit une el trabajo de las dos ramas?" | `c1`; `c2` (`c1`); `c3` (`c2`); `c4` (`c2`); `c5` (`c3`, `c4`) | `main` → `c5`, `feature` → `c4` | `main` | `c5` | "c5 es un merge: tiene dos padres, c3 y c4." |
| Rama ya borrada: "La rama que trajo c3 ya se borró. ¿Qué commit venía de ella?" | `c1`; `c2` (`c1`); `c3` (`c1`); `c4` (`c2`, `c3`) | `main` → `c4` | — | `c3` | "c3 entró a main con el merge c4." |
| HEAD suelto: "HEAD está suelto. ¿En qué commit estás?" | `c1`; `c2` (`c1`); `c3` (`c2`); `c4` (`c3`) | `main` → `c4` | commit `c2` | `c2` | — |

El grafo al límite de la lección 11, "¿Qué commit es un merge?", con la respuesta `x2j2` y
una explicación de 500 caracteres:

| Commit | Padres | Columna, fila |
|---|---|---|
| `m1a1` | — | 0, 0 |
| `m2b2` | `m1a1` | 1, 0 |
| `m3c3` | `m2b2` | 2, 0 |
| `m4d4` | `m3c3` | 3, 0 |
| `m5e5` | `m4d4` | 4, 0 |
| `m6f6` | `m5e5` | 5, 0 |
| `f1g1` | `m2b2` | 2, 1 |
| `f2h2` | `f1g1` | 3, 1 |
| `x1i1` | `m3c3` | 3, 2 |
| `x2j2` | `f2h2`, `x1i1` | 4, 1 |

Ramas, en orden: `principal-del-equipo` → `m6f6`, `funcion-del-registro` → `x2j2`,
`arreglo-del-portal-1` → `x1i1` y `etiqueta-del-inicio1` → `m5e5` (todas de 20
caracteres). HEAD → `funcion-del-registro`. Las etiquetas de `m5e5` y `m6f6` están en
columnas vecinas de la misma fila, así que una sube un nivel.

Publícalo antes de los criterios que lo citan (L1) y retíralo al terminar.

Para los criterios del editor, con la cuenta A, crea el curso "Huerto urbano" y una lección
"Semillas". Si un criterio pide actividades completas, usa estos textos:

| Tipo | Campos |
|---|---|
| Reto de código | Consigna: "Escribe la clase que centra el texto.". Lenguaje: CSS. Código inicial: `.titulo {`, `  `, `}`. Solución: `.titulo {`, `  text-align: center;`, `}` |
| Terminal simulada | Consigna: "Inicia un repositorio.". Carpeta: `~/semillas`. Comandos: `git init`. Salida al acertar: `Initialized empty Git repository`. Pista: "Se inicia con git init." |
| Grafo de commits | Consigna: "¿Cuál es el primer commit?". Commits: `c1` y `c2` (padre `c1`). Rama `main` → `c2`. HEAD: `main`. Respuesta: `c1` |

### 1.2 Atajos

`bd`, `idCurso` e `idLeccion` son los de F03. En Windows la base está en el puerto 5433
(`continuar.md`, "En Windows"): cambia el puerto en los tres.

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
"Pulsar" es con el ratón en la web y con el dedo en el móvil. Para el lector de pantalla:
NVDA o VoiceOver en la web; VoiceOver o TalkBack en el móvil.

## 2. Backend con curl

Corre estas primero: comprueban la autoridad del servidor sin ningún cliente.

```bash
API=http://localhost:3000
J='Content-Type: application/json'

# B1. Las actividades de los cuatro cursos de prueba
bd <<'SQL'
SELECT a->>'tipo' AS tipo, a->>'lenguaje' AS lenguaje, count(*)
FROM leccion l
JOIN curso c ON c.id = l.id_curso
CROSS JOIN LATERAL jsonb_array_elements(l.actividades) a
WHERE c.titulo IN ('Git esencial', 'Japonés sencillo', 'Programación en C sencilla', 'Examen unidad 1')
GROUP BY 1, 2 ORDER BY 1, 2;
SQL
# bancoPalabras 3, clasificar 9, completarEspacios 13, emparejar 9, grafoCommits 1,
# opcionMultiple 28, ordenar 6, preguntaAbierta 17, retoCodigo c 3, retoCodigo css 10,
# tarjeta 9, teoria 26, terminalSimulada 12

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
largo() { node -p "'a'.repeat($1)"; }
# un grafo: commits, ramas y lo demás (por defecto, la respuesta 0)
grafo() { guardar "{\"tipo\":\"grafoCommits\",\"consigna\":\"Elige\",\"commits\":$1,\"ramas\":${2:-[]},${3:-\"respuesta\":0}}"; }
cadena() { lista $1 "({nombre:'c'+i,padres:i?[i-1]:[]})"; }
DOS=$(cadena 2)

# De B2 a B7, cada una responde {"error":"Revisa los datos marcados.","campos":{"actividades.0":"…"}} 400

# B2. Reto: sin consigna, sin solución, y los lenguajes "CSS" y "Otro" (con mayúscula)
guardar '{"tipo":"retoCodigo","lenguaje":"c","solucion":"x"}'
guardar '{"tipo":"retoCodigo","consigna":"Escribe","lenguaje":"c"}'
guardar '{"tipo":"retoCodigo","consigna":"Escribe","lenguaje":"CSS","solucion":"x"}'
guardar '{"tipo":"retoCodigo","consigna":"Escribe","lenguaje":"Otro","solucion":"x"}'

# B3. Terminal: sin comandos, 11 comandos, uno repetido que solo cambia en los espacios, otro
# que solo cambia en las comillas tipográficas, y un salto de línea en la carpeta y en un comando
guardar '{"tipo":"terminalSimulada","consigna":"Inicia","comandos":[]}'
guardar "{\"tipo\":\"terminalSimulada\",\"consigna\":\"Inicia\",\"comandos\":$(lista 11 "'ls '+i")}"
guardar '{"tipo":"terminalSimulada","consigna":"Inicia","comandos":["git init","git  init"]}'
guardar '{"tipo":"terminalSimulada","consigna":"Inicia","comandos":["git commit -m \"Uno\"","git commit -m “Uno”"]}'
guardar '{"tipo":"terminalSimulada","consigna":"Inicia","carpeta":"~/a\nb","comandos":["git init"]}'
guardar '{"tipo":"terminalSimulada","consigna":"Inicia","comandos":["git\ninit"]}'

# B4. Grafo, commits: 1 y 11 commits; un nombre repetido y uno de 5; el primero con padre;
# otro sin padre; tres padres; dos iguales; un padre que no existe; uno que va más abajo; y
# 7 columnas
grafo "$(cadena 1)"
grafo "$(cadena 11)"
grafo '[{"nombre":"c1","padres":[]},{"nombre":" c1 ","padres":[0]}]'
grafo '[{"nombre":"c1234","padres":[]},{"nombre":"c2","padres":[0]}]'
grafo '[{"nombre":"c1","padres":[0]},{"nombre":"c2","padres":[0]}]'
grafo '[{"nombre":"c1","padres":[]},{"nombre":"c2","padres":[]}]'
grafo '[{"nombre":"c1","padres":[]},{"nombre":"c2","padres":[0]},{"nombre":"c3","padres":[0]},{"nombre":"c4","padres":[0,1,2]}]'
grafo '[{"nombre":"c1","padres":[]},{"nombre":"c2","padres":[0]},{"nombre":"c3","padres":[1,1]}]'
grafo '[{"nombre":"c1","padres":[]},{"nombre":"c2","padres":[5]}]'
grafo '[{"nombre":"c1","padres":[]},{"nombre":"c2","padres":[2]},{"nombre":"c3","padres":[0]}]'
grafo "$(cadena 7)"

# B5. Grafo, lo demás: 5 ramas; una repetida, una llamada HEAD y una hacia un commit que no
# existe; HEAD hacia una rama que no existe y con las dos formas a la vez; y una respuesta
# que no es un commit
grafo "$DOS" "$(lista 5 "({nombre:'r'+i,commit:1})")"
grafo "$DOS" '[{"nombre":"main","commit":1},{"nombre":" main ","commit":0}]'
grafo "$DOS" '[{"nombre":"HEAD","commit":1}]'
grafo "$DOS" '[{"nombre":"main","commit":2}]'
grafo "$DOS" '[{"nombre":"main","commit":1}]' '"respuesta":0,"head":{"rama":1}'
grafo "$DOS" '[]' '"respuesta":0,"head":{"rama":0,"commit":1}'
grafo "$DOS" '[]' '"respuesta":2'

# B6. Textos largos y campos que el tipo no tiene
guardar "{\"tipo\":\"retoCodigo\",\"consigna\":\"$(largo 501)\",\"lenguaje\":\"c\",\"solucion\":\"x\"}"
guardar "{\"tipo\":\"retoCodigo\",\"consigna\":\"Escribe\",\"lenguaje\":\"c\",\"solucion\":\"$(largo 2001)\"}"
guardar "{\"tipo\":\"terminalSimulada\",\"consigna\":\"Inicia\",\"carpeta\":\"$(largo 101)\",\"comandos\":[\"ls\"]}"
guardar "{\"tipo\":\"terminalSimulada\",\"consigna\":\"Inicia\",\"comandos\":[\"$(largo 201)\"]}"
guardar "{\"tipo\":\"terminalSimulada\",\"consigna\":\"Inicia\",\"comandos\":[\"ls\"],\"pista\":\"$(largo 501)\"}"
grafo "$DOS" '[]' "\"respuesta\":0,\"explicacion\":\"$(largo 501)\""
grafo '[{"nombre":"c1","padres":[],"x":60},{"nombre":"c2","padres":[0]}]'
guardar '{"tipo":"terminalSimulada","consigna":"Inicia","comandos":["ls"],"salida":"a"}'

# B7. Un tipo que todavía no existe
guardar '{"tipo":"escucharRepetir","textoEsperado":"hola"}'
# ... "actividad 1 (escucharRepetir): tipo desconocido"
bd <<< "SELECT version, actividades FROM leccion WHERE id = '$UNO';"
# 1 | []   (nada de lo anterior se guardó)

# B8. Se guarda recortado → 200
guardar '{"tipo":"terminalSimulada","consigna":"Inicia","carpeta":"  ~/semillas  ","comandos":["  git init  "]},{"tipo":"grafoCommits","consigna":"Elige","commits":[{"nombre":" c1 ","padres":[]},{"nombre":"c2","padres":[0]}],"ramas":[{"nombre":" main ","commit":1}],"head":{"rama":0},"respuesta":0}'
bd <<< "SELECT a->'carpeta', a->'comandos', a->'commits'->0->'nombre', a->'ramas'->0->'nombre' FROM leccion, jsonb_array_elements(actividades) a WHERE id = '$UNO';"
# "~/semillas" | ["git init"] |      |
#              |              | "c1" | "main"
```

## 3. Criterios de la spec

### Cursos de prueba

| Criterio | Pasos | Esperado |
|---|---|---|
| [backend] Las 26 actividades | Corre B1 | `retoCodigo` 3 en `c` y 10 en `css`, `terminalSimulada` 12, `grafoCommits` 1, y los demás tipos como en F11 |
| [web, móvil] "Tu primer commit" | Recorre "Tu primer commit" (Git esencial, 2) | Teoría, cuatro terminales y clasificar, en ese orden |
| [web, móvil] "Ramas" | Recorre "Ramas: trabajar en paralelo" (Git esencial, 4) | Teoría, terminal, grafo, teoría, terminal y terminal |
| [web, móvil] "Patrones comunes" | Recorre "Patrones comunes con Flexbox" (Examen unidad 1, 11) | Teoría, opción múltiple, reto, reto, ordenar, reto, tarjeta y pregunta abierta |

### Reto de código

Salvo que se diga otra cosa, en "Condicionales y operadores" (Programación en C sencilla, 2),
en la cuarta actividad. Para los de "Actividades de prueba", corre antes L1.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Inicio | Llega al reto | La consigna de `esPar`, la etiqueta "C" y el campo con `int esPar(int n) {`, una línea con dos espacios y `}`. "Comprobar" deshabilitado |
| [web, móvil] Panel oscuro | Míralo en modo claro y en modo oscuro (el del sistema) | Oscuro en los dos, con letra monoespaciada y el cursor verde |
| [web, móvil] Habilitar | Escribe `x` en la segunda línea y bórrala | Se habilita al escribirla y se deshabilita al borrarla |
| [web, móvil] Comprobar | Escribe `return n % 2 == 0;` en la segunda línea y comprueba | Tu código queda de solo lectura. Aparece "Solución de referencia" con "C" y `  return n % 2 == 0;` con su sangría, y "¿La tuviste bien?" con sus dos botones |
| [web, móvil] Autoevaluarse | Elige "La tuve bien"; en otra vuelta, "No la tuve" | "¡Correcto!" y luego "A repasar". Al terminar la lección, el primero cuenta como acierto y el segundo, como fallo |
| [web, móvil] Varias partes | Abre "flex: 1 y el tamaño de los elementos" (Examen unidad 1, 8) hasta el reto | `.layout`, `.sidebar` y `.main`, separados por líneas en blanco, y la etiqueta "CSS" |
| [web, móvil] Sin código inicial | En "Actividades de prueba", 8, el reto de SQL; escribe algo y comprueba | Empieza vacío y con "Comprobar" deshabilitado. La solución muestra `-- Todos los alumnos` del mismo color que `SELECT * FROM alumnos;` |
| [web, móvil] "Otro" | En "Actividades de prueba", 8, el segundo reto | No hay etiqueta de lenguaje, ni en el campo ni en la solución |
| [web, móvil] Línea larga | En "Actividades de prueba", 11, el reto; recorre la línea de 150 caracteres y comprueba | Se lee completa en el campo y en la solución, desplazando o en varias líneas, sin "…" |
| [web] Tab | Pon el cursor al final de la segunda línea; Tab; Mayús+Tab. Selecciona las tres líneas; Tab; Ctrl+Z | La línea pasa a cuatro espacios y vuelve a dos. Las tres líneas ganan dos espacios al inicio, y Ctrl+Z (Cmd+Z en Mac) lo deshace |
| [web] Salir con Esc | Lee el texto debajo del campo; Esc y Tab; vuelve con Mayús+Tab; Esc y Mayús+Tab; vuelve con Tab y pulsa Tab | "Tab agrega dos espacios. Para salir del campo, pulsa Esc y luego Tab.". Tab sale hacia adelante y Mayús+Tab hacia atrás. Al volver, Tab mete espacios |
| [web] Enter | En el campo, pulsa Enter | Salta de línea y no comprueba |
| [web] Solo lectura | Después de comprobar, pon el foco en el campo y pulsa Tab | El foco sale del campo, y el texto sobre Tab ya no está |
| [móvil] Teclado | En el campo, escribe `si "hola" y 'chau'...` | No se corrige ni se pone mayúscula; `"` y `'` quedan rectas y `...` quedan tres puntos |
| [móvil] Más de 12 líneas | En "Actividades de prueba", 11, el reto; con el teclado abierto, baja hasta el final y escribe | El campo no pasa de 12 líneas y se desplaza por dentro; la línea que escribes se ve |

### Terminal simulada

Salvo que se diga otra cosa, en "Tu primer commit" (Git esencial, 2), en la segunda actividad.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Inicio | Llega a la primera terminal | "Estás en una carpeta con un proyecto nuevo. Conviértela en un repositorio Git.", `README.md` e `index.html` en dos líneas y `~/proyectos/mi-app $` con el cursor. "Comprobar" deshabilitado |
| [web, móvil] Panel y pulsar | Míralo en modo claro y oscuro. Pulsa en la salida previa | Oscuro en los dos, cursor verde. El cursor queda en la línea del comando (en el móvil, se abre el teclado) |
| [web, móvil] Vacío | Con la línea vacía y luego con tres espacios, pulsa Enter (en el móvil, enviar) | "Comprobar" deshabilitado y no pasa nada |
| [web, móvil] Acierto | Escribe `git init` y Enter | Debajo, `Initialized empty Git repository in ~/proyectos/mi-app/.git/`; "¡Correcto!" y "Continuar". El comando ya no se edita |
| [web, móvil] Espacios de sobra | En otra vuelta, escribe `  git   init  ` y Enter | "¡Correcto!" |
| [web, móvil] Mayúscula | En otra vuelta, escribe `Git init` y Enter | La terminal no muestra nada más. "Respuesta correcta:", `git init` en letra de código y "El comando que inicializa un repositorio es "git init"." |
| [web, móvil] Comillas | En la quinta actividad (cuarta terminal), en tres vueltas: `git commit -m "Primer commit"`, `git commit -m 'Primer commit'` y `git commit -m Primer commit` | Las dos primeras, "¡Correcto!". La tercera, incorrecta, con `git commit -m "Primer commit"` en la barra |
| [web, móvil] Salida con sangría | En la tercera actividad (segunda terminal), escribe `git status` | La salida tiene sus líneas en blanco, y `README.md` e `index.html` con sangría |
| [web, móvil] Comando largo | En "Remotos: compartir tu trabajo" (Git esencial, 5), en la primera terminal, escribe `git clone https://github.com/usuario/mi-app.git` | El comando pasa a la línea siguiente y se lee completo mientras escribes; la salida también, sin desplazarse hacia los lados |
| [web, móvil] Terminal mínima | Corre L1. En "Actividades de prueba", 9, escribe `ls`; en otra vuelta, `dir` | Al inicio solo `$` y el cursor. Con `ls`, el comando y "¡Correcto!", sin salida. Con `dir`, la barra solo muestra `ls` |
| [web, móvil] Pegar | Copia `git init` con un salto de línea al final (de un editor de notas) y pégalo en la línea | Queda `git init ` en la línea y no se comprueba hasta Enter |
| [móvil] Teclado | En la línea, escribe `echo "hola" 'chau'` | Sin corrección ni mayúscula inicial; `"` y `'` rectas |
| [móvil] Dos guiones | En "Viajar en el tiempo: historial y diffs" (Git esencial, 3), en la primera terminal, escribe `git log --oneline` | Los dos guiones siguen siendo dos (no `—`), y es correcto |
| [móvil] Teclado abierto | En la primera terminal de "Tu primer commit", pulsa la terminal; escribe y pulsa enviar | La línea del comando se ve encima del teclado. Al comprobar, el teclado se cierra |

### Grafo de commits

Salvo que se diga otra cosa, en "Ramas: trabajar en paralelo" (Git esencial, 4), en la tercera
actividad. Para los de "Actividades de prueba", corre antes L1 y abre su lección 10 u 11.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Inicio | Llega al grafo | La consigna completa; `c1`, `c2` y `c3` en una fila, de izquierda a derecha, unidos; `feature` sobre `c3`; sin HEAD. "Comprobar" deshabilitado |
| [web, móvil] Elegir | Pulsa `c3` y luego `c2` | `c3` queda elegido y "Comprobar" se habilita; luego la elección pasa a `c2` |
| [web, móvil] Acierto | Con `c2`, comprueba | `c2` correcto, con icono. "¡Correcto!" y la explicación de main y feature |
| [web, móvil] Fallo | En otra vuelta, con `c3`, comprueba; pulsa otro commit | `c3` incorrecto y `c2` correcto, con iconos. "Respuesta correcta:", `c2` y la explicación. Ya no se elige otro |
| [web, móvil] Merge | En "Actividades de prueba", 10, el primer grafo | Fila 1: `c1`, `c2`, `c3` y `c5`, con "HEAD → main" sobre `c5`. Fila 2: `c4`, debajo de `c3`, con `feature`. Líneas de `c5` a `c3` y a `c4` |
| [web, móvil] Rama borrada | En el segundo grafo | Fila 1: `c1`, `c2` y `c4`. Fila 2: `c3`, debajo de `c2`, sin etiqueta |
| [web, móvil] HEAD suelto | En el tercer grafo | "HEAD", sin flecha, sobre `c2`, a la mitad de la fila |
| [web, móvil] Sin explicación | En el tercer grafo, comprueba con `c2`; en otra vuelta, con `c3` | La barra solo dice "¡Correcto!", o "Respuesta correcta:" con `c2` |
| [móvil] Al límite en el teléfono | En un teléfono de 360 dp de ancho (o el emulador de Android con un dispositivo de ese ancho), abre "Actividades de prueba", 11, hasta el grafo | Las 6 columnas caben sin desplazarse hacia los lados. Las etiquetas de 20 caracteres y "HEAD → funcion-del-registro" se leen completas, y la de `m5e5` está un nivel más arriba que la de `m6f6`. Cada commit se pulsa sin elegir el de al lado |
| [web] Al límite en la web | Abre ese grafo en una ventana ancha y, con la cuenta autor, en la vista previa de la lección 11 | Cabe en el ancho disponible sin desplazarse hacia los lados, sin estirarse de más |

### Teclado y accesibilidad

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Solo teclado | Sin ratón, hasta "Continuar": el reto de "Condicionales y operadores", la primera terminal de "Tu primer commit" y el grafo con un merge ("Actividades de prueba", 10) | En el reto sales con Esc y Tab hasta "Comprobar"; en la terminal, Enter comprueba; en el grafo, Tab va por `c1`, `c2`, `c3`, `c4` y `c5`, en ese orden, y Enter o la barra espaciadora eligen |
| [web] Teclas 1 a 9 | En el grafo, pulsa 1, 2 y 3 | No se elige ningún commit |
| [web] Foco a "Continuar" | Comprueba una terminal, un grafo, y autoevalúate en un reto | El foco queda en "Continuar" |
| [web, móvil] Lector de pantalla | Con el lector, recorre el reto de "Condicionales y operadores", la primera terminal de "Tu primer commit" y el grafo de merge | "Tu código", "C" (y en la web, el texto sobre Tab); "Comando" y `~/proyectos/mi-app`; cada commit con su nombre, sus padres, sus ramas y HEAD, y "elegido", "correcto" o "incorrecto" |
| [web, móvil] Iconos | Comprueba un grafo con un commit equivocado | Correcto e incorrecto llevan su icono además del color |

### Resultado y salir

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Resultado | En "Tu primer commit", acierta las cuatro terminales y falla clasificar | "Acertaste 4 de 5" |
| [web, móvil] Progreso | Vuelve al curso | La lección 2 dice "4 de 5 aciertos" |
| [web, móvil] Salir | Corre L1. En "Actividades de prueba", 9, sin escribir, pulsa la X. Vuelve, escribe `ls` y pulsa la X; elige "Seguir aquí". En la lección 10, elige un commit del primer grafo y pulsa la X | Sin escribir, sale directo. Con algo escrito, "¿Salir de la lección?", y "Seguir aquí" deja `ls`. Con un commit elegido, también pide confirmación. (En "Ramas" no sirve: su primera terminal va después de una teoría, y pasar de la primera actividad ya pide confirmación, F03) |
| [web, móvil] Empezar de nuevo | En "Condicionales y operadores", escribe en el reto, sal con "Salir" y abre otra vez la lección | Empieza desde la primera actividad, y el reto tiene otra vez su código inicial |

### Paleta y bloques

Con la cuenta A, en la lección "Semillas" de "Huerto urbano".

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Paleta | Mira el grupo "Código y terminal" y "Voz" | Los tres se pueden agregar, sin "Próximamente". Escuchar y repetir sigue deshabilitado, con "Próximamente" |
| [web] Agregar | Arrastra uno y pulsa los otros dos | Cada uno queda con "Incompleta", seleccionado y con el foco en la consigna |
| [web] Resumen | Escribe una consigna en cada uno; borra la de uno | El bloque muestra el inicio de la consigna, y "Sin contenido" en el que la perdió |

### Formularios

En la lección "Semillas". "Al guardar" es pulsar "Guardar lección".

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Lenguaje | Abre el selector del reto; guarda sin elegir | "Elige un lenguaje", C, CSS, HTML, JavaScript, Python, SQL, Bash y Otro. Al guardar, "Elige un lenguaje.". Los dos campos de código, en letra monoespaciada |
| [web] Obligatorios | Deja sin consigna los tres y sin solución el reto; guarda | "Este campo es obligatorio." en cada uno |
| [web] Comandos | En la terminal, mira el primer comando; agrega hasta 10 | Uno vacío con "Es el que ve el alumno como respuesta correcta" y "Quitar" deshabilitado. Con 10, "Agregar comando" deshabilitado |
| [web] Repetidos | Escribe `git init` y `git  init `; guarda. Cambia el segundo a `Git init`; guarda | "Este comando está repetido." en el segundo. Con `Git init`, se guarda |
| [web] Recorte | Escribe `  git init  ` como comando; guarda y corre P2 | `"git init"` |
| [web] Commits | Agrega un grafo; mira los commits; agrega hasta 10 | Dos sin nombre: "Primer commit: no tiene padre" y el segundo con el primero como padre. Cada nuevo tiene al anterior como padre. Con 2, "Quitar" deshabilitado; con 10, "Agregar commit" también |
| [web] Selectores de padre | Con cuatro commits, abre el "Padre" del tercero; nombra `c1` al primero | Solo `Commit 1` y `Commit 2`; luego `c1`, sin cambiar lo elegido |
| [web] Nombre de commit | Escribe `c1234` en un nombre; nombra `c1` a dos commits y guarda | Solo entra `c123`. "Este nombre ya lo tiene otro commit." |
| [web] Segundo padre | Pon como segundo padre el mismo que el primero; guarda | "El segundo padre tiene que ser otro commit." |
| [web] Quitar un commit | Con `c1`, `c2` (`c1`), `c3` (`c2`) y `c4` (`c1`, segundo padre `c2`), la rama `main` → `c2`, HEAD → commit `c2` y la respuesta `c2`, quita `c2` y guarda | `c3`: "Elige un padre.". `c4`: segundo padre "Ninguno". `main`: "Elige un commit.". HEAD: "Sin HEAD". Respuesta: "Elige la respuesta." |
| [web] Quitar el primero | Quita el primer commit | El que seguía dice "Primer commit: no tiene padre" |
| [web] Columnas | Haz 7 commits seguidos y guarda. Cambia el padre del último al quinto | "El grafo puede tener hasta 6 commits seguidos de izquierda a derecha. Pon alguno en paralelo o quita alguno.". Después se guarda |
| [web] Ramas | Agrega 4 ramas; nombra dos `main`; nombra una `HEAD`; deja una sin commit; guarda | "Agregar rama" deshabilitado con 4. "Esta rama está repetida.", "Una rama no se puede llamar HEAD." y "Elige un commit." |
| [web] HEAD | Abre el selector de HEAD; elige una rama y quítala | "Sin HEAD", "Rama …" y "Commit …". Al quitar la rama, vuelve a "Sin HEAD" |
| [web] Límites y ayudas | Intenta pasar el límite de cada campo de "Datos de entrada"; lee las ayudas | No deja escribir de más. Las ayudas de "Formulario de cada tipo" están |

### Vista previa y prueba

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Como en el reproductor | Completa una actividad de cada tipo (sección 1.1) y respóndela en la vista previa | Se ve y se responde como en el reproductor |
| [web] Teclas dentro | En la vista previa: Tab en el campo del reto; Enter en la terminal; pulsa un commit | Tab mete espacios; Enter comprueba solo esa actividad; ningún bloque se selecciona |
| [web] Volver a empezar | Responde algo en la vista previa y cambia la consigna; luego "Reiniciar" | La vista previa vuelve a empezar y el foco sigue en la consigna. "Reiniciar" la devuelve al principio |
| [web] Incompleta | Deja una actividad de cada tipo sin consigna, y un grafo con 7 columnas | "Completa esta actividad para ver su vista previa." |
| [web] Probar | Con las tres completas, "Probar lección" hasta el final | "Acertaste {aciertos} de 3" |

### Guardar y servidor

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Guardar | Guarda la lección con los tres tipos; recarga. Corre P2 | Sigue igual, en su orden. El código inicial y la solución con su sangría y líneas en blanco. Sin `salidaPrevia` ni `explicacion` en P2 |
| [web, móvil] De principio a fin | Corre P1 y cursa "Semillas" con la cuenta B en la web y en el móvil | Se ve igual que en la vista previa, y el resultado cuenta 3 preguntas |
| [backend] Reto | Corre B2 | Las cuatro, 400; la lección queda igual |
| [backend] Terminal | Corre B3 | Las seis, 400; la lección queda igual |
| [backend] Grafo, commits | Corre B4 | Las once, 400; la lección queda igual |
| [backend] Grafo, lo demás | Corre B5 | Las siete, 400; la lección queda igual |
| [backend] Largos y campos | Corre B6 | Las ocho, 400; la lección queda igual |
| [backend] Escuchar y repetir | Corre B7 y la consulta que le sigue | 400, y `1 \| []` |

B8 no es un criterio: comprueba el recorte del servidor sin pasar por la web.

### Contenido

Corre L1.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Etiquetas al cursar | Recorre "Actividades de prueba", 7, fallando la terminal y el grafo | `<b>hola</b>` y `<script>alert(1)</script>` se leen tal cual, también en la barra, el commit `<b>` y la rama `<script>`, sin negritas y sin ejecutar nada |
| [web] Etiquetas en el editor | Con la cuenta autor, abre la lección 7 en el editor | Formulario, bloque y vista previa los muestran tal cual |
| [web, móvil] Límites más altos | Recorre "Actividades de prueba", 11, hasta terminarla | Las tres se responden, con los textos completos |

## 4. Antes del PR

- `npm run tipos` y `npm run lint` en los tres repos de código.
- `npm run contrato:revisar` en `brote_specs`.
- `npm run bd:sembrar` deja la base como al principio. Retira "Actividades de prueba" (L1).
- Repite de F03 "Teoría" (el diff de "Viajar en el tiempo") y "Opción múltiple", porque F12
  toca `BloqueCodigo` y `BarraRespuesta`, y de F11 una actividad de relacionar con la
  respuesta larga en la barra.
- Repite de F05 lo de los campos de texto en "Formularios": `CampoTexto` cambió.
- Si repites algo de F03, F04 o F11 con los datos de prueba, mira la nota de "Supuestos" en la
  spec: "Tu primer commit" tiene 5 preguntas, "Ramas: trabajar en paralelo" tiene 4, y la
  lección sin preguntas es "Solo teoría" ("Actividades de prueba", 12).
- Marca los criterios en `spec.md` y enlista en cada PR los que cubre.
