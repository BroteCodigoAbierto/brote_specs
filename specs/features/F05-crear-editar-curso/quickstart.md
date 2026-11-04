# Guía de validación: F05 Crear y editar un curso

Cómo levantar los repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). La feature está terminada cuando todos están marcados
(principio VIII). Rutas y respuestas en [contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: los de F01 a F04 (Node 24, PostgreSQL, Expo Go para el SDK 58). Cada
repo en su rama `feature/F05-crear-editar-curso`. El móvil solo hace falta para
los criterios marcados `[web, móvil]`.

```bash
# brote_specs: copiar el contrato 0.6.0 y comprobar las copias
npm run contrato:copiar && npm run contrato:revisar

# brote_backend_express
npm install
npm run bd:migrar          # columna leccion.version
                           # si el usuario no puede crear bases: npx prisma migrate deploy
npm run bd:generar         # Prisma 7 no regenera el cliente al migrar
npm run bd:sembrar         # cuentas y cursos de prueba
npm run dev                # API en http://localhost:3000

# brote_web_react
npm run dev                # http://localhost:5173

# brote_mobile_expo
npx expo start             # abrir con Expo Go
```

### 1.1 Datos de prueba

`npm run bd:sembrar` deja (research.md, punto 19), todas con la contraseña
`brote12345`:

| Cuenta | Correo | Qué tiene |
|---|---|---|
| Cuenta A | `creador@brote.test` | Sin cursos |
| Cuenta B | `creador2@brote.test` | Sin cursos |
| Cuenta autor | `autor@brote.test` | Los cuatro cursos del prototipo, publicados, y los borradores de abajo |

Borradores de la cuenta autor que usan los criterios:

| Curso | Para qué |
|---|---|
| Curso en borrador | Abrir desde "Editar" |
| Curso con cien lecciones | El máximo de lecciones |
| Lección con el máximo (una lección de 50 tarjetas) | El máximo de actividades |
| Texto `<b>hola</b>` `<script>` | Textos con etiquetas |

Lecciones de ejemplo para los criterios del lienzo. Con la cuenta A, crea el curso
"Huerto urbano" y una lección "Semillas". Si un criterio pide actividades, agrégalas
con estos textos:

| Tipo | Campos |
|---|---|
| Teoría | Texto: "Las semillas necesitan agua." |
| Tarjeta | Frente: "Germinar". Reverso: "Empezar a crecer" |
| Opción múltiple | Pregunta: "¿Qué necesita una semilla?". Opciones: "Agua" (correcta), "Sal" |
| Completar espacios | Texto: "La semilla necesita ___". Respuesta: "agua" |
| Pregunta abierta | Pregunta: "¿Por qué germina?". Solución: "Por la humedad." |

### 1.2 Atajos

`bd`, `idCurso` e `idLeccion` son los de F03:

```bash
bd() { psql -X -q postgresql://brote:brote@localhost:5432/brote; }
idCurso() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM curso WHERE titulo = '$1';"; }
idLeccion() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT l.id FROM leccion l JOIN curso c ON c.id = l.id_curso WHERE c.titulo = '$1' AND l.posicion = $2;"; }
```

```bash
# P1. Publicar y retirar un curso, como lo hace un administrador
bd <<< "UPDATE curso SET publicado = true  WHERE titulo = 'Huerto urbano';"
bd <<< "UPDATE curso SET publicado = false WHERE titulo = 'Huerto urbano';"

# P2. Las lecciones de un curso, con su versión
bd <<'SQL'
SELECT l.posicion, l.titulo, l.version, jsonb_array_length(l.actividades) AS actividades
FROM leccion l JOIN curso c ON c.id = l.id_curso
WHERE c.titulo = 'Huerto urbano' ORDER BY l.posicion;
SQL

# P3. Las actividades guardadas de una lección
bd <<'SQL'
SELECT jsonb_pretty(l.actividades)
FROM leccion l JOIN curso c ON c.id = l.id_curso
WHERE c.titulo = 'Huerto urbano' AND l.posicion = 1;
SQL
```

Para ver un estado de carga o de guardado sin que pase volando: pausa el backend
con `kill -STOP <pid>` del `npm run dev`, y luego `kill -CONT <pid>`. Para expirar
la sesión: `./expirar` desde `brote_specs`. "Apagar el backend" es detener su `npm
run dev`.

## 2. Backend con curl

Corre estas primero: comprueban la autoridad del servidor sin ningún cliente.

```bash
API=http://localhost:3000
J='Content-Type: application/json'
GIT=$(idCurso 'Git esencial'); GIT1=$(idLeccion 'Git esencial' 1)

# B1. Sin sesión → 401
curl -s -w ' %{http_code}\n' -X POST $API/editor/cursos -H "$J" -d '{"titulo":"X","descripcion":"Y"}'
curl -s -w ' %{http_code}\n' $API/usuarios/yo/cursos
# {"error":"Tu sesión terminó. Vuelve a entrar."} 401  (las dos)

# Entrar con las tres cuentas
for c in creador:a creador2:b autor:autor; do
  curl -s -o /dev/null -c ${c#*:}.txt -X POST $API/sesiones -H "$J" \
    -d "{\"correo\":\"${c%:*}@brote.test\",\"contrasena\":\"brote12345\"}"
done

# B2. Crear un curso y una lección con la cuenta A → 201
curl -s -w ' %{http_code}\n' -b a.txt -X POST $API/editor/cursos -H "$J" \
  -d '{"titulo":"  Curl  ","descripcion":"Prueba"}'
# {"curso":{"id":"…","titulo":"Curl","descripcion":"Prueba","lecciones":[]}} 201  (recortado)
CURL=$(idCurso 'Curl')
curl -s -w ' %{http_code}\n' -b a.txt -X POST $API/editor/cursos/$CURL/lecciones -H "$J" -d '{"titulo":"Uno"}'
curl -s -w ' %{http_code}\n' -b a.txt -X POST $API/editor/cursos/$CURL/lecciones -H "$J" -d '{"titulo":"Dos"}'
# {"leccion":{"id":"…","titulo":"Uno","posicion":1,"cantidadActividades":0}} 201, y "Dos" con posicion 2
UNO=$(idLeccion 'Curl' 1); DOS=$(idLeccion 'Curl' 2)
LECCION=$API/editor/cursos/$CURL/lecciones/$UNO

# B3. Curso ajeno e identificador inventado → exactamente la misma respuesta
curl -s -w ' %{http_code}\n' -b b.txt -X PUT $API/editor/cursos/$CURL -H "$J" -d '{"titulo":"X","descripcion":"Y"}'
curl -s -w ' %{http_code}\n' -b b.txt -X PUT $API/editor/cursos/no-existe -H "$J" -d '{"titulo":"X","descripcion":"Y"}'
# las dos: {"error":"Este curso ya no existe. Tus cambios no se guardaron."} 404
curl -s -w ' %{http_code}\n' -b b.txt $API/editor/cursos/$CURL
curl -s -w ' %{http_code}\n' -b b.txt $API/editor/cursos/no-existe
# las dos: {"error":"Este curso no existe o ya no está disponible."} 404

# B4. Curso publicado, con la sesión de su autor → 403 en todo, y nada cambia
curl -s -w ' %{http_code}\n' -b autor.txt $API/editor/cursos/$GIT
# {"error":"Este curso ya está publicado y por ahora no se puede editar."} 403
curl -s -w ' %{http_code}\n' -b autor.txt -X PUT $API/editor/cursos/$GIT -H "$J" -d '{"titulo":"X","descripcion":"Y"}'
curl -s -w ' %{http_code}\n' -b autor.txt -X PUT $API/editor/cursos/$GIT/lecciones/$GIT1 -H "$J" -d '{"titulo":"X","actividades":[],"version":1}'
curl -s -w ' %{http_code}\n' -b autor.txt -X PUT $API/editor/cursos/$GIT/lecciones-orden -H "$J" -d "{\"idsLecciones\":[\"$GIT1\"]}"
curl -s -w ' %{http_code}\n' -b autor.txt -X DELETE $API/editor/cursos/$GIT
# las cuatro: {"error":"Este curso ya está publicado y por ahora no se puede editar. Tus cambios no se guardaron."} 403
bd <<< "SELECT titulo, (SELECT count(*) FROM leccion l WHERE l.id_curso = c.id) FROM curso c WHERE titulo = 'Git esencial';"
# Git esencial | 6

# B5. Lecciones inválidas → 400 con la actividad que falla, y la lección queda igual
guardar() { curl -s -w ' %{http_code}\n' -b a.txt -X PUT $LECCION -H "$J" -d "$1"; }
LARGO=$(node -p "'x'.repeat(201)")
guardar '{"titulo":"Uno","version":1,"actividades":[{"tipo":"tarjeta","frente":"","reverso":"b"}]}'
guardar "{\"titulo\":\"Uno\",\"version\":1,\"actividades\":[{\"tipo\":\"tarjeta\",\"frente\":\"$LARGO\",\"reverso\":\"b\"}]}"
guardar '{"titulo":"Uno","version":1,"actividades":[{"tipo":"opcionMultiple","pregunta":"p","opciones":[{"texto":"a"},{"texto":" a "}],"correcta":0}]}'
guardar '{"titulo":"Uno","version":1,"actividades":[{"tipo":"opcionMultiple","pregunta":"p","opciones":[{"texto":"a"},{"simbolo":"b"}],"correcta":0}]}'
guardar '{"titulo":"Uno","version":1,"actividades":[{"tipo":"completarEspacios","texto":"a ___ b ___","espacios":[{"aceptadas":["x"]}]}]}'
guardar '{"titulo":"Uno","version":1,"actividades":[{"tipo":"emparejar","pares":[]}]}'
# las seis: {"error":"Revisa los datos marcados.","campos":{"actividades.0":"…"}} 400
guardar "{\"titulo\":\"Uno\",\"version\":1,\"actividades\":$(node -p "JSON.stringify(Array(51).fill({tipo:'tarjeta',frente:'a',reverso:'b'}))")}"
# {"error":"Revisa los datos marcados.","campos":{"actividades":"Una lección puede tener hasta 50 actividades."}} 400
bd <<< "SELECT version, actividades FROM leccion WHERE id = '$UNO';"
# 1 | []

# B6. Título y número de lecciones
TITULO=$(node -p "'x'.repeat(101)")
curl -s -w ' %{http_code}\n' -b a.txt -X POST $API/editor/cursos -H "$J" -d "{\"titulo\":\"$TITULO\",\"descripcion\":\"Y\"}"
curl -s -w ' %{http_code}\n' -b a.txt -X PUT $API/editor/cursos/$CURL -H "$J" -d "{\"titulo\":\"$TITULO\",\"descripcion\":\"Y\"}"
# las dos: {"error":"Revisa los datos marcados.","campos":{"titulo":"…"}} 400
CIEN=$(idCurso 'Curso con cien lecciones')
curl -s -w ' %{http_code}\n' -b autor.txt -X POST $API/editor/cursos/$CIEN/lecciones -H "$J" -d '{"titulo":"La 101"}'
# {"error":"Un curso puede tener hasta 100 lecciones."} 400

# B7. Versión más nueva
TARJETA='[{"tipo":"tarjeta","frente":"a","reverso":"b"}]'
guardar "{\"titulo\":\"Uno\",\"version\":1,\"actividades\":$TARJETA}"
# {"leccion":{…,"version":2,…}} 200
guardar "{\"titulo\":\"Viejo\",\"version\":1,\"actividades\":[]}"
# {"error":"Se guardó una versión más nueva de esta lección."} 409
bd <<< "SELECT titulo, version FROM leccion WHERE id = '$UNO';"
# Uno | 2  (no cambió)
guardar "{\"titulo\":\"Reemplazo\",\"version\":1,\"reemplazar\":true,\"actividades\":$TARJETA}"
# {"leccion":{…,"titulo":"Reemplazo","version":3,…}} 200

# B8. Reordenar no cambia la versión, y una lista vieja no pasa
curl -s -w ' %{http_code}\n' -b a.txt -X PUT $API/editor/cursos/$CURL/lecciones-orden -H "$J" -d "{\"idsLecciones\":[\"$DOS\",\"$UNO\"]}"
# {"curso":{…"lecciones":[{"titulo":"Dos","posicion":1,…},{"titulo":"Reemplazo","posicion":2,…}]}} 200
bd <<< "SELECT posicion, titulo, version FROM leccion WHERE id_curso = '$CURL' ORDER BY posicion;"
# 1 | Dos | 1
# 2 | Reemplazo | 3
curl -s -w ' %{http_code}\n' -b a.txt -X PUT $API/editor/cursos/$CURL/lecciones-orden -H "$J" -d "{\"idsLecciones\":[\"$DOS\"]}"
# {"error":"El orden no coincide con las lecciones del curso."} 409

# B9. Eliminar renumera, y lo publicado no está en la lista ajena
curl -s -w ' %{http_code}\n' -b a.txt -X DELETE $API/editor/cursos/$CURL/lecciones/$DOS
# 204
bd <<< "SELECT posicion, titulo FROM leccion WHERE id_curso = '$CURL';"
# 1 | Reemplazo
curl -s -b autor.txt $API/usuarios/yo/cursos | grep -c 'Git esencial'   # 1
curl -s -b a.txt $API/usuarios/yo/cursos | grep -c 'Git esencial'       # 0
curl -s -w ' %{http_code}\n' -b a.txt -X DELETE $API/editor/cursos/$CURL
# 204
```

Al terminar la sección: `npm run bd:sembrar` para volver al estado inicial.

## 3. Criterios de la spec

Empieza cada grupo en el estado inicial (`npm run bd:sembrar`) con la cuenta A,
salvo que diga otra cosa. Dentro de un grupo, los criterios van en orden y cada uno
sigue donde quedó el anterior.

### Cursos que creé

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Sin cursos | Con la cuenta A, abre "Mi panel" | Debajo de "Sigue aprendiendo", "Cursos que creé" con "Todavía no creas ningún curso.", "Crea uno y enseña lo que sabes." y "Nuevo curso" |
| [web] Con estados | Con la cuenta autor, abre "Mi panel" | "Git esencial" con "Publicado", "6 lecciones" y "Ver curso". "Curso en borrador" con "Borrador" y "Editar" |
| [web] Editar y Ver curso | Pulsa "Editar" en "Curso en borrador"; vuelve. Pulsa "Ver curso" en "Git esencial"; vuelve con "Cursos" | El mapa del borrador. El detalle de "Git esencial", y volver regresa a "Mi panel" |
| [web] Sube al primer lugar | Con la cuenta A, crea "Uno" y luego "Dos". En "Mi panel", abre "Uno" (el de abajo), cambia su título y guarda; vuelve | "Uno" queda primero |
| [web] Cursos ajenos | Entra con la cuenta B y abre "Mi panel" | "Todavía no creas ningún curso." |

### Crear un curso

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Formulario | Pulsa "Nuevo curso"; luego "Cancelar" | Un formulario con título y descripción. "Cancelar" vuelve a "Mi panel" y no hay curso nuevo |
| [web] Obligatorios | "Nuevo curso"; escribe solo espacios en el título, deja vacía la descripción y pulsa "Crear curso" | "Este campo es obligatorio." en los dos. No se crea nada |
| [web] Límites | Pega 101 caracteres en el título y 1001 en la descripción | Se quedan en 100 y 1000 |
| [web] Crear | Crea "Huerto urbano" con una descripción | Su mapa, con "Borrador", "Este curso todavía no tiene lecciones." y "Agrega la primera para empezar.". En "Mi panel", primero y con "Sin lecciones" |
| [web, móvil] No se publica | Con la cuenta A, abre el catálogo y busca "Huerto urbano", en los dos clientes | No aparece |
| [web] Detalle oculto | Copia el identificador de la dirección del mapa y abre `/cursos/<id>` | "Este curso no existe o ya no está disponible." |
| [web] Una sola vez | Pausa el backend; llena el formulario y pulsa "Crear curso" varias veces; reanuda | "Crear curso" se queda con su indicador, y en "Mi panel" hay un solo curso nuevo |

### Datos del curso

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Guardar datos | En el mapa de "Huerto urbano", mira "Guardar cambios". Cambia el título a "Azotea verde"; guarda; recarga | Deshabilitado hasta cambiar algo. "Cambios guardados". Al recargar, "Azotea verde" con la "A" en la portada |
| [web] Título vacío | Borra el título, pulsa "Guardar cambios", acepta salir y recarga | "Este campo es obligatorio.". Al recargar, sigue "Azotea verde" |
| [web] Guardando los datos | Agrega dos lecciones. Pausa el backend; cambia el título y pulsa "Guardar cambios"; intenta agregar, mover y eliminar una lección; reanuda | "Guardar cambios" con su indicador, y la lista y "Eliminar curso" deshabilitados |
| [web] Eliminar curso | Pulsa "Eliminar curso"; "Cancelar". Otra vez "Eliminar curso"; "Eliminar". Abre la dirección que tenía el mapa | "¿Eliminar este curso?" con "Se borrará con todas sus lecciones. No se puede deshacer.". "Cancelar" no cambia nada. "Eliminar" lleva a "Mi panel", sin el curso. La dirección: "Este curso no existe o ya no está disponible." |

### Lecciones

Crea un curso "Huerto urbano" con la cuenta A.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Título obligatorio | "Nueva lección"; pulsa "Agregar" con el título vacío. Pega 101 caracteres | "Este campo es obligatorio." y no se agrega. Se queda en 100 |
| [web] Agregar | Agrega "Semillas", "Riego" y "Cosecha" | En ese orden, numeradas de 1 a 3, con "Sin actividades" |
| [web] Una sola vez | Pausa el backend; escribe "Compost" y pulsa "Agregar" varias veces; reanuda. Elimina "Compost" | "Agregar" se queda con su indicador, y se agrega una sola lección |
| [web] Arrastrar | Arrastra "Cosecha" al primer lugar; recarga | "1. Cosecha", "2. Semillas", "3. Riego", también después de recargar |
| [web] Con el teclado | Con Tab llega a "Bajar" de la primera; Enter. Luego a "Subir" de la segunda; Enter. Mira "Subir" en la primera y "Bajar" en la última | Cambia el orden y vuelve, y el foco sigue en el botón. Los de los extremos se ven deshabilitados |
| [web] Eliminar lección | "Eliminar" en "Riego"; "Cancelar". Otra vez "Eliminar"; "Eliminar". Recarga | "¿Eliminar esta lección?" con "Se borrará con todas sus actividades. No se puede deshacer.". "Cancelar" no cambia nada. "Eliminar" la quita y las demás se renumeran, también al recargar |
| [web] Máximo | Con la cuenta autor, abre "Curso con cien lecciones" | "Nueva lección" deshabilitado y "Un curso puede tener hasta 100 lecciones." |

### Paleta

Crea "Huerto urbano" y la lección "Semillas", y abre su lienzo.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Grupos | Mira la paleta | "Básicos" (Teoría, Tarjeta, Opción múltiple, Completar espacios, Pregunta abierta), "Relacionar" (Emparejar, Clasificar, Ordenar, Banco de palabras), "Código y terminal" (Reto de código, Terminal simulada, Grafo de commits) y "Voz" (Escuchar y repetir) |
| [web] No disponibles | Intenta arrastrar "Emparejar" a la secuencia; púlsalo; llega a él con Tab y pulsa Enter | Los 8 dicen "Próximamente". No se agrega nada |
| [web] Arrastrar | Agrega dos teorías. Arrastra "Tarjeta" entre las dos | La tarjeta queda en el lugar 2 |
| [web] Pulsar | Selecciona la actividad 2 y pulsa "Teoría". Completa todo, guarda y recarga (al abrir no hay ninguna seleccionada); pulsa "Teoría" | La primera queda en el lugar 3; la segunda, al final. Las dos quedan seleccionadas con el foco en su primer campo |
| [web] Con el teclado | Con Tab llega a "Pregunta abierta" y pulsa Enter | Se agrega sin usar el ratón |
| [web] Máximo | Con la cuenta autor, abre "Lección con el máximo" y su lección | Los tipos deshabilitados y "Una lección puede tener hasta 50 actividades." |

### Secuencia de bloques

Crea "Huerto urbano" y la lección "Semillas", y abre su lienzo.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Vacía | Mira la secuencia | "Esta lección todavía no tiene actividades." y "Arrastra un tipo de la paleta o púlsalo para agregarlo." |
| [web] Bloque | Agrega una teoría; mira el bloque. Escribe en "Texto" | Primero "Sin contenido"; después el inicio del texto, que cambia al escribir, con su número y "Teoría" |
| [web] Incompleta | Agrega una tarjeta; llena frente y reverso | "Incompleta" con su icono desde que se agrega; desaparece al completarla |
| [web] Seleccionar | Completa todo, guarda y recarga; pulsa un bloque. Recarga; llega a otro bloque con Tab y pulsa Enter | Al abrir, "Elige una actividad para editarla."; después, su formulario, con el ratón y con el teclado |
| [web] Reordenar | Arrastra un bloque a otro lugar; usa "Subir" y "Bajar" | Cambia el orden en los dos casos |
| [web] Eliminar | Selecciona un bloque; "Eliminar"; confirma | "¿Eliminar esta actividad?" con "Perderás lo que escribiste en ella.". Después, "Elige una actividad para editarla." |
| [web] Ventana angosta | Angosta la ventana a menos de 1024 px; agrega, edita, reordena y guarda sin arrastrar | Las zonas se apilan y todo funciona con botones |
| [web] Lector de pantalla | Con el lector activo (VoiceOver o NVDA), recorre la paleta. Mueve un bloque con "Bajar" y, en el mapa, una lección | Los tipos con "Próximamente" se anuncian como no disponibles. Al mover, "Movida a la posición {n}" |

### Formularios

Crea "Huerto urbano" y la lección "Semillas", y abre su lienzo.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Teoría | Agrega una teoría; llena solo "Texto". Pulsa "Agregar punto" hasta que no deje; deja una fila vacía; guarda; revisa con P3 | Deja de estar incompleta. Se deshabilita con 10 filas. La fila vacía no se guardó |
| [web] Ayudas | Mira los campos de una teoría y de completar espacios | "Separa los párrafos con un renglón en blanco.", "Las líneas que empiezan con +, - o @@ se resaltan como un diff." y "Cada ___ es un espacio que el alumno llena." |
| [web] Tarjeta | Agrega una tarjeta; llena frente, luego reverso | "Incompleta" hasta llenar los dos |
| [web] Opciones | Agrega una opción múltiple; mira "Quitar". Pulsa "Agregar opción" hasta que no deje | Dos opciones vacías; con 2, "Quitar" deshabilitado; con 9, "Agregar opción" deshabilitado |
| [web] Opción correcta | Llena la pregunta y dos opciones, sin marcar correcta; guarda. Marca una, quítala | "Elige la opción correcta.". Al quitarla, ninguna queda marcada |
| [web] Repetida | Opciones "Rojo" y " Rojo "; guarda. Cambia la segunda por "rojo"; guarda | "Esta opción está repetida." en la segunda. Con "rojo" se guarda |
| [web] Símbolos | Con tipo "Símbolo", opciones "あ" e "い" y una correcta; mira la vista previa. Cambia a "Texto", escribe "Amarillo", vuelve a "Símbolo" y guarda | Mosaicos con los símbolos. "Amarillo" sigue escrito y aparece "Un símbolo puede tener hasta 4 caracteres." |
| [web] Agregar espacio | En completar espacios, escribe "Hola mundo", pon el cursor justo antes de "mundo" y pulsa "Agregar espacio". Escribe otro `___` a mano | Queda "Hola ___mundo" y aparece "Espacio 1"; después, "Espacio 2" |
| [web] Marcas | Con un texto sin `___`, guarda. Pega 21 `___` separados por espacios y guarda | "Agrega al menos un espacio con ___." y "El texto puede tener hasta 20 espacios." |
| [web] Grupos de más | Con dos `___` y una respuesta en cada grupo, borra un `___`. Pulsa "Quitar espacio" en uno. Repite con un grupo vacío | Los dos grupos siguen, con "Hay más grupos de respuestas que espacios en el texto. Quita los que sobran.", "Quitar espacio" y el bloque "Incompleta" hasta quitar uno. El grupo vacío desaparece solo |
| [web] Respuestas | Pulsa "Agregar respuesta" hasta que no deje; mira la primera | Hasta 10. La primera dice "Es la que ve el alumno como respuesta esperada" |
| [web] Pregunta abierta | Agrega una; llena pregunta, luego solución | "Incompleta" hasta llenar las dos |
| [web] Límites | Pega en cada campo un texto más largo que su límite, según la tabla de "Datos de entrada" de la spec | Cada campo se queda en su límite |

### Vista previa

Crea la lección con los cinco tipos de la tabla de la sección 1.1.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Como el reproductor | Selecciona la opción múltiple; en la vista previa elige "Sal" y pulsa "Comprobar" | Se ve como en el reproductor; la barra de respuesta queda dentro de la vista previa, con "Respuesta correcta: Agua" |
| [web] Los demás tipos | Voltea la tarjeta. En completar espacios escribe "AGUA" y comprueba. En la pregunta abierta escribe algo y comprueba | Se voltea. "¡Correcto!". Aparece la solución de referencia |
| [web] Foco | Selecciona la teoría y escribe una frase larga en "Texto", sin parar | No se pierde ninguna letra y el foco se queda en el campo. La vista previa se actualiza |
| [web] Teclas | Selecciona la opción múltiple. Pulsa en la secuencia, fuera de un campo, y teclea 1 y Enter. Pulsa dentro de la vista previa y teclea 1 y Enter | Fuera no pasa nada. Dentro se elige la opción y se comprueba |
| [web] Reiniciar | Comprueba una pregunta y pulsa "Reiniciar". Comprueba otra vez y pulsa "Continuar" | En los dos casos la actividad vuelve al principio |
| [web] Incompleta | Borra un campo obligatorio | "Completa esta actividad para ver su vista previa." |

### Probar la lección

Crea la lección con los cinco tipos de la sección 1.1, sin guardar los últimos
cambios, salvo que se diga otra cosa.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Sin actividades | Abre una lección vacía | "Probar lección" deshabilitado |
| [web] Incompletas | Deja incompletas dos actividades; pulsa "Probar lección". Repite con una | "No se puede probar: hay 2 actividades incompletas." y, con una, "No se puede probar: hay 1 actividad incompleta.". Queda seleccionada la primera, con sus errores y el foco en su primer campo con error |
| [web] Abrir | Completa todo, sin guardar; pulsa "Probar lección" | El reproductor a pantalla completa, con "Modo de prueba: esto no cuenta como progreso." y la primera actividad, con lo que hay en el lienzo |
| [web] Terminar | Recorre la lección hasta el final | "¡Lección completada!", "Semillas" y "Acertaste {a} de 3", con "Volver al editor", sin "Guardando tu progreso…" ni "Progreso guardado" |
| [web] Volver | Prueba tres veces, saliendo con "Volver al editor", con la X a mitad y con el botón de volver del navegador | Nada pregunta. Vuelves al lienzo con "Cambios sin guardar" y la misma actividad seleccionada |
| [web] Sin servidor | Apaga el backend; prueba la lección de principio a fin; enciéndelo | Funciona sin errores |
| [web, móvil] Sin progreso | Guarda y prueba la lección. Corre P1 (publicar). Con la cuenta A, abre el detalle en los dos clientes | La lección aparece sin completar y "0 de 1 lección" |

### Guardar

Crea "Huerto urbano" y la lección "Semillas", y abre su lienzo.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Botón | Mira "Guardar lección"; agrega una teoría | Deshabilitado; después, "Cambios sin guardar" y habilitado |
| [web] Guardar | Con tres actividades completas, guarda; recarga; ve al mapa | "Lección guardada". Las tres, en orden y con sus datos. El mapa dice "3 actividades" |
| [web] Incompletas | Agrega dos incompletas; guarda. Repite con una. Recarga y acepta salir | "No se guardó: hay 2 actividades incompletas." y, con una, "No se guardó: hay 1 actividad incompleta.". Seleccionada la primera con sus errores y el foco en su primer campo con error. Al recargar, la lección como antes |
| [web] Título vacío | Borra el título de la lección; guarda | "Este campo es obligatorio." en el título y no se guarda |
| [web] Sin actividades | Elimina todas las actividades; guarda | "Lección guardada" |
| [web] Lo que se guarda | Agrega una teoría con solo "Texto" y, en otra, un código con sangría; guarda; revisa con P3; recarga | La primera sin `titulo` ni `puntosClave`. El código conserva su sangría |
| [web] Guardando | Pausa el backend; cambia algo; guarda; intenta editar; reanuda | "Guardar lección" con indicador, y paleta, secuencia e inspector deshabilitados |
| [web, móvil] De principio a fin | Arma la lección con los cinco tipos de la sección 1.1 y guarda. Corre P1. Con la cuenta B, cúrsala en la web y en el móvil | Se ve igual que en la vista previa y al final dice "Acertaste {a} de 3" |

### Versión más nueva

Crea "Huerto urbano" y la lección "Semillas" con una teoría, y abre el lienzo en
dos pestañas.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Pregunta | Cambia el texto en la primera y guarda. Cambia el texto en la segunda y guarda | "Esta lección cambió en otro lugar", con "Se guardó una versión más nueva en otra pestaña o dispositivo. Si guardas, la reemplazarás.", "Cancelar" y "Reemplazar" |
| [web] Cancelar | "Cancelar". Recarga la segunda pestaña y acepta salir | Sigue con tus cambios y "Cambios sin guardar". Después, lo que guardó la primera |
| [web] Reemplazar | Repite hasta la pregunta y pulsa "Reemplazar". Recarga la primera pestaña | "Lección guardada". En la primera, lo de la segunda |
| [web] Dos veces seguidas | En una pestaña recién cargada, guarda un cambio; guarda otro | No pregunta nada |
| [web] Reordenar no cuenta | Con dos lecciones, ten el lienzo abierto con un cambio. En otra pestaña, reordena las lecciones y cambia los datos del curso. Guarda en el lienzo | "Lección guardada", sin pregunta |
| [backend] Versión vieja | Sección 2, B7 | 409 y la lección no cambia; con `reemplazar`, 200 |

### Salir sin guardar

Crea "Huerto urbano" y la lección "Semillas", y abre su lienzo.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Volver al curso | Agrega una teoría; "Volver al curso"; "Seguir aquí". Otra vez; "Salir". Vuelve a abrir la lección | "¿Salir sin guardar?" con "Perderás los cambios que no guardaste.". "Seguir aquí" deja todo igual. "Salir" lleva al mapa y la teoría no está |
| [web] Volver del navegador | Agrega una teoría; pulsa el botón de volver del navegador | La misma pregunta |
| [web] Datos del curso | En el mapa, cambia el título. Pulsa "Mi panel"; "Seguir aquí". Pulsa una lección | La misma pregunta en los dos casos |
| [web] Sin cambios | Abre el lienzo sin cambiar nada; "Volver al curso" | Sale directo |
| [web] Recargar | Con cambios, recarga. Cancela. Guarda y recarga | El navegador avisa antes de salir; sin cambios, no avisa |

### Permisos y cursos publicados

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Curso ajeno | Con la cuenta A, crea "Huerto urbano" y copia la dirección del mapa. Con la cuenta B, ábrela. Abre `/editor/inventado` | Las dos: "Este curso no existe o ya no está disponible." y "Ir a Mi panel" |
| [web] Lección ajena | Con la cuenta A, abre `/editor/<id de Huerto urbano>/lecciones/inventado`. Con la cuenta autor, abre un borrador suyo con el `idLeccion` de otro curso | Las dos: "Esta lección no existe o ya no está disponible." y "Ir a Mi panel" |
| [web] Curso publicado | Con la cuenta autor, abre `/editor/<id de Git esencial>` y `/editor/<id>/lecciones/<id de su lección 1>` | Las dos: "Este curso ya está publicado y por ahora no se puede editar." y "Ver curso" |
| [web] Publicado a mitad | Con el lienzo de "Huerto urbano" abierto, cambia algo. Corre P1 (publicar). Guarda | "Este curso ya está publicado y por ahora no se puede editar. Tus cambios no se guardaron.", y lo escrito sigue en pantalla |
| [backend] Sin sesión y ajeno | Sección 2, B1 y B3 | 401. Curso ajeno e inventado: la misma respuesta |
| [backend] Curso publicado | Sección 2, B4 | 403 en todo y "Git esencial" no cambia |
| [backend] Lecciones inválidas | Sección 2, B5 | 400 en todas, y la lección queda igual |
| [backend] Título y máximos | Sección 2, B6 | 400 y nada cambia |

### Contenido

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Textos con etiquetas | Con la cuenta autor, mira "Texto `<b>hola</b>` `<script>`" en "Cursos que creé"; abre su mapa, su lección y cada actividad, con su vista previa | Los textos tal cual, sin negritas y sin ejecutar nada, en la tarjeta, el mapa, los bloques, el inspector y la vista previa |

### Estados y errores

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Cargando | Pausa el backend; abre "Mi panel", el mapa y el lienzo; reanuda | Un indicador en cada uno, sin mensajes de vacío ni por un instante |
| [web] Servidor apagado al cargar | Apaga el backend; abre "Mi panel", el mapa y el lienzo. Enciéndelo y pulsa "Reintentar" | "Sigue aprendiendo" y "Cursos que creé" muestran cada una "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y su "Reintentar". El mapa y el lienzo también. Después, los datos |
| [web] Guardar sin servidor | Con cambios en el lienzo, apaga el backend; guarda. Enciéndelo; guarda | "No se pudo guardar la lección. Tus cambios siguen aquí."; después, "Lección guardada" |
| [web] Formularios sin servidor | Apaga el backend. Pulsa "Crear curso" con el formulario lleno. En un mapa, cambia el título y guarda | "No se pudo crear el curso. Inténtalo de nuevo en un momento." y "No se pudieron guardar los cambios.". Lo escrito sigue ahí |
| [web] Lecciones sin servidor | Con el mapa abierto, apaga el backend. Reordena. Agrega una lección. Elimina una lección. Elimina el curso | "No se pudo guardar el nuevo orden." y la lista vuelve al orden anterior. "No se pudo agregar la lección." y el título sigue en el campo. "No se pudo eliminar la lección." y "No se pudo eliminar el curso.", y siguen ahí |
| [web] Eliminado en otra pestaña | Con el lienzo abierto y un cambio, elimina la lección desde otra pestaña; guarda. Repite eliminando el curso | "Esta lección ya no existe. Tus cambios no se guardaron." y "Este curso ya no existe. Tus cambios no se guardaron.". Lo escrito sigue en pantalla |
| [web] Sesión al guardar | Con cambios en el lienzo, corre `./expirar`; guarda; entra con la misma cuenta; guarda | "Entrar" con "Tu sesión terminó. Vuelve a entrar.". Al entrar, el lienzo con tus cambios y "Cambios sin guardar". Después, "Lección guardada" |
| [web] Sesión en los formularios | Con "Nuevo curso" lleno, corre `./expirar`; pulsa "Crear curso"; entra. Repite con los datos de un mapa y "Guardar cambios" | "Entrar" con el aviso. Al entrar, el formulario con lo que escribiste |
| [web] Sesión en el mapa | En un mapa con dos lecciones, cambia el título del curso sin guardar y escribe un título en "Nueva lección". Corre `./expirar`; reordena; entra con la misma cuenta | "Entrar" con el aviso. Al entrar, el mapa con el título cambiado, "Guardar cambios" habilitado y el título en "Nueva lección". El orden no cambió |
| [web] Otra cuenta | Con cambios en el lienzo de la cuenta A, corre `./expirar`; guarda; entra con la cuenta B. Abre la dirección del lienzo. Cierra sesión y entra con la cuenta A | Con la B: "Este curso no existe o ya no está disponible.". Con la A: el lienzo sin esos cambios, porque se descartaron |
| [web] Sesión al abrir | Corre `./expirar`; abre un mapa; entra | "Entrar" con el aviso; al entrar, ese mapa |

## 4. Antes del PR

- `npm run tipos` y `npm run lint` en los tres repos de código.
- `npm run contrato:revisar` en `brote_specs`.
- `npm run bd:sembrar` deja la base como al principio.
- Repite de F03 "Teclado", "Opción múltiple" y "Completar espacios": las teclas 1 a 9
  y Enter, el foco al cambiar de actividad y la barra inferior fija siguen igual en
  el reproductor, porque F05 toca `BarraRespuesta` y `useEnfocarAlMontar`.
- Repite de F04 "Mi panel": "Sigue aprendiendo" sigue igual con la sección nueva.
- Marca los criterios en `spec.md` y enlista en cada PR los que cubre.
