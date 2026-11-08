# Guía de validación: F13 Imágenes propias en los cursos

Cómo levantar los repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). La feature está terminada cuando todos están marcados (principio
VIII). Lo que acepta y rechaza el servidor está en [contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: los de F01 a F12 (Node 24, PostgreSQL, Chrome y Expo Go para el SDK 58, en el
iPhone) y una Mac (los archivos de la sección 1.2 usan `sips`). Cada repo en su rama
`feature/F13-imagenes-propias`, que sale de `feature/F12-actividades-codigo-terminal`
mientras F11 y F12 no estén en `dev` (plan.md, "Resumen").

```bash
# brote_specs: copiar el contrato 0.10.0 y comprobar las copias
npm run contrato:copiar && npm run contrato:revisar

# brote_backend_express
npm install
npx prisma migrate deploy && npm run bd:generar
npm run bd:sembrar         # borra el progreso de las cuentas @brote.test
npm run dev                # API en http://localhost:3000
npm run proxy:validacion   # proxy en :3001 hacia :3000 (sección 1.4)

# brote_web_react, contra el proxy
VITE_URL_API=http://localhost:3001 npm run dev    # http://localhost:5173

# brote_mobile_expo, contra el proxy (npm install trae expo-image)
npm install
echo "EXPO_PUBLIC_URL_API=http://$(ipconfig getifaddr en0):3001" > .env
npx expo start             # abrir con Expo Go en el iPhone
```

### 1.1 Datos de prueba

`npm run bd:sembrar` deja las cuentas de siempre (`autor@`, `autor2@`, `creador@` y
`creador2@`, en `brote.test`, con `brote12345`). "Actividades de prueba" (de `autor@`, en
borrador) gana una **portada** de 1600 × 900 px (una figura al centro y una franja roja a la
izquierda, una azul a la derecha y una verde abajo) y seis lecciones al final, de la 13 a la
18. Las figuras son dibujos de 400 × 400 px sobre fondo transparente, con el nombre de su
forma y su color ("círculo rojo", "pentágono naranja"). `HTML` es
`<b>hola</b> <script>alert(1)</script>`, como en F03.

| Lección | Actividades |
|---|---|
| 13. Teoría con imágenes | **"Imágenes entre párrafos"**: "Primer párrafo, antes del panorama.", `[imagen]` (el panorama de 1600 × 400 px, con una barra negra en cada extremo, texto alternativo "Panorama con un círculo a la izquierda y un cuadrado a la derecha"), "Segundo párrafo, con una imagen chica `[imagen]` a la mitad." (una imagen de 120 × 80 px, sin texto alternativo), "Tercer párrafo, después de las dos imágenes." y el punto clave "Las imágenes van en el texto, antes de los puntos clave". **"Solo una imagen alta"**: solo `[imagen]`, con una imagen de 400 × 1600 px ("Columna de cuatro figuras"). **"Cinco imágenes"**: cinco marcas con el círculo rojo, el cuadrado azul, el triángulo verde, la estrella amarilla y el óvalo morado |
| 14. Opción múltiple con imágenes | **"¿Qué figura es esta?"**: la imagen del círculo rojo ("Círculo rojo") y las opciones "Círculo" (correcta), "Cuadrado" y "Triángulo". **"¿Cuál es el cuadrado azul?"**: círculo rojo, cuadrado azul (correcta), triángulo verde y estrella amarilla, con su nombre como texto alternativo ("Cuadrado azul"). **"¿Cuál es el triángulo?"**: círculo rojo, triángulo verde (correcta) y cuadrado azul, sin texto alternativo |
| 15. Relacionar con imágenes | **Emparejar** "Une cada figura con su nombre": a la izquierda círculo rojo, cuadrado azul, triángulo verde y estrella amarilla (con texto alternativo); a la derecha "Círculo", "Cuadrado", "Triángulo" y "Estrella". **Emparejar** "Une cada figura con su contorno": círculo, cuadrado y triángulo rellenos con sus contornos, sin texto alternativo. **Clasificar** "¿Tiene esquinas?": cuadrado azul y triángulo verde en "Tiene esquinas"; círculo rojo y óvalo morado en "No tiene esquinas". **Ordenar** "Ordena de menos a más lados": triángulo verde, cuadrado azul, pentágono naranja y hexágono turquesa |
| 16. GIF | **Teoría** "Un GIF": "Este círculo se mueve:" y un GIF de 200 × 200 px de un círculo que va y viene ("Un círculo que va y viene"). **Opción múltiple** "¿Cuál se mueve?": el GIF (correcta, "Círculo que se mueve"), el círculo rojo ("Círculo quieto") y el cuadrado azul ("Cuadrado quieto") |
| 17. Imágenes al límite | **Opción múltiple** "¿Cuál tiene 7 lados?": 9 polígonos, de 3 a 11 lados. **Emparejar** de 8 parejas: los polígonos de 3 a 10 lados rellenos con sus contornos. **Clasificar** de 12 en "Rojas", "Azules", "Verdes" y "Amarillas": círculo, cuadrado y triángulo de cada color. **Ordenar** de 10: los polígonos de 3 a 12 lados |
| 18. Imágenes con etiquetas | **Opción múltiple** "¿Cuál es la correcta?": dos figuras con `<b>hola</b>` y `<script>alert(1)</script>` como texto alternativo (la correcta es la segunda) |

### 1.2 Archivos para subir

```bash
ARCH=<scratchpad>/archivos-f13
npm run imagenes:validacion -- $ARCH    # en brote_backend_express; usa sips de macOS
ls $ARCH
```

| Archivo | Qué es |
|---|---|
| `foto-4000x3000.jpg` | JPEG de 4000 × 3000 px, de unos 2 MB |
| `foto-800x600.jpg` | JPEG de 800 × 600 px |
| `transparente.png` | PNG de 600 × 600 px con un círculo sobre fondo transparente |
| `de-lado.jpg` | JPEG de 800 × 600 px con una flecha que apunta a la izquierda y la orientación EXIF 6: bien enderezado, mide 600 × 800 y la flecha apunta hacia arriba |
| `con-ubicacion.jpg` | JPEG con ubicación (19.43° N, 99.13° O) y el modelo de cámara "Brote Cam" en su EXIF |
| `gif-2mb.gif` | GIF animado de unos 2 MB |
| `gif-6mb.gif` | GIF animado de unos 6 MB |
| `gif-5mb-1.gif` a `gif-5mb-6.gif` | Seis GIF distintos, de 4.9 MB cada uno |
| `grande-11mb.jpg` | JPEG de 11 MB |
| `dibujo.svg`, `foto.heic` | Formatos que no se aceptan |
| `texto.png` | Un archivo de texto con extensión `.png` |

### 1.3 Atajos

`bd`, `idCurso` e `idLeccion` son los de F03 y F12.

```bash
API=http://localhost:3000
J='Content-Type: application/json'
bd() { psql -X -q postgresql://brote:brote@localhost:5432/brote; }
idCurso() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM curso WHERE titulo = '$1';"; }
idLeccion() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT l.id FROM leccion l JOIN curso c ON c.id = l.id_curso WHERE c.titulo = '$1' AND l.posicion = $2;"; }
entrar() { curl -s -o /dev/null -c $1.txt -X POST $API/sesiones -H "$J" -d "{\"correo\":\"$1@brote.test\",\"contrasena\":\"brote12345\"}"; }
subir() { curl -s -w ' %{http_code}\n' -b $1.txt -X POST $API/editor/cursos/$2/imagenes -H "Content-Type: $3" --data-binary @$4; }

# L1. Publicar y retirar "Actividades de prueba"
bd <<< "UPDATE curso SET publicado = true  WHERE titulo = 'Actividades de prueba';"
bd <<< "UPDATE curso SET publicado = false WHERE titulo = 'Actividades de prueba';"

# L2. Las imágenes de un curso
bd <<< "SELECT id, formato, ancho, alto, peso, subida_en FROM imagen WHERE id_curso = '$(idCurso 'Actividades de prueba')' ORDER BY subida_en;"
```

**C1. Curso "Imágenes"** (de `creador@`), para el editor: créalo en la web ("Nuevo curso",
título "Imágenes", descripción "Prueba") con una lección "Una" y otra "Pesada".

**C2. Curso casi lleno** (de `creador@`):

```bash
entrar creador
curl -s -o /dev/null -b creador.txt -X POST $API/editor/cursos -H "$J" -d '{"titulo":"Casi lleno","descripcion":"Prueba"}'
LLENO=$(idCurso 'Casi lleno')
curl -s -o /dev/null -b creador.txt -X POST $API/editor/cursos/$LLENO/lecciones -H "$J" -d '{"titulo":"Una"}'
# una imagen real, guardada en la lección: en la web, abre "Una" como creador@, agrega una
# teoría con "[imagen]", sube gif-5mb-1.gif y guarda
# el relleno: 194 imágenes de 1 MB sin usar, recién subidas
bd <<SQL
INSERT INTO imagen (id, id_curso, huella, formato, ancho, alto, peso, datos)
SELECT gen_random_uuid()::text, '$LLENO', md5('relleno' || i), 'gif', 1, 1, 1048576, decode(repeat('00', 1048576), 'hex')
FROM generate_series(1, 194) i;
SQL
bd <<< "SELECT sum(peso) / 1048576.0 AS mb FROM imagen WHERE id_curso = '$LLENO';"   # ~198.9
```

Así no cabe `gif-2mb.gif` (198.9 + 2 > 200), pero sí después de quitar el GIF de 4.9 MB y
guardar (194 + 2).

### 1.4 Proxy de validación

`npm run proxy:validacion` pasa todo de `:3001` a `:3000`, salvo que se le pida otra cosa
para las imágenes (`GET /imagenes/*`):

```bash
curl -X POST localhost:3001/__modo/normal     # pasa todo
curl -X POST localhost:3001/__modo/bloquear   # las imágenes responden con error de red
curl -X POST localhost:3001/__modo/retrasar   # las imágenes tardan 4 s
```

Para el lector de pantalla: VoiceOver en la Mac y en el iPhone. "Reducir movimiento" y
"Reducir transparencia": en Ajustes del sistema > Accesibilidad > Pantalla (Mac) y en
Ajustes > Accesibilidad > Movimiento y Pantalla y tamaño del texto (iPhone). Para llegar a
una actividad que no es la primera, responde lo que sea en las anteriores.

## 2. Backend con curl

Corre estas primero: comprueban la autoridad del servidor sin ningún cliente.

```bash
entrar autor; entrar creador; entrar creador2
PRUEBA=$(idCurso 'Actividades de prueba')
IMAGENES=$(idCurso 'Imágenes')                      # C1
FIG=<scratchpad>/archivos-f13

# B1. Datos de prueba: la portada y las lecciones 13 a 18, sin mover las 12 anteriores
bd <<SQL
SELECT c.id_portada IS NOT NULL AS con_portada FROM curso c WHERE c.id = '$PRUEBA';
SELECT posicion, titulo, cardinality(imagenes) FROM leccion WHERE id_curso = '$PRUEBA' ORDER BY posicion;
SQL
# con_portada t; posiciones 1 a 12 con los títulos de F12; 13 "Teoría con imágenes", 14
# "Opción múltiple con imágenes", 15 "Relacionar con imágenes", 16 "GIF", 17 "Imágenes al
# límite", 18 "Imágenes con etiquetas", cada una con imágenes

# B2. El mismo archivo dos veces: 201 y luego 200, con el mismo id; cuenta una vez
subir creador $IMAGENES image/png $FIG/transparente.png
subir creador $IMAGENES image/png $FIG/transparente.png
bd <<< "SELECT count(*), sum(peso) FROM imagen WHERE id_curso = '$IMAGENES';"

# B3. Rechazos al subir (estado y mensaje de contracts/api.md)
curl -s -w ' %{http_code}\n' -X POST $API/editor/cursos/$IMAGENES/imagenes -H 'Content-Type: image/png' --data-binary @$FIG/transparente.png   # 401
subir creador2 $IMAGENES image/png $FIG/transparente.png       # 404: curso ajeno
subir creador $IMAGENES image/png $FIG/texto.png               # 400 "No se pudo leer la imagen. Elige otra."
subir creador $IMAGENES image/jpeg $FIG/foto-4000x3000.jpg     # 400 "La imagen puede medir hasta 1600 px por lado."
subir creador $IMAGENES image/gif $FIG/gif-6mb.gif             # 400 "Un GIF puede pesar hasta 5 MB."
subir creador $IMAGENES image/jpeg $FIG/grande-11mb.jpg        # 413 "La imagen puede pesar hasta 10 MB."
subir creador $IMAGENES text/plain $FIG/texto.png              # 400 "Elige una imagen JPEG, PNG, WebP o GIF."
subir autor $(idCurso 'Curso en revisión') image/png $FIG/transparente.png   # 403 en revisión
subir autor $(idCurso 'Git esencial') image/png $FIG/transparente.png        # 403 publicado

# B4. Quién trae una imagen (la portada de "Actividades de prueba", en borrador)
PORTADA=$(psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id_portada FROM curso WHERE id = '$PRUEBA';")
curl -s -o /dev/null -w '%{http_code}\n' -b autor.txt $API/imagenes/$PORTADA     # 200, su autor
curl -s -o /dev/null -w '%{http_code}\n' -b creador.txt $API/imagenes/$PORTADA   # 404, otro, en borrador
curl -s -o /dev/null -w '%{http_code}\n' $API/imagenes/$PORTADA                  # 401, sin sesión
# publica con L1 y pide otra vez con creador: 200. Las cabeceras, las de contracts/api.md:
curl -s -D - -o /dev/null -b creador.txt $API/imagenes/$PORTADA
# retirar (L1) al terminar

# B5. Guardar una lección con imágenes mal (cada una, 400 sin guardar nada)
UNA=$(idLeccion 'Imágenes' 1)
LECCION=$API/editor/cursos/$IMAGENES/lecciones/$UNA
guardar() { curl -s -w ' %{http_code}\n' -b creador.txt -X PUT $LECCION -H "$J" -d "{\"titulo\":\"Una\",\"version\":1,\"reemplazar\":true,\"actividades\":[$1]}"; }
img() { echo "{\"id\":\"$1\",\"formato\":\"png\",\"ancho\":10,\"alto\":10,\"peso\":10}"; }
AJENA=$PORTADA                                     # es de "Actividades de prueba"
MIA=$(psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM imagen WHERE id_curso = '$IMAGENES' LIMIT 1;")
guardar "{\"tipo\":\"teoria\",\"texto\":\"[imagen]\",\"imagenes\":[$(img $AJENA)]}"         # imagenes.<id>: no es del curso
guardar "{\"tipo\":\"teoria\",\"texto\":\"[imagen]\",\"imagenes\":[$(img no-existe)]}"      # imagenes.no-existe
guardar "{\"tipo\":\"teoria\",\"texto\":\"Sin marcas\",\"imagenes\":[$(img $MIA)]}"        # más imágenes que marcas
guardar "{\"tipo\":\"opcionMultiple\",\"pregunta\":\"¿?\",\"opciones\":[{\"texto\":\"a\"},{\"imagen\":$(img $MIA)}],\"correcta\":0}"   # mezcladas
guardar "{\"tipo\":\"emparejar\",\"parejas\":[{\"izquierda\":\"a\",\"derecha\":\"x\"},{\"izquierda\":$(img $MIA),\"derecha\":\"y\"},{\"izquierda\":\"c\",\"derecha\":\"z\"}]}"   # columna mezclada
# más de 25 MB: seis GIF de 4.9 MB, cinco en una teoría y uno en una pregunta
for i in 1 2 3 4 5 6; do subir creador $IMAGENES image/gif $FIG/gif-5mb-$i.gif; done
set -- $(psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT string_agg(id, ' ' ORDER BY subida_en) FROM imagen WHERE id_curso = '$IMAGENES' AND peso > 5000000;")
guardar "{\"tipo\":\"teoria\",\"texto\":\"[imagen] [imagen] [imagen] [imagen] [imagen]\",\"imagenes\":[$(img $1),$(img $2),$(img $3),$(img $4),$(img $5)]},{\"tipo\":\"opcionMultiple\",\"pregunta\":\"¿?\",\"imagen\":$(img $6),\"opciones\":[{\"texto\":\"a\"},{\"texto\":\"b\"}],\"correcta\":0}"
# → 400 "Las imágenes de esta lección pesan más de 25 MB. Quita alguna."

# B6. Portada GIF o de otro curso (400, campos.portada)
GIF=$(psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM imagen WHERE id_curso = '$IMAGENES' AND formato = 'gif' LIMIT 1;")
curl -s -w ' %{http_code}\n' -b creador.txt -X PUT $API/editor/cursos/$IMAGENES -H "$J" -d "{\"titulo\":\"Imágenes\",\"descripcion\":\"Prueba\",\"idPortada\":\"$GIF\"}"
curl -s -w ' %{http_code}\n' -b creador.txt -X PUT $API/editor/cursos/$IMAGENES -H "$J" -d "{\"titulo\":\"Imágenes\",\"descripcion\":\"Prueba\",\"idPortada\":\"$AJENA\"}"

# B7. Borrar a un día: una imagen sin usar, con subida_en de hace dos días, se va al subir otra
bd <<< "UPDATE imagen SET subida_en = now() - interval '2 days' WHERE id = '$MIA';"
subir creador $IMAGENES image/jpeg $FIG/foto-800x600.jpg
bd <<< "SELECT count(*) FROM imagen WHERE id = '$MIA';"          # 0

# B8. Eliminar una lección y el curso, en un curso aparte con una imagen en cada lección
curl -s -o /dev/null -b creador.txt -X POST $API/editor/cursos -H "$J" -d '{"titulo":"Borrar","descripcion":"Prueba"}'
BORRAR=$(idCurso 'Borrar')
for t in Una Dos; do curl -s -o /dev/null -b creador.txt -X POST $API/editor/cursos/$BORRAR/lecciones -H "$J" -d "{\"titulo\":\"$t\"}"; done
subir creador $BORRAR image/png $FIG/transparente.png
subir creador $BORRAR image/jpeg $FIG/foto-800x600.jpg
set -- $(psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT string_agg(id, ' ' ORDER BY subida_en) FROM imagen WHERE id_curso = '$BORRAR';")
teoria() { echo "{\"tipo\":\"teoria\",\"texto\":\"[imagen]\",\"imagenes\":[$(img $1)]}"; }
curl -s -o /dev/null -b creador.txt -X PUT $API/editor/cursos/$BORRAR/lecciones/$(idLeccion 'Borrar' 1) -H "$J" -d "{\"titulo\":\"Una\",\"version\":1,\"actividades\":[$(teoria $1)]}"
curl -s -o /dev/null -b creador.txt -X PUT $API/editor/cursos/$BORRAR/lecciones/$(idLeccion 'Borrar' 2) -H "$J" -d "{\"titulo\":\"Dos\",\"version\":1,\"actividades\":[$(teoria $2)]}"
bd <<< "SELECT count(*) FROM imagen WHERE id_curso = '$BORRAR';"                  # 2
curl -s -o /dev/null -w '%{http_code}\n' -b creador.txt -X DELETE $API/editor/cursos/$BORRAR/lecciones/$(idLeccion 'Borrar' 1)   # 204
bd <<< "SELECT count(*) FROM imagen WHERE id_curso = '$BORRAR';"                  # 1
curl -s -o /dev/null -w '%{http_code}\n' -b creador.txt -X DELETE $API/editor/cursos/$BORRAR                                     # 204
bd <<< "SELECT count(*) FROM imagen WHERE id_curso = '$BORRAR';"                  # 0
```

## 3. Criterios de la spec

### Cursos de prueba

| Criterio | Pasos | Esperado |
|---|---|---|
| [backend] Portada y lecciones 13 a 18 | B1 | Lo del comentario de B1 |
| [web, móvil] El prototipo sigue igual | Recorre "Tu primer commit" (Git esencial, 2) y "Hiragana: las vocales" (Japonés sencillo, 1); mira el catálogo | Las actividades como en F12, y los cuatro cursos con su portada generada |

### Subir imágenes (editor)

En el curso "Imágenes" (C1), como `creador@`, en la lección "Una", con una opción múltiple
de tipo "Imagen" salvo que se diga otra cosa.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Campo vacío | Mira una opción vacía | "Elegir imagen" y "JPEG, PNG o WebP de hasta 10 MB, o GIF de hasta 5 MB." |
| [web] Reducir | Elige `foto-4000x3000.jpg` | "Subiendo imagen…" y luego la imagen, "1600 × 1200 px · {peso}", "Cambiar", "Quitar" y "Texto alternativo" con su ayuda |
| [web] No agrandar | Elige `foto-800x600.jpg` | "800 × 600 px" |
| [web] Transparencia | Elige `transparente.png` y mira la vista previa en modo claro y oscuro | Alrededor del círculo se ve el fondo del mosaico |
| [web] Enderezar | Elige `de-lado.jpg` | "600 × 800 px" y la flecha apunta hacia arriba, en el campo y en la vista previa |
| [web] Sin ubicación | Elige `con-ubicacion.jpg`, guarda y baja la imagen: `curl -s -b creador.txt $API/imagenes/<id> \| grep -c 'Brote Cam'` (el id, en L2) | `0`; con el archivo original, `grep -c 'Brote Cam' $FIG/con-ubicacion.jpg` da `1` |
| [web] GIF tal cual | Elige `gif-2mb.gif` | El tamaño y el peso del archivo (compáralo con `ls -l`), y en la vista previa se mueve |
| [web] Pesados | Elige `grande-11mb.jpg`; luego `gif-6mb.gif` | "La imagen puede pesar hasta 10 MB." y "Un GIF puede pesar hasta 5 MB.". El campo sigue como estaba |
| [web] Formatos | Elige `dibujo.svg`, `foto.heic` y `texto.png` | Los dos primeros, "Elige una imagen JPEG, PNG, WebP o GIF."; el tercero, "No se pudo leer la imagen. Elige otra." |
| [web] Cambiar | Con una imagen, "Cambiar" y `grande-11mb.jpg`; luego "Cambiar" y `foto-800x600.jpg` | El error, con la imagen anterior; después, la nueva |
| [web] Quitar | "Quitar" | El campo vacío, sin preguntar, y "Cambios sin guardar" |
| [web] Esperar | En Chrome DevTools > Network, elige "Slow 4G" y sube `foto-4000x3000.jpg`; mientras sube, escribe en la pregunta. Vuelve a "No throttling" | "Guardar lección" y "Probar lección" deshabilitados con "Espera a que terminen de subir las imágenes.", y lo escrito se queda |
| [web] Texto alternativo | Pega 250 caracteres y un salto de línea; escribe "  Cuadrado  " y guarda; mira P2 de F12 | Se queda en 200, sin salto de línea; se guarda "Cuadrado" |
| [web] Incompleta | Deja una opción de imagen vacía y guarda | "Incompleta" en el bloque y "Elige una imagen." en el campo |
| [web] Sin servidor | Apaga la API (`kill` del pid de `:3000`) y elige una imagen | "No se pudo subir la imagen. Inténtalo de nuevo." y lo demás en pantalla. Vuelve a levantarla |
| [web] Sesión expirada | Con una imagen ya guardada en el campo, `./expirar creador@brote.test` (en `brote_specs`), escribe algo en la pregunta y elige otra imagen | "Entrar" con "Tu sesión terminó. Vuelve a entrar."; al entrar, la lección con lo escrito y el campo con la imagen anterior |
| [web] Recargar | Guarda y recarga | Las imágenes y sus textos alternativos siguen en sus campos |

### Teoría

En "Imágenes", una teoría en "Una" para el editor; en "Actividades de prueba", 13 (L1), para
cursar.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Agregar imagen | Escribe "Hola " y pulsa "Agregar imagen"; pon el cursor al final y otra vez | `Hola [imagen]` y el grupo "Imagen 1"; después, "Imagen 2" |
| [web] Menos marcas | Borra la segunda marca (sin imagen); sube una imagen a "Imagen 1" y borra la primera marca | El grupo 2 desaparece. Luego, "Hay más imágenes que marcas [imagen] en el texto. Quita las que sobran." y "Quitar imagen" en el grupo |
| [web] Cinco | Agrega hasta 5 marcas; escribe a mano una sexta y guarda | "Agregar imagen" se deshabilita en 5; al guardar, "El texto puede tener hasta 5 imágenes." |
| [web] Marcas que no cuentan | Escribe `[Imagen]` y `[ imagen ]`, guarda y prueba la lección | Ningún grupo nuevo, y al cursar se ven como texto |
| [web, móvil] Entre párrafos | Abre "Imágenes entre párrafos" | Primer párrafo, panorama, "Segundo párrafo, con una imagen chica", la imagen chica, "a la mitad.", el tercer párrafo y el punto clave |
| [web, móvil] Panorama | Míralo | Completo, a lo ancho, con las dos barras negras de los extremos, sin deformarse |
| [web, móvil] Imagen chica | Mírala | De 120 × 80 px, centrada |
| [web, móvil] Imagen alta | Abre "Solo una imagen alta" | Completa, y no pasa de la mitad del alto de la ventana o la pantalla |
| [web, móvil] Cinco imágenes | Abre "Cinco imágenes" | Las cinco figuras, cada una en su lugar |

### Opción múltiple

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Tipo "Imagen" | En "Imágenes", una opción múltiple: "Tipo de opciones"; elige "Imagen", sube dos; cambia a "Texto" y vuelve | "Texto", "Símbolo" e "Imagen"; campos de imagen; al volver, las dos imágenes siguen |
| [web] Repetida | Sube el mismo archivo en dos opciones y guarda | "Esta imagen está repetida." |
| [web, móvil] Imagen de la pregunta | "Actividades de prueba", 14, primera | El círculo rojo debajo de la pregunta y las tres opciones de texto |
| [web, móvil] Mosaicos | La segunda; en el móvil y en Chrome a 360 px de ancho (DevTools) | Cuatro mosaicos cuadrados iguales, con la figura completa; al menos dos por fila |
| [web, móvil] Fallar | Elige el círculo y comprueba | El círculo incorrecto y el cuadrado correcto, con su icono; "Respuesta correcta:", la miniatura del cuadrado y "Cuadrado azul" |
| [web, móvil] Sin texto alternativo | La tercera; elige el círculo y comprueba | "Respuesta correcta:" y solo la miniatura del triángulo |
| [web] Teclas | En la segunda, pulsa 1 a 4 | Cada número elige el mosaico de ese lugar, y cada mosaico muestra su número |

### Emparejar, clasificar y ordenar

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Columnas | En "Imágenes", un emparejar: "Columna izquierda" en "Imagen" | Las dos columnas con "Texto" e "Imagen"; cada pareja, imagen a la izquierda y texto a la derecha |
| [web] Tipo de elementos | Un clasificar y un ordenar: "Tipo de elementos" en "Imagen", sube algo y vuelve a "Texto" e "Imagen" | Lo escrito y las imágenes siguen |
| [web] Repetidas | El mismo archivo dos veces a la izquierda; luego en las dos columnas; y dos veces en el ordenar | "Esta imagen está repetida." en la misma columna y en el ordenar; en las dos columnas, se guarda |
| [web, móvil] Figuras y nombres | "Actividades de prueba", 15, primero | Figuras a la izquierda y nombres mezclados a la derecha, lado a lado también en el iPhone |
| [web, móvil] Pareja y fallo | Une el círculo con "Cuadrado" y lo demás bien; comprueba | El número de la pareja en la esquina del mosaico y en el texto; la barra: miniatura del círculo, su texto alternativo, "→" y "Círculo" |
| [web, móvil] Imagen con imagen | El segundo; une mal una pareja y comprueba | La barra muestra las dos miniaturas de la pareja fallada |
| [web, móvil] Clasificar | El tercero: coloca uno pulsando y otro arrastrando, pon el círculo en "Tiene esquinas" y comprueba | Los mosaicos se colocan; la barra: miniatura del círculo, "→" y "No tiene esquinas" |
| [web, móvil] Ordenar | El cuarto: llena los lugares en otro orden y comprueba | Cada lugar recibe un mosaico; la barra, "1." a "4." con las miniaturas en orden |
| [móvil] Arrastrar | En el clasificar, mantén pulsado un mosaico y arrástralo; luego desliza sin mantener | La copia lleva la imagen; deslizar sin mantener desplaza la pantalla |

### Portada

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Elegir | En el mapa de "Imágenes": "Portada", sube `foto-800x600.jpg` | Antes, la generada y "Elegir imagen"; después, la vista 16:9 y la cuadrada, y "Guardar cambios" habilitado |
| [web] Guardar | Guarda; recarga; mira "Cursos que creé"; envíalo a revisión y abre su mapa | "Cambios guardados"; la portada en las tres pantallas. Retíralo de revisión |
| [web] GIF | Elige `gif-2mb.gif` como portada | "La portada puede ser JPEG, PNG o WebP." |
| [web] Quitar | "Quitar" y "Guardar cambios" | La generada en el mapa y en "Cursos que creé" |
| [web] Catálogo y detalle | L1; en el catálogo busca "Actividades de prueba" y abre su detalle | Tarjeta 16:9 con las tres franjas; detalle cuadrado sin la roja ni la azul |
| [móvil] Catálogo y detalle | Lo mismo en el iPhone | Cuadrada y recortada al centro en los dos |
| [web, móvil] Sigue aprendiendo y Mis cursos | Completa la lección 1 de "Actividades de prueba" como `creador@`; abre "Mi panel" (web) y "Mis cursos" (móvil) | La tarjeta con la portada |
| [web, móvil] Portada que no carga | `curl -X POST localhost:3001/__modo/bloquear`; recarga el catálogo (web: con la caché desactivada en DevTools; móvil: cierra y abre la app) | La portada generada. Vuelve a `normal` |

### GIF

En "Actividades de prueba", 16.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Se mueve | Abre la teoría | El GIF se mueve y tiene "Pausar" en su esquina |
| [web, móvil] Pausar y reanudar | "Pausar"; espera; "Reanudar" | Se queda en ese cuadro y el botón dice "Reanudar"; sigue desde ahí |
| [web, móvil] Reducir movimiento | Activa "reducir movimiento" y vuelve a abrir la lección | Quieto en su primer cuadro, con "Reanudar". Desactívalo |
| [web, móvil] Pausa en un mosaico | En la opción múltiple, pulsa la pausa del GIF; sal con la X sin hacer más (abre la lección de nuevo y pausa solo en la primera actividad) | No elige la opción; en la primera actividad, salir no pregunta |
| [web, móvil] Miniatura quieta | Elige el círculo quieto y comprueba | La miniatura del GIF en la barra no se mueve |

### Ampliar

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Abrir | En 13, toca el panorama | Sobre la lección, fondo oscuro, completo y tan grande como cabe, con "Cerrar" |
| [web] Cerrar y foco | Ciérralo con "Cerrar", Esc y pulsando el fondo; ábrelo y pulsa Tab varias veces | Los tres cierran y el foco vuelve a la imagen; con Tab, el foco no sale del visor |
| [móvil] Pellizcar | Pellizca para acercar, mueve con un dedo, "Cerrar" | Se acerca y se mueve; al cerrar, la lección como estaba |
| [web, móvil] Pregunta y mosaicos | En 14, toca la imagen de la primera; en la segunda, toca un mosaico | La imagen se amplía; el mosaico se elige sin visor |
| [web, móvil] No cuenta | Abre la lección 13, amplía y cierra el panorama, y sal con la X | Sale sin preguntar |

### Carga y errores al cursar

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Lugar reservado | `__modo/retrasar`; abre 13 (web: caché desactivada) | Durante 4 s, el lugar del panorama con su tamaño y fondo suave; el texto de abajo no salta. Vuelve a `normal` |
| [web, móvil] No cargó | `__modo/bloquear`; abre 13 (web: caché desactivada; móvil: cierra la app antes) | El icono de imagen rota y "Panorama con un círculo…"; la imagen chica, "No se pudo cargar la imagen" |
| [web, móvil] Mosaico sin cargar | Con `bloquear`, abre 14 y ve a la segunda | Cada mosaico con su texto alternativo; se puede elegir y comprobar |
| [móvil] Reintento al volver la conexión | Con `bloquear`, abre 14; pasa a `normal`; activa y desactiva el modo avión | Las imágenes aparecen solas |
| [web] Reintento al cambiar de actividad | Con `bloquear` y la caché desactivada, abre 14; pasa a `normal`; continúa a la segunda | Sus mosaicos se ven |
| [web, móvil] Precarga | Abre 15, espera 5 s en la primera y apaga la API (en el móvil, modo avión); recorre las demás | Las imágenes de las siguientes se ven, y la lección se termina como en F03. Levántala otra vez |

### Accesibilidad y teclado

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Imagen con lector | VoiceOver en 14, primera, sobre la imagen | "Círculo rojo" y que se puede ampliar |
| [web, móvil] Mosaico con lector | En la segunda y la tercera, sobre un mosaico; elígelo | "Cuadrado azul" y su estado; en la tercera, "Imagen 1" y su estado |
| [web, móvil] Botón de pausa con lector | En 16, sobre el botón | "Pausar animación"; después de pulsarlo, "Reanudar animación" |
| [web] Tab | En 13 y 16, recorre con Tab y pulsa Enter y la barra espaciadora | Foco visible en cada imagen y botón de pausa; abren el visor o pausan |
| [web, móvil] Modos | Repite 13, 14 y 16 en modo oscuro y con "reducir transparencia" | Todo se ve y se lee bien |

### Límites del curso y servidor

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Curso lleno | En "Casi lleno" (C2), en la teoría de "Una", agrega otra marca y elige `gif-2mb.gif` | "Este curso ya tiene 200 MB de imágenes. Quita alguna y guarda para hacer espacio." |
| [web] Hacer espacio | Quita `gif-5mb-1.gif` y su marca de la teoría, guarda y vuelve a elegir `gif-2mb.gif` en la otra marca | Se sube |
| [web] Lección pesada | En "Imágenes", "Pesada": una teoría con 5 marcas y una opción múltiple con imagen de pregunta, con `gif-5mb-1` a `gif-5mb-6`; "Guardar lección" y "Probar lección"; quita dos y guarda | El aviso "Las imágenes de esta lección pesan más de 25 MB. Quita alguna." en los dos; después, "Lección guardada" |
| [web] Repetida cuenta una vez | En "Pesada", usa `gif-5mb-1` en dos actividades | El peso de la lección sube 4.9 MB una sola vez |
| [web] Peso de la lección | En "Pesada", mira junto a "Guardar lección"; quita una imagen; abre "Una" sin imágenes | "Imágenes de esta lección: {x} de 25 MB", que baja al quitar; en rojo con icono si pasa de 25; en "Una", no aparece |
| [web] Peso del curso | Abre el mapa de "Imágenes" y de "Casi lleno"; en "Casi lleno" quita la imagen, guarda y vuelve al mapa | "Imágenes del curso: {x} de 200 MB"; cerca de 200 y luego menos |
| [backend] Un día | B7 | `0` |
| [backend] Eliminar | B8 | Sin imágenes de esa lección, y luego ninguna del curso |
| [backend] Mismo archivo | B2 | `201` y `200` con el mismo id; `count` 1 |
| [backend] Rechazos al subir | B3 | Cada estado y mensaje del comentario |
| [backend] Rechazos al guardar | B5; luego P2 de F12 | Cada uno `400`, y la lección sin cambios |
| [backend] Portada | B6 | `400` con `campos.portada` |
| [backend] Quién trae | B4 | `200`, `404`, `401` y, publicado, `200` |
| [web] Imagen que ya no está | En "Imágenes", "Una" en dos pestañas con la misma imagen; en la primera quítala y guarda; en la segunda cambia algo, guarda y elige "Reemplazar" | "Revisa los datos marcados." y el campo con "Esta imagen ya no está. Elige otra." |

### Contenido

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Etiquetas | En 18, elige la primera y comprueba; luego con `__modo/bloquear`, ábrela otra vez | `<script>alert(1)</script>` en la barra y `<b>hola</b>`, `<script>…` en los mosaicos rotos, como texto |
| [web, móvil] Al límite | En 17, en el iPhone y en Chrome a 360 px | Los 9 mosaicos, las 8 parejas, los 12 elementos y los 10 lugares completos, desplazando, sin cortar ni encimar |
| [web] Vista previa y prueba | En el editor de "Actividades de prueba" (antes de L1), selecciona las actividades de 15 y 16; "Probar lección" en 15 | La vista previa con imágenes, GIF con pausa y visor; la prueba recorre la lección |

## 4. Antes del PR

- `npm run tipos` y `npm run lint` en los tres repos de código, y `npm run build` en la web.
- `npm run contrato:revisar` en `brote_specs`.
- `npm run bd:sembrar` deja la base como al principio. Retira "Actividades de prueba" (L1),
  y vuelve a apuntar la web y el móvil a `:3000` (quita `VITE_URL_API` y corrige `.env`).
- Repite de F03 "Opción múltiple" y "Teoría", y de F11 emparejar y clasificar con la
  respuesta larga en la barra: F13 cambia `OpcionRespuesta`, `ElementoRespuesta`,
  `LugarElemento` y `BarraRespuesta`.
- Repite de F02 el catálogo y de F04 "Mi panel": `PortadaCurso` cambió.
- Repite de F05 guardar y "Esta lección cambió en otro lugar": `useEditorLeccion` cambió.
- Marca los criterios en `spec.md` y enlista en cada PR los que cubre.
